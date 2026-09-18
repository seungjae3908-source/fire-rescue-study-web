import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const spec={
  'F07-C05':284,
  'F07-C17':288,
  'F07-C18':284,
  'F07-C19':284,
  'F07-C20':302,
  'F07-C21':287
};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage();
  page.setDefaultTimeout(90000);
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  let proxyFetches=0;
  page.on('response',res=>{if(res.url().includes('study-119-pdf-proxy.vercel.app/api/official-pdf?doc=prevention1')&&(res.status()===200||res.status()===206))proxyFetches++});

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
  if(expected)assert(head===expected,'preview exactHead '+expected);
  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace');

  for(const [id,expectedPage] of Object.entries(spec)){
    await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
    await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
    const truth=await page.evaluate(({id,expectedPage})=>{
      const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.authored[id],r=c?.sourceRanges?.[0];
      return{id,title:c?.title||'',doc:r?.doc||'',from:Number(r?.from)||0,to:Number(r?.to)||0,status:p?.status||'',precision:p?.sourcePrecision||'',source:p?.source||'',expectedPage};
    },{id,expectedPage});
    assert(truth.doc==='prevention1',id+' doc=prevention1');
    assert(truth.from===expectedPage&&truth.to===expectedPage,id+' sourceRange exact page '+expectedPage);
    assert(truth.status==='verified'&&truth.precision==='exact-pdf-page-anchor',id+' truth state verified/exact');

    await page.locator('.book-source [data-source-concept]').click();
    await page.waitForSelector('#pdfEvidence');
    assert(await page.locator('#sourceModal').count()===0,id+' no intermediate source modal');
    assert(await page.locator('#pdfEvidence input[type=file]').count()===0,id+' no user upload');

    await page.waitForFunction(expectedPage=>{
      const root=document.querySelector('#pdfEvidence');
      const label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return Number(root?.dataset.page)===expectedPage&&!!root?.querySelector('canvas')&&/하이라이트\s+[1-9]\d*개/.test(label);
    },expectedPage,{timeout:240000});

    const result=await page.evaluate(()=>{
      const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return{page:Number(root?.dataset.page)||0,pages:Number(root?.dataset.pages)||0,label,canvas:root?.querySelectorAll('canvas').length||0,hits:Number((label.match(/하이라이트\s+(\d+)개/)||[])[1]||0)};
    });
    assert(result.page===expectedPage,id+' opens '+expectedPage+' page');
    assert(result.canvas===1&&result.hits>0,id+' PDF.js canvas + yellow highlight hits='+result.hits);
    console.log('SPRINKLER_LIVE_EVIDENCE',JSON.stringify({truth,result}));
    await page.locator('[data-pdf-close]').click();
    await page.waitForFunction(()=>!document.querySelector('#pdfEvidence'));
  }

  assert(proxyFetches===1,'prevention1 PDF network fetch occurs once and is reused for all six anchors');
  assert(errors.length===0,'mobile runtime errors = 0 '+errors.join(' | '));
  console.log('SPRINKLER_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify({proxyFetches,spec}));
  await ctx.close();
}finally{await browser.close()}
