module.exports = {
  name: ['ping', 'speed'],
  category: 'general',
  description: 'Check bot response speed',
  usage: 'ping',
  async execute({ msg }) {
    const start = Date.now();
    await msg.reply('🏓 Pinging...');
    const ms = Date.now() - start;
    await msg.reply(`🏓 *Pong!*\n⚡ Speed: *${ms}ms*\n\n_Venom MD is blazing fast 🐍_`);
  },
};
