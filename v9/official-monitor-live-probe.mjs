import {collectOfficialNotices,SOURCES} from './official-monitor-lib.mjs';

const started=Date.now();
const snapshot=await collectOfficialNotices(fetch,new Date());
const elapsedMs=Date.now()-started;
const summary={
  generatedAt:snapshot.generatedAt,
  healthy:snapshot.healthy,
  coverageComplete:snapshot.coverageComplete===true,
  sourceStatus:snapshot.sourceStatus,
  items:snapshot.items.length,
  targetYear:snapshot.items.filter(x=>x.targetYearMatch).length,
  reviewRequired:snapshot.items.filter(x=>x.reviewRequired).length,
  elapsedMs
};
console.log('OFFICIAL_MONITOR_LIVE_PROBE',JSON.stringify(summary,null,2));

const transportCodes=new Set([
  'UND_ERR_CONNECT_TIMEOUT','UND_ERR_HEADERS_TIMEOUT','UND_ERR_BODY_TIMEOUT','UND_ERR_SOCKET',
  'ECONNRESET','ECONNREFUSED','ETIMEDOUT','ENOTFOUND','EAI_AGAIN','ABORT_ERR','20',
  'ERR_TLS_CERT_ALTNAME_INVALID','CERT_HAS_EXPIRED','UNABLE_TO_VERIFY_LEAF_SIGNATURE'
]);
function isExternalUnavailable(row){
  const code=String(row?.errorCode||'').trim();
  const error=String(row?.error||'');
  return transportCodes.has(code)||/connect timeout|headers timeout|body timeout|operation was aborted|socket|ECONNRESET|ECONNREFUSED|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|certificate|cert(?:ificate)? has expired|hostname\/ip does not match certificate/i.test(error);
}

if(snapshot.sourceStatus.length!==SOURCES.length)throw new Error('OFFICIAL_MONITOR_SOURCE_COUNT_MISMATCH');
const failed=snapshot.sourceStatus.filter(x=>!x.ok);
const unavailable=failed.filter(isExternalUnavailable);
const hardFailures=failed.filter(x=>!isExternalUnavailable(x));
if(hardFailures.length)throw new Error('OFFICIAL_MONITOR_SOURCE_HARD_FAILURE '+JSON.stringify(hardFailures.map(x=>({id:x.id,errorCode:x.errorCode||'',error:x.error||''}))));

const required=snapshot.sourceStatus.filter(x=>x.required!==false);
const requiredUnavailable=required.filter(x=>!x.ok&&isExternalUnavailable(x));
const requiredHardFailure=required.filter(x=>!x.ok&&!isExternalUnavailable(x));
if(required.length<1)throw new Error('OFFICIAL_MONITOR_REQUIRED_SOURCE_MISSING');
if(requiredHardFailure.length)throw new Error('OFFICIAL_MONITOR_REQUIRED_SOURCE_PARTIAL');
if(requiredUnavailable.length){
  console.warn('OFFICIAL_MONITOR_EXTERNAL_UNAVAILABLE',JSON.stringify(requiredUnavailable.map(x=>({id:x.id,errorCode:x.errorCode||'',errorUrl:x.errorUrl||''}))));
}else if(!snapshot.healthy){
  throw new Error('OFFICIAL_MONITOR_SOURCE_UNHEALTHY');
}

if(snapshot.coverageComplete!==true){
  console.warn('OFFICIAL_MONITOR_SUPPLEMENTAL_PARTIAL',JSON.stringify(snapshot.sourceStatus.filter(x=>!x.ok).map(x=>({id:x.id,errorCode:x.errorCode||'',error:x.error||''}))));
}
if(snapshot.items.length<1){
  if(requiredUnavailable.length)console.warn('OFFICIAL_MONITOR_NO_ITEMS_DUE_TO_EXTERNAL_UNAVAILABLE');
  else throw new Error('OFFICIAL_MONITOR_NO_RELEVANT_ITEMS');
}
if(elapsedMs>70000)throw new Error('OFFICIAL_MONITOR_PROBE_TOO_SLOW_'+elapsedMs);
console.log(requiredUnavailable.length?'OFFICIAL_MONITOR_LIVE_PROBE_COMPLETE_WITH_EXTERNAL_UNAVAILABLE':'OFFICIAL_MONITOR_LIVE_PROBE_COMPLETE');
