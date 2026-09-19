'use strict';
const CACHE='ai-tutor-v9-shell-20260919-quality3-verified-batch3-39';
const PREFIX='ai-tutor-v9-';
const CORE=[
  './','./index.html','./styles.css','./manifest.webmanifest','./config.js','./curriculum.js','./curriculum-complete-2026.js','./curriculum-fire-depth-119.js','./curriculum-ems-quality2-119.js','./master-syllabus-119.js','./content-packs.js','./questions.js','./verified-expansion.js','./verified-completion.js','./verified-final.js','./questions-scope-2026.js','./questions-fire-depth-119.js','./questions-ems-depth-119.js','./questions-ems-restored-verified-119.js','./questions-hazmat-depth-119.js','./questions-facilities-depth-119.js','./questions-suppression-depth-119.js','./questions-governance-depth-119.js','./questions-investigation-depth-119.js','./questions-restored-fire-verified-119.js','./questions-quality2-119.js','./questions-verified-ems-batch1-119.js','./questions-verified-fire-batch1-119.js','./questions-quality2-gap-119.js','./questions-verified-ems-batch2-119.js','./questions-verified-ems-batch3-119.js','./questions-verified-fire-batch2-119.js','./question-difficulty.js','./question-quality-119.js','./content-contract-119.js','./depth-enrichment.js','./depth-enrichment-2.js','./content-rich-2026.js','./fire-depth-119.js','./fire-visuals-119.js','./governance-depth-119.js','./governance-visuals-119.js','./investigation-depth-119.js','./investigation-visuals-119.js','./facilities-depth-119.js','./quality2-content-119.js','./facilities-visuals-119.js','./hazmat-reference-2026.js','./hazmat-depth-119.js','./hazmat-visuals-119.js','./suppression-depth-119.js','./suppression-visuals-119.js','./ems-rich-2026.js','./ems-depth-119.js','./ems-visuals-119.js','./exam-gap-enrichment-119.js','./quality2-official-gap-content-119.js','./quality2-ems-medical-content-119.js','./quality2-fire-admin-content-119.js','./quality2-global-content-119.js','./quality2-comparison-families-119.js','./quality2-study-schema-119.js','./questions-calculation-119.js','./questions-calculation-quality2-119.js','./calculation-training-v3-119.js','./questions-law-119.js','./questions-special-combustible-119.js','./questions-ems-gap-practice-119.js','./questions-final-gap-119.js','./questions-pals-advanced-119.js','./questions-fire-terminology-119.js','./question-bank-119.js','./question-bank-quality2-119.js','./textbook-grounded-119.js','./visual-completion-119.js','./calculation-contract-119.js','./coverage-map-119.js','./store.js','./mastery.js','./sync-merge.js','./runtime-deps.js','./local-ai.js','./pdf.js','./source-catalog-119.js','./source-pdf.js','./supabase-lite.js','./auth.js','./suggestions.js','./auth-membership-guard.js','./source-compiler.js','./pass-note.js','./app.js','./sync-ui.js','./source-ui.js','./selftest.js'
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
