'use strict';
const CACHE='ai-tutor-v9-shell-20260918-rich-1';
const PREFIX='ai-tutor-v9-';
const CORE=[
  './','./index.html','./styles.css','./manifest.webmanifest','./config.js','./curriculum.js','./curriculum-complete-2026.js','./content-packs.js','./questions.js','./verified-expansion.js','./verified-completion.js','./verified-final.js','./depth-enrichment.js','./depth-enrichment-2.js','./content-rich-2026.js','./store.js','./mastery.js','./sync-merge.js','./pdf.js','./supabase-lite.js','./auth.js','./auth-membership-guard.js','./source-compiler.js','./app.js','./sync-ui.js','./source-ui.js','./selftest.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url),scope=new URL(self.registration.scope);
  if(url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put('./',copy));return r}).catch(()=>caches.match('./').then(r=>r||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>{
    const network=fetch(event.request).then(r=>{if(r&&r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r}).catch(()=>hit);
    return hit||network;
  }));
});
