// Service worker — PWA registration only, no fetch caching.
const CACHE_NAME = "equilibraco-v5";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Clear all old caches on activation
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

// No fetch handler — all requests go directly to the network.
