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
