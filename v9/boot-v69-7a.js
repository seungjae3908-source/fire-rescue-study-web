'use strict';
/* V69 bootstrap bundle 7a. Source order is canonical. */

;
/* ---- exam-session-119.js ---- */
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

;
/* ---- sync-merge.js ---- */
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
function mergeList(left,right,key='id'){const m=new Map();for(const row of [...(left||[]),...(right||[])]){if(!row)continue;const id=row[key]||JSON.stringify(row),prev=m.get(id);if(!prev){m.set(id,clone(row));continue}const newer=stamp(row)>=stamp(prev)?{...clone(prev),...clone(row)}:{...clone(row),...clone(prev)};m.set(id,newer)}return[...m.values()]}
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


;
/* ---- runtime-deps.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};let pdfPromise=null,tesseractPromise=null,webllmPromise=null;
const local=()=>/^(?:localhost|127\.|\[?::1\]?$)/i.test(location.hostname),deps=(x,...r)=>local()?[x,...r]:r;
async function firstImport(candidates,label){const errors=[];for(const url of candidates){try{return{module:await import(url),url}}catch(err){errors.push(String(err?.message||err))}}throw Error(label+'_LOAD_FAILED: '+errors.slice(-2).join(' | '))}
async function loadPdfJs(){
  if(pdfPromise)return pdfPromise;
  pdfPromise=(async()=>{
    const {module:p,url}=await firstImport(deps('../node_modules/pdfjs-dist/build/pdf.min.mjs','https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs','https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.min.mjs'),'PDFJS');
    p.GlobalWorkerOptions.workerSrc=url.includes('/build/pdf.min.mjs')?url.replace('/build/pdf.min.mjs','/build/pdf.worker.min.mjs'):'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';return p
  })().catch(err=>{pdfPromise=null;throw err});return pdfPromise
}
async function loadTesseract(){
  if(tesseractPromise)return tesseractPromise;
  tesseractPromise=(async()=>{const {module:T}=await firstImport(deps('../node_modules/tesseract.js/dist/tesseract.esm.min.js','https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js','https://esm.sh/tesseract.js@7.0.0'),'TESSERACT');return T})().catch(err=>{tesseractPromise=null;throw err});return tesseractPromise
}
async function loadWebLLM(){
  if(webllmPromise)return webllmPromise;
  webllmPromise=(async()=>{const {module:m}=await firstImport(['https://esm.run/@mlc-ai/web-llm@0.2.85','https://esm.sh/@mlc-ai/web-llm@0.2.85'],'WEBLLM');return m})().catch(err=>{webllmPromise=null;throw err});return webllmPromise
}
V.RuntimeDeps={loadPdfJs,loadTesseract,loadWebLLM,localRuntime:local,dependencyCandidates:deps};
})();

;
/* ---- local-ai.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
let engine=null,loading=null,status='대기',modelId='';
const emit=(text,cb)=>{status=String(text||status);try{cb?.(status)}catch{}};
const numTokens=s=>[...String(s||'').matchAll(/(?:\d+(?:[.,]\d+)?)(?:\s*(?:%|℃|°C|kg|g|mg|L|mL|ml|mmHg|cm|mm|m|km|초|분|시간|회|배|명|쪽))?/g)].map(x=>x[0].replace(/\s+/g,'').toLowerCase());
const hangulRatio=s=>{const t=String(s||'').replace(/\s/g,'');if(!t)return 0;return (t.match(/[가-힣0-9A-Za-z]/g)||[]).length/t.length};
function textQuality(s){
  const t=String(s||'').replace(/\s+/g,' ').trim(),compact=t.replace(/\s/g,'');if(!compact)return 0;
  const valid=hangulRatio(t),weird=(compact.match(/[�□▯]/g)||[]).length/compact.length;
  const tokenBonus=Math.min(1,(t.split(/\s+/).filter(Boolean).length||0)/28);
  const lenBonus=Math.min(1,compact.length/180);
  return Math.max(0,Math.min(1,valid*.55+tokenBonus*.2+lenBonus*.25-weird*.8));
}
function numbersPreserved(source,out){
  const a=numTokens(source);if(!a.length)return true;const b=new Set(numTokens(out));return a.every(x=>b.has(x));
}
function chooseModel(list=[]){
  const rows=[...list].filter(x=>x?.model_id),instruct=rows.filter(x=>/Instruct/i.test(x.model_id));
  const smallest=(instruct.length?instruct:rows).slice().sort((a,b)=>(a.vram_required_MB||99999)-(b.vram_required_MB||99999))[0]||null;
  const half=instruct.find(x=>/0\.5B.*Instruct/i.test(x.model_id))||smallest;
  const memory=Number(navigator.deviceMemory||0),cores=Number(navigator.hardwareConcurrency||0),mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
  const capable=!mobile&&((memory>=8)||(memory===0&&cores>=8));
  if(!capable)return half;
  const quality=instruct.filter(x=>/(?:1\.5B|1\.7B|1B|1\.0B).*Instruct/i.test(x.model_id)).sort((a,b)=>{
    const ar=/1\.[57]B/i.test(a.model_id)?0:1,br=/1\.[57]B/i.test(b.model_id)?0:1;
    return ar-br||(a.vram_required_MB||99999)-(b.vram_required_MB||99999)
  })[0];
  return quality||half
}
async function ensure({onProgress}={}){
  if(engine)return engine;if(loading)return loading;
  if(!navigator.gpu)throw Error('WEBGPU_UNAVAILABLE');
  loading=(async()=>{
    emit('로컬 AI 엔진 불러오는 중',onProgress);
    const m=V.RuntimeDeps?.loadWebLLM?await V.RuntimeDeps.loadWebLLM():await import('https://esm.run/@mlc-ai/web-llm@0.2.85'),list=m.prebuiltAppConfig?.model_list||[];
    const model=chooseModel(list);
    if(!model)throw Error('LOCAL_AI_MODEL_UNAVAILABLE');
    modelId=model.model_id;
    emit('AI 모델 선택 · '+modelId,onProgress);
    engine=await m.CreateMLCEngine(modelId,{initProgressCallback:p=>emit(p.text||'AI 모델 준비 중',onProgress)});
    emit('로컬 AI 준비됨 · '+modelId,onProgress);return engine;
  })().catch(err=>{engine=null;emit('로컬 AI 사용 불가',onProgress);throw err}).finally(()=>loading=null);
  return loading;
}
async function chat(messages,{temperature=.1,max_tokens=900,onProgress}={}){
  const e=await ensure({onProgress});
  const r=await e.chat.completions.create({messages,temperature,max_tokens});
  return String(r?.choices?.[0]?.message?.content||'').trim();
}
async function correctExtractedText({primary='',alternate='',confidence=null,onProgress}={}){
  const base=String(primary||alternate||'').trim();if(!base)return{accepted:false,text:'',reason:'empty'};
  if(!navigator.gpu)return{accepted:false,text:base,reason:'no-webgpu'};
  const prompt=`아래는 같은 페이지에서 얻은 텍스트 후보입니다.
규칙:
1) 입력에 없는 사실을 절대 추가하지 마라.
2) OCR 오탈자와 띄어쓰기만 교정하고 문장 순서를 자연스럽게 복원하라.
3) 숫자·단위·기호는 임의로 바꾸거나 새로 만들지 마라.
4) 표는 가능하면 행 단위 줄바꿈을 유지하라.
5) 설명 없이 교정된 본문만 출력하라.

[후보 A]
${base}

[후보 B]
${String(alternate||'없음')}

[OCR 신뢰도]
${confidence==null?'미상':confidence}`;
  let out='';
  try{out=await chat([{role:'system',content:'너는 한국어 소방·구급 교재 OCR 교정기다. 원문 밖의 내용을 만들지 않는다.'},{role:'user',content:prompt}],{temperature:0,max_tokens:1200,onProgress})}catch(err){return{accepted:false,text:base,reason:String(err?.message||err)}}
  if(!out||out.length<Math.max(20,base.length*.45)||out.length>base.length*2.1)return{accepted:false,text:base,reason:'length-guard'};
  if(!numbersPreserved(base,out))return{accepted:false,text:base,reason:'number-guard'};
  if(textQuality(out)+.03<textQuality(base))return{accepted:false,text:base,reason:'quality-guard'};
  return{accepted:true,text:out,reason:'ai-corrected'};
}
async function studyDigest({title='',text='',onProgress}={}){
  const src=String(text||'').trim();if(!src)throw Error('AI_DIGEST_TEXT_REQUIRED');
  const excerpt=src.slice(0,18000);
  return chat([
    {role:'system',content:'너는 소방공무원 시험용 개인자료 정리기다. 제공된 자료 안의 내용만 사용하고, 자료에 없는 사실·수치·법규를 절대 추가하지 않는다.'},
    {role:'user',content:`자료명: ${title||'개인자료'}

아래 추출문만 근거로 합격노트 초안을 작성해라.
형식:
[핵심]
• ...
[숫자·단위·기준]
• ...
[비교·구분]
• ...
[주의·예외]
• ...
[원문 확인 필요]
• OCR이 불확실하거나 문맥이 끊긴 부분

중요 규칙:
- 핵심은 짧고 시험용으로 정리한다.
- 숫자와 단위는 원문에 있는 것만 쓴다.
- 불확실하면 추정하지 말고 '원문 확인 필요'에 넣는다.
- 결과만 출력한다.

[추출문]
${excerpt}`}
  ],{temperature:.05,max_tokens:1100,onProgress});
}
V.LocalAI={
  ensure,chat,correctExtractedText,studyDigest,textQuality,numTokens,numbersPreserved,
  get ready(){return !!engine},
  get status(){return status},
  get engine(){return engine},
  get modelId(){return modelId}
};
})();

;
/* ---- pdf.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};const DB='aitutor-v9-private-docs',VER=1;let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('docs')){const s=d.createObjectStore('docs',{keyPath:'id'});s.createIndex('owner','ownerId');s.createIndex('kind','kind')}if(!d.objectStoreNames.contains('chunks')){const s=d.createObjectStore('chunks',{keyPath:'id'});s.createIndex('owner','ownerId');s.createIndex('doc','docId')}};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
const txDone=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
const uuid=()=>crypto.randomUUID?crypto.randomUUID():'id-'+Date.now()+'-'+Math.random().toString(36).slice(2);
function tokens(s){return [...new Set(String(s||'').toLowerCase().replace(/[^0-9a-z가-힣 ]/g,' ').split(/\s+/).filter(x=>x.length>1))]}
function tombstones(){const s=V.Store.state;return s.deletedDocuments||(s.deletedDocuments={})}
async function putDocument(doc,chunks){const d=await db(),t=d.transaction(['docs','chunks'],'readwrite');t.objectStore('docs').put(doc);for(const c of chunks)t.objectStore('chunks').put(c);await txDone(t);return doc}
async function listDocuments(kind){const d=await db(),owner=V.Store.ownerId,t=d.transaction('docs','readonly'),idx=t.objectStore('docs').index('owner'),req=idx.getAll(owner);const rows=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)});return kind?rows.filter(x=>x.kind===kind):rows}
async function chunksFor(docId){const d=await db(),t=d.transaction('chunks','readonly'),req=t.objectStore('chunks').index('doc').getAll(docId);return await new Promise((res,rej)=>{req.onsuccess=()=>res((req.result||[]).filter(x=>x.ownerId===V.Store.ownerId));req.onerror=()=>rej(req.error)})}
async function purge(docId){const d=await db(),chunks=await chunksFor(docId),t=d.transaction(['docs','chunks'],'readwrite');t.objectStore('docs').delete(docId);for(const c of chunks)t.objectStore('chunks').delete(c.id);await txDone(t)}
async function remove(docId){await purge(docId);tombstones()[docId]=Date.now();V.Store.save()}
async function createOcrWorker(){
  const T=V.RuntimeDeps?.loadTesseract?await V.RuntimeDeps.loadTesseract():await import('https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js');
  const create=T.createWorker||T.default?.createWorker||window.Tesseract?.createWorker;
  if(!create)throw Error('OCR_ENGINE_UNAVAILABLE');
  const worker=await create('kor+eng');
  try{await worker.setParameters?.({preserve_interword_spaces:'1'})}catch{}
  return worker
}
function normalizeText(s){return String(s||'').replace(/[\t\u00a0]+/g,' ').replace(/ *\n */g,'\n').replace(/[ ]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function nativePdfText(tc){
  const items=(tc?.items||[]).filter(x=>String(x?.str||'').trim()).map(x=>({text:String(x.str).trim(),x:Number(x.transform?.[4]||0),y:Number(x.transform?.[5]||0),h:Math.abs(Number(x.height||x.transform?.[3]||10))||10}));
  if(!items.length)return'';
  const lines=[];
  for(const item of items.sort((a,b)=>Math.abs(b.y-a.y)>3?b.y-a.y:a.x-b.x)){
    let line=lines.find(l=>Math.abs(l.y-item.y)<=Math.max(2.5,Math.min(6,item.h*.42)));
    if(!line){line={y:item.y,h:item.h,items:[]};lines.push(line)}
    line.items.push(item);line.h=Math.max(line.h,item.h);
  }
  lines.sort((a,b)=>b.y-a.y);
  const out=[];let prev=null;
  for(const line of lines){
    const text=line.items.sort((a,b)=>a.x-b.x).map(x=>x.text).join(' ').replace(/\s+/g,' ').trim();
    if(!text)continue;
    if(prev&&Math.abs(prev.y-line.y)>Math.max(prev.h,line.h)*1.65)out.push('');
    out.push(text);prev=line;
  }
  return normalizeText(out.join('\n'))
}
function benchmarkNorm(s){return String(s||'').replace(/\[\s*\d+\s*쪽\s*\]/g,' ').normalize('NFKC').toLowerCase().replace(/[^0-9a-z가-힣%./-]/g,'')}
function editDistance(a,b){a=[...String(a||'')];b=[...String(b||'')];let prev=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const cur=[i];for(let j=1;j<=b.length;j++)cur[j]=Math.min(cur[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}return prev[b.length]}
function tokenRecall(reference,observed,re){const ref=String(reference||'').match(re)||[];if(!ref.length)return 1;const obs=benchmarkNorm(observed);let hit=0;for(const raw of ref){const t=benchmarkNorm(raw);if(t&&obs.includes(t))hit++}return hit/ref.length}
function ocrBenchmarkMetrics(reference,observed){
  const ref=benchmarkNorm(reference),obs=benchmarkNorm(observed),cer=ref.length?editDistance(ref,obs)/ref.length:0;
  const koreanRecall=tokenRecall(reference,observed,/[가-힣]{2,}/g);
  const numericRecall=tokenRecall(reference,observed,/\d+(?:\.\d+)?/g);
  const unitRecall=tokenRecall(reference,observed,/(?:mL|mmHg|kg|mg|cm|mm|psi|%|J\/kg|회\/분|℃)/gi);
  return{cer:Number(cer.toFixed(3)),koreanRecall:Number(koreanRecall.toFixed(3)),numericRecall:Number(numericRecall.toFixed(3)),unitRecall:Number(unitRecall.toFixed(3)),referenceChars:ref.length,observedChars:obs.length}
}
function textQuality(text){
  if(V.LocalAI?.textQuality)return V.LocalAI.textQuality(text);
  const t=String(text||'').replace(/\s+/g,' ').trim(),compact=t.replace(/\s/g,'');if(!compact)return 0;
  const valid=(compact.match(/[가-힣0-9A-Za-z.,:%()\-+\/]/g)||[]).length/compact.length;
  const weird=(compact.match(/[�□▯]/g)||[]).length/compact.length;
  const len=Math.min(1,compact.length/180),words=Math.min(1,t.split(/\s+/).filter(Boolean).length/28);
  return Math.max(0,Math.min(1,valid*.55+len*.25+words*.2-weird*.8))
}
function pdfPageNeedsOcr(tc,text){
  const visible=(tc?.items||[]).filter(x=>String(x?.str||'').trim()).length,compact=String(text||'').replace(/\s+/g,'').length,q=textQuality(text);
  return visible<3||compact<45||q<.57
}
function prepareOcrCanvas(canvas,threshold=false){
  if(!threshold)return canvas;
  const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;
  const ctx=out.getContext('2d',{alpha:false});ctx.drawImage(canvas,0,0);
  const img=ctx.getImageData(0,0,out.width,out.height),d=img.data;
  for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2],v=y<188?0:255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}
  ctx.putImageData(img,0,0);return out
}
async function recognizeCanvas(worker,canvas){
  const r=await worker.recognize(canvas),text=normalizeText(r.data?.text||''),confidence=Number(r.data?.confidence);
  return{text,confidence:Number.isFinite(confidence)?confidence:null,quality:textQuality(text)}
}
async function bestOcrCanvas(worker,canvas){
  const first=await recognizeCanvas(worker,canvas);let best=first;
  if(first.confidence==null||first.confidence<82||first.quality<.68){
    const enhanced=prepareOcrCanvas(canvas,true);
    try{const second=await recognizeCanvas(worker,enhanced);if(second.quality>best.quality+.025||second.confidence!=null&&best.confidence!=null&&second.confidence>best.confidence+7)best=second}finally{enhanced.width=1;enhanced.height=1}
  }
  return best
}
async function ocrPdfPage(pg,worker){
  const base=pg.getViewport({scale:1}),maxWidth=2400,scale=Math.min(3,Math.max(1.8,maxWidth/base.width)),viewport=pg.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  await pg.render({canvasContext:ctx,viewport}).promise;
  try{return await bestOcrCanvas(worker,canvas)}finally{canvas.width=1;canvas.height=1}
}
async function maybeAiCorrect(primary,alternate,confidence,onProgress){
  const q=textQuality(primary),needs=q<.72||(confidence!=null&&confidence<82);
  if(!needs||!navigator.gpu||!V.LocalAI?.correctExtractedText)return{accepted:false,text:primary,reason:'not-needed'};
  onProgress?.('AI OCR 보정 중');
  try{return await V.LocalAI.correctExtractedText({primary,alternate,confidence,onProgress:t=>onProgress?.(t)})}catch(err){return{accepted:false,text:primary,reason:String(err?.message||err)}}
}
async function pdfText(file,onProgress,{aiAssist='auto'}={}){
  const p=V.RuntimeDeps?.loadPdfJs?await V.RuntimeDeps.loadPdfJs():await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
  if(!V.RuntimeDeps?.loadPdfJs)p.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
  const task=p.getDocument({data:await file.arrayBuffer()}),pdf=await task.promise,out=[];let worker=null,aiBudget=6;
  try{
    for(let i=1;i<=pdf.numPages;i++){
      const pg=await pdf.getPage(i),tc=await pg.getTextContent(),native=nativePdfText(tc),nativeQ=textQuality(native);
      let text=native,ocr=false,ocrConfidence=null,mode='text',alternate='';
      if(pdfPageNeedsOcr(tc,native)){
        worker=worker||await createOcrWorker();const o=await ocrPdfPage(pg,worker);ocr=true;ocrConfidence=o.confidence;alternate=native;
        if(o.quality>=nativeQ-.02||native.length<45){text=o.text;mode='ocr'}else{mode='native-preferred'}
        if(aiAssist!==false&&aiBudget>0&&(o.quality<.72||o.confidence!=null&&o.confidence<82)){
          const a=await maybeAiCorrect(text,alternate,o.confidence,t=>onProgress?.(i,pdf.numPages,'ai',t));if(a.accepted){text=a.text;mode='ocr+ai'}aiBudget--
        }
      }
      const quality=textQuality(text),needsReview=quality<.62||(ocrConfidence!=null&&ocrConfidence<70);
      out.push({page:i,text:normalizeText(text),ocr,ocrConfidence,quality,needsReview,mode});
      onProgress?.(i,pdf.numPages,mode)
    }
  }finally{if(worker)await worker.terminate().catch(()=>{});await task.destroy?.().catch?.(()=>{})}
  return out
}
async function imageText(file,onProgress,{aiAssist='auto'}={}){
  onProgress?.(0,1,'ocr');const worker=await createOcrWorker();
  try{
    const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas'),maxWidth=2600,scale=Math.min(3,Math.max(1,Math.min(maxWidth/bitmap.width,3)));
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
    let o=await bestOcrCanvas(worker,canvas),text=o.text,mode='ocr';
    if(aiAssist!==false&&(o.quality<.72||o.confidence!=null&&o.confidence<82)){
      const a=await maybeAiCorrect(text,'',o.confidence,t=>onProgress?.(0,1,'ai',t));if(a.accepted){text=a.text;mode='ocr+ai'}
    }
    canvas.width=1;canvas.height=1;onProgress?.(1,1,mode);
    return[{page:1,text:normalizeText(text),ocr:true,ocrConfidence:o.confidence,quality:textQuality(text),needsReview:textQuality(text)<.62||(o.confidence!=null&&o.confidence<70),mode}]
  }finally{await worker.terminate().catch(()=>{})}
}
async function ingest(file,{kind='personal',title='',keepOriginal=false,onProgress,aiAssist='auto'}={}){
  if(!file)throw Error('FILE_REQUIRED');let pages=[];
  if(file.type==='application/pdf'||/\.pdf$/i.test(file.name))pages=await pdfText(file,onProgress,{aiAssist});
  else if(file.type?.startsWith('image/'))pages=await imageText(file,onProgress,{aiAssist});
  else{const text=normalizeText(await file.text());pages=[{page:1,text,ocr:false,ocrConfidence:null,quality:textQuality(text),needsReview:textQuality(text)<.62,mode:'text'}]}
  const extractedChars=pages.reduce((n,p)=>n+String(p.text||'').trim().length,0);if(!extractedChars)throw Error('NO_TEXT_EXTRACTED');
  const now=Date.now(),docId=uuid(),ownerId=V.Store.ownerId,reviewPages=pages.filter(p=>p.needsReview).map(p=>p.page),avgQuality=pages.length?pages.reduce((n,p)=>n+Number(p.quality||0),0)/pages.length:0;
  const doc={id:docId,ownerId,kind,title:title||file.name,fileName:file.name,mime:file.type||'',pageCount:pages.length,extractedChars,ocrPages:pages.filter(p=>p.ocr).map(p=>p.page),reviewPages,extractionVersion:'v10-hybrid-ocr-ai',extractionQuality:Number(avgQuality.toFixed(3)),private:kind==='personal',createdAt:now,updatedAt:now,original:keepOriginal?file:null};
  const chunks=[];
  for(const p of pages){const text=(p.text||'').trim();if(!text)continue;const size=1300;for(let i=0;i<text.length;i+=size){const part=text.slice(i,i+size);chunks.push({id:`${docId}:${p.page}:${i}`,docId,ownerId,kind,page:p.page,chunkIndex:Math.floor(i/size),text:part,tokenSet:tokens(part),quality:p.quality,ocr:p.ocr,ocrConfidence:p.ocrConfidence,needsReview:p.needsReview,mode:p.mode})}}
  await putDocument(doc,chunks);delete tombstones()[docId];V.Store.save();
  return{doc,chunks:chunks.length,extractedChars,ocrPages:doc.ocrPages,reviewPages,extractionQuality:doc.extractionQuality}
}
async function search(query,{kind,limit=8}={}){const qs=tokens(query);if(!qs.length)return[];const docs=await listDocuments(kind),docIds=new Set(docs.map(x=>x.id)),d=await db(),t=d.transaction('chunks','readonly'),req=t.objectStore('chunks').index('owner').getAll(V.Store.ownerId);const rows=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)});return rows.filter(x=>docIds.has(x.docId)&&(!kind||x.kind===kind)).map(x=>{let score=0;for(const q of qs)if((x.tokenSet||[]).some(t=>t.includes(q)||q.includes(t)))score+=q.length;return{...x,score,doc:docs.find(d=>d.id===x.docId)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
async function privateGrounding(query,limit=5){const hits=await search(query,{kind:'personal',limit});return hits.map(h=>`[내 개인자료 · ${h.doc.title} · ${h.page}쪽]\n${h.text.slice(0,900)}`).join('\n\n')}
async function exportForSync(){const ownerId=V.Store.ownerId,docs=await listDocuments('personal'),outDocs=[],outChunks=[];for(const d of docs){const {original,...safe}=d;outDocs.push({...safe,ownerId,private:true,original:undefined});for(const c of await chunksFor(d.id))outChunks.push({...c,ownerId,kind:'personal'})}const deleted=Object.entries(tombstones()).map(([id,deletedAt])=>({id,ownerId,deletedAt:Number(deletedAt)||Date.now()}));return{ownerId,docs:outDocs,chunks:outChunks,deleted}}
async function importFromSync(remoteDocs=[],remoteChunks=[]){const ownerId=V.Store.ownerId,owned=(remoteDocs||[]).filter(x=>x&&x.ownerId===ownerId),deleted=owned.filter(x=>Number(x.deletedAt)>0),live=owned.filter(x=>!Number(x.deletedAt)),local=new Map((await listDocuments()).map(x=>[x.id,x])),ts=tombstones();let deletedCount=0;for(const row of deleted){const when=Number(row.deletedAt)||0,prev=local.get(row.id),localStamp=Math.max(Number(prev?.updatedAt||prev?.createdAt||0),Number(ts[row.id]||0));if(when<localStamp)continue;await purge(row.id);ts[row.id]=when;local.delete(row.id);deletedCount++}const allowed=new Set(live.map(x=>x.id));if(!live.length){V.Store.save();return{docs:0,chunks:0,deleted:deletedCount}}const accepted=new Set(),d=await db(),t=d.transaction(['docs','chunks'],'readwrite'),docStore=t.objectStore('docs'),chunkStore=t.objectStore('chunks');for(const row of live){const prev=local.get(row.id),remoteStamp=Number(row.updatedAt||row.createdAt||0),localStamp=Math.max(Number(prev?.updatedAt||prev?.createdAt||0),Number(ts[row.id]||0));if(localStamp>remoteStamp)continue;accepted.add(row.id);delete ts[row.id];const clean={...row,ownerId,kind:'personal',private:true,original:null,deletedAt:0};docStore.put(clean)}let chunkCount=0;for(const row of remoteChunks||[]){if(!row||row.ownerId!==ownerId||!allowed.has(row.docId)||(!accepted.has(row.docId)&&local.has(row.docId)))continue;chunkStore.put({...row,ownerId,kind:'personal',tokenSet:row.tokenSet||tokens(row.text)});chunkCount++}await txDone(t);V.Store.save();return{docs:accepted.size,chunks:chunkCount,deleted:deletedCount}}
V.PrivateDocs={db,ingest,listDocuments,chunksFor,remove,search,privateGrounding,exportForSync,importFromSync,pdfPageNeedsOcr,nativePdfText,textQuality,ocrBenchmarkMetrics,privacyRules:{defaultPrivate:true,serverUpload:false,extractedTextCloudSync:'manual-member-sync',originalCloudSyncOptIn:true,crossUserSharing:false,deletionTombstones:true}};
})();


;
/* ---- source-catalog-119.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const base='https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/';
const cfg=window.AITUTOR_V9_CONFIG||{};
const host=typeof location!=='undefined'?String(location.hostname||''):'';
const sameOriginProduction=/^fire-rescue-study-web(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(host);
const proxyBase=String(sameOriginProduction?(location.origin||''):(cfg.officialPdfProxyBase||'')).replace(/\/$/,'');
const mirrorBase=String(cfg.officialPdfMirrorBase||'').replace(/\/$/,'');
const mirrorDocs=new Set(Array.isArray(cfg.officialPdfMirrorDocs)?cfg.officialPdfMirrorDocs:[]);
const mirrored=doc=>!!mirrorBase&&mirrorDocs.has(doc);
const proxyPdf=doc=>`${proxyBase}/api/official-pdf?doc=${encodeURIComponent(doc)}`;
const mirrorPdf=doc=>mirrored(doc)?`${mirrorBase}/${encodeURIComponent(doc)}.pdf`:'';
const directPdf=doc=>mirrorPdf(doc)||proxyPdf(doc);
const transport=doc=>mirrored(doc)?'range-static':'range-proxy';
const C={
  ems:{
    key:'ems',label:'2026 소방전술3(구급)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('ems'),mirrorPdf:mirrorPdf('ems'),proxyPdf:proxyPdf('ems'),transport:transport('ems'),proxyDoc:'ems',expectedNames:['13. 소방전술3(구급)-저용량.pdf']
  },
  fire1:{
    key:'fire1',label:'2026 소방전술1(화재1)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('fire1'),mirrorPdf:mirrorPdf('fire1'),proxyPdf:proxyPdf('fire1'),transport:transport('fire1'),proxyDoc:'fire1',expectedNames:['10. 소방전술1(화재1).pdf']
  },
  fire2:{
    key:'fire2',label:'2026 소방전술1(화재2)',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('fire2'),mirrorPdf:mirrorPdf('fire2'),proxyPdf:proxyPdf('fire2'),transport:transport('fire2'),proxyDoc:'fire2',expectedNames:['11. 소방전술1(화재2).pdf']
  },
  prevention1:{
    key:'prevention1',label:'2026 예방실무1',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('prevention1'),mirrorPdf:mirrorPdf('prevention1'),proxyPdf:proxyPdf('prevention1'),transport:transport('prevention1'),proxyDoc:'prevention1',expectedNames:['1.예방실무1.pdf']
  },
  prevention2:{
    key:'prevention2',label:'2026 예방실무2',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('prevention2'),mirrorPdf:mirrorPdf('prevention2'),proxyPdf:proxyPdf('prevention2'),transport:transport('prevention2'),proxyDoc:'prevention2',expectedNames:['2.예방실무2.pdf']
  },
  law1:{key:'law1',label:'2026 소방법령1',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law1'),mirrorPdf:mirrorPdf('law1'),proxyPdf:proxyPdf('law1'),transport:transport('law1'),proxyDoc:'law1',expectedNames:['3._소방법령1.pdf']},
  law2:{key:'law2',label:'2026 소방법령2',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law2'),mirrorPdf:mirrorPdf('law2'),proxyPdf:proxyPdf('law2'),transport:transport('law2'),proxyDoc:'law2',expectedNames:['4. 소방법령2.pdf']},
  law3:{key:'law3',label:'2026 소방법령3',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law3'),mirrorPdf:mirrorPdf('law3'),proxyPdf:proxyPdf('law3'),transport:transport('law3'),proxyDoc:'law3',expectedNames:['5. 소방법령3.pdf']},
  law4:{key:'law4',label:'2026 소방법령4',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law4'),mirrorPdf:mirrorPdf('law4'),proxyPdf:proxyPdf('law4'),transport:transport('law4'),proxyDoc:'law4',expectedNames:['6. 소방법령4.pdf']},
  law5:{key:'law5',label:'2026 소방법령5',officialPage:base+'?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',license:'KOGL-1',licenseLabel:'공공누리 제1유형',directPdf:directPdf('law5'),mirrorPdf:mirrorPdf('law5'),proxyPdf:proxyPdf('law5'),transport:transport('law5'),proxyDoc:'law5',expectedNames:['7. 소방법령5.pdf']}
};
function get(key){return C[key]||null}
function resolveForConcept(id){const c=V.curriculum?.byId?.[id],r=c?.sourceRanges?.[0];return r?.doc?get(r.doc):null}
function canDirect(key){return !!get(key)?.directPdf}
function withDirect(key,url,meta={}){if(!C[key])return false;C[key]={...C[key],directPdf:url||'',...meta};return true}
function audit(){const rows=Object.values(C);return{total:rows.length,direct:rows.filter(x=>x.directPdf).length,fallback:rows.filter(x=>!x.directPdf).length,licenseOk:rows.every(x=>x.license==='KOGL-1'),rows}}
V.SourceCatalog119={catalog:C,get,resolveForConcept,canDirect,withDirect,audit,policy:{officialOnly:true,noUserUploadRequired:true,attributionRequired:true,directWhenVerified:true,officialPageFallback:true,sameOriginProxy:!proxyBase,crossOriginProxy:!!proxyBase,arbitraryUrlProxy:false,allCatalogDocsProxyable:true,staticMirrorEnabled:!!mirrorBase,staticMirrorDocs:[...mirrorDocs]}};
})();

;
/* ---- source-impact-119.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
let lastAudit=null,lastOfficialReport=null;

const asNumber=value=>Number.isFinite(Number(value))?Number(value):null;
const normalizeRange=range=>{
  const doc=String(range?.doc||'').trim();
  const from=asNumber(range?.from),to=asNumber(range?.to);
  if(!doc||!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from)return null;
  return{doc,from,to,label:String(range?.label||doc)};
};
const rangesFor=concept=>(concept?.sourceRanges||[]).map(normalizeRange).filter(Boolean);
const verifiedQuestions=()=>Array.isArray(V.questions)?V.questions.filter(q=>q?.grade==='A'||q?.grade==='B'):[];
const normalizeToken=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/20\d{2}/g,'').replace(/[^0-9a-z가-힣]+/g,'');
const safeDecode=value=>{try{return decodeURIComponent(String(value||''))}catch{return String(value||'')}};

function snapshot(){
  const concepts=Array.isArray(V.curriculum?.concepts)?V.curriculum.concepts:[];
  const conceptById=new Map(concepts.map(c=>[c.id,c]));
  const questions=verifiedQuestions();
  const questionIdsByConcept=new Map();
  for(const q of questions){
    if(!q?.conceptId)continue;
    const rows=questionIdsByConcept.get(q.conceptId)||[];
    rows.push(q.id);
    questionIdsByConcept.set(q.conceptId,rows);
  }
  return{concepts,conceptById,questions,questionIdsByConcept};
}

function impactForRange(doc,from,to=from){
  const key=String(doc||'').trim(),a=asNumber(from),b=asNumber(to);
  if(!key||!Number.isInteger(a)||!Number.isInteger(b)||a<1||b<a)return{doc:key,from:a,to:b,conceptIds:[],questionIds:[],concepts:[],questions:[]};
  const state=snapshot(),conceptIds=[];
  for(const concept of state.concepts){
    const hit=rangesFor(concept).some(r=>r.doc===key&&r.from<=b&&r.to>=a);
    if(hit)conceptIds.push(concept.id);
  }
  const conceptSet=new Set(conceptIds);
  const questions=state.questions.filter(q=>conceptSet.has(q.conceptId));
  return{
    doc:key,from:a,to:b,
    conceptIds,
    questionIds:questions.map(q=>q.id),
    concepts:conceptIds.map(id=>{
      const c=state.conceptById.get(id);
      return{id,title:c?.title||'',scopeId:c?.scopeId||'',subject:c?.subject||''};
    }),
    questions:questions.map(q=>({id:q.id,conceptId:q.conceptId,grade:q.grade,source:String(q.source||'')}))
  };
}

function impactFor(doc,page){return impactForRange(doc,page,page)}

function diffImpact(changes=[]){
  const rows=(Array.isArray(changes)?changes:[]).map(change=>impactForRange(change?.doc,change?.from??change?.page,change?.to??change?.from??change?.page));
  const conceptIds=[...new Set(rows.flatMap(row=>row.conceptIds))];
  const questionIds=[...new Set(rows.flatMap(row=>row.questionIds))];
  return{changes:rows,conceptIds,questionIds,conceptCount:conceptIds.length,questionCount:questionIds.length};
}

function catalogRows(){return Object.values(V.SourceCatalog119?.catalog||{}).filter(x=>x?.key)}
function queryId(value){
  try{
    const u=new URL(String(value||''));
    return u.searchParams.get('cntId')||u.searchParams.get('cntid')||'';
  }catch{return''}
}
function noticeHaystack(item){
  return [item?.title,item?.url,...(Array.isArray(item?.attachments)?item.attachments.flatMap(x=>[x?.label,x?.url]):[])]
    .map(safeDecode).join(' ');
}
function familyDocs(text){
  const src=String(text||''),docs=new Set();
  if(/소방전술\s*3|구급/.test(src))docs.add('ems');
  if(/화재\s*1/.test(src))docs.add('fire1');
  if(/화재\s*2/.test(src))docs.add('fire2');
  if(/소방전술\s*1/.test(src)&&!/화재\s*[12]/.test(src)){docs.add('fire1');docs.add('fire2')}
  if(/예방실무\s*1/.test(src))docs.add('prevention1');
  if(/예방실무\s*2/.test(src))docs.add('prevention2');
  if(/예방실무(?!\s*[12])/.test(src)){docs.add('prevention1');docs.add('prevention2')}
  for(let i=1;i<=5;i++)if(new RegExp('소방법령\\s*'+i).test(src))docs.add('law'+i);
  if(/소방법령(?!\s*[1-5])/.test(src))for(let i=1;i<=5;i++)docs.add('law'+i);
  return [...docs]
}
function docsForOfficialNotice(item){
  const rows=catalogRows(),raw=noticeHaystack(item),hay=normalizeToken(raw),exact=new Set();
  const itemId=queryId(item?.url);
  for(const row of rows){
    const pageId=queryId(row.officialPage);
    if(itemId&&pageId&&itemId===pageId)exact.add(row.key);
    for(const expected of row.expectedNames||[]){
      const token=normalizeToken(String(expected).replace(/\.pdf$/i,''));
      if(token.length>=5&&hay.includes(token))exact.add(row.key);
    }
    const label=normalizeToken(row.label);
    if(label.length>=5&&hay.includes(label))exact.add(row.key);
  }
  if(exact.size)return{docs:[...exact],scope:'exact'};
  const family=familyDocs(raw).filter(key=>rows.some(row=>row.key===key));
  if(family.length)return{docs:family,scope:'family'};
  const textbook=item?.kind==='official_textbook'||item?.sourceId==='nfsa-materials';
  if(textbook&&/공통교재|공식교재|교재/.test(raw))return{docs:rows.map(row=>row.key),scope:'catalog-wide'};
  return{docs:[],scope:'unmapped'};
}
function impactForOfficialNotice(item){
  const changed=item?.changeState==='updated'||item?.changeState==='new';
  const relevant=item?.kind==='official_textbook'||item?.kind==='official_standard'||item?.sourceId==='nfsa-materials';
  const mapping=relevant?docsForOfficialNotice(item):{docs:[],scope:'not-applicable'};
  const rows=mapping.docs.map(doc=>impactForRange(doc,1,100000));
  const conceptIds=[...new Set(rows.flatMap(row=>row.conceptIds))];
  const questionIds=[...new Set(rows.flatMap(row=>row.questionIds))];
  const unresolved=!!(changed&&relevant&&!mapping.docs.length);
  return{
    noticeId:String(item?.id||''),title:String(item?.title||''),changeState:String(item?.changeState||''),kind:String(item?.kind||''),
    docs:mapping.docs,scope:mapping.scope,conceptIds,questionIds,
    conceptCount:conceptIds.length,questionCount:questionIds.length,
    needsRevalidation:!!(changed&&relevant&&mapping.docs.length),
    unresolved,
    automaticMutationAllowed:false
  };
}
function officialSnapshotImpact(value){
  const items=Array.isArray(value)?value:Array.isArray(value?.items)?value.items:[];
  const notices=items.map(impactForOfficialNotice).filter(row=>row.needsRevalidation||row.unresolved);
  const conceptIds=[...new Set(notices.flatMap(row=>row.conceptIds))];
  const questionIds=[...new Set(notices.flatMap(row=>row.questionIds))];
  const docs=[...new Set(notices.flatMap(row=>row.docs))];
  const unresolvedNoticeIds=notices.filter(row=>row.unresolved).map(row=>row.noticeId);
  return{
    version:'119-official-source-impact-report-v1',
    notices,noticeCount:notices.length,docs,conceptIds,questionIds,
    conceptCount:conceptIds.length,questionCount:questionIds.length,
    unresolvedNoticeIds,unresolvedCount:unresolvedNoticeIds.length,
    needsRevalidation:notices.some(row=>row.needsRevalidation),
    failClosed:unresolvedNoticeIds.length>0,
    automaticMutationAllowed:false
  };
}
function renderOfficialImpactReport(report){
  if(typeof document==='undefined')return;
  const card=document.querySelector('[data-official-monitor-card]');
  if(!card)return;
  card.querySelector('[data-source-impact-report]')?.remove();
  if(!report?.noticeCount)return;
  const box=document.createElement('div');
  box.dataset.sourceImpactReport='1';
  box.className='official-monitor-meta official-source-impact-report';
  const main=document.createElement('span');
  main.textContent=report.needsRevalidation
    ?`공식자료 변경 영향 · 개념 ${report.conceptCount} · A/B 검증문항 ${report.questionCount} · 재검증 필요`
    :'공식자료 변경 영향범위 확인 필요';
  box.appendChild(main);
  if(report.docs.length){const docs=document.createElement('span');docs.textContent='영향 문서 '+report.docs.join(', ');box.appendChild(docs)}
  if(report.unresolvedCount){const unresolved=document.createElement('span');unresolved.textContent=`영향범위 미매핑 ${report.unresolvedCount}건 · 자동 반영 금지`;box.appendChild(unresolved)}
  const anchor=card.querySelector('.official-monitor-meta')||card.querySelector('.toolbar');
  anchor?.insertAdjacentElement('afterend',box);
}
function onOfficialMonitor(detail){
  lastOfficialReport=officialSnapshotImpact(detail);
  const render=()=>renderOfficialImpactReport(lastOfficialReport);
  if(typeof queueMicrotask==='function')queueMicrotask(render);else if(typeof setTimeout==='function')setTimeout(render,0);
  if(typeof window.dispatchEvent==='function'&&typeof window.CustomEvent==='function'){
    window.dispatchEvent(new window.CustomEvent('aitutor-official-source-impact',{detail:lastOfficialReport}));
  }
}

function audit(){
  const state=snapshot(),invalidRanges=[],conceptsWithoutRanges=[];
  for(const concept of state.concepts){
    const raw=Array.isArray(concept?.sourceRanges)?concept.sourceRanges:[];
    const valid=rangesFor(concept);
    if(!valid.length)conceptsWithoutRanges.push(concept.id);
    for(const range of raw)if(!normalizeRange(range))invalidRanges.push({conceptId:concept.id,range});
  }
  const orphanVerified=state.questions.filter(q=>!q?.conceptId||!state.conceptById.has(q.conceptId)).map(q=>q.id);
  const reviewed=state.questions.filter(q=>q?.pageVerified===true||String(q?.reviewStatus||'').startsWith('source-reviewed'));
  const reviewedUnmapped=reviewed.filter(q=>{
    const concept=state.conceptById.get(q.conceptId);
    return !concept||rangesFor(concept).length===0;
  }).map(q=>q.id);
  const docs={};
  for(const concept of state.concepts){
    for(const range of rangesFor(concept)){
      const row=docs[range.doc]||(docs[range.doc]={rangeCount:0,conceptIds:new Set(),verifiedQuestionIds:new Set()});
      row.rangeCount++;
      row.conceptIds.add(concept.id);
      for(const id of state.questionIdsByConcept.get(concept.id)||[])row.verifiedQuestionIds.add(id);
    }
  }
  const byDoc=Object.fromEntries(Object.entries(docs).map(([doc,row])=>[doc,{
    rangeCount:row.rangeCount,
    conceptCount:row.conceptIds.size,
    verifiedQuestionCount:row.verifiedQuestionIds.size
  }]));
  const catalogDocs=catalogRows().map(row=>row.key);
  const syntheticEms=impactForOfficialNotice({id:'audit-ems',sourceId:'nfsa-materials',kind:'official_textbook',changeState:'updated',title:'공통교재 소방전술3(구급) 개정',attachments:[{label:'13. 소방전술3(구급)-저용량.pdf',url:'https://www.nfa.go.kr/example.pdf'}]});
  const syntheticAll=impactForOfficialNotice({id:'audit-all',sourceId:'nfsa-materials',kind:'official_textbook',changeState:'updated',title:'공통교재 개정 안내'});
  const monitorBridgeOk=!catalogDocs.length||(
    syntheticEms.docs.length===1&&syntheticEms.docs[0]==='ems'&&syntheticEms.needsRevalidation&&syntheticEms.conceptCount>0&&
    syntheticAll.scope==='catalog-wide'&&syntheticAll.docs.length===catalogDocs.length&&syntheticAll.needsRevalidation
  );
  lastAudit={
    version:'119-source-impact-v2-monitor-bridge',
    conceptCount:state.concepts.length,
    verifiedQuestionCount:state.questions.length,
    reviewedQuestionCount:reviewed.length,
    conceptsWithoutRanges,
    invalidRanges,
    orphanVerified,
    reviewedUnmapped,
    byDoc,
    monitorBridgeOk,
    complete:invalidRanges.length===0&&orphanVerified.length===0&&reviewedUnmapped.length===0&&monitorBridgeOk
  };
  return lastAudit;
}

V.SourceImpact119={
  version:'119-source-impact-v2-monitor-bridge',
  impactFor,impactForRange,diffImpact,docsForOfficialNotice,impactForOfficialNotice,officialSnapshotImpact,audit,
  get lastAudit(){return lastAudit},
  get lastOfficialReport(){return lastOfficialReport}
};
if(typeof window.addEventListener==='function')window.addEventListener('aitutor-official-monitor',event=>onOfficialMonitor(event?.detail||{}));
})();


;
/* ---- exam-version-119.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const TARGET_EXAM_YEAR=2027;
const CONTENT_BASELINE_YEAR=2026;
const OFFICIAL_HOSTS=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','nfsa.go.kr']);
const MEANINGFUL_CHANGE_KINDS=new Set([
  'recruitment_notice',
  'exam_subjects',
  'question_count',
  'exam_duration',
  'ems_scope',
  'fire_scope',
  'official_textbook',
  'official_clinical_standard'
]);

// Target-year evidence must be added only after an official source is confirmed.
// Empty means "do not claim a 2027 official change yet".
const targetYearEvidence=[];
const recordedChanges=[];

function officialUrl(url){
  try{return OFFICIAL_HOSTS.has(new URL(String(url||'')).hostname.toLowerCase())}catch{return false}
}
function sourceYear(row){
  const m=String(row?.label||'').match(/20\d{2}/);
  return m?Number(m[0]):null;
}
function meaningfulChanges(){
  return recordedChanges.filter(x=>
    x?.status==='confirmed'&&
    x?.meaningful===true&&
    MEANINGFUL_CHANGE_KINDS.has(x?.kind)&&
    Array.isArray(x?.officialSources)&&
    x.officialSources.length>0&&
    x.officialSources.every(officialUrl)
  );
}
function summary(){
  const docs=Object.values(V.SourceCatalog119?.catalog||{});
  const years=[...new Set(docs.map(sourceYear).filter(Number.isFinite))];
  const changes=meaningfulChanges();
  return{
    version:'119-exam-version-truth-v1',
    targetExamYear:TARGET_EXAM_YEAR,
    contentBaselineYear:CONTENT_BASELINE_YEAR,
    curriculumVersion:String(V.curriculum?.version||''),
    officialSourceYears:years,
    targetYearOfficialEvidenceCount:targetYearEvidence.filter(x=>officialUrl(x?.url)).length,
    targetYearOfficialScopeConfirmed:false,
    meaningfulChangeCount:changes.length,
    meaningfulChanges:changes,
    status:'BASELINE_OFFICIAL_TARGET_PENDING'
  };
}
function audit(){
  const docs=Object.values(V.SourceCatalog119?.catalog||{});
  const s=summary();
  const checks={
    targetSeparatedFromBaseline:TARGET_EXAM_YEAR>CONTENT_BASELINE_YEAR,
    curriculumBaselineExplicit:String(V.curriculum?.version||'').includes(String(CONTENT_BASELINE_YEAR)),
    officialCatalogPresent:docs.length>0,
    officialCatalogBaselineOnly:docs.every(x=>sourceYear(x)===CONTENT_BASELINE_YEAR),
    officialCatalogUrlsOnly:docs.every(x=>officialUrl(x?.officialPage)),
    noUnverifiedTargetEvidence:targetYearEvidence.every(x=>officialUrl(x?.url)),
    noUnverifiedMeaningfulChange:recordedChanges.every(x=>x?.status!=='confirmed'||(
      MEANINGFUL_CHANGE_KINDS.has(x?.kind)&&
      Array.isArray(x?.officialSources)&&
      x.officialSources.length>0&&
      x.officialSources.every(officialUrl)
    )),
    noSilentBaselinePromotion:s.targetYearOfficialScopeConfirmed===false&&s.contentBaselineYear===CONTENT_BASELINE_YEAR,
    notificationFilterOfficialOnly:meaningfulChanges().every(x=>x.officialSources.every(officialUrl))
  };
  const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
  return{...s,checks,blockers,ready:blockers.length===0};
}
V.ExamVersion119={
  TARGET_EXAM_YEAR,
  CONTENT_BASELINE_YEAR,
  targetYearEvidence,
  recordedChanges,
  meaningfulChanges,
  summary,
  audit,
  policy:{
    officialSourcesOnly:true,
    noChangeNoNotify:true,
    targetYearNoAssumption:true,
    baselineMustStayExplicit:true,
    meaningfulChangeKinds:[...MEANINGFUL_CHANGE_KINDS]
  }
};
})();

;
/* ---- official-monitor.js ---- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const KEY='aitutor9:official-monitor:v1';
const SNAPSHOT_URL='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json';
const START_AT='2026-09-20';
const REFRESH_MS=30*60*1000;
const MAX_SNAPSHOT_AGE_MS=90*60*1000;
const ALLOWED=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','cherish.nfsa.go.kr','gongmuwon.gosi.kr']);
let state={status:'idle',snapshot:null,unseen:[],lastFetched:0,error:'',transport:'',notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
let timer=null;
let observer=null;

const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const official=url=>{try{const u=new URL(String(url||''));return u.protocol==='https:'&&ALLOWED.has(u.hostname.toLowerCase())}catch{return false}};
const validSnapshot=x=>{
  const required=Number(x?.policy?.requiredSourceCount||0);
  const total=Number(x?.policy?.totalSourceCount||x?.sourceStatus?.length||0);
  return !!x&&x.version==='119-official-monitor-snapshot-v1'&&x.officialOnly===true&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)&&required>0&&total>=required&&x.sourceStatus.length===total&&x.items.every(i=>i&&i.id&&i.title&&official(i.url));
};
const eligibleNotice=i=>!!i.meaningful&&i.notificationEligible!==false;
const eligibleFirstRun=i=>eligibleNotice(i)&&String(i.publishedAt||'')>=START_AT;

function summary(){
  return {
    status:state.status,
    error:state.error,
    generatedAt:state.snapshot?.generatedAt||'',
    healthy:state.snapshot?.healthy===true,
    items:state.snapshot?.items||[],
    sources:state.snapshot?.sourceStatus||[],
    unseen:state.unseen||[],
    unseenCount:(state.unseen||[]).length,
    targetExamYear:state.snapshot?.targetExamYear||2027,
    baselineYear:state.snapshot?.baselineYear||2026,
    requiredSourceCount:Number(state.snapshot?.policy?.requiredSourceCount||0),
    totalSourceCount:Number(state.snapshot?.policy?.totalSourceCount||state.snapshot?.sourceStatus?.length||0),
    coverageComplete:state.snapshot?.coverageComplete===true,
    degraded:state.snapshot?.degraded===true||state.snapshot?.healthy!==true,
    lastSuccessfulAt:state.snapshot?.lastSuccessfulAt||state.snapshot?.generatedAt||'',
    lastFetched:state.lastFetched,
    transport:state.transport||'',
    notificationPermission:state.notificationPermission
  };
}

const revisionKey=i=>String(i?.id||'')+':'+String(i?.fingerprint||'legacy');
const priority=i=>({change_notice:0,exam_schedule:1,exam_scope:2,exam_policy:3,recruitment_notice:4,official_textbook:5,official_standard:6})[i?.kind]??9;
const DAY_MS=86400000;
function dateUtc(value){
  const m=String(value||'').match(/^(20\d{2})-(\d{2})-(\d{2})$/);
  return m?Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])):null
}
function dday(value){
  const target=dateUtc(value);if(target===null)return'';
  const now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  const n=Math.round((target-today)/DAY_MS);
  return n===0?'D-Day':n>0?'D-'+n:'D+'+Math.abs(n)
}
function scheduleEntries(x){
  const s=x?.schedule||{},rows=[];
  if(s.applicationStart)rows.push({label:'원서접수 시작',date:s.applicationStart});
  if(s.applicationEnd)rows.push({label:'원서접수 마감',date:s.applicationEnd});
  if(s.writtenExam)rows.push({label:'필기시험',date:s.writtenExam});
  if(s.physicalExam)rows.push({label:'체력시험',date:s.physicalExam});
  if(s.interview)rows.push({label:'면접시험',date:s.interview});
  if(s.finalResult)rows.push({label:'최종발표',date:s.finalResult});
  return rows
}
function icsEscape(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsDate(value){return String(value||'').replace(/-/g,'')}
function downloadScheduleCalendar(){
  const m=summary(),pool=[...(m.unseen||[]),...(m.items||[])],item=pool.find(x=>eligibleNotice(x)&&scheduleEntries(x).length);
  if(!item)return false;
  const rows=scheduleEntries(item),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//119 Study//Official Exam Schedule//KO','CALSCALE:GREGORIAN'];
  rows.forEach((row,i)=>{
    lines.push('BEGIN:VEVENT','UID:119-'+item.id+'-'+i+'@study119','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+icsDate(row.date),'SUMMARY:'+icsEscape('119 '+row.label+' · '+item.title),'DESCRIPTION:'+icsEscape('공식 출처: '+item.url),'URL:'+item.url,'END:VEVENT')
  });
  lines.push('END:VCALENDAR');
  const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='119-'+(m.targetExamYear||2027)+'-official-schedule.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  return true
}
function unseenFor(snapshot,m){
  if(snapshot?.healthy!==true||snapshot?.notificationSuppressed===true)return[];
  const seenRevisions=new Set(m.seenRevisionKeys||[]);
  const seenIds=new Set(m.seenIds||[]);
  return !m.initialized
    ? snapshot.items.filter(eligibleFirstRun)
    : snapshot.items.filter(i=>eligibleNotice(i)&&(!seenRevisions.has(revisionKey(i))&&(!seenIds.has(i.id)||i.changeState==='updated')));
}

function syncBadge(){
  const n=(state.unseen||[]).length;
  try{
    if(n&&navigator.setAppBadge)navigator.setAppBadge(n).catch(()=>{});
    else if(!n&&navigator.clearAppBadge)navigator.clearAppBadge().catch(()=>{});
  }catch{}
}
function dispatch(){
  window.dispatchEvent(new CustomEvent('aitutor-official-monitor',{detail:summary()}));
  syncBadge();
  decorate();
}

function itemHtml(x,isNew){
  const label=x.changeState==='updated'?'공고 내용 변경':x.kind==='exam_schedule'?'시험 일정':x.reviewRequired?'검토 필요':'공식 공고';
  const s=x.schedule||{},schedule=[];
  if(s.applicationStart||s.applicationEnd){
    const start=s.applicationStart||'?';const end=s.applicationEnd?' ~ '+s.applicationEnd:'';
    schedule.push('원서접수 '+start+end+(s.applicationStart?' · '+dday(s.applicationStart):''))
  }
  if(s.writtenExam)schedule.push('필기 '+s.writtenExam+' · '+dday(s.writtenExam));
  if(s.physicalExam)schedule.push('체력 '+s.physicalExam+' · '+dday(s.physicalExam));
  if(s.interview)schedule.push('면접 '+s.interview+' · '+dday(s.interview));
  if(s.finalResult)schedule.push('최종발표 '+s.finalResult+' · '+dday(s.finalResult));
  const scheduleHtml=schedule.length?'<small class="official-monitor-schedule">'+schedule.map(esc).join(' · ')+'</small>':'';
  const attachmentHtml=!schedule.length&&Number(x.attachmentCount||0)>0?'<small class="official-monitor-attachment">상세 일정은 공식 첨부 공고문 확인 · '+Number(x.attachmentCount||0)+'개</small>':'';
  const changeHtml=Array.isArray(x.changeSummary)&&x.changeSummary.length?'<small class="official-monitor-change-summary">'+x.changeSummary.map(esc).join(' · ')+'</small>':'';
  return '<a class="official-monitor-item '+(isNew?'new':'')+'" href="'+esc(x.url)+'" target="_blank" rel="noopener"><div><span class="tag '+(x.reviewRequired||x.changeState==='updated'?'warn':'blue')+'">'+esc(label)+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.sourceLabel)+(x.publishedAt?' · '+esc(x.publishedAt):'')+'</small>'+scheduleHtml+attachmentHtml+changeHtml+'</div><span aria-hidden="true">↗</span></a>';
}

function renderKey(){
  const m=summary();
  return [m.status,m.generatedAt,m.lastFetched,m.unseenCount,m.notificationPermission,m.transport,m.error].join('|')
}

function cardHtml(){
  const m=summary();
  const loading=m.status==='loading';
  const error=m.status==='error';
  const stale=m.status==='stale';
  const targetItems=(m.items||[]).filter(eligibleNotice);
  const latest=[...(m.unseenCount?m.unseen:targetItems)].sort((a,b)=>priority(a)-priority(b)||String(b.publishedAt||'').localeCompare(String(a.publishedAt||''))).slice(0,8);
  const sourceOk=(m.sources||[]).filter(x=>x.ok).length;
  const sourceTotal=(m.sources||[]).length;
  const generatedMs=Date.parse(String(m.generatedAt||''));
  const fresh=m.healthy===true&&Number.isFinite(generatedMs)&&Date.now()-generatedMs<=MAX_SNAPSHOT_AGE_MS;
  const requiredSourceCount=Number(m.requiredSourceCount||0);
  const totalSourceCount=Number(m.totalSourceCount||sourceTotal||0);
  const requiredHealthy=(m.sources||[]).filter(x=>x.required!==false).every(x=>x.ok);
  const completeSources=fresh&&m.coverageComplete===true&&requiredHealthy&&sourceTotal===totalSourceCount&&sourceOk===sourceTotal;
  const lastGood=m.lastSuccessfulAt?' · 마지막 정상 '+new Date(m.lastSuccessfulAt).toLocaleString('ko-KR'):'';
  const status=loading?'공식 사이트 확인 중':stale||!fresh?'최근 저장본 표시 · 연결 확인 필요'+lastGood:error?'공식 감시 연결 확인 필요':!completeSources?'시험 공고 감시 정상 · 교재/학교 보조소스 확인 필요':m.generatedAt?'최근 수집 '+new Date(m.generatedAt).toLocaleString('ko-KR'):'감시 데이터 준비 중';
  const transportLabel=m.transport==='app-api'?'앱 서버':m.transport==='snapshot-fallback'?'공식 스냅샷':m.transport==='cached-snapshot'?'기기 저장본':'';
  const unseenRevisions=new Set(m.unseen.map(revisionKey));
  const items=latest.length?latest.map(x=>itemHtml(x,unseenRevisions.has(revisionKey(x)))).join(''):'<div class="empty official-monitor-empty">새 시험 관련 공식 공고가 없습니다.</div>';
  const notifyLabel=m.notificationPermission==='granted'?'앱 알림 켜짐':m.notificationPermission==='denied'?'앱 알림 차단됨':'앱 알림 켜기';
  const resultTag=m.unseenCount?'<span class="tag warn">새 공고·변경 '+m.unseenCount+'건</span>':completeSources?'<span class="tag good">새 변경 없음</span>':'<span class="tag warn">일부 공식소스 확인 필요</span>';
  const calendarTarget=targetItems.find(x=>scheduleEntries(x).length>0);
  return '<section class="card official-monitor-card" aria-live="polite" aria-atomic="false" data-official-monitor-card data-monitor-key="'+esc(renderKey())+'"><div class="toolbar"><div><span class="eyebrow">공식 공고 자동감시</span><h2>2027 시험 공고 · 일정 · 교재 변경</h2></div><span class="spacer"></span>'+resultTag+'</div><p class="muted">앱이 매시간 국가공무원 채용시스템의 소방청 채용·시험 정보와 중앙소방학교 공식 공고·교재만 확인합니다. 새 공고는 앱을 열거나 다시 활성화할 때 표시하며, 학습 기준은 공식 원문을 확인한 뒤 반영합니다.</p><div class="official-monitor-meta"><span>'+esc(status)+'</span><span>공식 소스 '+sourceOk+'/'+(totalSourceCount||sourceTotal||0)+'</span><span>목표 '+esc(m.targetExamYear)+' · 현재 기준 '+esc(m.baselineYear)+'</span></div><div class="toolbar official-monitor-actions"><button class="btn small" data-monitor-refresh>'+(loading?'확인 중…':'지금 확인')+'</button><button class="btn small ghost" data-monitor-notify '+(m.notificationPermission==='denied'?'disabled':'')+'>'+esc(notifyLabel)+'</button>'+(calendarTarget?'<button class="btn small ghost" data-monitor-calendar>일정 캘린더 저장</button>':'')+(m.unseenCount?'<button class="btn small ghost" data-monitor-seen>확인 완료</button>':'')+'</div><div class="official-monitor-list">'+items+'</div></section>';
}

function bannerHtml(){
  const m=summary();
  if(!m.unseenCount)return'';
  return '<section class="card official-monitor-banner" aria-live="polite" data-official-monitor-banner data-monitor-key="'+esc(renderKey())+'"><button class="official-monitor-banner-btn" data-monitor-open><span><b>새 공식 시험 공고·변경 '+m.unseenCount+'건</b><small>국가공무원 채용시스템·중앙소방학교 공식 출처만 확인</small></span><strong>확인 →</strong></button></section>';
}

function decorate(){
  const key=renderKey();
  const resources=document.querySelector('.page-resources .resources-119');
  let card=resources?.querySelector('[data-official-monitor-card]');
  if(resources&&!card){resources.insertAdjacentHTML('afterbegin',cardHtml());card=resources.querySelector('[data-official-monitor-card]')}
  else if(card&&card.dataset.monitorKey!==key)card.outerHTML=cardHtml();

  const home=document.querySelector('.page-home .home-main');
  const old=home?.querySelector('[data-official-monitor-banner]');
  const html=bannerHtml();
  if(old&&!html)old.remove();
  else if(old&&html&&old.dataset.monitorKey!==key)old.outerHTML=html;
  else if(home&&html&&!old)home.insertAdjacentHTML('afterbegin',html);
}

async function notifyUnseen(){
  const s=summary(),m=read();
  if(!s.unseenCount||typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const key=s.unseen.map(revisionKey).sort().join(',');
  if(m.lastNotifiedKey===key)return;
  const first=s.unseen[0];
  const body=s.unseenCount===1?first.title:first.title+' 외 '+(s.unseenCount-1)+'건';
  try{
    const reg=await navigator.serviceWorker?.ready;
    if(reg?.showNotification)await reg.showNotification('119 시험 공식 공고',{body,tag:'119-official-notice',renotify:false,data:{page:'resources'}});
    else new Notification('119 시험 공식 공고',{body});
    write({...m,lastNotifiedKey:key});
  }catch{}
}

async function fetchNetworkSnapshot(force){
  const suffix=force?'?t='+Date.now():'';
  const candidates=[
    {url:'/api/official-monitor'+suffix,transport:'app-api'},
    {url:SNAPSHOT_URL+suffix,transport:'snapshot-fallback'}
  ];
  let lastError=null;
  for(const candidate of candidates){
    try{
      const res=await fetch(candidate.url,{cache:force?'no-store':'default'});
      if(!res.ok)throw new Error('HTTP_'+res.status);
      const snapshot=await res.json();
      if(!validSnapshot(snapshot))throw new Error('INVALID_OFFICIAL_MONITOR_SNAPSHOT');
      return{snapshot,transport:snapshot.transport||candidate.transport}
    }catch(err){lastError=err}
  }
  throw lastError||new Error('OFFICIAL_MONITOR_UNAVAILABLE')
}

async function refresh({force=false}={}){
  if(!force&&state.status==='loading')return summary();
  if(!force&&state.lastFetched&&Date.now()-state.lastFetched<REFRESH_MS)return summary();
  state={...state,status:'loading',error:''};dispatch();
  try{
    const {snapshot,transport}=await fetchNetworkSnapshot(force);
    const m=read();
    const unseen=unseenFor(snapshot,m);
    if(!m.initialized){
      const oldItems=snapshot.items.filter(i=>!eligibleFirstRun(i));
      const oldIds=oldItems.map(i=>i.id),oldRevisions=oldItems.map(revisionKey);
      write({...m,initialized:true,initializedAt:Date.now(),seenIds:[...new Set([...(m.seenIds||[]),...oldIds])].slice(-500),seenRevisionKeys:[...new Set([...(m.seenRevisionKeys||[]),...oldRevisions])].slice(-500)});
    }
    const persisted=read();
    write({...persisted,lastSnapshot:snapshot,lastSnapshotAt:Date.now(),lastTransport:transport});
    const generatedMs=Date.parse(String(snapshot.generatedAt||''));
    const staleSnapshot=snapshot.healthy!==true||!Number.isFinite(generatedMs)||Date.now()-generatedMs>MAX_SNAPSHOT_AGE_MS;
    state={status:staleSnapshot?'stale':'ready',snapshot,unseen,lastFetched:Date.now(),error:'',transport,notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
    dispatch();
    await notifyUnseen();
    return summary();
  }catch(err){
    const m=read(),cached=m.lastSnapshot;
    if(validSnapshot(cached)){
      state={status:'stale',snapshot:cached,unseen:unseenFor(cached,m),lastFetched:Date.now(),error:String(err?.message||err).slice(0,120),transport:'cached-snapshot',notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
      dispatch();
      return summary();
    }
    state={...state,status:'error',lastFetched:Date.now(),error:String(err?.message||err).slice(0,120),transport:''};
    dispatch();
    return summary();
  }
}

function markSeen(){
  const s=summary(),m=read(),ids=s.unseen.map(x=>x.id),revisions=s.unseen.map(revisionKey);
  const seen=[...new Set([...(m.seenIds||[]),...ids])].slice(-500);
  const seenRevisionKeys=[...new Set([...(m.seenRevisionKeys||[]),...revisions])].slice(-500);
  write({...m,initialized:true,seenIds:seen,seenRevisionKeys,lastSeenAt:Date.now(),lastNotifiedKey:''});
  state={...state,unseen:[]};
  dispatch();
  return summary();
}

async function enableNotifications(){
  if(typeof Notification==='undefined')return'unsupported';
  const result=await Notification.requestPermission();
  state={...state,notificationPermission:result};
  dispatch();
  if(result==='granted')await notifyUnseen();
  return result;
}

function openMonitorPage(){
  window.AITUTOR_V9?.App?.go?.('resources');
  setTimeout(()=>document.querySelector('[data-official-monitor-card]')?.scrollIntoView({behavior:'smooth',block:'start'}),0);
}
function start(){
  if(observer)observer.disconnect();
  const root=document.querySelector('#app');
  if(root){observer=new MutationObserver(()=>decorate());observer.observe(root,{childList:true,subtree:true})}
  document.addEventListener('click',async e=>{
    const b=e.target instanceof Element?e.target.closest('[data-monitor-refresh],[data-monitor-seen],[data-monitor-notify],[data-monitor-open],[data-monitor-calendar]'):null;
    if(!b)return;
    if(b.hasAttribute('data-monitor-open')){openMonitorPage();return}
    if(b.hasAttribute('data-monitor-refresh')){await refresh({force:true});return}
    if(b.hasAttribute('data-monitor-seen')){markSeen();return}
    if(b.hasAttribute('data-monitor-notify')){await enableNotifications();return}
    if(b.hasAttribute('data-monitor-calendar')){downloadScheduleCalendar();return}
  });
  refresh().catch(()=>{});
  if(timer)clearInterval(timer);
  timer=setInterval(()=>{if(document.visibilityState==='visible')refresh().catch(()=>{})},REFRESH_MS);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh().catch(()=>{})});
  navigator.serviceWorker?.addEventListener?.('message',e=>{if(e.data?.type==='119-official-monitor-open')openMonitorPage()});
  const qs=new URLSearchParams(location.search);
  if(qs.get('page')==='resources'||location.hash==='#official-monitor'){
    history.replaceState(null,'',location.pathname+location.hash);
    setTimeout(openMonitorPage,0);
  }
  decorate();
}

V.OfficialMonitor119={
  version:'119-official-monitor-client-v1',
  refresh,markSeen,enableNotifications,summary,start,
  policy:{officialOnly:true,firstRunStartAt:START_AT,noAutomaticCurriculumMutation:true,rootApiFirst:true,staticSnapshotFallback:true,cachedSnapshotFallback:true,backgroundServerMonitor:true,degradedSnapshotTruth:true,staleSnapshotNeverClaimsNoChange:true,wafBypassForbidden:true,machineFriendlyOfficialSources:true,requiredExamSourceCanStayHealthyWhileSupplementalSourceDegrades:true,detailScheduleDisplay:true,neverGuessMissingDates:true,officialAttachmentHint:true,scheduleDday:true,scheduleCalendarExport:true,devicePushWhenClosed:false}
};
window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();

