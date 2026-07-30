const { Settings } = require('../../src/Database');

module.exports = {
  name: ['welcome'],
  category: 'group',
  description: 'Toggle welcome/goodbye messages',
  usage: 'welcome on | off',
  groupOnly: true,
  adminOnly: true,
  async execute({ msg, from, args, config }) {
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      const current = Settings.getGroupKey(from, 'welcome') ? '✅ ON' : '❌ OFF';
      return msg.reply(`ℹ️ *Welcome messages are currently: ${current}*\n\n*Usage:* ${config.prefix}welcome on | off`);
    }

    Settings.setGroup(from, 'welcome', action === 'on');
    Settings.setGroup(from, 'goodbye', action === 'on');
    await msg.reply(`👋 *Welcome/Goodbye messages turned ${action.toUpperCase()}*`);
  },
};
