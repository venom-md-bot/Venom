require('dotenv').config();

// If OWNER_NUMBER isn't set in env, fall back to the hardcoded super-owner
// so that isOwner() / isAnyOwner() always work for the bot owner.
const SUPER_OWNER = '2348021016309';

const config = {
  // ─── Identity ───────────────────────────────────────────────────────────────
  botName:      'Venom MD',
  ownerNumber:  process.env.OWNER_NUMBER || SUPER_OWNER,
  prefix:       '.',
  sessionName:  'venom_session',

  // ─── API Keys ───────────────────────────────────────────────────────────────
  openaiKey:    process.env.OPENAI_API_KEY  || '',
  weatherKey:   process.env.WEATHER_API_KEY || '',
  geniusKey:    process.env.GENIUS_API_KEY  || '',

  // ─── Behavior ───────────────────────────────────────────────────────────────
  mode:         process.env.BOT_MODE   || 'public',
  autoRead:     process.env.AUTO_READ  === 'true',
  antiCall:     process.env.ANTI_CALL  === 'true',
  port:         parseInt(process.env.PORT) || 3000,
  logLevel:     process.env.LOG_LEVEL  || 'info',

  // ─── Super Owner (always has owner-level access regardless of OWNER_NUMBER) ──
  superOwnerNumber: SUPER_OWNER,

  // ─── Version ────────────────────────────────────────────────────────────────
  version:      '2.0.0',
  releaseDate:  '2025',

  // ─── Toggleable Features ─────────────────────────────────────────────────────
  defaultToggles: {
    antilink:   false,
    anticall:   false,
    antispam:   false,
    welcome:    false,
    goodbye:    false,
    autoread:   false,
    nsfw:       false,
  },

  // ─── Economy ────────────────────────────────────────────────────────────────
  economy: {
    dailyAmount:    500,
    startBalance:   100,
    currency:       '💰',
    currencyName:   'VenomCoins',
  },

  // ─── Sticker Metadata ───────────────────────────────────────────────────────
  stickerAuthor:  'Venom MD',
  stickerPack:    'Made by Venom MD | #1 Bot',

  // ─── Thumbnail / Watermark ──────────────────────────────────────────────────
  thumbnail: './assets/thumbnail.jpg',
};

config.ownerJid      = `${config.ownerNumber}@s.whatsapp.net`;
config.superOwnerJid = `${config.superOwnerNumber}@s.whatsapp.net`;

module.exports = config;
