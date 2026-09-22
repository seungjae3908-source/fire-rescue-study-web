'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
let lastAudit=null;

const asNumber=value=>Number.isFinite(Number(value))?Number(value):null;
const normalizeRange=range=>{
  const doc=String(range?.doc||'').trim();
  const from=asNumber(range?.from),to=asNumber(range?.to);
  if(!doc||!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from)return null;
  return{doc,from,to,label:String(range?.label||doc)};
};
const rangesFor=concept=>(concept?.sourceRanges||[]).map(normalizeRange).filter(Boolean);
const verifiedQuestions=()=>Array.isArray(V.questions)?V.questions.filter(q=>q?.grade==='A'||q?.grade==='B'):[];

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
  lastAudit={
    version:'119-source-impact-v1',
    conceptCount:state.concepts.length,
    verifiedQuestionCount:state.questions.length,
    reviewedQuestionCount:reviewed.length,
    conceptsWithoutRanges,
    invalidRanges,
    orphanVerified,
    reviewedUnmapped,
    byDoc,
    complete:invalidRanges.length===0&&orphanVerified.length===0&&reviewedUnmapped.length===0
  };
  return lastAudit;
}

V.SourceImpact119={
  version:'119-source-impact-v1',
  impactFor,impactForRange,diffImpact,audit,
  get lastAudit(){return lastAudit}
};
})();
