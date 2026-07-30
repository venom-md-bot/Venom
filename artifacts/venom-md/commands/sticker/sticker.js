const { imageToSticker } = require('../../src/utils/media');

module.exports = {
  name: ['sticker', 's', 'stiker'],
  category: 'sticker',
  description: 'Convert image to sticker',
  usage: 'sticker (reply to image)',
  async execute({ sock, msg, from, config }) {
    const isImage  = msg.mtype === 'imageMessage';
    const isQuoted = msg.quoted?.mtype === 'imageMessage';

    if (!isImage && !isQuoted) return msg.reply(`❓ *Usage:* Reply to an image with ${config.prefix}sticker`);

    await msg.reply('🎨 _Creating sticker..._');

    const buffer  = isQuoted ? await msg.quoted.download() : await msg.download();
    const sticker = await imageToSticker(buffer, { pack: config.stickerPack, author: config.stickerAuthor });

    await sock.sendMessage(from, { sticker }, { quoted: msg });
  },
};
