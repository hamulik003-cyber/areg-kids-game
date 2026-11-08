# AREG isolated audit — verification and remaining risk register

This document reports **test coverage, not release approval**. Audit branch: `safety/areg-audit-pilot-20261109`. No game source files, AREG TEST deployment, or DotKiosk production files were changed by these audit commits.

## Executed CI scope

- Node 22 isolated tests: repository integrity/discovery, Nardi rules, Checkers move/capture/crowning/FUK/chain rules, Checkers online message dispatch, Sea Battle hit/sink/win, local/AI/online turns, and Sea Battle online message dispatch.
- Headless Chromium and WebKit mobile-emulation smoke checks: discovered game HTML pages load, title/width diagnostics, synthetic touch and resize events.
- Passing CI means these *selected assertions* passed. It does not mean all game paths or all devices are correct.

## Gaps and risks identified by source review (not confirmed exploits)

1. **Sea Battle online result correlation:** `handleMessage({type:'result'})` checks phase, turn, integer/range and prior shots, but does not visibly compare the result's `i` to the pending outgoing shot. A stale or unexpected valid-index result could therefore be recorded. Add an explicit pending-shot state and protocol-level tests only after approval to change gameplay.
2. **Checkers online move validation:** `attach()` validates integer `from/to/cap` and side-to-move before calling `play()`. `play()` independently checks the legal move list; this is good defense in depth. However, malformed `fuk` and `dice-throw` messages have less explicit type/range validation at the dispatch boundary. Review end-to-end behavior before proposing changes.
3. **Browser diagnostics are informational:** page JavaScript exceptions, missing local assets, horizontal overflow and post-resize overflow are recorded as notices rather than CI failures. Review `audit-reports/browser-*.json` artifacts for each run; a green job alone cannot rule out these issues.
4. **Mobile realism:** Chromium/WebKit emulation is not installed iOS PWA testing. Touch gesture fidelity, real orientation changes, audio autoplay, persistent storage, invite-link handoff, reconnect/disconnect, network delay and device memory remain unverified.
5. **Two-peer synchronization:** isolated handlers are tested with stubs, not with two live peers over a network. Lost/duplicated/out-of-order messages, host/guest role transitions, simultaneous moves, and reconnection require integration testing.
6. **Future games:** discovery covers literal `areg-*.html` references in `app.js`, not arbitrary dynamically loaded games. Game-specific rule tests must be added when a new game is introduced.
7. **Test harness constraints:** VM extraction assumes the functions remain named declarations with balanced braces; it is not a JavaScript parser. Stubs intentionally replace DOM/animation/network; those effects are not validated.

## Release gate

Before promoting any changes: require successful isolated CI, review all browser notices and known risks, test on the user's installed AREG TEST iOS home-screen app, and obtain explicit user approval. Never auto-merge or auto-deploy to DotKiosk.

## Follow-up priorities

1. Review CI browser JSON notices and categorize actual errors vs known intentional layout.
2. Add true two-peer integration tests in an isolated, non-production environment.
3. Add real iPhone PWA manual acceptance checklist and evidence collection.
4. Propose gameplay fixes separately, with risk analysis, only if approved.
