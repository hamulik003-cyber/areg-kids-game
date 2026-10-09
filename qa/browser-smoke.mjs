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

     if(id==='space-search'){
       const initialPlanetScore=await page.locator('.s3d-session-score').evaluate(el=>({
         text:el.textContent,wrong:el.querySelector('.s3d-session-wrong')?.textContent,
         correct:el.querySelector('.s3d-session-right')?.textContent,
         activeWrong:el.querySelector('.s3d-session-wrong')?.classList.contains('is-active'),
         activeRight:el.querySelector('.s3d-session-right')?.classList.contains('is-active')
       }));
       if(initialPlanetScore.wrong!=='0'||initialPlanetScore.correct!=='0'||
          initialPlanetScore.activeWrong||initialPlanetScore.activeRight)
         throw Error('V267 planets must start 0/0 with both zeroes white '+
           JSON.stringify(initialPlanetScore));
     }
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
      await page.evaluate(()=>localStorage.setItem('areg-correct-constellation-game-v1','8'));
      const starsBefore=await page.evaluate(()=>Number(localStorage.getItem('areg-stars-v35')||0));
      const initial=await page.evaluate(()=>{
        const root=document.querySelector('.s3d-find256');
        const buttons=[...root.querySelectorAll('.s3d-find-choice')];
        const names=buttons.map(x=>x.getAttribute('aria-label'));
        const prompt=root.querySelector('.s3d-prompt strong')?.textContent||'';
        const loaded=buttons.every(b=>b.querySelector('img')?.complete&&b.querySelector('img')?.naturalWidth>0);
        return {count:buttons.length,names,prompt,loaded,mode:root.dataset.constellationMode,
                 targetId:root.dataset.targetId,
                 scoreWrong:root.querySelector('.s3d-session-wrong')?.textContent,
                 scoreRight:root.querySelector('.s3d-session-right')?.textContent,
                 hasScore:!!root.querySelector('.s3d-session-score'),
                 whiteZero:![...root.querySelectorAll('.s3d-session-wrong,.s3d-session-right')].some(x=>x.classList.contains('is-active')),
                 noFooter:root.querySelector('.s3d-find-progress')===null,
                grid:getComputedStyle(root.querySelector('.s3d-find-stage')).gridTemplateColumns};
      });
      if(initial.count!==4||new Set(initial.names).size!==4||!initial.loaded||
         initial.mode!=='four-choice'||!initial.prompt.startsWith('Գտի՛ր՝ ')||
         (!/[ըն]$/.test(initial.prompt))||!initial.hasScore||initial.scoreWrong!=='0'||initial.scoreRight!=='0'||!initial.whiteZero||!initial.noFooter||initial.grid.split(' ').length!==2)
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
      const correctName=await page.evaluate(id=>
        document.querySelector('.s3d-find-choice[data-id="'+id+'"]')?.getAttribute('aria-label'),initial.targetId);
      if(!correctName||!initial.names.includes(correctName))
        throw Error('V266 no target button');
      // A wrong tap must increment red LEFT, not the persistent ten-answer star.
      const afterWrong=await page.evaluate(targetId=>{
        const root=document.querySelector('.s3d-find256');
        const wrong=root.querySelector('.s3d-find-choice:not([data-id="'+targetId+'"])');
        wrong?.click();
        return {bad:root.querySelector('.s3d-session-wrong')?.textContent,
          good:root.querySelector('.s3d-session-right')?.textContent,
          badActive:root.querySelector('.s3d-session-wrong')?.classList.contains('is-active'),
          goodActive:root.querySelector('.s3d-session-right')?.classList.contains('is-active')};
      },initial.targetId);
      if(afterWrong.bad!=='1'||afterWrong.good!=='0'||!afterWrong.badActive||afterWrong.goodActive)
        throw Error('V267 wrong tap must show red 1 / white 0 '+JSON.stringify(afterWrong));
      const reveal=await page.evaluate(async name=>{
        const root=document.querySelector('.s3d-find256');
        const button=[...root.querySelectorAll('.s3d-find-choice')].find(c=>c.getAttribute('aria-label')===name);
        if(!button)return {error:'missing chosen button'};
        button.click();
        const hero=root.querySelector('.s3d-find-hero');
        const startTransform=hero?.style.transform,start=performance.now(),samples=[];
        await new Promise(resolve=>{
          function tick(){
            const ms=performance.now()-start;
            samples.push({ms,motion:root.dataset.heroMotion,
              isolated:root.dataset.winnerIsolated,heroTransform:hero?.style.transform,
              placeholder:!!root.querySelector('.s3d-find-choice[style*="visibility: hidden"]'),
              losers:[...root.querySelectorAll('.s3d-find-dismissing')].map(c=>({
                opacity:Number(getComputedStyle(c).opacity),transform:c.style.transform,
                transition:c.style.transition,animation:getComputedStyle(c).animationName,
                shellPaused:c.querySelector('.s3d-find-art-shell')?.style.animationPlayState==='paused',
                fadeState:c._fadeAnimation?.playState||'none',
                x:c.getBoundingClientRect().x,y:c.getBoundingClientRect().y
              }))});
            if(ms>=1170)resolve();else requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        return {samples,startTransform,fadeEngine:root.dataset.decoyFadeEngine,build:root.dataset.constellationBuild,
          sessionBad:root.querySelector('.s3d-session-wrong')?.textContent,
          sessionGood:root.querySelector('.s3d-session-right')?.textContent,
          sessionGoodActive:root.querySelector('.s3d-session-right')?.classList.contains('is-active'),
          count:Number(localStorage.getItem('areg-correct-constellation-game-v1')||0),
          stars:Number(localStorage.getItem('areg-stars-v35')||0),
          phase:root.dataset.constellationPhase,
          heroCount:root.querySelectorAll('.s3d-find-hero').length};
      },correctName);
      if(reveal.error||reveal.build!=='v272-repeat-stable'||reveal.fadeEngine!=='compositor'||reveal.phase!=='winning'||reveal.heroCount!==1||
         reveal.samples.length<4)throw Error('V266 missing hero '+JSON.stringify(reveal));
      if(reveal.count!==9||reveal.stars!==starsBefore||reveal.sessionBad!=='1'||reveal.sessionGood!=='1'||!reveal.sessionGoodActive)
         throw Error('V266 ninth correct must give no star '+JSON.stringify(reveal));
      const mid=reveal.samples.find(f=>f.ms>20&&f.ms<520&&f.motion==='approaching'&&
         f.placeholder&&f.losers.length===3&&
         f.heroTransform!==reveal.startTransform&&
         f.losers.every(c=>c.opacity>=0&&c.opacity<=1&&
           c.fadeState==='running'&&c.transition==='none'&&c.animation==='none'&&
           c.shellPaused&&/^translate3d\(0px,\s*0px,\s*0px\) scale\(1\)$/.test(c.transform)));
      if(!mid)throw Error('V266 four-way motion not simultaneous '+JSON.stringify(reveal.samples.slice(0,16)));
      const middle=reveal.samples.filter(f=>f.ms>20&&f.ms<520&&f.losers.length===3);
      if(middle.length<2||middle.some((f,i)=>i>0&&f.losers.some((c,j)=>
        c.opacity>middle[i-1].losers[j].opacity+.008||
         Math.abs(c.x-middle[i-1].losers[j].x)>1||
         Math.abs(c.y-middle[i-1].losers[j].y)>1)))
        throw Error('V266 losing figures paused or reappeared');
      // V270: actual perceived-entrance test, not merely "gone by 850ms".
      // The hero's cubic easing is already ~80% complete by 340ms.
      // All three losing choices must disappear before 450ms, while
      // the hero is still approaching, and genuinely begin fading early.
      // WebKit's GPU+3D first rAF sample may occur around 60ms and the
      // next around 230ms, skipping the former artificial 55-170ms window.
      // Check real early FADE PROGRESS by 300ms instead of demanding a
      // specific intermediate frame which the browser never produced.
      const early=reveal.samples.find(f=>f.ms>35&&f.ms<520&&
        f.motion==='approaching'&&f.losers.length===3&&
        f.losers.every(c=>c.opacity<.1));
      if(!early)throw Error('V270 WebKit first-fade diagnostic '+
        JSON.stringify({engine:reveal.fadeEngine,build:reveal.build,
          opening:reveal.samples.slice(0,12).map(f=>({
            ms:Math.round(f.ms),motion:f.motion,
            count:f.losers.length,alpha:f.losers.map(x=>x.opacity),
            transform:f.losers.map(x=>x.transform)
          }))}));
      const lingering=reveal.samples.filter(f=>f.ms>=560&&f.losers.some(c=>c.opacity>.015));
      if(lingering.length)
        throw Error('V270 decoys remained on screen after hero visually arrived '+
          JSON.stringify(lingering.slice(0,3)));
      const goneWhileApproaching=reveal.samples.some(f=>f.ms>=370&&f.ms<=850&&
        f.motion==='approaching'&&f.losers.length===0);
      if(!goneWhileApproaching)
        throw Error('V270 decoys did not finish before visual winner approach');
      const heroReached=reveal.samples.find(f=>f.motion==='holding');
      if(!heroReached||heroReached.losers.length!==0)
        throw Error('V270 hero arrived while decoys were visible');
      const last=reveal.samples.at(-1);
      if(last.losers.length!==0||last.isolated!=='true'||last.motion!=='holding')
        throw Error('V266 hero and losers did not finish '+JSON.stringify(last));
      await page.waitForTimeout(130);
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
      await page.waitForTimeout(230);
      if(await page.locator('.s3d-find256').getAttribute('data-constellation-phase')!=='winning'||
         await page.locator('.s3d-find-hero').count()!==1||
         await page.locator('.s3d-find-choice').count()!==0)
        throw Error('V265 alpha-centered hero must remain isolated before planet-timed exit');
      await page.waitForFunction(()=>document.querySelector('.s3d-find256')?.dataset.constellationPhase==='ready'&&
        document.querySelectorAll('.s3d-find-choice').length===4,null,{timeout:20000});
      if(await page.locator('.s3d-find-choice').count()!==4)
        throw Error('Next constellation round must show 4 new objects');
      // V271 regression: prior checks observed ONLY the first win.
      // User reports that the first Leo win fades correctly, but every
      // subsequent win keeps 3 decoys on-screen until hero already arrives.
      // Capture true opacity and hero timelines for the SECOND win too.
      const tenth=await page.evaluate(async ()=>{
        const root=document.querySelector('.s3d-find256');
        const target=root.querySelector('.s3d-find-choice[data-id="'+root.dataset.targetId+'"]');
        if(!target)return {error:'next target absent'};
        target.click();
        const score={count:Number(localStorage.getItem('areg-correct-constellation-game-v1')||0),
          stars:Number(localStorage.getItem('areg-stars-v35')||0),
          reward:root.querySelectorAll('.s3d-reward').length};
        const frames=[],start=performance.now();
        await new Promise(resolve=>{
          function tick(){
            const ms=performance.now()-start;
            frames.push({ms:Math.round(ms),
              phase:root.dataset.constellationPhase,
              motion:root.dataset.heroMotion,
              engine:root.dataset.decoyFadeEngine,
              losers:[...root.querySelectorAll('.s3d-find-dismissing')].map(c=>({
                opacity:Number(getComputedStyle(c).opacity),
                animation:c._fadeAnimation?.playState||'none',
                x:Math.round(c.getBoundingClientRect().x),
                y:Math.round(c.getBoundingClientRect().y)
              }))});
            if(ms>=800)resolve();else requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        return {...score,frames};
      });
      console.log('V271 SECOND WIN REAL FRAMES '+JSON.stringify(tenth.frames));
      const secondLate=tenth.frames?.filter(f=>f.ms>=560&&f.losers.some(c=>c.opacity>.015));
      if(secondLate?.length||
        !tenth.frames?.some(f=>f.ms<520&&(f.losers.length===0||f.losers.some(c=>c.opacity<.05)))||
        !tenth.frames?.some(f=>f.ms>=470&&f.motion==='approaching'&&
          f.losers.every(c=>c.opacity<.015)))
        throw Error('V272 SECOND round not identical early fade '+JSON.stringify(tenth.frames));
      await page.waitForFunction(()=>document.querySelector('.s3d-find256')?.dataset.constellationPhase==='ready'&&
        document.querySelectorAll('.s3d-find-choice').length===4,null,{timeout:22000});
      // THIRD distinct target, independent of second round's star milestone.
      const third=await page.evaluate(async ()=>{
        const root=document.querySelector('.s3d-find256');
        const target=root.querySelector('.s3d-find-choice[data-id="'+root.dataset.targetId+'"]');
        if(!target)return {error:'third target absent'};
        const id=root.dataset.targetId;
        target.click();
        const frames=[],start=performance.now();
        await new Promise(resolve=>{
          function tick(){
            const ms=performance.now()-start;
            frames.push({ms:Math.round(ms),phase:root.dataset.constellationPhase,
              hero:root.dataset.heroMotion,
              decoys:[...root.querySelectorAll('.s3d-find-dismissing')].map(c=>({
                alpha:Number(getComputedStyle(c).opacity),
                x:Math.round(c.getBoundingClientRect().x),
                y:Math.round(c.getBoundingClientRect().y)
              }))});
            if(ms>800)resolve();else requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        });
        return {id,frames,count:Number(localStorage.getItem('areg-correct-constellation-game-v1')||0),
          right:root.querySelector('.s3d-session-right')?.textContent};
      });
      console.log('V272 THIRD WIN REAL FRAMES '+JSON.stringify(third));
      if(third.error||third.count!==11||third.right!=='3'||
        third.frames.some(f=>f.ms>=570&&f.decoys.some(c=>c.alpha>.015))||
        !third.frames.some(f=>f.ms<520&&(f.decoys.length===0||f.decoys.some(c=>c.alpha<.05))))
        throw Error('V272 THREE consecutive rounds must share same fade '+JSON.stringify(third));
      if(tenth.error||tenth.count!==10||tenth.stars!==starsBefore+1||tenth.reward!==1)
        throw Error('V266 tenth correct must grant exactly one star '+JSON.stringify(tenth));
      // Real browser contract: modal LASTS until tapped, header is reset
      // immediately but the result card retains the finished-cycle numbers.
      const outcomes=await page.evaluate(async ()=>{
        const api=await import('./space-finding-session.js?v=272');
        const result=[];
        for(const kind of ['success','encourage','tie']){
          const fake=document.createElement('div');
          fake.className='s3d-root';fake.style.display='none';
          fake.innerHTML='<div class="s3d-hud"></div>';
          document.body.appendChild(fake);
          const session=api.createFindingSession(fake,{settings:{master:false,effects:false}});
          if(kind==='success'){session.rightAnswer();session.rightAnswer();session.wrongAnswer()}
          if(kind==='encourage'){session.wrongAnswer();session.wrongAnswer();session.rightAnswer()}
          const old=session.counts();
          let resolved=false;
          const running=session.showCycleResult().then(()=>{resolved=true});
          const overlay=fake.querySelector('.s3d-cycle-backdrop');
          const replay=overlay?.querySelector('.s3d-cycle-replay');
          // Timer regression: V267 auto-dismissed at 3100ms. V268 MUST not.
          if(kind==='success')await new Promise(ok=>setTimeout(ok,3300));
          const stillOpen=!!fake.querySelector('.s3d-cycle-backdrop');
          const counts=session.counts();
          result.push({kind,actual:fake.dataset.sessionResult,
            hasOverlay:!!overlay,stillOpen,resolvedBeforeTap:resolved,
            awaitingReplay:fake.dataset.sessionAwaitingReplay,
            finalWrong:overlay?.querySelector('.s3d-cycle-stats .s3d-session-wrong')?.textContent,
            finalRight:overlay?.querySelector('.s3d-cycle-stats .s3d-session-right')?.textContent,
            old,counts,hasReplay:replay?.textContent.includes('Խաղալ նորից'),
            particles:overlay?.querySelectorAll('.s3d-cycle-particle').length||0,
            hasTitle:!!overlay?.querySelector('.s3d-cycle-title')?.textContent});
          replay?.click();await running;
          if(!resolved||fake.querySelector('.s3d-cycle-backdrop'))
            throw Error('V268 replay did not resume on click');
          session.dispose();fake.remove();
        }
        return result;
      });
      if(outcomes.length!==3||outcomes.some(x=>x.kind!==x.actual||!x.hasOverlay||
         !x.stillOpen||x.resolvedBeforeTap||x.awaitingReplay!=='true'||
         !x.hasReplay||!x.hasTitle||x.counts.wrong!==0||x.counts.correct!==0||
         String(x.old.wrong)!==x.finalWrong||String(x.old.correct)!==x.finalRight)||
         outcomes[0].particles!==18||outcomes[1].particles!==0)
        throw Error('V268 manually restarted child-safe modal/score invalid '+JSON.stringify(outcomes));

      console.log('CONSTELLATION V268 PASS stationary fade, manual replay gate, score reset, results and 10th-star '+process.env.AREG_BROWSER);
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
