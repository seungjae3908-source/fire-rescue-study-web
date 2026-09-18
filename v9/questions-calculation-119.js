'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const Q=[
  {id:'119-calc-haz-01',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'계산형',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'황화린 100kg과 철분 250kg을 함께 저장할 때 지정수량의 배수는?',choices:['0.75배','1.0배','1.5배','2.0배'],a:2,choiceExplanations:['황화린 1배와 철분 0.5배를 합산해야 하므로 0.75배가 아니다.','황화린만 계산하면 1배이지만 철분 0.5배를 추가해야 한다.','정답. 100÷100 + 250÷500 = 1 + 0.5 = 1.5배이다.','각 저장량을 그대로 더하는 방식이 아니므로 2배가 아니다.']},
  {id:'119-calc-haz-02',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'계산형',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'적린 50kg과 마그네슘 250kg을 함께 저장할 때 지정수량의 배수는?',choices:['0.5배','1.0배','1.5배','3.0배'],a:1,choiceExplanations:['적린 또는 마그네슘 하나만 계산하면 0.5배이므로 합산값이 아니다.','정답. 50÷100 + 250÷500 = 0.5 + 0.5 = 1.0배이다.','두 항목을 지정수량으로 나눈 뒤 합산하면 1.5배가 아니다.','저장량의 단순 비율을 더하는 방식이 아니므로 3배가 아니다.']},
  {id:'119-calc-haz-03',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',type:'계산형',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'제1석유류(비수용성) 100L와 알코올류 200L를 함께 저장할 때 지정수량의 배수는?',choices:['0.5배','0.75배','1.0배','1.5배'],a:2,choiceExplanations:['각각 0.5배이므로 한 항목만 본 값이다.','100÷200과 200÷400을 합하면 0.75배가 아니다.','정답. 100÷200 + 200÷400 = 0.5 + 0.5 = 1.0배이다.','각 항목의 지정수량 비율을 합산하면 1.5배가 아니다.']},
  {id:'119-calc-haz-04',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',type:'계산형',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'칼륨 5kg과 황린 10kg을 함께 저장할 때 지정수량의 배수는?',choices:['0.5배','1.0배','1.5배','2.0배'],a:1,choiceExplanations:['칼륨 0.5배만 계산한 값으로 황린을 빠뜨렸다.','정답. 5÷10 + 10÷20 = 0.5 + 0.5 = 1.0배이다.','두 항목의 비율을 정확히 합산하면 1.5배가 아니다.','저장량을 단순히 합산해 지정수량으로 나누면 안 된다.']},
  {id:'119-calc-burn-01',grade:'P',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'mid',type:'계산형',source:'2026 소방전술3(구급) 261쪽',q:'체중 60kg, 2·3도 화상면적 30%인 환자의 Parkland 24시간 수액량은?',choices:['1,800mL','3,600mL','7,200mL','14,400mL'],a:2,choiceExplanations:['0.25mL 병원 전 초기량 공식과 혼동한 값이다.','7,200mL의 절반으로 첫 8시간 투여량이다.','정답. 4mL × 60kg × 30 = 7,200mL이다.','Parkland 공식에 8mL를 적용한 값으로 과다 계산이다.']},
  {id:'119-calc-burn-02',grade:'P',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'mid',type:'계산형',source:'2026 소방전술3(구급) 261쪽',q:'Parkland 24시간 총 수액량이 7,200mL라면 교재 기준 첫 8시간 투여량은?',choices:['1,800mL','2,400mL','3,600mL','7,200mL'],a:2,choiceExplanations:['24시간 총량의 1/4이 아니라 절반을 투여한다.','총량의 1/3을 계산하는 방식이 아니다.','정답. 첫 8시간에는 24시간 총량의 절반인 3,600mL를 투여한다.','첫 8시간에 24시간 총량 전부를 투여하는 것이 아니다.']},
  {id:'119-calc-burn-03',grade:'P',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',type:'계산형',source:'2026 소방전술3(구급) 261쪽',q:'체중 70kg, 2·3도 화상면적 20%인 환자의 Parkland 24시간 수액량은?',choices:['1,400mL','2,800mL','5,600mL','11,200mL'],a:2,choiceExplanations:['체중과 화상면적만 곱하고 4mL를 적용하지 않은 값이다.','24시간 총량의 절반에 해당하므로 첫 8시간 값이다.','정답. 4mL × 70kg × 20 = 5,600mL이다.','공식 계수를 두 배로 적용한 값으로 과다 계산이다.']},
  {id:'119-calc-burn-04',grade:'P',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',type:'계산형',source:'2026 소방전술3(구급) 261쪽',q:'교재의 병원 전 초기 수액량 기준으로 체중 60kg, 화상면적 30% 환자의 수액량은?',choices:['225mL','450mL','900mL','3,600mL'],a:1,choiceExplanations:['0.125mL를 적용한 값으로 교재식보다 적다.','정답. 0.25mL × 60kg × 30 = 450mL이다.','0.5mL를 적용한 값으로 교재 초기량 공식보다 많다.','Parkland 첫 8시간 투여량과 혼동한 값이다.']}
];
const seenId=new Set(V.questions.map(x=>x.id)),seenText=new Set(V.questions.map(x=>String(x.q||'').replace(/\s+/g,' ').trim().toLowerCase()));let added=0;
for(const q of Q){
  const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();
  if(seenId.has(q.id)||seenText.has(k))continue;
  q.ex=q.choiceExplanations[q.a];q.examStyle=V.QuestionQuality119?.isExamStyle?.(q)!==false;q.questionClass='exam-style';
  V.questions.push(q);seenId.add(q.id);seenText.add(k);added++;
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);
V.CalculationQuestions119={version:'119-verified-calculation-practice-v1',added,ids:Q.map(x=>x.id),sourcePolicy:'only official-source formulas already represented in study packs'};
})();