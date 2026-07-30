module.exports = {
  name: ['broadcast', 'bc'],
  category: 'owner',
  description: 'Broadcast a message to all groups',
  usage: 'broadcast <message>',
  ownerOnly: true,
  async execute({ sock, msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}broadcast <message>`);

    const groups = await sock.groupFetchAllParticipating();
    const jids   = Object.keys(groups);

    let sent = 0;
    for (const jid of jids) {
      try {
        await sock.sendMessage(jid, { text: `📢 *Broadcast from ${config.botName}:*\n\n${text}` });
        sent++;
      } catch {}
    }

    await msg.reply(`✅ *Broadcast sent to ${sent}/${jids.length} groups.*`);
  },
};
