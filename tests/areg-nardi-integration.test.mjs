import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');

test('Nardi page references the current CSS and JS modules', () => {
  const html = read('areg-nardi.html');
  assert.match(html, /href=["']\.\/areg-nardi\.css\?v=\d+["']/);
  assert.match(html, /src=["']\.\/areg-nardi\.js\?v=\d+["']/);
  assert.ok(existsSync(resolve(root, 'areg-nardi.css')));
  assert.ok(existsSync(resolve(root, 'areg-nardi.js')));
});

test('Nardi gameplay imports the existing rules module without changing it', () => {
  const js = read('areg-nardi.js');
  assert.match(js, /from\s+["']\.\/areg-nardi-rules\.js\?v=\d+["']/);
  for (const symbol of ['legalMoves', 'prepareTurn', 'advance', 'startingPosition']) {
    assert.ok(js.includes(symbol), `Expected rules integration symbol ${symbol}`);
  }
});

test('Nardi page retains image assets required by the approved board', () => {
  const html = read('areg-nardi.html');
  for (const name of ['board.png', 'ivory.png', 'dark.png']) {
    assert.ok(html.includes(`assets/nardi/${name}`));
    assert.ok(existsSync(resolve(root, 'assets/nardi', name)), `Missing asset: ${name}`);
  }
});
