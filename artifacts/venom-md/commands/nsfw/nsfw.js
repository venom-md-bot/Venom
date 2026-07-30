const axios = require('axios');
const { fetchBuffer } = require('../../src/utils/media');

const categories = {
  hentai:  'https://api.waifu.pics/nsfw/hentai',
  ass:     'https://api.waifu.pics/nsfw/ass',
  blowjob: 'https://api.waifu.pics/nsfw/blowjob',
  pussy:   'https://api.waifu.pics/nsfw/pussy',
  trap:    'https://api.waifu.pics/nsfw/trap',
  cum:     'https://api.waifu.pics/nsfw/cum',
};

const names = Object.keys(categories);

module.exports = {
  name: names,
  category: 'nsfw',
  description: 'NSFW image commands (18+ only, must be enabled by admin)',
  usage: '<category>  e.g. hentai, ass, blowjob...',
  async execute({ sock, msg, from, command }) {
    const url = categories[command];
    if (!url) return msg.reply('❌ Unknown NSFW category.');

    await msg.reply('🔞 _Fetching..._');

    const res    = await axios.get(url, { timeout: 15000 });
    const imgUrl = res.data?.url;
    if (!imgUrl) return msg.reply('❌ Failed to fetch image. Try again.');

    const buffer = await fetchBuffer(imgUrl);
    await sock.sendMessage(from, {
      image:   buffer,
      caption: `🔞 *${command.toUpperCase()}*\n\n_⚠️ 18+ Content — Venom MD_`,
    }, { quoted: msg });
  },
};
