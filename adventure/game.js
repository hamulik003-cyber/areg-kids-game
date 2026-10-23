(()=>{
"use strict";
const canvas=document.createElement("canvas");document.body.replaceChildren(canvas);
const ctx=canvas.getContext("2d");const W=960,H=540;canvas.width=W;canvas.height=H;
document.body.style.cssText="margin:0;background:#10192e;overflow:hidden;touch-action:none";
canvas.style.cssText="width:100vw;height:100vh;object-fit:contain;touch-action:none";
const platforms=[{x:0,y:450,w:290,h:90},{x:365,y:450,w:240,h:90},{x:690,y:450,w:310,h:90},{x:245,y:370,w:115,h:22},{x:540,y:345,w:120,h:22}];
const player={x:48,y:370,w:40,h:76,vx:0,vy:0,grounded:false};
const controls={left:false,right:false,jump:false};let last=0,elapsed=0,won=false,checkpoint=48,stars=0;
const keymap={ArrowLeft:"left",KeyA:"left",ArrowRight:"right",KeyD:"right",Space:"jump",ArrowUp:"jump",KeyW:"jump"};
const down=e=>{let k=keymap[e.code];if(k){e.preventDefault();controls[k]=true}};const up=e=>{let k=keymap[e.code];if(k){e.preventDefault();controls[k]=false}};
window.addEventListener("keydown",down);window.addEventListener("keyup",up);
const buttons=[{key:"left",x:84,y:467,text:"◀"},{key:"right",x:170,y:467,text:"▶"},{key:"jump",x:872,y:467,text:"↑"}];
const activePointers=new Map();
function touch(e){e.preventDefault();const r=canvas.getBoundingClientRect();const scale=Math.min(r.width/W,r.height/H),ox=(r.width-W*scale)/2,oy=(r.height-H*scale)/2;const x=(e.clientX-r.left-ox)/scale,y=(e.clientY-r.top-oy)/scale;let hit=buttons.find(b=>Math.hypot(x-b.x,y-b.y)<44);if(e.type==="pointerdown"){canvas.setPointerCapture(e.pointerId);if(hit)activePointers.set(e.pointerId,hit.key)}else if(e.type==="pointerup"||e.type==="pointercancel")activePointers.delete(e.pointerId);for(let k of Object.keys(controls))controls[k]=[...activePointers.values()].includes(k)||keyboard[k];}
const keyboard={left:false,right:false,jump:false};
window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);
window.addEventListener("keydown",e=>{let k=keymap[e.code];if(k){e.preventDefault();keyboard[k]=true;controls[k]=true}});window.addEventListener("keyup",e=>{let k=keymap[e.code];if(k){e.preventDefault();keyboard[k]=false;controls[k]=[...activePointers.values()].includes(k)}});
["pointerdown","pointerup","pointercancel"].forEach(t=>canvas.addEventListener(t,touch));
let coyote=0,jumpBuffer=0,wasJump=false;
function reset(){player.x=checkpoint;player.y=370;player.vx=0;player.vy=0;won=false}
function update(dt){if(won)return;const step=Math.min(dt,.035);elapsed+=step;
player.vx=(Number(controls.right)-Number(controls.left))*235;
if(controls.jump&&!wasJump)jumpBuffer=.12;wasJump=controls.jump;
jumpBuffer=Math.max(0,jumpBuffer-step);coyote=player.grounded?.1:Math.max(0,coyote-step);
if(jumpBuffer>0&&coyote>0){player.vy=-440;player.grounded=false;jumpBuffer=0;coyote=0}
const prevY=player.y;player.x+=player.vx*step;player.x=Math.max(0,Math.min(W-player.w,player.x));player.vy+=1100*step;player.y+=player.vy*step;player.grounded=false;
for(const p of platforms){if(player.vy>=0&&prevY+player.h<=p.y+10&&player.y+player.h>=p.y&&player.x+player.w>p.x+4&&player.x<p.x+p.w-4){player.y=p.y-player.h;player.vy=0;player.grounded=true}}
if(player.y>H+70)reset();if(player.x>690)checkpoint=710;if(player.x>914){won=true;try{localStorage.setItem("areg-six-worlds-v1",JSON.stringify({schemaVersion:1,slotId:"areg-adventure-1",currentWorld:1,checkpointId:"W01-S01-exit",worldProgress:{"1":1},solvedPuzzleIds:[],collectedStarIds:[],discoveredSecretIds:[],unlockedWorldIds:[1],completedGame:false}))}catch{}}
}
function draw(){const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,"#10274b");sky.addColorStop(1,"#a77385");ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
for(let i=0;i<45;i++){let x=(i*187+31)%W,y=(i*71+17)%300;ctx.fillStyle="#fff8";ctx.beginPath();ctx.arc(x,y,1+(i%3)*.5,0,7);ctx.fill()}
ctx.fillStyle="#263e5e";for(let i=0;i<9;i++){let x=i*145-40;ctx.beginPath();ctx.moveTo(x,450);ctx.lineTo(x+80,220+(i%3)*35);ctx.lineTo(x+190,450);ctx.fill()}
for(let p of platforms){ctx.fillStyle="#6e4c55";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#e5bd82";ctx.fillRect(p.x,p.y,p.w,13)}
ctx.fillStyle="#f5d68b";ctx.fillRect(925,350,9,100);ctx.fillStyle="#91f4d9";ctx.beginPath();ctx.moveTo(934,354);ctx.lineTo(966,369);ctx.lineTo(934,388);ctx.fill();
ctx.fillStyle="#f4b36c";ctx.fillRect(player.x+6,player.y+31,28,39);ctx.fillStyle="#ecd0ad";ctx.beginPath();ctx.arc(player.x+20,player.y+19,19,0,7);ctx.fill();ctx.fillStyle="#392e43";ctx.fillRect(player.x+4,player.y+2,32,9);ctx.fillStyle="#292538";ctx.fillRect(player.x+11,player.y+17,4,4);ctx.fillRect(player.x+25,player.y+17,4,4);
ctx.font="bold 22px system-ui";ctx.textAlign="left";ctx.fillStyle="white";ctx.fillText("Արեգ · Աստղերի կիրճ · 1/48",24,40);ctx.font="16px system-ui";ctx.fillText("Հասի՛ր լուսավոր դրոշին",24,67);
for(const b of buttons){ctx.fillStyle=controls[b.key]?"#ffe8a7":"#e6b968";ctx.beginPath();ctx.arc(b.x,b.y,38,0,7);ctx.fill();ctx.strokeStyle="#fff9";ctx.lineWidth=4;ctx.stroke();ctx.fillStyle="#28344e";ctx.font="bold 30px system-ui";ctx.textAlign="center";ctx.fillText(b.text,b.x,b.y+10)}
if(won){ctx.fillStyle="#101b32dc";ctx.fillRect(170,155,620,225);ctx.textAlign="center";ctx.fillStyle="#fff0bb";ctx.font="bold 36px system-ui";ctx.fillText("Առաջին հատվածն ավարտված է!",480,245);ctx.font="22px system-ui";ctx.fillText("Փորձնական M1 · 1/48",480,300)}
}
function frame(t){let dt=last?(t-last)/1000:0;last=t;update(dt);draw();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();