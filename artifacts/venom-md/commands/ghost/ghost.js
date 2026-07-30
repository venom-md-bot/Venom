const { Settings } = require('../../src/Database');

// ghostmode | antidelete | antirevoke | antionline
module.exports = [
  {
    name: ['ghostmode', 'ghost', 'gm'],
    category: 'ghost',
    ownerOnly: true,
    description: 'Toggle ghost mode (hides online status & read receipts)',
    async execute({ sock, msg, text }) {
      const val = text?.toLowerCase();
      const current = global.ghostMode || false;
      if (!val) {
        return msg.reply(`👻 Ghost mode is currently *${current ? 'ON' : 'OFF'}*.\nUse .ghostmode on/off`);
      }
      if (!['on', 'off'].includes(val)) return msg.reply('❓ Usage: .ghostmode on/off');
      global.ghostMode = val === 'on';
      if (global.ghostMode) {
        await sock.sendPresenceUpdate('unavailable');
      } else {
        await sock.sendPresenceUpdate('available');
      }
      await msg.reply(
        global.ghostMode
          ? `👻 *Ghost mode ON*\n_You're invisible. Read receipts blocked. Last seen hidden._`
          : `👁️ *Ghost mode OFF*\n_You're visible again._`
      );
    },
  },
  {
    name: ['antidelete', 'antirevoke', 'ad'],
    category: 'ghost',
    description: 'Toggle anti-delete in this group (resends deleted messages)',
    groupOnly: true,
    adminOnly: true,
    async execute({ msg, from, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGroupKey(from, 'antidelete') ? 'on' : 'off';
        return msg.reply(`🗑️ Anti-delete is *${cur}*. Use .antidelete on/off`);
      }
      Settings.setGroup(from, 'antidelete', val === 'on');
      await msg.reply(
        val === 'on'
          ? `🗑️ *Anti-delete ON*\n_I will resend deleted messages in this group._`
          : `🗑️ *Anti-delete OFF*\n_Deleted messages will stay deleted._`
      );
    },
  },
  {
    name: ['antiviewonce', 'avo'],
    category: 'ghost',
    description: 'Toggle anti-viewonce (auto-saves view-once media)',
    groupOnly: true,
    adminOnly: true,
    async execute({ msg, from, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGroupKey(from, 'antiviewonce') ? 'on' : 'off';
        return msg.reply(`👁️ Anti-viewonce is *${cur}*. Use .antiviewonce on/off`);
      }
      Settings.setGroup(from, 'antiviewonce', val === 'on');
      await msg.reply(
        val === 'on'
          ? `👁️ *Anti-viewonce ON*\n_View-once messages will be forwarded to me privately._`
          : `👁️ *Anti-viewonce OFF*`
      );
    },
  },
  {
    name: ['antionline', 'hideread'],
    category: 'ghost',
    ownerOnly: true,
    description: 'Toggle hiding your online status globally',
    async execute({ msg, text, sock }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        return msg.reply('❓ Usage: .antionline on/off');
      }
      global.antiOnline = val === 'on';
      if (global.antiOnline) {
        await sock.sendPresenceUpdate('unavailable');
      }
      await msg.reply(global.antiOnline
        ? `🕵️ *Anti-online ON* — Bot will not appear online`
        : `✅ *Anti-online OFF* — Normal presence restored`
      );
    },
  },
];
