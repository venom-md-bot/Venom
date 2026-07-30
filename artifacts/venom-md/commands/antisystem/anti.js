const { Settings } = require('../../src/Database');

// antibot | antiflood | antiswear | antichange | antilink (extend)
const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'slut', 'whore', 'nigga', 'nigger', 'idiot', 'stupid'];

module.exports = [
  {
    name: ['antibot', 'blockbots'],
    category: 'antisystem',
    groupOnly: true,
    adminOnly: true,
    description: 'Block other bots from sending commands in this group',
    async execute({ msg, from, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGroupKey(from, 'antibot') ? 'on' : 'off';
        return msg.reply(`🤖 Anti-bot is *${cur}*. Use .antibot on/off`);
      }
      Settings.setGroup(from, 'antibot', val === 'on');
      await msg.reply(val === 'on'
        ? `🤖 *Anti-bot ON*\n_Commands from other bots will be deleted._`
        : `🤖 *Anti-bot OFF*`
      );
    },
  },
  {
    name: ['antiflood', 'floodprotect'],
    category: 'antisystem',
    groupOnly: true,
    adminOnly: true,
    description: 'Enable/disable anti-flood (kick spammers)',
    async execute({ msg, from, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGroupKey(from, 'antispam') ? 'on' : 'off';
        return msg.reply(`🌊 Anti-flood is *${cur}*. Use .antiflood on/off`);
      }
      Settings.setGroup(from, 'antispam', val === 'on');
      await msg.reply(val === 'on'
        ? `🌊 *Anti-flood ON*\n_Spammers will be warned and kicked._`
        : `🌊 *Anti-flood OFF*`
      );
    },
  },
  {
    name: ['antiswear', 'antibadwords', 'asw'],
    category: 'antisystem',
    groupOnly: true,
    adminOnly: true,
    description: 'Delete messages with bad words',
    async execute({ msg, from, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGroupKey(from, 'antiswear') ? 'on' : 'off';
        return msg.reply(`🤬 Anti-swear is *${cur}*. Use .antiswear on/off`);
      }
      Settings.setGroup(from, 'antiswear', val === 'on');
      await msg.reply(val === 'on'
        ? `🤬 *Anti-swear ON*\n_Messages with bad words will be deleted._`
        : `🤬 *Anti-swear OFF*`
      );
    },
  },
  {
    name: ['antichange', 'antisubject', 'lockgroup'],
    category: 'antisystem',
    groupOnly: true,
    adminOnly: true,
    description: 'Prevent non-admins from changing group subject/icon',
    async execute({ msg, from, sock, text }) {
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        return msg.reply('❓ Usage: .antichange on/off');
      }
      if (val === 'on') {
        await sock.groupSettingUpdate(from, 'locked');
      } else {
        await sock.groupSettingUpdate(from, 'unlocked');
      }
      Settings.setGroup(from, 'antichange', val === 'on');
      await msg.reply(val === 'on'
        ? `🔒 *Anti-change ON*\n_Only admins can change group info._`
        : `🔓 *Anti-change OFF*\n_All members can change group info._`
      );
    },
  },
  {
    name: ['antifake', 'antiforeign', 'antiinternational'],
    category: 'antisystem',
    groupOnly: true,
    adminOnly: true,
    description: 'Kick members whose numbers don\'t match a specific country code',
    usage: 'antifake <country code e.g. 234>',
    async execute({ sock, msg, from, text }) {
      if (!text) return msg.reply('❓ Usage: .antifake <country code>\nExample: .antifake 234 (Nigeria)\nThis kicks anyone NOT from that country code.');
      const code = text.trim().replace(/[^0-9]/g, '');
      await msg.reply(`🌍 _Checking members against country code +${code}..._`);
      const meta    = await sock.groupMetadata(from);
      let kicked = 0;
      for (const p of meta.participants) {
        const num = p.id.split('@')[0];
        if (!num.startsWith(code)) {
          await sock.groupParticipantsUpdate(from, [p.id], 'remove').catch(() => {});
          kicked++;
          await new Promise(r => setTimeout(r, 600));
        }
      }
      await msg.reply(`✅ Removed ${kicked} members not from +${code}.`);
    },
  },
];
