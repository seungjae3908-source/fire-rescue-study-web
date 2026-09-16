const _makeGroundedQuestionUnsafe=makeGroundedQuestion;
makeGroundedQuestion=function(page,sentence,idx,allPages){
  const q=_makeGroundedQuestionUnsafe(page,sentence,idx,allPages);if(!q)return q;
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);
  if(!doc?.verified){q.grade='D';q.sourceType='personal';q.sourceLabel=`검증대기 로컬 PDF ${page.page}쪽`;q.validated={...(q.validated||{}),officialSource:false};}
  else q.validated={...(q.validated||{}),officialSource:true};
  return q;
};

const _validateAIQuestionUnsafe=validateAIQuestion;
validateAIQuestion=function(item,page,fingerprints){
  const q=_validateAIQuestionUnsafe(item,page,fingerprints);if(!q)return q;
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);
  if(!doc?.verified){q.sourceLabel=`C AI예상 · 검증대기 로컬 PDF ${page.page}쪽`;q.validated={...(q.validated||{}),officialSource:false};}
  else q.validated={...(q.validated||{}),officialSource:true};
  return q;
};
