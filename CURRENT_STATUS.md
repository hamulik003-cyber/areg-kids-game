# AREG Kids Game — CURRENT WORK / SAFE RESUME

Last updated: 2026-10-09. **Read this FIRST in EVERY new conversation before editing GitHub.**

## Source of truth and current state
- Repository: `hamulik003-cyber/areg-kids-game`, default branch `main`, live PWA: https://hamulik003-cyber.github.io/areg-kids-game/
- Current work: **V259, experimental** — "Գտի՛ր համաստեղությունը" four-choice mini-game, replacing the older star-connecting mechanic.
- User has tested V257 and V258 on an iPhone inside DotKiosk. V258 works but its winning animation needs improvements. DO NOT call V259 "pre-final" until user reviews a new DotKiosk video.
- **Backup made before V259:** `backup/v258-before-cinematic-win-v259` at `d87f9b1e9385d6ee6f16f265b1209210ef49acc0`. Older V257, V255, V253 and V245 backup branches also exist. Never delete or rewrite backups.

## EXACT latest user request
User showed screenshot (example: 4 constellation illustrations, currently "Գտի՛ր՝ Քնար") and requested:
1. Once the correct choice is tapped, the **other three fade smoothly, no blink/flash**. Previously the cards appeared to flash instead of fading.
2. The selected constellation moves dramatically **much closer to the screen**, leaving a **small consistent safe margin at the left and right edges**, applied across **all 38 artworks**. Tall/wide characters keep aspect ratio and also stay vertically within the play area; never crop them.
3. Winning selected art's approach becomes somewhat **slower** and it stays **much longer** before smoothly disappearing.
4. The **sound played when each NEW group of four images enters must be removed**. Correct-answer and incorrect-answer sound effects MUST remain stable across ALL rounds.
5. Preserve fast PWA boot, lazy images, two-by-two grid of 4 alpha-WebP illustrations, 38 non-repeating target selections, score and reward stars, galaxy backdrop, rare meteors and offline compatibility.

## V259 implementation (main branch)
- `constellation-quest-v246.js?v=259` remains the on-demand launcher path; only the contents represent V259. V258 alpha silhouette sizing measures each image's nontransparent extent at low resolution. That record now stores `data-figure-width-px` and `data-figure-height-px`; selected zoom is calculated as `min((stageWidth - safe side clearance) / visibleFigureWidth, (stageHeight * .92) / visibleFigureHeight)`, *not* from the 2x2 tile width. These bounds ensure each finished art approaches the same possible edge without clipping. Inspect on small iPhone DotKiosk and tall illustrations.
- Animation timings: 780 ms new-set entrance (unchanged); **1220 ms winning approach** (was 850); **4600 ms total winning stage** (was 2750, so a 3380 ms hold after approach); 880 ms disappearing exit (was 690); 260 ms starfield pause; **720 ms composited opacity-only loser dissolve**.
- Loser cards retain their original transform and simply use the CSS `s3d-find-dismissing` keyframe animation (forwards fill) with the nested `.s3d-find-art-shell` float halted. No simultaneous scaling/translation, no opacity reset, no overlapping exit animation. Only selected card recedes at the end.
- **Removed** `sound('entry', ...)` scheduling from correct touch AND `kind==='entry'` melody. Do not reintroduce the arrival jingle. Both `sound('correct')` and `sound('wrong')` remain and use one WebAudio context.
- Files touched: `constellation-quest-v246.js`, `space-3d-games.css`, `app.js`, `index.html`, `service-worker.js`, `qa/full-audit.mjs`, `qa/browser-smoke.mjs`, and state documentation only. Original `space-3d-games.js`, all textures, UV maps and menu fast-start code unchanged.

## Testing and release checklist
- Check latest `main` SHA, GitHub Pages and AREG Full Game Audit workflows; only cite passes verified on the **current SHA**. Run tests for `assets-and-code`, `mobile-browser` (Chromium) and `ios-webkit`.
- Browser smoke tests now verify: 4 distinct images, wrong answer remains, smooth loser fade at ~270 ms and fully invisible by ~870 ms, winning scale within play bounds, winner still on-screen at around 2.6 seconds, and new four choices after the exit.
- Have the user **close and reopen DotKiosk without uninstalling** and send a video of 2–3 wins. Focus on: no blink from the three losers; selected artwork fills the screen with consistent safe margin; all 38 arts are uncropped; no sound on the next entrance; correct/wrong SFX still work in later rounds; no slower loading.
- If any errors remain, adjust **only this one minigame and its CSS**, then bump module/CSS/SW PWA version together, preserve latest accepted backup, and repeat CI. Never let a new chat blindly rewrite the approved 3D Space Search, images, or other child games.
- **If new conversation lacks context:** read `CURRENT_STATUS.md` and `AGENTS.md`, then check GitHub main + CI, review the latest user screenshot/video, and continue at V259; do not ask user to upload zip if GitHub is connected.

## Earlier decisions to remember
- User rejected tracing stars because in-game 3D lines/anchors did not match the source constellation illustrations. Moved to **4 illustrated choices / "Գտի՛ր՝ <name>"** instead.
- Approved art style: original electric-blue luminous constellations extracted into 38 transparent PNG archival originals + optimized runtime WebP alpha artworks, on existing live blue/purple 3D nebula sky.
- User considers game launch/response speed non-negotiable. Never eager-load all 38 assets, introduce white flashes or repeatedly force PWA cache clearing.

## Next action
Await GitHub Pages + automated browsers for V259, then user DotKiosk visual/audio feedback. If CI fails, fix the problem before claiming release.


## Update V260 — 2026-10-09 (latest; read BEFORE V259 notes)
- User approved the V259 sizes, slow large winner approach, long hold and silence on entering new choices. **ONLY remaining bug:** screenshot + 29-second DotKiosk video showed the other THREE smaller constellation images were still visible behind the giant selected winner throughout its winning stage.
- Root cause suspected: the CSS keyframe fade was competing with inline `pose()` transitions/3D compositing on iPhone Safari; previous smoke test checked computed opacity but never asserted that the unwanted image DOM nodes disappeared. On the user device they lingered as faint ghosts.
- PRE-FIX BACKUP: `backup/v259-before-definitive-loser-cleanup-v260` at commit `fb3a9b7d3251a2aaf49b15cf864cc190f7a53a7f`. Preserve forever.
- V260 change is deliberately small: in `constellation-quest-v246.js?v=260`, after correct touch **only the three wrong cards** cancel old animations/transitions, do one 720ms CSS opacity transition (no translation, zoom, blinking), then at 820ms get `display:none` and are explicitly `remove()`d from the DOM. Their parent `cards` array remains until ordinary next-round cleanup; selected figure continues its completely unchanged V259 zoom, long hold and exit. The CSS no longer defines an additional overlapping loser keyframe; it provides a defensive `.s3d-find-hidden` rule.
- QA `qa/browser-smoke.mjs` now verifies that 3 wrong images are MID-fade at 270ms, ALL 3 DOM nodes are gone by about 920ms, and winner is the ONLY remaining choice throughout the extended win hold. Must pass both Chromium and iOS WebKit; `qa/full-audit.mjs` protects the hard remove behavior.
- `app.js`, `index.html` and `service-worker.js` switched together to v260. No audio, reward, images, starfield or unrelated games were touched.
- Next: confirm latest GitHub Pages and three CI jobs; have user close and reopen DotKiosk (without uninstall), complete 2–3 rounds, and send a final screenshot of a close-up. Only after real iPhone approval consider V260 the new Pre-Final.


## Update V261 — 2026-10-09 (latest; supersedes V260 animation implementation)
- V260 first attempted an inline CSS opacity transition plus DOM detach. Chromium passed, but **iOS WebKit failed its smoke test**: 270ms after selecting the winner, all 3 losers still reported opacity 1. Never call V260 final.
- V261 keeps the exact approved V259 winning SIZE, zoom and hold, correct/wrong sounds and lazy 38-image assets. ONLY loser fade was replaced.
- `constellation-quest-v246.js?v=261`: on winner touch the 3 other cards are marked dismissing, prior CSS animation + transition cancelled, and are faded by the *already-running WebGL requestAnimationFrame loop* with smoothstep alpha from 1 to 0 over 720ms. When elapsed time reaches 720ms the three unwanted DOM buttons are removed. There is an 820ms timeout backup if the app is backgrounded mid-fade. `data-winner-isolated=true` confirms cleanup. No CSS compositor interpolation is relied on, so WebKit cannot keep them visible due to competing styles.
- A V261-specific test in `qa/browser-smoke.mjs` requires a mid-fade alpha in (0.02, 0.99) at 270ms with CSS animation/transition both `none`, and **only one remaining image node by ~920ms**, throughout the longer hold. Test both Chromium and iOS WebKit before telling user to try.
- Web assets/cache updated together to V261. V259 backup `backup/v259-before-definitive-loser-cleanup-v260` remains safe. Parent V258 and older backups retained.
- Next: verify GitHub Pages deploy for V261 HEAD, Full Game Audit (assets-and-code, mobile-browser, ios-webkit); if all green ask user to close/reopen DotKiosk without deleting and send a screenshot of successful reveal, specifically whether 3 losing images disappear.


## V262 — latest 2026-10-09: independent victory artwork (experimental until DotKiosk sign-off)
- **Critical user report with video `ScreenRecording_10-09-2026 18-04-28_1.mp4`:** Despite V261 CI passes, real iPhone footage shows a winning Scorpion sliding and growing OFF THE LEFT side of the game, and a winning Ophiuchus going OFF THE TOP under the HUD. This is more than background images: the chosen art zoom remained anchored to the **original grid button** and incorrectly translated relative to its image alpha offsets. Past fixes to opacity/DOM removal did not address this root layout issue. Do not call any V259–V261 final.
- Pre-change protected branch `backup/v261-before-independent-hero-reveal-v262` points to V261 `bfa32abf1fcb2a03e16db0ecae01e6ee2e3b0c27`.
- V262 fixes the **architecture** instead of adding another old-button transform: `showWinningHero()` creates a dedicated `.s3d-find-hero` absolute overlay covering the FULL playfield, with a separate transparent image. The original correct-answer button is removed immediately after the hero starts in the exact old centered picture location. The hero image is centered by measured alpha silhouette (record.bounds), safely sized to the playfield with X and Y margins, and animated *independently* from 0.4-ish initial scale to 1.0 over the approved 1220ms. It holds for 4600ms total and exits over 880ms. The 3 wrong options continue V261's 720ms RAF opacity fade and then are removed. Only the new hero remains visible, correctly centered.
- CSS `.s3d-find-hero` and image dimensions are NOT coupled to the 2x2 choice grid positions. Background galaxy, audio, target cycle, fast preloading, 38 transparent art source assets and all other minigames unchanged. iOS viewport resizing remeasures hero layout.
- QA now verifies mathematically centered/safe alpha silhouettes for highly off-center, tall, wide artwork at several device sizes; browser smoke checks initial 3 visible losers fade, hard removal by 920ms, exactly 1 hero, no other card, and the hero's actual DOM bounding rectangle and image DOMMatrix are centered/clipped safely during full long hold, in Chrome and WebKit.
- Only if latest V262 GitHub Actions audit + Pages both pass, send user the same live link for DotKiosk to validate real iPhone screenshot. Preserve backup until explicitly approved.
