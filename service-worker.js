const CORE_CACHE='areg-v237-core';
const RUNTIME_CACHE='areg-v237-runtime';

const CORE=[
  './index.html',
  './launcher.html',
  './styles.css?v=139',
  './space-3d-games.css?v=232',
  './app.js?v=237',
  './space-3d-games.js?v=232',
  './blackhole-interstellar.js?v=232',
  './assets/space3d/black-hole-reference-v216.webp?v=232',
  './vendor/three.module.min.js',
  './home-nature-art.jpg',
  './home-space-art.jpg',
  './home-mind-art.jpg',
  './home-create-art.jpg',
  './home-magic-art.jpg',
  './logo.png',
  './avatar-frame.png',
  './bottom-landscape.png',
  './settings.png',
  './star-counter.png',
  './nature.png',
  './space.png',
  './mind.png',
  './create.png',
  './magic.png',
  './theme-bg-ocean.svg',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CORE_CACHE)
      .then(cache=>cache.addAll(CORE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys
          .filter(k=>k.startsWith('areg-')&&k!==CORE_CACHE&&k!==RUNTIME_CACHE)
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

// Open the already installed game without waiting for GitHub Pages.
// Updates remain versioned: app.js calls registration.update(), and each new
// service worker populates a fresh CORE_CACHE before activation.
async function fastNavigation(request){
  const url=new URL(request.url);
  const scopePath=new URL(self.registration.scope).pathname;
  const inGameRoot=url.pathname===scopePath||
    url.pathname===scopePath+'index.html'||
    url.pathname===scopePath+'launcher.html';
  if(inGameRoot){
    const target=url.pathname.endsWith('/launcher.html')?'./launcher.html':'./index.html';
    const cached=await caches.match(target,{cacheName:CORE_CACHE});
    if(cached)return cached;
  }
  try{
    const response=await fetch(request);
    return response;
  }catch{
    return (await caches.match(request,{ignoreSearch:true}))
      ||(await caches.match('./index.html',{cacheName:CORE_CACHE}))
      ||Response.error();
  }
}

async function cacheFirst(request){
  const cached=await caches.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response&&response.ok){
    const cache=await caches.open(RUNTIME_CACHE);
    cache.put(request,response.clone()).catch(()=>{});
  }
  return response;
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;

  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  if(request.mode==='navigate'){
    event.respondWith(fastNavigation(request));
    return;
  }

  if(/\.(?:js|css|png|jpe?g|webp|gif|svg|mp3|wav|json|webmanifest)$/i.test(url.pathname)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(()=>caches.match(request))
  );
});
