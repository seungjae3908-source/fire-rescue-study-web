await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V40_BATCH4_RUNTIME_UNAVAILABLE');

const promotedExpected={
  'F06-C02':'119-factory-f06-c02-detail-a',
  'E03-C02':'119-factory-e03-c02-detail-a',
  'E06-C03':'119-factory-e06-c03-detail-a',
  'E06-C04':'119-factory-e06-c04-summary',
  'E09-C06':'119-factory-e09-c06-detail-b',
  'E01-C02':'119-q2factory-e01-c02-title-1',
  'E02-C01':'119-q2factory-e02-c01-title-1',
  'E07-C04':'119-factory-e07-c04-summary'
};
const expectedCounts={'F06-C02':4,'E03-C02':3,'E06-C03':3,'E06-C04':3,'E09-C06':3,'E01-C02':3,'E02-C01':3,'E07-C04':3};
const blockers={'E11-C02':3,'E09-C07':2};
const reviewCandidates=[];
const result={promoted:{},blockers:{},reviewCandidates:{}};

for(const[id,qid]of Object.entries(promotedExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B'),q=qs.find(x=>x.id===qid);
  if(verified.length<expectedCounts[id])throw new Error('V40_BATCH4_VERIFIED_COUNT_REGRESSION '+id+' '+verified.length+' expected_at_least '+expectedCounts[id]);
  if(!q||q.grade!=='B'||q.generatedPractice!==false||q.pageVerified!==true||q.reviewStatus!=='source-reviewed'||q.pastExamClaim===true)throw new Error('V40_BATCH4_PROMOTION_CONTRACT '+id);
  if(new Set(verified.map(x=>x.a)).size<2)throw new Error('V40_BATCH4_ANSWER_POSITION_CONCENTRATED '+id);
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id);
  result.promoted[id]={title:c?.title||'',promoted:q.id,verified:verified.map(x=>({id:x.id,a:x.a,q:x.q,source:x.source})),source:p?.source||'',sourceRanges:c?.sourceRanges||[]};
}
for(const[id,count]of Object.entries(blockers)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length<count)throw new Error('V40_BATCH4_BLOCKER_COUNT_REGRESSION '+id+' '+verified.length+' expected_at_least '+count);
  result.blockers[id]={verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,source:q.source})),practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,source:q.source}))};
}
for(const id of reviewCandidates){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id),qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==2)throw new Error('V40_BATCH4_REVIEW_CANDIDATE_COUNT '+id+' '+verified.length);
  result.reviewCandidates[id]={title:c?.title||'',source:p?.source||'',sourceRanges:c?.sourceRanges||[],detail:p?.detail||[],practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,choices:q.choices,source:q.source,generatedPractice:q.generatedPractice===true}))};
}
const promotedIds=new Set(V.V29ReviewedPromotions119?.promoted||[]);
for(const id of Object.keys(blockers)){
  const qs=V.questions.filter(q=>q.conceptId===id);
  if(qs.some(q=>promotedIds.has(q.id)))throw new Error('V40_BATCH4_BLOCKER_WAS_PROMOTED '+id);
}
// V40 is a historical regression gate. Later verified-pool expansions (for example V60)
// are validated by their own audits and must not rewrite V40's frozen distribution baseline.
const v40Verified=q=>(q.grade==='A'||q.grade==='B')&&q.v60Promoted!==true;
const conceptRows=V.curriculum.concepts.map(c=>{
  const verified=V.questions.filter(q=>q.conceptId===c.id&&v40Verified(q)),pos=[0,0,0,0];
  for(const q of verified)pos[q.a]=(pos[q.a]||0)+1;
  const kinds=pos.filter(Boolean).length,max=verified.length?Math.max(...pos)/verified.length:0;
  return{id:c.id,verified:verified.length,answerPositionKinds:kinds,maxAnswerShare:max};
});
const under3=conceptRows.filter(x=>x.verified<3).length;
const concentrated=conceptRows.filter(x=>x.verified>=3&&(x.answerPositionKinds<2||x.maxAnswerShare>=0.8));
const totalVerified=V.questions.filter(v40Verified).length;
if(totalVerified<677)throw new Error('V40_BATCH4_TOTAL_VERIFIED_REGRESSION '+totalVerified);
if(under3>53)throw new Error('V40_BATCH4_UNDER3_REGRESSION '+under3);
if(concentrated.length!==0)throw new Error('V40_BATCH4_CONCENTRATION '+JSON.stringify(concentrated));
result.summary={totalVerified,under3,concentrated};
console.log('V40_BATCH4_PROMOTION_SUMMARY',JSON.stringify(result,null,2));
console.log('V40_BATCH4_PROMOTION_AUDIT_COMPLETE');
