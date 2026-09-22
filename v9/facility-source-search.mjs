import { chromium } from 'playwright';
const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const queries={
  'F07-C02':[
    ['소화기구','소화기','적응화재'],
    ['소화기구','초기소화']
  ],
  'F07-C03':[
    ['옥내소화전설비','호스','관창','방수구'],
    ['옥내소화전','가압송수장치','호스']
  ],
  'F07-C04':[
    ['옥외소화전설비','호스','소방대'],
    ['옥외소화전','방수구']
  ],
  'F07-C06':[
    ['간이스프링클러설비'],
    ['화재조기진압용스프링클러설비'],
    ['화재조기진압용','스프링클러']
  ],
  'F07-C08':[
    ['포소화설비','포원액','공기'],
    ['포소화설비','가연성액체'],
    ['포소화약제','포원액']
  ],
  'F07-C15':[
    ['소화활동설비'],
    ['제연설비','연기'],
    ['연결송수관설비'],
    ['연결살수설비'],
    ['비상콘센트설비'],
    ['무선통신보조설비']
  ]
};
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
function assert(v,m){if(!v)throw new Error(m)}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await ctx.newPage();page.setDefaultTimeout(90000);
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
 const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
 console.log('FACILITY_SOURCE_PREVIEW_HEAD',head||'UNKNOWN');
 if(expected&&head!==expected)console.warn('FACILITY_SOURCE_PREVIEW_DRIFT',JSON.stringify({actual:head||'UNKNOWN',expected}));
 const result=await page.evaluate(async queries=>{
   const V=window.AITUTOR_V9,source=await V.SourcePDF.resolveRow('prevention1');
   const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
   pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
   const pdf=await pdfjs.getDocument({data:await source.blob.arrayBuffer()}).promise;
   const defs=[];
   for(const [id,sets] of Object.entries(queries))for(let qi=0;qi<sets.length;qi++)defs.push({id,qi,terms:sets[qi]});
   const best=new Map(defs.map(d=>[d.id+':'+d.qi,[]]));
   const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣]/g,'');
   for(let n=1;n<=pdf.numPages;n++){
     const pg=await pdf.getPage(n),tc=await pg.getTextContent();
     const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim(),compact=norm(text);
     for(const d of defs){
       const hits=d.terms.filter(t=>compact.includes(norm(t)));
       if(!hits.length)continue;
       let score=hits.length*100;
       for(const t of d.terms){const k=norm(t),idx=compact.indexOf(k);if(idx>=0)score+=Math.max(0,50-Math.floor(idx/100));}
       const key=d.id+':'+d.qi,arr=best.get(key);
       arr.push({page:n,score,hits,snippet:text.slice(0,3600)});
       arr.sort((a,b)=>b.score-a.score||a.page-b.page);if(arr.length>6)arr.length=6;
     }
   }
   return defs.map(d=>({id:d.id,queryIndex:d.qi,terms:d.terms,top:best.get(d.id+':'+d.qi)}));
 },queries);
 for(const row of result)console.log('FACILITY_SOURCE_SEARCH',JSON.stringify(row,null,2));
 const f07c15Boundaries=result.filter(row=>row.id==='F07-C15'&&row.queryIndex>0);
 assert(f07c15Boundaries.length===5,'F07_C15_BOUNDARY_QUERY_COUNT '+f07c15Boundaries.length+' != 5');
 const missing=f07c15Boundaries.filter(row=>!Array.isArray(row.top)||row.top.length===0);
 assert(missing.length===0,'F07_C15_BOUNDARY_SOURCE_MISSING '+JSON.stringify(missing.map(row=>row.terms)));
 console.log('F07_C15_BOUNDARY_CANDIDATES',JSON.stringify(f07c15Boundaries.map(row=>({terms:row.terms,page:row.top[0].page,score:row.top[0].score,hits:row.top[0].hits}))));
 console.log('FACILITY_SOURCE_SEARCH_COMPLETE');
 await ctx.close();
}finally{await browser.close()}
