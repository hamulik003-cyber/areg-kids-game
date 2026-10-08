#!/usr/bin/env node
// READ-ONLY AREG V234 performance baseline; do not alter game assets or behavior.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import fs from 'node:fs';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const base='http://127.0.0.1:8765/?kiosk=v233&__areg_build=233';
const outcomes=[];
let browser;
async function benchmark(rate){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:'allow'});
  const page=await context.newPage();
  page.setDefaultTimeout(45000);
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  const o={cpuThrottle:rate,timesMs:{},errors};
  async function measured(name,fn){
    const before=performance.now();
    await fn();
    o.timesMs[name]=Math.round(performance.now()-before);
  }
  try{
    await measured('mainNavigationDOMContentLoaded',async()=>page.goto(base,{waitUntil:'domcontentloaded',timeout:45000}));
    await measured('mainMenuReady',async()=>page.waitForSelector('#homeScreen .section-card'));
    const section=async id=>measured(id+'SectionOpen',async()=>{
      await page.locator('.section-card[data-section="'+id+'"]').click();
      await page.waitForSelector('#sectionScreen.is-visible');
    });
    const game=async id=>measured(id+'ActivityOpen',async()=>{
      await page.locator('#sectionGames .toddler-game-card[data-game="'+id+'"]').click();
      await page.waitForSelector('#activityScreen.is-visible');
    });
    const backGame=async()=>{
      await page.locator('#activityBack').click();
      await page.waitForFunction(()=>document.querySelector('#activityScreen')?.hidden===true);
    };
    const backSection=async()=>{
      await page.locator('#sectionBack').click();
      await page.waitForFunction(()=>document.querySelector('#sectionScreen')?.hidden===true);
    };
    await section('nature');
    await game('animals');
    await measured('animalsFirstPicture',async()=>page.waitForFunction(()=>{
      const img=document.querySelector('#activityContent .animal-card img');
      return img?.complete&&img?.naturalWidth>0;
    }));
    await backGame(); await backSection();
    await section('space');
    await game('space-search');
    await measured('spaceCanvasCreated',async()=>page.waitForSelector('#activityContent canvas.s3d-canvas',{timeout:45000}));
    await measured('spaceSearchFirstRoundReady',async()=>page.waitForFunction(()=>{
      return document.querySelector('.s3d-prompt strong')?.textContent?.includes('Գտի՛ր');
    },null,{timeout:45000}));
    const frames=await page.evaluate(()=>new Promise(resolve=>{
      const began=performance.now();let last=0,frameMs=[];
      function tick(now){
        if(last)frameMs.push(now-last);
        last=now;
        if(now-began>1050)resolve({frameCount:frameMs.length,
          averageFrameMs:Math.round(frameMs.reduce((a,b)=>a+b,0)/Math.max(1,frameMs.length)*10)/10,
          maxFrameMs:Math.round(Math.max(0,...frameMs)*10)/10});
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }));
    o.framePacing=frames;
    o.status=errors.length?'JS_ERRORS':'PASS';
  }catch(e){o.status='FAILED';o.failure=String(e).slice(0,800)}
  finally{
    o.resources=await page.evaluate(()=>performance.getEntriesByType('resource').length).catch(()=>null);
    await context.close();
  }
  outcomes.push(o);
  console.log('V234_PERF',JSON.stringify(o));
}
try{
  await sleep(900);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  await benchmark(1);
  await benchmark(4);
  fs.mkdirSync('qa/results',{recursive:true});
  fs.writeFileSync('qa/results/areg-v234-baseline.json',JSON.stringify({
    source:'GitHub branch v234-performance-lab',
    note:'Chrome on Linux, iPhone-sized viewport; 4x CPU emulation is not a real Android device',
    outcomes
  },null,2));
  if(outcomes.some(o=>o.status!=='PASS'))process.exitCode=1;
}catch(e){console.error('PERFORMANCE LAB ERROR',e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
