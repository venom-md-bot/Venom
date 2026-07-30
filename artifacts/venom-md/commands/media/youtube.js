const { fetchBuffer, searchYouTube, downloadYtMp3, downloadYtMp4 } = require('../../src/utils/media');

module.exports = {
  name: ['ytmp3', 'ytmp4', 'yta', 'ytv'],
  category: 'media',
  description: 'Download YouTube audio (ytmp3) or video (ytmp4)',
  usage: 'ytmp3 <YouTube URL or search> | ytmp4 <YouTube URL or search>',
  async execute({ sock, msg, from, command, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}${command} <YouTube URL or search term>`);

    await msg.reply('📥 _Fetching from YouTube..._');

    const isAudio = ['ytmp3', 'yta'].includes(command);

    try {
      let ytUrl   = text;
      let ytTitle = text;

      // If text is not a URL, search first
      if (!text.startsWith('http')) {
        const result = await searchYouTube(text);
        ytUrl   = result.url;
        ytTitle = result.title || text;
        await msg.reply(`🎵 _Found: *${ytTitle}* — downloading..._`);
      }

      if (isAudio) {
        const dlResult = await downloadYtMp3(ytUrl);

        let buffer, title, duration;
        if (dlResult._buffer) {
          buffer   = dlResult._buffer;
          title    = dlResult.title || ytTitle;
          duration = dlResult.duration || 'N/A';
        } else {
          buffer   = await fetchBuffer(dlResult.audioUrl);
          title    = dlResult.title || ytTitle;
          duration = dlResult.duration || 'N/A';
        }

        await sock.sendMessage(from, {
          audio: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3`,
        }, { quoted: msg });
        await msg.reply(`🎵 *${title}*\n⏱️ ${duration}\n\n_Downloaded by Venom MD 🐍_`);

      } else {
        const dlResult = await downloadYtMp4(ytUrl);

        let buffer, title, duration;
        if (dlResult._buffer) {
          buffer   = dlResult._buffer;
          title    = dlResult.title || ytTitle;
          duration = dlResult.duration || 'N/A';
        } else {
          buffer   = await fetchBuffer(dlResult.videoUrl);
          title    = dlResult.title || ytTitle;
          duration = dlResult.duration || 'N/A';
        }

        const caption = `🎬 *${title}*\n⏱️ ${duration}\n\n_Downloaded by Venom MD 🐍_`;
        await sock.sendMessage(from, {
          video: buffer, caption, mimetype: 'video/mp4',
        }, { quoted: msg });
      }

    } catch (err) {
      await msg.reply(
        `❌ *YouTube download failed.*\n` +
        `_Error: ${err.message}_\n\n` +
        `💡 Paste a direct YouTube link for best results.\n` +
        `Example: \`${config.prefix}ytmp3 https://youtube.com/watch?v=dQw4w9WgXcQ\``
      );
    }
  },
};
