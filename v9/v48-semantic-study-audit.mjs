import fs from 'node:fs';
import vm from 'node:vm';
const ok=(v,m)=>{if(!v)throw Error(m);console.log('PASS',m)};
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const note=fs.readFileSync(new URL('./pass-note.js',import.meta.url),'utf8');
const mock=fs.readFileSync(new URL('./mock-exam-quality-119.js',import.meta.url),'utf8');

ok(app.includes('<div class="study-quick-title"><span>핵심</span>')&&!app.includes('>30초 핵심<'),'core learner label is concise 핵심 instead of 30초 핵심');
ok(app.includes('data-pass-core')&&app.includes('study-core-save')&&app.includes('data-pass-note-open')&&app.includes('합격노트 보기')&&app.includes("V.PassNote.toggleConceptCore"),'core uses one whole-concept favorite plus direct pass-note navigation');
ok(app.includes('data-hazmat-class-toggle')&&app.includes('hazmat-item-list')&&app.includes('류 자세히 학습'),'hazard class cards expand into item list and detailed concept navigation');
for(const type of ['hazmat','facility','governance','law','emsCondition','emsProcedure','emsAssessment','phenomenon','history','organizationTheory','suppression','investigation','emsSystem','emsAnatomy','emsTrauma','emsResuscitation','equipment'])ok(app.includes(type+':['),'semantic detail rules cover '+type);
ok(!app.includes('detail-key"><span class="study-star">★</span>'),'detail prose no longer paints every bullet with decorative stars');
ok(css.includes('.study-key-emphasis')&&css.includes('.detail-plain-list')&&css.includes('.concept-class-grid'),'clean emphasis and semantic classification-card styles are present');
ok(note.includes('font-size:13.5pt')&&note.includes('maximum-scale=5')&&note.includes('텍스트 기반 문서 · PDF 저장 후 확대해도 선명하게'),'summary print output uses larger text and zoom-friendly vector/text document');
ok(mock.includes('q?.officialPastExam===true')&&mock.includes('q.currentCompatibility===true'),'real mock recognizes official past exams and excludes unverified current-law compatibility');

globalThis.window={AITUTOR_V9:{questions:[]}};
for(const file of ['curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js']){
  vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
}
vm.runInThisContext(fs.readFileSync(new URL('./questions-official-past-2025-119.js',import.meta.url),'utf8'),{filename:'questions-official-past-2025-119.js'});
const V=window.AITUTOR_V9,p=V.OfficialPastExam119,qs=p?.questions||[];
ok(p?.ready===true&&qs.length>=30,'official 2025 past-exam image-independent subset is loaded');
ok(qs.every(q=>q.officialPastExam===true&&q.pastExamClaim===true&&q.generatedPractice===false&&q.reviewStatus==='official-past-exam'),'only actual past-exam questions receive past-exam claim');
ok(qs.every(q=>Array.isArray(q.choices)&&q.choices.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4),'official past questions preserve four-choice single-answer contract');
ok(qs.every(q=>String(q.sourceUrl||'').includes('nfa.go.kr')&&q.license==='공공누리 제1유형'),'official past questions preserve NFA attribution and KOGL type-1 license metadata');
ok(qs.every(q=>!/<그림>|Image:/.test(String(q.q||''))),'image-dependent past-exam stems are excluded from text-only lane');
console.log('V48_SEMANTIC_STUDY_AUDIT_COMPLETE',JSON.stringify({pastQuestions:qs.length,fire:p.fire,ems:p.ems},null,2));