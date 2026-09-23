import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
const clean=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const generic=new Set(['개념','유형','기초','기본','정의','평가','처치','응급','설비','장비','관리','체계','원리','기타','종류','분류','사용','방법','구조','기능','환자','화재','소방']);
const samplePages=(from,to)=>{
  const a=Math.max(1,Number(from)||1),b=Math.max(a,Number(to)||a),n=b-a+1;
  if(n<=12)return Array.from({length:n},(_,i)=>a+i);
  const pts=[a,a+1,a+2,Math.floor((a+b)/2)-1,Math.floor((a+b)/2),Math.floor((a+b)/2)+1,b-2,b-1,b];
  return [...new Set(pts.filter(x=>x>=a&&x<=b))].sort((x,y)=>x-y);
};
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf&&!!window.AITUTOR_V9?.ConceptArchitecture119,{timeout:60000});
  const plan=await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    return V.curriculum.concepts.map(c=>{
      const p=V.contentPacks.get(c.id)||{},ranges=(c.sourceRanges||[]).map(r=>({doc:r.doc,from:Number(r.from),to:Number(r.to),label:String(r.label||'')})),links=(p.officialLinks||[]).filter(x=>x?.url).map(x=>x.url);
      return{id:c.id,title:c.title,subject:c.subject,scopeId:c.scopeId,ranges,links,terms:V.ConceptArchitecture119.termsFor(c.id),summary:String(p.summary||'')};
    });
  });
  const pageNeeds=new Map();
  for(const row of plan)for(const r of row.ranges||[]){
    if(!r.doc)continue;
    const set=pageNeeds.get(r.doc)||new Set;
    for(const bookPage of samplePages(r.from,r.to))set.add(bookPage);
    pageNeeds.set(r.doc,set);
  }
  const pageText={};
  const docMeta={};
  for(const [doc,set] of pageNeeds){
    const result=await page.evaluate(async ({doc,pages})=>{
      const V=window.AITUTOR_V9,entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000}),out={};
      for(const bookPage of pages){
        const pdfPage=V.SourcePDF.pdfPage(doc,bookPage);
        if(pdfPage<1||pdfPage>entry.pdf.numPages){out[bookPage]={pdfPage,text:'',invalid:true};continue}
        const pg=await entry.pdf.getPage(pdfPage),tc=await pg.getTextContent(),text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        out[bookPage]={pdfPage,text,invalid:false};
      }
      return{origin:entry.origin,numPages:entry.pdf.numPages,pages:out};
    },{doc,pages:[...set].sort((a,b)=>a-b)});
    docMeta[doc]={origin:result.origin,numPages:result.numPages};
    for(const [bookPage,row] of Object.entries(result.pages))pageText[doc+':'+bookPage]=row;
  }

  const issues=[],anchorReview=[],rows=[];
  for(const row of plan){
    const terms=[row.title,...(row.terms||[])].flatMap(x=>String(x||'').split(/[·,/()\s\-]+/)).map(x=>x.trim()).filter(x=>x.length>=2&&!generic.has(x)).sort((a,b)=>b.length-a.length).slice(0,18);
    let sampled=0,readable=0,anchorHits=0,invalid=0;const matches=[];
    for(const r of row.ranges||[]){
      for(const bookPage of samplePages(r.from,r.to)){
        sampled++;
        const p=pageText[r.doc+':'+bookPage];
        if(!p||p.invalid){invalid++;continue}
        if(String(p.text||'').trim().length>=20)readable++;
        const compact=clean(p.text);
        const hit=terms.filter(t=>compact.includes(clean(t)));
        if(hit.length){anchorHits++;matches.push({doc:r.doc,bookPage,pdfPage:p.pdfPage,terms:hit.slice(0,5)})}
      }
    }
    if((row.ranges||[]).length){
      if(!sampled||!readable)issues.push({id:row.id,type:'PDF_RANGE_UNREADABLE',ranges:row.ranges});
      if(invalid)issues.push({id:row.id,type:'PDF_RANGE_OUT_OF_BOUNDS',invalid,ranges:row.ranges});
      if(!anchorHits)anchorReview.push({id:row.id,title:row.title,scopeId:row.scopeId,terms:terms.slice(0,10),ranges:row.ranges});
    }else if(!(row.links||[]).length){
      issues.push({id:row.id,type:'NO_OFFICIAL_SOURCE'});
    }
    rows.push({id:row.id,title:row.title,scopeId:row.scopeId,subject:row.subject,ranges:(row.ranges||[]).length,links:(row.links||[]).length,sampled,readable,anchorHits,matches:matches.slice(0,4)});
  }
  const summary={
    version:'119-v51-official-textbook-browser-audit-v1',
    concepts:rows.length,
    pdfBacked:rows.filter(x=>x.ranges>0).length,
    webOnly:rows.filter(x=>x.ranges===0&&x.links>0).length,
    docs:Object.fromEntries(Object.entries(docMeta).map(([k,v])=>[k,v])),
    sampledPages:Object.keys(pageText).length,
    issues:issues.length,
    anchorReview:anchorReview.length
  };
  console.log('V51_OFFICIAL_TEXTBOOK_SUMMARY',JSON.stringify(summary,null,2));
  console.log('V51_OFFICIAL_TEXTBOOK_ISSUES');console.table(issues);
  console.log('V51_OFFICIAL_TEXTBOOK_ANCHOR_REVIEW');console.table(anchorReview);
  console.log('V51_OFFICIAL_TEXTBOOK_ROWS');console.table(rows.map(x=>({id:x.id,title:x.title,scopeId:x.scopeId,subject:x.subject,ranges:x.ranges,links:x.links,sampled:x.sampled,readable:x.readable,anchorHits:x.anchorHits})));
  if(rows.length!==183)throw new Error('V51_OFFICIAL_CURRICULUM_COUNT '+rows.length);
  if(issues.length)throw new Error('V51_OFFICIAL_TEXTBOOK_FAILED '+JSON.stringify(issues.slice(0,40)));
  console.log('V51_OFFICIAL_TEXTBOOK_BROWSER_AUDIT_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
