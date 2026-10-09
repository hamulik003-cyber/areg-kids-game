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
const layouts=JSON.parse(read('constellation-star-layouts.json'));
check(ids.length===38&&Object.keys(layouts).length===38,
      'V254 missing 38 original-image star maps');
check(ids.every(id=>Object.hasOwn(layouts,id))&&!quest.includes('const TRAILS='),
      'V254 must use measured image nodes, not approximate hand-drawn stars');
for(const id of ids){
 const L=layouts[id];
 if(!L){continue}
 check(Array.isArray(L.points)&&L.points.length>=3&&L.points.length<=16,
       id+': invalid number of calibrated touch stars');
 check(L.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1)),
       id+': star landmark is not a normalized image coordinate');
 check(Array.isArray(L.edges)&&L.edges.every(edge=>Array.isArray(edge)&&edge.length===2&&
       edge.every(n=>Number.isInteger(n)&&n>=0&&n<L.points.length)&&edge[0]!==edge[1]),
       id+': invalid final-image line graph');
 check(L.image.endsWith(id+'.webp')&&has(L.image),
       id+': star landmarks not matched to the actual final PNG/WebP image');
}
check(quest.includes("const atlasPromise=fetch('./constellation-star-layouts.json?v=255'")&&
      quest.includes('artworkAnchorsToWorld(activeLayout.points,ar,cr,camera)')&&
      quest.includes('activatedIllustrationEdges(activeLayout,target,')&&
      quest.includes('group.rotation.y=.045*leaving')&&
      !quest.includes('group.scale.multiplyScalar(.9995)'),
      'V254 scene must project calibrated stars into final artwork pixel positions');
const skyCss=read('space-3d-games.css');
check(quest.includes("photoStage.append(art)")&&
      quest.includes("assets/constellations-transparent/")&&
      quest.includes("art.src=transparentSrc")&&
      !quest.includes("photoAtmosphere.style.backgroundImage=")&&
      skyCss.includes(".s3d-quest-photo-stage")&&
      !skyCss.includes(".s3d-quest-photo-atmosphere")&&
      !skyCss.includes("mix-blend-mode:screen"),
      'V252 PNG/WebP transparent reveal must not reintroduce dark JPG rectangles');
check(quest.includes("function revealArtwork(token)")&&
      quest.includes("revealStartedAt=performance.now()")&&
      quest.includes("revealArtwork(token); // If still decoding")&&
      quest.includes("group.visible=false")&&
      quest.includes("group.visible=true")&&
      quest.includes("n.mesh.material.opacity=appear*exitFade*solvedOpacity")&&
      quest.includes("m.material.opacity=(i===0?.15:.97)*exitFade*solvedOpacity"),
      'V253 final art must dissolve puzzle-only 3D star overlays and reset next round');
check(quest.includes("keepAliveOsc=audioContext.createOscillator()")&&
      quest.includes("scheduleNextIntro();finish();")&&
      quest.includes("needEntryCueOnTouch")&&
      !/speechSynthesis\.(?:speak|cancel|pause|resume)/.test(quest),
      'V251 iPhone single WebAudio audio-session regression');
check(quest.includes("meteor.tick(t)")&&
      quest.includes("const deck=randomizedOrder(ctx.CONSTELLATIONS)")&&
      quest.includes("renderer.domElement.addEventListener('pointermove',pointerMove"),
      'V251 constellation meteor, nonrepeat and drag controls regression');

// Mathematical regression: inverse-project actual world points back to
// source image pixels, for both narrow phones and wide displays.
const geomFn=quest.match(/function artworkAnchorsToWorld\([^\n]*\)\{[\s\S]*?\n\}/)?.[0];
check(!!geomFn,'V254 geometry projection helper missing');
if(geomFn){
 const Vector3=class {constructor(x,y,z){this.x=x;this.y=y;this.z=z}};
 const toWorld=new Function('THREE',geomFn+';return artworkAnchorsToWorld')({Vector3});
 for(const ratio of [.48,.9,1.6]){
  const canvas={left:17,top:21,width:400*ratio,height:800};
  const img={left:canvas.left+canvas.width*.12,top:canvas.top+160,width:canvas.width*.76,height:500};
  const cam={position:{z:10.3},fov:46,aspect:ratio*.5};
  const halfH=cam.position.z*Math.tan(cam.fov*Math.PI/360),halfW=halfH*cam.aspect;
  for(const point of [[.25,.8],[.74,.15],[.5,.5]]){
   const world=toWorld([point],img,canvas,cam)[0];
   const px=canvas.left+canvas.width*(.5+world.x/(2*halfW));
   const py=canvas.top+canvas.height*(.5-world.y/(2*halfH));
   check(Math.abs(px-(img.left+point[0]*img.width))<.0001&&
         Math.abs(py-(img.top+point[1]*img.height))<.0001,
         'V254 artwork-to-world pixel projection shifted a landmark');
  }
 }
}
const graphFn=quest.match(/function activatedIllustrationEdges\([^\n]*\)\{[\s\S]*?\n  \}/)?.[0];
check(!!graphFn,'V254 actual-artwork edge activation missing');
if(graphFn){
 const activate=new Function(graphFn+';return activatedIllustrationEdges')();
 const triangle={edges:[[0,1],[1,2],[0,2]]};
 check(activate(triangle,0,[true,false,false]).length===0,
       'V254 triangle should not light an unjoined edge');
 check(activate(triangle,1,[true,true,false]).length===1,
       'V254 second triangle star must draw one exact illustrated edge');
 check(activate(triangle,2,[true,true,true]).length===2,
       'V254 closing triangle must draw its final two existing edges');
}

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
