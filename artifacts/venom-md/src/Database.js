const fs = require('fs-extra');
const path = require('path');

const DB_DIR = path.join(__dirname, '../database');

const files = {
  settings: path.join(DB_DIR, 'settings.json'),
  economy:  path.join(DB_DIR, 'economy.json'),
  users:    path.join(DB_DIR, 'users.json'),
  groups:   path.join(DB_DIR, 'groups.json'),
};

const defaults = {
  settings: { global: { mode: 'public', anticall: false, autoread: false, banned_users: [] }, groups: {} },
  economy:  { users: {} },
  users:    { registered: {}, whitelist: [], blacklist: [] },
  groups:   {},
};

function init() {
  fs.ensureDirSync(DB_DIR);
  for (const [key, filePath] of Object.entries(files)) {
    if (!fs.existsSync(filePath)) {
      fs.writeJsonSync(filePath, defaults[key], { spaces: 2 });
    }
  }
}

function read(db) {
  return fs.readJsonSync(files[db]);
}

function write(db, data) {
  fs.writeJsonSync(files[db], data, { spaces: 2 });
}

const Settings = {
  get() { return read('settings'); },

  getGlobal(key)        { return read('settings').global[key]; },
  setGlobal(key, value) {
    const db = read('settings');
    db.global[key] = value;
    write('settings', db);
  },

  getGroup(jid) {
    const db = read('settings');
    return db.groups[jid] || {};
  },
  setGroup(jid, key, value) {
    const db = read('settings');
    if (!db.groups[jid]) db.groups[jid] = {};
    db.groups[jid][key] = value;
    write('settings', db);
  },
  getGroupKey(jid, key) {
    const db = read('settings');
    return db.groups[jid] ? db.groups[jid][key] : undefined;
  },

  isBanned(jid)  { return (read('settings').global.banned_users || []).includes(jid); },
  ban(jid) {
    const db = read('settings');
    if (!db.global.banned_users.includes(jid)) db.global.banned_users.push(jid);
    write('settings', db);
  },
  unban(jid) {
    const db = read('settings');
    db.global.banned_users = (db.global.banned_users || []).filter(u => u !== jid);
    write('settings', db);
  },
};

const Economy = {
  get(jid) {
    const db = read('economy');
    if (!db.users[jid]) db.users[jid] = { balance: 100, lastDaily: 0, totalEarned: 0 };
    write('economy', db);
    return db.users[jid];
  },
  setBalance(jid, amount) {
    const db = read('economy');
    if (!db.users[jid]) db.users[jid] = { balance: 100, lastDaily: 0, totalEarned: 0 };
    db.users[jid].balance = amount;
    write('economy', db);
  },
  addBalance(jid, amount) {
    const user = Economy.get(jid);
    Economy.setBalance(jid, user.balance + amount);
    const db = read('economy');
    db.users[jid].totalEarned = (db.users[jid].totalEarned || 0) + amount;
    write('economy', db);
  },
  deductBalance(jid, amount) {
    const user = Economy.get(jid);
    Economy.setBalance(jid, Math.max(0, user.balance - amount));
  },
  setLastDaily(jid, ts) {
    const db = read('economy');
    if (!db.users[jid]) db.users[jid] = { balance: 100, lastDaily: 0, totalEarned: 0 };
    db.users[jid].lastDaily = ts;
    write('economy', db);
  },
  getAll() { return read('economy').users; },
};

const Users = {
  isRegistered(jid) { return !!read('users').registered[jid]; },
  register(jid, data = {}) {
    const db = read('users');
    db.registered[jid] = { ...data, registeredAt: Date.now() };
    write('users', db);
  },
  isWhitelisted(jid) { return read('users').whitelist.includes(jid); },
  whitelist(jid) {
    const db = read('users');
    if (!db.whitelist.includes(jid)) db.whitelist.push(jid);
    write('users', db);
  },
  removeWhitelist(jid) {
    const db = read('users');
    db.whitelist = db.whitelist.filter(u => u !== jid);
    write('users', db);
  },
};

module.exports = { init, Settings, Economy, Users };
