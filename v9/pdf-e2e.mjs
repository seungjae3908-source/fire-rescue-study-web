import { chromium } from 'playwright';
const base=process.env.STUDY_119_PREVIEW_URL||'http://127.0.0.1:4173/v9/index.html';
const expectedAppHead=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const fixtureUrl=process.env.STUDY_119_PDF_FIXTURE_URL||'';
let fixtureBase64='';
if(fixtureUrl){const r=await fetch(fixtureUrl);if(!r.ok)throw new Error('PDF_FIXTURE_FETCH_FAILED '+r.status);fixtureBase64=Buffer.from(await r.arrayBuffer()).toString('base64')}
function assert(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1000,height:760},deviceScaleFactor:2}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');
  if(expectedAppHead)assert(await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'')===expectedAppHead,'PDF QA serves expected deployed head '+expectedAppHead);
  const result=await page.evaluate(async fixtureBase64=>{
    const V=window.AITUTOR_V9,owner=V.Store.ownerId;
    let buf;
    if(fixtureBase64){const bin=atob(fixtureBase64),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);buf=bytes.buffer}else{const res=await fetch('./fixtures/private-sample.pdf');buf=await res.arrayBuffer()}
    const file=new File([buf],'private-sample.pdf',{type:'application/pdf'});
    const guardAudit={
      emptyNeedsOcr:V.PrivateDocs.pdfPageNeedsOcr({items:[]},''),
      goodNeedsOcr:V.PrivateDocs.pdfPageNeedsOcr({items:Array.from({length:20},(_,i)=>({str:'정상 교재 텍스트 '+i}))},'정상적인 한국어 교재 텍스트가 충분히 추출되어 OCR을 다시 돌릴 필요가 없는 페이지입니다. 숫자 20 kg 기준도 함께 포함합니다.'),
      numberGood:V.LocalAI.numbersPreserved('높이 1.8m 이하, 유량 50~200%','높이 1.8m 이하, 유량 50~200%'),
      numberBad:V.LocalAI.numbersPreserved('높이 1.8m 이하, 유량 50~200%','높이 2.0m 이하, 유량 50~200%'),
      ordered:V.PrivateDocs.nativePdfText({items:[
        {str:'첫째 줄 A',transform:[1,0,0,10,10,200],height:10},
        {str:'첫째 줄 B',transform:[1,0,0,10,100,200],height:10},
        {str:'둘째 줄',transform:[1,0,0,10,10,180],height:10}
      ]})
    };
    const ingested=await V.PrivateDocs.ingest(file,{kind:'personal',title:'PDF QA SAMPLE',keepOriginal:true});
    const sourceAttached=await V.SourcePDF.attach('ems',file);
    const host=document.createElement('div');host.style.width='800px';document.body.appendChild(host);
    const sourceRender=await V.SourcePDF.render('ems',1,host,['AITUTOR PDF QA SAMPLE 123']);
    const canvas=host.querySelector('canvas'),box=canvas?.getBoundingClientRect(),evidence=[...host.querySelectorAll('.pdf-evidence-line')];const sourceDom={canvas:host.querySelectorAll('canvas').length,evidenceLines:evidence.length,evidenceHeights:evidence.map(x=>x.getBoundingClientRect().height),evidenceShadows:evidence.map(x=>getComputedStyle(x).boxShadow),legacyVisible:[...host.querySelectorAll('.pdf-highlight-box')].filter(x=>getComputedStyle(x).display!=='none').length,pixelWidth:canvas?.width||0,cssWidth:box?.width||0,localCacheAllowed:V.SourcePDF.privacy.localCacheAllowed,userUploadRequired:V.SourcePDF.privacy.userUploadRequired,serverUpload:V.SourcePDF.privacy.serverUpload,originalUnmodified:V.SourcePDF.privacy.originalUnmodified};
    host.remove();
    const docs=await V.PrivateDocs.listDocuments('personal');
    const hits=await V.PrivateDocs.search('SAMPLE 123',{kind:'personal',limit:10});
    V.Store.switchOwner('qa-pdf-other-owner');
    const otherDocs=await V.PrivateDocs.listDocuments('personal');
    const otherHits=await V.PrivateDocs.search('SAMPLE 123',{kind:'personal',limit:10});
    V.Store.switchOwner(owner);
    return{guardAudit,ingested,doc:docs.find(d=>d.title==='PDF QA SAMPLE'),hits:hits.length,hitText:hits[0]?.text||'',otherDocs:otherDocs.length,otherHits:otherHits.length,sourceAttached,sourceRender,sourceDom};
  },fixtureBase64);
  assert(result.guardAudit.emptyNeedsOcr===true&&result.guardAudit.goodNeedsOcr===false,'hybrid extraction sends only empty/sparse/low-quality text pages to OCR');
  assert(result.guardAudit.numberGood===true&&result.guardAudit.numberBad===false,'AI OCR correction guard rejects changed numeric/unit facts');
  assert(/첫째 줄 A 첫째 줄 B\n둘째 줄/.test(result.guardAudit.ordered),'native PDF text reconstruction preserves line reading order');
  assert(result.ingested.chunks>=1,'PDF.js creates at least one private text chunk');
  assert(result.doc?.pageCount===1,'PDF page count preserved');
  assert(result.doc?.extractionVersion==='v10-hybrid-ocr-ai','private PDF uses hybrid text/OCR/AI extraction contract');
  assert(Number(result.doc?.extractionQuality)>0,'private PDF stores extraction-quality evidence');
  assert(result.hits>=1&&/AITUTOR PDF QA SAMPLE 123/.test(result.hitText),'extracted PDF text is searchable');
  assert(result.otherHits===0,'PDF chunks are invisible to another local owner');
  assert(result.sourceAttached?.key==='ems'&&result.sourceRender?.page===1,'official source PDF can be attached and rendered locally');
  assert(result.sourceDom?.canvas===1&&result.sourceDom?.evidenceLines>=1&&result.sourceRender?.hits>=1,'PDF evidence matcher marks the complete matching evidence block');
  assert(result.sourceDom?.evidenceHeights.every(h=>h<=3)&&result.sourceDom?.evidenceShadows.every(x=>x==='none'),'PDF evidence uses thin non-obscuring baseline underlines');
  assert(result.sourceDom?.legacyVisible===0,'legacy per-keyword highlight boxes stay hidden');
  assert(result.sourceDom?.pixelWidth>=result.sourceDom?.cssWidth*1.8,'PDF source rendering uses high-DPI canvas pixels');
  assert(result.sourceDom?.localCacheAllowed===true&&result.sourceDom?.userUploadRequired===false&&result.sourceDom?.serverUpload===false&&result.sourceDom?.originalUnmodified===true,'official source PDF needs no user upload and remains unmodified/no-server-upload');
  assert(errors.length===0,`PDF runtime errors = 0 (${errors.join(' | ')})`);
  console.log('V9_PDF_QA_SUCCESS');
  await context.close();
}finally{await browser.close()}
