// Transport-agnostic notification delivery; does NOT grant game access.
// Adapter must be a real provider; never silently claim a push was delivered.
export async function notifyOwnerOfRequest({requestId,subscription,sendPush}) {
  if(typeof requestId!=='string'||!requestId)throw new TypeError('Request ID required');
  if(!subscription||typeof subscription.endpoint!=='string'||!subscription.endpoint.startsWith('https://'))throw new TypeError('Valid HTTPS subscription required');
  if(typeof sendPush!=='function')throw new TypeError('Push transport not configured');
  try {
    const response=await sendPush(subscription,JSON.stringify({type:'access-request'}));
    if(!response||response.ok!==true)return {sent:false,reason:'provider-rejected'};
    return {sent:true};
  } catch {
    return {sent:false,reason:'provider-unavailable'};
  }
}
export function pushReadiness({httpsOrigin,installedPwa,permission,hasSubscription,backendConfigured}) {
  const missing=[];
  if(!httpsOrigin)missing.push('https');
  if(!installedPwa)missing.push('installed-ios-pwa');
  if(permission!=='granted')missing.push('notification-permission');
  if(!hasSubscription)missing.push('push-subscription');
  if(!backendConfigured)missing.push('push-backend');
  return {ready:missing.length===0,missing};
}
