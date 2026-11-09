import {randomInt,randomBytes,createHmac,timingSafeEqual} from 'node:crypto';

// Isolated prototype. No email delivery, persistence or routes are implemented here.
export const OTP_TTL_MS=5*60_000;
export const OTP_MAX_ATTEMPTS=5;
export function createOtpChallenge({ownerId,now,secret}) {
  if(typeof ownerId!=='string'||!ownerId||!Number.isSafeInteger(now))throw new TypeError('Invalid owner or clock');
  if(typeof secret!=='string'||Buffer.byteLength(secret)<32)throw new TypeError('Server secret must be at least 32 bytes');
  const code=String(randomInt(0,1_000_000)).padStart(6,'0');
  const nonce=randomBytes(16).toString('hex');
  const digest=otpDigest({ownerId,code,nonce,secret});
  return {code,challenge:Object.freeze({ownerId,nonce,digest,expiresAt:now+OTP_TTL_MS,attempts:0,used:false})};
}
function otpDigest({ownerId,code,nonce,secret}){return createHmac('sha256',secret).update(JSON.stringify([ownerId,nonce,code])).digest('hex');}
export function verifyOtpChallenge(challenge,{ownerId,code,now,secret}){
  if(!challenge||typeof challenge!=='object'||typeof code!=='string'||!Number.isSafeInteger(now))throw new TypeError('Invalid challenge');
  if(typeof secret!=='string'||Buffer.byteLength(secret)<32)throw new TypeError('Invalid server secret');
  if(challenge.used||challenge.attempts>=OTP_MAX_ATTEMPTS||now>=challenge.expiresAt||now<challenge.expiresAt-OTP_TTL_MS||challenge.ownerId!==ownerId)return {verified:false,challenge};
  const expected=Buffer.from(challenge.digest,'hex');
  const actual=Buffer.from(otpDigest({ownerId,code,nonce:challenge.nonce,secret}),'hex');
  const verified=expected.length===actual.length&&timingSafeEqual(expected,actual);
  return {verified,challenge:Object.freeze({...challenge,attempts:challenge.attempts+1,used:verified})};
}
