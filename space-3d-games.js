// V171 final space-search polish: unified 3D pipeline, clean textures, mixed layout, bright Sun
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

  phobos:'assets/space3d/2k_phobos.jpg?v=171',
  io:'assets/space3d/4k_io.jpg?v=171',
  europa:'assets/space3d/2k_europa.jpg?v=171',
  ganymede:'assets/space3d/2k_ganymede.jpg?v=171',
  callisto:'assets/space3d/2k_callisto.jpg?v=171',
  titan:'assets/space3d/4k_titan.jpg?v=171',
  enceladus:'assets/space3d/2k_enceladus.jpg?v=171',

  pluto:'assets/space3d/4k_pluto.jpg?v=171',
  ceres:'assets/space3d/2k_ceres.jpg?v=171',
  haumea:'assets/space3d/2k_haumea.jpg?v=171'
};
const PROCEDURAL_ONLY=new Set(['deimos','titania','oberon','triton','charon','makemake','eris']);
const REALISTIC_IDS=new Set(Object.keys(TEXTURE_PATHS));
const AXIAL_TILT={
  sun:7.25,mercury:.03,venus:177.4,earth:23.44,moon:6.68,mars:25.19,
  jupiter:3.13,saturn:26.73,uranus:97.77,neptune:28.32,
  pluto:119.6,haumea:126,eris:78
};
const DISPLAY_SCALE={sun:1.18,mercury:.70,venus:.88,earth:.90,moon:.70,mars:.78,jupiter:1.12,saturn:1.02,uranus:.92,neptune:.92};

// Compressed physical hierarchy: Sun > gas giants > ice giants > terrestrial planets > moons.
// Values are final on-screen bounding radii in portrait mode.
const GAME_RADIUS={
  sun:1.24,
  jupiter:1.16,saturn:1.14,
  uranus:1.09,neptune:1.09,
  earth:1.07,venus:1.06,
  mars:1.02,mercury:.99,moon:1.00,
  phobos:.98,deimos:.98,io:1.03,europa:1.02,ganymede:1.05,callisto:1.04,
  titan:1.06,enceladus:1.00,titania:1.01,oberon:1.01,triton:1.02,charon:1.00,
  pluto:1.03,ceres:1.01,haumea:1.04,makemake:1.01,eris:1.01,
  'solar-system':1.22,'milky-way':1.20,'black-hole':1.20
};
// Relative sidereal-rotation feel. Direction is preserved for retrograde bodies.
// Rates are visually compressed so a toddler can perceive the motion without cartoon-speed spinning.
const PHYSICS_SPIN={
  sun:.052,mercury:.028,venus:-.016,earth:.165,moon:.032,mars:.160,
  jupiter:.285,saturn:.265,uranus:-.205,neptune:.215,
  phobos:.235,deimos:.120,io:.225,europa:.150,ganymede:.095,callisto:.055,
  titan:.058,enceladus:.260,titania:.082,oberon:.058,triton:-.104,charon:.092,
  pluto:-.092,ceres:.315,haumea:.420,makemake:.175,eris:.155
};
const texLoader=new THREE.TextureLoader();
const texCache=new Map();
function getTexture(path,{srgb=true,fallback=null}={}){
  if(texCache.has(path))return texCache.get(path);
  const t=texLoader.load(path,undefined,undefined,()=>{
    const fb=typeof fallback==='function'?fallback():null;
    if(fb?.image){t.image=fb.image;t.needsUpdate=true}
    else if(path===TEXTURE_PATHS.moon){
      const moonFb=moonTexture();t.image=moonFb.image;t.needsUpdate=true;
    }
  });
  if(srgb)t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=THREE.RepeatWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.anisotropy=12;
  texCache.set(path,t);
  return t;
}
function canvasTexture(item){
  const cacheKey='proc171:'+item.id;
  if(texCache.has(cacheKey))return texCache.get(cacheKey);

  const c=document.createElement('canvas');c.width=1024;c.height=512;
  const x=c.getContext('2d',{alpha:false});
  const r=prng(seedFrom('v171:'+item.id));
  const W=c.width,H=c.height;

  const palettes={
    deimos:['#9a8d82','#5c514a','#c5b9ad'],
    titania:['#aeb9ba','#667879','#d8e1df'],
    oberon:['#746a62','#403a36','#a49385'],
    triton:['#c4d6d9','#7f98a4','#e3c9c5'],
    charon:['#9b9794','#4f4b49','#c3bbb5'],
    makemake:['#bd7350','#633a2c','#db9a72'],
    eris:['#e2e5e7','#89949b','#f6f4ef']
  };
  const p=palettes[item.id]||[item.c1||'#9aa3ad',item.c2||'#4f5964',item.accent||'#c5cbd2'];

  const bg=x.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,p[0]);bg.addColorStop(.52,p[0]);bg.addColorStop(1,p[1]);
  x.fillStyle=bg;x.fillRect(0,0,W,H);

  function rgba(hex,a){
    const h=hex.replace('#','');
    const n=parseInt(h.length===3?h.split('').map(function(q){return q+q}).join(''):h,16);
    return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';
  }
  function blotch(cx,cy,rad,color,alpha){
    const g=x.createRadialGradient(cx-rad*.18,cy-rad*.16,rad*.05,cx,cy,rad);
    g.addColorStop(0,rgba(color,alpha));
    g.addColorStop(.58,rgba(color,alpha*.48));
    g.addColorStop(1,rgba(color,0));
    x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2);
  }
  function crater(cx,cy,rad,alpha){
    const g=x.createRadialGradient(cx-rad*.22,cy-rad*.22,rad*.04,cx,cy,rad);
    g.addColorStop(0,'rgba(28,29,31,'+alpha+')');
    g.addColorStop(.46,'rgba(55,56,59,'+(alpha*.56)+')');
    g.addColorStop(.68,'rgba(239,235,224,'+(alpha*.38)+')');
    g.addColorStop(.82,'rgba(95,94,91,'+(alpha*.18)+')');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(cx-rad*1.2,cy-rad*1.2,rad*2.4,rad*2.4);
  }
  function canyon(count,color,alpha){
    for(let i=0;i<count;i++){
      let px=r()*W,py=r()*H;
      x.beginPath();x.moveTo(px,py);
      const seg=5+Math.floor(r()*7);
      for(let j=0;j<seg;j++){px+=14+r()*48;py+=(r()-.5)*25;x.lineTo(px,py)}
      x.strokeStyle=rgba(color,alpha*(.62+r()*.52));
      x.lineWidth=.8+r()*2.3;x.stroke();
    }
  }

  // Large-scale mineral variation: avoids a flat "painted ball".
  for(let i=0;i<64;i++){
    const rad=28+r()*125;
    blotch(r()*W,r()*H,rad,r()>.45?p[2]:p[1],.025+r()*.105);
  }

  // Fine surface detail.
  for(let i=0;i<3600;i++){
    const px=r()*W,py=r()*H,sz=.35+r()*2.1;
    x.fillStyle=r()>.52?'rgba(255,255,255,'+(.012+r()*.045)+')':'rgba(15,17,20,'+(.012+r()*.052)+')';
    x.fillRect(px,py,sz,sz);
  }

  const rocky=['deimos','oberon','charon','makemake','eris'].includes(item.id);
  if(rocky){
    const count=item.id==='deimos'?150:105;
    for(let i=0;i<count;i++)crater(r()*W,r()*H,3+r()*26,.09+r()*.18);
  }

  if(item.id==='deimos'){
    for(let i=0;i<20;i++)blotch(r()*W,r()*H,45+r()*95,'#453e39',.08+r()*.11);
  }
  if(item.id==='titania'){
    canyon(42,'#5f777d',.22);
    canyon(20,'#dde9e9',.12);
    for(let i=0;i<52;i++)crater(r()*W,r()*H,3+r()*17,.06+r()*.10);
  }
  if(item.id==='oberon'){
    for(let i=0;i<30;i++)blotch(r()*W,r()*H,35+r()*80,'#2f2b29',.06+r()*.15);
    for(let i=0;i<18;i++)blotch(r()*W,r()*H,18+r()*50,'#b7a18e',.035+r()*.08);
  }
  if(item.id==='triton'){
    const veil=x.createLinearGradient(0,0,0,H);
    veil.addColorStop(0,'rgba(229,198,201,.24)');
    veil.addColorStop(.42,'rgba(184,216,221,.10)');
    veil.addColorStop(1,'rgba(113,145,162,.12)');
    x.fillStyle=veil;x.fillRect(0,0,W,H);
    canyon(26,'#6c8392',.12);
    for(let i=0;i<38;i++)blotch(r()*W,r()*H,22+r()*66,r()>.5?'#e8d7d5':'#7f9eab',.035+r()*.07);
  }
  if(item.id==='charon'){
    const cap=x.createLinearGradient(0,0,0,H*.38);
    cap.addColorStop(0,'rgba(91,62,58,.36)');cap.addColorStop(1,'rgba(91,62,58,0)');
    x.fillStyle=cap;x.fillRect(0,0,W,H*.42);
  }
  if(item.id==='makemake'){
    for(let i=0;i<30;i++)blotch(r()*W,r()*H,25+r()*74,r()>.5?'#e1a078':'#6f3929',.05+r()*.10);
  }
  if(item.id==='eris'){
    for(let i=0;i<24;i++)blotch(r()*W,r()*H,32+r()*82,r()>.5?'#ffffff':'#82939b',.025+r()*.06);
  }

  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  t.anisotropy=12;texCache.set(cacheKey,t);return t;
}
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.14,'rgba(255,235,170,.95)');g.addColorStop(.42,'rgba(110,160,255,.28)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
}
const GLOW=glowTexture();

function sunGlowTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;
  const x=c.getContext('2d');
  x.translate(256,256);x.globalCompositeOperation='lighter';

  const g=x.createRadialGradient(0,0,54,0,0,248);
  g.addColorStop(0,'rgba(255,255,220,.98)');
  g.addColorStop(.18,'rgba(255,229,94,.88)');
  g.addColorStop(.46,'rgba(255,153,28,.42)');
  g.addColorStop(.72,'rgba(255,93,8,.14)');
  g.addColorStop(1,'rgba(255,80,0,0)');
  x.fillStyle=g;x.beginPath();x.arc(0,0,248,0,Math.PI*2);x.fill();

  for(let i=0;i<32;i++){
    const a=(i/32)*Math.PI*2;
    const long=i%8===0;
    const inner=132,outer=long?228:176+(i%5)*7;
    const alpha=long?.075:.032+(i%3)*.009;
    x.strokeStyle='rgba(255,200,76,'+alpha+')';
    x.lineWidth=long?2.2:1.0;
    x.beginPath();
    x.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);
    x.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);
    x.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const SUN_GLOW=sunGlowTexture();
function imageTexture(path){
  const key='img:'+path;
  if(texCache.has(key))return texCache.get(key);
  const t=texLoader.load(path);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;
  t.magFilter=THREE.LinearFilter;
  t.anisotropy=12;
  texCache.set(key,t);return t;
}
function softDiscMask(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,22,128,128,128);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(.62,'rgba(255,255,255,1)');
  g.addColorStop(.82,'rgba(255,255,255,.70)');
  g.addColorStop(.94,'rgba(255,255,255,.18)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);return t;
}
const SOFT_DISC=softDiscMask();
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
  if(item.id==='titan'){
    const haze=new THREE.Mesh(
      new THREE.SphereGeometry(1.035,56,36),
      new THREE.MeshBasicMaterial({
        color:0xf2aa51,side:THREE.BackSide,transparent:true,opacity:.13,
        depthWrite:false,blending:THREE.AdditiveBlending
      })
    );
    haze.userData.parentPick=grp;grp.add(haze);
  }
  if(item.id==='saturn'){
    const ringTex=getTexture('assets/space3d/2k_saturn_ring_alpha.png');
    mat=new THREE.MeshBasicMaterial({
      map:ringTex,alphaMap:ringTex,color:0xf3d7a6,side:THREE.DoubleSide,
      transparent:true,opacity:.82,alphaTest:.02,depthWrite:false
    });
  }else{
    mat=new THREE.MeshBasicMaterial({
      color:0xb9dce3,side:THREE.DoubleSide,transparent:true,opacity:.30,depthWrite:false
    });
  }
  const ring=new THREE.Mesh(geo,mat);ring.userData.ringSurface=true;group.add(ring);

  // Sparse rocky particles make the ring feel physical without becoming noisy.
  const count=item.id==='saturn'?42:22;
  const rockGeo=new THREE.IcosahedronGeometry(item.id==='saturn'?.027:.022,0);
  const rockMat=new THREE.MeshStandardMaterial({
    color:item.id==='saturn'?0xc7b79b:0xa8c2c8,roughness:1,metalness:0
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
  let geo=item.kind==='oval'?new THREE.SphereGeometry(1,80,54):new THREE.SphereGeometry(1,88,58);
  if(item.kind==='oval')geo.scale(1.28,.78,.88);

  if(item.id==='phobos'||item.id==='deimos'){
    const p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);
      const n=1
        +Math.sin(px*5.7+py*2.8-pz*3.1)*.035
        +Math.cos(py*6.3+pz*4.1)*.026
        +Math.sin(pz*8.2-px*2.2)*.018;
      p.setXYZ(i,px*n,py*n,pz*n);
    }
    p.needsUpdate=true;geo.computeVertexNormals();
    if(item.id==='phobos')geo.scale(1.22,.82,.93);
    else geo.scale(1.14,.88,.96);
  }

  const texturePath=TEXTURE_PATHS[item.id];
  const useProcedural=PROCEDURAL_ONLY.has(item.id)||!texturePath;
  const tex=useProcedural?canvasTexture(item):getTexture(texturePath,{fallback:function(){return canvasTexture(item)}});
  const isSun=item.id==='sun';
  const giant=['jupiter','saturn','uranus','neptune'].includes(item.id);
  const smallBody=!['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'].includes(item.id);

  const mat=isSun
    ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff})
    : new THREE.MeshStandardMaterial({
        map:tex,color:0xffffff,
        roughness:giant?.88:.94,metalness:0,
        emissive:0xffffff,emissiveMap:tex,
        emissiveIntensity:smallBody?.24:(giant?.12:.17)
      });

  if(!isSun&&smallBody){
    mat.bumpMap=tex;
    mat.bumpScale=(item.id==='phobos'||item.id==='deimos')?.045:.014;
  }

  const mesh=new THREE.Mesh(geo,mat);
  mesh.rotation.z=THREE.MathUtils.degToRad(AXIAL_TILT[item.id]||0);
  mesh.userData.parentPick=grp;grp.add(mesh);
  grp.userData.surface=mesh;

  if(item.id==='earth'){
    const cloudTex=getTexture('assets/space3d/2k_earth_clouds.jpg?v=171');
    const clouds=new THREE.Mesh(
      new THREE.SphereGeometry(1.014,88,58),
      new THREE.MeshStandardMaterial({
        color:0xffffff,alphaMap:cloudTex,transparent:true,opacity:.34,
        depthWrite:false,roughness:1,metalness:0,emissive:0x39444f,emissiveIntensity:.16
      })
    );
    clouds.rotation.z=mesh.rotation.z;clouds.userData.parentPick=grp;grp.add(clouds);grp.userData.clouds=clouds;
    const atm=atmosphereMesh(1.038);atm.rotation.z=mesh.rotation.z;grp.add(atm);
  }

  if(item.id==='saturn'){
    const ring=ringMesh(item,1.22,2.08);ring.userData.parentPick=grp;grp.add(ring);grp.userData.ring=ring;
  }
  if(item.id==='uranus'){
    const ring=ringMesh(item,1.28,1.66);ring.userData.parentPick=grp;grp.add(ring);grp.userData.ring=ring;
  }

  if(isSun){
    const haloMat=new THREE.SpriteMaterial({
      map:SUN_GLOW,color:0xffc04a,transparent:true,opacity:.76,
      depthWrite:false,blending:THREE.AdditiveBlending
    });
    haloMat.toneMapped=false;
    const halo=new THREE.Sprite(haloMat);
    halo.scale.set(3.55,3.55,1);halo.position.z=-.07;grp.add(halo);

    const bloomMat=new THREE.SpriteMaterial({
      map:GLOW,color:0xff8a18,transparent:true,opacity:.30,
      depthWrite:false,blending:THREE.AdditiveBlending
    });
    bloomMat.toneMapped=false;
    const bloom=new THREE.Sprite(bloomMat);
    bloom.scale.set(3.02,3.02,1);bloom.position.z=-.10;grp.add(bloom);

    grp.userData.sunGlow=halo;
    grp.userData.sunBloom=bloom;
  }

  grp.scale.setScalar(DISPLAY_SCALE[item.id]||.82);
  grp.userData.spin=PHYSICS_SPIN[item.id]??.105;
  return grp;
}
function referenceSpaceObject(item){
  const g=new THREE.Group();g.userData.item=item;g.userData.pickable=true;
  const tex=imageTexture((item.img||'29-milky-way.jpg')+'?v=171');
  const mat=new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{map:{value:tex},opacity:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform sampler2D map;uniform float opacity;varying vec2 vUv;void main(){vec4 c=texture2D(map,vUv);float e=min(min(vUv.x,1.0-vUv.x),min(vUv.y,1.0-vUv.y));float a=smoothstep(0.0,0.115,e);gl_FragColor=vec4(c.rgb*1.04,c.a*a*opacity);}'
  });
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(3.45,3.45),mat);
  plane.userData.parentPick=g;g.add(plane);
  const hit=new THREE.Mesh(new THREE.SphereGeometry(1.42,24,16),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));
  hit.userData.parentPick=g;g.add(hit);
  g.userData.billboard=plane;
  g.userData.billboardPhase=rand(0,Math.PI*2);
  g.userData.billboardSway=item.id==='milky-way'?.014:.008;
  return g;
}
function blackHole(item){return referenceSpaceObject(item)}
function galaxy(item){return referenceSpaceObject(item)}
function solarSystem(item){return referenceSpaceObject(item)}
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
  const portrait=aspect<.72;
  const pts=portrait?[
    [-1.30,1.62],[0,1.60],[1.30,1.58],
    [-1.34,.52],[-.02,.48],[1.34,.46],
    [-1.30,-.62],[.02,-.58],[1.30,-.68],
    [-1.18,-1.72],[.05,-1.72],[1.18,-1.70]
  ]:[
    [-1.62,1.08],[0,1.10],[1.62,1.05],
    [-1.68,0],[-.02,.02],[1.68,-.02],
    [-1.62,-1.08],[0,-1.10],[1.62,-1.05]
  ];

  const minDist=portrait?1.92:2.10;
  let chosen=[];
  for(let attempt=0;attempt<80&&chosen.length<5;attempt++){
    const order=shuffle(pts);
    const next=[];
    for(const p of order){
      if(next.every(function(q){return Math.hypot(p[0]-q[0],p[1]-q[1])>=minDist}))next.push(p);
      if(next.length===5)break;
    }
    if(next.length>chosen.length)chosen=next;
  }
  if(chosen.length<5){
    chosen=portrait
      ? [[-1.25,1.55],[1.25,1.35],[-.10,.25],[-1.20,-1.45],[1.20,-1.68]]
      : [[-1.55,1.0],[1.55,.92],[0,.05],[-1.50,-1.0],[1.55,-1.08]];
  }
  return shuffle(chosen.slice(0,5)).map(function(p){
    return new THREE.Vector3(p[0]+rand(-.07,.07),p[1]+rand(-.07,.07),rand(-.02,.06));
  });
}
function fitSearchObject(g,item,portrait){
  g.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(g),sphere=new THREE.Sphere();box.getBoundingSphere(sphere);
  const desired=GAME_RADIUS[item.id]??1.01;
  const targetRadius=portrait?desired:desired*1.06;
  const radius=Math.max(.01,sphere.radius);
  g.scale.multiplyScalar(targetRadius/radius);
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
    phobos:'Ֆոբոսը',
    deimos:'Դեյմոսը',
    io:'Իոն',
    europa:'Եվրոպան',
    ganymede:'Գանիմեդը',
    callisto:'Կալիստոն',
    titan:'Տիտանը',
    enceladus:'Էնցելադուսը',
    titania:'Տիտանիան',
    oberon:'Օբերոնը',
    triton:'Տրիտոնը',
    charon:'Խարոնը',
    pluto:'Պլուտոնը',
    ceres:'Ցերերան',
    haumea:'Հաումեան',
    makemake:'Մակեմակեն',
    eris:'Էրիսը',
    'solar-system':'Արեգակնային համակարգը',
    'milky-way':'Ծիր Կաթինը',
    'black-hole':'Սև խոռոչը'
  })[item.id]||item.name;
}
function easeInOutCubic(q){
  q=clamp(q,0,1);return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2;
}
function easeOutCubic(q){q=clamp(q,0,1);return 1-Math.pow(1-q,3)}
function feedbackScaleMultiplier(g,camera,root){
  // Use the final win camera position so the object can fill the screen closely without clipping.
  const targetZ=1.62,finalCameraZ=8.02;
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
  const camera=new THREE.PerspectiveCamera(47,1,.1,80);camera.position.set(0,.10,8.78);
  scene.add(new THREE.HemisphereLight(0xd5e5ff,0x334765,1.35));
  scene.add(new THREE.AmbientLight(0x8295b9,.88));
  const key=new THREE.DirectionalLight(0xffffff,2.10);key.position.set(-4.2,5.0,6.8);scene.add(key);
  const fill=new THREE.DirectionalLight(0xe0ecff,2.65);fill.position.set(4.6,1.7,6.4);scene.add(fill);
  const rim=new THREE.DirectionalLight(0x91a1ff,.92);rim.position.set(5,-2,2);scene.add(rim);
  const stars=starField(scene),shooting=createShootingStars(scene);
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),pickables=[];
  const pool=ctx.PLANETS.filter(x=>x&&x.id&&x.name);
  const next=bag(pool);

  let groups=[],target=null,score=0,locked=true,disposed=false,last=performance.now();
  let wrong=null,winStart=0,winGroup=null,transition=null,timer=0,recent=[];

  function decoys(t){
    let p=shuffle(pool.filter(x=>x.id!==t.id&&!recent.includes(x.id)));
    if(p.length<4)p=shuffle(pool.filter(x=>x.id!==t.id));
    return p.slice(0,4);
  }
  function clear(){
    groups.forEach(g=>{scene.remove(g);disposeObject(g)});
    groups=[];pickables.length=0;wrong=null;winGroup=null;
  }
  function buildRound(){
    clear();locked=true;winStart=0;root.classList.remove('s3d-win');
    target=next();
    const opts=shuffle([target,...decoys(target)]);
    const slots=shuffle(searchSlots(root,camera));
    const portrait=(root.clientWidth/Math.max(1,root.clientHeight))<.72;
    recent=[...new Set(opts.map(x=>x.id).concat(recent))].slice(0,12);
    hud.prompt.textContent='Գտի՛ր՝ '+findObjectName(target);

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
    camera.position.z+=((winStart?8.02:8.78)-camera.position.z)*.042;
    camera.lookAt(0,-.08,0);

    let finishEnter=false,finishExit=false;

    groups.forEach((g,i)=>{
      if(g.userData.surface)g.userData.surface.rotation.y+=dt*(g.userData.spin??.105)*(g.userData.win?1.42:1);
      if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*.09;
      if(g.userData.sunGlow){
        g.userData.sunGlow.material.rotation+=dt*.006;
        const pulse=.5+.5*Math.sin(t*.00105);
        g.userData.sunGlow.material.opacity=.69+.07*pulse;
        const gs=3.50+.08*pulse;
        g.userData.sunGlow.scale.set(gs,gs,1);
      }
      if(g.userData.sunBloom){
        g.userData.sunBloom.material.opacity=.27+.04*(.5+.5*Math.sin(t*.00145+1.2));
      }
      if(g.userData.billboard){
        const b=g.userData.billboard;
        b.quaternion.copy(camera.quaternion);
        b.rotateZ(Math.sin(t*.00032+(g.userData.billboardPhase||0))*(g.userData.billboardSway??.012));
        if(g.userData.billboardAura){
          const a=g.userData.billboardAura;
          a.material.opacity=.085+.025*(.5+.5*Math.sin(t*.0018+(g.userData.billboardPhase||0)));
        }
      }
      if(g.userData.accretion){
        g.userData.accretion[0].rotation.z+=dt*.42;
        g.userData.accretion[1].rotation.z-=dt*.24;
      }
      if(g.userData.galaxyPoints){
        g.userData.galaxyPoints.rotation.y+=dt*.12;
        g.userData.galaxyPoints.rotation.z+=dt*.035;
      }
      if(g.userData.orbiters){
        g.userData.orbiters.forEach((p,oi)=>{
          const rr=p.userData.orbitRadius||1,a=t*.00018*(1+oi*.18)+oi*1.37;
          p.position.set(Math.cos(a)*rr,0,Math.sin(a)*rr*.55);
        });
      }
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
    disposed=true;clearTimeout(timer);try{speechSynthesis.cancel()}catch{};
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
