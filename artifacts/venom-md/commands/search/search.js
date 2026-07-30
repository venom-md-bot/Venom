const axios = require('axios');

// google | define | lyrics | movie | github | npm | dictionary
module.exports = [
  {
    name: ['google', 'g', 'search'],
    category: 'search',
    description: 'Search the web via DuckDuckGo',
    usage: 'google <query>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}google <search query>`);
      await msg.reply('🔍 _Searching..._');
      try {
        const res = await axios.get('https://api.duckduckgo.com/', {
          params: { q: text, format: 'json', no_html: 1, skip_disambig: 1 },
          timeout: 15000,
        });
        const d = res.data;
        const answer = d.AbstractText || d.Answer || d.RelatedTopics?.[0]?.Text || null;
        if (!answer) {
          return msg.reply(`🔍 No direct answer found for *"${text}"*\nTry: https://www.google.com/search?q=${encodeURIComponent(text)}`);
        }
        await msg.reply(
          `🔍 *${d.Heading || text}*\n\n${answer.slice(0, 600)}\n\n` +
          (d.AbstractURL ? `🔗 ${d.AbstractURL}` : '')
        );
      } catch (err) {
        await msg.reply(`❌ Search failed: ${err.message}`);
      }
    },
  },
  {
    name: ['define', 'definition', 'meaning', 'dict'],
    category: 'search',
    description: 'Get the definition of a word',
    usage: 'define <word>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}define <word>`);
      await msg.reply('📖 _Looking up..._');
      try {
        const res  = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(text.trim())}`, { timeout: 10000 });
        const data = res.data[0];
        const phonetic = data.phonetics?.[0]?.text || '';
        const lines = [];
        for (const meaning of data.meanings.slice(0, 2)) {
          lines.push(`*${meaning.partOfSpeech}:*`);
          for (const def of meaning.definitions.slice(0, 2)) {
            lines.push(`• ${def.definition}`);
            if (def.example) lines.push(`  _"${def.example}"_`);
          }
        }
        await msg.reply(`📖 *${data.word}* ${phonetic}\n\n${lines.join('\n')}`);
      } catch {
        await msg.reply(`❌ No definition found for *${text}*`);
      }
    },
  },
  {
    name: ['lyrics', 'song', 'lyric'],
    category: 'search',
    description: 'Find song lyrics',
    usage: 'lyrics <song name - artist>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}lyrics <song name>`);
      await msg.reply('🎵 _Searching lyrics..._');
      try {
        const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(text)}`, { timeout: 15000 });
        const d   = res.data;
        if (!d.lyrics) return msg.reply(`❌ Lyrics not found for *${text}*`);
        const lyr = d.lyrics.slice(0, 1500);
        await msg.reply(
          `🎵 *${d.title}*\n👤 ${d.artist}\n\n${lyr}` +
          (d.lyrics.length > 1500 ? '\n\n_[truncated]_' : '')
        );
      } catch (err) {
        await msg.reply(`❌ Could not fetch lyrics: ${err.message}`);
      }
    },
  },
  {
    name: ['movie', 'film', 'imdb'],
    category: 'search',
    description: 'Search movie/series info (OMDB)',
    usage: 'movie <title>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}movie <movie/series title>`);
      await msg.reply('🎬 _Searching..._');
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/s/movie?query=${encodeURIComponent(text)}`, { timeout: 15000 });
        const d   = res.data?.data?.[0] || res.data?.result?.[0];
        if (!d) return msg.reply(`❌ No results for *${text}*`);
        await msg.reply(
          `🎬 *${d.title || d.name}*\n` +
          `📅 Year: ${d.year || d.release_date || 'N/A'}\n` +
          `⭐ Rating: ${d.rating || d.vote_average || 'N/A'}\n` +
          `🎭 Genre: ${Array.isArray(d.genre) ? d.genre.join(', ') : (d.genre || 'N/A')}\n\n` +
          `📝 ${(d.plot || d.overview || 'No description.').slice(0, 300)}`
        );
      } catch (err) {
        await msg.reply(`❌ Movie search failed: ${err.message}`);
      }
    },
  },
  {
    name: ['github', 'ghuser', 'gituser'],
    category: 'search',
    description: 'Get GitHub user info',
    usage: 'github <username>',
    async execute({ sock, msg, from, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}github <username>`);
      await msg.reply('🐙 _Fetching GitHub profile..._');
      try {
        const res = await axios.get(`https://api.github.com/users/${encodeURIComponent(text.trim())}`, { timeout: 10000, headers: { 'User-Agent': 'Venom-MD-Bot' } });
        const u   = res.data;
        await msg.reply(
          `🐙 *GitHub: @${u.login}*\n\n` +
          `📛 Name: ${u.name || 'N/A'}\n` +
          `📝 Bio: ${u.bio || 'N/A'}\n` +
          `🏢 Company: ${u.company || 'N/A'}\n` +
          `📍 Location: ${u.location || 'N/A'}\n` +
          `👥 Followers: ${u.followers} | Following: ${u.following}\n` +
          `📦 Repos: ${u.public_repos}\n` +
          `🔗 ${u.html_url}`
        );
      } catch {
        await msg.reply(`❌ GitHub user *${text}* not found.`);
      }
    },
  },
  {
    name: ['npm', 'npmpackage', 'nodepkg'],
    category: 'search',
    description: 'Get NPM package info',
    usage: 'npm <package-name>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}npm <package-name>`);
      try {
        const res = await axios.get(`https://registry.npmjs.org/${text.trim()}`, { timeout: 10000 });
        const pkg = res.data;
        const latest = pkg['dist-tags']?.latest;
        const info   = pkg.versions?.[latest] || {};
        await msg.reply(
          `📦 *${pkg.name}*\n\n` +
          `📝 ${(pkg.description || 'No description').slice(0, 200)}\n` +
          `🏷️ Version: ${latest}\n` +
          `👤 Author: ${typeof pkg.author === 'object' ? pkg.author?.name : (pkg.author || 'N/A')}\n` +
          `📜 License: ${info.license || 'N/A'}\n` +
          `🔗 https://npmjs.com/package/${pkg.name}`
        );
      } catch {
        await msg.reply(`❌ Package *${text}* not found on NPM.`);
      }
    },
  },
];
