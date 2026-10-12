#!/usr/bin/env node
// Fast iPhone-like visual mechanics test: EXACT SAME red-car SVG on reward card
// and moving scene, rotating wheels, ground contact, 5000ms active action.
// Entry/exit animation stays outside the five-second interval.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {readFileSync} from 'node:fs';

const game=readFileSync('app.js','utf8');
if(!game.includes("card.dataset.rewardActionStart")||!game.includes("},5000);"))
  throw Error('Other reward actions must also run for 5000ms from movement start');
const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await delay(900);
 browser=process.env.AREG_BROWSER==='webkit'?await webkit.launch({headless:true}):
   await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8776/reward-car-preview.html',{waitUntil:'domcontentloaded'});
 const before=await page.locator('#car .magic-picture img').getAttribute('src');
 await page.locator('#car').click();
 await page.locator('.areg-car-pilot-stage[data-live="1"]').waitFor({timeout:9000});
 const state=await page.evaluate(()=>{
  const stage=document.querySelector('.areg-car-pilot-stage');
  const moving=stage?.querySelector('.areg-car-pilot-hero');
  const road=stage?.querySelector('.areg-car-pilot-road');
  const wheels=[...stage?.querySelectorAll('svg .areg-car-wheel')||[]];
  const group=wheels[0]?.querySelector('g');
  const heroRect=moving?.getBoundingClientRect(),stageRect=stage?.getBoundingClientRect();
  const svg=stage.querySelector('.areg-car-pilot-hero svg');
  const ride=moving?.getAnimations().find(a=>a.effect?.getKeyframes()?.some(k=>String(k.transform||'').includes('translate3d')));
  const frameX=ride?.effect.getKeyframes().map(k=>Number(String(k.transform||'').match(/translate3d\\(\\s*(-?[\\d.]+)px/)?.[1]));
  const alwaysForward=!!frameX?.length&&frameX.every(Number.isFinite)&&frameX.every((x,i)=>i===0||x>=frameX[i-1])&&frameX.at(-1)>frameX[0];
  const front=svg?.querySelector('#areg-car-front');
  const rear=svg?.querySelector('#areg-car-rear');
  const groundY=stageRect.top+stageRect.height*.725;
  // The real rear/front wheel centers are at SVG y=249 /330.
  const wheelY=heroRect.top+heroRect.height*249/330;
  return {
   source:document.querySelector('#car .magic-picture img')?.getAttribute('src'),
   preview:stage.querySelector('.areg-car-pilot-hero img')?.getAttribute('src')||'inline-original-art',
   active:stage.dataset.live,
   mode:stage.dataset.sceneMode,wheels:stage.dataset.wheels,wheelCount:wheels.length,
   wheelRotation:getComputedStyle(group).animationName,
   road:!!road,trees:!!stage.querySelector('.areg-car-pilot-trees svg'),
   groundOffset:Math.round(wheelY-groundY),
   started:!!stage.dataset.actionStartedAt,
   facing:svg?.dataset.facing,frontMarked:front?.dataset.end,backMarked:rear?.dataset.end,
   headlamp:!!front?.querySelector('#areg-front-headlight'),
   forwardOnly:alwaysForward,frameX,travelDirection:stage.dataset.travelDirection,
   walletUnchanged:!localStorage.getItem('areg-magic-unlocked-v1')&&!localStorage.getItem('areg-stars-v35')
  };
 });
 if(state.source!==before||state.mode!=='illustrated'||state.wheels!=='rotatable'||state.wheelCount!==2||
    !state.wheelRotation.includes('areg-wheel-turn')||!state.road||!state.trees||Math.abs(state.groundOffset)>18||
    !state.started||!state.walletUnchanged||state.facing!=='right'||state.frontMarked!=='front'||
    state.backMarked!=='rear'||!state.headlamp||!state.forwardOnly||state.travelDirection!=='right')
  throw Error('Same-art car/wheels/ground/wallet invariant FAIL: '+JSON.stringify(state));
 // Must NOT begin closing until at least five seconds of physical movement.
 await page.waitForTimeout(1800);
 if(await page.locator('.areg-car-pilot-stage[data-live="1"]').count()!==1)
  throw Error('Active car motion ended too early (<5 seconds)');
 await page.waitForFunction(()=>Number(document.querySelector('.areg-car-pilot-stage')?.dataset.actionMs)>=4950,null,{timeout:7000});
 const duration=Number(await page.locator('.areg-car-pilot-stage').getAttribute('data-action-ms'));
 if(duration<4950||duration>5900)throw Error('Car action should be 5000ms from motion START; measured '+duration);
 await page.waitForFunction(()=>!document.querySelector('.areg-car-pilot'),null,{timeout:10000});
 if(errors.length)throw Error('Page errors: '+errors.join('; '));
 console.log('V291 FIVE-SECOND ORIGINAL CAR PASS ('+(process.env.AREG_BROWSER||'chromium')+'): '+JSON.stringify({duration,state}));
}finally{
 await browser?.close().catch(()=>{});
 server.kill('SIGTERM');
}
