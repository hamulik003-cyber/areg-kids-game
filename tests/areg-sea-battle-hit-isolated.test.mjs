import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Run the exact existing pure hit resolution function; no UI, network or storage.
const source = readFileSync(new URL('../areg-sea-battle.html', import.meta.url), 'utf8');
const match = /function\s+hitAt\s*\(/.exec(source);
assert.ok(match, 'Existing Sea Battle hit resolver must exist');
const start = match.index, open = source.indexOf('{', start);
let depth = 0, end = -1;
for (let i = open; i < source.length; i++) {
  if (source[i] === '{') depth++;
  if (source[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
}
assert.ok(end > open, 'Hit resolver must have a complete function body');
const hitAt = runInNewContext(source.slice(start, end) + '\nhitAt', {});
const board = (...ships) => ({ ships: ships.map(cells => [...cells]), shots: [] });

test('Sea Battle: water shot records a miss without sinking a ship', () => {
  const b = board([11,12]);
  const result = hitAt(b,45);
  assert.equal(result.hit,false);
  assert.equal(result.sunk,false);
  assert.equal(result.win,false);
  assert.deepEqual(b.shots,[45]);
});

test('Sea Battle: first hit does not sink a multi-cell ship', () => {
  const b = board([11,12]);
  const result = hitAt(b,11);
  assert.equal(result.hit,true);
  assert.equal(result.sunk,false);
  assert.equal(result.win,false);
});

test('Sea Battle: final ship cell sinks the ship and completes victory', () => {
  const b = board([11,12],[25]);
  hitAt(b,11);
  const sink = hitAt(b,12);
  assert.equal(sink.hit,true);
  assert.equal(sink.sunk,true);
  assert.equal(sink.win,false);
  const victory = hitAt(b,25);
  assert.equal(victory.hit,true);
  assert.equal(victory.sunk,true);
  assert.equal(victory.win,true);
});

test('Sea Battle: repeated shots are rejected without changing shot history', () => {
  const b = board([11,12]);
  hitAt(b,11);
  assert.equal(hitAt(b,11),null);
  assert.deepEqual(b.shots,[11]);
});
