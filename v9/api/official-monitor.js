'use strict';
const SNAPSHOT_ROOT='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data';
const SNAPSHOT=SNAPSHOT_ROOT+'/official-monitor.json';
const HEALTH=SNAPSHOT_ROOT+'/official-monitor-health.json';
const HOSTS=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','cherish.nfsa.go.kr','gongmuwon.gosi.kr']);
const MAX_STALE_MS=90*60*1000;

function official(url){
  try{const u=new URL(String(url||''));return u.protocol==='https:'&&HOSTS.has(u.hostname.toLowerCase())}catch{return false}
}
function valid(x){
  const required=Number(x?.policy?.requiredSourceCount||0);
  const total=Number(x?.policy?.totalSourceCount||x?.sourceStatus?.length||0);
  return !!x&&x.version==='119-official-monitor-snapshot-v1'&&x.officialOnly===true&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)&&required>0&&total>=required&&x.sourceStatus.length===total&&x.items.every(i=>i?.id&&i?.title&&official(i.url));
}
function validHealth(x){
  return !!x&&x.version==='119-official-monitor-health-v1'&&Array.isArray(x.sourceStatus)&&typeof x.healthy==='boolean';
}
function ageMs(value){
  const n=Date.parse(String(value||''));
  return Number.isFinite(n)?Math.max(0,Date.now()-n):Number.POSITIVE_INFINITY;
}
function healthFromSnapshot(x){
  const items=Array.isArray(x?.items)?x.items:[];
  const healthy=x?.healthy===true;
  const coverageComplete=x?.coverageComplete===true;
  return{
    version:'119-official-monitor-health-v1',
    generatedAt:String(x?.generatedAt||new Date().toISOString()),
    healthy,
    coverageComplete,
    degraded:!healthy||!coverageComplete,
    preservedLastGood:x?.preservedLastGood===true,
    lastSuccessfulAt:healthy?String(x?.generatedAt||''):String(x?.lastSuccessfulAt||''),
    sourceStatus:Array.isArray(x?.sourceStatus)?x.sourceStatus:[],
    liveItems:items.length,
    targetYear:items.filter(i=>i?.targetYearMatch).length,
    reviewRequired:items.filter(i=>i?.reviewRequired).length
  };
}
async function fetchJson(url,validator){
  const r=await fetch(url,{headers:{'user-agent':'119-study-official-monitor-api/2.0','cache-control':'no-cache'}});
  if(!r.ok)throw new Error('HTTP_'+r.status);
  const x=await r.json();
  if(!validator(x))throw new Error('INVALID_MONITOR_PAYLOAD');
  return x;
}
async function fetchSnapshot(){return await fetchJson(SNAPSHOT,valid)}
async function fetchHealth(){return await fetchJson(HEALTH,validHealth)}
async function fetchLive(){
  const mod=await import('../official-monitor-lib.mjs');
  const x=await mod.collectOfficialNotices(fetch,new Date());
  if(!valid(x))throw new Error('INVALID_LIVE');
  return x;
}
function send(res,snapshot,transport,health,stale=false){
  res.setHeader('Cache-Control',stale?'public, s-maxage=60, stale-while-revalidate=300':'public, s-maxage=900, stale-while-revalidate=21600');
  return res.status(200).json({...snapshot,transport,health:health||null,stale});
}

async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  res.setHeader('Content-Type','application/json; charset=utf-8');

  let snapshot=null,health=null;
  try{snapshot=await fetchSnapshot()}catch{}
  try{health=await fetchHealth()}catch{}

  const snapshotStale=!snapshot||snapshot.healthy!==true||ageMs(snapshot.generatedAt)>MAX_STALE_MS;
  const recentKnownOutage=!!snapshot&&snapshot.healthy!==true&&health?.healthy===false&&ageMs(health.generatedAt)<=MAX_STALE_MS;

  if(recentKnownOutage){
    return send(res,snapshot,'degraded-snapshot',health,true);
  }

  if(snapshotStale){
    try{
      const live=await fetchLive();
      const liveHealth=healthFromSnapshot(live);
      if(live.healthy===true)return send(res,{...live,degraded:live.coverageComplete!==true,notificationSuppressed:false},'live-fallback',liveHealth,false);
      if(snapshot)return send(res,snapshot,'stale-snapshot',liveHealth,true);
      return res.status(503).json({error:'OFFICIAL_MONITOR_UNAVAILABLE',health:liveHealth});
    }catch{
      if(snapshot)return send(res,snapshot,'stale-snapshot',health,true);
      return res.status(503).json({error:'OFFICIAL_MONITOR_UNAVAILABLE',health});
    }
  }

  return send(res,snapshot,'snapshot',health,false);
}

handler.healthFromSnapshot=healthFromSnapshot;
module.exports=handler;
