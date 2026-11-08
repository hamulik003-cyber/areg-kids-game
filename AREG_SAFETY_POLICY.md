# AREG safety pilot — no automatic game modifications

Scope: isolated branch `safety/areg-audit-pilot-20261109` only. Do not merge to AREG TEST or `main` without explicit user approval.

## Immutable approved behavior
- DotKiosk production and its approved Sea Battle / Checkers behavior must not be changed by this pilot.
- Approved Nardi dice visuals and independent 3D roll animation must not be changed by this pilot.
- Project-specific game rules take precedence over generic game rules.

## Audit boundaries
- CI has `contents: read`; no write token, no deploy step, no auto-fix, no auto-merge.
- Tests must not mutate project source, saved state, or production data.
- A failed test reports a discrepancy; it does NOT authorize a code change.
- Investigate failures before suggesting any fix. False positives must be documented.
- Any future visual baselines require user review; animation and device-specific behavior need separate validation.
- iOS Safari and home-screen PWA still require device verification.
- Do not enable required status checks or branch protections until the test suite is stable and the user approves.
- Keep a recoverable reference to the last approved baseline before any later code change.

## Pilot checks
`node --experimental-default-type=module --test tests/areg-nardi-rules.test.mjs`

## Reporting
Every report should distinguish: passed checks, failed checks, untested areas, and whether any production files were touched. Do not claim automatic ChatGPT notifications are configured until a separate monitoring automation is confirmed.

## Future-game onboarding (pilot)
- `tests/areg-future-games.test.mjs` discovers `areg-*.html` entry points referenced in `app.js`, including newly added games. No registration step is required for this limited static check.
- It checks the existence and basic HTML/viewport structure of present pages. A removed/retired page still mentioned in legacy code is only a diagnostic, not a blocking failure.
- New games implemented under other filenames or loaded dynamically without a literal `areg-*.html` reference are **not** automatically discovered.
- Game-specific rules, multiplayer state, responsive screenshots, and iOS home-screen PWA behavior require separately approved tests and device/browser validation.
- Once this pilot is verified, propose an explicit active-game registry to distinguish live games from historical references; do not change `app.js` to add such a registry without approval.
