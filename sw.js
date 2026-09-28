'use strict';

// V71 root-scope retirement worker.
// The current application owns only /v9/. Existing V8 root registrations and
// caches are removed so they cannot control or evict the V9 service-worker cache.
self.addEventListener('install',event=>{
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith('ai-tutor-v8-')).map(key=>caches.delete(key)));
    await self.registration.unregister();
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of clients){
      try{client.postMessage({type:'study119-root-sw-retired'})}catch{}
    }
  })());
});
