import { chromium } from 'playwright';
import fs from 'node:fs';

const base='http://127.0.0.1:4173/v9/index.html';
const fixture=fs.readFileSync(new URL('./fixtures/private-sample.pdf',import.meta.url));
const forbidden=['fail-closed','page-verified','Release Gate','검증문제·범위 검증 진행 중','DRM 우회','서버 원본 업로드','RLS','Supabase','공식 PDF 원문 컴파일러','Concept ID','학습팩 초안 일괄 생성','빈 PDF 버튼','근거 자동교정'];
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r))}
function collectErrors(page){const out=[];page.on('pageerror',e=>out.push('pageerror:'+e.message));page.on('console',m=>{const u=m.location()?.url||'',x=m.text()+(u?' @ '+u:'');if(m.type()==='error'&&!/favicon|404.*official-pdf|404.*official-monitor/i.test(x))out.push('console:'+x)});page.on('requestfailed',r=>{const u=r.url();if(/cdn\.jsdelivr\.net|tesseract|pdf\.worker|pdf\.min\.mjs/i.test(u))out.push('requestfailed:'+u+' '+(r.failure()?.errorText||''))});return out}
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
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C11',{keepTab:true}));
  await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C11'&&window.AITUTOR_V9.Store.state.studyTab==='detail');
  const detailSelect=p.locator('.study-body-desktop [data-detail-jump-select]');
  assert(await detailSelect.count()===0,'desktop detail removes the redundant section-selector control and reads like a continuous textbook page');
  const semanticDetail=await p.locator('.study-body-desktop .detail-view').innerText();
  assert(semanticDetail.length>220,'desktop detail keeps substantive textbook content after removing navigation clutter');
  const architectureTruth=await p.evaluate(()=>{const V=window.AITUTOR_V9,ids=['F01-C01','F01-C06','F01-C07','F03-C06','F05-C05','F07-C05','E08-C01','E24-C01'];return{total:V.curriculum.concepts.length,mapped:Object.keys(V.ConceptArchitecture119?.map||{}).length,types:Object.fromEntries(ids.map(id=>[id,V.ConceptArchitecture119?.typeOf?.(id)||'']))}});
  assert(architectureTruth.mapped===architectureTruth.total,'every fire and EMS concept has an explicit study architecture type');
  assert(architectureTruth.types['F01-C01']==='governance'&&architectureTruth.types['F01-C06']==='history'&&architectureTruth.types['F01-C07']==='organizationTheory'&&architectureTruth.types['F03-C06']==='phenomenon'&&architectureTruth.types['F05-C05']==='hazmat'&&architectureTruth.types['E08-C01']==='emsAssessment'&&architectureTruth.types['E24-C01']==='emsResuscitation','fire and EMS concepts receive domain-specific templates, including split history and organization theory');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01'));
  await p.locator('.tabbar [data-study-tab="detail"]').click();
  const orgDetail=await p.locator('.study-body-desktop').innerText();
  assert(!/발생 조건|전조 · 위험신호|발생 전 · 후/.test(orgDetail),'organization detail does not inherit fire-phenomenon headings');
  assert(await p.locator('.study-body-desktop .visual-flow.vertical-org').count()===1,'fire organization uses a vertical hierarchy instead of numbered flow cards');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E08-C01'));
  await p.locator('.tabbar [data-study-tab="detail"]').click();
  const emsDetail=await p.locator('.study-body-desktop').innerText();
  assert(!/전조 · 위험신호|발생 전 · 후/.test(emsDetail),'EMS patient-assessment detail does not inherit fire-phenomenon headings');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await p.locator('.tabbar [data-study-tab="detail"]').click();
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C08'));
  await p.locator('.tabbar [data-study-tab="ai"]').click();
  const lockedAi=p.locator('.study-body-desktop [data-tutor-input]');
  await lockedAi.fill('플래시오버에 대해 알려줘');
  await p.locator('.study-body-desktop [data-tutor-send]').click();
  await p.waitForFunction(()=>{const V=window.AITUTOR_V9,chat=V.Store.state.chat||[],last=chat[chat.length-1];return V.Store.state.conceptId==='F07-C08'&&last?.role==='assistant'&&last?.outOfScope===true});
  const lockedTruth=await p.evaluate(()=>{const V=window.AITUTOR_V9,chat=V.Store.state.chat||[],last=chat[chat.length-1];return{current:V.Store.state.conceptId,text:last?.text||'',suggested:last?.suggestedConceptId||''}});
  assert(lockedTruth.current==='F07-C08'&&/현재 학습 항목/.test(lockedTruth.text)&&lockedTruth.suggested&&lockedTruth.suggested!=='F07-C08','AI blocks a cross-concept flashover answer and keeps the current sprinkler concept');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await p.locator('.tabbar [data-study-tab="ai"]').click();
  await p.waitForSelector('.study-body-desktop .study-ai [data-tutor-input]');
  assert(await p.locator('.study-body-desktop .study-ai').count()===1&&await p.locator('.study-rail').count()===0,'AI question is a first-class visible study tab instead of a duplicate right-side panel');
  const lazyBefore=await p.evaluate(()=>({ready:window.AITUTOR_V9.Lazy119?.questionsReady===true,hasDeferred:!!window.AITUTOR_V9.questionById?.['119-vertarget-ems2-047']}));
  assert(lazyBefore.ready===false&&lazyBefore.hasDeferred===false,'home/core/detail/AI keep deferred verified question packs out of the initial runtime');
  await p.locator('.tabbar [data-study-tab="quiz"]').click();
  await p.waitForFunction(()=>window.AITUTOR_V9.Lazy119?.questionsReady===true);
  const lazyAfter=await p.evaluate(()=>({ready:window.AITUTOR_V9.Lazy119?.questionsReady===true,count:window.AITUTOR_V9.questions?.length||0,hasDeferred:!!window.AITUTOR_V9.questionById?.['119-vertarget-ems2-047'],mock:!!window.AITUTOR_V9.MockExam119}));
  assert(lazyAfter.ready&&lazyAfter.count>=3000&&lazyAfter.hasDeferred&&lazyAfter.mock,'opening the study quiz loads the full bank and mock engine on demand');
  const quality2Content=await p.evaluate(()=>{const V=window.AITUTOR_V9,flash=V.contentPacks.get('F03-C09'),foam=V.contentPacks.get('F07-C08'),baseQs=V.questions.filter(q=>/^119-q2-(foamprop|flash)-/.test(q.id||'')),gapQs=V.questions.filter(q=>/^119-q2-(haz-special|sprinkler-base)-/.test(q.id||''));return{flashText:[flash.summary,...(flash.detail||[]),...(flash.must||[])].join(' '),flashCompare:flash.compare?.length||0,flashDeep:flash.deepSections?.length||0,foamText:[foam.summary,...(foam.detail||[]),...(foam.must||[])].join(' '),foamCompare:foam.compare?.length||0,foamDeep:foam.deepSections?.length||0,foamQs:V.questions.filter(q=>q.conceptId==='F07-C08'&&/^119-q2-foamprop-/.test(q.id||'')).length,flashQs:V.questions.filter(q=>q.conceptId==='F03-C09'&&/^119-q2-flash-/.test(q.id||'')).length,baseQuality2:baseQs.length,gapQuality2:gapQs.length,allB:[...baseQs,...gapQs].every(q=>q.grade==='B'&&q.choices?.length===4&&q.choiceExplanations?.length===4)}}); 
  assert(/483~649℃/.test(quality2Content.flashText)&&/20 kW\/㎡/.test(quality2Content.flashText)&&quality2Content.flashCompare>=4&&quality2Content.flashDeep>=5,'flashover quality2 content includes official phase, radiation, temperature range, before/after and four-way comparison');
  assert(/라인 프로포셔너/.test(quality2Content.foamText)&&/펌프 프로포셔너/.test(quality2Content.foamText)&&/프레셔 프로포셔너/.test(quality2Content.foamText)&&/프레셔사이드 프로포셔너/.test(quality2Content.foamText)&&quality2Content.foamCompare>=4&&quality2Content.foamDeep>=6,'foam quality2 content covers all four proportioners with operating principles and comparison');
  assert(quality2Content.foamQs===12&&quality2Content.flashQs===10&&quality2Content.baseQuality2===22&&quality2Content.gapQuality2>=3&&quality2Content.allB,'quality2 keeps 22 base source-backed questions and adds explicit source-backed gap questions with full option explanations');

  const officialFacilityPolish=await p.evaluate(()=>{
    const V=window.AITUTOR_V9;
    const txt=id=>{const x=V.contentPacks.get(id)||{};return [x.summary,...(x.detail||[]),...(x.must||[]),...(x.traps||[]),...(x.deepSections||[]).flatMap(r=>[r.title,r.body,...(r.bullets||[])])].join(' ')};
    return{simple:txt('F07-C06'),detect:txt('F07-C11'),wet:txt('F07-C17'),dry:txt('F07-C18'),pre:txt('F07-C19'),deluge:txt('F07-C20')};
  });
  assert(/간이헤드.*폐쇄형 스프링클러헤드의 일종/.test(officialFacilityPolish.simple),'simple sprinkler content locks the official closed-head definition');
  assert(/감지기.*자동/.test(officialFacilityPolish.detect)&&/발신기.*수동/.test(officialFacilityPolish.detect)&&/중계기.*수신기/.test(officialFacilityPolish.detect)&&/수신기.*표시.*경보/.test(officialFacilityPolish.detect),'automatic fire detection content separates detector, manual station, repeater and receiver roles');
  assert(/습식유수검지장치.*화재신호.*음향경보/.test(officialFacilityPolish.wet),'wet sprinkler content preserves head-open to waterflow-signal alarm order');
  assert(/압축공기나 질소/.test(officialFacilityPolish.dry)&&/건식유수검지장치.*화재신호.*음향경보/.test(officialFacilityPolish.dry),'dry sprinkler content preserves gas-filled secondary piping and waterflow-signal alarm order');
  assert(/평상시 2차측 소화수 미체류/.test(officialFacilityPolish.pre)&&/화재감지기/.test(officialFacilityPolish.pre)&&/폐쇄형 헤드/.test(officialFacilityPolish.pre),'preaction content separates detection, valve preparation and closed-head discharge');
  assert(/평상시 2차측 소화수 미체류/.test(officialFacilityPolish.deluge)&&/개방형 헤드/.test(officialFacilityPolish.deluge)&&/동시방수/.test(officialFacilityPolish.deluge),'deluge content locks open-head simultaneous-discharge distinction');

  const globalQuality=await p.evaluate(()=>{const V=window.AITUTOR_V9,rows=V.curriculum.concepts.map(c=>({id:c.id,features:(V.contentPacks.get(c.id)?.features||[]).length,compare:(V.contentPacks.get(c.id)?.compare||[]).length,family:V.contentPacks.get(c.id)?.compareFamily?.key||'',derived:V.contentPacks.get(c.id)?.compareDerived||'',questions:(V.QuestionQuality119.forConcept(c.id)||[]).length,title:c.title})),familyIds=new Set(V.Quality2ComparisonFamilies119?.memberIds||[]);return{total:rows.length,featureReady:rows.filter(x=>x.features>=3).length,familyTotal:familyIds.size,familyReady:rows.filter(x=>familyIds.has(x.id)&&x.compare>=2&&x.family).length,arbitrary:rows.filter(x=>x.derived==='same-scope-neighbor-summary').map(x=>x.id),highYieldNot20:rows.filter(x=>/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/.test(x.title)&&x.questions<20).map(x=>x.id)}}); 
  assert(globalQuality.featureReady===globalQuality.total,'all current verified concepts expose at least three feature/key-point lines');
  assert(globalQuality.familyReady===globalQuality.familyTotal&&globalQuality.arbitrary.length===0,'all curated comparison-family concepts use meaningful semantic comparison groups with no arbitrary neighbor fallback');
  assert(globalQuality.highYieldNot20.length===0,'all high-yield concepts expose at least twenty exam-style practice questions');

  const studySchemaAudit=await p.evaluate(()=>{const V=window.AITUTOR_V9,rows=V.curriculum.concepts.map(c=>{const s=V.Quality2StudySchema119?.get?.(c.id),p=V.contentPacks.get(c.id),officialWeb=(p?.officialLinks||[]).some(x=>/^https:\/\/([a-z0-9-]+\.)*go\.kr\//i.test(String(x?.url||'')));return{s,officialWeb}}).filter(x=>x.s);return{total:V.curriculum.concepts.length,schemas:rows.length,baseReady:rows.filter(x=>x.s.quick30&&x.s.definition&&x.s.features?.length>=3&&x.s.core?.length>=3&&(x.s.sourceRanges?.length||x.officialWeb)).length,withConditions:rows.filter(x=>x.s.applicability?.conditions).length,withMechanism:rows.filter(x=>x.s.applicability?.mechanisms).length,withTiming:rows.filter(x=>x.s.applicability?.timingStages).length,withWarnings:rows.filter(x=>x.s.applicability?.warningSigns).length,withNumbers:rows.filter(x=>x.s.applicability?.numbers).length,withCompare:rows.filter(x=>x.s.applicability?.comparison).length}}); 
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
  const pcExamLayout=await p.locator('.exam-layout').evaluate(root=>{const q=root.querySelector('.exam-question-pane')?.getBoundingClientRect(),s=root.querySelector('.exam-side')?.getBoundingClientRect(),nav=root.querySelectorAll('.exam-navigator button');return{q:q&&q.width,s:s&&s.width,nav:nav.length,sideVisible:!!s&&s.width>200}});
  assert(pcExamLayout.sideVisible&&pcExamLayout.q>pcExamLayout.s*2&&pcExamLayout.nav===50,'desktop active exam uses a wide question pane plus a narrower progress navigator');
  await p.locator('.exam-navigator [data-exam-jump="4"]').click();
  assert((await p.evaluate(()=>window.AITUTOR_V9.App.runtime.exam.i))===4,'desktop exam navigator jumps directly to the chosen question');
  await p.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('exam')});await p.waitForSelector('.exam-start');
  await p.locator('[data-training-start="all200"]').click();await p.waitForSelector('.exam-run-workspace');
  const all200=await p.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{mode:e.mode,total:e.qs.length,fire:e.qs.filter(q=>q.subject==='fire').length,ems:e.qs.filter(q=>q.subject==='ems').length,unique:new Set(e.qs.map(q=>q.id)).size}});
  assert(all200.mode==='training'&&all200.total===200&&all200.fire===77&&all200.ems===123&&all200.unique===200,'full-range 200 training preserves exam-like subject ratio with unique questions');
  await p.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('exam')});await p.waitForSelector('.exam-start');

  await go(p,'stats');await cleanPage(p,'desktop stats');
  const desktopStatsLayout=await p.locator('.stats-page').evaluate(root=>{const main=root.querySelector('.home-main'),rr=root.getBoundingClientRect(),mr=main?.getBoundingClientRect();return{gridWidth:rr.width,mainWidth:mr?.width||0,columns:getComputedStyle(root).gridTemplateColumns}});
  assert(Math.abs(desktopStatsLayout.gridWidth-desktopStatsLayout.mainWidth)<2&&desktopStatsLayout.columns.trim().split(/\\s+/).length===1,'desktop stats uses one full-width content column instead of reserving an empty home sidebar');

  await go(p,'resources');await cleanPage(p,'desktop resources');
  assert((await p.locator('.page').innerText()).includes('공식 자료'),'resources page is student-facing');
  await p.waitForFunction(()=>window.AITUTOR_V9.OfficialMonitor119?.summary?.().status==='ready');
  const monitorText=await p.locator('.official-monitor-card').innerText();
  assert(monitorText.includes('공식 공고 자동감시')&&monitorText.includes('새 공고·변경 1건'),'resources page shows a new official 2027 notice from the in-app monitor');
  assert(monitorText.includes('국가공무원 채용시스템의 소방청 채용·시험 정보와 중앙소방학교 공식 공고·교재만 확인')&&monitorText.includes('공식 원문을 확인한 뒤 반영'),'official monitor UI explains the official-source-only learner workflow');
  assert(!monitorText.includes('WAF')&&!monitorText.includes('앱 인프라'),'official monitor UI hides network and infrastructure jargon from learners');
  assert(monitorText.includes('앱을 열거나 다시 활성화할 때 표시'),'monitor UI accurately explains foreground/reactivation notification behavior');
  assert(await p.locator('.official-monitor-item.new').count()===1,'new official notice is highlighted exactly once');
  const resourceTruthText=await p.locator('.page').innerText();
  assert(resourceTruthText.includes('목표 2027년')&&resourceTruthText.includes('2026 공식 기준'),'resources page separates 2027 target exam from the current 2026 official content baseline');
  assert(!resourceTruthText.includes('공식 변경사항'),'resources page does not announce an official change when the meaningful-change list is empty');
  assert(!(await p.locator('.page').innerText()).includes('Gate'),'resources page hides release/content gates');
  assert(!resourceTruthText.includes('공식 PDF 원문 컴파일러')&&!resourceTruthText.includes('Concept ID')&&!resourceTruthText.includes('학습팩 초안 일괄 생성'),'resources page keeps legacy developer compiler controls out of the learner UI');
  assert(await p.locator('[data-resource-doc]').count()===10,'resources page exposes all ten official textbooks as in-app PDF actions');
  assert(await p.locator('.resources-119 a[target="_blank"]:not(.official-monitor-item)').count()===0,'normal textbook study flow stays in-app while official-monitor notices may open their official source');
  assert(await p.locator('.official-monitor-item[target="_blank"]').count()===1,'official monitor links directly to the allowlisted official source');
  await p.locator('[data-resource-doc]').first().click();await p.waitForSelector('#resourcePdf canvas',{timeout:60000});
  assert(await p.locator('#resourcePdf canvas').count()===1,'official resource opens inside the app with the shared PDF renderer');
  assert(await p.locator('#resourcePdf [data-resource-pdf-zoom]').count()===2&&await p.locator('#resourcePdf [data-resource-pdf-fit]').count()===1,'desktop official PDF exposes zoom out/in and fit-width controls');
  assert(await p.locator('#resourcePdf [data-source-back]').isVisible()&&await p.locator('#resourcePdf .pdf-close-btn[data-resource-pdf-close]').isVisible(),'desktop official PDF exposes explicit back and close actions');
  assert(await p.locator('#resourcePdf .pdf-modal-head').evaluate(el=>getComputedStyle(el).position)==='sticky','desktop official PDF keeps the navigation header sticky');
  const desktopPdfFit=await p.locator('#resourcePdf canvas').evaluate(c=>({css:c.getBoundingClientRect().width,pixel:c.width,host:c.closest('.pdf-evidence-host')?.clientWidth||0}));
  assert(desktopPdfFit.css<=desktopPdfFit.host+2&&desktopPdfFit.pixel>=desktopPdfFit.css,'desktop official PDF opens fit-width at native-or-higher pixel density');
  await p.locator('#resourcePdf [data-resource-pdf-zoom="0.25"]').click();
  await p.waitForFunction(()=>document.querySelector('#resourcePdf [data-resource-zoom-label]')?.textContent==='125%',null,{timeout:30000});
  const desktopPdfZoom=await p.locator('#resourcePdf canvas').evaluate(c=>c.getBoundingClientRect().width);
  assert(desktopPdfZoom>desktopPdfFit.css*1.15,'desktop PDF zoom increases readable page width without degrading the source');
  await p.locator('#resourcePdf [data-resource-pdf-fit]').click();
  await p.waitForFunction(()=>document.querySelector('#resourcePdf [data-resource-zoom-label]')?.textContent==='100%',null,{timeout:30000});
  await p.locator('#resourcePdf .pdf-close-btn[data-resource-pdf-close]').click();
  await p.waitForSelector('#resourcePdf',{state:'detached'});
  await p.waitForFunction(()=>!history.state?.sourceView);

  await go(p,'settings');await cleanPage(p,'desktop settings');
  const settingsText=await p.locator('.page').innerText();
  assert(settingsText.includes('개인정보')&&settingsText.includes('공식 일정'),'settings keeps privacy information and official-only exam schedule truth');
  assert(!settingsText.includes('업로드 자료')&&!settingsText.includes('개인 자료'),'settings has no learner personal-document upload copy');
  assert(await p.locator('#profileDate').count()===0,'manual exam-date input is removed; official monitor owns the exam date');

  await p.evaluate(()=>window.AITUTOR_V9.App.go('tutor'));
  await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.studyTab==='ai');
  await cleanPage(p,'desktop legacy AI route migration');
  const tutorText=await p.locator('.study-body-desktop .study-ai').innerText();
  assert(!/F\d\d-C\d\d/.test(tutorText)&&!tutorText.includes('WebGPU'),'legacy AI route migrates into the study AI tab without internal ids or engine jargon');
  assert(await p.locator('.tutor-standalone').count()===0,'legacy standalone AI screen is no longer rendered');

  assert(derr.length===0,'desktop runtime errors = 0 '+derr.join(' | '));
  await desktop.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  const m=await mobile.newPage(),merr=collectErrors(m);
  await boot(m);
  const navLabels=(await m.locator('.mobile-nav button').allInnerTexts()).map(x=>x.trim());
  assert(JSON.stringify(navLabels)===JSON.stringify(['홈','학습','시험','오답','더보기']),'mobile primary navigation is explicit and student-facing');
  const mobileNavVisual=await m.locator('.mobile-nav').evaluate(root=>{const active=root.querySelector('button.active'),button=root.querySelector('button');return{gap:getComputedStyle(root).gap,activeBg:active?getComputedStyle(active).backgroundColor:'',radius:button?parseFloat(getComputedStyle(button).borderRadius):0}});
  assert(mobileNavVisual.activeBg!=='rgba(0, 0, 0, 0)'&&mobileNavVisual.radius>=8,'mobile primary navigation has one clear active surface instead of text-only state');
  await cleanPage(m,'mobile home');
  const todayBox=await m.locator('.today-item').first().boundingBox();
  const todayTitleBox=await m.locator('.today-item').first().locator('b').boundingBox();
  assert(todayBox&&todayTitleBox&&todayTitleBox.width>Math.min(220,todayBox.width*.55),'today learning title receives the main row width instead of a narrow legacy score column');

  await m.locator('.mobile-nav [data-go="study"]').click();await m.waitForSelector('.book-mobile');
  await cleanPage(m,'mobile study');
  assert(await m.locator('.page-study .top').isHidden(),'mobile study removes duplicate global header');
  assert(await m.locator('.page-study .concept-nav').isHidden(),'mobile study removes the duplicate concept footer above the primary app navigation');
  assert(await m.locator('.book-jumpbar button').count()===5,'mobile study has five true content tabs');
  assert((await m.locator('.book-jumpbar').innerText()).replace(/\s+/g,' ').trim()==='핵심 상세 문제 원문 AI','mobile tabs are 핵심/상세/문제/원문/AI');
  await m.locator('.book-jumpbar [data-study-tab="ai"]').click();
  await m.evaluate(()=>{try{Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true})}catch{}});
  const mobileAiInput=m.locator('.study-body-mobile [data-tutor-input]');
  const mobileCurrent=await m.evaluate(()=>window.AITUTOR_V9.Store.state.conceptId);
  await mobileAiInput.fill('이 개념 핵심만 30초 요약해줘');
  await m.locator('.study-body-mobile [data-tutor-send]').click();
  await m.waitForFunction(id=>{const V=window.AITUTOR_V9,chat=V.Store.state.chat||[],last=chat[chat.length-1];return V.Store.state.conceptId===id&&last?.role==='assistant'&&last?.conceptId===id&&!last?.outOfScope},mobileCurrent,{timeout:30000});
  const mobileAiTruth=await m.evaluate(()=>{const V=window.AITUTOR_V9,chat=V.Store.state.chat||[],last=chat[chat.length-1];return{text:last?.text||'',conceptId:last?.conceptId||'',current:V.Store.state.conceptId}});
  assert(mobileAiTruth.conceptId===mobileAiTruth.current&&mobileAiTruth.text.length>10,'mobile AI keeps the answer bound to the currently open concept');
  assert(/답변/.test(mobileAiTruth.text)&&/왜 그런가/.test(mobileAiTruth.text)&&/근거/.test(mobileAiTruth.text),'mobile AI fallback answers the question first, explains why, then attaches evidence instead of returning evidence only');
  await mobileAiInput.fill('근거만 알려줘');
  await m.locator('.study-body-mobile [data-tutor-send]').click();
  await m.waitForFunction(()=>{const c=window.AITUTOR_V9.Store.state.chat||[],x=c[c.length-1];return x?.role==='assistant'&&/근거/.test(x.text||'')&&!/왜 그런가/.test(x.text||'')},{},{timeout:30000});
  assert(true,'explicit evidence-only request preserves a compact evidence mode');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await m.locator('.book-jumpbar [data-study-tab="quiz"]').click();
  await m.waitForSelector('.book-section .question-card');
  assert(await m.locator('.book-section .question-card').first().locator('.tag').count()===0,'practice question hides difficulty/evidence badges before the student answers');
  assert(await m.locator('.book-section .question-card').count()===1,'concept practice shows exactly one question at a time instead of an infinite scroll list');
  assert(await m.locator('.book-section .study-quiz-pager').count()===1,'concept practice exposes previous/current/next navigation');
  const quizPagerPosition=await m.locator('.book-section .study-quiz-pager').evaluate(el=>getComputedStyle(el).position);
  assert(quizPagerPosition==='static','concept practice pager stays in document flow instead of creating a second sticky footer');
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
  const coreDuplicateNumeric=await m.locator('.book-section .core-view').evaluate(root=>{const norm=s=>String(s||'').replace(/[^0-9A-Za-z가-힣]/g,'');const essentials=[...root.querySelectorAll('.study-core-essentials li span')].map(x=>norm(x.textContent)).filter(Boolean),nums=[...root.querySelectorAll('.study-numbers li .study-key-text')].map(x=>norm(x.textContent)).filter(Boolean);return essentials.some(a=>nums.some(b=>a===b||(Math.min(a.length,b.length)>=18&&(a.includes(b)||b.includes(a)))))}); 
  assert(!coreDuplicateNumeric,'core keeps numeric facts in one dedicated block instead of repeating them in exam essentials');
  const starBefore=await m.evaluate(()=>window.AITUTOR_V9.PassNote.passNotes().length);
  await m.locator('.book-section .study-star-btn').first().click();
  const starAfter=await m.evaluate(()=>window.AITUTOR_V9.PassNote.passNotes().length);
  assert(starAfter===starBefore+1,'core star saves the exact concise point into pass notes');
  assert(await m.locator('.book-section .study-star-btn.on').count()>=1,'saved core point visibly keeps its filled star state');
  assert(await m.locator('.book-section [data-pass-note-open]').count()>=1,'core exposes direct navigation to the subject-split pass note');
  await m.locator('.book-section .study-star-btn.on').first().click();
  const starRemoved=await m.evaluate(()=>window.AITUTOR_V9.PassNote.passNotes().length);
  assert(starRemoved===starBefore,'pressing the filled star removes the exact point from pass notes');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C01'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C01');
  await m.waitForSelector('.book-section .core-view .hazmat-class-grid');
  assert(await m.locator('.book-section .core-view .hazmat-class-card').count()===6,'hazardous-material core keeps all six class names visible');
  const hazCore=await m.locator('.book-section .core-view .hazmat-class-grid').innerText();
  assert(hazCore.includes('제4류')&&hazCore.includes('제5류')&&hazCore.includes('제6류'),'hazardous-material core does not omit classes 4, 5 or 6');
  await m.locator('.book-section .hazmat-class-summary').first().click();
  const hazExpanded=await m.locator('.book-section .hazmat-class-card.open').innerText();
  assert(hazExpanded.includes('아염소산염류')&&hazExpanded.includes('지정')===false&&hazExpanded.includes('50 kg'),'class-1 card expands into real item names and designated quantities instead of a count-only card');
  assert(await m.locator('.book-section .hazmat-class-card.open [data-concept="F05-C02"]').count()===1,'expanded hazardous-material class links directly to its detailed concept');

  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  await m.waitForSelector('.book-section .hazmat-class-grid');
  assert(await m.locator('.book-section .hazmat-class-card').count()===6,'hazardous-material detail keeps the six-class reference');
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
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01',{keepTab:true}));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C01');
  const orgNode= m.locator('.book-section .vertical-org .org-node b').first();
  await orgNode.waitFor();
  const orgStyle=await orgNode.evaluate(el=>({writingMode:getComputedStyle(el).writingMode,wordBreak:getComputedStyle(el).wordBreak,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,text:el.textContent||''}));
  assert(orgStyle.writingMode==='horizontal-tb'&&orgStyle.width>orgStyle.height*1.4,'mobile fire-organization labels render horizontally instead of one Korean character per line');
  const compareFirst= m.locator('.book-section .compare tbody tr').first();
  await compareFirst.waitFor();
  const compareLayout=await compareFirst.evaluate(el=>{const cells=[...el.querySelectorAll('td')];return{display:getComputedStyle(el).display,cells:cells.map(td=>({display:getComputedStyle(td).display,width:td.getBoundingClientRect().width,text:td.textContent||''}))}});
  assert(compareLayout.display==='block'&&compareLayout.cells.length===2&&compareLayout.cells.every(x=>x.display==='block'&&x.width>250),'mobile comparison rows stack label and explanation at full width');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03',{keepTab:true}));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
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

  const studyScroller=await m.locator('.study-body-mobile').boundingBox(),nav=await m.locator('.mobile-nav').boundingBox();
  assert(studyScroller&&nav&&studyScroller.y+studyScroller.height<=nav.y+2,'learning scroller ends cleanly above the single bottom navigation');
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
  await m.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.renderState==='ready',{timeout:60000});
  assert(await m.locator('#pdfEvidence canvas').count()===1,'official evidence opens a PDF.js canvas from the source tab');
  assert(await m.locator('#pdfEvidence [data-source-back]').isVisible()&&await m.locator('#pdfEvidence .pdf-close-btn[data-pdf-close]').isVisible(),'mobile original view exposes explicit back and close actions');
  const mobileSourceHead=await m.locator('#pdfEvidence .pdf-modal-head').evaluate(el=>({position:getComputedStyle(el).position,top:getComputedStyle(el).top}));
  assert(mobileSourceHead.position==='sticky'&&mobileSourceHead.top==='0px','mobile original navigation stays sticky while reading long source pages');
  const pdfVisual=await m.locator('#pdfEvidence').evaluate(root=>{const canvas=root.querySelector('canvas'),box=canvas?.getBoundingClientRect(),lines=[...root.querySelectorAll('.pdf-evidence-line')];return{pixelWidth:canvas?.width||0,cssWidth:box?.width||0,evidence:lines.length,lineHeights:lines.map(x=>x.getBoundingClientRect().height),lineStyles:lines.map(x=>({bg:getComputedStyle(x).backgroundColor,shadow:getComputedStyle(x).boxShadow})),legacy:[...root.querySelectorAll('.pdf-highlight-box')].filter(x=>getComputedStyle(x).display!=='none').length,label:root.querySelector('[data-pdf-page-label]')?.textContent||''}});
  assert(pdfVisual.pixelWidth>=pdfVisual.cssWidth*1.8,'mobile PDF canvas renders at high device-pixel density for crisp text');
  assert(await m.locator('#pdfEvidence [data-pdf-zoom]').count()===2&&await m.locator('#pdfEvidence [data-pdf-fit]').count()===1,'mobile original view exposes zoom and fit-width controls');
  await m.locator('#pdfEvidence [data-pdf-zoom="0.25"]').click();
  await m.waitForFunction(()=>document.querySelector('#pdfEvidence [data-pdf-zoom-label]')?.textContent==='125%',null,{timeout:30000});
  const mobileZoomVisual=await m.locator('#pdfEvidence canvas').evaluate(c=>({css:c.getBoundingClientRect().width,pixel:c.width}));
  assert(mobileZoomVisual.css>pdfVisual.cssWidth*1.15,'mobile PDF zoom makes the printed page materially larger for reading');
  assert(mobileZoomVisual.pixel>=mobileZoomVisual.css*1.8,'zoomed mobile PDF stays high-DPI instead of becoming blurry');
  await m.locator('#pdfEvidence [data-pdf-fit]').click();
  await m.waitForFunction(()=>document.querySelector('#pdfEvidence [data-pdf-zoom-label]')?.textContent==='100%',null,{timeout:30000});
  const mobileFitWidth=await m.locator('#pdfEvidence canvas').evaluate(c=>c.getBoundingClientRect().width);
  assert(Math.abs(mobileFitWidth-pdfVisual.cssWidth)<4,'mobile fit-width returns the source page to the viewport width');
  assert(pdfVisual.lineHeights.every(h=>h<=3),'PDF evidence uses thin baseline underlines instead of text-covering highlight boxes');
  assert(pdfVisual.lineStyles.every(x=>x.shadow==='none'),'PDF evidence underlines use no obscuring inset shadow');
  assert(pdfVisual.legacy===0&&!/근거\s+\d+개/.test(pdfVisual.label),'legacy keyword boxes/count are hidden from the student');
  const cache=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,a=await V.SourcePDF.openPdf(key),b=await V.SourcePDF.openPdf(key);return{same:a.pdf===b.pdf,origin:a.origin}});
  const local=await m.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc;return await V.SourcePDF.availability(key)});
  assert(cache.same&&(/local-cache/.test(cache.origin)||cache.origin==='official-static-range')&&(local.local||local.mirror),'official PDF uses local cache or stable static mirror and is reused after first load');
  await m.locator('#pdfEvidence .modal').evaluate(el=>{el.scrollTop=el.scrollHeight});
  assert(await m.locator('#pdfEvidence [data-source-back]').isVisible()&&await m.locator('#pdfEvidence .pdf-close-btn[data-pdf-close]').isVisible(),'mobile back and close controls remain visible after scrolling the source viewer');
  const closeBox=await m.locator('#pdfEvidence .pdf-close-btn[data-pdf-close]').boundingBox();
  assert(closeBox&&closeBox.height<60,'PDF close button stays compact instead of stretching with the header');
  await m.locator('#pdfEvidence [data-source-back]').click();
  await m.waitForSelector('#pdfEvidence',{state:'detached'});
  await m.waitForFunction(()=>!history.state?.sourceView);
  assert(await m.evaluate(()=>{const s=window.AITUTOR_V9.Store.state;return s.page==='study'&&s.studyTab==='source'}),'explicit PDF back returns to the same source study tab without losing the concept');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C06'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');
  await m.locator('.book-jumpbar [data-study-tab="source"]').click();
  await m.locator('.study-body-mobile .source-only [data-source-concept]').click();
  await m.waitForSelector('#pdfEvidence canvas',{timeout:60000});
  await m.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.renderState==='ready',{timeout:60000});
  const flashSource=await m.locator('#pdfEvidence').evaluate(root=>{const V=window.AITUTOR_V9,page=Number(root.dataset.page)||0;return{page,bookPage:V.SourcePDF.bookPage('fire1',page),verified:root.dataset.anchorVerified,label:root.querySelector('[data-pdf-page-label]')?.textContent||'',lines:[...root.querySelectorAll('.pdf-evidence-line')].map(x=>x.title||'')}}); 
  assert(flashSource.bookPage===40||(flashSource.bookPage>=23&&flashSource.bookPage<=34),'fire phenomena source stays inside the declared official fire1 phenomenon evidence ranges');
  assert(flashSource.verified==='true'&&flashSource.lines.some(x=>/플래시오버|백드래프트|롤오버|플레임오버/.test(x)),'fire phenomena PDF is accepted only when the underlined evidence contains a phenomenon-specific concept term');
  await m.evaluate(()=>history.back());
  await m.waitForSelector('#pdfEvidence',{state:'detached'});
  assert(await m.evaluate(()=>{const s=window.AITUTOR_V9.Store.state;return s.page==='study'&&s.studyTab==='source'}),'mobile browser/system back closes only the source overlay and preserves the study context');

  await m.locator('.mobile-nav [data-go="exam"]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='exam');
  await cleanPage(m,'mobile exam');
  const mexam=await m.locator('.page').innerText();
  assert(mexam.includes('65문항 · 65분'),'mobile exam starts with real exam format instead of validation diagnostics');
  assert(await m.locator('[data-calc-bank]').count()===1,'exam landing exposes a dedicated calculation practice action');
  await m.locator('[data-calc-bank]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='bank');
  await m.waitForSelector('.question-card');
  const calcFilterLabel=await m.locator('.calc-filter-label').first().innerText();
  const calcPracticeNote=await m.locator('.calc-practice-note').innerText();
  const calcCopy=await m.locator('.page').innerText();
  assert(calcFilterLabel.trim()==='계산 유형'&&/계산 연습용 문제/.test(calcPracticeNote)&&/실전 모의고사에는 포함되지 않습니다/.test(calcPracticeNote),'calculation practice uses student-facing filter and practice copy');
  assert(!/P등급|실전검증|승격/.test(calcCopy),'calculation practice hides internal QA grading and promotion jargon from learners');
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
  assert(reportText.includes('문제 유형 분석')&&reportText.includes('실제 시험의 출제비율과는 다를 수 있습니다.'),'exam analysis exposes student-facing problem-type performance without claiming an official exam weight');
  assert(await m.locator('[data-skill-train]').count()>=1,'exam analysis exposes one-tap remediation for observed learning-skill families');
  const reportIdBeforeSkill=await m.evaluate(()=>window.AITUTOR_V9.App.runtime.examReportId);
  const skillKey=await m.locator('[data-skill-train]').first().getAttribute('data-skill-train');
  await m.locator('[data-skill-train]').first().click();
  await m.waitForSelector('.exam-run-workspace');
  const skillRun=await m.evaluate(key=>{const V=window.AITUTOR_V9,e=V.App.runtime.exam;return{mode:e?.mode,key:e?.trainingKey,total:e?.qs?.length||0,allFamily:e?.qs?.every(q=>V.QuestionType119.classify(q).key===key),title:e?.title||''}},skillKey);
  assert(skillRun.mode==='training'&&skillRun.key==='skill:'+skillKey&&skillRun.total>0&&skillRun.allFamily,'skill-family remediation starts a focused training run containing only the selected family');
  await m.evaluate(reportId=>{const V=window.AITUTOR_V9;V.App.runtime.exam=null;V.App.runtime.examReportId=reportId;V.Store.state.page='stats';V.Store.save();V.App.render()},reportIdBeforeSkill);
  await m.waitForSelector('.exam-report');
  assert(await m.locator('[data-weak-review]').count()>=1,'exam analysis exposes one-tap review for weak sections');
  const weakTarget=await m.locator('[data-weak-review]').first().getAttribute('data-concept');
  await m.locator('[data-weak-review]').first().click();
  await m.waitForFunction(id=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.conceptId===id,weakTarget);
  assert(await m.locator('.page-study').count()===1,'weak-section remediation jumps directly into the selected section review');
  await m.evaluate(reportId=>{const V=window.AITUTOR_V9;V.App.runtime.examReportId=reportId;V.Store.state.page='stats';V.Store.save();V.App.render()},reportIdBeforeSkill);
  await m.waitForSelector('.exam-report');
  assert(await m.locator('.exam-report [data-concept]').count()>=1&&await m.locator('.exam-report [data-source-concept]').count()>=1,'exam analysis links wrong questions to concept review and official evidence');
  await noX(m,'mobile exam analysis');
  await m.locator('[data-report-close]').click();
  assert(await m.locator('[data-exam-report]').count()>=1,'recent exam history keeps an analysis action for locally detailed results');

  await go(m,'notes');
  assert((await m.locator('.top h1').innerText()).includes('합격노트'),'notes area is promoted to pass-note workspace');
  assert(await m.locator('[data-pass-export]').count()===4,'pass-note workspace exposes fire, EMS, personal and rapid-review PDF exports');
  assert(await m.locator('[data-pass-editable]').count()===4,'pass-note workspace exposes editable document exports for all four study documents');
  assert(await m.locator('[data-note-subject]').count()===2,'pass-note workspace separates fire and EMS into dedicated subject tabs');
  const noteSubjectLabels=(await m.locator('[data-note-subject]').allInnerTexts()).join(' ');
  assert(noteSubjectLabels.includes('소방학')&&noteSubjectLabels.includes('구급'),'pass-note subject tabs are clearly labeled fire and EMS');
  assert(await m.locator('[data-note-filter]').count()===4&&await m.locator('[data-note-filter="fire"],[data-note-filter="ems"],[data-note-filter="doc"]').count()===0,'pass-note uses four type filters inside the selected subject without duplicate subject or upload-source filters');
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
  await cleanPage(m,'mobile notes');
  const notesText=await m.locator('.page').innerText();
  assert(await m.locator('#personalFile').count()===0,'pass-note workspace has no user PDF/photo upload input');
  const injectedUploadBlocked=await m.evaluate(async()=>{
    let calls=0;
    const pd=window.AITUTOR_V9.PrivateDocs,old=pd?.ingest;
    if(!pd||typeof old!=='function')return true;
    pd.ingest=async()=>{calls++;return{reviewPages:[]}};
    const input=document.createElement('input');input.id='personalFile';input.type='file';
    Object.defineProperty(input,'files',{value:[new File(['legacy'],'legacy.txt',{type:'text/plain'})]});
    document.body.appendChild(input);
    input.dispatchEvent(new Event('change',{bubbles:true}));
    await new Promise(r=>setTimeout(r,60));
    input.remove();pd.ingest=old;
    return calls===0
  });
  assert(injectedUploadBlocked,'learner app has no executable personal-file upload event path');
  assert(!notesText.includes('PDF / 사진')&&!notesText.includes('내 자료')&&!notesText.includes('업로드'),'pass-note workspace does not expose user document upload flows');
  assert(notesText.includes('직접 메모 추가')&&notesText.includes('저장된 합격노트'),'pass-note workspace stays focused on saved study notes and direct memos');
  assert(!notesText.includes('DRM')&&!notesText.includes('브라우저에서 텍스트/OCR 처리'),'notes page removes technical/copyright implementation prose');
  for(const internalCopy of ['정밀 추출','품질 %','OCR ','텍스트층','로컬 AI 보정'])assert(!notesText.includes(internalCopy),'notes page hides implementation jargon from learner-facing copy: '+internalCopy);
  for(const internalType of ['pass-star','pass-question','pass-doc','manual'])assert(!notesText.includes(internalType),'notes page hides internal note source types from learner-facing copy: '+internalType);
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
  const priorityStudyContracts=[
    ['F04-C01',['냉각','질식','제거','연쇄반응']],
    ['F06-C02',['현장보존','전체','근접','진압수','분석']],
    ['F06-C03',['발화부','점화원','최초착화물','환기']],
    ['E08-C01',['현장안전','환자수','추가지원','위험']],
    ['E13-C05',['조직관류','혈압','의식','보상']],
    ['E17-C04',['얼굴','팔','말','마지막','정상']],
    ['E24-C04',['30:2','2분','5주기','10초']]
  ];
  for(const [id,terms] of priorityStudyContracts){
    await m.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
    await m.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
    await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
    const priorityText=(await m.locator('.book-section').innerText()).replace(/\\s+/g,' ');
    for(const term of terms)assert(priorityText.includes(term),id+' detail keeps high-priority exam distinction: '+term);
    await noX(m,'mobile priority detail '+id);
  }

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
  assert(!arrestDrugText.includes('30초 핵심')&&!arrestDrugText.includes('시험 직전 핵심')&&!arrestDrugText.includes('★★ 숫자 · 단위 · 기준')&&!arrestDrugText.includes('⚠ 헷갈림 주의'),'detail tab excludes core-only summary blocks');

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

  const tankPhenomena=[
    ['F03-C12','보일오버',['원유','탱크','표면 화재','원유와 물','슬롭오버','프로스오버']],
    ['F03-C13','슬롭오버',['점성','물','수증기','비산','보일오버','프로스오버']],
    ['F03-C14','프로스오버',['점성','표면 아래','비등','직접적인 화재발생요인','슬롭오버']]
  ];
  for(const [id,title,terms] of tankPhenomena){
    await m.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
    await m.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
    await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
    const tankText=await m.locator('.book-section').innerText();
    assert((await m.locator('.concept-head h2').innerText()).trim()===title,'tank-fire phenomenon keeps its own lesson title: '+title);
    for(const term of terms)assert(tankText.includes(term),title+' detail keeps distinguishing clue/comparison: '+term);
  }

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C10'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C10');
  assert((await m.locator('.concept-head h2').innerText()).trim()==='플레임오버','flameover has its own curriculum lesson title');
  await m.locator('.book-jumpbar [data-study-tab="detail"]').click();
  const flameoverText=await m.locator('.book-section').innerText();
  assert(flameoverText.includes('초기화재')&&flameoverText.includes('대류')&&flameoverText.includes('벽면')&&flameoverText.includes('천장')&&flameoverText.includes('롤오버'),'flameover lesson follows the official textbook definition and comparison set');

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

  await m.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='tutor';V.Store.state.studyTab='core';V.Store.save();V.App.render()});
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.studyTab==='ai');
  assert(await m.locator('.study-body-mobile .study-ai').count()===1,'persisted legacy tutor page auto-migrates into the mobile study AI tab');

  for(const route of ['home','study','notes','bank','exam','wrong','stats','resources','settings']){
    await go(m,route);
    await m.waitForSelector('.page');
    await noX(m,'mobile route '+route);
  }
  await go(m,'notes');await m.waitForSelector('.pass-export-grid');
  const noteButtons=await m.locator('.pass-export-grid .btn').evaluateAll(nodes=>nodes.slice(0,2).map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width}}));
  assert(noteButtons.length===2&&Math.abs(noteButtons[0].y-noteButtons[1].y)<3&&noteButtons[0].x!==noteButtons[1].x,'mobile pass-note export actions use a compact two-column grid');
  await go(m,'resources');await m.waitForSelector('.resource-row');
  const resourceActions=await m.locator('.resource-row').first().locator('.resource-actions .btn').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width}}));
  assert(resourceActions.length===2&&Math.abs(resourceActions[0].y-resourceActions[1].y)<3,'mobile official-resource actions stay side by side instead of creating a tall button stack');
  await go(m,'settings');await m.waitForSelector('#profileDaily');
  const settingFields=await m.locator('#profileDaily,#profileLevel').evaluateAll(nodes=>nodes.map(n=>{const b=n.closest('label')?.getBoundingClientRect();return b?{x:b.x,y:b.y,w:b.width}:null}).filter(Boolean));
  assert(settingFields.length===2&&settingFields[1].y>settingFields[0].y+20&&Math.abs(settingFields[0].w-settingFields[1].w)<4,'mobile settings form uses full-width stacked fields');
  await go(m,'exam');await m.waitForSelector('.exam-landing');
  const examLandingCards=await m.locator('.exam-landing>.card').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBoundingClientRect();return{x:b.x,y:b.y,w:b.width}}));
  assert(examLandingCards.length>=2&&examLandingCards[1].y>examLandingCards[0].y+20,'mobile exam landing stacks real mock and training center vertically');

  const samplingTruth=await m.evaluate(()=>{
    const V=window.AITUTOR_V9,A=V.App,real=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B'),check=(subject,n,scopes)=>{
      let worst=0,missing=0,dup=0;const cap=Math.ceil(n/scopes.length)+1;
      for(let i=0;i<40;i++){
        const qs=A.sampleAcrossScopes(real.filter(q=>q.subject===subject),n,'mid',scopes),counts={};
        if(new Set(qs.map(q=>q.id)).size!==qs.length)dup++;
        for(const q of qs)counts[q.scopeId]=(counts[q.scopeId]||0)+1;
        if(scopes.some(id=>!counts[id]))missing++;
        worst=Math.max(worst,...Object.values(counts));
      }
      return{cap,worst,missing,dup}
    };
    return{fire:check('fire',25,V.curriculum.fire.map(x=>x.id)),ems:check('ems',40,V.curriculum.ems.map(x=>x.id))}
  });
  assert(samplingTruth.fire.missing===0&&samplingTruth.fire.dup===0&&samplingTruth.fire.worst<=samplingTruth.fire.cap,'25-question fire sampling covers every scope without duplicates or one-scope domination');
  assert(samplingTruth.ems.missing===0&&samplingTruth.ems.dup===0&&samplingTruth.ems.worst<=samplingTruth.ems.cap,'40-question EMS sampling covers every scope without duplicates or one-scope domination');

  assert(merr.length===0,'mobile runtime errors = 0 '+merr.join(' | '));
  await mobile.close();

  {
    const tablet=await browser.newContext({viewport:{width:768,height:1024},deviceScaleFactor:2});
    const t=await tablet.newPage(),terrs=collectErrors(t);
    await boot(t);
    await noX(t,'tablet 768 home');
    await go(t,'study');await t.waitForSelector('.workspace');
    await noX(t,'tablet 768 study');
    assert(await t.locator('.tabbar button').count()===5||await t.locator('.book-jumpbar button').count()===5,'tablet 768 keeps five learning tabs');
    await go(t,'exam');await noX(t,'tablet 768 exam');
    await t.locator('[data-exam-start="practice"]').click();await t.waitForSelector('.exam-run-workspace');
    assert(await t.locator('.exam-compact-status').isVisible()&&await t.locator('.exam-side').isHidden(),'tablet active exam uses compact horizontal progress instead of a cramped desktop sidebar');
    const tabletQuestion=await t.locator('.exam-question-card').boundingBox();
    assert(tabletQuestion&&tabletQuestion.width>500,'tablet active exam keeps a wide readable question card');
    t.once('dialog',d=>d.accept());await t.locator('[data-exam-abandon]').click();await t.waitForFunction(()=>window.AITUTOR_V9.App.runtime.exam===null);
    await go(t,'resources');await noX(t,'tablet 768 resources');
    await t.locator('[data-resource-doc]').first().click();await t.waitForSelector('#resourcePdf canvas',{timeout:60000});
    const tabletPdf=await t.locator('#resourcePdf').evaluate(root=>{const c=root.querySelector('canvas'),m=root.querySelector('.pdf-evidence-modal')?.getBoundingClientRect();return{css:c?.getBoundingClientRect().width||0,pixel:c?.width||0,modal:m?.width||0,zoom:root.querySelector('[data-resource-zoom-label]')?.textContent||''}});
    assert(tabletPdf.modal<=768&&tabletPdf.pixel>=tabletPdf.css*1.8&&tabletPdf.zoom==='100%','tablet original view fits the viewport and keeps 2x-density sharp text');
    assert(await t.locator('#resourcePdf [data-resource-pdf-zoom]').count()===2,'tablet original view keeps accessible zoom controls');
    assert(await t.locator('#resourcePdf [data-source-back]').isVisible()&&await t.locator('#resourcePdf .pdf-close-btn[data-resource-pdf-close]').isVisible(),'tablet original view keeps explicit back and close controls');
    await t.locator('#resourcePdf .pdf-close-btn[data-resource-pdf-close]').click();
    await t.waitForSelector('#resourcePdf',{state:'detached'});
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
    assert(await page.locator('.page-study .concept-nav').isHidden(),`mobile ${width} removes duplicate concept footer`);
    const studyScroller=await page.locator('.study-body-mobile').boundingBox(),nav=await page.locator('.mobile-nav').boundingBox();
    assert(studyScroller&&nav&&studyScroller.y+studyScroller.height<=nav.y+2,`mobile ${width} learning scroller ends above bottom navigation`);
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
    await offlinePage.waitForFunction(async()=>!!(await caches.match('/api/official-monitor')),null,{timeout:15000});
    await offlineCtx.setOffline(true);
    await offlinePage.reload({waitUntil:'domcontentloaded',timeout:30000});
    await offlinePage.waitForSelector('.app');
    await offlinePage.waitForFunction(()=>!!window.AITUTOR_V9?.App);
    assert((await offlinePage.locator('body').innerText()).includes('홈'),'v9 PWA shell reloads while offline');
    const unexpectedOfflineErrors=offlineErrors.filter(x=>!/ERR_INTERNET_DISCONNECTED|Failed to fetch|favicon/i.test(x));
    assert(unexpectedOfflineErrors.length===0,'offline shell has no unexpected runtime errors '+unexpectedOfflineErrors.join(' | '));
    await offlineCtx.setOffline(false);
    await offlineCtx.close();
  }

  console.log('V9_STUDENT_UX_E2E_SUCCESS');
}finally{
  await browser.close();
}
