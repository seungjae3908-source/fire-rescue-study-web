'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.QuestionQuality119?.isExamStyle)return;
const IDS=["119-fireterm-01","119-fireterm-02","119-fireterm-03","119-fireterm-04","119-fireterm-05","119-fireterm-06","119-fireterm-07","119-fireterm-08","119-fireterm-09","119-fireterm-10","119-fireterm-11","119-fireterm-12","119-fireterm-13","119-fireterm-14","119-fireterm-15","119-fireterm-16","119-fireterm-17","119-fireterm-18","119-fireterm-19","119-fireterm-20","119-fireterm-21","119-fireterm-22","119-fireterm-23","119-fireterm-24","119-fireterm-25","119-fireterm-26","119-fireterm-27","119-fireterm-28","119-fireterm-29","119-fireterm-30","119-fireterm-31","119-fireterm-32","119-fireterm-33","119-fireterm-34","119-fireterm-35","119-fireterm-36","119-fireterm-37","119-fireterm-38","119-fireterm-39","119-fireterm-40","119-fireterm-41","119-fireterm-42","119-fireterm-43","119-fireterm-44","119-fireterm-45","119-fireterm-46","119-fireterm-47","119-fireterm-48","119-fireterm-49","119-fireterm-52","119-fireterm-57","119-fireterm-58","119-fireterm-65","119-fireterm-69"];
const exact=/2026\s+소방전술1(?:\(화재[12]\))?[^\n]*?\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const forbidden=/KACPR|KOSHA|사이언스올|질병관리청|국가건강정보|E-GEN|법령|법제처|119법|현행|소방청\s*공식|공식\s*구급\s*교육문제|복원|연습용|미확보|KOCW/i;
const promoted=[];
for(const id of IDS){
  const q=(V.questions||[]).find(x=>x.id===id);
  if(!q)throw Error('VERIFIED_PROMOTION_FIRE1_MISSING '+id);
  if(q.grade!=='P')throw Error('VERIFIED_PROMOTION_FIRE1_EXPECTED_P '+id+' got='+q.grade);
  if(q.generatedPractice===true)throw Error('VERIFIED_PROMOTION_FIRE1_GENERATED '+id);
  if(!V.QuestionQuality119.isExamStyle(q))throw Error('VERIFIED_PROMOTION_FIRE1_NOT_EXAM_STYLE '+id);
  if(!exact.test(String(q.source||''))||forbidden.test(String(q.source||'')))throw Error('VERIFIED_PROMOTION_FIRE1_SOURCE '+id+' :: '+q.source);
  if(q.pastExamClaim===true)throw Error('VERIFIED_PROMOTION_FIRE1_PAST_EXAM '+id);
  q.grade='B';
  q.pageVerified=true;
  q.reviewStatus='manual-reviewed';
  q.pastExamClaim=false;
  q.promotedFromGrade='P';
  q.promotionBasis='2026-NFA-exact-page-manual-review';
  promoted.push(id);
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedPromotionFire1119={
  version:'119-verified-promotion-fire1-v1',
  planned:IDS.length,
  added:promoted.length,
  ids:promoted,
  previousGrade:'P',
  grade:'B',
  pageVerified:true,
  reviewStatus:'manual-reviewed',
  pastExamClaim:false
};
})();