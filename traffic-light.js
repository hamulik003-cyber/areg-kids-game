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
    host.appendChild(css);
    const box=document.createElement('div');box.className='tl';
    box.innerHTML='<h2>🚦 Արեգի լուսացույցը</h2><small>Սեղմիր լույսերին՝ մեքենաներն ու հետիոտներին կառավարելու համար</small><div class="tl-scene"><div class="tl-cross"></div><div class="tl-traffic"></div><div class="tl-street-ped" role="button" tabindex="0" aria-label="Փոխել հետիոտնի լուսացույցը"><span class="tl-street-red">✋</span><span class="tl-street-green">🚶</span></div><span class="tl-walker">🚶</span></div><div class="tl-panels"><div class="tl-panel"><b>🚗 Մեքենաների լուսացույց</b><div class="tl-housing"><button class="tl-light tl-red" data-car="red" aria-label="Կարմիր՝ կանգ"></button><button class="tl-light tl-yellow" data-car="yellow" aria-label="Դեղին՝ պատրաստվիր կանգնելու"></button><button class="tl-light tl-green" data-car="green" aria-label="Կանաչ՝ շարժվիր"></button></div></div><div class="tl-panel"><b>🚶 Հետիոտնի լուսացույց</b><div class="tl-housing"><button class="tl-ped tl-red" data-ped="red" aria-label="Կարմիր՝ սպասիր">✋</button><button class="tl-ped tl-green" data-ped="green" aria-label="Կանաչ՝ անցիր">🚶</button></div></div></div><div class="tl-message" role="status" aria-live="polite"></div><button class="tl-go">🚶 Փորձենք անցնել զեբրայով</button>';
    host.appendChild(box);
    let car='red',ped='red',crossing=false,active=true,completed=0;
    let last=0,frame=0,walkProgress=0,walkDelay=0,walkAtFarSide=false;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const smooth=t=>t*t*(3-2*t);
    // Two lanes: opposing traffic. Positions are scene-width fractions.
    const vehicles=[
      {icon:'🚙',dir:1,lane:0,x:-.28,v:0,max:.23},
      {icon:'🚕',dir:1,lane:0,x:-.85,v:0,max:.19},
      {icon:'🚗',dir:-1,lane:1,x:1.25,v:0,max:.21},
      {icon:'🚐',dir:-1,lane:1,x:1.85,v:0,max:.17}
    ];
    const traffic=box.querySelector('.tl-traffic');
    vehicles.forEach(v=>{const el=document.createElement('span');el.className='tl-car';el.textContent=v.icon;traffic.appendChild(el);v.el=el});
    const scene=box.querySelector('.tl-scene');
    function tick(now){
      if(!active)return;
      const dt=last?Math.min(.045,(now-last)/1000):0;last=now;
      const width=Math.max(1,scene.clientWidth),height=scene.clientHeight;
      const green=car==='green'&&ped==='red'&&!crossing;
      for(const v of vehicles){
        const stop=v.dir===1?.29:.71;
        const distance=(stop-v.x)*v.dir;
        // Cars that have passed the crossing must finish clearing it.
        const cleared=distance<-.08;
        const allowed=green||cleared;
        const safe=allowed?v.max:Math.sqrt(2*.65*Math.max(0,distance-.09));
        const target=Math.min(v.max,safe);
        v.v=clamp(v.v+(target>v.v?.30:-.65)*dt,0,v.max);
        v.v=Math.min(v.v,safe);
        v.x+=v.dir*v.v*dt;
        if(!allowed&&distance>=0&&(stop-v.x)*v.dir<.09){v.x=stop-v.dir*.09;v.v=0}
        // Re-enter only after the entire car has left the screen.
        if(v.dir===1&&v.x>1.23){v.x=-.4;v.v=0}
        if(v.dir===-1&&v.x<-.23){v.x=1.4;v.v=0}
        const y=v.lane===0?height*.52:height*.72;
        v.el.style.transform='translate3d('+(v.x*width)+'px,'+y+'px,0) scaleX('+(v.dir===1?-1:1)+')';
      }
      if(crossing){
        walkDelay+=dt;
        if(walkDelay>.45)walkProgress=clamp(walkProgress+(completed%2===0?1:-1)*dt/2.4,0,1);
        if((completed%2===0&&walkProgress>=1)||(completed%2===1&&walkProgress<=0)){
          crossing=false;walkAtFarSide=walkProgress>=1;ped='red';car='red';completed++;sync();
          message.textContent='⭐ Ապրե՛ս։ Հասանք դիմացի մայթ։ Սեղմիր նորից՝ հաջորդ անցման համար։';
          if(completed%3===0)reward(1);
        }
      }
      walker.style.transform='translate3d(0,'+(-smooth(walkProgress)*height*.72)+'px,0)';
      frame=requestAnimationFrame(tick);
    }
    const message=box.querySelector('.tl-message'),walker=box.querySelector('.tl-walker');
    function sync(){
      box.querySelectorAll('[data-car]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.car===car)));
      box.querySelectorAll('[data-ped]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ped===ped)));
      box.querySelector('.tl-street-red').classList.toggle('on',ped==='red');
      box.querySelector('.tl-street-green').classList.toggle('on',ped==='green');
      message.textContent=car==='green'?'🟢 Մեքենաները շարժվում են։ Հետիոտնը սպասում է։':car==='yellow'?'🟡 Դեղին՝ վարորդը պատրաստվում է կանգնելու, եթե անվտանգ է։':ped==='green'?'🚶 Հետիոտնին կանաչ է։ Նախ նայիր երկու կողմ և համոզվիր, որ մեքենաները կանգնել են։':'🔴 Կարմիր՝ մեքենաները կանգնած են։ Հետիոտնը սպասում է իր կանաչին։';
    }
    box.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{if(crossing)return;car=b.dataset.car;if(car!=='red')ped='red';sync()}));
    box.querySelectorAll('[data-ped]').forEach(b=>b.addEventListener('click',()=>{if(crossing)return;ped=b.dataset.ped;if(ped==='green')car='red';sync()}));
    const streetPed=box.querySelector('.tl-street-ped');
    function togglePed(){if(crossing)return;ped=ped==='red'?'green':'red';if(ped==='green')car='red';sync()}
    streetPed.addEventListener('click',togglePed);
    streetPed.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();togglePed()}});
    box.querySelector('.tl-go').addEventListener('click',()=>{
      if(crossing)return;
      if(car!=='red'||ped!=='green'){message.textContent='✋ Սպասիր․ հետիոտնի կանաչը պետք է վառվի, իսկ մեքենաները՝ կանգնեն։';return}
      if(vehicles.some(v=>v.v>.015||(v.x>.35&&v.x<.65))){message.textContent='✋ Սպասիր, մինչև մեքենան ամբողջությամբ կանգնի։';return}
      crossing=true;walkProgress=walkAtFarSide?1:0;walkAtFarSide=false;walkDelay=0;message.textContent='👀 Նայիր երկու կողմ, համոզվիր, որ մեքենաները կանգնած են, և անցիր։';
    });
    sync();frame=requestAnimationFrame(tick);
    cleanup.push(()=>{active=false;cancelAnimationFrame(frame);css.remove()});
  };
})();