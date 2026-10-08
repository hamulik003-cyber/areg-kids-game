#!/usr/bin/env node
// V238 cross-gallery speed and full-resolution zoom regression.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import fs from 'node:fs';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const results=[],failures=[];let browser;
try{
  await delay(1000);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  const page=await context.newPage();
  page.on('pageerror',e=>failures.push('JS '+e.message));
  await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=2381',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#homeScreen .section-card');
  for(const [section,id,count] of [
    ['nature','animals',30],['nature','birds',30],
    ['nature','sea',33],['nature','insects',30],
    ['space','planets',30],['space','constellations',38]
  ]){
    await page.locator('.section-card[data-section="'+section+'"]').click();
    await page.waitForSelector('#sectionScreen.is-visible');
    await page.locator('#sectionGames .toddler-game-card[data-game="'+id+'"]').click();
    await page.waitForSelector('#activityScreen.is-visible');
    const time=Date.now();
    await page.waitForFunction(()=> {
      const imgs=[...document.querySelectorAll('#activityContent .animal-card img')];
      return imgs.length>=8&&imgs.slice(0,8).every(i=>i.complete&&i.naturalWidth>0);
    },null,{timeout:35000});
    const measured=await page.evaluate(()=>{
      const imgs=[...document.querySelectorAll('#activityContent .animal-card img')];
      return {count:imgs.length,thumb:imgs.every(i=>i.src.includes('/assets/thumbs/')&&i.dataset.fullSrc),
        first8Eager:imgs.slice(0,8).every(i=>i.loading==='eager'),
        previews:imgs.slice(0,8).map(i=>({w:i.naturalWidth,h:i.naturalHeight})),
        originals:imgs.slice(0,8).map(i=>i.dataset.fullSrc)};
    });
    if(measured.count!==count||!measured.thumb||!measured.first8Eager)throw Error(id+': incomplete gallery '+JSON.stringify(measured));
    await page.locator('#activityContent .animal-card').first().click({timeout:20000});
    await page.waitForSelector('.gallery-card-flight-shell',{timeout:8000});
    await page.waitForFunction(()=>{
      const s=document.querySelector('.gallery-card-flight-shell img');
      return !!s&&s.complete&&s.naturalWidth>0;
    },null,{timeout:12000});
    const sample={id,count,readyVisibleMs:Date.now()-time,previewMax:Math.max(...measured.previews.map(v=>Math.max(v.w,v.h)))};
    // Dismiss overlay (audio may be unavailable, don't block the benchmark).
    await page.locator('.gallery-card-flight-host').click({force:true}).catch(()=>{});
    await page.waitForSelector('.gallery-card-flight-host',{state:'detached',timeout:15000});
    await page.locator('#activityBack').click();
    await page.waitForFunction(()=>document.querySelector('#activityScreen')?.hidden===true,null,{timeout:15000});
    await page.locator('#sectionBack').click();
    await page.waitForFunction(()=>document.querySelector('#sectionScreen')?.hidden===true,null,{timeout:15000});
    console.log('V238_GALLERY '+JSON.stringify(sample));
    results.push(sample);
  }
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:20000}).catch(()=>{});
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded',timeout:18000});
  await page.waitForSelector('#homeScreen .section-card');
  await page.locator('.section-card[data-section="nature"]').click();
  await page.waitForSelector('#sectionScreen.is-visible');
  await page.locator('#sectionGames .toddler-game-card[data-game="insects"]').click();
  await page.waitForSelector('#activityScreen.is-visible');
  await page.waitForFunction(()=> {
      const imgs=[...document.querySelectorAll('#activityContent .animal-card img')].slice(0,8);
      return imgs.length===8&&imgs.every(i=>i.complete&&i.naturalWidth>0);
    },null,{timeout:16000});
  results.push({id:'offline-repeat-insects',status:'PASS'});
  console.log('V238_OFFLINE PASS');
  fs.mkdirSync('qa/results',{recursive:true});
  fs.writeFileSync('qa/results/v238-gallery-test.json',JSON.stringify({environment:'Linux Chromium, 390x844@3x; not physical iPhone',results,failures},null,2));
  if(failures.length)throw Error('Browser errors: '+failures.join('; '));
  console.log('V238_GALLERY_PASS '+results.length+' tests');
}catch(e){console.error('V238_GALLERY_FAIL '+e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
