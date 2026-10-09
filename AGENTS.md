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


## V250 constellation sky, compositing and iOS audio (2026-10-09) — user testing
- V249 baseline preserved in branch `backup/v249-before-nebula-audio-and-edge-fix` at commit `08cfc01e935aac85fddfa18511f46c3208be5d80`. The V245 game performance baseline is also separately protected.
- `constellation-quest-v246.js`: a **lightweight procedural purple/blue nebula sky** is drawn into one small canvas-backed THREE texture, plus **a single rare, reusable shooting star** with 9.5–18-second quiet gaps. Do not introduce heavy background downloads or full 4K prerenders.
- `space-3d-games.css`: the completed constellation's original image uses `mix-blend-mode:screen` with a feathered oval alpha mask, to merge the image's very dark rectangular top/bottom bands into the background instead of cropping the original artwork.
- Audio: a single reused WebAudio context now waits for `resume()` before notes, spoken prompts no longer call `speechSynthesis.cancel()` unnecessarily, and the next-round entry chime is **scheduled during the final user's star touch** before timed transitions (iOS gesture requirement). Browser Armenian voice synthesis may still depend on system voice availability; always validate on DotKiosk/iPhone.
- Only constellation quest JavaScript and shared 3D CSS artwork were changed. Existing Space Search / V245 game files are unchanged except version strings in `app.js`, `index.html`, and `service-worker.js`, now on V250.
- Before promoting V250 to Pre-Final, verify: both tap and finger-drag activation, second/third constellation **audible entry chime**, rare shooting stars, no black horizontal image bands, successful Pages and mobile/WebKit CI, and stable loading speed.


## V251 seamless reveal and no-TTS audio fix (2026-10-09) — pending real iPhone approval
- Baseline V250 preserved in backup/v250-before-final-audio-and-seamless-reveal at commit 8cd31833d9135fbbd8d05cf962524febb59c3fe4. DO NOT delete or force-push this backup, or the separate approved V245 backup.
- V251 changes ONLY the constellation module, shared 3D CSS, and the corresponding app/index/SW cache-version strings. The existing Space Search 3D code, UV textures and fast-start V245 logic remain unmodified.
- Previously the JPG's content was letterboxed within a much taller IMG element and the CSS fade was applied to that tall *element*, leaving the original JPEG's crisp horizontal rectangle edges. New .s3d-quest-photo-stage holds an intrinsically sized source IMG and a blurred nebula atmosphere generated from **the same source JPG**. A feathered mask is applied to the actual image box. The photo group screen-blends with the live sky; no added image downloads or crops.
- iOS Safari/StandAlone WebAudio issue: device SpeechSynthesis was interrupting effects across rounds. V251 intentionally does **not** call SpeechSynthesis inside this constellation minigame; Armenian text remains visible. Full spoken guidance requires properly hosted local Armenian narration sound files, not unreliable on-device TTS. Do not reintroduce the conflicting speech audio into this module.
- One audio context is created/reused, with a very quiet carrier oscillator to maintain an active output graph, closed only when the minigame exits. Magical reveal/line/star/wrong-answer effects retain their original sound patterns. Next-level chimes are pre-scheduled from the child's final star tap. If iOS interrupted the session, a recovery chime is retriggered on the next gesture.
- Existing 38 constellation images, star trails, non-repeat order, touch and continuous-drag modes, falling stars and smooth transitions remain.
- QA static guards in qa/full-audit.mjs cover these V251 invariants. **Green automated tests do not prove that iOS sound or picture blending looks correct**: require user to test second and third round, screenshot reveal, audio effects, and speed in DotKiosk before declaring V251 final.


## V252 — actual transparent constellation art (2026-10-09), awaiting DotKiosk approval
- Current image originals: all 38 approved source JPG files at repository root (listed explicitly in `constellations-manifest.json`). The user also supplied `areg-constellations-v137-assets.zip`, but IMPORTANT: current GitHub source `01-hayk-orion.jpg` differs from that old ZIP; keep newer approved repository images.
- PNG masters and smaller runtime alpha WebP are built from the **current** approved root JPG files via `scripts/build-constellation-alpha.py` and GitHub Actions `.github/workflows/build-constellation-alpha.yml`. Generated assets are `assets/constellations-transparent/NN-slug.png` and `.webp`; there must be 38 of each plus manifest. Always run automatic asset build if a source JPG changes.
- The minigame's `constellation-quest-v246.js?v=252` now loads just the on-demand transparent alpha WebP for a *completed* constellation, with matching basename, rather than the original dark rectangular JPEG. The rest of the game and its preview gallery still reference approved JPEG files. No startup image downloads or pre-caching of 38 reveal images.
- Keep `space-3d-games.css` native transparent `.s3d-quest-art`; NEVER reintroduce radial fading masks, background JPG duplicates, screen blending, or manual black rectangles. The 3D nebula and rare shooting stars continue behind the fully transparent art.
- V251 working audio implementation, 38 paths/nonrepeat, pointer tap/drag, smooth reveal and exit, planets game, and V245 speed baseline remain unchanged. Pre-change backup branch: `backup/v251-before-transparent-constellation-assets`. Additional historical V245/V250 backups also preserved.
- Treat V252 as **user-testing, NOT final** until the user confirms original art details and successful first/second/third-level audio/transition on DotKiosk/iPhone. Programmatic alpha extraction may retain faint nebula specks or miss faint contour details; refine individual PNG masks if visually necessary, instead of adding CSS mask hacks.
- Runtime WebP must stay light; `qa/full-audit.mjs` checks all 38 PNG+WebP pairs and prevents missing assets. Before any module/CSS updates, synchronize `app.js`, `index.html`, `service-worker.js` and core cache version. Avoid touching current approved Space Search renderer or startup.

- The V252 mask builder now uses OpenCV connected-component filtering to remove isolated star/noise patches inherited from the JPEG background. Keep every component whose area is at least 45% of the dominant constellation component: this intentionally preserves two separated figures in Pisces. The alpha WebP set was regenerated from the current root JPG files and tested for 38 entries. Preserve PNG masters and keep in-game WebP lazy/on-demand.


## V253 overlay/illustration handoff (2026-10-09) — pending user validation
- User's V252 screenshots showed excellent transparent figure isolation but duplicated thick white puzzle lines and large extra 3D balls superimposed on finished figures (not necessarily a PNG problem). The drawn star points/beam meshes were left visible while the actual transparent WebP was revealed.
- New V253: `constellation-quest-v246.js` tracks `revealStartedAt` as soon as the real alpha WebP is ready to reveal. Over ~1.12 s, fades out ONLY puzzle spheres, glows, connection beams and sparks. After fade, sets puzzle `group.visible=false` for faster GPU draw. The real already-illustrated constellation remains visible for the standard ~3-second cinematic dissolve and full hold. Fresh round resets `group.visible=true`, preserving puzzle tap/drag.
- Audio system from V251, 38 transparent alpha images from V252, star/score logic, original 3D planet engine, and the fast V245 PWA startup have NOT changed. Prechange backup: `backup/v252-before-clean-reveal-2026-10-09`.
- Changing only the gameplay module requires an import version and service-worker CORE_CACHE/app.js/index.html update; current minigame import should be `?v=253`. Browser CI checks the overlay fade existence but *cannot* confirm user-level visual quality. Verify with DotKiosk screenshots of Pegasus, Orion, third constellation and listen to next-round sounds before approving.
