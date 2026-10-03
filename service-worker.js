const CACHE = 'areg-v33-cache-1';
const ASSETS = [
  './','./index.html','./styles.css','./app.js','./launcher.html','./service-worker.js',
  './avatar-frame.png','./bottom-landscape.png','./logo.png','./settings.png','./star-counter.png','./menu-music.mp3',
  './nature.png','./space.png','./mind.png','./create.png','./magic.png',
  './nature-frame-guard.png','./space-frame-guard.png','./mind-frame-guard.png','./create-frame-guard.png','./magic-frame-guard.png',
  './section-nature.png','./section-space.png','./section-mind.png','./section-create.png','./section-magic.png'
];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy));
    return res;
  }).catch(() => caches.match('./index.html'))));
});
