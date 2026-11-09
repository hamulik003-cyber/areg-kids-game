import {randomUUID} from 'node:crypto';
import {requestAccess,decideAccess,revokeAccess,isAllowed} from './access-core.mjs';
// Prototype state machine only. Not connected to public routes or live games.
// Production requires persistent DB transactions and verified identity / owner sessions.
export function createRequestStore({clock=Date.now}={}){
  const records=new Map();
  return Object.freeze({
    submitVerified(identityId){
      const now=clock();
      const request=requestAccess({id:randomUUID(),identityId,now});
      records.set(request.id,request);
      return request;
    },
    listForOwner({ownerAuthenticated}){
      if(ownerAuthenticated!==true)throw new Error('Owner authentication required');
      return [...records.values()].map(r=>({...r}));
    },
    decide(id,{action,ownerAuthenticated}){
      const current=records.get(id);
      const updated=decideAccess(current,{action,ownerAuthenticated,now:clock()});
      records.set(id,updated);
      return updated;
    },
    revoke(id,{ownerAuthenticated}){
      const updated=revokeAccess(records.get(id),{ownerAuthenticated,now:clock()});
      records.set(id,updated);
      return updated;
    },
    mayPlay(id,{identityId}){return isAllowed(records.get(id),{identityId,now:clock()});}
  });
}
