import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targetIds=['E21-C02','E21-C05','E21-C06','E21-C07','E21-C08','E23-C01','E23-C03'];
const extraReviewPages={'E21-C02':[366,367,368],'E21-C05':[376]};
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage();page.setDefaultTimeout(120000);
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF&&!!window.AITUTOR_V9?.curriculum?.byId,{timeout:60000});
 for(const id of targetIds){
  const result=await page.evaluate(async id=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.get(id);const ranges=(c?.sourceRanges||[]).filter(r=>r?.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));if(!ranges.length)throw new Error('V45_BATCH8_NO_NUMERIC_SOURCE_RANGE '+id);const rows=[];for(const r of ranges){const entry=await V.SourcePDF.openPdf(r.doc,{timeoutMs:120000}),pdf=entry.pdf;for(let n=1;n<=pdf.numPages;n++){const book=V.SourcePDF.bookPage?.(r.doc,n)||0;const extra=(extraReviewPages[id]||[]).includes(book);if((book<Number(r.from)||book>Number(r.to))&&!extra)continue;const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();rows.push({doc:r.doc,from:r.from,to:r.to,bookPage:book,pdfPage:n,extra,text});}}return{id,title:c?.title||'',packSource:p?.source||'',must:p?.must||[],summary:p?.summary||'',detail:p?.detail||[],ranges,rows};},id);
  console.log('V45_BATCH8_SOURCE_REVIEW',JSON.stringify({id:result.id,title:result.title,packSource:result.packSource,ranges:result.ranges,must:result.must,summary:result.summary,detail:result.detail,pages:result.rows.map(x=>({doc:x.doc,bookPage:x.bookPage,pdfPage:x.pdfPage,extra:x.extra===true,text:x.text.slice(0,3200)}))}));
  if(!result.rows.length)throw new Error('V45_BATCH8_SOURCE_PAGE_MISSING '+id);
 }
 await ctx.close();console.log('V45_BATCH8_SOURCE_REVIEW_COMPLETE');
}finally{await browser.close()}
