import test from 'node:test';
import assert from 'node:assert/strict';
import { discoverGamePages, localAssetReferences } from './areg-discovery.mjs';

test('new game pages are discovered automatically, without registering their names', () => {
  const fixture = `
    frame.src='./areg-checkers.html?v=1';
    frame.src='./areg-future-space-game.html?testv=2';
    frame.src='./areg-future-space-game.html?testv=3';
  `;
  assert.deepEqual(discoverGamePages(fixture), ['areg-checkers.html', 'areg-future-space-game.html']);
});

test('local asset discovery deduplicates references and removes query versions', () => {
  const html = `
    <link href="./future-game.css?v=9" rel="stylesheet">
    <script src="./future-game.js?v=3"></script>
    <img src="./assets/board.png?v=4">
    <img src="./assets/board.png?v=5">
    <script src="https://cdn.example.org/lib.js"></script>
  `;
  assert.deepEqual(localAssetReferences(html), ['./assets/board.png', './future-game.css', './future-game.js']);
});

test('discovery ignores remote URLs and non-AREG HTML pages', () => {
  assert.deepEqual(discoverGamePages(`frame.src='./other-game.html'; frame.src='./areg-example.html';`), ['areg-example.html']);
  assert.deepEqual(localAssetReferences('<script src="https://example.org/app.js"></script>'), []);
});
