/* V69 startup-minimal runtime: state + mastery */
/* --- store.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const ROOT='aitutor9:';const LEGACY='rescue6:';
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}};
const jset=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const STORAGE_LIMITS=Object.freeze({answerEvents:6000,examHistory:120,studySessions:1000,resolvedWrongs:500,chat:300});
const stamp=x=>Math.max(Number(x?.updatedAt)||0,Number(x?.at)||0,Number(x?.resolvedAt)||0,Number(x?.lastWrongAt)||0,Number(x?.createdAt)||0,Number(x?.startedAt)||0,Number(x?.endedAt)||0);
const recent=(rows,n)=>[...(rows||[])].sort((a,b)=>stamp(b)-stamp(a)).slice(0,n).sort((a,b)=>stamp(a)-stamp(b));
function compactForQuota(s){
  const unresolved=(s.wrongs||[]).filter(x=>!x?.resolved),resolved=recent((s.wrongs||[]).filter(x=>x?.resolved),STORAGE_LIMITS.resolvedWrongs);
  s.answerEvents=recent(s.answerEvents,STORAGE_LIMITS.answerEvents);
  s.examHistory=recent(s.examHistory,STORAGE_LIMITS.examHistory);
  s.studySessions=recent(s.studySessions,STORAGE_LIMITS.studySessions);
  s.chat=recent(s.chat,STORAGE_LIMITS.chat);
  s.wrongs=[...unresolved,...resolved];
  s.migrations={...(s.migrations||{}),storageCompactedAt:Date.now(),storageCompactionVersion:'quota-v1'};
  return s
}
const quotaError=e=>e?.name==='QuotaExceededError'||e?.name==='NS_ERROR_DOM_QUOTA_REACHED'||e?.code===22||e?.code===1014;
const gid=()=>{let id=localStorage.getItem(ROOT+'guestId');if(!id){id='guest-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(ROOT+'guestId',id)}return id};
const defaultState=ownerId=>({schema:9,ownerId,page:'home',subject:'fire',scopeId:'F01',conceptId:'F01-C01',studyTab:'core',outline:false,lastStudyBySubject:{fire:null,ems:null},mockRounds:{real:{low:{},mid:{},high:{}},practice:{low:{},mid:{},high:{}}},profile:{examYear:'2027',examDate:'',dailyMinutes:40,level:'처음 시작'},answers:{},confidence:{},answerEvents:[],wrongs:[],reviewSchedule:{},progress:{},notes:[],examHistory:[],studySessions:[],chat:[],todayGoal:null,settings:{cloudSync:false,syncOriginalDocuments:false},migrations:{},updatedAt:Date.now()});
const key=id=>ROOT+'state:'+id;
let ownerId=gid();let state=jget(key(ownerId),defaultState(ownerId));
function save(){
  state.updatedAt=Date.now();
  try{jset(key(ownerId),state)}
  catch(err){
    if(!quotaError(err))throw err;
    compactForQuota(state);
    state.updatedAt=Date.now();
    jset(key(ownerId),state)
  }
  return state
}
function mergeArrays(a,b,id='id'){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>m.set(x?.[id]||JSON.stringify(x),x));return [...m.values()]}
function mergeState(a,b,newOwner){const out={...defaultState(newOwner),...a,...b,ownerId:newOwner};out.lastStudyBySubject={fire:a?.lastStudyBySubject?.fire||null,ems:a?.lastStudyBySubject?.ems||null};for(const subject of ['fire','ems']){const incoming=b?.lastStudyBySubject?.[subject];if(incoming?.conceptId)out.lastStudyBySubject[subject]=incoming};out.mockRounds={real:{low:{...(a?.mockRounds?.real?.low||{}),...(b?.mockRounds?.real?.low||{})},mid:{...(a?.mockRounds?.real?.mid||{}),...(b?.mockRounds?.real?.mid||{})},high:{...(a?.mockRounds?.real?.high||{}),...(b?.mockRounds?.real?.high||{})}},practice:{low:{...(a?.mockRounds?.practice?.low||{}),...(b?.mockRounds?.practice?.low||{})},mid:{...(a?.mockRounds?.practice?.mid||{}),...(b?.mockRounds?.practice?.mid||{})},high:{...(a?.mockRounds?.practice?.high||{}),...(b?.mockRounds?.practice?.high||{})}}};out.answers={...(a?.answers||{}),...(b?.answers||{})};out.confidence={...(a?.confidence||{}),...(b?.confidence||{})};out.progress={...(a?.progress||{}),...(b?.progress||{})};out.reviewSchedule={...(a?.reviewSchedule||{}),...(b?.reviewSchedule||{})};out.answerEvents=mergeArrays(a?.answerEvents,b?.answerEvents,'eventId');out.wrongs=mergeArrays(a?.wrongs,b?.wrongs,'id');out.notes=mergeArrays(a?.notes,b?.notes,'id');out.examHistory=mergeArrays(a?.examHistory,b?.examHistory,'id');out.studySessions=mergeArrays(a?.studySessions,b?.studySessions,'id');out.chat=mergeArrays(a?.chat,b?.chat,'id');return out}
function switchOwner(id){ownerId=id||gid();state=jget(key(ownerId),defaultState(ownerId));return state}
function migrateGuestToUser(userId){const guest=jget(key(gid()),defaultState(gid())),user=jget(key(userId),defaultState(userId));state=mergeState(user,guest,userId);ownerId=userId;state.migrations={...(state.migrations||{}),guestImportedAt:Date.now()};save();return state}
function legacy(){const guestKey=key(gid()),cur=jget(guestKey,defaultState(gid()));if(cur.migrations?.rescue6)return false;const oldKeys=['profile','notes','generated','answers','conf','wrongs','examHistory','chat'];const has=oldKeys.some(k=>localStorage.getItem(LEGACY+k)!==null);if(!has){cur.migrations.rescue6='none';jset(guestKey,cur);if(ownerId===gid())state=cur;return false}const old=Object.fromEntries(oldKeys.map(k=>[k,jget(LEGACY+k,k==='answers'||k==='conf'?{}:[])]));cur.profile={...cur.profile,...(old.profile||{})};cur.notes=mergeArrays(cur.notes,old.notes,'id');cur.answers={...cur.answers,...(old.answers||{})};cur.confidence={...cur.confidence,...(old.conf||{})};cur.wrongs=mergeArrays(cur.wrongs,(old.wrongs||[]).map(w=>({...w,id:w.id||'legacy-w-'+Math.random().toString(36).slice(2)})),'id');cur.examHistory=mergeArrays(cur.examHistory,old.examHistory,'id');cur.chat=mergeArrays(cur.chat,(old.chat||[]).map((x,i)=>({...x,id:x.id||`legacy-chat-${i}`})),'id');Object.entries(old.answers||{}).forEach(([questionId,choice])=>{if(!cur.answerEvents.some(e=>e.questionId===questionId&&e.legacy)){const q=V.questionById?.[questionId];cur.answerEvents.push({eventId:'legacy-'+questionId,questionId,conceptId:q?.conceptId||'',subject:q?.subject||'',correct:q?Number(choice)===q.a:false,choice:Number(choice),confidence:old.conf?.[questionId]||'none',responseMs:null,at:Date.now(),legacy:true})}});cur.migrations.rescue6=Date.now();jset(guestKey,cur);if(ownerId===gid())state=cur;return true}
legacy();
V.Store={get state(){return state},get ownerId(){return ownerId},get guestId(){return gid()},save,switchOwner,migrateGuestToUser,mergeState,resetOwner(){state=defaultState(ownerId);save()},update(fn){const r=fn(state)||state;state=r;save();return state},setView(patch){Object.assign(state,patch);save()},export(){return JSON.stringify({schema:9,exportedAt:Date.now(),state},null,2)},import(raw){const data=typeof raw==='string'?JSON.parse(raw):raw;if(!data?.state)throw Error('INVALID_BACKUP');state=mergeState(state,data.state,ownerId);save();return state},storagePolicy:{version:'quota-v1',limits:STORAGE_LIMITS,compactOnQuotaOnly:true,preserveProgress:true,preserveNotes:true,preserveUnresolvedWrongs:true}};
})();

;
;

/* --- mastery.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},day=86400000,clamp=n=>Math.max(0,Math.min(100,n));
const delta=(o,f,r)=>{let d=o?({sure:12,maybe:9,none:6}[f]||7):({sure:-22,maybe:-14,none:-8}[f]||-10);if(o&&r&&r<15000)d++;if(o&&r&&r>120000)d-=2;return d};
const intervalFor=mastery=>mastery>=90?30:mastery>=75?14:mastery>=60?7:mastery>=40?3:1;
const defaults=id=>({conceptId:id,mastery:35,attempts:0,correct:0,streak:0,dangerousWrong:0,lapses:0,reviews:0,lastStudy:0,lastCorrect:0,nextReview:0,lastIntervalDays:0});
function ensure(id){const s=V.Store.state,p=s.progress[id]||(s.progress[id]=defaults(id));for(const[k,v]of Object.entries(defaults(id)))if(p[k]===undefined)p[k]=v;return p}
function nextInterval(p,f='none',q='answer'){const b=intervalFor(p.mastery),s=Math.min(1.8,1+Math.max(0,(p.streak||0)-1)*.15),c=q==='easy'?1.25:q==='good'?1.05:f==='sure'?1.15:f==='maybe'?1:.8,l=1/(1+Math.min(4,p.lapses||0)*.08);return Math.max(1,Math.min(45,Math.round(b*s*c*l)))}
function schedule(id,ok,f='none',q='answer'){const s=V.Store.state,p=ensure(id),d=ok?nextInterval(p,f,q):0,n=Date.now();p.lastIntervalDays=d;p.nextReview=ok?n+d*day:n;s.reviewSchedule[id]={conceptId:id,due:p.nextReview,intervalDays:d,mastery:p.mastery,updatedAt:n,version:'v2'};return d}
function requiredRecoveries(w){return(w?.wrongCount||0)>=2||w?.confidence==='sure'?2:1}
function recordAnswer(q,c,f='none',r=null){if(!q)return null;const s=V.Store.state,correct=Number(c)===q.a,p=ensure(q.conceptId),now=Date.now();p.attempts++;if(correct){p.correct++;p.streak++;p.lastCorrect=now}else{p.streak=0;p.lapses=(p.lapses||0)+1;if(f==='sure')p.dangerousWrong=(p.dangerousWrong||0)+1}p.mastery=clamp((p.mastery||35)+delta(correct,f,r));p.lastStudy=now;const intervalDays=schedule(q.conceptId,correct,f,'answer');s.answers[q.id]=Number(c);s.confidence[q.id]=f;const event={eventId:crypto.randomUUID?crypto.randomUUID():'evt-'+now+'-'+Math.random(),questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.masterQuestionId||q.id,variantKind:q.variantKind||'base',conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,correct,choice:Number(c),confidence:f,responseMs:r,intervalDays,at:now};s.answerEvents.push(event);let w=s.wrongs.find(x=>x.questionId===q.id&&!x.resolved);if(!correct){if(!w){w={id:crypto.randomUUID?crypto.randomUUID():'w-'+now,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.masterQuestionId||q.id,questionSnapshot:q.variantGenerated?(V.VariantEngine119?.snapshot?.(q)||null):null,conceptId:q.conceptId,scopeId:q.scopeId,confidence:f,due:now,intervalDays:0,resolved:false,createdAt:now,lastWrongAt:now,wrongCount:1,recoveryCorrect:0,requiredRecoveries:f==='sure'?2:1};s.wrongs.push(w)}else{w.confidence=f;w.masterQuestionId=q.masterQuestionId||w.masterQuestionId||q.id;w.familyId=q.familyId||w.familyId||q.id;if(q.variantGenerated)w.questionSnapshot=V.VariantEngine119?.snapshot?.(q)||w.questionSnapshot;w.due=now;w.lastWrongAt=now;w.wrongCount=(w.wrongCount||1)+1;w.recoveryCorrect=0;w.requiredRecoveries=requiredRecoveries(w)}}else if(w){w.recoveryCorrect=(w.recoveryCorrect||0)+1;w.requiredRecoveries=requiredRecoveries(w);if(w.recoveryCorrect>=w.requiredRecoveries){w.resolved=true;w.resolvedAt=now}else w.due=now+day}if(s.todayGoal?.date===localDayKey())V.CorrectionLoopV64?.syncTodayGoal?.(s,s.todayGoal,{limit:3});V.Store.save();return{correct,event,progress:p,wrong:w||null}}
function markReviewed(id,q='good'){const p=ensure(id),s=V.Store.state,n=Date.now();p.reviews=(p.reviews||0)+1;p.lastStudy=n;if(q==='again'){p.mastery=clamp(p.mastery-8);p.streak=0;p.lapses=(p.lapses||0)+1}else if(q==='good'){p.mastery=clamp(p.mastery+4);p.streak=(p.streak||0)+1}else if(q==='easy'){p.mastery=clamp(p.mastery+7);p.streak=(p.streak||0)+1}schedule(id,q!=='again',q==='easy'?'sure':q==='good'?'maybe':'none',q);V.Store.save();return p}
function statsFor(id){const r=V.Store.state.progress[id],p=r?{...defaults(id),...r}:{...defaults(id),mastery:0},n=Date.now(),accuracy=p.attempts?Math.round(p.correct/p.attempts*100):null,ageDays=p.lastStudy?Math.max(0,(n-p.lastStudy)/day):null,overdueDays=p.nextReview?Math.max(0,(n-p.nextReview)/day):0;let retentionEstimate=p.attempts?p.mastery:0;if(p.attempts&&p.lastStudy&&p.lastIntervalDays>0){const x=ageDays/Math.max(1,p.lastIntervalDays);retentionEstimate=Math.round(clamp(p.mastery*Math.exp(-.35*Math.max(0,x-1))))}return{...p,accuracy,ageDays,overdueDays,retentionEstimate,overdue:!!p.nextReview&&p.nextReview<=n,questions:V.questionsForConcept?.(id)?.length||0}}
function riskFor(id){const s=V.Store.state,p=statsFor(id),w=s.wrongs.filter(x=>!x.resolved&&x.conceptId===id),d=w.filter(x=>x.confidence==='sure').length;let score=0;const r=[];if(d){score+=160+d*15;r.push('확신 오답')}if(w.length){score+=Math.min(80,w.length*16);r.push('오답 복구')}if(p.overdue){score+=100+Math.min(80,Math.ceil(p.overdueDays)*8);r.push('복습 지연')}if(p.attempts&&p.mastery<60){score+=80-p.mastery;r.push('취약개념')}if(p.attempts>=3&&p.accuracy<70){score+=Math.round((70-p.accuracy)*.8);r.push('정답률 보강')}if(p.lapses)score+=Math.min(30,p.lapses*5);if(!p.attempts){score+=20;r.push('신규 학습')}if(p.ageDays!=null&&p.ageDays>30){score+=Math.min(30,Math.round((p.ageDays-30)/3));r.push('장기 미학습')}return{score,reason:r.slice(0,2).join(' + ')||'신규 학습',wrong:w.length,danger:d,progress:p}}
function examPhase(){const m=V.OfficialMonitor119?.summary?.()||{},y=+(m.targetExamYear||V.Store.state.profile?.examYear||0),x=(m.items||[]).filter(x=>x?.schedule?.writtenExam&&(x.targetYearMatch===true||y&&(+x.noticeYear===y||+x.explicitYear===y))).sort((a,b)=>(a.changeState==='updated'?-1:0)-(b.changeState==='updated'?-1:0)||({change_notice:1,exam_schedule:2,recruitment_notice:3}[a.kind]||4)-({change_notice:1,exam_schedule:2,recruitment_notice:3}[b.kind]||4)||String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')))[0],s=String(x?.schedule?.writtenExam||''),a=s.match(/^(20\d{2})-(\d{2})-(\d{2})$/);if(!a)return{phase:'normal',daysLeft:null,writtenExam:''};const t=Date.UTC(+a[1],+a[2]-1,+a[3]),d=new Date(t);if(d.getUTCFullYear()!=+a[1]||d.getUTCMonth()!=+a[2]-1||d.getUTCDate()!=+a[3])return{phase:'normal',daysLeft:null,writtenExam:''};const k=new Date(Date.now()+324e5),n=Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate()),z=Math.round((t-n)/day);return{phase:z<0?'normal':z<=1?'D1':z<=7?'D7':z<=30?'D30':'normal',daysLeft:z,writtenExam:s}}
function todayPlan(limit=8){const exam=examPhase(),weight={D1:3,D7:2,D30:1}[exam.phase]||0;return V.curriculum.concepts.map(concept=>{const risk=riskFor(concept.id),p=risk.progress,phaseBoost=weight*((risk.danger?40:0)+(risk.wrong?30:0)+(p.overdue?25:0)+(p.attempts?Math.max(0,70-p.retentionEstimate):exam.phase==='D1'?-20:15));return{concept,...risk,score:risk.score+phaseBoost,phaseBoost,examPhase:exam.phase}}).sort((a,b)=>b.score-a.score||(a.progress.lastStudy||0)-(b.progress.lastStudy||0)||a.concept.id.localeCompare(b.concept.id)).slice(0,limit)}
function localDayKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),x=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${x}`}
function dayStartMs(){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}
function ensureDailyGoal(limit=6){
  const s=V.Store.state,key=localDayKey(),valid=new Set(V.curriculum.concepts.map(x=>x.id));let changed=false,g=s.todayGoal;
  if(!g||g.date!==key){
    g={date:key,ids:todayPlan(limit).map(x=>x.concept.id),done:{},customized:false,createdAt:Date.now()};s.todayGoal=g;changed=true
  }else{
    const ids=[...new Set((g.ids||[]).filter(id=>valid.has(id)))];
    if(JSON.stringify(ids)!==JSON.stringify(g.ids||[])){g.ids=ids;changed=true}
    if(!g.done||typeof g.done!=='object'){g.done={};changed=true}
    if(!g.ids.length&&!g.customized){g.ids=todayPlan(limit).map(x=>x.concept.id);changed=true}
  }
  if(V.CorrectionLoopV64?.syncTodayGoal?.(s,g,{limit:3}))changed=true;
  if(changed)V.Store.save();return g
}
function dailyGoalRows(limit=6){
  const g=ensureDailyGoal(limit),rank=new Map(todayPlan(V.curriculum.concepts.length).map(x=>[x.concept.id,x]));
  return (g.ids||[]).map(id=>{const concept=V.curriculum.byId[id],risk=rank.get(id)||riskFor(id),correction=V.CorrectionLoopV64?.statusFor?.(id,V.Store.state),auto=correction?.active?false:(risk?.progress?.lastStudy||0)>=dayStartMs(),reason=correction?.active?('취약점 교정 · '+correction.recentCorrect+'/'+Math.max(1,correction.recentAttempts)+' 정답 · 확실 '+correction.sureCorrect):correction?.completed?'취약점 교정 완료':risk?.reason||'직접 추가';return concept?{concept,reason,done:correction?.completed||!!g.done?.[id]||auto,manualDone:!!g.done?.[id],correction:correction||null}:null}).filter(Boolean)
}
function dailyGoalAdd(id){const c=V.curriculum.byId[id];if(!c)return false;const g=ensureDailyGoal();V.CorrectionLoopV64?.restoreTodayGoal?.(g,id);if(!g.ids.includes(id))g.ids.push(id);g.customized=true;g.updatedAt=Date.now();V.Store.save();return true}
function dailyGoalRemove(id){const g=ensureDailyGoal();V.CorrectionLoopV64?.dismissTodayGoal?.(V.Store.state,g,id);g.ids=(g.ids||[]).filter(x=>x!==id);if(g.done)delete g.done[id];g.customized=true;g.updatedAt=Date.now();V.Store.save();return true}
function dailyGoalToggle(id){const g=ensureDailyGoal();if(!g.ids.includes(id))return false;g.done[id]=!g.done[id];g.updatedAt=Date.now();V.Store.save();return g.done[id]}
function dailyGoalReset(limit=6){const s=V.Store.state;s.todayGoal={date:localDayKey(),ids:todayPlan(limit).map(x=>x.concept.id),done:{},customized:false,createdAt:Date.now(),updatedAt:Date.now()};V.CorrectionLoopV64?.syncTodayGoal?.(s,s.todayGoal,{limit:3});V.Store.save();return s.todayGoal}
function dailyGoalSummary(limit=6){
  const rows=dailyGoalRows(limit),done=rows.filter(x=>x.done).length,total=rows.length,percent=total?Math.round(done/total*100):0,fire=rows.filter(x=>x.concept.subject==='fire'),ems=rows.filter(x=>x.concept.subject==='ems');
  return{rows,done,total,percent,remaining:Math.max(0,total-done),fire:{done:fire.filter(x=>x.done).length,total:fire.length},ems:{done:ems.filter(x=>x.done).length,total:ems.length}}
}
function dailyGoalMessage(summary=dailyGoalSummary()){
  if(!summary.total)return'오늘 목표를 직접 추가해 학습 순서를 정해보세요.';
  if(summary.percent>=100)return'오늘의 목표를 모두 마쳤습니다. 오답과 ★ 합격노트를 짧게 복습하면 좋습니다.';
  if(summary.percent>=70)return`거의 끝났습니다. 남은 ${summary.remaining}개를 마치면 오늘 목표 달성입니다.`;
  if(summary.percent>=35)return`오늘 목표 ${summary.done}/${summary.total} 완료. 지금 흐름을 이어가세요.`;
  return`오늘 목표는 ${summary.total}개입니다. 가장 중요한 한 개념부터 시작하세요.`
}
function readiness(){const cs=V.curriculum.concepts,s=V.Store.state,studied=cs.filter(c=>(s.progress[c.id]?.attempts||0)>0),covered=studied.length,questionConcepts=new Set(V.questions.filter(q=>q.grade==='A'||q.grade==='B').map(q=>q.conceptId)),retention=studied.length?Math.round(studied.reduce((a,c)=>a+statsFor(c.id).retentionEstimate,0)/studied.length):0,dangerous=s.wrongs.filter(w=>!w.resolved&&w.confidence==='sure').length,recoveryPending=s.wrongs.filter(w=>!w.resolved&&(w.recoveryCorrect||0)<requiredRecoveries(w)).length,overdue=Object.values(s.reviewSchedule).filter(r=>r.due<=Date.now()).length,mock=V.examReadiness(),exam=examPhase();return{scopeCoverage:Math.round(covered/cs.length*100),covered,total:cs.length,verifiedQuestionCoverage:Math.round(questionConcepts.size/cs.length*100),questionConcepts:questionConcepts.size,retention,dangerous,recoveryPending,overdue,mock,examPhase:exam.phase,examDaysLeft:exam.daysLeft}}
function conceptPriority(id){return todayPlan(V.curriculum.concepts.length).findIndex(x=>x.concept.id===id)}
V.Mastery={version:'119-mastery-v2',ensure,recordAnswer,markReviewed,statsFor,todayPlan,readiness,conceptPriority,intervalFor,riskFor,requiredRecoveries,examPhase,ensureDailyGoal,dailyGoalRows,dailyGoalAdd,dailyGoalRemove,dailyGoalToggle,dailyGoalReset,dailyGoalSummary,dailyGoalMessage,localDayKey};
})();
;
;
