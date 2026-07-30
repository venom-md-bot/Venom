// hidetag | tagadmins | mention | everyone
module.exports = [
  {
    name: ['hidetag', 'ht', 'stag'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Tag all members silently (no visible @mentions)',
    usage: 'hidetag <message>',
    async execute({ sock, msg, from, text, config }) {
      const message = text || '📢 Attention everyone!';
      const meta = await sock.groupMetadata(from);
      const jids = meta.participants.map(p => p.id);
      await sock.sendMessage(from, {
        text: message,
        mentions: jids,
      }, { quoted: msg });
    },
  },
  {
    name: ['tagadmins', 'mentionadmins', 'admintag'],
    category: 'group',
    groupOnly: true,
    description: 'Tag only group admins',
    usage: 'tagadmins <message>',
    async execute({ sock, msg, from, text }) {
      const meta   = await sock.groupMetadata(from);
      const admins = meta.participants.filter(p => p.admin).map(p => p.id);
      if (!admins.length) return msg.reply('ℹ️ No admins found in this group.');
      const message = text || '📢 Attention admins!';
      const names   = admins.map(j => `@${j.split('@')[0]}`).join(' ');
      await sock.sendMessage(from, {
        text: `${message}\n\n${names}`,
        mentions: admins,
      }, { quoted: msg });
    },
  },
  {
    name: ['everyone', 'all', '@all'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Tag everyone with a message',
    usage: 'everyone <message>',
    async execute({ sock, msg, from, text }) {
      const meta  = await sock.groupMetadata(from);
      const jids  = meta.participants.map(p => p.id);
      const names = jids.map(j => `@${j.split('@')[0]}`).join(' ');
      const line  = text || '📢 Attention everyone!';
      await sock.sendMessage(from, {
        text: `${line}\n\n${names}`,
        mentions: jids,
      }, { quoted: msg });
    },
  },
  {
    name: ['members', 'listmembers', 'participants'],
    category: 'group',
    groupOnly: true,
    description: 'List all group members',
    async execute({ sock, msg, from }) {
      const meta    = await sock.groupMetadata(from);
      const parts   = meta.participants;
      const admins  = parts.filter(p => p.admin).map(p => `👑 @${p.id.split('@')[0]}`);
      const members = parts.filter(p => !p.admin).map(p => `👤 @${p.id.split('@')[0]}`);
      const all = [...admins, ...members];
      await msg.reply(
        `👥 *${meta.subject}*\n` +
        `Total: ${parts.length} members (${admins.length} admins)\n\n` +
        all.slice(0, 50).join('\n') +
        (all.length > 50 ? `\n_...and ${all.length - 50} more_` : '')
      );
    },
  },
  {
    name: ['admins', 'listadmins', 'groupadmins'],
    category: 'group',
    groupOnly: true,
    description: 'List all group admins',
    async execute({ sock, msg, from }) {
      const meta   = await sock.groupMetadata(from);
      const admins = meta.participants.filter(p => p.admin);
      if (!admins.length) return msg.reply('ℹ️ No admins in this group (somehow).');
      const list = admins.map((p, i) => `${i + 1}. @${p.id.split('@')[0]} (${p.admin})`).join('\n');
      await msg.reply(`👑 *Group Admins (${admins.length}):*\n\n${list}`);
    },
  },
];
