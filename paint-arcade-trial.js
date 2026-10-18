// AREG TEST only. Paint arcade renders entirely inside existing activityContent;
// the parent game's canonical back/title/stars header is NEVER changed.
export function mountPaintArcade(host, award, registerCleanup){
 const css=document.createElement('style');css.textContent=`
 .areg-paint-arcade{height:100%;min-height:0;display:flex;flex-direction:column;gap:12px;padding:12px;overflow:auto;overscroll-behavior:contain;font-family:system-ui,sans-serif;touch-action:pan-y}
 .areg-paint-arcade *{box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
 .areg-paint-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding-bottom:15px}
 .areg-paint-tile{border:5px solid #fff4cd;border-radius:22px;padding:8px 6px 12px;background:linear-gradient(155deg,#ffe5a8,#e6a85e 75%,#c98246);box-shadow:0 6px 0 #9d622e,0 10px 17px #593c2850;display:flex;flex-direction:column;align-items:center;gap:7px;color:#643c1d;font-weight:900;min-width:0}
 .areg-paint-tile .pic{display:grid;place-items:center;width:100%;height:clamp(100px,17vh,170px);border-radius:16px;background:radial-gradient(circle at 35% 25%,#fff,#fff5d9 75%);border:3px solid #fff;box-shadow:inset 0 2px 7px #d6a46d7a,0 3px 5px #7950324a;font-size:clamp(49px,11vw,80px);text-shadow:0 5px 3px #9d6e3950}
 .areg-paint-tile span:last-child{font-size:clamp(13px,3.2vw,18px);line-height:1.2;min-height:34px;text-align:center}
 .areg-paint-play{display:flex;flex-direction:column;gap:9px;flex:1;min-height:0;overflow:hidden}
 .areg-paint-subhead{display:flex;align-items:center;justify-content:space-between;gap:8px}
 .areg-paint-small{border:3px solid #ffe6aa;border-radius:15px;background:linear-gradient(#f5ca82,#d79653);box-shadow:0 3px 0 #925b34;color:#5d351b;font-weight:900;font-size:15px;padding:9px 12px}
 .areg-paint-name{font-weight:900;color:#654020;text-shadow:0 1px #fff;min-width:0;text-align:center}
 .areg-paint-sheet{position:relative;flex:1;min-height:0;background:radial-gradient(ellipse at 40% 25%,#fff,#fffaf0);border:8px solid #e7b879;border-radius:27px;box-shadow:inset 0 0 0 3px #fff2d0,0 6px 0 #a16a37,0 11px 20px #4c332b33;overflow:hidden;touch-action:none}
 .areg-paint-sheet canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
 .areg-paint-pal{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px;padding:10px 5px;background:#ffe2ac;border:3px solid #fff3cd;border-radius:20px;box-shadow:0 4px 0 #ad783d}
 .areg-paint-color{width:clamp(33px,8.8vw,47px);height:clamp(33px,8.8vw,47px);border:4px solid #fff8dd;border-radius:50%;box-shadow:inset -3px -3px 5px #0002,0 4px 0 #ad7848}
 .areg-paint-color.chosen{outline:3px solid #ffc34c;outline-offset:2px;transform:translateY(-3px)}
 .areg-paint-tip{font-weight:800;text-align:center;font-size:14px;color:#684222}
 .areg-paint-finish{align-self:center;min-width:155px}
 .areg-paint-done{position:absolute;inset:0;background:#fff7dfeb;display:grid;place-content:center;gap:15px;text-align:center;font-size:30px;font-weight:900;color:#915923;animation:aregPaintPop .4s ease-out}
 @keyframes aregPaintPop{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}
 `;host.append(css);
 const root=document.createElement('div');root.className='areg-paint-arcade';host.append(root);
 const modes=[
 ['Դասական ներկում','🌼','brush'],['Ուրվագիծ և ներկում','🐱','trace'],
 ['Հպումով գունավորում','🦄','fill'],['Ազատ նկարչություն','🌈','free'],
 ['Կախարդական գույներ','🦋','magic'],['Հատվածներով ներկում','🚀','segments'],
 ['Նկարների հավաքածու','🎨','gallery'],['Կենդանացող նկարներ','🦁','alive']
 ];
 let destroyed=false,dispose=()=>{},earned=false;
 function clear(){dispose();dispose=()=>{};root.replaceChildren()}
 function menu(){clear();root.innerHTML='<div class="areg-paint-tip">Ընտրի՛ր քո սիրելի նկարչական խաղը 🎨</div><div class="areg-paint-grid"></div>';const grid=root.querySelector('.areg-paint-grid');modes.forEach(([name,icon],i)=>{const b=document.createElement('button');b.className='areg-paint-tile';b.innerHTML='<span class="pic"></span><span></span>';b.children[0].textContent=icon;b.children[1].textContent=name;b.addEventListener('click',()=>play(i));grid.append(b)})}
 const palette=['#ed5357','#ff9e41','#f8d852','#65c585','#54a9ed','#a57fe2','#f38cc3','#6c4936'];
 const shapes=[
 {label:'Ծաղիկ',d:'M200 145 C155 80 100 155 160 205 C78 158 65 270 165 255 C110 335 230 352 215 262 C310 323 350 220 250 212 C325 135 232 88 200 145Z',parts:['M200 145 C155 80 100 155 160 205 C78 158 65 270 165 255 C110 335 230 352 215 262 C310 323 350 220 250 212 C325 135 232 88 200 145Z','M191 262 H207 V410 H191 Z','M193 345 Q105 290 109 359 Q155 389 193 345Z','M205 376 Q270 318 295 355 Q272 398 205 376Z']},
 {label:'Սիրտ',d:'M200 375 C130 325 55 267 65 185 C75 90 170 96 200 158 C250 75 345 114 339 206 C334 278 256 342 200 375Z',parts:['M200 375 C130 325 55 267 65 185 C75 90 170 96 200 158 C250 75 345 114 339 206 C334 278 256 342 200 375Z']},
 {label:'Արև',d:'M200 115 A95 95 0 1 1 199.9 115 Z',parts:['M200 115 A95 95 0 1 1 199.9 115 Z']}
 ];
 function play(mode,shapeIndex=0){
 clear();let shape=shapes[shapeIndex%shapes.length],phase=mode===1?'trace':'paint',drawing=false,last=null,color=0,strokes=[],points=0,done=false,raf=0,token=0;
 root.innerHTML='<div class="areg-paint-play"><div class="areg-paint-subhead"><button class="areg-paint-small" id="paintMenu">‹ Խաղերը</button><span class="areg-paint-name"></span><button class="areg-paint-small" id="paintReset">↻</button></div><div class="areg-paint-tip" id="paintTip"></div><div class="areg-paint-sheet"><canvas></canvas></div><div class="areg-paint-pal"></div><button class="areg-paint-small areg-paint-finish" id="paintFinish">Պատրաստ է ✓</button></div>';
 const wrap=root.querySelector('.areg-paint-sheet'),canvas=wrap.querySelector('canvas'),ctx=canvas.getContext('2d'),tip=root.querySelector('#paintTip'),pal=root.querySelector('.areg-paint-pal');
 root.querySelector('.areg-paint-name').textContent=modes[mode][0];
 root.querySelector('#paintMenu').onclick=menu;
 root.querySelector('#paintReset').onclick=()=>play(mode,shapeIndex);
 const path=new Path2D(shape.d),regions=shape.parts.map(d=>new Path2D(d));let mask=document.createElement('canvas'),maskCtx=mask.getContext('2d'),brush=document.createElement('canvas'),brushCtx=brush.getContext('2d');
 function fit(){const rect=wrap.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));mask.width=canvas.width;mask.height=canvas.height;brush.width=canvas.width;brush.height=canvas.height;maskCtx.setTransform(canvas.width/400,0,0,canvas.height/500,0,0);maskCtx.fillStyle='#000';for(const p of regions)maskCtx.fill(p);redraw()}
 function base(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);if(mode!==3){ctx.save();ctx.setTransform(canvas.width/400,0,0,canvas.height/500,0,0);ctx.fillStyle='#fff7e6';ctx.fill(path);ctx.restore()}}
 function outline(progress=1){if(mode===3)return;ctx.save();ctx.setTransform(canvas.width/400,0,0,canvas.height/500,0,0);ctx.strokeStyle='#624733';ctx.lineWidth=6;ctx.lineJoin='round';ctx.lineCap='round';if(progress<1){ctx.setLineDash([12,10]);ctx.globalAlpha=.5}else{ctx.shadowColor='#c39a65';ctx.shadowBlur=3}ctx.stroke(path);ctx.restore()}
 function dab(s){const w=canvas.width/400,h=canvas.height/500;brushCtx.setTransform(1,0,0,1,0,0);brushCtx.clearRect(0,0,brush.width,brush.height);brushCtx.setTransform(w,0,0,h,0,0);brushCtx.strokeStyle=s.c;brushCtx.fillStyle=s.c;brushCtx.lineWidth=mode===3?9:30;brushCtx.lineJoin='round';brushCtx.lineCap='round';brushCtx.beginPath();brushCtx.moveTo(s.x,s.y);brushCtx.lineTo(s.x2,s.y2);brushCtx.stroke();if(mode!==3){brushCtx.setTransform(1,0,0,1,0,0);brushCtx.globalCompositeOperation='destination-in';brushCtx.drawImage(mask,0,0);brushCtx.globalCompositeOperation='source-over'}ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(brush,0,0)}
 function redraw(){base();for(const s of strokes)dab(s);outline(phase==='trace'?0:1)}
 function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*400/r.width,y:(e.clientY-r.top)*500/r.height}}
 function addStroke(a,b){strokes.push({x:a.x,y:a.y,x2:b.x,y2:b.y,c:palette[color]});dab(strokes[strokes.length-1]);outline();points++}
 function choose(i){color=i;[...pal.children].forEach((x,j)=>x.classList.toggle('chosen',j===i))}
 palette.forEach((c,i)=>{const b=document.createElement('button');b.className='areg-paint-color';b.style.background=c;b.setAttribute('aria-label','Գույն '+(i+1));b.onclick=()=>choose(i);pal.append(b)});choose(0);
 if(mode===6){tip.textContent='Ընտրի՛ր նկարն ու ներկի՛ր';const select=document.createElement('div');select.style.cssText='display:flex;justify-content:center;gap:8px';shapes.forEach((sh,i)=>{const b=document.createElement('button');b.className='areg-paint-small';b.textContent=['🌼','❤️','☀️'][i];b.onclick=()=>play(mode,i);select.append(b)});root.querySelector('.areg-paint-play').insertBefore(select,wrap)}
 else tip.textContent=phase==='trace'?'Հպի՛ր նկարին, ուրվագիծը կգծվի ✨':mode===3?'Նկարի՛ր ազատ՝ մատով 🖍️':mode===2?'Հպի՛ր նկարի ներսում՝ գունավորելու համար': 'Մատով ներկի՛ր նկարի ներսում 🎨';
 function trace(){phase='tracing';const start=performance.now();const animate=now=>{if(destroyed||!root.contains(canvas))return;const t=Math.min(1,(now-start)/1900);base();ctx.save();ctx.setTransform(canvas.width/400,0,0,canvas.height/500,0,0);ctx.setLineDash([12,10]);ctx.strokeStyle='#b9a38b';ctx.lineWidth=5;ctx.stroke(path);ctx.setLineDash([]);ctx.strokeStyle='#5c402c';ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';const length=1000;ctx.setLineDash([length*t,length]);ctx.stroke(path);ctx.restore();if(t<1)raf=requestAnimationFrame(animate);else{phase='paint';redraw();tip.textContent='Հիմա ներկի՛ր մատով 🎨'}};raf=requestAnimationFrame(animate)}
 function pointerDown(e){if(done)return;e.preventDefault();if(phase==='trace'){trace();return}if(phase!=='paint')return;const p=point(e);if(mode===2){const ix=Math.floor(p.x*canvas.width/400),iy=Math.floor(p.y*canvas.height/500);const data=maskCtx.getImageData(Math.max(0,Math.min(mask.width-1,ix)),Math.max(0,Math.min(mask.height-1,iy)),1,1).data;if(data[3]>0){for(let y=0;y<500;y+=18)addStroke({x:40,y},{x:360,y});}return}drawing=true;canvas.setPointerCapture(e.pointerId);last=p;addStroke(p,p)}
 function pointerMove(e){if(!drawing||phase!=='paint')return;e.preventDefault();const p=point(e);addStroke(last,p);last=p}
 function pointerUp(){drawing=false;last=null}
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);
 root.querySelector('#paintFinish').onclick=()=>{if(done)return;if(points<2){tip.textContent='Նախ մի փոքր ներկի՛ր 🎨';return}done=true;if(!earned){earned=true;award(1)}const layer=document.createElement('div');layer.className='areg-paint-done';layer.innerHTML='<div style="font-size:70px">🌟✨</div><div>Ապրե՛ս, նկարիչ</div><button class="areg-paint-small">Հաջորդ նկարը ➜</button>';wrap.append(layer);layer.querySelector('button').onclick=()=>play(mode,shapeIndex+1)};
 let observer=new ResizeObserver(()=>fit());observer.observe(wrap);fit();
 dispose=()=>{cancelAnimationFrame(raf);observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp)};
 }
 menu();registerCleanup(()=>{destroyed=true;clear();css.remove()});
}
