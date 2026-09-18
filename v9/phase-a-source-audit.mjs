import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=[
  {id:'F-SCI-01',title:'원자·분자·원자량·분자량',terms:['원자량','분자량','원자와 분자','원자','분자']},
  {id:'F-SCI-02',title:'화학결합·화학반응식·산화환원',terms:['화학결합','공유결합','산화환원','산화 반응','환원 반응','화학반응식']},
  {id:'F-SCI-03',title:'물질상태·상변화·감열·잠열',terms:['상태변화','상변화','융해열','기화열','잠열','감열','증발잠열','융해','기화']},
  {id:'F-SCI-04',title:'기체법칙·이상기체·mol',terms:['보일의 법칙','샤를의 법칙','이상기체','몰질량','1 mol','1mol']},
  {id:'F-SCI-05',title:'열량·비열·열용량 계산',terms:['열용량','비열','열량','현열','잠열']},
  {id:'F-SCI-06',title:'전도·대류·복사·복사열 계산',terms:['열전도','전도','대류','복사열','복사','스테판','Stefan']},
  {id:'F-COMB-04',title:'자연발화·축열·최소점화에너지',terms:['자연발화','자연 발화','축열','최소점화에너지','최소 점화 에너지','점화에너지']},
  {id:'F-COMB-07',title:'연소생성물·CO·CO2·HCN·연기독성',terms:['연소생성물','연소 생성물','일산화탄소','시안화수소','HCN','아크롤레인','연기독성','유독가스']}
];
const windows={fire1:[1,45],fire2:[215,340]};

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});

  const rows=await page.evaluate(async ({targets,windows})=>{
    const V=window.AITUTOR_V9;
    const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const out=Object.fromEntries(targets.map(t=>[t.id,{...t,hits:[],matchedTerms:[]}]));
    for(const [doc,[fromBook,toBook]] of Object.entries(windows)){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      const pdf=entry.pdf;
      const from=Math.max(1,V.SourcePDF.pdfPage(doc,fromBook));
      const to=Math.min(pdf.numPages,V.SourcePDF.pdfPage(doc,toBook));
      for(let pdfPage=from;pdfPage<=to;pdfPage++){
        const pg=await pdf.getPage(pdfPage);
        const tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        const compact=norm(text);
        const bookPage=V.SourcePDF.bookPage(doc,pdfPage);
        for(const t of targets){
          const row=out[t.id];
          const matches=t.terms.filter(term=>compact.includes(norm(term)));
          if(!matches.length)continue;
          for(const m of matches)if(!row.matchedTerms.includes(m))row.matchedTerms.push(m);
          if(row.hits.some(h=>h.doc===doc&&h.bookPage===bookPage))continue;
          let pos=-1,needle='';
          for(const m of matches){
            const raw=text.toLowerCase().indexOf(String(m).toLowerCase());
            if(raw>=0&&(pos<0||raw<pos)){pos=raw;needle=m}
          }
          if(pos<0){pos=0;needle=matches[0]}
          row.hits.push({
            doc,origin:entry.origin,bookPage,pdfPage,
            matched:matches,
            snippet:text.slice(Math.max(0,pos-260),Math.min(text.length,pos+1700))
          });
        }
      }
    }
    return targets.map(t=>{
      const row=out[t.id];
      row.hits=row.hits.slice(0,12);
      return row;
    });
  },{targets,windows});

  for(const row of rows)console.log('PHASE_A_SOURCE_AUDIT',JSON.stringify(row));
  const summary={
    topics:rows.length,
    withHits:rows.filter(x=>x.hits.length>0).map(x=>x.id),
    zeroHits:rows.filter(x=>x.hits.length===0).map(x=>x.id),
    coverage:Object.fromEntries(rows.map(x=>[x.id,{pages:x.hits.map(h=>`${h.doc}:${h.bookPage}`),terms:x.matchedTerms}]))
  };
  console.log('PHASE_A_SOURCE_AUDIT_COMPLETE',JSON.stringify(summary));
  await ctx.close();
}finally{
  await browser.close();
}
