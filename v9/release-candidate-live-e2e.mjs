import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
function collectErrors(page){
  const out=[];
  page.on('pageerror',e=>out.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))out.push('console:'+m.text())});
  return out;
}
async function noX(page,label){
  const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));
  assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r));
}
async function boot(page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.app',{timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.ContentContract119,{timeout:60000});
}
async function enter(page,id){
  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace');
  if(id){
    await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
    await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
  }
}
async function pdfSmoke(page,id,doc){
  await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
  await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
  const truth=await page.evaluate(({id,doc})=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId[id],r=(c?.sourceRanges||[])[0]||{},cat=V.SourceCatalog119?.resolveForConcept?.(id);
    return{id,doc:r.doc||'',page:Number(r.from)||0,catalog:cat?.key||''};
  },{id,doc});
  assert(truth.doc===doc&&truth.catalog===doc,id+' resolves to official '+doc);
  assert(truth.page>0,id+' has exact official page');
  await page.locator('.book-source [data-source-concept]').click();
  await page.waitForSelector('#pdfEvidence',{timeout:30000});
  assert(await page.locator('#pdfEvidence input[type=file]').count()===0,id+' official evidence asks for no upload');
  await page.waitForFunction(()=>{
    const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
    return !!root?.querySelector('canvas')&&/하이라이트\s+[1-9]\d*개/.test(label);
  },null,{timeout:240000});
  const r=await page.evaluate(()=>{const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';return{page:Number(root?.dataset.page)||0,label,canvas:root?.querySelectorAll('canvas').length||0}});
  assert(r.canvas===1&&r.page===truth.page,id+' PDF.js opens exact page '+truth.page+' with '+r.label);
  await page.locator('[data-pdf-close]').click();
  await page.waitForFunction(()=>!document.querySelector('#pdfEvidence'));
}

const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  const dp=await desktop.newPage(),derr=collectErrors(dp);
  await boot(dp);
  const truth=await dp.evaluate(()=>{
    const V=window.AITUTOR_V9,a=V.ContentContract119.audit(),cov=V.contentPacks.coverage(),qa=V.QuestionQuality119.audit();
    return{
      exactHead:window.AITUTOR_V9_CONFIG?.exactHead||'',
      brand:document.title,
      audit:{total:a.total,complete:a.complete,incomplete:a.incomplete,avg:a.averageScore,blockers:a.blockers},
      coverage:cov,
      questions:{examStyle:qa.examStyle,duplicateTexts:qa.duplicateTexts.length},
      questionFactory:V.QuestionFactory119?.generated||0,
      visualTargets:V.VisualCompletion119?.targets?.length||0,
      visualRendered:(V.VisualCompletion119?.targets||[]).filter(id=>(V.contentPacks.authored[id]?.visuals||[]).some(v=>!!V.Visual119.render(v))).length,
      calcRequired:V.CalculationContract119?.requiredIds||[],
      calcFalsePositiveRemoved:V.CalculationContract119?.falsePositiveRemoved||[],
      mock:V.examReadiness()
    };
  });
  if(expected)assert(truth.exactHead===expected,'release preview exactHead '+expected);
  assert(truth.brand.includes('119'),'release preview brand is 119');
  assert(truth.audit.total===176&&truth.audit.complete===176&&truth.audit.incomplete===0&&truth.audit.avg===100&&Object.keys(truth.audit.blockers).length===0,'ContentContract119 = 176/176, blockers 0');
  assert(truth.coverage.verified===176&&truth.coverage.pending===0,'page evidence = 176 verified / 0 pending');
  assert(truth.questions.examStyle===1056&&truth.questions.duplicateTexts===0,'exam-style bank = 1056 and duplicate texts = 0');
  assert(truth.questionFactory===956,'factory added only the remaining audited 956 P-practice shortfall after six reviewed B questions');
  assert(truth.visualTargets===27&&truth.visualRendered===27,'all 27 required visuals actually render');
  assert(truth.calcRequired.length===7,'source-applicable calculation contract requires seven hazardous-material concepts');
  assert(truth.mock.ready===true&&truth.mock.scopeComplete===true&&truth.mock.missingFireScopes.length===0,'real mock is verified-ready with full restored fire-scope coverage');
  await enter(dp,'F07-C05');await noX(dp,'release desktop study');
  assert(await dp.locator('.study-rail').isVisible(),'desktop 119 assistant rail visible');
  await dp.locator('.concept-head [data-study-tab="detail"]').click();
  assert(await dp.locator('.concept-visual').count()>=1,'desktop sprinkler detail renders visual diagram');
  assert(derr.length===0,'desktop runtime errors = 0 '+derr.join(' | '));
  await desktop.close();

  const tablet=await browser.newContext({viewport:{width:900,height:1180}});
  const tp=await tablet.newPage(),terr=collectErrors(tp);
  await boot(tp);await enter(tp,'E04-C02');await noX(tp,'release tablet study');
  assert(await tp.locator('.study-mainpane').isVisible(),'tablet textbook pane visible');
  assert(await tp.locator('.study-rail').isHidden(),'tablet desktop rail hidden');
  await tp.locator('.concept-head [data-study-tab="detail"]').click();
  assert(await tp.locator('.concept-visual').count()>=1,'tablet anatomy concept renders grounded visual');
  assert(terr.length===0,'tablet runtime errors = 0 '+terr.join(' | '));
  await tablet.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const mp=await mobile.newPage(),merr=collectErrors(mp);mp.setDefaultTimeout(90000);
  await boot(mp);await enter(mp,'F05-C01');await noX(mp,'release mobile study');
  assert(await mp.locator('.book-mobile').isVisible(),'mobile uses one-scroll electronic textbook');
  const mobileCalcTruth=await mp.evaluate(()=>{
    const V=window.AITUTOR_V9,s=V.Store.state,a=V.contentPacks.authored['F05-C01'],g=V.contentPacks.get('F05-C01');
    return{
      state:{conceptId:s.conceptId,scopeId:s.scopeId,subject:s.subject,page:s.page},
      authoredCalculations:(a?.calculations||[]).length,
      getCalculations:(g?.calculations||[]).length,
      formula:String(g?.calculations?.[0]?.formula||''),
      hazmat2026:!!V.Hazmat2026,
      calcLabs:document.querySelectorAll('.book-mobile .calc-lab').length,
      currentHeading:document.querySelector('.concept-head h2')?.textContent||'',
      bookHasCalcWord:(document.querySelector('.book-mobile')?.textContent||'').includes('계산문제')
    };
  });
  console.log('MOBILE_CALC_TRUTH',JSON.stringify(mobileCalcTruth));
  assert(mobileCalcTruth.state.conceptId==='F05-C01'&&mobileCalcTruth.state.scopeId==='F05'&&mobileCalcTruth.state.subject==='fire','mobile state is exact F05-C01 fire concept');
  assert(mobileCalcTruth.authoredCalculations>=1&&mobileCalcTruth.getCalculations>=1&&mobileCalcTruth.formula.includes('Σ('),'mobile runtime retains verified F05-C01 calculation data');
  assert(mobileCalcTruth.calcLabs===1&&mobileCalcTruth.bookHasCalcWord,'mobile hazardous-material textbook renders calculation lab');
  const calc=await mp.evaluate(()=>window.AITUTOR_V9.contentPacks.authored['F05-C01']?.calculations?.[0]||null);
  assert(calc?.formula?.includes('Σ('),'F05-C01 exposes designated-quantity calculation formula');
  assert((await mp.locator('#book-quiz .question-card').count())===6,'mobile textbook shows six exam-style confirmation questions');
  await pdfSmoke(mp,'E24-C03','ems');
  await pdfSmoke(mp,'F05-C01','prevention2');
  await noX(mp,'release mobile after PDF');
  assert(merr.length===0,'mobile runtime errors = 0 '+merr.join(' | '));
  await mobile.close();

  console.log('RELEASE_CANDIDATE_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify(truth));
}finally{await browser.close()}
