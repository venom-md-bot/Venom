const config   = require('../config');
const logger   = require('./Logger');
const { serialize } = require('../lib/serialize');
const { getCommand } = require('./CommandLoader');
const { Settings } = require('./Database');
const { isAnyOwner, cleanJid } = require('./utils/general');

// ─── Message cache for anti-delete ─────────────────────────────────────────
if (!global.msgCache)  global.msgCache  = new Map();
if (!global.warnData)  global.warnData  = {};
if (!global.spamMap)   global.spamMap   = new Map();

const MSG_CACHE_TTL = 30 * 60 * 1000; // keep messages 30 minutes

function cacheMessage(msg) {
  global.msgCache.set(msg.key.id, {
    key:       msg.key,
    from:      msg.key.remoteJid,
    message:   msg.message,
    pushName:  msg.pushName,
    timestamp: Date.now(),
  });
  // Prune old entries (keep cache under ~500 msgs)
  if (global.msgCache.size > 500) {
    const oldest = [...global.msgCache.entries()]
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, 100);
    for (const [k] of oldest) global.msgCache.delete(k);
  }
}

// ─── Bad-words list (for anti-swear) ───────────────────────────────────────
const BAD_WORDS = ['fuck', 'shit', 'bitch', 'asshole', 'bastard', 'slut', 'whore', 'nigger'];

async function handleMessage(sock, rawMsg) {
  // ─── Deserialise ───────────────────────────────────────────────────────────
  let msg;
  try {
    msg = serialize(sock, rawMsg);
  } catch (err) {
    logger.error(`serialize() failed: ${err.message}`);
    return;
  }

  if (!msg || !msg.message) {
    logger.info(`[EH] DROP: serialize returned empty`);
    return;
  }

  // Cache for anti-delete
  cacheMessage(rawMsg);

  const { from, sender, isGroup, isCmd, command, body } = msg;
  const senderJid = cleanJid(sender);

  logger.info(`[EH] from=${from} group=${isGroup} sender=${senderJid} body=${JSON.stringify(body)} isCmd=${isCmd} cmd=${command}`);

  // Allow owner to send commands from their own device (fromMe = true).
  // Block other fromMe messages (bot's own replies) so they don't loop.
  if (msg.key.fromMe && !msg.isCmd) {
    logger.info(`[EH] DROP: fromMe non-command`);
    return;
  }

  // ─── Auto-read ─────────────────────────────────────────────────────────────
  try {
    if (!global.ghostMode && (config.autoRead || Settings.getGlobal('autoread'))) {
      await sock.readMessages([msg.key]);
    }
  } catch {}

  // ─── Ban check ─────────────────────────────────────────────────────────────
  try {
    if (Settings.isBanned(senderJid) && !isAnyOwner(senderJid)) {
      logger.info(`[EH] DROP: banned user ${senderJid}`);
      return;
    }
  } catch (err) {
    logger.warn(`Ban-check failed: ${err.message}`);
  }

  if (isGroup) {
    // ─── Anti-viewonce: forward view-once media to owner privately ─────────
    try {
      const msgKeys = Object.keys(rawMsg.message || {});
      const isVO = msgKeys.some(k => k.startsWith('viewOnce'));
      if (isVO && Settings.getGroupKey(from, 'antiviewonce')) {
        const ownerJid = config.ownerJid;
        await sock.sendMessage(ownerJid, {
          text:
            `👁️ *Anti-ViewOnce Alert*\n` +
            `Group: ${from}\n` +
            `From: @${senderJid.split('@')[0]}\n\n` +
            `_Use .vv and reply to the message to view it._`,
        });
      }
    } catch {}

    // ─── Anti-link ────────────────────────────────────────────────────────
    try {
      const antilinkEnabled = Settings.getGroupKey(from, 'antilink');
      if (antilinkEnabled) {
        const urlRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi;
        if (urlRegex.test(body) && !isAnyOwner(senderJid)) {
          const meta           = await sock.groupMetadata(from);
          const isSenderAdmin  = meta.participants.find(p => cleanJid(p.id) === senderJid)?.admin;
          if (!isSenderAdmin) {
            await sock.sendMessage(from, { delete: msg.key });
            await sock.sendMessage(from, {
              text:     `⚠️ @${senderJid.split('@')[0]} Links are not allowed here!\n_Anti-link is active._`,
              mentions: [senderJid],
            }, { quoted: rawMsg });
            return;
          }
        }
      }
    } catch {}

    // ─── Anti-spam ────────────────────────────────────────────────────────
    try {
      const antispam = Settings.getGroupKey(from, 'antispam');
      if (antispam && !isAnyOwner(senderJid)) {
        const key      = `${from}_${senderJid}`;
        const now      = Date.now();
        const userData = global.spamMap.get(key) || { count: 0, last: 0 };
        if (now - userData.last < 3000) {
          userData.count++;
          if (userData.count >= 5) {
            await sock.sendMessage(from, {
              text:     `⚠️ @${senderJid.split('@')[0]} slow down!`,
              mentions: [senderJid],
            }, { quoted: rawMsg });
            userData.count = 0;
          }
        } else {
          userData.count = 1;
        }
        userData.last = now;
        global.spamMap.set(key, userData);
      }
    } catch {}

    // ─── Anti-swear ───────────────────────────────────────────────────────
    try {
      const antiswear = Settings.getGroupKey(from, 'antiswear');
      if (antiswear && !isAnyOwner(senderJid) && body) {
        const lower = body.toLowerCase();
        const found = BAD_WORDS.some(w => lower.includes(w));
        if (found) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.sendMessage(from, {
            text:     `⚠️ @${senderJid.split('@')[0]} watch your language! 🤬`,
            mentions: [senderJid],
          }, { quoted: rawMsg });
          return;
        }
      }
    } catch {}

    // ─── Anti-bot: block commands from other bots ─────────────────────────
    try {
      const antibot = Settings.getGroupKey(from, 'antibot');
      if (antibot && body?.startsWith('/') && !isAnyOwner(senderJid)) {
        await sock.sendMessage(from, { delete: msg.key });
        return;
      }
    } catch {}
  }

  // ─── Command gate ──────────────────────────────────────────────────────────
  if (!isCmd) {
    logger.info(`[EH] DROP: not a command (body does not start with prefix '${config.prefix}')`);
    return;
  }

  // ─── Mode check ────────────────────────────────────────────────────────────
  let mode = 'public';
  try {
    mode = Settings.getGlobal('mode') || config.mode || 'public';
  } catch {}

  // 'self' is an alias for 'private' — only owner can use commands
  const isPrivateMode = mode === 'private' || mode === 'self';

  logger.info(`[EH] mode=${mode} isPrivateMode=${isPrivateMode} isAnyOwner=${isAnyOwner(senderJid)}`);

  if (isPrivateMode && !isAnyOwner(senderJid)) {
    // In groups: silently drop — don't spam the group with restriction messages
    if (isGroup) { logger.info(`[EH] DROP: private mode, group silent drop`); return; }
    return sock.sendMessage(from, {
      text: `🔒 *Bot is in private mode.*\n_Only the owner can use commands._`,
    }, { quoted: rawMsg });
  }

  // 'group' mode — only works inside groups (DM users need whitelist)
  if (mode === 'group' && !isGroup && !isAnyOwner(senderJid)) {
    const { Users } = require('./Database');
    if (!Users.isWhitelisted(senderJid)) {
      return sock.sendMessage(from, {
        text: `👥 *Bot only responds in groups.*\n_DM access requires whitelist._`,
      }, { quoted: rawMsg });
    }
  }

  // ─── Command lookup ────────────────────────────────────────────────────────
  const cmd = getCommand(command);
  if (!cmd) {
    logger.info(`[EH] DROP: unknown command '${command}'`);
    return;
  }

  logger.info(`CMD: ${config.prefix}${command} | FROM: ${senderJid.split('@')[0]} | GROUP: ${isGroup}`);

  // ─── Permission checks ─────────────────────────────────────────────────────
  if (cmd.ownerOnly && !isAnyOwner(senderJid)) {
    return sock.sendMessage(from, {
      text: `👑 *Owner only command.*\n_This command is reserved for the bot owner._`,
    }, { quoted: rawMsg });
  }

  if (cmd.groupOnly && !isGroup) {
    return sock.sendMessage(from, { text: `👥 *This command only works in groups.*` }, { quoted: rawMsg });
  }

  if (cmd.adminOnly && isGroup && !isAnyOwner(senderJid)) {
    try {
      const meta           = await sock.groupMetadata(from);
      const isSenderAdmin  = meta.participants.find(p => cleanJid(p.id) === senderJid)?.admin;
      if (!isSenderAdmin) {
        return sock.sendMessage(from, {
          text: `🛡️ *Admin only command.*\n_You need to be a group admin._`,
        }, { quoted: rawMsg });
      }
    } catch {}
  }

  if (cmd.category === 'nsfw') {
    const nsfwEnabled = isGroup ? Settings.getGroupKey(from, 'nsfw') : true;
    if (!nsfwEnabled) {
      return sock.sendMessage(from, {
        text: `🔞 *NSFW is disabled.*\n_An admin can enable it with .nsfw on_`,
      }, { quoted: rawMsg });
    }
  }

  // ─── Execute ───────────────────────────────────────────────────────────────
  try {
    await msg.react('⏳');
    await cmd.execute({
      sock, msg,
      args:    msg.args,
      text:    msg.text,
      command, from,
      sender:  senderJid,
      isGroup, config,
    });
    await msg.react('✅');
  } catch (err) {
    logger.error(`Error in command ${command}: ${err.message}`);
    try {
      await msg.react('❌');
      await msg.reply(`❌ *Command error:* ${err.message}`);
    } catch {}
  }
}

module.exports = { handleMessage };
