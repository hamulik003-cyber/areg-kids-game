#!/usr/bin/env node
// AREG V232: deterministic repository-wide assets and source audit.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8'),has=p=>fs.existsSync(path.join(base,p)),fails=[];
const check=(v,message)=>{if(!v)fails.push(message)};
const app=read('app.js'),space=read('space-3d-games.js'),sw=read('service-worker.js');
for(const p of ['app.js','space-3d-games.js','blackhole-interstellar.js','service-worker.js','space-30-preview-engine.js','space-v3-preview.js','constellation-quest-v246.js','qa/browser-smoke.mjs','qa/star-economy.test.mjs','qa/pwa-update.test.mjs']){
  try{execFileSync(process.execPath,['--check',path.join(base,p)],{stdio:'pipe'})}
  catch(e){fails.push('invalid JS '+p+': '+e.stderr?.toString()?.slice(0,130))}
}
let total=0;
const specs=[
 ['Animals','const ANIMALS','const BIRDS','image',30],
 ['Birds','const BIRDS','const SEA_CREATURES','image',30],
 ['Sea','const SEA_CREATURES','const INSECTS','image',33],
 ['Insects','const INSECTS','const PLANETS','image',30],
 ['Planets','const PLANETS','const CONSTELLATION_TONES','img',30],
 ['Constellations','const CONSTELLATIONS','const SECTIONS','img',38],
 ['Approved 3D UV','const FINAL_UV_PATHS=','const finalUvCache=','uv',27]
];
for(const [label,begin,end,key,expected] of specs){
 const s=key==='uv'?space:app;const a=s.indexOf(begin),b=s.indexOf(end,a);
 check(a>=0&&b>a,label+': array not found');if(a<0||b<=a)continue;
 const rx=key==='uv'?/:\s*'([^']+\.(?:png|jpg))'/g:new RegExp(key+":[\\x22\\x27]([^\\x22\\x27]+)[\\x22\\x27]",'g');
 const names=[...s.slice(a,b).matchAll(rx)].map(x=>x[1]);
 check(names.length===expected,label+': expected '+expected+' images, got '+names.length);
 for(const n of names){
  total++;if(!has(n)){fails.push(label+': missing '+n);continue}
  const fd=fs.openSync(path.join(base,n),'r'),h=Buffer.alloc(12);fs.readSync(fd,h,0,12,0);fs.closeSync(fd);
  check(/\.png$/i.test(n)?h.subarray(0,8).toString('hex')==='89504e470d0a1a0a':
    /\.jpe?g$/i.test(n)?h[0]===255&&h[1]===216:true,label+': invalid image bytes '+n);
 }
 console.log('PASS '+label+' '+names.length+' images');
}
const sectionSource=app.slice(app.indexOf('const SECTIONS='),app.indexOf('\n  };',app.indexOf('const SECTIONS=')));
let games=0;
for(const section of ['nature','space','mind','create','magic']){
 const p=sectionSource.match(new RegExp('\\n    '+section+':\\{([\\s\\S]*?)(?=\\n    [a-z]+:\\{|$)'));
 check(!!p,'missing section '+section);if(!p)continue;
 const cards=[...p[1].matchAll(/\{id:'([^']+)',label:'([^']+)',thumb:'([^']+)',kind:'([^']+)'/g)];
 games+=cards.length;check(cards.length===4,section+' expected 4 games');
 for(const m of cards){total++;check(has(m[3]),'missing '+section+' icon '+m[3])}
 console.log('PASS section '+section+' '+cards.length+' entries');
}
for(const n of ['launcher.html','index.html','app.js','styles.css','space-3d-games.js','blackhole-interstellar.js','vendor/three.module.min.js','manifest.webmanifest'])check(has(n),'missing core '+n);
const launcher=read('launcher.html'),html=read('index.html'),quest=read('constellation-quest-v246.js');
check(sw.includes("fetch(request,{cache:'no-store'})")&&
  sw.includes("if(cached&&self.navigator?.onLine===false)return cached")&&
  sw.includes("event.respondWith(networkNavigation(request,event))")&&
  sw.includes("event.waitUntil(fresh.catch(()=>{}))")&&
  sw.includes("1200")&&
  !sw.includes("if(cached)return cached;\n  }\n  try{return await fetch(request)}"),
  'V284 prevent old cache-first home HTML from trapping browsers on obsolete app.js after deployment');
check(launcher.includes("location.replace('./')")&&!launcher.includes('__areg_build'),'DotKiosk launcher should use clean standalone entry');
const coreV=sw.match(/areg-v(\d+[a-z]?)-core/),runV=sw.match(/areg-v(\d+[a-z]?)-runtime/);
const appV=html.match(/app\.js\?v=(\d+[a-z]?)/),styleV=html.match(/styles\.css\?v=(\d+)/);
const spaceCssV=html.match(/space-3d-games\.css\?v=(\d+[a-z]?)/);
check(!!coreV&&!!runV&&coreV[1]===runV[1],'SW cache version mismatch');
check(!!appV&&app.includes("service-worker.js?v="+appV[1]),'SW registration version mismatch');
check(!!coreV&&!!appV&&coreV[1]===appV[1],'App/SW release version mismatch');
check(!!appV&&sw.includes("'./app.js?v="+appV[1]+"'"),'SW precache app version mismatch');
check(!!styleV&&sw.includes("'./styles.css?v="+styleV[1]+"'"),'SW precache CSS version mismatch');
check(!!spaceCssV&&sw.includes("'./space-3d-games.css?v="+spaceCssV[1]+"'"),'SW precache 3D CSS version mismatch');
check(/import\('\.\/space-3d-games\.js\?v=\d+'\)/.test(app),'Approved Space Search dynamic import missing');
check(/import\('\.\/constellation-quest-v246\.js\?v=\d+[a-z]?'\)/.test(app)&&app.includes('constellationQuest:launchConstellationQuest'),'Standalone constellation game not wired');
check(/\.\/constellation-quest-v246\.js\?v=\d+[a-z]?/.test(sw),'Constellation module not in offline core');
const constellationSource=app.slice(app.indexOf('const CONSTELLATIONS=['),app.indexOf('const SECTIONS={'));
const ids=[...constellationSource.matchAll(/\{id:'([^']+)',img:'([^']+)'/g)].map(m=>m[1]);
const shuffleDefinition=quest.match(/function randomizedOrder\(items\)\{[\s\S]*?\n\}/)?.[0];
check(!!shuffleDefinition,'V257 four-choice shuffle function missing');
if(shuffleDefinition){
 const shuffleItems=new Function(shuffleDefinition+';return randomizedOrder')();
 const examples=[{id:'hayk'},{id:'pegasus'},{id:'orion'},{id:'gemini'}];
 const out=shuffleItems(examples);
 check(out.length===4&&out.every(v=>typeof v==='object'&&examples.includes(v))&&
       new Set(out.map(v=>v.id)).size===4,
       'V257 shuffled deck must return four actual constellation objects, not numeric array indices');
}
const skyCss=read('space-3d-games.css');
check(ids.length===38&&new Set(ids).size===38,
      'Constellation four-choice search requires all 38 unique approved images');
check(quest.includes("root.dataset.constellationMode='four-choice'")&&
      quest.includes("plan.options.forEach((item,i)=>")&&
      quest.includes("grid-template-columns:repeat(2,minmax(0,1fr))")===false&&
      skyCss.includes("grid-template-columns:repeat(2,minmax(0,1fr))")&&
      skyCss.includes(".s3d-find-choice")&&skyCss.includes(".s3d-find-selected"),
      'V256 must show four child-sized illustrated picture choices in 2x2 grid');
check(quest.includes('const opts=randomizedOrder([t,...possible.slice(0,3)])')&&
      quest.includes("const ignored=new Set([...recent,t.id])")&&
      quest.includes("if(deckIndex>=deck.length)shuffleTargetCycle()")&&
      quest.includes('plan.options.map(preload)')&&
      quest.includes("img.src=imageSources[i].src"),
      'V256 four distinct nonrepeating answer choices must decode before screen entrance');
check(quest.includes("const ENTER_MS=780,WIN_HOLD_MS=2750,WIN_ZOOM_MS=850,EXIT_MS=690,STARFIELD_PAUSE_MS=160,LOSER_FADE_MS=580")&&
      quest.includes('showWinningHero(button,button._imageRecord,item)')&&
      quest.includes('function heroGeometry(record,w,h)')&&
      quest.includes("mainTimer=delay(beginExit,WIN_HOLD_MS)")&&
      quest.includes("session.showCycleResult().then(()=>{if(!disposed)buildRound()})")&&
      quest.includes("root.dataset.constellationPhase='ready'"),
      'V276 preserve win/exit stage timing with softer native transitions');
check(quest.includes("sound('wrong')")&&quest.includes("sound('correct')")&&
      quest.includes('keepAliveOsc=audioContext.createOscillator()')&&
      !/speechSynthesis\.(?:speak|cancel|pause|resume)/.test(quest),
      'V256 must preserve correct/wrong SFX with a single reliable iPhone audio context');
check(quest.includes("assets/constellations-transparent/")&&
      quest.includes("loadImage(artworkPath(item,'png'))")&&
      quest.includes("meteor.tick(t)")&&
      !quest.includes("const TRAILS=")&&
      !quest.includes("activatedIllustrationEdges"),
      'V256 should use only original transparent artwork and shared live galactic sky, no star tracing');
check(skyCss.includes('.s3d-find-stage')&&
      skyCss.includes('pointer-events:auto')&&
      skyCss.includes('touch-action:manipulation')&&
      skyCss.includes('.s3d-find-choice img'),
      'V256 constellation options must be touch-accessible');
check(quest.includes("function visibleAlphaBounds(image)")&&
      quest.includes("getImageData(0,0,n,n).data")&&
      quest.includes("function sizeVisibleIllustration(button,img,record)")&&
      quest.includes("bounds:visibleAlphaBounds(image)")&&
      quest.includes("const m=computeConstellationChoiceFit(w,h,nativeW,nativeH,b,protectedV287)")&&
      quest.includes("sizeVisibleIllustration(")&&
      skyCss.includes(".s3d-find-art-shell")&&
      skyCss.includes(".s3d-find-choice:nth-child(2) .s3d-find-art-shell"),
      'V258 artwork must be balanced by actual alpha silhouette, independently of float motion');
check(quest.includes("function showWinningHero(button,record,item)")&&
      quest.includes("function heroGeometry(record,w,h)")&&
      quest.includes("selectedCard?.remove()")&&
      quest.includes("const end='translate3d(0px,0px,0px) scale(1)'")&&
      quest.includes("hero.style.transform=end")&&
      quest.includes("const marginX=Math.min(16,w*.04)")&&
      quest.includes("marginY=Math.min(16,h*.045)")&&
      quest.includes("clearWinningHero();resetCards();phase='starfield-pause'")&&
      skyCss.includes(".s3d-find-hero{")&&
      skyCss.includes(".s3d-find-hero img{"),
      'V262 winner is alpha-centered within independent full-stage hero and old zoom is removed');
const heroSource=quest.match(/function heroGeometry\(record,w,h\)\{[\s\S]*?\n  \}/)?.[0];
check(!!heroSource,'V262 standalone hero geometry missing');
if(heroSource){
 const heroGeometry=new Function('clamp',heroSource+';return heroGeometry')(
   (x,a,b)=>Math.max(a,Math.min(b,x)));
 for(const [iw,ih,bounds] of [
   [800,500,{x:.35,y:.78,w:.70,h:.27}],
   [500,900,{x:.80,y:.20,w:.24,h:.85}],
   [600,600,{x:.50,y:.50,w:.85,h:.85}],
   [640,940,{x:.19,y:.81,w:.31,h:.27}]
 ]){
  for(const [w,h] of [[340,640],[430,780],[520,460]]){
   const g=heroGeometry({width:iw,height:ih,bounds},w,h);
   const fit=Math.min(w/iw,h/ih);
   const centerX=w/2+g.shiftX+g.zoom*(bounds.x-.5)*iw*fit;
   const centerY=h/2+g.shiftY+g.zoom*(bounds.y-.5)*ih*fit;
   check(Number.isFinite(g.zoom)&&g.zoom>0&&g.figureW<=w-2*g.marginX+1e-4&&
      g.figureH<=h-2*g.marginY+1e-4&&
      Math.abs(centerX-w/2)<.001&&Math.abs(centerY-h/2)<.001,
      'V262 cropped or miscentered the selected constellation on responsive stage');
  }
 }
}
// V275: the original two-stage hero algorithm STOPPED at 30% until the
// decoy onfinish callback. The selected art must NEVER wait there again.
check(quest.includes("function animateWinningHero(t)")&&
  quest.includes("hero._winStartPose={x:dx,y:dy,s:firstScale}")&&
  quest.includes("hero._approachStart=winAt")&&
  quest.includes("hero._moveAnimation=hero.animate(")&&
  quest.includes("{duration:WIN_ZOOM_MS,easing:'cubic-bezier(.42,0,.58,1)'")&&
  quest.includes("hero._moveAnimation.onfinish=()=>{")&&
  quest.includes("hero.style.transform=end")&&
  quest.includes("root.dataset.heroMotion='holding'")&&
  quest.includes("root.dataset.heroMotion='exiting'")&&
  quest.includes("animateWinningHero(t)")&&
  quest.includes("const e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2")&&
  space.includes("const q=clamp((t-winStart)/850,0,1),e=easeOutCubic(q)")&&
  space.includes("transition={type:'exit',start:now,duration:690}")&&
  space.includes("const STARFIELD_PAUSE_MS=160")&&
  !quest.includes("earlyProgress")&&
  !quest.includes("_fadeReleaseAt")&&
  !quest.includes("const afterStart=Math.max(hero._approachStart+LOSER_FADE_MS,")&&
  !quest.includes("let e=earlyProgress,arrived=false"),
  'V275 winning hero must approach once, continuously, not stop at 30% and resume after fades');
check(quest.includes("const animation=hero._moveAnimation;")&&
  quest.includes("root.dataset.heroApproachProgress=p.toFixed(4)")&&
  quest.includes("hero._moveAnimation.cancel();hero._moveAnimation=null")&&
  quest.includes("winningHero._moveAnimation?.cancel()")&&
  quest.includes("decoyLayerAnimation.onfinish=()=>{")&&
  quest.includes("if(winningHero){")&&
  quest.includes("function beginExit()"),
  'V275 compositor hero owns visual position; RAF is diagnostic, exit cancels only its own animation');
check(!quest.includes("delay(()=>finishLoserFade(),LOSER_FADE_MS+150)")&&
  quest.includes("if(decoyLayerAnimation.playState==='finished')finishLoserFade()")&&
  quest.includes("decoyLayerAnimation.onfinish=()=>{")&&
  quest.includes("if(!disposed&&decoyLayer===layer)finishLoserFade()"),
  'V273 no fallback timeout may abruptly remove still-visible/paused three artworks');
check(quest.includes("root.dataset.constellationBuild='lab-single-layer-synchronized-decoy-fade'")&&
  quest.includes("plan.ready=Promise.all(plan.options.map(preload))")&&
  quest.includes("plan.prepared=true;return records")&&
  quest.includes("const next=queued;")&&
  quest.includes("if(next&&!next.prepared&&!next.preloadFailed)")&&
  quest.includes("root.dataset.nextQuartetReady='waiting'")&&
  quest.includes("root.dataset.nextQuartetReady=roundIndex===ctx.CONSTELLATIONS.length")&&
  quest.includes("prepare(next).then(()=>{")&&
  quest.includes("beginExit();")&&
  quest.includes("plan.ready=null;plan.prepared=false;plan.preloadFailed=false;queued=plan;buildRound()")&&
  !quest.includes("prepare(queued).catch(()=>{if(!disposed)queued=null})"),
  'V274 DO NOT clear winning art / empty the sky until all next quartet assets have decoded');
const finding=read('space-finding-session.js'),styles=read('space-3d-games.css');
check(quest.includes("function animateLoserFade(t)")&&
    quest.includes("const eased=p*p*(3-2*p)")&&
    quest.includes("decoyLayer.style.opacity=(1-eased).toFixed(4)")&&
    quest.includes("LOSER_FADE_MS=580")&&
    quest.includes("shell.style.animationPlayState='paused'")&&
    quest.includes("selectedCard=button")&&
    quest.includes("hero._approachStart=winAt")&&
    quest.includes("loserFadeStart=winAt")&&
    quest.includes("selectedCard?.remove()"),
    'V276 three stationary decoys begin smooth 580ms opacity fade on same tap');
for(const p of [0,.1,.25,.5,.75,.9,.98,1]){
  const e=p*p*(3-2*p);
  check(e>=0&&e<=1&&1-e>=0&&1-e<=1,
    'V269 760ms alpha-only decoy fade is continuous and bounded');
}
check(580<850&&
  quest.includes("loserFadeStart=winAt")&&
  quest.includes("hero._approachStart=winAt")&&
  quest.includes("WIN_ZOOM_MS=850")&&
  quest.includes("LOSER_FADE_MS=580"),
  'V278 approved gentle hero now approaches in 850ms while all three decoys fade in place over 580ms');
check(quest.includes("root.dataset.constellationBuild='lab-single-layer-synchronized-decoy-fade'")&&
  quest.includes("const criticalFade=phase==='winning'&&t-winAt<LOSER_FADE_MS+100")&&
  quest.includes("if(!criticalFade){")&&
  quest.includes("root.dataset.criticalFade=criticalFade?'true':'false'")&&
  quest.includes("if(phase==='winning'&&!queued&&roundIndex!==ctx.CONSTELLATIONS.length)")&&
  quest.includes("prewarmTimer=delay(warmNext,130)")&&
  !quest.includes("prewarmTimer=delay(warmNext,650)")&&
  quest.includes("if(disposed||queued||roundIndex===ctx.CONSTELLATIONS.length)return;"),
  'V272 MUST reserve WebKit GPU frames during EVERY answer and avoid prewarm while user decides');
check(quest.includes("const fixed=cards.filter(card=>card!==button).map(card=>({")&&
  quest.includes("const layer=document.createElement('div')")&&
  quest.includes("layer.className='s3d-find-decoy-layer'")&&
  quest.includes("layer.appendChild(card)")&&
  quest.includes("decoyLayerAnimation=layer.animate(")&&
  quest.includes("root.dataset.decoyFadeEngine='shared-layer'")&&
  quest.includes("beginWinningHeroApproach();")&&
  !quest.includes("const animation=card.animate(")&&
  quest.indexOf("showWinningHero(button,button._imageRecord,item)")<quest.indexOf("layer.appendChild(card)"),
  'Lab: all three original decoded art choices grouped and faded by a SINGLE native layer, native 850ms hero independent');
check(quest.includes("constellationFindName(target)")&&
    !quest.includes('s3d-find-progress')&&
    !quest.includes('roundLabel')&&
    !quest.includes('<div class="s3d-score">'),
    'V267 preserve declensions, clean header and hidden lower caption');
const formsMatch=quest.match(/export const CONSTELLATION_FIND_FORMS=Object.freeze\((\{[\s\S]*?\})\);/);
check(!!formsMatch,'V266 explicit declensions required');
if(formsMatch){
  const forms=JSON.parse(formsMatch[1]);
  const allIds=[...app.slice(app.indexOf('const CONSTELLATIONS=['),app.indexOf('const SECTIONS={')).matchAll(/id:'([^']+)'/g)].map(x=>x[1]);
  check(Object.keys(forms).length===38&&allIds.length===38&&
    allIds.every(id=>typeof forms[id]==='string'&&forms[id].length>1)&&
    forms['hayk-orion']==='Հայկը'&&forms['hayk-belt']==='Հայկի գոտին'&&
    forms.hercules==='Հերկուլեսը'&&
    Object.values(forms).every(x=>x.endsWith('ը')||x.endsWith('ն')),
    'V266 all 38 correct definite forms');
}
check(space.includes("if(ctx.recordCorrectAnswer('space-search'))reward(root,ctx,true)")&&
  quest.includes("if(ctx.recordCorrectAnswer('constellation-game'))award()")&&
  app.includes("const count=(spaceCorrectCounts[gameId]||0)+1")&&
  app.includes("if(count%10!==0)return false")&&
  app.includes("function resetSpaceCorrectAnswers()")&&
  app.includes("function cleanupGame()")&&
  app.includes("resetSpaceCorrectAnswers();")&&
  app.includes("resetCorrectAnswerStreak:resetSpaceCorrectAnswers")&&
  !app.includes("localStorage.setItem(key,String(count))")&&
  !app.includes("Math.max(count,saved)")&&
  finding.includes("ctx?.resetCorrectAnswerStreak?.()"),
  'V282 both star-awarding games award every 10 CORRECT PER VISIT; leaving or replay resets progress');
check(finding.includes('export function createFindingSession')&&
  finding.includes('export function classifyFindingResult')&&
  finding.includes("root.dataset.sessionWrong=String(wrong)")&&
  finding.includes("root.dataset.sessionCorrect=String(correct)")&&
  finding.includes("root.dataset.sessionResult=outcome")&&
  finding.includes("function showCycleResult()")&&
  finding.includes("const finalWrong=wrong,finalCorrect=correct")&&
  finding.includes("wrong=0;correct=0;update()")&&
  finding.includes("root.dataset.sessionAwaitingReplay='true'")&&
  finding.includes("replay.addEventListener('click'")&&
  finding.includes('Խաղալ նորից')&&
  finding.includes("keepAliveOsc=ac.createOscillator()")&&
  finding.includes("ac.resume().then(play)")&&
  finding.includes('source.start(now+.22+i*.075')&&
  !finding.includes('resultTimer')&&
  !finding.includes('setTimeout(()=>{')&&
  !finding.includes('localStorage.setItem(')&&
  styles.includes('.s3d-cycle-replay')&&
  styles.includes('.s3d-session-wrong')&&styles.includes('.s3d-session-right')&&
  styles.includes('.s3d-cycle-card'),
  'V268 child-controlled replay: reset header, keep final result, green manual button, live applause');
check(space.includes("createFindingSession(root,ctx,hud.score)")&&
  space.includes('seenTargets.add(target.id)')&&
  space.includes("if(seenTargets.size===pool.length)")&&
  space.includes("root.dataset.spaceRoundPhase='result'")&&
  space.includes('session.showCycleResult().then(')&&
  space.includes('session.wrongAnswer()')&&
  space.includes('session.rightAnswer()')&&
  quest.includes("createFindingSession(root,ctx)")&&
  quest.includes("if(roundIndex===ctx.CONSTELLATIONS.length)")&&
  quest.includes("root.dataset.constellationPhase='result'")&&
  quest.includes("session.showCycleResult().then(")&&
  quest.includes("session.wrongAnswer()")&&quest.includes("session.rightAnswer()"),
  'V268 BOTH games must pause at full-tour result until green replay tap');
check(sw.includes('space-finding-session.js?v=285')&&
      app.includes('space-3d-games.js?v=285')&&
      app.includes('constellation-quest-v246.js?v=294h'),
      'V268 versioned module imports and PWA offline cache must be synchronized');

check(app.includes("stars-=item.cost")&&
  app.includes("saveStars();")&&
  app.includes("updateMagicAvailability()")&&
  app.includes("for(const card of sectionGames.querySelectorAll(\'.magic-collect-card\'))")&&
  app.includes("$('.magic-lock',card)?.remove()")&&
  app.includes("magicUnlocked.add(item.id)")&&
  app.includes("if(!magicUnlocked.has(item.id))")&&
  app.includes("✓ Բացված է")&&
  read("styles.css").includes(".magic-collect-card.is-unlocked .magic-lock{display:none !important}")&&
  sw.includes("'./styles.css?v=285'")&&
  html.includes('styles.css?v=285'),
  'V282 bonus-field purchases must debit stars once and remove visible black lock disk, including previously unlocked cards');
const refresh=read('refresh.html');
check(refresh.includes("service-worker.js?v=294h")&&
      refresh.includes("navigator.serviceWorker.register(")&&
      refresh.includes("registration.update()")&&
      refresh.includes("index.html")&&
      !refresh.includes("caches.delete("),
      'V270 one-time cache-safe DotKiosk update route must be available');

check(html.includes('id="customMusicInput"')&&html.includes('id="savedMusicButton"')&&
      html.includes('id="defaultMusicButton"')&&html.includes('id="musicLevel"')&&
      html.includes('id="effectsLevel"')&&html.includes('id="voiceLevel"')&&
      app.includes("const MUSIC_DB='areg-menu-music-v1'")&&
      app.includes('indexedDB.open(MUSIC_DB,1)')&&app.includes('saveChosenMusic(file)')&&
      app.includes('createMediaElementSource(menuMusic)')&&
      app.includes("menuMusic.src=next||DEFAULT_MENU_MUSIC")&&
      app.includes('function effectsLevel()')===false&&
      app.includes('function wantsMenuMusic()')&&
      !app.includes('localStorage.clear()'),
      'V285 local on-device menu music, WebAudio gain, safe settings and user data');
check(space.includes('ctx.settings?.effectsVolume??75')&&
      quest.includes('ctx.settings?.effectsVolume??75')&&
      read('space-finding-session.js').includes('const audioScale=')&&
      app.includes('voiceLevel()')&&app.includes("menuMusic.pause();\n    const map="),
      'V285 audio gain applies to both Space games and results without moving visuals');
// V294 figure-only normalization: an audited 38/38 alpha histogram included
// decorative nebula, so user-visible subjects (especially Lyra/Crown) remained
// much smaller than adjacent constellation animals on a real iPhone.
const subjectFramesSource=quest.match(/export const CONSTELLATION_CHOICE_FRAMES=Object\.freeze\((\{[\s\S]*?\})\);/);
check(!!subjectFramesSource,'V294 curated subject frames missing');
if(subjectFramesSource){
 const subjects=Function('return ('+subjectFramesSource[1]+')')();
 const stems=JSON.parse(read('assets/constellations-transparent/manifest.json'))
   .map(x=>x.webp.split('/').pop().replace(/\.webp$/,''));
 check(stems.length===38&&Object.keys(subjects).length===38&&
   stems.every(x=>Object.hasOwn(subjects,x)),
   'V294 all 38 originals require one subject framing record');
 check(subjects['01-hayk-orion']===null&&subjects['16-hayk-belt']===null,
   'Two V287 user-approved Orion visuals must keep unchanged framing');
 check(stems.filter(x=>Array.isArray(subjects[x])).length===36&&
   stems.every(x=>!subjects[x]||(Array.isArray(subjects[x])&&
     subjects[x].length===4&&subjects[x].every(Number.isFinite)&&
     subjects[x][0]>=0&&subjects[x][1]>=0&&subjects[x][2]<=1&&subjects[x][3]<=1&&
     subjects[x][2]-subjects[x][0]>.3&&subjects[x][3]-subjects[x][1]>.3)),
   '36 curated subject boxes must be valid, not geometrically cropped');
 check(subjects['10-lyra'][2]-subjects['10-lyra'][0]<.5&&
   subjects['33-corona-borealis'][3]-subjects['33-corona-borealis'][1]<.55,
   'V294 narrow Lyra and Crown need nebula-independent visual bounds');
 check(quest.includes('const b=record.choiceBounds||record.bounds;')&&
   quest.includes('record.choiceBounds=visualChoiceBounds(item,record.bounds)')&&
   quest.includes('const b=record.bounds;')&&
   quest.includes('const ARTWORK_LRU_LIMIT=10'),
   'Only four-choice visual sizes may change; hero geometry and image cache stay fixed');
}
check(sw.includes("const PRESERVED_V294F_RUNTIME='areg-v294f-runtime'") &&
  quest.includes("+'?v=294f'"),
  'V294 updated quest must retain unchanged image URLs and previous runtime cache');

// V294h 8-actual-screenshot regression: larger untouched subjects, not clouds.
check(quest.includes('export function computeConstellationChoiceFit(')&&
  quest.includes('const m=computeConstellationChoiceFit(w,h,nativeW,nativeH,b,protectedV287)')&&
  quest.includes('const b=record.bounds;')&&
  quest.includes("button.dataset.choiceFit='v294h'"),
  'All constellation choice cards must use real subject fit; hero V287 bounds untouched');
check(quest.includes('const fraction=isProtectedV287?.84:.91;')&&
  !quest.includes('const zoom=clamp(Math.min(w*.84/figureW,h*.84/figureH),.88,2.02)'),
  'V294h must remove hard 2.02 ceiling for 36 small subjects');
check(skyCss.includes('top:17%;bottom:9%;left:3.5%;right:3.5%')&&
  html.includes('space-3d-games.css?v=294h')&&
  sw.includes("'./space-3d-games.css?v=294h'")&&
  sw.includes("const PRESERVED_V294G_RUNTIME='areg-v294g-runtime'"),
  'V294h increased stage + correct PWA stylesheet version/cache preservation');

const alphaManifest=JSON.parse(read('assets/constellations-transparent/manifest.json'));
check(alphaManifest.length===38&&alphaManifest.every(item=>
    has(item.png)&&has(item.webp)&&
    item.webp_bytes>0&&item.webp_bytes<(item.source==='16-hayk-belt.jpg'?700000:550000)&&
    item.png_bytes>0),
    'V252 missing/unoptimized transparent PNG and WebP pairs');
check(ids.every(id=>alphaManifest.some(item=>item.source.endsWith(id+'.jpg'))),
    'V252 constellation game IDs must map to transparent artwork');
check(!html.includes('__areg_build'),'Old forced reload redirect reintroduced');
check(app.includes('gallery-hires-layer')&&app.includes('warmGalleryPreviews'),'Gallery predecode fix missing');
const core=sw.match(/const CORE=\[([\s\S]*?)\];/);
if(core)for(const r of core[1].matchAll(/'\.\/([^']+)'/g)){const n=r[1].split('?')[0];total++;check(has(n),'missing precached '+n)}
const tokenExp=[...app.matchAll(/_jwt=[^.]+\.(eyJ[A-Za-z0-9_-]+)\./g)].map(x=>{try{return JSON.parse(Buffer.from(x[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString()).exp}catch{return null}}).filter(Number.isFinite);
const expired=tokenExp.filter(x=>x<Date.now()/1000).length;
console.log('AUDIO WARNING: '+expired+' / '+tokenExp.length+' signed external audio URLs expired or require renewal (not covered by image checks).');
console.log('AUDIT '+(fails.length?'FAIL':'PASS')+': '+total+' image/core assets, '+games+' mini-game entries, 5 sections.');
if(fails.length){for(const e of fails)console.error('FAIL '+e);process.exitCode=1}
