# AREG TEST — private invitation approval and iOS push (design only)

Status: DESIGN ONLY. No active access control, push delivery, deploy, or production changes.
Base: trial/areg-test-full-app-20261017. Production main is out of scope.

## Required behavior
- Visitor requests access through a server endpoint, not a client-side allowlist.
- Visitor must verify identity (e.g. email one-time code / passkey); an entered name is not identity.
- Request enters pending state; default deny.
- Owner signs in with strong authentication and can approve, reject, revoke, and review audit history.
- Owner's installed iOS home-screen PWA may opt in to Web Push through a user gesture, HTTPS, service-worker Push API and Notifications permission (iOS 16.4+). Notification opens authenticated approval screen. Do not put privileged approval tokens in push payload.
- Notification is a convenience, not authorization. Backend must validate every game session and revoke access server-side. Shared links alone never grant access.
- Rate limit requests, expire pending requests, protect against replay/CSRF, log security events without exposing personal data.
- Owner device and push subscription keys must not be committed to GitHub or embedded in JS. Store VAPID private key server-side in managed secrets; rotate/revoke subscriptions.
- Do not grant access when push delivery fails; pending requests remain visible in owner's dashboard.
- iOS PWA must continue to work after updates, including offline gameplay where authorized; offline revocation has inherent limits requiring an explicit policy.
- Avoid modifying existing gameplay logic, approved mechanics, service-worker caching, or Render deploy configuration until a tested migration plan is approved.

## Deployment and security architecture to validate before coding
1. Inventory Render static site, any GitHub Pages URLs, DotKiosk and AREG TEST install origins.
2. Choose a managed authenticated backend/database and owner authentication method.
3. Verify iOS home-screen PWA push permission on actual owner device; test locked-screen receipt, denied permission, offline, Focus mode, expired subscriptions.
4. Define secure token/session lifetime and offline access behavior.
5. Stage backend and owner panel on an isolated test environment, not public production.
6. Add tests for denied-by-default, identity verification, approval/rejection/revocation, session enforcement, duplicate/replayed requests, and notification failures.
7. Only after explicit user approval, integrate with AREG TEST and verify installed PWA updates. DotKiosk remains untouched.
8. Private repository transition is a separate approval gate; first verify Render and connected GitHub app can read private repos, and arrange Windows signed update distribution.

## Current implementation status
No backend, database, VAPID keys, iOS subscription or notification endpoints created by this document. This branch is isolated and does not deploy.
