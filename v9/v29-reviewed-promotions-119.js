'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const reviewed={
  'E03-C03':'detail-b',
  'E04-C01':'detail-a',
  'E04-C02':'detail-b',
  'E06-C02':'detail-a',
  'E10-C05':'detail-b',
  'E22-C02':'detail-b',
  'F04-C03':'detail-a'
};
const promoted=[];
for(const[conceptId,kind]of Object.entries(reviewed)){
  const id=`119-factory-${conceptId.toLowerCase()}-${kind}`,q=V.questionById?.[id];
  if(!q)throw new Error('V29_PROMOTION_MISSING '+conceptId);
  q.grade='B';q.generatedPractice=false;q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
  promoted.push(id)
}
if(V.QuestionFactory119?.generated>=promoted.length)V.QuestionFactory119.generated-=promoted.length;
V.questionById=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));
V.questionsForConcept=id=>(V.questions||[]).filter(q=>q.conceptId===id);
V.V29ReviewedPromotions119={version:'119-v29-reviewed-promotions-v1',promoted};
})();
