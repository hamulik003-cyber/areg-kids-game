// V215 - elevated, diagonally tilted view of a cinematic black hole.
// User reference: visible upper gravitational-lensing crown, deep black event
// horizon, bright near-side disk curving DOWN in front, lower lensed reflection.
// Lightweight canvas painted once; only gas particles animate independently.
export function renderInterstellarBlackHole(){
  const W=1280,H=780;
  const canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=H;
  const c=canvas.getContext('2d');
  const cx=640,cy=369;
  let seed=0x0215b10c;
  const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  c.clearRect(0,0,W,H);
  c.lineCap='round';c.lineJoin='round';
  const blend=(path,width,color,alpha=1)=>{
    c.save();c.globalCompositeOperation='lighter';c.globalAlpha=alpha;
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();path(c);c.stroke();c.restore();
  };
  const band=(stops)=>{
    const g=c.createLinearGradient(80,0,1210,0);
    stops.forEach(s=>g.addColorStop(s[0],s[1]));
    return g;
  };
  const bronze=band([[0,'rgba(100,39,24,.02)'],[.17,'#b65a33'],
    [.32,'#edb17f'],[.45,'#fff2d9'],[.56,'#fffbed'],
    [.73,'#f6c394'],[.88,'#a95536'],[1,'rgba(100,35,22,.02)']]);
  const gold=band([[0,'rgba(90,31,18,.02)'],[.17,'#ad5538'],
    [.29,'#eaa26b'],[.43,'#ffdfb0'],[.51,'#ffffff'],
    [.60,'#fff8e5'],[.77,'#efad79'],[.93,'#9c4931'],[1,'rgba(80,26,16,.01)']]);

  // Warm, very soft halo: do not bake the starfield into this object.
  c.save();c.globalCompositeOperation='lighter';
  const aura=c.createRadialGradient(cx,cy,85,cx,cy,455);
  aura.addColorStop(0,'rgba(250,175,116,.22)');
  aura.addColorStop(.37,'rgba(196,93,56,.09)');
  aura.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=aura;c.fillRect(0,0,W,H);c.restore();

  // Broad inclined accretion cloud below the bright light paths.
  c.save();c.translate(cx,cy+65);c.rotate(-.15);c.scale(1,.31);
  const dust=c.createRadialGradient(0,0,95,0,0,583);
  dust.addColorStop(0,'rgba(255,211,158,.31)');
  dust.addColorStop(.33,'rgba(214,113,70,.20)');
  dust.addColorStop(.68,'rgba(136,62,45,.13)');
  dust.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=dust;c.beginPath();c.arc(0,0,583,0,Math.PI*2);c.fill();c.restore();

  // Outer scattered hot-gas streaks: higher on the right, lower on the left.
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<4800;i++){
    const x=80+rnd()*1120,extent=Math.abs(x-cx)/560;
    const y=439-(x-cx)*.17+(rnd()-.5)*(36+96*Math.pow(rnd(),1.3));
    const a=(.012+.085*rnd())*(1-extent*.56);
    c.strokeStyle=rnd()>.5?'rgba(255,187,130,'+a+')':
      'rgba(161,79,54,'+(a*.75)+')';
    c.lineWidth=.45+rnd()*1.6;
    const len=3+rnd()*28;
    c.beginPath();c.moveTo(x-len*.5,y+len*.08);
    c.lineTo(x+len*.5,y-len*.08);c.stroke();
  }
  c.restore();

  // The back side of the disk continues diagonally behind the shadow.
  function rearDisk(p,offset=0){
    p.moveTo(58,518+offset);
    p.bezierCurveTo(277,498+offset,436,451+offset,619,409+offset);
    p.bezierCurveTo(838,365+offset,1026,346+offset,1227,309+offset);
  }
  [82,56,36,23,13,6,2].forEach((w,i)=>blend(
    p=>rearDisk(p),w,i<4?bronze:gold,[.022,.052,.11,.19,.32,.58,.62][i]
  ));

  // Strong vertically rising upper crown bends around the black event horizon.
  function crown(p,y=0){
    p.moveTo(381,456+y);
    p.bezierCurveTo(435,416+y,451,289+y,516,229+y);
    p.bezierCurveTo(558,187+y,611,169+y,663,175+y);
    p.bezierCurveTo(745,183+y,795,250+y,832,312+y);
    p.bezierCurveTo(861,355+y,910,366+y,988,364+y);
    p.bezierCurveTo(1060,360+y,1135,338+y,1235,312+y);
  }
  [100,70,46,30,20,11,5,2.5].forEach((w,i)=>blend(
    p=>crown(p),w,i<4?bronze:gold,
    [.028,.05,.09,.17,.30,.52,.83,.76][i]
  ));
  for(let i=0;i<13;i++){
    const off=(i-6)*3.0;
    blend(p=>crown(p,off),i%3===0?3.0:1.5,
      i%3===0?'rgba(255,201,159,.48)':'rgba(253,225,188,.36)',
      .11+(1-Math.abs(i-6)/8)*.11);
  }

  // Secondary lensed image of the far side, LOWER than the foreground disk.
  function bottomLens(p,shift=0){
    p.moveTo(489,465+shift);
    p.bezierCurveTo(502,531+shift,553,580+shift,642,574+shift);
    p.bezierCurveTo(724,569+shift,769,520+shift,792,452+shift);
  }
  [56,36,24,15,8,4,2].forEach((w,i)=>blend(
    p=>bottomLens(p),w,i<4?'rgba(246,170,130,.34)':
      'rgba(255,229,201,.66)',
    [.06,.11,.18,.26,.36,.48,.56][i]
  ));
  for(let i=0;i<6;i++){
    blend(p=>bottomLens(p,(i-3)*4),1.4,
      'rgba(255,222,188,.43)',.16);
  }

  // Real opaque black event horizon: dark center remains visible ABOVE the disk.
  const shadow=c.createRadialGradient(cx-15,cy-13,22,cx,cy,159);
  shadow.addColorStop(0,'#000000');
  shadow.addColorStop(.77,'#010101');
  shadow.addColorStop(.94,'#070506');
  shadow.addColorStop(1,'#140b09');
  c.save();c.globalCompositeOperation='source-over';
  c.fillStyle=shadow;
  c.beginPath();c.ellipse(cx,cy-8,143,136,-.055,0,Math.PI*2);
  c.fill();c.restore();

  // Fine photon silhouette edge, softened toward the lower half.
  blend(p=>p.ellipse(cx,cy-8,145,138,-.055,Math.PI*1.04,Math.PI*1.93),
    3,'rgba(255,248,226,.49)',.9);
  blend(p=>p.ellipse(cx,cy-6,151,143,-.055,Math.PI*1.03,Math.PI*1.91),
    7,'rgba(243,151,100,.28)',.46);

  // NEAR disk crosses the lower part of the silhouette, descending visibly.
  // Its underside creates the higher-than-horizontal, top-down perspective.
  function frontDisk(p,shift=0){
    p.moveTo(70,533+shift);
    p.bezierCurveTo(314,513+shift,472,460+shift,626,451+shift);
    p.bezierCurveTo(838,438+shift,1050,361+shift,1220,333+shift);
  }
  function nearRim(p,shift=0){
    p.moveTo(172,565+shift);
    p.bezierCurveTo(323,574+shift,488,545+shift,646,511+shift);
    p.bezierCurveTo(844,471+shift,1005,409+shift,1130,368+shift);
  }
  [112,70,45,28,17,9,4].forEach((w,i)=>blend(
    p=>frontDisk(p),w,i<4?bronze:gold,
    [.026,.06,.14,.25,.46,.75,.91][i]
  ));
  [52,31,18,9,4,1.8].forEach((w,i)=>blend(
    p=>nearRim(p),w,i<3?bronze:gold,
    [.035,.08,.15,.26,.34,.48][i]
  ));

  // Wispy, concentric foreground streaks and light particles.
  c.save();c.globalCompositeOperation='lighter';
  for(let i=0;i<2300;i++){
    const x=89+rnd()*1102,edge=Math.abs(x-cx)/560;
    const mid=468-(x-cx)*.168;
    const y=mid+9+Math.pow(rnd(),.75)*(18+49*(1-edge*.3))
      +(rnd()-.5)*13;
    // Keep the event horizon's upper center truly black.
    if(x>cx-126&&x<cx+126&&y<cy+53)continue;
    const a=(.015+.13*rnd())*(1-edge*.62);
    c.strokeStyle=rnd()>.47?
      'rgba(255,214,165,'+a+')':
      'rgba(187,93,65,'+(a*.75)+')';
    c.lineWidth=.5+rnd()*2;
    const len=2+rnd()*25;
    c.beginPath();c.moveTo(x,y);c.lineTo(x+len,y-len*.145);
    c.stroke();
  }
  c.restore();
  return canvas;
}
