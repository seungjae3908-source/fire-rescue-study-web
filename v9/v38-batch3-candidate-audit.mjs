await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V38_BATCH3_RUNTIME_UNAVAILABLE');
const targetIds=['E03-C04','E05-C02','E05-C03','E05-C04','E06-C01','E08-C06','E20-C02'];
const expected={
  'E03-C04':'119-q2factory-e03-c04-title-4',
  'E05-C02':'119-factory-e05-c02-detail-a',
  'E05-C03':'119-factory-e05-c03-detail-b',
  'E05-C04':'119-q2factory-e05-c04-title-0',
  'E06-C01':'119-factory-e06-c01-detail-b',
  'E08-C06':'119-factory-e08-c06-detail-b',
  'E20-C02':'119-factory-e20-c02-summary'
};
const byConcept={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id),qs=V.questions.filter(q=>q.conceptId===id);
  const verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length<3)throw new Error('V38_BATCH3_VERIFIED_COUNT _REGRESSION '+id+' '+verified.length+' expected_at_least 3');
  const promoted=qs.find(q=>q.id===expected[id]);
  if(!promoted||promoted.grade!=='B'||promoted.generatedPractice!==false||promoted.pageVerified!==true||promoted.reviewStatus!=='source-reviewed'||promoted.pastExamClaim===true)throw new Error('V38_BATCH3_PROMOTION_CONTRACT '+id);
  if(new Set(verified.map(q=>q.a)).size<2)throw new Error('V38_BATCH3_ANSWER_POSITION_STILL_CONCENTRATED '+id);
  byConcept[id]={
    title:c?.title||'',source:p?.source||'',sourceRanges:c?.sourceRanges||[],
    verified:verified.map(q=>({id:q.id,q:q.q,a:q.a,choices:q.choices,source:q.source})),
    practice:qs.filter(q=>q.grade==='P').map(q=>({
      id:q.id,q:q.q,a:q.a,choices:q.choices,choiceExplanations:q.choiceExplanations,
      source:q.source,difficulty:q.difficulty,type:q.type,generatedPractice:q.generatedPractice===true,
      pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''
    }))
  };
}
console.log('V38_BATCH3_CANDIDATES',JSON.stringify({targetIds,byConcept},null,2));
console.log('V38_BATCH3_PROMOTION_AUDIT_COMPLETE');
