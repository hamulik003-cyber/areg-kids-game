import * as THREE from './vendor/three.module.min.js';
const board=document.querySelector('#menu .board'), menu=document.querySelector('#menu .menu');
if(board&&menu){
 const canvas=document.createElement('canvas');canvas.className='pairs-three-canvas';board.insertBefore(canvas,menu);
 let renderer;try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});}catch(e){console.warn('AREG 3D not available',e);}
 if(renderer){
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.6));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-4.6,4.6,4.6,-4.6,.1,100);camera.position.set(0,0,18);camera.lookAt(0,0,0);
 scene.add(new THREE.HemisphereLight(0xfff4dc,0x986038,2.2));const key=new THREE.DirectionalLight(0xfff7df,3.1);key.position.set(-4,8,12);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
 const mat=(c,roughness=.68,metalness=0)=>new THREE.MeshStandardMaterial({color:c,roughness,metalness});
 const wood=mat(0x9b5b2c),paper=mat(0xffe7b6),cream=mat(0xfff3d9),gold=mat(0xd28c3e,.34,.55),steel=mat(0xb67938,.28,.75),red=mat(0xe72826,.27),green=mat(0x42a53a,.5),yellow=mat(0xfcc52e,.3),blue=mat(0x1679c6,.3),brown=mat(0x98552f);
 const group=new THREE.Group();scene.add(group);const interactive=[];
 function box(parent,w,h,d,x,y,z,m,r=.14){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d,1,1,1),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function sphere(parent,r,x,y,z,m,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,20,14),m);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);mesh.castShadow=true;parent.add(mesh);return mesh}
 function torus(parent,r,t,x,y,z,m){const mesh=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,28),m);mesh.position.set(x,y,z);mesh.castShadow=true;parent.add(mesh);return mesh}
 function createObject(parent,id,x,y,z,scale){const g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
 if(id===0){for(const dx of [-.43,.43]){sphere(g,.45,dx,0,.12,red,1,.96,.8);box(g,.09,.23,.08,dx+.08,.48,.13,brown);sphere(g,.18,dx+.25,.5,.15,green,1.3,.45,.6)}}
 if(id===1){for(const dx of [-.43,.43]){sphere(g,.4,dx,-.13,.12,dx<0?brown:mat(0xaaa9a6),1,.85,.8);sphere(g,.36,dx,.28,.17,dx<0?brown:mat(0xaaa9a6));for(const e of [-.19,.19]){sphere(g,.075,dx+e,.32,.5,mat(0x1d1715));sphere(g,.12,dx+e,.62,.12,dx<0?brown:mat(0xaaa9a6))}sphere(g,.095,dx,.1,.53,mat(0x2c1a15))}}
 if(id===2){for(const dx of [-.45,.45]){box(g,.76,.48,.43,dx,-.12,.13,dx<0?red:yellow);box(g,.42,.3,.44,dx+.12,.25,.12,dx<0?red:blue);for(const w of [-.24,.24])sphere(g,.15,dx+w,-.4,.43,mat(0x2c2e35));}}
 if(id===3){for(const dx of [-.44,.44]){if(dx<0){for(let k=0;k<4;k++){const wing=sphere(g,.26,dx+(k%2?.24:-.24),k<2?.23:-.17,.16,k%2?blue:yellow,1.05,.65,.32);wing.rotation.z=k%2?-.4:.4}box(g,.09,.8,.08,dx,0,.3,brown)}else{box(g,.09,.8,.08,dx,-.23,.1,green);for(let k=0;k<7;k++){const petal=sphere(g,.23,dx+Math.sin(k*Math.PI*2/7)*.27,.18+Math.cos(k*Math.PI*2/7)*.27,.18,mat(0xba56d6),.9,1,.45);petal.rotation.z=-k*Math.PI*2/7}sphere(g,.17,dx,.18,.47,yellow)}}}
 if(id===4){sphere(g,.42,-.42,-.04,.13,blue);for(let k=0;k<5;k++){const a=k*Math.PI*2/5;sphere(g,.18,-.42+Math.cos(a)*.32,-.04+Math.sin(a)*.32,.4,k%2?yellow:red)}sphere(g,.37,.45,-.06,.13,brown);for(const e of [-.22,.22])sphere(g,.16,.45+e,.3,.15,brown);sphere(g,.24,.45,-.34,.22,brown);sphere(g,.16,.45,0,.48,mat(0xd5b089)) }
 if(id===5){sphere(g,.39,-.43,0,.12,yellow);for(let k=0;k<10;k++){const a=k*Math.PI/5;sphere(g,.12,-.43+Math.cos(a)*.51,Math.sin(a)*.51,.1,yellow)}sphere(g,.37,.46,.04,.1,mat(0xf3f5fc));sphere(g,.32,.65,.18,.32,blue);for(let k=0;k<4;k++)sphere(g,.035,.16+k*.23,.35-(k%2)*.6,.34,cream)}
 return g}
 function build(w,h){while(group.children.length){const child=group.children[0];group.remove(child)}interactive.length=0;const aspect=w/h;const worldW=8,worldH=worldW/aspect;camera.left=-4;camera.right=4;camera.top=worldH/2;camera.bottom=-worldH/2;camera.updateProjectionMatrix();
 const unit=Math.min(1,worldH/9);group.scale.setScalar(1);
 box(group,7.75,worldH-.3,.35,0,-.05,-.8,wood);
 box(group,7.43,worldH-.62,.13,0,-.05,-.52,paper);
 const gap=.15,cw=(7.08-2*gap)/3,ch=(worldH-1.15-gap)/2;
 for(let i=0;i<6;i++){const col=i%3,row=Math.floor(i/3),x=(col-1)*(cw+gap),y=(.5-row)*(ch+gap)-.06;const tile=new THREE.Group();tile.position.set(x,y,0);group.add(tile);
 box(tile,cw,ch,.22,0,0,-.24,cream);box(tile,cw*.87,ch*.69,.025,0,ch*.12,-.09,mat(0xfff9ed));
 const art=createObject(tile,i,0,ch*.13,.14,Math.min(cw*.5,ch*.27));interactive.push(tile)}
 const ringY=worldH/2-.33;for(let i=0;i<9;i++){const x=-3.25+i*.81;const ring=torus(group,.16,.065,x,ringY,.05,steel);ring.scale.y=1.8;}
 renderer.setSize(w,h,false);renderer.render(scene,camera)}
 const ro=new ResizeObserver(()=>{const b=board.getBoundingClientRect();if(b.width&&b.height)build(Math.round(b.width),Math.round(b.height))});ro.observe(board);
 let frame=0;function tick(t){if(document.hidden||!document.querySelector('#menu.active')){frame=requestAnimationFrame(tick);return}interactive.forEach((g,i)=>{const a=g.children[g.children.length-1];if(a)a.rotation.y=Math.sin(t*.00055+i)*.07});renderer.render(scene,camera);frame=requestAnimationFrame(tick)}frame=requestAnimationFrame(tick);
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);ro.disconnect();renderer.dispose()},{once:true});
 }
}
