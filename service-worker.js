const CACHE = 'areg-kids-game-v4';
const CORE = [
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './avatar-frame.png','./logo.png','./star-counter.png','./settings.png',
  './nature.png','./space.png','./mind.png','./create.png','./magic.png','./bottom-landscape.png',
  './menu-music.wav','./tap.wav',
  './icon-192.png','./icon-512.png',
  './day.svg','./night.svg','./winter.svg','./rain.svg','./aurora.svg',
  './wood.svg','./forest.svg','./ocean.svg','./sunset.svg','./space.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(resp => {
    const clone = resp.clone(); caches.open(CACHE).then(cache => cache.put(event.request, clone)); return resp;
  }).catch(() => caches.match('./index.html'))));
});
