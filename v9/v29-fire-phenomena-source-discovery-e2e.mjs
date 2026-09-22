import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const terms=['플레임오버','보일오버','슬롭오버','프로스오버','frothover','slopover','boilover'];
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}}),page=await ctx.newPage();
  page.setDefaultTimeout(180000);await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  const result=await page.evaluate(async ({terms})=>{
    const V=window.AITUTOR_V9,out={};
    for(const doc of ['fire1','fire2']){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:180000}),pdf=entry.pdf,hits=[];
      for(let n=1;n<=pdf.numPages;n++){
        const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=text.replace(/\s+/g,'').toLowerCase();
        const matched=terms.filter(t=>compact.includes(String(t).replace(/\s+/g,'').toLowerCase()));
        if(matched.length)hits.push({pdfPage:n,bookPage:V.SourcePDF.bookPage?.(doc,n)||0,matched,text:text.slice(0,4200)});
      }
      out[doc]={origin:entry.origin,numPages:pdf.numPages,hits};
    }
    return out;
  },{terms});
  console.log('V29_FIRE_PHENOMENA_SOURCE_DISCOVERY',JSON.stringify(result,null,2));
  const all=[...result.fire1.hits,...result.fire2.hits];
  for(const term of ['플레임오버','보일오버','슬롭오버','프로스오버'])if(!all.some(x=>x.matched.includes(term)))throw new Error('V29_FIRE_TERM_NOT_FOUND '+term);
  await ctx.close();console.log('V29_FIRE_PHENOMENA_SOURCE_DISCOVERY_COMPLETE');
}finally{await browser.close()}
