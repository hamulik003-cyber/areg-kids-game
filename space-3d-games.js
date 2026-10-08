import {renderInterstellarBlackHole,makeBlackHoleFlowMaterial} from './blackhole-interstellar.js?v=217';
// V163 centered proportional feedback rings + one soft green flash
import * as THREE from './vendor/three.module.min.js';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function bag(items){let q=[],last='';return()=>{if(!q.length){q=shuffle(items);if(q.length>1&&q[q.length-1].id===last)[q[0],q[q.length-1]]=[q[q.length-1],q[0]]}const x=q.pop();last=x.id;return x}}
function voice(text,ctx){
  if(!ctx.settings.master||!ctx.settings.voice||!('speechSynthesis'in window))return;
  try{
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang='hy-AM';u.rate=.86;u.pitch=1.03;u.volume=1;
    const v=ctx.pickArmenianSpeechVoice?.();if(v)u.voice=v;speechSynthesis.speak(u);
  }catch{}
}
function answerSfx(ok,ctx){
  if(!ctx?.settings?.master||!ctx?.settings?.effects)return;
  try{
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    const ac=new AC();
    const play=()=>{
      const now=ac.currentTime+.018;
      const notes=ok
        ? [{f:659.25,t:0,d:.16,v:.064},{f:783.99,t:.080,d:.17,v:.060},{f:987.77,t:.165,d:.23,v:.054}]
        : [{f:329.63,t:0,d:.17,v:.054},{f:246.94,t:.100,d:.24,v:.050}];
      notes.forEach(n=>{
        const o=ac.createOscillator(),g=ac.createGain();
        o.type=ok?'sine':'triangle';
        o.frequency.setValueAtTime(n.f,now+n.t);
        if(!ok)o.frequency.exponentialRampToValueAtTime(n.f*.93,now+n.t+n.d);
        g.gain.setValueAtTime(.0001,now+n.t);
        g.gain.exponentialRampToValueAtTime(n.v,now+n.t+.016);
        g.gain.exponentialRampToValueAtTime(.0001,now+n.t+n.d);
        o.connect(g);g.connect(ac.destination);
        o.start(now+n.t);o.stop(now+n.t+n.d+.025);
      });
      setTimeout(()=>{try{ac.close()}catch{}},720);
    };
    if(ac.state==='running')play();
    else ac.resume().then(play).catch(()=>{try{ac.close()}catch{}});
  }catch{}
}
function reward(host,ctx){
  ctx.awardStar();
  const d=document.createElement('div');d.className='s3d-reward';d.textContent='⭐ +1';host.appendChild(d);setTimeout(()=>d.remove(),1100);
}
const MOON_TEXTURE_DATA='data:image/jpeg;base64,'+"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";
const TEXTURE_PATHS={
  sun:'assets/space3d/2k_sun.jpg',
  mercury:'assets/space3d/2k_mercury.jpg',
  venus:'assets/space3d/2k_venus_surface.jpg',
  earth:'assets/space3d/2k_earth_daymap.jpg',
  moon:MOON_TEXTURE_DATA,
  mars:'assets/space3d/2k_mars.jpg',
  jupiter:'assets/space3d/2k_jupiter.jpg',
  saturn:'assets/space3d/2k_saturn.jpg',
  uranus:'assets/space3d/2k_uranus.jpg',
  neptune:'assets/space3d/2k_neptune.jpg',
  phobos:'assets/space3d/2k_phobos.jpg',
  deimos:'assets/space3d/2k_deimos_true360.jpg',
  io:'assets/space3d/4k_io.jpg',
  europa:'assets/space3d/2k_europa.jpg',
  ganymede:'assets/space3d/2k_ganymede.jpg',
  callisto:'assets/space3d/2k_callisto.jpg',
  titan:'assets/space3d/4k_titan.jpg',
  enceladus:'assets/space3d/real/enceladus.jpg',
  titania:'assets/space3d/real/titania.jpg',
  oberon:'assets/space3d/real/oberon.jpg',
  triton:'assets/space3d/real/triton.jpg',
  pluto:'assets/space3d/real/pluto.jpg',
  ceres:'assets/space3d/2k_ceres.jpg',
  haumea:'assets/space3d/real/haumea.jpg',
  makemake:'assets/space3d/real/makemake.jpg',
  eris:'assets/space3d/real/eris.jpg'
};
const REALISTIC_IDS=new Set([...Object.keys(TEXTURE_PATHS),'charon','solar-system','milky-way','black-hole']);
const USER_UV_IDS=new Set([
  'io','europa','ganymede','callisto','titan','enceladus','titania','oberon','triton','sun',
  'mercury','moon','pluto','venus','ceres','earth','haumea','makemake','eris','jupiter',
  'uranus','mars','saturn','neptune','phobos','deimos','charon'
]);
const FINAL_UV_PATHS={
  sun:'assets/space3d/user-final/01-sun.png',
  mercury:'assets/space3d/user-final/02-mercury-v2.jpg',
  venus:'assets/space3d/user-final/03-venus.png',
  earth:'assets/space3d/user-final/04-earth.png',
  moon:'assets/space3d/user-final/05-moon-v2.jpg',
  mars:'assets/space3d/user-final/06-mars.png',
  jupiter:'assets/space3d/user-final/07-jupiter.png',
  saturn:'assets/space3d/user-final/08-saturn.png',
  uranus:'assets/space3d/user-final/09-uranus.png',
  neptune:'assets/space3d/user-final/10-neptune.png',
  phobos:'assets/space3d/user-final/11-phobos.png',
  deimos:'assets/space3d/user-final/12-deimos.png',
  io:'assets/space3d/user-final/13-io.png',
  europa:'assets/space3d/user-final/14-europa.png',
  ganymede:'assets/space3d/user-final/15-ganymede.png',
  callisto:'assets/space3d/user-final/16-callisto.png',
  titan:'assets/space3d/user-final/17-titan.png',
  enceladus:'assets/space3d/user-final/18-enceladus.png',
  titania:'assets/space3d/user-final/19-titania.png',
  oberon:'assets/space3d/user-final/20-oberon.png',
  triton:'assets/space3d/user-final/21-triton.png',
  charon:'assets/space3d/user-final/22-charon.png',
  pluto:'assets/space3d/user-final/23-pluto.png',
  ceres:'assets/space3d/user-final/24-ceres.png',
  haumea:'assets/space3d/user-final/25-haumea.png',
  makemake:'assets/space3d/user-final/26-makemake.png',
  eris:'assets/space3d/user-final/27-eris.png'
};
const finalUvCache=new Map();
const finalUvMiss=new Set();
const USER_UV_DB='areg-space-user-uv-v1';
const USER_UV_STORE='textures';
const userUvCache=new Map();
const userUvPending=new Map();

function touchUvTexture(id,t){
  if(finalUvCache.get(id)===t){
    finalUvCache.delete(id);
    finalUvCache.set(id,t);
  }
  if(userUvCache.get(id)===t){
    userUvCache.delete(id);
    userUvCache.set(id,t);
  }
}
function pruneUvTextureCaches(keepIds=new Set(),max=9){
  if(finalUvCache.size<=max)return;
  for(const id of [...finalUvCache.keys()]){
    if(finalUvCache.size<=max)break;
    if(keepIds.has(id))continue;
    const t=finalUvCache.get(id);
    finalUvCache.delete(id);
    if(userUvCache.get(id)===t)userUvCache.delete(id);
    try{t?.dispose?.()}catch{}
  }
}

function openUserUvDb(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){resolve(null);return}
    const q=indexedDB.open(USER_UV_DB,1);
    q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(USER_UV_STORE))q.result.createObjectStore(USER_UV_STORE,{keyPath:'id'})};
    q.onsuccess=()=>resolve(q.result);
    q.onerror=()=>reject(q.error);
  });
}
async function readUserUvBlob(id){
  const db=await openUserUvDb();if(!db)return null;
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(USER_UV_STORE,'readonly');
    const rq=tx.objectStore(USER_UV_STORE).get(id);
    rq.onsuccess=()=>resolve(rq.result?.blob||null);
    rq.onerror=()=>reject(rq.error);
  });
}
function exactUvTextureFromImage(img){
  const t=new THREE.Texture(img);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=THREE.RepeatWrapping;
  t.wrapT=THREE.ClampToEdgeWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.anisotropy=16;
  t.needsUpdate=true;
  return t;
}
async function prepareRepoUvTexture(item){
  if(finalUvCache.has(item.id)){
    const t=finalUvCache.get(item.id);
    touchUvTexture(item.id,t);
    return t;
  }

  const path=FINAL_UV_PATHS[item.id];
  if(!path||finalUvMiss.has(item.id))return null;
  try{
    const img=await loadTrue360Image(path+'?v=final27repo4');
    const t=exactUvTextureFromImage(img);
    finalUvCache.set(item.id,t);
    return t;
  }catch{
    finalUvMiss.add(item.id);
    return null;
  }
}
async function prepareUserUvTexture(item){
  if(!USER_UV_IDS.has(item.id))return null;
  if(userUvCache.has(item.id)){
    const t=userUvCache.get(item.id);
    touchUvTexture(item.id,t);
    return t;
  }
  if(userUvPending.has(item.id))return userUvPending.get(item.id);
  const pending=(async()=>{
    // Permanent repo assets are canonical. IndexedDB stays only as a
    // temporary fallback while a newly approved replacement has not yet been
    // committed to GitHub.
    const repoTex=await prepareRepoUvTexture(item);
    if(repoTex){
      userUvCache.set(item.id,repoTex);
      return repoTex;
    }
    const blob=await readUserUvBlob(item.id);
    if(!blob)return null;
    const url=URL.createObjectURL(blob);
    try{
      const img=await loadTrue360Image(url);
      const t=exactUvTextureFromImage(img);
      userUvCache.set(item.id,t);
      return t;
    }finally{URL.revokeObjectURL(url)}
  })().finally(()=>userUvPending.delete(item.id));
  userUvPending.set(item.id,pending);
  return pending;
}
const AXIAL_TILT={sun:7.25,mercury:.03,venus:177.4,earth:23.44,moon:6.68,mars:25.19,jupiter:3.13,saturn:26.73,uranus:97.77,neptune:28.32};
const DISPLAY_SCALE={sun:1.18,mercury:.70,venus:.88,earth:.90,moon:.70,mars:.78,jupiter:1.12,saturn:1.02,uranus:.92,neptune:.92};
const texLoader=new THREE.TextureLoader();
const texCache=new Map();
function getTexture(path,{srgb=true}={}){
  if(texCache.has(path))return texCache.get(path);
  const t=texLoader.load(path,undefined,undefined,()=>{
    if(path===TEXTURE_PATHS.moon){
      const fb=moonTexture();
      t.image=fb.image;t.needsUpdate=true;
    }
  });
  if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=THREE.RepeatWrapping;
  t.anisotropy=12;
  texCache.set(path,t);
  return t;
}
const TRUE360_IDS=new Set(['phobos','deimos','io','europa','ganymede']);
const true360Cache=new Map();
const true360Pending=new Map();

function loadTrue360Image(path){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.decoding='async';
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=path;
  });
}
function byte(v){return Math.max(0,Math.min(255,Math.round(v)))}
function mix(a,b,t){return a+(b-a)*t}
function true360LumaBounds(data){
  const hist=new Uint32Array(256);
  let total=0;
  for(let i=0;i<data.length;i+=16){
    const l=Math.max(0,Math.min(255,Math.round(.299*data[i]+.587*data[i+1]+.114*data[i+2])));
    hist[l]++;total++;
  }
  const loTarget=total*.03,hiTarget=total*.97;
  let acc=0,lo=0,hi=255;
  for(let i=0;i<256;i++){acc+=hist[i];if(acc>=loTarget){lo=i;break}}
  acc=0;
  for(let i=0;i<256;i++){acc+=hist[i];if(acc>=hiTarget){hi=i;break}}
  if(hi-lo<20){lo=Math.max(0,lo-10);hi=Math.min(255,hi+10)}
  return [lo,hi];
}
function true360Grade(id,data){
  // LOCKED: Io and Phobos stay byte-for-byte on their accepted grading path.
  if(id==='io'){
    for(let i=0;i<data.length;i+=4){
      let r=data[i],g=data[i+1],b=data[i+2];
      const l=.299*r+.587*g+.114*b;
      const sat=1.58;
      data[i]=byte((l+(r-l)*sat)*1.18+7);
      data[i+1]=byte((l+(g-l)*sat)*1.08+3);
      data[i+2]=byte((l+(b-l)*1.20)*.70);
    }
    return;
  }
  if(id==='phobos'){
    const p=[[45,31,27],[127,89,69],[235,199,166]];
    for(let i=0;i<data.length;i+=4){
      const l=(.299*data[i]+.587*data[i+1]+.114*data[i+2])/255;
      let p0,p1,t;
      if(l<.52){p0=p[0];p1=p[1];t=l/.52}else{p0=p[1];p1=p[2];t=(l-.52)/.48}
      data[i]=byte(mix(p0[0],p1[0],t));
      data[i+1]=byte(mix(p0[1],p1[1],t));
      data[i+2]=byte(mix(p0[2],p1[2],t));
    }
    return;
  }

  const [lo,hi]=true360LumaBounds(data);
  const span=Math.max(1,hi-lo);

  if(id==='deimos'){
    // Preserve crater detail from the complete 2:1 map; neutral brown-gray, not pink/white.
    const dark=[46,42,39],mid=[104,94,86],light=[178,160,145];
    for(let i=0;i<data.length;i+=4){
      const raw=.299*data[i]+.587*data[i+1]+.114*data[i+2];
      let n=Math.max(0,Math.min(1,(raw-lo)/span));
      n=Math.pow(n,.94);
      let p0,p1,t;
      if(n<.56){p0=dark;p1=mid;t=n/.56}else{p0=mid;p1=light;t=(n-.56)/.44}
      data[i]=byte(mix(p0[0],p1[0],t));
      data[i+1]=byte(mix(p0[1],p1[1],t));
      data[i+2]=byte(mix(p0[2],p1[2],t));
    }
    return;
  }

  if(id==='europa'){
    // Preserve the source map's real line network. Boost only existing warm chroma,
    // never repaint broad low-luma terrain as rust.
    for(let i=0;i<data.length;i+=4){
      let r=data[i],g=data[i+1],b=data[i+2];
      let l=.299*r+.587*g+.114*b;
      const c=1.16;
      r=byte((r-128)*c+128);
      g=byte((g-128)*c+128);
      b=byte((b-128)*c+128);
      l=.299*r+.587*g+.114*b;
      const sat=1.34;
      r=byte(l+(r-l)*sat);
      g=byte(l+(g-l)*sat);
      b=byte(l+(b-l)*sat);

      const warm=Math.max(0,Math.min(1,((r-b)-10)/70));
      if(warm>0){
        r=byte(r+22*warm);
        g=byte(g-8*warm);
        b=byte(b-18*warm);
      }else{
        // Keep the ice cool-neutral instead of pure white.
        r=byte(r*.985);
        g=byte(g*.995);
        b=byte(Math.min(255,b*1.015+2));
      }
      data[i]=r;data[i+1]=g;data[i+2]=b;
    }
    return;
  }

  if(id==='ganymede'){
    // Keep the real global mosaic colors/landmarks. Only mild contrast + warm-gray tone.
    for(let i=0;i<data.length;i+=4){
      let r=data[i],g=data[i+1],b=data[i+2];
      let l=.299*r+.587*g+.114*b;
      const c=1.20;
      r=byte((r-128)*c+128);
      g=byte((g-128)*c+128);
      b=byte((b-128)*c+128);
      l=.299*r+.587*g+.114*b;
      const sat=1.10;
      r=byte(l+(r-l)*sat+5);
      g=byte(l+(g-l)*sat);
      b=byte(l+(b-l)*sat-5);
      data[i]=r;data[i+1]=g;data[i+2]=b;
    }
    return;
  }
}

function sealTrue360Seam(data,W,H,band=18){
  band=Math.max(6,Math.min(band,Math.floor(W*.025)));
  for(let y=0;y<H;y++){
    for(let k=0;k<band;k++){
      const li=(y*W+k)*4,ri=(y*W+(W-1-k))*4;
      const edge=1-k/(band-1);
      for(let c=0;c<3;c++){
        const avg=(data[li+c]+data[ri+c])*.5;
        data[li+c]=byte(mix(data[li+c],avg,edge*.72));
        data[ri+c]=byte(mix(data[ri+c],avg,edge*.72));
      }
    }
  }
}
async function prepareTrue360Texture(item){
  const userTex=await prepareUserUvTexture(item);
  if(userTex)return userTex;
  if(!TRUE360_IDS.has(item.id))return null;
  if(true360Cache.has(item.id))return true360Cache.get(item.id);
  if(true360Pending.has(item.id))return true360Pending.get(item.id);
  const pending=(async()=>{
    const path=TEXTURE_PATHS[item.id];
    const img=await loadTrue360Image(path);
    const W=2048,H=1024;
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d',{alpha:false,willReadFrequently:true});
    x.drawImage(img,0,0,W,H);
    const im=x.getImageData(0,0,W,H);
    true360Grade(item.id,im.data);
    sealTrue360Seam(im.data,W,H,18);
    x.putImageData(im,0,0);

    const t=new THREE.CanvasTexture(c);
    t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=THREE.RepeatWrapping;
    t.wrapT=THREE.ClampToEdgeWrapping;
    t.minFilter=THREE.LinearMipmapLinearFilter;
    t.magFilter=THREE.LinearFilter;
    t.anisotropy=16;
    t.needsUpdate=true;
    true360Cache.set(item.id,t);
    true360Pending.delete(item.id);
    return t;
  })().catch(err=>{true360Pending.delete(item.id);throw err});
  true360Pending.set(item.id,pending);
  return pending;
}
function textureForItem(item){
  if(userUvCache.has(item.id))return userUvCache.get(item.id);
  if(TRUE360_IDS.has(item.id))return true360Cache.get(item.id)||canvasTexture(item);
  const path=TEXTURE_PATHS[item.id];
  return path?getTexture(path):canvasTexture(item);
}

function canvasTexture(item){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,256);g.addColorStop(0,item.c1||'#7397c8');g.addColorStop(1,item.c2||'#263a67');x.fillStyle=g;x.fillRect(0,0,512,256);
  for(let i=0;i<60;i++){x.fillStyle=`rgba(20,20,24,${rand(.03,.16)})`;x.beginPath();x.arc(rand(0,512),rand(0,256),rand(3,18),0,Math.PI*2);x.fill()}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.14,'rgba(255,235,170,.95)');g.addColorStop(.42,'rgba(110,160,255,.28)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
}
const GLOW=glowTexture();
function haloTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,42,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(.69,'rgba(255,255,255,0)');
  g.addColorStop(.76,'rgba(255,255,255,.20)');
  g.addColorStop(.83,'rgba(255,255,255,.95)');
  g.addColorStop(.91,'rgba(255,255,255,.30)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const HALO=haloTexture();

function softGreenHaloTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,42,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(.73,'rgba(255,255,255,0)');
  g.addColorStop(.78,'rgba(255,255,255,.05)');
  g.addColorStop(.84,'rgba(255,255,255,.54)');
  g.addColorStop(.91,'rgba(255,255,255,.16)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const GREEN_HALO=softGreenHaloTexture();
const FEEDBACK_HALO_SCALE=2.72;


let MOON_TEX=null;
function moonTexture(){
  if(MOON_TEX)return MOON_TEX;
  const c=document.createElement('canvas');c.width=2048;c.height=1024;
  const x=c.getContext('2d',{alpha:false});
  const r=(()=>{let s=0x4d4f4f4e;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}})();

  const bg=x.createLinearGradient(0,0,c.width,c.height);
  bg.addColorStop(0,'#8f8d89');bg.addColorStop(.48,'#c9c5bd');bg.addColorStop(1,'#777672');
  x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);

  for(let i=0;i<34;i++){
    const cx=r()*c.width,cy=r()*c.height,rad=70+r()*250;
    const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);
    const warm=r()>.62;
    g.addColorStop(0,warm?'rgba(105,101,94,.16)':'rgba(72,74,78,.18)');
    g.addColorStop(.58,warm?'rgba(130,125,116,.08)':'rgba(96,97,100,.08)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2);
  }

  for(let i=0;i<1050;i++){
    const cx=r()*c.width,cy=r()*c.height,rad=.7+r()*5.5;
    x.fillStyle=`rgba(65,65,66,${.025+r()*.07})`;
    x.beginPath();x.arc(cx,cy,rad,0,Math.PI*2);x.fill();
  }

  for(let i=0;i<145;i++){
    const cx=r()*c.width,cy=r()*c.height,rad=6+r()*42;
    const g=x.createRadialGradient(cx-rad*.18,cy-rad*.18,rad*.05,cx,cy,rad);
    g.addColorStop(0,'rgba(60,61,64,.62)');
    g.addColorStop(.48,'rgba(98,98,99,.30)');
    g.addColorStop(.70,'rgba(224,221,213,.34)');
    g.addColorStop(.84,'rgba(126,125,122,.15)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(cx-rad*1.2,cy-rad*1.2,rad*2.4,rad*2.4);
  }

  MOON_TEX=new THREE.CanvasTexture(c);
  MOON_TEX.colorSpace=THREE.SRGBColorSpace;
  MOON_TEX.wrapS=THREE.RepeatWrapping;
  MOON_TEX.minFilter=THREE.LinearMipmapLinearFilter;
  MOON_TEX.magFilter=THREE.LinearFilter;
  MOON_TEX.anisotropy=16;
  return MOON_TEX;
}

let SPACE_BACKDROP=null;
function spaceBackdropTexture(){
  if(SPACE_BACKDROP)return SPACE_BACKDROP;
  const c=document.createElement('canvas');c.width=4096;c.height=2048;
  const x=c.getContext('2d',{alpha:false});
  const r=(()=>{let s=0x53504143;return()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}})();

  const bg=x.createLinearGradient(0,0,0,c.height);
  bg.addColorStop(0,'#071126');bg.addColorStop(.45,'#020716');bg.addColorStop(1,'#01030b');
  x.fillStyle=bg;x.fillRect(0,0,c.width,c.height);

  const clouds=[
    [.18,.28,.25,'94,74,190',.13],
    [.64,.42,.34,'48,88,192',.14],
    [.82,.69,.28,'121,52,157',.10],
    [.42,.60,.22,'35,90,139',.09]
  ];
  clouds.forEach(([px,py,rr,col,a])=>{
    const cx=px*c.width,cy=py*c.height,rad=rr*c.width;
    const g=x.createRadialGradient(cx,cy,0,cx,cy,rad);
    g.addColorStop(0,`rgba(${col},${a})`);
    g.addColorStop(.42,`rgba(${col},${a*.45})`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2);
  });

  // Dense diagonal Milky Way band, drawn at 4K so it stays crisp on Retina screens.
  for(let i=0;i<9200;i++){
    const px=r()*c.width;
    const center=c.height*(.46+.08*Math.sin(px/c.width*Math.PI*2+.55));
    const u=Math.max(1e-6,r()),v=r();
    const gaussian=Math.sqrt(-2*Math.log(u))*Math.cos(Math.PI*2*v);
    const spread=105+r()*215;
    const py=center+gaussian*spread;
    if(py<0||py>c.height)continue;
    const d=Math.min(1,Math.abs(py-center)/520);
    const alpha=(1-d)*(.018+r()*.105);
    const size=r()<.965?(.35+r()*1.15):(1.4+r()*2.4);
    const cool=r()>.18;
    x.fillStyle=cool?`rgba(201,218,255,${alpha})`:`rgba(255,224,184,${alpha*.8})`;
    x.beginPath();x.arc(px,py,size,0,Math.PI*2);x.fill();
  }

  for(let i=0;i<6400;i++){
    const px=r()*c.width,py=r()*c.height;
    const bright=r();
    const size=bright>.995?2.2+r()*2.2:bright>.94?.9+r()*1.15:.35+r()*.65;
    const a=bright>.995?.95:.28+r()*.64;
    const warm=r()<.12;
    x.fillStyle=warm?`rgba(255,231,196,${a})`:`rgba(225,238,255,${a})`;
    x.fillRect(px,py,size,size);
    if(bright>.997){
      x.fillStyle=`rgba(230,240,255,${a*.28})`;
      x.fillRect(px-size*3,py+size*.35,size*7,.6);
      x.fillRect(px+size*.35,py-size*3,.6,size*7);
    }
  }

  SPACE_BACKDROP=new THREE.CanvasTexture(c);
  SPACE_BACKDROP.colorSpace=THREE.SRGBColorSpace;
  SPACE_BACKDROP.wrapS=THREE.RepeatWrapping;
  SPACE_BACKDROP.wrapT=THREE.ClampToEdgeWrapping;
  SPACE_BACKDROP.minFilter=THREE.LinearMipmapLinearFilter;
  SPACE_BACKDROP.magFilter=THREE.LinearFilter;
  SPACE_BACKDROP.anisotropy=16;
  return SPACE_BACKDROP;
}

let SHOOTING_TEX=null;
function shootingStarTexture(){
  if(SHOOTING_TEX)return SHOOTING_TEX;
  const c=document.createElement('canvas');c.width=512;c.height=48;
  const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,c.width,0);
  g.addColorStop(0,'rgba(255,255,255,0)');
  g.addColorStop(.55,'rgba(180,216,255,.05)');
  g.addColorStop(.86,'rgba(218,236,255,.48)');
  g.addColorStop(.965,'rgba(255,255,255,.95)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,20,c.width,8);
  const h=x.createRadialGradient(490,24,0,490,24,18);
  h.addColorStop(0,'rgba(255,255,255,1)');
  h.addColorStop(.25,'rgba(220,240,255,.85)');
  h.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=h;x.fillRect(470,4,42,40);
  SHOOTING_TEX=new THREE.CanvasTexture(c);
  SHOOTING_TEX.colorSpace=THREE.SRGBColorSpace;
  return SHOOTING_TEX;
}
function createShootingStars(scene){
  const mat=new THREE.SpriteMaterial({
    map:shootingStarTexture(),color:0xf3f8ff,transparent:true,opacity:0,
    depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending
  });
  mat.toneMapped=false;mat.rotation=-.36;
  const sp=new THREE.Sprite(mat);sp.visible=false;sp.scale.set(2.45,.23,1);scene.add(sp);
  let active=false,start=0,duration=1100,startY=3,nextAt=performance.now()+rand(2600,5200);
  return {
    update(t){
      if(!active&&t>=nextAt){
        active=true;start=t;duration=rand(850,1250);startY=rand(1.8,4.8);
        sp.position.set(-6.8,startY,rand(-8,-5));sp.visible=true;
      }
      if(!active)return;
      const q=(t-start)/duration;
      if(q>=1){
        active=false;sp.visible=false;mat.opacity=0;nextAt=t+rand(5200,10500);return;
      }
      sp.position.x=-6.8+13.8*q;
      sp.position.y=startY-3.1*q;
      mat.opacity=(q<.16?q/.16:(1-q))*0.78;
      const s=.9+.18*Math.sin(q*Math.PI);
      sp.scale.set(2.45*s,.23*s,1);
    },
    dispose(){scene.remove(sp);mat.dispose()}
  };
}
function starField(scene){
  const skyTex=spaceBackdropTexture();
  const skyMat=new THREE.MeshBasicMaterial({map:skyTex,side:THREE.BackSide,color:0xffffff,fog:false});
  skyMat.toneMapped=false;
  const sky=new THREE.Mesh(new THREE.SphereGeometry(34,64,40),skyMat);
  scene.add(sky);

  const count=1280,p=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2;
    const z=rand(-14,3);
    const radius=rand(8,20);
    p[i*3]=Math.cos(a)*radius;
    p[i*3+1]=rand(-11,11);
    p[i*3+2]=z;
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const ptsMat=new THREE.PointsMaterial({
    color:0xf2f7ff,size:.045,transparent:true,opacity:.92,depthWrite:false,
    blending:THREE.AdditiveBlending,sizeAttenuation:true
  });
  ptsMat.toneMapped=false;
  const pts=new THREE.Points(g,ptsMat);scene.add(pts);

  const bright=new THREE.Group();
  for(let i=0;i<38;i++){
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({
      map:GLOW,color:i%5===0?0xffefb0:0xbfd8ff,transparent:true,
      opacity:rand(.26,.62),depthWrite:false,blending:THREE.AdditiveBlending
    }));
    sp.position.set(rand(-10,10),rand(-7,7),rand(-13,-4));
    const sz=rand(.08,.22);sp.scale.set(sz,sz,1);bright.add(sp);
  }
  scene.add(bright);

  const nebulae=new THREE.Group();
  const nebulaSpecs=[
    [-5.8,2.8,-14,0x6a3fd9,.22,11,6.3],
    [5.4,-2.2,-13,0x205dff,.18,10,5.6],
    [1.2,4.5,-16,0xb53bd5,.13,13,6.5]
  ];
  nebulaSpecs.forEach(([x,y,z,color,opacity,sx,sy],i)=>{
    const mat=new THREE.SpriteMaterial({
      map:GLOW,color,transparent:true,opacity,depthWrite:false,
      blending:THREE.AdditiveBlending
    });
    mat.toneMapped=false;
    const sp=new THREE.Sprite(mat);
    sp.position.set(x,y,z);sp.scale.set(sx,sy,1);sp.material.rotation=i*.55;
    nebulae.add(sp);
  });
  scene.add(nebulae);
  const grp=new THREE.Group();grp.add(sky,pts,bright,nebulae);scene.add(grp);return grp;
}
function nebula(){return null}
function ringMesh(item,inner=1.22,outer=2.08){
  const back=new THREE.Group();
  const front=new THREE.Group();

  // After RingGeometry is rotated into the XZ plane:
  // theta 0..PI is the camera-facing half, PI..2PI is the far half.
  // We render them separately so the planet physically sits inside the ring.
  const FRONT_START=0;
  const FRONT_LEN=Math.PI;
  const BACK_START=Math.PI;
  const BACK_LEN=Math.PI;

  const radialUvs=(geo,a,b)=>{
    const pos=geo.attributes.position,uv=geo.attributes.uv;
    for(let i=0;i<pos.count;i++){
      const r=Math.hypot(pos.getX(i),pos.getY(i));
      uv.setXY(i,clamp((r-a)/(b-a),0,1),.5);
    }
  };
  const halfRing=(a,b,material,start,len)=>{
    const geo=new THREE.RingGeometry(a,b,192,1,start,len);
    radialUvs(geo,a,b);
    const m=new THREE.Mesh(geo,material);
    m.rotation.x=Math.PI/2;
    m.userData.ringSurface=true;
    return m;
  };
  const bandMaterial=(color,opacity)=>new THREE.MeshBasicMaterial({
    color,side:THREE.DoubleSide,transparent:true,opacity,
    depthWrite:false,depthTest:true,toneMapped:false
  });
  const addBand=(target,a,b,color,opacity,start,len,y=0)=>{
    const m=halfRing(a,b,bandMaterial(color,opacity),start,len);
    m.position.y=y;
    target.add(m);
    return m;
  };

  if(item.id==='saturn'){
    const ringTex=getTexture('assets/space3d/2k_saturn_ring_alpha.png');
    const makeSaturnMat=(opacity,color)=>new THREE.MeshBasicMaterial({
      alphaMap:ringTex,color,side:THREE.DoubleSide,
      transparent:true,opacity,alphaTest:.012,
      depthWrite:false,depthTest:true,toneMapped:false
    });

    const backMain=halfRing(inner,outer,makeSaturnMat(.94,0xffdfaa),BACK_START,BACK_LEN);
    const frontMain=halfRing(inner,outer,makeSaturnMat(1,0xffe8b8),FRONT_START,FRONT_LEN);
    back.add(backMain);
    front.add(frontMain);

    // Natural band accents, split into far/near halves.
    const bands=[
      [1.22,1.30,0xe7cf96,.30],
      [1.51,1.535,0x5c4f43,.46],
      [1.60,1.69,0xf2d99f,.34],
      [1.73,1.755,0x4d433a,.42],
      [1.82,1.92,0xd2bb8f,.28],
      [1.98,2.00,0xb9aa94,.38]
    ];
    bands.forEach(([a,b,color,opacity],i)=>{
      addBand(back,a,b,color,opacity*.82,BACK_START,BACK_LEN,(i+1)*.0008);
      addBand(front,a,b,color,opacity,FRONT_START,FRONT_LEN,(i+1)*.0008);
    });
  }else{
    // Uranus: narrow separated rings, also split into near/far halves.
    const bands=[
      [1.16,1.178,0xa9bfd1,.58],
      [1.245,1.262,0x71879d,.66],
      [1.33,1.348,0xc4d6e6,.74],
      [1.425,1.443,0x637a90,.62],
      [1.535,1.553,0xb2c7d9,.68],
      [1.655,1.675,0x72899f,.58]
    ];
    bands.forEach(([a,b,color,opacity],i)=>{
      addBand(back,a,b,color,opacity*.76,BACK_START,BACK_LEN,(i+1)*.0008);
      addBand(front,a,b,color,opacity,FRONT_START,FRONT_LEN,(i+1)*.0008);
    });

    // Keep the good icy debris, but split it into front/back populations.
    // This prevents stones from visually orbiting on the wrong side of Uranus.
    const rockGeo=new THREE.IcosahedronGeometry(.010,0);
    const rockMat=new THREE.MeshBasicMaterial({
      color:0xc9d4df,transparent:true,opacity:.90,
      depthWrite:false,depthTest:true,toneMapped:false
    });
    const ringRadii=[1.17,1.253,1.339,1.434,1.544,1.665];
    const buildRockHalf=(count,start,len)=>{
      const rocks=new THREE.InstancedMesh(rockGeo,rockMat,count);
      const dummy=new THREE.Object3D();
      for(let i=0;i<count;i++){
        const a=start+Math.random()*len;
        const rr=ringRadii[i%ringRadii.length]+rand(-.010,.010);
        dummy.position.set(Math.cos(a)*rr,rand(-.010,.010),Math.sin(a)*rr);
        const s=rand(.48,1.35);
        dummy.scale.setScalar(s);
        dummy.rotation.set(rand(0,Math.PI),rand(0,Math.PI),rand(0,Math.PI));
        dummy.updateMatrix();
        rocks.setMatrixAt(i,dummy.matrix);
      }
      rocks.instanceMatrix.needsUpdate=true;
      rocks.userData.ringRocks=true;
      return rocks;
    };
    const backRocks=buildRockHalf(60,BACK_START,BACK_LEN);
    const frontRocks=buildRockHalf(60,FRONT_START,FRONT_LEN);
    back.add(backRocks);
    front.add(frontRocks);
    back.userData.rocks=backRocks;
    front.userData.rocks=frontRocks;
  }

  back.userData.ringHalf='back';
  front.userData.ringHalf='front';
  return {back,front};
}
function atmosphereMesh(radius=1.035){
  const mat=new THREE.ShaderMaterial({
    transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{glow:{value:new THREE.Color(0x4b91ff)}},
    vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform vec3 glow;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-max(dot(vN,V),0.0),2.7);gl_FragColor=vec4(glow,rim*.34);}'
  });
  return new THREE.Mesh(new THREE.SphereGeometry(radius,64,40),mat);
}
function spherePlanet(item){
  const grp=new THREE.Group();grp.userData.item=item;grp.userData.pickable=true;
  const useOval=item.id==='haumea';
  let geo=useOval?new THREE.SphereGeometry(1,96,64):new THREE.SphereGeometry(1,72,48);
  if(useOval)geo.scale(1.28,.78,.88);

  if(item.id==='phobos'||item.id==='deimos'){
    geo=new THREE.SphereGeometry(1,96,64);
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      const strength=item.id==='phobos'?.030:.022;
      const n=1
        +Math.sin(x*5.3+y*3.1-z*2.7)*strength
        +Math.cos(y*6.0+z*4.4)*(strength*.62)
        +Math.sin(z*7.2-x*2.1)*(strength*.36);
      p.setXYZ(i,x*n,y*n,z*n);
    }
    p.needsUpdate=true;geo.computeVertexNormals();
    if(item.id==='phobos')geo.scale(1.13,.90,.96);
    else geo.scale(1.08,.94,.98);
  }

  const tex=textureForItem(item);
  const isSun=item.id==='sun';
  const hasUserUV=userUvCache.has(item.id);
  const isTrue360=TRUE360_IDS.has(item.id)&&!hasUserUV;
  const true360Lift={
    phobos:.14,deimos:.10,io:.14,europa:.025,ganymede:.035
  }[item.id]??0;
  const mat=hasUserUV
    ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff,toneMapped:false})
    : isSun
      ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff,toneMapped:false})
      : new THREE.MeshStandardMaterial({
        map:tex,color:0xffffff,
        roughness:item.id==='earth'?.82:(isTrue360?.95:.96),
        metalness:0,
        emissive:isTrue360?0xffffff:0x000000,
        emissiveMap:isTrue360?tex:null,
        emissiveIntensity:true360Lift
      });

  const mesh=new THREE.Mesh(geo,mat);
  if(hasUserUV)mesh.rotation.y=-Math.PI/2;
  mesh.userData.parentPick=grp;

  const isRinged=item.id==='saturn'||item.id==='uranus';
  let axisPivot=null;
  if(isRinged){
    axisPivot=new THREE.Group();
    // Match the real-reference presentation for both planets:
    // a moderately open ellipse, sloping up toward screen-right.
    // Uranus intentionally shares Saturn's visible tilt, while retaining
    // its own retrograde spin direction.
    axisPivot.rotation.set(
      THREE.MathUtils.degToRad(19),
      0,
      THREE.MathUtils.degToRad(-18)
    );
    grp.add(axisPivot);
    axisPivot.add(mesh);
    grp.userData.axisPivot=axisPivot;
  }else{
    const displayRoll=item.id==='haumea'?-31:(AXIAL_TILT[item.id]||0);
    mesh.rotation.z=THREE.MathUtils.degToRad(displayRoll);
    grp.add(mesh);
  }
  mesh.renderOrder=1;
  grp.userData.surface=mesh;
  if(item.id==='earth'&&!hasUserUV){
    const cloudTex=getTexture('assets/space3d/2k_earth_clouds.jpg');
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.014,72,48),new THREE.MeshStandardMaterial({
      color:0xffffff,alphaMap:cloudTex,transparent:true,opacity:.36,depthWrite:false,roughness:1,metalness:0
    }));
    clouds.rotation.z=mesh.rotation.z;clouds.userData.parentPick=grp;grp.add(clouds);grp.userData.clouds=clouds;
    const atm=atmosphereMesh(1.035);atm.rotation.z=mesh.rotation.z;grp.add(atm);
  }
  if(item.id==='saturn'||item.id==='uranus'){
    const r=item.id==='saturn'
      ? ringMesh(item,1.14,2.04)
      : ringMesh(item,1.14,1.70);
    const parent=axisPivot||grp;

    // Put the planet literally between the far and near ring halves.
    // Child order is explicit, and depth testing preserves the 3D wrap.
    parent.remove(mesh);
    parent.add(r.back);
    parent.add(mesh);
    parent.add(r.front);

    r.back.traverse(o=>{if(o.isMesh)o.userData.parentPick=grp});
    r.front.traverse(o=>{if(o.isMesh)o.userData.parentPick=grp});
    r.back.renderOrder=0;
    mesh.renderOrder=1;
    r.front.renderOrder=2;

    grp.userData.ringBack=r.back;
    grp.userData.ringFront=r.front;
  }
  if(item.id==='haumea'){
    // Haumea's ring is locked to the body's spin axis. Keeping it as a child
    // of the surface prevents the elongated body from visibly cutting through
    // a stationary ring while it rotates.
    const rg=new THREE.RingGeometry(1.34,1.48,192);
    const rm=new THREE.MeshBasicMaterial({
      color:0xc8c5bc,side:THREE.DoubleSide,transparent:true,opacity:.28,
      depthWrite:false,toneMapped:false
    });
    const hr=new THREE.Mesh(rg,rm);
    hr.rotation.x=Math.PI/2;
    hr.userData.parentPick=grp;
    mesh.add(hr);
    grp.userData.haumeaRing=hr;
  }
  if(isSun){
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffa42c,transparent:true,opacity:.62,depthWrite:false,blending:THREE.AdditiveBlending}));
    glow.scale.set(3.0,3.0,1);grp.add(glow);
  }
  grp.scale.setScalar(DISPLAY_SCALE[item.id]||.82);
  const retrograde=new Set(['venus','uranus','titania','oberon','triton','pluto']);
  if(item.id==='saturn')grp.userData.spin=.145;
  else if(item.id==='uranus')grp.userData.spin=-.145;
  else grp.userData.spin=(retrograde.has(item.id)?-1:1)*Math.abs(rand(.10,.22));
  return grp;
}
let _milkyWayTex=null,_blackHoleTex=null;

function makeMilkyWayTexture(){
  if(_milkyWayTex)return _milkyWayTex;
  const S=1024,canvas=document.createElement('canvas');canvas.width=S;canvas.height=S;
  const ctx=canvas.getContext('2d');
  let seed=0x6d696c6b;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};

  ctx.clearRect(0,0,S,S);
  ctx.save();
  ctx.translate(S/2,S/2);
  ctx.globalCompositeOperation='lighter';

  // Broad blue-violet stellar halo.
  const halo=ctx.createRadialGradient(0,0,20,0,0,455);
  halo.addColorStop(0,'rgba(255,225,188,.34)');
  halo.addColorStop(.13,'rgba(255,191,177,.24)');
  halo.addColorStop(.30,'rgba(191,157,255,.18)');
  halo.addColorStop(.58,'rgba(74,102,255,.09)');
  halo.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=halo;ctx.beginPath();ctx.arc(0,0,458,0,Math.PI*2);ctx.fill();

  // Dense cloudy spiral arms like the approved photographic reference.
  const gasColors=[
    [121,129,255],[120,166,255],[190,128,255],[86,126,255]
  ];
  for(let arm=0;arm<4;arm++){
    const col=gasColors[arm];

    // Wide nebular ribbons establish the arm mass.
    for(let layer=0;layer<3;layer++){
      ctx.beginPath();
      for(let j=0;j<=240;j++){
        const r=30+j*(405/240);
        const a=arm*Math.PI/2+r*.01335+(layer-1)*.045;
        const x=Math.cos(a)*r,y=Math.sin(a)*r*.78;
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.lineCap='round';ctx.lineJoin='round';
      ctx.lineWidth=[44,24,10][layer];
      ctx.strokeStyle=[
        `rgba(${col[0]},${col[1]},${col[2]},.050)`,
        `rgba(${Math.min(255,col[0]+35)},${Math.min(255,col[1]+35)},255,.080)`,
        'rgba(232,225,255,.12)'
      ][layer];
      ctx.stroke();
    }

    // Large soft knots make the arms read as continuous clouds instead of dots.
    for(let i=0;i<780;i++){
      const r=42+Math.pow(rnd(),.67)*390;
      const a=arm*Math.PI/2+r*.01335+(rnd()-.5)*.31;
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.78;
      const rad=5+rnd()*15*(1-r/520);
      const g=ctx.createRadialGradient(x,y,0,x,y,rad);
      g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},${.030+rnd()*.065})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.fill();
    }

    // Dense stellar material riding inside each cloudy arm.
    for(let i=0;i<3000;i++){
      const r=Math.pow(rnd(),.60)*438;
      const a=arm*Math.PI/2+r*.01335+(rnd()-.5)*(.34-r/1900);
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.78;
      const warm=rnd()>.82;
      const alpha=.055+rnd()*.22*(1-r/620);
      ctx.fillStyle=warm
        ?`rgba(255,222,196,${alpha})`
        :`rgba(178,196,255,${alpha})`;
      const s=.45+rnd()*2.3*(1-r/570);
      ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
    }
  }

  // Strong white-gold-pink central bulge, matching the reference's bright core.
  const coreGlow=ctx.createRadialGradient(0,0,0,0,0,190);
  coreGlow.addColorStop(0,'rgba(255,255,238,1)');
  coreGlow.addColorStop(.08,'rgba(255,245,207,.94)');
  coreGlow.addColorStop(.23,'rgba(255,199,169,.72)');
  coreGlow.addColorStop(.46,'rgba(228,151,255,.34)');
  coreGlow.addColorStop(.72,'rgba(117,116,255,.12)');
  coreGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=coreGlow;ctx.beginPath();ctx.arc(0,0,194,0,Math.PI*2);ctx.fill();

  for(let i=0;i<2900;i++){
    const r=Math.pow(rnd(),2.35)*174,a=rnd()*Math.PI*2;
    const x=Math.cos(a)*r,y=Math.sin(a)*r*.70;
    const t=r/174;
    const rr=Math.round(255-16*t),gg=Math.round(239-54*t),bb=Math.round(206+39*t);
    ctx.fillStyle=`rgba(${rr},${gg},${bb},${.10+rnd()*.34})`;
    const s=.65+rnd()*3.3;
    ctx.beginPath();ctx.arc(x,y,s,0,Math.PI*2);ctx.fill();
  }

  // Dark, broken dust lanes give the dense spiral depth.
  ctx.globalCompositeOperation='destination-out';
  for(let arm=0;arm<4;arm++){
    for(let i=0;i<760;i++){
      const r=72+Math.pow(rnd(),.76)*355;
      const a=arm*Math.PI/2+r*.01335+.20+(rnd()-.5)*.11;
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.78;
      ctx.fillStyle=`rgba(0,0,0,${.035+rnd()*.09})`;
      ctx.beginPath();ctx.arc(x,y,1.8+rnd()*5.4,0,Math.PI*2);ctx.fill();
    }
  }

  // Restore a razor-bright nucleus after cutting the dust lanes.
  ctx.globalCompositeOperation='lighter';
  const nucleus=ctx.createRadialGradient(0,0,0,0,0,82);
  nucleus.addColorStop(0,'rgba(255,255,247,1)');
  nucleus.addColorStop(.18,'rgba(255,246,207,.96)');
  nucleus.addColorStop(.48,'rgba(255,195,171,.56)');
  nucleus.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=nucleus;ctx.beginPath();ctx.arc(0,0,84,0,Math.PI*2);ctx.fill();

  for(let i=0;i<1300;i++){
    const r=Math.pow(rnd(),.56)*445,a=rnd()*Math.PI*2;
    const x=Math.cos(a)*r,y=Math.sin(a)*r*.79;
    const blue=rnd()>.52;
    ctx.fillStyle=blue
      ?`rgba(177,205,255,${.18+rnd()*.48})`
      :`rgba(255,231,207,${.16+rnd()*.42})`;
    const s=.35+rnd()*1.75;
    ctx.fillRect(x-s/2,y-s/2,s,s);
  }

  ctx.restore();
  const tex=new THREE.CanvasTexture(canvas);
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.minFilter=THREE.LinearMipmapLinearFilter;
  tex.magFilter=THREE.LinearFilter;
  tex.anisotropy=8;
  _milkyWayTex=tex;
  return tex;
}

function makeBlackHoleTexture(){
  if(_blackHoleTex)return _blackHoleTex;
  const canvas=renderInterstellarBlackHole();
  const tex=new THREE.CanvasTexture(canvas);
  canvas.addEventListener('areg-blackhole-ready',()=>{tex.needsUpdate=true;},{once:true});
  tex.colorSpace=THREE.SRGBColorSpace;
  tex.minFilter=THREE.LinearMipmapLinearFilter;
  tex.magFilter=THREE.LinearFilter;
  tex.anisotropy=8;
  _blackHoleTex=tex;
  return tex;
}

function blackHole(item){
  const g=new THREE.Group();
  g.userData.item=item;g.userData.pickable=true;

  // The reference image already contains the desired steep disk perspective.
  // No 3D rotation or silhouette spin: preserve its exact orientation.
  g.userData.spin=0;g.userData.spinAxis='z';
  g.rotation.set(0,0,0);

  const visual=new THREE.Group();g.add(visual);g.userData.surface=visual;

  const plate=new THREE.Mesh(
    new THREE.PlaneGeometry(4.64,2.61),
    new THREE.MeshBasicMaterial({
      map:makeBlackHoleTexture(),transparent:true,depthWrite:false,
      depthTest:true,toneMapped:false,side:THREE.DoubleSide
    })
  );
  plate.userData.parentPick=g;visual.add(plate);

  // A separate translucent GPU layer moves warm light along the already
  // approved accretion paths. The V216 photo and dark center never move.
  const gasFlow=new THREE.Mesh(
    new THREE.PlaneGeometry(4.64,2.61),
    makeBlackHoleFlowMaterial(THREE,plate.material.map)
  );
  gasFlow.position.z=.003;
  gasFlow.userData.parentPick=g;
  visual.add(gasFlow);
  g.userData.blackHoleFlow=gasFlow;

  const hit=new THREE.Mesh(
    new THREE.SphereGeometry(1.72,24,16),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
  );
  hit.userData.parentPick=g;visual.add(hit);
  return g;
}

function galaxy(item){
  const g=new THREE.Group();
  g.userData.item=item;g.userData.pickable=true;
  g.userData.spin=.026;g.userData.spinAxis='z';

  // Slightly more face-on than before so the dense luminous spiral is readable,
  // while still retaining the reference's 3D diagonal presentation.
  g.rotation.set(
    THREE.MathUtils.degToRad(44),
    THREE.MathUtils.degToRad(6),
    THREE.MathUtils.degToRad(-20)
  );

  const visual=new THREE.Group();g.add(visual);g.userData.surface=visual;

  const disk=new THREE.Mesh(
    new THREE.PlaneGeometry(4.05,3.35),
    new THREE.MeshBasicMaterial({
      map:makeMilkyWayTexture(),transparent:true,opacity:1,
      depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,
      toneMapped:false,side:THREE.DoubleSide
    })
  );
  disk.userData.parentPick=g;visual.add(disk);

  // A denser shallow 3D stellar layer adds volume without destroying the
  // photographic spiral texture.
  const N=980,p=new Float32Array(N*3),col=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const r=Math.pow(Math.random(),.62)*1.82,a=Math.random()*Math.PI*2;
    p[i*3]=Math.cos(a)*r;
    p[i*3+1]=Math.sin(a)*r*.78;
    p[i*3+2]=rand(-.15,.15)*(1-r*.29);
    const warm=Math.random()>.76;
    col[i*3]=warm?1:.60;col[i*3+1]=warm?.85:.72;col[i*3+2]=warm?.66:1;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(p,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const stars=new THREE.Points(geo,new THREE.PointsMaterial({
    vertexColors:true,size:.029,transparent:true,opacity:.82,
    blending:THREE.AdditiveBlending,depthWrite:false
  }));
  stars.userData.parentPick=g;visual.add(stars);

  const hit=new THREE.Mesh(
    new THREE.SphereGeometry(1.82,24,16),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false})
  );
  hit.userData.parentPick=g;visual.add(hit);
  return g;
}
function solarSystem(item){
  const g=new THREE.Group();g.userData.item=item;g.userData.pickable=true;g.userData.spin=.055;g.userData.spinAxis='z';
  g.rotation.set(THREE.MathUtils.degToRad(59),THREE.MathUtils.degToRad(-6),THREE.MathUtils.degToRad(19));
  const visual=new THREE.Group();g.add(visual);g.userData.surface=visual;

  const sun=new THREE.Mesh(
    new THREE.SphereGeometry(.34,40,28),
    new THREE.MeshStandardMaterial({color:0xffd96a,emissive:0xff8a15,emissiveIntensity:1.9,roughness:.72})
  );
  sun.userData.parentPick=g;visual.add(sun);

  const radii=[.58,.80,1.03,1.28,1.52];
  const colors=[0xb6a397,0xe1b071,0x4a91df,0xd96f4d,0xe2c7a2];
  radii.forEach((r,i)=>{
    const curve=new THREE.EllipseCurve(0,0,r,r,0,Math.PI*2);
    const pts=curve.getPoints(112).map(v=>new THREE.Vector3(v.x,v.y,0));
    const line=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({color:0x88a6e5,transparent:true,opacity:.26})
    );
    visual.add(line);
    const a=[.55,1.6,2.75,4.0,5.15][i];
    const p=new THREE.Mesh(
      new THREE.SphereGeometry(.075+i*.012,22,16),
      new THREE.MeshStandardMaterial({color:colors[i],roughness:.92,metalness:0})
    );
    p.position.set(Math.cos(a)*r,Math.sin(a)*r,0);
    p.userData.parentPick=g;visual.add(p);
  });

  const hit=new THREE.Mesh(new THREE.SphereGeometry(1.58,24,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  hit.userData.parentPick=g;visual.add(hit);
  return g;
}
function buildObject(item){
  if(item.id==='black-hole')return blackHole(item);
  if(item.id==='milky-way')return galaxy(item);
  if(item.id==='solar-system')return solarSystem(item);
  return spherePlanet(item);
}
function disposeObject(o){
  o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(m=>m.dispose?.())}});
}
function rendererFor(host){
  const r=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio||1,1.9));r.outputColorSpace=THREE.SRGBColorSpace;
  r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.08;r.shadowMap.enabled=false;
  r.domElement.className='s3d-canvas';host.appendChild(r.domElement);return r;
}
function resize(renderer,camera,host){
  const w=Math.max(2,host.clientWidth),h=Math.max(2,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
function createHud(root,title){
  const hud=document.createElement('div');hud.className='s3d-hud';
  hud.innerHTML=`<div class="s3d-prompt"><small>${title}</small><strong>Պատրաստվիր</strong></div><div class="s3d-score">✦ <b>0</b></div>`;
  root.appendChild(hud);return {prompt:hud.querySelector('strong'),score:hud.querySelector('b')};
}
function searchSlots(root,camera){
  const aspect=Math.max(.38,Math.min(1.15,root.clientWidth/Math.max(1,root.clientHeight)));
  // Portrait phones get a tight centered triangle. Nothing can live near screen edges.
  if(aspect<.72){
    return [
      new THREE.Vector3(0,1.22,.05),
      new THREE.Vector3(-.88,-1.18,.14),
      new THREE.Vector3(.88,-1.18,.02)
    ];
  }
  return [
    new THREE.Vector3(-1.55,.15,.05),
    new THREE.Vector3(0,.15,.14),
    new THREE.Vector3(1.55,.15,.02)
  ];
}
function fitSearchObject(g,item,portrait){
  // Large planar/special objects need more breathing room than spherical bodies.
  const specialPortrait={
    'black-hole':.50,
    'milky-way':.53,
    'solar-system':.48
  };
  const specialWide={
    'black-hole':.68,
    'milky-way':.72,
    'solar-system':.66
  };
  const factor=portrait
    ? (specialPortrait[item.id]??(item.id==='saturn'?.54:item.id==='uranus'?.64:item.id==='sun'?.67:item.id==='jupiter'?.68:.76))
    : (specialWide[item.id]??(item.id==='saturn'?.72:item.id==='uranus'?.78:.86));
  g.scale.multiplyScalar(factor);
}
function findObjectName(item){
  return ({
    sun:'Արեգակը',
    mercury:'Մերկուրին',
    venus:'Վեներան',
    earth:'Երկիրը',
    moon:'Լուսինը',
    mars:'Մարսը',
    jupiter:'Յուպիտերը',
    saturn:'Սատուրնը',
    uranus:'Ուրանը',
    neptune:'Նեպտունը',
    phobos:'Ֆոբոսը',deimos:'Դեյմոսը',io:'Իոն',europa:'Եվրոպան',ganymede:'Գանիմեդը',
    callisto:'Կալիստոն',titan:'Տիտանը',enceladus:'Էնցելադուսը',titania:'Տիտանիան',oberon:'Օբերոնը',triton:'Տրիտոնը',
    charon:'Խարոնը',pluto:'Պլուտոնը',ceres:'Ցերերան',haumea:'Հաումեան',makemake:'Մակեմակեն',eris:'Էրիսը'
  })[item.id]||item.name;
}
function easeInOutCubic(q){
  q=clamp(q,0,1);return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;
}
function easeOutCubic(q){q=clamp(q,0,1);return 1-Math.pow(1-q,3)}
function feedbackScaleMultiplier(g,camera,root){
  // Use the final win camera position so the object can fill the screen closely without clipping.
  const targetZ=1.62,finalCameraZ=8.48;
  const distance=Math.max(1,finalCameraZ-targetZ);
  const halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5))*distance;
  const halfW=halfH*Math.max(.38,root.clientWidth/Math.max(1,root.clientHeight));
  const safeRadius=Math.min(halfW*.91,halfH*.66);
  const baseRadius=Math.max(.01,g.userData.baseRadius||1);
  return clamp(safeRadius/baseRadius,1.38,3.65);
}
function setObjectOpacity(g,alpha){
  alpha=clamp(alpha,0,1);g.userData.displayOpacity=alpha;
  g.traverse(o=>{
    if(!o.material)return;
    const mats=Array.isArray(o.material)?o.material:[o.material];
    mats.forEach(m=>{
      if(m.isShaderMaterial){
        if(m.userData?.isBlackHoleFlow&&m.uniforms?.uOpacity)
          m.uniforms.uOpacity.value=alpha;
        return;
      }
      if(!m.userData.__s3dFadeInit){
        m.userData.__s3dFadeInit=true;
        m.userData.__s3dBaseOpacity=Number.isFinite(m.opacity)?m.opacity:1;
        m.userData.__s3dBaseTransparent=!!m.transparent;
        m.userData.__s3dBaseDepthWrite=m.depthWrite!==false;
      }
      m.opacity=m.userData.__s3dBaseOpacity*alpha;
      const fading=alpha<.999;
      if(m.transparent!==(fading?true:m.userData.__s3dBaseTransparent)){
        m.transparent=fading?true:m.userData.__s3dBaseTransparent;m.needsUpdate=true;
      }
      m.depthWrite=fading?false:m.userData.__s3dBaseDepthWrite;
    });
  });
  g.visible=alpha>.006;
}
function disposeFeedbackFx(g,key){
  const fx=g?.userData?.[key];if(!fx)return;
  g.remove(fx);
  fx.traverse(x=>{x.geometry?.dispose?.();if(x.material){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(m=>m.dispose?.())}});
  g.userData[key]=null;
}
function makePlanetWrongFx(g){
  disposeFeedbackFx(g,'wrongFx');
  const fx=new THREE.Group();
  const mat=new THREE.SpriteMaterial({
    map:HALO,color:0xff4054,transparent:true,opacity:0,depthWrite:false,depthTest:false,
    blending:THREE.AdditiveBlending
  });
  mat.toneMapped=false;
  const glow=new THREE.Sprite(mat);
  glow.scale.set(FEEDBACK_HALO_SCALE,FEEDBACK_HALO_SCALE,1);
  glow.renderOrder=80;fx.add(glow);
  fx.userData.glow=glow;fx.userData.glowMat=mat;
  g.add(fx);g.userData.wrongFx=fx;return fx;
}
function makePlanetWinFx(g,item){
  disposeFeedbackFx(g,'winFx');
  const fx=new THREE.Group();
  const mat=new THREE.SpriteMaterial({
    map:GREEN_HALO,color:0x4df37b,transparent:true,opacity:0,depthWrite:false,depthTest:false,
    blending:THREE.AdditiveBlending
  });
  mat.toneMapped=false;
  const glow=new THREE.Sprite(mat);
  glow.scale.set(FEEDBACK_HALO_SCALE,FEEDBACK_HALO_SCALE,1);
  glow.renderOrder=79;fx.add(glow);
  fx.userData.glow=glow;fx.userData.glowMat=mat;
  g.add(fx);g.userData.winFx=fx;return fx;
}
function gameSpaceSearch(ctx){
  ctx.activityContent.innerHTML='';ctx.menuMusic.pause();
  const root=document.createElement('div');root.className='s3d-root';ctx.activityContent.appendChild(root);
  const hud=createHud(root,'ՏԻԵԶԵՐԱԿԱՆ ՈՐՈՆՈՒՄ');
  const renderer=rendererFor(root),scene=new THREE.Scene();scene.background=new THREE.Color(0x07142f);
  const camera=new THREE.PerspectiveCamera(47,1,.1,80);camera.position.set(0,.10,9.25);
  scene.add(new THREE.HemisphereLight(0xb8d1ff,0x11172c,.90));
  scene.add(new THREE.AmbientLight(0x6176a6,.48));
  const key=new THREE.DirectionalLight(0xffffff,3.45);key.position.set(-4.5,5.5,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc5d9ff,1.80);fill.position.set(4.8,1.8,6.5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0x7486ff,.82);rim.position.set(5,-2,2);scene.add(rim);
  const stars=starField(scene),shooting=createShootingStars(scene);
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),pickables=[];
  const pool=ctx.PLANETS.filter(x=>REALISTIC_IDS.has(x.id));
  const next=bag(pool);

  let groups=[],target=null,score=0,locked=true,disposed=false,last=performance.now();
  let wrong=null,winStart=0,winGroup=null,transition=null,timer=0,recent=[];

  function decoys(t){
    let p=shuffle(pool.filter(x=>x.id!==t.id&&!recent.includes(x.id)));
    if(p.length<2)p=shuffle(pool.filter(x=>x.id!==t.id));
    return p.slice(0,2);
  }
  function clear(){
    groups.forEach(g=>{scene.remove(g);disposeObject(g)});
    groups=[];pickables.length=0;wrong=null;winGroup=null;
  }
  let roundSeq=0;
  async function buildRound(){
    const seq=++roundSeq;
    clear();locked=true;winStart=0;root.classList.remove('s3d-win');
    target=next();
    const opts=shuffle([target,...decoys(target)]);
    const slots=shuffle(searchSlots(root,camera));
    const portrait=(root.clientWidth/Math.max(1,root.clientHeight))<.72;
    recent=[...new Set(opts.map(x=>x.id).concat(recent))].slice(0,7);
    hud.prompt.textContent='Գտի՛ր՝ '+findObjectName(target);
    try{
      await Promise.all(opts.map(prepareTrue360Texture));
      // Keep only a few recent high-resolution planet maps resident.
      // This prevents long Space Search sessions from accumulating every
      // 2:1 map in GPU/image memory on iPhone.
      pruneUvTextureCaches(new Set(opts.map(x=>x.id)),9);
    }catch{
      if(disposed||seq!==roundSeq)return;
      setTimeout(()=>{if(!disposed&&seq===roundSeq)buildRound()},500);
      return;
    }
    if(disposed||seq!==roundSeq)return;

    const built=opts.map(it=>buildObject(it));
    if(disposed){built.forEach(disposeObject);return}

    const now=performance.now();
    built.forEach((g,i)=>{
      fitSearchObject(g,opts[i],portrait);
      g.userData.baseScale=g.scale.clone();
      g.userData.basePosition=slots[i].clone();
      g.position.copy(slots[i]);
      scene.add(g);g.updateMatrixWorld(true);
      const box=new THREE.Box3().setFromObject(g),sphere=new THREE.Sphere();box.getBoundingSphere(sphere);
      g.userData.baseRadius=Math.max(.01,sphere.radius);

      g.userData.enterFromPos=slots[i].clone().add(new THREE.Vector3(
        slots[i].x===0?0:Math.sign(slots[i].x)*.22,
        slots[i].y>0?.16:-.12,
        -.92
      ));
      g.userData.enterFromScale=g.userData.baseScale.clone().multiplyScalar(.64);
      g.position.copy(g.userData.enterFromPos);g.scale.copy(g.userData.enterFromScale);
      setObjectOpacity(g,0);
      groups.push(g);
      g.traverse(x=>{if(x.isMesh||x.isPoints)pickables.push(x)});
    });
    transition={type:'enter',start:now,duration:780,voiceDone:false};
  }
  function beginExit(){
    if(disposed||transition?.type==='exit')return;
    locked=true;root.classList.remove('s3d-win');winStart=0;
    if(wrong?.g)disposeFeedbackFx(wrong.g,'wrongFx');wrong=null;
    const now=performance.now();
    groups.forEach((g,i)=>{
      g.userData.exitFromPos=g.position.clone();
      g.userData.exitFromScale=g.scale.clone();
      g.userData.exitFromOpacity=g.userData.displayOpacity??1;
      const dir=Math.sign(g.position.x||((i-1)||1));
      g.userData.exitToPos=g.position.clone().add(new THREE.Vector3(dir*.42,(i-1)*.05,-1.15));
      g.userData.exitToScale=g.scale.clone().multiplyScalar(.68);
    });
    transition={type:'exit',start:now,duration:690};
  }
  function pointer(e){
    if(locked||transition)return;
    const r=renderer.domElement.getBoundingClientRect();
    mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;
    ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObjects(pickables,false)[0];if(!hit)return;
    let g=hit.object.userData.parentPick||hit.object.parent;
    while(g&&!g.userData?.pickable)g=g.parent;if(!g)return;

    if(g.userData.item.id!==target.id){
      answerSfx(false,ctx);
      if(wrong?.g)disposeFeedbackFx(wrong.g,'wrongFx');
      wrong={g,start:performance.now(),origin:g.position.clone(),fx:makePlanetWrongFx(g)};
      return;
    }

    locked=true;winStart=performance.now();winGroup=g;score++;
    hud.score.textContent=String(score);hud.prompt.textContent='Ճիշտ է՝ '+g.userData.item.name;
    answerSfx(true,ctx);
    setTimeout(()=>{if(!disposed)voice(g.userData.item.name,ctx)},430);
    if(score%5===0)reward(root,ctx);

    groups.forEach((x,i)=>{
      x.userData.win=x===g;
      x.userData.winFromPosition=x.position.clone();
      x.userData.winFromScale=x.scale.clone();
      x.userData.winFromOpacity=x.userData.displayOpacity??1;
      if(x===g){
        x.userData.winToPosition=new THREE.Vector3(0,.06,1.62);
        x.userData.winTargetScale=x.userData.baseScale.clone().multiplyScalar(feedbackScaleMultiplier(x,camera,root));
      }else{
        const dir=Math.sign(x.position.x||((i-1)||1));
        x.userData.winToPosition=x.position.clone().add(new THREE.Vector3(dir*.48,0,-.78));
        x.userData.winTargetScale=x.userData.baseScale.clone().multiplyScalar(.72);
      }
    });
    makePlanetWinFx(g,g.userData.item);
    root.classList.remove('s3d-win');void root.offsetWidth;root.classList.add('s3d-win');
    clearTimeout(timer);timer=setTimeout(beginExit,1850);
  }

  renderer.domElement.addEventListener('pointerup',pointer);

  function loop(t){
    if(disposed)return;
    const dt=Math.min(.04,(t-last)/1000);last=t;stars.rotation.y+=dt*.0015;
    camera.position.x=Math.sin(t*.00018)*.035;
    camera.position.y=.10+Math.cos(t*.00016)*.025;
    camera.position.z+=((winStart?8.48:9.25)-camera.position.z)*.042;
    camera.lookAt(0,-.08,0);

    let finishEnter=false,finishExit=false;

    groups.forEach((g,i)=>{
      if(g.userData.surface){
        const spinDelta=dt*(g.userData.spin??.18)*(g.userData.win?2.15:1);
        if(g.userData.spinAxis==='z')g.userData.surface.rotation.z+=spinDelta;
        else g.userData.surface.rotation.y+=spinDelta;
      }
      if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*.07;
      // Animate the lensing and accretion glints, NOT the whole black hole.
      if(g.userData.blackHoleFlow){
        const u=g.userData.blackHoleFlow.material.uniforms;
        u.uTime.value=(u.uTime.value+dt)%10000;
      }
      if(g.userData.accretionFlow){
        const flow=g.userData.accretionFlow;
        const meta=flow.userData.flowMeta||[];
        const attr=flow.geometry?.attributes?.position;
        flow.userData.flowTime=(flow.userData.flowTime||0)+dt;
        const tt=flow.userData.flowTime;
        const ang=.14,ca=Math.cos(ang),sa=Math.sin(ang);
        if(attr){
          for(let k=0;k<meta.length;k++){
            const m=meta[k],a=m.phase+tt*m.speed;
            const ex=Math.cos(a)*m.radius;
            const ey=Math.sin(a)*m.radius*m.flatten;
            // same fixed accretion-disk slant as the reference texture
            const x=ex*ca-ey*sa;
            const y=ex*sa+ey*ca+.06;
            attr.setXYZ(k,x,y,m.z);
          }
          attr.needsUpdate=true;
        }
      }

      if(wrong?.g===g){
        const q=(t-wrong.start)/620;
        if(q<1){
          const e=easeOutCubic(q);
          g.position.x=wrong.origin.x+Math.sin(q*Math.PI*4.5)*(1-e)*.13;
          const fx=wrong.fx;
          if(fx?.userData?.glowMat){
            const pulse=Math.max(0,Math.sin(Math.PI*q));
            fx.userData.glowMat.opacity=.42*pulse;
            const s=FEEDBACK_HALO_SCALE*(1+.012*pulse);
            fx.userData.glow.scale.set(s,s,1);
          }
        }else{
          g.position.copy(wrong.origin);disposeFeedbackFx(g,'wrongFx');wrong=null;
        }
      }

      if(transition?.type==='enter'){
        const stagger=i*65;
        const q=clamp((t-transition.start-stagger)/(transition.duration-stagger),0,1);
        const e=easeOutCubic(q);
        g.position.lerpVectors(g.userData.enterFromPos,g.userData.basePosition,e);
        g.scale.lerpVectors(g.userData.enterFromScale,g.userData.baseScale,e);
        setObjectOpacity(g,e);
        if(i===groups.length-1&&q>=1)finishEnter=true;
      }else if(transition?.type==='exit'){
        const q=clamp((t-transition.start)/transition.duration,0,1);
        const e=easeInOutCubic(q);
        g.position.lerpVectors(g.userData.exitFromPos,g.userData.exitToPos,e);
        g.scale.lerpVectors(g.userData.exitFromScale,g.userData.exitToScale,e);
        setObjectOpacity(g,g.userData.exitFromOpacity*(1-e));
        if(i===groups.length-1&&q>=1)finishExit=true;
      }else if(winStart){
        const q=clamp((t-winStart)/860,0,1),e=easeOutCubic(q);
        g.position.lerpVectors(g.userData.winFromPosition,g.userData.winToPosition,e);
        g.scale.lerpVectors(g.userData.winFromScale,g.userData.winTargetScale,e);
        if(g.userData.win){
          const fx=g.userData.winFx;
          if(fx?.userData?.glowMat){
            const q=clamp((t-winStart)/900,0,1);
            const flash=q<1?Math.sin(Math.PI*q):0;
            fx.userData.glowMat.opacity=.27*flash;
            const s=FEEDBACK_HALO_SCALE*(1+.010*flash);
            fx.userData.glow.scale.set(s,s,1);
          }
        }else{
          setObjectOpacity(g,1-e*.68);
        }
      }
    });

    if(transition?.type==='enter'){
      if(!transition.voiceDone&&t-transition.start>210){
        transition.voiceDone=true;voice('Գտի՛ր '+findObjectName(target),ctx);
      }
      if(finishEnter){
        groups.forEach(g=>{g.position.copy(g.userData.basePosition);g.scale.copy(g.userData.baseScale);setObjectOpacity(g,1)});
        transition=null;locked=false;
      }
    }else if(transition?.type==='exit'&&finishExit){
      transition=null;buildRound();
    }

    shooting.update(t);
    resize(renderer,camera,root);renderer.render(scene,camera);requestAnimationFrame(loop);
  }

  buildRound();requestAnimationFrame(loop);
  ctx.gameCleanup.push(()=>{
    disposed=true;roundSeq++;clearTimeout(timer);try{speechSynthesis.cancel()}catch{};
    renderer.domElement.removeEventListener('pointerup',pointer);shooting.dispose();clear();
    renderer.dispose();renderer.forceContextLoss?.();
    if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
  });
}
function seedFrom(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function prng(seed){return()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function constellationPoints(item,index){
  const r=prng(seedFrom(item.id)),n=5+(index%4),pts=[];let x=-2.5+r()*.5,y=-1+r()*2;
  for(let i=0;i<n;i++){x+=.65+r()*.65;y=clamp(y+(r()-.5)*1.55,-2.2,2.2);pts.push(new THREE.Vector3(x-((n-1)*.55),y,(r()-.5)*1.45))}
  if(index%3===0&&pts.length>6){pts[pts.length-1].y-=1;pts[pts.length-2].y+=.7}
  return pts;
}
function cylinderBetween(a,b,mat){
  const d=a.distanceTo(b),geo=new THREE.CylinderGeometry(.032,.032,d,10);const m=new THREE.Mesh(geo,mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
}
function gameConstellationQuest(ctx){
  ctx.activityContent.innerHTML='';ctx.menuMusic.pause();
  const root=document.createElement('div');root.className='s3d-root s3d-constellation';ctx.activityContent.appendChild(root);
  const hud=createHud(root,'ՎԱՌԻՐ ՀԱՄԱՍՏԵՂՈՒԹՅՈՒՆԸ');
  const renderer=rendererFor(root),scene=new THREE.Scene();scene.background=new THREE.Color(0x020617);scene.fog=new THREE.FogExp2(0x05071a,.026);
  const camera=new THREE.PerspectiveCamera(48,1,.1,60);camera.position.set(0,0,8.2);
  scene.add(new THREE.AmbientLight(0x8cb6ff,1.15));const light=new THREE.PointLight(0x728cff,15,25);light.position.set(0,1,5);scene.add(light);
  const stars=starField(scene,620);nebula(scene);
  const next=bag(ctx.CONSTELLATIONS),ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let item=null,points=[],nodes=[],hits=[],lines=[],idx=0,done=0,disposed=false,timer=0,last=performance.now(),completeAt=0;
  const litMat=new THREE.MeshStandardMaterial({color:0xfff0a1,emissive:0xffd85b,emissiveIntensity:2.2,roughness:.22});
  const idleMat=new THREE.MeshStandardMaterial({color:0xa9d4ff,emissive:0x3a72ff,emissiveIntensity:1.15,roughness:.28});
  const lineMat=new THREE.MeshBasicMaterial({color:0xa8d8ff,transparent:true,opacity:.95});
  function clear(){
    [...nodes,...hits,...lines].forEach(o=>{scene.remove(o);o.geometry?.dispose();if(o.material&&!([idleMat,litMat,lineMat].includes(o.material)))o.material.dispose?.()});nodes=[];hits=[];lines=[];
  }
  function makeNode(p,i){
    const m=new THREE.Mesh(new THREE.SphereGeometry(.12,24,18),idleMat.clone());m.position.copy(p);m.userData.index=i;scene.add(m);nodes.push(m);
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0x79a8ff,transparent:true,opacity:.48,blending:THREE.AdditiveBlending,depthWrite:false}));glow.position.copy(p);glow.scale.set(.75,.75,1);scene.add(glow);lines.push(glow);
    const h=new THREE.Mesh(new THREE.SphereGeometry(.38,12,8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));h.position.copy(p);h.userData.index=i;scene.add(h);hits.push(h);
  }
  function round(){
    clear();item=next();const ci=ctx.CONSTELLATIONS.findIndex(x=>x.id===item.id);points=constellationPoints(item,ci);idx=0;completeAt=0;hud.prompt.textContent='Վառենք՝ '+item.name;voice('Վառենք '+item.name,ctx);points.forEach(makeNode);pulse();
  }
  function pulse(){nodes.forEach((n,i)=>{const nextOne=i===idx;n.scale.setScalar(nextOne?1.45:1);n.material.emissiveIntensity=nextOne?2.3:(i<idx?2.8:1.15)})}
  function lightNext(){
    if(idx>=nodes.length)return;const n=nodes[idx];n.material.color.set(0xfff0a1);n.material.emissive.set(0xffd85b);n.material.emissiveIntensity=2.8;
    if(idx>0){const l=cylinderBetween(points[idx-1],points[idx],lineMat.clone());scene.add(l);lines.push(l)}
    idx++;pulse();
    if(idx===nodes.length){done++;completeAt=performance.now();hud.score.textContent=String(done);hud.prompt.textContent=item.name;voice(item.name,ctx);if(done%5===0)reward(root,ctx);timer=setTimeout(()=>{if(!disposed)round()},2200)}
  }
  function pointer(e){
    if(completeAt)return;const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;ray.setFromCamera(mouse,camera);const h=ray.intersectObjects(hits,false)[0];if(h&&h.object.userData.index===idx)lightNext();
  }
  let drawing=false;renderer.domElement.addEventListener('pointerdown',e=>{drawing=true;pointer(e)});renderer.domElement.addEventListener('pointermove',e=>{if(drawing)pointer(e)});renderer.domElement.addEventListener('pointerup',()=>drawing=false);renderer.domElement.addEventListener('pointercancel',()=>drawing=false);
  function loop(t){
    if(disposed)return;const dt=Math.min(.04,(t-last)/1000);last=t;stars.rotation.y+=dt*.01;
    nodes.forEach((n,i)=>{n.rotation.y+=dt*.8;if(i===idx&&!completeAt)n.scale.setScalar(1.25+Math.sin(t*.006)*.18)});
    if(completeAt){camera.position.z+=(6.6-camera.position.z)*.035;camera.position.x=Math.sin(t*.0012)*.25}else{camera.position.z+=(8.2-camera.position.z)*.04;camera.position.x=Math.sin(t*.00035)*.12}
    camera.lookAt(0,0,0);resize(renderer,camera,root);renderer.render(scene,camera);requestAnimationFrame(loop);
  }
  round();requestAnimationFrame(loop);
  ctx.gameCleanup.push(()=>{disposed=true;clearTimeout(timer);try{speechSynthesis.cancel()}catch{};clear();renderer.dispose();renderer.forceContextLoss?.();idleMat.dispose();litMat.dispose();lineMat.dispose();if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio()});
}
async function comparisonSnapshot(item,{width=360,height=250}={}){
  await prepareTrue360Texture(item);

  const renderer=new THREE.WebGLRenderer({
    antialias:true,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width,height,false);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;

  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x07142f);
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,80);
  camera.position.set(0,.04,7.9);

  scene.add(new THREE.HemisphereLight(0xb8d1ff,0x11172c,.90));
  scene.add(new THREE.AmbientLight(0x6176a6,.48));
  const key=new THREE.DirectionalLight(0xffffff,3.45);key.position.set(-4.5,5.5,7);scene.add(key);
  const fill=new THREE.DirectionalLight(0xc5d9ff,1.80);fill.position.set(4.8,1.8,6.5);scene.add(fill);
  const rim=new THREE.DirectionalLight(0x7486ff,.82);rim.position.set(5,-2,2);scene.add(rim);
  const stars=starField(scene);

  const g=buildObject(item);
  g.position.set(0,0,0);
  scene.add(g);
  g.updateMatrixWorld(true);

  // Normalize only the thumbnail framing; geometry, texture, tilt and rings
  // remain exactly the same as the current Space Search object.
  const box=new THREE.Box3().setFromObject(g);
  const sphere=new THREE.Sphere();box.getBoundingSphere(sphere);
  const targetRadius=(item.id==='black-hole'||item.id==='milky-way'||item.id==='solar-system')?1.48:1.62;
  const k=clamp(targetRadius/Math.max(.01,sphere.radius),.42,2.45);
  g.scale.multiplyScalar(k);
  g.updateMatrixWorld(true);

  // Give async TextureLoader maps (notably the Moon override) a moment to settle.
  if(item.id==='moon')await new Promise(r=>setTimeout(r,420));

  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
  const data=renderer.domElement.toDataURL('image/png');

  scene.remove(g);
  disposeObject(g);
  stars?.parent?.remove?.(stars);
  renderer.dispose();
  renderer.forceContextLoss?.();
  return data;
}

window.AregSpace3D={
  spaceSearch:gameSpaceSearch,
  constellationQuest:gameConstellationQuest,
  comparisonSnapshot
};
window.dispatchEvent(new Event('areg-space3d-ready'));
