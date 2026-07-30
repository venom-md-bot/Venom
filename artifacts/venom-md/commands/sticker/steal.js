const { imageToSticker } = require('../../src/utils/media');

module.exports = {
  name: ['steal', 'take'],
  category: 'sticker',
  description: 'Steal a sticker and re-label it as yours',
  usage: 'steal [pack name] | [author] (reply to sticker)',
  async execute({ sock, msg, from, text, config }) {
    const quoted  = msg.quoted;
    const isStick = msg.mtype === 'stickerMessage' || quoted?.mtype === 'stickerMessage';

    if (!isStick) return msg.reply(`❓ *Usage:* Reply to a sticker with ${config.prefix}steal`);

    const [pack = config.stickerPack, author = config.stickerAuthor] = text.split('|').map(s => s.trim());

    const buffer  = quoted ? await quoted.download() : await msg.download();
    const sticker = await imageToSticker(buffer, { pack, author });

    await sock.sendMessage(from, { sticker }, { quoted: msg });
  },
};
