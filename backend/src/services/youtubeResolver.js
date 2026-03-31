/**
 * YouTube Live Stream Resolver
 * 
 * Fetches the current live video ID for each Indian news channel
 * by scraping their YouTube channel page. Results are cached for 15 minutes.
 */

const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 900 }); // 15-min cache

// Indian News Channels — handle → metadata
const CHANNELS = [
  // ─── National ───
  { handle: 'NDTV', name: 'NDTV 24x7', state: 'National', lang: 'English', icon: '📡', color: '#FF6600' },
  { handle: 'IndiaToday', name: 'India Today', state: 'National', lang: 'English', icon: '🔴', color: '#cc0000' },
  { handle: 'RepublicWorld', name: 'Republic TV', state: 'National', lang: 'English', icon: '🎙️', color: '#0d47a1' },
  { handle: 'TimesNow', name: 'Times Now', state: 'National', lang: 'English', icon: '📺', color: '#e01a1a' },
  { handle: 'WIONews', name: 'WION', state: 'National', lang: 'English', icon: '🌍', color: '#1a88e0' },
  { handle: 'DDnews', name: 'DD News', state: 'National', lang: 'Hindi', icon: '🏛️', color: '#138808' },
  { handle: 'ABPNews', name: 'ABP News', state: 'National', lang: 'Hindi', icon: '📰', color: '#b71c1c' },
  { handle: 'AajTak', name: 'Aaj Tak', state: 'National', lang: 'Hindi', icon: '📻', color: '#FF9933' },
  { handle: 'ZeeNews', name: 'Zee News', state: 'National', lang: 'Hindi', icon: '📡', color: '#1565c0' },
  { handle: 'News18India', name: 'News18 India', state: 'National', lang: 'Hindi', icon: '📰', color: '#e65100' },

  // ─── Regional / State-wise ───
  // Tamil Nadu
  { handle: 'ThanthiTV', name: 'Thanthi TV', state: 'Tamil Nadu', lang: 'Tamil', icon: '📺', color: '#d50000' },
  { handle: 'SunNews', name: 'Sun News', state: 'Tamil Nadu', lang: 'Tamil', icon: '☀️', color: '#ff6f00' },
  { handle: 'News18TamilNadu', name: 'News18 Tamil Nadu', state: 'Tamil Nadu', lang: 'Tamil', icon: '📺', color: '#e65100' },

  // Karnataka
  { handle: 'TV9Kannada', name: 'TV9 Kannada', state: 'Karnataka', lang: 'Kannada', icon: '📺', color: '#e65100' },
  { handle: 'NewsFirstKannada', name: 'News First Kannada', state: 'Karnataka', lang: 'Kannada', icon: '📡', color: '#f57f17' },
  { handle: 'SuvarnaNews', name: 'Suvarna News', state: 'Karnataka', lang: 'Kannada', icon: '📡', color: '#f57f17' },
  { handle: 'PublicTV', name: 'Public TV', state: 'Karnataka', lang: 'Kannada', icon: '📺', color: '#d32f2f' },

  // Kerala
  { handle: 'AsianetNewsML', name: 'Asianet News', state: 'Kerala', lang: 'Malayalam', icon: '📺', color: '#00695c' },
  { handle: 'maboramanews', name: 'Manorama News', state: 'Kerala', lang: 'Malayalam', icon: '📰', color: '#1b5e20' },
  { handle: 'News18Kerala', name: 'News18 Kerala', state: 'Kerala', lang: 'Malayalam', icon: '📺', color: '#2e7d32' },

  // West Bengal
  { handle: 'abpanandaTV', name: 'ABP Ananda', state: 'West Bengal', lang: 'Bengali', icon: '📺', color: '#283593' },
  { handle: 'News18Bangla', name: 'News18 Bangla', state: 'West Bengal', lang: 'Bengali', icon: '📺', color: '#e65100' },
  { handle: 'Zee24Ghanta', name: 'Zee 24 Ghanta', state: 'West Bengal', lang: 'Bengali', icon: '📺', color: '#1565c0' },

  // Maharashtra
  { handle: 'abpmajhatv', name: 'ABP Majha', state: 'Maharashtra', lang: 'Marathi', icon: '📺', color: '#c62828' },
  { handle: 'TV9MarathiLive', name: 'TV9 Marathi', state: 'Maharashtra', lang: 'Marathi', icon: '📺', color: '#e65100' },
  { handle: 'Zee24Taas', name: 'Zee 24 Taas', state: 'Maharashtra', lang: 'Marathi', icon: '📺', color: '#1565c0' },
  { handle: 'News18Marathi', name: 'News18 Marathi', state: 'Maharashtra', lang: 'Marathi', icon: '📺', color: '#e65100' },

  // Gujarat
  { handle: 'TV9GujaratiNews', name: 'TV9 Gujarati', state: 'Gujarat', lang: 'Gujarati', icon: '📺', color: '#ef6c00' },
  { handle: 'News18Gujarati', name: 'News18 Gujarati', state: 'Gujarat', lang: 'Gujarati', icon: '📺', color: '#e65100' },

  // Punjab / Haryana
  { handle: 'PTCNews', name: 'PTC News', state: 'Punjab', lang: 'Punjabi', icon: '📺', color: '#f9a825' },
  { handle: 'News18Punjab', name: 'News18 Punjab', state: 'Punjab', lang: 'Punjabi', icon: '📺', color: '#2e7d32' },

  // Uttar Pradesh
  { handle: 'News18UP', name: 'News18 UP', state: 'Uttar Pradesh', lang: 'Hindi', icon: '📺', color: '#e65100' },
  { handle: 'ABPNewsUP', name: 'ABP Ganga', state: 'Uttar Pradesh', lang: 'Hindi', icon: '📺', color: '#b71c1c' },

  // Madhya Pradesh / Chhattisgarh
  { handle: 'News18MPChhattisgarh', name: 'News18 MP Chhattisgarh', state: 'Madhya Pradesh', lang: 'Hindi', icon: '📺', color: '#e65100' },

  // Telangana / Andhra Pradesh
  { handle: 'TV9TeluguLive', name: 'TV9 Telugu', state: 'Telangana', lang: 'Telugu', icon: '📺', color: '#4a148c' },
  { handle: 'ntvtelugu', name: 'NTV Telugu', state: 'Andhra Pradesh', lang: 'Telugu', icon: '📡', color: '#6a1b9a' },
  { handle: 'abntelugutv', name: 'ABN Telugu', state: 'Andhra Pradesh', lang: 'Telugu', icon: '📺', color: '#4a148c' },
  { handle: 'News18Telangana', name: 'News18 Telangana', state: 'Telangana', lang: 'Telugu', icon: '📺', color: '#e65100' },

  // Odisha
  { handle: 'OTVKhabar', name: 'OTV News', state: 'Odisha', lang: 'Odia', icon: '📡', color: '#0277bd' },
  { handle: 'News18Odia', name: 'News18 Odia', state: 'Odisha', lang: 'Odia', icon: '📺', color: '#e65100' },

  // Assam / North East
  { handle: 'News18AssamNortheastLive', name: 'News18 Assam NE', state: 'Assam', lang: 'Assamese', icon: '📺', color: '#2e7d32' },
  { handle: 'PratidinTime', name: 'Pratidin Time', state: 'Assam', lang: 'Assamese', icon: '📺', color: '#d32f2f' },
  { "handle": "etvandhrapradesh", "name": "ETV Andhra Pradesh", "state": "Andhra Pradesh", "lang": "Telugu", "icon": "📺", "color": "#d32f2f" },
  { "handle": "ddnewsarunachal4576", "name": "DD News Arunachal", "state": "Arunachal Pradesh", "lang": "English", "icon": "📺", "color": "#1976d2" },
  { "handle": "aninewsindia", "name": "ANI News India", "state": "Assam", "lang": "English", "icon": "📺", "color": "#455a64" },
  { "handle": "biharinews", "name": "Bihari News", "state": "Bihar", "lang": "Hindi", "icon": "📺", "color": "#6a1b9a" },
  { "handle": "ibc24innews", "name": "IBC24 News", "state": "Chhattisgarh", "lang": "Hindi", "icon": "📺", "color": "#c62828" },
  { "handle": "prudentmediagoatv", "name": "Prudent Media Goa TV", "state": "Goa", "lang": "Konkani", "icon": "📺", "color": "#2e7d32" },
  { "handle": "news18gujarati", "name": "News18 Gujarati", "state": "Gujarat", "lang": "Gujarati", "icon": "📺", "color": "#ad1457" },
  { "handle": "stvharyananews1", "name": "STV Haryana News", "state": "Haryana", "lang": "Hindi", "icon": "📺", "color": "#ef6c00" },
  { "handle": "todayhimachalnews", "name": "Today Himachal News", "state": "Himachal Pradesh", "lang": "Hindi", "icon": "📺", "color": "#1565c0" },
  { "handle": "jkupdate", "name": "JK Update", "state": "Jammu & Kashmir", "lang": "Urdu", "icon": "📺", "color": "#283593" },
  { "handle": "newsjharkhandnj", "name": "News Jharkhand", "state": "Jharkhand", "lang": "Hindi", "icon": "📺", "color": "#00897b" },
  { "handle": "tv9kannada", "name": "TV9 Kannada", "state": "Karnataka", "lang": "Kannada", "icon": "📺", "color": "#e65100" },
  { "handle": "news18kerala", "name": "News18 Kerala", "state": "Kerala", "lang": "Malayalam", "icon": "📺", "color": "#4a148c" },
  { "handle": "cleannewsmp", "name": "Clean News MP", "state": "Madhya Pradesh", "lang": "Hindi", "icon": "📺", "color": "#bf360c" },
  { "handle": "jaimaharashtranews", "name": "Jai Maharashtra News", "state": "Maharashtra", "lang": "Marathi", "icon": "📺", "color": "#1b5e20" },
  { "handle": "sktvmanipur", "name": "SKTV Manipur", "state": "Manipur", "lang": "Manipuri", "icon": "📺", "color": "#6d4c41" },
  { "handle": "meghalayanews24", "name": "Meghalaya News 24", "state": "Meghalaya", "lang": "English", "icon": "📺", "color": "#37474f" },
  { "handle": "ddnewsaizawl", "name": "DD News Aizawl", "state": "Mizoram", "lang": "Mizo", "icon": "📺", "color": "#0277bd" },
  { "handle": "nagalandnewsnetwork4327", "name": "Nagaland News Network", "state": "Nagaland", "lang": "English", "icon": "📺", "color": "#5d4037" },
  { "handle": "otvodisha", "name": "OTV Odisha", "state": "Odisha", "lang": "Odia", "icon": "📺", "color": "#c2185b" },
  { "handle": "news18_punjab", "name": "News18 Punjab", "state": "Punjab", "lang": "Punjabi", "icon": "📺", "color": "#7b1fa2" },
  { "handle": "news18rajasthan", "name": "News18 Rajasthan", "state": "Rajasthan", "lang": "Hindi", "icon": "📺", "color": "#f57c00" },
  { "handle": "sikkimchronicle", "name": "Sikkim Chronicle", "state": "Sikkim", "lang": "English", "icon": "📺", "color": "#388e3c" },
  { "handle": "news18tamilnadu", "name": "News18 Tamil Nadu", "state": "Tamil Nadu", "lang": "Tamil", "icon": "📺", "color": "#d81b60" },
  { "handle": "tnewstelugu", "name": "T News Telugu", "state": "Telangana", "lang": "Telugu", "icon": "📺", "color": "#8e24aa" },
  { "handle": "rplusnews24x7", "name": "R Plus News 24x7", "state": "Tripura", "lang": "Bengali", "icon": "📺", "color": "#0097a7" },
  { "handle": "cleannewsup", "name": "Clean News UP", "state": "Uttar Pradesh", "lang": "Hindi", "icon": "📺", "color": "#c0ca33" },
  { "handle": "todayuttrakhandnews", "name": "Today Uttarakhand News", "state": "Uttarakhand", "lang": "Hindi", "icon": "📺", "color": "#0288d1" },
  { "handle": "republicbangla", "name": "Republic Bangla", "state": "West Bengal", "lang": "Bengali", "icon": "📺", "color": "#b71c1c" }
];

/**
 * Fetch the current live video ID for a YouTube channel handle.
 * Falls back gracefully if the channel isn't live or can't be reached.
 */
async function fetchLiveVideoId(handle) {
  const cacheKey = `yt_live_${handle}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const url = `https://www.youtube.com/@${handle}/live`;
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!resp.ok) return null;
    const html = await resp.text();

    // Method 1: Extract from canonical URL or og:url
    let vid = null;
    const canonMatch = html.match(/<link\s+rel="canonical"\s+href="https:\/\/www\.youtube\.com\/watch\?v=([^"&]+)"/);
    if (canonMatch) vid = canonMatch[1];

    // Method 2: Extract from embedded player vars
    if (!vid) {
      const vidMatch = html.match(/"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
      if (vidMatch) vid = vidMatch[1];
    }

    // Method 3: From og:url meta tag
    if (!vid) {
      const ogMatch = html.match(/<meta\s+property="og:url"\s+content="[^"]*?v=([a-zA-Z0-9_-]{11})/);
      if (ogMatch) vid = ogMatch[1];
    }

    // Verify it's actually a live stream (check for "isLive" in the page)
    const isLive = html.includes('"isLive":true') || html.includes('"isLiveContent":true');

    if (vid) {
      const result = { videoId: vid, isLive };
      cache.set(cacheKey, result);
      return result;
    }
    return null;
  } catch (err) {
    console.error(`[YT] Failed to fetch live ID for @${handle}:`, err.message);
    return null;
  }
}

/**
 * Fetch all channels' live video IDs concurrently.
 * Returns an array of channel objects with their current videoId.
 */
async function fetchAllLiveStreams() {
  const cacheKey = 'all_live_streams';
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  console.log('[YT] Fetching live stream IDs for', CHANNELS.length, 'channels...');

  const results = await Promise.allSettled(
    CHANNELS.map(async (ch) => {
      const live = await fetchLiveVideoId(ch.handle);
      return {
        ...ch,
        videoId: live?.videoId || null,
        isLive: live?.isLive || false,
        embedUrl: live?.videoId
          ? `https://www.youtube.com/embed/${live.videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`
          : null,
        ytLink: `https://www.youtube.com/@${ch.handle}/live`,
      };
    })
  );

  const channels = results.map(r => r.status === 'fulfilled' ? r.value : null).filter(Boolean);

  // Sort: live channels first, then by state
  channels.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    return 0;
  });

  const liveCount = channels.filter(c => c.isLive).length;
  console.log(`[YT] Found ${liveCount}/${channels.length} live channels`);

  cache.set(cacheKey, channels, 600); // 10 min cache for the full list
  return channels;
}

module.exports = { fetchAllLiveStreams, fetchLiveVideoId, CHANNELS };