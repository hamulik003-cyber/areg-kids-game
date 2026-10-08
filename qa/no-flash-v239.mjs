#!/usr/bin/env node
// V239 controlled slow-network acceptance test: do not reveal blank gallery.
// Run Chromium with SW blocked so the first 8 preview requests are cold.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;const failures=[];const facts={};
try{
  await sleep(900);
  browser=process.env.AREG_BROWSER==='webkit'
    ?await webkit.launch({headless:true})
    :await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await context.newPage();
  page.on('pageerror',err=>failures.push(err.message));
  let delayed=0;
  await page.route('**/assets/thumbs/*.webp*',async route=>{
    if(delayed<20){delayed++;await sleep(550)}
    await route.continue();
  });
  await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=239',{waitUntil:'domcontentloaded'});
  await page.locator('.section-card[data-section="nature"]').click();
  await page.waitForSelector('#sectionScreen.is-visible');
  await page.locator('#sectionGames .toddler-game-card[data-game="birds"]').click();
  await page.waitForTimeout(180);
  facts.oldSectionVisibleWhilePreviewsPending=await page.locator('#sectionScreen.is-visible').count()===1;
  if(!facts.oldSectionVisibleWhilePreviewsPending)throw Error('Section disappeared before preview decoding');
  await page.waitForSelector('#activityScreen.is-visible',{timeout:25000});
  await page.waitForFunction(()=>{
    const list=[...document.querySelectorAll('#activityContent .animal-card img')].slice(0,8);
    return list.length===8&&list.every(i=>i.complete&&i.naturalWidth>0);
  },null,{timeout:12000});
  facts.firstEightDecodedBeforeReveal=true;
  facts.galleryCards=await page.locator('#activityContent .animal-card').count();
  if(facts.galleryCards!==30)throw Error('Bird gallery count changed');

  const first=page.locator('#activityContent .animal-card').first();
  await first.click();
  await page.waitForSelector('.gallery-card-flight-shell',{timeout:15000});
  facts.flightImage=await page.evaluate(()=>{
    const src=document.querySelector('.gallery-card-flight-shell .animal-image-wrap img');
    return {ready:!!src&&src.complete&&src.naturalWidth>0,
      previewUrl:src?.getAttribute('src'),fullImageData:src?.dataset.fullSrc,
      basePictureCount:document.querySelectorAll('.gallery-card-flight-shell .animal-image-wrap > img').length};
  });
  if(!facts.flightImage.ready)throw Error('First flight frame has no decoded image');
  if(!facts.flightImage.previewUrl.includes('assets/thumbs/'))
    throw Error('Gallery animation replaced its preview base in-place');
  await page.waitForTimeout(750);
  const srcAfter=await page.evaluate(()=>document.querySelector('.gallery-card-flight-shell .animal-image-wrap > img')?.getAttribute('src'));
  if(srcAfter!==facts.flightImage.previewUrl)throw Error('Flight image src changed unexpectedly');
  facts.previewKeptDuringFullDecode=true;
  if(failures.length)throw Error('JavaScript errors: '+failures.join('; '));
  console.log('V239_NO_WHITE_PASS '+JSON.stringify(facts));
}catch(e){console.error('V239_NO_WHITE_FAIL '+e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
