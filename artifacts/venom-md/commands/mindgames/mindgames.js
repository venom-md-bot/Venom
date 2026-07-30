// ngl | bomb | countdown | confuse | riddle | wouldyourather
const axios = require('axios');

const CONFUSE_MSGS = [
  'Did you know that your message is being processed by 47 servers?',
  'I\'ve been watching you type for the past 6 minutes. Very interesting.',
  'Error 404: Your personality not found. Attempting recovery...',
  'Your message has been flagged for being too normal. Please try again.',
  'I\'ve sent your message to the police. Just kidding... or am I? 🤔',
  'Fun fact: You\'ve been in this group for 847 days and said nothing useful.',
  '⚠️ WARNING: This chat is being monitored by 3 government agencies.',
  'Initiating psychological evaluation... please stand by...',
  'Your contact has read your message and laughed for 12 seconds.',
  'This message will self-destruct in 3... 2... 1...',
];

module.exports = [
  {
    name: ['ngl', 'anonymous', 'truth'],
    category: 'mindgames',
    description: 'Send a message saying "Someone in this group says:"',
    usage: 'ngl <message>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}ngl <anonymous message>`);
      try { await sock.sendMessage(from, { delete: msg.key }); } catch {}
      await sock.sendMessage(from, {
        text: `👀 *Someone in this group says:*\n\n"${text}"\n\n_🐍 Anonymous via Venom MD_`,
      });
    },
  },
  {
    name: ['bomb', 'msgbomb', 'flood'],
    category: 'mindgames',
    ownerOnly: true,
    description: 'Send a message multiple times (max 10)',
    usage: 'bomb <count> | <message>',
    async execute({ sock, msg, from, text, config }) {
      if (!text || !text.includes('|')) {
        return msg.reply(`❓ Usage: ${config.prefix}bomb <count 1-10> | <message>`);
      }
      const [countStr, ...msgParts] = text.split('|');
      const count   = Math.min(10, Math.max(1, parseInt(countStr.trim()) || 1));
      const message = msgParts.join('|').trim();
      if (!message) return msg.reply('❌ No message provided.');

      for (let i = 0; i < count; i++) {
        await sock.sendMessage(from, { text: message });
        await new Promise(r => setTimeout(r, 500));
      }
    },
  },
  {
    name: ['countdown', 'timer', 'cdwn'],
    category: 'mindgames',
    description: 'Start a visible countdown in chat',
    usage: 'countdown <seconds> <label>',
    async execute({ sock, msg, from, args, text, config }) {
      const seconds = parseInt(args[0]);
      const label   = args.slice(1).join(' ') || '🎉 Time\'s up!';
      if (!seconds || seconds < 1 || seconds > 60) {
        return msg.reply(`❓ Usage: ${config.prefix}countdown <1-60> <label>\nExample: ${config.prefix}countdown 10 Game starts!`);
      }
      for (let i = seconds; i >= 1; i--) {
        await sock.sendMessage(from, { text: `⏱️ *${i}*${i === 1 ? '\n\n' + label : ''}` });
        await new Promise(r => setTimeout(r, 1000));
      }
    },
  },
  {
    name: ['confuse', 'psych', 'mindfuck'],
    category: 'mindgames',
    description: 'Send a confusing/weird message to mess with someone',
    usage: 'confuse @user',
    async execute({ sock, msg, from, config }) {
      const target = msg.mentionedJid?.[0] || msg.quoted?.sender;
      if (!target) return msg.reply(`❓ Usage: ${config.prefix}confuse @user`);
      const line = CONFUSE_MSGS[Math.floor(Math.random() * CONFUSE_MSGS.length)];
      await sock.sendMessage(from, {
        text: `@${target.split('@')[0]} — ${line}`,
        mentions: [target],
      }, { quoted: msg });
    },
  },
  {
    name: ['riddle', 'puzzle'],
    category: 'mindgames',
    description: 'Send a random riddle',
    async execute({ msg }) {
      const riddles = [
        { q: 'I have cities but no houses, mountains but no trees, water but no fish. What am I?', a: 'A map' },
        { q: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps' },
        { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a: 'An echo' },
        { q: 'What has hands but can\'t clap?', a: 'A clock' },
        { q: 'What can travel around the world while staying in a corner?', a: 'A stamp' },
        { q: 'The more you have of me, the less you see. What am I?', a: 'Darkness' },
        { q: 'I have a head, a tail, but no body. What am I?', a: 'A coin' },
      ];
      const r = riddles[Math.floor(Math.random() * riddles.length)];
      await msg.reply(`🧩 *Riddle:*\n\n${r.q}\n\n_Reply with your answer! Spoiler answer below (scroll right):_\n\`${r.a}\``);
    },
  },
  {
    name: ['wyr', 'wouldyourather', 'wyrc'],
    category: 'mindgames',
    description: 'Send a "Would You Rather" question',
    async execute({ sock, msg, from }) {
      const questions = [
        ['Have the ability to fly', 'Be invisible at will'],
        ['Never use social media again', 'Never watch a movie/series again'],
        ['Always speak your mind', 'Never be able to express feelings'],
        ['Have more money', 'Have more time'],
        ['Be famous', 'Be extremely skilled at everything you do'],
        ['Know when you will die', 'Know how you will die'],
        ['Live 200 years in average health', 'Live 80 years in perfect health'],
      ];
      const q = questions[Math.floor(Math.random() * questions.length)];
      await sock.sendMessage(from, {
        poll: {
          name:            '🤔 Would You Rather?',
          values:          [`✅ ${q[0]}`, `🔴 ${q[1]}`],
          selectableCount: 1,
        },
      }, { quoted: msg });
    },
  },
  {
    name: ['8ball', 'magicball', 'predict'],
    category: 'mindgames',
    description: 'Ask the magic 8-ball',
    usage: '8ball <question>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}8ball <question>`);
      const answers = [
        '🎱 *It is certain.*', '🎱 *It is decidedly so.*', '🎱 *Without a doubt.*',
        '🎱 *Yes, definitely.*', '🎱 *You may rely on it.*', '🎱 *As I see it, yes.*',
        '🎱 *Most likely.*', '🎱 *Outlook good.*', '🎱 *Signs point to yes.*',
        '🎱 *Reply hazy, try again.*', '🎱 *Ask again later.*', '🎱 *Better not tell you now.*',
        '🎱 *Cannot predict now.*', '🎱 *Concentrate and ask again.*',
        '🎱 *Don\'t count on it.*', '🎱 *My reply is no.*', '🎱 *My sources say no.*',
        '🎱 *Outlook not so good.*', '🎱 *Very doubtful.*', '🎱 *Absolutely not.*',
      ];
      const answer = answers[Math.floor(Math.random() * answers.length)];
      await msg.reply(`❓ *${text}*\n\n${answer}`);
    },
  },
];
