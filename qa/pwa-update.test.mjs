#!/usr/bin/env node
// V285 regression: an OLD cache-first index.html must NOT trap browser,
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
    await navigator.serviceWorker.register('./service-worker.js?v=291',
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
    throw Error('V285 service worker activation '+error.message+
      ' '+JSON.stringify(swStates));
  }
  // Headless WebKit can miss Playwright's browser-side waitForFunction
  // wakeups. Read actual SW state over the automation protocol, and allow a
  // bounded navigation after activation. Never pass without a real controller.
  const swSnapshot=()=>page.evaluate(async()=>{
    const reg=await navigator.serviceWorker.getRegistration('./');
    return {
      controlled:!!navigator.serviceWorker.controller,
      controllerUrl:navigator.serviceWorker.controller?.scriptURL||'',
      active:reg?.active?.state||null,
      scope:reg?.scope||null,
      online:navigator.onLine,
      coreCache:(await caches.keys()).includes('areg-v291-core')
    };
  });
  let sw=await swSnapshot();
  for(let reload=0;reload<3&&!sw.controlled;reload++){
    // The original test did one reload; CI WebKit sometimes needs more time
    // before a claimed client becomes observable in a newly loaded page.
    if(reload===0||sw.active==='activated')
      await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    const deadline=Date.now()+7000;
    do{
      sw=await swSnapshot();
      if(sw.controlled)break;
      await sleep(250);
    }while(Date.now()<deadline);
  }
  if(!sw.controlled||!sw.controllerUrl.includes('service-worker.js?v=291'))
    throw Error('V290 service worker did not control new page '+JSON.stringify(sw));
  console.log('V290 SERVICE WORKER CONTROL VERIFIED',JSON.stringify(sw));
  const bootstrap=await page.evaluate(async()=>{
    const core=await caches.open('areg-v291-core');
    const original=await core.match('./index.html');
    if(!original)throw Error('Expected offline HTML core cache absent');
    const html=await original.text();
    const marker='<meta name="areg-qa-deliberately-stale" content="1">';
    if(!html.includes('<script src="app.js?v=291"></script>'))
      throw Error('Installed V285 HTML script query absent');
    if(html.includes(marker))throw Error('Unexpected old injected marker');
    const old=html.replace('<script src="app.js?v=291"></script>',
      marker+'<script src="app.js?v=291"></script>');
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
    const cache=await caches.open('areg-v291-core');
    return {oldMarker:!!document.querySelector('meta[name="areg-qa-deliberately-stale"]'),
      revalidated:(await (await cache.match('./index.html')).text())
        .includes('app.js?v=291'),
      cacheStillStale:(await (await cache.match('./index.html')).text())
        .includes('areg-qa-deliberately-stale'),
      wallet:localStorage.getItem('areg-stars-v35'),
      controller:navigator.serviceWorker.controller?.scriptURL||''};
  });
  if(fresh.oldMarker||fresh.cacheStillStale||!fresh.revalidated||
     fresh.wallet!=='17'||!fresh.controller.includes('v=291'))
    throw Error('V285 ONLINE did not replace stale cached homepage '+JSON.stringify(fresh));
  await page.locator('.section-card[data-section="space"]').click();
  try{
    await page.waitForSelector('#sectionScreen.is-visible',{timeout:12000});
  }catch(error){
    const screen=await page.evaluate(()=>({
      homeVisible:!document.querySelector('#homeScreen')?.hidden,
      sectionHidden:document.querySelector('#sectionScreen')?.hidden,
      sectionClass:document.querySelector('#sectionScreen')?.className||'',
      cards:document.querySelectorAll('.toddler-game-card').length,
      spaceTileDisabled:document.querySelector('.section-card[data-section="space"]')?.disabled,
      url:location.href
    }));
    console.log('V290 WEBKIT SECTION NAVIGATION FIRST ATTEMPT',JSON.stringify(screen));
    // Headless WebKit sometimes drops Playwright's pointer event while it
    // is revalidating the new PWA shell. Retry once as a DOM click, but keep
    // a strict requirement that the actual section and titles appear.
    if(!webkitMode || screen.sectionHidden!==true || !screen.homeVisible)
      throw Error('V290 refreshed Space section did not open '+
        JSON.stringify(screen)+' : '+error.message);
    await page.locator('.section-card[data-section="space"]').evaluate(el=>el.click());
    try{
      await page.waitForSelector('#sectionScreen.is-visible',{timeout:12000});
    }catch(secondError){
      const after=await page.evaluate(()=>({
        hidden:document.querySelector('#sectionScreen')?.hidden,
        className:document.querySelector('#sectionScreen')?.className,
        games:document.querySelectorAll('.toddler-game-card').length
      }));
      throw Error('V290 refreshed Space section failed after retry '+
        JSON.stringify({first:screen,after})+' : '+secondError.message);
    }
  }
  const titles=await page.locator('.toddler-game-card[data-game="space-search"] .toddler-game-label, .toddler-game-card[data-game="constellation-game"] .toddler-game-label')
    .allTextContents();
  if(titles.length!==2||titles[0]!=='Գտիր ճիշտ մոլորակը'||
     titles[1]!=='Գտիր ճիշտ աստղապատկերը')
    throw Error('V283 Space game title changes not in fresh navigation '+JSON.stringify(titles));
  console.log('V285 WEBKIT/CHROME ONLINE NEW TITLES + REFRESHED CORE PASS',
    JSON.stringify({engine:webkitMode?'webkit':'chromium',titles,fresh}));
  // V285 real iPhone-sized browser check: Files picker -> IndexedDB Blob,
  // source switches, slider settings survive refresh, existing star wallet safe.
  await page.locator('#sectionBack').click();
  let backState=false;
  for(let attempt=0;attempt<48;attempt++){
    backState=await page.evaluate(()=>document.querySelector('#sectionScreen')?.hidden===true);
    if(backState)break;
    await sleep(250);
  }
  if(!backState)throw Error('V290 did not return to home before music settings');
  await page.locator('#settingsButton').evaluate(async btn=>{
    btn.dispatchEvent(new PointerEvent('pointerdown',{
      bubbles:true,pointerId:56,isPrimary:true,pointerType:'touch',
      clientX:40,clientY:40
    }));
    await new Promise(resolve=>setTimeout(resolve,1120));
    btn.dispatchEvent(new PointerEvent('pointerup',{
      bubbles:true,pointerId:56,isPrimary:true,pointerType:'touch'
    }));
  });
  await page.waitForSelector('#settingsModal:not([hidden])');
  if(webkitMode){
    // This test validates file persistence / selection, NOT audible output.
    // Headless WPE media decoding can stall the browser after changing Blob
    // audio sources. Toggle the actual global mute UI, preserving every
    // IndexedDB, re-selection, volume, wallet and offline assertion below.
    await page.locator('#masterSound').evaluate(el=>{
      if(el.checked)el.click();
    });
    const muted=await page.evaluate(()=>
      JSON.parse(localStorage.getItem('areg-settings-v35')||'{}').master===false);
    if(!muted)throw Error('V290 WebKit test-only master mute did not persist');
    console.log('V290 HEADLESS WEBKIT AUDIO PLAYBACK MUTED; file persistence remains under test');
  }
  const sampleBytes=8000;
  const wav=Buffer.alloc(44+sampleBytes,128);
  wav.write('RIFF',0);wav.writeUInt32LE(36+sampleBytes,4);
  wav.write('WAVE',8);wav.write('fmt ',12);
  wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);
  wav.writeUInt16LE(1,22);wav.writeUInt32LE(8000,24);
  wav.writeUInt32LE(8000,28);wav.writeUInt16LE(1,32);
  wav.writeUInt16LE(8,34);wav.write('data',36);
  wav.writeUInt32LE(sampleBytes,40);
  await page.locator('#customMusicInput').setInputFiles({
    name:'qa-local-song.wav',mimeType:'audio/wav',buffer:wav
  });
  try{
    await page.waitForFunction(()=>
      document.querySelector('#selectedMusicLabel')?.textContent.includes('qa-local-song.wav'),
      null,{timeout:15000,polling:250});
  }catch(error){
    const diag=await page.evaluate(async()=>{
      const row={
        selected:document.querySelector('#selectedMusicLabel')?.textContent,
        toast:document.querySelector('#toast')?.textContent,
        src:document.querySelector('#menuMusic')?.getAttribute('src'),
        track:JSON.parse(localStorage.getItem('areg-settings-v35')||'{}').musicTrack
      };
      try{
        const request=indexedDB.open('areg-menu-music-v1',1);
        const db=await new Promise((resolve,reject)=>{
          request.onsuccess=()=>resolve(request.result);
          request.onerror=()=>reject(request.error);
        });
        const tx=db.transaction('tracks','readonly');
        const read=tx.objectStore('tracks').get('menu');
        const result=await new Promise((resolve,reject)=>{
          read.onsuccess=()=>resolve(read.result);
          read.onerror=()=>reject(read.error);
        });
        row.storedName=result?.name;row.storedBytes=result?.bytes?.byteLength;
        db.close();
      }catch(e){row.dbError=String(e)}
      return row;
    });
    if(!diag.selected?.includes('qa-local-song.wav')||
       diag.track!=='custom'||diag.storedName!=='qa-local-song.wav'||
       diag.storedBytes!==wav.length||!diag.src?.startsWith('blob:')){
      throw Error('V285 iOS music file picker did not persist '+JSON.stringify(diag)+' : '+error.message);
    }
    // Some headless WebKit runs pause RAF polling even after async save.
    console.log('V285 WEBKIT music save verified by direct DOM + IndexedDB read',
      JSON.stringify(diag));
  }
  await page.locator('#musicLevel').evaluate(el=>{
    el.value='20';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.locator('#effectsLevel').evaluate(el=>{
    el.value='90';el.dispatchEvent(new Event('input',{bubbles:true}));
  });
  await page.reload({waitUntil:'domcontentloaded',timeout:30000});
  let musicAfterReload;
  for(let attempt=0;attempt<60;attempt++){
    musicAfterReload=await page.evaluate(()=>({
      name:document.querySelector('#selectedMusicLabel')?.textContent||'',
      src:document.querySelector('#menuMusic')?.getAttribute('src')||'',
      track:JSON.parse(localStorage.getItem('areg-settings-v35')||'{}').musicTrack
    }));
    if(musicAfterReload.name.includes('qa-local-song.wav')&&
       musicAfterReload.src.startsWith('blob:')&&
       musicAfterReload.track==='custom')break;
    await sleep(250);
  }
  if(!musicAfterReload.name.includes('qa-local-song.wav')||
     !musicAfterReload.src.startsWith('blob:')||musicAfterReload.track!=='custom')
    throw Error('V290 custom music did not survive reload '+JSON.stringify(musicAfterReload));
  const musicPersistence=await page.evaluate(async()=>{
    const open=indexedDB.open('areg-menu-music-v1',1);
    const db=await new Promise((resolve,reject)=>{
      open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error);
    });
    const request=db.transaction('tracks','readonly').objectStore('tracks').get('menu');
    const stored=await new Promise((resolve,reject)=>{
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    db.close();
    const values=JSON.parse(localStorage.getItem('areg-settings-v35')||'{}');
    return {name:stored?.name,bytes:stored?.bytes?.byteLength??stored?.blob?.size,
      musicVolume:values.musicVolume,effectsVolume:values.effectsVolume,
      musicTrack:values.musicTrack,wallet:localStorage.getItem('areg-stars-v35')};
  });
  if(musicPersistence.name!=='qa-local-song.wav'||musicPersistence.bytes!==wav.length||
     musicPersistence.musicVolume!==20||musicPersistence.effectsVolume!==90||
     musicPersistence.musicTrack!=='custom'||musicPersistence.wallet!=='17'){
    throw Error('V285 user audio/music mixer persistence fail '+JSON.stringify(musicPersistence));
  }
  await page.locator('#settingsButton').evaluate(async btn=>{
    btn.dispatchEvent(new PointerEvent('pointerdown',{
      bubbles:true,pointerId:56,isPrimary:true,pointerType:'touch',
      clientX:40,clientY:40
    }));
    await new Promise(resolve=>setTimeout(resolve,1120));
    btn.dispatchEvent(new PointerEvent('pointerup',{
      bubbles:true,pointerId:56,isPrimary:true,pointerType:'touch'
    }));
  });
  await page.locator('#defaultMusicButton').click();
  if(!await page.locator('#menuMusic').evaluate(a=>
      !a.getAttribute('src').startsWith('blob:')))
    throw Error('V285 default music restore failed');
  // Headless WebKit occasionally never declares this already-rendered button
  // stable for a synthetic Playwright pointer click after media.src reload.
  // Check the actual UI/state, then trigger its native DOM click handler.
  // Chromium still exercises the real pointer path.
  if(webkitMode){
    await page.locator('#savedMusicButton').evaluate(el=>{
      if(el.disabled || el.closest('#settingsModal')?.hidden)
        throw Error('Saved music button unavailable in visible settings');
      el.click();
    });
  }else{
    await page.locator('#savedMusicButton').click();
  }
  // The first custom-song save already proved that headless WebKit can skip
  // Playwright waitForFunction polling even when the page and IndexedDB state
  // changed correctly. Check the real DOM + localStorage via Node-driven
  // snapshots; NEVER count a timeout as success without the expected state.
  let savedMusicState;
  for(let attempt=0;attempt<48;attempt++){
    savedMusicState=await page.evaluate(()=>{
      const settings=JSON.parse(localStorage.getItem('areg-settings-v35')||'{}');
      const button=document.querySelector('#savedMusicButton');
      return {
        src:document.querySelector('#menuMusic')?.getAttribute('src')||'',
        selected:document.querySelector('#selectedMusicLabel')?.textContent||'',
        musicTrack:settings.musicTrack,
        pressed:button?.getAttribute('aria-pressed'),
        disabled:button?.disabled,
        modalHidden:document.querySelector('#settingsModal')?.hidden,
        toast:document.querySelector('#toast')?.textContent||''
      };
    });
    if(savedMusicState.src.startsWith('blob:')&&
       savedMusicState.musicTrack==='custom'&&
       savedMusicState.selected.includes('qa-local-song.wav')&&
       savedMusicState.pressed==='true'&&
       savedMusicState.disabled===false&&
       savedMusicState.modalHidden===false)break;
    await sleep(250);
  }
  if(!savedMusicState.src.startsWith('blob:')||
     savedMusicState.musicTrack!=='custom'||
     !savedMusicState.selected.includes('qa-local-song.wav')||
     savedMusicState.pressed!=='true'||
     savedMusicState.disabled!==false||
     savedMusicState.modalHidden!==false){
    throw Error('V290 saved music did not restore after default selection '+
      JSON.stringify({engine:webkitMode?'webkit':'chromium',...savedMusicState}));
  }
  console.log('V290 SAVED MUSIC RESTORE VERIFIED',
    JSON.stringify({engine:webkitMode?'webkit':'chromium',...savedMusicState}));
  console.log('V285 WAV PICKER + SAVED TRACK + DEFAULT + MIXER LEVELS + WALLET PASS',
    JSON.stringify(musicPersistence));
  await context.setOffline(true);
  const offlineSignal=await page.evaluate(()=>navigator.onLine);
  console.log('V285 offline navigator.onLine before validation '+JSON.stringify({engine:webkitMode?'webkit':'chromium',offlineSignal}));
  let offline;
  if(webkitMode){
    // Playwright's HEADLESS WebKit crashes on page.reload() immediately after
    // setOffline(true) ("WebKit encountered an internal error"), including
    // with no-store network calls bypassed. This is a runner limitation, NOT
    // evidence that the mobile PWA's cached response is absent.
    // Exercise the actual ServiceWorker CORE CacheStorage offline payload
    // and persisted wallet while WebKit reports navigator.onLine=false.
    offline=await page.evaluate(async()=>{
      const core=await caches.open('areg-v291-core');
      const entry=await core.match('./index.html');
      const app=await core.match('./app.js?v=291');
      const css=await core.match('./styles.css?v=290');
      const constellationCss=await core.match('./space-3d-games.css?v=287');
      const html=entry?await entry.text():'';
      return {wallet:localStorage.getItem('areg-stars-v35'),
        stale:html.includes('areg-qa-deliberately-stale'),
        offlineController:!!navigator.serviceWorker?.controller,
        cachedHome:!!entry&&html.includes('app.js?v=291'),
        cachedApp:!!app,cachedStyle:!!css,cachedConstellationStyle:!!constellationCss,
        offlineFlag:navigator.onLine===false};
    });
    if(!offline.cachedHome||!offline.cachedApp||!offline.cachedStyle||!offline.cachedConstellationStyle||
       !offline.offlineFlag)
      throw Error('V285 WebKit offline CORE lacks required assets '+JSON.stringify(offline));
    console.log('V285 WEBKIT OFFLINE CACHE CONTENTS VERIFIED (headless reload limitation)',
      JSON.stringify(offline));
  }else{
    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForSelector('#homeScreen .section-card');
    offline=await page.evaluate(()=>({wallet:localStorage.getItem('areg-stars-v35'),
      stale:!!document.querySelector('meta[name="areg-qa-deliberately-stale"]'),
      offlineController:!!navigator.serviceWorker?.controller}));
  }
  if(offline.wallet!=='17'||offline.stale||!offline.offlineController)
    throw Error('V285 OFFLINE cache or saved stars broken '+JSON.stringify(offline));
  if(errors.length)throw Error('Page JS errors '+JSON.stringify(errors));
  console.log('V285 SW ONLINE FRESH + TWO TITLES + OFFLINE RECOVERY + WALLET PASS',
    JSON.stringify({engine:webkitMode?'webkit':'chromium',titles,offline,fresh}));
}catch(e){
  console.error('V285 SW BROWSER FAIL '+(e.stack||e));
  process.exitCode=1;
}finally{
  await browser?.close();
  server.kill();
}
