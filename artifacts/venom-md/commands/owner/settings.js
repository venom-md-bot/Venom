const { fetchBuffer } = require('../../src/utils/media');

// setname | setbio | setpp | setnpp | setprefix | autoread
module.exports = [
  {
    name: ['setname', 'botname'],
    category: 'owner',
    ownerOnly: true,
    description: 'Change bot display name',
    usage: 'setname <new name>',
    async execute({ sock, msg, text }) {
      if (!text) return msg.reply('❓ Usage: .setname <new name>');
      await sock.updateProfileName(text);
      await msg.reply(`✅ Bot name updated to: *${text}*`);
    },
  },
  {
    name: ['setbio', 'setstatus', 'botbio'],
    category: 'owner',
    ownerOnly: true,
    description: 'Change bot WhatsApp status/bio',
    usage: 'setbio <text>',
    async execute({ sock, msg, text }) {
      if (!text) return msg.reply('❓ Usage: .setbio <text>');
      await sock.updateProfileStatus(text);
      await msg.reply(`✅ Status updated to: _${text}_`);
    },
  },
  {
    name: ['setpp', 'setpfp', 'botpp'],
    category: 'owner',
    ownerOnly: true,
    description: 'Change bot profile picture (reply to image)',
    usage: 'setpp (reply to image)',
    async execute({ sock, msg }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply('❓ Reply to an image with .setpp');
      const buffer = msg.quoted ? await msg.quoted.download() : await msg.download();
      await sock.updateProfilePicture(sock.user.id, buffer);
      await msg.reply('✅ Bot profile picture updated!');
    },
  },
  {
    name: ['setnpp', 'removebotpp', 'delpfp'],
    category: 'owner',
    ownerOnly: true,
    description: 'Remove bot profile picture',
    usage: 'setnpp',
    async execute({ sock, msg }) {
      await sock.removeProfilePicture(sock.user.id);
      await msg.reply('✅ Bot profile picture removed.');
    },
  },
  {
    name: ['setprefix', 'prefix', 'changeprefix'],
    category: 'owner',
    ownerOnly: true,
    description: 'Change the bot command prefix',
    usage: 'setprefix <character>',
    async execute({ sock, msg, text, config }) {
      if (!text || text.length > 3) return msg.reply('❓ Usage: .setprefix <character> (max 3 chars)');
      config.prefix = text.trim();
      await msg.reply(`✅ Prefix changed to: *${config.prefix}*\n_Note: This resets on restart. Edit config.js to make it permanent._`);
    },
  },
  {
    name: ['autoread', 'setautoread'],
    category: 'owner',
    ownerOnly: true,
    description: 'Toggle auto-read messages',
    usage: 'autoread on/off',
    async execute({ msg, text }) {
      const { Settings } = require('../../src/Database');
      const val = text?.toLowerCase();
      if (!['on', 'off'].includes(val)) {
        const cur = Settings.getGlobal('autoread') ? 'on' : 'off';
        return msg.reply(`ℹ️ Auto-read is currently *${cur}*. Use .autoread on/off`);
      }
      Settings.setGlobal('autoread', val === 'on');
      await msg.reply(`✅ Auto-read turned *${val}*`);
    },
  },
];
