import fs from 'node:fs';
import vm from 'node:vm';

await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.questions||!V?.QuestionQuality119)throw new Error('VERIFIED_QUALITY_RUNTIME_UNAVAILABLE');
vm.runInThisContext(fs.readFileSync(new URL('./question-type-119.js',import.meta.url),'utf8'),{filename:'question-type-119.js'});

const verified=V.questions.filter(q=>q.grade==='A'||q.grade==='B');
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]+/g,' ').trim().replace(/\s+/g,' ');
const pageRe=/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const officialRe=/(?:https:\/\/[^\s]*(?:go\.kr|law\.go\.kr)|법률|시행령|시행규칙|고시|훈령)/i;
const sillyRe=/(머리카락|신발\s*(?:색|브랜드)|손톱\s*(?:색|길이)|이름\s*글자|보험정보|퇴원계획|구급차\s*연료|날씨만|정상\s*시력만|키만\s*측정|체중만\s*측정|머리카락\s*성장)/i;
const generic=new Set(['다음','중','가장','적절한','옳은','것은','대한','설명','경우','공식','페이지','근거','적용할','때','어떤','무엇','인가']);
const tokenSet=s=>new Set(norm(s).split(' ').filter(x=>x.length>=2&&!generic.has(x)));
const jac=(a,b)=>{const A=tokenSet(a),B=tokenSet(b);if(A.size<6||B.size<6)return 0;let inter=0;for(const x of A)if(B.has(x))inter++;return inter/(A.size+B.size-inter)};
const answerPos=[0,0,0,0],byDifficulty={low:0,mid:0,high:0},bySubject={fire:0,ems:0},badSource=[],exDrift=[],silly=[],answerCue=[];
for(const q of verified){
  answerPos[q.a]=(answerPos[q.a]||0)+1;byDifficulty[q.difficulty]=(byDifficulty[q.difficulty]||0)+1;bySubject[q.subject]=(bySubject[q.subject]||0)+1;
  if(!pageRe.test(String(q.source||''))&&!officialRe.test(String(q.source||'')))badSource.push({id:q.id,conceptId:q.conceptId,source:q.source});
  if(norm(q.ex)!==norm(q.choiceExplanations?.[q.a]))exDrift.push({id:q.id,conceptId:q.conceptId,a:q.a});
  (q.choices||[]).forEach((x,i)=>{if(i!==q.a&&sillyRe.test(String(x)))silly.push({id:q.id,conceptId:q.conceptId,choice:i,text:x})});
  const lens=(q.choices||[]).map(x=>norm(x).length),correct=lens[q.a]||0,wrong=lens.filter((_,i)=>i!==q.a),avg=wrong.reduce((a,b)=>a+b,0)/Math.max(1,wrong.length);
  if(correct>=45&&avg&&correct/avg>2.6)answerCue.push({id:q.id,conceptId:q.conceptId,ratio:Number((correct/avg).toFixed(2))});
}
const near=[];
for(let i=0;i<verified.length;i++)for(let j=i+1;j<verified.length;j++){
  const a=verified[i],b=verified[j];if(a.conceptId!==b.conceptId)continue;
  if(a.evidenceDerivedFrom===b.id||b.evidenceDerivedFrom===a.id)continue;
  const score=jac(a.q,b.q);if(score>=.92)near.push({a:a.id,b:b.id,conceptId:a.conceptId,score:Number(score.toFixed(3))});
}
const shares=answerPos.map(n=>Number((n/Math.max(1,verified.length)).toFixed(3)));
const diffShares=Object.fromEntries(Object.entries(byDifficulty).map(([k,n])=>[k,Number((n/Math.max(1,verified.length)).toFixed(3))]));
const family=V.QuestionType119.audit();
const derived=verified.filter(q=>q.evidenceDerivedFrom),byId=Object.fromEntries(verified.map(q=>[q.id,q]));
const brokenDerived=derived.filter(q=>{const b=byId[q.evidenceDerivedFrom];return !b||b.conceptId!==q.conceptId||String(b.source||'')!==String(q.source||'')});
const summary={
  version:'119-v13-verified-question-quality-v1',
  verified:verified.length,
  bySubject,answerPos,answerShares:shares,byDifficulty,difficultyShares:diffShares,
  family:family.byFamily,
  badSource:badSource.length,
  explanationDrift:exDrift.length,
  absurdDistractors:silly.length,
  nearDuplicatePairs:near.length,
  answerCueReview:answerCue.length,
  derivedBindings:{total:derived.length,broken:brokenDerived.length}
};
console.log('VERIFIED_QUESTION_QUALITY_SUMMARY',JSON.stringify(summary,null,2));
console.log('VERIFIED_QUESTION_BAD_SOURCE');console.table(badSource);
console.log('VERIFIED_QUESTION_EXPLANATION_DRIFT');console.table(exDrift);
console.log('VERIFIED_QUESTION_ABSURD_DISTRACTORS');console.table(silly);
console.log('VERIFIED_QUESTION_NEAR_DUPLICATES');console.table(near);
console.log('VERIFIED_QUESTION_ANSWER_CUE_REVIEW');console.table(answerCue.slice(0,80));
console.log('VERIFIED_QUESTION_DERIVED_BINDING_BROKEN');console.table(brokenDerived.map(q=>({id:q.id,base:q.evidenceDerivedFrom,conceptId:q.conceptId,source:q.source})));

const answerBalance=shares.every(x=>x>=.18&&x<=.32);
const difficultyBalance=['low','mid','high'].every(k=>(diffShares[k]||0)>=.05);
if(verified.length<600||badSource.length||exDrift.length||silly.length||near.length||brokenDerived.length||!answerBalance||!difficultyBalance||family.activeFamilies<6){
  throw new Error('VERIFIED_QUESTION_QUALITY_FAILED '+JSON.stringify({
    verified:verified.length,badSource:badSource.length,explanationDrift:exDrift.length,absurdDistractors:silly.length,
    nearDuplicatePairs:near.length,brokenDerived:brokenDerived.length,answerBalance,difficultyBalance,activeFamilies:family.activeFamilies,answerShares:shares,difficultyShares:diffShares
  }));
}
console.log('VERIFIED_QUESTION_QUALITY_AUDIT_COMPLETE');
