import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=['F03-C09','F03-C11','F03-C15','F03-C16','F05-C08','F07-C01','F07-C04','F07-C09','F07-C13','F07-C14'];
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf&&!!window.AITUTOR_V9?.ConceptArchitecture119,{timeout:60000});
  const result=await page.evaluate(async targets=>{
    const V=window.AITUTOR_V9,out=[];
    for(const id of targets){
      const c=V.curriculum.byId[id],p=V.contentPacks.get(id)||{};
      const row={id,title:c?.title||'',terms:V.ConceptArchitecture119.termsFor(id),ranges:[],summary:p.summary||'',must:p.must||[]};
      for(const r of c?.sourceRanges||[]){
        const entry=await V.SourcePDF.openPdf(r.doc,{timeoutMs:120000});
        const from=Math.max(1,Number(r.from)||1),to=Math.max(from,Number(r.to)||from);
        const pages=[];
        for(let bookPage=from;bookPage<=to;bookPage++){
          const pdfPage=V.SourcePDF.pdfPage(r.doc,bookPage);
          if(pdfPage<1||pdfPage>entry.pdf.numPages)continue;
          const pg=await entry.pdf.getPage(pdfPage),tc=await pg.getTextContent();
          const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
          pages.push({bookPage,pdfPage,text:text.slice(0,5000)});
        }
        row.ranges.push({doc:r.doc,from,to,pages});
      }
      out.push(row);
    }
    return out;
  },targets);
  console.log('V70_ANCHOR_REVIEW_DIAGNOSTIC',JSON.stringify(result,null,2));
  await ctx.close();
}finally{await browser.close()}
