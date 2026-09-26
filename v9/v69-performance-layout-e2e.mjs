import { chromium } from 'playwright';
const base=process.env.STUDY_119_V69_LOCAL_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
const check=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
try{
  const ctx=await browser.newContext({viewport:{width:1920,height:1080},serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(60000);
  const appStarted=Date.now();
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
  const appReadyMs=Date.now()-appStarted;
  check(appReadyMs<5000,'first App ready stays under 5s on local branch '+appReadyMs+'ms');
  const staticScripts=await page.locator('script[src]:not([data-lazy-119])').count();
  check(staticScripts===8,'only eight eager script requests are declared');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('home'));
  const n0=Date.now();await page.evaluate(()=>window.AITUTOR_V9.App.go('notes'));
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='notes');
  await page.waitForSelector('.notes-page',{state:'visible'});
  const notesMs=Date.now()-n0;check(notesMs<900,'notes opens without waiting for question lane '+notesMs+'ms');

  const beforePrefetch=await page.evaluate(()=>({contentReady:window.AITUTOR_V9.Lazy119.contentReady,questionsReady:window.AITUTOR_V9.Lazy119.questionsReady,contentScripts:document.querySelectorAll('script[data-lazy-119="content-core-v69.js"]').length,questionCoreScripts:document.querySelectorAll('script[data-lazy-119="question-core-v69.js"]').length}));
  check(!beforePrefetch.contentReady&&!beforePrefetch.questionsReady&&beforePrefetch.contentScripts===0&&beforePrefetch.questionCoreScripts===0,'idle warm-up has not executed deferred content or question scripts');
  await page.evaluate(()=>window.AITUTOR_V9.Lazy119.prefetch());
  const afterPrefetch=await page.evaluate(()=>({prefetched:window.AITUTOR_V9.Lazy119.prefetched,contentReady:window.AITUTOR_V9.Lazy119.contentReady,questionsReady:window.AITUTOR_V9.Lazy119.questionsReady}));
  check(afterPrefetch.prefetched&&!afterPrefetch.contentReady&&!afterPrefetch.questionsReady,'prefetch warms network cache without executing deferred lanes');
  const questionFetch=await page.evaluate(()=>{
    const files=new Set(window.AITUTOR_V9.Lazy119.questionFiles||[]);
    const earliest=new Map();
    for(const x of performance.getEntriesByType('resource')){
      const name=String(x.name).split('/').pop().split('?')[0];
      if(!files.has(name))continue;
      const prev=earliest.get(name);
      if(prev==null||x.startTime<prev)earliest.set(name,x.startTime);
    }
    const starts=[...earliest.values()].sort((a,b)=>a-b);
    return{count:earliest.size,startSpread:starts.length?starts.at(-1)-starts[0]:Infinity};
  });
  check(questionFetch.count===20,'all twenty deferred question assets are prefetched');
  check(questionFetch.startSpread<700,'twenty deferred question prefetches start concurrently '+Math.round(questionFetch.startSpread)+'ms spread');
  const b0=Date.now();await page.evaluate(()=>window.AITUTOR_V9.App.go('bank'));
  await page.waitForSelector('.bank-page .question-card',{state:'visible',timeout:10000});
  const bankMs=Date.now()-b0;check(bankMs<1500,'bank opens from prefetched JSON-precomputed cache '+bankMs+'ms');
  check(await page.evaluate(()=>window.AITUTOR_V9.Lazy119.contentReady&&window.AITUTOR_V9.Lazy119.questionsReady),'bank entry executes both deferred lanes exactly when needed');
  const precomputed=await page.evaluate(()=>window.AITUTOR_V9.PrecomputedQuestionFactoriesV69||null);
  check(precomputed?.count===4946&&precomputed?.runtimeGeneration===false,'bank uses 4,946 JSON-precomputed generated questions with runtime generation disabled');
  check(await page.evaluate(()=>{const rows=window.AITUTOR_V9?.Lazy119?.precomputedFiles||[];return rows.length===6&&rows.every(x=>x.endsWith('.json'))}),'all six precomputed question chunks use JSON rather than JavaScript source parsing');
  check(await page.locator('script[data-lazy-119="content-core-v69.js"]').count()===1&&await page.locator('script[data-lazy-119="question-core-v69.js"]').count()===1,'content and question core execute lazily exactly once');
  const qWidth=(await page.locator('.bank-page .question-card').boundingBox())?.width||0;
  check(qWidth>=1000,'1920 desktop question card uses wider workspace '+qWidth);

  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01'));
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C01');
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  await page.waitForSelector('.detail-view',{state:'visible'});
  const detailWidth=(await page.locator('.detail-view:visible').boundingBox())?.width||0;
  check(detailWidth>=1150,'1920 detail view uses wide layout '+detailWidth);
  const lefts=await page.locator('.detail-view:visible>.detail-section:visible').evaluateAll(xs=>[...new Set(xs.slice(0,8).map(x=>Math.round(x.getBoundingClientRect().left)))]);
  check(lefts.length>=2,'wide detail sections use two columns '+JSON.stringify(lefts));
  const cmp=page.locator('[data-detail-jump="comparison"]:visible').first();
  if(await cmp.count()){await cmp.click();await page.waitForFunction(()=>{const b=[...document.querySelectorAll('[data-detail-jump="comparison"]')].find(x=>x.offsetParent!==null);return b?.getAttribute('aria-current')==='location'&&b.classList.contains('on')},{timeout:3000});}

  await page.evaluate(()=>window.AITUTOR_V9.App.go('home'));
  check(await page.locator('.dashboard-schedule').count()===0,'home no longer repeats official schedule card');
  await page.evaluate(()=>window.AITUTOR_V9.App.go('resources'));
  await page.waitForSelector('.resources-119');
  check(await page.locator('.resource-compact-list').count()===1,'resources use compact list');

  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01'));
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C01');
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='ai';V.Store.save();V.App.render()});
  const aiInput=page.locator('[data-tutor-input]:visible').first();
  if(await aiInput.count()){
    await aiInput.fill('소방본부는 지역에 몇개씩 있어?');
    await aiInput.press('Enter');
    await page.waitForFunction(()=>[...document.querySelectorAll('.tutor-message.me')].some(x=>x.textContent.includes('소방본부는 지역에 몇개씩 있어?')),{timeout:10000});
    await page.waitForTimeout(250);
    const answer=await page.locator('.tutor-message.assistant:visible,.tutor-message.ai:visible').last().innerText().catch(()=> '');
    check(/확인할 수 없습니다|추정하지 않습니다|\d/.test(answer),'numeric fallback either cites a grounded number or explicitly refuses to invent one');
  }
  console.log('V69_PERFORMANCE_LAYOUT_E2E_SUCCESS');
}finally{await browser.close()}
// V69 JSON-precomputed exact-head CI trigger.
