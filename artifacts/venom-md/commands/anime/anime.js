const axios = require('axios');
const { fetchBuffer } = require('../../src/utils/media');

const endpoints = {
  hug:   'https://api.waifu.pics/sfw/hug',
  kiss:  'https://api.waifu.pics/sfw/kiss',
  slap:  'https://api.waifu.pics/sfw/slap',
  pat:   'https://api.waifu.pics/sfw/pat',
  waifu: 'https://api.waifu.pics/sfw/waifu',
  neko:  'https://api.waifu.pics/sfw/neko',
  dance: 'https://api.waifu.pics/sfw/dance',
  cry:   'https://api.waifu.pics/sfw/cry',
};

const names = Object.keys(endpoints);

module.exports = {
  name: names,
  category: 'anime',
  description: 'Anime GIF commands (hug, kiss, slap, pat, waifu, neko, dance, cry)',
  usage: 'hug | kiss | slap | pat | waifu | neko | dance | cry',
  async execute({ sock, msg, from, command }) {
    const url = endpoints[command];
    if (!url) return msg.reply('❌ Unknown anime command.');

    await msg.reply('🌸 _Fetching..._');

    const res    = await axios.get(url, { timeout: 10000 });
    const imgUrl = res.data?.url;
    if (!imgUrl) return msg.reply('❌ Failed to fetch anime image. Try again.');

    const buffer  = await fetchBuffer(imgUrl);
    const mention = msg.mentionedJid?.[0];
    const caption = mention
      ? `🌸 *${command.toUpperCase()}*\n@${msg.pushName} ${command}s @${mention.split('@')[0]}\n\n_Venom MD Anime 🐍_`
      : `🌸 *${command.toUpperCase()}*\n\n_Venom MD Anime 🐍_`;

    await sock.sendMessage(from, {
      image: buffer,
      caption,
      mentions: mention ? [mention] : [],
    }, { quoted: msg });
  },
};
