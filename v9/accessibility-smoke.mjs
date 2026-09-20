import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
const snapshot={
  version:'119-official-monitor-snapshot-v1',
  generatedAt:'2026-10-01T00:00:00.000Z',
  targetExamYear:2027,baselineYear:2026,officialOnly:true,healthy:true,
  sourceStatus:[
    {id:'nfa-recruit',label:'소방청 채용·시험',ok:true},
    {id:'nfsa-notice',label:'중앙소방학교 고시·공고',ok:true},
    {id:'nfsa-materials',label:'중앙소방학교 공식교재',ok:true}
  ],
  items:[{
    id:'a11y-monitor',sourceId:'nfa-recruit',sourceLabel:'소방청 채용·시험',
    title:'2027년 소방공무원 채용시험 일정 공고',publishedAt:'2026-10-01',
    url:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=view&cntId=a11y',
    kind:'exam_schedule',meaningful:true,reviewRequired:true,targetYearMatch:true,
    baselineYearMatch:false,noticeYear:2027,fingerprint:'1234567890abcdef1234',changeState:'new'
  }]
};

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/official-monitor**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(snapshot)}));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.app');
  await page.waitForFunction(()=>window.AITUTOR_V9?.OfficialMonitor119?.summary?.().status==='ready');

  assert(await page.locator('html').getAttribute('lang')==='ko','document language is Korean');
  assert(await page.locator('.mobile-nav [aria-current="page"]').count()===1,'mobile navigation exposes exactly one current page');
  assert((await page.locator('.mobile-nav [aria-current="page"]').innerText()).trim()==='홈','home is announced as the initial current page');

  const unnamed=await page.evaluate(()=>{
    const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
    const name=el=>(el.getAttribute('aria-label')||el.getAttribute('title')||el.textContent||'').replace(/\s+/g,' ').trim();
    return [...document.querySelectorAll('button,a[href]')].filter(visible).filter(el=>!name(el)).map(el=>el.outerHTML.slice(0,160));
  });
  assert(unnamed.length===0,'all visible buttons and links have an accessible name');

  const unnamedFields=await page.evaluate(()=>{
    const visible=el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
    const labelled=el=>{
      const id=el.id,explicit=id?[...document.querySelectorAll('label')].some(l=>l.htmlFor===id):false;
      const wrapped=!!el.closest('label');
      return explicit||wrapped||!!el.getAttribute('aria-label')||!!el.getAttribute('aria-labelledby')||!!el.getAttribute('placeholder');
    };
    return [...document.querySelectorAll('input:not([type="hidden"]),select,textarea')].filter(visible).filter(el=>!labelled(el)).map(el=>el.outerHTML.slice(0,160));
  });
  assert(unnamedFields.length===0,'all visible form controls have a label or equivalent accessible name');

  await page.keyboard.press('Tab');
  const firstFocus=await page.evaluate(()=>({tag:document.activeElement?.tagName||'',text:(document.activeElement?.textContent||'').trim(),disabled:!!document.activeElement?.disabled}));
  assert(/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(firstFocus.tag)&&!firstFocus.disabled,'keyboard Tab enters an interactive control');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('resources'));
  await page.waitForSelector('.official-monitor-card');
  assert(await page.locator('.official-monitor-card').getAttribute('aria-live')==='polite','official monitor updates use a polite live region');
  assert(await page.locator('.mobile-nav [aria-current="page"]').count()===0,'hidden More-menu route does not falsely mark a primary mobile tab current');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  assert(await page.locator('.mobile-nav [data-go="study"]').getAttribute('aria-current')==='page','current page semantic follows navigation changes');

  assert(errors.length===0,'accessibility smoke has no browser runtime errors');
  console.log('ACCESSIBILITY_SMOKE_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
