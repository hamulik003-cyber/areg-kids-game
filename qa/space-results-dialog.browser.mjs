#!/usr/bin/env node
// AREG V289 regression: recreate the USER'S 29/29 screenshot state, answer
// the 30th distinct question and ensure the EXISTING result dialog appears.
// Keep this test in Chromium and mobile WebKit; no device storage touched.
import {chromium,webkit} from 'playwright';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8769','--bind','127.0.0.1'],{stdio:'ignore'});
let browser;
try{
  await sleep(800);
  const ios=process.env.AREG_BROWSER==='webkit';
  browser=ios?await webkit.launch({headless:true}):
    await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await page.route('**/qa/space-results-test.html',route=>route.fulfill({
    contentType:'text/html',body:'<!doctype html><html lang="hy"><head><meta charset="utf-8"></head><body></body></html>'
  }));
  await page.goto('http://127.0.0.1:8769/qa/space-results-test.html');
  const proof=await page.evaluate(async()=>{
    const {createUniqueTargetCycle}=await import('/space-question-cycle.js?v=289');
    const {createFindingSession}=await import('/space-finding-session.js?v=285');
    const objects=Array.from({length:30},(_,i)=>({id:'space-'+i}));
    const deck=createUniqueTargetCycle(objects,items=>[...items]);
    const root=document.createElement('div');
    root.className='s3d-root';
    root.innerHTML='<div class="s3d-hud"></div>';
    document.body.append(root);
    let resetCount=0;
    const ctx={settings:{master:false,effects:false},resetCorrectAnswerStreak(){resetCount++}};
    const session=createFindingSession(root,ctx);
    for(let i=0;i<29;i++){
      session.wrongAnswer();
      session.rightAnswer();
      deck.commit(deck.peek().id);
    }
    const at29=session.counts();
    if(at29.wrong!==29||at29.correct!==29||
       deck.completed||root.querySelector('.s3d-cycle-backdrop'))
      throw new Error('29/29 should NOT show full-tour result');
    session.rightAnswer();
    deck.commit(deck.peek().id);
    if(!deck.completed||session.counts().correct!==30)
      throw new Error('30th correct target not counted');
    // This same end-of-tour call is issued by the real Space 3D loop after
    // the final 690ms exit plus 160ms starfield pause.
    const pending=session.showCycleResult();
    const card=root.querySelector('.s3d-cycle-backdrop');
    if(!card||card.getAttribute('role')!=='dialog'||
       root.dataset.sessionAwaitingReplay!=='true')
      throw new Error('Old celebration/result modal missing at 30th target');
    const bad=card.querySelector('.s3d-cycle-stats .s3d-session-wrong')?.textContent;
    const good=card.querySelector('.s3d-cycle-stats .s3d-session-right')?.textContent;
    if(bad!=='29'||good!=='30')throw new Error('Dialog did not preserve 29/30 results');
    const label=card.querySelector('.s3d-cycle-replay')?.textContent;
    if(!label?.includes('Խաղալ նորից'))throw new Error('Manual replay button absent');
    card.querySelector('.s3d-cycle-replay').click();
    await pending;
    if(root.querySelector('.s3d-cycle-backdrop')||
       root.dataset.sessionAwaitingReplay!=='false'||resetCount!==1)
      throw new Error('Replay did not fully dismiss prior result');
    deck.replay();
    if(deck.remaining!==30||deck.completed)throw new Error('New deck did not reset');
    const out={at29,final:{wrong:Number(bad),correct:Number(good)},modal:true,
      replay:true,nextDeckSize:deck.remaining,resetCount};
    session.dispose();root.remove();
    return out;
  });
  console.log('AREG SPACE 30TH RESULT DIALOG PASS',process.env.AREG_BROWSER||'chromium',JSON.stringify(proof));
}catch(e){
  console.error('AREG SPACE 30TH RESULT DIALOG FAIL',e.stack||String(e));
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
