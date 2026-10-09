# AREG Kids Game — chat-to-chat continuity journal

**Updated: 2026-10-09. Latest experiment V264. This is a durable actionable PROJECT SUMMARY, NOT a verbatim copy of a ChatGPT transcript.** The conversation itself cannot be exported via GitHub; preserve the actual dialog separately if exact wording is needed.

## The three authoritative sources
1. CURRENT_STATUS.md — chronological version checkpoints; always read its LAST section first.
2. AGENTS.md — safeguards, regression rules, product foundations.
3. PROJECT_HANDOFF.md — this detailed history and next-step handoff.
Always fetch the real current GitHub main branch first: https://github.com/hamulik003-cyber/areg-kids-game . Never assume the last model response reflects current HEAD. Live PWA: https://hamulik003-cyber.github.io/areg-kids-game/ .

## Product invariants
- Existing Armenian child-friendly «Արեգի 3D աշխարհը» PWA, primarily iPhone/DotKiosk. Preserve original wooden main menu, avatars/settings, five sections (20 activities), star rewards, child-friendly visuals/audio and the 38 constellation illustrations. Do not rebuild from scratch, require ZIP, or replace old assets with guesses.
- V245 performance baseline is protected: fast first startup, gallery visible thumbnails / lazy image decoding / limited waits, no large GPU models or artwork eager-loaded at boot, service-worker core small, no navigation query redirect loops. Keep HTML/app/JS/SW versions aligned and offline friendly.
- Approved «Տիեզերական որոնում» space search game is in space-3d-games.js and uses 3D spheres, user UV textures, sound, gentle winning zoom and V244 planet exit→short starfield pause→next objects enter. Never modify or downgrade this game while correcting «Գտի՛ր համաստեղությունը».
- Every risky change starts with an immutable backup branch from the real main HEAD; never force-push backups. Check GitHub Actions assets-and-code / mobile-browser Chromium / ios-webkit, plus Pages on the exact latest SHA; automated tests are NOT a real iPhone acceptance test. Avoid changing unrelated sections.

## Important history from past chats
- V247–V255: constellation mechanics initially had star tapping, drag tracing, generated/manual star nodes and lines. User rejected the alignment of 3D nodes with original illustrated star figures and decided to replace with a simple, clear 4-picture guessing game.
- V256: «Գտի՛ր համաստեղությունը» launches as four 2×2 artwork choices, 38 transparent originals (optimized alpha-WebP with PNG fallback). Prompt «Գտի՛ր՝ <name>», correct sound and +1 star, wrong tone stays in same round, 38 non-repeating target cycle; galaxy background and rare shooting stars. Avoid new-round arrival jingle; preload only visible four and near-future assets.
- V257 fixed incorrect shuffle/index mapping so all four images display. V258 calibrated relative image scale using actual visible alpha silhouettes without changing original artwork. V259 introduced a large dramatic 1220ms winning approach and 4600ms total winning view, accepted size/hold, but three losing figures stayed visible underneath.
- V260 CSS transitions plus hard node detach failed in iOS; V261 switched to frame-driven loser fade, yet winning Scorpio slid outside the left edge and Ophiuchus clipped the top of the HUD on real iPhone.
- V262 designed an independent full-stage alpha-centered «s3d-find-hero» detached from grid cell transformations. The user APPROVED center, winner scale and longer holding duration. Never replace it with scaling the original 2×2 button.
- V263 caused three losing constellation pictures to recede, shrink and fade simultaneously with winning artwork over 1220ms; all tests passed in Chromium/WebKit/Pages on db30aed, later d24668b documentation build also passed. Real user then asked to change the timing to match planets more closely.

## Exact current user request — V264 supersedes V263
The user asked to examine the smoothness and correct-answer response in the EXISTING planet game and do the same for constellation choices. Specifically, the three unused constellation illustrations must **quickly but smoothly disappear completely BEFORE the chosen one begins moving forward from its spot**. The user also wants this entire work's decisions checkpointed outside ChatGPT so any deleted/truncated chat can be resumed precisely. They do NOT want project restart.

Investigation found actual Space Search code in space-3d-games.js: losers fade with easeOutCubic over **280ms**, while winning planet approach takes **850ms**. The user's strict sequencing for constellation is stronger than that existing simultaneous planet movement. V264 therefore:
- Immediately on correct tap, animate all 3 alternative constellation cards opacity 1→0, scale 1→0.72, depth 0→−78px over **280ms**, with the same eased curve; then REMOVE the three DOM elements, including safe iOS fallback.
- Create the separate centered, alpha-calibrated winner in place, but keep it STILL through the entire loser fade. Only AFTER the 3 alternatives disappear / DOM-detach, call beginWinningHeroApproach to perform the APPROVED V262 1220ms zoom; preserve 4600ms total winning stage from tap and 880ms exit.
- Preserve correct/wrong sounds, no new-group entry sound, reward stars, 38 images, lazy loading, 2×2 size, fast app startup, all original 3D Space Search behaviors, and other games.
- QA/browser-smoke.mjs now measures actual requestAnimationFrame samples for 3 partial fades, verifies hero stays frozen until other cards are all gone, and later centered/long visible winner. qa/full-audit.mjs protects the exact planet fade timing reference and release wiring. app.js/index.html/service-worker.js release queries and cache are v264.

## Protected versions / chronology
- Original V245 production speed baseline and V253 tracing pre-final have separate older backup branches (see AGENTS.md / CURRENT_STATUS.md).
- V262 approved winner architecture remains available at backup/v262-before-synchronized-retreat-v263 (based on e019d44f).
- V263 successful snapshot is protected by backup/v263-ci-green-before-status-handoff-2026-10-09 at db30aed.
- V264 pre-edit working source saved as backup/v263-before-planet-timed-v264-and-chat-handoff at d24668bc44b9e1fa70d48a4aa29c3e29ec8069c2.
- V264 source commit before documentation: 344ca4101c5c05ed440217f68f46398227be1925. The HEAD after this document will be newer; ALWAYS fetch it instead of trusting these older commits.

## What happened specifically in the current chat
- User opened this chat after V263 with GitHub path and exact requirement to inspect CURRENT_STATUS.md/AGENTS.md/main/Actions/Pages, repair only failures, then return DotKiosk URL.
- We verified earlier V263 `db30aed` passed assets-and-code, Chromium, iOS WebKit and Pages; read quest/CSS and created safety backup + CURRENT_STATUS continuity update. That docs-only d24668b also passed.
- User clarified V263 aesthetics are not the final choice: study the original planets and make all three constellation alternatives disappear FAST AND SMOOTH BEFORE selected object begins movement; additionally save all important dialogue decisions externally for future chat handoff.
- We inspected exact planet transition timings, created new backup at d24668b, and implemented V264 in constellation-quest-v246.js ONLY for minigame gameplay, with version and QA updates (no planet engine edits).

## Mandatory next step / future chats
1. Read actual CURRENT_STATUS.md last section, AGENTS.md and this file; check latest main commit and GitHub Actions/Pages jobs.
2. If V264 audit/ios-webkit/mobile-browser or Pages fails, inspect logs and make minimal focused fix only to constellation game/QA, back up current working HEAD, update all relevant version strings together.
3. When latest SHA passes, ask user to close and reopen (not uninstall) DotKiosk and record two or three correct constellation choices. Look for three smooth sub-280ms disappearances, winner NOT moving until they are gone, center safe for Scorpion/Ophiuchus/wide artwork, no flash, correct/wrong SFX, fast next four.
4. Never label V264 pre-final without real iPhone sign-off; on any new user request update CURRENT_STATUS.md and this handoff with what was approved/changed/next. Full literal chat export is not available through this connector; preserve actionable decisions here, not private details.

## New project continuity enforcement — 2026-10-09 (latest)
- The user approved an automatic project-history safeguard. A new qa/handoff-guard.mjs runs as part of AREG Full Game Audit on main pushes and pull requests to main. Any non-documentation change (gameplay, source, images, audio, QA, app config, GitHub workflows, cache) requires real text changes in BOTH this PROJECT_HANDOFF.md and CURRENT_STATUS.md within the SAME push or PR. Documentation-only updates need no matching paired change. Unit tests in qa/handoff-guard.test.mjs validate this policy.
- The GitHub CI job becomes FAILED if one or both living journals are missing, deleted or merely whitespace-modified. This forces a visible red build, helping future chats check and repair missed history. The guard is NOT an AI that writes a summary, and these two documents are NOT a verbatim transcript of ChatGPT.
- Before adding this safeguard, protected the successful V264 game at commit 37fe962ff2f5921eae61a9239b985af4d163e8df, backup/v264-ci-green-before-handoff-guard-2026-10-09. No gameplay assets, UV, 3D planets, sound code or PWA runtime changed by installing the guard.
- IMPORTANT limitation: the CI requirement is a warning/failure gate; it cannot by itself prevent GitHub main pushes, merging or Pages auto-publication. A GitHub repository admin must make the AREG audit check REQUIRED via branch-protection/ruleset to truly prevent merging. Do not promise that such protection is already enabled.
- On each future user change: fetch current main, read the latest entries of CURRENT_STATUS.md/PROJECT_HANDOFF.md/AGENTS.md, back up main before risky edits, update BOTH journals in the SAME push, inspect actual SHA and audit/Pages results, then state whether real DotKiosk testing accepted the output and precisely what to do next. If only documentation is edited, no gameplay version bump is needed. V264 is still awaiting real iPhone user acceptance.
