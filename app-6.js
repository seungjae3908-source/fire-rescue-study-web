let examTimer = null;

function finishExam(auto = false) {
  if (!state.exam || state.exam.finishing) return;
  const e = state.exam;
  const unanswered = e.qs.length - Object.keys(e.answers).length;
  if (!auto && unanswered > 0 && !confirm(`미응답 ${unanswered}문제가 있습니다. 그래도 채점할까요?`)) return;
  e.finishing = true;
  let correct = 0;
  for (const q of e.qs) {
    const ans = e.answers[q.instance];
    if (ans === q.a) correct++;
    else if (ans !== undefined) {
      const existing = state.wrongs.find(w => w.qid === q.id && !w.resolved);
      if (!existing) state.wrongs.push({ id: uid('wrong'), qid: q.id, q, confidence: e.conf[q.instance] || 'none', at: Date.now(), dueAt: Date.now(), intervalDays: 1, attempts: 1, resolved: false });
    }
  }
  const durationSec = Math.min(3900, Math.floor((Date.now() - e.started) / 1000));
  const result = { id: uid('exam'), at: Date.now(), correct, score: Math.round(correct / 65 * 100), unanswered, durationSec, marked: Object.values(e.marked).filter(Boolean).length };
  state.examHistory.push(result);
  store.set('examHistory', state.examHistory);
  store.set('wrongs', state.wrongs);
  clearInterval(examTimer);
  state.exam = null;
  toast(`${result.correct}/65 · ${result.score}점`);
  go('stats');
}

function saveSettings() {
  state.profile = {
    ...(state.profile || {}),
    examYear: $('#setYear').value.trim() || '2027',
    examDate: $('#setDate').value,
    daily: clamp(Number($('#setDaily').value) || 40, 5, 600),
    level: $('#setLevel').value
  };
  store.set('profile', state.profile);
  toast('설정 저장 완료');
  render();
}

function exportData() {
  const payload = {
    schema: 2, appVersion: APP_VERSION, exportedAt: new Date().toISOString(),
    profile: state.profile, notes: state.notes, wrongs: state.wrongs, answers: state.answers,
    confidences: state.confidences, generatedQuestions: state.generatedQuestions, flashcards: state.flashcards,
    examHistory: state.examHistory, chat: state.chat, tutorMode: state.tutorMode
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rescue-study-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

async function importData(file) {
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!data || typeof data !== 'object') throw new Error('잘못된 파일');
    if (!confirm('현재 학습데이터를 이 백업으로 교체할까요?')) return;
    for (const key of ['profile', 'notes', 'wrongs', 'answers', 'confidences', 'generatedQuestions', 'flashcards', 'examHistory', 'chat', 'tutorMode']) {
      if (key in data) store.set(key, data[key]);
    }
    location.reload();
  } catch (err) {
    console.error(err);
    toast('백업 파일을 읽지 못했습니다.');
  }
}

function eraseData() {
  if (!confirm('이 브라우저의 모든 학습데이터를 삭제할까요? 이 작업은 되돌릴 수 없습니다.')) return;
  Object.keys(localStorage).filter(k => k.startsWith(STORE_PREFIX)).forEach(k => localStorage.removeItem(k));
  location.reload();
}

async function resetServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
    }
    toast('앱 캐시 초기화 완료');
    setTimeout(() => location.reload(), 700);
  } catch (err) {
    console.error(err);
    toast('캐시 초기화 실패');
  }
}

function onboarding() {
  if (state.profile) return;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal-backdrop" id="onboard"><div class="modal">
    <div class="eyebrow">WELCOME</div><h2>구급 합격AI 시작하기</h2><p>로그인 없이 시작합니다. 목표와 학습시간은 이 브라우저에만 저장됩니다.</p>
    <div class="formgrid"><label>목표 연도<input id="obYear" class="input" value="2027"></label><label>시험일<input id="obDate" class="input" type="date"></label><label>하루 공부시간(분)<input id="obDaily" class="input" type="number" value="40"></label><label>현재 수준<select id="obLevel" class="input"><option>처음 시작</option><option>기초 있음</option><option>재도전</option></select></label></div>
    <div class="divider"></div><p class="tiny">AI 정책: 유료 API 없음 · 유료 fallback 없음 · 무료 브라우저 로컬 AI만 허용</p>
    <button id="obStart" class="btn primary block">학습 시작</button>
  </div></div>`);
  $('#obStart').onclick = () => {
    state.profile = { examYear: $('#obYear').value || '2027', examDate: $('#obDate').value, daily: clamp(Number($('#obDaily').value) || 40, 5, 600), level: $('#obLevel').value };
    store.set('profile', state.profile);
    $('#onboard').remove();
    render();
  };
}

window.addEventListener('error', e => console.error('GLOBAL_ERROR', e.error || e.message));
window.addEventListener('unhandledrejection', e => console.error('UNHANDLED_REJECTION', e.reason));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(err => console.warn('SW', err)));
}

render();
onboarding();
