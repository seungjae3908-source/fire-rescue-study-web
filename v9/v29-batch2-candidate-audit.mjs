await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V29_BATCH2_RUNTIME_UNAVAILABLE');
const targetIds=['F03-C10','F03-C12','F03-C13','F03-C14','E03-C01','E06-C05','E15-C03'];
const byConcept={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id),qs=V.questions.filter(q=>q.conceptId===id);
  const verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==2)throw new Error('V29_BATCH2_BASELINE_VERIFIED '+id+' '+verified.length);
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
console.log('V29_BATCH2_CANDIDATES',JSON.stringify({targetIds,byConcept},null,2));
console.log('V29_BATCH2_CANDIDATE_AUDIT_COMPLETE');
