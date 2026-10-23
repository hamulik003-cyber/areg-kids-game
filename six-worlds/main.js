const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");const W=960,H=540;
const saveKey="areg-six-worlds-clean-v1";
const stages=[
{title:"Արթնացող կիրճ",ground:[[0,370],[455,750],[835,1180]],platforms:[[320,390,150],[760,365,125]],goal:1100,stars:[180,620,980],mechanic:"bridge"},
{title:"Կոտրված ճանապարհ",ground:[[0,290],[470,690],[830,1230]],platforms:[[280,395,125],[650,345,130]],goal:1160,stars:[210,570,1010],mechanic:"bridge"},
{title:"Հին մեխանիզմներ",ground:[[0,410],[520,820],[930,1350]],platforms:[[370,380,160],[800,340,150]],goal:1280,stars:[180,700,1140],mechanic:"runes"},
{title:"Շարժվող կամուրջներ",ground:[[0,390],[640,800],[940,1400]],platforms:[[350,395,160],[790,360,150]],goal:1320,stars:[240,720,1190],mechanic:"bridge"},
{title:"Երեք դռների գաղտնիքը",ground:[[0,430],[510,890],[980,1440]],platforms:[[390,395,120],[850,345,135]],goal:1370,stars:[280,740,1210],mechanic:"doors"},
{title:"Առաջին բյուրեղ",ground:[[0,500],[600,970],[1060,1510]],platforms:[[460,395,140],[940,350,150]],goal:1440,stars:[320,810,1320],mechanic:"crystal"}];
let stageIndex=0,world=1,completed=false,cam=0,notice="",noticeTime=0,last=0,t=0,stars=new Set(),solved=false,checkpoint=70;
try{const saved=JSON.parse(localStorage.getItem(saveKey)||"null");if(saved){stageIndex=Math.min(5,Math.max(0,saved.stage||0));stars=new Set(saved.stars||[])}}catch{}
let hero={x:70,y:260,w:40,h:76,vx:0,vy:0,on:false,coyote:0,buffer:0,jumpHeld:false,actionHeld:false,face:1};
const keys={left:false,right:false,jump:false,action:false},pointers=new Map(),controlButtons=[["left",74,463,"◀"],["right",165,463,"▶"],["jump",881,463,"↑"],["action",783,463,"✦"]];
function persist(){try{localStorage.setItem(saveKey,JSON.stringify({stage:stageIndex,stars:[...stars]}))}catch{}}
function stage(){return stages[stageIndex]}
function say(s){notice=s;noticeTime=performance.now()+1800}
function reset(){hero.x=checkpoint;hero.y=255;hero.vx=hero.vy=0;hero.on=false}
function next(){stageIndex++;if(stageIndex>=stages.length){completed=true;say("Առաջին աշխարհն ավարտված է");return}checkpoint=70;solved=false;hero.x=70;hero.y=255;hero.vx=hero.vy=0;cam=0;persist();say("Նոր հատված․ "+stage().title)}
function action(){const s=stage();const px=s.goal-210;if(Math.abs(hero.x-px)>110){say("Մոտեցիր հին մեխանիզմին");return}if(solved){say("Դուռն արդեն բաց է");return}solved=true;say(({bridge:"Կամուրջը ակտիվացավ",runes:"Արև → Լուսին → Աստղ",doors:"Ճիշտ դուռը բացվեց",crystal:"Բյուրեղը լուսավորվեց"})[s.mechanic]);}
const keyMap={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"jump",KeyW:"jump",Space:"jump",KeyE:"action",Enter:"action"};
window.addEventListener("keydown",e=>{const k=keyMap[e.code];if(k){e.preventDefault();keys[k]=true}});window.addEventListener("keyup",e=>{const k=keyMap[e.code];if(k){e.preventDefault();keys[k]=false}});
function pointer(e){e.preventDefault();const r=canvas.getBoundingClientRect(),sc=Math.min(r.width/W,r.height/H),x=(e.clientX-r.left-(r.width-W*sc)/2)/sc,y=(e.clientY-r.top-(r.height-H*sc)/2)/sc;if(e.type==="pointerdown"){canvas.setPointerCapture(e.pointerId);const b=controlButtons.find(q=>Math.hypot(x-q[1],y-q[2])<42);if(b)pointers.set(e.pointerId,b[0])}else pointers.delete(e.pointerId)}
["pointerdown","pointerup","pointercancel"].forEach(e=>canvas.addEventListener(e,pointer));
function pressed(k){return keys[k]||[...pointers.values()].includes(k)}
function update(dt){if(completed)return;dt=Math.min(dt,.033);t+=dt;const h=hero,s=stage();h.vx=(+pressed("right")-+pressed("left"))*235;if(h.vx)h.face=Math.sign(h.vx);if(pressed("jump")&&!h.jumpHeld)h.buffer=.12;h.jumpHeld=pressed("jump");h.buffer=Math.max(0,h.buffer-dt);h.coyote=h.on?.1:Math.max(0,h.coyote-dt);if(h.buffer&&h.coyote){h.vy=-440;h.buffer=0;h.coyote=0;h.on=false}if(pressed("action")&&!h.actionHeld)action();h.actionHeld=pressed("action");
const old=h.y;h.x=Math.max(0,Math.min(s.goal+90,h.x+h.vx*dt));h.vy=Math.min(850,h.vy+1100*dt);h.y+=h.vy*dt;h.on=false;
const solids=[...s.ground.map(a=>({x:a[0],y:445,w:a[1]-a[0],h:95})),...s.platforms.map(a=>({x:a[0],y:a[1],w:a[2],h:18}))];if(solved)solids.push({x:s.goal-340,y:410,w:175,h:18});
for(const p of solids)if(h.vy>=0&&old+h.h<=p.y+9&&h.y+h.h>=p.y&&h.x+h.w>p.x+5&&h.x<p.x+p.w-5){h.y=p.y-h.h;h.vy=0;h.on=true}
if(h.y>H+50){reset();say("Փորձիր կրկին")}
for(let i=0;i<s.stars.length;i++){const x=s.stars[i],id=stageIndex+"-"+i;if(!stars.has(id)&&Math.abs(h.x-x)<29&&h.y<430){stars.add(id);persist();say("Աստղը հավաքվեց")}}
if(h.x>s.goal-45){if(solved)next();else{h.x=s.goal-48;say("Նախ բացիր կախարդական դուռը")}}
cam+=(Math.max(0,Math.min(s.goal-780,h.x-300))-cam)*Math.min(1,dt*4)}
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h)}
function circle(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
function draw(){const s=stage(),sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#152749");sky.addColorStop(.7,"#7d6480");sky.addColorStop(1,"#e5a47d");rect(0,0,W,H,sky);
for(let i=0;i<55;i++){const x=(i*191+47)%960,y=(i*79+22)%320;circle(x,y,(i%3+1)*.6,"#fff8")}
for(let i=0;i<12;i++){const x=i*135-cam*.16-100;ctx.fillStyle=i%2?"#34476b":"#4e5579";ctx.beginPath();ctx.moveTo(x,450);ctx.lineTo(x+100,190+i%4*28);ctx.lineTo(x+235,450);ctx.fill()}
for(let i=0;i<16;i++){const x=i*104-cam*.38-100;ctx.fillStyle="#3b435c";ctx.beginPath();ctx.moveTo(x,450);ctx.lineTo(x+56,295+i%3*25);ctx.lineTo(x+160,450);ctx.fill()}
ctx.save();ctx.translate(-cam,0);
for(const p of s.ground){rect(p[0],445,p[1]-p[0],95,"#59424c");rect(p[0],445,p[1]-p[0],13,"#e5bc89");for(let x=p[0]+20;x<p[1];x+=50)rect(x,470,20,5,"#ffffff18")}
for(const p of s.platforms){rect(p[0],p[1],p[2],18,"#735663");rect(p[0],p[1],p[2],7,"#f1c58d")}
if(solved){rect(s.goal-340,410,175,18,"#74d9ca");rect(s.goal-340,410,175,6,"#e5fff1")}
for(let i=0;i<s.stars.length;i++)if(!stars.has(stageIndex+"-"+i)){const x=s.stars[i];circle(x,332+Math.sin(t*3+i)*8,13,"#ffe1a0");circle(x,332+Math.sin(t*3+i)*8,5,"#fff9dc")}
const mx=s.goal-210;rect(mx,375,60,70,solved?"#4d9e95":"#8e6687");rect(mx+10,389,40,42,"#283954");circle(mx+30,410,15,solved?"#bbfff0":"#ffdc94");ctx.fillStyle="#30425e";ctx.font="bold 24px system-ui";ctx.textAlign="center";ctx.fillText(solved?"✓":"✦",mx+30,418);
rect(s.goal-30,347,43,98,solved?"#a9e4c5":"#453854");rect(s.goal-23,356,29,81,solved?"#e5fff1":"#8a7199");
const h=hero;ctx.save();ctx.translate(h.x+h.w/2,h.y);ctx.scale(h.face,1);circle(0,19,19,"#efc7a5");rect(-17,1,34,12,"#3d334b");rect(-15,41,30,27,"#67a4a7");rect(-14,67,12,11+(h.on?Math.sin(t*15)*3:0),"#3a354a");rect(3,67,12,11-(h.on?Math.sin(t*15)*3:0),"#3a354a");circle(-7,19,2,"#342d3c");circle(7,19,2,"#342d3c");ctx.restore();ctx.restore();
rect(14,14,620,74,"#13233ed9");ctx.textAlign="left";ctx.fillStyle="#ffeed2";ctx.font="bold 22px system-ui";ctx.fillText("Արեգ · Աստղերի կիրճ",28,43);ctx.font="17px system-ui";ctx.fillText(stageIndex+1+"/6 · "+s.title+" · ⭐ "+stars.size,28,70);
for(const b of controlButtons){circle(b[1],b[2],37,pressed(b[0])?"#fff2bf":"#eac180");ctx.strokeStyle="#fff9";ctx.lineWidth=3;ctx.beginPath();ctx.arc(b[1],b[2],37,0,7);ctx.stroke();ctx.fillStyle="#2b3752";ctx.textAlign="center";ctx.font="bold 28px system-ui";ctx.fillText(b[3],b[1],b[2]+10)}
if(notice&&performance.now()<noticeTime){rect(230,104,500,47,"#142644e9");ctx.textAlign="center";ctx.fillStyle="#fff1ce";ctx.font="bold 19px system-ui";ctx.fillText(notice,480,134)}
if(completed){rect(160,170,640,185,"#12243df2");ctx.fillStyle="#fff0c4";ctx.textAlign="center";ctx.font="bold 30px system-ui";ctx.fillText("Աստղերի կիրճն ավարտված է",480,260)}}
function loop(now){const dt=last?(now-last)/1000:0;last=now;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
