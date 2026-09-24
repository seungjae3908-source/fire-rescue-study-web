'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.QuestionQuality119)return;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const hash32=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const rng=seed=>{let a=(Number(seed)>>>0)||0x9e3779b9;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}};
const seedFor=(...parts)=>hash32(parts.join('|'));
const fmt=n=>Number.isInteger(Number(n))?String(Number(n)):String(Number(Number(n).toFixed(1)));
const calcFamily=q=>q?.calcFamily||(/haz|지정수량|위험물/i.test(String(q?.id||'')+' '+String(q?.q||''))?'hazmat':/oxygen|산소통/i.test(String(q?.id||'')+' '+String(q?.q||''))?'oxygen':/Parkland|화상/i.test(String(q?.id||'')+' '+String(q?.q||''))?'burn':/gtt|점적|수액/i.test(String(q?.id||'')+' '+String(q?.q||''))?'iv':/포수용액|포원액|팽창비/i.test(String(q?.q||''))?'foam':/감열|비열|Q\s*=\s*m/i.test(String(q?.q||''))?'heat':/산소량|공기량|공기비/i.test(String(q?.q||''))?'combustion':'');
const SAFE_CALC_FAMILIES=new Set(['hazmat','combustion','heat','foam','oxygen','iv','burn']);
const supportsCalculation=q=>SAFE_CALC_FAMILIES.has(calcFamily(q));
const baseFamily=q=>q?.familyId||((q?.type==='계산형'||q?.calcFamily)&&calcFamily(q)?`calc:${q.conceptId}:${calcFamily(q)}`:`master:${q.masterQuestionId||q.id}`);

function annotateQuestion(q){
  if(!q)return q;
  if(!q.masterQuestionId)q.masterQuestionId=q.id;
  if(!q.familyId)q.familyId=baseFamily(q);
  if(!q.variantId)q.variantId='base';
  if(!q.variantKind)q.variantKind='base';
  if(!q.answerTruth)q.answerTruth=(q.grade==='A'||q.grade==='B'||q.pageVerified===true)?'source-verified':'source-grounded-practice';
  return q
}
function annotateAll(){for(const q of V.questions||[])annotateQuestion(q);return V.questions||[]}

function permute(q,seed,index=0){
  const random=rng(seedFor(seed,index,q.id,'choice-order')),order=[0,1,2,3];
  for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]]}
  if(order.every((x,i)=>x===i)){const shift=1+(seedFor(seed,q.id,index)%3);order.push(...order.splice(0,shift))}
  const choices=order.map(i=>q.choices[i]),choiceExplanations=order.map(i=>q.choiceExplanations?.[i]||q.ex||''),a=order.indexOf(q.a);
  return{choices,choiceExplanations,a,order}
}
function arranged(correct,wrongs,seed){
  const clean=[...new Set([String(correct),...(wrongs||[]).map(String)])];if(clean.length<4)return null;
  const wrong=clean.filter(x=>x!==String(correct)).slice(0,3),position=seedFor(seed,'answer-position')%4,items=wrong.map(text=>({text,correct:false}));
  items.splice(position,0,{text:String(correct),correct:true});
  return{choices:items.map(x=>x.text),a:position}
}
function variantMeta(base,seed,index,kind){
  const master=base.masterQuestionId||base.id,short=hash32(master).toString(16).padStart(8,'0');
  return{
    id:`119-v59-${short}-${kind==='parameterized-calculation'?'c':'s'}${(Number(seed)>>>0).toString(36)}-${index}`,
    grade:'P',masterQuestionId:master,familyId:baseFamily(base),variantId:`v59:${kind}:${Number(seed)>>>0}:${index}`,
    variantKind:kind,variantSeed:Number(seed)>>>0,variantGenerated:true,generatedPractice:true,generatedBy:'119-v59-safe-variant-engine',
    realMockCredit:false,practiceMockCredit:true,officialPastExam:false,pastExamClaim:false,reviewStatus:'derived-practice-variant'
  }
}
function surfaceVariant(base,seed,index=0){
  annotateQuestion(base);
  if(base.officialPastExam===true)return base;
  const p=permute(base,seed,index),meta=variantMeta(base,seed,index,'choice-order');
  return{...base,...meta,choices:p.choices,a:p.a,choiceExplanations:p.choiceExplanations,ex:p.choiceExplanations[p.a],
    masterChoiceMap:p.order,answerTruth:'programmatic-choice-permutation'}
}

function choose(random,arr){return arr[Math.floor(random()*arr.length)]}
function calcQuestion(base,seed,index=0){
  annotateQuestion(base);const family=calcFamily(base);if(!family)return null;
  const random=rng(seedFor(seed,index,base.id,family)),meta=variantMeta(base,seed,index,'parameterized-calculation');
  let q='',correct='',wrongs=[],ex='',truth={family};
  if(family==='hazmat'){
    const da=choose(random,[100,200,500]),db=choose(random,[100,500,1000]),ra=choose(random,[0.2,0.3,0.4,0.5,0.6]),rb=choose(random,[0.2,0.3,0.4,0.5,0.6]),a=Math.round(da*ra),b=Math.round(db*rb),ans=Number((ra+rb).toFixed(1));
    q=`위험물 A ${a}kg(지정수량 ${da}kg)와 위험물 B ${b}kg(지정수량 ${db}kg)을 함께 저장할 때 지정수량 합산 배수는?`;
    correct=fmt(ans)+'배';wrongs=[fmt(ra)+'배',fmt(rb)+'배',fmt(ans+0.5)+'배'];ex=`${a}÷${da} + ${b}÷${db} = ${fmt(ans)}배이다.`;truth={...truth,formula:'sum(amount/designated)',a,b,da,db,answer:ans}
  }else if(family==='combustion'){
    const o=choose(random,[2.1,4.2,6.3,8.4]),ans=Number((o/0.21).toFixed(1));
    q=`공기 중 산소 체적비를 21%로 볼 때 이론산소량이 ${fmt(o)} N㎥이면 이론공기량은?`;
    correct=fmt(ans)+' N㎥';wrongs=[fmt(o*0.21)+' N㎥',fmt(o*10)+' N㎥',fmt(ans+10)+' N㎥'];ex=`이론공기량 = ${fmt(o)}÷0.21 = ${fmt(ans)} N㎥이다.`;truth={...truth,formula:'O/0.21',oxygen:o,answer:ans}
  }else if(family==='heat'){
    const m=choose(random,[2,4,5,8,10]),sp=choose(random,[0.5,1,2]),dt=choose(random,[20,30,40,50]),ans=m*sp*dt;
    q=`질량 ${m}g, 비열 ${fmt(sp)}cal/g·℃인 물질의 온도를 ${dt}℃ 올리는 데 필요한 감열량은?`;
    correct=fmt(ans)+'cal';wrongs=[fmt(m*sp)+'cal',fmt(m*dt)+'cal',fmt(ans*2)+'cal'];ex=`Q=m×c×ΔT=${m}×${fmt(sp)}×${dt}=${fmt(ans)}cal이다.`;truth={...truth,formula:'m*c*dT',m,c:sp,dt,answer:ans}
  }else if(family==='foam'){
    const solution=choose(random,[400,500,600,800,1000]),conc=choose(random,[3,6]),ans=solution*conc/100;
    q=`포수용액 ${solution}L를 ${conc}% 농도로 만들 때 필요한 포원액량은?`;
    correct=fmt(ans)+'L';wrongs=[fmt(solution/conc)+'L',fmt(conc)+'L',fmt(ans*10)+'L'];ex=`${solution}×${conc}÷100=${fmt(ans)}L이다.`;truth={...truth,formula:'solution*conc/100',solution,conc,answer:ans}
  }else if(family==='oxygen'){
    const pressure=choose(random,[1000,1200,1400,1600,1800]),reserve=200,flow=choose(random,[8,10,12,15]),ans=Number((((pressure-reserve)*0.28)/flow).toFixed(1));
    q=`E형 산소통 현재압력 ${pressure}psi, 안전잔압 ${reserve}psi, 유량 ${flow}L/min일 때 사용가능시간은 약?`;
    correct=fmt(ans)+'분';wrongs=[fmt((pressure*0.28)/flow)+'분',fmt(ans/2)+'분',fmt(ans+10)+'분'];ex=`((${pressure}-${reserve})×0.28)÷${flow}≈${fmt(ans)}분이다.`;truth={...truth,formula:'((P-R)*0.28)/F',pressure,reserve,flow,answer:ans}
  }else if(family==='iv'){
    const volume=choose(random,[500,600,750,1000]),hours=choose(random,[4,5,6,8]),drop=20,ans=Math.round(volume*drop/(hours*60));
    q=`${volume}mL 수액을 ${hours}시간 동안 ${drop}gtt/mL 세트로 주입할 때 분당 점적수는 약?`;
    correct=fmt(ans)+'gtt/min';wrongs=[fmt(Math.max(1,Math.round(ans/2)))+'gtt/min',fmt(ans+20)+'gtt/min',fmt(Math.max(1,Math.round(volume/hours)))+'gtt/min'];ex=`${volume}×${drop}÷(${hours}×60)≈${ans}gtt/min이다.`;truth={...truth,formula:'V*D/(H*60)',volume,hours,drop,answer:ans}
  }else if(family==='burn'){
    const weight=choose(random,[50,55,60,65,70,80]),area=choose(random,[15,20,25,30]),ans=4*weight*area;
    q=`체중 ${weight}kg, 2·3도 화상면적 ${area}% 환자의 Parkland 24시간 총 수액량은?`;
    correct=fmt(ans)+'mL';wrongs=[fmt(ans/2)+'mL',fmt(ans*2)+'mL',fmt(weight*area)+'mL'];ex=`4×${weight}×${area}=${fmt(ans)}mL이다.`;truth={...truth,formula:'4*kg*TBSA',weight,area,answer:ans}
  }else return null;
  const ar=arranged(correct,wrongs,seedFor(seed,index,base.id,'calc-answer'));if(!ar)return null;
  const choiceExplanations=ar.choices.map((x,i)=>i===ar.a?'정답. '+ex:'오답. 공식의 의미, 단위와 연산 방향을 다시 확인한다.');
  return{...base,...meta,q,choices:ar.choices,a:ar.a,choiceExplanations,ex:choiceExplanations[ar.a],type:'계산형',calcFamily:family,
    answerTruth:'programmatic-formula',calculationTruth:truth}
}
function materialize(base,seed,index=0){
  annotateQuestion(base);
  if(base.officialPastExam===true)return base;
  const cq=(base.type==='계산형'||base.calcFamily)&&supportsCalculation(base)?calcQuestion(base,seed,index):null;
  return cq||surfaceVariant(base,seed,index)
}
function materializePracticeSet(qs,seed){
  return (qs||[]).map((q,i)=>materialize(q,seedFor(seed,i,q.id),i))
}
function snapshot(q){
  const keys=['id','grade','subject','scopeId','conceptId','q','choices','a','ex','difficulty','type','choiceExplanations','source','sourceUrl','license','calcFamily','calcStage','masterQuestionId','familyId','variantId','variantKind','variantSeed','variantGenerated','generatedPractice','generatedBy','realMockCredit','practiceMockCredit','officialPastExam','pastExamClaim','currentCompatibility','reviewStatus','answerTruth','calculationTruth','masterChoiceMap'];
  return Object.fromEntries(keys.filter(k=>q?.[k]!==undefined).map(k=>[k,q[k]]))
}
function familyId(q){return annotateQuestion(q)?.familyId||q?.id||''}
function auditSample(){
  annotateAll();const base=(V.questions||[]).filter(q=>V.QuestionQuality119.isExamStyle(q)&&!q.officialPastExam),calc=base.filter(q=>q.type==='계산형'&&calcFamily(q)),plain=base.filter(q=>q.type!=='계산형');
  const p=plain[0]?materialize(plain[0],12345,0):null,c=calc[0]?materialize(calc[0],12345,0):null;
  return{annotated:base.filter(q=>q.masterQuestionId&&q.familyId&&q.answerTruth).length,total:base.length,surface:!!p,calculation:!!c}
}
annotateAll();
V.VariantEngine119={version:'119-v59-safe-variant-engine-v1',seedFor,rng,annotateAll,annotateQuestion,familyId,supportsCalculation,materialize,materializePracticeSet,snapshot,auditSample,policy:{
  realMockVariants:false,practiceVariants:true,lawDefinitionFreeGeneration:false,nonCalculationTransform:'choice-order-only',calculationTransform:'formula-bounded-parameters',
  answerTruthLocked:true,familyExposureKey:true
}};
})();