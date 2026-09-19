import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets={
  fire1:[
    ['목조건축물',['목조건축물','목조 건축물','목조건물','목조']],
    ['내화건축물',['내화건축물','내화 건축물','내화구조 건축물']],
    ['내화구조',['내화구조','내화 구조']]
  ],
  fire2:[
    ['목조건축물',['목조건축물','목조 건축물','목조건물','목조']],
    ['내화건축물',['내화건축물','내화 건축물','내화구조 건축물']],
    ['내화구조',['내화구조','내화 구조']]
  ],
  prevention1:[
    ['목조건축물',['목조건축물','목조 건축물','목조건물','목조']],
    ['내화건축물',['내화건축물','내화 건축물','내화구조 건축물']],
    ['내화구조',['내화구조','내화 구조']]
  ],
  ems:[
    ['심방세동',['심방세동','심방 세동','atrial fibrillation','AF']],
    ['상심실성빈맥',['상심실성 빈맥','상심실성빈맥','SVT','발작성 상심실성']],
    ['서맥',['서맥','증상성 서맥']],
    ['방실차단',['방실차단','방실 차단','AV block','AV블록']],
    ['아데노신',['아데노신','adenosine']],
    ['아트로핀',['아트로핀','atropine']],
    ['아미오다론',['아미오다론','amiodarone']],
    ['에피네프린',['에피네프린','epinephrine']],
    ['산소통사용시간',['산소통 사용','산소 사용시간','사용 가능 시간','실린더 상수','잔압']],
    ['수액적하',['적하','방울/분','gtt','drop factor','수액 속도']],
    ['패혈증',['패혈증','패혈성','sepsis']],
    ['감염성응급',['감염성 질환','감염성 응급','감염 환자','발열 환자']]
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
          if(d.hits.length>=10)continue;
          const matched=d.keys.find(k=>k&&compact.includes(k));if(!matched)continue;
          let rawAt=-1;
          for(const term of d.terms){const i=text.toLowerCase().indexOf(String(term).toLowerCase());if(i>=0&&(rawAt<0||i<rawAt))rawAt=i}
          if(rawAt<0)rawAt=Math.max(0,Math.floor(text.length*(compact.indexOf(matched)/Math.max(1,compact.length))));
          d.hits.push({pdfPage:n,bookPage:V.SourcePDF.bookPage?.(doc,n)||0,snippet:text.slice(Math.max(0,rawAt-260),Math.min(text.length,rawAt+1600))});
        }
      }
      return{doc,pages:pdf.numPages,origin:entry.origin,rows:defs.map(({label,terms,hits})=>({label,terms,hits}))};
    },{doc,defsRaw});
    for(const row of result.rows)console.log('REMAINING_GAP_AUDIT',JSON.stringify({doc:result.doc,pages:result.pages,origin:result.origin,...row}));
  }
  console.log('REMAINING_GAP_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
