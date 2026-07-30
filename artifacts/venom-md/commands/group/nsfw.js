const { Settings } = require('../../src/Database');

module.exports = {
  name: ['nsfw'],
  category: 'group',
  description: 'Toggle NSFW commands in group',
  usage: 'nsfw on | off',
  groupOnly: true,
  adminOnly: true,
  async execute({ msg, from, args, config }) {
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      const current = Settings.getGroupKey(from, 'nsfw') ? '✅ ON' : '❌ OFF';
      return msg.reply(`ℹ️ *NSFW is currently: ${current}*\n\n*Usage:* ${config.prefix}nsfw on | off`);
    }

    Settings.setGroup(from, 'nsfw', action === 'on');
    await msg.reply(`🔞 *NSFW turned ${action.toUpperCase()} for this group*`);
  },
};
