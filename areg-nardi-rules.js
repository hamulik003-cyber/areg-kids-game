// The two players follow the same circuit, with heads 12 points apart.
export const CHECKERS = 15;
export const OFF_BOARD = -1;
const POINTS = 24;
const HOME_START = 18;
const HEADS = [0, 12];

const distance = (point, player) => (point - HEADS[player] + POINTS) % POINTS;
const pointAt = (step, player) => (HEADS[player] + step) % POINTS;
const color = (player) => player === 0 ? 1 : -1;

export function startingPosition() {
  const points = Array(POINTS).fill(0);
  points[HEADS[0]] = CHECKERS;
  points[HEADS[1]] = -CHECKERS;
  return { points, off: [0, 0] };
}

function longestChain(points, player, sign, from, to) {
  if (points[to] !== 0) return false;
  const opponent = 1 - player;
  const step = distance(to, opponent);
  let before = step;
  let after = step;
  const held = (progress) => {
    const point = pointAt(progress, opponent);
    return point === to || points[point] * sign > (point === from ? 1 : 0);
  };

  while (before > 0 && held(before - 1)) before--;
  while (after < POINTS - 1 && held(after + 1)) after++;
  if (after - before < 5) return false;

  // A six-point prime needs an opposing checker ahead of it.
  for (let i = after + 1; i < POINTS; i++) {
    if (points[pointAt(i, opponent)] * sign < 0) return false;
  }
  return true;
}

function movesForDie(turn, die) {
  const { points, off, player, headMoves, headLimit } = turn;
  const sign = color(player);
  const canLeaveHead = headMoves < headLimit;
  const moves = [];
  for (let step = 0, hasFarther = false; step < POINTS; step++) {
    const from = pointAt(step, player);
    if (points[from] * sign <= 0) continue;

    const next = step + die;
    if (next >= POINTS) {
      if (step >= HOME_START && (!hasFarther || next === POINTS)) {
        // Everything outside the home board must arrive before bearing off.
        const inHome = points.every((count, point) => count * sign <= 0 || distance(point, player) >= HOME_START);
        if (inHome) moves.push({ from, to: OFF_BOARD, die });
      }
    } else if (step !== 0 || canLeaveHead) {
      const to = pointAt(next, player);
      if (points[to] * sign >= 0 && (off[1 - player] > 0 || !longestChain(points, player, sign, from, to))) {
        moves.push({ from, to, die });
      }
    }
    hasFarther = true;
  }
  return moves;
}

// A move returned by legalMoves consumes exactly one die.
export function advance(turn, move) {
  const points = turn.points.slice();
  const off = turn.off.slice();
  const remaining = turn.remaining.slice();
  const sign = color(turn.player);
  points[move.from] -= sign;
  if (move.to === OFF_BOARD) off[turn.player]++;
  else points[move.to] += sign;
  remaining.splice(remaining.indexOf(move.die), 1);
  return {
    ...turn, points, off, remaining,
    headMoves: turn.headMoves + Number(move.from === HEADS[turn.player]),
  };
}

function candidates(turn) {
  return [...new Set(turn.remaining)].flatMap((die) => movesForDie(turn, die));
}

function bestLength(turn, memo) {
  if (!turn.remaining.length || turn.off[turn.player] === CHECKERS) return 0;
  const key = turn.points.join(",") + "/" + turn.remaining.join("") + "/" + turn.headMoves;
  if (memo.has(key)) return memo.get(key);
  let best = 0;
  for (const move of candidates(turn)) {
    best = Math.max(best, 1 + bestLength(advance(turn, move), memo));
    if (best === turn.remaining.length) break;
  }
  memo.set(key, best);
  return best;
}

export function prepareTurn(position, player, roll, firstTurn) {
  const isDouble = roll[0] === roll[1];
  const turn = {
    points: position.points, off: position.off, player,
    remaining: isDouble ? Array(4).fill(roll[0]) : roll.slice(),
    headMoves: 0, headLimit: 1,
  };
  if (firstTurn && isDouble && [3, 4, 6].includes(roll[0]) && bestLength(turn, new Map()) < 4) {
    turn.headLimit = 2;
  }
  return turn;
}

export function legalMoves(turn) {
  if (turn.off[turn.player] === CHECKERS) return [];
  const memo = new Map();
  const options = candidates(turn).map((move) => ({ move, count: 1 + bestLength(advance(turn, move), memo) }));
  const best = Math.max(0, ...options.map(({ count }) => count));
  const bestMoves = options.filter(({ count }) => count === best).map(({ move }) => move);
  if (best !== 1) return bestMoves;
  const higher = Math.max(...bestMoves.map(({ die }) => die));
  return bestMoves.filter(({ die }) => die === higher);
}

export function roundPoints(position, winner) {
  return position.off[1 - winner] === 0 ? 2 : 1;
}
