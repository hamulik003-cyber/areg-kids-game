# V289 — original JPG source fidelity, Lyra only (do NOT deploy yet)

**User goal:** Preserve original 10-lyra.jpg actual visual details as transparent PNG (same silhouette and size as approved game image), optimize lightweight WebP. No generation or shape/line/star change.

Technical root cause (from `scripts/build-constellation-alpha.py`): The old extraction used RGB `original × 1.48`, clipping some detail/color, and high-pass-derived incomplete alpha, fading illuminated areas. Naive upscale/sharpen cannot restore the original color. This pilot reuses **every source JPEG RGB pixel** for nontransparent positions, retains the EXACT existing game PNG nonzero-alpha support (no new visible areas, no geometry/line change), and derives three alternative opacity curves only over already-present pixels. It does not attempt to recreate unseen source background or claim that a transparent rendering can be visually identical to the fully opaque original JPEG.

Outputs under `qa/v289-lyra-restore/` ONLY: PNG+WebP for gentle/vivid/full matte, a four-wide equal-size comparison, two-up close review sheet, quantitative report. Original size remains 480×574. Runtime WebP q88 intended to keep weight small.

**Gate:** Evaluate existing Lyra and three candidates over the same game-navy background. Choose at most ONE only if it looks noticeably closer to the original without black spots, aliasing, posterization, halo, loss of detail or heavier file size. Otherwise do not ship. Existing V287 positive Orion Belt fix and V285 audio/stars/animations remain sacrosanct. Never edit main before visual approval and actual CI/DotKiosk verification.
