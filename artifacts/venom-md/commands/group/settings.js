// open | close | subject | desc | revoke | groupiconset
module.exports = [
  {
    name: ['open', 'opengroup', 'unlock'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Open group (allow all members to send messages)',
    async execute({ sock, msg, from }) {
      await sock.groupSettingUpdate(from, 'not_announcement');
      await msg.reply('✅ Group is now *open* — all members can send messages.');
    },
  },
  {
    name: ['close', 'closegroup', 'lock'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Close group (only admins can send messages)',
    async execute({ sock, msg, from }) {
      await sock.groupSettingUpdate(from, 'announcement');
      await msg.reply('🔒 Group is now *closed* — only admins can send messages.');
    },
  },
  {
    name: ['subject', 'rename', 'setsubject', 'groupname'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Change the group name/subject',
    usage: 'subject <new name>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}subject <new group name>`);
      await sock.groupUpdateSubject(from, text);
      await msg.reply(`✅ Group name changed to: *${text}*`);
    },
  },
  {
    name: ['desc', 'setdesc', 'description', 'groupdesc'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Change the group description',
    usage: 'desc <new description>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}desc <new description>`);
      await sock.groupUpdateDescription(from, text);
      await msg.reply(`✅ Group description updated!`);
    },
  },
  {
    name: ['revoke', 'resetlink', 'newlink'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Revoke and generate a new group invite link',
    async execute({ sock, msg, from }) {
      const newCode = await sock.groupRevokeInvite(from);
      await msg.reply(`🔗 *New Group Link:*\nhttps://chat.whatsapp.com/${newCode}\n\n_Old link has been revoked._`);
    },
  },
  {
    name: ['setgroupicon', 'setgicon', 'grouppp'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Set the group profile picture',
    usage: 'setgroupicon (reply to image)',
    async execute({ sock, msg, from }) {
      const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
      if (!isImage) return msg.reply('❓ Reply to an image with .setgroupicon');
      const buffer = msg.quoted ? await msg.quoted.download() : await msg.download();
      await sock.updateProfilePicture(from, buffer);
      await msg.reply('✅ Group profile picture updated!');
    },
  },
  {
    name: ['editpermissions', 'editperms'],
    category: 'group',
    groupOnly: true,
    adminOnly: true,
    description: 'Toggle who can edit group info (admins only / all)',
    usage: 'editperms on/off',
    async execute({ sock, msg, from, text }) {
      const val = text?.toLowerCase();
      if (val === 'on' || val === 'admin') {
        await sock.groupSettingUpdate(from, 'locked');
        await msg.reply('🔒 Only admins can edit group info now.');
      } else if (val === 'off' || val === 'all') {
        await sock.groupSettingUpdate(from, 'unlocked');
        await msg.reply('🔓 All members can edit group info now.');
      } else {
        await msg.reply('❓ Usage: .editperms on/off');
      }
    },
  },
];
