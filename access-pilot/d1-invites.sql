-- Cloudflare D1 isolated invitation schema. Not applied to any live database.
-- Invite tokens are stored as SHA-256 digests, never plaintext.
CREATE TABLE IF NOT EXISTS invite_records (
 token_hash TEXT PRIMARY KEY CHECK(length(token_hash)=64),
 recipient_id TEXT NOT NULL,
 expires_at INTEGER NOT NULL,
 claimed_at INTEGER,
 claimed_device_id TEXT
);
CREATE INDEX IF NOT EXISTS invite_records_recipient_idx ON invite_records(recipient_id);
CREATE TABLE IF NOT EXISTS invite_grants (
 recipient_id TEXT PRIMARY KEY,
 device_id TEXT NOT NULL,
 activated_at INTEGER NOT NULL,
 revoked_at INTEGER
);
CREATE TABLE IF NOT EXISTS invite_audit (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 event TEXT NOT NULL CHECK(event IN ('issue','claim','revoke')),
 recipient_id TEXT NOT NULL,
 at INTEGER NOT NULL
);
