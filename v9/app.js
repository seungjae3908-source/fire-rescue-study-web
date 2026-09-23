'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},S=V.Store;const $=(s,r=document)=>r.querySelector(s);const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SESSION_EXPIRED_CONTRACT_COPY='로그인 세션이 만료되어 게스트 모드로 전환되었습니다.';
const runtime={more:false,account:false,bankConcept:'',bankFilter:'',bankIndex:0,calcGroup:'all',calcStage:'all',noteFilter:'all',noteSubject:'fire',noteQuery:'',goalEditor:false,studyQuizIndex:{},exam:null,examTimer:null,examDifficulty:'mid',examReportId:'',aiEngine:null,aiStatus:'근거 기반 답변',suggestions:[],suggestionsAdmin:false,suggestionsLoading:false,suggestionsOwner:'',suggestionPage:0,suggestionPageSize:20,suggestionsHasMore:false,suggestionDraft:{category:'개선',title:'',body:'',anonymous:true},suggestionError:'',questionAt:Date.now(),toast:'',authNotice:'',pendingAuthEmail:''};
function persistActiveExam(){return runtime.exam?V.ExamSession119?.save?.(runtime.exam,S.ownerId):false}
function clearActiveExam(){return V.ExamSession119?.clear?.(S.ownerId)}
function stopExamTicker(){if(runtime.examTimer){clearInterval(runtime.examTimer);runtime.examTimer=null}}
function updateExamTimer(){
const e=runtime.exam;if(!e||e.mode!=='real'){stopExamTicker();return}
const left=Math.max(0,3900-Math.floor((Date.now()-e.startedAt)/1000));
const el=document.querySelector('[data-exam-timer]');
if(el)el.textContent=`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`;
if(left<=0){stopExamTicker();finishExam(true)}
}
function startExamTicker(){stopExamTicker();if(runtime.exam?.mode==='real'){runtime.examTimer=setInterval(updateExamTimer,1000);updateExamTimer()}}
function restoreActiveExam(){
const exam=V.ExamSession119?.restore?.(S.ownerId);if(!exam)return false;
runtime.exam=exam;runtime.examDifficulty=exam.difficulty||'mid';state().page='exam';state().outline=false;S.save();return true
}
function abandonExam(){
if(!runtime.exam)return;
if(!confirm('진행 중인 시험을 중단할까요? 저장된 답안은 삭제되고 점수에는 반영되지 않습니다.'))return;
stopExamTicker();clearActiveExam();runtime.exam=null;state().page='exam';S.save();render()
}
const NAV=[['home','⌂','홈'],['study','▣','학습'],['notes','▤','합격노트'],['bank','?','문제'],['exam','⏱','시험'],['wrong','!','오답'],['stats','▥','통계'],['resources','◎','자료'],['suggestions','✉','건의함'],['settings','⚙','설정']];
const STUDY_TABS=[['core','핵심'],['detail','상세'],['quiz','문제'],['source','원문'],['ai','AI']];
function toast(t){runtime.toast=t;render();setTimeout(()=>{if(runtime.toast===t){runtime.toast='';render()}},1700)}
function state(){return S.state}function currentConcept(){return V.curriculum.byId[state().conceptId]||V.curriculum.concepts[0]}function currentScope(){return V.curriculum.scopeById[currentConcept().scopeId]}
async function ensurePageData(page,tab=state().studyTab){
if(!V.Lazy119?.needsQuestions?.(page,tab)||V.Lazy119.questionsReady)return true;
try{document.body?.setAttribute('aria-busy','true');await V.Lazy119.ensureQuestions();return true}catch(err){console.error(err);toast('문제은행을 불러오지 못했습니다. 다시 시도해주세요.');return false}finally{document.body?.removeAttribute('aria-busy')}
}
async function go(page){const target=page==='tutor'?'study':page,tab=page==='tutor'?'ai':state().studyTab;if(!await ensurePageData(target,tab))return;if(page==='tutor'){state().page='study';state().studyTab='ai'}else state().page=page;state().outline=false;S.save();runtime.more=false;render()}
function chooseConcept(id,{keepTab=false}={}){const c=V.curriculum.byId[id];if(!c)return;state().conceptId=id;state().scopeId=c.scopeId;state().subject=c.subject;if(!keepTab)state().studyTab='core';state().outline=false;S.save();go('study')}
function navButton([id,ico,label]){const active=state().page===id;return `<button class="${active?'active':''}" ${active?'aria-current="page"':''} data-go="${id}"><span class="ico">${ico}</span><span>${label}</span></button>`}
function shell(content,title='',crumb=''){const account=V.Auth?.user?'회원':'게스트';return `<div class="app"><aside class="side"><div class="brand"><span class="brand-mark">119</span><div><b>119</b><small>소방학 · 응급처치</small></div></div><nav class="nav">${NAV.map(navButton).join('')}</nav><div class="side-foot"><button class="account-chip" data-account><b>${esc(account)}</b></button></div></aside><main class="main page-${state().page} ${state().page==='exam'&&runtime.exam?'exam-active':''}"><header class="top"><h1>${esc(title||NAV.find(x=>x[0]===state().page)?.[2]||'119')}</h1><span class="spacer"></span><button class="btn small ghost" data-account>${V.Auth?.isGuest?'계정':'회원'}</button></header><section class="page">${content}</section><nav class="mobile-nav" aria-label="주요 메뉴"><button class="${state().page==='home'?'active':''}" ${state().page==='home'?'aria-current="page"':''} data-go="home">홈</button><button class="${state().page==='study'?'active':''}" ${state().page==='study'?'aria-current="page"':''} data-go="study">학습</button><button class="${state().page==='exam'?'active':''}" ${state().page==='exam'?'aria-current="page"':''} data-go="exam">시험</button><button class="${state().page==='wrong'?'active':''}" ${state().page==='wrong'?'aria-current="page"':''} data-go="wrong">오답</button><button data-more>더보기</button></nav></main>${runtime.more?moreSheet():''}${runtime.account?accountModal():''}${runtime.toast?`<div role="status" aria-live="polite" aria-atomic="true" style="position:fixed;left:50%;bottom:82px;transform:translateX(-50%);z-index:200;background:#15253a;border:1px solid #2b4361;border-radius:999px;padding:9px 13px;font-size:10px">${esc(runtime.toast)}</div>`:''}</div>`}
function moreSheet(){return `<div class="modal-wrap" data-backdrop-close-more><div class="modal menu-modal"><div class="toolbar"><h2 style="margin-right:auto">더보기</h2><button class="btn small ghost" data-close-more>닫기</button></div><div class="list menu-list">${NAV.filter(x=>!['home','study','exam','wrong'].includes(x[0])).map(x=>`<button class="row btn ghost" data-go="${x[0]}">${x[1]} ${x[2]}</button>`).join('')}</div></div></div>`}
function accountModal(){const configured=V.Auth?.configured?.(),u=V.Auth?.user,notice=runtime.authNotice,pending=runtime.pendingAuthEmail;return `<div class="modal-wrap" data-backdrop-close-account><div class="modal"><div class="toolbar"><h2 style="margin-right:auto">내 계정</h2><button class="btn small ghost" data-close-account>닫기</button></div>${u?`<p><b>${esc(u.email)}</b></p><div class="toolbar"><button class="btn" data-cloud-sync>동기화</button><button class="btn ghost" data-signout>로그아웃</button></div>`:configured?`${notice?`<div class="privacy" style="margin-bottom:10px">${esc(notice)}</div>`:''}<div class="form-grid"><label>이메일<input id="authEmail" class="input" type="email" value="${esc(pending||'')}"></label><label>비밀번호<input id="authPw" class="input" type="password" minlength="8"></label></div><div class="toolbar" style="margin-top:10px"><button class="btn primary" data-signin>로그인</button><button class="btn" data-signup>회원가입</button><button class="btn ghost" data-resend-confirmation>인증메일 다시 보내기</button></div><p class="tiny muted" style="margin-top:10px">회원가입 후 이메일 인증이 필요할 수 있습니다.</p>`:`<p class="muted">현재 기기에 학습 기록을 저장합니다.</p>`}</div></div>`}
function officialScheduleState(){
const m=V.OfficialMonitor119?.summary?.()||{},year=String(m.targetExamYear||state().profile?.examYear||'2027');
const items=[...(m.items||[])].filter(x=>x?.schedule&&(!x.title||String(x.title).includes(year)||x.kind==='exam_schedule'));
items.sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')));
const item=items.find(x=>x.schedule?.writtenExam)||items.find(x=>Object.values(x.schedule||{}).some(Boolean))||null;
const schedule=item?.schedule||{},written=schedule.writtenExam||'';
const target=written?Date.parse(written+'T00:00:00'):NaN;
const today=new Date();today.setHours(0,0,0,0);
const dday=Number.isFinite(target)?Math.ceil((target-today.getTime())/86400000):null;
return{year,item,schedule,written,dday,official:!!item}
}
function ddayText(n){return n===null?'공식 일정 대기 중':n===0?'D-Day':n>0?'D-'+n:'D+'+Math.abs(n)}
function dailyGoalOptions(){
const rows=V.curriculum?.concepts||[],groups=[['fire','소방학'],['ems','구급']];
return groups.map(([subject,label])=>'<optgroup label="'+label+'">'+rows.filter(x=>x.subject===subject).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.scopeTitle||'')+' · '+esc(x.title)+'</option>').join('')+'</optgroup>').join('')
}
function dailyGoalEditor(){
if(!runtime.goalEditor)return'';
return '<div class="daily-goal-editor"><label><span>오늘 목표에 단원 추가</span><select id="dailyGoalConcept" class="select">'+dailyGoalOptions()+'</select></label><div class="toolbar"><button class="btn small primary" data-goal-add>추가</button><button class="btn small ghost" data-goal-reset>자동 추천으로 다시 구성</button><button class="btn small ghost" data-goal-editor>닫기</button></div></div>'
}
function home(){
const r=V.Mastery.readiness(),goal=V.Mastery.dailyGoalSummary(6),plan=goal.rows,last=state().examHistory.slice(-1)[0],wrongN=state().wrongs.filter(x=>!x.resolved).length,sched=officialScheduleState(),next=plan.find(x=>!x.done)?.concept||plan[0]?.concept;
const scheduleNote=sched.written?`필기 ${esc(sched.written)} · ${esc(ddayText(sched.dday))}`:'공식 공고에서 필기일이 확인되면 자동 반영됩니다.';
const motivation=V.Mastery.dailyGoalMessage(goal),remainingMin=goal.total?Math.max(0,Math.round((state().profile.dailyMinutes||40)*(goal.remaining/goal.total))):0;
return shell(`<div class="home-grid student-home dashboard-home"><div class="home-main">
<section class="hero dashboard-hero"><span class="eyebrow">공식 일정 기반</span><h2>${esc(sched.year)} 소방공무원 시험</h2><div class="dashboard-dday">${esc(ddayText(sched.dday))}</div><p>${scheduleNote}</p><div class="toolbar dashboard-actions"><button class="btn primary" data-concept="${next?.id||'F01-C01'}">이어서 학습</button><button class="btn" data-go="exam">모의고사 시작</button></div></section>
<div class="metric-grid dashboard-metrics"><div class="metric"><span>전체 학습 진도</span><b>${r.scopeCoverage}%</b></div><div class="metric"><span>오늘 목표</span><b>${goal.done}/${goal.total}</b></div><div class="metric"><span>최근 오답</span><b>${wrongN}</b></div><div class="metric"><span>최근 시험</span><b>${last?last.score+'점':'-'}</b></div></div>
<section class="card daily-goal-card"><div class="toolbar daily-goal-head"><div><b>오늘의 목표</b><small class="tiny muted">${goal.remaining?'남은 '+goal.remaining+'개 · 약 '+remainingMin+'분':'오늘 목표 완료'}</small></div><span class="spacer"></span><strong>${goal.percent}%</strong><button class="btn small ghost" data-goal-editor>${runtime.goalEditor?'닫기':'편집'}</button></div><div class="daily-goal-progress" role="progressbar" aria-label="오늘 목표 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goal.percent}"><i style="width:${goal.percent}%"></i></div><div class="daily-goal-subjects"><span>소방학 <b>${goal.fire.done}/${goal.fire.total}</b></span><span>구급 <b>${goal.ems.done}/${goal.ems.total}</b></span></div>${dailyGoalEditor()}<div class="today-list daily-goal-list">${plan.length?plan.map(x=>`<div class="today-item daily-goal-item ${x.done?'done':''}"><button class="goal-check" data-goal-toggle="${esc(x.concept.id)}" aria-label="${x.done?'완료 해제':'완료 처리'}">${x.done?'✓':'○'}</button><button class="today-main" data-concept="${esc(x.concept.id)}"><div><b>${esc(x.concept.title)}</b><small>${esc(x.concept.scopeTitle||'')} · ${esc(x.reason||'학습')}</small></div><span>›</span></button><button class="goal-remove" data-goal-remove="${esc(x.concept.id)}" aria-label="오늘 목표에서 제거">×</button></div>`).join(''):'<div class="empty compact">오늘 목표가 비어 있습니다. 편집에서 단원을 추가하세요.</div>'}</div></section>
</div><aside class="home-side"><section class="card dashboard-schedule"><b>공식 시험 일정</b><p class="tiny muted">${sched.written?`필기시험 ${esc(sched.written)}`:'아직 공식 필기일이 확인되지 않았습니다.'}</p>${sched.schedule?.applicationStart?`<small>원서접수 ${esc(sched.schedule.applicationStart)}${sched.schedule.applicationEnd?' ~ '+esc(sched.schedule.applicationEnd):''}</small>`:''}<button class="btn block ghost" data-go="resources">공식 공고 확인</button></section><section class="card motivation-card"><b>오늘 한 줄</b><p>${esc(motivation)}</p></section></aside></div>`,'홈')
}
function outline(){const subj=state().subject,scopes=subj==='fire'?V.curriculum.fire:V.curriculum.ems;return `<div class="backdrop ${state().outline?'on':''}" data-outline-close></div><aside class="outline ${state().outline?'open':''}"><div class="outline-head"><div><b>목차</b><small>${subj==='fire'?'소방학개론':'응급처치학개론'}</small></div><span class="spacer"></span><button class="btn small ghost" data-outline-close>닫기</button></div><div class="outline-subject"><div class="seg"><button class="${subj==='fire'?'on':''}" data-subject="fire">소방학</button><button class="${subj==='ems'?'on':''}" data-subject="ems">응급처치</button></div></div><div class="outline-list">${scopes.map((sc,si)=>`<div class="scope"><button class="${sc.id===state().scopeId?'on':''}" data-scope="${sc.id}"><b>${si+1}. ${esc(sc.title)}</b></button><div class="concepts">${sc.concepts.map((t,i)=>{const id=`${sc.id}-C${String(i+1).padStart(2,'0')}`;return `<button class="${id===state().conceptId?'on':''}" data-concept="${id}">${i+1}. ${esc(t)}</button>`}).join('')}</div></div>`).join('')}</div></aside>`}
function sectionTitle(v){const raw=String(v||'개념').trim();return /개념\s*이해|개념\s*구조|읽는\s*순서|학습\s*순서|개념\s*구조와\s*읽는\s*순서/.test(raw)?'개념':raw}
function studentStudyText(v){return String(v||'').replace(/개념\s*구조와\s*읽는\s*순서/gi,'').replace(/\[\s*\]/g,'').replace(/\s{2,}/g,' ').trim()}
function studyNorm(v){return String(v||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'')}
function sameStudyText(a,b){const x=studyNorm(a),y=studyNorm(b);if(!x||!y)return false;if(x===y)return true;const min=Math.min(x.length,y.length),max=Math.max(x.length,y.length);return min>=24&&min/max>=.82&&(x.includes(y)||y.includes(x))}
function uniqueTextRows(rows=[],seed=''){const out=[];for(const row of rows){if(!row||sameStudyText(row,seed)||out.some(x=>sameStudyText(x,row)))continue;out.push(row)}return out}
function uniqueSections(rows=[]){const out=[];for(const row of rows){if(!row?.body)continue;if(out.some(x=>sameStudyText(x.body,row.body)))continue;out.push(row)}return out}
function coreEssentialRows(pack){
const quick=pack?.studySchema?.quick30||pack?.summary||'',numbers=V.StudyEmphasis119?.numberRows?.(pack,12)||[];
const candidates=[
...(V.StudyEmphasis119?.mustRows?.(pack)||[]).map((text,index)=>({text,bucket:'must',index})),
...(V.StudyEmphasis119?.featureRows?.(pack)||[]).map((text,index)=>({text,bucket:'feature',index}))
],rows=[];
for(const row of candidates){
const text=studentStudyText(row.text);
if(!text||sameStudyText(text,quick)||numbers.some(n=>sameStudyText(text,n))||rows.some(x=>sameStudyText(x.text,text)))continue;
rows.push({...row,text});if(rows.length>=5)break
}
return rows
}
function coreStudySeeds(pack){
return uniqueTextRows([
pack?.studySchema?.quick30||pack?.summary||'',
...coreEssentialRows(pack).map(x=>x.text)
]).map(studentStudyText).filter(Boolean)
}
function coreHighlightTerms(pack){const a=[...(pack?.compare||[]).map(x=>x?.[0]),...(pack?.must||[]).flatMap(x=>String(x||'').split(/\s*(?:→|:|=|·)\s*/))];return[...new Set(a.map(x=>String(x||'').replace(/^[★☆\d.\s-]+/,'').trim()).filter(x=>x.length>=2&&x.length<=24))].sort((a,b)=>b.length-a.length).slice(0,20)}
function studyHighlight(v,pack){const t=String(v||''),a=coreHighlightTerms(pack).filter(x=>t.includes(x)),n=t.match(/\d+(?:\.\d+)?(?:\s*(?:~|–|-)\s*\d+(?:\.\d+)?)?\s*(?:초|분|시간|cm|mm|m|kg|L|%|J\/kg)?/g)||[],terms=[...new Set([...a,...n].filter(Boolean))].sort((x,y)=>y.length-x.length);if(!terms.length)return esc(t);const re=new RegExp('('+terms.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','g');return t.split(re).map((x,i)=>i%2?`<u class="study-key-underline">${esc(x)}</u>`:esc(x)).join('')}
function isCoreStudyText(v,seeds=[]){
const text=studentStudyText(v),x=studyNorm(text);if(!x)return false;
return seeds.some(seed=>{const y=studyNorm(seed);if(!y)return false;if(sameStudyText(text,seed))return true;const min=Math.min(x.length,y.length),max=Math.max(x.length,y.length);return min>=28&&min/max>=.74&&(x.includes(y)||y.includes(x))})
}
function detailOnlyText(v,seeds=[]){
const text=studentStudyText(v);if(!text||isCoreStudyText(text,seeds))return'';
const sentences=text.split(/(?<=[.!?。])\s+/).map(studentStudyText).filter(Boolean);
if(sentences.length<2)return text;
return sentences.filter(x=>!isCoreStudyText(x,seeds)).join(' ').trim()
}
function detailSemanticTitle(v){const t=String(v||'');if(/종류|분류|구분|나뉜|형태/.test(t))return'종류 · 구분';if(/구성|요소|장치|기관|조직/.test(t))return'구성 · 역할';if(/목적|기능|의의|효과/.test(t))return'목적 · 기능';if(/원인|조건|요인/.test(t))return'원인 · 조건';if(/원리|작용|차단|억제|낮춘|높인|제거|공급|반응|발생|전파|흡수|냉각|질식/.test(t))return'작용 원리';if(/순서|단계|절차|시행|평가|확인|처치|대응|이송/.test(t))return'진행 · 절차';if(/수치|시간|거리|농도|온도|압력|비율|이상|이하/.test(t))return'수치 · 기준';if(/예외|금지|주의|오류|함정/.test(t))return'예외 · 주의';if(/특징|성질|증상|징후|소견|기준|위험/.test(t))return'특징 · 판단기준';return'핵심 해설'}
function detailSectionTitle(v,body=''){const raw=sectionTitle(v).replace(/핵심\s*정리/g,'상세 정리').replace(/핵심\s*포인트/g,'상세 포인트').replace(/핵심/g,'').replace(/\s{2,}/g,' ').trim();return !raw||/^(상세 설명|정의 · 상세)$/.test(raw)?detailSemanticTitle(body):raw}
function detailGroups(rows=[],seeds=[]){const g=new Map;for(const x of uniqueTextRows(rows)){const body=detailOnlyText(x,seeds);if(!body)continue;const k=detailSemanticTitle(body),a=g.get(k)||[];a.push(body);g.set(k,a)}return[...g].map(([title,bullets])=>({title,body:'',bullets}))}
function schemaDetailRows(c,pack){if(V.ConceptArchitecture119?.get?.(c.id)?.genericSchema!==true)return[];const x=pack?.studySchema||{},rows=[['발생 조건',x.conditions],['작용 원리',x.mechanisms],['시기 · 단계',x.timingStages],['전조 · 위험신호',x.warningSigns],['발생 전 · 후',x.beforeAfter]];return rows.filter(([,v])=>v?.length).map(([title,bullets])=>({title,body:'',bullets}))}
function detailDefinitionBlock(c,pack){const body=studentStudyText(pack?.studySchema?.definition||pack?.summary||'');if(!body)return'';const stem=String(c?.title||'개념').replace(/\s*(?:개론|원리|이론|기초|개요)\s*$/,'').trim()||String(c?.title||'개념'),title=stem+'의 정의';return `<section class="detail-section detail-definition" data-detail-section="definition"><div class="detail-copy"><h3>${esc(title)}</h3><p>${esc(body)}</p></div></section>`}
function detailExamPointBlock(pack){const rows=uniqueTextRows([...(pack?.traps||[])]).map(studentStudyText).filter(Boolean).slice(0,4);if(!rows.length)return'';return `<section class="detail-exam-points"><h3>시험 포인트</h3><ul>${rows.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`}
function detailHasUniqueContent(x,seeds=[]){if(!x)return false;if(detailOnlyText(x.body,seeds))return true;return(x.bullets||[]).some(v=>detailOnlyText(v,seeds))}
function detailSection(x,index=0,coreSeeds=[]){if(!x)return'';const raw=String(x.title||'').trim();if(/개념\s*이해|개념\s*구조|읽는\s*순서|학습\s*순서|개념\s*구조와\s*읽는\s*순서/.test(raw))return'';const body=detailOnlyText(x.body,coreSeeds),bullets=uniqueTextRows((x.bullets||[]).filter(Boolean),x.body).map(studentStudyText).filter(v=>v&&!isCoreStudyText(v,coreSeeds));if(!body&&!bullets.length)return'';const title=detailSectionTitle(raw,body||bullets[0]||'');return `<section class="detail-section" data-detail-section="${index}"><div class="detail-copy"><h3>${esc(title)}</h3>${body?`<p>${esc(body)}</p>`:''}${bullets.length?`<ul class="detail-key-list">${bullets.map(v=>`<li class="detail-key"><span class="study-star">★</span><span class="study-key-text">${esc(v)}</span></li>`).join('')}</ul>`:''}</div></section>`}
function detailToc(rows=[]){const meta=/개념\s*이해|개념\s*구조|읽는\s*순서|학습\s*순서|개념\s*구조와\s*읽는\s*순서/;const items=rows.map((x,i)=>{const raw=String(x?.title||'').trim(),body=x?.body||(x?.bullets||[])[0]||'';return{i,raw,title:detailSectionTitle(raw,body)}}).filter(x=>!meta.test(x.raw)&&x.title).slice(0,12);return items.length>2?`<nav class="detail-toc" aria-label="상세 목차"><label><b>상세 목차</b><select class="select detail-toc-select" data-detail-jump-select aria-label="상세 목차에서 이동"><option value="">이동할 항목 선택</option>${items.map(x=>`<option value="${x.i}">${esc(x.title)}</option>`).join('')}</select></label></nav>`:''}
function visualBlocks(pack){return (pack?.visuals||[]).map(id=>V.Visual119?.render?.(id)||'').join('')}
function hazmatBlock(c){
if(c.scopeId!=='F05'||!V.Hazmat2026)return'';
const idx=Number(c.id.split('-C')[1]),classNo=idx>=2&&idx<=7?idx-1:null;
if(idx===1){return `<section class="hazmat-reference"><div class="lesson-heading"><div><span class="eyebrow">공식 위험물 표</span><h3>제1류~제6류 한눈에 보기</h3></div></div><div class="hazmat-class-grid">${Object.entries(V.Hazmat2026.classes).map(([n,x])=>`<div class="hazmat-class-card"><b>제${n}류 · ${esc(x.nature)}</b><small>${x.items.length}개 주요 품명군</small></div>`).join('')}</div></section>`}
if(classNo){const cls=V.Hazmat2026.classes[classNo],rows=V.Hazmat2026.itemRows(classNo);return `<section class="hazmat-reference"><div class="lesson-heading"><div><span class="eyebrow">공식 품명 · 지정수량</span><h3>${esc(cls.name)} ${esc(cls.nature)}</h3></div></div><div class="table-scroll"><table class="hazmat-table"><thead><tr><th>품명</th><th>지정수량</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.name)}</td><td><b>${Number(x.designated).toLocaleString('ko-KR')} ${esc(x.unit)}</b></td></tr>`).join('')}</tbody></table></div>${(cls.notes||[]).length?`<div class="lesson-box"><b>법령상 예외·정의 포인트</b><ul>${cls.notes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</section>`}
return'';
}
function calculationBlocks(c,pack){
const rows=(pack?.calculations||[]).filter(x=>x&&x.formula);
if(!rows.length)return'';
return rows.map((x,i)=>`<section class="calc-lab" data-calculation-index="${i}"><div class="lesson-heading"><div><span class="eyebrow">계산문제</span><h3>${esc(x.title||'공식 계산')}</h3></div></div><div class="calc-formula">${esc(x.formula)}</div>${x.note?`<div class="calc-example"><b>계산 원칙</b><p>${esc(x.note)}</p>${x.example?`<p><code>${esc(x.example)}</code></p>`:''}</div>`:''}</section>`).join('');
}
function quickCoreBlock(pack){const text=pack?.studySchema?.quick30||pack?.summary||'';if(!text)return'';return `<section class="study-quick"><div class="study-quick-title">30초 핵심</div><p class="lead">${studyHighlight(text,pack)}</p></section>`}
function coreEssentialBlock(c,pack){const rows=coreEssentialRows(pack);if(!rows.length)return'';return `<section class="study-core-essentials"><div class="study-core-title">시험 직전 핵심</div><ul>${rows.map(x=>{const key=V.PassNote?.conceptKey?.(c.id,x.bucket,x.index)||'',on=key&&V.PassNote?.has?.(key);return `<li><button class="study-star-btn ${on?'on':''}" data-pass-star="${esc(key)}" aria-label="합격노트 ${on?'해제':'저장'}">${on?'★':'☆'}</button><span>${studyHighlight(x.text,pack)}</span></li>`}).join('')}</ul></section>`}
function numberBlock(c,pack){const rows=V.StudyEmphasis119?.numberRows?.(pack,12)||[];if(!rows.length)return'';return `<section class="study-numbers"><div class="study-numbers-title">★★ 숫자 · 단위 · 기준</div><ul>${rows.map((x,i)=>{const key=V.PassNote?.conceptKey?.(c.id,'number',i)||'',on=key&&V.PassNote?.has?.(key);return `<li><button class="study-star-btn ${on?'on':''}" data-pass-star="${esc(key)}" aria-label="합격노트 ${on?'해제':'저장'}">${on?'★':'☆'}</button><span class="study-key-text">${studyHighlight(x,pack)}</span></li>`}).join('')}</ul></section>`}
function trapBlock(pack){
const rows=V.StudyEmphasis119?.trapRows?.(pack)||[];if(!rows.length)return'';
return `<section class="study-traps"><div class="study-traps-title">⚠ 헷갈림 주의</div><ul>${rows.map(x=>`<li>${studyHighlight(x,pack)}</li>`).join('')}</ul></section>`;
}
function comparisonBlock(c,pack){if(!pack.compare?.length)return'';const typeLike=pack.compare.length>=2&&/원리|종류|분류|구분/.test(String(c?.title||'')+' '+String(pack.summary||'')),title=c?.id==='F04-C01'?'소화의 종류':typeLike?'종류 · 구분':pack.compareFamily?.title||'비슷한 개념 비교';return `<section class="detail-compare"><h3>${esc(title)}</h3><div class="compare-wrap"><table class="compare"><thead><tr><th>구분</th><th>내용 · 핵심 차이</th></tr></thead><tbody>${pack.compare.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table></div></section>`}
function specialCombustibleBlock(pack){
const rows=pack?.specialCombustibles||[],rules=pack?.specialCombustibleStorage||[];if(!rows.length)return'';
return `<section class="hazmat-reference special-combustible-reference"><div class="lesson-heading"><div><span class="eyebrow">2026 현행 법령</span><h3>특수가연물 품명별 기준수량</h3></div></div><div class="table-scroll"><table class="hazmat-table"><thead><tr><th>품명</th><th>기준수량</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x[0])}</td><td><b>${esc(x[1])}</b></td></tr>`).join('')}</tbody></table></div>${rules.length?`<div class="lesson-box"><b>저장·취급 상세</b><ul>${rules.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}</section>`;
}
function sourceBlock(c,pack){
const links=(pack?.officialLinks||[]).filter(x=>x?.url),evidence=V.StudyEmphasis119?.evidence?.(c.id,pack),source=evidence?.source||pack?.source||'공식 근거',hasPdf=(c?.sourceRanges||[]).some(x=>x?.doc);
const pdfActions=hasPdf?`<div class="source-primary-actions"><button class="btn primary" data-source-concept="${c.id}">PDF 바로보기</button><button class="btn" data-source-download="${c.id}">PDF 다운로드</button></div>`:'<div class="source-connect"><b>공식 웹 근거</b><p>이 개념은 연결된 공식 웹 문서와 출제범위에서 근거를 확인할 수 있습니다.</p></div>';
return `<div class="lesson source-only"><p class="lead">${esc(source)}</p>${pdfActions}${links.length?`<div class="source-law-links"><b>공식 근거</b>${links.map(x=>`<a class="source-law-link" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`:''}</div>`
}
function lessonContent(c,pack,tab){const qs=V.QuestionQuality119?.forConcept(c.id)||[],detail=pack.detail||[],sections=uniqueSections(pack.deepSections||[]);
if(tab==='detail'){const coreSeeds=coreStudySeeds(pack),rawRows=[...schemaDetailRows(c,pack),...detailGroups(detail,coreSeeds),...sections],detailRows=rawRows.filter(x=>detailHasUniqueContent(x,coreSeeds));return `<div class="lesson detail-view">${detailDefinitionBlock(c,pack)}${comparisonBlock(c,pack)}${detailToc(detailRows)}${detailRows.map((x,i)=>detailSection(x,i,coreSeeds)).join('')}${detailExamPointBlock(pack)}${visualBlocks(pack)}${hazmatBlock(c)}${specialCombustibleBlock(pack)}${calculationBlocks(c,pack)}</div>`}
if(tab==='quiz'){
if(!qs.length)return '<div class="lesson quiz-view"><div class="empty book-empty">아직 준비된 문제가 없습니다.</div></div>';
const raw=Number(runtime.studyQuizIndex[c.id]||0),idx=Math.max(0,Math.min(raw,qs.length-1));runtime.studyQuizIndex[c.id]=idx;
const answered=qs.filter(q=>state().answers[q.id]!==undefined).length;
return `<div class="lesson quiz-view"><div class="quiz-overview"><b>개념 확인 문제</b><span>${answered}/${qs.length} 답변 · 하/중/상 혼합</span></div><div class="study-quiz-single">${qcard(qs[idx],true)}</div><div class="study-quiz-pager"><button class="btn" data-study-quiz-prev ${idx===0?'disabled':''}>← 이전</button><div class="study-quiz-progress"><b>${idx+1} / ${qs.length}</b><small>${state().answers[qs[idx].id]===undefined?'미답':state().answers[qs[idx].id]===qs[idx].a?'정답':'오답'}</small></div><button class="btn primary" data-study-quiz-next ${idx>=qs.length-1?'disabled':''}>다음 →</button></div></div>`;
}
if(tab==='source')return sourceBlock(c,pack);
if(tab==='ai')return aiChatBody(c);
return `<div class="lesson core-view">${quickCoreBlock(pack)}${coreEssentialBlock(c,pack)}${numberBlock(c,pack)}${trapBlock(pack)}${c.id==='F05-C01'?hazmatBlock(c):''}</div>`;
}
function lessonBook(c,pack){const tab=STUDY_TABS.some(([k])=>k===state().studyTab)?state().studyTab:'core';return `<article class="book-mobile"><nav class="book-jumpbar">${STUDY_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" data-study-tab="${k}">${l}</button>`).join('')}</nav><section class="book-section">${lessonContent(c,pack,tab)}</section></article>`}
function conceptNeighbors(c){const list=V.curriculum.concepts.filter(x=>x.subject===c.subject),i=list.findIndex(x=>x.id===c.id);return{prev:i>0?list[i-1]:null,next:i>=0&&i<list.length-1?list[i+1]:null}}
function study(){const c=currentConcept(),sc=currentScope(),pack=V.contentPacks.get(c.id),tab=STUDY_TABS.some(([k])=>k===state().studyTab)?state().studyTab:'core',nb=conceptNeighbors(c);if(state().studyTab!==tab){state().studyTab=tab;S.save()}return shell(`<div class="study"><div class="study-toolbar"><button class="btn small" data-outline>목차</button><div class="seg"><button class="${state().subject==='fire'?'on':''}" data-subject="fire">소방학</button><button class="${state().subject==='ems'?'on':''}" data-subject="ems">응급처치</button></div><span class="path">${esc(sc.title)} › ${esc(c.title)}</span></div><div class="workspace study-workspace-single">${outline()}<div class="study-mainpane"><header class="concept-head"><span class="scope-label">${esc(sc.title)}</span><h2>${esc(c.title)}</h2><div class="tabbar">${STUDY_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" data-study-tab="${k}">${l}</button>`).join('')}</div></header><div class="study-body study-body-desktop">${lessonContent(c,pack,tab)}</div><div class="study-body study-body-mobile">${lessonBook(c,pack)}</div><footer class="actionbar concept-nav"><button class="btn" data-study-prev ${nb.prev?'':'disabled'}>← 이전</button><button class="btn ghost" data-outline>목차</button><button class="btn primary" data-study-next ${nb.next?'':'disabled'}>다음 →</button></footer></div></div></div>`,'학습')}
function qcard(q,inline=false){const ans=state().answers[q.id],done=ans!==undefined,conf=state().confidence[q.id]||'none',passKey=V.PassNote?.questionKey?.(q.id)||'',saved=passKey&&V.PassNote?.has?.(passKey);return `<div class="question-card" ${inline?'style="margin:0 0 10px"':''}>${done?`<div class="toolbar question-result-meta"><span class="tag difficulty-${esc(q.difficulty||V.QuestionDifficulty?.infer(q)||'mid')}">난이도 ${esc(q.difficultyLabel||V.QuestionDifficulty?.levels?.[V.QuestionDifficulty?.infer(q)||'mid']?.label||'중')}</span><span class="spacer"></span><button class="btn small ghost pass-question-btn ${saved?'on':''}" data-pass-question="${esc(q.id)}">${saved?'★':'☆'} 합격노트</button></div>`:`<div class="toolbar question-result-meta"><span class="spacer"></span><button class="btn small ghost pass-question-btn ${saved?'on':''}" data-pass-question="${esc(q.id)}">${saved?'★':'☆'} 합격노트</button></div>`}<h2>${esc(q.q)}</h2><div class="choices">${q.choices.map((x,i)=>`<button class="choice ${done&&ans===i?'sel':''} ${done&&i===q.a?'correct':''} ${done&&ans===i&&i!==q.a?'wrong':''}" data-answer="${q.id}:${i}">${i+1}. ${esc(x)}</button>`).join('')}</div><div class="confidence"><span class="tiny muted" style="align-self:center">확신도</span>${[['sure','확실'],['maybe','애매'],['none','모름']].map(([k,l])=>`<button class="${conf===k?'on':''}" data-confidence="${q.id}:${k}">${l}</button>`).join('')}</div>${done?`<div class="answer"><b style="color:${ans===q.a?'var(--green)':'var(--red)'}">${ans===q.a?'정답':'오답'} · ${q.a+1}번</b><p class="answer-ex">${esc(q.ex)}</p>${Array.isArray(q.choiceExplanations)?`<div class="choice-explanations">${q.choiceExplanations.map((x,i)=>`<div class="choice-explain ${i===q.a?'right':'wrong'}"><b>${i+1}번</b><span>${esc(x)}</span></div>`).join('')}</div>`:''}<div class="answer-source"><small class="muted">출처: ${esc(q.source)}</small><button class="btn small ghost" data-source-concept="${q.conceptId}">원문 근거 보기</button></div></div>`:''}</div>`}
function calcGroupFor(q){
const id=q?.conceptId||'',src=String(q?.source||'');
if(/^F05-/.test(id))return'hazmat';
if(id==='F04-C04')return'foam';
if(id==='F03-C02')return'heat';
if(id==='F03-C03')return'combustion';
if(id==='E09-C07')return'oxygen';
if(id==='E07-C03')return'iv';
if(id==='E14-C03')return'burn';
return /Parkland|화상/.test(src)?'burn':'other'
}
function calcGroupLabel(k){return({all:'전체',hazmat:'위험물',combustion:'연소·기체',heat:'열량',foam:'포',oxygen:'산소통',iv:'수액·점적',burn:'화상·Parkland',other:'기타'})[k]||k}
function calcStageLabel(k){return k==='all'?'전체 단계':Object.fromEntries(V.CalculationTraining119?.STAGES||[])[k]||k}
function bank(){
let qs=runtime.bankConcept?(V.QuestionQuality119?.forConcept(runtime.bankConcept)||[]):(V.questions||[]).filter(q=>V.QuestionQuality119?.isExamStyle(q));
if(runtime.bankFilter==='calc'){
qs=qs.filter(q=>q.type==='계산형');
if(runtime.calcGroup!=='all')qs=qs.filter(q=>(q.calcFamily||calcGroupFor(q))===runtime.calcGroup);
if(runtime.calcStage!=='all')qs=qs.filter(q=>q.calcStage===runtime.calcStage);
}
if(!qs.length)return shell('<div class="empty">선택한 계산 유형·단계에 준비된 문제가 없습니다.</div>','문제');
runtime.bankIndex=Math.max(0,Math.min(runtime.bankIndex,qs.length-1));
const q=qs[runtime.bankIndex];runtime.questionAt=Date.now();
const concept=runtime.bankConcept?V.curriculum.byId[runtime.bankConcept]:null,filterTitle=runtime.bankFilter==='calc'?'계산 훈련':'',heading=concept?.title||filterTitle;
const allCalc=(V.questions||[]).filter(x=>V.QuestionQuality119?.isExamStyle(x)&&x.type==='계산형');
const calcGroups=runtime.bankFilter==='calc'?['all','hazmat','combustion','heat','foam','oxygen','iv','burn'].map(k=>{const n=allCalc.filter(x=>(k==='all'||(x.calcFamily||calcGroupFor(x))===k)&&(runtime.calcStage==='all'||x.calcStage===runtime.calcStage)).length;return `<button class="calc-chip ${runtime.calcGroup===k?'on':''}" data-calc-group="${k}">${calcGroupLabel(k)} <b>${n}</b></button>`}).join(''):'';
const stageKeys=['all',...(V.CalculationTraining119?.STAGES||[]).map(x=>x[0])];
const calcStages=runtime.bankFilter==='calc'?stageKeys.map(k=>{const n=allCalc.filter(x=>(runtime.calcGroup==='all'||(x.calcFamily||calcGroupFor(x))===runtime.calcGroup)&&(k==='all'||x.calcStage===k)).length;return `<button class="calc-chip ${runtime.calcStage===k?'on':''}" data-calc-stage="${k}">${esc(calcStageLabel(k))} <b>${n}</b></button>`}).join(''):'';
const practiceNote=runtime.bankFilter==='calc'?'<small class="muted calc-practice-note">이해 → 기본 → 단위변환 → 역산 → 함정 → 실전 순서로 반복 연습합니다. 계산 연습용 문제이며 실전 모의고사에는 포함되지 않습니다.</small>':'';
return shell(`<div class="study"><div class="study-toolbar">${heading?`<b>${esc(heading)}</b><span class="spacer"></span><button class="btn small ghost" data-bank-all>전체 문제</button>`:''}</div>${runtime.bankFilter==='calc'?`<div class="calc-filter-wrap"><span class="calc-filter-label">계산 유형</span>${calcGroups}</div><div class="calc-filter-wrap calc-stage-wrap"><span class="calc-filter-label">단계</span>${calcStages}${practiceNote}</div>`:''}<div class="workspace single-pane" style="grid-template-rows:minmax(0,1fr) 56px"><div class="study-body">${qcard(q)}</div><footer class="actionbar" style="grid-template-columns:1fr auto 1fr"><button class="btn" data-bank-prev ${runtime.bankIndex===0?'disabled':''}>← 이전</button><span class="pill">${runtime.bankIndex+1}/${qs.length}</span><button class="btn primary" data-bank-next ${runtime.bankIndex===qs.length-1?'disabled':''}>다음 →</button></footer></div></div>`,'문제')
}
function wrong(){const ws=state().wrongs.filter(w=>!w.resolved).sort((a,b)=>(a.confidence==='sure'?-1:1)-(b.confidence==='sure'?-1:1)||a.due-b.due);if(!ws.length)return shell('<div class="empty">현재 오답이 없습니다.</div>','오답');return shell(`<div class="screen-scroll"><div class="list wrong-list">${ws.map(w=>{const q=V.questionById[w.questionId],c=V.curriculum.byId[w.conceptId];return `<div class="row wrong-row"><b>${esc(q?.q||w.questionId)}</b><small>${esc(c?.scopeTitle||'')} › ${esc(c?.title||'')}</small><div class="toolbar wrong-actions"><button class="btn small primary" data-concept="${w.conceptId}">개념 보기</button><button class="btn small" data-retry="${w.questionId}">다시 풀기</button><button class="btn small ghost danger" data-wrong-delete="${w.id}">삭제</button></div></div>`}).join('')}</div></div>`,'오답')}
function sampleDistinct(arr,n){return [...arr].sort(()=>Math.random()-.5).slice(0,n)}
function sampleByDifficulty(arr,n,level){const desired=level==='low'?{low:.65,mid:.30,high:.05}:level==='high'?{low:.10,mid:.35,high:.55}:{low:.25,mid:.55,high:.20},groups={low:[],mid:[],high:[]};for(const q of arr){const d=q.difficulty||V.QuestionDifficulty?.infer(q)||'mid';(groups[d]||groups.mid).push(q)}const out=[];for(const k of ['low','mid','high']){const want=Math.min(groups[k].length,Math.round(n*desired[k]));out.push(...sampleDistinct(groups[k],want))}const used=new Set(out.map(q=>q.id)),rest=arr.filter(q=>!used.has(q.id));return[...out,...sampleDistinct(rest,Math.max(0,n-out.length))].slice(0,n)}
function recentExamQuestionIds(limit=4){const ids=new Set();for(const h of state().examHistory.slice(-limit))for(const id of h.questionIds||[])ids.add(id);return ids}
function preferFreshPool(arr,n,scopeIds){const recent=recentExamQuestionIds(),fresh=arr.filter(q=>!recent.has(q.id)),covers=scopeIds.every(id=>fresh.some(q=>q.scopeId===id));return fresh.length>=n&&covers?fresh:arr}
function sampleAcrossScopes(arr,n,level,scopeIds){const pool=preferFreshPool(arr,n,scopeIds),out=[],count={},cap=Math.max(1,Math.ceil(n/Math.max(1,scopeIds.length))+1);for(const scope of scopeIds){const q=sampleByDifficulty(pool.filter(x=>x.scopeId===scope),1,level)[0];if(!q)return[];out.push(q);count[scope]=1}const used=new Set(out.map(q=>q.id));while(out.length<n){const eligible=pool.filter(q=>!used.has(q.id)&&(count[q.scopeId]||0)<cap),q=sampleByDifficulty(eligible,1,level)[0];if(!q)break;out.push(q);used.add(q.id);count[q.scopeId]=(count[q.scopeId]||0)+1}return sampleDistinct(out,Math.min(n,out.length))}
function buildMock(mode,level){return V.MockExam119?.build?.({mode,level,history:state().examHistory})||[]}
function trainingPool(subject='all'){const arr=(V.questions||[]).filter(q=>V.QuestionQuality119?.isExamStyle?.(q)!==false);return subject==='all'?arr:arr.filter(q=>q.subject===subject)}
function sampleTrainingSubject(subject,count,level){
const pool=trainingPool(subject),scopes=(subject==='fire'?V.curriculum.fire:V.curriculum.ems).map(x=>x.id);
return sampleAcrossScopes(pool,count,level,scopes)
}
function buildTraining(planKey,level){
const plans={
fire50:{label:'소방학 집중 50',fire:50,ems:0},
fire100:{label:'소방학 집중 100',fire:100,ems:0},
ems80:{label:'응급처치 집중 80',fire:0,ems:80},
ems120:{label:'응급처치 집중 120',fire:0,ems:120},
all100:{label:'전범위 100',fire:38,ems:62},
all150:{label:'전범위 150',fire:58,ems:92},
all200:{label:'전범위 200',fire:77,ems:123}
},p=plans[planKey];if(!p)return null;
const f=p.fire?sampleTrainingSubject('fire',p.fire,level):[],e=p.ems?sampleTrainingSubject('ems',p.ems,level):[],qs=sampleDistinct([...f,...e],p.fire+p.ems);
if(f.length!==p.fire||e.length!==p.ems||qs.length!==p.fire+p.ems)return null;
return{...p,key:planKey,qs}
}
function buildWrongTraining(target,level){
const wrongs=state().wrongs.filter(w=>!w.resolved),wrongIds=new Set(wrongs.map(w=>w.questionId)),weakConcepts=[...new Set(wrongs.map(w=>w.conceptId))];
if(!weakConcepts.length)return null;
const pool=trainingPool('all').filter(q=>weakConcepts.includes(q.conceptId)),fresh=pool.filter(q=>!wrongIds.has(q.id)),direct=pool.filter(q=>wrongIds.has(q.id));
const seed=sampleByDifficulty(fresh,Math.min(target,fresh.length),level),used=new Set(seed.map(q=>q.id)),fill=sampleByDifficulty(direct.filter(q=>!used.has(q.id)),Math.max(0,target-seed.length),level),qs=sampleDistinct([...seed,...fill],Math.min(target,pool.length));
return qs.length?{key:'wrong'+target,label:`오답 기반 재시험 ${qs.length}`,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}:null
}
function buildWeakTraining(target=50,level='mid'){
const ids=V.Mastery.todayPlan(Math.min(30,V.curriculum.concepts.length)).map(x=>x.concept.id),pool=trainingPool('all').filter(q=>ids.includes(q.conceptId));
if(!pool.length)return null;
const qs=sampleByDifficulty(pool,Math.min(target,pool.length),level);
return qs.length?{key:'weak',label:`취약개념 자동시험 ${qs.length}`,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}:null
}
function buildSkillTraining(skillKey,target=50,level='mid'){
const family=V.QuestionType119?.families?.[skillKey];
if(!family)return null;
const pool=trainingPool('all').filter(q=>V.QuestionType119?.classify?.(q)?.key===skillKey);
if(!pool.length)return null;
const qs=sampleByDifficulty(pool,Math.min(target,pool.length),level);
return qs.length?{key:'skill:'+skillKey,label:`${family.label} 집중훈련 ${qs.length}`,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}:null
}
function startTraining(planKey){
let plan=/^wrong(20|50|100)$/.test(planKey)?buildWrongTraining(Number(RegExp.$1),runtime.examDifficulty):planKey==='weak'?buildWeakTraining(50,runtime.examDifficulty):planKey.startsWith('skill:')?buildSkillTraining(planKey.slice(6),50,runtime.examDifficulty):buildTraining(planKey,runtime.examDifficulty);
if(!plan?.qs?.length)return toast(planKey.startsWith('wrong')?'누적 오답이 아직 충분하지 않습니다.':'훈련 문제를 구성할 수 없습니다.');
runtime.exam={id:crypto.randomUUID?crypto.randomUUID():'exam-'+Date.now(),mode:'training',trainingKey:plan.key,title:plan.label,difficulty:runtime.examDifficulty,qs:plan.qs,i:0,startedAt:Date.now(),answers:{},confidence:{},blueprint:{fire:plan.fire,ems:plan.ems,minutes:null,freshWindow:4,training:true,label:plan.label}};
persistActiveExam();render()
}
function exam(){const ready=V.examReadiness();if(runtime.exam)return examRun();const wrongN=state().wrongs.filter(w=>!w.resolved).length;return shell(`<div class="exam-landing screen-scroll"><section class="exam-start card"><h2>실전 모의고사</h2><div class="exam-spec"><b>65문항 · 65분</b><span>소방학개론 25문항</span><span>응급처치학개론 40문항</span></div><div class="difficulty-picker"><b>난이도</b><div class="seg">${[['low','하'],['mid','중'],['high','상']].map(([k,l])=>`<button class="${runtime.examDifficulty===k?'on':''}" data-exam-difficulty="${k}">${l}</button>`).join('')}</div></div>${ready.ready?'<button class="btn primary block" data-exam-start="real">실전 모의고사 시작</button>':'<p class="muted exam-wait">실전 문제은행을 준비 중입니다. 지금은 연습 모의고사를 이용할 수 있습니다.</p>'}<button class="btn block" data-exam-start="practice" style="margin-top:8px">연습 모의고사 시작</button></section><section class="card training-center"><div><span class="eyebrow">대용량 반복훈련</span><h2>집중 문제훈련</h2><p class="muted">실전 65문제 형식과 분리된 연습 전용입니다. 풀이 후 오답·취약단원 분석은 동일하게 제공합니다.</p></div><div class="training-group"><b>과목 집중</b><div class="training-grid"><button class="btn" data-training-start="fire50">소방 50</button><button class="btn" data-training-start="fire100">소방 100</button><button class="btn" data-training-start="ems80">구급 80</button><button class="btn" data-training-start="ems120">구급 120</button></div></div><div class="training-group"><b>전범위 대용량</b><div class="training-grid three"><button class="btn" data-training-start="all100">100문제</button><button class="btn" data-training-start="all150">150문제</button><button class="btn" data-training-start="all200">200문제</button></div></div><div class="training-group"><b>약점 집중</b><small class="muted">현재 미해결 오답 ${wrongN}개</small><div class="training-grid three"><button class="btn" data-training-start="wrong20">오답 기반 20</button><button class="btn" data-training-start="wrong50">오답 기반 50</button><button class="btn" data-training-start="wrong100">오답 기반 100</button></div><button class="btn primary block" data-training-start="weak">취약개념 자동시험</button></div><button class="btn ghost block" data-calc-bank>계산 문제 훈련</button></section></div>`,'시험')}
function startExam(mode){const ready=V.examReadiness();if(mode==='real'&&!ready.ready)return toast('실전 문제은행을 준비 중입니다.');const qs=buildMock(mode,runtime.examDifficulty);if(qs.length!==65)return toast('65문항을 구성할 수 없습니다. 문제은행을 확인해주세요.');runtime.exam={id:crypto.randomUUID?crypto.randomUUID():'exam-'+Date.now(),mode,difficulty:runtime.examDifficulty,qs,i:0,startedAt:Date.now(),answers:{},confidence:{},blueprint:{fire:25,ems:40,minutes:65,freshWindow:4}};persistActiveExam();render();startExamTicker()}
function examRun(){const e=runtime.exam,q=e.qs[e.i],real=e.mode==='real',training=e.mode==='training',total=e.qs.length,left=real?Math.max(0,3900-Math.floor((Date.now()-e.startedAt)/1000)):null,answered=Object.keys(e.answers).length,remaining=Math.max(0,total-answered),label=real?'실전 모의고사':training?(e.title||'집중훈련'):'연습 모의고사',pct=Math.round(answered/Math.max(1,total)*100);if(real&&left===0)setTimeout(()=>finishExam(true),0);const navigator=e.qs.map((item,i)=>`<button class="${i===e.i?'current':''} ${e.answers[item.id]!==undefined?'answered':''}" data-exam-jump="${i}" aria-label="${i+1}번 문제">${i+1}</button>`).join('');return shell(`<div class="workspace single-pane exam-run-workspace"><header class="concept-head exam-head-clean"><span class="scope-label">${esc(label)} · 문제 ${e.i+1}/${total}</span><h2 ${real?'data-exam-timer':''}>${real?`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`:training?`${answered}/${total} 답변`:'문제를 풀어보세요'}</h2><button class="btn small ghost" data-exam-abandon>시험 중단</button></header><div class="study-body exam-body"><div class="exam-layout"><main class="exam-question-pane"><div class="question-card exam-question-card"><div class="tiny muted exam-subject">${V.subjectLabel(q.subject)}</div><h2>${esc(q.q)}</h2><div class="choices">${q.choices.map((x,i)=>`<button class="choice ${e.answers[q.id]===i?'sel':''}" data-exam-answer="${i}">${i+1}. ${esc(x)}</button>`).join('')}</div><div class="confidence"><span class="tiny muted">확신도</span>${[['sure','확실'],['maybe','애매'],['none','모름']].map(([k,l])=>`<button class="${(e.confidence?.[q.id]||'none')===k?'on':''}" data-exam-confidence="${k}">${l}</button>`).join('')}</div></div></main><aside class="exam-side"><div class="exam-side-head"><span>진행 상황</span><b>${pct}%</b></div><div class="progressbar"><i style="width:${pct}%"></i></div><div class="exam-side-stats"><div><span>답변</span><b>${answered}</b></div><div><span>남음</span><b>${remaining}</b></div><div><span>현재</span><b>${e.i+1}</b></div></div><div class="exam-side-subject"><span>현재 과목</span><b>${esc(V.subjectLabel(q.subject))}</b></div><div class="exam-navigator" aria-label="문제 바로가기">${navigator}</div></aside></div></div><footer class="actionbar exam-footer"><button class="btn" data-exam-prev ${e.i===0?'disabled':''}>← 이전</button><span class="exam-answer-count"><b>${answered}/${total}</b><small>답변 완료</small></span><button class="btn primary" data-exam-next>${e.i===total-1?'시험 종료':'다음 →'}</button></footer></div>`,'시험')}
function finishExam(auto=false){
const e=runtime.exam;if(!e)return;
const total=e.qs.length,answered=Object.keys(e.answers).length,unanswered=total-answered,confidenceSnapshot={...(e.confidence||{})};
if(!auto&&unanswered&&!confirm(`미응답 ${unanswered}문제입니다. 시험을 종료할까요?`))return;
let fireCorrect=0,emsCorrect=0;
for(const q of e.qs){
const a=e.answers[q.id];
if(a!==undefined)V.Mastery.recordAnswer?.(q,a,confidenceSnapshot[q.id]||'none',null);
if(a===q.a){if(q.subject==='fire')fireCorrect++;else emsCorrect++}
}
const correct=fireCorrect+emsCorrect,elapsedSec=Math.max(0,Math.floor((Date.now()-e.startedAt)/1000)),answerSnapshot={...e.answers};
const incorrectQuestionIds=e.qs.filter(q=>answerSnapshot[q.id]!==undefined&&answerSnapshot[q.id]!==q.a).map(q=>q.id);
const unansweredQuestionIds=e.qs.filter(q=>answerSnapshot[q.id]===undefined).map(q=>q.id);
const rec={
id:e.id,mode:e.mode,difficulty:e.difficulty,at:Date.now(),score:Math.round(correct/total*100),correct,total,totalAnswered:answered,unanswered,elapsedSec,
fireCorrect,emsCorrect,questionIds:e.qs.map(q=>q.id),answers:answerSnapshot,confidence:confidenceSnapshot,incorrectQuestionIds,unansweredQuestionIds,
blueprint:e.blueprint||null,detailVersion:1
};
state().examHistory.push(rec);S.save();stopExamTicker();clearActiveExam();runtime.exam=null;runtime.examReportId=rec.id;
toast(`${correct}/${total} · ${rec.score}점`);go('stats')
}
function notePreviewHtml(n){
const raw=String(n?.body||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).slice(0,14),star=String(n?.sourceType||'').startsWith('pass-star'),question=String(n?.sourceType||'')==='pass-question';
let section='';
return raw.map((line,i)=>{
const heading=/^\[(핵심|숫자·단위·기준|비교·구분|주의·예외|원문 확인 필요|공식근거)\]$/.test(line);
if(heading){section=line;return `<b class="note-section-head">${esc(line.replace(/^\[|\]$/g,''))}</b>`}
const important=star&&i===0||question&&/^정답:/.test(line)||/^•/.test(line)&&/핵심|숫자|주의/.test(section);
const cls=important?'note-important':'';
return `<span class="note-preview-line ${cls}">${esc(line)}</span>`
}).join('')
}
function sourceBackedNote(n){return ['pass-star','pass-question'].includes(String(n?.sourceType||''))}
function splitSourceNote(n){
const body=String(n?.body||''),marker='\n\n[내 메모]\n',i=body.indexOf(marker);
return i>=0?{official:body.slice(0,i),memo:body.slice(i+marker.length)}:{official:body,memo:''}
}
function noteKind(n){
const t=String(n?.sourceType||'manual');
if(t.startsWith('pass-star'))return'star';
if(t==='pass-question')return'question';
if(t.startsWith('pass-doc'))return'doc';
return'manual'
}
function noteSourceLabel(n){return({star:'핵심에서 저장',question:'문제에서 저장',doc:'이전 자료 노트',manual:'직접 작성'})[noteKind(n)]||'합격노트'}
function filteredNotes(){
const all=(state().notes||[]).slice(),q=String(runtime.noteQuery||'').trim().toLowerCase(),order=new Map((V.curriculum?.concepts||[]).map((x,i)=>[x.id,i]));
return all.filter(n=>{
const kind=noteKind(n),filter=runtime.noteFilter;
const filterOk=filter==='all'||filter==='fire'&&n.subject==='fire'||filter==='ems'&&n.subject==='ems'||filter===kind;
const queryOk=!q||String(n.title||'').toLowerCase().includes(q)||String(n.body||'').toLowerCase().includes(q);
return filterOk&&queryOk
}).sort((a,b)=>{
const sa=a.subject==='fire'?0:a.subject==='ems'?1:2,sb=b.subject==='fire'?0:b.subject==='ems'?1:2;if(sa!==sb)return sa-sb;
const ca=order.get(a.conceptId)??9999,cb=order.get(b.conceptId)??9999;if(ca!==cb)return ca-cb;
const ka={star:0,question:1,doc:2,manual:3}[noteKind(a)]??4,kb={star:0,question:1,doc:2,manual:3}[noteKind(b)]??4;if(ka!==kb)return ka-kb;
return Number(b.updatedAt||b.createdAt||0)-Number(a.updatedAt||a.createdAt||0)
})
}
function noteFilterChips(){
const all=state().notes||[],defs=[['all','전체'],['fire','소방'],['ems','구급'],['star','★핵심'],['question','문제'],['manual','직접메모']];
return defs.map(([k,label])=>{const n=k==='all'?all.length:k==='fire'?all.filter(x=>x.subject==='fire').length:k==='ems'?all.filter(x=>x.subject==='ems').length:all.filter(x=>noteKind(x)===k).length;return `<button class="note-filter-chip ${runtime.noteFilter===k?'on':''}" data-note-filter="${k}">${label} <b>${n}</b></button>`}).join('')
}
function noteRowsHtml(){
const rows=filteredNotes();if(!rows.length)return'<div class="empty" style="height:90px">조건에 맞는 합격노트가 없습니다.</div>';
return rows.map(n=>{const parts=splitSourceNote(n);return runtime.noteEditId===n.id?`<div class="row note-edit-row"><input id="noteEditTitle" class="input" value="${esc(n.title||'')}">${sourceBackedNote(n)?`<div class="note-official-lock"><b>공식/문제 원문 · 잠금</b><p>${esc(parts.official)}</p></div><label class="note-user-memo-label">내 메모<textarea id="noteEditMemo" class="textarea" placeholder="내 암기법·추가 메모">${esc(parts.memo)}</textarea></label>`:`<textarea id="noteEditBody" class="textarea">${esc(n.body||'')}</textarea>`}<div class="toolbar"><button class="btn small primary" data-note-save="${esc(n.id)}">수정 저장</button><button class="btn small ghost" data-note-cancel>취소</button></div></div>`:`<div class="row note-row"><div><b>${esc(n.title||'내 합격노트')}</b><div class="note-preview">${notePreviewHtml(n)}</div><span class="tiny muted">${esc(noteSourceLabel(n))}</span></div><div class="toolbar"><button class="btn small" data-note-edit="${esc(n.id)}">수정</button><button class="btn small ghost danger" data-note-delete="${esc(n.id)}">삭제</button></div></div>`}).join('');
}
function notes(){const starCount=V.PassNote?.passNotes?.().length||0;return shell(`<div class="notes-page screen-scroll">
<section class="card pass-note-hero"><span class="eyebrow">나만의 최종 수험서</span><h2>합격노트</h2><p class="muted">핵심·숫자·문제의 ★와 직접 메모를 한곳에 모아 복습하고, 시험 직전용 PDF로 정리할 수 있습니다.</p><div class="pass-note-metrics"><span>★ 저장 ${starCount}</span><span>전체 노트 ${state().notes.length}</span></div><div class="pass-export-grid"><button class="btn primary" data-pass-export="fire">소방학 핵심 PDF</button><button class="btn primary" data-pass-export="ems">구급 핵심 PDF</button><button class="btn" data-pass-export="pass">내 합격노트 PDF</button><button class="btn" data-pass-export="rapid">시험직전 초압축 PDF</button></div><small class="muted">버튼을 누르면 인쇄 화면이 열립니다. 휴대폰에서 ‘PDF로 저장’을 선택하면 됩니다.</small></section>
<section class="card"><b>직접 메모 추가</b><input id="noteTitle" class="input" placeholder="노트 제목" style="margin-top:10px"><textarea id="noteBody" class="textarea" placeholder="내 암기법·추가 설명·시험 직전 메모" style="margin-top:8px"></textarea><button class="btn primary" data-save-note style="margin-top:8px">합격노트에 저장</button></section>
<section class="card"><div class="toolbar"><b>저장된 합격노트</b><span class="spacer"></span><span class="tiny muted">${filteredNotes().length}/${state().notes.length}개</span></div><div class="note-search"><input id="noteSearch" class="input" value="${esc(runtime.noteQuery||'')}" placeholder="합격노트 검색"><button class="btn small" data-note-search>검색</button><button class="btn small ghost" data-note-search-clear>지우기</button></div><div class="note-filter-wrap">${noteFilterChips()}</div><div class="list note-list" style="margin-top:8px">${noteRowsHtml()}</div></section>
</div>`,'합격노트')}
let aiLoading=false;async function loadAI(){if(runtime.aiEngine||V.LocalAI?.ready||aiLoading)return;aiLoading=true;runtime.aiStatus='AI 준비 중';render();try{if(!V.LocalAI?.ensure)throw Error('LOCAL_AI_NOT_LOADED');runtime.aiEngine=await V.LocalAI.ensure({onProgress:t=>{runtime.aiStatus=t;const el=document.querySelector('.tutor-context .muted');if(el)el.textContent=t}});runtime.aiStatus='로컬 AI 준비됨'}catch(e){runtime.aiStatus=navigator.gpu?'AI 준비 실패':'이 기기는 로컬 AI 미지원'}finally{aiLoading=false;render()}}
function cleanTutorText(v){
return String(v||'')
.replace(/^#{1,6}\s+/gm,'')
.replace(/\*\*([^*]+)\*\*/g,'$1')
.replace(/__([^_]+)__/g,'$1')
.replace(/^\s*[-*]\s+/gm,'• ')
.trim()
}
function tutorTableCells(x){return String(x||'').trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim())}
function tutorTableDivider(x){const a=tutorTableCells(x);return a.length>1&&a.every(x=>/^:?-{3,}:?$/.test(x))}
function tutorPipeRow(x){const a=tutorTableCells(x);return String(x||'').includes('|')&&a.length>=2&&a.length<=6&&a.some(Boolean)}
function tutorRichAnswer(v){const l=cleanTutorText(v).split('\n'),o=[];let p=[];const flush=()=>{if(p.some(x=>x.trim()))o.push(`<p class="tutor-answer-text">${p.map(esc).join('<br>')}</p>`);p=[]};for(let i=0;i<l.length;i++){if(tutorPipeRow(l[i])&&tutorPipeRow(l[i+1]||'')){flush();const h=tutorTableCells(l[i]),divider=tutorTableDivider(l[i+1]||''),r=[];for(i+=divider?2:1;i<l.length&&tutorPipeRow(l[i]);i++){if(tutorTableDivider(l[i]))continue;const x=tutorTableCells(l[i]);while(x.length<h.length)x.push('');if(x.length>h.length)x.splice(h.length-1,x.length-h.length+1,x.slice(h.length-1).join(' · '));r.push(x.slice(0,h.length))}i--;if(h.length>1&&r.length){o.push(`<div class="tutor-ai-table-wrap" role="region" aria-label="AI 답변 표" tabindex="0"><table class="tutor-ai-table"><thead><tr>${h.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${r.map(x=>`<tr>${x.map((v,k)=>`<td>${k?esc(v):'<b>'+esc(v)+'</b>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);continue}}p.push(l[i])}flush();return o.join('')}
function tutorMessageHtml(m){const t=cleanTutorText(m?.text||''),r=Array.isArray(m?.compareRows)?m.compareRows.filter(x=>Array.isArray(x)&&x.length>1):[],c=r.length?`<div class="tutor-compare-wrap"><table class="tutor-compare-table"><thead><tr><th>구분</th><th>핵심 차이</th></tr></thead><tbody>${r.map(x=>`<tr><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td></tr>`).join('')}</tbody></table></div>`:'';return`<div class="row tutor-message ${m.role==='user'?'me':'assistant'}"><b>${m.role==='user'?'나':'119'}</b>${c}${m.role==='assistant'?tutorRichAnswer(t):`<p class="tutor-answer-text">${esc(t)}</p>`}</div>`}
function wantsTutorDetail(prompt){return /상세|자세히|깊게|전부|원리부터|교재처럼/.test(String(prompt||''))}
function wantsTutorCompare(prompt){return /비교|차이|뭐가\s*달|vs|구분/.test(String(prompt||'').toLowerCase())}
function wantsTutorEvidence(prompt){return /근거만|출처만|원문만|공식\s*근거만|근거\s*위주/.test(String(prompt||''))}
function fallbackTutor(prompt,c,pack){
const detail=wantsTutorDetail(prompt),compare=wantsTutorCompare(prompt),evidenceOnly=wantsTutorEvidence(prompt),rows=[];
if(evidenceOnly)rows.push('근거','• '+(pack.source||'공식 학습팩'),...(pack.must||[]).slice(0,4).map(x=>'• '+x));
else{
rows.push('답변',pack.summary||((pack.must||[])[0])||c.title);
const why=uniqueTextRows([...(pack.detail||[]),...(pack.deepSections||[]).map(x=>x?.body).filter(Boolean)]).slice(0,detail?6:3);
if(why.length)rows.push('','왜 그런가',...why.map(x=>'• '+x));
if(compare&&(pack.compare||[]).length)rows.push('','비교 판단',...(pack.compare||[]).slice(0,4).map(x=>'• '+x.join(' → ')));
if((pack.traps||[]).length)rows.push('','시험 적용',...(pack.traps||[]).slice(0,detail?3:2).map(x=>'• '+x));
rows.push('','근거','• '+(pack.source||'현재 개념의 공식 학습팩'));
}
return cleanTutorText(rows.join('\n'))
}
function tutorConceptFor(prompt){
const q=studyNorm(prompt),current=currentConcept();if(!q)return current;
const generic=new Set(['개념','유형','정의','기본','개요','평가','처치','원리','방법','사용법','체계','상황','핵심','요약','시험','설명','비교','구분','상세','정리','특징','종류']);
let best=current,bestScore=0;
for(const concept of V.curriculum?.concepts||[]){
const raw=String(concept.title||''),full=studyNorm(raw),parts=raw.split(/[·,/()\s-]+/).map(x=>studyNorm(x)).filter(x=>x.length>=2&&!generic.has(x));
let score=full&&q.includes(full)?full.length*10+80:0;
for(const term of new Set(parts))if(q.includes(term))score+=term.length*10;
if(score>bestScore){bestScore=score;best=concept}
}
return bestScore>=20?best:current
}
function tutorTargetAllowed(prompt,current,pack){
const detected=tutorConceptFor(prompt);
if(!detected||detected.id===current.id)return{allowed:true,detected:current};
const allowedTerms=(V.ConceptArchitecture119?.termsFor?.(current.id)||[]).map(studyNorm);
const detectedTerms=[detected.title,...String(detected.title||'').split(/[·,/()\s-]+/)].map(studyNorm).filter(x=>x.length>=2);
const curated=detectedTerms.some(t=>allowedTerms.includes(t));
return{allowed:curated,detected}
}
function aiChatBody(c){
const chat=state().chat.filter(m=>m.conceptId===c.id).slice(-12);
const arch=V.ConceptArchitecture119?.get?.(c.id);
return `<div class="study-ai"><div class="study-ai-head"><div><span class="eyebrow">현재 개념 전용 AI</span><b>${esc(c.title)} 범위에서만 답합니다.</b><small class="tiny muted">${esc(arch?.label||'개념 학습')}</small></div><span class="tiny muted">${esc(runtime.aiStatus)}</span></div><div class="study-ai-chat">${chat.length?chat.map(tutorMessageHtml).join(''):`<div class="tutor-empty compact"><p><b>${esc(c.title)}</b>만 질문해 주세요. “상세하게”라고 하면 교재형으로 설명합니다.</p><div class="tutor-quick"><button data-tutor-prompt="30초 핵심 요약해줘">30초 요약</button><button data-tutor-prompt="헷갈리는 것만 비교해줘">헷갈리는 비교</button></div></div>`}</div><div class="tutor-compose"><input data-tutor-input class="input" placeholder="${esc(c.title)}에 대해 질문하세요"><button class="btn primary" data-tutor-send>보내기</button></div>${!(runtime.aiEngine||V.LocalAI?.ready)?'<button class="btn small ghost ai-load-inline" data-ai-load>로컬 AI 사용</button>':''}</div>`
}
function visibleTutorInput(){const all=[...document.querySelectorAll('[data-tutor-input]')];return all.find(x=>x.offsetParent!==null)||all[0]||null}
async function sendTutor(){
const input=visibleTutorInput(),prompt=input?.value.trim();if(!prompt)return;
const current=currentConcept(),pack=V.contentPacks.get(current.id),target=tutorTargetAllowed(prompt,current,pack);
const mkid=p=>crypto.randomUUID?crypto.randomUUID():p+Date.now()+Math.random().toString(36).slice(2);
const userMsg={id:mkid('chat-u-'),role:'user',text:prompt,at:Date.now(),conceptId:current.id};
const assistant={id:mkid('chat-a-'),role:'assistant',text:'생각 중…',at:Date.now(),conceptId:current.id};
state().chat.push(userMsg,assistant);runtime.tutorForceLatest=true;S.save();render();
if(!target.allowed){
const out=`현재 학습 항목은 「${current.title}」입니다.\n이 AI는 현재 항목과 직접 등록된 비교 내용만 설명합니다.\n「${target.detected?.title||'다른 개념'}」은 해당 개념 페이지로 이동해서 질문해 주세요.`;
state().chat[state().chat.length-1]={...assistant,text:out,outOfScope:true,suggestedConceptId:target.detected?.id||''};S.save();render();return
}
const detailed=wantsTutorDetail(prompt),compare=wantsTutorCompare(prompt),evidenceOnly=wantsTutorEvidence(prompt),compareRows=compare?(pack.compare||[]).slice(0,6):[];
let out=fallbackTutor(prompt,current,pack),idx=state().chat.findIndex(x=>x.id===assistant.id);
if(idx>=0)state().chat[idx]={...assistant,text:out,targetConceptId:current.id,compareRows};S.save();render();
if(!(runtime.aiEngine||V.LocalAI?.ready)&&navigator.gpu&&V.LocalAI?.ensure){
try{runtime.aiStatus='AI가 답변을 구성하는 중';runtime.aiEngine=await V.LocalAI.ensure({onProgress:t=>{runtime.aiStatus=t}})}catch{runtime.aiStatus='근거 기반 기본 답변'}
}
if(runtime.aiEngine||V.LocalAI?.ready){
try{
const enhanced=await V.LocalAI.chat([
{role:'system',content:'119 학습도우미다. 근거를 그대로 나열하는 검색기가 아니라 질문에 먼저 답하고 이유→시험 적용→근거 순으로 설명한다. 근거만 요청하면 근거만 정리한다. 학습팩·비교범위 밖 사실·숫자·법규·의학 기준은 만들지 않는다. 표는 모든 행의 열 수가 같은 Markdown 표로 작성한다.'},
{role:'user',content:`[현재 개념]\n${current.id} ${current.title}\n[유형]\n${V.ConceptArchitecture119?.get?.(current.id)?.label||''}\n[요약]\n${pack.summary||''}\n[상세]\n${(pack.detail||[]).join('\n')}\n[시험필수]\n${(pack.must||[]).join('\n')}\n[비교]\n${(pack.compare||[]).map(x=>x.join(': ')).join('\n')}\n[함정]\n${(pack.traps||[]).join('\n')}\n[질문]\n${prompt}\n\n${compare?'비교표는 별도 표시된다. 차이 이유와 시험 구분 기준만 설명하라.':''}${evidenceOnly?'근거만 요청했다. 판단 확장 없이 근거·출처만 정리하라.':detailed?'결론→원리·이유→시험 적용→근거 순으로 교재형 설명하라.':'직접 답변→이유→시험 적용→근거 순으로 짧게 설명하라.'}`}
],{temperature:.1,max_tokens:detailed?950:520});
if(enhanced){
out=cleanTutorText(enhanced);runtime.aiEngine=V.LocalAI.engine||runtime.aiEngine;
idx=state().chat.findIndex(x=>x.id===assistant.id);
if(idx>=0){state().chat[idx]={...state().chat[idx],text:out,enhanced:true};S.save();if(currentConcept()?.id===current.id&&state().studyTab==='ai')render()}
}
}catch{}
}
}

function examReportView(rec){
const ids=rec.questionIds||[],answers=rec.answers||{},items=ids.map(id=>{const q=V.questionById[id];return q?{q,selected:answers[id]}:null}).filter(Boolean);
const missed=items.filter(x=>x.selected===undefined||x.selected!==x.q.a),scopeCounts=new Map(),familyCounts=new Map(),difficultyCounts=new Map();
for(const x of items){
const fam=V.QuestionType119?.classify?.(x.q)||{key:'recall',label:'기억·개념'};
const row=familyCounts.get(fam.key)||{key:fam.key,label:fam.label,total:0,correct:0,missed:0};
row.total++;if(x.selected===x.q.a)row.correct++;else row.missed++;familyCounts.set(fam.key,row);
const d=x.q.difficulty||V.QuestionDifficulty?.infer?.(x.q)||'mid',dr=difficultyCounts.get(d)||{key:d,total:0,correct:0};dr.total++;if(x.selected===x.q.a)dr.correct++;difficultyCounts.set(d,dr)
}
for(const x of missed){
const sc=V.curriculum.scopeById?.[x.q.scopeId],key=sc?.id||x.q.scopeId||'기타';
const prev=scopeCounts.get(key)||{scopeId:key,title:sc?.title||x.q.scopeId||'기타',count:0,conceptId:V.curriculum.concepts.find(c=>c.scopeId===key)?.id||x.q.conceptId||''};
prev.count++;scopeCounts.set(key,prev)
}
const weak=[...scopeCounts.values()].sort((a,b)=>b.count-a.count).slice(0,5);
const skills=[...familyCounts.values()].sort((a,b)=>(a.correct/Math.max(1,a.total))-(b.correct/Math.max(1,b.total))||b.total-a.total),diffs=[...difficultyCounts.values()],sureWrong=missed.filter(x=>x.selected!==undefined&&rec.confidence?.[x.q.id]==='sure').length;
const total=rec.total||ids.length||65,fireTotal=Number(rec.blueprint?.fire??25),emsTotal=Number(rec.blueprint?.ems??40),modeLabel=rec.mode==='real'?'실전':rec.mode==='training'?(rec.blueprint?.label||'집중훈련'):'연습';
const row=x=>{const q=x.q,mine=x.selected===undefined?'미응답':`${Number(x.selected)+1}. ${q.choices?.[x.selected]??''}`,right=`${q.a+1}. ${q.choices?.[q.a]??''}`,mineWhy=x.selected===undefined?'':q.choiceExplanations?.[x.selected]||'',rightWhy=q.choiceExplanations?.[q.a]||q.ex||'',concept=V.curriculum.byId[q.conceptId],sure=rec.confidence?.[q.id]==='sure';
return `<article class="exam-miss"><div class="exam-miss-head"><span>${esc(V.subjectLabel(q.subject))}</span><span>${esc(concept?.scopeTitle||'')}${sure?' · 확신오답':''}</span></div><h3>${esc(q.q)}</h3><div class="exam-answer-line wrong-answer"><b>내 답</b><span>${esc(mine)}</span></div><div class="exam-answer-line right-answer"><b>정답</b><span>${esc(right)}</span></div>${mineWhy?`<p class="exam-why"><b>왜 틀렸나</b> ${esc(mineWhy)}</p>`:''}<p class="exam-why"><b>정답 근거</b> ${esc(rightWhy)}</p><div class="toolbar"><button class="btn small primary" data-concept="${esc(q.conceptId)}">개념 복습</button><button class="btn small" data-retry="${esc(q.id)}">다시 풀기</button><button class="btn small ghost" data-source-concept="${esc(q.conceptId)}">원문 근거</button></div></article>`;
};
return `<div class="exam-report screen-scroll"><div class="toolbar exam-report-top"><button class="btn small ghost" data-report-close>← 최근 시험</button><span class="spacer"></span><span class="tag">${esc(modeLabel)}</span></div><section class="card exam-report-summary"><h2>${rec.score}점</h2><div class="exam-report-grid"><div><span>전체</span><b>${rec.correct}/${total}</b></div><div><span>소방학</span><b>${rec.fireCorrect}/${fireTotal}</b></div><div><span>응급처치</span><b>${rec.emsCorrect}/${emsTotal}</b></div><div><span>시간</span><b>${Math.floor((rec.elapsedSec||0)/60)}분 ${(rec.elapsedSec||0)%60}초</b></div></div><p class="tiny muted">미응답 ${rec.unanswered||0} · 오답 ${rec.incorrectQuestionIds?.length??missed.filter(x=>x.selected!==undefined).length} · 확신오답 ${sureWrong}</p></section>${diffs.length?`<section class="card"><b>난이도 분석</b><div class="weak-list">${diffs.map(x=>`<span class="weak-chip">${({low:'하',mid:'중',high:'상'})[x.key]||x.key} · ${x.correct}/${x.total}</span>`).join('')}</div></section>`:''}${weak.length?`<section class="card"><div class="toolbar"><b>취약 단원</b><span class="spacer"></span><small class="tiny muted">눌러서 바로 복습</small></div><div class="weak-list">${weak.map(x=>`<button class="weak-chip skill-train-chip weak-review-chip" data-concept="${esc(x.conceptId)}" data-weak-review="${esc(x.scopeId)}">${esc(x.title)} · 오답 ${x.count} · 복습</button>`).join('')}</div></section>`:''}${skills.length?`<section class="card"><b>문제 유형 분석</b><div class="weak-list">${skills.map(x=>`<button class="weak-chip skill-train-chip" data-skill-train="${esc(x.key)}">${esc(x.label)} · ${x.correct}/${x.total} · 훈련</button>`).join('')}</div><p class="tiny muted">학습을 돕기 위한 문제유형 분류입니다. 실제 시험의 출제비율과는 다를 수 있습니다.</p></section>`:''}<section class="card exam-missed-section"><div class="toolbar"><b>오답·미응답 분석</b><span class="spacer"></span><span class="tiny muted">${missed.length}문항</span></div><div class="exam-miss-list">${missed.length?missed.map(row).join(''):'<div class="empty" style="height:120px">전 문항 정답입니다.</div>'}</div></section></div>`;
}
function stats(){
const report=runtime.examReportId&&state().examHistory.find(x=>x.id===runtime.examReportId);
if(report)return shell(examReportView(report),'시험 분석');
const r=V.Mastery.readiness(),history=state().examHistory.slice(-8).reverse(),wrong=state().wrongs.filter(x=>!x.resolved).length;
return shell(`<div class="home-grid stats-page"><div class="home-main"><div class="metric-grid"><div class="metric"><span>학습 진도</span><b>${r.scopeCoverage}%</b></div><div class="metric"><span>기억 유지</span><b>${r.retention}%</b></div><div class="metric"><span>오답</span><b>${wrong}</b></div><div class="metric"><span>복습 예정</span><b>${r.overdue}</b></div></div><section class="card"><b>최근 시험</b><div class="list" style="margin-top:8px">${history.map(x=>`<div class="row exam-history-row"><div><b>${x.score}점</b><small>${esc(x.mode==='real'?'실전':x.mode==='training'?(x.blueprint?.label||'집중훈련'):'연습')} · 소방 ${x.fireCorrect||0}/${Number(x.blueprint?.fire??25)} · 응급 ${x.emsCorrect||0}/${Number(x.blueprint?.ems??40)}${x.elapsedSec!=null?` · ${Math.floor(x.elapsedSec/60)}분 ${x.elapsedSec%60}초`:''}</small></div>${x.questionIds?.length&&x.answers?`<button class="btn small" data-exam-report="${esc(x.id)}">분석 보기</button>`:''}</div>`).join('')||'<div class="empty" style="height:100px">아직 시험 기록이 없습니다.</div>'}</div></section></div></div>`,'통계')
}
function resources(){
const rows=Object.values(V.SourceCatalog119?.catalog||{}),ver=V.ExamVersion119?.summary?.(),changes=V.ExamVersion119?.meaningfulChanges?.()||[];
const versionCard=ver?`<section class="card exam-version-card"><div class="toolbar"><b>시험 기준</b><span class="spacer"></span><span class="tag">목표 ${esc(ver.targetExamYear)}년</span></div><p class="muted">현재 학습 콘텐츠와 공식교재 근거는 <b>${esc(ver.contentBaselineYear)} 공식 기준</b>입니다. ${esc(ver.targetExamYear)} 공식 범위가 확인되기 전에는 기준연도를 자동으로 올리지 않습니다.</p>${changes.length?`<div class="exam-version-changes"><b>공식 변경사항</b><ul>${changes.map(x=>`<li>${esc(x.title||x.kind)}</li>`).join('')}</ul></div>`:''}</section>`:'';
return shell(`<div class="resources-119 screen-scroll">${versionCard}<section class="card"><h2>공식 자료</h2><div class="list">${rows.map(x=>`<div class="row resource-row"><div><b>${esc(x.label)}</b><small>중앙소방학교</small></div><div class="resource-actions"><button class="btn small ghost" data-resource-doc="${esc(x.key)}">PDF 보기</button><button class="btn small" data-resource-download="${esc(x.key)}">다운로드</button></div></div>`).join('')}</div></section></div>`,'자료')
}
function suggestionStatusOptions(current){return (V.Suggestions?.STATUS||['접수','수렴완료','개선중','개선완료','보류']).map(x=>`<option ${x===current?'selected':''}>${esc(x)}</option>`).join('')}
function suggestionRowsHtml(){
const rows=runtime.suggestions||[],admin=runtime.suggestionsAdmin;if(!rows.length)return '<div class="empty" style="height:110px">아직 건의사항이 없습니다.</div>';
return rows.map(x=>`<article class="suggestion-row"><div class="suggestion-head"><div><span class="tag">${esc(x.category||'건의')}</span><span class="suggestion-status status-${esc(String(x.status||'접수').replace(/[^가-힣A-Za-z0-9_-]/g,''))}">${esc(x.status||'접수')}</span></div><small>${esc(new Date(x.created_at||Date.now()).toLocaleString('ko-KR'))}</small></div><h3>${esc(x.title)}</h3><p>${esc(x.body)}</p><div class="suggestion-meta"><span>${admin?(x.anonymous?'익명':'회원'):'내 건의'}</span></div>${x.admin_reply?`<div class="suggestion-reply"><b>관리자 답변 · ${esc(x.status)}</b><p>${esc(x.admin_reply)}</p></div>`:''}${admin?`<div class="suggestion-admin"><select class="select" data-suggest-admin-status="${esc(x.id)}">${suggestionStatusOptions(x.status)}</select><textarea class="textarea" data-suggest-admin-reply="${esc(x.id)}" placeholder="답글을 입력하세요">${esc(x.admin_reply||'')}</textarea><button class="btn primary" data-suggest-admin-save="${esc(x.id)}">답글·상태 저장</button></div>`:''}<div class="toolbar suggestion-actions"><button class="btn small ghost danger" data-suggest-delete="${esc(x.id)}">삭제</button></div></article>`).join('')
}
function refreshSuggestionsView(){
if(state().page!=='suggestions')return;
const list=document.querySelector('.suggestion-list'),count=document.querySelector('[data-suggestion-count]'),page=document.querySelector('[data-suggestion-page]'),prev=document.querySelector('[data-suggest-prev]'),next=document.querySelector('[data-suggest-next]');
if(list)list.innerHTML=runtime.suggestionsLoading?'<div class="empty" style="height:100px">불러오는 중…</div>':suggestionRowsHtml();
if(count)count.textContent=runtime.suggestionsLoading?'불러오는 중':`페이지 ${runtime.suggestionPage+1} · ${runtime.suggestions.length}건`;
if(page)page.textContent=`${runtime.suggestionPage+1}페이지`;
if(prev)prev.disabled=runtime.suggestionsLoading||runtime.suggestionPage<=0;
if(next)next.disabled=runtime.suggestionsLoading||!runtime.suggestionsHasMore
}
async function ensureSuggestions(force=false){
const owner=V.Auth?.user?.id||'guest',size=runtime.suggestionPageSize||20,offset=(runtime.suggestionPage||0)*size;
if(owner==='guest'){runtime.suggestions=[];runtime.suggestionsAdmin=false;runtime.suggestionsOwner='guest';runtime.suggestionsHasMore=false;runtime.suggestionsLoading=false;refreshSuggestionsView();return}
if(runtime.suggestionsLoading||(!force&&runtime.suggestionsOwner===owner))return;
runtime.suggestionsLoading=true;refreshSuggestionsView();
try{
const [rows,admin]=await Promise.all([V.Suggestions?.list?.({offset,limit:size})||[],V.Suggestions?.isAdmin?.()||false]);
runtime.suggestions=rows||[];runtime.suggestionsHasMore=!!rows?.hasMore;runtime.suggestionsAdmin=!!admin;runtime.suggestionsOwner=owner
}catch(err){runtime.suggestions=[];runtime.suggestionsHasMore=false;runtime.suggestionsAdmin=false;runtime.suggestionsOwner=owner;runtime.suggestionError='건의함을 불러오지 못했습니다: '+String(err?.message||err).slice(0,70)}
finally{runtime.suggestionsLoading=false;refreshSuggestionsView()}
}
function suggestions(){
if(!V.Auth?.user)return shell(`<div class="suggestions-page screen-scroll"><section class="card"><h2>건의함</h2><p class="muted">건의사항은 회원 전용입니다. 로그인하면 익명으로 의견을 보내고 관리자 답변을 확인할 수 있습니다.</p><button class="btn primary" data-account>로그인 / 회원가입</button></section></div>`,'건의함');
ensureSuggestions();
const admin=runtime.suggestionsAdmin;
const draft=runtime.suggestionDraft||{category:'개선',title:'',body:'',anonymous:true};
return shell(`<div class="suggestions-page screen-scroll"><section class="card suggestion-intro"><div class="toolbar"><div><span class="eyebrow">${admin?'관리자':'의견 보내기'}</span><h2>${admin?'건의사항 관리':'익명 건의함'}</h2></div><span class="spacer"></span><button class="btn small ghost" data-suggest-refresh>새로고침</button></div><p class="muted">${admin?'전체 회원의 건의사항을 확인하고 답글과 처리상태를 남길 수 있습니다. 익명 글은 작성자 신원을 화면에 표시하지 않습니다.':'다른 회원은 볼 수 없습니다. 작성자는 자기 글과 관리자 답변만 볼 수 있고, 관리자는 전체 건의사항을 확인합니다.'}</p></section>
<section class="card suggestion-form"><b>새 건의사항</b><div class="form-grid" style="margin-top:10px"><label>분류<select id="suggestCategory" class="select">${(V.Suggestions?.CATEGORY||['개선','건의','오류','콘텐츠','기타']).map(x=>`<option ${x===draft.category?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>제목<input id="suggestTitle" class="input" maxlength="120" value="${esc(draft.title||'')}" placeholder="무엇을 개선하면 좋을까요?"></label></div><textarea id="suggestBody" class="textarea" maxlength="5000" placeholder="문제 화면, 원하는 개선점, 재현 방법 등을 자세히 적어주세요." style="margin-top:8px">${esc(draft.body||'')}</textarea><label class="suggest-anon"><input id="suggestAnonymous" type="checkbox" ${draft.anonymous!==false?'checked':''}> 익명으로 보내기</label>${runtime.suggestionError?`<div class="suggestion-form-error" role="alert">${esc(runtime.suggestionError)}</div>`:''}<button class="btn primary block" data-suggest-submit>건의사항 보내기</button></section>
<section class="card"><div class="toolbar"><b>${admin?'전체 건의사항':'내 건의사항'}</b><span class="spacer"></span><span class="tiny muted" data-suggestion-count>${runtime.suggestionsLoading?'불러오는 중':`페이지 ${runtime.suggestionPage+1} · ${runtime.suggestions.length}건`}</span></div><div class="suggestion-list">${runtime.suggestionsLoading?'<div class="empty" style="height:100px">불러오는 중…</div>':suggestionRowsHtml()}</div><div class="suggestion-pager"><button class="btn" data-suggest-prev ${runtime.suggestionPage<=0?'disabled':''}>← 이전 20개</button><span class="tiny muted" data-suggestion-page>${runtime.suggestionPage+1}페이지</span><button class="btn primary" data-suggest-next ${runtime.suggestionsHasMore?'':'disabled'}>다음 20개 →</button></div></section></div>`,'건의함')
}
function settings(){
const configured=V.Auth?.configured?.(),u=V.Auth?.user,notice=runtime.authNotice,pending=runtime.pendingAuthEmail,sched=officialScheduleState();
const scheduleText=sched.written?`필기시험 ${esc(sched.written)} · ${esc(ddayText(sched.dday))}`:'공식 일정 대기 중';
return shell(`<div class="settings-page screen-scroll"><section class="card settings-account"><b>계정</b>${u?`<p><b>${esc(u.email)}</b></p><div class="settings-actions"><button class="btn primary" data-cloud-sync>동기화</button><button class="btn ghost" data-signout>로그아웃</button></div>`:configured?`${notice?`<div class="privacy settings-notice">${esc(notice)}</div>`:''}<div class="form-grid settings-auth-form"><label>이메일<input id="authEmail" class="input" type="email" autocomplete="email" value="${esc(pending||'')}"></label><label>비밀번호<input id="authPw" class="input" type="password" minlength="8" autocomplete="current-password"></label></div><div class="settings-actions"><button class="btn primary" data-signin>로그인</button><button class="btn" data-signup>회원가입</button><button class="btn ghost" data-resend-confirmation>인증메일 다시 보내기</button></div>`:'<p class="muted">현재 기기에 학습 기록을 저장합니다.</p>'}</section>
<section class="card"><b>시험 목표</b><div class="official-date-readonly"><span>목표</span><strong>${esc(sched.year)} 소방공무원 시험</strong><small>${scheduleText}</small><p class="tiny muted">시험일과 원서접수 일정은 공식 공고 감시에서 확인된 값만 자동 반영합니다. 예상 날짜는 입력하지 않습니다.</p></div><div class="form-grid" style="margin-top:9px"><label>하루 공부(분)<input id="profileDaily" class="input" type="number" min="5" max="1440" value="${state().profile.dailyMinutes||40}"></label><label>수준<select id="profileLevel" class="select">${['처음 시작','기초 있음','재도전'].map(x=>`<option ${state().profile.level===x?'selected':''}>${x}</option>`).join('')}</select></label></div><button class="btn primary" data-profile-save style="margin-top:9px">저장</button></section>
<section class="card"><b>백업 · 복원</b><div class="settings-actions" style="margin-top:9px"><button class="btn" data-export>내 기록 백업</button></div><label class="backup-file-label">백업 파일 선택<input id="importBackup" class="input" type="file" accept="application/json"></label></section><section class="card"><b>개인정보</b><p class="muted">내 학습 기록과 직접 작성한 메모는 다른 회원에게 공개되지 않습니다.</p></section></div>`,'설정')
}
function view(){if(state().page==='tutor'){state().page='study';state().studyTab='ai';S.save()}return({home,study,notes,bank,exam,wrong,stats,resources,suggestions,settings}[state().page]||home)()}
function scrollTutorToBottom(s,force){requestAnimationFrame(()=>requestAnimationFrame(()=>{const x=[...document.querySelectorAll('.study-ai-chat')].find(e=>e.offsetParent!==null);if(!x)return;const b=x.closest('.study-body');if(force||!s||s[2]){x.scrollTop=x.scrollHeight;if(b)b.scrollTop=b.scrollHeight}else{x.scrollTop=s[0];if(b)b.scrollTop=s[1]}runtime.tutorForceLatest=false}))}
function render(){const a=state().page==='study'&&state().studyTab==='ai',x=a?[...document.querySelectorAll('.study-ai-chat')].find(e=>e.offsetParent!==null):null,b=x?.closest('.study-body'),s=x&&[x.scrollTop,b?.scrollTop||0,x.scrollHeight-x.clientHeight-x.scrollTop<25],f=runtime.tutorForceLatest;document.querySelector('#app').innerHTML=view();if(a)scrollTutorToBottom(s,f)}
function sourceAnchorQueries(c,p=V.contentPacks.get(c?.id)){const t=String(c?.title||'').trim(),a=[t,t.replace(/\s*(?:개론|원리|이론|기초|종류|구조|방법|개요)\s*$/,''),...t.split(/[·,/()\s-]+/),...(V.ConceptArchitecture119?.termsFor?.(c?.id)||[]),...(p?.compare||[]).flatMap(x=>x||[]),...(p?.must||[]).flatMap(x=>String(x||'').split(/\s*(?:→|:|=|·|\/|,)\s*/))],stop=/^(개념|기초|종류|이론|구조|원리|정리|방법|특징|설명|및)$/;return[...new Set(a.map(x=>String(x||'').replace(/^[★☆\d.\s-]+/,'').trim()).filter(x=>x.length>=2&&x.length<=28&&!stop.test(x)))].sort((a,b)=>b.length-a.length).slice(0,18)}
function evidenceQueries(c,p){const q=p?.studySchema||{};return[...sourceAnchorQueries(c,p),p?.summary,q.definition,...(q.conditions||[]),...(q.mechanisms||[]),...(p?.must||[]),...(p?.detail||[]),...(p?.compare||[]).flat()].filter(Boolean).slice(0,30)}
function hasAnchorEvidence(r,a){const l=(r?.evidenceLines||[]).map(studyNorm),t=(a||[]).map(studyNorm).filter(x=>x.length>=2);return t.some(x=>l.some(y=>y.includes(x)))}
function sourceModal(id){return openPdfEvidence(id)}
async function downloadOfficialPdf(key){if(!key||!V.SourcePDF?.download)return toast('다운로드할 PDF가 없습니다.');try{const r=await V.SourcePDF.download(key,{timeoutMs:120000});toast(`PDF 다운로드 시작 · ${r?.name||key}`)}catch(err){toast('PDF 다운로드 실패 · '+String(err?.message||err).slice(0,46))}}
const sourceOverlay=()=>document.querySelector('#pdfEvidence,#resourcePdf,#sourceModal');function sourceOpen(){history.pushState({...history.state,sourceView:1},'')}function sourceClose(pop=false){const x=sourceOverlay();if(!x)return false;x.remove();if(!pop&&history.state?.sourceView)history.back();return true}addEventListener('popstate',()=>sourceClose(true));addEventListener('keydown',e=>{if(e.key==='Escape'&&sourceOverlay()){e.preventDefault();sourceClose()}})
async function renderResourcePdf(key,pageOverride=1){
const root=document.querySelector('#resourcePdf');if(!root)return;
const host=root.querySelector('#resourcePdfHost'),badge=root.querySelector('[data-resource-page-label]'),catalog=V.SourceCatalog119?.get?.(key),official=catalog?.officialPage||V.SourcePDF?.sourcePage?.(key)||'';
if(!catalog||!V.SourcePDF){host.innerHTML='<div class="empty">연결된 원문이 없습니다.</div>';return}
host.innerHTML='<div class="pdf-loading"><b>공식 교재 여는 중…</b><small>필요한 페이지만 불러옵니다.</small><div class="progressbar"><i style="width:35%"></i></div></div>';
try{
const result=await V.SourcePDF.render(key,Number(pageOverride)||1,host,[],{timeoutMs:90000,zoom:Number(root.dataset.zoom)||1});
root.dataset.page=String(result.page);root.dataset.pages=String(result.pages);const zl=root.querySelector('[data-resource-zoom-label]');if(zl)zl.textContent=Math.round((result.zoom||1)*100)+'%';
badge.textContent=result.bookPage?`교재 ${result.bookPage}쪽`:`PDF ${result.page}/${result.pages}쪽`;
const prev=root.querySelector('[data-resource-pdf-page="-1"]'),next=root.querySelector('[data-resource-pdf-page="1"]');
if(prev)prev.disabled=result.page<=1;if(next)next.disabled=result.page>=result.pages;
root.querySelector('.pdf-pager')?.classList.remove('hidden');
}catch(err){
root.dataset.renderState='error';
badge.textContent='원문을 불러오지 못했습니다';
host.innerHTML=`<div class="source-connect official-fallback"><b>교재를 불러오지 못했습니다.</b><p>네트워크 상태를 확인한 뒤 다시 시도하세요.</p>${official?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(official)}">중앙소방학교 원문 열기</a>`:''}</div>`;
root.querySelector('.pdf-pager')?.classList.add('hidden');
}
}
async function openResourcePdf(key){
const row=V.SourceCatalog119?.get?.(key);if(!row)return;
document.querySelector('#resourcePdf')?.remove();
document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="resourcePdf" data-resource-pdf-backdrop data-doc-key="${esc(key)}" data-page="1" data-zoom="1"><div class="modal pdf-evidence-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 자료</span><h2>${esc(row.label)}</h2><small data-resource-page-label class="muted">PDF 여는 중</small></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small" data-resource-download="${esc(key)}">다운로드</button><button class="btn small ghost pdf-close-btn" data-resource-pdf-close>닫기 ✕</button></div><div class="toolbar pdf-zoombar"><button class="btn small ghost" data-resource-pdf-zoom="-0.25">−</button><span class="pill" data-resource-zoom-label>100%</span><button class="btn small ghost" data-resource-pdf-zoom="0.25">＋</button><button class="btn small ghost" data-resource-pdf-fit>폭 맞춤</button></div><div id="resourcePdfHost" class="pdf-evidence-host"><div class="empty">공식 교재 확인 중…</div></div><div class="toolbar pdf-pager hidden"><button class="btn ghost" data-resource-pdf-page="-1">← 이전 페이지</button><button class="btn ghost" data-resource-pdf-page="1">다음 페이지 →</button></div></div></div>`);sourceOpen();
await renderResourcePdf(key,1);
}
async function renderPdfEvidence(id,pageOverride=null){
const root=document.querySelector('#pdfEvidence');if(!root)return;
root.dataset.renderState='loading';delete root.dataset.anchorVerified;
const c=V.curriculum.byId[id],p=V.contentPacks.get(id),range=(c?.sourceRanges||[])[0],key=range?.doc||'',host=root.querySelector('#pdfEvidenceHost'),badge=root.querySelector('[data-pdf-page-label]'),anchorQueries=sourceAnchorQueries(c,p),queries=evidenceQueries(c,p);
if(!key||!V.SourcePDF){host.innerHTML='<div class="empty">연결된 원문이 없습니다.</div>';return}
const availability=await V.SourcePDF.availability(key),official=availability.officialPage||V.SourcePDF.sourcePage(key),catalog=V.SourceCatalog119?.get?.(key),staticRange=catalog?.transport==='range-static';
if(!availability.local&&!availability.direct){badge.textContent='공식 원문';host.innerHTML=`<div class="source-connect official-fallback"><b>원문을 바로 불러올 수 없습니다.</b>${official?`<a class="btn primary block" target="_blank" rel="noopener" href="${esc(official)}">중앙소방학교 원문 열기</a>`:''}</div>`;root.querySelector('.pdf-pager')?.classList.add('hidden');return}
host.innerHTML=staticRange
?'<div class="pdf-loading"><b>공식 교재 여는 중…</b><small>필요한 페이지만 빠르게 불러옵니다.</small><div class="progressbar"><i style="width:35%"></i></div><span>원문 준비 중</span></div>'
:`<div class="pdf-loading"><b>${availability.local?'공식 원문 여는 중…':'공식 원문 여는 중…'}</b><small>연결된 공식 PDF의 해당 페이지를 여는 중입니다.</small><div class="progressbar"><i data-pdf-progress style="width:${availability.local?100:4}%"></i></div><span data-pdf-progress-label>${availability.local?'교재 확인 중':'원문 준비 중'}</span></div>`;
try{
const bookFrom=Number(range?.from)||0,initialPdfPage=bookFrom?(V.SourcePDF.pdfPage?.(key,bookFrom)||bookFrom):0;
let page=Number(pageOverride)||Number(root.dataset.page)||initialPdfPage||0;
const progress=({loaded,total,percent})=>{const bar=root.querySelector('[data-pdf-progress]'),label=root.querySelector('[data-pdf-progress-label]');if(bar&&percent!=null)bar.style.width=Math.max(4,percent)+'%';if(label)label.textContent=percent!=null?`원문 준비 중`:`원문 준비 중`};
if(!page){badge.textContent='근거 위치 찾는 중…';const located=await V.SourcePDF.locate(key,queries);page=located.page;root.dataset.autoLocated='true'}
badge.textContent=staticRange?'공식 교재 여는 중…':(availability.local?'공식 원문 여는 중…':'공식 원문 여는 중…');
let result=await V.SourcePDF.render(key,page,host,queries,{timeoutMs:90000,onProgress:progress,anchorTerms:anchorQueries,zoom:Number(root.dataset.zoom)||1});
if(pageOverride==null&&!hasAnchorEvidence(result,anchorQueries)&&anchorQueries.length){
const mapped=(c?.sourceRanges||[]).filter(x=>x.doc===key);
const candidates=[];
const mappedHit=await V.SourcePDF.locate(key,queries,{bookRanges:mapped}).catch(()=>null);
if(mappedHit?.page&&mappedHit.score>0)candidates.push({...mappedHit,scope:'mapped'});
const broadHit=await V.SourcePDF.locate(key,queries).catch(()=>null);
if(broadHit?.page&&broadHit.score>=8&&!candidates.some(x=>x.page===broadHit.page))candidates.push({...broadHit,scope:'document'});
for(const located of candidates){
const anchorResult=await V.SourcePDF.render(key,located.page,host,queries,{timeoutMs:90000,onProgress:progress,anchorTerms:anchorQueries,zoom:Number(root.dataset.zoom)||1});
if(hasAnchorEvidence(anchorResult,anchorQueries)||anchorResult.hits>=2){result=anchorResult;root.dataset.autoLocated='true';root.dataset.searchScope=located.scope;break}
}
}
const anchorVerified=hasAnchorEvidence(result,anchorQueries)||result.hits>=2;root.dataset.highlightCount=String(result.hits||0);
root.dataset.anchorVerified=anchorVerified?'true':'false';
root.dataset.page=String(result.page);root.dataset.pages=String(result.pages);root.dataset.renderState='ready';const zl=root.querySelector('[data-pdf-zoom-label]');if(zl)zl.textContent=Math.round((result.zoom||1)*100)+'%';
const truthLabel=anchorVerified?'공식 근거':'근거 위치 확인 필요';
badge.textContent=result.bookPage?`교재 ${result.bookPage}쪽 · ${truthLabel}`:`PDF ${result.page}/${result.pages}쪽 · ${truthLabel}`;
const prev=root.querySelector('[data-pdf-page="-1"]'),next=root.querySelector('[data-pdf-page="1"]');if(prev)prev.disabled=result.page<=1;if(next)next.disabled=result.page>=result.pages;
root.querySelector('.pdf-pager')?.classList.remove('hidden')
}catch(err){
badge.textContent='원문을 불러오지 못했습니다';
host.innerHTML=`<div class="source-connect official-fallback"><b>교재를 불러오지 못했습니다.</b><p>네트워크 상태를 확인한 뒤 다시 시도하세요.</p><div class="toolbar"><button class="btn primary" data-pdf-retry>다시 시도</button>${official?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(official)}">공식 원문 열기</a>`:''}</div></div>`;
root.querySelector('.pdf-pager')?.classList.add('hidden')
}
}
async function openPdfEvidence(id){const c=V.curriculum.byId[id],pack=V.contentPacks?.get?.(id),range=(c?.sourceRanges||[]).find(x=>x?.doc)||(c?.sourceRanges||[])[0],key=range?.doc||'',bookFrom=Number(range?.from)||0;
if(!key){
const links=(pack?.officialLinks||[]).filter(x=>x?.url);
document.querySelector('#sourceModal')?.remove();document.querySelector('#pdfEvidence')?.remove();
if(!links.length){toast('연결된 공식 원문이 없습니다.');return}
document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="sourceModal" data-source-backdrop><div class="modal source-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 웹 근거</span><h2>${esc(c?.title||id)}</h2></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small ghost pdf-close-btn" data-source-close>닫기 ✕</button></div><p class="lead">${esc(pack?.source||'공식 근거')}</p><div class="source-law-links">${links.map(x=>`<a class="source-law-link" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label||'공식 원문')} <span aria-hidden="true">↗</span></a>`).join('')}</div></div></div>`);sourceOpen();
return
}
const hasMappedBookPage=Object.prototype.hasOwnProperty.call(V.SourcePDF?.pageOffsets||{},key),initialPdf=bookFrom?(V.SourcePDF.pdfPage?.(key,bookFrom)||bookFrom):0;document.querySelector('#sourceModal')?.remove();document.querySelector('#pdfEvidence')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="pdfEvidence" data-pdf-backdrop data-concept-id="${esc(id)}" data-doc-key="${esc(key)}" data-page="${initialPdf||''}" data-zoom="1"><div class="modal pdf-evidence-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 근거</span><h2>${esc(c?.title||id)}</h2><small data-pdf-page-label class="muted">${bookFrom?(hasMappedBookPage?`교재 ${bookFrom}쪽`:`PDF ${bookFrom}쪽`):'근거 위치 찾기'}</small></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small" data-pdf-download>다운로드</button><button class="btn small ghost pdf-close-btn" data-pdf-close>닫기 ✕</button></div><div class="toolbar pdf-zoombar"><button class="btn small ghost" data-pdf-zoom="-0.25">−</button><span class="pill" data-pdf-zoom-label>100%</span><button class="btn small ghost" data-pdf-zoom="0.25">＋</button><button class="btn small ghost" data-pdf-fit>폭 맞춤</button></div><div id="pdfEvidenceHost" class="pdf-evidence-host"><div class="empty">공식 원문 여는 중…</div></div><div class="toolbar pdf-pager hidden"><button class="btn ghost" data-pdf-page="-1">← 이전 페이지</button><button class="btn ghost" data-pdf-page="1">다음 페이지 →</button></div></div></div>`);sourceOpen();await renderPdfEvidence(id)}
document.addEventListener('click',async e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.matches('[data-backdrop-close-more]')){runtime.more=false;return render()}if(t.matches('[data-backdrop-close-account]')){runtime.account=false;return render()}if(t.matches('[data-source-backdrop],[data-resource-pdf-backdrop],[data-pdf-backdrop]')){sourceClose();return}const b=t.closest('button,[data-outline-close]');if(!b)return;if('sourceBack'in b.dataset){sourceClose();return}if('resourcePdfClose'in b.dataset){sourceClose();return}
if(b.dataset.resourceDoc){await openResourcePdf(b.dataset.resourceDoc);return}
if(b.dataset.resourceDownload){await downloadOfficialPdf(b.dataset.resourceDownload);return}
if(b.dataset.resourcePdfPage){const root=document.querySelector('#resourcePdf'),key=root?.dataset.docKey,current=Number(root?.dataset.page)||1;await renderResourcePdf(key,current+Number(b.dataset.resourcePdfPage));return}if(b.dataset.resourcePdfZoom){const root=document.querySelector('#resourcePdf');root.dataset.zoom=String(Math.max(.75,Math.min(2.25,(Number(root.dataset.zoom)||1)+Number(b.dataset.resourcePdfZoom))));await renderResourcePdf(root.dataset.docKey,Number(root.dataset.page)||1);return}if('resourcePdfFit'in b.dataset){const root=document.querySelector('#resourcePdf');root.dataset.zoom='1';await renderResourcePdf(root.dataset.docKey,Number(root.dataset.page)||1);return}
if('sourceClose'in b.dataset){sourceClose();return}if('pdfClose'in b.dataset){sourceClose();return}if('pdfRetry'in b.dataset){const root=document.querySelector('#pdfEvidence'),id=root?.dataset.conceptId;await V.SourcePDF.clearPdfCache?.(V.curriculum.byId[id]?.sourceRanges?.[0]?.doc||'');await renderPdfEvidence(id);return}if(b.dataset.pdfEvidence){await openPdfEvidence(b.dataset.pdfEvidence);return}if(b.dataset.pdfPage){const root=document.querySelector('#pdfEvidence'),id=root?.dataset.conceptId,current=Number(root?.dataset.page)||1;await renderPdfEvidence(id,current+Number(b.dataset.pdfPage));return}if(b.dataset.pdfZoom){const root=document.querySelector('#pdfEvidence');root.dataset.zoom=String(Math.max(.75,Math.min(2.25,(Number(root.dataset.zoom)||1)+Number(b.dataset.pdfZoom))));await renderPdfEvidence(root.dataset.conceptId,Number(root.dataset.page)||1);return}if('pdfFit'in b.dataset){const root=document.querySelector('#pdfEvidence');root.dataset.zoom='1';await renderPdfEvidence(root.dataset.conceptId,Number(root.dataset.page)||1);return}if(b.dataset.examReport){runtime.examReportId=b.dataset.examReport;return go('stats')}if(b.dataset.skillTrain){state().page='exam';S.save();runtime.examReportId='';return startTraining('skill:'+b.dataset.skillTrain)}if('reportClose'in b.dataset){runtime.examReportId='';return render()}if(b.dataset.go)return go(b.dataset.go);if('more'in b.dataset){runtime.more=true;return render()}if('closeMore'in b.dataset){runtime.more=false;return render()}if('account'in b.dataset){runtime.account=true;return render()}if('closeAccount'in b.dataset){runtime.account=false;return render()}if('outline'in b.dataset){state().outline=!state().outline;S.save();return render()}if('outlineClose'in b.dataset){state().outline=false;S.save();return render()}if(b.dataset.subject){state().subject=b.dataset.subject;const sc=(b.dataset.subject==='fire'?V.curriculum.fire:V.curriculum.ems)[0];state().scopeId=sc.id;state().conceptId=`${sc.id}-C01`;S.save();return render()}if(b.dataset.scope){const sc=V.curriculum.scopeById[b.dataset.scope];state().scopeId=sc.id;state().conceptId=`${sc.id}-C01`;S.save();return render()}if(b.dataset.passStar){try{const r=await V.PassNote.toggleConcept(b.dataset.passStar);toast(r.saved?'합격노트에 저장됨':'합격노트에서 해제됨');return render()}catch(err){return toast('합격노트 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.passQuestion){try{const r=await V.PassNote.toggleQuestion(b.dataset.passQuestion);toast(r.saved?'문제를 합격노트에 저장':'합격노트에서 문제 해제');return render()}catch(err){return toast('문제 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.passExport){try{V.PassNote.exportPdf(b.dataset.passExport);toast('인쇄 화면에서 PDF로 저장하세요.')}catch(err){toast(err?.message==='POPUP_BLOCKED'?'팝업을 허용한 뒤 다시 눌러주세요.':'PDF 내보내기 실패')}return}
if('suggestRefresh'in b.dataset){runtime.suggestionsOwner='';await ensureSuggestions(true);return}
if('suggestPrev'in b.dataset){if(runtime.suggestionPage>0){runtime.suggestionPage--;runtime.suggestionsOwner='';await ensureSuggestions(true)}return}
if('suggestNext'in b.dataset){if(runtime.suggestionsHasMore){runtime.suggestionPage++;runtime.suggestionsOwner='';await ensureSuggestions(true)}return}
if('suggestSubmit'in b.dataset){const category=$('#suggestCategory')?.value||'개선',title=$('#suggestTitle')?.value.trim()||'',body=$('#suggestBody')?.value.trim()||'',anonymous=$('#suggestAnonymous')?.checked!==false;runtime.suggestionDraft={category,title,body,anonymous};runtime.suggestionError='';if(title.length<2){runtime.suggestionError='제목을 2자 이상 입력해주세요.';return render()}if(body.length<2){runtime.suggestionError='건의 내용을 2자 이상 입력해주세요.';return render()}try{await V.Suggestions.create({category,title,body,anonymous});runtime.suggestionDraft={category:'개선',title:'',body:'',anonymous:true};runtime.suggestionError='';runtime.suggestionPage=0;runtime.suggestionsOwner='';await ensureSuggestions(true);toast('건의사항이 접수되었습니다.');return}catch(err){const code=String(err?.message||err);runtime.suggestionError=code==='TITLE_REQUIRED'?'제목을 2자 이상 입력해주세요.':code==='BODY_REQUIRED'?'건의 내용을 2자 이상 입력해주세요.':'접수하지 못했습니다. 잠시 후 다시 시도해주세요. ('+code.slice(0,40)+')';return render()}}
if(b.dataset.suggestAdminSave){const id=b.dataset.suggestAdminSave,status=document.querySelector(`[data-suggest-admin-status="${CSS.escape(id)}"]`)?.value||'수렴완료',reply=document.querySelector(`[data-suggest-admin-reply="${CSS.escape(id)}"]`)?.value||'';try{await V.Suggestions.adminReply(id,{status,reply});runtime.suggestionsOwner='';toast('답글과 상태를 저장했습니다.');await ensureSuggestions(true);return}catch(err){return toast('관리자 저장 실패 · '+String(err?.message||err).slice(0,60))}}
if(b.dataset.suggestDelete){if(!confirm('이 건의사항을 삭제할까요?'))return;try{await V.Suggestions.remove(b.dataset.suggestDelete);if(runtime.suggestions.length===1&&runtime.suggestionPage>0)runtime.suggestionPage--;runtime.suggestionsOwner='';toast('건의사항을 삭제했습니다.');await ensureSuggestions(true);return}catch(err){return toast('삭제 실패 · '+String(err?.message||err).slice(0,60))}}
if(b.dataset.concept)return chooseConcept(b.dataset.concept);if(b.dataset.wrongDelete){const id=b.dataset.wrongDelete,w=state().wrongs.find(x=>x.id===id);if(!w)return;if(!confirm('이 오답노트를 삭제할까요? 정답 기록과 시험기록은 유지됩니다.'))return;try{if(V.Auth?.user&&V.Auth?.deleteWrong)await V.Auth.deleteWrong(id);state().wrongs=state().wrongs.filter(x=>x.id!==id);S.save();toast('오답노트 삭제 완료');return render()}catch(err){return toast('오답노트 삭제 실패 · '+String(err?.message||err).slice(0,42))}}if(b.dataset.bookJump){const target=document.getElementById(b.dataset.bookJump);target?.scrollIntoView({behavior:'smooth',block:'start'});return}if(b.dataset.studyTab){if(!await ensurePageData('study',b.dataset.studyTab))return;state().studyTab=b.dataset.studyTab;S.save();return render()}if('studyQuizPrev'in b.dataset||'studyQuizNext'in b.dataset){const id=currentConcept().id,qs=V.QuestionQuality119?.forConcept(id)||[],cur=Number(runtime.studyQuizIndex[id]||0),next='studyQuizPrev'in b.dataset?cur-1:cur+1;runtime.studyQuizIndex[id]=Math.max(0,Math.min(next,Math.max(0,qs.length-1)));runtime.questionAt=Date.now();return render()}
if('studyPrev'in b.dataset||'studyNext'in b.dataset){const c=currentConcept(),n=conceptNeighbors(c),target='studyPrev'in b.dataset?n.prev:n.next;if(target)return chooseConcept(target.id,{keepTab:true});return}if(b.dataset.review){V.Mastery.markReviewed(currentConcept().id,b.dataset.review);toast('복습 일정에 반영됨');return}if(b.dataset.confidence){const[id,k]=b.dataset.confidence.split(':');state().confidence[id]=k;S.save();return render()}if(b.dataset.answer){const[id,i]=b.dataset.answer.split(':');const q=V.questionById[id],ms=Date.now()-runtime.questionAt;V.Mastery.recordAnswer(q,Number(i),state().confidence[id]||'none',ms);return render()}if(b.dataset.bankConcept){runtime.bankConcept=b.dataset.bankConcept;runtime.bankFilter='';runtime.bankIndex=0;return go('bank')}if('bankAll'in b.dataset){runtime.bankConcept='';runtime.bankFilter='';runtime.bankIndex=0;return render()}if('bankPrev'in b.dataset){runtime.bankIndex--;return render()}if('bankNext'in b.dataset){runtime.bankIndex++;return render()}if('calcBank'in b.dataset){runtime.bankConcept='';runtime.bankFilter='calc';runtime.calcGroup='all';runtime.calcStage='all';runtime.bankIndex=0;return go('bank')}if(b.dataset.calcGroup){runtime.calcGroup=b.dataset.calcGroup;runtime.bankIndex=0;return render()}if(b.dataset.calcStage){runtime.calcStage=b.dataset.calcStage;runtime.bankIndex=0;return render()}if(b.dataset.retry){runtime.bankConcept=V.questionById[b.dataset.retry]?.conceptId||'';runtime.bankFilter='';const arr=runtime.bankConcept?V.questionsForConcept(runtime.bankConcept):V.questions;runtime.bankIndex=Math.max(0,arr.findIndex(q=>q.id===b.dataset.retry));return go('bank')}if(b.dataset.tutorConcept){state().conceptId=b.dataset.tutorConcept;state().studyTab='ai';S.save();return go('study')}if(b.dataset.sourceConcept){await openPdfEvidence(b.dataset.sourceConcept);return}if(b.dataset.sourceDownload){const key=V.curriculum.byId[b.dataset.sourceDownload]?.sourceRanges?.[0]?.doc||'';await downloadOfficialPdf(key);return}if('pdfDownload'in b.dataset){const key=document.querySelector('#pdfEvidence')?.dataset.docKey||'';await downloadOfficialPdf(key);return}if(b.dataset.examDifficulty){runtime.examDifficulty=b.dataset.examDifficulty;return render()}if(b.dataset.trainingStart){return startTraining(b.dataset.trainingStart)}if(b.dataset.examStart)return startExam(b.dataset.examStart);if('examAbandon'in b.dataset)return abandonExam();if(b.dataset.examJump!==undefined){runtime.exam.i=Math.max(0,Math.min(runtime.exam.qs.length-1,Number(b.dataset.examJump)||0));persistActiveExam();return render()}if('examPrev'in b.dataset){runtime.exam.i=Math.max(0,runtime.exam.i-1);persistActiveExam();return render()}if('examNext'in b.dataset){if(runtime.exam.i>=runtime.exam.qs.length-1)return finishExam();runtime.exam.i++;persistActiveExam();return render()}if(b.dataset.examAnswer!==undefined){const q=runtime.exam.qs[runtime.exam.i];runtime.exam.answers[q.id]=Number(b.dataset.examAnswer);persistActiveExam();return render()}if(b.dataset.examConfidence){const q=runtime.exam.qs[runtime.exam.i];(runtime.exam.confidence||(runtime.exam.confidence={}))[q.id]=b.dataset.examConfidence;persistActiveExam();return render()}if('saveNote'in b.dataset){const title=$('#noteTitle')?.value.trim(),body=$('#noteBody')?.value.trim();if(!body)return toast('노트 내용을 입력하세요.');try{await V.PassNote.saveManual({title:title||'내 합격노트',body});toast('합격노트에 저장됨');return render()}catch(err){return toast('노트 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.noteFilter){runtime.noteFilter=b.dataset.noteFilter;return render()}
if('noteSearch'in b.dataset){runtime.noteQuery=$('#noteSearch')?.value.trim()||'';return render()}
if('noteSearchClear'in b.dataset){runtime.noteQuery='';return render()}
if(b.dataset.noteEdit){runtime.noteEditId=b.dataset.noteEdit;return render()}
if('noteCancel'in b.dataset){runtime.noteEditId='';return render()}
if(b.dataset.noteSave){const note=state().notes.find(x=>x.id===b.dataset.noteSave),title=$('#noteEditTitle')?.value.trim();if(!note)return toast('노트를 찾을 수 없습니다.');let body='';if(sourceBackedNote(note)){const parts=splitSourceNote(note),memo=$('#noteEditMemo')?.value.trim()||'';body=parts.official+(memo?'\n\n[내 메모]\n'+memo:'')}else body=$('#noteEditBody')?.value.trim()||'';if(!body)return toast('노트 내용을 확인하세요.');try{await V.PassNote.persist({...note,title:title||note.title,body});runtime.noteEditId='';toast('합격노트 수정됨');return render()}catch(err){return toast('수정 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.noteDelete){if(!confirm('이 합격노트를 삭제할까요?'))return;try{await V.PassNote.remove(b.dataset.noteDelete);toast('합격노트 삭제됨');return render()}catch(err){return toast('삭제 실패 · '+String(err?.message||err).slice(0,40))}}
if('aiLoad'in b.dataset)return loadAI();if(b.dataset.tutorPrompt){const input=visibleTutorInput();if(input)input.value=b.dataset.tutorPrompt;return sendTutor()}if('tutorSend'in b.dataset)return sendTutor();if('profileSave'in b.dataset){const daily=Math.max(5,Math.min(1440,Number($('#profileDaily')?.value)||40)),sched=officialScheduleState();state().profile={...state().profile,examYear:sched.year||'2027',examDate:sched.written||'',examDateSource:sched.written?'official-monitor':'pending',examSchedule:sched.schedule||{},dailyMinutes:daily,level:$('#profileLevel')?.value||'처음 시작',updatedAt:Date.now()};S.save();return toast('학습 목표 저장됨')}if('export'in b.dataset){const blob=new Blob([S.export()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ai-tutor-v9-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);return}if('signin'in b.dataset||'signup'in b.dataset){const email=$('#authEmail')?.value.trim(),pw=$('#authPw')?.value||'';if(!email)return toast('이메일을 입력하세요.');if(pw.length<8)return toast('비밀번호는 8자 이상 입력하세요.');try{if('signin'in b.dataset){await V.Auth.signIn(email,pw);runtime.authNotice='';runtime.pendingAuthEmail='';runtime.account=false;toast('회원 계정 연결됨')}else{const result=await V.Auth.signUp(email,pw);if(result?.pendingEmailConfirmation){runtime.pendingAuthEmail=email;runtime.authNotice='회원가입 완료 · 인증메일을 확인한 뒤 로그인하세요. 메일이 안 보이면 인증메일 다시 보내기를 누르세요.';render();toast('회원가입 완료 · 이메일 인증 필요')}else{runtime.authNotice='';runtime.pendingAuthEmail='';runtime.account=false;toast('회원 계정 연결됨')}}}catch(err){const m=String(err.message||err);if(/Email not confirmed/i.test(m)){runtime.pendingAuthEmail=email;runtime.authNotice='이메일 인증이 아직 완료되지 않았습니다. 인증메일을 확인하거나 재전송하세요.';render();toast('이메일 인증 필요')}else if(/already been registered|already registered/i.test(m)){runtime.pendingAuthEmail=email;runtime.authNotice='이미 가입된 이메일입니다. 새로 만들지 말고 인증메일 확인 후 로그인하세요.';render();toast('이미 가입된 이메일')}else toast(m.slice(0,70))}return}if('resendConfirmation'in b.dataset){const email=$('#authEmail')?.value.trim()||runtime.pendingAuthEmail;if(!email)return toast('이메일을 입력하세요.');try{await V.Auth.resendConfirmation(email);runtime.pendingAuthEmail=email;runtime.authNotice='인증메일을 다시 보냈습니다. 받은편지함과 스팸함을 확인하세요.';render();toast('인증메일 재전송 완료')}catch(err){toast(String(err.message||err).slice(0,70))}return}if('signout'in b.dataset){await V.Auth.signOut();runtime.account=false;return go('home')}if('cloudSync'in b.dataset){try{await V.Auth.syncAll();toast('개인 데이터 동기화 완료')}catch(err){toast(String(err.message||err).slice(0,70))}}});
document.addEventListener('input',e=>{if(e.target.id==='suggestTitle'||e.target.id==='suggestBody'){runtime.suggestionDraft={...(runtime.suggestionDraft||{}),title:$('#suggestTitle')?.value||'',body:$('#suggestBody')?.value||''};runtime.suggestionError=''}});
document.addEventListener('change',e=>{if(e.target.id==='suggestCategory'||e.target.id==='suggestAnonymous'){runtime.suggestionDraft={...(runtime.suggestionDraft||{}),category:$('#suggestCategory')?.value||'개선',anonymous:$('#suggestAnonymous')?.checked!==false,title:$('#suggestTitle')?.value||'',body:$('#suggestBody')?.value||''};runtime.suggestionError=''}});
document.addEventListener('change',async e=>{if(e.target.dataset.detailJumpSelect!==undefined){const value=String(e.target.value||'');if(value!==''){const root=e.target.closest('.study-body')||document,target=root.querySelector(`[data-detail-section="${CSS.escape(value)}"]`);target?.scrollIntoView({behavior:'smooth',block:'start'});e.target.value=''}return}if(e.target.id==='importBackup'){const f=e.target.files?.[0];if(!f)return;try{S.import(await f.text());toast('복원 완료');render()}catch{toast('복원 실패')}}});
function applyOfficialScheduleToProfile(detail){
const m=detail||V.OfficialMonitor119?.summary?.()||{},year=String(m.targetExamYear||'2027'),items=[...(m.items||[])];
const item=items.find(x=>x?.schedule?.writtenExam&&(!x.title||String(x.title).includes(year)||x.kind==='exam_schedule'));
if(!item?.schedule?.writtenExam)return false;
const next={...state().profile,examYear:year,examDate:item.schedule.writtenExam,examDateSource:'official-monitor',examSchedule:{...item.schedule},officialScheduleTitle:item.title||'',officialScheduleUrl:item.url||'',updatedAt:Date.now()};
const changed=state().profile?.examDate!==next.examDate||state().profile?.examDateSource!=='official-monitor';
state().profile=next;if(changed)S.save();return changed
}
window.addEventListener('aitutor-official-monitor',e=>{if(applyOfficialScheduleToProfile(e.detail)&&state().page==='home')render()});
window.addEventListener('aitutor-auth-change',e=>{
runtime.suggestionsOwner='';runtime.suggestions=[];runtime.suggestionsAdmin=false;runtime.suggestionPage=0;runtime.suggestionsHasMore=false;
const reason=e.detail?.reason||'';
if(reason==='session-expired'){
runtime.authNotice='로그인 세션이 만료되었습니다. 다시 로그인하면 저장한 학습 기록을 이어서 사용할 수 있습니다.';
runtime.pendingAuthEmail='';
toast('로그인 세션 만료 · 다시 로그인해주세요');
return
}
if(reason==='signed-in'||reason==='manual-signout')runtime.authNotice='';
render()
});
async function boot(){
let questionLaneReady=true;
if(V.Lazy119?.needsQuestionsForCurrentState?.()){try{await V.Lazy119.ensureQuestions()}catch(err){questionLaneReady=false;console.error(err);if(V.ExamSession119?.has?.(S.ownerId)||V.Lazy119?.needsQuestions?.(state().page,state().studyTab)){state().page='home';state().studyTab='core';S.save();runtime.authNotice='문제은행 로딩에 실패해 홈으로 이동했습니다. 네트워크 연결 후 다시 시도해주세요.'}}}
const restoredActiveExam=questionLaneReady?restoreActiveExam():false;
V.App={render,go,chooseConcept,runtime,tutorConceptFor,sampleAcrossScopes};render();if(restoredActiveExam)startExamTicker()
}
boot();
})();
