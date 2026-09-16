qualityRuntime.selfTests={pass:0,total:0,failures:[],ran:false};
function runProductionSelfTests(){
  const checks=[];const add=(name,ok,detail='')=>checks.push({name,ok:!!ok,detail});
  const qs=allQuestions();const ids=qs.map(q=>q.id);
  add('시험 청사진 65문항',EXAM_2026.totalQuestions===65&&EXAM_2026.minutes===65,`${EXAM_2026.totalQuestions}/${EXAM_2026.minutes}`);
  add('구급 과목 배분 25+40',EXAM_2026.subjects?.find(s=>s.name==='소방학개론')?.questions===25&&EXAM_2026.subjects?.find(s=>s.name==='응급처치학개론')?.questions===40);
  add('소방학 법정 4대 영역',OFFICIAL_SCOPE_2026.find(x=>x.subject==='소방학개론')?.domains?.length===4);
  add('응급처치 법정 2대 영역',OFFICIAL_SCOPE_2026.find(x=>x.subject==='응급처치학개론')?.domains?.length===2);
  add('응급처치 22개 단원 인덱스',EMS_CHAPTER_INDEX_2026.length===22);
  add('문제 ID 중복 0',ids.length===new Set(ids).size,`전체 ${ids.length}`);
  add('문제 구조 유효',qs.every(q=>Array.isArray(q.choices)&&q.choices.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4));
  add('A문제 출처표시',qs.filter(q=>q.grade==='A').every(q=>String(q.sourceLabel||'').length>4));
  add('유료 fallback 함수 없음',typeof loadAI==='function'&&typeof basicTutorResponse==='function');
  add('공식 PDF IndexedDB',typeof officialDb==='function'&&'indexedDB'in window);
  add('오답 엔진',typeof retryWrong==='function'&&typeof reviewedWrong==='function');
  add('25+40 실전 엔진',typeof buildExamInstances==='function'&&typeof startExam==='function');
  add('문제 품질 게이트',typeof validateAIQuestion==='function'&&typeof normalizeQuestionFingerprint==='function');
  add('단원 학습지도',typeof curriculumPriority==='function'&&typeof chapterMetric==='function');
  add('D-day 플래너',typeof todayStudyPlan==='function'&&typeof examPhase==='function');
  add('반응형 장치 분류',document.documentElement.dataset.device==='phone'||document.documentElement.dataset.device==='tablet'||document.documentElement.dataset.device==='desktop');
  qualityRuntime.selfTests={pass:checks.filter(x=>x.ok).length,total:checks.length,failures:checks.filter(x=>!x.ok),checks,ran:true};
  if(qualityRuntime.selfTests.failures.length)qualityRuntime.errors+=qualityRuntime.selfTests.failures.length;
  return qualityRuntime.selfTests;
}
const _qualityPageBeforeSelfTest=qualityPage;
qualityPage=function(){const html=_qualityPageBeforeSelfTest();const s=qualityRuntime.selfTests;const block=`<section class="card selftest-card"><div class="row"><div><div class="tiny muted">RUNTIME SELF TEST</div><h3>자동 자가검증 ${s.pass}/${s.total||'—'}</h3></div><span class="spacer"></span><span class="tag ${s.failures.length?'d':'a'}">${s.failures.length?'FAIL '+s.failures.length:'PASS'}</span></div>${s.ran?`<div class="selftest-list">${s.checks.map(x=>`<div class="selftest-row ${x.ok?'ok':'fail'}"><span>${x.ok?'✓':'✕'}</span><b>${esc(x.name)}</b><small>${esc(x.detail||'')}</small></div>`).join('')}</div>`:'<p class="muted">검사 준비 중…</p>'}</section>`;return html.replace('</div></div>',block+'</div></div>');};
window.addEventListener('load',()=>{setTimeout(()=>{runProductionSelfTests();if(state.page==='quality')render();},100);},{once:true});
