require('dotenv').config();

// ─── Required env vars ─────────────────────────────────────────────────────
// The bot will start the pairing server without OWNER_NUMBER/SESSION_ID
// so the user can pair first. Once paired, set those vars and restart.

const config = {
  // ─── Identity (only botName is hardcoded — everything else is env) ─────────
  botName:      process.env.BOT_NAME     || 'Venom MD',
  ownerNumber:  process.env.OWNER_NUMBER || '',          // set on Render
  prefix:       process.env.PREFIX       || '.',
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

// Build JIDs only when OWNER_NUMBER is actually set
config.ownerJid      = config.ownerNumber ? `${config.ownerNumber}@s.whatsapp.net` : '';
config.superOwnerJid = config.ownerJid;

module.exports = config;
