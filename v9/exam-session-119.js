'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const PREFIX='aitutor9:active-exam:v1:';
const TRAINING_MAX_AGE=7*24*60*60*1000;
const REAL_MAX_AGE=6*60*60*1000;
const key=ownerId=>PREFIX+String(ownerId||V.Store?.ownerId||'guest');
const safeParse=raw=>{try{return JSON.parse(raw)}catch{return null}};
function save(exam,ownerId){
  if(!exam||!Array.isArray(exam.qs)||!exam.qs.length)return false;
  const questionIds=exam.qs.map(q=>String(q?.id||'')).filter(Boolean);
  if(questionIds.length!==exam.qs.length||new Set(questionIds).size!==questionIds.length)return false;
  const answers={};
  for(const [id,value] of Object.entries(exam.answers||{})){
    const n=Number(value);
    if(questionIds.includes(id)&&Number.isInteger(n)&&n>=0&&n<=3)answers[id]=n;
  }
  const row={
    version:'119-active-exam-v2',
    ownerId:String(ownerId||V.Store?.ownerId||'guest'),
    id:String(exam.id||''),
    mode:String(exam.mode||'practice'),
    trainingKey:String(exam.trainingKey||''),
    title:String(exam.title||''),
    difficulty:String(exam.difficulty||'mid'),
    questionIds,
    i:Math.max(0,Math.min(Number(exam.i)||0,questionIds.length-1)),
    startedAt:Number(exam.startedAt)||Date.now(),
    answers,
    confidence:Object.fromEntries(Object.entries(exam.confidence||{}).filter(([id,v])=>questionIds.includes(id)&&['sure','maybe','none'].includes(v))),
    blueprint:exam.blueprint&&typeof exam.blueprint==='object'?exam.blueprint:null,
    questionSnapshots:Object.fromEntries((exam.qs||[]).filter(q=>q?.variantGenerated).map(q=>[q.id,V.VariantEngine119?.snapshot?.(q)||q])),
    savedAt:Date.now()
  };
  if(!row.id)return false;
  try{localStorage.setItem(key(ownerId),JSON.stringify(row));return true}catch{return false}
}
function clear(ownerId){try{localStorage.removeItem(key(ownerId));return true}catch{return false}}
function restore(ownerId){
  let row=null;
  try{row=safeParse(localStorage.getItem(key(ownerId))||'')}catch{}
  if(!row||!['119-active-exam-v1','119-active-exam-v2'].includes(row.version)||!row.id||!Array.isArray(row.questionIds)||!row.questionIds.length){clear(ownerId);return null}
  const age=Date.now()-Number(row.savedAt||0),maxAge=row.mode==='real'?REAL_MAX_AGE:TRAINING_MAX_AGE;
  if(!Number.isFinite(age)||age<0||age>maxAge||!Number.isFinite(Number(row.startedAt))){clear(ownerId);return null}
  const snapshots=row.questionSnapshots&&typeof row.questionSnapshots==='object'?row.questionSnapshots:{};
  const qs=row.questionIds.map(id=>snapshots[id]||V.questionById?.[id]).filter(Boolean);
  if(qs.length!==row.questionIds.length){clear(ownerId);return null}
  const answers={};
  for(const [id,value] of Object.entries(row.answers||{})){
    const n=Number(value);
    if(row.questionIds.includes(id)&&Number.isInteger(n)&&n>=0&&n<=3)answers[id]=n;
  }
  return{
    id:row.id,
    mode:['real','practice','training'].includes(row.mode)?row.mode:'practice',
    trainingKey:row.trainingKey||'',
    title:row.title||'',
    difficulty:row.difficulty||'mid',
    qs,
    i:Math.max(0,Math.min(Number(row.i)||0,qs.length-1)),
    startedAt:Number(row.startedAt),
    answers,
    confidence:Object.fromEntries(Object.entries(row.confidence||{}).filter(([id,v])=>row.questionIds.includes(id)&&['sure','maybe','none'].includes(v))),
    blueprint:row.blueprint||null,
    restored:true
  }
}
function has(ownerId){try{return !!localStorage.getItem(key(ownerId))}catch{return false}}
V.ExamSession119={version:'119-active-exam-v2',save,restore,clear,has,policy:{localOnly:true,questionIdsOnly:false,variantSnapshots:true,realMaxAgeHours:6,trainingMaxAgeDays:7,cloudSync:false}};
})();