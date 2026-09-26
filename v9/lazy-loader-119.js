'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const QUESTION_FILES=[
  'questions-quality2-gap-119.js',
  'questions-verified-ems-batch2-119.js',
  'questions-verified-ems-batch3-119.js',
  'questions-verified-fire-batch2-119.js',
  'questions-verified-ems-breadth1-119.js',
  'questions-verified-ems-breadth2-119.js',
  'questions-verified-fire-breadth2-119.js',
  'questions-verified-highyield4-119.js',
  'questions-verified-fire-target1-119.js',
  'questions-verified-fire-target2-119.js',
  'questions-verified-ems-target1-119.js',
  'questions-verified-ems-target2-119.js',
  'questions-verified-v52-fire-breadth-119.js',
  'questions-v52-breadth-batch2-119.js',
  'questions-official-past-2025-119.js',
  'question-variant-engine-119.js',
  'mock-exam-quality-119.js',
  'v29-reviewed-promotions-119.js',
  'v60-source-reviewed-promotions-119.js',
  'analytics-v61-119.js'
];
const CONTENT_FILE='content-core-v69.js';
const QUESTION_CORE_FILE='question-core-v69.js';
const PRECOMPUTED_FILES=["questions-precomputed-v69-1.js","questions-precomputed-v69-2.js","questions-precomputed-v69-3.js","questions-precomputed-v69-4.js","questions-precomputed-v69-5.js","questions-precomputed-v69-6.js"];
const QUESTION_POST_FILE='question-post-v69.js';
let prefetchPromise=null,contentPromise=null,contentReady=false,questionsPromise=null,questionsReady=false;

// V48 deliberately limits visual emphasis to a few high-signal tokens. Keep those
// tokens as real learner-facing underlines as well as marker emphasis so the core
// contract remains visible on every responsive layout without re-highlighting full lines.
function restoreCoreUnderlineSemantics(root=document){
  root?.querySelectorAll?.('.study-key-emphasis').forEach(el=>{
    el.classList.add('study-key-underline');
    el.style.setProperty('text-decoration','underline','important');
    el.style.setProperty('text-decoration-thickness','2px','important');
    el.style.setProperty('text-underline-offset','3px','important');
  });
}
function installCoreUnderlineObserver(){
  if(typeof document==='undefined'||typeof MutationObserver==='undefined')return;
  restoreCoreUnderlineSemantics(document);
  const root=document.documentElement||document.body;
  if(!root)return;
  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes||[]){
        if(node?.nodeType!==1)continue;
        if(node.matches?.('.study-key-emphasis'))restoreCoreUnderlineSemantics(node.parentElement||node);
        else restoreCoreUnderlineSemantics(node);
      }
    }
  }).observe(root,{childList:true,subtree:true});
}
installCoreUnderlineObserver();

function loadScript(file){
  return new Promise((resolve,reject)=>{
    const selector='script[data-lazy-119="'+file+'"]',existing=document.querySelector(selector);
    if(existing?.dataset.loaded==='true')return resolve();
    if(existing){existing.addEventListener('load',()=>resolve(),{once:true});existing.addEventListener('error',()=>reject(new Error('LAZY_119_LOAD_FAILED '+file)),{once:true});return}
    const s=document.createElement('script');
    s.src='./'+file;s.async=false;s.setAttribute('data-lazy-119',file);
    s.addEventListener('load',()=>{s.dataset.loaded='true';resolve()},{once:true});
    s.addEventListener('error',()=>{s.remove();reject(new Error('LAZY_119_LOAD_FAILED '+file))},{once:true});
    document.head.appendChild(s);
  })
}
function deferredAssets(){return [CONTENT_FILE,QUESTION_CORE_FILE,...PRECOMPUTED_FILES,QUESTION_POST_FILE,...QUESTION_FILES]}
function prefetch(){
  if(prefetchPromise)return prefetchPromise;
  const conn=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
  if(conn?.saveData||/^(?:slow-2g|2g)$/i.test(String(conn?.effectiveType||'')))return Promise.resolve([]);
  const files=deferredAssets().filter(Boolean);
  document.documentElement.dataset.deferredPrefetch='loading';
  prefetchPromise=Promise.all(files.map(async file=>{
    try{
      const r=await fetch('./'+file,{cache:'force-cache',credentials:'same-origin'});
      if(!r.ok)throw Error('PREFETCH_HTTP_'+r.status);
      await r.arrayBuffer();
      return file
    }catch(err){
      console.warn('V69_PREFETCH_FAILED',file,err);
      return null
    }
  })).then(rows=>{
    const loaded=rows.filter(Boolean);
    document.documentElement.dataset.deferredPrefetch='ready';
    return loaded
  });
  return prefetchPromise
}
async function ensureContent({background=false}={}){
  if(contentReady)return true;
  if(contentPromise)return contentPromise;
  document.documentElement.dataset.contentLane='loading';
  if(!background)document.body?.setAttribute('aria-busy','true');
  contentPromise=loadScript(CONTENT_FILE).then(()=>{
    contentReady=true;
    document.documentElement.dataset.contentLane='ready';
    window.dispatchEvent(new CustomEvent('aitutor-content-lane-ready',{detail:{file:CONTENT_FILE}}));
    return true
  }).catch(err=>{
    contentPromise=null;
    document.documentElement.dataset.contentLane='error';
    throw err
  }).finally(()=>{if(!background)document.body?.removeAttribute('aria-busy')});
  return contentPromise
}
async function ensureQuestions({background=false}={}){
  if(questionsReady)return V.questions||[];
  if(questionsPromise)return questionsPromise;
  document.documentElement.dataset.questionLane='loading';
  if(!background)document.body?.setAttribute('aria-busy','true');
  questionsPromise=(async()=>{
    await ensureContent({background:true});
    await loadScript(QUESTION_CORE_FILE);
    for(const file of PRECOMPUTED_FILES)await loadScript(file);
    await loadScript(QUESTION_POST_FILE);
    await Promise.all(QUESTION_FILES.map(loadScript));
    V.QuestionDifficulty?.annotate?.(V.questions||[]);
    V.questionById=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));
    V.questionsForConcept=id=>(V.questions||[]).filter(q=>q.conceptId===id);
    const sourceImpact=V.SourceImpact119?.audit?.();
    if(sourceImpact&&!sourceImpact.complete){
      throw new Error('SOURCE_IMPACT_CONTRACT_FAIL '+JSON.stringify({
        invalidRanges:sourceImpact.invalidRanges?.length||0,
        orphanVerified:sourceImpact.orphanVerified?.length||0,
        reviewedUnmapped:sourceImpact.reviewedUnmapped?.length||0
      }));
    }
    questionsReady=true;
    document.documentElement.dataset.questionLane='ready';
    if(!background)document.body?.removeAttribute('aria-busy');
    window.dispatchEvent(new CustomEvent('aitutor-question-lane-ready',{detail:{
      count:(V.questions||[]).length,
      sourceImpact:sourceImpact?{
        complete:sourceImpact.complete,
        conceptCount:sourceImpact.conceptCount,
        verifiedQuestionCount:sourceImpact.verifiedQuestionCount,
        reviewedQuestionCount:sourceImpact.reviewedQuestionCount
      }:null
    }}));
    return V.questions||[]
  })().catch(err=>{
    questionsPromise=null;
    document.documentElement.dataset.questionLane='error';
    if(!background)document.body?.removeAttribute('aria-busy');
    throw err
  });
  return questionsPromise
}
function needsContent(page,studyTab){return String(page||'')==='study'}
function needsContentForCurrentState(){const state=V.Store?.state||{};return needsContent(state.page,state.studyTab)}
function needsQuestions(page,studyTab){
  return ['bank','exam','wrong','stats'].includes(String(page||''))||(page==='study'&&studyTab==='quiz')
}
function needsQuestionsForCurrentState(){
  const state=V.Store?.state||{};
  return needsQuestions(state.page,state.studyTab)||!!V.ExamSession119?.has?.(V.Store?.ownerId)
}
V.Lazy119={
  version:'119-lazy-runtime-v6-precomputed-factories',
  contentFile:CONTENT_FILE,questionCoreFile:QUESTION_CORE_FILE,precomputedFiles:[...PRECOMPUTED_FILES],questionPostFile:QUESTION_POST_FILE,questionFiles:[...QUESTION_FILES],
  deferredAssets,prefetch,ensureContent,ensureQuestions,needsContent,needsContentForCurrentState,needsQuestions,needsQuestionsForCurrentState,
  get prefetched(){return document.documentElement.dataset.deferredPrefetch==='ready'},
  get contentReady(){return contentReady},
  get contentLoading(){return !!contentPromise&&!contentReady},
  get questionsReady(){return questionsReady},
  get questionsLoading(){return !!questionsPromise&&!questionsReady}
};
})();
