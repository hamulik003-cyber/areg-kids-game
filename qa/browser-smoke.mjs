#!/usr/bin/env node
// AREG iPhone-sized Chromium smoke test for all 5 sections + gameplay routes.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
const errors=[],done=[];
let decodedImages=0;
try{
 await sleep(1100);
 browser=process.env.AREG_BROWSER==='webkit'
  ?await webkit.launch({headless:true})
  :await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 page.setDefaultTimeout(15000);
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')console.error('BROWSER CONSOLE '+m.text())});
 page.on('requestfailed',req=>{if(process.env.AREG_BROWSER==='webkit')console.error('WEBKIT NETWORK '+req.url().slice(0,130)+' '+req.failure()?.errorText)});
 const diag=async stage=>page.evaluate(stage=>({
   stage,href:location.href,readyState:document.readyState,active:document.activeElement?.outerHTML?.slice(0,170),
   homeClass:document.querySelector('#homeScreen')?.className,
   screenClass:document.querySelector('#sectionScreen')?.className,
   screenHidden:document.querySelector('#sectionScreen')?.hidden,
   screenDisplay:getComputedStyle(document.querySelector('#sectionScreen')).display,
   gamesCount:document.querySelectorAll('#sectionGames .toddler-game-card').length,
   historyLength:history.length
 }),stage);
 await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=241',{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForSelector('#homeScreen .section-card');
 for(const section of ['nature','space','mind','create','magic']){
  if(process.env.AREG_BROWSER==='webkit')console.log('WEBKIT BEFORE CLICK '+JSON.stringify(await diag(section+'-before')));
  await page.locator('.section-card[data-section="'+section+'"]').click();
  if(process.env.AREG_BROWSER==='webkit'){await page.waitForTimeout(450);console.log('WEBKIT AFTER CLICK '+JSON.stringify(await diag(section+'-after')));}
  await page.waitForSelector('#sectionScreen.is-visible');
  if(section==='magic'){
   const n=await page.locator('.magic-collect-card').count();
   if(n<35)throw Error('Magic rewards missing: '+n);
   done.push('magic rewards '+n);
  }else{
   const games=page.locator('#sectionGames .toddler-game-card');
   const n=await games.count();
   if(n!==4)throw Error(section+' has '+n+' games, expected 4');
   const ids=await games.evaluateAll(ns=>ns.map(n=>n.dataset.game));
   for(const id of ids){
    const card=page.locator('#sectionGames .toddler-game-card[data-game="'+id+'"]');
    await card.click({force:process.env.AREG_BROWSER==='webkit'});
    try{
      await page.waitForSelector('#activityScreen.is-visible',{timeout:7500});
    }catch(error){
      // Animated WebKit tiles can miss a synthetic click while the previous
      // 3D context is releasing. Retry an actual DOM click, and fail if the
      // activity still does not appear rather than silently skipping it.
      if(process.env.AREG_BROWSER!=='webkit')throw error;
      console.log('WEBKIT ACTIVITY RETRY '+JSON.stringify({section,id,diag:await diag(section+'/'+id)}));
      await card.evaluate(element=>element.click());
      await page.waitForSelector('#activityScreen.is-visible',{timeout:30000});
    }
    if(id==='space-search'||id==='constellation-game'){
     await page.waitForSelector('#activityContent canvas.s3d-canvas',{timeout:30000});
     if(id==='space-search')await page.waitForFunction(()=>document.querySelector('.s3d-prompt strong')?.textContent?.includes('Գտի՛ր'),null,{timeout:30000});
    }else{
     await page.waitForFunction(()=>document.querySelector('#activityContent')?.children.length>0,null,{timeout:16000});
     const first=page.locator('#activityContent .animal-card img').first();
     if(await first.count())await page.waitForFunction(()=>{
      const i=document.querySelector('#activityContent .animal-card img');
      return i?.complete&&i?.naturalWidth>0;
     },null,{timeout:25000});
     const expectedImages={animals:30,birds:30,sea:33,insects:30,planets:30,constellations:38};
     if(Object.hasOwn(expectedImages,id)&&process.env.AREG_BROWSER!=='webkit'){
       const count=await page.evaluate(async()=>{
         const sources=[...document.querySelectorAll('#activityContent .animal-card img')]
           .map(img=>({src:img.getAttribute('src'),name:img.alt}));
         let decoded=0;
         for(const item of sources){
           const probe=new Image();
           probe.decoding='async';
           probe.src=item.src;
           await probe.decode();
           if(probe.naturalWidth<=0||probe.naturalHeight<=0)throw Error('Image failed to decode: '+item.name+' '+item.src);
           decoded++;
         }
         return decoded;
       });
       if(count!==expectedImages[id])throw Error('Gallery '+id+': expected '+expectedImages[id]+' images decoded; got '+count);
       decodedImages+=count;
       console.log('ALL IMAGES PASS '+id+': '+count+' decoded');
     }
    }
    done.push(section+'/'+id);
    await page.locator('#activityBack').click();
    await page.waitForFunction(()=>document.querySelector('#activityScreen')?.hidden===true,null,{timeout:15000});
   }
  }
  await page.locator('#sectionBack').click();
  await page.waitForFunction(()=>document.querySelector('#sectionScreen')?.hidden===true,null,{timeout:15000});
 }
 if(errors.length)throw Error('Browser JavaScript errors: '+errors.join(' | ').slice(0,2000));
 console.log('BROWSER PASS '+done.length+' routes; fully decoded '+decodedImages+' gallery images: '+JSON.stringify(done));
}catch(e){
 console.error('BROWSER FAIL '+e.stack);
 console.error('completed routes '+JSON.stringify(done));
 if(errors.length)console.error('page errors '+JSON.stringify(errors));
 process.exitCode=1;
}finally{await browser?.close();server.kill()}
