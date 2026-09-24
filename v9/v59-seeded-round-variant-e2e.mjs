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
  await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
  await page.waitForSelector('[data-exam-round]');
  assert(await page.locator('[data-exam-round] option').count()===50,'exam landing exposes 50 managed rounds');

  // Practice round 7: create once, persist variant snapshot, and reproduce identically.
  await page.locator('[data-exam-round]').selectOption('7');
  await page.locator('[data-exam-start="practice"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const first=await page.evaluate(()=>{const V=window.AITUTOR_V9,e=V.App.runtime.exam;return{round:e.round,seed:e.seed,ids:e.qs.map(q=>q.id),stems:e.qs.slice(0,5).map(q=>q.q),variant:e.qs.filter(q=>q.variantGenerated).length,base:e.blueprint?.baseQuestionIds||[]};});
  assert(first.round===7&&first.ids.length===65&&first.base.length===65,'practice round 7 stores a 65-question seeded base definition');
  assert(first.variant>=55,'practice round 7 materially uses safe variants');

  await page.locator('[data-exam-answer]').first().click();
  await page.locator('[data-exam-confidence="sure"]').click();
  await page.locator('[data-exam-next]').click();
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App?.runtime?.exam);
  const restored=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{round:e.blueprint?.round,seed:e.blueprint?.seed,ids:e.qs.map(q=>q.id),variant:e.qs.filter(q=>q.variantGenerated).length,i:e.i,answers:Object.keys(e.answers).length};});
  assert(restored.round===7&&restored.seed===first.seed&&JSON.stringify(restored.ids)===JSON.stringify(first.ids),'active seeded practice round restores identical variants after reload');
  assert(restored.variant>=55&&restored.i===1&&restored.answers===1,'variant snapshots preserve position and answer state');

  page.once('dialog',d=>d.accept());
  await page.locator('[data-exam-abandon]').click();
  await page.waitForFunction(()=>window.AITUTOR_V9.App.runtime.exam===null);
  await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
  await page.waitForSelector('[data-exam-round]');
  await page.locator('[data-exam-round]').selectOption('7');
  await page.locator('[data-exam-start="practice"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const repeated=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{seed:e.seed,ids:e.qs.map(q=>q.id),stems:e.qs.slice(0,5).map(q=>q.q)}});
  assert(repeated.seed===first.seed&&JSON.stringify(repeated.ids)===JSON.stringify(first.ids)&&JSON.stringify(repeated.stems)===JSON.stringify(first.stems),'reopening the same round and difficulty reproduces the same question paper');
  page.once('dialog',d=>d.accept());await page.locator('[data-exam-abandon]').click();

  // A different round produces a different seed/paper and can be explicitly rebuilt.
  await page.locator('[data-exam-round]').selectOption('8');
  await page.locator('[data-exam-start="practice"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const round8=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{seed:e.seed,ids:e.qs.map(q=>q.id)}});
  assert(round8.seed!==first.seed&&JSON.stringify(round8.ids)!==JSON.stringify(first.ids),'different practice round uses a different reproducible seed and paper');
  page.once('dialog',d=>d.accept());await page.locator('[data-exam-abandon]').click();
  const seedBefore=await page.evaluate(()=>window.AITUTOR_V9.Store.state.mockRounds.practice.mid['8'].seed);
  page.once('dialog',d=>d.accept());await page.locator('[data-exam-round-reset="practice"]').click();
  const seedAfter=await page.evaluate(()=>window.AITUTOR_V9.Store.state.mockRounds.practice.mid['8'].seed);
  assert(seedAfter!==seedBefore,'explicit practice-round rebuild replaces the saved seed without touching history');

  // Real round remains strict A/B and variant-free.
  await page.locator('[data-exam-round]').selectOption('3');
  await page.locator('[data-exam-start="real"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const real=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{round:e.round,n:e.qs.length,variant:e.qs.filter(q=>q.variantGenerated).length,grades:[...new Set(e.qs.map(q=>q.grade))],family:e.qs.every(q=>!!(q.familyId||q.masterQuestionId))}});
  assert(real.round===3&&real.n===65&&real.variant===0,'real round 3 remains a fixed 65-question non-variant exam');
  assert(real.grades.every(g=>g==='A'||g==='B')&&real.family,'real round uses only verified A/B masters with family metadata');
  page.once('dialog',d=>d.accept());await page.locator('[data-exam-abandon]').click();

  // Adaptive weakness lane gets 65 questions and safe variants, without altering real policy.
  await page.locator('[data-training-start="weak65"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const weak=await page.evaluate(()=>{const e=window.AITUTOR_V9.App.runtime.exam;return{mode:e.mode,n:e.qs.length,variant:e.qs.filter(q=>q.variantGenerated).length,key:e.trainingKey}});
  assert(weak.mode==='training'&&weak.n===65&&weak.variant>=55,'weakness-adaptive 65-question training uses the safe variant lane');
  page.once('dialog',d=>d.accept());await page.locator('[data-exam-abandon]').click();

  assert(errors.length===0,'seeded rounds and variant flow produce no browser runtime errors');
  console.log('V59_SEEDED_ROUND_VARIANT_E2E_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
