const { downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');
const config = require('../config');

async function downloadMedia(msg, type) {
  const stream = await downloadContentFromMessage(msg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/**
 * Unwrap nested Baileys message wrappers so we always work with the real
 * inner message object.
 */
function unwrapMessage(rawMessage) {
  let inner = rawMessage;
  if (!inner) return null;

  const wrappers = [
    'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension',
    'ephemeralMessage', 'documentWithCaptionMessage',
    'editedMessage', 'messageEdit', 'futureProofMessage', 'botInvokeMessage',
    // FIX 1: deviceSentMessage wraps commands sent from the owner's secondary/linked device.
    // Without this, body is always empty for those messages → isCmd=false → silent drop.
    'deviceSentMessage',
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (const w of wrappers) {
      if (inner[w]?.message) { inner = inner[w].message; changed = true; break; }
    }
  }
  return inner;
}

function extractBody(message) {
  if (!message) return '';
  const inner = unwrapMessage(message);
  if (!inner) return '';

  return (
    inner.conversation                                                        ||
    inner.extendedTextMessage?.text                                           ||
    inner.imageMessage?.caption                                               ||
    inner.videoMessage?.caption                                               ||
    inner.documentMessage?.caption                                            ||
    inner.audioMessage?.caption                                               ||
    inner.stickerMessage?.caption                                             ||
    inner.buttonsResponseMessage?.selectedButtonId                            ||
    inner.listResponseMessage?.singleSelectReply?.selectedRowId              ||
    inner.templateButtonReplyMessage?.selectedId                             ||
    ''
  );
}

function getMessageType(message) {
  if (!message) return null;
  // FIX 1 (cont.): deviceSentMessage is now unwrapped before this call, so
  // we no longer need it in the skip set. Keeping only true protocol noise.
  const skip = new Set(['senderKeyDistributionMessage', 'messageContextInfo']);
  return Object.keys(message).find(k => !skip.has(k)) || null;
}

function serialize(sock, msg) {
  if (!msg.message) return msg;

  // FIX 1 (cont.): unwrap first so getMessageType sees the real inner type,
  // not the outer deviceSentMessage (or other wrapper) envelope.
  const unwrapped = unwrapMessage(msg.message);
  const mtype = getMessageType(unwrapped);
  const body  = extractBody(msg.message);

  const from    = msg.key.remoteJid;
  const isGroup = from?.endsWith('@g.us') || false;

  // When fromMe=true in a DM, msg.key.remoteJid is the RECIPIENT, not the owner.
  // We must use sock.user.id (the bot's own JID = owner's number) as the sender.
  let sender;
  if (isGroup) {
    sender = jidNormalizedUser(msg.key.participant || '');
  } else if (msg.key.fromMe) {
    sender = jidNormalizedUser(sock.user?.id || from || '');
  } else {
    sender = jidNormalizedUser(from || '');
  }

  const pushName = msg.pushName || 'User';

  const prefix  = config.prefix;
  const isCmd   = typeof body === 'string' && body.startsWith(prefix);
  const command = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
  const args    = isCmd ? body.trim().split(/\s+/).slice(1) : [];
  const text    = args.join(' ');
  const q       = text;

  // FIX 2: Extract contextInfo from whichever inner message type actually carries it.
  // Previously only extendedTextMessage was checked, so replies on image/video/audio
  // captions and plain text messages never populated `quoted`.
  const ctxInfo =
    unwrapped?.extendedTextMessage?.contextInfo ||
    unwrapped?.imageMessage?.contextInfo ||
    unwrapped?.videoMessage?.contextInfo ||
    unwrapped?.audioMessage?.contextInfo ||
    unwrapped?.documentMessage?.contextInfo ||
    unwrapped?.stickerMessage?.contextInfo ||
    null;

  const quoted  = ctxInfo?.quotedMessage
    ? {
        ...ctxInfo.quotedMessage,
        mtype: Object.keys(ctxInfo.quotedMessage)[0],
        sender: jidNormalizedUser(ctxInfo.participant || ''),
        download: () => {
          const qmtype = Object.keys(ctxInfo.quotedMessage)[0];
          return downloadMedia(ctxInfo.quotedMessage[qmtype], qmtype.replace('Message', ''));
        },
      }
    : null;

  const mentionedJid = ctxInfo?.mentionedJid || [];

  const download = () => {
    const mt = mtype?.replace('Message', '') || '';
    return downloadMedia(msg.message[mtype], mt);
  };

  return Object.assign(msg, {
    mtype, body, from, isGroup, sender, pushName,
    prefix, isCmd, command, args, text, q,
    quoted, mentionedJid, download,
    reply: (content, options = {}) => {
      if (typeof content === 'string') {
        return sock.sendMessage(from, { text: content, ...options }, { quoted: msg });
      }
      return sock.sendMessage(from, { ...content, ...options }, { quoted: msg });
    },
    react: (emoji) => sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
  });
}

module.exports = { serialize, downloadMedia };
