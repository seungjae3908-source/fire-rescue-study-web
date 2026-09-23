await import('./verified-question-coverage-audit.mjs');

const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.concepts)throw new Error('V29_RUNTIME_UNAVAILABLE');

const targetIds=['E04-C01','E04-C02','E03-C03','E06-C02','E22-C02','F04-C03','E10-C05'];
const pageRe=/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const rows=[];
for(const conceptId of targetIds){
  const c=V.curriculum.byId?.[conceptId]||V.curriculum.concepts.find(x=>x.id===conceptId);
  const qs=V.questions.filter(q=>q.conceptId===conceptId);
  for(const q of qs){
    rows.push({
      conceptId,
      title:c?.title||'',
      id:q.id,
      grade:q.grade||'',
      difficulty:q.difficulty||'',
      type:q.type||'',
      examStyle:q.examStyle===true,
      generatedPractice:q.generatedPractice===true,
      pageVerified:q.pageVerified===true,
      reviewStatus:q.reviewStatus||'',
      pastExamClaim:q.pastExamClaim===true,
      exactPage:pageRe.test(String(q.source||'')),
      source:q.source||'',
      q:q.q||'',
      a:q.a,
      choices:q.choices||[],
      choiceExplanations:q.choiceExplanations||[],
      ex:q.ex||''
    });
  }
}
const byConcept=Object.fromEntries(targetIds.map(id=>[
  id,
  rows.filter(x=>x.conceptId===id).map(x=>({
    id:x.id,grade:x.grade,difficulty:x.difficulty,type:x.type,examStyle:x.examStyle,
    generatedPractice:x.generatedPractice,pageVerified:x.pageVerified,reviewStatus:x.reviewStatus,
    pastExamClaim:x.pastExamClaim,exactPage:x.exactPage,source:x.source,q:x.q,a:x.a,
    choices:x.choices,choiceExplanations:x.choiceExplanations,ex:x.ex
  }))
]));
console.log('V29_VERIFIED_BREADTH_CANDIDATES',JSON.stringify({targetIds,byConcept},null,2));

const expected={
  'E03-C03':'119-factory-e03-c03-detail-b',
  'E04-C01':'119-factory-e04-c01-detail-a',
  'E04-C02':'119-factory-e04-c02-detail-b',
  'E06-C02':'119-factory-e06-c02-detail-a',
  'E10-C05':'119-factory-e10-c05-detail-b',
  'E22-C02':'119-factory-e22-c02-detail-b',
  'F04-C03':'119-factory-f04-c03-detail-a'
};
for(const id of targetIds){
  const qs=rows.filter(x=>x.conceptId===id),verified=qs.filter(x=>x.grade==='A'||x.grade==='B');
  if(verified.length<3)throw new Error('V29_VERIFIED_COUNT _REGRESSION '+id+' '+verified.length+' expected_at_least 3');
  const q=qs.find(x=>x.id===expected[id]);
  if(!q||q.grade!=='B'||q.generatedPractice||!q.pageVerified||q.reviewStatus!=='source-reviewed'||q.pastExamClaim)throw new Error('V29_PROMOTION_CONTRACT '+id);
}
console.log('V29_VERIFIED_BREADTH_CANDIDATE_AUDIT_COMPLETE');
