const { Settings } = require('../../src/Database');

module.exports = {
  name: ['anticall'],
  category: 'group',
  description: 'Toggle anti-call globally',
  usage: 'anticall on | off',
  ownerOnly: true,
  async execute({ msg, args, config }) {
    const action = args[0]?.toLowerCase();
    if (!action || !['on', 'off'].includes(action)) {
      const current = Settings.getGlobal('anticall') ? '✅ ON' : '❌ OFF';
      return msg.reply(`ℹ️ *Anti-call is currently: ${current}*\n\n*Usage:* ${config.prefix}anticall on | off`);
    }

    Settings.setGlobal('anticall', action === 'on');
    await msg.reply(`📵 *Anti-call turned ${action.toUpperCase()}*\n${action === 'on' ? 'All calls will now be auto-rejected.' : 'Calls are now allowed.'}`);
  },
};
