'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.curriculum?.concepts||!V.contentPacks?.authored||!V.QuestionQuality119)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const clip=(s,n=180)=>{const x=String(s||'').replace(/\s+/g,' ').trim();return x.length>n?x.slice(0,n-1)+'…':x};
const uniq=list=>{const seen=new Set(),out=[];for(const x of list||[]){const t=String(x||'').trim(),k=norm(t);if(!k||seen.has(k))continue;seen.add(k);out.push(t)}return out};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const concepts=V.curriculum.concepts;

function peerConcepts(c){
  return [
    ...concepts.filter(x=>x.id!==c.id&&x.scopeId===c.scopeId),
    ...concepts.filter(x=>x.id!==c.id&&x.subject===c.subject&&x.scopeId!==c.scopeId)
  ];
}
function peerTitleChoices(c,offset=0){
  const out=[],seen=new Set([norm(c.title)]),pool=peerConcepts(c);
  for(let i=0;i<pool.length*3&&out.length<3;i++){const p=pool[(i+offset)%pool.length],k=norm(p?.title);if(!p||seen.has(k))continue;seen.add(k);out.push(p)}
  return out
}
function peerStatementChoices(c,getter,offset=0){
  const out=[],seen=new Set(),pool=peerConcepts(c);
  for(let i=0;i<pool.length*4&&out.length<3;i++){
    const pc=pool[(i+offset)%pool.length],pp=pc&&V.contentPacks.authored[pc.id],text=clip(getter(pc,pp),135),k=norm(text);
    if(!text||seen.has(k))continue;seen.add(k);out.push({text,concept:pc})
  }
  return out
}
function arrange(id,correct,distractors,correctEx){
  if(!correct||distractors.length<3)return null;
  const items=distractors.slice(0,3).map(x=>({text:x.text,ex:x.explanation}));
  const pos=hash(id)%4;items.splice(pos,0,{text:correct,ex:correctEx});
  if(new Set(items.map(x=>norm(x.text))).size!==4)return null;
  return{choices:items.map(x=>x.text),a:pos,choiceExplanations:items.map(x=>x.ex)}
}
function titleCandidate(c,quote,index){
  const peers=peerTitleChoices(c,index*3+1);if(peers.length<3||!quote)return null;
  const id=`119-q2factory-${c.id.toLowerCase()}-title-${index}`;
  const ar=arrange(id,c.title,peers.map(p=>({text:p.title,explanation:`오답. 이 내용은 ‘${p.title}’보다 ‘${c.title}’의 공식 학습내용과 직접 연결된다.`})),`정답. 제시문은 ‘${c.title}’의 공식 근거 기반 설명이다.`);
  if(!ar)return null;
  return{id,difficulty:index===0?'low':index%3===0?'high':'mid',type:'개념식별형',q:`다음 설명에 해당하는 것은? “${clip(quote,210)}”`,...ar}
}
function statementCandidate(c,text,index,kind='핵심'){
  if(!text)return null;
  const getter=(pc,pp)=>{
    if(kind==='주의')return (pp?.traps||[])[index%(pp?.traps?.length||1)]||pp?.summary;
    if(kind==='심화')return (pp?.deepSections||[])[index%(pp?.deepSections?.length||1)]?.body||pp?.summary;
    if(kind==='특징')return (pp?.features||[])[index%(pp?.features?.length||1)]||(pp?.must||[])[0]||pp?.summary;
    return (pp?.must||[])[index%(pp?.must?.length||1)]||(pp?.detail||[])[0]||pp?.summary
  };
  const peers=peerStatementChoices(c,getter,index*4+3);if(peers.length<3)return null;
  const id=`119-q2factory-${c.id.toLowerCase()}-statement-${kind}-${index}`;
  const correct=clip(text,135);
  const ar=arrange(id,correct,peers.map(({text,concept})=>({text,explanation:`오답. 이 문장은 ‘${concept.title}’ 쪽 내용이 섞인 선택지로 현재 개념의 핵심과 다르다.`})),`정답. 이 문장은 ‘${c.title}’에서 확인해야 할 ${kind} 내용이다.`);
  if(!ar)return null;
  const stems={핵심:`다음 중 ${c.title}의 핵심 내용으로 옳은 것은?`,주의:`다음 중 ${c.title}에서 주의해야 할 내용으로 옳은 것은?`,심화:`다음 중 ${c.title}의 원리·설명으로 옳은 것은?`,특징:`다음 중 ${c.title}의 특징으로 가장 적절한 것은?`};
  return{id,difficulty:kind==='주의'?'high':kind==='특징'?(index%2?'mid':'low'):index%3===0?'mid':'low',type:kind==='주의'?'함정판별형':kind==='심화'?'원리형':kind==='특징'?'특징형':'핵심형',q:stems[kind],...ar}
}
function compareCandidate(c,row,index){
  if(!Array.isArray(row)||!row[0]||!row[1])return null;
  const peers=peerStatementChoices(c,(pc,pp)=>{const r=(pp?.compare||[])[0];return Array.isArray(r)?`${r[0]} → ${r[1]}`:(pp?.must||[])[0]||pp?.summary},index*5+2);if(peers.length<3)return null;
  const correct=`${clip(row[0],55)} → ${clip(row[1],105)}`,id=`119-q2factory-${c.id.toLowerCase()}-compare-${index}`;
  const ar=arrange(id,correct,peers.map(({text,concept})=>({text,explanation:`오답. ‘${concept.title}’의 구분 포인트가 섞여 현재 개념의 올바른 비교가 아니다.`})),`정답. ‘${c.title}’에서 직접 연결되는 비교·구분이다.`);
  return ar?{id,difficulty:'high',type:'비교형',q:`다음 중 ${c.title}에 대한 연결로 옳은 것은?`,...ar}:null
}
function candidates(c,p){
  const out=[];
  const quotes=uniq([p.summary,...(p.detail||[]),...(p.deepSections||[]).map(x=>x.body)]).filter(x=>x.length>=20);
  quotes.slice(0,6).forEach((x,i)=>out.push(titleCandidate(c,x,i)));
  uniq(p.must||[]).slice(0,5).forEach((x,i)=>out.push(statementCandidate(c,x,i,'핵심')));
  uniq(p.features||[]).slice(0,4).forEach((x,i)=>out.push(statementCandidate(c,x,i,'특징')));
  uniq(p.traps||[]).slice(0,3).forEach((x,i)=>out.push(statementCandidate(c,x,i,'주의')));
  uniq((p.deepSections||[]).map(x=>x.body)).slice(0,4).forEach((x,i)=>out.push(statementCandidate(c,x,i,'심화')));
  (p.compare||[]).slice(0,4).forEach((x,i)=>out.push(compareCandidate(c,x,i)));
  return out.filter(Boolean)
}

const existingIds=new Set(V.questions.map(q=>q.id)),existingTexts=new Set(V.questions.map(q=>norm(q.q))),added=[];
for(const c of concepts){
  const p=V.contentPacks.authored[c.id];if(!p||p.status!=='verified')continue;
  const highYield=/플래시오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/.test(c.title);
  const target=highYield?20:12,existing=V.QuestionQuality119.forConcept(c.id),need=Math.max(0,target-existing.length);if(!need)continue;
  const pool=candidates(c,p),usedStem=new Set();
  for(const cand of pool){
    if(added.filter(q=>q.conceptId===c.id).length>=need)break;
    if(existingIds.has(cand.id))continue;
    let stem=cand.q,k=norm(stem);
    if(existingTexts.has(k)||usedStem.has(k)){
      const variants=[
        `${c.scopeTitle}에서 ${c.title}에 대한 설명으로 옳은 것은?`,
        `${c.title}의 시험 포인트로 적절한 것은?`,
        `${c.title}에 대한 설명 중 옳은 것은?`,
        `${c.title}과 관련된 내용으로 가장 적절한 것은?`
      ];
      const alt=variants.find(v=>!existingTexts.has(norm(v))&&!usedStem.has(norm(v)));if(!alt)continue;stem=alt;k=norm(alt)
    }
    const q={...cand,q:stem,grade:'P',subject:c.subject,scopeId:c.scopeId,conceptId:c.id,ex:cand.choiceExplanations[cand.a],source:p.source,examStyle:true,questionClass:'exam-style',generatedPractice:true,generatedBy:'119-quality2-question-factory-v1'};
    if(!V.QuestionQuality119.isExamStyle(q))continue;
    existingIds.add(q.id);existingTexts.add(k);usedStem.add(k);V.questions.push(q);added.push(q)
  }
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);
V.Quality2QuestionFactory119={version:'119-quality2-question-factory-v2',added:added.length,targetPerConcept:12,highYieldTarget:20,grade:'P',pastExamClaim:false};
})();