module.exports = {
  name: ['promote', 'admin'],
  category: 'group',
  description: 'Promote a member to admin',
  usage: 'promote @user',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!target) return msg.reply(`❓ *Usage:* ${config.prefix}promote @user`);

    try {
      await sock.groupParticipantsUpdate(from, [target], 'promote');
      await msg.reply(`👑 *@${target.split('@')[0]} is now an admin!*\n_Venom MD 🐍_`, { mentions: [target] });
    } catch (err) {
      await msg.reply(`❌ Could not promote user: ${err.message}`);
    }
  },
};
