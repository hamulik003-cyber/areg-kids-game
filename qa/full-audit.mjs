#!/usr/bin/env node
// AREG V232: deterministic repository-wide assets and source audit.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8'),has=p=>fs.existsSync(path.join(base,p)),fails=[];
const check=(v,message)=>{if(!v)fails.push(message)};
const app=read('app.js'),space=read('space-3d-games.js'),sw=read('service-worker.js');
for(const p of ['app.js','space-3d-games.js','blackhole-interstellar.js','service-worker.js','space-30-preview-engine.js','space-v3-preview.js','constellation-quest-v246.js']){
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
check(launcher.includes("location.replace('./')")&&!launcher.includes('__areg_build'),'DotKiosk launcher should use clean standalone entry');
const coreV=sw.match(/areg-v(\d+)-core/),runV=sw.match(/areg-v(\d+)-runtime/);
const appV=html.match(/app\.js\?v=(\d+)/),styleV=html.match(/styles\.css\?v=(\d+)/);
const spaceCssV=html.match(/space-3d-games\.css\?v=(\d+)/);
check(!!coreV&&!!runV&&coreV[1]===runV[1],'SW cache version mismatch');
check(!!appV&&app.includes("service-worker.js?v="+appV[1]),'SW registration version mismatch');
check(!!coreV&&!!appV&&coreV[1]===appV[1],'App/SW release version mismatch');
check(!!appV&&sw.includes("'./app.js?v="+appV[1]+"'"),'SW precache app version mismatch');
check(!!styleV&&sw.includes("'./styles.css?v="+styleV[1]+"'"),'SW precache CSS version mismatch');
check(!!spaceCssV&&sw.includes("'./space-3d-games.css?v="+spaceCssV[1]+"'"),'SW precache 3D CSS version mismatch');
check(/import\('\.\/space-3d-games\.js\?v=\d+'\)/.test(app),'Approved Space Search dynamic import missing');
check(/import\('\.\/constellation-quest-v246\.js\?v=\d+'\)/.test(app)&&app.includes('constellationQuest:launchConstellationQuest'),'Standalone constellation game not wired');
check(/\.\/constellation-quest-v246\.js\?v=\d+/.test(sw),'Constellation module not in offline core');
const constellationSource=app.slice(app.indexOf('const CONSTELLATIONS=['),app.indexOf('const SECTIONS={'));
const ids=[...constellationSource.matchAll(/\{id:'([^']+)',img:'([^']+)'/g)].map(m=>m[1]);
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
      quest.includes("img.src=imageSources[i]"),
      'V256 four distinct nonrepeating answer choices must decode before screen entrance');
check(quest.includes("const ENTER_MS=780,WIN_HOLD_MS=2750,WIN_ZOOM_MS=850,EXIT_MS=690,STARFIELD_PAUSE_MS=160")&&
      quest.includes('pose(card,{x:centerX-')&&
      quest.includes("pose(card,{x:r.left<centerX?-26:26")&&
      quest.includes("mainTimer=delay(beginExit,WIN_HOLD_MS)")&&
      quest.includes("delay(buildRound,STARFIELD_PAUSE_MS)")&&
      quest.includes("root.dataset.constellationPhase='ready'"),
      'V256 must preserve Space Search exact correct-answer zoom/hold/exit/pause/enter rhythm');
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

const alphaManifest=JSON.parse(read('assets/constellations-transparent/manifest.json'));
check(alphaManifest.length===38&&alphaManifest.every(item=>
    has(item.png)&&has(item.webp)&&
    item.webp_bytes>0&&item.webp_bytes<550000&&
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
