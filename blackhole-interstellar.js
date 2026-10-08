// V216: render the user's approved reference photograph in Space Search.
// No procedural substitute: this image determines the silhouette, glowing
// upper lensing crown, lowered foreground disk and lower photon reflection.
// Loaded from GitHub (not localStorage, IndexedDB or a temporary CDN).
const IMAGE_URL='./assets/space3d/black-hole-reference-v216.webp?v=217';
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

// V217: GPU-only gliding light lanes.  The V216 reference photo remains
// the original stationary texture, including its opaque black event horizon.
// This additive layer adds slow orbital gas movement without turning the card.
export function makeBlackHoleFlowMaterial(THREE,photo){
  const material=new THREE.ShaderMaterial({
    uniforms:{
      uPhoto:{value:photo},
      uTime:{value:0},
      uOpacity:{value:1}
    },
    vertexShader:`
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader:`
      precision highp float;
      uniform sampler2D uPhoto;
      uniform float uTime;
      uniform float uOpacity;
      varying vec2 vUv;
      float band(float x,float center,float width){
        return 1.0-smoothstep(width*.35,width,abs(x-center));
      }
      void main(){
        vec4 photo=texture2D(uPhoto,vUv);
        // The silhouette and empty background must stay completely untouched.
        float luminance=dot(photo.rgb,vec3(.299,.587,.114));
        float bright=photo.a*smoothstep(.13,.59,luminance);
        if(bright<.002){gl_FragColor=vec4(0.0);return;}
        vec2 p=vUv-vec2(.5,.505);
        // The user's picture slopes down toward screen-right; follow that
        // existing photographed band instead of spinning the whole texture.
        float frontLane=p.y+.195*p.x+.004;
        float disk=band(frontLane,0.0,.145);
        // Slowly advect tiny warm-white highlights along this diagonal track.
        float thin=pow(.5+.5*sin(p.x*93.0-uTime*2.7+frontLane*24.0),12.0);
        float wide=pow(.5+.5*sin(p.x*45.0-uTime*1.35-frontLane*9.0),9.0);
        float diskFlow=disk*(thin*.72+wide*.38);
        // Lensed upper crown and lower reflection: orbit around the black
        // event horizon as streaming arcs, not as a rigid rotating object.
        vec2 ell=vec2(p.x/.27,p.y/.315);
        float orbitalRadius=length(ell);
        float angle=atan(ell.y,ell.x);
        float ringBand=band(orbitalRadius,1.0,.50);
        float top=smoothstep(.015,.15,p.y);
        float bottom=1.0-smoothstep(-.16,-.015,p.y);
        float ringArea=ringBand*max(top,bottom*.68);
        float longTrail=pow(.5+.5*sin(angle*15.0-uTime*1.85
                                   +(orbitalRadius-1.0)*7.0),10.0);
        float fineTrail=pow(.5+.5*sin(angle*29.0-uTime*3.1
                                   -(orbitalRadius-1.0)*11.0),16.0);
        float orbitFlow=ringArea*(longTrail*.78+fineTrail*.32);
        // Soft drifting filaments; no on/off flash, no extra noise texture.
        float filament=.5+.5*sin(p.x*118.0-uTime*.83+frontLane*48.0);
        float motion=(diskFlow+orbitFlow)*(.79+.21*filament);
        float opacity=min(.46,bright*motion*.54)*uOpacity;
        vec3 gold=mix(vec3(1.0,.55,.24),vec3(1.0,.94,.73),
                     smoothstep(.2,.86,luminance));
        gl_FragColor=vec4(gold,opacity);
      }
    `,
    transparent:true,
    depthWrite:false,
    depthTest:true,
    blending:THREE.AdditiveBlending,
    toneMapped:false,
    side:THREE.DoubleSide
  });
  material.userData.isBlackHoleFlow=true;
  return material;
}
