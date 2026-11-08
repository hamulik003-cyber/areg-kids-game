import { CHECKERS, OFF_BOARD, advance, legalMoves, prepareTurn, roundPoints, startingPosition } from "./areg-nardi-rules.js?v=1";

const STORAGE_KEY = "areg-nardi-long-v1";
const PHASES = ["opening", "roll", "move", "pass", "won"];
const NAMES = ["Բաց", "Մուգ"];
const STONES = ["./assets/nardi/ivory.png", "./assets/nardi/dark.png"];
const FACES = [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
const COLUMNS = [253, 331, 409, 487, 565, 642, 808, 885, 963, 1041, 1118, 1196];
const POINT_WIDTH = 74;
const POINT_HEIGHT = 335;

const byId = (id) => document.getElementById(id);
const board = byId("board");
const dice = byId("dice");
const rollButton = byId("roll");
const offButton = byId("bear-off");
const remaining = byId("remaining");
const newRoundButton = byId("new-round");
const restartDialog = byId("restart-dialog");
const status = byId("status");
const turnLabel = byId("turn-label");
const players = [...document.querySelectorAll(".player")];
const scoreMarks = [byId("score-light"), byId("score-dark")];
const offCounts = [byId("off-light"), byId("off-dark")];
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const diceFaces = [...dice.children].map((face) => {
  const pips = Array.from({ length: 9 }, () => {
    const pip = document.createElement("i");
    pip.className = "pip";
    return pip;
  });
  face.append(...pips);
  return pips;
});

const pointButtons = Array.from({ length: 24 }, (_, index) => {
  const button = document.createElement("button");
  const lower = index < 12;
  const column = lower ? index : 23 - index;
  button.type = "button";
  button.className = "point";
  button.dataset.point = index;
  button.dataset.row = lower ? "lower" : "upper";
  button.style.left = (COLUMNS[column] - 151) / 1144 * 100 + "%";
  button.style.top = ((lower ? 588 : 147) - 15) / 1048 * 100 + "%";
  button.addEventListener("click", () => choosePoint(index));
  return button;
});
byId("points").append(...pointButtons);

function freshRound(scores = [0, 0]) {
  return {
    ...startingPosition(), scores, phase: "opening", player: 0, started: [false, false],
    roll: [], remaining: [], headMoves: 0, headLimit: 1,
  };
}

function validList(list, length, valid) {
  return Array.isArray(list) && list.length === length && list.every(valid);
}

function isDie(value) {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

function readRound() {
  try {
    const game = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const natural = (value) => Number.isSafeInteger(value) && value >= 0;
    if (!game || !PHASES.includes(game.phase) || ![0, 1].includes(game.player) ||
        !validList(game.points, 24, (value) => Number.isInteger(value) && Math.abs(value) <= CHECKERS) ||
        !validList(game.off, 2, natural) || !validList(game.scores, 2, natural) ||
        !validList(game.started, 2, (value) => typeof value === "boolean") ||
        !Array.isArray(game.roll) || ![0, 2].includes(game.roll.length) || !game.roll.every(isDie) ||
        !Array.isArray(game.remaining) || game.remaining.length > 4 ||
        !game.remaining.every((value) => isDie(value) && game.roll.includes(value)) ||
        ![1, 2].includes(game.headLimit) || !natural(game.headMoves) || game.headMoves > game.headLimit) {
      return freshRound();
    }
    const counts = [...game.off];
    game.points.forEach((count) => { counts[count < 0 ? 1 : 0] += Math.abs(count); });
    if (counts.some((count) => count !== CHECKERS)) return freshRound();
    if ((game.phase === "won") !== (game.off[game.player] === CHECKERS)) return freshRound();
    return game;
  } catch {
    return freshRound();
  }
}

let game = readRound();
let available = game.phase === "move" ? legalMoves(game) : [];
if (game.phase === "move" && !available.length) game.phase = "pass";
let selected = null;
let chosenDie = null;
let moving = false;
let rollPreview = null;
const busy = () => moving || rollPreview !== null;

function saveRound() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(game)); } catch {}
}

function stoneImage(player) {
  const img = new Image();
  img.className = "stone";
  img.alt = "";
  img.draggable = false;
  img.src = STONES[player];
  return img;
}

function paintStones(point, count) {
  if (point.dataset.count === String(count)) return;
  point.dataset.count = count;
  point.replaceChildren();
  const total = Math.abs(count);
  if (!total) return;
  const lower = point.dataset.row === "lower";
  const tokens = [];
  // Keep every checker centered in a single full-size stack.
  const diameter = 68;
  const spacing = total <= 5 ? 59 : 42; // Fifteen-stone stack is about three checker widths shorter; checker diameter stays unchanged.
  for (let i = 0; i < total; i++) {
    const stone = stoneImage(count < 0 ? 1 : 0);
    const inward = diameter / 2 + i * spacing;
    stone.style.width = diameter / POINT_WIDTH * 100 + "%";
    stone.style.left = "50%";
    stone.style.top = (lower ? POINT_HEIGHT - inward : inward) / POINT_HEIGHT * 100 + "%";
    tokens.push(stone);
  }
  point.append(...tokens);
}

function paintDice(values) {
  dice.hidden = values.length !== 2;
  if (dice.hidden) return;
  dice.style.setProperty("--dice-x", game.phase === "opening" || game.player === 0 ? "73%" : "27%");
  dice.setAttribute("aria-label", "Զառեր՝ " + values.join(" և "));
  diceFaces.forEach((pips, index) => {
    const dots = FACES[values[index] - 1];
    pips.forEach((pip, slot) => pip.classList.toggle("on", dots.includes(slot)));
  });
}

function eligibleMoves() {
  return chosenDie === null ? available : available.filter((move) => move.die === chosenDie);
}

function paintRemaining() {
  remaining.replaceChildren();
  if (game.phase !== "move") return;
  for (const [index, value] of game.remaining.entries()) {
    const button = document.createElement("button");
    const canUse = available.some((move) => move.die === value);
    button.type = "button";
    button.textContent = value;
    button.disabled = busy() || !canUse || game.remaining.every((die) => die === value);
    button.setAttribute("aria-label", "Մնացած զառ " + (index + 1) + "՝ " + value);
    button.setAttribute("aria-pressed", String(chosenDie === value));
    button.addEventListener("click", () => {
      chosenDie = chosenDie === value ? null : value;
      if (selected !== null && !eligibleMoves().some((move) => move.from === selected)) selected = null;
      render();
      remaining.children[index]?.focus();
    });
    remaining.append(button);
  }
}

function statusText() {
  if (rollPreview) return "Զառերը նետվում են…";
  switch (game.phase) {
    case "opening":
      return game.roll.length ? "Զառերը հավասար են։ Նետիր նորից։" : "Նետիր զառերը՝ որոշելու առաջին հերթը։";
    case "roll": return "Նետիր զառերը։";
    case "pass": return "Այս զառերով քայլ չկա։ Փոխանցիր հերթը։";
    case "won": return roundPoints(game, game.player) === 2 ? "Հաղթանակ մարսով · 2 միավոր" : "Հաղթանակ · 1 միավոր";
    default: return selected === null ? "Ընտրիր ընդգծված քարերից մեկը։" : "Ընտրիր քարի նոր կետը։";
  }
}

function render() {
  const moves = eligibleMoves();
  const sources = new Set(moves.map((move) => move.from));
  const targets = new Set(moves.filter((move) => move.from === selected).map((move) => move.to));
  pointButtons.forEach((point, index) => {
    const count = game.points[index];
    paintStones(point, count);
    const action = index === selected ? "selected" : targets.has(index) ? "target" : sources.has(index) ? "source" : "";
    point.dataset.action = action;
    point.disabled = busy() || !action;
    point.setAttribute("aria-pressed", String(index === selected));
    const label = count ? NAMES[count < 0 ? 1 : 0] + " · " + Math.abs(count) + " քար" : "ազատ";
    point.setAttribute("aria-label", "Կետ " + (index + 1) + " · " + label);
  });
  players.forEach((player, index) => {
    player.classList.toggle("active", game.phase !== "opening" && game.player === index);
    offCounts[index].textContent = game.off[index];
    const score = String(game.scores[index]);
    scoreMarks[index].setAttribute("visibility", game.scores[index] ? "visible" : "hidden");
    const number = scoreMarks[index].querySelector("text");
    const size = score.length === 1 ? 157 : 154 / score.length;
    number.setAttribute("style", "font-size:" + size + "px");
    number.setAttribute("y", String(266 + size * .36));
    number.textContent = score;
  });
  byId("scoreboard").setAttribute("aria-label", "Հաշիվը՝ " + game.scores.join("–"));
  turnLabel.textContent = game.phase === "opening" ? "ԵՐԿԱՐ ՆԱՐԴԻ · 2 ԽԱՂԱՑՈՂ" :
    game.phase === "won" ? NAMES[game.player] + " քարերը հաղթեցին" : NAMES[game.player] + " քարերի հերթն է";
  const message = statusText();
  if (status.textContent !== message) status.textContent = message;
  rollButton.hidden = game.phase === "move";
  rollButton.disabled = busy();
  rollButton.textContent = game.phase === "pass" ? "Փոխանցել հերթը" :
    game.phase === "won" ? "Հաջորդ պարտիան" : "Նետել զառերը";
  offButton.hidden = !targets.has(OFF_BOARD);
  offButton.disabled = busy();
  newRoundButton.hidden = game.phase === "opening" || game.phase === "won";
  newRoundButton.disabled = busy();
  paintDice(rollPreview ?? game.roll);
  dice.classList.toggle("rolling", rollPreview !== null);
  paintRemaining();
}

function nextPlayer() {
  game = { ...game, phase: "roll", player: 1 - game.player, roll: [], remaining: [], headMoves: 0, headLimit: 1 };
  available = [];
}

function newRound() {
  game = freshRound(game.scores);
  available = [];
  selected = null;
  chosenDie = null;
  saveRound();
  render();
}

function beginTurn(player, values) {
  const turn = prepareTurn(game, player, values, !game.started[player]);
  const started = game.started.slice();
  started[player] = true;
  available = legalMoves(turn);
  game = { ...game, ...turn, started, roll: values, phase: available.length ? "move" : "pass" };
}

const randomDie = () => 1 + Math.floor(Math.random() * 6);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function roll() {
  if (busy() || game.phase === "move") return;
  if (game.phase === "won") { newRound(); return; }
  if (game.phase === "pass") {
    nextPlayer();
    saveRound();
    render();
    return;
  }
  const values = [randomDie(), randomDie()];
  if (!reducedMotion.matches) {
    rollPreview = [randomDie(), randomDie()];
    render();
    const timer = setInterval(() => {
      rollPreview = [randomDie(), randomDie()];
      paintDice(rollPreview);
    }, 75);
    await wait(610);
    clearInterval(timer);
    rollPreview = null;
  }
  if (game.phase === "opening") {
    if (values[0] === values[1]) game = { ...game, roll: values };
    else beginTurn(values[0] > values[1] ? 0 : 1, values);
  } else {
    beginTurn(game.player, values);
  }
  saveRound();
  render();
}

function lastStone(index) {
  return pointButtons[index].querySelector(".stone:last-of-type");
}

async function animateStone(start, target, player, leaving) {
  if (!start || !target || reducedMotion.matches || !Element.prototype.animate) return;
  const end = target.getBoundingClientRect();
  if (!end.width || !start.width) return;
  const ghost = stoneImage(player);
  ghost.className = "moving-stone";
  Object.assign(ghost.style, { left: start.left + "px", top: start.top + "px", width: start.width + "px", height: start.height + "px" });
  if (!leaving) target.style.visibility = "hidden";
  document.body.append(ghost);
  const dx = end.left + (end.width - start.width) / 2 - start.left;
  const dy = end.top + (end.height - start.height) / 2 - start.top;
  const scale = leaving ? .55 : end.width / start.width;
  try {
    await ghost.animate([
      { transform: "translate(0,0) scale(1)" },
      { transform: "translate(" + dx * .55 + "px," + (dy * .55 - 12) + "px) scale(1.16)", offset: .56 },
      { transform: "translate(" + dx + "px," + dy + "px) scale(" + scale + ")", opacity: leaving ? .35 : 1 },
    ], { duration: 320, easing: "cubic-bezier(.22,.7,.26,1)" }).finished;
  } catch {
    // The iframe can be removed while a move is in flight.
  } finally {
    ghost.remove();
    if (!leaving) target.style.visibility = "";
  }
}

async function moveChecker(move) {
  const player = game.player;
  const start = lastStone(move.from)?.getBoundingClientRect();
  const leaving = move.to === OFF_BOARD;
  moving = true;
  game = advance(game, move);
  selected = null;
  chosenDie = null;
  if (game.off[player] === CHECKERS) {
    const scores = game.scores.slice();
    scores[player] += roundPoints(game, player);
    game = { ...game, scores, phase: "won", remaining: [] };
    available = [];
  } else {
    available = legalMoves(game);
    if (!available.length) nextPlayer();
  }
  saveRound();
  render();
  try {
    await animateStone(start, leaving ? players[player] : lastStone(move.to), player, leaving);
  } finally {
    moving = false;
    render();
  }
}

function choosePoint(point) {
  if (busy() || game.phase !== "move") return;
  const moves = eligibleMoves();
  const move = moves.find((option) => option.from === selected && option.to === point);
  if (move) { void moveChecker(move); return; }
  if (moves.some((option) => option.from === point)) {
    selected = selected === point ? null : point;
    render();
  }
}

// The visible fifteen-checker stack extends beyond its point button. Allow a tap
// on ANY visible checker to select that point, not only the bottom six.
byId("points").addEventListener("click", (event) => {
  if (busy() || game.phase !== "move") return;
  const x = event.clientX, y = event.clientY;
  const sourcePoints = new Set(eligibleMoves().map((move) => move.from));
  // Prioritize visible checkers over transparent overlapping point hitboxes.
  for (const index of sourcePoints) {
    const stones = pointButtons[index].querySelectorAll(".stone");
    for (let i = stones.length - 1; i >= 0; i--) {
      const rect = stones[i].getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top &&
          y <= rect.bottom) {
        if (event.target.closest(".point")?.dataset.point === String(index)) return;
        event.stopPropagation();
        choosePoint(index);
        return;
      }
    }
  }
}, true);

rollButton.addEventListener("click", roll);
offButton.addEventListener("click", () => {
  const move = eligibleMoves().filter((option) => option.from === selected && option.to === OFF_BOARD)
    .sort((a, b) => b.die - a.die)[0];
  if (!busy() && move) void moveChecker(move);
});
newRoundButton.addEventListener("click", () => {
  restartDialog.returnValue = "";
  restartDialog.showModal();
});
restartDialog.addEventListener("close", () => {
  if (restartDialog.returnValue === "restart") newRound();
});
board.addEventListener("contextmenu", (event) => event.preventDefault());
render();
