import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','quality4-highyield-119.js','study-emphasis-119.js',
  'quality2-study-schema-119.js','questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js','question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9;
const highYield=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈|심장|중독|산과|소아|START|CBRN/;
const rows=(V.curriculum.concepts||[]).filter(c=>highYield.test(c.title)).map(c=>{
  const s=V.Quality2StudySchema119?.get?.(c.id)||{},qs=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const verified=(V.questions||[]).filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')).length;
  return{
    id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,
    conditions:s.conditions?.length||0,
    mechanisms:s.mechanisms?.length||0,
    timing:s.timingStages?.length||0,
    warnings:s.warningSigns?.length||0,
    beforeAfter:s.beforeAfter?.length||0,
    numbers:s.numbers?.length||0,
    comparison:s.comparison?.length||0,
    exceptions:s.exceptions?.length||0,
    visuals:s.visuals?.length||0,
    calculations:s.calculations?.length||0,
    examStyle:qs.length,
    verified
  };
});
console.log('HIGH_YIELD_SEMANTIC_PROFILE_SUMMARY',JSON.stringify({version:'119-highyield-semantic-profile-v1',total:rows.length,fire:rows.filter(x=>x.subject==='fire').length,ems:rows.filter(x=>x.subject==='ems').length},null,2));
console.log('HIGH_YIELD_SEMANTIC_PROFILE_ROWS');console.table(rows);
console.log('HIGH_YIELD_SEMANTIC_PROFILE_AUDIT_COMPLETE');
