const axios = require('axios');
const { fetchBuffer } = require('../../src/utils/media');

module.exports = {
  name: ['imagine', 'dalle', 'generate'],
  category: 'ai',
  description: 'Generate an image with AI (DALL-E)',
  usage: 'imagine <description>',
  async execute({ sock, msg, from, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}imagine <description>`);
    if (!config.openaiKey) return msg.reply(`❌ *OpenAI API key not configured.*`);

    await msg.reply('🎨 _Generating image..._');

    const res = await axios.post(
      'https://api.openai.com/v1/images/generations',
      { prompt: text, n: 1, size: '512x512' },
      { headers: { Authorization: `Bearer ${config.openaiKey}`, 'Content-Type': 'application/json' } }
    );

    const url    = res.data.data[0].url;
    const buffer = await fetchBuffer(url);
    await sock.sendMessage(from, { image: buffer, caption: `🎨 *Generated:* ${text}` }, { quoted: msg });
  },
};
