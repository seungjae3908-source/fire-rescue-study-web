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
  put({id,subject:'fire',scopeId:'F03',conceptId:'F03-C02',source:'2026 소방전술1(화재2) · Q=m×c×ΔT',q:'질량 '+m+'g, 비열 '+cp+'cal/g·℃인 물질의 온도를 '+dt+'℃ 올리는 데 필요한 감열량은?',correct:fmt(ans)+'cal',wrong:[fmt(m*cp)+'cal',fmt(cp*dt)+'cal',fmt(ans/2)+'cal'],explain:'Q='+m+'×'+cp+'×'+dt+'='+fmt(ans)+'cal'});
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
  put({id,subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',source:'KOSHA 공식 계산자료 · 보일 법칙 P1V1=P2V2',q:'온도가 일정할 때 P1='+p1+', V1='+v1+'L, P2='+p2+'이면 V2는?',correct:fmt(ans)+'L',wrong:[fmt(round(v1*p2/p1,2))+'L',fmt(v1)+'L',fmt(ans*2)+'L'],explain:'V2=P1×V1÷P2='+p1+'×'+v1+'÷'+p2+'='+fmt(ans)+'L'});
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