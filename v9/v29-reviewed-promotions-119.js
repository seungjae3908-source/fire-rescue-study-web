'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const reviewedFactory={
  'E03-C03':'detail-b',
  'E04-C01':'detail-a',
  'E04-C02':'detail-b',
  'E06-C02':'detail-a',
  'E10-C05':'detail-b',
  'E22-C02':'detail-b',
  'F04-C03':'detail-a',
  'F03-C10':'detail-a',
  'F03-C12':'detail-a',
  'F03-C13':'detail-a',
  'F03-C14':'detail-a',
  'E03-C01':'detail-a',
  'E06-C05':'detail-a',
  'E15-C03':'detail-a',
  'E05-C02':'detail-a',
  'E05-C03':'detail-b',
  'E06-C01':'detail-b',
  'E08-C06':'detail-b',
  'E20-C02':'summary',
  'F06-C02':'detail-a',
  'E03-C02':'detail-a',
  'E06-C03':'detail-a',
  'E06-C04':'summary',
  'E09-C06':'detail-b',
  'E07-C04':'summary',
  'E02-C02':'deep',
  'E15-C01':'detail-b',
  'E16-C03':'detail-a',
  'E17-C01':'detail-b'
};
const reviewedExact={
  'E03-C04':'119-q2factory-e03-c04-title-4',
  'E05-C04':'119-q2factory-e05-c04-title-0',
  'E01-C02':'119-q2factory-e01-c02-title-1',
  'E02-C01':'119-q2factory-e02-c01-title-1',
  'E19-C01':'119-q2factory-e19-c01-title-1',
  'E22-C01':'119-q2factory-e22-c01-title-3'
};
const promoted=[];let factoryPromoted=0;
const promote=(conceptId,id,isFactory)=>{
  const q=V.questionById?.[id];
  if(!q)throw new Error('V29_PROMOTION_MISSING '+conceptId+' '+id);
  if(q.conceptId!==conceptId)throw new Error('V29_PROMOTION_CONCEPT_MISMATCH '+conceptId+' '+id);
  q.grade='B';q.generatedPractice=false;q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
  promoted.push(id);if(isFactory)factoryPromoted++
};
for(const[conceptId,kind]of Object.entries(reviewedFactory))promote(conceptId,`119-factory-${conceptId.toLowerCase()}-${kind}`,true);
for(const[conceptId,id]of Object.entries(reviewedExact))promote(conceptId,id,false);
if(V.QuestionFactory119?.generated>=factoryPromoted)V.QuestionFactory119.generated-=factoryPromoted;
const exactPromoted=Object.keys(reviewedExact).length;
if(V.Quality2QuestionFactory119?.added>=exactPromoted)V.Quality2QuestionFactory119.added-=exactPromoted;
V.questionById=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));
V.questionsForConcept=id=>(V.questions||[]).filter(q=>q.conceptId===id);
V.V29ReviewedPromotions119={version:'119-v41-reviewed-promotions-v5',promoted,factoryPromoted,exactPromoted};
})();
