const CACHE='areg-v48-thin-home-shine-1';
const ASSETS=["./", "./index.html", "./styles.css", "./app.js", "./launcher.html", "./service-worker.js", "./avatar-frame.png", "./bottom-landscape.png", "./logo.png", "./settings.png", "./star-counter.png", "./menu-music.mp3", "./nature.png", "./space.png", "./mind.png", "./create.png", "./magic.png", "./nature-frame-guard.png", "./space-frame-guard.png", "./mind-frame-guard.png", "./create-frame-guard.png", "./magic-frame-guard.png", "./hero-nature.jpg", "./nature-game-1.jpg", "./nature-game-2.jpg", "./nature-game-3.jpg", "./nature-game-4.jpg", "./hero-space.jpg", "./space-game-1.jpg", "./space-game-2.jpg", "./space-game-3.jpg", "./space-game-4.jpg", "./hero-mind.jpg", "./mind-game-1.jpg", "./mind-game-2.jpg", "./mind-game-3.jpg", "./mind-game-4.jpg", "./hero-create.jpg", "./create-game-1.jpg", "./create-game-2.jpg", "./create-game-3.jpg", "./create-game-4.jpg", "./hero-magic.jpg", "./magic-game-1.jpg", "./magic-game-2.jpg", "./magic-game-3.jpg", "./magic-game-4.jpg"];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))));
});
