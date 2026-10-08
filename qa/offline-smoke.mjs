#!/usr/bin/env node
// AREG Offline Edition: exercise offline navigation and on-device asset cache.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await delay(900);
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:8765/offline-setup.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(async()=>{
   const r=await navigator.serviceWorker.ready;
   return r.active?.state==='activated'&&document.getElementById('install')?.disabled===false;
 },null,{timeout:30000});
 // Exercise the EXACT same local Cache Storage that full offline setup fills,
 // without downloading ~284 MB during every GitHub build.
 const expected=await page.evaluate(async()=>{
   const response=await fetch('./animal-cat.jpg');
   if(!response.ok)throw Error('Missing offline sample');
   const c=await caches.open('areg-device-assets-v1');
   await c.put(new URL('animal-cat.jpg',location.href).href,response.clone());
   const m=await (await fetch('./offline-assets-v233.json')).json();
   if(m.groups.length!==2)throw Error('Expected both offline asset groups');
   return m.groups.reduce((sum,g)=>sum+g.files.length,0);
 });
 await context.setOffline(true);
 await page.goto('http://127.0.0.1:8765/?kiosk=v233&__areg_build=233',{waitUntil:'domcontentloaded',timeout:15000});
 await page.waitForSelector('#homeScreen .section-card',{timeout:15000});
 const image=await page.evaluate(async()=>{
    const response=await fetch('./animal-cat.jpg?v=93');
    if(!response.ok)throw Error('Offline versioned image was not resolved from device cache');
    const blob=await response.blob();
    if(blob.size<10000)throw Error('Offline cached image was empty');
    return blob.size;
 });
 await page.goto('http://127.0.0.1:8765/offline-setup.html',{waitUntil:'domcontentloaded',timeout:12000});
 await page.waitForSelector('#install',{timeout:12000});
 console.log('OFFLINE PASS: no internet, launcher shell, setup screen, versioned asset from on-device cache, '+expected+' manifest assets; imageBytes='+image);
}catch(e){console.error('OFFLINE FAIL '+e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
