import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const pages={
  ems:[367,368],
  prevention1:[17,433,434,435,437],
  prevention2:[1,2,3,4,5,6,7,8,9,10,11,12]
};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  for(const [doc,list] of Object.entries(pages)){
    const rows=await page.evaluate(async ({doc,list})=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000}),out=[];
      for(const n of list){
        if(n<1||n>entry.pdf.numPages)continue;
        const pg=await entry.pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        out.push({pdfPage:n,bookPage:V.SourcePDF.bookPage?.(doc,n)||0,text:text.slice(0,9000)});
      }
      return{doc,pages:entry.pdf.numPages,origin:entry.origin,rows:out};
    },{doc,list});
    for(const row of rows.rows)console.log('TARGETED_GAP_PAGE',JSON.stringify({doc:rows.doc,totalPages:rows.pages,origin:rows.origin,...row}));
  }
  console.log('TARGETED_GAP_PAGE_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
