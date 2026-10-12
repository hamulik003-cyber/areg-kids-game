// V291 REVISED single-take car reward (user visual feedback 2026-10-12).
// The ORIGINAL reward emoji stays visible at both ends. One continuous WebGL
// camera move reveals a matching round red compact car, follows it from behind,
// returns to the original side angle, then the SAME picture and card fly home.
// No wallet/storage writes; only the already-unlocked car invokes this module.
let active=false;
const ease=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v)};
const mix=(a,b,t)=>a+(b-a)*t;
const CSS=[
'.areg-car-pilot{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;isolation:isolate;touch-action:none}',
'.areg-car-pilot-shade{position:absolute;inset:0;background:rgba(14,21,43,.75);backdrop-filter:blur(4px);opacity:0;transition:opacity .62s ease}',
'.areg-car-pilot[data-visible="1"] .areg-car-pilot-shade{opacity:1}',
'.areg-car-pilot[data-leaving="1"] .areg-car-pilot-shade{opacity:0}',
'.areg-car-pilot-card{position:relative;overflow:hidden;width:min(90vw,520px);height:min(57dvh,440px);min-height:270px;border:5px solid #ffe5a0;border-radius:30px;background:#b9def3;box-shadow:0 20px 65px #06102577,inset 0 0 0 2px #fff8df75;transform-origin:50% 50%;will-change:transform;contain:layout paint}',
'.areg-car-pilot-stage{position:absolute;inset:0 0 58px;overflow:hidden;background:linear-gradient(#b9def2 0%,#e9f1e0 73%,#a8cb89 74%);display:grid;place-items:center}',
'.areg-car-pilot-stage canvas{position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .8s ease;pointer-events:none}',
'.areg-car-pilot-original{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:clamp(92px,24vw,142px);filter:drop-shadow(0 12px 9px #30485455);opacity:1;transition:opacity .8s ease;pointer-events:none}',
'.areg-car-pilot-stage[data-live="1"] canvas{opacity:1}',
'.areg-car-pilot-stage[data-live="1"] .areg-car-pilot-original{opacity:0}',
'.areg-car-pilot-title{position:absolute;left:0;right:0;bottom:0;height:58px;background:linear-gradient(#ffe0a4,#eab375);border-top:3px solid #bd8650;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:900;color:#61361e}',
'.areg-car-pilot-exit{position:absolute;right:12px;top:12px;z-index:4;width:44px;height:44px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff0bd;background:#60452edb;color:white;font-size:27px;cursor:pointer}',
'@media(prefers-reduced-motion:reduce){.areg-car-pilot-shade,.areg-car-pilot-stage canvas,.areg-car-pilot-original{transition-duration:.01s}}'
].join('\n');

function addMesh(T, parent, geo, mat, pos, scale){
 const m=new T.Mesh(geo,mat);if(pos)m.position.set(...pos);if(scale)m.scale.set(...scale);parent.add(m);return m;
}
function sphere(T,p,m,pos,size,segments=22){
 return addMesh(T,p,new T.SphereGeometry(1,segments,12),m,pos,size);
}
function box(T,p,m,size,pos){
 return addMesh(T,p,new T.BoxGeometry(...size),m,pos);
}
function shapeExtrude(T,p,outline,mat,depth,rotationY,xOffset){
 const s=new T.Shape();
 outline(s);
 const geo=new T.ExtrudeGeometry(s,{depth,bevelEnabled:true,bevelThickness:.06,bevelSize:.06,bevelSegments:3,steps:1,curveSegments:12});
 geo.rotateY(rotationY);
 return addMesh(T,p,geo,mat,[xOffset,0,0]);
}
function makeCar(T){
 const root=new T.Group();
 // Same car language as the reward image: short rounded RED hatchback, no boxy truck silhouette.
 const red=new T.MeshStandardMaterial({color:0xf03635,roughness:.37,metalness:.07});
 const roofRed=new T.MeshStandardMaterial({color:0xfa4b43,roughness:.36,metalness:.06});
 const glass=new T.MeshStandardMaterial({color:0x5fb4d2,roughness:.24,metalness:.12,side:T.DoubleSide});
 const trim=new T.MeshStandardMaterial({color:0x293845,roughness:.77});
 const metal=new T.MeshStandardMaterial({color:0xd9e2e5,metalness:.27,roughness:.4});
 const tireMat=new T.MeshStandardMaterial({color:0x262b32,roughness:.96});
 const rimMat=new T.MeshStandardMaterial({color:0xd2d9d7,roughness:.32,metalness:.23});
 const redLamp=new T.MeshStandardMaterial({color:0xed554c,emissive:0x7b2018,emissiveIntensity:.18});
 // Side-profile custom extrusion yields real 3D beveled curves.
 shapeExtrude(T,root,s=>{
   s.moveTo(-1.48,.54);s.quadraticCurveTo(-1.68,.58,-1.65,.88);
   s.lineTo(-1.33,1.17);s.quadraticCurveTo(-.3,1.29,.93,1.19);
   s.lineTo(1.42,1.05);s.quadraticCurveTo(1.64,.88,1.53,.58);
   s.quadraticCurveTo(.35,.38,-1.48,.54);
 },red,1.52,Math.PI/2,-.76);
 // Rounded tall bubble roof, not a rectangular SUV.
 shapeExtrude(T,root,s=>{
   s.moveTo(-1.18,1.12);s.lineTo(-.99,1.60);
   s.quadraticCurveTo(-.78,1.91,-.35,1.94);
   s.lineTo(.30,1.94);s.quadraticCurveTo(.83,1.90,.98,1.56);
   s.lineTo(1.13,1.12);s.closePath();
 },roofRed,1.33,Math.PI/2,-.665);
 // Two matching blue side windows per side follow the curved cabin roof.
 const paneGeo=()=>{
  const s=new T.Shape();
  s.moveTo(-.92,1.27);s.lineTo(-.75,1.61);
  s.quadraticCurveTo(-.62,1.73,-.31,1.75);
  s.lineTo(-.13,1.75);s.lineTo(-.13,1.27);s.closePath();
  return new T.ShapeGeometry(s,12);
 };
 const frontPaneGeo=()=>{
  const s=new T.Shape();s.moveTo(-.03,1.27);s.lineTo(-.03,1.75);
  s.lineTo(.32,1.75);s.quadraticCurveTo(.72,1.69,.79,1.47);
  s.lineTo(.91,1.27);s.closePath();return new T.ShapeGeometry(s,12);
 };
 for(const side of [-1,1]){
  for(const geo of [paneGeo(),frontPaneGeo()]){
   geo.rotateY(Math.PI/2);
   const pane=addMesh(T,root,geo,glass,[side*.78,0,0]);
   pane.material=glass;
  }
  box(T,root,trim,[.045,.045,1.45],[side*.79,1.23,0.05]);
  // Mirrors and small chrome accents.
  sphere(T,root,roofRed,[side*.89,1.25,-.57],[.20,.11,.16],15);
 }
 // Front is -Z, rear is +Z. Rear lights are always attached to this SAME car.
 for(const side of [-1,1]){
   box(T,root,metal,[.37,.16,.055],[side*.49,.72,-1.70]);
   box(T,root,redLamp,[.31,.18,.06],[side*.52,.80,1.65]);
 }
 box(T,root,trim,[.87,.18,.045],[0,.70,-1.72]);
 box(T,root,metal,[1.52,.10,.12],[0,.49,-1.72]);
 box(T,root,metal,[1.52,.10,.12],[0,.49,1.72]);
 const wheels=[];
 for(const x of [-.88,.88])for(const z of [-1.04,1.07]){
   const spin=new T.Group();spin.position.set(x,.42,z);root.add(spin);
   const tyre=new T.Mesh(new T.CylinderGeometry(.40,.40,.24,28),tireMat);
   tyre.rotation.z=Math.PI/2;spin.add(tyre);
   const rim=new T.Mesh(new T.CylinderGeometry(.245,.245,.27,28),rimMat);
   rim.rotation.z=Math.PI/2;spin.add(rim);
   // 5-spoke wheel shape makes actual rotation apparent.
   const spokeMat=new T.MeshStandardMaterial({color:0x879ca5,roughness:.45});
   for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      const spoke=box(T,spin,spokeMat,[.29,.053,.052],[x>0?.145:-.145,Math.sin(a)*.15,Math.cos(a)*.15]);
      spoke.rotation.x=a;
   }
   wheels.push(spin);
 }
 return {root,wheels};
}

function makeLandscape(T,scene){
 const groundMat=new T.MeshLambertMaterial({color:0x91ba7b});
 const roadMat=new T.MeshStandardMaterial({color:0x687082,roughness:.99});
 const white=new T.MeshBasicMaterial({color:0xffecd0});
 const yellow=new T.MeshBasicMaterial({color:0xffd990});
 const blush=new T.MeshStandardMaterial({color:0xe0b7a7,roughness:1});
 const greenMats=[0x619d74,0x4e966e,0x84ad73,0x739e84].map(color=>new T.MeshLambertMaterial({color}));
 const cloudMat=new T.MeshLambertMaterial({color:0xfffaf3});
 const trunkMat=new T.MeshStandardMaterial({color:0x9e7153,roughness:1});
 const hillside=new T.MeshLambertMaterial({color:0xa1c0a2});
 const road=addMesh(T,scene,new T.PlaneGeometry(6.4,130),roadMat,[0,0,-30]);
 road.rotation.x=-Math.PI/2;
 const soil=addMesh(T,scene,new T.PlaneGeometry(170,170),groundMat,[0,-.045,-30]);soil.rotation.x=-Math.PI/2;
 road.position.y=.012;
 // Soft distant rolling hills with tonal variation and warm sky palette.
 for(let side of [-1,1])for(let i=0;i<3;i++){
   const hill=sphere(T,scene,hillside,[side*(20+i*10),1.0,-28-i*9],[15+i*3,4.2+i,11+i*3],18);
   hill.material=greenMats[(i+2)%4];
 }
 for(let x of [-3.08,3.08]){
  let line=addMesh(T,scene,new T.PlaneGeometry(.12,126),white,[x,.031,-28]);line.rotation.x=-Math.PI/2;
 }
 for(let z=-83;z<28;z+=5.2){
   const stripe=addMesh(T,scene,new T.PlaneGeometry(.16,2.1),yellow,[0,.037,z]);stripe.rotation.x=-Math.PI/2;
 }
 // Rounded stylized orchard trees, not harsh dark triangular low-poly placeholders.
 for(let i=0;i<34;i++){
  const side=i%2===0?-1:1, z=-79+i*3.2;
  const x=side*(5.1+(i%5)*.35);
  const scale=.76+(i%4)*.12;
  const trunk=addMesh(T,scene,new T.CylinderGeometry(.13,.22,1.12,7),trunkMat,[x,.55,z]);trunk.scale.setScalar(scale);
  const crownMat=greenMats[i%greenMats.length];
  sphere(T,scene,crownMat,[x,1.75*scale,z],[.97*scale,1.18*scale,.90*scale]);
  sphere(T,scene,crownMat,[x-.36*scale,1.45*scale,z+.14],[.70*scale,.83*scale,.65*scale],18);
  sphere(T,scene,crownMat,[x+.35*scale,1.39*scale,z-.15],[.71*scale,.78*scale,.67*scale],18);
 }
 // Pastel white cloud clusters and golden daytime sun, deliberately restrained.
 for(let i=0;i<5;i++){
   const g=new T.Group();g.position.set(-20+i*9,10.8+(i%2)*2,-42-(i%3)*7);scene.add(g);
   sphere(T,g,cloudMat,[0,0,0],[2.1,.67,.8],16);
   sphere(T,g,cloudMat,[-.96,.38,0],[1.3,.9,.85],16);
   sphere(T,g,cloudMat,[.72,.42,0],[1.5,.92,.8],16);
 }
 const sunny=new T.MeshBasicMaterial({color:0xffe6ad});
 sphere(T,scene,sunny,[-16,15,-50],[3.25,3.25,.9],26);
 // Small restrained flower details near shoulder.
 const stems=new T.MeshLambertMaterial({color:0x71965f});
 const flowers=[0xf3bdca,0xffddb1,0xd2b6eb].map(color=>new T.MeshLambertMaterial({color}));
 for(let i=0;i<36;i++){
   const side=i%2?-1:1,z=-44+i*1.7,x=side*(3.82+(i%4)*.37);
   sphere(T,scene,stems,[x,.13,z],[.085,.20,.085],8);
   sphere(T,scene,flowers[i%3],[x,.34,z],[.16,.13,.16],9);
 }
}

async function mountSingleShot(stage,signal,reduced){
 const T=await import('./vendor/three.module.min.js');
 if(signal.aborted||!stage.isConnected)return null;
 const renderer=new T.WebGLRenderer({alpha:false,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));
 renderer.setSize(Math.max(2,stage.clientWidth),Math.max(2,stage.clientHeight),false);
 renderer.setClearColor(0xb8d9ed);
 renderer.outputColorSpace=T.SRGBColorSpace;
 renderer.toneMapping=T.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.43;
 renderer.domElement.setAttribute('aria-label','Կարմիր փոքրիկ մեքենայի մեկ շարունակական 3D ճանապարհային տեսարան');
 stage.prepend(renderer.domElement); // ORIGINAL hero emoji remains on top throughout loading.
 const scene=new T.Scene();scene.background=new T.Color(0xbadced);scene.fog=new T.Fog(0xbadced,32,85);
 scene.add(new T.HemisphereLight(0xfff9ee,0x688665,2.0));
 const sun=new T.DirectionalLight(0xffefd8,2.9);sun.position.set(-5,13,8);scene.add(sun);
 makeLandscape(T,scene);
 const {root:car,wheels}=makeCar(T);scene.add(car);
 const shadow=addMesh(T,scene,new T.CircleGeometry(1.5,30),new T.MeshBasicMaterial({color:0x243d45,transparent:true,opacity:.18,depthWrite:false}),[0,.048,4.3],[.8,1.45,1]);shadow.rotation.x=-Math.PI/2;
 const camera=new T.PerspectiveCamera(43,stage.clientWidth/Math.max(2,stage.clientHeight),.1,140);
 const initial={x:7.2,y:3.18,z:6.6};
 let raf=0,last=0,stopped=false,sceneReady=false;
 const look=new T.Vector3();
 const pose=elapsed=>{
   // 0..4.65 s: camera starts at the same side angle, swings behind moving
   // vehicle, then RETURNS to its starting angle. There is NO scene replacement.
   const enter=ease((elapsed-.32)/1.30);
   const leave=ease((elapsed-3.55)/1.03);
   const behind=enter*(1-leave);
   const drive=ease((elapsed-.30)/3.50);
   const z=4.35-drive*10.2;
   car.position.set(0,.013*Math.sin(elapsed*17)*Math.sin(Math.PI*drive),z);
   car.rotation.y=Math.sin(elapsed*1.5)*.025;
   shadow.position.z=z;
   wheels.forEach(w=>{w.rotation.x=-drive*21;});
   const desiredX=mix(initial.x,1.65,behind);
   const desiredY=mix(initial.y,2.90,behind);
   const desiredZ=mix(initial.z,7.4,behind);
   camera.position.set(desiredX,desiredY,z+desiredZ);
   look.set(0,.85,z-1.05);
   camera.lookAt(look);
 };
 pose(0);renderer.render(scene,camera);
 stage.dataset.sceneMode='webgl';
 const onResize=()=>{
  if(stopped)return;
  const w=stage.clientWidth,h=stage.clientHeight;
  if(w<2||h<2)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.render(scene,camera);
 };
 window.addEventListener('resize',onResize);
 function play(){
  if(stopped||signal.aborted)return Promise.resolve();
  if(reduced){stage.dataset.live='1';return Promise.resolve();}
  return new Promise(resolve=>{
    const start=performance.now();
    stage.dataset.live='1';
    const draw=t=>{
      if(stopped||signal.aborted){resolve();return;}
      const elapsed=Math.min(4.78,(t-start)/1000);
      pose(elapsed);renderer.render(scene,camera);
      if(elapsed<4.78){raf=requestAnimationFrame(draw)}else resolve();
    };
    raf=requestAnimationFrame(draw);
  });
 }
 function dispose(){
  if(stopped)return;stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);
  scene.traverse(o=>{
   if(o.geometry)o.geometry.dispose();
   if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.dispose();
  });
  renderer.dispose();renderer.forceContextLoss?.();renderer.domElement.remove();
 }
 return {play,dispose};
}
const sleep=(ms)=>new Promise(done=>setTimeout(done,ms));
export async function playCarReward(sourceCard){
 if(active||!sourceCard?.isConnected||!sourceCard.classList.contains('is-unlocked'))return;
 active=true;
 const originalFocus=document.activeElement;
 const style=document.getElementById('areg-car-pilot-style')||document.createElement('style');
 if(!style.id){style.id='areg-car-pilot-style';style.textContent=CSS;document.head.append(style);}
 const overlay=document.createElement('div');overlay.className='areg-car-pilot';
 const srcPicture=sourceCard.querySelector('.magic-picture');
 // The same source-character art is used before AND after the continuous shot.
 const heroText=srcPicture?.textContent?.trim()||'🚗';
 overlay.innerHTML='<div class="areg-car-pilot-shade"></div><div class="areg-car-pilot-card" role="dialog" aria-modal="true" aria-label="Մեքենայի շարունակական եռաչափ տեսարան"><div class="areg-car-pilot-stage"><span class="areg-car-pilot-original" aria-hidden="true"></span></div><div class="areg-car-pilot-title"></div><button type="button" class="areg-car-pilot-exit" aria-label="Փակել">×</button></div>';
 const target=overlay.querySelector('.areg-car-pilot-card');
 const stage=overlay.querySelector('.areg-car-pilot-stage');
 overlay.querySelector('.areg-car-pilot-original').textContent=heroText;
 overlay.querySelector('.areg-car-pilot-title').textContent=sourceCard.querySelector('.magic-name')?.textContent?.trim()||'Մեքենա';
 document.body.append(overlay);
 const src=sourceCard.getBoundingClientRect(),dst=target.getBoundingClientRect();
 const from='translate3d('+(src.left+src.width/2-dst.left-dst.width/2)+'px,'+(src.top+src.height/2-dst.top-dst.height/2)+'px,0) scale('+(src.width/dst.width)+','+(src.height/dst.height)+')';
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion:reduce)')?.matches;
 const ac=new AbortController();
 let closed=false,world=null,flight=null;
 const animate=(frames,duration,easing)=>{
  if(reduced||!target.animate)return Promise.resolve();
  const a=target.animate(frames,{duration,easing,fill:'forwards'});
  return a.finished.catch(()=>{});
 };
 const key=e=>{if(e.key==='Escape'){e.preventDefault();void close();}};
 async function close(){
  if(closed)return;
  closed=true;ac.abort();document.removeEventListener('keydown',key);
  stage.dataset.live='0';overlay.dataset.leaving='1';
  await sleep(reduced?1:720); // original picture returns before card shrinks
  world?.dispose();
  await animate([{transform:'none',opacity:1},{transform:from,opacity:1}],reduced?0:720,'cubic-bezier(.38,0,.25,1)');
  overlay.remove();active=false;
  if(originalFocus?.isConnected)originalFocus.focus({preventScroll:true});
 }
 overlay.querySelector('.areg-car-pilot-exit').addEventListener('click',()=>void close());
 overlay.querySelector('.areg-car-pilot-shade').addEventListener('click',()=>void close());
 document.addEventListener('keydown',key);
 overlay.dataset.visible='1';
 try{
   await animate([{transform:from,opacity:1},{transform:'none',opacity:1}],reduced?0:760,'cubic-bezier(.2,.16,.27,1)');
   if(closed)return;
   overlay.querySelector('.areg-car-pilot-exit').focus({preventScroll:true});
   world=await mountSingleShot(stage,ac.signal,reduced);
   if(closed){world?.dispose();return;}
   if(world)await world.play();
   else stage.dataset.sceneMode='fallback';
   if(!closed)await close();
 }catch(e){
   if(!closed)console.warn('Car reward WebGL unavailable; keeping the ORIGINAL character art',e);
   stage.dataset.sceneMode='fallback';
   if(!closed)await sleep(800);
   if(!closed)await close();
 }finally{
   if(!closed)await close();
 }
}
