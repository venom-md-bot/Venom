const { Settings } = require('../../src/Database');

const VALID_MODES = ['public', 'private', 'self', 'group'];

const MODE_DESC = {
  public:  '🌐 *PUBLIC* — Everyone can use commands everywhere.',
  private: '🔒 *PRIVATE* — Only the owner can use commands.',
  self:    '🔒 *SELF* — Only the owner can use commands (alias for private).',
  group:   '👥 *GROUP* — Bot only responds inside groups (DM users need whitelist).',
};

module.exports = {
  name: ['mode', 'botmode'],
  category: 'owner',
  description: 'Switch bot mode: public / private / self / group',
  usage: 'mode public | private | self | group',
  ownerOnly: true,
  async execute({ msg, args, config }) {
    const newMode = args[0]?.toLowerCase();

    if (!newMode) {
      const cur = Settings.getGlobal('mode') || config.mode || 'public';
      return msg.reply(
        `ℹ️ *Current mode:* ${cur.toUpperCase()}\n\n` +
        Object.entries(MODE_DESC).map(([k, v]) => `${k === cur ? '✅' : '▫️'} ${v}`).join('\n') +
        `\n\n*Usage:* ${config.prefix}mode public | private | self | group`
      );
    }

    if (!VALID_MODES.includes(newMode)) {
      return msg.reply(
        `❓ Invalid mode: *${newMode}*\n\n` +
        `Valid modes: ${VALID_MODES.join(' | ')}\n\n` +
        `*Usage:* ${config.prefix}mode public | private | self | group`
      );
    }

    Settings.setGlobal('mode', newMode);
    await msg.reply(
      `✅ *Bot mode changed to: ${newMode.toUpperCase()}*\n\n` +
      `${MODE_DESC[newMode]}`
    );
  },
};
