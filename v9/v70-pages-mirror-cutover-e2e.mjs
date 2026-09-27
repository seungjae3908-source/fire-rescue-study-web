import { chromium } from 'playwright';

const base=process.env.STUDY_119_V70_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const round=n=>Math.round(Number(n)||0);

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const responses=[];
  page.on('response',async r=>{
    if(r.url().includes('/official-pdf-mirror/')){
      const h=await r.allHeaders().catch(()=>({}));
      responses.push({url:r.url(),status:r.status(),length:Number(h['content-length']||0),range:h['content-range']||'',accept:h['accept-ranges']||''});
    }
  });
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.render&&!!window.AITUTOR_V9?.SourceCatalog119,{timeout:60000});

  const strategy=await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    const keys=['prevention1','prevention2','law1','law2','law3','law4','law5'];
    return keys.map(key=>{const c=V.SourceCatalog119.get(key);return{key,transport:c?.transport,mirrorPdf:c?.mirrorPdf,proxyPdf:c?.proxyPdf}});
  });
  assert(strategy.every(x=>x.transport==='range-static'),'all seven law/prevention textbooks prefer range-static');
  assert(strategy.every(x=>x.mirrorPdf?.includes('github.io/fire-rescue-study-web/official-pdf-mirror/')),'all seven use the verified GitHub Pages mirror');
  assert(strategy.every(x=>x.proxyPdf),'all seven retain the official proxy fallback');

  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    const host=document.createElement('div');host.style.width='1000px';document.body.appendChild(host);
    const t=performance.now();
    const out=await V.SourcePDF.render('law2',1,host,[],{timeoutMs:30000,zoom:1});
    const ms=performance.now()-t;
    host.remove();
    return{ms,origin:out.origin,pages:out.pages,cssWidth:out.cssWidth,pixelWidth:out.pixelWidth};
  });
  const law2=responses.filter(x=>x.url.includes('/law2.pdf'));
  console.log('V70_LAW2_PAGES_RENDER',JSON.stringify({renderMs:round(result.ms),origin:result.origin,pages:result.pages,responses:law2}));
  assert(result.origin==='official-static-range','law2 renders from the static range path');
  assert(result.pages>600,'law2 page count is complete');
  assert(result.ms<10000,'law2 first page renders under 10 seconds');
  assert(law2.some(x=>x.status===206),'law2 browser flow receives HTTP 206');
  assert(law2.some(x=>x.range),'law2 browser flow receives Content-Range');
  assert(law2.every(x=>!x.length||x.length<5438067),'law2 first-page flow never transfers the full 5.44MB PDF');
  console.log('V70_PAGES_MIRROR_CUTOVER_ACCEPTANCE_SUCCESS');
}finally{
  await browser.close();
}
