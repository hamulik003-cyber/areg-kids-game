const CACHE = 'areg-kids-game-v32';
const CORE = [
  './launcher.html',
  './', './index.html', './styles.css', './app.js', './v9-fix.js',
  './avatar-frame.png?v=32', './logo.png?v=32', './star-counter.png?v=32', './settings.png?v=32',
  './nature.png?v=32', './space.png?v=32', './mind.png?v=32', './create.png?v=32', './magic.png?v=32', './bottom-landscape.png?v=32',
  './menu-music.mp3?v=32',
  './nature-frame-guard.png?v=32', './space-frame-guard.png?v=32', './mind-frame-guard.png?v=32', './create-frame-guard.png?v=32', './magic-frame-guard.png?v=32'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    const clone = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, clone));
    return response;
  }).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html'))));
});
