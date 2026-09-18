import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'9aeaadd12b01b36c2addda29860133d4296b9877';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r))}
function observe(page){const errors=[];page.on('pageerror',e=>errors.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});page.on('requestfailed',r=>errors.push('requestfailed:'+r.url()+' '+(r.failure()?.errorText||'')));return errors}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [{width:390,height:844,isMobile:true},{width:1440,height:900,isMobile:false}]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile});
    const page=await ctx.newPage(),errors=observe(page);
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
    await page.waitForSelector('.app',{state:'visible',timeout:60000});
    assert(await page.locator('.boot').count()===0,'boot screen removed '+vp.width);
    const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
    assert(head===expected,'runtime head matches '+expected);
    await noX(page,'home '+vp.width);

    await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
    await page.waitForSelector('.workspace',{timeout:30000});
    const tabCount=vp.isMobile?await page.locator('.book-jumpbar button').count():await page.locator('.tabbar button').count();
    assert(tabCount===4,'study exposes four learning tabs '+vp.width);
    await noX(page,'study '+vp.width);

    if(vp.isMobile){
      await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
      await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
      await page.locator('.book-jumpbar [data-study-tab="detail"]').click();
      await page.waitForSelector('.book-section .detail-view');
      assert(await page.locator('.book-section .detail-view>.lead').count()===0,'detail summary is not duplicated above structured content');
      const bodyHeight=await page.locator('.study-body-mobile').evaluate(el=>el.clientHeight);
      assert(bodyHeight>=320,'mobile learning body keeps useful reading height');

      await page.locator('.book-jumpbar [data-study-tab="source"]').click();
      await page.waitForSelector('.study-body-mobile .source-only [data-source-concept]');
      const started=Date.now();
      await page.locator('.study-body-mobile .source-only [data-source-concept]').click();
      await page.waitForSelector('#pdfEvidence canvas',{timeout:180000});
      const firstMs=Date.now()-started;
      const source=await page.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,a=await V.SourcePDF.availability(key),p=await V.SourcePDF.openPdf(key),catalog=V.SourceCatalog119.get(key);return{local:a.local,origin:p.origin,key,transport:catalog.transport,url:catalog.directPdf}});
      assert(source.transport==='range-static'&&source.origin==='official-static-range','mirrored official textbook uses range-capable static source instead of the slow dynamic proxy');
      const closeBox=await page.locator('#pdfEvidence [data-pdf-close]').boundingBox();
      assert(closeBox&&closeBox.height<60,'PDF close button remains compact');
      await page.locator('#pdfEvidence [data-pdf-close]').click();

      const reopened=Date.now();
      await page.locator('.study-body-mobile .source-only [data-source-concept]').click();
      await page.waitForSelector('#pdfEvidence canvas',{timeout:30000});
      const secondMs=Date.now()-reopened;
      assert(secondMs<Math.max(8000,firstMs),'second textbook open reuses the cached PDF');
      await page.locator('#pdfEvidence [data-pdf-close]').click();

      for(const doc of ['fire1','fire2','ems']){
        const id=await page.evaluate(doc=>window.AITUTOR_V9.curriculum.concepts.find(c=>c.sourceRanges?.[0]?.doc===doc)?.id||'',doc);
        assert(!!id,'found concept backed by mirrored '+doc+' textbook');
        await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
        await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
        await page.locator('.book-jumpbar [data-study-tab="source"]').click();
        await page.locator('.study-body-mobile .source-only [data-source-concept]').click();
        await page.waitForSelector('#pdfEvidence canvas',{timeout:45000});
        const info=await page.evaluate(async()=>{const V=window.AITUTOR_V9,id=V.Store.state.conceptId,key=V.curriculum.byId[id].sourceRanges[0].doc,p=await V.SourcePDF.openPdf(key),cat=V.SourceCatalog119.get(key);return{key,origin:p.origin,transport:cat.transport,url:cat.directPdf}});
        assert(info.key===doc&&info.transport==='range-static'&&info.origin==='official-static-range','mirrored '+doc+' textbook opens from static range source');
        await page.locator('#pdfEvidence [data-pdf-close]').click();
      }
    }

    await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
    await page.waitForSelector('.exam-start',{timeout:30000});
    const exam=await page.locator('.exam-start').innerText();
    assert(exam.includes('65문항 · 65분')&&exam.includes('25문항')&&exam.includes('40문항'),'exam format visible '+vp.width);

    assert(errors.length===0,'runtime/request errors = 0 '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  console.log('V9_LIVE_STUDENT_UX_SMOKE_SUCCESS');
}finally{await browser.close()}
