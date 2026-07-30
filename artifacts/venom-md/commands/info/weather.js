const axios = require('axios');

module.exports = {
  name: ['weather', 'w'],
  category: 'info',
  description: 'Get weather for a city',
  usage: 'weather <city>',
  async execute({ msg, text, config }) {
    if (!text) return msg.reply(`❓ *Usage:* ${config.prefix}weather <city>`);
    if (!config.weatherKey) return msg.reply(`❌ *Weather API key not configured.*\nAsk the owner to set WEATHER_API_KEY.`);

    const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
      params: { q: text, appid: config.weatherKey, units: 'metric' },
      timeout: 10000,
    });

    const d = res.data;
    const emojiMap = { Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️', Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️' };
    const emoji = emojiMap[d.weather[0].main] || '🌤️';

    await msg.reply(
      `${emoji} *Weather in ${d.name}, ${d.sys.country}*\n\n` +
      `🌡️ *Temp:* ${d.main.temp}°C (feels like ${d.main.feels_like}°C)\n` +
      `💧 *Humidity:* ${d.main.humidity}%\n` +
      `💨 *Wind:* ${d.wind.speed} m/s\n` +
      `🌤️ *Condition:* ${d.weather[0].description}\n\n` +
      `> _Venom MD 🐍_`
    );
  },
};
