const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

// Unwrap view-once wrappers to get real inner message + type
function unwrapViewOnce(quotedMsg) {
  if (!quotedMsg) return null;
  const wrappers = [
    'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension',
  ];
  for (const w of wrappers) {
    const inner = quotedMsg[w]?.message;
    if (inner) return inner;
  }
  return null;
}

async function downloadFromMsg(msgObj) {
  const skip = new Set(['messageContextInfo', 'senderKeyDistributionMessage']);
  const mediaType = Object.keys(msgObj).find(k => !skip.has(k) && msgObj[k]?.url);
  if (!mediaType) return null;
  const type = mediaType.replace('Message', '');
  const stream = await downloadContentFromMessage(msgObj[mediaType], type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return { buffer: Buffer.concat(chunks), mediaType, type };
}

module.exports = {
  name: ['vv', 'viewonce', 'vo', 'antiviewonce'],
  category: 'media',
  description: 'Open and resend a view-once message',
  usage: 'vv (reply to a view-once message)',
  async execute({ sock, msg, from, config }) {
    const quoted = msg.quoted;
    if (!quoted) {
      return msg.reply(`❓ *Usage:* Reply to a view-once message with ${config.prefix}vv`);
    }

    // Try unwrapping view-once wrappers
    const inner = unwrapViewOnce(quoted) || quoted;

    const result = await downloadFromMsg(inner).catch(() => null);
    if (!result) {
      return msg.reply(`❌ Couldn't download that message. It may have already expired or isn't a view-once media.`);
    }

    const { buffer, mediaType } = result;

    if (mediaType === 'imageMessage') {
      await sock.sendMessage(from, {
        image: buffer,
        caption: `👁️ *View-once image revealed* 🐍`,
      }, { quoted: msg });
    } else if (mediaType === 'videoMessage') {
      await sock.sendMessage(from, {
        video: buffer,
        caption: `👁️ *View-once video revealed* 🐍`,
        mimetype: 'video/mp4',
      }, { quoted: msg });
    } else if (mediaType === 'audioMessage') {
      await sock.sendMessage(from, {
        audio: buffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
      }, { quoted: msg });
    } else {
      return msg.reply(`❌ Unsupported view-once type: ${mediaType}`);
    }
  },
};
