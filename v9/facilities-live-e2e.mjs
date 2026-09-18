import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const spec={
  'F07-C01':17,
  'F07-C02':207,
  'F07-C03':247,
  'F07-C04':273,
  'F07-C06':321,
  'F07-C07':328,
  'F07-C08':347,
  'F07-C09':432,
  'F07-C10':415,
  'F07-C11':23,
  'F07-C12':18,
  'F07-C13':465,
  'F07-C14':201,
  'F07-C15':167
};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage();page.setDefaultTimeout(90000);
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  let proxyFetches=0;
  page.on('response',res=>{
    if(res.url().includes('study-119-pdf-proxy.vercel.app/api/official-pdf?doc=prevention1')&&(res.status()===200||res.status()===206))proxyFetches++;
  });

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
      const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.authored[id],rows=c?.sourceRanges||[];
      return{id,title:c?.title||'',rows,status:p?.status||'',precision:p?.sourcePrecision||'',source:p?.source||'',expectedPage};
    },{id,expectedPage});
    assert(truth.rows.length>=1&&truth.rows[0]?.doc==='prevention1',id+' first source=prevention1');
    assert(Number(truth.rows[0]?.from)===expectedPage,id+' exact first page '+expectedPage);
    assert(truth.status==='verified'&&truth.precision==='exact-pdf-page-anchor',id+' truth state verified/exact');

    await page.locator('.book-source [data-source-concept]').click();
    await page.waitForSelector('#pdfEvidence');
    assert(await page.locator('#sourceModal').count()===0,id+' no intermediate source modal');
    assert(await page.locator('#pdfEvidence input[type=file]').count()===0,id+' no user upload');

    await page.waitForFunction(expectedPage=>{
      const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return Number(root?.dataset.page)===expectedPage&&!!root?.querySelector('canvas')&&/하이라이트\s+[1-9]\d*개/.test(label);
    },expectedPage,{timeout:240000});

    const result=await page.evaluate(()=>{
      const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return{page:Number(root?.dataset.page)||0,pages:Number(root?.dataset.pages)||0,label,canvas:root?.querySelectorAll('canvas').length||0,hits:Number((label.match(/하이라이트\s+(\d+)개/)||[])[1]||0)};
    });
    assert(result.page===expectedPage,id+' opens '+expectedPage+' page');
    assert(result.canvas===1&&result.hits>0,id+' PDF.js + yellow highlight hits='+result.hits);
    console.log('FACILITY_LIVE_EVIDENCE',JSON.stringify({truth,result}));
    await page.locator('[data-pdf-close]').click();
    await page.waitForFunction(()=>!document.querySelector('#pdfEvidence'));
  }

  const multi=await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    return{
      c06:(V.curriculum.byId['F07-C06']?.sourceRanges||[]).map(r=>({doc:r.doc,from:Number(r.from),to:Number(r.to)})),
      c15:(V.curriculum.byId['F07-C15']?.sourceRanges||[]).map(r=>({doc:r.doc,from:Number(r.from),to:Number(r.to)}))
    };
  });
  assert(multi.c06.length===2&&[321,333].every((n,i)=>multi.c06[i]?.doc==='prevention1'&&multi.c06[i]?.from===n),'F07-C06 preserves both simple/ESFR exact pages');
  assert(multi.c15.length===4&&[167,174,433,482].every((n,i)=>multi.c15[i]?.doc==='prevention1'&&multi.c15[i]?.from===n),'F07-C15 preserves four firefighter-support exact pages');
  assert(proxyFetches===1,'prevention1 PDF fetched once and reused across fourteen facility concepts');
  assert(errors.length===0,'facility mobile runtime errors = 0 '+errors.join(' | '));
  console.log('FACILITY_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify({proxyFetches,spec,multi}));
  await ctx.close();
}finally{await browser.close()}
