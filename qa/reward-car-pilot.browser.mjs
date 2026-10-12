#!/usr/bin/env node
// Regression: NO extra visible card at any frame of the original card's
// 740ms entry -> 5000ms leftward drive -> 960ms inverse return.
// Checks browser DOM identity, bounding box continuity and safe game state.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {readFileSync} from 'node:fs';

const game=readFileSync('app.js','utf8');
if(!game.includes("card.dataset.rewardActionStart")||!game.includes("},5000);"))
 throw Error('Other 49 reward cards must keep 5000ms action contract');
const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await delay(900);
 browser=process.env.AREG_BROWSER==='webkit'?await webkit.launch({headless:true}):
  await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8776/reward-car-preview.html',{waitUntil:'domcontentloaded'});
 const starting=await page.evaluate(()=>{
  window.__aregOriginalCard=document.getElementById('car');
  window.__aregStartRect=window.__aregOriginalCard.getBoundingClientRect().toJSON();
  window.__aregReturnMatch=null;
  document.addEventListener('areg-car-return-check',e=>window.__aregReturnMatch=e.detail,{once:true});
  return {img:window.__aregOriginalCard.querySelector('.magic-picture img')?.getAttribute('src'),cardCount:document.querySelectorAll('.magic-collect-card').length};
 });
 if(!starting.img?.includes('reward-car-art.svg')||starting.cardCount!==1)
  throw Error('Initial original-card invariant FAIL: '+JSON.stringify(starting));
 await page.locator('#car').click();
 await page.locator('#car .areg-car-pilot-stage[data-live="1"]').waitFor({timeout:10000});
 const driving=await page.evaluate(()=>{
  const card=document.getElementById('car'),pic=card.querySelector('.magic-picture');
  const stage=card.querySelector('.areg-car-pilot-stage');
  const svg=pic.querySelector('svg');
  const wheel=svg?.querySelector('.areg-car-wheel > g');
  const anim=pic.getAnimations().find(a=>a.effect?.getKeyframes()?.some(k=>String(k.transform||'').includes('translate3d')));
  const xs=anim?.effect.getKeyframes().map(k=>Number(String(k.transform||'').match(/translate3d\(\s*(-?[\d.]+)px/)?.[1]));
  return {
   originalIdentity:card===window.__aregOriginalCard,
   onlyCard:document.querySelectorAll('.areg-car-pilot .magic-collect-card').length===1,
   isInOverlay:!!card.closest('.areg-car-pilot'),
   cloneCount:document.querySelectorAll('.areg-car-pilot-landing').length,
   blankPlaceholder:document.querySelectorAll('.areg-car-pilot .areg-car-placeholder').length===0,
   pictureCount:pic.querySelectorAll('svg,img').length,
   svgFacing:svg?.dataset.facing,
   wheels:svg?.querySelectorAll('.areg-car-wheel').length,
   wheelAnim:wheel&&getComputedStyle(wheel).animationName,
   front:svg?.querySelector('#areg-car-front')?.dataset.end,
   rear:svg?.querySelector('#areg-car-rear')?.dataset.end,
   actionStarted:!!stage.dataset.actionStartedAt,
   direction:stage.dataset.travelDirection,
   positions:xs,
   noReverse:xs?.length>2&&xs.every(Number.isFinite)&&xs.every((v,i)=>i===0||v<=xs[i-1])&&xs.at(-1)<xs[0],
   unchangedStorage:!localStorage.getItem('areg-magic-unlocked-v1')&&!localStorage.getItem('areg-stars-v35')
  };
 });
 if(!driving.originalIdentity||!driving.onlyCard||!driving.isInOverlay||driving.cloneCount!==0||
   driving.pictureCount!==1||driving.svgFacing!=='left'||driving.wheels!==2||
   !driving.wheelAnim?.includes('areg-wheel-turn')||driving.front!=='front'||
   driving.rear!=='rear'||!driving.actionStarted||driving.direction!=='left'||
   !driving.noReverse||!driving.unchangedStorage)throw Error('Single-card left-moving 3D animation FAIL: '+JSON.stringify(driving));
 await page.waitForTimeout(1800);
 if(await page.locator('#car .areg-car-pilot-stage[data-live="1"]').count()!==1)
  throw Error('Physical action stopped too early (must last 5000ms)');
 await page.waitForFunction(()=>Number(document.querySelector('#car .areg-car-pilot-stage')?.dataset.actionMs)>=4950,null,{timeout:8000});
 const actionDuration=Number(await page.locator('#car .areg-car-pilot-stage').getAttribute('data-action-ms'));
 if(actionDuration<4950||actionDuration>5900)throw Error('Active action not five seconds: '+actionDuration);
 await page.locator('#car .areg-car-pilot-stage[data-ending="1"]').waitFor({timeout:4000});
 const first=await page.locator('#car').boundingBox();
 await page.waitForTimeout(140);
 const next=await page.locator('#car').boundingBox();
 if(!first||!next||next.width>=first.width-1)
  throw Error('Original card failed to shrink during continuous return: '+JSON.stringify({first,next}));
 if(await page.locator('.areg-car-pilot-landing').count()>0)
  throw Error('Old cross-fade clone was created');
 await page.waitForFunction(()=>!document.querySelector('.areg-car-pilot'),null,{timeout:10000});
 const ending=await page.evaluate(()=>{
  const el=document.getElementById('car');
  const a=el.getBoundingClientRect(),b=window.__aregStartRect;
  const delta=Math.max(Math.abs(a.left-b.left),Math.abs(a.top-b.top),Math.abs(a.width-b.width),Math.abs(a.height-b.height));
  return {
   originalIdentity:el===window.__aregOriginalCard,
   restoredParent:el.parentElement?.tagName==='MAIN',
   sameSinglePicture:el.querySelectorAll('.magic-picture svg,.magic-picture img').length===1,
   noStage:!el.querySelector('.areg-car-pilot-stage'),
   noPlaceholder:!document.querySelector('.areg-car-placeholder'),
   noOverlay:!document.querySelector('.areg-car-pilot'),
   rectDelta:delta,report:window.__aregReturnMatch,
   unchangedStorage:!localStorage.getItem('areg-magic-unlocked-v1')&&!localStorage.getItem('areg-stars-v35')
  };
 });
 if(!ending.originalIdentity||!ending.restoredParent||!ending.sameSinglePicture||!ending.noStage||
    !ending.noPlaceholder||!ending.noOverlay||ending.rectDelta>2||!ending.unchangedStorage||
    ending.report?.mode!=='single-original-dom-card'||!ending.report?.sameDOM||
    ending.report?.cardCount!==1||ending.report?.errorPx>2)
   throw Error('Zero-frame-swap original-card return FAIL: '+JSON.stringify(ending));
 if(errors.length)throw Error('JS page error(s): '+errors.join('; '));
 console.log('V291 SINGLE ORIGINAL CARD, ZERO CLONE, 5s LEFT DRIVE PASS ('+
   (process.env.AREG_BROWSER||'chromium')+') '+JSON.stringify({actionDuration,driving,ending}));
}finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
}
