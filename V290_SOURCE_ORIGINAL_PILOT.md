# V290: Lyra source-original pilot (NOT deployed)
- Base: main V287 commit 34548b66aeb1cadde0fb1e643830de091d2172a6.
- Only **10-lyra** is experimentally replaced in this branch. Keep all 37 other pictures, **especially 16-hayk-belt** and its three approved star centers, unchanged.
- User ZIP: 39 original images; index 18 is original 1254x1254 RGB Lyra image. Image 36 is not in the game's 38 and is excluded.
- Reconstruction: original RGB source resized 684x684 in a 720x861 transparent canvas, offset (18,89), corresponding exactly to 456x456 at (12,59) in the game's 480x574 JPG. Alpha support derived exclusively from existing V287 10-lyra PNG, enlarged 1.5x, with opacity exponent 0.35 and color gamma 0.68.
- WebP q80. Intended improvement: preserve source image detail at the same compositional position without generating or drawing new lines, stars or figures.
- The PNG fallback is decoded from this WebP by the feature-only GitHub Actions workflow. This trial **is not approved**, and must not be merged or deployed until visual and iOS/DotKiosk checks pass.
- Baseline WebP 63,664 bytes; experimental WebP 107,062 bytes at 720x861, i.e. 43,398 more bytes for this one artwork.
- Main/PWA/service-worker, sound, animations, rewards and other 37 artwork files must remain untouched. Tests may reveal existing baseline WebKit offline cache failures.

V290 pilot update: Sagittarius source ZIP #39; Wolf source ZIP #29. ZIP #37 is Phoenix and was rejected by the matching guard (no runtime file changed). Re-run both source masks in feature branch; 16-hayk-belt never changed.
