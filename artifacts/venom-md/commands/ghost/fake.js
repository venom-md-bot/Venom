// fakereply | faketyping | fakescreenshot
module.exports = [
  {
    name: ['fakereply', 'fr', 'fakeq'],
    category: 'ghost',
    description: 'Send a fake reply as if quoting someone',
    usage: 'fakereply @user | fake message | your reply',
    async execute({ sock, msg, from, text, config }) {
      if (!text || !text.includes('|')) {
        return msg.reply(
          `❓ *Usage:* ${config.prefix}fakereply @user | fake quoted text | your reply\n\n` +
          `*Example:* ${config.prefix}fakereply @someone | Hello world | I never said that 😂`
        );
      }
      const parts = text.split('|').map(s => s.trim());
      if (parts.length < 3) return msg.reply('❓ Need 3 parts separated by |');

      const targetJid = msg.mentionedJid?.[0];
      const fakeQuoteText = parts[1];
      const replyText     = parts[2];

      if (!targetJid) return msg.reply('❓ You must @mention the person you want to fake-quote.');

      await sock.sendMessage(from, {
        text: replyText,
        contextInfo: {
          quotedMessage: {
            conversation: fakeQuoteText,
          },
          participant:      targetJid,
          remoteJid:        from,
          stanzaId:         `FAKE${Date.now()}`,
        },
      }, { quoted: msg });
    },
  },
  {
    name: ['say', 'announce', 'asbot'],
    category: 'ghost',
    description: 'Make the bot say something',
    usage: 'say <message>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}say <message>`);
      // Delete the command message first (best-effort)
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      await sock.sendMessage(from, { text });
    },
  },
  {
    name: ['forward', 'fwd', 'forwardmsg'],
    category: 'ghost',
    description: 'Forward a quoted message to another number/group',
    usage: 'forward <number> (reply to a message)',
    async execute({ sock, msg, text, config }) {
      const quoted = msg.quoted;
      if (!quoted) return msg.reply(`❓ Reply to a message with ${config.prefix}forward <number>`);
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}forward <number>`);
      const num = text.replace(/[^0-9]/g, '');
      if (!num) return msg.reply('❌ Invalid number');
      const jid = num.includes('@') ? num : `${num}@s.whatsapp.net`;
      try {
        await sock.sendMessage(jid, { forward: msg }, { quoted: msg });
        await msg.reply(`✅ Forwarded to ${num}`);
      } catch (err) {
        await msg.reply(`❌ Could not forward: ${err.message}`);
      }
    },
  },
  {
    name: ['delete', 'del', 'unsend'],
    category: 'ghost',
    description: 'Delete a message (reply to it)',
    async execute({ sock, msg, from, config }) {
      const quoted = msg.quoted;
      if (!quoted) return msg.reply(`❓ Reply to the message you want to delete with ${config.prefix}delete`);
      try {
        await sock.sendMessage(from, {
          delete: {
            remoteJid:    from,
            fromMe:       false,
            id:           msg.key.id,
            participant:  quoted.sender,
          },
        });
      } catch (err) {
        await msg.reply(`❌ Could not delete: ${err.message}`);
      }
    },
  },
];
