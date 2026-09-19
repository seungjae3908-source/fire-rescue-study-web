import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const id=process.env.STUDY_119_INSPECT_ID||'F07-C16';
const pages=(process.env.STUDY_119_INSPECT_PAGES||'284,285,286,287,288,289,290,291,292').split(',').map(Number).filter(Number.isFinite);
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
function assert(v,m){if(!v)throw new Error(m)}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await ctx.newPage();
 page.setDefaultTimeout(90000);
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
 const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
 if(expected)assert(head===expected,'HEAD_MISMATCH '+head+' != '+expected);
 const result=await page.evaluate(async ({id,pages})=>{
   const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.get(id),r=c?.sourceRanges?.[0];
   if(!c||!p||!r?.doc)throw new Error('SOURCE_MISSING '+id);
   const source=await V.SourcePDF.resolveRow(r.doc);
   const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
   pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
   const pdf=await pdfjs.getDocument({data:await source.blob.arrayBuffer()}).promise;
   const rawTerms=[
     c.title,
     ...(p.must||[]),
     ...(p.detail||[]),
     ...(p.deepSections||[]).flatMap(x=>[x.title,x.body,...(x.bullets||[])])
   ].filter(Boolean);
   const terms=[...new Set(rawTerms.flatMap(x=>String(x).split(/[·,/()→\s]+/)).map(x=>x.trim()).filter(x=>x.length>=2))].slice(0,80);
   const rows=[];
   for(const n of pages){
     const pg=await pdf.getPage(n),tc=await pg.getTextContent();
     const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
     const compact=text.toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
     const matched=terms.filter(t=>compact.includes(String(t).toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'')));
     const strong=['수원','가압송수장치','배관','유수검지장치','헤드','송수구','경보','알람밸브','압력스위치','펌프','구성요소'];
     const strongMatched=strong.filter(t=>compact.includes(t.replace(/\s+/g,'')));
     rows.push({page:n,matchedTerms:matched.slice(0,25),matchCount:matched.length,strongMatched,strongCount:strongMatched.length,snippet:text.slice(0,5000)});
   }
   return{id,title:c.title,doc:r.doc,pages:pdf.numPages,rows};
 },{id,pages});
 for(const row of result.rows)console.log('PAGE_RANGE_INSPECT',JSON.stringify({id:result.id,title:result.title,doc:result.doc,totalPages:result.pages,...row},null,2));
 console.log('PAGE_RANGE_INSPECTION_COMPLETE');
 await ctx.close();
}finally{await browser.close()}
