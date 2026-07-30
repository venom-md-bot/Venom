/**
 * ╔══════════════════════════════════════════╗
 * ║        🐍 VENOM MD — PAIR SESSION        ║
 * ║  Generates your short VENOM_XXXXXXXX ID  ║
 * ╚══════════════════════════════════════════╝
 *
 * Usage:
 *   node pair.js
 *
 * After pairing you receive a SHORT Session ID like:
 *   VENOM_X4R9KP2M
 *
 * Set these env vars on Render:
 *   SESSION_ID    = VENOM_X4R9KP2M
 *   REPLIT_DB_URL = (copy from Replit secrets)
 *   OWNER_NUMBER  = your number
 */

require('dotenv').config();
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  DisconnectReason,
} = require('@whiskeysockets/baileys');
const pino     = require('pino');
const path     = require('path');
const fs       = require('fs-extra');
const chalk    = require('chalk');
const readline = require('readline');
const config   = require('./config');
const { generateCode, saveSession } = require('./src/SessionStore');

const SESSION_DIR = path.join(__dirname, config.sessionName);

const rl  = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function main() {
  console.clear();
  console.log(chalk.red(`
 ██╗   ██╗███████╗███╗   ██╗ ██████╗ ███╗   ███╗
 ██║   ██║██╔════╝████╗  ██║██╔═══██╗████╗ ████║
 ██║   ██║█████╗  ██╔██╗ ██║██║   ██║██╔████╔██║
 ╚██╗ ██╔╝██╔══╝  ██║╚██╗██║██║   ██║██║╚██╔╝██║
  ╚████╔╝ ███████╗██║ ╚████║╚██████╔╝██║ ╚═╝ ██║
   ╚═══╝  ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝     ╚═╝
`));
  console.log(chalk.bold.white('  🐍 VENOM MD — Session ID Generator'));
  console.log(chalk.gray('  Now produces SHORT codes like VENOM_X4R9KP2M\n'));
  console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

  const number = (await ask(chalk.yellow('📱 Enter your WhatsApp number (with country code, no + or spaces):\n> ')))
    .trim().replace(/[^0-9]/g, '');
  rl.close();

  if (!number || number.length < 10) {
    console.log(chalk.red('\n❌ Invalid number. Example: 2348021016309\n'));
    process.exit(1);
  }

  console.log(chalk.gray(`\n🔄 Connecting... (Number: ${number})\n`));

  fs.ensureDirSync(SESSION_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    browser: ['Venom MD', 'Chrome', config.version],
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 2000));
    const code      = await sock.requestPairingCode(number);
    const formatted = code?.match(/.{1,4}/g)?.join('-') || code;

    console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold.white('\n🔑 YOUR PAIRING CODE:\n'));
    console.log(chalk.bold.green(`   >>>  ${formatted}  <<<\n`));
    console.log(chalk.white('📲 Steps:'));
    console.log(chalk.gray('   1. Open WhatsApp on your phone'));
    console.log(chalk.gray('   2. Go to Settings → Linked Devices'));
    console.log(chalk.gray('   3. Tap "Link a Device"'));
    console.log(chalk.gray('   4. Tap "Link with phone number instead"'));
    console.log(chalk.gray(`   5. Enter the code: ${chalk.bold.yellow(formatted)}`));
    console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
    console.log(chalk.gray('⏳ Waiting for you to enter the code...\n'));
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      await new Promise(r => setTimeout(r, 3000));

      const credsPath = path.join(SESSION_DIR, 'creds.json');
      const credsJson = fs.readFileSync(credsPath, 'utf8');
      const shortCode = generateCode();

      console.log(chalk.green('✅ Connected successfully!\n'));
      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold.white('\n🔑 Saving session to Replit KV DB...\n'));

      try {
        await saveSession(shortCode, credsJson);
        console.log(chalk.green('✅ Session saved!\n'));
      } catch (err) {
        console.log(chalk.yellow(`⚠️  Could not save to Replit KV: ${err.message}\n   (local file fallback used)\n`));
      }

      console.log(chalk.cyan('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
      console.log(chalk.bold.white('\n🐍 YOUR SHORT VENOM MD SESSION CODE:\n'));
      console.log(chalk.bold.yellow(`   ${shortCode}`));
      console.log(chalk.gray(`   (Only ${shortCode.length} characters — easy to copy!)`));
      console.log(chalk.cyan('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));
      console.log(chalk.white('📋 Render Environment Variables to set:'));
      console.log(chalk.bold.yellow(`   SESSION_ID    = ${shortCode}`));
      console.log(chalk.bold.yellow(`   OWNER_NUMBER  = ${number}`));
      console.log(chalk.bold.yellow(`   REPLIT_DB_URL = (copy from Replit → Secrets → REPLIT_DB_URL)`));
      console.log(chalk.gray('\n   The bot fetches the full session from Replit KV on first boot.\n'));
      console.log(chalk.bold.red('⚠️  Keep your REPLIT_DB_URL secret. Do NOT share it.\n'));

      fs.writeFileSync(path.join(__dirname, 'session_id.txt'), shortCode);
      console.log(chalk.gray(`💾 Short code also saved to: session_id.txt\n`));

      process.exit(0);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code !== DisconnectReason.loggedOut) {
        console.log(chalk.yellow('🔄 Reconnecting...'));
      } else {
        console.log(chalk.red('❌ Logged out. Run pair.js again.\n'));
        process.exit(1);
      }
    }
  });
}

main().catch(err => {
  console.error(chalk.red(`\n❌ Error: ${err.message}\n`));
  process.exit(1);
});
