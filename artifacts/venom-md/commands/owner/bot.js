const os = require('os');

// uptime | speed | memory | exec | join | leave | shutdown | gbroadcast
module.exports = [
  {
    name: ['uptime', 'runtime'],
    category: 'owner',
    ownerOnly: true,
    description: 'Show how long the bot has been running',
    async execute({ msg }) {
      const sec   = Math.floor(process.uptime());
      const d     = Math.floor(sec / 86400);
      const h     = Math.floor((sec % 86400) / 3600);
      const m     = Math.floor((sec % 3600) / 60);
      const s     = sec % 60;
      await msg.reply(`⏱️ *Uptime:*\n${d}d ${h}h ${m}m ${s}s`);
    },
  },
  {
    name: ['memory', 'ram'],
    category: 'owner',
    ownerOnly: true,
    description: 'Show RAM usage',
    async execute({ msg }) {
      const used  = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
      const total = (os.totalmem() / 1024 / 1024).toFixed(0);
      const free  = (os.freemem() / 1024 / 1024).toFixed(0);
      await msg.reply(`💾 *Memory:*\nProcess: ${used} MB\nSystem: ${total} MB total / ${free} MB free`);
    },
  },
  {
    name: ['speed', 'latency', 'ms'],
    category: 'owner',
    ownerOnly: true,
    description: 'Test bot response latency',
    async execute({ msg }) {
      const start = Date.now();
      const m     = await msg.reply('🏓 _Pinging..._');
      const ping  = Date.now() - start;
      await msg.reply(`🏓 *Pong!*\n⚡ Latency: *${ping}ms*`);
    },
  },
  {
    name: ['exec', 'shell', 'sh'],
    category: 'owner',
    ownerOnly: true,
    description: 'Execute a shell command (OWNER ONLY)',
    usage: 'exec <command>',
    async execute({ msg, text }) {
      if (!text) return msg.reply('❓ Usage: .exec <shell command>');
      const { exec } = require('child_process');
      await msg.reply('⚙️ _Running..._');
      exec(text, { timeout: 30000 }, async (err, stdout, stderr) => {
        const output = stdout || stderr || (err?.message) || 'No output';
        await msg.reply(`\`\`\`\n${output.slice(0, 3000)}\n\`\`\``);
      });
    },
  },
  {
    name: ['join', 'joingroup'],
    category: 'owner',
    ownerOnly: true,
    description: 'Join a group via invite link',
    usage: 'join <invite link>',
    async execute({ sock, msg, text }) {
      if (!text || !text.includes('chat.whatsapp.com')) {
        return msg.reply('❓ Usage: .join https://chat.whatsapp.com/XXXXX');
      }
      const code = text.split('chat.whatsapp.com/')[1]?.trim();
      if (!code) return msg.reply('❌ Invalid invite link');
      await sock.groupAcceptInvite(code);
      await msg.reply('✅ Joined the group!');
    },
  },
  {
    name: ['leave', 'leavegroup'],
    category: 'owner',
    ownerOnly: true,
    description: 'Leave the current group',
    groupOnly: true,
    async execute({ sock, msg, from }) {
      await msg.reply('👋 _Leaving group..._');
      await sock.groupLeave(from);
    },
  },
  {
    name: ['shutdown', 'die', 'stop'],
    category: 'owner',
    ownerOnly: true,
    description: 'Gracefully shut down the bot',
    async execute({ msg }) {
      await msg.reply('🔴 *Shutting down Venom MD...*\n_Goodbye! 🐍_');
      setTimeout(() => process.exit(0), 2000);
    },
  },
  {
    name: ['gbroadcast', 'groupbroadcast', 'gbcast'],
    category: 'owner',
    ownerOnly: true,
    description: 'Send a message to all groups the bot is in',
    usage: 'gbroadcast <message>',
    async execute({ sock, msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}gbroadcast <message>`);
      await msg.reply('📡 _Broadcasting to all groups..._');
      const groups = await sock.groupFetchAllParticipating();
      const list   = Object.values(groups);
      let sent = 0, failed = 0;
      for (const g of list) {
        try {
          await sock.sendMessage(g.id, {
            text: `📢 *Broadcast from ${config.botName}:*\n\n${text}\n\n_🐍 Venom MD_`,
          });
          sent++;
          await new Promise(r => setTimeout(r, 1000)); // rate limit
        } catch { failed++; }
      }
      await msg.reply(`✅ Broadcast done!\n✅ Sent: ${sent}\n❌ Failed: ${failed}`);
    },
  },
];
