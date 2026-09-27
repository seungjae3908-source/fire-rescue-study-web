import { chromium } from 'playwright';
import { startLocalPdfMirror } from './v70-local-pdf-mirror-server.mjs';
const appUrl=process.env.STUDY_119_FIRE_AUDIT_URL||'http://127.0.0.1:4173/v9/index.html';
const mirror=await startLocalPdfMirror({port:4174});
const proxyOrigin=mirror.origin,mirrorBase=mirror.base;
const docs=['fire1','fire2','ems'];
function assert(v,m,meta={}){if(!v)throw new Error(m+' '+JSON.stringify(meta));console.log('PASS',m,JSON.stringify(meta))}
async function directRange(doc){
  const started=Date.now();
  const r=await fetch(mirrorBase+'/'+doc+'.pdf',{headers:{range:'bytes=0-65535','cache-control':'no-cache'}});
  const ab=await r.arrayBuffer(),cr=r.headers.get('content-range')||'',transport=r.headers.get('x-119-official-transport')||'';
  console.log('FIRE_RANGE_DIAG',JSON.stringify({doc,status:r.status,bytes:ab.byteLength,contentRange:cr,transport,ms:Date.now()-started}));
  assert(r.status===206,'fire PDF static mirror returns 206',{doc,status:r.status});
  assert(ab.byteLength===65536,'fire PDF static mirror returns exact 64KB',{doc,bytes:ab.byteLength});
  assert(/^bytes 0-65535\/\d+$/.test(cr),'fire PDF static mirror has Content-Range',{doc,cr});
  assert(Buffer.from(ab).subarray(0,5).toString('latin1')==='%PDF-','fire PDF static mirror begins with PDF magic',{doc});
}
async function rewrite(page){
  const fn=async route=>{
    const response=await route.fetch();
    let body=await response.text();
    body=body.replaceAll('https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror',mirrorBase).replaceAll('https://study-119-official-pdf.vercel.app',mirrorBase).replaceAll('https://study-119-pdf-proxy.vercel.app',proxyOrigin);
    await route.fulfill({response,body});
  };
  await page.route('**/v9/config.js*',fn);
  await page.route('**/v9/boot-v69-1.js*',fn);
}
async function waitReady(page,selector,ms=70000){
  await page.waitForSelector(selector,{state:'visible',timeout:10000});
  await page.waitForFunction(sel=>['ready','error'].includes(document.querySelector(sel)?.dataset?.renderState||''),selector,{timeout:ms});
  return page.locator(selector).evaluate(root=>({state:root.dataset.renderState||'',doc:root.dataset.docKey||'',page:root.dataset.page||'',pages:root.dataset.pages||'',label:root.querySelector('[data-resource-page-label],[data-pdf-page-label]')?.textContent||'',text:root.innerText.slice(0,300)}));
}
const browser=await chromium.launch({headless:true});
try{
  for(const doc of docs)await directRange(doc);
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(70000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
  await rewrite(page);
  await page.goto(appUrl,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  for(const doc of docs){
    await page.evaluate(()=>window.AITUTOR_V9.App.go('resources'));
    const btn=page.locator('[data-resource-doc="'+doc+'"]:visible').first();
    assert(await btn.count()===1,'resources exposes fire PDF button',{doc});
    await btn.click();
    const state=await waitReady(page,'#resourcePdf');
    assert(state.state==='ready','resources fire PDF renders',{doc,state});
    const ui=await page.locator('#resourcePdf').evaluate(root=>{
      const host=root.querySelector('.pdf-evidence-host[data-scroll-owner="pdf"]'),canvas=root.querySelector('canvas'),r=host?.getBoundingClientRect();
      return{owners:root.querySelectorAll('.pdf-evidence-host[data-scroll-owner="pdf"]').length,canvas:!!canvas,sh:host?.scrollHeight||0,ch:host?.clientHeight||0,left:r?.left||0,right:r?.right||0,vw:innerWidth};
    });
    assert(ui.owners===1&&ui.canvas,'resources fire PDF has one owner and canvas',{doc,ui});
    assert(ui.left>=-2&&ui.right<=ui.vw+2,'resources fire PDF stays within mobile viewport',{doc,ui});
    await page.locator('#resourcePdf [data-resource-pdf-close]').click();
    await page.waitForSelector('#resourcePdf',{state:'detached'});
  }
  for(const doc of ['fire1','ems']){
    const id=await page.evaluate(doc=>window.AITUTOR_V9.curriculum.concepts.find(c=>(c.sourceRanges||[]).some(r=>r.doc===doc))?.id||'',doc);
    assert(!!id,'mapped concept exists for fire original source',{doc,id});
    await page.evaluate(({id})=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='source';V.Store.save();V.App.render()},{id});
    const b=page.locator('[data-source-concept="'+id+'"]:visible').first();assert(await b.count()===1,'concept source button visible',{doc,id});
    await b.click();
    const state=await waitReady(page,'#pdfEvidence');
    assert(state.state==='ready','concept original-source PDF renders',{doc,id,state});
    assert(state.doc===doc,'concept original-source opens mapped doc',{doc,state});
    await page.locator('#pdfEvidence [data-pdf-close]').click();
    await page.waitForSelector('#pdfEvidence',{state:'detached'});
  }
  assert(errors.length===0,'fire PDF audit runtime console/page errors = 0',{errors});
  await ctx.close();
  console.log('V70_FIRE_PDF_FOCUS_SUCCESS');
}finally{
  await browser.close();
  await new Promise(resolve=>mirror.server.close(resolve));
}
