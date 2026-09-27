import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await ctx.newPage();page.setDefaultTimeout(120000);
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});
 const out=await page.evaluate(async()=>{
   const V=window.AITUTOR_V9;
   const rows={};
   for(const [doc,pdfPages] of Object.entries({prevention2:[431,437,466,532,533,534,535,536,537,538,539,540,541,542,543,544],prevention1:[482,483,484]})){
     const {pdf}=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
     rows[doc]=[];
     for(const n of pdfPages){
       if(n<1||n>pdf.numPages)continue;
       const pg=await pdf.getPage(n),tc=await pg.getTextContent();
       const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
       rows[doc].push({pdfPage:n,bookPage:V.SourcePDF.bookPage(doc,n),text:text.slice(0,2200)});
     }
   }
   return rows;
 });
 console.log('V70_SOURCE_PAGE_INSPECT',JSON.stringify(out,null,2));
 await ctx.close();
}finally{await browser.close()}
