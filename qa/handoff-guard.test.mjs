import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateHandoff,isDocumentationOnly,HANDOFF_FILES} from './handoff-guard.mjs';

const before={
 'CURRENT_STATUS.md':'## V264\nOriginal current status.',
 'PROJECT_HANDOFF.md':'## Project\nPrevious user decisions.'
};
const after={
 'CURRENT_STATUS.md':'## V265\nChanged sound; awaiting real DotKiosk.',
 'PROJECT_HANDOFF.md':'## Project\nUser requested quiet entrances; changed sound.'
};
test('both authoritative handoffs are required',()=>{
 assert.deepEqual(HANDOFF_FILES,['CURRENT_STATUS.md','PROJECT_HANDOFF.md']);
});
test('functional code plus both substantive updates passes',()=>{
 assert.equal(evaluateHandoff(['constellation-quest-v246.js',...HANDOFF_FILES],before,after).ok,true);
});
test('updating just one journal fails',()=>{
 const r=evaluateHandoff(['app.js','CURRENT_STATUS.md'],before,after);
 assert.equal(r.ok,false);assert.deepEqual(r.missing,['PROJECT_HANDOFF.md']);
});
test('assets, source, service worker and CI need both journals',()=>{
 for(const changed of [['space-3d-games.js'],['assets/constellations-transparent/one.webp'],
  ['.github/workflows/build-constellation-alpha.yml'],['service-worker.js']]){
  const r=evaluateHandoff(changed,before,after);
  assert.equal(r.ok,false,changed.join(','));
  assert.deepEqual(r.missing,HANDOFF_FILES);
 }
});
test('whitespace-only edit does not satisfy journal',()=>{
 const r=evaluateHandoff(['index.html',...HANDOFF_FILES],before,{
  'CURRENT_STATUS.md':'  ## V264 \n Original  current status.  ',
  'PROJECT_HANDOFF.md':after['PROJECT_HANDOFF.md']
 });
 assert.equal(r.ok,false);assert.deepEqual(r.missing,['CURRENT_STATUS.md']);
});
test('deleted journal is missing, even when file path is in diff',()=>{
 const r=evaluateHandoff(['app.js',...HANDOFF_FILES],before,{
  'CURRENT_STATUS.md':null,
  'PROJECT_HANDOFF.md':after['PROJECT_HANDOFF.md']
 });
 assert.equal(r.ok,false);assert.deepEqual(r.missing,['CURRENT_STATUS.md']);
});
test('documentation-only commits pass',()=>{
 for(const changed of [['CURRENT_STATUS.md'],['AGENTS.md','PROJECT_HANDOFF.md'],
  ['README.md','docs/changelog.md']]){
  assert.equal(evaluateHandoff(changed,before,after).ok,true);
 }
});
test('runtime and infrastructure modifications are functional',()=>{
 assert.equal(isDocumentationOnly('AGENTS.md'),true);
 for(const p of ['qa/full-audit.mjs','manifest.webmanifest','space-3d-games.css',
  '.github/workflows/areg-full-audit.yml'])assert.equal(isDocumentationOnly(p),false,p);
});
