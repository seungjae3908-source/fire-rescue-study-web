import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=[
  {id:'E-ECG-02-SVT',title:'SVT',terms:['심실상빈맥','심실상 빈맥','상심실성 빈맥','supraventricular tachycardia','SVT']},
  {id:'E-ECG-02-AF',title:'AF',terms:['심방세동','심방 세동','atrial fibrillation']},
  {id:'E-ECG-02-VT',title:'VT',terms:['심실빈맥','심실 빈맥','ventricular tachycardia']},
  {id:'E-ECG-02-BRADY',title:'서맥',terms:['동성서맥','동성 서맥','서맥']},
  {id:'E-ECG-02-AVB',title:'AV block',terms:['방실차단','방실 차단','2도 방실','3도 방실','완전 방실차단','atrioventricular block','AV block']},
  {id:'E-ACLS-02-UNSTABLE',title:'불안정 징후',terms:['저혈압','의식변화','의식 변화','실신','쇼크','불안정']},
  {id:'E-CARD-01-ACS',title:'ACS/STEMI/NSTEMI',terms:['급성관상동맥증후군','급성 관상동맥 증후군','STEMI','NSTEMI','심근경색']},
  {id:'E-CARD-01-PULM',title:'폐부종/심인성쇼크',terms:['폐부종','심인성쇼크','심인성 쇼크']}
];

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});
  const rows=await page.evaluate(async targets=>{
    const V=window.AITUTOR_V9;
    const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const out=Object.fromEntries(targets.map(t=>[t.id,{...t,hits:[],matchedTerms:[]}]));
    const entry=await V.SourcePDF.openPdf('ems',{timeoutMs:120000});
    const pdf=entry.pdf;
    for(let pdfPage=1;pdfPage<=pdf.numPages;pdfPage++){
      const pg=await pdf.getPage(pdfPage);
      const tc=await pg.getTextContent();
      const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      const compact=norm(text);
      const bookPage=V.SourcePDF.bookPage('ems',pdfPage);
      for(const t of targets){
        const matches=t.terms.filter(term=>compact.includes(norm(term)));
        if(!matches.length)continue;
        const row=out[t.id];
        for(const m of matches)if(!row.matchedTerms.includes(m))row.matchedTerms.push(m);
        let pos=-1;
        for(const m of matches){
          const raw=text.toLowerCase().indexOf(String(m).toLowerCase());
          if(raw>=0&&(pos<0||raw<pos))pos=raw;
        }
        if(pos<0)pos=0;
        row.hits.push({
          doc:'ems',origin:entry.origin,bookPage,pdfPage,matched:matches,
          score:matches.reduce((n,x)=>n+norm(x).length,0),
          snippet:text.slice(Math.max(0,pos-260),Math.min(text.length,pos+1700))
        });
      }
    }
    return targets.map(t=>{
      const r=out[t.id];
      r.hits=r.hits.sort((a,b)=>b.score-a.score||a.bookPage-b.bookPage).slice(0,20);
      return r;
    });
  },targets);
  for(const row of rows)console.log('PHASE_B_EMS_SOURCE_AUDIT',JSON.stringify(row));
  console.log('PHASE_B_EMS_SOURCE_AUDIT_COMPLETE',JSON.stringify({
    topics:rows.length,
    withHits:rows.filter(x=>x.hits.length).map(x=>x.id),
    zeroHits:rows.filter(x=>!x.hits.length).map(x=>x.id),
    coverage:Object.fromEntries(rows.map(x=>[x.id,{pages:x.hits.map(h=>h.bookPage),terms:x.matchedTerms}]))
  }));
  await ctx.close();
}finally{
  await browser.close();
}
