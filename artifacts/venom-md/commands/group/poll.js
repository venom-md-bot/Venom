// poll — WhatsApp native poll
module.exports = [
  {
    name: ['poll', 'vote', 'createpoll'],
    category: 'group',
    groupOnly: true,
    description: 'Create a WhatsApp native poll',
    usage: 'poll <Question> | Option1 | Option2 | ...',
    async execute({ sock, msg, from, text, config }) {
      if (!text || !text.includes('|')) {
        return msg.reply(
          `❓ *Usage:*\n${config.prefix}poll <Question> | Option1 | Option2 | Option3\n\n` +
          `*Example:*\n${config.prefix}poll Favourite colour? | Red | Blue | Green`
        );
      }
      const parts   = text.split('|').map(s => s.trim()).filter(Boolean);
      const question = parts[0];
      const options  = parts.slice(1);
      if (options.length < 2) return msg.reply('❌ You need at least 2 options.');
      if (options.length > 12) return msg.reply('❌ Maximum 12 options allowed.');

      await sock.sendMessage(from, {
        poll: {
          name:          question,
          values:        options,
          selectableCount: 1,
        },
      }, { quoted: msg });
    },
  },
  {
    name: ['multipoll', 'mvote'],
    category: 'group',
    groupOnly: true,
    description: 'Create a poll where users can pick multiple options',
    usage: 'multipoll <Question> | Option1 | Option2 | ...',
    async execute({ sock, msg, from, text, config }) {
      if (!text || !text.includes('|')) {
        return msg.reply(`❓ Usage: ${config.prefix}multipoll <Question> | Opt1 | Opt2 | ...`);
      }
      const parts    = text.split('|').map(s => s.trim()).filter(Boolean);
      const question = parts[0];
      const options  = parts.slice(1);
      if (options.length < 2) return msg.reply('❌ At least 2 options required.');
      await sock.sendMessage(from, {
        poll: {
          name:            question,
          values:          options,
          selectableCount: options.length, // allow multiple selections
        },
      }, { quoted: msg });
    },
  },
];
