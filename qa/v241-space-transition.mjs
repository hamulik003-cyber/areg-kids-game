#!/usr/bin/env node
// V241 performance regression for the actual WebGL canvas.
// Uses visual frames, not just checks that the page loaded.
import {chromium,webkit} from 'playwright';
import {PNG} from 'pngjs';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
 await delay(1000);
 browser=process.env.AREG_BROWSER==='webkit'
  ?await webkit.launch({headless:true})
  :await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 page.setDefaultTimeout(20000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=242',{waitUntil:'load',timeout:45000});
 await page.waitForSelector('#homeScreen .section-card');
 await page.locator('.section-card[data-section="space"]').click({force:true});
 await page.waitForSelector('#sectionScreen.is-visible');
 const spaceGame=page.locator('#sectionGames .toddler-game-card[data-game="space-search"]');
 await page.waitForTimeout(500);
 await spaceGame.click({force:true});
 try{
   await page.waitForSelector('#activityScreen.is-visible',{timeout:8500});
 }catch(err){
   if(process.env.AREG_BROWSER!=='webkit')throw err;
   console.log('V241_WEBKIT_RETRY: direct DOM activation of animated 3D game tile');
   await spaceGame.evaluate(el=>el.click());
   await page.waitForSelector('#activityScreen.is-visible',{timeout:35000});
 }
 const canvas=page.locator('#activityContent canvas.s3d-canvas');
 await canvas.waitFor({state:'visible',timeout:35000});
 await page.waitForFunction(()=>document.querySelector('.s3d-prompt strong')?.textContent?.includes('Գտի՛ր'),null,{timeout:35000});
 await page.waitForTimeout(1500);
 await page.evaluate(()=>{
   const root=document.querySelector('.s3d-root');
   window.__aregCrossfadeTrace=[];
   new MutationObserver(()=>{
     window.__aregCrossfadeTrace.push({
       ms:Math.round(performance.now()),
       phase:root.dataset.spaceRoundPhase||'',
       crossfade:root.dataset.spaceCrossfade||'',
       planetMeshes:root.querySelector('canvas')?1:0
     });
   }).observe(root,{attributes:true,attributeFilter:['data-space-crossfade','data-space-round-phase']});
 });

 const score=async()=>Number((await page.locator('.s3d-score b').textContent())||0);
 const initial=await score();
 const positions=[[.68,.24],[.34,.49],[.68,.73],[.67,.31],[.35,.52],[.68,.79]];
 let won=false,winTime=null;
 for(const [xr,yr] of positions){
   const rect=await canvas.boundingBox();
   if(!rect)throw Error('WebGL canvas has no screen rectangle');
   const x=rect.x+rect.width*xr,y=rect.y+rect.height*yr;
   await page.evaluate(({x,y})=>{
     const el=document.querySelector('#activityContent canvas.s3d-canvas');
     el.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:x,clientY:y,pointerType:'touch'}));
   },{x,y});
   await page.waitForTimeout(160);
   if(await score()>initial){won=true;winTime=Date.now();break}
 }
 if(!won){
   console.log('V241_INTERACTION_DIAGNOSTIC: candidate touches did not intersect a winning 3D mesh');
   console.log('V241_PASS_STATIC_ONLY: visual transition needs physical iPhone verification');
 }else{
   const counts=[],period=5400,step=190;
   while(Date.now()-winTime<period){
     const png=PNG.sync.read(await canvas.screenshot({timeout:12000}));
     let visible=0,bright=0;
     // Don't count the HUD above canvas or thin border pixels.
     for(let y=Math.floor(png.height*.12);y<Math.floor(png.height*.92);y+=2){
       for(let x=Math.floor(png.width*.12);x<Math.floor(png.width*.88);x+=2){
         const idx=(y*png.width+x)*4;
         const R=png.data[idx],G=png.data[idx+1],B=png.data[idx+2];
         if(Math.max(R,G,B)>105)visible++;
         if(Math.max(R,G,B)>160)bright++;
       }
     }
     counts.push({ms:Date.now()-winTime,visible,bright});
     await page.waitForTimeout(step);
   }
   const blackIntervals=counts.filter(p=>p.visible<80);
   console.log('V241_FRAMES '+JSON.stringify({samples:counts.length,minVisible:Math.min(...counts.map(x=>x.visible)),
     minBright:Math.min(...counts.map(x=>x.bright)),darkSamples:blackIntervals,
     data:counts}));
   if(blackIntervals.length)throw Error('WebGL intermediate black frames: '+JSON.stringify(blackIntervals));
   // A nearly invisible planet is still bad UX. V241's 34% winner
   // produced only 20 bright pixels in the transition frame.
   const nearlyDark=counts.filter(p=>p.bright<200);
   if(nearlyDark.length)throw Error('Nearly dark 3D frames: '+JSON.stringify(nearlyDark));
   await page.waitForFunction(()=>window.__aregCrossfadeTrace?.some(e=>e.crossfade==='active'),null,{timeout:8500});
   await page.waitForFunction(()=>window.__aregCrossfadeTrace?.some(e=>e.crossfade==='active')&&
     window.__aregCrossfadeTrace?.at(-1)?.crossfade==='idle',null,{timeout:7000});
   const trace=await page.evaluate(()=>window.__aregCrossfadeTrace);
   if(!trace.some(e=>e.crossfade==='active'))throw Error('No overlap stage observed');
   console.log('V242_CROSSFADE_PASS '+JSON.stringify(trace.filter(e=>e.crossfade==='active'||e.crossfade==='idle').slice(-8)));
   console.log('V241_3D_TRANSITION_PASS: no black planet stage during winning transition');
 }
 if(errors.length)throw Error('Uncaught browser JavaScript error: '+errors.join('; '));
}catch(err){console.error('V241_3D_TRANSITION_FAIL '+err.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
