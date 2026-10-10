// AREG V267 — ephemeral per-visit score and one-cycle result celebration.
// Shared by 3D Space Search and the 38-image constellation guessing game.
// Never saves these wrong/right display counters to localStorage.
// The separate star milestone counter remains persistently owned by app.js.

export function classifyFindingResult(correct,wrong){
  if(correct>wrong)return 'success';
  if(wrong>correct)return 'encourage';
  return 'tie';
}

// Uses one gesture-unlocked AudioContext for the whole visit, not a new
// context created minutes later (which iPhone WebKit may keep suspended).
function playFindingResultsAudio(kind,ctx,ac){
  if(!ctx?.settings?.master||!ctx?.settings?.effects||!ac||ac.state!=='running')return false;
  try{
    const now=ac.currentTime+.04;
    const audioScale=Math.min(1.55,Math.max(0,Number(ctx.settings?.effectsVolume??75)/75*1.12));
    const note=(frequency,offset,duration,volume,type='sine')=>{
      const oscillator=ac.createOscillator(),gain=ac.createGain();
      oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now+offset);
      gain.gain.setValueAtTime(.0001,now+offset);
      gain.gain.exponentialRampToValueAtTime(volume*audioScale,now+offset+.027);
      gain.gain.exponentialRampToValueAtTime(.0001,now+offset+duration);
      oscillator.connect(gain);gain.connect(ac.destination);
      oscillator.start(now+offset);oscillator.stop(now+offset+duration+.045);
    };
    if(kind==='success'){
      // Distinct HAPPY fanfare plus many soft, recognisable claps.
      [523.25,659.25,783.99,1046.5,783.99,1046.5].forEach((f,i)=>
        note(f,i*.17,.39,.052));
      const sampleCount=Math.ceil(ac.sampleRate*.085);
      const buffer=ac.createBuffer(1,sampleCount,ac.sampleRate),data=buffer.getChannelData(0);
      // Each clap has a sharp onset plus a decaying little group of echoes.
      for(let i=0;i<sampleCount;i++){
        const k=i/sampleCount;
        data[i]=(Math.random()*2-1)*Math.exp(-8*k)*
          (0.75+0.25*Math.cos(35*k));
      }
      for(let i=0;i<22;i++){
        const source=ac.createBufferSource(),high=ac.createBiquadFilter(),gain=ac.createGain();
        source.buffer=buffer;high.type='bandpass';
        high.frequency.value=1250+(i%5)*170;high.Q.value=.85;
        gain.gain.value=(.095+(i%4)*.011)*audioScale;
        source.connect(high);high.connect(gain);gain.connect(ac.destination);
        source.start(now+.22+i*.075+((i%3)-1)*.012);
      }
    }else if(kind==='encourage'){
      // Gentle three-note acknowledgement — no scary buzzer or harsh brass.
      note(392,0,.47,.04);note(349.23,.25,.45,.037);
      note(329.63,.53,.57,.034);
    }else{
      note(440,0,.35,.038);note(523.25,.24,.40,.037);
    }
    return true;
  }catch(err){
    console.warn('AREG result sound schedule:',err);
    return false;
  }
}

export function createFindingSession(root,ctx,existingScore=null){
  let wrong=0,correct=0,disposed=false,overlay=null;
  let ac=null,keepAliveOsc=null,keepAliveGain=null,pendingResolve=null;
  const box=existingScore?.closest('.s3d-score')||
    document.createElement('div');
  box.className='s3d-score s3d-session-score';
  box.setAttribute('aria-label','Սխալ պատասխաններ՝ 0, ճիշտ պատասխաններ՝ 0');
  box.innerHTML='<span class="s3d-session-wrong">0</span><span class="s3d-session-slash">/</span><span class="s3d-session-right">0</span>';
  if(!box.isConnected)root.querySelector('.s3d-hud')?.appendChild(box);
  const bad=box.querySelector('.s3d-session-wrong');
  const good=box.querySelector('.s3d-session-right');
  const update=()=>{
    bad.textContent=String(wrong);good.textContent=String(correct);
    bad.classList.toggle('is-active',wrong>0);
    good.classList.toggle('is-active',correct>0);
    box.setAttribute('aria-label','Սխալ պատասխաններ՝ '+wrong+', ճիշտ պատասխաններ՝ '+correct);
    root.dataset.sessionWrong=String(wrong);
    root.dataset.sessionCorrect=String(correct);
  };
  // Unlock the audio context only while responding to an actual child tap.
  function unlockAudio(){
    if(disposed||!ctx?.settings?.master||!ctx?.settings?.effects)return;
    try{
      if(!ac||ac.state==='closed'){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(AC)ac=new AC();
      }
      if(ac&&!keepAliveOsc){
        // A nearly silent running oscillator keeps WebKit's audio graph alive
        // between a child's last correct tap and the full-cycle result.
        keepAliveOsc=ac.createOscillator();keepAliveGain=ac.createGain();
        keepAliveOsc.frequency.value=34;keepAliveGain.gain.value=.000002;
        keepAliveOsc.connect(keepAliveGain);keepAliveGain.connect(ac.destination);
        keepAliveOsc.start();
      }
      if(ac?.state==='suspended')ac.resume().catch(()=>{});
      root.dataset.sessionAudio=ac?.state||'unavailable';
    }catch{}
  }
  function wrongAnswer(){if(disposed)return;unlockAudio();wrong++;update()}
  function rightAnswer(){if(disposed)return;unlockAudio();correct++;update()}
  function showCycleResult(){
    if(disposed)return Promise.resolve();
    if(pendingResolve)return Promise.resolve(); // never stack dialogs
    // Snapshot the just-completed cycle, then reset header immediately:
    // the large result card retains the real (wrong/right) final counts.
    const finalWrong=wrong,finalCorrect=correct;
    const outcome=classifyFindingResult(finalCorrect,finalWrong);
    wrong=0;correct=0;update();
    // The tenth-answer star tally follows the very same visit/cycle as
    // this visible score; replay must never inherit hidden correct answers.
    ctx?.resetCorrectAnswerStreak?.();
    root.dataset.sessionResult=outcome;
    const el=document.createElement('div');
    el.className='s3d-cycle-backdrop s3d-cycle-'+outcome;
    el.setAttribute('role','dialog');
    el.setAttribute('aria-modal','true');
    el.setAttribute('aria-label','Խաղաշրջանի արդյունքը');
    const title=outcome==='success'?'Ապրե՛ս, հրաշալի է։':
      outcome==='encourage'?'Լավ փորձ էր, շարունակի՛ր։':'Շատ լավ, շարունակե՛նք։';
    const desc=outcome==='success'?'Դու շատ ճիշտ պատասխաններ տվեցիր։':
      outcome==='encourage'?'Հաջորդ անգամ ավելի լավ կստացվի։':'Հավասար արդյունք։';
    el.innerHTML='<div class="s3d-cycle-card"><div class="s3d-cycle-icon" aria-hidden="true">'+
      (outcome==='success'?'🌟':outcome==='encourage'?'🌈':'✨')+
      '</div><div class="s3d-cycle-title"></div><div class="s3d-cycle-label"></div>'+
      '<div class="s3d-cycle-stats"><span class="s3d-session-wrong"></span>'+
      '<span class="s3d-session-slash">/</span><span class="s3d-session-right"></span></div>'+
      '<div class="s3d-cycle-desc"></div>'+
      '<button type="button" class="s3d-cycle-replay" aria-label="Խաղալ նորից">'+
      '<span class="s3d-cycle-replay-icon" aria-hidden="true">↻</span>'+
      '<span>Խաղալ նորից</span></button></div>';
    el.querySelector('.s3d-cycle-title').textContent=title;
    el.querySelector('.s3d-cycle-label').textContent='Քո արդյունքը';
    el.querySelector('.s3d-cycle-desc').textContent=desc;
    el.querySelector('.s3d-cycle-stats .s3d-session-wrong').textContent=String(finalWrong);
    el.querySelector('.s3d-cycle-stats .s3d-session-right').textContent=String(finalCorrect);
    el.querySelector('.s3d-cycle-stats .s3d-session-wrong').classList.toggle('is-active',finalWrong>0);
    el.querySelector('.s3d-cycle-stats .s3d-session-right').classList.toggle('is-active',finalCorrect>0);
    if(outcome==='success'){
      for(let i=0;i<18;i++){
        const particle=document.createElement('span');
        particle.className='s3d-cycle-particle';
        particle.textContent=i%3===0?'⭐':i%3===1?'✦':'●';
        particle.style.left=(10+(i*37)%82)+'%';
        particle.style.top=(8+(i*17)%72)+'%';
        particle.style.animationDelay=(i%7)*.11+'s';
        el.appendChild(particle);
      }
    }
    root.appendChild(el);overlay=el;
    // Schedule on the same live audio context unlocked by actual earlier taps.
    // If WebKit suspended it, resume and play after the resume resolves.
    const play=()=>{
      if(disposed||overlay!==el)return;
      const ok=playFindingResultsAudio(outcome,ctx,ac);
      root.dataset.resultAudio=ok?'scheduled':(ctx?.settings?.effects?'unavailable':'disabled');
    };
    if(ac?.state==='running')play();
    else if(ac&&ctx?.settings?.master&&ctx?.settings?.effects)
      ac.resume().then(play).catch(()=>{root.dataset.resultAudio='unavailable'});
    else root.dataset.resultAudio='disabled';
    root.dataset.sessionAwaitingReplay='true';
    return new Promise(resolve=>{
      pendingResolve=resolve;
      const replay=el.querySelector('.s3d-cycle-replay');
      replay.addEventListener('click',()=>{
        if(disposed||overlay!==el||!pendingResolve)return;
        // This is the ONLY way to advance the game beyond the final result.
        const finish=pendingResolve;pendingResolve=null;
        overlay.remove();overlay=null;
        root.dataset.sessionAwaitingReplay='false';
        root.dataset.sessionResult='none';
        unlockAudio();
        finish();
      },{once:true});
    });
  }
  function dispose(){
    disposed=true;
    overlay?.remove();overlay=null;
    root.dataset.sessionAwaitingReplay='false';
    if(pendingResolve){const done=pendingResolve;pendingResolve=null;done()}
    try{keepAliveOsc?.stop()}catch{}
    try{keepAliveOsc?.disconnect()}catch{}
    try{keepAliveGain?.disconnect()}catch{}
    if(ac){ac.close().catch(()=>{});ac=null}
    keepAliveOsc=null;keepAliveGain=null;
  }

  update();
  return {
    wrongAnswer,rightAnswer,showCycleResult,dispose,
    counts:()=>({wrong,correct}),
    get element(){return box}
  };
}
