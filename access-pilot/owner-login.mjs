import {createOtpChallenge,verifyOtpChallenge,OTP_TTL_MS} from './owner-otp.mjs';
// Isolated service logic: caller MUST supply persistent transactional storage,
// server-side configured owner email, authenticated email provider and rate limits.
// Never expose OTPs in API responses or logs.
export function createOwnerLogin({ownerEmail,secret,store,sendEmail,clock=Date.now}){
  if(typeof ownerEmail!=='string'||!ownerEmail.includes('@'))throw new TypeError('Owner email not configured');
  if(!store||typeof store.get!=='function'||typeof store.set!=='function')throw new TypeError('Storage required');
  if(typeof sendEmail!=='function')throw new TypeError('Email provider required');
  const owner=ownerEmail.trim().toLowerCase();
  return Object.freeze({
    async requestCode(email){
      // Do not reveal whether an address belongs to the owner.
      if(typeof email!=='string'||email.trim().toLowerCase()!==owner)return {accepted:true};
      const now=clock();const current=await store.get(owner);
      if(current&&now<current.nextSendAt)return {accepted:true};
      const {code,challenge}=createOtpChallenge({ownerId:owner,now,secret});
      // Store pending challenge before sending; failures invalidate it.
      await store.set(owner,{challenge,nextSendAt:now+60_000});
      try{await sendEmail({to:owner,subject:'AREG մուտքի հաստատման կոդ',text:`AREG հաստատման կոդը՝ ${code}. Վավեր է 5 րոպե։`});}
      catch{await store.set(owner,null);throw new Error('Email delivery failed');}
      return {accepted:true};
    },
    async verifyCode({email,code}){
      if(typeof email!=='string'||email.trim().toLowerCase()!==owner)return false;
      const current=await store.get(owner);if(!current)return false;
      const result=verifyOtpChallenge(current.challenge,{ownerId:owner,code,now:clock(),secret});
      await store.set(owner,{...current,challenge:result.challenge});
      return result.verified;
    }
  });
}
