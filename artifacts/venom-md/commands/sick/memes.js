const { fetchBuffer } = require('../../src/utils/media');
const axios = require('axios');

async function getUserAvatarUrl(sock, jid) {
  try {
    return await sock.profilePictureUrl(jid, 'image');
  } catch {
    return null;
  }
}

async function getTargetAvatar(sock, msg) {
  const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
  if (target) return getUserAvatarUrl(sock, target);
  if (msg.mtype === 'imageMessage') return null; // use the image itself
  return getUserAvatarUrl(sock, msg.sender);
}

// Memes via popcat.xyz API (free, no key)
module.exports = [
  {
    name: ['triggered', 'trigger'],
    category: 'sick',
    description: 'Make a triggered GIF from someone\'s profile picture',
    usage: 'triggered @user (or reply to image)',
    async execute({ sock, msg, from, config }) {
      await msg.reply('🎨 _Generating triggered GIF..._');
      let imageUrl;
      try {
        if (msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage') {
          const buf = msg.quoted ? await msg.quoted.download() : await msg.download();
          // For Popcat we need a URL — use base64 data URI approach or fallback to PP
          imageUrl = await getUserAvatarUrl(sock, msg.sender);
        } else {
          const target = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
          imageUrl = await getUserAvatarUrl(sock, target);
        }
        if (!imageUrl) return msg.reply('❌ Could not get profile picture. Tag someone or reply to an image.');
        const res = await axios.get(`https://api.popcat.xyz/triggered?image=${encodeURIComponent(imageUrl)}`, { responseType: 'arraybuffer', timeout: 30000 });
        const buf = Buffer.from(res.data);
        await sock.sendMessage(from, { video: buf, caption: '😡 *TRIGGERED* — Venom MD 🐍', gifPlayback: true, mimetype: 'video/mp4' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Meme generation failed: ${err.message}`);
      }
    },
  },
  {
    name: ['wanted', 'wantedposter'],
    category: 'sick',
    description: 'Generate a WANTED poster with someone\'s picture',
    usage: 'wanted @user',
    async execute({ sock, msg, from, config }) {
      await msg.reply('🎨 _Generating WANTED poster..._');
      try {
        const target   = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
        const imageUrl = await getUserAvatarUrl(sock, target);
        if (!imageUrl) return msg.reply('❌ Could not get profile picture.');
        const res = await axios.get(`https://api.popcat.xyz/wanted?image=${encodeURIComponent(imageUrl)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, { image: Buffer.from(res.data), caption: '🤠 *WANTED!* — Venom MD 🐍' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    name: ['changemymind', 'cmm'],
    category: 'sick',
    description: 'Generate a "Change My Mind" meme',
    usage: 'changemymind <text>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}changemymind <your opinion>`);
      await msg.reply('🎨 _Generating meme..._');
      try {
        const res = await axios.get(`https://api.popcat.xyz/changemymind?text=${encodeURIComponent(text)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, { image: Buffer.from(res.data), caption: `💬 *${text}* — Change My Mind` }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    name: ['clown', 'honk'],
    category: 'sick',
    description: 'Turn someone into a clown',
    usage: 'clown @user',
    async execute({ sock, msg, from }) {
      try {
        const target   = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
        const imageUrl = await getUserAvatarUrl(sock, target);
        if (!imageUrl) return msg.reply('❌ Could not get profile picture.');
        const res = await axios.get(`https://api.popcat.xyz/clown?image=${encodeURIComponent(imageUrl)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, { image: Buffer.from(res.data), caption: '🤡 *CLOWN* — Venom MD 🐍' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    name: ['jail', 'prison', 'arrested'],
    category: 'sick',
    description: 'Put someone behind bars',
    usage: 'jail @user',
    async execute({ sock, msg, from }) {
      try {
        const target   = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
        const imageUrl = await getUserAvatarUrl(sock, target);
        if (!imageUrl) return msg.reply('❌ Could not get profile picture.');
        const res = await axios.get(`https://api.popcat.xyz/jail?image=${encodeURIComponent(imageUrl)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, { image: Buffer.from(res.data), caption: '⛓️ *LOCKED UP* — Venom MD 🐍' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    name: ['invert', 'invertpp'],
    category: 'sick',
    description: 'Invert someone\'s profile picture colours',
    usage: 'invert @user',
    async execute({ sock, msg, from }) {
      try {
        const target   = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;
        const imageUrl = await getUserAvatarUrl(sock, target);
        if (!imageUrl) return msg.reply('❌ Could not get profile picture.');
        const res = await axios.get(`https://api.popcat.xyz/invert?image=${encodeURIComponent(imageUrl)}`, { responseType: 'arraybuffer', timeout: 30000 });
        await sock.sendMessage(from, { image: Buffer.from(res.data), caption: '🔄 _Inverted — Venom MD 🐍_' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
];
