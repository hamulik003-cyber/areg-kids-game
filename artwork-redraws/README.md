# V286 — SAME-STYLE FULL REDRAW (NOT OVERLAY) — protected artist handoff

**User decision:** simply adding correct star lines over an existing picture looks patched. Recreate the **entire unified illustrative composition** so the figure itself follows the selected teaching sky pattern and the lines, stars and lighting are a single artwork. Preserve the premium deep cobalt/sapphire blue, subtle purple nebula texture, pearl-white star cores and elegant narrow blue glow used in the 34 other AREG illustrations. Keep no text, no labels, no frames, no watermark.

**Do not treat any star line graph as the only official one.** The IAU defines constellation boundaries but does not prescribe exact stick figures: https://www.iau.org/IAU/IAU/Astronomy-FAQs/Constellations.aspx . Choose common educational star patterns; verify actual identified stellar nodes from an astronomy chart before sign-off.

## Replacement candidates — four only, subject to scientific & art validation

| Art (existing ID) | Essential redraw concept | What must NOT happen |
| --- | --- | --- |
| **10-lyra** | Vega bright standalone point joining a small four-star Lyra parallelogram (β/γ/δ/ζ Lyrae); elegant lyre artwork fits the star skeleton naturally. | Old decorative strings and a contradictory second star skeleton must not remain. |
| **16-hayk-belt** | **Orion's Belt is an asterism, NOT a separate constellation.** Three crisp white-blue stars Mintaka, Alnilam, Alnitak almost straight across a visually coherent hunter's waist. If the hunter remains, its pose must match those three belt stars. | Three old hollow/black stars, extraneous claimed belt stars, long overlays that do not attach to the stars. |
| **22-pisces** | **NEW SPATIAL COMPOSITION:** two separated stylized blue fish, western Circlet (roughly 5–7 stars) and eastern small triangular head; a V/open chain of two cords converges at **Alrescha** toward bottom of canvas. Sapphire-violet nebula and lighting identical to old collection. | Two fish chasing each other in a closed wheel or two diagrams layered over the wrong fish positions. |
| **30-canis-minor** | Entire dog artwork can be reposed in same rich blue celestial style to follow the principal **Procyon ↔ Gomeisa** 2-star connection. | Fake dog-outline constellation of 8–11 stars. |

Scientific references: https://www.constellation-guide.com/circlet-of-pisces/ and IAU/Sky & Telescope constellation charts.

## Delivery contract and rendering pipeline
1. Each completed illustration must be a **standalone new illustration**, not a corrected-vertices overlay on old JPG. One full canvas per card, portrait, same elegant blue/violet palette. 
2. Keep the real illustrated object aligned to the teaching sky graph; stars should glow solid blue-white, **never black-core**, and lines must be delicate and embedded in the same material treatment.
3. Prepare **manually reviewed transparent RGBA PNG** at `artwork-redraws/sources/<unchanged-stem>.png`. The result must not be merely an opaque JPG with a fake alpha channel. If a model produces an opaque JPG, a separate conscientious matte/background removal is required.
4. Run `python scripts/v286-package-redrawn-art.py` to verify; it NEVER changes the game by default. Run with `--publish --only 22-pisces` to build that PNG+WebP pair ONLY on this protected feature branch after approval. Then visually compare it to both original and rest of collection at actual game size.
5. Artwork updates also require a **separately justified constellation star-layout JSON update**. The previous measured `constellation-star-layouts.json` tracks old artwork pixels; DON'T reuse old points as if they were real star chart coordinates.
6. Verify `git diff --name-only main...HEAD`: untouched 34 asset PNG/WebP hashes must be identical, no audio/gameplay/CSS changes. Only approved files + manifest, specific layout entries and cache metadata if actually needed. Run full CI and DotKiosk visual checks before merging.
7. Protected live V285 remains untouched until a verified visual acceptance. Never delete PWA user data or stars to update assets.

**Old procedure is rejected:** `scripts/v286-correct-constellation-art.py` directly overlaid new star lines on the old figures and generated dark holes/ghost strokes. We revert all 8 such produced binaries before continuing.

Initial artist iteration: Runway concept task ID `fed69cd3-ddd3-4fc6-93e9-dcc538a3c688` (Pisces full redraw). **This is a concept only, not an approved or staged game asset**, and cannot be used until its color/geometry/matte are reviewed. Do not expose its temporary signed URL in repository.
