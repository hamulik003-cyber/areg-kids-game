// V216: render the user's approved reference photograph in Space Search.
// No procedural substitute: this image determines the silhouette, glowing
// upper lensing crown, lowered foreground disk and lower photon reflection.
// Loaded from GitHub (not localStorage, IndexedDB or a temporary CDN).
const IMAGE_URL='./assets/space3d/black-hole-reference-v216.webp?v=219';
export function renderInterstellarBlackHole(){
  const W=480,H=270,canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const signal=()=>canvas.dispatchEvent(new Event('areg-blackhole-ready'));
  function fallback(){
    // Only shown if the permanent source file fails to load.
    ctx.save();ctx.clearRect(0,0,W,H);
    const g=ctx.createLinearGradient(60,0,425,0);
    g.addColorStop(0,'rgba(222,110,55,0)');
    g.addColorStop(.4,'#ffd18a');g.addColorStop(.55,'#fff7c9');
    g.addColorStop(1,'rgba(222,110,55,0)');
    ctx.strokeStyle=g;ctx.lineCap='round';ctx.lineWidth=10;
    ctx.beginPath();ctx.ellipse(242,137,86,102,-.18,Math.PI,2*Math.PI);ctx.stroke();
    ctx.fillStyle='#01040b';ctx.beginPath();ctx.ellipse(242,137,70,73,-.1,0,2*Math.PI);ctx.fill();
    ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(20,102);
    ctx.quadraticCurveTo(238,163,460,187);ctx.stroke();
    ctx.restore();signal();
  }
  const im=new Image();
  im.decoding='async';
  im.onload=()=>{
    try{
      ctx.clearRect(0,0,W,H);
      ctx.drawImage(im,0,0,W,H);
      const pixels=ctx.getImageData(0,0,W,H);
      const d=pixels.data;
      // The submitted image has a black backdrop. Alpha-key ONLY that
      // backdrop so this object integrates with the game's moving starfield.
      // Keep the event horizon opaque: stars must never shine through it.
      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          const i=4*(y*W+x);
          const v=Math.max(d[i],d[i+1],d[i+2]);
          let opacity=Math.pow(Math.min(1,Math.max(0,(v-8)/55)),.72);
          const dx=(x-W*.5)/(W*.12);
          const dy=(y-H*.52)/(H*.245);
          const ellipse=dx*dx+dy*dy;
          const opaqueHole=Math.min(1,Math.max(0,(1.04-ellipse)/.09));
          opacity=Math.max(opacity,opaqueHole);
          // V218: tapered photographic accretion tails. A long smooth
          // horizontal feather removes hard scissor-cut endpoints without
          // modifying the opaque central silhouette or approved image colors.
          const horizontal=Math.min(x,W-1-x)/66;
          const vertical=Math.min(y,H-1-y)/7;
          const hx=Math.min(1,Math.max(0,horizontal));
          const vy=Math.min(1,Math.max(0,vertical));
          const smoothX=hx*hx*(3-2*hx);
          const smoothY=vy*vy*(3-2*vy);
          opacity*=smoothX*smoothY;
          d[i+3]=Math.round(opacity*255);
        }
      }
      ctx.putImageData(pixels,0,0);
      signal();
    }catch(_){fallback();}
  };
  im.onerror=fallback;
  im.src=IMAGE_URL;
  return canvas;
}


// V219 - physically moving gold glints, not subtle intensity changes.
// Drawn into one tiny 480x270 transparent canvas at 24fps only while Space
// Search runs; the V216 reference photograph stays entirely unchanged.
export function makeBlackHoleAnimatedFlow(referenceCanvas){
  const W=480,H=270;
  const canvas=document.createElement('canvas');
  canvas.width=W;canvas.height=H;
  const ctx=canvas.getContext('2d');
  const mask=document.createElement('canvas');
  mask.width=W;mask.height=H;
  const maskCtx=mask.getContext('2d');
  let maskReady=false;
  const rand=i=>{
    const n=Math.sin(i*127.1+78.233)*43758.5453;
    return n-Math.floor(n);
  };
  const smoothstep=(a,b,x)=>{
    const q=Math.max(0,Math.min(1,(x-a)/(b-a)));
    return q*q*(3-2*q);
  };
  const rebuildMask=()=>{
    // Mask moving highlights to the actual bright threads of the approved
    // photograph; this protects the black center and empty starfield.
    try{
      const base=referenceCanvas.getContext('2d',{willReadFrequently:true})
        .getImageData(0,0,W,H);
      const out=maskCtx.createImageData(W,H),d=base.data,m=out.data;
      for(let i=0;i<d.length;i+=4){
        const bright=.22*d[i]+.68*d[i+1]+.10*d[i+2];
        const intensity=smoothstep(20,115,bright);
        m[i]=255;m[i+1]=255;m[i+2]=255;
        m[i+3]=Math.round(d[i+3]*intensity);
      }
      maskCtx.putImageData(out,0,0);
      maskReady=true;
    }catch(_){maskReady=false;}
  };
  referenceCanvas.addEventListener('areg-blackhole-ready',rebuildMask,{once:true});

  const gold=(opacity,white=false)=>white?
    'rgba(255,245,204,'+opacity+')':
    'rgba(255,185,100,'+opacity+')';
  const trace=(points,opacity,width,white=false)=>{
    if(points.length<2)return;
    const from=points[0],to=points[points.length-1];
    const grad=ctx.createLinearGradient(from[0],from[1],to[0],to[1]);
    grad.addColorStop(0,gold(0,white));
    grad.addColorStop(.25,gold(opacity*.50,white));
    grad.addColorStop(.63,gold(opacity,white));
    grad.addColorStop(1,gold(0,white));
    ctx.strokeStyle=grad;
    ctx.lineWidth=width;
    ctx.beginPath();
    points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
    ctx.stroke();
  };
  const orbit=(t,i,lower)=>{
    const n=lower?i+100:i;
    const radius=(lower?.92:1.0)+(rand(n+16)-.5)*.22;
    const cx=240.0, cy=lower?141:137;
    const rx=(lower?83:87)*radius,ry=(lower?89:97)*radius;
    const speed=(lower?.39:.47)+rand(n+13)*.25;
    const span=.11+rand(n+29)*.18;
    const period=Math.PI;
    // Angular motion ALONG the luminous arc, not radial flicker.
    const phase=(rand(n+3)*period + t*speed)%period;
    const center=(lower?0:-Math.PI)+phase;
    const points=[];
    for(let k=0;k<=11;k++){
      const a=center-span*(1-k/11);
      points.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);
    }
    trace(points,lower?.36:.45,
      .65+rand(n+25)*1.45,rand(n+31)>.60);
  };
  const diskY=x=>90+.235*x+2.8*Math.sin(x*.016);
  const stream=(t,i)=>{
    // Continuous left-to-right sliding, with tapered long filaments.
    const speed=12+rand(i+173)*25;
    const x0=((rand(i+81)*570+t*speed)%570)-57;
    const length=18+rand(i+57)*33;
    const offset=(rand(i+95)-.5)*24;
    const points=[];
    for(let j=0;j<=9;j++){
      const x=x0+length*j/9;
      points.push([x,diskY(x)+offset+1.8*Math.sin(x*.028+i)]);
    }
    trace(points,.31+rand(i+191)*.16,
      .65+rand(i+205)*1.65,rand(i+111)>.60);
  };
  function paint(time){
    ctx.clearRect(0,0,W,H);
    if(!maskReady)return false;
    ctx.save();
    ctx.globalCompositeOperation='source-over';
    ctx.lineCap='round';ctx.lineJoin='round';
    ctx.shadowColor='rgba(255,169,95,.25)';
    ctx.shadowBlur=1.6;
    // Crown and lower lens receive curved, independently traveling streams.
    for(let i=0;i<43;i++)orbit(time,i,false);
    for(let i=0;i<28;i++)orbit(time,i,true);
    // The lower inclined disk receives its own uninterrupted flow.
    for(let i=0;i<48;i++)stream(time,i);
    // Respect photographic luminance: never illuminate black interior.
    ctx.shadowBlur=0;
    ctx.globalCompositeOperation='destination-in';
    ctx.drawImage(mask,0,0);
    ctx.restore();
    return true;
  }
  return {canvas,paint};
}
