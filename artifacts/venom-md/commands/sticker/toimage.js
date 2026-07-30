const sharp = require('sharp');

module.exports = {
  name: ['toimage', 'stickertoimg', 'sti'],
  category: 'sticker',
  description: 'Convert sticker to image',
  usage: 'toimage (reply to sticker)',
  async execute({ sock, msg, from, config }) {
    const quoted    = msg.quoted;
    const isSticker = msg.mtype === 'stickerMessage' || quoted?.mtype === 'stickerMessage';

    if (!isSticker) return msg.reply(`❓ *Usage:* Reply to a sticker with ${config.prefix}toimage`);

    await msg.reply('🖼️ _Converting sticker..._');

    const buffer = quoted ? await quoted.download() : await msg.download();
    const imgBuf = await sharp(buffer).png().toBuffer();

    await sock.sendMessage(from, { image: imgBuf, caption: '✅ _Converted from sticker_' }, { quoted: msg });
  },
};
