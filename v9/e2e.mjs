import { chromium } from 'playwright';
import fs from 'node:fs';

const base='http://127.0.0.1:4173/v9/index.html';
const fixture=fs.readFileSync(new URL('./fixtures/private-sample.pdf',import.meta.url));
const forbidden=['fail-closed','page-verified','Release Gate','검증문제·범위 검증 진행 중','DRM 우회','서버 원본 업로드','RLS','Supabase'];
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r))}
function collectErrors(page){const out=[];page.on('pageerror',e=>out.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|404.*official-pdf/i.test(m.text()))out.push('console:'+m.text())});return out}
async function boot(page){await page.route('**/api/official-pdf?**',async route=>{await route.fulfill({status:200,contentType:'application/pdf',headers:{'accept-ranges':'bytes','cache-control':'no-store'},body:fixture})});await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');await page.waitForFunction(()=>!!window.AITUTOR_V9?.App)}
async function cleanPage(page,label){const text=await page.locator('body').innerText();for(const x of forbidden)assert(!text.includes(x),label+' hides internal text: '+x);await noX(page,label)}
async function go(page,id){await page.evaluate(id=>window.AITUTOR_V9.App.go(id),id);await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.page===id,id)}

const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  const p=await desktop.newPage(),derr=collectErrors(p);
  await boot(p);
  assert((await p.locator('.mobile-nav').isHidden()),'desktop hides mobile navigation');
  assert(!(await p.locator('body').innerText()).includes('준비도'),'global header no longer repeats readiness');

  await go(p,'study');await p.waitForSelector('.workspace');
  await cleanPage(p,'desktop study');
  assert(await p.locator('.tabbar button').count()===4,'desktop study has exactly four learning tabs');
  assert((await p.locator('.tabbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문','desktop tabs are 핵심/상세/문제/원문');
  assert(!(await p.locator('.concept-head').innerText()).includes('숙련도'),'study header hides mastery/internal id status');

  await p.locator('[data-outline]').first().click();await p.waitForSelector('.outline.open');
  const outlineText=await p.locator('.outline.open').innerText();
  assert(/^목차/m.test(outlineText),'TOC opens as navigation drawer');
  assert(/1\.\s/.test(outlineText),'TOC uses readable numbered titles');
  assert(!/F\d\d-C\d\d/.test(outlineText),'TOC hides internal concept ids');
  await p.locator('.outline.open [data-concept="F03-C06"]').click();
  await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');
  assert((await p.locator('.concept-head h2').innerText()).includes('플래시오버'),'TOC selects concept directly');

  await p.locator('.tabbar [data-study-tab="detail"]').click();
  await p.waitForSelector('.detail-view');
  const flashDetail=await p.locator('.study-body-desktop').innerText();
  assert(flashDetail.includes('백드래프트'),'detail view includes confusing-concept comparison');
  assert(await p.locator('.detail-num').count()===0,'decorative numbered detail badges are removed');
  assert(!flashDetail.includes('개념 구조와 읽는 순서'),'meta learning heading is removed/simplified');

  const before=await p.evaluate(()=>({id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  await p.locator('[data-study-next]').click();
  const after=await p.evaluate(()=>({id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  assert(before.id!==after.id&&after.tab==='detail','next concept keeps current learning tab without reopening TOC');

  await go(p,'exam');await cleanPage(p,'desktop exam');
  const examText=await p.locator('.page').innerText();
  assert(examText.includes('65문항 · 65분')&&examText.includes('소방학개론 25문항')&&examText.includes('응급처치학개론 40문항'),'exam landing shows real 25+40 / 65-minute format');
  assert(!examText.includes('검증문제')&&!examText.includes('미검증'),'exam landing hides question-bank engineering state');

  await go(p,'resources');await cleanPage(p,'desktop resources');
  assert((await p.locator('.page').innerText()).includes('공식 자료'),'resources page is student-facing');
  assert(!(await p.locator('.page').innerText()).includes('Gate'),'resources page hides release/content gates');

  await go(p,'settings');await cleanPage(p,'desktop settings');
  assert((await p.locator('.page').innerText()).includes('개인 자료'),'settings keeps only user-relevant privacy information');
  assert(derr.length===0,'desktop runtime errors = 0 '+derr.join(' | '));
  await desktop.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const m=await mobile.newPage(),merr=collectErrors(m);
  await boot(m);
  const navLabels=(await m.locator('.mobile-nav button').allInnerTexts()).map(x=>x.trim());
  assert(JSON.stringify(navLabels)===JSON.stringify(['홈','학습','시험','오답','더보기']),'mobile primary navigation is explicit and student-facing');
  await cleanPage(m,'mobile home');

  await m.locator('.mobile-nav [data-go="study"]').click();await m.waitForSelector('.book-mobile');
  await cleanPage(m,'mobile study');
  assert(await m.locator('.page-study .top').isHidden(),'mobile study removes duplicate global header');
  assert(await m.locator('.page-study .actionbar').isVisible(),'mobile study keeps previous/TOC/next navigation');
  assert(await m.locator('.book-jumpbar button').count()===4,'mobile study has four true content tabs');
  assert((await m.locator('.book-jumpbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문','mobile tabs are 핵심/상세/문제/원문');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C04');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .detail-view');
  const detailText=await m.locator('.book-section').innerText();
  assert(!detailText.includes('개념 구조와 읽는 순서'),'mobile detail removes unnecessary meta heading');
  assert(await m.locator('.book-section .detail-num').count()===0,'mobile detail has no detached numeric badges');

  await m.locator('[data-outline]').first().click();await m.waitForSelector('.outline.open');
  const mtoc=await m.locator('.outline.open').innerText();
  assert(!/F\d\d-C\d\d/.test(mtoc)&&/1\.\s/.test(mtoc),'mobile TOC uses aligned numbered names without ids');
  await m.locator('[data-outline-close]').click();

  const action=await m.locator('.page-study .actionbar').boundingBox(),nav=await m.locator('.mobile-nav').boundingBox();
  assert(action&&nav&&action.y+action.height<=nav.y+2,'study action bar stays above bottom navigation');
  const scrollState=await m.locator('.study-body-mobile').evaluate(el=>({overflow:getComputedStyle(el).overflowY,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
  assert(['auto','scroll'].includes(scrollState.overflow),'mobile study uses one dedicated vertical body scroller');
  await noX(m,'mobile study detail');

  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  await m.waitForSelector('.source-only [data-source-concept]');
  await m.locator('.source-only [data-source-concept]').click();
  await m.waitForSelector('#pdfEvidence');
  await m.waitForSelector('#pdfEvidence canvas',{timeout:60000});
  assert(await m.locator('#pdfEvidence canvas').count()===1,'official evidence opens a PDF.js canvas from the source tab');
  const cache=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,a=await V.SourcePDF.openPdf(key),b=await V.SourcePDF.openPdf(key);return{same:a.pdf===b.pdf,origin:a.origin}});
  assert(cache.same&&cache.origin==='official-range','official PDF loader reuses range-streamed document cache');
  await m.locator('[data-pdf-close]').click();

  await m.locator('.mobile-nav [data-go="exam"]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='exam');
  await cleanPage(m,'mobile exam');
  const mexam=await m.locator('.page').innerText();
  assert(mexam.includes('65문항 · 65분'),'mobile exam starts with real exam format instead of validation diagnostics');
  const practice=m.locator('[data-exam-start="practice"]');
  await practice.click();await m.waitForSelector('.question-card');
  assert(await m.locator('.question-card .choice').count()===4,'practice exam renders one four-choice question at a time');
  await noX(m,'mobile exam question');

  await go(m,'notes');await m.waitForSelector('#personalFile');
  await cleanPage(m,'mobile notes');
  const notesText=await m.locator('.page').innerText();
  assert(notesText.includes('PDF / 사진')&&notesText.includes('내 자료'),'notes page prioritizes study actions');
  assert(!notesText.includes('DRM')&&!notesText.includes('브라우저에서 텍스트/OCR 처리'),'notes page removes technical/copyright implementation prose');
  await m.locator('#personalFile').setInputFiles({name:'private-sample.pdf',mimeType:'application/pdf',buffer:fixture});
  await m.waitForFunction(()=>document.querySelector('[data-upload-status]')?.textContent?.includes('분석 완료'),null,{timeout:60000});
  assert((await m.locator('[data-upload-status]').innerText()).includes('분석 완료'),'personal PDF reports visible analysis completion');
  await m.waitForSelector('[data-doc-open]');
  await m.locator('[data-doc-open]').first().click();await m.waitForSelector('.doc-viewer');
  const viewer=await m.locator('.doc-viewer-text').innerText();
  assert(viewer.trim().length>20&&viewer.includes('[1쪽]'),'uploaded PDF extracted text can be opened and checked');
  await m.locator('[data-doc-viewer-close]').click();
  await noX(m,'mobile notes');

  await go(m,'stats');await cleanPage(m,'mobile stats');
  assert(!(await m.locator('.page').innerText()).includes('검증문제 커버'),'stats removes engineering validation metrics');

  assert(merr.length===0,'mobile runtime errors = 0 '+merr.join(' | '));
  await mobile.close();
  console.log('V9_STUDENT_UX_E2E_SUCCESS');
}finally{
  await browser.close();
}
