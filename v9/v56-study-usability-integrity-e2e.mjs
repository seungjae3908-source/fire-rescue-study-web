import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1024,height:768}});
  const page=await ctx.newPage();page.setDefaultTimeout(45000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store);

  // Outline search: exact concept search, no-result state, clear.
  await page.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='core';s.outline=true;V.Store.save();V.App.render()});
  await page.waitForSelector('.outline.open [data-outline-search]');
  await page.locator('[data-outline-search]').fill('백드래프트');
  await page.waitForFunction(()=>document.querySelectorAll('.outline.open .concepts [data-concept]').length>0);
  const outlineHit=await page.locator('.outline.open').evaluate(root=>({text:root.innerText,count:root.querySelectorAll('.concepts [data-concept]').length}));
  assert(outlineHit.text.includes('백드래프트'),'outline search finds the requested concept');
  assert(outlineHit.count<20,'outline search narrows the 183-concept tree instead of leaving the whole outline visible');

  await page.locator('[data-outline-search]').fill('존재하지않는개념xyz');
  await page.waitForSelector('.outline.open .outline-empty');
  assert((await page.locator('.outline-empty').innerText()).includes('검색 결과가 없습니다'),'outline search has a clear no-result state');
  await page.locator('[data-outline-search-clear]').click();
  await page.waitForFunction(()=>document.querySelectorAll('.outline.open .concepts [data-concept]').length>20);
  assert(true,'outline search clear restores the subject outline');

  // Question confidence must be selected before answer and becomes immutable with a single answer event.
  await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.Lazy119?.ensureQuestions?.();const c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.outline=false;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='quiz';V.Store.save();V.App.render()});
  await page.waitForSelector('.study-body-desktop .question-card');
  const q=await page.locator('.study-body-desktop .question-card').evaluate(root=>{
    const btn=root.querySelector('[data-answer]'),id=btn.dataset.answer.split(':')[0],V=window.AITUTOR_V9,q=V.questionById[id];
    return{id,wrong:(Number(q.a)+1)%q.choices.length,correct:Number(q.a)}
  });
  await page.locator(`.study-body-desktop [data-confidence="${q.id}:sure"]`).click();
  await page.locator(`.study-body-desktop [data-answer="${q.id}:${q.wrong}"]`).click();
  const first=await page.evaluate(id=>{
    const s=window.AITUTOR_V9.Store.state,w=s.wrongs.find(x=>x.questionId===id&&!x.resolved);
    return{answer:s.answers[id],confidence:s.confidence[id],events:s.answerEvents.filter(x=>x.questionId===id).length,wrongCount:w?.wrongCount||0,disabled:[...document.querySelectorAll(`.study-body-desktop [data-confidence^="${id}:"]`)].every(x=>x.disabled)}
  },q.id);
  assert(first.confidence==='sure','selected confidence is committed with the answer');
  assert(first.events===1,'first answer creates exactly one mastery event');
  assert(first.wrongCount===1,'first wrong answer creates exactly one wrong-answer occurrence');
  assert(first.disabled,'confidence controls lock after answer so stored confidence cannot drift');

  await page.evaluate(({id,correct})=>{const el=document.querySelector(`.study-body-desktop [data-answer="${id}:${correct}"]`);el.disabled=false;el.click()},{id:q.id,correct:q.correct});
  const second=await page.evaluate(id=>{const s=window.AITUTOR_V9.Store.state,w=s.wrongs.find(x=>x.questionId===id&&!x.resolved);return{events:s.answerEvents.filter(x=>x.questionId===id).length,wrongCount:w?.wrongCount||0,answer:s.answers[id]}},q.id);
  assert(second.events===1&&second.wrongCount===1&&second.answer===q.wrong,'forced second click cannot mutate an already-recorded answer');

  // PDF resource page jump/search without remote dependency.
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    V.SourcePDF.render=async(key,page,host,queries=[],opts={})=>{host.innerHTML=`<div data-stub-pdf-page="${page}">stub</div>`;return{page:Number(page)||1,pages:120,bookPage:Number(page)||1,zoom:Number(opts.zoom)||1,hits:queries.length,evidenceLines:[],name:key,origin:'stub'}};
    V.SourcePDF.locate=async(key,queries)=>({page:42,pages:120,score:String(queries?.[0]||'').trim()?24:0});
    V.SourcePDF.findPages=async(key,query)=>({query,pages:120,results:String(query||'').trim()?[{page:42,score:24}]:[]});
    V.SourcePDF.availability=async()=>({local:true,direct:true,officialPage:''});
    V.App.go('resources');
  });
  await page.waitForSelector('[data-resource-doc]');
  await page.locator('[data-resource-doc]').first().click();
  await page.waitForSelector('#resourcePdf [data-resource-pdf-search-input]');
  await page.locator('#resourcePdf [data-resource-pdf-search-input]').fill('스프링클러');
  await page.locator('#resourcePdf [data-resource-pdf-search]').click();
  await page.waitForFunction(()=>document.querySelector('#resourcePdf')?.dataset.page==='42');
  assert((await page.locator('#resourcePdf').getAttribute('data-search-query'))==='스프링클러','resource PDF stores active in-document search');
  const jumpExpected=await page.evaluate(()=>{const r=document.querySelector('#resourcePdf'),key=r.dataset.docKey;return String(Object.prototype.hasOwnProperty.call(window.AITUTOR_V9.SourcePDF.pageOffsets||{},key)?window.AITUTOR_V9.SourcePDF.pdfPage(key,12):12)});
  await page.locator('#resourcePdf [data-resource-pdf-jump-input]').fill('12');
  await page.locator('#resourcePdf [data-resource-pdf-jump]').click();
  await page.waitForFunction(x=>document.querySelector('#resourcePdf')?.dataset.page===x,jumpExpected);
  assert(!(await page.locator('#resourcePdf').getAttribute('data-search-query')),'manual page jump clears stale PDF search context');
  await page.locator('#resourcePdf [data-resource-pdf-close]').click();

  // Evidence modal has the same jump/search controls.
  await page.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()});
  await page.waitForSelector('.study-body-desktop [data-source-concept="F03-C06"]');
  await page.locator('.study-body-desktop [data-source-concept="F03-C06"]').first().click();
  await page.waitForSelector('#pdfEvidence [data-pdf-search-input]');
  await page.locator('#pdfEvidence [data-pdf-search-input]').fill('플래시오버');
  await page.locator('#pdfEvidence [data-pdf-search]').click();
  await page.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.page==='42');
  assert((await page.locator('#pdfEvidence').getAttribute('data-search-query'))==='플래시오버','concept evidence PDF supports in-document text search');
  await page.locator('#pdfEvidence [data-pdf-close]').click();

  await ctx.close();

  // Mobile persistent concept navigation.
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  const m=await mobile.newPage();await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForFunction(()=>!!window.AITUTOR_V9?.App);
  await m.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()});
  await m.waitForSelector('.study-body-mobile .mobile-study-nav');
  const nav=await m.locator('.study-body-mobile .mobile-study-nav').evaluate(el=>{const r=el.getBoundingClientRect();return{display:getComputedStyle(el).display,width:r.width,vw:innerWidth,buttons:el.querySelectorAll('button').length}});
  assert(nav.display==='grid'&&nav.buttons===3&&nav.width<=nav.vw,'mobile study shows compact previous/contents/next navigation inside the viewport');
  const before=await m.evaluate(()=>window.AITUTOR_V9.Store.state.conceptId);
  await m.locator('.study-body-mobile .mobile-study-nav [data-mobile-study-next]').click();
  const after=await m.evaluate(()=>({id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  assert(after.id!==before&&after.tab==='detail','mobile next concept preserves the active study tab');
  await mobile.close();

  console.log('V56_STUDY_USABILITY_INTEGRITY_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
