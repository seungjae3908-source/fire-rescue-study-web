import { chromium } from 'playwright';
const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const probes=[
  {label:'PALS',pages:[230,...Array.from({length:25},(_,i)=>383+i)],terms:['소아 심정지','소아 심폐소생술','소아 제세동','서맥','빈맥','쇼크','심정지','제세동','J/kg','맥박','호흡']},
  {label:'CBRN',pages:Array.from({length:8},(_,i)=>62+i),terms:['위험물사고','위험물 사고','제독','오염','화학','방사능','방사선','개인보호','보호구역','격리','hot zone','warm zone','cold zone']}
];
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage(); page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  for(const probe of probes){
    const rows=await page.evaluate(async probe=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf('ems',{timeoutMs:120000}),pdf=entry.pdf,out=[];
      const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ');
      for(const n of probe.pages){
        if(n<1||n>pdf.numPages)continue;
        const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),low=norm(text);
        const matched=probe.terms.filter(t=>low.includes(norm(t)));
        if(!matched.length)continue;
        let at=text.length;
        for(const t of matched){const i=low.indexOf(norm(t));if(i>=0&&i<at)at=i}
        out.push({pdfPage:n,bookPage:V.SourcePDF.bookPage?.('ems',n)||0,matched,snippet:text.slice(Math.max(0,at-380),Math.min(text.length,at+2500))});
      }
      return{origin:entry.origin,totalPages:pdf.numPages,out};
    },probe);
    for(const row of rows.out)console.log('EMS_TARGETED_GAP_AUDIT',JSON.stringify({label:probe.label,origin:rows.origin,totalPages:rows.totalPages,...row}));
  }
  console.log('EMS_TARGETED_GAP_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
