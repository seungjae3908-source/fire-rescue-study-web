import './question-contract-audit.mjs';

const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.curriculum?.byId)throw new Error('V66_SOURCE_RANGE_RUNTIME_UNAVAILABLE');

const isVerified=q=>q?.grade==='A'||q?.grade==='B';
const isReviewed=q=>isVerified(q)&&(q?.pageVerified===true||String(q?.reviewStatus||'').includes('source-reviewed'));
const pagePattern=/(\d{1,4})(?:\s*[·~\-–]\s*(\d{1,4}))?\s*쪽/g;
const numericRanges=concept=>(concept?.sourceRanges||[]).filter(r=>
  r?.doc&&Number.isInteger(Number(r?.from))&&Number.isInteger(Number(r?.to))&&Number(r.from)>=1&&Number(r.to)>=Number(r.from)
).map(r=>({doc:String(r.doc),from:Number(r.from),to:Number(r.to)}));

function pagesFrom(source){
  const pages=new Set();
  for(const match of String(source||'').matchAll(pagePattern)){
    const from=Number(match[1]),to=Number(match[2]||match[1]);
    if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from||to-from>1000)continue;
    for(let p=from;p<=to;p++)pages.add(p);
  }
  return [...pages];
}
function explicitDocs(source){
  const s=String(source||''),docs=new Set();
  if(/소방전술\s*3\s*\(구급\)/.test(s))docs.add('ems');
  if(/소방전술\s*1\s*\(화재\s*1\)/.test(s))docs.add('fire1');
  if(/소방전술\s*1\s*\(화재\s*2\)/.test(s))docs.add('fire2');
  if(/예방실무\s*1/.test(s))docs.add('prevention1');
  if(/예방실무\s*2/.test(s))docs.add('prevention2');
  for(let i=1;i<=5;i++)if(new RegExp('소방법령\\s*'+i).test(s))docs.add('law'+i);
  return docs;
}

const reviewed=(V.questions||[]).filter(isReviewed);
const scoped=[],missingConcept=[],missingRanges=[],docMismatch=[],pageMismatch=[];
for(const q of reviewed){
  const pages=pagesFrom(q.source);
  if(!pages.length)continue;
  const concept=V.curriculum.byId[q.conceptId];
  if(!concept){missingConcept.push({id:q.id,conceptId:q.conceptId,source:q.source});continue}
  const ranges=numericRanges(concept);
  if(!ranges.length){missingRanges.push({id:q.id,conceptId:q.conceptId,source:q.source});continue}
  const docs=explicitDocs(q.source);
  const candidates=docs.size?ranges.filter(r=>docs.has(r.doc)):ranges;
  if(docs.size&&!candidates.length){
    docMismatch.push({id:q.id,conceptId:q.conceptId,source:q.source,sourceDocs:[...docs],conceptRanges:ranges});
    continue;
  }
  const overlap=candidates.some(r=>pages.some(page=>page>=r.from&&page<=r.to));
  if(!overlap)pageMismatch.push({id:q.id,conceptId:q.conceptId,source:q.source,pages,conceptRanges:candidates});
  scoped.push({id:q.id,conceptId:q.conceptId,pages,ranges:candidates});
}

const summary={
  version:'119-v66-question-source-range-consistency-v1',
  verified:(V.questions||[]).filter(isVerified).length,
  reviewed:reviewed.length,
  pageScoped:scoped.length,
  missingConcept:missingConcept.length,
  missingRanges:missingRanges.length,
  docMismatch:docMismatch.length,
  pageMismatch:pageMismatch.length
};
console.log('V66_QUESTION_SOURCE_RANGE_SUMMARY',JSON.stringify(summary,null,2));
if(missingConcept.length)console.error('V66_MISSING_CONCEPT',JSON.stringify(missingConcept.slice(0,30),null,2));
if(missingRanges.length)console.error('V66_MISSING_RANGES',JSON.stringify(missingRanges.slice(0,30),null,2));
if(docMismatch.length)console.error('V66_DOC_MISMATCH',JSON.stringify(docMismatch.slice(0,30),null,2));
if(pageMismatch.length)console.error('V66_PAGE_MISMATCH',JSON.stringify(pageMismatch.slice(0,60),null,2));

if(scoped.length<100)throw new Error('V66_SOURCE_RANGE_AUDIT_NOT_EXERCISED '+JSON.stringify(summary));
if(missingConcept.length||missingRanges.length||docMismatch.length||pageMismatch.length){
  throw new Error('V66_QUESTION_SOURCE_RANGE_FAILED '+JSON.stringify({
    missingConcept:missingConcept.length,
    missingRanges:missingRanges.length,
    docMismatch:docMismatch.length,
    pageMismatch:pageMismatch.length,
    first:missingConcept[0]||missingRanges[0]||docMismatch[0]||pageMismatch[0]
  }));
}
console.log('V66_QUESTION_SOURCE_RANGE_CONSISTENCY_COMPLETE');
