# V286 PROTECTED FEATURE BRANCH — STAGING, NOT RELEASE
This change deliberately does NOT change live app/gameplay. Based on [issue #7](https://github.com/hamulik003-cyber/areg-kids-game/issues/7).
Only 10 Lyra, 16 Orion Belt, 22 Pisces, 30 Canis Minor pass the elementary non-controversial pattern test at this stage. They are drawn as educational **conventional schematic figures**, NOT asserted to be a unique official IAU diagram or accurate catalogue projection.
IAU: https://www.iau.org/IAU/IAU/Astronomy-FAQs/Constellations.aspx

The workflow generates corrections to **existing** transparent PNG+WebP files in the feature branch, preserving file names and untouched 34 PNG/WebP sets. The app's currently accepted V285 experience is NOT changed while the generated visuals are reviewed and audited. Required before release: visual review at actual runtime size (esp. separation of old baked lines), source-based geometry review, exact file-by-file comparison, QA, cache update and DotKiosk confirmation. The script may need further refinement if overpainting introduces extra old stars or quality loss. Never merge as-is without that review.

Known limitation: root JPGs still include the original stylized lines; regenerating all 38 with older build-constellation-alpha.py may overwrite these targeted corrections. Future alpha workflow must apply V286 corrections as a final step or not be rerun without review.
