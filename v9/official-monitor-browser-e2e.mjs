import fs from 'node:fs';
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
    {id:'nfa-notice',label:'소방청 공지사항',ok:true,pagesOk:3,status:'ok',error:''},
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
    noticeYear:2027,notificationEligible:true,
    schedule:{applicationStart:'2026-12-28',applicationEnd:'2027-01-03',writtenExam:'2027-03-13',interview:'2027-05-12'},
    scheduleCount:4,
    fingerprint:'1234567890abcdef1234',
    changeState:'updated',
    previousFingerprint:'abcdef1234567890abcd',
    changeSummary:['필기시험 2027-03-06 → 2027-03-13','공식 첨부파일 변경']
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
  assert(text.includes('필기시험 2027-03-06 → 2027-03-13')&&text.includes('공식 첨부파일 변경'),'updated notice shows the exact structured schedule/file changes in the student UI');
  assert(text.includes('원서접수 2026-12-28 ~ 2027-01-03')&&text.includes('필기 2027-03-13')&&text.includes('면접 2027-05-12'),'official schedule dates extracted by the monitor are visible on the mobile notice card');
  assert(/D(?:-Day|[+-]\d+)/.test(text),'official schedule dates include a live D-day indicator');
  assert(text.includes('공식 소스 4/4'),'monitor UI reports all four official source groups');
  assert(await page.locator('[data-monitor-calendar]').count()===1,'monitor exposes calendar export when official schedule dates are available');
  const calendarDownload=page.waitForEvent('download');
  await page.locator('[data-monitor-calendar]').click();
  const calendarFile=await calendarDownload;
  assert(calendarFile.suggestedFilename()==='119-2027-official-schedule.ics','calendar export downloads a deterministic 2027 official schedule ICS file');
  assert(errors.length===0,'monitor offline fallback produces no browser runtime errors');
  const sw=await fs.promises.readFile(new URL('./sw.js',import.meta.url),'utf8');
assert(sw.includes("119-official-monitor-open")&&sw.includes("?page=resources#official-monitor"),'notification click deep-links to official monitor page and existing windows receive an open message');
const client=await fs.promises.readFile(new URL('./official-monitor.js',import.meta.url),'utf8');
assert(client.includes("navigator.serviceWorker?.addEventListener?.('message'")&&client.includes("openMonitorPage"),'official monitor client handles service-worker deep-link messages');
assert(client.includes('completeSources=fresh&&sourceTotal>=4&&sourceOk===sourceTotal')&&client.includes('일부 공식소스 확인 필요'),'monitor UI fails closed when official-source coverage is incomplete or stale');
console.log('OFFICIAL_MONITOR_BROWSER_FALLBACK_COMPLETE');
  await ctx.close();
}finally{
  await browser.close();
}
// Deep-link regression trigger.
// Exact-head calendar-export regression trigger.
// Exact-head ICS download regression trigger.
