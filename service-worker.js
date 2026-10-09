const CORE_CACHE='areg-v247-core';
const RUNTIME_CACHE='areg-v247-runtime';

const MEDIA_CACHES=['areg-gallery-preview-v238','areg-space-visited-v1','areg-local-audio-v1'];
const CORE=[
  './index.html',
  './launcher.html',
  './constellation-quest-v246.js?v=247',
  './styles.css?v=245',
  './space-3d-games.css?v=247',
  './app.js?v=247',
  './home-nature-art.jpg',
  './home-space-art.jpg',
  './space-game-1.jpg',
  './space-game-2.jpg',
  './space-game-3.jpg',
  './space-game-4.jpg',
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
          .filter(k=>k.startsWith('areg-')&&k!==CORE_CACHE&&k!==RUNTIME_CACHE&&!MEDIA_CACHES.includes(k))
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

// First paint of installed game must not depend on GitHub roundtrip.
// Heavy 3D modules/textures are stored only once requested, not on first launch.
// New version deploys become visible on the next SW update & reload.
async function networkNavigation(request){
  const url=new URL(request.url);
  const scopePath=new URL(self.registration.scope).pathname;
  const isMain=url.pathname===scopePath||
    url.pathname===scopePath+'index.html'||
    url.pathname===scopePath+'launcher.html';
  if(isMain){
    const source=url.pathname.endsWith('/launcher.html')?'./launcher.html':'./index.html';
    const cached=await caches.match(source,{cacheName:CORE_CACHE});
    if(cached)return cached;
  }
  try{return await fetch(request)}
  catch{
    return (await caches.match(request,{ignoreSearch:true}))
      ||(await caches.match('./index.html',{cacheName:CORE_CACHE}))
      ||Response.error();
  }
}

// Keep only previously requested high-resolution 3D textures and local audio.
// Do not download the whole 300 MB package on launch.
async function persistedMedia(request,cacheName){
  const cache=await caches.open(cacheName);
  const cached=await cache.match(request);
  if(cached)return cached;
  const response=await fetch(request);
  if(response?.ok)cache.put(request,response.clone()).catch(()=>{});
  return response;
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
    event.respondWith(networkNavigation(request));
    return;
  }
  if(url.pathname.includes('/assets/thumbs/')&&/\.webp$/i.test(url.pathname)){
    event.respondWith(persistedMedia(request,MEDIA_CACHES[0]));return;
  }
  if(url.pathname.includes('/assets/space3d/')&&/\.(?:png|jpg|jpeg|webp)$/i.test(url.pathname)){
    event.respondWith(persistedMedia(request,MEDIA_CACHES[1]));return;
  }
  if(url.pathname.includes('/assets/audio/')&&/\.(?:mp3|m4a|aac|wav|ogg)$/i.test(url.pathname)){
    event.respondWith(persistedMedia(request,MEDIA_CACHES[2]));return;
  }

  if(/\.(?:js|css|png|jpe?g|webp|gif|svg|mp3|wav|json|webmanifest)$/i.test(url.pathname)){
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(()=>caches.match(request))
  );
});
