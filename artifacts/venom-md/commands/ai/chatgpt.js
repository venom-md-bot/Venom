const axios = require('axios');

module.exports = {
  name: ['ai', 'gpt', 'chatgpt', 'ask'],
  category: 'ai',
  description: 'Chat with AI (ChatGPT)',
  usage: 'ai <your question>',
  async execute({ msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}ai <your question>`);
    if (!config.openaiKey) return msg.reply(`❌ *OpenAI API key not configured.*\nAsk the owner to set OPENAI_API_KEY.`);

    await msg.reply('🤖 _Thinking..._');

    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Venom MD, the #1 WhatsApp bot assistant. Be helpful, concise, and friendly.' },
          { role: 'user', content: text },
        ],
        max_tokens: 1000,
      },
      { headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' } }
    );

    const answer = res.data.choices[0].message.content.trim();
    await msg.reply(`🤖 *AI Response:*\n\n${answer}`);
  },
};
