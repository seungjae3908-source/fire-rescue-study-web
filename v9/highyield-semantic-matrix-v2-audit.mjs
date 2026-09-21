import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js',
  'study-emphasis-119.js','concept-architecture-119.js','quality2-study-schema-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js',
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9;
const highYield=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/;
const ids=V.curriculum.concepts.filter(c=>highYield.test(c.title)).map(c=>c.id);
const semanticFields=['conditions','mechanisms','timingStages','warningSigns','beforeAfter','numbers','comparison','visuals','calculations'];
const countDimensions=s=>semanticFields.filter(k=>(s?.[k]?.length||0)>0).length;
const any=(s,keys)=>keys.some(k=>(s?.[k]?.length||0)>0);
const need=(missing,key,ok)=>{if(!ok)missing.push(key)};

const rows=ids.map(id=>{
  const c=V.curriculum.byId[id],p=V.contentPacks.authored[id],s=V.Quality2StudySchema119.get(id),arch=V.ConceptArchitecture119.get(id),qs=V.QuestionQuality119.forConcept(id),missing=[];
  const officialWeb=(p?.officialLinks||[]).some(x=>/^https:\/\/([a-z0-9-]+\.)*go\.kr\//i.test(String(x?.url||'')));
  const dims=countDimensions(s);

  need(missing,'verified-pack',p?.status==='verified');
  need(missing,'source-anchor',(s?.sourceRanges?.length||0)>0||officialWeb);
  need(missing,'questions>=20',qs.length>=20);
  need(missing,'core>=3',(s?.core?.length||0)>=3);
  need(missing,'features>=3',(s?.features?.length||0)>=3);
  need(missing,'semantic-dimensions>=3',dims>=3);

  if(c.subject==='fire'&&c.scopeId==='F03'){
    need(missing,'phenomenon-mechanism',(s?.mechanisms?.length||0)>=1);
    need(missing,'phenomenon-comparison',(s?.comparison?.length||0)>=2);
    need(missing,'phenomenon-timing-or-warning',any(s,['timingStages','warningSigns','beforeAfter']));
  }
  if(c.subject==='fire'&&c.scopeId==='F05'){
    need(missing,'hazmat-comparison',(s?.comparison?.length||0)>=2);
    need(missing,'hazmat-exception',(s?.exceptions?.length||0)>=1);
    need(missing,'hazmat-number-or-mechanism',any(s,['numbers','mechanisms']));
  }
  if(c.subject==='fire'&&c.scopeId==='F07'){
    need(missing,'facility-mechanism',(s?.mechanisms?.length||0)>=1);
    need(missing,'facility-comparison',(s?.comparison?.length||0)>=2);
    need(missing,'facility-visual',(s?.visuals?.length||0)>=1);
    need(missing,'facility-exception',(s?.exceptions?.length||0)>=1);
  }
  if(c.subject==='ems'){
    need(missing,'ems-clinical-signal',any(s,['warningSigns','conditions','numbers']));
    need(missing,'ems-process-or-mechanism',any(s,['mechanisms','timingStages','beforeAfter']));
    if(c.scopeId==='E24')need(missing,'resuscitation-number',(s?.numbers?.length||0)>=1);
    if(['E07','E09','E21'].includes(c.scopeId))need(missing,'airway-mechanism-or-condition',any(s,['mechanisms','conditions']));
    if(['E13','E14','E17'].includes(c.scopeId))need(missing,'clinical-warning',(s?.warningSigns?.length||0)>=1);
  }

  return{id,title:c.title,subject:c.subject,scopeId:c.scopeId,type:arch?.type||'',questions:qs.length,dimensions:dims,missing};
});

const backlog=rows.filter(x=>x.missing.length);
const byScope={};
for(const r of rows){const x=byScope[r.scopeId]||(byScope[r.scopeId]={total:0,ready:0,missing:0});x.total++;if(r.missing.length)x.missing++;else x.ready++}
const summary={version:'119-highyield-semantic-matrix-v2',total:rows.length,ready:rows.length-backlog.length,missing:backlog.length,byScope};
console.log('HIGHYIELD_SEMANTIC_MATRIX_V2_SUMMARY',JSON.stringify(summary,null,2));
console.log('HIGHYIELD_SEMANTIC_MATRIX_V2_BACKLOG',JSON.stringify(backlog,null,2));
if(backlog.length)throw new Error('HIGHYIELD_SEMANTIC_MATRIX_V2_FAILED '+JSON.stringify({missing:backlog.length,ids:backlog.map(x=>x.id)}));
console.log('HIGHYIELD_SEMANTIC_MATRIX_V2_COMPLETE');
