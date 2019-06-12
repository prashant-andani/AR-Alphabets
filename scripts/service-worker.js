const CACHE_NAME = 'static-cache';
const urlsToCache = [
  '/index.html',
  '/styles/style.css',
  '/build/app.build.js',
  '/assets/pattern-letterG.patt',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)),
  );
});

addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // if valid response is found in cache return it
      }
      return fetch(event.request) // fetch from internet
        .then(res => caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request.url, res.clone()); // save the response for future
            return res; // return the fetched data
          }),)
        .catch((err) => {
          // fallback mechanism
          caches
            .open(CACHE_CONTAINING_ERROR_MESSAGES)
            .then(cache => cache.match('/offline.html'));
        });
    }),
  );
});
