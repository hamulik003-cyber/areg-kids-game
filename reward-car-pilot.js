// V291 illustrated mini-film prototype: same exact original car emoji before, during,
// and after a whimsical parallax road. No 3D model swap, no state/wallet writes.
let active=false;
const CSS="\n.areg-car-pilot{position:fixed;inset:0;z-index:2147482000;display:grid;place-items:center;isolation:isolate;touch-action:none}\n.areg-car-pilot *{box-sizing:border-box}\n.areg-car-pilot-shade{position:absolute;inset:0;background:rgba(18,19,43,.77);backdrop-filter:blur(5px);opacity:0;transition:opacity .65s ease}\n.areg-car-pilot[data-visible=\"1\"] .areg-car-pilot-shade{opacity:1}\n.areg-car-pilot[data-leaving=\"1\"] .areg-car-pilot-shade{opacity:0}\n.areg-car-pilot-card{position:relative;overflow:hidden;width:min(90vw,510px);height:min(57dvh,430px);min-height:270px;border:5px solid #f5d795;border-radius:30px;background:radial-gradient(ellipse at 50% 35%,#dfbd88 0%,#706f9d 44%,#343361 100%);box-shadow:0 24px 75px #060b2b8c,inset 0 0 0 2px #fff6d042;transform-origin:50% 50%;will-change:transform;contain:layout paint}\n.areg-car-pilot-stage{position:absolute;inset:0 0 58px;overflow:hidden;isolation:isolate}\n.areg-car-pilot-world{position:absolute;inset:0;opacity:0;transform:scale(1.06);transition:opacity .95s ease,transform 1.35s cubic-bezier(.24,.64,.2,1);background:linear-gradient(180deg,#65bdf7 0%,#a7e9f7 48%,#ffdea3 78%,#85cf86 100%)}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-world{opacity:1;transform:scale(1)}\n.areg-car-pilot-sun{position:absolute;right:15%;top:12%;width:64px;height:64px;border-radius:50%;background:#fff0a8;box-shadow:0 0 0 18px #fff3ad61,0 0 0 43px #ffeb9a40,0 0 70px #fff2a9}\n.areg-car-pilot-clouds{position:absolute;inset:2% 0 30%;height:65%;width:100%;opacity:.8;animation:areg-clouds 13s linear infinite alternate}\n.areg-car-pilot-hills{position:absolute;bottom:18%;left:0;right:0;height:53%}\n.areg-car-pilot-trees{position:absolute;bottom:22%;left:0;width:200%;height:35%;display:flex;will-change:transform}\n.areg-car-pilot-trees svg{height:100%;width:50%;flex:none}\n.areg-car-pilot-flowers{position:absolute;bottom:23%;left:0;width:200%;height:11%;display:flex;will-change:transform}\n.areg-car-pilot-flowers svg{height:100%;width:50%;flex:none}\n.areg-car-pilot-road{position:absolute;left:0;right:0;top:72%;height:30%;background:linear-gradient(#f9c38f 0 5%,#7a88a2 7%,#52698b 80%,#344b71 100%);box-shadow:0 -4px 0 #ffffff8a,0 -13px 18px #5f876440}\n.areg-car-pilot-road:before{content:\"\";position:absolute;top:10%;left:0;right:0;height:2px;background:#ffffff38}\n.areg-car-pilot-road:after{content:\"\";position:absolute;bottom:25%;left:0;right:0;height:5px;background:repeating-linear-gradient(90deg,transparent 0 24px,#f7dfa8 24px 73px,transparent 73px 135px);background-size:135px 5px}\n.areg-car-pilot-light{position:absolute;inset:0;background:linear-gradient(120deg,#fff4c257,transparent 35%,transparent 73%,#65c6ed39)}\n.areg-car-pilot-shadow{position:absolute;left:50%;top:73%;width:44%;height:7%;transform:translateX(-50%);background:#202d3b77;filter:blur(12px);border-radius:50%;opacity:0;transition:opacity .95s ease}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-shadow{opacity:.56}\n\n.areg-car-pilot-hero{transition:opacity .5s ease;position:absolute;z-index:2;left:50%;width:min(77%,350px);aspect-ratio:560/330;top:27%;transform:translateX(-50%);transform-origin:50% 78%;filter:drop-shadow(0 12px 8px #172a4973) drop-shadow(0 1px 1px #ffefa9ab);will-change:transform;pointer-events:none}\n.areg-car-pilot-hero img,.areg-car-pilot-hero svg{display:block;width:100%;height:100%;overflow:visible}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-wheel > g{animation:areg-wheel-turn .44s linear infinite;transform-box:fill-box;transform-origin:center}\n@keyframes areg-wheel-turn{to{transform:rotate(-360deg)}}\n.areg-car-pilot-puff{position:absolute;z-index:1;left:74%;top:66%;width:13px;height:13px;border-radius:50%;background:#f0e2cfcc;filter:blur(1px);opacity:0}\n.areg-car-pilot-puff.p2{top:70%;left:79%;width:17px;height:17px}\n.areg-car-pilot-puff.p3{top:65%;left:83%;width:9px;height:9px}\n.areg-car-pilot-bloom{position:absolute;inset:0;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,#fff0b53a,transparent 54%);transition:opacity 1s ease}\n.areg-car-pilot-title{position:absolute;left:0;right:0;bottom:0;height:58px;background:linear-gradient(#ffe0a7,#dea365);border-top:3px solid #b5814d;display:flex;align-items:center;justify-content:center;color:#61371d;font-size:26px;font-weight:900;text-shadow:0 1px #fff3d3}\n.areg-car-pilot-exit{position:absolute;z-index:5;top:12px;right:12px;display:grid;place-items:center;width:44px;height:44px;border:2px solid #fff4ca;border-radius:50%;background:#4c392fdc;color:white;font-size:28px;cursor:pointer}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-trees{animation:areg-forest-left 3.6s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-flowers{animation:areg-forest-left 1.8s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-road:after{animation:areg-road .49s linear infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff{animation:areg-puff 1.05s ease-out infinite}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff.p2{animation-delay:-.42s}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-puff.p3{animation-delay:-.76s}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-bloom{opacity:.7}\n@keyframes areg-forest{to{transform:translateX(-50%)}}\n@keyframes areg-road{to{background-position:-135px 0}}\n@keyframes areg-clouds{to{transform:translateX(-22px)}}\n@keyframes areg-puff{0%{transform:translate(-22px,4px) scale(.1);opacity:0}22%{opacity:.8}100%{transform:translate(85px,-20px) scale(3);opacity:0}}\n@media(prefers-reduced-motion:reduce){.areg-car-pilot *{animation-duration:.01ms!important;transition-duration:.01ms!important}}\n\n.areg-car-pilot-world{transition:opacity .8s ease,transform 1.2s cubic-bezier(.2,.68,.29,1)}\n.areg-car-pilot-road:after{bottom:23%;height:4px;background:repeating-linear-gradient(90deg,transparent 0 18px,#ffe3ad 18px 72px,transparent 72px 147px);background-size:147px 4px}\n.areg-car-pilot-stage[data-live=\"1\"] .areg-car-pilot-road:after{animation:areg-road-2 .43s linear infinite}\n@keyframes areg-road-2{to{background-position:147px 0}}\n\n.areg-car-pilot-card{border-color:#ffe6a9;box-shadow:0 26px 73px #090c3199,inset 0 0 0 2px #fff7d279}\n.areg-car-pilot-hills{filter:drop-shadow(0 -3px 5px #25896f5a)}\n.areg-car-pilot-trees{filter:drop-shadow(0 5px 4px #2256435c)}\n.areg-car-pilot-world:after{content:\"\";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 43%,transparent 35%,#3452a820 100%)}\n@keyframes areg-forest-left{from{transform:translateX(-50%)}to{transform:translateX(0)}}\n\n/* NO-CLONE TRANSITION: the real reward-card button is the only visible card,\n   and its original graphic is the only visible car for the entire sequence. */\n.areg-car-pilot .areg-car-pilot-surface{\n  position:absolute!important;left:0;top:0;z-index:2;\n  margin:0!important;max-width:none!important;max-height:none!important;\n  transform-origin:0 0!important;will-change:transform;overflow:hidden;\n  isolation:isolate;touch-action:none;cursor:default;\n}\n.areg-car-pilot-surface .areg-car-pilot-stage{\n  position:absolute;inset:0;z-index:0;opacity:0;\n  pointer-events:none;transition:opacity .62s ease;\n  border-radius:inherit;overflow:hidden;\n}\n.areg-car-pilot-surface .areg-car-pilot-stage[data-live=\"1\"]{opacity:1}\n.areg-car-pilot-surface .magic-picture{\n  z-index:2;position:relative;display:inline-block;\n  transform-origin:50% 75%;will-change:transform;\n}\n.areg-car-pilot-surface .magic-picture>svg{\n  width:100%;height:100%;display:block;overflow:visible;\n}\n.areg-car-pilot-surface .magic-name,\n.areg-car-pilot-surface .magic-card-label{z-index:3}\n.areg-car-pilot-surface[data-driving=\"1\"] .areg-car-wheel>g{\n  animation:areg-wheel-turn .44s linear infinite;\n  transform-box:fill-box;transform-origin:center;\n}\n.areg-car-pilot .areg-car-pilot-exit{\n  position:absolute;top:calc(50% - min(28.5dvh, 215px) + 10px);\n  right:calc(50% - min(45vw, 255px) + 10px);\n  z-index:6;\n}\n";
const CLOUDS="<svg viewBox=\"0 0 700 210\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"xMidYMid slice\" aria-hidden=\"true\"><g fill=\"#fffaf0\" opacity=\".93\"><ellipse cx=\"100\" cy=\"65\" rx=\"55\" ry=\"19\"/><circle cx=\"87\" cy=\"50\" r=\"23\"/><circle cx=\"122\" cy=\"49\" r=\"27\"/><ellipse cx=\"560\" cy=\"99\" rx=\"72\" ry=\"23\"/><circle cx=\"545\" cy=\"79\" r=\"28\"/><circle cx=\"585\" cy=\"76\" r=\"34\"/><ellipse cx=\"336\" cy=\"33\" rx=\"40\" ry=\"15\"/></g></svg>",HILLS="<svg viewBox=\"0 0 720 250\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path fill=\"#89d995\" d=\"M0 160Q95 54 230 146T510 128Q622 61 720 138V250H0Z\"/><path fill=\"#56c19b\" d=\"M0 196Q125 118 246 190T520 167Q632 99 720 183V250H0Z\"/><path fill=\"#3aa980\" d=\"M0 217Q160 176 282 218T525 196Q652 163 720 213V250H0Z\"/></svg>",TREES="<svg viewBox=\"0 0 840 185\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><g><g transform=\"translate(55 0)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#9e7758\"/><ellipse cx=\"0\" cy=\"97\" rx=\"50\" ry=\"64\" fill=\"#29a272\"/><ellipse cx=\"-19\" cy=\"85\" rx=\"28\" ry=\"40\" fill=\"#63d79b\"/><ellipse cx=\"22\" cy=\"101\" rx=\"27\" ry=\"45\" fill=\"#4d8c70\"/></g><g transform=\"translate(250 25) scale(.8)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#95684f\"/><ellipse cy=\"97\" rx=\"53\" ry=\"67\" fill=\"#40b5bf\"/><ellipse cx=\"-20\" cy=\"85\" rx=\"28\" ry=\"41\" fill=\"#7ce8d9\"/><ellipse cx=\"21\" cy=\"101\" rx=\"25\" ry=\"46\" fill=\"#578e7a\"/></g><g transform=\"translate(452 4) scale(1)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#9d7551\"/><ellipse cy=\"97\" rx=\"51\" ry=\"66\" fill=\"#2f9e76\"/><ellipse cx=\"-19\" cy=\"84\" rx=\"29\" ry=\"41\" fill=\"#67d997\"/><ellipse cx=\"23\" cy=\"103\" rx=\"26\" ry=\"45\" fill=\"#528d71\"/></g><g transform=\"translate(682 20) scale(.85)\"><rect x=\"-7\" y=\"133\" width=\"14\" height=\"43\" rx=\"4\" fill=\"#966b52\"/><ellipse cy=\"97\" rx=\"52\" ry=\"65\" fill=\"#259cc0\"/><ellipse cx=\"-19\" cy=\"84\" rx=\"28\" ry=\"40\" fill=\"#6fcdd3\"/><ellipse cx=\"22\" cy=\"101\" rx=\"26\" ry=\"45\" fill=\"#4e8c7b\"/></g></g></svg>",FLOWERS="<svg viewBox=\"0 0 720 60\" width=\"100%\" height=\"100%\" preserveAspectRatio=\"none\" aria-hidden=\"true\"><path fill=\"#50ab6b\" d=\"M0 51Q130 36 265 49T530 46Q650 37 720 50V60H0Z\"/><g stroke=\"#517f65\" stroke-width=\"3\"><path d=\"M85 51V21M169 52V34M285 51V28M395 52V17M505 52V32M633 50V25\"/></g><g fill=\"#ff7598\"><circle cx=\"85\" cy=\"20\" r=\"7\"/><circle cx=\"285\" cy=\"27\" r=\"8\"/><circle cx=\"633\" cy=\"25\" r=\"8\"/></g><g fill=\"#fff09d\"><circle cx=\"169\" cy=\"33\" r=\"6\"/><circle cx=\"395\" cy=\"16\" r=\"8\"/><circle cx=\"505\" cy=\"32\" r=\"7\"/></g></svg>";
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
 let closing=false,completed=false,ride=null,entryAnimation=null;
 const controller=new AbortController();
 const oldFocus=document.activeElement;
 const originalStyle=sourceCard.getAttribute('style');
 const picture=sourceCard.querySelector('.magic-picture');
 const originalArt=picture?.querySelector('img,svg');
 const artSrc=originalArt?.getAttribute('src')||'./reward-car-art.svg';
 const startRect=sourceCard.getBoundingClientRect();
 const originalParent=sourceCard.parentNode;
 const placeholder=sourceCard.cloneNode(false);
 placeholder.removeAttribute('id');
 placeholder.setAttribute('aria-hidden','true');
 placeholder.style.visibility='hidden';
 placeholder.style.pointerEvents='none';
 // Preserve the original grid position without ever showing a SECOND card.
 originalParent.insertBefore(placeholder,sourceCard);
 const overlay=document.createElement('div');
 overlay.className='areg-car-pilot';
 overlay.innerHTML='<div class="areg-car-pilot-shade"></div><button type="button" class="areg-car-pilot-exit" aria-label="Փակել">×</button>';
 const stage=document.createElement('div');
 stage.className='areg-car-pilot-stage';
 stage.dataset.sceneMode='illustrated';
 stage.innerHTML='<div class="areg-car-pilot-world"><div class="areg-car-pilot-sun"></div><div class="areg-car-pilot-clouds"></div><div class="areg-car-pilot-hills"></div><div class="areg-car-pilot-trees"></div><div class="areg-car-pilot-flowers"></div><div class="areg-car-pilot-road"></div><div class="areg-car-pilot-light"></div></div><div class="areg-car-pilot-shadow"></div><i class="areg-car-pilot-puff p1"></i><i class="areg-car-pilot-puff p2"></i><i class="areg-car-pilot-puff p3"></i><div class="areg-car-pilot-bloom"></div>';
 stage.querySelector('.areg-car-pilot-clouds').innerHTML=CLOUDS;
 stage.querySelector('.areg-car-pilot-hills').innerHTML=HILLS;
 stage.querySelector('.areg-car-pilot-trees').innerHTML=TREES+TREES;
 stage.querySelector('.areg-car-pilot-flowers').innerHTML=FLOWERS+FLOWERS;
 sourceCard.prepend(stage);
 sourceCard.classList.add('areg-car-pilot-surface');
 sourceCard.dataset.aregSameCard='1';
 overlay.append(sourceCard);
 document.body.append(overlay);
 const targetWidth=Math.min(window.innerWidth*.90,510);
 const targetHeight=Math.min(Math.max(window.innerHeight*.57,270),430);
 const endLeft=(window.innerWidth-targetWidth)/2;
 const endTop=(window.innerHeight-targetHeight)/2;
 const scaleX=targetWidth/startRect.width,scaleY=targetHeight/startRect.height;
 const start='translate3d('+startRect.left+'px,'+startRect.top+'px,0) scale(1,1)';
 const expanded='translate3d('+endLeft+'px,'+endTop+'px,0) scale('+scaleX+','+scaleY+')';
 sourceCard.style.position='absolute';
 sourceCard.style.left='0';
 sourceCard.style.top='0';
 sourceCard.style.width=startRect.width+'px';
 sourceCard.style.height=startRect.height+'px';
 sourceCard.style.transformOrigin='0 0';
 sourceCard.style.transform=start;
 sourceCard.style.margin='0';
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 if(!document.getElementById('areg-car-pilot-style')){
   const style=document.createElement('style');style.id='areg-car-pilot-style';
   style.textContent=CSS;document.head.append(style);
 }
 const signal=controller.signal;
 const onKey=e=>{if(e.key==='Escape'){e.preventDefault();void close()}};
 let actionStart=0;
 // Restore original DOM in one synchronous task; no opacity crossfade or
 // clone is allowed. Layout swaps after the SAME card reaches its exact slot.
 function restore(){
   if(completed)return;
   completed=true;
   entryAnimation?.cancel();
   ride?.cancel();
   stage.remove();
   sourceCard.classList.remove('areg-car-pilot-surface');
   delete sourceCard.dataset.aregSameCard;
   delete sourceCard.dataset.driving;
   if(originalStyle===null)sourceCard.removeAttribute('style');
   else sourceCard.setAttribute('style',originalStyle);
   placeholder.replaceWith(sourceCard);
   overlay.remove();
   active=false;
   document.removeEventListener('keydown',onKey);
   if(oldFocus?.isConnected&&oldFocus!==sourceCard)
     oldFocus.focus({preventScroll:true});
 }
 async function close(){
   if(closing||completed)return;
   closing=true;
   signal.aborted||controller.abort();
   ride?.pause();
   stage.dataset.live='0';
   stage.dataset.ending='1';
   sourceCard.dataset.driving='0';
   stage.dataset.returnMode='single-original-dom-card';
   overlay.dataset.leaving='1';
   const movieTransform=getComputedStyle(picture).transform;
   ride?.cancel();
   // Actual source card is the moving DOM node. The car graphic returns
   // WITH it. No landing clone, no replacement image, no last-frame swap.
   let closingCard=null,closingCar=null;
   if(!reduced&&typeof sourceCard.animate==='function'){
     closingCard=sourceCard.animate(
       [{transform:expanded},{transform:start}],
       {duration:960,easing:'cubic-bezier(.2,.6,.23,1)',fill:'forwards'}
     );
     closingCar=picture.animate(
       [{transform:movieTransform},{transform:'none'}],
       {duration:960,easing:'cubic-bezier(.2,.6,.23,1)',fill:'forwards'}
     );
     await Promise.all([closingCard.finished.catch(()=>{}),closingCar.finished.catch(()=>{})]);
   }else sourceCard.style.transform=start;
   // Check final coordinates BEFORE atomic restore; no extra visible frame.
   const ending=sourceCard.getBoundingClientRect();
   const target=placeholder.getBoundingClientRect();
   const errorPx=Math.max(
     Math.abs(ending.left-target.left),Math.abs(ending.top-target.top),
     Math.abs(ending.width-target.width),Math.abs(ending.height-target.height)
   );
   const paintedCards=overlay.querySelectorAll('.magic-collect-card').length;
   const parkedCar=picture.querySelector('svg,img');
   const detail={
     errorPx,cardCount:paintedCards,
     sameDOM:sourceCard.dataset.aregSameCard==='1',
     sameArt:!!parkedCar,
     mode:'single-original-dom-card',
     duration:actionStart?Math.round(performance.now()-actionStart):0
   };
   // Do not leave a second image behind after the animation.
   restore();
   document.dispatchEvent(new CustomEvent('areg-car-return-check',{detail}));
 }
 overlay.querySelector('.areg-car-pilot-exit').addEventListener('click',()=>void close());
 overlay.querySelector('.areg-car-pilot-shade').addEventListener('click',()=>void close());
 document.addEventListener('keydown',onKey);
 overlay.dataset.visible='1';
 try{
   // Load the identical source artwork only once. Embed SVG inside the
   // ORIGINAL .magic-picture so spinning wheels need no second car image.
   const svgText=await fetch(new URL(artSrc,document.baseURI)).then(r=>{
     if(!r.ok)throw Error('Car sprite HTTP '+r.status);return r.text();
   });
   if(closing)return;
   const doc=new DOMParser().parseFromString(svgText,'image/svg+xml');
   const artwork=doc.documentElement;
   if(artwork.tagName.toLowerCase()!=='svg'||doc.querySelector('parsererror'))
     throw Error('Car sprite is not SVG');
   if(originalArt?.tagName.toLowerCase()!=='svg'){
     picture.replaceChildren(document.importNode(artwork,true));
   }
   stage.dataset.wheels=picture.querySelectorAll('svg .areg-car-wheel').length===2?'rotatable':'static-fallback';
   entryAnimation=sourceCard.animate(
     [{transform:start},{transform:expanded}],
     {duration:740,easing:'cubic-bezier(.22,.3,.27,1)',fill:'forwards'}
   );
   await entryAnimation.finished.catch(()=>{});
   if(closing)return;
   await new Promise(requestAnimationFrame);
   if(closing)return;
   actionStart=performance.now();
   stage.dataset.actionStartedAt=String(actionStart);
   stage.dataset.actionMs='0';
   stage.dataset.live='1';
   stage.dataset.travelDirection='left';
   sourceCard.dataset.driving='1';
   // Motion is measured from this first animation frame, excluding
   // the entry and return. The ONE visible car travels only leftward.
   ride=picture.animate([
     {offset:0,transform:'translate3d(0px,0px,0) scale(1.0)'},
     {offset:.17,transform:'translate3d(-3px,-1px,0) scale(1.06)'},
     {offset:.36,transform:'translate3d(-7px,0px,0) scale(1.10)'},
     {offset:.57,transform:'translate3d(-12px,-2px,0) scale(1.10)'},
     {offset:.79,transform:'translate3d(-17px,-1px,0) scale(1.06)'},
     {offset:1,transform:'translate3d(-22px,0px,0) scale(1.0)'}
   ],{duration:5000,easing:'linear',fill:'forwards'});
   await Promise.race([
     ride.finished.catch(()=>{}),
     new Promise(done=>signal.addEventListener('abort',done,{once:true}))
   ]);
   stage.dataset.actionMs=String(Math.round(performance.now()-actionStart));
   if(!closing)await close();
 }catch(error){
   console.warn('Animated reward scene:',error);
   if(!closing)await close();
 }finally{
   if(!closing&&!completed)await close();
 }
}
