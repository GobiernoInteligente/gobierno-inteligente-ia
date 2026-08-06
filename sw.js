const CACHE_NAME = 'ia-bot-alcaldia-digital-v1.2.6';
const OFFLINE_SHELL = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const coreFile =
    event.request.mode === 'navigate' ||
    /\/(index\.html|app\.js|styles\.css|sw\.js|cloud-bootstrap\.js|limpiar-cache\.html)$/.test(url.pathname);

  if (coreFile) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => {
        if (event.request.mode === 'navigate') {
          return new Response(
            '<h1>Sin conexión</h1><p>Conéctese a internet para cargar la versión actual.</p>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
        return Response.error();
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'no-cache' })
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
