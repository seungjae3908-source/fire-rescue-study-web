import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf('ems',{timeoutMs:120000}),pdf=entry.pdf,rows=[];
    const wanted=new Set([365,366,367,368,374,375,376]);
    for(let n=1;n<=pdf.numPages;n++){
      const book=V.SourcePDF.bookPage?.('ems',n)||0;
      if(!wanted.has(book))continue;
      const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      rows.push({bookPage:book,pdfPage:n,text});
    }
    return rows;
  });
  for(const row of result)console.log('V45_BLOCKER_SOURCE_RECONCILE',JSON.stringify(row));
  if(result.length!==7)throw new Error('V45_BLOCKER_SOURCE_PAGE_COUNT '+result.length);
  await ctx.close();
  console.log('V45_BLOCKER_SOURCE_RECONCILE_COMPLETE');
}finally{await browser.close()}
