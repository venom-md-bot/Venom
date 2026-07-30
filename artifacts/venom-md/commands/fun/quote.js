const axios = require('axios');

module.exports = {
  name: ['quote', 'inspire'],
  category: 'fun',
  description: 'Get a random inspirational quote',
  usage: 'quote',
  async execute({ msg }) {
    // zenquotes.io — free, no key needed
    const res = await axios.get('https://zenquotes.io/api/random', { timeout: 10000 });
    const { q: content, a: author } = res.data[0];
    await msg.reply(`💬 *"${content}"*\n\n— _${author}_\n\n> _Venom MD Quotes 🐍_`);
  },
};
