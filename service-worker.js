const CACHE = 'areg-kids-game-v31';
const CORE = [
  './launcher.html',
  './', './index.html', './styles.css', './app.js', './v9-fix.js',
  './avatar-frame.png?v=31', './logo.png?v=31', './star-counter.png?v=31', './settings.png?v=31',
  './nature.png?v=31', './space.png?v=31', './mind.png?v=31', './create.png?v=31', './magic.png?v=31', './bottom-landscape.png?v=31',
  './menu-music.mp3?v=31',
  './nature-frame-guard.png?v=31', './space-frame-guard.png?v=31', './mind-frame-guard.png?v=31', './create-frame-guard.png?v=31', './magic-frame-guard.png?v=31'
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
