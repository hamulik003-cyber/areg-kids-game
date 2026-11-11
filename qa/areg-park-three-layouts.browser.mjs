#!/usr/bin/env node
import { chromium, webkit } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { setTimeout as wait } from 'node:timers/promises';
const type=process.env.AREG_BROWSER==='webkit'?'webkit':'chromium';
const server=spawn('python3',['-m','http.server','8997','--bind','127.0.0.1'],{stdio:'ignore'});
const problems=[];
let browser;
try{
 await wait(1000);
 browser=type==='webkit'?await webkit.launch({headless:true}):await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>problems.push('pageerror '+e.message));
 page.on('console',x=>{if(x.type()==='error')problems.push('console '+x.text())});
 page.on('requestfailed',x=>problems.push('requestfailed '+x.url()+':'+x.failure()?.errorText));
 await page.goto('http://127.0.0.1:8997/areg-park-three-layouts.html',{waitUntil:'load',timeout:50000});
 await page.waitForFunction(()=>window.__AREG_PARK_LAB__?.getState()?.realWebGL===true,null,{timeout:20000});
 await mkdir('areg-park-test-captures',{recursive:true});
 for(let i=0;i<3;i++){
   await page.locator('.layout[data-layout="'+i+'"]').click();
   await page.waitForTimeout(950);
   const state=await page.evaluate(()=>window.__AREG_PARK_LAB__.getState());
   if(state.mode!==i)throw new Error('Wrong layout '+i+' -> '+JSON.stringify(state));
   if(await page.locator('#render canvas').count()!==1)throw new Error('Missing canvas');
   await page.screenshot({path:'areg-park-test-captures/'+type+'-layout-'+(i+1)+'.png'});
   await page.locator('#action').click();
   const playing=await page.evaluate(()=>window.__AREG_PARK_LAB__.getState().playing);
   if(!playing)throw new Error('The ride did not animate in layout '+i);
   await page.locator('#selectRail button').nth(2).click();
   const ride=await page.evaluate(()=>window.__AREG_PARK_LAB__.getState().selected);
   if(ride!==2)throw new Error('Ride selection failed '+i);
 }
 await page.locator('.layout[data-layout="0"]').click();
 await page.locator('#selectRail button').nth(1).click();
 await page.locator('#buy').click();
 let state=await page.evaluate(()=>window.__AREG_PARK_LAB__.getState());
 if(state.stars!==100||!state.unlocked.includes('0:1'))throw new Error('Demo purchase failed: '+JSON.stringify(state));
 await page.reload({waitUntil:'load'});
 await page.waitForFunction(()=>window.__AREG_PARK_LAB__?.getState()?.realWebGL===true,null,{timeout:20000});
 state=await page.evaluate(()=>window.__AREG_PARK_LAB__.getState());
 if(state.stars!==120||state.unlocked.includes('0:1'))throw new Error('Demo stars unexpectedly persisted');
 if(problems.length)throw new Error(problems.join('\n'));
 console.log('PASS '+type+': 3 real-WebGL cartoon park environments, 3 interactions, ride selection, in-memory-only star unlock, reload reset. All screenshots saved.');
} finally{await browser?.close();server.kill('SIGTERM');}
