import { chromium } from 'playwright';

const defs=[
  {key:'ems',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword='},
  {key:'fire1',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword='},
  {key:'laws',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword='},
  {key:'prevention',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword='}
];
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({locale:'ko-KR',userAgent:'Mozilla/5.0 119-study-source-browser-probe/1.0'});
  const p=await ctx.newPage();
  for(const def of defs){
    const res=await p.goto(def.url,{waitUntil:'domcontentloaded',timeout:30000});
    await p.waitForTimeout(1000);
    const data=await p.evaluate(()=>{
      const rows=[...document.querySelectorAll('.section-attach li.file')];
      return rows.map(li=>{
        const name=li.querySelector('.fileOnm')?.textContent?.replace(/\s+/g,' ').trim()||'';
        const onclicks=[...li.querySelectorAll('[onclick]')].map(x=>x.getAttribute('onclick')||'');
        const hrefs=[...li.querySelectorAll('a[href]')].map(x=>x.getAttribute('href')||'');
        return{name,onclicks,hrefs};
      });
    });
    const attachments=[];
    for(const row of data){
      const text=[...row.onclicks,...row.hrefs].join('\n');
      const paths=[...text.matchAll(/(?:Jnit_boardDownload\(|['"])\s*['"]?(\/board\/file\/[^'")\s;]+(?:;jsessionid=[^'")\s]+)?)/g)].map(m=>m[1]);
      const clean=[...new Set(paths.map(x=>x.replace(/;jsessionid=[^?'")\s]+/gi,'')))];
      for(const path of clean){
        const url=new URL(path,'https://www.nfa.go.kr').href;
        let pdf=false,status=0,type='';
        try{
          const check=await p.evaluate(async u=>{
            const r=await fetch(u,{headers:{Range:'bytes=0-7'}});
            const b=new Uint8Array(await r.arrayBuffer());
            return{status:r.status,type:r.headers.get('content-type')||'',head:String.fromCharCode(...b.slice(0,5))};
          },url);
          status=check.status;type=check.type;pdf=check.head==='%PDF-';
        }catch{}
        attachments.push({name:row.name,path,url,status,type,pdf});
      }
    }
    console.log('SOURCE_BROWSER_CATALOG',JSON.stringify({key:def.key,http:res?.status()||0,title:await p.title(),attachments},null,2));
  }
  await ctx.close();
}finally{await browser.close()}
