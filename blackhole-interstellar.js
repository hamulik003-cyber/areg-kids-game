// V216: render the user's approved reference photograph in Space Search.
// No procedural substitute: this image determines the silhouette, glowing
// upper lensing crown, lowered foreground disk and lower photon reflection.
// Loaded from GitHub (not localStorage, IndexedDB or a temporary CDN).
const IMAGE_URL='./assets/space3d/black-hole-reference-v216.webp?v=218';
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

// V218: tangential, diffused accretion and gravitational-lensing flow. V216 remains
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

      // Gentle, continuous filament lanes follow the curvature of the
      // real reference. No rotating silhouette, radial streaks or flashes.
      void main(){
        vec4 photo=texture2D(uPhoto,vUv);
        float lum=dot(photo.rgb,vec3(.299,.587,.114));
        float lightMask=photo.a*smoothstep(.12,.58,lum);
        if(lightMask<.002){
          gl_FragColor=vec4(0.0);
          return;
        }

        // Source-image coordinates (top-left origin), matching the original
        // diagonal disk and upper/lower gravitationally lensed crowns.
        vec2 p=vec2(vUv.x-.5,.5-vUv.y);

        // Tangential flow: all bright filaments run ALONG elliptical arcs.
        // Angular phase progresses gently, so highlights move around the
        // circumference instead of crossing the crown perpendicularly.
        vec2 ell=vec2(p.x/.252,p.y/.365);
        float r=length(ell);
        float theta=atan(ell.y,ell.x);
        float halo=exp(-pow((r-1.02)/.32,2.0));
        float upper=1.0-smoothstep(.015,.13,p.y);
        float lower=smoothstep(.05,.16,p.y);
        float ringMask=halo*max(upper,lower*.83);

        // Smooth nested contours oriented along the ring: tiny phase
        // undulations travel tangentially, never pulsing the whole surface.
        float circularFilaments=.68+.32*(.5+.5*sin(
          (r-1.0)*61.0+.56*sin(theta*2.0-uTime*.48)
        ));
        float orbitAdvection=.62+.38*(.5+.5*sin(
          theta*4.0-uTime*.77+.26*sin(theta*3.0)
        ));
        float crownFlow=ringMask*circularFilaments*orbitAdvection;

        // Near-side disk descends to the right in the approved V216 photo.
        // Follow its diagonal rather than overlaying crosswise light bars.
        float lane=p.y-.26*p.x-.010;
        float diskMask=exp(-pow(lane/.135,2.0));
        float diskFilaments=.67+.33*(.5+.5*sin(
          lane*105.0+.54*sin(p.x*11.0-uTime*.62)
        ));
        float diskAdvection=.62+.38*(.5+.5*sin(
          p.x*15.0-uTime*.81+.30*sin(p.x*9.0-uTime*.30)
        ));
        float diskFlow=diskMask*diskFilaments*diskAdvection;

        // Low, steady additive light keeps the photographic detail intact.
        // The black event horizon is protected by the sampled photo mask.
        float strength=lightMask*(.18*crownFlow+.21*diskFlow);
        float alpha=min(.25,strength)*uOpacity;
        vec3 warm=mix(vec3(1.0,.57,.27),vec3(1.0,.95,.78),
                      smoothstep(.22,.82,lum));
        gl_FragColor=vec4(warm,alpha);
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
