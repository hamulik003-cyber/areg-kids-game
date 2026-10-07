import * as THREE from '../vendor/three.module.min.js';

const stage=document.getElementById('v2Stage');
const promptEl=document.getElementById('v2Prompt');
const scoreEl=document.getElementById('v2Score');
const starsEl=document.getElementById('v2Stars');
const loadingEl=document.getElementById('v2Loading');
document.getElementById('v2Back').addEventListener('click',()=>{location.href='../'});

const STAR_KEY='areg-stars-v35';
let stars=Number(localStorage.getItem(STAR_KEY)||0);
let score=0;
starsEl.textContent=String(stars);

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const byte=v=>Math.max(0,Math.min(255,Math.round(v)));
const rand=(a,b)=>a+Math.random()*(b-a);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}

const QUERY=new URLSearchParams(location.search);
const FOCUS_ID=QUERY.get('focus');
const VIEWER_MODE=!!FOCUS_ID;

const PLANETS=[
  {id:'sun',name:'Արև',find:'Արևը'},
  {id:'mercury',name:'Մերկուրի',find:'Մերկուրին'},
  {id:'venus',name:'Վեներա',find:'Վեներան'},
  {id:'earth',name:'Երկիր',find:'Երկիրը'},
  {id:'moon',name:'Լուսին',find:'Լուսինը'},
  {id:'mars',name:'Մարս',find:'Մարսը'},
  {id:'jupiter',name:'Յուպիտեր',find:'Յուպիտերը'},
  {id:'saturn',name:'Սատուրն',find:'Սատուրնը'},
  {id:'uranus',name:'Ուրան',find:'Ուրանը'},
  {id:'neptune',name:'Նեպտուն',find:'Նեպտունը'},
  {id:'phobos',name:'Ֆոբոս',find:'Ֆոբոսը'},
  {id:'deimos',name:'Դեյմոս',find:'Դեյմոսը'},
  {id:'io',name:'Իո',find:'Իոն'},
  {id:'europa',name:'Եվրոպա',find:'Եվրոպան'},
  {id:'ganymede',name:'Գանիմեդ',find:'Գանիմեդը'},
  {id:'callisto',name:'Կալիստո',find:'Կալիստոն'},
  {id:'titan',name:'Տիտան',find:'Տիտանը'},
  {id:'enceladus',name:'Էնցելադուս',find:'Էնցելադուսը'},
  {id:'titania',name:'Տիտանիա',find:'Տիտանիան'},
  {id:'oberon',name:'Օբերոն',find:'Օբերոնը'}
];

const PROOF_ONLY=[
  {id:'haumea',name:'Հաումեա',find:'Հաումեան'}
];

const PROFILE={
  sun:{
    reference:'01-sun.jpg',texture:'assets/space3d/2k_sun.jpg',
    idle:.72,win:1.34,spin:.12,tilt:7.25,frontY:.15,grade:'sun',
    basic:true,glow:{color:0xff9b20,opacity:.48,scale:2.65}
  },
  mercury:{
    reference:'02-mercury.jpg',texture:'assets/space3d/2k_mercury.jpg',
    idle:.62,win:1.34,spin:.16,tilt:.03,frontY:.18,grade:'mercury',
    roughness:.98,emissive:.025
  },
  venus:{
    reference:'03-venus.jpg',texture:'assets/space3d/2k_venus_surface.jpg',
    idle:.68,win:1.36,spin:-.10,tilt:177.4,frontY:-.35,grade:'venus',
    roughness:.96,emissive:.045,atmosphere:{color:0xffbd55,strength:.16,power:2.8,radius:1.025}
  },
  earth:{
    reference:'04-earth.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/f3792367-3d37-4dd8-88fd-1471f0245990.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMjg2MmY3NWRlNTg3ODEwZCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUyOTY5M30.380UCmpdf2mP2alVEXfiirQNoLn9pABJXxzV-KxOdrw',
    idle:.70,win:1.34,spin:.15,tilt:0,frontY:-Math.PI/2,grade:'direct-generated',
    // Earth proof: the gallery-matched 2:1 map is used directly, exactly like the accepted Mars pipeline.
    // Clouds are already baked into this approved-style map, so no second cloud layer is added.
    directTexture:true,
    basic:true,
    atmosphere:{color:0x38b8ff,strength:.26,power:2.55,radius:1.032}
  },
  moon:{
    reference:'05-moon.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/03cd7106-85b1-484d-aee6-c5ba1211f525.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzA2MWNjZGMxMjExODVhMSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTQ5MTgwNH0.zaO_zyTb9Ozye91YcTSH8p851Mt8yJjak6_w1fFe-W8',
    idle:.62,win:1.33,spin:.13,tilt:0,frontY:-Math.PI/2,grade:'direct-generated',
    // Experimental Moon proof: use the user's latest 2:1 map directly with no grading,
    // no canvas redraw, and no tone mapping so screenshot colors stay as close as possible.
    directTexture:true,
    basic:true
  },
  mars:{
    reference:'06-mars.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/5a7c5c83-c9df-4d85-8e45-fab8b13890b9.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNDJiODAzYTIwOTczOWU5ZCIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTQ2MTQxMH0.byYfYauPUUGDyP0yKv5M7y2tYz7Rw8dgHn4AFxd2ltQ',
    idle:.65,win:1.35,spin:.14,tilt:25.19,frontY:0,grade:'direct-generated',
    // Use the user's generated 2:1 map at its native resolution.
    // Do not redraw it into a canvas, recolor it, or upscale a thumbnail.
    directTexture:true,
    basic:true,
    atmosphere:{color:0xff5f22,strength:.18,power:2.55,radius:1.026},
    glow:{color:0xff5a17,opacity:.10,scale:2.30}
  },
  jupiter:{
    reference:'07-jupiter.jpg',texture:'assets/space3d/2k_jupiter.jpg',
    idle:.75,win:1.36,spin:.19,tilt:3.13,frontY:-1.45,grade:'jupiter',
    roughness:.94,emissive:.04
  },
  saturn:{
    reference:'08-saturn.jpg',texture:'assets/space3d/2k_saturn.jpg',
    idle:.59,win:1.08,spin:.17,tilt:26.73,frontY:.35,grade:'saturn',
    roughness:.95,emissive:.035,
    ring:{kind:'saturn',inner:1.20,outer:1.94,x:-1.01,z:.31,opacity:.98}
  },
  uranus:{
    reference:'09-uranus.jpg',texture:'assets/space3d/2k_uranus.jpg',
    idle:.66,win:1.18,spin:-.14,tilt:-8,frontY:.15,grade:'uranus',
    roughness:.91,emissive:.045,
    atmosphere:{color:0x35d4ff,strength:.20,power:2.7,radius:1.025},
    ring:{kind:'uranus',inner:1.14,outer:1.39,x:-1.06,z:.29,opacity:.44}
  },
  neptune:{
    reference:'10-neptune.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/4fc34365-6eed-421f-a729-430892504419.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjRjNjFhOGZmNjRmNDgyNSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUzNTYzMX0.vU5TXv2uSBP_b5yUqYvHN8sdwCMS94rPp3yZ8CklCwg',
    idle:.69,win:1.34,spin:.15,tilt:0,frontY:-Math.PI/2,grade:'direct-generated',
    // Same direct texture pipeline as the accepted Moon proof.
    directTexture:true,
    basic:true
  },

  // Proof batch — exact user-supplied order, rendered with the accepted Moon/Neptune direct-texture pipeline.
  // 11 Phobos←Map1, 12 Deimos←Map2, 13 Io←Map3, 14 Europa←Map4, 15 Ganymede←Map5.
  // No recoloring, no canvas repaint/projection, no atmosphere; native sRGB + MeshBasicMaterial.
  // Shape: Phobos rugged/irregular, Deimos slightly irregular, Io/Europa/Ganymede spherical.
  phobos:{
    reference:'11-phobos.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/0e7f51fd-3902-4d9e-ae8d-cddae224b41d.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMDBjNjBmYzJmYmMwYzA1NSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUyNDE2Mn0.zJIp7l8XSwutXIT7fHA4K9mCvF82LWLq1k5yvtuVPvo',
    idle:.62,win:1.30,spin:.14,tilt:0,frontY:-Math.PI/2,directTexture:true,basic:true
  },
  deimos:{
    reference:'12-deimos.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/815be972-bb26-41cf-8462-f96d5835f2a3.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmUwNDJkMjA3NjgzMTBjZiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUxMDU2MH0.DNsnhy-kUAnJGnkxNlD4g3W4WKiH-giD9gj6pEsUsZI',
    idle:.60,win:1.28,spin:.13,tilt:0,frontY:-Math.PI/2,directTexture:true,basic:true
  },
  io:{
    reference:'13-io.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/e7582370-81a2-4e6d-82f4-f2c0ceb4b415.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZmIwMTU1MzUzY2IwZWFkOSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUzNjU2NX0.dIpK-563zpeE0olCVGG85BlNh3a1LDJ_K06RtJ1YIFo',
    idle:.64,win:1.31,spin:.15,tilt:0,frontY:-Math.PI/2,directTexture:true,basic:true
  },
  europa:{
    reference:'14-europa.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/ce6cb249-edfb-4109-9fee-c1b1c206fa5f.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMmNjMTBlZDQ1YzRiNmE3NSIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUzNzc0OH0.spRF-QPti4NEVJyLiboom_6T64xNZy2sm5IVQ3bxYAk',
    idle:.64,win:1.31,spin:.14,tilt:0,frontY:-Math.PI/2,directTexture:true,basic:true
  },
  ganymede:{
    reference:'15-ganymede.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/2450e236-26cb-46ca-bc12-4ef1e494d083.jpeg?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiMzg3ZjhlYTYzMjYxMDcxYyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTQ5MzI4Nn0.T4rRJl8ntDvAAi9Z7iNigmDYlZT5Lm9R7HmBCQFWhhg',
    idle:.66,win:1.32,spin:.13,tilt:0,frontY:-Math.PI/2,directTexture:true,basic:true
  },
  callisto:{
    reference:'16-callisto.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/d24f592c-2453-4363-b17a-000b0efb3840.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiNjI0MTgwMjQ4ZWNmMTE0ZiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUzODIxMn0.Tl4RJxqRiRbINzt2A5ZOPRHgklBu9r3pGpu5cmwpnhA',
    idle:.65,win:1.31,spin:.12,tilt:0,frontY:0,directTexture:true,basic:true
  },
  titan:{
    reference:'17-titan.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/4f3a755b-0389-43e1-b57d-877ba9eedc70.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZWEzZjg0OTgyYjFiMDE0MiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTU0NDg1Nn0.GKgg0dzITjb9C1gJHW5b3TNVLwCURDkAA5qyynVAqnA',
    idle:.66,win:1.32,spin:.11,tilt:.3,frontY:0,directTexture:true,basic:true,
    atmosphere:{color:0xffb13b,strength:.18,power:2.7,radius:1.025}
  },
  enceladus:{
    reference:'18-enceladus.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/1cdcf097-9d40-4f4c-9908-2f5fa44900c4.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiN2RlMzU2YjM2MTZhZmM2MyIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUwNjg2N30.qAX5bVvag_rpc_UVyqGvmpy7QsWjhKRl2FmBY9UJtaw',
    idle:.62,win:1.30,spin:.12,tilt:.1,frontY:0,directTexture:true,basic:true,
    atmosphere:{color:0xb8e9ff,strength:.10,power:2.9,radius:1.018}
  },
  titania:{
    reference:'19-titania.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/0ced3870-5bad-4a89-9063-3002a3edf32f.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZjZkOGI4NzM2N2RkM2QzMiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTQ5MDkzMX0.SCbAKowdiAV1x_cPTF0bTId02PQW1eLinCHAzacWnv0',
    idle:.63,win:1.30,spin:.12,tilt:.4,frontY:0,directTexture:true,basic:true
  },
  oberon:{
    reference:'20-oberon.jpg',
    texture:'https://d2jqrm6oza8nb6.cloudfront.net/datasets/cc660cc7-d782-485e-bb7e-4758f9a5f020.png?_jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXlIYXNoIjoiZGRlYjJhMWVhZmE4MDVkMiIsImJ1Y2tldCI6InJ1bndheS1kYXRhc2V0cyIsInN0YWdlIjoicHJvZCIsImV4cCI6MTc5MTUzMTY3OH0.X8rsmGCEZFDj89UQ9a9ppbxwJkOhlNyl8O6oFgnmd2s',
    idle:.63,win:1.30,spin:.12,tilt:.3,frontY:0,directTexture:true,basic:true
  },

  // Proof-only Haumea: true triaxial 3D body + dedicated ring + gallery-front texture projection.
  haumea:{
    reference:'25-haumea.jpg',
    texture:null,
    idle:.56,win:1.12,spin:.22,tilt:0,frontY:-Math.PI/2,basic:true,
    galleryProjection:{
      base:'haumea',
      cx:.505,cy:.472,
      radiusX:.405,radiusY:.292,
      angleDeg:-31,
      frontCenterU:.50,
      blendNearLimb:.20
    },
    ring:{kind:'haumea',x:-1.02,z:.54}
  }
};

// Per-object visual match controls.
// Every object is tuned independently against its card in the Planets section.
// These controls are deliberately separate from game logic so texture identity,
// silhouette, orientation and apparent size can be corrected without touching gameplay.
const VISUAL_MATCH={
  // viewerScale = close-up preview size; gameScale = normal 3-object game size.
  // frontYaw / rollDeg define the exact first-view identity from the Planets card.
  // shape is intentionally independent per object, even when spherical.
  sun:      {viewerScale:1.54,gameScale:.72,winScale:1.34,frontYaw:.15,rollDeg:7.25,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:0},toneMapped:true},
  mercury:  {viewerScale:1.50,gameScale:.62,winScale:1.34,frontYaw:.18,rollDeg:.03,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:.2},toneMapped:true},
  venus:    {viewerScale:1.54,gameScale:.68,winScale:1.36,frontYaw:-.35,rollDeg:177.4,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:.4},toneMapped:true},
  earth:    {viewerScale:1.52,gameScale:.70,winScale:1.34,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:.6},toneMapped:false},
  moon:     {viewerScale:1.52,gameScale:.62,winScale:1.33,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:.8},toneMapped:false},
  mars:     {viewerScale:1.62,gameScale:.65,winScale:1.35,frontYaw:0,rollDeg:25.19,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:1.0},toneMapped:true},
  jupiter:  {viewerScale:1.56,gameScale:.75,winScale:1.36,frontYaw:-1.45,rollDeg:3.13,shape:{x:1.00,y:.94,z:1.00,deform:0,seed:1.2},toneMapped:true},
  saturn:   {viewerScale:1.18,gameScale:.59,winScale:1.08,frontYaw:.35,rollDeg:26.73,shape:{x:1.00,y:.91,z:1.00,deform:0,seed:1.4},toneMapped:true,ring:{scale:1.02,x:-1.01,z:.31}},
  uranus:   {viewerScale:1.26,gameScale:.66,winScale:1.18,frontYaw:.15,rollDeg:-8,shape:{x:1.00,y:.98,z:1.00,deform:0,seed:1.6},toneMapped:true,ring:{scale:1.04,x:-1.06,z:.29}},
  neptune:  {viewerScale:1.52,gameScale:.69,winScale:1.34,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1.00,y:1.00,z:1.00,deform:0,seed:1.8},toneMapped:false},

  // User-supplied 2:1 maps. Their reference-matched face was generated at map center (u≈0.5).
  // Three SphereGeometry shows u≈0.25 toward the camera at zero yaw, so -90° yaw is required
  // to present the same face first. Native sRGB color is preserved: no grading, no ACES remap.
  // Mars-moon silhouettes are shaped in FINAL camera-facing coordinates, independently from texture yaw.
  // This avoids the previous bug where -90° texture alignment rotated the long axis into depth and made both bodies look round.
  phobos:   {viewerScale:1.38,gameScale:.56,winScale:1.24,frontYaw:-Math.PI/2,rollDeg:-2,shape:{kind:'phobos',x:1.18,y:.96,z:.86,deform:.125,seed:.45},toneMapped:false},
  deimos:   {viewerScale:1.34,gameScale:.54,winScale:1.20,frontYaw:-Math.PI/2,rollDeg:-3,shape:{kind:'deimos',x:1.13,y:.98,z:.91,deform:.072,seed:2.15},toneMapped:false},
  io:       {viewerScale:1.51,gameScale:.64,winScale:1.31,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:2.4},toneMapped:false},
  europa:   {viewerScale:1.49,gameScale:.64,winScale:1.31,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:2.6},toneMapped:false},
  ganymede: {viewerScale:1.50,gameScale:.66,winScale:1.32,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:2.8},toneMapped:false},
  callisto: {viewerScale:1.49,gameScale:.65,winScale:1.31,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:3.0},toneMapped:false},
  titan:    {viewerScale:1.50,gameScale:.66,winScale:1.32,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:3.2},toneMapped:false},
  enceladus:{viewerScale:1.47,gameScale:.62,winScale:1.30,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:3.4},toneMapped:false},
  titania:  {viewerScale:1.47,gameScale:.63,winScale:1.30,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:3.6},toneMapped:false},
  oberon:   {viewerScale:1.47,gameScale:.63,winScale:1.30,frontYaw:-Math.PI/2,rollDeg:0,shape:{x:1,y:1,z:1,deform:0,seed:3.8},toneMapped:false},

  // Haumea is deliberately modeled as a strongly elongated triaxial body, not a sphere.
  haumea:   {viewerScale:1.22,gameScale:.56,winScale:1.12,frontYaw:-Math.PI/2,rollDeg:31,
             shape:{kind:'haumea',x:1.56,y:.91,z:.78,deform:.020,seed:4.2},toneMapped:false,
             ring:{x:-1.02,z:.54,scale:1.00}}
};

const textureCache=new Map();
const pendingTexture=new Map();
const loader=new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');

function loadImage(url){
  return new Promise((resolve,reject)=>{
    const img=new Image();img.crossOrigin='anonymous';img.decoding='async';
    img.onload=()=>resolve(img);img.onerror=reject;img.src=url;
  });
}

function luma(r,g,b){return .299*r+.587*g+.114*b}
function contrast(v,c){return clamp((v-.5)*c+.5,0,1)}
function wrapDelta(a,b){let d=a-b;if(d>.5)d-=1;if(d<-.5)d+=1;return d}

function gradePixels(id,data,W,H){
  for(let y=0;y<H;y++){
    const v=y/(H-1),lat=Math.abs(v-.5)*2;
    for(let x=0;x<W;x++){
      const u=x/(W-1),i=(y*W+x)*4;
      let r=data[i],g=data[i+1],b=data[i+2],L=luma(r,g,b);

      if(id==='sun'){
        const n=Math.pow(contrast(L/255,1.42),1.02);
        const dark=Math.pow(1-n,2.25);
        r=(r-128)*1.18+128;g=(g-128)*1.08+128;b=(b-128)*.92+128;
        r=r*1.08+24-dark*22;g=g*.84-3-dark*21;b=b*.54-7-dark*9;
      }
      else if(id==='mercury'){
        const n=contrast(L/255,1.40);
        const detail=(L-128)*.22;
        r=58+142*n+detail*.26;
        g=55+132*n+detail*.20;
        b=54+124*n+detail*.16;
      }
      else if(id==='moon'){
        const n=contrast(L/255,1.52);
        const cool=(.5-Math.abs(v-.48))*.04;
        r=42+178*n+cool*255;
        g=46+181*n+cool*210;
        b=52+188*n+cool*185;
      }
      else if(id==='venus'){
        const n=contrast(L/255,1.16);
        const wave1=Math.sin(v*Math.PI*16+Math.sin(u*Math.PI*5)*1.15);
        const wave2=Math.sin(v*Math.PI*29-u*Math.PI*7+Math.sin(u*Math.PI*9)*.45);
        const cloud=Math.max(0,wave1*.64+wave2*.36);
        r=174+72*n+cloud*24;
        g=91+101*n+cloud*30;
        b=22+42*n+cloud*11;
      }
      else if(id==='earth'){
        const ocean=(b>r*1.08&&b>g*1.02);
        const green=(g>r*1.03&&g>b*1.05);
        const ice=(L>205&&Math.max(r,g,b)-Math.min(r,g,b)<42);
        const desert=!ocean&&!green&&!ice&&r>g*1.02&&g>b*.90;
        if(ocean){r=r*.67-3;g=g*1.17+8;b=b*1.34+18}
        else if(green){r=r*.80-2;g=g*1.34+7;b=b*.74}
        else if(desert){r=r*1.20+8;g=g*1.12+5;b=b*.77}
        else if(ice){r=r*1.06+4;g=g*1.07+5;b=b*1.10+8}
        else{r=(r-128)*1.14+128;g=(g-128)*1.14+128;b=(b-128)*1.14+128}
      }
      else if(id==='mars'){
        const c=1.28;
        r=(r-128)*c+128;g=(g-128)*c+128;b=(b-128)*c+128;
        L=luma(r,g,b);
        const sat=1.26;
        r=L+(r-L)*sat+14;
        g=(L+(g-L)*sat)*.88-2;
        b=(L+(b-L)*sat)*.78-5;
      }
      else if(id==='jupiter'){
        const c=1.24;
        r=(r-128)*c+128;g=(g-128)*c+128;b=(b-128)*c+128;
        L=luma(r,g,b);
        const sat=1.36;
        r=(L+(r-L)*sat)*1.10+8;
        g=(L+(g-L)*sat)*.98+2;
        b=(L+(b-L)*1.15)*.88;
        const band=Math.sin(v*Math.PI*26+Math.sin(u*Math.PI*4)*.35)*8;
        r+=band;g+=band*.55;b+=band*.22;
        const dx=wrapDelta(u,.60),dy=v-.57;
        const e=(dx*dx/.0075)+(dy*dy/.0020);
        const spot=Math.exp(-e*2.0);
        const rim=Math.exp(-Math.pow(Math.sqrt(e)-.70,2)/.08);
        r+=spot*92+rim*32;g-=spot*34;b-=spot*45;
      }
      else if(id==='saturn'){
        const n=contrast(L/255,1.20);
        const band=Math.sin(v*Math.PI*24+Math.sin(u*Math.PI*4)*.25);
        r=142+101*n+band*11;
        g=102+101*n+band*8;
        b=48+73*n+band*3;
      }
      else if(id==='uranus'){
        const broad=.5+.5*Math.cos((v-.5)*Math.PI);
        const w1=Math.sin(v*Math.PI*15+Math.sin(u*Math.PI*4)*1.30);
        const w2=Math.sin(v*Math.PI*27-u*Math.PI*6+Math.sin(u*Math.PI*11)*.55);
        const w3=Math.sin(v*Math.PI*43+u*Math.PI*10);
        const soft=w1*.52+w2*.30+w3*.18;
        const cloud=Math.pow(Math.max(0,soft-.10),1.50);
        const shadow=Math.max(0,-soft-.30);
        const dx=wrapDelta(u,.64),dy=v-.55;
        const rr=Math.sqrt(dx*dx/.012+dy*dy/.007);
        const ang=Math.atan2(dy/.084,dx/.118);
        const storm=Math.exp(-rr*rr)*(.45+.55*Math.sin(ang*5-rr*16));
        r=18+broad*27-lat*8;
        g=119+broad*66-lat*13;
        b=188+broad*52-lat*7;
        const white=cloud*39+Math.max(0,storm)*44;
        r+=white*.80-shadow*12;g+=white*.98-shadow*8;b+=white-shadow*2;
      }
      else if(id==='neptune'){
        const c=1.22;
        r=(r-128)*c+128;g=(g-128)*c+128;b=(b-128)*c+128;
        L=luma(r,g,b);
        const sat=1.42;
        r=(L+(r-L)*sat)*.78-4;
        g=(L+(g-L)*sat)*.93+3;
        b=(L+(b-L)*sat)*1.16+13;
        const dx=wrapDelta(u,.61),dy=v-.56;
        const storm=Math.exp(-(dx*dx/.012+dy*dy/.0045));
        r+=storm*22;g+=storm*33;b+=storm*42;
      }

      data[i]=byte(r);data[i+1]=byte(g);data[i+2]=byte(b);
    }
  }
}
function sealSeam(data,W,H,band=16){
  band=Math.max(6,Math.min(band,Math.floor(W*.025)));
  for(let y=0;y<H;y++){
    for(let k=0;k<band;k++){
      const li=(y*W+k)*4,ri=(y*W+(W-1-k))*4;
      const w=(1-k/(band-1))*.72;
      for(let c=0;c<3;c++){
        const avg=(data[li+c]+data[ri+c])*.5;
        data[li+c]=byte(mix(data[li+c],avg,w));
        data[ri+c]=byte(mix(data[ri+c],avg,w));
      }
    }
  }
}

function makeFallbackMoon(){
  const c=document.createElement('canvas');c.width=2048;c.height=1024;
  const x=c.getContext('2d',{alpha:false});
  x.fillStyle='#85898f';x.fillRect(0,0,c.width,c.height);
  let s=0x4d4f4f4e;
  const R=()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};

  // broad maria: recognizable dark lunar basins across the full globe
  for(let i=0;i<34;i++){
    const cx=R()*c.width,cy=(.18+R()*.64)*c.height,rx=85+R()*260,ry=55+R()*175;
    const g=x.createRadialGradient(cx,cy,0,cx,cy,rx);
    g.addColorStop(0,`rgba(42,47,56,${.16+R()*.20})`);
    g.addColorStop(.62,`rgba(66,72,82,${.09+R()*.10})`);
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.save();x.translate(cx,cy);x.scale(1,ry/rx);x.fillStyle=g;x.beginPath();x.arc(0,0,rx,0,Math.PI*2);x.fill();x.restore();
  }

  // high frequency mineral texture
  for(let i=0;i<18000;i++){
    const px=R()*c.width,py=R()*c.height,a=.018+R()*.050;
    const q=R()>.5?220:38;x.fillStyle=`rgba(${q},${q},${q},${a})`;
    x.fillRect(px,py,.5+R()*2,.5+R()*2);
  }

  // crater bowls + bright rims
  for(let i=0;i<1450;i++){
    const cx=R()*c.width,cy=R()*c.height;
    const rad=i<110?8+R()*54:1.2+R()*10;
    const g=x.createRadialGradient(cx-rad*.18,cy-rad*.18,rad*.03,cx,cy,rad);
    g.addColorStop(0,'rgba(30,34,40,.72)');
    g.addColorStop(.46,'rgba(63,68,76,.44)');
    g.addColorStop(.70,'rgba(212,215,219,.48)');
    g.addColorStop(.83,'rgba(118,122,128,.20)');
    g.addColorStop(1,'rgba(0,0,0,0)');
    x.fillStyle=g;x.fillRect(cx-rad*1.2,cy-rad*1.2,rad*2.4,rad*2.4);
  }
  return c;
}
function smoothstep(a,b,x){
  const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);
}
function sampleRGBA(data,W,H,x,y){
  x=clamp(x,0,W-1);y=clamp(y,0,H-1);
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(W-1,x0+1),y1=Math.min(H-1,y0+1);
  const tx=x-x0,ty=y-y0;
  const i00=(y0*W+x0)*4,i10=(y0*W+x1)*4,i01=(y1*W+x0)*4,i11=(y1*W+x1)*4;
  const out=[0,0,0,255];
  for(let c=0;c<3;c++){
    const a=data[i00+c]*(1-tx)+data[i10+c]*tx;
    const b=data[i01+c]*(1-tx)+data[i11+c]*tx;
    out[c]=a*(1-ty)+b*ty;
  }
  return out;
}
function makeHaumeaBaseTexture(){
  const c=document.createElement('canvas');c.width=2048;c.height=1024;
  const x=c.getContext('2d',{alpha:false});
  x.fillStyle='#aeb8c5';x.fillRect(0,0,c.width,c.height);

  // Broad icy latitude bands.
  for(let i=0;i<26;i++){
    const y=(i+.5)/26*c.height;
    const a=.035+(i%4)*.008;
    x.fillStyle=`rgba(235,242,248,${a})`;
    x.fillRect(0,y-18,c.width,36);
  }

  // Haumea-style reddish mineral belt with gentle waviness.
  x.save();
  x.globalCompositeOperation='source-over';
  for(let i=0;i<34;i++){
    const yy=(.43+Math.sin(i*.71)*.055)*c.height;
    const hh=(16+(i%5)*8);
    x.fillStyle=`rgba(${128+(i%4)*10},${67+(i%3)*8},${58+(i%2)*7},${.06+(i%5)*.012})`;
    x.fillRect(0,yy-hh/2,c.width,hh);
  }
  x.restore();

  // Deterministic rocky/icy mottling all around the unseen hemisphere.
  let seed=0x4841554d;
  const R=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296};
  for(let i=0;i<5200;i++){
    const px=R()*c.width,py=R()*c.height;
    const r=1+R()*8;
    const warm=R()>.82;
    x.fillStyle=warm
      ? `rgba(119,67,62,${.025+R()*.055})`
      : `rgba(245,249,252,${.018+R()*.050})`;
    x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.fill();
  }
  return c;
}

async function buildGalleryProjectedTexture(item){
  const cfg=PROFILE[item.id],gp=cfg.galleryProjection;
  const refImg=await loadImage(cfg.reference);

  const W=2048,H=1024;
  const baseCanvas=gp.base==='haumea'?makeHaumeaBaseTexture():document.createElement('canvas');
  baseCanvas.width=W;baseCanvas.height=H;
  const bx=baseCanvas.getContext('2d',{alpha:false,willReadFrequently:true});
  if(gp.base!=='haumea'){
    const baseImg=await loadImage(cfg.texture);
    bx.drawImage(baseImg,0,0,W,H);
    const tmp=bx.getImageData(0,0,W,H);
    gradePixels(item.id,tmp.data,W,H);
    bx.putImageData(tmp,0,0);
  }
  const baseIm=bx.getImageData(0,0,W,H);
  sealSeam(baseIm.data,W,H,18);

  const refCanvas=document.createElement('canvas');refCanvas.width=refImg.naturalWidth||refImg.width;refCanvas.height=refImg.naturalHeight||refImg.height;
  const rx=refCanvas.getContext('2d',{alpha:false,willReadFrequently:true});
  rx.drawImage(refImg,0,0,refCanvas.width,refCanvas.height);
  const refIm=rx.getImageData(0,0,refCanvas.width,refCanvas.height);
  const cx=gp.cx*refCanvas.width,cy=gp.cy*refCanvas.height;
  const radX=(gp.radiusX??gp.radius)*refCanvas.width;
  const radY=(gp.radiusY??gp.radius)*refCanvas.width;
  const ang=THREE.MathUtils.degToRad(gp.angleDeg||0),ca=Math.cos(ang),sa=Math.sin(ang);

  const outCanvas=document.createElement('canvas');outCanvas.width=W;outCanvas.height=H;
  const ox=outCanvas.getContext('2d',{alpha:false,willReadFrequently:true});
  const out=ox.createImageData(W,H);

  for(let y=0;y<H;y++){
    const vv=(y+.5)/H;
    const lat=(.5-vv)*Math.PI;
    const cl=Math.cos(lat),sy=Math.sin(lat);
    for(let x=0;x<W;x++){
      const uu=(x+.5)/W;
      let du=uu-gp.frontCenterU;
      du-=Math.round(du);
      const lon=du*Math.PI*2;
      const sx=cl*Math.sin(lon);
      const sz=cl*Math.cos(lon);
      const oi=(y*W+x)*4;
      const bi=oi;

      let rr=baseIm.data[bi],gg=baseIm.data[bi+1],bb=baseIm.data[bi+2];

      if(sz>0){
        const lx=radX*sx,ly=-radY*sy;
        const px=cx+lx*ca-ly*sa;
        const py=cy+lx*sa+ly*ca;
        const ref=sampleRGBA(refIm.data,refCanvas.width,refCanvas.height,px,py);

        // Exact gallery face dominates the visible hemisphere. Only the outer limb
        // crossfades into the real 360° texture so baked card-rim lighting does not
        // rotate across the globe as a fake surface feature.
        const wFront=smoothstep(.025,gp.blendNearLimb??.22,sz);
        rr=mix(rr,ref[0],wFront);gg=mix(gg,ref[1],wFront);bb=mix(bb,ref[2],wFront);
      }

      out.data[oi]=byte(rr);out.data[oi+1]=byte(gg);out.data[oi+2]=byte(bb);out.data[oi+3]=255;
    }
  }

  sealSeam(out.data,W,H,18);
  ox.putImageData(out,0,0);

  const t=new THREE.CanvasTexture(outCanvas);
  t.colorSpace=THREE.SRGBColorSpace;
  t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
  t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
  t.anisotropy=16;t.needsUpdate=true;
  return t;
}

async function processedTexture(item){
  if(textureCache.has(item.id))return textureCache.get(item.id);
  if(pendingTexture.has(item.id))return pendingTexture.get(item.id);
  const p=(async()=>{
    const cfg=PROFILE[item.id];

    if(cfg.directTexture){
      const t=await new Promise((resolve,reject)=>{
        loader.load(cfg.texture,resolve,undefined,reject);
      });
      t.colorSpace=THREE.SRGBColorSpace;
      t.wrapS=THREE.RepeatWrapping;
      t.wrapT=THREE.ClampToEdgeWrapping;
      t.minFilter=THREE.LinearMipmapLinearFilter;
      t.magFilter=THREE.LinearFilter;
      t.anisotropy=12;
      t.generateMipmaps=true;
      t.needsUpdate=true;
      textureCache.set(item.id,t);
      pendingTexture.delete(item.id);
      return t;
    }

    if(cfg.galleryProjection){
      const t=await buildGalleryProjectedTexture(item);
      textureCache.set(item.id,t);pendingTexture.delete(item.id);return t;
    }
    let canvas;
    if(item.id==='moon'){
      // Fully local procedural 2:1 globe: no external dependency, no front-image projection,
      // no tainted canvas and no fake backside.
      canvas=makeFallbackMoon();
    }else{
      canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
      const x=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
      const img=await loadImage(cfg.texture);x.drawImage(img,0,0,canvas.width,canvas.height);
    }
    const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
    const im=ctx.getImageData(0,0,canvas.width,canvas.height);
    if(!cfg.directTexture)gradePixels(item.id,im.data,canvas.width,canvas.height);
    sealSeam(im.data,canvas.width,canvas.height,16);
    ctx.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(canvas);
    t.colorSpace=THREE.SRGBColorSpace;
    t.wrapS=THREE.RepeatWrapping;t.wrapT=THREE.ClampToEdgeWrapping;
    t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;
    t.anisotropy=12;t.needsUpdate=true;
    textureCache.set(item.id,t);pendingTexture.delete(item.id);return t;
  })().catch(e=>{pendingTexture.delete(item.id);throw e});
  pendingTexture.set(item.id,p);return p;
}

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,20,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,.92)');g.addColorStop(.18,'rgba(255,235,170,.78)');
  g.addColorStop(.50,'rgba(110,160,255,.20)');g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const GLOW=glowTexture();

function haloTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;
  const x=c.getContext('2d'),g=x.createRadialGradient(128,128,46,128,128,126);
  g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.70,'rgba(255,255,255,0)');
  g.addColorStop(.80,'rgba(255,255,255,.18)');g.addColorStop(.87,'rgba(255,255,255,.92)');
  g.addColorStop(.95,'rgba(255,255,255,.16)');g.addColorStop(1,'rgba(255,255,255,0)');
  x.fillStyle=g;x.fillRect(0,0,256,256);return new THREE.CanvasTexture(c);
}
const HALO=haloTexture();

function atmosphereMesh(cfg){
  const mat=new THREE.ShaderMaterial({
    transparent:true,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending,
    uniforms:{glow:{value:new THREE.Color(cfg.color)},strength:{value:cfg.strength},rimPower:{value:cfg.power}},
    vertexShader:'varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform vec3 glow;uniform float strength;uniform float rimPower;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW);float rim=pow(1.0-max(dot(vN,V),0.0),rimPower);gl_FragColor=vec4(glow,rim*strength);}'
  });
  return new THREE.Mesh(new THREE.SphereGeometry(cfg.radius||1.03,72,48),mat);
}

function saturnRing(){
  const tex=loader.load('assets/space3d/2k_saturn_ring_alpha.png');
  tex.colorSpace=THREE.SRGBColorSpace;
  const geo=new THREE.RingGeometry(1.20,2.02,180);
  const pos=geo.attributes.position,uv=geo.attributes.uv;
  for(let i=0;i<pos.count;i++){
    const r=Math.hypot(pos.getX(i),pos.getY(i));
    uv.setXY(i,clamp((r-1.20)/(.82),0,1),.5);
  }
  const mat=new THREE.MeshBasicMaterial({map:tex,alphaMap:tex,color:0xffd77a,side:THREE.DoubleSide,transparent:true,opacity:.98,alphaTest:.014,depthWrite:true,blending:THREE.NormalBlending});
  return new THREE.Mesh(geo,mat);
}

function uranusRing(){
  const g=new THREE.Group();
  const specs=[
    [1.145,1.158,.30,0x77cae9],
    [1.185,1.198,.42,0xd2f5ff],
    [1.225,1.237,.24,0x82d9f3],
    [1.285,1.298,.38,0xe2f9ff],
    [1.355,1.368,.22,0x73c8e6]
  ];
  specs.forEach(([a,b,o,c])=>{
    const m=new THREE.Mesh(new THREE.RingGeometry(a,b,180),new THREE.MeshBasicMaterial({
      color:c,transparent:true,opacity:o,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending
    }));
    g.add(m);
  });
  return g;
}
function haumeaRing(){
  const g=new THREE.Group();
  const specs=[
    [1.18,1.205,.38,0xd8ecff],
    [1.235,1.252,.82,0xf3f8ff],
    [1.276,1.289,.34,0xaecfee]
  ];
  specs.forEach(([a,b,o,c])=>{
    const geo=new THREE.RingGeometry(a,b,240);
    const mat=new THREE.MeshBasicMaterial({
      color:c,transparent:true,opacity:o,side:THREE.DoubleSide,
      depthWrite:false,blending:THREE.AdditiveBlending
    });
    mat.toneMapped=false;
    g.add(new THREE.Mesh(geo,mat));
  });
  return g;
}

function bodyGeometry(item,cfg){
  const geo=new THREE.SphereGeometry(1,112,80);
  const match=VISUAL_MATCH[item.id]||{};
  const legacy=cfg.irregular||{};
  const shape=match.shape||{
    x:legacy.x||1,y:legacy.y||1,z:legacy.z||1,deform:legacy.amp||0
  };
  const p=geo.attributes.position,v=new THREE.Vector3();

  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i).normalize();

    // Phobos and Deimos are not spheres. Build their silhouettes from their real
    // tri-axial proportions, then add only broad asymmetry to match the gallery cards.
    if(shape.kind==='phobos' || shape.kind==='deimos' || shape.kind==='haumea'){
      const yaw=match.frontYaw??cfg.frontY??0;
      const cy=Math.cos(yaw),sy=Math.sin(yaw);
      const fx=v.x*cy+v.z*sy,fy=v.y,fz=-v.x*sy+v.z*cy;

      const ax=shape.x||1,ay=shape.y||1,az=shape.z||1;
      const q=shape.kind==='phobos'?3.05:(shape.kind==='deimos'?2.75:2.0);
      const denom=Math.pow(
        Math.pow(Math.abs(fx)/ax,q)+
        Math.pow(Math.abs(fy)/ay,q)+
        Math.pow(Math.abs(fz)/az,q),
        1/q
      );
      let r=1/Math.max(.0001,denom);
      const seed=shape.seed||0;

      if(shape.kind==='phobos' || shape.kind==='deimos'){
        const low=
          Math.sin(fx*2.20+fy*1.05+seed)*.40+
          Math.sin(fy*2.85-fz*1.65+seed*1.35)*.34+
          Math.cos(fz*2.15+fx*1.45-seed*.70)*.26;
        r*=1+(shape.deform||0)*low;

        if(shape.kind==='phobos'){
          // Large, angular potato silhouette plus a real geometric Stickney depression.
          r*=1+.080*fx-.050*fy+.055*fx*fy-.035*fy*fy*fx+.032*fx*fz;
          const cx=.48,cyf=.03,cz=.876;
          const dot=fx*cx+fy*cyf+fz*cz;
          const t=clamp((dot-.80)/.20,0,1);
          const bowl=Math.sin(t*Math.PI);
          r*=1-.105*bowl*bowl;
        }else{
          // Smoother but unmistakably irregular Deimos silhouette.
          r*=1+.050*fx-.030*fy+.030*fx*fy+.018*fz*fy;
          const cx=.34,cyf=.34,cz=.877;
          const dot=fx*cx+fy*cyf+fz*cz;
          const t=clamp((dot-.88)/.12,0,1);
          r*=1-.045*Math.sin(t*Math.PI)**2;
        }
      }else{
        // Haumea: clean triaxial ellipsoid with only very subtle large-scale relief.
        const low=Math.sin(fx*2.2+seed)*.45+Math.sin(fy*2.7-seed)*.30+Math.cos(fz*2.0+seed*.7)*.25;
        r*=1+(shape.deform||0)*low;
      }

      const sx=fx*r,syf=fy*r,sz=fz*r;
      const lx=sx*cy-sz*sy,lz=sx*sy+sz*cy;
      p.setXYZ(lx,syf,lz);
      continue;
    }

    let r=1;
    const amp=shape.deform||0;
    if(amp){
      const seed=shape.seed||0;
      const n=
        Math.sin(v.x*3.7+v.y*1.8+seed)*.40+
        Math.sin(v.y*4.9-v.z*2.6+seed*1.7)*.34+
        Math.cos(v.z*3.4+v.x*2.1-seed*.9)*.26;
      r+=amp*n;
    }
    p.setXYZ(
      v.x*r*(shape.x||1),
      v.y*r*(shape.y||1),
      v.z*r*(shape.z||1)
    );
  }
  p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingSphere();
  return geo;
}

async function buildPlanet(item){
  const cfg=PROFILE[item.id];
  const tex=await processedTexture(item);
  const root=new THREE.Group();root.userData.item=item;root.userData.pickable=true;
  const match=VISUAL_MATCH[item.id]||{};
  const geo=bodyGeometry(item,cfg);
  const mat=cfg.basic
    ? new THREE.MeshBasicMaterial({map:tex,color:0xffffff})
    : new THREE.MeshStandardMaterial({
        map:tex,color:0xffffff,roughness:cfg.roughness??.96,metalness:0,
        emissive:cfg.emissive?0xffffff:0x000000,emissiveMap:cfg.emissive?tex:null,emissiveIntensity:cfg.emissive||0
      });
  if(match.toneMapped===false)mat.toneMapped=false;
  const surface=new THREE.Mesh(geo,mat);
  surface.rotation.z=THREE.MathUtils.degToRad(match.rollDeg??cfg.tilt??0);
  surface.rotation.y=match.frontYaw??cfg.frontY??0;
  surface.userData.parentPick=root;root.add(surface);root.userData.surface=surface;

  if(cfg.clouds){
    const cloudTex=loader.load(cfg.clouds.texture);
    const clouds=new THREE.Mesh(new THREE.SphereGeometry(1.014,96,64),new THREE.MeshStandardMaterial({
      color:0xffffff,alphaMap:cloudTex,transparent:true,opacity:cfg.clouds.opacity,depthWrite:false,roughness:1,metalness:0,
      emissive:0xffffff,emissiveIntensity:.10
    }));
    clouds.rotation.copy(surface.rotation);clouds.userData.parentPick=root;root.add(clouds);root.userData.clouds=clouds;
  }
  if(cfg.atmosphere){
    const atm=atmosphereMesh(cfg.atmosphere);atm.rotation.copy(surface.rotation);root.add(atm);
  }
  if(cfg.ring){
    const ring=cfg.ring.kind==='saturn'?saturnRing():(cfg.ring.kind==='haumea'?haumeaRing():uranusRing());
    const ringMatch=match.ring||{};
    const ringX=ringMatch.x??cfg.ring.x,ringZ=ringMatch.z??cfg.ring.z;
    ring.rotation.set(ringX,0,ringZ);
    ring.scale.setScalar(ringMatch.scale??1);
    ring.userData.baseX=ringX;root.add(ring);root.userData.ring=ring;
  }
  if(cfg.glow){
    const mat=new THREE.SpriteMaterial({map:GLOW,color:cfg.glow.color,transparent:true,opacity:cfg.glow.opacity,depthWrite:false,blending:THREE.AdditiveBlending});
    mat.toneMapped=false;
    const sp=new THREE.Sprite(mat);sp.scale.set(cfg.glow.scale,cfg.glow.scale,1);root.add(sp);root.userData.sunGlow=sp;
  }

  const gameScale=match.gameScale??cfg.idle;
  const winScale=match.winScale??cfg.win;
  root.scale.setScalar(gameScale);
  root.userData.baseScale=gameScale;
  root.userData.winScale=winScale;
  root.userData.spin=cfg.spin;
  root.userData.visualMatch=match;
  return root;
}

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
renderer.domElement.className='v2-canvas';stage.insertBefore(renderer.domElement,stage.firstChild);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(47,1,.1,80);camera.position.set(0,.10,9.25);
scene.add(new THREE.HemisphereLight(0xc2d9ff,0x101426,.92));
scene.add(new THREE.AmbientLight(0x6478a6,.42));
const key=new THREE.DirectionalLight(0xffffff,3.35);key.position.set(-4.4,5.2,7);scene.add(key);
const fill=new THREE.DirectionalLight(0xc7dcff,1.72);fill.position.set(4.8,1.7,6.2);scene.add(fill);
const rim=new THREE.DirectionalLight(0x6d86ff,.78);rim.position.set(5,-2,2);scene.add(rim);

function starField(){
  const count=1600,p=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,rad=rand(8,20);
    p[i*3]=Math.cos(a)*rad;p[i*3+1]=rand(-11,11);p[i*3+2]=rand(-15,2);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const m=new THREE.PointsMaterial({color:0xe9f3ff,size:.047,transparent:true,opacity:.90,depthWrite:false,blending:THREE.AdditiveBlending});
  const pts=new THREE.Points(g,m);scene.add(pts);return pts;
}
const stars3d=starField();

function resize(){
  const w=Math.max(2,stage.clientWidth),h=Math.max(2,stage.clientHeight);
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();

const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
let groups=[],pickables=[],target=null,locked=true,transition=null,win=null,wrong=null,roundToken=0;
let last=performance.now(),recent=[];

function slots(){
  const portrait=stage.clientWidth/Math.max(1,stage.clientHeight)<.72;
  return portrait
    ? [new THREE.Vector3(0,1.20,.05),new THREE.Vector3(-.92,-1.16,.14),new THREE.Vector3(.92,-1.16,.02)]
    : [new THREE.Vector3(-1.55,.05,.06),new THREE.Vector3(0,.05,.14),new THREE.Vector3(1.55,.05,.02)];
}

function disposeGroup(g){
  scene.remove(g);
  g.traverse(o=>{
    o.geometry?.dispose?.();
    if(o.material){
      const ms=Array.isArray(o.material)?o.material:[o.material];
      ms.forEach(m=>m.dispose?.());
    }
  });
}

function clearRound(){
  groups.forEach(disposeGroup);groups=[];pickables=[];win=null;wrong=null;transition=null;
}

function setOpacity(g,a){
  a=clamp(a,0,1);g.userData.opacity=a;
  g.traverse(o=>{
    if(!o.material||o.material.isShaderMaterial)return;
    const ms=Array.isArray(o.material)?o.material:[o.material];
    ms.forEach(m=>{
      if(!m.userData.v2fade){
        m.userData.v2fade=true;m.userData.baseOpacity=Number.isFinite(m.opacity)?m.opacity:1;
        m.userData.baseTransparent=!!m.transparent;m.userData.baseDepthWrite=m.depthWrite!==false;
      }
      m.opacity=m.userData.baseOpacity*a;
      m.transparent=a<.999?true:m.userData.baseTransparent;
      m.depthWrite=a<.999?false:m.userData.baseDepthWrite;m.needsUpdate=true;
    });
  });
  g.visible=a>.005;
}

function makeHalo(g,color){
  const mat=new THREE.SpriteMaterial({map:HALO,color,transparent:true,opacity:0,depthWrite:false,depthTest:false,blending:THREE.AdditiveBlending});
  mat.toneMapped=false;
  const sp=new THREE.Sprite(mat);sp.scale.set(2.65,2.65,1);sp.renderOrder=80;g.add(sp);
  return {sprite:sp,mat};
}

function speak(text){
  try{
    if(!('speechSynthesis'in window))return;
    speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='hy-AM';u.rate=.86;u.pitch=1.02;speechSynthesis.speak(u);
  }catch{}
}

function reward(){
  stars++;localStorage.setItem(STAR_KEY,String(stars));starsEl.textContent=String(stars);
  const d=document.createElement('div');d.className='v2-reward';d.textContent='⭐ +1';stage.appendChild(d);setTimeout(()=>d.remove(),1100);
}

function nextTarget(){
  if(FOCUS_ID){
    const forced=[...PLANETS,...PROOF_ONLY].find(x=>x.id===FOCUS_ID);
    if(forced)return forced;
  }
  let pool=PLANETS.filter(x=>!recent.includes(x.id));
  if(pool.length<3)pool=PLANETS;
  const t=pool[Math.floor(Math.random()*pool.length)];
  recent=[t.id,...recent].slice(0,5);return t;
}

async function buildRound(){
  const token=++roundToken;clearRound();locked=true;stage.classList.remove('is-win');
  target=nextTarget();

  if(VIEWER_MODE){
    promptEl.textContent=target.name+' • 360° փորձնական դիտում';
    const scoreBox=scoreEl.closest('.v2-score');
    if(scoreBox)scoreBox.style.display='none';
    loadingEl.textContent='Բեռնվում է '+target.name+' 360° texture-ը…';
    loadingEl.classList.remove('hide');

    let g;
    try{g=await buildPlanet(target)}
    catch(e){
      console.error(e);
      loadingEl.textContent='Չհաջողվեց բեռնել texture-ը։ Նորից փորձում եմ…';
      if(token===roundToken)setTimeout(buildRound,700);
      return;
    }
    if(token!==roundToken){disposeGroup(g);return}

    loadingEl.classList.add('hide');
    g.userData.basePos=new THREE.Vector3(0,-.04,1.15);
    g.userData.enterPos=new THREE.Vector3(0,-.04,.10);
    g.userData.viewerScale=(VISUAL_MATCH[target.id]?.viewerScale)||1.62;
    g.userData.enterScale=new THREE.Vector3(1,1,1).multiplyScalar(.92);
    g.position.copy(g.userData.enterPos);
    g.scale.copy(g.userData.enterScale);
    setOpacity(g,0);
    scene.add(g);
    groups.push(g);
    transition={type:'viewer-enter',start:performance.now(),duration:850};
    return;
  }

  const decoys=shuffle(PLANETS.filter(x=>x.id!==target.id)).slice(0,2);
  const options=shuffle([target,...decoys]),spot=shuffle(slots());
  promptEl.textContent='Գտի՛ր՝ '+target.find;
  loadingEl.classList.remove('hide');
  let built;
  try{built=await Promise.all(options.map(buildPlanet))}
  catch(e){
    console.error(e);loadingEl.textContent='Չհաջողվեց բեռնել texture-ը։ Նորից փորձում եմ…';
    if(token===roundToken)setTimeout(buildRound,700);return;
  }
  if(token!==roundToken){built.forEach(disposeGroup);return}
  loadingEl.classList.add('hide');

  const now=performance.now();
  built.forEach((g,i)=>{
    g.userData.basePos=spot[i].clone();g.position.copy(spot[i]);
    g.userData.enterPos=spot[i].clone().add(new THREE.Vector3(spot[i].x===0?0:Math.sign(spot[i].x)*.22,spot[i].y>0?.16:-.12,-.90));
    g.userData.enterScale=g.scale.clone().multiplyScalar(.64);
    g.position.copy(g.userData.enterPos);g.scale.copy(g.userData.enterScale);setOpacity(g,0);
    scene.add(g);groups.push(g);pickables.push(g.userData.surface);
  });
  transition={type:'enter',start:now,duration:760};
}

function easeOut(q){q=clamp(q,0,1);return 1-Math.pow(1-q,3)}
function easeInOut(q){q=clamp(q,0,1);return q<.5?4*q*q*q:1-Math.pow(-2*q+2,3)/2}

function beginExit(){
  if(transition?.type==='exit')return;
  const now=performance.now();locked=true;stage.classList.remove('is-win');
  groups.forEach((g,i)=>{
    g.userData.exitPos=g.position.clone();g.userData.exitScale=g.scale.clone();g.userData.exitOpacity=g.userData.opacity??1;
    const dir=Math.sign(g.position.x||((i-1)||1));
    g.userData.exitTo=g.position.clone().add(new THREE.Vector3(dir*.42,(i-1)*.05,-1.05));
    g.userData.exitToScale=g.scale.clone().multiplyScalar(.70);
  });
  transition={type:'exit',start:now,duration:650};
}

function choose(g){
  if(locked||transition)return;
  if(g.userData.item.id!==target.id){
    if(wrong?.halo){wrong.halo.sprite.removeFromParent();wrong.halo.mat.dispose()}
    wrong={g,start:performance.now(),origin:g.position.clone(),halo:makeHalo(g,0xff4054)};
    return;
  }

  locked=true;score++;scoreEl.textContent=String(score);
  promptEl.textContent='Ճիշտ է՝ '+g.userData.item.name;stage.classList.add('is-win');
  speak(g.userData.item.name);
  if(score%5===0)reward();

  const now=performance.now();
  groups.forEach((x,i)=>{
    x.userData.win=x===g;x.userData.winFromPos=x.position.clone();x.userData.winFromScale=x.scale.clone();x.userData.winFromOpacity=x.userData.opacity??1;
    if(x===g){
      x.userData.winToPos=new THREE.Vector3(0,.02,1.48);
      x.userData.winToScale=new THREE.Vector3(1,1,1).multiplyScalar(x.userData.winScale);
      x.userData.winHalo=makeHalo(x,0x4df37b);
    }else{
      const dir=Math.sign(x.position.x||((i-1)||1));
      x.userData.winToPos=x.position.clone().add(new THREE.Vector3(dir*.50,0,-.76));
      x.userData.winToScale=x.scale.clone().multiplyScalar(.72);
    }
  });
  win={start:now,g};
  setTimeout(()=>{if(win?.g===g)beginExit()},1850);
}

renderer.domElement.addEventListener('pointerup',e=>{
  if(VIEWER_MODE)return;
  if(locked||transition)return;
  const r=renderer.domElement.getBoundingClientRect();
  mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;
  ray.setFromCamera(mouse,camera);
  const hit=ray.intersectObjects(pickables,false)[0];if(!hit)return;
  let g=hit.object.userData.parentPick;while(g&&!g.userData.pickable)g=g.parent;
  if(g)choose(g);
});

function loop(t){
  const dt=Math.min(.04,(t-last)/1000);last=t;
  stars3d.rotation.y+=dt*.002;
  camera.position.x=Math.sin(t*.00017)*.028;
  camera.position.y=.10+Math.cos(t*.00015)*.020;
  const targetCameraZ=VIEWER_MODE?8.05:((win&&!transition)?8.55:9.25);
  camera.position.z+=(targetCameraZ-camera.position.z)*.045;
  camera.lookAt(0,VIEWER_MODE?-.04:-.06,0);

  let enterDone=true,exitDone=true;
  groups.forEach((g,i)=>{
    const cfg=PROFILE[g.userData.item.id];
    if(g.userData.surface)g.userData.surface.rotation.y+=dt*(VIEWER_MODE?.20:cfg.spin*(g.userData.win?2.0:1));
    if(g.userData.clouds)g.userData.clouds.rotation.y+=dt*cfg.clouds.spin;

    if(wrong?.g===g){
      const q=(t-wrong.start)/620;
      if(q<1){
        const e=easeOut(q);g.position.x=wrong.origin.x+Math.sin(q*Math.PI*4.5)*(1-e)*.13;
        const pulse=Math.max(0,Math.sin(Math.PI*q));wrong.halo.mat.opacity=.42*pulse;
      }else{
        g.position.copy(wrong.origin);wrong.halo.sprite.removeFromParent();wrong.halo.mat.dispose();wrong=null;
      }
    }

    if(transition?.type==='viewer-enter'){
      const q=clamp((t-transition.start)/transition.duration,0,1),e=easeOut(q);
      g.position.lerpVectors(g.userData.enterPos,g.userData.basePos,e);
      const final=new THREE.Vector3(1,1,1).multiplyScalar(g.userData.viewerScale||1.62);
      g.scale.lerpVectors(g.userData.enterScale,final,e);
      setOpacity(g,e);
      if(q<1)enterDone=false;
    }else if(transition?.type==='enter'){
      const stagger=i*60,q=clamp((t-transition.start-stagger)/(transition.duration-stagger),0,1),e=easeOut(q);
      g.position.lerpVectors(g.userData.enterPos,g.userData.basePos,e);
      const final=new THREE.Vector3(1,1,1).multiplyScalar(g.userData.baseScale);
      g.scale.lerpVectors(g.userData.enterScale,final,e);setOpacity(g,e);
      if(q<1)enterDone=false;
    }else if(transition?.type==='exit'){
      const q=clamp((t-transition.start)/transition.duration,0,1),e=easeInOut(q);
      g.position.lerpVectors(g.userData.exitPos,g.userData.exitTo,e);
      g.scale.lerpVectors(g.userData.exitScale,g.userData.exitToScale,e);setOpacity(g,g.userData.exitOpacity*(1-e));
      if(q<1)exitDone=false;
    }else if(win){
      const q=clamp((t-win.start)/820,0,1),e=easeOut(q);
      g.position.lerpVectors(g.userData.winFromPos,g.userData.winToPos,e);
      g.scale.lerpVectors(g.userData.winFromScale,g.userData.winToScale,e);
      if(g.userData.win){
        const h=g.userData.winHalo;
        if(h){const flash=q<1?Math.sin(Math.PI*q):0;h.mat.opacity=.28*flash}
      }else setOpacity(g,1-e*.72);
    }
  });

  if(transition?.type==='viewer-enter'&&enterDone){transition=null;locked=true}
  if(transition?.type==='enter'&&enterDone){transition=null;locked=false}
  if(transition?.type==='exit'&&exitDone){transition=null;win=null;buildRound()}
  renderer.render(scene,camera);requestAnimationFrame(loop);
}

buildRound();
requestAnimationFrame(loop);
