state.selectedChapter=store.get('selectedChapter','E11');

function chapterMetric(chapter){
  const qs=allQuestions().filter(q=>q.chapterId===chapter.id||q.chapter===chapter.title);
  const answered=qs.filter(q=>q.id in state.answers);
  const correct=answered.filter(q=>state.answers[q.id]===q.a).length;
  const wrongRows=state.wrongs.filter(w=>!w.resolved&&qs.some(q=>q.id===w.qid));
  const resolvedRows=state.wrongs.filter(w=>w.resolved&&qs.some(q=>q.id===w.qid));
  const pages=officialPageCache.filter(p=>p.chapterId===chapter.id);
  const accuracy=answered.length?Math.round(correct/answered.length*100):null;
  const risky=wrongRows.filter(w=>w.confidence==='sure').length;
  const due=wrongRows.filter(w=>(w.dueAt||0)<=Date.now()).length;
  let priority='근거 연결 먼저',tone='b';
  if(pages.length){priority='첫 학습',tone='b';}
  if(qs.length&&answered.length===0){priority='문제 풀기',tone='b';}
  if(accuracy!==null&&accuracy<70){priority='취약 · 재학습',tone='c';}
  if(due>0){priority='오늘 오답복습',tone='c';}
  if(risky>0){priority='위험오답 최우선',tone='d';}
  if(accuracy!==null&&accuracy>=85&&!wrongRows.length){priority='유지 복습',tone='a';}
  return {chapter,qs,answered,correct,accuracy,wrongRows,resolvedRows,pages,risky,due,priority,tone};
}

function curriculumMetrics(){return EMS_CHAPTER_INDEX_2026.map(chapterMetric)}
function curriculumPriority(){
  return curriculumMetrics().sort((a,b)=>{
    const rank=x=>x.risky?0:x.due?1:(x.accuracy!==null&&x.accuracy<70)?2:(!x.pages.length?3):(x.answered.length===0?4):5;
    return rank(a)-rank(b)||(a.accuracy??-1)-(b.accuracy??-1)||a.chapter.id.localeCompare(b.chapter.id);
  });
}

function chapterMapHTML(limit=22){
  return curriculumPriority().slice(0,limit).map(m=>`<button class="chapter-study-card" data-open-chapter="${m.chapter.id}" type="button"><div class="row"><span class="chapter-code">${m.chapter.id}</span><span class="spacer"></span><span class="tag ${m.tone}">${m.priority}</span></div><b>${esc(m.chapter.title)}</b><div class="chapter-metrics"><span>근거 ${m.pages.length}쪽</span><span>문제 ${m.answered.length}/${m.qs.length}</span><span>정답률 ${m.accuracy===null?'—':m.accuracy+'%'}</span><span>오답 ${m.wrongRows.length}</span></div></button>`).join('');
}

const _studyBeforeCurriculum=study;
study=function(){
  const base=_studyBeforeCurriculum();
  const top=curriculumPriority().slice(0,6);
  const block=`<div class="section-title"><h2>오늘 우선 단원</h2><span>실제 기록 + 공식근거 연결 상태</span></div><div class="curriculum-grid">${top.map(m=>`<button class="chapter-study-card priority" data-open-chapter="${m.chapter.id}" type="button"><div class="row"><span class="chapter-code">${m.chapter.id}</span><span class="spacer"></span><span class="tag ${m.tone}">${m.priority}</span></div><b>${esc(m.chapter.title)}</b><div class="chapter-metrics"><span>근거 ${m.pages.length}쪽</span><span>${m.accuracy===null?'미학습':'정답률 '+m.accuracy+'%'}</span><span>복습 ${m.due}</span></div></button>`).join('')}</div><div class="section-title"><h2>전체 응급처치 학습지도</h2><span>점수 대신 원자료를 그대로 표시</span></div><div class="curriculum-grid">${chapterMapHTML()}</div>`;
  return base.replace('<div class="section-title"><h2>현재 기록</h2>',block+'<div class="section-title"><h2>현재 기록</h2>');
};

function chapterPage(){
  const chapter=EMS_CHAPTER_INDEX_2026.find(c=>c.id===state.selectedChapter)||EMS_CHAPTER_INDEX_2026[0];
  const m=chapterMetric(chapter);const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);
  const pageCards=m.pages.slice(0,12).map(p=>`<div class="source-hit"><div class="row"><b>PDF ${p.page}쪽</b><span class="spacer"></span>${doc?.verified?trust('A'):trust('B')}</div><p>${esc(officialPageExcerpt(p.text,EMS_KEYWORDS[chapter.id]||[chapter.title]))}</p><div class="toolbar"><button class="btn small" data-tutor-source="${p.page}">이 페이지로 과외</button><button class="btn small" data-search-page="${p.page}">원문 크게 보기</button></div></div>`).join('');
  const qCards=m.qs.slice(0,8).map(q=>`<div class="mini-q"><div>${sourceBadge(q.sourceType)} ${trust(q.grade||'D')}</div><b>${esc(q.q).slice(0,180)}</b><button class="btn small" data-focus-q="${q.id}">문제 풀기</button></div>`).join('');
  return shell(`<div class="page chapter-page"><div class="pagehead"><button class="btn small ghost" data-nav="study">← 학습지도</button><div><div class="tiny muted">${chapter.id}</div><h1>${esc(chapter.title)}</h1><p>공식 페이지와 실제 학습기록을 같은 단원 ID로 연결합니다.</p></div></div>
    <div class="grid stats"><div class="card stat"><div class="label">공식 근거</div><div class="value">${m.pages.length}</div><div class="sub">로컬 색인 페이지</div></div><div class="card stat"><div class="label">푼 문제</div><div class="value">${m.answered.length}</div><div class="sub">보유 ${m.qs.length}문제</div></div><div class="card stat"><div class="label">정답률</div><div class="value">${m.accuracy===null?'—':m.accuracy+'%'}</div><div class="sub">실제 답안만 계산</div></div><div class="card stat"><div class="label">위험오답</div><div class="value">${m.risky}</div><div class="sub">확실 + 오답</div></div></div>
    <div class="card chapter-action"><div class="row"><div><b>현재 권장</b><p class="muted tiny">${m.priority}</p></div><span class="spacer"></span><button class="btn primary" data-chapter-questions="${chapter.id}">근거문제 10개 만들기</button><button class="btn" data-chapter-tutor="${chapter.id}">단원 과외</button></div></div>
    <div class="section-title"><h2>공식 교재 페이지</h2><span>${m.pages.length?`${m.pages.length}쪽 연결`:'아직 페이지 매핑 없음'}</span></div>${pageCards||'<div class="card empty">자료 탭에서 2026 소방전술3(구급) PDF를 로컬 색인하면 이 단원의 페이지가 자동 연결됩니다.</div>'}
    <div class="section-title"><h2>연결된 문제</h2><span>${m.qs.length}문제</span></div>${qCards?`<div class="mini-q-grid">${qCards}</div>`:'<div class="card empty">아직 이 단원에 연결된 문제가 없습니다.</div>'}
  </div>`);
}

const _renderBeforeCurriculum=render;
render=function(){
  if(state.page==='chapter'){
    $('#app').innerHTML=chapterPage();bind();return;
  }
  _renderBeforeCurriculum();
};

function openChapter(id){state.selectedChapter=id;store.set('selectedChapter',id);state.page='chapter';store.set('page','chapter');render();window.scrollTo({top:0,behavior:'instant'});}
function focusQuestionFromChapter(id){state.focusedQuestionId=id;state.bankFilter='all';go('bank');}
function chapterTutor(id){
  const c=EMS_CHAPTER_INDEX_2026.find(x=>x.id===id);if(!c)return;
  const grounding=officialPageCache.filter(p=>p.chapterId===id).slice(0,4).map(p=>`[PDF ${p.page}쪽]\n${officialPageExcerpt(p.text,EMS_KEYWORDS[id]||[c.title])}`).join('\n---\n');
  state.chat.push({role:'user',content:`${c.title} 단원을 시험 과외처럼 가르쳐줘. 공식 근거가 있으면 페이지를 붙여줘.\n${grounding?`공식교재 근거:\n${grounding}`:'아직 공식 PDF 페이지가 로컬 색인되지 않았어.'}`});store.set('chat',state.chat);go('tutor');
}

document.addEventListener('click',e=>{
  const open=e.target.closest?.('[data-open-chapter]');if(open){openChapter(open.dataset.openChapter);return;}
  const fq=e.target.closest?.('[data-focus-q]');if(fq){focusQuestionFromChapter(fq.dataset.focusQ);return;}
  const cq=e.target.closest?.('[data-chapter-questions]');if(cq){generateGroundedQuestions(cq.dataset.chapterQuestions,10);return;}
  const ct=e.target.closest?.('[data-chapter-tutor]');if(ct){chapterTutor(ct.dataset.chapterTutor);return;}
  const sp=e.target.closest?.('[data-search-page]');if(sp){const p=officialPageCache.find(x=>String(x.page)===String(sp.dataset.searchPage));if(p){const w=window.open('','_blank','noopener,noreferrer');if(w){w.document.write(`<title>PDF ${p.page}쪽 추출텍스트</title><pre style="white-space:pre-wrap;font:16px/1.7 system-ui;padding:24px;max-width:900px;margin:auto">${esc(p.text)}</pre>`);w.document.close();}}}
});
