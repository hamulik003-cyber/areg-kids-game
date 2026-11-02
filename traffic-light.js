/* Trial-only: interactive road safety learning. No external images. */
(function(){
  'use strict';
  window.AregTrafficLight=function(surface,cleanup,reward){
    const host=surface(null);
    const css=document.createElement('style');
    css.textContent='.tl{height:100%;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:12px;background:linear-gradient(#b4e5ff,#f5eac4);color:#29313b;font-family:system-ui}.tl h2{text-align:center;margin:0;font-size:23px}.tl small{text-align:center;font-size:13px;font-weight:700}.tl-scene{position:relative;min-height:180px;flex:1;max-height:300px;border-radius:22px;overflow:hidden;border:3px solid #fff3c2;background:linear-gradient(#89d2f5 0 42%,#76b972 42% 55%,#565c64 55%)}.tl-scene:after{content:"";position:absolute;left:0;right:0;top:72%;border-top:3px dashed #fceca2}.tl-cross{position:absolute;left:40%;bottom:0;width:27%;height:44%;background:repeating-linear-gradient(0deg,#fff 0 12px,transparent 12px 24px)}.tl-car{position:absolute;left:5%;bottom:10%;font-size:65px;will-change:transform;z-index:2}.tl-walker{position:absolute;left:39%;bottom:3%;font-size:51px;z-index:3;will-change:transform}.tl-panels{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tl-panel{border-radius:20px;background:#fff9e9;border:2px solid #e8c690;padding:8px;display:flex;flex-direction:column;align-items:center;gap:7px}.tl-panel b{text-align:center;font-size:14px}.tl-housing{background:#26303d;border:4px solid #141a23;border-radius:20px;padding:8px;display:flex;flex-direction:column;gap:7px}.tl-light{width:clamp(48px,13vw,64px);height:clamp(48px,13vw,64px);border-radius:50%;border:3px solid #141820;opacity:.32;box-shadow:inset 0 4px 8px #0008;touch-action:manipulation}.tl-light[aria-pressed=true]{opacity:1;box-shadow:0 0 17px 5px var(--glow),inset 0 2px 6px #fff8;transform:scale(1.04)}.tl-red{background:#f34545;--glow:#f44}.tl-yellow{background:#ffd239;--glow:#fc2}.tl-green{background:#3cd86c;--glow:#3d7}.tl-ped{width:78px;height:62px;border:3px solid #151b22;border-radius:13px;opacity:.32;font-size:27px;font-weight:900;touch-action:manipulation}.tl-ped[aria-pressed=true]{opacity:1;box-shadow:0 0 14px var(--glow)}.tl-message{min-height:68px;border-radius:16px;background:#fff9e9;display:grid;place-items:center;text-align:center;padding:10px;font-size:15px;font-weight:800;line-height:1.4}.tl-go{min-height:53px;border:0;border-radius:16px;background:linear-gradient(#ffe69b,#eeb957);font-size:17px;font-weight:900;color:#49351a;touch-action:manipulation}@media(max-height:700px){.tl{gap:6px;padding:6px}.tl-scene{min-height:145px}.tl-light{width:43px;height:43px}.tl-ped{height:46px}}';
    css.textContent += '.tl-scene{box-shadow:inset 0 8px 30px #ffffff70,0 7px 18px #2a49543a}.tl-scene:before{content:"☁️     ☁️";position:absolute;top:7%;left:8%;font-size:24px;opacity:.8;animation:tl-clouds 16s ease-in-out infinite alternate}.tl-car{filter:drop-shadow(0 5px 2px #18202860)}.tl-walker{filter:drop-shadow(0 4px 2px #18202870)}.tl-light[aria-pressed=true]{transition:box-shadow .18s,opacity .18s;filter:saturate(1.2)}.tl-go:active{transform:scale(.98)}@keyframes tl-clouds{from{transform:translateX(-7px)}to{transform:translateX(25px)}}@media(prefers-reduced-motion:reduce){.tl-scene:before{animation:none}}';
    css.textContent += '.tl-traffic{position:absolute;inset:0;pointer-events:none}.tl-car{position:absolute;left:0;bottom:auto;font-size:clamp(28px,9vw,43px);line-height:1;z-index:2;filter:drop-shadow(0 3px 2px #2228)}.tl-street-ped{position:absolute;left:66%;top:43%;z-index:5;background:#222;border:2px solid #111;border-radius:7px;padding:3px;display:flex;flex-direction:column;gap:2px;box-shadow:0 3px 3px #0006}.tl-street-ped span{font-size:19px;line-height:23px;opacity:.2}.tl-street-ped .on{opacity:1;filter:drop-shadow(0 0 5px currentColor)}.tl-walker{left:42%;bottom:3%}.tl-cross{left:38%;width:26%}.tl-scene:after{top:77%}';
    css.textContent += '.tl-street-ped{cursor:pointer;touch-action:manipulation}.tl{background:linear-gradient(#c9ecff,#e9f4d6);gap:7px;padding:8px}.tl h2{color:#fff;text-shadow:0 2px 4px #133d83;background:linear-gradient(#428de9,#1554b7);border:3px solid #e8f7ff;border-radius:24px;padding:7px;font-size:22px}.tl small{font-size:12px}.tl-scene{max-height:none;min-height:270px;flex:1;border:3px solid #e6f7ff;background:linear-gradient(to bottom,#a7dfff 0 18%,#71ad62 18% 35%,#d5c5aa 35% 45%,#565e68 45% 86%,#d6c6ad 86% 100%)}.tl-scene:after{top:66%;border-top:3px dashed #f7f4e7}.tl-cross{left:41%;width:19%;top:45%;bottom:14%;height:auto;background:repeating-linear-gradient(to bottom,#fff 0 9px,transparent 9px 18px);box-shadow:0 0 0 2px #fff3}.tl-traffic{z-index:3}.tl-car{font-size:clamp(29px,8vw,43px);transform-origin:center center}.tl-walker{left:44%;bottom:6%;font-size:39px;z-index:7}.tl-street-ped{left:62%;top:25%;border-radius:5px;padding:2px}.tl-street-ped span{font-size:17px;line-height:20px}.tl-panels{display:block}.tl-panel{display:none}.tl-panel:first-child{display:flex;flex-direction:row;justify-content:center;gap:8px;background:transparent;border:0;padding:0}.tl-panel:first-child b{display:none}.tl-panel:first-child .tl-housing{flex-direction:row;background:linear-gradient(#5689c5,#255a9a);padding:7px;border:3px solid #d5eaff;border-radius:24px;gap:9px}.tl-light{width:clamp(44px,12vw,58px);height:clamp(44px,12vw,58px)}.tl-go{background:linear-gradient(#64e955,#18a72a);color:white;text-shadow:0 1px 2px #145a1c;border:3px solid #e2ffe3;min-height:51px}.tl-message{min-height:47px;font-size:13px;padding:6px}.tl-scene:before{content:"🌳     🏡      🌳";top:10%;left:2%;font-size:28px}.tl-scene{isolation:isolate}@media(max-height:700px){.tl-scene{min-height:210px}.tl{gap:4px}.tl-message{min-height:37px}}';
    css.textContent += '.tl-street-ped{background:#343a40;border:3px solid #747b82;border-radius:5px;gap:5px;padding:5px;box-shadow:inset 0 0 3px #fff6,0 3px 4px #0005}.tl-street-ped span{display:grid;place-items:center;position:relative;width:36px;height:36px;background:#080a0c;border:2px solid #111;border-radius:50%;opacity:1;color:#333}.tl-street-ped .tl-street-red.on{color:#ff3029;box-shadow:0 0 10px #f32627aa}.tl-street-ped .tl-street-green.on{color:#1df77e;box-shadow:0 0 10px #00e874aa}.tl-street-ped .tl-person{display:block;position:relative;width:24px;height:30px;background:currentColor;clip-path:polygon(39% 0,61% 0,72% 10%,72% 20%,64% 26%,74% 30%,90% 55%,78% 61%,64% 43%,62% 65%,77% 93%,65% 100%,49% 72%,34% 100%,21% 93%,37% 61%,34% 42%,21% 61%,9% 55%,24% 29%,36% 24%,28% 16%)}.tl-street-ped .tl-walking{clip-path:polygon(42% 0,62% 0,73% 10%,68% 21%,56% 25%,72% 36%,88% 40%,85% 50%,64% 46%,55% 39%,50% 59%,76% 79%,94% 86%,89% 97%,66% 92%,40% 70%,24% 95%,10% 92%,27% 60%,37% 42%,22% 52%,8% 46%,26% 29%,41% 24%,31% 14%)}';
    css.textContent += '.tl-street-ped{z-index:9;top:25%;left:65%;overflow:visible}.tl-street-ped:after{content:"";position:absolute;top:100%;left:50%;width:8px;height:clamp(42px,12vh,105px);transform:translateX(-50%);background:linear-gradient(90deg,#555c64,#b6bdc5 48%,#565e68);border:1px solid #414950;border-radius:0 0 4px 4px;z-index:-1;pointer-events:none}.tl-street-ped:before{content:"";position:absolute;top:calc(100% + clamp(42px,12vh,105px));left:50%;width:28px;height:7px;transform:translateX(-50%);background:#555e66;border-radius:6px;pointer-events:none}.tl-car{font-size:clamp(25px,7vw,36px)}';
    css.textContent += '.tl-street-ped{left:66%;top:11%;z-index:9}.tl-street-ped:after{height:calc(var(--tl-pole-height, 120px));top:100%;z-index:-1}.tl-street-ped:before{top:calc(100% + var(--tl-pole-height, 120px))}.tl-scene{--tl-pole-height:clamp(125px,29%,220px)}';
    host.appendChild(css);
    const box=document.createElement('div');box.className='tl';
    box.innerHTML='<h2>🚦 Արեգի լուսացույցը</h2><small>Սեղմիր լույսերին՝ մեքենաներն ու հետիոտներին կառավարելու համար</small><div class="tl-scene"><div class="tl-cross"></div><div class="tl-traffic"></div><div class="tl-street-ped" role="button" tabindex="0" aria-label="Փոխել հետիոտնի լուսացույցը"><span class="tl-street-red"><i class="tl-person"></i></span><span class="tl-street-green"><i class="tl-person tl-walking"></i></span></div><span class="tl-walker">🚶</span></div><div class="tl-panels"><div class="tl-panel"><b>🚗 Մեքենաների լուսացույց</b><div class="tl-housing"><button class="tl-light tl-red" data-car="red" aria-label="Կարմիր՝ կանգ"></button><button class="tl-light tl-yellow" data-car="yellow" aria-label="Դեղին՝ պատրաստվիր կանգնելու"></button><button class="tl-light tl-green" data-car="green" aria-label="Կանաչ՝ շարժվիր"></button></div></div><div class="tl-panel"><b>🚶 Հետիոտնի լուսացույց</b><div class="tl-housing"><button class="tl-ped tl-red" data-ped="red" aria-label="Կարմիր՝ սպասիր">✋</button><button class="tl-ped tl-green" data-ped="green" aria-label="Կանաչ՝ անցիր">🚶</button></div></div></div><div class="tl-message" role="status" aria-live="polite"></div><button class="tl-go">🚶 Փորձենք անցնել զեբրայով</button>';
    host.appendChild(box);
    let car='green',ped='red',crossing=false,active=true,completed=0;
    let last=0,frame=0,walkProgress=0,walkDelay=0,walkAtFarSide=false,sequence=0,queueMode=false;
    const timers=new Set();
    function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);if(active)fn()},ms);timers.add(id)}
    function cancelSequence(){sequence++;for(const id of timers)clearTimeout(id);timers.clear()}
    // Layered environmental audio: filtered tyre noise, motor harmonics and soft footsteps.
    // No square-wave / arcade notes. Unlocked by first iOS touch.
    let audioCtx=null,master=null,noiseBuffer=null,engineNodes=null,lastStepAt=0;
    function unlockAudio(){
      if(!active)return;
      try{
        const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
        if(!audioCtx){
          audioCtx=new C();master=audioCtx.createGain();master.gain.value=.34;master.connect(audioCtx.destination);
          noiseBuffer=audioCtx.createBuffer(1,audioCtx.sampleRate*2,audioCtx.sampleRate);
          const data=noiseBuffer.getChannelData(0);
          for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
        }
        if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
      }catch(e){audioCtx=null;master=null}
    }
    function noise(duration,volume,frequency=550,delay=0){
      if(!audioCtx||audioCtx.state!=='running'||!master)return;
      const t=audioCtx.currentTime+delay,src=audioCtx.createBufferSource(),filter=audioCtx.createBiquadFilter(),g=audioCtx.createGain();
      src.buffer=noiseBuffer;src.loop=true;filter.type='lowpass';filter.frequency.value=frequency;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,volume),t+.035);
      g.gain.exponentialRampToValueAtTime(.0001,t+duration);
      src.connect(filter);filter.connect(g);g.connect(master);src.start(t);src.stop(t+duration+.03);
    }
    function note(freq,duration,volume=.10,delay=0,ending){
      if(!audioCtx||audioCtx.state!=='running'||!master)return;
      const t=audioCtx.currentTime+delay,o=audioCtx.createOscillator(),g=audioCtx.createGain();
      o.type='sine';o.frequency.setValueAtTime(freq,t);
      if(ending)o.frequency.exponentialRampToValueAtTime(ending,t+duration);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.025);
      g.gain.exponentialRampToValueAtTime(.0001,t+duration);
      o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.02);
    }
    function startEngine(){
      if(!audioCtx||audioCtx.state!=='running'||engineNodes)return;
      const osc=audioCtx.createOscillator(),harm=audioCtx.createOscillator(),filter=audioCtx.createBiquadFilter(),gain=audioCtx.createGain();
      osc.type='sawtooth';harm.type='triangle';osc.frequency.value=54;harm.frequency.value=108;
      filter.type='lowpass';filter.frequency.value=200;gain.gain.value=0;
      osc.connect(filter);harm.connect(filter);filter.connect(gain);gain.connect(master);
      osc.start();harm.start();engineNodes={osc,harm,filter,gain};
    }
    function updateEngine(speed){
      if(!audioCtx||audioCtx.state!=='running')return;
      if(!engineNodes&&speed>.012)startEngine();
      if(!engineNodes)return;
      const t=audioCtx.currentTime,m=Math.min(1,speed/.19);
      engineNodes.osc.frequency.setTargetAtTime(46+m*39,t,.12);
      engineNodes.harm.frequency.setTargetAtTime(92+m*78,t,.12);
      engineNodes.filter.frequency.setTargetAtTime(150+m*210,t,.12);
      engineNodes.gain.gain.setTargetAtTime(m*.055,t,.15);
    }
    function sound(kind){
      if(kind==='red'){noise(.16,.065,220);note(185,.23,.10,0,135)}
      else if(kind==='yellow'){noise(.12,.045,750);note(360,.18,.045)}
      else if(kind==='green'){note(480,.22,.09);note(650,.27,.075,.12)}
      else if(kind==='pedgreen'){note(570,.13,.065);note(790,.22,.07,.14)}
      else if(kind==='pedred'){note(215,.19,.065,0,165)}
      else if(kind==='brake'){noise(.34,.10,1000);note(120,.23,.035,0,75)}
      else if(kind==='step'){noise(.075,.065,300);note(105,.075,.035)}
      else if(kind==='button'){noise(.045,.038,700)}
      else if(kind==='wait'){note(190,.18,.07,0,145)}
      else if(kind==='success'){note(460,.22,.10);note(590,.23,.10,.16);note(740,.34,.11,.34)}
    }
    function onUserSound(){unlockAudio()}
    box.addEventListener('pointerdown',onUserSound,{passive:true});
    box.addEventListener('touchstart',onUserSound,{passive:true});
    box.addEventListener('keydown',onUserSound);
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const smooth=t=>t*t*(3-2*t);
    // Two lanes: opposing traffic. Positions are scene-width fractions.
    // Four lanes: two side-by-side for each direction. Two cars per lane.
    const vehicles=[
      {icon:'🚙',dir:1,lane:0,x:.16,v:0,max:.23},
      {icon:'🚕',dir:1,lane:1,x:.16,v:0,max:.19},
      {icon:'🚓',dir:1,lane:0,x:-.07,v:0,max:.21},
      {icon:'🚚',dir:1,lane:1,x:-.07,v:0,max:.16},
      {icon:'🚗',dir:-1,lane:2,x:.82,v:0,max:.21},
      {icon:'🚐',dir:-1,lane:3,x:.82,v:0,max:.17},
      {icon:'🚑',dir:-1,lane:2,x:1.05,v:0,max:.20},
      {icon:'🚌',dir:-1,lane:3,x:1.05,v:0,max:.15}
    ];
    vehicles.forEach(v=>{v.length=(v.icon==='🚌'||v.icon==='🚚')?.15:.12;v.v=0;v.queueX=null;v.phase='driving'});
    // Stop before the zebra: both cars in every lane remain fully visible.
    // Coordinates describe the car's leading/anchor edge, not its centre.
    const stopTargets={0:[.235,.035],1:[.235,.035],2:[.665,.865],3:[.665,.865]};
    function prepareQueue(){
      queueMode=true;
      for(const lane of [0,1,2,3]){
        const group=vehicles.filter(v=>v.lane===lane);
        const dir=group[0].dir;
        // A vehicle already beyond its stop line must finish crossing.
        group.forEach(v=>{
          v.phase=(v.x-stopTargets[lane][0])*dir>0?'clearing':'approach';
        });
        // Approaching vehicles take the front slot; those that already
        // passed the zebra return behind them after leaving the scene.
        group.sort((a,b)=>{
          if(a.phase!==b.phase)return a.phase==='approach'?-1:1;
          return (b.x-a.x)*dir;
        });
        group.forEach((v,i)=>{v.queueX=stopTargets[lane][i]});
      }
    }
    const traffic=box.querySelector('.tl-traffic');
    vehicles.forEach(v=>{const el=document.createElement('span');el.className='tl-car';el.textContent=v.icon;traffic.appendChild(el);v.el=el});
    const scene=box.querySelector('.tl-scene');
    // Pole base ends on the far sidewalk, not on the roadway.
    function sizePole(){const signal=box.querySelector('.tl-street-ped');const base=scene.clientHeight*.445;const top=signal.offsetTop+signal.offsetHeight;scene.style.setProperty('--tl-pole-height',Math.max(8,base-top)+'px')}
    sizePole();
    function tick(now){
      if(!active)return;
      const dt=last?Math.min(.045,(now-last)/1000):0;last=now;
      const width=Math.max(1,scene.clientWidth),height=scene.clientHeight;
      if(!frame||Math.round(now)%45===0)sizePole();
      const green=car==='green'&&ped==='red'&&!crossing;
      const meanSpeed=vehicles.reduce((sum,v)=>sum+v.v,0)/vehicles.length;
      updateEngine(meanSpeed);
      if(!green&&meanSpeed>.025&&vehicles.some(v=>v.phase==='approach')&&Math.floor(now/1300)!==Math.floor((now-dt*1000)/1300))sound('brake');
      for(const v of vehicles){
        const dir=v.dir;
        const exiting=dir===1?v.x>1.20:v.x<-.22;
        if(exiting){
          // Wrap only while completely off-screen; never teleport across zebra.
          v.x=dir===1?-.25:1.24;
          v.v=0;
          if(queueMode)v.phase='approach';
        }
        const mustQueue=queueMode&&v.phase!=='clearing';
        const freeToDrive=green||!queueMode||v.phase==='clearing';
        const remaining=mustQueue?(v.queueX-v.x)*dir:Infinity;
        // Use stopping-distance physics, with a small buffer for emoji width.
        const speedLimit=mustQueue?Math.min(v.max,Math.sqrt(2*.56*Math.max(0,remaining))):v.max;
        const ahead=vehicles.filter(other=>other!==v&&other.lane===v.lane
          &&(other.x-v.x)*dir>0&&other.phase!=='clearing')
          .sort((a,b)=>(a.x-b.x)*dir)[0];
        const gap=ahead?(ahead.x-v.x)*dir-ahead.length-.025:Infinity;
        const followingLimit=ahead?Math.sqrt(2*.75*Math.max(0,gap)):v.max;
        const target=Math.min(speedLimit,followingLimit);
        v.v=clamp(v.v+(target>v.v?.32:-.60)*dt,0,v.max);
        v.v=Math.min(v.v,target);
        if(mustQueue&&remaining<=.002){v.x=v.queueX;v.v=0;v.phase='parked'}
        else{
          v.x+=dir*v.v*dt;
          if(mustQueue&&(v.x-v.queueX)*dir>=0){v.x=v.queueX;v.v=0;v.phase='parked'}
        }
        if(ahead&&(ahead.x-v.x)*dir<ahead.length+.025){
          v.x=ahead.x-dir*(ahead.length+.025);v.v=0;
        }
        const laneY=[.485,.575,.675,.765];
        const y=height*laneY[v.lane];
        v.el.style.transform='translate3d('+(v.x*width)+'px,'+y+'px,0) scaleX('+(dir===1?-1:1)+')';
      }
      if(crossing){
        walkDelay+=dt;
        if(walkDelay>.45&&now-lastStepAt>430){sound('step');lastStepAt=now}
        if(walkDelay>.45)walkProgress=clamp(walkProgress+(completed%2===0?1:-1)*dt/2.4,0,1);
        if((completed%2===0&&walkProgress>=1)||(completed%2===1&&walkProgress<=0)){
          crossing=false;walkAtFarSide=walkProgress>=1;completed++;sync();sound('success');
          message.textContent='⭐ Ապրե՛ս։ Հասանք դիմացի մայթ։ Սեղմիր նորից՝ հաջորդ անցման համար։';
          if(completed%3===0)reward(1);
        }
      }
      walker.style.transform='translate3d(0,'+(-smooth(walkProgress)*height*.55)+'px,0)';
      frame=requestAnimationFrame(tick);
    }
    const message=box.querySelector('.tl-message'),walker=box.querySelector('.tl-walker');
    let lastSignal='green/red';
    function sync(){
      const signal=car+'/'+ped;
      if(signal!==lastSignal){
        if(car==='yellow')sound('yellow');else if(car==='red')sound('red');else sound('green');
        if(ped==='green')sound('pedgreen');else if(lastSignal.endsWith('/green'))sound('pedred');
        lastSignal=signal;
      }
      box.querySelectorAll('[data-car]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.car===car)));
      box.querySelectorAll('[data-ped]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ped===ped)));
      box.querySelector('.tl-street-red').classList.toggle('on',ped==='red');
      box.querySelector('.tl-street-green').classList.toggle('on',ped==='green');
      message.textContent=car==='green'?'🟢 Մեքենաները շարժվում են։ Հետիոտնը սպասում է։':car==='yellow'?'🟡 Դեղին՝ վարորդը պատրաստվում է կանգնելու, եթե անվտանգ է։':ped==='green'?'🚶 Հետիոտնին կանաչ է։ Նախ նայիր երկու կողմ և համոզվիր, որ մեքենաները կանգնել են։':'🔴 Կարմիր՝ մեքենաները կանգնած են։ Հետիոտնը սպասում է իր կանաչին։';
    }
    function requestPed(next){
      unlockAudio();
      if(crossing){sound('wait');return}
      sound('button');
      cancelSequence();
      const token=sequence;
      if(next==='green'){
        prepareQueue();
        // Drivers see amber before red; pedestrians get green only once traffic stops.
        ped='red';
        if(car==='green'){car='yellow';sync();later(()=>{if(token!==sequence)return;car='red';sync();waitForClear(token)},1100)}
        else{car='red';sync();waitForClear(token)}
      }else{
        queueMode=false;vehicles.forEach(v=>{v.queueX=null;v.phase='driving'});
        // Pedestrians stop first; cars get amber, then green automatically.
        ped='red';car='red';sync();
        later(()=>{if(token!==sequence||crossing)return;car='yellow';sync();
          later(()=>{if(token!==sequence||crossing)return;car='green';sync()},1100)
        },450);
      }
    }
    function waitForClear(token){
      if(token!==sequence||crossing)return;
      const moving=vehicles.some(v=>v.phase!=='parked'||v.v>.008);
      if(moving){later(()=>waitForClear(token),220);return}
      car='red';ped='green';sync();
    }
    box.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{
      if(crossing)return;
      if(b.dataset.car==='green')requestPed('red');
      else if(b.dataset.car==='red')requestPed('green');
      else{unlockAudio();sound('button');cancelSequence();ped='red';car='yellow';sync()}
    }));
    box.querySelectorAll('[data-ped]').forEach(b=>b.addEventListener('click',()=>requestPed(b.dataset.ped)));
    const streetPed=box.querySelector('.tl-street-ped');
    streetPed.setAttribute('aria-label','Կարմիր մարդուկ՝ մեքենաներին կանաչ, կանաչ մարդուկ՝ մեքենաներին կարմիր');
    function chooseStreetPed(event){
      const greenTarget=event.target.closest('.tl-street-green');
      const redTarget=event.target.closest('.tl-street-red');
      if(greenTarget)requestPed('green');
      else if(redTarget)requestPed('red');
    }
    streetPed.addEventListener('click',chooseStreetPed);
    streetPed.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){
      e.preventDefault();requestPed(ped==='green'?'red':'green');
    }});
    box.querySelector('.tl-go').addEventListener('click',()=>{
      unlockAudio();
      if(crossing){sound('wait');return}
      if(car!=='red'||ped!=='green'){sound('wait');message.textContent='✋ Սպասիր․ հետիոտնի կանաչը պետք է վառվի, իսկ մեքենաները՝ կանգնեն։';return}
      if(vehicles.some(v=>v.v>.015||(v.x>.35&&v.x<.65))){sound('wait');message.textContent='✋ Սպասիր, մինչև մեքենան ամբողջությամբ կանգնի։';return}
      sound('button');crossing=true;walkProgress=walkAtFarSide?1:0;walkAtFarSide=false;walkDelay=0;message.textContent='👀 Նայիր երկու կողմ, համոզվիր, որ մեքենաները կանգնած են, և անցիր։';
    });
    sync();frame=requestAnimationFrame(tick);
    cleanup.push(()=>{active=false;cancelSequence();cancelAnimationFrame(frame);box.removeEventListener('pointerdown',onUserSound);box.removeEventListener('touchstart',onUserSound);box.removeEventListener('keydown',onUserSound);if(engineNodes){engineNodes.osc.stop();engineNodes.harm.stop();engineNodes=null}if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null}css.remove()});
  };
})();