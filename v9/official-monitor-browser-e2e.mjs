import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const snapshot={
  version:'119-official-monitor-snapshot-v1',
  generatedAt:'2026-10-01T00:00:00.000Z',
  targetExamYear:2027,
  baselineYear:2026,
  officialOnly:true,
  healthy:true,
  sourceStatus:[
    {id:'nfa-recruit',label:'소방청 채용·시험',ok:true,pagesOk:3,status:'ok',error:''},
    {id:'nfsa-notice',label:'중앙소방학교 고시·공고',ok:true,pagesOk:1,status:'ok',error:''},
    {id:'nfsa-materials',label:'중앙소방학교 공식교재',ok:true,pagesOk:2,status:'ok',error:''}
  ],
  items:[{
    id:'offline-test-2027',
    sourceId:'nfa-recruit',
    sourceLabel:'소방청 채용·시험',
    title:'2027년 소방공무원 채용시험 시행계획 공고',
    publishedAt:'2026-10-01',
    url:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=view&cntId=offline-test',
    kind:'recruitment_notice',
    meaningful:true,
    reviewRequired:true,
    targetYearMatch:true,
    baselineYearMatch:false,
    noticeYear:2027,
    fingerprint:'1234567890abcdef1234',
    changeState:'updated',
    previousFingerprint:'abcdef1234567890abcd'
  }]
};
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));

  await page.route('**/api/official-monitor**',route=>route.fulfill({
    status:200,contentType:'application/json',headers:{'cache-control':'no-store'},body:JSON.stringify(snapshot)
  }));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.AITUTOR_V9?.OfficialMonitor119?.summary?.().status==='ready',{timeout:30000});
  let first=await page.evaluate(()=>window.AITUTOR_V9.OfficialMonitor119.summary());
  assert(first.transport==='app-api'&&first.unseenCount===1,'monitor first loads through app API and stores one unseen official notice');

  await page.unroute('**/api/official-monitor**');
  await page.route('**/api/official-monitor**',route=>route.abort());
  await page.route('https://raw.githubusercontent.com/**/official-monitor.json**',route=>route.abort());

  await page.evaluate(()=>window.AITUTOR_V9.OfficialMonitor119.refresh({force:true}));
  await page.waitForFunction(()=>window.AITUTOR_V9.OfficialMonitor119.summary().status==='stale',{timeout:10000});
  const stale=await page.evaluate(()=>window.AITUTOR_V9.OfficialMonitor119.summary());
  assert(stale.transport==='cached-snapshot','monitor falls back to device-cached official snapshot when API and snapshot network both fail');
  assert(stale.unseenCount===1&&stale.items[0]?.id==='offline-test-2027','cached fallback preserves unseen official notice state');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('resources'));
  await page.waitForSelector('.official-monitor-card');
  const text=await page.locator('.official-monitor-card').innerText();
  assert(text.includes('최근 저장본 표시')&&text.includes('새 공고·변경 1건'),'monitor UI clearly marks stale cached data without hiding the official notice');
  assert(text.includes('공고 내용 변경'),'same-notice revision is visibly distinguished from a brand-new notice');
  assert(errors.length===0,'monitor offline fallback produces no browser runtime errors');
  console.log('OFFICIAL_MONITOR_BROWSER_FALLBACK_COMPLETE');
  await ctx.close();
}finally{
  await browser.close();
}
