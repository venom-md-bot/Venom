const { fetchBuffer, searchYouTube, downloadYtMp3 } = require('../../src/utils/media');

module.exports = {
  name: ['play', 'music', 'song'],
  category: 'media',
  description: 'Search and play music as audio',
  usage: 'play <song name or YouTube URL>',
  async execute({ sock, msg, from, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}play <song name or YouTube URL>`);

    await msg.reply(`🔍 _Searching for "${text}"..._`);

    try {
      let ytUrl   = text;
      let ytTitle = text;
      let ytDur   = '';

      // If not a URL — search YouTube first
      if (!text.startsWith('http')) {
        const result = await searchYouTube(text);
        ytUrl   = result.url;
        ytTitle = result.title || text;
        ytDur   = result.duration || '';
        await msg.reply(`🎵 _Found: *${ytTitle}* — downloading..._`);
      }

      const dlResult = await downloadYtMp3(ytUrl);

      // Handle both API-URL result and direct yt-dlp buffer result
      let buffer;
      let title    = ytTitle;
      let duration = ytDur;

      if (dlResult._buffer) {
        // yt-dlp fallback returned a buffer directly
        buffer   = dlResult._buffer;
        title    = dlResult.title || ytTitle;
        duration = dlResult.duration || ytDur;
      } else {
        // API returned a URL — fetch it
        buffer   = await fetchBuffer(dlResult.audioUrl);
        title    = dlResult.title || ytTitle;
        duration = dlResult.duration || ytDur;
      }

      await sock.sendMessage(from, {
        audio:    buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`,
      }, { quoted: msg });

      await msg.reply(
        `🎵 *Now Playing:*\n*${title}*\n` +
        `⏱️ ${duration || 'N/A'}\n\n` +
        `_Venom MD Music 🐍_`
      );

    } catch (err) {
      await msg.reply(
        `❌ *Music download failed.*\n` +
        `_Error: ${err.message}_\n\n` +
        `💡 Try a direct YouTube URL: ${config.prefix}ytmp3 https://youtube.com/watch?v=...`
      );
    }
  },
};
