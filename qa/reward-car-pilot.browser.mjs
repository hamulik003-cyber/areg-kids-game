#!/usr/bin/env node
// Fast V291 exploratory smoke: untouched original car sprite animates against
// premium illustrated scene, same card returns; zero local wallet modifications.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await delay(900);
 browser=process.env.AREG_BROWSER==='webkit'?await webkit.launch({headless:true}):
 await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8776/reward-car-preview.html',{waitUntil:'domcontentloaded'});
 const before=await page.locator('#car .magic-picture').textContent();
 await page.locator('#car').click();
 await page.locator('.areg-car-pilot-stage[data-live="1"]').waitFor({state:'attached',timeout:5500});
 const state=await page.evaluate(()=>{
  const stage=document.querySelector('.areg-car-pilot-stage');
  const moving=stage?.querySelector('.areg-car-pilot-original');
  const world=stage?.querySelector('.areg-car-pilot-world');
  return {
    hero:moving?.textContent,original:document.querySelector('#car .magic-picture')?.textContent,
    title:document.querySelector('.areg-car-pilot-title')?.textContent,
    mode:stage?.dataset.sceneMode,
    animated:getComputedStyle(moving).animationName.includes('areg-car-ride'),
    worldOpacity:Number(getComputedStyle(world).opacity),
    forest:!!stage?.querySelector('.areg-car-pilot-trees svg'),
    sky:!!stage?.querySelector('.areg-car-pilot-sun'),
    canvas:!!stage?.querySelector('canvas'),
    walletUnchanged:!localStorage.getItem('areg-magic-unlocked-v1')&&!localStorage.getItem('areg-stars-v35')
  };
 });
 if(state.hero!==before||state.original!==before||state.title!=='Մեքենա'||state.mode!=='illustrated'||!state.animated||!state.forest||!state.sky||state.canvas||!state.walletUnchanged)
   throw Error('Original-art single-take invariant FAIL: '+JSON.stringify(state));
 await page.waitForFunction(()=>!document.querySelector('.areg-car-pilot'),null,{timeout:11500});
 if(errors.length)throw Error('Page error: '+errors.join('; '));
 console.log('V291 ORIGINAL-ART STORYBOOK CAR PASS '+(process.env.AREG_BROWSER||'chromium')+' '+JSON.stringify(state));
}finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
}
