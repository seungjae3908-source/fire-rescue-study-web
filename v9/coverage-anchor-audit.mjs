import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets={
  fire1:[
    ['몰·mol',['mol']],
    ['최소산소농도',['최소산소농도','최소 산소 농도']],
    ['이론산소량·공기량',['이론산소량','이론공기량','이론 공기량']],
    ['인화점·연소점·발화점',['인화점','연소점','발화점']],
    ['연소범위',['연소범위','연소 범위','폭발범위']],
    ['중성대',['중성대']],
    ['복사열',['복사열','복사 열']]
  ],
  fire2:[
    ['방화구획',['방화구획','방화 구획']],
    ['방화문·방화벽',['방화문','방화벽']],
    ['연돌효과',['연돌효과','연돌 효과']],
    ['폭연·폭굉',['폭연','폭굉']],
    ['분진폭발',['분진폭발','분진 폭발']],
    ['증기운폭발',['증기운폭발','증기운 폭발','VCE']]
  ],
  ems:[
    ['심실세동',['심실세동']],
    ['심실빈맥',['심실빈맥']],
    ['PEA·무수축',['무맥성 전기활동','무수축','PEA']],
    ['동기화심율동전환',['동기화 심율동전환','동기화심율동전환']],
    ['아데노신',['아데노신']],
    ['아트로핀',['아트로핀']],
    ['아미오다론',['아미오다론']],
    ['START',['START','중증도 분류']],
    ['Parkland',['Parkland','파크랜드']],
    ['산소통사용시간',['산소통','실린더 상수']],
    ['수액적하',['적하','방울/분','gtt']]
  ]
};
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF&&!!window.AITUTOR_V9?.SourceCatalog119,{timeout:60000});
  for(const [doc,rows] of Object.entries(targets)){
    const result=await page.evaluate(async ({doc,rows})=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000}),pdf=entry.pdf;
      const defs=rows.map(([label,terms])=>({label,terms,ns:terms.map(t=>String(t).toLowerCase().replace(/[^0-9a-z가-힣]/g,'')),hits:[]}));
      for(let n=1;n<=pdf.numPages;n++){
        const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=text.toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
        for(const d of defs){
          if(d.hits.length>=8)continue;
          if(!d.ns.some(t=>t&&compact.includes(t)))continue;
          let at=-1;for(const t of d.ns){const i=compact.indexOf(t);if(i>=0&&(at<0||i<at))at=i}
          const rawNeedle=d.terms.find(t=>text.toLowerCase().includes(String(t).toLowerCase()))||'';
          let rawAt=rawNeedle?text.toLowerCase().indexOf(String(rawNeedle).toLowerCase()):-1;
          if(rawAt<0)rawAt=Math.max(0,Math.min(text.length-1,Math.round((at/Math.max(1,compact.length))*text.length)));
          d.hits.push({page:n,snippet:text.slice(Math.max(0,rawAt-220),Math.min(text.length,rawAt+780))});
        }
      }
      return{doc,pages:pdf.numPages,origin:entry.origin,rows:defs.map(({label,terms,hits})=>({label,terms,hits}))};
    },{doc,rows});
    for(const row of result.rows)console.log('COVERAGE_ANCHOR_AUDIT',JSON.stringify({doc:result.doc,pages:result.pages,origin:result.origin,...row}));
  }
  const gapPages={ems:[43,47,50,59,69,73,90,94,95,97,121,127,133,134,138]};
  for(const [doc,pages] of Object.entries(gapPages)){
    const rows=await page.evaluate(async ({doc,pages})=>{
      const V=window.AITUTOR_V9,pdf=(await V.SourcePDF.openPdf(doc,{timeoutMs:120000})).pdf,out=[];
      for(const n of pages){const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();out.push({page:n,bookPage:V.SourcePDF.bookPage?.(doc,n)||0,text:text.slice(0,5000)})}
      return out;
    },{doc,pages});
    for(const row of rows)console.log('COVERAGE_GAP_PAGE',JSON.stringify({doc,...row}));
  }
  console.log('COVERAGE_ANCHOR_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
