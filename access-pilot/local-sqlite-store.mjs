import {DatabaseSync} from 'node:sqlite';
import {randomUUID} from 'node:crypto';
// Free, dependency-free local persistence for development and tests ONLY.
// Render free web service has ephemeral filesystem: NEVER use this adapter
// as the authoritative live approval database.
export function openLocalPilotStore(filename=':memory:'){
 const db=new DatabaseSync(filename);
 db.exec(`PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS requests(id TEXT PRIMARY KEY, identity_id TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('pending','approved','rejected','revoked')),created_at INTEGER NOT NULL,expires_at INTEGER NOT NULL,decided_at INTEGER);
 CREATE INDEX IF NOT EXISTS requests_by_status ON requests(status,created_at);
 CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,request_id TEXT NOT NULL,action TEXT NOT NULL,at INTEGER NOT NULL);`);
 const insert=db.prepare('INSERT INTO requests(id,identity_id,status,created_at,expires_at) VALUES(?,?,?,?,?)');
 const select=db.prepare('SELECT id,identity_id AS identityId,status,created_at AS createdAt,expires_at AS expiresAt,decided_at AS decidedAt FROM requests WHERE id=?');
 const list=db.prepare('SELECT id,identity_id AS identityId,status,created_at AS createdAt,expires_at AS expiresAt,decided_at AS decidedAt FROM requests ORDER BY created_at DESC LIMIT 100');
 const update=db.prepare('UPDATE requests SET status=?,decided_at=? WHERE id=? AND status=? AND expires_at>?');
 const revoke=db.prepare("UPDATE requests SET status='revoked',decided_at=? WHERE id=? AND status='approved'");
 const audit=db.prepare('INSERT INTO audit(request_id,action,at) VALUES(?,?,?)');
 function authenticated(flag){if(flag!==true)throw Error('Owner authentication required');}
 return Object.freeze({
  submitVerified(identityId,now,{ttlMs=15*60_000}={}){
   if(typeof identityId!=='string'||!identityId||!Number.isSafeInteger(now)||!Number.isSafeInteger(ttlMs)||ttlMs<=0)throw Error('Verified identity and valid clock required');
   const id=randomUUID();insert.run(id,identityId,'pending',now,now+ttlMs);audit.run(id,'request',now);return select.get(id);
  },
  listForOwner({ownerAuthenticated}){authenticated(ownerAuthenticated);return list.all();},
  decide(id,{action,ownerAuthenticated,now}){
   authenticated(ownerAuthenticated);if(!['approve','reject'].includes(action)||!Number.isSafeInteger(now))throw Error('Invalid decision');
   db.exec('BEGIN IMMEDIATE');try{
    const result=update.run(action==='approve'?'approved':'rejected',now,id,'pending',now);
    if(result.changes!==1)throw Error('Request unavailable, expired or already decided');
    audit.run(id,action,now);db.exec('COMMIT');return select.get(id);
   }catch(e){db.exec('ROLLBACK');throw e;}
  },
  revoke(id,{ownerAuthenticated,now}){
   authenticated(ownerAuthenticated);if(!Number.isSafeInteger(now))throw Error('Invalid clock');
   db.exec('BEGIN IMMEDIATE');try{const result=revoke.run(now,id);if(result.changes!==1)throw Error('Request not approved');audit.run(id,'revoke',now);db.exec('COMMIT');return select.get(id);}catch(e){db.exec('ROLLBACK');throw e;}
  },
  mayPlay(id,{identityId,now}){if(typeof identityId!=='string'||!Number.isSafeInteger(now))return false;const row=select.get(id);return !!row&&row.identityId===identityId&&row.status==='approved'&&now<row.expiresAt;},
  close(){db.close();}
 });
}
