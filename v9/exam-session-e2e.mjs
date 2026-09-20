import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const emptyMonitor={
  version:'119-official-monitor-snapshot-v1',generatedAt:'2026-10-01T00:00:00.000Z',targetExamYear:2027,baselineYear:2026,officialOnly:true,healthy:true,
  sourceStatus:[{id:'nfa-recruit',label:'소방청 채용·시험',ok:true,pagesOk:3,status:'ok',error:''},{id:'nfsa-notice',label:'중앙소방학교 고시·공고',ok:true,pagesOk:1,status:'ok',error:''},{id:'nfsa-materials',label:'중앙소방학교 공식교재',ok:true,pagesOk:2,status:'ok',error:''}],
  items:[]
};
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
  const page=await ctx.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyMonitor)}));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.ExamSession119);
  await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
  await page.locator('[data-exam-start="practice"]').click();
  await page.waitForSelector('.exam-run-workspace');

  await page.locator('[data-exam-answer="1"]').click();
  await page.locator('[data-exam-next]').click();
  const before=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,e=V.App.runtime.exam;
    return{id:e.id,i:e.i,startedAt:e.startedAt,answer:{...e.answers},owner:V.Store.ownerId,saved:V.ExamSession119.has(V.Store.ownerId)}
  });
  assert(before.saved&&before.i===1&&Object.keys(before.answer).length===1,'active practice exam persists answer and current position locally');

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App?.runtime?.exam);
  const restored=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,e=V.App.runtime.exam;
    return{id:e.id,i:e.i,startedAt:e.startedAt,answers:{...e.answers},page:V.Store.state.page,restored:e.restored===true}
  });
  assert(restored.id===before.id&&restored.i===before.i&&restored.startedAt===before.startedAt,'active exam restores same id, position and start time after reload');
  assert(restored.page==='exam'&&restored.restored&&Object.keys(restored.answers).length===1,'reload returns directly to the saved exam with its answer');

  page.once('dialog',d=>d.accept());
  await page.locator('[data-exam-abandon]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.App.runtime.exam===null);
  const cleared=await page.evaluate(()=>!window.AITUTOR_V9.ExamSession119.has(window.AITUTOR_V9.Store.ownerId));
  assert(cleared,'abandoning an exam clears the local active-exam snapshot without scoring it');

  await page.locator('[data-exam-start="real"]').click();
  await page.waitForSelector('[data-exam-timer]');
  const t1=(await page.locator('[data-exam-timer]').innerText()).trim();
  await page.waitForTimeout(1250);
  const t2=(await page.locator('[data-exam-timer]').innerText()).trim();
  assert(t1!==t2,'real exam countdown visibly advances from wall-clock time');
  page.once('dialog',d=>d.accept());
  await page.locator('[data-exam-abandon]').click();
  assert(errors.length===0,'exam persistence/timer flow produces no browser runtime errors');
  console.log('EXAM_SESSION_RECOVERY_E2E_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
