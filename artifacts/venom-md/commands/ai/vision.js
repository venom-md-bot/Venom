const axios = require('axios');

// ocr | describe | enhance | removebg
module.exports = [
  {
    name: ['ocr', 'readtext', 'imagetotext', 'itt'],
    category: 'ai',
    description: 'Extract text from an image (OCR)',
    usage: 'ocr (reply to image)',
    async execute({ sock, msg, from, config }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply(`❓ Reply to an image with ${config.prefix}ocr`);
      await msg.reply('🔍 _Reading text from image..._');
      try {
        const buf = msg.quoted ? await msg.quoted.download() : await msg.download();
        const base64 = buf.toString('base64');
        // OCR.Space free API (apikey 'helloworld' is public)
        const res = await axios.post('https://api.ocr.space/parse/image', {
          base64Image: `data:image/jpeg;base64,${base64}`,
          language:    'eng',
          isOverlayRequired: false,
        }, {
          headers: { apikey: 'helloworld', 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        const result = res.data?.ParsedResults?.[0]?.ParsedText;
        if (!result?.trim()) return msg.reply('❌ No text detected in this image.');
        await msg.reply(`📝 *Text found:*\n\n${result.trim().slice(0, 2000)}`);
      } catch (err) {
        await msg.reply(`❌ OCR failed: ${err.message}`);
      }
    },
  },
  {
    name: ['describe', 'whatisthis', 'caption'],
    category: 'ai',
    description: 'Describe what\'s in an image using AI',
    usage: 'describe (reply to image)',
    async execute({ msg, config }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply(`❓ Reply to an image with ${config.prefix}describe`);
      await msg.reply('🤖 _Analysing image..._');
      try {
        const buf    = msg.quoted ? await msg.quoted.download() : await msg.download();
        const b64    = buf.toString('base64');
        const res    = await axios.post(
          'https://api.siputzx.my.id/api/ai/vision',
          { image: `data:image/jpeg;base64,${b64}` },
          { timeout: 30000 }
        );
        const desc = res.data?.result || res.data?.message || res.data?.data || 'No description available.';
        await msg.reply(`🖼️ *Image Description:*\n\n${String(desc).slice(0, 1500)}\n\n_AI Vision — Venom MD 🐍_`);
      } catch (err) {
        await msg.reply(`❌ Could not analyse image: ${err.message}`);
      }
    },
  },
  {
    name: ['enhance', 'upscale', 'hd'],
    category: 'ai',
    description: 'Upscale and enhance image quality',
    usage: 'enhance (reply to image)',
    async execute({ sock, msg, from, config }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply(`❓ Reply to an image with ${config.prefix}enhance`);
      await msg.reply('✨ _Enhancing image..._');
      try {
        const buf = msg.quoted ? await msg.quoted.download() : await msg.download();
        const b64 = buf.toString('base64');
        const res = await axios.post(
          `https://api.siputzx.my.id/api/e/remini`,
          { image: `data:image/jpeg;base64,${b64}` },
          { responseType: 'arraybuffer', timeout: 60000 }
        );
        const out = Buffer.from(res.data);
        await sock.sendMessage(from, { image: out, caption: '✨ *Enhanced! — Venom MD 🐍*' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Enhancement failed: ${err.message}\n_This feature needs a stable API connection._`);
      }
    },
  },
  {
    name: ['removebg', 'rmbg', 'nobg', 'bgremove'],
    category: 'ai',
    description: 'Remove background from an image',
    usage: 'removebg (reply to image)',
    async execute({ sock, msg, from, config }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply(`❓ Reply to an image with ${config.prefix}removebg`);
      await msg.reply('✂️ _Removing background..._');
      try {
        const buf = msg.quoted ? await msg.quoted.download() : await msg.download();
        const b64 = buf.toString('base64');
        const res = await axios.post(
          'https://api.siputzx.my.id/api/e/rembg',
          { image: `data:image/jpeg;base64,${b64}` },
          { responseType: 'arraybuffer', timeout: 60000 }
        );
        const out = Buffer.from(res.data);
        await sock.sendMessage(from, { image: out, caption: '✂️ *Background removed! — Venom MD 🐍*' }, { quoted: msg });
      } catch (err) {
        await msg.reply(`❌ Background removal failed: ${err.message}`);
      }
    },
  },
];
