/* Trial-only: interactive road safety learning. No external images. */
(function(){
  'use strict';
  window.AregTrafficLight=function(surface,cleanup,reward){
    const host=surface(null);
    const css=document.createElement('style');
    css.textContent='.tl{height:100%;overflow:auto;display:flex;flex-direction:column;gap:10px;padding:12px;background:linear-gradient(#b4e5ff,#f5eac4);color:#29313b;font-family:system-ui}.tl h2{text-align:center;margin:0;font-size:23px}.tl small{text-align:center;font-size:13px;font-weight:700}.tl-scene{position:relative;min-height:180px;flex:1;max-height:300px;border-radius:22px;overflow:hidden;border:3px solid #fff3c2;background:linear-gradient(#89d2f5 0 42%,#76b972 42% 55%,#565c64 55%)}.tl-scene:after{content:"";position:absolute;left:0;right:0;top:72%;border-top:3px dashed #fceca2}.tl-cross{position:absolute;left:40%;bottom:0;width:27%;height:44%;background:repeating-linear-gradient(0deg,#fff 0 12px,transparent 12px 24px)}.tl-car{position:absolute;left:5%;bottom:10%;font-size:65px;will-change:transform;z-index:2}.tl-walker{position:absolute;left:39%;bottom:3%;font-size:51px;z-index:3;will-change:transform}.tl-panels{display:grid;grid-template-columns:1fr 1fr;gap:9px}.tl-panel{border-radius:20px;background:#fff9e9;border:2px solid #e8c690;padding:8px;display:flex;flex-direction:column;align-items:center;gap:7px}.tl-panel b{text-align:center;font-size:14px}.tl-housing{background:#26303d;border:4px solid #141a23;border-radius:20px;padding:8px;display:flex;flex-direction:column;gap:7px}.tl-light{width:clamp(48px,13vw,64px);height:clamp(48px,13vw,64px);border-radius:50%;border:3px solid #141820;opacity:.32;box-shadow:inset 0 4px 8px #0008;touch-action:manipulation}.tl-light[aria-pressed=true]{opacity:1;box-shadow:0 0 17px 5px var(--glow),inset 0 2px 6px #fff8;transform:scale(1.04)}.tl-red{background:#f34545;--glow:#f44}.tl-yellow{background:#ffd239;--glow:#fc2}.tl-green{background:#3cd86c;--glow:#3d7}.tl-ped{width:78px;height:62px;border:3px solid #151b22;border-radius:13px;opacity:.32;font-size:27px;font-weight:900;touch-action:manipulation}.tl-ped[aria-pressed=true]{opacity:1;box-shadow:0 0 14px var(--glow)}.tl-message{min-height:68px;border-radius:16px;background:#fff9e9;display:grid;place-items:center;text-align:center;padding:10px;font-size:15px;font-weight:800;line-height:1.4}.tl-go{min-height:53px;border:0;border-radius:16px;background:linear-gradient(#ffe69b,#eeb957);font-size:17px;font-weight:900;color:#49351a;touch-action:manipulation}@media(max-height:700px){.tl{gap:6px;padding:6px}.tl-scene{min-height:145px}.tl-light{width:43px;height:43px}.tl-ped{height:46px}}';
    host.appendChild(css);
    const box=document.createElement('div');box.className='tl';
    box.innerHTML='<h2>🚦 Արեգի լուսացույցը</h2><small>Սեղմիր լույսերին՝ մեքենաներն ու հետիոտներին կառավարելու համար</small><div class="tl-scene"><div class="tl-cross"></div><span class="tl-car">🚙</span><span class="tl-walker">🚶</span></div><div class="tl-panels"><div class="tl-panel"><b>🚗 Մեքենաների լուսացույց</b><div class="tl-housing"><button class="tl-light tl-red" data-car="red" aria-label="Կարմիր՝ կանգ"></button><button class="tl-light tl-yellow" data-car="yellow" aria-label="Դեղին՝ պատրաստվիր կանգնելու"></button><button class="tl-light tl-green" data-car="green" aria-label="Կանաչ՝ շարժվիր"></button></div></div><div class="tl-panel"><b>🚶 Հետիոտնի լուսացույց</b><div class="tl-housing"><button class="tl-ped tl-red" data-ped="red" aria-label="Կարմիր՝ սպասիր">✋</button><button class="tl-ped tl-green" data-ped="green" aria-label="Կանաչ՝ անցիր">🚶</button></div></div></div><div class="tl-message" role="status" aria-live="polite"></div><button class="tl-go">🚶 Փորձենք անցնել զեբրայով</button>';
    host.appendChild(box);
    let car='red',ped='red',crossing=false,active=true,completed=0;
    // Fixed-distance simulation: velocity in scene-widths per second; gentle acceleration and braking.
    let x=.05,velocity=0,last=0,frame=0,walkProgress=0,walkDirection=0,walkDelay=0;
    const acceleration=.30,braking=.65,maxSpeed=.28,stopLine=.30;
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    const smooth=t=>t*t*(3-2*t);
    function tick(now){
      if(!active)return;
      const dt=last?Math.min(.05,(now-last)/1000):0;last=now;
      const width=Math.max(1,box.querySelector('.tl-scene').clientWidth);
      // A green car may accelerate only when no pedestrian is entering the road.
      const allowDrive=car==='green'&&ped==='red'&&!crossing;
      const distanceToStop=Math.max(0,stopLine-x);
      const safeSpeed=allowDrive?maxSpeed:Math.sqrt(2*braking*distanceToStop);
      const desired=allowDrive?maxSpeed:Math.min(velocity,safeSpeed);
      velocity=clamp(velocity+(desired>velocity?acceleration:-braking)*dt,0,maxSpeed);
      if(!allowDrive)velocity=Math.min(velocity,safeSpeed);
      x+=velocity*dt;
      if(x>1.10){x=-.23;velocity=0}
      // When red is requested while approaching, stop before the zebra crossing.
      if(!allowDrive&&x>=stopLine){x=stopLine;velocity=0}
      carSprite.style.transform='translate3d('+((x-.05)*width)+'px,'+(velocity>.01?Math.sin(now*.016)*1.4:0)+'px,0)';
      if(crossing){
        walkDelay+=dt;
        if(walkDelay>.55)walkProgress=clamp(walkProgress+dt/2.2,0,1);
        walker.style.transform='translate3d(0,'+(-smooth(walkProgress)*box.querySelector('.tl-scene').clientHeight*.58)+'px,0)';
        if(walkProgress>=1){
          crossing=false;ped='red';car='red';completed++;sync();
          message.textContent='⭐ Ապրե՛ս, անվտանգ անցանք։';if(completed%3===0)reward(1);
          walkDirection=1;
        }
      }else if(walkDirection){
        walkProgress=clamp(walkProgress-dt*1.8,0,1);
        walker.style.transform='translate3d(0,'+(-smooth(walkProgress)*box.querySelector('.tl-scene').clientHeight*.58)+'px,0)';
        if(walkProgress===0)walkDirection=0;
      }
      frame=requestAnimationFrame(tick);
    }
    const message=box.querySelector('.tl-message'),carSprite=box.querySelector('.tl-car'),walker=box.querySelector('.tl-walker');
    function sync(){
      box.querySelectorAll('[data-car]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.car===car)));
      box.querySelectorAll('[data-ped]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ped===ped)));
      // Motion is owned by the requestAnimationFrame simulation, not CSS transitions.
      message.textContent=car==='green'?'🟢 Մեքենաները շարժվում են։ Հետիոտնը սպասում է։':car==='yellow'?'🟡 Դեղին՝ վարորդը պատրաստվում է կանգնելու, եթե անվտանգ է։':ped==='green'?'🚶 Հետիոտնին կանաչ է։ Նախ նայիր երկու կողմ և համոզվիր, որ մեքենաները կանգնել են։':'🔴 Կարմիր՝ մեքենաները կանգնած են։ Հետիոտնը սպասում է իր կանաչին։';
    }
    box.querySelectorAll('[data-car]').forEach(b=>b.addEventListener('click',()=>{if(crossing)return;car=b.dataset.car;if(car!=='red')ped='red';sync()}));
    box.querySelectorAll('[data-ped]').forEach(b=>b.addEventListener('click',()=>{if(crossing)return;ped=b.dataset.ped;if(ped==='green')car='red';sync()}));
    box.querySelector('.tl-go').addEventListener('click',()=>{
      if(crossing)return;
      if(car!=='red'||ped!=='green'){message.textContent='✋ Սպասիր․ հետիոտնի կանաչը պետք է վառվի, իսկ մեքենաները՝ կանգնեն։';return}
      if(velocity>.012||x>stopLine+.02){message.textContent='✋ Սպասիր, մինչև մեքենան ամբողջությամբ կանգնի։';return}
      crossing=true;walkProgress=0;walkDelay=0;walkDirection=0;message.textContent='👀 Նայիր երկու կողմ, համոզվիր, որ մեքենաները կանգնած են, և անցիր։';
    });
    sync();frame=requestAnimationFrame(tick);
    cleanup.push(()=>{active=false;cancelAnimationFrame(frame);css.remove()});
  };
})();