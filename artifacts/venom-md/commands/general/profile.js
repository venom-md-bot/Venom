const axios = require('axios');

module.exports = {
  name: ['profile', 'pp', 'whois'],
  category: 'general',
  description: "View your or someone else's profile picture",
  usage: 'profile | profile @user',
  async execute({ sock, msg, from, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender || msg.sender;

    try {
      const ppUrl = await sock.profilePictureUrl(target, 'image');
      const res   = await axios.get(ppUrl, { responseType: 'arraybuffer' });
      const buf   = Buffer.from(res.data);
      await sock.sendMessage(from, {
        image: buf,
        caption: `👤 *Profile Picture*\n📱 @${target.split('@')[0]}\n\n_Venom MD 🐍_`,
        mentions: [target],
      }, { quoted: msg });
    } catch {
      await msg.reply(`❌ Could not fetch profile picture for @${target.split('@')[0]}. They may have privacy settings on.`);
    }
  },
};
