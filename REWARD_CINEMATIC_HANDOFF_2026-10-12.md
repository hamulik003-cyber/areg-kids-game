## 2026-10-12 — FINAL VERIFIED CODE QA FOR V291 REVISED SINGLE-TAKE CAR; USER REVIEW PENDING

- GitHub Actions **run `38244259661` on CODE+QA SHA `93a5fb1c191e9edd100c1565764e1fa026c59b0d` passed 4/4**: `assets-and-code` SUCCESS, `mobile-browser` SUCCESS, `ios-webkit` SUCCESS, `ios-pwa-music` SUCCESS. This validates the revised continuous-shot 3D car reward and sparse-WebKit sampling QA-only fix. Later commits on this same trial branch updated **only** the handoff Markdown files, not the game assets/JS/QA, so the above remains the latest verified game-code SHA. Any workflow on subsequent documentation-only commits must not be mistaken for evidence of gameplay changes.
- **User DID NOT APPROVE final car visuals yet**: previous phone captures explicitly rejected initial three-disjoint-frame/boxy-different-car pilot. Revised scene on `reward-car-pilot.js` maintains the original exact 🚗 emoji at the endpoints, warm pastel 3D scenery, soft movement in one persistent WebGL canvas, camera follows from side toward rear then returns, frame zooms back to source card. Middle car body is a red compact custom approximation, not mathematically identical to emoji's raster pixels; adjust only on user feedback.
- **Next step:** have user play the NEW preview on actual iPhone using commit-pinned link `https://raw.githack.com/hamulik003-cyber/areg-kids-game/32c38f0c96ee4835a6ec65ceea8d535ef006e298/reward-car-preview.html`. Ask for an iPhone screen recording showing beginning/middle/end to evaluate visual identity, premium cartoon palette, camera movement and return position. **PR #22 remains Draft, UNMERGED, main V290 preserved.** No changes applied to remaining 49 reward cards, no verified automatic USB backup of these new Git refs.

## 2026-10-12 — ADDENDUM: iOS-WebKit CI sparse-frame sampling test repair (V291 TRIAL ONLY; NOT MAIN)

- Code revision for the user's cinematic-car feedback is in `reward-car-pilot.js` on [DRAFT PR #22](https://github.com/hamulik003-cyber/areg-kids-game/pull/22), still **NOT user-approved** and **NOT on official main** (approved V290, SHA `5a730d3a10b03914dc9879da81f91f9626799ddb`).
- For PR head `32c38f0c96ee4835a6ec65ceea8d535ef006e298`, GitHub Actions run `38243194529` yielded **assets-and-code PASS**, **mobile-browser PASS** (targeted car test PASS), **ios-pwa-music PASS**; **targeted CAR WebKit test PASS TWICE**. Entire general `ios-webkit` job failed on flaky *historical Space Search* sampling `V266 missing hero` / `V277 four-way WAAPI native timing/sparse WebKit samples`. In logs the animation began on the same tap with correct hero duration 850ms, three decoy fades 580ms each, and visually ended in correct isolated hero/zero-decoys state, but WebKit's CI `requestAnimationFrame` skipped the ~20–520ms window.
- **QA-ONLY fix commit `93a5fb1c191e9edd100c1565764e1fa026c59b0d`** modifies `qa/browser-smoke.mjs` (not the constellation/game code) to permit sparse native-compositor timing ONLY when exact WAAPI native durations/states are verified and a final clean holding hero/zero-decoys frame is observed. Keeps strict in-between opacity/position assertions whenever intermediate samples exist. This protects against false CI failures without changing or weakening visual runtime code. **New CI pending at time of this entry; do NOT claim 4/4 PASS until confirmed.**
- **NEXT:** check latest PR head and GitHub Actions after this doc entry; review all 4 jobs, address any genuine failure safely in trial only. Then ask user for real iPhone video of latest commit-pinned `reward-car-preview.html` to inspect visual quality and seamless same-car/same-card return. No merge without explicit approval. 49 remaining reward actions still not implemented. The USB on-change archive path remains unverified; don't claim it backed up this trial.

## 2026-10-12 — V291 CINEMATIC REWORK AFTER REAL USER IPHONE REVIEW — NEW CHAT START HERE

- **Latest user instruction (explicit visual REJECTION of initial V291 pilot):** the three initial iPhone screenshots showed a separate emoji card, a nearly blank card then a DIFFERENT boxy 3D car on a plain road. User called that confusing/shilashpot and insists on **one uninterrupted premium cartoon shot** in which the **EXACT existing primary 🚗 reward artwork** is what comes alive, the card itself flies forward, camera smoothly circles to a rear tracking angle as the red car drives, camera returns to original side angle, the **same original illustration reappears in precisely the same card location**, and the whole card glides back to its grid cell. Beautiful tasteful landscape/color, no hard cut, no swap to unrelated truck, no blank waiting scene; premium gentle polish, no default side-to-side shake. Their additional latest message explicitly authorizes modifying only GitHub trial work via @GitHub. **USER HAS NOT APPROVED ANY V291 VARIANT YET.**

- **Protected production:** approved V290, current main `5a730d3a10b03914dc9879da81f91f9626799ddb` as rechecked this turn; DO NOT merge to main, change Pages, reset phone cache or stars without explicit separate approval. Trial branch `feature/v291-reward-car-cinematic-pilot-20261012` Draft PR #22.
- **New trial code (unapproved):** replaced `reward-car-pilot.js` with one WebGL canvas and camera motion (initial 3/4 side → rear follow while car rolls along → original 3/4 side). Model made into a rounded red cartoon compact with custom curved extruded body/roof, blue side glass, wheel spokes, subtle metallic bumpers, 3D road and detailed rounded tree/hill/cloud/flower environment, bright pastel sky, warm light and tone mapping. The **original `sourceCard .magic-picture` text/emoji is preserved verbatim in the zoomed card before and AFTER the continuous 3D take**, with an 800ms crossfade into/out of the renderer; the same canvas is mounted throughout, without any frame replacement or blank intermediate screen. Card flies forward ~760ms; camera animation ~4.78s; returns original art and card flies back ~720ms. Requests to close/Escape gracefully restore original. True matching of emoji's exact geometry is **not yet proven** (3D model is an approximation matched to its red round microcar silhouette, blended with exact existing emoji art). May need further user feedback/asset iteration.
- Tests updated: `qa/reward-car-pilot.browser.mjs` verifies source emoji stays identical in overlay, wallet is unchanged, same canvas stays attached during animation, eventual DOM cleanup. Existing Chrome/iOS WebKit/QA workflow invoked automatically. **LATEST CI NOT YET CONFIRMED for current revision**. Last prior ORIGINAL V291 iteration had four successful jobs at `38238910367`, but those results do not validate this newer artistic rework. Important to verify new CI after final documentation commit.
- All 49 other reward cards still have their previously approved motion; the first unlocked car only is involved in this isolated pilot. Unique scenes for all 50 are documented in `REWARD_CINEMATIC_HANDOFF_2026-10-12.md`; none of the other animations are currently built.
- **Next exact action:** check newest PR #22 head SHA and the latest Actions **assets-and-code, mobile-browser, ios-webkit, ios-pwa-music** job results; fix only if needed. Then provide user with a **NEW COMMIT-PINNED GitHack preview link** for `reward-car-preview.html` (never reuse old commit-link), ask them to open on REAL iPhone and send recording / report on exactly matched hero/camera/return, revise again if not approved. Do NOT merge trial to main without explicit written user approval. The local automatic USB changed-ref copy remains to be independently proven; don't claim it has archived this experimental branch.

## 2026-10-12 — VERIFIED FINAL PILOT QA; START NEXT CHAT HERE (PR #22 DRAFT)
- **Trial branch:** `feature/v291-reward-car-cinematic-pilot-20261012`, [PR #22](https://github.com/hamulik003-cyber/areg-kids-game/pull/22) DRAFT and **NOT MERGED**.
- Last code/QA commit tested: `ce93f0a1de718e61906c958533eb041341500cf7`. GitHub Actions run **`38238910367` = 4/4 SUCCESS** (`assets-and-code`, `mobile-browser`, `ios-webkit`, `ios-pwa-music`). V291 car scene runs with **REAL WebGL2 on WebKit** (canvas 511×558 in simulator; no page console errors, preview stored wallet untouched). Chromium browser smoke, WebKit browser smoke and both PWA checks passed on this run. Earlier jobs sometimes failed due a PWA-version fixture mismatch subsequently fixed and pre-existing flaky unrelated Space Search WAAPI sampling; never hide these historical failures.
- **User device feedback still PENDING.** Preview is `reward-car-preview.html` on this trial branch, independent from the production URL; it does NOT charge stars or modify local user data. The car pilot is procedural low-poly true 3D and not yet approved as final premium art. Only unlocked `car` currently changed; 49 other cards retain V290 actions. All 50 proposed distinctive animations recorded in `REWARD_CINEMATIC_HANDOFF_2026-10-12.md` as future designs, NOT implemented.
- Protected official `main` still original V290 baseline at `5a730d3a10b03914dc9879da81f91f9626799ddb` when confirmed; re-check main before any future action. `main`, live GitHub Pages and installed DotKiosk/origin were NEVER touched by V291 trial. Do NOT merge without a new, explicit user authorization after actual device preview.
- **Next action:** give user an immutable commit-based GitHack HTTPS link to `reward-car-preview.html`, ask for a screen recording/visual feedback on 3D model quality, camera, zoom, 3-second timing and closing. If insufficiently premium, revise pilot in branch, retest CI, then expand in carefully verified scene batches. Check actual auto-USB new-ref archive only from user's local logs if requested (not proven yet).
- Every future meaningful change must update all three handoffs and this topical handoff, with branch/PR SHA, test results, approvals and exact resume step.

# AREG Rewards Cinematic 3D — Implementation & User Intent (2026-10-12)

**STATUS: V291 PILOT IN TRIAL BRANCH ONLY; NOT USER-APPROVED/NOT ON MAIN.** The currently approved main gameplay is V290 and must remain untouched until the user tests and explicitly approves a release. User's latest exact request: tapping an already-unlocked Magic Rewards Field card should make the **WHOLE CARD fly forward in the approved gallery-style zoom**, then reveal a **beautiful, convincing 3D mini-scene (approximately 3 seconds)** in which the actual object performs an individual action. Stop old left/right emoji-only wiggle; do **NOT** use a single reused motion for different vehicles or creatures. Premium, child-friendly, gentle design; responsive on iPhone PWA/DotKiosk, offline-safe, preserve stars/unlocks/music/local caches.

## Pilot implemented on trial branch

- Branch: `feature/v291-reward-car-cinematic-pilot-20261012`, forked from **main `5a730d3a10b03914dc9879da81f91f9626799ddb`**.
- Only for `MAGIC_ITEMS[0]` id `car` *after it is unlocked*: `app.js` dynamically imports `reward-car-pilot.js?v=291` instead of applying `magic-motion-drive`; all other reward cards retain old V290 behavior during pilot.
- A temporary full-viewport framed reward card flies from its original grid location to a central focus (740ms), inside which `vendor/three.module.min.js` dynamically renders a **procedurally generated actual WebGL 3D road**: modeled orange/red car, window reflections, separate rotating tire geometry, highway with center/edge lane lines and roadside pines, moving car and tracking camera over 3.2s. The frame then closes to its source (510ms). Graphics are self-contained/no external image CDN/new video/scene loading at launch; renderer/canvas/geometry/RAF listeners are disposed after finishing or Close/Escape. Device pixel ratio max 1.5; a static car remains as a graceful fallback without WebGL, not misrepresented as true 3D. Reduced-motion support; prevent overlap on repeated taps.
- `reward-car-preview.html`: isolated experiment view that starts with an unlocked car and DOES NOT read or write stars, unlocks, or device state. This is the recommended first user visual test; users need no stars to access it.
- PWA trial refs adjusted: `index.html` app `?v=291`, `app.js` SW `?v=291`, `service-worker.js` `areg-v291-core/runtime` and app precache version. Existing `MEDIA_CACHES` never touched; 3D module remains **on-demand** rather than in first-install core. Official main remains V290, no service-worker updates released.
- Browser QA: `qa/reward-car-pilot.browser.mjs` launches an iPhone-sized Chrome or WebKit, opens standalone preview, checks overlay, checks WebGL canvas when context is available, proves no saved reward wallet/stars were created, and waits for animation cleanup. Existing PWA version test updated in branch and workflow extended for Chrome+WebKit. Real CI results and phone feedback must be checked before concluding working.

## Unique 3D mini-scene design map — future batches (NOT IMPLEMENTED)

- Vehicles:
  - car — drives along scenic 3D road (PILOT)
  - racecar — tight racing corner on marked track with tire lean
  - bus — pulls into stop, opens doors, passengers board
  - truck — raises tipper bed and empties sand at construction site
  - firetruck — stops by safe stylized fire, sprays water, extinguishes flames
  - police — activates flashing beacons and follows fleeing car
  - tractor — plows field and leaves furrows
  - train — runs on curved rails with rotating wheels and steam
  - plane — accelerates on runway and takes off into sky
  - helicopter — rotor spins, lifts, tilts and makes a short banking turn
- Animals:
  - cat — bats a yarn ball and arches playfully
  - dog — runs, retrieves toy and wags tail
  - rabbit — hops across meadow and nibbles carrot
  - lion — climbs rock and roars
  - tiger — stalks and leaps past tree
  - elephant — sprays water from trunk
  - giraffe — reaches up to eat leaves from tree
  - horse — gallops with mane and dust
  - monkey — swings between branches by arms
  - panda — rolls with bamboo stick
  - bear — pulls honey from tree hollow
  - fox — darts through grass and pounces
- Birds:
  - chick — pecks grain
  - bird — lands on branch and chirps with beak motion
  - owl — turns head and blinks
  - eagle — circles over canyon then dives
  - duck — paddles and sends ripples
  - parrot — hops along perch and spreads colorful wings
  - swan — glides across lake and bends neck
  - flamingo — balances on one leg in shallows
- Insects:
  - butterfly — flaps wings between flowers
  - bee — hovers above a blossom and collects pollen
  - ladybug — walks on leaf, opens wings and takes off
  - ant — carries a crumb through grass
  - beetle — moves a small twig with forelegs
  - cricket — crouches then springs across a stem
  - spider — spins a small web between branches
  - snail — advances on leaf and extends antennae
- Sea:
  - dolphin — leaps through splash above waves
  - fish — navigates through coral arch
  - whale — surfaces then blows a tall water spout
  - octopus — slides between reef rocks using tentacles
  - turtle — slowly swims over seagrass while flippers paddle
  - crab — side-steps into sand and lifts claws
- Magic:
  - rocketMagic — ignition, lift-off into stars
  - starMagic — gathers motes then sparkles brighter
  - moonMagic — rises behind clouds and casts reflections
  - rainbowMagic — appears in an arc above a waterfall
  - unicorn — trots through meadow leaving a brief glitter trail
  - dragon — flies over hills with a gentle harmless warm glow

## Nonnegotiable requirements and next steps

1. FIRST obtain GitHub PR state, precise branch SHA, CI results. Run a **real-user visual preview** on the experimental `reward-car-preview.html`; seek feedback about car geometry (current procedural low-poly 3D pilot; user requested premium studio quality), road framing, animation timing, return animation, viewport/3D smoothness. No claim of user approval until user actually confirms.
2. DO NOT silently apply the car implementation to all 50 rewards. Once car pilot appearance is approved, build a reusable content/presentation framework and ship in small test batches, each with unique scene choreography; use optimized authored meshes/animation clips where needed for premium art, NOT just emoji shakes.
3. Maintain cost/unlock ledger in `areg-magic-unlocked-v1` and `areg-stars-v35`. No reset/no extra star charges on replay; locked collectibles unchanged, all grid scrolling and V290 back transitions unchanged.
4. Guard 3D memory and PWA performance: load only the tapped mini-scene, dispose geometries/textures/canvas/events afterwards, inspect offline caching, preserve DotKiosk installed origin and saved data, don't preload 50 scenes.
5. Automatic Windows local/USB backup exists as user-reported setup; it may catch new trial Git refs, but **new-ref bundle copy to USB has NOT yet been directly verified**. When trial branch changes land, the user may later show USB AutoSync logs and SHA-256 evidence. Never assert backups synced automatically without such evidence.
6. BEFORE any main merge, explicit user approval plus QA and Pages release verification. Current approved **V290** protected. Log all exact changes and next-chat resume point in `CURRENT_STATUS.md`, `PROJECT_HANDOFF.md`, and `NEW_CHAT_HANDOFF.md` after material work.

**NEW CHAT START HERE:** inspect GitHub `main` and `feature/v291-reward-car-cinematic-pilot-20261012`, `AGENTS.md` and three handoffs. Check the new draft pilot PR CI, then ask user to open the isolated car preview on phone. Main has NOT been modified by this pilot.
