import { chromium } from 'playwright';

const base=process.env.STUDY_119_V74_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({
  viewport:{width:390,height:844},
  isMobile:true,
  hasTouch:true,
  deviceScaleFactor:2,
  serviceWorkers:'block'
});
const page=await ctx.newPage();
const errors=[];
page.on('pageerror',e=>errors.push('pageerror:'+e.message));
page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});

try{
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Auth,{timeout:60000});
  await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:60000});

  const login=await page.locator('.login-gate-card').evaluate(el=>{
    const r=el.getBoundingClientRect();
    return{width:r.width,left:r.left,right:r.right,viewport:innerWidth};
  });
  assert(login.width>=login.viewport*.85,'390px login card uses the mobile viewport instead of the legacy nav column '+JSON.stringify(login));
  assert(login.left>=0&&login.right<=login.viewport+1,'login card stays inside the viewport');

  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9,user={id:'qa-v74-member',email:'qa-v74-member@local.invalid'};
    try{Object.defineProperty(V.Auth,'user',{value:user,configurable:true,writable:true})}catch{V.Auth.user=user}
    try{V.Store?.switchOwner?.(user.id)}catch{}
    try{await V.Lazy119?.ensureQuestions?.()}catch{}
    V.App.render();
  });
  await page.waitForSelector('.page',{state:'visible',timeout:60000});

  await page.evaluate(async()=>window.AITUTOR_V9.App.go('home'));
  await page.waitForSelector('.dashboard-home-compact',{state:'visible',timeout:30000});
  const home=await page.evaluate(()=>{
    const a=document.querySelector('.dashboard-topline')?.getBoundingClientRect(),b=document.querySelector('.dashboard-statline')?.getBoundingClientRect();
    return a&&b?{scheduleBottom:a.bottom,statsTop:b.top,scheduleHeight:a.height}:null;
  });
  assert(home&&home.scheduleHeight>40,'home official schedule row has intrinsic height '+JSON.stringify(home));
  assert(home.scheduleBottom<=home.statsTop+1,'home official schedule does not overlap progress cards '+JSON.stringify(home));

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    V.Store.state.page='study';
    V.Store.state.subject='fire';
    V.Store.state.scopeId='F01';
    V.Store.state.conceptId='F01-C01';
    V.Store.state.studyTab='quiz';
    V.Store.save();
    V.App.runtime.studyQuizIndex['F01-C01']=0;
    V.App.runtime.retryQuestionId='';
    V.App.render();
  });
  await page.waitForSelector('.study-body-unified .question-card',{state:'visible',timeout:30000});
  assert(await page.locator('.study-body-unified .study-quiz-pager').count()===1,'quiz has one previous/next question pager');
  assert(await page.locator('.study-body-unified .concept-nav').count()===0,'quiz does not render a second previous/next concept pager');

  const first=page.locator('.study-body-unified .question-card .choice:not([disabled])').first();
  assert(await first.count()===1,'quiz has an enabled answer choice before answering');
  await first.tap();
  await page.waitForSelector('.study-body-unified .question-card.answered',{state:'visible',timeout:10000});
  const retry=page.locator('.study-body-unified [data-question-retry]').first();
  assert(await retry.count()===1,'answered question exposes retry instead of remaining permanently locked');
  await retry.tap();
  const retryChoice=page.locator('.study-body-unified .question-card .choice:not([disabled])').first();
  assert(await retryChoice.count()===1,'retry re-enables answer choices on touch devices');
  await retryChoice.tap();
  await page.waitForSelector('.study-body-unified .question-card.answered',{state:'visible',timeout:10000});

  await page.locator('.study-single-scroll').evaluate(el=>{el.scrollTop=el.scrollHeight});
  await page.waitForTimeout(100);
  const bottom=await page.evaluate(()=>{
    const pager=document.querySelector('.study-quiz-pager')?.getBoundingClientRect(),nav=document.querySelector('.mobile-nav')?.getBoundingClientRect();
    return pager&&nav?{pagerBottom:pager.bottom,navTop:nav.top}:null;
  });
  assert(bottom&&bottom.pagerBottom<=bottom.navTop+1,'quiz pager remains above the bottom app navigation '+JSON.stringify(bottom));

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,target='b-f01-org-2',qs=V.questionsForConcept('F01-C01'),i=qs.findIndex(q=>q.id===target);
    if(i<0)throw new Error('V74 exact source fixture missing: '+target);
    V.Store.state.page='bank';
    V.Store.state.subject='fire';
    V.Store.state.scopeId='F01';
    V.Store.state.conceptId='F01-C01';
    delete V.Store.state.answers[target];
    V.Store.save();
    V.App.runtime.bankConcept='F01-C01';
    V.App.runtime.bankFilter='';
    V.App.runtime.bankIndex=i;
    V.App.runtime.retryQuestionId='';
    V.App.render();
  });
  await page.waitForSelector('[data-answer^="b-f01-org-2:"]',{state:'visible',timeout:30000});
  await page.locator('[data-answer="b-f01-org-2:0"]').tap();
  const source=page.locator('[data-source-question="b-f01-org-2"]');
  assert(await source.count()===1,'answered source action preserves the exact question id');
  await source.tap();
  await page.waitForSelector('#pdfEvidence canvas',{state:'visible',timeout:60000});
  await page.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.renderState==='ready',{timeout:60000});
  await page.waitForFunction(()=>/정답 근거/.test(document.querySelector('#pdfEvidence [data-pdf-page-label]')?.textContent||''),{timeout:60000});

  const evidence=await page.evaluate(()=>{
    const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'',canvas=root?.querySelector('canvas')?.getBoundingClientRect(),marks=[...(root?.querySelectorAll('.pdf-evidence-line')||[])].map(x=>{const r=x.getBoundingClientRect();return{width:r.width,exact:x.dataset.exact}});
    const tools=root?.querySelector('.pdf-mobile-tools');
    const host=root?.querySelector('.pdf-evidence-host')?.getBoundingClientRect();
    return{questionId:root?.dataset.questionId||'',label,highlightCount:Number(root?.dataset.highlightCount||0),canvasWidth:canvas?.width||0,marks,toolsOpen:!!tools?.open,hostHeight:host?.height||0};
  });
  assert(evidence.questionId==='b-f01-org-2','source modal is bound to the answered question '+JSON.stringify(evidence));
  assert(/교재\s*46쪽/.test(evidence.label),'source opens the explicit textbook page 46 '+evidence.label);
  assert(/정답 근거/.test(evidence.label),'source labels exact answer evidence instead of a nearby sentence');
  assert(evidence.highlightCount>0&&evidence.marks.length>0,'exact answer evidence produces a visible underline');
  assert(evidence.marks.every(x=>x.exact==='true'),'non-exact fallback lines never receive orange underlines '+JSON.stringify(evidence.marks));
  assert(evidence.canvasWidth>0&&evidence.marks.every(x=>x.width<evidence.canvasWidth*.8),'answer underline stays local instead of spanning an unrelated full line '+JSON.stringify(evidence.marks));
  assert(evidence.toolsOpen===false,'mobile PDF zoom/search/page tools are collapsed by default');
  assert(evidence.hostHeight>=300,'collapsed tools preserve a useful mobile PDF reading area '+evidence.hostHeight);

  assert(errors.length===0,'V74 mobile runtime errors = 0 '+errors.join(' | '));
  console.log('V74_MOBILE_ANSWER_SOURCE_E2E_SUCCESS');
}finally{
  await ctx.close();
  await browser.close();
}
