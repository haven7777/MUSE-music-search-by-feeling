const CACHE_NAME = 'muse-v1'
const STATIC_CACHE = 'muse-static-v1'
const MOMENT_CACHE = 'muse-moments-v1'

// App shell files to precache
const APP_SHELL = [
  '/',
  '/moments',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

// Install — precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== MOMENT_CACHE && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin && !url.hostname.includes('scdn.co') && !url.hostname.includes('mzstatic.com') && !url.hostname.includes('audius')) return

  // API calls — network only (don't cache API responses)
  if (url.pathname.startsWith('/api/')) return

  // Navigation requests — network first, fallback to cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/offline')))
    )
    return
  }

  // Images (album art, etc.) — cache first, then network
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(MOMENT_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => new Response('', { status: 404 }))
      })
    )
    return
  }

  // Static assets (JS, CSS, fonts) — stale-while-revalidate
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font' || url.pathname.startsWith('/_next/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        }).catch(() => cached)

        return cached || fetchPromise
      })
    )
    return
  }
})

// Trim cache to max entries — prevents unbounded growth
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  if (keys.length > maxEntries) {
    await Promise.all(keys.slice(0, keys.length - maxEntries).map((k) => cache.delete(k)))
  }
}

// Periodically trim caches after activation
self.addEventListener('activate', () => {
  trimCache(MOMENT_CACHE, 200)
  trimCache(STATIC_CACHE, 100)
})

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
