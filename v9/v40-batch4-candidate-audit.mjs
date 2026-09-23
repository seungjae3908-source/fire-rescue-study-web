await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V40_BATCH4_RUNTIME_UNAVAILABLE');
const targetIds=['E11-C02','F06-C02','E03-C02','E06-C03','E06-C04','E09-C06','E09-C07'];
const baseline={'E11-C02':3,'F06-C02':3,'E03-C02':2,'E06-C03':2,'E06-C04':2,'E09-C06':2,'E09-C07':2};
const byConcept={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id),qs=V.questions.filter(q=>q.conceptId===id);
  const verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==baseline[id])throw new Error('V40_BATCH4_BASELINE_VERIFIED '+id+' '+verified.length);
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
console.log('V40_BATCH4_CANDIDATES',JSON.stringify({targetIds,baseline,byConcept},null,2));
console.log('V40_BATCH4_CANDIDATE_AUDIT_COMPLETE');
