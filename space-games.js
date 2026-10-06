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


  function webglHex(h){
    const s=String(h||'#7799cc').replace('#','');
    const n=parseInt(s.length===3?s.split('').map(c=>c+c).join(''):s,16)||0x7799cc;
    return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];
  }
  function webglKind(kind){
    return ({sun:0,rock:1,cloud:2,earth:3,bands:4,saturn:5,ring:6,spots:7,cracks:8,haze:9,ice:10,pluto:11,oval:12,solar:13,galaxy:14,blackhole:15})[kind]??1;
  }
  function sphereData(lat=18,lon=28){
    const p=[],n=[],i=[];
    for(let y=0;y<=lat;y++){
      const v=y/lat,ph=v*Math.PI;
      for(let x=0;x<=lon;x++){
        const u=x/lon,th=u*Math.PI*2;
        const sx=Math.sin(ph)*Math.cos(th),sy=Math.cos(ph),sz=Math.sin(ph)*Math.sin(th);
        p.push(sx,sy,sz);n.push(sx,sy,sz);
      }
    }
    for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
      const a=y*(lon+1)+x,b=a+lon+1;i.push(a,b,a+1,b,b+1,a+1);
    }
    return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
  }
  function ringData(seg=56){
    const p=[],n=[],i=[],inner=.72,outer=1.45;
    for(let k=0;k<=seg;k++){
      const a=k/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
      p.push(c*inner,s*inner,0,c*outer,s*outer,0);n.push(0,0,1,0,0,1);
    }
    for(let k=0;k<seg;k++){const q=k*2;i.push(q,q+1,q+2,q+1,q+3,q+2)}
    return {p:new Float32Array(p),n:new Float32Array(n),i:new Uint16Array(i)};
  }
  function glShader(gl,type,src){
    const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s)||'shader');
    return s;
  }
  function glProgram(gl,vs,fs){
    const p=gl.createProgram();gl.attachShader(p,glShader(gl,gl.VERTEX_SHADER,vs));gl.attachShader(p,glShader(gl,gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p)||'program');
    return p;
  }
  function makePlanetWebGL(canvas,item){
    let gl;
    try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});}catch{}
    if(!gl)return null;
    const vs='attribute vec3 aP;attribute vec3 aN;uniform float uYaw;uniform float uPitch;uniform float uAspect;uniform float uScale;varying vec3 vN;varying vec3 vP;vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,p.y*c-p.z*s,p.y*s+p.z*c);}vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x*c+p.z*s,p.y,-p.x*s+p.z*c);}void main(){vec3 q=ry(rx(aP,uPitch),uYaw);vec3 n=ry(rx(aN,uPitch),uYaw);float z=3.8-q.z;float f=2.2/z;gl_Position=vec4(q.x*f*uScale/uAspect,q.y*f*uScale,q.z*.18,1.0);vN=n;vP=aP;}';
    const fs='precision mediump float;uniform vec3 uC1;uniform vec3 uC2;uniform float uKind;uniform float uRing;varying vec3 vN;varying vec3 vP;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){if(uRing>.5){float r=length(vP.xy);float band=.5+.5*sin(r*58.0);vec3 rc=mix(uC2,uC1,.55+.35*band);gl_FragColor=vec4(rc,.88);return;}vec3 n=normalize(vN);float light=max(.18,dot(n,normalize(vec3(-.45,.62,.74))));vec3 c=mix(uC2,uC1,.18+.82*light);float k=uKind;if(k<.5){c=uC1*(1.08+.18*sin(vP.y*20.0+vP.x*11.0));}else if(abs(k-3.0)<.4){float land=smoothstep(.35,.72,sin(vP.x*7.0)+sin(vP.z*10.0)+sin(vP.y*13.0));c=mix(c,vec3(.12,.62,.28),land*.72);float cloud=smoothstep(.78,.98,sin(vP.x*18.0+vP.z*15.0));c=mix(c,vec3(1.0),cloud*.16);}else if(abs(k-4.0)<.4||abs(k-5.0)<.4){float b=.5+.5*sin(vP.y*31.0+sin(vP.x*5.0));c*=.78+.32*b;}else if(abs(k-6.0)<.4){c=mix(c,uC1,.48);}else if(abs(k-7.0)<.4){c*=.68+.48*h(floor(vP.xy*8.0));}else if(abs(k-8.0)<.4){float q=abs(sin(vP.x*17.0+vP.y*13.0));c=mix(c,vec3(.88,.94,1.0),smoothstep(.93,.995,q)*.42);}else if(abs(k-9.0)<.4){c=mix(c,uC1,.44);c+=vec3(.07,.04,0.0);}else if(abs(k-10.0)<.4){c=mix(c,vec3(.92,.98,1.0),.25);}else if(abs(k-11.0)<.4){float q=smoothstep(.65,.92,sin(vP.x*5.0-vP.y*7.0));c=mix(c,vec3(.94,.78,.63),q*.42);}else if(abs(k-12.0)<.4){c=mix(c,uC1,.35);}float rim=pow(1.0-max(0.0,n.z),2.1);c+=rim*.15;gl_FragColor=vec4(c,1.0);}';
    let pr;
    try{pr=glProgram(gl,vs,fs);}catch{return null}
    const sphere=sphereData(),ring=ringData();
    const mesh=m=>{
      const pb=gl.createBuffer(),nb=gl.createBuffer(),ib=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,m.p,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,m.n,gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.i,gl.STATIC_DRAW);
      return {pb,nb,ib,count:m.i.length};
    };
    const sm=mesh(sphere),rm=mesh(ring);
    const loc={p:gl.getAttribLocation(pr,'aP'),n:gl.getAttribLocation(pr,'aN'),yaw:gl.getUniformLocation(pr,'uYaw'),pitch:gl.getUniformLocation(pr,'uPitch'),aspect:gl.getUniformLocation(pr,'uAspect'),scale:gl.getUniformLocation(pr,'uScale'),c1:gl.getUniformLocation(pr,'uC1'),c2:gl.getUniformLocation(pr,'uC2'),kind:gl.getUniformLocation(pr,'uKind'),ring:gl.getUniformLocation(pr,'uRing')};
    const c1=webglHex(item.c1),c2=webglHex(item.c2),kind=webglKind(item.kind),hasRing=item.kind==='saturn'||item.kind==='ring';
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    const bind=m=>{gl.bindBuffer(gl.ARRAY_BUFFER,m.pb);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.nb);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib)};
    function resize(){
      const d=Math.min(devicePixelRatio||1,2),w=Math.max(2,Math.floor(canvas.clientWidth*d)),h=Math.max(2,Math.floor(canvas.clientHeight*d));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h);
    }
    function draw(t,boost=0){
      resize();gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(pr);
      gl.uniform1f(loc.aspect,Math.max(.72,canvas.width/canvas.height));gl.uniform3fv(loc.c1,c1);gl.uniform3fv(loc.c2,c2);gl.uniform1f(loc.kind,kind);
      gl.uniform1f(loc.yaw,t*.00035);gl.uniform1f(loc.pitch,.14+Math.sin(t*.00043)*.08);gl.uniform1f(loc.scale,1.0+boost*.16);gl.uniform1f(loc.ring,0);bind(sm);gl.drawElements(gl.TRIANGLES,sm.count,gl.UNSIGNED_SHORT,0);
      if(hasRing){gl.uniform1f(loc.pitch,1.13);gl.uniform1f(loc.yaw,t*.00008);gl.uniform1f(loc.scale,1.48+boost*.1);gl.uniform1f(loc.ring,1);bind(rm);gl.drawElements(gl.TRIANGLES,rm.count,gl.UNSIGNED_SHORT,0)}
    }
    return {draw,dispose(){try{gl.getExtension('WEBGL_lose_context')?.loseContext()}catch{}}};
  }
  function makeStarfieldWebGL(canvas){
    let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true});}catch{}
    if(!gl)return null;
    const vs='attribute vec3 aP;uniform float uAspect;varying float vB;void main(){float z=max(.48,aP.z);float f=1.2/z;gl_Position=vec4(aP.x*f/uAspect,aP.y*f,0.0,1.0);gl_PointSize=clamp(1.2+7.5/z,1.5,8.5);vB=clamp(1.45/z,.18,1.0);}';
    const fs='precision mediump float;varying float vB;void main(){vec2 q=gl_PointCoord-.5;float d=length(q);float a=smoothstep(.5,.03,d);gl_FragColor=vec4(.72,.88,1.0,a*vB);}';
    let pr;try{pr=glProgram(gl,vs,fs);}catch{return null}
    const p=gl.getAttribLocation(pr,'aP'),aspect=gl.getUniformLocation(pr,'uAspect'),buf=gl.createBuffer(),count=170,data=new Float32Array(count*3);
    for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*12;data[i*3+1]=(Math.random()-.5)*8;data[i*3+2]=.7+Math.random()*8.4}
    let last=performance.now();
    function draw(t){
      const dt=Math.min(40,t-last);last=t;
      const d=Math.min(devicePixelRatio||1,2),w=Math.max(2,Math.floor(canvas.clientWidth*d)),h=Math.max(2,Math.floor(canvas.clientHeight*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h);
      for(let i=0;i<count;i++){const k=i*3;data[k+2]-=dt*.0002;if(data[k+2]<.55){data[k]=(Math.random()-.5)*12;data[k+1]=(Math.random()-.5)*8;data[k+2]=8.4}}
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,3,gl.FLOAT,false,0,0);gl.uniform1f(aspect,Math.max(.7,w/h));gl.drawArrays(gl.POINTS,0,count);
    }
    return {draw,dispose(){try{gl.getExtension('WEBGL_lose_context')?.loseContext()}catch{}}};
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
    let planetRaf=0;
    const planetRenderers=[];
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
      planetRenderers.splice(0).forEach(x=>x.renderer?.dispose?.());
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
            <canvas class="space-object-webgl" aria-hidden="true"></canvas>
            <img class="space-object-art space-object-fallback" src="${item.img}?v=147" alt="" draggable="false">
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
        const canvas=$('.space-object-webgl',btn);
        const renderer=makePlanetWebGL(canvas,item);
        if(renderer){btn.classList.add('has-webgl');planetRenderers.push({renderer,btn,phase:Math.random()*6.28})}
      });
      speakSpaceGame(`Գտի՛ր ${target.name}`,ctx);
    }

    function animatePlanets(t){
      if(disposed)return;
      planetRenderers.forEach(x=>x.renderer.draw(t+Math.sin(t*.0007+x.phase)*170,x.btn.classList.contains('is-correct')?1:0));
      planetRaf=requestAnimationFrame(animatePlanets);
    }
    renderRound();
    planetRaf=requestAnimationFrame(animatePlanets);

    ctx.gameCleanup.push(()=>{
      disposed=true;
      clearTimeout(roundTimer);
      cancelAnimationFrame(planetRaf);
      planetRenderers.splice(0).forEach(x=>x.renderer?.dispose?.());
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
        <canvas class="constellation-depth-canvas" aria-hidden="true"></canvas>
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
    let starRaf=0;
    const depthField=makeStarfieldWebGL($('.constellation-depth-canvas',stage));
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
    function animateDepth(t){if(disposed)return;depthField?.draw(t);starRaf=requestAnimationFrame(animateDepth)}
    renderConstellation();
    starRaf=requestAnimationFrame(animateDepth);

    ctx.gameCleanup.push(()=>{
      disposed=true;
      clearTimeout(nextTimer);
      clearTimeout(pulseTimer);
      cancelAnimationFrame(starRaf);
      depthField?.dispose?.();
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
