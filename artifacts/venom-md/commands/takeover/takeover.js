const { cleanJid, isOwner } = require('../../src/utils/general');

// takeover | promoteall | demoteall | ghostleave | inviteall
module.exports = [
  {
    name: ['takeover', 'grouptakeover', 'steal'],
    category: 'takeover',
    groupOnly: true,
    ownerOnly: true,
    description: 'Promote bot to admin & demote all other admins',
    async execute({ sock, msg, from, sender }) {
      await msg.reply('⚔️ _Initiating takeover..._');
      try {
        const meta    = await sock.groupMetadata(from);
        const botJid  = cleanJid(sock.user.id);
        const others  = meta.participants
          .filter(p => p.admin && cleanJid(p.id) !== botJid && !isOwner(cleanJid(p.id)));

        if (others.length) {
          await sock.groupParticipantsUpdate(from, others.map(p => p.id), 'demote').catch(() => {});
        }
        await sock.groupParticipantsUpdate(from, [botJid], 'promote').catch(() => {});
        await msg.reply(
          `👑 *Takeover complete!*\n` +
          `✅ Bot promoted to admin.\n` +
          `🔽 Demoted ${others.length} other admin(s).\n\n` +
          `_Venom MD now controls this group 🐍_`
        );
      } catch (err) {
        await msg.reply(`❌ Takeover failed: ${err.message}\n_Make sure I'm an admin first._`);
      }
    },
  },
  {
    name: ['promoteall', 'adminall'],
    category: 'takeover',
    groupOnly: true,
    ownerOnly: true,
    description: 'Promote all group members to admin',
    async execute({ sock, msg, from }) {
      await msg.reply('⬆️ _Promoting all members..._');
      const meta    = await sock.groupMetadata(from);
      const targets = meta.participants.filter(p => !p.admin).map(p => p.id);
      let done = 0;
      for (const jid of targets) {
        await sock.groupParticipantsUpdate(from, [jid], 'promote').catch(() => {});
        done++;
        await new Promise(r => setTimeout(r, 400));
      }
      await msg.reply(`✅ Promoted ${done} members to admin.`);
    },
  },
  {
    name: ['demoteall', 'removeadmins'],
    category: 'takeover',
    groupOnly: true,
    ownerOnly: true,
    description: 'Demote all admins (except bot owner)',
    async execute({ sock, msg, from, sender }) {
      await msg.reply('⬇️ _Demoting all admins..._');
      const meta    = await sock.groupMetadata(from);
      const botJid  = cleanJid(sock.user.id);
      const targets = meta.participants
        .filter(p => p.admin && cleanJid(p.id) !== botJid && !isOwner(cleanJid(p.id)))
        .map(p => p.id);
      let done = 0;
      for (const jid of targets) {
        await sock.groupParticipantsUpdate(from, [jid], 'demote').catch(() => {});
        done++;
        await new Promise(r => setTimeout(r, 400));
      }
      await msg.reply(`✅ Demoted ${done} admin(s).`);
    },
  },
  {
    name: ['ghostleave', 'silentleave'],
    category: 'takeover',
    groupOnly: true,
    ownerOnly: true,
    description: 'Leave group silently without goodbye message',
    async execute({ sock, msg, from }) {
      // Delete command message then leave
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      await new Promise(r => setTimeout(r, 1000));
      await sock.groupLeave(from);
    },
  },
  {
    name: ['inviteall', 'addallcontacts'],
    category: 'takeover',
    groupOnly: true,
    ownerOnly: true,
    description: 'Send group invite link to all group members (DM)',
    async execute({ sock, msg, from, config }) {
      await msg.reply('📨 _Sending invite links..._');
      const meta    = await sock.groupMetadata(from);
      const code    = await sock.groupInviteCode(from);
      const link    = `https://chat.whatsapp.com/${code}`;
      let sent = 0, failed = 0;
      for (const p of meta.participants) {
        const jid = p.id;
        if (cleanJid(jid) === cleanJid(sock.user.id)) continue;
        try {
          await sock.sendMessage(jid, {
            text: `📩 *Group Invite*\nYou've been invited to *${meta.subject}*!\n\n${link}\n\n_Sent by ${config.botName} 🐍_`,
          });
          sent++;
          await new Promise(r => setTimeout(r, 800));
        } catch { failed++; }
      }
      await msg.reply(`✅ Invites sent: ${sent}\n❌ Failed: ${failed}`);
    },
  },
];
