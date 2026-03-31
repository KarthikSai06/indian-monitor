/**
 * In-memory translation cache.
 * Key: `${lang}:${id}` → { title, summary }
 * Survives within a session but not across page reloads (intentional — news updates).
 */
const cache = new Map();

export function getCached(lang, id) {
  return cache.get(`${lang}:${id}`) || null;
}

export function setCached(lang, id, data) {
  cache.set(`${lang}:${id}`, data);
}

export function hasCached(lang, id) {
  return cache.has(`${lang}:${id}`);
}

export function clearCache() {
  cache.clear();
}
