function study() {
  const s = statsSnapshot();
  const due = state.wrongs.filter(w => !w.resolved && (w.dueAt || 0) <= Date.now());
  const cards = state.flashcards.slice(0, 8);
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>오늘의 학습</h1><p>${state.profile?.daily || 40}분 기준 · 실제 저장된 오답과 노트 중심</p></div></div>
    <div class="grid study-grid">
      <div class="card"><div class="row"><b>1. 복습 예정 오답</b><span class="spacer"></span><span class="tag ${due.length ? 'c' : 'a'}">${due.length}문제</span></div><p class="muted">오늘 다시 풀어야 할 문제를 먼저 처리합니다.</p><button class="btn primary" data-nav="wrong">오답 복습 시작</button></div>
      <div class="card"><div class="row"><b>2. 문제은행</b><span class="spacer"></span><span class="tag b">${allQuestions().length}문제</span></div><p class="muted">연습문제와 내 노트 생성문제를 풀고 확신도를 기록합니다.</p><button class="btn" data-nav="bank">문제 풀기</button></div>
    </div>
    <div class="section-title"><h2>암기카드</h2><span>${state.flashcards.length}개</span></div>
    ${cards.length ? `<div class="grid study-grid">${cards.map(c => `<div class="card"><div class="tiny muted">${esc(c.source || '내 노트')}</div><h3>${esc(c.front)}</h3><details><summary>정답 보기</summary><p>${esc(c.back)}</p></details></div>`).join('')}</div>` : '<div class="card empty">필기/PDF를 저장하면 핵심 문장에서 암기카드를 자동 생성할 수 있습니다.</div>'}
    <div class="section-title"><h2>현재 기록</h2><span>가짜 합격확률 없음</span></div>
    <div class="grid stats"><div class="card stat"><div class="label">푼 문제</div><div class="value">${s.tried}</div></div><div class="card stat"><div class="label">정답률</div><div class="value">${s.accuracy}%</div></div><div class="card stat"><div class="label">오답</div><div class="value">${s.wrongs}</div></div><div class="card stat"><div class="label">복습예정</div><div class="value">${s.due}</div></div></div>
  </div>`);
}

function tutor() {
  const msgs = state.chat.map(m => `<div class="bubble ${m.role === 'user' ? 'user' : 'ai'}">${esc(m.content)}</div>`).join('');
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>AI 1:1 과외</h1><p>유료 API 없음 · 무료 로컬 AI + 내 노트 근거검색</p></div></div>
    <div class="toolbar">
      ${['초보자', '시험강사', '1:1 과외', '벼락치기'].map(m => `<button class="btn small ${state.tutorMode === m ? 'primary' : ''}" data-mode="${m}">${m}</button>`).join('')}
      <button class="btn small" data-load-ai>${state.ai.engine ? 'AI 준비됨' : '무료 AI 불러오기'}</button>
    </div>
    <div class="ai-status"><b>${esc(state.ai.text)}</b>${state.ai.error ? `<div class="tiny risk" style="margin-top:6px">${esc(state.ai.error)}</div>` : ''}<div class="bar"><i style="width:${state.ai.progress * 100}%"></i></div></div>
    <div class="chat" id="chat">${msgs}</div>
    <div class="chatbox"><input id="chatInput" class="input" placeholder="예: 내 노트에서 쇼크 부분 다시 설명해줘"><button class="btn primary" id="sendChat">보내기</button></div>
    <p class="muted tiny">공식 원문이 연결되지 않은 AI 설명은 공식 사실로 자동 승격하지 않습니다.</p>
  </div>`);
}

function notes() {
  const list = state.notes.slice().reverse().map(n => `<div class="note-item">
      <div class="row"><b>${esc(n.title || '학습 노트')}</b><span class="spacer"></span>${trust(n.grade || 'D')}</div>
      <p class="muted tiny">${fmtDate(n.created)} · ${esc(n.fileName || '직접 입력')}</p>
      <div style="white-space:pre-wrap;line-height:1.65">${esc((n.summary || n.text || '').slice(0, 900))}${(n.summary || n.text || '').length > 900 ? '…' : ''}</div>
      <div class="toolbar"><button class="btn small" data-ask-note="${n.id}">이 노트로 과외</button><button class="btn small" data-q-note="${n.id}">문제 만들기</button><button class="btn small" data-card-note="${n.id}">암기카드</button><button class="btn small" data-delete-note="${n.id}">삭제</button></div>
    </div>`).join('');
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>내 필기 · PDF</h1><p>원본 파일은 기본적으로 서버에 업로드하지 않고 브라우저에서 처리합니다.</p></div></div>
    <div class="upload" id="drop"><div class="big">📷 📄</div><h3>사진 · PDF · TXT 가져오기</h3><p>PDF 텍스트 추출 / 이미지 OCR / 텍스트 파일</p><label class="btn primary">파일 선택<input id="fileInput" type="file" accept="image/*,.pdf,.txt,text/plain,application/pdf"></label>${state.importStatus ? `<div class="tiny" style="margin-top:10px">${esc(state.importStatus)}</div>` : ''}</div>
    <div class="section-title"><h2>텍스트 직접 입력</h2><span>인강 필기·자막·메모</span></div>
    <div class="card"><textarea class="textarea" id="noteText" placeholder="필기 내용을 붙여넣거나 파일에서 추출하세요..."></textarea><div class="toolbar"><button class="btn primary" id="summarizeNote">무료 AI로 정리</button><button class="btn" id="basicSummarize">기본 정리</button><button class="btn" id="saveRaw">원문 저장</button><button class="btn" id="clearNoteText">입력 비우기</button></div><div id="noteResult"></div></div>
    <div class="section-title"><h2>저장된 노트</h2><span>${state.notes.length}개</span></div>
    ${list || '<div class="card empty">아직 저장된 노트가 없습니다.</div>'}
  </div>`);
}

function questionCard(q) {
  const ans = state.answers[q.id];
  const answered = ans !== undefined;
  const focus = state.focusedQuestionId === q.id ? ' style="outline:2px solid #ff755f"' : '';
  return `<div class="question-item" data-question-card="${q.id}"${focus}>
    <div class="row">${sourceBadge(q.sourceType)}${trust(q.grade || 'D')}<span class="tag">${esc(q.subject)}</span><span class="tag">${esc(q.chapter)}</span></div>
    <h3>${esc(q.q)}</h3>
    ${q.choices.map((c, i) => `<button class="choice ${ans === i ? 'selected' : ''} ${answered && i === q.a ? 'correct' : ''} ${answered && ans === i && ans !== q.a ? 'wrong' : ''}" data-answer="${q.id}:${i}">${i + 1}. ${esc(c)}</button>`).join('')}
    <div class="row"><span class="muted tiny">확신도</span><div class="confidence">${[['sure', '확실'], ['maybe', '애매'], ['none', '모름']].map(([k, l]) => `<button data-conf="${q.id}:${k}" class="${state.confidences[q.id] === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    ${answered ? `<div class="card" style="padding:12px;margin-top:9px"><b class="${ans === q.a ? 'success' : 'risk'}">${ans === q.a ? '정답' : '오답'} · 정답 ${q.a + 1}번</b><p class="muted">${esc(q.ex || '')}</p><p class="tiny muted">근거/출처: ${esc(q.sourceLabel || '개인/연습 자료')}</p></div>` : ''}
  </div>`;
}

function bank() {
  const filters = [
    ['all', '전체'], ['practice', '연습'], ['personal', '내 노트'], ['ai', 'AI 예상'], ['official', '공식'], ['past', '실제기출']
  ];
  let qs = allQuestions();
  if (state.bankFilter !== 'all') qs = qs.filter(q => q.sourceType === state.bankFilter);
  if (state.focusedQuestionId) {
    const focus = qs.find(q => q.id === state.focusedQuestionId) || allQuestions().find(q => q.id === state.focusedQuestionId);
    if (focus) qs = [focus, ...qs.filter(q => q.id !== focus.id)];
  }
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>문제은행</h1><p>실제기출·공식·AI예상·개인생성 문제를 출처로 구분합니다.</p></div></div>
    <div class="toolbar">${filters.map(([k, l]) => `<button class="btn small ${state.bankFilter === k ? 'primary' : ''}" data-bank-filter="${k}">${l}</button>`).join('')}</div>
    ${qs.length ? qs.map(questionCard).join('') : '<div class="card empty">이 필터에 해당하는 문제가 없습니다.</div>'}
  </div>`);
}

function exam() {
  if (state.exam) return examRun();
  const available = allQuestions().length;
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>실전 모의고사</h1><p>65문항 · 65분 · 시험 중 해설 비노출</p></div></div>
    <div class="hero"><div class="eyebrow">PRACTICE EXAM</div><h1>65문항 / 65분</h1><p>현재 검증된 공식 문제 DB가 완성되기 전에는 “연습 세트”로만 표시합니다. 문제은행 ${available}개를 섞어 실전 UI와 시간관리를 연습합니다.</p><div class="hero-actions"><button class="btn primary" id="startExam">실전 모드 시작</button></div></div>
    ${state.examHistory.length ? `<div class="section-title"><h2>최근 결과</h2><span>${state.examHistory.length}회</span></div>${state.examHistory.slice().reverse().slice(0, 5).map(r => `<div class="card" style="margin-top:9px"><div class="row"><b>${r.correct}/65</b><span class="spacer"></span><span class="tag b">${r.score}점</span></div><p class="tiny muted">${fmtDate(r.at)} · 미응답 ${r.unanswered}개 · ${Math.round(r.durationSec / 60)}분</p></div>`).join('')}` : ''}
  </div>`);
}

function examRun() {
  const e = state.exam;
  const q = e.qs[e.idx];
  const elapsed = Math.floor((Date.now() - e.started) / 1000);
  const left = Math.max(0, 3900 - elapsed);
  if (left === 0 && !e.finishing) setTimeout(() => finishExam(true), 0);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const sel = e.answers[q.instance];
  const answeredCount = Object.keys(e.answers).length;
  return shell(`<div class="page">
    <div class="exam-head"><b>${e.idx + 1}/65</b><span class="tiny muted">답변 ${answeredCount}</span><span class="spacer"></span><span class="timer">${mm}:${ss}</span><button class="btn small" id="finishExam">종료</button></div>
    <div class="question-item" style="margin-top:14px"><div class="row"><span class="tag">연습 세트</span><span class="tag">${esc(q.subject)}</span><span class="tag">${esc(q.chapter)}</span></div><h2>${esc(q.q)}</h2>
      ${q.choices.map((c, i) => `<button class="choice ${sel === i ? 'selected' : ''}" data-exam-answer="${i}">${i + 1}. ${esc(c)}</button>`).join('')}
      <div class="divider"></div><div class="row"><span class="muted tiny">확신도</span><div class="confidence">${[['sure', '확실'], ['maybe', '애매'], ['none', '모름']].map(([k, l]) => `<button data-exam-conf="${k}" class="${e.conf[q.instance] === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
    </div>
    <div class="row" style="margin-top:12px"><button class="btn" id="prevExam" ${e.idx === 0 ? 'disabled' : ''}>이전</button><button class="btn" id="markExam">${e.marked[q.instance] ? '★ 검토 표시됨' : '☆ 검토 표시'}</button><span class="spacer"></span><button class="btn primary" id="nextExam">${e.idx === 64 ? '채점하기' : '다음'}</button></div>
  </div>`);
}

function wrong() {
  const unresolved = state.wrongs.filter(w => !w.resolved).sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>오답 치료</h1><p>재풀이 → 근거 확인 → 복습일정까지 연결합니다.</p></div></div>
    ${unresolved.length ? unresolved.map(w => {
      const q = allQuestions().find(x => x.id === w.qid) || w.q;
      const due = (w.dueAt || 0) <= Date.now();
      return `<div class="question-item"><div class="row">${w.confidence === 'sure' ? '<span class="tag" style="background:#4c2026;color:#ffadb4">위험오답</span>' : ''}<span class="tag ${due ? 'c' : 'b'}">${due ? '복습 예정' : `다음 ${new Date(w.dueAt).toLocaleDateString('ko-KR')}`}</span><span class="tag">${esc(q?.chapter || '')}</span></div><h3>${esc(q?.q || '문제')}</h3><p class="muted">${esc(q?.ex || '근거 설명이 아직 연결되지 않았습니다.')}</p><div class="toolbar"><button class="btn small primary" data-retry="${w.qid}">다시 풀기</button><button class="btn small" data-relearn="${w.qid}">과외로 재학습</button><button class="btn small" data-reviewed="${w.qid}">복습 완료</button></div></div>`;
    }).join('') : '<div class="card empty">현재 미해결 오답이 없습니다.</div>'}
  </div>`);
}

function stats() {
  const s = statsSnapshot();
  const chapters = chapterStats();
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>학습 통계</h1><p>실제 기록에서 계산되는 값만 표시합니다.</p></div></div>
    <div class="grid stats"><div class="card stat"><div class="label">정답률</div><div class="value">${s.accuracy}%</div><div class="sub">${s.tried}문제</div></div><div class="card stat"><div class="label">오답</div><div class="value">${s.wrongs}</div></div><div class="card stat"><div class="label">위험오답</div><div class="value">${s.risky}</div></div><div class="card stat"><div class="label">모의고사</div><div class="value">${state.examHistory.length}</div><div class="sub">완료 횟수</div></div></div>
    <div class="section-title"><h2>단원별 기록</h2><span>푼 문제 기반</span></div>
    ${chapters.length ? chapters.map(c => `<div class="card" style="margin-top:9px"><div class="row"><b>${esc(c.name)}</b><span class="spacer"></span><b>${c.accuracy}%</b></div><div class="progress" style="margin-top:8px"><i style="width:${c.accuracy}%"></i></div><p class="tiny muted">${c.tried}문제</p></div>`).join('') : '<div class="card empty">아직 단원별 통계를 계산할 학습 기록이 없습니다.</div>'}
    <div class="section-title"><h2>모의고사 추이</h2><span>최근 10회</span></div>
    ${state.examHistory.length ? state.examHistory.slice(-10).map((r, i) => `<div class="card" style="margin-top:8px"><div class="row"><span>${i + 1}회</span><span class="spacer"></span><b>${r.score}점</b></div><div class="progress" style="margin-top:7px"><i style="width:${r.score}%"></i></div></div>`).join('') : '<div class="card empty">완료한 모의고사가 없습니다.</div>'}
  </div>`);
}

function resources() {
  return shell(`<div class="page"><div class="pagehead"><div><h1>공식자료</h1><p>AI보다 먼저 확인할 원문 출처입니다.</p></div></div>
    ${OFFICIAL_SOURCES.map(s => `<div class="card" style="margin-top:10px"><div class="row">${trust('A')}<span class="tag">${esc(s.org)}</span></div><h3>${esc(s.title)}</h3><p class="muted">${esc(s.note)}</p><a class="btn" target="_blank" rel="noopener noreferrer" href="${s.url}">공식 사이트 열기 ↗</a></div>`).join('')}
    <div class="card" style="margin-top:14px"><h3>자료 등록 원칙</h3><p class="muted">공식 PDF를 직접 내려받아 이 앱의 “내 노트”에 넣을 수 있습니다. 상업 학원 교재·유료 인강 원본을 앱이 자동 수집하거나 재배포하지 않습니다.</p></div>
  </div>`);
}

function settings() {
  return shell(`<div class="page">
    <div class="pagehead"><div><h1>설정</h1><p>시험 목표·무료 AI·개인 데이터를 관리합니다.</p></div></div>
    <div class="card"><h3>시험 목표</h3><div class="formgrid"><label>목표 연도<input class="input" id="setYear" value="${esc(state.profile?.examYear || '2027')}"></label><label>시험일<input class="input" id="setDate" type="date" value="${esc(state.profile?.examDate || '')}"></label><label>하루 공부시간(분)<input class="input" id="setDaily" type="number" min="5" max="600" value="${state.profile?.daily || 40}"></label><label>현재 수준<select class="input" id="setLevel">${['처음 시작', '기초 있음', '재도전'].map(v => `<option ${state.profile?.level === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label></div><div class="toolbar"><button class="btn primary" id="saveSettings">저장</button></div></div>
    <div class="card" style="margin-top:14px"><h3>무료 AI 정책</h3><p class="success strong">✓ 유료 AI API 사용 안 함</p><p class="success strong">✓ 유료 fallback 없음</p><p class="success strong">✓ WebGPU 무료 로컬 모델 우선</p><p class="muted tiny">WebGPU 미지원 시 기본 정리·노트 근거검색 기능으로 계속 사용할 수 있습니다.</p><button class="btn" data-load-ai>무료 AI 불러오기</button></div>
    <div class="card" style="margin-top:14px"><h3>데이터</h3><div class="toolbar"><button class="btn" id="exportData">백업 내보내기</button><label class="btn">백업 가져오기<input id="importData" type="file" accept="application/json,.json" hidden></label><button class="btn" id="eraseData" style="background:#3b1b20">모든 학습데이터 삭제</button></div><p class="muted tiny">브라우저 저장소를 삭제하거나 기기를 바꾸면 데이터가 사라질 수 있으니 필요하면 JSON 백업을 보관하세요.</p></div>
    <div class="card" style="margin-top:14px"><h3>앱 정보</h3><p class="muted">구급 합격AI v${APP_VERSION} · PWA · Local-first · 무료 AI only</p><button class="btn" id="resetSW">앱 캐시 새로고침</button></div>
  </div>`);
}

function render() {
  const map = { home, study, tutor, notes, bank, exam, wrong, stats, resources, settings };
  const fn = map[state.page] || home;
  $('#app').innerHTML = fn();
  bind();
  if (state.page === 'tutor') {
    const chat = $('#chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  }
}

function go(page) {
  state.page = page;
  store.set('page', page);
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function bind() {
  $$('[data-nav]').forEach(b => b.onclick = () => go(b.dataset.nav));
  $$('[data-load-ai]').forEach(b => b.onclick = loadAI);
  $$('[data-answer]').forEach(b => b.onclick = () => answer(...b.dataset.answer.split(':')));
  $$('[data-conf]').forEach(b => b.onclick = () => setConfidence(...b.dataset.conf.split(':')));
  $$('[data-mode]').forEach(b => b.onclick = () => { state.tutorMode = b.dataset.mode; store.set('tutorMode', state.tutorMode); render(); toast(`${state.tutorMode} 모드`); });
  $$('[data-bank-filter]').forEach(b => b.onclick = () => { state.bankFilter = b.dataset.bankFilter; state.focusedQuestionId = null; store.set('bankFilter', state.bankFilter); render(); });
  $$('[data-delete-note]').forEach(b => b.onclick = () => deleteNote(b.dataset.deleteNote));
  $$('[data-ask-note]').forEach(b => b.onclick = () => askNote(b.dataset.askNote));
  $$('[data-q-note]').forEach(b => b.onclick = () => generateQuestionsFromNote(b.dataset.qNote));
  $$('[data-card-note]').forEach(b => b.onclick = () => generateFlashcardsFromNote(b.dataset.cardNote));
  $$('[data-retry]').forEach(b => b.onclick = () => retryWrong(b.dataset.retry));
  $$('[data-relearn]').forEach(b => b.onclick = () => relearnWrong(b.dataset.relearn));
  $$('[data-reviewed]').forEach(b => b.onclick = () => reviewedWrong(b.dataset.reviewed));
  $('#sendChat')?.addEventListener('click', sendChat);
  $('#chatInput')?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } });
  $('#fileInput')?.addEventListener('change', e => processFile(e.target.files?.[0]));
  $('#drop')?.addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.classList.add('drag'); });
  $('#drop')?.addEventListener('dragleave', e => e.currentTarget.classList.remove('drag'));
  $('#drop')?.addEventListener('drop', e => { e.preventDefault(); e.currentTarget.classList.remove('drag'); processFile(e.dataTransfer.files?.[0]); });
  $('#summarizeNote')?.addEventListener('click', summarizeNote);
  $('#basicSummarize')?.addEventListener('click', summarizeNoteBasic);
  $('#saveRaw')?.addEventListener('click', saveRaw);
  $('#clearNoteText')?.addEventListener('click', () => { $('#noteText').value = ''; $('#noteResult').innerHTML = ''; });
  $('#startExam')?.addEventListener('click', startExam);
  $('#finishExam')?.addEventListener('click', () => finishExam(false));
  $('#prevExam')?.addEventListener('click', () => { if (state.exam) { state.exam.idx = Math.max(0, state.exam.idx - 1); render(); } });
  $('#nextExam')?.addEventListener('click', () => { if (!state.exam) return; if (state.exam.idx === 64) finishExam(false); else { state.exam.idx++; render(); } });
  $('#markExam')?.addEventListener('click', () => { if (!state.exam) return; const q = state.exam.qs[state.exam.idx]; state.exam.marked[q.instance] = !state.exam.marked[q.instance]; render(); });
  $$('[data-exam-answer]').forEach(b => b.onclick = () => { if (!state.exam) return; const q = state.exam.qs[state.exam.idx]; state.exam.answers[q.instance] = Number(b.dataset.examAnswer); render(); });
  $$('[data-exam-conf]').forEach(b => b.onclick = () => { if (!state.exam) return; const q = state.exam.qs[state.exam.idx]; state.exam.conf[q.instance] = b.dataset.examConf; render(); });
  $('#saveSettings')?.addEventListener('click', saveSettings);
  $('#exportData')?.addEventListener('click', exportData);
  $('#importData')?.addEventListener('change', e => importData(e.target.files?.[0]));
  $('#eraseData')?.addEventListener('click', eraseData);
  $('#resetSW')?.addEventListener('click', resetServiceWorker);
}
