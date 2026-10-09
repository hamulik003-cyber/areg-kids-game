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
 await page.goto('http://127.0.0.1:8765/?kiosk=v232&__areg_build=244',{waitUntil:'domcontentloaded',timeout:30000});
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

     if(id==='constellation-game'){
      try {
        await page.waitForFunction(()=>document.querySelector('.s3d-find256')?.dataset.constellationPhase==='ready',null,{timeout:16000});
      } catch(e) {
        const status=await page.evaluate(()=>({
          html:document.querySelector('#activityContent')?.innerHTML?.slice(0,900),
          mode:document.querySelector('.s3d-find256')?.dataset,
          prompt:document.querySelector('.s3d-find256 .s3d-prompt strong')?.textContent,
          cards:document.querySelectorAll('.s3d-find-choice').length,
          scripts:[...document.querySelectorAll('script')].slice(-4).map(s=>s.src)
        }));
        throw Error('Constellation loading diagnosis '+JSON.stringify(status)+' :: '+e.message);
      }
      const initial=await page.evaluate(()=>{
        const root=document.querySelector('.s3d-find256');
        const buttons=[...root.querySelectorAll('.s3d-find-choice')];
        const names=buttons.map(x=>x.getAttribute('aria-label'));
        const prompt=root.querySelector('.s3d-prompt strong')?.textContent||'';
        const loaded=buttons.every(b=>b.querySelector('img')?.complete&&b.querySelector('img')?.naturalWidth>0);
        return {count:buttons.length,names,prompt,loaded,mode:root.dataset.constellationMode,
                grid:getComputedStyle(root.querySelector('.s3d-find-stage')).gridTemplateColumns};
      });
      if(initial.count!==4||new Set(initial.names).size!==4||!initial.loaded||
         initial.mode!=='four-choice'||!initial.prompt.startsWith('Գտի՛ր՝ ')||
         initial.grid.split(' ').length!==2)
        throw Error('Invalid V256 constellation choices '+JSON.stringify(initial));
      const polish=await page.evaluate(()=>[...document.querySelectorAll('.s3d-find-choice')].map(b=>{
        const shell=b.querySelector('.s3d-find-art-shell');
        const img=b.querySelector('img');
        return {scale:Number(b.dataset.figureScale),fit:Number(b.dataset.figureFit),
                placed:img?.style.transform||'',hasShell:!!shell};
      }));
      if(polish.length!==4||polish.some(x=>!x.hasShell||
         !Number.isFinite(x.scale)||x.scale<.87||x.scale>2.03||
         !x.placed.includes('scale(')))
        throw Error('V258 silhouette sizing not applied to four images '+JSON.stringify(polish));
      console.log('CONSTELLATION SILHOUETTES '+polish.map(x=>x.scale.toFixed(2)).join(', '));
      const correctName=initial.prompt.slice('Գտի՛ր՝ '.length);
      const wrongName=initial.names.find(n=>n!==correctName);
      if(!wrongName||!initial.names.includes(correctName))
        throw Error('Constellation correct choice missing from round');
      // V264 samples real RAF frames of 280ms decoy fade BEFORE winner movement.
       const reveal=await page.evaluate(async name=>{
         const root=document.querySelector('.s3d-find256');
         const button=[...root.querySelectorAll('.s3d-find-choice')]
           .find(c=>c.getAttribute('aria-label')===name);
         if(!button)return {error:'missing correct choice'};
         button.click();
         const hero=root.querySelector('.s3d-find-hero');
         const startTransform=hero?.style.transform,samples=[],start=performance.now();
         await new Promise(resolve=>{
           function tick(){
             const ms=performance.now()-start;
             samples.push({ms,motion:root.dataset.heroMotion,
               isolated:root.dataset.winnerIsolated,heroTransform:hero?.style.transform,
               losers:[...root.querySelectorAll('.s3d-find-choice')].map(c=>({
                 opacity:Number(getComputedStyle(c).opacity),transform:c.style.transform,
                 transition:c.style.transition,animation:getComputedStyle(c).animationName
               }))});
             if(ms>=470)resolve();else requestAnimationFrame(tick);
           }
           requestAnimationFrame(tick);
         });
         return {samples,startTransform,phase:root.dataset.constellationPhase,
           heroCount:root.querySelectorAll('.s3d-find-hero').length};
       },correctName);
       if(reveal.error||reveal.phase!=='winning'||reveal.heroCount!==1||
          reveal.samples.length<3)throw Error('V264 winner missing '+JSON.stringify(reveal));
       const mid=reveal.samples.find(f=>f.ms>10&&f.ms<260&&f.motion==='waiting'&&
         f.losers.length===3&&f.losers.every(c=>c.opacity>.025&&c.opacity<.985&&
           c.transition==='none'&&c.animation==='none'&&
           c.transform.includes('translate3d(0px,0px,-')&&
           /scale\\(0\\.[\\d]+\\)/.test(c.transform)));
       if(!mid)throw Error('V264 no smooth 3-figure fade '+JSON.stringify(reveal.samples.slice(0,12)));
       if(reveal.samples.some(f=>f.losers.length>0&&
         (f.motion!=='waiting'||f.heroTransform!==reveal.startTransform)))
         throw Error('V264 winning image moved before 3 others disappeared');
       const lastReveal=reveal.samples.at(-1);
       if(lastReveal.losers.length!==0||lastReveal.isolated!=='true'||
          lastReveal.motion!=='approaching'||
          lastReveal.heroTransform===reveal.startTransform)
         throw Error('V264 decoys not removed before zoom '+JSON.stringify(lastReveal));
       // 280ms retreat plus 1220ms hero approach (with RAF margin).
       await page.waitForTimeout(1250);
       const centered=await page.evaluate(()=>{
        const root=document.querySelector('.s3d-find256');
        const hero=root.querySelector('.s3d-find-hero');
        const img=hero?.querySelector('img');
        const stage=root.querySelector('.s3d-find-stage');
        if(!hero||!img||!stage||!hero._imageRecord)return {missing:true};
        const S=stage.getBoundingClientRect(),H=hero.getBoundingClientRect();
        const r=hero._imageRecord,b=r.bounds;
        const fit=Math.min(S.width/r.width,S.height/r.height);
        const rawW=r.width*fit*b.w,rawH=r.height*fit*b.h;
        const W=Number(hero.dataset.figureWidth),Y=Number(hero.dataset.figureHeight);
        const matrix=new DOMMatrix(getComputedStyle(img).transform);
        const x=S.width*.5+matrix.m41+matrix.m11*(b.x-.5)*r.width*fit;
        const y=S.height*.5+matrix.m42+matrix.m22*(b.y-.5)*r.height*fit;
        return {heroCount:root.querySelectorAll('.s3d-find-hero').length,
          cards:root.querySelectorAll('.s3d-find-choice').length,
          W,Y,stageW:S.width,stageH:S.height,
          x,y,heroX:H.left-S.left,heroY:H.top-S.top,
          heroW:H.width,heroH:H.height,
          imgLoaded:img.complete&&img.naturalWidth>0,
          phase:root.dataset.constellationPhase};
      });
      if(centered.heroCount!==1||centered.cards!==0||centered.phase!=='winning'||
         !centered.imgLoaded||
         centered.W>centered.stageW-12||centered.Y>centered.stageH-12||
         Math.abs(centered.x-centered.stageW/2)>1.5||
         Math.abs(centered.y-centered.stageH/2)>1.5||
         Math.abs(centered.heroX)>1.5||Math.abs(centered.heroY)>1.5||
         Math.abs(centered.heroW-centered.stageW)>1.5||
         Math.abs(centered.heroH-centered.stageH)>1.5)
        throw Error('V262 cropped/miscentered constellation artwork in independent hero '+
          JSON.stringify(centered));
      console.log('CONSTELLATION HERO PERFECTLY CENTERED '+JSON.stringify(centered));
      await page.waitForTimeout(1100);
      if(await page.locator('.s3d-find256').getAttribute('data-constellation-phase')!=='winning'||
         await page.locator('.s3d-find-hero').count()!==1||
         await page.locator('.s3d-find-choice').count()!==0)
        throw Error('V262 hero must remain FULLY isolated through extended winning hold');
      await page.waitForFunction(()=>document.querySelector('.s3d-find256')?.dataset.constellationPhase==='ready'&&
        document.querySelector('.s3d-score b')?.textContent==='2/38',null,{timeout:20000});
      if(await page.locator('.s3d-find-choice').count()!==4)
        throw Error('Next constellation round must show 4 new objects');
      console.log('CONSTELLATION FOUR CHOICE PASS correct/wrong/win/next-round '+process.env.AREG_BROWSER);
     }


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
    // WebKit touch emulation occasionally hangs Playwright's click completion
    // despite DOM visibility; use a DOM click and still assert real navigation.
    if(process.env.AREG_BROWSER==='webkit')await page.locator('#activityBack').evaluate(el=>el.click());
    else await page.locator('#activityBack').click();
    await page.waitForFunction(()=>document.querySelector('#activityScreen')?.hidden===true,null,{timeout:15000});
   }
  }
  if(process.env.AREG_BROWSER==='webkit')await page.locator('#sectionBack').evaluate(el=>el.click());
  else await page.locator('#sectionBack').click();
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
