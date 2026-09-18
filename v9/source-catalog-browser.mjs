import { chromium } from 'playwright';

const defs=[
  {key:'ems',title:'2026년 공통교재 [소방전술3]'},
  {key:'fire1',title:'2026년 공통교재 [소방전술1]'},
  {key:'prevention',title:'2026년 공통교재 [예방실무1/예방실무2]'},
  {key:'laws',title:'2026년 공통교재 [소방법령1~5]'}
];
const listUrl='https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/';
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const stripSession=x=>x.replace(/;jsessionid=[^?'")\s]+/gi,'');
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({
    locale:'ko-KR',
    userAgent:'Mozilla/5.0 119-study-source-catalog/2.0',
    extraHTTPHeaders:{'accept-language':'ko-KR,ko;q=0.9'}
  });
  const p=await ctx.newPage();
  for(const def of defs){
    let data=[],detailUrl='',ok=false;
    for(let attempt=0;attempt<8;attempt++){
      await p.goto(listUrl,{waitUntil:'domcontentloaded',timeout:45000}).catch(()=>{});
      const link=p.getByRole('link',{name:def.title,exact:true}).first();
      if(!(await link.count())){await p.waitForTimeout(700);continue}
      await Promise.all([
        p.waitForLoadState('domcontentloaded',{timeout:30000}).catch(()=>{}),
        link.click({timeout:15000}).catch(()=>{})
      ]);
      await p.waitForTimeout(500);
      detailUrl=p.url();
      const body=await p.locator('body').innerText().catch(()=> '');
      if(body.includes(def.title)&&/첨부파일/.test(body)&&/\.pdf/i.test(body)){
        data=await p.evaluate(()=>[...document.querySelectorAll('li.file')].map(li=>({
          name:li.querySelector('.fileOnm')?.textContent?.replace(/\s+/g,' ').trim()||'',
          raw:[...li.querySelectorAll('a,button')].flatMap(el=>[
            el.getAttribute('href')||'',
            el.getAttribute('onclick')||''
          ]).filter(Boolean)
        })).filter(x=>/\.pdf$/i.test(x.name)));
        if(data.length){ok=true;break}
      }
      await p.waitForTimeout(600);
    }
    const attachments=[];
    for(const row of data){
      const text=row.raw.join('\n');
      const paths=[...text.matchAll(/['"]?(\/board\/file\/[^'")\s]+(?:pdfFileDownload)?(?:;jsessionid=[^'")\s]+)?)['"]?/g)]
        .map(m=>stripSession(clean(m[1])))
        .filter(x=>x.includes('/board/file/'));
      for(const path of [...new Set(paths)]){
        if(!/pdfFileDownload|FILE_/i.test(path))continue;
        attachments.push({name:row.name,path,url:new URL(path,'https://www.nfa.go.kr').href});
      }
    }
    console.log('BROWSER_SOURCE_CATALOG',JSON.stringify({key:def.key,title:def.title,detailUrl,ok,attachments},null,2));
  }
  await ctx.close();
}finally{await browser.close()}
