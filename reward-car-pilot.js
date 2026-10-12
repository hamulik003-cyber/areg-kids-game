// V291 illustrated mini-film prototype: same exact original car emoji before, during,
// and after a whimsical parallax road. No 3D model swap, no state/wallet writes.
let active=false;
const CSS="\n.areg-car-pilot{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;isolation:isolate;touch-action:none}\n.areg-car-pilot *{box-sizing:border-box}\n.areg-car-pilot-shade{position:absolute;inset:0;background:rgba(18,19,43,.77);backdrop-filter:blur(5px);opacity:0;transition:opacity .65s ease}\n.areg-car-pilot[data-visible=\"1\"] .areg-car-pilot-shade{opacity:1}\n.areg-car-pilot[data-leaving=\"1\"] .areg-car-pilot-shade{opacity:0}\n.areg-car-pilot-card{position:relative;overflow:hidden;width:min(90vw,510px);height:min(57dvh,430px);min-height:270px;border:5px solid #f5d795;border-radius:30px;background:radial-gradient(ellipse at 50% 35%,#dfbd88 0%,#706f9d 44%,#343361 100%);box-shadow:0 24px 75px #060b2b8c,inset 0 0 0 2px #fff6d042;transform-origin:50% 50%;will-change:transform;contain:layout paint}\n.areg-car-pilot-stage{position:absolute;inset:0 0 58px;overflow:hidden;isolation:isolate}\n.areg-car-pilot-world{position:absolute;inset:0;opacity:0;transform:scale(1.06);transition:opacity .95s ease,transform 1.35s cubic-bezier(.24,.64,.2,1);background:linear-gradient(180deg,#91c7d7 0%,#cee4da 48%,#ecdda8 78%,#9ab58b 100%)}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-world{opacity:1;transform:scale(1)}\n.areg-car-pilot-sun{position:absolute;right:15%;top:12%;width:64px;height:64px;border-radius:50%;background:#ffe5a9;box-shadow:0 0 0 18px #fff2bd32,0 0 0 42px #fff2c51c,0 0 55px #ffe0a4ac}\n.areg-car-pilot-clouds{position:absolute;inset:2% 0 30%;height:65%;width:100%;opacity:.8;animation:areg-clouds 13s linear infinite alternate}\n.areg-car-pilot-hills{position:absolute;bottom:18%;left:0;right:0;height:53%}\n.areg-car-pilot-trees{position:absolute;bottom:22%;left:0;width:200%;height:35%;display:flex;will-change:transform}\n.areg-car-pilot-trees svg{height:100%;width:50%;flex:none}\n.areg-car-pilot-flowers{position:absolute;bottom:23%;left:0;width:200%;height:11%;display:flex;will-change:transform}\n.areg-car-pilot-flowers svg{height:100%;width:50%;flex:none}\n.areg-car-pilot-road{position:absolute;left:0;right:0;top:72%;height:30%;background:linear-gradient(#d7b695 0 5%,#747d87 7%,#596372 80%,#545b69 100%);box-shadow:0 -4px 0 #ffffff8a,0 -13px 18px #5f876440}\n.areg-car-pilot-road:before{content:\"\";position:absolute;top:10%;left:0;right:0;height:2px;background:#ffffff38}\n.areg-car-pilot-road:after{content:\"\";position:absolute;bottom:25%;left:0;right:0;height:5px;background:repeating-linear-gradient(90deg,transparent 0 24px,#f7dfa8 24px 73px,transparent 73px 135px);background-size:135px 5px}\n.areg-car-pilot-light{position:absolute;inset:0;background:linear-gradient(120deg,#ffe5aa34,transparent 35%,transparent 73%,#88b3c922)}\n.areg-car-pilot-shadow{position:absolute;left:50%;top:73%;width:44%;height:7%;transform:translateX(-50%);background:#202d3b77;filter:blur(12px);border-radius:50%;opacity:0;transition:opacity .95s ease}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-shadow{opacity:.56}\n\n.areg-car-pilot-hero{position:absolute;z-index:2;left:50%;width:min(77%,350px);aspect-ratio:560/330;top:27%;transform:translateX(-50%);transform-origin:50% 78%;filter:drop-shadow(0 11px 9px #27375046);will-change:transform;pointer-events:none}\n.areg-car-pilot-hero img,.areg-car-pilot-hero svg{display:block;width:100%;height:100%;overflow:visible}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-wheel > g{animation:areg-wheel-turn .44s linear infinite;transform-box:fill-box;transform-origin:center}\n@keyframes areg-wheel-turn{to{transform:rotate(360deg)}}\n.areg-car-pilot-puff{position:absolute;z-index:1;left:25%;top:66%;width:13px;height:13px;border-radius:50%;background:#f0e2cfcc;filter:blur(1px);opacity:0}\n.areg-car-pilot-puff.p2{top:70%;left:19%;width:17px;height:17px}\n.areg-car-pilot-puff.p3{top:65%;left:16%;width:9px;height:9px}\n.areg-car-pilot-bloom{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,#fff0b53a,transparent 54%);transition:opacity 1s ease}\n.areg-car-pilot-title{position:absolute;left:0;right:0;bottom:0;height:58px;background:linear-gradient(#ffe0a7,#dea365);border-top:3px solid #b5814d;display:flex;align-items:center;justify-content:center;color:#61371d;font-size:26px;font-weight:900;text-shadow:0 1px #fff3d3}\n.areg-car-pilot-exit{position:absolute;z-index:5;top:12px;right:12px;display:grid;place-items:center;width:44px;height:44px;border:2px solid #fff4ca;border-radius:50%;background:#4c392fdc;color:white;font-size:28px;cursor:pointer}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-trees{animation:areg-forest 3.6s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-flowers{animation:areg-forest 1.8s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-road:after{animation:areg-road .49s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff{animation:areg-puff 1.05s ease-out infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff.p2{animation-delay:-.42s}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff.p3{animation-delay:-.76s}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-bloom{opacity:.7}\n@keyframes areg-forest{to{transform:translateX(-50%)}}\n@keyframes areg-road{to{background-position:-135px 0}}\n@keyframes areg-clouds{to{transform:translateX(-22px)}}\n@keyframes areg-puff{0%{transform:translate(22px,4px) scale(.1);opacity:0}22%{opacity:.8}100%{transform:translate(-85px,-20px) scale(3);opacity:0}}\n@media(prefers-reduced-motion:reduce){.areg-car-pilot *{animation-duration:.01ms!important;transition-duration:.01ms!important}}\n\n.areg-car-pilot-world{transition:opacity .8s ease,transform 1.2s cubic-bezier(.2,.68,.29,1)}\n.areg-car-pilot-road:after{bottom:23%;height:4px;background:repeating-linear-gradient(90deg,transparent 0 18px,#ffe3ad 18px 72px,transparent 72px 147px);background-size:147px 4px}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-road:after{animation:areg-road-2 .43s linear infinite}\n@keyframes areg-road-2{to{background-position:-147px 0}}\n";
const CLOUDS="<svg viewBox=\"0 0 700 210\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><g fill=\"#fffaf0\" opacity=\".93\"><ellipse cx=\"100\" cy=\"65\" rx=\"55\" ry=\"19\"/><circle cx=\"87\" cy=\"50\" r=\"23\"/><circle cx=\"122\" cy=\"49\" r=\"27\"/><ellipse cx=\"560\" cy=\"99\" rx=\"72\" ry=\"23\"/><circle cx=\"545\" cy=\"79\" r=\"28\"/><circle cx=\"585\" cy=\"76\" r=\"34\"/><ellipse cx=\"336\" cy=\"33\" rx=\"40\" ry=\"15\"/></g></svg>",HILLS="<svg viewBox=\"0 0 720 250\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path fill=\"#adc4a5\" d=\"M0 160Q95 54 230 146T510 128Q622 61 720 138V250H0Z\"/><path fill=\"#8cae98\" d=\"M0 196Q125 118 246 190T520 167Q632 99 720 183V250H0Z\"/><path fill=\"#80a989\" d=\"M0 217Q160 176 282 218T525 196Q652 163 720 213V250H0Z\"/></svg>",TREES="<svg viewBox=\"0 0 840 185\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><g><g transform=\"translate(55 0)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#9e7758\"/><ellipse cx=\"0\" cy=\"97\" rx=\"50\" ry=\"64\" fill=\"#5d9a78\"/><ellipse cx=\"-19\" cy=\"85\" rx=\"28\" ry=\"40\" fill=\"#83b78d\"/><ellipse cx=\"22\" cy=\"101\" rx=\"27\" ry=\"45\" fill=\"#4d8c70\"/></g><g transform=\"translate(250 25) scale(.8)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#95684f\"/><ellipse cy=\"97\" rx=\"53\" ry=\"67\" fill=\"#73a18f\"/><ellipse cx=\"-20\" cy=\"85\" rx=\"28\" ry=\"41\" fill=\"#92c09b\"/><ellipse cx=\"21\" cy=\"101\" rx=\"25\" ry=\"46\" fill=\"#578e7a\"/></g><g transform=\"translate(452 4) scale(1)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#9d7551\"/><ellipse cy=\"97\" rx=\"51\" ry=\"66\" fill=\"#649b73\"/><ellipse cx=\"-19\" cy=\"84\" rx=\"29\" ry=\"41\" fill=\"#8eb889\"/><ellipse cx=\"23\" cy=\"103\" rx=\"26\" ry=\"45\" fill=\"#528d71\"/></g><g transform=\"translate(682 20) scale(.85)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#966b52\"/><ellipse cy=\"97\" rx=\"52\" ry=\"65\" fill=\"#669a88\"/><ellipse cx=\"-19\" cy=\"84\" rx=\"28\" ry=\"40\" fill=\"#90b8a3\"/><ellipse cx=\"22\" cy=\"101\" rx=\"26\" ry=\"45\" fill=\"#4e8c7b\"/></g></g></svg>",FLOWERS="<svg viewBox=\"0 0 720 60\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path fill=\"#719d78\" d=\"M0 51Q130 36 265 49T530 46Q650 37 720 50V60H0Z\"/><g stroke=\"#517f65\" stroke-width=\"3\"><path d=\"M85 51V21M169 52V34M285 51V28M395 52V17M505 52V32M633 50V25\"/></g><g fill=\"#f6c2b6\"><circle cx=\"85\" cy=\"20\" r=\"7\"/><circle cx=\"285\" cy=\"27\" r=\"8\"/><circle cx=\"633\" cy=\"25\" r=\"8\"/></g><g fill=\"#f5e7b2\"><circle cx=\"169\" cy=\"33\" r=\"6\"/><circle cx=\"395\" cy=\"16\" r=\"8\"/><circle cx=\"505\" cy=\"32\" r=\"7\"/></g></svg>";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const wait=(ms,signal)=>new Promise(resolve=>{
  if(signal.aborted)return resolve();
  const t=setTimeout(done,ms);
  function done(){clearTimeout(t);signal.removeEventListener('abort',done);resolve()}
  signal.addEventListener('abort',done,{once:true});
});
async function flight(card,frames,duration,reduced){
 if(reduced||typeof card.animate!=='function')return;
 try{await card.animate(frames,{duration,easing:'cubic-bezier(.22,.3,.27,1)',fill:'forwards'}).finished}catch{}
}
export async function playCarReward(sourceCard){
 if(active||!sourceCard?.isConnected||!sourceCard.classList.contains('is-unlocked'))return;
 active=true;
 const oldFocus=document.activeElement;
 if(!document.getElementById('areg-car-pilot-style')){
  const style=document.createElement('style');style.id='areg-car-pilot-style';style.textContent=CSS;document.head.append(style);
 }
 const heroSource=sourceCard.querySelector('.magic-picture img');
 const heroSrc=heroSource?.getAttribute('src')||'./reward-car-art.svg';
 const name=sourceCard.querySelector('.magic-name')?.textContent?.trim()||'Մեքենա';
 const overlay=document.createElement('div');overlay.className='areg-car-pilot';
 overlay.innerHTML='<div class="areg-car-pilot-shade"></div><div class="areg-car-pilot-card" role="dialog" aria-modal="true" aria-label="Կենդանացող մեքենայի փոքրիկ մուլտֆիլմ"><div class="areg-car-pilot-stage"><div class="areg-car-pilot-world"><div class="areg-car-pilot-sun"></div><div class="areg-car-pilot-clouds"></div><div class="areg-car-pilot-hills"></div><div class="areg-car-pilot-trees"></div><div class="areg-car-pilot-flowers"></div><div class="areg-car-pilot-road"></div><div class="areg-car-pilot-light"></div></div><div class="areg-car-pilot-shadow"></div><div class="areg-car-pilot-hero" aria-hidden="true"><img src="./reward-car-art.svg" alt=""></div><i class="areg-car-pilot-puff p1"></i><i class="areg-car-pilot-puff p2"></i><i class="areg-car-pilot-puff p3"></i><div class="areg-car-pilot-bloom"></div></div><div class="areg-car-pilot-title"></div><button type="button" class="areg-car-pilot-exit" aria-label="Փակել">×</button></div>';
 const get=selector=>overlay.querySelector(selector);
 const stage=get('.areg-car-pilot-stage');
 const movingCar=get('.areg-car-pilot-hero');
 movingCar.querySelector('img').src=new URL(heroSrc,document.baseURI).href;
 get('.areg-car-pilot-title').textContent=name;
 get('.areg-car-pilot-clouds').innerHTML=CLOUDS;
 get('.areg-car-pilot-hills').innerHTML=HILLS;
 get('.areg-car-pilot-trees').innerHTML=TREES+TREES;
 get('.areg-car-pilot-flowers').innerHTML=FLOWERS+FLOWERS;
 document.body.append(overlay);
 const card=get('.areg-car-pilot-card'),from=sourceCard.getBoundingClientRect(),to=card.getBoundingClientRect();
 const placeCar=()=>{
  const w=movingCar.getBoundingClientRect().width;
  const y=stage.clientHeight*.725-w*330/560*.754;
  movingCar.style.top=Math.round(y)+'px';
  get('.areg-car-pilot-shadow').style.top=Math.round(stage.clientHeight*.735)+'px';
 };
 placeCar();window.addEventListener('resize',placeCar);
 const entry='translate3d('+(from.left+from.width/2-to.left-to.width/2)+'px,'+(from.top+from.height/2-to.top-to.height/2)+'px,0) scale('+(from.width/to.width)+','+(from.height/to.height)+')';
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 const controller=new AbortController();
 let closing=false;
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();void close()}};
 async function close(){
  if(closing)return;
  closing=true;controller.abort();document.removeEventListener('keydown',onKey);window.removeEventListener('resize',placeCar);
  stage.dataset.live='0';overlay.dataset.leaving='1';
  await sleep(reduced?1:810);
  await flight(card,[{transform:'none',opacity:1},{transform:entry,opacity:1}],690,reduced);
  overlay.remove();active=false;
  if(oldFocus?.isConnected)oldFocus.focus({preventScroll:true});
 }
 get('.areg-car-pilot-exit').addEventListener('click',()=>void close());
 get('.areg-car-pilot-shade').addEventListener('click',()=>void close());
 document.addEventListener('keydown',onKey);
 stage.dataset.sceneMode='illustrated';
 overlay.dataset.visible='1';
 try{
  const spriteLoading=fetch(new URL(heroSrc,document.baseURI)).then(r=>{if(!r.ok)throw Error('sprite '+r.status);return r.text()}).then(svg=>{
    const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
    const artwork=doc.documentElement;
    if(artwork.tagName.toLowerCase()!=='svg'||doc.querySelector('parsererror'))throw Error('invalid SVG');
    return artwork;
  }).catch(error=>{console.warn('Car art fallback (wheels static):',error);return null});
  await flight(card,[{transform:entry,opacity:1},{transform:'none',opacity:1}],740,reduced);
  if(closing)return;
  const artwork=await spriteLoading;
  if(closing)return;
  if(artwork){movingCar.replaceChildren(document.importNode(artwork,true));stage.dataset.wheels='rotatable'}
  else stage.dataset.wheels='static-fallback';
  placeCar();
  get('.areg-car-pilot-exit').focus({preventScroll:true});
  // Countdown begins at the FIRST animation frame of physical car motion.
  // Entry flight, asset load, and exit flight are deliberately OUTSIDE 5 seconds.
  await new Promise(requestAnimationFrame);
  if(closing)return;
  const startedAt=performance.now();
  stage.dataset.actionStartedAt=String(startedAt);
  stage.dataset.actionMs='0';
  stage.dataset.live='1';
  const ride=movingCar.animate([
    {offset:0,transform:'translateX(-50%) translate3d(0,0,0) rotate(0deg) scale(1)'},
    {offset:.13,transform:'translateX(-50%) translate3d(21px,-2px,0) rotate(.7deg) scale(1.025)'},
    {offset:.32,transform:'translateX(-50%) translate3d(34px,0px,0) rotate(1.0deg) scale(1.06)'},
    {offset:.52,transform:'translateX(-50%) translate3d(10px,-3px,0) rotate(-.6deg) scale(1.095)'},
    {offset:.73,transform:'translateX(-50%) translate3d(-25px,0px,0) rotate(.45deg) scale(1.035)'},
    {offset:.88,transform:'translateX(-50%) translate3d(-12px,-1px,0) rotate(0deg) scale(1.018)'},
    {offset:1,transform:'translateX(-50%) translate3d(0,0,0) rotate(0deg) scale(1)'}
  ],{duration:5000,easing:'linear',fill:'forwards'});
  await Promise.race([ride.finished.catch(()=>{}),new Promise(done=>controller.signal.addEventListener('abort',done,{once:true}))]);
  stage.dataset.actionMs=String(Math.round(performance.now()-startedAt));
  ride.cancel();
  if(!closing)await close();
 }catch(error){console.warn('Animated reward scene:',error);if(!closing)await close()}
 finally{if(!closing)await close()}
}
