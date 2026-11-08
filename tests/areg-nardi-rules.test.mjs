import test from 'node:test';
import assert from 'node:assert/strict';
import { CHECKERS, OFF_BOARD, startingPosition, prepareTurn, legalMoves, advance, roundPoints } from '../areg-nardi-rules.js';

test('approved initial layout preserves 15 stones per side', () => {
  const state = startingPosition();
  assert.equal(state.points.length, 24);
  assert.equal(state.points[0], CHECKERS);
  assert.equal(state.points[12], -CHECKERS);
  assert.equal(state.points.reduce((sum,n)=>sum+n,0),0);
  assert.deepEqual(state.off,[0,0]);
});
test('ordinary dice allow legal moves without modifying initial state', () => {
  const state = startingPosition();
  const before = structuredClone(state);
  const turn = prepareTurn(state,0,[1,2],true);
  const moves = legalMoves(turn);
  assert.ok(moves.length > 0);
  for(const move of moves) {
    assert.ok(move.from >= 0 && move.from < 24);
    assert.ok(move.to === OFF_BOARD || (move.to >= 0 && move.to < 24));
    assert.ok([1,2].includes(move.die));
    const next = advance(turn,move);
    assert.equal(next.remaining.length,1);
    assert.equal(next.points.reduce((sum,n)=>sum+Math.max(0,n),0)+next.off[0],CHECKERS);
    assert.equal(next.points.reduce((sum,n)=>sum+Math.max(0,-n),0)+next.off[1],CHECKERS);
  }
  assert.deepEqual(state,before);
});
test('double roll contains four dice', () => {
  assert.deepEqual(prepareTurn(startingPosition(),0,[3,3],true).remaining,[3,3,3,3]);
});
test('approved round scoring uses 2 only if loser bore off nothing', () => {
  const state=startingPosition();
  assert.equal(roundPoints(state,0),2);
  assert.equal(roundPoints({...state,off:[0,1]},0),1);
});

test('second player starts at its own head and retains stone counts after a move', () => {
  const position = startingPosition();
  const turn = prepareTurn(position, 1, [1, 2], true);
  const moves = legalMoves(turn);
  assert.ok(moves.length > 0);
  for (const move of moves) {
    assert.equal(move.from, 12);
    const next = advance(turn, move);
    assert.equal(next.points.reduce((sum, n) => sum + Math.max(0, n), 0) + next.off[0], CHECKERS);
    assert.equal(next.points.reduce((sum, n) => sum + Math.max(0, -n), 0) + next.off[1], CHECKERS);
    assert.deepEqual(turn.points, position.points);
  }
});

test('finished game does not offer additional moves', () => {
  const position = startingPosition();
  position.points[0] = 0;
  position.off[0] = CHECKERS;
  const turn = prepareTurn(position, 0, [2, 5], false);
  assert.deepEqual(legalMoves(turn), []);
});

test('moves never land on a point occupied by the opponent', () => {
  for (const player of [0, 1]) {
    const position = startingPosition();
    for (const roll of [[1, 2], [3, 4], [5, 6], [6, 6]]) {
      const turn = prepareTurn(position, player, roll, true);
      for (const move of legalMoves(turn)) {
        if (move.to !== OFF_BOARD) {
          const opponentSign = player === 0 ? -1 : 1;
          assert.ok(position.points[move.to] * opponentSign <= 0);
        }
      }
    }
  }
});
