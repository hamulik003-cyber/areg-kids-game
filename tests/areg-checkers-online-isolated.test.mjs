import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../areg-checkers.html', import.meta.url), 'utf8');
const match = /function\s+attach\s*\(/.exec(source);
assert.ok(match, 'Checkers online connection handler must exist');
const open = source.indexOf('{',match.index);
let depth=0,end=-1;
for(let i=open;i<source.length;i++){
  if(source[i]==='{') depth++;
  if(source[i]==='}' && --depth===0){end=i+1;break;}
}
assert.ok(end>open,'Checkers online handler must be complete');
const code=source.slice(match.index,end);
function setup(){
  const callbacks={}, events=[];
  const elements=new Map();
  const $=id=>{
    if(!elements.has(id)) elements.set(id,{classList:{add:()=>{},remove:()=>{}},checked:false,textContent:''});
    return elements.get(id);
  };
  const state={
    conn:null,turn:1,mySide:1,mode:'online',penalty:[],penaltySide:0,
    board:Array(64).fill(0),$,
    resetMatch:()=>events.push('reset'),
    updateDiceStage:()=>events.push('dice-stage'),
    render:()=>events.push('render'),
    play:(move,send)=>events.push({move,send}),
    start:()=>events.push('start'),
    acceptDiceRoll:(side,value)=>events.push({dice:side,value}),
  };
  const attach=runInNewContext(code+'\nattach',state);
  const connection={on:(event,fn)=>{callbacks[event]=fn}};
  attach(connection);
  return {state,events,callbacks,connection,$};
}
test('Checkers online: connection open initializes match',()=>{
  const g=setup();
  assert.equal(g.state.conn,g.connection);
  g.callbacks.open();
  assert.ok(g.events.includes('reset'));
  assert.ok(g.events.includes('render'));
});
test('Checkers online: valid opponent move is processed without retransmission',()=>{
  const g=setup();
  g.state.turn=-1;
  g.callbacks.data({type:'move',m:{from:17,to:26,cap:-1}});
  assert.deepEqual(g.events.filter(e=>typeof e==='object'&&e.move).map(e=>e.send),[false]);
});
test('Checkers online: own-turn, malformed and incomplete move messages are ignored',()=>{
  const g=setup();
  g.callbacks.data({type:'move',m:{from:17,to:26,cap:-1}});
  g.state.turn=-1;
  g.callbacks.data({type:'move',m:{from:17.5,to:26,cap:-1}});
  g.callbacks.data({type:'move',m:{from:17,to:26}});
  g.callbacks.data({type:'move',m:null});
  assert.equal(g.events.filter(e=>typeof e==='object'&&e.move).length,0);
});
test('Checkers online: dice messages accept only opposite side in online mode',()=>{
  const g=setup();
  g.callbacks.data({type:'dice-throw',side:-1,value:4});
  g.callbacks.data({type:'dice-throw',side:1,value:5});
  assert.equal(g.events.filter(e=>typeof e==='object'&&'dice' in e).length,1);
});
test('Checkers online: remote reset invokes match reset',()=>{
  const g=setup();
  g.callbacks.data({type:'reset'});
  assert.deepEqual(g.events,['reset']);
});
