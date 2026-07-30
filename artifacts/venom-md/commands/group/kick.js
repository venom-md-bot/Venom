const { cleanJid } = require('../../src/utils/general');

module.exports = {
  name: ['kick', 'remove'],
  category: 'group',
  description: 'Kick a member from the group',
  usage: 'kick @user (reply or mention)',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!target) return msg.reply(`❓ *Usage:* ${config.prefix}kick @user`);

    try {
      await sock.groupParticipantsUpdate(from, [target], 'remove');
      await msg.reply(`✅ *@${target.split('@')[0]} has been kicked!*\n_Venom MD Group Management 🐍_`, { mentions: [target] });
    } catch (err) {
      await msg.reply(`❌ Could not kick user: ${err.message}`);
    }
  },
};
