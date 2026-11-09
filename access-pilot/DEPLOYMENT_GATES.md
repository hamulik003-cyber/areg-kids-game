# AREG access pilot — secure backend deployment gates

This is a **schema-only** preparation, not a database migration. Never use the production DotKiosk database or deploy this schema to existing services.

## Current limits
- The running Render pilot stores push subscriptions in memory; they disappear on restart. It has no verified owner session and **must not** receive public approve/reject routes yet.
- `owner-login.mjs` and `approval-coordinator.mjs` are isolated modules, not deployed APIs. The dashboard is explicitly simulated.
- A secure email provider has not been selected/configured. Owner email must be set only in secret environment settings, not source control.
- Database provision and ongoing plan charges require user confirmation. Free database expiry/persistence must be checked before selecting a plan.

## Implementation order
1. Provision a **separate** pilot Postgres database after confirming plan/cost and owner approval.
2. Apply `schema.sql` only to the isolated pilot DB, with least-privilege credentials and backups.
3. Add a transaction-safe OTP store (atomic attempt increment, used-once verification), session hash rotation, secure HttpOnly SameSite cookies, CSRF and request throttling.
4. Configure email delivery credentials and verify SPF/DKIM/DMARC for the sender; do not expose OTP or recipient in logs.
5. Require verified visitor identity before any request; never accept display names as proof.
6. Persist owner push subscriptions only after owner sign-in. Encrypt subscription endpoint and keys at rest.
7. Implement authenticated list/approve/reject/revoke endpoints with DB transactions and audit events.
8. Integrate with an isolated test game gateway; enforce every access check on the server. A client-only lock is insufficient.
9. Exercise denial, replay, expiry, restart, concurrency, rate limits, offline mode and iPhone PWA notifications before considering AREG TEST integration.
10. Do not touch DotKiosk without separate explicit approval.

## Zero-cost constraint (owner requirement)
- No paid resources, upgrades, subscriptions or payment-method-required services may be provisioned.
- Render workspace check (2026-11-09): no existing Postgres databases. A Render free Postgres offering may have expiration and is **not** a guaranteed durable permanent solution; do not create one solely to imply persistence.
- Local SQLite adapter is useful for local tests only: Render free web service filesystem is ephemeral. Never store authoritative access grants there.
- Before implementing a live pilot, evaluate a free persistent remote database with documented free-tier limits and no automatic paid upgrade. Confirm credentials and persistence, then implement server-side authorization, expiry and backup/recovery tests.
- No new external account or paid billing authorization is assumed. The current mock remains non-authorizing until these gates are satisfied.
