const axios = require('axios');

module.exports = {
  name: ['stealpp', 'getpp'],
  category: 'general',
  description: "Download someone's profile picture",
  usage: 'stealpp @user',
  async execute({ sock, msg, from, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!target) return msg.reply(`❓ *Usage:* ${config.prefix}stealpp @user`);

    try {
      const ppUrl = await sock.profilePictureUrl(target, 'image');
      const res   = await axios.get(ppUrl, { responseType: 'arraybuffer' });
      const buf   = Buffer.from(res.data);
      await sock.sendMessage(from, {
        image: buf,
        caption: `🖼️ *Stolen PP!*\n📱 @${target.split('@')[0]}\n\n_Venom MD 🐍_`,
        mentions: [target],
      }, { quoted: msg });
    } catch {
      await msg.reply(`❌ Could not steal PP from @${target.split('@')[0]}.`);
    }
  },
};
