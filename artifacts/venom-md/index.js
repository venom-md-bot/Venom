/**
 * ╔══════════════════════════════════════════╗
 * ║           🐍 VENOM MD BOT v2.0           ║
 * ║    The #1 Powerful WhatsApp MD Bot       ║
 * ║   Built with Baileys | Node.js 18+       ║
 * ╚══════════════════════════════════════════╝
 */

require('dotenv').config();
const chalk  = require('chalk');
const config = require('./config');
const { connect }            = require('./src/Connection');
const { loadCommands }       = require('./src/CommandLoader');
const { startPairingServer } = require('./src/PairingServer');
const logger = require('./src/Logger');

// ─── Banner ────────────────────────────────────────────────────────────────────
console.log(chalk.red(`
 ██╗   ██╗███████╗███╗   ██╗ ██████╗ ███╗   ███╗    ███╗   ███╗██████╗
 ██║   ██║██╔════╝████╗  ██║██╔═══██╗████╗ ████║    ████╗ ████║██╔══██╗
 ██║   ██║█████╗  ██╔██╗ ██║██║   ██║██╔████╔██║    ██╔████╔██║██║  ██║
 ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██║   ██║██║╚██╔╝██║    ██║╚██╔╝██║██║  ██║
  ╚████╔╝ ███████╗██║ ╚████║╚██████╔╝██║ ╚═╝ ██║    ██║ ╚═╝ ██║██████╔╝
   ╚═══╝  ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝    ╚═╝     ╚═╝╚═════╝
`));
console.log(chalk.bold.white('  The #1 Powerful WhatsApp Multi-Device Bot'));
console.log(chalk.gray(`  Version: v${config.version}  |  Owner: ${config.ownerNumber}`));
console.log(chalk.gray(`  Prefix: ${config.prefix}  |  Mode: ${config.mode}\n`));

// ─── Uncaught error handlers ───────────────────────────────────────────────────
process.on('unhandledRejection', (err) => logger.error(`Unhandled Rejection: ${err?.message || err}`));
process.on('uncaughtException',  (err) => logger.error(`Uncaught Exception:  ${err?.message || err}`));

// ─── Bootstrap ─────────────────────────────────────────────────────────────────
async function main() {
  // 1. Always start the pairing web server (serves the session-ID page)
  startPairingServer();

  // 2. Load all commands
  logger.info('🔄 Loading commands…');
  loadCommands();

  // 3. Connect to WhatsApp ONLY when SESSION_ID is already set.
  //    Without it, the user must visit the pairing page first to get their
  //    VENOM_... session ID, then set SESSION_ID and restart.
  if (process.env.SESSION_ID) {
    logger.info('🔌 SESSION_ID found — connecting to WhatsApp…');
    await connect();
  } else {
    logger.warn('⚠️  No SESSION_ID set.');
    logger.warn('👉  Visit the pairing page, get your VENOM_... session ID,');
    logger.warn('    then set SESSION_ID in your environment and restart.');
  }
}

main().catch(err => {
  logger.error(`Fatal startup error: ${err.message}`);
  process.exit(1);
});
