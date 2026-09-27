import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m,meta={}){if(!v)throw new Error(m+' '+JSON.stringify(meta));console.log('PASS',m,JSON.stringify(meta))}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf&&!!window.AITUTOR_V9?.curriculum?.byId,{timeout:60000});
  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    const pageText=async(doc,bookPage)=>{
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      const pdfPage=V.SourcePDF.pdfPage(doc,bookPage);
      const pg=await entry.pdf.getPage(pdfPage);
      const tc=await pg.getTextContent();
      return{doc,bookPage,pdfPage,pages:entry.pdf.numPages,text:(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim()};
    };
    return{
      f05Ranges:(V.curriculum.byId['F05-C08']?.sourceRanges||[]).map(x=>({doc:x.doc,from:Number(x.from),to:Number(x.to)})),
      f07Ranges:(V.curriculum.byId['F07-C15']?.sourceRanges||[]).map(x=>({doc:x.doc,from:Number(x.from),to:Number(x.to)})),
      p2_524:await pageText('prevention2',524),
      p2_525:await pageText('prevention2',525),
      p1_468:await pageText('prevention1',468),
      p1_469:await pageText('prevention1',469)
    };
  });
  const f05=result.f05Ranges.find(x=>x.doc==='prevention2');
  const f07=result.f07Ranges.find(x=>x.doc==='prevention1'&&x.from>=460);
  assert(f05?.from===524&&f05?.to===525,'F05-C08 uses corrected prevention2 book-page range 524~525',{ranges:result.f05Ranges});
  assert(!result.f05Ranges.some(x=>x.from===536||x.to===536),'F05-C08 no longer stores physical PDF page 536 as a book page',{ranges:result.f05Ranges});
  assert(/화재/.test(result.p2_524.text)&&/폼/.test(result.p2_524.text)&&/물과 반응/.test(result.p2_524.text),'prevention2 524 directly supports hazardous-material fire suppression decisions',{text:result.p2_524.text.slice(0,500)});
  assert(/물분무/.test(result.p2_525.text)&&/물과 반응/.test(result.p2_525.text)&&/탱크/.test(result.p2_525.text),'prevention2 525 continues water/reactivity/tank response guidance',{text:result.p2_525.text.slice(0,500)});

  assert(f07?.from===468&&f07?.to===469,'F07-C15 uses corrected prevention1 book-page range 468~469',{ranges:result.f07Ranges});
  assert(!result.f07Ranges.some(x=>x.from===482||x.to===482),'F07-C15 no longer stores physical PDF page 482 as a book page',{ranges:result.f07Ranges});
  assert(/제연설비/.test(result.p1_468.text)&&/연결송수관설비/.test(result.p1_468.text),'prevention1 468 directly supports smoke-control and fire-department water-supply systems',{text:result.p1_468.text.slice(0,500)});
  assert(/무선통신보조설비/.test(result.p1_469.text)&&/비상콘센트설비/.test(result.p1_469.text),'prevention1 469 directly supports radio and emergency-outlet systems',{text:result.p1_469.text.slice(0,500)});
  console.log('V70_SOURCE_ANCHOR_RECONCILE_SUCCESS',JSON.stringify({f05:result.f05Ranges,f07:result.f07Ranges}));
  await ctx.close();
}finally{
  await browser.close();
}
