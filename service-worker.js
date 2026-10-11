const CORE_CACHE='areg-v28738-core';
const RUNTIME_CACHE='areg-v28738-runtime';

const MEDIA_CACHES=['areg-gallery-preview-v238','areg-space-visited-v1','areg-local-audio-v1'];
const CORE=[
  './index.html',
  './launcher.html',
  './constellation-quest-v246.js?v=28738',
  './space-finding-session.js?v=285',
  './styles.css?v=285',
  './space-3d-games.css?v=287',
  './app.js?v=28738',
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
          .filter(k=>k.startsWith('areg-')&&k!==CORE_CACHE&&k!==RUNTIME_CACHE&&!MEDIA_CACHES.includes(k)&&k!=='areg-v287-core'&&k!=='areg-v287-runtime')
          .map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  );
});

// First paint of installed game must not depend on GitHub roundtrip.
// Heavy 3D modules/textures are stored only once requested, not on first launch.
// New version deploys become visible on the next SW update & reload.
// V284: the previous cache-FIRST homepage trapped browsers/DotKiosk on old
// index.html (and thus old app.js and old SW registrations) after GitHub
// Pages successfully deployed. Fresh HTML is network-preferred on navigation;
// keep the previous offline-first assets/UV textures/audio and local user data.
async function networkNavigation(request,event){
  const url=new URL(request.url);
  const scopePath=new URL(self.registration.scope).pathname;
  const isMain=url.pathname===scopePath||
    url.pathname===scopePath+'index.html'||
    url.pathname===scopePath+'launcher.html';
  if(isMain){
    const source=url.pathname.endsWith('/launcher.html')?'./launcher.html':'./index.html';
    const cached=await caches.match(source,{cacheName:CORE_CACHE});
    // On iOS/WKWebView airplane mode, do NOT try a network navigation at all.
    // Safari can abort a wholly offline navigation before Promise fallback.
    if(cached&&self.navigator?.onLine===false)return cached;
    // For a slow connection, keep fast startup; finish revalidating in the
    // background so the NEXT launch still sees the latest version. Under
    // normal connectivity the fresh response always wins over stale HTML.
    const fresh=fetch(request,{cache:'no-store'}).then(async response=>{
      if(!response||!response.ok)throw Error('AREG navigation update unavailable');
      const core=await caches.open(CORE_CACHE);
      await core.put(source,response.clone()).catch(()=>{});
      return response;
    });
    // Register background revalidation while the fetch event is active;
    // Safari may reject waitUntil if it is first called after an await.
    event.waitUntil(fresh.catch(()=>{}));
    let handle;
    try{
      const response=await Promise.race([
        fresh,
        new Promise(resolve=>{handle=setTimeout(()=>resolve(null),1200)})
      ]);
      if(response)return response;
    }catch{}
    finally{clearTimeout(handle)}
    if(cached)return cached;
    try{return await fresh}catch{return Response.error()}
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
    event.respondWith(networkNavigation(request,event));
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
