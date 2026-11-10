// DMKLab Education K-12 - Offline Service Worker (v1.0.0)
const CACHE_NAME = 'dmklab-offline-v1';
const STATIC_ASSETS = [
  '/',
  '/books',
  '/favicon.ico',
  '/manifest.json',
  '/dmklab-logo.png',
  '/img-web/duc_mai_khoi_lab-removebg-removebg-preview.png'
];

// 1. Install & pre-cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset fetch warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate & cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch strategy: Network First for API, Stale-While-Revalidate for Static / SGK Books
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass API requests to ensure fresh data
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-first / Stale-While-Revalidate for /books and static assets
  if (url.pathname.startsWith('/books') || url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|svg|jpg|jpeg|webp|woff2?|css)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default Network First with offline fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((response) => {
        if (response) return response;
        if (event.request.mode === 'navigate') {
          return caches.match('/books');
        }
        return new Response('Ngoại tuyến: DMKLab Education', { status: 503, statusText: 'Offline' });
      });
    })
  );
});

