import fs from 'node:fs';
import vm from 'node:vm';

await import('./question-contract-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.QuestionExpansionV58||!V?.QuestionQuality119)throw Error('V58_EXPANSION_RUNTIME_UNAVAILABLE');

const q=V.QuestionQuality119.audit(),exp=V.QuestionExpansionV58;
const generated=(V.questions||[]).filter(x=>x.generatedBy==='119-v58-precision-expansion');
const rows=V.curriculum.concepts.map(c=>({id:c.id,title:c.title,subject:c.subject,n:V.QuestionQuality119.forConcept(c.id).length,high:exp.rows.find(x=>x.id===c.id)?.highYield===true}));
const under=rows.filter(x=>x.n<(x.high?40:26));
const issues=[];
if(q.examStyle<5000)issues.push({type:'EXAM_STYLE_BELOW_5000',n:q.examStyle});
if(generated.length<1500)issues.push({type:'V58_ADDED_TOO_SMALL',n:generated.length});
if(q.duplicateTexts.length)issues.push({type:'DUPLICATE_STEMS',n:q.duplicateTexts.length});
if(under.length)issues.push({type:'PER_CONCEPT_TARGET_SHORTFALL',n:under.length,first:under.slice(0,10)});
if(generated.some(x=>x.v60Promoted?!(x.grade==='B'&&x.generatedPractice===false&&x.pageVerified===true&&x.realMockCredit===true&&x.practiceMockCredit===true&&x.reviewStatus==='source-rule-reviewed-v60'):(x.grade!=='P'||x.generatedPractice!==true||x.realMockCredit!==false||x.practiceMockCredit!==true)))issues.push({type:'V58_TRUTH_FLAGS'});
if(generated.some(x=>!Array.isArray(x.choiceExplanations)||x.choiceExplanations.length!==4))issues.push({type:'CHOICE_EXPLANATION_CONTRACT'});

vm.runInThisContext(fs.readFileSync(new URL('./mock-exam-quality-119.js',import.meta.url),'utf8'),{filename:'mock-exam-quality-119.js'});
const realRuns=[],practiceRuns=[];let realHistory=[],practiceHistory=[],v58PracticeSelections=0;
for(let i=0;i<12;i++){
  const real=V.MockExam119.build({mode:'real',level:'mid',history:realHistory});
  if(real.length!==65)issues.push({type:'REAL_MOCK_LENGTH',i,n:real.length});
  if(real.some(x=>x.generatedBy==='119-v58-precision-expansion'&&!x.v60Promoted))issues.push({type:'UNREVIEWED_V58_LEAKED_INTO_REAL',i});
  realHistory.push({questionIds:real.map(x=>x.id)});
  realRuns.push(real.length);
  const practice=V.MockExam119.build({mode:'practice',level:'mid',history:practiceHistory});
  if(practice.length!==65)issues.push({type:'PRACTICE_MOCK_LENGTH',i,n:practice.length});
  v58PracticeSelections+=practice.filter(x=>x.generatedBy==='119-v58-precision-expansion').length;
  practiceHistory.push({questionIds:practice.map(x=>x.id)});
  practiceRuns.push(practice.length);
}
if(v58PracticeSelections<1)issues.push({type:'EXPANDED_POOL_NOT_REACHING_PRACTICE_ROTATION',v58PracticeSelections});

const bySubject={fire:generated.filter(x=>x.subject==='fire').length,ems:generated.filter(x=>x.subject==='ems').length};
const summary={
  version:'119-v58-question-expansion-audit-v1',
  totalQuestions:(V.questions||[]).length,
  examStyle:q.examStyle,
  foundationDrill:q.foundationDrill,
  v58Added:generated.length,
  v60PromotedFromV58:generated.filter(x=>x.v60Promoted).length,
  v58BySubject:bySubject,
  equivalent65QuestionSets:Math.floor(q.examStyle/65),
  perConceptMinimum:{general:26,highYield:40},
  highYieldConcepts:exp.highYieldConcepts,
  realMock:{runs:realRuns.length,v58Selected:0,strictABOnly:true},
  practiceMock:{runs:practiceRuns.length,v58Selected:v58PracticeSelections,expandedPool:true},
  duplicateTexts:q.duplicateTexts.length,
  issues:issues.length
};
console.log('V58_QUESTION_EXPANSION_SUMMARY',JSON.stringify(summary,null,2));
if(issues.length){console.error('V58_QUESTION_EXPANSION_ISSUES',JSON.stringify(issues.slice(0,60),null,2));throw Error('V58_QUESTION_EXPANSION_FAILED '+JSON.stringify({issues:issues.length,first:issues[0]}))}
console.log('V58_QUESTION_EXPANSION_ACCEPTANCE_SUCCESS');
