// AREG V246 — lightweight standalone 3D "Վառիր համաստեղությունը".
// Deliberately separate from the approved Space Search renderer and assets.
import * as THREE from './vendor/three.module.min.js';

// Hand-composed, child-friendly connected star trails (0..1 coordinates).
// These are gameplay diagrams, NOT scientific star charts. The approved
// original image for each constellation is revealed only on completion.
const TRAILS={
  'hayk-orion':'0.59,.06 .76,.20 .72,.30 .53,.32 .43,.43 .38,.50 .42,.60 .34,.73 .20,.94 .42,.60 .60,.70 .69,.94',
  'ursa-major':'0.17,.30 .26,.32 .34,.37 .43,.42 .59,.45 .71,.47 .67,.57 .57,.53 .44,.50 .33,.62 .23,.72 .19,.82',
  'ursa-minor':'0.32,.62 .33,.71 .44,.65 .44,.73 .57,.59 .66,.52 .71,.44 .80,.34',
  'cassiopeia':'0.30,.47 .38,.60 .50,.67 .60,.51 .71,.64',
  'andromeda':'0.24,.24 .34,.35 .43,.43 .47,.55 .50,.61 .57,.70 .69,.83 .80,.89 .87,.94',
  'pegasus':'0.13,.19 .25,.23 .33,.32 .42,.41 .55,.47 .68,.53 .80,.47 .86,.61 .70,.60 .57,.64 .40,.62 .35,.73 .27,.83 .21,.91',
  'cepheus':'0.32,.23 .51,.30 .36,.50 .40,.77 .63,.79 .66,.55 .51,.30',
  'draco':'0.32,.29 .41,.33 .45,.40 .35,.48 .38,.57 .55,.60 .61,.71 .53,.80 .56,.90 .69,.91 .83,.80 .86,.67 .87,.55 .85,.47',
  'cygnus':'0.27,.38 .37,.42 .54,.50 .66,.55 .81,.62 .54,.50 .63,.38 .73,.30 .54,.50 .48,.60 .44,.68 .37,.80',
  'lyra':'0.38,.39 .61,.39 .57,.53 .50,.75 .42,.53 .38,.39',
  'leo':'0.68,.19 .63,.33 .60,.42 .72,.47 .65,.62 .71,.74 .76,.83 .65,.62 .48,.49 .34,.48 .25,.61 .15,.78',
  'cancer':'0.33,.29 .45,.48 .50,.67 .60,.56 .73,.34 .60,.56 .45,.48',
  'taurus':'0.22,.35 .36,.30 .47,.41 .42,.53 .52,.60 .43,.67 .42,.84 .61,.48 .79,.54 .78,.69 .85,.87',
  'scorpius':'0.26,.71 .39,.69 .49,.58 .61,.49 .72,.41 .77,.33 .76,.25 .70,.17 .59,.14 .56,.20 .61,.31 .53,.57 .43,.79',
  'libra':'0.50,.15 .50,.28 .24,.35 .24,.62 .50,.59 .76,.62 .76,.35 .50,.28',
  'hayk-belt':'0.39,.45 .48,.47 .57,.49',
  'aquarius':'0.39,.22 .50,.30 .44,.40 .51,.52 .48,.61 .40,.69 .28,.83 .35,.94 .52,.66 .60,.41',
  'virgo':'0.46,.29 .58,.32 .56,.46 .64,.56 .60,.70 .52,.83 .45,.95 .60,.70 .72,.29 .56,.46 .35,.54 .24,.50',
  'gemini':'0.38,.21 .33,.32 .37,.43 .33,.52 .45,.60 .38,.78 .68,.25 .69,.38 .65,.50 .72,.64 .66,.82 .69,.38 .37,.43',
  'capricornus':'0.58,.13 .67,.22 .60,.35 .70,.44 .64,.57 .40,.56 .30,.66 .35,.81 .54,.88 .70,.44',
  'aries':'0.68,.25 .61,.42 .69,.60 .75,.74 .61,.42 .32,.53 .25,.64 .15,.91',
  'pisces':'0.50,.23 .36,.31 .30,.42 .33,.53 .34,.62 .44,.29 .58,.31 .76,.49 .73,.62 .66,.74 .56,.78 .50,.86 .42,.73',
  'perseus':'0.50,.09 .28,.18 .30,.31 .41,.36 .53,.43 .48,.55 .40,.73 .27,.91 .62,.65 .70,.92 .78,.44',
  'hercules':'0.50,.11 .31,.19 .29,.31 .47,.32 .55,.38 .67,.37 .72,.48 .81,.56 .62,.55 .51,.51 .43,.66 .33,.78 .22,.94 .62,.66 .68,.73 .71,.88',
  'aquila':'0.24,.19 .29,.29 .37,.38 .44,.51 .55,.56 .70,.50 .86,.45 .55,.56 .46,.70 .61,.77 .68,.84',
  'delphinus':'0.65,.21 .58,.34 .39,.39 .35,.54 .40,.70 .47,.77 .34,.86 .39,.39 .80,.31',
  'phoenix':'0.21,.20 .29,.30 .37,.40 .41,.48 .54,.45 .64,.48 .77,.34 .84,.24 .54,.45 .52,.58 .46,.68 .39,.78 .45,.87 .60,.92 .71,.99',
  'hydra':'0.27,.19 .38,.24 .42,.33 .32,.42 .34,.50 .52,.51 .64,.56 .60,.67 .44,.72 .38,.80 .44,.88 .63,.89 .74,.98',
  'canis-major':'0.71,.23 .68,.33 .72,.47 .57,.53 .40,.49 .32,.62 .21,.82 .57,.53 .66,.65 .72,.78 .76,.88',
  'canis-minor':'0.70,.32 .61,.49 .38,.57 .34,.69 .24,.81 .61,.49 .66,.66 .70,.81',
  'sagittarius':'0.64,.14 .77,.22 .85,.37 .76,.57 .66,.67 .47,.59 .36,.47 .32,.36 .49,.46 .58,.48 .72,.41 .47,.59 .35,.74 .19,.93 .68,.86',
  'ophiuchus':'0.42,.22 .55,.31 .47,.41 .38,.36 .31,.45 .26,.59 .30,.71 .38,.82 .35,.91 .52,.67 .69,.54 .74,.41 .70,.26 .74,.18',
  'corona-borealis':'0.50,.34 .50,.55 .29,.60 .19,.45 .23,.54 .29,.60 .37,.65 .50,.68 .63,.65 .72,.60 .78,.46',
  'cetus':'0.20,.19 .31,.29 .42,.35 .40,.46 .57,.52 .58,.65 .59,.76 .72,.85 .84,.72',
  'monoceros':'0.85,.16 .68,.25 .62,.32 .58,.44 .70,.48 .81,.53 .78,.67 .58,.55 .50,.64 .42,.72 .31,.85 .27,.94',
  'auriga':'0.38,.10 .32,.25 .40,.30 .51,.35 .42,.46 .35,.53 .54,.51 .71,.61 .78,.52 .69,.70 .75,.84 .61,.89 .50,.74 .38,.79',
  'lupus':'0.70,.23 .73,.35 .67,.48 .70,.63 .68,.74 .75,.85 .39,.55 .34,.65 .28,.78',
  'piscis-austrinus':'0.54,.34 .77,.42 .55,.47 .63,.56 .47,.69 .32,.68 .39,.78'
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

// V250: lightweight illustrated starfield matching the blue/violet constellations.
// One small, static GPU texture; no 4K image or network fetch on game startup.
function nebulaBackdropTexture(){
  const c=document.createElement('canvas');c.width=640;c.height=960;
  const x=c.getContext('2d'),w=c.width,h=c.height;
  let seed=0x41524547;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const bg=x.createLinearGradient(0,0,w,h);
  bg.addColorStop(0,'#050c24');bg.addColorStop(.46,'#0b1040');
  bg.addColorStop(.72,'#090d2d');bg.addColorStop(1,'#040920');
  x.fillStyle=bg;x.fillRect(0,0,w,h);
  function cloud(cx,cy,r,color,a){
    const g=x.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,'rgba('+color+','+a+')');
    g.addColorStop(.35,'rgba('+color+','+(a*.50)+')');
    g.addColorStop(.72,'rgba('+color+','+(a*.15)+')');
    g.addColorStop(1,'rgba('+color+',0)');
    x.fillStyle=g;x.fillRect(cx-r,cy-r,r*2,r*2);
  }
  // Several layered diagonal nebula arcs, like the original constellation art.
  for(let i=0;i<170;i++){
    const u=rnd(),v=rnd(),cx=w*(u*.94+.03);
    const cy=h*(.81-u*.63+(v-.5)*.44);
    const radius=28+rnd()*132;
    const color=i%4===0?'102,58,193':i%4===1?'45,77,188':i%4===2?'89,39,153':'46,104,198';
    cloud(cx,cy,radius,color,.035+rnd()*.10);
  }
  [[.16,.68,.31,'86,51,181',.28],[.76,.28,.40,'40,91,200',.22],
   [.89,.66,.27,'96,44,184',.17],[.29,.20,.27,'35,85,180',.15]]
   .forEach(([cx,cy,r,col,a])=>cloud(cx*w,cy*h,r*w,col,a));
  // Fine dust along the diagonal galactic band, not extra full-size 3D sprites.
  for(let i=0;i<2300;i++){
    const u=rnd(),mid=h*(.77-.58*u),dy=(rnd()+rnd()+rnd()-1.5)*h*.16;
    const xx=u*w,yy=mid+dy;if(yy<0||yy>h)continue;
    const alpha=.06+rnd()*.21;
    x.fillStyle=rnd()<.20?'rgba(255,192,246,'+alpha+')':'rgba(141,183,255,'+alpha+')';
    const size=.35+rnd()*1.15;
    x.fillRect(xx,yy,size,size);
  }
  for(let i=0;i<430;i++){
    const xx=rnd()*w,yy=rnd()*h,alpha=.2+rnd()*.48,size=.42+rnd()*.95;
    x.fillStyle='rgba(220,235,255,'+alpha+')';
    x.fillRect(xx,yy,size,size);
  }
  const t=new THREE.CanvasTexture(c);
  t.colorSpace=THREE.SRGBColorSpace;
  t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;
  return t;
}
function shootingStreakTexture(){
  const c=document.createElement('canvas');c.width=256;c.height=36;
  const x=c.getContext('2d'),g=x.createLinearGradient(0,0,256,0);
  g.addColorStop(0,'rgba(150,195,255,0)');
  g.addColorStop(.58,'rgba(176,212,255,.07)');
  g.addColorStop(.86,'rgba(210,232,255,.50)');
  g.addColorStop(.97,'rgba(255,255,255,.95)');
  g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,14,256,8);
  const h=x.createRadialGradient(248,18,0,248,18,14);
  h.addColorStop(0,'rgba(255,255,255,.98)');
  h.addColorStop(.36,'rgba(211,233,255,.74)');
  h.addColorStop(1,'rgba(220,238,255,0)');
  x.fillStyle=h;x.fillRect(233,3,23,30);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function occasionalShootingStar(scene){
  const texture=shootingStreakTexture();
  const material=new THREE.SpriteMaterial({
    map:texture,color:0xddedff,transparent:true,opacity:0,
    depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending
  });
  material.rotation=-.33;material.toneMapped=false;
  const sprite=new THREE.Sprite(material);
  sprite.visible=false;sprite.renderOrder=-1;
  sprite.position.z=-4;sprite.scale.set(2.1,.19,1);
  scene.add(sprite);
  let start=0,duration=0,active=false,y=2.5;
  let nextAt=performance.now()+4300+Math.random()*5400;
  return {
    tick(t){
      if(!active&&t>=nextAt){
        active=true;start=t;duration=870+Math.random()*510;
        y=1.7+Math.random()*3;sprite.position.set(-5.4,y,-4);
        sprite.visible=true;
      }
      if(!active)return;
      const p=(t-start)/duration;
      if(p>=1){sprite.visible=false;active=false;material.opacity=0;
        nextAt=t+9500+Math.random()*8500;return}
      sprite.position.x=-5.4+p*11.5;
      sprite.position.y=y-p*2.75;
      material.opacity=(p<.14?p/.14:(1-p))*.68;
    },
    dispose(){scene.remove(sprite);material.dispose();texture.dispose()}
  };
}

function spatialPoints(item){
  const raw=TRAILS[item.id]||'0.18,.25 .35,.55 .50,.35 .65,.64 .82,.39';
  const pairs=raw.trim().split(/\s+/).map(v=>v.split(',').map(Number));
  return pairs.map(([x,y],i)=>new THREE.Vector3((x-.5)*5.00,(.5-y)*5.00,Math.sin(i*1.93)*.14));
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
  const photoStage=document.createElement('div');
  photoStage.className='s3d-quest-photo-stage';
  // V252: a true alpha image, so the existing real-time 3D nebula is
  // visible through all pixels outside the hand-drawn constellation.
  // No extra blurred JPG layer, CSS masks, or rectangular image borders.
  const art=document.createElement('img');
  art.className='s3d-quest-art';art.alt='';art.decoding='async';art.draggable=false;
  photoStage.append(art);
  const caption=document.createElement('div');caption.className='s3d-quest-caption';
  reveal.append(photoStage,caption);root.appendChild(reveal);

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
  const nebulaMap=nebulaBackdropTexture();
  const nebulaPlane=new THREE.Mesh(
    new THREE.PlaneGeometry(16,24),
    new THREE.MeshBasicMaterial({map:nebulaMap,depthWrite:false,depthTest:false,toneMapped:false})
  );
  nebulaPlane.position.z=-12;nebulaPlane.renderOrder=-20;scene.add(nebulaPlane);
  const meteor=occasionalShootingStar(scene);
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
  let stage='entering',roundToken=0,current=null,roundCount=0,raf=0,last=performance.now(),exitStartedAt=0;
  const deck=randomizedOrder(ctx.CONSTELLATIONS),allCount=deck.length;
  let nextSlot=0,artReady=false,artForToken=0,audioContext=null,nextEntryScheduledFor=0,keepAliveOsc=null,keepAliveGain=null,needEntryCueOnTouch=false;
  const timers=new Set();
  function later(fn,ms){
    const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn()},ms);
    timers.add(id);return id;
  }
  // V251: one audio session for the entire minigame. Avoid SpeechSynthesis:
  // on iOS that separate audio session was interrupting our WebAudio effects
  // after the first level. Unlock this engine on an actual star touch.
  function audio(){
    if(!ctx.settings.master||!ctx.settings.effects)return null;
    try{
      if(!audioContext||audioContext.state==='closed'){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        audioContext=new AC();
        keepAliveOsc=audioContext.createOscillator();
        keepAliveGain=audioContext.createGain();
        keepAliveOsc.frequency.value=32;
        keepAliveGain.gain.value=0.000002; // practically inaudible 32 Hz carrier; avoids iOS graph being idle.
        keepAliveOsc.connect(keepAliveGain);
        keepAliveGain.connect(audioContext.destination);
        keepAliveOsc.start();
      }
      return audioContext;
    }catch{return null}
  }
  function withRunningAudio(play){
    const ac=audio();if(!ac)return;
    const run=()=>{if(!disposed&&ac===audioContext&&ac.state==='running')play(ac)};
    if(ac.state==='running'){run();return}
    ac.resume().then(run).catch(()=>{});
  }
  function scheduleNextIntro(){
    // The entire next-level chime is scheduled on the child's *last star tap*.
    // In contrast to autoplay after a timer, this reuses the unlocked graph.
    const nextToken=roundToken+1;
    const delay=(660+6600+1160+420)/1000;
    withRunningAudio(ac=>{
      if(disposed||nextToken!==roundToken+1)return;
      note(ac,523.25,delay,.39,.048);
      note(ac,783.99,delay+.12,.45,.035);
      nextEntryScheduledFor=nextToken;
    });
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
    withRunningAudio(ac=>{
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
      note(ac,523.25,0,.39,.048);
      note(ac,783.99,.12,.45,.035);
    }
    });
  }
  // Narration is deliberately visual in this minigame until permanent
  // local Armenian speech files are supplied. Device SpeechSynthesis cannot
  // safely share the iOS audio session with short WebAudio effects.
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
    // Runtime artwork is transparent WebP generated from the same approved
    // source JPEG. The original image is still kept for gallery previews.
    const transparentSrc='assets/constellations-transparent/'+
      item.img.split('/').pop().replace(/\.[^.]+$/,'.webp')+'?v=252';
    art.onload=()=>{
      if(disposed||token!==roundToken)return;
      const ready=()=>{if(disposed||token!==roundToken)return;artReady=true;art.classList.add('is-loaded')};
      if(art.decode)art.decode().then(ready).catch(ready);
      else ready();
    };
    art.onerror=()=>{if(token===roundToken)artReady=false};
    art.src=transparentSrc;
    if(art.complete&&art.naturalWidth&&art.onload)art.onload();
  }
  function startRound(){
    const token=++roundToken;
    clearRound();reveal.classList.remove('is-visible','is-exiting');
    root.classList.remove('s3d-quest-won');
    completeAt=0;stage='entering';target=0;roundStarted=performance.now();
    if(nextSlot>=allCount)nextSlot=0; // Same shuffled first constellation again after a full cycle.
    current=ctx.CONSTELLATIONS[deck[nextSlot++]];
    const position=nextSlot;
    number.textContent=position+'/'+allCount;
    prompt.textContent='Դիպչի՛ր կամ սահեցրո՛ւ մատդ';
    points=spatialPoints(current);
    points.forEach((p,i)=>nodes.push(createNode(p,i)));
    progress.textContent='Վառված աստղեր՝ 0 / '+nodes.length;
    group.rotation.set(0,0,0);group.position.set(0,0,-.95);group.scale.setScalar(.83);
    queueArt(current,token);
    later(()=>{if(token!==roundToken)return;stage='playing';},1150);
    // If the device interrupted the scheduled chime while between rounds,
    // deliver it at the next real touch when Safari allows audio resume.
    if(nextEntryScheduledFor===token){
      nextEntryScheduledFor=0;
      needEntryCueOnTouch=!!audioContext&&audioContext.state!=='running';
    }else{needEntryCueOnTouch=false;sound('entry')}
  }
  function award(){
    if(ctx.awardStar)ctx.awardStar();
    const d=document.createElement('div');d.className='s3d-reward';
    d.textContent='⭐ +1';root.appendChild(d);
    later(()=>d.remove(),1100);
  }
  function exitRound(token){
    if(disposed||token!==roundToken||stage!=='revealed')return;
    // Approved Space Search rhythm: completed figure drifts away, the star
    // field breathes briefly, then the new constellation enters from depth.
    stage='exiting';exitStartedAt=performance.now();
    reveal.classList.remove('is-visible');
    reveal.classList.add('is-exiting');
    later(()=>{
      if(token!==roundToken)return;
      clearRound();stage='starfield-pause';
      // Preserve the dark 3D sky; do not show a blank white DOM frame.
      progress.textContent='✦ ✦ ✦';
      later(()=>{if(token===roundToken)startRound()},420);
    },1160);
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
      later(()=>exitRound(token),6600);
    },660);
  }
  // Both ways of playing share the very same next-star validation:
  // (a) release after each tap or (b) keep a finger down and trace the lights.
  let heldPointer=null,lastDragPoint=null;
  function activePosition(rect){
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const projected=nodes[target].mesh.getWorldPosition(new THREE.Vector3()).project(camera);
    return {x:(projected.x+1)*rect.width*.5,y:(1-projected.y)*rect.height*.5};
  }
  function lightTarget(){
    if(disposed||stage!=='playing'||target>=nodes.length)return;
    const t=performance.now();
    const n=nodes[target];n.lit=true;n.mesh.material.color.set(0xfff7cb);
    n.aura.material.color.set(0xffd88f);burst(n.p);
    sound('star');
    if(target>0){connect(points[target-1],points[target],t);sound('line')}
    target++;
    progress.textContent='Վառված աստղեր՝ '+target+' / '+nodes.length;
    if(target===nodes.length){scheduleNextIntro();finish();}
  }
  function pointerDown(e){
    if(disposed||stage!=='playing'||heldPointer!==null)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    const rect=renderer.domElement.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    heldPointer=e.pointerId;
    lastDragPoint={x:e.clientX-rect.left,y:e.clientY-rect.top};
    if(needEntryCueOnTouch){needEntryCueOnTouch=false;sound('entry')}
    try{renderer.domElement.setPointerCapture(e.pointerId)}catch{}
    // Regular tapping stays unchanged, including the wrong-star sound.
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    let closest=-1,closestDistance=Infinity,activeDistance=Infinity;
    for(let i=0;i<nodes.length;i++){
      const projected=nodes[i].mesh.getWorldPosition(new THREE.Vector3()).project(camera);
      const x=(projected.x+1)*rect.width*.5,y=(1-projected.y)*rect.height*.5;
      const d=Math.hypot(x-lastDragPoint.x,y-lastDragPoint.y);
      if(d<closestDistance){closest=i;closestDistance=d}
      if(i===target)activeDistance=d;
    }
    const radius=clamp(Math.min(rect.width,rect.height)*.11,31,47);
    if(activeDistance<=radius*1.15)closest=target;
    else if(closestDistance>radius)return;
    if(closest!==target){
      nodes[closest].wrongUntil=performance.now()+340;
      sound('wrong');return;
    }
    lightTarget();
  }
  function pointerMove(e){
    if(disposed||heldPointer!==e.pointerId||stage!=='playing'||!lastDragPoint)return;
    const rect=renderer.domElement.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const end={x:e.clientX-rect.left,y:e.clientY-rect.top};
    const start=lastDragPoint;
    const dx=end.x-start.x,dy=end.y-start.y;
    const len2=dx*dx+dy*dy;
    if(len2<9)return; // ignore tiny finger jitter
    lastDragPoint=end;
    if(target>=nodes.length)return;
    // Distance from the continuous finger path to the active blinking star;
    // this also recognizes fast swipes whose events skip right over its center.
    const p=activePosition(rect);
    const along=clamp(((p.x-start.x)*dx+(p.y-start.y)*dy)/len2,0,1);
    const qx=start.x+along*dx,qy=start.y+along*dy;
    const radius=clamp(Math.min(rect.width,rect.height)*.095,29,43);
    if(Math.hypot(p.x-qx,p.y-qy)<=radius){
      lightTarget();
      // On the next move, a new target is evaluated; no accidental chain
      // of multiple stars triggered by a single large touch event.
    }
  }
  function pointerEnd(e){
    if(heldPointer!==e.pointerId)return;
    heldPointer=null;lastDragPoint=null;
    try{if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId)}catch{}
  }
  renderer.domElement.addEventListener('pointerdown',pointerDown,{passive:true});
  renderer.domElement.addEventListener('pointermove',pointerMove,{passive:true});
  renderer.domElement.addEventListener('pointerup',pointerEnd,{passive:true});
  renderer.domElement.addEventListener('pointercancel',pointerEnd,{passive:true});
  renderer.domElement.addEventListener('lostpointercapture',pointerEnd);
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
    meteor.tick(t);
    mist.forEach((m,i)=>{m.material.opacity=.11+Math.sin(t*.00022+i)*.025});
    const elapsed=(t-roundStarted)/1000;
    const arrive=clamp(elapsed/1.25,0,1);
    const enterEase=1-Math.pow(1-arrive,3);
    const leaving=stage==='exiting'?clamp((t-exitStartedAt)/1050,0,1):0;
    const exitFade=1-leaving*leaving*(3-2*leaving);
    group.scale.setScalar((.83+.17*enterEase)*(1-leaving*.20));
    group.position.z=-.95*(1-enterEase)-1.25*leaving;
    group.position.y=.09*leaving;
    group.rotation.y=Math.sin(t*.00026)*.035+.045*leaving;
    nodes.forEach((n,i)=>{
      const appear=clamp((t-n.arrival)/370,0,1);
      const hint=stage==='playing'&&i===target;
      const pulse=hint?.5+.5*Math.sin(t*.00335):0;
      const wrong=t<n.wrongUntil;
      n.mesh.material.opacity=appear*exitFade;
      n.mesh.scale.setScalar(n.lit?1.33:hint?1.16+.23*pulse:1.00);
      n.aura.material.opacity=appear*exitFade*(wrong?.83:n.lit?.64:hint?.48+.34*pulse:.30);
      n.aura.scale.setScalar(n.lit?.87:hint?.84+.20*pulse:.58);
      if(wrong){n.mesh.material.color.set(0xff707d);n.aura.material.color.set(0xff6078);}
      else if(n.lit){n.mesh.material.color.set(0xfff7cb);n.aura.material.color.set(0xffdc91);}
      else if(hint){n.mesh.material.color.set(0xffc15a);n.aura.material.color.set(0xffac3e);}
      else{n.mesh.material.color.set(0xc6dcff);n.aura.material.color.set(0x6daeff);}
    });
    segments.forEach(s=>{
      const fraction=clamp((t-s.start)/570,0,1);
      const tip=s.a.clone().lerp(s.b,fraction);
      const d=tip.clone().sub(s.a);
      const len=Math.max(.0001,d.length());
      const middle=s.a.clone().addScaledVector(d,.5);
      const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
      [s.halo,s.core].forEach((m,i)=>{
        m.position.copy(middle);m.quaternion.copy(q);
        m.scale.set(i===0?.085:.018,len,i===0?.085:.018);
        m.material.opacity=(i===0?.15:.97)*exitFade;
      });
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
    renderer.domElement.removeEventListener('pointerdown',pointerDown);
    renderer.domElement.removeEventListener('pointermove',pointerMove);
    renderer.domElement.removeEventListener('pointerup',pointerEnd);
    renderer.domElement.removeEventListener('pointercancel',pointerEnd);
    renderer.domElement.removeEventListener('lostpointercapture',pointerEnd);
    heldPointer=null;lastDragPoint=null;
    art.onload=art.onerror=null;art.removeAttribute('src');
    clearRound();
    dotGeo.dispose();beamGeo.dispose();glow.dispose();
    skyGeo.dispose();skyMat.dispose();
    meteor.dispose();scene.remove(nebulaPlane);
    nebulaPlane.geometry.dispose();nebulaPlane.material.dispose();nebulaMap.dispose();
    mist.forEach(s=>s.material.dispose());
    renderer.dispose();renderer.forceContextLoss?.();
    if(keepAliveOsc){try{keepAliveOsc.stop()}catch{}keepAliveOsc.disconnect();keepAliveOsc=null}
    if(keepAliveGain){keepAliveGain.disconnect();keepAliveGain=null}
    if(audioContext){audioContext.close().catch(()=>{});audioContext=null}
    if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
  });
}
