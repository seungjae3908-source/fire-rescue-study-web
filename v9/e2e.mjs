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
  assert(await p.locator('[data-resource-doc]').count()===10,'resources page exposes all ten official textbooks as in-app PDF actions');
  assert(await p.locator('.resources-119 a[target="_blank"]').count()===0,'resources page no longer sends the normal study flow to an external tab');
  await p.locator('[data-resource-doc]').first().click();await p.waitForSelector('#resourcePdf canvas',{timeout:60000});
  assert(await p.locator('#resourcePdf canvas').count()===1,'official resource opens inside the app with the shared PDF renderer');
  await p.locator('[data-resource-pdf-close]').click();

  await go(p,'settings');await cleanPage(p,'desktop settings');
  assert((await p.locator('.page').innerText()).includes('개인 자료'),'settings keeps only user-relevant privacy information');

  await go(p,'tutor');await cleanPage(p,'desktop AI question');
  const tutorText=await p.locator('.page').innerText();
  assert(!/F\d\d-C\d\d/.test(tutorText)&&!tutorText.includes('WebGPU'),'AI question screen hides internal concept ids and engine jargon');

  assert(derr.length===0,'desktop runtime errors = 0 '+derr.join(' | '));
  await desktop.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  const m=await mobile.newPage(),merr=collectErrors(m);
  await boot(m);
  const navLabels=(await m.locator('.mobile-nav button').allInnerTexts()).map(x=>x.trim());
  assert(JSON.stringify(navLabels)===JSON.stringify(['홈','학습','시험','오답','더보기']),'mobile primary navigation is explicit and student-facing');
  await cleanPage(m,'mobile home');
  const todayBox=await m.locator('.today-item').first().boundingBox();
  const todayTitleBox=await m.locator('.today-item').first().locator('b').boundingBox();
  assert(todayBox&&todayTitleBox&&todayTitleBox.width>Math.min(220,todayBox.width*.55),'today learning title receives the main row width instead of a narrow legacy score column');

  await m.locator('.mobile-nav [data-go="study"]').click();await m.waitForSelector('.book-mobile');
  await cleanPage(m,'mobile study');
  assert(await m.locator('.page-study .top').isHidden(),'mobile study removes duplicate global header');
  assert(await m.locator('.page-study .actionbar').isVisible(),'mobile study keeps previous/TOC/next navigation');
  assert(await m.locator('.book-jumpbar button').count()===4,'mobile study has four true content tabs');
  assert((await m.locator('.book-jumpbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문','mobile tabs are 핵심/상세/문제/원문');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="quiz"]').click();
  await m.waitForSelector('.book-section .question-card');
  assert(await m.locator('.book-section .question-card').first().locator('.tag').count()===0,'practice question hides difficulty/evidence badges before the student answers');
  await m.locator('.book-section .question-card').first().locator('.choice').first().click();
  assert(await m.locator('.book-section .question-card').first().locator('.question-result-meta .tag').count()===1,'practice question shows only compact difficulty feedback after answering');
  await m.locator('.book-jumpbar [data-study-tab="core"]').click();
  await m.waitForSelector('.book-section .study-must');
  assert((await m.locator('.book-section .study-must-title').innerText()).includes('★ 시험필수'),'core learning exposes a compact exam-essential block');
  assert(await m.locator('.book-section .study-must li').count()>=1,'core learning underlines only curated must-remember points');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .detail-view');
  const detailText=await m.locator('.book-section').innerText();
  assert(!detailText.includes('개념 구조와 읽는 순서')&&!detailText.includes('개념 이해'),'mobile detail simplifies meta headings to 개념');
  assert(await m.locator('.book-section .detail-num').count()===0,'mobile detail has no detached numeric badges');
  assert(await m.locator('.book-section .detail-view>.lead').count()===0,'detail tab does not repeat the core summary above structured detail');
  const dup=await m.locator('.book-section .detail-section p').evaluateAll(nodes=>{const norm=s=>String(s||'').replace(/[^0-9A-Za-z가-힣]/g,'');const a=nodes.map(n=>norm(n.textContent)).filter(Boolean);return a.length!==new Set(a).size});
  assert(!dup,'detail tab removes duplicate section bodies');
  const bodyHeight=await m.locator('.study-body-mobile').evaluate(el=>el.clientHeight);
  assert(bodyHeight>=320,'mobile study keeps at least 320px for learning content');

  await m.locator('[data-outline]').first().click();await m.waitForSelector('.outline.open');
  const mtoc=await m.locator('.outline.open').innerText();
  assert(!/F\d\d-C\d\d/.test(mtoc)&&/1\.\s/.test(mtoc),'mobile TOC uses aligned numbered names without ids');
  await m.locator('.outline.open button[data-outline-close]').click();

  const action=await m.locator('.page-study .actionbar').boundingBox(),nav=await m.locator('.mobile-nav').boundingBox();
  assert(action&&nav&&action.y+action.height<=nav.y+2,'study action bar stays above bottom navigation');
  const scrollState=await m.locator('.study-body-mobile').evaluate(el=>({overflow:getComputedStyle(el).overflowY,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight}));
  assert(['auto','scroll'].includes(scrollState.overflow),'mobile study uses one dedicated vertical body scroller');
  await noX(m,'mobile study detail');

  const pageMap=await m.evaluate(()=>{const S=window.AITUTOR_V9.SourcePDF;return{fire1:S.pdfPage('fire1',14),fire2:S.pdfPage('fire2',352),ems:S.pdfPage('ems',72),fire1Back:S.bookPage('fire1',30),fire2Back:S.bookPage('fire2',362),emsBack:S.bookPage('ems',90),prevention1Pdf:S.pdfPage('prevention1',17),prevention1Book:S.bookPage('prevention1',17)}});
  assert(pageMap.fire1===30&&pageMap.fire2===362&&pageMap.ems===90&&pageMap.fire1Back===14&&pageMap.fire2Back===352&&pageMap.emsBack===72,'official textbook printed pages map to actual PDF pages for fire1/fire2/EMS');
  assert(pageMap.prevention1Pdf===17&&pageMap.prevention1Book===0,'unproven prevention page offsets stay raw PDF anchors instead of being mislabeled as textbook pages');

  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  await m.waitForSelector('.study-body-mobile .source-only [data-source-concept]');
  await m.locator('.study-body-mobile .source-only [data-source-concept]').click();
  await m.waitForSelector('#pdfEvidence');
  assert(Number(await m.locator('#pdfEvidence').getAttribute('data-page'))===30,'F03-C03 opens at mapped PDF page 30 for textbook page 14');
  await m.waitForSelector('#pdfEvidence canvas',{timeout:60000});
  assert(await m.locator('#pdfEvidence canvas').count()===1,'official evidence opens a PDF.js canvas from the source tab');
  const pdfVisual=await m.locator('#pdfEvidence').evaluate(root=>{const canvas=root.querySelector('canvas'),box=canvas?.getBoundingClientRect(),lines=root.querySelectorAll('.pdf-evidence-line');return{pixelWidth:canvas?.width||0,cssWidth:box?.width||0,evidence:lines.length,legacy:[...root.querySelectorAll('.pdf-highlight-box')].filter(x=>getComputedStyle(x).display!=='none').length,label:root.querySelector('[data-pdf-page-label]')?.textContent||''}});
  assert(pdfVisual.pixelWidth>=pdfVisual.cssWidth*1.8,'mobile PDF canvas renders at high device-pixel density for crisp text');
  assert(pdfVisual.evidence<=3,'PDF highlights at most three evidence lines and fails closed to zero when no confident line match exists');
  assert(pdfVisual.legacy===0&&!/근거\s+\d+개/.test(pdfVisual.label),'legacy keyword boxes/count are hidden from the student');
  const cache=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,a=await V.SourcePDF.openPdf(key),b=await V.SourcePDF.openPdf(key);return{same:a.pdf===b.pdf,origin:a.origin}});
  const local=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc;return await V.SourcePDF.availability(key)});
  assert(cache.same&&(/local-cache/.test(cache.origin)||cache.origin==='official-static-range')&&(local.local||local.mirror),'official PDF uses local cache or stable static mirror and is reused after first load');
  const closeBox=await m.locator('#pdfEvidence [data-pdf-close]').boundingBox();
  assert(closeBox&&closeBox.height<60,'PDF close button stays compact instead of stretching with the header');
  await m.locator('[data-pdf-close]').click();

  await m.locator('.mobile-nav [data-go="exam"]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='exam');
  await cleanPage(m,'mobile exam');
  const mexam=await m.locator('.page').innerText();
  assert(mexam.includes('65문항 · 65분'),'mobile exam starts with real exam format instead of validation diagnostics');
  assert(await m.locator('[data-calc-bank]').count()===1,'exam landing exposes a dedicated calculation practice action');
  await m.locator('[data-calc-bank]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='bank');
  await m.waitForSelector('.question-card');
  const calcBank=await m.evaluate(()=>{const V=window.AITUTOR_V9,A=V.App.runtime;const qs=(V.questions||[]).filter(q=>V.QuestionQuality119.isExamStyle(q)&&q.type==='계산형');return{filter:A.bankFilter,count:qs.length,current:qs[A.bankIndex]?.type,ids:qs.map(q=>q.id)}}); 
  assert(calcBank.filter==='calc'&&calcBank.count>=8&&calcBank.current==='계산형','calculation practice opens only calculation-type questions with at least the eight source-backed drills');
  assert(calcBank.ids.filter(id=>/^119-calc-/.test(id)).length===13,'calculation practice includes all thirteen source-backed calculation drills');
  await noX(m,'mobile calculation practice');
  await go(m,'exam');await m.waitForSelector('.exam-start');
  const realStart=m.locator('[data-exam-start="real"]');
  assert(await realStart.count()===1,'real mock start is enabled only after verified fire+EMS scope coverage closes');
  await realStart.click();await m.waitForSelector('.question-card');
  const realMock=await m.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam,fire=e.qs.filter(q=>q.subject==='fire'),ems=e.qs.filter(q=>q.subject==='ems');return{mode:e.mode,total:e.qs.length,fire:fire.length,ems:ems.length,verified:e.qs.every(q=>q.grade==='A'||q.grade==='B'),unique:new Set(e.qs.map(q=>q.id)).size}});
  assert(realMock.mode==='real'&&realMock.total===65&&realMock.fire===25&&realMock.ems===40&&realMock.verified&&realMock.unique===65,'real mock builds 25 verified fire + 40 verified EMS questions with no duplicates');
  await m.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('exam')});
  await m.waitForSelector('.exam-start');
  const practice=m.locator('[data-exam-start="practice"]');
  await practice.click();await m.waitForSelector('.question-card');
  assert(await m.locator('.question-card .choice').count()===4,'practice exam renders one four-choice question at a time');
  const generatedStemAudit=await m.evaluate(()=>window.AITUTOR_V9.questions.filter(q=>q.generatedPractice).every(q=>!/(다음 심화 설명을 가장 정확히|교재형 상세 설명|30초 핵심 설명|학습노드|exact-page)/.test(String(q.q||''))));
  assert(generatedStemAudit,'generated practice questions use concise student-facing exam stems');
  const qStyle=await m.locator('.question-card h2').evaluate(el=>({font:parseFloat(getComputedStyle(el).fontSize),line:getComputedStyle(el).lineHeight}));
  assert(qStyle.font<=20,'mobile question stem uses compact exam-readable typography');
  const mock=await m.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam,fire=e.qs.filter(q=>q.subject==='fire'),ems=e.qs.filter(q=>q.subject==='ems');return{total:e.qs.length,fire:fire.length,ems:ems.length,unique:new Set(e.qs.map(q=>q.id)).size,fireScopes:new Set(fire.map(q=>q.scopeId)).size,emsScopes:new Set(ems.map(q=>q.scopeId)).size}});
  assert(mock.total===65&&mock.fire===25&&mock.ems===40&&mock.unique===65,'practice mock blueprint is 25 fire + 40 EMS with no duplicate questions');
  assert(mock.fireScopes>=7,'practice mock covers every fire scope');
  assert(mock.emsScopes>=24,'practice mock covers every EMS scope');
  await noX(m,'mobile exam question');

  await m.evaluate(()=>{
    const e=window.AITUTOR_V9.App.runtime.exam;
    e.answers={};
    e.qs.forEach((q,i)=>{e.answers[q.id]=i===0?(q.a+1)%4:q.a});
    e.i=e.qs.length-1;
    window.AITUTOR_V9.App.render();
  });
  await m.waitForSelector('[data-exam-next]');
  await m.locator('[data-exam-next]').click();
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='stats'&&!!window.AITUTOR_V9.App.runtime.examReportId);
  await m.waitForSelector('.exam-report');
  const reportText=await m.locator('.exam-report').innerText();
  assert(reportText.includes('64/65')&&reportText.includes('오답·미응답 분석')&&reportText.includes('1문항'),'finished mock opens a 65-question score + wrong-answer analysis');
  assert(reportText.includes('내 답')&&reportText.includes('정답')&&reportText.includes('정답 근거'),'exam analysis shows selected answer, correct answer and explanation');
  assert(await m.locator('.exam-report [data-concept]').count()>=1&&await m.locator('.exam-report [data-source-concept]').count()>=1,'exam analysis links wrong questions to concept review and official evidence');
  await noX(m,'mobile exam analysis');
  await m.locator('[data-report-close]').click();
  assert(await m.locator('[data-exam-report]').count()>=1,'recent exam history keeps an analysis action for locally detailed results');

  await go(m,'notes');await m.locator('#personalFile').waitFor({state:'attached'});
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

  const pngBase64=await m.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=360;
    const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);
    g.fillStyle='#000';g.font='bold 92px Arial, sans-serif';g.textBaseline='middle';g.fillText('119 RESCUE OCR 2468',70,180);
    const blob=await new Promise((res,rej)=>canvas.toBlob(x=>x?res(x):rej(Error('PNG_CREATE_FAILED')),'image/png'));
    return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=()=>rej(fr.error);fr.readAsDataURL(blob)});
  });
  await m.locator('#personalFile').setInputFiles({name:'ocr-ui.png',mimeType:'image/png',buffer:Buffer.from(pngBase64,'base64')});
  await m.waitForFunction(()=>window.AITUTOR_V9.App.runtime.docs.some(d=>d.title==='ocr-ui.png'),null,{timeout:180000});
  const imageRow=m.locator('.doc-row').filter({hasText:'ocr-ui.png'});
  await imageRow.locator('[data-doc-open]').click();await m.waitForSelector('.doc-viewer');
  const ocrText=await m.locator('.doc-viewer-text').innerText();
  assert(/RESCUE/i.test(ocrText)&&/2468/.test(ocrText),'uploaded photo OCR text can be opened and checked');
  await m.locator('[data-doc-viewer-close]').click();
  await noX(m,'mobile notes');

  await go(m,'stats');await cleanPage(m,'mobile stats');
  assert(!(await m.locator('.page').innerText()).includes('검증문제 커버'),'stats removes engineering validation metrics');

  await go(m,'study');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C06'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C06');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .hazmat-table tbody tr');
  const hazRow=await m.locator('.book-section .hazmat-table tbody tr').first().evaluate(tr=>{const cells=[...tr.querySelectorAll('td')].map(td=>td.getBoundingClientRect());return{tr:tr.getBoundingClientRect().toJSON?.()||{x:tr.getBoundingClientRect().x,width:tr.getBoundingClientRect().width},cells:cells.map(x=>({x:x.x,y:x.y,width:x.width,height:x.height}))}});
  assert(hazRow.cells.length>=2&&Math.abs(hazRow.cells[0].y-hazRow.cells[1].y)<3,'hazardous-material name and designated quantity appear on the same mobile row');
  await noX(m,'mobile hazardous-material detail');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C01'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C01');
  assert((await m.locator('.concept-head h2').innerText()).includes('특수가연물'),'hazardous-material curriculum exposes the special-combustible distinction');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.special-combustible-reference .hazmat-table tbody tr');
  assert(await m.locator('.special-combustible-reference .hazmat-table tbody tr').count()===11,'special-combustible detail renders all eleven current-law quantity rows');
  const specialText=await m.locator('.special-combustible-reference').innerText();
  assert(specialText.includes('면화류')&&specialText.includes('200 kg')&&specialText.includes('가연성액체류')&&specialText.includes('2 ㎥')&&specialText.includes('최소 6m'),'special-combustible lesson shows quantity units and outdoor storage distance');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  assert(await m.locator('.book-section .source-law-links a').count()>=3,'special-combustible source tab links the current law article and annexes');
  await noX(m,'mobile special-combustible law');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C01'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C01');
  assert((await m.locator('.concept-head h2').innerText()).includes('건축방재'),'facilities curriculum exposes building-fire fundamentals');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const buildingText=await m.locator('.book-section').innerText();
  assert(buildingText.includes('방화구획')&&buildingText.includes('방화벽')&&buildingText.includes('내화구조')&&buildingText.includes('준불연재료')&&buildingText.includes('난연재료'),'building-fire lesson separates compartments, walls, fire resistance and material classes');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  const buildingLinks=m.locator('.book-section .source-law-links a');
  assert(await buildingLinks.count()>=3,'building-fire source tab exposes official Building Act links');
  await noX(m,'mobile building-fire law');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E01-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E01-C03');
  assert((await m.locator('.concept-head h2').innerText()).includes('119구급대 법령'),'EMS curriculum exposes the current 119-law lesson');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const lawText=await m.locator('.book-section').innerText();
  assert(lawText.includes('구급차 운전과 구급 보조업무')&&lawText.includes('24시간')&&lawText.includes('항공구조구급대'),'119-law lesson teaches qualification limits, 24-hour situation center and air EMS');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  const lawLinks=m.locator('.book-section .source-law-links a');
  assert(await lawLinks.count()>=4,'119-law source tab exposes current official law links');
  const lawHrefs=await lawLinks.evaluateAll(nodes=>nodes.map(x=>x.getAttribute('href')||''));
  assert(lawHrefs.every(x=>/^https:\/\/law\.go\.kr\//.test(x)),'119-law source links stay on the official National Law Information Center domain');
  await noX(m,'mobile 119-law source');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E05-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E05-C04');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .detail-view');
  const triageText=await m.locator('.page-study').innerText();
  assert(triageText.includes('기록지·중증도 분류')&&triageText.includes('START')&&triageText.includes('호흡 · 맥박 · 의식'),'START triage is a visible learner-facing section instead of a hidden audit gap');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E20-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E20-C03');
  assert((await m.locator('.concept-head h2').innerText()).includes('신생아 초기처치'),'obstetric curriculum exposes newborn initial care in the lesson title');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const newbornText=await m.locator('.book-section').innerText();
  assert(newbornText.includes('Apgar')&&newbornText.includes('출생 1분')&&newbornText.includes('5분'),'newborn lesson teaches Apgar timing');
  assert(newbornText.includes('입을 먼저')&&newbornText.includes('코를 흡인'),'newborn lesson teaches source-backed mouth-before-nose suction sequence');
  assert(newbornText.includes('8~10점')&&newbornText.includes('3~7점')&&newbornText.includes('0~2점'),'newborn lesson compares all three textbook Apgar score groups');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E14-C02'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E14-C02');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const chestText=await m.locator('.book-section').innerText();
  assert(chestText.includes('긴장성 기흉')&&chestText.includes('삼면드레싱')&&chestText.includes('저혈압'),'chest-trauma enrichment teaches deterioration after occlusive dressing and tension-pneumothorax warning signs');
  assert(chestText.includes('내장적출')&&chestText.includes('밀어 넣지')&&chestText.includes('골반골 골절'),'same trauma lesson adds abdominal evisceration and severe pelvic-trauma transport cues');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E14-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E14-C03');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .calc-lab');
  const parklandText=await m.locator('.book-section').innerText();
  assert(parklandText.includes('Parkland')&&parklandText.includes('4 mL × 체중(kg) × 2·3도 화상 TBSA(%)')&&parklandText.includes('7,200mL'),'burn lesson exposes Parkland formula, timing and worked example');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const firePhenomenaText=await m.locator('.book-section').innerText();
  for(const term of ['플레임오버','롤오버','플래시오버','백드래프트'])assert(firePhenomenaText.includes(term),'four-way fire comparison includes '+term);

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C10'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C10');
  assert((await m.locator('.concept-head h2').innerText()).trim()==='플레임오버','flameover has its own curriculum lesson title');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const flameoverText=await m.locator('.book-section').innerText();
  assert(flameoverText.includes('벽면')&&flameoverText.includes('천장')&&flameoverText.includes('롤오버와 비교'),'flameover lesson teaches wall-to-ceiling flame spread separately from rollover');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C07'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C07');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const smokeText=await m.locator('.book-section').innerText();
  assert(smokeText.includes('굴뚝효과')&&smokeText.includes('역굴뚝효과')&&smokeText.includes('HVAC'),'smoke lesson adds stack-effect and smoke-movement comparison');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C08'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C08');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const explosionText=await m.locator('.book-section').innerText();
  assert(explosionText.includes('UVCE')&&explosionText.includes('BLEVE')&&explosionText.includes('폭연')&&explosionText.includes('폭굉'),'explosion lesson compares UVCE, BLEVE, deflagration and detonation');

  await m.locator('.mobile-nav [data-more]').click();
  await m.waitForSelector('.menu-modal');
  const menuLabels=(await m.locator('.menu-modal .menu-list button').allInnerTexts()).join(' ');
  assert(!menuLabels.includes('AI AI')&&menuLabels.includes('AI 질문'),'more menu removes duplicated AI label');
  const menuBoxes=await m.locator('.menu-modal .menu-list button').evaluateAll(nodes=>nodes.slice(0,2).map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width}}));
  assert(menuBoxes.length===2&&Math.abs(menuBoxes[0].y-menuBoxes[1].y)<3&&menuBoxes[0].x!==menuBoxes[1].x,'more menu uses compact two-column layout');
  await m.locator('[data-close-more]').click();

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  for(const tab of ['core','detail','quiz','source']){
    await m.evaluate(tab=>{window.AITUTOR_V9.Store.state.studyTab=tab;window.AITUTOR_V9.Store.save();window.AITUTOR_V9.App.render?.()},tab).catch(()=>{});
    if((await m.evaluate(()=>window.AITUTOR_V9.Store.state.page))!=='study')await go(m,'study');
    await m.evaluate(tab=>{window.AITUTOR_V9.Store.state.studyTab=tab;window.AITUTOR_V9.Store.save();window.AITUTOR_V9.App.runtime.more=false;},tab);
    await m.evaluate(()=>window.AITUTOR_V9.App.go('study'));
    await m.waitForSelector('.book-jumpbar');
    await noX(m,'mobile study tab '+tab);
  }
  await m.locator('.book-jumpbar [data-study-tab="core"]').click();
  assert(await m.locator('.book-section .lesson>h3').count()===0,'core tab avoids repeating the selected tab title as a body heading');
  await m.locator('.book-jumpbar [data-study-tab="quiz"]').click();
  assert(await m.locator('.book-section .lesson>h3').count()===0,'quiz tab avoids repeating the selected tab title as a body heading');

  for(const route of ['home','study','tutor','notes','bank','exam','wrong','stats','resources','settings']){
    await go(m,route);
    await m.waitForSelector('.page');
    await noX(m,'mobile route '+route);
  }

  assert(merr.length===0,'mobile runtime errors = 0 '+merr.join(' | '));
  await mobile.close();

  {
    const tablet=await browser.newContext({viewport:{width:768,height:1024}});
    const t=await tablet.newPage(),terrs=collectErrors(t);
    await boot(t);
    await noX(t,'tablet 768 home');
    await go(t,'study');await t.waitForSelector('.workspace');
    await noX(t,'tablet 768 study');
    assert(await t.locator('.tabbar button').count()===4||await t.locator('.book-jumpbar button').count()===4,'tablet 768 keeps four learning tabs');
    await go(t,'exam');await noX(t,'tablet 768 exam');
    await go(t,'resources');await noX(t,'tablet 768 resources');
    assert(terrs.length===0,'tablet 768 runtime errors = 0 '+terrs.join(' | '));
    await tablet.close();
  }

  for(const [width,height] of [[360,800],[412,915]]){
    const ctx=await browser.newContext({viewport:{width,height},isMobile:true});
    const page=await ctx.newPage(),errs=collectErrors(page);
    await boot(page);
    await noX(page,`mobile ${width} home`);
    await go(page,'study');await page.waitForSelector('.book-mobile');
    await noX(page,`mobile ${width} study`);
    assert(await page.locator('.book-jumpbar button').count()===4,`mobile ${width} keeps four study tabs`);
    const action=await page.locator('.page-study .actionbar').boundingBox(),nav=await page.locator('.mobile-nav').boundingBox();
    assert(action&&nav&&action.y+action.height<=nav.y+2,`mobile ${width} study controls stay above bottom navigation`);
    await go(page,'exam');await noX(page,`mobile ${width} exam`);
    assert(errs.length===0,`mobile ${width} runtime errors = 0 ${errs.join(' | ')}`);
    await ctx.close();
  }

  {
    const offlineCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
    const offlinePage=await offlineCtx.newPage(),offlineErrors=collectErrors(offlinePage);
    await boot(offlinePage);
    await offlinePage.waitForFunction(async()=>{if(!('serviceWorker' in navigator))return false;await navigator.serviceWorker.ready;return true},{},{timeout:60000});
    await offlinePage.reload({waitUntil:'domcontentloaded'});
    await offlinePage.waitForSelector('.app');
    await offlinePage.waitForFunction(()=>!!navigator.serviceWorker.controller,null,{timeout:30000});
    await offlineCtx.setOffline(true);
    await offlinePage.reload({waitUntil:'domcontentloaded',timeout:30000});
    await offlinePage.waitForSelector('.app');
    await offlinePage.waitForFunction(()=>!!window.AITUTOR_V9?.App);
    assert((await offlinePage.locator('body').innerText()).includes('홈'),'v9 PWA shell reloads while offline');
    assert(offlineErrors.filter(x=>!/ERR_INTERNET_DISCONNECTED|Failed to fetch|favicon/i.test(x)).length===0,'offline shell has no unexpected runtime errors');
    await offlineCtx.setOffline(false);
    await offlineCtx.close();
  }

  console.log('V9_STUDENT_UX_E2E_SUCCESS');
}finally{
  await browser.close();
}
