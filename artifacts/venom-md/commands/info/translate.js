const axios = require('axios');

module.exports = {
  name: ['translate', 'tr'],
  category: 'info',
  description: 'Translate text to another language',
  usage: 'translate <lang> <text>  e.g. translate es Hello World',
  async execute({ msg, args, config }) {
    if (args.length < 2) return msg.reply(`❓ *Usage:* ${config.prefix}translate <lang> <text>\n_Example: .translate es Hello World_`);

    const [lang, ...rest] = args;
    const text = rest.join(' ');

    try {
      const res = await axios.get(`https://api.mymemory.translated.net/get`, {
        params: { q: text, langpair: `en|${lang}` },
        timeout: 10000,
      });
      const translated = res.data?.responseData?.translatedText;
      if (!translated) throw new Error('No translation');
      await msg.reply(`🌐 *Translation*\n\n*Original:* ${text}\n*Language:* ${lang.toUpperCase()}\n*Translated:* ${translated}\n\n> _Venom MD 🐍_`);
    } catch {
      await msg.reply('❌ Translation failed. Try a valid language code (e.g. es, fr, de, ar).');
    }
  },
};
