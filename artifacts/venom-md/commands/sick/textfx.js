// Text effect commands: fancy | tiny | bubble | aesthetic | flip | reverse | morse | binary | cursed | vaporwave | bold | italic

// ─── Transformation maps ─────────────────────────────────────────────────────

const fancy = s => s.split('').map(c => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0xFF01 + code - 33); // A-Z fullwidth
  if (code >= 97 && code <= 122) return String.fromCodePoint(0xFF01 + code - 33); // a-z fullwidth
  if (code >= 48 && code <= 57) return String.fromCodePoint(0xFF10 + code - 48);  // 0-9 fullwidth
  return c;
}).join('');

const TINY_MAP = { a:'ᵃ',b:'ᵇ',c:'ᶜ',d:'ᵈ',e:'ᵉ',f:'ᶠ',g:'ᵍ',h:'ʰ',i:'ⁱ',j:'ʲ',k:'ᵏ',l:'ˡ',m:'ᵐ',n:'ⁿ',o:'ᵒ',p:'ᵖ',q:'ꟴ',r:'ʳ',s:'ˢ',t:'ᵗ',u:'ᵘ',v:'ᵛ',w:'ʷ',x:'ˣ',y:'ʸ',z:'ᶻ',A:'ᴬ',B:'ᴮ',C:'ᶜ',D:'ᴰ',E:'ᴱ',F:'ᶠ',G:'ᴳ',H:'ᴴ',I:'ᴵ',J:'ᴶ',K:'ᴷ',L:'ᴸ',M:'ᴹ',N:'ᴺ',O:'ᴼ',P:'ᴾ',Q:'Q',R:'ᴿ',S:'ˢ',T:'ᵀ',U:'ᵁ',V:'ᵛ',W:'ᵂ',X:'ˣ',Y:'ʸ',Z:'ᶻ' };
const tiny = s => s.split('').map(c => TINY_MAP[c] || c).join('');

const BUBBLE_MAP = { a:'ⓐ',b:'ⓑ',c:'ⓒ',d:'ⓓ',e:'ⓔ',f:'ⓕ',g:'ⓖ',h:'ⓗ',i:'ⓘ',j:'ⓙ',k:'ⓚ',l:'ⓛ',m:'ⓜ',n:'ⓝ',o:'ⓞ',p:'ⓟ',q:'ⓠ',r:'ⓡ',s:'ⓢ',t:'ⓣ',u:'ⓤ',v:'ⓥ',w:'ⓦ',x:'ⓧ',y:'ⓨ',z:'ⓩ',A:'Ⓐ',B:'Ⓑ',C:'Ⓒ',D:'Ⓓ',E:'Ⓔ',F:'Ⓕ',G:'Ⓖ',H:'Ⓗ',I:'Ⓘ',J:'Ⓙ',K:'Ⓚ',L:'Ⓛ',M:'Ⓜ',N:'Ⓝ',O:'Ⓞ',P:'Ⓟ',Q:'Ⓠ',R:'Ⓡ',S:'Ⓢ',T:'Ⓣ',U:'Ⓤ',V:'Ⓥ',W:'Ⓦ',X:'Ⓧ',Y:'Ⓨ',Z:'Ⓩ' };
const bubble = s => s.split('').map(c => BUBBLE_MAP[c] || c).join('');

const aesthetic = s => s.split('').join(' ');

const FLIP_MAP = { a:'ɐ',b:'q',c:'ɔ',d:'p',e:'ǝ',f:'ɟ',g:'ƃ',h:'ɥ',i:'ᴉ',j:'ɾ',k:'ʞ',l:'l',m:'ɯ',n:'u',o:'o',p:'d',q:'b',r:'ɹ',s:'s',t:'ʇ',u:'n',v:'ʌ',w:'ʍ',x:'x',y:'ʎ',z:'z',A:'∀',B:'ᗺ',C:'Ɔ',D:'ᗡ',E:'Ǝ',F:'Ⅎ',G:'פ',H:'H',I:'I',J:'ſ',K:'ʞ',L:'˥',M:'W',N:'N',O:'O',P:'Ԁ',Q:'Q',R:'ᴚ',S:'S',T:'┴',U:'∩',V:'Λ',W:'M',X:'X',Y:'⅄',Z:'Z','1':'⇂','2':'ᄅ','3':'Ɛ','4':'ㄣ','5':'ϛ','6':'9','7':'ㄥ','8':'8','9':'6','0':'0','!':'¡','?':'¿','&':'⅋','.':'˙',',':'\'','(':')',')'  :'(' };
const flip = s => s.split('').map(c => FLIP_MAP[c] || c).reverse().join('');

const reverse = s => s.split('').reverse().join('');

const MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.' };
const morse = s => s.toUpperCase().split('').map(c => c === ' ' ? '/' : (MORSE[c] || c)).join(' ');

const binary = s => s.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

const ZALGO_UP = ['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓','̈','͊','͋','͌','̃','̂','̌','͐','̀','́','̋','̏','̒','̓','̔','̽','̉','ͅ','͇','͈','͉','͍','͎','̮','̺','̟','̞','̬','̪','̹','̫'];
const cursed = s => s.split('').map(c => {
  if (c === ' ') return c;
  let r = c;
  for (let i = 0; i < 3; i++) r += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
  return r;
}).join('');

const vaporwave = s => s.toUpperCase().split('').map(c => {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCodePoint(0xFF01 + code - 33);
  return c;
}).join(' ');

// ─── Command modules ─────────────────────────────────────────────────────────

module.exports = [
  {
    name: ['fancy', 'fullwidth', 'fw'],
    category: 'sick',
    description: 'Convert text to fancy fullwidth style',
    usage: 'fancy <text>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}fancy <text>`);
      await msg.reply(fancy(text));
    },
  },
  {
    name: ['tiny', 'small', 'superscript'],
    category: 'sick',
    description: 'Convert text to tiny superscript',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}tiny <text>`);
      await msg.reply(tiny(text));
    },
  },
  {
    name: ['bubble', 'circle', 'circled'],
    category: 'sick',
    description: 'Convert text to bubble/circled letters',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}bubble <text>`);
      await msg.reply(bubble(text));
    },
  },
  {
    name: ['aesthetic', 'ae', 'spaced'],
    category: 'sick',
    description: 'Space out letters aesthetically',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}aesthetic <text>`);
      await msg.reply(aesthetic(text));
    },
  },
  {
    name: ['flip', 'upsidedown', 'ud'],
    category: 'sick',
    description: 'Flip text upside down',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}flip <text>`);
      await msg.reply(flip(text));
    },
  },
  {
    name: ['reverse', 'rev', 'backwards'],
    category: 'sick',
    description: 'Reverse the text',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}reverse <text>`);
      await msg.reply(reverse(text));
    },
  },
  {
    name: ['morse', 'morsecode'],
    category: 'sick',
    description: 'Convert text to Morse code',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}morse <text>`);
      await msg.reply(`🔡 *Morse Code:*\n${morse(text)}`);
    },
  },
  {
    name: ['binary', 'bin', 'tobin'],
    category: 'sick',
    description: 'Convert text to binary',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}binary <text>`);
      if (text.length > 100) return msg.reply('❌ Text too long (max 100 chars)');
      await msg.reply(`💻 *Binary:*\n${binary(text)}`);
    },
  },
  {
    name: ['cursed', 'zalgo', 'glitch'],
    category: 'sick',
    description: 'Make text look cursed/glitched',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}cursed <text>`);
      await msg.reply(cursed(text));
    },
  },
  {
    name: ['vaporwave', 'vapor', 'vw'],
    category: 'sick',
    description: 'Convert text to vaporwave aesthetic',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}vaporwave <text>`);
      await msg.reply(vaporwave(text));
    },
  },
];
