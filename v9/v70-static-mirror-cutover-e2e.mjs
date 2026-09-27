import { chromium } from 'playwright';

const url=process.env.STUDY_119_V70_URL||'http://127.0.0.1:4173/v9/index.html';
const assert=(v,m)=>{if(!v)throw new Error(m)};
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  const responses=[];
  page.on('response',async r=>{
    if(r.url().includes('/official-pdf-mirror/law2.pdf')){
      const h=await r.allHeaders().catch(()=>({}));
      responses.push({
        status:r.status(),
        range:h['content-range']||'',
        acceptRanges:h['accept-ranges']||'',
        length:Number(h['content-length']||0)
      });
    }
  });
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.render&&!!window.AITUTOR_V9?.SourceCatalog119?.get,{timeout:60000});

  const catalog=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.SourceCatalog119.get('law2');
    return{
      transport:c?.transport||'',
      mirrorPdf:c?.mirrorPdf||'',
      proxyPdf:c?.proxyPdf||'',
      policy:V.SourceCatalog119.policy||{}
    };
  });
  assert(catalog.transport==='range-static','LAW2_TRANSPORT_'+catalog.transport);
  assert(catalog.mirrorPdf.includes('seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror/law2.pdf'),'LAW2_MIRROR_URL_'+catalog.mirrorPdf);
  assert(!!catalog.proxyPdf,'LAW2_PROXY_FALLBACK_MISSING');

  const availability=await page.evaluate(()=>window.AITUTOR_V9.SourcePDF.availability('law2'));
  assert(availability.mirror===true&&availability.range===true&&availability.rangeProxy===false,'LAW2_AVAILABILITY_NOT_STATIC_RANGE_'+JSON.stringify(availability));

  const result=await page.evaluate(async()=>{
    const host=document.createElement('div');
    host.style.width='1000px';host.style.position='fixed';host.style.left='0';host.style.top='0';host.style.zIndex='-1';
    document.body.appendChild(host);
    const t=performance.now();
    const out=await window.AITUTOR_V9.SourcePDF.render('law2',1,host,[],{timeoutMs:30000,zoom:1});
    const ms=performance.now()-t;
    const canvas=host.querySelector('canvas');
    const measured={ms,origin:out.origin,pages:out.pages,cssWidth:out.cssWidth,pixelWidth:out.pixelWidth,canvasWidth:canvas?.width||0,canvasHeight:canvas?.height||0};
    host.remove();
    return measured;
  });
  console.log('V70_LAW2_STATIC_RENDER',JSON.stringify({catalog,availability,result,responses}));

  assert(result.origin==='official-static-range','LAW2_RENDER_ORIGIN_'+result.origin);
  assert(result.ms<10000,'LAW2_STATIC_RENDER_TOO_SLOW_'+Math.round(result.ms));
  assert(result.pages===656,'LAW2_PAGE_COUNT_'+result.pages);
  assert(result.canvasWidth>0&&result.canvasHeight>0,'LAW2_CANVAS_EMPTY');
  assert(responses.some(x=>x.status===206&&x.range&&x.acceptRanges),'LAW2_BROWSER_NO_206_RANGE_'+JSON.stringify(responses));


  const tailAudit=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    async function scan(doc,needles){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:60000}),rows=[];
      const from=Math.max(1,entry.pdf.numPages-24);
      for(let n=from;n<=entry.pdf.numPages;n++){
        const pg=await entry.pdf.getPage(n),tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        const norm=text.toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
        const hits=needles.filter(q=>norm.includes(String(q).toLowerCase().replace(/[^0-9a-z가-힣]/g,'')));
        rows.push({pdfPage:n,bookPage:V.SourcePDF.bookPage(doc,n),hits,text:text.slice(0,420)});
      }
      return{doc,pages:entry.pdf.numPages,rows};
    }
    return{
      prevention1:await scan('prevention1',['연결송수','제연','소화활동','무선통신','연결살수']),
      prevention2:await scan('prevention2',['위험물','소화원칙','소화방법','특수현상','금수성'])
    };
  });
  console.log('V70_TAIL_PAGE_AUDIT',JSON.stringify(tailAudit));

  console.log('V70_LAW2_STATIC_CUTOVER_SUCCESS');
  await context.close();
}finally{
  await browser.close();
}
