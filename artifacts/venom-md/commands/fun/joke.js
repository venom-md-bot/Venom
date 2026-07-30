const axios = require('axios');

module.exports = {
  name: ['joke', 'jokes'],
  category: 'fun',
  description: 'Get a random joke',
  usage: 'joke',
  async execute({ msg }) {
    const res  = await axios.get('https://official-joke-api.appspot.com/random_joke', { timeout: 8000 });
    const { setup, punchline } = res.data;
    await msg.reply(`😂 *Joke Time!*\n\n*Q:* ${setup}\n\n*A:* ${punchline}\n\n> _Venom MD Fun 🐍_`);
  },
};
