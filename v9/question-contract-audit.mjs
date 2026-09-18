import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','master-syllabus-119.js',
  'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js',
  'question-difficulty.js','question-quality-119.js',
  'depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js','fire-depth-119.js','governance-depth-119.js',
  'investigation-depth-119.js','facilities-depth-119.js','hazmat-reference-2026.js','hazmat-depth-119.js',
  'suppression-depth-119.js','ems-rich-2026.js','ems-depth-119.js','question-bank-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
const V=window.AITUTOR_V9,Q=V.QuestionQuality119;

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
for(const q of V.questions||[])if(!Q.isExamStyle(q))for(const r of reasons(q))failureReasons[r]=(failureReasons[r]||0)+1;

const rows=(V.curriculum.concepts||[]).map(c=>{
  const qs=Q.forConcept(c.id),d={low:0,mid:0,high:0};
  for(const q of qs)d[q.difficulty]=(d[q.difficulty]||0)+1;
  return{id:c.id,title:c.title,scopeId:c.scopeId,subject:c.subject,n:qs.length,low:d.low||0,mid:d.mid||0,high:d.high||0,needed:Math.max(0,6-qs.length)};
});
const dist={};for(const r of rows)dist[r.n]=(dist[r.n]||0)+1;
const zero=rows.filter(r=>r.n===0),under6=rows.filter(r=>r.n<6),ready=rows.filter(r=>r.n>=6&&r.low>=1&&r.mid>=2&&r.high>=1);
const existingNeed=under6.reduce((s,r)=>s+r.needed,0);

console.log('QUESTION_CONTRACT_119_SUMMARY',JSON.stringify({
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
  contractReadyConcepts:ready.length,
  minimumAdditionalQuestionsToReachSixPerConcept:existingNeed
},null,2));
console.log('QUESTION_CONTRACT_ZERO_CONCEPTS');
console.table(zero);
console.log('QUESTION_CONTRACT_EXISTING_COVERAGE');
console.table(rows.filter(r=>r.n>0).sort((a,b)=>b.n-a.n||a.id.localeCompare(b.id)));
console.log('QUESTION_CONTRACT_AUDIT_COMPLETE');
