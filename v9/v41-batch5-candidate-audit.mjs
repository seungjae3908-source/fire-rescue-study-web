await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V41_BATCH5_RUNTIME_UNAVAILABLE');

const targetIds=['E02-C02','E07-C03','E15-C01','E16-C03','E17-C01','E19-C01','E22-C01'];
const result={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id);
  const p=V.contentPacks?.get?.(id);
  const qs=V.questions.filter(q=>q.conceptId===id);
  const verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==2)throw new Error('V41_BATCH5_VERIFIED_COUNT '+id+' '+verified.length);
  const ranges=(c?.sourceRanges||[]).filter(r=>r?.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
  if(!ranges.length)throw new Error('V41_BATCH5_NO_NUMERIC_SOURCE_RANGE '+id);
  result[id]={
    title:c?.title||'',
    source:p?.source||'',
    sourceRanges:ranges,
    summary:p?.summary||'',
    must:p?.must||[],
    detail:p?.detail||[],
    verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,source:q.source,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''})),
    practice:qs.filter(q=>q.grade==='P').map(q=>({
      id:q.id,a:q.a,q:q.q,choices:q.choices,choiceExplanations:q.choiceExplanations,
      source:q.source,difficulty:q.difficulty,type:q.type,
      generatedPractice:q.generatedPractice===true,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''
    }))
  };
}
const conceptRows=V.curriculum.concepts.map(c=>({id:c.id,verified:V.questions.filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')).length}));
const under3=conceptRows.filter(x=>x.verified<3).length;
const totalVerified=V.questions.filter(q=>q.grade==='A'||q.grade==='B').length;
if(totalVerified!==677)throw new Error('V41_BATCH5_BASE_TOTAL_VERIFIED '+totalVerified);
if(under3!==53)throw new Error('V41_BATCH5_BASE_UNDER3 '+under3);
console.log('V41_BATCH5_CANDIDATES',JSON.stringify({targetIds,totalVerified,under3,result},null,2));
console.log('V41_BATCH5_CANDIDATE_AUDIT_COMPLETE');
