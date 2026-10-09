# AREG Kids Game — coding continuity and regression rules

This is an **existing production PWA** for children. The active branch is `main`. Do NOT rebuild it from scratch or restore an older version just because another chat has partial context.

## Before every modification
1. Fetch the actual current `main` HEAD, read the relevant production files, and compare with the last known-good commit.
2. For risky, destructive or structural edits, create a separate backup branch first. Do not force-push.
3. Make the smallest change that fixes the observed problem. Preserve all approved UI, animation timing, Armenian labels, and existing image/UV assets unless explicitly asked to change them.
4. Never delete an asset just because its filename is old. Confirm it is unused across HTML/CSS/JS, service-worker precache, and dynamically constructed paths.
5. Check JS syntax and file references; check GitHub Pages deployment when an API actually makes it available. Never claim a live iPhone test without one.

## Approved visual and interaction behavior
- Keep the approved wooden home menu, Armenian labels, avatar settings, stars, themes and five main areas.
- Preserve the current 3D planets/UV textures and the **V244** space-search transition: selected target exits gracefully, a brief starfield pause, next objects enter smoothly. Do not replace this with abrupt swaps.
- Nature/space gallery cards show WebP thumbnails; opening a card is an animated 3D-style trip to the center and back. Full-resolution art, when available, must be added *over* a decoded thumbnail, never replace the thumbnail `src` in-place.
- Do not add giant background media downloads at launch. The 3D engine and high-resolution textures are on-demand.

## Performance baseline (V245, 2026-10-09)
- `index.html` must **not** forcibly `location.replace` just to change a build query parameter.
- On gallery entry, decode at most the first four thumbnails with a **1,250 ms maximum**; never reintroduce the former 7,500 ms wait.
- Section art is decoded opportunistically, with a 1,150 ms maximum before showing the section menu.
- Gallery preview cache is capped, failed preview loads may retry, images become visible when decoded (`.is-decoded`).
- First-install service-worker core excludes large optional 3D modules and 3D textures; requests still use on-demand runtime caching.
- When updating `app.js`, `styles.css`, or service-worker behavior, advance version references in `index.html`, `app.js` service-worker registration, and `service-worker.js` CORE_CACHE/CORE accordingly. Avoid unbounded build-query redirect loops.

## Audio migration warning
118 short-lived signed CloudFront audio URLs in `app.js` had expired on October 5–6, 2026. The V245 cleanup replaced these expired URLs with `null` while retaining fallback speech handling and audio mappings. The original links are preserved in branch `backup/v244-before-speed-fix-2026-10-09`. **Animal and bird effect sounds are not restored by this cleanup.** Proper restoration requires original audio bytes and permanent local/static hosting, not new expiring tokens. Never claim these sounds are available until verified.

## Baselines and safe rollback
- Pre-performance-fix: commit `59151ab4ffb4ed825a2b68ce7fdc1e00ae944e1d`, branch `backup/v244-before-speed-fix-2026-10-09`.
- V245 is a performance patch, **not** a replacement for user-approved visuals or game logic.
- Read this file at the beginning of each new chat, then inspect the current `main` HEAD; later commits may supersede these notes.


## V247 constellation quest (2026-10-09) — in user testing
- The last user-approved full-game baseline is V245. Its backup branch is backup/v245-prefinal-before-constellation-quest, based on commit b785e1b99f53902fe574a68dbb1e01295b103aa2. Keep it intact.
- Current experimental constellation quest is constellation-quest-v246.js?v=247, a separate lazy-loaded WebGL module. Do NOT edit space-3d-games.js Space Search gameplay as part of this quest.
- 38 illustrations in CONSTELLATIONS are matched by ID with 38 hand-positioned gameplay star trails in TRAILS. The constellation artwork appears only after completion.
- Stars appear smoothly; one blinks as a tap hint; touching lights it steadily and connects a growing light beam from the previous star. A wrong star plays the existing descending two-tone planets-style sound.
- Completion triggers synthesized magic tones, a fading-in original illustration, Armenian speech if available, and +1 star reward.
- Each game session shuffles all 38 once, with no repeats until all are used. Then it repeats from the same randomly selected first constellation.
- Offline core includes the small quest module; the 3D Search engine and full-resolution texture set remain on-demand to protect launch performance.
- Changing quest code after publication requires a NEW import query version, matching service worker precache entry/cache version, app.js and index.html script versions, and QA synchronization. Never reintroduce navigation redirects.
- qa/full-audit.mjs verifies all 38 star trails; check CI and real DotKiosk/iPhone before promoting any new version to pre-final.


## V249 constellation controls (2026-10-09) — awaiting user approval
- The pre-change V248 is saved in branch `backup/v248-before-touch-drag-and-reveal` at commit `76d40c8f21847554714519329314b99bf1d2e7a2`.
- Only the standalone `constellation-quest-v246.js` and `space-3d-games.css` gameplay/appearance were edited. `app.js`, `index.html`, and `service-worker.js` received *version updates only* to V249; never degrade the approved V245 startup speed.
- All 38 constellations now support both single taps and finger-held slide tracing. Both use the shared `lightTarget()` and only the **currently blinking target** activates; the pointer move handler catches the active star via finger-path segment proximity. Pointer capture supports dragging on mobile; clean all handlers on exit.
- The waiting target star glows gold while unlit future stars remain blue, and lit stars remain warm white. Every round gives the Armenian voice prompt, rather than only the first round.
- The finished original illustration fades and scales in over about 3 seconds and stays visible before the existing graceful exit; the next round's starfield transition remains unchanged.
- V249 is *not yet pre-final*: require real DotKiosk/iPhone user acceptance and monitor mobile-browser plus WebKit tests before approval.
