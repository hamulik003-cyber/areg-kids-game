import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = readFileSync(resolve(root, 'app.js'), 'utf8');

// Automatically discovers future standalone AREG HTML games referenced by app.js.
// No fixed list of games; no changes to game code. Historical/dormant references
// are reported, not failed, until a separate approved manifest identifies active games.
const discovered = [...new Set([...app.matchAll(/\bareg-[a-z0-9-]+\.html\b/g)].map(m => m[0]))].sort();
test('game discovery finds the existing AREG entry points', () => {
  assert.ok(discovered.length >= 3, 'Unexpected loss of game entry points from app.js');
});
for (const name of discovered) {
  test(`discovered game: ${name}`, (t) => {
    const path = resolve(root, name);
    if (!existsSync(path)) {
      t.diagnostic(`Referenced but missing: ${name}. This may be a retired game; review before making it a blocking failure.`);
      return;
    }
    const html = readFileSync(path, 'utf8');
    assert.ok(html.trim().length > 100, `${name} is unexpectedly empty`);
    assert.match(html, /<html\b/i, `${name} has no HTML root`);
    assert.match(html, /<meta\s+name=["']viewport["']/i, `${name} lacks a viewport meta tag`);
    // Only literal local relative references are inspected. Dynamic imports and
    // runtime-generated URLs need separate browser checks.
    const references = [...html.matchAll(/(?:src|href)\\s*=\\s*["'](\\.\\/[^"'#?]+(?:\\?[^"'#]*)?)["']/gi)]
      .map(match => match[1].split('?')[0]);
    for (const reference of new Set(references)) {
      const target = resolve(root, reference);
      if (!existsSync(target)) {
        t.diagnostic(`Missing local reference in ${name}: ${reference} (non-blocking; review before fixing)`);
      }
    }
    t.diagnostic(`Inspected ${basename(path)} (read-only); interactive behavior is not covered.`);
  });
}
