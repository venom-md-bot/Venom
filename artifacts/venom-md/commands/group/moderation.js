const { cleanJid } = require('../../src/utils/general');

// warn | warnings | resetwarn | kickall | add
module.exports = [
  {
    name: ['warn', 'w'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Warn a user (3 warns = auto-kick)',
    usage: 'warn @user <reason>',
    async execute({ sock, msg, from, args, config }) {
      const target = cleanJid(msg.mentionedJid?.[0] || msg.quoted?.sender);
      if (!target) return msg.reply(`❓ Usage: ${config.prefix}warn @user <reason>`);
      if (!global.warnData) global.warnData = {};
      const key = `${from}_${target}`;
      global.warnData[key] = (global.warnData[key] || 0) + 1;
      const count = global.warnData[key];
      const reason = args.slice(1).join(' ') || 'No reason given';
      await msg.reply(
        `⚠️ @${target.split('@')[0]} has been warned!\n*Reason:* ${reason}\n*Warns:* ${count}/3\n` +
        (count >= 3 ? '_Auto-kicking for 3 warns..._' : ''),
        { mentions: [target] }
      );
      if (count >= 3) {
        global.warnData[key] = 0;
        await sock.groupParticipantsUpdate(from, [target], 'remove').catch(() => {});
      }
    },
  },
  {
    name: ['warnings', 'warncount', 'checkwarn'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Check warn count for a user',
    async execute({ msg, config }) {
      const target = cleanJid(msg.mentionedJid?.[0] || msg.quoted?.sender);
      if (!target) return msg.reply(`❓ Usage: ${config.prefix}warnings @user`);
      const key    = `${msg.from}_${target}`;
      const count  = global.warnData?.[key] || 0;
      await msg.reply(`⚠️ @${target.split('@')[0]}: *${count}/3* warnings`, { mentions: [target] });
    },
  },
  {
    name: ['resetwarn', 'clearwarn', 'rw'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Reset warnings for a user',
    async execute({ msg, from, config }) {
      const target = cleanJid(msg.mentionedJid?.[0] || msg.quoted?.sender);
      if (!target) return msg.reply(`❓ Usage: ${config.prefix}resetwarn @user`);
      const key = `${from}_${target}`;
      if (global.warnData) global.warnData[key] = 0;
      await msg.reply(`✅ Warnings reset for @${target.split('@')[0]}`, { mentions: [target] });
    },
  },
  {
    name: ['kickall', 'removeall', 'massremove'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Kick all non-admin members (owner only)',
    async execute({ sock, msg, from, sender, config }) {
      const { isOwner } = require('../../src/utils/general');
      if (!isOwner(sender)) return msg.reply('👑 Owner only command.');
      await msg.reply('⚠️ _Kicking all non-admin members..._');
      const meta    = await sock.groupMetadata(from);
      const targets = meta.participants
        .filter(p => !p.admin && cleanJid(p.id) !== cleanJid(sock.user.id))
        .map(p => p.id);
      let kicked = 0;
      for (const jid of targets) {
        await sock.groupParticipantsUpdate(from, [jid], 'remove').catch(() => {});
        kicked++;
        await new Promise(r => setTimeout(r, 500));
      }
      await msg.reply(`✅ Kicked ${kicked} members.`);
    },
  },
  {
    name: ['add', 'addmember'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Add a member to the group',
    usage: 'add <number>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}add <number with country code>`);
      const num = text.replace(/[^0-9]/g, '');
      if (!num) return msg.reply('❌ Invalid number');
      const jid = `${num}@s.whatsapp.net`;
      const res = await sock.groupParticipantsUpdate(from, [jid], 'add');
      const status = res?.[0]?.status;
      if (status === '200' || status === 200) {
        await msg.reply(`✅ Added @${num}!`, { mentions: [jid] });
      } else {
        await msg.reply(`❌ Could not add ${num}. They may have privacy settings blocking this. (status: ${status})`);
      }
    },
  },
];
