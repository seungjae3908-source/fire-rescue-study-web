import { chromium } from 'playwright';
const base='http://127.0.0.1:4173/v9/index.html';
function assert(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1000,height:760}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');
  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9,owner=V.Store.ownerId;
    const res=await fetch('./fixtures/private-sample.pdf'),buf=await res.arrayBuffer();
    const file=new File([buf],'private-sample.pdf',{type:'application/pdf'});
    const ingested=await V.PrivateDocs.ingest(file,{kind:'personal',title:'PDF QA SAMPLE',keepOriginal:true});
    const sourceAttached=await V.SourcePDF.attach('ems',file);
    const host=document.createElement('div');host.style.width='800px';document.body.appendChild(host);
    const sourceRender=await V.SourcePDF.render('ems',1,host,['AITUTOR PDF QA SAMPLE 123']);
    const sourceDom={canvas:host.querySelectorAll('canvas').length,highlights:host.querySelectorAll('.pdf-highlight-box').length,localOnly:V.SourcePDF.privacy.localOnly,serverUpload:V.SourcePDF.privacy.serverUpload,originalUnmodified:V.SourcePDF.privacy.originalUnmodified};
    host.remove();
    const docs=await V.PrivateDocs.listDocuments('personal');
    const hits=await V.PrivateDocs.search('SAMPLE 123',{kind:'personal',limit:10});
    V.Store.switchOwner('qa-pdf-other-owner');
    const otherDocs=await V.PrivateDocs.listDocuments('personal');
    const otherHits=await V.PrivateDocs.search('SAMPLE 123',{kind:'personal',limit:10});
    V.Store.switchOwner(owner);
    return{ingested,doc:docs.find(d=>d.title==='PDF QA SAMPLE'),hits:hits.length,hitText:hits[0]?.text||'',otherDocs:otherDocs.length,otherHits:otherHits.length,sourceAttached,sourceRender,sourceDom};
  });
  assert(result.ingested.chunks>=1,'PDF.js creates at least one private text chunk');
  assert(result.doc?.pageCount===1,'PDF page count preserved');
  assert(result.hits>=1&&/AITUTOR PDF QA SAMPLE 123/.test(result.hitText),'extracted PDF text is searchable');
  assert(result.otherHits===0,'PDF chunks are invisible to another local owner');
  assert(result.sourceAttached?.key==='ems'&&result.sourceRender?.page===1,'official source PDF can be attached and rendered locally');
  assert(result.sourceDom?.canvas===1&&result.sourceDom?.highlights>=1&&result.sourceRender?.hits>=1,'PDF text coordinates produce at least one visible highlight box');
  assert(result.sourceDom?.localOnly===true&&result.sourceDom?.serverUpload===false&&result.sourceDom?.originalUnmodified===true,'official source PDF remains local-only and unmodified');
  assert(errors.length===0,`PDF runtime errors = 0 (${errors.join(' | ')})`);
  console.log('V9_PDF_QA_SUCCESS');
  await context.close();
}finally{await browser.close()}
