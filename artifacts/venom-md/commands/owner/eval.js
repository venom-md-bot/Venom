module.exports = {
  name: ['eval', 'exec', '>'],
  category: 'owner',
  description: 'Evaluate JavaScript code (OWNER ONLY)',
  usage: 'eval <code>',
  ownerOnly: true,
  async execute({ sock, msg, text, from, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}eval <code>`);

    try {
      // eslint-disable-next-line no-eval
      let result = eval(text);
      if (result instanceof Promise) result = await result;
      if (typeof result !== 'string') result = JSON.stringify(result, null, 2);
      await msg.reply(`✅ *Result:*\n\`\`\`\n${result}\n\`\`\``);
    } catch (err) {
      await msg.reply(`❌ *Error:*\n\`\`\`\n${err.message}\n\`\`\``);
    }
  },
};
