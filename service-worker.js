// V233 Offline Edition: free, local-first installed iPhone PWA.
const CORE_CACHE='areg-v235-core';
const RUNTIME_CACHE='areg-v235-runtime';
// Keep the user's downloaded assets across future service-worker updates.
const DEVICE_ASSETS='areg-device-assets-v1';
const CORE=[
  './index.html','./manifest.webmanifest?v=235','./launcher.html','./offline-setup.html',
  './offline-assets-v233.json','./styles.css?v=235',
  './space-3d-games.css?v=233','./app.js?v=235',
  './space-3d-games.js?v=233','./blackhole-interstellar.js?v=233',
  './assets/space3d/black-hole-reference-v216.webp?v=233',
  './vendor/three.module.min.js','./logo.png','./avatar-frame.png',
  './bottom-landscape.png','./settings.png','./star-counter.png',
  './nature.png','./space.png','./mind.png','./create.png','./magic.png',
  './theme-bg-ocean.svg','./manifest.webmanifest',
  './icon-192.png','./icon-512.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CORE_CACHE).then(c=>c.addAll(CORE))
    .then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(names=>Promise.all(names
    .filter(n=>n.startsWith('areg-')&&![CORE_CACHE,RUNTIME_CACHE,DEVICE_ASSETS].includes(n))
    .map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
async function offlineNavigation(request){
  const url=new URL(request.url);
  const core=await caches.open(CORE_CACHE);
  const target=url.pathname.endsWith('/launcher.html')?'./launcher.html':
    url.pathname.endsWith('/offline-setup.html')?'./offline-setup.html':'./index.html';
  const cached=await core.match(target);
  // Important: launch instantly from phone. Do not await GitHub network.
  if(cached)return cached;
  try{return await fetch(request)}
  catch{return (await caches.match('./index.html'))||Response.error()}
}
async function offlineAsset(request){
  const url=new URL(request.url);
  const inCore=await caches.match(request);
  if(inCore)return inCore;
  const local=await caches.open(DEVICE_ASSETS);
  const fileURL=url.origin+url.pathname;
  const onDevice=await local.match(fileURL);
  if(onDevice)return onDevice;
  const inRuntime=await caches.open(RUNTIME_CACHE);
  const cached=await inRuntime.match(request)||await inRuntime.match(fileURL,{ignoreSearch:true});
  if(cached)return cached;
  const response=await fetch(request);
  if(response&&response.ok)inRuntime.put(request,response.clone()).catch(()=>{});
  return response;
}
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  // Installer manages its own single local copy, avoiding duplicate caches.
  if(url.searchParams.has('__areg_pack')){
    event.respondWith(fetch(req,{cache:'no-store'}));
    return;
  }
  if(req.mode==='navigate'){event.respondWith(offlineNavigation(req));return;}
  if(/\.(?:js|css|png|jpe?g|webp|gif|svg|mp3|wav|ogg|json|webmanifest)$/i.test(url.pathname)){
    event.respondWith(offlineAsset(req));return;
  }
  event.respondWith(fetch(req).catch(()=>caches.match(req)));
});
