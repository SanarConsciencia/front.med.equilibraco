// Basic service worker for PWA - cache strategy: network first, cache fallback
const CACHE_NAME = "equilibraco-v3";
const urlsToCache = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Never intercept requests to the PDF generator — the SW cannot re-deliver
  // cross-origin binary responses with CORS headers intact, causing ERR_FAILED.
  if (url.includes("kiwi-pdf-equilibaco.up.railway.app")) {
    return; // browser handles this fetch natively, CORS headers preserved
  }

  // Skip non-GET requests and any other cross-origin calls for the same reason.
  if (event.request.method !== "GET" || !url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      }),
  );
});
