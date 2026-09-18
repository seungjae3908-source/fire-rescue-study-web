import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const primary=['시안화수소','사이안화수소','HCN','청산','아크롤레인','포스겐','유독가스','독성가스','독성 가스','연기독성'];
const material=['질소 함유','질소함유','폴리우레탄','폴리아미드','나일론','아크릴','양모','모직','우레탄','합성수지'];
const context=['연소생성물','연소 생성물','연소가스','연소 가스','불완전연소','불완전 연소','열분해','연기','독성','유독','질소'];
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});

  const result=await page.evaluate(async ({primary,material,context})=>{
    const V=window.AITUTOR_V9;
    const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const hits=[];
    const docs=[];
    for(const doc of ['fire1','fire2']){
      const entry=await V.SourcePDF.openPdf(doc,{timeoutMs:120000});
      const pdf=entry.pdf;
      docs.push({doc,origin:entry.origin,totalPages:pdf.numPages});
      for(let pdfPage=1;pdfPage<=pdf.numPages;pdfPage++){
        const pg=await pdf.getPage(pdfPage);
        const tc=await pg.getTextContent();
        const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
        if(!text)continue;
        const compact=norm(text);
        const p=primary.filter(t=>compact.includes(norm(t)));
        const m=material.filter(t=>compact.includes(norm(t)));
        const c=context.filter(t=>compact.includes(norm(t)));
        if(!p.length&&!m.length)continue;
        const score=p.length*8+m.length*3+c.length*2;
        if(score<5)continue;
        let rawAt=-1;
        for(const t of [...p,...m]){
          const pos=text.toLowerCase().indexOf(String(t).toLowerCase());
          if(pos>=0&&(rawAt<0||pos<rawAt))rawAt=pos;
        }
        if(rawAt<0)rawAt=0;
        hits.push({
          doc,
          bookPage:V.SourcePDF.bookPage(doc,pdfPage),
          pdfPage,
          score,
          primary:p,
          material:m,
          context:c,
          snippet:text.slice(Math.max(0,rawAt-500),Math.min(text.length,rawAt+2600))
        });
      }
    }
    hits.sort((a,b)=>b.score-a.score||a.doc.localeCompare(b.doc)||a.bookPage-b.bookPage);
    return {docs,hits:hits.slice(0,100)};
  },{primary,material,context});

  console.log('COMBUSTION_PRODUCTS_AUDIT_META',JSON.stringify(result.docs));
  for(const hit of result.hits)console.log('COMBUSTION_PRODUCTS_AUDIT_HIT',JSON.stringify(hit));
  console.log('COMBUSTION_PRODUCTS_AUDIT_COMPLETE',JSON.stringify({
    hitCount:result.hits.length,
    hcnRelated:result.hits.filter(x=>x.primary.some(t=>/시안화수소|사이안화수소|hcn|청산/i.test(t))).map(x=>({doc:x.doc,bookPage:x.bookPage,context:x.context,material:x.material})),
    toxicSmokeRelated:result.hits.filter(x=>x.context.some(t=>/연기|독성|유독|연소생성물|연소가스|열분해/.test(t))).slice(0,30).map(x=>({doc:x.doc,bookPage:x.bookPage,primary:x.primary,material:x.material,context:x.context}))
  }));
  await ctx.close();
}finally{
  await browser.close();
}
