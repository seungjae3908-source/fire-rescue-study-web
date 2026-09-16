function splitUsefulLines(text) {
  return String(text).split(/\n+/).map(x => x.replace(/^\[[0-9]+쪽\]\s*/, '').trim()).filter(x => x.length >= 12);
}

function basicSummary(text) {
  const lines = splitUsefulLines(text);
  const freq = {};
  tokenize(text).forEach(w => freq[w] = (freq[w] || 0) + 1);
  const scored = lines.map(line => ({
    line,
    score: tokenize(line).reduce((a, w) => a + Math.min(freq[w] || 0, 5), 0) + Math.min(line.length, 120) / 40
  })).sort((a, b) => b.score - a.score);
  const key = [...new Set(scored.slice(0, 8).map(x => x.line))];
  const terms = Object.entries(freq).sort((a, b) => b[1] - a[1]).filter(([w]) => w.length >= 2).slice(0, 12).map(([w]) => w);
  return `무료 기본 정리 엔진 결과 (AI 아님)\n\n[핵심 문장]\n${key.map((x, i) => `${i + 1}. ${x}`).join('\n') || '- 추출할 핵심 문장이 부족합니다.'}\n\n[반복 핵심어]\n${terms.join(' · ') || '없음'}\n\n[복습 방법]\n- 위 핵심 문장을 원문과 대조하세요.\n- 숫자·기준·예외는 공식 자료에서 다시 확인하세요.\n- “문제 만들기”로 회상 연습을 진행하세요.`;
}

function summarizeNoteBasic() {
  const text = $('#noteText')?.value.trim();
  if (!text) return toast('먼저 필기 내용을 입력하세요.');
  const summary = basicSummary(text);
  const n = {
    id: uid('note'), created: Date.now(), title: splitUsefulLines(text)[0]?.slice(0, 48) || '학습 노트',
    text, summary, grade: 'D', fileName: store.get('lastFileName', '')
  };
  state.notes.push(n);
  store.set('notes', state.notes);
  const cards = makeFlashcards(n);
  state.flashcards.push(...cards);
  store.set('flashcards', state.flashcards);
  const box = $('#noteResult');
  if (box) box.innerHTML = `<div class="note-item"><div class="row"><b>무료 기본 정리</b><span class="spacer"></span>${trust('D')}</div><div style="white-space:pre-wrap;line-height:1.65;margin-top:10px">${esc(summary)}</div><p class="tiny muted">AI가 아닌 브라우저 기본 정리 엔진 · 암기카드 ${cards.length}개 생성</p></div>`;
  toast('기본 정리·저장 완료');
  render();
}

async function summarizeNote() {
  const area = $('#noteText');
  const text = area?.value.trim();
  if (!text) return toast('먼저 필기 내용을 입력하세요.');
  const box = $('#noteResult');
  box.innerHTML = '<div class="ai-status">정리 중…</div>';
  let summary = '';
  let usedAi = false;
  try {
    summary = await ai(`다음 개인 학습노트를 시험 공부용으로 정리해줘.\n1) 핵심요약\n2) 시험포인트\n3) 암기사항\n4) 헷갈리는 비교개념\n5) 확인질문 3개\n원문에 없는 사실은 추가하지 말 것.\n\n${text.slice(0, 10000)}`);
    usedAi = true;
  } catch {
    summary = basicSummary(text);
  }
  const n = {
    id: uid('note'), created: Date.now(), title: splitUsefulLines(text)[0]?.slice(0, 48) || '학습 노트',
    text, summary, grade: usedAi ? 'C' : 'D', fileName: store.get('lastFileName', '')
  };
  state.notes.push(n);
  store.set('notes', state.notes);
  const cards = makeFlashcards(n);
  state.flashcards.push(...cards);
  store.set('flashcards', state.flashcards);
  box.innerHTML = `<div class="note-item"><div class="row"><b>${usedAi ? '무료 AI 정리' : '무료 기본 정리'}</b><span class="spacer"></span>${trust(usedAi ? 'C' : 'D')}</div><div style="white-space:pre-wrap;line-height:1.65;margin-top:10px">${esc(summary)}</div><p class="tiny muted">암기카드 ${cards.length}개도 생성했습니다.</p></div>`;
  toast('정리·저장 완료');
  render();
}

function saveRaw() {
  const text = $('#noteText')?.value.trim();
  if (!text) return toast('내용을 입력하세요.');
  const n = {
    id: uid('note'), created: Date.now(), title: splitUsefulLines(text)[0]?.slice(0, 48) || '개인 노트',
    text, summary: '', grade: 'D', fileName: store.get('lastFileName', '')
  };
  state.notes.push(n);
  store.set('notes', state.notes);
  const cards = makeFlashcards(n);
  state.flashcards.push(...cards);
  store.set('flashcards', state.flashcards);
  toast(`원문 저장 · 암기카드 ${cards.length}개`);
  render();
}

function makeFlashcards(note) {
  const lines = splitUsefulLines(note.summary || note.text).slice(0, 10);
  return lines.slice(0, 6).map((line, i) => ({
    id: uid('card'), noteId: note.id, source: note.title,
    front: `핵심 ${i + 1}: 이 내용을 설명해보세요`, back: line, created: Date.now()
  }));
}

function generateFlashcardsFromNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  state.flashcards = state.flashcards.filter(c => c.noteId !== id);
  const cards = makeFlashcards(note);
  state.flashcards.push(...cards);
  store.set('flashcards', state.flashcards);
  toast(`암기카드 ${cards.length}개 생성`);
  go('study');
}

function makeLocalQuestions(note) {
  const lines = splitUsefulLines(note.summary || note.text).filter(x => x.length >= 18).slice(0, 8);
  if (!lines.length) return [];
  return lines.slice(0, 5).map((line, idx) => {
    const words = tokenize(line).filter(w => w.length >= 2);
    const answerWord = words.sort((a, b) => b.length - a.length)[0] || '핵심어';
    const stem = line.replace(new RegExp(answerWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
    const distractors = ['원문 확인 필요', '다른 개념', '해당 없음'].filter(x => x !== answerWord);
    const choices = [answerWord, ...distractors].slice(0, 4);
    const rotated = choices.map((_, i) => choices[(i + idx) % choices.length]);
    return {
      id: uid('pq'), noteId: note.id, subject: '내 노트', chapter: note.title.slice(0, 20), concept: '회상',
      sourceType: 'personal', grade: 'D', q: `[내 노트 회상] 빈칸에 들어갈 핵심어는?\n${stem}`,
      choices: rotated, a: rotated.indexOf(answerWord), ex: line, sourceLabel: `내 노트: ${note.title}`
    };
  });
}

async function generateQuestionsFromNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  let created = makeLocalQuestions(note);
  if (!created.length) return toast('문제를 만들 충분한 문장이 없습니다.');
  state.generatedQuestions = state.generatedQuestions.filter(q => q.noteId !== id);
  state.generatedQuestions.push(...created);
  store.set('generatedQuestions', state.generatedQuestions);
  state.bankFilter = 'personal';
  state.focusedQuestionId = created[0].id;
  toast(`내 노트 문제 ${created.length}개 생성`);
  go('bank');
}

function retryWrong(qid) {
  state.focusedQuestionId = qid;
  state.bankFilter = 'all';
  go('bank');
}

function relearnWrong(qid) {
  const q = allQuestions().find(x => x.id === qid);
  if (!q) return;
  state.chat.push({ role: 'user', content: `내가 틀린 문제를 다시 가르쳐줘.\n문제: ${q.q}\n해설/근거: ${q.ex}\n시험에 나올 수 있는 함정까지 설명해줘.` });
  store.set('chat', state.chat);
  go('tutor');
}

function reviewedWrong(qid) {
  const w = state.wrongs.find(x => x.qid === qid && !x.resolved);
  if (!w) return;
  const next = clamp((w.intervalDays || 1) * 2, 1, 30);
  w.intervalDays = next;
  w.dueAt = Date.now() + next * 86400000;
  store.set('wrongs', state.wrongs);
  toast(`${next}일 후 다시 복습`);
  render();
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startExam() {
  const pool = allQuestions();
  if (!pool.length) return toast('문제은행이 비어 있습니다.');
  const qs = [];
  let cycle = [];
  for (let i = 0; i < 65; i++) {
    if (!cycle.length) cycle = shuffled(pool);
    const base = cycle.shift();
    qs.push({ ...base, instance: `${base.id}-${i}-${Date.now()}` });
  }
  state.exam = { qs, idx: 0, started: Date.now(), answers: {}, conf: {}, marked: {}, finishing: false };
  render();
  examTimer = setInterval(() => { if (state.page === 'exam' && state.exam) render(); }, 1000);
}
