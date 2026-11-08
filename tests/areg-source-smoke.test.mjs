import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Read-only presence checks: do not assert unapproved gameplay rules or pixel appearance.
// These checks detect missing/truncated files, not gameplay correctness.
const games = [
  { file: 'areg-checkers.html', title: 'Շաշկի', markers: ['capture', 'king', 'invite'] },
  { file: 'areg-sea-battle.html', title: 'Ծովամարտ', markers: ['ship', 'hit', 'invite'] },
  { file: 'areg-nardi.html', title: 'Նարդի', markers: ['areg-nardi.css', 'areg-nardi.js'] },
];
for (const { file, title, markers } of games) {
  test(`${title}: source file and approved core features are present`, () => {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.ok(source.length > 1000, `${file} appears empty or truncated`);
    for (const marker of markers) {
      assert.ok(source.toLowerCase().includes(marker.toLowerCase()), `${file} is missing expected marker ${marker}`);
    }
  });
}
