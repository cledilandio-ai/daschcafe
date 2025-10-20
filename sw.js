// ✅ ALTERADO: Nome do cache atualizado para evitar conflitos
const STATIC_CACHE_NAME = 'cafe-dashboard-cache-v9';
const DATA_CACHE_NAME = 'cafe-data-cache-v1';

const FILES_TO_CACHE = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pré-cacheando o App Shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  const url = evt.request.url;

  if (url.includes('docs.google.com/spreadsheets')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            return cache.match(evt.request);
          });
      })
    );
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then((response) => {
      return response || fetch(evt.request);
    })
  );
});