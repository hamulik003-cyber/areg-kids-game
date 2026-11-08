import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (name) => readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');

// These are static integration contracts, NOT proof of gameplay or iOS rendering.
test('Checkers retains capture calculation and online invite entry', () => {
  const source = read('areg-checkers.html');
  assert.match(source, /function\s+moves\s*\(/);
  assert.match(source, /maxCaptures\s*\(/);
  assert.match(source, /new URLSearchParams\(location\.search\)\.get\('room'\)/);
  assert.match(source, /setMode\('online'\)/);
});

test('Checkers retains touch-selection safeguards and music persistence entry', () => {
  const source = read('areg-checkers.html');
  assert.ok(source.includes("addEventListener('contextmenu'"));
  assert.ok(source.includes("addEventListener('selectstart'"));
  assert.ok(source.includes("indexedDB.open('areg-checkers-music'"));
});

test('Sea Battle retains placement, shot and invitation entry', () => {
  const source = read('areg-sea-battle.html');
  assert.match(source, /function\s+fire\s*\(/);
  assert.match(source, /function\s+moveExisting\s*\(/);
  assert.match(source, /new URLSearchParams\(location\.search\)\.get\('invite'\)/);
  assert.match(source, /incomingInvite\.toUpperCase\(\)/);
});

test('Sea Battle retains touch safeguards and saved music entry', () => {
  const source = read('areg-sea-battle.html');
  for (const event of ['contextmenu', 'selectstart', 'dragstart']) {
    assert.ok(source.includes(`addEventListener('${event}'`));
  }
  assert.ok(source.includes("indexedDB.open('areg-sea-battle-music'"));
});
