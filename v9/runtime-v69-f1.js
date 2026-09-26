/* V69 runtime-v69-f1.js — canonical order */

/* --- official-monitor.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const KEY='aitutor9:official-monitor:v1';
const SNAPSHOT_URL='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json';
const START_AT='2026-09-20';
const REFRESH_MS=30*60*1000;
const MAX_SNAPSHOT_AGE_MS=90*60*1000;
const ALLOWED=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','cherish.nfsa.go.kr','gongmuwon.gosi.kr']);
let state={status:'idle',snapshot:null,unseen:[],lastFetched:0,error:'',transport:'',notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
let timer=null;
let observer=null;

const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const official=url=>{try{const u=new URL(String(url||''));return u.protocol==='https:'&&ALLOWED.has(u.hostname.toLowerCase())}catch{return false}};
const validSnapshot=x=>{
  const required=Number(x?.policy?.requiredSourceCount||0);
  const total=Number(x?.policy?.totalSourceCount||x?.sourceStatus?.length||0);
  return !!x&&x.version==='119-official-monitor-snapshot-v1'&&x.officialOnly===true&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)&&required>0&&total>=required&&x.sourceStatus.length===total&&x.items.every(i=>i&&i.id&&i.title&&official(i.url));
};
const eligibleNotice=i=>!!i.meaningful&&i.notificationEligible!==false;
const eligibleFirstRun=i=>eligibleNotice(i)&&String(i.publishedAt||'')>=START_AT;

function summary(){
  return {
    status:state.status,
    error:state.error,
    generatedAt:state.snapshot?.generatedAt||'',
    healthy:state.snapshot?.healthy===true,
    items:state.snapshot?.items||[],
    sources:state.snapshot?.sourceStatus||[],
    unseen:state.unseen||[],
    unseenCount:(state.unseen||[]).length,
    targetExamYear:state.snapshot?.targetExamYear||2027,
    baselineYear:state.snapshot?.baselineYear||2026,
    requiredSourceCount:Number(state.snapshot?.policy?.requiredSourceCount||0),
    totalSourceCount:Number(state.snapshot?.policy?.totalSourceCount||state.snapshot?.sourceStatus?.length||0),
    coverageComplete:state.snapshot?.coverageComplete===true,
    degraded:state.snapshot?.degraded===true||state.snapshot?.healthy!==true,
    lastSuccessfulAt:state.snapshot?.lastSuccessfulAt||state.snapshot?.generatedAt||'',
    lastFetched:state.lastFetched,
    transport:state.transport||'',
    notificationPermission:state.notificationPermission
  };
}

const revisionKey=i=>String(i?.id||'')+':'+String(i?.fingerprint||'legacy');
const priority=i=>({change_notice:0,exam_schedule:1,exam_scope:2,exam_policy:3,recruitment_notice:4,official_textbook:5,official_standard:6})[i?.kind]??9;
const DAY_MS=86400000;
function dateUtc(value){
  const m=String(value||'').match(/^(20\d{2})-(\d{2})-(\d{2})$/);
  return m?Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])):null
}
function dday(value){
  const target=dateUtc(value);if(target===null)return'';
  const now=new Date(),today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  const n=Math.round((target-today)/DAY_MS);
  return n===0?'D-Day':n>0?'D-'+n:'D+'+Math.abs(n)
}
function scheduleEntries(x){
  const s=x?.schedule||{},rows=[];
  if(s.applicationStart)rows.push({label:'원서접수 시작',date:s.applicationStart});
  if(s.applicationEnd)rows.push({label:'원서접수 마감',date:s.applicationEnd});
  if(s.writtenExam)rows.push({label:'필기시험',date:s.writtenExam});
  if(s.physicalExam)rows.push({label:'체력시험',date:s.physicalExam});
  if(s.interview)rows.push({label:'면접시험',date:s.interview});
  if(s.finalResult)rows.push({label:'최종발표',date:s.finalResult});
  return rows
}
function icsEscape(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;')}
function icsDate(value){return String(value||'').replace(/-/g,'')}
function downloadScheduleCalendar(){
  const m=summary(),pool=[...(m.unseen||[]),...(m.items||[])],item=pool.find(x=>eligibleNotice(x)&&scheduleEntries(x).length);
  if(!item)return false;
  const rows=scheduleEntries(item),stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//119 Study//Official Exam Schedule//KO','CALSCALE:GREGORIAN'];
  rows.forEach((row,i)=>{
    lines.push('BEGIN:VEVENT','UID:119-'+item.id+'-'+i+'@study119','DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+icsDate(row.date),'SUMMARY:'+icsEscape('119 '+row.label+' · '+item.title),'DESCRIPTION:'+icsEscape('공식 출처: '+item.url),'URL:'+item.url,'END:VEVENT')
  });
  lines.push('END:VCALENDAR');
  const blob=new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='119-'+(m.targetExamYear||2027)+'-official-schedule.ics';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0);
  return true
}
function unseenFor(snapshot,m){
  if(snapshot?.healthy!==true||snapshot?.notificationSuppressed===true)return[];
  const seenRevisions=new Set(m.seenRevisionKeys||[]);
  const seenIds=new Set(m.seenIds||[]);
  return !m.initialized
    ? snapshot.items.filter(eligibleFirstRun)
    : snapshot.items.filter(i=>eligibleNotice(i)&&(!seenRevisions.has(revisionKey(i))&&(!seenIds.has(i.id)||i.changeState==='updated')));
}

function syncBadge(){
  const n=(state.unseen||[]).length;
  try{
    if(n&&navigator.setAppBadge)navigator.setAppBadge(n).catch(()=>{});
    else if(!n&&navigator.clearAppBadge)navigator.clearAppBadge().catch(()=>{});
  }catch{}
}
function dispatch(){
  window.dispatchEvent(new CustomEvent('aitutor-official-monitor',{detail:summary()}));
  syncBadge();
  decorate();
}

function itemHtml(x,isNew){
  const label=x.changeState==='updated'?'공고 내용 변경':x.kind==='exam_schedule'?'시험 일정':x.reviewRequired?'검토 필요':'공식 공고';
  const s=x.schedule||{},schedule=[];
  if(s.applicationStart||s.applicationEnd){
    const start=s.applicationStart||'?';const end=s.applicationEnd?' ~ '+s.applicationEnd:'';
    schedule.push('원서접수 '+start+end+(s.applicationStart?' · '+dday(s.applicationStart):''))
  }
  if(s.writtenExam)schedule.push('필기 '+s.writtenExam+' · '+dday(s.writtenExam));
  if(s.physicalExam)schedule.push('체력 '+s.physicalExam+' · '+dday(s.physicalExam));
  if(s.interview)schedule.push('면접 '+s.interview+' · '+dday(s.interview));
  if(s.finalResult)schedule.push('최종발표 '+s.finalResult+' · '+dday(s.finalResult));
  const scheduleHtml=schedule.length?'<small class="official-monitor-schedule">'+schedule.map(esc).join(' · ')+'</small>':'';
  const attachmentHtml=!schedule.length&&Number(x.attachmentCount||0)>0?'<small class="official-monitor-attachment">상세 일정은 공식 첨부 공고문 확인 · '+Number(x.attachmentCount||0)+'개</small>':'';
  const changeHtml=Array.isArray(x.changeSummary)&&x.changeSummary.length?'<small class="official-monitor-change-summary">'+x.changeSummary.map(esc).join(' · ')+'</small>':'';
  return '<a class="official-monitor-item '+(isNew?'new':'')+'" href="'+esc(x.url)+'" target="_blank" rel="noopener"><div><span class="tag '+(x.reviewRequired||x.changeState==='updated'?'warn':'blue')+'">'+esc(label)+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.sourceLabel)+(x.publishedAt?' · '+esc(x.publishedAt):'')+'</small>'+scheduleHtml+attachmentHtml+changeHtml+'</div><span aria-hidden="true">↗</span></a>';
}

function renderKey(){
  const m=summary();
  return [m.status,m.generatedAt,m.lastFetched,m.unseenCount,m.notificationPermission,m.transport,m.error].join('|')
}

function cardHtml(){
  const m=summary();
  const loading=m.status==='loading';
  const error=m.status==='error';
  const stale=m.status==='stale';
  const targetItems=(m.items||[]).filter(eligibleNotice);
  const latest=[...(m.unseenCount?m.unseen:targetItems)].sort((a,b)=>priority(a)-priority(b)||String(b.publishedAt||'').localeCompare(String(a.publishedAt||''))).slice(0,8);
  const sourceOk=(m.sources||[]).filter(x=>x.ok).length;
  const sourceTotal=(m.sources||[]).length;
  const generatedMs=Date.parse(String(m.generatedAt||''));
  const fresh=m.healthy===true&&Number.isFinite(generatedMs)&&Date.now()-generatedMs<=MAX_SNAPSHOT_AGE_MS;
  const requiredSourceCount=Number(m.requiredSourceCount||0);
  const totalSourceCount=Number(m.totalSourceCount||sourceTotal||0);
  const requiredHealthy=(m.sources||[]).filter(x=>x.required!==false).every(x=>x.ok);
  const completeSources=fresh&&m.coverageComplete===true&&requiredHealthy&&sourceTotal===totalSourceCount&&sourceOk===sourceTotal;
  const lastGood=m.lastSuccessfulAt?' · 마지막 정상 '+new Date(m.lastSuccessfulAt).toLocaleString('ko-KR'):'';
  const status=loading?'공식 사이트 확인 중':stale||!fresh?'최근 저장본 표시 · 연결 확인 필요'+lastGood:error?'공식 감시 연결 확인 필요':!completeSources?'시험 공고 감시 정상 · 교재/학교 보조소스 확인 필요':m.generatedAt?'최근 수집 '+new Date(m.generatedAt).toLocaleString('ko-KR'):'감시 데이터 준비 중';
  const transportLabel=m.transport==='app-api'?'앱 서버':m.transport==='snapshot-fallback'?'공식 스냅샷':m.transport==='cached-snapshot'?'기기 저장본':'';
  const unseenRevisions=new Set(m.unseen.map(revisionKey));
  const items=latest.length?latest.map(x=>itemHtml(x,unseenRevisions.has(revisionKey(x)))).join(''):'<div class="empty official-monitor-empty">새 시험 관련 공식 공고가 없습니다.</div>';
  const notifyLabel=m.notificationPermission==='granted'?'앱 알림 켜짐':m.notificationPermission==='denied'?'앱 알림 차단됨':'앱 알림 켜기';
  const resultTag=m.unseenCount?'<span class="tag warn">새 공고·변경 '+m.unseenCount+'건</span>':completeSources?'<span class="tag good">새 변경 없음</span>':'<span class="tag warn">일부 공식소스 확인 필요</span>';
  const calendarTarget=targetItems.find(x=>scheduleEntries(x).length>0);
  return '<section class="card official-monitor-card" aria-live="polite" aria-atomic="false" data-official-monitor-card data-monitor-key="'+esc(renderKey())+'"><div class="toolbar"><div><span class="eyebrow">공식 공고 자동감시</span><h2>2027 시험 공고 · 일정 · 교재 변경</h2></div><span class="spacer"></span>'+resultTag+'</div><p class="muted">앱이 매시간 국가공무원 채용시스템의 소방청 채용·시험 정보와 중앙소방학교 공식 공고·교재만 확인합니다. 새 공고는 앱을 열거나 다시 활성화할 때 표시하며, 학습 기준은 공식 원문을 확인한 뒤 반영합니다.</p><div class="official-monitor-meta"><span>'+esc(status)+'</span><span>공식 소스 '+sourceOk+'/'+(totalSourceCount||sourceTotal||0)+'</span><span>목표 '+esc(m.targetExamYear)+' · 현재 기준 '+esc(m.baselineYear)+'</span></div><div class="toolbar official-monitor-actions"><button class="btn small" data-monitor-refresh>'+(loading?'확인 중…':'지금 확인')+'</button><button class="btn small ghost" data-monitor-notify '+(m.notificationPermission==='denied'?'disabled':'')+'>'+esc(notifyLabel)+'</button>'+(calendarTarget?'<button class="btn small ghost" data-monitor-calendar>일정 캘린더 저장</button>':'')+(m.unseenCount?'<button class="btn small ghost" data-monitor-seen>확인 완료</button>':'')+'</div><div class="official-monitor-list">'+items+'</div></section>';
}

function bannerHtml(){
  const m=summary();
  if(!m.unseenCount)return'';
  return '<section class="card official-monitor-banner" aria-live="polite" data-official-monitor-banner data-monitor-key="'+esc(renderKey())+'"><button class="official-monitor-banner-btn" data-monitor-open><span><b>새 공식 시험 공고·변경 '+m.unseenCount+'건</b><small>국가공무원 채용시스템·중앙소방학교 공식 출처만 확인</small></span><strong>확인 →</strong></button></section>';
}

function decorate(){
  const key=renderKey();
  const resources=document.querySelector('.page-resources .resources-119');
  let card=resources?.querySelector('[data-official-monitor-card]');
  if(resources&&!card){resources.insertAdjacentHTML('afterbegin',cardHtml());card=resources.querySelector('[data-official-monitor-card]')}
  else if(card&&card.dataset.monitorKey!==key)card.outerHTML=cardHtml();

  const home=document.querySelector('.page-home .home-main');
  const old=home?.querySelector('[data-official-monitor-banner]');
  const html=bannerHtml();
  if(old&&!html)old.remove();
  else if(old&&html&&old.dataset.monitorKey!==key)old.outerHTML=html;
  else if(home&&html&&!old)home.insertAdjacentHTML('afterbegin',html);
}

async function notifyUnseen(){
  const s=summary(),m=read();
  if(!s.unseenCount||typeof Notification==='undefined'||Notification.permission!=='granted')return;
  const key=s.unseen.map(revisionKey).sort().join(',');
  if(m.lastNotifiedKey===key)return;
  const first=s.unseen[0];
  const body=s.unseenCount===1?first.title:first.title+' 외 '+(s.unseenCount-1)+'건';
  try{
    const reg=await navigator.serviceWorker?.ready;
    if(reg?.showNotification)await reg.showNotification('119 시험 공식 공고',{body,tag:'119-official-notice',renotify:false,data:{page:'resources'}});
    else new Notification('119 시험 공식 공고',{body});
    write({...m,lastNotifiedKey:key});
  }catch{}
}

async function fetchNetworkSnapshot(force){
  const suffix=force?'?t='+Date.now():'';
  const candidates=[
    {url:'/api/official-monitor'+suffix,transport:'app-api'},
    {url:SNAPSHOT_URL+suffix,transport:'snapshot-fallback'}
  ];
  let lastError=null;
  for(const candidate of candidates){
    try{
      const res=await fetch(candidate.url,{cache:force?'no-store':'default'});
      if(!res.ok)throw new Error('HTTP_'+res.status);
      const snapshot=await res.json();
      if(!validSnapshot(snapshot))throw new Error('INVALID_OFFICIAL_MONITOR_SNAPSHOT');
      return{snapshot,transport:snapshot.transport||candidate.transport}
    }catch(err){lastError=err}
  }
  throw lastError||new Error('OFFICIAL_MONITOR_UNAVAILABLE')
}

async function refresh({force=false}={}){
  if(!force&&state.status==='loading')return summary();
  if(!force&&state.lastFetched&&Date.now()-state.lastFetched<REFRESH_MS)return summary();
  state={...state,status:'loading',error:''};dispatch();
  try{
    const {snapshot,transport}=await fetchNetworkSnapshot(force);
    const m=read();
    const unseen=unseenFor(snapshot,m);
    if(!m.initialized){
      const oldItems=snapshot.items.filter(i=>!eligibleFirstRun(i));
      const oldIds=oldItems.map(i=>i.id),oldRevisions=oldItems.map(revisionKey);
      write({...m,initialized:true,initializedAt:Date.now(),seenIds:[...new Set([...(m.seenIds||[]),...oldIds])].slice(-500),seenRevisionKeys:[...new Set([...(m.seenRevisionKeys||[]),...oldRevisions])].slice(-500)});
    }
    const persisted=read();
    write({...persisted,lastSnapshot:snapshot,lastSnapshotAt:Date.now(),lastTransport:transport});
    const generatedMs=Date.parse(String(snapshot.generatedAt||''));
    const staleSnapshot=snapshot.healthy!==true||!Number.isFinite(generatedMs)||Date.now()-generatedMs>MAX_SNAPSHOT_AGE_MS;
    state={status:staleSnapshot?'stale':'ready',snapshot,unseen,lastFetched:Date.now(),error:'',transport,notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
    dispatch();
    await notifyUnseen();
    return summary();
  }catch(err){
    const m=read(),cached=m.lastSnapshot;
    if(validSnapshot(cached)){
      state={status:'stale',snapshot:cached,unseen:unseenFor(cached,m),lastFetched:Date.now(),error:String(err?.message||err).slice(0,120),transport:'cached-snapshot',notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
      dispatch();
      return summary();
    }
    state={...state,status:'error',lastFetched:Date.now(),error:String(err?.message||err).slice(0,120),transport:''};
    dispatch();
    return summary();
  }
}

function markSeen(){
  const s=summary(),m=read(),ids=s.unseen.map(x=>x.id),revisions=s.unseen.map(revisionKey);
  const seen=[...new Set([...(m.seenIds||[]),...ids])].slice(-500);
  const seenRevisionKeys=[...new Set([...(m.seenRevisionKeys||[]),...revisions])].slice(-500);
  write({...m,initialized:true,seenIds:seen,seenRevisionKeys,lastSeenAt:Date.now(),lastNotifiedKey:''});
  state={...state,unseen:[]};
  dispatch();
  return summary();
}

async function enableNotifications(){
  if(typeof Notification==='undefined')return'unsupported';
  const result=await Notification.requestPermission();
  state={...state,notificationPermission:result};
  dispatch();
  if(result==='granted')await notifyUnseen();
  return result;
}

function openMonitorPage(){
  window.AITUTOR_V9?.App?.go?.('resources');
  setTimeout(()=>document.querySelector('[data-official-monitor-card]')?.scrollIntoView({behavior:'smooth',block:'start'}),0);
}
function start(){
  if(observer)observer.disconnect();
  const root=document.querySelector('#app');
  if(root){observer=new MutationObserver(()=>decorate());observer.observe(root,{childList:true,subtree:true})}
  document.addEventListener('click',async e=>{
    const b=e.target instanceof Element?e.target.closest('[data-monitor-refresh],[data-monitor-seen],[data-monitor-notify],[data-monitor-open],[data-monitor-calendar]'):null;
    if(!b)return;
    if(b.hasAttribute('data-monitor-open')){openMonitorPage();return}
    if(b.hasAttribute('data-monitor-refresh')){await refresh({force:true});return}
    if(b.hasAttribute('data-monitor-seen')){markSeen();return}
    if(b.hasAttribute('data-monitor-notify')){await enableNotifications();return}
    if(b.hasAttribute('data-monitor-calendar')){downloadScheduleCalendar();return}
  });
  refresh().catch(()=>{});
  if(timer)clearInterval(timer);
  timer=setInterval(()=>{if(document.visibilityState==='visible')refresh().catch(()=>{})},REFRESH_MS);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh().catch(()=>{})});
  navigator.serviceWorker?.addEventListener?.('message',e=>{if(e.data?.type==='119-official-monitor-open')openMonitorPage()});
  const qs=new URLSearchParams(location.search);
  if(qs.get('page')==='resources'||location.hash==='#official-monitor'){
    history.replaceState(null,'',location.pathname+location.hash);
    setTimeout(openMonitorPage,0);
  }
  decorate();
}

V.OfficialMonitor119={
  version:'119-official-monitor-client-v1',
  refresh,markSeen,enableNotifications,summary,start,
  policy:{officialOnly:true,firstRunStartAt:START_AT,noAutomaticCurriculumMutation:true,rootApiFirst:true,staticSnapshotFallback:true,cachedSnapshotFallback:true,backgroundServerMonitor:true,degradedSnapshotTruth:true,staleSnapshotNeverClaimsNoChange:true,wafBypassForbidden:true,machineFriendlyOfficialSources:true,requiredExamSourceCanStayHealthyWhileSupplementalSourceDegrades:true,detailScheduleDisplay:true,neverGuessMissingDates:true,officialAttachmentHint:true,scheduleDday:true,scheduleCalendarExport:true,devicePushWhenClosed:false}
};
window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();

;

/* --- source-pdf.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const DB='aitutor-v9-official-source-pdfs',VER=1;let dbp=null,activeRemote=null;const pdfCache=new Map();
const PAGE_OFFSETS=Object.freeze({fire1:16,fire2:10,ems:18,prevention1:14,prevention2:12,law1:4,law2:12,law3:8,law4:6,law5:14});
const pdfPage=(key,bookPage)=>{const n=Number(bookPage);if(!Number.isFinite(n)||n<=0)return 0;return Object.prototype.hasOwnProperty.call(PAGE_OFFSETS,key)?n+PAGE_OFFSETS[key]:n};
const bookPage=(key,pdfPageNo)=>{if(!Object.prototype.hasOwnProperty.call(PAGE_OFFSETS,key))return 0;const n=Number(pdfPageNo),x=n-PAGE_OFFSETS[key];return Number.isFinite(x)&&x>0?x:0};
const SOURCE_PAGES={
  ems:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view',
  fire1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view',
  fire2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view',
  law1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law3:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law4:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law5:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  prevention1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view',
  prevention2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view'
};
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sources'))d.createObjectStore('sources',{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
const done=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
async function attach(key,file){if(!key||!file)throw Error('SOURCE_PDF_REQUIRED');if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw Error('PDF_ONLY');await clearPdfCache(key);const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').put({key,name:file.name,mime:file.type||'application/pdf',blob:file,updatedAt:Date.now()});await done(t);return{key,name:file.name,size:file.size}}
async function get(key){const d=await db(),t=d.transaction('sources','readonly'),r=t.objectStore('sources').get(key);return await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function putSourceRow(row){const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').put(row);await done(t);return row}
async function cacheOfficial(key,{timeoutMs=90000,onProgress,preferProxy=false}={}){
  const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};
  if(activeRemote?.key===key&&activeRemote?.row?.blob)return activeRemote.row;
  const catalog=V.SourceCatalog119?.get?.(key),ordered=preferProxy?[catalog?.proxyPdf,catalog?.directPdf]:[catalog?.directPdf,catalog?.proxyPdf],urls=[...new Set(ordered.filter(Boolean))];
  if(!urls.length)throw Error('SOURCE_REMOTE_UNRESOLVED');
  let lastError=Error('SOURCE_REMOTE_UNRESOLVED');
  for(let i=0;i<urls.length;i++){
    const url=urls[i],remaining=Math.max(7000,Math.floor(timeoutMs/Math.max(1,urls.length-i))),ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),remaining);
    try{
      const res=await fetch(url,{credentials:'omit',redirect:'follow',signal:ctl.signal,cache:'no-store'});
      if(!res.ok)throw Error('SOURCE_REMOTE_HTTP_'+res.status);
      const total=Number(res.headers.get('content-length'))||0,chunks=[];let loaded=0;
      if(res.body?.getReader){
        const reader=res.body.getReader();
        while(true){const {done,value}=await reader.read();if(done)break;if(value){chunks.push(value);loaded+=value.byteLength;onProgress?.({loaded,total,percent:total?Math.min(100,Math.round(loaded/total*100)):null,transport:url===catalog?.proxyPdf?'proxy':'mirror'})}}
      }else{
        const buf=new Uint8Array(await res.arrayBuffer());chunks.push(buf);loaded=buf.byteLength;onProgress?.({loaded,total:total||loaded,percent:100});
      }
      const blob=new Blob(chunks,{type:'application/pdf'}),head=new Uint8Array(await blob.slice(0,8).arrayBuffer());
      if(new TextDecoder('latin1').decode(head).indexOf('%PDF-')<0)throw Error('SOURCE_REMOTE_NOT_PDF');
      const row={key,name:catalog.expectedNames?.[0]||catalog.label||key,mime:'application/pdf',blob,updatedAt:Date.now(),origin:url===catalog?.proxyPdf?'official-proxy-cache':'official-mirror-cache',officialPage:catalog.officialPage,license:catalog.license};
      activeRemote={key,row};try{await putSourceRow(row)}catch{}
      onProgress?.({loaded:blob.size,total:blob.size,percent:100,done:true,transport:url===catalog?.proxyPdf?'proxy':'mirror'});return row;
    }catch(err){lastError=err?.name==='AbortError'?Error('SOURCE_PDF_TIMEOUT'):err}
    finally{clearTimeout(timer)}
  }
  throw lastError;
}
async function remoteRow(key,opts={}){return cacheOfficial(key,opts)}
async function resolveRow(key,opts={}){const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};return cacheOfficial(key,opts)}
async function availability(key){const local=await get(key),c=V.SourceCatalog119?.get?.(key),mirror=c?.transport==='range-static'&&!!c?.mirrorPdf;return{local:!!local?.blob,mirror,mirrorUrl:mirror?c.mirrorPdf:'',proxyUrl:c?.proxyPdf||'',direct:!!(c?.directPdf||c?.proxyPdf),officialPage:c?.officialPage||SOURCE_PAGES[key]||'',license:c?.license||'',label:c?.label||key}}
async function has(key){const a=await availability(key);return a.local||a.direct}
async function remove(key){await clearPdfCache(key);const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').delete(key);await done(t);if(activeRemote?.key===key)activeRemote=null}
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const stop=new Set(['그리고','하지만','에서','으로','하는','한다','있다','있으며','대한','통해','경우','확인','중요','필요','환자','설비','화재']);
function queryTokens(queries){const out=[];for(const q of queries||[]){for(const w of String(q||'').split(/[\s·,()\/→]+/)){const n=norm(w);if(n.length>=2&&!stop.has(n)&&!out.includes(n))out.push(n)}}return out.sort((a,b)=>b.length-a.length).slice(0,24)}
async function pdfjs(){if(V.RuntimeDeps?.loadPdfJs)return V.RuntimeDeps.loadPdfJs();const p=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');p.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';return p}
async function clearPdfCache(key){const hit=pdfCache.get(key);pdfCache.delete(key);if(hit?.task)await hit.task.destroy?.().catch?.(()=>{});else if(hit?.pdf)await hit.pdf.destroy?.().catch?.(()=>{})}
function waitPdfTask(task,timeoutMs){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('SOURCE_PDF_PARSE_TIMEOUT')),timeoutMs);task.promise.then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)})})}
function retireTimedOutPdfTask(task){
  try{task?.promise?.then(pdf=>Promise.resolve(pdf?.cleanup?.()).catch(()=>{}),()=>{})}catch{}
}
async function releaseFailedPdfTask(task,err){
  if(String(err?.message||err)==='SOURCE_PDF_PARSE_TIMEOUT'){retireTimedOutPdfTask(task);return}
  await task?.destroy?.().catch?.(()=>{})
}
async function openPdf(key,{timeoutMs=90000,onProgress}={}){const cached=pdfCache.get(key);if(cached?.pdf)return cached;const p=await pdfjs(),local=await get(key),catalog=V.SourceCatalog119?.get?.(key),staticRange=catalog?.transport==='range-static'&&!!catalog?.mirrorPdf;let task,name,origin;
  if(local?.blob){task=p.getDocument({data:await local.blob.arrayBuffer()});name=local.name||key;origin='local-cache'}
  else if(staticRange){
    const fastUrl=catalog.mirrorPdf,fastTimeout=Math.min(7000,timeoutMs);
    task=p.getDocument({url:fastUrl,withCredentials:false,disableRange:false,disableStream:false,disableAutoFetch:true,rangeChunkSize:65536});name=catalog.expectedNames?.[0]||catalog.label||key;origin='official-static-range';
    try{const pdf=await waitPdfTask(task,fastTimeout),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);onProgress?.({ready:true,transport:'mirror'});return entry}
    catch(err){await releaseFailedPdfTask(task,err);onProgress?.({fallback:true,transport:'mirror'});const row=await cacheOfficial(key,{timeoutMs:Math.max(10000,timeoutMs-fastTimeout),onProgress,preferProxy:true});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||key;origin='official-proxy-fallback'}
  }else if(catalog?.proxyPdf){
    const fastUrl=catalog.proxyPdf,fastTimeout=Math.min(6500,timeoutMs);
    task=p.getDocument({url:fastUrl,withCredentials:false,disableRange:false,disableStream:true,disableAutoFetch:true,rangeChunkSize:65536});name=catalog.expectedNames?.[0]||catalog.label||key;origin='official-proxy-range';
    try{const pdf=await waitPdfTask(task,fastTimeout),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);onProgress?.({ready:true,transport:'proxy-range'});return entry}
    catch(err){await releaseFailedPdfTask(task,err);onProgress?.({fallback:true,transport:'proxy-range'});const row=await cacheOfficial(key,{timeoutMs:Math.max(10000,timeoutMs-fastTimeout),onProgress,preferProxy:true});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||catalog.expectedNames?.[0]||catalog.label||key;origin='official-proxy-full-cache-fallback'}
  }else{const row=await resolveRow(key,{timeoutMs,onProgress});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||key;origin=row.origin||'local-cache'}
  try{const pdf=await waitPdfTask(task,Math.min(timeoutMs,25000)),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);return entry}catch(err){await releaseFailedPdfTask(task,err);throw err}
}
async function locate(key,queries=[],options={}){const {pdf}=await openPdf(key),tokens=queryTokens(queries);if(!tokens.length)return{page:1,pages:pdf.numPages,score:0};const ranges=Array.isArray(options.bookRanges)?options.bookRanges.filter(x=>x&&x.doc===key):[],pageSet=new Set();if(ranges.length){for(const r of ranges){const from=Math.max(1,pdfPage(key,Number(r.from)||1)),to=Math.min(pdf.numPages,pdfPage(key,Number(r.to)||Number(r.from)||1));for(let n=from;n<=to;n++)pageSet.add(n)}}const pages=pageSet.size?[...pageSet].sort((a,b)=>a-b):Array.from({length:pdf.numPages},(_,i)=>i+1);let best={page:pages[0]||1,score:-1,pages:pdf.numPages};for(const n of pages){const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=norm((tc.items||[]).map(x=>x.str).join(' '));let score=0;for(const q of tokens)if(text.includes(q))score+=Math.min(12,q.length);if(score>best.score)best={page:n,score,pages:pdf.numPages};if(score>=Math.min(48,tokens.slice(0,5).reduce((a,x)=>a+Math.min(12,x.length),0)))break}return best}
async function findPages(key,query,{limit=12}={}){
const q=String(query||'').trim(),tokens=queryTokens([q]),{pdf}=await openPdf(key);if(!tokens.length)return{query:q,pages:pdf.numPages,results:[]};
const qn=norm(q),hits=[];
for(let n=1;n<=pdf.numPages;n++){
  const pg=await pdf.getPage(n),tc=await pg.getTextContent(),raw=(tc.items||[]).map(x=>x.str).join(' '),text=norm(raw),matched=tokens.filter(t=>text.includes(t));
  if(!matched.length)continue;
  const exact=qn.length>=3&&text.includes(qn),coverage=matched.length/Math.max(1,tokens.length),score=(exact?200:0)+matched.reduce((sum,t)=>sum+Math.min(16,t.length),0)+Math.round(coverage*60);
  if(exact||coverage>=.5||matched.some(t=>t.length>=5))hits.push({page:n,bookPage:bookPage(key,n),score});
}
hits.sort((a,b)=>b.score-a.score||a.page-b.page);
return{query:q,pages:pdf.numPages,results:hits.slice(0,Math.max(1,Math.min(30,Number(limit)||12)))}
}
function evidenceLines(items,viewport,p,queries=[],options={}){
  const rawQueries=(queries||[]).map(x=>String(x||'').replace(/\s+/g,' ').trim()).filter(Boolean),tokens=queryTokens(rawQueries);
  const rows=[];
  for(const item of items||[]){
    const raw=String(item.str||'').trim();if(!raw)continue;
    const tx=p.Util.transform(viewport.transform,item.transform),h=Math.max(8,Math.hypot(tx[2],tx[3])),w=Math.max(2,Math.abs(Number(item.width)||0)*viewport.scale);
    const row={raw,n:norm(raw),x:tx[4],y:tx[5],top:tx[5]-h,h,w};
    let line=rows.find(x=>Math.abs(x.y-row.y)<=Math.max(3,Math.min(7,row.h*.38)));
    if(!line){line={y:row.y,items:[]};rows.push(line)}
    line.items.push(row);
  }
  const lines=rows.map(line=>{
    const its=line.items.sort((a,b)=>a.x-b.x),text=its.map(x=>x.raw).join(' ').replace(/\s+/g,' ').trim(),n=norm(text);
    const left=Math.min(...its.map(x=>x.x)),right=Math.max(...its.map(x=>x.x+x.w)),top=Math.min(...its.map(x=>x.top)),bottom=Math.max(...its.map(x=>x.top+x.h));
    return{text,n,left,right,top,bottom};
  }).filter(x=>x.n.length>=4).sort((a,b)=>a.top-b.top);
  const anchorTokens=queryTokens(options.anchorTerms||[]).filter(x=>x.length>=2);
  if(anchorTokens.length){
    const e=lines.map((l,i)=>{const m=anchorTokens.filter(t=>l.n.includes(t));return{l,i,m,s:m.reduce((n,t)=>n+t.length,0)+m.length*10}}).filter(x=>x.m.length>1||x.m.some(t=>t.length>4)).sort((a,b)=>b.s-a.s||a.i-b.i);
    if(e.length){const p=[];for(const h of e.slice(0,4)){if(!p.some(x=>x.l===h.l))p.push(h);for(let j=h.i+1;j<Math.min(lines.length,h.i+5)&&p.length<8;j++){const m=tokens.filter(t=>lines[j].n.includes(t));if((m.length>1||m.some(t=>t.length>5))&&!p.some(x=>x.l===lines[j]))p.push({l:{...lines[j],evidenceTitle:h.l.text+' · '+lines[j].text},i:j})}}return p.sort((a,b)=>a.i-b.i).slice(0,8).map(x=>x.l)}
    const anchorBlocks=[];
    for(let i=0;i<lines.length;i++){
      let joinedN='',joinedText='';
      for(let j=i;j<Math.min(lines.length,i+6);j++){
        joinedN+=lines[j].n;
        joinedText+=(joinedText?' ':'')+lines[j].text;
        const matched=anchorTokens.filter(t=>joinedN.includes(t));
        if(matched.length){
          anchorBlocks.push({start:i,end:j,score:matched.reduce((n,t)=>n+t.length,0),title:joinedText});
          break
        }
      }
    }
    anchorBlocks.sort((a,b)=>b.score-a.score||(a.end-a.start)-(b.end-b.start)||a.start-b.start);
    const picked=[];
    for(const block of anchorBlocks){
      if(picked.length>=8)break;
      for(let i=block.start;i<=block.end&&picked.length<8;i++){
        if(picked.some(x=>x===lines[i]))continue;
        picked.push({...lines[i],evidenceTitle:block.title})
      }
    }
    if(picked.length)return picked
  }
  const candidates=[];
  const maxWindow=8;
  for(let qi=0;qi<rawQueries.length;qi++){
    const q=rawQueries[qi],qn=norm(q),qt=queryTokens([q]);if(qn.length<3||!qt.length)continue;
    const priorityBonus=Math.max(0,72-qi*16);
    for(let i=0;i<lines.length;i++){
      let joined='';
      for(let j=i;j<Math.min(lines.length,i+maxWindow);j++){
        joined+=lines[j].n;
        const matched=qt.filter(t=>joined.includes(t));
        const exact=joined.includes(qn)||qn.includes(joined)&&joined.length>=Math.min(28,Math.floor(qn.length*.65));
        const density=matched.reduce((n,t)=>n+Math.min(14,t.length),0);
        const coverage=matched.length/Math.max(1,qt.length);
        const score=(exact?180:0)+density+(matched.length>=2?matched.length*10:0)+Math.round(coverage*40)+priorityBonus-Math.max(0,(j-i)-4)*3;
        const strong=exact||coverage>=.55&&matched.length>=2||matched.some(t=>t.length>=7)&&coverage>=.35;
        if(strong)candidates.push({start:i,end:j,score,query:q});
        if(joined.length>Math.max(qn.length*1.8,260))break;
      }
    }
  }
  candidates.sort((a,b)=>b.score-a.score||(a.end-a.start)-(b.end-b.start));
  const blocks=[];
  for(const cand of candidates){
    if(blocks.some(b=>!(cand.end<b.start||cand.start>b.end)))continue;
    blocks.push(cand);if(blocks.length>=2)break;
  }
  if(!blocks.length&&tokens.length){
    const scored=lines.map((line,i)=>{
      const matched=tokens.filter(t=>line.n.includes(t));
      return{i,score:matched.reduce((n,t)=>n+Math.min(14,t.length),0)+(matched.length>=2?matched.length*8:0),matched};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    const best=scored[0];
    if(best&&(best.matched.length>=2||best.matched.some(t=>t.length>=7)))blocks.push({start:best.i,end:best.i,score:best.score,query:''});
  }
  const picked=[];
  for(const b of blocks.sort((a,b)=>a.start-b.start))for(let i=b.start;i<=b.end;i++)if(!picked.includes(lines[i]))picked.push(lines[i]);
  return picked;
}
function downloadName(key,row,catalog){const raw=row?.name||catalog?.expectedNames?.[0]||catalog?.label||key;return /\.pdf$/i.test(raw)?raw:`${raw}.pdf`}
async function download(key,{timeoutMs=120000,onProgress}={}){const catalog=V.SourceCatalog119?.get?.(key);if(!catalog)throw Error('SOURCE_PDF_UNKNOWN');let row=await get(key);if(!row?.blob)row=await cacheOfficial(key,{timeoutMs,onProgress});if(!row?.blob)throw Error('SOURCE_PDF_DOWNLOAD_UNAVAILABLE');const name=downloadName(key,row,catalog),url=URL.createObjectURL(row.blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return{name,size:row.blob.size,key}}
async function render(key,pageNum,host,queries=[],opts={}){
  const {pdf,name,origin}=await openPdf(key,opts),p=await pdfjs(),pageNo=Math.max(1,Math.min(Number(pageNum)||1,pdf.numPages)),pg=await pdf.getPage(pageNo),base=pg.getViewport({scale:1});
  const maxWidth=Math.max(280,(host?.clientWidth||720)-16),fitScale=Math.min(1.85,maxWidth/base.width),zoom=Math.max(.75,Math.min(2.25,Number(opts.zoom)||1)),scale=fitScale*zoom,viewport=pg.getViewport({scale});
  const outputScale=Math.min(3,Math.max(1,Number(window.devicePixelRatio)||1));
  host.innerHTML='';host.classList.add('pdf-render-host');host.style.setProperty('--pdf-width',viewport.width+'px');
  const wrap=document.createElement('div');wrap.className='pdf-canvas-wrap';wrap.style.width=viewport.width+'px';wrap.style.height=viewport.height+'px';
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width*outputScale);canvas.height=Math.ceil(viewport.height*outputScale);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';wrap.appendChild(canvas);
  const overlay=document.createElement('div');overlay.className='pdf-highlight-layer';overlay.style.width=viewport.width+'px';overlay.style.height=viewport.height+'px';wrap.appendChild(overlay);host.appendChild(wrap);
  const ctx=canvas.getContext('2d',{alpha:false}),transform=outputScale===1?undefined:[outputScale,0,0,outputScale,0,0];
  await pg.render({canvasContext:ctx,viewport,transform}).promise;
  const tc=await pg.getTextContent(),evidence=evidenceLines(tc.items||[],viewport,p,queries,{anchorTerms:opts.anchorTerms});
  for(const line of evidence){
    const mark=document.createElement('div');mark.className='pdf-evidence-line';
    mark.style.left=Math.max(0,line.left-2)+'px';mark.style.top=Math.min(viewport.height-3,Math.max(0,line.bottom+1))+'px';mark.style.width=Math.max(8,Math.min(viewport.width-line.left+2,line.right-line.left+4))+'px';mark.style.height='2px';
    mark.title=line.evidenceTitle||line.text;overlay.appendChild(mark);
  }
  const officialBookPage=bookPage(key,pageNo),meta=document.createElement('div');meta.className='pdf-render-meta';meta.textContent=officialBookPage?`${name} · 교재 ${officialBookPage}쪽 · ${evidence.length?'공식 근거':'공식 원문'}`:`${name} · PDF ${pageNo}/${pdf.numPages}쪽 · ${evidence.length?'공식 근거':'공식 원문'}`;host.prepend(meta);
  return{page:pageNo,bookPage:officialBookPage,pages:pdf.numPages,hits:evidence.length,evidenceLines:evidence.map(x=>x.evidenceTitle||x.text),name,origin,zoom,fitScale,outputScale,cssWidth:viewport.width,pixelWidth:canvas.width};
}
V.SourcePDF={attach,get,has,remove,availability,resolveRow,remoteRow,cacheOfficial,openPdf,clearPdfCache,locate,findPages,download,render,pdfPage,bookPage,evidenceLinesForQA:evidenceLines,pageOffsets:PAGE_OFFSETS,mirrorUrl:key=>V.SourceCatalog119?.get?.(key)?.transport==='range-static'?V.SourceCatalog119.get(key).directPdf:'',sourcePage:key=>V.SourceCatalog119?.get?.(key)?.officialPage||SOURCE_PAGES[key]||'',privacy:{localCacheAllowed:true,persistentOfficialCache:true,serverUpload:false,userUploadRequired:false,originalUnmodified:true,officialRemotePreferred:true},runtime:'pdfjs-v14-timeout-safe-range-anchor-context-lines'};
})();
;

/* --- source-page-fingerprint-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const VERSION='119-source-page-fingerprint-v1';
const KEY_PREFIX='aitutor9:official-page-fingerprint:v1:';
const queued=new Set();
let lastReport=null;

const safeJson=value=>{try{return JSON.parse(value)}catch{return null}};
const read=doc=>{try{return safeJson(localStorage.getItem(KEY_PREFIX+doc)||'')}catch{return null}};
const write=(doc,value)=>{try{localStorage.setItem(KEY_PREFIX+doc,JSON.stringify(value));return true}catch{return false}};
const normalizeText=value=>String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
const pageKey=row=>Number(row?.bookPage)>0?'b:'+Number(row.bookPage):'p:'+Number(row?.pdfPage||0);
const rangeSort=(a,b)=>a.from-b.from||a.to-b.to;

async function sha256(value){
  if(!globalThis.crypto?.subtle)throw Error('SOURCE_PAGE_FINGERPRINT_CRYPTO_UNAVAILABLE');
  const bytes=new TextEncoder().encode(String(value||''));
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}

function citedBookPages(doc){
  const pages=new Set();
  for(const concept of V.curriculum?.concepts||[]){
    for(const range of concept?.sourceRanges||[]){
      if(range?.doc!==doc)continue;
      const from=Number(range.from),to=Number(range.to);
      if(!Number.isInteger(from)||!Number.isInteger(to)||from<1||to<from||to-from>2500)continue;
      for(let page=from;page<=to;page++)pages.add(page);
    }
  }
  return [...pages].sort((a,b)=>a-b);
}

async function scopeSignature(doc,pages){
  return (await sha256([doc,...pages].join('|'))).slice(0,24);
}

async function buildManifest(doc,{pdfEntry=null}={}){
  const sourcePdf=V.SourcePDF;
  if(!sourcePdf?.openPdf||!sourcePdf?.bookPage)throw Error('SOURCE_PAGE_FINGERPRINT_PDF_RUNTIME_MISSING');
  const entry=pdfEntry||await sourcePdf.openPdf(doc,{timeoutMs:120000});
  const pdf=entry?.pdf;
  if(!pdf||!Number.isInteger(pdf.numPages)||pdf.numPages<1)throw Error('SOURCE_PAGE_FINGERPRINT_INVALID_PDF');
  const cited=citedBookPages(doc);
  const citedSet=new Set(cited);
  const pages=[];
  for(let pdfPage=1;pdfPage<=pdf.numPages;pdfPage++){
    const bookPage=Number(sourcePdf.bookPage(doc,pdfPage))||0;
    if(bookPage<1||!citedSet.has(bookPage))continue;
    const page=await pdf.getPage(pdfPage);
    const tc=await page.getTextContent();
    const text=normalizeText((tc.items||[]).map(x=>x?.str||'').join(' '));
    pages.push({pdfPage,bookPage,hash:await sha256(text),textLength:text.length});
  }
  return{
    version:VERSION,
    doc,
    algorithm:'pdfjs-text-sha256-v1',
    generatedAt:new Date().toISOString(),
    pdfPages:pdf.numPages,
    citedPages:cited.length,
    capturedPages:pages.length,
    scopeSignature:await scopeSignature(doc,cited),
    pages
  };
}

function groupBookRanges(doc,bookPages){
  const sorted=[...new Set((bookPages||[]).filter(x=>Number.isInteger(x)&&x>0))].sort((a,b)=>a-b);
  const ranges=[];
  for(const page of sorted){
    const last=ranges[ranges.length-1];
    if(last&&page===last.to+1)last.to=page;
    else ranges.push({doc,from:page,to:page});
  }
  return ranges;
}

function diffManifests(previous,next){
  const doc=String(next?.doc||previous?.doc||'');
  if(!doc||previous?.doc!==next?.doc)return{doc,comparable:false,reason:'DOC_MISMATCH',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  if(previous?.version!==VERSION||next?.version!==VERSION)return{doc,comparable:false,reason:'VERSION_MISMATCH',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  if(previous?.scopeSignature!==next?.scopeSignature)return{doc,comparable:false,reason:'SCOPE_CHANGED',changed:false,ranges:[],changedBookPages:[],unmappedPdfPages:[]};
  const before=new Map((previous.pages||[]).map(row=>[pageKey(row),row]));
  const after=new Map((next.pages||[]).map(row=>[pageKey(row),row]));
  const keys=new Set([...before.keys(),...after.keys()]);
  const changed=[],changedBookPages=[],unmappedPdfPages=[];
  for(const key of keys){
    const a=before.get(key),b=after.get(key);
    if(a?.hash===b?.hash&&a&&b)continue;
    const row=b||a||{};
    changed.push({key,before:a?.hash||'',after:b?.hash||'',bookPage:Number(row.bookPage)||0,pdfPage:Number(row.pdfPage)||0});
    if(Number(row.bookPage)>0)changedBookPages.push(Number(row.bookPage));
    else if(Number(row.pdfPage)>0)unmappedPdfPages.push(Number(row.pdfPage));
  }
  return{
    doc,comparable:true,reason:'',changed:changed.length>0,
    changedPages:changed,
    changedBookPages:[...new Set(changedBookPages)].sort((a,b)=>a-b),
    unmappedPdfPages:[...new Set(unmappedPdfPages)].sort((a,b)=>a-b),
    ranges:groupBookRanges(doc,changedBookPages),
    exact:unmappedPdfPages.length===0
  };
}

async function compareAndStore(doc,{pdfEntry=null}={}){
  const previous=read(doc);
  const next=await buildManifest(doc,{pdfEntry});
  if(!previous){
    const stored=write(doc,next);
    return{doc,baselineEstablished:true,stored,comparable:false,changed:false,exact:false,ranges:[],manifest:next};
  }
  const diff=diffManifests(previous,next);
  if(!diff.comparable){
    const stored=write(doc,next);
    return{...diff,baselineReset:true,stored,exact:false,manifest:next};
  }
  const stored=write(doc,next);
  return{...diff,baselineEstablished:false,stored,manifest:next};
}

function exactImpact(ranges){
  if(!ranges?.length)return{conceptIds:[],questionIds:[],conceptCount:0,questionCount:0};
  return V.SourceImpact119?.diffImpact?.(ranges)||{conceptIds:[],questionIds:[],conceptCount:0,questionCount:0};
}

async function analyzeOfficialImpact(report){
  const docs=[...new Set(report?.docs||[])];
  if(!report?.needsRevalidation||!docs.length)return null;
  const documents=[];
  const ranges=[];
  let baselineMissing=false,failed=false;
  for(const doc of docs){
    try{
      const result=await compareAndStore(doc);
      documents.push({doc,...result,manifest:undefined});
      if(result.baselineEstablished||result.baselineReset)baselineMissing=true;
      if(result.comparable&&result.changed)ranges.push(...result.ranges);
    }catch(error){
      failed=true;
      documents.push({doc,error:String(error?.message||error),comparable:false,changed:false,ranges:[]});
    }
  }
  const impact=exactImpact(ranges);
  const changedDocs=documents.filter(x=>x.changed).map(x=>x.doc);
  const unchangedDocs=documents.filter(x=>x.comparable&&!x.changed).map(x=>x.doc);
  lastReport={
    version:VERSION,
    generatedAt:new Date().toISOString(),
    docs,
    documents,
    changedDocs,
    unchangedDocs,
    ranges:ranges.sort(rangeSort),
    exactImpact:impact,
    baselineMissing,
    failed,
    failClosed:failed||baselineMissing||documents.some(x=>x.exact===false&&x.changed),
    automaticMutationAllowed:false
  };
  render(lastReport);
  if(typeof window.dispatchEvent==='function'&&typeof window.CustomEvent==='function')window.dispatchEvent(new CustomEvent('aitutor-official-page-fingerprint',{detail:lastReport}));
  return lastReport;
}

function render(report){
  if(typeof document==='undefined')return;
  const card=document.querySelector('[data-official-monitor-card]');
  if(!card)return;
  card.querySelector('[data-page-fingerprint-report]')?.remove();
  const box=document.createElement('div');
  box.dataset.pageFingerprintReport='1';
  box.className='official-monitor-meta official-source-page-fingerprint-report';
  const main=document.createElement('span');
  const count=report?.ranges?.reduce((n,r)=>n+(r.to-r.from+1),0)||0;
  if(report?.failed)main.textContent='공식 PDF 본문 페이지 확인 실패 · 문서 전체 재검증 유지';
  else if(report?.baselineMissing)main.textContent='공식 PDF 근거 페이지 기준선 저장 · 다음 동일 URL 교체부터 페이지 단위 비교';
  else if(report?.changedDocs?.length)main.textContent=`공식 PDF 본문 변경 · 근거 페이지 ${count}쪽 · 영향 개념 ${report.exactImpact?.conceptCount||0} · A/B 검증문항 ${report.exactImpact?.questionCount||0}`;
  else main.textContent='공식 공고 변경 확인 · 현재 인용 중인 PDF 근거 페이지 본문 변화 없음';
  box.appendChild(main);
  if(report?.ranges?.length){const detail=document.createElement('span');detail.textContent='변경 범위 '+report.ranges.map(r=>`${r.doc} ${r.from}${r.to!==r.from?'~'+r.to:''}쪽`).join(' · ');box.appendChild(detail)}
  if(report?.failClosed){const guard=document.createElement('span');guard.textContent='자동 콘텐츠 반영 금지 · 불확실 범위는 문서 전체 재검증';box.appendChild(guard)}
  const anchor=card.querySelector('[data-source-impact-report]')||card.querySelector('.official-monitor-meta');
  anchor?.insertAdjacentElement('afterend',box);
}

function queueBaseline(doc,pdfEntry=null){
  if(!doc||queued.has(doc)||read(doc))return;
  queued.add(doc);
  const run=async()=>{
    try{const next=await buildManifest(doc,{pdfEntry});write(doc,next)}catch{}finally{queued.delete(doc)}
  };
  if(typeof requestIdleCallback==='function')requestIdleCallback(()=>run(),{timeout:5000});else setTimeout(run,250);
}

function hookPdfRender(){
  const sourcePdf=V.SourcePDF;
  if(!sourcePdf?.render||sourcePdf.__pageFingerprintHooked)return;
  const originalRender=sourcePdf.render.bind(sourcePdf);
  sourcePdf.render=async function(key,...args){
    const out=await originalRender(key,...args);
    try{const entry=await sourcePdf.openPdf(key);queueBaseline(key,entry)}catch{}
    return out;
  };
  sourcePdf.__pageFingerprintHooked=true;
}

function audit(){
  const previous={version:VERSION,doc:'fire1',scopeSignature:'same',pages:[
    {pdfPage:26,bookPage:10,hash:'a'},{pdfPage:27,bookPage:11,hash:'b'},{pdfPage:29,bookPage:13,hash:'d'}
  ]};
  const next={version:VERSION,doc:'fire1',scopeSignature:'same',pages:[
    {pdfPage:26,bookPage:10,hash:'x'},{pdfPage:27,bookPage:11,hash:'y'},{pdfPage:29,bookPage:13,hash:'d'}
  ]};
  const diff=diffManifests(previous,next);
  const scope=diffManifests(previous,{...next,scopeSignature:'new'});
  return{
    version:VERSION,
    groupedRangeOk:diff.comparable&&diff.changed&&diff.ranges.length===1&&diff.ranges[0].from===10&&diff.ranges[0].to===11,
    unchangedPageExcluded:diff.changedBookPages.length===2&&!diff.changedBookPages.includes(13),
    scopeChangeFailClosed:scope.comparable===false&&scope.reason==='SCOPE_CHANGED',
    complete:false
  };
}

const auditResult=audit();
auditResult.complete=auditResult.groupedRangeOk&&auditResult.unchangedPageExcluded&&auditResult.scopeChangeFailClosed;
V.SourcePageFingerprint119={
  version:VERSION,buildManifest,diffManifests,compareAndStore,analyzeOfficialImpact,groupBookRanges,audit:()=>({...auditResult}),
  readBaseline:read,clearBaseline:doc=>{try{localStorage.removeItem(KEY_PREFIX+doc);return true}catch{return false}},
  get lastReport(){return lastReport},
  policy:{officialOnly:true,citedPagesOnly:true,hashesOnlyPersistent:true,noSourceTextPersistence:true,noAutomaticMutation:true,failClosedWithoutBaseline:true}
};
hookPdfRender();
window.addEventListener('aitutor-official-source-impact',event=>{analyzeOfficialImpact(event?.detail||{}).catch(()=>{})});
})();

;

/* --- supabase-lite.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const SESSION_KEY='aitutor9:supabase-lite-session';
const safeJson=s=>{try{return s?JSON.parse(s):null}catch{return null}};
const readSession=()=>{try{return safeJson(localStorage.getItem(SESSION_KEY))}catch{return null}};
const writeSession=s=>{try{s?localStorage.setItem(SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(SESSION_KEY)}catch{}};
const decodeJwt=token=>{try{const p=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(decodeURIComponent(escape(atob(p))))}catch{return{}}};
function createClient(url,key){
  url=String(url||'').replace(/\/$/,'');let session=readSession(),refreshing=null;const listeners=new Set();
  const headers=(token=session?.access_token)=>({'apikey':key,'Authorization':`Bearer ${token||key}`,'Content-Type':'application/json'});
  const errObj=async r=>{let d=null;try{d=await r.json()}catch{}const e=new Error(d?.msg||d?.message||d?.error_description||d?.error||`HTTP ${r.status}`);e.status=r.status;e.code=d?.code||null;return e};
  const emit=(event)=>{const s=session?{...session,user:session.user||null}:null;for(const fn of listeners){try{fn(event,s)}catch(e){console.warn('auth listener failed',e)}}};
  function clearSession(event='SIGNED_OUT'){const had=!!session;session=null;writeSession(null);if(had)emit(event);return null}
  function store(raw){if(!raw?.access_token)return null;const claims=decodeJwt(raw.access_token),expiresAt=raw.expires_at?Number(raw.expires_at):claims.exp||Math.floor(Date.now()/1000)+(Number(raw.expires_in)||3600);session={access_token:raw.access_token,refresh_token:raw.refresh_token||session?.refresh_token||'',token_type:raw.token_type||'bearer',expires_at:expiresAt,user:raw.user||session?.user||null};writeSession(session);return session}
  async function refresh(){
    if(refreshing)return refreshing;
    const rt=session?.refresh_token;
    if(!rt)return clearSession();
    refreshing=(async()=>{
      const r=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({refresh_token:rt})});
      if(!r.ok)return clearSession();
      const d=await r.json();return store(d)
    })().finally(()=>refreshing=null);
    return refreshing
  }
  async function token(){
    if(!session?.access_token)return null;
    const exp=Number(session.expires_at)||decodeJwt(session.access_token).exp||0;
    if(exp&&exp*1000<Date.now()+30000){
      if(!session.refresh_token)return clearSession();
      const renewed=await refresh();if(!renewed)return null
    }
    return session?.access_token||null
  }
  async function api(path,opt={},retry=true){
    const t=await token();
    const r=await fetch(url+path,{...opt,headers:{...headers(t),...(opt.headers||{})}});
    if(r.status===401&&retry){
      if(session?.refresh_token&&await refresh())return api(path,opt,false);
      if(session)clearSession()
    }
    return r
  }
  function consumeRedirect(){try{const h=new URLSearchParams(location.hash.replace(/^#/,''));if(h.get('access_token')){store({access_token:h.get('access_token'),refresh_token:h.get('refresh_token')||'',token_type:h.get('token_type')||'bearer',expires_in:Number(h.get('expires_in'))||3600});history.replaceState(null,'',location.pathname+location.search);return true}}catch{}return false}
  consumeRedirect();
  class Query{
    constructor(table){this.table=table;this.op='select';this.cols='*';this.filters=[];this.body=null;this.options={}}
    select(cols='*'){this.op='select';this.cols=cols||'*';return this}
    eq(col,val){this.filters.push([col,'eq',val]);return this}
    in(col,vals){this.filters.push([col,'in',Array.isArray(vals)?vals:[]]);return this}
    order(col,{ascending=true}={}){this.orderBy=[String(col||''),ascending!==false];return this}
    range(from,to){this.rangeFrom=Math.max(0,Number(from)||0);this.rangeTo=Math.max(this.rangeFrom,Number(to)||this.rangeFrom);return this}
    delete(){this.op='delete';return this}
    update(values){this.op='update';this.body=values||{};return this}
    insert(rows){this.op='insert';this.body=rows;return this.exec()}
    upsert(rows,options={}){this.op='upsert';this.body=rows;this.options=options||{};return this.exec()}
    maybeSingle(){this.single=true;return this.exec()}
    then(a,b){return this.exec().then(a,b)}
    async exec(){
      const qs=new URLSearchParams();if(this.op==='select')qs.set('select',this.cols);
      for(const [c,o,v] of this.filters){if(o==='eq')qs.set(c,'eq.'+String(v));else if(o==='in')qs.set(c,'in.('+v.map(x=>String(x).replace(/"/g,'')).join(',')+')')}
      if(this.orderBy?.[0])qs.set('order',this.orderBy[0]+'.'+(this.orderBy[1]?'asc':'desc'));
      if(Number.isFinite(this.rangeFrom)&&Number.isFinite(this.rangeTo)){qs.set('offset',String(this.rangeFrom));qs.set('limit',String(this.rangeTo-this.rangeFrom+1))}
      if(this.options.onConflict)qs.set('on_conflict',this.options.onConflict);
      const q=qs.toString(),path='/rest/v1/'+encodeURIComponent(this.table)+(q?'?'+q:'');
      let method='GET',body,extra={};
      if(this.op==='insert'){method='POST';body=JSON.stringify(this.body);extra.Prefer='return=minimal'}
      if(this.op==='upsert'){method='POST';body=JSON.stringify(this.body);extra.Prefer='resolution=merge-duplicates,return=minimal'}
      if(this.op==='update'){method='PATCH';body=JSON.stringify(this.body);extra.Prefer='return=minimal'}
      if(this.op==='delete'){method='DELETE';extra.Prefer='return=minimal'}
      const r=await api(path,{method,headers:extra,body});
      if(!r.ok)return{data:null,error:await errObj(r)};
      if(this.op!=='select'||r.status===204)return{data:null,error:null};
      const d=await r.json();return{data:this.single?(Array.isArray(d)?d[0]||null:d):d,error:null};
    }
  }
  const auth={
    async getUser(){
      let t=await token();if(!t)return{data:{user:null},error:null};
      let r=await api('/auth/v1/user',{method:'GET'});
      if(!r.ok){const e=await errObj(r);return{data:{user:null},error:e}}
      const user=await r.json();session={...session,user};writeSession(session);return{data:{user},error:null}
    },
    onAuthStateChange(fn){listeners.add(fn);return{data:{subscription:{unsubscribe(){listeners.delete(fn)}}}}},
    async signUp({email,password,options={}}){
      const r=await fetch(url+'/auth/v1/signup',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({email,password,data:options.data||{}})});
      if(!r.ok)return{data:null,error:await errObj(r)};const d=await r.json(),s=store(d);if(s)emit('SIGNED_IN');return{data:{user:d.user||d,session:s},error:null}
    },
    async resend({type,email}){const r=await fetch(url+'/auth/v1/resend',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({type,email})});if(!r.ok)return{data:null,error:await errObj(r)};let d=null;try{d=await r.json()}catch{}return{data:d,error:null}},
    async signInWithPassword({email,password}){const r=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'apikey':key,'Content-Type':'application/json'},body:JSON.stringify({email,password})});if(!r.ok)return{data:null,error:await errObj(r)};const d=await r.json(),s=store(d);emit('SIGNED_IN');return{data:{user:d.user||s?.user||null,session:s},error:null}},
    async signOut(){const t=session?.access_token;clearSession();if(t){try{await fetch(url+'/auth/v1/logout',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+t,'Content-Type':'application/json'}})}catch{}}return{error:null}}
  };
  return{auth,from(table){return new Query(table)},__runtime:'same-origin-lite'};
}
V.SupabaseLite={createClient,sessionKey:SESSION_KEY,runtime:'same-origin-lite'};
})();
;

/* --- auth.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};const cfg=window.AITUTOR_V9_CONFIG||{};let client=null,user=null,readyPromise=null,activeAdopt=null,activeId='',lastAdoptedId='',lastAdoptedAt=0,manualSignOutUntil=0,lastEmitReason='';
const T=Object.freeze({profiles:'study_profiles',user_progress:'study_user_progress',user_answers:'study_user_answers',wrong_answers:'study_wrong_answers',review_schedule:'study_review_schedule',personal_notes:'study_personal_notes',private_documents:'study_private_documents',document_chunks:'study_document_chunks',study_sessions:'study_sessions',exam_history:'study_exam_history',tutor_preferences:'study_tutor_preferences'});
const clientKey=()=>cfg.supabasePublishableKey||cfg.supabaseAnonKey||'';
const configured=()=>cfg.enableCloudSync===true&&!!(cfg.supabaseUrl&&clientKey());const iso=x=>x?new Date(x).toISOString():null;const ms=x=>x?Date.parse(x)||0:0;
const subject=s=>s==='fire'||/소방/.test(String(s||''))?'fire':'ems';
function emit(reason='state-change'){lastEmitReason=reason;window.dispatchEvent(new CustomEvent('aitutor-auth-change',{detail:{user,reason}}))}
async function checked(p){const r=await p;if(r.error)throw r.error;return r.data}
async function fetchRemoteSnapshot(uid){const [profile,progress,answers,wrongs,reviews,notes,sessions,exams,tutor,docs,chunks]=await Promise.all([
  checked(client.from(T.profiles).select('*').eq('id',uid).maybeSingle()),
  checked(client.from(T.user_progress).select('*').eq('user_id',uid)),
  checked(client.from(T.user_answers).select('*').eq('user_id',uid)),
  checked(client.from(T.wrong_answers).select('*').eq('user_id',uid)),
  checked(client.from(T.review_schedule).select('*').eq('user_id',uid)),
  checked(client.from(T.personal_notes).select('*').eq('user_id',uid)),
  checked(client.from(T.study_sessions).select('*').eq('user_id',uid)),
  checked(client.from(T.exam_history).select('*').eq('user_id',uid)),
  checked(client.from(T.tutor_preferences).select('*').eq('user_id',uid).maybeSingle()),
  checked(client.from(T.private_documents).select('*').eq('user_id',uid)),
  checked(client.from(T.document_chunks).select('*').eq('user_id',uid))
]);
  const remote={ownerId:uid,progress:{},reviewSchedule:{},answerEvents:[],answers:{},confidence:{},wrongs:[],notes:[],studySessions:[],examHistory:[],settings:{cloudSync:true}};
  if(profile)remote.profile={examYear:profile.exam_year||'2027',examDate:profile.exam_date||'',dailyMinutes:profile.daily_minutes||40,level:profile.level||'처음 시작',updatedAt:ms(profile.updated_at)};
  for(const r of progress||[])remote.progress[r.concept_id]={conceptId:r.concept_id,mastery:Number(r.mastery)||0,attempts:r.attempts||0,correct:r.correct_count||0,dangerousWrong:r.dangerous_wrong||0,lastStudy:ms(r.last_study),nextReview:ms(r.next_review),updatedAt:ms(r.updated_at)};
  for(const r of answers||[]){const e={eventId:r.id,questionId:r.question_id,conceptId:r.concept_id,scopeId:r.scope_id||'',subject:r.subject,choice:r.choice,correct:!!r.correct,confidence:r.confidence,responseMs:r.response_ms,at:ms(r.answered_at)};remote.answerEvents.push(e);remote.answers[e.questionId]=Number(e.choice);remote.confidence[e.questionId]=e.confidence}
  remote.wrongs=(wrongs||[]).map(r=>({id:r.id,questionId:r.question_id,conceptId:r.concept_id,confidence:r.confidence,due:ms(r.due_at),intervalDays:r.interval_days||0,resolved:!!r.resolved,wrongCount:r.wrong_count||1,lastWrongAt:ms(r.last_wrong_at),resolvedAt:ms(r.resolved_at),createdAt:ms(r.created_at)}));
  for(const r of reviews||[])remote.reviewSchedule[r.concept_id]={conceptId:r.concept_id,due:ms(r.due_at),intervalDays:r.interval_days||0,mastery:r.mastery||0,updatedAt:ms(r.updated_at)};
  remote.notes=(notes||[]).filter(r=>!r.deleted_at).map(r=>({id:r.id,title:r.title,body:r.body,sourceType:r.source_type,private:true,createdAt:ms(r.created_at),updatedAt:ms(r.updated_at)}));
  remote.studySessions=(sessions||[]).map(r=>({id:r.id,conceptId:r.concept_id||'',startedAt:ms(r.started_at),endedAt:ms(r.ended_at),durationSec:r.duration_sec||0}));
  remote.examHistory=(exams||[]).map(r=>({id:r.id,mode:r.mode,score:r.score||0,fireCorrect:r.fire_correct||0,emsCorrect:r.ems_correct||0,totalAnswered:r.total_answered||0,at:ms(r.created_at)}));
  if(tutor)remote.tutorPreferences={explanationLevel:tutor.explanation_level||'adaptive',emphasizeDangerousWrong:tutor.emphasize_dangerous_wrong!==false,usePrivateNotes:tutor.use_private_notes!==false,updatedAt:ms(tutor.updated_at)};
  const privateDocs=(docs||[]).map(r=>({id:r.id,ownerId:uid,kind:'personal',title:r.title,fileName:r.file_name||'',mime:r.mime_type||'',pageCount:r.page_count||0,sourceHash:r.source_hash||'',private:true,createdAt:ms(r.created_at),updatedAt:ms(r.updated_at),deletedAt:ms(r.deleted_at),original:null}));
  const privateChunks=(chunks||[]).map(r=>({id:r.id,ownerId:uid,docId:r.document_id,kind:'personal',page:r.page_no||1,chunkIndex:r.chunk_index||0,text:r.body||''}));
  return{state:remote,docs:privateDocs,chunks:privateChunks};
}
async function pullRemoteIntoLocal(uid){const snap=await fetchRemoteSnapshot(uid);V.Store.mergeIntoOwner(uid,snap.state);V.Store.switchOwner(uid);if(V.PrivateDocs?.importFromSync)await V.PrivateDocs.importFromSync(snap.docs,snap.chunks);V.Store.state.settings.cloudSync=true;V.Store.save();return snap}
async function upsertRows(table,rows,options){if(!rows?.length)return;for(let i=0;i<rows.length;i+=250){const r=await client.from(table).upsert(rows.slice(i,i+250),options||{});if(r.error)throw r.error}}
async function deleteChunksFor(uid,ids){if(!ids?.length)return;for(let i=0;i<ids.length;i+=100){const r=await client.from(T.document_chunks).delete().eq('user_id',uid).in('document_id',ids.slice(i,i+100));if(r.error)throw r.error}}
async function syncAllInternal(uid){if(!client||!uid)throw Error('NOT_SIGNED_IN');if(V.Store.ownerId!==uid)V.Store.switchOwner(uid);const s=V.Store.state,now=new Date().toISOString(),tasks=[];
  tasks.push(upsertRows(T.profiles,[{id:uid,exam_year:s.profile?.examYear||null,exam_date:s.profile?.examDate||null,daily_minutes:s.profile?.dailyMinutes||40,level:s.profile?.level||'처음 시작',updated_at:iso(s.profile?.updatedAt||Date.now())}]));
  const progress=Object.entries(s.progress||{}).map(([concept_id,p])=>({user_id:uid,concept_id,mastery:p.mastery||0,attempts:p.attempts||0,correct_count:p.correct||0,dangerous_wrong:p.dangerousWrong||0,last_study:iso(p.lastStudy),next_review:iso(p.nextReview),updated_at:iso(p.updatedAt||p.lastStudy||Date.now())}));tasks.push(upsertRows(T.user_progress,progress,{onConflict:'user_id,concept_id'}));
  const events=(s.answerEvents||[]).filter(e=>e?.eventId&&e?.questionId&&Number.isInteger(Number(e.choice))).map(e=>({id:e.eventId,user_id:uid,question_id:e.questionId,concept_id:e.conceptId||'',scope_id:e.scopeId||null,subject:subject(e.subject),choice:Number(e.choice),correct:!!e.correct,confidence:e.confidence||'none',response_ms:e.responseMs==null?null:Number(e.responseMs),answered_at:iso(e.at||Date.now())}));tasks.push(upsertRows(T.user_answers,events));
  const wrong=(s.wrongs||[]).map(w=>({id:w.id,user_id:uid,question_id:w.questionId,concept_id:w.conceptId||'',confidence:w.confidence||'none',due_at:iso(w.due||Date.now()),interval_days:w.intervalDays||0,resolved:!!w.resolved,wrong_count:w.wrongCount||1,last_wrong_at:iso(w.lastWrongAt),resolved_at:iso(w.resolvedAt),created_at:iso(w.createdAt||w.lastWrongAt||Date.now())}));tasks.push(upsertRows(T.wrong_answers,wrong));
  const reviews=Object.entries(s.reviewSchedule||{}).map(([concept_id,r])=>({user_id:uid,concept_id,due_at:iso(r.due||Date.now()),interval_days:r.intervalDays||0,mastery:r.mastery||0,updated_at:iso(r.updatedAt||Date.now())}));tasks.push(upsertRows(T.review_schedule,reviews,{onConflict:'user_id,concept_id'}));
  const notes=(s.notes||[]).map(n=>({id:n.id,user_id:uid,title:n.title||'내 노트',body:n.body||n.text||'',source_type:n.sourceType||'manual',private:true,created_at:iso(n.createdAt||n.updatedAt||Date.now()),updated_at:iso(n.updatedAt||Date.now()),deleted_at:null}));tasks.push(upsertRows(T.personal_notes,notes));
  const sessions=(s.studySessions||[]).map(x=>({id:x.id,user_id:uid,concept_id:x.conceptId||null,started_at:iso(x.startedAt||Date.now()),ended_at:iso(x.endedAt),duration_sec:x.durationSec||0}));tasks.push(upsertRows(T.study_sessions,sessions));
  const exams=(s.examHistory||[]).map(x=>({id:x.id,user_id:uid,mode:x.mode==='real'?'real':'practice',score:x.score||0,fire_correct:x.fireCorrect||0,ems_correct:x.emsCorrect||0,total_answered:x.totalAnswered||0,created_at:iso(x.at||Date.now())}));tasks.push(upsertRows(T.exam_history,exams));
  const tp=s.tutorPreferences||{};tasks.push(upsertRows(T.tutor_preferences,[{user_id:uid,explanation_level:tp.explanationLevel||'adaptive',emphasize_dangerous_wrong:tp.emphasizeDangerousWrong!==false,use_private_notes:tp.usePrivateNotes!==false,updated_at:iso(tp.updatedAt||Date.now())}]));
  await Promise.all(tasks);
  // Only extracted text/metadata sync here. Original PDF/image bytes are never uploaded automatically.
  if(V.PrivateDocs?.exportForSync){const bundle=await V.PrivateDocs.exportForSync();const docs=(bundle.docs||[]).map(d=>({id:d.id,user_id:uid,title:d.title||d.fileName||'개인자료',file_name:d.fileName||null,mime_type:d.mime||null,page_count:d.pageCount||0,source_hash:d.sourceHash||null,storage_path:null,sync_original:false,created_at:iso(d.createdAt||Date.now()),updated_at:iso(d.updatedAt||d.createdAt||Date.now()),deleted_at:null}));const tomb=(bundle.deleted||[]).map(d=>({id:d.id,user_id:uid,title:'(삭제됨)',file_name:null,mime_type:null,page_count:0,source_hash:null,storage_path:null,sync_original:false,created_at:iso(d.deletedAt),updated_at:iso(d.deletedAt),deleted_at:iso(d.deletedAt)}));await upsertRows(T.private_documents,[...docs,...tomb]);const liveIds=new Set(docs.map(d=>d.id));const chunks=(bundle.chunks||[]).filter(c=>liveIds.has(c.docId)).map(c=>({id:c.id,user_id:uid,document_id:c.docId,page_no:c.page||null,chunk_index:c.chunkIndex||0,body:c.text||'',created_at:now}));await upsertRows(T.document_chunks,chunks);await deleteChunksFor(uid,tomb.map(x=>x.id))}
  s.settings.cloudSync=true;V.Store.save();return true;
}
async function adoptUser(next){if(!next)return;if(V.Auth?.hasStudyMembership&&!(await V.Auth.hasStudyMembership(next.id)))throw Error('STUDY_ACCOUNT_REQUIRED');user=next;V.Store.switchOwner(next.id);await pullRemoteIntoLocal(next.id);V.Store.migrateGuestToUser(next.id);await syncAllInternal(next.id);lastAdoptedId=next.id;lastAdoptedAt=Date.now();emit('signed-in')}
function queueAdopt(next){if(!next)return Promise.resolve();if(activeId===next.id&&activeAdopt)return activeAdopt;if(lastAdoptedId===next.id&&Date.now()-lastAdoptedAt<3000)return Promise.resolve();activeId=next.id;activeAdopt=adoptUser(next).finally(()=>{activeId='';activeAdopt=null});return activeAdopt}
async function init(){if(readyPromise)return readyPromise;readyPromise=(async()=>{if(!configured())return{client:null,user:null};try{const m=V.SupabaseLite;if(!m?.createClient)throw Error('SUPABASE_LITE_NOT_LOADED');client=m.createClient(cfg.supabaseUrl,clientKey());const {data,error}=await client.auth.getUser();if(error)throw error;user=data?.user||null;client.auth.onAuthStateChange((event,session)=>{const next=session?.user||null;if(event==='SIGNED_OUT'||!next){if(event==='SIGNED_OUT'){user=null;V.Store.switchOwner(V.Store.guestId);emit(Date.now()<manualSignOutUntil?'manual-signout':'session-expired')}return}user=next;if(event==='SIGNED_IN'||event==='USER_UPDATED')queueAdopt(next).catch(e=>console.warn('member adopt failed',e))});if(user)setTimeout(()=>queueAdopt(user).catch(e=>console.warn('initial member sync failed',e)),0);return{client,user}}catch(e){console.warn('auth init failed',e);client=null;user=null;return{client:null,user:null}}})();return readyPromise}
async function signUp(email,password){await init();if(!client)throw Error('MEMBER_BACKEND_NOT_CONFIGURED');const {data,error}=await client.auth.signUp({email,password,options:{data:{app_scope:'study-v9'}}});if(error)throw error;if(data?.session&&data?.user){await queueAdopt(data.user);return{...data,pendingEmailConfirmation:false}}if(data?.user)return{...data,pendingEmailConfirmation:true};return{...data,pendingEmailConfirmation:true}}
async function resendConfirmation(email){await init();if(!client)throw Error('MEMBER_BACKEND_NOT_CONFIGURED');if(!email)throw Error('EMAIL_REQUIRED');const {data,error}=await client.auth.resend({type:'signup',email});if(error)throw error;return data}
async function signIn(email,password){await init();if(!client)throw Error('MEMBER_BACKEND_NOT_CONFIGURED');const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;if(data?.user)await queueAdopt(data.user);return data}
async function signOut(){await init();manualSignOutUntil=Date.now()+3000;if(client){const {error}=await client.auth.signOut();if(error)throw error}if(lastEmitReason!=='manual-signout'){user=null;V.Store.switchOwner(V.Store.guestId);emit('manual-signout')}}
async function syncAll(){await init();if(!client||!user)throw Error('NOT_SIGNED_IN');await pullRemoteIntoLocal(user.id);return syncAllInternal(user.id)}
async function pull(){await init();if(!client||!user)throw Error('NOT_SIGNED_IN');return pullRemoteIntoLocal(user.id)}
async function deleteWrong(id){await init();if(!client||!user)throw Error('NOT_SIGNED_IN');if(!id)throw Error('WRONG_ID_REQUIRED');const r=await client.from(T.wrong_answers).delete().eq('user_id',user.id).eq('id',id);if(r.error)throw r.error;return true}
async function saveNote(note){await init();if(!client||!user)return false;if(!note?.id)throw Error('NOTE_ID_REQUIRED');const row={id:note.id,user_id:user.id,title:note.title||'내 노트',body:note.body||note.text||'',source_type:note.sourceType||'manual',private:true,created_at:iso(note.createdAt||note.updatedAt||Date.now()),updated_at:iso(note.updatedAt||Date.now()),deleted_at:null};const r=await client.from(T.personal_notes).upsert([row]);if(r.error)throw r.error;return true}
async function deleteNote(id){await init();if(!client||!user)return false;if(!id)throw Error('NOTE_ID_REQUIRED');const r=await client.from(T.personal_notes).update({deleted_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('user_id',user.id).eq('id',id);if(r.error)throw r.error;return true}
V.Auth={init,configured,get client(){return client},get user(){return user},get isGuest(){return !user},signUp,resendConfirmation,signIn,signOut,syncAll,pull,deleteWrong,saveNote,deleteNote,label(){return user?.email||'게스트'},privacy:'personal-data-is-private-by-default',syncPolicy:{remoteFirstOnSignIn:true,remoteFirstOnManualSync:true,originalFilesAutoUpload:false,extractedTextManualCloudSync:true,deletionTombstones:true,sharedProjectNamespace:'study_*',signupScope:'study-v9',clientRuntime:'same-origin-lite',externalSdkRequired:false}};
init();
})();
;
