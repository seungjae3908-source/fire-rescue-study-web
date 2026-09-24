await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V41_BATCH5_RUNTIME_UNAVAILABLE');

const promotedExpected={
  'E02-C02':'119-factory-e02-c02-deep',
  'E15-C01':'119-factory-e15-c01-detail-b',
  'E16-C03':'119-factory-e16-c03-detail-a',
  'E17-C01':'119-factory-e17-c01-detail-b',
  'E19-C01':'119-q2factory-e19-c01-title-1',
  'E22-C01':'119-q2factory-e22-c01-title-3'
};
const blockerExpected={'E07-C03':2};
const result={promoted:{},blockers:{}};

for(const[id,qid]of Object.entries(promotedExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B'),q=qs.find(x=>x.id===qid);
  if(verified.length<3)throw new Error('V41_BATCH5_VERIFIED_COUNT_REGRESSION '+id+' '+verified.length+' expected_at_least 3');
  if(!q||q.grade!=='B'||q.generatedPractice!==false||q.pageVerified!==true||q.reviewStatus!=='source-reviewed'||q.pastExamClaim===true)throw new Error('V41_BATCH5_PROMOTION_CONTRACT '+id);
  if(new Set(verified.map(x=>x.a)).size<2)throw new Error('V41_BATCH5_ANSWER_POSITION_CONCENTRATED '+id);
  const concept=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),pack=V.contentPacks?.get?.(id);
  result.promoted[id]={title:concept?.title||'',promoted:q.id,verified:verified.map(x=>({id:x.id,a:x.a,q:x.q,source:x.source})),source:pack?.source||'',sourceRanges:concept?.sourceRanges||[]};
}
const promotedIds=new Set(V.V29ReviewedPromotions119?.promoted||[]);
for(const[id,count]of Object.entries(blockerExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length<count)throw new Error('V41_BATCH5_BLOCKER_COUNT_REGRESSION '+id+' '+verified.length+' expected_at_least '+count);
  if(qs.some(q=>promotedIds.has(q.id)))throw new Error('V41_BATCH5_BLOCKER_WAS_PROMOTED '+id);
  result.blockers[id]={verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,source:q.source})),practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,source:q.source}))};
}
const conceptRows=V.curriculum.concepts.map(c=>{
  const verified=V.questions.filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')),pos=[0,0,0,0];
  for(const q of verified)pos[q.a]=(pos[q.a]||0)+1;
  const kinds=pos.filter(Boolean).length,max=verified.length?Math.max(...pos)/verified.length:0;
  return{id:c.id,verified:verified.length,answerPositionKinds:kinds,maxAnswerShare:max};
});
const totalVerified=V.questions.filter(q=>q.grade==='A'||q.grade==='B').length;
const under3=conceptRows.filter(x=>x.verified<3).length;
const concentrated=conceptRows.filter(x=>x.verified>=3&&(x.answerPositionKinds<2||x.maxAnswerShare>=0.8));
if(totalVerified<683)throw new Error('V41_BATCH5_TOTAL_VERIFIED_REGRESSION '+totalVerified);
if(under3>47)throw new Error('V41_BATCH5_UNDER3_REGRESSION '+under3);
if(concentrated.length!==0)throw new Error('V41_BATCH5_CONCENTRATION '+JSON.stringify(concentrated));
result.summary={totalVerified,under3,concentrated};
console.log('V41_BATCH5_PROMOTION_SUMMARY',JSON.stringify(result,null,2));
console.log('V41_BATCH5_PROMOTION_AUDIT_COMPLETE');
