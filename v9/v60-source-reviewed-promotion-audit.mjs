import fs from 'node:fs';
import vm from 'node:vm';

await import('./question-contract-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.SourceReviewedPromotionV60||!V?.QuestionQuality119)throw Error('V60_PROMOTION_RUNTIME_UNAVAILABLE');

const P=V.SourceReviewedPromotionV60,Q=V.QuestionQuality119;
const promoted=(V.questions||[]).filter(q=>q.v60Promoted===true),issues=[];
const exact=/2026\s+(?:소방전술1(?:\(화재[12]\))?|소방전술3\(구급\)|예방실무[12]|소방법령\d?)(?:\s+PDF)?[^\n]*?\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const assert=(v,type,extra={})=>{if(!v)issues.push({type,...extra});else console.log('PASS',type)};

assert(promoted.length>=200,'V60 promotes at least 200 rigorously source-bound items',{n:promoted.length});
assert(P.promoted.fire>=80&&P.promoted.ems>=120,'V60 promotion breadth covers both subjects',P.promoted);
assert(promoted.every(q=>q.grade==='B'&&q.generatedPractice===false&&q.pageVerified===true&&q.realMockCredit===true&&q.practiceMockCredit===true),'all V60 promotions have verified B truth flags');
assert(promoted.every(q=>q.reviewStatus==='source-rule-reviewed-v60'&&q.promotionMethod==='verified-pack-exact-page-direct-identification-v1'),'all promotions disclose deterministic review method');
assert(promoted.every(q=>exact.test(String(q.source||''))),'all promotions carry exact 2026 textbook page evidence');
assert(promoted.every(q=>/-identify-/.test(q.id||'')&&/^다음 설명에 해당하는 개념은\?/.test(q.q||'')),'only direct-identification items are promoted');
assert(promoted.every(q=>V.curriculum.byId[q.conceptId]?.title===q.choices?.[q.a]),'promoted correct answer remains the bound concept title');
assert(promoted.every(q=>Array.isArray(q.choiceExplanations)&&q.choiceExplanations.length===4&&q.choiceExplanations.every(x=>String(x||'').trim().length>=12)),'promoted choices keep four meaningful explanations');
assert(promoted.every(q=>new Set((q.choices||[]).map(x=>String(x).trim())).size===4),'promoted choices remain unique');

const unreviewedV58=(V.questions||[]).filter(q=>q.generatedBy==='119-v58-precision-expansion'&&!q.v60Promoted);
assert(unreviewedV58.every(q=>q.grade==='P'&&q.generatedPractice===true&&q.realMockCredit===false),'all unreviewed V58 items remain practice-only');

const verified=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B'),bySubject={fire:verified.filter(q=>q.subject==='fire').length,ems:verified.filter(q=>q.subject==='ems').length};
assert(verified.length>=850,'verified pool grows materially beyond pre-V60 baseline',{verified:verified.length,bySubject});
assert(bySubject.fire>=350&&bySubject.ems>=450,'verified pool grows across fire and EMS',{bySubject});

const ans=[0,0,0,0],diff={low:0,mid:0,high:0};for(const q of promoted){ans[q.a]++;diff[q.difficulty]=(diff[q.difficulty]||0)+1}
const shares=ans.map(n=>n/Math.max(1,promoted.length));
assert(shares.every(x=>x>=.16&&x<=.34),'promoted answer positions stay balanced',{ans,shares});
assert(['low','mid','high'].every(k=>(diff[k]||0)>=10),'promoted set retains all difficulty bands',{diff});

vm.runInThisContext(fs.readFileSync(new URL('./question-variant-engine-119.js',import.meta.url),'utf8'),{filename:'question-variant-engine-119.js'});
vm.runInThisContext(fs.readFileSync(new URL('./mock-exam-quality-119.js',import.meta.url),'utf8'),{filename:'mock-exam-quality-119.js'});
let promotedSelections=0,unreviewedLeak=0,weak=0,history=[];
for(let i=1;i<=120;i++){
  const seed=V.VariantEngine119.seedFor('v60-audit','real','mid',i),qs=V.MockExam119.build({mode:'real',level:'mid',history,seed});
  if(qs.length!==65)issues.push({type:'REAL_SIZE',i,n:qs.length});
  promotedSelections+=qs.filter(q=>q.v60Promoted).length;
  unreviewedLeak+=qs.filter(q=>q.generatedBy==='119-v58-precision-expansion'&&!q.v60Promoted).length;
  weak+=qs.filter(q=>!V.MockExam119.strong(q)).length;
  history.push({questionIds:qs.map(q=>q.id),familyIds:qs.map(q=>V.VariantEngine119.familyId(q))});
}
assert(promotedSelections>0,'source-reviewed V60 questions actually participate in real mocks',{promotedSelections});
assert(unreviewedLeak===0,'unreviewed V58 practice items never enter real mocks',{unreviewedLeak});
assert(weak===0,'real mocks remain entirely strong after V60 expansion',{weak});

const summary={
 version:'119-v60-source-reviewed-promotion-audit-v1',
 available:P.available,
 promoted:P.promoted,
 verified:verified.length,
 verifiedBySubject:bySubject,
 answerPosition:ans,
 difficulty:diff,
 realMockSimulations:120,
 realMockV60Selections:promotedSelections,
 unreviewedV58RealLeak:unreviewedLeak,
 issues:issues.length
};
console.log('V60_SOURCE_REVIEWED_PROMOTION_SUMMARY',JSON.stringify(summary,null,2));
if(issues.length){console.error('V60_SOURCE_REVIEWED_PROMOTION_ISSUES',JSON.stringify(issues.slice(0,50),null,2));throw Error('V60_SOURCE_REVIEWED_PROMOTION_FAILED '+JSON.stringify({issues:issues.length,first:issues[0]}))}
console.log('V60_SOURCE_REVIEWED_PROMOTION_SUCCESS');
