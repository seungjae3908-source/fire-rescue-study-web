import fs from 'node:fs';
import vm from 'node:vm';

await import('./question-contract-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions?.length||!V?.QuestionType119)throw Error('V61_ANALYTICS_RUNTIME_UNAVAILABLE');
vm.runInThisContext(fs.readFileSync(new URL('./analytics-v61-119.js',import.meta.url),'utf8'),{filename:'analytics-v61-119.js'});
const A=V.AnalyticsV61;if(!A?.analyze)throw Error('V61_ANALYTICS_MODULE_UNAVAILABLE');

const fire=V.questions.filter(q=>q.subject==='fire'&&V.QuestionQuality119.isExamStyle(q)).slice(0,4);
const ems=V.questions.filter(q=>q.subject==='ems'&&V.QuestionQuality119.isExamStyle(q)).slice(0,4);
if(fire.length<4||ems.length<4)throw Error('V61_SEED_QUESTIONS_UNAVAILABLE');
const now=Date.now(),rows=[...fire,...ems],events=rows.map((q,i)=>({
  eventId:'v61-e'+i,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,
  correct:i%3!==0,choice:i%3!==0?q.a:(q.a+1)%4,confidence:i===0||i===3?'sure':i%2?'maybe':'none',responseMs:1200+i*250,at:now-i*3600000
}));
const weakQ=rows[0],state={
  answerEvents:events,
  wrongs:[
    {id:'v61-w1',questionId:weakQ.id,masterQuestionId:weakQ.id,familyId:weakQ.id,conceptId:weakQ.conceptId,scopeId:weakQ.scopeId,confidence:'sure',due:now-1000,resolved:false,wrongCount:2,lastWrongAt:now-5000},
    {id:'v61-w2',questionId:rows[3].id,masterQuestionId:rows[3].id,familyId:rows[3].id,conceptId:rows[3].conceptId,scopeId:rows[3].scopeId,confidence:'sure',due:now+86400000,resolved:false,wrongCount:1,lastWrongAt:now-6000}
  ],
  examHistory:[
    {id:'x1',score:62,at:now-8*86400000,partial:false,abandoned:false},
    {id:'x2',score:68,at:now-6*86400000,partial:false,abandoned:false},
    {id:'x3',score:70,at:now-5*86400000,partial:false,abandoned:false},
    {id:'x4',score:74,at:now-3*86400000,partial:false,abandoned:false},
    {id:'x5',score:78,at:now-2*86400000,partial:false,abandoned:false},
    {id:'x6',score:82,at:now-1*86400000,partial:false,abandoned:false}
  ]
};
const before=JSON.stringify(state),x=A.analyze(state,{now}),issues=[];
const assert=(v,type,extra={})=>{if(!v)issues.push({type,...extra});else console.log('PASS',type)};
assert(JSON.stringify(state)===before,'analytics is read-only');
assert(x.summary.attempts===8&&x.summary.correct===5&&x.summary.accuracy===63,'summary accuracy is deterministic',x.summary);
assert(x.summary.sureWrong===2&&x.summary.unresolved===2&&x.summary.overdue===1,'confidence and unresolved wrong counts are correct',x.summary);
assert(x.subjects.some(r=>r.key==='fire')&&x.subjects.some(r=>r.key==='ems'),'subject analytics covers fire and EMS');
assert(x.scopes.length>=2&&x.concepts.length>=2,'scope and concept weakness analytics are populated');
assert(x.skills.length>=1&&x.difficulty.length>=1&&x.confidence.length>=2,'skill difficulty and confidence lanes are populated');
assert(x.trend.recentAvg===78&&x.trend.prevAvg===67&&x.trend.delta===11,'exam trend compares recent three vs prior three',x.trend);
assert(x.concepts[0].unresolved>=1&&x.concepts[0].weakness>0,'unresolved wrongs increase concept priority',x.concepts[0]);
assert(x.priorities.some(r=>r.kind==='confidence'&&r.id==='sure-wrong'),'sure-wrong priority is surfaced');
assert(x.recommendedConceptIds.includes(weakQ.conceptId),'weak concept is included in adaptive training recommendations');
assert(A.policy.localOnly===true&&A.policy.realMockUnchanged===true&&A.policy.adaptiveTrainingOnly===true,'analytics policy preserves real-mock boundary');
const empty=A.analyze({answerEvents:[],wrongs:[],examHistory:[]},{now});
assert(empty.dataLevel==='없음'&&empty.summary.attempts===0&&empty.summary.recentExamAvg===null,'empty-state analytics stays explicit and non-invented');

const summary={version:'119-v61-performance-weakness-audit-v1',attempts:x.summary.attempts,accuracy:x.summary.accuracy,sureWrong:x.summary.sureWrong,weakConcepts:x.concepts.length,scopes:x.scopes.length,skills:x.skills.length,priorities:x.priorities.length,trendDelta:x.trend.delta,issues:issues.length};
console.log('V61_PERFORMANCE_WEAKNESS_SUMMARY',JSON.stringify(summary,null,2));
if(issues.length){console.error('V61_PERFORMANCE_WEAKNESS_ISSUES',JSON.stringify(issues,null,2));throw Error('V61_PERFORMANCE_WEAKNESS_FAILED '+JSON.stringify({issues:issues.length,first:issues[0]}))}
console.log('V61_PERFORMANCE_WEAKNESS_AUDIT_SUCCESS');
