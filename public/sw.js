/* ReferralFlow service worker — minimal offline support (no Workbox).
 *
 * v3: split the app-shell precache from a bounded runtime cache so the asset
 * cache can no longer grow without limit across many deployments. The activate
 * handler still deletes every cache that is not one of the current versioned
 * names, so old bundles are evicted on update. Private data is never cached:
 * navigations are network-first, and requests that are cross-origin, carry an
 * Authorization header, or target an API / private CV path bypass the cache
 * entirely. */
const VERSION = "v3";
const SHELL_CACHE = `referralflow-shell-${VERSION}`;
const RUNTIME_CACHE = `referralflow-runtime-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, RUNTIME_CACHE];

const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/manifest.webmanifest", "/icons/icon.svg"];

/** Cap on runtime-cached assets to bound growth across deployments. */
const RUNTIME_MAX_ENTRIES = 64;

/** Trim a cache to its most recent `max` entries (oldest inserted first). */
async function trimCache(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (const request of keys.slice(0, keys.length - max)) {
    await cache.delete(request);
  }
}

/** Requests that must never be served from or written to the cache. */
function shouldBypassCache(request, url) {
  return (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/cvs") ||
    request.headers.has("authorization")
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !CURRENT_CACHES.includes(k))
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // Network-first for navigations, fall back to the offline page.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    return;
  }

  const url = new URL(request.url);

  // Never touch the cache for cross-origin, API, private CV, or authorized
  // requests — future signed CV URLs and private data must not be stored.
  if (shouldBypassCache(request, url)) return;

  // Cache-first for same-origin static assets, with a bounded runtime cache.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          // Only cache complete, same-origin ("basic") successful responses.
          if (!response || !response.ok || response.type !== "basic") {
            return response;
          }
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) =>
            cache.put(request, copy).then(() =>
              trimCache(RUNTIME_CACHE, RUNTIME_MAX_ENTRIES),
            ),
          );
          return response;
        }),
    ),
  );
});
