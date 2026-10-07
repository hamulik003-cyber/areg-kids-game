import * as THREE from './vendor/three.module.min.js';

const DATA={
  earth:{name:'Երկիր',find:'Երկիրը',texture:'space-assets/earth/texture-2k.png',yaw:-93.5,roll:0,scale:.90,shape:[1,1,1],spin:.16,atmosphere:0x38b8ff},
  jupiter:{name:'Յուպիտեր',find:'Յուպիտերը',texture:'assets/space3d/2k_jupiter.jpg',yaw:-43.58,roll:-1.12,scale:1.03,shape:[1,.94,1],spin:.20},
  saturn:{name:'Սատուրն',find:'Սատուրնը',texture:'assets/space3d/2k_saturn.jpg',yaw:-10.95,roll:32.73,scale:.78,shape:[1,.91,1],spin:.17,ring:'saturn',ringScale:1.10,ringX:-1.14,ringZ:.29},
  phobos:{name:'Ֆոբոս',find:'Ֆոբոսը',texture:'assets/space3d/2k_phobos.jpg',yaw:-112,roll:3.5,scale:.62,spin:.14,shapeKind:'phobos',shapeParams:{x:1.18,y:.96,z:.86,deform:.125,seed:.45}},
  haumea:{name:'Հաումեա',find:'Հաումեան',texture:'space-assets/haumea/texture-2k.png',yaw:-79,roll:23.5,scale:.62,spin:.22,shapeKind:'haumea',shapeParams:{x:1.56,y:.91,z:.78,deform:.020,seed:4.2},ring:'haumea',ringScale:.89,ringX:-1.16,ringZ:.445}
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

function haumeaRing(){
  const g=new THREE.Group();
  const specs=[[1.18,1.205,.38,0xd8ecff],[1.235,1.252,.82,0xf3f8ff],[1.276,1.289,.34,0xaecfee]];
  for(const [a,b,o,c] of specs){
    const m=new THREE.Mesh(new THREE.RingGeometry(a,b,220),new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));
    m.material.toneMapped=false;g.add(m);
  }
  return g;
}

function bodyGeometry(d){
  if(!d.shapeKind)return new THREE.SphereGeometry(1,128,96);
  const geo=new THREE.SphereGeometry(1,128,96),p=geo.attributes.position,v=new THREE.Vector3(),shape=d.shapeParams;
  const yaw=THREE.MathUtils.degToRad(d.yaw),cy=Math.cos(yaw),sy=Math.sin(yaw);
  const q=d.shapeKind==='phobos'?3.05:2.0;
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i).normalize();
    const fx=v.x*cy+v.z*sy,fy=v.y,fz=-v.x*sy+v.z*cy;
    const denom=Math.pow(Math.pow(Math.abs(fx)/shape.x,q)+Math.pow(Math.abs(fy)/shape.y,q)+Math.pow(Math.abs(fz)/shape.z,q),1/q);
    let r=1/Math.max(.0001,denom);
    if(d.shapeKind==='phobos'){
      const low=Math.sin(fx*2.20+fy*1.05+shape.seed)*.40+Math.sin(fy*2.85-fz*1.65+shape.seed*1.35)*.34+Math.cos(fz*2.15+fx*1.45-shape.seed*.70)*.26;
      r*=1+shape.deform*low;
      r*=1+.080*fx-.050*fy+.055*fx*fy-.035*fy*fy*fx+.032*fx*fz;
      const dot=fx*.48+fy*.03+fz*.876,t=Math.max(0,Math.min(1,(dot-.80)/.20)),bowl=Math.sin(t*Math.PI);
      r*=1-.105*bowl*bowl;
    }else{
      const low=Math.sin(fx*2.2+shape.seed)*.45+Math.sin(fy*2.7-shape.seed)*.30+Math.cos(fz*2.0+shape.seed*.7)*.25;
      r*=1+shape.deform*low;
    }
    const sx=fx*r,syf=fy*r,sz=fz*r,lx=sx*cy-sz*sy,lz=sx*sy+sz*cy;
    p.setXYZ(lx,syf,lz);
  }
  p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();return geo;
}

async function build(id){
  const d=DATA[id],root=new THREE.Group();root.userData.id=id;root.userData.base=d.scale;root.userData.spin=d.spin;
  const tex=await loader.loadAsync(d.texture);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=THREE.RepeatWrapping;
  const geo=bodyGeometry(d),mat=new THREE.MeshBasicMaterial({map:tex});
  const mesh=new THREE.Mesh(geo,mat);mesh.scale.set(...(d.shape||[1,1,1]));mesh.rotation.y=THREE.MathUtils.degToRad(d.yaw);mesh.rotation.z=THREE.MathUtils.degToRad(d.roll);mesh.userData.root=root;root.add(mesh);root.userData.surface=mesh;
  if(d.ring){const ring=d.ring==='haumea'?haumeaRing():saturnRing();ring.rotation.set(d.ringX,0,d.ringZ);ring.scale.setScalar(d.ringScale);ring.userData.root=root;root.add(ring)}
  if(d.atmosphere){const atm=new THREE.Mesh(new THREE.SphereGeometry(1.04,96,64),new THREE.MeshBasicMaterial({color:d.atmosphere,transparent:true,opacity:.11,side:THREE.BackSide,blending:THREE.AdditiveBlending,depthWrite:false}));atm.userData.root=root;root.add(atm)}
  const good=glowSprite(0x55ff8d),bad=glowSprite(0xff3b52);root.add(good,bad);root.userData.good=good;root.userData.bad=bad;
  root.scale.setScalar(d.scale);roots.set(id,root);scene.add(root);return root;
}

await Promise.all(Object.keys(DATA).map(build));
const order=['earth','jupiter','saturn','phobos','haumea'];
roots.get('earth').position.set(-2.35,1.15,0);
roots.get('jupiter').position.set(0,1.45,0);
roots.get('saturn').position.set(2.25,1.05,0);
roots.get('phobos').position.set(-1.30,-1.25,0);
roots.get('haumea').position.set(1.45,-1.20,0);
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
  if(ok){score=Math.min(5,score+1);scoreEl.textContent=score}
  function anim(t){const p=Math.min(1,(t-start)/dur),bump=1+Math.sin(p*Math.PI)*(ok?.28:.10);root.scale.setScalar(base*bump);glow.material.opacity=.72*(1-p);if(p<1)requestAnimationFrame(anim);else{root.scale.setScalar(base);glow.visible=false;busy=false;if(ok){const idx=(order.indexOf(target)+1)%order.length;setTarget(order[idx])}}}
  requestAnimationFrame(anim);
}
canvas.addEventListener('pointerup',pick);

function resize(){const w=Math.max(2,stage.clientWidth),h=Math.max(2,stage.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;for(const r of roots.values())r.userData.surface.rotation.y+=r.userData.spin*dt;renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
