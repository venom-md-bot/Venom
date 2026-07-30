module.exports = {
  name: ['mute', 'unmute'],
  category: 'group',
  description: 'Mute or unmute group (only admins can send messages)',
  usage: 'mute | unmute',
  groupOnly: true,
  adminOnly: true,
  async execute({ sock, msg, from, command }) {
    const isMute = command === 'mute';
    await sock.groupSettingUpdate(from, isMute ? 'announcement' : 'not_announcement');
    await msg.reply(isMute
      ? '🔇 *Group has been muted!*\n_Only admins can send messages._'
      : '🔊 *Group has been unmuted!*\n_Everyone can send messages._'
    );
  },
};
