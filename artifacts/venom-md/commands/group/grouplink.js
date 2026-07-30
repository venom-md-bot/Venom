module.exports = {
  name: ['grouplink', 'invitelink', 'link'],
  category: 'group',
  description: 'Get group invite link',
  usage: 'grouplink',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from }) {
    try {
      const code = await sock.groupInviteCode(from);
      await msg.reply(`🔗 *Group Invite Link:*\nhttps://chat.whatsapp.com/${code}\n\n_Venom MD 🐍_`);
    } catch (err) {
      await msg.reply(`❌ Could not get invite link: ${err.message}`);
    }
  },
};
