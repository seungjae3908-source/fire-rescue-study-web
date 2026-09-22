import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=[
  {id:'E03-C03',doc:'ems',pages:[41,42],terms:['세척','소독','멸균']},
  {id:'E04-C01',doc:'ems',pages:[51,52,53,54],terms:['해부학적 자세','정중면','관상면','횡단면']},
  {id:'E04-C02',doc:'ems',pages:[55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71],terms:['근골격','호흡계','순환계']},
  {id:'E06-C02',doc:'ems',pages:[89,90,91,92],terms:['신체역학','허리','다리']},
  {id:'E10-C05',doc:'ems',pages:[198],terms:['연기','그을음','호흡기계']},
  {id:'E22-C02',doc:'ems',pages:[391],terms:['노인','환자','의사소통']},
  {id:'F04-C03',doc:'fire2',pages:[189,190,191,192,193,194,195,196,197,198],terms:['비열','증발잠열','냉각']}
];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  for(const target of targets){
    const result=await page.evaluate(async target=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf(target.doc,{timeoutMs:120000}),pdf=entry.pdf,rows=[];
      for(let n=1;n<=pdf.numPages;n++){
        const book=V.SourcePDF.bookPage?.(target.doc,n)||0;
        if(!target.pages.includes(book))continue;
        const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        rows.push({bookPage:book,pdfPage:n,text});
      }
      return{id:target.id,doc:target.doc,origin:entry.origin,rows};
    },target);
    const joined=norm(result.rows.map(x=>x.text).join(' '));
    const matched=target.terms.filter(t=>joined.includes(t));
    console.log('V29_SOURCE_REVIEW',JSON.stringify({
      id:target.id,doc:target.doc,origin:result.origin,pages:target.pages,matched,
      snippets:result.rows.map(x=>({bookPage:x.bookPage,pdfPage:x.pdfPage,text:x.text.slice(0,2400)}))
    }));
    if(!result.rows.length)throw new Error('V29_SOURCE_PAGE_MISSING '+target.id);
    if(!matched.length)throw new Error('V29_SOURCE_TERMS_MISSING '+target.id);
  }
  await ctx.close();
  console.log('V29_SOURCE_REVIEW_COMPLETE');
}finally{await browser.close()}
