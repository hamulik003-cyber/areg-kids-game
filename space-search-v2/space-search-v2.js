import * as THREE from '../vendor/three.module.min.js';

const stage=document.getElementById('v2Stage');
const promptEl=document.getElementById('v2Prompt');
const scoreEl=document.getElementById('v2Score');
const starsEl=document.getElementById('v2Stars');
const loadingEl=document.getElementById('v2Loading');
document.getElementById('v2Back').addEventListener('click',()=>{location.href='../'});

const STAR_KEY='areg-stars-v35';
let stars=Number(localStorage.getItem(STAR_KEY)||0);
let score=0;
starsEl.textContent=String(stars);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const byte=v=>Math.max(0,Math.min(255,Math.round(v)));
const rand=(a,b)=>a+Math.random()*(b-a);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const PLANETS=[
  {id:'sun',name:'Արև',find:'Արևը'},
  {id:'mercury',name:'Մերկուրի',find:'Մերկուրին'},
  {id:'venus',name:'Վեներա',find:'Վեներան'},
  {id:'earth',name:'Երկիր',find:'Երկիրը'},
  {id:'moon',name:'Լուսին',find:'Լուսինը'},
  {id:'mars',name:'Մարս',find:'Մարսը'},
  {id:'jupiter',name:'Յուպիտեր',find:'Յուպիտերը'},
  {id:'saturn',name:'Սատուրն',find:'Սատուրնը'},
  {id:'uranus',name:'Ուրան',find:'Ուրանը'},
  {id:'neptune',name:'Նեպտուն',find:'Նեպտունը'}
];

const PROFILE={
  sun:{
    reference:'01-sun.jpg',texture:'assets/space3d/2k_sun.jpg',
    idle:.72,win:1.43,spin:.12,tilt:7.25,grade:'sun',
    basic:true,glow:{color:0xff9b20,opacity:.48,scale:2.65}
  },
  mercury:{
    reference:'02-mercury.jpg',texture:'assets/space3d/2k_mercury.jpg',
    idle:.62,win:1.40,spin:.16,tilt:.03,grade:'mercury',
    roughness:.98,emissive:.025
  },
  venus:{
    reference:'03-venus.jpg',texture:'assets/space3d/2k_venus_surface.jpg',
    idle:.68,win:1.42,spin:-.10,tilt:177.4,grade:'venus',
    roughness:.96,emissive:.045,atmosphere:{color:0xffbd55,strength:.16,power:2.8,radius:1.025}
  },
  earth:{
    reference:'04-earth.jpg',texture:'assets/space3d/2k_earth_daymap.jpg',
    idle:.70,win:1.42,spin:.15,tilt:23.44,grade:'earth',
    roughness:.84,emissive:.035,
    clouds:{texture:'assets/space3d/2k_earth_clouds.jpg',opacity:.56,spin:.055},
    atmosphere:{color:0x38b8ff,strength:.48,power:2.35,radius:1.043}
  },
  moon:{
    reference:'05-moon.jpg',texture:null,
    idle:.62,win:1.40,spin:.13,tilt:6.68,grade:'moon',
    roughness:1,emissive:.018
  },
  mars:{
    reference:'06-mars.jpg',texture:'assets/space3d/2k_mars.jpg',
    idle:.65,win:1.42,spin:.14,tilt:25.19,grade:'mars',
    roughness:.98,emissive:.025,atmosphere:{color:0xff7b50,strength:.09,power:3.0,radius:1.018}
  },
  jupiter:{
    reference:'07-jupiter.jpg',texture:'assets/space3d/2k_jupiter.jpg',
    idle:.75,win:1.46,spin:.19,tilt:3.13,grade:'jupiter',
    roughness:.94,emissive:.04
  },
  saturn:{
    reference:'08-saturn.jpg',texture:'assets/space3d/2k_saturn.jpg',
    idle:.59,win:1.12,spin:.17,tilt:26.73,grade:'saturn',
    roughness:.95,emissive:.035,
    ring:{kind:'saturn',inner:1.20,outer:2.02,x:-1.03,z:.35,opacity:.88}
  },
  uranus:{
    reference:'09-uranus.jpg',texture:'assets/space3d/2k_uranus.jpg',
    idle:.66,win:1.27,spin:-.14,tilt:-10,grade:'uranus',
    roughness:.91,emissive:.045,
    atmosphere:{color:0x35d4ff,strength:.20,power:2.7,radius:1.025},
    ring:{kind:'uranus',inner:1.13,outer:1.52,x:-1.13,z:.34,opacity:.34}
  },
  neptune:{
    reference:'10-neptune.jpg',texture:'assets/space3d/2k_neptune.jpg',
    idle:.69,win:1.42,spin:.15,tilt:28.32,grade:'neptune',
    roughness:.92,emissive:.055,
    atmosphere:{color:0x347dff,strength:.20,power:2.65,radius:1.026}
  }
};

const textureCache=new Map();
const pendingTexture=new Map();
const loader=new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

function loadImage(url){
  return new Promise((resolve,reject)=>{
    const img=new Image();img.crossOrigin='anonymous';img.decoding='async';
    img.onload=()=>resolve(img);img.onerror=reject;img.src=url;
  });
}

function luma(r,g,b){return .299*r+.587*g+.114*b}
function contrast(v,c){return clamp((v-.5)*c+.5,0,1)}
function wrapDelta(a,b){let d=a-b;if(d>.5)d-=1;if(d<-.5)d+=1;return d}

function gradePixels(id,data,W,H){
  for(let y=0;y<H;y++){
    const v=y/(H-1),lat=Math.abs(v-.5)*2;
    for(let x=0;x<W;x++){
      const u=x/(W-1),i=(y*W+x)*4;
      let r=data[i],g=data[i+1],b=data[i+2],L=luma(r,g,b);

      if(id==='sun'){
        let n=Math.pow(contrast(L/255,1.34),1.03);
        const p0=[88,15,4],p1=[205,50,3],p2=[255,124,12],p3=[255,210,84];
        let a,c,t;
        if(n<.36){a=p0;c=p1;t=n/.36}
        else if(n<.78){a=p1;c=p2;t=(n-.36)/.42}
        else{a=p2;c=p3;t=(n-.78)/.22}
        r=mix(a[0],c[0],t);g=mix(a[1],c[1],t);b=mix(a[2],c[2],t);
      }
      else if(id==='mercury'||id==='moon'){
        const warm=id==='mercury';
        let n=contrast(L/255,id==='mercury'?1.28:1.22);
        n=Math.pow(n,.96);
        const base=warm?[169,158,147]:[176,181,187];
        const low=warm?[52,48,45]:[44,47,52];
        r=mix(low[0],base[0],n);g=mix(low[1],base[1],n);b=mix(low[2],base[2],n);
      }
      else if(id==='venus'){
        const n=contrast(L/255,1.14);
        r=174+95*n;g=92+118*n;b=26+54*n;
      }
      else if(id==='earth'){
        const ocean=(b>r*1.10&&b>g*1.03);
        const green=(g>r*1.03&&g>b*1.06);
        const ice=(L>205&&Math.max(r,g,b)-Math.min(r,g,b)<38);
        const desert=!ocean&&!green&&!ice&&r>g*1.03&&g>b*.92;
        if(ocean){r=r*.72;g=g*1.13+5;b=b*1.24+12}
        else if(green){r=r*.86;g=g*1.25+5;b=b*.82}
        else if(desert){r=r*1.13+7;g=g*1.08+4;b=b*.82}
        else if(ice){r=r*1.04+3;g=g*1.05+4;b=b*1.08+7}
        else{r=(r-128)*1.08+128;g=(g-128)*1.08+128;b=(b-128)*1.08+128}
      }
      else if(id==='mars'){
        const n=contrast(L/255,1.17);
        r=107+151*n;g=39+82*n;b=24+49*n;
      }
      else if(id==='jupiter'){
        const n=L/255;
        const sat=1.16;
        r=(L+(r-L)*sat)*1.07+4;
        g=(L+(g-L)*sat)*1.01;
        b=(L+(b-L)*1.05)*.93;
        const band=Math.sin(v*Math.PI*26)*7;
        r+=band;g+=band*.62;b+=band*.34;
      }
      else if(id==='saturn'){
        const sat=1.08;
        r=(L+(r-L)*sat)*1.07+9;
        g=(L+(g-L)*sat)*1.04+5;
        b=(L+(b-L)*.94)*.91;
      }
      else if(id==='uranus'){
        const broad=.5+.5*Math.cos((v-.5)*Math.PI);
        const w1=Math.sin(v*Math.PI*22+Math.sin(u*Math.PI*4)*1.0);
        const w2=Math.sin(v*Math.PI*39-u*Math.PI*8+Math.sin(u*Math.PI*12)*.42);
        const w3=Math.sin(v*Math.PI*61+u*Math.PI*14);
        const cloud=Math.pow(Math.max(0,w1*.58+w2*.28+w3*.14-.05),1.42);
        const dark=Math.max(0,-(w1*.72+w2*.28)-.20);
        const dx1=wrapDelta(u,.63),dy1=v-.48;
        const dx2=wrapDelta(u,.30),dy2=v-.72;
        const rr1=Math.sqrt(dx1*dx1/.010+dy1*dy1/.008);
        const rr2=Math.sqrt(dx2*dx2/.018+dy2*dy2/.010);
        const a1=Math.atan2(dy1/.090,dx1/.115),a2=Math.atan2(dy2/.105,dx2/.145);
        const vortex1=Math.exp(-rr1*rr1)*(.5+.5*Math.sin(a1*5-rr1*17));
        const vortex2=Math.exp(-rr2*rr2)*(.5+.5*Math.sin(a2*4+rr2*14));
        r=20+broad*28-lat*7;
        g=132+broad*57-lat*12;
        b=194+broad*46-lat*8;
        const white=cloud*48+Math.max(0,vortex1)*39+Math.max(0,vortex2)*30;
        r+=white*.78-dark*10;g+=white*.96-dark*7;b+=white-dark*2;
      }
      else if(id==='neptune'){
        const n=contrast(L/255,1.22);
        const w1=Math.sin(v*Math.PI*17+Math.sin(u*Math.PI*5)*.55);
        const w2=Math.sin(v*Math.PI*31-u*Math.PI*7);
        const band=Math.max(0,w1*.7+w2*.3-.30);
        const dx=wrapDelta(u,.66),dy=v-.54;
        const storm=Math.exp(-(dx*dx/.010+dy*dy/.006));
        r=20+46*n+band*18+storm*26;
        g=61+71*n+band*29+storm*35;
        b=156+87*n+band*36+storm*41;
      }

      data[i]=byte(r);data[i+1]=byte(g);data[i+2]=byte(b);
    }
  }
}

function sealSeam(data,W,H,band=16){
  band=Math.max(6,Math.min(band,Math.floor(W*.025)));
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

function makeFallbackMoon(){
  const c=document.createElement('canvas');c.width=2048;c.height=1024;
  const x=c.getContext('2d',{alpha:false});
  x.fillStyle='#8e9296';x.fillRect(0,0,c.width,c.height);
  let s=0x4d4f4f4e;const R=()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  for(let i=0;i<900;i++){
    const cx=R()*c.width,cy=R()*c.height,rad=2+R()*28;
    const g=x.createRadialGradient(cx-rad*.2,cy-rad*.2,0,cx,cy,rad);
    g.addColorStop(0,'rgba(45,48,52,.58)');g.addColorStop(.65,'rgba(110,113,116,.34)');g.addColorStop(1,'rgba(220,220,216,0)');
    x.fillStyle=g;x.fillRect(cx-rad,cy-rad,rad*2,rad*2);
  }
  return c;
}

async function processedTexture(item){
  if(textureCache.has(item.id))return textureCache.get(item.id);
  if(pendingTexture.has(item.id))return pendingTexture.get(item.id);
  const p=(async()=>{
    const cfg=PROFILE[item.id];
    let canvas;
    if(item.id==='moon'){
      // Fully local procedural 2:1 globe: no external dependency, no front-image projection,
      // no tainted canvas and no fake backside.
      canvas=makeFallbackMoon();
    }else{
      canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
      const x=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
      const img=await loadImage(cfg.texture);x.drawImage(img,0,0,canvas.width,canvas.height);
    }
    const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
    const im=ctx.getImageData(0,0,canvas.width,canvas.height);
    gradePixels(item.id,im.data,canvas.width,canvas.height);
    sealSeam(im.data,canvas.width,canvas.height,16);
    ctx.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(canvas);
    t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
    t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
    t.anisotropy=12;t.needsUpdate=true;
    textureCache.set(item.id,t);pendingTexture.delete(item.id);return t;
  })().catch(e=>{pendingTexture.delete(item.id);throw e});
  pendingTexture.set(item.id,p);return p;
}

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,20,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,.92)');g.addColorStop(.18,'rgba(255,235,170,.78)');
  g.addColorStop(.50,'rgba(110,160,255,.20)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const GLOW=glowTexture();

function haloTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,46,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.70,'rgba(255,255,255,0)');
  g.addColorStop(.80,'rgba(255,255,255,.18)');g.addColorStop(.87,'rgba(255,255,255,.92)');
  g.addColorStop(.95,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);
}
const HALO=haloTexture();

function atmosphereMesh(cfg){
  const mat=new THREE.ShaderMaterial({
    transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{glow:{value:new THREE.Color(cfg.color)},strength:{value:cfg.strength},rimPower:{value:cfg.power}},
    vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform vec3 glow;uniform float strength;uniform float rimPower;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-max(dot(vN,V),0.0),rimPower);gl_FragColor=vec4(glow,rim*strength);}'
  });
  return new THREE.Mesh(new THREE.SphereGeometry(cfg.radius||1.03,72,48),mat);
}

function saturnRing(){
  const tex=loader.load('assets/space3d/2k_saturn_ring_alpha.png');
  tex.colorSpace=THREE.SRGBColorSpace;
  const geo=new THREE.RingGeometry(1.20,2.02,180);
  const pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<pos.count;i++){
    const r=Math.hypot(pos.getX(i),pos.getY(i));
    uv.setXY(i,clamp((r-1.20)/(.82),0,1),.5);
  }
  const mat=new THREE.MeshBasicMaterial({map:tex,alphaMap:tex,color:0xfff1d1,side:THREE.DoubleSide,transparent:true,opacity:.90,alphaTest:.018,depthWrite:true});
  return new THREE.Mesh(geo,mat);
}

function uranusRing(){
  const g=new THREE.Group();
  const specs=[
    [1.15,1.19,.24,0x69c9e8],[1.22,1.25,.35,0xc4f2ff],[1.29,1.315,.22,0x7bd7f2],
    [1.38,1.405,.30,0xd9f7ff],[1.47,1.49,.20,0x70c7e4]
  ];
  specs.forEach(([a,b,o,c])=>{
    const m=new THREE.Mesh(new THREE.RingGeometry(a,b,180),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    g.add(m);
  });
  return g;
}

async function buildPlanet(item){
  const cfg=PROFILE[item.id];
  const tex=await processedTexture(item);
  const root=new THREE.Group();root.userData.item=item;root.userData.pickable=true;
  const geo=new THREE.SphereGeometry(1,96,64);
  const mat=cfg.basic
    ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff})
    : new THREE.MeshStandardMaterial({
        map:tex,color:0xffffff,roughness:cfg.roughness??.96,metalness:0,
        emissive:cfg.emissive?0xffffff:0x000000,emissiveMap:cfg.emissive?tex:null,emissiveIntensity:cfg.emissive||0
      });
  const surface=new THREE.Mesh(geo,mat);
  surface.rotation.z=THREE.MathUtils.degToRad(cfg.tilt||0);
  surface.userData.parentPick=root;root.add(surface);root.userData.surface=surface;

  if(cfg.clouds){
    const cloudTex=loader.load(cfg.clouds.texture);
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.014,96,64),new THREE.MeshStandardMaterial({
      color:0xffffff,alphaMap:cloudTex,transparent:true,opacity:cfg.clouds.opacity,depthWrite:false,roughness:1,metalness:0,
      emissive:0xffffff,emissiveIntensity:.10
    }));
    clouds.rotation.copy(surface.rotation);clouds.userData.parentPick=root;root.add(clouds);root.userData.clouds=clouds;
  }
  if(cfg.atmosphere){
    const atm=atmosphereMesh(cfg.atmosphere);atm.rotation.copy(surface.rotation);root.add(atm);
  }
  if(cfg.ring){
    const ring=cfg.ring.kind==='saturn'?saturnRing():uranusRing();
    ring.rotation.set(cfg.ring.x,0,cfg.ring.z);ring.userData.baseX=cfg.ring.x;root.add(ring);root.userData.ring=ring;
  }
  if(cfg.glow){
    const mat=new THREE.SpriteMaterial({map:GLOW,color:cfg.glow.color,transparent:true,opacity:cfg.glow.opacity,depthWrite:false,blending:THREE.AdditiveBlending});
    mat.toneMapped=false;
    const sp=new THREE.Sprite(mat);sp.scale.set(cfg.glow.scale,cfg.glow.scale,1);root.add(sp);root.userData.sunGlow=sp;
  }

  root.scale.setScalar(cfg.idle);
  root.userData.baseScale=cfg.idle;
  root.userData.winScale=cfg.win;
  root.userData.spin=cfg.spin;
  return root;
}

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
renderer.domElement.className='v2-canvas';stage.insertBefore(renderer.domElement,stage.firstChild);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(47,1,.1,80);camera.position.set(0,.10,9.25);
scene.add(new THREE.HemisphereLight(0xc2d9ff,0x101426,.92));
scene.add(new THREE.AmbientLight(0x6478a6,.42));
const key=new THREE.DirectionalLight(0xffffff,3.35);key.position.set(-4.4,5.2,7);scene.add(key);
const fill=new THREE.DirectionalLight(0xc7dcff,1.72);fill.position.set(4.8,1.7,6.2);scene.add(fill);
const rim=new THREE.DirectionalLight(0x6d86ff,.78);rim.position.set(5,-2,2);scene.add(rim);

function starField(){
  const count=1600,p=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,rad=rand(8,20);
    p[i*3]=Math.cos(a)*rad;p[i*3+1]=rand(-11,11);p[i*3+2]=rand(-15,2);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.PointsMaterial({color:0xe9f3ff,size:.047,transparent:true,opacity:.90,depthWrite:false,blending:THREE.AdditiveBlending});
  const pts=new THREE.Points(g,m);scene.add(pts);return pts;
}
const stars3d=starField();

function resize(){
  const w=Math.max(2,stage.clientWidth),h=Math.max(2,stage.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();

const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
let groups=[],pickables=[],target=null,locked=true,transition=null,win=null,wrong=null,roundToken=0;
let last=performance.now(),recent=[];

function slots(){
  const portrait=stage.clientWidth/Math.max(1,stage.clientHeight)<.72;
  return portrait
    ? [new THREE.Vector3(0,1.20,.05),new THREE.Vector3(-.92,-1.16,.14),new THREE.Vector3(.92,-1.16,.02)]
    : [new THREE.Vector3(-1.55,.05,.06),new THREE.Vector3(0,.05,.14),new THREE.Vector3(1.55,.05,.02)];
}

function disposeGroup(g){
  scene.remove(g);
  g.traverse(o=>{
    o.geometry?.dispose?.();
    if(o.material){
      const ms=Array.isArray(o.material)?o.material:[o.material];
      ms.forEach(m=>m.dispose?.());
    }
  });
}

function clearRound(){
  groups.forEach(disposeGroup);groups=[];pickables=[];win=null;wrong=null;transition=null;
}

function setOpacity(g,a){
  a=clamp(a,0,1);g.userData.opacity=a;
  g.traverse(o=>{
    if(!o.material||o.material.isShaderMaterial)return;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    ms.forEach(m=>{
      if(!m.userData.v2fade){
        m.userData.v2fade=true;m.userData.baseOpacity=Number.isFinite(m.opacity)?m.opacity:1;
        m.userData.baseTransparent=!!m.transparent;m.userData.baseDepthWrite=m.depthWrite!==false;
      }
      m.opacity=m.userData.baseOpacity*a;
      m.transparent=a<.999?true:m.userData.baseTransparent;
      m.depthWrite=a<.999?false:m.userData.baseDepthWrite;m.needsUpdate=true;
    });
  });
  g.visible=a>.005;
}

function makeHalo(g,color){
  const mat=new THREE.SpriteMaterial({map:HALO,color,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
  mat.toneMapped=false;
  const sp=new THREE.Sprite(mat);sp.scale.set(2.65,2.65,1);sp.renderOrder=80;g.add(sp);
  return {sprite:sp,mat};
}

function speak(text){
  try{
    if(!('speechSynthesis'in window))return;
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='hy-AM';u.rate=.86;u.pitch=1.02;speechSynthesis.speak(u);
  }catch{}
}

function reward(){
  stars++;localStorage.setItem(STAR_KEY,String(stars));starsEl.textContent=String(stars);
  const d=document.createElement('div');d.className='v2-reward';d.textContent='⭐ +1';stage.appendChild(d);setTimeout(()=>d.remove(),1100);
}

function nextTarget(){
  let pool=PLANETS.filter(x=>!recent.includes(x.id));
  if(pool.length<3)pool=PLANETS;
  const t=pool[Math.floor(Math.random()*pool.length)];
  recent=[t.id,...recent].slice(0,5);return t;
}

async function buildRound(){
  const token=++roundToken;clearRound();locked=true;stage.classList.remove('is-win');
  target=nextTarget();
  const decoys=shuffle(PLANETS.filter(x=>x.id!==target.id)).slice(0,2);
  const options=shuffle([target,...decoys]),spot=shuffle(slots());
  promptEl.textContent='Գտի՛ր՝ '+target.find;
  loadingEl.classList.remove('hide');
  let built;
  try{built=await Promise.all(options.map(buildPlanet))}
  catch(e){
    console.error(e);loadingEl.textContent='Չհաջողվեց բեռնել texture-ը։ Նորից փորձում եմ…';
    if(token===roundToken)setTimeout(buildRound,700);return;
  }
  if(token!==roundToken){built.forEach(disposeGroup);return}
  loadingEl.classList.add('hide');

  const now=performance.now();
  built.forEach((g,i)=>{
    g.userData.basePos=spot[i].clone();g.position.copy(spot[i]);
    g.userData.enterPos=spot[i].clone().add(new THREE.Vector3(spot[i].x===0?0:Math.sign(spot[i].x)*.22,spot[i].y>0?.16:-.12,-.90));
    g.userData.enterScale=g.scale.clone().multiplyScalar(.64);
    g.position.copy(g.userData.enterPos);g.scale.copy(g.userData.enterScale);setOpacity(g,0);
    scene.add(g);groups.push(g);pickables.push(g.userData.surface);
  });
  transition={type:'enter',start:now,duration:760};
}

function easeOut(q){q=clamp(q,0,1);return 1-Math.pow(1-q,3)}
function easeInOut(q){q=clamp(q,0,1);return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2}

function beginExit(){
  if(transition?.type==='exit')return;
  const now=performance.now();locked=true;stage.classList.remove('is-win');
  groups.forEach((g,i)=>{
    g.userData.exitPos=g.position.clone();g.userData.exitScale=g.scale.clone();g.userData.exitOpacity=g.userData.opacity??1;
    const dir=Math.sign(g.position.x||((i-1)||1));
    g.userData.exitTo=g.position.clone().add(new THREE.Vector3(dir*.42,(i-1)*.05,-1.05));
    g.userData.exitToScale=g.scale.clone().multiplyScalar(.70);
  });
  transition={type:'exit',start:now,duration:650};
}

function choose(g){
  if(locked||transition)return;
  if(g.userData.item.id!==target.id){
    if(wrong?.halo){wrong.halo.sprite.removeFromParent();wrong.halo.mat.dispose()}
    wrong={g,start:performance.now(),origin:g.position.clone(),halo:makeHalo(g,0xff4054)};
    return;
  }

  locked=true;score++;scoreEl.textContent=String(score);
  promptEl.textContent='Ճիշտ է՝ '+g.userData.item.name;stage.classList.add('is-win');
  speak(g.userData.item.name);
  if(score%5===0)reward();

  const now=performance.now();
  groups.forEach((x,i)=>{
    x.userData.win=x===g;x.userData.winFromPos=x.position.clone();x.userData.winFromScale=x.scale.clone();x.userData.winFromOpacity=x.userData.opacity??1;
    if(x===g){
      x.userData.winToPos=new THREE.Vector3(0,.02,1.48);
      x.userData.winToScale=new THREE.Vector3(1,1,1).multiplyScalar(PROFILE[x.userData.item.id].win);
      x.userData.winHalo=makeHalo(x,0x4df37b);
    }else{
      const dir=Math.sign(x.position.x||((i-1)||1));
      x.userData.winToPos=x.position.clone().add(new THREE.Vector3(dir*.50,0,-.76));
      x.userData.winToScale=x.scale.clone().multiplyScalar(.72);
    }
  });
  win={start:now,g};
  setTimeout(()=>{if(win?.g===g)beginExit()},1850);
}

renderer.domElement.addEventListener('pointerup',e=>{
  if(locked||transition)return;
  const r=renderer.domElement.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;
  ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(pickables,false)[0];if(!hit)return;
  let g=hit.object.userData.parentPick;while(g&&!g.userData.pickable)g=g.parent;
  if(g)choose(g);
});

function loop(t){
  const dt=Math.min(.04,(t-last)/1000);last=t;
  stars3d.rotation.y+=dt*.002;
  camera.position.x=Math.sin(t*.00017)*.028;
  camera.position.y=.10+Math.cos(t*.00015)*.020;
  camera.position.z+=(((win&&!transition)?8.55:9.25)-camera.position.z)*.045;
  camera.lookAt(0,-.06,0);

  let enterDone=true,exitDone=true;
  groups.forEach((g,i)=>{
    const cfg=PROFILE[g.userData.item.id];
    if(g.userData.surface)g.userData.surface.rotation.y+=dt*cfg.spin*(g.userData.win?2.0:1);
    if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*cfg.clouds.spin;

    if(wrong?.g===g){
      const q=(t-wrong.start)/620;
      if(q<1){
        const e=easeOut(q);g.position.x=wrong.origin.x+Math.sin(q*Math.PI*4.5)*(1-e)*.13;
        const pulse=Math.max(0,Math.sin(Math.PI*q));wrong.halo.mat.opacity=.42*pulse;
      }else{
        g.position.copy(wrong.origin);wrong.halo.sprite.removeFromParent();wrong.halo.mat.dispose();wrong=null;
      }
    }

    if(transition?.type==='enter'){
      const stagger=i*60,q=clamp((t-transition.start-stagger)/(transition.duration-stagger),0,1),e=easeOut(q);
      g.position.lerpVectors(g.userData.enterPos,g.userData.basePos,e);
      const final=new THREE.Vector3(1,1,1).multiplyScalar(PROFILE[g.userData.item.id].idle);
      g.scale.lerpVectors(g.userData.enterScale,final,e);setOpacity(g,e);
      if(q<1)enterDone=false;
    }else if(transition?.type==='exit'){
      const q=clamp((t-transition.start)/transition.duration,0,1),e=easeInOut(q);
      g.position.lerpVectors(g.userData.exitPos,g.userData.exitTo,e);
      g.scale.lerpVectors(g.userData.exitScale,g.userData.exitToScale,e);setOpacity(g,g.userData.exitOpacity*(1-e));
      if(q<1)exitDone=false;
    }else if(win){
      const q=clamp((t-win.start)/820,0,1),e=easeOut(q);
      g.position.lerpVectors(g.userData.winFromPos,g.userData.winToPos,e);
      g.scale.lerpVectors(g.userData.winFromScale,g.userData.winToScale,e);
      if(g.userData.win){
        const h=g.userData.winHalo;
        if(h){const flash=q<1?Math.sin(Math.PI*q):0;h.mat.opacity=.28*flash}
      }else setOpacity(g,1-e*.72);
    }
  });

  if(transition?.type==='enter'&&enterDone){transition=null;locked=false}
  if(transition?.type==='exit'&&exitDone){transition=null;win=null;buildRound()}
  renderer.render(scene,camera);requestAnimationFrame(loop);
}

buildRound();
requestAnimationFrame(loop);
