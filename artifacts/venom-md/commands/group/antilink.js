const { Settings } = require('../../src/Database');

module.exports = {
  name: ['antilink'],
  category: 'group',
  description: 'Toggle anti-link in the group',
  usage: 'antilink on | off',
  groupOnly: true,
  adminOnly: true,
  async execute({ msg, from, args, config }) {
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      const current = Settings.getGroupKey(from, 'antilink') ? '✅ ON' : '❌ OFF';
      return msg.reply(`ℹ️ *Anti-link is currently: ${current}*\n\n*Usage:* ${config.prefix}antilink on | off`);
    }

    Settings.setGroup(from, 'antilink', action === 'on');
    await msg.reply(`🔗 *Anti-link turned ${action.toUpperCase()}*\n${action === 'on' ? 'Links will be deleted automatically.' : 'Links are now allowed.'}`);
  },
};
