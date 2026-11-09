# Zero-cost durable storage decision — AREG access pilot

## Recommendation: Cloudflare Workers + D1 (free tier)

Use an **isolated** Cloudflare Worker for access-control APIs and a D1 database for persistent requests, owner sessions and audit records. This is a design decision, **not a deployed system**. The Cloudflare free tier has usage and resource limits, which must be checked against current account terms before deployment. Do not enable a paid plan or automatic billing. Workers/D1 are not substitutes for secure owner authentication.

### Why not existing alternatives?

- Render free web-service local SQLite: ephemeral filesystem; data can disappear on restart or redeploy. **Rejected for live grants**.
- Render free Postgres: lifecycle and expiry restrictions; not suitable to promise indefinitely durable storage. **Not provisioned**.
- GitHub repository or GitHub Actions as a database: poor security and latency, difficult revocation, exposes sensitive metadata and can exhaust quotas. **Rejected**.
- Browser localStorage / IndexedDB: not a server-side access-control authority. **Rejected**.

### Implementation prerequisites

1. Confirm access to a Cloudflare account with Workers and D1 free-tier availability. Creating an account or connecting it requires user action; do not assume access.
2. Verify current limits and behavior on quota exhaustion. Design **fail-closed**: if DB unavailable, deny gameplay, never auto-approve.
3. Create a separate D1 database and apply a D1-compatible migration (Postgres schema.sql is **not** compatible).
4. Add identity proof, owner OTP email delivery, session revocation, CSRF controls, request throttling and encrypted push subscriptions.
5. Run tests for durability across Worker redeploys, owner approval/revocation, concurrent requests, expiry, failed notification and iPhone PWA push.
6. Integrate **AREG TEST only** after review; DotKiosk requires separate explicit approval.

### Current status

No Cloudflare account connected, no D1 database created, no live approval endpoint exposed, no production changes. Existing UI is only a mock. This document does not imply free tier will always be available or unlimited.
