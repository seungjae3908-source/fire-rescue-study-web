import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js',
  'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-hazmat-depth-119.js',
  'questions-facilities-depth-119.js','questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js',
  'question-difficulty.js','question-quality-119.js',
  'depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js',
  'fire-depth-119.js','fire-visuals-119.js',
  'governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js',
  'facilities-depth-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js',
  'suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','question-bank-119.js','textbook-grounded-119.js','visual-completion-119.js',
  'content-contract-119.js'
];
for(const file of files){
  vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
}
const V=window.AITUTOR_V9;
const audit=V.ContentContract119?.audit?.();
if(!audit||audit.total!==176)throw new Error('CONTENT_CONTRACT_AUDIT_UNAVAILABLE_OR_BAD_DENOMINATOR');

const blockerRows=Object.entries(audit.blockers||{})
  .map(([blocker,count])=>({blocker,count}))
  .sort((a,b)=>b.count-a.count||a.blocker.localeCompare(b.blocker));
const worst=(audit.rows||[])
  .filter(x=>!x.complete)
  .sort((a,b)=>a.score-b.score||a.id.localeCompare(b.id))
  .slice(0,40)
  .map(x=>({
    id:x.id,title:x.title,scopeId:x.scopeId,score:x.score,
    missing:x.missing.join(','),
    q:x.questionMeta?.total||0,
    low:x.questionMeta?.diff?.low||0,mid:x.questionMeta?.diff?.mid||0,high:x.questionMeta?.diff?.high||0
  }));

console.log('CONTENT_CONTRACT_119_SUMMARY',JSON.stringify({
  version:audit.version,total:audit.total,complete:audit.complete,incomplete:audit.incomplete,
  averageScore:audit.averageScore,blockers:audit.blockers
},null,2));
console.log('CONTENT_CONTRACT_119_BLOCKERS');
console.table(blockerRows);
console.log('CONTENT_CONTRACT_119_WORST_40');
console.table(worst);
console.log('CONTENT_CONTRACT_119_AUDIT_COMPLETE');
