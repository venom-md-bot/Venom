// online | offline | typing | recording | block | unblock
module.exports = [
  {
    name: ['online', 'setonline'],
    category: 'owner',
    ownerOnly: true,
    description: 'Set bot presence to online/available',
    async execute({ sock, msg, from }) {
      await sock.sendPresenceUpdate('available', from);
      await msg.reply('✅ Bot presence set to *online*');
    },
  },
  {
    name: ['offline', 'setoffline', 'invisible'],
    category: 'owner',
    ownerOnly: true,
    description: 'Set bot presence to offline',
    async execute({ sock, msg, from }) {
      await sock.sendPresenceUpdate('unavailable', from);
      await msg.reply('✅ Bot presence set to *offline*');
    },
  },
  {
    name: ['typing', 'faketyping'],
    category: 'owner',
    ownerOnly: true,
    description: 'Send fake typing indicator in a chat',
    usage: 'typing (in the target chat)',
    async execute({ sock, msg, from }) {
      await sock.sendPresenceUpdate('composing', from);
      await new Promise(r => setTimeout(r, 5000));
      await sock.sendPresenceUpdate('paused', from);
      await msg.reply('✅ Sent typing indicator (5s)');
    },
  },
  {
    name: ['recording', 'fakerecording'],
    category: 'owner',
    ownerOnly: true,
    description: 'Send fake audio recording indicator',
    async execute({ sock, msg, from }) {
      await sock.sendPresenceUpdate('recording', from);
      await new Promise(r => setTimeout(r, 5000));
      await sock.sendPresenceUpdate('paused', from);
      await msg.reply('✅ Sent recording indicator (5s)');
    },
  },
  {
    name: ['block', 'blockuser'],
    category: 'owner',
    ownerOnly: true,
    description: 'Block a WhatsApp number',
    usage: 'block @user or number',
    async execute({ sock, msg, args, text }) {
      let target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target && text) {
        const num = text.replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
      }
      if (!target) return msg.reply('❓ Usage: .block @user');
      await sock.updateBlockStatus(target, 'block');
      await msg.reply(`🚫 Blocked: @${target.split('@')[0]}`);
    },
  },
  {
    name: ['unblock', 'unblockuser'],
    category: 'owner',
    ownerOnly: true,
    description: 'Unblock a WhatsApp number',
    usage: 'unblock @user or number',
    async execute({ sock, msg, text }) {
      let target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target && text) {
        const num = text.replace(/[^0-9]/g, '');
        if (num) target = `${num}@s.whatsapp.net`;
      }
      if (!target) return msg.reply('❓ Usage: .unblock @user');
      await sock.updateBlockStatus(target, 'unblock');
      await msg.reply(`✅ Unblocked: @${target.split('@')[0]}`);
    },
  },
];
