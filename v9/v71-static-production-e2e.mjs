import { chromium } from 'playwright';

const production=process.env.STUDY_119_PRODUCTION_URL||'https://seungjae3908-source.github.io/fire-rescue-study-web/v9/';
const runtimeHeadUrl=process.env.STUDY_119_RUNTIME_HEAD_URL||new URL('runtime-head.json',production).href;
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const DOCS=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

async function rangeProbe(url){
  const r=await fetch(url,{headers:{range:'bytes=0-65535','cache-control':'no-cache'}});
  const h=Object.fromEntries(r.headers.entries());
  const ab=await r.arrayBuffer();
  return{
    status:r.status,
    bytes:ab.byteLength,
    contentRange:h['content-range']||'',
    acceptRanges:h['accept-ranges']||'',
    contentType:h['content-type']||''
  };
}

const runtimeRes=await fetch(runtimeHeadUrl,{headers:{'cache-control':'no-cache'}});
assert(runtimeRes.ok,'static runtime identity HTTP '+runtimeRes.status);
const runtime=await runtimeRes.json();
assert(runtime.ok===true,'static runtime identity ok');
assert(runtime.environment==='production','static runtime identity environment=production');
assert(runtime.transport==='github-pages','static runtime identity transport=github-pages');
if(expected)assert(runtime.sha===expected,'static runtime head matches '+expected);

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1440,height:900}});
  const page=await ctx.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});

  await page.goto(production,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourceCatalog119&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  await page.waitForSelector('.app',{state:'visible',timeout:60000});

  const transport=await page.evaluate(docs=>{
    const V=window.AITUTOR_V9,cfg=window.AITUTOR_V9_CONFIG||{};
    return{
      proxyBase:String(cfg.officialPdfProxyBase||''),
      monitorApiBase:String(cfg.officialMonitorApiBase||''),
      mirrorBase:String(cfg.officialPdfMirrorBase||''),
      mirrorDocs:Array.isArray(cfg.officialPdfMirrorDocs)?cfg.officialPdfMirrorDocs:[],
      rows:docs.map(doc=>{
        const x=V.SourceCatalog119.get(doc);
        return{doc,transport:x?.transport||'',mirrorPdf:x?.mirrorPdf||'',proxyPdf:x?.proxyPdf||'',directPdf:x?.directPdf||''}
      })
    };
  },DOCS);

  assert(transport.proxyBase==='','client has no Vercel PDF proxy dependency');
  assert(transport.monitorApiBase==='','client has no server monitor API dependency');
  assert(transport.mirrorBase==='https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror','official PDF mirror is GitHub Pages');
  assert(transport.mirrorDocs.length===10&&DOCS.every(x=>transport.mirrorDocs.includes(x)),'all 10 official PDFs are configured on static mirror');
  for(const row of transport.rows){
    assert(row.transport==='range-static',row.doc+' uses static range transport');
    assert(!row.proxyPdf,row.doc+' has no proxy fallback URL');
    assert(row.directPdf===row.mirrorPdf&&/^https:\/\/seungjae3908-source\.github\.io\//.test(row.mirrorPdf),row.doc+' direct URL is static mirror');
  }

  const probes={};
  for(const row of transport.rows){
    const p=await rangeProbe(row.mirrorPdf);
    probes[row.doc]=p;
    assert(p.status===206,row.doc+' static mirror supports HTTP 206');
    assert(p.bytes===65536,row.doc+' static mirror returns requested 64KiB range');
    assert(/^bytes\s+0-65535\//i.test(p.contentRange),row.doc+' static mirror returns Content-Range');
    assert(/application\/pdf/i.test(p.contentType),row.doc+' static mirror content type is PDF');
  }

  for(const doc of ['fire1','law2']){
    const opened=await page.evaluate(async doc=>{
      const p=await window.AITUTOR_V9.SourcePDF.openPdf(doc,{timeoutMs:45000});
      return{origin:p.origin,pages:p.pdf?.numPages||0};
    },doc);
    assert(opened.origin==='official-static-range',doc+' opens through static PDF range path');
    assert(opened.pages>0,doc+' PDF parsed successfully');
  }

  const monitor=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    const x=await V.OfficialMonitor119.refresh({force:true});
    return{status:x.status,transport:x.transport,error:x.error,items:x.items?.length||0};
  });
  assert(monitor.transport!=='app-api','official monitor does not depend on app server API');
  assert(['snapshot-primary','cached-snapshot'].includes(monitor.transport),'official monitor uses static snapshot transport');
  assert(monitor.items>=0,'official monitor snapshot parsed');

  assert(errors.length===0,'static production runtime/page errors = 0 '+errors.join(' | '));
  console.log('V71_STATIC_PRODUCTION_ACCEPTANCE_SUCCESS',JSON.stringify({runtime,monitor,probes}));
  await ctx.close();
}finally{
  await browser.close();
}
