import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.findPages,{timeout:60000});
  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    const queries={
      prevention2:['위험물 소화방법','보일오버','슬롭오버 프로스오버','물과의 반응성'],
      prevention1:['무선통신보조설비','비상콘센트설비','연결송수관설비','제연설비']
    };
    const out={};
    for(const [doc,qs] of Object.entries(queries)){
      out[doc]={};
      for(const q of qs){
        const r=await V.SourcePDF.findPages(doc,q,{limit:20});
        out[doc][q]=(r.results||[]).map(x=>({pdfPage:x.page,bookPage:x.bookPage,score:x.score}));
      }
    }
    const snippets={};
    const inspect={
      prevention2:[419,425,454,523,524,525,526,527,528,529,530,531,532],
      prevention1:[468,469,470,471,472]
    };
    for(const [doc,bookPages] of Object.entries(inspect)){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      snippets[doc]=[];
      for(const bookPage of bookPages){
        const pdfPage=V.SourcePDF.pdfPage(doc,bookPage);
        if(pdfPage<1||pdfPage>entry.pdf.numPages)continue;
        const pg=await entry.pdf.getPage(pdfPage);
        const tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        snippets[doc].push({bookPage,pdfPage,text:text.slice(0,2200)});
      }
    }
    return{matches:out,snippets};
  });
  console.log('V70_SOURCE_ANCHOR_RECONCILE',JSON.stringify(result,null,2));
  await ctx.close();
}finally{
  await browser.close();
}
