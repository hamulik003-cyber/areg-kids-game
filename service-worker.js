const CORE_CACHE='areg-v207-core';
const RUNTIME_CACHE='areg-v207-runtime';

const CORE=[
  './index.html',
  './launcher.html',
  './styles.css?v=139',
  './space-3d-games.css?v=207',
  './app.js?v=207',
  './space-3d-games.js?v=207',
  './vendor/three.module.min.js',
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

async function networkNavigation(request){
  try{
    return await fetch(request);
  }catch{
    return (await caches.match(request,{ignoreSearch:true}))
      || (await caches.match('./index.html'));
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
    event.respondWith(networkNavigation(request));
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
