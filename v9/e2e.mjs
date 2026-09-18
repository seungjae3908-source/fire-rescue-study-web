import { chromium } from 'playwright';
import fs from 'node:fs';

const base='http://127.0.0.1:4173/v9/index.html';
const officialPdfFixture=fs.readFileSync(new URL('./fixtures/private-sample.pdf',import.meta.url));
function assert(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,`${label}: no page horizontal overflow (${JSON.stringify(r)})`)}
async function errors(page){const arr=[];page.on('pageerror',e=>arr.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))arr.push('console:'+m.text())});return arr}

const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});const p=await desktop.newPage();const err=await errors(p);
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForSelector('.app');await noX(p,'desktop home');
  assert((await p.locator('.brand').textContent()).includes('119'),'desktop brand is unified as 119');
  assert(!(await p.locator('body').textContent()).includes('AI과외'),'legacy AI과외 brand is absent from desktop UI');
  await p.locator('[data-go="study"]').first().click();await p.waitForSelector('.workspace');await noX(p,'desktop study');
  assert(await p.locator('.study-rail').isVisible(),'desktop study exposes 119 assistant rail');
  assert((await p.locator('.study-rail').textContent()).includes('119 학습도우미'),'desktop rail is branded as 119');
  assert(await p.locator('.study-mainpane').isVisible(),'desktop electronic textbook pane is visible');
  assert(await p.locator('.actionbar').isVisible(),'desktop fixed study action bar visible');
  const action=await p.locator('.actionbar').boundingBox(),vp=p.viewportSize();assert(action&&action.y+action.height<=vp.height+1,'desktop action bar inside viewport');
  assert(await p.locator('.study-body-desktop').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'desktop study body has no horizontal overflow');
  await p.locator('[data-outline]').click();await p.waitForSelector('.outline.open');assert(await p.locator('.outline.open').isVisible(),'desktop TOC drawer opens');
  assert(await p.locator('.syllabus-group').count()===6,'fire TOC is grouped into six 119 master syllabus parts');
  assert((await p.locator('.syllabus-group').first().textContent()).includes('PART 1'),'TOC exposes exam-oriented PART hierarchy');
  await p.locator('[data-concept="F03-C06"]').click();await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C06');assert((await p.locator('.concept-head h2').textContent()).includes('플래시오버'),'TOC selects concept without permanent extra columns');
  await p.locator('.tabbar [data-study-tab="compare"]').click();assert((await p.locator('.study-body-desktop').textContent()).includes('백드래프트'),'comparison tab renders rich concept content');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C05'));await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C05');assert((await p.locator('.concept-head h2').textContent()).includes('스프링클러'),'complete fire curriculum exposes sprinkler study concept');
  await p.locator('.tabbar [data-study-tab="detail"]').click();await p.waitForSelector('.detail-view');assert((await p.locator('.detail-view').textContent()).includes('상세내용'),'rich detail tab renders for sprinkler');
  assert((await p.locator('.detail-section').count())>=1,'detail tab has structured learning sections');
  await p.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C12'));
  await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C12');
  assert((await p.locator('.concept-head h2').textContent()).includes('보일오버'),'granular fire syllabus exposes boilover concept');
  await p.locator('.tabbar [data-study-tab="detail"]').click();
  assert(await p.locator('.concept-visual').count()>=1,'boilover detail renders learning diagram');
  const coverage=await p.evaluate(()=>window.AITUTOR_V9.contentPacks.coverage());assert(coverage.total===176&&coverage.verified===162&&coverage.pending===14,'browser runtime preserves 162 page-verified + 14 page-anchor-pending truth');
  const sprinklerAnchors=await p.evaluate(()=>{
    const V=window.AITUTOR_V9,spec={'F07-C05':284,'F07-C16':288,'F07-C17':288,'F07-C18':284,'F07-C19':284,'F07-C20':302,'F07-C21':287};
    return Object.entries(spec).map(([id,page])=>({id,page,from:Number(V.curriculum.byId[id]?.sourceRanges?.[0]?.from)||0,status:V.contentPacks.authored[id]?.status,precision:V.contentPacks.authored[id]?.sourcePrecision}));
  });
  assert(sprinklerAnchors.every(x=>x.from===x.page&&x.status==='verified'&&x.precision==='exact-pdf-page-anchor'),'browser runtime exposes seven verified sprinkler page anchors');
  const firePhenomenaAnchors=await p.evaluate(()=>{
    const V=window.AITUTOR_V9,spec={'F03-C09':37,'F03-C10':49,'F03-C11':453,'F03-C12':319,'F03-C13':320,'F03-C14':319,'F03-C15':326,'F03-C16':453};
    return Object.entries(spec).map(([id,page])=>({id,page,from:Number(V.curriculum.byId[id]?.sourceRanges?.[0]?.from)||0,status:V.contentPacks.authored[id]?.status,precision:V.contentPacks.authored[id]?.sourcePrecision}));
  });
  assert(firePhenomenaAnchors.every(x=>x.from===x.page&&x.status==='verified'&&x.precision==='exact-pdf-page-anchor'),'browser runtime exposes eight verified fire-phenomena page anchors');
  const hazmatAnchors=await p.evaluate(()=>{
    const V=window.AITUTOR_V9,spec={'F05-C02':385,'F05-C03':407,'F05-C04':428,'F05-C05':449,'F05-C06':496,'F05-C07':523};
    const simple=Object.entries(spec).map(([id,page])=>({id,page,doc:V.curriculum.byId[id]?.sourceRanges?.[0]?.doc,from:Number(V.curriculum.byId[id]?.sourceRanges?.[0]?.from)||0,status:V.contentPacks.authored[id]?.status,precision:V.contentPacks.authored[id]?.sourcePrecision}));
    const c01=V.curriculum.byId['F05-C01']?.sourceRanges||[],c08=V.curriculum.byId['F05-C08']?.sourceRanges||[];
    return{simple,c01,c08,s01:V.contentPacks.authored['F05-C01']?.status,p01:V.contentPacks.authored['F05-C01']?.sourcePrecision,s08:V.contentPacks.authored['F05-C08']?.status,p08:V.contentPacks.authored['F05-C08']?.sourcePrecision};
  });
  assert(hazmatAnchors.simple.every(x=>x.doc==='prevention2'&&x.from===x.page&&x.status==='verified'&&x.precision==='exact-pdf-page-anchor'),'browser runtime exposes six exact hazardous-material class page anchors');
  assert(hazmatAnchors.c01.length===2&&Number(hazmatAnchors.c01[0]?.from)===345&&Number(hazmatAnchors.c01[1]?.from)===385&&hazmatAnchors.s01==='verified'&&hazmatAnchors.p01==='exact-pdf-page-anchor','browser runtime preserves hazardous definition/classification dual-page evidence');
  assert(hazmatAnchors.c08.length===2&&hazmatAnchors.c08[0]?.doc==='fire1'&&Number(hazmatAnchors.c08[0]?.from)===319&&hazmatAnchors.c08[1]?.doc==='prevention2'&&Number(hazmatAnchors.c08[1]?.from)===536&&hazmatAnchors.s08==='verified'&&hazmatAnchors.p08==='exact-pdf-page-anchor','browser runtime preserves hazardous special-phenomenon + response dual-source evidence');
  const investigationAnchors=await p.evaluate(()=>{
    const V=window.AITUTOR_V9,spec={
      'F06-C01':[269,270],
      'F06-C02':[276,282],
      'F06-C03':[282,297],
      'F06-C04':[287,294]
    };
    return Object.entries(spec).map(([id,pages])=>({
      id,pages,rows:V.curriculum.byId[id]?.sourceRanges||[],
      status:V.contentPacks.authored[id]?.status,
      precision:V.contentPacks.authored[id]?.sourcePrecision
    }));
  });
  assert(investigationAnchors.every(x=>x.status==='verified'&&x.precision==='exact-pdf-page-anchor'&&x.rows.length===2&&x.rows.every((r,i)=>r.doc==='fire2'&&Number(r.from)===x.pages[i])),'browser runtime exposes four verified fire-investigation multi-page anchors');

  const readiness=await p.evaluate(()=>window.AITUTOR_V9.examReadiness());
  await p.locator('[data-go="exam"]').first().click();await p.waitForSelector('.page');const examText=await p.locator('.page').textContent();assert(await p.locator('[data-exam-start="practice"]').count()===1,'practice mode remains available');
  if(readiness.ready){assert(!examText.includes('실전모드 잠금'),'real mock exam unlocks only after 25+40 coverage');assert(await p.locator('[data-exam-start="real"]').count()===1,'real exam start button appears after coverage gate');await p.locator('[data-exam-start="real"]').click();await p.waitForSelector('[data-exam-answer]');const integrity=await p.evaluate(()=>{const qs=window.AITUTOR_V9.App.runtime.exam.qs;return{total:qs.length,unique:new Set(qs.map(q=>q.id)).size,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length}});assert(integrity.total===65&&integrity.unique===65&&integrity.fire===25&&integrity.ems===40,`real mock uses 65 distinct questions with 25+40 split (${JSON.stringify(integrity)})`);await p.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.render()})}else{assert(examText.includes('실전모드 잠금'),'real mock exam is visibly fail-closed');assert(await p.locator('[data-exam-start="real"]').count()===0,'real exam start button absent while coverage insufficient')}

  await p.evaluate(()=>{const V=window.AITUTOR_V9,q=V.questions.find(x=>x.conceptId==='F03-C06');V.Mastery.recordAnswer(q,(q.a+1)%4,'sure',8000);V.App.render()});await p.locator('[data-go="wrong"]').first().click();await p.waitForSelector('[data-concept="F03-C06"]');assert((await p.locator('.page').textContent()).includes('위험오답'),'confident wrong is marked dangerous');await p.locator('[data-concept="F03-C06"]').first().click();await p.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.conceptId==='F03-C06');assert(true,'wrong answer treatment returns to exact concept');

  const isolation=await p.evaluate(async()=>{const V=window.AITUTOR_V9,owner=V.Store.ownerId;const file=new File(['내 개인 노트: 테스트 전용 내용'],'isolation-note.txt',{type:'text/plain'});await V.PrivateDocs.ingest(file,{kind:'personal'});const mine=(await V.PrivateDocs.listDocuments('personal')).length;V.Store.switchOwner('qa-other-user');const other=(await V.PrivateDocs.listDocuments('personal')).length;V.Store.switchOwner(owner);return{mine,other,privateRules:V.PrivateDocs.privacyRules}});assert(isolation.mine>=1&&isolation.other===0,'private documents are isolated per owner in local-first store');assert(isolation.privateRules.crossUserSharing===false&&isolation.privateRules.serverUpload===false,'personal docs are no-share/no-auto-upload by default');

  // Dedicated /v9 service worker must take control and support an offline shell without touching v8 caches.
  const sw=await p.evaluate(async()=>{const reg=await navigator.serviceWorker.ready;return{scope:reg.scope,controller:!!navigator.serviceWorker.controller,manifest:document.querySelector('link[rel="manifest"]')?.getAttribute('href')}});assert(sw.scope.endsWith('/v9/'),'v9 service worker scope is limited to /v9/');assert(sw.manifest==='./manifest.webmanifest','v9 manifest is linked');await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('.app');assert(await p.evaluate(()=>!!navigator.serviceWorker.controller),'v9 service worker controls the page after reload');await desktop.setOffline(true);await p.reload({waitUntil:'domcontentloaded'});await p.waitForSelector('.app');assert(await p.locator('.app').isVisible(),'v9 PWA shell reloads while offline');await p.locator('[data-go="settings"]').first().click();await p.waitForSelector('.settings-page');assert(await p.locator('.settings-account').isVisible(),'desktop settings account controls are inline');assert(await p.locator('[data-profile-save]').isVisible(),'desktop profile-save visible');await noX(p,'desktop settings');await noX(p,'desktop offline PWA');await desktop.setOffline(false);
  assert(err.length===0,`desktop runtime errors = 0 (${err.join(' | ')})`);await desktop.close();

  const tablet=await browser.newContext({viewport:{width:900,height:1180},isMobile:false});const tp=await tablet.newPage(),terr=await errors(tp);await tp.goto(base,{waitUntil:'domcontentloaded'});await tp.waitForSelector('.app');
  assert((await tp.locator('.brand').textContent()).includes('119'),'tablet keeps 119 brand identity');await tp.locator('[data-go="study"]').first().click();await tp.waitForSelector('.workspace');assert(await tp.locator('.study-mainpane').isVisible(),'tablet keeps wide textbook pane');assert(await tp.locator('.study-rail').isHidden(),'tablet hides desktop assistant rail to preserve reading width');await noX(tp,'tablet study');assert(terr.length===0,`tablet runtime errors = 0 (${terr.join(' | ')})`);await tablet.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  let officialPdfRequests=0;
  await mobile.route(/\/api\/official-pdf\?/,async route=>{officialPdfRequests++;await route.fulfill({status:200,headers:{'content-type':'application/pdf','access-control-allow-origin':'*','accept-ranges':'bytes'},body:officialPdfFixture})});
  const m=await mobile.newPage();const merr=await errors(m);await m.goto(base,{waitUntil:'domcontentloaded'});await m.waitForSelector('.mobile-nav');await noX(m,'mobile home');
  const cacheStart=officialPdfRequests;
  await m.evaluate(async()=>{await window.AITUTOR_V9.SourcePDF.resolveRow('ems');await window.AITUTOR_V9.SourcePDF.resolveRow('ems')});
  assert(officialPdfRequests===cacheStart+1,'official PDF active-document cache avoids duplicate network fetches');
  assert((await m.locator('.mobile-nav').textContent()).includes('119'),'mobile bottom navigation exposes 119 tutor');

  // User-reported global menu/close regression: exercise the real taps.
  await m.locator('[data-more]').click();await m.waitForSelector('.menu-modal');assert(await m.locator('.menu-modal').isVisible(),'mobile whole-menu opens');
  await m.locator('.menu-modal [data-go="notes"]').click();await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='notes');assert(await m.locator('.menu-modal').count()===0,'whole-menu item navigates and closes the sheet');
  await m.locator('[data-more]').click();await m.waitForSelector('.menu-modal');await m.locator('.menu-modal [data-close-more]').click();await m.waitForFunction(()=>!window.AITUTOR_V9.App.runtime.more);assert(await m.locator('.menu-modal').count()===0,'whole-menu close button works');

  await m.locator('.mobile-nav [data-go="study"]').click();await m.waitForSelector('.workspace');
  assert(await m.locator('.study-rail').isHidden(),'mobile hides desktop assistant rail');
  assert(await m.locator('.page-study .top').isHidden(),'mobile study removes duplicated global header');
  assert(await m.locator('.page-study .actionbar').isHidden(),'mobile study removes duplicated bottom action bar');
  const visibleTabs=await m.locator('.page-study .tabbar button:visible').count();assert(visibleTabs===0,'mobile study removes top study tabs entirely');assert(await m.locator('.book-mobile').isVisible(),'mobile renders one-scroll electronic textbook');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C03'));await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C03');assert((await m.locator('.concept-head h2').textContent()).includes('제2류'),'mobile can enter grade-2 hazardous-material concept');
  await m.waitForSelector('.book-mobile');
  const haz=await m.evaluate(()=>({rows:document.querySelectorAll('.book-mobile .hazmat-table tbody tr').length,text:document.querySelector('.book-mobile .hazmat-reference')?.innerText||'',calc:document.querySelector('.book-mobile .calc-example')?.innerText||'',sections:document.querySelectorAll('.book-mobile .book-section').length}));assert(haz.rows===7&&haz.text.includes('황화린')&&haz.text.includes('인화성고체'),'grade-2 electronic textbook shows official item/quantity table');assert(haz.calc.includes('1.5배'),'hazardous-material calculation example renders');assert(haz.sections>=4,'mobile textbook exposes summary detail quiz and source sections');
  await noX(m,'mobile hazardous-material book');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F04-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F04-C04');
  const foamBook=await m.locator('.book-mobile').textContent();
  assert(foamBook.includes('저팽창')&&foamBook.includes('고팽창'),'foam lesson includes expansion-ratio classification');
  assert(await m.locator('.book-mobile .concept-visual').count()>=1,'foam lesson renders learning diagram');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F04-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F04-C05');
  const co2Book=await m.locator('.book-mobile').textContent();
  assert(co2Book.includes('질식')&&co2Book.includes('비전도'),'CO2 lesson includes primary mechanism and electrical property');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F04-C07'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F04-C07');
  const cleanBook=await m.locator('.book-mobile').textContent();
  assert(cleanBook.includes('IG-541')&&cleanBook.includes('52%'),'clean-agent lesson includes IG-541 composition');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F04-C08'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F04-C08');
  const powderBook=await m.locator('.book-mobile').textContent();
  assert(powderBook.includes('제1인산암모늄')&&powderBook.includes('ABC'),'powder lesson includes class-3 composition and applicability');
  const supChoice=m.locator('[data-answer^="119-sup-08a:"]').first();
  assert(await supChoice.isVisible(),'suppression exam-style question is rendered');
  await supChoice.click();
  assert(await m.locator('.choice-explanations .choice-explain').count()===4,'suppression question explains all four choices');
  await noX(m,'mobile suppression textbook');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C04'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C04');
  const class3=await m.locator('.book-mobile').textContent();
  assert(class3.includes('황린')&&class3.includes('물속 저장'),'class-3 lesson includes phosphorus exception and storage rule');
  assert(await m.locator('.book-mobile .concept-visual').count()>=1,'hazardous-material class lesson renders learning diagram');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C05');
  const class4=await m.locator('.book-mobile').textContent();
  assert(class4.includes('내알코올포')&&class4.includes('정전기'),'class-4 lesson includes water-soluble foam and static-electricity hazards');
  assert(!class4.includes('제4류 위험물 화재를 이해할 때 핵심이 되는 것은?'),'foundation drill is excluded from textbook confirmation questions');
  assert(class4.includes('제4류 인화성액체의 증기와 관련한 설명'),'exam-style class-4 question is present in textbook');
  const quality=await m.evaluate(()=>window.AITUTOR_V9.QuestionQuality119.audit());
  assert(quality.examStyle>0&&quality.duplicateTexts.length===0,'browser question-quality audit has exam-style bank with zero duplicate texts');
  const hazChoice=m.locator('[data-answer^="119-h4-3:"]').first();
  assert(await hazChoice.isVisible(),'hazardous-material high-difficulty question is rendered');
  await hazChoice.click();
  assert(await m.locator('.choice-explanations .choice-explain').count()===4,'hazardous-material question explains all four choices');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C05');
  assert((await m.locator('.concept-head h2').textContent()).includes('스프링클러'),'mobile can enter sprinkler concept');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C19'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C19');
  assert((await m.locator('.book-mobile').textContent()).includes('준비작동식'),'mobile textbook includes granular preaction sprinkler lesson');
  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C11'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C11');
  const detectionBook=await m.locator('.book-mobile').textContent();
  assert(detectionBook.includes('감지기')&&detectionBook.includes('수신기')&&detectionBook.includes('경보'),'automatic fire detection lesson explains full signal flow');
  assert(await m.locator('.book-mobile .concept-visual').count()>=1,'automatic fire detection lesson renders learning diagram');
  const detectionQ=m.locator('[data-answer^="119-fac-11b:"]').first();
  assert(await detectionQ.isVisible(),'automatic fire detection high-difficulty comparison question is rendered');
  await detectionQ.click();
  assert(await m.locator('.choice-explanations .choice-explain').count()===4,'fire detection question explains all four choices');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C03'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C03');
  const hydrantBook=await m.locator('.book-mobile').textContent();
  assert(hydrantBook.includes('수원')&&hydrantBook.includes('호스')&&hydrantBook.includes('관창'),'indoor hydrant lesson explains components and manual discharge');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F07-C15'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F07-C15');
  const activityBook=await m.locator('.book-mobile').textContent();
  assert(activityBook.includes('제연')&&activityBook.includes('연결송수관')&&activityBook.includes('무선통신보조'),'firefighting activity lesson covers smoke control, standpipe and radio support');

  await m.waitForSelector('.book-mobile');assert((await m.locator('.book-mobile').textContent()).includes('교재형 상세'),'mobile rich textbook renders');
  await m.locator('.book-source [data-source-concept]').click();await m.waitForSelector('#pdfEvidence');assert(await m.locator('#pdfEvidence').isVisible(),'official evidence opens PDF viewer in one click');
  assert(await m.locator('#sourceModal').count()===0,'one-click official evidence removes intermediate source modal');
  assert(await m.locator('#pdfEvidence [data-source-pdf-file]').count()===0,'official evidence never asks user to upload a PDF');
  await m.waitForSelector('#pdfEvidence canvas');
  assert(await m.locator('#pdfEvidence canvas').count()===1,'official evidence renders the proxied PDF through PDF.js');
  const evidenceText=await m.locator('#pdfEvidence').textContent();assert(evidenceText.includes('쪽')||evidenceText.includes('하이라이트'),'official evidence exposes PDF page/highlight status');
  await m.locator('#pdfEvidence [data-pdf-close]').click();assert(await m.locator('#pdfEvidence').count()===0,'PDF evidence close button works');

  const mobileType=await m.evaluate(()=>({lesson:parseFloat(getComputedStyle(document.querySelector('.book-section>p')).fontSize),jump:parseFloat(getComputedStyle(document.querySelector('.book-jumpbar button')).fontSize),nav:parseFloat(getComputedStyle(document.querySelector('.mobile-nav button')).fontSize)}));assert(mobileType.lesson>=16&&mobileType.jump>=11&&mobileType.nav>=12,`mobile textbook typography is readable (${JSON.stringify(mobileType)})`);await noX(m,'mobile rich detail');

  await m.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('E13-C05'));
  await m.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E13-C05');
  const emsBook=await m.locator('.book-mobile').textContent();
  assert(emsBook.includes('조직관류')&&emsBook.includes('보상'),'mobile EMS textbook deepens hypovolemic shock physiology');
  assert(await m.locator('.book-mobile .concept-visual').count()>=1,'mobile EMS shock lesson renders learning diagram');
  const emsChoice=m.locator('[data-answer^="119-e13-05:"]').first();
  assert(await emsChoice.isVisible(),'high-yield EMS exam-style question is rendered in textbook');
  await emsChoice.click();
  assert(await m.locator('.choice-explanations .choice-explain').count()===4,'EMS question shows explanations for all four choices');
  await noX(m,'mobile EMS deep lesson');

  await m.evaluate(()=>window.AITUTOR_V9.App.go('tutor'));await m.waitForSelector('.tutor-layout');assert(await m.locator('.tutor-quick button').count()===4,'119 tutor exposes four contextual quick prompts');assert((await m.locator('.tutor-layout').textContent()).includes('119 학습도우미'),'mobile tutor is branded as 119 study assistant');
  await m.evaluate(()=>window.AITUTOR_V9.App.go('exam'));await m.waitForSelector('.difficulty-picker');assert(await m.locator('[data-exam-difficulty="low"]').isVisible()&&await m.locator('[data-exam-difficulty="mid"]').isVisible()&&await m.locator('[data-exam-difficulty="high"]').isVisible(),'mock exam exposes 하/중/상 difficulty choices');await m.locator('[data-exam-difficulty="high"]').click();assert(await m.evaluate(()=>window.AITUTOR_V9.App.runtime.examDifficulty)==='high','hard mock difficulty selection is stored');await m.locator('[data-exam-start="practice"]').click();await m.waitForSelector('[data-exam-answer]');assert(await m.evaluate(()=>window.AITUTOR_V9.App.runtime.exam?.difficulty)==='high','practice exam uses selected hard difficulty profile');await m.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('settings')});await m.waitForSelector('.settings-page');
  await m.locator('.mobile-nav [data-go="settings"]').click();await m.waitForSelector('.settings-page');assert(await m.locator('.settings-page').isVisible(),'mobile settings page opens directly');assert(await m.locator('.settings-account').isVisible(),'mobile account section is inline and visible');assert(await m.locator('[data-profile-save]').isVisible(),'mobile profile-save action is directly reachable');assert(await m.locator('#importBackup').isVisible(),'mobile restore file input is directly reachable');assert(merr.length===0,`mobile runtime errors = 0 (${merr.join(' | ')})`);await mobile.close();

  const cloudMobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});let signupBody=null,resendBody=null;await cloudMobile.route('https://petlfbztqguuzkasfpug.supabase.co/auth/v1/signup',async route=>{signupBody=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({id:'00000000-0000-0000-0000-000000000001',email:'qa@example.com',user_metadata:{app_scope:'study-v9'}})})});await cloudMobile.route('https://petlfbztqguuzkasfpug.supabase.co/auth/v1/resend',async route=>{resendBody=route.request().postDataJSON();await route.fulfill({status:200,contentType:'application/json',body:'{}'})});const cm=await cloudMobile.newPage(),cmerr=await errors(cm);await cm.goto('http://127.0.0.1:4173/v9/preview.html',{waitUntil:'domcontentloaded'});await cm.waitForSelector('.mobile-nav');await cm.locator('.mobile-nav [data-go="settings"]').click();await cm.waitForSelector('.settings-page');assert(await cm.locator('.settings-account [data-signin]').isVisible(),'cloud-enabled mobile settings exposes sign-in directly');assert(await cm.locator('.settings-account [data-signup]').isVisible(),'cloud-enabled mobile settings exposes sign-up directly');assert(await cm.locator('.settings-account [data-resend-confirmation]').isVisible(),'cloud-enabled mobile settings exposes confirmation resend directly');const localAuth=await cm.evaluate(async()=>{const V=window.AITUTOR_V9,r=await V.Auth.init();return{client:!!r.client,runtime:r.client?.__runtime,policy:V.Auth.syncPolicy.clientRuntime}});assert(localAuth.client&&localAuth.runtime==='same-origin-lite'&&localAuth.policy==='same-origin-lite','cloud-enabled auth initializes without an external SDK module');await cm.locator('#authEmail').fill('qa@example.com');await cm.locator('#authPw').fill('Qa-test-1234');await cm.locator('[data-signup]').click();await cm.waitForFunction(()=>document.body.innerText.includes('회원가입 완료'));assert(signupBody?.email==='qa@example.com'&&signupBody?.data?.app_scope==='study-v9','mobile sign-up sends Study-scoped request through local auth client');await cm.locator('[data-resend-confirmation]').click();await cm.waitForFunction(()=>document.body.innerText.includes('인증메일을 다시 보냈습니다'));assert(resendBody?.type==='signup'&&resendBody?.email==='qa@example.com','confirmation resend uses the local auth client');await noX(cm,'cloud-enabled mobile settings');assert(cmerr.length===0,`cloud-enabled mobile runtime errors = 0 (${cmerr.join(' | ')})`);await cloudMobile.close();

  const migration=await browser.newContext({viewport:{width:1024,height:768}});await migration.addInitScript(()=>{if(location.protocol==='http:'){localStorage.setItem('rescue6:profile',JSON.stringify({examYear:'2031',daily:55,level:'재도전'}));localStorage.setItem('rescue6:notes',JSON.stringify([{id:'legacy-note',title:'기존노트',text:'이전 기록'}]))}});const g=await migration.newPage();await g.goto(base,{waitUntil:'domcontentloaded'});await g.waitForSelector('.app');const mig=await g.evaluate(()=>({year:window.AITUTOR_V9.Store.state.profile.examYear,notes:window.AITUTOR_V9.Store.state.notes.map(x=>x.id),legacyStill:localStorage.getItem('rescue6:notes')!==null,guest:window.AITUTOR_V9.Auth.isGuest}));assert(mig.year==='2031'&&mig.notes.includes('legacy-note'),'v8 guest study data migrates into v9 namespace');assert(mig.legacyStill&&mig.guest,'legacy source remains intact and migration stays guest-local before sign-in');await migration.close();
  console.log('V9_BROWSER_QA_SUCCESS');
} finally {await browser.close()}
