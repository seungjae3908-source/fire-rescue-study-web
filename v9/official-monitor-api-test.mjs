import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const handler=require('../api/official-monitor.js');
const originalFetch=globalThis.fetch;
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const sourceStatus=[
  {id:'gosi-fire',label:'국가공무원 채용시스템 · 소방청',ok:true,pagesOk:1,status:'ok',error:''},
  {id:'nfsa-notice',label:'중앙소방학교 고시·공고',ok:true,pagesOk:1,status:'ok',error:''},
  {id:'nfsa-materials',label:'중앙소방학교 공식교재',ok:true,pagesOk:1,status:'ok',error:''}
];
const snapshot={
  version:'119-official-monitor-snapshot-v1',
  generatedAt:new Date().toISOString(),
  targetExamYear:2027,
  baselineYear:2026,
  officialOnly:true,
  healthy:true,
  coverageComplete:true,
  degraded:false,
  policy:{requiredSourceCount:1,totalSourceCount:3,wafBypassForbidden:true},
  sourceStatus,
  items:[{
    id:'api-test-2027',
    sourceId:'gosi-fire',
    sourceLabel:'국가공무원 채용시스템 · 소방청',
    title:'2027년 소방공무원 채용시험 시행계획 공고',
    publishedAt:'2026-12-20',
    url:'https://gongmuwon.gosi.kr/spcsv/indexMain3.do',
    kind:'recruitment_notice',
    meaningful:true,
    reviewRequired:true,
    targetYearMatch:true,
    baselineYearMatch:false,
    noticeYear:2027
  }]
};
const healthyState={
  version:'119-official-monitor-health-v1',
  generatedAt:new Date().toISOString(),
  healthy:true,
  degraded:false,
  sourceStatus
};

let currentSnapshot=snapshot;
let currentHealth=healthyState;
let fetchCalls=[];
globalThis.fetch=async url=>{
  const value=String(url);
  fetchCalls.push(value);
  if(value.includes('official-monitor-health.json'))return new Response(JSON.stringify(currentHealth),{status:200,headers:{'content-type':'application/json'}});
  if(value.includes('official-monitor.json'))return new Response(JSON.stringify(currentSnapshot),{status:200,headers:{'content-type':'application/json'}});
  throw new Error('UNEXPECTED_LIVE_FETCH_'+value);
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
  assert(fetchCalls.some(x=>x.includes('chore/official-monitor-snapshot'))&&fetchCalls.some(x=>x.includes('official-monitor-health.json')),'root monitor API reads isolated snapshot and health state');
  assert(/s-maxage=900/.test(getRes.headers['cache-control']||''),'healthy root monitor API exposes bounded shared-cache policy');

  const failedSources=sourceStatus.map(x=>({...x,ok:false,pagesOk:0,status:'error',error:'fetch failed',errorCode:'UND_ERR_CONNECT_TIMEOUT'}));
  currentSnapshot={...snapshot,generatedAt:new Date().toISOString(),healthy:false,degraded:true,preservedLastGood:true,notificationSuppressed:true,lastSuccessfulAt:'2026-09-20T04:40:12.111Z',sourceStatus:failedSources};
  currentHealth={version:'119-official-monitor-health-v1',generatedAt:new Date().toISOString(),healthy:false,degraded:true,preservedLastGood:true,lastSuccessfulAt:'2026-09-20T04:40:12.111Z',sourceStatus:failedSources};
  fetchCalls=[];
  const degradedRes=response();
  await handler({method:'GET'},degradedRes);
  assert(degradedRes.code===200&&degradedRes.body?.transport==='degraded-snapshot'&&degradedRes.body?.stale===true,'recent known outage serves preserved degraded snapshot instead of pretending it is healthy');
  assert(degradedRes.body?.items?.length===1&&degradedRes.body?.notificationSuppressed===true,'degraded API response preserves last-good items while suppressing new-notice claims');
  assert(fetchCalls.every(x=>x.includes('raw.githubusercontent.com')),'recent known outage does not hammer official sites from each app API request');
  assert(/s-maxage=60/.test(degradedRes.headers['cache-control']||''),'degraded monitor state uses a short shared-cache window');

  const postRes=response();
  await handler({method:'POST'},postRes);
  assert(postRes.code===405&&postRes.body?.error==='METHOD_NOT_ALLOWED','root monitor API rejects non-GET methods');
  assert(postRes.headers.allow==='GET','root monitor API advertises GET as the only method');
  console.log('OFFICIAL_MONITOR_API_TEST_COMPLETE');
}finally{
  globalThis.fetch=originalFetch;
}
