'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const day=86400000;
const clamp=n=>Math.max(0,Math.min(100,n));
const delta=(correct,confidence,responseMs)=>{
  let d=correct?({sure:12,maybe:9,none:6}[confidence]||7):({sure:-22,maybe:-14,none:-8}[confidence]||-10);
  if(correct&&responseMs&&responseMs<15000)d+=1;
  if(correct&&responseMs&&responseMs>120000)d-=2;
  return d
};
const intervalFor=mastery=>mastery>=90?30:mastery>=75?14:mastery>=60?7:mastery>=40?3:1;
const defaults=conceptId=>({
  conceptId,mastery:35,attempts:0,correct:0,streak:0,dangerousWrong:0,lapses:0,reviews:0,
  lastStudy:0,lastCorrect:0,nextReview:0,lastIntervalDays:0
});
function ensure(conceptId){
  const s=V.Store.state,p=s.progress[conceptId]||(s.progress[conceptId]=defaults(conceptId));
  for(const [k,v] of Object.entries(defaults(conceptId)))if(p[k]===undefined)p[k]=v;
  return p
}
function nextInterval(p,confidence='none',quality='answer'){
  const base=intervalFor(p.mastery);
  const streakFactor=Math.min(1.8,1+Math.max(0,(p.streak||0)-1)*0.15);
  const confidenceFactor=quality==='easy'?1.25:quality==='good'?1.05:confidence==='sure'?1.15:confidence==='maybe'?1:.8;
  const lapsePenalty=1/(1+Math.min(4,p.lapses||0)*0.08);
  return Math.max(1,Math.min(45,Math.round(base*streakFactor*confidenceFactor*lapsePenalty)))
}
function schedule(conceptId,correct,confidence='none',quality='answer'){
  const s=V.Store.state,p=ensure(conceptId),days=correct?nextInterval(p,confidence,quality):0,now=Date.now();
  p.lastIntervalDays=days;
  p.nextReview=correct?now+days*day:now;
  s.reviewSchedule[conceptId]={conceptId,due:p.nextReview,intervalDays:days,mastery:p.mastery,updatedAt:now,version:'v2'};
  return days
}
function requiredRecoveries(w){return (w?.wrongCount||0)>=2||w?.confidence==='sure'?2:1}
function recordAnswer(question,choice,confidence='none',responseMs=null){
  if(!question)return null;
  const s=V.Store.state,correct=Number(choice)===question.a,p=ensure(question.conceptId),now=Date.now();
  p.attempts++;
  if(correct){
    p.correct++;p.streak++;p.lastCorrect=now
  }else{
    p.streak=0;p.lapses=(p.lapses||0)+1;
    if(confidence==='sure')p.dangerousWrong=(p.dangerousWrong||0)+1
  }
  p.mastery=clamp((p.mastery||35)+delta(correct,confidence,responseMs));
  p.lastStudy=now;
  const intervalDays=schedule(question.conceptId,correct,confidence,'answer');
  s.answers[question.id]=Number(choice);
  s.confidence[question.id]=confidence;
  const event={
    eventId:crypto.randomUUID?crypto.randomUUID():'evt-'+now+'-'+Math.random(),
    questionId:question.id,conceptId:question.conceptId,scopeId:question.scopeId,subject:question.subject,
    correct,choice:Number(choice),confidence,responseMs,intervalDays,at:now
  };
  s.answerEvents.push(event);
  let w=s.wrongs.find(x=>x.questionId===question.id&&!x.resolved);
  if(!correct){
    if(!w){
      w={id:crypto.randomUUID?crypto.randomUUID():'w-'+now,questionId:question.id,conceptId:question.conceptId,scopeId:question.scopeId,confidence,due:now,intervalDays:0,resolved:false,createdAt:now,lastWrongAt:now,wrongCount:1,recoveryCorrect:0,requiredRecoveries:confidence==='sure'?2:1};
      s.wrongs.push(w)
    }else{
      w.confidence=confidence;w.due=now;w.lastWrongAt=now;w.wrongCount=(w.wrongCount||1)+1;w.recoveryCorrect=0;w.requiredRecoveries=requiredRecoveries(w)
    }
  }else if(w){
    w.recoveryCorrect=(w.recoveryCorrect||0)+1;
    w.requiredRecoveries=requiredRecoveries(w);
    if(w.recoveryCorrect>=w.requiredRecoveries){w.resolved=true;w.resolvedAt=now}
    else{w.due=now+day}
  }
  V.Store.save();
  return{correct,event,progress:p,wrong:w||null}
}
function markReviewed(conceptId,quality='good'){
  const p=ensure(conceptId),s=V.Store.state,now=Date.now();
  p.reviews=(p.reviews||0)+1;
  p.lastStudy=now;
  if(quality==='again'){
    p.mastery=clamp(p.mastery-8);p.streak=0;p.lapses=(p.lapses||0)+1
  }else if(quality==='good'){
    p.mastery=clamp(p.mastery+4);p.streak=(p.streak||0)+1
  }else if(quality==='easy'){
    p.mastery=clamp(p.mastery+7);p.streak=(p.streak||0)+1
  }
  const correct=quality!=='again';
  schedule(conceptId,correct,quality==='easy'?'sure':quality==='good'?'maybe':'none',quality);
  V.Store.save();
  return p
}
function statsFor(id){
  const raw=V.Store.state.progress[id];
  const p=raw?{...defaults(id),...raw}:{...defaults(id),mastery:0};
  const now=Date.now(),accuracy=p.attempts?Math.round(p.correct/p.attempts*100):null;
  const ageDays=p.lastStudy?Math.max(0,(now-p.lastStudy)/day):null;
  const overdueDays=p.nextReview?Math.max(0,(now-p.nextReview)/day):0;
  let retentionEstimate=p.attempts?p.mastery:0;
  if(p.attempts&&p.lastStudy&&p.lastIntervalDays>0){
    const ratio=ageDays/Math.max(1,p.lastIntervalDays);
    const freshness=Math.exp(-0.35*Math.max(0,ratio-1));
    retentionEstimate=Math.round(clamp(p.mastery*freshness))
  }
  return{
    ...p,accuracy,ageDays,overdueDays,retentionEstimate,
    overdue:!!p.nextReview&&p.nextReview<=now,
    questions:V.questionsForConcept?.(id)?.length||0
  }
}
function riskFor(id){
  const s=V.Store.state,p=statsFor(id),wrongs=s.wrongs.filter(x=>!x.resolved&&x.conceptId===id),danger=wrongs.filter(x=>x.confidence==='sure').length;
  let score=0;const reasons=[];
  if(danger){score+=160+danger*15;reasons.push('확신 오답')}
  if(wrongs.length){score+=Math.min(80,wrongs.length*16);reasons.push('오답 복구')}
  if(p.overdue){score+=100+Math.min(80,Math.ceil(p.overdueDays)*8);reasons.push('복습 지연')}
  if(p.attempts&&p.mastery<60){score+=80-p.mastery;reasons.push('취약개념')}
  if(p.attempts>=3&&p.accuracy<70){score+=Math.round((70-p.accuracy)*.8);reasons.push('정답률 보강')}
  if(p.lapses){score+=Math.min(30,p.lapses*5)}
  if(!p.attempts){score+=20;reasons.push('신규 학습')}
  if(p.ageDays!=null&&p.ageDays>30){score+=Math.min(30,Math.round((p.ageDays-30)/3));reasons.push('장기 미학습')}
  return{score,reason:reasons.slice(0,2).join(' + ')||'신규 학습',wrong:wrongs.length,danger,progress:p}
}
function todayPlan(limit=8){
  return V.curriculum.concepts.map(concept=>({concept,...riskFor(concept.id)}))
    .sort((a,b)=>b.score-a.score||(a.progress.lastStudy||0)-(b.progress.lastStudy||0)||a.concept.id.localeCompare(b.concept.id))
    .slice(0,limit)
}
function readiness(){
  const cs=V.curriculum.concepts,s=V.Store.state,studied=cs.filter(c=>(s.progress[c.id]?.attempts||0)>0),covered=studied.length;
  const questionConcepts=new Set(V.questions.filter(q=>q.grade==='A'||q.grade==='B').map(q=>q.conceptId));
  const retention=studied.length?Math.round(studied.reduce((a,c)=>a+statsFor(c.id).retentionEstimate,0)/studied.length):0;
  const dangerous=s.wrongs.filter(w=>!w.resolved&&w.confidence==='sure').length;
  const recoveryPending=s.wrongs.filter(w=>!w.resolved&&(w.recoveryCorrect||0)<requiredRecoveries(w)).length;
  const overdue=Object.values(s.reviewSchedule).filter(r=>r.due<=Date.now()).length,mock=V.examReadiness();
  return{scopeCoverage:Math.round(covered/cs.length*100),covered,total:cs.length,verifiedQuestionCoverage:Math.round(questionConcepts.size/cs.length*100),questionConcepts:questionConcepts.size,retention,dangerous,recoveryPending,overdue,mock}
}
function conceptPriority(id){return todayPlan(V.curriculum.concepts.length).findIndex(x=>x.concept.id===id)}
V.Mastery={version:'119-mastery-v2',ensure,recordAnswer,markReviewed,statsFor,todayPlan,readiness,conceptPriority,intervalFor,riskFor,requiredRecoveries};
})();