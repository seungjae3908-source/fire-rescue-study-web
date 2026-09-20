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
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','study-emphasis-119.js',
  'quality2-study-schema-119.js','questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js','question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9;
const highYield=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/;
const hazmatIds=new Set(['F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']);
const sprinklerIds=new Set(['F07-C16','F07-C17','F07-C18','F07-C19','F07-C20','F07-C21']);
const criticalFacilityIds=new Set(['F07-C03','F07-C08','F07-C11','F07-C15']);

const hasTitle=(pack,re)=>(pack?.deepSections||[]).some(x=>re.test(String(x?.title||'')));
const issue=(missing,key,ok)=>{if(!ok)missing.push(key)};
const rows=[];
for(const c of V.curriculum.concepts){
  const pack=V.contentPacks?.authored?.[c.id],schema=V.Quality2StudySchema119?.get?.(c.id),questions=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const missing=[];
  issue(missing,'verified-pack',pack?.status==='verified');
  issue(missing,'quick30',!!schema?.quick30);
  issue(missing,'definition',!!schema?.definition);
  issue(missing,'easy',!!schema?.easy);
  issue(missing,'features>=3',(schema?.features?.length||0)>=3);
  issue(missing,'core>=3',(schema?.core?.length||0)>=3);
  issue(missing,'source-anchor',(schema?.sourceRanges?.length||0)>=1);
  issue(missing,highYield.test(c.title)?'questions>=20':'questions>=12',questions.length>=(highYield.test(c.title)?20:12));

  if(c.id==='F03-C09'){
    issue(missing,'flashover-mechanism',(schema?.mechanisms?.length||0)>=2);
    issue(missing,'flashover-timing',(schema?.timingStages?.length||0)>=1);
    issue(missing,'flashover-warning',(schema?.warningSigns?.length||0)>=2);
    issue(missing,'flashover-before-after',(schema?.beforeAfter?.length||0)>=2);
    issue(missing,'flashover-numbers',(schema?.numbers?.length||0)>=2);
    issue(missing,'flashover-comparison',(schema?.comparison?.length||0)>=4);
  }

  if(hazmatIds.has(c.id)){
    issue(missing,'hazmat-properties',hasTitle(pack,/공통성질|성질/));
    issue(missing,'hazmat-storage',hasTitle(pack,/저장.?취급|저장|취급/));
    issue(missing,'hazmat-extinguishing',hasTitle(pack,/소화방법|소화/));
    issue(missing,'hazmat-exam-link',hasTitle(pack,/시험 연결|시험/));
    issue(missing,'hazmat-number',(schema?.numbers?.length||0)>=1);
    issue(missing,'hazmat-exception',(schema?.exceptions?.length||0)>=1);
    issue(missing,'hazmat-comparison',(schema?.comparison?.length||0)>=2);
  }

  if(c.id==='F07-C08'){
    issue(missing,'foam-mechanism',(schema?.mechanisms?.length||0)>=2);
    issue(missing,'foam-numbers',(schema?.numbers?.length||0)>=3);
    issue(missing,'foam-comparison',(schema?.comparison?.length||0)>=4);
    issue(missing,'foam-traps',(schema?.exceptions?.length||0)>=2);
  }

  if(sprinklerIds.has(c.id)){
    issue(missing,'sprinkler-mechanism',(schema?.mechanisms?.length||0)>=1);
    issue(missing,'sprinkler-comparison',(schema?.comparison?.length||0)>=2);
    issue(missing,'sprinkler-trap',(schema?.exceptions?.length||0)>=1);
  }

  if(criticalFacilityIds.has(c.id)){
    issue(missing,'facility-mechanism',(schema?.mechanisms?.length||0)>=1);
    issue(missing,'facility-comparison',(schema?.comparison?.length||0)>=2);
  }

  rows.push({id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,questions:questions.length,missing});
}

const backlog=rows.filter(x=>x.missing.length);
const summary={
  version:'119-coverage3-semantic-v1',
  total:rows.length,
  ready:rows.length-backlog.length,
  missing:backlog.length,
  highYield:rows.filter(x=>highYield.test(x.title)).length,
  semanticFamilies:{
    flashover:1,
    hazmat:hazmatIds.size,
    foamProportioner:1,
    sprinkler:sprinklerIds.size,
    criticalFacilities:criticalFacilityIds.size
  }
};
console.log('COVERAGE3_SEMANTIC_SUMMARY',JSON.stringify(summary,null,2));
console.log('COVERAGE3_SEMANTIC_BACKLOG',JSON.stringify(backlog,null,2));
if(backlog.length)throw new Error('COVERAGE3_SEMANTIC_FAILED '+JSON.stringify({missing:backlog.length}));
console.log('COVERAGE3_SEMANTIC_COMPLETE');
