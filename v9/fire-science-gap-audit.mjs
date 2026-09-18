import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets={
  fire2:[
    ['원자·분자',['원자','분자']],
    ['원자량·분자량',['원자량','분자량']],
    ['화학반응식',['화학반응식','반응식']],
    ['산화·환원',['산화반응','환원반응','산화 환원']],
    ['mol',['mol','몰']],
    ['기체법칙',['보일의 법칙','샤를의 법칙','이상기체']],
    ['이론산소량',['이론산소량','이론 산소량']],
    ['이론공기량',['이론공기량','이론 공기량']],
    ['최소산소농도',['최소산소농도','최소 산소 농도','MOC']],
    ['연소범위',['연소범위','연소 범위','폭발범위','폭발 범위']]
  ],
  fire1:[
    ['중성대',['중성대','중성면']],
    ['압력차',['압력차','압력 차']],
    ['개구부',['개구부','환기구']]
  ]
};
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  for(const [doc,defsRaw] of Object.entries(targets)){
    const result=await page.evaluate(async ({doc,defsRaw})=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000}),pdf=entry.pdf;
      const defs=defsRaw.map(([label,terms])=>({label,terms,keys:terms.map(t=>String(t).toLowerCase().replace(/[^0-9a-z가-힣]/g,'')),hits:[]}));
      for(let n=1;n<=pdf.numPages;n++){
        const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=text.toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
        for(const d of defs){
          if(d.hits.length>=8)continue;
          if(!d.keys.some(k=>k&&compact.includes(k)))continue;
          let rawAt=-1;
          for(const term of d.terms){const i=text.toLowerCase().indexOf(String(term).toLowerCase());if(i>=0&&(rawAt<0||i<rawAt))rawAt=i}
          if(rawAt<0)rawAt=0;
          d.hits.push({pdfPage:n,bookPage:V.SourcePDF.bookPage?.(doc,n)||0,snippet:text.slice(Math.max(0,rawAt-240),Math.min(text.length,rawAt+1300))});
        }
      }
      return{doc,totalPages:pdf.numPages,origin:entry.origin,rows:defs.map(({label,terms,hits})=>({label,terms,hits}))};
    },{doc,defsRaw});
    for(const row of result.rows)console.log('FIRE_SCIENCE_GAP_AUDIT',JSON.stringify({doc:result.doc,totalPages:result.totalPages,origin:result.origin,...row}));
  }
  console.log('FIRE_SCIENCE_GAP_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
