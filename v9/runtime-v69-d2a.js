/* V69 split from runtime-v69-d2.js part 1 */
/* --- questions-calculation-119.js --- */
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
  {id:'119-calc-burn-04',grade:'P',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',type:'계산형',source:'2026 소방전술3(구급) 261쪽',q:'교재의 병원 전 초기 수액량 기준으로 체중 60kg, 화상면적 30% 환자의 수액량은?',choices:['225mL','450mL','900mL','3,600mL'],a:1,choiceExplanations:['0.125mL를 적용한 값으로 교재식보다 적다.','정답. 0.25mL × 60kg × 30 = 450mL이다.','0.5mL를 적용한 값으로 교재 초기량 공식보다 많다.','Parkland 첫 8시간 투여량과 혼동한 값이다.']},
  {id:'119-calc-comb-01',grade:'P',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'mid',type:'계산형',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론공기량이 20 N㎥일 때 이론산소량은?',choices:['2.1 N㎥','4.2 N㎥','9.5 N㎥','23.8 N㎥'],a:1,choiceExplanations:['공기 중 산소비율 21%를 10.5%로 잘못 적용한 값이다.','정답. 이론산소량 = 20 × 0.21 = 4.2 N㎥이다.','메탄의 이론공기량 예시와 혼동한 값이다.','이론산소량을 0.21로 나눈 반대 계산에 가까운 값이다.']},
  {id:'119-calc-comb-02',grade:'P',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'mid',type:'계산형',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론산소량이 5 N㎥일 때 이론공기량은 약 얼마인가?',choices:['1.05 N㎥','5.21 N㎥','10.5 N㎥','23.81 N㎥'],a:3,choiceExplanations:['이론산소량에 0.21을 곱한 값으로 방향이 반대다.','5에 0.21을 더하는 계산은 교재 관계식이 아니다.','공기 중 산소를 50%로 잘못 본 값에 가깝다.','정답. 이론공기량 = 5 ÷ 0.21 ≈ 23.81 N㎥이다.']},
  {id:'119-calc-comb-03',grade:'P',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'low',type:'계산형',source:'2026 소방전술1(화재2) 299~300쪽',q:'실제공기량이 14 N㎥, 이론공기량이 10 N㎥일 때 과잉공기량은?',choices:['4 N㎥','10 N㎥','14 N㎥','24 N㎥'],a:0,choiceExplanations:['정답. 과잉공기량 = 실제공기량 - 이론공기량 = 14 - 10 = 4 N㎥이다.','이론공기량 자체를 과잉공기량으로 본 값이다.','실제공기량 자체를 과잉공기량으로 본 값이다.','두 공기량을 더하면 과잉공기량이 아니다.']},
  {id:'119-calc-comb-04',grade:'P',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'mid',type:'계산형',source:'2026 소방전술1(화재2) 300쪽',q:'실제공기량이 12 N㎥, 이론공기량이 10 N㎥일 때 공기비 m은?',choices:['0.2','0.83','1.2','2.2'],a:2,choiceExplanations:['실제와 이론의 차이만 계산한 값으로 공기비가 아니다.','이론공기량을 실제공기량으로 나눈 역수에 가깝다.','정답. m = 실제공기량 ÷ 이론공기량 = 12 ÷ 10 = 1.2이다.','실제공기량과 이론공기량을 더한 비율이 아니다.']},
  {id:'119-calc-sci-01',grade:'P',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',type:'계산형',source:'2026 소방전술1(화재2) 308쪽',q:'분자량이 44인 이산화탄소의 증기비중은 약 얼마인가? (공기 평균 분자량 29)',choices:['0.66','1.00','1.52','2.90'],a:2,choiceExplanations:['29÷44를 계산한 역수에 가까운 값이다.','공기와 분자량이 같을 때의 값이므로 이산화탄소에 맞지 않는다.','정답. 증기비중 = 44 ÷ 29 ≈ 1.52로 공기보다 무겁다.','분자량 29를 그대로 소수점으로 옮긴 값으로 관계식이 아니다.']},
  {id:'119-calc-oxygen-01',grade:'P',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'mid',type:'계산형',source:'2024 응급처치학개론 복원문항 · 연습용(공식문제지 미확보)',q:'산소통 현재압력 1,000psi, 잔압 200psi, 실린더상수 1.56, 유량 5L/min일 때 사용가능시간은 약 얼마인가?',choices:['80분','125분','250분','500분'],a:2,choiceExplanations:['잔압과 실린더상수를 반영하지 않은 값이다.','(P-R)만 유량으로 나누는 계산과 비슷해 부족하다.','정답. ((1000-200)×1.56)÷5 = 249.6분으로 약 250분이다.','유량으로 나누지 않고 계산한 값에 가깝다.']},
  {id:'119-calc-oxygen-02',grade:'P',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',type:'계산형',source:'2024 응급처치학개론 복원문항 계산식 변형 · 연습용',q:'산소통 현재압력 1,200psi, 잔압 200psi, 실린더상수 0.28, 유량 10L/min일 때 사용가능시간은?',choices:['14분','28분','56분','280분'],a:1,choiceExplanations:['실린더상수를 절반 정도로 잘못 적용한 값이다.','정답. ((1200-200)×0.28)÷10 = 28분이다.','유량 5L/min으로 잘못 적용한 값에 가깝다.','유량으로 나누기 전 산소량 값이다.']},
  {id:'119-calc-drip-01',grade:'P',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'mid',type:'계산형',source:'표준 수액 점적 계산 교육식(KOCW 공개교육자료) · 시험범위 보강용',q:'수액 1,000mL를 8시간 동안 주입하고 점적계수가 20gtt/mL일 때 분당 방울 수는 약 얼마인가?',choices:['21gtt/min','31gtt/min','42gtt/min','60gtt/min'],a:2,choiceExplanations:['점적계수 또는 시간을 잘못 적용한 값이다.','15gtt/mL 정도를 적용했을 때 나오는 값에 가깝다.','정답. 1000×20÷(8×60)=41.7이므로 약 42gtt/min이다.','분 단위 환산을 잘못 적용한 값이다.']},
  {id:'119-calc-drip-02',grade:'P',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'low',type:'계산형',source:'표준 수액 점적 계산 교육식(KOCW 공개교육자료) · 시험범위 보강용',q:'수액 1,000mL를 8시간 동안 주입할 때 시간당 주입량은?',choices:['80mL/hr','100mL/hr','125mL/hr','160mL/hr'],a:2,choiceExplanations:['1000÷8의 결과가 아니다.','10시간으로 나눌 때의 값이다.','정답. 1000mL ÷ 8hr = 125mL/hr이다.','주입시간을 잘못 적용한 값이다.']},
  {id:'119-calc-oxygen-official-01',grade:'P',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'low',type:'계산형',source:'2026 소방전술3(구급) 185~186쪽 · 소방청 공식 구급 교육문제 496번',q:'산소통 사용가능시간의 계산식으로 옳은 것은? (P=현재압력, R=안전잔압, C=실린더상수, F=유량)',choices:['((P-R)×C)÷F','(P+R)×F÷C','P÷R÷C÷F','(P-R)×F×C'],a:0,choiceExplanations:['정답. 사용 가능한 압력에 산소통상수를 곱하고 분당 유량으로 나눈다.','잔압을 더하고 유량을 곱하는 식은 사용시간 관계와 맞지 않는다.','각 값을 연속으로 나누는 근거가 없는 식이다.','유량이 커질수록 시간이 길어지는 잘못된 관계다.']},
  {id:'119-calc-oxygen-official-02',grade:'P',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'mid',type:'계산형',source:'2026 소방전술3(구급) 185쪽 · 소방청 공식 구급 교육문제 496번 계산원리',q:'현재압력 1,400psi, 안전잔압 200psi, E형 산소통상수 0.28, 유량 12L/min이면 사용가능시간은?',choices:['14분','20분','28분','56분'],a:2,choiceExplanations:['사용가능 압력과 유량을 잘못 적용한 값이다.','실린더상수 적용이 맞지 않는 값이다.','정답. ((1400-200)×0.28)÷12 = 28분이다.','유량으로 나누는 단계를 잘못 처리한 값이다.']},
  {id:'119-calc-drip-official-01',grade:'P',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'low',type:'계산형',source:'식약처 제조인증 제인16-4490호 수액세트 사용설명서',q:'수액세트 사용설명서에 “1mL≈20방울”이라고 표시되어 있다면 이 세트의 점적계수는?',choices:['5gtt/mL','10gtt/mL','20gtt/mL','60mL/hr'],a:2,choiceExplanations:['표시된 1mL당 방울 수와 다르다.','표시된 방울 수의 절반 값이다.','정답. 1mL당 약 20방울이므로 점적계수는 20gtt/mL다.','mL/hr은 시간당 주입량 단위로 점적계수와 다르다.']},
  {id:'119-calc-drip-official-02',grade:'P',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',type:'계산형',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'750mL 수액을 5시간 동안 20gtt/mL 세트로 주입할 때 분당 점적수는?',choices:['25gtt/min','40gtt/min','50gtt/min','150gtt/min'],a:2,choiceExplanations:['총 주입시간 또는 점적계수를 잘못 적용한 값이다.','계산값 750×20÷300과 일치하지 않는다.','정답. 750×20÷(5×60) = 50gtt/min이다.','시간당 주입량 150mL/hr과 점적수를 혼동한 값이다.']}
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
V.CalculationQuestions119={version:'119-calculation-practice-v4',added,ids:Q.map(x=>x.id),sourcePolicy:'official textbook/NFA training and regulated-device source calculations plus clearly labeled legacy reconstructed/standard-education practice; all calculation drills remain P-grade and never become real-mock credit'};
})();
;

/* --- questions-calculation-quality2-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.QuestionQuality119)return;
const made=[];
const round=(n,d=2)=>Number(Number(n).toFixed(d));
const fmt=n=>Number.isInteger(Number(n))?String(Number(n)):String(round(Number(n),2));
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,33)+ch.charCodeAt(0))>>>0;return h};
function put(spec){
  const wrong=(spec.wrong||[]).map(x=>String(x));
  if(wrong.length!==3)throw new Error('Q2_CALC_WRONG_COUNT '+spec.id);
  const items=[{text:String(spec.correct),ex:'정답. '+spec.explain}].concat(wrong.map(()=>({text:'',ex:'오답. 공식·단위·연산방향을 다시 확인한다.'})));
  for(let i=0;i<3;i++)items[i+1].text=wrong[i];
  const pos=hash(spec.id)%4,correct=items.shift();items.splice(pos,0,correct);
  const q={id:spec.id,grade:'P',subject:spec.subject,scopeId:spec.scopeId,conceptId:spec.conceptId,difficulty:spec.difficulty||'mid',type:'계산형',source:spec.source,q:spec.q,choices:items.map(x=>x.text),a:pos,choiceExplanations:items.map(x=>x.ex),ex:items[pos].ex,examStyle:true,questionClass:'exam-style',generatedPractice:true,generatedBy:'119-quality2-calculation-factory-v1'};
  if(new Set(q.choices).size!==4)throw new Error('Q2_CALC_DUP_CHOICES '+spec.id);
  made.push(q);
}
function haz(id,label,a,da,b,db){
  const ans=round(a/da+b/db,2);
  put({id,subject:'fire',scopeId:'F05',conceptId:'F05-C01',source:'2026 예방실무2 · 위험물 지정수량 공식표',q:label+'의 지정수량 배수 합은?',correct:fmt(ans)+'배',wrong:[fmt(ans+.25)+'배',fmt(Math.max(.05,ans-.2))+'배',fmt(ans*2)+'배'],explain:a+'÷'+da+' + '+b+'÷'+db+' = '+fmt(ans)+'배'});
}
haz('119-q2calc-haz-01','적린 70kg과 마그네슘 150kg',70,100,150,500);
haz('119-q2calc-haz-02','유황 50kg과 철분 125kg',50,100,125,500);
haz('119-q2calc-haz-03','칼륨 7kg과 황린 6kg',7,10,6,20);
haz('119-q2calc-haz-04','제1석유류(비수용성) 80L와 알코올류 120L',80,200,120,400);

function burn(id,kg,tbsa,mode){
  const total=4*kg*tbsa;
  const ans=mode==='first8'?total/2:mode==='initial'?.25*kg*tbsa:total;
  const label=mode==='first8'?'첫 8시간 투여량':mode==='initial'?'병원 전 초기 수액량':'24시간 Parkland 수액량';
  const formula=mode==='first8'?'(4×'+kg+'×'+tbsa+')÷2':mode==='initial'?'0.25×'+kg+'×'+tbsa:'4×'+kg+'×'+tbsa;
  put({id,subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:mode==='initial'?'high':'mid',source:'2026 소방전술3(구급) · 화상 수액 계산',q:'체중 '+kg+'kg, 2·3도 화상면적 '+tbsa+'% 환자의 '+label+'은?',correct:ans.toLocaleString('ko-KR')+'mL',wrong:[(ans/2).toLocaleString('ko-KR')+'mL',(ans*2).toLocaleString('ko-KR')+'mL',(ans+500).toLocaleString('ko-KR')+'mL'],explain:formula+' = '+ans.toLocaleString('ko-KR')+'mL'});
}
burn('119-q2calc-burn-01',50,20,'total');
burn('119-q2calc-burn-02',80,25,'total');
burn('119-q2calc-burn-03',55,30,'first8');
burn('119-q2calc-burn-04',60,40,'initial');

function air(id,mode,x,y){
  let ans,q,ex,wrong;
  if(mode==='oxygen'){ans=round(x*.21,2);q='이론공기량이 '+x+' N㎥일 때 이론산소량은?';ex=x+'×0.21='+fmt(ans)+' N㎥';wrong=[fmt(x*.1)+' N㎥',fmt(x/.21)+' N㎥',fmt(x-ans)+' N㎥'];}
  else if(mode==='air'){ans=round(x/.21,2);q='이론산소량이 '+x+' N㎥일 때 이론공기량은 약 얼마인가?';ex=x+'÷0.21≈'+fmt(ans)+' N㎥';wrong=[fmt(x*.21)+' N㎥',fmt(x*2.1)+' N㎥',fmt(ans/2)+' N㎥'];}
  else if(mode==='excess'){ans=round(x-y,2);q='실제공기량 '+x+' N㎥, 이론공기량 '+y+' N㎥일 때 과잉공기량은?';ex=x+'-'+y+'='+fmt(ans)+' N㎥';wrong=[fmt(x+y)+' N㎥',fmt(y)+' N㎥',fmt(x/y)+' N㎥'];}
  else{ans=round(x/y,2);q='실제공기량 '+x+' N㎥, 이론공기량 '+y+' N㎥일 때 공기비 m은?';ex=x+'÷'+y+'='+fmt(ans);wrong=[fmt(round(y/x,2)),fmt(round(ans-.2,2)),fmt(round(ans+.5,2))];}
  put({id,subject:'fire',scopeId:'F03',conceptId:'F03-C03',source:'2026 소방전술1(화재2) · 연소공기 계산',q,correct:(mode==='ratio'?fmt(ans):fmt(ans)+' N㎥'),wrong,explain:ex});
}
air('119-q2calc-air-01','oxygen',30);
air('119-q2calc-air-02','air',6.3);
air('119-q2calc-air-03','excess',18,15);
air('119-q2calc-air-04','ratio',15,12);

function oxygen(id,p,r,f){
  const ans=round(((p-r)*.28)/f,1);
  put({id,subject:'ems',scopeId:'E09',conceptId:'E09-C07',source:'2026 소방전술3(구급) · E형 산소통 상수 0.28 교육기준',q:'E형 산소통의 현재압력 '+p+'psi, 안전잔압 '+r+'psi, 유량 '+f+'L/min일 때 사용가능시간은 약 얼마인가?',correct:fmt(ans)+'분',wrong:[fmt(round(ans/2,1))+'분',fmt(round(ans*2,1))+'분',fmt(round((p*.28)/f,1))+'분'],explain:'(('+p+'-'+r+')×0.28)÷'+f+'≈'+fmt(ans)+'분'});
}
oxygen('119-q2calc-o2-01',1000,200,8);
oxygen('119-q2calc-o2-02',1600,200,10);
oxygen('119-q2calc-o2-03',1800,200,12);

function drip(id,ml,h){
  const ans=Math.round(ml*20/(h*60));
  put({id,subject:'ems',scopeId:'E07',conceptId:'E07-C03',source:'20gtt/mL 수액세트 표기 · 단위계산',q:ml+'mL를 '+h+'시간 동안 20gtt/mL 세트로 주입할 때 분당 점적수는 약 얼마인가?',correct:ans+'gtt/min',wrong:[Math.max(1,Math.round(ans/2))+'gtt/min',(ans+10)+'gtt/min',Math.round(ml/h)+'gtt/min'],explain:ml+'×20÷('+h+'×60)≈'+ans+'gtt/min'});
}
drip('119-q2calc-drip-01',500,4);
drip('119-q2calc-drip-02',1000,10);
drip('119-q2calc-drip-03',750,6);

function heat(id,m,cp,dt){
  const ans=round(m*cp*dt,1);
  put({id,subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) · Q=m×c×ΔT',q:'질량 '+m+'g, 비열 '+cp+'cal/g·℃인 물질의 온도를 '+dt+'℃ 올리는 데 필요한 감열량은?',correct:fmt(ans)+'cal',wrong:[fmt(m*cp)+'cal',fmt(cp*dt)+'cal',fmt(ans+25)+'cal'],explain:'Q='+m+'×'+cp+'×'+dt+'='+fmt(ans)+'cal'});
}
heat('119-q2calc-heat-01',2,1,50);
heat('119-q2calc-heat-02',5,.5,40);

function foam(id,mode,a,b){
  if(mode==='conc'){
    const ans=a*b/100;
    put({id,subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 '+a+'L를 '+b+'% 농도로 만들 때 필요한 포원액은?',correct:fmt(ans)+'L',wrong:[fmt(ans/2)+'L',fmt(ans*2)+'L',fmt(a-ans)+'L'],explain:a+'×'+b+'÷100='+fmt(ans)+'L'});
  }else{
    const ans=a/b;
    put({id,subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 팽창비 정의',q:'발포 후 포 체적 '+a+'L, 발포 전 포수용액 '+b+'L이면 팽창비는?',correct:fmt(ans)+'배',wrong:[fmt(b/a)+'배',fmt(ans/2)+'배',fmt(ans*2)+'배'],explain:a+'÷'+b+'='+fmt(ans)+'배'});
  }
}
foam('119-q2calc-foam-01','conc',800,3);
foam('119-q2calc-foam-02','expand',900,75);

function gas(id,p1,v1,p2){
  const ans=round(p1*v1/p2,2);
  put({id,subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'KOSHA 공식 계산자료 · 보일 법칙 P1V1=P2V2',q:'온도가 일정할 때 P1='+p1+', V1='+v1+'L, P2='+p2+'이면 V2는?',correct:fmt(ans)+'L',wrong:[fmt(round(v1*p2/p1,2))+'L',fmt(v1)+'L',fmt(ans+3)+'L'],explain:'V2=P1×V1÷P2='+p1+'×'+v1+'÷'+p2+'='+fmt(ans)+'L'});
}
gas('119-q2calc-gas-01',1,10,2);
gas('119-q2calc-gas-02',2,6,3);

const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>String(q.q||'').replace(/\s+/g,' ').trim().toLowerCase()));
let added=0;
for(const q of made){
  const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();
  if(ids.has(q.id)||texts.has(k))continue;
  if(!V.QuestionQuality119.isExamStyle(q))throw new Error('Q2_CALC_CONTRACT_FAIL '+q.id);
  V.questions.push(q);ids.add(q.id);texts.add(k);added++;
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);
V.Quality2CalculationQuestions119={version:'119-quality2-calculation-v1',planned:made.length,added,grade:'P',realMockCredit:false,policy:'source-backed numeric variants only; no generated item is labeled as a past exam'};
})();
;

/* --- calculation-training-v3-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.QuestionQuality119)return;

const STAGES=[
  ['understand','1 이해'],
  ['basic','2 기본'],
  ['unit','3 단위변환'],
  ['reverse','4 역산'],
  ['trap','5 함정'],
  ['exam','6 실전']
];
const FAMILY_LABELS={hazmat:'위험물',combustion:'연소·기체',heat:'열량',foam:'포',oxygen:'산소통',iv:'수액·점적',burn:'화상·Parkland'};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const made=[];

function put({id,family,stage,subject,scopeId,conceptId,source,q,correct,wrong,difficulty='mid',explain}){
  const choices=[String(correct),...(wrong||[]).map(String)];
  if(choices.length!==4||new Set(choices).size!==4)throw new Error('CALC_V3_CHOICES '+id);
  const pos=hash(id)%4,answer=choices.shift();choices.splice(pos,0,answer);
  const ex=choices.map((x,i)=>i===pos?'정답. '+explain:'오답. 공식의 의미, 단위와 연산 방향을 다시 확인한다.');
  const row={id,grade:'P',subject,scopeId,conceptId,difficulty,type:'계산형',source,q,choices,a:pos,choiceExplanations:ex,ex:ex[pos],examStyle:true,questionClass:'exam-style',generatedPractice:true,generatedBy:'119-calculation-training-v3',calcFamily:family,calcStage:stage,pastExamClaim:false};
  if(!V.QuestionQuality119.isExamStyle(row))throw new Error('CALC_V3_CONTRACT '+id);
  made.push(row);
}

// 위험물 지정수량
put({id:'119-calc3-haz-understand',family:'hazmat',stage:'understand',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'low',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'서로 다른 위험물을 함께 저장할 때 지정수량 배수를 구하는 식으로 옳은 것은?',correct:'각 품목의 (저장량 ÷ 지정수량)을 모두 합한다',wrong:['전체 저장량을 가장 작은 지정수량 하나로만 나눈다','각 지정수량을 저장량으로 나눈 뒤 곱한다','품목 수만 세어 배수로 사용한다'],explain:'품목별 저장량을 해당 지정수량으로 나눈 값을 합산한다.'});
put({id:'119-calc3-haz-basic',family:'hazmat',stage:'basic',subject:'fire',scopeId:'F05',conceptId:'F05-C01',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'유황 60kg(지정수량 100kg)과 철분 200kg(지정수량 500kg)의 합산 배수는?',correct:'1.0배',wrong:['0.4배','0.6배','1.4배'],explain:'60÷100 + 200÷500 = 0.6 + 0.4 = 1.0배이다.'});
put({id:'119-calc3-haz-unit',family:'hazmat',stage:'unit',subject:'fire',scopeId:'F05',conceptId:'F05-C01',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'마그네슘 0.25t(지정수량 500kg)과 적린 50kg(지정수량 100kg)의 합산 배수는?',correct:'1.0배',wrong:['0.55배','0.75배','1.5배'],explain:'0.25t=250kg이므로 250÷500 + 50÷100 = 0.5 + 0.5 = 1.0배이다.'});
put({id:'119-calc3-haz-reverse',family:'hazmat',stage:'reverse',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'적린 40kg(지정수량 100kg)과 마그네슘을 함께 저장해 합계가 1.1배가 되려면, 지정수량 500kg인 마그네슘은 몇 kg인가?',correct:'350kg',wrong:['150kg','250kg','550kg'],explain:'적린이 0.4배이므로 마그네슘은 0.7배가 필요하고 500×0.7=350kg이다.'});
put({id:'119-calc3-haz-trap',family:'hazmat',stage:'trap',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'칼륨 5kg(지정수량 10kg)과 황린 10kg(지정수량 20kg)을 함께 저장한다. 단순 저장량 합계가 아니라 지정수량 배수로 계산한 값은?',correct:'1.0배',wrong:['0.5배','1.5배','15배'],explain:'5÷10과 10÷20을 각각 계산해 합하면 0.5+0.5=1.0배이다.'});
put({id:'119-calc3-haz-exam',family:'hazmat',stage:'exam',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',source:'소방청 국가위험물통합정보시스템 · 위험물 및 지정수량',q:'유황 30kg(100kg), 철분 150kg(500kg), 마그네슘 100kg(500kg)을 함께 저장할 때 합산 배수는?',correct:'0.8배',wrong:['0.6배','1.0배','1.6배'],explain:'0.3 + 0.3 + 0.2 = 0.8배이다.'});

// 연소·기체
put({id:'119-calc3-comb-understand',family:'combustion',stage:'understand',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'low',source:'2026 소방전술1(화재2) 299~302쪽',q:'공기 중 산소 체적비를 21%로 볼 때 이론산소량 O에서 이론공기량 A를 구하는 관계식은?',correct:'A = O ÷ 0.21',wrong:['A = O × 0.21','A = O - 0.21','A = 0.21 ÷ O'],explain:'공기량의 약 21%가 산소이므로 산소량을 0.21로 나눈다.'});
put({id:'119-calc3-comb-basic',family:'combustion',stage:'basic',subject:'fire',scopeId:'F03',conceptId:'F03-C03',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론공기량이 40 N㎥라면 이론산소량은?',correct:'8.4 N㎥',wrong:['4.0 N㎥','19.0 N㎥','190.5 N㎥'],explain:'40×0.21=8.4 N㎥이다.'});
put({id:'119-calc3-comb-unit',family:'combustion',stage:'unit',subject:'fire',scopeId:'F03',conceptId:'F03-C03',source:'2026 소방전술1(화재2) 299~302쪽 · 표준 체적 단위변환',q:'이론산소량 2.1 N㎥를 L로 바꾸면 얼마인가? (1 N㎥=1,000L)',correct:'2,100L',wrong:['210L','21,000L','0.0021L'],explain:'2.1×1,000=2,100L이다.'});
put({id:'119-calc3-comb-reverse',family:'combustion',stage:'reverse',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 300쪽',q:'공기비 m이 1.25이고 이론공기량이 12 N㎥이면 실제공기량은?',correct:'15 N㎥',wrong:['9.6 N㎥','12.25 N㎥','25 N㎥'],explain:'실제공기량 = 공기비×이론공기량 = 1.25×12=15 N㎥이다.'});
put({id:'119-calc3-comb-trap',family:'combustion',stage:'trap',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 299~300쪽',q:'실제공기량 18 N㎥, 이론공기량 15 N㎥일 때 과잉공기량과 공기비의 조합은?',correct:'3 N㎥ · 1.2',wrong:['3 N㎥ · 0.83','33 N㎥ · 1.2','1.2 N㎥ · 3'],explain:'과잉공기량은 18-15=3 N㎥, 공기비는 18÷15=1.2이다.'});
put({id:'119-calc3-comb-exam',family:'combustion',stage:'exam',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'2026 소방전술1(화재2) 299~302쪽',q:'이론산소량 4.2 N㎥이고 공기비가 1.2라면 실제공기량은?',correct:'24 N㎥',wrong:['5.04 N㎥','16.8 N㎥','20 N㎥'],explain:'이론공기량은 4.2÷0.21=20 N㎥, 실제공기량은 20×1.2=24 N㎥이다.'});

// 감열량
put({id:'119-calc3-heat-understand',family:'heat',stage:'understand',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'low',source:'2026 소방전술1(화재2) 190·345쪽',q:'감열량 계산식으로 옳은 것은? (m=질량, c=비열, ΔT=온도변화)',correct:'Q = m × c × ΔT',wrong:['Q = m ÷ c ÷ ΔT','Q = m + c + ΔT','Q = ΔT ÷ (m × c)'],explain:'감열량은 질량·비열·온도변화의 곱이다.'});
put({id:'119-calc3-heat-basic',family:'heat',stage:'basic',subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 4g, 비열 0.5cal/g·℃인 물질을 30℃ 올리는 데 필요한 감열량은?',correct:'60cal',wrong:['15cal','30cal','120cal'],explain:'4×0.5×30=60cal이다.'});
put({id:'119-calc3-heat-unit',family:'heat',stage:'unit',subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 0.002kg, 비열 1cal/g·℃인 물질을 50℃ 올린다. 필요한 감열량은?',correct:'100cal',wrong:['0.1cal','10cal','1,000cal'],explain:'0.002kg=2g이므로 2×1×50=100cal이다.'});
put({id:'119-calc3-heat-reverse',family:'heat',stage:'reverse',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 5g, 비열 1cal/g·℃인 물질에 150cal을 가했다. 온도변화 ΔT는?',correct:'30℃',wrong:['15℃','75℃','150℃'],explain:'ΔT=Q÷(m×c)=150÷5=30℃이다.'});
put({id:'119-calc3-heat-trap',family:'heat',stage:'trap',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 3g, 비열 0.5cal/g·℃인 물질의 온도가 20℃에서 70℃가 되었다. 감열량은?',correct:'75cal',wrong:['30cal','105cal','135cal'],explain:'ΔT는 최종온도 70이 아니라 70-20=50℃이므로 3×0.5×50=75cal이다.'});
put({id:'119-calc3-heat-exam',family:'heat',stage:'exam',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'high',source:'2026 소방전술1(화재2) 190·345쪽',q:'질량 0.01kg, 비열 0.2cal/g·℃인 물질을 30℃에서 80℃까지 가열할 때 감열량은?',correct:'100cal',wrong:['10cal','50cal','200cal'],explain:'0.01kg=10g, ΔT=50℃이므로 10×0.2×50=100cal이다.'});

// 포
put({id:'119-calc3-foam-understand',family:'foam',stage:'understand',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'low',source:'2026 소방전술1(화재2) · 포 농도·팽창비 정의',q:'포수용액 S(L)를 C(%) 농도로 만들 때 필요한 포원액량을 구하는 식은?',correct:'S × C ÷ 100',wrong:['S ÷ C × 100','S - C','C ÷ S × 100'],explain:'농도 백분율을 포수용액량에 곱해 원액량을 구한다.'});
put({id:'119-calc3-foam-basic',family:'foam',stage:'basic',subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 600L를 3%로 만들 때 필요한 포원액은?',correct:'18L',wrong:['6L','20L','180L'],explain:'600×3÷100=18L이다.'});
put({id:'119-calc3-foam-unit',family:'foam',stage:'unit',subject:'fire',scopeId:'F04',conceptId:'F04-C04',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 2㎥를 3% 농도로 만들 때 필요한 포원액은? (1㎥=1,000L)',correct:'60L',wrong:['6L','600L','6,000L'],explain:'2㎥=2,000L이고 2,000×3÷100=60L이다.'});
put({id:'119-calc3-foam-reverse',family:'foam',stage:'reverse',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 농도 정의',q:'포수용액 800L에 포원액 24L가 들어갔다면 농도는?',correct:'3%',wrong:['0.3%','6%','30%'],explain:'24÷800×100=3%이다.'});
put({id:'119-calc3-foam-trap',family:'foam',stage:'trap',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 팽창비 정의',q:'발포 후 포 체적이 1,200L이고 발포 전 포수용액이 100L라면, 농도가 아니라 팽창비는?',correct:'12배',wrong:['0.083배','3배','1,300배'],explain:'팽창비는 발포 후 체적÷발포 전 포수용액 체적 = 1,200÷100=12배이다.'});
put({id:'119-calc3-foam-exam',family:'foam',stage:'exam',subject:'fire',scopeId:'F04',conceptId:'F04-C04',difficulty:'high',source:'2026 소방전술1(화재2) · 포 농도·팽창비 정의',q:'500L의 6% 포수용액을 사용해 발포 후 체적 4,000L의 포가 만들어졌다. 필요한 원액량과 팽창비는?',correct:'30L · 8배',wrong:['30L · 80배','60L · 8배','470L · 8배'],explain:'원액은 500×0.06=30L, 팽창비는 4,000÷500=8배이다.'});

// 산소통
put({id:'119-calc3-o2-understand',family:'oxygen',stage:'understand',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'low',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'산소통 사용가능시간 T의 계산식으로 옳은 것은? (P=현재압력,R=안전잔압,C=상수,F=유량)',correct:'T = ((P-R) × C) ÷ F',wrong:['T = (P+R) × F ÷ C','T = P ÷ R ÷ C ÷ F','T = (P-R) × F × C'],explain:'사용 가능한 압력에 실린더상수를 곱하고 분당 유량으로 나눈다.'});
put({id:'119-calc3-o2-basic',family:'oxygen',stage:'basic',subject:'ems',scopeId:'E09',conceptId:'E09-C07',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'E형 산소통 현재압력 1,400psi, 안전잔압 200psi, 유량 12L/min이면 사용가능시간은?',correct:'28분',wrong:['14분','35분','56분'],explain:'((1400-200)×0.28)÷12=28분이다.'});
put({id:'119-calc3-o2-unit',family:'oxygen',stage:'unit',subject:'ems',scopeId:'E09',conceptId:'E09-C07',source:'2026 소방전술3(구급) 185~186쪽 · 시간 단위변환',q:'산소통 계산 결과가 90분이라면 시간 단위로는?',correct:'1.5시간',wrong:['0.9시간','1시간','9시간'],explain:'90÷60=1.5시간이다.'});
put({id:'119-calc3-o2-reverse',family:'oxygen',stage:'reverse',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'E형 산소통으로 유량 10L/min을 28분 사용하고 안전잔압 200psi를 남기려면 시작압력은?',correct:'1,200psi',wrong:['800psi','1,000psi','1,400psi'],explain:'P=(T×F÷C)+R=(28×10÷0.28)+200=1,200psi이다.'});
put({id:'119-calc3-o2-trap',family:'oxygen',stage:'trap',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'현재압력 1,000psi, 안전잔압 200psi, 유량 8L/min인 E형 산소통의 사용가능시간은? 잔압을 빼는 것을 잊지 않는다.',correct:'28분',wrong:['22.4분','35분','44.8분'],explain:'((1000-200)×0.28)÷8=28분이며, 35분은 잔압을 빼지 않은 함정값이다.'});
put({id:'119-calc3-o2-exam',family:'oxygen',stage:'exam',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',source:'2026 소방전술3(구급) 185~186쪽 · E형 산소통상수 0.28',q:'현재압력 1,800psi, 안전잔압 200psi, E형 상수 0.28, 유량 12L/min일 때 사용가능시간은 약?',correct:'37.3분',wrong:['28분','42분','56분'],explain:'((1800-200)×0.28)÷12≈37.3분이다.'});

// 수액·점적
put({id:'119-calc3-iv-understand',family:'iv',stage:'understand',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'low',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'총 수액량 V(mL), 점적계수 D(gtt/mL), 시간 H(hr)일 때 gtt/min 계산식은?',correct:'V × D ÷ (H × 60)',wrong:['V ÷ D × H','V × H ÷ D','V × D × H × 60'],explain:'시간을 분으로 바꾼 뒤 총 방울 수를 총 분으로 나눈다.'});
put({id:'119-calc3-iv-basic',family:'iv',stage:'basic',subject:'ems',scopeId:'E07',conceptId:'E07-C03',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'500mL를 4시간 동안 20gtt/mL 세트로 주입하면 분당 점적수는 약?',correct:'42gtt/min',wrong:['21gtt/min','50gtt/min','83gtt/min'],explain:'500×20÷(4×60)=41.7이므로 약 42gtt/min이다.'});
put({id:'119-calc3-iv-unit',family:'iv',stage:'unit',subject:'ems',scopeId:'E07',conceptId:'E07-C03',source:'식약처 제조인증 수액세트 점적계수 · 시간 단위변환',q:'6시간 동안 수액을 주입한다면 점적 계산에서 총 시간은 몇 분인가?',correct:'360분',wrong:['60분','180분','600분'],explain:'6×60=360분이다.'});
put({id:'119-calc3-iv-reverse',family:'iv',stage:'reverse',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'600mL를 20gtt/mL 세트로 40gtt/min에 주입하면 총 주입시간은?',correct:'5시간',wrong:['2.5시간','8시간','10시간'],explain:'총 방울 수 600×20=12,000gtt, 12,000÷40=300분=5시간이다.'});
put({id:'119-calc3-iv-trap',family:'iv',stage:'trap',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'1,000mL를 8시간 동안 20gtt/mL로 주입할 때 시간당 주입량과 분당 점적수의 조합은?',correct:'125mL/hr · 약 42gtt/min',wrong:['42mL/hr · 125gtt/min','125mL/hr · 125gtt/min','1,000mL/hr · 20gtt/min'],explain:'1,000÷8=125mL/hr이고 1,000×20÷480≈42gtt/min이다.'});
put({id:'119-calc3-iv-exam',family:'iv',stage:'exam',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'high',source:'식약처 제조인증 수액세트 점적계수 · 단위계산',q:'750mL를 5시간 동안 20gtt/mL 수액세트로 주입할 때 분당 점적수는?',correct:'50gtt/min',wrong:['25gtt/min','40gtt/min','150gtt/min'],explain:'750×20÷(5×60)=50gtt/min이다.'});

// 화상·Parkland
put({id:'119-calc3-burn-understand',family:'burn',stage:'understand',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'low',source:'2026 소방전술3(구급) 261쪽',q:'Parkland 24시간 수액량 계산식으로 옳은 것은?',correct:'4mL × 체중(kg) × 2·3도 화상면적(%)',wrong:['0.25mL × 체중 × 화상면적만 사용','체중 ÷ 화상면적 × 4','4mL × 체중만 사용'],explain:'교재의 24시간 Parkland 총량은 4mL×체중×화상면적이다.'});
put({id:'119-calc3-burn-basic',family:'burn',stage:'basic',subject:'ems',scopeId:'E14',conceptId:'E14-C03',source:'2026 소방전술3(구급) 261쪽',q:'체중 65kg, 2·3도 화상면적 20% 환자의 Parkland 24시간 총량은?',correct:'5,200mL',wrong:['1,300mL','2,600mL','10,400mL'],explain:'4×65×20=5,200mL이다.'});
put({id:'119-calc3-burn-unit',family:'burn',stage:'unit',subject:'ems',scopeId:'E14',conceptId:'E14-C03',source:'2026 소방전술3(구급) 261쪽 · 체중 단위변환',q:'체중 70,000g, 2·3도 화상면적 15% 환자의 Parkland 24시간 총량은?',correct:'4,200mL',wrong:['420mL','10,500mL','42,000mL'],explain:'70,000g=70kg이므로 4×70×15=4,200mL이다.'});
put({id:'119-calc3-burn-reverse',family:'burn',stage:'reverse',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'체중 60kg 환자의 Parkland 24시간 총량이 4,800mL라면 2·3도 화상면적은?',correct:'20%',wrong:['10%','30%','40%'],explain:'화상면적=4,800÷(4×60)=20%이다.'});
put({id:'119-calc3-burn-trap',family:'burn',stage:'trap',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'Parkland 24시간 총량이 7,200mL라면 첫 8시간 투여량은?',correct:'3,600mL',wrong:['1,800mL','4,800mL','7,200mL'],explain:'첫 8시간에는 24시간 총량의 절반인 3,600mL를 투여한다.'});
put({id:'119-calc3-burn-exam',family:'burn',stage:'exam',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',source:'2026 소방전술3(구급) 261쪽',q:'체중 55kg, 2·3도 화상면적 30% 환자의 Parkland 24시간 총량과 첫 8시간량의 조합은?',correct:'6,600mL · 3,300mL',wrong:['3,300mL · 1,650mL','6,600mL · 6,600mL','13,200mL · 6,600mL'],explain:'4×55×30=6,600mL이고 첫 8시간에는 그 절반인 3,300mL를 투여한다.'});

function inferFamily(q){
  if(q.calcFamily)return q.calcFamily;
  const id=String(q.id||''),s=String(q.source||'')+' '+String(q.q||'');
  if(/haz|지정수량|위험물/.test(id+' '+s))return'hazmat';
  if(/burn|Parkland|화상/.test(id+' '+s))return'burn';
  if(/oxygen|산소통/.test(id+' '+s))return'oxygen';
  if(/drip|gtt|수액/.test(id+' '+s))return'iv';
  if(/foam|포수용액|팽창비|포원액/.test(id+' '+s))return'foam';
  if(/heat|감열|비열|Q=m/.test(id+' '+s))return'heat';
  if(/comb|air|gas|공기량|산소량|공기비|보일/.test(id+' '+s))return'combustion';
  return'other';
}
function inferStage(q){
  if(q.calcStage)return q.calcStage;
  const stem=String(q.q||'');
  if(/계산식|관계식|점적계수/.test(stem))return'understand';
  if(/몇 시간|시작압력|화상면적/.test(stem))return'reverse';
  if(/kg.*g|g.*kg|㎥.*L|시간.*분|분.*시간/.test(stem))return'unit';
  if(q.difficulty==='high')return'trap';
  return'basic';
}

const seenId=new Set(V.questions.map(q=>q.id)),seenText=new Set(V.questions.map(q=>String(q.q||'').replace(/\s+/g,' ').trim().toLowerCase()));
let added=0;
for(const q of made){
  const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();
  if(seenId.has(q.id)||seenText.has(k))continue;
  V.questions.push(q);seenId.add(q.id);seenText.add(k);added++;
}
for(const q of V.questions.filter(q=>q.type==='계산형')){
  q.calcFamily=inferFamily(q);
  q.calcStage=inferStage(q);
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);

function audit(){
  const rows=Object.keys(FAMILY_LABELS).map(family=>{
    const qs=V.questions.filter(q=>q.type==='계산형'&&q.calcFamily===family);
    const stages=Object.fromEntries(STAGES.map(([k])=>[k,qs.filter(q=>q.calcStage===k).length]));
    return{family,label:FAMILY_LABELS[family],total:qs.length,stages,ready:STAGES.every(([k])=>stages[k]>=1)};
  });
  return{version:'119-calculation-training-v3',rows,ready:rows.every(x=>x.ready),added,stageCount:STAGES.length,allGeneratedPractice:made.every(q=>q.grade==='P'&&q.pastExamClaim===false)};
}
V.CalculationTraining119={version:'119-calculation-training-v3',STAGES,FAMILY_LABELS,audit,added,planned:made.length,realMockCredit:false};
})();
;

/* --- questions-law-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const source='국가법령정보센터 · 119구조ㆍ구급에 관한 법률 및 시행령';
const Q=[
  {id:'119-law-ems-01',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'법령형',source,q:'119법 시행령상 구급대원 자격에 관한 설명으로 옳은 것은?',choices:['소방공무원이면 별도 자격 없이 모두 구급대원이 된다','의료인·1급·2급 응급구조사 또는 소방청 구급교육 이수자가 자격 대상이다','간호사는 구급대원이 될 수 없다','2급 응급구조사는 구급대원 자격 대상이 아니다'],a:1,choiceExplanations:['시행령은 소방공무원이라는 신분 외에 별도의 자격기준을 규정한다.','정답. 의료인, 1급·2급 응급구조사 또는 소방청 구급업무 교육 이수자가 자격 대상이다.','간호사를 포함한 의료인은 법령상 자격 대상에 포함될 수 있다.','시행령은 2급 응급구조사도 구급대원 자격 대상에 포함한다.']},
  {id:'119-law-ems-02',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'high',type:'예외형',source,q:'소방청장이 실시하는 구급업무 교육만 받은 구급대원의 업무범위로 옳은 것은?',choices:['모든 전문응급처치를 독자적으로 시행한다','구급차 운전과 구급에 관한 보조업무만 할 수 있다','의료기관에서 의사의 업무를 대신한다','1급 응급구조사와 법적으로 완전히 동일하다'],a:1,choiceExplanations:['교육 이수자에게 모든 전문응급처치를 독자 시행하도록 규정하지 않는다.','정답. 시행령은 해당 자격의 구급대원을 구급차 운전과 구급 보조업무로 제한한다.','구급대원 자격은 의료기관 의사 업무를 대체하는 자격이 아니다.','교육 이수자는 1급 응급구조사와 동일한 업무범위로 규정되지 않는다.']},
  {id:'119-law-ems-03',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'low',type:'법령형',source,q:'119법 시행령상 일반구급대의 설치 원칙으로 옳은 것은?',choices:['전국에 하나만 설치한다','소방서마다 원칙적으로 1개 대 이상 설치한다','병원마다 반드시 설치한다','시·도청 본청에만 설치한다'],a:1,choiceExplanations:['일반구급대를 전국 단일 조직으로 두는 규정이 아니다.','정답. 일반구급대는 원칙적으로 소방서마다 1개 대 이상 설치하도록 규정한다.','일반구급대는 병원 설치조직으로 규정되지 않는다.','시·도청 본청에만 설치하도록 제한한 규정이 아니다.']},
  {id:'119-law-ems-04',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'운영형',source,q:'119구급상황관리센터의 인력 운영에 관한 설명으로 옳은 것은?',choices:['자격과 무관한 인력만 배치한다','의료인 또는 1·2급 응급구조사 자격 인력을 배치해 24시간 근무체제를 유지한다','평일 낮에만 운영한다','구급차 운전면허만 있으면 자격요건이 충족된다'],a:1,choiceExplanations:['시행령은 구급상황관리센터에 자격을 갖춘 인력을 배치하도록 규정한다.','정답. 의료인 또는 1·2급 응급구조사 자격 인력을 배치해 24시간 근무체제를 유지한다.','시행령은 평일 주간만이 아니라 24시간 근무체제를 규정한다.','운전면허만으로 구급상황관리센터 자격요건을 충족한다고 규정하지 않는다.']},
  {id:'119-law-ems-05',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'high',type:'상황형',source,q:'비응급환자의 구급출동 요청을 거절할 수 있는 경우에 대한 설명으로 옳은 것은?',choices:['비응급으로 보이면 환자 상태 확인 없이 즉시 거절한다','병력·증상·주변상황을 종합적으로 평가해 응급 여부를 판단해야 한다','술을 마신 사람은 의식과 외상 여부와 관계없이 항상 거절한다','38℃ 이상 고열이 있는 감기환자도 예외 없이 거절한다'],a:1,choiceExplanations:['시행령은 상태 확인 없는 자동 거절이 아니라 종합적인 응급 여부 판단을 요구한다.','정답. 병력·증상·주변상황을 종합적으로 평가해 응급 여부를 판단하도록 규정한다.','음주자라도 강한 자극에 의식이 회복되지 않거나 외상이 있으면 단순 거절 대상 예외가 된다.','단순 감기환자라도 38℃ 이상 고열 또는 호흡곤란이 있으면 거절 대상 예외가 된다.']},
  {id:'119-law-ems-06',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'비교형',source,q:'119법상 항공구조구급대의 운영 목적에 가장 가까운 것은?',choices:['일반 행정문서 운송만 담당한다','초고층 등 인명구조와 도서·벽지 응급환자의 긴급 이송을 지원한다','소방시설 점검만 담당한다','병원 내 입원환자 이동만 담당한다'],a:1,choiceExplanations:['항공구조구급대의 법정 목적을 일반 행정문서 운송으로 규정하지 않는다.','정답. 초고층 등에서의 인명구조와 도서·벽지 응급환자의 의료기관 긴급 이송이 핵심 목적이다.','소방시설 점검 전담 조직으로 규정된 것이 아니다.','병원 내부 환자 이동만을 담당하는 조직이 아니다.']},
  {id:'119-law-ems-07',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'low',type:'법령형',source:'현행 119구조ㆍ구급에 관한 법률 제13조',q:'119법상 위급상황에서 구조·구급대의 기본 활동으로 옳은 것은?',choices:['인명구조·응급처치·이송 등 필요한 활동','일반 행정민원만 처리','병원 내부 진료만 수행','교통단속만 수행'],a:0,choiceExplanations:['정답. 위급상황에서 인명구조·응급처치·이송 등 필요한 활동을 수행한다.','119 구조·구급활동의 법정 범위와 다르다.','현장 구조·구급활동을 병원 내부로 한정하지 않는다.','교통단속 전담업무로 규정되지 않는다.']},
  {id:'119-law-ems-08',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'예외형',source:'현행 119법 시행령 제20조',q:'비응급 구급요청 거절에 관한 설명으로 옳은 것은?',choices:['병력·증상·주변상황을 종합해 응급 여부를 판단해야 한다','단순 감기라는 말만 들으면 고열·호흡곤란 여부와 무관하게 거절한다','음주자는 외상·의식상태와 관계없이 모두 거절한다','비응급 여부 판단 없이 자동 거절한다'],a:0,choiceExplanations:['정답. 시행령은 병력·증상·주변상황의 종합평가를 요구한다.','고열 또는 호흡곤란이 있는 감기환자는 예외가 될 수 있다.','의식회복 여부나 외상 여부에 따라 예외가 있다.','환자상태를 평가하지 않은 자동 거절은 법령 취지와 다르다.']},
  {id:'119-law-ems-09',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'high',type:'이송거부형',source:'현행 119법 시행령 제21조 · 시행규칙 제12조',q:'응급환자가 의료기관 이송을 거부할 때 구급대원의 대응으로 가장 적절한 것은?',choices:['중대한 위해 가능성을 평가하고 필요한 경우 이송을 위해 최대한 노력하며 거부 절차를 기록한다','환자가 한 번 거부하면 상태와 무관하게 즉시 떠난다','서명 거부 시 기록을 모두 폐기한다','의식이 없어도 보호자·상황을 확인하지 않는다'],a:0,choiceExplanations:['정답. 중대한 위해 위험 평가와 최대한의 이송 노력, 거부기록 절차가 함께 요구된다.','중증 가능성이 있으면 이송을 위해 최대한 노력해야 한다.','서명 거부 사실도 정해진 절차에 따라 기록한다.','의사결정능력과 보호자 상황을 함께 확인해야 한다.']},

  {id:'119-law-ems-10',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'low',type:'업무범위형',source:'현행 응급의료법 제41조 · 시행규칙 별표14',q:'현행 1급 응급구조사의 업무범위에 포함되는 것은?',choices:['심폐소생술을 위한 기도유지와 정맥로 확보','의사 면허 없이 모든 수술 시행','모든 처방약을 임의 처방','병원 경영 허가 발급'],a:0,choiceExplanations:['정답. 기도유지와 정맥로 확보는 별표14의 1급 업무범위다.','모든 수술을 허용하는 규정이 아니다.','응급구조사에게 일반적 처방권을 부여하지 않는다.','행정허가 업무가 응급구조사 업무범위는 아니다.']},
  {id:'119-law-ems-11',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'개정범위형',source:'현행 응급의료법 시행규칙 별표14',q:'현행 1급 응급구조사 업무범위에 새로 포함된 항목으로 옳은 조합은?',choices:['심정지 에피네프린·아나필락시스 자동주입펜·정맥혈 채혈·심전도 측정/전송','항암제 처방·전신마취·개흉수술·장기이식','모든 항생제 처방·수술동의서 승인·입원명령','방사선 판독·병리진단·마취과 전문의 업무'],a:0,choiceExplanations:['정답. 현행 별표14에 명시된 확대 업무들이다.','해당 전문의료행위를 일반 업무범위로 허용하지 않는다.','일반적인 처방·입원명령 권한을 부여하지 않는다.','전문의 고유업무를 1급 업무범위로 규정하지 않는다.']},
  {id:'119-law-ems-12',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'조건형',source:'현행 응급의료법 시행규칙 별표14',q:'1급 응급구조사의 응급분만 관련 업무로 옳은 것은?',choices:['현장·이송 중 지도의사의 실시간 영상의료지도 하에 탯줄 결찰·절단을 시행할 수 있다','모든 분만을 독자적으로 수술할 수 있다','의료지도 없이 제왕절개를 시행할 수 있다','병원 밖에서는 어떤 분만 보조도 할 수 없다'],a:0,choiceExplanations:['정답. 별표14는 장소와 실시간 영상의료지도 조건을 명시한다.','독자적 수술까지 허용하는 규정이 아니다.','제왕절개는 해당 업무범위에 포함되지 않는다.','정해진 조건에서는 탯줄 결찰·절단이 포함된다.']},
  {id:'119-law-ems-13',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'high',type:'함정형',source:'현행 응급의료법 시행규칙 별표14',q:'1급 응급구조사 업무범위에 대한 설명으로 옳지 않은 것은?',choices:['심전도 측정·전송이 포함된다','정맥로 확보 시 정맥혈 채혈이 포함된다','아나필락시스 쇼크에서 자동주입펜 에피네프린 투여가 포함된다','응급상황과 관계없이 모든 약물을 자유롭게 처방할 수 있다'],a:3,choiceExplanations:['현행 별표14에 포함된 업무다.','현행 별표14에 포함된 업무다.','현행 별표14에 포함된 업무다.','정답. 모든 약물의 자유로운 처방권을 주는 규정이 아니다.']},

  {id:'119-law-ems-14',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'low',type:'비밀형',source:'현행 응급의료법 제40조',q:'응급구조사의 비밀준수 의무로 옳은 것은?',choices:['직무상 알게 된 비밀을 누설하거나 공개해서는 안 된다','환자정보는 누구에게나 자유롭게 공개할 수 있다','퇴근 후에는 모든 비밀준수 의무가 사라진다','SNS 게시에는 비밀준수 의무가 적용되지 않는다'],a:0,choiceExplanations:['정답. 응급의료법은 직무상 비밀의 누설·공개를 금지한다.','환자정보를 자유롭게 공개할 수 없다.','업무 종료만으로 비밀보호 원칙이 사라지지 않는다.','공개 매체에서도 환자 비밀을 보호해야 한다.']},
  {id:'119-law-ems-15',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'동의형',source:'현행 응급의료법 제9조',q:'응급의료의 설명·동의 원칙에 대한 설명으로 옳은 것은?',choices:['원칙적으로 설명·동의를 받되 법정 응급 예외가 있다','응급의료는 어떤 상황에서도 설명할 필요가 없다','의사결정능력이 없으면 모든 응급처치를 영구히 중단한다','동의 절차 때문에 생명이 위험해져도 반드시 절차 완료까지 기다린다'],a:0,choiceExplanations:['정답. 설명·동의가 원칙이지만 의사결정 불능·치명적 지연 등 예외가 있다.','법은 원칙적으로 설명과 동의를 요구한다.','법정대리인·동행자 및 응급성에 따른 절차가 있다.','생명위험을 만드는 지연은 법정 예외사유가 될 수 있다.']},
  {id:'119-law-ems-16',grade:'P',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'mid',type:'지도의사형',source:'현행 응급의료법 제52조 · 119법 시행령 제27조의4',q:'지도의사 제도에 대한 설명으로 옳은 것은?',choices:['구급차등의 상담·구조·이송·응급처치를 지도하기 위한 의사를 두거나 위촉하는 제도다','구급차 운전만 지도하는 제도다','환자와 무관한 행정문서 결재 전담 제도다','응급의료와 관계없는 건축설계 제도다'],a:0,choiceExplanations:['정답. 법은 상담·구조·이송·응급처치의 의료지도를 목적으로 한다.','의료지도 범위를 운전만으로 한정하지 않는다.','응급환자 의료지도 제도다.','건축설계와 무관한 응급의료 제도다.']},
  {id:'119-law-ems-17',grade:'P',subject:'ems',scopeId:'E05',conceptId:'E05-C04',difficulty:'mid',type:'기록형',source:'현행 119법 시행규칙 제18조 · 응급의료법 제49조',q:'구급활동 기록에 대한 설명으로 옳은 것은?',choices:['구급활동일지는 상세히 작성해 소방관서에 3년간 보관하고 출동·처치 내용도 법정 방식으로 기록한다','환자 인계 즉시 모든 기록을 폐기한다','중증도분류 결과는 어떤 기록에도 남기지 않는다','처치내용 기록은 금지된다'],a:0,choiceExplanations:['정답. 119 시행규칙과 응급의료법은 활동·처치 기록과 보존을 요구한다.','구급활동일지는 정해진 기간 보관한다.','응급의료법은 중증도분류 결과도 기록대상에 포함한다.','처치내용은 핵심 기록대상이다.']},
  {id:'119-law-ems-18',grade:'P',subject:'ems',scopeId:'E05',conceptId:'E05-C04',difficulty:'high',type:'거부기록형',source:'현행 119법 시행규칙 제12조',q:'이송거부자가 확인서 서명을 반복 거부한 경우의 원칙으로 가장 적절한 것은?',choices:['서명거부 사실을 기록하고 정해진 목격자 절차를 거친다','기록을 하지 않고 즉시 폐기한다','구급활동일지를 작성할 수 없다','환자 상태와 관계없이 강제처벌한다'],a:0,choiceExplanations:['정답. 시행규칙은 서명거부 사실과 목격자 관련 기록 절차를 둔다.','서명 거부가 기록의무를 없애지는 않는다.','구급활동 기록의무는 별도로 유지된다.','구급대원이 현장에서 임의로 형벌을 부과하는 절차가 아니다.']}
];
const seenId=new Set(V.questions.map(x=>x.id)),seenText=new Set(V.questions.map(x=>String(x.q||'').replace(/\s+/g,' ').trim().toLowerCase()));let added=0;
for(const q of Q){const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();if(seenId.has(q.id)||seenText.has(k))continue;q.ex=q.choiceExplanations[q.a];q.examStyle=V.QuestionQuality119?.isExamStyle?.(q)!==false;q.questionClass='exam-style';V.questions.push(q);seenId.add(q.id);seenText.add(k);added++}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.QuestionDifficulty?.annotate?.(V.questions);
V.LawQuestions119={version:'119-current-law-practice-v2',added,ids:Q.map(x=>x.id),pastExamClaim:false,sourcePolicy:'current official law text only · 119 Act/Decree/Rule + Emergency Medical Service Act/Rule Annex 14'};
})();
;

/* --- questions-special-combustible-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const source='화재예방법 시행령 제19조·별표2·별표3 · 국가법령정보센터';
const Q=[
{id:'119-specialcomb-01',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'low',type:'법령형',source,q:'화재예방법 시행령상 특수가연물에 해당하는 면화류의 기준수량은?',choices:['100kg 이상','200kg 이상','400kg 이상','1,000kg 이상'],a:1,choiceExplanations:['100kg은 면화류의 법정 기준수량이 아니다.','정답. 시행령 별표2는 면화류 200kg 이상을 기준으로 한다.','400kg은 나무껍질 및 대팻밥의 기준수량이다.','1,000kg은 넝마·종이부스러기, 사류, 볏짚류 등에 해당한다.']},
{id:'119-specialcomb-02',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'법령형',source,q:'특수가연물 중 가연성액체류의 기준수량으로 옳은 것은?',choices:['200L 이상','1㎥ 이상','2㎥ 이상','10㎥ 이상'],a:2,choiceExplanations:['200L는 별표2의 가연성액체류 기준이 아니다.','1㎥는 현재 별표2 기준보다 작다.','정답. 가연성액체류는 2㎥ 이상이다.','10㎥는 목재가공품 및 나무부스러기의 기준수량이다.']},
{id:'119-specialcomb-03',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'비교형',source,q:'특수가연물의 품명과 기준수량 연결로 옳은 것은?',choices:['석탄·목탄류 — 1,000kg 이상','목재가공품·나무부스러기 — 10㎥ 이상','발포 고무류·플라스틱류 — 3,000kg 이상','나무껍질·대팻밥 — 200kg 이상'],a:1,choiceExplanations:['석탄·목탄류는 10,000kg 이상이다.','정답. 목재가공품 및 나무부스러기는 10㎥ 이상이다.','발포시킨 고무류·플라스틱류는 20㎥ 이상 기준이다.','나무껍질 및 대팻밥은 400kg 이상이다.']},
{id:'119-specialcomb-04',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',type:'상황형',source,q:'특수가연물을 실외에 쌓아 저장하는 경우 시행령 별표3상 기본 이격기준으로 옳은 것은?',choices:['대지경계선·도로·인접 건축물과 최소 1m','최소 3m','최소 6m','거리기준이 없다'],a:2,choiceExplanations:['1m는 별표3의 실외 저장 기본 이격기준이 아니다.','3m가 아니라 최소 6m 이상 간격을 두도록 규정한다.','정답. 실외 저장 시 대지경계선, 도로 및 인접 건축물과 최소 6m 이상 간격을 둔다.','별표3에는 실외 적치의 이격기준이 명시되어 있다.']},
{id:'119-specialcomb-05',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'high',type:'예외형',source,q:'특수가연물 적치 높이에 관한 설명으로 옳은 것은?',choices:['소화설비 조건과 무관하게 항상 5m 이하이다','살수설비 등을 갖춘 경우에도 항상 10m 이하이다','살수설비 또는 조건에 맞는 대형수동식소화기 범위에 포함되면 15m 이하 기준이 적용될 수 있다','높이에 관한 기준은 없다'],a:2,choiceExplanations:['별표3은 5m 일률 기준을 두지 않는다.','해당 소화설비 조건을 충족하면 15m 이하 기준이 적용될 수 있다.','정답. 살수설비 또는 방사범위에 포함되는 대형수동식소화기 조건에서는 높이 15m 이하 기준이 적용된다.','별표3은 저장 높이에 관한 기준을 규정한다.']},
{id:'119-specialcomb-06',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'구분형',source,q:'위험물과 특수가연물의 법적 분류를 구분한 설명으로 옳은 것은?',choices:['둘 다 위험물 제1류~제6류 분류를 그대로 사용한다','특수가연물은 화재예방법 시행령 별표2의 품명·수량 기준을 사용한다','특수가연물에는 기준수량 개념이 없다','위험물 지정수량과 특수가연물 기준수량은 항상 같은 숫자다'],a:1,choiceExplanations:['특수가연물은 위험물 제1류~제6류와 동일한 분류체계를 쓰지 않는다.','정답. 특수가연물은 화재예방법 시행령 별표2의 품명별 기준수량으로 판단한다.','특수가연물 역시 법령상 품명별 수량 기준이 있다.','두 제도는 적용 법령과 기준표가 달라 수량이 항상 같지 않다.']}
];
const seenId=new Set(V.questions.map(x=>x.id)),seenText=new Set(V.questions.map(x=>String(x.q||'').replace(/\s+/g,' ').trim().toLowerCase()));let added=0;
for(const q of Q){const k=String(q.q).replace(/\s+/g,' ').trim().toLowerCase();if(seenId.has(q.id)||seenText.has(k))continue;q.ex=q.choiceExplanations[q.a];q.examStyle=V.QuestionQuality119?.isExamStyle?.(q)!==false;q.questionClass='exam-style';V.questions.push(q);seenId.add(q.id);seenText.add(k);added++}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.QuestionDifficulty?.annotate?.(V.questions);
V.SpecialCombustibleQuestions119={version:'119-special-combustible-practice-v1',added,ids:Q.map(x=>x.id),pastExamClaim:false};
})();
;
