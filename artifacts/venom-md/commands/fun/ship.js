const { randomInt } = require('../../src/utils/general');

module.exports = {
  name: ['ship', 'love'],
  category: 'fun',
  description: 'Ship two people together',
  usage: 'ship @user1 @user2',
  async execute({ msg, config }) {
    const mentions = msg.mentionedJid;
    if (mentions.length < 2) return msg.reply(`❓ *Usage:* ${config.prefix}ship @user1 @user2`);

    const [p1, p2] = mentions;
    const score = randomInt(1, 100);
    const bar   = '█'.repeat(Math.floor(score / 10)) + '░'.repeat(10 - Math.floor(score / 10));
    const emoji = score >= 80 ? '💑' : score >= 60 ? '💕' : score >= 40 ? '💗' : score >= 20 ? '💔' : '😬';

    await msg.reply(
      `${emoji} *SHIP METER* ${emoji}\n\n` +
      `@${p1.split('@')[0]} ❤️ @${p2.split('@')[0]}\n\n` +
      `[${bar}] ${score}%\n\n` +
      `${score >= 80 ? 'Perfect match! 💯' : score >= 60 ? 'Pretty good! 💖' : score >= 40 ? 'Could work... 🤷' : score >= 20 ? 'Hmm, not great 😬' : 'Not meant to be 💔'}\n\n` +
      `> _Venom MD Fun 🐍_`,
      { mentions }
    );
  },
};
