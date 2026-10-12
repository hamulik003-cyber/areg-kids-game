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
case 8:return [...Array.from({length:32},(_,i)=>{let a=Math.PI/2+i*Math.PI/31;return [.42*Math.cos(a),.42*Math.sin(a)]}),...Array.from({length:32},(_,i)=>{let a=3*Math.PI/2-i*Math.PI/31;return [-.13+.3*Math.cos(a),.3*Math.sin(a)]})];
case 9:return poly(5,.44);case 10:return Array.from({length:80},(_,i)=>{let t=i*2*Math.PI/80,r=.31+.105*Math.cos(4*t);return [Math.cos(t)*r,Math.sin(t)*r]});
case 11:return circle(.28,.43);case 12:return [[-.43,-.32],[.43,-.32],[.25,.32],[-.25,.32]];
case 13:return [[-.42,-.34],[.18,-.34],[.42,.34],[-.18,.34]];
case 14:return [[-.44,-.35],[.44,-.35],[.44,.35],[-.44,.35]];
case 15:return Array.from({length:32},(_,i)=>{let a=Math.PI+i*Math.PI/31;return [.43*Math.cos(a),.43*Math.sin(a)]}).concat([[.43,0],[-.43,0]]);
case 16:return poly(8,.44);case 17:return [[-.44,-.15],[-.1,-.15],[-.1,-.43],[.45,0],[-.1,.43],[-.1,.15],[-.44,.15]];
case 18:return [[-.08,.45],[.29,.06],[.08,.06],[.22,-.43],[-.32,.07],[-.08,.07]];
case 19:return Array.from({length:12},(_,i)=>{let a=(-90+i*30)*rad,r=i%2?.28:.46;return [Math.cos(a)*r,Math.sin(a)*r]});
case 20:return [[-.44,-.4],[.44,-.4],[.44,-.13],[.14,-.13],[.14,.4],[-.14,.4],[-.14,-.13],[-.44,-.13]];
case 21:return Array.from({length:64},(_,i)=>{let t=i*2*Math.PI/64;let r=.34+.09*Math.cos(6*t);return [Math.cos(t)*r,Math.sin(t)*r]});
case 22:return Array.from({length:60},(_,i)=>{let t=i*2*Math.PI/60;let r=.4*(1-.18*Math.sin(t));return [Math.cos(t)*r,Math.sin(t)*r]});
default:return [[0,.48],[.37,.16],[.24,-.43],[-.24,-.43],[-.37,.16]];}}
function makeShape(id){const s=new THREE.Shape();points(id).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
function woodMap(){const c=document.createElement('canvas');c.width=512;c.height=512;const x=c.getContext('2d');const grad=x.createLinearGradient(0,0,512,512);grad.addColorStop(0,'#f2c58b');grad.addColorStop(.45,'#dba46d');grad.addColorStop(1,'#bf824e');x.fillStyle=grad;x.fillRect(0,0,512,512);let seed=90210;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);for(let i=0;i<420;i++){let y=rnd()*512,amp=1+rnd()*7;x.beginPath();for(let j=0;j<=512;j+=8){let yy=y+Math.sin(j*.014+i*.8)*amp+Math.sin(j*.043+i)*1.3;j?x.lineTo(j,yy):x.moveTo(j,yy)}x.strokeStyle=rnd()>.48?'#784c2e':'#fff3cd';x.globalAlpha=.025+rnd()*.16;x.lineWidth=.4+rnd()*2;x.stroke()}x.globalAlpha=1;for(let i=0;i<1700;i++){x.fillStyle=i%2?'#855531':'#fff0d2';x.globalAlpha=.035+rnd()*.09;x.fillRect(rnd()*512,rnd()*512,1+rnd()*3,1)}x.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(.65,.65);t.anisotropy=4;return t}
let renderer,scene,camera,cube,goal,ray;const slots=[],panels=[],anim=[];
let stage=0,selected=null,drag=null,rotating=null,lastX=0,lastY=0,rotated=false,stars=0,completed=new Set(),audioCtx;
const stageIds=()=>Array.from({length:6},(_,face)=>face*4+stage);
const wood=new THREE.MeshStandardMaterial({map:woodMap(),color:0xffe6bf,roughness:.78,metalness:0});
const sideWood=new THREE.MeshStandardMaterial({color:0xb77c49,roughness:.82});
const coreMat=new THREE.MeshStandardMaterial({color:0x8c5937,roughness:.95});
const insetMat=id=>new THREE.MeshStandardMaterial({color:new THREE.Color(colors[id]).multiplyScalar(.40),roughness:1,side:THREE.DoubleSide});
const colorMat=id=>new THREE.MeshStandardMaterial({color:colors[id],roughness:.45,metalness:0});
function outline(){const s=new THREE.Shape(),r=1.54,k=.17;s.moveTo(-r+k,-r);s.lineTo(r-k,-r);s.quadraticCurveTo(r,-r,r,-r+k);s.lineTo(r,r-k);s.quadraticCurveTo(r,r,r-k,r);s.lineTo(-r+k,r);s.quadraticCurveTo(-r,r,-r,r-k);s.lineTo(-r,-r+k);s.quadraticCurveTo(-r,-r,-r+k,-r);return s}
function panelGeo(face){const o=outline();for(let j=0;j<4;j++){let id=face*4+j,x=j%2?.77:-.77,y=j<2?.77:-.77;const h=new THREE.Path();points(id).slice().reverse().forEach(([a,b],i)=>i?h.lineTo(a+x,b+y):h.moveTo(a+x,b+y));h.closePath();o.holes.push(h)}return new THREE.ExtrudeGeometry(o,{depth:.18,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:3,curveSegments:32,steps:1})}
function pieceGeo(id){return new THREE.ExtrudeGeometry(makeShape(id),{depth:.17,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:3,curveSegments:28,steps:1})}
function setup(){
scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(38,1,.1,60);camera.position.set(5.3,3.9,8.8);camera.lookAt(0,0,0);
try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});}catch(e){showError('Այս բրաուզերում 3D-ն չբացվեց։ Բացիր Safari-ում։');return}
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));host.append(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xfff5dd,0x76503a,2.1));const sun=new THREE.DirectionalLight(0xffe9c6,2.5);sun.position.set(-4,7,7);scene.add(sun);const fill=new THREE.DirectionalLight(0xc7dcff,.9);fill.position.set(6,3,-5);scene.add(fill);
const rug=new THREE.Mesh(new THREE.CircleGeometry(2.65,64),new THREE.MeshStandardMaterial({color:0xd4b18d,roughness:1,transparent:true,opacity:.8,side:THREE.DoubleSide}));rug.rotation.x=-Math.PI/2;rug.position.y=-2.35;scene.add(rug);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.95,64),new THREE.MeshBasicMaterial({color:0x654028,transparent:true,opacity:.18,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-2.335;scene.add(shadow);
cube=new THREE.Group();scene.add(cube);cube.add(new THREE.Mesh(new THREE.BoxGeometry(3.04,3.04,3.04),coreMat));
for(let face=0;face<6;face++){const g=new THREE.Group();if(face<4)g.rotation.y=face*Math.PI/2;else g.rotation.x=face===4?-Math.PI/2:Math.PI/2;cube.add(g);
const panel=new THREE.Mesh(panelGeo(face),[wood,sideWood]);panel.position.z=1.50;g.add(panel);panels.push(panel);
for(let j=0;j<4;j++){const id=face*4+j,x=j%2?.77:-.77,y=j<2?.77:-.77;
const base=new THREE.Mesh(new THREE.ShapeGeometry(makeShape(id)),insetMat(id));base.position.set(x,y,1.52);g.add(base);
const block=new THREE.Mesh(pieceGeo(id),colorMat(id));block.position.set(x,y,2.3);block.visible=false;g.add(block);
slots.push({id,face,base,block,filled:false})}}
ray=new THREE.Raycaster();goal=new THREE.Quaternion().setFromEuler(new THREE.Euler(-.38,-.52,0,'YXZ'));cube.quaternion.copy(goal);
renderer.domElement.addEventListener('pointerdown',e=>{rotating=e.pointerId;lastX=e.clientX;lastY=e.clientY;rotated=false;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(rotating!==e.pointerId)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;if(Math.abs(dx)+Math.abs(dy)>2)rotated=true;const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),dx*.011);const qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),dy*.011);goal.premultiply(qy).premultiply(qx).normalize()});
renderer.domElement.addEventListener('pointerup',e=>{if(rotating!==e.pointerId)return;rotating=null;if(!rotated&&selected!==null)tryDrop(e.clientX,e.clientY,selected)});
renderer.domElement.addEventListener('pointercancel',()=>rotating=null);
new ResizeObserver(resize).observe(host);resize();requestAnimationFrame(tick);reset();
}
function resize(){if(!renderer)return;const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=h>w?41:37;camera.updateProjectionMatrix();camera.position.set(5.2,3.6,8.5);camera.lookAt(0,0,0)}
function tick(){requestAnimationFrame(tick);cube.quaternion.slerp(goal,.15);for(let i=anim.length-1;i>=0;i--){let a=anim[i];a.block.position.z+=(a.z-a.block.position.z)*.19;if(Math.abs(a.z-a.block.position.z)<.015){a.block.position.z=a.z;anim.splice(i,1)}}renderer.render(scene,camera)}
function showError(s){msg.textContent=s;msg.style.color='#a22'}
function play(ok){try{const AC=window.AudioContext||window.webkitAudioContext;audioCtx ||= new AC();if(audioCtx.state==='suspended')audioCtx.resume();for(const [hz,delay] of (ok?[[523,0],[784,.10],[1046,.2]]:[[392,0],[330,.13]])){const o=audioCtx.createOscillator(),g=audioCtx.createGain(),t=audioCtx.currentTime+.01+delay;o.type='sine';o.frequency.value=hz;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.045,t+.025);g.gain.exponentialRampToValueAtTime(.0001,t+.22);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+.23)}}catch(e){}}
function icon(id){const p=points(id).map(([x,y],i)=>(i?'L':'M')+(50+x*96).toFixed(2)+','+(50-y*96).toFixed(2)).join(' ')+'Z';return '<svg viewBox="0 0 100 100"><path d="'+p+'" transform="translate(0 3)" fill="#70472b" opacity=".25"/><path d="'+p+'" fill="'+colors[id]+'" stroke="#fff0cf" stroke-width="3.5" stroke-linejoin="round"/><path d="'+p+'" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></svg>'}
function reset(){stage=0;stars=0;completed.clear();slots.forEach(s=>{s.filled=false;s.block.visible=false});$('stars').textContent='⭐ 0';goal.setFromEuler(new THREE.Euler(-.38,-.52,0,'YXZ'));round()}
function round(){selected=null;$('level').textContent='Փուլ '+(stage+1)+' / 4';$('score').textContent='✓ 0 / 6';$('next').disabled=true;$('next').textContent=stage===3?'Ավարտել ★':'Հաջորդ փուլ →';$('overlay').classList.remove('show');const tray=$('pieces');tray.replaceChildren();const ids=stageIds().map(id=>[Math.random(),id]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);for(const id of ids){const el=document.createElement('button');el.className='piece';el.dataset.id=id;el.setAttribute('aria-label','Ձև '+(id+1));el.innerHTML=icon(id);el.addEventListener('pointerdown',e=>{e.preventDefault();selected=id;document.querySelectorAll('.piece').forEach(p=>p.classList.toggle('selected',p===el));drag={id,x:e.clientX,y:e.clientY,ghost:null};el.setPointerCapture(e.pointerId);msg.textContent='Հիմա դետալը դիր նույն ձևի անցքի վրա'});el.addEventListener('pointermove',e=>{if(!drag||drag.id!==id)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){if(!drag.ghost){drag.ghost=document.createElement('div');drag.ghost.className='ghost';drag.ghost.innerHTML=icon(id);document.body.append(drag.ghost)}drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px'}});el.addEventListener('pointerup',e=>{if(!drag)return;const moved=!!drag.ghost;drag.ghost?.remove();drag=null;if(moved)tryDrop(e.clientX,e.clientY,id)});el.addEventListener('pointercancel',()=>{drag?.ghost?.remove();drag=null});tray.append(el)}msg.textContent='Ընտրիր գունավոր դետալը'}
function tryDrop(x,y,id){if(completed.has(id))return;const r=renderer.domElement.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom){msg.textContent='Տեղափոխիր դետալը խորանարդի վրա';return}const ndc=new THREE.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects([...panels,...slots.map(s=>s.base),cube.children[0]],false);const hit=hits[0];const slot=slots.find(s=>s.base===hit?.object);if(!slot||slot.id!==id){play(false);msg.textContent='Փորձիր մեկ ուրիշ անցք';return}
slot.filled=true;slot.block.visible=true;slot.block.position.z=2.3;anim.push({block:slot.block,z:1.54});completed.add(id);document.querySelector('.piece[data-id="'+id+'"]')?.classList.add('used');selected=null;play(true);const count=stageIds().filter(k=>completed.has(k)).length;$('score').textContent='✓ '+count+' / 6';msg.textContent='Ապրե՜ս, ճիշտ է ✨';if(count===6){stars++;$('stars').textContent='⭐ '+stars;$('next').disabled=false;msg.textContent='Հրաշալի՜, բոլոր 6 ձևերը գտար';if(stage===3)setTimeout(()=>$('overlay').classList.add('show'),1000)}}
function hint(){if(selected===null){msg.textContent='Նախ ընտրիր ներքևի դետալներից մեկը';return}const slot=slots.find(s=>s.id===selected);if(!slot)return;const n=new THREE.Vector3(0,0,1).applyQuaternion(slot.base.parent.quaternion);const dir=camera.position.clone().normalize();goal.copy(new THREE.Quaternion().setFromUnitVectors(n,dir));msg.textContent='Ահա այս կողմում է ճիշտ անցքը 💡'}
$('help').onclick=hint;$('reset').onclick=reset;$('next').onclick=()=>{if(stageIds().some(id=>!completed.has(id)))return;if(stage===3)$('overlay').classList.add('show');else{stage++;round()}};$('again').onclick=reset;$('back').onclick=()=>history.length>1?history.back():location.href='./';
window.addEventListener('error',e=>showError('3D սխալ․ '+(e.message||'Ստուգիր Safari-ն')));setup();