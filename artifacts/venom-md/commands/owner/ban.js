const { Settings } = require('../../src/Database');
const { cleanJid } = require('../../src/utils/general');

module.exports = {
  name: ['ban', 'unban'],
  category: 'owner',
  description: 'Ban or unban a user from using the bot',
  usage: 'ban @user | unban @user',
  ownerOnly: true,
  async execute({ msg, args, command, config }) {
    const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
    if (!target) return msg.reply(`❓ *Usage:* ${config.prefix}${command} @user`);

    const jid = cleanJid(target);

    if (command === 'ban') {
      Settings.ban(jid);
      await msg.reply(`🚫 *@${jid.split('@')[0]} has been banned from using the bot.*`, { mentions: [jid] });
    } else {
      Settings.unban(jid);
      await msg.reply(`✅ *@${jid.split('@')[0]} has been unbanned.*`, { mentions: [jid] });
    }
  },
};
