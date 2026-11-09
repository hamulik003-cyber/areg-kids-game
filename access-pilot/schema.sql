-- AREG isolated access pilot schema (NOT applied to any database).
-- Requires PostgreSQL 15+. Never deploy on DotKiosk production.
BEGIN;
CREATE TABLE IF NOT EXISTS pilot_visitor_identities (
  id uuid PRIMARY KEY,
  verified_email_hash bytea NOT NULL UNIQUE,
  verified_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pilot_access_requests (
  id uuid PRIMARY KEY,
  visitor_id uuid NOT NULL REFERENCES pilot_visitor_identities(id),
  status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','revoked')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  decided_at timestamptz,
  CHECK(expires_at>requested_at)
);
CREATE INDEX IF NOT EXISTS pilot_access_requests_status_idx ON pilot_access_requests(status,requested_at DESC);
CREATE TABLE IF NOT EXISTS pilot_owner_login_challenges (
  owner_id text PRIMARY KEY,
  nonce text NOT NULL,
  code_digest text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
  used boolean NOT NULL DEFAULT false,
  next_send_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS pilot_owner_sessions (
  session_hash bytea PRIMARY KEY,
  owner_id text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
CREATE TABLE IF NOT EXISTS pilot_push_subscriptions (
  id uuid PRIMARY KEY,
  owner_id text NOT NULL,
  endpoint_ciphertext bytea NOT NULL,
  keys_ciphertext bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  disabled_at timestamptz
);
CREATE TABLE IF NOT EXISTS pilot_audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_type text NOT NULL CHECK(actor_type IN ('visitor','owner','system')),
  action text NOT NULL,
  request_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
