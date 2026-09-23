import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','question-type-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','quality4-highyield-119.js','v50-visible-detail-coverage-119.js',
  'study-emphasis-119.js','concept-architecture-119.js','quality2-study-schema-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js',
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js','questions-verified-v52-fire-breadth-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js','v29-reviewed-promotions-119.js','questions-official-past-2025-119.js','source-catalog-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
const V=window.AITUTOR_V9;
const targets=['F01-C05','F02-C02','F07-C01','F07-C02','F07-C03','F07-C04','F07-C07','F07-C09','F07-C10','F07-C11','F07-C12','F07-C13','F07-C14','F07-C15'];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const pageSource=/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const sourceFraming=/(?:20\d{2}\s*)?(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+|소방법령\s*\d+)\s*(?:기준으로|기준에서|에\s*따르면|에서는?)/i;
const manifest=(V.questions||[]).filter(q=>String(q.id||'').startsWith('119-v52-firebreadth-'));
const bad=[];
if(V.VerifiedV52FireBreadth119?.added!==14)bad.push({type:'MANIFEST_COUNT',value:V.VerifiedV52FireBreadth119?.added});
if(manifest.length!==14)bad.push({type:'QUESTION_COUNT',value:manifest.length});
for(const q of manifest){
  if(q.grade!=='B'||q.pageVerified!==true||q.reviewStatus!=='source-reviewed'||q.pastExamClaim!==false)bad.push({id:q.id,type:'TRUTH_FLAGS'});
  if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)bad.push({id:q.id,type:'CHOICES'});
  if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))bad.push({id:q.id,type:'EXPLANATIONS'});
  if(q.ex!==q.choiceExplanations?.[q.a])bad.push({id:q.id,type:'EXPLANATION_DRIFT'});
  if(!pageSource.test(String(q.source||''))&&!/재난 및 안전관리 기본법/.test(String(q.source||'')))bad.push({id:q.id,type:'SOURCE'});
  if(sourceFraming.test(String(q.q||'')))bad.push({id:q.id,type:'SOURCE_FRAMED_STEM'});
  if(q.pastExamClaim)bad.push({id:q.id,type:'PAST_EXAM_CLAIM'});
}
const rows=(V.curriculum?.concepts||[]).map(c=>{
  const verified=(V.questions||[]).filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B'));
  return{id:c.id,title:c.title,subject:c.subject,verified:verified.length,answerKinds:new Set(verified.map(q=>q.a)).size};
});
const targetRows=rows.filter(x=>targets.includes(x.id));
for(const r of targetRows)if(r.verified<3)bad.push({id:r.id,type:'TARGET_UNDER3',verified:r.verified});
const under3=rows.filter(x=>x.verified<3);
const newIds=new Set(manifest.map(q=>q.id));
const dupTexts=new Set(),seen=new Set();
for(const q of V.questions||[]){const t=norm(q.q);if(seen.has(t)&&newIds.has(q.id))dupTexts.add(q.id);seen.add(t)}
if(dupTexts.size)bad.push({type:'DUP_TEXT',ids:[...dupTexts]});
const summary={
  version:'119-v52-verified-fire-breadth-audit-v1',
  targets:targets.length,
  manifest:manifest.length,
  under3:under3.length,
  under3Ids:under3.map(x=>x.id),
  minVerified:Math.min(...rows.map(x=>x.verified)),
  targetMinVerified:Math.min(...targetRows.map(x=>x.verified)),
  targetAnswerKindsMin:Math.min(...targetRows.map(x=>x.answerKinds)),
  bad:bad.length
};
console.log('V52_VERIFIED_FIRE_BREADTH_SUMMARY',JSON.stringify(summary,null,2));
console.log('V52_TARGET_ROWS');console.table(targetRows);
console.log('V52_REMAINING_UNDER3');console.table(under3);
console.log('V52_BAD');console.table(bad);
if(targetRows.length!==14)throw new Error('V52_TARGET_COUNT '+targetRows.length);
const expectedRemaining=['F03-C01','F03-C04','F03-C16','F04-C02','F04-C07','E07-C03','E09-C07','E21-C02','E21-C05','E25-C01','E25-C02','E25-C03','E25-C04','E25-C05'];
const remainingIds=under3.map(x=>x.id).sort(),expectedIds=[...expectedRemaining].sort();
if(JSON.stringify(remainingIds)!==JSON.stringify(expectedIds))throw new Error('V52_REMAINING_UNDER3_DRIFT '+JSON.stringify(remainingIds));
if(bad.length)throw new Error('V52_VERIFIED_FIRE_BREADTH_FAILED '+JSON.stringify(bad));
console.log('V52_VERIFIED_FIRE_BREADTH_AUDIT_COMPLETE');
