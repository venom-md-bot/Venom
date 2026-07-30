const axios = require('axios');

// crypto | currency | weather (relocated here)
module.exports = [
  {
    name: ['crypto', 'coin', 'price'],
    category: 'search',
    description: 'Get live cryptocurrency price',
    usage: 'crypto <symbol>  e.g. crypto BTC',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}crypto <symbol>\nExample: ${config.prefix}crypto BTC`);
      const symbol = text.trim().toUpperCase();
      await msg.reply(`💰 _Checking ${symbol} price..._`);
      try {
        const res = await axios.get(
          `https://api.coingecko.com/api/v3/simple/price`,
          { params: { ids: symbol.toLowerCase(), vs_currencies: 'usd,ngn', include_24hr_change: true }, timeout: 10000 }
        );
        // CoinGecko uses coin IDs not symbols, try common ones
        const idMap = { BTC:'bitcoin', ETH:'ethereum', BNB:'binancecoin', SOL:'solana', DOGE:'dogecoin', ADA:'cardano', XRP:'ripple', USDT:'tether', TON:'the-open-network', MATIC:'matic-network', SHIB:'shiba-inu', LTC:'litecoin', AVAX:'avalanche-2', DOT:'polkadot' };
        const id = idMap[symbol] || symbol.toLowerCase();
        const res2 = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, { params: { ids: id, vs_currencies: 'usd', include_24hr_change: true }, timeout: 10000 });
        const data  = res2.data[id];
        if (!data) return msg.reply(`❌ *${symbol}* not found. Try full name: .crypto bitcoin`);
        const change = data.usd_24h_change?.toFixed(2);
        const arrow  = change > 0 ? '📈' : '📉';
        await msg.reply(
          `💰 *${symbol}*\n\n` +
          `💵 Price: $${data.usd?.toLocaleString()}\n` +
          `${arrow} 24h Change: ${change > 0 ? '+' : ''}${change}%\n\n` +
          `_Live price — Venom MD 🐍_`
        );
      } catch (err) {
        await msg.reply(`❌ Failed to fetch price: ${err.message}`);
      }
    },
  },
  {
    name: ['currency', 'convert', 'fx'],
    category: 'search',
    description: 'Convert currency amounts',
    usage: 'currency <amount> <FROM> <TO>  e.g. currency 100 USD NGN',
    async execute({ msg, args, config }) {
      if (args.length < 3) return msg.reply(`❓ Usage: ${config.prefix}currency 100 USD NGN`);
      const [amountStr, from, to] = args;
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) return msg.reply('❌ Invalid amount');
      await msg.reply(`💱 _Converting ${amount} ${from.toUpperCase()} to ${to.toUpperCase()}..._`);
      try {
        const res  = await axios.get(`https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`, { timeout: 10000 });
        const rate = res.data.rates?.[to.toUpperCase()];
        if (!rate) return msg.reply(`❌ Currency *${to.toUpperCase()}* not found.`);
        const result = (amount * rate).toFixed(2);
        await msg.reply(
          `💱 *Currency Conversion*\n\n` +
          `${amount} *${from.toUpperCase()}* = *${result} ${to.toUpperCase()}*\n` +
          `Rate: 1 ${from.toUpperCase()} = ${rate.toFixed(4)} ${to.toUpperCase()}\n\n` +
          `_Live rate — Venom MD 🐍_`
        );
      } catch (err) {
        await msg.reply(`❌ Conversion failed: ${err.message}`);
      }
    },
  },
  {
    name: ['weather', 'forecast', 'temp'],
    category: 'search',
    description: 'Get current weather for a city',
    usage: 'weather <city>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}weather <city name>`);
      await msg.reply('🌤️ _Fetching weather..._');
      try {
        const res = await axios.get(`https://api.siputzx.my.id/api/info/weather`, { params: { city: text }, timeout: 10000 });
        const d   = res.data?.data || res.data;
        if (!d) throw new Error('No data');
        await msg.reply(
          `🌍 *Weather in ${d.city || text}*\n\n` +
          `🌡️ Temp: ${d.temperature || d.temp || 'N/A'}\n` +
          `💧 Humidity: ${d.humidity || 'N/A'}\n` +
          `🌬️ Wind: ${d.wind || 'N/A'}\n` +
          `☁️ Condition: ${d.condition || d.description || 'N/A'}\n\n` +
          `_🐍 Venom MD Weather_`
        );
      } catch {
        // Fallback: wttr.in
        try {
          const res = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=3`, { timeout: 8000 });
          await msg.reply(`🌤️ *Weather:*\n${res.data}\n\n_🐍 Venom MD_`);
        } catch (err) {
          await msg.reply(`❌ Weather not found for *${text}*`);
        }
      }
    },
  },
  {
    name: ['covid', 'corona', 'covidstats'],
    category: 'search',
    description: 'Get COVID-19 statistics by country',
    usage: 'covid <country>',
    async execute({ msg, text, config }) {
      if (!text) return msg.reply(`❓ Usage: ${config.prefix}covid <country name or "world">`);
      await msg.reply('🦠 _Fetching COVID stats..._');
      try {
        const endpoint = text.toLowerCase() === 'world' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(text)}`;
        const res = await axios.get(endpoint, { timeout: 10000 });
        const d   = res.data;
        await msg.reply(
          `🦠 *COVID-19: ${d.country || 'World'}*\n\n` +
          `😷 Total Cases: ${d.cases?.toLocaleString()}\n` +
          `💀 Deaths: ${d.deaths?.toLocaleString()}\n` +
          `✅ Recovered: ${d.recovered?.toLocaleString()}\n` +
          `🏥 Active: ${d.active?.toLocaleString()}\n` +
          `📅 Today Cases: +${d.todayCases?.toLocaleString()}\n\n` +
          `_🐍 Venom MD_`
        );
      } catch {
        await msg.reply(`❌ Country *${text}* not found. Try the full country name.`);
      }
    },
  },
];
