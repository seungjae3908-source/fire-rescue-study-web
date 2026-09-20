import {collectOfficialNotices} from './official-monitor-lib.mjs';

const snapshot=await collectOfficialNotices(fetch,new Date());
const summary={
  generatedAt:snapshot.generatedAt,
  healthy:snapshot.healthy,
  sourceStatus:snapshot.sourceStatus,
  items:snapshot.items.length,
  targetYear:snapshot.items.filter(x=>x.targetYearMatch).length,
  reviewRequired:snapshot.items.filter(x=>x.reviewRequired).length
};
console.log('OFFICIAL_MONITOR_LIVE_PROBE',JSON.stringify(summary,null,2));
if(!snapshot.sourceStatus.some(x=>x.id==='nfa-recruit'&&x.ok))throw new Error('NFA_RECRUIT_SOURCE_UNAVAILABLE');
if(snapshot.sourceStatus.filter(x=>x.ok).length<2)throw new Error('OFFICIAL_MONITOR_TOO_FEW_HEALTHY_SOURCES');
if(snapshot.items.length<1)throw new Error('OFFICIAL_MONITOR_NO_RELEVANT_ITEMS');
console.log('OFFICIAL_MONITOR_LIVE_PROBE_COMPLETE');
