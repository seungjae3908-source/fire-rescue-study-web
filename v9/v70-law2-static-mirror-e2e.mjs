import { chromium } from 'playwright';

const base=process.env.STUDY_119_V70_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(60000);
  const ranges=[];
  page.on('response',async res=>{
    if(!res.url().includes('/official-pdf-mirror/law2.pdf'))return;
    const h=await res.allHeaders().catch(()=>({}));
    ranges.push({
      status:res.status(),
      contentRange:h['content-range']||'',
      acceptRanges:h['accept-ranges']||'',
      contentLength:Number(h['content-length']||0)
    });
  });
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.render&&!!window.AITUTOR_V9?.SourceCatalog119);
  const catalog=await page.evaluate(()=>{
    const c=window.AITUTOR_V9.SourceCatalog119.get('law2');
    return{transport:c?.transport||'',mirrorPdf:c?.mirrorPdf||'',proxyPdf:c?.proxyPdf||''}
  });
  assert(catalog.transport==='range-static','law2 catalog uses range-static transport');
  assert(catalog.mirrorPdf.includes('github.io/fire-rescue-study-web/official-pdf-mirror/law2.pdf'),'law2 catalog points at the deployed Pages mirror');
  assert(!!catalog.proxyPdf,'law2 keeps the official proxy fallback');

  const result=await page.evaluate(async()=>{
    const host=document.createElement('div');
    host.style.width='1000px';host.style.position='fixed';host.style.left='0';host.style.top='0';host.style.zIndex='-1';
    document.body.appendChild(host);
    const t=performance.now();
    const out=await window.AITUTOR_V9.SourcePDF.render('law2',1,host,[],{timeoutMs:30000,zoom:1});
    const ms=performance.now()-t;
    const canvas=host.querySelector('canvas');
    const pixels=canvas?{width:canvas.width,height:canvas.height}:{width:0,height:0};
    host.remove();
    return{ms,origin:out.origin,pages:out.pages,pixels}
  });
  const metrics={
    renderMs:Math.round(result.ms),
    origin:result.origin,
    pages:result.pages,
    ranges
  };
  console.log('V70_LAW2_STATIC_BRANCH_METRICS',JSON.stringify(metrics));
  assert(result.origin==='official-static-range','law2 renders from the static range mirror');
  assert(result.ms<10000,'law2 first-page static render stays under 10 seconds');
  assert(result.pages>=600,'law2 full page count remains available from ranged loading');
  assert(result.pixels.width>0&&result.pixels.height>0,'law2 first page produces a real canvas');
  assert(ranges.some(x=>x.status===206&&/^bytes\s+\d+-\d+\/\d+/i.test(x.contentRange)),'browser receives real HTTP 206 Content-Range responses from Pages');
  await ctx.close();
  console.log('V70_LAW2_STATIC_BRANCH_ACCEPTANCE_SUCCESS');
}finally{
  await browser.close();
}
