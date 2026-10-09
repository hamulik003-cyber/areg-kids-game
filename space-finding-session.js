// AREG V267 — ephemeral per-visit score and one-cycle result celebration.
// Shared by 3D Space Search and the 38-image constellation guessing game.
// Never saves these wrong/right display counters to localStorage.
// The separate star milestone counter remains persistently owned by app.js.

export function classifyFindingResult(correct,wrong){
  if(correct>wrong)return 'success';
  if(wrong>correct)return 'encourage';
  return 'tie';
}

function playFindingResultsAudio(kind,ctx,ac){
  if(!ctx?.settings?.master||!ctx?.settings?.effects||!ac)return;
  const now=ac.currentTime+.02;
  const note=(frequency,start,duration,volume,type='sine')=>{
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=type;o.frequency.setValueAtTime(frequency,now+start);
    g.gain.setValueAtTime(.0001,now+start);
    g.gain.exponentialRampToValueAtTime(volume,now+start+.018);
    g.gain.exponentialRampToValueAtTime(.0001,now+start+duration);
    o.connect(g);g.connect(ac.destination);
    o.start(now+start);o.stop(now+start+duration+.025);
  };
  if(kind==='success'){
    // Gently festive rising notes accompanied by synthetic applause.
    [523.25,659.25,783.99,1046.5].forEach((n,i)=>note(n,i*.13,.36,.033));
    const len=Math.round(ac.sampleRate*.095);
    const buffer=ac.createBuffer(1,len,ac.sampleRate),arr=buffer.getChannelData(0);
    for(let i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);
    for(let k=0;k<9;k++){
      const source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();
      source.buffer=buffer;filter.type='bandpass';filter.frequency.value=1150+(k%3)*400;
      filter.Q.value=.8;gain.gain.value=.014+(k%3)*.004;
      source.connect(filter);filter.connect(gain);gain.connect(ac.destination);
      source.start(now+.16+k*.095);
    }
  }else if(kind==='encourage'){
    // Quiet, non-threatening two-note descending affirmation; no buzzer.
    note(392,0,.38,.028);note(329.63,.27,.45,.023);
    note(293.66,.54,.44,.016);
  }else{
    note(440,0,.26,.026);note(523.25,.23,.31,.024);
  }
}

export function createFindingSession(root,ctx,existingScore=null){
  let wrong=0,correct=0,disposed=false,overlay=null,resultTimer=0;
  let ac=null;
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
      if(ac?.state==='suspended')ac.resume().catch(()=>{});
    }catch{}
  }
  function wrongAnswer(){if(disposed)return;unlockAudio();wrong++;update()}
  function rightAnswer(){if(disposed)return;unlockAudio();correct++;update()}
  function showCycleResult(){
    if(disposed)return Promise.resolve();
    if(overlay){overlay.remove();overlay=null}
    clearTimeout(resultTimer);
    const outcome=classifyFindingResult(correct,wrong);
    root.dataset.sessionResult=outcome;
    const el=document.createElement('div');
    el.className='s3d-cycle-backdrop s3d-cycle-'+outcome;
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    const title=outcome==='success'?'Ապրե՛ս, հրաշալի է։':
      outcome==='encourage'?'Լավ փորձ էր, շարունակի՛ր։':'Շատ լավ, շարունակե՛նք։';
    const desc=outcome==='success'?'Դու շատ ճիշտ պատասխաններ տվեցիր։':
      outcome==='encourage'?'Հաջորդ անգամ ավելի լավ կստացվի։':'Հավասար արդյունք։';
    el.innerHTML='<div class="s3d-cycle-card"><div class="s3d-cycle-icon" aria-hidden="true">'+
      (outcome==='success'?'🌟':outcome==='encourage'?'🌈':'✨')+
      '</div><div class="s3d-cycle-title"></div><div class="s3d-cycle-label"></div>'+
      '<div class="s3d-cycle-stats"><span class="s3d-session-wrong"></span>'+
      '<span class="s3d-session-slash">/</span><span class="s3d-session-right"></span></div>'+
      '<div class="s3d-cycle-desc"></div></div>';
    el.querySelector('.s3d-cycle-title').textContent=title;
    el.querySelector('.s3d-cycle-label').textContent='Քո արդյունքը';
    el.querySelector('.s3d-cycle-desc').textContent=desc;
    el.querySelector('.s3d-cycle-stats .s3d-session-wrong').textContent=String(wrong);
    el.querySelector('.s3d-cycle-stats .s3d-session-right').textContent=String(correct);
    el.querySelector('.s3d-cycle-stats .s3d-session-wrong').classList.toggle('is-active',wrong>0);
    el.querySelector('.s3d-cycle-stats .s3d-session-right').classList.toggle('is-active',correct>0);
    if(outcome==='success'){
      // Small DOM confetti is decorative only and has no picture/audio downloads.
      for(let i=0;i<18;i++){
        const p=document.createElement('span');
        p.className='s3d-cycle-particle';
        p.textContent=i%3===0?'⭐':i%3===1?'✦':'●';
        p.style.left=(10+(i*37)%82)+'%';
        p.style.top=(8+(i*17)%72)+'%';
        p.style.animationDelay=(i%7)*.11+'s';
        el.appendChild(p);
      }
    }
    root.appendChild(el);overlay=el;
    playFindingResultsAudio(outcome,ctx,ac);
    return new Promise(resolve=>{
      resultTimer=setTimeout(()=>{
        resultTimer=0;
        overlay?.remove();overlay=null;
        pendingResolve=null;
        resolve();
      },3100);
      // Resolves if user exits to menu during the celebration.
      pendingResolve=resolve;
    });
  }
  let pendingResolve=null;
  function dispose(){
    disposed=true;clearTimeout(resultTimer);resultTimer=0;
    overlay?.remove();overlay=null;
    if(pendingResolve){const done=pendingResolve;pendingResolve=null;done()}
    if(ac){ac.close().catch(()=>{});ac=null}
  }
  update();
  return {
    wrongAnswer,rightAnswer,showCycleResult,dispose,
    counts:()=>({wrong,correct}),
    get element(){return box}
  };
}
