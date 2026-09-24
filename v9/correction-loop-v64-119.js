'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const POLICY=Object.freeze({
  version:'119-v64-weakness-correction-loop-v1',
  targetQuestions:5,
  passCorrect:4,
  passSureCorrect:3,
  autoInjectLimit:3,
  localOnly:true,
  adaptiveTrainingOnly:true,
  realMockUnchanged:true
});
const clamp=n=>Math.max(0,Math.min(100,Number(n)||0));
const pct=(a,b)=>b?Math.round(a/b*100):0;

function conceptEvents(state,id){
  return (state?.answerEvents||[]).filter(x=>x?.conceptId===id).sort((a,b)=>(Number(a.at)||0)-(Number(b.at)||0));
}
function unresolvedFor(state,id){
  return (state?.wrongs||[]).filter(x=>!x?.resolved&&x?.conceptId===id);
}
function rowFor(state,id,{now=Date.now()}={}){
  const concept=V.curriculum?.byId?.[id];if(!concept)return null;
  const events=conceptEvents(state,id),last10=events.slice(-10),last5=events.slice(-POLICY.targetQuestions),unresolved=unresolvedFor(state,id);
  const attempts=last10.length,correct=last10.filter(x=>x.correct===true).length,sureWrong=last10.filter(x=>x.correct!==true&&x.confidence==='sure').length;
  const recentCorrect=last5.filter(x=>x.correct===true).length,sureCorrect=last5.filter(x=>x.correct===true&&x.confidence==='sure').length;
  const repeat=unresolved.filter(x=>Number(x.wrongCount||1)>=2).length,overdue=unresolved.filter(x=>Number(x.due||0)<=now).length;
  const fallbackWeakness=clamp(Math.round((100-pct(correct,attempts))*.55+sureWrong*8+unresolved.length*12+repeat*8+overdue*6));
  const analytics=V.AnalyticsV61?.analyze?.(state,{now});
  const analyticsRow=analytics?.concepts?.find?.(x=>x.conceptId===id);
  const weakness=analyticsRow?.weakness??fallbackWeakness;
  const completed=last5.length>=POLICY.targetQuestions&&recentCorrect>=POLICY.passCorrect&&sureCorrect>=POLICY.passSureCorrect&&unresolved.length===0;
  const candidate=unresolved.length>0||sureWrong>0||(attempts>=2&&pct(correct,attempts)<75)||(analyticsRow?.weakness||0)>=25;
  const active=candidate&&!completed;
  const priority=clamp(weakness+Math.min(30,unresolved.length*10)+Math.min(20,sureWrong*8)+Math.min(15,repeat*6));
  const progress=Math.min(100,Math.round((Math.min(POLICY.passCorrect,recentCorrect)/POLICY.passCorrect*.7+Math.min(POLICY.passSureCorrect,sureCorrect)/POLICY.passSureCorrect*.3)*100));
  return{
    conceptId:id,scopeId:concept.scopeId,subject:concept.subject,title:concept.title,scopeTitle:concept.scopeTitle||'',
    attempts,accuracy:pct(correct,attempts),weakness,priority,unresolved:unresolved.length,repeat,overdue,sureWrong,
    recentAttempts:last5.length,recentCorrect,sureCorrect,completed,active,progress,
    status:completed?'교정 완료':active?'교정중':'관찰',
    target:'최근 '+POLICY.targetQuestions+'문제 중 '+POLICY.passCorrect+'정답 · 확실 '+POLICY.passSureCorrect
  }
}
function rows(state=V.Store?.state,{now=Date.now(),includeCompleted=true}={}){
  const ids=new Set;
  for(const w of state?.wrongs||[])if(w?.conceptId)ids.add(w.conceptId);
  for(const e of state?.answerEvents||[])if(e?.conceptId)ids.add(e.conceptId);
  const list=[...ids].map(id=>rowFor(state,id,{now})).filter(Boolean).filter(x=>x.active||(includeCompleted&&x.completed));
  return list.sort((a,b)=>Number(b.active)-Number(a.active)||b.priority-a.priority||b.weakness-a.weakness||a.conceptId.localeCompare(b.conceptId));
}
function activeRows(state=V.Store?.state,opts={}){return rows(state,{...opts,includeCompleted:false}).filter(x=>x.active)}
function statusFor(id,state=V.Store?.state,opts={}){return rowFor(state,id,opts)}
function summary(state=V.Store?.state,opts={}){
  const all=rows(state,opts),active=all.filter(x=>x.active),completed=all.filter(x=>x.completed);
  return{version:POLICY.version,active:active.length,completed:completed.length,rows:all,top:active.slice(0,6),policy:POLICY}
}
function ensureMeta(goal){goal.v64AutoIds=Array.isArray(goal.v64AutoIds)?goal.v64AutoIds:[];goal.v64Dismissed=goal.v64Dismissed&&typeof goal.v64Dismissed==='object'?goal.v64Dismissed:{};return goal}
function syncTodayGoal(state=V.Store?.state,goal,{limit=POLICY.autoInjectLimit}={}){
  if(!state||!goal)return false;ensureMeta(goal);
  let changed=false;const key=V.Mastery?.localDayKey?.()||new Date().toISOString().slice(0,10);
  for(const [id,date] of Object.entries(goal.v64Dismissed))if(date!==key){delete goal.v64Dismissed[id];changed=true}
  const all=rows(state),active=all.filter(x=>x.active).slice(0,Math.max(0,limit)),completed=new Set(all.filter(x=>x.completed).map(x=>x.conceptId));
  for(const id of goal.v64AutoIds)if(completed.has(id)&&!goal.done?.[id]){goal.done[id]=true;changed=true}
  const nextAuto=[];
  for(const row of active){
    if(goal.v64Dismissed[row.conceptId]===key)continue;
    nextAuto.push(row.conceptId);
    if(!goal.ids.includes(row.conceptId)){goal.ids.unshift(row.conceptId);changed=true}
    if(goal.done?.[row.conceptId]){delete goal.done[row.conceptId];changed=true}
  }
  const merged=[...new Set([...nextAuto,...goal.v64AutoIds.filter(id=>completed.has(id))])];
  if(JSON.stringify(merged)!==JSON.stringify(goal.v64AutoIds)){goal.v64AutoIds=merged;changed=true}
  if(changed)goal.v64UpdatedAt=Date.now();
  return changed
}
function dismissTodayGoal(state=V.Store?.state,goal,id){
  if(!goal||!id)return false;ensureMeta(goal);const key=V.Mastery?.localDayKey?.()||new Date().toISOString().slice(0,10);
  goal.v64Dismissed[id]=key;goal.v64AutoIds=goal.v64AutoIds.filter(x=>x!==id);goal.v64UpdatedAt=Date.now();return true
}
function restoreTodayGoal(goal,id){
  if(!goal||!id)return false;ensureMeta(goal);if(goal.v64Dismissed[id])delete goal.v64Dismissed[id];return true
}
V.CorrectionLoopV64={version:POLICY.version,policy:POLICY,rowFor,rows,activeRows,statusFor,summary,syncTodayGoal,dismissTodayGoal,restoreTodayGoal};
})();
