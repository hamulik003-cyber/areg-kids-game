import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/areg-isolated-audit.yml', import.meta.url), 'utf8');
const policy = readFileSync(new URL('../AREG_SAFETY_POLICY.md', import.meta.url), 'utf8');

test('isolated audit runs only on the safety branch and has read-only permissions', () => {
  assert.match(workflow, /branches:\s*\n\s*- safety\/areg-audit-pilot-20261109/);
  assert.match(workflow, /^permissions:\s*\n\s*contents: read\s*$/m);
  assert.doesNotMatch(workflow, /contents:\s*write|pull-requests:\s*write|id-token:\s*write/);
  assert.doesNotMatch(workflow, /\b(?:push|pull_request|pull_request_target|schedule):\s*\n(?=\s*branches:)/);
});

test('browser jobs stay isolated from deployment and use supported pinned runner', () => {
  assert.match(workflow, /browser-smoke:\s*\n(?:[^\n]*\n)*?\s*runs-on: ubuntu-24\.04/);
  assert.match(workflow, /matrix:\s*\n\s*engine: \[chromium, webkit\]/);
  assert.match(workflow, /playwright@1\.56\.1/);
  assert.match(workflow, /persist-credentials: false/g);
  assert.doesNotMatch(workflow, /\b(?:git push|gh release|render deploy|workflow_run|deployment|deploy-pages)\b/i);
});

test('approval policy explicitly forbids automatic game edits and production merges', () => {
  assert.match(policy, /Do not merge to AREG TEST or `main` without explicit user approval/);
  assert.match(policy, /no auto-fix, no auto-merge/);
  assert.match(policy, /iOS Safari and home-screen PWA still require device verification/);
});
