const fs = require('fs-extra');
const path = require('path');

module.exports = {
  name: ['cleardb', 'resetdb'],
  category: 'owner',
  description: 'Clear bot database',
  usage: 'cleardb economy | settings | users',
  ownerOnly: true,
  async execute({ msg, args, config }) {
    const target = args[0]?.toLowerCase();
    const valid  = ['economy', 'settings', 'users'];

    if (!target || !valid.includes(target))
      return msg.reply(`❓ *Usage:* ${config.prefix}cleardb economy | settings | users`);

    const dbPath = path.join(__dirname, `../../database/${target}.json`);
    const defaults = {
      economy:  { users: {} },
      settings: { global: { mode: 'public', anticall: false, autoread: false, banned_users: [] }, groups: {} },
      users:    { registered: {}, whitelist: [], blacklist: [] },
    };

    fs.writeJsonSync(dbPath, defaults[target], { spaces: 2 });
    await msg.reply(`✅ *${target} database has been cleared!*`);
  },
};
