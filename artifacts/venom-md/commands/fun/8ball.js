const { pickRandom } = require('../../src/utils/general');

const answers = [
  '✅ It is certain.', '✅ It is decidedly so.', '✅ Without a doubt.',
  '✅ Yes, definitely.', '✅ You may rely on it.', '✅ As I see it, yes.',
  '✅ Most likely.', '✅ Outlook good.', '✅ Yes.', '✅ Signs point to yes.',
  '🤔 Reply hazy, try again.', '🤔 Ask again later.', '🤔 Better not tell you now.',
  '🤔 Cannot predict now.', '🤔 Concentrate and ask again.',
  '❌ Don\'t count on it.', '❌ My reply is no.', '❌ My sources say no.',
  '❌ Outlook not so good.', '❌ Very doubtful.',
];

module.exports = {
  name: ['8ball', 'ask8ball'],
  category: 'fun',
  description: 'Ask the magic 8-ball a question',
  usage: '8ball <question>',
  async execute({ msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}8ball <your question>`);
    const answer = pickRandom(answers);
    await msg.reply(`🎱 *Magic 8-Ball*\n\n*Q:* ${text}\n\n*A:* ${answer}\n\n> _Venom MD 🐍_`);
  },
};
