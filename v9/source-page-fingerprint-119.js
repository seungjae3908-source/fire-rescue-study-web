'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const VERSION='119-source-page-fingerprint-v1';
const KEY_PREFIX='aitutor9:official-page-fingerprint:v1:';
const queued=new Set();
let lastReport=null;

const safeJson=value=>{try{return JSON.parse(value)}catch{return null}};
const read=doc=>{try{return safeJson(localStorage.getItem(KEY_PREFIX+doc)||'')}catch{return null}};
const write=(doc,value)=>{try{localStorage.setItem(KEY_PREFIX+doc,JSON.stringify(value));return true}catch{return false}};
const normalizeText=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const pageKey=row=>Number(row?.bookPage)>0?'b:'+Number(row.bookPage):'p:'+Number(row?.pdfPage||0);
const rangeSort=(a,b)=>a.from-b.from||a.to-b.to;

async function sha256(value){
  if(!globalThis.crypto?.subtle)throw Error('SOURCE_PAGE_FINGERPRINT_CRYPTO_UNAVAILABLE');
  const bytes=new TextEncoder().encode(String(value||''));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function citedBookPages(doc){
  const pages=new Set();
  for(const concept of V.curriculum?.concepts||[]){
    for(const range of concept?.sourceRanges||[]){
      if(range?.doc!==doc)continue;
      const from=Number(range.from),to=Number(range.to);
      if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from||to-from>2500)continue;
      for(let page=from;page<=to;page++)pages.add(page);
    }
  }
  return [...pages].sort((a,b)=>a-b);
}

async function scopeSignature(doc,pages){
  return (await sha256([doc,...pages].join('|'))).slice(0,24);
}

async function buildManifest(doc,{pdfEntry=null}={}){
  const sourcePdf=V.SourcePDF;
  if(!sourcePdf?.openPdf||!sourcePdf?.bookPage)throw Error('SOURCE_PAGE_FINGERPRINT_PDF_RUNTIME_MISSING');
  const entry=pdfEntry||await sourcePdf.openPdf(doc,{timeoutMs:120000});
  const pdf=entry?.pdf;
  if(!pdf||!Number.isInteger(pdf.numPages)||pdf.numPages<1)throw Error('SOURCE_PAGE_FINGERPRINT_INVALID_PDF');
  const cited=citedBookPages(doc);
  const citedSet=new Set(cited);
  const pages=[];
  for(let pdfPage=1;pdfPage<=pdf.numPages;pdfPage++){
    const bookPage=Number(sourcePdf.bookPage(doc,pdfPage))||0;
    if(bookPage<1||!citedSet.has(bookPage))continue;
    const page=await pdf.getPage(pdfPage);
    const tc=await page.getTextContent();
    const text=normalizeText((tc.items||[]).map(x=>x?.str||'').join(' '));
    pages.push({pdfPage,bookPage,hash:await sha256(text),textLength:text.length});
  }
  return{
    version:VERSION,
    doc,
    algorithm:'pdfjs-text-sha256-v1',
    generatedAt:new Date().toISOString(),
    pdfPages:pdf.numPages,
    citedPages:cited.length,
    capturedPages:pages.length,
    scopeSignature:await scopeSignature(doc,cited),
    pages
  };
}

function groupBookRanges(doc,bookPages){
  const sorted=[...new Set((bookPages||[]).filter(x=>Number.isInteger(x)&&x>0))].sort((a,b)=>a-b);
  const ranges=[];
  for(const page of sorted){
    const last=ranges[ranges.length-1];
    if(last&&page===last.to+1)last.to=page;
    else ranges.push({doc,from:page,to:page});
  }
  return ranges;
}

function diffManifests(previous,next){
  const doc=String(next?.doc||previous?.doc||'');
  if(!doc||previous?.doc!==next?.doc)return{doc,comparable:false,reason:'DOC_MISMATCH',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  if(previous?.version!==VERSION||next?.version!==VERSION)return{doc,comparable:false,reason:'VERSION_MISMATCH',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  if(previous?.scopeSignature!==next?.scopeSignature)return{doc,comparable:false,reason:'SCOPE_CHANGED',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  const before=new Map((previous.pages||[]).map(row=>[pageKey(row),row]));
  const after=new Map((next.pages||[]).map(row=>[pageKey(row),row]));
  const keys=new Set([...before.keys(),...after.keys()]);
  const changed=[],changedBookPages=[],unmappedPdfPages=[];
  for(const key of keys){
    const a=before.get(key),b=after.get(key);
    if(a?.hash===b?.hash&&a&&b)continue;
    const row=b||a||{};
    changed.push({key,before:a?.hash||'',after:b?.hash||'',bookPage:Number(row.bookPage)||0,pdfPage:Number(row.pdfPage)||0});
    if(Number(row.bookPage)>0)changedBookPages.push(Number(row.bookPage));
    else if(Number(row.pdfPage)>0)unmappedPdfPages.push(Number(row.pdfPage));
  }
  return{
    doc,comparable:true,reason:'',changed:changed.length>0,
    changedPages:changed,
    changedBookPages:[...new Set(changedBookPages)].sort((a,b)=>a-b),
    unmappedPdfPages:[...new Set(unmappedPdfPages)].sort((a,b)=>a-b),
    ranges:groupBookRanges(doc,changedBookPages),
    exact:unmappedPdfPages.length===0
  };
}

async function compareAndStore(doc,{pdfEntry=null}={}){
  const previous=read(doc);
  const next=await buildManifest(doc,{pdfEntry});
  if(!previous){
    const stored=write(doc,next);
    return{doc,baselineEstablished:true,stored,comparable:false,changed:false,exact:false,ranges:[],manifest:next};
  }
  const diff=diffManifests(previous,next);
  if(!diff.comparable){
    const stored=write(doc,next);
    return{...diff,baselineReset:true,stored,exact:false,manifest:next};
  }
  const stored=write(doc,next);
  return{...diff,baselineEstablished:false,stored,manifest:next};
}

function exactImpact(ranges){
  if(!ranges?.length)return{conceptIds:[],questionIds:[],conceptCount:0,questionCount:0};
  return V.SourceImpact119?.diffImpact?.(ranges)||{conceptIds:[],questionIds:[],conceptCount:0,questionCount:0};
}

async function analyzeOfficialImpact(report){
  const docs=[...new Set(report?.docs||[])];
  if(!report?.needsRevalidation||!docs.length)return null;
  const documents=[];
  const ranges=[];
  let baselineMissing=false,failed=false;
  for(const doc of docs){
    try{
      const result=await compareAndStore(doc);
      documents.push({doc,...result,manifest:undefined});
      if(result.baselineEstablished||result.baselineReset)baselineMissing=true;
      if(result.comparable&&result.changed)ranges.push(...result.ranges);
    }catch(error){
      failed=true;
      documents.push({doc,error:String(error?.message||error),comparable:false,changed:false,ranges:[]});
    }
  }
  const impact=exactImpact(ranges);
  const changedDocs=documents.filter(x=>x.changed).map(x=>x.doc);
  const unchangedDocs=documents.filter(x=>x.comparable&&!x.changed).map(x=>x.doc);
  lastReport={
    version:VERSION,
    generatedAt:new Date().toISOString(),
    docs,
    documents,
    changedDocs,
    unchangedDocs,
    ranges:ranges.sort(rangeSort),
    exactImpact:impact,
    baselineMissing,
    failed,
    failClosed:failed||baselineMissing||documents.some(x=>x.exact===false&&x.changed),
    automaticMutationAllowed:false
  };
  render(lastReport);
  if(typeof window.dispatchEvent==='function'&&typeof window.CustomEvent==='function')window.dispatchEvent(new CustomEvent('aitutor-official-page-fingerprint',{detail:lastReport}));
  return lastReport;
}

function render(report){
  if(typeof document==='undefined')return;
  const card=document.querySelector('[data-official-monitor-card]');
  if(!card)return;
  card.querySelector('[data-page-fingerprint-report]')?.remove();
  const box=document.createElement('div');
  box.dataset.pageFingerprintReport='1';
  box.className='official-monitor-meta official-source-page-fingerprint-report';
  const main=document.createElement('span');
  const count=report?.ranges?.reduce((n,r)=>n+(r.to-r.from+1),0)||0;
  if(report?.failed)main.textContent='공식 PDF 본문 페이지 확인 실패 · 문서 전체 재검증 유지';
  else if(report?.baselineMissing)main.textContent='공식 PDF 근거 페이지 기준선 저장 · 다음 동일 URL 교체부터 페이지 단위 비교';
  else if(report?.changedDocs?.length)main.textContent=`공식 PDF 본문 변경 · 근거 페이지 ${count}쪽 · 영향 개념 ${report.exactImpact?.conceptCount||0} · A/B 검증문항 ${report.exactImpact?.questionCount||0}`;
  else main.textContent='공식 공고 변경 확인 · 현재 인용 중인 PDF 근거 페이지 본문 변화 없음';
  box.appendChild(main);
  if(report?.ranges?.length){const detail=document.createElement('span');detail.textContent='변경 범위 '+report.ranges.map(r=>`${r.doc} ${r.from}${r.to!==r.from?'~'+r.to:''}쪽`).join(' · ');box.appendChild(detail)}
  if(report?.failClosed){const guard=document.createElement('span');guard.textContent='자동 콘텐츠 반영 금지 · 불확실 범위는 문서 전체 재검증';box.appendChild(guard)}
  const anchor=card.querySelector('[data-source-impact-report]')||card.querySelector('.official-monitor-meta');
  anchor?.insertAdjacentElement('afterend',box);
}

function queueBaseline(doc,pdfEntry=null){
  if(!doc||queued.has(doc)||read(doc))return;
  queued.add(doc);
  const run=async()=>{
    try{const next=await buildManifest(doc,{pdfEntry});write(doc,next)}catch{}finally{queued.delete(doc)}
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(()=>run(),{timeout:5000});else setTimeout(run,250);
}

function hookPdfRender(){
  const sourcePdf=V.SourcePDF;
  if(!sourcePdf?.render||sourcePdf.__pageFingerprintHooked)return;
  const originalRender=sourcePdf.render.bind(sourcePdf);
  sourcePdf.render=async function(key,...args){
    const out=await originalRender(key,...args);
    try{const entry=await sourcePdf.openPdf(key);queueBaseline(key,entry)}catch{}
    return out;
  };
  sourcePdf.__pageFingerprintHooked=true;
}

function audit(){
  const previous={version:VERSION,doc:'fire1',scopeSignature:'same',pages:[
    {pdfPage:26,bookPage:10,hash:'a'},{pdfPage:27,bookPage:11,hash:'b'},{pdfPage:29,bookPage:13,hash:'d'}
  ]};
  const next={version:VERSION,doc:'fire1',scopeSignature:'same',pages:[
    {pdfPage:26,bookPage:10,hash:'x'},{pdfPage:27,bookPage:11,hash:'y'},{pdfPage:29,bookPage:13,hash:'d'}
  ]};
  const diff=diffManifests(previous,next);
  const scope=diffManifests(previous,{...next,scopeSignature:'new'});
  return{
    version:VERSION,
    groupedRangeOk:diff.comparable&&diff.changed&&diff.ranges.length===1&&diff.ranges[0].from===10&&diff.ranges[0].to===11,
    unchangedPageExcluded:diff.changedBookPages.length===2&&!diff.changedBookPages.includes(13),
    scopeChangeFailClosed:scope.comparable===false&&scope.reason==='SCOPE_CHANGED',
    complete:false
  };
}

const auditResult=audit();
auditResult.complete=auditResult.groupedRangeOk&&auditResult.unchangedPageExcluded&&auditResult.scopeChangeFailClosed;
V.SourcePageFingerprint119={
  version:VERSION,buildManifest,diffManifests,compareAndStore,analyzeOfficialImpact,groupBookRanges,audit:()=>({...auditResult}),
  readBaseline:read,clearBaseline:doc=>{try{localStorage.removeItem(KEY_PREFIX+doc);return true}catch{return false}},
  get lastReport(){return lastReport},
  policy:{officialOnly:true,citedPagesOnly:true,hashesOnlyPersistent:true,noSourceTextPersistence:true,noAutomaticMutation:true,failClosedWithoutBaseline:true}
};
hookPdfRender();
window.addEventListener('aitutor-official-source-impact',event=>{analyzeOfficialImpact(event?.detail||{}).catch(()=>{})});
})();
