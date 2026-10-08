#!/usr/bin/env node
// V243: verify first Space section cards are decoded BEFORE reveal, and
// the WebGL module is prewarmed without showing a cream blank stage.
import { chromium, webkit } from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try {
 await pause(850);
 const isWebKit=process.env.AREG_BROWSER==='webkit';
 browser=isWebKit?await webkit.launch({headless:true}):
   await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});
 const page=await ctx.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let artRequests=0, engineRequests=0;
 await page.route(/space-game-[1-4]\.jpg(\?.*)?$/,async route=>{
   artRequests++; await pause(500);await route.continue();
 });
 await page.route(/space-3d-games\.js\?v=242/,async route=>{
   engineRequests++;await pause(1100);await route.continue();
 });
 await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=243',{waitUntil:'domcontentloaded',timeout:45000});
 await page.waitForSelector('#homeScreen .section-card',{timeout:25000});
 await page.locator('.section-card[data-section="space"]').click({force:true});
 await page.waitForSelector('#sectionScreen.is-visible',{timeout:23000});
 const d=await page.evaluate(()=>{
   const images=[...document.querySelectorAll('#sectionGames .toddler-game-card img')];
   return {count:images.length,allDecoded:images.every(x=>x.complete&&x.naturalWidth>0),names:images.map(x=>x.src.split('/').pop())};
 });
 if(d.count!==4||!d.allDecoded)throw Error('White Space game cards after section reveal: '+JSON.stringify(d));
 await page.waitForFunction(()=>typeof window.AregSpace3D?.spaceSearch==='function',null,{timeout:25000});
 await page.locator('#sectionGames .toddler-game-card[data-game="space-search"]').click({force:isWebKit});
 await page.waitForSelector('#activityScreen.is-visible',{timeout:26000});
 const data=await page.evaluate(()=>{
   const root=document.querySelector('#activityContent');
   const style=getComputedStyle(root);
   return {darkLoading:root.classList.contains('space-preparing'),
     background:style.backgroundColor};
 });
 if(!data.darkLoading)throw Error('3D dark boot backdrop class absent');
 await page.waitForSelector('#activityContent .s3d-canvas',{timeout:30000});
 await page.waitForFunction(()=>document.querySelector('.s3d-prompt strong')?.textContent?.includes('Գտի՛ր'),null,{timeout:25000});
 if(errors.length)throw Error('JS errors: '+errors.join('; '));
 console.log('V243_SPACE_ENTRY_PASS '+JSON.stringify({...d,...data,artRequests,engineRequests,browser:isWebKit?'WebKit':'Chromium'}));
}catch(e){console.error('V243_SPACE_ENTRY_FAIL '+e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
