import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../areg-sea-battle.html', import.meta.url), 'utf8');
function extract(name) {
  const found = new RegExp('function\\s+' + name + '\\s*\\(').exec(source);
  assert.ok(found);
  const open = source.indexOf('{', found.index);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') { depth--; if (depth === 0) return source.slice(found.index, i + 1); }
  }
  throw Error('Unbalanced '+name);
}
const code = ['hitAt','handleMessage'].map(extract).join('\n');
function create() {
  const messages = [], events = [];
  const state = {
    phase:'battle',remoteTurn:true,shotBusy:false,
    mine:{ships:[[10,11]],shots:[]},theirs:{ships:[],shots:[]},
    onlineHits:new Set(),onlineSunkAssets:{},FLEET:[5,4,3,3,2],N:10,
    remoteReady:false,localReady:false,
    send: m => messages.push(m),
    animateShot: (board,i,hit,done,sunk) => { events.push({board,i,hit,sunk});done(); },
    renderBattle: () => events.push({render:true}),
    victory: who => events.push({victory:who}),
    startOnlineBattle: () => events.push({started:true})
  };
  const { handleMessage } = runInNewContext(code+'\n({handleMessage})',state);
  return { handleMessage,state,messages,events };
}

test('Sea Battle online: incoming miss returns a miss result and releases turn', () => {
  const game = create();
  game.handleMessage({type:'shot',i:45});
  assert.equal(game.messages.length,1);
  assert.equal(game.messages[0].hit,false);
  assert.equal(game.state.remoteTurn,false);
  assert.deepEqual(game.state.mine.shots,[45]);
});

test('Sea Battle online: incoming invalid or repeated shot is rejected', () => {
  const game = create();
  for (const i of [-1,100,1.5,'10']) game.handleMessage({type:'shot',i});
  assert.equal(game.messages.length,0);
  game.handleMessage({type:'shot',i:10});
  game.state.remoteTurn=true;
  game.handleMessage({type:'shot',i:10});
  assert.equal(game.messages.length,1);
  assert.deepEqual(game.state.mine.shots,[10]);
});

test('Sea Battle online: first hit does not expose ship cells', () => {
  const game = create();
  game.handleMessage({type:'shot',i:10});
  assert.equal(game.messages[0].hit,true);
  assert.equal(game.messages[0].sunk,false);
  assert.equal('shipCells' in game.messages[0],false);
});

test('Sea Battle online: final hit reveals only sunk ship and reports victory', () => {
  const game = create();
  game.handleMessage({type:'shot',i:10});
  game.state.remoteTurn=true;
  game.handleMessage({type:'shot',i:11});
  const result = game.messages[1];
  assert.equal(result.sunk,true);
  assert.equal(result.win,true);
  assert.deepEqual(Array.from(result.shipCells),[10,11]);
  assert.equal(result.shipIndex,0);
});

test('Sea Battle online: duplicate results are ignored', () => {
  const game = create();
  game.handleMessage({type:'result',i:45,hit:false,sunk:false,win:false});
  game.handleMessage({type:'result',i:45,hit:false,sunk:false,win:false});
  assert.deepEqual(game.state.theirs.shots,[45]);
  assert.equal(game.events.filter(e => e.board === 1).length,1);
});

test('Sea Battle online: incoming shot is ignored when it is not the remote turn', () => {
  const game = create();
  game.state.remoteTurn=false;
  game.handleMessage({type:'shot',i:45});
  assert.equal(game.messages.length,0);
  assert.equal(game.state.mine.shots.length,0);
});

test('Sea Battle online: incoming shot is ignored outside battle phase', () => {
  const game = create();
  game.state.phase='waiting';
  game.handleMessage({type:'shot',i:45});
  assert.equal(game.messages.length,0);
  assert.equal(game.state.mine.shots.length,0);
});

test('Sea Battle online: sunk ship information is not accepted with invalid fleet index', () => {
  const game = create();
  game.handleMessage({type:'result',i:10,hit:true,sunk:true,win:false,shipCells:[10,11],shipIndex:99});
  assert.equal(game.state.theirs.ships.length,0);
  assert.equal(game.state.theirs.shots.length,1);
});

test('Sea Battle online: forged noncontiguous ship cells are not revealed', () => {
  const game = create();
  game.state.theirs.shots.push(11);
  game.state.onlineHits.add(11);
  game.handleMessage({type:'result',i:10,hit:true,sunk:true,win:false,shipCells:[10,11],shipIndex:4});
  // A two-cell contiguous ship is valid, so use a gap instead.
  assert.equal(game.state.theirs.ships.length,1);
  const other=create();
  other.state.theirs.shots.push(12);
  other.state.onlineHits.add(12);
  other.handleMessage({type:'result',i:10,hit:true,sunk:true,win:false,shipCells:[10,12],shipIndex:4});
  assert.equal(other.state.theirs.ships.length,0);
});

test('Sea Battle online: unrequested valid-index result currently changes shot history (known protocol gap)', () => {
  const game=create();
  // This is a characterization test of existing behavior, NOT an approval of the protocol.
  game.handleMessage({type:'result',i:73,hit:false,sunk:false,win:false});
  assert.deepEqual(game.state.theirs.shots,[73]);
});
