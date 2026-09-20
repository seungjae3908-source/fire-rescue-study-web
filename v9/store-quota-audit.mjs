import fs from 'node:fs';
import vm from 'node:vm';

const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
const mem=new Map();
let failStateOnce=false;
globalThis.localStorage={
  getItem:k=>mem.has(k)?mem.get(k):null,
  setItem(k,v){
    if(failStateOnce&&String(k).startsWith('aitutor9:state:')){
      failStateOnce=false;
      const e=new Error('quota');e.name='QuotaExceededError';throw e
    }
    mem.set(k,String(v))
  }
};
globalThis.window={AITUTOR_V9:{questionById:{}}};
vm.runInThisContext(fs.readFileSync(new URL('./store.js',import.meta.url),'utf8'),{filename:'store.js'});
failStateOnce=true;
const S=window.AITUTOR_V9.Store,s=S.state;
s.notes=[{id:'keep-note',body:'x'.repeat(12000),createdAt:1}];
s.progress={'F01-C01':{conceptId:'F01-C01',mastery:88,attempts:999,correct:900}};
s.wrongs=[];
for(let i=0;i<800;i++)s.wrongs.push({id:'w'+i,resolved:i>9,lastWrongAt:i,createdAt:i});
s.answerEvents=[];
for(let i=0;i<7000;i++)s.answerEvents.push({eventId:'e'+i,questionId:'q'+i,at:i,choice:i%4});
s.examHistory=[];
for(let i=0;i<180;i++)s.examHistory.push({id:'x'+i,at:i,answers:{['q'+i]:1},questionIds:['q'+i]});
s.studySessions=Array.from({length:1300},(_,i)=>({id:'s'+i,startedAt:i}));
s.chat=Array.from({length:450},(_,i)=>({id:'c'+i,at:i,text:'chat'}));
S.save();
assert(S.state.answerEvents.length===6000,'quota recovery keeps only the most recent answer events');
assert(S.state.examHistory.length===120,'quota recovery bounds detailed exam history');
assert(S.state.studySessions.length===1000&&S.state.chat.length===300,'quota recovery bounds session/chat detail');
assert(S.state.wrongs.filter(x=>!x.resolved).length===10,'quota recovery preserves every unresolved wrong answer');
assert(S.state.wrongs.filter(x=>x.resolved).length===500,'quota recovery retains recent resolved wrong-answer history');
assert(S.state.notes.some(x=>x.id==='keep-note'),'quota recovery preserves personal notes');
assert(S.state.progress['F01-C01']?.mastery===88&&S.state.progress['F01-C01']?.attempts===999,'quota recovery preserves mastery aggregates');
assert(S.storagePolicy.compactOnQuotaOnly===true&&S.storagePolicy.preserveUnresolvedWrongs===true,'storage policy is fail-safe and quota-triggered only');
assert(S.state.migrations.storageCompactionVersion==='quota-v1','quota recovery records an explicit migration marker');
console.log('STORE_QUOTA_RECOVERY_COMPLETE');
// Exact-head quota recovery regression trigger.
