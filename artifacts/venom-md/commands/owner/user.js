const { cleanJid } = require('../../src/utils/general');

// unban | banlist | whitelist | unwhitelist | addowner | removeowner
module.exports = [
  {
    name: ['unban', 'pardon'],
    category: 'owner',
    ownerOnly: true,
    description: 'Remove a ban from a user',
    usage: 'unban @user',
    async execute({ msg, text }) {
      const { Settings } = require('../../src/Database');
      let target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target && text) {
        const num = text.replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
      }
      if (!target) return msg.reply('❓ Usage: .unban @user');
      target = cleanJid(target);
      Settings.unban(target);
      await msg.reply(`✅ @${target.split('@')[0]} has been unbanned.`);
    },
  },
  {
    name: ['banlist', 'banned', 'bans'],
    category: 'owner',
    ownerOnly: true,
    description: 'Show all banned users',
    async execute({ msg }) {
      const { Settings } = require('../../src/Database');
      const db      = Settings.get();
      const banned  = db.global.banned_users || [];
      if (!banned.length) return msg.reply('✅ No users are currently banned.');
      const list = banned.map((j, i) => `${i + 1}. @${j.split('@')[0]}`).join('\n');
      await msg.reply(`🚫 *Banned Users (${banned.length}):*\n\n${list}`);
    },
  },
  {
    name: ['whitelist', 'wl', 'addwl'],
    category: 'owner',
    ownerOnly: true,
    description: 'Whitelist a user (bypasses private mode)',
    usage: 'whitelist @user',
    async execute({ msg, text }) {
      const { Users } = require('../../src/Database');
      let target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target && text) {
        const num = text.replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
      }
      if (!target) return msg.reply('❓ Usage: .whitelist @user');
      target = cleanJid(target);
      Users.whitelist(target);
      await msg.reply(`✅ @${target.split('@')[0]} added to whitelist.`);
    },
  },
  {
    name: ['unwhitelist', 'unwl', 'removewl'],
    category: 'owner',
    ownerOnly: true,
    description: 'Remove a user from the whitelist',
    async execute({ msg, text }) {
      const { Users } = require('../../src/Database');
      let target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target && text) {
        const num = text.replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
      }
      if (!target) return msg.reply('❓ Usage: .unwhitelist @user');
      target = cleanJid(target);
      Users.removeWhitelist(target);
      await msg.reply(`✅ @${target.split('@')[0]} removed from whitelist.`);
    },
  },
  {
    name: ['whitelistlist', 'wllist', 'whitelisted'],
    category: 'owner',
    ownerOnly: true,
    description: 'Show all whitelisted users',
    async execute({ msg }) {
      const { Users } = require('../../src/Database');
      const db   = Users.getAll ? Users.getAll() : {};
      const list = require('../../src/Database').Users;
      // Read raw
      const fs   = require('fs-extra');
      const path = require('path');
      const data = fs.readJsonSync(path.join(__dirname, '../../database/users.json'), { throws: false }) || {};
      const wl   = data.whitelist || [];
      if (!wl.length) return msg.reply('ℹ️ Whitelist is empty.');
      await msg.reply(`✅ *Whitelisted Users (${wl.length}):*\n\n${wl.map((j,i) => `${i+1}. @${j.split('@')[0]}`).join('\n')}`);
    },
  },
  {
    name: ['listgroups', 'groups', 'grouplist'],
    category: 'owner',
    ownerOnly: true,
    description: 'List all groups the bot is in',
    async execute({ sock, msg }) {
      try {
        const groups = await sock.groupFetchAllParticipating();
        const list   = Object.values(groups);
        if (!list.length) return msg.reply('ℹ️ Bot is not in any groups.');
        const text = list.map((g, i) => `${i + 1}. *${g.subject}*\n   ID: ${g.id}\n   Members: ${g.participants.length}`).join('\n\n');
        await msg.reply(`👥 *Groups (${list.length}):*\n\n${text}`);
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
];
