const sharp = require('sharp');
const axios = require('axios');
const { execSync, spawnSync } = require('child_process');

// ─── Download buffer from URL ──────────────────────────────────────────────────
async function fetchBuffer(url, options = {}) {
  const res = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': '*/*',
    },
    ...options,
  });
  return Buffer.from(res.data);
}

// ─── Try multiple API endpoints with fallback ─────────────────────────────────
// `apis` is an array of { url, params?, transform }
// `transform(responseData)` should return the desired value or null/undefined on failure
async function fetchWithFallback(apis) {
  const errors = [];
  for (const { url, params, transform, method, data } of apis) {
    try {
      const res = method === 'post'
        ? await axios.post(url, data || {}, { params, timeout: 40000, headers: { 'User-Agent': 'Mozilla/5.0', 'Content-Type': 'application/json' } })
        : await axios.get(url, { params, timeout: 40000, headers: { 'User-Agent': 'Mozilla/5.0' } });
      const result = transform ? transform(res.data) : res.data;
      if (result) return result;
      errors.push(`${url} → transform returned empty`);
    } catch (err) {
      errors.push(`${url} → ${err.message}`);
    }
  }
  throw new Error(`All APIs failed:\n${errors.join('\n')}`);
}

// ─── Convert image to sticker buffer (WebP via sharp) ─────────────────────────
async function imageToSticker(buffer) {
  return sharp(buffer)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 80 })
    .toBuffer();
}

// ─── Convert video / GIF to animated sticker ──────────────────────────────────
async function videoToSticker(buffer) {
  try {
    return await sharp(buffer, { animated: true })
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 60 })
      .toBuffer();
  } catch {
    return imageToSticker(buffer);
  }
}

// ─── yt-dlp binary download (most reliable) ───────────────────────────────────
function ytdlpAvailable() {
  try { execSync('yt-dlp --version', { timeout: 5000, stdio: 'ignore' }); return true; }
  catch { return false; }
}

async function downloadWithYtdlp(ytUrl, format = 'bestaudio[ext=m4a]/bestaudio/best') {
  return new Promise((resolve, reject) => {
    const tmp = `/tmp/ytdl_${Date.now()}`;
    const result = spawnSync('yt-dlp', [
      '-f', format,
      '-o', `${tmp}.%(ext)s`,
      '--no-playlist',
      '--max-filesize', '50m',
      '--quiet',
      '--no-warnings',
      ytUrl,
    ], { timeout: 90000, encoding: 'buffer' });

    if (result.status !== 0) {
      return reject(new Error(`yt-dlp exited ${result.status}: ${result.stderr?.toString()}`));
    }

    // Find downloaded file
    const fs = require('fs');
    const files = fs.readdirSync('/tmp').filter(f => f.startsWith(`ytdl_${tmp.split('_')[2]}`));
    if (!files.length) return reject(new Error('yt-dlp: output file not found'));

    const filePath = `/tmp/${files[0]}`;
    const buffer   = fs.readFileSync(filePath);
    try { fs.unlinkSync(filePath); } catch {}
    resolve(buffer);
  });
}

// ─── Search YouTube ────────────────────────────────────────────────────────────
async function searchYouTube(query) {
  return fetchWithFallback([
    {
      url: 'https://api.siputzx.my.id/api/s/youtube',
      params: { query },
      transform: (d) => {
        const r = (d?.data || d?.result)?.[0];
        return r?.url ? r : null;
      },
    },
    {
      url: 'https://api.ryzendesu.vip/api/searcher/youtube',
      params: { query },
      transform: (d) => {
        const r = (d?.data || d)?.[0];
        return r?.link ? { url: r.link, title: r.title, duration: r.duration, thumbnail: r.thumbnail } : null;
      },
    },
    {
      // YouTube oEmbed — no key required, reliable title lookup
      url: `https://www.youtube.com/results`,
      params: { search_query: query },
      transform: (d) => null, // HTML parse — used only as last resort via yt-dlp below
    },
  ]).catch(async () => {
    // Last resort: use yt-dlp to search
    if (!ytdlpAvailable()) throw new Error('All YouTube search APIs failed');
    const result = spawnSync('yt-dlp', [
      `ytsearch1:${query}`, '--get-url', '--get-title', '--get-duration',
      '--no-playlist', '--quiet', '--no-warnings',
    ], { timeout: 30000, encoding: 'utf8' });
    if (result.status !== 0) throw new Error('yt-dlp search failed');
    const lines = result.stdout.trim().split('\n');
    return { title: lines[0], url: lines[1], duration: lines[2] };
  });
}

// ─── Download YouTube MP3 ──────────────────────────────────────────────────────
async function downloadYtMp3(ytUrl) {
  // Try free APIs first (fast, no install)
  try {
    return await fetchWithFallback([
      {
        url: 'https://api.siputzx.my.id/api/d/ytmp3',
        params: { url: ytUrl },
        transform: (d) => {
          const data = d?.data;
          return data?.audio ? { audioUrl: data.audio, title: data.title, duration: data.duration } : null;
        },
      },
      {
        url: 'https://api.ryzendesu.vip/api/downloader/ytmp3',
        params: { url: ytUrl },
        transform: (d) => {
          const url = d?.url || d?.link || d?.data?.url;
          return url ? { audioUrl: url, title: d.title || d.data?.title || 'Audio', duration: d.duration || '' } : null;
        },
      },
      {
        url: 'https://api.neekfu.com/api/downloader/ytmp3',
        params: { url: ytUrl },
        transform: (d) => {
          const url = d?.data?.audio || d?.audio || d?.url;
          return url ? { audioUrl: url, title: d.data?.title || d.title || 'Audio', duration: d.data?.duration || '' } : null;
        },
      },
      {
        // cobalt.tools — reliable open source downloader
        url: 'https://cobalt.tools/api/json',
        method: 'post',
        data: { url: ytUrl, aFormat: 'mp3', isAudioOnly: true },
        transform: (d) => {
          const url = d?.url;
          return url ? { audioUrl: url, title: 'Audio', duration: '' } : null;
        },
      },
    ]);
  } catch (apiErr) {
    // Fallback to yt-dlp binary
    if (!ytdlpAvailable()) throw new Error(`YouTube MP3 download failed: ${apiErr.message}`);
    const buffer = await downloadWithYtdlp(ytUrl, 'bestaudio[ext=m4a]/bestaudio/best');
    // Return buffer directly — caller should check for _buffer key
    return { _buffer: buffer, title: 'Audio', duration: '' };
  }
}

// ─── Download YouTube MP4 ──────────────────────────────────────────────────────
async function downloadYtMp4(ytUrl) {
  try {
    return await fetchWithFallback([
      {
        url: 'https://api.siputzx.my.id/api/d/ytmp4',
        params: { url: ytUrl },
        transform: (d) => {
          const data = d?.data;
          return data?.video ? { videoUrl: data.video, title: data.title, duration: data.duration } : null;
        },
      },
      {
        url: 'https://api.ryzendesu.vip/api/downloader/ytmp4',
        params: { url: ytUrl },
        transform: (d) => {
          const url = d?.url || d?.link || d?.data?.url;
          return url ? { videoUrl: url, title: d.title || d.data?.title || 'Video', duration: d.duration || '' } : null;
        },
      },
      {
        url: 'https://api.neekfu.com/api/downloader/ytmp4',
        params: { url: ytUrl },
        transform: (d) => {
          const url = d?.data?.video || d?.video || d?.url;
          return url ? { videoUrl: url, title: d.data?.title || d.title || 'Video', duration: d.data?.duration || '' } : null;
        },
      },
      {
        url: 'https://cobalt.tools/api/json',
        method: 'post',
        data: { url: ytUrl, vCodec: 'h264', vQuality: '720' },
        transform: (d) => {
          const url = d?.url;
          return url ? { videoUrl: url, title: 'Video', duration: '' } : null;
        },
      },
    ]);
  } catch (apiErr) {
    if (!ytdlpAvailable()) throw new Error(`YouTube MP4 download failed: ${apiErr.message}`);
    const buffer = await downloadWithYtdlp(ytUrl, 'bestvideo[ext=mp4][height<=720]+bestaudio[ext=m4a]/best[ext=mp4]/best');
    return { _buffer: buffer, title: 'Video', duration: '' };
  }
}

// ─── Download TikTok ───────────────────────────────────────────────────────────
async function downloadTikTok(tiktokUrl) {
  return fetchWithFallback([
    {
      url: 'https://www.tikwm.com/api/',
      params: { url: tiktokUrl },
      transform: (d) => {
        const data = d?.data;
        return data?.play ? {
          videoUrl: data.play,
          title:    data.title || '',
          author:   data.author?.nickname || data.author?.unique_id || 'unknown',
        } : null;
      },
    },
    {
      url: 'https://api.siputzx.my.id/api/d/tiktok',
      params: { url: tiktokUrl },
      transform: (d) => {
        const data = d?.data;
        const url  = data?.video || data?.url;
        return url ? { videoUrl: url, title: data.title || '', author: data.author || 'unknown' } : null;
      },
    },
    {
      url: 'https://api.ryzendesu.vip/api/downloader/tiktok',
      params: { url: tiktokUrl },
      transform: (d) => {
        const url = d?.data?.url || d?.url;
        return url ? { videoUrl: url, title: d.data?.title || '', author: '' } : null;
      },
    },
  ]);
}

// ─── Download Instagram ────────────────────────────────────────────────────────
async function downloadInstagram(igUrl) {
  return fetchWithFallback([
    {
      url: 'https://api.siputzx.my.id/api/d/instagram',
      params: { url: igUrl },
      transform: (d) => {
        const data = d?.data;
        if (!data) return null;
        const url = data.video || data.image || (Array.isArray(data.urls) ? data.urls[0] : null);
        return url ? { mediaUrl: url, isVideo: !!(data.video), type: data.type || (data.video ? 'video' : 'image') } : null;
      },
    },
    {
      url: 'https://api.ryzendesu.vip/api/downloader/instagram',
      params: { url: igUrl },
      transform: (d) => {
        const url = d?.data?.[0]?.url || d?.url;
        return url ? { mediaUrl: url, isVideo: url.includes('.mp4'), type: url.includes('.mp4') ? 'video' : 'image' } : null;
      },
    },
  ]);
}

// ─── Download Facebook ─────────────────────────────────────────────────────────
async function downloadFacebook(fbUrl) {
  return fetchWithFallback([
    {
      url: 'https://api.siputzx.my.id/api/d/facebook',
      params: { url: fbUrl },
      transform: (d) => {
        const data = d?.data;
        const url  = data?.hd || data?.sd || data?.url;
        return url ? { videoUrl: url, title: data.title || 'Facebook Video' } : null;
      },
    },
    {
      url: 'https://api.ryzendesu.vip/api/downloader/facebook',
      params: { url: fbUrl },
      transform: (d) => {
        const url = d?.data?.url || d?.url;
        return url ? { videoUrl: url, title: d.data?.title || 'Facebook Video' } : null;
      },
    },
  ]);
}

// ─── Resize image ─────────────────────────────────────────────────────────────
async function resizeImage(buffer, width = 512, height = 512) {
  return sharp(buffer)
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
}

// ─── Get media type from message ─────────────────────────────────────────────
function getMediaType(msg) {
  const types = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
  return types.find(t => msg[t]) || null;
}

module.exports = {
  fetchBuffer,
  fetchWithFallback,
  imageToSticker,
  videoToSticker,
  resizeImage,
  getMediaType,
  searchYouTube,
  downloadYtMp3,
  downloadYtMp4,
  downloadTikTok,
  downloadInstagram,
  downloadFacebook,
};
