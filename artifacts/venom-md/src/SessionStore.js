/**
 * Venom MD — Session Store
 *
 * Stores full creds.json keyed by a short VENOM_XXXXXXXX code in Replit KV DB.
 * Falls back to a local JSON file if REPLIT_DB_URL is not set (dev/testing only).
 *
 * The Replit KV DB is accessible via plain HTTP from anywhere — including Render —
 * as long as you have the REPLIT_DB_URL value (it contains an auth token in the URL).
 * Copy REPLIT_DB_URL from Replit → Render environment variables once, and you're done.
 */

const axios  = require('axios');
const fs     = require('fs-extra');
const path   = require('path');
const logger = require('./Logger');

const LOCAL_STORE = path.join(__dirname, '../database/session_store.json');

// Generate VENOM_XXXXXXXX — 8 uppercase alphanumeric chars, easy to read/type
function generateCode() {
  // Omit look-alike chars: 0/O, 1/I/L
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `VENOM_${suffix}`;
}

// ─── KV helpers ───────────────────────────────────────────────────────────────

async function saveSession(shortCode, credsJson) {
  const dbUrl = process.env.REPLIT_DB_URL;
  if (dbUrl) {
    try {
      // Replit KV: POST with URL-encoded body  key=value
      const body = `${encodeURIComponent(shortCode)}=${encodeURIComponent(credsJson)}`;
      await axios.post(dbUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      });
      logger.info(`✅ Session saved to Replit KV: ${shortCode}`);
      return true;
    } catch (err) {
      logger.error(`Replit KV save failed: ${err.message} — falling back to local file`);
    }
  }

  // Local fallback
  const store = fs.existsSync(LOCAL_STORE) ? fs.readJsonSync(LOCAL_STORE, { throws: false }) || {} : {};
  store[shortCode] = credsJson;
  fs.ensureDirSync(path.dirname(LOCAL_STORE));
  fs.writeJsonSync(LOCAL_STORE, store, { spaces: 2 });
  logger.warn(`⚠️  No REPLIT_DB_URL — session saved locally only (${LOCAL_STORE}). This won't survive a Render restart!`);
  return true;
}

async function getSession(shortCode) {
  const dbUrl = process.env.REPLIT_DB_URL;
  if (dbUrl) {
    try {
      const res = await axios.get(`${dbUrl}/${encodeURIComponent(shortCode)}`, { timeout: 15000 });
      const value = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      if (!value || value === 'null') return null;
      logger.info(`✅ Session fetched from Replit KV: ${shortCode}`);
      return value;
    } catch (err) {
      if (err.response?.status === 404) return null;
      logger.error(`Replit KV get failed: ${err.message}`);
      return null;
    }
  }

  // Local fallback
  if (!fs.existsSync(LOCAL_STORE)) return null;
  const store = fs.readJsonSync(LOCAL_STORE, { throws: false }) || {};
  return store[shortCode] || null;
}

async function deleteSession(shortCode) {
  const dbUrl = process.env.REPLIT_DB_URL;
  if (dbUrl) {
    try {
      await axios.delete(`${dbUrl}/${encodeURIComponent(shortCode)}`, { timeout: 10000 });
    } catch {}
  } else {
    if (!fs.existsSync(LOCAL_STORE)) return;
    const store = fs.readJsonSync(LOCAL_STORE, { throws: false }) || {};
    delete store[shortCode];
    fs.writeJsonSync(LOCAL_STORE, store, { spaces: 2 });
  }
}

module.exports = { generateCode, saveSession, getSession, deleteSession };
