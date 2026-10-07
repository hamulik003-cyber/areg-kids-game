import * as THREE from './vendor/three.module.min.js';

const DATA={
  earth:{name:'Երկիր',find:'Երկիրը',texture:'space-assets/earth/texture-2k.png',yaw:-93.5,roll:0,scale:.90,shape:[1,1,1],spin:.16,atmosphere:0x38b8ff},
  jupiter:{name:'Յուպիտեր',find:'Յուպիտերը',texture:'assets/space3d/2k_jupiter.jpg',yaw:-43.58,roll:-1.12,scale:1.03,shape:[1,.94,1],spin:.20},
  saturn:{name:'Սատուրն',find:'Սատուրնը',texture:'assets/space3d/2k_saturn.jpg',yaw:-10.95,roll:32.73,scale:.78,shape:[1,.91,1],spin:.17,ring:true,ringScale:1.10,ringX:-1.14,ringZ:.29}
};

const stage=document.getElementById('stage'),canvas=document.getElementById('scene'),loading=document.getElementById('loading'),prompt=document.getElementById('prompt'),scoreEl=document.getElementById('score');
const buttons=[...document.querySelectorAll('[data-target]')];

const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.NoToneMapping;
renderer.setClearColor(0x000000,0);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(45,1,.1,50);
camera.position.set(0,.1,8.9);

const starGeo=new THREE.BufferGeometry(),count=900,arr=new Float32Array(count*3);
for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*15;arr[i*3+1]=(Math.random()-.5)*12;arr[i*3+2]=-3-Math.random()*10}
starGeo.setAttribute('position',new THREE.BufferAttribute(arr,3));
scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xe9f3ff,size:.035,transparent:true,opacity:.8,depthWrite:false})));

const loader=new THREE.TextureLoader();
const roots=new Map();

function glowSprite(color){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,6,64,64,62);
  g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.35,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);const tex=new THREE.CanvasTexture(c);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color,transparent:true,opacity:.0,depthWrite:false,blending:THREE.AdditiveBlending}));
  s.scale.set(2.9,2.9,1);s.visible=false;return s;
}

function saturnRing(){
  const tex=loader.load('assets/space3d/2k_saturn_ring_alpha.png');tex.colorSpace=THREE.SRGBColorSpace;
  const geo=new THREE.RingGeometry(1.20,2.02,180),p=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getY(i));uv.setXY(i,Math.max(0,Math.min(1,(r-1.20)/.82)),.5)}
  return new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,alphaMap:tex,color:0xffd77a,side:THREE.DoubleSide,transparent:true,opacity:.98,alphaTest:.014,depthWrite:true}));
}

async function build(id){
  const d=DATA[id],root=new THREE.Group();root.userData.id=id;root.userData.base=d.scale;root.userData.spin=d.spin;
  const tex=await loader.loadAsync(d.texture);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;
  const geo=new THREE.SphereGeometry(1,128,96),mat=new THREE.MeshBasicMaterial({map:tex});
  const mesh=new THREE.Mesh(geo,mat);mesh.scale.set(...d.shape);mesh.rotation.y=THREE.MathUtils.degToRad(d.yaw);mesh.rotation.z=THREE.MathUtils.degToRad(d.roll);mesh.userData.root=root;root.add(mesh);root.userData.surface=mesh;
  if(d.ring){const ring=saturnRing();ring.rotation.set(d.ringX,0,d.ringZ);ring.scale.setScalar(d.ringScale);ring.userData.root=root;root.add(ring)}
  if(d.atmosphere){const atm=new THREE.Mesh(new THREE.SphereGeometry(1.04,96,64),new THREE.MeshBasicMaterial({color:d.atmosphere,transparent:true,opacity:.11,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));atm.userData.root=root;root.add(atm)}
  const good=glowSprite(0x55ff8d),bad=glowSprite(0xff3b52);root.add(good,bad);root.userData.good=good;root.userData.bad=bad;
  root.scale.setScalar(d.scale);roots.set(id,root);scene.add(root);return root;
}

await Promise.all(Object.keys(DATA).map(build));
const order=['earth','jupiter','saturn'];
roots.get('earth').position.set(-2.35,.55,0);
roots.get('jupiter').position.set(0,-.75,0);
roots.get('saturn').position.set(2.25,.65,0);
loading.classList.add('is-hidden');

let target='earth',score=0,busy=false;
function setTarget(id){
  target=id;prompt.textContent=DATA[id].find;buttons.forEach(b=>b.classList.toggle('active',b.dataset.target===id));
}
buttons.forEach(b=>b.addEventListener('click',()=>setTarget(b.dataset.target)));

const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
function pick(ev){
  if(busy)return;
  const r=canvas.getBoundingClientRect();pointer.x=((ev.clientX-r.left)/r.width)*2-1;pointer.y=-((ev.clientY-r.top)/r.height)*2+1;
  ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...roots.values()],true);
  if(!hits.length)return;
  let o=hits[0].object,root=null;while(o){if(o.userData&&o.userData.id){root=o;break}if(o.userData&&o.userData.root){root=o.userData.root;break}o=o.parent}
  if(!root)return;
  const ok=root.userData.id===target;busy=true;
  const glow=ok?root.userData.good:root.userData.bad;glow.visible=true;glow.material.opacity=.72;
  const base=root.userData.base,start=performance.now(),dur=700;
  if(ok){score=Math.min(3,score+1);scoreEl.textContent=score}
  function anim(t){const p=Math.min(1,(t-start)/dur),bump=1+Math.sin(p*Math.PI)*(ok?.28:.10);root.scale.setScalar(base*bump);glow.material.opacity=.72*(1-p);if(p<1)requestAnimationFrame(anim);else{root.scale.setScalar(base);glow.visible=false;busy=false;if(ok){const idx=(order.indexOf(target)+1)%order.length;setTarget(order[idx])}}}
  requestAnimationFrame(anim);
}
canvas.addEventListener('pointerup',pick);

function resize(){const w=Math.max(2,stage.clientWidth),h=Math.max(2,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;for(const r of roots.values())r.userData.surface.rotation.y+=r.userData.spin*dt;renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
