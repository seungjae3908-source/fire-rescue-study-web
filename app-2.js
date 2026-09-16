function allQuestions() {
  return [...SEED_QUESTIONS, ...state.generatedQuestions];
}

function saveCore() {
  store.set('page', state.page);
  store.set('notes', state.notes);
  store.set('wrongs', state.wrongs);
  store.set('answers', state.answers);
  store.set('confidences', state.confidences);
  store.set('generatedQuestions', state.generatedQuestions);
  store.set('flashcards', state.flashcards);
  store.set('examHistory', state.examHistory);
  store.set('chat', state.chat);
  store.set('tutorMode', state.tutorMode);
  store.set('bankFilter', state.bankFilter);
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[ch]));
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function fmtDate(ts) { return new Date(ts).toLocaleString('ko-KR'); }
function uid(prefix = 'id') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

function dday() {
  if (!state.profile?.examDate) return '미설정';
  const target = new Date(state.profile.examDate + 'T00:00:00');
  const diff = Math.ceil((target - new Date()) / 86400000);
  if (Number.isNaN(diff)) return '미설정';
  if (diff === 0) return 'D-DAY';
  return diff > 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
}

function toast(message, kind = 'normal') {
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function trust(grade) {
  const label = grade === 'A' ? 'A 공식' : grade === 'B' ? 'B 검증' : grade === 'C' ? 'C AI예상' : 'D 개인/연습';
  return `<span class="tag ${grade.toLowerCase()}">${label}</span>`;
}

function sourceBadge(type) {
  const map = {
    official: ['A', '공식 공개'],
    past: ['A', '실제기출'],
    verified: ['B', '검증문제'],
    ai: ['C', 'AI 예상'],
    personal: ['D', '내 노트 생성'],
    practice: ['D', '연습문제']
  };
  const [grade, label] = map[type] || ['D', '참고'];
  return `<span class="tag ${grade.toLowerCase()}">${label}</span>`;
}

function statsSnapshot() {
  const qs = allQuestions();
  const entries = Object.entries(state.answers).filter(([id]) => qs.some(q => q.id === id));
  let correct = 0;
  for (const [id, ans] of entries) {
    const q = qs.find(x => x.id === id);
    if (q && q.a === ans) correct++;
  }
  return {
    tried: entries.length,
    correct,
    accuracy: entries.length ? Math.round((correct / entries.length) * 100) : 0,
    wrongs: state.wrongs.filter(w => !w.resolved).length,
    risky: state.wrongs.filter(w => !w.resolved && w.confidence === 'sure').length,
    due: state.wrongs.filter(w => !w.resolved && (w.dueAt || 0) <= Date.now()).length
  };
}

function chapterStats() {
  const rows = {};
  const qs = allQuestions();
  for (const q of qs) {
    if (!(q.id in state.answers)) continue;
    const key = `${q.subject} · ${q.chapter}`;
    rows[key] ||= { tried: 0, correct: 0 };
    rows[key].tried++;
    if (state.answers[q.id] === q.a) rows[key].correct++;
  }
  return Object.entries(rows)
    .map(([name, v]) => ({ name, tried: v.tried, accuracy: Math.round(v.correct / v.tried * 100) }))
    .sort((a, b) => a.accuracy - b.accuracy || b.tried - a.tried);
}

function nav() {
  const items = [
    ['home', '홈'], ['study', '학습'], ['tutor', 'AI 과외'], ['notes', '내 노트'],
    ['bank', '문제'], ['exam', '모의고사'], ['wrong', '오답'], ['stats', '통계'],
    ['resources', '공식자료'], ['settings', '설정']
  ];
  return `<nav class="nav">${items.map(([p, l]) => `<button data-nav="${p}" class="${state.page === p ? 'active' : ''}">${l}</button>`).join('')}</nav>`;
}

function shell(content) {
  return `<div class="app">
    <header class="topbar"><div class="toprow">
      <div class="brand"><span class="brandmark">🔥</span><span>구급 합격AI</span></div>
      <span class="pill good hide-mobile">무료 AI ONLY</span>
      <span class="spacer"></span><span class="pill">${dday()}</span>
    </div></header>
    <div class="layout"><main class="main">${content}</main>${state.page === 'home' ? homeSidebar() : ''}</div>
    ${nav()}
  </div>`;
}

function homeSidebar() {
  const s = statsSnapshot();
  return `<aside class="side">
    <section class="card">
      <h3>오늘 추천</h3>
      <div class="task"><span class="dot"></span><div><b>오답 복습</b><small>${s.due}문제 복습 예정</small></div></div>
      <div class="task"><span class="dot"></span><div><b>내 노트 회상</b><small>${state.flashcards.length}개 암기카드</small></div></div>
      <div class="task"><span class="dot"></span><div><b>미니 테스트</b><small>10문제</small></div></div>
      <button class="btn primary block small" data-nav="study">오늘 학습 시작</button>
    </section>
    <section class="card">
      <h3>무료 로컬 AI</h3>
      <div class="ai-status"><div class="row"><b>${esc(state.ai.text)}</b><span class="spacer"></span><span>${Math.round(state.ai.progress * 100)}%</span></div><div class="bar"><i style="width:${state.ai.progress * 100}%"></i></div></div>
      <div style="height:9px"></div>
      <button class="btn block small" data-load-ai>${state.ai.engine ? 'AI 준비 완료' : state.ai.loading ? '불러오는 중' : '무료 AI 불러오기'}</button>
      <p class="muted tiny">WebGPU가 없으면 유료 서비스로 전환하지 않고 무료 기본 정리·근거검색 모드로 동작합니다.</p>
    </section>
  </aside>`;
}

function home() {
  const s = statsSnapshot();
  return shell(`<section class="hero">
    <div class="eyebrow">FIRE RESCUE EXAM · LOCAL FIRST</div>
    <h1>공부한 만큼만 보여주는<br>구급 경채 개인 합격코치.</h1>
    <p>내 필기·PDF → 무료 AI/기본정리 → 문제 → 오답 → 간격복습 → 실전 모의고사까지 실제로 연결되는 웹앱입니다.</p>
    <div class="hero-actions"><button class="btn primary" data-nav="study">🔥 오늘 학습 시작</button><button class="btn ghost" data-nav="notes">＋ 필기/PDF 추가</button></div>
  </section>
  <div class="grid stats">
    <div class="card stat"><div class="label">시험</div><div class="value">${dday()}</div><div class="sub">${esc(state.profile?.examYear || '연도 미설정')} 목표</div></div>
    <div class="card stat"><div class="label">정답률</div><div class="value">${s.accuracy}%</div><div class="sub">${s.tried}문제 기준</div></div>
    <div class="card stat"><div class="label">위험오답</div><div class="value">${s.risky}</div><div class="sub">확신 + 오답</div></div>
    <div class="card stat"><div class="label">내 노트</div><div class="value">${state.notes.length}</div><div class="sub">로컬 저장</div></div>
  </div>
  <div class="section-title"><h2>합격 루프</h2><span>모든 카드가 실제 화면으로 연결됩니다.</span></div>
  <div class="grid study-grid">
    ${[
      ['📚', '오늘 학습', '오답·노트·문제를 묶은 일일 세션', 'study'],
      ['🎓', 'AI 과외', '무료 로컬 AI 또는 내 노트 근거검색', 'tutor'],
      ['📷', '필기·PDF', 'PDF 텍스트·사진 OCR·직접입력', 'notes'],
      ['📝', '문제은행', '출처등급과 확신도를 함께 기록', 'bank'],
      ['⏱️', '실전 모의고사', '65문항/65분 실전 UI', 'exam'],
      ['❌', '오답 치료', '위험오답·재풀이·간격복습', 'wrong'],
      ['📊', '학습 통계', '실제 기록만 계산', 'stats'],
      ['🔎', '공식자료', '소방청·중앙소방학교·법령 원문', 'resources']
    ].map(x => `<button class="card study-card" data-nav="${x[3]}" style="text-align:left;color:inherit;border:1px solid rgba(255,255,255,.07);cursor:pointer"><div class="icon">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p></button>`).join('')}
  </div>`);
}
