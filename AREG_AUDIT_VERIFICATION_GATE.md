# AREG audit verification gate — 2026-11-09

**Status:** review prepared; latest GitHub Actions job conclusions and artifacts not independently fetched. Do not claim CI success based only on committed workflow files.

## Confirmed from repository inspection
- Safety branch is 48 commits ahead of `trial/areg-test-full-app-20261017` at the time of comparison.
- Compared file list contains only audit workflow, tests and audit documentation; no game source or production files.
- Workflow uses `contents: read`, `persist-credentials: false`, browser matrix Chromium/WebKit, and no deployment step.
- Tests include Checkers and Sea Battle online *characterization* cases for currently accepted malformed/out-of-sequence messages. Green results for those tests do not prove the protocol safe.

## Required CI acceptance (before any promotion)
1. Open GitHub Actions → `AREG isolated audit (read-only)` → latest run for `safety/areg-audit-pilot-20261109`.
2. Verify **all three jobs**: `rules-audit`, `browser-smoke (chromium)`, `browser-smoke (webkit)`. Record run ID, SHA and job conclusions.
3. Download both `areg-browser-chromium` and `areg-browser-webkit` artifacts; inspect `browser-*.json` `notices`, `failures`, `results`.
4. Classify every pageerror, HTTP >=400 local request and horizontal overflow: expected, test-harness artifact, or confirmed issue. Green CI alone is insufficient.
5. If any job fails, inspect exact logs before making changes. Modify only test/workflow files in safety branch; never game source or production.
6. After successful CI, manually validate installed iPhone AREG TEST PWA: open/re-enter games, rotate/resume, touch/drag, music persistence, and online two-device flows. Document evidence and obtain user approval before any deployment.

## Known protocol review items — no game fix authorized
- Sea Battle: `result` message acceptance does not correlate with an explicitly pending shot; tests intentionally demonstrate existing behavior. Proposed future fix: pending-shot index, duplicate/out-of-order rejection, disconnect recovery, paired-peer regression suite. Requires approval and trial deployment first.
- Checkers: `dice-throw` forwards unbounded value at dispatcher; downstream behavior not established. Proposed future test: full handler-to-state range validation. Also verify `play()` legal-move gate end to end (current dispatcher stub alone is insufficient).
- Both: two real peers, reconnect, delayed/reordered messages and iOS invite-link handoff are not covered by isolated VM tests.

## Next assistant instruction
Do not keep adding tests blindly. First obtain current GitHub Actions run IDs/logs/artifacts (or request one screenshot of latest run if connector cannot list runs), then act on actual failures. Keep the safety branch isolated.
