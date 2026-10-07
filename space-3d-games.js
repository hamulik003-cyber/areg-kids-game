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
const TEXTURE_PATHS={
  sun:'assets/space3d/2k_sun.jpg',
  mercury:'assets/space3d/2k_mercury.jpg',
  venus:'assets/space3d/2k_venus_surface.jpg',
  earth:'assets/space3d/2k_earth_daymap.jpg',
  moon:'https://raw.githubusercontent.com/markfxm/SolarSystem/main/public/detail/4k_moon.jpg',
  mars:'assets/space3d/2k_mars.jpg',
  jupiter:'assets/space3d/2k_jupiter.jpg',
  saturn:'assets/space3d/2k_saturn.jpg',
  uranus:'assets/space3d/2k_uranus.jpg',
  neptune:'assets/space3d/2k_neptune.jpg',
  phobos:'assets/space3d/2k_phobos.jpg',
  deimos:'assets/space3d/2k_deimos_true360.jpg',
  io:'assets/space3d/4k_io.jpg',
  europa:'assets/space3d/2k_europa.jpg',
  ganymede:'assets/space3d/2k_ganymede.jpg'
};
const REALISTIC_IDS=new Set(Object.keys(TEXTURE_PATHS));
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
const ALIGN_IDS=new Set(['sun','earth','uranus']);
const alignTextureCache=new Map();
const alignTexturePending=new Map();

function visualWrap01(v){return v-Math.floor(v)}
function visualWrapDist(a,b){
  let d=Math.abs(a-b);
  return Math.min(d,1-d);
}
function visualContrast01(v,c){
  return Math.max(0,Math.min(1,(v-.5)*c+.5));
}
function gradeSunReference(data){
  for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2];
    let l=(.299*r+.587*g+.114*b)/255;
    l=visualContrast01(l,1.18);
    const dark=[126,24,7],mid=[255,102,4],hot=[255,238,92];
    let a,c,t;
    if(l<.50){a=dark;c=mid;t=l/.50}else{a=mid;c=hot;t=(l-.50)/.50}
    data[i]=byte(mix(a[0],c[0],t));
    data[i+1]=byte(mix(a[1],c[1],t));
    data[i+2]=byte(mix(a[2],c[2],t));
  }
}
function gradeEarthReference(data){
  for(let i=0;i<data.length;i+=4){
    let r=data[i],g=data[i+1],b=data[i+2];
    const l=.299*r+.587*g+.114*b;
    const ocean=(b>r*1.12&&b>g*1.05);
    const green=(g>r*1.04&&g>b*1.08);
    const ice=(l>205&&Math.max(r,g,b)-Math.min(r,g,b)<34);
    const desert=!ocean&&!green&&!ice&&r>g*1.04&&g>b*.95;

    if(ocean){
      r=byte(r*.72);
      g=byte(g*1.24+8);
      b=byte(b*1.38+16);
    }else if(green){
      r=byte(r*.88);
      g=byte(g*1.28+7);
      b=byte(b*.88);
    }else if(desert){
      r=byte(r*1.14+6);
      g=byte(g*1.08+3);
      b=byte(b*.86);
    }else if(ice){
      r=byte(r*1.06+4);g=byte(g*1.07+4);b=byte(b*1.09+5);
    }else{
      const c=1.10;
      r=byte((r-128)*c+128);
      g=byte((g-128)*c+128);
      b=byte((b-128)*c+128);
    }
    data[i]=r;data[i+1]=g;data[i+2]=b;
  }
}
function gradeUranusReference(data,W,H){
  for(let y=0;y<H;y++){
    const v=y/(H-1);
    const lat=Math.abs(v-.5)*2;
    for(let x=0;x<W;x++){
      const u=x/(W-1);
      const i=(y*W+x)*4;
      const srcL=(.299*data[i]+.587*data[i+1]+.114*data[i+2])/255;

      // Reference identity: vivid cyan-blue globe with soft horizontal cloud structure.
      const broad=.5+.5*Math.cos((v-.5)*Math.PI);
      const band1=Math.sin(v*Math.PI*18 + Math.sin(u*Math.PI*4)*.45);
      const band2=Math.sin(v*Math.PI*31 - u*Math.PI*6 + Math.sin(u*Math.PI*10)*.20);
      const cloudMask=Math.max(0,band1*.72+band2*.28-.42);

      // Two soft storm-like cloud swirls, periodic in longitude so the texture remains closed.
      const d1=visualWrapDist(u,.63),dy1=(v-.43);
      const d2=visualWrapDist(u,.28),dy2=(v-.70);
      const storm1=Math.exp(-(d1*d1/.010 + dy1*dy1/.006));
      const storm2=Math.exp(-(d2*d2/.016 + dy2*dy2/.010));
      const swirl=(storm1*(.55+.45*Math.sin((u*14+v*22)*Math.PI*2))
                  +storm2*(.50+.50*Math.sin((u*11-v*18)*Math.PI*2)))*.62;

      const sourceDetail=(srcL-.5)*.13;
      let rr=54 + broad*25 - lat*8 + sourceDetail*255;
      let gg=170 + broad*42 - lat*10 + sourceDetail*220;
      let bb=218 + broad*35 - lat*7 + sourceDetail*210;

      const light=Math.max(0,cloudMask)*22 + Math.max(0,swirl)*30;
      rr+=light*.72;gg+=light*.96;bb+=light;
      data[i]=byte(rr);data[i+1]=byte(gg);data[i+2]=byte(bb);
    }
  }
}
function sealAlignmentSeam(data,W,H,band=12){
  band=Math.max(4,Math.min(band,Math.floor(W*.02)));
  for(let y=0;y<H;y++){
    for(let k=0;k<band;k++){
      const li=(y*W+k)*4,ri=(y*W+(W-1-k))*4;
      const w=(1-k/(band-1))*.72;
      for(let c=0;c<3;c++){
        const avg=(data[li+c]+data[ri+c])*.5;
        data[li+c]=byte(mix(data[li+c],avg,w));
        data[ri+c]=byte(mix(data[ri+c],avg,w));
      }
    }
  }
}
async function prepareAlignedTexture(item){
  if(!ALIGN_IDS.has(item.id))return null;
  if(alignTextureCache.has(item.id))return alignTextureCache.get(item.id);
  if(alignTexturePending.has(item.id))return alignTexturePending.get(item.id);

  const pending=(async()=>{
    const path=TEXTURE_PATHS[item.id];
    const img=await loadTrue360Image(path);
    const W=2048,H=1024;
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d',{alpha:false,willReadFrequently:true});
    x.drawImage(img,0,0,W,H);
    const im=x.getImageData(0,0,W,H);

    if(item.id==='sun')gradeSunReference(im.data);
    else if(item.id==='earth')gradeEarthReference(im.data);
    else if(item.id==='uranus')gradeUranusReference(im.data,W,H);

    sealAlignmentSeam(im.data,W,H,12);
    x.putImageData(im,0,0);

    const t=new THREE.CanvasTexture(c);
    t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=THREE.RepeatWrapping;
    t.wrapT=THREE.ClampToEdgeWrapping;
    t.minFilter=THREE.LinearMipmapLinearFilter;
    t.magFilter=THREE.LinearFilter;
    t.anisotropy=16;
    t.needsUpdate=true;
    alignTextureCache.set(item.id,t);
    alignTexturePending.delete(item.id);
    return t;
  })().catch(err=>{alignTexturePending.delete(item.id);throw err});
  alignTexturePending.set(item.id,pending);
  return pending;
}
async function prepareVisualTexture(item){
  if(TRUE360_IDS.has(item.id))return prepareTrue360Texture(item);
  if(ALIGN_IDS.has(item.id))return prepareAlignedTexture(item);
  return null;
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
  if(TRUE360_IDS.has(item.id))return true360Cache.get(item.id)||canvasTexture(item);
  if(ALIGN_IDS.has(item.id))return alignTextureCache.get(item.id)||getTexture(TEXTURE_PATHS[item.id]);
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
  const group=new THREE.Group();
  const geo=new THREE.RingGeometry(inner,outer,160);
  const pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<pos.count;i++){
    const r=Math.hypot(pos.getX(i),pos.getY(i));
    uv.setXY(i,clamp((r-inner)/(outer-inner),0,1),.5);
  }

  let mat;
  if(item.id==='saturn'){
    const ringTex=getTexture('assets/space3d/2k_saturn_ring_alpha.png');
    mat=new THREE.MeshBasicMaterial({
      map:ringTex,alphaMap:ringTex,color:0xfff6df,side:THREE.DoubleSide,
      transparent:true,opacity:.96,alphaTest:.025,depthWrite:true
    });
  }else{
    mat=new THREE.MeshBasicMaterial({
      color:item.id==='uranus'?0xc8f3ff:0xb9dce3,side:THREE.DoubleSide,transparent:true,
      opacity:item.id==='uranus'?.56:.30,depthWrite:false
    });
  }
  const ring=new THREE.Mesh(geo,mat);ring.userData.ringSurface=true;group.add(ring);

  // Sparse rocky particles make the ring feel physical without becoming noisy.
  const count=item.id==='saturn'?42:(item.id==='uranus'?12:22);
  const rockGeo=new THREE.IcosahedronGeometry(item.id==='saturn'?.027:.022,0);
  const rockMat=new THREE.MeshStandardMaterial({
    color:item.id==='saturn'?0xc7b79b:(item.id==='uranus'?0xbfe8f2:0xa8c2c8),roughness:1,metalness:0
  });
  const rocks=new THREE.InstancedMesh(rockGeo,rockMat,count);
  const dummy=new THREE.Object3D();
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2;
    const rr=rand(inner+.05,outer-.04);
    dummy.position.set(Math.cos(a)*rr,Math.sin(a)*rr,rand(-.025,.025));
    const s=rand(.52,1.45);dummy.scale.setScalar(s);
    dummy.rotation.set(rand(0,Math.PI),rand(0,Math.PI),rand(0,Math.PI));
    dummy.updateMatrix();rocks.setMatrixAt(i,dummy.matrix);
  }
  rocks.instanceMatrix.needsUpdate=true;rocks.userData.ringRocks=true;group.add(rocks);

  const baseX=item.id==='saturn'?-.96:-.86;
  const winX=item.id==='saturn'?-.63:-.60;
  const baseZ=item.id==='saturn'?.34:-.36;
  group.rotation.set(baseX,0,baseZ);
  group.userData.ring=true;group.userData.rocks=rocks;
  group.userData.baseRotationX=baseX;group.userData.winRotationX=winX;
  group.userData.baseRotationZ=baseZ;
  return group;
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
  let geo=item.kind==='oval'?new THREE.SphereGeometry(1,64,40):new THREE.SphereGeometry(1,72,48);
  if(item.kind==='oval')geo.scale(1.28,.78,.88);

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
  const isTrue360=TRUE360_IDS.has(item.id);
  const true360Lift={
    phobos:.14,deimos:.10,io:.14,europa:.025,ganymede:.035
  }[item.id]??0;
  const alignmentLift={earth:.10,uranus:.12}[item.id]??0;
  const mat=isSun
    ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff})
    : new THREE.MeshStandardMaterial({
        map:tex,color:0xffffff,
        roughness:item.id==='earth'?.88:(item.id==='uranus'?.92:(isTrue360?.95:.96)),
        metalness:0,
        emissive:(isTrue360||alignmentLift>0)?0xffffff:0x000000,
        emissiveMap:(isTrue360||alignmentLift>0)?tex:null,
        emissiveIntensity:isTrue360?true360Lift:alignmentLift
      });

  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.z=THREE.MathUtils.degToRad(AXIAL_TILT[item.id]||0);
  mesh.userData.parentPick=grp;grp.add(mesh);
  grp.userData.surface=mesh;
  if(item.id==='earth'){
    const cloudTex=getTexture('assets/space3d/2k_earth_clouds.jpg');
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.014,72,48),new THREE.MeshStandardMaterial({
      color:0xffffff,alphaMap:cloudTex,transparent:true,opacity:.50,depthWrite:false,roughness:1,metalness:0,
      emissive:0xffffff,emissiveIntensity:.12
    }));
    clouds.rotation.z=mesh.rotation.z;clouds.userData.parentPick=grp;grp.add(clouds);grp.userData.clouds=clouds;
    const atm=atmosphereMesh(1.035);atm.rotation.z=mesh.rotation.z;grp.add(atm);
  }
  if(item.id==='saturn'){
    const r=ringMesh(item,1.22,2.1);r.userData.parentPick=grp;grp.add(r);grp.userData.ring=r;
  }
  if(item.id==='uranus'){
    const r=ringMesh(item,1.28,1.68);r.userData.parentPick=grp;grp.add(r);grp.userData.ring=r;
  }
  if(isSun){
    const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffb52f,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending}));
    glow.scale.set(3.12,3.12,1);grp.add(glow);
  }
  grp.scale.setScalar(DISPLAY_SCALE[item.id]||.82);
  grp.userData.spin=item.id==='venus'?-.12:item.id==='uranus'?-.16:rand(.10,.22);
  return grp;
}
function blackHole(item){
  const g=new THREE.Group();g.userData.item=item;g.userData.pickable=true;g.userData.spin=.18;
  const core=new THREE.Mesh(new THREE.SphereGeometry(.72,48,32),new THREE.MeshBasicMaterial({color:0x000000}));
  core.userData.parentPick=g;g.add(core);
  const tor1=new THREE.Mesh(new THREE.TorusGeometry(1.25,.18,24,100),new THREE.MeshBasicMaterial({color:0xff9c32,transparent:true,opacity:.92}));
  tor1.rotation.x=1.12;tor1.userData.parentPick=g;g.add(tor1);
  const tor2=new THREE.Mesh(new THREE.TorusGeometry(1.55,.06,16,100),new THREE.MeshBasicMaterial({color:0xffe18a,transparent:true,opacity:.75}));
  tor2.rotation.x=1.12;tor2.userData.parentPick=g;g.add(tor2);return g;
}
function galaxy(item){
  const g=new THREE.Group();g.userData.item=item;g.userData.pickable=true;g.userData.spin=.08;
  const N=850,p=new Float32Array(N*3);
  for(let i=0;i<N;i++){const r=Math.pow(Math.random(),.6)*1.9,a=r*4.4+Math.floor(Math.random()*3)*2.1+rand(-.25,.25);p[i*3]=Math.cos(a)*r;p[i*3+1]=rand(-.12,.12)*(2-r/2);p[i*3+2]=Math.sin(a)*r*.58}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(p,3));
  const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc4d3ff,size:.045,transparent:true,opacity:.95,blending:THREE.AdditiveBlending,depthWrite:false}));
  pts.userData.parentPick=g;g.add(pts);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(1.55,24,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.userData.parentPick=g;g.add(hit);return g;
}
function solarSystem(item){
  const g=new THREE.Group();g.userData.item=item;g.userData.pickable=true;g.userData.spin=.12;
  const sun=new THREE.Mesh(new THREE.SphereGeometry(.42,32,22),new THREE.MeshStandardMaterial({color:0xffca38,emissive:0xff8a15,emissiveIntensity:1.8}));sun.userData.parentPick=g;g.add(sun);
  [0.72,1.0,1.28,1.55].forEach((r,i)=>{
    const curve=new THREE.EllipseCurve(0,0,r,r*.55,0,Math.PI*2);const pts=curve.getPoints(80).map(v=>new THREE.Vector3(v.x,0,v.y));
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x6e89c6,transparent:true,opacity:.32}));g.add(line);
    const p=new THREE.Mesh(new THREE.SphereGeometry(.09+i*.02,18,12),new THREE.MeshStandardMaterial({color:[0xb4a49a,0xd2a56a,0x4a8cdc,0xd26847][i]}));p.position.set(r,0,0);p.userData.parentPick=g;g.add(p);
  });return g;
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
  // Keep even Saturn's rings fully inside the iPhone safe area.
  const factor=portrait
    ? (item.id==='saturn'?.54:item.id==='uranus'?.64:item.id==='sun'?.67:item.id==='jupiter'?.68:.76)
    : (item.id==='saturn'?.72:item.id==='uranus'?.78:.86);
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
    phobos:'Ֆոբոսը',deimos:'Դեյմոսը',io:'Իոն',europa:'Եվրոպան',ganymede:'Գանիմեդը'
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
      if(m.isShaderMaterial)return;
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
      await Promise.all(opts.map(prepareVisualTexture));
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
      if(g.userData.ring)g.userData.exitFromRingX=g.userData.ring.rotation.x;
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
      if(g.userData.surface)g.userData.surface.rotation.y+=dt*(g.userData.spin||.18)*(g.userData.win?2.15:1);
      if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*.07;
      if(g.userData.ring?.userData?.rocks){
        const dir=g.userData.item?.id==='uranus'?-1:1;
        g.userData.ring.userData.rocks.rotation.z+=dt*.11*dir;
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
        if(g.userData.ring){
          const r=g.userData.ring,from=g.userData.exitFromRingX??r.rotation.x;
          r.rotation.x=THREE.MathUtils.lerp(from,r.userData.baseRotationX??from,e);
        }
        setObjectOpacity(g,g.userData.exitFromOpacity*(1-e));
        if(i===groups.length-1&&q>=1)finishExit=true;
      }else if(winStart){
        const q=clamp((t-winStart)/860,0,1),e=easeOutCubic(q);
        g.position.lerpVectors(g.userData.winFromPosition,g.userData.winToPosition,e);
        g.scale.lerpVectors(g.userData.winFromScale,g.userData.winTargetScale,e);
        if(g.userData.win){
          if(g.userData.ring){
            const r=g.userData.ring;
            r.rotation.x=THREE.MathUtils.lerp(r.userData.baseRotationX??r.rotation.x,r.userData.winRotationX??r.rotation.x,e);
          }
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
window.AregSpace3D={spaceSearch:gameSpaceSearch,constellationQuest:gameConstellationQuest};
window.dispatchEvent(new Event('areg-space3d-ready'));
