(() => {
  'use strict';

  const DESIGN_W = 709, DESIGN_H = 1536;
  const root = document.documentElement;
  const $ = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>[...c.querySelectorAll(s)];

  const homeScreen=$('#homeScreen'), sectionScreen=$('#sectionScreen'), activityScreen=$('#activityScreen');
  const settingsModal=$('#settingsModal'), avatarModal=$('#avatarModal'), menuMusic=$('#menuMusic'), toast=$('#toast');
  const sectionBackdrop=$('#sectionBackdrop'), sectionHero=$('#sectionHero'), sectionTitle=$('#sectionTitle');
  const sectionGames=$('#sectionGames'), sectionStars=$('#sectionStars');
  const activitySectionTitle=$('#activitySectionTitle'), activityTitle=$('#activityTitle'), activityStars=$('#activityStars'), activityContent=$('#activityContent');

  const SETTINGS_KEY='areg-settings-v35', AVATAR_KEY='areg-avatar-v2', AVATAR_SOURCE_KEY='areg-avatar-source-v2', STARS_KEY='areg-stars-v35';
  let settings={master:true,music:true,voice:true,effects:true,...loadJson(SETTINGS_KEY,{})};
  let stars=Number(localStorage.getItem(STARS_KEY)||120);
  let currentSection='nature', currentGame=null, gameCleanup=[];

  const SECTIONS={
    nature:{
      title:'Բնություն', hero:'hero-nature.jpg', backdrop:'hero-nature.jpg',
      games:[
        {id:'lion',label:'Կենդանիներ',thumb:'nature-game-1.jpg',kind:'shadow'},
        {id:'birds',label:'Թռչուններ',thumb:'nature-game-2.jpg',kind:'hatch'},
        {id:'sea',label:'Ջրային կենդանիներ',thumb:'nature-game-3.jpg',kind:'feed'},
        {id:'flowers',label:'Ծաղիկներ',thumb:'nature-game-4.jpg',kind:'garden'}
      ]
    },
    space:{
      title:'Տիեզերք', hero:'hero-space.jpg', backdrop:'hero-space.jpg',
      games:[
        {id:'planets',label:'Մոլորակներ',thumb:'space-game-1.jpg',kind:'orbits'},
        {id:'stars',label:'Աստղեր',thumb:'space-game-2.jpg',kind:'catch'},
        {id:'rocket',label:'Հրթիռ',thumb:'space-game-3.jpg',kind:'rocket'},
        {id:'constellation',label:'Համաստեղություն',thumb:'space-game-4.jpg',kind:'connect'}
      ]
    },
    mind:{
      title:'Մտքի խաղեր', hero:'hero-mind.jpg', backdrop:'hero-mind.jpg',
      games:[
        {id:'puzzle',label:'Փազլ',thumb:'mind-game-1.jpg',kind:'sort'},
        {id:'sizes',label:'Մեծ ու փոքր',thumb:'mind-game-2.jpg',kind:'sizes'},
        {id:'pattern',label:'Շարունակի՛ր շարքը',thumb:'mind-game-3.jpg',kind:'pattern'},
        {id:'numbers',label:'Թվեր',thumb:'mind-game-4.jpg',kind:'cups'}
      ]
    },
    create:{
      title:'Ստեղծագործություն', hero:'hero-create.jpg', backdrop:'hero-create.jpg',
      games:[
        {id:'paint',label:'Մատիկով նկարչություն',thumb:'create-game-1.jpg',kind:'paint'},
        {id:'stickers',label:'Սթիքերների աշխարհ',thumb:'create-game-2.jpg',kind:'stickers'},
        {id:'mix',label:'Խառնիր գույները',thumb:'create-game-3.jpg',kind:'mix'},
        {id:'blocks',label:'Կառուցիր աշտարակ',thumb:'create-game-4.jpg',kind:'blocks'}
      ]
    },
    magic:{
      title:'Կախարդական աստղի սենյակ', hero:'hero-magic.jpg', backdrop:'hero-magic.jpg',
      games:[
        {id:'connect',label:'Միացրու աստղերը',thumb:'magic-game-1.jpg',kind:'connect'},
        {id:'wand',label:'Կախարդական փայտիկ',thumb:'magic-game-2.jpg',kind:'wand'},
        {id:'potion',label:'Կախարդական ըմպելիք',thumb:'magic-game-3.jpg',kind:'potion'},
        {id:'book',label:'Կենդանի հեքիաթագիրք',thumb:'magic-game-4.jpg',kind:'book'}
      ]
    }
  };

  function loadJson(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
  function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(settings))}
  function saveStars(){localStorage.setItem(STARS_KEY,String(stars))}
  function updateStars(){sectionStars.textContent=String(stars);activityStars.textContent=String(stars)}

  /* viewport */
  const safeProbe=document.createElement('div');
  Object.assign(safeProbe.style,{position:'fixed',inset:'0',visibility:'hidden',pointerEvents:'none',paddingTop:'env(safe-area-inset-top,0px)'});
  document.body.appendChild(safeProbe);
  function syncViewport(){
    const vv=visualViewport, vw=vv?.width||innerWidth, vh=vv?.height||innerHeight;
    const standalone=matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
    const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    let lw=vw,lh=vh,safeTop=parseFloat(getComputedStyle(safeProbe).paddingTop)||0;
    if(standalone&&ios){
      const sw=screen?.width||vw,sh=screen?.height||vh,portrait=vw<=vh;
      lw=portrait?Math.min(sw,sh):Math.max(sw,sh); lh=portrait?Math.max(sw,sh):Math.min(sw,sh);
      if(!Number.isFinite(lw)||Math.abs(lw-vw)>120)lw=vw;
      if(!Number.isFinite(lh)||lh<vh)lh=Math.max(vh,innerHeight||0);
      safeTop=Math.max(safeTop,Math.max(sw,sh)>=852?59:Math.max(sw,sh)>=812?47:20);root.classList.add('ios-standalone');
    }else root.classList.remove('ios-standalone');
    const scale=Math.min(lw/DESIGN_W,lh/DESIGN_H);
    root.style.setProperty('--app-h',`${lh}px`);root.style.setProperty('--stage-scale',String(scale));
    root.style.setProperty('--stage-x',`${lw/2}px`);root.style.setProperty('--stage-y',`${lh/2}px`);
    if(standalone&&ios){
      root.style.setProperty('--avatar-safe-y',`${Math.max(0,(safeTop+2)/scale-58)}px`);
      root.style.setProperty('--top-controls-safe-y',`${Math.max(0,(safeTop+8)/scale-34)}px`);
    }else{root.style.setProperty('--avatar-safe-y','0px');root.style.setProperty('--top-controls-safe-y','0px')}
  }
  syncViewport();[100,500,1200].forEach(ms=>setTimeout(syncViewport,ms));
  addEventListener('resize',syncViewport,{passive:true});visualViewport?.addEventListener('resize',syncViewport,{passive:true});

  document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('dragstart',e=>e.preventDefault());
  document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
  document.addEventListener('touchmove',e=>{
    if(!e.target.closest('.settings-panel,.avatar-panel,#cropPreview,.activity-content,input[type="range"],canvas'))e.preventDefault();
  },{passive:false});

  /* audio/settings */
  menuMusic.volume=.24;let audioUnlocked=false;
  async function ensureAudio(){if(!settings.master||!settings.music)return;try{await menuMusic.play();audioUnlocked=true}catch{}}
  function applyAudio(){if(settings.master&&settings.music)ensureAudio();else menuMusic.pause()}
  ['pointerdown','touchend'].forEach(t=>document.addEventListener(t,()=>{if(!audioUnlocked)ensureAudio()},{once:true,passive:true}));
  document.addEventListener('visibilitychange',()=>document.hidden?menuMusic.pause():applyAudio());applyAudio();
  const toggles={master:$('#masterSound'),music:$('#musicSound'),voice:$('#voiceHints'),effects:$('#gameEffects')};
  function syncSettings(){Object.entries(toggles).forEach(([k,e])=>e.checked=!!settings[k])}
  syncSettings();Object.entries(toggles).forEach(([k,e])=>e.addEventListener('change',()=>{settings[k]=e.checked;saveSettings();applyAudio();root.classList.toggle('effects-off',!settings.effects)}));
  $('#settingsButton').addEventListener('click',()=>{syncSettings();settingsModal.hidden=false});
  $$('[data-close="settings"]').forEach(e=>e.addEventListener('click',()=>settingsModal.hidden=true));
  $('#starCounter').addEventListener('click',()=>showToast(`⭐ ${stars}`));

  /* section navigation */
  $$('.section-card').forEach(card=>card.addEventListener('click',()=>openSection(card.dataset.section)));
  $('#sectionBack').addEventListener('click',closeSection);
  $('#activityBack').addEventListener('click',backToSection);

  function openSection(id){
    currentSection=id;const s=SECTIONS[id];if(!s)return;
    sectionScreen.dataset.section=id;sectionTitle.textContent=s.title;sectionHero.src=s.hero;sectionBackdrop.src=s.backdrop;
    updateStars();sectionGames.innerHTML='';
    s.games.forEach(g=>{
      const b=document.createElement('button');b.className='toddler-game-card';b.setAttribute('aria-label',g.label);
      b.innerHTML=`<img src="${g.thumb}" alt="" draggable="false"><span class="toddler-game-label">${g.label}</span>`;
      b.addEventListener('click',()=>openGame(s,g));sectionGames.appendChild(b);
    });
    homeScreen.style.visibility='hidden';sectionScreen.hidden=false;requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'));
  }
  function closeSection(){sectionScreen.classList.remove('is-visible');setTimeout(()=>{sectionScreen.hidden=true;homeScreen.style.visibility='visible'},180)}
  function openGame(section,game){
    cleanupGame();currentGame=game;activitySectionTitle.textContent=section.title;activityTitle.textContent=game.label;updateStars();
    sectionScreen.classList.remove('is-visible');setTimeout(()=>{sectionScreen.hidden=true;activityScreen.hidden=false;requestAnimationFrame(()=>activityScreen.classList.add('is-visible'));renderGame(game)},150);
  }
  function backToSection(){cleanupGame();activityScreen.classList.remove('is-visible');setTimeout(()=>{activityScreen.hidden=true;sectionScreen.hidden=false;requestAnimationFrame(()=>sectionScreen.classList.add('is-visible'))},160)}
  function cleanupGame(){gameCleanup.splice(0).forEach(fn=>{try{fn()}catch{}});activityContent.innerHTML=''}
  function renderGame(g){
    const map={shadow:gameShadow,feed:gameFeed,hatch:gameHatch,garden:gameGarden,rocket:gameRocket,orbits:gameOrbits,catch:gameCatch,landing:gameLanding,sort:gameSort,sizes:gameSizes,pattern:gamePattern,cups:gameCups,paint:gamePaint,stickers:gameStickers,mix:gameMix,blocks:gameBlocks,connect:gameConnect,wand:gameWand,potion:gamePotion,book:gameBook};
    (map[g.kind]||gameShadow)();
  }

  function surface(hint='👆'){activityContent.innerHTML='<div class="game-surface"></div>';const s=$('.game-surface',activityContent);if(hint){const h=document.createElement('div');h.className='game-hint';h.textContent=hint;s.appendChild(h);const hide=()=>h.classList.add('hide');s.addEventListener('pointerdown',hide,{once:true});}return s}
  function reward(n=2){stars+=n;saveStars();updateStars();celebrate()}
  function celebrate(){
    const o=document.createElement('div');o.className='big-celebrate';o.innerHTML='<div>🌟</div>';activityContent.appendChild(o);
    for(let i=0;i<18;i++){const c=document.createElement('span');c.className='confetti-piece';c.textContent=['⭐','✨','●'][i%3];c.style.left=`${5+Math.random()*90}%`;c.style.top=`${-10-Math.random()*25}px`;c.style.animationDelay=`${Math.random()*.25}s`;o.appendChild(c)}
    setTimeout(()=>o.remove(),1000);
  }
  function completeOnce(el,n=2){if(el.dataset.done)return;el.dataset.done='1';reward(n)}
  function shake(el){el.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:260})}
  function rectOverlap(a,b){const A=a.getBoundingClientRect(),B=b.getBoundingClientRect();return A.left<B.right&&A.right>B.left&&A.top<B.bottom&&A.bottom>B.top}
  function makeDrag(el,{onMove,onDrop,container=activityContent}={}){
    let sx=0,sy=0,ox=0,oy=0,drag=false;
    const down=e=>{drag=true;el.classList.add('dragging');el.setPointerCapture?.(e.pointerId);sx=e.clientX;sy=e.clientY;ox=parseFloat(el.style.left)||el.offsetLeft;oy=parseFloat(el.style.top)||el.offsetTop;e.preventDefault()};
    const move=e=>{if(!drag)return;const cr=container.getBoundingClientRect(),x=Math.max(0,Math.min(cr.width-el.offsetWidth,ox+e.clientX-sx)),y=Math.max(0,Math.min(cr.height-el.offsetHeight,oy+e.clientY-sy));el.style.left=x+'px';el.style.top=y+'px';onMove?.(el,e)};
    const up=e=>{if(!drag)return;drag=false;el.classList.remove('dragging');onDrop?.(el,e)};
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    gameCleanup.push(()=>{el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up)});
  }

  /* NATURE */
  function gameShadow(){
    const s=surface('☝️'),animals=[['🦁','lion'],['🐘','ele'],['🐇','bun']];let done=0;
    animals.forEach(([ico,key],i)=>{
      const slot=document.createElement('div');slot.className='drop-slot shadow-slot';slot.dataset.key=key;slot.style.left=`${10+i*31}%`;slot.style.top='17%';slot.innerHTML=`<span class="sil">${ico}</span>`;s.appendChild(slot);
      const p=document.createElement('div');p.className='drag-piece shadow-animal';p.dataset.key=key;p.textContent=ico;p.style.left=`${8+i*31}%`;p.style.top='68%';s.appendChild(p);
      makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,slot)){p.remove();slot.innerHTML=ico;slot.classList.add('good');if(++done===3)reward()}else shake(p)}});
    });
  }
  function gameFeed(){
    const s=surface('☝️'),rounds=[['🐰','🥕'],['🐵','🍌'],['🐶','🦴']];let r=0;
    const animal=document.createElement('div');animal.className='feed-animal';
    const bubble=document.createElement('div');bubble.className='feed-bubble';
    const mouth=document.createElement('div');mouth.className='feed-mouth';
    s.append(animal,bubble,mouth);
    function next(){
      $$('.food-piece',s).forEach(x=>x.remove());
      if(r>=rounds.length){reward();return}
      animal.textContent=rounds[r][0];bubble.textContent=rounds[r][1];
      ['🥕','🍌','🦴'].forEach((food,i)=>{
        const p=document.createElement('div');p.className='drag-piece food-piece';p.textContent=food;
        p.style.left=`${10+i*31}%`;p.style.top='72%';s.appendChild(p);
        const startLeft=p.style.left,startTop=p.style.top;
        makeDrag(p,{container:s,onDrop:()=>{
          if(food===rounds[r][1]&&rectOverlap(p,mouth)){
            animal.animate([{transform:'translate(-50%,-50%) scale(1)'},{transform:'translate(-50%,-50%) scale(1.12)'},{transform:'translate(-50%,-50%) scale(1)'}],{duration:300});
            r++;setTimeout(next,300);
          }else{p.style.left=startLeft;p.style.top=startTop;shake(p)}
        }});
      });
    }next();
  }
  function gameHatch(){
    const s=surface('☝️'),grid=document.createElement('div');grid.className='egg-grid';s.appendChild(grid);let done=0;
    ['🐦','🐤','🦜','🦉'].forEach(bird=>{const b=document.createElement('button');b.className='egg-btn';b.innerHTML=`<span class="egg">🥚</span><span class="bird">${bird}</span>`;b.dataset.taps='0';
      b.addEventListener('click',()=>{let n=+b.dataset.taps+1;b.dataset.taps=n;if(n===1)b.querySelector('.egg').textContent='🐣';if(n>=2&&!b.classList.contains('hatched')){b.classList.add('hatched');if(++done===4)reward()}});grid.appendChild(b)})
  }
  function gameGarden(){
    const s=surface('↔️'),bed=document.createElement('div');bed.className='garden-bed';s.appendChild(bed);let done=0;
    [12,35,58,80].forEach((x,i)=>{const pot=document.createElement('div');pot.className='pot';pot.style.left=`${x}%`;pot.innerHTML=`<span class="flower">${['🌷','🌻','🌸','🌼'][i]}</span>`;bed.appendChild(pot)});
    const can=document.createElement('div');can.className='drag-piece watering-can';can.textContent='🚿';can.style.left='8%';can.style.top='20%';s.appendChild(can);
    makeDrag(can,{container:s,onMove:()=>{$$('.pot',bed).forEach(p=>{if(!p.classList.contains('bloom')&&rectOverlap(can,p)){p.classList.add('bloom');if(++done===4)reward()}})}})
  }

  /* SPACE */
  function gameRocket(){
    const s=surface('☝️'),board=document.createElement('div');board.className='rocket-board';s.appendChild(board);let done=0;
    const data=[['🔺',0],['⬜',1],['🔥',2]];
    data.forEach(([ico,k])=>{const sl=document.createElement('div');sl.className='drop-slot rocket-slot';sl.dataset.k=k;sl.style.top=`${k*96}px`;sl.textContent='·';board.appendChild(sl);
      const p=document.createElement('div');p.className='drag-piece rocket-piece';p.textContent=ico;p.dataset.k=k;p.style.left=`${12+k*30}%`;p.style.top='73%';s.appendChild(p);
      makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,sl)){p.remove();sl.textContent=ico;sl.classList.add('good');if(++done===3)reward()}else shake(p)}})
    })
  }
  function gameOrbits(){
    const s=surface('☝️'),zone=document.createElement('div');zone.className='orbit-zone';s.appendChild(zone);let done=0;
    const targets=[{x:44,y:40,size:62,k:'a'},{x:17,y:56,size:78,k:'b'},{x:70,y:65,size:92,k:'c'}],planets=[['🌕','a'],['🌍','b'],['🪐','c']];
    targets.forEach(t=>{const sl=document.createElement('div');sl.className='orbit-target';sl.dataset.k=t.k;sl.style.left=t.x+'%';sl.style.top=t.y+'%';sl.style.width=t.size+'px';sl.style.height=t.size+'px';s.appendChild(sl)});
    planets.forEach(([ico,k],i)=>{const p=document.createElement('div');p.className='drag-piece planet-piece';p.textContent=ico;p.dataset.k=k;p.style.left=`${10+i*31}%`;p.style.top='78%';s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{const sl=$(`.orbit-target[data-k="${k}"]`,s);if(rectOverlap(p,sl)){p.remove();sl.textContent=ico;sl.style.fontSize='52px';sl.style.display='grid';sl.style.placeItems='center';if(++done===3)reward()}else shake(p)}})})
  }
  function gameCatch(){
    const s=surface('↔️');s.classList.add('space-field');const c=document.createElement('div');c.className='star-catcher';c.textContent='🧺';c.style.left='45%';s.appendChild(c);const cnt=document.createElement('div');cnt.className='catch-counter';cnt.textContent='⭐ 0/6';s.appendChild(cnt);let caught=0,running=true,last=0,items=[];
    makeDrag(c,{container:s});function spawn(){const st=document.createElement('div');st.className='falling-star';st.textContent='⭐';st.style.left=(5+Math.random()*85)+'%';st.dataset.y='-50';s.appendChild(st);items.push(st)}
    const timer=setInterval(spawn,700);gameCleanup.push(()=>clearInterval(timer));
    function loop(t){if(!running)return;const dt=Math.min(32,t-last||16);last=t;items=[...items].filter(st=>{let y=+st.dataset.y+dt*.16;st.dataset.y=y;st.style.top=y+'px';if(rectOverlap(st,c)){st.remove();caught++;cnt.textContent=`⭐ ${caught}/6`;if(caught>=6){running=false;clearInterval(timer);reward()}return false}if(y>s.clientHeight){st.remove();return false}return true});if(running)requestAnimationFrame(loop)}requestAnimationFrame(loop);gameCleanup.push(()=>running=false)
  }
  function gameLanding(){
    const s=surface('🔥');s.classList.add('moon-field');const lander=document.createElement('div');lander.className='lander';lander.textContent='🚀';const pad=document.createElement('div');pad.className='landing-pad';const thr=document.createElement('button');thr.className='thrust-btn';thr.textContent='🔥';s.append(lander,pad,thr);
    let y=65,v=0,thrust=false,running=true,crashed=false,last=performance.now();const pd=()=>thrust=true,pu=()=>thrust=false;thr.addEventListener('pointerdown',pd);addEventListener('pointerup',pu);gameCleanup.push(()=>{running=false;thr.removeEventListener('pointerdown',pd);removeEventListener('pointerup',pu)});
    function reset(){y=65;v=0;crashed=false;lander.textContent='🚀';lander.style.left='50%';lander.style.top='65px'}
    function loop(t){
      if(!running)return;
      const dt=Math.min(.035,(t-last)/1000);last=t;
      if(!crashed){
        v+=(thrust?-42:23)*dt;y+=v*22*dt;lander.style.top=y+'px';
        if(y>s.clientHeight-190){
          if(Math.abs(v)<8){running=false;lander.style.top=(s.clientHeight-190)+'px';reward(3)}
          else{crashed=true;lander.textContent='💥';setTimeout(()=>{reset();last=performance.now()},520)}
        }
      }
      requestAnimationFrame(loop);
    }requestAnimationFrame(loop)
  }

  /* MIND */
  function gameSort(){
    const s=surface('☝️'),colors=[['#ef5350','r'],['#42a5f5','b'],['#66bb6a','g']],bins=[];let done=0;
    colors.forEach(([col,k],i)=>{const b=document.createElement('div');b.className='sort-bin';b.dataset.k=k;b.style.left=`${5+i*31}%`;b.style.background=col+'99';s.appendChild(b);bins.push(b)});
    const chips=[...colors,...colors];chips.forEach(([col,k],i)=>{const p=document.createElement('div');p.className='drag-piece color-chip';p.dataset.k=k;p.style.background=col;p.style.left=`${8+(i%3)*31}%`;p.style.top=`${18+Math.floor(i/3)*18}%`;s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{const b=bins.find(x=>x.dataset.k===k);if(rectOverlap(p,b)){p.remove();if(++done===6)reward()}else shake(p)}})})
  }
  function gameSizes(){
    const s=surface('☝️'),sizes=[56,82,108];let done=0;
    sizes.forEach((sz,i)=>{const sl=document.createElement('div');sl.className='drop-slot size-slot';sl.dataset.i=i;sl.style.width=sl.style.height=sz+'px';sl.style.left=`${12+i*31}%`;sl.style.top='20%';s.appendChild(sl);
      const p=document.createElement('div');p.className='drag-piece size-piece';p.dataset.i=i;p.style.width=p.style.height=sz+'px';p.style.left=`${10+i*31}%`;p.style.top='67%';s.appendChild(p);makeDrag(p,{container:s,onDrop:()=>{if(rectOverlap(p,sl)){p.remove();sl.style.background='#61b4ff';sl.style.borderStyle='solid';if(++done===3)reward()}else shake(p)}})})
  }
  function gamePattern(){
    const s=surface('☝️');let round=0;const rounds=[[['🔵','🟡','🔵','🟡'],'🔵',['🔵','🟢','🔺']],[['⭐','🌙','⭐','🌙'],'⭐',['🌙','⭐','☀️']],[['🍎','🍌','🍎','🍌'],'🍎',['🍎','🍓','🍌']]];
    function draw(){s.innerHTML='';const h=document.createElement('div');h.className='game-hint';h.textContent='☝️';s.appendChild(h);const [seq,ans,opts]=rounds[round];const row=document.createElement('div');row.className='pattern-row';row.textContent=seq.join(' ')+'  ❓';const choices=document.createElement('div');choices.className='pattern-options';opts.forEach(o=>{const b=document.createElement('button');b.className='pattern-choice';b.textContent=o;b.addEventListener('click',()=>{if(o===ans){b.style.background='#c7f2ac';round++;if(round>=rounds.length)reward();else setTimeout(draw,350)}else shake(b)});choices.appendChild(b)});s.append(row,choices)}draw()
  }
  function gameCups(){
    const s=surface('☝️');let round=0,target=0;const area=document.createElement('div');area.className='cups-area';s.appendChild(area);
    function next(){area.innerHTML='';target=Math.floor(Math.random()*3);for(let i=0;i<3;i++){const b=document.createElement('button');b.className='cup-btn';b.innerHTML=`🥤<span class="cup-star">⭐</span>`;if(i===target)b.classList.add('reveal');area.appendChild(b);b.addEventListener('click',()=>choose(i,b))}setTimeout(()=>{$$('.cup-btn',area).forEach(b=>b.classList.remove('reveal'));area.animate([{transform:'translateX(0)'},{transform:'translateX(10px)'},{transform:'translateX(-10px)'},{transform:'translateX(0)'}],{duration:650})},850)}
    function choose(i,b){if(i===target){b.classList.add('reveal');round++;if(round>=3)reward();else setTimeout(next,550)}else shake(b)}next()
  }

  /* CREATIVITY */
  function gamePaint(){
    const s=surface(null),wrap=document.createElement('div');wrap.className='paint-wrap';const pal=document.createElement('div');pal.className='palette-row';const box=document.createElement('div');box.className='paint-canvas-box';box.innerHTML='<canvas class="paint-canvas"></canvas>';const done=document.createElement('button');done.className='primary-action';done.textContent='⭐';done.style.cssText='align-self:center;min-width:90px;font-size:28px';wrap.append(pal,box,done);s.appendChild(wrap);
    const colors=['#ef5350','#ff9800','#ffeb3b','#66bb6a','#42a5f5','#ab47bc','#3e2723'];let col=colors[0];colors.forEach((c,i)=>{const b=document.createElement('button');b.className='palette-dot';b.style.background=c;if(i===0)b.style.boxShadow='0 0 0 4px #ffd77f';b.addEventListener('click',()=>{col=c;$$('.palette-dot',pal).forEach(x=>x.style.boxShadow='');b.style.boxShadow='0 0 0 4px #ffd77f'});pal.appendChild(b)});
    const canvas=$('canvas',box),ctx=canvas.getContext('2d');function size(){const r=box.getBoundingClientRect();canvas.width=Math.max(250,r.width);canvas.height=Math.max(300,r.height);ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=10}requestAnimationFrame(size);let drawing=false;
    const pt=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};canvas.onpointerdown=e=>{drawing=true;const p=pt(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};canvas.onpointermove=e=>{if(!drawing)return;const p=pt(e);ctx.strokeStyle=col;ctx.lineTo(p.x,p.y);ctx.stroke()};const paintUp=()=>drawing=false;addEventListener('pointerup',paintUp);gameCleanup.push(()=>removeEventListener('pointerup',paintUp));done.addEventListener('click',()=>reward())
  }
  function gameStickers(){
    const s=surface('☝️'),scene=document.createElement('div');scene.className='sticker-scene';
    const tray=document.createElement('div');tray.className='sticker-tray';s.append(scene,tray);let placed=0;
    ['🌈','☀️','🌳','🐶','⭐','🌸'].forEach(ico=>{
      const p=document.createElement('button');p.className='sticker-item';p.textContent=ico;tray.appendChild(p);
      p.addEventListener('click',()=>{
        const clone=document.createElement('div');clone.className='sticker-item';clone.textContent=ico;
        clone.style.cssText=`position:absolute;left:${5+Math.random()*78}%;top:${8+Math.random()*68}%;font-size:${42+Math.random()*22}px;transform:rotate(${Math.random()*18-9}deg);`;
        scene.appendChild(clone);clone.animate([{transform:'scale(.2)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:280});
        if(++placed===5)reward();
      });
    });
  }
  function gameMix(){
    const s=surface('☝️'),area=document.createElement('div');area.className='mix-area';const drops=document.createElement('div');drops.className='mix-drops';const bowl=document.createElement('div');bowl.className='mix-bowl';bowl.innerHTML='<div class="mix-liquid"></div>';area.append(drops,bowl);s.appendChild(area);let selected=[],found=new Set();const colors=[['#ef5350','r'],['#ffeb3b','y'],['#42a5f5','b']],mix={ry:'#ff9800',br:'#ab47bc',by:'#66bb6a'};
    colors.forEach(([c,k])=>{const b=document.createElement('button');b.className='paint-drop';b.style.background=c;b.addEventListener('click',()=>{if(selected.includes(k))return;selected.push(k);b.style.boxShadow='0 0 0 5px #fff,0 6px 0 rgba(75,39,17,.16)';if(selected.length===2){const key=[...selected].sort().join('');$('.mix-liquid',bowl).style.background=mix[key]||'#795548';found.add(key);setTimeout(()=>{$$('.paint-drop',drops).forEach(x=>x.style.boxShadow='');selected=[];if(found.size>=3)reward()},700)}});drops.appendChild(b)})
  }
  function gameBlocks(){
    const s=surface('☝️'),zone=document.createElement('div');zone.className='block-zone';const pad=document.createElement('div');pad.className='tower-pad';zone.appendChild(pad);s.appendChild(zone);let stack=0;
    ['#ef5350','#42a5f5','#ffca28','#66bb6a'].forEach((c,i)=>{const b=document.createElement('div');b.className='drag-piece block';b.style.background=c;b.style.left=`${8+i*21}%`;b.style.top='12%';zone.appendChild(b);makeDrag(b,{container:zone,onDrop:()=>{const zr=zone.getBoundingClientRect(),br=b.getBoundingClientRect(),cx=br.left+br.width/2-zr.left;if(Math.abs(cx-zr.width/2)<110){b.style.left=(zr.width/2-36)+'px';b.style.top=(zr.height-60-72*(stack+1))+'px';b.style.pointerEvents='none';stack++;if(stack===4)reward()}else shake(b)}})})
  }

  /* MAGIC */
  function gameConnect(){
    const s=surface('☝️'),field=document.createElement('div');field.className='star-connect';s.appendChild(field);const pts=[[18,68],[34,30],[50,58],[68,25],[82,66]];let next=0,drawing=false;const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 100 100');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%';const poly=document.createElementNS(svg.namespaceURI,'polyline');poly.setAttribute('fill','none');poly.setAttribute('stroke','#ffe56f');poly.setAttribute('stroke-width','1.5');poly.setAttribute('stroke-linecap','round');svg.appendChild(poly);field.appendChild(svg);
    const stars=pts.map((p,i)=>{const e=document.createElement('div');e.className='connect-star';e.textContent='⭐';e.style.left=`calc(${p[0]}% - 25px)`;e.style.top=`calc(${p[1]}% - 25px)`;e.dataset.i=i;field.appendChild(e);return e});
    function hit(e){const r=field.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100,p=pts[next];if(p&&Math.hypot(x-p[0],y-p[1])<9){stars[next].classList.add('done');next++;poly.setAttribute('points',pts.slice(0,next).map(p=>p.join(',')).join(' '));if(next===pts.length){drawing=false;reward(3)}}}
    field.addEventListener('pointerdown',e=>{drawing=true;next=0;stars.forEach(x=>x.classList.remove('done'));poly.setAttribute('points','');hit(e)});field.addEventListener('pointermove',e=>{if(drawing)hit(e)});const connectUp=()=>drawing=false;addEventListener('pointerup',connectUp);gameCleanup.push(()=>removeEventListener('pointerup',connectUp))
  }
  function gameWand(){
    const s=surface('↔️'),field=document.createElement('div');field.className='wand-field';s.appendChild(field);let lit=0;
    ['⭐','🌙','🔮','🦋','💎'].forEach((ico,i)=>{const o=document.createElement('div');o.className='magic-object';o.textContent=ico;o.style.left=`${12+(i%3)*33}%`;o.style.top=`${18+Math.floor(i/3)*42}%`;field.appendChild(o)});
    const w=document.createElement('div');w.className='drag-piece magic-wand';w.textContent='🪄';w.style.left='8%';w.style.top='70%';field.appendChild(w);makeDrag(w,{container:field,onMove:()=>{$$('.magic-object',field).forEach(o=>{if(!o.classList.contains('lit')&&rectOverlap(w,o)){o.classList.add('lit');if(++lit===5)reward()}})}})
  }
  function gamePotion(){
    const s=surface('☝️'),area=document.createElement('div');area.className='potion-area';const ca=document.createElement('div');ca.className='cauldron';ca.innerHTML='🫕<span class="potion-bubbles">✨🫧✨</span>';const ing=document.createElement('div');ing.className='ingredients';area.append(ca,ing);s.appendChild(area);let used=0;
    ['🍓','🍋','🍇','🌿','🫐','🌸'].forEach(ico=>{const b=document.createElement('button');b.className='ingredient';b.textContent=ico;b.addEventListener('click',()=>{if(b.disabled)return;b.disabled=true;b.style.opacity=.25;ca.classList.remove('bubble');void ca.offsetWidth;ca.classList.add('bubble');used++;if(used===4)reward(3)});ing.appendChild(b)})
  }
  function gameBook(){
    const s=surface('☝️'),book=document.createElement('div');book.className='story-book';const scene=document.createElement('button');scene.className='story-scene';const dots=document.createElement('div');dots.className='page-dots';book.append(scene,dots);s.appendChild(book);const pages=['🏰','🐉','🧚‍♀️','🌟'];let i=0;
    pages.forEach((_,n)=>{const d=document.createElement('span');d.className='page-dot'+(n===0?' on':'');dots.appendChild(d)});
    function draw(){scene.textContent=pages[i];$$('.page-dot',dots).forEach((d,n)=>d.classList.toggle('on',n===i))}draw();scene.addEventListener('click',()=>{scene.classList.add('pop');setTimeout(()=>scene.classList.remove('pop'),240);i++;if(i>=pages.length){reward(3);i=0}setTimeout(draw,260)})
  }

  /* avatar */
  const avatarButton=$('#avatarButton'),savedAvatar=$('#savedAvatar'),photoInput=$('#photoInput'),cropPreview=$('#cropPreview'),cropImage=$('#cropImage'),cropPlaceholder=$('#cropPlaceholder'),zoomSlider=$('#zoomSlider'),saveAvatar=$('#saveAvatar');
  let sourceDataUrl=null,naturalW=0,naturalH=0,zoom=1,panX=0,panY=0,pointerMap=new Map(),dragStart=null,pinchStart=null;
  const persisted=localStorage.getItem(AVATAR_KEY);if(persisted){savedAvatar.src=persisted;savedAvatar.hidden=false}
  avatarButton.addEventListener('click',()=>avatarModal.hidden=false);$$('[data-close="avatar"]').forEach(e=>e.addEventListener('click',()=>avatarModal.hidden=true));
  photoInput.addEventListener('change',async()=>{const f=photoInput.files?.[0];if(!f)return;sourceDataUrl=await downscaleImage(f,1800);cropImage.onload=()=>{naturalW=cropImage.naturalWidth;naturalH=cropImage.naturalHeight;zoom=1;panX=panY=0;zoomSlider.value='1';cropImage.hidden=false;cropPlaceholder.hidden=true;saveAvatar.disabled=false;renderCrop()};cropImage.src=sourceDataUrl});
  function previewSize(){return cropPreview.clientWidth-16}function baseFit(){const s=previewSize();return Math.max(s/naturalW,s/naturalH)}
  function renderCrop(){if(!naturalW)return;const s=previewSize(),fit=baseFit(),w=naturalW*fit*zoom,h=naturalH*fit*zoom;cropImage.style.width=w+'px';cropImage.style.height=h+'px';cropImage.style.left=((s-w)/2+8+panX)+'px';cropImage.style.top=((s-h)/2+8+panY)+'px'}
  zoomSlider.addEventListener('input',()=>{zoom=+zoomSlider.value;renderCrop()});$('#zoomOut').addEventListener('click',()=>{zoom=Math.max(.4,zoom-.15);zoomSlider.value=zoom;renderCrop()});$('#zoomIn').addEventListener('click',()=>{zoom=Math.min(4,zoom+.15);zoomSlider.value=zoom;renderCrop()});
  cropPreview.addEventListener('pointerdown',e=>{if(!sourceDataUrl)return;cropPreview.setPointerCapture?.(e.pointerId);pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerMap.size===1)dragStart={x:e.clientX,y:e.clientY,panX,panY};if(pointerMap.size===2){const p=[...pointerMap.values()];pinchStart={distance:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom}}});
  cropPreview.addEventListener('pointermove',e=>{if(!pointerMap.has(e.pointerId))return;pointerMap.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointerMap.size===1&&dragStart){panX=dragStart.panX+e.clientX-dragStart.x;panY=dragStart.panY+e.clientY-dragStart.y;renderCrop()}else if(pointerMap.size===2&&pinchStart){const p=[...pointerMap.values()],d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);zoom=Math.max(.4,Math.min(4,pinchStart.zoom*d/Math.max(1,pinchStart.distance)));zoomSlider.value=zoom;renderCrop()}});
  ['pointerup','pointercancel'].forEach(t=>cropPreview.addEventListener(t,e=>{pointerMap.delete(e.pointerId);if(pointerMap.size<2)pinchStart=null;if(!pointerMap.size)dragStart=null}));
  saveAvatar.addEventListener('click',async()=>{if(!sourceDataUrl)return;const data=await renderSavedAvatar();localStorage.setItem(AVATAR_KEY,data);localStorage.setItem(AVATAR_SOURCE_KEY,sourceDataUrl);savedAvatar.src=data;savedAvatar.hidden=false;avatarModal.hidden=true;showToast('✓')});
  async function renderSavedAvatar(){const out=512,c=document.createElement('canvas');c.width=c.height=out;const ctx=c.getContext('2d'),im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=rej;im.src=sourceDataUrl});const s=previewSize(),fit=Math.max(s/im.naturalWidth,s/im.naturalHeight),w=im.naturalWidth*fit*zoom,h=im.naturalHeight*fit*zoom,k=out/s;ctx.save();ctx.beginPath();ctx.arc(out/2,out/2,out/2,0,Math.PI*2);ctx.clip();ctx.drawImage(im,((s-w)/2+panX)*k,((s-h)/2+panY)*k,w*k,h*k);ctx.restore();return c.toDataURL('image/jpeg',.9)}
  async function downscaleImage(file,max){const raw=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)}),im=new Image();await new Promise((res,rej)=>{im.onload=res;im.onerror=rej;im.src=raw});const sc=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight));if(sc===1)return raw;const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*sc);c.height=Math.round(im.naturalHeight*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.9)}

  function showToast(t){toast.textContent=t;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),900)}
  updateStars();
  if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
})();