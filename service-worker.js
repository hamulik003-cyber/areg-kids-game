const CACHE='areg-v52-animals-1';
const ASSETS=["./", "./index.html", "./styles.css", "./app.js", "./launcher.html", "./service-worker.js", "./avatar-frame.png", "./bottom-landscape.png", "./logo.png", "./settings.png", "./star-counter.png", "./menu-music.mp3", "./nature.png", "./space.png", "./mind.png", "./create.png", "./magic.png", "./nature-frame-guard.png", "./space-frame-guard.png", "./mind-frame-guard.png", "./create-frame-guard.png", "./magic-frame-guard.png", "./hero-nature.jpg", "./nature-game-1.jpg", "./nature-game-2.jpg", "./nature-game-3.jpg", "./nature-game-4.jpg", "./hero-space.jpg", "./space-game-1.jpg", "./space-game-2.jpg", "./space-game-3.jpg", "./space-game-4.jpg", "./hero-mind.jpg", "./mind-game-1.jpg", "./mind-game-2.jpg", "./mind-game-3.jpg", "./mind-game-4.jpg", "./hero-create.jpg", "./create-game-1.jpg", "./create-game-2.jpg", "./create-game-3.jpg", "./create-game-4.jpg", "./hero-magic.jpg", "./magic-game-1.jpg", "./magic-game-2.jpg", "./magic-game-3.jpg", "./magic-game-4.jpg", "./preset-gummy-bear.svg", "./preset-bunny.svg", "./preset-kitten.svg", "./preset-puppy.svg", "./preset-panda.svg", "./preset-fox.svg", "./preset-lion.svg", "./preset-monkey.svg", "./preset-koala.svg", "./preset-robot.svg",
  "./animal-dog.jpg",
  "./animal-wolf.jpg",
  "./animal-lynx.jpg",
  "./animal-cow.jpg",
  "./animal-horse.jpg",
  "./animal-goat.jpg",
  "./animal-camel.jpg",
  "./animal-sheep.jpg",
  "./animal-cat.jpg",
  "./animal-tiger.jpg",
  "./animal-donkey.jpg",
  "./animal-bull.jpg",
  "./animal-deer.jpg",
  "./animal-bison.jpg",
  "./animal-hippo.jpg",
  "./animal-zebra.jpg",
  "./animal-giraffe.jpg",
  "./animal-elephant.jpg",
  "./animal-rabbit.jpg",
  "./animal-monkey.jpg",
  "./animal-lion.jpg",
  "./animal-bear.jpg",
  "./animal-panda.jpg",
  "./animal-fox.jpg",
  "./animal-pig.jpg",
  "./animal-rhino.jpg",
  "./animal-polar-bear.jpg",
  "./animal-leopard.jpg",
  "./animal-hyena.jpg",
  "./animal-black-panther.jpg"];

self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match('./index.html'))));
});
