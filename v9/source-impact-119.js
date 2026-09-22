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
