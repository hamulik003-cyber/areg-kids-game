// AREG TEST: dedicated interactive lion reveal game, mounted BELOW the canonical parent header.
export function mountLionResult(host,award,onExit,registerCleanup){
 const style=document.createElement('style');style.textContent=`
 .lion-game{height:100%;min-height:0;display:flex;flex-direction:column;gap:9px;padding:9px 11px 13px;touch-action:pan-y;font-family:system-ui,sans-serif}
 .lion-game *{box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
 .lion-stage{position:relative;flex:1;min-height:0;border:8px solid #e9b573;border-radius:30px;background:radial-gradient(ellipse at 50% 35%,#fff4c5,#f5bd6f 65%,#b97139);box-shadow:inset 0 0 0 3px #fff3cb,0 6px 0 #9b572e,0 11px 24px #63382075;overflow:hidden;touch-action:none}
 .lion-stage canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
 .lion-subtitle{font-size:15px;font-weight:900;text-align:center;color:#61351e;text-shadow:0 1px #fff4d5}
 .lion-palette{display:flex;gap:8px;justify-content:center;align-items:center;padding:10px 7px;background:linear-gradient(#ffe4b2,#d79c58);border:3px solid #ffedc2;border-radius:20px;box-shadow:0 5px 0 #985d30}
 .lion-color{width:clamp(33px,9vw,48px);height:clamp(33px,9vw,48px);border:4px solid #fff6d5;border-radius:50%;box-shadow:inset -4px -5px 6px #0002,0 4px 0 #9a6838}
 .lion-color.active{outline:3px solid #fff66a;outline-offset:2px;transform:translateY(-4px)}
 .lion-actions{display:flex;gap:9px;justify-content:center}
 .lion-btn{border:3px solid #ffe6b0;border-radius:16px;background:linear-gradient(#ffe2a0,#dc9b53);box-shadow:0 4px 0 #96582f;padding:10px 15px;font-weight:900;color:#633a20}
 .lion-done{position:absolute;inset:0;display:none;align-items:center;justify-content:flex-end;flex-direction:column;padding:0 0 9%;gap:12px;background:linear-gradient(#ffd66e00,#ffdb8270);pointer-events:none}
 .lion-done.visible{display:flex;animation:lionReveal .45s ease-out}
 .lion-confirm{width:65%;max-width:290px;min-height:68px;background:linear-gradient(#8df73e,#1dc838);border:4px solid #9bf76d;border-radius:26px;box-shadow:inset 0 3px 3px #fff8,0 8px 0 #198b2a,0 12px 18px #0005;font-size:46px;color:white;text-shadow:0 4px 4px #287a31;pointer-events:auto}
 .lion-stars{font-size:38px;letter-spacing:9px;filter:drop-shadow(0 4px 4px #7c4a21);animation:lionBounce 1.3s ease-in-out infinite alternate}
 @keyframes lionReveal{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
 @keyframes lionBounce{to{transform:translateY(-12px) rotate(5deg)}}
 `;host.append(style);
 const shell=document.createElement('div');shell.className='lion-game';shell.innerHTML='<div class="lion-subtitle">Մատով ներկի՛ր առյուծիկին 🖌️</div><div class="lion-stage"><canvas></canvas><div class="lion-done"><div class="lion-stars">⭐ 🌟 ⭐</div><button class="lion-confirm" aria-label="Հաջորդ փուլ">✓</button></div></div><div class="lion-palette"></div><div class="lion-actions"><button class="lion-btn" id="lionBack">‹ Խաղերը</button><button class="lion-btn" id="lionUndo">↶ Հետ</button><button class="lion-btn" id="lionFinish">Ավարտել ✓</button></div>';host.append(shell);
 const stage=shell.querySelector('.lion-stage'),canvas=stage.querySelector('canvas'),ctx=canvas.getContext('2d'),pal=shell.querySelector('.lion-palette'),doneLayer=shell.querySelector('.lion-done');
 const colors=['#f7ac2f','#a94a25','#f8e8bf','#ee8552','#ffc73f','#d879c5','#65bbec'];let chosen=0,strokes=[],painting=false,last=null,completed=false,awarded=false,raf=0,alive=true;
 colors.forEach((c,i)=>{const b=document.createElement('button');b.className='lion-color'+(i===0?' active':'');b.style.background=c;b.setAttribute('aria-label','Գույն '+(i+1));b.onclick=()=>{chosen=i;[...pal.children].forEach((el,j)=>el.classList.toggle('active',i===j))};pal.append(b)});
 const W=400,H=500;
 function circle(c,x,y,r,fill,stroke='#693b25',lw=4){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 function ellipse(c,x,y,rx,ry,fill,stroke='#754020',lw=3){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
 function paintLion(c,outlineOnly=false){
  c.save();c.lineJoin='round';c.lineCap='round';
  const grad=(x,y,r,a,b)=>{const g=c.createRadialGradient(x-r*.35,y-r*.45,5,x,y,r);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const fur=outlineOnly?'#fffaf1':grad(182,230,115,'#ffdc69','#ef9829');
  const mane=outlineOnly?'#fffaf1':grad(190,198,140,'#e77b38','#87381e');
  ellipse(c,195,351,95,105,fur);ellipse(c,143,427,36,29,fur);ellipse(c,246,427,36,29,fur);
  c.beginPath();c.moveTo(281,348);c.bezierCurveTo(358,400,361,307,326,296);c.strokeStyle=outlineOnly?'#744b34':'#c77929';c.lineWidth=16;c.stroke();ellipse(c,329,295,23,15,mane);
  for(let i=0;i<17;i++){let a=i*Math.PI*2/17;let x=196+Math.cos(a)*98,y=202+Math.sin(a)*113;ellipse(c,x,y,44,54,mane)}
  circle(c,118,151,33,fur);circle(c,276,151,33,fur);circle(c,118,151,17,outlineOnly?'#fffaf1':'#f48c89',null);circle(c,276,151,17,outlineOnly?'#fffaf1':'#f48c89',null);
  ellipse(c,196,211,89,99,fur);
  ellipse(c,157,203,23,32,'#fffdf8');ellipse(c,239,203,23,32,'#fffdf8');
  ellipse(c,160,208,15,25,'#2c1d20',null);ellipse(c,236,208,15,25,'#2c1d20',null);
  circle(c,155,198,7,'white',null);circle(c,232,198,7,'white',null);
  ellipse(c,196,257,57,37,outlineOnly?'#fffaf1':'#fff1cf');
  ellipse(c,195,245,24,16,outlineOnly?'#fffaf1':'#553328');
  c.beginPath();c.moveTo(194,260);c.quadraticCurveTo(176,290,158,270);c.moveTo(194,260);c.quadraticCurveTo(213,290,234,270);c.strokeStyle='#59362a';c.lineWidth=4;c.stroke();
  for(let j=0;j<3;j++){circle(c,144+j*9,255+j%2*9,2,'#88543a',null);circle(c,239+j*9,255+j%2*9,2,'#88543a',null)}
  c.restore();
 }
 let off=document.createElement('canvas'),offctx=off.getContext('2d'),ink=document.createElement('canvas'),inkctx=ink.getContext('2d');
 function render(){const w=canvas.width,h=canvas.height;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.save();ctx.setTransform(w/W,0,0,h/H,0,0);
  const bg=ctx.createRadialGradient(195,195,5,195,220,310);bg.addColorStop(0,'#fff4cb');bg.addColorStop(1,'#cf8a46');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  for(let i=0;i<18;i++){let x=20+(i*137)%365,y=25+(i*91)%450;ctx.fillStyle=['#ffe76c','#ffaf43','#a8e5ff'][i%3];ctx.shadowBlur=12;ctx.shadowColor='#fff1a2';ctx.beginPath();for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,r=j%2?4:9;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.fill();ctx.shadowBlur=0}
  paintLion(ctx,true);ctx.restore();
  // Draw clipped finger strokes without affecting the background or previous colors.
  offctx.setTransform(1,0,0,1,0,0);offctx.clearRect(0,0,w,h);
  for(const s of strokes){offctx.strokeStyle=s.c;offctx.lineCap='round';offctx.lineJoin='round';offctx.lineWidth=Math.max(16,w*.08);offctx.beginPath();offctx.moveTo(s.a.x*w/W,s.a.y*h/H);offctx.lineTo(s.b.x*w/W,s.b.y*h/H);offctx.stroke()}
  inkctx.setTransform(1,0,0,1,0,0);inkctx.clearRect(0,0,w,h);inkctx.save();inkctx.setTransform(w/W,0,0,h/H,0,0);paintLion(inkctx,false);inkctx.restore();
  offctx.globalCompositeOperation='destination-in';offctx.drawImage(ink,0,0);offctx.globalCompositeOperation='source-over';
  ctx.drawImage(off,0,0);
  ctx.save();ctx.setTransform(w/W,0,0,h/H,0,0);ctx.strokeStyle='#75462e';ctx.lineWidth=3;ctx.restore();
 }
 function fit(){const r=stage.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));off.width=ink.width=canvas.width;off.height=ink.height=canvas.height;render()}
 function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
 function down(e){if(completed)return;e.preventDefault();painting=true;last=point(e);canvas.setPointerCapture(e.pointerId);move(e)}
 function move(e){if(!painting||completed)return;e.preventDefault();const p=point(e);strokes.push({a:last,b:p,c:colors[chosen]});last=p;render()}
 function up(){painting=false;last=null}
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
 shell.querySelector('#lionBack').onclick=onExit;shell.querySelector('#lionUndo').onclick=()=>{strokes.splice(Math.max(0,strokes.length-15),15);render()};
 shell.querySelector('#lionFinish').onclick=()=>{if(completed||strokes.length<10)return;completed=true;doneLayer.classList.add('visible');if(!awarded){awarded=true;award(1)}};
 doneLayer.querySelector('.lion-confirm').onclick=()=>{completed=false;strokes=[];doneLayer.classList.remove('visible');render()};
 const ro=new ResizeObserver(fit);ro.observe(stage);fit();registerCleanup(()=>{alive=false;cancelAnimationFrame(raf);ro.disconnect();style.remove();shell.remove()});
}
