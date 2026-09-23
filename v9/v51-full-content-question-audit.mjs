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
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js','v29-reviewed-promotions-119.js','questions-official-past-2025-119.js','source-catalog-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9,Q=V.QuestionQuality119;
if(!V?.curriculum?.concepts||!V?.contentPacks||!Q?.isExamStyle||!V?.ConceptArchitecture119||!V?.SourceCatalog119)throw new Error('V51_RUNTIME_UNAVAILABLE');

const compact=s=>String(s||'').replace(/\s+/g,' ').trim();
const key=s=>compact(s).toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const chars=s=>String(s||'').replace(/\s+/g,'').length;
const officialUrl=/^https:\/\//i;
const pageSource=/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const sourceFraming=/(?:20\d{2}\s*)?(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+|소방법령\s*\d+)\s*(?:기준으로|기준에서|에\s*따르면|에서는?)/i;
const processExpected=/단계|절차|처치|평가|소생술|분만|이동|조사|작동|사용|확보|흡인|산소 치료|제세동|심장충격|가슴압박|제거|대응|복구|예방|대비|긴급구조|화재 진행|현장 확인|재평가|제독|부목|헬멧|경보|소화전|제연|연결송수/;
const principleExpected=/연소|화재|폭발|소화|스프링클러|감지|경보|기도|호흡|심장|쇼크|출혈|화상|중독|알레르기|질환|복통|경련|뇌졸중|당뇨|익수|열 손상|한랭|감염|패혈증|제독|Flow Path|BLEVE|가스계|분말|포소화/;
const numberExpected=/위험물|스프링클러|소화전|포소화|열량|비열|산소 치료|수액|화상|심폐소생술|가슴압박|제세동|AED|분만|소아|중증도|START|소화용수|감지기|심장충격|지정수량|계산/;
const compareExpected=/정상·비정상|분류|종류|정의·류별|화재현상|스프링클러|소화약제|출혈|쇼크|중독|알레르기|화재의 개념·유형|심장질환|호흡곤란|소아|노인|장비|해부·생리|해부와 생리/;

const issues=[],rows=[];
for(const c of V.curriculum.concepts){
  const p=V.contentPacks.get(c.id),schema=V.Quality2StudySchema119?.get?.(c.id)||{},arch=V.ConceptArchitecture119.get(c.id),verified=(V.questions||[]).filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')),exam=Q.forConcept(c.id),ranges=c.sourceRanges||[],links=(p?.officialLinks||[]).filter(x=>officialUrl.test(String(x?.url||'')));
  const text=[p?.summary,...(p?.detail||[]),...(p?.deepSections||[]).flatMap(x=>[x?.title,x?.body,...(x?.bullets||[])]),...(p?.must||[]),...(p?.traps||[]),...(p?.compare||[]).flat()].filter(Boolean).join(' ');
  const local=[];
  if(!p)local.push('pack');
  if(chars(p?.summary)<20)local.push('summary');
  if(chars(text)<1000)local.push('depth<1000');
  if((p?.must||[]).length<3)local.push('must<3');
  if((p?.traps||[]).length<2)local.push('traps<2');
  if((p?.deepSections||[]).length<5)local.push('sections<5');
  if(exam.length<6)local.push('exam<6');
  if(verified.length<2)local.push('verified<2');
  if(!ranges.length&&!links.length)local.push('official-source');
  if(!arch)local.push('architecture');
  const compareLabels=(p?.compare||[]).map(r=>key(r?.[0])).filter(Boolean);
  if(compareLabels.length!==new Set(compareLabels).size)local.push('duplicate-compare-label');
  for(const r of ranges){
    if(!r?.doc||!V.SourceCatalog119.get(r.doc))local.push('unknown-doc:'+String(r?.doc||''));
    if(!Number.isFinite(Number(r?.from))||!Number.isFinite(Number(r?.to))||Number(r.from)<1||Number(r.to)<Number(r.from))local.push('invalid-range:'+JSON.stringify(r));
  }
  if(processExpected.test(c.title)&&!((schema.timingStages?.length||0)+(schema.beforeAfter?.length||0)||(schema.mechanisms?.length||0)>=2))local.push('process');
  if(principleExpected.test(c.title)&&!(schema.mechanisms?.length||0))local.push('principle');
  if(numberExpected.test(c.title)&&!(schema.numbers?.length||0))local.push('numbers');
  if(compareExpected.test(c.title)&&(schema.comparison?.length||0)<2)local.push('comparison');
  const answerKinds=new Set(verified.map(q=>q.a)).size;
  if(verified.length>=2&&answerKinds<2)local.push('verified-answer-position-pattern');
  for(const q of verified){
    if(!Q.isExamStyle(q))local.push('verified-not-exam-style:'+q.id);
    if(!pageSource.test(String(q.source||''))&&!/https:\/\/|법률|시행령|시행규칙|고시|소방청|출제범위/i.test(String(q.source||'')))local.push('verified-source:'+q.id);
    if(compact(q.ex)!==compact(q.choiceExplanations?.[q.a]))local.push('explanation-drift:'+q.id);
    if(sourceFraming.test(String(q.q||'')))local.push('source-framed-stem:'+q.id);
  }
  if(local.length){issues.push({id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,issues:[...new Set(local)]})}
  rows.push({id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,chars:chars(text),sections:(p?.deepSections||[]).length,must:(p?.must||[]).length,traps:(p?.traps||[]).length,compare:(p?.compare||[]).length,numbers:schema.numbers?.length||0,exam:exam.length,verified:verified.length,answerKinds,ranges:ranges.length,officialLinks:links.length,type:arch?.type||''});
}
const under3=rows.filter(x=>x.verified<3).sort((a,b)=>a.verified-b.verified||a.id.localeCompare(b.id));
const under4=rows.filter(x=>x.verified<4).sort((a,b)=>a.verified-b.verified||a.id.localeCompare(b.id));
const thin=rows.slice().sort((a,b)=>a.chars-b.chars||a.id.localeCompare(b.id)).slice(0,30);
const summary={
  version:'119-v51-full-content-question-audit-v1',
  concepts:rows.length,
  fire:rows.filter(x=>x.subject==='fire').length,
  ems:rows.filter(x=>x.subject==='ems').length,
  issues:issues.length,
  verifiedUnder3:under3.length,
  verifiedUnder4:under4.length,
  v51AnswerDiversityChanged:V.V51AnswerDiversity119?.changed?.length||0,
  minChars:Math.min(...rows.map(x=>x.chars)),
  minExam:Math.min(...rows.map(x=>x.exam)),
  minVerified:Math.min(...rows.map(x=>x.verified))
};
console.log('V51_FULL_AUDIT_SUMMARY',JSON.stringify(summary,null,2));
console.log('V51_FULL_AUDIT_ISSUES');console.table(issues);
console.log('V51_VERIFIED_UNDER_THREE');console.table(under3);
console.log('V51_VERIFIED_UNDER_FOUR');console.table(under4);
console.log('V51_THINNEST_30');console.table(thin);
console.log('V51_ANSWER_DIVERSITY_CHANGES');console.table(V.V51AnswerDiversity119?.changed||[]);

if(rows.length!==183||summary.fire!==71||summary.ems!==112)throw new Error('V51_CURRICULUM_COUNT '+JSON.stringify(summary));
if(issues.length)throw new Error('V51_FULL_AUDIT_FAILED '+JSON.stringify(issues.slice(0,40)));
if((V.V51AnswerDiversity119?.changed||[]).length<1)throw new Error('V51_ANSWER_DIVERSITY_FIX_NOT_EXERCISED');
console.log('V51_FULL_CONTENT_QUESTION_AUDIT_COMPLETE');
