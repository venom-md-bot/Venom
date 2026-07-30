const { cleanJid } = require('../../src/utils/general');

module.exports = {
  name: ['tagall', 'everyone', 'all'],
  category: 'group',
  description: 'Tag everyone in the group',
  usage: 'tagall [message]',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from, text }) {
    const meta = await sock.groupMetadata(from);
    const members = meta.participants.map(p => cleanJid(p.id));

    let message = `📢 *TAG ALL*\n`;
    if (text) message += `\n${text}\n`;
    message += `\n`;
    members.forEach(m => { message += `@${m.split('@')[0]} `; });

    await sock.sendMessage(from, { text: message, mentions: members }, { quoted: msg });
  },
};
