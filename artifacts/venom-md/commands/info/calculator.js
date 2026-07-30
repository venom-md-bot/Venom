module.exports = {
  name: ['calc', 'calculate', 'math'],
  category: 'info',
  description: 'Calculate a math expression',
  usage: 'calc <expression>',
  async execute({ msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}calc 2+2`);

    try {
      // Safe eval — only allow math characters
      const sanitized = text.replace(/[^0-9+\-*/.() %^]/g, '');
      if (!sanitized) return msg.reply('❌ Invalid expression.');
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      await msg.reply(`🧮 *Calculator*\n\n*Expression:* ${sanitized}\n*Result:* ${result}\n\n> _Venom MD 🐍_`);
    } catch {
      await msg.reply('❌ Could not calculate that expression. Check your math!');
    }
  },
};
