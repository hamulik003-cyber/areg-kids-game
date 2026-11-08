# AREG audit — handoff and continuation (2026-11-09)

## User's non-negotiable rules
- Never modify DotKiosk / production / main without explicit user approval.
- All game changes must first be tested in AREG TEST; preserve approved mechanics.
- Keep iPhone Safari and installed iOS PWA compatibility; browser emulation is not a substitute for real-device checks.
- Do not auto-fix, deploy, merge, or silently modify approved games.
- Inspect existing implementation before changes; test, report verified vs unverified facts.

## Repository and boundaries
- Repository: hamulik003-cyber/areg-kids-game
- Production: main (DotKiosk). Do not touch.
- AREG TEST source: trial/areg-test-full-app-20261017. Do not touch without a specifically authorized game change.
- Isolated audit pilot: safety/areg-audit-pilot-20261109.
- Audit CI: .github/workflows/areg-isolated-audit.yml, push to safety branch and manual dispatch.
- Hourly failure-watch automation already exists: AREG թեստերի հսկողություն (do not duplicate).

## What exists on isolated audit branch
- AREG_SAFETY_POLICY.md — approval and test safety rules.
- tests/areg-nardi-rules.test.mjs — Nardi rules regression tests.
- tests/areg-nardi-integration.test.mjs — Nardi wiring and asset checks.
- tests/areg-source-smoke.test.mjs — source feature markers.
- tests/areg-checkers-sea-integration.test.mjs — Checkers / Sea Battle static contracts.
- tests/areg-discovery.mjs — reusable discovery and literal local-asset parser.
- tests/areg-discovery.test.mjs — pure discovery regression fixtures.
- tests/areg-future-games.test.mjs — dynamically discovered areg-*.html pages in app.js, basic HTML and local asset diagnostics. Retired references are nonblocking.
- tests/areg-browser-smoke.mjs — local-server mobile viewport Chromium/WebKit page loads, pageerror notices, horizontal-overflow notices, failed local request notices, JSON reports.
- CI includes read-only Node tests and separate mobile Chromium/WebKit jobs. Browser reports uploaded as short-lived GitHub Actions artifacts (14 days).
- Existing games / app.js / production files were not intentionally modified by this audit work.

## Verification status — important
- User screenshots confirmed first NINE isolated audit GitHub Actions runs green, prior to later browser work.
- Later CI revisions, especially Chromium/WebKit matrix and JSON artifact uploads, have NOT been independently verified as green. Do NOT say they passed until confirmed via Actions run logs or screenshots.
- The GitHub connector's fetch_commit_workflow_runs only returns PR-triggered runs, so an empty response does NOT mean push-triggered Actions did not execute.
- Current browser checks are smoke checks, NOT full gameplay or real iPhone PWA validation.
- A removed Draw & Color file is still referenced in app.js; this is deliberately diagnostic only, not a reason to restore or modify it.
- Legacy Color Blast page may lack a title; missing title is nonblocking.
- Test logic itself has not been executed locally in this conversation; check CI before claiming success.

## Immediate next actions (priority)
1. Verify the latest isolated audit run on GitHub Actions, inspect each Node/Chromium/WebKit job and logs, fix ONLY audit test or workflow problems in safety branch.
2. Confirm browser reports actually upload, inspect runtime errors and failed local asset requests; distinguish real defects from known intentional behavior.
3. Add interactive, deterministic game-specific tests using existing harnesses and approved mechanics, not arbitrary changes.
4. Consider WebKit screenshots and explicit iPhone PWA manual approval checkpoints.
5. Only after evidence and explicit user approval propose moving safe test infrastructure into AREG TEST; never production automatically.

## How to continue in a new chat
Say: «Շարունակիր AREG անվտանգության ավտոմատ թեստերի նախագիծը։ Կարդա GitHub-ի safety/areg-audit-pilot-20261109 ճյուղի AREG_AUDIT_HANDOFF.md և AREG_SAFETY_POLICY.md։ Նախ ստուգիր վերջին Actions արդյունքները, հետո շարունակիր միայն անվտանգության ճյուղում։ DotKiosk-ը մի փոխիր»։
