const axios = require('axios');

// mimic | copypp | stealname | nametag | anon
module.exports = [
  {
    name: ['mimic', 'impersonate', 'copyuser'],
    category: 'impersonate',
    ownerOnly: true,
    description: 'Temporarily copy someone\'s name and PP (bot changes its identity)',
    usage: 'mimic @user',
    async execute({ sock, msg, text, config }) {
      const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target) return msg.reply(`❓ Usage: ${config.prefix}mimic @user`);

      await msg.reply('🎭 _Copying identity..._');
      try {
        // Get their name
        const meta = await sock.onWhatsApp(target).catch(() => null);
        const name = msg.quoted?.pushName || meta?.[0]?.notify || target.split('@')[0];

        // Get their PP
        const ppUrl = await sock.profilePictureUrl(target, 'image').catch(() => null);
        if (ppUrl) {
          const { fetchBuffer } = require('../../src/utils/media');
          const buf = await fetchBuffer(ppUrl);
          await sock.updateProfilePicture(sock.user.id, buf).catch(() => {});
        }

        await sock.updateProfileName(name).catch(() => {});
        await msg.reply(`🎭 *Identity copied!*\nNow acting as: *${name}*\n\n_Use .resetidentity to restore._`);
      } catch (err) {
        await msg.reply(`❌ Error: ${err.message}`);
      }
    },
  },
  {
    name: ['resetidentity', 'unmimic', 'restoreid'],
    category: 'impersonate',
    ownerOnly: true,
    description: 'Restore bot\'s original name and profile picture',
    async execute({ sock, msg, config }) {
      await sock.updateProfileName(config.botName).catch(() => {});
      await sock.removeProfilePicture(sock.user.id).catch(() => {});
      await msg.reply(`✅ Identity restored to *${config.botName}*`);
    },
  },
  {
    name: ['stealpp', 'copypp', 'getpp'],
    category: 'impersonate',
    description: 'Get and send someone\'s profile picture',
    usage: 'stealpp @user',
    async execute({ sock, msg, from, text, config }) {
      const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target) {
        const num = text?.replace(/[^0-9]/g, '');
        if (!num) return msg.reply(`❓ Usage: ${config.prefix}stealpp @user`);
      }
      const jid = target || `${text.replace(/[^0-9]/g, '')}@s.whatsapp.net`;
      try {
        const ppUrl = await sock.profilePictureUrl(jid, 'image');
        const { fetchBuffer } = require('../../src/utils/media');
        const buf = await fetchBuffer(ppUrl);
        await sock.sendMessage(from, {
          image:   buf,
          caption: `🖼️ *Profile Picture*\n@${jid.split('@')[0]}\n\n_Venom MD 🐍_`,
          mentions: [jid],
        }, { quoted: msg });
      } catch {
        await msg.reply('❌ Could not get profile picture. They may have privacy enabled.');
      }
    },
  },
  {
    name: ['anon', 'anonymous', 'anonmsg'],
    category: 'impersonate',
    description: 'Send an anonymous message to someone',
    usage: 'anon <number> | <message>',
    async execute({ sock, msg, text, config }) {
      if (!text || !text.includes('|')) {
        return msg.reply(`❓ Usage: ${config.prefix}anon <number> | <message>\nExample: ${config.prefix}anon 2348021016309 | Hey there! 👀`);
      }
      const [numPart, ...msgParts] = text.split('|');
      const num = numPart.trim().replace(/[^0-9]/g, '');
      const message = msgParts.join('|').trim();
      if (!num || !message) return msg.reply('❌ Invalid format. Include a number and message.');
      const jid = `${num}@s.whatsapp.net`;
      try {
        await sock.sendMessage(jid, {
          text: `📩 *Anonymous Message:*\n\n${message}\n\n_Sent via Venom MD 🐍_`,
        });
        await msg.reply(`✅ Anonymous message sent to ${num}`);
      } catch (err) {
        await msg.reply(`❌ Could not send: ${err.message}`);
      }
    },
  },
];
