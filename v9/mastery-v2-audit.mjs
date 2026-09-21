import fs from 'node:fs';
import vm from 'node:vm';

let now=1789866000000;
const originalNow=Date.now;
Date.now=()=>now;
globalThis.window={AITUTOR_V9:{}};
if(!globalThis.crypto)globalThis.crypto={randomUUID:()=>('uuid-'+now)};
const V=window.AITUTOR_V9;
const state={answers:{},confidence:{},answerEvents:[],wrongs:[],reviewSchedule:{},progress:{},profile:{examYear:'2027'}};
const concepts=[
  {id:'A',subject:'fire',scopeId:'F',title:'반복오답 개념'},
  {id:'B',subject:'ems',scopeId:'E',title:'장기지연 개념'}
];
const questions=[
  {id:'119-a',conceptId:'A',scopeId:'F',subject:'fire',a:1,grade:'A'},
  {id:'119-b',conceptId:'B',scopeId:'E',subject:'ems',a:0,grade:'B'}
];
V.Store={state,save:()=>state};
V.curriculum={concepts};
V.questions=questions;
V.questionsForConcept=id=>questions.filter(q=>q.conceptId===id);
V.examReadiness=()=>({ready:true});
vm.runInThisContext(fs.readFileSync(new URL('./mastery.js',import.meta.url),'utf8'),{filename:'mastery.js'});

const M=V.Mastery,q=questions[0],assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
const day=86400000;
const dateAfter=days=>{
  const d=new Date(now+9*60*60*1000);d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)
};
const setExamItems=items=>{
  V.OfficialMonitor119={summary:()=>({targetExamYear:2027,items})};
};
const examItem=(days,overrides={})=>({
  kind:'recruitment_notice',title:'2027년 소방공무원 채용시험 시행계획 공고',publishedAt:'2026-12-01',
  targetYearMatch:true,noticeYear:2027,explicitYear:2027,schedule:{writtenExam:dateAfter(days)},...overrides
});
assert(M.version==='119-mastery-v2','version');
assert(M.intervalFor(90)===30,'legacy interval contract');

M.recordAnswer(q,0,'sure',8000);
let w=state.wrongs.find(x=>!x.resolved);
assert(w&&w.requiredRecoveries===2,'sure wrong needs two recoveries');
assert(state.progress.A.lapses===1&&state.progress.A.dangerousWrong===1,'lapse/danger tracking');

M.recordAnswer(q,1,'sure',8000);
w=state.wrongs.find(x=>!x.resolved);
assert(w&&w.recoveryCorrect===1,'first recovery must remain unresolved');
assert(w.due===now+86400000,'recovery spaced one day');

now+=86400000;
M.recordAnswer(q,1,'sure',8000);
assert(state.wrongs.find(x=>x.questionId===q.id)?.resolved===true,'second recovery resolves repeated dangerous wrong');
assert(state.progress.A.lastIntervalDays>=1&&state.progress.A.nextReview>now,'correct answer schedules review');

state.progress.B={conceptId:'B',mastery:80,attempts:5,correct:5,streak:3,dangerousWrong:0,lapses:0,reviews:0,lastStudy:now-60*86400000,lastCorrect:now-60*86400000,nextReview:now-30*86400000,lastIntervalDays:14};
state.reviewSchedule.B={conceptId:'B',due:state.progress.B.nextReview,intervalDays:14,mastery:80,updatedAt:state.progress.B.lastStudy};
const stale=M.statsFor('B');
assert(stale.overdue===true&&stale.overdueDays>=29,'overdue days');
assert(stale.retentionEstimate<80,'retention decays after interval');
assert(M.todayPlan(2)[0].concept.id==='B','overdue stale concept prioritized');

const lapsesBefore=state.progress.B.lapses;
M.markReviewed('B','again');
assert(state.progress.B.lapses===lapsesBefore+1,'again increments lapse');
assert(state.progress.B.nextReview===now,'again due immediately');
assert(M.readiness().overdue>=1,'readiness reports due reviews');

setExamItems([
  examItem(1,{kind:'exam_schedule',title:'2026년 소방공무원 채용시험 일정',targetYearMatch:false,noticeYear:2026,explicitYear:2026}),
  examItem(30)
]);
assert(M.examPhase().phase==='D30','target-year recruitment notice drives D-30 instead of wrong-year schedule');
setExamItems([examItem(7)]);
assert(M.examPhase().phase==='D7','D-7 phase');
setExamItems([examItem(1)]);
const urgent=M.examPhase(),urgentPlan=M.todayPlan(2),urgentReadiness=M.readiness();
assert(urgent.phase==='D1'&&urgent.daysLeft===1,'D-1 phase');
assert(urgentPlan.every(x=>x.examPhase==='D1'),'plan carries countdown phase');
assert(urgentPlan.some(x=>x.phaseBoost>0),'countdown adds review priority');
assert(urgentReadiness.examPhase==='D1'&&urgentReadiness.examDaysLeft===1,'readiness carries countdown phase');
setExamItems([examItem(0)]);
assert(M.examPhase().phase==='D1'&&M.examPhase().daysLeft===0,'exam day remains D-1 urgency mode');
setExamItems([examItem(31)]);
assert(M.examPhase().phase==='normal','outside D-30 remains normal');
setExamItems([examItem(-1)]);
assert(M.examPhase().phase==='normal','past exam remains normal');
setExamItems([examItem(1,{title:'2026년 소방공무원 채용시험 일정',targetYearMatch:false,noticeYear:2026,explicitYear:2026})]);
assert(M.examPhase().phase==='normal'&&M.examPhase().daysLeft===null,'wrong-year schedule cannot activate countdown');
setExamItems([examItem(1,{schedule:{writtenExam:'2027-02-31'}})]);
assert(M.examPhase().phase==='normal'&&M.examPhase().daysLeft===null,'invalid official date fails closed');

console.log('MASTERY_V2_AUDIT',JSON.stringify({
  version:M.version,
  dangerousRecoveryRequired:2,
  staleRetention:stale.retentionEstimate,
  topPriority:M.todayPlan(2)[0].concept.id,
  recoveryPending:M.readiness().recoveryPending,
  countdownPhases:['D30','D7','D1'],
  targetYearOnly:true,
  recruitmentNoticeSchedule:true,
  readinessCountdown:true,
  invalidDateFailsClosed:true
},null,2));
console.log('MASTERY_V2_AUDIT_COMPLETE');
Date.now=originalNow;
