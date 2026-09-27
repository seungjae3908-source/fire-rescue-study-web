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
    return out;
  });
  console.log('V70_SOURCE_ANCHOR_RECONCILE',JSON.stringify(result,null,2));
  await ctx.close();
}finally{
  await browser.close();
}
