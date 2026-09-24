import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const viewports=[
  {width:768,height:1024,label:'tablet-portrait'},
  {width:1024,height:768,label:'tablet-landscape'},
  {width:1180,height:820,label:'large-tablet'},
  {width:1280,height:800,label:'small-pc'},
  {width:1366,height:768,label:'common-pc'},
  {width:1440,height:900,label:'wide-pc'}
];
const browser=await chromium.launch({headless:true});
try{
  for(const vp of viewports){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1.25});
    const page=await ctx.newPage();page.setDefaultTimeout(45000);
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store);
    await page.evaluate(()=>{const V=window.AITUTOR_V9,s=V.Store.state,c=V.curriculum.byId['F03-C06'];s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()});
    await page.waitForSelector('.page-study .study-body-desktop .detail-view');

    const layout=await page.locator('.page-study .workspace').evaluate(root=>{
      const rr=root.getBoundingClientRect(),rail=root.querySelector('.study-rail'),main=root.querySelector('.study-mainpane');
      const r=rail?.getBoundingClientRect(),m=main?.getBoundingClientRect();
      return{workspace:rr.width,railDisplay:rail?getComputedStyle(rail).display:'none',railWidth:r?.width||0,mainWidth:m?.width||0};
    });
    assert(layout.railDisplay==='none'||layout.railWidth<2,vp.label+' does not render an obsolete persistent study rail');
    assert(layout.mainWidth>=layout.workspace-3,vp.label+' gives the single study pane the full workspace width without an empty legacy column');

    const tabs=await page.locator('.page-study .concept-head .tabbar').evaluate(root=>({scrollWidth:root.scrollWidth,clientWidth:root.clientWidth,visible:[...root.querySelectorAll('button')].filter(x=>getComputedStyle(x).display!=='none').length}));
    assert(tabs.visible===5,vp.label+' shows all five study tabs');
    assert(tabs.scrollWidth<=tabs.clientWidth+2,vp.label+' study tabs do not horizontally overflow');

    if(vp.width<=1439){
      const flows=await page.locator('.page-study .concept-visual .visual-flow:not(.vertical-org)').evaluateAll(roots=>roots.map(root=>({scrollWidth:root.scrollWidth,clientWidth:root.clientWidth})));
      assert(flows.length>0,vp.label+' exposes the phenomenon visual flow');
      assert(flows.every(x=>x.scrollWidth<=x.clientWidth+2),vp.label+' visual flow fits without horizontal scrolling');
      const bodyFont=await page.locator('.page-study .lesson p').first().evaluate(el=>parseFloat(getComputedStyle(el).fontSize));
      assert(bodyFont>=14.5,vp.label+' keeps study prose at readable tablet/PC size');
    }

    const nav=await page.locator('.page-study .concept-nav').evaluate(el=>{const r=el.getBoundingClientRect();return{height:r.height,bottom:r.bottom,vh:innerHeight}});
    assert(nav.height<=66&&nav.bottom<=nav.vh+1,vp.label+' previous/contents/next bar stays compact and inside viewport');

    if(vp.width<=1180){
      await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='home';V.Store.save();V.App.render()});
      await page.waitForSelector('.page-home .dashboard-home');
      const home=await page.locator('.page-home .dashboard-home').evaluate(root=>{
        const main=root.querySelector('.home-main')?.getBoundingClientRect(),side=root.querySelector('.home-side')?.getBoundingClientRect();
        return{scrollWidth:root.scrollWidth,clientWidth:root.clientWidth,mainBottom:main?.bottom||0,sideTop:side?.top||0,sideDisplay:root.querySelector('.home-side')?getComputedStyle(root.querySelector('.home-side')).display:'none'};
      });
      assert(home.scrollWidth<=home.clientWidth+2,vp.label+' home dashboard has no horizontal overflow');
      assert(home.sideDisplay!=='none',vp.label+' keeps schedule/motivation visible instead of hiding tablet content');
      assert(home.sideTop>=home.mainBottom-2,vp.label+' stacks tablet dashboard secondary cards below the main learning column');

      await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='exam';V.Store.save();V.App.render()});
      await page.waitForSelector('.page-exam .exam-landing');
      const examCols=await page.locator('.page-exam .exam-landing').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
      assert(examCols===1,vp.label+' stacks the exam landing instead of squeezing two desktop columns');
    }
    await ctx.close();
  }

  const ctx=await browser.newContext({viewport:{width:1024,height:768}});
  const page=await ctx.newPage();await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf&&!!window.AITUTOR_V9?.SourceCatalog119);
  const strategy=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,src=String(V.SourcePDF.openPdf),audit=V.SourceCatalog119.audit();
    return{total:audit.total,rangeProxy:src.includes('official-proxy-range'),streamGuard:src.includes('disableStream:proxyRange'),fallback:src.includes('official-proxy-full-cache-fallback')};
  });
  assert(strategy.total===10,'all ten official textbooks remain catalogued');
  assert(strategy.rangeProxy&&strategy.streamGuard,'non-mirrored official PDFs use range-first proxy loading');
  assert(strategy.fallback,'range-first loading retains full-cache fallback');
  await ctx.close();
  console.log('V54_TABLET_PC_PDF_RANGE_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
