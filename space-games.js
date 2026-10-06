(()=>{
  'use strict';
  const $=(s,c=document)=>c.querySelector(s);
  const $$=(s,c=document)=>[...c.querySelectorAll(s)];

  function shuffleCopy(items){
    const a=[...items];
    for(let i=a.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  function createShuffleBag(items){
    let bag=[];
    let lastId='';
    return ()=>{
      if(!bag.length){
        bag=shuffleCopy(items);
        if(bag.length>1&&bag[bag.length-1]?.id===lastId){
          [bag[0],bag[bag.length-1]]=[bag[bag.length-1],bag[0]];
        }
      }
      const item=bag.pop();
      lastId=item?.id||'';
      return item;
    };
  }

  let spaceGameSpeechToken=0;
  function stopSpaceGameSpeech(){
    spaceGameSpeechToken++;
    try{speechSynthesis?.cancel()}catch{}
  }

  function speakSpaceGame(text,ctx){
    const token=++spaceGameSpeechToken;
    if(!ctx.settings.master||!ctx.settings.voice||!('speechSynthesis' in window))return Promise.resolve(false);
    return new Promise(resolve=>{
      let settled=false,timer=null;
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok)};
      try{
        speechSynthesis.cancel();
        const utter=new SpeechSynthesisUtterance(text);
        utter.lang='hy-AM';
        utter.rate=.86;
        utter.pitch=1.04;
        utter.volume=1;
        const voice=ctx.pickArmenianSpeechVoice();
        if(voice)utter.voice=voice;
        utter.onend=()=>finish(token===spaceGameSpeechToken);
        utter.onerror=()=>finish(false);
        speechSynthesis.resume?.();
        speechSynthesis.speak(utter);
        timer=setTimeout(()=>finish(false),6000);
      }catch{
        resolve(false);
      }
    });
  }

  function buildCosmicDust(host,count=44){
    const layer=document.createElement('div');
    layer.className='pro-space-dust';
    for(let i=0;i<count;i++){
      const st=document.createElement('i');
      st.style.setProperty('--x',(Math.random()*100).toFixed(2)+'%');
      st.style.setProperty('--y',(Math.random()*100).toFixed(2)+'%');
      st.style.setProperty('--s',(1+Math.random()*3.3).toFixed(2)+'px');
      st.style.setProperty('--a',(.28+Math.random()*.72).toFixed(2));
      st.style.setProperty('--d',(2.4+Math.random()*5.2).toFixed(2)+'s');
      st.style.setProperty('--delay',(-Math.random()*5).toFixed(2)+'s');
      layer.appendChild(st);
    }
    host.appendChild(layer);
    return layer;
  }

  function awardCosmicStar(host,ctx){
    ctx.awardStar();
    const burst=document.createElement('div');
    burst.className='cosmic-star-award';
    burst.innerHTML='<span>⭐</span><b>+1</b>';
    host.appendChild(burst);
    setTimeout(()=>burst.remove(),1250);
  }

  function gameSpaceSearch(ctx){
    ctx.activityContent.innerHTML='';
    const scene=document.createElement('div');
    scene.className='pro-space-game space-search-game';
    scene.innerHTML=`
      <div class="pro-space-nebula" aria-hidden="true"></div>
      <div class="pro-space-warp" aria-hidden="true"></div>
      <div class="space-search-hud">
        <div class="space-search-prompt"><small>ՏԻԵԶԵՐԱԿԱՆ ՈՐՈՆՈՒՄ</small><strong>Պատրաստվիր 🚀</strong></div>
        <div class="space-search-progress"><span>✦</span><b>0</b></div>
      </div>
      <div class="space-search-stage" role="group" aria-label="Տիեզերական որոնում"></div>
      <div class="space-search-message" aria-live="polite"></div>`;
    ctx.activityContent.appendChild(scene);
    buildCosmicDust(scene,54);
    const stage=$('.space-search-stage',scene);
    const promptStrong=$('.space-search-prompt strong',scene);
    const progress=$('.space-search-progress b',scene);
    const message=$('.space-search-message',scene);
    const warp=$('.pro-space-warp',scene);
    const nextTarget=createShuffleBag(ctx.PLANETS);
    let score=0;
    let round=0;
    let locked=false;
    let disposed=false;
    let recentIds=[];
    let roundTimer=null;
    ctx.menuMusic.pause();

    const slotClasses=['slot-a','slot-b','slot-c'];
    const viewNames=['view-a','view-b','view-c','view-d','view-e','view-f'];

    function chooseDecoys(target){
      const avoid=new Set([target.id,...recentIds]);
      let pool=shuffleCopy(ctx.PLANETS.filter(x=>!avoid.has(x.id)));
      if(pool.length<2)pool=shuffleCopy(ctx.PLANETS.filter(x=>x.id!==target.id));
      return pool.slice(0,2);
    }

    function renderRound(){
      if(disposed)return;
      clearTimeout(roundTimer);
      locked=false;
      round++;
      scene.classList.remove(...viewNames);
      scene.classList.add(viewNames[(round-1)%viewNames.length]);
      const target=nextTarget();
      const decoys=chooseDecoys(target);
      const options=shuffleCopy([target,...decoys]);
      recentIds=[...new Set(options.map(x=>x.id).concat(recentIds))].slice(0,6);
      stage.innerHTML='';
      message.textContent='';
      promptStrong.textContent=`Գտի՛ր՝ ${target.name}`;
      const randomizedSlots=shuffleCopy(slotClasses);
      options.forEach((item,index)=>{
        const btn=document.createElement('button');
        btn.type='button';
        btn.className=`space-object ${randomizedSlots[index]}`;
        btn.dataset.object=item.id;
        btn.style.setProperty('--tilt',`${(-8+Math.random()*16).toFixed(1)}deg`);
        btn.style.setProperty('--float-delay',`${(-Math.random()*3).toFixed(2)}s`);
        btn.setAttribute('aria-label',item.name);
        btn.innerHTML=`
          <span class="space-object-depth" aria-hidden="true"></span>
          <span class="space-object-visual">
            <img class="space-object-art" src="${item.img}?v=144" alt="" draggable="false">
            <span class="space-object-light" aria-hidden="true"></span>
          </span>
          <span class="space-object-name">${item.name}</span>`;
        btn.addEventListener('click',()=>{
          if(locked)return;
          if(item.id!==target.id){
            btn.classList.remove('soft-miss');
            void btn.offsetWidth;
            btn.classList.add('soft-miss');
            return;
          }
          locked=true;
          btn.classList.add('is-correct');
          $$('.space-object',stage).forEach(x=>{if(x!==btn)x.classList.add('is-dimmed')});
          message.textContent=item.name;
          score++;
          progress.textContent=String(score);
          speakSpaceGame(item.name,ctx);
          if(score%5===0)awardCosmicStar(scene,ctx);
          roundTimer=setTimeout(()=>{
            if(disposed)return;
            warp.classList.remove('run');
            void warp.offsetWidth;
            warp.classList.add('run');
            stage.classList.add('round-out');
            roundTimer=setTimeout(()=>{
              stage.classList.remove('round-out');
              renderRound();
            },520);
          },1350);
        });
        stage.appendChild(btn);
      });
      speakSpaceGame(`Գտի՛ր ${target.name}`,ctx);
    }

    renderRound();

    ctx.gameCleanup.push(()=>{
      disposed=true;
      clearTimeout(roundTimer);
      stopSpaceGameSpeech();
      if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
    });
  }

  const CONSTELLATION_GAME_PATTERNS=[
    [[16,62],[31,35],[47,53],[65,28],[82,59]],
    [[18,33],[35,25],[50,46],[67,31],[80,57],[62,72],[37,68]],
    [[20,70],[31,46],[46,30],[62,39],[79,24],[73,60],[54,72],[35,63]],
    [[15,52],[29,30],[47,39],[58,63],[77,71],[83,43]],
    [[20,29],[37,51],[52,28],[68,45],[82,25],[72,72],[44,70]],
    [[17,67],[31,54],[40,29],[58,39],[75,22],[82,52],[65,70],[43,63]],
    [[18,38],[34,25],[53,34],[70,24],[82,48],[67,64],[49,72],[31,61]],
    [[19,25],[33,45],[49,29],[63,51],[81,37],[72,68],[44,70],[27,59]],
    [[17,55],[30,28],[46,45],[61,25],[78,40],[69,64],[50,73],[32,66]],
    [[16,31],[30,50],[47,35],[62,55],[80,33],[71,72],[46,67],[28,75]],
    [[18,69],[27,43],[43,24],[59,34],[76,22],[82,49],[65,67],[43,72]],
    [[17,43],[31,26],[49,36],[64,24],[80,48],[70,69],[48,62],[29,74]],
    [[18,27],[33,35],[45,57],[60,37],[78,29],[82,61],[60,72],[37,69]],
    [[16,61],[30,39],[44,53],[58,29],[76,42],[82,70],[56,65],[33,73]],
    [[18,48],[28,27],[45,35],[58,56],[76,37],[82,63],[61,73],[39,66]],
    [[17,30],[31,58],[47,44],[63,25],[80,47],[72,69],[50,73],[29,68]]
  ];

  function constellationPatternFor(item,ctx){
    const idx=Math.max(0,ctx.CONSTELLATIONS.findIndex(x=>x.id===item.id));
    const base=CONSTELLATION_GAME_PATTERNS[idx%CONSTELLATION_GAME_PATTERNS.length].map(p=>[...p]);
    const mirror=idx%2===1;
    const dx=((idx*7)%9)-4;
    const dy=((idx*5)%7)-3;
    return base.map(([x,y])=>[
      Math.max(10,Math.min(90,(mirror?100-x:x)+dx)),
      Math.max(16,Math.min(82,y+dy))
    ]);
  }

  function gameConstellationQuest(ctx){
    ctx.activityContent.innerHTML='';
    const scene=document.createElement('div');
    scene.className='pro-space-game constellation-quest-game';
    scene.innerHTML=`
      <div class="pro-space-nebula" aria-hidden="true"></div>
      <div class="pro-space-warp" aria-hidden="true"></div>
      <div class="constellation-hud">
        <div class="constellation-prompt"><small>ՎԱՌԻՐ ՀԱՄԱՍՏԵՂՈՒԹՅՈՒՆԸ</small><strong>Աստղերը սպասում են ✨</strong></div>
        <div class="constellation-progress"><span>✦</span><b>0</b></div>
      </div>
      <div class="constellation-stage" role="group" aria-label="Վառիր համաստեղությունը">
        <img class="constellation-reveal-art" alt="" draggable="false">
        <svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>
        <div class="constellation-nodes"></div>
        <div class="constellation-name" aria-live="polite"></div>
      </div>`;
    ctx.activityContent.appendChild(scene);
    buildCosmicDust(scene,62);
    const stage=$('.constellation-stage',scene);
    const promptStrong=$('.constellation-prompt strong',scene);
    const progress=$('.constellation-progress b',scene);
    const reveal=$('.constellation-reveal-art',scene);
    const svg=$('.constellation-lines',scene);
    const nodesHost=$('.constellation-nodes',scene);
    const name=$('.constellation-name',scene);
    const warp=$('.pro-space-warp',scene);
    const nextConstellation=createShuffleBag(ctx.CONSTELLATIONS);
    let item=null;
    let points=[];
    let nextIndex=0;
    let drawing=false;
    let completed=0;
    let disposed=false;
    let nextTimer=null;
    let pulseTimer=null;
    ctx.menuMusic.pause();

    function updateNextPulse(){
      $$('.constellation-node',nodesHost).forEach((n,i)=>n.classList.toggle('is-next',i===nextIndex));
    }

    function addSegment(a,b){
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',a[0]);line.setAttribute('y1',a[1]);
      line.setAttribute('x2',b[0]);line.setAttribute('y2',b[1]);
      line.setAttribute('stroke','rgba(170,224,255,.98)');
      line.setAttribute('stroke-width','1.25');
      line.setAttribute('stroke-linecap','round');
      line.setAttribute('vector-effect','non-scaling-stroke');
      line.classList.add('constellation-segment');
      svg.appendChild(line);
    }

    function completeConstellation(){
      stage.classList.add('is-complete');
      name.textContent=item.name;
      promptStrong.textContent=item.name;
      completed++;
      progress.textContent=String(completed);
      speakSpaceGame(item.name,ctx);
      if(completed%5===0)awardCosmicStar(scene,ctx);
      nextTimer=setTimeout(()=>{
        if(disposed)return;
        warp.classList.remove('run');
        void warp.offsetWidth;
        warp.classList.add('run');
        stage.classList.add('round-out');
        nextTimer=setTimeout(()=>{
          stage.classList.remove('round-out');
          renderConstellation();
        },520);
      },2100);
    }

    function lightNext(){
      if(nextIndex>=points.length)return;
      const node=$(`.constellation-node[data-index="${nextIndex}"]`,nodesHost);
      if(!node)return;
      node.classList.add('is-lit');
      if(nextIndex>0)addSegment(points[nextIndex-1],points[nextIndex]);
      nextIndex++;
      updateNextPulse();
      if(nextIndex===points.length)completeConstellation();
    }

    function tryHit(clientX,clientY){
      if(nextIndex>=points.length)return;
      const node=$(`.constellation-node[data-index="${nextIndex}"]`,nodesHost);
      if(!node)return;
      const L=node.getBoundingClientRect();
      const cx=L.left+L.width/2,cy=L.top+L.height/2;
      if(Math.hypot(clientX-cx,clientY-cy)<=58)lightNext();
    }

    function renderConstellation(){
      clearTimeout(nextTimer);
      clearTimeout(pulseTimer);
      stage.classList.remove('is-complete');
      item=nextConstellation();
      points=constellationPatternFor(item,ctx);
      nextIndex=0;
      svg.innerHTML='';
      nodesHost.innerHTML='';
      name.textContent='';
      reveal.src=`${item.img}?v=144`;
      reveal.alt=item.name;
      promptStrong.textContent=`Վառենք՝ ${item.name}`;
      points.forEach(([x,y],i)=>{
        const node=document.createElement('button');
        node.type='button';
        node.className='constellation-node';
        node.dataset.index=String(i);
        node.style.left=x+'%';
        node.style.top=y+'%';
        node.style.setProperty('--depth',String(.82+(i%4)*.08));
        node.setAttribute('aria-label',`${item.name}, աստղ ${i+1}`);
        node.addEventListener('click',e=>{
          if(e.detail!==0)return;
          e.stopPropagation();
          if(i===nextIndex)lightNext();
        });
        nodesHost.appendChild(node);
      });
      updateNextPulse();
      speakSpaceGame(`Վառենք ${item.name}`,ctx);
    }

    const onDown=e=>{
      drawing=true;
      stage.setPointerCapture?.(e.pointerId);
      tryHit(e.clientX,e.clientY);
    };
    const onMove=e=>{if(drawing)tryHit(e.clientX,e.clientY)};
    const onUp=()=>{drawing=false};
    stage.addEventListener('pointerdown',onDown);
    stage.addEventListener('pointermove',onMove);
    stage.addEventListener('pointerup',onUp);
    stage.addEventListener('pointercancel',onUp);
    renderConstellation();

    ctx.gameCleanup.push(()=>{
      disposed=true;
      clearTimeout(nextTimer);
      clearTimeout(pulseTimer);
      stopSpaceGameSpeech();
      stage.removeEventListener('pointerdown',onDown);
      stage.removeEventListener('pointermove',onMove);
      stage.removeEventListener('pointerup',onUp);
      stage.removeEventListener('pointercancel',onUp);
      if(ctx.settings.master&&ctx.settings.music)ctx.applyAudio();
    });
  }


  window.AregSpaceGames={spaceSearch:gameSpaceSearch,constellationQuest:gameConstellationQuest};
})();
