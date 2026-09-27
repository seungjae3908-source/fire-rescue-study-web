import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import { startLocalPdfMirror } from './v70-local-pdf-mirror-server.mjs';
const base=process.env.STUDY_119_V70_AUDIT_URL||'http://127.0.0.1:4173/v9/index.html';
const mirror=await startLocalPdfMirror({port:4174});
const proxyOrigin=mirror.origin,mirrorBase=mirror.base;
const docs=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];
const representative=['fire1','ems','prevention1','law2'];
const failures=[];
const passes=[];
function check(v,m,meta={}){if(v){passes.push(m);console.log('PASS',m)}else{const row={message:m,...meta};failures.push(row);console.error('V70_FULL_AUDIT_FAIL',JSON.stringify(row))}return v}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function installConfigRewrite(page){
  const rewrite=async route=>{
    const response=await route.fetch();
    let body=await response.text();
    body=body
      .replaceAll('https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror',mirrorBase)
      .replaceAll('https://study-119-official-pdf.vercel.app',mirrorBase)
      .replaceAll('https://study-119-pdf-proxy.vercel.app',proxyOrigin);
    await route.fulfill({response,body});
  };
  await page.route('**/v9/config.js*',rewrite);
  await page.route('**/v9/boot-v69-1.js*',rewrite);
}
async function boot(ctx){
  const page=await ctx.newPage();
  page.setDefaultTimeout(45000);
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await installConfigRewrite(page);
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF&&!!window.AITUTOR_V9?.SourceCatalog119,{timeout:60000});
  return{page,errors};
}
async function go(page,route){
  await page.evaluate(route=>window.AITUTOR_V9.App.go(route),route);
  await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);
  await page.waitForSelector('.page',{state:'visible'});
  await page.waitForTimeout(80);
}
async function auditPage(page,label){
  const x=await page.evaluate(()=>{
    const visible=el=>{if(el.closest('.outline:not(.open),.backdrop:not(.on),[hidden],.hidden'))return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0};
    const owners=[...document.querySelectorAll('.page [data-scroll-owner]')].filter(visible).map(el=>({owner:el.getAttribute('data-scroll-owner')||'',sh:el.scrollHeight,ch:el.clientHeight,top:el.scrollTop,cls:String(el.className||'').slice(0,100)}));
    const doc={html:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]};
    const outside=[];
    for(const el of document.querySelectorAll('.page *')){
      if(!visible(el))continue;
      const r=el.getBoundingClientRect();
      if(r.left>=-3&&r.right<=innerWidth+3)continue;
      let horizontalHost=false;
      for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const ps=getComputedStyle(p);if(['auto','scroll'].includes(ps.overflowX)&&p.scrollWidth>p.clientWidth+2){horizontalHost=true;break}}
      if(!horizontalHost)outside.push({tag:el.tagName,cls:String(el.className||'').slice(0,80),left:Math.round(r.left),right:Math.round(r.right),vw:innerWidth,text:(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,100)});
      if(outside.length>=12)break;
    }
    return{owners,doc,outside};
  });
  check(x.doc.html[0]<=x.doc.html[1]+1&&x.doc.body[0]<=x.doc.body[1]+1,label+' no document horizontal overflow',{doc:x.doc});
  check(x.outside.length===0,label+' visible content stays inside viewport',{outside:x.outside});
  check(x.owners.length<=1,label+' has at most one visible vertical scroll owner',{owners:x.owners});
  if(x.owners.length===1&&x.owners[0].sh>x.owners[0].ch+20){
    const bottom=await page.evaluate(owner=>{
      const el=[...document.querySelectorAll('.page [data-scroll-owner]')].find(x=>x.offsetParent!==null&&x.getAttribute('data-scroll-owner')===owner);
      if(!el)return null;const max=Math.max(0,el.scrollHeight-el.clientHeight);el.scrollTop=max;return{top:el.scrollTop,max};
    },x.owners[0].owner);
    check(bottom&&Math.abs(bottom.max-bottom.top)<=2,label+' scroll owner reaches bottom',{bottom,owner:x.owners[0]});
  }
}
async function setStudy(page,id,tab){
  await page.evaluate(({id,tab})=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;
    s.page='study';s.conceptId=id;s.subject=c.subject;s.scopeId=c.scopeId;s.studyTab=tab;V.Store.save();V.App.render();
  },{id,tab});
  await page.waitForFunction(({id,tab})=>window.AITUTOR_V9.Store.state.conceptId===id&&window.AITUTOR_V9.Store.state.studyTab===tab,{id,tab});
  await page.waitForTimeout(80);
}
async function docConcept(page,doc){
  return page.evaluate(doc=>window.AITUTOR_V9.curriculum.concepts.find(c=>(c.sourceRanges||[]).some(r=>r.doc===doc))?.id||'',doc);
}
async function waitPdfReady(page,selector,timeout=120000){
  await page.waitForSelector(selector,{state:'visible',timeout});
  await page.waitForFunction(sel=>{
    const root=document.querySelector(sel);
    return root?.dataset?.renderState==='ready'||root?.dataset?.renderState==='error';
  },selector,{timeout});
  return page.locator(selector).evaluate(root=>({state:root.dataset.renderState||'',doc:root.dataset.docKey||'',page:root.dataset.page||'',pages:root.dataset.pages||'',text:root.innerText.slice(0,500)}));
}
async function auditPdfDialogA11y(page,selector,label){
  const dialog=page.locator(selector+' .modal').first();
  const meta=await dialog.evaluate(el=>({
    role:el.getAttribute('role')||'',
    ariaModal:el.getAttribute('aria-modal')||'',
    labelledby:el.getAttribute('aria-labelledby')||'',
    headingId:el.querySelector('h1,h2,h3')?.id||'',
    activeInside:!!el.contains(document.activeElement),
    focusables:[...el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}).length
  }));
  check(meta.role==='dialog'&&meta.ariaModal==='true',label+' exposes modal dialog semantics',meta);
  check(!!meta.labelledby&&meta.labelledby===meta.headingId,label+' dialog has accessible label binding',meta);
  check(meta.activeInside,label+' focus enters dialog on open',meta);
  if(meta.focusables>1){
    const trap=await dialog.evaluate(el=>{
      const items=[...el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});
      items[0]?.focus();return{first:items[0]?.outerHTML.slice(0,100)||'',last:items.at(-1)?.outerHTML.slice(0,100)||''};
    });
    await page.keyboard.press('Shift+Tab');
    const wrappedLast=await dialog.evaluate(el=>{const items=[...el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});return document.activeElement===items.at(-1)});
    check(wrappedLast,label+' Shift+Tab wraps to last control',{trap});
    await page.keyboard.press('Tab');
    const wrappedFirst=await dialog.evaluate(el=>{const items=[...el.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(x=>{const r=x.getBoundingClientRect(),s=getComputedStyle(x);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});return document.activeElement===items[0]});
    check(wrappedFirst,label+' Tab wraps back to first control',{trap});
  }
}
async function auditResourceSearchJump(page,selector,label,doc){
  const search=page.locator(selector+' [data-resource-pdf-search-input]');
  const searchBtn=page.locator(selector+' [data-resource-pdf-search]');
  if(await search.count()&&await searchBtn.count()){
    await search.fill('소방');
    await searchBtn.click();
    await page.waitForFunction(sel=>{const r=document.querySelector(sel);return r?.dataset?.renderState==='ready'&&!!r.dataset.searchResults&&r.dataset.searchResults!=='[]'},selector,{timeout:120000});
    const searchState=await page.locator(selector).evaluate(root=>({query:root.dataset.searchQuery||'',results:JSON.parse(root.dataset.searchResults||'[]'),label:root.querySelector('[data-resource-pdf-search-label]')?.textContent||''}));
    check(searchState.query==='소방'&&searchState.results.length>0,label+' original-text search returns results',searchState);
    const nextResult=page.locator(selector+' [data-resource-pdf-search-next]');
    if(await nextResult.count()&&!(await nextResult.isDisabled())){
      const before=Number(await page.locator(selector).getAttribute('data-page')||0);
      await nextResult.click();
      await page.waitForFunction(({selector,before})=>{const r=document.querySelector(selector);return r?.dataset?.renderState==='ready'&&Number(r.dataset.page||0)!==before},{selector,before},{timeout:120000});
      check(true,label+' next search-result navigation works');
    }
  }
  const jump=page.locator(selector+' [data-resource-pdf-jump-input]');
  const jumpBtn=page.locator(selector+' [data-resource-pdf-jump]');
  if(await jump.count()&&await jumpBtn.count()){
    const expected=await page.evaluate(doc=>window.AITUTOR_V9.SourcePDF.pdfPage?.(doc,1)||1,doc);
    await jump.fill('1');await jumpBtn.click();
    await page.waitForFunction(({selector,expected})=>{const r=document.querySelector(selector);return r?.dataset?.renderState==='ready'&&Number(r.dataset.page||0)===expected},{selector,expected},{timeout:120000});
    check(true,label+' textbook-page jump maps to the expected PDF page',{doc,expected});
  }
}
async function auditResourceDownload(page,selector,label,doc){
  const btn=page.locator(selector+' [data-resource-download="'+doc+'"]').first();
  if(!(await btn.count())){check(false,label+' exposes download control',{doc});return}
  const [download]=await Promise.all([page.waitForEvent('download',{timeout:120000}),btn.click()]);
  const p=await download.path(),name=download.suggestedFilename();
  check(!!p&&/\.pdf$/i.test(name),label+' download produces a PDF filename',{name,path:!!p});
  if(p){
    const handle=await fs.open(p,'r');const head=Buffer.alloc(5);await handle.read(head,0,5,0);const stat=await handle.stat();await handle.close();
    check(head.toString('latin1')==='%PDF-'&&stat.size>100000,label+' downloaded file has PDF magic and nontrivial size',{name,size:stat.size});
  }
}
async function checkPdfModal(page,selector,label,{exercise=false}={}){
  const state=await waitPdfReady(page,selector);
  check(state.state==='ready',label+' PDF render ready',state);
  if(state.state!=='ready')return false;
  await auditPdfDialogA11y(page,selector,label);
  const metrics=await page.locator(selector).evaluate(root=>{
    const host=root.querySelector('.pdf-evidence-host[data-scroll-owner="pdf"]'),canvas=root.querySelector('canvas');
    const h=host?.getBoundingClientRect();
    return{owners:root.querySelectorAll('.pdf-evidence-host[data-scroll-owner="pdf"]').length,canvas:!!canvas,host:{sh:host?.scrollHeight||0,ch:host?.clientHeight||0,top:host?.scrollTop||0,left:h?.left||0,right:h?.right||0}};
  });
  check(metrics.owners===1,label+' exactly one PDF scroll owner',metrics);
  check(metrics.canvas,label+' canvas rendered',metrics);
  const vw=await page.evaluate(()=>innerWidth);
  check(metrics.host.right<=vw+2&&metrics.host.left>=-2,label+' PDF host stays inside viewport',{metrics,vw});
  if(metrics.host.sh>metrics.host.ch+20){
    await page.locator(selector+' .pdf-modal-head').hover();
    await page.mouse.wheel(0,650);
    await sleep(120);
    const top=await page.locator(selector+' .pdf-evidence-host').evaluate(el=>el.scrollTop);
    check(top>0,label+' wheel on PDF chrome bridges to PDF scroll owner',{top,metrics});
  }
  if(exercise){
    const before=Number(state.page||1);
    const next=page.locator(selector+' [data-resource-pdf-page="1"],'+selector+' [data-pdf-page="1"]').first();
    if(await next.count()&&!(await next.isDisabled())){
      await next.click();
      await page.waitForFunction(({selector,before})=>{const r=document.querySelector(selector);return r?.dataset?.renderState==='ready'&&Number(r.dataset.page||0)!==before},{selector,before},{timeout:120000});
      check(true,label+' next-page control works');
    }
    const plus=page.locator(selector+' [data-resource-pdf-zoom="0.25"],'+selector+' [data-pdf-zoom="0.25"]').first();
    if(await plus.count()){
      await plus.click();
      await page.waitForFunction(selector=>{const x=document.querySelector(selector+' [data-resource-zoom-label],'+selector+' [data-pdf-zoom-label]');return !!x&&x.textContent!=='100%'},selector,{timeout:120000});
      check(true,label+' zoom control works');
    }
    if(selector==='#resourcePdf')await auditResourceSearchJump(page,selector,label,state.doc);
  }
  return true;
}
async function resourcePdfAudit(page,doc,{exercise=false,download=false}={}){
  await go(page,'resources');
  const btn=page.locator('[data-resource-doc="'+doc+'"]:visible').first();
  check(await btn.count()>0,'resources exposes '+doc+' PDF button');
  if(!(await btn.count()))return;
  await btn.click();
  await checkPdfModal(page,'#resourcePdf','resource '+doc,{exercise});
  const official=await page.evaluate(doc=>window.AITUTOR_V9.SourceCatalog119.get(doc)?.officialPage||'',doc);
  check(/^https:\/\/www\.nfa\.go\.kr\//.test(official),'resource '+doc+' retains official NFA source URL',{official});
  if(download)await auditResourceDownload(page,'#resourcePdf','resource '+doc,doc);
  const close=page.locator('#resourcePdf [data-resource-pdf-close]');
  if(await close.count())await close.click();
  await page.waitForSelector('#resourcePdf',{state:'detached',timeout:10000}).catch(()=>{});
  const focusReturned=await page.waitForFunction(doc=>{
    const el=document.querySelector('[data-resource-doc="'+CSS.escape(doc)+'"]:not([hidden])');
    return !!el&&document.activeElement===el;
  },doc,{timeout:1000}).then(()=>true).catch(()=>false);
  check(focusReturned,'resource '+doc+' focus returns to opener after close');
}
async function sourceTabAudit(page,doc){
  const id=await docConcept(page,doc);
  check(!!id,'found concept mapped to '+doc);
  if(!id)return;
  await setStudy(page,id,'source');
  const button=page.locator('[data-source-concept="'+id+'"]:visible').first();
  check(await button.count()>0,'source tab exposes original-view button '+doc,{id});
  if(!(await button.count()))return;
  await button.click();
  await checkPdfModal(page,'#pdfEvidence','concept source '+doc);
  const mapped=await page.locator('#pdfEvidence').evaluate(root=>({doc:root.dataset.docKey||'',concept:root.dataset.conceptId||'',state:root.dataset.renderState||'',label:root.querySelector('[data-pdf-page-label]')?.textContent||''}));
  check(mapped.doc===doc&&mapped.concept===id,'concept source opens mapped document '+doc,mapped);
  check(!/불러오지 못했습니다/.test(mapped.label),'concept source label has no load failure '+doc,mapped);
  const close=page.locator('#pdfEvidence [data-pdf-close]');
  if(await close.count())await close.click();
  await page.waitForSelector('#pdfEvidence',{state:'detached',timeout:10000}).catch(()=>{});
  const focusReturned=await page.waitForFunction(id=>{
    const rows=[...document.querySelectorAll('[data-source-concept="'+CSS.escape(id)+'"]')];
    const visible=rows.find(el=>el instanceof HTMLElement&&el.offsetParent!==null&&el.getClientRects().length);
    return !!visible&&document.activeElement===visible;
  },id,{timeout:1000}).then(()=>true).catch(()=>false);
  check(focusReturned,'concept source '+doc+' focus returns to opener after close');
}

for(const doc of docs){
  const r=await fetch(mirrorBase+'/'+encodeURIComponent(doc)+'.pdf',{headers:{range:'bytes=0-63','cache-control':'no-cache'}});
  const ab=await r.arrayBuffer();
  check(r.status===206&&ab.byteLength===64,'local Range mirror ready '+doc,{status:r.status,bytes:ab.byteLength,contentRange:r.headers.get('content-range')||''});
  check(Buffer.from(ab).subarray(0,5).toString('latin1')==='%PDF-','local Range mirror PDF magic '+doc);
}

const browser=await chromium.launch({headless:true});
try{
  const viewports=[
    {width:360,height:800,mobile:true,label:'mobile360'},
    {width:390,height:844,mobile:true,label:'mobile390'},
    {width:412,height:915,mobile:true,label:'mobile412'},
    {width:768,height:1024,mobile:false,label:'tablet768'},
    {width:1024,height:768,mobile:false,label:'tablet1024'},
    {width:1440,height:900,mobile:false,label:'desktop1440'},
    {width:1920,height:1080,mobile:false,label:'desktop1920'}
  ];
  for(const vp of viewports){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.mobile,hasTouch:vp.mobile,serviceWorkers:'block'});
    const {page,errors}=await boot(ctx);
    await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.Lazy119?.ensureQuestions?.();});
    for(const route of ['home','bank','exam','wrong','stats','notes','resources','suggestions','settings']){
      await go(page,route);
      await auditPage(page,vp.label+' '+route);
    }
    const studyId=await docConcept(page,'law2')||'F03-C03';
    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudy(page,studyId,tab);
      await auditPage(page,vp.label+' study-'+tab);
    }
    if(vp.width===390){
      for(const doc of docs)await resourcePdfAudit(page,doc,{exercise:doc==='law2',download:doc==='law2'});
      for(const doc of representative)await sourceTabAudit(page,doc);
    }else if([360,412,768,1440,1920].includes(vp.width)){
      for(const doc of representative)await resourcePdfAudit(page,doc);
      for(const doc of ['fire1','law2'])await sourceTabAudit(page,doc);
    }
    check(errors.length===0,vp.label+' runtime/console errors = 0',{errors});
    await ctx.close();
  }
}finally{
  await browser.close();
  await new Promise(resolve=>mirror.server.close(resolve));
}
if(failures.length){
  console.error('V70_FULL_RUNTIME_AUDIT_FAILURES',JSON.stringify(failures));
  process.exit(1);
}
console.log('V70_FULL_RUNTIME_AUDIT_SUCCESS',JSON.stringify({passes:passes.length,docs,viewports:['360','390','412','768','1024','1440','1920'],accessibility:'dialog-focus-trap-return',pdfActions:'search-jump-download'}));
