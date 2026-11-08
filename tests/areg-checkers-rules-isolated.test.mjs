import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Evaluate only the existing pure rules, never the game's UI or saved state.
const source = readFileSync(new URL('../areg-checkers.html', import.meta.url), 'utf8');
function extract(name) {
  const match = new RegExp('function\\s+' + name + '\\s*\\(').exec(source);
  assert.ok(match, 'Missing existing rule: ' + name);
  const start = match.index;
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unbalanced rule: ' + name);
}
const names = ['rawMoves', 'maxCaptures', 'moves', 'apply'];
const context = { dirs: [[-1,-1],[-1,1],[1,-1],[1,1]], inside: (r,c) => r >= 0 && r < 8 && c >= 0 && c < 8, at: (r,c) => r * 8 + c, $: () => ({ checked: false }) };
const rules = runInNewContext(names.map(extract).join('\n') + '\n({rawMoves,maxCaptures,moves,apply})', context);
const board = (...entries) => { const b = Array(64).fill(0); for (const [i,v] of entries) b[i] = v; return b; };

test('checkers: normal move preserves the input board and moves exactly one stone', () => {
  const b = board([42,1]);
  const legal = rules.rawMoves(b,1);
  assert.ok(legal.some(m => m.from === 42 && m.to === 33 && m.cap === -1));
  const next = rules.apply(b,legal.find(m => m.to === 33));
  assert.equal(b[42],1);
  assert.equal(next[42],0);
  assert.equal(next[33],1);
  assert.equal(next.filter(Boolean).length,1);
});

test('checkers: capture removes opponent and keeps the original board unchanged', () => {
  const b = board([42,1],[33,-1]);
  const capture = rules.maxCaptures(b,1).find(m => m.from === 42 && m.to === 24);
  assert.ok(capture);
  const next = rules.apply(b,capture);
  assert.equal(next[24],1);
  assert.equal(next[33],0);
  assert.equal(next[42],0);
  assert.equal(b[33],-1);
});

test('checkers: reaching the final row crowns the stone', () => {
  const b = board([10,1]);
  const next = rules.apply(b,{from:10,to:1,cap:-1});
  assert.equal(next[1],2);
  assert.equal(b[10],1);
});

test('checkers: captures remain available for chain continuation', () => {
  const b = board([42,1],[33,-1],[17,-1]);
  const first = rules.maxCaptures(b,1).find(m => m.to === 24);
  assert.ok(first);
  const next = rules.apply(b,first);
  assert.ok(rules.maxCaptures(next,1,24).some(m => m.from === 24 && m.to === 10 && m.cap === 17));
});
