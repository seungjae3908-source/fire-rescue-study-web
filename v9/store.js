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
const defaultState=ownerId=>({schema:9,ownerId,page:'home',subject:'fire',scopeId:'F01',conceptId:'F01-C01',studyTab:'core',outline:false,lastStudyBySubject:{fire:null,ems:null},profile:{examYear:'2027',examDate:'',dailyMinutes:40,level:'처음 시작'},answers:{},confidence:{},answerEvents:[],wrongs:[],reviewSchedule:{},progress:{},notes:[],examHistory:[],studySessions:[],chat:[],todayGoal:null,settings:{cloudSync:false,syncOriginalDocuments:false},migrations:{},updatedAt:Date.now()});
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
function mergeState(a,b,newOwner){const out={...defaultState(newOwner),...a,...b,ownerId:newOwner};out.lastStudyBySubject={fire:a?.lastStudyBySubject?.fire||null,ems:a?.lastStudyBySubject?.ems||null};for(const subject of ['fire','ems']){const incoming=b?.lastStudyBySubject?.[subject];if(incoming?.conceptId)out.lastStudyBySubject[subject]=incoming};out.answers={...(a?.answers||{}),...(b?.answers||{})};out.confidence={...(a?.confidence||{}),...(b?.confidence||{})};out.progress={...(a?.progress||{}),...(b?.progress||{})};out.reviewSchedule={...(a?.reviewSchedule||{}),...(b?.reviewSchedule||{})};out.answerEvents=mergeArrays(a?.answerEvents,b?.answerEvents,'eventId');out.wrongs=mergeArrays(a?.wrongs,b?.wrongs,'id');out.notes=mergeArrays(a?.notes,b?.notes,'id');out.examHistory=mergeArrays(a?.examHistory,b?.examHistory,'id');out.studySessions=mergeArrays(a?.studySessions,b?.studySessions,'id');out.chat=mergeArrays(a?.chat,b?.chat,'id');return out}
function switchOwner(id){ownerId=id||gid();state=jget(key(ownerId),defaultState(ownerId));return state}
function migrateGuestToUser(userId){const guest=jget(key(gid()),defaultState(gid())),user=jget(key(userId),defaultState(userId));state=mergeState(user,guest,userId);ownerId=userId;state.migrations={...(state.migrations||{}),guestImportedAt:Date.now()};save();return state}
function legacy(){const guestKey=key(gid()),cur=jget(guestKey,defaultState(gid()));if(cur.migrations?.rescue6)return false;const oldKeys=['profile','notes','generated','answers','conf','wrongs','examHistory','chat'];const has=oldKeys.some(k=>localStorage.getItem(LEGACY+k)!==null);if(!has){cur.migrations.rescue6='none';jset(guestKey,cur);if(ownerId===gid())state=cur;return false}const old=Object.fromEntries(oldKeys.map(k=>[k,jget(LEGACY+k,k==='answers'||k==='conf'?{}:[])]));cur.profile={...cur.profile,...(old.profile||{})};cur.notes=mergeArrays(cur.notes,old.notes,'id');cur.answers={...cur.answers,...(old.answers||{})};cur.confidence={...cur.confidence,...(old.conf||{})};cur.wrongs=mergeArrays(cur.wrongs,(old.wrongs||[]).map(w=>({...w,id:w.id||'legacy-w-'+Math.random().toString(36).slice(2)})),'id');cur.examHistory=mergeArrays(cur.examHistory,old.examHistory,'id');cur.chat=mergeArrays(cur.chat,(old.chat||[]).map((x,i)=>({...x,id:x.id||`legacy-chat-${i}`})),'id');Object.entries(old.answers||{}).forEach(([questionId,choice])=>{if(!cur.answerEvents.some(e=>e.questionId===questionId&&e.legacy)){const q=V.questionById?.[questionId];cur.answerEvents.push({eventId:'legacy-'+questionId,questionId,conceptId:q?.conceptId||'',subject:q?.subject||'',correct:q?Number(choice)===q.a:false,choice:Number(choice),confidence:old.conf?.[questionId]||'none',responseMs:null,at:Date.now(),legacy:true})}});cur.migrations.rescue6=Date.now();jset(guestKey,cur);if(ownerId===gid())state=cur;return true}
legacy();
V.Store={get state(){return state},get ownerId(){return ownerId},get guestId(){return gid()},save,switchOwner,migrateGuestToUser,mergeState,resetOwner(){state=defaultState(ownerId);save()},update(fn){const r=fn(state)||state;state=r;save();return state},setView(patch){Object.assign(state,patch);save()},export(){return JSON.stringify({schema:9,exportedAt:Date.now(),state},null,2)},import(raw){const data=typeof raw==='string'?JSON.parse(raw):raw;if(!data?.state)throw Error('INVALID_BACKUP');state=mergeState(state,data.state,ownerId);save();return state},storagePolicy:{version:'quota-v1',limits:STORAGE_LIMITS,compactOnQuotaOnly:true,preserveProgress:true,preserveNotes:true,preserveUnresolvedWrongs:true}};
})();
