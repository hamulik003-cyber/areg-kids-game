import {WORLD_NAMES,WORLD_COUNTS,SAVE_KEY,readSave,generateSection,nextSection,validateSection} from "./worlds.js";
const c=document.getElementById("game"),g=c.getContext("2d"),W=960,H=540,save=readSave(localStorage);
let map,hero,solved=false,starTaken=false,seq=[],last=0,gameDone=false,notice="",noticeUntil=0,frames=0;
const input={left:false,right:false,jump:false,action:false},keys={},pointers=new Map(),buttons=[["left",80,467,"◀"],["right",166,467,"▶"],["jump",874,467,"↑"],["action",780,467,"✦"]];
const palettes=[["#132c52","#db8c83","#c69a6e"],["#123f40","#a8c88b","#6c9775"],["#725044","#eac183","#c99a65"],["#24456b","#bdd8ef","#9ac8dc"],["#304b83","#f6b0bc","#d8b8a1"],["#211d51","#a678cf","#6f629c"]];
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(save))}catch{}}
function load(){map=generateSection(save.currentWorld,save.currentSection);validateSection(map);hero={x:map.checkpoint.x,y:map.checkpoint.y,w:42,h:78,vx:0,vy:0,ground:false,coyote:0,buffer:0,wasJump:false,wasAction:false};solved=save.solvedPuzzleIds.includes(map.puzzleObjects[0].id);starTaken=save.collectedStarIds.includes(map.triggers[0].id);seq=[];notice="";persist()}
function reset(){hero.x=map.checkpoint.x;hero.y=map.checkpoint.y;hero.vx=hero.vy=0;hero.ground=false;seq=[]}
function message(t){notice=t;noticeUntil=performance.now()+1800}
function complete(){if(!solved){message("Բացիր դուռը՝ լուծելով նշանների գաղտնիքը");return}const n=nextSection(save.currentWorld,save.currentSection);save.worldProgress[map.id]=true;if(n){save.currentWorld=n.world;save.currentSection=n.section;if(!save.unlockedWorldIds.includes(n.world))save.unlockedWorldIds.push(n.world);load();message("Նոր հատված բացվեց")}else{save.completedGame=true;gameDone=true;persist();message("Բոլոր վեց աշխարհներն ավարտված են")}}
function puzzle(){const o=map.puzzleObjects[0];if(Math.abs(hero.x-o.x)>105){message("Մոտեցիր կախարդական մեխանիզմին");return}if(solved)return;seq.push(seq.length?((o.solution[seq.length]+3)%3):o.solution[0]);if(seq.length===3){solved=true;save.solvedPuzzleIds.push(o.id);persist();message("Դուռը բացվեց")}else message("Նշան "+seq.length+"/3")}
function refresh(){for(const k of Object.keys(input))input[k]=!!keys[k]||[...pointers.values()].includes(k)}
window.addEventListener("keydown",e=>{const k=({ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"jump",KeyW:"jump",Space:"jump",KeyE:"action",Enter:"action"})[e.code];if(k){e.preventDefault();keys[k]=true;refresh()}});window.addEventListener("keyup",e=>{const k=({ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",ArrowUp:"jump",KeyW:"jump",Space:"jump",KeyE:"action",Enter:"action"})[e.code];if(k){e.preventDefault();keys[k]=false;refresh()}});
function pointer(e){e.preventDefault();const b=c.getBoundingClientRect(),s=Math.min(b.width/W,b.height/H),x=(e.clientX-b.left-(b.width-W*s)/2)/s,y=(e.clientY-b.top-(b.height-H*s)/2)/s;if(e.type==="pointerdown"){c.setPointerCapture(e.pointerId);const hit=buttons.find(q=>Math.hypot(q[1]-x,q[2]-y)<42);if(hit)pointers.set(e.pointerId,hit[0])}else if(e.type==="pointerup"||e.type==="pointercancel")pointers.delete(e.pointerId);refresh()}for(const ev of ["pointerdown","pointerup","pointercancel"])c.addEventListener(ev,pointer);
function intersects(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function update(dt){if(gameDone)return;const h=hero,d=Math.min(dt,.033);frames+=d;h.vx=(+input.right-+input.left)*235;if(input.jump&&!h.wasJump)h.buffer=.12;h.wasJump=input.jump;h.buffer=Math.max(0,(h.buffer||0)-d);h.coyote=h.ground?.1:Math.max(0,h.coyote-d);if(h.buffer>0&&h.coyote>0){h.vy=-440;h.ground=false;h.buffer=0;h.coyote=0}
const oldY=h.y;h.x=Math.max(0,Math.min(W-h.w,h.x+h.vx*d));h.vy=Math.min(900,h.vy+1100*d);h.y+=h.vy*d;h.ground=false;
const surfaces=[...map.ground,...map.platforms,...map.movingPlatforms.map(p=>({...p,x:p.x+Math.sin(frames*.7)*40}))];for(const p of surfaces){if(h.vy>=0&&oldY+h.h<=p.y+12&&h.y+h.h>=p.y&&h.x+h.w>p.x+5&&h.x<p.x+p.w-5){h.y=p.y-h.h;h.vy=0;h.ground=true}}
if(h.y>H+60||map.hazards.some(q=>intersects(h,q))){reset();message("Փորձիր նորից")}
if(!starTaken&&intersects(h,map.triggers[0])){starTaken=true;save.collectedStarIds.push(map.triggers[0].id);persist();message("Աստղը հավաքված է")}
if(input.action&&!h.wasAction)puzzle();h.wasAction=input.action;
if(intersects(h,map.exit))complete()}
function box(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
function render(){const pal=palettes[save.currentWorld-1],sky=g.createLinearGradient(0,0,0,H);sky.addColorStop(0,pal[0]);sky.addColorStop(1,pal[1]);box(0,0,W,H,sky);for(let i=0;i<60;i++){const x=(i*173+save.currentSection*59)%W,y=(i*79)%360;g.fillStyle="#ffffff7a";g.beginPath();g.arc(x,y,i%4===0?2:1,0,7);g.fill()}
for(let i=0;i<11;i++){g.fillStyle=i%2?"#192b5280":"#36446588";g.beginPath();g.moveTo(i*110-90,450);g.lineTo(i*110+50,195+i%4*34);g.lineTo(i*110+200,450);g.fill()}
for(const p of [...map.ground,...map.platforms]){box(p.x,p.y,p.w,p.h,pal[2]);box(p.x,p.y,p.w,11,"#f1d6a4");box(p.x+6,p.y+15,p.w-12,4,"#0002")}
for(const p of map.movingPlatforms){box(p.x+Math.sin(frames*.7)*40,p.y,p.w,p.h,"#92d6df")}
for(const h of map.hazards){box(h.x,h.y,h.w,h.h,"#c94156");for(let x=h.x;x<h.x+h.w;x+=14){g.fillStyle="#ffbe8c";g.beginPath();g.moveTo(x,h.y);g.lineTo(x+7,h.y-14);g.lineTo(x+14,h.y);g.fill()}}
const p=map.puzzleObjects[0];box(p.x,p.y,p.w,p.h,solved?"#6cdcc4":"#a184c5");g.fillStyle="#fff5";g.font="bold 30px system-ui";g.fillText(solved?"✓":"✦",p.x+12,p.y+38);
const star=map.triggers[0];if(!starTaken){g.fillStyle="#ffe08a";g.beginPath();g.arc(star.x+12,star.y+12,13,0,7);g.fill()}
const exit=map.exit;box(exit.x,exit.y,exit.w,exit.h,solved?"#81e0c7":"#493951");box(exit.x+7,exit.y+9,exit.w-14,exit.h-16,solved?"#dcfff1":"#886c9c");
const h=hero;g.save();g.translate(h.x+h.w/2,h.y);g.fillStyle="#49354c";g.fillRect(-18,5,36,13);g.fillStyle="#f0c8a3";g.beginPath();g.arc(0,21,19,0,7);g.fill();g.fillStyle="#25243c";g.fillRect(-10,19,4,4);g.fillRect(7,19,4,4);box(-15,41,30,29,"#6ab0b7");box(-14,70,11,8+Math.sin(frames*16)*3,"#433b52");box(4,70,11,8-Math.sin(frames*16)*3,"#433b52");g.restore();
box(12,12,580,68,"#111c36a8");g.fillStyle="#fff3d7";g.textAlign="left";g.font="bold 22px system-ui";g.fillText("Արեգ · "+WORLD_NAMES[save.currentWorld-1],24,40);g.font="17px system-ui";g.fillText("Աշխարհ "+save.currentWorld+"/6 · Հատված "+save.currentSection+"/"+WORLD_COUNTS[save.currentWorld-1]+" · Աստղեր "+save.collectedStarIds.length,24,66);
for(const b of buttons){g.beginPath();g.fillStyle=input[b[0]]?"#fff1c3":"#e6ba74";g.arc(b[1],b[2],37,0,7);g.fill();g.lineWidth=3;g.strokeStyle="#fff9";g.stroke();g.fillStyle="#27344c";g.font="bold 27px system-ui";g.textAlign="center";g.fillText(b[3],b[1],b[2]+9)}
if(notice&&performance.now()<noticeUntil){box(260,93,440,50,"#122442de");g.fillStyle="#fff2cc";g.font="bold 18px system-ui";g.textAlign="center";g.fillText(notice,480,125)}
if(gameDone){box(150,160,660,200,"#132442ed");g.fillStyle="#ffe5a6";g.textAlign="center";g.font="bold 34px system-ui";g.fillText("Վեց աշխարհներն ավարտված են!",480,260)}}
function tick(t){const dt=last?(t-last)/1000:0;last=t;update(dt);render();requestAnimationFrame(tick)}load();requestAnimationFrame(tick);
