await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V40_BATCH4_RUNTIME_UNAVAILABLE');

const promotedExpected={
  'F06-C02':'119-factory-f06-c02-detail-a',
  'E03-C02':'119-factory-e03-c02-detail-a',
  'E06-C03':'119-factory-e06-c03-detail-a',
  'E06-C04':'119-factory-e06-c04-summary',
  'E09-C06':'119-factory-e09-c06-detail-b'
};
const expectedCounts={'F06-C02':4,'E03-C02':3,'E06-C03':3,'E06-C04':3,'E09-C06':3};
const blockers={'E11-C02':3,'E09-C07':2};
const result={promoted:{},blockers:{}};

for(const[id,qid]of Object.entries(promotedExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B'),q=qs.find(x=>x.id===qid);
  if(verified.length!==expectedCounts[id])throw new Error('V40_BATCH4_VERIFIED_COUNT '+id+' '+verified.length);
  if(!q||q.grade!=='B'||q.generatedPractice!==false||q.pageVerified!==true||q.reviewStatus!=='source-reviewed'||q.pastExamClaim===true)throw new Error('V40_BATCH4_PROMOTION_CONTRACT '+id);
  if(new Set(verified.map(x=>x.a)).size<2)throw new Error('V40_BATCH4_ANSWER_POSITION_CONCENTRATED '+id);
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id);
  result.promoted[id]={title:c?.title||'',promoted:q.id,verified:verified.map(x=>({id:x.id,a:x.a,q:x.q,source:x.source})),source:p?.source||'',sourceRanges:c?.sourceRanges||[]};
}
for(const[id,count]of Object.entries(blockers)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==count)throw new Error('V40_BATCH4_BLOCKER_COUNT '+id+' '+verified.length);
  result.blockers[id]={verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,source:q.source})),practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,source:q.source}))};
}
if(result.blockers['E11-C02'].practice.length!==0)throw new Error('V40_BATCH4_E11_UNEXPECTED_PRACTICE');
console.log('V40_BATCH4_PROMOTION_SUMMARY',JSON.stringify(result,null,2));
console.log('V40_BATCH4_PROMOTION_AUDIT_COMPLETE');
