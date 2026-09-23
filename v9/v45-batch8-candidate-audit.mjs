await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V45_BATCH8_RUNTIME_UNAVAILABLE');
const targetIds=['E21-C02','E21-C05','E21-C06','E21-C07','E21-C08','E23-C01','E23-C03'];
const result={};
for(const id of targetIds){
  const c=V.curriculum.byId?.[id]||V.curriculum.concepts.find(x=>x.id===id),p=V.contentPacks?.get?.(id);
  const qs=V.questions.filter(q=>q.conceptId===id),verified=qs.filter(q=>q.grade==='A'||q.grade==='B');
  if(verified.length!==2)throw new Error('V45_BATCH8_VERIFIED_COUNT '+id+' '+verified.length);
  const ranges=(c?.sourceRanges||[]).filter(r=>r?.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
  if(!ranges.length)throw new Error('V45_BATCH8_NO_NUMERIC_SOURCE_RANGE '+id);
  result[id]={title:c?.title||'',source:p?.source||'',sourceRanges:ranges,summary:p?.summary||'',must:p?.must||[],detail:p?.detail||[],
    verified:verified.map(q=>({id:q.id,a:q.a,q:q.q,choices:q.choices,source:q.source,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''})),
    practice:qs.filter(q=>q.grade==='P').map(q=>({id:q.id,a:q.a,q:q.q,choices:q.choices,choiceExplanations:q.choiceExplanations,source:q.source,difficulty:q.difficulty,type:q.type,generatedPractice:q.generatedPractice===true,pageVerified:q.pageVerified===true,reviewStatus:q.reviewStatus||''}))};
}
const rows=V.curriculum.concepts.map(c=>{const verified=V.questions.filter(q=>q.conceptId===c.id&&(q.grade==='A'||q.grade==='B')),pos=[0,0,0,0];for(const q of verified)pos[q.a]=(pos[q.a]||0)+1;return{id:c.id,verified:verified.length,kinds:pos.filter(Boolean).length,max:verified.length?Math.max(...pos)/verified.length:0}});
const totalVerified=V.questions.filter(q=>q.grade==='A'||q.grade==='B').length,under3=rows.filter(x=>x.verified<3).length,concentrated=rows.filter(x=>x.verified>=3&&(x.kinds<2||x.max>=0.8));
if(totalVerified!==696)throw new Error('V45_BATCH8_BASE_TOTAL_VERIFIED '+totalVerified);
if(under3!==34)throw new Error('V45_BATCH8_BASE_UNDER3 '+under3);
if(concentrated.length!==0)throw new Error('V45_BATCH8_BASE_CONCENTRATION '+JSON.stringify(concentrated));
console.log('V45_BATCH8_CANDIDATES',JSON.stringify({targetIds,totalVerified,under3,concentrated,result},null,2));
console.log('V45_BATCH8_CANDIDATE_AUDIT_COMPLETE');
