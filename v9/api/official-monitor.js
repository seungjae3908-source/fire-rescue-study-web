'use strict';
const SNAPSHOT='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json';
const HOSTS=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','nfsa.go.kr','cherish.nfsa.go.kr']);
const MAX_STALE_MS=90*60*1000;

function official(url){
  try{const u=new URL(String(url||''));return u.protocol==='https:'&&HOSTS.has(u.hostname.toLowerCase())}catch{return false}
}
function valid(x){
  return !!x&&x.version==='119-official-monitor-snapshot-v1'&&x.officialOnly===true&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)&&x.items.every(i=>i?.id&&i?.title&&official(i.url));
}
async function fetchSnapshot(){
  const r=await fetch(SNAPSHOT,{headers:{'user-agent':'119-study-official-monitor-api/1.0','cache-control':'no-cache'}});
  if(!r.ok)throw new Error('SNAPSHOT_HTTP_'+r.status);
  const x=await r.json();
  if(!valid(x))throw new Error('INVALID_SNAPSHOT');
  return x;
}
async function fetchLive(){
  const mod=await import('../official-monitor-lib.mjs');
  const x=await mod.collectOfficialNotices(fetch,new Date());
  if(!valid(x))throw new Error('INVALID_LIVE');
  return x;
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=21600');

  let snapshot=null;
  let transport='snapshot';
  try{snapshot=await fetchSnapshot()}catch{}

  const stale=!snapshot||!snapshot.generatedAt||Date.now()-Date.parse(snapshot.generatedAt)>MAX_STALE_MS;
  if(stale){
    try{snapshot=await fetchLive();transport='live-fallback'}
    catch{
      if(!snapshot)return res.status(503).json({error:'OFFICIAL_MONITOR_UNAVAILABLE'});
      transport='stale-snapshot';
    }
  }
  return res.status(200).json({...snapshot,transport});
};
