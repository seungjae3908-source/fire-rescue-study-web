import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets={
  'F03-C09':{docs:['fire1','fire2'],queries:['플래시오버','flashover','플래쉬오버']},
  'F03-C11':{docs:['fire1','fire2'],queries:['백드래프트','backdraft']},
  'F03-C15':{docs:['fire1','fire2'],queries:['BLEVE','비등액체팽창증기폭발','파이어볼','fire ball']},
  'F03-C16':{docs:['fire1','fire2'],queries:['풀파이어','pool fire','제트파이어','jet fire']},
  'F05-C08':{docs:['fire1','fire2','prevention2'],queries:['보일오버','슬롭오버','프로스오버','위험물 사고 대응요령','물과 반응하는 물질']},
  'F07-C01':{docs:['prevention1'],queries:['소방시설의 종류','소방시설','피난구조설비','소화용수설비','소화활동설비']},
  'F07-C04':{docs:['prevention1'],queries:['옥외소화전설비','옥외소화전']},
  'F07-C09':{docs:['prevention1'],queries:['이산화탄소소화설비','가스계소화설비','할로겐화합물','불활성기체']},
  'F07-C13':{docs:['prevention1'],queries:['피난구조설비','피난기구','유도등','인명구조기구']},
  'F07-C14':{docs:['prevention1'],queries:['소화용수설비','소화수조','저수조','채수구','흡수관투입구']}
};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(180000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});
  const result=await page.evaluate(async targets=>{
    const V=window.AITUTOR_V9,norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const out=Object.fromEntries(Object.keys(targets).map(id=>[id,{}]));
    const docs=[...new Set(Object.values(targets).flatMap(t=>t.docs))];
    for(const doc of docs){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      const watchers=Object.entries(targets).filter(([,t])=>t.docs.includes(doc)).map(([id,t])=>({id,queries:t.queries.map(q=>({raw:q,norm:norm(q)}))}));
      for(let pdfPage=1;pdfPage<=entry.pdf.numPages;pdfPage++){
        const pg=await entry.pdf.getPage(pdfPage),tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=norm(text);
        if(!compact)continue;
        for(const w of watchers){
          const matched=w.queries.filter(q=>q.norm&&compact.includes(q.norm)).map(q=>q.raw);
          if(!matched.length)continue;
          const score=matched.reduce((n,q)=>n+norm(q).length,0);
          (out[w.id][doc]||(out[w.id][doc]=[])).push({
            pdfPage,bookPage:V.SourcePDF.bookPage(doc,pdfPage),score,matched,text:text.slice(0,2200)
          });
        }
      }
    }
    for(const docs of Object.values(out))for(const [doc,rows] of Object.entries(docs)){
      docs[doc]=rows.sort((a,b)=>b.score-a.score||a.bookPage-b.bookPage).slice(0,10);
    }
    return out;
  },targets);
  console.log('V70_ANCHOR_CANDIDATE_SEARCH',JSON.stringify(result,null,2));
  await ctx.close();
}finally{await browser.close()}
