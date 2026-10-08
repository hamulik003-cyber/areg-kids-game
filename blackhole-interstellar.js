// V214 - lightweight Interstellar-style accretion/lensing texture.
// Derived from the user's video reference. Drawn once per module load.
// The black silhouette stays fixed; accretion particles move independently.
export function renderInterstellarBlackHole(){
  const W=1280,H=720,canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const cx=630,cy=352;
  let seed=0x492a214f;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  ctx.clearRect(0,0,W,H);
  ctx.lineCap='round';
  const band=(stops)=>{
    const g=ctx.createLinearGradient(100,0,1180,0);
    stops.forEach(([p,c])=>g.addColorStop(p,c));
    return g;
  };
  const stroke=(path,width,color,opacity=1)=>{
    ctx.save();ctx.globalAlpha=opacity;ctx.strokeStyle=color;ctx.lineWidth=width;
    ctx.beginPath();path(ctx);ctx.stroke();ctx.restore();
  };
  const mainDisk=(c,offset=0)=>{
    c.moveTo(35,375+offset);
    c.bezierCurveTo(310,366+offset,480,366+offset,630,373+offset);
    c.bezierCurveTo(794,382+offset,980,388+offset,1245,404+offset);
  };
  const upper=(c,offset=0)=>{
    c.moveTo(330,374+offset);
    c.bezierCurveTo(386,361+offset,414,297+offset,468,230+offset);
    c.bezierCurveTo(514,157+offset,595,155+offset,658,168+offset);
    c.bezierCurveTo(748,184+offset,761,261+offset,805,319+offset);
    c.bezierCurveTo(858,371+offset,927,387+offset,1060,396+offset);
  };
  const orange=band([[0,'rgba(145,56,30,.04)'],[.15,'#b75733'],[.34,'#f9c286'],[.50,'#fff8d4'],[.66,'#fff2c6'],[.8,'#e89a65'],[1,'rgba(133,48,29,.03)']]);
  const white=band([[0,'rgba(190,67,45,.08)'],[.20,'#ffbc82'],[.36,'#fff3d3'],[.50,'#ffffff'],[.63,'#fffdf0'],[.82,'#f8b376'],[1,'rgba(120,42,17,.05)']]);
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  const haze=ctx.createRadialGradient(cx,cy,65,cx,cy,550);
  haze.addColorStop(0,'rgba(255,164,94,.18)');
  haze.addColorStop(.36,'rgba(209,105,58,.10)');
  haze.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=haze;ctx.fillRect(0,0,W,H);
  // Extended, shallow dust disk, with a rich faint underside.
  ctx.save();ctx.translate(cx,380);ctx.scale(1,.20);
  const gas=ctx.createRadialGradient(0,0,140,0,0,570);
  gas.addColorStop(0,'rgba(255,208,140,.4)');
  gas.addColorStop(.38,'rgba(191,82,47,.21)');
  gas.addColorStop(.77,'rgba(100,48,39,.14)');
  gas.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=gas;ctx.beginPath();ctx.arc(0,0,570,0,Math.PI*2);ctx.fill();ctx.restore();
  for(let i=0;i<4800;i++){
    const z=Math.pow(rnd(),.86),x=80+1120*rnd();
    const y=374+(x-cx)*.025+(rnd()-.5)*(16+98*z);
    const near=Math.abs(x-cx)/560;
    const bright=(1-near*.7)*(1-z*.8);
    const alpha1=.013+.075*bright*rnd();
    const alpha2=.012+.11*bright*rnd();
    ctx.strokeStyle=rnd()>.48?
      'rgba(255,197,130,'+alpha1+')':
      'rgba(172,80,55,'+alpha2+')';
    ctx.lineWidth=.35+rnd()*1.4;ctx.beginPath();
    ctx.moveTo(x,y);ctx.lineTo(x+4+rnd()*45,y+(rnd()-.5)*3);ctx.stroke();
  }
  // Lower, gravitationally lensed reflection: soft rather than a hard circular ring.
  for(let i=0;i<11;i++){
    const d=i*5;
    stroke(c=>c.ellipse(cx+8,cy+13,151+d*.5,142+d*.34,-.01,.07*Math.PI,.92*Math.PI),
      10+i*.45,i%3===0?'rgba(255,228,177,.25)':'rgba(193,113,80,.11)',.52-i*.023);
  }
  stroke(c=>c.ellipse(cx,cy+12,143,146,-.02,.06*Math.PI,.95*Math.PI),
    12,'rgba(255,214,161,.26)',.6);
  // Far side is stretched across the black hole by gravitational lensing.
  [96,67,46,29,17,9,4].forEach((w,i)=>stroke(c=>mainDisk(c,-10),w,
    i<2?'#c47547':i<4?orange:white,
    [.035,.055,.12,.20,.30,.50,.56][i]));
  for(let i=0;i<12;i++){
    const offset=(i-5.5)*3;
    stroke(c=>upper(c,offset),i%2?2.4:4,
      i%3===0?'rgba(248,159,107,.7)':'rgba(245,205,166,.53)',
      .09+(1-Math.abs(i-5.5)/7)*.13);
  }
  [102,64,38,25,15,8,3].forEach((w,i)=>stroke(c=>upper(c),w,
    i<3?orange:white,[.028,.065,.18,.33,.54,.85,.80][i]));
  // Opaque event horizon masks ONLY the far side of the luminous disk.
  const shadow=ctx.createRadialGradient(cx-15,cy-11,12,cx,cy,144);
  shadow.addColorStop(0,'#000000');
  shadow.addColorStop(.82,'#010101');
  shadow.addColorStop(.99,'#0b0605');
  shadow.addColorStop(1,'#180e0b');
  ctx.globalCompositeOperation='source-over';ctx.fillStyle=shadow;
  ctx.beginPath();ctx.ellipse(cx,cy+5,125,130,-.07,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.globalCompositeOperation='lighter';
  stroke(c=>c.ellipse(cx,cy+5,127,132,-.07,Math.PI*1.00,Math.PI*1.91),
    3.5,'rgba(255,252,227,.42)');
  stroke(c=>c.ellipse(cx,cy+5,132,139,-.07,Math.PI*1.06,Math.PI*1.93),
    6,'rgba(255,171,108,.23)');
  ctx.save();ctx.filter='blur(4px)';
  [32,16,7].forEach((w,i)=>stroke(c=>c.ellipse(cx,cy+10,139,157,0,.07*Math.PI,.93*Math.PI),
    w,i===0?'rgba(204,121,80,.08)':i===1?'rgba(255,210,165,.17)':'rgba(255,238,193,.23)'));
  ctx.restore();
  // Brilliant foreground disk visibly CROSSES the silhouette.
  const front=band([[0,'rgba(100,44,22,.05)'],[.14,'#a45832'],[.27,'#db8751'],
    [.38,'#ffddb0'],[.46,'#fff9e5'],[.55,'#ffffff'],[.66,'#fff4d1'],
    [.82,'#da8d56'],[1,'rgba(89,37,27,.06)']]);
  [82,52,34,22,13,6,3].forEach((w,i)=>stroke(c=>mainDisk(c,4),w,
    i<3?orange:front,[.028,.06,.14,.29,.48,.78,.68][i]));
  for(let i=0;i<1700;i++){
    const x=90+1110*rnd(),r=Math.abs(x-cx)/560;
    const y=391+(x-cx)*.028+Math.pow(rnd(),.80)*(25+36*r)+(rnd()-.5)*14;
    if(y<cy+29&&Math.abs(x-cx)<128)continue;
    const a=(.015+rnd()*.135)*(1-r*.58);
    ctx.strokeStyle=rnd()>.55?
      'rgba(255,194,132,'+a+')':
      'rgba(179,93,65,'+(a*.7)+')';
    ctx.lineWidth=.55+rnd()*2.2;ctx.beginPath();
    ctx.moveTo(x,y);ctx.lineTo(x+2+rnd()*22,y+(rnd()-.5)*3);ctx.stroke();
  }
  ctx.restore();ctx.restore();
  return canvas;
}
