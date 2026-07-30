const { fetchBuffer, downloadFacebook } = require('../../src/utils/media');

module.exports = {
  name: ['facebook', 'fb', 'fbdl'],
  category: 'media',
  description: 'Download Facebook video',
  usage: 'facebook <Facebook video URL>',
  async execute({ sock, msg, from, text, config }) {
    if (!text || !text.startsWith('http')) {
      return msg.reply(
        `❓ *Usage:* ${config.prefix}facebook <Facebook video URL>\n` +
        `_Post must be public. Example:_\n` +
        `${config.prefix}facebook https://www.facebook.com/watch?v=12345`
      );
    }

    if (!text.includes('facebook.com') && !text.includes('fb.watch')) {
      return msg.reply(`❌ That doesn't look like a Facebook URL. Please send a valid Facebook video link.`);
    }

    await msg.reply('📥 _Downloading Facebook video..._');

    try {
      const { videoUrl, title } = await downloadFacebook(text);
      const buffer  = await fetchBuffer(videoUrl);
      const caption = `📘 *${title || 'Facebook Video'}*\n\n_Downloaded by Venom MD 🐍_`;

      await sock.sendMessage(from, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: msg });

    } catch (err) {
      await msg.reply(
        `❌ *Facebook download failed.*\n` +
        `_${err.message}_\n\n` +
        `💡 Make sure:\n• The video is public\n• The URL is a direct Facebook video link`
      );
    }
  },
};
