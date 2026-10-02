const CACHE = 'areg-kids-game-v1';
const CORE = [
  './','./index.html','./styles.css','./app.js','./manifest.webmanifest',
  './assets/ui/avatar-frame.png','./assets/ui/logo.png','./assets/ui/star-counter.png','./assets/ui/settings.png',
  './assets/ui/nature.png','./assets/ui/space.png','./assets/ui/mind.png','./assets/ui/create.png','./assets/ui/magic.png','./assets/ui/bottom-landscape.png',
  './assets/audio/menu-music.wav','./assets/audio/tap.wav',
  './assets/icons/icon-192.png','./assets/icons/icon-512.png',
  './assets/themes/day.svg','./assets/themes/night.svg','./assets/themes/winter.svg','./assets/themes/rain.svg','./assets/themes/aurora.svg',
  './assets/themes/wood.svg','./assets/themes/forest.svg','./assets/themes/ocean.svg','./assets/themes/sunset.svg','./assets/themes/space.svg'
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
