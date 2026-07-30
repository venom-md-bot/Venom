/**
 * Venom MD — Web Pairing Server
 *
 * Serves the pairing UI at /pair and handles session generation via Socket.io.
 * After pairing, stores the full session in Replit KV DB and gives the user
 * a short code like VENOM_X4R9KP2M instead of a 2000-char base64 string.
 */

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const fs         = require('fs-extra');
const pino       = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
  Browsers,
} = require('@whiskeysockets/baileys');

const config  = require('../config');
const logger  = require('./Logger');
// SessionStore not needed — Session ID is the raw base64 string, no KV lookup required

// ─── Start pairing web server ─────────────────────────────────────────────────
function startPairingServer() {
  const app    = express();
  const server = http.createServer(app);
  const io     = new Server(server, {
    cors: { origin: '*' },
    pingTimeout: 120000,
    pingInterval: 25000,
  });

  app.use(express.json());

  app.get('/',       (req, res) => res.sendFile(path.join(__dirname, '../web/index.html')));
  app.get('/pair',   (req, res) => res.sendFile(path.join(__dirname, '../web/index.html')));
  app.get('/health', (req, res) => res.json({ status: 'ok', bot: config.botName, version: config.version }));

  // ─── Socket.io — one Baileys session per browser connection ──────────────
  io.on('connection', (socket) => {
    logger.info(`Pairing UI connected: ${socket.id}`);
    let pairSock = null;

    socket.on('request-pair', async ({ number }) => {
      const raw = String(number).replace(/[^0-9]/g, '');
      if (!raw || raw.length < 7) {
        return socket.emit('error', { message: 'Enter your number with country code (no + or spaces).' });
      }

      const sessionDir = path.join(__dirname, '../sessions', `pair_${socket.id}`);
      fs.ensureDirSync(sessionDir);

      let codeSent  = false;
      let connected = false;
      let dead      = false;

      async function createPairSocket() {
        if (dead) return;

        try {
          const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
          const { version }          = await fetchLatestBaileysVersion();

          pairSock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            auth: {
              creds: state.creds,
              keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
            },
            browser:           Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
          });

          pairSock.ev.on('creds.update', saveCreds);

          if (!codeSent && !pairSock.authState.creds.registered) {
            setTimeout(async () => {
              if (dead || codeSent) return;
              codeSent = true;
              try {
                const code      = await pairSock.requestPairingCode(raw);
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code;
                socket.emit('pairing-code', { code: formatted });
                socket.emit('status', { message: 'Enter the code in WhatsApp → Linked Devices → Link with phone number' });
              } catch (err) {
                socket.emit('error', { message: `Could not get pairing code: ${err.message}` });
                dead = true;
                cleanup(sessionDir);
              }
            }, 3000);
          }

          pairSock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'open') {
              connected = true;
              socket.emit('status', { message: 'Phone linked! Generating your Session ID…' });

              // Wait for creds.json to be fully written
              await new Promise(r => setTimeout(r, 4000));

              const credsPath = path.join(sessionDir, 'creds.json');
              if (!fs.existsSync(credsPath)) {
                socket.emit('error', { message: 'Session linked but creds not saved. Please try again.' });
                dead = true;
                cleanup(sessionDir);
                return;
              }

              const credsJson  = fs.readFileSync(credsPath, 'utf8');
              // Use base64url (no +, /, = chars) so the string never breaks
              // when copied from WhatsApp or pasted into Render env vars.
              const sessionId  = 'VENOM_' + Buffer.from(credsJson).toString('base64url');

              logger.info(`✅ Session ID generated for ${raw}`);

              // ── Send raw Session ID to user's WhatsApp ────────────────────────
              // Send ONLY the raw VENOM_eyJ... string — no formatting, no extra
              // text — so the user can tap once to copy the whole string.
              try {
                const jid = `${raw}@s.whatsapp.net`;
                await pairSock.sendMessage(jid, { text: sessionId });
                socket.emit('session-ready', {
                  sessionId,
                  instructions: `✅ Session ID sent to your WhatsApp! Set SESSION_ID to that value on Render.`,
                });
              } catch (sendErr) {
                logger.error(`Could not DM session ID: ${sendErr.message}`);
                // Fallback: show on web UI
                socket.emit('session-ready', {
                  sessionId,
                  instructions: `Copy this Session ID and set SESSION_ID on Render.`,
                });
              }

              dead = true;
              setTimeout(() => cleanup(sessionDir), 30000);
              try { pairSock.end(); } catch {}
            }

            if (connection === 'close') {
              const statusCode = lastDisconnect?.error?.output?.statusCode;
              if (statusCode === DisconnectReason.loggedOut || connected) {
                if (!connected) {
                  socket.emit('error', { message: 'WhatsApp rejected the link. Make sure you entered the code in time.' });
                  dead = true;
                  cleanup(sessionDir);
                }
              } else {
                logger.info(`Pairing socket closed (code ${statusCode}), reconnecting…`);
                setTimeout(createPairSocket, 2000);
              }
            }
          });

        } catch (err) {
          logger.error(`Pairing error: ${err.message}`);
          socket.emit('error', { message: `Server error: ${err.message}` });
          dead = true;
          cleanup(sessionDir);
        }
      }

      socket.on('disconnect', () => {
        dead = true;
        try { if (pairSock) pairSock.end(); } catch {}
        setTimeout(() => cleanup(sessionDir), 5000);
      });

      await createPairSocket();
    });

    function cleanup(dir) {
      try { fs.removeSync(dir); } catch {}
    }
  });

  const port = config.port || 3000;
  server.listen(port, () => {
    logger.info(`🌐 Pairing server running on port ${port}`);
  });

  return server;
}

module.exports = { startPairingServer };
