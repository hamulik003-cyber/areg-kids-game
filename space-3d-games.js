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
function reward(host,ctx){
  ctx.awardStar();
  const d=document.createElement('div');d.className='s3d-reward';d.textContent='⭐ +1';host.appendChild(d);setTimeout(()=>d.remove(),1100);
}
function canvasTexture(item){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,512,256);g.addColorStop(0,item.c1||'#7397c8');g.addColorStop(1,item.c2||'#263a67');x.fillStyle=g;x.fillRect(0,0,512,256);
  const kind=item.kind;
  if(kind==='bands'||kind==='saturn'){
    for(let y=0;y<256;y+=18){x.fillStyle=`rgba(255,245,220,${.05+(y%54===0?.13:.04)})`;x.fillRect(0,y,512,8)}
  }else if(kind==='earth'){
    x.fillStyle='rgba(72,168,92,.92)';
    for(let i=0;i<20;i++){x.beginPath();x.ellipse(rand(0,512),rand(30,220),rand(18,68),rand(8,30),rand(-1,1),0,Math.PI*2);x.fill()}
    x.fillStyle='rgba(255,255,255,.26)';for(let i=0;i<12;i++)x.fillRect(rand(0,450),rand(0,245),rand(35,100),rand(2,6));
  }else if(kind==='spots'||kind==='rock'||kind==='ice'||kind==='pluto'){
    for(let i=0;i<44;i++){const r=rand(4,22);x.beginPath();x.arc(rand(0,512),rand(0,256),r,0,Math.PI*2);x.fillStyle=`rgba(20,20,24,${rand(.04,.22)})`;x.fill()}
  }else if(kind==='cracks'){
    x.strokeStyle='rgba(80,100,120,.45)';x.lineWidth=3;for(let i=0;i<18;i++){x.beginPath();let px=rand(0,512),py=rand(0,256);x.moveTo(px,py);for(let k=0;k<4;k++){px+=rand(-40,40);py+=rand(8,35);x.lineTo(px,py)}x.stroke()}
  }else if(kind==='sun'){
    for(let i=0;i<120;i++){x.fillStyle=`rgba(255,255,180,${rand(.03,.18)})`;x.beginPath();x.arc(rand(0,512),rand(0,256),rand(2,18),0,Math.PI*2);x.fill()}
  }else if(kind==='cloud'||kind==='haze'){
    for(let i=0;i<18;i++){x.fillStyle='rgba(255,242,210,.08)';x.fillRect(0,rand(0,250),512,rand(3,12))}
  }
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=THREE.RepeatWrapping;t.anisotropy=4;return t;
}
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.16,'rgba(160,210,255,.95)');g.addColorStop(.45,'rgba(90,120,255,.35)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);
}
const GLOW=glowTexture();
const REAL_TEX={
  sun:'2k_sun.jpg',mercury:'2k_mercury.jpg',venus:'2k_venus_surface.jpg',earth:'2k_earth_daymap.jpg',
  moon:'2k_moon.jpg',mars:'2k_mars.jpg',jupiter:'2k_jupiter.jpg',saturn:'2k_saturn.jpg',
  uranus:'2k_uranus.jpg',neptune:'2k_neptune.jpg',stars:'2k_stars_milky_way.jpg',
  earthClouds:'2k_earth_clouds.jpg',saturnRing:'2k_saturn_ring_alpha.png'
};
const REAL_CFG={
  sun:{r:1.08,tilt:7.25,spin:.055},mercury:{r:.68,tilt:.03,spin:.12},venus:{r:.88,tilt:177.4,spin:-.055},
  earth:{r:.94,tilt:23.44,spin:.15},moon:{r:.66,tilt:6.68,spin:.10},mars:{r:.78,tilt:25.19,spin:.14},
  jupiter:{r:1.15,tilt:3.13,spin:.21},saturn:{r:1.03,tilt:26.73,spin:.18},uranus:{r:.91,tilt:97.77,spin:-.15},
  neptune:{r:.92,tilt:28.32,spin:.16}
};
const REAL_PATH='./assets/space3d/';
const realLoader=new THREE.TextureLoader();
function loadRealTexture(key,color=true){
  const file=REAL_TEX[key];if(!file)return Promise.resolve(null);
  return new Promise((resolve,reject)=>realLoader.load(REAL_PATH+file,t=>{if(color)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;resolve(t)},undefined,reject));
}
function atmosphereMaterial(color=0x5ca8ff){
  return new THREE.ShaderMaterial({
    side:THREE.BackSide,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{c:{value:new THREE.Color(color)}},
    vertexShader:'varying vec3 n;varying vec3 v;void main(){n=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.);v=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform vec3 c;varying vec3 n;varying vec3 v;void main(){float f=pow(1.0-max(0.0,dot(n,v)),2.8);gl_FragColor=vec4(c,f*.72);}'
  });
}
function texturedRing(inner,outer,tex){
  const geo=new THREE.RingGeometry(inner,outer,144,1),pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i),r=Math.sqrt(x*x+y*y);uv.setXY(i,clamp((r-inner)/(outer-inner),0,1),.5)}
  uv.needsUpdate=true;
  const mat=new THREE.MeshBasicMaterial({map:tex,alphaMap:tex,transparent:true,opacity:.96,side:THREE.DoubleSide,depthWrite:false});
  const m=new THREE.Mesh(geo,mat);m.rotation.x=Math.PI/2;return {m,geo,mat};
}

function starField(scene,count=420){
  const p=new Float32Array(count*3);
  for(let i=0;i<count;i++){p[i*3]=rand(-18,18);p[i*3+1]=rand(-10,10);p[i*3+2]=rand(-18,3)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.PointsMaterial({color:0xd9e9ff,size:.055,transparent:true,opacity:.9,depthWrite:false});
  const pts=new THREE.Points(g,m);scene.add(pts);return pts;
}
function nebula(scene){
  const colors=[0x3f2a91,0x173b9a,0x7b1c88];
  for(let i=0;i<4;i++){
    const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:colors[i%colors.length],transparent:true,opacity:.12,depthWrite:false,blending:THREE.AdditiveBlending}));
    s.position.set(rand(-8,8),rand(-5,5),-10-rand(0,6));s.scale.set(rand(8,14),rand(5,10),1);scene.add(s);
  }
}
function ringMesh(color=0xdacb9a,inner=1.25,outer=2.0){
  const geo=new THREE.RingGeometry(inner,outer,96);
  const mat=new THREE.MeshStandardMaterial({color,side:THREE.DoubleSide,transparent:true,opacity:.88,roughness:.55,metalness:.05});
  const m=new THREE.Mesh(geo,mat);m.rotation.x=Math.PI/2.25;return m;
}
async function spherePlanet(item){
  const cfg=REAL_CFG[item.id]||{r:1,tilt:0,spin:.15};
  const grp=new THREE.Group();grp.userData.item=item;grp.userData.pickable=true;grp.userData.spin=cfg.spin;grp.rotation.z=THREE.MathUtils.degToRad(cfg.tilt);
  const tex=await loadRealTexture(item.id);
  if(!tex){
    const geo=new THREE.SphereGeometry(cfg.r,64,40),mat=new THREE.MeshStandardMaterial({map:canvasTexture(item),roughness:.82,metalness:0});
    const mesh=new THREE.Mesh(geo,mat);mesh.userData.parentPick=grp;grp.add(mesh);grp.userData.resources=[geo,mat,mat.map];return grp;
  }
  const geo=new THREE.SphereGeometry(cfg.r,72,48);
  const mat=item.id==='sun'
    ?new THREE.MeshBasicMaterial({map:tex,color:0xffffff})
    :new THREE.MeshStandardMaterial({map:tex,color:0xffffff,roughness:.96,metalness:0});
  const mesh=new THREE.Mesh(geo,mat);mesh.userData.parentPick=grp;grp.add(mesh);
  grp.userData.resources=[geo,mat,tex];

  if(item.id==='earth'){
    try{
      const cloudTex=await loadRealTexture('earthClouds',false);
      const cgeo=new THREE.SphereGeometry(cfg.r*1.014,72,48);
      const cmat=new THREE.MeshStandardMaterial({map:cloudTex,alphaMap:cloudTex,transparent:true,opacity:.48,depthWrite:false,roughness:1,metalness:0});
      const clouds=new THREE.Mesh(cgeo,cmat);clouds.userData.parentPick=grp;grp.add(clouds);grp.userData.clouds=clouds;grp.userData.resources.push(cgeo,cmat,cloudTex);
      const ageo=new THREE.SphereGeometry(cfg.r*1.06,64,40),amat=atmosphereMaterial(0x5b9fff),atm=new THREE.Mesh(ageo,amat);grp.add(atm);grp.userData.resources.push(ageo,amat)
    }catch{}
  }
  if(item.id==='sun'){
    const ageo=new THREE.SphereGeometry(cfg.r*1.055,64,40),amat=atmosphereMaterial(0xff8a29),atm=new THREE.Mesh(ageo,amat);grp.add(atm);grp.userData.resources.push(ageo,amat)
  }
  if(item.id==='saturn'){
    try{const rt=await loadRealTexture('saturnRing',false);const ring=texturedRing(cfg.r*1.22,cfg.r*2.28,rt);ring.m.userData.parentPick=grp;grp.add(ring.m);grp.userData.resources.push(ring.geo,ring.mat,rt)}catch{}
  }
  if(item.id==='uranus'){
    const rgeo=new THREE.RingGeometry(cfg.r*1.32,cfg.r*1.62,128),rmat=new THREE.MeshBasicMaterial({color:0x9cc9d2,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false});
    const ring=new THREE.Mesh(rgeo,rmat);ring.rotation.x=Math.PI/2;ring.userData.parentPick=grp;grp.add(ring);grp.userData.resources.push(rgeo,rmat)
  }
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
async function buildObject(item){
  if(REAL_TEX[item.id])return spherePlanet(item);
  if(item.id==='black-hole')return blackHole(item);
  if(item.id==='milky-way')return galaxy(item);
  if(item.id==='solar-system')return solarSystem(item);
  return spherePlanet(item);
}
function disposeObject(o){
  o.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){const ms=Array.isArray(x.material)?x.material:[x.material];ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});
}
function rendererFor(host){
  const r=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  r.setPixelRatio(Math.min(devicePixelRatio||1,1.45));r.outputColorSpace=THREE.SRGBColorSpace;
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
function gameSpaceSearch(ctx){
  ctx.activityContent.innerHTML='';ctx.menuMusic.pause();
  const root=document.createElement('div');root.className='s3d-root';ctx.activityContent.appendChild(root);
  const hud=createHud(root,'ՏԻԵԶԵՐԱԿԱՆ ՈՐՈՆՈՒՄ');
  const renderer=rendererFor(root),scene=new THREE.Scene();scene.background=new THREE.Color(0x010207);
  const camera=new THREE.PerspectiveCamera(46,1,.1,80);camera.position.set(0,.25,8.2);
  scene.add(new THREE.HemisphereLight(0x7896c8,0x020308,.18));
  const key=new THREE.DirectionalLight(0xffffff,4.15);key.position.set(-4.5,5.5,7);scene.add(key);
  const rim=new THREE.DirectionalLight(0x496dff,.34);rim.position.set(5,-2,2);scene.add(rim);
  const stars=starField(scene,420);
  let bgTex=null,bgMesh=null;
  loadRealTexture('stars').then(t=>{if(disposed){t?.dispose?.();return}bgTex=t;const g=new THREE.SphereGeometry(46,48,32),m=new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide});bgMesh=new THREE.Mesh(g,m);scene.add(bgMesh)}).catch(()=>{});
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2(),pickables=[];
  const pool=ctx.PLANETS.filter(x=>REAL_TEX[x.id]);
  const next=bag(pool);let groups=[],target=null,score=0,locked=false,disposed=false,last=performance.now(),wrong=null,winStart=0,timer=0,recent=[];
  const slots=[new THREE.Vector3(-2.45,.72,0),new THREE.Vector3(0,-1.35,.25),new THREE.Vector3(2.45,.72,-.15)];
  function decoys(t){let p=shuffle(pool.filter(x=>x.id!==t.id&&!recent.includes(x.id)));if(p.length<2)p=shuffle(pool.filter(x=>x.id!==t.id));return p.slice(0,2)}
  function clear(){groups.forEach(g=>{scene.remove(g);disposeObject(g)});groups=[];pickables.length=0}
  async function round(){
    clear();locked=true;winStart=0;wrong=null;target=next();const opts=shuffle([target,...decoys(target)]),ss=shuffle(slots);
    recent=[...new Set(opts.map(x=>x.id).concat(recent))].slice(0,7);
    hud.prompt.textContent='Գտի՛ր՝ '+target.name;
    const built=await Promise.all(opts.map(it=>buildObject(it));
    if(disposed){built.forEach(disposeObject);return}
    built.forEach((g,i)=>{g.position.copy(ss[i]);g.scale.setScalar(.9);g.rotation.x=rand(-.05,.05);scene.add(g);groups.push(g);g.traverse(x=>{if(x.isMesh||x.isPoints)pickables.push(x)})});
    locked=false;voice('Գտի՛ր '+target.name,ctx);
  }
  function pointer(e){
    if(locked)return;const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;ray.setFromCamera(mouse,camera);
    const hit=ray.intersectObjects(pickables,false)[0];if(!hit)return;let g=hit.object.userData.parentPick||hit.object.parent;while(g&&!g.userData?.pickable)g=g.parent;if(!g)return;
    if(g.userData.item.id!==target.id){wrong={g,start:performance.now(),x:g.position.x};return}
    locked=true;winStart=performance.now();score++;hud.score.textContent=String(score);hud.prompt.textContent=g.userData.item.name;voice(g.userData.item.name,ctx);if(score%5===0)reward(root,ctx);
    groups.forEach(x=>{x.userData.win=x===g});
    timer=setTimeout(()=>{if(!disposed)round()},1750);
  }
  renderer.domElement.addEventListener('pointerup',pointer);
  function loop(t){
    if(disposed)return;const dt=Math.min(.04,(t-last)/1000);last=t;stars.rotation.y+=dt*.008;stars.rotation.x=Math.sin(t*.00008)*.02;
    groups.forEach((g,i)=>{
      g.rotation.y+=dt*(g.userData.spin||.18);if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*.07;
      if(wrong?.g===g){const q=(t-wrong.start)/420;if(q<1)g.position.x=wrong.x+Math.sin(q*Math.PI*5)*(1-q)*.18;else{g.position.x=wrong.x;wrong=null}}
      if(winStart){const q=clamp((t-winStart)/900,0,1);if(g.userData.win){g.position.lerp(new THREE.Vector3(0,.2,2.0),.08);g.scale.lerp(new THREE.Vector3(1.5,1.5,1.5),.08);g.rotation.y+=dt*2.2}else g.scale.lerp(new THREE.Vector3(.28,.28,.28),.08)}
    });
    resize(renderer,camera,root);renderer.render(scene,camera);requestAnimationFrame(loop);
  }
  round();requestAnimationFrame(loop);
  ctx.gameCleanup.push(()=>{disposed=true;clearTimeout(timer);try{speechSynthesis.cancel()}catch{};renderer.domElement.removeEventListener('pointerup',pointer);clear();if(bgMesh){scene.remove(bgMesh);bgMesh.geometry.dispose();bgMesh.material.dispose()}bgTex?.dispose?.();renderer.dispose();renderer.forceContextLoss?.();if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio()});
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
