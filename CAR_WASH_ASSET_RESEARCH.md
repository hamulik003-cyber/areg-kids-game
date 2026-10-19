# Car Wash visual asset selection — research only (NOT integrated / NOT approved)

Reference: user-provided realistic garage screenshot, dirty side-profile compact SUV, detailed cleaning tools, portrait iPhone composition.

## Candidate vehicle
Crashed Abandoned Car — Game Ready by Rashad Ibrahimli
https://sketchfab.com/3d-models/crashed-abandoned-car-game-ready-66ef51a84c9843dda53bf0b4b9020011
License shown: CC BY (attribution required); 8.3k triangles, 4K textures. Has rust and damage; not usable as a clean-after-wash hero vehicle without restoring or replacing damaged panels. Verify exact license and downloaded archive before integration.

Alternative intact SUV:
Urban '10 by Daniel Zhabotinsky
https://sketchfab.com/3d-models/urban-10-low-poly-model-2866efdfa943484391ef8313768e074d
License shown: CC BY; 16.6k triangles. Intact generic SUV, better clean-stage candidate; lower realism than screenshot.

## Garage lighting
Autoshop 01 HDRI by Oliksiy Yakovlyev — Poly Haven
https://polyhaven.com/a/autoshop_01
License: CC0. This is environment lighting, NOT a fully navigable photorealistic garage geometry. Needs background/environment artwork separately.

## Production acceptance gates
1. Download and validate permitted actual asset bytes; record attribution, texture sizes and compressed payload.
2. Establish side-profile camera and screenshot-quality car/background composition before wash gameplay.
3. Implement spatially aligned dirt/foam removal with touch mask, physically plausible water/foam and responsive audio.
4. Verify iPhone Safari, AREG TEST PWA and performance; no main/DotKiosk changes.
5. User must explicitly approve before merge.

Current prototype car-wash-3d.html is rejected. This file is only asset research; no asset is yet installed, no live visual change.

## First gate — vehicle selection status (2026-10-20)
- Prioritize an **intact** vehicle with downloadable GLB/glTF, UV-mapped PBR paint, transparent windows, recognizable tires, and license compatible with redistribution in a public web game.
- Reject the damaged/rusted car as the *sole* base model: washing cannot repair dents or rust, so it cannot deliver a believable clean result.
- The Urban '10 candidate is intact but labeled low-poly; do not treat it as screenshot-quality without examining its actual textures and silhouette.
- **Blocker:** candidate archive bytes and license metadata have not yet been downloaded and inspected. No honest asset approval or game integration can be claimed yet.
- Next: acquire a suitable permitted model archive, verify geometry and textures, then integrate into AREG TEST. Do not replace the current car with another procedural placeholder.
