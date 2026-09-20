import fs from 'node:fs';
import path from 'node:path';
import { collectOfficialNotices } from './official-monitor-lib.mjs';

const PREVIOUS_URL='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json';
const idx = process.argv.indexOf('--output');
const output = idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : 'v9/data/official-monitor.json';

async function previousSnapshot(){
  try{
    const res=await fetch(PREVIOUS_URL,{headers:{'user-agent':'119-study-official-monitor-sync/2.0','cache-control':'no-cache'}});
    if(!res.ok)return null;
    const x=await res.json();
    return x?.version==='119-official-monitor-snapshot-v1'&&Array.isArray(x.items)?x:null;
  }catch{return null}
}
function applyDelta(snapshot,previous){
  const prev=new Map((previous?.items||[]).map(x=>[x.id,x]));
  const newIds=[],updatedIds=[];
  snapshot.items=snapshot.items.map(row=>{
    const old=prev.get(row.id);
    let changeState='same';
    if(!old){changeState='new';newIds.push(row.id)}
    else if(row.fingerprint&&old.fingerprint&&row.fingerprint!==old.fingerprint){changeState='updated';updatedIds.push(row.id)}
    return{...row,changeState,previousFingerprint:changeState==='updated'?old.fingerprint||'':''}
  });
  snapshot.delta={newIds,updatedIds,newCount:newIds.length,updatedCount:updatedIds.length};
  return snapshot
}

const previous=await previousSnapshot();
const snapshot=applyDelta(await collectOfficialNotices(fetch, new Date()),previous);

console.log('OFFICIAL_MONITOR_SYNC_SUMMARY', JSON.stringify({
  generatedAt: snapshot.generatedAt,
  healthy: snapshot.healthy,
  sources: snapshot.sourceStatus,
  items: snapshot.items.length,
  targetYear: snapshot.items.filter(x => x.targetYearMatch).length,
  reviewRequired: snapshot.items.filter(x => x.reviewRequired).length,
  delta:snapshot.delta
}, null, 2));

if (!snapshot.healthy) {
  console.error('OFFICIAL_MONITOR_SYNC_UNHEALTHY');
  process.exit(2);
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(snapshot, null, 2) + '\n');
console.log('OFFICIAL_MONITOR_SYNC_COMPLETE', output);
