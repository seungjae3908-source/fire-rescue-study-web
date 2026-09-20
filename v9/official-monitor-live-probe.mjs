import {collectOfficialNotices,SOURCES} from './official-monitor-lib.mjs';

const started=Date.now();
const snapshot=await collectOfficialNotices(fetch,new Date());
const elapsedMs=Date.now()-started;
const summary={
  generatedAt:snapshot.generatedAt,
  healthy:snapshot.healthy,
  sourceStatus:snapshot.sourceStatus,
  items:snapshot.items.length,
  targetYear:snapshot.items.filter(x=>x.targetYearMatch).length,
  reviewRequired:snapshot.items.filter(x=>x.reviewRequired).length,
  elapsedMs
};
console.log('OFFICIAL_MONITOR_LIVE_PROBE',JSON.stringify(summary,null,2));
if(snapshot.sourceStatus.length!==SOURCES.length)throw new Error('OFFICIAL_MONITOR_SOURCE_COUNT_MISMATCH');
if(!snapshot.healthy)throw new Error('OFFICIAL_MONITOR_SOURCE_UNHEALTHY');
if(snapshot.sourceStatus.some(x=>!x.ok))throw new Error('OFFICIAL_MONITOR_SOURCE_PARTIAL');
if(snapshot.items.length<1)throw new Error('OFFICIAL_MONITOR_NO_RELEVANT_ITEMS');
if(elapsedMs>70000)throw new Error('OFFICIAL_MONITOR_PROBE_TOO_SLOW_'+elapsedMs);
console.log('OFFICIAL_MONITOR_LIVE_PROBE_COMPLETE');
