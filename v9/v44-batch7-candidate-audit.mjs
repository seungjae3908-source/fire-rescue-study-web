await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V44_BATCH7_RUNTIME_UNAVAILABLE');

const targetIds=['E08-C04','E08-C05','E09-C07','E09-C08','E15-C02','E19-C05','E20-C05'];
const result={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id);
  const p=V.contentPacks?.get?.(id);
  const qs=V.questions.filter(q=>q.conceptId===id);
  const verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==2)throw new Error('V44_BATCH7_VERIFIED_COUNT '+id+' '+verified.length);
  const ranges=(c?.sourceRanges||[]).filter(r=>r?.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
  if(!ranges.length)throw new Error('V44_BATCH7_NO_NUMERIC_SOURCE_RANGE '+id);
  result[id]={
    title:c?.title||'',
    source:p?.source||'',
    sourceRanges:ranges,
    summary:p?.summary||'',
    must:p?.must||[],
    detail:p?.detail||[],
    verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,choices:q.choices,source:q.source,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''})),
    practice:qs.filter(q=>q.grade==='P').map(q=>({
      id:q.id,a:q.a,q:q.q,choices:q.choices,choiceExplanations:q.choiceExplanations,
      source:q.source,difficulty:q.difficulty,type:q.type,
      generatedPractice:q.generatedPractice===true,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''
    }))
  };
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
if(totalVerified!==690)throw new Error('V44_BATCH7_BASE_TOTAL_VERIFIED '+totalVerified);
if(under3!==40)throw new Error('V44_BATCH7_BASE_UNDER3 '+under3);
if(concentrated.length!==0)throw new Error('V44_BATCH7_BASE_CONCENTRATION '+JSON.stringify(concentrated));
console.log('V44_BATCH7_CANDIDATES',JSON.stringify({targetIds,totalVerified,under3,concentrated,result},null,2));
console.log('V44_BATCH7_CANDIDATE_AUDIT_COMPLETE');
