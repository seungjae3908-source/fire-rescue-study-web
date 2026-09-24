// V59 fresh full-CI gate: rerun after Ready-for-review.
import fs from 'node:fs';
import vm from 'node:vm';

await import('./question-contract-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions?.length)throw Error('V59_RUNTIME_UNAVAILABLE');
for(const file of ['question-variant-engine-119.js','mock-exam-quality-119.js'])vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const A=V.VariantEngine119,M=V.MockExam119,Q=V.QuestionQuality119;
const issues=[],assert=(v,m,extra={})=>{if(!v)issues.push({type:m,...extra});else console.log('PASS',m)};
const exam=V.questions.filter(q=>Q.isExamStyle(q));
A.annotateAll();
assert(exam.every(q=>q.masterQuestionId&&q.familyId&&q.answerTruth),'all exam-style questions have master/family/truth metadata');

const plain=exam.find(q=>!q.officialPastExam&&q.type!=='계산형'&&!q.calcFamily);
const pv=A.materialize(plain,123456,0),pv2=A.materialize(plain,123456,0);
assert(!!plain&&pv.variantGenerated&&pv.variantKind==='choice-order','non-calculation practice variants only reorder choices');
assert(pv.q===plain.q,'non-calculation variant preserves the source-grounded stem verbatim');
assert(new Set(pv.choices).size===4&&pv.choices[pv.a]===plain.choices[plain.a],'choice-order variant preserves the correct answer truth');
assert(JSON.stringify(pv)===JSON.stringify(pv2),'same seed reproduces identical practice variant');

const law=exam.find(q=>!q.officialPastExam&&/법령|정의/.test(String(q.type||''))&&q.type!=='계산형');
if(law){const lv=A.materialize(law,9981,1);assert(lv.variantKind==='choice-order'&&lv.q===law.q,'law and definition questions do not receive free-form factual mutation')}
const past=exam.find(q=>q.officialPastExam===true);
if(past)assert(A.materialize(past,777,0)===past,'official past-exam items are never transformed');

const calc=exam.find(q=>q.type==='계산형'&&A.supportsCalculation?.(q));
assert(!!calc,'a supported calculation master exists for parameterized variant QA');
if(calc){
  const vars=Array.from({length:20},(_,i)=>A.materialize(calc,1000+i,i));
  assert(vars.every(q=>q.variantKind==='parameterized-calculation'&&q.answerTruth==='programmatic-formula'&&q.calculationTruth),'calculation variants use formula-bounded parameters with explicit truth');
  assert(new Set(vars.map(q=>q.q+'|'+q.choices[q.a])).size>=6,'calculation master produces multiple distinct numeric variants');
  assert(vars.every(q=>q.choices.length===4&&new Set(q.choices).size===4&&q.choiceExplanations[q.a]?.startsWith('정답.')),'calculation variants retain four-choice single-answer explanation contract');
}

const r1=M.build({mode:'real',level:'mid',history:[],seed:424242}),r1b=M.build({mode:'real',level:'mid',history:[],seed:424242}),r2=M.build({mode:'real',level:'mid',history:[],seed:424243});
assert(r1.length===65&&r1.filter(q=>q.subject==='fire').length===25&&r1.filter(q=>q.subject==='ems').length===40,'seeded real mock keeps 25 fire + 40 EMS');
assert(r1.every(q=>(q.grade==='A'||q.grade==='B')&&!q.variantGenerated),'real mock stays A/B verified and variant-free');
assert(JSON.stringify(r1.map(q=>q.id))===JSON.stringify(r1b.map(q=>q.id)),'same real-mock seed reproduces the same 65 masters');
assert(r1.map(q=>q.id).join('|')!==r2.map(q=>q.id).join('|'),'different real-mock seeds change the 65-question composition');

const pBase=M.build({mode:'practice',level:'mid',history:[],seed:515151}),pVar=A.materializePracticeSet(pBase,515151);
assert(pBase.length===65&&pVar.length===65,'practice mock creates a complete 65-question variant set');
assert(pVar.filter(q=>q.variantGenerated).length>=60,'practice mock materially uses safe variants');
assert(pVar.filter(q=>q.variantGenerated).every(q=>q.grade==='P'&&q.realMockCredit===false&&q.practiceMockCredit===true),'all transformed questions are truthfully marked practice-only');
assert(pVar.every(q=>q.officialPastExam!==true||q.variantGenerated!==true),'official past-exam claim never survives on a transformed question');

let realFailures=0,practiceFailures=0,variantCount=0,history=[];
for(let round=1;round<=50;round++){
  const seed=A.seedFor('audit','real','mid',round),qs=M.build({mode:'real',level:'mid',history,seed});
  if(qs.length!==65||qs.some(q=>q.variantGenerated||!['A','B'].includes(q.grade)))realFailures++;
  const families=qs.map(A.familyId);history.push({questionIds:qs.map(q=>q.id),familyIds:families});
  const pseed=A.seedFor('audit','practice','mid',round),pb=M.build({mode:'practice',level:'mid',history,seed:pseed}),pv=A.materializePracticeSet(pb,pseed);
  if(pv.length!==65)practiceFailures++;variantCount+=pv.filter(q=>q.variantGenerated).length;
}
assert(realFailures===0,'all 50 seeded real rounds preserve strict verified-only boundary',{realFailures});
assert(practiceFailures===0&&variantCount>2500,'all 50 practice rounds build and heavily use safe variants',{practiceFailures,variantCount});
assert(M.policy.familyRecentSuppression===true&&M.policy.seededRounds===true,'mock policy exposes seeded rounds and family-level repeat suppression');
assert(A.policy.lawDefinitionFreeGeneration===false&&A.policy.realMockVariants===false,'variant policy forbids free law mutation and real-mock variants');

const summary={version:'119-v59-seeded-variant-audit-v1',examStyle:exam.length,realRounds:50,practiceRounds:50,practiceVariantSelections:variantCount,calculationMaster:calc?.id||null,issues:issues.length};
console.log('V59_SEEDED_VARIANT_AUDIT_SUMMARY',JSON.stringify(summary,null,2));
if(issues.length){console.error('V59_SEEDED_VARIANT_AUDIT_ISSUES',JSON.stringify(issues.slice(0,40),null,2));throw Error('V59_SEEDED_VARIANT_AUDIT_FAILED '+JSON.stringify({issues:issues.length,first:issues[0]}))}
console.log('V59_SEEDED_VARIANT_AUDIT_SUCCESS');
