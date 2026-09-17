import { chromium } from 'playwright';
const base='http://127.0.0.1:4173/v9/index.html';
function assert(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1000,height:760}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');
  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    const baseState={ownerId:'member-a',profile:{examYear:'2027',examDate:'',dailyMinutes:40,level:'처음 시작',updatedAt:0},progress:{},reviewSchedule:{},answers:{},confidence:{},answerEvents:[],wrongs:[],notes:[],examHistory:[],studySessions:[],chat:[],settings:{},migrations:{}};
    const remote={ownerId:'member-a',profile:{examYear:'2034',examDate:'2034-03-01',dailyMinutes:70,level:'재도전',updatedAt:1000},progress:{'F01-C01':{conceptId:'F01-C01',mastery:77,lastStudy:900,updatedAt:900}},answerEvents:[{eventId:'remote-e1',questionId:'q1',choice:2,confidence:'sure',at:900}],answers:{q1:2},confidence:{q1:'sure'}};
    const remoteFirst=V.Store.mergeStateSafe(baseState,remote,'member-a');
    const newerLocal=V.Store.mergeStateSafe({...baseState,profile:{...baseState.profile,examYear:'2035',updatedAt:2000}},remote,'member-a');
    const guestPreferred=V.Store.mergeStateSafe(remote,{...baseState,profile:{...baseState.profile,examYear:'2036',dailyMinutes:80}},'member-a',{preferRightProfile:true});

    const originalOwner=V.Store.ownerId;
    const f=new File(['PRIVATE CLOUD TEXT SAMPLE 789'],'member-private.txt',{type:'text/plain'});
    const ingested=await V.PrivateDocs.ingest(f,{kind:'personal',keepOriginal:false});
    const bundle=await V.PrivateDocs.exportForSync();
    const exportSafe=bundle.docs.length>=1&&bundle.docs.every(d=>d.ownerId===originalOwner&&!d.original)&&bundle.chunks.every(c=>c.ownerId===originalOwner);
    const deletedId=ingested.doc.id;
    await V.PrivateDocs.remove(deletedId);
    const afterDelete=await V.PrivateDocs.exportForSync();
    const tombstone=afterDelete.deleted.find(x=>x.id===deletedId&&x.ownerId===originalOwner&&x.deletedAt>0);
    const docsAfterDelete=await V.PrivateDocs.listDocuments('personal');

    V.Store.switchOwner('qa-sync-other-owner');
    const imported=await V.PrivateDocs.importFromSync(bundle.docs,bundle.chunks);
    const otherDocs=await V.PrivateDocs.listDocuments('personal');
    const foreignDelete=await V.PrivateDocs.importFromSync(afterDelete.deleted.map(x=>({...x,deletedAt:x.deletedAt,title:'(삭제됨)'})),[]);
    V.Store.switchOwner(originalOwner);
    return{
      remoteYear:remoteFirst.profile.examYear,
      localYear:newerLocal.profile.examYear,
      guestYear:guestPreferred.profile.examYear,
      remoteProgress:remoteFirst.progress['F01-C01']?.mastery,
      latestAnswer:remoteFirst.answers.q1,
      exportSafe,imported,otherDocs:otherDocs.length,foreignDelete,
      tombstone:!!tombstone,docsAfterDelete:docsAfterDelete.length,
      syncPolicy:V.Auth.syncPolicy,
      privacyRules:V.PrivateDocs.privacyRules
    };
  });
  assert(result.remoteYear==='2034','fresh/default member state cannot overwrite an existing remote profile');
  assert(result.localYear==='2035','newer local profile clock wins over older remote profile');
  assert(result.guestYear==='2036','custom guest profile is preserved during first member migration');
  assert(result.remoteProgress===77&&result.latestAnswer===2,'remote progress and answer history merge into member namespace');
  assert(result.exportSafe,'private document sync export strips original file bytes and keeps owner ids');
  assert(result.tombstone&&result.docsAfterDelete===0,'local private-document deletion creates a tombstone and removes live local data');
  assert(result.imported.docs===0&&result.otherDocs===0,'another owner cannot import a member private-document bundle');
  assert(result.foreignDelete.deleted===0,'another owner cannot apply a foreign private-document tombstone');
  assert(result.syncPolicy.remoteFirstOnSignIn===true&&result.syncPolicy.remoteFirstOnManualSync===true,'sign-in and manual sync are both remote-first');
  assert(result.syncPolicy.originalFilesAutoUpload===false,'original files never auto-upload');
  assert(result.privacyRules.deletionTombstones===true&&result.privacyRules.crossUserSharing===false&&result.privacyRules.serverUpload===false,'private document deletion/no-share/no-auto-upload policy is locked');
  assert(errors.length===0,`sync runtime errors = 0 (${errors.join(' | ')})`);
  console.log('V9_SYNC_QA_SUCCESS');
  await context.close();
}finally{await browser.close()}
