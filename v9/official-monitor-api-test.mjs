import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const handler=require('../api/official-monitor.js');
const originalFetch=globalThis.fetch;
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const snapshot={
  version:'119-official-monitor-snapshot-v1',
  generatedAt:new Date().toISOString(),
  targetExamYear:2027,
  baselineYear:2026,
  officialOnly:true,
  healthy:true,
  sourceStatus:[
    {id:'nfa-recruit',label:'소방청 채용·시험',ok:true,pagesOk:3,status:'ok',error:''},
    {id:'nfsa-notice',label:'중앙소방학교 고시·공고',ok:true,pagesOk:1,status:'ok',error:''},
    {id:'nfsa-materials',label:'중앙소방학교 공식교재',ok:true,pagesOk:2,status:'ok',error:''}
  ],
  items:[{
    id:'api-test-2027',
    sourceId:'nfa-recruit',
    sourceLabel:'소방청 채용·시험',
    title:'2027년 소방공무원 채용시험 시행계획 공고',
    publishedAt:'2026-12-20',
    url:'https://www.nfa.go.kr/nfa/news/job/nfajob/?mode=view&cntId=api-test',
    kind:'recruitment_notice',
    meaningful:true,
    reviewRequired:true,
    targetYearMatch:true,
    baselineYearMatch:false,
    noticeYear:2027
  }]
};

let fetchCalls=[];
globalThis.fetch=async url=>{
  fetchCalls.push(String(url));
  return new Response(JSON.stringify(snapshot),{status:200,headers:{'content-type':'application/json'}});
};

function response(){
  return{
    code:200,headers:{},body:null,
    setHeader(k,v){this.headers[String(k).toLowerCase()]=String(v)},
    status(n){this.code=n;return this},
    json(x){this.body=x;return this}
  }
}

try{
  const getRes=response();
  await handler({method:'GET'},getRes);
  assert(getRes.code===200,'root monitor API GET returns 200');
  assert(getRes.body?.officialOnly===true&&getRes.body?.transport==='snapshot','root monitor API returns validated official snapshot transport');
  assert(getRes.body?.items?.length===1&&getRes.body.items[0].targetYearMatch===true,'root monitor API preserves target-year official notice metadata');
  assert(fetchCalls.some(x=>x.includes('chore/official-monitor-snapshot')),'root monitor API reads isolated snapshot branch');
  assert(/s-maxage=900/.test(getRes.headers['cache-control']||''),'root monitor API exposes bounded shared-cache policy');

  const postRes=response();
  await handler({method:'POST'},postRes);
  assert(postRes.code===405&&postRes.body?.error==='METHOD_NOT_ALLOWED','root monitor API rejects non-GET methods');
  assert(postRes.headers.allow==='GET','root monitor API advertises GET as the only method');
  console.log('OFFICIAL_MONITOR_API_TEST_COMPLETE');
}finally{
  globalThis.fetch=originalFetch;
}
