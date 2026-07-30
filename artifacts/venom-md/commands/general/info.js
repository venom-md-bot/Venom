const os  = require('os');
const { msToTime } = require('../../src/utils/general');

module.exports = {
  name: ['info', 'botinfo'],
  category: 'general',
  description: 'Show bot information',
  usage: 'info',
  async execute({ msg, config }) {
    const uptime  = msToTime(process.uptime() * 1000);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem  = (os.freemem()  / 1024 / 1024 / 1024).toFixed(2);
    const usedMem  = (totalMem - freeMem).toFixed(2);

    const text = `╔══════════════════════╗\n║   *🐍 VENOM MD INFO*   ║\n╚══════════════════════╝\n\n` +
      `*🤖 Bot Name:* ${config.botName}\n` +
      `*🔖 Version:* v${config.version}\n` +
      `*⏱️ Uptime:* ${uptime}\n` +
      `*💾 RAM:* ${usedMem} GB / ${totalMem} GB\n` +
      `*🖥️ Platform:* ${os.platform()} ${os.arch()}\n` +
      `*⚙️ Node.js:* ${process.version}\n` +
      `*🔧 Prefix:* ${config.prefix}\n` +
      `*🌍 Mode:* ${config.mode}\n\n` +
      `> _🐍 Venom MD — The #1 WhatsApp Bot_`;

    await msg.reply(text);
  },
};
