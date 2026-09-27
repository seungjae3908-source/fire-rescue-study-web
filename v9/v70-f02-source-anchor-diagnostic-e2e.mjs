import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const terms=['재난관리책임기관','재난관리주관기관','재난관리 업무','재난 및 안전관리 기본법'];
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(180000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});
  const result=await page.evaluate(async terms=>{
    const V=window.AITUTOR_V9,norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const entry=await V.SourcePDF.openPdf('law5',{timeoutMs:120000}),out=[];
    for(let pdfPage=1;pdfPage<=entry.pdf.numPages;pdfPage++){
      const pg=await entry.pdf.getPage(pdfPage),tc=await pg.getTextContent();
      const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=norm(text);
      const matched=terms.filter(q=>compact.includes(norm(q)));
      if(!matched.length)continue;
      out.push({pdfPage,bookPage:V.SourcePDF.bookPage('law5',pdfPage),matched,text:text.slice(0,3200)});
    }
    return out;
  },terms);
  console.log('V70_F02_SOURCE_ANCHOR_DIAGNOSTIC',JSON.stringify(result,null,2));
  await ctx.close();
}finally{await browser.close()}
