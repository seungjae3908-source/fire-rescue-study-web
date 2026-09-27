import fs from 'node:fs';

const args=process.argv.slice(2);
const getArg=(name,fallback='')=>{
  const i=args.indexOf(name);
  return i>=0&&args[i+1]?args[i+1]:fallback;
};
const snapshotPath=getArg('--snapshot',process.env.STUDY_119_OFFICIAL_MONITOR_SNAPSHOT||'/tmp/official-monitor.json');
const baselinePath=getArg('--baseline',new URL('./data/official-textbook-baseline.json',import.meta.url).pathname);
const maxAgeHours=Number(getArg('--max-age-hours',process.env.STUDY_119_OFFICIAL_MONITOR_MAX_AGE_HOURS||'6'));
const fail=(code,meta={})=>{
  console.error('OFFICIAL_TEXTBOOK_CHANGE_GATE_FAIL',JSON.stringify({code,...meta}));
  process.exit(1);
};
const readJson=(path,label)=>{
  try{return JSON.parse(fs.readFileSync(path,'utf8'))}
  catch(e){fail(label+'_READ_ERROR',{path,error:String(e?.message||e)})}
};
const snapshot=readJson(snapshotPath,'SNAPSHOT');
const baseline=readJson(baselinePath,'BASELINE');
if(snapshot?.version!=='119-official-monitor-snapshot-v1')fail('SNAPSHOT_VERSION',{version:snapshot?.version||''});
if(baseline?.version!=='119-official-textbook-baseline-v1')fail('BASELINE_VERSION',{version:baseline?.version||''});
const generatedMs=Date.parse(String(snapshot.generatedAt||''));
if(!Number.isFinite(generatedMs))fail('SNAPSHOT_GENERATED_AT_INVALID',{generatedAt:snapshot.generatedAt||''});
const ageHours=(Date.now()-generatedMs)/3600000;
if(ageHours<-.25)fail('SNAPSHOT_FROM_FUTURE',{generatedAt:snapshot.generatedAt,ageHours});
if(ageHours>maxAgeHours)fail('SNAPSHOT_STALE',{generatedAt:snapshot.generatedAt,ageHours:Math.round(ageHours*10)/10,maxAgeHours});
const materialStatus=(snapshot.sourceStatus||[]).find(x=>x?.id==='nfsa-materials');
if(!materialStatus?.ok)fail('NFSA_MATERIALS_UNHEALTHY',{materialStatus:materialStatus||null});
const items=(snapshot.items||[]).filter(x=>x?.sourceId==='nfsa-materials'&&x?.kind==='official_textbook');
if(!items.length)fail('NO_OFFICIAL_TEXTBOOK_ITEMS');
const groups=Array.isArray(baseline.groups)?baseline.groups:[];
if(!groups.length)fail('BASELINE_GROUPS_EMPTY');
const seenDocs=new Set(groups.flatMap(g=>Array.isArray(g.docs)?g.docs:[]));
for(const doc of baseline.scopeDocs||[])if(!seenDocs.has(doc))fail('BASELINE_SCOPE_DOC_UNMAPPED',{doc});
const mismatches=[];
for(const group of groups){
  const row=items.find(x=>x.id===group.id)||items.find(x=>String(x.url||'').includes('cntId='+group.cntId))||items.find(x=>x.title===group.title);
  if(!row){
    mismatches.push({key:group.key,reason:'missing',expected:{id:group.id,title:group.title,cntId:group.cntId}});
    continue;
  }
  const reasons=[];
  if(row.title!==group.title)reasons.push('title');
  if(row.id!==group.id)reasons.push('id');
  if(row.fingerprint!==group.fingerprint)reasons.push('fingerprint');
  if(row.changeState&&row.changeState!=='same')reasons.push('changeState:'+row.changeState);
  if(reasons.length)mismatches.push({
    key:group.key,reason:reasons.join(','),
    expected:{id:group.id,title:group.title,fingerprint:group.fingerprint,cntId:group.cntId},
    actual:{id:row.id,title:row.title,fingerprint:row.fingerprint,cntId:(String(row.url||'').match(/[?&]cntId=(\d+)/)||[])[1]||'',changeState:row.changeState||''}
  });
}
const futureRelevant=items.filter(x=>
  Number(x.noticeYear||x.explicitYear||0)>Number(baseline.baselineYear||0)&&
  /소방법령|소방전술[123]|예방실무/i.test(String(x.title||''))
);
if(futureRelevant.length)mismatches.push({
  key:'future-textbook',
  reason:'newer-baseline-year',
  items:futureRelevant.map(x=>({title:x.title,id:x.id,fingerprint:x.fingerprint,noticeYear:x.noticeYear||x.explicitYear||null,url:x.url}))
});
if(mismatches.length)fail('OFFICIAL_TEXTBOOK_REVIEW_REQUIRED',{
  generatedAt:snapshot.generatedAt,
  baselineYear:baseline.baselineYear,
  mismatches
});
console.log('OFFICIAL_TEXTBOOK_CHANGE_GATE_SUCCESS',JSON.stringify({
  generatedAt:snapshot.generatedAt,
  ageHours:Math.round(ageHours*10)/10,
  baselineYear:baseline.baselineYear,
  groups:groups.map(g=>g.key),
  scopeDocs:baseline.scopeDocs
}));
