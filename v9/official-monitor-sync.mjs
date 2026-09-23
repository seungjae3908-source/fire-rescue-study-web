import fs from 'node:fs';
import path from 'node:path';
import { collectOfficialNotices } from './official-monitor-lib.mjs';

const SNAPSHOT_ROOT='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data';
const PREVIOUS_URL=SNAPSHOT_ROOT+'/official-monitor.json';
const LAST_GOOD_URL=SNAPSHOT_ROOT+'/official-monitor-last-good.json';

function argValue(name,fallback){
  const idx=process.argv.indexOf(name);
  return idx>=0&&process.argv[idx+1]?process.argv[idx+1]:fallback;
}
const output=argValue('--output','v9/data/official-monitor.json');
const lastGoodOutput=argValue('--last-good-output','');
const healthOutput=argValue('--health-output','');

async function readRemote(url){
  try{
    const res=await fetch(url,{headers:{'user-agent':'119-study-official-monitor-sync/3.0','cache-control':'no-cache'}});
    if(!res.ok)return null;
    const x=await res.json();
    return x?.version==='119-official-monitor-snapshot-v1'&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)?x:null;
  }catch{return null}
}
async function previousSnapshot(){
  return await readRemote(LAST_GOOD_URL)||await readRemote(PREVIOUS_URL);
}
function writeJson(file,value){
  if(!file)return;
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
}
function isPublishableMonitorRow(row){
  if(row?.sourceId!=='nfsa-notice')return true;
  try{
    const url=new URL(String(row?.url||''));
    const mode=String(url.searchParams.get('mode')||'').toLowerCase();
    const hasStablePostId=['cntId','cntid','nttId','nttid'].some(key=>url.searchParams.has(key));
    return mode==='view'||hasStablePostId;
  }catch{return false}
}
function filterNavigationRows(snapshot){
  const before=Array.isArray(snapshot?.items)?snapshot.items:[];
  const items=before.filter(isPublishableMonitorRow);
  if(items.length!==before.length){
    console.log('OFFICIAL_MONITOR_NAV_ROWS_FILTERED',before.length-items.length);
  }
  return{...snapshot,items};
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
function degradedSnapshot(live,lastGood){
  const base=lastGood?{...lastGood,items:lastGood.items.map(x=>({...x,changeState:'same',changeSummary:[]}))}:{...live,items:[]};
  return{
    ...base,
    generatedAt:live.generatedAt,
    healthy:false,
    coverageComplete:false,
    degraded:true,
    preservedLastGood:!!lastGood,
    notificationSuppressed:true,
    lastAttemptAt:live.generatedAt,
    lastSuccessfulAt:lastGood?.lastSuccessfulAt||lastGood?.generatedAt||'',
    sourceStatus:live.sourceStatus,
    liveItemCount:live.items.length,
    delta:{newIds:[],updatedIds:[],newCount:0,updatedCount:0}
  };
}

const previous=await previousSnapshot();
const collected=await collectOfficialNotices(fetch,new Date());
const live=filterNavigationRows(collected);
let snapshot;

if(live.healthy){
  snapshot=applyDelta({
    ...live,
    degraded:live.coverageComplete!==true,
    preservedLastGood:false,
    notificationSuppressed:false,
    lastAttemptAt:live.generatedAt,
    lastSuccessfulAt:live.generatedAt
  },previous);
  if(lastGoodOutput&&live.coverageComplete===true)writeJson(lastGoodOutput,snapshot);
}else{
  snapshot=degradedSnapshot(live,previous?.healthy===true?previous:null);
}

const health={
  version:'119-official-monitor-health-v1',
  generatedAt:live.generatedAt,
  healthy:live.healthy,
  coverageComplete:live.coverageComplete===true,
  degraded:live.healthy!==true||live.coverageComplete!==true,
  preservedLastGood:snapshot.preservedLastGood===true,
  lastSuccessfulAt:snapshot.lastSuccessfulAt||'',
  sourceStatus:live.sourceStatus,
  liveItems:live.items.length,
  targetYear:live.items.filter(x=>x.targetYearMatch).length,
  reviewRequired:live.items.filter(x=>x.reviewRequired).length
};

writeJson(output,snapshot);
writeJson(healthOutput,health);

console.log('OFFICIAL_MONITOR_SYNC_SUMMARY',JSON.stringify({
  generatedAt:snapshot.generatedAt,
  healthy:snapshot.healthy,
  coverageComplete:snapshot.coverageComplete===true,
  degraded:snapshot.degraded,
  preservedLastGood:snapshot.preservedLastGood,
  lastSuccessfulAt:snapshot.lastSuccessfulAt,
  sources:snapshot.sourceStatus,
  items:snapshot.items.length,
  liveItems:live.items.length,
  targetYear:live.items.filter(x=>x.targetYearMatch).length,
  reviewRequired:live.items.filter(x=>x.reviewRequired).length,
  delta:snapshot.delta
},null,2));

console.log('OFFICIAL_MONITOR_SYNC_OUTPUT',output);
if(healthOutput)console.log('OFFICIAL_MONITOR_HEALTH_OUTPUT',healthOutput);
if(lastGoodOutput&&live.coverageComplete===true)console.log('OFFICIAL_MONITOR_LAST_GOOD_OUTPUT',lastGoodOutput);

if(!live.healthy){
  console.error('OFFICIAL_MONITOR_SYNC_UNHEALTHY_PRESERVED',snapshot.preservedLastGood?'LAST_GOOD':'BOOTSTRAP_EMPTY');
  process.exit(2);
}

console.log('OFFICIAL_MONITOR_SYNC_COMPLETE',output);