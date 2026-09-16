function buildExamInstances(pool, count, prefix){
  if(!pool.length) return [];
  const out=[];
  let cycle=[];
  for(let i=0;i<count;i++){
    if(!cycle.length) cycle=shuffled(pool);
    const q=cycle.shift();
    out.push({...q,instance:`${prefix}-${q.id}-${i}-${Date.now()}`});
  }
  return out;
}

startExam = function(){
  const all=allQuestions();
  const fire=all.filter(q=>q.subject==='소방학개론');
  const ems=all.filter(q=>q.subject==='응급처치학개론');
  if(!fire.length || !ems.length){
    toast('과목별 문제은행이 부족합니다. 공식/연습 문제팩을 먼저 확인하세요.');
    return;
  }
  const fireSet=buildExamInstances(fire,25,'FIRE');
  const emsSet=buildExamInstances(ems,40,'EMS');
  state.exam={
    qs:[...fireSet,...emsSet],idx:0,started:Date.now(),answers:{},conf:{},marked:{},finishing:false,
    blueprint:{fire:25,ems:40,minutes:65,version:EXAM_2026.version}
  };
  render();
  examTimer=setInterval(()=>{if(state.page==='exam'&&state.exam)render();},1000);
};

finishExam = function(auto=false){
  if(!state.exam || state.exam.finishing) return;
  const e=state.exam;
  const unanswered=e.qs.length-Object.keys(e.answers).length;
  if(!auto && unanswered>0 && !confirm(`미응답 ${unanswered}문제가 있습니다. 그래도 채점할까요?`)) return;
  e.finishing=true;
  const breakdown={
    '소방학개론':{total:25,correct:0,answered:0},
    '응급처치학개론':{total:40,correct:0,answered:0}
  };
  let correct=0;
  for(const q of e.qs){
    const ans=e.answers[q.instance];
    const row=breakdown[q.subject];
    if(row && ans!==undefined) row.answered++;
    if(ans===q.a){correct++;if(row)row.correct++;}
    else if(ans!==undefined){
      const existing=state.wrongs.find(w=>w.qid===q.id&&!w.resolved);
      if(!existing) state.wrongs.push({id:uid('wrong'),qid:q.id,q,confidence:e.conf[q.instance]||'none',at:Date.now(),dueAt:Date.now(),intervalDays:1,attempts:1,resolved:false});
    }
  }
  const durationSec=Math.min(3900,Math.floor((Date.now()-e.started)/1000));
  const result={
    id:uid('exam'),at:Date.now(),correct,score:Math.round(correct/65*100),unanswered,durationSec,
    marked:Object.values(e.marked).filter(Boolean).length,blueprint:e.blueprint,breakdown
  };
  state.examHistory.push(result);
  store.set('examHistory',state.examHistory);
  store.set('wrongs',state.wrongs);
  clearInterval(examTimer);
  state.exam=null;
  toast(`${result.correct}/65 · ${result.score}점`);
  go('stats');
};

exam = function(){
  if(state.exam) return examRun();
  const available=allQuestions();
  const fire=available.filter(q=>q.subject==='소방학개론').length;
  const ems=available.filter(q=>q.subject==='응급처치학개론').length;
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>실전 모의고사</h1><p>2026 구급 경채 공식 청사진 · 65문항 / 65분</p></div></div>
    <div class="hero"><div class="eyebrow">OFFICIAL BLUEPRINT</div><h1>소방학 25 + 응급처치 40</h1><p>시험시간 65분을 고정하고, 문제 순서도 소방학개론 25문항 뒤 응급처치학개론 40문항으로 구성합니다. 현재 문제 자체는 공식기출 DB 완성 전이므로 연습 세트로 표시됩니다.</p><div class="hero-actions"><button class="btn primary" id="startExam">65분 실전 시작</button><a class="btn ghost" href="${EXAM_2026.sourceUrl}" target="_blank" rel="noopener">공고 근거 보기</a></div></div>
    <div class="grid stats"><div class="card stat"><div class="label">소방학개론</div><div class="value">25</div><div class="sub">현재 풀 ${fire}개를 순환</div></div><div class="card stat"><div class="label">응급처치학개론</div><div class="value">40</div><div class="sub">현재 풀 ${ems}개를 순환</div></div><div class="card stat"><div class="label">시험시간</div><div class="value">65분</div><div class="sub">공식 2026 기준</div></div><div class="card stat"><div class="label">총문항</div><div class="value">65</div><div class="sub">과목별 100점</div></div></div>
    ${state.examHistory.length?`<div class="section-title"><h2>최근 결과</h2><span>${state.examHistory.length}회</span></div>${state.examHistory.slice().reverse().slice(0,5).map(r=>{const f=r.breakdown?.['소방학개론'];const e=r.breakdown?.['응급처치학개론'];return `<div class="card" style="margin-top:9px"><div class="row"><b>${r.correct}/65</b><span class="spacer"></span><span class="tag b">${r.score}점</span></div><p class="tiny muted">${fmtDate(r.at)} · 미응답 ${r.unanswered}개 · ${Math.round(r.durationSec/60)}분</p>${f&&e?`<p class="tiny">소방학 ${f.correct}/25 · 응급처치 ${e.correct}/40</p>`:''}</div>`}).join('')}`:''}
  </div>`);
};
