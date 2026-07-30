const { getAllCommands } = require('../../src/CommandLoader');

// ─── Map existing internal categories → display category ──────────────────────
// Some command categories are renamed/merged for display purposes
const CAT_DISPLAY_MAP = {
  // internal category → display category key
  general:     'help',
  ai:          'ai',
  media:       'downloader',
  sticker:     'converter',
  info:        'search',
  search:      'search',
  anime:       'anime',
  fun:         'fun',
  sick:        'image',       // sick/generators → image; sick/memes → image-meme; sick/textfx → textmaker
  nsfw:        'image',
  group:       'group',
  owner:       'config',
  bot:         'bot',
  ghost:       'privacy',
  impersonate: 'utilities',
  takeover:    'utilities',
  mindgames:   'game',
  antisystem:  'plugins',
};

// Fine-grained remapping by command name
const CMD_DISPLAY_MAP = {
  // image-meme category
  'meme': 'image-meme',
  // textmaker
  'tts': 'textmaker', 'fancy': 'textmaker', 'bold': 'textmaker', 'italic': 'textmaker',
  // economy
  'balance': 'economy', 'daily': 'economy', 'pay': 'economy', 'leaderboard': 'economy',
  'deposit': 'economy', 'withdraw': 'economy', 'work': 'economy', 'beg': 'economy',
  // tools
  'calculator': 'tools', 'calc': 'tools', 'translate': 'tools', 'weather': 'tools',
  // bot control
  'restart': 'process', 'eval': 'process', 'broadcast': 'process',
  'setname': 'bot', 'setbio': 'bot', 'setpp': 'bot', 'autoread': 'bot',
  // user
  'register': 'user', 'profile': 'user', 'stealpp': 'user',
  // privacy
  'ghost': 'privacy', 'fake': 'privacy', 'presence': 'privacy',
  // config
  'mode': 'config', 'prefix': 'config', 'setprefix': 'config',
  // autoreply
  'autoreply': 'autoreply', 'ar': 'autoreply',
  // misc
  'ping': 'help', 'menu': 'help', 'help': 'help',
};

const CAT_META = {
  help:       { icon: '📌', label: 'HELP',       num: 1  },
  ai:         { icon: '🤖', label: 'AI',          num: 2  },
  downloader: { icon: '📥', label: 'DOWNLOADER',  num: 3  },
  converter:  { icon: '🔄', label: 'CONVERTER',   num: 4  },
  search:     { icon: '🔍', label: 'SEARCH',      num: 5  },
  anime:      { icon: '🎌', label: 'ANIME',       num: 6  },
  fun:        { icon: '🎲', label: 'FUN',         num: 7  },
  image:      { icon: '🖼️', label: 'IMAGE',       num: 8  },
  'image-meme': { icon: '😂', label: 'IMAGE-MEME', num: 9 },
  textmaker:  { icon: '✏️', label: 'TEXTMAKER',   num: 10 },
  economy:    { icon: '💰', label: 'ECONOMY',     num: 11 },
  game:       { icon: '🎮', label: 'GAME',        num: 12 },
  group:      { icon: '👥', label: 'GROUP',       num: 13 },
  tools:      { icon: '🔧', label: 'TOOLS',       num: 14 },
  bot:        { icon: '🤖', label: 'BOT',         num: 15 },
  user:       { icon: '👤', label: 'USER',        num: 16 },
  privacy:    { icon: '👻', label: 'PRIVACY',     num: 17 },
  config:     { icon: '⚙️', label: 'CONFIG',      num: 18 },
  plugins:    { icon: '🧩', label: 'PLUGINS',     num: 19 },
  utilities:  { icon: '🛠️', label: 'UTILITIES',   num: 20 },
  autoreply:  { icon: '💬', label: 'AUTOREPLY',   num: 21 },
  process:    { icon: '⚡', label: 'PROCESS',     num: 22 },
  misc:       { icon: '📦', label: 'MISC',        num: 23 },
};

function buildMenu() {
  const all  = getAllCommands();
  const cats = {};

  for (const [name, cmd] of all) {
    const primary = Array.isArray(cmd.name) ? cmd.name[0] : cmd.name;
    if (primary !== name) continue; // skip aliases

    // Determine display category
    const displayCat =
      CMD_DISPLAY_MAP[primary] ||
      CAT_DISPLAY_MAP[cmd.category] ||
      'misc';

    if (!cats[displayCat]) cats[displayCat] = new Set();
    cats[displayCat].add(primary);
  }

  return cats;
}

module.exports = {
  name: ['menu', 'help', 'm', 'h', 'commands'],
  category: 'general',
  description: 'Show all commands',
  async execute({ msg, config, args }) {
    const cats   = buildMenu();
    const prefix = config.prefix;

    // ─── Category-specific help ────────────────────────────────────────────
    if (args[0]) {
      const target = args[0].toLowerCase();
      // Accept display category name or number (e.g. .menu 3)
      const numTarget = parseInt(target);
      const catKey = isNaN(numTarget)
        ? Object.keys(CAT_META).find(k => k === target || CAT_META[k]?.label.toLowerCase() === target)
        : Object.keys(CAT_META).find(k => CAT_META[k].num === numTarget);

      if (!catKey || !cats[catKey]?.size) {
        const avail = Object.keys(CAT_META)
          .filter(k => cats[k]?.size)
          .map(k => `${CAT_META[k].num}. ${CAT_META[k].icon} ${CAT_META[k].label}`)
          .join('\n');
        return msg.reply(`❌ Category *${target}* not found.\n\nAvailable:\n${avail}`);
      }

      const meta  = CAT_META[catKey];
      const cmds  = [...cats[catKey]].sort();
      const lines = cmds.map(c => `• ${prefix}${c}`);
      return msg.reply(`${meta.icon} *${meta.label} Commands (${cmds.length}):*\n\n${lines.join('\n')}`);
    }

    // ─── Full menu ─────────────────────────────────────────────────────────
    const totalCmds = getAllCommands().size;
    let text =
      `╔══════════════════════════════╗\n` +
      `║      🐍 *VENOM MD MENU*       ║\n` +
      `╚══════════════════════════════╝\n\n` +
      `*Bot:* ${config.botName}\n` +
      `*Prefix:* ${prefix}\n` +
      `*Commands:* ${totalCmds}\n` +
      `*Version:* v${config.version}\n\n` +
      `_Type ${prefix}menu <number or name> for details_\n\n`;

    const sortedCats = Object.keys(CAT_META)
      .filter(k => cats[k]?.size)
      .sort((a, b) => (CAT_META[a].num || 99) - (CAT_META[b].num || 99));

    for (const cat of sortedCats) {
      const meta = CAT_META[cat];
      const list = [...cats[cat]].sort();
      text += `${meta.num}. ${meta.icon} *${meta.label}* (${list.length})\n`;
      text += list.map(c => `${prefix}${c}`).join('  ') + '\n\n';
    }

    text +=
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📖 *Tip:* ${prefix}menu <name/number>\n` +
      `_Example: ${prefix}menu downloader_\n\n` +
      `_🐍 Venom MD — The #1 WhatsApp Bot_`;

    await msg.reply(text);
  },
};
