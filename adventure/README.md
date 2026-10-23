# AREG Six Worlds — development control and acceptance gates

**Status (2026-10-24): REJECTED PROTOTYPE / NOT APPROVED GAMEPLAY.**
The current `adventure/index.html`, `adventure/adventure.js`, `adventure/worlds.js` and `adventure/game.js` are engineering experiments only. Do **not** treat generated sections, placeholder hero, generic puzzle or canvas scenery as approved designs. Do not promote them to main or AREG TEST production.

## Non-negotiable workflow
1. Read `AGENTS.md`, `WORKFLOW_START_HERE.md`, `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`, `NEW_CHAT_HANDOFF.md` and the entire AREG MASTER PROMPT before any gameplay write.
2. Inspect the exact approved Areg sprite, original movement source and licenses/asset locations. Never replace with a geometric placeholder. If missing, mark BLOCKED; do not fabricate approval.
3. Build a **single high-quality representative level** from the source's actual W01-S01 script with its own authored collision map, art layers, interaction sequence, camera, animation, audio, save and checkpoints. No procedural cloning as a substitute for 48 authored levels.
4. Test on desktop + mobile viewport, keyboard + touch, reload/save, death/reset, puzzle solvability, 30/60 FPS, offline and PWA integration before claiming any level complete.
5. Implement W01-S02 through S06 individually with unique verified puzzle logic; then W02 through W06 with source-specific environments and narratives. Each of 48 sections needs distinct authored content and regression coverage.
6. Every write stays on isolated trial branch. No main changes or production Render deployment without separate explicit user approval. Report commit, test results and failures honestly.

## Gates (must all pass before a level is called finished)
- **Visual**: approved Areg artwork, natural run/jump frames, designed background/parallax, consistent 2.5D quality; no rectangles standing in for final artwork.
- **Gameplay**: scripted level-specific objective and non-repeating puzzle; puzzle has a deterministic solution and failure/reset behavior.
- **Engineering**: reachable collision geometry, checkpoint/save schema, camera, controls, no blocking errors.
- **QA**: automated tests plus real mobile/DotKiosk user validation, with results documented.
- **Approval**: user explicitly approves trial before any release.

## Current gap register
- No verified approved Areg sprite or movement assets have been integrated.
- No authored W01-S01 map or complete puzzle has been delivered.
- The 48 generated section layouts are placeholders, not 48 designed levels.
- No full visual/animation/audio production or device QA has occurred.
- No final game is available.

## Next concrete engineering task
Locate and inspect the exact approved Areg image/movement source in repo history and the user's source materials; build W01-S01 to its script, replace temporary canvas graphics with approved visual assets, add automated collision/puzzle tests, and test before showing it. Do not generate more generic levels.
