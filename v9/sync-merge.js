'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const Store=V.Store;
if(!Store)return;
const clone=x=>{try{return structuredClone(x)}catch{return JSON.parse(JSON.stringify(x??null))}};
const DEFAULT_PROFILE={examYear:'2027',examDate:'',dailyMinutes:40,level:'처음 시작',updatedAt:0};
const num=x=>Number.isFinite(Number(x))?Number(x):0;
const stamp=x=>Math.max(
  num(x?.updatedAt),num(x?.at),num(x?.answeredAt),num(x?.lastStudy),num(x?.nextReview),
  num(x?.lastWrongAt),num(x?.resolvedAt),num(x?.createdAt),num(x?.startedAt),num(x?.endedAt)
);
function profileCustom(p){if(!p)return false;return !!(
  String(p.examYear||'2027')!=='2027'||String(p.examDate||'')||num(p.dailyMinutes||40)!==40||
  String(p.level||'처음 시작')!=='처음 시작'||num(p.updatedAt)>0
)}
function pickProfile(left,right,preferRight=false){const l={...DEFAULT_PROFILE,...(left||{})},r={...DEFAULT_PROFILE,...(right||{})};
  if(preferRight&&profileCustom(r))return r;
  const lc=profileCustom(l),rc=profileCustom(r);if(!lc&&rc)return r;if(lc&&!rc)return l;if(!lc&&!rc)return l;
  return num(r.updatedAt)>=num(l.updatedAt)?r:l;
}
function mergeList(left,right,key='id'){const m=new Map();for(const row of [...(left||[]),...(right||[])]){if(!row)continue;const id=row[key]||JSON.stringify(row);const prev=m.get(id);if(!prev||stamp(row)>=stamp(prev))m.set(id,clone(row))}return[...m.values()]}
function mergeMap(left,right){const out={...(left||{})};for(const [k,v] of Object.entries(right||{})){const prev=out[k];if(!prev||stamp(v)>=stamp(prev))out[k]=clone(v)}return out}
function mergeStampedObject(left,right){const l=left||{},r=right||{};if(!Object.keys(l).length)return clone(r);if(!Object.keys(r).length)return clone(l);return stamp(r)>=stamp(l)?{...clone(l),...clone(r)}:{...clone(r),...clone(l)}}
function latestAnswers(events,answers,confidence){const a={...(answers||{})},c={...(confidence||{})};for(const e of [...(events||[])].sort((x,y)=>num(x.at)-num(y.at))){if(!e?.questionId)continue;if(e.choice!==undefined&&e.choice!==null)a[e.questionId]=Number(e.choice);if(e.confidence)c[e.questionId]=e.confidence}return{answers:a,confidence:c}}
function mergeStateSafe(left,right,ownerId,{preferRightProfile=false}={}){left=clone(left||{});right=clone(right||{});const out={...left,ownerId};
  out.profile=pickProfile(left.profile,right.profile,preferRightProfile);
  out.progress=mergeMap(left.progress,right.progress);
  out.reviewSchedule=mergeMap(left.reviewSchedule,right.reviewSchedule);
  out.answerEvents=mergeList(left.answerEvents,right.answerEvents,'eventId');
  const latest=latestAnswers(out.answerEvents,{...(left.answers||{}),...(right.answers||{})},{...(left.confidence||{}),...(right.confidence||{})});out.answers=latest.answers;out.confidence=latest.confidence;
  out.wrongs=mergeList(left.wrongs,right.wrongs,'id');
  out.notes=mergeList(left.notes,right.notes,'id');
  out.examHistory=mergeList(left.examHistory,right.examHistory,'id');
  out.studySessions=mergeList(left.studySessions,right.studySessions,'id');
  out.chat=mergeList(left.chat,right.chat,'id');
  out.settings={...(left.settings||{}),...(right.settings||{})};
  out.tutorPreferences=mergeStampedObject(left.tutorPreferences,right.tutorPreferences);
  out.migrations={...(left.migrations||{}),...(right.migrations||{})};
  out.updatedAt=Math.max(num(left.updatedAt),num(right.updatedAt),Date.now());
  return out;
}
function replaceCurrent(next){Store.update(s=>{for(const k of Object.keys(s))delete s[k];Object.assign(s,clone(next));return s});return Store.state}
function snapshotOwner(id){const current=Store.ownerId;Store.switchOwner(id);const snap=clone(Store.state);if(current!==id)Store.switchOwner(current);return snap}
function mergeIntoOwner(id,incoming,options={}){const current=Store.ownerId;Store.switchOwner(id);const merged=mergeStateSafe(Store.state,incoming,id,options);replaceCurrent(merged);const result=clone(Store.state);if(current!==id)Store.switchOwner(current);return result}
function migrateGuestToUser(userId){const guestId=Store.guestId,guest=snapshotOwner(guestId);Store.switchOwner(userId);const user=clone(Store.state),last=num(user.migrations?.guestImportedAt);if(num(guest.updatedAt)<=last)return Store.state;const merged=mergeStateSafe(user,guest,userId,{preferRightProfile:true});merged.migrations={...(merged.migrations||{}),guestImportedAt:Date.now(),guestImportedFrom:guestId};replaceCurrent(merged);return Store.state}
Store.mergeStateSafe=mergeStateSafe;Store.mergeIntoOwner=mergeIntoOwner;Store.migrateGuestToUser=migrateGuestToUser;Store.snapshotOwner=snapshotOwner;
// New v9 records carry per-record update clocks so cloud merge never relies on a page-load timestamp.
if(V.Mastery){
  const oldRecord=V.Mastery.recordAnswer;V.Mastery.recordAnswer=function(...args){const r=oldRecord.apply(this,args),id=args[0]?.conceptId,p=Store.state.progress?.[id];if(p)p.updatedAt=Date.now();Store.save();return r};
  const oldReview=V.Mastery.markReviewed;V.Mastery.markReviewed=function(...args){const r=oldReview.apply(this,args),p=Store.state.progress?.[args[0]];if(p)p.updatedAt=Date.now();Store.save();return r};
}
V.SyncMerge={mergeStateSafe,profileCustom,stamp};
})();
