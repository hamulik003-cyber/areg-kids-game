const CACHE = 'areg-kids-game-v19';
const CORE = [
  './launcher.html',
  './', './index.html', './styles.css', './app.js', './v9-fix.js', './manifest.webmanifest',
  './avatar-frame.png?v=19', './logo.png?v=19', './star-counter.png?v=19', './settings.png?v=19',
  './nature.png?v=19', './space.png?v=19', './mind.png?v=19', './create.png?v=19', './magic.png?v=19', './bottom-landscape.png?v=19',
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
