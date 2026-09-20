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
function structuredChanges(oldRow,newRow){
  const labels={
    applicationStart:'원서접수 시작',
    applicationEnd:'원서접수 마감',
    writtenExam:'필기시험',
    physicalExam:'체력시험',
    interview:'면접시험',
    finalResult:'최종발표'
  };
  const out=[];
  for(const [key,label] of Object.entries(labels)){
    const before=String(oldRow?.schedule?.[key]||''),after=String(newRow?.schedule?.[key]||'');
    if(before!==after)out.push(label+' '+(before||'없음')+' → '+(after||'없음'));
  }
  const oldFiles=new Set((oldRow?.attachments||[]).map(x=>String(x?.url||'')).filter(Boolean));
  const newFiles=new Set((newRow?.attachments||[]).map(x=>String(x?.url||'')).filter(Boolean));
  const filesChanged=oldFiles.size!==newFiles.size||[...oldFiles].some(x=>!newFiles.has(x));
  if(filesChanged)out.push('공식 첨부파일 변경');
  if(!out.length&&String(oldRow?.title||'')!==String(newRow?.title||''))out.push('공고 제목 변경');
  if(!out.length&&String(oldRow?.publishedAt||'')!==String(newRow?.publishedAt||''))out.push('게시일 정보 변경');
  if(!out.length)out.push('공식 게시물 내용 변경');
  return out.slice(0,8)
}
function applyDelta(snapshot,previous){
  const prev=new Map((previous?.items||[]).map(x=>[x.id,x]));
  const newIds=[],updatedIds=[];
  snapshot.items=snapshot.items.map(row=>{
    const old=prev.get(row.id);
    let changeState='same';
    if(!old){changeState='new';newIds.push(row.id)}
    else if(row.fingerprint&&old.fingerprint&&row.fingerprint!==old.fingerprint){changeState='updated';updatedIds.push(row.id)}
    return{
      ...row,
      changeState,
      previousFingerprint:changeState==='updated'?old.fingerprint||'':'',
      changeSummary:changeState==='updated'?structuredChanges(old,row):[]
    }
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
