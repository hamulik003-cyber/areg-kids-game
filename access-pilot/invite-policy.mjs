import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
// Isolated invitation policy. This module does NOT expose a public API or protect live games.
// Durable transactional DB and verified recipient/device proof are mandatory before deployment.
const digest=value=>createHash('sha256').update(value).digest('hex');
export function createInviteService({store,verifyAdmin,verifyRecipient,verifyDevice,clock=Date.now}){
 if(!store||['create','getByHash','claim','getGrant','revoke'].some(k=>typeof store[k]!=='function'))throw TypeError('Transactional invite store required');
 if([verifyAdmin,verifyRecipient,verifyDevice].some(x=>typeof x!=='function'))throw TypeError('Identity verification adapters required');
 return Object.freeze({
  async issue({adminCredential,recipientId,ttlMs=24*3600_000}){
   if(await verifyAdmin(adminCredential)!==true)throw Error('Admin authentication required');
   if(typeof recipientId!=='string'||!recipientId||!Number.isSafeInteger(ttlMs)||ttlMs<60000||ttlMs>7*24*3600_000)throw Error('Invalid recipient or expiry');
   const token=randomBytes(32).toString('base64url');
   await store.create({tokenHash:digest(token),recipientId,expiresAt:clock()+ttlMs});
   return {token,expiresAt:clock()+ttlMs};
  },
  async activate({token,recipientCredential,deviceCredential}){
   if(typeof token!=='string'||!/^[-_A-Za-z0-9]{43}$/.test(token))return {allowed:false,reason:'invalid-invite'};
   const recipientId=await verifyRecipient(recipientCredential);
   const deviceId=await verifyDevice(deviceCredential);
   if(!recipientId||!deviceId)return {allowed:false,reason:'identity-required'};
   const tokenHash=digest(token);const record=await store.getByHash(tokenHash);
   if(!record||record.recipientId!==recipientId||record.expiresAt<=clock())return {allowed:false,reason:'invalid-or-expired'};
   // Atomic conditional claim: only one device can claim the invite.
   const claimed=await store.claim({tokenHash,recipientId,deviceId,now:clock()});
   return claimed?{allowed:true}:{allowed:false,reason:'already-activated'};
  },
  async canPlay({recipientCredential,deviceCredential}){
   const recipientId=await verifyRecipient(recipientCredential),deviceId=await verifyDevice(deviceCredential);
   if(!recipientId||!deviceId)return false;
   const grant=await store.getGrant({recipientId,deviceId});
   return !!grant&&grant.revoked!==true;
  },
  async revoke({adminCredential,recipientId}){
   if(await verifyAdmin(adminCredential)!==true)throw Error('Admin authentication required');
   return store.revoke({recipientId,now:clock()});
  }
 });
}
// In-memory test adapter. Never use for live grants on an ephemeral server.
export function createMemoryInviteStore(){
 const invites=new Map(),grants=new Map();
 return {
  async create(record){if(invites.has(record.tokenHash))throw Error('Duplicate');invites.set(record.tokenHash,{...record,claimed:false});},
  async getByHash(hash){const r=invites.get(hash);return r?{...r}:null;},
  async claim({tokenHash,recipientId,deviceId,now}){const r=invites.get(tokenHash);if(!r||r.claimed||r.recipientId!==recipientId||r.expiresAt<=now)return false;r.claimed=true;grants.set(recipientId,{deviceId,revoked:false});return true;},
  async getGrant({recipientId,deviceId}){const g=grants.get(recipientId);return g?.deviceId===deviceId?{...g}:null;},
  async revoke({recipientId}){const g=grants.get(recipientId);if(!g)return false;g.revoked=true;return true;}
 };
}
