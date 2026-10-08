#!/usr/bin/env node
// AREG V232: deterministic repository-wide assets and source audit.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const base=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8'),has=p=>fs.existsSync(path.join(base,p)),fails=[];
const check=(v,message)=>{if(!v)fails.push(message)};
const app=read('app.js'),space=read('space-3d-games.js'),sw=read('service-worker.js');
for(const p of ['app.js','space-3d-games.js','blackhole-interstellar.js','service-worker.js','space-30-preview-engine.js','space-v3-preview.js']){
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
const launcher=read('launcher.html');
check(launcher.includes('__areg_build=236'),'PWA launcher out of date');
check(sw.includes('areg-v236-core')&&sw.includes('areg-v236-runtime'),'SW cache out of date');
const core=sw.match(/const CORE=\[([\s\S]*?)\];/);
if(core)for(const r of core[1].matchAll(/'\.\/([^']+)'/g)){const n=r[1].split('?')[0];total++;check(has(n),'missing precached '+n)}
const tokenExp=[...app.matchAll(/_jwt=[^.]+\.(eyJ[A-Za-z0-9_-]+)\./g)].map(x=>{try{return JSON.parse(Buffer.from(x[1].replace(/-/g,'+').replace(/_/g,'/'),'base64').toString()).exp}catch{return null}}).filter(Number.isFinite);
const expired=tokenExp.filter(x=>x<Date.now()/1000).length;
console.log('AUDIO WARNING: '+expired+' / '+tokenExp.length+' signed external audio URLs expired or require renewal (not covered by image checks).');
// V233 Offline Edition: enumerate every real asset on the device install.
const offline=JSON.parse(read('offline-assets-v233.json'));
check(offline.version===233,'Offline manifest version mismatch');
check(offline.groups.length===2,'Offline packages count mismatch');
const offlineList=offline.groups.flatMap(g=>g.files);
check(offlineList.length>=345,'Offline package missing game assets');
check(new Set(offlineList).size===offlineList.length,'Duplicate offline paths');
for(const file of offlineList)check(has(file),'Offline asset missing '+file);
check(has('offline-setup.html'),'Offline setup missing');
try{
 const page=read('offline-setup.html');
 const start=page.indexOf('<script>'),end=page.lastIndexOf('</script>');
 if(start<0||end<=start)throw Error('installer script missing');
 new Function(page.slice(start+8,end));
}catch(e){fails.push('Offline setup script failed to compile: '+e.message)}
check(sw.includes('areg-device-assets-v1'),'Offline cache not referenced by SW');
check(sw.includes('offlineNavigation'),'Offline-first navigation missing');
console.log('OFFLINE PACK '+offlineList.length+' files, '+Math.round(offline.groups.reduce((n,g)=>n+g.bytes,0)/1048576)+' MiB');
console.log('AUDIT '+(fails.length?'FAIL':'PASS')+': '+total+' image/core assets, '+games+' mini-game entries, 5 sections.');
if(fails.length){for(const e of fails)console.error('FAIL '+e);process.exitCode=1}
