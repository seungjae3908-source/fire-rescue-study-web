import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const monitor={version:'119-official-monitor-snapshot-v1',generatedAt:'2026-09-21T00:00:00.000Z',targetExamYear:2027,baselineYear:2026,officialOnly:true,healthy:true,sourceStatus:[],items:[]};
const assert=(v,m)=>{if(!v)throw Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block',acceptDownloads:true});
  const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(monitor)}));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.PassNote&&!!window.AITUTOR_V9?.Mastery);
  const go=async r=>{await page.evaluate(r=>window.AITUTOR_V9.App.go(r),r);await page.waitForFunction(r=>window.AITUTOR_V9.Store.state.page===r,r)};

  await go('notes');
  await page.locator('#noteTitle').fill('V15 최종 QA 노트');
  await page.locator('#noteBody').fill('백업 복원과 합격노트 사용자 여정 검증');
  await page.locator('[data-save-note]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.notes.some(n=>n.title==='V15 최종 QA 노트'));
  assert(await page.locator('.note-list').getByText('V15 최종 QA 노트').count()===1,'user can create a personal pass note from the notes screen');

  await go('settings');
  const dl=page.waitForEvent('download');
  await page.locator('[data-export]').click();
  const download=await dl;
  assert(download.suggestedFilename()==='ai-tutor-v9-backup.json','settings backup button downloads the expected JSON backup');
  const backup=await page.evaluate(()=>window.AITUTOR_V9.Store.export());
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.resetOwner();V.App.render()});
  assert(await page.evaluate(()=>!window.AITUTOR_V9.Store.state.notes.some(n=>n.title==='V15 최종 QA 노트')),'test reset removes the note before restore');
  await go('settings');
  await page.locator('#importBackup').setInputFiles({name:'v15-backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.notes.some(n=>n.title==='V15 최종 QA 노트'));
  assert(await page.evaluate(()=>window.AITUTOR_V9.Store.state.notes.some(n=>n.title==='V15 최종 QA 노트')),'backup file restore recovers the personal pass note');

  const wrongSeed=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,eligible=(V.questions||[]).filter(q=>V.QuestionQuality119?.isExamStyle?.(q)!==false),groups={};
    for(const q of eligible)(groups[q.conceptId]||(groups[q.conceptId]=[])).push(q);
    const [conceptId,qs]=Object.entries(groups).sort((a,b)=>b[1].length-a[1].length)[0];
    const q=qs[0],wrong=(q.a+1)%4;V.Mastery.recordAnswer(q,wrong,'sure',1200);
    V.App.go('exam');return{conceptId,id:q.id,alternates:qs.length-1};
  });
  await page.waitForSelector('[data-training-start="wrong20"]');
  await page.locator('[data-training-start="wrong20"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const retry=await page.evaluate(({id,conceptId})=>{const e=window.AITUTOR_V9.App.runtime.exam;return{n:e.qs.length,containsOriginal:e.qs.some(q=>q.id===id),sameConcept:e.qs.every(q=>q.conceptId===conceptId),ids:e.qs.map(q=>q.id)}},{id:wrongSeed.id,conceptId:wrongSeed.conceptId});
  assert(wrongSeed.alternates>=20&&retry.n===20&&retry.sameConcept&&!retry.containsOriginal,'wrong-answer retraining prefers 20 alternate questions from the same weak concept before repeating the missed item');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.App.runtime.exam=null;V.ExamSession119?.clear?.(V.Store.ownerId);V.App.go('exam')});
  await page.locator('[data-exam-start="practice"]').click();await page.waitForSelector('.exam-run-workspace');
  const wrongIndex=await page.evaluate(()=>{const q=window.AITUTOR_V9.App.runtime.exam.qs[0];return(q.a+1)%4});
  await page.locator(`[data-exam-answer="${wrongIndex}"]`).click();
  await page.locator('[data-exam-confidence="sure"]').click();
  await page.locator('[data-exam-jump="64"]').click();
  page.once('dialog',d=>d.accept());
  await page.locator('[data-exam-next]').click();
  await page.waitForSelector('.exam-report');
  const report=await page.locator('.exam-report').innerText();
  assert(report.includes('확신오답 1')&&report.includes('난이도 분석')&&report.includes('오답·미응답 분석'),'exam completion surfaces confident mistakes difficulty results and missed-question analysis');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.App.chooseConcept('F03-C06');V.SourcePDF.availability=async()=>({local:false,direct:false,officialPage:'https://www.nfa.go.kr/'})});
  await page.locator('.tabbar [data-study-tab="source"]').click();
  await page.locator('.study-body-desktop [data-source-concept]').click();
  await page.waitForSelector('#pdfEvidence .official-fallback');
  const sourceText=await page.locator('#pdfEvidence').innerText();
  assert(!/여는 중|위치 찾는 중|준비 중/.test(sourceText)&&sourceText.includes('중앙소방학교 원문 열기'),'source failure resolves to an actionable official fallback instead of an indefinite loading state');
  await page.locator('[data-pdf-close]').click().catch(()=>{});

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.App.chooseConcept('F03-C06');try{Object.defineProperty(navigator,'gpu',{value:undefined,configurable:true})}catch{}});
  await page.locator('.tabbar [data-study-tab="ai"]').click();
  await page.locator('.study-body-desktop [data-tutor-input]').fill('플래시오버는 왜 발생해? 시험에서 어떻게 구분해?');
  await page.locator('.study-body-desktop [data-tutor-send]').click();
  await page.waitForFunction(()=>{const c=window.AITUTOR_V9.Store.state.chat||[],x=c[c.length-1];return x?.role==='assistant'&&x.text&&x.text!=='생각 중…'});
  const ai=await page.evaluate(()=>{const c=window.AITUTOR_V9.Store.state.chat||[];return c[c.length-1]?.text||''});
  assert(ai.includes('답변')&&ai.includes('왜 그런가')&&ai.includes('시험 적용')&&ai.includes('근거'),'AI fallback answers first then explains reason exam application and evidence');

  assert(errors.length===0,'final user journey produces no browser page errors');
  console.log('FINAL_USER_JOURNEY_E2E_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
