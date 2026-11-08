import assert from "node:assert/strict";
import test from "node:test";
import {
  CHECKERS, OFF_BOARD, advance, legalMoves, prepareTurn, roundPoints, startingPosition,
} from "../areg-nardi-rules.js";

function position(light, dark, off = [0, 0]) {
  const points = Array(24).fill(0);
  for (const [point, count] of light) points[point] = count;
  for (const [point, count] of dark) points[point] = -count;
  return { points, off };
}

function singleDie(pos, player, die) {
  return { ...pos, player, remaining: [die], headMoves: 0, headLimit: 1 };
}

test("both heads start with 15 checkers and both colors travel around the same circuit", () => {
  const initial = startingPosition();
  assert.deepEqual(initial, position([[0, 15]], [[12, 15]]));
  for (const [player, head] of [[0, 0], [1, 12]]) {
    const turn = prepareTurn(initial, player, [2, 5], true);
    assert.deepEqual(legalMoves(turn), [
      { from: head, to: head + 2, die: 2 },
      { from: head, to: head + 5, die: 5 },
    ]);
    const next = advance(turn, legalMoves(turn)[0]);
    assert.deepEqual(legalMoves(next), [{ from: head + 2, to: head + 7, die: 5 }]);
  }
  const aroundCorner = position([], [[23, 15]], [15, 0]);
  assert.deepEqual(legalMoves(singleDie(aroundCorner, 1, 2)), [{ from: 23, to: 1, die: 2 }]);
});

test("opening 3–3, 4–4 and 6–6 allow a second checker from the head when needed", () => {
  for (const [die, expected] of [[3, 4], [4, 4], [6, 2]]) {
    let turn = prepareTurn(startingPosition(), 0, [die, die], true);
    let used = 0;
    while (legalMoves(turn).length) {
      turn = advance(turn, legalMoves(turn)[0]);
      used++;
    }
    assert.equal(used, expected);
    assert.equal(turn.headMoves, 2);
    assert.equal(prepareTurn(startingPosition(), 0, [die, die], false).headLimit, 1);
  }
  assert.equal(prepareTurn(startingPosition(), 0, [2, 2], true).headLimit, 1);
});

test("only plays using the maximum dice are offered, with the higher die when only one can play", () => {
  const pos = position([[0, 14], [8, 1]], [[3, 1], [9, 14]]);
  const turn = prepareTurn(pos, 0, [1, 2], false);
  assert.deepEqual(legalMoves(turn), [{ from: 0, to: 1, die: 1 }, { from: 8, to: 10, die: 2 }]);

  const highOnly = prepareTurn(position([[0, 15]], [[3, 1], [12, 14]]), 0, [1, 2], false);
  assert.deepEqual(legalMoves(highOnly), [{ from: 0, to: 2, die: 2 }]);
  const blocked = prepareTurn(position([[0, 15]], [[1, 1], [2, 14]]), 0, [1, 2], false);
  assert.deepEqual(legalMoves(blocked), []);
});

test("a six-point wall needs an opponent ahead, and opposing points cannot be occupied", () => {
  const wall = [[0, 9], [13, 1], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1]];
  const blocked = position(wall, [[12, 15]]);
  const allowed = position(wall, [[12, 14], [20, 1]]);
  const target = (move) => move.from === 13 && move.to === 19;
  assert.equal(legalMoves(singleDie(blocked, 0, 6)).some(target), false);
  assert.equal(legalMoves(singleDie(allowed, 0, 6)).some(target), true);
  const occupied = position(wall, [[12, 14], [19, 1]]);
  assert.equal(legalMoves(singleDie(occupied, 0, 6)).some(target), false);
});

test("bearing off requires all checkers home and the correct die or the farthest checker", () => {
  const outside = position([[17, 1], [23, 14]], [[12, 15]]);
  assert.deepEqual(legalMoves(singleDie(outside, 0, 1)), [{ from: 17, to: 18, die: 1 }]);
  const home = position([[20, 1], [22, 1]], [[12, 15]], [13, 0]);
  assert.deepEqual(legalMoves(singleDie(home, 0, 5)), [{ from: 20, to: OFF_BOARD, die: 5 }]);
  assert.ok(legalMoves(singleDie(home, 0, 2)).some((move) => move.from === 22 && move.to === OFF_BOARD));
  const final = singleDie(position([[23, 1]], [[12, 15]], [14, 0]), 0, 1);
  const won = advance(final, legalMoves(final)[0]);
  assert.equal(won.off[0], CHECKERS);
  assert.equal(roundPoints(won, 0), 2);
  assert.equal(roundPoints({ off: [15, 1] }, 0), 1);
  assert.deepEqual(legalMoves(won), []);
});

test("complete seeded games conserve both sets of 15 checkers until victory", () => {
  let seed = 24015;
  function random(max) {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return Math.floor(seed / 2 ** 32 * max);
  }

  for (let round = 0; round < 16; round++) {
    let game = startingPosition();
    for (let turnIndex = 0; turnIndex < 1200 && Math.max(...game.off) < CHECKERS; turnIndex++) {
      let turn = prepareTurn(game, turnIndex % 2, [1 + random(6), 1 + random(6)], turnIndex < 2);
      while (true) {
        const moves = legalMoves(turn);
        if (!moves.length) break;
        turn = advance(turn, moves[random(moves.length)]);
        assert.equal(turn.points.reduce((sum, point) => sum + Math.max(0, point), turn.off[0]), CHECKERS);
        assert.equal(turn.points.reduce((sum, point) => sum + Math.max(0, -point), turn.off[1]), CHECKERS);
      }
      game = turn;
    }
    assert.equal(Math.max(...game.off), CHECKERS, "game " + (round + 1) + " reached a winner");
  }
});
