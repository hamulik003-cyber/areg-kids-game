# V288 — FREE NON-GENERATIVE CLEANING, PREVIEW ONLY

User explicitly prohibits ANY NEW image generation, character redesign, changed star placement, line geometry, colors or outfits. Wants an improvement in perceived clearness and luminous detail of the **existing** 38 AREG constellation illustrations. Current V287 tried CSS brightness/contrast and only repaired the already-approved 3 Belt star cores, but the other images still look faded.

## True cause and honest limits
- Existing asset source RGBA PNGs are generally only 480×574 and alpha extraction made some bright sections faint, sometimes black holes in star centres; RGB pixels lost by earlier extraction cannot be invented from a low-res file.
- Existing runtime WebP encodes are small; CSS brightness does NOT restore missing pixel information.
- NO GAN, diffusion, AI image generation, paid subscription or model download. PIL + OpenCV only: edge-aware bilateral smoothing, bounded unsharp mask, alpha-aware Lanczos upscale. Optional variant boosts visibility of ONLY existing partly-transparent pixels; originally zero alpha remains zero. It cannot recreate true detail if gone.
- Never rerender the mythological figures. Keep ALL source PNGs/JPGs, all star geometry, V287 belt fix and V285 audio PWA logic.
- This preview processor produces *only* `qa/v288-previews/` sample files for three samples and a JSON report; it does not touch any production assets.

## Pilot verification gates
1. Open three side-by-side comparison JPGs for Ursa Major, Lyra and Pisces. Display original and both deterministic variants against the SAME navy background at SAME display scale.
2. Look for unwanted halos around bright nodes, extra sharpening artifacts, faded parts, alpha holes, palette shifts or a worsened PNG-to-WebP appearance. If differences negligible, **do not** claim Topaz-quality enhancement.
3. Show user actual comparisons BEFORE any future 38-file processing. Belt already user-approved, so never process it without user permission.
4. Any production upgrade later must keep filenames, stars, animation 850/580/780ms, wallet, music isolation; protect original Git blobs, benchmark WebP size/speed, build/CI/WebKit and test in DotKiosk.
5. Immovable recovery point: `baseline/v287-user-approved-orion-belt-before-image-clarity-trial-2026-10-10` at `34548b66aeb1cadde0fb1e643830de091d2172a6`. Older confirmed V285 baseline also preserved.

**DO NOT MERGE pilot PR before clear visual approval.** Github Actions available in the repo handles the preview on the feature branch only.
