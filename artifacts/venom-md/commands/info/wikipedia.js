const axios = require('axios');

module.exports = {
  name: ['wiki', 'wikipedia'],
  category: 'info',
  description: 'Search Wikipedia',
  usage: 'wiki <query>',
  async execute({ msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}wiki <query>`);

    const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`, { timeout: 10000 });
    const d   = res.data;
    if (d.type === 'disambiguation') return msg.reply(`⚠️ *Disambiguation:* Too broad — try being more specific.`);
    if (!d.extract) return msg.reply(`❌ No Wikipedia article found for: ${text}`);

    const summary = d.extract.length > 800 ? d.extract.slice(0, 800) + '...' : d.extract;
    await msg.reply(`📚 *${d.title}*\n\n${summary}\n\n🔗 ${d.content_urls?.desktop?.page || ''}\n\n> _Venom MD Wikipedia 🐍_`);
  },
};
