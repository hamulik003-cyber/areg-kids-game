import {createRequestStore} from './request-store.mjs';
import {notifyOwnerOfRequest} from './push-delivery.mjs';

// Isolated integration layer; NOT connected to public HTTP routes or gameplay.
// Caller must verify the visitor identity and owner session independently.
export function createApprovalCoordinator({verifyVisitor,verifyOwner,getOwnerSubscription,sendPush,clock=Date.now}){
  if([verifyVisitor,verifyOwner,getOwnerSubscription,sendPush].some(fn=>typeof fn!=='function'))throw new TypeError('Verified identity, owner session and push adapters required');
  const requests=createRequestStore({clock});
  return Object.freeze({
    async submit({visitorCredential}){
      const identityId=await verifyVisitor(visitorCredential);
      if(typeof identityId!=='string'||!identityId)throw new Error('Verified visitor required');
      const request=requests.submitVerified(identityId);
      let notification={sent:false,reason:'subscription-unavailable'};
      try{
        const subscription=await getOwnerSubscription();
        if(subscription)notification=await notifyOwnerOfRequest({requestId:request.id,subscription,sendPush});
      }catch{notification={sent:false,reason:'notification-error'};}
      return {requestId:request.id,status:request.status,notificationSent:notification.sent};
    },
    async list({ownerCredential}){
      if(await verifyOwner(ownerCredential)!==true)throw new Error('Owner authentication required');
      return requests.listForOwner({ownerAuthenticated:true});
    },
    async decide({ownerCredential,requestId,action}){
      if(await verifyOwner(ownerCredential)!==true)throw new Error('Owner authentication required');
      return requests.decide(requestId,{action,ownerAuthenticated:true});
    },
    async revoke({ownerCredential,requestId}){
      if(await verifyOwner(ownerCredential)!==true)throw new Error('Owner authentication required');
      return requests.revoke(requestId,{ownerAuthenticated:true});
    },
    async mayPlay({visitorCredential,requestId}){
      const identityId=await verifyVisitor(visitorCredential);
      if(typeof identityId!=='string'||!identityId)return false;
      return requests.mayPlay(requestId,{identityId});
    }
  });
}
