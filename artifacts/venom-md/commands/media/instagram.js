const { fetchBuffer, downloadInstagram } = require('../../src/utils/media');

module.exports = {
  name: ['instagram', 'ig', 'igdl'],
  category: 'media',
  description: 'Download Instagram photo or video',
  usage: 'instagram <Instagram post URL>',
  async execute({ sock, msg, from, text, config }) {
    if (!text || !text.includes('instagram.com')) {
      return msg.reply(
        `❓ *Usage:* ${config.prefix}instagram <Instagram post URL>\n` +
        `_Post must be public. Example:_\n` +
        `${config.prefix}instagram https://www.instagram.com/p/XXXXXXX/`
      );
    }

    await msg.reply('📥 _Fetching Instagram media..._');

    try {
      const { mediaUrl, isVideo } = await downloadInstagram(text);
      const buffer  = await fetchBuffer(mediaUrl);
      const caption = `📸 *Instagram ${isVideo ? 'Video' : 'Photo'}*\n\n_Downloaded by Venom MD 🐍_`;

      if (isVideo) {
        await sock.sendMessage(from, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { image: buffer, caption }, { quoted: msg });
      }

    } catch (err) {
      await msg.reply(
        `❌ *Instagram download failed.*\n` +
        `_${err.message}_\n\n` +
        `💡 Make sure:\n• The post is public\n• The URL is a direct post link (not a story or reel)`
      );
    }
  },
};
