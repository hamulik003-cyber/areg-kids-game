#!/usr/bin/env node
// AREG fast-launch baseline / regression. Keeps gameplay and assets unchanged.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {mkdirSync,writeFileSync} from 'node:fs';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;const records=[],fail=[];
async function measure(page,label,nav){
  const started=performance.now();
  await nav();
  await page.waitForFunction(()=>[...document.querySelectorAll('.home-card-art')]
    .length===5 && [...document.querySelectorAll('.home-card-art')].every(x=>x.complete&&x.naturalWidth>0),
    null,{timeout:40000});
  const data=await page.evaluate(()=>{
    const entry=performance.getEntriesByType('navigation')[0]||{};
    const rect=document.getElementById('designStage').getBoundingClientRect();
    return {navDomMs:Math.round(entry.domContentLoadedEventEnd||0),
      navLoadMs:Math.round(entry.loadEventEnd||0),
      imageReadyMs:Math.round(performance.now()),
      controller:!!navigator.serviceWorker?.controller,
      cards:document.querySelectorAll('.section-card').length,
      stageWidth:Math.round(rect.width),
      appErrors:window.__aregSmokeErrors||[]};
  });
  records.push({label,wallMs:Math.round(performance.now()-started),...data});
  console.log('AREG_LAUNCH '+JSON.stringify(records[records.length-1]));
  if(data.cards!==5||data.stageWidth<200)fail.push(label+': menu incomplete');
  return data;
}
try{
  await sleep(900);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  const page=await context.newPage();
  page.on('pageerror',e=>fail.push('JS '+e.message));
  const url='http://127.0.0.1:8765/?kiosk=v232&__areg_build=232';
  await measure(page,'cold-first-visit',()=>page.goto(url,{waitUntil:'domcontentloaded',timeout:45000}));
  await page.evaluate(()=>navigator.serviceWorker?.ready);
  await page.waitForFunction(()=>!!navigator.serviceWorker?.controller,{timeout:18000}).catch(()=>{});
  await measure(page,'warm-repeat-online',()=>page.reload({waitUntil:'domcontentloaded',timeout:45000}));
  await context.setOffline(true);
  try{await measure(page,'repeat-offline',()=>page.reload({waitUntil:'domcontentloaded',timeout:45000}));}
  catch(e){records.push({label:'repeat-offline',status:'FAILED',error:String(e)});fail.push('offline repeat: '+e);}
  await context.close();
  mkdirSync('qa/results',{recursive:true});
  writeFileSync('qa/results/areg-launch-benchmark.json',JSON.stringify({platform:'Linux Chrome emulation; not physical iPhone or DotKiosk',records,fail},null,2));
  if(fail.length){console.error(fail.join('\n'));process.exitCode=1;}
}catch(e){console.error('LAUNCH BENCH ERROR',e.stack);process.exitCode=1;}
finally{await browser?.close();server.kill();}
