const status=document.querySelector('#status');const enable=document.querySelector('#enable');const test=document.querySelector('#send-test');let token=null;
function bytes(s){const pad='='.repeat((4-s.length%4)%4);const bin=atob((s+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(bin,c=>c.charCodeAt(0));}
enable.addEventListener('click',async()=>{
  if(!('serviceWorker'in navigator)||!('Notification'in window)||!('PushManager'in window)){status.textContent='Բացիր հավելվածը iPhone-ի գլխավոր էկրանից։';return;}
  try{
    const permission=await Notification.requestPermission();if(permission!=='granted'){status.textContent='Ծանուցումների թույլտվությունը չի տրվել։';return;}
    const keyResponse=await fetch('/api/public-key',{cache:'no-store'});if(!keyResponse.ok)throw Error('Սերվերի Push կարգավորումը դեռ պատրաստ չէ։');
    const {publicKey}=await keyResponse.json();const registration=await navigator.serviceWorker.register('/push-worker.js');await navigator.serviceWorker.ready;
    let subscription=await registration.pushManager.getSubscription();if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes(publicKey)});
    const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription})});if(!response.ok)throw Error('Հեռախոսի գրանցումը չհաջողվեց։');
    token=(await response.json()).testToken;test.hidden=false;status.textContent='Հեռախոսը գրանցված է։ Կարող ես փորձնական ծանուցում ուղարկել։';
  }catch(e){status.textContent=e.message||'Սխալ առաջացավ։';}
});
test.addEventListener('click',async()=>{
  if(!token)return;test.disabled=true;try{const r=await fetch('/api/test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({testToken:token})});const data=await r.json();status.textContent=data.sent?'Փորձնական Push-ը ուղարկվեց։ Կողպիր հեռախոսը և ստուգիր ծանուցումը։':r.status===429?'Փորձերի սահմանաչափը լրացել է։':'Ծանուցումը չուղարկվեց։';}catch{status.textContent='Սերվերի հետ կապը չհաջողվեց։';}finally{test.disabled=false;}
});
