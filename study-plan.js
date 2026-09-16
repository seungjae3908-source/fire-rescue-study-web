state.sessionMinutes=store.get('sessionMinutes',state.profile?.daily||40);

function daysUntilExam(){
  if(!state.profile?.examDate)return null;
  const target=new Date(state.profile.examDate+'T00:00:00');const n=Math.ceil((target-new Date())/86400000);return Number.isFinite(n)?n:null;
}

function examPhase(){
  const d=daysUntilExam();
  if(d===null)return {id:'unset',title:'시험일 미설정',note:'설정에서 시험일을 입력하면 D-day에 따라 학습방식이 자동 조정됩니다.'};
  if(d<=1)return {id:'d1',title:'D-1 최종 정리',note:'새 범위를 늘리지 않고 위험오답·암기·공식기준만 확인합니다.'};
  if(d<=7)return {id:'d7',title:'D-7 실전 고정',note:'실전세트·오답회복·시간관리 중심. 새 개념 비중을 크게 낮춥니다.'};
  if(d<=14)return {id:'d14',title:'D-14 약점 압축',note:'취약단원과 반복오답을 줄이고 65분 실전 리듬을 고정합니다.'};
  if(d<=30)return {id:'d30',title:'D-30 점수화',note:'공식범위 누락을 닫고 단원문제와 모의고사 비중을 올립니다.'};
  return {id:'base',title:'기초·범위 구축',note:'공식근거를 연결하면서 개념 → 문제 → 오답 루프를 만드는 시기입니다.'};
}

function allocateMinutes(total,weights){
  const rows=weights.map(([key,w])=>[key,Math.max(1,Math.round(total*w))]);
  let sum=rows.reduce((a,x)=>a+x[1],0);while(sum>total&&rows.some(x=>x[1]>1)){const r=rows.sort((a,b)=>b[1]-a[1])[0];r[1]--;sum--;}
  while(sum<total){rows[0][1]++;sum++;}return Object.fromEntries(rows);
}

function todayStudyPlan(total=state.sessionMinutes||40){
  total=clamp(Number(total)||40,5,180);const phase=examPhase();const due=state.wrongs.filter(w=>!w.resolved&&(w.dueAt||0)<=Date.now()).length;const top=curriculumPriority()[0];
  let weights;
  if(phase.id==='d1')weights=[['wrong',.45],['memory',.35],['official',.20]];
  else if(phase.id==='d7')weights=[['exam',.40],['wrong',.35],['memory',.25]];
  else if(phase.id==='d14')weights=[['weak',.35],['exam',.30],['wrong',.25],['memory',.10]];
  else if(phase.id==='d30')weights=[['weak',.35],['questions',.30],['wrong',.20],['official',.15]];
  else weights=[['official',.35],['weak',.30],['questions',.20],['wrong',.15]];
  const min=allocateMinutes(total,weights);const tasks=[];
  const add=(key,title,detail,page,chapterId)=>{if(!min[key])return;tasks.push({key,minutes:min[key],title,detail,page,chapterId});};
  add('official','공식근거 학습',top?.pages.length?`${top.chapter.title} · 연결된 공식페이지 복습`:'자료 탭에서 공식 구급교재 PDF를 색인해 근거부터 연결','resources',top?.chapter.id);
  add('weak','취약단원 집중',top?`${top.chapter.title} · ${top.priority}`:'응급처치 단원지도 시작','chapter',top?.chapter.id);
  add('questions','단원 문제풀이',top?`${top.chapter.title} 중심 문제`:'문제은행 연습','bank',top?.chapter.id);
  add('wrong','오답 치료',`${due}문제 오늘 복습 예정 · 위험오답 우선`,'wrong');
  add('memory','암기 회상',`${state.flashcards.length}개 암기카드에서 회상`,'study');
  add('exam','실전 훈련','소방학 25 + 응급처치 40 · 65분 청사진','exam');
  return {phase,total,tasks,top,due};
}

function studyPlanHTML(total=state.sessionMinutes||40){
  const p=todayStudyPlan(total);const d=daysUntilExam();
  return `<section class="card study-plan-card"><div class="row"><div><div class="tiny muted">ADAPTIVE PLAN</div><h3>${esc(p.phase.title)}</h3></div><span class="spacer"></span><span class="tag b">${d===null?'D-day 미설정':d>=0?'D-'+d:'시험일 경과'}</span></div><p class="muted">${esc(p.phase.note)}</p><div class="quick-session"><button class="btn small ${p.total===5?'primary':''}" data-session-min="5">5분</button><button class="btn small ${p.total===20?'primary':''}" data-session-min="20">20분</button><button class="btn small ${p.total===60?'primary':''}" data-session-min="60">60분</button><button class="btn small ${![5,20,60].includes(p.total)?'primary':''}" data-session-min="${state.profile?.daily||40}">내 설정 ${state.profile?.daily||40}분</button></div><div class="plan-tasks">${p.tasks.map((t,i)=>`<button class="plan-task" type="button" data-plan-page="${t.page}" ${t.chapterId?`data-plan-chapter="${t.chapterId}"`:''}><span class="plan-order">${i+1}</span><span><b>${esc(t.title)}</b><small>${esc(t.detail)}</small></span><strong>${t.minutes}분</strong></button>`).join('')}</div></section>`;
}

const _studyBeforePlan=study;
study=function(){const base=_studyBeforePlan();return base.replace('<div class="pagehead">',studyPlanHTML()+'<div class="pagehead">');};

const _homeSidebarBeforePlan=homeSidebar;
homeSidebar=function(){
  const base=_homeSidebarBeforePlan();const p=todayStudyPlan(state.profile?.daily||40);const next=p.tasks[0];
  const extra=`<section class="card"><h3>시험모드</h3><div class="tag b">${esc(p.phase.title)}</div><p class="muted tiny">${esc(p.phase.note)}</p>${next?`<button class="btn primary block small" data-plan-page="${next.page}" ${next.chapterId?`data-plan-chapter="${next.chapterId}"`:''}>다음: ${esc(next.title)} ${next.minutes}분</button>`:''}</section>`;
  return base+extra;
};

document.addEventListener('click',e=>{
  const s=e.target.closest?.('[data-session-min]');if(s){state.sessionMinutes=clamp(Number(s.dataset.sessionMin)||40,5,180);store.set('sessionMinutes',state.sessionMinutes);render();return;}
  const t=e.target.closest?.('[data-plan-page]');if(t){const page=t.dataset.planPage;const chapter=t.dataset.planChapter;if(chapter){openChapter(chapter);return;}go(page);return;}
});
