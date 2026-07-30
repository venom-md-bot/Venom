const path = require('path');
const fs   = require('fs-extra');
const logger = require('./Logger');

const commands = new Map();

/**
 * Supports two module export shapes per .js file:
 *   module.exports = { name, execute, ... }          ← single command
 *   module.exports = [{ name, execute }, ...]         ← multiple commands
 */
function loadCommands(dir = path.join(__dirname, '../commands')) {
  const categories = fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isDirectory());

  for (const category of categories) {
    const catPath = path.join(dir, category);
    const files = fs.readdirSync(catPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      try {
        const mod = require(path.join(catPath, file));
        const list = Array.isArray(mod) ? mod : [mod];

        for (const command of list) {
          if (!command.name) {
            logger.warn(`Command in ${file} missing 'name' export — skipped`);
            continue;
          }
          const names = Array.isArray(command.name) ? command.name : [command.name];
          for (const n of names) {
            commands.set(n.toLowerCase(), { ...command, category });
          }
          logger.debug(`Loaded command: ${names.join(', ')} [${category}]`);
        }
      } catch (err) {
        logger.error(`Failed to load ${file}: ${err.message}`);
      }
    }
  }

  logger.info(`✅ Loaded ${commands.size} commands from ${categories.length} categories`);
  return commands;
}

function getCommand(name) {
  return commands.get(name.toLowerCase());
}

function getAllCommands() {
  return commands;
}

module.exports = { loadCommands, getCommand, getAllCommands };
