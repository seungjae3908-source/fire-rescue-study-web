import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const primary={
  'F05-C01':{doc:'prevention2',page:345},
  'F05-C02':{doc:'prevention2',page:385},
  'F05-C03':{doc:'prevention2',page:407},
  'F05-C04':{doc:'prevention2',page:428},
  'F05-C05':{doc:'prevention2',page:449},
  'F05-C06':{doc:'prevention2',page:496},
  'F05-C07':{doc:'prevention2',page:523},
  'F05-C08':{doc:'fire1',page:319}
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
  const proxyFetches={prevention2:0,fire1:0};
  page.on('response',res=>{
    const u=res.url();
    for(const doc of Object.keys(proxyFetches)){
      if(u.includes('study-119-pdf-proxy.vercel.app/api/official-pdf?doc='+doc)&&(res.status()===200||res.status()===206))proxyFetches[doc]++;
    }
  });

  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
  if(expected)assert(head===expected,'preview exactHead '+expected);
  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace');

  async function secondaryRender(id,doc,pageNo){
    const out=await page.evaluate(async ({id,doc,pageNo})=>{
      const V=window.AITUTOR_V9,p=V.contentPacks.get(id);
      const queries=[p?.summary,...(p?.must||[]),...(p?.detail||[])].filter(Boolean).slice(0,8);
      const host=document.createElement('div');host.style.width='1000px';host.style.position='fixed';host.style.left='-5000px';document.body.appendChild(host);
      try{
        const r=await V.SourcePDF.render(doc,pageNo,host,queries);
        return{page:r.page,pages:r.pages,hits:r.hits,canvas:host.querySelectorAll('canvas').length};
      }finally{host.remove()}
    },{id,doc,pageNo});
    assert(out.page===pageNo&&out.canvas===1&&out.hits>0,id+' secondary evidence '+doc+' page '+pageNo+' renders with highlights='+out.hits);
    return out;
  }

  for(const id of ['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']){
    const spec=primary[id];
    await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
    await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
    const truth=await page.evaluate(({id,spec})=>{
      const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.authored[id],ranges=c?.sourceRanges||[];
      return{id,title:c?.title||'',ranges,status:p?.status||'',precision:p?.sourcePrecision||'',source:p?.source||'',spec};
    },{id,spec});
    assert(truth.ranges[0]?.doc===spec.doc&&Number(truth.ranges[0]?.from)===spec.page,id+' primary exact source '+spec.doc+' '+spec.page);
    assert(truth.status==='verified'&&truth.precision==='exact-pdf-page-anchor',id+' truth state verified/exact');

    await page.locator('.book-source [data-source-concept]').click();
    await page.waitForSelector('#pdfEvidence');
    assert(await page.locator('#sourceModal').count()===0,id+' no intermediate source modal');
    assert(await page.locator('#pdfEvidence input[type=file]').count()===0,id+' no user upload');
    await page.waitForFunction(expectedPage=>{
      const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return Number(root?.dataset.page)===expectedPage&&!!root?.querySelector('canvas')&&/하이라이트\s+[1-9]\d*개/.test(label);
    },spec.page,{timeout:240000});
    const result=await page.evaluate(()=>{
      const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
      return{page:Number(root?.dataset.page)||0,pages:Number(root?.dataset.pages)||0,label,hits:Number((label.match(/하이라이트\s+(\d+)개/)||[])[1]||0),canvas:root?.querySelectorAll('canvas').length||0};
    });
    assert(result.page===spec.page&&result.canvas===1&&result.hits>0,id+' PDF.js exact page '+spec.page+' highlights='+result.hits);
    console.log('HAZMAT_LIVE_EVIDENCE',JSON.stringify({truth,result}));
    await page.locator('[data-pdf-close]').click();
    await page.waitForFunction(()=>!document.querySelector('#pdfEvidence'));

    if(id==='F05-C01'){
      const ranges=truth.ranges;
      assert(ranges.length===2&&ranges[1]?.doc==='prevention2'&&Number(ranges[1]?.from)===385,'F05-C01 keeps second classification page 385');
      const secondary=await secondaryRender(id,'prevention2',385);
      console.log('HAZMAT_SECONDARY_EVIDENCE',JSON.stringify({id,doc:'prevention2',page:385,secondary}));
    }
  }

  const c08Truth=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F05-C08'],p=V.contentPacks.authored['F05-C08'];
    return{ranges:c?.sourceRanges||[],status:p?.status||'',precision:p?.sourcePrecision||'',source:p?.source||''};
  });
  assert(c08Truth.ranges.length===2&&c08Truth.ranges[0]?.doc==='fire1'&&Number(c08Truth.ranges[0]?.from)===319&&c08Truth.ranges[1]?.doc==='prevention2'&&Number(c08Truth.ranges[1]?.from)===536,'F05-C08 preserves special-phenomenon + suppression dual source');
  const c08Secondary=await secondaryRender('F05-C08','prevention2',536);
  console.log('HAZMAT_SECONDARY_EVIDENCE',JSON.stringify({id:'F05-C08',doc:'prevention2',page:536,secondary:c08Secondary}));

  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F05-C08'));
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F05-C08');
  await page.locator('.book-source [data-source-concept]').click();
  await page.waitForSelector('#pdfEvidence');
  await page.waitForFunction(()=>{
    const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
    return Number(root?.dataset.page)===319&&!!root?.querySelector('canvas')&&/하이라이트\s+[1-9]\d*개/.test(label);
  },null,{timeout:240000});
  const c08Primary=await page.evaluate(()=>{
    const root=document.querySelector('#pdfEvidence'),label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
    return{page:Number(root?.dataset.page)||0,pages:Number(root?.dataset.pages)||0,label,hits:Number((label.match(/하이라이트\s+(\d+)개/)||[])[1]||0),canvas:root?.querySelectorAll('canvas').length||0};
  });
  assert(c08Primary.page===319&&c08Primary.canvas===1&&c08Primary.hits>0,'F05-C08 fire1 page 319 renders special phenomenon with highlights='+c08Primary.hits);
  await page.locator('[data-pdf-close]').click();

  assert(proxyFetches.prevention2===1,'prevention2 PDF fetched once and reused across hazardous-material evidence');
  assert(proxyFetches.fire1===1,'fire1 PDF fetched once for F05-C08 special phenomenon');
  assert(errors.length===0,'mobile runtime errors = 0 '+errors.join(' | '));
  console.log('HAZMAT_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify({proxyFetches,primary,c08Primary,c08Secondary}));
  await ctx.close();
}finally{await browser.close()}
