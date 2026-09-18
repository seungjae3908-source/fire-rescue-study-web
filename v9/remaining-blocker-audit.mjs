import fs from 'node:fs';import vm from 'node:vm';
globalThis.window={AITUTOR_V9:{}};
const files=[
'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','master-syllabus-119.js',
'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-hazmat-depth-119.js',
'questions-facilities-depth-119.js','questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js',
'question-difficulty.js','question-quality-119.js','depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js',
'fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js','investigation-depth-119.js','investigation-visuals-119.js',
'facilities-depth-119.js','facilities-visuals-119.js','hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js',
'suppression-depth-119.js','suppression-visuals-119.js','ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js',
'question-bank-119.js','textbook-grounded-119.js','content-contract-119.js'];
for(const f of files)vm.runInThisContext(fs.readFileSync(new URL('./'+f,import.meta.url),'utf8'),{filename:f});
const V=window.AITUTOR_V9,a=V.ContentContract119.audit(),by={};
for(const r of a.rows)for(const m of r.missing)(by[m]||(by[m]=[])).push({id:r.id,title:r.title,scopeId:r.scopeId,subject:r.subject,score:r.score});
for(const [k,v] of Object.entries(by)){console.log('BLOCKER_DETAIL '+k+' '+JSON.stringify(v))}
console.log('BLOCKER_DETAIL_COMPLETE');
