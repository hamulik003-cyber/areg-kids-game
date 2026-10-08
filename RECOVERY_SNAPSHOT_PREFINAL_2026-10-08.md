# AREG Kids Game — PRE-FINAL SAFE RECOVERY

**Snapshot date:** 2026-10-08  
**Status:** Preliminary-final safe checkpoint. DO NOT DELETE.

## Exact content snapshot
- Original main commit: `c19a6677cb22fbad953a751e81e171642d709dae`
- Exact source tree: `d1e6676877a29f8216de2d5a246a880c5aa93fde`
- Marker checkpoint commit (same source tree, no gameplay/source changes): `74c8d06799c86daaa66c398327f2e72faca65de7`

## Recovery refs
- `recovery-v198-prefinal-raw` → exact original main snapshot
- `baseline-v198-prefinal-safe` → safe marker/checkpoint lineage

## Critical verified repo assets
- `assets/space3d/user-final/05-moon-v2.jpg`
  - Git blob SHA: `101cda4fe34226a9d45fd56f5215279f8f649720`
- `assets/space3d/user-final/02-mercury-v2.jpg`
  - Git blob SHA: `a47823e58a414b0578e372768b5c092760f91bff`

## Verified deployment
GitHub Pages deployment for `c19a6677cb22fbad953a751e81e171642d709dae` completed successfully.

## Restore procedure
1. Never delete the two recovery branches above.
2. If `main` is damaged, compare it to `recovery-v198-prefinal-raw`.
3. Restore `main` from `c19a6677cb22fbad953a751e81e171642d709dae` (or from the raw recovery branch).
4. After restore, verify Pages deployment and the Moon/Mercury v2 blob SHAs above.
5. Only replace this checkpoint after a newer build is explicitly verified and saved as a new safe snapshot.

This file is recovery documentation only; the canonical exact game content is preserved by the commit SHA and recovery branch.