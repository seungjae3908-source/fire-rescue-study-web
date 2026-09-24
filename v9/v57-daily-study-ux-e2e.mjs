import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1024,height:768}});
  const page=await ctx.newPage();page.setDefaultTimeout(60000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store);

  // Subject-specific study position memory.
  await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.App.chooseConcept('F07-C14')});
  await page.waitForSelector('.page-study');
  await page.locator('.page-study .tabbar [data-study-tab="detail"]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.studyTab==='detail');
  await page.locator('.study-toolbar [data-subject="ems"]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.subject==='ems');
  await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.App.chooseConcept('E09-C07')});
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='E09-C07');
  await page.locator('.page-study .tabbar [data-study-tab="detail"]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.studyTab==='detail');
  await page.locator('.study-toolbar [data-subject="fire"]').click();
  const fireRestore=await page.evaluate(()=>({subject:window.AITUTOR_V9.Store.state.subject,id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  assert(fireRestore.subject==='fire'&&fireRestore.id==='F07-C14'&&fireRestore.tab==='detail','returning to fire restores its last concept and active tab');
  await page.locator('.study-toolbar [data-subject="ems"]').click();
  const emsRestore=await page.evaluate(()=>({subject:window.AITUTOR_V9.Store.state.subject,id:window.AITUTOR_V9.Store.state.conceptId,tab:window.AITUTOR_V9.Store.state.studyTab}));
  assert(emsRestore.subject==='ems'&&emsRestore.id==='E09-C07'&&emsRestore.tab==='detail','returning to EMS restores its last concept and active tab');

  // Load question lane and create representative wrong answers.
  const seeded=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const fire=V.questions.find(q=>q.subject==='fire'&&q.scopeId==='F05'&&V.QuestionQuality119.isExamStyle(q));
    const ems=V.questions.find(q=>q.subject==='ems'&&V.QuestionQuality119.isExamStyle(q));
    if(!fire||!ems)throw Error('seed questions unavailable');
    const wrong=q=>(Number(q.a)+1)%q.choices.length;
    V.Mastery.recordAnswer(fire,wrong(fire),'sure',1200);
    V.Mastery.recordAnswer(ems,wrong(ems),'maybe',1400);
    return{fireId:fire.id,fireConcept:fire.conceptId,emsId:ems.id};
  });
  assert(!!seeded.fireId&&!!seeded.emsId,'representative fire and EMS wrong answers are seeded');

  // Problem-bank subject/scope/status filters.
  await page.evaluate(()=>window.AITUTOR_V9.App.go('bank'));
  await page.waitForSelector('[data-bank-filter="subject"]');
  await page.locator('[data-bank-filter="subject"]').selectOption('fire');
  await page.locator('[data-bank-filter="scope"]').selectOption('F05');
  await page.locator('[data-bank-filter="status"]').selectOption('wrong');
  await page.waitForSelector('.question-card [data-answer]');
  const bankCurrent=await page.locator('.question-card [data-answer]').first().evaluate(el=>{const id=el.dataset.answer.split(':')[0],q=window.AITUTOR_V9.questionById[id];return{id,subject:q.subject,scope:q.scopeId}});
  assert(bankCurrent.subject==='fire'&&bankCurrent.scope==='F05','problem bank filters by subject and scope');
  assert(bankCurrent.id===seeded.fireId,'problem bank wrong-status filter surfaces the seeded wrong answer');

  // Wrong-answer filters + explicit retry remains possible while ordinary double-submit stays blocked.
  await page.evaluate(()=>window.AITUTOR_V9.App.go('wrong'));
  await page.waitForSelector('[data-wrong-filter="subject"]');
  await page.locator('[data-wrong-filter="subject"]').selectOption('fire');
  await page.locator('[data-wrong-filter="kind"]').selectOption('danger');
  const wrongRows=await page.locator('.wrong-list .wrong-row').count();
  assert(wrongRows===1,'wrong-answer filters isolate the fire confidence-error lane');
  const retryId=await page.locator('.wrong-list [data-retry]').first().getAttribute('data-retry');
  const beforeEvents=await page.evaluate(id=>window.AITUTOR_V9.Store.state.answerEvents.filter(x=>x.questionId===id).length,retryId);
  await page.locator('.wrong-list [data-retry]').first().click();
  await page.waitForSelector('.page-bank .question-card');
  const retryState=await page.locator('.page-bank .question-card').evaluate(root=>({enabled:[...root.querySelectorAll('[data-answer]')].some(x=>!x.disabled),confidence:[...root.querySelectorAll('[data-confidence]')].some(x=>!x.disabled)}));
  assert(retryState.enabled&&retryState.confidence,'explicit wrong-answer retry unlocks the question for a new attempt');
  const correct=await page.evaluate(id=>window.AITUTOR_V9.questionById[id].a,retryId);
  await page.locator(`[data-confidence="${retryId}:maybe"]`).click();
  await page.locator(`[data-answer="${retryId}:${correct}"]`).click();
  const afterEvents=await page.evaluate(id=>window.AITUTOR_V9.Store.state.answerEvents.filter(x=>x.questionId===id).length,retryId);
  assert(afterEvents===beforeEvents+1,'explicit retry creates exactly one additional mastery event');

  // Concept-quiz direct question navigation.
  await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.App.chooseConcept('F03-C06')});
  await page.waitForSelector('.page-study');
  await page.locator('.page-study .tabbar [data-study-tab="quiz"]').click();
  await page.waitForSelector('.study-body-desktop .study-quiz-jumps button');
  const jumpCount=await page.locator('.study-body-desktop .study-quiz-jumps button').count();
  assert(jumpCount>=6,'concept quiz exposes direct question-number navigation');
  await page.locator('.study-body-desktop .study-quiz-jumps button').nth(5).click();
  assert((await page.locator('.study-body-desktop .study-quiz-progress b').innerText()).trim().startsWith('6 /'),'question-number jump moves directly to the selected problem');

  // Home removal has an undo action.
  await page.evaluate(()=>window.AITUTOR_V9.App.go('home'));
  await page.waitForSelector('.daily-goal-list .goal-remove');
  const goalId=await page.locator('.daily-goal-list .goal-remove').first().getAttribute('data-goal-remove');
  await page.locator(`[data-goal-remove="${goalId}"]`).click();
  await page.waitForSelector('.app-toast-action');
  assert((await page.locator('.app-toast-action').innerText()).includes('실행취소'),'destructive daily-goal removal exposes an undo action');
  await page.locator('.app-toast-action').click();
  await page.waitForSelector(`[data-goal-remove="${goalId}"]`);
  assert(true,'undo restores the removed daily goal');

  // Multi-result PDF search navigation.
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    V.SourcePDF.render=async(key,p,host,queries=[],opts={})=>{host.innerHTML=`<div data-stub-page="${p}">stub</div>`;return{page:Number(p)||1,pages:120,bookPage:Number(p)||1,zoom:Number(opts.zoom)||1,hits:queries.length,evidenceLines:[],name:key,origin:'stub'}};
    V.SourcePDF.findPages=async(key,q)=>({query:q,pages:120,results:[{page:5,score:90},{page:9,score:70},{page:12,score:50}]});
    V.SourcePDF.locate=async()=>({page:5,pages:120,score:90});
    V.SourcePDF.availability=async()=>({local:true,direct:true,officialPage:''});
    V.App.go('resources');
  });
  await page.waitForSelector('[data-resource-doc]');
  await page.locator('[data-resource-doc]').first().click();
  await page.waitForSelector('#resourcePdf [data-resource-pdf-search-input]');
  await page.locator('#resourcePdf [data-resource-pdf-search-input]').fill('소화');
  await page.locator('#resourcePdf [data-resource-pdf-search]').click();
  await page.waitForSelector('#resourcePdf [data-resource-pdf-search-nav]:not(.hidden)');
  assert((await page.locator('#resourcePdf [data-resource-pdf-search-label]').innerText()).includes('1/3'),'PDF search reports multiple result pages');
  await page.locator('#resourcePdf [data-resource-pdf-search-next]').click();
  await page.waitForFunction(()=>document.querySelector('#resourcePdf')?.dataset.page==='9');
  assert((await page.locator('#resourcePdf [data-resource-pdf-search-label]').innerText()).includes('2/3'),'next-result moves to the next relevant PDF page');
  await page.locator('#resourcePdf [data-resource-pdf-jump-input]').fill('3');
  await page.locator('#resourcePdf [data-resource-pdf-jump]').click();
  await page.waitForFunction(()=>document.querySelector('#resourcePdf [data-resource-pdf-search-nav]')?.classList.contains('hidden'));
  assert(true,'manual PDF page jump clears stale search-result navigation');

  await ctx.close();
  console.log('V57_DAILY_STUDY_UX_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
