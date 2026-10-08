#!/usr/bin/env node
// V235: test responsive layout on representative portrait phone sizes.
// Chromium geometry checks; real iPhone standalone safe areas need physical-device QA.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {mkdirSync,writeFileSync} from 'node:fs';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const devices=[
  {name:'iphone-se',width:375,height:667},
  {name:'iphone-compact',width:390,height:744},
  {name:'iphone-pro',width:393,height:852},
  {name:'iphone-plus',width:430,height:932},
  {name:'android-compact',width:320,height:568},
  {name:'android-medium',width:360,height:640},
  {name:'android-modern',width:412,height:915}
];
const output=[], failures=[];
let browser;
try{
  await sleep(1000);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  mkdirSync('qa/results',{recursive:true});
  for(const size of devices){
    const context=await browser.newContext({
      viewport:{width:size.width,height:size.height},
      deviceScaleFactor:2,isMobile:true,hasTouch:true
    });
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const result={...size};
    try{
      await page.goto('http://127.0.0.1:8765/?__areg_build=235',{waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForSelector('.design-stage .nature-card',{timeout:30000});
      await page.waitForTimeout(400);
      const metrics=await page.evaluate(()=>{
        const selectors=['.design-stage','.avatar-button','.logo','.star-counter','.settings-button',
          '.nature-card','.space-card','.mind-card','.create-card','.magic-card','.bottom-landscape'];
        const boxes=Object.fromEntries(selectors.map(selector=>{
          const r=document.querySelector(selector).getBoundingClientRect();
          return [selector,{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}];
        }));
        const w=window.visualViewport?.width||window.innerWidth;
        const h=window.visualViewport?.height||window.innerHeight;
        return {viewport:{w,h},boxes,overflowX:document.documentElement.scrollWidth>w+2,
          overflowY:document.documentElement.scrollHeight>h+2};
      });
      result.metrics=metrics;
      const{w,h}=metrics.viewport;
      for(const [name,rect] of Object.entries(metrics.boxes)){
        if(rect.left < -2||rect.right > w+2||rect.top < -2||rect.bottom > h+2)
          throw new Error(name+' outside '+w+'x'+h+': '+JSON.stringify(rect));
      }
      const stage=metrics.boxes['.design-stage'];
      if(Math.abs(stage.width/709-stage.height/1536)>.015)
        throw Error('Stage artwork distorted by non-uniform scaling');
      if(metrics.overflowX||metrics.overflowY)throw Error('Global page overflow');
      await page.screenshot({path:'qa/results/'+size.name+'-v235.png',fullPage:false});
      await page.locator('.section-card[data-section="nature"]').click();
      await page.waitForSelector('#sectionScreen.is-visible',{timeout:30000});
      result.sectionCards=await page.locator('#sectionGames .toddler-game-card').count();
      if(result.sectionCards!==4)throw Error('Expected 4 games, got '+result.sectionCards);
      result.status=errors.length?'FAIL_JS':'PASS';
      if(errors.length)throw Error('JavaScript: '+errors.join('; ').slice(0,200));
    }catch(e){
      result.status='FAILED';result.error=String(e);failures.push(size.name+': '+String(e));
    }
    output.push(result);
    console.log('V235_PHONE',JSON.stringify({name:result.name,viewport:result.metrics?.viewport,status:result.status,error:result.error||null}));
    await context.close();
  }
  writeFileSync('qa/results/areg-v235-device-layout.json',JSON.stringify({simulator:'Chrome mobile viewport, not actual iOS WebKit',output},null,2));
  if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
}catch(e){console.error('V235 RESPONSIVE QA ERROR',e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
