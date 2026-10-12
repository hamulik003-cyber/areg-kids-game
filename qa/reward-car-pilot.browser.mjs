#!/usr/bin/env node
// V291 reward pilot: real car 3D, no stars/wallet writes or production changes.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8776','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const errors=[];
try{
  await sleep(950);
  browser=process.env.AREG_BROWSER==='webkit'
    ?await webkit.launch({headless:true})
    :await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='warning'||m.type()==='error')errors.push('console: '+m.text())});
  await page.goto('http://127.0.0.1:8776/reward-car-preview.html',{waitUntil:'domcontentloaded'});
  await page.locator('#car').click();
  await page.locator('.areg-car-pilot-card').waitFor({state:'visible',timeout:10000});
  await page.waitForFunction(()=>['webgl','fallback'].includes(document.querySelector('.areg-car-pilot-stage')?.dataset.sceneMode),null,{timeout:5500}).catch(()=>{});
  // Diagnostic when loading fails or WebKit WebGL context differs from Chromium.
  const state=await page.evaluate(()=>{
    const card=document.querySelector('.areg-car-pilot-card');
    const canvas=document.querySelector('.areg-car-pilot-stage canvas');
    return {
      title:card?.querySelector('.areg-car-pilot-title')?.textContent,
      canvas:!!canvas,renderWidth:canvas?.width||0,renderHeight:canvas?.height||0,
      webglSupported:!!document.createElement('canvas').getContext('webgl'),
      webgl2Supported:!!document.createElement('canvas').getContext('webgl2'),
      sceneMode:document.querySelector('.areg-car-pilot-stage')?.dataset.sceneMode||'still-loading',
      isolatedWallet:!localStorage.getItem('areg-magic-unlocked-v1')&&!localStorage.getItem('areg-stars-v35')
    };
  });
  if(state.title!=='Մեքենա'||!state.isolatedWallet)throw Error('reward pilot changed wallet or lacks car title: '+JSON.stringify(state));
  if(state.webgl2Supported&&(!state.canvas||state.renderWidth<50||state.renderHeight<50))
    throw Error('WebGL2 supported but no rendered 3D scene: '+JSON.stringify({state,errors}));
  if(!state.webgl2Supported&&state.sceneMode!=='fallback'&&!state.canvas)
    throw Error('WebGL2 unavailable and graceful fallback missing: '+JSON.stringify({state,errors}));
  await page.waitForFunction(()=>!document.querySelector('.areg-car-pilot'),null,{timeout:12500});
  if(errors.length)throw Error('pilot page error '+JSON.stringify(errors));
  console.log('V291 REWARD CAR PILOT PASS ('+(process.env.AREG_BROWSER||'chromium')+'): '+JSON.stringify(state));
}finally{
  await browser?.close().catch(()=>{});
  server.kill('SIGTERM');
}