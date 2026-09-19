import { chromium } from 'playwright';

const defs=[
  {
    key:'ems',
    title:'2026년 공통교재 [소방전술3]',
    url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    expected:['13. 소방전술3(구급)-저용량.pdf']
  },
  {
    key:'fire1',
    title:'2026년 공통교재 [소방전술1]',
    url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    expected:['10. 소방전술1(화재1).pdf','11. 소방전술1(화재2).pdf']
  },
  {
    key:'prevention',
    title:'2026년 공통교재 [예방실무1/예방실무2]',
    url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    expected:['1.예방실무1.pdf','2.예방실무2.pdf']
  },
  {
    key:'laws',
    title:'2026년 공통교재 [소방법령1~5]',
    url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    expected:['3._소방법령1.pdf','4. 소방법령2.pdf','5. 소방법령3.pdf','6. 소방법령4.pdf','7. 소방법령5.pdf']
  }
];

const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const norm=x=>clean(x).toLowerCase().replace(/&nbsp;/g,' ').replace(/[\s_-]+/g,'').replace(/[^0-9a-z가-힣().]/g,'');
const stripSession=x=>String(x||'').replace(/;jsessionid=[^?'")\s]+/gi,'');
const pathRe=/(\/board\/file\/[^'")\s]+(?:;jsessionid=[^'")\s]+)?)/gi;

function extractPaths(rows){
  const out=[];
  for(const row of rows){
    const raw=[row.href,row.onclick,row.action,row.outer].filter(Boolean).join('\n');
    for(const m of raw.matchAll(pathRe)){
      const path=clean(m[1]);
      if(!path.includes('/board/file/'))continue;
      out.push({text:row.text||'',path,url:new URL(path,'https://www.nfa.go.kr').href,stablePath:stripSession(path)});
    }
  }
  return [...new Map(out.map(x=>[x.path,x])).values()];
}

const browser=await chromium.launch({headless:true});
let failed=false,externalBlocked=0;
try{
  const ctx=await browser.newContext({
    locale:'ko-KR',
    userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140 Safari/537.36 119-study-source-probe/3.0',
    extraHTTPHeaders:{'accept-language':'ko-KR,ko;q=0.9,en;q=0.7'}
  });
  async function stableSnapshot(p){
    let lastErr=null;
    for(let attempt=1;attempt<=4;attempt++){
      try{
        await p.waitForLoadState('domcontentloaded',{timeout:15000}).catch(()=>{});
        await p.waitForTimeout(1000*attempt);
        return await p.evaluate(()=>{
          const all=[...document.querySelectorAll('a,button,[onclick],[href],li,tr,div,p,span')];
          const rows=[];
          for(const el of all){
            const text=(el.textContent||'').replace(/\s+/g,' ').trim();
            const href=el.getAttribute?.('href')||'';
            const onclick=el.getAttribute?.('onclick')||'';
            const action=el.getAttribute?.('action')||'';
            const interesting=/\.pdf/i.test(text)||/\.pdf|\/board\/file\/|Jnit_boardDownload/i.test(href+' '+onclick+' '+action);
            if(!interesting)continue;
            rows.push({
              tag:el.tagName,
              text:text.slice(0,500),
              href,
              onclick,
              action,
              outer:(el.outerHTML||'').slice(0,2500)
            });
          }
          return {
            title:document.title,
            bodyText:(document.body?.innerText||'').slice(0,20000),
            rows:rows.slice(0,200)
          };
        });
      }catch(err){
        lastErr=err;
        if(!/Execution context was destroyed|navigation/i.test(String(err?.message||err)))throw err;
      }
    }
    throw lastErr||new Error('SOURCE_SNAPSHOT_UNSTABLE');
  }

  for(const def of defs){
    const p=await ctx.newPage();
    let res=null,snap=null;
    try{
      res=await p.goto(def.url,{waitUntil:'domcontentloaded',timeout:45000});
      snap=await stableSnapshot(p);
    }catch(err){
      failed=true;
      console.log('BROWSER_SOURCE_CATALOG',JSON.stringify({key:def.key,http:res?.status?.()||0,finalUrl:p.url(),ok:false,error:String(err?.message||err)},null,2));
      await p.close().catch(()=>{});
      continue;
    }

    const paths=extractPaths(snap.rows);
    const checks=def.expected.map(name=>{
      const n=norm(name);
      const textHit=snap.rows.some(r=>norm(r.text).includes(n)||norm(r.outer).includes(n));
      const candidate=paths.find(x=>norm(x.text).includes(n))||null;
      return {name,textHit,candidate};
    });
    const visitorGate=/방문자\s*확인|visitor\s*(check|verification)/i.test(String(snap.title||'')+' '+String(snap.bodyText||''));
    const ok=checks.every(x=>x.textHit)&&paths.length>0;
    if(visitorGate&&!ok)externalBlocked++;
    else if(!ok)failed=true;

    console.log('BROWSER_SOURCE_CATALOG',JSON.stringify({
      key:def.key,
      http:res?.status()||0,
      finalUrl:p.url(),
      title:snap.title,
      expected:def.expected,
      ok,
      externalStatus:visitorGate&&!ok?'NFA_VISITOR_GATE_BLOCKED':'DIRECT_PAGE_VISIBLE',
      checks,
      paths,
      candidateRows:snap.rows.slice(0,40)
    },null,2));
    await p.close().catch(()=>{});
  }
  await ctx.close();
}finally{
  await browser.close();
}
console.log('BROWSER_SOURCE_CATALOG_SUMMARY',JSON.stringify({total:defs.length,externalBlocked,unexpectedFailures:failed?1:0,policy:'NFA visitor/WAF gate is reported explicitly and is not treated as an app failure; official proxy/mirror integrity is release-gated separately.'}));
if(failed)throw new Error('OFFICIAL_SOURCE_BROWSER_PROBE_FAILED');
