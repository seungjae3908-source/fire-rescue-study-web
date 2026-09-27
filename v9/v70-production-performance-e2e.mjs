import { chromium } from 'playwright';

const production=process.env.STUDY_119_PRODUCTION_URL||'https://fire-rescue-study-web.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const requireLaw2Static=process.env.STUDY_119_REQUIRE_LAW2_STATIC==='1';
const now=()=>Date.now();
const round=n=>Math.round(Number(n)||0);
function assert(v,m){if(!v)throw new Error(m)}
function ratio(n,d){return d?Math.round(n/d*1000)/10:0}
async function runtimeHead(){
  const r=await fetch(new URL('/api/runtime-head',production),{headers:{'cache-control':'no-cache'}});
  assert(r.ok,'RUNTIME_HEAD_HTTP_'+r.status);
  return r.json();
}
async function proxyMeta(doc){
  const r=await fetch(new URL('/api/official-pdf?doc='+encodeURIComponent(doc)+'&meta=1',production),{headers:{'cache-control':'no-cache'}});
  assert(r.ok,'PROXY_META_HTTP_'+doc+'_'+r.status);
  return r.json();
}
async function openApp(browser,{width=1920,height=1080}={}){
  const context=await browser.newContext({viewport:{width,height}});
  const page=await context.newPage();
  const req=[];
  page.on('request',r=>req.push(r.url()));
  const started=now();
  await page.goto(production,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store,{timeout:60000});
  const appReadyMs=now()-started;
  const nav=await page.evaluate(()=>{
    const n=performance.getEntriesByType('navigation')[0];
    return n?{
      responseStart:n.responseStart,
      domContentLoaded:n.domContentLoadedEventEnd,
      loadEventEnd:n.loadEventEnd,
      transferSize:n.transferSize,
      encodedBodySize:n.encodedBodySize
    }:{};
  });
  const origin=new URL(production).origin;
  const sameJs=req.filter(u=>{try{const x=new URL(u);return x.origin===origin&&/\.js(?:\?|$)/.test(x.pathname+x.search)}catch{return false}});
  const boot=[...new Set(sameJs.filter(u=>/\/boot-v69-[^/?]+\.js(?:\?|$)/.test(u)).map(u=>new URL(u).pathname.split('/').pop()))];
  const canonical=sameJs.filter(u=>!new URL(u).pathname.includes('boot-v69-')&&!new URL(u).pathname.endsWith('/sw.js'));
  return{context,page,req,appReadyMs,nav,boot,canonical};
}
async function measurePdf(browser,key){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const chunks=[];
  page.on('response',async res=>{
    if(res.url().includes('official-pdf?doc='+key)){
      const h=await res.allHeaders().catch(()=>({}));
      chunks.push({
        status:res.status(),
        length:Number(h['content-length']||0),
        range:h['content-range']||''
      });
    }
  });
  await page.goto(production,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.render,{timeout:60000});
  const result=await page.evaluate(async key=>{
    const host=document.createElement('div');host.style.width='1000px';host.style.position='fixed';host.style.left='0';host.style.top='0';host.style.zIndex='-1';document.body.appendChild(host);
    const t=performance.now();
    const out=await window.AITUTOR_V9.SourcePDF.render(key,1,host,[],{timeoutMs:45000,zoom:1});
    const ms=performance.now()-t;
    host.remove();
    return{ms,origin:out.origin,pages:out.pages,cssWidth:out.cssWidth,pixelWidth:out.pixelWidth};
  },key);
  await context.close();
  return{
    renderMs:round(result.ms),origin:result.origin,pages:result.pages,
    requestCount:chunks.length,rangeBytes:chunks.reduce((s,x)=>s+x.length,0),
    statuses:chunks.map(x=>x.status),ranges:chunks.map(x=>x.range).filter(Boolean).slice(0,12)
  };
}
async function widthOf(page,selector){
  await page.waitForSelector(selector,{timeout:10000});
  return page.locator(selector).first().evaluate(el=>{
    const r=el.getBoundingClientRect(),p=document.querySelector('.main .page')?.getBoundingClientRect();
    return{width:r.width,viewport:innerWidth,available:p?.width||innerWidth}
  });
}
async function rangeProbe(url){
  const r=await fetch(url,{headers:{range:'bytes=0-65535','cache-control':'no-cache'}});
  const h=Object.fromEntries(r.headers.entries());
  const ab=await r.arrayBuffer();
  return{status:r.status,bytes:ab.byteLength,contentRange:h['content-range']||'',acceptRanges:h['accept-ranges']||'',contentLength:h['content-length']||'',contentType:h['content-type']||''}
}
const browser=await chromium.launch({headless:true});
try{
  const runtime=await runtimeHead();
  if(expected)assert(runtime.sha===expected,'PRODUCTION_HEAD_MISMATCH '+runtime.sha+' != '+expected);
  assert(runtime.environment==='production','PRODUCTION_ENVIRONMENT_MISMATCH');

  const cold=await openApp(browser,{width:1920,height:1080});
  const {page}=cold;
  assert(cold.boot.length===11,'BOOT_BUNDLE_COUNT_'+cold.boot.length);
  assert(cold.canonical.length===0,'UNBUNDLED_INITIAL_JS_'+JSON.stringify(cold.canonical));

  const questionCold=await page.evaluate(async()=>{
    const t=performance.now();await window.AITUTOR_V9.App.go('bank');return performance.now()-t;
  });
  await page.waitForSelector('.page-bank .question-card',{timeout:30000});
  const bankWidth=await widthOf(page,'.page-bank .question-card');
  await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('home')});
  const questionWarm=await page.evaluate(async()=>{
    const t=performance.now();await window.AITUTOR_V9.App.go('bank');return performance.now()-t;
  });

  const widths={};
  widths.bank=bankWidth;
  await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('settings')});widths.settings=await widthOf(page,'.settings-page');
  await page.evaluate(async()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F03-C06'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='core';V.Store.save();V.App.render()});
  widths.studyCore=await widthOf(page,'.page-study .lesson');
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  widths.studyDetail=await widthOf(page,'.page-study .lesson');
  await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('stats')});widths.stats=await widthOf(page,'.page-stats .stats-page');
  await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('notes')});widths.notes=await widthOf(page,'.notes-page');
  await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('resources')});widths.resources=await widthOf(page,'.resources-119');

  const widthPct=Object.fromEntries(Object.entries(widths).map(([k,v])=>[k,{viewportPct:ratio(v.width,v.viewport),availablePct:ratio(v.width,v.available),width:round(v.width)}]));
  await cold.context.close();

  const [law2Meta,fire1,law2]=requireLaw2Static
    ?[null,...await Promise.all([measurePdf(browser,'fire1'),measurePdf(browser,'law2')])]
    :await Promise.all([proxyMeta('law2'),measurePdf(browser,'fire1'),measurePdf(browser,'law2')]);

  const proxyRangeProbe=requireLaw2Static?null:{
    sameOrigin:await rangeProbe(new URL('/api/official-pdf?doc=law2',production)),
    external:await rangeProbe('https://study-119-pdf-proxy.vercel.app/api/official-pdf?doc=law2')
  };
  const metrics={
    exactProductionHead:runtime.sha,
    proxyRangeProbe,
    cold:{
      appReadyMs:round(cold.appReadyMs),
      domContentLoadedMs:round(cold.nav.domContentLoaded),
      loadEventMs:round(cold.nav.loadEventEnd),
      sameOriginInitialJs:cold.boot.length+cold.canonical.length,
      bootBundleCount:cold.boot.length,
      canonicalInitialJs:cold.canonical.length
    },
    questions:{coldMs:round(questionCold),warmMs:round(questionWarm)},
    pdf:{law2Meta,fire1,law2},
    width1920:widthPct
  };
  console.log('V70_PRODUCTION_PERFORMANCE',JSON.stringify(metrics));

  assert(questionCold<3000,'QUESTION_COLD_TOO_SLOW_'+round(questionCold));
  const law2NeedsStaticMirror=law2.renderMs>=10000||law2.origin!=='official-static-range';
  console.log('V70_LAW2_MIRROR_REQUIRED',JSON.stringify({required:law2NeedsStaticMirror,renderMs:law2.renderMs,origin:law2.origin,rangeProbe:proxyRangeProbe}));
  if(requireLaw2Static){
    assert(law2.renderMs<10000,'LAW2_STATIC_RENDER_TOO_SLOW_'+law2.renderMs);
    assert(law2.origin==='official-static-range','LAW2_NOT_STATIC_RANGE_'+law2.origin);
  }

  assert(fire1.origin==='official-static-range','FIRE1_NOT_STATIC_RANGE_'+fire1.origin);
  assert(widthPct.bank.viewportPct>=55,'BANK_1920_TOO_NARROW_'+widthPct.bank.viewportPct);
  assert(widthPct.studyCore.viewportPct>=58,'STUDY_1920_TOO_NARROW_'+widthPct.studyCore.viewportPct);
  assert(widthPct.settings.viewportPct>=60,'SETTINGS_1920_TOO_NARROW_'+widthPct.settings.viewportPct);
  console.log('V70_PRODUCTION_PERFORMANCE_ACCEPTANCE_SUCCESS');
}finally{
  await browser.close();
}
