import * as THREE from './vendor/three.module.min.js';
const $=id=>document.getElementById(id), host=$('view'),msg=$('message');
const colors=['#e44c4a','#f2b62f','#40a66a','#387ec7','#8c65cb','#ec8541','#e65199','#35b4a5','#e4b13d','#da5b56','#578bd1','#8bce65','#aa6bca','#e87d39','#41acbd','#df6786','#e5b94d','#68ad58','#7b8bd2','#d76a53','#a277c8','#58b6a1','#e6a347','#cb5e9e'];
const rad=Math.PI/180;
const circle=(rx,ry=rx,n=56)=>Array.from({length:n},(_,i)=>[Math.cos(i*2*Math.PI/n)*rx,Math.sin(i*2*Math.PI/n)*ry]);
const poly=(n,r=.42,phase=-Math.PI/2)=>Array.from({length:n},(_,i)=>[Math.cos(phase+i*2*Math.PI/n)*r,Math.sin(phase+i*2*Math.PI/n)*r]);
function points(id){switch(id){
case 0:return circle(.40);case 1:return poly(3,.48);case 2:return [[-.38,-.38],[.38,-.38],[.38,.38],[-.38,.38]];
case 3:return poly(6,.43);case 4:return Array.from({length:10},(_,i)=>{const a=(-90+i*36)*rad,r=i%2?.2:.45;return [Math.cos(a)*r,Math.sin(a)*r]});
case 5:return Array.from({length:72},(_,i)=>{const t=i*2*Math.PI/72;return [.44*Math.sin(t)**3,.34*(Math.cos(t)-.5*Math.cos(2*t)-.2*Math.cos(3*t)-.1*Math.cos(4*t))]});
case 6:return [[-.14,-.43],[.14,-.43],[.14,-.14],[.43,-.14],[.43,.14],[.14,.14],[.14,.43],[-.14,.43],[-.14,.14],[-.43,.14],[-.43,-.14],[-.14,-.14]];
case 7:return [[0,.47],[.44,0],[0,-.47],[-.44,0]];
case 8:return [...Array.from({length:36},(_,i)=>{const a=(60+i*240/35)*rad;return [.44*Math.cos(a),.44*Math.sin(a)]}),...Array.from({length:28},(_,i)=>{const a=(-60+i*120/27)*rad;return [-.08+.33*Math.cos(a),.33*Math.sin(a)]})];
case 9:return poly(5,.44);case 10:return Array.from({length:80},(_,i)=>{let t=i*2*Math.PI/80,r=.31+.105*Math.cos(4*t);return [Math.cos(t)*r,Math.sin(t)*r]});
case 11:return circle(.28,.43);case 12:return [[-.43,-.32],[.43,-.32],[.25,.32],[-.25,.32]];
case 13:return [[-.42,-.34],[.18,-.34],[.42,.34],[-.18,.34]];
case 14:return [[-.44,-.35],[.44,-.35],[.44,.35],[-.44,.35]];
case 15:return Array.from({length:32},(_,i)=>{let a=Math.PI+i*Math.PI/31;return [.43*Math.cos(a),.43*Math.sin(a)]});
case 16:return poly(8,.44);case 17:return [[-.44,-.15],[-.1,-.15],[-.1,-.43],[.45,0],[-.1,.43],[-.1,.15],[-.44,.15]];
case 18:return [[-.08,.45],[.29,.06],[.08,.06],[.22,-.43],[-.32,.07],[-.08,.07]];
case 19:return Array.from({length:12},(_,i)=>{let a=(-90+i*30)*rad,r=i%2?.28:.46;return [Math.cos(a)*r,Math.sin(a)*r]});
case 20:return [[-.44,-.4],[.44,-.4],[.44,-.13],[.14,-.13],[.14,.4],[-.14,.4],[-.14,-.13],[-.44,-.13]];
case 21:return Array.from({length:64},(_,i)=>{let t=i*2*Math.PI/64;let r=.34+.09*Math.cos(6*t);return [Math.cos(t)*r,Math.sin(t)*r]});
case 22:return Array.from({length:60},(_,i)=>{let t=i*2*Math.PI/60;let r=.4*(1-.18*Math.sin(t));return [Math.cos(t)*r,Math.sin(t)*r]});
default:return [[0,.48],[.37,.16],[.24,-.43],[-.24,-.43],[-.37,.16]];}}
const scaledPoints=id=>points(id).map(([x,y])=>[x*1.205,y*1.205]);
function makeShape(id){const s=new THREE.Shape();scaledPoints(id).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
function woodMap(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');const grad=x.createLinearGradient(0,0,512,512);grad.addColorStop(0,'#f2c58b');grad.addColorStop(.45,'#dba46d');grad.addColorStop(1,'#bf824e');x.fillStyle=grad;x.fillRect(0,0,512,512);let seed=90210;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<420;i++){let y=rnd()*512,amp=1+rnd()*7;x.beginPath();for(let j=0;j<=512;j+=8){let yy=y+Math.sin(j*.014+i*.8)*amp+Math.sin(j*.043+i)*1.3;j?x.lineTo(j,yy):x.moveTo(j,yy)}x.strokeStyle=rnd()>.48?'#784c2e':'#fff3cd';x.globalAlpha=.025+rnd()*.16;x.lineWidth=.4+rnd()*2;x.stroke()}x.globalAlpha=1;for(let i=0;i<1700;i++){x.fillStyle=i%2?'#855531':'#fff0d2';x.globalAlpha=.035+rnd()*.09;x.fillRect(rnd()*512,rnd()*512,1+rnd()*3,1)}x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.65,.65);t.anisotropy=4;return t}
let renderer,scene,camera,cube,goal,ray,shadow;const slots=[],panels=[],anim=[];
let stage=0,selected=null,drag=null,rotating=null,lastX=0,lastY=0,rotated=false,stars=10,completed=new Set(),audioCtx,activeHint=null,hinted=new Set(),wrongHint=null,wrongUntil=0,celebrating=false;
const stageSchedule=(()=>{const used=Array(6).fill(0);return Array.from({length:6},(_,round)=>Array.from({length:4},(_,j)=>{const face=(round+j)%6;return face*4+used[face]++}))})();
const stageIds=()=>stageSchedule[stage];
const wood=new THREE.MeshStandardMaterial({map:woodMap(),color:0xffe6bf,roughness:.78,metalness:0});
const sideWood=new THREE.MeshStandardMaterial({color:0xb77c49,roughness:.82});
const coreMat=new THREE.MeshStandardMaterial({color:0x8c5937,roughness:.95});
const insetMat=id=>new THREE.MeshStandardMaterial({color:new THREE.Color(colors[id]).multiplyScalar(.68),roughness:1,side:THREE.DoubleSide});
const colorMat=id=>new THREE.MeshStandardMaterial({color:colors[id],roughness:.45,metalness:0});
function outline(){const s=new THREE.Shape(),r=1.54,k=.17;s.moveTo(-r+k,-r);s.lineTo(r-k,-r);s.quadraticCurveTo(r,-r,r,-r+k);s.lineTo(r,r-k);s.quadraticCurveTo(r,r,r-k,r);s.lineTo(-r+k,r);s.quadraticCurveTo(-r,r,-r,r-k);s.lineTo(-r,-r+k);s.quadraticCurveTo(-r,-r,-r+k,-r);return s}
function panelGeo(face){const o=outline();for(let j=0;j<4;j++){let id=face*4+j,x=j%2?.77:-.77,y=j<2?.77:-.77;const h=new THREE.Path();scaledPoints(id).slice().reverse().forEach(([a,b],i)=>i?h.lineTo(a+x,b+y):h.moveTo(a+x,b+y));h.closePath();o.holes.push(h)}return new THREE.ExtrudeGeometry(o,{depth:.18,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,curveSegments:32,steps:1})}
function pieceGeo(id){return new THREE.ExtrudeGeometry(makeShape(id),{depth:.17,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:3,curveSegments:28,steps:1})}
function setup(){
createGardenMotion();
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,60);camera.position.set(5.3,3.9,8.8);camera.lookAt(0,0,0);
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){showError('Այս բրաուզերում 3D-ն չբացվեց։ Բացիր Safari-ում։');return}
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));host.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xfff5dd,0x76503a,2.1));const sun=new THREE.DirectionalLight(0xffe9c6,2.5);sun.position.set(-4,7,7);scene.add(sun);const fill=new THREE.DirectionalLight(0xc7dcff,.9);fill.position.set(6,3,-5);scene.add(fill);
// A soft transparent shadow follows the floating cube, not a stationary table.
const shadowTexture=(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');const grad=ctx.createRadialGradient(128,128,12,128,128,126);grad.addColorStop(0,'rgba(10,14,28,.34)');grad.addColorStop(.45,'rgba(13,16,32,.16)');grad.addColorStop(1,'rgba(10,13,28,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,256,256);return new THREE.CanvasTexture(canvas)})();
shadow=new THREE.Sprite(new THREE.SpriteMaterial({map:shadowTexture,transparent:true,opacity:.83,depthWrite:false,depthTest:false}));shadow.scale.set(5.8,4.4,1);shadow.position.set(.35,-1.25,-1.6);shadow.renderOrder=-1;scene.add(shadow);
cube=new THREE.Group();cube.scale.setScalar(1.08);scene.add(cube);cube.add(new THREE.Mesh(new THREE.BoxGeometry(3.04,3.04,3.04),coreMat));
for(let face=0;face<6;face++){const g=new THREE.Group();if(face<4)g.rotation.y=face*Math.PI/2;else g.rotation.x=face===4?-Math.PI/2:Math.PI/2;cube.add(g);
const panel=new THREE.Mesh(panelGeo(face),[wood,sideWood]);panel.position.z=1.50;g.add(panel);panels.push(panel);
for(let j=0;j<4;j++){const id=face*4+j,x=j%2?.77:-.77,y=j<2?.77:-.77;
const base=new THREE.Mesh(new THREE.ShapeGeometry(makeShape(id)),insetMat(id));base.position.set(x,y,1.545);g.add(base);
const glow=new THREE.Mesh(new THREE.ShapeGeometry(makeShape(id)),new THREE.MeshBasicMaterial({color:0x65ff64,transparent:true,opacity:0,depthWrite:false,depthTest:false,side:THREE.DoubleSide}));glow.position.set(x,y,1.75);glow.renderOrder=9;glow.visible=false;g.add(glow);
const outlineGlow=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(scaledPoints(id).map(([a,b])=>new THREE.Vector3(a,b,0))),new THREE.LineBasicMaterial({color:0x4cff4b,transparent:true,opacity:0,depthTest:false,depthWrite:false}));outlineGlow.position.set(x,y,1.77);outlineGlow.renderOrder=10;outlineGlow.visible=false;g.add(outlineGlow);
const block=new THREE.Mesh(pieceGeo(id),colorMat(id));block.position.set(x,y,2.3);block.visible=false;g.add(block);
slots.push({id,face,base,block,glow,outlineGlow,filled:false})}}
ray=new THREE.Raycaster();goal=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.38,-.52,0,'YXZ'));cube.quaternion.copy(goal);
renderer.domElement.addEventListener('pointerdown',e=>{rotating=e.pointerId;lastX=e.clientX;lastY=e.clientY;rotated=false;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(rotating!==e.pointerId)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(Math.abs(dx)+Math.abs(dy)>2)rotated=true;const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dx*.011);const qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),dy*.011);goal.premultiply(qy).premultiply(qx).normalize()});
renderer.domElement.addEventListener('pointerup',e=>{if(rotating!==e.pointerId)return;rotating=null;if(!rotated&&selected!==null)tryDrop(e.clientX,e.clientY,selected)});
renderer.domElement.addEventListener('pointercancel',()=>rotating=null);
new ResizeObserver(resize).observe(host);resize();requestAnimationFrame(tick);reset();
}
function createGardenMotion(){const host=$('garden-motion');if(!host)return;let seed=37142;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<24;i++){const p=document.createElement('span');p.className='garden-particle '+(i%3?'firefly':'petal');p.style.setProperty('--x',(4+rnd()*92)+'%');p.style.setProperty('--y',(7+rnd()*80)+'%');p.style.setProperty('--size',(i%3?6+rnd()*12:8+rnd()*13)+'px');p.style.setProperty('--dx',(rnd()*120-60)+'px');p.style.setProperty('--dy',(-15-rnd()*120)+'px');p.style.setProperty('--dur',(5+rnd()*8)+'s');p.style.setProperty('--delay',(-rnd()*12)+'s');host.append(p)}}
// V6: iOS Home Screen has a taller canvas than Safari at the same width.
// With a fixed vertical FOV, that makes the cube look bigger and clip the frame.
// Preserve V4's Safari camera exactly; in standalone portrait only, preserve
// Safari's HORIZONTAL field of view, independent of the canvas height.
// Do not change cube scale, initial angle, interaction or zoom while rotating.
function resize(){
 if(!renderer)return;
 const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
 renderer.setSize(w,h,false);
 camera.aspect=w/h;
 const safariFov=h>w?37:41;
 const standalone=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true;
 const referencePortraitAspect=0.87; // screenshot-verified Safari 3D canvas width/height
 if(standalone&&h>w){
   const safariHalfTan=Math.tan(THREE.MathUtils.degToRad(safariFov)/2);
   const ratio=Math.max(1,referencePortraitAspect/camera.aspect);
   camera.fov=THREE.MathUtils.radToDeg(2*Math.atan(safariHalfTan*ratio));
 }else{
   camera.fov=safariFov;
 }
 camera.updateProjectionMatrix();
 // A modest extra 5% clearance only in Home Screen standalone mode.
 const distanceFactor=standalone&&h>w?1.05:1;
 camera.position.set(5.2*distanceFactor,3.6*distanceFactor,8.5*distanceFactor);
 camera.lookAt(0,0,0);
}
function tick(t){requestAnimationFrame(tick);cube.quaternion.slerp(goal,.15);if(shadow){const faceDirection=new THREE.Vector3(0,0,1).applyQuaternion(cube.quaternion);shadow.position.set(.35+faceDirection.x*.30,-1.23+faceDirection.y*.20,-1.6);shadow.material.opacity=.66+Math.abs(faceDirection.z)*.16;shadow.scale.set(5.6+Math.abs(faceDirection.x)*.5,4.3+Math.abs(faceDirection.y)*.3,1)}const pulse=(Math.sin((t||0)*.0055)+1)*.5;for(const slot of slots){const isGreen=hinted.has(slot.id)&&!slot.filled;const isRed=wrongHint===slot.id&&performance.now()<wrongUntil&&!slot.filled;const show=isGreen||isRed;slot.glow.visible=show;slot.outlineGlow.visible=show;if(show){slot.glow.material.color.setHex(isRed?0xff3636:0x55ff50);slot.outlineGlow.material.color.setHex(isRed?0xff2020:0x27e831);slot.glow.material.opacity=(isRed?.3:.19)+pulse*(isRed?.37:.34);slot.outlineGlow.material.opacity=.55+pulse*.4;slot.glow.scale.setScalar(1.025+pulse*.035);slot.outlineGlow.scale.setScalar(1.025+pulse*.035)}}if(wrongHint!==null&&performance.now()>=wrongUntil)wrongHint=null;for(let i=anim.length-1;i>=0;i--){let a=anim[i];a.block.position.z+=(a.z-a.block.position.z)*.19;if(Math.abs(a.z-a.block.position.z)<.015){a.block.position.z=a.z;anim.splice(i,1)}}renderer.render(scene,camera)}
function showError(s){msg.textContent=s;msg.style.color='#a22'}
function play(ok){try{const AC=window.AudioContext||window.webkitAudioContext;audioCtx ||= new AC();if(audioCtx.state==='suspended')audioCtx.resume();for(const [hz,delay] of (ok?[[523,0],[784,.10],[1046,.2]]:[[392,0],[330,.13]])){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+.01+delay;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.23)}}catch(e){}}
function icon(id){const p=points(id).map(([x,y],i)=>(i?'L':'M')+(50+x*108).toFixed(2)+','+(50-y*108).toFixed(2)).join(' ')+'Z';return '<svg viewBox="0 0 100 100"><path d="'+p+'" transform="translate(0 3)" fill="#70472b" opacity=".25"/><path d="'+p+'" fill="'+colors[id]+'" stroke="#fff0cf" stroke-width="3.5" stroke-linejoin="round"/><path d="'+p+'" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></svg>'}
function reset(){stage=0;stars=10;completed.clear();celebrating=false;activeHint=null;hinted.clear();wrongHint=null;slots.forEach(s=>{s.filled=false;s.block.visible=false;s.glow.visible=false;s.outlineGlow.visible=false});$('stars').textContent='⭐ '+stars;goal.setFromEuler(new THREE.Euler(-.38,-.52,0,'YXZ'));round()}

function round(){selected=null;activeHint=null;hinted.clear();wrongHint=null;celebrating=false;$('level').textContent='Փուլ '+(stage+1)+' / 6';$('score').textContent='✓ 0 / 4';$('overlay').classList.remove('show');$('message').textContent='';const tray=$('pieces');tray.replaceChildren();const ids=stageIds().map(id=>[Math.random(),id]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
for(const id of ids){const el=document.createElement('button');el.className='piece';el.dataset.id=id;el.setAttribute('aria-label','Ձև '+(id+1));el.innerHTML=icon(id);el.addEventListener('pointerdown',e=>{if(celebrating)return;e.preventDefault();selected=id;document.querySelectorAll('.piece').forEach(p=>p.classList.toggle('selected',p===el));drag={id,x:e.clientX,y:e.clientY,ghost:null};el.setPointerCapture(e.pointerId)});el.addEventListener('pointermove',e=>{if(!drag||drag.id!==id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){if(!drag.ghost){drag.ghost=document.createElement('div');drag.ghost.className='ghost';drag.ghost.innerHTML=icon(id);document.body.append(drag.ghost)}drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px'}});el.addEventListener('pointerup',e=>{if(!drag)return;const moved=!!drag.ghost;drag.ghost?.remove();drag=null;if(moved)tryDrop(e.clientX,e.clientY,id)});el.addEventListener('pointercancel',()=>{drag?.ghost?.remove();drag=null});tray.append(el)}}
function feedback(ok){const el=$('feedback');el.className='';el.innerHTML=ok?'<svg class="success-tick" viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="42" fill="#15b957" stroke="#eaffed" stroke-width="5"/><path d="M23 49 L41 65 L73 30" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>':'❌';void el.offsetWidth;el.className=ok?'ok':'wrong';if(!ok&&selected!==null){const p=document.querySelector('.piece[data-id="'+selected+'"]');if(p){p.classList.remove('wrong');void p.offsetWidth;p.classList.add('wrong');setTimeout(()=>p.classList.remove('wrong'),550)}}}
function tryDrop(x,y,id){if(completed.has(id)||celebrating||!renderer)return;const r=renderer.domElement.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom){feedback(false);play(false);return}const ndc=new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects([...panels,...slots.map(s=>s.base),cube.children[0]],false);const hit=hits[0];const slot=slots.find(s=>s.base===hit?.object);
if(!slot||slot.id!==id||slot.filled){play(false);feedback(false);wrongHint=slot&&!slot.filled&&!hinted.has(slot.id)?slot.id:null;wrongUntil=performance.now()+720;return}
hinted.delete(id);if(activeHint===id)activeHint=null;wrongHint=null;slot.filled=true;slot.block.visible=true;slot.block.position.z=2.3;anim.push({block:slot.block,z:1.73});completed.add(id);document.querySelector('.piece[data-id="'+id+'"]')?.classList.add('used');selected=null;document.querySelectorAll('.piece').forEach(p=>p.classList.remove('selected'));play(true);feedback(true);
const count=stageIds().filter(k=>completed.has(k)).length;$('score').textContent='✓ '+count+' / 4';if(count===4){celebrating=true;setTimeout(showCelebration,850)}}
function hint(){if(selected===null){const el=$('feedback');el.className='';el.textContent='👇';void el.offsetWidth;el.className='ok';return}const slot=slots.find(s=>s.id===selected);if(!slot||slot.filled)return;activeHint=slot.id;hinted.add(slot.id);wrongHint=null;if(stars>0){stars--;const starEl=$('stars');starEl.textContent='⭐ '+stars;starEl.classList.remove('spent');void starEl.offsetWidth;starEl.classList.add('spent');setTimeout(()=>starEl.classList.remove('spent'),680)}const normal=new THREE.Vector3(0,0,1).applyQuaternion(slot.base.parent.quaternion);const direction=camera.position.clone().normalize();goal.copy(new THREE.Quaternion().setFromUnitVectors(normal,direction));}
function confetti(){const el=$('celebrate');el.replaceChildren();for(let i=0;i<25;i++){const p=document.createElement('span');p.className='spark';p.textContent=['✦','✧','❄','⭐','✳'][i%5];p.style.setProperty('--x',(Math.random()*96+2)+'%');p.style.setProperty('--size',(12+Math.random()*17)+'px');p.style.setProperty('--delay',(-Math.random()*2)+'s');p.style.setProperty('--dur',(2.1+Math.random()*1.4)+'s');p.style.setProperty('--drift',(Math.random()*110-55)+'px');el.append(p)}}
function playVictory(){try{const AC=window.AudioContext||window.webkitAudioContext;audioCtx ||= new AC();if(audioCtx.state==='suspended')audioCtx.resume();const start=audioCtx.currentTime+.06;const melody=[[523,0,.16],[659,.19,.16],[784,.38,.18],[1047,.58,.38],[784,1.05,.16],[1047,1.24,.55],[1175,1.84,.2],[1318,2.04,.5]];for(const [hz,delay,dur] of melody){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=start+delay;o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.065,t+.03);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.02)}
for(let i=0;i<11;i++){const len=Math.floor(audioCtx.sampleRate*.065),buffer=audioCtx.createBuffer(1,len,audioCtx.sampleRate),data=buffer.getChannelData(0);for(let j=0;j<len;j++)data[j]=(Math.random()*2-1)*Math.pow(1-j/len,1.5);const src=audioCtx.createBufferSource(),g=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();src.buffer=buffer;filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.55;const t=start+i*.22;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+.07);src.connect(filter);filter.connect(g);g.connect(audioCtx.destination);src.start(t);src.stop(t+.07)}}catch(e){}}
function flyStars(){const from=$('bonus').getBoundingClientRect(),to=$('stars').getBoundingClientRect();const dx=to.left+to.width/2-(from.left+from.width/2),dy=to.top+to.height/2-(from.top+from.height/2);for(let i=0;i<5;i++){const el=document.createElement('span');el.className='flying-star';el.textContent='⭐';el.style.left=(from.left+from.width*(i+.5)/5-15)+'px';el.style.top=(from.top+8)+'px';document.body.append(el);setTimeout(()=>{el.style.transform='translate('+dx+'px,'+dy+'px) scale(.35)';el.style.opacity='0'},350+i*165);setTimeout(()=>{stars++;$('stars').textContent='⭐ '+stars;el.remove()},1200+i*165)}}
function showCelebration(){confetti();const isFinal=stage===5;$('award').textContent=isFinal?'🏆':'🌟';$('congrats').textContent=isFinal?'Դու հաղթեցի՜ր։':'Ապրե՜ս, շատ լավ էր։';$('congratsText').textContent=isFinal?'Բոլոր 6 փուլերն ավարտված են։':'Հրաշալի՜ կատարեցիր առաջադրանքը։';$('continue').textContent=isFinal?'Խաղալ նորից ↻':'Շարունակել ✨';$('bonus').classList.toggle('show',isFinal);$('bonus').replaceChildren();if(isFinal){for(let i=0;i<5;i++){const el=document.createElement('span');el.textContent='⭐';el.style.setProperty('--i',i);$('bonus').append(el)}}else{stars++;$('stars').textContent='⭐ '+stars}
$('overlay').classList.add('show');if(isFinal){playVictory();setTimeout(flyStars,900)}else{play(true)}}
$('help').onclick=hint;$('continue').onclick=()=>{if(stage===5){reset()}else{stage++;round()}};$('back').onclick=()=>history.length>1?history.back():location.href='./';
window.addEventListener('error',e=>showError('3D սխալ․ '+(e.message||'Ստուգիր Safari-ն')));setup();