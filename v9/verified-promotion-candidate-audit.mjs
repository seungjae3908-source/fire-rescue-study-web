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
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','study-emphasis-119.js','quality2-study-schema-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js',
  'questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js',
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js',
  'questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js',
  'questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js',
  'textbook-grounded-119.js','visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9,Q=V.QuestionQuality119;
if(!Q?.isExamStyle)throw new Error('QUESTION_QUALITY_RUNTIME_UNAVAILABLE');

const badPractice=/복원|연습용|공식문제지\s*미확보|KOCW|reconstructed|practice-only/i;
const externalOfficial=/가이드라인|KOSHA|사이언스올|질병관리청|국가건강정보|E-GEN|법령|법제처|대한/i;
const exactTextbook=/2026\s+(?:소방전술1(?:\(화재[12]\))?|소방전술3\(구급\)|예방실무[12])(?:\s+PDF)?[^\n]*?\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const policyLockedId=/^(?:119-calc-|119-q2calc-|119-calc3-|119-law-|119-specialcomb-|119-(?:cbrn|pals)-\d|119-finalgap-|119-pals-adv-|119-fireterm-|p-f)/;

function exactPageP(q){
  if(q.grade!=='P'||q.generatedPractice===true||q.pastExamClaim===true||!Q.isExamStyle(q))return null;
  const source=norm(q.source);
  if(!exactTextbook.test(source)||badPractice.test(source))return null;
  const tier=externalOfficial.test(source)?'mixed-official':'textbook-only';
  return{id:q.id,subject:q.subject,scopeId:q.scopeId,conceptId:q.conceptId,difficulty:q.difficulty,type:q.type,source,tier,policyLocked:policyLockedId.test(q.id||'')};
}

const exactPageRows=(V.questions||[]).map(exactPageP).filter(Boolean);
const policyLocked=exactPageRows.filter(x=>x.policyLocked);
const reviewable=exactPageRows.filter(x=>!x.policyLocked);
const textbookOnly=reviewable.filter(x=>x.tier==='textbook-only');
const mixedOfficial=reviewable.filter(x=>x.tier==='mixed-official');
const verified=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B');
const target={fire:250,ems:300};
const current={fire:verified.filter(q=>q.subject==='fire').length,ems:verified.filter(q=>q.subject==='ems').length};
const gap={fire:Math.max(0,target.fire-current.fire),ems:Math.max(0,target.ems-current.ems)};
const countBy=(arr,key)=>arr.reduce((a,x)=>(a[x[key]]=(a[x[key]]||0)+1,a),{});
const conceptRows=Object.entries(countBy(reviewable,'conceptId')).map(([conceptId,n])=>({conceptId,n,title:V.curriculum.byId?.[conceptId]?.title||'',verified:verified.filter(q=>q.conceptId===conceptId).length})).sort((a,b)=>b.n-a.n||a.verified-b.verified||a.conceptId.localeCompare(b.conceptId));
const reviewableBySubject=countBy(reviewable,'subject'),lockedBySubject=countBy(policyLocked,'subject');

const result={
  version:'119-verified-promotion-candidate-audit-v2',
  policy:'REPORT_ONLY. Exact-page P is split into policy-locked practice and human-review candidates. Nothing is promoted automatically.',
  currentVerified:current,target,gap,
  exactPageP:{total:exactPageRows.length,bySubject:countBy(exactPageRows,'subject')},
  policyLocked:{total:policyLocked.length,bySubject:lockedBySubject},
  reviewable:{total:reviewable.length,bySubject:reviewableBySubject},
  reviewableTextbookOnly:{total:textbookOnly.length,bySubject:countBy(textbookOnly,'subject')},
  reviewableMixedOfficial:{total:mixedOfficial.length,bySubject:countBy(mixedOfficial,'subject')},
  potentialAfterAllReviewable:{
    fire:current.fire+(reviewableBySubject.fire||0),
    ems:current.ems+(reviewableBySubject.ems||0)
  },
  remainingIfAllReviewablePass:{
    fire:Math.max(0,target.fire-(current.fire+(reviewableBySubject.fire||0))),
    ems:Math.max(0,target.ems-(current.ems+(reviewableBySubject.ems||0)))
  }
};
console.log('VERIFIED_PROMOTION_CANDIDATE_SUMMARY',JSON.stringify(result,null,2));
console.log('VERIFIED_PROMOTION_REVIEWABLE_BY_CONCEPT');console.table(conceptRows);
console.log('VERIFIED_PROMOTION_REVIEWABLE');console.table(reviewable);
console.log('VERIFIED_PROMOTION_POLICY_LOCKED');console.table(policyLocked);
console.log('VERIFIED_PROMOTION_CANDIDATE_AUDIT_COMPLETE');
