"use strict";
// Stable launcher/service-worker live entirely under the installed immutable Git commit.
// This path is separate from production DotKiosk and from the experimental branch's SW.
const SOURCE="https://raw.githack.com/hamulik003-cyber/areg-kids-game/";
const API="https://api.github.com/repos/hamulik003-cyber/areg-kids-game/git/ref/heads/trial/areg-test-full-app-20261017";
const UPDATER="(()=>{\n\"use strict\";\nconst ACTIVE_SHA=__AREG_ACTIVE_SHA__;\nconst API=\"__AREG_API__\";\nconst KEY=\"areg-live:last-good-commit\";\nlet busy=false;\nasync function check(){\n  if(busy || document.visibilityState===\"hidden\")return;\n  busy=true;\n  try{\n    const answer=await fetch(API+\"?t=\"+Date.now(),{cache:\"no-store\",headers:{Accept:\"application/vnd.github+json\"}});\n    if(!answer.ok) return;\n    const data=await answer.json();\n    const next=data&&data.object&&data.object.sha;\n    if(typeof next===\"string\" && /^[a-f0-9]{40}$/.test(next)){\n      try{localStorage.setItem(KEY,next)}catch(_){}\n      if(next!==ACTIVE_SHA){\n        const nextUrl=new URL(window.location.href);\n        nextUrl.searchParams.set(\"v\",next);\n        window.location.replace(nextUrl.href);\n      }\n    }\n  }catch(_){}\n  finally{busy=false}\n}\nwindow.addEventListener(\"pageshow\",()=>{void check()});\ndocument.addEventListener(\"visibilitychange\",()=>{if(document.visibilityState===\"visible\")void check()});\nwindow.setInterval(()=>{void check()},90000);\n})();";
const PAGE_PATH=new URL("./live-index.html",self.registration.scope).pathname;
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  const url=new URL(event.request.url);
  if(event.request.mode==="navigate" && url.origin===self.location.origin && url.pathname===PAGE_PATH){
    event.respondWith(renderVersion(url));
  }
});
async function renderVersion(url){
  const sha=url.searchParams.get("v");
  if(!sha || !/^[a-f0-9]{40}$/.test(sha)){
    return new Response("<!doctype html><meta charset='utf-8'><p>AREG TEST: Անվավեր տարբերակ։ Վերաբացեք պատկերակը։</p>",{status:400,headers:{"Content-Type":"text/html;charset=utf-8"}});
  }
  const base=SOURCE+sha+"/";
  try{
    const response=await fetch(base+"index.html",{cache:"no-store"});
    if(!response.ok)throw new Error("Version request failed: "+response.status);
    let html=await response.text();
    if(!/<head\b[^>]*>/i.test(html))throw new Error("Missing head");
    const updateScript=UPDATER.replace("__AREG_ACTIVE_SHA__",JSON.stringify(sha)).replace("__AREG_API__",API);
    const extra='<base href="'+base+'"><script>window.__AREG_LIVE_TEST__=true;'+updateScript+'<\/script>';
    html=html.replace(/<head\b[^>]*>/i,match=>match+extra);
    return new Response(html,{status:200,headers:{"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store"}});
  }catch(error){
    const errorText=String(error&&error.message||"Load error").replace(/[<&]/g,"");
    return new Response("<!doctype html><html lang='hy'><meta name='viewport' content='width=device-width,initial-scale=1'><meta charset='utf-8'><body style='font:18px system-ui;background:#102746;color:white;padding:32px;text-align:center'><h2>AREG TEST</h2><p>Նոր խաղը չբացվեց։ Ստուգեք ինտերնետը և սեղմեք թարմացնել։</p><button onclick='location.reload()' style='font:inherit;padding:12px;border-radius:12px'>Թարմացնել</button><p style='font-size:12px'>"+errorText+"</p></body></html>",{status:503,headers:{"Content-Type":"text/html;charset=utf-8","Cache-Control":"no-store"}});
  }
}