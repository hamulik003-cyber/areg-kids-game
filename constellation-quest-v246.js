// AREG V246 — lightweight standalone 3D "Վառիր համաստեղությունը".
// Deliberately separate from the approved Space Search renderer and assets.
import * as THREE from './vendor/three.module.min.js';

// Hand-composed, child-friendly connected star trails (0..1 coordinates).
// These are gameplay diagrams, NOT scientific star charts. The approved
// original image for each constellation is revealed only on completion.
const TRAILS={
  'hayk-orion':'0.24,.13 .37,.30 .52,.39 .66,.27 .82,.13 .66,.27 .56,.50 .46,.60 .39,.73 .29,.89',
  'ursa-major':'0.12,.31 .27,.24 .42,.30 .56,.22 .75,.31 .79,.50 .61,.57 .56,.22',
  'ursa-minor':'0.15,.74 .29,.65 .45,.59 .54,.49 .68,.40 .79,.50 .72,.67 .54,.49',
  'cassiopeia':'0.12,.36 .28,.68 .46,.37 .64,.63 .82,.27',
  'andromeda':'0.18,.72 .31,.56 .46,.42 .62,.30 .80,.16 .60,.30 .72,.57',
  'pegasus':'0.20,.26 .74,.25 .75,.69 .24,.70 .20,.26 .12,.14 .27,.13',
  'cepheus':'0.27,.35 .51,.18 .75,.36 .68,.73 .33,.76 .27,.35 .51,.18',
  'draco':'0.12,.21 .29,.27 .44,.15 .61,.23 .75,.41 .71,.61 .55,.75 .38,.66 .28,.84',
  'cygnus':'0.49,.12 .48,.33 .52,.52 .51,.76 .50,.89 .52,.52 .18,.43 .52,.52 .82,.63',
  'lyra':'0.22,.15 .48,.31 .72,.43 .65,.70 .38,.73 .48,.31 .38,.73',
  'leo':'0.27,.72 .18,.53 .27,.30 .45,.17 .63,.30 .58,.52 .76,.68 .89,.73',
  'cancer':'0.51,.13 .47,.34 .51,.54 .34,.72 .51,.54 .76,.76',
  'taurus':'0.13,.78 .30,.62 .46,.51 .62,.61 .82,.76 .46,.51 .65,.32 .78,.17',
  'scorpius':'0.18,.18 .33,.29 .46,.38 .50,.53 .58,.66 .70,.76 .85,.67 .78,.54',
  'libra':'0.28,.22 .69,.25 .78,.65 .30,.69 .28,.22 .69,.25 .30,.69',
  'hayk-belt':'0.18,.61 .36,.51 .54,.40 .75,.30',
  'aquarius':'0.23,.21 .40,.31 .55,.19 .72,.30 .57,.47 .48,.65 .31,.79 .52,.85',
  'virgo':'0.13,.26 .31,.36 .51,.28 .65,.42 .78,.65 .50,.68 .31,.36 .19,.75',
  'gemini':'0.25,.16 .32,.37 .28,.68 .22,.85 .32,.37 .68,.41 .74,.72 .80,.85 .68,.41 .72,.18',
  'capricornus':'0.14,.34 .35,.67 .52,.79 .73,.68 .86,.33 .52,.48 .14,.34',
  'aries':'0.20,.75 .38,.51 .56,.37 .74,.32 .82,.17',
  'pisces':'0.20,.19 .35,.28 .40,.47 .29,.54 .13,.44 .20,.19 .40,.47 .58,.62 .75,.78 .86,.67 .77,.55 .58,.62',
  'perseus':'0.28,.12 .45,.28 .57,.45 .67,.65 .82,.81 .57,.45 .36,.69 .20,.85',
  'hercules':'0.30,.31 .45,.20 .65,.28 .66,.51 .47,.59 .30,.31 .24,.69 .12,.84 .47,.59 .62,.80 .78,.89',
  'aquila':'0.16,.36 .36,.50 .52,.45 .77,.22 .52,.45 .68,.67 .84,.80',
  'delphinus':'0.22,.27 .50,.18 .74,.39 .59,.62 .34,.58 .22,.27 .59,.62 .76,.80',
  'phoenix':'0.13,.70 .37,.47 .53,.22 .65,.49 .83,.64 .65,.49 .53,.77 .37,.47',
  'hydra':'0.13,.31 .25,.21 .38,.36 .51,.44 .62,.59 .78,.64 .86,.80',
  'canis-major':'0.24,.20 .43,.34 .59,.42 .74,.26 .59,.42 .53,.65 .32,.73 .20,.87 .53,.65 .77,.83',
  'canis-minor':'0.27,.72 .74,.26',
  'sagittarius':'0.16,.57 .38,.51 .54,.31 .73,.48 .63,.72 .38,.51 .28,.78 .63,.72 .85,.85',
  'ophiuchus':'0.29,.13 .59,.21 .69,.42 .61,.70 .42,.85 .26,.66 .21,.37 .29,.13 .42,.85',
  'corona-borealis':'0.15,.52 .26,.37 .41,.26 .56,.28 .71,.39 .82,.55 .73,.73',
  'cetus':'0.16,.19 .37,.24 .51,.41 .68,.37 .80,.57 .67,.77 .43,.75 .27,.64 .51,.41',
  'monoceros':'0.30,.21 .53,.32 .68,.52 .58,.77 .38,.71 .22,.88 .38,.71 .53,.32',
  'auriga':'0.27,.24 .58,.20 .80,.45 .67,.79 .36,.72 .27,.24 .58,.20 .67,.79',
  'lupus':'0.15,.26 .35,.37 .51,.27 .68,.44 .81,.58 .64,.76 .43,.69 .35,.37',
  'piscis-austrinus':'0.14,.52 .32,.32 .56,.26 .79,.39 .86,.60 .68,.74 .42,.69 .14,.52'
};

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function randomizedOrder(items){
  const order=items.map((_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  return order;
}
function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;
  const x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'rgba(255,255,255,1)');
  g.addColorStop(.13,'rgba(255,252,218,.94)');
  g.addColorStop(.35,'rgba(140,202,255,.44)');
  g.addColorStop(1,'rgba(92,135,255,0)');
  x.fillStyle=g;x.fillRect(0,0,128,128);
  const texture=new THREE.CanvasTexture(c);
  texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
function spatialPoints(item){
  const raw=TRAILS[item.id]||'0.18,.25 .35,.55 .50,.35 .65,.64 .82,.39';
  const pairs=raw.trim().split(/\s+/).map(v=>v.split(',').map(Number));
  return pairs.map(([x,y],i)=>new THREE.Vector3((x-.5)*3.65,(.5-y)*5.00,Math.sin(i*1.93)*.14));
}

export function startConstellationQuest(ctx){
  ctx.activityContent.innerHTML='';
  ctx.menuMusic.pause();
  const root=document.createElement('div');
  root.className='s3d-root s3d-constellation s3d-quest246';
  ctx.activityContent.appendChild(root);

  const hud=document.createElement('div');hud.className='s3d-hud';
  hud.innerHTML='<div class="s3d-prompt"><small>ՎԱՌԻՐ ՀԱՄԱՍՏԵՂՈՒԹՅՈՒՆԸ</small><strong>Դիպչի՛ր փայլող աստղին</strong></div><div class="s3d-score">✦ <b>1</b></div>';
  root.appendChild(hud);
  const prompt=hud.querySelector('strong'),number=hud.querySelector('b');

  const progress=document.createElement('div');progress.className='s3d-quest-progress';
  root.appendChild(progress);
  const reveal=document.createElement('div');reveal.className='s3d-quest-reveal';
  const art=document.createElement('img');
  art.className='s3d-quest-art';art.alt='';art.decoding='async';art.draggable=false;
  const caption=document.createElement('div');caption.className='s3d-quest-caption';
  reveal.append(art,caption);root.appendChild(reveal);

  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  renderer.domElement.className='s3d-canvas';
  root.insertBefore(renderer.domElement,hud);
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x030719);
  const camera=new THREE.PerspectiveCamera(46,1,.1,80);
  camera.position.set(0,0,10.3);camera.lookAt(0,0,0);
  const sky=new THREE.Group();scene.add(sky);
  const rng=()=>Math.random(),starsPositions=[];
  for(let i=0;i<470;i++){
    const theta=rng()*Math.PI*2,r=1.7+Math.sqrt(rng())*9;
    starsPositions.push(Math.cos(theta)*r,Math.sin(theta)*r,-2-rng()*7);
  }
  const skyGeo=new THREE.BufferGeometry();
  skyGeo.setAttribute('position',new THREE.Float32BufferAttribute(starsPositions,3));
  const skyMat=new THREE.PointsMaterial({color:0xcbdcff,size:.029,sizeAttenuation:true,transparent:true,opacity:.76,depthWrite:false});
  const skyPoints=new THREE.Points(skyGeo,skyMat);sky.add(skyPoints);
  const glow=glowTexture();
  const mist=[];
  [[-3,2,-7,0x3852ad,4.9],[3,-2,-8,0x5b31a1,5.7],[0,0,-10,0x203b73,7.5]].forEach(([x,y,z,color,size])=>{
    const mat=new THREE.SpriteMaterial({map:glow,color,opacity:.15,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
    const spr=new THREE.Sprite(mat);spr.position.set(x,y,z);spr.scale.set(size,size,1);sky.add(spr);mist.push(spr);
  });

  const group=new THREE.Group();scene.add(group);
  const dotGeo=new THREE.IcosahedronGeometry(.085,1);
  const beamGeo=new THREE.CylinderGeometry(1,1,1,8,1,false);
  const nodes=[],segments=[],sparks=[];
  let points=[],target=0,disposed=false,roundStarted=0,completeAt=0;
  let stage='entering',roundToken=0,current=null,roundCount=0,raf=0,last=performance.now();
  const deck=randomizedOrder(ctx.CONSTELLATIONS),allCount=deck.length;
  let nextSlot=0,artReady=false,artForToken=0,audioContext=null;
  const timers=new Set();
  function later(fn,ms){
    const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn()},ms);
    timers.add(id);return id;
  }
  function audio(){
    if(!ctx.settings.master||!ctx.settings.effects)return null;
    try{
      if(!audioContext){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        audioContext=new AC();
      }
      if(audioContext.state!=='running')audioContext.resume().catch(()=>{});
      return audioContext;
    }catch{return null}
  }
  function note(ac,f,at,d,vol,type='sine'){
    const t=ac.currentTime+.015+at,o=ac.createOscillator(),gain=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f,t);
    gain.gain.setValueAtTime(.0001,t);
    gain.gain.exponentialRampToValueAtTime(vol,t+.014);
    gain.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(gain);gain.connect(ac.destination);
    o.start(t);o.stop(t+d+.03);
  }
  function sound(kind){
    const ac=audio();if(!ac)return;
    if(kind==='wrong'){
      // The same two-note descending wrong-answer SFX as the approved 3D planets.
      note(ac,329.63,0,.17,.054,'triangle');
      note(ac,246.94,.10,.24,.050,'triangle');
    }else if(kind==='star'){
      note(ac,660+target*41,0,.25,.060);
      note(ac,1320+target*82,.065,.34,.020);
    }else if(kind==='line'){
      note(ac,523.25,0,.16,.021);
      note(ac,784,.11,.25,.029);
    }else if(kind==='reveal'){
      [523.25,659.25,783.99,1046.5,1318.5].forEach((f,i)=>{
        note(ac,f,i*.13,.55,.045-i*.003);
        note(ac,f*2,i*.13+.04,.39,.012);
      });
    }else if(kind==='entry'){
      note(ac,523.25,0,.35,.018);
      note(ac,783.99,.12,.39,.016);
    }
  }
  function speak(s){
    if(!ctx.settings.master||!ctx.settings.voice||!('speechSynthesis' in window))return;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(s);
      u.lang='hy-AM';u.rate=.89;u.pitch=1.05;u.volume=.86;
      const v=ctx.pickArmenianSpeechVoice?.();if(v)u.voice=v;
      speechSynthesis.speak(u);
    }catch{}
  }
  function removeNode(n){
    group.remove(n.mesh,n.aura);
    n.mesh.material.dispose();n.aura.material.dispose();
  }
  function clearRound(){
    nodes.forEach(removeNode);nodes.length=0;
    segments.forEach(s=>{group.remove(s.halo,s.core);s.halo.material.dispose();s.core.material.dispose()});
    segments.length=0;
    sparks.forEach(s=>{group.remove(s.sprite);s.sprite.material.dispose()});
    sparks.length=0;
  }
  function createNode(p,i){
    const mat=new THREE.MeshBasicMaterial({color:0xd9e8ff,transparent:true,opacity:0,depthWrite:false});
    const mesh=new THREE.Mesh(dotGeo,mat);mesh.position.copy(p);mesh.renderOrder=4;
    const auraMat=new THREE.SpriteMaterial({map:glow,color:0x89c5ff,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
    const aura=new THREE.Sprite(auraMat);
    aura.position.copy(p);aura.scale.set(.69,.69,1);aura.renderOrder=3;
    group.add(mesh,aura);
    return {mesh,aura,p,i,lit:false,arrival:roundStarted+i*.14+300,wrongUntil:0};
  }
  function burst(p){
    for(let i=0;i<6;i++){
      const mat=new THREE.SpriteMaterial({map:glow,color:i%2===0?0xffe6a0:0xb9edff,transparent:true,opacity:.7,depthWrite:false,blending:THREE.AdditiveBlending});
      const sprite=new THREE.Sprite(mat);
      sprite.position.copy(p);
      sprite.scale.set(.18,.18,1);
      group.add(sprite);
      const angle=i*Math.PI/3+Math.random()*.2;
      sparks.push({sprite,born:performance.now(),dx:Math.cos(angle),dy:Math.sin(angle)});
    }
  }
  function connect(a,b,t){
    const haloMat=new THREE.MeshBasicMaterial({color:0x579fff,transparent:true,opacity:.15,depthWrite:false,blending:THREE.AdditiveBlending});
    const coreMat=new THREE.MeshBasicMaterial({color:0xc4ecff,transparent:true,opacity:.97,depthWrite:false});
    const halo=new THREE.Mesh(beamGeo,haloMat),core=new THREE.Mesh(beamGeo,coreMat);
    halo.renderOrder=1;core.renderOrder=2;
    group.add(halo,core);
    segments.push({a:a.clone(),b:b.clone(),halo,core,start:t});
  }
  function queueArt(item,token){
    artReady=false;artForToken=token;
    art.classList.remove('is-loaded');
    art.removeAttribute('src');
    art.alt=item.name;
    art.onload=()=>{
      if(disposed||token!==roundToken)return;
      const ready=()=>{if(disposed||token!==roundToken)return;artReady=true;art.classList.add('is-loaded')};
      if(art.decode)art.decode().then(ready).catch(ready);
      else ready();
    };
    art.onerror=()=>{if(token===roundToken)artReady=false};
    art.src=item.img;
    if(art.complete&&art.naturalWidth&&art.onload)art.onload();
  }
  function startRound(){
    const token=++roundToken;
    clearRound();reveal.classList.remove('is-visible');
    root.classList.remove('s3d-quest-won');
    completeAt=0;stage='entering';target=0;roundStarted=performance.now();
    if(nextSlot>=allCount)nextSlot=0; // Same shuffled first constellation again after a full cycle.
    current=ctx.CONSTELLATIONS[deck[nextSlot++]];
    const position=nextSlot;
    number.textContent=position+'/'+allCount;
    prompt.textContent='Դիպչի՛ր փայլող աստղին';
    points=spatialPoints(current);
    points.forEach((p,i)=>nodes.push(createNode(p,i)));
    progress.textContent='Վառված աստղեր՝ 0 / '+nodes.length;
    group.rotation.set(0,0,0);group.scale.setScalar(.94);
    queueArt(current,token);
    later(()=>{if(token!==roundToken)return;stage='playing';if(position===1)speak('Դիպչի՛ր փայլող աստղին');},900);
    sound('entry');
  }
  function award(){
    if(ctx.awardStar)ctx.awardStar();
    const d=document.createElement('div');d.className='s3d-reward';
    d.textContent='⭐ +1';root.appendChild(d);
    later(()=>d.remove(),1100);
  }
  function finish(){
    stage='finishing';
    completeAt=performance.now();
    prompt.textContent='Կեցցե՛ս';
    progress.textContent='Բոլոր աստղերը վառված են';
    const token=roundToken;
    // Allow final light beam to reach the last star first.
    later(()=>{
      if(token!==roundToken)return;
      stage='revealed';root.classList.add('s3d-quest-won');
      caption.textContent=current.name;
      // A decoded approved illustration dissolves into view over the 3D lights.
      // If the image is unavailable the constellation lines remain visible.
      if(artReady)reveal.classList.add('is-visible');
      else{
        const show=()=>{if(token===roundToken&&stage==='revealed'&&artReady)reveal.classList.add('is-visible')};
        later(show,350);later(show,900);later(show,1700);
      }
      sound('reveal');award();
      speak('Կեցցե՛ս։ '+current.name);
      later(()=>{if(token===roundToken)startRound()},3900);
    },660);
  }
  function tapAt(e){
    if(disposed||stage!=='playing')return;
    const box=renderer.domElement.getBoundingClientRect();
    if(!box.width||!box.height)return;
    const px=e.clientX-box.left,py=e.clientY-box.top;
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    let closest=-1,closestDistance=Infinity,activeDistance=Infinity;
    for(let i=0;i<nodes.length;i++){
      const projected=nodes[i].mesh.getWorldPosition(new THREE.Vector3()).project(camera);
      const x=(projected.x+1)*box.width*.5,y=(1-projected.y)*box.height*.5;
      const dist=Math.hypot(x-px,y-py);
      if(dist<closestDistance){closest=i;closestDistance=dist}
      if(i===target)activeDistance=dist;
    }
    const radius=clamp(Math.min(box.width,box.height)*.11,31,47);
    // For closely spaced stars prioritize the blinking hint, avoiding false errors.
    if(activeDistance<=radius*1.15)closest=target;
    else if(closestDistance>radius)return;
    if(closest!==target){
      nodes[closest].wrongUntil=performance.now()+340;
      sound('wrong');
      return;
    }
    const t=performance.now();
    const n=nodes[target];n.lit=true;n.mesh.material.color.set(0xfff7cb);
    n.aura.material.color.set(0xffd88f);burst(n.p);
    sound('star');
    if(target>0){connect(points[target-1],points[target],t);sound('line')}
    target++;
    progress.textContent='Վառված աստղեր՝ '+target+' / '+nodes.length;
    if(target===nodes.length)finish();
  }
  renderer.domElement.addEventListener('pointerdown',tapAt,{passive:true});
  function resize(){
    const w=Math.max(2,root.clientWidth),h=Math.max(2,root.clientHeight);
    if(renderer.domElement._w===w&&renderer.domElement._h===h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.domElement._w=w;renderer.domElement._h=h;
  }
  function animate(t){
    if(disposed)return;
    const dt=clamp((t-last)/1000,0,.05);last=t;resize();
    sky.rotation.z+=dt*.0022;
    mist.forEach((m,i)=>{m.material.opacity=.11+Math.sin(t*.00022+i)*.025});
    const elapsed=(t-roundStarted)/1000;
    group.scale.setScalar(.94+clamp(elapsed/.82,0,1)*.06);
    group.rotation.y=Math.sin(t*.00026)*.035;
    nodes.forEach((n,i)=>{
      const appear=clamp((t-n.arrival)/370,0,1);
      const hint=stage==='playing'&&i===target;
      const pulse=hint?.5+.5*Math.sin(t*.00335):0;
      const wrong=t<n.wrongUntil;
      n.mesh.material.opacity=appear;
      n.mesh.scale.setScalar(n.lit?1.33:hint?1.16+.23*pulse:1.00);
      n.aura.material.opacity=appear*(wrong?.83:n.lit?.64:hint?.48+.34*pulse:.30);
      n.aura.scale.setScalar(n.lit?.87:hint?.84+.20*pulse:.58);
      if(wrong)n.aura.material.color.set(0xff6078);
      else if(n.lit)n.aura.material.color.set(0xffdc91);
      else n.aura.material.color.set(0x94caff);
    });
    segments.forEach(s=>{
      const fraction=clamp((t-s.start)/570,0,1);
      const tip=s.a.clone().lerp(s.b,fraction);
      const d=tip.clone().sub(s.a);
      const len=Math.max(.0001,d.length());
      const middle=s.a.clone().addScaledVector(d,.5);
      const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
      [s.halo,s.core].forEach((m,i)=>{m.position.copy(middle);m.quaternion.copy(q);m.scale.set(i===0?.085:.018,len,i===0?.085:.018)});
    });
    for(let i=sparks.length-1;i>=0;i--){
      const s=sparks[i],age=(t-s.born)/700;
      if(age>=1){group.remove(s.sprite);s.sprite.material.dispose();sparks.splice(i,1);continue}
      const n=age*age*.47;
      s.sprite.position.x+=s.dx*dt*.36;
      s.sprite.position.y+=s.dy*dt*.36;
      s.sprite.scale.setScalar(.15+n);
      s.sprite.material.opacity=(1-age)*.73;
    }
    if(stage==='revealed'){
      group.scale.multiplyScalar(.9995);
    }
    renderer.render(scene,camera);
    raf=requestAnimationFrame(animate);
  }
  resize();startRound();raf=requestAnimationFrame(animate);
  ctx.gameCleanup.push(()=>{
    disposed=true;roundToken++;cancelAnimationFrame(raf);
    for(const t of timers)clearTimeout(t);timers.clear();
    renderer.domElement.removeEventListener('pointerdown',tapAt);
    art.onload=art.onerror=null;art.removeAttribute('src');
    clearRound();
    dotGeo.dispose();beamGeo.dispose();glow.dispose();
    skyGeo.dispose();skyMat.dispose();
    mist.forEach(s=>s.material.dispose());
    renderer.dispose();renderer.forceContextLoss?.();
    if(audioContext){audioContext.close().catch(()=>{});audioContext=null}
    try{speechSynthesis.cancel()}catch{}
    if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
  });
}
