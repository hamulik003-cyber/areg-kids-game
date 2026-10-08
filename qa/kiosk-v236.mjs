#!/usr/bin/env node
// V236: emulate notched iPhone safe insets and verify DotKiosk may use full view.
// Tests responsive layout in Chromium; native DotKiosk still needs manual device validation.
import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {mkdirSync,writeFileSync} from 'node:fs';
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
let browser; const output=[];const errors=[];
try{
  await sleep(1100);
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  for(const device of [{width:393,height:852},{width:390,height:844},{width:320,height:568},{width:430,height:932}]){
    const measures={};
    for(const mode of ['safe','kiosk','legacy-kiosk','installed']){
      const ctx=await browser.newContext({viewport:device,deviceScaleFactor:2,isMobile:true,hasTouch:true});
      const page=await ctx.newPage();
      const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
      // Chromium doesn't model the iPhone cutout, so simulate its CSS env safe area.
      await page.addInitScript(installed=>{
        if(installed)Object.defineProperty(navigator,'standalone',{value:true,configurable:true});
        const old=window.getComputedStyle;
        window.getComputedStyle=function(el,...rest){
          const native=old.call(this,el,...rest);
          if(el?.style?.visibility==='hidden'&&el?.style?.paddingTop?.includes('env(')){
            return {getPropertyValue(k){
              return ({'padding-top':'59px','padding-right':'0px',
                'padding-bottom':'34px','padding-left':'0px'})[k]||native.getPropertyValue(k);
            }};
          }
          return native;
        };
      },mode==='installed');
      const q=mode==='kiosk'?'?kiosk=fullscreen&__areg_build=236':
        (mode==='legacy-kiosk'||mode==='installed')?'?kiosk=v233&__areg_build=236':
        '?__areg_build=236';
      let data;
      try{
        await page.goto('http://127.0.0.1:8765/'+q,{waitUntil:'domcontentloaded',timeout:45000});
        await page.waitForSelector('#designStage .nature-card');
        await page.waitForTimeout(250);
        data=await page.evaluate(()=>{
          const stage=document.querySelector('#designStage').getBoundingClientRect();
          const avatar=document.querySelector('.avatar-button').getBoundingClientRect();
          const footer=document.querySelector('.bottom-landscape').getBoundingClientRect();
          const w=innerWidth,h=innerHeight;
          return {mode:document.documentElement.dataset.aregViewportMode,
            w,h,scale:Number(getComputedStyle(document.documentElement).getPropertyValue('--stage-scale')),
            stage:{x:stage.x,y:stage.y,right:stage.right,bottom:stage.bottom,width:stage.width},
            avatar:{y:avatar.y},footer:{bottom:footer.bottom}};
        });
        const expected=mode==='kiosk'||mode==='legacy-kiosk'?'kiosk':'safe';
        if(data.mode!==expected)throw Error('expected mode '+expected+', received '+data.mode);
        if(jsErrors.length)throw Error(jsErrors.join('; ').slice(0,280));
        if(data.stage.x < -2||data.stage.right>device.width+2||
           data.stage.y < -2||data.stage.bottom>device.height+2)
          throw Error('stage clipped '+JSON.stringify(data.stage));
        if(mode==='safe'||mode==='installed'){
          if(data.avatar.y<45)throw Error('avatar not safe below simulated notch');
        }
        if(mode==='kiosk'||mode==='legacy-kiosk'){
          if(data.footer.bottom>device.height+2)throw Error('kiosk footer clipped');
        }
        measures[mode]=data;
      }catch(e){errors.push(JSON.stringify(device)+' '+mode+': '+String(e))}
      finally{await ctx.close()}
    }
    if(measures.kiosk&&measures.safe&&measures.kiosk.scale<=measures.safe.scale+0.015)
      errors.push(JSON.stringify(device)+': kiosk did not grow relative to safe-area layout');
    if(measures.installed&&measures.safe&&Math.abs(measures.installed.scale-measures.safe.scale)>.001)
      errors.push(JSON.stringify(device)+': installed PWA differs from safe layout');
    output.push({device,measures});
    console.log('V236_KIOSK',JSON.stringify({device,
      safeScale:measures.safe?.scale,kioskScale:measures.kiosk?.scale,
      legacyScale:measures['legacy-kiosk']?.scale,installedScale:measures.installed?.scale}));
  }
  mkdirSync('qa/results',{recursive:true});
  writeFileSync('qa/results/areg-v236-kiosk-check.json',JSON.stringify({output,errors},null,2));
  if(errors.length){console.error('V236 FAIL:\n'+errors.join('\n'));process.exitCode=1}
  else console.log('V236_PASS: 4 devices x 4 modes; full kiosk stage and safe PWA both verified');
}catch(e){console.error(e.stack);process.exitCode=1}
finally{await browser?.close();server.kill()}
