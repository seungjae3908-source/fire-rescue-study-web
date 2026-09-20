import { chromium } from 'playwright';
import fs from 'node:fs';

const base='http://127.0.0.1:4173/v9/index.html';
const fixture=fs.readFileSync(new URL('./fixtures/private-sample.pdf',import.meta.url));
const forbidden=['fail-closed','page-verified','Release Gate','검증문제·범위 검증 진행 중','DRM 우회','서버 원본 업로드','RLS','Supabase'];
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r))}
function collectErrors(page){const out=[];page.on('pageerror',e=>out.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|404.*official-pdf/i.test(m.text()))out.push('console:'+m.text())});page.on('requestfailed',r=>{const u=r.url();if(/cdn\.jsdelivr\.net|tesseract|pdf\.worker|pdf\.min\.mjs/i.test(u))out.push('requestfailed:'+u+' '+(r.failure()?.errorText||''))});return out}
async function boot(page){await page.route('**/api/official-pdf?**',async route=>{await route.fulfill({status:200,contentType:'application/pdf',headers:{'accept-ranges':'bytes','cache-control':'no-store'},body:fixture})});await page.route('**/api/official-monitor**',async route=>{await route.fulfill({status:200,contentType:'application/json',headers:{'cache-control':'no-store'},body:"{\"version\":\"119-official-monitor-snapshot-v1\",\"generatedAt\":\"2026-10-01T00:00:00.000Z\",\"targetExamYear\":2027,\"baselineYear\":2026,\"officialOnly\":true,\"healthy\":true,\"coverageComplete\":true,\"policy\":{\"requiredSourceCount\":1,\"totalSourceCount\":3,\"wafBypassForbidden\":true},\"sourceStatus\":[{\"id\":\"gosi-fire\",\"label\":\"국가공무원 채용시스템 · 소방청\",\"ok\":true},{\"id\":\"nfsa-notice\",\"label\":\"중앙소방학교 고시·공고\",\"ok\":true},{\"id\":\"nfsa-materials\",\"label\":\"중앙소방학교 공식교재\",\"ok\":true}],\"items\":[{\"id\":\"e2e-2027-notice\",\"sourceId\":\"gosi-fire\",\"sourceLabel\":\"국가공무원 채용시스템 · 소방청\",\"title\":\"2027년 소방공무원 채용시험 시행계획 공고\",\"publishedAt\":\"2026-10-01\",\"url\":\"https://gongmuwon.gosi.kr/spcsv/indexMain3.do\",\"kind\":\"recruitment_notice\",\"meaningful\":true,\"reviewRequired\":true,\"targetYearMatch\":true,\"baselineYearMatch\":false,\"noticeYear\":2027}]}"})});await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');await page.waitForFunction(()=>!!window.AITUTOR_V9?.App)}
async function cleanPage(page,label){const text=await page.locator('body').innerText();for(const x of forbidden)assert(!text.includes(x),label+' hides internal text: '+x);await noX(page,label)}
async function go(page,id){await page.evaluate(id=>window.AITUTOR_V9.App.go(id),id);await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.page===id,id)}

const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  const p=await desktop.newPage(),derr=collectErrors(p);
  await boot(p);
  assert((await p.locator('.mobile-nav').isHidden()),'desktop hides mobile navigation');
  await p.waitForTimeout(150);
  assert(await p.locator('.app').count()===1,'official monitor mutation observer does not starve or duplicate the app shell');
  assert(!(await p.locator('body').innerText()).includes('준비도'),'global header no longer repeats readiness');

  await go(p,'study');await p.waitForSelector('.workspace');
  await cleanPage(p,'desktop study');
  assert(await p.locator('.tabbar button').count()===5,'desktop study has exactly five learning tabs');
  assert((await p.locator('.tabbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문 AI','desktop tabs are 핵심/상세/문제/원문/AI');
  assert(await p.locator('.study-rail').count()===0,'desktop study removes the duplicate right AI/problem/source rail');
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
  assert(!flashDetail.includes('30초 핵심')&&!flashDetail.includes('시험 직전 핵심'),'detail view does not repeat the core summary or core essentials');
  assert(await p.locator('.detail-num').count()===0,'decorative numbered detail badges are removed');
  assert(!flashDetail.includes('개념 구조와 읽는 순서'),'meta learning heading is removed/simplified');
  const aiRoute=await p.evaluate(()=>{const V=window.AITUTOR_V9;V.App.chooseConcept('F07-C08');const target=V.App.tutorConceptFor('플래시오버에 대해 알려줘');return{id:target.id,title:target.title,current:V.Store.state.conceptId}});
  assert(aiRoute.current==='F07-C08'&&/플래시오버/.test(aiRoute.title)&&aiRoute.id!==aiRoute.current,'AI routes an explicit flashover question away from the currently open sprinkler concept');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await p.locator('.tabbar [data-study-tab="ai"]').click();
  await p.waitForSelector('.study-body-desktop .study-ai [data-tutor-input]');
  assert(await p.locator('.study-body-desktop .study-ai').count()===1&&await p.locator('.study-rail').count()===0,'AI question is a first-class visible study tab instead of a duplicate right-side panel');
  const quality2Content=await p.evaluate(()=>{const V=window.AITUTOR_V9,flash=V.contentPacks.get('F03-C09'),foam=V.contentPacks.get('F07-C08'),baseQs=V.questions.filter(q=>/^119-q2-(foamprop|flash)-/.test(q.id||'')),gapQs=V.questions.filter(q=>/^119-q2-(haz-special|sprinkler-base)-/.test(q.id||''));return{flashText:[flash.summary,...(flash.detail||[]),...(flash.must||[])].join(' '),flashCompare:flash.compare?.length||0,flashDeep:flash.deepSections?.length||0,foamText:[foam.summary,...(foam.detail||[]),...(foam.must||[])].join(' '),foamCompare:foam.compare?.length||0,foamDeep:foam.deepSections?.length||0,foamQs:V.questions.filter(q=>q.conceptId==='F07-C08'&&/^119-q2-foamprop-/.test(q.id||'')).length,flashQs:V.questions.filter(q=>q.conceptId==='F03-C09'&&/^119-q2-flash-/.test(q.id||'')).length,baseQuality2:baseQs.length,gapQuality2:gapQs.length,allB:[...baseQs,...gapQs].every(q=>q.grade==='B'&&q.choices?.length===4&&q.choiceExplanations?.length===4)}}); 
  assert(/483~649℃/.test(quality2Content.flashText)&&/20 kW\/㎡/.test(quality2Content.flashText)&&quality2Content.flashCompare>=4&&quality2Content.flashDeep>=5,'flashover quality2 content includes official phase, radiation, temperature range, before/after and four-way comparison');
  assert(/라인 프로포셔너/.test(quality2Content.foamText)&&/펌프 프로포셔너/.test(quality2Content.foamText)&&/프레셔 프로포셔너/.test(quality2Content.foamText)&&/프레셔사이드 프로포셔너/.test(quality2Content.foamText)&&quality2Content.foamCompare>=4&&quality2Content.foamDeep>=6,'foam quality2 content covers all four proportioners with operating principles and comparison');
  assert(quality2Content.foamQs===12&&quality2Content.flashQs===10&&quality2Content.baseQuality2===22&&quality2Content.gapQuality2>=3&&quality2Content.allB,'quality2 keeps 22 base source-backed questions and adds explicit source-backed gap questions with full option explanations');

  const globalQuality=await p.evaluate(()=>{const V=window.AITUTOR_V9,rows=V.curriculum.concepts.map(c=>({id:c.id,features:(V.contentPacks.get(c.id)?.features||[]).length,compare:(V.contentPacks.get(c.id)?.compare||[]).length,family:V.contentPacks.get(c.id)?.compareFamily?.key||'',derived:V.contentPacks.get(c.id)?.compareDerived||'',questions:(V.QuestionQuality119.forConcept(c.id)||[]).length,title:c.title})),familyIds=new Set(V.Quality2ComparisonFamilies119?.memberIds||[]);return{total:rows.length,featureReady:rows.filter(x=>x.features>=3).length,familyTotal:familyIds.size,familyReady:rows.filter(x=>familyIds.has(x.id)&&x.compare>=2&&x.family).length,arbitrary:rows.filter(x=>x.derived==='same-scope-neighbor-summary').map(x=>x.id),highYieldNot20:rows.filter(x=>/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/.test(x.title)&&x.questions<20).map(x=>x.id)}}); 
  assert(globalQuality.featureReady===globalQuality.total,'all current verified concepts expose at least three feature/key-point lines');
  assert(globalQuality.familyReady===globalQuality.familyTotal&&globalQuality.arbitrary.length===0,'all curated comparison-family concepts use meaningful semantic comparison groups with no arbitrary neighbor fallback');
  assert(globalQuality.highYieldNot20.length===0,'all high-yield concepts expose at least twenty exam-style practice questions');

  const studySchemaAudit=await p.evaluate(()=>{const V=window.AITUTOR_V9,rows=V.curriculum.concepts.map(c=>V.Quality2StudySchema119?.get?.(c.id)).filter(Boolean);return{total:V.curriculum.concepts.length,schemas:rows.length,baseReady:rows.filter(x=>x.quick30&&x.definition&&x.features?.length>=3&&x.core?.length>=3&&x.sourceRanges?.length).length,withConditions:rows.filter(x=>x.applicability?.conditions).length,withMechanism:rows.filter(x=>x.applicability?.mechanisms).length,withTiming:rows.filter(x=>x.applicability?.timingStages).length,withWarnings:rows.filter(x=>x.applicability?.warningSigns).length,withNumbers:rows.filter(x=>x.applicability?.numbers).length,withCompare:rows.filter(x=>x.applicability?.comparison).length}}); 
  assert(studySchemaAudit.schemas===studySchemaAudit.total&&studySchemaAudit.baseReady===studySchemaAudit.total,'every current concept has grounded 30-second, definition, features, core and official source anchors');
  assert(studySchemaAudit.withMechanism>0&&studySchemaAudit.withWarnings>0&&studySchemaAudit.withNumbers>0&&studySchemaAudit.withCompare>0,'applicable concepts expose structured mechanisms warnings numbers and comparison sections without forcing them onto every concept');
  const quality4HighYield=await p.evaluate(()=>window.AITUTOR_V9.Quality4HighYield119?.audit?.());
  assert(quality4HighYield?.ready&&quality4HighYield?.missing===0,'quality 4 high-yield semantic/visual contract is complete');

  const before=await p.evaluate(()=>({id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  await p.locator('[data-study-next]').click();
  const after=await p.evaluate(()=>({id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  assert(before.id!==after.id&&after.tab===before.tab,'next concept keeps whichever learning tab is currently selected without reopening TOC');

  await go(p,'exam');await cleanPage(p,'desktop exam');
  const examText=await p.locator('.page').innerText();
  assert(examText.includes('65문항 · 65분')&&examText.includes('소방학개론 25문항')&&examText.includes('응급처치학개론 40문항'),'exam landing shows real 25+40 / 65-minute format');
  assert(!examText.includes('검증문제')&&!examText.includes('미검증'),'exam landing hides question-bank engineering state');

  assert(await p.locator('[data-training-start]').count()===11,'exam landing exposes fire EMS full-range wrong-answer and weak-concept training modes');
  await p.locator('[data-training-start="fire50"]').click();await p.waitForSelector('.exam-run-workspace');
  const fire50=await p.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{mode:e.mode,total:e.qs.length,fire:e.qs.filter(q=>q.subject==='fire').length,ems:e.qs.filter(q=>q.subject==='ems').length,label:e.blueprint?.label}});
  assert(fire50.mode==='training'&&fire50.total===50&&fire50.fire===50&&fire50.ems===0&&/소방학 집중 50/.test(fire50.label||''),'fire 50 training builds fifty unique fire questions outside real mock mode');
  await p.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('exam')});await p.waitForSelector('.exam-start');
  await p.locator('[data-training-start="all200"]').click();await p.waitForSelector('.exam-run-workspace');
  const all200=await p.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{mode:e.mode,total:e.qs.length,fire:e.qs.filter(q=>q.subject==='fire').length,ems:e.qs.filter(q=>q.subject==='ems').length,unique:new Set(e.qs.map(q=>q.id)).size}});
  assert(all200.mode==='training'&&all200.total===200&&all200.fire===77&&all200.ems===123&&all200.unique===200,'full-range 200 training preserves exam-like subject ratio with unique questions');
  await p.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('exam')});await p.waitForSelector('.exam-start');

  await go(p,'resources');await cleanPage(p,'desktop resources');
  assert((await p.locator('.page').innerText()).includes('공식 자료'),'resources page is student-facing');
  await p.waitForFunction(()=>window.AITUTOR_V9.OfficialMonitor119?.summary?.().status==='ready');
  const monitorText=await p.locator('.official-monitor-card').innerText();
  assert(monitorText.includes('공식 공고 자동감시')&&monitorText.includes('새 공고·변경 1건'),'resources page shows a new official 2027 notice from the in-app monitor');
  assert(monitorText.includes('국가공무원 채용시스템의 소방청 채용·시험 정보와 중앙소방학교 공식 공고·교재만 확인')&&monitorText.includes('WAF를 우회하지 않으며'),'official monitor UI states its V2 official-source-only and no-WAF-bypass policy');
  assert(monitorText.includes('앱을 열거나 다시 활성화하면 새 공고를 표시'),'monitor UI accurately explains foreground/reactivation notification behavior');
  assert(await p.locator('.official-monitor-item.new').count()===1,'new official notice is highlighted exactly once');
  const resourceTruthText=await p.locator('.page').innerText();
  assert(resourceTruthText.includes('목표 2027년')&&resourceTruthText.includes('2026 공식 기준'),'resources page separates 2027 target exam from the current 2026 official content baseline');
  assert(!resourceTruthText.includes('공식 변경사항'),'resources page does not announce an official change when the meaningful-change list is empty');
  assert(!(await p.locator('.page').innerText()).includes('Gate'),'resources page hides release/content gates');
  assert(await p.locator('[data-resource-doc]').count()===10,'resources page exposes all ten official textbooks as in-app PDF actions');
  assert(await p.locator('.resources-119 a[target="_blank"]:not(.official-monitor-item)').count()===0,'normal textbook study flow stays in-app while official-monitor notices may open their official source');
  assert(await p.locator('.official-monitor-item[target="_blank"]').count()===1,'official monitor links directly to the allowlisted official source');
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
  assert(await m.locator('.book-jumpbar button').count()===5,'mobile study has five true content tabs');
  assert((await m.locator('.book-jumpbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문 AI','mobile tabs are 핵심/상세/문제/원문/AI');
  await m.locator('.book-jumpbar [data-study-tab="ai"]').click();
  const mobileAiInput=m.locator('.study-body-mobile [data-tutor-input]');
  await mobileAiInput.fill('플래시오버에 대해 알려줘');
  await m.locator('.study-body-mobile [data-tutor-send]').click();
  await m.waitForFunction(()=>{const chat=window.AITUTOR_V9.Store.state.chat||[],last=chat[chat.length-1];return last?.role==='assistant'&&/플래시오버/.test(last.text||'')},{timeout:30000});
  const mobileAiTruth=await m.evaluate(()=>{const V=window.AITUTOR_V9,chat=V.Store.state.chat||[],last=chat[chat.length-1],target=V.curriculum.byId[last?.targetConceptId||''];return{text:last?.text||'',targetId:last?.targetConceptId||'',targetTitle:target?.title||'',current:V.Store.state.conceptId}});
  assert(/플래시오버/.test(mobileAiTruth.text)&&/플래시오버/.test(mobileAiTruth.targetTitle)&&mobileAiTruth.targetId!==mobileAiTruth.current,'mobile AI tab uses the visible question and answers a flashover-specific concept instead of the open concept');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="quiz"]').click();
  await m.waitForSelector('.book-section .question-card');
  assert(await m.locator('.book-section .question-card').first().locator('.tag').count()===0,'practice question hides difficulty/evidence badges before the student answers');
  assert(await m.locator('.book-section .question-card').count()===1,'concept practice shows exactly one question at a time instead of an infinite scroll list');
  assert(await m.locator('.book-section .study-quiz-pager').count()===1,'concept practice exposes previous/current/next navigation');
  const firstPracticeQuestion=(await m.locator('.book-section .question-card h2').innerText()).trim();
  const quizTotal=await m.locator('.book-section .study-quiz-progress b').innerText();
  assert(/^1\s*\/\s*\d+/.test(quizTotal),'concept practice starts at question 1 with an explicit total');
  await m.locator('.book-section .question-card').first().locator('.choice').first().click();
  assert(await m.locator('.book-section .question-card').first().locator('.question-result-meta .tag').count()===1,'practice question shows only compact difficulty feedback after answering');
  const nextPractice=m.locator('.study-body-mobile [data-study-quiz-next]:not([disabled])');
  if(await nextPractice.count()){
    await nextPractice.click();
    const secondPracticeQuestion=(await m.locator('.book-section .question-card h2').innerText()).trim();
    assert(secondPracticeQuestion!==firstPracticeQuestion,'concept practice next button advances to a different question');
  }
  await m.locator('.book-jumpbar [data-study-tab="core"]').click();
  await m.waitForSelector('.book-section .study-core-essentials');
  assert(await m.locator('.book-section .study-quick').count()===1,'core keeps one 30-second summary only');
  assert(await m.locator('.book-section .study-core-essentials li').count()>=1&&await m.locator('.book-section .study-core-essentials li').count()<=5,'core limits exam essentials to five concise points');
  assert(await m.locator('.book-section .study-must,.book-section .study-schema,.book-section .detail-section').count()===0,'core excludes detailed/exam-full duplicate sections');
  const starBefore=await m.evaluate(()=>window.AITUTOR_V9.PassNote.passNotes().length);
  await m.locator('.book-section .study-star-btn').first().click();
  const starAfter=await m.evaluate(()=>window.AITUTOR_V9.PassNote.passNotes().length);
  assert(starAfter===starBefore+1,'core star saves the exact concise point into pass notes');
  assert(await m.locator('.book-section .study-star-btn.on').count()>=1,'saved core point visibly keeps its filled star state');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C01'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C01');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .hazmat-class-grid');
  assert(await m.locator('.book-section .hazmat-class-card').count()===6,'hazardous-material full six-class reference lives in detail instead of core');
  assert((await m.locator('.book-section .hazmat-class-grid').innerText()).includes('제6류'),'hazardous-material detail visibly reaches class 6');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .detail-view');
  const detailText=await m.locator('.book-section').innerText();
  assert(!detailText.includes('개념 구조와 읽는 순서')&&!detailText.includes('개념 이해'),'mobile detail simplifies meta headings to 개념');
  assert(await m.locator('.book-section .detail-num').count()===0,'mobile detail has no detached numeric badges');
  assert(await m.locator('.book-section .detail-view>.lead').count()===0,'detail tab does not repeat the core summary above structured detail');
  assert(await m.locator('.book-section .detail-view .study-must,.book-section .detail-view .study-quick,.book-section .detail-view .study-core-essentials').count()===0,'detail contains detail content only, without core blocks');
  const keyLine= m.locator('.book-section .detail-view .study-key-text').first();
  if(await keyLine.count()){const keyLineStyle=await keyLine.evaluate(el=>getComputedStyle(el).textDecorationLine);assert(!keyLineStyle.includes('underline'),'detail emphasis no longer makes normal study text look like links')}
  const dup=await m.locator('.book-section .detail-section p').evaluateAll(nodes=>{const norm=s=>String(s||'').replace(/[^0-9A-Za-z가-힣]/g,'');const a=nodes.map(n=>norm(n.textContent)).filter(Boolean);return a.length!==new Set(a).size});
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .concept-visual .visual-node');
  const visualLayouts=await m.locator('.book-section .concept-visual').evaluateAll(roots=>roots.map(root=>{const nodes=[...root.querySelectorAll('.visual-node')].map(x=>x.getBoundingClientRect()),labels=[...root.querySelectorAll('.visual-node b')].map(x=>({text:x.textContent||'',scroll:x.scrollWidth,client:x.clientWidth,wordBreak:getComputedStyle(x).wordBreak}));return{nodes,labels}}));
  assert(visualLayouts.length>=1&&visualLayouts.every(v=>v.nodes.every((n,i,a)=>i===0||n.y>=a[i-1].y+a[i-1].height-1)),'all mobile principle diagrams stack vertically without card collisions');
  assert(visualLayouts.every(v=>v.labels.every(x=>x.scroll<=x.client+2)),'all mobile principle-diagram labels stay inside their cards');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
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

  const pageMap=await m.evaluate(()=>{const S=window.AITUTOR_V9.SourcePDF;return{fire1:S.pdfPage('fire1',14),fire2:S.pdfPage('fire2',352),ems:S.pdfPage('ems',72),fire1Back:S.bookPage('fire1',30),fire2Back:S.bookPage('fire2',362),emsBack:S.bookPage('ems',90),prevention1Pdf:S.pdfPage('prevention1',3),prevention2Pdf:S.pdfPage('prevention2',3),law1Pdf:S.pdfPage('law1',3),law2Pdf:S.pdfPage('law2',332),law3Pdf:S.pdfPage('law3',3),law4Pdf:S.pdfPage('law4',281),law5Pdf:S.pdfPage('law5',499),prevention1Book:S.bookPage('prevention1',17),law2Book:S.bookPage('law2',344)}});
  assert(pageMap.fire1===30&&pageMap.fire2===362&&pageMap.ems===90&&pageMap.fire1Back===14&&pageMap.fire2Back===352&&pageMap.emsBack===72,'official textbook printed pages map to actual PDF pages for fire1/fire2/EMS');
  assert(pageMap.prevention1Pdf===17&&pageMap.prevention2Pdf===15&&pageMap.law1Pdf===7&&pageMap.law2Pdf===344&&pageMap.law3Pdf===11&&pageMap.law4Pdf===287&&pageMap.law5Pdf===513&&pageMap.prevention1Book===3&&pageMap.law2Book===332,'uploaded 2026 prevention/law textbooks use verified printed-page offsets for all seven new books');

  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  await m.waitForSelector('.study-body-mobile .source-only [data-source-concept]');
  assert(await m.locator('.study-body-mobile [data-source-download]').count()===1,'source tab exposes an explicit PDF download action');
  assert(await m.evaluate(()=>typeof window.AITUTOR_V9.SourcePDF.download==='function'),'official PDF subsystem exposes direct download from cache/mirror');
  await m.locator('.study-body-mobile .source-only [data-source-concept]').click();
  await m.waitForSelector('#pdfEvidence');
  assert(Number(await m.locator('#pdfEvidence').getAttribute('data-page'))===30,'F03-C03 opens at mapped PDF page 30 for textbook page 14');
  await m.waitForSelector('#pdfEvidence canvas',{timeout:60000});
  assert(await m.locator('#pdfEvidence canvas').count()===1,'official evidence opens a PDF.js canvas from the source tab');
  const pdfVisual=await m.locator('#pdfEvidence').evaluate(root=>{const canvas=root.querySelector('canvas'),box=canvas?.getBoundingClientRect(),lines=[...root.querySelectorAll('.pdf-evidence-line')];return{pixelWidth:canvas?.width||0,cssWidth:box?.width||0,evidence:lines.length,lineHeights:lines.map(x=>x.getBoundingClientRect().height),lineStyles:lines.map(x=>({bg:getComputedStyle(x).backgroundColor,shadow:getComputedStyle(x).boxShadow})),legacy:[...root.querySelectorAll('.pdf-highlight-box')].filter(x=>getComputedStyle(x).display!=='none').length,label:root.querySelector('[data-pdf-page-label]')?.textContent||''}});
  assert(pdfVisual.pixelWidth>=pdfVisual.cssWidth*1.8,'mobile PDF canvas renders at high device-pixel density for crisp text');
  assert(pdfVisual.lineHeights.every(h=>h<=3),'PDF evidence uses thin baseline underlines instead of text-covering highlight boxes');
  assert(pdfVisual.lineStyles.every(x=>x.shadow==='none'),'PDF evidence underlines use no obscuring inset shadow');
  assert(pdfVisual.legacy===0&&!/근거\s+\d+개/.test(pdfVisual.label),'legacy keyword boxes/count are hidden from the student');
  const cache=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,a=await V.SourcePDF.openPdf(key),b=await V.SourcePDF.openPdf(key);return{same:a.pdf===b.pdf,origin:a.origin}});
  const local=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc;return await V.SourcePDF.availability(key)});
  assert(cache.same&&(/local-cache/.test(cache.origin)||cache.origin==='official-static-range')&&(local.local||local.mirror),'official PDF uses local cache or stable static mirror and is reused after first load');
  const closeBox=await m.locator('#pdfEvidence [data-pdf-close]').boundingBox();
  assert(closeBox&&closeBox.height<60,'PDF close button stays compact instead of stretching with the header');
  await m.locator('[data-pdf-close]').click();

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  await m.locator('.study-body-mobile .source-only [data-source-concept]').click();
  await m.waitForSelector('#pdfEvidence canvas',{timeout:60000});
  const flashSource=await m.locator('#pdfEvidence').evaluate(root=>{const V=window.AITUTOR_V9,page=Number(root.dataset.page)||0;return{page,bookPage:V.SourcePDF.bookPage('fire1',page),verified:root.dataset.anchorVerified,label:root.querySelector('[data-pdf-page-label]')?.textContent||'',lines:[...root.querySelectorAll('.pdf-evidence-line')].map(x=>x.title||'')}}); 
  assert(flashSource.bookPage===40||(flashSource.bookPage>=23&&flashSource.bookPage<=34),'fire phenomena source stays inside the declared official fire1 phenomenon evidence ranges');
  assert(flashSource.verified==='true'&&flashSource.lines.some(x=>/플래시오버|백드래프트|롤오버|플레임오버/.test(x)),'fire phenomena PDF is accepted only when the underlined evidence contains a phenomenon-specific concept term');
  await m.locator('[data-pdf-close]').click();

  await m.locator('.mobile-nav [data-go="exam"]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='exam');
  await cleanPage(m,'mobile exam');
  const mexam=await m.locator('.page').innerText();
  assert(mexam.includes('65문항 · 65분'),'mobile exam starts with real exam format instead of validation diagnostics');
  assert(await m.locator('[data-calc-bank]').count()===1,'exam landing exposes a dedicated calculation practice action');
  await m.locator('[data-calc-bank]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='bank');
  await m.waitForSelector('.question-card');
  const calcBank=await m.evaluate(()=>{const V=window.AITUTOR_V9,A=V.App.runtime;const qs=(V.questions||[]).filter(q=>V.QuestionQuality119.isExamStyle(q)&&q.type==='계산형'),audit=V.CalculationTraining119?.audit?.();return{filter:A.bankFilter,count:qs.length,current:qs[A.bankIndex]?.type,ids:qs.map(q=>q.id),audit}}); 
  assert(calcBank.filter==='calc'&&calcBank.count>=87&&calcBank.current==='계산형','calculation practice opens only calculation-type questions with the expanded source-backed drill bank');
  assert(calcBank.ids.filter(id=>/^119-calc-/.test(id)).length===21,'calculation practice preserves the 21 reviewed legacy/source-backed calculation drills');
  assert(calcBank.ids.filter(id=>/^119-q2calc-/.test(id)).length===24,'calculation Quality 2.0 adds 24 numeric variants without past-exam credit');
  assert(calcBank.ids.filter(id=>/^119-calc3-/.test(id)).length===42,'calculation Quality 3.0 adds seven families times six staged drills');
  assert(calcBank.audit?.ready===true&&calcBank.audit?.rows?.length===7&&calcBank.audit.rows.every(x=>Object.values(x.stages).every(n=>n>=1)),'all calculation families cover understand basic unit reverse trap and exam stages');
  assert(await m.locator('[data-calc-group]').count()>=8,'calculation training exposes formula-family filters');
  assert(await m.locator('[data-calc-stage]').count()===7,'calculation training exposes all plus six explicit learning stages');
  await m.locator('[data-calc-group="oxygen"]').click();
  await m.locator('[data-calc-stage="reverse"]').click();
  const oxygenGroup=await m.evaluate(()=>({group:window.AITUTOR_V9.App.runtime.calcGroup,stage:window.AITUTOR_V9.App.runtime.calcStage,stem:document.querySelector('.question-card h2')?.textContent||''}));
  assert(oxygenGroup.group==='oxygen'&&oxygenGroup.stage==='reverse'&&/시작압력/.test(oxygenGroup.stem),'calculation filters reach the oxygen reverse-calculation stage');
  await noX(m,'mobile calculation practice');
  const calcEvidence=await m.evaluate(()=>{const V=window.AITUTOR_V9;return{
    oxygen:(V.contentPacks.authored['E09-C07']?.calculations||[]).map(x=>({formula:x.formula,tier:x.evidenceTier,note:x.note})),
    drip:(V.contentPacks.authored['E07-C03']?.calculations||[]).map(x=>({formula:x.formula,tier:x.evidenceTier,note:x.note})),
    oxygenQs:V.questions.filter(q=>/^119-calc-oxygen-/.test(q.id||'')).map(q=>q.grade),
    dripQs:V.questions.filter(q=>/^119-calc-drip-/.test(q.id||'')).map(q=>q.grade),
    staged:V.questions.filter(q=>/^119-calc3-/.test(q.id||'')).map(q=>({grade:q.grade,family:q.calcFamily,stage:q.calcStage,past:q.pastExamClaim}))
  }});
  assert(calcEvidence.oxygen.some(x=>x.tier==='reconstructed-exam-practice')&&calcEvidence.oxygen.some(x=>x.tier==='official-source-practice'&&/P - R/.test(x.formula||'')),'oxygen-cylinder lesson keeps reconstructed practice separate from the official-source calculation contract');
  assert(calcEvidence.drip.some(x=>x.tier==='standard-education-practice')&&calcEvidence.drip.some(x=>x.tier==='regulated-device-source-practice'&&/gtt\/min/.test(x.formula||'')),'IV-drip lesson keeps legacy education practice separate from regulated-device source calculation');
  assert(calcEvidence.oxygenQs.length===4&&calcEvidence.dripQs.length===4&&[...calcEvidence.oxygenQs,...calcEvidence.dripQs].every(x=>x==='P'),'legacy and newly source-backed oxygen/drip calculation drills all remain P-grade and cannot enter verified real-mock credit');
  assert(calcEvidence.staged.length===42&&calcEvidence.staged.every(x=>x.grade==='P'&&x.past===false),'all staged calculation drills remain P-grade and outside real-mock credit');
  await go(m,'exam');await m.waitForSelector('.exam-start');
  const realStart=m.locator('[data-exam-start="real"]');
  assert(await realStart.count()===1,'real mock start is enabled only after verified fire+EMS scope coverage closes');
  await realStart.click();await m.waitForSelector('.question-card');
  assert(await m.locator('.page-exam.exam-active>.top').isHidden(),'active mobile exam hides the redundant global header');
  assert(await m.locator('.page-exam.exam-active .mobile-nav').isHidden(),'active mobile exam hides global bottom navigation');
  const examLayout=await m.locator('.exam-run-workspace').evaluate(root=>{const footer=root.querySelector('.exam-footer'),status=root.querySelector('.exam-answer-count'),buttons=[...root.querySelectorAll('.exam-footer .btn')],choices=[...root.querySelectorAll('.choice')];const sr=status?.getBoundingClientRect(),br=buttons.map(x=>x.getBoundingClientRect());return{status:sr&&{l:sr.left,r:sr.right,sw:status.scrollWidth,cw:status.clientWidth,sh:status.scrollHeight,ch:status.clientHeight},buttons:br.map(x=>({l:x.left,r:x.right,t:x.top,b:x.bottom})),choiceOverflow:choices.some(x=>x.scrollWidth>x.clientWidth+2||x.getBoundingClientRect().right>innerWidth+1||x.getBoundingClientRect().left<-1)}}); 
  assert(examLayout.status&&examLayout.status.sw<=examLayout.status.cw+2&&examLayout.status.sh<=examLayout.status.ch+2,'active exam answer counter text is not clipped or compressed');
  assert(examLayout.buttons.length===2&&examLayout.buttons[0].r<=examLayout.status.l+1&&examLayout.status.r<=examLayout.buttons[1].l+1,'active exam footer columns never overlap');
  assert(!examLayout.choiceOverflow,'active exam choice text stays inside the mobile viewport');
  const realMock=await m.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam,fire=e.qs.filter(q=>q.subject==='fire'),ems=e.qs.filter(q=>q.subject==='ems');return{mode:e.mode,total:e.qs.length,fire:fire.length,ems:ems.length,verified:e.qs.every(q=>q.grade==='A'||q.grade==='B'),unique:new Set(e.qs.map(q=>q.id)).size}});
  assert(realMock.mode==='real'&&realMock.total===65&&realMock.fire===25&&realMock.ems===40&&realMock.verified&&realMock.unique===65,'real mock builds 25 verified fire + 40 verified EMS questions with no duplicates');
  assert(await m.locator('.mobile-nav').isHidden(),'active exam hides global mobile navigation to prevent accidental exit');
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
  assert(reportText.includes('문제 유형 분석')&&reportText.includes('공식 시험의 출제비율을 의미하지 않습니다.'),'exam analysis exposes normalized learning-skill performance without claiming an official exam weight');
  assert(await m.locator('[data-skill-train]').count()>=1,'exam analysis exposes one-tap remediation for observed learning-skill families');
  const reportIdBeforeSkill=await m.evaluate(()=>window.AITUTOR_V9.App.runtime.examReportId);
  const skillKey=await m.locator('[data-skill-train]').first().getAttribute('data-skill-train');
  await m.locator('[data-skill-train]').first().click();
  await m.waitForSelector('.exam-run-workspace');
  const skillRun=await m.evaluate(key=>{const V=window.AITUTOR_V9,e=V.App.runtime.exam;return{mode:e?.mode,key:e?.trainingKey,total:e?.qs?.length||0,allFamily:e?.qs?.every(q=>V.QuestionType119.classify(q).key===key),title:e?.title||''}},skillKey);
  assert(skillRun.mode==='training'&&skillRun.key==='skill:'+skillKey&&skillRun.total>0&&skillRun.allFamily,'skill-family remediation starts a focused training run containing only the selected family');
  await m.evaluate(reportId=>{const V=window.AITUTOR_V9;V.App.runtime.exam=null;V.App.runtime.examReportId=reportId;V.Store.state.page='stats';V.Store.save();V.App.render()},reportIdBeforeSkill);
  await m.waitForSelector('.exam-report');
  assert(await m.locator('.exam-report [data-concept]').count()>=1&&await m.locator('.exam-report [data-source-concept]').count()>=1,'exam analysis links wrong questions to concept review and official evidence');
  await noX(m,'mobile exam analysis');
  await m.locator('[data-report-close]').click();
  assert(await m.locator('[data-exam-report]').count()>=1,'recent exam history keeps an analysis action for locally detailed results');

  await go(m,'notes');await m.locator('#personalFile').waitFor({state:'attached'});
  assert((await m.locator('.top h1').innerText()).includes('합격노트'),'notes area is promoted to pass-note workspace');
  assert(await m.locator('[data-pass-export]').count()===4,'pass-note workspace exposes fire, EMS, personal and rapid-review PDF exports');
  assert(await m.locator('[data-note-filter]').count()===7,'pass-note workspace exposes subject/source filters');
  assert(await m.locator('#noteSearch').count()===1,'pass-note workspace exposes note search');
  const sourceNoteId=await m.evaluate(()=>window.AITUTOR_V9.Store.state.notes.find(n=>n.sourceType==='pass-star')?.id||'');
  if(sourceNoteId){
    const beforeOfficial=await m.evaluate(id=>{const n=window.AITUTOR_V9.Store.state.notes.find(x=>x.id===id),marker='\n\n[내 메모]\n',i=String(n?.body||'').indexOf(marker);return i>=0?String(n.body).slice(0,i):String(n?.body||'')},sourceNoteId);
    await m.locator(`[data-note-edit="${sourceNoteId}"]`).click();
    assert(await m.locator('.note-official-lock').count()===1&&await m.locator('#noteEditMemo').count()===1&&await m.locator('#noteEditBody').count()===0,'source-backed pass note locks official text and exposes only a personal memo editor');
    await m.locator('#noteEditMemo').fill('E2E 내 암기 메모');
    await m.locator(`[data-note-save="${sourceNoteId}"]`).click();
    const after=await m.evaluate(id=>window.AITUTOR_V9.Store.state.notes.find(x=>x.id===id)?.body||'',sourceNoteId);
    assert(after.startsWith(beforeOfficial)&&after.includes('[내 메모]')&&after.includes('E2E 내 암기 메모'),'editing a source-backed note preserves official text and appends personal memo separately');
  }
  if(await m.locator('[data-note-filter="star"]').count()){
    await m.locator('[data-note-filter="star"]').click();
    assert(true,'pass-note star filter can be selected');
    await m.locator('[data-note-filter="all"]').click();
  }
  const fileInputStable=await m.evaluate(async()=>{
    const first=document.querySelector('#personalFile');
    for(let i=0;i<80&&window.AITUTOR_V9.App.runtime.docsLoading;i++)await new Promise(r=>setTimeout(r,25));
    return !!first&&first===document.querySelector('#personalFile')&&!window.AITUTOR_V9.App.runtime.docsLoading;
  });
  assert(fileInputStable,'async personal-doc hydration preserves the file input DOM node');
  await cleanPage(m,'mobile notes');
  const notesText=await m.locator('.page').innerText();
  assert(notesText.includes('PDF / 사진')&&notesText.includes('내 자료'),'notes page prioritizes study actions');
  assert(!notesText.includes('DRM')&&!notesText.includes('브라우저에서 텍스트/OCR 처리'),'notes page removes technical/copyright implementation prose');
  await m.locator('#personalFile').setInputFiles({name:'private-sample.pdf',mimeType:'application/pdf',buffer:fixture});
  try{
    await m.waitForFunction(()=>/분석 완료|분석 실패/.test(document.querySelector('[data-upload-status]')?.textContent||''),null,{timeout:60000});
  }catch(err){
    const diag=await m.evaluate(()=>({
      uploadStatus:document.querySelector('[data-upload-status]')?.textContent||'',
      docs:(window.AITUTOR_V9?.App?.runtime?.docs||[]).map(x=>({title:x.title,pageCount:x.pageCount,extractedChars:x.extractedChars})),
      docsLoading:!!window.AITUTOR_V9?.App?.runtime?.docsLoading
    }));
    throw new Error('PERSONAL_PDF_UI_TIMEOUT '+JSON.stringify(diag)+' BROWSER_ERRORS '+merr.join(' | '),{cause:err});
  }
  const uploadStatus=(await m.locator('[data-upload-status]').innerText()).trim();
  assert(uploadStatus.includes('분석 완료'),'personal PDF reports visible analysis completion; status='+uploadStatus+'; errors='+merr.join(' | '));
  await m.waitForSelector('[data-doc-open]');
  await m.locator('[data-doc-pass]').first().click();
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.notes.some(n=>n.sourceType==='pass-doc'),null,{timeout:15000});
  assert((await m.evaluate(()=>window.AITUTOR_V9.Store.state.notes.some(n=>n.sourceType==='pass-doc'))),'uploaded PDF/photo extraction can create an editable pass-note draft');
  await m.locator('[data-doc-open]').first().click();await m.waitForSelector('.doc-viewer');
  const viewer=await m.locator('.doc-viewer-text').innerText();
  assert(viewer.trim().length>20&&viewer.includes('[1쪽]'),'uploaded PDF extracted text can be opened and checked');
  await m.locator('[data-doc-viewer-close]').click();

  const ocrReference='소방 구급 산소 119 2468 500mL 30% 100mmHg';
  const pngBase64=await m.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=1800;canvas.height=520;
    const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);
    g.fillStyle='#000';g.textBaseline='middle';g.font='bold 104px "Noto Sans CJK KR","Noto Sans KR","Malgun Gothic",Arial,sans-serif';
    g.fillText('소방 구급 산소',70,155);
    g.font='bold 94px Arial,"Noto Sans KR",sans-serif';g.fillText('119 2468 500mL 30% 100mmHg',70,360);
    const blob=await new Promise((res,rej)=>canvas.toBlob(x=>x?res(x):rej(Error('PNG_CREATE_FAILED')),'image/png'));
    return await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]);fr.onerror=()=>rej(fr.error);fr.readAsDataURL(blob)});
  });
  await m.locator('#personalFile').setInputFiles({name:'ocr-benchmark.png',mimeType:'image/png',buffer:Buffer.from(pngBase64,'base64')});
  await m.waitForFunction(()=>window.AITUTOR_V9.App.runtime.docs.some(d=>d.title==='ocr-benchmark.png'),null,{timeout:180000});
  const imageRow=m.locator('.doc-row').filter({hasText:'ocr-benchmark.png'});
  await imageRow.locator('[data-doc-open]').click();await m.waitForSelector('.doc-viewer');
  const ocrText=await m.locator('.doc-viewer-text').innerText();
  const ocrMetrics=await m.evaluate(({reference,observed})=>window.AITUTOR_V9.PrivateDocs.ocrBenchmarkMetrics(reference,observed),{reference:ocrReference,observed:ocrText});
  console.log('OCR_BENCHMARK_119',JSON.stringify({reference:ocrReference,observed:ocrText,metrics:ocrMetrics}));
  assert(ocrMetrics.koreanRecall>=.67,'OCR benchmark recognizes at least two-thirds of Korean key tokens');
  assert(ocrMetrics.numericRecall===1,'OCR benchmark preserves every critical numeric token');
  assert(ocrMetrics.unitRecall>=.67,'OCR benchmark preserves at least two-thirds of critical unit tokens');
  assert(ocrMetrics.cer<=.35,'OCR benchmark normalized character error rate stays at or below 35%');
  await m.locator('[data-doc-viewer-close]').click();
  await noX(m,'mobile notes');

  await go(m,'stats');await cleanPage(m,'mobile stats');
  assert(!(await m.locator('.page').innerText()).includes('검증문제 커버'),'stats removes engineering validation metrics');
  await m.evaluate(()=>{const V=window.AITUTOR_V9,q=V.questions[0];V.Store.state.wrongs=[{id:'e2e-wrong-delete',questionId:q.id,conceptId:q.conceptId,scopeId:q.scopeId,confidence:'none',due:Date.now(),resolved:false,wrongCount:1,createdAt:Date.now()}];V.Store.save();V.App.go('wrong')});
  await m.waitForSelector('[data-wrong-delete="e2e-wrong-delete"]');
  m.once('dialog',d=>d.accept());
  await m.locator('[data-wrong-delete="e2e-wrong-delete"]').click();
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.wrongs.every(x=>x.id!=='e2e-wrong-delete'));
  assert(await m.locator('[data-wrong-delete="e2e-wrong-delete"]').count()===0,'wrong-note delete removes the selected item while preserving answer history');

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
  await m.waitForSelector('.study-body-mobile .special-combustible-reference .hazmat-table tbody tr');
  assert(await m.locator('.study-body-mobile .special-combustible-reference .hazmat-table tbody tr').count()===11,'special-combustible detail renders all eleven current-law quantity rows');
  const specialText=await m.locator('.study-body-mobile .special-combustible-reference').innerText();
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

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C05');
  assert((await m.locator('.concept-head h2').innerText()).includes('건축구조'),'fire progression lesson exposes construction type comparison');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const constructionText=await m.locator('.book-section').innerText();
  assert(constructionText.includes('목조건축물')&&constructionText.includes('내화구조 건축물')&&constructionText.includes('HVAC'),'wood vs fire-resistive construction lesson explains spread and smoke-path differences');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E11-C02'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E11-C02');
  assert((await m.locator('.concept-head h2').innerText()).includes('심전도 리듬'),'cardiac lesson exposes ECG rhythm study');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const ecgText=await m.locator('.book-section').innerText();
  assert(ecgText.includes('좁은 QRS')&&ecgText.includes('넓은 QRS')&&ecgText.includes('2도')&&ecgText.includes('3도 방실차단'),'ECG lesson covers NFA rhythm categories and QRS-width approach');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  const cprLinks=await m.locator('.book-section .source-law-links a').evaluateAll(nodes=>nodes.map(x=>x.getAttribute('href')||''));
  assert(cprLinks.some(x=>/^https:\/\/(www\.)?kacpr\.org\//.test(x)),'ECG source tab links the official 2020 KACPR guideline');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E11-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E11-C03');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const arrestDrugText=await m.locator('.book-section').innerText();
  assert(arrestDrugText.includes('1mg')&&arrestDrugText.includes('3~5분')&&arrestDrugText.includes('300mg')&&arrestDrugText.includes('150mg'),'adult arrest lesson includes 2020-guideline epinephrine and amiodarone anchors');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E11-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E11-C05');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const rhythmDrugText=await m.locator('.book-section').innerText();
  assert(rhythmDrugText.includes('아데노신')&&rhythmDrugText.includes('0.1mg/kg')&&rhythmDrugText.includes('아트로핀')&&rhythmDrugText.includes('0.02mg/kg'),'rhythm lesson includes 2020-guideline adenosine and atropine anchors');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E21-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E21-C04');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const palsText=await m.locator('.book-section').innerText();
  assert(palsText.includes('0.01mg/kg')&&palsText.includes('3~5분')&&palsText.includes('0.1mg/kg')&&palsText.includes('0.2mg/kg')&&palsText.includes('0.5~1J/kg'),'pediatric ALS lesson includes official 2020 arrest brady/tachy algorithm anchors');
  const palsBank=await m.evaluate(()=>{const V=window.AITUTOR_V9,qs=V.questions.filter(q=>/^119-pals-adv-/.test(q.id||''));return{n:qs.length,p:qs.every(q=>q.grade==='P'),source:qs.every(q=>/2020년 한국심폐소생술 가이드라인/.test(q.source||''))}});
  assert(palsBank.n===7&&palsBank.p&&palsBank.source,'advanced pediatric ALS practice stays P-grade and is bound to the official 2020 guideline');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  const palsLinks=await m.locator('.book-section .source-law-links a').evaluateAll(nodes=>nodes.map(x=>x.getAttribute('href')||''));
  assert(palsLinks.some(x=>/^https:\/\/(www\.)?kacpr\.org\//.test(x)),'pediatric ALS source tab exposes the official KACPR guideline');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E03-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E03-C04');
  assert((await m.locator('.concept-head h2').innerText()).includes('패혈증'),'infection curriculum surfaces sepsis caution without inventing a full treatment algorithm');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const infectionText=await m.locator('.book-section').innerText();
  assert(infectionText.includes('손위생')&&infectionText.includes('PPE')&&infectionText.includes('패혈증')&&infectionText.includes('전신상태'),'infection lesson connects PPE, exposure control and conservative sepsis warning assessment');

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
  assert(lawHrefs.every(x=>/^https:\/\/(?:www\.)?law\.go\.kr\//.test(x)),'119-law source links stay on the official National Law Information Center domain');
  await noX(m,'mobile 119-law source');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E05-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E05-C04');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .detail-view');
  const triageText=await m.locator('.page-study').innerText();
  assert(triageText.includes('기록지·중증도 분류')&&triageText.includes('START')&&/호흡\s*·\s*맥박\s*·\s*의식/.test(triageText),'START triage remains visible in detailed learner content without relying on the removed duplicate must block');

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
  assert(!menuLabels.includes('AI 질문'),'more menu removes the duplicate standalone AI route because AI now lives inside the study tabs');
  const menuBoxes=await m.locator('.menu-modal .menu-list button').evaluateAll(nodes=>nodes.slice(0,2).map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width}}));
  assert(menuBoxes.length===2&&Math.abs(menuBoxes[0].y-menuBoxes[1].y)<3&&menuBoxes[0].x!==menuBoxes[1].x,'more menu uses compact two-column layout');
  await m.locator('[data-close-more]').click();

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  for(const tab of ['core','detail','quiz','source','ai']){
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
    assert(await t.locator('.tabbar button').count()===5||await t.locator('.book-jumpbar button').count()===5,'tablet 768 keeps five learning tabs');
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
    assert(await page.locator('.book-jumpbar button').count()===5,`mobile ${width} keeps five study tabs`);
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
