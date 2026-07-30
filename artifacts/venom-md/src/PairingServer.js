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

      // Always wipe the session dir at the start of a fresh pairing attempt so
      // stale credentials from a previous failed attempt never interfere.
      cleanup(sessionDir);
      fs.ensureDirSync(sessionDir);

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
            browser:            Browsers.ubuntu('Chrome'),
            printQRInTerminal:  false,
            // Keep the connection alive while the user is typing the code on
            // their phone — without this, Render's idle timeout can drop the
            // socket in the middle of the handshake → "couldn't link device".
            keepAliveIntervalMs: 15_000,
          });

          pairSock.ev.on('creds.update', saveCreds);

          if (!codeSent && !pairSock.authState.creds.registered) {
            // Use 5 s on first attempt (Render cold-start can be slow).
            // Bail immediately if dead or already sent on a previous socket.
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
            }, 5000);
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

              const credsJson = fs.readFileSync(credsPath, 'utf8');
              // base64url: no +/=/  chars — safe to copy from web UI and paste
              // into Render env vars without corruption.
              const sessionId = 'VENOM_' + Buffer.from(credsJson).toString('base64url');

              logger.info(`✅ Session ID generated for ${raw}`);

              // Send to WhatsApp as a backup — user should still use the web UI
              // copy button, but this gives them a second copy just in case.
              try {
                const jid = `${raw}@s.whatsapp.net`;
                await pairSock.sendMessage(jid, {
                  text: `Your Venom MD Session ID:\n\n${sessionId}\n\n⚠️ Copy it from the pairing page, NOT from here.`,
                });
              } catch (sendErr) {
                logger.warn(`Could not DM session ID: ${sendErr.message}`);
              }

              socket.emit('session-ready', { sessionId });

              dead = true;
              setTimeout(() => cleanup(sessionDir), 60_000);
              try { pairSock.end(); } catch {}
            }

            if (connection === 'close') {
              const statusCode = lastDisconnect?.error?.output?.statusCode;

              // ── KEY FIX ──────────────────────────────────────────────────────
              // Once the code has been sent (user is entering it on their phone)
              // or once we've successfully connected, NEVER reconnect.
              // Reconnecting creates a brand-new session — WhatsApp is still
              // trying to handshake with the OLD session → "couldn't link device".
              if (codeSent || connected) {
                if (!connected) {
                  socket.emit('error', {
                    message: 'Connection dropped while waiting for code entry. Please refresh and try again.',
                  });
                  dead = true;
                  cleanup(sessionDir);
                }
                return;
              }

              // Only reconnect if we haven't shown the code yet (pre-code
              // network blip on Render cold start, for example).
              if (statusCode === DisconnectReason.loggedOut) {
                socket.emit('error', { message: 'WhatsApp rejected the connection. Try again.' });
                dead = true;
                cleanup(sessionDir);
              } else {
                logger.info(`Pairing socket closed (code ${statusCode}) before code was sent — reconnecting…`);
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
