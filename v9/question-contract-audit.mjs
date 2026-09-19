import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js',
  'questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js',
  'question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','textbook-grounded-119.js',
  'visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const V=window.AITUTOR_V9,Q=V.QuestionQuality119;
if(!Q?.audit||!V.curriculum?.concepts)throw new Error('QUESTION_CONTRACT_RUNTIME_UNAVAILABLE');

const reasons=q=>{
  const r=[],norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
  if(!/^119-/.test(q?.id||''))r.push('idPrefix');
  if(!Array.isArray(q?.choices)||q.choices.length!==4)r.push('choices4');
  else if(new Set(q.choices.map(norm)).size!==4)r.push('uniqueChoices');
  if(!Number.isInteger(q?.a)||q.a<0||q.a>=4)r.push('singleAnswer');
  if(!Array.isArray(q?.choiceExplanations)||q.choiceExplanations.length!==4)r.push('choiceExplanations4');
  else if(!q.choiceExplanations.every(x=>String(x||'').trim().length>=8))r.push('meaningfulExplanations');
  if(!q?.difficulty)r.push('difficulty');
  if(!q?.type)r.push('type');
  if(!q?.source)r.push('source');
  return r;
};

const audit=Q.audit(),failureReasons={};
for(const q of V.questions||[])if(!Q.isExamStyle(q))for(const reason of reasons(q))failureReasons[reason]=(failureReasons[reason]||0)+1;

const rows=V.curriculum.concepts.map(c=>{
  const qs=Q.forConcept(c.id),d={low:0,mid:0,high:0};
  for(const q of qs)d[q.difficulty]=(d[q.difficulty]||0)+1;
  return{id:c.id,title:c.title,scopeId:c.scopeId,subject:c.subject,n:qs.length,low:d.low||0,mid:d.mid||0,high:d.high||0,needed:Math.max(0,6-qs.length),ready:qs.length>=6&&(d.low||0)>=1&&(d.mid||0)>=2&&(d.high||0)>=1};
});
const dist={};for(const r of rows)dist[r.n]=(dist[r.n]||0)+1;
const zero=rows.filter(r=>r.n===0),under6=rows.filter(r=>r.n<6),notReady=rows.filter(r=>!r.ready);
const existingNeed=under6.reduce((s,r)=>s+r.needed,0);
const calc=V.CalculationTraining119?.audit?.()||null;

const summary={
  version:'119-question-contract-current-runtime-v2',
  totalQuestions:(V.questions||[]).length,
  examStyle:audit.examStyle,
  foundationDrill:audit.foundationDrill,
  duplicateTexts:audit.duplicateTexts.length,
  byDifficulty:audit.byDifficulty,
  byType:audit.byType,
  failureReasons,
  conceptDistribution:dist,
  zeroExamStyleConcepts:zero.length,
  underSixConcepts:under6.length,
  contractReadyConcepts:rows.length-notReady.length,
  minimumAdditionalQuestionsToReachSixPerConcept:existingNeed,
  calculationTraining:calc?{ready:calc.ready,families:calc.rows?.length||0,added:calc.added,stageCount:calc.stageCount}:null
};
console.log('QUESTION_CONTRACT_119_SUMMARY',JSON.stringify(summary,null,2));
console.log('QUESTION_CONTRACT_ZERO_CONCEPTS');console.table(zero);
console.log('QUESTION_CONTRACT_NOT_READY');console.table(notReady);
console.log('QUESTION_CONTRACT_EXISTING_COVERAGE');console.table(rows.filter(r=>r.n>0).sort((a,b)=>b.n-a.n||a.id.localeCompare(b.id)));

if(audit.duplicateTexts.length||zero.length||under6.length||notReady.length||!calc?.ready){
  throw new Error('QUESTION_CONTRACT_119_FAILED '+JSON.stringify({
    duplicateTexts:audit.duplicateTexts.length,
    zero:zero.length,
    under6:under6.length,
    notReady:notReady.length,
    calculationSixStage:!!calc?.ready
  }));
}
console.log('QUESTION_CONTRACT_119_AUDIT_COMPLETE');
