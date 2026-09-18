import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
const ids=(process.env.STUDY_119_DISCOVERY_IDS||'F05-C01,F05-C08,F07-C05').split(',').map(x=>x.trim()).filter(Boolean);
function assert(v,m){if(!v)throw new Error(m)}
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(90000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SourcePDF,{timeout:60000});
  const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
  if(expected)assert(head===expected,'PREVIEW_HEAD_MISMATCH '+head+' != '+expected);

  for(const id of ids){
    const row=await page.evaluate(async id=>{
      const V=window.AITUTOR_V9,c=V.curriculum.byId[id],p=V.contentPacks.get(id),range=(c?.sourceRanges||[])[0];
      if(!c||!p||!range?.doc)throw new Error('DISCOVERY_CONCEPT_SOURCE_MISSING '+id);
      const queries=[p?.summary,...(p?.must||[]),...(p?.detail||[])].filter(Boolean).slice(0,8);
      const located=await V.SourcePDF.locate(range.doc,queries);
      const source=await V.SourcePDF.resolveRow(range.doc);
      const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
      pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
      const pdf=await pdfjs.getDocument({data:await source.blob.arrayBuffer()}).promise;
      const pg=await pdf.getPage(located.page),tc=await pg.getTextContent();
      const full=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      const host=document.createElement('div');host.style.width='1000px';host.style.position='fixed';host.style.left='-5000px';document.body.appendChild(host);
      const rendered=await V.SourcePDF.render(range.doc,located.page,host,queries);
      host.remove();
      const needles=[c.title,...(p.must||[]),...(p.detail||[])].flatMap(x=>String(x||'').split(/[·,/()→\s]+/)).filter(x=>x.length>=2).slice(0,30);
      const hits=needles.filter(x=>full.includes(x));
      let at=-1,needle='';
      for(const n of hits){const i=full.indexOf(n);if(i>=0&&(at<0||i<at)){at=i;needle=n}}
      const start=Math.max(0,(at<0?0:at)-500),snippet=full.slice(start,start+2600);
      return{
        id,title:c.title,doc:range.doc,label:range.label||'',
        priorFrom:Number(range.from)||0,priorTo:Number(range.to)||0,
        page:located.page,pages:located.pages,locateScore:located.score,
        renderHits:rendered.hits,matchedTerms:hits.slice(0,18),
        snippet,queries
      };
    },id);
    console.log('PAGE_ANCHOR_CANDIDATE',JSON.stringify(row,null,2));
  }
  await ctx.close();
  console.log('PAGE_ANCHOR_DISCOVERY_COMPLETE');
}finally{await browser.close()}
