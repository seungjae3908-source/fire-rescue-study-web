'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.curriculum?.concepts||!V.contentPacks||!V.QuestionQuality119)return;

const Q=V.QuestionQuality119;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const clip=(s,n=180)=>{const x=norm(s);return x.length>n?x.slice(0,n-1)+'…':x};
const exactTextbook=/2026\s+(?:소방전술1(?:\(화재[12]\))?|소방전술3\(구급\)|예방실무[12]|소방법령\d?)(?:\s+PDF)?[^\n]*?\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/;
const forbidden=/연습용|factory|generated|메타|내부|검증문제|승격대상/i;
const target={fire:100,ems:160},conceptCap=2;

function packFor(id){return V.contentPacks.authored?.[id]||V.contentPacks.get?.(id)||{}}
function rowsFor(pack){
  const rows=[];
  const put=(kind,label,value)=>{
    if(Array.isArray(value)){for(const x of value)put(kind,label,x);return}
    if(value&&typeof value==='object'){
      if('body'in value)return put(kind,label,value.body);
      if('text'in value)return put(kind,label,value.text);
      if('value'in value)return put(kind,label,value.value);
      return
    }
    const text=clip(value,220);if(text.length>=12)rows.push({kind,label,text})
  };
  put('summary','정의·요약',pack.summary);
  put('definition','정의',pack.studySchema?.definition);
  put('quick','핵심',pack.studySchema?.quick30);
  put('detail','상세',pack.detail||[]);
  put('must','핵심',pack.must||[]);
  put('feature','특징',pack.features||[]);
  put('flow','흐름',pack.flow||[]);
  put('trap','주의',pack.traps||[]);
  put('deep','심화',(pack.deepSections||[]).map(x=>x?.body));
  put('condition','발생·적용 조건',pack.studySchema?.conditions||[]);
  put('mechanism','작용 원리',pack.studySchema?.mechanisms||[]);
  put('timing','단계·시기',pack.studySchema?.timingStages||[]);
  put('warning','전조·위험신호',pack.studySchema?.warningSigns||[]);
  put('beforeAfter','발생 전·후',pack.studySchema?.beforeAfter||[]);
  for(const row of pack.compare||[])if(Array.isArray(row)&&row[0]&&row[1])put('compare','비교·구분',row[0]+' → '+row[1]);
  for(const x of pack.numbers||[])put('number','수치·기준',typeof x==='string'?x:(x?.text||x?.value||x?.label||''));
  const seen=new Set;return rows.filter(x=>{const k=norm(x.text).toLowerCase();if(!k||seen.has(k))return false;seen.add(k);return true})
}
function quotedStem(q){
  const m=String(q?.q||'').match(/^다음 설명에 해당하는 개념은\?\s*[“"](.+)[”"]$/);
  return m?norm(m[1]):''
}
function candidate(q){
  if(q?.generatedBy!=='119-v58-precision-expansion'||q.grade!=='P'||q.generatedPractice!==true)return null;
  if(!/-identify-/.test(String(q.id||''))||!Q.isExamStyle(q)||forbidden.test(String(q.q||'')))return null;
  const concept=V.curriculum.byId?.[q.conceptId],pack=packFor(q.conceptId),source=norm(q.source);
  if(!concept||pack?.status!=='verified'||!exactTextbook.test(source))return null;
  if(!Array.isArray(q.choices)||q.choices.length!==4||q.choices[q.a]!==concept.title)return null;
  if(new Set(q.choices.map(x=>norm(x).toLowerCase())).size!==4)return null;
  const peerTitles=new Map(V.curriculum.concepts.filter(x=>x.subject===concept.subject).map(x=>[norm(x.title),x.id]));
  if(q.choices.some((x,i)=>i!==q.a&&!peerTitles.has(norm(x))))return null;
  if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>norm(x).length<12))return null;
  const quote=quotedStem(q);if(!quote)return null;
  const rows=rowsFor(pack),row=rows.find(x=>quote===clip(x.text,175)||clip(x.text,175).startsWith(quote)||quote.startsWith(clip(x.text,160)));
  if(!row)return null;
  return{q,concept,pack,row,source}
}
function select(subject,limit){
  const all=(V.questions||[]).map(candidate).filter(Boolean).filter(x=>x.q.subject===subject);
  all.sort((a,b)=>{
    const ac=V.QuestionQuality119.forConcept(a.q.conceptId).filter(x=>x.grade==='A'||x.grade==='B').length;
    const bc=V.QuestionQuality119.forConcept(b.q.conceptId).filter(x=>x.grade==='A'||x.grade==='B').length;
    return ac-bc||a.q.conceptId.localeCompare(b.q.conceptId)||a.q.a-b.q.a||a.q.id.localeCompare(b.q.id)
  });
  const picked=[],byConcept={},byAnswer=[0,0,0,0],byDifficulty={low:0,mid:0,high:0};
  while(picked.length<limit){
    let best=null,bestScore=Infinity;
    for(const x of all){
      if(x.picked||(byConcept[x.q.conceptId]||0)>=conceptCap)continue;
      const answerPenalty=(byAnswer[x.q.a]||0)*7,diffPenalty=(byDifficulty[x.q.difficulty]||0)*2,conceptPenalty=(byConcept[x.q.conceptId]||0)*18;
      const score=answerPenalty+diffPenalty+conceptPenalty;
      if(score<bestScore){best=x;bestScore=score}
    }
    if(!best)break;
    best.picked=true;picked.push(best);byConcept[best.q.conceptId]=(byConcept[best.q.conceptId]||0)+1;byAnswer[best.q.a]++;byDifficulty[best.q.difficulty]=(byDifficulty[best.q.difficulty]||0)+1
  }
  return{picked,available:all.length,byAnswer,byDifficulty}
}

const fire=select('fire',target.fire),ems=select('ems',target.ems),promoted=[...fire.picked,...ems.picked];
for(const x of promoted){
  const q=x.q;
  q.grade='B';
  q.generatedPractice=false;
  q.pageVerified=true;
  q.reviewStatus='source-rule-reviewed-v60';
  q.realMockCredit=true;
  q.practiceMockCredit=true;
  q.pastExamClaim=false;
  q.v60Promoted=true;
  q.promotionOrigin='v58-identify';
  q.promotionMethod='verified-pack-exact-page-direct-identification-v1';
  q.answerTruth='source-rule-reviewed-direct-identification';
}
V.questionById=Object.fromEntries((V.questions||[]).map(q=>[q.id,q]));
V.questionsForConcept=id=>(V.questions||[]).filter(q=>q.conceptId===id);

V.SourceReviewedPromotionV60={
  version:'119-v60-source-rule-promotion-v1',
  policy:'Only direct-identification V58 practice items with verified packs, exact textbook page sources, exact pack-row stems, concept-title answers, same-subject concept distractors, and four meaningful explanations are promoted. Association/pair/free-form/calculation items remain practice-only.',
  target,
  conceptCap,
  available:{fire:fire.available,ems:ems.available},
  promoted:{total:promoted.length,fire:fire.picked.length,ems:ems.picked.length},
  answerPosition:{fire:fire.byAnswer,ems:ems.byAnswer},
  difficulty:{fire:fire.byDifficulty,ems:ems.byDifficulty},
  ids:promoted.map(x=>x.q.id)
};
})();
