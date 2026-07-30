const sharp = require('sharp');

async function getImageBuffer(msg) {
  const isImage = msg.mtype === 'imageMessage' || msg.quoted?.mtype === 'imageMessage';
  if (!isImage) return null;
  return msg.quoted ? await msg.quoted.download() : await msg.download();
}

// ─── Effect helpers ───────────────────────────────────────────────────────────

async function applyBlur(buf, sigma = 8) {
  return sharp(buf).blur(sigma).toBuffer();
}

async function applyGrayscale(buf) {
  return sharp(buf).grayscale().toBuffer();
}

async function applyNegative(buf) {
  return sharp(buf).negate().toBuffer();
}

async function applySepia(buf) {
  // Approximate sepia with greyscale + warm tint
  return sharp(buf)
    .grayscale()
    .tint({ r: 255, g: 220, b: 180 })
    .toBuffer();
}

async function applyBrightness(buf, factor = 1.4) {
  return sharp(buf).modulate({ brightness: factor }).toBuffer();
}

async function applyContrast(buf) {
  // Boost contrast via linear adjustment
  return sharp(buf).linear(1.5, -(128 * 0.5)).toBuffer();
}

async function applyPixelate(buf, size = 20) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const small = await img.resize(Math.max(1, Math.floor(width / size)), Math.max(1, Math.floor(height / size)), { kernel: 'nearest' }).toBuffer();
  return sharp(small).resize(width, height, { kernel: 'nearest' }).toBuffer();
}

async function applyCircle(buf) {
  const img = sharp(buf);
  const { width, height } = await img.metadata();
  const size  = Math.min(width, height);
  const half  = size / 2;
  const mask  = Buffer.from(
    `<svg><circle cx="${half}" cy="${half}" r="${half}" fill="white"/></svg>`
  );
  return sharp(buf)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();
}

// ─── Command modules ──────────────────────────────────────────────────────────

module.exports = [
  {
    name: ['blur', 'blurimg'],
    category: 'sick',
    description: 'Blur an image',
    usage: 'blur (reply to image)',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}blur`);
      await msg.reply('🎨 _Applying blur..._');
      const out = await applyBlur(buf);
      await sock.sendMessage(from, { image: out, caption: '🌫️ _Blurred — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['grayscale', 'greyscale', 'bw', 'blackwhite'],
    category: 'sick',
    description: 'Convert image to black & white',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}grayscale`);
      const out = await applyGrayscale(buf);
      await sock.sendMessage(from, { image: out, caption: '⬛ _Grayscale — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['negative', 'invert', 'negate'],
    category: 'sick',
    description: 'Invert image colours',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}negative`);
      const out = await applyNegative(buf);
      await sock.sendMessage(from, { image: out, caption: '🔄 _Negative — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['sepia', 'vintage', 'retro'],
    category: 'sick',
    description: 'Apply a sepia/vintage effect',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}sepia`);
      const out = await applySepia(buf);
      await sock.sendMessage(from, { image: out, caption: '🟤 _Sepia — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['brightness', 'brighten'],
    category: 'sick',
    description: 'Brighten an image',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}brightness`);
      const out = await applyBrightness(buf);
      await sock.sendMessage(from, { image: out, caption: '☀️ _Brightened — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['pixelate', 'pixel', 'mosaic'],
    category: 'sick',
    description: 'Pixelate an image',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}pixelate`);
      await msg.reply('🎨 _Pixelating..._');
      const out = await applyPixelate(buf);
      await sock.sendMessage(from, { image: out, caption: '🟫 _Pixelated — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['circle', 'round', 'cropround'],
    category: 'sick',
    description: 'Crop image into a circle (PNG)',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}circle`);
      const out = await applyCircle(buf);
      await sock.sendMessage(from, { image: out, caption: '⭕ _Circle crop — Venom MD_' }, { quoted: msg });
    },
  },
  {
    name: ['stickerblur', 'sblur'],
    category: 'sick',
    description: 'Turn a blurred image into a sticker',
    async execute({ sock, msg, from, config }) {
      const buf = await getImageBuffer(msg);
      if (!buf) return msg.reply(`❓ Reply to an image with ${config.prefix}stickerblur`);
      const blurred = await applyBlur(buf);
      const sticker = await sharp(blurred).resize(512, 512, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } }).webp({ quality: 80 }).toBuffer();
      await sock.sendMessage(from, { sticker }, { quoted: msg });
    },
  },
];
