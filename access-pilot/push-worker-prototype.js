// ISOLATED PWA push proof of concept; not registered by AREG TEST.
// Do not embed approval links, auth tokens, email addresses, or private data in push payloads.
self.addEventListener('push',event=>{
  event.waitUntil(self.registration.showNotification('AREG — խաղալու հարցում',{body:'Նոր թույլտվության հարցում կա',tag:'areg-access-request',icon:'./icon-192.png',data:{path:'./owner-requests.html'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    const target=new URL(event.notification.data?.path||'./owner-requests.html',self.registration.scope);
    if(target.origin!==self.location.origin)return;
    const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const existing=windows.find(c=>new URL(c.url).origin===target.origin&&new URL(c.url).pathname===target.pathname);
    if(existing){await existing.focus();return;}
    await self.clients.openWindow(target.href);
  })());
});
