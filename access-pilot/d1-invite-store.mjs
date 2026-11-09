// Cloudflare D1 adapter for the isolated invite policy. Requires a D1 binding.
// Does not authenticate identities; those MUST be verified before invoking the policy.
export function createD1InviteStore(db){
 if(!db||typeof db.prepare!=='function'||typeof db.batch!=='function')throw TypeError('D1 binding required');
 return Object.freeze({
  async create({tokenHash,recipientId,expiresAt}){
   await db.batch([
    db.prepare('INSERT INTO invite_records(token_hash,recipient_id,expires_at) VALUES(?,?,?)').bind(tokenHash,recipientId,expiresAt),
    db.prepare("INSERT INTO invite_audit(event,recipient_id,at) VALUES('issue',?,?)").bind(recipientId,Date.now())
   ]);
  },
  async getByHash(tokenHash){const row=await db.prepare('SELECT recipient_id AS recipientId,expires_at AS expiresAt,claimed_at AS claimedAt FROM invite_records WHERE token_hash=?').bind(tokenHash).first();return row||null;},
  async claim({tokenHash,recipientId,deviceId,now}){
   // Single atomic conditional UPDATE prevents two devices from claiming the same invite.
   const result=await db.prepare('UPDATE invite_records SET claimed_at=?,claimed_device_id=? WHERE token_hash=? AND recipient_id=? AND claimed_at IS NULL AND expires_at>?').bind(now,deviceId,tokenHash,recipientId,now).run();
   if(result.meta?.changes!==1)return false;
   // D1 batch is transactional: grant and audit must commit together.
   // The prior conditional claim is separate; if this batch fails, access remains denied.
   await db.batch([
    db.prepare('INSERT INTO invite_grants(recipient_id,device_id,activated_at,revoked_at) VALUES(?,?,?,NULL) ON CONFLICT(recipient_id) DO UPDATE SET device_id=excluded.device_id,activated_at=excluded.activated_at,revoked_at=NULL').bind(recipientId,deviceId,now),
    db.prepare("INSERT INTO invite_audit(event,recipient_id,at) VALUES('claim',?,?)").bind(recipientId,now)
   ]);
   return true;
  },
  async getGrant({recipientId,deviceId}){const row=await db.prepare('SELECT device_id AS deviceId,revoked_at AS revokedAt FROM invite_grants WHERE recipient_id=? AND device_id=?').bind(recipientId,deviceId).first();return row?{revoked:row.revokedAt!==null}:null;},
  async revoke({recipientId,now}){const result=await db.prepare('UPDATE invite_grants SET revoked_at=? WHERE recipient_id=? AND revoked_at IS NULL').bind(now,recipientId).run();if(result.meta?.changes===1)await db.prepare("INSERT INTO invite_audit(event,recipient_id,at) VALUES('revoke',?,?)").bind(recipientId,now).run();return result.meta?.changes===1;}
 });
}
