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
  // National
  { handle: 'NDTV',             name: 'NDTV 24x7',     state: 'National',       lang: 'English',  icon: '📡', color: '#FF6600' },
  { handle: 'IndiaToday',       name: 'India Today',    state: 'National',       lang: 'English',  icon: '🔴', color: '#cc0000' },
  { handle: 'republic',         name: 'Republic TV',    state: 'National',       lang: 'English',  icon: '🎙️', color: '#0d47a1' },
  { handle: 'TimesNow',         name: 'Times Now',      state: 'National',       lang: 'English',  icon: '📺', color: '#e01a1a' },
  { handle: 'WIONews',          name: 'WION',           state: 'National',       lang: 'English',  icon: '🌍', color: '#1a88e0' },
  { handle: 'DDNewsOfficial',   name: 'DD News',        state: 'National',       lang: 'Hindi',    icon: '🏛️', color: '#138808' },
  { handle: 'aabortvnews',      name: 'ABP News',       state: 'National',       lang: 'Hindi',    icon: '📰', color: '#b71c1c' },
  { handle: 'AajTak',           name: 'Aaj Tak',        state: 'National',       lang: 'Hindi',    icon: '📻', color: '#FF9933' },
  { handle: 'ZeeNews',          name: 'Zee News',       state: 'National',       lang: 'Hindi',    icon: '📡', color: '#1565c0' },
  // Regional
  { handle: 'TV9Kannada',       name: 'TV9 Kannada',    state: 'Karnataka',      lang: 'Kannada',  icon: '📺', color: '#e65100' },
  { handle: 'PublicTVNewsKannada', name: 'Public TV',   state: 'Karnataka',      lang: 'Kannada',  icon: '📡', color: '#f57f17' },
  { handle: 'ThanthiTV',        name: 'Thanthi TV',     state: 'Tamil Nadu',     lang: 'Tamil',    icon: '📺', color: '#d50000' },
  { handle: 'SunNews',          name: 'Sun News',       state: 'Tamil Nadu',     lang: 'Tamil',    icon: '☀️', color: '#ff6f00' },
  { handle: 'AsianetNewsML',    name: 'Asianet News',   state: 'Kerala',         lang: 'Malayalam',icon: '📺', color: '#00695c' },
  { handle: 'maboramanews',     name: 'Manorama News',  state: 'Kerala',         lang: 'Malayalam',icon: '📰', color: '#1b5e20' },
  { handle: 'TV9Telugu',        name: 'TV9 Telugu',     state: 'Telangana',      lang: 'Telugu',   icon: '📺', color: '#4a148c' },
  { handle: 'ABPAnandaTV',      name: 'ABP Ananda',     state: 'West Bengal',    lang: 'Bengali',  icon: '📺', color: '#283593' },
  { handle: 'TV9GujaratiOnline',name: 'TV9 Gujarati',   state: 'Gujarat',        lang: 'Gujarati', icon: '📺', color: '#ef6c00' },
  { handle: 'ABPMajhaTV',       name: 'ABP Majha',      state: 'Maharashtra',    lang: 'Marathi',  icon: '📺', color: '#c62828' },
  { handle: 'PTCNews',          name: 'PTC News',       state: 'Punjab',         lang: 'Punjabi',  icon: '📺', color: '#f9a825' },
  { handle: 'OTVKhabar',        name: 'OTV News',       state: 'Odisha',         lang: 'Odia',     icon: '📡', color: '#0277bd' },
  { handle: 'PratidinTime',     name: 'Pratidin Time',  state: 'Assam',          lang: 'Assamese', icon: '📺', color: '#2e7d32' },
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
