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
