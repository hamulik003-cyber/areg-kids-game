import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../areg-sea-battle.html', import.meta.url), 'utf8');
function extract(name) {
  const found = new RegExp('function\\s+' + name + '\\s*\\(').exec(source);
  assert.ok(found, 'Missing existing function ' + name);
  const open = source.indexOf('{', found.index);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') { depth--; if (!depth) return source.slice(found.index, i + 1); }
  }
  throw new Error('Incomplete function ' + name);
}
const functions = ['hitAt','fire','aiShot'].map(extract).join('\n');
function setup(mode = 'local') {
  const events = [], pending = [];
  const state = {
    phase:'battle', mode, finished:false, shotBusy:false, turn:0,
    remoteTurn:false, conn:{open:true}, theirs:{ships:[[10,11]],shots:[]},
    mine:{ships:[[20,21]],shots:[]}, aiMemory:[], N:10,
    send: message => events.push(['send',message]),
    renderBattle: () => events.push(['render']),
    passTurn: () => events.push(['pass']),
    victory: who => events.push(['victory',who]),
    animateShot: (side,i,hit,done,sunk) => { events.push(['animation',side,i,hit,sunk]);done(); },
    setTimeout: (fn,delay) => { pending.push({fn,delay}); },
    rand: () => 0,
    xy: i => [i % 10, Math.floor(i / 10)],
    idx: (x,y) => y * 10 + x,
  };
  const ctx = runInNewContext(functions + '\n({fire,aiShot,hitAt})', state);
  return { state, events, pending, ...ctx };
}

test('Sea Battle: local miss passes the turn to the other player', () => {
  const game = setup();
  game.fire(45);
  assert.equal(game.state.turn,1);
  assert.deepEqual(game.state.theirs.shots,[45]);
  assert.ok(game.events.some(e => e[0] === 'pass'));
});

test('Sea Battle: repeated local shot cannot pass the turn again', () => {
  const game = setup();
  game.fire(45);
  const previous = game.events.length;
  game.fire(45);
  assert.equal(game.events.length,previous);
  assert.deepEqual(game.state.theirs.shots,[45]);
});

test('Sea Battle: online fire sends one shot and waits for remote turn', () => {
  const game = setup('online');
  game.fire(45);
  assert.equal(game.state.remoteTurn,true);
  assert.equal(game.state.shotBusy,true);
  assert.equal(game.events.filter(e => e[0] === 'send').length,1);
  assert.equal(game.events[0][1].type,'shot');
  game.fire(46);
  assert.equal(game.events.filter(e => e[0] === 'send').length,1);
});

test('Sea Battle: AI responds after player miss and returns control', () => {
  const game = setup('ai');
  game.fire(45);
  assert.equal(game.state.turn,1);
  assert.equal(game.pending.length,1);
  assert.equal(game.pending[0].delay,750);
  game.pending[0].fn();
  assert.equal(game.state.mine.shots.length,1);
  assert.equal(game.state.turn,0);
  assert.equal(game.state.shotBusy,false);
});

test('Sea Battle: AI does not fire outside AI battle mode', () => {
  const game = setup('local');
  game.aiShot();
  assert.equal(game.state.mine.shots.length,0);
});
