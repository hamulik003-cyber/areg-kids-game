import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8877','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try {
 await sleep(1000);
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 for(const [width,height] of [[1366,768],[1280,720],[1920,1080],[390,844]]) {
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8877/index.html?areg_trial=1',{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForSelector('#homeScreen .section-card',{timeout:20000});
  await page.waitForTimeout(500);
  const m=await page.evaluate(()=>{
   const stage=document.querySelector('#designStage').getBoundingClientRect();
   const cards=[...document.querySelectorAll('#homeScreen .section-card')].map(x=>({name:x.dataset.section,rect:x.getBoundingClientRect().toJSON()}));
   return {stage:stage.toJSON(),cards,desktop:matchMedia('(min-width: 900px) and (min-height: 600px) and (min-aspect-ratio: 5/4) and (hover: hover) and (pointer: fine)').matches};
  });
  if(m.cards.length!==5)throw Error('Expected five home sections, got '+m.cards.length);
  if(m.desktop !== (width>=900 && height>=600 && width/height>=1.25))
    throw Error('Unexpected desktop breakpoint '+width+'x'+height);
  for(let i=0;i<m.cards.length;i++)for(let j=i+1;j<m.cards.length;j++){
   const a=m.cards[i].rect,b=m.cards[j].rect;
   const overlapX=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
   const overlapY=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
   if(overlapX*overlapY>4)throw Error('Home tiles overlap '+width+'x'+height+' '+m.cards[i].name+' / '+m.cards[j].name);
  }
  if(m.stage.left < -2 || m.stage.top < -2 || m.stage.right > width+2 || m.stage.bottom > height+2)throw Error('Stage clipping '+width+'x'+height+' '+JSON.stringify(m.stage));
  for(const c of m.cards){
   if(c.rect.left < -2 || c.rect.top < -2 || c.rect.right > width+2 || c.rect.bottom > height+2)throw Error('Card clipping '+width+'x'+height+' '+c.name);
  }
  if(errors.length)throw Error('Browser exceptions '+width+'x'+height+' '+errors.join('; '));
  console.log('PASS home '+width+'x'+height+' desktop='+m.desktop+' cards='+m.cards.length);
  await page.close();
 }
} finally {await browser?.close();server.kill();}
