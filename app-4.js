function setConfidence(id, confidence) {
  state.confidences[id] = confidence;
  store.set('confidences', state.confidences);
  toast('확신도 저장');
  render();
}

function answer(id, raw) {
  const index = Number(raw);
  const q = allQuestions().find(x => x.id === id);
  if (!q) return;
  state.answers[id] = index;
  const correct = index === q.a;
  const existing = state.wrongs.find(w => w.qid === id && !w.resolved);
  if (!correct) {
    if (!existing) {
      state.wrongs.push({
        id: uid('wrong'), qid: id, confidence: state.confidences[id] || 'none',
        at: Date.now(), dueAt: Date.now(), intervalDays: 1, attempts: 1, resolved: false
      });
    } else {
      existing.attempts = (existing.attempts || 1) + 1;
      existing.confidence = state.confidences[id] || existing.confidence;
      existing.dueAt = Date.now();
    }
  } else if (existing) {
    existing.resolved = true;
    existing.resolvedAt = Date.now();
  }
  saveCore();
  render();
  const card = document.querySelector(`[data-question-card="${CSS.escape(id)}"]`);
  card?.scrollIntoView({ block: 'center' });
}

function deleteNote(id) {
  if (!confirm('이 노트를 삭제할까요?')) return;
  state.notes = state.notes.filter(n => n.id !== id);
  state.flashcards = state.flashcards.filter(c => c.noteId !== id);
  state.generatedQuestions = state.generatedQuestions.filter(q => q.noteId !== id);
  saveCore();
  render();
}

function askNote(id) {
  const note = state.notes.find(n => n.id === id);
  if (!note) return;
  state.chat.push({ role: 'user', content: `다음 내 노트를 시험 과외처럼 설명해줘:\n${(note.summary || note.text).slice(0, 7000)}` });
  store.set('chat', state.chat);
  go('tutor');
}

function tokenize(text) {
  return String(text).toLowerCase().replace(/[^0-9a-zA-Z가-힣\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
}

function localRetrieve(query) {
  const qwords = new Set(tokenize(query));
  const scored = state.notes.map(n => {
    const body = `${n.title || ''}\n${n.summary || ''}\n${n.text || ''}`;
    let score = 0;
    for (const w of tokenize(body)) if (qwords.has(w)) score++;
    return { note: n, score };
  }).sort((a, b) => b.score - a.score);
  return scored.filter(x => x.score > 0).slice(0, 3).map(x => x.note);
}

function basicTutorResponse(query) {
  const hits = localRetrieve(query);
  if (!hits.length) {
    return `무료 로컬 AI를 현재 사용할 수 없어 기본 근거검색 모드로 답합니다.\n\n내 저장 노트에서 관련 내용을 찾지 못했습니다. “내 노트”에 공식 교재 PDF나 필기를 넣은 뒤 다시 질문하면 해당 내용에서 찾아드릴 수 있습니다.\n\n공식자료 확인 필요.`;
  }
  return `무료 기본 근거검색 모드\n\n${hits.map((n, i) => `${i + 1}. ${n.title}\n${(n.summary || n.text).slice(0, 800)}`).join('\n\n')}\n\n위 내용은 내 저장 노트에서 찾은 관련 부분입니다. 원문과 공식자료를 최종 확인하세요.`;
}

async function loadAI() {
  if (state.ai.loading || state.ai.engine) return state.ai.engine;
  if (!navigator.gpu) {
    state.ai.text = 'WebGPU 미지원 · 기본 근거검색 모드';
    state.ai.error = '유료 AI로 자동 전환하지 않습니다.';
    render();
    toast('이 기기에서는 무료 기본 모드로 계속 사용할 수 있습니다.');
    return null;
  }
  state.ai.loading = true;
  state.ai.error = '';
  state.ai.text = '무료 AI 라이브러리 불러오는 중';
  render();
  try {
    const webllm = await import('https://esm.run/@mlc-ai/web-llm@0.2.85');
    const list = webllm.prebuiltAppConfig?.model_list || [];
    const preferred =
      list.find(x => /Qwen2-0\.5B.*Instruct.*q4/i.test(x.model_id)) ||
      list.find(x => /Qwen.*0\.5B.*Instruct/i.test(x.model_id)) ||
      list.filter(x => (x.vram_required_MB || 99999) < 1400).sort((a, b) => (a.vram_required_MB || 9e9) - (b.vram_required_MB || 9e9))[0];
    if (!preferred) throw new Error('사용 가능한 소형 무료 모델을 찾지 못했습니다.');
    state.ai.model = preferred.model_id;
    state.ai.engine = await webllm.CreateMLCEngine(preferred.model_id, {
      initProgressCallback: p => {
        state.ai.progress = p.progress || 0;
        state.ai.text = p.text || '모델 로딩 중';
        const box = $('.ai-status');
        if (box) box.innerHTML = `<b>${esc(state.ai.text)}</b><div class="bar"><i style="width:${state.ai.progress * 100}%"></i></div>`;
      }
    });
    state.ai.progress = 1;
    state.ai.text = `준비 완료 · ${preferred.model_id}`;
    toast('무료 로컬 AI 준비 완료');
    return state.ai.engine;
  } catch (err) {
    console.error(err);
    state.ai.engine = null;
    state.ai.text = '무료 AI 로딩 실패 · 기본 모드 사용 가능';
    state.ai.error = String(err?.message || err).slice(0, 180);
    toast('무료 AI 로딩 실패 · 유료 전환 없음');
    return null;
  } finally {
    state.ai.loading = false;
    render();
  }
}

async function ai(prompt, system = '너는 소방공무원 구급 경채 수험생의 한국어 과외 선생이다. 공식근거가 주어지지 않은 내용은 공식 사실처럼 단정하지 말고, 불확실하면 반드시 “공식자료 확인 필요”라고 표시한다.') {
  if (!state.ai.engine) await loadAI();
  if (!state.ai.engine) throw new Error('FREE_LOCAL_AI_UNAVAILABLE');
  const res = await state.ai.engine.chat.completions.create({
    messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 800
  });
  return res.choices?.[0]?.message?.content || '';
}

async function sendChat() {
  const input = $('#chatInput');
  const text = input?.value.trim();
  if (!text) return;
  state.chat.push({ role: 'user', content: text });
  state.chat.push({ role: 'assistant', content: '생각 중…' });
  store.set('chat', state.chat);
  render();
  try {
    const related = localRetrieve(text).map(n => (n.summary || n.text).slice(0, 1600)).join('\n---\n');
    const prompt = `과외 모드: ${state.tutorMode}\n질문: ${text}\n${related ? `내 노트 참고:\n${related}\n` : ''}쉬운 설명 → 시험 포인트 → 이해 확인 질문 1개 순서로 답해줘.`;
    const out = await ai(prompt);
    state.chat[state.chat.length - 1] = { role: 'assistant', content: out };
  } catch {
    state.chat[state.chat.length - 1] = { role: 'assistant', content: basicTutorResponse(text) };
  }
  store.set('chat', state.chat);
  render();
}

async function processFile(file) {
  if (!file) return;
  state.importStatus = `${file.name} 읽는 중…`;
  render();
  try {
    let text = '';
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) text = await extractPDF(file);
    else if (file.type.startsWith('image/')) text = await ocrImage(file);
    else text = await file.text();
    state.importStatus = `${file.name} 추출 완료 · 원문 확인 필요`;
    render();
    const area = $('#noteText');
    if (area) area.value = text;
    area?.focus();
    store.set('lastFileName', file.name);
    toast('텍스트 추출 완료');
  } catch (err) {
    console.error(err);
    state.importStatus = `자동 추출 실패: ${String(err?.message || err).slice(0, 100)}`;
    render();
    toast('자동 추출 실패 · 직접 붙여넣기 가능');
  }
}

async function extractPDF(file) {
  const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const out = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    state.importStatus = `PDF ${i}/${pdf.numPages}쪽 읽는 중…`;
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    out.push(`[${i}쪽]\n${tc.items.map(x => x.str).join(' ')}`);
  }
  return out.join('\n\n');
}

async function ocrImage(file) {
  state.importStatus = 'OCR 엔진 불러오는 중…';
  const T = await import('https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js');
  const worker = await T.createWorker('kor+eng', 1, {
    logger: m => {
      if (m.progress) state.importStatus = `OCR ${Math.round(m.progress * 100)}% · ${m.status || ''}`;
    }
  });
  const result = await worker.recognize(file);
  await worker.terminate();
  return result.data.text || '';
}
