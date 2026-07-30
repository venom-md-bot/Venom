const { Settings } = require('../../src/Database');

module.exports = {
  name: ['antispam'],
  category: 'group',
  description: 'Toggle anti-spam in the group',
  usage: 'antispam on | off',
  groupOnly: true,
  adminOnly: true,
  async execute({ msg, from, args, config }) {
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      const current = Settings.getGroupKey(from, 'antispam') ? '✅ ON' : '❌ OFF';
      return msg.reply(`ℹ️ *Anti-spam is currently: ${current}*\n\n*Usage:* ${config.prefix}antispam on | off`);
    }

    Settings.setGroup(from, 'antispam', action === 'on');
    await msg.reply(`🚫 *Anti-spam turned ${action.toUpperCase()}*`);
  },
};
