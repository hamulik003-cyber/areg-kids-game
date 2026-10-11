import test from 'node:test';
import assert from 'node:assert/strict';
import {createUniqueTargetCycle} from '../space-question-cycle.js';

const items=Array.from({length:30},(_,i)=>({id:'object-'+i}));
const copy=a=>[...a];
function seededShuffle(seed){
  return list=>{
    const a=[...list];
    for(let i=a.length-1;i>0;i--){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      const j=seed%(i+1);
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };
}
test('30 distinct targets, exactly once, then result gate',()=>{
  const deck=createUniqueTargetCycle(items,seededShuffle(12));
  const seen=[];
  for(let i=0;i<30;i++){
    assert.equal(deck.completed,false);
    const item=deck.peek();
    assert.ok(item);
    seen.push(deck.commit(item.id).id);
    assert.equal(deck.remaining,29-i);
  }
  assert.equal(new Set(seen).size,30);
  assert.deepEqual(new Set(seen),new Set(items.map(x=>x.id)));
  assert.equal(deck.completed,true);
  assert.equal(deck.peek(),null);
  assert.throws(()=>deck.commit(seen[0]),/Repeated/);
});
test('UV fallback cannot re-ask already used target, and never skips original question',()=>{
  const deck=createUniqueTargetCycle(items,copy);
  const first=deck.commit(deck.peek().id);
  // Simulate that this already-asked planet is the only cached UV and the
  // originally queued target is not decoded yet.
  const fallback=deck.chooseReady(new Set([first.id]));
  assert.ok(fallback);
  assert.notEqual(fallback.id,first.id);
  assert.equal(fallback.id,deck.peek().id);
  // Now two later unasked planets are ready; prefer an available question.
  const available=deck.chooseReady(new Set([first.id,'object-11','object-12']));
  assert.ok(['object-11','object-12'].includes(available.id));
  deck.commit(available.id);
  const seen=[first.id,available.id];
  while(!deck.completed){
    const c=deck.chooseReady(new Set(seen)); // all ready are old
    assert.ok(c);
    assert.equal(seen.includes(c.id),false);
    seen.push(deck.commit(c.id).id);
  }
  assert.equal(seen.length,30);
  assert.equal(new Set(seen).size,30);
});
test('100 replays re-shuffle; never repeat last prompt as first of next visit',()=>{
  const deck=createUniqueTargetCycle(items,seededShuffle(2718));
  let prior=null;
  for(let k=0;k<100;k++){
    const order=[];
    while(!deck.completed)order.push(deck.commit(deck.peek().id).id);
    assert.equal(order.length,30);
    assert.equal(new Set(order).size,30);
    if(prior){
      assert.notDeepEqual(order,prior);
      assert.notEqual(order[0],prior.at(-1));
    }
    prior=order;
    deck.replay();
  }
});
test('even when shuffler returns identical order, replay changes order',()=>{
  const deck=createUniqueTargetCycle(items,copy);
  const first=[];
  while(!deck.completed)first.push(deck.commit(deck.peek().id).id);
  deck.replay();
  const second=[];
  while(!deck.completed)second.push(deck.commit(deck.peek().id).id);
  assert.notDeepEqual(second,first);
  assert.notEqual(second[0],first.at(-1));
});
test('reject invalid early replay and repeated commit',()=>{
  const deck=createUniqueTargetCycle(items,copy);
  assert.throws(()=>deck.replay(),/before all questions/);
  const item=deck.commit(deck.peek().id);
  assert.throws(()=>deck.commit(item.id),/Repeated or unknown/);
});
