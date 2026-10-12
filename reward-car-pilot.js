// V291 pilot: standalone, on-demand REAL 3D road scene for the unlocked car reward.
// Does not mutate stars, reward unlocks, game navigation or saved settings.
let active = false;

const RULES = [
  '.areg-car-pilot{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;touch-action:none;isolation:isolate}',
  '.areg-car-pilot-shade{position:absolute;inset:0;background:rgba(12,18,43,.75);backdrop-filter:blur(4px);opacity:0;transition:opacity 500ms ease}',
  '.areg-car-pilot-card{position:relative;overflow:hidden;width:min(90vw,520px);height:min(57dvh,440px);min-height:270px;border:5px solid #ffe49a;border-radius:32px;background:linear-gradient(#b9dff3,#d7e8cf);box-shadow:0 20px 65px #08122688,inset 0 0 0 2px #ffffff66;transform-origin:50% 50%;will-change:transform;contain:layout paint}',
  '.areg-car-pilot-stage{position:absolute;inset:0 0 58px;overflow:hidden;background:linear-gradient(#b9dff3 0%,#eaf2ea 73%,#a9c68b 74%);display:grid;place-items:center}',
  '.areg-car-pilot-stage canvas{display:block;width:100%;height:100%;object-fit:cover}',
  '.areg-car-pilot-loading{position:absolute;font-size:95px;filter:drop-shadow(0 9px 5px #15342b45);animation:aregCarReady 1.3s ease-in-out infinite alternate}',
  '.areg-car-pilot-title{position:absolute;left:0;right:0;bottom:0;height:58px;background:linear-gradient(#f7cf91,#d89b57);display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:900;color:#613518;border-top:3px solid #b9783f}',
  '.areg-car-pilot-exit{position:absolute;z-index:4;right:12px;top:12px;width:44px;height:44px;display:grid;place-items:center;border-radius:50%;border:2px solid #fff8da;background:#543926db;color:#fff;font-size:28px;cursor:pointer}',
  '.areg-car-pilot[data-show="1"] .areg-car-pilot-shade{opacity:1}',
  '.areg-car-pilot[data-leave="1"] .areg-car-pilot-shade{opacity:0}',
  '@keyframes aregCarReady{to{transform:translateY(-8px)}}',
  '@media (prefers-reduced-motion:reduce){.areg-car-pilot-loading{animation:none}.areg-car-pilot-shade{transition:none}}'
].join('\n');

function makeBox(T, host, size, pos, material) {
  const obj = new T.Mesh(new T.BoxGeometry(...size), material);
  obj.position.set(...pos);
  host.add(obj);
  return obj;
}
function modelCar(T) {
  const car = new T.Group();
  const paint = new T.MeshStandardMaterial({color:0xf75b3e, metalness:.24, roughness:.39});
  const paintTop = new T.MeshStandardMaterial({color:0xfc7958, metalness:.16, roughness:.38});
  const windowMat = new T.MeshStandardMaterial({color:0x274e68, metalness:.25, roughness:.23});
  const shadowMat = new T.MeshStandardMaterial({color:0x232835, metalness:.04, roughness:.95});
  const chrome = new T.MeshStandardMaterial({color:0xe5e5da, metalness:.4, roughness:.3});
  const lamps = new T.MeshStandardMaterial({color:0xfff5c0, emissive:0xffcc73, emissiveIntensity:.32});
  makeBox(T,car,[1.93,.57,3.16],[0,.69,0],paint);
  makeBox(T,car,[1.92,.21,3.20],[0,.49,0],shadowMat);
  makeBox(T,car,[1.62,.66,1.63],[0,1.26,.14],paintTop);
  makeBox(T,car,[1.39,.38,.064],[0,1.30,-.72],windowMat);
  makeBox(T,car,[1.40,.37,.062],[0,1.30,1.0],windowMat);
  for (const side of [-1,1]){
    makeBox(T,car,[.066,.39,1.00],[side*.815,1.29,.10],windowMat);
    makeBox(T,car,[.13,.17,.20],[side*.96,1.08,-.55],chrome);
    makeBox(T,car,[.29,.21,.065],[side*.69,.76,-1.59],lamps);
    makeBox(T,car,[.26,.18,.059],[side*.70,.72,1.59],new T.MeshStandardMaterial({color:0xc91e19,emissive:0x661000}));
  }
  makeBox(T,car,[1.92,.10,.16],[0,.44,-1.64],chrome);
  makeBox(T,car,[1.92,.09,.12],[0,.43,1.64],chrome);
  const tire = new T.MeshStandardMaterial({color:0x1b2430,roughness:.96});
  const rim = new T.MeshStandardMaterial({color:0xe0d7bf,metalness:.45,roughness:.32});
  const wheels=[];
  for (const side of [-1,1]) for (const z of [-1.03,1.09]) {
    const pivot=new T.Group();pivot.position.set(side*.99,.39,z);car.add(pivot);
    const rubber=new T.Mesh(new T.CylinderGeometry(.37,.37,.25,28),tire);
    rubber.rotation.z=Math.PI/2;pivot.add(rubber);
    const hub=new T.Mesh(new T.CylinderGeometry(.19,.19,.275,20),rim);
    hub.rotation.z=Math.PI/2;pivot.add(hub);
    wheels.push(pivot);
  }
  return {car,wheels};
}

function start3D(stage, reduced) {
  return import('./vendor/three.module.min.js').then(T=>{
    if(!stage.isConnected) return ()=>{};
    const renderer = new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(1.5,window.devicePixelRatio||1));
    renderer.setSize(Math.max(2,stage.clientWidth),Math.max(2,stage.clientHeight),false);
    renderer.setClearColor(0xb9dff2,1);
    renderer.domElement.setAttribute('aria-label','Եռաչափ մեքենան շարժվում է ճանապարհով');
    stage.replaceChildren(renderer.domElement);
    const scene=new T.Scene();
    scene.fog=new T.Fog(0xb9dff2,28,70);
    const camera=new T.PerspectiveCamera(39,stage.clientWidth/Math.max(1,stage.clientHeight),.1,120);
    scene.add(new T.HemisphereLight(0xf6fcff,0x64704a,2.05));
    const sunlight=new T.DirectionalLight(0xfff1d3,2.45);
    sunlight.position.set(-4,10,7);scene.add(sunlight);
    const ground=new T.Mesh(new T.PlaneGeometry(140,170),new T.MeshLambertMaterial({color:0x8cae77}));
    ground.rotation.x=-Math.PI/2;ground.position.set(0,-.06,-21);scene.add(ground);
    const road=new T.Mesh(new T.PlaneGeometry(5.35,90),new T.MeshStandardMaterial({color:0x444c59,roughness:.99}));
    road.rotation.x=-Math.PI/2;road.position.set(0,0,-22);scene.add(road);
    const lineMat=new T.MeshBasicMaterial({color:0xffe29a});
    const sideMat=new T.MeshBasicMaterial({color:0xd1cec0});
    for(const x of [-2.52,2.52]){
      const edge=new T.Mesh(new T.PlaneGeometry(.085,90),sideMat);
      edge.rotation.x=-Math.PI/2;edge.position.set(x,.015,-22);scene.add(edge);
    }
    for(let z=-67;z<20;z+=4.15){
      const stripe=new T.Mesh(new T.PlaneGeometry(.12,1.82),lineMat);
      stripe.rotation.x=-Math.PI/2;stripe.position.set(0,.02,z);scene.add(stripe);
    }
    const bark=new T.MeshStandardMaterial({color:0x9b6a3c,roughness:1});
    const pine=new T.MeshStandardMaterial({color:0x387a54,roughness:1});
    for(let z=-52;z<15;z+=6.3){
      for(let sign of [-1,1]){
        const x=sign*(4.15+((Math.abs(Math.round(z))*7)%9)*.15);
        const trunk=new T.Mesh(new T.CylinderGeometry(.13,.17,.9,7),bark);
        trunk.position.set(x,.40,z);scene.add(trunk);
        const foliage=new T.Mesh(new T.ConeGeometry(.85,2.15,8),pine);
        foliage.position.set(x,1.55,z);scene.add(foliage);
      }
    }
    const {car,wheels}=modelCar(T);scene.add(car);
    const undercar=new T.Mesh(new T.CircleGeometry(1.42,36),new T.MeshBasicMaterial({color:0x1c2630,transparent:true,opacity:.22,depthWrite:false}));
    undercar.rotation.x=-Math.PI/2;undercar.scale.y=1.22;undercar.position.set(-1.10,.03,2.5);scene.add(undercar);
    let raf=0,stopped=false,startedAt=0,lastFrame=0;
    const tick=now=>{
      if(stopped)return;
      if(!startedAt)startedAt=now;
      const seconds=Math.min(3.2,(now-startedAt)/1000);
      const p=seconds/3.2;
      const travel=p*p*(3-2*p);
      car.position.set(-1.10,.015*Math.sin(seconds*18),2.45-11.3*travel);
      undercar.position.z=car.position.z;
      wheels.forEach(w=>{w.rotation.x=-seconds*12});
      camera.position.set(5.0,4.25,12.3-9.2*travel);
      camera.lookAt(-.72,.85,-.75-9.2*travel);
      if(!reduced||!lastFrame)renderer.render(scene,camera);
      lastFrame=now;
      if(seconds<3.2&&!reduced)raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);
    const onResize=()=>{
      if(stopped)return;
      const w=stage.clientWidth,h=stage.clientHeight;
      if(w<2||h<2)return;
      camera.aspect=w/h;camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
      renderer.render(scene,camera);
    };
    window.addEventListener('resize',onResize);
    return ()=>{
      stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',onResize);
      scene.traverse(obj=>{if(obj.geometry)obj.geometry.dispose();if(obj.material){for(const m of (Array.isArray(obj.material)?obj.material:[obj.material]))m.dispose();}});
      renderer.dispose();renderer.forceContextLoss?.();
      renderer.domElement.remove();
    };
  });
}

export async function playCarReward(sourceCard) {
  if(active||!sourceCard?.isConnected||!sourceCard.classList.contains('is-unlocked'))return;
  active=true;
  const originalFocus=document.activeElement;
  if(!document.getElementById('areg-car-pilot-style')){
    const style=document.createElement('style');style.id='areg-car-pilot-style';style.textContent=RULES;
    document.head.append(style);
  }
  const overlay=document.createElement('div');overlay.className='areg-car-pilot';
  overlay.innerHTML='<div class="areg-car-pilot-shade"></div><div class="areg-car-pilot-card" role="dialog" aria-modal="true" aria-label="Մեքենայի եռաչափ ճանապարհային տեսարան"><div class="areg-car-pilot-stage"><span class="areg-car-pilot-loading" aria-hidden="true">🚗</span></div><div class="areg-car-pilot-title">Մեքենա</div><button type="button" class="areg-car-pilot-exit" aria-label="Փակել">×</button></div>';
  document.body.append(overlay);
  const target=overlay.querySelector('.areg-car-pilot-card');
  const stage=overlay.querySelector('.areg-car-pilot-stage');
  const src=sourceCard.getBoundingClientRect(),dst=target.getBoundingClientRect();
  const from='translate3d('+(src.left+src.width/2-dst.left-dst.width/2)+'px,'+(src.top+src.height/2-dst.top-dst.height/2)+'px,0) scale('+(src.width/dst.width)+','+(src.height/dst.height)+')';
  const noMotion=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  let closed=false,dispose=()=>{},timer=0,flight=null;
  const close=async()=>{
    if(closed)return;
    closed=true;document.removeEventListener('keydown',key);clearTimeout(timer);dispose();
    overlay.dataset.leave='1';
    if(!noMotion&&target.animate){
      try{const a=target.animate([{transform:'none',opacity:1},{transform:from,opacity:.1}],{duration:510,easing:'cubic-bezier(.45,0,.45,1)',fill:'forwards'});await a.finished;}catch{}
    }
    overlay.remove();active=false;
    if(originalFocus?.isConnected)originalFocus.focus({preventScroll:true});
  };
  overlay.querySelector('.areg-car-pilot-exit').addEventListener('click',close);
  overlay.querySelector('.areg-car-pilot-shade').addEventListener('click',close);
  const key=e=>{if(e.key==='Escape'){e.preventDefault();close()}};
  document.addEventListener('keydown',key);
  overlay.dataset.show='1';
  if(!noMotion&&target.animate){
    try{flight=target.animate([{transform:from,opacity:.88},{transform:'none',opacity:1}],{duration:740,easing:'cubic-bezier(.2,.18,.26,1)',fill:'forwards'});await flight.finished;}catch{}
  }
  if(closed){document.removeEventListener('keydown',key);return;}
  overlay.querySelector('.areg-car-pilot-exit').focus({preventScroll:true});
  try{
    dispose=await start3D(stage,noMotion);
  }catch(error){
    console.warn('3D reward scene unavailable, showing the original car preview.',error);
    stage.innerHTML='<span class="areg-car-pilot-loading" aria-hidden="true">🚗</span>';
  }
  timer=setTimeout(close,noMotion?1200:3850);
}
