#!/usr/bin/env node
// V284 regression: an OLD cache-first index.html must NOT trap browser,
// DotKiosk or offline PWA on obsolete game names after successful deployment.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const webkitMode=process.env.AREG_BROWSER==='webkit';
const browserType=webkitMode?webkit:chromium;
const server=spawn('python3',['-m','http.server','8767','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
  await sleep(1200);
  browser=await browserType.launch(webkitMode
    ?{headless:true}
    :{headless:true,channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:390,height:844},
    deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:8767/';
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(async ()=>{
    await navigator.serviceWorker.register('./service-worker.js?v=284',
      {updateViaCache:'none'});
  });
  // Poll real SW lifecycle rather than waiting for 'updatefound' AFTER it
  // may already have fired. Some Safari/Chrome CI runs install asynchronously.
  try{
    await page.waitForFunction(async()=>{
      const reg=await navigator.serviceWorker.getRegistration('./');
      return reg?.active?.state==='activated';
    },null,{timeout:45000});
  }catch(error){
    const swStates=await page.evaluate(async()=>({
      registrations:(await navigator.serviceWorker.getRegistrations()).map(reg=>({
        scope:reg.scope,
        active:reg.active?.state,waiting:reg.waiting?.state,
        installing:reg.installing?.state,script:reg.active?.scriptURL
      })),
      cacheNames:await caches.keys(),
      online:navigator.onLine
    }));
    throw Error('V284 service worker activation '+error.message+
      ' '+JSON.stringify(swStates));
  }
  if(!await page.evaluate(()=>!!navigator.serviceWorker.controller)){
    await page.reload({waitUntil:'domcontentloaded'});
  }
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,null,{timeout:20000});
  const bootstrap=await page.evaluate(async()=>{
    const core=await caches.open('areg-v284-core');
    const original=await core.match('./index.html');
    if(!original)throw Error('Expected offline HTML core cache absent');
    const html=await original.text();
    const marker='<meta name="areg-qa-deliberately-stale" content="1">';
    if(!html.includes('<script src="app.js?v=284"></script>'))
      throw Error('Installed V284 HTML script query absent');
    if(html.includes(marker))throw Error('Unexpected old injected marker');
    const old=html.replace('<script src="app.js?v=284"></script>',
      marker+'<script src="app.js?v=284"></script>');
    await core.put('./index.html',new Response(old,
      {status:200,headers:{'Content-Type':'text/html; charset=utf-8'}}));
    localStorage.setItem('areg-stars-reset-v40','1');
    localStorage.setItem('areg-stars-v35','17');
    return {injected:!!(await core.match('./index.html'))};
  });
  if(!bootstrap.injected)throw Error('Cannot seed old index');
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#homeScreen .section-card');
  const fresh=await page.evaluate(async()=>{
    const cache=await caches.open('areg-v284-core');
    return {oldMarker:!!document.querySelector('meta[name="areg-qa-deliberately-stale"]'),
      revalidated:(await (await cache.match('./index.html')).text())
        .includes('app.js?v=284'),
      cacheStillStale:(await (await cache.match('./index.html')).text())
        .includes('areg-qa-deliberately-stale'),
      wallet:localStorage.getItem('areg-stars-v35'),
      controller:navigator.serviceWorker.controller?.scriptURL||''};
  });
  if(fresh.oldMarker||fresh.cacheStillStale||!fresh.revalidated||
     fresh.wallet!=='17'||!fresh.controller.includes('v=284'))
    throw Error('V284 ONLINE did not replace stale cached homepage '+JSON.stringify(fresh));
  await page.locator('.section-card[data-section="space"]').click();
  await page.waitForSelector('#sectionScreen.is-visible');
  const titles=await page.locator('.toddler-game-card[data-game="space-search"] .toddler-game-label, .toddler-game-card[data-game="constellation-game"] .toddler-game-label')
    .allTextContents();
  if(titles.length!==2||titles[0]!=='Գտիր ճիշտ մոլորակը'||
     titles[1]!=='Գտիր ճիշտ աստղապատկերը')
    throw Error('V283 Space game title changes not in fresh navigation '+JSON.stringify(titles));
  await context.setOffline(true);
  const offlineSignal=await page.evaluate(()=>navigator.onLine);
  console.log('V284 offline navigator.onLine before reload '+JSON.stringify({engine:webkitMode?'webkit':'chromium',offlineSignal}));
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#homeScreen .section-card');
  const offline=await page.evaluate(()=>({wallet:localStorage.getItem('areg-stars-v35'),
    stale:!!document.querySelector('meta[name="areg-qa-deliberately-stale"]'),
    offlineController:!!navigator.serviceWorker?.controller}));
  if(offline.wallet!=='17'||offline.stale||!offline.offlineController)
    throw Error('V284 OFFLINE core/home or saved stars broken '+JSON.stringify(offline));
  if(errors.length)throw Error('Page JS errors '+JSON.stringify(errors));
  console.log('V284 SW ONLINE FRESH + TWO TITLES + OFFLINE RECOVERY + WALLET PASS',
    JSON.stringify({engine:webkitMode?'webkit':'chromium',titles,offline,fresh}));
}catch(e){
  console.error('V284 SW BROWSER FAIL '+(e.stack||e));
  process.exitCode=1;
}finally{
  await browser?.close();
  server.kill();
}
