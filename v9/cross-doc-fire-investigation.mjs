import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const docs=(process.env.STUDY_119_CROSS_DOCS||'fire2,prevention2').split(',').map(x=>x.trim()).filter(Boolean);
const concepts=[
  {id:'F06-C01',terms:['화재조사','원인조사','피해조사','재발방지','원인 규명','피해상황']},
  {id:'F06-C02',terms:['현장보존','현장 보존','사진','도면','진술','조사절차']},
  {id:'F06-C03',terms:['발화부','발화원인','점화원','최초착화물','발화 지점']},
  {id:'F06-C04',terms:['화재피해','피해조사','재산피해','인명피해','소실범위','피해 기록']}
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(90000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF&&!!window.AITUTOR_V9?.SourceCatalog119,{timeout:60000});
  const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
  if(expected&&head!==expected)throw new Error('PREVIEW_HEAD_MISMATCH '+head+' != '+expected);

  for(const doc of docs){
    const result=await page.evaluate(async ({doc,concepts})=>{
      const V=window.AITUTOR_V9,source=await V.SourcePDF.resolveRow(doc);
      const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
      const pdf=await pdfjs.getDocument({data:await source.blob.arrayBuffer()}).promise;
      const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
      const rows=[];
      for(let n=1;n<=pdf.numPages;n++){
        const pg=await pdf.getPage(n),tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        const compact=norm(text);
        for(const c of concepts){
          const matches=c.terms.filter(t=>compact.includes(norm(t)));
          if(matches.length){
            rows.push({id:c.id,page:n,score:matches.length,matches,snippet:text.slice(0,3000)});
          }
        }
      }
      return{doc,pages:pdf.numPages,rows};
    },{doc,concepts});
    for(const c of concepts){
      const top=result.rows.filter(x=>x.id===c.id).sort((a,b)=>b.score-a.score||a.page-b.page).slice(0,12);
      console.log('CROSS_DOC_RESULT',JSON.stringify({doc,pages:result.pages,id:c.id,top},null,2));
    }
  }
  await ctx.close();
  console.log('CROSS_DOC_DISCOVERY_COMPLETE');
}finally{await browser.close()}
