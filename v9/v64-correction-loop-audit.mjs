import fs from 'node:fs';
import vm from 'node:vm';

await import('./question-contract-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions?.length||!V?.curriculum?.concepts?.length)throw Error('V64_RUNTIME_UNAVAILABLE');
vm.runInThisContext(fs.readFileSync(new URL('./analytics-v61-119.js',import.meta.url),'utf8'),{filename:'analytics-v61-119.js'});
vm.runInThisContext(fs.readFileSync(new URL('./correction-loop-v64-119.js',import.meta.url),'utf8'),{filename:'correction-loop-v64-119.js'});
const C=V.CorrectionLoopV64;if(!C?.summary)throw Error('V64_MODULE_UNAVAILABLE');

const groups=new Map;
for(const q of V.questions){if(V.QuestionQuality119?.isExamStyle?.(q)===false)continue;const arr=groups.get(q.conceptId)||[];arr.push(q);groups.set(q.conceptId,arr)}
const pair=[...groups.entries()].find(([,rows])=>rows.length>=5);
if(!pair)throw Error('V64_FIVE_QUESTION_CONCEPT_UNAVAILABLE');
const [conceptId,qs]=pair,now=Date.now(),base=qs.slice(0,5),state={answerEvents:[],wrongs:[],examHistory:[],todayGoal:{date:new Date().toISOString().slice(0,10),ids:[],done:{},customized:false}};
for(let i=0;i<3;i++){const q=base[i];state.answerEvents.push({eventId:'v64-seed-'+i,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId,scopeId:q.scopeId,subject:q.subject,correct:i===2,confidence:i<2?'sure':'maybe',at:now-(3-i)*60000})}
state.wrongs.push({id:'v64-w1',questionId:base[0].id,masterQuestionId:base[0].id,familyId:base[0].familyId||base[0].id,conceptId,scopeId:base[0].scopeId,confidence:'sure',due:now-1000,resolved:false,wrongCount:2,recoveryCorrect:0,lastWrongAt:now-180000});

const issues=[],assert=(v,m,x={})=>{if(!v)issues.push({type:m,...x});else console.log('PASS',m)};
let row=C.statusFor(conceptId,state,{now});
assert(row?.active===true,'weak concept enters correction loop',row||{});
assert(row.unresolved===1&&row.sureWrong>=1,'unresolved and sure-wrong raise correction priority',row);
assert(C.policy.targetQuestions===5&&C.policy.passCorrect===4&&C.policy.passSureCorrect===3,'correction completion policy is explicit',C.policy);
assert(C.policy.realMockUnchanged===true&&C.policy.adaptiveTrainingOnly===true,'real mock remains unchanged',C.policy);
assert(C.syncTodayGoal(state,state.todayGoal,{limit:3})===true,'active weakness auto-links into today goal');
assert(state.todayGoal.ids[0]===conceptId&&state.todayGoal.v64AutoIds.includes(conceptId),'auto-linked weakness is pinned at today-goal front',state.todayGoal);
assert(C.dismissTodayGoal(state,state.todayGoal,conceptId)===true,'learner can dismiss auto-linked weakness for today');
state.todayGoal.ids=state.todayGoal.ids.filter(x=>x!==conceptId);
C.syncTodayGoal(state,state.todayGoal,{limit:3});
assert(!state.todayGoal.ids.includes(conceptId),'dismissed weakness does not immediately reappear');
C.restoreTodayGoal(state.todayGoal,conceptId);C.syncTodayGoal(state,state.todayGoal,{limit:3});
assert(state.todayGoal.ids.includes(conceptId),'restored weakness can auto-link again');

state.wrongs[0].resolved=true;state.wrongs[0].resolvedAt=now;
state.answerEvents=state.answerEvents.concat(base.map((q,i)=>({eventId:'v64-pass-'+i,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId,scopeId:q.scopeId,subject:q.subject,correct:i!==4,confidence:i<3?'sure':'maybe',at:now+(i+1)*60000})));
row=C.statusFor(conceptId,state,{now:now+10*60000});
assert(row.completed===true&&row.active===false,'4-of-5 plus three sure and zero unresolved completes correction',row);
C.syncTodayGoal(state,state.todayGoal,{limit:3});
assert(state.todayGoal.done[conceptId]===true,'completed auto-linked weakness is marked done in today goal',state.todayGoal);

console.log('V64_CORRECTION_LOOP_SUMMARY',JSON.stringify({conceptId,active:C.summary(state,{now:now+10*60000}).active,completed:C.summary(state,{now:now+10*60000}).completed,issues:issues.length},null,2));
if(issues.length){console.error('V64_CORRECTION_LOOP_ISSUES',JSON.stringify(issues,null,2));throw Error('V64_CORRECTION_LOOP_FAILED '+JSON.stringify(issues[0]))}
console.log('V64_CORRECTION_LOOP_AUDIT_SUCCESS');
