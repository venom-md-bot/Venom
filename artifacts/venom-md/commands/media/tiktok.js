const { fetchBuffer, downloadTikTok } = require('../../src/utils/media');

module.exports = {
  name: ['tiktok', 'tt', 'tikd'],
  category: 'media',
  description: 'Download TikTok video (no watermark)',
  usage: 'tiktok <TikTok URL>',
  async execute({ sock, msg, from, text, config }) {
    if (!text || !text.startsWith('http')) {
      return msg.reply(
        `❓ *Usage:* ${config.prefix}tiktok <TikTok URL>\n` +
        `_Example: ${config.prefix}tiktok https://www.tiktok.com/@user/video/12345_`
      );
    }

    await msg.reply('📥 _Downloading TikTok video (no watermark)..._');

    try {
      const { videoUrl, title, author } = await downloadTikTok(text);
      const buffer  = await fetchBuffer(videoUrl);
      const caption =
        `🎵 *${title || 'TikTok Video'}*\n` +
        `👤 @${author || 'unknown'}\n\n` +
        `_Downloaded by Venom MD 🐍 (No Watermark)_`;

      await sock.sendMessage(from, { video: buffer, caption, mimetype: 'video/mp4' }, { quoted: msg });

    } catch (err) {
      await msg.reply(
        `❌ *TikTok download failed.*\n` +
        `_${err.message}_\n\n` +
        `💡 Make sure the link is a public TikTok video URL.`
      );
    }
  },
};
