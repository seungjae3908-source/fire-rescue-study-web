'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},S=V.Store;const $=(s,r=document)=>r.querySelector(s);const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const SESSION_EXPIRED_CONTRACT_COPY='로그인 세션이 만료되어 게스트 모드로 전환되었습니다.';
const runtime={more:false,account:false,bankConcept:'',bankFilter:'',bankIndex:0,bankSubject:'all',bankScope:'all',bankDifficulty:'all',bankStatus:'all',bankQuery:'',calcGroup:'all',calcStage:'all',wrongSubject:'all',wrongScope:'all',wrongKind:'all',wrongSort:'priority',wrongQuery:'',retryQuestionId:'',retryConfidence:'none',noteFilter:'all',noteSubject:'fire',noteQuery:'',noteUploadStatus:'',goalEditor:false,hazmatClassOpen:'',outlineQuery:'',studyQuizIndex:{},exam:null,examTimer:null,examDifficulty:'mid',examRound:1,examHub:'mock',examReportId:'',aiEngine:null,aiStatus:'근거 기반 답변',suggestions:[],suggestionsAdmin:false,suggestionsLoading:false,suggestionsOwner:'',suggestionPage:0,suggestionPageSize:20,suggestionsHasMore:false,suggestionDraft:{category:'개선',title:'',body:'',anonymous:true},suggestionError:'',questionAt:Date.now(),toast:'',toastAction:null,toastToken:'',authNotice:'',pendingAuthEmail:''};
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
runtime.exam=exam;runtime.examDifficulty=exam.difficulty||'mid';runtime.examRound=Number(exam.blueprint?.round||1);state().page='exam';state().outline=false;S.save();return true
}
function abandonExam(){
const e=runtime.exam;if(!e)return;
const answered=Object.keys(e.answers||{}).length;
if(!answered){
if(!confirm('아직 푼 문제가 없습니다. 시험을 종료할까요?'))return;
stopExamTicker();clearActiveExam();runtime.exam=null;state().page='exam';S.save();render();return
}
if(!confirm(`현재까지 푼 ${answered}문제를 채점하고 중단 결과를 볼까요?`))return;
finishExam(false,{partial:true,abandoned:true,skipConfirm:true})
}
const NAV=[['home','⌂','홈'],['study','▣','학습'],['notes','▤','합격노트'],['bank','?','문제'],['exam','⏱','시험'],['wrong','!','오답'],['stats','▥','통계'],['resources','◎','자료'],['suggestions','✉','건의함'],['settings','⚙','설정']];
const STUDY_TABS=[['core','핵심'],['detail','상세'],['quiz','문제'],['source','원문'],['ai','AI']];
function toast(t,{duration=2800,actionLabel='',onAction=null}={}){
const token='toast-'+Date.now()+'-'+Math.random().toString(36).slice(2);runtime.toast=t;runtime.toastToken=token;runtime.toastAction=actionLabel&&typeof onAction==='function'?{label:actionLabel,run:onAction}:null;render();
setTimeout(()=>{if(runtime.toastToken===token){runtime.toast='';runtime.toastAction=null;runtime.toastToken='';render()}},Math.max(1800,Number(duration)||2800))
}
function state(){return S.state}function currentConcept(){return V.curriculum.byId[state().conceptId]||V.curriculum.concepts[0]}function currentScope(){return V.curriculum.scopeById[currentConcept().scopeId]}
function rememberStudyPosition(subject=state().subject){
const c=V.curriculum.byId[state().conceptId];if(!c||c.subject!==subject)return;
state().lastStudyBySubject={...(state().lastStudyBySubject||{}),[subject]:{conceptId:c.id,scopeId:c.scopeId,studyTab:STUDY_TABS.some(([k])=>k===state().studyTab)?state().studyTab:'core',updatedAt:Date.now()}}
}
function restoreStudySubject(subject){
const saved=state().lastStudyBySubject?.[subject],c=saved?.conceptId?V.curriculum.byId[saved.conceptId]:null;
if(c?.subject===subject){state().subject=subject;state().scopeId=c.scopeId;state().conceptId=c.id;state().studyTab=STUDY_TABS.some(([k])=>k===saved.studyTab)?saved.studyTab:'core';return c}
const sc=(subject==='fire'?V.curriculum.fire:V.curriculum.ems)[0];state().subject=subject;state().scopeId=sc.id;state().conceptId=`${sc.id}-C01`;state().studyTab='core';return V.curriculum.byId[state().conceptId]
}
async function ensurePageData(page,tab=state().studyTab){
if(!V.Lazy119?.needsQuestions?.(page,tab)||V.Lazy119.questionsReady)return true;
try{document.body?.setAttribute('aria-busy','true');await V.Lazy119.ensureQuestions();return true}catch(err){console.error(err);toast('문제은행을 불러오지 못했습니다. 다시 시도해주세요.');return false}finally{document.body?.removeAttribute('aria-busy')}
}
async function go(page){if(memberGateRequired()){state().page='home';state().outline=false;S.save();runtime.more=false;runtime.account=false;render();return}const target=page==='tutor'?'study':page,tab=page==='tutor'?'ai':state().studyTab;if(!await ensurePageData(target,tab))return;if(target!=='bank'){runtime.retryQuestionId='';runtime.retryConfidence='none'}if(page==='tutor'){state().page='study';state().studyTab='ai'}else state().page=page;state().outline=false;S.save();runtime.more=false;render()}
function chooseConcept(id,{keepTab=false}={}){const c=V.curriculum.byId[id];if(!c)return;state().conceptId=id;state().scopeId=c.scopeId;state().subject=c.subject;if(!keepTab)state().studyTab='core';state().outline=false;rememberStudyPosition(c.subject);S.save();go('study')}
function navButton([id,ico,label]){const active=state().page===id;return `<button class="${active?'active':''}" ${active?'aria-current="page"':''} data-go="${id}"><span class="ico">${ico}</span><span>${label}</span></button>`}
function memberGateBypass(){const h=String(location.hostname||'').toLowerCase();return h==='localhost'||h==='127.0.0.1'||h==='::1'}
function memberGateRequired(){return !V.Auth?.user&&!memberGateBypass()}
function loginGate(){
const configured=V.Auth?.configured?.(),notice=runtime.authNotice,pending=runtime.pendingAuthEmail;
return `<div class="app login-gate-shell"><main class="login-gate-card" aria-label="소방합격 회원 로그인"><div class="login-brand"><span class="brand-mark">✓</span><div><b>소방합격</b><small>회원 전용 학습 서비스</small></div></div><div class="login-copy"><span class="eyebrow">MEMBER ONLY</span><h1>로그인 후 이용할 수 있습니다</h1><p>학습 기록·오답·합격노트·모의고사는 회원 계정에 안전하게 연결됩니다.</p></div>${notice?`<div class="privacy login-notice">${esc(notice)}</div>`:''}${configured?`<div class="login-form"><label>이메일<input id="authEmail" class="input" type="email" autocomplete="email" value="${esc(pending||'')}" placeholder="email@example.com"></label><label>비밀번호<input id="authPw" class="input" type="password" minlength="8" autocomplete="current-password" placeholder="8자 이상"></label><button class="btn primary block" data-signin>로그인</button><div class="login-secondary"><button class="btn" data-signup>회원가입</button><button class="btn ghost" data-resend-confirmation>인증메일 다시 보내기</button></div><small class="muted">회원가입 후 이메일 인증이 필요할 수 있습니다.</small></div>`:`<div class="privacy login-notice">회원 인증 설정을 확인할 수 없습니다. 관리자에게 문의해주세요.</div>`}</main>${runtime.toast?`<div class="app-toast" role="status" aria-live="polite" aria-atomic="true"><span>${esc(runtime.toast)}</span></div>`:''}</div>`
}
function shell(content,title='',crumb=''){const account=V.Auth?.user?'회원':'게스트';return `<div class="app"><aside class="side"><div class="brand"><span class="brand-mark">✓</span><div><b>소방합격</b></div></div><nav class="nav">${NAV.map(navButton).join('')}</nav><div class="side-foot"><button class="account-chip" data-account><b>${esc(account)}</b></button></div></aside><main class="main page-${state().page} ${state().page==='exam'&&runtime.exam?'exam-active':''}"><header class="top"><h1>${esc(title||NAV.find(x=>x[0]===state().page)?.[2]||'119')}</h1><span class="spacer"></span><button class="btn small ghost" data-account>${V.Auth?.isGuest?'계정':'회원'}</button></header><section class="page">${content}</section><nav class="mobile-nav" aria-label="주요 메뉴"><button class="${state().page==='home'?'active':''}" ${state().page==='home'?'aria-current="page"':''} data-go="home">홈</button><button class="${state().page==='study'?'active':''}" ${state().page==='study'?'aria-current="page"':''} data-go="study">학습</button><button class="${state().page==='exam'?'active':''}" ${state().page==='exam'?'aria-current="page"':''} data-go="exam">시험</button><button class="${state().page==='wrong'?'active':''}" ${state().page==='wrong'?'aria-current="page"':''} data-go="wrong">오답</button><button data-more>더보기</button></nav></main>${runtime.more?moreSheet():''}${runtime.account?accountModal():''}${runtime.toast?`<div class="app-toast" role="status" aria-live="polite" aria-atomic="true"><span>${esc(runtime.toast)}</span>${runtime.toastAction?`<button class="app-toast-action" data-toast-action>${esc(runtime.toastAction.label)}</button>`:''}</div>`:''}</div>`}
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
function correctionHomeCard(){
const c=V.CorrectionLoopV64?.summary?.(state()),rows=c?.top?.slice(0,3)||[];
if(!rows.length)return'';
return `<section class="card correction-v64-card correction-v64-home"><div class="toolbar"><div><span class="eyebrow">V64 취약점 교정</span><b>오늘 먼저 고칠 약점</b></div><span class="spacer"></span><span class="tag">교정중 ${c.active}</span></div><div class="correction-v64-list">${rows.map(x=>`<div class="correction-v64-row"><button class="correction-v64-main" data-concept="${esc(x.conceptId)}"><span><b>${esc(x.title)}</b><small>${esc(x.scopeTitle)} · 최근 ${x.recentCorrect}/${x.recentAttempts} · 확실 ${x.sureCorrect}</small></span><span class="correction-v64-progress">${x.progress}%</span></button><button class="btn small primary" data-v64-train="${esc(x.conceptId)}">재검증</button></div>`).join('')}</div><small class="muted">완료 기준: 최근 5문제 중 4정답 · 확실 3개 이상 · 미해결 오답 0개</small></section>`
}
function home(){
const r=V.Mastery.readiness(),goal=V.Mastery.dailyGoalSummary(6),plan=goal.rows,last=state().examHistory.slice(-1)[0],wrongN=state().wrongs.filter(x=>!x.resolved).length,sched=officialScheduleState(),next=plan.find(x=>!x.done)?.concept||plan[0]?.concept;
const remainingMin=goal.total?Math.max(0,Math.round((state().profile.dailyMinutes||40)*(goal.remaining/goal.total))):0;
const scheduleNote=sched.written?`필기 ${esc(sched.written)} · ${esc(ddayText(sched.dday))}`:'공식 일정 대기 중';
return shell(`<div class="dashboard-home dashboard-home-compact home-main screen-scroll" data-scroll-owner="home"><section class="dashboard-topline"><div class="dashboard-titleline"><span class="eyebrow">공식 일정</span><h2>${esc(sched.year)} 소방공무원 시험</h2><strong class="dashboard-dday-inline">${esc(ddayText(sched.dday))}</strong><span class="dashboard-schedule-inline">${scheduleNote}</span></div><div class="dashboard-actions-compact"><button class="btn primary" data-concept="${esc(next?.id||V.curriculum.concepts[0]?.id||'')}">이어서 학습</button><button class="btn" data-go="exam">모의고사</button></div></section><div class="dashboard-statline" aria-label="학습 요약"><span><small>진도</small><b>${r.scopeCoverage}%</b></span><span><small>복습</small><b>${r.overdue}</b></span><span><small>오답</small><b>${wrongN}</b></span><span><small>최근 시험</small><b>${last?last.score+'점':'-'}</b></span></div>${correctionHomeCard()}<section class="card daily-goal-card"><div class="toolbar daily-goal-head"><div><b>오늘의 목표</b><small class="tiny muted">${goal.remaining?'남은 '+goal.remaining+'개 · 약 '+remainingMin+'분':'오늘 목표 완료'}</small></div><span class="spacer"></span><strong>${goal.percent}%</strong><button class="btn small ghost" data-goal-editor>${runtime.goalEditor?'닫기':'편집'}</button></div><div class="daily-goal-progress" role="progressbar" aria-label="오늘 목표 진도" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${goal.percent}"><i style="width:${goal.percent}%"></i></div><div class="daily-goal-subjects"><span>소방학 <b>${goal.fire.done}/${goal.fire.total}</b></span><span>구급 <b>${goal.ems.done}/${goal.ems.total}</b></span></div>${dailyGoalEditor()}<div class="today-list daily-goal-list">${plan.length?plan.map(x=>`<div class="today-item daily-goal-item ${x.done?'done':''}"><button class="goal-check" data-goal-toggle="${esc(x.concept.id)}" aria-label="${x.done?'완료 해제':'완료 처리'}">${x.done?'✓':'○'}</button><button class="today-main" data-concept="${esc(x.concept.id)}"><div><b>${esc(x.concept.title)}</b><small>${esc(x.concept.scopeTitle||'')} · ${esc(x.reason||'학습')}</small></div><span>›</span></button><button class="goal-remove" data-goal-remove="${esc(x.concept.id)}" aria-label="오늘 목표에서 제거">×</button></div>`).join(''):'<div class="empty compact">오늘 목표가 비어 있습니다. 편집에서 단원을 추가하세요.</div>'}</div></section></div>`,'홈')
}
function outline(){
const subj=state().subject,scopes=subj==='fire'?V.curriculum.fire:V.curriculum.ems,q=studyNorm(runtime.outlineQuery||''),groups=[],hits=[];
for(let si=0;si<scopes.length;si++){
const sc=scopes[si],scopeHit=!!q&&studyNorm(sc.title).includes(q),concepts=[];
for(let i=0;i<sc.concepts.length;i++){
const title=sc.concepts[i],id=`${sc.id}-C${String(i+1).padStart(2,'0')}`,match=!q||scopeHit||studyNorm(title).includes(q);
if(match){concepts.push({id,title,i});hits.push(id)}
}
if(!q||concepts.length)groups.push({sc,si,concepts})
}
const body=groups.length?groups.map(({sc,si,concepts})=>`<div class="scope"><button class="${sc.id===state().scopeId?'on':''}" data-scope="${sc.id}"><b>${si+1}. ${esc(sc.title)}</b></button><div class="concepts">${concepts.map(x=>`<button class="${x.id===state().conceptId?'on':''}" data-concept="${x.id}">${x.i+1}. ${esc(x.title)}</button>`).join('')}</div></div>`).join(''):'<div class="empty compact outline-empty">검색 결과가 없습니다.</div>';
return `<div class="backdrop ${state().outline?'on':''}" data-outline-close></div><aside class="outline ${state().outline?'open':''}"><div class="outline-head"><div><b>목차</b><small>${subj==='fire'?'소방학개론':'응급처치학개론'}</small></div><span class="spacer"></span><button class="btn small ghost" data-outline-close>닫기</button></div><div class="outline-subject"><div class="seg"><button class="${subj==='fire'?'on':''}" data-subject="fire">소방학</button><button class="${subj==='ems'?'on':''}" data-subject="ems">응급처치</button></div></div><div class="outline-search-panel"><div class="outline-search-wrap"><input class="input outline-search" data-outline-search value="${esc(runtime.outlineQuery||'')}" placeholder="개념·단원 검색" aria-label="개념과 단원 검색">${runtime.outlineQuery?`<button class="btn small ghost" data-outline-search-clear>초기화</button>`:''}</div>${q?`<small class="outline-search-count">검색 결과 ${hits.length}개</small>`:''}</div><div class="outline-list">${body}</div></aside>`
}
function sectionTitle(v){const raw=String(v||'개념').trim();return /개념\s*이해|개념\s*구조|읽는\s*순서|학습\s*순서|개념\s*구조와\s*읽는\s*순서/.test(raw)?'개념':raw}
function studentStudyText(v){return String(v||'')
.replace(/개념\s*구조와\s*읽는\s*순서/gi,'')
.replace(/^세부\s*\d+\s*[:：.\-]\s*/i,'')
.replace(/\(?\s*(?:교재|원문)\s*\d+(?:\s*[~–-]\s*\d+)?\s*(?:p|페이지|쪽)\s*\)?\s*[·,:;-]?\s*/gi,'')
.replace(/\(?\s*(?:20\d{2}\s*)?(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+|소방법령\s*\d+)\s*(?:교재\s*)?\d+(?:\s*[~–-]\s*\d+)?\s*(?:p|페이지|쪽)\s*\)?\s*[·,:;-]?\s*/gi,'')
.replace(/\b20\d{2}\s*(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+|소방법령\s*\d+)\s*(?:기준으로|기준에서|에\s*따르면|에서는?)\s*/gi,'')
.replace(/(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+|소방법령\s*\d+)\s*(?:기준으로|기준에서|에\s*따르면|에서는?)\s*/gi,'')
.replace(/(?:연결된\s*)?(?:공식\s*)?(?:교재|원문|학습팩|근거)(?:\s*근거)?\s*(?:에서는?|에\s*따르면|에서|은|는)\s*/gi,'')
.replace(/\s*교재의\s*정의(?:이)?다\.?/gi,'')
.replace(/\[\s*\]/g,'').replace(/\s{2,}/g,' ').replace(/^[·,:;\-\s]+/,'').trim()}
function studentQuestionText(v){return studentStudyText(v).replace(/([“\"]?)\s*(?:교재|공식\s*교재|공식\s*근거|원문)\s*(?:에서는?|에\s*따르면|에서)?\s*/gi,'$1').replace(/\s{2,}/g,' ').trim()}
function studyNorm(v){return String(v||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'')}
function sameStudyText(a,b){const x=studyNorm(a),y=studyNorm(b);if(!x||!y)return false;if(x===y)return true;const min=Math.min(x.length,y.length),max=Math.max(x.length,y.length);return min>=24&&min/max>=.82&&(x.includes(y)||y.includes(x))}
function numericTokens(v){return (studentStudyText(v).match(/\d+(?:\.\d+)?/g)||[]).join('|')}
function studyGramDice(a,b){const x=studyNorm(a),y=studyNorm(b);if(x.length<4||y.length<4)return 0;const grams=s=>{const m=new Map;for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1)}return m},A=grams(x),B=grams(y);let hit=0,total=0;for(const n of A.values())total+=n;for(const n of B.values())total+=n;for(const [g,n] of A)hit+=Math.min(n,B.get(g)||0);return total?2*hit/total:0}
const STUDY_FACT_STOP=new Set(['정답','오답','교재','공식','핵심','시험','주의','내용','한다','된다','있다','있으며','것이다','등','경우','대한','위한','통해','각각']);
function studyFactWord(v){let x=String(v||'').toLowerCase().replace(/(?:119|112)(?=\s*(?:안전센터|구조대|구급대|지역대|출장소|구조구급센터|종합상황실|신고|구조|구급))/g,'');if(x.length>=3)x=x.replace(/(?:으로는|에서는|에게서|으로|에서|에게|에는|까지|부터|보다|처럼|은|는|이|가|을|를|과|와|의|에|로|도|만)$/,'');return x}
function studyFactWords(v){const out=new Set;for(const raw of studentStudyText(v).split(/[\s·,()\/→←:=+\-–~]+/)){const x=studyFactWord(raw).replace(/[^0-9a-z가-힣%℃]+/g,'');if(x.length>=2&&!STUDY_FACT_STOP.has(x))out.add(x)}return out}
function studyTokenCoverage(a,b){const A=studyFactWords(a),B=studyFactWords(b);if(!A.size||!B.size)return 0;let hit=0;for(const x of A)if(B.has(x))hit++;return hit/Math.min(A.size,B.size)}
function sameCriterionFact(a,b){const na=numericTokens(a),nb=numericTokens(b);return !!na&&na===nb&&studyGramDice(a,b)>=.46}
function sameStudyFact(a,b){if(sameStudyText(a,b)||sameCriterionFact(a,b))return true;const x=studyNorm(a),y=studyNorm(b);if(!x||!y)return false;const min=Math.min(x.length,y.length);if(min>=14&&studyGramDice(a,b)>=.78)return true;return min>=10&&studyTokenCoverage(a,b)>=.78&&studyGramDice(a,b)>=.48}
function sameStudyFactCross(a,b){if(sameStudyFact(a,b))return true;const x=studyNorm(a),y=studyNorm(b),min=Math.min(x.length,y.length);return min>=18&&studyTokenCoverage(a,b)>=.66&&studyGramDice(a,b)>=.42}
function numericTokenSet(v){return new Set(numericTokens(v).split('|').filter(Boolean))}
function sameNumericSignature(a,b){const A=numericTokenSet(a),B=numericTokenSet(b);if(!A.size||!B.size||A.size!==B.size)return false;for(const x of A)if(!B.has(x))return false;return true}
function addsNumericCriterion(base,detail){const a=numericTokenSet(base),b=numericTokenSet(detail);return [...b].some(x=>!a.has(x))}
function uniqueTextRows(rows=[],seed=''){const out=[];for(const row of rows){if(!row||sameStudyFact(row,seed)||out.some(x=>sameStudyFact(x,row)))continue;out.push(row)}return out}
function uniqueCriterionRows(rows=[]){const out=[];for(const row of rows){if(!row||out.some(x=>sameStudyFact(x,row)))continue;out.push(row)}return out}
const DETAIL_META_SECTION_RE=/^(?:개념\s*구조와\s*읽는\s*순서|핵심\s*포인트\s*연결|문제\s*적용과\s*난이도\s*대응|공식\s*원문으로\s*복귀하는\s*기준|회상\s*루프)$/;
function uniqueSections(rows=[]){const out=[];for(const row of rows){if(!row?.body||DETAIL_META_SECTION_RE.test(String(row.title||'').trim()))continue;if(out.some(x=>sameStudyFact(x.body,row.body)))continue;out.push(row)}return out}
function coreEssentialRows(pack){
const quick=pack?.studySchema?.quick30||pack?.summary||'',numbers=(V.StudyEmphasis119?.numberRows?.(pack,16)||[]).map(studentStudyText).filter(Boolean),comparisonFacts=(pack?.compare||[]).filter(x=>Array.isArray(x)&&x[0]&&x[1]).map(x=>studentStudyText(x[0])+' '+studentStudyText(x[1]));
const candidates=[
...(V.StudyEmphasis119?.mustRows?.(pack)||[]).map((text,index)=>({text,bucket:'must',index})),
...(V.StudyEmphasis119?.featureRows?.(pack)||[]).map((text,index)=>({text,bucket:'feature',index}))
],rows=[];
for(const row of candidates){
const text=studentStudyText(row.text);
if(!text||sameStudyFact(text,quick)||numbers.some(n=>sameStudyFact(text,n))||comparisonFacts.some(x=>sameStudyFactCross(text,x))||rows.some(x=>sameStudyFact(x.text,text)))continue;
rows.push({...row,text});if(rows.length>=5)break
}
return rows
}
function coreNumberRows(pack){
if(pack?.detailCriteriaOwner==='detail')return[];
const seeds=[pack?.studySchema?.quick30||pack?.summary||'',...coreEssentialRows(pack).map(x=>x.text)].map(studentStudyText).filter(Boolean),compareBodies=(pack?.compare||[]).filter(x=>Array.isArray(x)&&x[1]).map(x=>studentStudyText(x[1])).filter(Boolean),rows=[];
for(const raw of V.StudyEmphasis119?.numberRows?.(pack,18)||[]){
const text=studentStudyText(raw);
if(!text||!V.StudyEmphasis119?.isNumericCriterion?.(text)||seeds.some(x=>sameStudyFact(x,text))||compareBodies.some(x=>sameStudyText(x,text)||sameNumericSignature(x,text))||rows.some(x=>sameStudyFact(x,text)))continue;
rows.push(text);if(rows.length>=6)break
}
return rows
}
function coreTrapRows(pack){
const seeds=[pack?.studySchema?.quick30||pack?.summary||'',...coreEssentialRows(pack).map(x=>x.text),...coreNumberRows(pack)].map(studentStudyText).filter(Boolean),rows=[];
for(const raw of V.StudyEmphasis119?.trapRows?.(pack)||[]){const text=studentStudyText(raw);if(!text||seeds.some(x=>sameStudyFact(x,text))||rows.some(x=>sameStudyFact(x,text)))continue;rows.push(text);if(rows.length>=3)break}
return rows
}
function coreHighlightTerms(pack){
const a=[...(pack?.compare||[]).map(x=>x?.[0]),...(pack?.must||[]).flatMap(x=>String(x||'').split(/\s*(?:→|:|=|·)\s*/))];
return[...new Set(a.map(x=>String(x||'').replace(/^[★☆\d.\s-]+/,'').trim()).filter(x=>x.length>=2&&x.length<=12&&!/^(정의|핵심|시험|주의|원칙|방법|내용)$/.test(x)))].sort((a,b)=>b.length-a.length).slice(0,12)
}
const STUDY_NUMBER_TOKEN_RE=/(?:\d+(?:[.,]\d+)?(?:\s*(?:~|–|-|:|×|\/)\s*\d+(?:[.,]\d+)?)?\s*(?:%|℃|°C|°|㎥|㎡|cm|mmHg|mm|kg\/㎠|kg|mg\/kg|mg|mL|L\/min|L|m\/s|m|psi|J\/kg|J|kW(?:\/㎡)?|회\/분|회|분|초|시간|일|개월|년|세|명|개|대|주기|배|단계|요소|류|급|종))|(?:\d+\s*:\s*\d+)/g;
function studyNumberMatch(v){const t=studentStudyText(v);if(!V.StudyEmphasis119?.isNumericCriterion?.(t))return'';return(t.match(STUDY_NUMBER_TOKEN_RE)||[])[0]||''}
function studyHighlight(v,pack){
const t=studentStudyText(v),a=coreHighlightTerms(pack).filter(x=>t.includes(x)).slice(0,2),n=studyNumberMatch(t),terms=[...new Set([...a,n].filter(Boolean))].slice(0,3).sort((x,y)=>y.length-x.length);
if(!terms.length)return esc(t);
const escaped=terms.map(x=>x.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')),re=new RegExp('('+escaped.join('|')+')','g');
return t.split(re).map((x,i)=>i%2?`<span class="study-key-emphasis ${/\d/.test(x)?'study-key-number':'study-key-term'}">${esc(x)}</span>`:esc(x)).join('')
}
function numberHighlight(v){
const t=studentStudyText(v),n=studyNumberMatch(t);
if(!n)return esc(t);
const i=t.indexOf(n);return esc(t.slice(0,i))+`<span class="study-key-emphasis study-key-number">${esc(n)}</span>`+esc(t.slice(i+n.length))
}
function detailSeedCovers(text,seed){
const a=studyNorm(text),b=studyNorm(seed);if(!a||!b)return false;
return a===b||(a.length>=12&&b.includes(a))||sameStudyFactCross(text,seed)
}
function trimCoveredLeadClause(text,seeds=[]){
const t=studentStudyText(text),cuts=[...t.matchAll(/,\s+|하고\s+|하며\s+/g)].slice(0,3);
for(const m of cuts){const prefix=t.slice(0,m.index).trim(),tail=t.slice(m.index+m[0].length).trim();if(prefix&&tail&&seeds.some(seed=>detailSeedCovers(prefix,seed)&&!addsNumericCriterion(seed,prefix)))return tail}
return t
}
function detailFragmentText(v,seeds=[]){
let text=studentStudyText(v);if(!text)return'';
for(const seed of seeds){const s=studentStudyText(seed);if(s.length>=4&&text.toLowerCase().includes(s.toLowerCase()))text=text.replace(s,'').replace(/^[\s·,:;→←+\/-]+|[\s·,:;→←+\/-]+$/g,'').trim()}
if(!text)return'';
const segments=text.split(/\s+·\s+/).map(studentStudyText).filter(Boolean),kept=[];
for(const segment of segments.length?segments:[text]){
const part=trimCoveredLeadClause(segment,seeds);if(!part)continue;
const covered=seeds.some(seed=>detailSeedCovers(part,seed)&&!addsNumericCriterion(seed,part));
if(!covered&&!kept.some(x=>sameStudyFactCross(x,part)))kept.push(part)
}
const out=kept.join(' · ').trim();return out&&seeds.some(seed=>detailSeedCovers(out,seed)&&!addsNumericCriterion(seed,out))?'':out
}
function detailOnlyText(v,seeds=[]){
const text=studentStudyText(v);if(!text)return'';
const sentences=text.split(/(?<=[.!?。])\s+/).map(studentStudyText).filter(Boolean),kept=[];
for(const sentence of sentences.length?sentences:[text]){
const part=detailFragmentText(sentence,[...seeds,...kept]);if(part)kept.push(part)
}
return kept.join(' ').trim()
}
const DETAIL_TYPE_RULES={
hazmat:[['품명 · 분류',/품명|제[1-6]류|분류|산화성|가연성|금수성|인화성|자기반응성/],['성질 · 위험성',/성질|위험|발화|폭발|산화|환원|혼촉|증기/],['저장 · 취급',/저장|취급|보관|격리|용기|누설|습기|점화원/],['소화 · 대응',/소화|주수|냉각|질식|포|분말|마른모래|대응/],['지정수량 · 기준',/지정수량|기준수량|수량|kg|㎥|\bL\b|배수/],['예외 · 주의',/예외|주의|금지|함정|피해야|혼동/]],
facility:[['목적 · 기능',/목적|기능|용도|역할/],['구성요소',/구성|요소|장치|배관|밸브|헤드|감지기|수신기|발신기|중계기/],['작동 원리',/작동|원리|신호|방수|압력|감지|연동/],['종류 · 구분',/종류|형식|분류|습식|건식|준비작동|일제살수|P형|R형|GP형|GR형/],['설치 · 기준',/설치|기준|거리|면적|높이|수치/],['점검 · 주의',/점검|시험|유지|관리|주의|함정|예외/]],
governance:[['조직 · 기관',/기관|조직|통제단|본부|위원회|소방청|소방본부|소방서/],['역할 · 권한',/역할|권한|책임|임무|지휘|총괄|조정/],['운영 · 절차',/운영|절차|보고|대응|복구|동원|협업/],['법적 기준',/법|시행령|조문|기준|요건/],['구분 · 비교',/구분|비교|차이|혼동/]],
law:[['적용 · 정의',/정의|적용|대상|범위/],['주체 · 책임',/주체|기관|책임|권한|의무/],['요건 · 기준',/요건|기준|수치|기간|횟수/],['절차',/절차|신고|승인|검사|보고|처분/],['예외 · 주의',/예외|주의|금지|제외|함정/]],
emsCondition:[['정의 · 원인',/정의|원인|병태|기전/],['증상 · 징후',/증상|징후|소견|호소/],['평가',/평가|병력|검진|활력|의식/],['처치',/처치|산소|기도|투여|고정|이송/],['위험신호 · 금기',/위험|금기|악화|즉시|주의|예외/]],
emsProcedure:[['목적 · 적응',/목적|적응|필요|대상/],['준비 · 평가',/준비|평가|확인|장비/],['시행 순서',/순서|절차|시행|단계|방법/],['재평가 · 이송',/재평가|관찰|이송|기록/],['금기 · 주의',/금기|주의|위험|합병증|예외/]],
emsAssessment:[['평가 목적',/목적|평가/],['평가 순서',/순서|단계|1차|2차|ABCDE|OPQRST|SAMPLE/],['확인 항목',/병력|신체검진|생체징후|의식|동공/],['위험 신호',/위험|생명위협|중증|응급/],['재평가',/재평가|반복|변화|이송/]],
phenomenon:[['발생 조건',/조건|원인|요인/],['발생 원리',/원리|기전|발생|반응|전파/],['진행 과정',/진행|단계|과정|시기/],['징후',/징후|전조|연기|불꽃|온도/],['위험 · 대응',/위험|대응|환기|진입|소화|안전/],['비교',/비교|차이|구분/]],
history:[['시대 · 연혁',/시대|연도|설치|개편|변천|연혁/],['주요 조직 · 제도',/조직|도감|소방서|소방청|경방단|방공단|제도/],['변화의 의미',/의미|전환|독립|자치|국가|발전/],['시험 비교',/비교|순서|옳지|혼동|주의/]],
organizationTheory:[['정의 · 원리',/정의|원리|이론|원칙/],['장점',/장점|효율|효과/],['한계',/한계|단점|문제/],['현장 적용',/적용|조직|지휘|관리/],['비교 · 구분',/비교|구분|차이|혼동/]],
suppression:[['정의 · 목적',/정의|목적|소화|약제/],['소화 원리',/냉각|질식|제거|부촉매|억제|원리/],['성질 · 특징',/성질|특징|물성|장점/],['적응 · 사용',/적응|적용|사용|화재|방사/],['제한 · 주의',/제한|주의|금지|부식|독성|예외/],['비교 · 구분',/비교|종류|구분|차이/]],
investigation:[['목적 · 원칙',/목적|원칙|조사/],['현장 보존',/현장|보존|통제|안전/],['조사 절차',/절차|순서|발화부|원인|감식/],['증거 · 판단',/증거|패턴|소훼|탄화|판단/],['기록 · 피해',/기록|피해|산정|보고/],['시험 주의',/주의|예외|자격|위촉|함정/]],
emsSystem:[['체계 · 정의',/체계|정의|응급의료|구급/],['기관 · 역할',/기관|구급대|응급구조사|의료기관|역할/],['법적 책임',/법|책임|업무범위|의무|권한/],['운영 · 통신',/운영|통신|기록|이송|연계/],['시험 구분',/구분|비교|주의|예외/]],
emsAnatomy:[['구조',/구조|해부|기관|뼈|근육|혈관|신경/],['기능 · 생리',/기능|생리|순환|호흡|신경/],['정상 기준',/정상|수치|범위|기준/],['임상 연결',/증상|평가|손상|질환|임상/],['시험 주의',/주의|혼동|비교/]],
emsTrauma:[['손상 기전',/기전|충돌|추락|압좌|관통|손상/],['평가',/평가|ABCDE|신체검진|순환|감각/],['증상 · 징후',/증상|징후|변형|통증|출혈/],['처치 · 고정',/처치|고정|부목|지혈|이송/],['합병증 · 위험',/합병증|위험|쇼크|신경|혈관/],['시험 주의',/주의|금기|예외|함정/]],
emsResuscitation:[['심정지 인지',/인지|반응|호흡|맥박|심정지/],['소생술 순서',/순서|가슴압박|인공호흡|CPR|심폐소생/],['압박 · 환기 기준',/깊이|속도|비율|환기|분당/],['AED · 제세동',/AED|제세동|충격|리듬/],['특수 상황',/소아|영아|임신|이송|기계식/],['중단 · 주의',/중단|주의|금기|예외/]],
equipment:[['목적 · 용도',/목적|용도|장비|기능/],['구성 · 종류',/구성|종류|부품|규격/],['적응증',/적응|대상|필요/],['사용 방법',/사용|방법|순서|설정|압력|유량/],['점검 · 관리',/점검|관리|세척|보관/],['주의 · 금기',/주의|금기|위험|예외/]]
};
function detailSemanticTitle(c,v){
const t=String(v||''),type=V.ConceptArchitecture119?.typeOf?.(c?.id)||'';
for(const [title,re] of DETAIL_TYPE_RULES[type]||[])if(re.test(t))return title;
if(/종류|분류|구분|나뉜|형태/.test(t))return'종류 · 구분';
if(/구성|요소|장치|기관|조직/.test(t))return'구성 · 역할';
if(/목적|기능|의의|효과/.test(t))return'목적 · 기능';
if(/수치|시간|거리|농도|온도|압력|비율|이상|이하/.test(t))return'수치 · 기준';
if(/예외|금지|주의|오류|함정/.test(t))return'예외 · 주의';
if(/특징|성질|증상|징후|소견|기준|위험/.test(t))return'특징 · 판단기준';
return type==='hazmat'?'성질 · 시험 포인트':type==='facility'?'설비 상세':type.startsWith('ems')?'평가 · 처치 상세':'상세 해설'
}
function detailSectionTitle(c,v,body=''){
const raw=sectionTitle(v).replace(/핵심\s*정리/g,'상세 정리').replace(/핵심\s*포인트/g,'상세 포인트').replace(/핵심/g,'').replace(/\s{2,}/g,' ').trim(),generic=/^(상세 설명|정의 · 상세|원인 · 조건|진행 · 절차|핵심 해설)$/;
return !raw||generic.test(raw)?detailSemanticTitle(c,body||raw):raw
}
function detailGroups(c,rows=[],seeds=[]){const g=new Map;for(const x of uniqueTextRows(rows)){const body=detailOnlyText(x,seeds);if(!body)continue;const k=detailSemanticTitle(c,body),a=g.get(k)||[];a.push(body);g.set(k,a)}return[...g].map(([title,bullets])=>({title,body:'',bullets}))}
function detailSortRows(c,rows=[]){
const type=V.ConceptArchitecture119?.typeOf?.(c?.id)||'',order=(DETAIL_TYPE_RULES[type]||[]).map(x=>x[0]);
return rows.map((row,index)=>{const sample=[row?.title,row?.body,...(row?.bullets||[])].filter(Boolean).join(' '),bucket=detailSemanticTitle(c,sample),rank=order.indexOf(bucket);return{row,index,rank:rank<0?99:rank}}).sort((a,b)=>a.rank-b.rank||a.index-b.index).map(x=>x.row)
}
function schemaDetailRows(c,pack){if(V.ConceptArchitecture119?.get?.(c.id)?.genericSchema!==true)return[];const x=pack?.studySchema||{},rows=[['발생 조건',x.conditions],['작용 원리',x.mechanisms],['시기 · 단계',x.timingStages],['전조 · 위험신호',x.warningSigns],['발생 전 · 후',x.beforeAfter]];return rows.filter(([,v])=>v?.length).map(([title,bullets])=>({title,body:'',bullets}))}
function detailDefinitionText(c,pack,seeds=[]){const s=seeds.map(studentStudyText).filter(Boolean),a=[pack?.studySchema?.definition,...(pack?.detail||[]),...(pack?.deepSections||[]).map(x=>x?.body),pack?.summary].map(studentStudyText).filter(Boolean);for(const x of a){const b=detailOnlyText(x,s);if(b&&!s.some(y=>sameStudyFact(y,b)))return b}return''}
function detailDefinitionBlock(c,body){
if(!body)return'';
const stem=String(c?.title||'개념').replace(/\s*(?:개론|원리|이론|기초|개요)\s*$/,'').trim()||String(c?.title||'개념'),title=stem+'의 정의';
return `<section class="detail-section detail-definition" data-detail-section="definition"><div class="detail-copy"><h3>${esc(title)}</h3><p>${esc(body)}</p></div></section>`
}
function detailRowSeedTexts(rows=[]){return rows.flatMap(row=>[row?.body,...(row?.bullets||[])]).map(studentStudyText).filter(Boolean)}
function dedupeDetailRows(rows=[],seeds=[]){const seen=[...seeds].map(studentStudyText).filter(Boolean),out=[];for(const row of rows||[]){let body=detailOnlyText(row?.body,seen),bullets=[];if(body&&seen.some(x=>sameStudyFact(x,body)))body='';for(const raw of uniqueTextRows(row?.bullets||[])){const t=detailOnlyText(raw,[...seen,body,...bullets].filter(Boolean));if(t&&!seen.some(x=>sameStudyFact(x,t))&&!bullets.some(x=>sameStudyFact(x,t)))bullets.push(t)}if(!body&&!bullets.length)continue;out.push({...row,body,bullets});if(body)seen.push(body);seen.push(...bullets)}return out}
function mergeDetailRowsByTitle(c,rows=[]){const out=[],by=new Map;for(const r of rows){const s=r?.body||(r?.bullets||[])[0]||'';let t=detailSectionTitle(c,r?.title||'',s);if(/^(종류 · 구분|비교 · 구분|수치 · 기준|시험 포인트 · 함정\/주의)$/.test(t))t+=' 해설';const k=studyNorm(t);if(!k)continue;if(!by.has(k)){const x={...r,title:t};by.set(k,x);out.push(x);continue}const x=by.get(k),seen=[x.body,...(x.bullets||[])].map(studentStudyText).filter(Boolean);for(const v of [r?.body,...(r?.bullets||[])].map(studentStudyText).filter(Boolean)){if(seen.some(z=>sameStudyFact(z,v)))continue;if(!x.body)x.body=v;else(x.bullets||(x.bullets=[])).push(v);seen.push(v)}x.bullets=uniqueTextRows(x.bullets||[],x.body)}return out}
function detailTrapPriority(text,index=0){const t=String(text||'');let score=0;if(/[→←<>≈]|\d/.test(t))score+=4;if(/먼저|다음|순서|시각|시간|기준|비율|주기|분|초/.test(t))score+=5;if(/금지|않|주의|예외|구분|확인|배제|중단/.test(t))score+=2;return{score,index}}
function detailExamPointRows(pack,seeds=[]){
const all=uniqueTextRows([...(pack?.traps||[])]).map(studentStudyText).filter(Boolean),rows=[];
for(const row of all.map((text,index)=>({text,...detailTrapPriority(text,index)})).sort((a,b)=>b.score-a.score||a.index-b.index)){
if(seeds.some(x=>sameStudyFactCross(x,row.text))||rows.some(x=>sameStudyFactCross(x,row.text)))continue;
rows.push(row.text);if(rows.length>=4)break
}
return rows
}
function detailExamPointBlock(rows=[]){if(!rows.length)return'';return `<section class="detail-exam-points" data-detail-section="traps"><h3>시험 포인트 · 함정/주의</h3><ul>${rows.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`}
function detailCriterionText(raw,seeds=[]){
const text=detailOnlyText(raw,seeds);
if(!text||!V.StudyEmphasis119?.isNumericCriterion?.(text))return'';
return text
}
function detailCriteriaRows(pack,seeds=[]){
const compareBodies=(pack?.compare||[]).filter(x=>Array.isArray(x)&&x[1]).map(x=>studentStudyText(x[1])).filter(Boolean),out=[];
for(const raw of uniqueCriterionRows((V.StudyEmphasis119?.numberRows?.(pack,20)||[]).map(studentStudyText).filter(Boolean))){
const text=detailCriterionText(raw,[...seeds,...out]);
if(!text||compareBodies.some(x=>sameStudyText(x,text)||sameNumericSignature(x,text))||seeds.some(x=>sameStudyFactCross(x,text)&&!addsNumericCriterion(x,text))||out.some(x=>sameStudyFactCross(x,text)))continue;
out.push(text);if(out.length>=12)break
}
return out
}
function detailCriteriaBlock(rows=[]){
if(!rows.length)return'';
return `<section class="detail-criteria" data-detail-section="criteria"><h3>수치 · 기준</h3><ul>${rows.map(x=>`<li>${numberHighlight(x)}</li>`).join('')}</ul></section>`
}
function detailHasUniqueContent(x,seeds=[]){if(!x)return false;if(detailOnlyText(x.body,seeds))return true;return(x.bullets||[]).some(v=>detailOnlyText(v,seeds))}
function detailSectionShouldOpen(title,index=0){return index===0||/비교|구분|분석|시험|함정|주의|예외|수치|기준|금기|변형|오염/.test(String(title||''))}
function detailSection(c,x,index=0){
if(!x)return'';
const raw=String(x.title||'').trim();
if(/개념\s*이해|개념\s*구조|읽는\s*순서|학습\s*순서|개념\s*구조와\s*읽는\s*순서/.test(raw))return'';
const body=detailOnlyText(x.body,[]),bullets=uniqueTextRows((x.bullets||[]).filter(Boolean),x.body).map(studentStudyText).filter(Boolean);
if(!body&&!bullets.length)return'';
const title=detailSectionTitle(c,raw,body||bullets[0]||'');
const isOpen=detailSectionShouldOpen(title,index),opened=isOpen?' open':'';return `<details class="detail-section detail-fold"${opened} data-detail-section="${index}"><summary class="detail-fold-summary"><h3>${esc(title)}</h3><span>${isOpen?'펼쳐짐':'펼쳐보기'}</span></summary><div class="detail-copy">${body?`<p>${esc(body)}</p>`:''}${bullets.length?`<ul class="detail-key-list detail-plain-list">${bullets.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:''}</div></details>`
}
function detailToc(c,model){
const items=[];
if(model.definition)items.push(['definition','정의']);
if(model.compareRows.length)items.push(['comparison','비교 · 구분']);
if(model.criteriaRows.length)items.push(['criteria','수치 · 기준']);
if(model.trapRows.length)items.push(['traps','시험 함정 · 주의']);
for(let i=0;i<model.detailRows.length;i++){const row=model.detailRows[i],sample=row?.body||(row?.bullets||[])[0]||'',title=detailSectionTitle(c,row?.title||'',sample);if(title)items.push([String(i),title])}
const seen=new Set,uniq=items.filter(([,label])=>{const k=studyNorm(label);if(!k||seen.has(k))return false;seen.add(k);return true}).slice(0,8);
return `<nav class="detail-toc" aria-label="상세 바로가기"><div class="detail-toc-row"><b class="detail-toc-label">상세 바로가기</b><div class="detail-toc-chips">${uniq.map(([key,label])=>`<button class="detail-toc-chip" data-detail-jump="${esc(key)}">${esc(label)}</button>`).join('')}</div><button class="btn small ghost detail-source-button" data-source-concept="${esc(c.id)}">원문 근거</button></div></nav>`
}
function visualBlocks(pack){return (pack?.visuals||[]).map(id=>V.Visual119?.render?.(id)||'').join('')}
function hazmatOverviewCard(n,x){
const id=`F05-C${String(Number(n)+1).padStart(2,'0')}`,rows=V.Hazmat2026.itemRows(Number(n)),p=V.contentPacks?.get?.(id)||{},must=(p.must||[]).slice(0,3),trap=(p.traps||[])[0]||'';
return `<article class="hazmat-class-card always-open"><div class="hazmat-class-summary"><span><b>제${n}류 · ${esc(x.nature)}</b><small>${x.items.length}개 품명군</small></span></div><div class="hazmat-class-detail"><div class="hazmat-item-list">${rows.map(r=>`<div><span>${esc(r.name)}</span><b>${Number(r.designated).toLocaleString('ko-KR')} ${esc(r.unit)}</b></div>`).join('')}</div>${must.length?`<div class="hazmat-brief"><b>공통 성질 · 소화 포인트</b><ul>${must.map(v=>`<li>${esc(studentStudyText(v))}</li>`).join('')}</ul></div>`:''}${trap?`<p class="hazmat-trap"><b>시험 주의</b> ${esc(studentStudyText(trap))}</p>`:''}<button class="btn small primary" data-concept="${id}">제${n}류 자세히 학습</button></div></article>`
}
function hazmatBlock(c){
if(c.scopeId!=='F05'||!V.Hazmat2026)return'';
const idx=Number(c.id.split('-C')[1]),classNo=idx>=2&&idx<=7?idx-1:null;
if(idx===1){return `<section class="hazmat-reference"><div class="lesson-heading"><div><span class="eyebrow">위험물 분류</span><h3>제1류~제6류 품명 · 지정수량</h3><p class="muted">펼치지 않아도 각 류의 품명군·지정수량·공통 성질을 바로 볼 수 있습니다.</p></div></div><div class="hazmat-class-grid">${Object.entries(V.Hazmat2026.classes).map(([n,x])=>hazmatOverviewCard(n,x)).join('')}</div></section>`}
if(classNo){const cls=V.Hazmat2026.classes[classNo],rows=V.Hazmat2026.itemRows(classNo);return `<section class="hazmat-reference"><div class="lesson-heading"><div><span class="eyebrow">품명 · 지정수량</span><h3>${esc(cls.name)} ${esc(cls.nature)}</h3></div></div><div class="table-scroll"><table class="hazmat-table"><thead><tr><th>품명</th><th>지정수량</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.name)}</td><td><b>${Number(x.designated).toLocaleString('ko-KR')} ${esc(x.unit)}</b></td></tr>`).join('')}</tbody></table></div>${(cls.notes||[]).length?`<div class="lesson-box"><b>법령상 예외 · 정의</b><ul>${cls.notes.map(x=>`<li>${esc(studentStudyText(x))}</li>`).join('')}</ul></div>`:''}</section>`}
return'';
}
function calculationBlocks(c,pack){
const rows=(pack?.calculations||[]).filter(x=>x&&x.formula);
if(!rows.length)return'';
return rows.map((x,i)=>`<section class="calc-lab" data-calculation-index="${i}"><div class="lesson-heading"><div><span class="eyebrow">계산문제</span><h3>${esc(x.title||'공식 계산')}</h3></div></div><div class="calc-formula">${esc(x.formula)}</div>${x.note?`<div class="calc-example"><b>계산 원칙</b><p>${esc(studentStudyText(x.note))}</p>${x.example?`<p><code>${esc(studentStudyText(x.example))}</code></p>`:''}</div>`:''}</section>`).join('');
}
function quickCoreBlock(c,pack){const text=pack?.studySchema?.quick30||pack?.summary||'';if(!text)return'';const key=V.PassNote?.conceptCoreKey?.(c.id)||'',saved=key&&V.PassNote?.has?.(key);return `<section class="study-quick"><div class="study-quick-title"><span>핵심</span><div class="study-quick-actions"><button class="study-core-save ${saved?'on':''}" data-pass-core="${esc(c.id)}" aria-label="${saved?'합격노트에서 삭제':'합격노트에 추가'}">합격노트 ${saved?'★':'☆'}</button></div></div><p class="lead">${studyHighlight(text,pack)}</p></section>`}
function coreEssentialBlock(c,pack){const rows=coreEssentialRows(pack).slice(0,5);if(!rows.length)return'';return `<section class="study-core-essentials"><div class="study-core-title"><span>시험 핵심</span></div><ul>${rows.map(x=>`<li><span>${esc(x.text)}</span></li>`).join('')}</ul></section>`}
function coreCompareBlock(){return''}
function numberBlock(c,pack){const rows=coreNumberRows(pack);if(!rows.length)return'';return `<section class="study-numbers"><div class="study-numbers-title"><span>숫자 · 단위 · 기준</span></div><ul>${rows.map(x=>`<li><span class="study-key-text">${numberHighlight(x)}</span></li>`).join('')}</ul></section>`}
function trapBlock(pack){
const rows=coreTrapRows(pack);if(!rows.length)return'';
return `<section class="study-traps"><div class="study-traps-title">자주 틀리는 포인트</div><ul>${rows.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`;
}
function detailComparisonRows(pack,seeds=[]){
const out=[];for(const raw of pack?.compare||[]){
if(!Array.isArray(raw)||!raw[0]||!raw[1])continue;
const row=[studentStudyText(raw[0]),studentStudyText(raw[1])],fact=row.join(' ');
if(pack?.hazmatOfficialCommon&&/^\s*\d[\d,.]*\s*(?:kg|L|㎥)?\s*$/i.test(row[1]))continue;
const repeated=seeds.some(x=>sameStudyFactCross(x,row[1])||sameStudyFactCross(x,fact)||sameNumericSignature(x,row[1]));
if(repeated)continue;
if(out.some(x=>sameStudyText(x[0],row[0])&&sameStudyText(x[1],row[1])))continue;
out.push(row)
}
return out
}
function comparisonBlock(c,pack,rows=[]){
if(!rows.length)return'';
const typeLike=rows.length>=2&&/원리|종류|분류|구분/.test(String(c?.title||'')+' '+String(pack.summary||'')),title=c?.id==='F04-C01'?'소화의 종류':typeLike?'종류 · 구분':pack.compareFamily?.title||'비교 · 구분';
return `<section class="detail-compare detail-compare-cards" data-detail-section="comparison"><h3>${esc(title)}</h3><div class="concept-class-grid">${rows.map(r=>`<article class="concept-class-card static"><b>${esc(r[0])}</b><p>${esc(r[1])}</p></article>`).join('')}</div></section>`
}
function buildDetailModel(c,pack){
const seen=[],definition=detailDefinitionText(c,pack,[]),criteriaFirst=pack?.detailCriteriaOwner==='detail';if(definition)seen.push(definition);
let criteriaRows=criteriaFirst?detailCriteriaRows(pack,seen):[];if(criteriaFirst)seen.push(...criteriaRows);
const detail=pack.detail||[],sections=uniqueSections(pack.deepSections||[]),rawRows=[...schemaDetailRows(c,pack),...detailGroups(c,detail,[]),...sections],sorted=detailSortRows(c,rawRows.filter(x=>detailHasUniqueContent(x,[]))),detailRows=mergeDetailRowsByTitle(c,dedupeDetailRows(sorted,seen));
seen.push(...detailRowSeedTexts(detailRows));
const compareRows=detailComparisonRows(pack,seen);seen.push(...compareRows.map(x=>x.join(' ')));
if(!criteriaFirst){criteriaRows=detailCriteriaRows(pack,seen);seen.push(...criteriaRows)}
const trapRows=detailExamPointRows(pack,seen);
return{definition,detailRows,compareRows,criteriaRows,trapRows}
}
function specialCombustibleBlock(pack){
const rows=pack?.specialCombustibles||[],rules=pack?.specialCombustibleStorage||[];if(!rows.length)return'';
return `<section class="hazmat-reference special-combustible-reference"><div class="lesson-heading"><div><span class="eyebrow">현행 기준</span><h3>특수가연물 품명별 기준수량</h3></div></div><div class="table-scroll"><table class="hazmat-table"><thead><tr><th>품명</th><th>기준수량</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x[0])}</td><td><b>${esc(x[1])}</b></td></tr>`).join('')}</tbody></table></div>${rules.length?`<div class="lesson-box"><b>저장·취급 상세</b><ul>${rules.map(x=>`<li>${esc(studentStudyText(x))}</li>`).join('')}</ul></div>`:''}</section>`;
}
function sourceBlock(c,pack){
const links=(pack?.officialLinks||[]).filter(x=>x?.url),evidence=V.StudyEmphasis119?.evidence?.(c.id,pack),source=evidence?.source||pack?.source||'공식 근거',hasPdf=(c?.sourceRanges||[]).some(x=>x?.doc);
const pdfActions=hasPdf?`<div class="source-primary-actions"><button class="btn primary" data-source-concept="${c.id}">PDF 바로보기</button><button class="btn" data-source-download="${c.id}">PDF 다운로드</button></div>`:'<div class="source-connect"><b>공식 웹 근거</b><p>이 개념은 연결된 공식 웹 문서와 출제범위에서 근거를 확인할 수 있습니다.</p></div>';
return `<div class="lesson source-only"><p class="lead">${esc(source)}</p>${pdfActions}${links.length?`<div class="source-law-links"><b>공식 근거</b>${links.map(x=>`<a class="source-law-link" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label)} <span aria-hidden="true">↗</span></a>`).join('')}</div>`:''}</div>`
}
function lessonContent(c,pack,tab){const qs=V.QuestionQuality119?.forConcept(c.id)||[];
if(tab==='detail'){const model=buildDetailModel(c,pack);return `<div class="lesson detail-view detail-type-${esc(V.ConceptArchitecture119?.typeOf?.(c.id)||'general')}">${detailToc(c,model)}${detailDefinitionBlock(c,model.definition)}${model.detailRows.map((x,i)=>detailSection(c,x,i)).join('')}${comparisonBlock(c,pack,model.compareRows)}${detailCriteriaBlock(model.criteriaRows)}${detailExamPointBlock(model.trapRows)}${visualBlocks(pack)}${c.id==='F05-C01'?'':hazmatBlock(c)}${specialCombustibleBlock(pack)}${calculationBlocks(c,pack)}</div>`}
if(tab==='quiz'){
if(!qs.length)return '<div class="lesson quiz-view"><div class="empty book-empty">아직 준비된 문제가 없습니다.</div></div>';
const raw=Number(runtime.studyQuizIndex[c.id]||0),idx=Math.max(0,Math.min(raw,qs.length-1));runtime.studyQuizIndex[c.id]=idx;
const answered=qs.filter(q=>state().answers[q.id]!==undefined).length;
const jumps=qs.map((q,i)=>{const a=state().answers[q.id],status=a===undefined?'':a===q.a?'answered right':'answered wrong';return `<button class="${i===idx?'current':''} ${status}" data-study-quiz-jump="${i}" aria-label="${i+1}번 문제">${i+1}</button>`}).join('');
return `<div class="lesson quiz-view"><div class="quiz-overview"><b>개념 확인 문제</b><span>${answered}/${qs.length} 답변 · 하/중/상 혼합</span></div><div class="study-quiz-jumps" aria-label="개념 문제 빠른이동">${jumps}</div><div class="study-quiz-single">${qcard(qs[idx],true)}</div><div class="study-quiz-pager"><button class="btn" data-study-quiz-prev ${idx===0?'disabled':''}>← 이전 문제</button><div class="study-quiz-progress"><b>${idx+1} / ${qs.length}</b><small>${state().answers[qs[idx].id]===undefined?'미답':state().answers[qs[idx].id]===qs[idx].a?'정답':'오답'}</small></div><button class="btn primary" data-study-quiz-next ${idx>=qs.length-1?'disabled':''}>다음 문제 →</button></div></div>`;
}
if(tab==='source')return sourceBlock(c,pack);
if(tab==='ai')return aiChatBody(c);
return `<div class="lesson core-view">${quickCoreBlock(c,pack)}${coreEssentialBlock(c,pack)}${numberBlock(c,pack)}${trapBlock(pack)}${c.id==='F05-C01'?hazmatBlock(c):''}</div>`;
}
function lessonBook(c,pack){
const tab=STUDY_TABS.some(([k])=>k===state().studyTab)?state().studyTab:'core';
return `<article class="book-mobile"><section class="book-section">${lessonContent(c,pack,tab)}</section></article>`
}
function conceptNeighbors(c){const list=V.curriculum.concepts.filter(x=>x.subject===c.subject),i=list.findIndex(x=>x.id===c.id);return{prev:i>0?list[i-1]:null,next:i>=0&&i<list.length-1?list[i+1]:null}}
function study(){const c=currentConcept(),sc=currentScope(),pack=V.contentPacks.get(c.id),tab=STUDY_TABS.some(([k])=>k===state().studyTab)?state().studyTab:'core',nb=conceptNeighbors(c);if(state().studyTab!==tab){state().studyTab=tab;S.save()}return shell(`<div class="study study-single-scroll" data-scroll-owner="study"><div class="study-toolbar"><button class="btn small" data-outline>목차</button><div class="seg"><button class="${state().subject==='fire'?'on':''}" data-subject="fire">소방학</button><button class="${state().subject==='ems'?'on':''}" data-subject="ems">응급처치</button></div><span class="path">${esc(sc.title)} › ${esc(c.title)}</span></div><div class="workspace study-workspace-single">${outline()}<div class="study-mainpane"><header class="concept-head"><span class="scope-label">${esc(sc.title)}</span><h2>${esc(c.title)}</h2><div class="tabbar">${STUDY_TABS.map(([k,l])=>`<button class="${tab===k?'on':''}" data-study-tab="${k}">${l}</button>`).join('')}</div></header><div class="study-body study-body-unified study-body-desktop study-body-mobile">${lessonContent(c,pack,tab)}${tab==='quiz'?'':`<footer class="actionbar concept-nav concept-nav-single mobile-study-nav"><button class="btn" data-study-prev data-mobile-study-prev ${nb.prev?'':'disabled'}>← 이전 개념</button><button class="btn ghost" data-outline>목차</button><button class="btn primary" data-study-next data-mobile-study-next ${nb.next?'':'disabled'}>다음 개념 →</button></footer>`}</div></div></div></div>`,'학습')}
function qcard(q,inline=false){
const ans=state().answers[q.id],retrying=runtime.retryQuestionId===q.id,done=ans!==undefined&&!retrying,conf=retrying?runtime.retryConfidence:(state().confidence[q.id]||'none'),passKey=V.PassNote?.questionKey?.(q.id)||'',saved=passKey&&V.PassNote?.has?.(passKey),pastTag=q.officialPastExam?`<span class="tag official-past-tag">${esc(q.examYear||'')} 실제 기출</span>${q.currentCompatibility===false?'<span class="tag past-law-warning">시행 당시 기준</span>':''}`:'';
const meta=done?`<div class="toolbar question-result-meta">${pastTag}<span class="tag difficulty-${esc(q.difficulty||V.QuestionDifficulty?.infer(q)||'mid')}">난이도 ${esc(q.difficultyLabel||V.QuestionDifficulty?.levels?.[V.QuestionDifficulty?.infer(q)||'mid']?.label||'중')}</span><span class="spacer"></span><button class="btn small ghost pass-question-btn ${saved?'on':''}" data-pass-question="${esc(q.id)}">${saved?'★':'☆'} 합격노트</button></div>`:`<div class="toolbar question-result-meta">${pastTag}<span class="spacer"></span><button class="btn small ghost pass-question-btn ${saved?'on':''}" data-pass-question="${esc(q.id)}">${saved?'★':'☆'} 합격노트</button></div>`;
const confidence=`<div class="confidence confidence-before-answer" data-confidence-panel="${esc(q.id)}"><span class="tiny muted" style="align-self:center">${done?'기록된 확신도':'답 선택 전 확신도'}</span>${[['sure','확실'],['maybe','애매'],['none','모름']].map(([k,l])=>`<button class="${conf===k?'on':''}" data-confidence="${q.id}:${k}" ${done?'disabled aria-disabled="true"':''}>${l}</button>`).join('')}</div>`;
const choices=`<div class="choices">${q.choices.map((x,i)=>`<button class="choice ${done&&ans===i?'sel':''} ${done&&i===q.a?'correct':''} ${done&&ans===i&&i!==q.a?'wrong':''}" data-answer="${q.id}:${i}" ${done?'disabled aria-disabled="true"':''}>${i+1}. ${esc(studentStudyText(x))}</button>`).join('')}</div>`;
let correctExplain=studentStudyText(q.ex||''),wrongExplain='';if(Array.isArray(q.choiceExplanations)){if(q.choiceExplanations[q.a])correctExplain=studentStudyText(q.choiceExplanations[q.a]);if(done&&ans!==q.a&&q.choiceExplanations[ans])wrongExplain=studentStudyText(q.choiceExplanations[ans])}const distinctWrong=wrongExplain&&!sameStudyFact(wrongExplain,correctExplain);
return `<div class="question-card ${done?'answered':''}" ${inline?'style="margin:0 0 10px"':''}>${meta}<h2>${esc(studentQuestionText(q.q))}</h2>${confidence}${choices}${done?`<div class="answer"><b style="color:${ans===q.a?'var(--green)':'var(--red)'}">${ans===q.a?'정답':'오답'} · ${q.a+1}번</b>${correctExplain?`<p class="answer-ex">${esc(correctExplain)}</p>`:''}${distinctWrong?`<div class="choice-explanations"><div class="choice-explain wrong"><b>${ans+1}번 선택지</b><span>${esc(wrongExplain)}</span></div></div>`:''}<div class="answer-source"><small class="muted">출처: ${esc(q.source)}</small><div class="toolbar"><button class="btn small" data-question-retry="${esc(q.id)}">다시 풀기</button><button class="btn small ghost" data-source-question="${esc(q.id)}" data-source-concept="${esc(q.conceptId)}">원문 근거 보기</button></div></div></div>`:''}</div>`
}
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
function scopeFilterOptions(subject,current='all'){
const scopes=subject==='all'?[...V.curriculum.fire,...V.curriculum.ems]:(subject==='fire'?V.curriculum.fire:V.curriculum.ems);
return '<option value="all">전체 단원</option>'+scopes.map(sc=>`<option value="${esc(sc.id)}" ${current===sc.id?'selected':''}>${esc(sc.title)}</option>`).join('')
}
function bankQuestionRows(){
let qs=runtime.bankConcept?(V.QuestionQuality119?.forConcept(runtime.bankConcept)||[]):(V.questions||[]).filter(q=>V.QuestionQuality119?.isExamStyle(q));
if(runtime.bankFilter==='calc'){
qs=qs.filter(q=>q.type==='계산형');
if(runtime.calcGroup!=='all')qs=qs.filter(q=>(q.calcFamily||calcGroupFor(q))===runtime.calcGroup);
if(runtime.calcStage!=='all')qs=qs.filter(q=>q.calcStage===runtime.calcStage);
return qs
}
if(runtime.bankConcept)return qs;
if(runtime.bankSubject!=='all')qs=qs.filter(q=>q.subject===runtime.bankSubject);
if(runtime.bankScope!=='all')qs=qs.filter(q=>q.scopeId===runtime.bankScope);
if(runtime.bankDifficulty!=='all')qs=qs.filter(q=>(q.difficulty||V.QuestionDifficulty?.infer(q)||'mid')===runtime.bankDifficulty);
if(runtime.bankStatus!=='all')qs=qs.filter(q=>{const a=state().answers[q.id];if(runtime.bankStatus==='unanswered')return a===undefined;if(runtime.bankStatus==='wrong')return a!==undefined&&a!==q.a;if(runtime.bankStatus==='correct')return a!==undefined&&a===q.a;return true});
const query=studyNorm(runtime.bankQuery||'');if(query)qs=qs.filter(q=>{const c=V.curriculum.byId[q.conceptId];return studyNorm([q.q,c?.title,c?.scopeTitle].join(' ')).includes(query)});
return qs
}
function bankFilterBar(count){
if(runtime.bankConcept||runtime.bankFilter==='calc')return'';
return `<section class="question-filter-bar"><div class="question-filter-grid"><label>과목<select class="select" data-bank-filter="subject"><option value="all" ${runtime.bankSubject==='all'?'selected':''}>전체</option><option value="fire" ${runtime.bankSubject==='fire'?'selected':''}>소방학</option><option value="ems" ${runtime.bankSubject==='ems'?'selected':''}>응급처치</option></select></label><label>단원<select class="select" data-bank-filter="scope">${scopeFilterOptions(runtime.bankSubject,runtime.bankScope)}</select></label><label>난이도<select class="select" data-bank-filter="difficulty"><option value="all" ${runtime.bankDifficulty==='all'?'selected':''}>전체</option><option value="low" ${runtime.bankDifficulty==='low'?'selected':''}>하</option><option value="mid" ${runtime.bankDifficulty==='mid'?'selected':''}>중</option><option value="high" ${runtime.bankDifficulty==='high'?'selected':''}>상</option></select></label><label>풀이상태<select class="select" data-bank-filter="status"><option value="all" ${runtime.bankStatus==='all'?'selected':''}>전체</option><option value="unanswered" ${runtime.bankStatus==='unanswered'?'selected':''}>미답</option><option value="wrong" ${runtime.bankStatus==='wrong'?'selected':''}>오답</option><option value="correct" ${runtime.bankStatus==='correct'?'selected':''}>정답</option></select></label></div><div class="question-filter-search"><input class="input" data-bank-query value="${esc(runtime.bankQuery||'')}" placeholder="문제·개념 검색" aria-label="문제와 개념 검색"><button class="btn small ghost" data-bank-filter-reset>초기화</button><span class="pill">${count}문제</span></div></section>`
}
function bank(){
let qs=bankQuestionRows();
const filterUI=bankFilterBar(qs.length);
if(!qs.length)return shell(`<div class="study"><div class="study-toolbar"><b>문제은행</b></div>${filterUI}<div class="empty">선택한 조건에 맞는 문제가 없습니다.</div></div>`,'문제');
runtime.bankIndex=Math.max(0,Math.min(runtime.bankIndex,qs.length-1));
const q=qs[runtime.bankIndex];runtime.questionAt=Date.now();
const concept=runtime.bankConcept?V.curriculum.byId[runtime.bankConcept]:null,filterTitle=runtime.bankFilter==='calc'?'계산 훈련':'',heading=concept?.title||filterTitle||'문제은행';
const allCalc=(V.questions||[]).filter(x=>V.QuestionQuality119?.isExamStyle(x)&&x.type==='계산형');
const calcGroups=runtime.bankFilter==='calc'?['all','hazmat','combustion','heat','foam','oxygen','iv','burn'].map(k=>{const n=allCalc.filter(x=>(k==='all'||(x.calcFamily||calcGroupFor(x))===k)&&(runtime.calcStage==='all'||x.calcStage===runtime.calcStage)).length;return `<button class="calc-chip ${runtime.calcGroup===k?'on':''}" data-calc-group="${k}">${calcGroupLabel(k)} <b>${n}</b></button>`}).join(''):'';
const stageKeys=['all',...(V.CalculationTraining119?.STAGES||[]).map(x=>x[0])];
const calcStages=runtime.bankFilter==='calc'?stageKeys.map(k=>{const n=allCalc.filter(x=>(runtime.calcGroup==='all'||(x.calcFamily||calcGroupFor(x))===runtime.calcGroup)&&(k==='all'||x.calcStage===k)).length;return `<button class="calc-chip ${runtime.calcStage===k?'on':''}" data-calc-stage="${k}">${esc(calcStageLabel(k))} <b>${n}</b></button>`}).join(''):'';
const practiceNote=runtime.bankFilter==='calc'?'<small class="muted calc-practice-note">이해 → 기본 → 단위변환 → 역산 → 함정 → 실전 순서로 반복 연습합니다. 계산 연습용 문제이며 실전 모의고사에는 포함되지 않습니다.</small>':'';
return shell(`<div class="study bank-page screen-scroll ${runtime.bankFilter==='calc'?'calculation-study':''}" data-scroll-owner="bank"><div class="study-toolbar"><b>${esc(heading)}</b><span class="spacer"></span>${(concept||runtime.bankFilter)?'<button class="btn small ghost" data-bank-all>전체 문제</button>':''}</div>${filterUI}${runtime.bankFilter==='calc'?`<div class="calc-filter-wrap"><span class="calc-filter-label">계산 유형</span>${calcGroups}</div><div class="calc-filter-wrap calc-stage-wrap"><span class="calc-filter-label">단계</span>${calcStages}${practiceNote}</div>`:''}<div class="workspace single-pane bank-workspace" style="grid-template-rows:auto 56px"><div class="study-body bank-question-body">${qcard(q)}</div><footer class="actionbar" style="grid-template-columns:1fr auto 1fr"><button class="btn" data-bank-prev ${runtime.bankIndex===0?'disabled':''}>← 이전</button><span class="pill">${runtime.bankIndex+1}/${qs.length}</span><button class="btn primary" data-bank-next ${runtime.bankIndex===qs.length-1?'disabled':''}>다음 →</button></footer></div></div>`,'문제')
}
function wrong(){
const now=Date.now(),all=state().wrongs.filter(w=>!w.resolved),query=studyNorm(runtime.wrongQuery||'');
let ws=all.filter(w=>{const q=V.questionById[w.questionId]||w.questionSnapshot,c=V.curriculum.byId[w.conceptId];if(runtime.wrongSubject!=='all'&&q?.subject!==runtime.wrongSubject)return false;if(runtime.wrongScope!=='all'&&c?.scopeId!==runtime.wrongScope)return false;if(runtime.wrongKind==='danger'&&w.confidence!=='sure')return false;if(runtime.wrongKind==='due'&&Number(w.due||0)>now)return false;if(runtime.wrongKind==='repeat'&&Number(w.wrongCount||1)<2)return false;if(query&&!studyNorm([q?.q,c?.title,c?.scopeTitle].join(' ')).includes(query))return false;return true});
if(runtime.wrongSort==='due')ws.sort((a,b)=>(a.due||0)-(b.due||0));else if(runtime.wrongSort==='recent')ws.sort((a,b)=>(b.lastWrongAt||b.createdAt||0)-(a.lastWrongAt||a.createdAt||0));else ws.sort((a,b)=>(a.confidence==='sure'?-1:1)-(b.confidence==='sure'?-1:1)||(a.due||0)-(b.due||0));
const controls=`<section class="wrong-filter-bar"><div class="wrong-filter-grid"><label>과목<select class="select" data-wrong-filter="subject"><option value="all" ${runtime.wrongSubject==='all'?'selected':''}>전체</option><option value="fire" ${runtime.wrongSubject==='fire'?'selected':''}>소방학</option><option value="ems" ${runtime.wrongSubject==='ems'?'selected':''}>응급처치</option></select></label><label>단원<select class="select" data-wrong-filter="scope">${scopeFilterOptions(runtime.wrongSubject,runtime.wrongScope)}</select></label><label>유형<select class="select" data-wrong-filter="kind"><option value="all" ${runtime.wrongKind==='all'?'selected':''}>전체 오답</option><option value="danger" ${runtime.wrongKind==='danger'?'selected':''}>확신 오답</option><option value="due" ${runtime.wrongKind==='due'?'selected':''}>오늘 복습</option><option value="repeat" ${runtime.wrongKind==='repeat'?'selected':''}>2회 이상 반복</option></select></label><label>정렬<select class="select" data-wrong-filter="sort"><option value="priority" ${runtime.wrongSort==='priority'?'selected':''}>우선순위</option><option value="due" ${runtime.wrongSort==='due'?'selected':''}>복습일</option><option value="recent" ${runtime.wrongSort==='recent'?'selected':''}>최근 오답</option></select></label></div><div class="question-filter-search"><input class="input" data-wrong-query value="${esc(runtime.wrongQuery||'')}" placeholder="오답·개념 검색" aria-label="오답과 개념 검색"><button class="btn small ghost" data-wrong-filter-reset>초기화</button><span class="pill">${ws.length}/${all.length}</span></div></section>`;
if(!all.length)return shell('<div class="empty">현재 오답이 없습니다.</div>','오답');
const list=ws.length?`<div class="list wrong-list">${ws.map(w=>{const q=V.questionById[w.questionId],c=V.curriculum.byId[w.conceptId],due=Number(w.due||0)<=now?'복습 필요':'예정',danger=w.confidence==='sure'?'<span class="tag danger">확신 오답</span>':'';return `<div class="row wrong-row"><div class="wrong-row-head"><b>${esc(studentQuestionText(q?.q||w.questionId))}</b>${danger}</div><small>${esc(c?.scopeTitle||'')} › ${esc(c?.title||'')} · ${due} · 오답 ${Number(w.wrongCount||1)}회</small><div class="toolbar wrong-actions"><button class="btn small primary" data-concept="${w.conceptId}">개념 보기</button><button class="btn small" data-retry="${w.masterQuestionId||w.questionId}">다시 풀기</button><button class="btn small ghost danger" data-wrong-delete="${w.id}">삭제</button></div></div>`}).join('')}</div>`:'<div class="empty">선택한 조건에 맞는 오답이 없습니다.</div>';
return shell(`<div class="screen-scroll" data-scroll-owner="wrong">${controls}${list}</div>`,'오답')
}
function sampleDistinct(arr,n){return [...arr].sort(()=>Math.random()-.5).slice(0,n)}
function sampleByDifficulty(arr,n,level){const desired=level==='low'?{low:.65,mid:.30,high:.05}:level==='high'?{low:.10,mid:.35,high:.55}:{low:.25,mid:.55,high:.20},groups={low:[],mid:[],high:[]};for(const q of arr){const d=q.difficulty||V.QuestionDifficulty?.infer(q)||'mid';(groups[d]||groups.mid).push(q)}const out=[];for(const k of ['low','mid','high']){const want=Math.min(groups[k].length,Math.round(n*desired[k]));out.push(...sampleDistinct(groups[k],want))}const used=new Set(out.map(q=>q.id)),rest=arr.filter(q=>!used.has(q.id));return[...out,...sampleDistinct(rest,Math.max(0,n-out.length))].slice(0,n)}
function recentExamQuestionIds(limit=4){const ids=new Set();for(const h of state().examHistory.slice(-limit))for(const id of h.questionIds||[])ids.add(id);return ids}
function preferFreshPool(arr,n,scopeIds){const recent=recentExamQuestionIds(),fresh=arr.filter(q=>!recent.has(q.id)),covers=scopeIds.every(id=>fresh.some(q=>q.scopeId===id));return fresh.length>=n&&covers?fresh:arr}
function sampleAcrossScopes(arr,n,level,scopeIds){const pool=preferFreshPool(arr,n,scopeIds),out=[],count={},cap=Math.max(1,Math.ceil(n/Math.max(1,scopeIds.length))+1);for(const scope of scopeIds){const q=sampleByDifficulty(pool.filter(x=>x.scopeId===scope),1,level)[0];if(!q)return[];out.push(q);count[scope]=1}const used=new Set(out.map(q=>q.id));while(out.length<n){const eligible=pool.filter(q=>!used.has(q.id)&&(count[q.scopeId]||0)<cap),q=sampleByDifficulty(eligible,1,level)[0];if(!q)break;out.push(q);used.add(q.id);count[q.scopeId]=(count[q.scopeId]||0)+1}return sampleDistinct(out,Math.min(n,out.length))}
function buildMock(mode,level,seed=null){return V.MockExam119?.build?.({mode,level,history:state().examHistory,seed})||[]}
function mockRoundRoot(){
if(!state().mockRounds||typeof state().mockRounds!=='object')state().mockRounds={real:{low:{},mid:{},high:{}},practice:{low:{},mid:{},high:{}}};
for(const mode of ['real','practice']){state().mockRounds[mode]=state().mockRounds[mode]||{};for(const level of ['low','mid','high'])state().mockRounds[mode][level]=state().mockRounds[mode][level]||{}}
return state().mockRounds
}
function mockRoundBucket(mode,level=runtime.examDifficulty){return mockRoundRoot()[mode]?.[level]||{}}
function mockRoundOptions(){return Array.from({length:50},(_,i)=>{const n=i+1;return `<option value="${n}" ${runtime.examRound===n?'selected':''}>${n}회</option>`}).join('')}
function roundSeed(mode,level,round,salt='base'){return V.VariantEngine119?.seedFor?.(S.ownerId,mode,level,round,salt)||Math.abs(String([S.ownerId,mode,level,round,salt].join('|')).split('').reduce((n,ch)=>(n*33+ch.charCodeAt(0))|0,5381))}
function createRoundRecord(mode,level,round,{force=false}={}){
const bucket=mockRoundBucket(mode,level),key=String(round),existing=bucket[key];
if(existing&&!force&&Array.isArray(existing.questionIds)&&existing.questionIds.length===65&&existing.questionIds.every(id=>V.questionById?.[id]))return existing;
const salt=force?'rebuild-'+Date.now():'base',seed=roundSeed(mode,level,round,salt),base=buildMock(mode,level,seed);
if(base.length!==65)return null;
const record={version:'119-v59-round-v1',round,mode,level,seed,questionIds:base.map(q=>q.id),familyIds:base.map(q=>V.VariantEngine119?.familyId?.(q)||q.id),createdAt:Date.now(),rebuiltAt:force?Date.now():null};
bucket[key]=record;S.save();return record
}
function roundQuestions(mode,level,round,{force=false}={}){
const record=createRoundRecord(mode,level,round,{force});if(!record)return null;
const base=record.questionIds.map(id=>V.questionById?.[id]).filter(Boolean);if(base.length!==65)return null;
const qs=mode==='practice'?(V.VariantEngine119?.materializePracticeSet?.(base,record.seed)||base):base;
return{record,base,qs}
}
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
const wrongs=state().wrongs.filter(w=>!w.resolved),wrongIds=new Set(wrongs.flatMap(w=>[w.questionId,w.masterQuestionId].filter(Boolean))),weakConcepts=[...new Set(wrongs.map(w=>w.conceptId))];
if(!weakConcepts.length)return null;
const pool=trainingPool('all').filter(q=>weakConcepts.includes(q.conceptId)),fresh=pool.filter(q=>!wrongIds.has(q.id)),direct=pool.filter(q=>wrongIds.has(q.id));
const seeded=sampleByDifficulty(fresh,Math.min(target,fresh.length),level),used=new Set(seeded.map(q=>q.id)),fill=sampleByDifficulty(direct.filter(q=>!used.has(q.id)),Math.max(0,target-seeded.length),level),qs=sampleDistinct([...seeded,...fill],Math.min(target,pool.length));
return qs.length?{key:'wrong'+target,label:`오답 기반 재시험 ${qs.length}`,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}:null
}
function buildWeakTraining(target=50,level='mid'){
const analyticsIds=V.AnalyticsV61?.analyze?.(state())?.recommendedConceptIds||[],planIds=V.Mastery.todayPlan(Math.min(40,V.curriculum.concepts.length)).map(x=>x.concept.id),ids=[...new Set([...analyticsIds,...planIds])].slice(0,40),pool=trainingPool('all').filter(q=>ids.includes(q.conceptId));
if(!pool.length)return null;
const qs=sampleByDifficulty(pool,Math.min(target,pool.length),level);
return qs.length?{key:'weak'+target,label:`취약점 맞춤시험 ${qs.length}`,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}:null
}
function buildCorrectionTraining(conceptId,target=5,level='mid'){
const concept=V.curriculum.byId?.[conceptId];if(!concept)return null;
const pool=trainingPool('all').filter(q=>q.conceptId===conceptId),wrongFamilies=new Set(state().wrongs.filter(w=>!w.resolved&&w.conceptId===conceptId).flatMap(w=>[w.familyId,w.masterQuestionId,w.questionId].filter(Boolean)));
const fresh=pool.filter(q=>!wrongFamilies.has(q.familyId||q.masterQuestionId||q.id)),direct=pool.filter(q=>!fresh.includes(q));
const desired=Math.min(target,pool.length),first=sampleByDifficulty(fresh,Math.min(desired,fresh.length),level),used=new Set(first.map(q=>q.id)),fill=sampleByDifficulty(direct.filter(q=>!used.has(q.id)),Math.max(0,desired-first.length),level),qs=sampleDistinct([...first,...fill],desired);
if(qs.length<Math.min(3,pool.length))return null;
return{key:'correction:'+conceptId,label:concept.title+' 취약점 교정 '+qs.length,fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,qs}
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
let plan=planKey.startsWith('correction:')?buildCorrectionTraining(planKey.slice(11),5,runtime.examDifficulty):/^wrong(20|50|100)$/.test(planKey)?buildWrongTraining(Number(RegExp.$1),runtime.examDifficulty):planKey==='weak65'?buildWeakTraining(65,runtime.examDifficulty):planKey==='weak'?buildWeakTraining(50,runtime.examDifficulty):planKey.startsWith('skill:')?buildSkillTraining(planKey.slice(6),50,runtime.examDifficulty):buildTraining(planKey,runtime.examDifficulty);
if(!plan?.qs?.length)return toast(planKey.startsWith('wrong')?'누적 오답이 아직 충분하지 않습니다.':'훈련 문제를 구성할 수 없습니다.');
const seed=roundSeed('training',runtime.examDifficulty,Date.now(),plan.key),qs=V.VariantEngine119?.materializePracticeSet?.(plan.qs,seed)||plan.qs;
runtime.exam={id:crypto.randomUUID?crypto.randomUUID():'exam-'+Date.now(),mode:'training',trainingKey:plan.key,title:plan.label,difficulty:runtime.examDifficulty,qs,i:0,startedAt:Date.now(),answers:{},confidence:{},blueprint:{fire:plan.fire,ems:plan.ems,minutes:null,freshWindow:4,training:true,label:plan.label,seed,variantMode:'safe-v59'}};
persistActiveExam();render()
}
function examLevelLabel(level){return({low:'하',mid:'중',high:'상'})[level]||'중'}
function examExportSet(round,level){
const existing=mockRoundBucket('real',level)?.[String(round)],fromSaved=existing?.questionIds?.map(id=>V.questionById?.[id]).filter(Boolean)||[];
if(fromSaved.length===65)return fromSaved;
const qs=buildMock('real',level,roundSeed('real',level,round,'base'));return qs.length===65?qs:[]
}
function examDocSection(round,qs){
const circled=['①','②','③','④'];
const questions=qs.map((q,i)=>`<article class="exam-doc-q"><h3>${i+1}. ${esc(studentQuestionText(q.q))}</h3><ol>${q.choices.map((x,k)=>`<li><b>${circled[k]||k+1}</b> ${esc(studentStudyText(x))}</li>`).join('')}</ol></article>`).join('');
const answers=qs.map((q,i)=>`<tr><td>${i+1}</td><td>${q.a+1}</td><td>${esc(studentStudyText(q.ex||''))}</td></tr>`).join('');
return `<section class="exam-doc-round"><h2>${round}회 · 65문항 / 65분</h2><div class="exam-doc-questions">${questions}</div><h2 class="answer-title">${round}회 정답·해설</h2><table><thead><tr><th>번호</th><th>정답</th><th>해설</th></tr></thead><tbody>${answers}</tbody></table></section>`
}
function examDocHtml(rounds,level,title='소방합격 실전 모의고사'){
const body=rounds.map(x=>examDocSection(x.round,x.qs)).join('');
return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}body{font-family:"Noto Sans KR","Malgun Gothic",sans-serif;color:#17202b;margin:0;background:#fff;font-size:11pt;line-height:1.55}.doc-pad{padding:12mm}.cover{min-height:273mm;display:grid;place-content:center;text-align:center;page-break-after:always}.cover h1{font-size:27pt;margin:0 0 12px}.exam-doc-round{page-break-before:always}.exam-doc-round:first-of-type{page-break-before:auto}.exam-doc-round>h2{border-bottom:2px solid #243d5a;padding-bottom:7px}.exam-doc-q{break-inside:avoid;margin:0 0 11px}.exam-doc-q h3{font-size:11.5pt;margin:0 0 5px}.exam-doc-q ol{list-style:none;margin:0;padding:0 0 0 8px}.exam-doc-q li{margin:2px 0}.answer-title{page-break-before:always}table{width:100%;border-collapse:collapse;font-size:9.5pt}th,td{border:1px solid #b8c2cc;padding:5px 6px;vertical-align:top}th{background:#f2f5f8}td:first-child,td:nth-child(2){width:44px;text-align:center}@media print{body{padding:0}.doc-pad{padding:12mm}}</style></head><body><div class="doc-pad"><section class="cover"><h1>${esc(title)}</h1><p>난이도 ${examLevelLabel(level)} · 실전 65문항 / 65분</p><p>생성일 ${new Date().toLocaleDateString('ko-KR')}</p></section>${body}</div></body></html>`
}
function saveExamBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1800)}
function printExamRound(round,level){const qs=examExportSet(round,level);if(qs.length!==65)throw Error('EXAM_EXPORT_NOT_READY');const html=examDocHtml([{round,qs}],level,`소방합격 실전 모의고사 ${round}회`),w=window.open('','_blank');if(!w)throw Error('POPUP_BLOCKED');try{w.opener=null}catch{}w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch{}},350)}
function downloadExamRoundDoc(round,level){const qs=examExportSet(round,level);if(qs.length!==65)throw Error('EXAM_EXPORT_NOT_READY');const html=examDocHtml([{round,qs}],level,`소방합격 실전 모의고사 ${round}회`);saveExamBlob(new Blob(['\ufeff',html],{type:'application/msword;charset=utf-8'}),`소방합격_모의고사_${String(round).padStart(2,'0')}회_${examLevelLabel(level)}.doc`)}
const ZIP_CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function zipCrc32(bytes){let c=0xffffffff;for(const b of bytes)c=ZIP_CRC_TABLE[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0}
function zipHeader(size){return new Uint8Array(size)}
function zipU16(view,off,v){view.setUint16(off,v,true)}function zipU32(view,off,v){view.setUint32(off,v>>>0,true)}
function storedZip(entries){
const enc=new TextEncoder(),locals=[],centrals=[];let offset=0,centralSize=0;const now=new Date(),dosTime=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1),dosDate=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
for(const entry of entries){const name=enc.encode(entry.name),data=typeof entry.data==='string'?enc.encode(entry.data):entry.data,crc=zipCrc32(data),lh=zipHeader(30),lv=new DataView(lh.buffer);zipU32(lv,0,0x04034b50);zipU16(lv,4,20);zipU16(lv,6,0x0800);zipU16(lv,8,0);zipU16(lv,10,dosTime);zipU16(lv,12,dosDate);zipU32(lv,14,crc);zipU32(lv,18,data.length);zipU32(lv,22,data.length);zipU16(lv,26,name.length);zipU16(lv,28,0);locals.push(lh,name,data);const ch=zipHeader(46),cv=new DataView(ch.buffer);zipU32(cv,0,0x02014b50);zipU16(cv,4,20);zipU16(cv,6,20);zipU16(cv,8,0x0800);zipU16(cv,10,0);zipU16(cv,12,dosTime);zipU16(cv,14,dosDate);zipU32(cv,16,crc);zipU32(cv,20,data.length);zipU32(cv,24,data.length);zipU16(cv,28,name.length);zipU16(cv,30,0);zipU16(cv,32,0);zipU16(cv,34,0);zipU16(cv,36,0);zipU32(cv,38,0);zipU32(cv,42,offset);centrals.push(ch,name);centralSize+=46+name.length;offset+=30+name.length+data.length}
const end=zipHeader(22),ev=new DataView(end.buffer);zipU32(ev,0,0x06054b50);zipU16(ev,4,0);zipU16(ev,6,0);zipU16(ev,8,entries.length);zipU16(ev,10,entries.length);zipU32(ev,12,centralSize);zipU32(ev,16,offset);zipU16(ev,20,0);return new Blob([...locals,...centrals,end],{type:'application/zip'})
}
function downloadExamBundle(level){
const rounds=[];for(let round=1;round<=50;round++){const qs=examExportSet(round,level);if(qs.length!==65)throw Error('EXAM_EXPORT_NOT_READY');rounds.push({round,qs})}
const entries=[{name:`전체본/소방합격_모의고사_전체_50회_${examLevelLabel(level)}.doc`,data:'\ufeff'+examDocHtml(rounds,level,'소방합격 실전 모의고사 전체본 1~50회')}];
for(const x of rounds)entries.push({name:`회차본/${String(x.round).padStart(2,'0')}회/소방합격_모의고사_${String(x.round).padStart(2,'0')}회_${examLevelLabel(level)}.doc`,data:'\ufeff'+examDocHtml([x],level,`소방합격 실전 모의고사 ${x.round}회`)});
entries.push({name:'README.txt',data:'소방합격 모의고사 전체받기\\n- 전체본: 1~50회 통합 한글/Word 호환 문서(.doc)\\n- 회차본: 회차별 개별 문서(.doc)\\n- 선택 난이도: '+examLevelLabel(level)+'\\n'});
saveExamBlob(storedZip(entries),`소방합격_모의고사_전체받기_${examLevelLabel(level)}.zip`)
}
function exam(){
const ready=V.examReadiness(),past=V.OfficialPastExam119,pastN=past?.questions?.length||0;if(runtime.exam)return examRun();
const wrongN=state().wrongs.filter(w=>!w.resolved).length,level=runtime.examDifficulty,round=Math.max(1,Math.min(50,Number(runtime.examRound)||1)),realSaved=!!mockRoundBucket('real',level)[String(round)],practiceSaved=!!mockRoundBucket('practice',level)[String(round)],hub=runtime.examHub==='training'?'training':'mock';
const roundPicker=`<div class="exam-round-picker"><label><b>회차</b><select class="select" data-exam-round>${mockRoundOptions()}</select></label><div class="exam-round-state"><span class="tag">${round}회</span><span>${realSaved?'실전 저장됨':'새 구성'}</span></div></div>`;
const mockPane=`<section class="exam-start card exam-pane"><div class="exam-pane-head"><div><span class="eyebrow">실전 모의고사</span><h2>65문항 · 65분</h2><p>소방학개론 25문항 + 응급처치학개론 40문항</p></div></div>${roundPicker}<div class="difficulty-picker"><b>난이도</b><div class="seg">${[['low','하'],['mid','중'],['high','상']].map(([k,l])=>`<button class="${runtime.examDifficulty===k?'on':''}" data-exam-difficulty="${k}">${l}</button>`).join('')}</div></div>${ready.ready?`<button class="btn primary block exam-main-start" data-exam-start="real">실전 ${round}회 시작</button>`:'<p class="muted exam-wait">실전 문제은행을 준비 중입니다.</p>'}<div class="exam-secondary-actions"><button class="btn" data-exam-start="practice">연습 ${round}회</button>${practiceSaved?`<button class="btn ghost" data-exam-round-reset="practice">연습 새 문제</button>`:''}</div><section class="exam-download-card"><div><b>문제지 다운로드</b><small>현재 회차는 PDF 또는 한글 호환 문서로, 전체받기는 1~50회를 전체본/회차본 폴더로 나눠 ZIP으로 저장합니다.</small></div><div class="exam-download-actions"><button class="btn small" data-exam-print="${round}">현재 회차 PDF</button><button class="btn small" data-exam-doc="${round}">현재 회차 한글(.doc)</button><button class="btn small primary" data-exam-bundle>전체받기 ZIP</button></div></section>${past?.ready?`<div class="official-past-exam-card compact"><div><span class="eyebrow">소방청 공개 실제 기출</span><b>2025 기출 · ${pastN}문항</b></div><button class="btn" data-exam-start="past2025">2025 기출 풀기</button><a href="${esc(past.sourceUrl)}" target="_blank" rel="noopener">원문 확인 ↗</a></div>`:''}</section>`;
const disabled=wrongN===0?'disabled aria-disabled="true"':'';
const trainingPane=`<section class="card training-center exam-pane"><div class="exam-pane-head"><div><span class="eyebrow">문제훈련</span><h2>필요한 훈련만 선택</h2><p class="muted">실전 모의고사와 분리해 과목·오답·취약점 훈련을 진행합니다.</p></div></div><div class="training-group"><b>과목 집중</b><div class="training-grid"><button class="btn" data-training-start="fire50">소방 50</button><button class="btn" data-training-start="fire100">소방 100</button><button class="btn" data-training-start="ems80">구급 80</button><button class="btn" data-training-start="ems120">구급 120</button></div></div><div class="training-group"><b>전범위</b><div class="training-grid three"><button class="btn" data-training-start="all100">100문제</button><button class="btn" data-training-start="all150">150문제</button><button class="btn" data-training-start="all200">200문제</button></div></div><div class="training-group"><b>오답·취약점</b><small class="muted">미해결 오답 ${wrongN}개</small><div class="training-grid three"><button class="btn" data-training-start="wrong20" ${disabled}>오답 20</button><button class="btn" data-training-start="wrong50" ${disabled}>오답 50</button><button class="btn" data-training-start="wrong100" ${disabled}>오답 100</button></div><button class="btn primary block" data-training-start="weak65">취약점 맞춤 65</button></div><button class="btn ghost block" data-calc-bank>계산 문제 훈련</button></section>`;
return shell(`<div class="exam-landing exam-landing-single screen-scroll" data-scroll-owner="exam-landing"><nav class="exam-hub-tabs" aria-label="시험 모드"><button class="${hub==='mock'?'on':''}" data-exam-hub="mock">실전 모의고사</button><button class="${hub==='training'?'on':''}" data-exam-hub="training">문제훈련</button></nav>${hub==='mock'?mockPane:trainingPane}</div>`,'시험')
}
function startExam(mode){
const ready=V.examReadiness();if(mode==='real'&&!ready.ready)return toast('실전 문제은행을 준비 중입니다.');
if(mode==='past2025'){
const qs=V.OfficialPastExam119?.buildPractice?.()||[];if(!qs.length)return toast('공식 기출 문제를 불러오지 못했습니다.');
runtime.exam={id:crypto.randomUUID?crypto.randomUUID():'exam-'+Date.now(),mode:'past',title:'2025 실제 기출',difficulty:'official',qs,i:0,startedAt:Date.now(),answers:{},confidence:{},blueprint:{fire:qs.filter(q=>q.subject==='fire').length,ems:qs.filter(q=>q.subject==='ems').length,minutes:null,officialPastExam:true,year:2025,label:'2025 실제 기출'}};persistActiveExam();render();return
}
const round=Math.max(1,Math.min(50,Number(runtime.examRound)||1)),built=roundQuestions(mode,runtime.examDifficulty,round);if(!built||built.qs.length!==65)return toast('65문항을 구성할 수 없습니다. 문제은행을 확인해주세요.');
const qs=built.qs,seed=built.record.seed;
runtime.exam={id:crypto.randomUUID?crypto.randomUUID():'exam-'+Date.now(),mode,difficulty:runtime.examDifficulty,round,seed,qs,i:0,startedAt:Date.now(),answers:{},confidence:{},blueprint:{fire:25,ems:40,minutes:65,freshWindow:4,round,seed,seededRound:true,variantMode:mode==='practice'?'safe-v59':'none',baseQuestionIds:built.record.questionIds}};
persistActiveExam();render();startExamTicker()
}
function examRun(){
const e=runtime.exam,q=e.qs[e.i],real=e.mode==='real',training=e.mode==='training',past=e.mode==='past',total=e.qs.length,left=real?Math.max(0,3900-Math.floor((Date.now()-e.startedAt)/1000)):null,answered=Object.keys(e.answers).length,remaining=Math.max(0,total-answered),label=real?`실전 모의고사 ${Number(e.round||e.blueprint?.round)||''}회`:past?(e.title||'실제 기출'):training?(e.title||'집중훈련'):`연습 모의고사 ${Number(e.round||e.blueprint?.round)||''}회`,pct=Math.round(answered/Math.max(1,total)*100);
if(real&&left===0)setTimeout(()=>finishExam(true),0);
const navigator=e.qs.map((item,i)=>`<button class="${i===e.i?'current':''} ${e.answers[item.id]!==undefined?'answered':''}" data-exam-jump="${i}" aria-label="${i+1}번 문제">${i+1}</button>`).join(''),miniNavigator=e.qs.map((item,i)=>`<button class="${i===e.i?'current':''} ${e.answers[item.id]!==undefined?'answered':''}" data-exam-mini-jump="${i}" aria-label="${i+1}번 문제 빠른이동">${i+1}</button>`).join('');
const circled=['①','②','③','④'];
return shell(`<div class="workspace single-pane exam-run-workspace"><header class="concept-head exam-head-clean"><div class="exam-head-meta"><span class="scope-label">${esc(label)} · 문제 ${e.i+1}/${total}</span><h2 ${real?'data-exam-timer':''}>${real?`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`:training?`${answered}/${total} 답변`:'문제를 풀어보세요'}</h2></div><button class="btn small ghost exam-abandon-btn" data-exam-abandon>중단 · 결과보기</button></header><div class="study-body exam-body" data-scroll-owner="exam-active"><section class="exam-compact-status"><div class="exam-compact-line"><span>답변 <b>${answered}/${total}</b></span><span>진행 <b>${pct}%</b></span><span>${esc(V.subjectLabel(q.subject))}</span></div><div class="progressbar"><i style="width:${pct}%"></i></div><div class="exam-mini-navigator" aria-label="문제 빠른이동">${miniNavigator}</div></section><div class="exam-layout"><main class="exam-question-pane"><div class="question-card exam-question-card"><div class="tiny muted exam-subject">${V.subjectLabel(q.subject)} · ${e.i+1}번</div><h2>${esc(studentQuestionText(q.q))}</h2><div class="choices">${q.choices.map((x,i)=>`<button class="choice ${e.answers[q.id]===i?'sel':''}" data-exam-answer="${i}"><span class="choice-no">${circled[i]}</span><span>${esc(studentStudyText(x))}</span></button>`).join('')}</div><div class="confidence"><span class="tiny muted">확신도</span>${[['sure','확실'],['maybe','애매'],['none','모름']].map(([k,l])=>`<button class="${(e.confidence?.[q.id]||'none')===k?'on':''}" data-exam-confidence="${k}">${l}</button>`).join('')}</div></div></main><aside class="exam-side"><div class="exam-side-head"><span>진행 상황</span><b>${pct}%</b></div><div class="progressbar"><i style="width:${pct}%"></i></div><div class="exam-side-stats"><div><span>답변</span><b>${answered}</b></div><div><span>남음</span><b>${remaining}</b></div><div><span>현재</span><b>${e.i+1}</b></div></div><div class="exam-side-subject"><span>현재 과목</span><b>${esc(V.subjectLabel(q.subject))}</b></div><div class="exam-navigator" aria-label="문제 바로가기">${navigator}</div></aside></div></div><footer class="actionbar exam-footer"><button class="btn" data-exam-prev ${e.i===0?'disabled':''}>← 이전</button><span class="exam-answer-count"><b>${answered}/${total}</b><small>답변 완료</small></span><button class="btn primary" data-exam-next>${e.i===total-1?'시험 종료':'다음 →'}</button></footer></div>`,'시험')
}
function finishExam(auto=false,options={}){
const e=runtime.exam;if(!e)return;
const partial=options.partial===true,abandoned=options.abandoned===true,total=e.qs.length,answered=Object.keys(e.answers).length,unanswered=total-answered,confidenceSnapshot={...(e.confidence||{})};
if(!auto&&!partial&&!options.skipConfirm&&unanswered&&!confirm(`미응답 ${unanswered}문제입니다. 시험을 종료할까요?`))return;
if(partial&&!answered)return;
let fireCorrect=0,emsCorrect=0,fireAnswered=0,emsAnswered=0;
for(const q of e.qs){
const a=e.answers[q.id];
if(a!==undefined){
if(q.subject==='fire')fireAnswered++;else emsAnswered++;
V.Mastery.recordAnswer?.(q,a,confidenceSnapshot[q.id]||'none',null)
}
if(a===q.a){if(q.subject==='fire')fireCorrect++;else emsCorrect++}
}
const correct=fireCorrect+emsCorrect,scoreDen=partial?answered:total,elapsedSec=Math.max(0,Math.floor((Date.now()-e.startedAt)/1000)),answerSnapshot={...e.answers};
const incorrectQuestionIds=e.qs.filter(q=>answerSnapshot[q.id]!==undefined&&answerSnapshot[q.id]!==q.a).map(q=>q.id);
const unansweredQuestionIds=e.qs.filter(q=>answerSnapshot[q.id]===undefined).map(q=>q.id);
const rec={
id:e.id,mode:e.mode,difficulty:e.difficulty,round:e.round||e.blueprint?.round||null,seed:e.seed||e.blueprint?.seed||null,at:Date.now(),score:scoreDen?Math.round(correct/scoreDen*100):0,correct,total,totalAnswered:answered,unanswered,elapsedSec,
fireCorrect,emsCorrect,fireAnswered,emsAnswered,questionIds:e.qs.map(q=>q.id),familyIds:e.qs.map(q=>V.VariantEngine119?.familyId?.(q)||q.familyId||q.masterQuestionId||q.id),questionSnapshots:Object.fromEntries(e.qs.filter(q=>q.variantGenerated).map(q=>[q.id,V.VariantEngine119?.snapshot?.(q)||q])),answers:answerSnapshot,confidence:confidenceSnapshot,incorrectQuestionIds,unansweredQuestionIds,
blueprint:e.blueprint||null,partial,abandoned,completionRate:total?Math.round(answered/total*100):0,scoreBasis:partial?'answered':'all',detailVersion:3
};
state().examHistory.push(rec);S.save();stopExamTicker();clearActiveExam();runtime.exam=null;runtime.examReportId=rec.id;
toast(partial?`중단 결과 ${correct}/${answered} · ${rec.score}점`:`${correct}/${total} · ${rec.score}점`);go('stats')
}
function notePreviewHtml(n,bodyOverride){
const raw=String(bodyOverride??n?.body??'').replace(/\r/g,'').split('\n'),star=String(n?.sourceType||'').startsWith('pass-star'),question=String(n?.sourceType||'')==='pass-question';
let section=star?'핵심':'';
return raw.map((rawLine,i)=>{
const line=String(rawLine||'').trim();if(!line)return'<span class="note-preview-gap" aria-hidden="true"></span>';
const m=line.match(/^\[(핵심|숫자·단위·기준|비교·구분|주의·예외|문제|정답|해설|원문 확인 필요|공식근거|내 메모)\]$/);
if(m){section=m[1];return `<b class="note-section-head note-section-${section==='핵심'?'core':section==='숫자·단위·기준'?'number':section==='주의·예외'?'warning':'plain'}">${esc(section)}</b>`}
const cls=section==='핵심'||star&&i===0?'note-core-line':section==='숫자·단위·기준'?'note-number-line':section==='주의·예외'?'note-warning-line':section==='정답'||question&&/^정답:/.test(line)?'note-answer-line':section==='공식근거'?'note-source-line':'';
return `<span class="note-preview-line ${cls}">${esc(line)}</span>`
}).join('')
}
function sourceBackedNote(n){const t=String(n?.sourceType||'');return t.startsWith('pass-star')||t==='pass-question'}
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
function noteSourceLabel(n){return({star:'핵심에서 저장',question:'문제에서 저장',doc:'PDF 업로드',manual:'직접 작성'})[noteKind(n)]||'합격노트'}
function noteSubjectOf(n){if(n?.subject==='ems'||n?.subject==='fire')return n.subject;return String(n?.conceptId||'').startsWith('E')?'ems':'fire'}
function filteredNotes(){
const all=(state().notes||[]).slice(),q=String(runtime.noteQuery||'').trim().toLowerCase(),order=new Map((V.curriculum?.concepts||[]).map((x,i)=>[x.id,i]));
return all.filter(n=>{
const kind=noteKind(n),filter=runtime.noteFilter,subjectOk=noteSubjectOf(n)===runtime.noteSubject;
const filterOk=filter==='all'||filter===kind;
const queryOk=!q||String(n.title||'').toLowerCase().includes(q)||String(n.body||'').toLowerCase().includes(q);
return subjectOk&&filterOk&&queryOk
}).sort((a,b)=>{
const ca=order.get(a.conceptId)??9999,cb=order.get(b.conceptId)??9999;if(ca!==cb)return ca-cb;
const ka={star:0,question:1,doc:2,manual:3}[noteKind(a)]??4,kb={star:0,question:1,doc:2,manual:3}[noteKind(b)]??4;if(ka!==kb)return ka-kb;
return Number(b.updatedAt||b.createdAt||0)-Number(a.updatedAt||a.createdAt||0)
})
}
function noteSubjectTabs(){
const all=state().notes||[],fire=all.filter(x=>noteSubjectOf(x)==='fire').length,ems=all.filter(x=>noteSubjectOf(x)==='ems').length;
return `<div class="note-subject-tabs" role="tablist" aria-label="합격노트 과목"><button class="${runtime.noteSubject==='fire'?'on':''}" data-note-subject="fire">소방학 <b>${fire}</b></button><button class="${runtime.noteSubject==='ems'?'on':''}" data-note-subject="ems">구급 <b>${ems}</b></button></div>`
}
function noteFilterChips(){
const all=(state().notes||[]).filter(x=>noteSubjectOf(x)===runtime.noteSubject),defs=[['all','전체'],['star','★핵심'],['question','문제'],['doc','PDF자료'],['manual','직접메모']];
return defs.map(([k,label])=>{const n=k==='all'?all.length:all.filter(x=>noteKind(x)===k).length;return `<button class="note-filter-chip ${runtime.noteFilter===k?'on':''}" data-note-filter="${k}">${label} <b>${n}</b></button>`}).join('')
}
function noteRowsHtml(){
const rows=filteredNotes();if(!rows.length)return `<div class="empty note-empty">저장한 ${runtime.noteSubject==='fire'?'소방학':'구급'} 합격노트가 없습니다.<br><small>학습 화면의 ☆를 눌러 핵심을 추가하거나 직접 메모를 작성하세요.</small></div>`;
return rows.map(n=>{const parts=splitSourceNote(n);return runtime.noteEditId===n.id?`<div class="row note-edit-row"><input id="noteEditTitle" class="input" value="${esc(n.title||'')}">${sourceBackedNote(n)?`<div class="note-official-lock"><b>공식/문제 원문 · 잠금</b><div class="note-preview note-official-preview">${notePreviewHtml(n,parts.official)}</div></div><label class="note-user-memo-label">내 메모<textarea id="noteEditMemo" class="textarea" placeholder="내 암기법·추가 메모">${esc(parts.memo)}</textarea></label>`:`<textarea id="noteEditBody" class="textarea">${esc(n.body||'')}</textarea>`}<div class="toolbar"><button class="btn small primary" data-note-save="${esc(n.id)}">수정 저장</button><button class="btn small ghost" data-note-cancel>취소</button></div></div>`:`<div class="row note-row"><div><b>${esc(n.title||'내 합격노트')}</b><div class="note-preview">${notePreviewHtml(n)}</div><span class="tiny muted">${esc(noteSourceLabel(n))}</span></div><div class="toolbar"><button class="btn small" data-note-edit="${esc(n.id)}">수정</button><button class="btn small ghost danger" data-note-delete="${esc(n.id)}">삭제</button></div></div>`}).join('');
}
function exportCard(mode,title){
return `<div class="pass-export-card"><b>${title}</b><div><button class="btn small primary" data-pass-export="${mode}">PDF</button><button class="btn small" data-pass-editable="${mode}">한글/워드(.docx)</button></div></div>`
}
function notes(){const starCount=V.PassNote?.passNotes?.().length||0;return shell(`<div class="notes-page screen-scroll" data-scroll-owner="notes">
<section class="card pass-note-hero"><span class="eyebrow">나만의 최종 수험서</span><h2>합격노트</h2><p class="muted">핵심·문제·직접 메모와 내가 올린 PDF를 한곳에서 정리합니다.</p><div class="pass-note-metrics"><span>★ 저장 ${starCount}</span><span>전체 노트 ${state().notes.length}</span></div><div class="pass-export-grid">${exportCard('fire','소방학 핵심')}${exportCard('ems','구급 핵심')}${exportCard('pass','내 합격노트')}${exportCard('rapid','시험직전 초압축')}</div><small class="muted">PDF는 인쇄 화면에서 저장하고, DOCX는 한컴오피스·Word 모바일에서 바로 열 수 있습니다.</small></section>
<section class="card note-upload-card"><div class="note-upload-copy"><b>PDF 업로드</b><p class="muted">내 PDF의 텍스트를 추출해 합격노트 초안을 만듭니다. 원본 파일은 이 기기에 보관하고 자동으로 서버에 올리지 않습니다.</p></div><div class="note-upload-actions"><select id="noteUploadSubject" class="select compact-select"><option value="fire" ${runtime.noteSubject==='fire'?'selected':''}>소방학</option><option value="ems" ${runtime.noteSubject==='ems'?'selected':''}>구급</option></select><label class="btn primary note-upload-button">PDF 선택<input id="passNotePdf" type="file" accept="application/pdf,.pdf" hidden></label></div>${runtime.noteUploadStatus?`<small class="note-upload-status">${esc(runtime.noteUploadStatus)}</small>`:''}</section>
<section class="card note-compose-card"><div class="toolbar"><b>직접 메모 추가</b><span class="spacer"></span><select id="noteSubjectSelect" class="select compact-select"><option value="fire" ${runtime.noteSubject==='fire'?'selected':''}>소방학</option><option value="ems" ${runtime.noteSubject==='ems'?'selected':''}>구급</option></select></div><input id="noteTitle" class="input" placeholder="노트 제목" style="margin-top:10px"><textarea id="noteBody" class="textarea" placeholder="내 암기법·추가 설명·시험 직전 메모" style="margin-top:8px"></textarea><button class="btn primary" data-save-note style="margin-top:8px">합격노트에 저장</button></section>
<section class="card"><div class="toolbar"><b>저장된 합격노트</b><span class="spacer"></span><span class="tiny muted">${filteredNotes().length}개</span></div>${noteSubjectTabs()}<div class="note-search"><input id="noteSearch" class="input" value="${esc(runtime.noteQuery||'')}" placeholder="합격노트 검색"><button class="btn small" data-note-search>검색</button><button class="btn small ghost" data-note-search-clear>검색 초기화</button></div><div class="note-filter-wrap">${noteFilterChips()}</div><div class="list note-list" style="margin-top:8px">${noteRowsHtml()}</div></section>
</div>`,'합격노트')}
let aiLoading=false;async function loadAI(){if(runtime.aiEngine||V.LocalAI?.ready||aiLoading)return;aiLoading=true;runtime.aiStatus='AI 준비 중';render();try{if(!V.LocalAI?.ensure)throw Error('AI_ENGINE_NOT_LOADED');runtime.aiEngine=await V.LocalAI.ensure({onProgress:()=>{runtime.aiStatus='AI 준비 중'}});runtime.aiStatus='대화형 답변 준비됨'}catch(e){runtime.aiStatus='근거 기반 답변'}finally{aiLoading=false;render()}}
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
function tutorMessageHtml(m){const t=cleanTutorText(m?.text||''),r=Array.isArray(m?.compareRows)?m.compareRows.filter(x=>Array.isArray(x)&&x.length>1):[],c=r.length?`<div class="tutor-compare-wrap"><table class="tutor-compare-table"><thead><tr><th>구분</th><th>핵심 차이</th></tr></thead><tbody>${r.map(x=>`<tr><td><b>${esc(x[0])}</b></td><td>${esc(x[1])}</td></tr>`).join('')}</tbody></table></div>`:'';return`<div class="row tutor-message ${m.role==='user'?'me':'assistant'}"><b>${m.role==='user'?'나':'AI'}</b>${c}${m.role==='assistant'?tutorRichAnswer(t):`<p class="tutor-answer-text">${esc(t)}</p>`}</div>`}
function wantsTutorDetail(prompt){return /상세|자세히|깊게|전부|원리부터|교재처럼/.test(String(prompt||''))}
function wantsTutorCompare(prompt){return /비교|차이|뭐가\s*달|vs|구분/.test(String(prompt||'').toLowerCase())}
function wantsTutorEvidence(prompt){return /근거만|출처만|원문만|공식\s*근거만|근거\s*위주/.test(String(prompt||''))}
function wantsTutorConcise(prompt){return /정의만|간단히|짧게|한\s*줄|1문장|두\s*문장|2문장/.test(String(prompt||''))}
function wantsTutorDefinitionOnly(prompt){return /정의만/.test(String(prompt||''))}
function tutorKeywords(v){
const stop=new Set(['그럼','그러면','그거','그건','이거','이건','뭐가있어','뭐야','무엇','어떤','알려줘','설명해줘','해줘','있어','있나','관련','대해','핵심','요약','시험','상세','자세히']);
return [...new Set(String(v||'').toLowerCase().split(/[^0-9a-z가-힣]+/).map(x=>x.replace(/(?:들에게|에서|으로|부터|까지|하고|이랑|들은|에게|처럼|보다|은|는|이|가|을|를|의|에|도|만)$/,'')).filter(x=>x.length>=2&&!stop.has(x)))]
}
function previousTutorQuestion(c,prompt){
const rows=(state().chat||[]).filter(m=>m.conceptId===c.id&&m.role==='user'&&String(m.text||'').trim()!==String(prompt||'').trim());return rows.slice(-1)[0]?.text||''
}
function tutorRelevantRows(prompt,c,pack){
const current=tutorKeywords(prompt),previous=tutorKeywords(previousTutorQuestion(c,prompt)),candidates=[];
const push=(text,label='')=>{const t=studentStudyText(text);if(t)candidates.push({text:t,label})};
push(pack.summary,'요약');(pack.must||[]).forEach(x=>push(x,'시험필수'));(pack.detail||[]).forEach(x=>push(x,'상세'));(pack.compare||[]).forEach(x=>push((x||[]).join(' → '),'비교'));(pack.traps||[]).forEach(x=>push(x,'시험주의'));
for(const sec of pack.deepSections||[]){push(sec?.body,sec?.title||'상세');(sec?.bullets||[]).forEach(x=>push(x,sec?.title||'상세'))}
const score=row=>{const n=studyNorm(row.text),label=studyNorm(row.label);let z=0;for(const t of current){const q=studyNorm(t);if(n.includes(q)||label.includes(q))z+=24+Math.min(12,q.length)}for(const t of previous){const q=studyNorm(t);if(n.includes(q)||label.includes(q))z+=5}return z};
return candidates.map(x=>({...x,score:score(x)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||b.text.length-a.text.length)
}
function fallbackTutor(prompt,c,pack){
const detail=wantsTutorDetail(prompt),compare=wantsTutorCompare(prompt),evidenceOnly=wantsTutorEvidence(prompt),concise=wantsTutorConcise(prompt),definitionOnly=wantsTutorDefinitionOnly(prompt),rows=[],general=/30초|요약|핵심\s*(?:정리|설명)?$/.test(String(prompt||''));
if(evidenceOnly)return cleanTutorText(['근거','• '+(pack.source||'공식 학습팩')].join('\n'));
if(definitionOnly)return cleanTutorText(studentStudyText(pack?.studySchema?.definition||pack.summary||((pack.must||[])[0])||c.title));
if(concise){const hits=tutorRelevantRows(prompt,c,pack),answer=studentStudyText(hits[0]?.text||pack.summary||((pack.must||[])[0])||c.title);return cleanTutorText(answer)}
if(general){rows.push('답변',studentStudyText(pack.summary||((pack.must||[])[0])||c.title));const must=(pack.must||[]).map(studentStudyText).filter(Boolean).slice(0,detail?5:3),why=uniqueTextRows([...(pack.detail||[]),...(pack.deepSections||[]).map(x=>x?.body).filter(Boolean)].map(studentStudyText)).slice(0,detail?4:2);if(must.length)rows.push('','핵심 포인트',...must.map(x=>'• '+x));if(why.length)rows.push('','왜 그런가',...why.map(x=>'• '+x))}
else{
const hits=tutorRelevantRows(prompt,c,pack),picked=uniqueTextRows(hits.slice(0,detail?6:4).map(x=>x.text));
if(picked.length){rows.push('답변',picked[0]);if(picked.length>1)rows.push('','왜 그런가',...picked.slice(1).map(x=>'• '+x))}
else rows.push('답변',studentStudyText(pack.summary||((pack.must||[])[0])||c.title));
if(compare&&(pack.compare||[]).length)rows.push('','비교 판단',...(pack.compare||[]).slice(0,6).map(x=>'• '+x.join(' → ')));
if(/시험|함정|주의/.test(String(prompt||''))&&(pack.traps||[]).length)rows.push('','시험 적용',...(pack.traps||[]).slice(0,3).map(x=>'• '+x))
}
rows.push('','근거','• '+(pack.source||'현재 개념의 공식 학습팩'));return cleanTutorText(rows.join('\n'))
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
function tutorPromptRelevant(prompt,current,pack){
const raw=String(prompt||'').trim(),previous=previousTutorQuestion(current,prompt);
if(!raw)return false;
if(previous&&/^(?:왜|왜요|그럼|그러면|그건|그거|그것|둘|둘은|기관들|더|예시|예를|어떻게|뭐가|차이|비교|근거|출처|원문|시험|함정|주의|정의|종류|특징|요약|자세히|상세)/.test(raw))return true;
const words=tutorKeywords(raw);if(!words.length)return !!previous;
const corpus=studyNorm([
current?.title||'',pack?.summary||'',...(pack?.must||[]),...(pack?.detail||[]),
...(pack?.compare||[]).flat(),...(pack?.traps||[]),
...(pack?.deepSections||[]).flatMap(x=>[x?.title,x?.body,...(x?.bullets||[])]),
...(V.ConceptArchitecture119?.termsFor?.(current?.id)||[])
].filter(Boolean).join(' '));
return words.some(w=>{const n=studyNorm(w);return n.length>=2&&corpus.includes(n)})
}
function aiChatBody(c){
const chat=state().chat.filter(m=>m.conceptId===c.id).slice(-18);
const arch=V.ConceptArchitecture119?.get?.(c.id);
return `<div class="study-ai"><div class="study-ai-head"><div><span class="eyebrow">현재 개념 전용 AI</span><b>${esc(c.title)} 범위에서만 답합니다.</b><small class="tiny muted">${esc(arch?.label||'개념 학습')}</small></div><div class="tutor-head-actions"><span class="tiny muted">${esc(runtime.aiStatus)}</span>${chat.length?'<button class="btn small ghost" data-tutor-clear>대화 지우기</button>':''}</div></div><div class="study-ai-chat">${chat.length?chat.map(tutorMessageHtml).join(''):`<div class="tutor-empty compact"><p><b>${esc(c.title)}</b>에 대해 질문하세요. 후속 질문도 앞 대화의 대상을 이어서 답합니다.</p><div class="tutor-quick"><button data-tutor-prompt="정의만 간단히 알려줘">정의만</button><button data-tutor-prompt="헷갈리는 것만 비교해줘">헷갈리는 비교</button><button data-tutor-prompt="원문 근거만 보여줘">원문 근거</button></div></div>`}</div><div class="tutor-compose"><input data-tutor-input class="input" placeholder="${esc(c.title)}에 대해 질문하세요"><button class="btn primary" data-tutor-send>보내기</button></div></div>`
}
function tutorNumericClaims(v){
return [...new Set((String(v||'').match(/\d+(?:[.,]\d+)?(?:\s*(?:~|–|-)\s*\d+(?:[.,]\d+)?)?\s*(?:mg\/kg|mg|g|kg|mL|L\/min|L|mmHg|cm|mm|℃|°C|%|J|mA|회\/분|회|분|초|시간|쪽)?/g)||[]).map(x=>x.replace(/\s+/g,'').replace(/,/g,'.')).filter(x=>/[a-zA-Z가-힣%℃°]|\d{2,}/.test(x)))]
}
function tutorUnsupportedNumbers(answer,corpus){
const source=String(corpus||'').replace(/\s+/g,'').replace(/,/g,'.'),allowed=new Set(['119','2020','2026']);
return tutorNumericClaims(answer).filter(x=>!allowed.has(x)&&!source.includes(x))
}
function visibleTutorInput(){const all=[...document.querySelectorAll('[data-tutor-input]')];return all.find(x=>x.offsetParent!==null)||all[0]||null}
function trimTutorChat(conceptId,limit=20){
const own=(state().chat||[]).filter(m=>m.conceptId===conceptId),drop=new Set(own.slice(0,Math.max(0,own.length-limit)).map(x=>x.id));if(drop.size)state().chat=(state().chat||[]).filter(x=>!drop.has(x.id))
}
async function sendTutor(){
const input=visibleTutorInput(),prompt=input?.value.trim();if(!prompt)return;
const current=currentConcept(),pack=V.contentPacks.get(current.id),target=tutorTargetAllowed(prompt,current,pack),relevant=tutorPromptRelevant(prompt,current,pack),prior=(state().chat||[]).filter(m=>m.conceptId===current.id).slice(-8);
const mkid=p=>crypto.randomUUID?crypto.randomUUID():p+Date.now()+Math.random().toString(36).slice(2);
const userMsg={id:mkid('chat-u-'),role:'user',text:prompt,at:Date.now(),conceptId:current.id};
const assistant={id:mkid('chat-a-'),role:'assistant',text:'생각 중…',at:Date.now(),conceptId:current.id};
state().chat.push(userMsg,assistant);trimTutorChat(current.id,20);runtime.tutorForceLatest=true;S.save();render();
if(!target.allowed||!relevant){
const out=!relevant&&(!target.detected||target.detected.id===current.id)
?`현재 학습 항목은 「${current.title}」입니다.\n이 화면에서는 현재 개념과 직접 관련된 학습 질문만 답합니다.\n정의·비교·시험 포인트·원문 근거처럼 학습 내용으로 질문해 주세요.`
:`현재 학습 항목은 「${current.title}」입니다.\n이 AI는 현재 항목과 직접 등록된 비교 내용만 설명합니다.\n「${target.detected?.title||'다른 개념'}」은 해당 개념 페이지로 이동해서 질문해 주세요.`;
const ix=state().chat.findIndex(x=>x.id===assistant.id);if(ix>=0)state().chat[ix]={...assistant,text:out,outOfScope:true,suggestedConceptId:target.detected?.id&&target.detected.id!==current.id?target.detected.id:''};S.save();render();return
}
const detailed=wantsTutorDetail(prompt),compare=wantsTutorCompare(prompt),evidenceOnly=wantsTutorEvidence(prompt),concise=wantsTutorConcise(prompt),definitionOnly=wantsTutorDefinitionOnly(prompt),compareRows=compare?(pack.compare||[]).slice(0,6):[];
let out=fallbackTutor(prompt,current,pack),idx=state().chat.findIndex(x=>x.id===assistant.id);
if(idx>=0)state().chat[idx]={...assistant,text:out,targetConceptId:current.id,compareRows};S.save();render();
if(!concise&&!(runtime.aiEngine||V.LocalAI?.ready)&&navigator.gpu&&V.LocalAI?.ensure){
try{runtime.aiStatus='AI 준비 중';runtime.aiEngine=await V.LocalAI.ensure({onProgress:()=>{runtime.aiStatus='AI 준비 중'}});runtime.aiStatus='대화형 답변 준비됨'}catch{runtime.aiStatus='근거 기반 답변'}
}
if(!concise&&(runtime.aiEngine||V.LocalAI?.ready)){
try{
const deep=uniqueSections(pack.deepSections||[]).map(x=>[x?.title,studentStudyText(x?.body),...(x?.bullets||[]).map(studentStudyText)].filter(Boolean).join(': ')).join('\n');
const ev=V.StudyEmphasis119?.evidence?.(current.id,pack)||{},rangeText=(ev.ranges||[]).map(x=>`${x.label||x.doc} ${x.from}~${x.to}쪽`).join(' · '),officialLinks=(pack.officialLinks||[]).map(x=>x?.label).filter(Boolean).join(' · ');
const context=`[현재 개념]\n${current.id} ${current.title}\n[유형]\n${V.ConceptArchitecture119?.get?.(current.id)?.label||''}\n[요약]\n${studentStudyText(pack.summary||'')}\n[상세]\n${(pack.detail||[]).map(studentStudyText).filter(Boolean).join('\n')}\n[시험필수]\n${(pack.must||[]).map(studentStudyText).filter(Boolean).join('\n')}\n[심화]\n${deep}\n[비교]\n${(pack.compare||[]).map(x=>x.join(': ')).join('\n')}\n[함정]\n${(pack.traps||[]).map(studentStudyText).filter(Boolean).join('\n')}\n[공식근거]\n${ev.source||pack.source||''}\n[직접 연결 범위]\n${rangeText}\n[공식 링크]\n${officialLinks}`;
const style=evidenceOnly?'근거만 요청했다. 판단을 확장하지 말고 출처와 근거만 답한다.':definitionOnly?'정의만 1~2문장으로 답하고 이유·시험포인트·근거를 덧붙이지 않는다.':concise?'최대 3문장으로 질문에 직접 답하고 불필요한 확장을 하지 않는다.':compare?'현재 질문이 요구하는 대상의 차이를 먼저 답하고 필요한 경우 표를 사용한다.':detailed?'현재 질문에 대한 결론부터 제시한 뒤 원리·이유와 시험 적용을 자세히 설명한다.':'현재 질문에 직접 답하고 필요한 이유와 시험 포인트만 짧게 설명한다.';
const history=prior.filter(m=>m.role==='user'||m.role==='assistant').map(m=>({role:m.role,content:cleanTutorText(m.text||'')})).filter(m=>m.content&&!/답변 준비 중|생각 중/.test(m.content));
const enhanced=await V.LocalAI.chat([
{role:'system',content:'119 소방·구급 시험 학습도우미다. 제공된 공식 학습팩과 직접 연결된 공식근거 안에서만 답한다. 사용자의 후속질문에서 “그럼”, “그건”, “둘”, “기관들” 같은 지시대상은 직전 대화 문맥으로 해석한다. 현재 질문이 달라졌으면 이전 답을 반복하지 말고 현재 질문에 직접 답한다. 근거에 없는 기관명·수치·법규·의학 기준은 추측하거나 보완하지 말고 “현재 연결된 공식 근거에서 확인되지 않습니다”라고 명시한다. 답변의 사실과 숫자는 반드시 제공된 근거에서 확인 가능해야 한다. 사용자가 출처나 근거를 묻지 않았다면 답변 첫 문장에 교재명·연도·페이지를 반복하지 말고 정의와 결론부터 제시한다. 표는 열 수가 맞는 Markdown 표로 작성한다. '+style},
{role:'system',content:context},
...history,
{role:'user',content:prompt}
],{temperature:.1,max_tokens:definitionOnly?160:concise?220:detailed?950:600});
if(enhanced){
const candidate=cleanTutorText(enhanced),numericCorpus=context+'\n'+prompt+'\n'+history.map(x=>x.content).join('\n'),unsupported=tutorUnsupportedNumbers(candidate,numericCorpus);
out=unsupported.length?fallbackTutor(prompt,current,pack):candidate;
runtime.aiStatus=unsupported.length?'근거 검증 후 답변':'공식근거 기반 답변';
runtime.aiEngine=V.LocalAI.engine||runtime.aiEngine;idx=state().chat.findIndex(x=>x.id===assistant.id);
if(idx>=0){state().chat[idx]={...state().chat[idx],text:out,enhanced:!unsupported.length,groundingRejected:unsupported.length>0};trimTutorChat(current.id,20);S.save();if(currentConcept()?.id===current.id&&state().studyTab==='ai')render()}
}
}catch{runtime.aiStatus='근거 기반 답변'}
}
}
function examReportView(rec){
const partial=rec.partial===true||rec.abandoned===true,ids=rec.questionIds||[],answers=rec.answers||{},snapshots=rec.questionSnapshots||{},items=ids.map(id=>{const q=snapshots[id]||V.questionById[id];return q?{q,selected:answers[id]}:null}).filter(Boolean),answeredItems=items.filter(x=>x.selected!==undefined),analysisItems=partial?answeredItems:items;
const missed=analysisItems.filter(x=>x.selected===undefined||x.selected!==x.q.a),scopeCounts=new Map(),familyCounts=new Map(),difficultyCounts=new Map();
for(const x of analysisItems){
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
const total=rec.total||ids.length||65,answered=Number(rec.totalAnswered??answeredItems.length),fireBlueprint=Number(rec.blueprint?.fire??25),emsBlueprint=Number(rec.blueprint?.ems??40),fireAnswered=Number(rec.fireAnswered??answeredItems.filter(x=>x.q.subject==='fire').length),emsAnswered=Number(rec.emsAnswered??answeredItems.filter(x=>x.q.subject==='ems').length),fireDen=partial?fireAnswered:fireBlueprint,emsDen=partial?emsAnswered:emsBlueprint,modeLabel=partial?'중단 결과':rec.mode==='real'?'실전':rec.mode==='past'?(rec.blueprint?.label||'실제 기출'):rec.mode==='training'?(rec.blueprint?.label||'집중훈련'):'연습';
const row=x=>{const q=x.q,mine=x.selected===undefined?'미응답':`${Number(x.selected)+1}. ${studentStudyText(q.choices?.[x.selected]??'')}`,right=`${q.a+1}. ${studentStudyText(q.choices?.[q.a]??'')}`,mineWhy=x.selected===undefined?'':studentStudyText(q.choiceExplanations?.[x.selected]||''),rightWhy=studentStudyText(q.choiceExplanations?.[q.a]||q.ex||''),concept=V.curriculum.byId[q.conceptId],sure=rec.confidence?.[q.id]==='sure';
return `<article class="exam-miss"><div class="exam-miss-head"><span>${esc(V.subjectLabel(q.subject))}</span><span>${esc(concept?.scopeTitle||'')}${sure?' · 확신오답':''}</span></div><h3>${esc(studentQuestionText(q.q))}</h3><div class="exam-answer-line wrong-answer"><b>내 답</b><span>${esc(mine)}</span></div><div class="exam-answer-line right-answer"><b>정답</b><span>${esc(right)}</span></div>${mineWhy?`<p class="exam-why"><b>왜 틀렸나</b> ${esc(mineWhy)}</p>`:''}<p class="exam-why"><b>정답 근거</b> ${esc(rightWhy)}</p><div class="toolbar"><button class="btn small primary" data-concept="${esc(q.conceptId)}">개념 복습</button><button class="btn small" data-retry="${esc(q.masterQuestionId||q.id)}">다시 풀기</button><button class="btn small ghost" data-source-concept="${esc(q.conceptId)}">원문 근거</button></div></article>`;
};
const summaryGrid=partial?`<div class="exam-report-grid"><div><span>푼 문제 정답</span><b>${rec.correct}/${answered}</b></div><div><span>소방학</span><b>${rec.fireCorrect}/${fireDen}</b></div><div><span>응급처치</span><b>${rec.emsCorrect}/${emsDen}</b></div><div><span>진행</span><b>${answered}/${total}</b></div></div>`:`<div class="exam-report-grid"><div><span>전체</span><b>${rec.correct}/${total}</b></div><div><span>소방학</span><b>${rec.fireCorrect}/${fireDen}</b></div><div><span>응급처치</span><b>${rec.emsCorrect}/${emsDen}</b></div><div><span>시간</span><b>${Math.floor((rec.elapsedSec||0)/60)}분 ${(rec.elapsedSec||0)%60}초</b></div></div>`;
const reportNote=partial?`푼 문제 기준 점수 · 진행률 ${rec.completionRate??Math.round(answered/Math.max(1,total)*100)}% · 남은 문제 ${rec.unanswered||0}개 · ${Math.floor((rec.elapsedSec||0)/60)}분 ${(rec.elapsedSec||0)%60}초`:`미응답 ${rec.unanswered||0} · 오답 ${rec.incorrectQuestionIds?.length??missed.filter(x=>x.selected!==undefined).length} · 확신오답 ${sureWrong}`;
return `<div class="exam-report screen-scroll"><div class="toolbar exam-report-top"><button class="btn small ghost" data-report-close>← 최근 시험</button><span class="spacer"></span><span class="tag">${esc(modeLabel)}</span></div><section class="card exam-report-summary ${partial?'partial':''}"><div class="exam-report-title"><h2>${rec.score}점</h2>${partial?'<span>푼 문제 기준</span>':''}</div>${summaryGrid}<p class="tiny muted">${esc(reportNote)}</p>${partial?'<p class="partial-result-guide">중단 시점까지 답한 문제만 채점·오답 분석에 반영했습니다. 풀지 않은 문제는 오답으로 처리하지 않습니다.</p>':''}</section>${diffs.length?`<section class="card"><b>난이도 분석</b><div class="weak-list">${diffs.map(x=>`<span class="weak-chip">${({low:'하',mid:'중',high:'상'})[x.key]||x.key} · ${x.correct}/${x.total}</span>`).join('')}</div></section>`:''}${weak.length?`<section class="card"><div class="toolbar"><b>취약 단원</b><span class="spacer"></span><small class="tiny muted">눌러서 바로 복습</small></div><div class="weak-list">${weak.map(x=>`<button class="weak-chip skill-train-chip weak-review-chip" data-concept="${esc(x.conceptId)}" data-weak-review="${esc(x.scopeId)}">${esc(x.title)} · 오답 ${x.count} · 복습</button>`).join('')}</div></section>`:''}${skills.length?`<section class="card"><b>문제 유형 분석</b><div class="weak-list">${skills.map(x=>`<button class="weak-chip skill-train-chip" data-skill-train="${esc(x.key)}">${esc(x.label)} · ${x.correct}/${x.total} · 훈련</button>`).join('')}</div><p class="tiny muted">학습을 돕기 위한 문제유형 분류입니다. 실제 시험의 출제비율과는 다를 수 있습니다.</p></section>`:''}<section class="card exam-missed-section"><div class="toolbar"><b>${partial?'현재까지 오답 분석':'오답·미응답 분석'}</b><span class="spacer"></span><span class="tiny muted">${missed.length}문항</span></div><div class="exam-miss-list">${missed.length?missed.map(row).join(''):`<div class="empty" style="height:120px">${partial?'현재까지 푼 문제는 모두 정답입니다.':'전 문항 정답입니다.'}</div>`}</div></section></div>`;
}
function statsBarRow(label,value,meta='',kind=''){
const v=Math.max(0,Math.min(100,Number(value)||0));return `<div class="stats-analysis-row ${kind}"><div class="stats-analysis-head"><b>${esc(label)}</b><span>${v}%</span></div><div class="stats-analysis-bar"><i style="width:${v}%"></i></div>${meta?`<small>${esc(meta)}</small>`:''}</div>`
}
function correctionStatsCard(){
const c=V.CorrectionLoopV64?.summary?.(state()),rows=c?.rows?.slice(0,8)||[];
if(!rows.length)return'';
return `<section class="card correction-v64-card"><div class="toolbar"><div><span class="eyebrow">V64 교정 폐루프</span><b>취약점 → 복습 → 재검증 → 완료</b></div><span class="spacer"></span><span class="tag">${c.active?'교정중 '+c.active:'교정 완료'}</span></div><div class="correction-v64-list">${rows.map(x=>`<div class="correction-v64-row ${x.completed?'done':''}"><button class="correction-v64-main" data-concept="${esc(x.conceptId)}"><span><b>${esc(x.title)}</b><small>${x.completed?'교정 완료':('미해결 '+x.unresolved+' · 최근 '+x.recentCorrect+'/'+x.recentAttempts+' · 확실 '+x.sureCorrect)}</small></span><span class="correction-v64-progress">${x.completed?'완료':x.progress+'%'}</span></button>${x.active?`<button class="btn small primary" data-v64-train="${esc(x.conceptId)}">3~5문제 재검증</button>`:''}</div>`).join('')}</div><p class="muted correction-v64-note">실전모의고사는 변경하지 않습니다. 개인화는 연습형 교정훈련에만 적용됩니다.</p></section>`
}
function stats(){
const report=runtime.examReportId&&state().examHistory.find(x=>x.id===runtime.examReportId);
if(report)return shell(examReportView(report),'시험 분석');
const r=V.Mastery.readiness(),history=state().examHistory.slice(-8).reverse(),wrong=state().wrongs.filter(x=>!x.resolved).length,a=V.AnalyticsV61?.analyze?.(state());
if(!a)return shell(`<div class="home-grid stats-page"><div class="home-main" data-scroll-owner="stats"><div class="metric-grid"><div class="metric"><span>학습 진도</span><b>${r.scopeCoverage}%</b></div><div class="metric"><span>기억 유지</span><b>${r.retention}%</b></div><div class="metric"><span>오답</span><b>${wrong}</b></div><div class="metric"><span>복습 예정</span><b>${r.overdue}</b></div></div><section class="card"><b>최근 시험</b><div class="list" style="margin-top:8px">${history.map(x=>`<div class="row exam-history-row"><div><b>${x.score}점</b><small>${esc(x.partial?'중단 결과':x.mode==='real'?`실전${x.round?' '+x.round+'회':''}`:x.mode==='training'?(x.blueprint?.label||'집중훈련'):`연습${x.round?' '+x.round+'회':''}`)}</small></div>${x.questionIds?.length&&x.answers?`<button class="btn small" data-exam-report="${esc(x.id)}">분석 보기</button>`:''}</div>`).join('')||'<div class="empty" style="height:100px">아직 시험 기록이 없습니다.</div>'}</div></section></div></div>`,'통계');
const s=a.summary,trendDelta=s.trendDelta==null?'비교 데이터 부족':s.trendDelta===0?'최근 흐름 동일':`이전 3회 대비 ${s.trendDelta>0?'+':''}${s.trendDelta}점`,subjects=['fire','ems'].map(k=>a.subjects.find(x=>x.key===k)||{key:k,label:k==='fire'?'소방학':'응급처치학',attempts:0,accuracy:0,sureWrong:0});
const scopeRows=a.scopes.filter(x=>x.attempts||x.unresolved).slice(0,6),conceptRows=a.concepts.filter(x=>x.attempts||x.unresolved).slice(0,8),skillRows=a.skills.filter(x=>x.attempts>=2).slice(0,6),difficultyRows=['low','mid','high'].map(k=>a.difficulty.find(x=>x.key===k)||{key:k,label:k==='low'?'하':k==='high'?'상':'중',attempts:0,accuracy:0,sureWrong:0}),confidenceRows=['sure','maybe','none'].map(k=>a.confidence.find(x=>x.key===k)||{key:k,label:k==='sure'?'확실':k==='maybe'?'애매':'미선택',attempts:0,accuracy:0,sureWrong:0});
const trendRows=a.trend.rows.slice(-8).reverse(),priorityRows=a.priorities||[];
return shell(`<div class="home-grid stats-page"><div class="home-main stats-v61" data-scroll-owner="stats">
<section class="card stats-v61-hero"><div><span class="eyebrow">V61 성적·취약점 분석센터</span><h2>지금 어디를 공부해야 점수가 오르는지</h2><p class="muted">시험점수, 문제풀이, 확신도, 오답·복습 기록을 함께 분석합니다. 표본이 적을 때는 초기 데이터로 표시합니다.</p></div><span class="tag">데이터 ${esc(a.dataLevel)} · ${s.attempts}회 답변</span></section>
<div class="metric-grid stats-v61-metrics"><div class="metric"><span>전체 정확도</span><b>${s.attempts?s.accuracy+'%':'-'}</b><small>${s.correct}/${s.attempts||0}</small></div><div class="metric"><span>최근 시험 평균</span><b>${s.recentExamAvg==null?'-':s.recentExamAvg+'점'}</b><small>${esc(trendDelta)}</small></div><div class="metric"><span>확신 오답</span><b>${s.sureWrong}</b><small>틀렸지만 확실 선택</small></div><div class="metric"><span>미해결 오답</span><b>${s.unresolved}</b><small>오늘 복습 ${s.overdue}</small></div></div>
<section class="card stats-next-action"><div class="toolbar"><div><span class="eyebrow">다음 공부</span><h2>우선순위</h2></div><span class="spacer"></span><button class="btn primary" data-stats-weak-train>취약점 맞춤 65</button><button class="btn" data-go="wrong">오답 복습</button></div><div class="stats-priority-grid">${priorityRows.length?priorityRows.map((x,i)=>`<div class="stats-priority-item"><span>${i+1}</span><div><b>${esc(x.title)}</b><small>${esc(x.reason)}</small></div>${x.kind==='concept'?`<button class="btn small ghost" data-concept="${esc(x.id)}">복습</button>`:''}</div>`).join(''):'<div class="empty">문제를 풀면 학습 우선순위를 자동으로 계산합니다.</div>'}</div></section>
<div class="stats-v61-columns"><section class="card"><div class="toolbar"><b>과목별 정확도</b><span class="spacer"></span><small class="muted">누적 답변 기준</small></div><div class="stats-analysis-list">${subjects.map(x=>statsBarRow(x.label,x.accuracy,`${x.correct||0}/${x.attempts||0} · 확신오답 ${x.sureWrong||0}`)).join('')}</div></section>
<section class="card"><div class="toolbar"><b>난이도별</b><span class="spacer"></span><small class="muted">하·중·상</small></div><div class="stats-analysis-list">${difficultyRows.map(x=>statsBarRow(x.label,x.accuracy,`${x.attempts||0}문제 · 확신오답 ${x.sureWrong||0}`)).join('')}</div></section></div>
<div class="stats-v61-columns"><section class="card"><div class="toolbar"><b>취약 단원</b><span class="spacer"></span><small class="muted">정확도 + 오답 + 복습기한</small></div><div class="stats-weak-table">${scopeRows.length?scopeRows.map(x=>`<button class="stats-weak-row" data-concept="${esc(x.conceptId||'')}"><span><b>${esc(x.label)}</b><small>${x.attempts}회 · 미해결 ${x.unresolved||0}</small></span><span class="stats-weak-score">취약 ${x.weakness}</span><span>${x.accuracy}%</span></button>`).join(''):'<div class="empty">아직 단원 분석 데이터가 부족합니다.</div>'}</div></section>
<section class="card"><div class="toolbar"><b>우선 복습 개념</b><span class="spacer"></span><small class="muted">표본 수준 포함</small></div><div class="stats-weak-table">${conceptRows.length?conceptRows.map(x=>`<button class="stats-weak-row" data-concept="${esc(x.conceptId)}"><span><b>${esc(x.label)}</b><small>${esc(x.scopeTitle)} · ${esc(x.evidence)} 표본</small></span><span class="stats-weak-score">취약 ${x.weakness}</span><span>${x.accuracy}%</span></button>`).join(''):'<div class="empty">문제를 더 풀면 개념별 취약도가 표시됩니다.</div>'}</div></section></div>
<div class="stats-v61-columns"><section class="card"><div class="toolbar"><b>문제유형 분석</b><span class="spacer"></span><small class="muted">틀리는 방식 확인</small></div><div class="stats-analysis-list">${skillRows.length?skillRows.map(x=>`<div class="stats-skill-row">${statsBarRow(x.label,x.accuracy,`${x.correct}/${x.attempts} · 취약 ${x.weakness}`)}<button class="btn small ghost" data-skill-train="${esc(x.key)}">유형 훈련</button></div>`).join(''):'<div class="empty">유형 분석 데이터가 부족합니다.</div>'}</div></section>
<section class="card"><div class="toolbar"><b>확신도 분석</b><span class="spacer"></span><small class="muted">확신오답 우선</small></div><div class="stats-analysis-list">${confidenceRows.map(x=>statsBarRow(x.label,x.accuracy,`${x.attempts||0}회 · 확신오답 ${x.sureWrong||0}`,x.key==='sure'&&x.sureWrong?'warning':'')).join('')}</div></section></div>
<section class="card"><div class="toolbar"><b>최근 시험 흐름</b><span class="spacer"></span><small class="muted">${esc(trendDelta)}</small></div><div class="stats-trend-list">${trendRows.length?trendRows.map(x=>`<div class="stats-trend-row"><div><b>${x.score}점</b><small>${esc(x.mode==='real'?`실전${x.round?' '+x.round+'회':''}`:x.mode==='training'?(x.blueprint?.label||'훈련'):`연습${x.round?' '+x.round+'회':''}`)}</small></div><div class="stats-trend-bar"><i style="width:${Math.max(0,Math.min(100,Number(x.score)||0))}%"></i></div>${x.questionIds?.length&&x.answers?`<button class="btn small ghost" data-exam-report="${esc(x.id)}">분석</button>`:''}</div>`).join(''):'<div class="empty">완료한 시험이 아직 없습니다.</div>'}</div></section>
${correctionStatsCard()}<section class="card stats-readiness-strip"><div><span>학습 진도</span><b>${r.scopeCoverage}%</b></div><div><span>기억 유지</span><b>${r.retention}%</b></div><div><span>복습 예정</span><b>${r.overdue}</b></div><div><span>최고 시험점수</span><b>${s.bestExam==null?'-':s.bestExam+'점'}</b></div></section>
</div></div>`,'성적·취약점')
}
function resources(){
const rows=Object.values(V.SourceCatalog119?.catalog||{}),ver=V.ExamVersion119?.summary?.(),changes=V.ExamVersion119?.meaningfulChanges?.()||[];
const versionCard=ver?`<section class="card exam-version-card"><div class="toolbar"><b>시험 기준</b><span class="spacer"></span><span class="tag">목표 ${esc(ver.targetExamYear)}년</span></div><p class="muted">현재 학습 콘텐츠와 공식교재 근거는 <b>${esc(ver.contentBaselineYear)} 공식 기준</b>입니다. ${esc(ver.targetExamYear)} 공식 범위가 확인되기 전에는 기준연도를 자동으로 올리지 않습니다.</p>${changes.length?`<div class="exam-version-changes"><b>공식 변경사항</b><ul>${changes.map(x=>`<li>${esc(x.title||x.kind)}</li>`).join('')}</ul></div>`:''}</section>`:'';
return shell(`<div class="resources-119 screen-scroll" data-scroll-owner="resources">${versionCard}<section class="card"><div class="resource-section-head"><div><h2>공식 자료</h2><p class="muted">중앙소방학교 공식 교재 · ${rows.length}권</p></div></div><div class="list resource-grid">${rows.map(x=>`<div class="row resource-row compact"><b>${esc(x.label)}</b><div class="resource-actions"><button class="btn small ghost" data-resource-doc="${esc(x.key)}">PDF 보기</button><button class="btn small" data-resource-download="${esc(x.key)}">다운로드</button></div></div>`).join('')}</div></section></div>`,'자료')
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
if(!V.Auth?.user)return shell(`<div class="suggestions-page screen-scroll" data-scroll-owner="suggestions"><section class="card"><h2>건의함</h2><p class="muted">건의사항은 회원 전용입니다. 로그인하면 익명으로 의견을 보내고 관리자 답변을 확인할 수 있습니다.</p><button class="btn primary" data-account>로그인 / 회원가입</button></section></div>`,'건의함');
ensureSuggestions();
const admin=runtime.suggestionsAdmin;
const draft=runtime.suggestionDraft||{category:'개선',title:'',body:'',anonymous:true};
return shell(`<div class="suggestions-page screen-scroll" data-scroll-owner="suggestions"><section class="card suggestion-intro"><div class="toolbar"><div><span class="eyebrow">${admin?'관리자':'의견 보내기'}</span><h2>${admin?'건의사항 관리':'익명 건의함'}</h2></div><span class="spacer"></span><button class="btn small ghost" data-suggest-refresh>새로고침</button></div><p class="muted">${admin?'전체 회원의 건의사항을 확인하고 답글과 처리상태를 남길 수 있습니다. 익명 글은 작성자 신원을 화면에 표시하지 않습니다.':'다른 회원은 볼 수 없습니다. 작성자는 자기 글과 관리자 답변만 볼 수 있고, 관리자는 전체 건의사항을 확인합니다.'}</p></section>
<section class="card suggestion-form"><b>새 건의사항</b><div class="form-grid" style="margin-top:10px"><label>분류<select id="suggestCategory" class="select">${(V.Suggestions?.CATEGORY||['개선','건의','오류','콘텐츠','기타']).map(x=>`<option ${x===draft.category?'selected':''}>${esc(x)}</option>`).join('')}</select></label><label>제목<input id="suggestTitle" class="input" maxlength="120" value="${esc(draft.title||'')}" placeholder="무엇을 개선하면 좋을까요?"></label></div><textarea id="suggestBody" class="textarea" maxlength="5000" placeholder="문제 화면, 원하는 개선점, 재현 방법 등을 자세히 적어주세요." style="margin-top:8px">${esc(draft.body||'')}</textarea><label class="suggest-anon"><input id="suggestAnonymous" type="checkbox" ${draft.anonymous!==false?'checked':''}> 익명으로 보내기</label>${runtime.suggestionError?`<div class="suggestion-form-error" role="alert">${esc(runtime.suggestionError)}</div>`:''}<button class="btn primary block" data-suggest-submit>건의사항 보내기</button></section>
<section class="card"><div class="toolbar"><b>${admin?'전체 건의사항':'내 건의사항'}</b><span class="spacer"></span><span class="tiny muted" data-suggestion-count>${runtime.suggestionsLoading?'불러오는 중':`페이지 ${runtime.suggestionPage+1} · ${runtime.suggestions.length}건`}</span></div><div class="suggestion-list">${runtime.suggestionsLoading?'<div class="empty" style="height:100px">불러오는 중…</div>':suggestionRowsHtml()}</div><div class="suggestion-pager"><button class="btn" data-suggest-prev ${runtime.suggestionPage<=0?'disabled':''}>← 이전 20개</button><span class="tiny muted" data-suggestion-page>${runtime.suggestionPage+1}페이지</span><button class="btn primary" data-suggest-next ${runtime.suggestionsHasMore?'':'disabled'}>다음 20개 →</button></div></section></div>`,'건의함')
}
function settings(){
const configured=V.Auth?.configured?.(),u=V.Auth?.user,notice=runtime.authNotice,pending=runtime.pendingAuthEmail,sched=officialScheduleState();
const scheduleText=sched.written?`필기시험 ${esc(sched.written)} · ${esc(ddayText(sched.dday))}`:'공식 일정 대기 중';
return shell(`<div class="settings-page screen-scroll" data-scroll-owner="settings"><section class="card settings-account"><b>계정</b>${u?`<p><b>${esc(u.email)}</b></p><div class="settings-actions"><button class="btn primary" data-cloud-sync>동기화</button><button class="btn ghost" data-signout>로그아웃</button></div>`:configured?`${notice?`<div class="privacy settings-notice">${esc(notice)}</div>`:''}<div class="form-grid settings-auth-form"><label>이메일<input id="authEmail" class="input" type="email" autocomplete="email" value="${esc(pending||'')}"></label><label>비밀번호<input id="authPw" class="input" type="password" minlength="8" autocomplete="current-password"></label></div><div class="settings-actions"><button class="btn primary" data-signin>로그인</button><button class="btn" data-signup>회원가입</button><button class="btn ghost" data-resend-confirmation>인증메일 다시 보내기</button></div>`:'<p class="muted">현재 기기에 학습 기록을 저장합니다.</p>'}</section>
<section class="card"><b>시험 목표</b><div class="official-date-readonly"><span>목표</span><strong>${esc(sched.year)} 소방공무원 시험</strong><small>${scheduleText}</small><p class="tiny muted">시험일과 원서접수 일정은 공식 공고 감시에서 확인된 값만 자동 반영합니다. 예상 날짜는 입력하지 않습니다.</p></div><div class="form-grid" style="margin-top:9px"><label>하루 공부(분)<input id="profileDaily" class="input" type="number" min="5" max="1440" value="${state().profile.dailyMinutes||40}"></label><label>수준<select id="profileLevel" class="select">${['처음 시작','기초 있음','재도전'].map(x=>`<option ${state().profile.level===x?'selected':''}>${x}</option>`).join('')}</select></label></div><button class="btn primary" data-profile-save style="margin-top:9px">저장</button></section>
<section class="card"><b>백업 · 복원</b><div class="settings-actions" style="margin-top:9px"><button class="btn" data-export>내 기록 백업</button></div><label class="backup-file-label">백업 파일 선택<input id="importBackup" class="input" type="file" accept="application/json"></label></section><section class="card"><b>개인정보</b><p class="muted">내 학습 기록과 직접 작성한 메모는 다른 회원에게 공개되지 않습니다.</p></section></div>`,'설정')
}
function view(){if(memberGateRequired())return loginGate();if(state().page==='tutor'){state().page='study';state().studyTab='ai';S.save()}return({home,study,notes,bank,exam,wrong,stats,resources,suggestions,settings}[state().page]||home)()}
function scrollTutorToBottom(s,force){requestAnimationFrame(()=>requestAnimationFrame(()=>{const x=[...document.querySelectorAll('.study-ai-chat')].find(e=>e.offsetParent!==null);if(!x)return;const b=x.closest('.study[data-scroll-owner="study"]');if(!b)return;if(force||!s||s[1])b.scrollTop=b.scrollHeight;else b.scrollTop=s[0];runtime.tutorForceLatest=false}))}
function render(){const a=state().page==='study'&&state().studyTab==='ai',x=a?[...document.querySelectorAll('.study-ai-chat')].find(e=>e.offsetParent!==null):null,b=x?.closest('.study[data-scroll-owner="study"]'),s=b&&[b.scrollTop,b.scrollHeight-b.clientHeight-b.scrollTop<25],f=runtime.tutorForceLatest;document.querySelector('#app').innerHTML=view();if(a)scrollTutorToBottom(s,f);if(state().page==='study'&&state().studyTab==='detail')bindDetailSectionTracking()}
function syncDetailTocActive(root,key,{scrollChip=false}={}){
const view=root?.querySelector?.('.detail-view')||root?.closest?.('.detail-view')||document.querySelector('.detail-view');if(!view)return;
const wanted=String(key??'');
view.querySelectorAll('[data-detail-section]').forEach(sec=>sec.classList.toggle('detail-section-active',String(sec.dataset.detailSection||'')===wanted));
view.querySelectorAll('[data-detail-jump]').forEach(btn=>{const on=String(btn.dataset.detailJump||'')===wanted;btn.classList.toggle('on',on);if(on){btn.setAttribute('aria-current','location');if(scrollChip)btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'})}else btn.removeAttribute('aria-current')})
}
function bindDetailSectionTracking(){
const owner=document.querySelector('.page-study .study[data-scroll-owner="study"]'),view=owner?.querySelector('.detail-view');if(!owner||!view)return;
const sections=[...view.querySelectorAll('[data-detail-section]')];if(!sections.length)return;
let raf=0;
const update=()=>{raf=0;const r0=owner.getBoundingClientRect(),anchor=r0.top+Math.min(120,Math.max(72,owner.clientHeight*.20));let best=sections[0],bestScore=Infinity;for(const sec of sections){const r=sec.getBoundingClientRect(),passed=r.top<=anchor,score=(passed?0:500)+Math.abs(r.top-anchor);if(score<bestScore){best=sec;bestScore=score}}syncDetailTocActive(view,best.dataset.detailSection)};
owner.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});requestAnimationFrame(update)
}
function sourceAnchorQueries(c,p=V.contentPacks.get(c?.id)){const t=String(c?.title||'').trim(),a=[t,t.replace(/\s*(?:개론|원리|이론|기초|종류|구조|방법|개요)\s*$/,''),...t.split(/[·,/()\s-]+/),...(V.ConceptArchitecture119?.termsFor?.(c?.id)||[]),...(p?.compare||[]).flatMap(x=>x||[]),...(p?.must||[]).flatMap(x=>String(x||'').split(/\s*(?:→|:|=|·|\/|,)\s*/))],stop=/^(개념|기초|종류|이론|구조|원리|정리|방법|특징|설명|및)$/;return[...new Set(a.map(x=>String(x||'').replace(/^[★☆\d.\s-]+/,'').trim()).filter(x=>x.length>=2&&x.length<=28&&!stop.test(x)))].sort((a,b)=>b.length-a.length).slice(0,18)}
function evidenceQueries(c,p){const q=p?.studySchema||{};return[...sourceAnchorQueries(c,p),p?.summary,q.definition,...(q.conditions||[]),...(q.mechanisms||[]),...(p?.must||[]),...(p?.detail||[]),...(p?.compare||[]).flat()].filter(Boolean).slice(0,30)}
function hasAnchorEvidence(r,a){const l=(r?.evidenceLines||[]).map(studyNorm),t=(a||[]).map(studyNorm).filter(x=>x.length>=2);return t.some(x=>l.some(y=>y.includes(x)))}
const QUESTION_EVIDENCE_GENERIC=new Set(['정답','오답','교재','공식','내용','설명','해당','가장','것','이다','한다','된다','있다','제시한다','설명한다']);
function questionEvidencePhraseCandidates(value){
const clean=studentStudyText(value).replace(/^(?:정답|오답)\s*[.:：-]?\s*/,'').replace(/^(?:공식\s*)?교재(?:는|에서|상|에\s*따르면)?\s*/,'').replace(/\s+/g,' ').trim(),out=[],seen=new Set;
const add=raw=>{const x=String(raw||'').replace(/^[,.;:·\s]+|[,.;:·\s]+$/g,'').trim(),k=studyNorm(x);if(k.length<4||k.length>48||QUESTION_EVIDENCE_GENERIC.has(k)||seen.has(k))return;seen.add(k);out.push(x)};
add(clean);
for(const part of clean.split(/[.;。!?！？]+/))add(part);
const words=clean.split(/\s+/).filter(Boolean);
for(let size=Math.min(4,words.length);size>=2;size--)for(let i=0;i+size<=words.length;i++){const phrase=words.slice(i,i+size).join(' ');if(!phrase.split(/\s+/).every(x=>QUESTION_EVIDENCE_GENERIC.has(studyNorm(x))))add(phrase)}
return out.sort((a,b)=>studyNorm(b).length-studyNorm(a).length).slice(0,10)
}
function questionSourceEvidence(q){
const c=V.curriculum.byId[q?.conceptId],p=V.contentPacks.get(q?.conceptId),correct=studentStudyText(q?.choices?.[q?.a]||''),choiceEx=studentStudyText(q?.choiceExplanations?.[q?.a]||''),ex=studentStudyText(q?.ex||''),rawAnchors=[...questionEvidencePhraseCandidates(correct),...questionEvidencePhraseCandidates(choiceEx),...questionEvidencePhraseCandidates(ex)],anchors=[],seen=new Set;
for(const x of rawAnchors){const k=studyNorm(x);if(!k||seen.has(k))continue;seen.add(k);anchors.push(x);if(anchors.length>=10)break}
const queries=[correct,choiceEx,ex,...anchors,...evidenceQueries(c,p)].filter(Boolean);
return{anchors,queries:[...new Set(queries)].slice(0,36)}
}
function questionSourceBookPage(q,key,c){
const m=String(q?.source||'').match(/(\d{1,4})\s*(?:쪽|페이지|p\.?)/i),n=Number(m?.[1]||0);if(!n)return 0;const ranges=(c?.sourceRanges||[]).filter(x=>x?.doc===key);if(!ranges.length)return n;return ranges.some(r=>n>=Number(r.from||0)&&n<=Number(r.to||r.from||0))?n:0
}
function syncPdfToolsDisclosure(root=document){
const desktop=matchMedia('(min-width:721px)').matches;
for(const tools of root.querySelectorAll?.('.pdf-mobile-tools')||[])tools.open=desktop
}
function sourceModal(id){return openPdfEvidence(id)}
async function downloadOfficialPdf(key){if(!key||!V.SourcePDF?.download)return toast('다운로드할 PDF가 없습니다.');try{const r=await V.SourcePDF.download(key,{timeoutMs:120000});toast(`PDF 다운로드 시작 · ${r?.name||key}`)}catch(err){toast('PDF 다운로드 실패 · '+String(err?.message||err).slice(0,46))}}
const sourceOverlay=()=>document.querySelector('#pdfEvidence,#resourcePdf,#sourceModal');
let sourceFocusReturn=null,sourceDialogSeq=0,sourceFocusGeneration=0;
const sourceFocusable=root=>[...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0});
function sourceFocusRef(el){
if(!(el instanceof HTMLElement))return null;
let selector='';
if(el.dataset?.resourceDoc)selector='[data-resource-doc="'+CSS.escape(el.dataset.resourceDoc)+'"]';
else if(el.dataset?.sourceConcept)selector='[data-source-concept="'+CSS.escape(el.dataset.sourceConcept)+'"]';
else if(el.id)selector='#'+CSS.escape(el.id);
return{element:el,selector}
}
function sourceFocusTarget(ref){
if(ref?.element?.isConnected)return ref.element;
if(ref?.selector){
const rows=[...document.querySelectorAll(ref.selector)];
const visible=rows.find(el=>el instanceof HTMLElement&&el.offsetParent!==null&&el.getClientRects().length);
if(visible instanceof HTMLElement)return visible;
const el=rows.find(el=>el instanceof HTMLElement);if(el instanceof HTMLElement)return el
}
return null
}
function sourceOpen(opener=null){
sourceFocusGeneration++;
const overlay=sourceOverlay();if(!overlay)return false;
if(opener instanceof HTMLElement&&!overlay.contains(opener))sourceFocusReturn=sourceFocusRef(opener);
else if(document.activeElement instanceof HTMLElement&&!overlay.contains(document.activeElement))sourceFocusReturn=sourceFocusRef(document.activeElement);
const modal=overlay.querySelector('.modal')||overlay;
const pdfTools=modal.querySelector('.pdf-mobile-tools');if(pdfTools&&matchMedia('(min-width:721px)').matches)pdfTools.open=true;
modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('tabindex','-1');
const heading=modal.querySelector('h1,h2,h3');if(heading){if(!heading.id)heading.id='source-dialog-title-'+(++sourceDialogSeq);modal.setAttribute('aria-labelledby',heading.id)}
history.pushState({...history.state,sourceView:1},'');
requestAnimationFrame(()=>{const first=sourceFocusable(modal)[0]||modal;try{first.focus({preventScroll:true})}catch{first.focus?.()}});
return true
}
function restoreSourceFocus(){
const ref=sourceFocusReturn;sourceFocusReturn=null;
if(!ref)return false;
const generation=sourceFocusGeneration;
const apply=()=>{
if(generation!==sourceFocusGeneration)return false;
const focus=sourceFocusTarget(ref);if(!focus)return false;
try{focus.focus({preventScroll:true})}catch{focus.focus?.()}
return document.activeElement===focus
};
apply();
requestAnimationFrame(()=>apply());
setTimeout(()=>apply(),60);
setTimeout(()=>apply(),240);
return true
}
function sourceClose(pop=false){
const x=sourceOverlay();
if(!x){if(pop)restoreSourceFocus();return false}
x.remove();
if(!pop&&history.state?.sourceView){history.back();return true}
restoreSourceFocus();return true
}
/* V66 real interaction scroll bridge: keep one owner while eliminating fixed-chrome wheel/touch dead zones. */
function interactionScrollOwner(target){
if(!(target instanceof Element))return null;
const pdfModal=target.closest('.pdf-evidence-modal');
if(pdfModal){
if(target.closest('.pdf-evidence-host'))return null;
return pdfModal.querySelector('.pdf-evidence-host[data-scroll-owner="pdf"]');
}
const studyPage=target.closest('.page-study');
if(studyPage){
const owner=studyPage.querySelector('.study[data-scroll-owner="study"]');
if(target.closest('.outline,.backdrop'))return null;
if(owner?.contains(target))return null;
return owner||null;
}
const examPage=target.closest('.page-exam.exam-active');
if(examPage){
if(target.closest('.exam-body'))return null;
return examPage.querySelector('.exam-body[data-scroll-owner="exam-active"]');
}
if(target.closest('.top')){
const page=document.querySelector('.page');
return page?[...page.querySelectorAll('[data-scroll-owner]')].find(el=>el.offsetParent!==null)||null:null;
}
return null;
}
function moveInteractionScroll(owner,delta){
if(!owner||!owner.isConnected||!Number.isFinite(delta)||Math.abs(delta)<.01)return false;
const max=Math.max(0,owner.scrollHeight-owner.clientHeight),before=owner.scrollTop;
if(max<=0)return false;
owner.scrollTop=Math.max(0,Math.min(max,before+delta));
return Math.abs(owner.scrollTop-before)>.5;
}
document.addEventListener('wheel',e=>{
if(e.ctrlKey||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
const owner=interactionScrollOwner(e.target);if(!owner)return;
const unit=e.deltaMode===1?16:e.deltaMode===2?Math.max(1,owner.clientHeight):1;
if(moveInteractionScroll(owner,e.deltaY*unit))e.preventDefault();
},{passive:false,capture:true});
let interactionTouch=null;
document.addEventListener('touchstart',e=>{
if(e.touches?.length!==1){interactionTouch=null;return}
const owner=interactionScrollOwner(e.target);if(!owner){interactionTouch=null;return}
const t=e.touches[0];
interactionTouch={owner,startX:t.clientX,startY:t.clientY,lastX:t.clientX,lastY:t.clientY,decided:false,vertical:false};
},{passive:true,capture:true});
document.addEventListener('touchmove',e=>{
const s=interactionTouch;if(!s||!s.owner?.isConnected||e.touches?.length!==1)return;
const t=e.touches[0],totalX=t.clientX-s.startX,totalY=t.clientY-s.startY;
if(!s.decided&&(Math.abs(totalX)>7||Math.abs(totalY)>7)){s.decided=true;s.vertical=Math.abs(totalY)>Math.abs(totalX)}
const delta=s.lastY-t.clientY;s.lastX=t.clientX;s.lastY=t.clientY;
if(!s.decided||!s.vertical)return;
if(moveInteractionScroll(s.owner,delta))e.preventDefault();
},{passive:false,capture:true});
const clearInteractionTouch=()=>{interactionTouch=null};
document.addEventListener('touchend',clearInteractionTouch,{passive:true,capture:true});
document.addEventListener('touchcancel',clearInteractionTouch,{passive:true,capture:true});
function requestedPdfPage(key,raw){
const n=Math.floor(Number(raw)||0);if(n<1)return 0;
return Object.prototype.hasOwnProperty.call(V.SourcePDF?.pageOffsets||{},key)?(V.SourcePDF.pdfPage?.(key,n)||n):n
}
async function locatePdfText(key,query){
const q=String(query||'').trim();if(q.length<2)return{query:q,error:'SEARCH_QUERY_SHORT'};
try{
const found=V.SourcePDF.findPages?await V.SourcePDF.findPages(key,q,{limit:12}):null;
if(found?.results?.length)return{query:q,page:found.results[0].page,pages:found.pages,results:found.results,index:0};
const hit=await V.SourcePDF.locate(key,[q]);return hit?.score>0?{query:q,...hit,results:[{page:hit.page,score:hit.score}],index:0}:{query:q,error:'SEARCH_NOT_FOUND'}
}catch(err){return{query:q,error:String(err?.message||err)}}
}
function pdfSearchPages(root){try{return JSON.parse(root?.dataset?.searchResults||'[]').map(Number).filter(x=>x>0)}catch{return[]}}
function clearPdfSearchState(root){if(!root)return;delete root.dataset.searchQuery;delete root.dataset.searchResults;delete root.dataset.searchIndex}
function syncPdfSearchNav(root,kind){
if(!root)return;const pages=pdfSearchPages(root),index=Math.max(0,Math.min(Number(root.dataset.searchIndex)||0,Math.max(0,pages.length-1))),box=root.querySelector(kind==='resource'?'[data-resource-pdf-search-nav]':'[data-pdf-search-nav]'),label=root.querySelector(kind==='resource'?'[data-resource-pdf-search-label]':'[data-pdf-search-label]'),prev=root.querySelector(kind==='resource'?'[data-resource-pdf-search-prev]':'[data-pdf-search-prev]'),next=root.querySelector(kind==='resource'?'[data-resource-pdf-search-next]':'[data-pdf-search-next]');
if(!box)return;if(pages.length){box.classList.remove('hidden');if(label)label.textContent=`검색 ${index+1}/${pages.length}`;if(prev)prev.disabled=index<=0;if(next)next.disabled=index>=pages.length-1}else box.classList.add('hidden')
}
addEventListener('resize',()=>syncPdfToolsDisclosure(document));addEventListener('popstate',()=>sourceClose(true));addEventListener('keydown',e=>{
const overlay=sourceOverlay();
if(e.key==='Escape'&&overlay){e.preventDefault();sourceClose();return}
if(e.key==='Tab'&&overlay){
const modal=overlay.querySelector('.modal')||overlay,items=sourceFocusable(modal);if(!items.length){e.preventDefault();modal.focus();return}
const first=items[0],last=items[items.length-1],active=document.activeElement;
if(e.shiftKey&&(active===first||!modal.contains(active))){e.preventDefault();last.focus();return}
if(!e.shiftKey&&(active===last||!modal.contains(active))){e.preventDefault();first.focus();return}
}
if(e.key!=='Enter'||!(e.target instanceof Element))return;
if(e.target.matches('[data-pdf-search-input]')){e.preventDefault();document.querySelector('[data-pdf-search]')?.click()}
else if(e.target.matches('[data-resource-pdf-search-input]')){e.preventDefault();document.querySelector('[data-resource-pdf-search]')?.click()}
else if(e.target.matches('[data-pdf-jump-input]')){e.preventDefault();document.querySelector('[data-pdf-jump]')?.click()}
else if(e.target.matches('[data-resource-pdf-jump-input]')){e.preventDefault();document.querySelector('[data-resource-pdf-jump]')?.click()}
else if(e.target.matches('[data-tutor-input]')&&!e.isComposing){e.preventDefault();sendTutor()}
})
async function renderResourcePdf(key,pageOverride=1){
const root=document.querySelector('#resourcePdf');if(!root)return;
root.dataset.renderState='loading';
const host=root.querySelector('#resourcePdfHost'),badge=root.querySelector('[data-resource-page-label]'),catalog=V.SourceCatalog119?.get?.(key),official=catalog?.officialPage||V.SourcePDF?.sourcePage?.(key)||'',searchQuery=String(root.dataset.searchQuery||'').trim();
if(!catalog||!V.SourcePDF){host.innerHTML='<div class="empty">연결된 원문이 없습니다.</div>';return}
host.innerHTML='<div class="pdf-loading"><b>공식 교재 여는 중…</b><small>필요한 페이지만 불러옵니다.</small><div class="progressbar"><i style="width:35%"></i></div></div>';
try{
const qs=searchQuery?[searchQuery]:[],result=await V.SourcePDF.render(key,Number(pageOverride)||1,host,qs,{timeoutMs:30000,zoom:Number(root.dataset.zoom)||1,anchorTerms:qs});
root.dataset.page=String(result.page);root.dataset.pages=String(result.pages);root.dataset.renderState='ready';const zl=root.querySelector('[data-resource-zoom-label]');if(zl)zl.textContent=Math.round((result.zoom||1)*100)+'%';
const searchPages=pdfSearchPages(root),searchIndex=Math.max(0,Math.min(Number(root.dataset.searchIndex)||0,Math.max(0,searchPages.length-1)));badge.textContent=(result.bookPage?`교재 ${result.bookPage}쪽`:`PDF ${result.page}/${result.pages}쪽`)+(searchQuery?` · 검색 ${searchPages.length?searchIndex+1+'/'+searchPages.length:'결과'}`:'');syncPdfSearchNav(root,'resource');
const prev=root.querySelector('[data-resource-pdf-page="-1"]'),next=root.querySelector('[data-resource-pdf-page="1"]');
if(prev)prev.disabled=result.page<=1;if(next)next.disabled=result.page>=result.pages;
root.querySelector('.pdf-pager')?.classList.remove('hidden');
}catch(err){
root.dataset.renderState='error';
badge.textContent='원문을 불러오지 못했습니다';
host.innerHTML=`<div class="source-connect official-fallback"><b>교재를 불러오지 못했습니다.</b><p>30초 안에 열리지 않으면 연결을 중단합니다. 다시 시도하거나 공식 사이트에서 바로 확인하세요.</p><div class="toolbar"><button class="btn primary" data-resource-pdf-retry>다시 시도</button>${official?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(official)}">중앙소방학교 원문 열기</a>`:''}</div></div>`;
root.querySelector('.pdf-pager')?.classList.add('hidden');
}
}
async function openResourcePdf(key,opener=null){
const row=V.SourceCatalog119?.get?.(key);if(!row)return;
const mapped=Object.prototype.hasOwnProperty.call(V.SourcePDF?.pageOffsets||{},key),pageLabel=mapped?'교재 쪽':'PDF 쪽';
document.querySelector('#resourcePdf')?.remove();
document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="resourcePdf" data-resource-pdf-backdrop data-doc-key="${esc(key)}" data-page="1" data-zoom="1"><div class="modal pdf-evidence-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 자료</span><h2>${esc(row.label)}</h2><small data-resource-page-label class="muted">PDF 여는 중</small></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small" data-resource-download="${esc(key)}">다운로드</button><button class="btn small ghost pdf-close-btn" data-resource-pdf-close>닫기 ✕</button></div><details class="pdf-mobile-tools"><summary>확대 · 검색 · 쪽 이동</summary><div class="pdf-mobile-tools-body"><div class="toolbar pdf-zoombar"><button class="btn small ghost" data-resource-pdf-zoom="-0.25">−</button><span class="pill" data-resource-zoom-label>100%</span><button class="btn small ghost" data-resource-pdf-zoom="0.25">＋</button><button class="btn small ghost" data-resource-pdf-fit>폭 맞춤</button></div><div class="pdf-findbar"><div class="pdf-jump-control"><input class="input" type="number" min="1" inputmode="numeric" data-resource-pdf-jump-input placeholder="${pageLabel}" aria-label="${pageLabel} 이동"><button class="btn small" data-resource-pdf-jump>이동</button></div><div class="pdf-search-control"><input class="input" type="search" data-resource-pdf-search-input placeholder="원문 안에서 검색" aria-label="PDF 원문 검색"><button class="btn small primary" data-resource-pdf-search>검색</button></div></div></div></details><div class="pdf-search-results hidden" data-resource-pdf-search-nav><button class="btn small ghost" data-resource-pdf-search-prev>← 이전 결과</button><span class="pill" data-resource-pdf-search-label></span><button class="btn small ghost" data-resource-pdf-search-next>다음 결과 →</button></div><div id="resourcePdfHost" class="pdf-evidence-host" data-scroll-owner="pdf"><div class="empty">공식 교재 확인 중…</div></div><div class="toolbar pdf-pager hidden"><button class="btn ghost" data-resource-pdf-page="-1">← 이전 페이지</button><button class="btn ghost" data-resource-pdf-page="1">다음 페이지 →</button></div></div></div>`);syncPdfToolsDisclosure(document.querySelector('#resourcePdf'));sourceOpen(opener);
await renderResourcePdf(key,1);
}
async function renderPdfEvidence(id,pageOverride=null){
const root=document.querySelector('#pdfEvidence');if(!root)return;
root.dataset.renderState='loading';delete root.dataset.anchorVerified;
const c=V.curriculum.byId[id],p=V.contentPacks.get(id),range=(c?.sourceRanges||[])[0],key=range?.doc||'',host=root.querySelector('#pdfEvidenceHost'),badge=root.querySelector('[data-pdf-page-label]'),questionId=String(root.dataset.questionId||''),question=V.questionById?.[questionId],questionEvidence=question?questionSourceEvidence(question):null,anchorQueries=questionEvidence?.anchors?.length?questionEvidence.anchors:sourceAnchorQueries(c,p),queries=questionEvidence?.queries?.length?questionEvidence.queries:evidenceQueries(c,p),manualQuery=String(root.dataset.searchQuery||'').trim(),renderQueries=manualQuery?[manualQuery,...queries]:queries,renderAnchors=manualQuery?[manualQuery]:anchorQueries;
if(!key||!V.SourcePDF){host.innerHTML='<div class="empty">연결된 원문이 없습니다.</div>';return}
const availability=await V.SourcePDF.availability(key),catalog=V.SourceCatalog119?.get?.(key),official=availability.officialPage||catalog?.officialPage||V.SourcePDF.sourcePage(key)||'',staticRange=catalog?.transport==='range-static';
if(!availability.local&&!availability.direct){badge.textContent='공식 원문';host.innerHTML=`<div class="source-connect official-fallback"><b>원문을 바로 불러올 수 없습니다.</b>${official?`<a class="btn primary block" target="_blank" rel="noopener" href="${esc(official)}">중앙소방학교 원문 열기</a>`:''}</div>`;root.querySelector('.pdf-pager')?.classList.add('hidden');return}
const loadingActions=`<div class="pdf-loading-actions">${official?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(official)}">공식 사이트에서 열기</a>`:''}<button class="btn ghost" data-source-close>닫기</button></div>`;
host.innerHTML=staticRange
?`<div class="pdf-loading"><b>공식 교재 여는 중…</b><small>필요한 페이지만 불러옵니다. 원문 연결 상태를 확인하며 불러옵니다.</small><div class="progressbar"><i style="width:35%"></i></div><span>원문 준비 중</span>${loadingActions}</div>`
:`<div class="pdf-loading"><b>공식 원문 여는 중…</b><small>연결된 공식 PDF의 해당 페이지를 불러옵니다. 원문 연결 상태를 확인하며 불러옵니다.</small><div class="progressbar"><i data-pdf-progress style="width:${availability.local?100:4}%"></i></div><span data-pdf-progress-label>${availability.local?'교재 확인 중':'원문 준비 중'}</span>${loadingActions}</div>`;
try{
const bookFrom=Number(range?.from)||0,questionBookPage=questionSourceBookPage(question,key,c),targetBookPage=questionBookPage||bookFrom,initialPdfPage=targetBookPage?(V.SourcePDF.pdfPage?.(key,targetBookPage)||targetBookPage):0;
let page=Number(pageOverride)||Number(root.dataset.page)||initialPdfPage||0;
const progress=({percent})=>{const bar=root.querySelector('[data-pdf-progress]'),label=root.querySelector('[data-pdf-progress-label]');if(bar&&percent!=null)bar.style.width=Math.max(4,percent)+'%';if(label)label.textContent='원문 준비 중'};
if(!page){badge.textContent='근거 위치 찾는 중…';const located=await V.SourcePDF.locate(key,queries);page=located.page;root.dataset.autoLocated='true'}
badge.textContent=manualQuery?'검색 결과 여는 중…':(staticRange?'공식 교재 여는 중…':'공식 원문 여는 중…');
let result=await V.SourcePDF.render(key,page,host,renderQueries,{timeoutMs:18000,onProgress:progress,anchorTerms:renderAnchors,zoom:Number(root.dataset.zoom)||1});
if(!manualQuery&&pageOverride==null&&!hasAnchorEvidence(result,anchorQueries)&&anchorQueries.length){
const mapped=(c?.sourceRanges||[]).filter(x=>x.doc===key),candidates=[];
const mappedHit=await V.SourcePDF.locate(key,queries,{bookRanges:mapped}).catch(()=>null);
if(mappedHit?.page&&mappedHit.score>0)candidates.push({...mappedHit,scope:'mapped'});
const broadHit=await Promise.race([V.SourcePDF.locate(key,queries).catch(()=>null),new Promise(res=>setTimeout(()=>res(null),6000))]);if(broadHit?.page&&broadHit.score>=8&&!candidates.some(x=>x.page===broadHit.page))candidates.push({...broadHit,scope:'document'});
for(const located of candidates){
const anchorResult=await V.SourcePDF.render(key,located.page,host,queries,{timeoutMs:18000,onProgress:progress,anchorTerms:anchorQueries,zoom:Number(root.dataset.zoom)||1});
if(hasAnchorEvidence(anchorResult,anchorQueries)||(!question&&anchorResult.hits>=2)){result=anchorResult;root.dataset.autoLocated='true';root.dataset.searchScope=located.scope;break}
}
}
const questionEvidenceMode=!!question,anchorVerified=!manualQuery&&(hasAnchorEvidence(result,anchorQueries)||(!questionEvidenceMode&&result.hits>=2));root.dataset.highlightCount=String(result.hits||0);
root.dataset.anchorVerified=anchorVerified?'true':'false';
root.dataset.page=String(result.page);root.dataset.pages=String(result.pages);root.dataset.renderState='ready';const zl=root.querySelector('[data-pdf-zoom-label]');if(zl)zl.textContent=Math.round((result.zoom||1)*100)+'%';
const truthLabel=manualQuery?'검색 결과':questionEvidenceMode&&anchorVerified?'정답 근거':anchorVerified?'공식 근거':'근거 위치 확인 필요';
const searchPages=pdfSearchPages(root),searchIndex=Math.max(0,Math.min(Number(root.dataset.searchIndex)||0,Math.max(0,searchPages.length-1))),searchSuffix=manualQuery&&searchPages.length?` ${searchIndex+1}/${searchPages.length}`:'';badge.textContent=result.bookPage?`교재 ${result.bookPage}쪽 · ${truthLabel}${searchSuffix}`:`PDF ${result.page}/${result.pages}쪽 · ${truthLabel}${searchSuffix}`;syncPdfSearchNav(root,'evidence');
const prev=root.querySelector('[data-pdf-page="-1"]'),next=root.querySelector('[data-pdf-page="1"]');if(prev)prev.disabled=result.page<=1;if(next)next.disabled=result.page>=result.pages;
root.querySelector('.pdf-pager')?.classList.remove('hidden')
}catch(err){
badge.textContent='원문을 불러오지 못했습니다';
host.innerHTML=`<div class="source-connect official-fallback"><b>교재를 불러오지 못했습니다.</b><p>연결이 지연되거나 중단되었습니다. 다시 시도하거나 공식 사이트에서 바로 확인할 수 있습니다.</p><div class="toolbar"><button class="btn primary" data-pdf-retry>다시 시도</button>${official?`<a class="btn ghost" target="_blank" rel="noopener" href="${esc(official)}">공식 사이트에서 열기</a>`:''}<button class="btn ghost" data-source-close>닫기</button></div></div>`;
root.querySelector('.pdf-pager')?.classList.add('hidden')
}
}
async function openPdfEvidence(id,opener=null,questionId=''){const c=V.curriculum.byId[id],pack=V.contentPacks?.get?.(id),range=(c?.sourceRanges||[]).find(x=>x?.doc)||(c?.sourceRanges||[])[0],key=range?.doc||'',bookFrom=Number(range?.from)||0;
if(!key){
const links=(pack?.officialLinks||[]).filter(x=>x?.url);
document.querySelector('#sourceModal')?.remove();document.querySelector('#pdfEvidence')?.remove();
if(!links.length){toast('연결된 공식 원문이 없습니다.');return}
document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="sourceModal" data-source-backdrop><div class="modal source-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 웹 근거</span><h2>${esc(c?.title||id)}</h2></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small ghost pdf-close-btn" data-source-close>닫기 ✕</button></div><p class="lead">${esc(pack?.source||'공식 근거')}</p><div class="source-law-links">${links.map(x=>`<a class="source-law-link" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.label||'공식 원문')} <span aria-hidden="true">↗</span></a>`).join('')}</div></div></div>`);sourceOpen(opener);
return
}
const question=V.questionById?.[questionId],questionBookFrom=questionSourceBookPage(question,key,c),targetBookFrom=questionBookFrom||bookFrom,hasMappedBookPage=Object.prototype.hasOwnProperty.call(V.SourcePDF?.pageOffsets||{},key),initialPdf=targetBookFrom?(V.SourcePDF.pdfPage?.(key,targetBookFrom)||targetBookFrom):0;document.querySelector('#sourceModal')?.remove();document.querySelector('#pdfEvidence')?.remove();document.body.insertAdjacentHTML('beforeend',`<div class="modal-wrap" id="pdfEvidence" data-pdf-backdrop data-concept-id="${esc(id)}" data-question-id="${esc(questionId)}" data-doc-key="${esc(key)}" data-page="${initialPdf||''}" data-zoom="1"><div class="modal pdf-evidence-modal"><div class="toolbar pdf-modal-head"><div><span class="eyebrow">공식 근거</span><h2>${esc(c?.title||id)}</h2><small data-pdf-page-label class="muted">${targetBookFrom?(hasMappedBookPage?`교재 ${targetBookFrom}쪽`:`PDF ${targetBookFrom}쪽`):'근거 위치 찾기'}</small></div><span class="spacer"></span><button class="btn small ghost" data-source-back>← 뒤로</button><button class="btn small" data-pdf-download>다운로드</button><button class="btn small ghost pdf-close-btn" data-pdf-close>닫기 ✕</button></div><details class="pdf-mobile-tools"><summary>확대 · 검색 · 쪽 이동</summary><div class="pdf-mobile-tools-body"><div class="toolbar pdf-zoombar"><button class="btn small ghost" data-pdf-zoom="-0.25">−</button><span class="pill" data-pdf-zoom-label>100%</span><button class="btn small ghost" data-pdf-zoom="0.25">＋</button><button class="btn small ghost" data-pdf-fit>폭 맞춤</button></div><div class="pdf-findbar"><div class="pdf-jump-control"><input class="input" type="number" min="1" inputmode="numeric" data-pdf-jump-input placeholder="${hasMappedBookPage?'교재 쪽':'PDF 쪽'}" aria-label="원문 쪽 이동"><button class="btn small" data-pdf-jump>이동</button></div><div class="pdf-search-control"><input class="input" type="search" data-pdf-search-input placeholder="원문 안에서 검색" aria-label="원문 검색"><button class="btn small primary" data-pdf-search>검색</button></div></div></div></details><div class="pdf-search-results hidden" data-pdf-search-nav><button class="btn small ghost" data-pdf-search-prev>← 이전 결과</button><span class="pill" data-pdf-search-label></span><button class="btn small ghost" data-pdf-search-next>다음 결과 →</button></div><div id="pdfEvidenceHost" class="pdf-evidence-host" data-scroll-owner="pdf"><div class="empty">공식 원문 여는 중…</div></div><div class="toolbar pdf-pager hidden"><button class="btn ghost" data-pdf-page="-1">← 이전 페이지</button><button class="btn ghost" data-pdf-page="1">다음 페이지 →</button></div></div></div>`);syncPdfToolsDisclosure(document.querySelector('#pdfEvidence'));sourceOpen(opener);await renderPdfEvidence(id)}
document.addEventListener('click',async e=>{const t=e.target instanceof Element?e.target:null;if(!t)return;if(t.matches('[data-backdrop-close-more]')){runtime.more=false;return render()}if(t.matches('[data-backdrop-close-account]')){runtime.account=false;return render()}if(t.matches('[data-source-backdrop],[data-resource-pdf-backdrop],[data-pdf-backdrop]')){sourceClose();return}const b=t.closest('button,[data-outline-close]');if(!b)return;if('toastAction'in b.dataset){const action=runtime.toastAction;runtime.toast='';runtime.toastAction=null;runtime.toastToken='';render();if(action?.run)await action.run();return}if(b.dataset.detailJump!==undefined){const key=String(b.dataset.detailJump||''),root=b.closest('.study-body')||document,target=root.querySelector(`[data-detail-section="${CSS.escape(key)}"]`);if(target?.tagName==='DETAILS')target.open=true;syncDetailTocActive(root,key,{scrollChip:true});target?.scrollIntoView({behavior:'smooth',block:'start'});return}if('sourceBack'in b.dataset){sourceClose();return}if('resourcePdfClose'in b.dataset){sourceClose();return}
if(b.dataset.resourceDoc){await openResourcePdf(b.dataset.resourceDoc,b);return}
if(b.dataset.resourceDownload){await downloadOfficialPdf(b.dataset.resourceDownload);return}
if('resourcePdfRetry'in b.dataset){const root=document.querySelector('#resourcePdf'),key=root?.dataset.docKey||'';if(key)await V.SourcePDF.clearPdfCache?.(key);await renderResourcePdf(key,Number(root?.dataset.page)||1);return}if(b.dataset.resourcePdfPage){const root=document.querySelector('#resourcePdf'),key=root?.dataset.docKey,current=Number(root?.dataset.page)||1;await renderResourcePdf(key,current+Number(b.dataset.resourcePdfPage));return}if(b.dataset.resourcePdfZoom){const root=document.querySelector('#resourcePdf');root.dataset.zoom=String(Math.max(.75,Math.min(2.25,(Number(root.dataset.zoom)||1)+Number(b.dataset.resourcePdfZoom))));await renderResourcePdf(root.dataset.docKey,Number(root.dataset.page)||1);return}if('resourcePdfFit'in b.dataset){const root=document.querySelector('#resourcePdf');root.dataset.zoom='1';await renderResourcePdf(root.dataset.docKey,Number(root.dataset.page)||1);return}
if('resourcePdfJump'in b.dataset){const root=document.querySelector('#resourcePdf'),key=root?.dataset.docKey||'',raw=root?.querySelector('[data-resource-pdf-jump-input]')?.value||'',page=requestedPdfPage(key,raw);if(!page)return toast('이동할 쪽 번호를 입력하세요.');clearPdfSearchState(root);await renderResourcePdf(key,page);return}
if('resourcePdfSearch'in b.dataset){const root=document.querySelector('#resourcePdf'),key=root?.dataset.docKey||'',input=root?.querySelector('[data-resource-pdf-search-input]'),q=input?.value.trim()||'';if(q.length<2)return toast('검색어를 2글자 이상 입력하세요.');const badge=root.querySelector('[data-resource-page-label]');if(badge)badge.textContent='원문 검색 중…';const hit=await locatePdfText(key,q);if(hit.error)return toast(hit.error==='SEARCH_NOT_FOUND'?'검색 결과가 없습니다.':'원문 검색에 실패했습니다.');const pages=(hit.results||[{page:hit.page}]).map(x=>x.page);root.dataset.searchQuery=q;root.dataset.searchResults=JSON.stringify(pages);root.dataset.searchIndex='0';await renderResourcePdf(key,pages[0]);return}if('resourcePdfSearchPrev'in b.dataset||'resourcePdfSearchNext'in b.dataset){const root=document.querySelector('#resourcePdf'),pages=pdfSearchPages(root),key=root?.dataset.docKey||'';if(!pages.length)return;let i=Number(root.dataset.searchIndex)||0;i+='resourcePdfSearchPrev'in b.dataset?-1:1;i=Math.max(0,Math.min(i,pages.length-1));root.dataset.searchIndex=String(i);await renderResourcePdf(key,pages[i]);return}
if('sourceClose'in b.dataset){sourceClose();return}if('pdfClose'in b.dataset){sourceClose();return}if('pdfRetry'in b.dataset){const root=document.querySelector('#pdfEvidence'),id=root?.dataset.conceptId;await V.SourcePDF.clearPdfCache?.(V.curriculum.byId[id]?.sourceRanges?.[0]?.doc||'');await renderPdfEvidence(id);return}if(b.dataset.pdfEvidence){await openPdfEvidence(b.dataset.pdfEvidence,b);return}if(b.dataset.pdfPage){const root=document.querySelector('#pdfEvidence'),id=root?.dataset.conceptId,current=Number(root?.dataset.page)||1;await renderPdfEvidence(id,current+Number(b.dataset.pdfPage));return}if(b.dataset.pdfZoom){const root=document.querySelector('#pdfEvidence');root.dataset.zoom=String(Math.max(.75,Math.min(2.25,(Number(root.dataset.zoom)||1)+Number(b.dataset.pdfZoom))));await renderPdfEvidence(root.dataset.conceptId,Number(root.dataset.page)||1);return}if('pdfFit'in b.dataset){const root=document.querySelector('#pdfEvidence');root.dataset.zoom='1';await renderPdfEvidence(root.dataset.conceptId,Number(root.dataset.page)||1);return}
if('pdfJump'in b.dataset){const root=document.querySelector('#pdfEvidence'),key=root?.dataset.docKey||'',id=root?.dataset.conceptId||'',raw=root?.querySelector('[data-pdf-jump-input]')?.value||'',page=requestedPdfPage(key,raw);if(!page)return toast('이동할 쪽 번호를 입력하세요.');clearPdfSearchState(root);await renderPdfEvidence(id,page);return}
if('pdfSearch'in b.dataset){const root=document.querySelector('#pdfEvidence'),key=root?.dataset.docKey||'',id=root?.dataset.conceptId||'',input=root?.querySelector('[data-pdf-search-input]'),q=input?.value.trim()||'';if(q.length<2)return toast('검색어를 2글자 이상 입력하세요.');const badge=root.querySelector('[data-pdf-page-label]');if(badge)badge.textContent='원문 검색 중…';const hit=await locatePdfText(key,q);if(hit.error)return toast(hit.error==='SEARCH_NOT_FOUND'?'검색 결과가 없습니다.':'원문 검색에 실패했습니다.');const pages=(hit.results||[{page:hit.page}]).map(x=>x.page);root.dataset.searchQuery=q;root.dataset.searchResults=JSON.stringify(pages);root.dataset.searchIndex='0';await renderPdfEvidence(id,pages[0]);return}if('pdfSearchPrev'in b.dataset||'pdfSearchNext'in b.dataset){const root=document.querySelector('#pdfEvidence'),pages=pdfSearchPages(root),id=root?.dataset.conceptId||'';if(!pages.length)return;let i=Number(root.dataset.searchIndex)||0;i+='pdfSearchPrev'in b.dataset?-1:1;i=Math.max(0,Math.min(i,pages.length-1));root.dataset.searchIndex=String(i);await renderPdfEvidence(id,pages[i]);return}if(b.dataset.examReport){runtime.examReportId=b.dataset.examReport;return go('stats')}if(b.dataset.skillTrain){state().page='exam';S.save();runtime.examReportId='';return startTraining('skill:'+b.dataset.skillTrain)}if('reportClose'in b.dataset){runtime.examReportId='';return render()}if(b.dataset.go)return go(b.dataset.go);if('more'in b.dataset){runtime.more=true;return render()}if('closeMore'in b.dataset){runtime.more=false;return render()}if('account'in b.dataset){runtime.account=true;return render()}if('closeAccount'in b.dataset){runtime.account=false;return render()}if('outline'in b.dataset){state().outline=!state().outline;S.save();return render()}if('outlineClose'in b.dataset){state().outline=false;S.save();return render()}if('outlineSearchClear'in b.dataset){runtime.outlineQuery='';render();requestAnimationFrame(()=>document.querySelector('[data-outline-search]')?.focus());return}if(b.dataset.subject){const target=b.dataset.subject==='ems'?'ems':'fire';rememberStudyPosition(state().subject);restoreStudySubject(target);runtime.outlineQuery='';state().outline=false;S.save();return render()}if(b.dataset.scope){const sc=V.curriculum.scopeById[b.dataset.scope];state().scopeId=sc.id;state().conceptId=`${sc.id}-C01`;S.save();return render()}if(b.dataset.hazmatClassToggle){runtime.hazmatClassOpen=runtime.hazmatClassOpen===b.dataset.hazmatClassToggle?'':b.dataset.hazmatClassToggle;return render()}
if('passNoteOpen'in b.dataset){runtime.noteSubject=currentConcept().subject==='ems'?'ems':'fire';runtime.noteFilter='all';return go('notes')}
if(b.dataset.passCore){const id=b.dataset.passCore;try{const r=await V.PassNote.toggleConceptCore(id);if(r.saved)toast('합격노트에 추가됨');else toast('합격노트에서 삭제됨',{actionLabel:'실행취소',onAction:async()=>{await V.PassNote.toggleConceptCore(id);toast('합격노트에 다시 추가됨')}});return render()}catch(err){return toast('합격노트 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.passStar){const id=b.dataset.passStar;try{const r=await V.PassNote.toggleConcept(id);if(r.saved)toast('합격노트에 저장됨');else toast('합격노트에서 해제됨',{actionLabel:'실행취소',onAction:async()=>{await V.PassNote.toggleConcept(id);toast('합격노트에 다시 저장됨')}});return render()}catch(err){return toast('합격노트 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.passQuestion){const id=b.dataset.passQuestion;try{const r=await V.PassNote.toggleQuestion(id);if(r.saved)toast('문제를 합격노트에 저장');else toast('합격노트에서 문제 해제',{actionLabel:'실행취소',onAction:async()=>{await V.PassNote.toggleQuestion(id);toast('문제를 다시 저장함')}});return render()}catch(err){return toast('문제 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.passExport){try{V.PassNote.exportPdf(b.dataset.passExport);toast('인쇄 화면에서 PDF로 저장하세요.')}catch(err){toast(err?.message==='POPUP_BLOCKED'?'팝업을 허용한 뒤 다시 눌러주세요.':'PDF 내보내기 실패')}return}
if(b.dataset.passEditable){try{await V.PassNote.exportEditable(b.dataset.passEditable);toast('한글/Word 호환 DOCX를 저장했습니다.')}catch(err){toast('DOCX 내보내기 실패 · '+String(err?.message||err).slice(0,40))}return}
if('suggestRefresh'in b.dataset){runtime.suggestionsOwner='';await ensureSuggestions(true);return}
if('suggestPrev'in b.dataset){if(runtime.suggestionPage>0){runtime.suggestionPage--;runtime.suggestionsOwner='';await ensureSuggestions(true)}return}
if('suggestNext'in b.dataset){if(runtime.suggestionsHasMore){runtime.suggestionPage++;runtime.suggestionsOwner='';await ensureSuggestions(true)}return}
if('suggestSubmit'in b.dataset){const category=$('#suggestCategory')?.value||'개선',title=$('#suggestTitle')?.value.trim()||'',body=$('#suggestBody')?.value.trim()||'',anonymous=$('#suggestAnonymous')?.checked!==false;runtime.suggestionDraft={category,title,body,anonymous};runtime.suggestionError='';if(title.length<2){runtime.suggestionError='제목을 2자 이상 입력해주세요.';return render()}if(body.length<2){runtime.suggestionError='건의 내용을 2자 이상 입력해주세요.';return render()}try{await V.Suggestions.create({category,title,body,anonymous});runtime.suggestionDraft={category:'개선',title:'',body:'',anonymous:true};runtime.suggestionError='';runtime.suggestionPage=0;runtime.suggestionsOwner='';await ensureSuggestions(true);toast('건의사항이 접수되었습니다.');return}catch(err){const code=String(err?.message||err);runtime.suggestionError=code==='TITLE_REQUIRED'?'제목을 2자 이상 입력해주세요.':code==='BODY_REQUIRED'?'건의 내용을 2자 이상 입력해주세요.':'접수하지 못했습니다. 잠시 후 다시 시도해주세요. ('+code.slice(0,40)+')';return render()}}
if(b.dataset.suggestAdminSave){const id=b.dataset.suggestAdminSave,status=document.querySelector(`[data-suggest-admin-status="${CSS.escape(id)}"]`)?.value||'수렴완료',reply=document.querySelector(`[data-suggest-admin-reply="${CSS.escape(id)}"]`)?.value||'';try{await V.Suggestions.adminReply(id,{status,reply});runtime.suggestionsOwner='';toast('답글과 상태를 저장했습니다.');await ensureSuggestions(true);return}catch(err){return toast('관리자 저장 실패 · '+String(err?.message||err).slice(0,60))}}
if(b.dataset.suggestDelete){if(!confirm('이 건의사항을 삭제할까요?'))return;try{await V.Suggestions.remove(b.dataset.suggestDelete);if(runtime.suggestions.length===1&&runtime.suggestionPage>0)runtime.suggestionPage--;runtime.suggestionsOwner='';toast('건의사항을 삭제했습니다.');await ensureSuggestions(true);return}catch(err){return toast('삭제 실패 · '+String(err?.message||err).slice(0,60))}}
if('goalEditor'in b.dataset){runtime.goalEditor=!runtime.goalEditor;return render()}
if('goalAdd'in b.dataset){const id=$('#dailyGoalConcept')?.value;if(id&&V.Mastery.dailyGoalAdd(id)){toast('오늘 목표에 추가됨');return render()}return}
if(b.dataset.goalRemove){const id=b.dataset.goalRemove;V.Mastery.dailyGoalRemove(id);toast('오늘 목표에서 제거됨',{actionLabel:'실행취소',onAction:()=>{V.Mastery.dailyGoalAdd(id);toast('오늘 목표에 다시 추가됨')}});return render()}
if(b.dataset.goalToggle){V.Mastery.dailyGoalToggle(b.dataset.goalToggle);return render()}
if('goalReset'in b.dataset){if(!confirm('오늘 목표를 현재 취약도·복습 일정 기준 자동 추천으로 다시 구성할까요?'))return;V.Mastery.dailyGoalReset(6);toast('오늘 목표를 다시 구성했습니다.');return render()}
if('wrongFilterReset'in b.dataset){runtime.wrongSubject='all';runtime.wrongScope='all';runtime.wrongKind='all';runtime.wrongSort='priority';runtime.wrongQuery='';return render()}if(b.dataset.concept)return chooseConcept(b.dataset.concept);if(b.dataset.wrongDelete){const id=b.dataset.wrongDelete,w=state().wrongs.find(x=>x.id===id);if(!w)return;if(!confirm('이 오답노트를 삭제할까요? 정답 기록과 시험기록은 유지됩니다.'))return;try{if(V.Auth?.user&&V.Auth?.deleteWrong)await V.Auth.deleteWrong(id);state().wrongs=state().wrongs.filter(x=>x.id!==id);S.save();toast('오답노트 삭제 완료');return render()}catch(err){return toast('오답노트 삭제 실패 · '+String(err?.message||err).slice(0,42))}}if(b.dataset.bookJump){const target=document.getElementById(b.dataset.bookJump);target?.scrollIntoView({behavior:'smooth',block:'start'});return}if(b.dataset.studyTab){if(!await ensurePageData('study',b.dataset.studyTab))return;state().studyTab=b.dataset.studyTab;rememberStudyPosition(state().subject);S.save();return render()}if(b.dataset.studyQuizJump!==undefined){const id=currentConcept().id,qs=V.QuestionQuality119?.forConcept(id)||[],next=Math.max(0,Math.min(Number(b.dataset.studyQuizJump)||0,Math.max(0,qs.length-1)));runtime.studyQuizIndex[id]=next;runtime.retryQuestionId='';runtime.retryConfidence='none';runtime.questionAt=Date.now();return render()}if('studyQuizPrev'in b.dataset||'studyQuizNext'in b.dataset){const id=currentConcept().id,qs=V.QuestionQuality119?.forConcept(id)||[],cur=Number(runtime.studyQuizIndex[id]||0),next='studyQuizPrev'in b.dataset?cur-1:cur+1;runtime.studyQuizIndex[id]=Math.max(0,Math.min(next,Math.max(0,qs.length-1)));runtime.retryQuestionId='';runtime.retryConfidence='none';runtime.questionAt=Date.now();return render()}
if('studyPrev'in b.dataset||'studyNext'in b.dataset||'mobileStudyPrev'in b.dataset||'mobileStudyNext'in b.dataset){const c=currentConcept(),n=conceptNeighbors(c),prev='studyPrev'in b.dataset||'mobileStudyPrev'in b.dataset,target=prev?n.prev:n.next;if(target)return chooseConcept(target.id,{keepTab:true});return}if(b.dataset.review){V.Mastery.markReviewed(currentConcept().id,b.dataset.review);toast('복습 일정에 반영됨');return}if(b.dataset.confidence){const[id,k]=b.dataset.confidence.split(':');if(runtime.retryQuestionId===id){runtime.retryConfidence=k;return render()}if(state().answers[id]!==undefined)return;state().confidence[id]=k;S.save();return render()}if(b.dataset.questionRetry){const id=b.dataset.questionRetry;if(!V.questionById?.[id])return;runtime.retryQuestionId=id;runtime.retryConfidence='none';runtime.questionAt=Date.now();return render()}if(b.dataset.answer){const[id,i]=b.dataset.answer.split(':'),retrying=runtime.retryQuestionId===id;if(state().answers[id]!==undefined&&!retrying)return;const q=V.questionById[id],ms=Date.now()-runtime.questionAt,confidence=retrying?runtime.retryConfidence:(state().confidence[id]||'none');V.Mastery.recordAnswer(q,Number(i),confidence,ms);if(retrying){runtime.retryQuestionId='';runtime.retryConfidence='none'}return render()}if(b.dataset.bankConcept){runtime.bankConcept=b.dataset.bankConcept;runtime.bankFilter='';runtime.bankIndex=0;return go('bank')}if('bankAll'in b.dataset){runtime.bankConcept='';runtime.bankFilter='';runtime.retryQuestionId='';runtime.retryConfidence='none';runtime.bankIndex=0;return render()}if('bankFilterReset'in b.dataset){runtime.bankSubject='all';runtime.bankScope='all';runtime.bankDifficulty='all';runtime.bankStatus='all';runtime.bankQuery='';runtime.bankIndex=0;return render()}if('bankPrev'in b.dataset){runtime.bankIndex--;return render()}if('bankNext'in b.dataset){runtime.bankIndex++;return render()}if('calcBank'in b.dataset){runtime.bankConcept='';runtime.bankFilter='calc';runtime.calcGroup='all';runtime.calcStage='all';runtime.bankIndex=0;return go('bank')}if(b.dataset.calcGroup){runtime.calcGroup=b.dataset.calcGroup;runtime.bankIndex=0;return render()}if(b.dataset.calcStage){runtime.calcStage=b.dataset.calcStage;runtime.bankIndex=0;return render()}if(b.dataset.retry){const id=b.dataset.retry;runtime.retryQuestionId=id;runtime.retryConfidence='none';runtime.bankConcept=V.questionById[id]?.conceptId||'';runtime.bankFilter='';const arr=runtime.bankConcept?(V.QuestionQuality119?.forConcept(runtime.bankConcept)||V.questionsForConcept(runtime.bankConcept)):V.questions;runtime.bankIndex=Math.max(0,arr.findIndex(q=>q.id===id));return go('bank')}if(b.dataset.tutorConcept){state().conceptId=b.dataset.tutorConcept;state().studyTab='ai';S.save();return go('study')}if(b.dataset.sourceQuestion){const q=V.questionById?.[b.dataset.sourceQuestion];if(q){await openPdfEvidence(q.conceptId,b,q.id);return}}if(b.dataset.sourceConcept){await openPdfEvidence(b.dataset.sourceConcept,b);return}if(b.dataset.sourceDownload){const key=V.curriculum.byId[b.dataset.sourceDownload]?.sourceRanges?.[0]?.doc||'';await downloadOfficialPdf(key);return}if('pdfDownload'in b.dataset){const key=document.querySelector('#pdfEvidence')?.dataset.docKey||'';await downloadOfficialPdf(key);return}if(b.dataset.examHub){runtime.examHub=b.dataset.examHub==='training'?'training':'mock';return render()}if(b.dataset.examPrint){try{printExamRound(Number(b.dataset.examPrint)||runtime.examRound,runtime.examDifficulty);toast('인쇄 화면에서 PDF로 저장하세요.')}catch(err){toast(err?.message==='POPUP_BLOCKED'?'팝업을 허용한 뒤 다시 눌러주세요.':'문제지 PDF를 만들지 못했습니다.')}return}if(b.dataset.examDoc){try{downloadExamRoundDoc(Number(b.dataset.examDoc)||runtime.examRound,runtime.examDifficulty);toast('현재 회차 한글 호환 문서를 저장했습니다.')}catch(err){toast('회차본 다운로드 실패 · '+String(err?.message||err).slice(0,40))}return}if('examBundle'in b.dataset){try{toast('전체본·회차본 ZIP을 만드는 중입니다.');setTimeout(()=>{try{downloadExamBundle(runtime.examDifficulty);toast('전체받기 ZIP 저장 완료')}catch(err){toast('전체받기 실패 · '+String(err?.message||err).slice(0,50))}},20)}catch(err){toast('전체받기 실패')}return}if(b.dataset.examDifficulty){runtime.examDifficulty=b.dataset.examDifficulty;return render()}if(b.dataset.v64Train){state().page='exam';S.save();runtime.examReportId='';return startTraining('correction:'+b.dataset.v64Train)}if('statsWeakTrain'in b.dataset){state().page='exam';S.save();runtime.examReportId='';return startTraining('weak65')}if(b.dataset.examRoundReset){const mode=b.dataset.examRoundReset,round=Math.max(1,Math.min(50,Number(runtime.examRound)||1));if(mode!=='practice')return;if(!confirm(`연습 ${round}회를 새 문제 구성으로 바꿀까요? 기존 점수 기록은 유지됩니다.`))return;const built=roundQuestions('practice',runtime.examDifficulty,round,{force:true});if(!built)return toast('새 문제 구성을 만들지 못했습니다.');toast(`연습 ${round}회 새 문제 구성 완료`);return render()}if(b.dataset.trainingStart){return startTraining(b.dataset.trainingStart)}if(b.dataset.examStart)return startExam(b.dataset.examStart);if('examAbandon'in b.dataset)return abandonExam();if(b.dataset.examMiniJump!==undefined){runtime.exam.i=Math.max(0,Math.min(runtime.exam.qs.length-1,Number(b.dataset.examMiniJump)||0));persistActiveExam();return render()}if(b.dataset.examJump!==undefined){runtime.exam.i=Math.max(0,Math.min(runtime.exam.qs.length-1,Number(b.dataset.examJump)||0));persistActiveExam();return render()}if('examPrev'in b.dataset){runtime.exam.i=Math.max(0,runtime.exam.i-1);persistActiveExam();return render()}if('examNext'in b.dataset){if(runtime.exam.i>=runtime.exam.qs.length-1)return finishExam();runtime.exam.i++;persistActiveExam();return render()}if(b.dataset.examAnswer!==undefined){const q=runtime.exam.qs[runtime.exam.i];runtime.exam.answers[q.id]=Number(b.dataset.examAnswer);persistActiveExam();return render()}if(b.dataset.examConfidence){const q=runtime.exam.qs[runtime.exam.i];(runtime.exam.confidence||(runtime.exam.confidence={}))[q.id]=b.dataset.examConfidence;persistActiveExam();return render()}if('saveNote'in b.dataset){const title=$('#noteTitle')?.value.trim(),body=$('#noteBody')?.value.trim(),subject=$('#noteSubjectSelect')?.value==='ems'?'ems':'fire';if(!body)return toast('노트 내용을 입력하세요.');try{await V.PassNote.saveManual({title:title||'내 합격노트',body,subject});runtime.noteSubject=subject;toast((subject==='fire'?'소방학':'구급')+' 합격노트에 저장됨');return render()}catch(err){return toast('노트 저장 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.noteSubject){runtime.noteSubject=b.dataset.noteSubject==='ems'?'ems':'fire';runtime.noteFilter='all';runtime.noteQuery='';return render()}
if(b.dataset.noteFilter){runtime.noteFilter=b.dataset.noteFilter;return render()}
if('noteSearch'in b.dataset){runtime.noteQuery=$('#noteSearch')?.value.trim()||'';return render()}
if('noteSearchClear'in b.dataset){runtime.noteQuery='';return render()}
if(b.dataset.noteEdit){runtime.noteEditId=b.dataset.noteEdit;return render()}
if('noteCancel'in b.dataset){runtime.noteEditId='';return render()}
if(b.dataset.noteSave){const note=state().notes.find(x=>x.id===b.dataset.noteSave),title=$('#noteEditTitle')?.value.trim();if(!note)return toast('노트를 찾을 수 없습니다.');let body='';if(sourceBackedNote(note)){const parts=splitSourceNote(note),memo=$('#noteEditMemo')?.value.trim()||'';body=parts.official+(memo?'\n\n[내 메모]\n'+memo:'')}else body=$('#noteEditBody')?.value.trim()||'';if(!body)return toast('노트 내용을 확인하세요.');try{await V.PassNote.persist({...note,title:title||note.title,body});runtime.noteEditId='';toast('합격노트 수정됨');return render()}catch(err){return toast('수정 실패 · '+String(err?.message||err).slice(0,40))}}
if(b.dataset.noteDelete){if(!confirm('이 합격노트를 삭제할까요?'))return;try{await V.PassNote.remove(b.dataset.noteDelete);toast('합격노트 삭제됨');return render()}catch(err){return toast('삭제 실패 · '+String(err?.message||err).slice(0,40))}}
if('tutorClear'in b.dataset){if(!confirm('현재 개념의 AI 대화를 모두 지울까요?'))return;state().chat=(state().chat||[]).filter(m=>m.conceptId!==currentConcept().id);S.save();toast('대화를 지웠습니다.');return render()}if('aiLoad'in b.dataset)return loadAI();if(b.dataset.tutorPrompt){const input=visibleTutorInput();if(input)input.value=b.dataset.tutorPrompt;return sendTutor()}if('tutorSend'in b.dataset)return sendTutor();if('profileSave'in b.dataset){const daily=Math.max(5,Math.min(1440,Number($('#profileDaily')?.value)||40)),sched=officialScheduleState();state().profile={...state().profile,examYear:sched.year||'2027',examDate:sched.written||'',examDateSource:sched.written?'official-monitor':'pending',examSchedule:sched.schedule||{},dailyMinutes:daily,level:$('#profileLevel')?.value||'처음 시작',updatedAt:Date.now()};S.save();return toast('학습 목표 저장됨')}if('export'in b.dataset){const blob=new Blob([S.export()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ai-tutor-v9-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);return}if('signin'in b.dataset||'signup'in b.dataset){const email=$('#authEmail')?.value.trim(),pw=$('#authPw')?.value||'';if(!email)return toast('이메일을 입력하세요.');if(pw.length<8)return toast('비밀번호는 8자 이상 입력하세요.');try{if('signin'in b.dataset){await V.Auth.signIn(email,pw);runtime.authNotice='';runtime.pendingAuthEmail='';runtime.account=false;toast('회원 계정 연결됨')}else{const result=await V.Auth.signUp(email,pw);if(result?.pendingEmailConfirmation){runtime.pendingAuthEmail=email;runtime.authNotice='회원가입 완료 · 인증메일을 확인한 뒤 로그인하세요. 메일이 안 보이면 인증메일 다시 보내기를 누르세요.';render();toast('회원가입 완료 · 이메일 인증 필요')}else{runtime.authNotice='';runtime.pendingAuthEmail='';runtime.account=false;toast('회원 계정 연결됨')}}}catch(err){const m=String(err.message||err);if(/Email not confirmed/i.test(m)){runtime.pendingAuthEmail=email;runtime.authNotice='이메일 인증이 아직 완료되지 않았습니다. 인증메일을 확인하거나 재전송하세요.';render();toast('이메일 인증 필요')}else if(/already been registered|already registered/i.test(m)){runtime.pendingAuthEmail=email;runtime.authNotice='이미 가입된 이메일입니다. 새로 만들지 말고 인증메일 확인 후 로그인하세요.';render();toast('이미 가입된 이메일')}else toast(m.slice(0,70))}return}if('resendConfirmation'in b.dataset){const email=$('#authEmail')?.value.trim()||runtime.pendingAuthEmail;if(!email)return toast('이메일을 입력하세요.');try{await V.Auth.resendConfirmation(email);runtime.pendingAuthEmail=email;runtime.authNotice='인증메일을 다시 보냈습니다. 받은편지함과 스팸함을 확인하세요.';render();toast('인증메일 재전송 완료')}catch(err){toast(String(err.message||err).slice(0,70))}return}if('signout'in b.dataset){await V.Auth.signOut();runtime.account=false;return go('home')}if('cloudSync'in b.dataset){try{await V.Auth.syncAll();toast('개인 데이터 동기화 완료')}catch(err){toast(String(err.message||err).slice(0,70))}}});
document.addEventListener('input',e=>{
if(e.target?.dataset?.outlineSearch!==undefined){runtime.outlineQuery=e.target.value||'';const pos=e.target.selectionStart??runtime.outlineQuery.length;render();requestAnimationFrame(()=>{const x=document.querySelector('[data-outline-search]');if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch{}}});return}
if(e.target?.dataset?.bankQuery!==undefined){runtime.bankQuery=e.target.value||'';runtime.bankIndex=0;const pos=e.target.selectionStart??runtime.bankQuery.length;render();requestAnimationFrame(()=>{const x=document.querySelector('[data-bank-query]');if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch{}}});return}
if(e.target?.dataset?.wrongQuery!==undefined){runtime.wrongQuery=e.target.value||'';const pos=e.target.selectionStart??runtime.wrongQuery.length;render();requestAnimationFrame(()=>{const x=document.querySelector('[data-wrong-query]');if(x){x.focus();try{x.setSelectionRange(pos,pos)}catch{}}});return}
if(e.target.id==='suggestTitle'||e.target.id==='suggestBody'){runtime.suggestionDraft={...(runtime.suggestionDraft||{}),title:$('#suggestTitle')?.value||'',body:$('#suggestBody')?.value||''};runtime.suggestionError=''}
});
document.addEventListener('change',e=>{
if(e.target?.dataset?.bankFilter){const k=e.target.dataset.bankFilter,v=e.target.value||'all';if(k==='subject'){runtime.bankSubject=v;runtime.bankScope='all'}else if(k==='scope')runtime.bankScope=v;else if(k==='difficulty')runtime.bankDifficulty=v;else if(k==='status')runtime.bankStatus=v;runtime.bankIndex=0;return render()}
if(e.target?.dataset?.wrongFilter){const k=e.target.dataset.wrongFilter,v=e.target.value||'all';if(k==='subject'){runtime.wrongSubject=v;runtime.wrongScope='all'}else if(k==='scope')runtime.wrongScope=v;else if(k==='kind')runtime.wrongKind=v;else if(k==='sort')runtime.wrongSort=v;return render()}
if(e.target?.dataset?.examRound!==undefined){runtime.examRound=Math.max(1,Math.min(50,Number(e.target.value)||1));return render()}
if(e.target.id==='suggestCategory'||e.target.id==='suggestAnonymous'){runtime.suggestionDraft={...(runtime.suggestionDraft||{}),category:$('#suggestCategory')?.value||'개선',anonymous:$('#suggestAnonymous')?.checked!==false,title:$('#suggestTitle')?.value||'',body:$('#suggestBody')?.value||''};runtime.suggestionError=''}
});
document.addEventListener('change',async e=>{if(e.target.id==='passNotePdf'){const f=e.target.files?.[0];if(!f)return;if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){runtime.noteUploadStatus='PDF 파일만 업로드할 수 있습니다.';toast(runtime.noteUploadStatus);return render()}const subject=$('#noteUploadSubject')?.value==='ems'?'ems':'fire';runtime.noteUploadStatus='PDF 내용을 읽는 중…';render();try{const ingested=await V.PrivateDocs.ingest(f,{kind:'personal',title:f.name,keepOriginal:true,aiAssist:'auto'});await V.PassNote.createFromPrivateDoc(ingested.doc.id,f.name,subject);runtime.noteSubject=subject;runtime.noteFilter='doc';runtime.noteUploadStatus=`${f.name} · 합격노트 초안 생성 완료`;toast('PDF를 합격노트에 추가했습니다.');return render()}catch(err){runtime.noteUploadStatus='PDF 업로드 실패 · '+String(err?.message||err).slice(0,55);toast(runtime.noteUploadStatus);return render()}}if(e.target.dataset.detailJumpSelect!==undefined){const value=String(e.target.value||'');if(value!==''){const root=e.target.closest('.study-body')||document,target=root.querySelector(`[data-detail-section="${CSS.escape(value)}"]`);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({behavior:'smooth',block:'start'});e.target.value=''}return}if(e.target.id==='importBackup'){const f=e.target.files?.[0];if(!f)return;try{S.import(await f.text());toast('복원 완료');render()}catch{toast('복원 실패')}}});
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
await V.Auth?.init?.();
await V.Auth?.rejectNonStudySession?.();
let questionLaneReady=true,restoredActiveExam=false;
if(!memberGateRequired()){if(V.Lazy119?.needsQuestionsForCurrentState?.()){try{await V.Lazy119.ensureQuestions()}catch(err){questionLaneReady=false;console.error(err);if(V.ExamSession119?.has?.(S.ownerId)||V.Lazy119?.needsQuestions?.(state().page,state().studyTab)){state().page='home';state().studyTab='core';S.save();runtime.authNotice='문제은행 로딩에 실패해 홈으로 이동했습니다. 네트워크 연결 후 다시 시도해주세요.'}}}restoredActiveExam=questionLaneReady?restoreActiveExam():false}
V.App={render,go,chooseConcept,runtime,tutorConceptFor,sampleAcrossScopes,studentStudyText,studentQuestionText};render();setTimeout(()=>V.PassNote?.prepareEditable?.().catch(()=>{}),0);if(restoredActiveExam)startExamTicker()
}
boot();
})();
