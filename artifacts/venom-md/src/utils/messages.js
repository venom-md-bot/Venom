const config = require('../../config');

async function reply(sock, jid, text, msg) {
  return sock.sendMessage(jid, { text }, { quoted: msg });
}

async function react(sock, jid, msg, emoji) {
  return sock.sendMessage(jid, { react: { text: emoji, key: msg.key } });
}

async function sendImage(sock, jid, buffer, caption = '', msg = null) {
  const opts = { image: buffer, caption };
  return msg
    ? sock.sendMessage(jid, opts, { quoted: msg })
    : sock.sendMessage(jid, opts);
}

async function sendVideo(sock, jid, buffer, caption = '', msg = null) {
  const opts = { video: buffer, caption };
  return msg
    ? sock.sendMessage(jid, opts, { quoted: msg })
    : sock.sendMessage(jid, opts);
}

async function sendAudio(sock, jid, buffer, msg = null) {
  const opts = { audio: buffer, mimetype: 'audio/mp4' };
  return msg
    ? sock.sendMessage(jid, opts, { quoted: msg })
    : sock.sendMessage(jid, opts);
}

async function sendSticker(sock, jid, buffer, msg = null) {
  const opts = { sticker: buffer };
  return msg
    ? sock.sendMessage(jid, opts, { quoted: msg })
    : sock.sendMessage(jid, opts);
}

async function sendDoc(sock, jid, buffer, filename, mimetype, msg = null) {
  const opts = { document: buffer, filename, mimetype };
  return msg
    ? sock.sendMessage(jid, opts, { quoted: msg })
    : sock.sendMessage(jid, opts);
}

async function sendTyping(sock, jid, duration = 2000) {
  await sock.sendPresenceUpdate('composing', jid);
  return new Promise(resolve => setTimeout(() => {
    sock.sendPresenceUpdate('paused', jid);
    resolve();
  }, duration));
}

async function errorReply(sock, jid, msg, errMsg = 'An error occurred. Please try again.') {
  return reply(sock, jid, `❌ *Error:* ${errMsg}`, msg);
}

async function usageReply(sock, jid, msg, usage) {
  return reply(sock, jid, `❓ *Usage:* ${config.prefix}${usage}`, msg);
}

module.exports = {
  reply, react, sendImage, sendVideo, sendAudio,
  sendSticker, sendDoc, sendTyping, errorReply, usageReply,
};
