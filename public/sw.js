// VoiceGuard Service Worker
// Provides offline support, app shell caching, and Web Push notifications.

const CACHE_NAME = 'voiceguard-v2'

// Pages to cache immediately on install (app shell)
const PRECACHE_URLS = [
  '/',
  '/login',
  '/offline',
]

// ── Install: pre-cache the app shell ─────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

// ── Activate: clean up old caches ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first for API calls, cache-first for static assets ────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // API routes: always go to network (never cache API responses)
  if (url.pathname.startsWith('/api/')) return

  // For navigation requests: network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline').then((r) => r || new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // Static assets (_next/static): cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((c) => c.put(request, clone))
          return res
        })
      )
    )
    return
  }
})

// ── Push: show OS-level notification when a push message arrives ──────────────
// This fires even when the browser tab is closed or the user is on another app.
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'VoiceGuard Alert', body: event.data ? event.data.text() : 'New security alert' }
  }

  const title = data.title || '\uD83D\uDD14 VoiceGuard Alert'
  const options = {
    body: data.body || 'A new cybersecurity alert has been issued.',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'voiceguard-alert',
    data: { url: data.url || '/alerts' },
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'view', title: 'View Alert' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification click: open/focus the alerts page ────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') return

  const targetUrl = event.notification.data?.url || '/alerts'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there is already a window open, focus it
      for (const client of clientList) {
        const clientUrl = new URL(client.url)
        if (clientUrl.pathname === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
