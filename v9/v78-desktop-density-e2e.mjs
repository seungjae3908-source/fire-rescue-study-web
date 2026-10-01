import { chromium } from 'playwright';
const base=process.env.STUDY_119_V78_URL||'http://127.0.0.1:4173/v9/index.html';
const failures=[];
const check=(v,m,meta={})=>{if(v)console.log('PASS',m);else{failures.push({message:m,...meta});console.error('V78_FAIL',JSON.stringify({message:m,...meta}))}};
const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function go(page,route){await page.evaluate(route=>window.AITUTOR_V9.App.go(route),route);await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);await settle(page)}
async function renderStudy(page,id,tab){await page.evaluate(({id,tab})=>{const V=window.AITUTOR_V9,c=V.curriculum.concepts.find(x=>x.id===id);V.Store.state.page='study';V.Store.state.subject=c.subject;V.Store.state.scopeId=c.scopeId;V.Store.state.conceptId=id;V.Store.state.studyTab=tab;V.Store.save();V.App.render()},{id,tab});await settle(page)}
async function widthMetric(page,selector){return page.evaluate(selector=>{const p=document.querySelector('.page')?.getBoundingClientRect(),t=document.querySelector(selector)?.getBoundingClientRect();if(!p||!t)return null;return{page:p.width,target:t.width,left:t.left-p.left,right:p.right-t.right}},selector)}
function fluid(m,label,w,min=.90){check(!!m,label+' exists '+w,m||{});if(!m)return;check(m.target>=m.page*min,label+' uses desktop width '+w,m);check(Math.max(Math.abs(m.left),Math.abs(m.right))<=Math.max(42,m.page*.055),label+' avoids oversized side gutters '+w,m)}
const browser=await chromium.launch({headless:true});
try{
 for(const vp of [{width:1366,height:768},{width:1440,height:900},{width:1680,height:900},{width:1920,height:1080}]){
  const ctx=await browser.newContext({viewport:vp,serviceWorkers:'block'}),page=await ctx.newPage();page.setDefaultTimeout(45000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum?.concepts?.length);

  fluid(await widthMetric(page,'.dashboard-home-compact'),'home',vp.width);

  await page.evaluate(async()=>{await window.AITUTOR_V9.Lazy119.ensureQuestions()});
  const quizId=await page.evaluate(()=>{const V=window.AITUTOR_V9;return V.curriculum.concepts.map(c=>({id:c.id,n:V.QuestionQuality119?.forConcept(c.id)?.length||0})).sort((a,b)=>b.n-a.n)[0].id});
  await renderStudy(page,quizId,'quiz');
  fluid(await widthMetric(page,'.quiz-view'),'study quiz',vp.width,.88);

  await go(page,'stats');
  fluid(await widthMetric(page,'.stats-v61>*'),'stats card',vp.width,.88);

  await go(page,'resources');
  fluid(await widthMetric(page,'.resources-119>.card'),'resources card',vp.width,.88);

  await go(page,'suggestions');
  fluid(await widthMetric(page,'.suggestions-page>.card'),'suggestions card',vp.width,.88);

  await go(page,'exam');
  fluid(await widthMetric(page,'.exam-landing-single'),'exam landing',vp.width);
  fluid(await widthMetric(page,'.exam-pane'),'exam pane',vp.width,.88);
  const trainingTab=page.locator('[data-exam-hub="training"]');if(await trainingTab.count())await trainingTab.click();
  const start=page.locator('[data-training-start="fire50"]:visible');
  if(await start.count()){
    await start.click();await page.waitForSelector('.exam-run-workspace');await settle(page);
    fluid(await widthMetric(page,'.exam-layout'),'active exam layout',vp.width,.86);
    const ex=await page.evaluate(()=>{const l=document.querySelector('.exam-layout')?.getBoundingClientRect(),f=document.querySelector('.exam-footer')?.getBoundingClientRect(),q=document.querySelector('.exam-question-card')?.getBoundingClientRect();return l&&f&&q?{layout:l.width,footer:f.width,gap:Math.round(f.top-q.bottom)}:null});
    check(!!ex,'active exam geometry exists '+vp.width,ex||{});
    if(ex){check(Math.abs(ex.footer-ex.layout)<=4,'active exam footer aligns to wide layout '+vp.width,ex);check(ex.gap<160,'active exam has no large vertical dead zone '+vp.width,ex)}
  }
  check(errors.length===0,'V78 desktop density has zero runtime errors '+vp.width,{errors});
  await ctx.close();
 }
 if(failures.length)throw new Error('V78_DESKTOP_DENSITY_FAILURES '+JSON.stringify(failures));
 console.log('V78_DESKTOP_DENSITY_E2E_SUCCESS');
}finally{await browser.close()}
