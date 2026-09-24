import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const emptyMonitor={ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'}),page=await ctx.newPage();page.setDefaultTimeout(90000);
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyMonitor)}));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.AITUTOR_V9?.App);
 const seeded=await page.evaluate(async()=>{const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
   const groups={};for(const q of V.questions){if(V.QuestionQuality119?.isExamStyle?.(q)===false)continue;(groups[q.conceptId]||(groups[q.conceptId]=[])).push(q)}
   const id=Object.keys(groups).find(k=>groups[k].length>=5),qs=groups[id].slice(0,5),now=Date.now();if(!id)return null;
   V.Store.state.answerEvents=qs.slice(0,3).map((q,i)=>({eventId:'v64-ui-'+i,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:id,scopeId:q.scopeId,subject:q.subject,correct:i===2,confidence:i<2?'sure':'maybe',at:now-(3-i)*60000}));
   V.Store.state.wrongs=[{id:'v64-ui-w',questionId:qs[0].id,masterQuestionId:qs[0].id,familyId:qs[0].familyId||qs[0].id,conceptId:id,scopeId:qs[0].scopeId,confidence:'sure',due:now-1000,resolved:false,wrongCount:2,recoveryCorrect:0,lastWrongAt:now-180000}];
   V.Store.state.todayGoal=null;V.Store.save();V.Mastery.ensureDailyGoal(6);await V.App.go('home');return{id,title:V.curriculum.byId[id].title}
 });
 assert(seeded?.id,'V64 seed concept with five questions exists');
 await page.waitForSelector('.correction-v64-home');
 assert(await page.locator('.correction-v64-home [data-v64-train]').count()>=1,'home surfaces active correction action');
 const today=await page.evaluate(id=>window.AITUTOR_V9.Store.state.todayGoal?.ids?.includes(id),seeded.id);
 assert(today===true,'active weakness auto-links into today goal');
 await page.locator('.correction-v64-home [data-v64-train]').first().click();await page.waitForSelector('.exam-run-workspace');
 const training=await page.evaluate(()=>{const V=window.AITUTOR_V9,e=V.App.runtime.exam;return{mode:e?.mode,key:e?.trainingKey,n:e?.qs?.length||0,ids:[...new Set((e?.qs||[]).map(q=>q.conceptId))]}}); 
 assert(training.mode==='training'&&training.key==='correction:'+seeded.id,'V64 launches correction as training only');
 assert(training.n>=3&&training.n<=5&&training.ids.length===1&&training.ids[0]===seeded.id,'V64 revalidation uses three to five questions from the weak concept');
 await page.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.Store.state.page='stats';window.AITUTOR_V9.Store.save();window.AITUTOR_V9.App.render()});
 await page.waitForSelector('.correction-v64-card');
 assert(await page.locator('.correction-v64-card').getByText('취약점 → 복습 → 재검증 → 완료',{exact:true}).count()===1,'stats exposes V64 correction closed loop');
 assert(errors.length===0,'V64 correction UI produces no browser runtime errors '+errors.join(' | '));
 console.log('V64_CORRECTION_LOOP_E2E_SUCCESS');await ctx.close();
}finally{await browser.close()}
