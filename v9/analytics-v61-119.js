'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum?.concepts||!V.QuestionType119)return;

const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
const pct=(a,b)=>b?Math.round(a/b*100):0;
const avg=rows=>rows.length?rows.reduce((s,n)=>s+Number(n||0),0)/rows.length:0;
const labelDifficulty=k=>k==='low'?'하':k==='high'?'상':'중';
const qForEvent=e=>V.questionById?.[e?.questionId]||V.questionById?.[e?.masterQuestionId]||null;

function normalizedEvents(state,now=Date.now()){
  const rows=[];
  for(const e of state?.answerEvents||[]){
    if(!e||!e.conceptId)continue;
    const q=qForEvent(e),concept=V.curriculum.byId?.[e.conceptId],scopeId=e.scopeId||q?.scopeId||concept?.scopeId||'',scope=V.curriculum.scopeById?.[scopeId];
    const fam=q?V.QuestionType119?.classify?.(q):null;
    rows.push({
      eventId:e.eventId||'',questionId:e.questionId||'',masterQuestionId:e.masterQuestionId||q?.masterQuestionId||q?.id||'',
      familyId:e.familyId||q?.familyId||q?.masterQuestionId||q?.id||'',conceptId:e.conceptId,scopeId,
      subject:e.subject||q?.subject||concept?.subject||'',correct:e.correct===true,confidence:e.confidence||'none',
      responseMs:Number.isFinite(Number(e.responseMs))?Number(e.responseMs):null,at:Number(e.at)||0,
      recent:(Number(e.at)||0)>=now-30*86400000,difficulty:q?.difficulty||V.QuestionDifficulty?.infer?.(q)||'mid',
      skillKey:fam?.key||'recall',skillLabel:fam?.label||'기억·개념',conceptTitle:concept?.title||e.conceptId,scopeTitle:scope?.title||concept?.scopeTitle||scopeId
    })
  }
  return rows
}
function group(rows,keyFn,labelFn){
  const map=new Map;
  for(const row of rows){
    const key=keyFn(row);if(!key)continue;
    const x=map.get(key)||{key,label:labelFn(row),attempts:0,correct:0,sureWrong:0,recentAttempts:0,recentCorrect:0,response:[]};
    x.attempts++;if(row.correct)x.correct++;if(!row.correct&&row.confidence==='sure')x.sureWrong++;
    if(row.recent){x.recentAttempts++;if(row.correct)x.recentCorrect++}
    if(row.responseMs!=null)x.response.push(row.responseMs);map.set(key,x)
  }
  return [...map.values()].map(x=>({...x,accuracy:pct(x.correct,x.attempts),recentAccuracy:pct(x.recentCorrect,x.recentAttempts),sureWrongRate:pct(x.sureWrong,x.attempts),avgResponseMs:x.response.length?Math.round(avg(x.response)):null}))
}
function weaknessRows(state,events,now){
  const wrongs=(state?.wrongs||[]).filter(w=>!w?.resolved),wrongByConcept=new Map;
  for(const w of wrongs){
    const x=wrongByConcept.get(w.conceptId)||{unresolved:0,overdue:0,repeat:0};
    x.unresolved++;if(Number(w.due||0)<=now)x.overdue++;if(Number(w.wrongCount||1)>=2)x.repeat++;wrongByConcept.set(w.conceptId,x)
  }
  const grouped=group(events,x=>x.conceptId,x=>x.conceptTitle);
  const byId=new Map(grouped.map(x=>[x.key,x]));
  for(const [conceptId,w] of wrongByConcept){if(!byId.has(conceptId)){const c=V.curriculum.byId?.[conceptId];grouped.push({key:conceptId,label:c?.title||conceptId,attempts:0,correct:0,accuracy:0,recentAttempts:0,recentAccuracy:0,sureWrong:0,sureWrongRate:0,avgResponseMs:null})}}
  return grouped.map(x=>{
    const c=V.curriculum.byId?.[x.key],w=wrongByConcept.get(x.key)||{unresolved:0,overdue:0,repeat:0},sample=x.attempts>=5?1:x.attempts>=3?.9:x.attempts>=2?.75:x.attempts>=1?.6:.45;
    const error=100-x.accuracy,score=clamp(Math.round((error*.62+x.sureWrongRate*.23+Math.min(20,w.unresolved*5)+Math.min(15,w.overdue*5)+Math.min(10,w.repeat*4))*sample));
    return{...x,conceptId:x.key,scopeId:c?.scopeId||'',subject:c?.subject||'',scopeTitle:c?.scopeTitle||'',unresolved:w.unresolved,overdue:w.overdue,repeat:w.repeat,weakness:score,evidence:x.attempts>=5?'충분':x.attempts>=3?'보통':x.attempts>=1?'초기':'오답기록'}
  }).sort((a,b)=>b.weakness-a.weakness||b.unresolved-a.unresolved||a.accuracy-b.accuracy||b.attempts-a.attempts)
}
function examTrend(state){
  const rows=(state?.examHistory||[]).filter(x=>!x?.partial&&!x?.abandoned&&Number.isFinite(Number(x?.score))).slice(-12);
  const scores=rows.map(x=>Number(x.score)),recent=scores.slice(-3),prev=scores.slice(-6,-3),recentAvg=recent.length?Math.round(avg(recent)):null,prevAvg=prev.length?Math.round(avg(prev)):null;
  return{rows,latest:scores.at(-1)??null,recentAvg,prevAvg,delta:recentAvg!=null&&prevAvg!=null?recentAvg-prevAvg:null,best:scores.length?Math.max(...scores):null}
}
function analyze(state,{now=Date.now()}={}){
  const events=normalizedEvents(state,now),attempts=events.length,correct=events.filter(x=>x.correct).length,sureWrong=events.filter(x=>!x.correct&&x.confidence==='sure').length;
  const unresolved=(state?.wrongs||[]).filter(x=>!x?.resolved),overdue=unresolved.filter(x=>Number(x.due||0)<=now).length;
  const concepts=weaknessRows(state,events,now),subjects=group(events,x=>x.subject,x=>x.subject==='fire'?'소방학':'응급처치학'),scopes=group(events,x=>x.scopeId,x=>x.scopeTitle),skills=group(events,x=>x.skillKey,x=>x.skillLabel),difficulty=group(events,x=>x.difficulty,x=>labelDifficulty(x.difficulty)),confidence=group(events,x=>x.confidence,x=>x.confidence==='sure'?'확실':x.confidence==='maybe'?'애매':'미선택');
  const scopeWeak=scopes.map(x=>{
    const members=concepts.filter(c=>c.scopeId===x.key),unresolvedN=members.reduce((s,c)=>s+c.unresolved,0),weakness=members.length?Math.round(avg(members.map(c=>c.weakness))):Math.max(0,100-x.accuracy);
    return{...x,scopeId:x.key,weakness,unresolved:unresolvedN,conceptId:members[0]?.conceptId||V.curriculum.scopeById?.[x.key]?.concepts?.[0]?.id||''}
  }).sort((a,b)=>b.weakness-a.weakness||a.accuracy-b.accuracy||b.attempts-a.attempts);
  const skillWeak=skills.map(x=>({...x,weakness:clamp(Math.round((100-x.accuracy)*.75+x.sureWrongRate*.25))})).sort((a,b)=>b.weakness-a.weakness||b.attempts-a.attempts);
  const trend=examTrend(state),recommendedConceptIds=concepts.filter(x=>x.weakness>=25||x.unresolved>0).slice(0,20).map(x=>x.conceptId);
  const priorities=[];
  for(const c of concepts.slice(0,4))if(c.weakness>=20||c.unresolved>0)priorities.push({kind:'concept',id:c.conceptId,title:c.label,reason:`정확도 ${c.accuracy}% · 오답 ${c.unresolved}개`,score:c.weakness});
  const sw=skillWeak[0];if(sw?.attempts>=3&&sw.weakness>=25)priorities.push({kind:'skill',id:sw.key,title:sw.label,reason:`문제유형 정확도 ${sw.accuracy}%`,score:sw.weakness});
  if(sureWrong)priorities.push({kind:'confidence',id:'sure-wrong',title:'확신 오답',reason:`틀렸지만 확실하다고 답한 문제 ${sureWrong}개`,score:100});
  return{
    version:'119-v61-performance-weakness-center-v1',
    summary:{attempts,correct,accuracy:pct(correct,attempts),sureWrong,unresolved:unresolved.length,overdue,examCount:trend.rows.length,recentExamAvg:trend.recentAvg,trendDelta:trend.delta,bestExam:trend.best},
    events,subjects,scopes:scopeWeak,concepts,skills:skillWeak,difficulty,confidence,trend,priorities:priorities.slice(0,6),recommendedConceptIds,
    dataLevel:attempts>=30?'충분':attempts>=10?'보통':attempts>0?'초기':'없음'
  }
}
function audit(state){const x=analyze(state);return{ready:!!x,attempts:x.summary.attempts,concepts:x.concepts.length,scopes:x.scopes.length,skills:x.skills.length,dataLevel:x.dataLevel}}
V.AnalyticsV61={version:'119-v61-performance-weakness-center-v1',analyze,audit,policy:{localOnly:true,noDiagnosis:true,minimumEvidenceLabels:true,realMockUnchanged:true,adaptiveTrainingOnly:true}};
})();