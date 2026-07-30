const axios = require('axios');
const { fetchBuffer } = require('../../src/utils/media');

module.exports = {
  name: ['meme'],
  category: 'fun',
  description: 'Get a random meme',
  usage: 'meme',
  async execute({ sock, msg, from }) {
    const res  = await axios.get('https://meme-api.com/gimme', { timeout: 10000 });
    const { title, url } = res.data;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(from, { image: buffer, caption: `😂 *${title}*\n\n> _Venom MD Fun 🐍_` }, { quoted: msg });
  },
};
