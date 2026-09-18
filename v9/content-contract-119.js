'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const visualKeywords=/스프링클러|플래시오버|백드래프트|롤오버|보일오버|기도|심장|쇼크|해부|부목|화상|분만|소아|제세동|AED|감지기|제연/;
const calcKeywords=/지정수량|계산|열량|연소|약제|농도|유량|방수/;
const chars=x=>String(x||'').replace(/\s+/g,'').length;
function questionMeta(id){
  const qs=V.QuestionQuality119?.forConcept?.(id)||(V.questionsForConcept?.(id)||[]).filter(q=>q.examStyle===true);
  const diff={low:0,mid:0,high:0},choiceExplained=qs.filter(q=>Array.isArray(q.choiceExplanations)&&q.choiceExplanations.length===4).length;
  for(const q of qs){const d=q.difficulty||V.QuestionDifficulty?.infer?.(q)||'mid';if(diff[d]!==undefined)diff[d]++}
  return{total:qs.length,diff,choiceExplained};
}
function evaluateConcept(id){
  const c=V.curriculum?.byId?.[id],p=V.contentPacks?.get?.(id);
  if(!c||!p)return{id,score:0,complete:false,missing:['conceptOrPack']};
  const text=[p.summary,...(p.detail||[]),...(p.deepSections||[]).flatMap(x=>[x.title,x.body,...(x.bullets||[])])].join(' ');
  const qm=questionMeta(id),numericRanges=(c.sourceRanges||[]).filter(r=>Number.isFinite(Number(r.from)));
  const needsVisual=visualKeywords.test(c.title),needsCalc=calcKeywords.test(c.title)||c.scopeId==='F05';
  const checks={
    officialScope:!!(c.sourceRanges||[]).length,
    sourcePageAnchor:numericRanges.length>0,
    textbookDepth:chars(text)>=900,
    structuredSections:(p.deepSections||[]).length>=4,
    examTraps:(p.traps||[]).length>=2,
    memoryPoints:(p.must||[]).length>=3,
    comparison:!/(비교|종류|분류|위험물|스프링클러|화재현상)/.test(c.title)||((p.compare||[]).length>=2),
    questionsEnough:qm.total>=6,
    difficultyLow:qm.diff.low>=1,
    difficultyMid:qm.diff.mid>=2,
    difficultyHigh:qm.diff.high>=1,
    choiceExplanations:qm.total>0&&qm.choiceExplained===qm.total,
    visual:!needsVisual||!!p.visuals?.length,
    calculation:!needsCalc||!!p.calculations?.length
  };
  const missing=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k),score=Math.round(Object.values(checks).filter(Boolean).length/Object.keys(checks).length*100);
  return{id,title:c.title,scopeId:c.scopeId,subject:c.subject,score,complete:missing.length===0,missing,checks,questionMeta:qm,needsVisual,needsCalc};
}
function audit(){
  const rows=(V.curriculum?.concepts||[]).map(c=>evaluateConcept(c.id));
  const complete=rows.filter(x=>x.complete),avg=Math.round(rows.reduce((a,x)=>a+x.score,0)/Math.max(1,rows.length));
  const blockers={};for(const r of rows)for(const m of r.missing)blockers[m]=(blockers[m]||0)+1;
  return{version:'119-content-contract-v1',total:rows.length,complete:complete.length,incomplete:rows.length-complete.length,averageScore:avg,blockers,rows};
}
V.ContentContract119={evaluateConcept,audit,targets:{textbookChars:900,minQuestions:6,difficulty:{low:1,mid:2,high:1},choiceExplanationForEveryOption:true,pdfPageAnchor:true}};
})();