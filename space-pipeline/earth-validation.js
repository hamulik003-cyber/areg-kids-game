import * as THREE from '../vendor/three.module.min.js';
const FRONT_Y=THREE.MathUtils.degToRad(-93.5),texUrl='../space-assets/earth/texture-2k.png';
const badge=document.getElementById('angleBadge'),scaleRange=document.getElementById('scaleRange'),scaleValue=document.getElementById('scaleValue'),yawRange=document.getElementById('yawRange'),yawValue=document.getElementById('yawValue'),autoRotate=document.getElementById('autoRotate'),overlayOpacity=document.getElementById('overlayOpacity'),overlayImg=document.getElementById('overlayImg'),buttons=[...document.querySelectorAll('[data-angle]')];
let presetDeg=0,yawDeg=0,scale=1.292,autoDeg=0,last=performance.now();
function makeView(canvas){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;renderer.setClearColor(0x020612,1);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1.35,1.35,1.35,-1.35,.1,10);camera.position.set(0,0,3);
 const texture=new THREE.TextureLoader().load(texUrl);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=THREE.RepeatWrapping;
 const earth=new THREE.Mesh(new THREE.SphereGeometry(1,128,96),new THREE.MeshBasicMaterial({map:texture}));scene.add(earth);
 return {renderer,scene,camera,earth,canvas};
}
const views=[makeView(document.getElementById('earthCanvas')),makeView(document.getElementById('overlayCanvas'))];
function resize(v){const r=v.canvas.parentElement.getBoundingClientRect();v.renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false)}
function render(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(autoRotate.checked)autoDeg=(autoDeg+dt*18)%360;const deg=presetDeg+yawDeg+(autoRotate.checked?autoDeg:0),rot=FRONT_Y+THREE.MathUtils.degToRad(deg);views.forEach(v=>{resize(v);v.earth.rotation.set(0,rot,0);v.earth.scale.setScalar(scale);v.renderer.render(v.scene,v.camera)});badge.textContent=Math.round(((deg%360)+360)%360)+'°';requestAnimationFrame(render)}
buttons.forEach(btn=>btn.addEventListener('click',()=>{presetDeg=Number(btn.dataset.angle)||0;autoDeg=0;buttons.forEach(b=>b.classList.toggle('active',b===btn))}));
scaleRange.addEventListener('input',()=>{scale=Number(scaleRange.value)/100;scaleValue.value=scale.toFixed(2)});
yawRange.addEventListener('input',()=>{yawDeg=Number(yawRange.value)||0;yawValue.value=yawDeg+'°'});
overlayOpacity.addEventListener('input',()=>{overlayImg.style.opacity=String(Number(overlayOpacity.value)/100)});
requestAnimationFrame(render);
