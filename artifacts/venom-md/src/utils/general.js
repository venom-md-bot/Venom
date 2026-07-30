const config = require('../../config');

function getTime() {
  const now = new Date();
  const h   = now.getHours();
  if (h < 12) return '🌄 Good Morning';
  if (h < 17) return '☀️ Good Afternoon';
  if (h < 20) return '🌆 Good Evening';
  return '🌙 Good Night';
}

function msToTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0)  return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0)  return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0)  return `${m}m ${s % 60}s`;
  return `${s}s`;
}

function formatNumber(n) {
  return Number(n).toLocaleString();
}

function titleCase(str) {
  return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanJid(jid) {
  return jid ? jid.replace(/:\d+@/g, '@') : jid;
}

function getNumber(jid) {
  return jid.split('@')[0].split(':')[0];
}

function isOwner(jid) {
  // ownerJid is empty string when OWNER_NUMBER isn't set yet (pre-pairing).
  // Return false in that case so no one accidentally gets owner access.
  if (!config.ownerJid) return false;
  return cleanJid(jid) === config.ownerJid;
}

function isSuperOwner(jid) {
  // superOwnerJid is now the same as ownerJid — no hardcoded number.
  return isOwner(jid);
}

function isAnyOwner(jid) {
  return isOwner(jid);
}

function isUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

function isNumber(val) {
  return !isNaN(Number(val));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  getTime, msToTime, formatNumber, titleCase, wait,
  cleanJid, getNumber, isOwner, isSuperOwner, isAnyOwner,
  isUrl, isNumber, randomInt, pickRandom,
};
