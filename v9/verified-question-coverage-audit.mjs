import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js','questions-official-past-2025-119.js',
  'question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','study-emphasis-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js',
  'questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js',
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js','textbook-grounded-119.js',
  'visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js','v29-reviewed-promotions-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9;
const verified=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B');
const structuredVerified=verified.filter(q=>Array.isArray(q.choices)&&q.choices.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4&&!!q.source);
const bySubject=subject=>verified.filter(q=>q.subject===subject);
const subjectTotals={fire:bySubject('fire').length,ems:bySubject('ems').length};
const target={fire:250,ems:300};
const highYield=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈|심장|중독|산과|소아|START|CBRN/;

const scopes=V.curriculum.scopes.map(s=>{
  const qs=verified.filter(q=>q.scopeId===s.id);
  return{id:s.id,title:s.title,subject:s.subject,verified:qs.length,concepts:s.concepts.length,perConcept:Number((qs.length/Math.max(1,s.concepts.length)).toFixed(2))};
}).sort((a,b)=>a.verified-b.verified||a.id.localeCompare(b.id));

const concepts=V.curriculum.concepts.map(c=>{
  const qs=verified.filter(q=>q.conceptId===c.id);
  return{id:c.id,title:c.title,scopeId:c.scopeId,subject:c.subject,highYield:highYield.test(c.title),verified:qs.length,A:qs.filter(q=>q.grade==='A').length,B:qs.filter(q=>q.grade==='B').length};
}).sort((a,b)=>a.verified-b.verified||Number(b.highYield)-Number(a.highYield)||a.id.localeCompare(b.id));

const highYieldGaps=concepts.filter(x=>x.highYield&&x.verified<4);
const highYieldUnderThree=concepts.filter(x=>x.highYield&&x.verified<3);
const highYieldUnderTwo=concepts.filter(x=>x.highYield&&x.verified<2);
const highYieldZero=concepts.filter(x=>x.highYield&&x.verified===0);
const zeroVerified=concepts.filter(x=>x.verified===0);
const zeroVerifiedEms=zeroVerified.filter(x=>x.subject==='ems');
const zeroVerifiedFire=zeroVerified.filter(x=>x.subject==='fire');
const zeroVerifiedTarget=0;
const result={
  version:'119-verified-question-coverage-v4',
  subjectTotals,
  structuredVerified:structuredVerified.length,
  target,
  gap:{fire:Math.max(0,target.fire-subjectTotals.fire),ems:Math.max(0,target.ems-subjectTotals.ems)},
  zeroVerifiedConcepts:zeroVerified.length,
  zeroVerifiedBySubject:{fire:zeroVerifiedFire.length,ems:zeroVerifiedEms.length},
  zeroVerifiedTarget,
  highYieldZero:highYieldZero.length,
  highYieldUnderTwo:highYieldUnderTwo.length,
  highYieldUnderThree:highYieldUnderThree.length,
  highYieldUnderFour:highYieldGaps.length
};
console.log('VERIFIED_QUESTION_COVERAGE_SUMMARY',JSON.stringify(result,null,2));
console.log('VERIFIED_QUESTION_COVERAGE_BY_SCOPE');console.table(scopes);
console.log('VERIFIED_QUESTION_COVERAGE_ZERO_CONCEPTS');console.table(zeroVerified);
console.log('VERIFIED_QUESTION_COVERAGE_HIGH_YIELD_ZERO');console.table(highYieldZero);
console.log('VERIFIED_QUESTION_COVERAGE_HIGH_YIELD_UNDER_TWO');console.table(highYieldUnderTwo);
console.log('VERIFIED_QUESTION_COVERAGE_HIGH_YIELD_UNDER_THREE');console.table(highYieldUnderThree);
console.log('VERIFIED_QUESTION_COVERAGE_HIGH_YIELD_GAPS');console.table(highYieldGaps);
console.log('VERIFIED_QUESTION_COVERAGE_LOWEST_80');console.table(concepts.slice(0,80));
if(structuredVerified.length!==verified.length)throw new Error('VERIFIED_QUESTION_STRUCTURE_GAP '+JSON.stringify({verified:verified.length,structured:structuredVerified.length}));
if(subjectTotals.fire<target.fire||subjectTotals.ems<target.ems)throw new Error('VERIFIED_SUBJECT_TARGET_MISSING '+JSON.stringify({subjectTotals,target,gap:result.gap}));
if(zeroVerifiedEms.length)throw new Error('EMS_ZERO_VERIFIED_REMAINS '+JSON.stringify(zeroVerifiedEms.map(x=>({id:x.id,title:x.title}))));
if(zeroVerifiedFire.length)throw new Error('FIRE_ZERO_VERIFIED_REMAINS '+JSON.stringify(zeroVerifiedFire.map(x=>({id:x.id,title:x.title}))));
if(zeroVerified.length)throw new Error('ZERO_VERIFIED_CONCEPT_REMAINS '+JSON.stringify(zeroVerified.map(x=>({id:x.id,title:x.title,subject:x.subject}))));
if(zeroVerified.length>zeroVerifiedTarget)throw new Error('ZERO_VERIFIED_BREADTH_REGRESSION '+JSON.stringify({actual:zeroVerified.length,target:zeroVerifiedTarget,fire:zeroVerifiedFire.length,ems:zeroVerifiedEms.length}));
if(highYieldZero.length)throw new Error('HIGH_YIELD_VERIFIED_ZERO '+JSON.stringify(highYieldZero.map(x=>({id:x.id,title:x.title}))));
if(highYieldUnderTwo.length)throw new Error('HIGH_YIELD_VERIFIED_UNDER_TWO '+JSON.stringify(highYieldUnderTwo.map(x=>({id:x.id,title:x.title,verified:x.verified}))));
if(highYieldUnderThree.length)throw new Error('HIGH_YIELD_VERIFIED_UNDER_THREE '+JSON.stringify(highYieldUnderThree.map(x=>({id:x.id,title:x.title,verified:x.verified}))));
if(highYieldGaps.length)throw new Error('HIGH_YIELD_VERIFIED_UNDER_FOUR '+JSON.stringify(highYieldGaps.map(x=>({id:x.id,title:x.title,verified:x.verified}))));

const underTwo=concepts.filter(x=>x.verified<2);
const breadth3=(V.questions||[]).filter(q=>/^119-v13-breadth3-/.test(q.id||''));
const byId=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));
const pageRe=/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const brokenBreadth3=breadth3.filter(q=>{
  const base=byId[q.evidenceDerivedFrom];
  return q.grade!=='B'
    ||q.pageVerified!==true
    ||q.reviewStatus!=='source-reviewed-derived'
    ||!pageRe.test(String(q.source||''))
    ||!base
    ||!(base.grade==='A'||base.grade==='B')
    ||base.conceptId!==q.conceptId
    ||String(base.source||'')!==String(q.source||'');
});
console.log('VERIFIED_QUESTION_UNDER_TWO');console.table(underTwo);
console.log('VERIFIED_BREADTH3_SUMMARY',JSON.stringify({added:breadth3.length,broken:brokenBreadth3.length,expected:56},null,2));
console.log('VERIFIED_BREADTH3_BROKEN_BINDINGS');console.table(brokenBreadth3.map(q=>({id:q.id,conceptId:q.conceptId,source:q.source,evidenceDerivedFrom:q.evidenceDerivedFrom})));
if(underTwo.length)throw new Error('VERIFIED_CONCEPT_UNDER_TWO '+JSON.stringify(underTwo.map(x=>({id:x.id,title:x.title,verified:x.verified}))));
if(breadth3.length!==56)throw new Error('VERIFIED_BREADTH3_COUNT '+breadth3.length+' expected 56');
if(brokenBreadth3.length)throw new Error('VERIFIED_BREADTH3_BINDING '+JSON.stringify(brokenBreadth3.map(q=>q.id)));

console.log('VERIFIED_QUESTION_COVERAGE_AUDIT_COMPLETE');
