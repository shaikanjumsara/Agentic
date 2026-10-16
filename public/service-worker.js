const CACHE_NAME = 'daymark-shell-v2'
const BASE_PATH = '/Agentic/'
const APP_ENTRY = `${BASE_PATH}?pwa-shell=2`
const APP_SHELL = [
  APP_ENTRY,
  `${BASE_PATH}site.webmanifest`,
  `${BASE_PATH}daymark-icon.svg`,
]

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
    self.skipWaiting(),
  ]))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(Promise.all([
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith('daymark-') && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    )),
    self.clients.claim(),
  ]))
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(BASE_PATH)) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone()
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy)))
          }
          return response
        })
        .catch(async () => (await caches.match(request)) ?? caches.match(APP_ENTRY)),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone()
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, responseCopy)))
        }
        return response
      })
    }),
  )
})
