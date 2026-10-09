// AREG V256 — "Գտի՛ր համաստեղությունը": four-choice visual recognition.
// Original smooth Space Search timing; untouched approved transparent art.
import * as THREE from './vendor/three.module.min.js';

// V254: no approximate hand-drawn star positions remain.
 // The 38 measured star layouts are stored in constellation-star-layouts.json.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function randomizedOrder(items){
  // V257: shuffle ITEMS, not numeric indices. The old star-trace game
  // indexed its array afterward; four-choice requires actual image records.
  const order=[...items];
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


export function startConstellationQuest(ctx){
  ctx.activityContent.innerHTML='';
  ctx.menuMusic.pause();
  const root=document.createElement('div');
  root.className='s3d-root s3d-constellation s3d-quest246 s3d-find256';
  root.dataset.constellationMode='four-choice';
  ctx.activityContent.appendChild(root);
  const hud=document.createElement('div');
  hud.className='s3d-hud';
  hud.innerHTML='<div class="s3d-prompt"><small>ԳՏԻ՛Ր ՀԱՄԱՍՏԵՂՈՒԹՅՈՒՆԸ</small><strong>Պատրաստվում են համաստեղությունները…</strong></div><div class="s3d-score">✦ <b>1/38</b></div>';
  root.appendChild(hud);
  const prompt=hud.querySelector('strong'),roundLabel=hud.querySelector('b');
  const stage=document.createElement('div');
  stage.className='s3d-find-stage';
  stage.setAttribute('role','group');
  stage.setAttribute('aria-label','Ընտրիր ճիշտ համաստեղությունը չորս նկարներից');
  root.appendChild(stage);
  const progress=document.createElement('div');
  progress.className='s3d-quest-progress s3d-find-progress';
  progress.textContent='Տիեզերական որոնում';
  root.appendChild(progress);

  // Same lightweight live sky and occasional shooting stars as approved V253.
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.35));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.12;
  renderer.domElement.className='s3d-canvas';
  renderer.domElement.style.pointerEvents='none';
  root.insertBefore(renderer.domElement,hud);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color(0x030719);
  const camera=new THREE.PerspectiveCamera(46,1,.1,80);
  camera.position.set(0,0,10.3);camera.lookAt(0,0,0);
  const nebulaMap=nebulaBackdropTexture();
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(16,24),
    new THREE.MeshBasicMaterial({map:nebulaMap,depthWrite:false,depthTest:false,toneMapped:false}));
  backdrop.position.z=-12;scene.add(backdrop);
  const positions=[];
  for(let i=0;i<470;i++){
    const a=Math.random()*Math.PI*2,len=1.7+Math.sqrt(Math.random())*9;
    positions.push(Math.cos(a)*len,Math.sin(a)*len,-2-Math.random()*7);
  }
  const starsGeometry=new THREE.BufferGeometry();
  starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  const starsMaterial=new THREE.PointsMaterial({color:0xcbdcff,size:.029,sizeAttenuation:true,
    transparent:true,opacity:.76,depthWrite:false});
  const stars=new THREE.Points(starsGeometry,starsMaterial);scene.add(stars);
  const meteor=occasionalShootingStar(scene);
  const mistTexture=glowTexture(),mist=[];
  [[-3,2,-7,0x3852ad,4.9],[3,-2,-8,0x5b31a1,5.7],[0,0,-10,0x203b73,7.5]]
    .forEach(([x,y,z,color,size])=>{
      const mat=new THREE.SpriteMaterial({map:mistTexture,color,opacity:.13,transparent:true,
        depthWrite:false,blending:THREE.AdditiveBlending});
      const sprite=new THREE.Sprite(mat);sprite.position.set(x,y,z);
      sprite.scale.set(size,size,1);scene.add(sprite);mist.push(sprite);
    });
  let disposed=false,raf=0,phase='loading',sequence=0,locked=true,winAt=0,roundIndex=0;
  let cards=[],target=null,queued=null,prewarmTimer=0,mainTimer=0;
  const timers=new Set(),cache=new Map();
  let recent=[],lastTargetId='',audioContext=null,keepAliveOsc=null,keepAliveGain=null;
  let losingCards=[],loserFadeStart=0;
  const deckSize=ctx.CONSTELLATIONS.length;
  let deck=randomizedOrder(ctx.CONSTELLATIONS),deckIndex=0;
  const ENTER_MS=780,WIN_HOLD_MS=4600,WIN_ZOOM_MS=1220,EXIT_MS=880,STARFIELD_PAUSE_MS=260,LOSER_FADE_MS=720;
  const delay=(fn,ms)=>{
    const id=setTimeout(()=>{timers.delete(id);if(!disposed)fn()},ms);
    timers.add(id);return id;
  };
  function soundEngine(){
    if(!ctx.settings?.master||!ctx.settings?.effects)return null;
    try{
      if(!audioContext||audioContext.state==='closed'){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        audioContext=new AC();
        keepAliveOsc=audioContext.createOscillator();
        keepAliveGain=audioContext.createGain();
        keepAliveOsc.frequency.value=32;
        keepAliveGain.gain.value=.000002; // keeps iOS graph live, inaudible carrier
        keepAliveOsc.connect(keepAliveGain);
        keepAliveGain.connect(audioContext.destination);
        keepAliveOsc.start();
      }
      return audioContext;
    }catch{return null}
  }
  function note(ac,f,t=0,d=.24,v=.04,type='sine'){
    const when=ac.currentTime+.018+t;
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(f,when);
    g.gain.setValueAtTime(.0001,when);
    g.gain.exponentialRampToValueAtTime(v,when+.017);
    g.gain.exponentialRampToValueAtTime(.0001,when+d);
    o.connect(g);g.connect(ac.destination);o.start(when);o.stop(when+d+.03);
  }
  function sound(kind,offset=0){
    const ac=soundEngine();if(!ac)return;
    const play=()=>{
      if(disposed||ac!==audioContext||ac.state!=='running')return;
      if(kind==='wrong'){
        // Exact melodic intervals used by approved Space Search incorrect answer.
        note(ac,329.63,offset,.17,.054,'triangle');
        note(ac,246.94,offset+.100,.24,.050,'triangle');
      }else if(kind==='correct'){
        note(ac,659.25,offset,.16,.064);
        note(ac,783.99,offset+.080,.17,.060);
        note(ac,987.77,offset+.165,.23,.054);
      }
    };
    if(ac.state==='running')play();
    else ac.resume().then(play).catch(()=>{});
  }
  function shuffleTargetCycle(){
    deck=randomizedOrder(ctx.CONSTELLATIONS);
    if(deck.length>1&&deck[0].id===lastTargetId)[deck[0],deck[1]]=[deck[1],deck[0]];
    deckIndex=0;
  }
  function planRound(){
    if(deckIndex>=deck.length)shuffleTargetCycle();
    const t=deck[deckIndex++];
    const ignored=new Set([...recent,t.id]);
    const allOthers=ctx.CONSTELLATIONS.filter(x=>x.id!==t.id);
    let possible=randomizedOrder(allOthers.filter(x=>!ignored.has(x.id)));
    if(possible.length<3)possible=randomizedOrder(allOthers);
    const opts=randomizedOrder([t,...possible.slice(0,3)]);
    return {target:t,options:opts,position:deckIndex,ready:null};
  }
  function artworkPath(item,extension='webp'){
    return './assets/constellations-transparent/'+item.img.split('/').pop()
      .replace(/\.[^.]+$/,'.'+extension)+'?v=252';
  }
  // Calibrate V258 artwork by visible alpha, not the transparent image bounds.
  // Sample only 128 x 128 pixels per unique picture; no re-encoding or network
  // fetch. Percentile bounds discard stray nebula specks around silhouettes.
  function visibleAlphaBounds(image){
    try{
      const n=128,c=document.createElement('canvas');c.width=n;c.height=n;
      const g=c.getContext('2d',{willReadFrequently:true});
      if(!g)return {x:.5,y:.5,w:.85,h:.85};
      g.clearRect(0,0,n,n);g.drawImage(image,0,0,n,n);
      const raw=g.getImageData(0,0,n,n).data;
      const hx=new Float64Array(n),hy=new Float64Array(n);
      let total=0;
      for(let y=0;y<n;y++)for(let x=0;x<n;x++){
        const alpha=raw[(y*n+x)*4+3];
        if(alpha<95)continue;
        const weight=alpha/255;
        hx[x]+=weight;hy[y]+=weight;total+=weight;
      }
      if(total<35)return {x:.5,y:.5,w:.85,h:.85};
      function percentile(hist,at){
        let acc=0;
        for(let k=0;k<hist.length;k++){
          acc+=hist[k];if(acc>=total*at)return k/n;
        }
        return 1;
      }
      const left=percentile(hx,.018),right=percentile(hx,.982);
      const top=percentile(hy,.018),bottom=percentile(hy,.982);
      const w=clamp(right-left+.045,.12,1),h=clamp(bottom-top+.045,.12,1);
      return {x:clamp((left+right)/2,0,1),y:clamp((top+bottom)/2,0,1),w,h};
    }catch(err){
      console.warn('Constellation alpha bounds fallback:',err);
      return {x:.5,y:.5,w:.85,h:.85};
    }
  }
  function sizeVisibleIllustration(button,img,record){
    const rect=button.getBoundingClientRect();
    // clientWidth/Height are UNTRANSFORMED grid dimensions. The buttons have
    // their initial entrance scale(.64) here and cannot use rect.width.
    const w=button.clientWidth||rect.width,h=button.clientHeight||rect.height;
    if(!w||!h)return;
    const nativeW=record.width||560,nativeH=record.height||760;
    const fit=Math.min(w/nativeW,h/nativeH);
    const shownW=nativeW*fit,shownH=nativeH*fit;
    const b=record.bounds;
    const figureW=Math.max(1,b.w*shownW),figureH=Math.max(1,b.h*shownH);
    const zoom=clamp(Math.min(w*.84/figureW,h*.84/figureH),.88,2.02);
    const moveX=-zoom*(b.x-.5)*shownW;
    const moveY=-zoom*(b.y-.5)*shownH;
    img.style.transform='translate3d('+moveX.toFixed(2)+'px,'+
      moveY.toFixed(2)+'px,0) scale('+zoom.toFixed(4)+')';
    button.dataset.figureScale=zoom.toFixed(3);
    button.dataset.figureFit=(Math.min(w*.84/figureW,h*.84/figureH)).toFixed(3);
    // Real visible outline dimensions after its in-card alpha calibration.
    // Required to zoom the winner to one consistent device-safe boundary.
    button.dataset.figureWidthPx=(figureW*zoom).toFixed(3);
    button.dataset.figureHeightPx=(figureH*zoom).toFixed(3);
  }
  function loadImage(src){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.decoding='async';
      img.onload=()=>{
        if(img.decode)img.decode().then(()=>resolve({src,image:img}),()=>resolve({src,image:img}));
        else resolve({src,image:img});
      };
      img.onerror=()=>reject(new Error('Cannot load '+src));
      img.src=src;
      if(img.complete&&img.naturalWidth)resolve({src,image:img});
    });
  }
  function preload(item){
    if(cache.has(item.id))return cache.get(item.id);
    const p=loadImage(artworkPath(item))
      .catch(()=>loadImage(artworkPath(item,'png')))
      .then(({src,image})=>({
        src,width:image.naturalWidth,height:image.naturalHeight,
        bounds:visibleAlphaBounds(image)
      }))
      .catch(err=>{cache.delete(item.id);throw err});
    cache.set(item.id,p);return p;
  }
  function prepare(plan){
    if(!plan.ready)plan.ready=Promise.all(plan.options.map(preload));
    return plan.ready;
  }
  function warmNext(){
    if(disposed||queued||locked)return;
    queued=planRound();
    prepare(queued).catch(()=>{if(!disposed)queued=null});
  }
  function resetCards(){
    for(const el of cards){el.onclick=null;el.remove()}
    cards=[];
  }
  function pose(el,{x=0,y=0,z=0,s=1,opacity=1},ms,easing='cubic-bezier(.18,.73,.26,1)'){
    el.style.transition=ms
      ?'transform '+ms+'ms '+easing+', opacity '+ms+'ms '+easing
      :'none';
    el.style.transform='translate3d('+x+'px,'+y+'px,'+z+'px) scale('+s+')';
    el.style.opacity=String(opacity);
  }
  async function buildRound(){
    const seq=++sequence;
    phase='loading';locked=true;winAt=0;
    losingCards=[];root.dataset.winnerIsolated='false';
    root.dataset.constellationPhase='loading';
    const plan=queued||planRound();
    queued=null;
    prompt.textContent='Հայտնվում են համաստեղությունները…';
    let imageSources;
    try{imageSources=await prepare(plan)}
    catch(err){
      if(disposed||seq!==sequence)return;
      root.dataset.loadError=String(err?.message||err);
      console.error('CONSTELLATION IMAGE FAIL',err);
      prompt.textContent='Նկարները չեն բեռնվել․ փորձիր նորից';
      progress.textContent='Կպի՛ր՝ կրկին փորձելու համար';
      stage.onclick=()=>{stage.onclick=null;queued=plan;buildRound()};
      root.dataset.constellationPhase='load-error';
      return;
    }
    if(disposed||seq!==sequence)return;
    stage.onclick=null;
    resetCards();
    target=plan.target;roundIndex=plan.position;
    lastTargetId=target.id;
    recent=[...new Set([...plan.options.map(x=>x.id),...recent])].slice(0,10);
    roundLabel.textContent=roundIndex+'/'+deckSize;
    prompt.textContent='Գտի՛ր՝ '+target.name;
    progress.textContent='Ընտրի՛ր ճիշտ համաստեղությունը';
    root.classList.remove('s3d-find-won');
    plan.options.forEach((item,i)=>{
      const button=document.createElement('button');
      button.type='button';button.className='s3d-find-choice';
      button.dataset.id=item.id;button.setAttribute('aria-label',item.name);
      const shell=document.createElement('span');
      shell.className='s3d-find-art-shell';
      const img=document.createElement('img');
      img.alt='';img.draggable=false;img.decoding='async';
      img.src=imageSources[i].src;
      shell.appendChild(img);button.appendChild(shell);
      button.onclick=()=>choose(button,item);
      stage.appendChild(button);cards.push(button);
      pose(button,{x:i%2===0?-18:18,y:i<2?-16:16,z:-80,s:.64,opacity:0},0);
    });
    // Every figure fills the same visual area, even if the source WebP has
    // huge transparent margins or its figure is unusually narrow/tall.
    cards.forEach((button,i)=>sizeVisibleIllustration(
      button,button.querySelector('img'),imageSources[i]));
    root.dataset.constellationPhase='enter';
    // Double RAF commits entrance start pose on iOS WebKit before tween.
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      if(disposed||seq!==sequence)return;
      cards.forEach((button,i)=>delay(()=>pose(button,{},ENTER_MS-i*35,
        'cubic-bezier(.18,.73,.26,1)'),i*65));
    }));
    delay(()=>{
      if(disposed||seq!==sequence)return;
      phase='ready';locked=false;
      root.dataset.constellationPhase='ready';
      // Keep expensive upcoming image decoding out of entrance and win zoom.
      prewarmTimer=delay(warmNext,650);
    },ENTER_MS+3*65+90);
  }
  function award(){
    ctx.awardStar?.();
    const reward=document.createElement('div');
    reward.className='s3d-reward';reward.textContent='⭐ +1';
    root.appendChild(reward);
    delay(()=>reward.remove(),1100);
  }
  function choose(button,item){
    if(disposed||locked||phase!=='ready')return;
    if(item.id!==target.id){
      sound('wrong');
      button.classList.remove('s3d-find-wrong');
      void button.offsetWidth;button.classList.add('s3d-find-wrong');
      delay(()=>button.classList.remove('s3d-find-wrong'),630);
      return;
    }
    locked=true;phase='winning';winAt=performance.now();
    root.dataset.constellationPhase='winning';
    root.classList.add('s3d-find-won');
    prompt.textContent='Կեցցե՛ս։ '+item.name;
    progress.textContent='Գտա՛ր '+item.name;
    sound('correct');
    award();
    const stageRect=stage.getBoundingClientRect(),rect=button.getBoundingClientRect();
    const centerX=stageRect.left+stageRect.width*.5;
    const centerY=stageRect.top+stageRect.height*.5;
    // Use the V258 pixel-measured *visible alpha silhouette*, not the 2x2
    // button's original dimensions. The largest of 38 illustrations now
    // respects the same safe left/right margin without cutting off tall art.
    const visibleW=Number(button.dataset.figureWidthPx)||rect.width*.72;
    const visibleH=Number(button.dataset.figureHeightPx)||rect.height*.72;
    const horizontalLimit=Math.max(1,stageRect.width-Math.min(36,stageRect.width*.06));
    const verticalLimit=Math.max(1,stageRect.height*.92);
    const scale=Math.min(horizontalLimit/visibleW,verticalLimit/visibleH);
    button.dataset.winningScale=scale.toFixed(4);
    button.dataset.winVisibleWidth=(visibleW*scale).toFixed(2);
    button.dataset.winVisibleHeight=(visibleH*scale).toFixed(2);
    root.dataset.winSideMargin=((stageRect.width-visibleW*scale)/2).toFixed(2);
    losingCards=[];loserFadeStart=performance.now();
    cards.forEach(card=>{
      if(card===button){
        card.classList.remove('s3d-find-wrong');
        card.classList.add('s3d-find-selected');
        card.style.zIndex='15';
        pose(card,{x:centerX-(rect.left+rect.width*.5),
          y:centerY-(rect.top+rect.height*.5),z:0,s:scale,opacity:1},
          WIN_ZOOM_MS,'cubic-bezier(.18,.73,.26,1)');
      }else{
        // V260 iPhone fix: never depend on competing CSS transition /
        // keyframe compositing. Update actual opacity every WebGL frame.
        card.classList.remove('s3d-find-wrong');
        card.classList.add('s3d-find-dismissing');
        card.style.animation='none';
        card.style.transition='none';
        card.style.opacity='1';
        card.style.pointerEvents='none';
        losingCards.push(card);
      }
    });
    // Backstop for backgrounded WebKit where requestAnimationFrame may pause.
    // Never let a compositor layer linger through the long winning hold.
    delay(()=>finishLoserFade(),LOSER_FADE_MS+100);
    // 1.22s gentle approach, then >3 seconds full-size viewing; only then
    // a slow receding exit. Newly appearing choices have NO entry sound.
    mainTimer=delay(beginExit,WIN_HOLD_MS);
  }
  function finishLoserFade(){
    if(!losingCards.length)return;
    for(const card of losingCards){
      card.style.opacity='0';
      card.classList.add('s3d-find-hidden');
      card.style.display='none';
      card.remove();
    }
    losingCards=[];
    root.dataset.winnerIsolated='true';
  }
  function animateLoserFade(t){
    if(!losingCards.length)return;
    const p=clamp((t-loserFadeStart)/LOSER_FADE_MS,0,1);
    const smooth=p*p*(3-2*p);
    for(const card of losingCards)card.style.opacity=(1-smooth).toFixed(4);
    if(p>=1)finishLoserFade();
  }
  function beginExit(){
    if(disposed||phase!=='winning')return;
    phase='exit';root.dataset.constellationPhase='exit';
    root.classList.remove('s3d-find-won');
    // Only the centered selected constellation exits; loser nodes were
    // permanently detached after their completed 720ms fade.
    const card=cards.find(el=>el.classList.contains('s3d-find-selected'));
    if(card){
      card.style.transition='transform '+EXIT_MS+'ms cubic-bezier(.32,0,.68,.48), opacity '+
        EXIT_MS+'ms cubic-bezier(.42,0,.78,.48)';
      const old=card.style.transform;
      const found=old.match(/scale\(([\d.]+)\)/);
      const startScale=found?Number(found[1]):1;
      requestAnimationFrame(()=>{
        if(disposed||phase!=='exit')return;
        card.style.transform=old.replace(/scale\([\d.]+\)/,
          'scale('+(startScale*.64).toFixed(4)+')');
        card.style.opacity='0';
      });
    }
    delay(()=>{
      if(disposed)return;
      resetCards();phase='starfield-pause';
      root.dataset.constellationPhase='starfield-pause';
      progress.textContent='✦ ✦ ✦';
      delay(buildRound,STARFIELD_PAUSE_MS);
    },EXIT_MS+30);
  }

  function resize(){
    const w=Math.max(2,root.clientWidth),h=Math.max(2,root.clientHeight);
    if(renderer.domElement._w===w&&renderer.domElement._h===h)return;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
    renderer.domElement._w=w;renderer.domElement._h=h;
  }
  let last=performance.now();
  function loop(t){
    if(disposed)return;
    const dt=clamp((t-last)/1000,0,.05);last=t;
    animateLoserFade(t);
    resize();stars.rotation.z+=dt*.0022;meteor.tick(t);
    mist.forEach((m,i)=>{m.material.opacity=.11+Math.sin(t*.00022+i)*.025});
    renderer.render(scene,camera);
    raf=requestAnimationFrame(loop);
  }
  resize();raf=requestAnimationFrame(loop);buildRound();
  ctx.gameCleanup.push(()=>{
    if(disposed)return;disposed=true;sequence++;
    cancelAnimationFrame(raf);
    for(const id of timers)clearTimeout(id);
    timers.clear();resetCards();cache.clear();queued=null;
    meteor.dispose();
    scene.remove(stars,backdrop);
    starsGeometry.dispose();starsMaterial.dispose();
    backdrop.geometry.dispose();backdrop.material.dispose();nebulaMap.dispose();
    mist.forEach(s=>{scene.remove(s);s.material.dispose()});mistTexture.dispose();
    if(keepAliveOsc){try{keepAliveOsc.stop()}catch{}keepAliveOsc.disconnect();keepAliveOsc=null}
    if(keepAliveGain){keepAliveGain.disconnect();keepAliveGain=null}
    if(audioContext){audioContext.close().catch(()=>{});audioContext=null}
    renderer.dispose();renderer.forceContextLoss?.();
    if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
  });
}
