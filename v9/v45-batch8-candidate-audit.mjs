await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V45_BATCH8_RUNTIME_UNAVAILABLE');

const promotedExpected={
  'E21-C06':'119-q2factory-e21-c06-title-1',
  'E21-C07':'119-q2factory-e21-c07-title-2',
  'E21-C08':'119-q2factory-e21-c08-title-1',
  'E23-C01':'119-q2factory-e23-c01-title-3',
  'E23-C03':'119-q2factory-e23-c03-title-2'
};
const blockerExpected={'E21-C02':2,'E21-C05':2};
const result={promoted:{},blockers:{}};

for(const[id,qid]of Object.entries(promotedExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B'),q=qs.find(x=>x.id===qid);
  if(verified.length<3)throw new Error('V45_BATCH8_VERIFIED_COUNT_REGRESSION '+id+' '+verified.length+' expected_at_least 3');
  if(!q||q.grade!=='B'||q.generatedPractice!==false||q.pageVerified!==true||q.reviewStatus!=='source-reviewed'||q.pastExamClaim===true)throw new Error('V45_BATCH8_PROMOTION_CONTRACT '+id);
  const pos=[0,0,0,0];for(const x of verified)pos[x.a]=(pos[x.a]||0)+1;
  const kinds=pos.filter(Boolean).length,max=Math.max(...pos)/verified.length;
  if(kinds<2||max>=0.8)throw new Error('V45_BATCH8_ANSWER_POSITION_CONCENTRATED '+id+' '+JSON.stringify(pos));
  const concept=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),pack=V.contentPacks?.get?.(id);
  result.promoted[id]={title:concept?.title||'',promoted:q.id,verified:verified.map(x=>({id:x.id,a:x.a,q:x.q,source:x.source})),source:pack?.source||'',sourceRanges:concept?.sourceRanges||[]};
}
const promotedIds=new Set(V.V29ReviewedPromotions119?.promoted||[]);
for(const[id,count]of Object.entries(blockerExpected)){
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==count)throw new Error('V45_BATCH8_BLOCKER_COUNT '+id+' '+verified.length);
  if(qs.some(q=>promotedIds.has(q.id)))throw new Error('V45_BATCH8_BLOCKER_WAS_PROMOTED '+id);
  result.blockers[id]={verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,source:q.source})),practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,source:q.source})),sourceRanges:(V.curriculum.byId?.[id]||{}).sourceRanges||[]};
}

const rows=V.curriculum.concepts.map(c=>{const verified=V.questions.filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')),pos=[0,0,0,0];for(const q of verified)pos[q.a]=(pos[q.a]||0)+1;return{id:c.id,verified:verified.length,kinds:pos.filter(Boolean).length,max:verified.length?Math.max(...pos)/verified.length:0}});
const totalVerified=V.questions.filter(q=>q.grade==='A'||q.grade==='B').length;
const under3=rows.filter(x=>x.verified<3).length;
const under4=rows.filter(x=>x.verified<4).length;
const concentrated=rows.filter(x=>x.verified>=3&&(x.kinds<2||x.max>=0.8));
if(totalVerified<701)throw new Error('V45_BATCH8_TOTAL_VERIFIED_REGRESSION '+totalVerified);
if(under3>29)throw new Error('V45_BATCH8_UNDER3_REGRESSION '+under3);
if(under4>122)throw new Error('V45_BATCH8_UNDER4_REGRESSION '+under4);
if(concentrated.length!==0)throw new Error('V45_BATCH8_CONCENTRATION '+JSON.stringify(concentrated));
result.summary={totalVerified,under3,under4,concentrated};
console.log('V45_BATCH8_PROMOTION_SUMMARY',JSON.stringify(result,null,2));
console.log('V45_BATCH8_PROMOTION_AUDIT_COMPLETE');
