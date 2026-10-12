#!/usr/bin/env node
// Standalone, non-production visual smoke for five fresh WebGL reward concepts.
import { chromium, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
const engine=process.env.AREG_BROWSER==='webkit'?'webkit':'chromium';
const runner=engine==='webkit'?webkit:chromium;
const server=spawn('python3',['-m','http.server','8995','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const errors=[];
try {
 await delay(900);
 browser=engine==='webkit'?await runner.launch({headless:true}):await runner.launch({headless:true,channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 page.on('pageerror',err=>errors.push(err.message));
 page.on('console',msg=>{if(msg.type()==='error')errors.push('CONSOLE '+msg.text())});
 page.on('requestfailed',req=>{if(req.url().endsWith('three.module.min.js'))errors.push('Three module request failed: '+req.failure()?.errorText)});
 await page.goto('http://127.0.0.1:8995/reward-worlds-real3d-five.html',{waitUntil:'load',timeout:50000});
 await page.waitForFunction(()=>window.__AREG_3D_PREVIEW__?.is3D===true,{timeout:40000});
 await mkdir('reward-preview-screenshots',{recursive:true});
 if(await page.locator('#viewport canvas').count()!==1)throw new Error('WebGL canvas not created');
 for(let i=0;i<5;i++){
  await page.locator('.tab[data-n="'+i+'"]').click();
  await page.waitForTimeout(300);
  const state=await page.evaluate(()=>window.__AREG_3D_PREVIEW__.getState());
  if(state.scene!==i)throw new Error('Scene switch failure '+i);
  await page.screenshot({path:'reward-preview-screenshots/'+engine+'-'+(i+1)+'.png',animations:'disabled'});
  await page.locator('#play').click();
  const playing=await page.evaluate(()=>window.__AREG_3D_PREVIEW__.getState().animated);
  if(!playing)throw new Error('Interaction failed for scene '+i);
 }
 await page.locator('.tab[data-n="0"]').click();
 await page.locator('#unlock').click();
 const bought=await page.evaluate(()=>window.__AREG_3D_PREVIEW__.getState());
 if(bought.wallet!==100||!bought.unlocked[0])throw new Error('Isolated demo wallet purchase failed');
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>window.__AREG_3D_PREVIEW__?.is3D===true);
 const reset=await page.evaluate(()=>window.__AREG_3D_PREVIEW__.getState());
 if(reset.wallet!==120 || reset.unlocked.some(Boolean))throw new Error('Preview test wallet incorrectly persisted');
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('PASS '+engine+': five true 3D render views + five interactions + ephemeral wallet + reload reset; screenshots captured');
} finally {await browser?.close();server.kill('SIGTERM');}
