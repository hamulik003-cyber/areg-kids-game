const CACHE = 'areg-kids-game-v8';
const CORE = [
  './', './index.html', './styles.css', './app.js', './manifest.webmanifest',
  './avatar-frame.png', './logo.png', './star-counter.png', './settings.png',
  './nature.png', './space.png', './mind.png', './create.png', './magic.png', './bottom-landscape.png',
  './menu-music.wav', './tap.wav',
  './icon-192.png', './icon-512.png',
  './day.svg', './night.svg', './winter.svg', './rain.svg', './aurora.svg',
  './wood.svg', './forest.svg', './ocean.svg', './sunset.svg', './space.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first so newly uploaded fixes become visible quickly in the installed PWA.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
  );
});
