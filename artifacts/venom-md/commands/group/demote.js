module.exports = {
  name: ['demote', 'unadmin'],
  category: 'group',
  description: 'Demote an admin to member',
  usage: 'demote @user',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!target) return msg.reply(`❓ *Usage:* ${config.prefix}demote @user`);

    try {
      await sock.groupParticipantsUpdate(from, [target], 'demote');
      await msg.reply(`📉 *@${target.split('@')[0]} has been demoted.*\n_Venom MD 🐍_`, { mentions: [target] });
    } catch (err) {
      await msg.reply(`❌ Could not demote user: ${err.message}`);
    }
  },
};
