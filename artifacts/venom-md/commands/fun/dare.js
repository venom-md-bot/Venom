const { pickRandom } = require('../../src/utils/general');

const truths = [
  "What's your biggest fear?", "Have you ever lied to your best friend?",
  "What's the most embarrassing thing you've done?", "Who was your first crush?",
  "What's a secret you've never told anyone?", "Have you ever cheated on a test?",
  "What's the worst thing you've ever done?", "Who do you have a crush on right now?",
  "What's your most embarrassing memory?", "Have you ever stolen anything?",
];

const dares = [
  "Send a selfie right now!", "Change your profile picture to something funny for 24h.",
  "Tell the group a funny story about yourself.", "Voice note singing your favorite song.",
  "Tag 3 people you trust the most.", "Send your most recent photo from your gallery.",
  "Write a love message to the last person you texted.", "Do 10 pushups and prove it.",
  "Tell everyone your middle name.", "Admit your guilty pleasure show/movie.",
];

module.exports = {
  name: ['dare', 'truth', 'tord'],
  category: 'fun',
  description: 'Truth or Dare!',
  usage: 'truth | dare',
  async execute({ msg, command }) {
    if (command === 'truth') {
      await msg.reply(`🤫 *TRUTH!*\n\n${pickRandom(truths)}\n\n> _Venom MD Fun 🐍_`);
    } else {
      await msg.reply(`😈 *DARE!*\n\n${pickRandom(dares)}\n\n> _Venom MD Fun 🐍_`);
    }
  },
};
