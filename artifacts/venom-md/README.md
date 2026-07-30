# 🐍 Venom MD — WhatsApp Bot v2.0

<div align="center">

![Venom MD](https://img.shields.io/badge/Venom%20MD-v2.0-red?style=for-the-badge&logo=whatsapp)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)
![Baileys](https://img.shields.io/badge/Baileys-Multi--Device-blue?style=for-the-badge)
![Deploy](https://img.shields.io/badge/Deploy-Render-46E3B7?style=for-the-badge&logo=render)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**The #1 Powerful WhatsApp Multi-Device Bot**

*Built with Baileys · Deployed on Render · No database required*

</div>

---

## ⚠️ FORK FIRST — Do Not Skip This

> **Before doing anything, click Fork at the top of this page.**
> You must use your own fork — not this original repo.
> Render needs to connect to a repo you own. If you skip forking, your bot
> will break any time the original repo is updated.

---

## 🚀 Full Setup Guide

Everything runs on Render. No Replit, no terminal, no database needed.

---

### Step 1 — Deploy to Render

1. Go to [render.com](https://render.com) → sign up or log in
2. Click **New → Web Service**
3. Connect your GitHub and select **your fork** of this repo
4. Fill in these settings:

| Setting | Value |
|---|---|
| **Root Directory** | `artifacts/venom-md` |
| **Build Command** | `npm install` |
| **Start Command** | `node index.js` |
| **Instance Type** | Free |

5. **Do not add `SESSION_ID` yet** — leave environment variables empty for now
6. Click **Create Web Service** and wait for the deploy to finish

---

### Step 2 — Pair Your WhatsApp Number

Once Render finishes deploying:

1. Copy your Render URL — it looks like `https://your-bot-name.onrender.com`
2. Open it in your browser and go to:
```
https://your-bot-name.onrender.com/pair
```
3. Enter your WhatsApp number with country code — **no `+`, no spaces**
   Example: `2348021016309`
4. A **6-digit pairing code** appears on the page
5. On your phone: **WhatsApp → Settings → Linked Devices → Link with phone number**
6. Enter the 6-digit code
7. Wait a few seconds — the bot will send a message to your WhatsApp that looks like this:

```
VENOM_eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5c...
```

**That entire string is your Session ID. Tap and copy the whole thing.**

---

### Step 3 — Add Session ID to Render and Redeploy

1. Go back to your Render dashboard → your web service → **Environment**
2. Add these variables:

| Variable | Value |
|---|---|
| `SESSION_ID` | The full `VENOM_eyJ...` string from your WhatsApp |
| `OWNER_NUMBER` | Your number — no `+` (e.g. `2348021016309`) |

3. Click **Save Changes**
4. Render will automatically redeploy — the bot will connect to WhatsApp fully

✅ That's it. Your bot is live.

---

## ⚙️ Optional Environment Variables

| Variable | Default | Description |
|---|---|---|
| `BOT_NAME` | `Venom MD` | Bot display name |
| `PREFIX` | `.` | Command prefix character |
| `BOT_MODE` | `public` | `public` / `private` / `group` |
| `AUTO_READ` | `false` | Auto-read all messages |
| `ANTI_CALL` | `false` | Reject incoming calls |

---

## 💬 Commands

Send `.menu` in any WhatsApp chat to see all commands.

### 📥 Media
| Command | Aliases | What it does |
|---|---|---|
| `.play` | `.music`, `.song` | Download & send audio |
| `.ytmp3` | `.yta` | YouTube → MP3 |
| `.ytmp4` | `.ytv` | YouTube → MP4 |
| `.tiktok` | `.tt` | TikTok (no watermark) |
| `.instagram` | `.ig` | Instagram photo / video |
| `.facebook` | `.fb` | Facebook video |
| `.vv` | `.viewonce` | Open a view-once message |

### 👑 Owner
| Command | What it does |
|---|---|
| `.setname <name>` | Change bot display name |
| `.setbio <text>` | Change bot status |
| `.setpp` | Change bot profile picture (reply to image) |
| `.setprefix <char>` | Change command prefix |
| `.online` / `.offline` | Set bot presence |

---

## ❓ FAQ

**Q: Do I need Replit or a database?**
A: No. Everything runs on Render. The session is stored inside the `VENOM_eyJ...` string itself — no database needed.

**Q: The pairing page won't load**
A: Make sure Render finished deploying and the service is running (green). Free-tier services sleep after inactivity — open the Render dashboard and wake it first.

**Q: Bot connects but commands don't work**
A: Check you're using the right prefix (default `.`). Check Render logs for any errors.

**Q: Session expired / bot got logged out**
A: Visit `/pair` on your Render URL again, pair a fresh number, copy the new `VENOM_eyJ...` string, update `SESSION_ID` in Render environment, and let it redeploy.

**Q: Can I run multiple numbers?**
A: Yes — create a separate Render web service for each number, each with its own `SESSION_ID`.

**Q: Why must I fork?**
A: Render connects to a GitHub repo and pulls from it on each deploy. You need to own the repo so you control updates. If you connect the original, any push to this repo could redeploy and overwrite your bot.

---

## 🔄 Updating

To get the latest features:

1. Go to your fork on GitHub → **Sync fork → Update branch**
2. Go to Render → your service → **Manual Deploy**

---

## 📄 License

MIT — free to use, modify, and deploy.

---

<div align="center">

Made with ❤️ by the Venom MD team · **🐍 The #1 WhatsApp Bot**

</div>
