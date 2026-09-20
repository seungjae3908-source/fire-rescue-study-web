'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const KEY='aitutor9:official-monitor:v1';
const SNAPSHOT_URL='https://raw.githubusercontent.com/seungjae3908-source/fire-rescue-study-web/chore/official-monitor-snapshot/v9/data/official-monitor.json';
const START_AT='2026-09-20';
const REFRESH_MS=30*60*1000;
const ALLOWED=new Set(['www.nfa.go.kr','nfa.go.kr','www.nfsa.go.kr','nfsa.go.kr','cherish.nfsa.go.kr']);
let state={status:'idle',snapshot:null,unseen:[],lastFetched:0,error:'',transport:'',notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
let timer=null;
let observer=null;

const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};
const write=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}};
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const official=url=>{try{const u=new URL(String(url||''));return u.protocol==='https:'&&ALLOWED.has(u.hostname.toLowerCase())}catch{return false}};
const validSnapshot=x=>!!x&&x.version==='119-official-monitor-snapshot-v1'&&x.officialOnly===true&&Array.isArray(x.items)&&Array.isArray(x.sourceStatus)&&x.items.every(i=>i&&i.id&&i.title&&official(i.url));
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
  return '<a class="official-monitor-item '+(isNew?'new':'')+'" href="'+esc(x.url)+'" target="_blank" rel="noopener"><div><span class="tag '+(x.reviewRequired||x.changeState==='updated'?'warn':'blue')+'">'+esc(label)+'</span><b>'+esc(x.title)+'</b><small>'+esc(x.sourceLabel)+(x.publishedAt?' · '+esc(x.publishedAt):'')+'</small>'+scheduleHtml+attachmentHtml+'</div><span aria-hidden="true">↗</span></a>';
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
  const completeSources=sourceTotal>=4&&sourceOk===sourceTotal;
  const status=loading?'공식 사이트 확인 중':stale?'최근 저장본 표시 · 연결 확인 필요':error?'공식 감시 연결 확인 필요':!completeSources?'일부 공식소스 확인 실패 · 결과 확정 보류':m.generatedAt?'최근 수집 '+new Date(m.generatedAt).toLocaleString('ko-KR'):'감시 데이터 준비 중';
  const transportLabel=m.transport==='app-api'?'앱 서버':m.transport==='snapshot-fallback'?'공식 스냅샷':m.transport==='cached-snapshot'?'기기 저장본':'';
  const unseenRevisions=new Set(m.unseen.map(revisionKey));
  const items=latest.length?latest.map(x=>itemHtml(x,unseenRevisions.has(revisionKey(x)))).join(''):'<div class="empty official-monitor-empty">새 시험 관련 공식 공고가 없습니다.</div>';
  const notifyLabel=m.notificationPermission==='granted'?'앱 알림 켜짐':m.notificationPermission==='denied'?'앱 알림 차단됨':'앱 알림 켜기';
  const resultTag=m.unseenCount?'<span class="tag warn">새 공고·변경 '+m.unseenCount+'건</span>':completeSources?'<span class="tag good">새 변경 없음</span>':'<span class="tag warn">일부 공식소스 확인 필요</span>';
  const calendarTarget=targetItems.find(x=>scheduleEntries(x).length>0);
  return '<section class="card official-monitor-card" aria-live="polite" aria-atomic="false" data-official-monitor-card data-monitor-key="'+esc(renderKey())+'"><div class="toolbar"><div><span class="eyebrow">공식 공고 자동감시</span><h2>2027 시험 공고 · 일정 · 교재 변경</h2></div><span class="spacer"></span>'+resultTag+'</div><p class="muted">앱 인프라가 매시간 소방청·중앙소방학교 공식 게시판만 확인합니다. 앱을 열거나 다시 활성화하면 새 공고를 표시하며, 학습 기준은 자동 변경하지 않고 원문 검토가 먼저입니다.</p><div class="official-monitor-meta"><span>'+esc(status)+'</span><span>공식 소스 '+sourceOk+'/3</span><span>목표 '+esc(m.targetExamYear)+' · 현재 기준 '+esc(m.baselineYear)+'</span></div><div class="toolbar official-monitor-actions"><button class="btn small" data-monitor-refresh>'+(loading?'확인 중…':'지금 확인')+'</button><button class="btn small ghost" data-monitor-notify '+(m.notificationPermission==='denied'?'disabled':'')+'>'+esc(notifyLabel)+'</button>'+(calendarTarget?'<button class="btn small ghost" data-monitor-calendar>일정 캘린더 저장</button>':'')+(m.unseenCount?'<button class="btn small ghost" data-monitor-seen>확인 완료</button>':'')+'</div><div class="official-monitor-list">'+items+'</div></section>';
}

function bannerHtml(){
  const m=summary();
  if(!m.unseenCount)return'';
  return '<section class="card official-monitor-banner" aria-live="polite" data-official-monitor-banner data-monitor-key="'+esc(renderKey())+'"><button class="official-monitor-banner-btn" data-monitor-open><span><b>새 공식 시험 공고·변경 '+m.unseenCount+'건</b><small>소방청·중앙소방학교 공식 출처만 확인</small></span><strong>확인 →</strong></button></section>';
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
      return{snapshot,transport:candidate.transport}
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
    state={status:'ready',snapshot,unseen,lastFetched:Date.now(),error:'',transport,notificationPermission:typeof Notification==='undefined'?'unsupported':Notification.permission};
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
  policy:{officialOnly:true,firstRunStartAt:START_AT,noAutomaticCurriculumMutation:true,rootApiFirst:true,staticSnapshotFallback:true,cachedSnapshotFallback:true,backgroundServerMonitor:true,detailScheduleDisplay:true,neverGuessMissingDates:true,officialAttachmentHint:true,scheduleDday:true,scheduleCalendarExport:true,devicePushWhenClosed:false}
};
window.addEventListener('load',()=>setTimeout(start,0),{once:true});
})();
