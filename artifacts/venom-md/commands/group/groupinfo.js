module.exports = {
  name: ['groupinfo', 'ginfo', 'gcinfo'],
  category: 'group',
  description: 'Show group information',
  usage: 'groupinfo',
  groupOnly: true,
  async execute({ sock, msg, from }) {
    const meta  = await sock.groupMetadata(from);
    const admins = meta.participants.filter(p => p.admin).map(p => `@${p.id.split('@')[0]}`).join(', ');
    const created = new Date(meta.creation * 1000).toLocaleDateString();

    const text = `╔══════════════════════╗\n║   *📊 GROUP INFO*   ║\n╚══════════════════════╝\n\n` +
      `*📛 Name:* ${meta.subject}\n` +
      `*👥 Members:* ${meta.participants.length}\n` +
      `*👑 Admins:* ${admins || 'None'}\n` +
      `*📅 Created:* ${created}\n` +
      `*🆔 ID:* ${from}\n\n` +
      `${meta.desc ? `*📝 Description:*\n${meta.desc}` : ''}\n\n` +
      `> _🐍 Venom MD Group Info_`;

    await msg.reply(text);
  },
};
