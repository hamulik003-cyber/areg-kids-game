#!/usr/bin/env node
// V282: test the ACTUAL app.js reward functions, not a copied algorithm.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
const finding=fs.readFileSync(new URL('../space-finding-session.js',import.meta.url),'utf8');

function functionSource(name){
  const start=app.indexOf('  function '+name+'(');
  assert.ok(start>=0,'missing '+name);
  const end=app.indexOf('\n  }',start);
  assert.ok(end>start,'missing end of '+name);
  return app.slice(start,end+4);
}
function ledger(initial=0){
  let saved=0,updated=0;
  const create=new Function('initial','saveStars','updateStars',
    'let stars=initial;const spaceCorrectCounts=Object.create(null);\n'+
    functionSource('resetSpaceCorrectAnswers')+'\n'+
    functionSource('recordSpaceCorrectAnswer')+'\n'+
    'return {record:recordSpaceCorrectAnswer,reset:resetSpaceCorrectAnswers,'+
    'wallet:()=>stars,counts:()=>({...spaceCorrectCounts})}');
  const impl=create(initial,()=>saved++,()=>updated++);
  return {...impl,writes:()=>({saved,updated})};
}
test('7 answers before exit plus 3 after return MUST NOT earn a star',()=>{
  const s=ledger(29);
  for(let i=0;i<7;i++)assert.equal(s.record('constellation-game'),false);
  assert.equal(s.counts()['constellation-game'],7);
  s.reset();
  for(let i=0;i<3;i++)assert.equal(s.record('constellation-game'),false);
  assert.equal(s.counts()['constellation-game'],3);
  assert.equal(s.wallet(),29);
  assert.deepEqual(s.writes(),{saved:0,updated:0});
  for(let i=4;i<=9;i++)assert.equal(s.record('constellation-game'),false);
  assert.equal(s.record('constellation-game'),true);
  assert.equal(s.wallet(),30);
  assert.deepEqual(s.writes(),{saved:1,updated:1});
});
test('planets and constellations each require their OWN ten answers',()=>{
  const s=ledger(13);
  for(let i=0;i<9;i++){
    assert.equal(s.record('space-search'),false);
    assert.equal(s.record('constellation-game'),false);
  }
  assert.equal(s.wallet(),13);
  assert.equal(s.record('space-search'),true);
  assert.equal(s.wallet(),14);
  assert.equal(s.record('constellation-game'),true);
  assert.equal(s.wallet(),15);
  assert.equal(s.record('space-search'),false);
  assert.equal(s.record('constellation-game'),false);
  assert.equal(s.wallet(),15);
  assert.equal(s.record('unrelated-game'),false);
  assert.deepEqual(s.writes(),{saved:2,updated:2});
});
test('game exit and full-cycle result reset partial star progress but never earned stars',()=>{
  const s=ledger(10);
  for(let i=0;i<19;i++)s.record('space-search');
  assert.equal(s.wallet(),11);
  s.reset();
  for(let i=0;i<9;i++)assert.equal(s.record('space-search'),false);
  assert.equal(s.wallet(),11);
  assert.equal(s.record('space-search'),true);
  assert.equal(s.wallet(),12);
  assert.ok(app.includes('resetSpaceCorrectAnswers();'));
  assert.ok(app.includes('resetCorrectAnswerStreak:resetSpaceCorrectAnswers'));
  assert.ok(finding.includes('ctx?.resetCorrectAnswerStreak?.()'));
  assert.ok(!app.includes('localStorage.setItem(key,String(count))'));
});
test('bonus unlock charges real stars and permanently removes dark lock circle',()=>{
  const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
  assert.ok(app.includes('stars-=item.cost'));
  assert.ok(app.includes('updateStars();'));
  assert.ok(app.includes('updateMagicAvailability();'));
  assert.ok(app.includes("$('.magic-lock',card)?.remove()"));
  assert.ok(css.includes('.magic-collect-card.is-unlocked .magic-lock{display:none !important}'));
});
