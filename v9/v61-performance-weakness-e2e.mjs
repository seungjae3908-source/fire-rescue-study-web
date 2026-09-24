import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const emptyMonitor={ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(90000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyMonitor)}));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App);
  await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const fire=V.questions.filter(q=>q.subject==='fire'&&V.QuestionQuality119.isExamStyle(q)).slice(0,5);
    const ems=V.questions.filter(q=>q.subject==='ems'&&V.QuestionQuality119.isExamStyle(q)).slice(0,5);
    const qs=[...fire,...ems],now=Date.now();
    V.Store.state.answerEvents=qs.map((q,i)=>({eventId:'v61-ui-'+i,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,correct:i%3!==0,choice:i%3!==0?q.a:(q.a+1)%4,confidence:i===0||i===3?'sure':i%2?'maybe':'none',responseMs:900+i*200,at:now-i*60000}));
    V.Store.state.wrongs=[
      {id:'v61-ui-w1',questionId:qs[0].id,masterQuestionId:qs[0].id,familyId:qs[0].id,conceptId:qs[0].conceptId,scopeId:qs[0].scopeId,confidence:'sure',due:now-1000,resolved:false,wrongCount:2,lastWrongAt:now-5000},
      {id:'v61-ui-w2',questionId:qs[3].id,masterQuestionId:qs[3].id,familyId:qs[3].id,conceptId:qs[3].conceptId,scopeId:qs[3].scopeId,confidence:'sure',due:now+86400000,resolved:false,wrongCount:1,lastWrongAt:now-6000}
    ];
    V.Store.state.examHistory=[
      {id:'v61-x1',mode:'real',round:1,score:60,at:now-6*86400000,partial:false,abandoned:false,questionIds:[qs[0].id],answers:{[qs[0].id]:qs[0].a},blueprint:{fire:25,ems:40}},
      {id:'v61-x2',mode:'real',round:2,score:68,at:now-5*86400000,partial:false,abandoned:false,questionIds:[qs[1].id],answers:{[qs[1].id]:qs[1].a},blueprint:{fire:25,ems:40}},
      {id:'v61-x3',mode:'practice',round:3,score:72,at:now-4*86400000,partial:false,abandoned:false,questionIds:[qs[2].id],answers:{[qs[2].id]:qs[2].a},blueprint:{fire:25,ems:40}},
      {id:'v61-x4',mode:'real',round:4,score:76,at:now-3*86400000,partial:false,abandoned:false,questionIds:[qs[3].id],answers:{[qs[3].id]:qs[3].a},blueprint:{fire:25,ems:40}},
      {id:'v61-x5',mode:'practice',round:5,score:80,at:now-2*86400000,partial:false,abandoned:false,questionIds:[qs[4].id],answers:{[qs[4].id]:qs[4].a},blueprint:{fire:25,ems:40}},
      {id:'v61-x6',mode:'real',round:6,score:84,at:now-86400000,partial:false,abandoned:false,questionIds:[qs[5].id],answers:{[qs[5].id]:qs[5].a},blueprint:{fire:25,ems:40}}
    ];
    V.Store.save();await V.App.go('stats');
  });
  await page.waitForSelector('.stats-v61');
  assert(await page.locator('text=V61 성적·취약점 분석센터').count()===1,'V61 analytics center is visible');
  assert(await page.locator('.stats-v61-metrics .metric').count()===4,'four top learning metrics are rendered');
  assert(await page.locator('.stats-v61').getByText('소방학',{exact:true}).count()>=1,'fire subject analytics is rendered');
  assert(await page.locator('.stats-v61').getByText('응급처치학',{exact:true}).count()>=1,'EMS subject analytics is rendered');
  assert(await page.locator('.stats-weak-row').count()>=2,'weak scope and concept rows are rendered');
  assert(await page.locator('text=확신도 분석').count()===1,'confidence analytics lane is rendered');
  assert(await page.locator('text=최근 시험 흐름').count()===1,'exam trend lane is rendered');
  assert(await page.locator('[data-stats-weak-train]').count()===1,'adaptive weakness-training action is available');

  const target=await page.locator('.stats-weak-row[data-concept]').first().getAttribute('data-concept');
  await page.locator('.stats-weak-row[data-concept]').first().click();
  await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.conceptId===id,target);
  assert(true,'weakness row opens the recommended concept directly');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('stats'));
  await page.waitForSelector('[data-stats-weak-train]');
  await page.locator('[data-stats-weak-train]').click();
  await page.waitForSelector('.exam-run-workspace');
  const training=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{page:window.AITUTOR_V9.Store.state.page,mode:e?.mode,key:e?.trainingKey,n:e?.qs?.length||0}});
  assert(training.page==='exam'&&training.mode==='training'&&training.key==='weak65'&&training.n===65,'analytics priority launches a 65-question adaptive training exam');

  assert(errors.length===0,'V61 analytics UI produces no browser runtime errors');
  console.log('V61_PERFORMANCE_WEAKNESS_E2E_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
