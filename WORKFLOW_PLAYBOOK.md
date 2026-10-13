# AREG KIDS GAME — ՊԱՐՏԱԴԻՐ ԱՇԽԱՏԱՆՔԱՅԻՆ ՁԵՌՆԱՐԿ / MANDATORY WORKFLOW

**ԿԱՐԴԱ ԱՌԱՋԻՆԸ.** This is the user's own requested working contract, not an approval for uncontrolled edits or publication. Date: 2026-10-13. Repository: `hamulik003-cyber/areg-kids-game`.

## 1. ՄԵՐ ԻՐԱԿԱՆ ԱՇԽԱՏԵԼԱՈՃԸ — USER EXPECTATION

The user is a hands-on creator, tests on iPhone Safari and via Add to Home Screen/PWA/DotKiosk, and communicates brief Armenian instructions like «էս ուղղի», «մի քիչ փոքրացրու», «հետ դիր», «լինկը տուր». The assistant is expected to act as an implementation partner, not merely an adviser. Typical iteration:

1. User specifies a specific visual/gameplay issue and may attach screenshot/video.
2. Assistant independently checks actual GitHub repo state + working branch/files + deployments, and reproduces/reasons about the exact issue.
3. Assistant implements **only the requested change** in isolated trial code/branch. Preserve existing images, audio, animation, geometry, layout, scores and state unrelated to the task. If the change is risky, keep previous version available and make a new trial file/version.
4. Assistant tests what it CAN test (syntax, resource paths, logic, build, Render/GitHub status, etc.). **Do not falsely claim real iPhone testing**, and never claim a deployment is live while it is still building.
5. Assistant deploys a working preview using the connected hosting provider when accessible, waits for confirmed **live**, then directly supplies a **clickable URL that opens in Safari**. Mention exactly what changed and what remained untouched, in conversational Armenian. The user tests it and reports «լավա» or «վատա».
6. On «լավա», record that approval's exact **scope**; continue the next small iteration. On «հետ դիր», revert to the previous **user-liked version**; do not insist newer commit is better. On «հիմնականում դիր» / explicit production approval, perform appropriately reviewed/tested production integration; never infer production approval from praising a trial.
7. After each real change, log exact paths, source/commit, preview URL, deployed/not deployed/test status, user-approved vs pending, rollback and next step in all 3 status/handoff files. At the end of each chat leave the next one able to pick up at exactly the same point. Do not make user repeat established decisions.
8. If a connector write/deploy fails, explain **what operation was blocked**, what remained unchanged, and whether a retry/different permitted method is available. Do not make broad “can't do that” claims when connected GitHub/Render writes previously succeeded. Do not fabricate URLs/commits/tests. Do not force user to manually download/upload files when direct connector workflow is available.

**VERY IMPORTANT:** «@GitHub» / «խաղի մեջ փոխի» refers to editing actual GitHub game files, NOT image generation, theoretical instructions, or an unrelated prototype. The user likes concrete changes and testable URLs, not progress reports or unrelated generated pictures. Be specific and warm, but never say “ready” if not committed, deployed and verified live.

## 2. START OF EVERY NEW CHAT (DO THIS WITHOUT BEING ASKED)

- Access live repo `hamulik003-cyber/areg-kids-game`, confirm `main` SHA, read `AGENTS.md`, `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`, `NEW_CHAT_HANDOFF.md` (current and, if the user's request concerns a trial, read the trial versions too). Review appropriate thematic handoffs, real files, branches, recent changes, tests, open PRs, backups and deploy status. Last commit **is not automatically an approved baseline**.
- Present in **brief Armenian**: verified production SHA and approval status, completed relevant features, active user-liked trial, what is pending / what was rejected, current exact working URL, and the next action. Do NOT guess the deployment from old docs. Distinguish current production from experiments.
- A new chat should respond to an actionable user's fix with a real attempted implementation where permissions/tools allow, not with “I can't” based on lack of conversation context.

## 3. SECURITY, SCOPES, SAFETY

- `main` is the real production game and must remain protected from trial iterations. Changes to main only after explicit user approval of specific scope and passing appropriate checks. Keep backup/rollback and PWA cache compatibility.
- Work in an isolated trial branch or copy, e.g. `trial/mind-games-3d-2026-10-13`. Only targeted files. Preserve the user-approved visual references, animations, play logic, music/voice, performance, PWA/DotKiosk compatibility, and backup system.
- When user says **«միայն ուսումնասիրիր»**: NO write operations.
- Tests: JS syntax/linkage, expected assets, touch behavior (where testable), viewport dimensions, stage advancement, sounds, error/success effects, consistency of 3D shape/holes, cache busting as needed. Mobile Home Screen has different available canvas height than Safari. Don't silently swap/rework unrelated design.
- If user says «հետ դիր» revert the **specific latest trial change or requested change**; do not roll back unrelated production merges or overwrite unrelated people's commits.
- This document is an assistant operating guide, not permission to bypass platform safety checks, provider access restrictions, or approval-gated release operations.

## 4. THE CURRENT 3D SHAPE SORTER — EXACT REFERENCE

**Trial repository branch:** `trial/mind-games-3d-2026-10-13`; separate from main. 
**User-liked proven visual baseline:** `mind-shapes-deluxe-v4.html` / `mind-shapes-deluxe-v4.js`, link:
https://areg-mind-games-trial-20261013.onrender.com/mind-shapes-deluxe-v4.html?v=20261013e

**Rejected:** v5 auto-fit/strong zoom shrink when rotating, which the user disliked. Don't revive it.
**Newer unapproved tests:** v6 and **v7**, produced for differences between Safari browser and iPhone Add-to-Home-Screen; v7 changes only standalone portrait camera distance by +5% atop v6's aspect handling while preserving Safari's look. Check its actual deploy before calling it live or approved:
https://areg-mind-games-trial-20261013.onrender.com/mind-shapes-deluxe-v7.html?v=20261013h

**Trial game features:** premium 3D wood cube, 24 shape holes and matching multicolor pieces, six stages x four pieces each from different cube faces, rotating cube, hints with pulsing green silhouette until correct placement, red wrong feedback/green correct feedback, trial-only star count and hint cost, congratulatory dialogs and final trophy/star animation, dark animated garden background and responsive tray. Trial's stars are demo state, not yet integrated with main star store.
**User's latest known visual concern:** cube touches left scene frame on iPhone Home Screen; Safari browser looked appropriately framed. User asked for a small careful change rather than strong zoom out. V7 remains unapproved until device test; do not present it as the “approved version.” **No explicit production merge approval.**
**Render trial service ID:** `srv-db6k0fg473hc739v92a0`, workspace `tea-dau4frvavr4c73fl4jtg`; Render site: https://areg-mind-games-trial-20261013.onrender.com/ . Check live deploy status using Render if available before giving new version's URL.

**Latest production main SHA should always be fetched fresh.** As of verification 2026-10-13 during this entry, it was `8d365c739466eff1e45575235cc3320098d5b6bd`, reflecting activity beyond earlier V290 checkpoint. Do not equate that SHA with blanket user approval. Main also has separate gallery-card and portal changes and reversions recorded in main handoffs. The 3D sorter is NOT integrated into main.

## 5. HANDOFF TEMPLATE (REQUIRED)

For every alteration append date/time and:
- USER REQUEST / exact scope (and screenshots or videos if provided)
- BEFORE: main SHA, trial base, previous approved or liked version
- CHANGE: files, commits, branches, deploy ID and preview URL (or honest blocker)
- TESTS: passed, failed, not run, real Safari/PWA feedback
- ACCEPTANCE: approved for trial? production? explicitly rejected? pending?
- ROLLBACK: safe prior version and link
- NEXT STEP: one concrete action, no ambiguous “continue”.

**New chat closing checklist:** `AGENTS.md` read; `CURRENT_STATUS.md` and both handoffs updated; links and SHAs rechecked; user gets directly clickable test URL when live. 
