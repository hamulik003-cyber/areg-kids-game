const CACHE = 'areg-kids-game-v29';
const CORE = [
  './launcher.html',
  './', './index.html', './styles.css', './app.js', './v9-fix.js',
  './avatar-frame.png?v=29', './logo.png?v=29', './star-counter.png?v=29', './settings.png?v=29',
  './nature.png?v=29', './space.png?v=29', './mind.png?v=29', './create.png?v=29', './magic.png?v=29', './bottom-landscape.png?v=29',
  './menu-music.mp3?v=29',
  './nature-frame-guard.png?v=29', './space-frame-guard.png?v=29', './mind-frame-guard.png?v=29', './create-frame-guard.png?v=29', './magic-frame-guard.png?v=29'
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
