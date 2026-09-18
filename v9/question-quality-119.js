'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function isExamStyle(q){
  return !!q&&/^119-/.test(q.id||'')&&Array.isArray(q.choices)&&q.choices.length===4&&new Set(q.choices.map(normalize)).size===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4&&Array.isArray(q.choiceExplanations)&&q.choiceExplanations.length===4&&q.choiceExplanations.every(x=>String(x||'').trim().length>=8)&&!!q.difficulty&&!!q.type&&!!q.source;
}
function classify(q){return isExamStyle(q)?'exam-style':'foundation-drill'}
function forConcept(id){return (V.questionsForConcept?.(id)||[]).filter(isExamStyle)}
function drillsForConcept(id){return (V.questionsForConcept?.(id)||[]).filter(q=>!isExamStyle(q))}
function audit(){
 const qs=V.questions||[],exam=qs.filter(isExamStyle),drill=qs.filter(q=>!isExamStyle(q)),dup=new Map();
 for(const q of exam){const k=normalize(q.q);dup.set(k,(dup.get(k)||0)+1)}
 const duplicateTexts=[...dup].filter(([,n])=>n>1).map(([q,n])=>({q,n}));
 const byDifficulty={low:0,mid:0,high:0},byType={};for(const q of exam){byDifficulty[q.difficulty]=(byDifficulty[q.difficulty]||0)+1;byType[q.type]=(byType[q.type]||0)+1}
 return{total:qs.length,examStyle:exam.length,foundationDrill:drill.length,duplicateTexts,byDifficulty,byType};
}
for(const q of V.questions||[]){q.questionClass=classify(q);if(isExamStyle(q))q.examStyle=true}
V.QuestionQuality119={isExamStyle,classify,forConcept,drillsForConcept,audit,contract:{fourChoices:true,singleAnswer:true,difficulty:true,type:true,allChoiceExplanations:true,source:true,noDuplicateText:true}};
})();