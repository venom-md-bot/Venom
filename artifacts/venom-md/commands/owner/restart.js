module.exports = {
  name: ['restart', 'reboot'],
  category: 'owner',
  description: 'Restart the bot',
  usage: 'restart',
  ownerOnly: true,
  async execute({ msg }) {
    await msg.reply('🔄 *Restarting bot...*\n_See you in a moment! 🐍_');
    setTimeout(() => process.exit(0), 2000);
  },
};
