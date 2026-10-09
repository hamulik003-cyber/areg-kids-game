import test from 'node:test';
import assert from 'node:assert/strict';
import {classifyFindingResult} from '../space-finding-session.js';
test('more correct answers gets cheerful applause outcome',()=>{
  for(const [correct,wrong] of [[1,0],[38,2],[30,29],[4,3]])
    assert.equal(classifyFindingResult(correct,wrong),'success');
});
test('more incorrect answers gets gentle encouragement, not alarming fail',()=>{
  for(const [correct,wrong] of [[0,1],[1,3],[7,20]])
    assert.equal(classifyFindingResult(correct,wrong),'encourage');
});
test('ties are neutral, including a zero answer count',()=>{
  for(const [correct,wrong] of [[0,0],[1,1],[38,38]])
    assert.equal(classifyFindingResult(correct,wrong),'tie');
});
