const CACHE = 'areg-kids-game-v15';
const CORE = [
  './launcher.html',
  './', './index.html', './styles.css', './app.js', './v9-fix.js', './manifest.webmanifest',
  './avatar-frame.png?v=15', './logo.png?v=15', './star-counter.png?v=15', './settings.png?v=15',
  './nature.png?v=15', './space.png?v=15', './mind.png?v=15', './create.png?v=15', './magic.png?v=15', './bottom-landscape.png?v=15',
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
