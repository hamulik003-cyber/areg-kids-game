// V216: render the user's approved reference photograph in Space Search.
// No procedural substitute: this image determines the silhouette, glowing
// upper lensing crown, lowered foreground disk and lower photon reflection.
// Loaded from GitHub (not localStorage, IndexedDB or a temporary CDN).
const IMAGE_URL='./assets/space3d/black-hole-reference-v216.webp?v=216';
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
          // Avoid a visible rectangular cut at the edge of the source photo.
          const edge=Math.min(x,W-1-x,y,H-1-y);
          opacity*=Math.min(1,Math.max(0,edge/6));
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
