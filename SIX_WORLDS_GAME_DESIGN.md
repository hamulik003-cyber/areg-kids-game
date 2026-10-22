# ԱՐԵԳ․ ՎԵՑ ԱՇԽԱՐՀՆԵՐԻ ԳԱՂՏՆԻՔԸ — GAME DESIGN / IMPLEMENTATION PLAN
Status: design approved by user brief; implementation IN PROGRESS, not approved for main.
Core loop: observe obstacle → discover physical cause → manipulate world → verify visible result → advance.
Worlds (4 levels each):
1 Forest: 1.1 log raft / hidden tree; 1.2 counterweight bridge / water / lift; 1.3 symbol order / root tunnel; 1.4 guardian / falling rocks / pressure plates.
2 Water: 2.1 three valves / buoyancy; 2.2 sunken tower / airlocks; 2.3 steam pressure / cooling; 2.4 pipe-fed boss.
3 Clock Mountains: 3.1 gears / moving platforms; 3.2 interdependent towers; 3.3 rotating rooms; 3.4 temporal guardian.
4 Sky: 4.1 wind vectors; 4.2 aircraft reconstruction; 4.3 disappearing cloud maze; 4.4 lightning conductor boss.
5 Castle: 5.1 three-key backtracking; 5.2 lava routing; 5.3 reflected light; 5.4 iron giant / self-damage.
6 Stars: 6.1 energy bridges; 6.2 six-core mechanism; 6.3 synthesis maze; 6.4 three-phase Shadow Master.
For EVERY level: 3 optional secrets, one secret area, one optional puzzle, one hinted shortcut. All unimplemented until independently coded and verified.

## Vertical slice: 1.1 «Կորած ճանապարհը»
Goal: reach other bank by pushing a log into water. Entry: safe movement/jump area. Discovery: wide river gap and loose log. Investigation: push log with action while beside it. Solution: log becomes buoyant floating raft when crossing river lip. Escalation: jump from raft to far ledge. Result: checkpoint + level clear. Hidden tree star rewards exploration, never blocks completion.
State model: idle log → pushing → afloat → landed on far bank; log cannot vanish or permanently block progress. Restart resets level; death respawns at safe checkpoint. Completion requires crossing the river; star is optional.
Inputs: preserve approved Areg art, animation and analog; jump and contextual action button; desktop arrows/A,D Space,E, Escape.
QA gates: collision feet/ledge, coyote time 100ms, jump buffer 120ms, push speed, log on water, raft carry, death reset, win state, iPhone landscape, audio gesture unlock, local save, no unreachable jump, stable 60 FPS target.
Architecture target: modular ES modules for scene/physics/puzzles/render/audio/save; retain existing iframe + canonical parent header; migration to Phaser 3 only if dependency is vendored and verified offline/PWA. Avoid external CDN.
Release policy: only trial branch; do not merge main until explicit user approval and device QA.
