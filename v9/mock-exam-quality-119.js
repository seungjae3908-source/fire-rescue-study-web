'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const family=q=>V.QuestionType119?.classify?.(q)?.key||'recall';
const diff=q=>q.difficulty||V.QuestionDifficulty?.infer?.(q)||'mid';
const target=(level,n)=>{const r=level==='low'?[.65,.30,.05]:level==='high'?[.10,.35,.55]:[.25,.55,.20];return{low:Math.round(n*r[0]),mid:Math.round(n*r[1]),high:n-Math.round(n*r[0])-Math.round(n*r[1])}};
function recent(history,limit=4){const s=new Set;for(const h of (history||[]).slice(-limit))for(const id of h.questionIds||[])s.add(id);return s}
function pick(arr,n,level,scopeIds,history=[]){
 const r=recent(history),want=target(level,n),out=[],usedId=new Set,usedConcept=new Set,countScope={},countDiff={low:0,mid:0,high:0},countFam={};
 const add=q=>{out.push(q);usedId.add(q.id);usedConcept.add(q.conceptId);countScope[q.scopeId]=(countScope[q.scopeId]||0)+1;countDiff[diff(q)]++;countFam[family(q)]=(countFam[family(q)]||0)+1};
 for(const scope of shuffle(scopeIds)){const p=shuffle(arr.filter(q=>q.scopeId===scope&&!usedConcept.has(q.conceptId))).sort((a,b)=>(r.has(a.id)-r.has(b.id))+(countDiff[diff(a)]>=(want[diff(a)]||0))-(countDiff[diff(b)]>=(want[diff(b)]||0)));const q=p[0];if(!q)return[];add(q)}
 const cap=Math.max(1,Math.ceil(n/Math.max(1,scopeIds.length))+1);
 while(out.length<n){
  const pool=arr.filter(q=>!usedId.has(q.id)&&!usedConcept.has(q.conceptId)&&(countScope[q.scopeId]||0)<cap);if(!pool.length)break;
  const scored=shuffle(pool).map(q=>{const d=diff(q),f=family(q);return{q,s:(r.has(q.id)?-50:0)+(countDiff[d]<(want[d]||0)?18:0)-(countFam[f]||0)*4-(countScope[q.scopeId]||0)*3}}).sort((a,b)=>b.s-a.s);
  add(scored[0].q)
 }
 return out.length===n?out:[]
}
function sequence(qs){
 const src=shuffle(qs),out=[];
 while(src.length){const last=out.at(-1),prev=out.at(-2);let i=src.findIndex(q=>(!last||q.scopeId!==last.scopeId)&&(!last||!prev||family(q)!==family(last)||family(q)!==family(prev)));if(i<0)i=0;out.push(src.splice(i,1)[0])}
 return out
}
function build({mode='real',level='mid',history=[]}={}){
 const allowed=q=>mode==='real'?(q.grade==='A'||q.grade==='B'):V.QuestionQuality119?.isExamStyle?.(q)!==false,all=(V.questions||[]).filter(allowed);
 const f=pick(all.filter(q=>q.subject==='fire'),25,level,V.curriculum.fire.map(x=>x.id),history),e=pick(all.filter(q=>q.subject==='ems'),40,level,V.curriculum.ems.map(x=>x.id),history);
 return f.length===25&&e.length===40?sequence([...f,...e]):[]
}
function metrics(qs){
 const fam=qs.map(family),run=fam.reduce((m,x,i)=>Math.max(m,x===fam[i-1]?(x===fam[i-2]?3:2):1),0),scopes={},diffs={low:0,mid:0,high:0},answers=[0,0,0,0];
 for(const q of qs){scopes[q.scopeId]=(scopes[q.scopeId]||0)+1;diffs[diff(q)]++;answers[q.a]++}
 return{n:qs.length,uniqueIds:new Set(qs.map(q=>q.id)).size,uniqueConcepts:new Set(qs.map(q=>q.conceptId)).size,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,maxFamilyRun:run,activeFamilies:new Set(fam).size,maxScope:Math.max(0,...Object.values(scopes)),scopes,difficulties:diffs,answers}
}
V.MockExam119={version:'119-v14-mock-engine-v1',build,metrics,family,target,policy:{recentWindow:4,uniqueConceptPerExam:true,maxFamilyRun:2,notOfficialExamWeight:true}};
})();