const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const pino   = require('pino');
const path   = require('path');
const fs     = require('fs-extra');
const config = require('../config');
const logger = require('./Logger');
const { handleMessage }  = require('./EventHandler');
const { init: initDb }   = require('./Database');
const { getSession }     = require('./SessionStore');

// ─── Short-code vs legacy base64 ─────────────────────────────────────────────
function isShortCode(id) {
  return id && id.startsWith('VENOM_') && id.length === 14;
}

async function restoreSessionFromId(sessionId, sessionDir) {
  if (!sessionId) return false;
  try {
    let credsJson;
    if (isShortCode(sessionId)) {
      logger.info(`🔑 Short session code detected: ${sessionId}`);
      if (!process.env.REPLIT_DB_URL) {
        logger.error('❌ SESSION_ID is a short code but REPLIT_DB_URL is not set!\n   Copy REPLIT_DB_URL from Replit → Render → Environment Variables.');
        return false;
      }
      const raw = await getSession(sessionId);
      if (!raw) {
        logger.error(`❌ No session found for ${sessionId}. Re-pair and get a new code.`);
        return false;
      }
      credsJson = raw;
    } else if (sessionId.startsWith('VENOM_')) {
      logger.info('🔑 Legacy base64 SESSION_ID detected');
      credsJson = Buffer.from(sessionId.slice(6), 'base64').toString('utf8');
    } else {
      logger.error('❌ SESSION_ID format not recognised.');
      return false;
    }
    JSON.parse(credsJson);
    fs.ensureDirSync(sessionDir);
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), credsJson);
    logger.info('✅ Session restored from SESSION_ID');
    return true;
  } catch (err) {
    logger.error(`Failed to restore session: ${err.message}`);
    return false;
  }
}

async function connect() {
  initDb();
  const sessionDir = path.join(__dirname, '..', config.sessionName);
  fs.ensureDirSync(sessionDir);

  const envSessionId = process.env.SESSION_ID;
  if (envSessionId && !fs.existsSync(path.join(sessionDir, 'creds.json'))) {
    await restoreSessionFromId(envSessionId, sessionDir);
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();
  logger.info(`🐍 Starting Venom MD v${config.version} — Baileys v${version.join('.')}`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser:                        ['Venom MD', 'Chrome', config.version],
    markOnlineOnConnect:            !global.ghostMode,
    generateHighQualityLinkPreview: true,
    syncFullHistory:                false,
    keepAliveIntervalMs:            30_000,
    retryRequestDelayMs:            350,
    // Required so Baileys can retry decryption of group messages whose
    // senderKey session was not yet established (Bad MAC / @lid participants)
    getMessage: async (key) => {
      if (global.msgCache) {
        const cached = global.msgCache.get(key.id);
        if (cached?.message) return cached.message;
      }
      return { conversation: '' };
    },
  });

  sock.ev.on('creds.update', saveCreds);

  // ─── Connection state ────────────────────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      logger.warn('⚠️  No session. Visit the pairing page to get a SESSION_ID, then restart.');
    }
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = code !== DisconnectReason.loggedOut;
      logger.warn(`Connection closed (code ${code}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(connect, 5000);
      } else {
        logger.error('Logged out! Re-pair and update SESSION_ID.');
        process.exit(1);
      }
    }
    if (connection === 'open') {
      logger.info('✅ Venom MD connected to WhatsApp!');
      try {
        await sock.sendMessage(config.ownerJid, {
          text:
            `╔══════════════════════╗\n` +
            `║   *🐍 VENOM MD ONLINE*   ║\n` +
            `╚══════════════════════╝\n\n` +
            `*Bot:* ${config.botName}\n*Version:* v${config.version}\n` +
            `*Mode:* ${config.mode}\n*Prefix:* ${config.prefix}\n\n` +
            `_Venom MD is up and running! 🔥_`,
        });
      } catch {}
    }
  });

  // ─── Messages ────────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    logger.info(`[UPSERT] type=${type} count=${messages.length}`);
    if (type !== 'notify') return;
    for (const msg of messages) {
      const from = msg.key?.remoteJid || '?';
      const isGroup = from.endsWith('@g.us');
      const participant = msg.key?.participant || '(no participant)';
      const fromMe = msg.key?.fromMe;
      const msgKeys = Object.keys(msg.message || {});
      logger.info(`[MSG] from=${from} group=${isGroup} fromMe=${fromMe} participant=${participant} keys=${msgKeys.join(',')}`);

      if (!msg.message) {
        logger.info(`[SKIP] no msg.message`);
        continue;
      }
      const isProtocol = msgKeys.every(k =>
        ['messageContextInfo','senderKeyDistributionMessage','protocolMessage'].includes(k)
      );
      if (isProtocol) {
        logger.info(`[SKIP] protocol message`);
        continue;
      }
      try { await handleMessage(sock, msg); }
      catch (err) { logger.error(`Message handler error: ${err.message}\n${err.stack}`); }
    }
  });

  // ─── Retry handler: re-processes messages after senderKey is established ──
  // This fires when Baileys retries a message that previously failed to decrypt
  // (Bad MAC / @lid group participants). Without this, retried messages are lost.
  sock.ev.on('messages.update', async (updates) => {
    for (const { key, update } of updates) {
      if (update.message) {
        // Build a minimal message object and route it through handleMessage
        try {
          const retryMsg = { key, message: update.message };
          await handleMessage(sock, retryMsg);
        } catch {}
      }
    }
  });

  // ─── Anti-delete: resend messages that get deleted ────────────────────────
  sock.ev.on('messages.delete', async (item) => {
    try {
      const { Settings } = require('./Database');
      const keys = 'keys' in item ? item.keys : [item];
      for (const key of keys) {
        const groupId = key.remoteJid;
        if (!Settings.getGroupKey(groupId, 'antidelete')) continue;
        const cached = global.msgCache?.get(key.id);
        if (!cached || !cached.message) continue;
        // Resend to same group
        const msgContent = cached.message;
        const msgType    = Object.keys(msgContent).find(k => !['messageContextInfo','senderKeyDistributionMessage'].includes(k));
        if (!msgType) continue;

        const sender = key.participant || key.remoteJid;
        const header = `🗑️ *Deleted Message*\n👤 From: @${sender?.split('@')[0] || '?'}\n\n`;

        if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
          const text = msgContent.conversation || msgContent.extendedTextMessage?.text || '';
          await sock.sendMessage(groupId, { text: `${header}${text}` });
        } else if (msgType === 'imageMessage') {
          try {
            const { downloadMedia } = require('../lib/serialize');
            const buf = await downloadMedia(msgContent[msgType], 'image');
            await sock.sendMessage(groupId, { image: buf, caption: `${header}${msgContent[msgType]?.caption || ''}` });
          } catch {}
        } else if (msgType === 'videoMessage') {
          try {
            const { downloadMedia } = require('../lib/serialize');
            const buf = await downloadMedia(msgContent[msgType], 'video');
            await sock.sendMessage(groupId, { video: buf, caption: `${header}${msgContent[msgType]?.caption || ''}`, mimetype: 'video/mp4' });
          } catch {}
        } else if (msgType === 'audioMessage') {
          await sock.sendMessage(groupId, { text: `${header}_[Audio message was deleted]_` });
        } else {
          await sock.sendMessage(groupId, { text: `${header}_[${msgType.replace('Message','')} was deleted]_` });
        }
      }
    } catch (err) {
      logger.error(`Anti-delete handler: ${err.message}`);
    }
  });

  // ─── Group events ────────────────────────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    try {
      const { Settings } = require('./Database');
      const meta = await sock.groupMetadata(id).catch(() => null);
      if (!meta) return;
      if (action === 'add' && Settings.getGroupKey(id, 'welcome')) {
        for (const p of participants) {
          await sock.sendMessage(id, {
            text:
              `╔══════════════════════╗\n║    *👋 WELCOME!*    ║\n╚══════════════════════╝\n\n` +
              `@${p.split('@')[0]} just joined *${meta.subject}*!\n\n_Welcome! 🐍_`,
            mentions: [p],
          });
        }
      }
      if (action === 'remove' && Settings.getGroupKey(id, 'goodbye')) {
        for (const p of participants) {
          await sock.sendMessage(id, {
            text: `👋 @${p.split('@')[0]} has left *${meta.subject}*\n_Goodbye!_`,
            mentions: [p],
          });
        }
      }
    } catch (err) {
      logger.error(`group-participants.update: ${err.message}`);
    }
  });

  // ─── Anti-call ───────────────────────────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    try {
      const { Settings } = require('./Database');
      if (!Settings.getGlobal('anticall')) return;
      for (const call of calls) {
        if (call.status === 'offer') {
          await sock.rejectCall(call.id, call.from);
          await sock.sendMessage(call.from, { text: `❌ *Calls are disabled on this bot.*` });
        }
      }
    } catch (err) {
      logger.error(`call handler: ${err.message}`);
    }
  });

  return sock;
}

module.exports = { connect };
