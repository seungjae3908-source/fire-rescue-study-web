/* V69 split from runtime-v69-e.js part 1 */
/* --- question-bank-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.curriculum?.concepts||!V.contentPacks?.authored||!V.QuestionQuality119)return;

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const clip=(s,n=180)=>{const x=String(s||'').replace(/\s+/g,' ').trim();return x.length>n?x.slice(0,n-1)+'…':x};
const studentQuote=(s,n=210)=>clip(String(s||'').replace(/\b20\d{2}\s*(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+)\s*기준으로\s*/gi,'').replace(/\s*교재의\s*정의(?:이)?다\.?/gi,'').replace(/\s+/g,' ').trim(),n);
const uniq=list=>{const seen=new Set(),out=[];for(const x of list){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x)}return out};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const identity=c=>`${c.scopeTitle} > ${c.title}`;
const concepts=V.curriculum.concepts;
const byId=V.curriculum.byId;

function peerPool(c){
  const sameScope=concepts.filter(x=>x.id!==c.id&&x.scopeId===c.scopeId&&norm(x.title)!==norm(c.title));
  const sameSubject=concepts.filter(x=>x.id!==c.id&&x.subject===c.subject&&x.scopeId!==c.scopeId&&norm(x.title)!==norm(c.title));
  return [...sameScope,...sameSubject];
}
function peerTitles(c,count=3,offset=0){
  const pool=peerPool(c),out=[],seen=new Set([norm(c.title)]);
  for(let i=0;i<pool.length*2&&out.length<count;i++){
    const p=pool[(i+offset)%pool.length];if(!p)break;
    const k=norm(p.title);if(seen.has(k))continue;seen.add(k);out.push({text:p.title,concept:p});
  }
  return out;
}
function peerValues(c,getter,count=3,offset=0){
  const pool=peerPool(c),out=[],seen=new Set();
  for(let i=0;i<pool.length*3&&out.length<count;i++){
    const p=pool[(i+offset)%pool.length];if(!p)break;
    const raw=getter(p,V.contentPacks.authored[p.id]);
    const text=clip(raw,110),k=norm(text);if(!k||seen.has(k))continue;
    seen.add(k);out.push({text,concept:p});
  }
  return out;
}
function arrange(id,kind,correct,distractors,correctExplanation){
  const d=uniq(distractors.map(x=>x.text)).map(text=>distractors.find(x=>norm(x.text)===norm(text))).filter(Boolean);
  if(!correct||d.length<3)return null;
  const position=hash(id+'|'+kind)%4,items=d.slice(0,3).map(x=>({text:x.text,explanation:x.explanation}));
  items.splice(position,0,{text:correct,explanation:correctExplanation});
  if(new Set(items.map(x=>norm(x.text))).size!==4)return null;
  return{choices:items.map(x=>x.text),a:position,choiceExplanations:items.map(x=>x.explanation)};
}
function semanticTitleChoices(c,p){
  const rows=(p?.compare||[]).filter(x=>Array.isArray(x)&&x[0]&&x[1]),self=rows.find(x=>norm(x[0])===norm(c.title));
  if(!self||rows.length<4)return null;
  const distractors=rows.filter(x=>norm(x[0])!==norm(c.title)).slice(0,3).map(x=>({text:clip(x[0],60),explanation:`오답. ‘${x[0]}’은 ${studentQuote(x[1],120)}`}));
  return distractors.length===3?{distractors,correctExplanation:`정답. ‘${c.title}’은 ${studentQuote(self[1],140)}`}:null
}
function titleChoice(c,p,quote,kind,difficulty,type,offset=0){
  const clean=studentQuote(quote,210);if(!clean)return null;
  const semantic=semanticTitleChoices(c,p),peers=semantic?[]:peerTitles(c,3,offset);if(!semantic&&peers.length<3)return null;
  const distractors=semantic?semantic.distractors:peers.map(({text,concept})=>({
    text,
    explanation:`오답. 이 선택지는 ${concept.scopeTitle}의 ‘${concept.title}’ 개념이며 제시문이 설명하는 개념과 다르다.`
  }));
  const ar=arrange(c.id,kind,c.title,distractors,semantic?.correctExplanation||`정답. 제시문은 ‘${c.title}’의 핵심 내용을 설명한다.`);
  if(!ar)return null;
  const phenomenon=V.ConceptArchitecture119?.typeOf?.(c.id)==='phenomenon',lead=phenomenon?'다음 설명에 해당하는 화재현상은?':'다음 설명에 해당하는 것은?';
  const stems={
    summary:`${lead} “${clean}”`,
    'detail-a':`다음 설명에 해당하는 개념은? “${clean}”`,
    'detail-b':`다음 설명과 가장 관련 있는 것은? “${clean}”`,
    deep:`다음 내용이 설명하는 것은? “${clean}”`
  };
  return{kind,difficulty,type,q:stems[kind]||`${lead} “${clean}”`,...ar};
}
function memoryChoice(c,p,kind='memory',difficulty='low'){
  const correct=clip((p.must||[])[0]||p.summary,110);
  const peers=peerValues(c,(pc,pp)=>(pp?.must||[])[0]||pp?.summary,3,3);
  if(peers.length<3)return null;
  const ar=arrange(c.id,kind,correct,peers.map(({text,concept})=>({
    text,
    explanation:`오답. 이 항목은 ‘${concept.title}’ 쪽의 핵심 포인트로 분류되며 ‘${c.title}’의 핵심 내용과 다르다.`
  })),`정답. 이 항목은 ‘${c.title}’에서 반드시 기억해야 할 핵심이다.`);
  return ar?{kind,difficulty,type:'핵심기억형',q:`다음 중 ${c.title}의 핵심 내용으로 옳은 것은?`,...ar}:null;
}
function pairChoice(c,p,kind='pair-a',difficulty='high',shift=0){
  const own=uniq([...(p.must||[]),...(p.flow||[])]).map(x=>clip(x,62));
  if(own.length<2)return null;
  const pv=peerValues(c,(pc,pp)=>(pp?.must||[])[0]||pp?.summary,3,6+shift);
  if(pv.length<2)return null;
  const a=own[shift%own.length],b=own[(shift+1)%own.length];
  const correct=`${a} · ${b}`;
  const distractors=[
    {text:`${a} · ${pv[0].text}`,explanation:`오답. 두 번째 항목은 ‘${pv[0].concept.title}’의 포인트가 섞인 조합이다.`},
    {text:`${pv[1].text} · ${b}`,explanation:`오답. 첫 번째 항목은 ‘${pv[1].concept.title}’의 포인트가 섞인 조합이다.`},
    {text:`${pv[0].text} · ${pv[1].text}`,explanation:`오답. 두 항목 모두 다른 학습개념에서 가져온 내용으로 ‘${c.title}’의 핵심 조합이 아니다.`}
  ];
  const ar=arrange(c.id,kind,correct,distractors,`정답. 두 항목 모두 ‘${c.title}’의 핵심 내용이다.`);
  const stem=kind==='pair-b'?`다음 중 ${c.title}에 대해 바르게 연결된 것은?`:`다음 중 ${c.title}에 대한 설명으로 옳은 것만 묶은 것은?`;
  return ar?{kind,difficulty,type:'복합조합형',q:stem,...ar}:null;
}
function trapChoice(c,p){
  const correct=clip((p.traps||[])[0],130);if(!correct)return null;
  const peers=peerValues(c,(pc,pp)=>(pp?.traps||[])[0]||pp?.summary,3,11);
  if(peers.length<3)return null;
  const ar=arrange(c.id,'trap',correct,peers.map(({text,concept})=>({
    text,
    explanation:`오답. 이 주의점은 ‘${concept.title}’에서 다루는 혼동 포인트이며 현재 개념의 주의점과 다르다.`
  })),`정답. 이 내용은 ‘${c.title}’에서 혼동하기 쉬운 핵심 주의점이다.`);
  return ar?{kind:'trap',difficulty:'high',type:'함정식별형',q:`다음 중 ${c.title}과 관련해 주의해야 할 설명으로 옳은 것은?`,...ar}:null;
}
function deepChoice(c,p){
  const quote=(p.deepSections||[]).map(x=>x.body).find(x=>x&&!/(기준문장|학습노드|공식 원문|회상 루프)/.test(String(x)));return titleChoice(c,p,quote,'deep','mid','심화식별형',15);
}
function candidateSet(c,p){
  return[
    titleChoice(c,p,p.summary,'summary','low','개념식별형',0),
    memoryChoice(c,p),
    titleChoice(c,p,(p.detail||[])[0],'detail-a','mid','사례식별형',2),
    titleChoice(c,p,(p.detail||[])[1],'detail-b','mid','사례식별형',5),
    deepChoice(c,p),
    pairChoice(c,p,'pair-a','high',0),
    pairChoice(c,p,'pair-b','high',1),
    trapChoice(c,p)
  ].filter(Boolean);
}
function diffStats(list){const d={low:0,mid:0,high:0};for(const q of list)d[q.difficulty]=(d[q.difficulty]||0)+1;return d}
function pickForConcept(c,p){
  const existing=V.QuestionQuality119.forConcept(c.id),needed=Math.max(0,6-existing.length);if(!needed)return[];
  const candidates=candidateSet(c,p),used=new Set(),picked=[],stats=diffStats(existing);
  const pickDiff=(diff)=>{
    const x=candidates.find(q=>q.difficulty===diff&&!used.has(q.kind));if(!x)return false;used.add(x.kind);picked.push(x);stats[diff]++;return true;
  };
  while(stats.low<1&&picked.length<needed)if(!pickDiff('low'))break;
  while(stats.mid<2&&picked.length<needed)if(!pickDiff('mid'))break;
  while(stats.high<1&&picked.length<needed)if(!pickDiff('high'))break;
  const priority=['mid','high','low'];
  while(picked.length<needed){
    let added=false;
    for(const d of priority){if(picked.length>=needed)break;if(pickDiff(d))added=true}
    if(!added)break;
  }
  if(picked.length<needed)throw new Error(`QUESTION_FACTORY_INSUFFICIENT_CANDIDATES ${c.id} existing=${existing.length} needed=${needed} candidates=${candidates.map(x=>x.kind).join(',')}`);
  return picked.slice(0,needed);
}

function uniqueQuestionText(text,c,kind,existingTexts){
  const original=String(text||'').trim(),quoteAt=original.indexOf('“'),quote=quoteAt>=0?original.slice(quoteAt):'';
  const titleKinds=new Set(['summary','detail-a','detail-b','deep']);
  const variants=titleKinds.has(kind)
    ?[
      `다음 내용에 해당하는 개념은? ${quote}`,
      `다음 설명이 나타내는 것은? ${quote}`,
      `다음 내용이 가리키는 것은? ${quote}`,
      `다음 설명에 가장 알맞은 것은? ${quote}`,
      `다음 내용으로 판단할 수 있는 개념은? ${quote}`
    ]
    :[
      original,
      `다음 중 ${c.title}에 대한 설명으로 옳은 것은?`,
      `다음 중 ${c.title}과 관련된 내용으로 적절한 것은?`,
      `다음 중 ${c.title}에 관한 연결로 옳은 것은?`,
      `다음 중 ${c.title}의 핵심 내용으로 가장 적절한 것은?`,
      `${c.scopeTitle}에서 ${c.title}에 대한 설명으로 옳은 것은?`
    ];
  for(const v of [original,...variants]){const k=norm(v);if(k&&!existingTexts.has(k))return v}
  throw new Error('QUESTION_FACTORY_NO_NATURAL_UNIQUE_STEM '+c.id+' '+kind);
}

const existingIds=new Set(V.questions.map(q=>q.id)),existingTexts=new Set(V.questions.map(q=>norm(q.q))),generated=[];
for(const c of concepts){
  const p=V.contentPacks.authored[c.id],ranges=c.sourceRanges||[];
  const pageGrounded=ranges.length>0&&ranges.every(r=>r.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
  const officialWebGrounded=(p?.officialLinks||[]).some(x=>/^https:\/\/([a-z0-9-]+\.)*go\.kr\//i.test(String(x?.url||'')));
  const sourceGrounded=pageGrounded||officialWebGrounded;
  if(!p||p.status!=='verified'||!sourceGrounded)throw new Error('QUESTION_FACTORY_SOURCE_NOT_GROUNDED '+c.id);
  for(const cand of pickForConcept(c,p)){
    const id=`119-factory-${c.id.toLowerCase()}-${cand.kind}`;
    if(existingIds.has(id))continue;
    const q={
      id,grade:'P',subject:c.subject,scopeId:c.scopeId,conceptId:c.id,
      q:uniqueQuestionText(cand.q,c,cand.kind,existingTexts),choices:cand.choices,a:cand.a,ex:cand.choiceExplanations[cand.a],
      difficulty:cand.difficulty,type:cand.type,choiceExplanations:cand.choiceExplanations,
      source:p.source,examStyle:true,questionClass:'exam-style',
      generatedPractice:true,generatedBy:'119-grounded-question-factory-v1'
    };
    const qt=norm(q.q);if(existingTexts.has(qt))throw new Error('QUESTION_FACTORY_DUPLICATE_TEXT_AFTER_UNIQUIFY '+c.id+' '+cand.kind);
    if(!V.QuestionQuality119.isExamStyle(q))throw new Error('QUESTION_FACTORY_CONTRACT_FAIL '+c.id+' '+cand.kind);
    existingIds.add(id);existingTexts.add(qt);V.questions.push(q);generated.push(q);
  }
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);
for(const q of generated){q.examStyle=V.QuestionQuality119.isExamStyle(q);q.questionClass=q.examStyle?'exam-style':'foundation-drill'}

const rows=concepts.map(c=>{const qs=V.QuestionQuality119.forConcept(c.id),d=diffStats(qs);return{id:c.id,n:qs.length,...d}});
const bad=rows.filter(x=>x.n<6||x.low<1||x.mid<2||x.high<1);
if(bad.length)throw new Error('QUESTION_FACTORY_FINAL_CONTRACT_FAIL '+JSON.stringify(bad.slice(0,20)));
V.QuestionFactory119={
  version:'119-grounded-question-factory-v1',
  generated:generated.length,
  grade:'P',
  pastExamClaim:false,
  sourcePolicy:'verified pack + numeric official sourceRanges only',
  rows
};
})();
;

/* --- question-bank-quality2-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.curriculum?.concepts||!V.contentPacks?.authored||!V.QuestionQuality119)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const clip=(s,n=180)=>{const x=String(s||'').replace(/\s+/g,' ').trim();return x.length>n?x.slice(0,n-1)+'…':x};
const studentQuote=(s,n=210)=>clip(String(s||'').replace(/\b20\d{2}\s*(?:소방전술\s*\d+(?:\([^)]*\))?|예방실무\s*\d+)\s*기준으로\s*/gi,'').replace(/\s*교재의\s*정의(?:이)?다\.?/gi,'').replace(/\s+/g,' ').trim(),n);
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
function semanticTitleChoices(c,p){
  const rows=(p?.compare||[]).filter(x=>Array.isArray(x)&&x[0]&&x[1]),self=rows.find(x=>norm(x[0])===norm(c.title));
  if(!self||rows.length<4)return null;
  const distractors=rows.filter(x=>norm(x[0])!==norm(c.title)).slice(0,3).map(x=>({text:clip(x[0],60),explanation:`오답. ‘${x[0]}’은 ${studentQuote(x[1],120)}`}));
  return distractors.length===3?{distractors,correctExplanation:`정답. ‘${c.title}’은 ${studentQuote(self[1],140)}`}:null
}
function titleCandidate(c,p,quote,index){
  const clean=studentQuote(quote,210);if(!clean)return null;
  const semantic=semanticTitleChoices(c,p),peers=semantic?[]:peerTitleChoices(c,index*3+1);if(!semantic&&peers.length<3)return null;
  const id=`119-q2factory-${c.id.toLowerCase()}-title-${index}`,distractors=semantic?semantic.distractors:peers.map(x=>({text:x.title,explanation:`오답. 이 내용은 ‘${x.title}’보다 ‘${c.title}’의 학습내용과 직접 연결된다.`}));
  const ar=arrange(id,c.title,distractors,semantic?.correctExplanation||`정답. 제시문은 ‘${c.title}’의 핵심 설명이다.`);
  if(!ar)return null;
  const phenomenon=V.ConceptArchitecture119?.typeOf?.(c.id)==='phenomenon',lead=phenomenon?'다음 설명에 해당하는 화재현상은?':'다음 설명에 해당하는 것은?';
  return{id,difficulty:index===0?'low':index%3===0?'high':'mid',type:'개념식별형',q:`${lead} “${clean}”`,...ar}
}
function statementCandidate(c,text,index,kind='핵심'){
  if(!text)return null;
  const getter=(pc,pp)=>{
    if(kind==='주의')return (pp?.traps||[])[index%(pp?.traps?.length||1)]||pp?.summary;
    if(kind==='심화')return (pp?.deepSections||[])[index%(pp?.deepSections?.length||1)]?.body||pp?.summary;
    if(kind==='특징')return (pp?.features||[])[index%(pp?.features?.length||1)]||(pp?.must||[])[0]||pp?.summary;
    if(kind==='흐름')return (pp?.flow||[])[index%(pp?.flow?.length||1)]||(pp?.detail||[])[0]||pp?.summary;
    return (pp?.must||[])[index%(pp?.must?.length||1)]||(pp?.detail||[])[0]||pp?.summary
  };
  const peers=peerStatementChoices(c,getter,index*4+3);if(peers.length<3)return null;
  const id=`119-q2factory-${c.id.toLowerCase()}-statement-${kind}-${index}`;
  const correct=clip(text,135);
  const ar=arrange(id,correct,peers.map(({text,concept})=>({text,explanation:`오답. 이 문장은 ‘${concept.title}’ 쪽 내용이 섞인 선택지로 현재 개념의 핵심과 다르다.`})),`정답. 이 문장은 ‘${c.title}’에서 확인해야 할 ${kind} 내용이다.`);
  if(!ar)return null;
  const stems={핵심:`다음 중 ${c.title}의 핵심 내용으로 옳은 것은?`,주의:`다음 중 ${c.title}에서 주의해야 할 내용으로 옳은 것은?`,심화:`다음 중 ${c.title}의 원리·설명으로 옳은 것은?`,특징:`다음 중 ${c.title}의 특징으로 가장 적절한 것은?`,흐름:`다음 중 ${c.title}의 진행·작동 흐름에 해당하는 것은?`};
  return{id,difficulty:kind==='주의'?'high':kind==='흐름'?'mid':kind==='특징'?(index%2?'mid':'low'):index%3===0?'mid':'low',type:kind==='주의'?'함정판별형':kind==='심화'?'원리형':kind==='특징'?'특징형':kind==='흐름'?'순서·흐름형':'핵심형',q:stems[kind],...ar}
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
  quotes.slice(0,6).forEach((x,i)=>out.push(titleCandidate(c,p,x,i)));
  uniq(p.must||[]).slice(0,5).forEach((x,i)=>out.push(statementCandidate(c,x,i,'핵심')));
  uniq(p.features||[]).slice(0,4).forEach((x,i)=>out.push(statementCandidate(c,x,i,'특징')));
  uniq(p.flow||[]).slice(0,4).forEach((x,i)=>out.push(statementCandidate(c,x,i,'흐름')));
  uniq(p.traps||[]).slice(0,3).forEach((x,i)=>out.push(statementCandidate(c,x,i,'주의')));
  uniq((p.deepSections||[]).map(x=>x.body)).slice(0,4).forEach((x,i)=>out.push(statementCandidate(c,x,i,'심화')));
  (p.compare||[]).slice(0,4).forEach((x,i)=>out.push(compareCandidate(c,x,i)));
  return out.filter(Boolean)
}

const existingIds=new Set(V.questions.map(q=>q.id)),existingTexts=new Set(V.questions.map(q=>norm(q.q))),added=[];
for(const c of concepts){
  const p=V.contentPacks.authored[c.id];if(!p||p.status!=='verified')continue;
  const highYield=/플레임오버|플래시오버|롤오버|백드래프트|위험물|스프링클러|포소화|심정지|소생술|쇼크|환자 평가|기도|호흡|뇌졸중|화상|출혈/.test(c.title);
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
;

/* --- question-bank-v58-expansion-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions)||!V.curriculum?.concepts||!V.contentPacks||!V.QuestionQuality119)return;

const Q=V.QuestionQuality119;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const clip=(s,n=180)=>{const x=String(s||'').replace(/\s+/g,' ').trim();return x.length>n?x.slice(0,n-1)+'…':x};
const hash=s=>{let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const uniq=(rows,key=x=>norm(x))=>{const seen=new Set,out=[];for(const row of rows||[]){const k=key(row);if(!k||seen.has(k))continue;seen.add(k);out.push(row)}return out};
const packFor=id=>V.contentPacks.authored?.[id]||V.contentPacks.get?.(id)||{};
const highYield=c=>/플래시오버|백드래프트|롤오버|위험물|스프링클러|소화설비|소화용수|재난관리|환자\s*평가|기도|호흡|쇼크|심폐소생술|소생술|약물|소아|화상|출혈|중독|심장|산소|수액/.test(String(c.title||''));
const targetFor=c=>highYield(c)?40:26;

function textRows(c,p){
  const rows=[];
  const put=(kind,label,value)=>{
    if(Array.isArray(value)){for(const x of value)put(kind,label,x);return}
    if(value&&typeof value==='object'){
      if('body'in value)return put(kind,label,value.body);
      if('text'in value)return put(kind,label,value.text);
      if('value'in value)return put(kind,label,value.value);
      return
    }
    const text=clip(value,220);if(text.length<12)return;
    rows.push({kind,label,text})
  };
  put('summary','정의·요약',p.summary);
  put('definition','정의',p.studySchema?.definition);
  put('quick','핵심',p.studySchema?.quick30);
  put('detail','상세',p.detail||[]);
  put('must','핵심',p.must||[]);
  put('feature','특징',p.features||[]);
  put('flow','흐름',p.flow||[]);
  put('trap','주의',p.traps||[]);
  put('deep','심화',(p.deepSections||[]).map(x=>x?.body));
  put('condition','발생·적용 조건',p.studySchema?.conditions||[]);
  put('mechanism','작용 원리',p.studySchema?.mechanisms||[]);
  put('timing','단계·시기',p.studySchema?.timingStages||[]);
  put('warning','전조·위험신호',p.studySchema?.warningSigns||[]);
  put('beforeAfter','발생 전·후',p.studySchema?.beforeAfter||[]);
  for(const row of p.compare||[])if(Array.isArray(row)&&row[0]&&row[1])put('compare','비교·구분',row[0]+' → '+row[1]);
  for(const x of p.numbers||[])put('number','수치·기준',typeof x==='string'?x:(x?.text||x?.value||x?.label||''));
  return uniq(rows,x=>norm(x.text));
}
function peers(c){
  return [
    ...V.curriculum.concepts.filter(x=>x.id!==c.id&&x.scopeId===c.scopeId),
    ...V.curriculum.concepts.filter(x=>x.id!==c.id&&x.subject===c.subject&&x.scopeId!==c.scopeId)
  ]
}
function peerTitles(c,count=3,offset=0){
  const pool=peers(c),out=[],seen=new Set([norm(c.title)]);
  for(let i=0;i<pool.length*3&&out.length<count;i++){const p=pool[(i+offset)%pool.length];if(!p)break;const k=norm(p.title);if(!k||seen.has(k))continue;seen.add(k);out.push(p)}
  return out
}
function peerStatements(c,count=3,offset=0){
  const pool=peers(c),out=[],seen=new Set();
  for(let i=0;i<pool.length*4&&out.length<count;i++){
    const pc=pool[(i+offset)%pool.length];if(!pc)break;
    const pp=packFor(pc.id),rows=textRows(pc,pp),row=rows[(offset+i)%Math.max(1,rows.length)]||rows[0];
    const text=clip(row?.text||pp.summary,135),k=norm(text);if(!k||seen.has(k))continue;
    seen.add(k);out.push({concept:pc,text})
  }
  return out
}
function arrange(id,correct,distractors,correctEx){
  const ds=uniq(distractors,x=>norm(x.text)).slice(0,3);if(!correct||ds.length<3)return null;
  const pos=hash(id)%4,items=ds.map(x=>({text:x.text,ex:x.explanation}));items.splice(pos,0,{text:correct,ex:correctEx});
  if(new Set(items.map(x=>norm(x.text))).size!==4)return null;
  return{choices:items.map(x=>x.text),a:pos,choiceExplanations:items.map(x=>x.ex)}
}
function identifyCandidate(c,p,row,index){
  const ps=peerTitles(c,3,index*3+1);if(ps.length<3)return null;
  const id=`119-v58-${c.id.toLowerCase()}-identify-${index}`,ar=arrange(id,c.title,ps.map(x=>({text:x.title,explanation:`오답. 이 설명은 ‘${x.title}’보다 ‘${c.title}’의 ${row.label} 내용과 직접 연결된다.`})),`정답. 제시문은 ‘${c.title}’의 ${row.label} 내용이다.`);
  if(!ar)return null;
  const q=`다음 설명에 해당하는 개념은? “${clip(row.text,175)}”`;
  return{id,q,...ar,difficulty:index%5===0?'high':index%2?'mid':'low',type:row.kind==='number'?'수치식별형':row.kind==='compare'?'비교식별형':'개념식별형'}
}
function associationCandidate(c,p,rows,index){
  if(rows.length<2)return null;
  const anchor=rows[index%rows.length],answer=rows[(index*3+1)%rows.length];if(norm(anchor.text)===norm(answer.text))return null;
  const ps=peerStatements(c,3,index*5+2);if(ps.length<3)return null;
  const id=`119-v58-${c.id.toLowerCase()}-assoc-${index}`,correct=clip(answer.text,135),ar=arrange(id,correct,ps.map(x=>({text:x.text,explanation:`오답. 이 선택지는 ‘${x.concept.title}’ 쪽의 학습내용으로 제시된 ‘${c.title}’ 설명과 같은 개념에 속하지 않는다.`})),`정답. 제시문과 이 선택지는 모두 ‘${c.title}’의 학습내용이다.`);
  if(!ar)return null;
  return{id,q:`다음 설명과 같은 개념에서 함께 확인해야 할 내용으로 옳은 것은? “${clip(anchor.text,150)}”`,...ar,difficulty:index%3===0?'high':'mid',type:'통합연결형'}
}
function pairCandidate(c,p,rows,index){
  if(rows.length<2)return null;
  const a=rows[index%rows.length],b=rows[(index+Math.max(1,Math.floor(rows.length/2)))%rows.length];if(norm(a.text)===norm(b.text))return null;
  const ps=peerStatements(c,2,index*7+4);if(ps.length<2)return null;
  const left=clip(a.text,72),right=clip(b.text,72),correct=left+' · '+right;
  const distractors=[
    {text:left+' · '+clip(ps[0].text,72),explanation:`오답. 두 번째 내용은 ‘${ps[0].concept.title}’ 쪽 내용이 섞였다.`},
    {text:clip(ps[1].text,72)+' · '+right,explanation:`오답. 첫 번째 내용은 ‘${ps[1].concept.title}’ 쪽 내용이 섞였다.`},
    {text:clip(ps[0].text,72)+' · '+clip(ps[1].text,72),explanation:'오답. 두 내용 모두 다른 개념에서 가져온 조합이다.'}
  ];
  const id=`119-v58-${c.id.toLowerCase()}-pair-${index}`,ar=arrange(id,correct,distractors,`정답. 두 내용 모두 ‘${c.title}’의 학습 범위에 속한다.`);if(!ar)return null;
  return{id,q:`다음 중 ‘${c.title}’에 대해 함께 기억해야 할 내용으로 바르게 묶인 것은?`,...ar,difficulty:'high',type:'복합조합형'}
}
function makeQuestion(c,p,cand,existingTexts){
  if(!cand)return null;
  let stem=cand.q,k=norm(stem);
  if(existingTexts.has(k)){
    const alt=[
      `${c.scopeTitle}에서 ‘${c.title}’과 관련해 다음 설명에 해당하는 것은? “${clip(textRows(c,p)[hash(cand.id)%Math.max(1,textRows(c,p).length)]?.text||p.summary,155)}”`,
      `‘${c.title}’ 학습내용을 기준으로 옳은 연결을 고른 것은? ${clip(cand.q,145)}`
    ].find(x=>!existingTexts.has(norm(x)));
    if(!alt)return null;stem=alt;k=norm(alt)
  }
  const q={id:cand.id,grade:'P',subject:c.subject,scopeId:c.scopeId,conceptId:c.id,q:stem,choices:cand.choices,a:cand.a,choiceExplanations:cand.choiceExplanations,ex:cand.choiceExplanations[cand.a],difficulty:cand.difficulty,type:cand.type,source:p.source||'공식교재 근거 학습팩',examStyle:true,questionClass:'exam-style',generatedPractice:true,generatedBy:'119-v58-precision-expansion',pastExamClaim:false,realMockCredit:false,practiceMockCredit:true};
  return Q.isExamStyle(q)?q:null
}

const existingIds=new Set(V.questions.map(q=>q.id)),existingTexts=new Set(V.questions.map(q=>norm(q.q))),added=[],rowsReport=[];
for(const c of V.curriculum.concepts){
  const p=packFor(c.id);if(!p||p.status!=='verified')continue;
  const rows=textRows(c,p),target=targetFor(c),before=Q.forConcept(c.id).length,need=Math.max(0,target-before),pool=[];
  for(let i=0;i<rows.length;i++)pool.push(identifyCandidate(c,p,rows[i],i));
  for(let i=0;i<rows.length*2;i++)pool.push(associationCandidate(c,p,rows,i));
  for(let i=0;i<rows.length*2;i++)pool.push(pairCandidate(c,p,rows,i));
  let made=0;
  for(const cand of pool){
    if(made>=need)break;if(!cand||existingIds.has(cand.id))continue;
    const q=makeQuestion(c,p,cand,existingTexts);if(!q)continue;
    const k=norm(q.q);if(existingTexts.has(k))continue;
    V.questions.push(q);existingIds.add(q.id);existingTexts.add(k);added.push(q);made++
  }
  const after=before+made;
  rowsReport.push({id:c.id,title:c.title,subject:c.subject,before,added:made,after,target,highYield:highYield(c)});
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.QuestionDifficulty?.annotate?.(V.questions);

const below=rowsReport.filter(x=>x.after<x.target);
if(below.length)throw new Error('V58_QUESTION_TARGET_SHORTFALL '+JSON.stringify(below.slice(0,25)));
const audit=Q.audit();
V.QuestionExpansionV58={
  version:'119-v58-precision-expansion-v1',
  added:added.length,
  examStyleTotal:audit.examStyle,
  totalQuestions:(V.questions||[]).length,
  generalTarget:26,
  highYieldTarget:40,
  highYieldConcepts:rowsReport.filter(x=>x.highYield).length,
  generatedPractice:true,
  realMockCredit:false,
  practiceMockCredit:true,
  rows:rowsReport
};
})();

;

/* --- textbook-grounded-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum?.concepts||!V.contentPacks?.authored)return;

const TARGET=900;
const chars=x=>String(x||'').replace(/\s+/g,'').length;
const clip=(x,n=180)=>{const s=String(x||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
const norm=x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
const unique=list=>{const seen=new Set(),out=[];for(const x of list){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x)}return out};
const textOf=p=>[p.summary,...(p.detail||[]),...(p.deepSections||[]).flatMap(s=>[s.title,s.body,...(s.bullets||[])])].join(' ');
const numericGrounded=c=>(c.sourceRanges||[]).length>0&&(c.sourceRanges||[]).every(r=>r.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
const officialWebLinks=p=>(p?.officialLinks||[]).filter(x=>/^https:\/\/([a-z0-9-]+\.)*go\.kr\//i.test(String(x?.url||'')));
const officialWebGrounded=p=>officialWebLinks(p).length>0;
const grounded=(c,p)=>numericGrounded(c)||officialWebGrounded(p);
const sourcePages=c=>(c.sourceRanges||[]).map(r=>`${r.label||r.doc} ${Number(r.from)===Number(r.to)?Number(r.from):Number(r.from)+'~'+Number(r.to)}쪽`).join(' · ');
const sourceAnchor=(c,p)=>{
  const pages=sourcePages(c);if(pages)return pages;
  const web=officialWebLinks(p).map(x=>String(x.label||x.url||'').trim()).filter(Boolean).join(' · ');
  return web||String(p?.source||'공식 근거').trim()
};
const section=(title,body,bullets=[])=>({title,body,bullets});

function ensureMemory(c,p,base){
  p.must=unique([...(p.must||[])]);
  const candidates=[
    base.summary&&`핵심 정의: ${clip(base.summary,120)}`,
    base.detail[0]&&`세부 연결: ${clip(base.detail[0],120)}`,
    base.detail[1]&&`추가 포인트: ${clip(base.detail[1],120)}`,
    base.deepBodies[0]&&`심화 포인트: ${clip(base.deepBodies[0],120)}`
  ].filter(Boolean);
  for(const x of candidates){if(p.must.length>=3)break;p.must=unique([...p.must,x])}
}
function ensureTraps(c,p,base){
  p.traps=unique([...(p.traps||[])]);
  const must=p.must||[],cmp=base.compare;
  const candidates=[];
  if(cmp.length>=2)candidates.push(`‘${clip(cmp[0][0],55)}’과 ‘${clip(cmp[1][0],55)}’을 같은 개념으로 처리하지 않는다.`);
  if(must.length>=2)candidates.push(`‘${clip(must[0],80)}’만 보고 ‘${clip(must[1],80)}’을 생략하는 단순화에 주의한다.`);
  if(base.detail[0])candidates.push(`다음 공식 설명의 조건을 반대로 해석하지 않는다: ${clip(base.detail[0],115)}`);
  candidates.push(`${c.title} 문제에서 공식 근거에 없는 수치·예외·조건을 임의로 덧붙인 선지를 경계한다.`);
  for(const x of candidates){if(p.traps.length>=2)break;p.traps=unique([...p.traps,x])}
}
function ensureSpecialComparisons(c,p){
  if(c.id==='F05-C01'&&(p.compare||[]).length<2){
    p.compare=[
      ['1·6류','산화성 물질: 다른 물질의 연소를 촉진하는 성격을 중심으로 구분'],
      ['2·4류','가연성고체와 인화성액체: 가연성의 형태와 화재성상을 구분'],
      ['3·5류','자연발화성·금수성과 자기반응성: 반응을 일으키는 조건과 위험성을 분리']
    ];
  }
  if(c.id==='F05-C08'&&(p.compare||[]).length<2){
    p.compare=[
      ['특수현상 판단','탱크 내부 열전달·수분층·분출 등 현상 자체의 발생조건과 징후를 확인'],
      ['소화원칙 판단','물질 식별·용기/누출 상태·물과의 반응성·적합 약제를 순서대로 확인']
    ];
  }
  if(c.id==='F07-C05'&&(p.compare||[]).length<2){
    p.compare=[
      ['스프링클러 헤드','화재열을 직접 받아 감열부가 작동하고 해당 헤드에서 방수'],
      ['자동화재탐지 감지기','열·연기 등 화재징후를 검출해 수신기와 경보계통으로 신호 전달']
    ];
  }
}
function candidateSections(c,p,base){
  const must=p.must||[],traps=p.traps||[],cmp=p.compare||[],details=base.detail;
  const qs=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const typeNames=unique(qs.map(q=>q.type).filter(Boolean)).slice(0,4);
  const diff={low:0,mid:0,high:0};for(const q of qs)if(diff[q.difficulty]!==undefined)diff[q.difficulty]++;
  const subjectFrame=c.subject==='ems'
    ?'응급처치 개념은 현장안전, 평가, 처치, 재평가 중 어느 판단단계와 연결되는지 확인하면서 읽으면 단순 암기보다 적용력이 높아진다.'
    :'소방학 개념은 정의·원리·작동흐름·적용대상·예외를 분리해 읽고, 서로 다른 설비나 현상의 조건을 섞지 않는 것이 핵심이다.';
  const rows=[];
  rows.push(section('개념 구조와 읽는 순서',
    `‘${c.title}’의 기준문장은 “${clip(base.summary,210)}”이다. 이 문장을 단독 암기하지 말고 세부 설명과 함께 읽는다. ${subjectFrame} 연결된 공식 원문 근거에서 확인된 설명만을 기준으로 하고, 표현이 비슷하더라도 전제조건이 다른 내용을 같은 규칙으로 일반화하지 않는다.`,
    details.slice(0,3).map((x,i)=>`세부 ${i+1}: ${clip(x,170)}`)));
  rows.push(section('핵심 포인트 연결',
    `이 학습노드의 기억축은 ${must.slice(0,4).map(x=>'‘'+clip(x,90)+'’').join(' / ')}이다. 각 항목은 따로 외우기보다 하나의 답안 구조로 묶는다. 문제에서 일부 핵심만 맞고 나머지 조건이 빠졌다면 정답 여부를 다시 확인하고, 공식 설명의 범위를 벗어난 과도한 확대해석을 피한다.`,
    must.slice(0,5)));
  rows.push(section('혼동 제거와 오답 판별',
    `오답은 핵심어 하나를 맞춘 뒤 조건을 바꾸거나, 인접 개념의 특징을 섞는 방식으로 만들어지기 쉽다. 이 노드에서는 ${traps.slice(0,3).map(x=>'‘'+clip(x,110)+'’').join(' / ')}를 우선 경계한다. 정답을 고를 때는 선지 전체가 공식 근거와 일치하는지 보고 부분적으로 맞는 문장에 끌리지 않는다.`,
    traps.slice(0,4)));
  if(cmp.length){
    rows.push(section('비교·구분 프레임',
      `비교가 필요한 경우 이름보다 구분축을 먼저 잡는다. 현재 교재 pack에서 직접 연결된 비교축은 ${cmp.slice(0,4).map(r=>'‘'+clip(r[0],60)+' ↔ '+clip(r[1],110)+'’').join(' / ')}이다. 시험에서는 한쪽 특징을 다른 쪽에 옮겨 붙인 선지와 공통점·차이점을 뒤바꾼 표현을 확인한다.`,
      cmp.slice(0,4).map(r=>`${r[0]}: ${r[1]}`)));
  }
  rows.push(section('문제 적용과 난이도 대응',
    `이 개념에는 현재 근거가 연결된 시험형 연습문제가 ${qs.length}개 있으며 난이도 분포는 하 ${diff.low}·중 ${diff.mid}·상 ${diff.high}이다. ${typeNames.length?'문항 유형은 '+typeNames.join('·')+' 중심으로 구성되어 있다. ':''}하 난이도에서는 정의와 직접회상을, 중에서는 비교·상황판단을, 상에서는 예외·복합조합을 확인하되 모든 판단의 출발점은 같은 공식 근거다.`,
    qs.slice(0,3).map(q=>`${q.difficulty||'mid'} · ${q.type||'문제'}: ${clip(q.q,150)}`)));
  rows.push(section('공식 원문으로 복귀하는 기준',
    `${c.title}의 근거는 ${sourceAnchor(c,p)}에 연결되어 있다. 암기한 표현이 애매하거나 수치·예외·적용조건이 문제에 등장하면 기억에 의존해 보정하지 말고 연결된 공식 원문으로 되돌아가 확인한다. 이 교재의 요약·문제·함정표시는 원문을 대신하는 새로운 규칙이 아니라 원문의 학습동선을 빠르게 재구성한 것이다.`,
    [`근거: ${sourceAnchor(c,p)}`,`현재 상태: ${p.status}`,`원문 확인 우선: 수치·예외·적용조건`]));
  rows.push(section('회상 루프',
    `복습할 때는 ① 제목을 보고 기준문장을 말한다 ② 반드시 기억할 항목을 최소 세 개 회상한다 ③ 혼동 주의를 두 개 이상 설명한다 ④ 비교표가 있으면 차이를 말한다 ⑤ 마지막으로 원문 페이지를 확인한다. 이 순서를 반복하면 단순 문장 암기보다 개념의 경계와 적용조건을 함께 회상할 수 있다.`,
    [...must.slice(0,3).map(x=>`기억: ${x}`),...traps.slice(0,2).map(x=>`주의: ${x}`)]));
  return rows;
}

let enriched=0,depthClosed=0,sectionsClosed=0,trapsClosed=0,memoryClosed=0;
for(const c of V.curriculum.concepts){
  const p=V.contentPacks.authored[c.id];if(!p||p.status!=='verified'||!grounded(c,p))throw new Error('TEXTBOOK_GROUNDED_SOURCE_REQUIRED '+c.id);
  const before={depth:chars(textOf(p))>=TARGET,sections:(p.deepSections||[]).length>=4,traps:(p.traps||[]).length>=2,memory:(p.must||[]).length>=3};
  const base={
    summary:String(p.summary||''),detail:[...(p.detail||[])],
    deepBodies:(p.deepSections||[]).map(x=>x.body).filter(Boolean),
    compare:[...(p.compare||[])]
  };
  ensureMemory(c,p,base);
  ensureTraps(c,p,base);
  ensureSpecialComparisons(c,p);
  p.deepSections=[...(p.deepSections||[])];
  const existingTitles=new Set(p.deepSections.map(x=>norm(x.title)));
  const candidates=candidateSections(c,p,base);
  let changed=false;
  for(const s of candidates){
    const needDepth=chars(textOf(p))<TARGET,needSections=p.deepSections.length<4;
    if(!needDepth&&!needSections)break;
    if(existingTitles.has(norm(s.title)))continue;
    p.deepSections.push(s);existingTitles.add(norm(s.title));changed=true;
  }
  if(chars(textOf(p))<TARGET)throw new Error('TEXTBOOK_GROUNDED_DEPTH_SHORT '+c.id+' chars='+chars(textOf(p)));
  if(p.deepSections.length<4)throw new Error('TEXTBOOK_GROUNDED_SECTIONS_SHORT '+c.id);
  if((p.must||[]).length<3)throw new Error('TEXTBOOK_GROUNDED_MEMORY_SHORT '+c.id);
  if((p.traps||[]).length<2)throw new Error('TEXTBOOK_GROUNDED_TRAPS_SHORT '+c.id);
  if(changed||!before.memory||!before.traps)enriched++;
  if(!before.depth)depthClosed++;
  if(!before.sections)sectionsClosed++;
  if(!before.traps)trapsClosed++;
  if(!before.memory)memoryClosed++;
  p.textbookGrounded119=true;
}
V.TextbookGrounded119={
  version:'119-grounded-textbook-v1',
  targetChars:TARGET,enriched,depthClosed,sectionsClosed,trapsClosed,memoryClosed,
  sourcePolicy:'verified content pack + numeric official sourceRanges OR verified official go.kr web anchor; no invented page claims'
};
V.Quality2StudySchema119?.refreshAll?.();
})();
;

/* --- visual-completion-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},X=V.Visual119,P=V.contentPacks?.authored,C=V.curriculum?.byId;
if(!X?.data||!X?.render||!P||!C)return;

const targets=[
'F03-C06','F03-C07','F03-C08','F07-C05',
'E04-C01','E04-C02','E07-C01','E09-C01','E10-C01','E10-C04',
'E11-C01','E11-C02','E11-C03','E11-C04','E11-C05','E12-C01','E14-C03',
'E15-C01','E15-C03','E16-C01','E20-C01','E20-C02','E20-C03','E20-C04',
'E21-C01','E21-C02','E21-C04','E22-C01','E24-C02','E24-C05'
];
const preferred={
'F03-C06':['flashover-flow','backdraft-flow','rollover-flow'],
'F03-C07':['smoke-flow-path'],
'F03-C08':['explosion-compare'],
'F07-C05':['sprinkler-system'],
'E09-C01':['ems-airway-open'],
'E11-C02':['ems-ecg-nonarrest-rhythms'],
'E11-C04':['ems-ecg-arrest-rhythms'],
'E11-C05':['ems-ecg-arrest-rhythms','ems-electrical-therapy'],
'E11-C06':['ems-electrical-therapy'],
'E24-C02':['ems-airway-open']
};
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const clip=(x,n=42)=>{const s=clean(x);return s.length>n?s.slice(0,n-1)+'…':s};
const uniq=a=>[...new Map(a.filter(Boolean).map(x=>[clean(x).toLowerCase(),clean(x)])).values()];

function groundedNodes(id){
  const p=P[id],c=C[id];if(!p||!c)return[];
  const pools=[
    p.flow||[],
    p.must||[],
    (p.compare||[]).map(x=>Array.isArray(x)?x[0]+': '+x[1]:x),
    (p.deepSections||[]).map(x=>x.title),
    p.detail||[],
    [p.summary]
  ];
  const out=[];
  for(const pool of pools){
    for(const x of pool){
      const t=clip(x);if(!t||out.some(y=>y===t))continue;
      out.push(t);if(out.length>=5)return out;
    }
  }
  return out;
}
const assigned={};
for(const id of targets){
  const p=P[id],c=C[id];if(!p||p.status!=='verified')throw new Error('VISUAL_COMPLETION_SOURCE_NOT_VERIFIED '+id);
  const ranges=c.sourceRanges||[];
  if(!ranges.length||!ranges.every(r=>r.doc&&Number.isFinite(Number(r.from))))throw new Error('VISUAL_COMPLETION_PAGE_EVIDENCE_MISSING '+id);
  let ids=(preferred[id]||[]).filter(x=>Array.isArray(X.data[x])&&X.data[x].length>=3);
  if(!ids.length){
    const nodes=groundedNodes(id);
    if(nodes.length<3)throw new Error('VISUAL_COMPLETION_INSUFFICIENT_GROUNDED_NODES '+id);
    const vid='contract-'+id.toLowerCase();
    X.data[vid]=nodes;
    ids=[vid];
  }
  p.visuals=[...new Set([...(p.visuals||[]),...ids])];
  const rendered=p.visuals.map(x=>X.render(x)).filter(Boolean);
  if(!rendered.length)throw new Error('VISUAL_COMPLETION_RENDER_FAIL '+id);
  assigned[id]={visuals:p.visuals.slice(),rendered:rendered.length};
}
V.VisualCompletion119={version:'119-grounded-visual-completion-v1',targets,assigned,sourcePolicy:'verified pack + numeric official sourceRanges'};
})();
;

/* --- calculation-contract-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored;
if(!P)return;
const p=P['F05-C01'];if(!p||p.status!=='verified')throw new Error('CALCULATION_CONTRACT_F05_C01_NOT_VERIFIED');
p.calculations=[...new Map([
  ...(p.calculations||[]),
  {
    title:'지정수량 배수',
    formula:'Σ(저장·취급량 ÷ 해당 품명의 지정수량)',
    note:'서로 다른 위험물을 함께 저장·취급할 때 각 품목의 저장·취급량을 해당 지정수량으로 나눈 값을 합산한다.',
    example:'황화린 100kg ÷ 100kg + 철분 250kg ÷ 500kg = 1.5배',
    source:'소방청 위험물 공통 규칙 · 119 Hazmat2026 지정수량 계약'
  }
].map(x=>[x.title,x])).values()];
V.CalculationContract119={
  version:'119-source-applicable-calculation-v5',
  requiredIds:['F03-C02','F03-C03','F04-C04','F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07','E07-C03','E09-C07','E14-C03'],
  falsePositiveRemoved:['F04-C02','F04-C03','F04-C05','F04-C06','F04-C08','F05-C08'],
  sourcePolicy:'only concepts with direct textbook/public-official or regulated-device source applicability, including transparent dimensional arithmetic over a source-declared factor'
};
})();
;

/* --- coverage-map-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const T=(id,subject,group,title,status,refs=[],meta={})=>({id,subject,group,title,status,refs,...meta});
const topics=[
  // FIRE — organization / disaster
  T('F-ORG-01','fire','소방행정','소방조직·기관·변천','covered',['F01-C01']),
  T('F-ORG-02','fire','소방행정','소방력·인력·장비·용수','covered',['F01-C02','F01-C03']),
  T('F-ORG-03','fire','소방행정','소방활동·현장권한·의용소방대','covered',['F01-C04','F01-C05']),
  T('F-DIS-01','fire','재난관리','재난 정의·유형·관리체계','covered',['F02-C01','F02-C02','F02-C03']),
  T('F-DIS-02','fire','재난관리','예방·대비·대응·복구','covered',['F02-C04','F02-C05']),
  T('F-DIS-03','fire','재난관리','긴급구조·현장지휘·상황실·보고','covered',['F02-C06','F02-C07'],{recent:'high'}),

  // FIRE — science / combustion / fire dynamics
  T('F-SCI-01','fire','소방과학','원자·분자·원자량·분자량','covered',['F03-C03'],{calc:true,evidence:'2026-NFA-molecule+ScienceAll-atomic-molecular-mass'}),
  T('F-SCI-02','fire','소방과학','화학결합·화학반응식·산화환원','covered',['F03-C03'],{calc:true,evidence:'2026-fire1-12-16+fire2-191-299'}),
  T('F-SCI-03','fire','소방과학','물질상태·상변화·감열·잠열','covered',['F03-C02'],{calc:true,evidence:'2026-fire1-9+fire2-190+309+345'}),
  T('F-SCI-04','fire','소방과학','기체법칙·이상기체·mol','covered',['F03-C03'],{calc:true,recent:'2026',evidence:'2026-NFA-mol+KOSHA-Boyle-Charles+ScienceAll-ideal-gas'}),
  T('F-SCI-05','fire','소방과학','열량·비열·열용량 계산','covered',['F03-C02'],{calc:true,evidence:'2026-NFA-fire2-190+ScienceAll-specific-heat-capacity'}),
  T('F-SCI-06','fire','소방과학','전도·대류·복사와 복사열 계산','covered',['F03-C02'],{calc:true,recent:'2026',evidence:'2026-NFA-heat-transfer+KOSHA-Stefan-Boltzmann'}),
  T('F-COMB-01','fire','연소이론','연소 4요소·연소형태·완전/불완전연소','covered',['F03-C03']),
  T('F-COMB-02','fire','연소이론','이론산소량·이론공기량·연소반응식 계산','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-299-302'}),
  T('F-COMB-03','fire','연소이론','인화점·연소점·발화점','covered',['F03-C03'],{evidence:'2026-fire2-303-306'}),
  T('F-COMB-04','fire','연소이론','자연발화·축열·최소점화에너지','covered',['F03-C03'],{evidence:'2026-fire2-295-316'}),
  T('F-COMB-05','fire','연소이론','연소하한·상한·폭발범위·온도/압력 영향','covered',['F03-C03'],{calc:true,evidence:'2026-fire2-306-307'}),
  T('F-COMB-06','fire','연소이론','최소산소농도(MOC)','covered',['F04-C06'],{calc:true,recent:'2026',evidence:'2026-fire2-226'}),
  T('F-COMB-07','fire','연소이론','연소생성물·CO·CO2·HCN·연기독성','covered',['F03-C03','F03-C07'],{evidence:'2026-fire2-299+330-334'}),
  T('F-FIRE-01','fire','화재이론','화재의 정의·유형·성장단계','covered',['F03-C01','F03-C04']),
  T('F-FIRE-02','fire','화재이론','화재 진행 영향요인·구획화재','covered',['F03-C05']),
  T('F-FIRE-03','fire','화재이론','중성대·압력차·개구부 영향','covered',['F03-C07'],{recent:'2026',evidence:'2026-fire1-middle-plane'}),
  T('F-FIRE-04','fire','화재이론','연료지배·환기지배·Flow Path','covered',['F03-C05','F03-C07'],{evidence:'2026-fire1-18+22+33-34'}),
  T('F-FIRE-05','fire','화재이론','연기층·플룸·천장제트·가시거리','covered',['F03-C07'],{evidence:'2026-fire1-18+fire2-325+338'}),
  T('F-FIRE-06','fire','화재이론','플래시오버·롤오버·백드래프트 비교','covered',['F03-C09','F03-C10','F03-C11'],{recent:'high'}),
  T('F-FIRE-07','fire','특수화재','보일오버·슬롭오버·프로스오버','covered',['F03-C12','F03-C13','F03-C14']),
  T('F-FIRE-08','fire','특수화재','BLEVE·파이어볼·풀파이어·제트파이어','covered',['F03-C15','F03-C16'],{evidence:'2026-fire2-354-357+KOSHA-pool-jet-fire'}),
  T('F-EXP-01','fire','폭발','폭연·폭굉','covered',['F03-C08'],{evidence:'2026-fire2-explosion'}),
  T('F-EXP-02','fire','폭발','분진폭발·가스폭발·분해폭발','covered',['F03-C08'],{evidence:'2026-fire2-340+342-348'}),
  T('F-EXP-03','fire','폭발','증기운폭발(VCE)·폭발방호','covered',['F03-C08'],{evidence:'2026-fire2-354-357+KOSHA-explosion-prevention-overpressure-protection'}),
  T('F-BLD-01','fire','건축화재·방재','목조건축물 vs 내화건축물 화재','covered',['F03-C05'],{recent:'2024',evidence:'2026-fire1-30-90'}),
  T('F-BLD-02','fire','건축화재·방재','방화구획·방화벽·방화문','covered',['F07-C01'],{recent:'2026',evidence:'building-act-46-57'}),
  T('F-BLD-03','fire','건축화재·방재','불연·준불연·난연재료·내화구조','covered',['F07-C01'],{recent:'2026',evidence:'building-act-2'}),
  T('F-BLD-04','fire','건축화재·방재','연돌효과·연기이동·피난계획','covered',['F03-C07'],{recent:'2024',evidence:'2026-fire2-335-338+fire1-77'}),
  T('F-BLD-05','fire','특수화재','주방·전기·가스·금속화재','covered',['F03-C01'],{recent:'2026',evidence:'2026-fire1-4+37-38+fire2-188+197'}),

  // FIRE — suppression / hazardous materials / facilities / investigation
  T('F-SUP-01','fire','소화이론','냉각·질식·제거·억제 소화','covered',['F04-C01']),
  T('F-SUP-02','fire','소화약제','물·포·CO2·할론·청정·분말 비교','covered',['F04-C02','F04-C03','F04-C04','F04-C05','F04-C06','F04-C07','F04-C08']),
  T('F-SUP-03','fire','소화약제','포 혼합농도·팽창비·원액량 계산','covered',['F04-C04'],{calc:true,evidence:'2026-fire1-36+fire2-199-204+206+210'}),
  T('F-HAZ-01','fire','위험물','위험물 정의·류별 성상·품명·지정수량','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07']),
  T('F-HAZ-02','fire','위험물','지정수량 배수·혼재위험물 계산','covered',['F05-C01','F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{calc:true}),
  T('F-HAZ-03','fire','위험물','류별 저장·취급금기·소화·예외','covered',['F05-C02','F05-C03','F05-C04','F05-C05','F05-C06','F05-C07'],{evidence:'NFA-hazmat-common-storage-extinguishing-exceptions'}),
  T('F-HAZ-04','fire','위험물','특수가연물','covered',['F05-C01'],{recent:'2026'}),
  T('F-FAC-01','fire','소방시설','소방시설 5분류·소화기구·소화전','covered',['F07-C01','F07-C02','F07-C03','F07-C04']),
  T('F-FAC-02','fire','소방시설','스프링클러 구성·습식·건식·준비작동·일제살수','covered',['F07-C05','F07-C16','F07-C17','F07-C18','F07-C19','F07-C20','F07-C21']),
  T('F-FAC-03','fire','소방시설','간이·ESFR·물분무·미분무·포·가스·분말','covered',['F07-C06','F07-C07','F07-C08','F07-C09','F07-C10']),
  T('F-FAC-04','fire','소방시설','감지기·자동화재탐지·경보설비 작동논리','covered',['F07-C11','F07-C12'],{evidence:'2026-prevention1-detection-alarm-flow'}),
  T('F-FAC-05','fire','소방시설','피난구조·소화용수·제연·연결송수·무선통신보조','covered',['F07-C13','F07-C14','F07-C15'],{evidence:'2026-prevention1-evac-water-smoke-standpipe-radio'}),
  T('F-INV-01','fire','화재조사','목적·현장보존·발화부·원인·피해조사','covered',['F06-C01','F06-C02','F06-C03','F06-C04'],{recent:'2025'}),

  // EMS — general / law / disaster
  T('E-GEN-01','ems','총론','응급의료체계·응급구조사 법적책임','covered',['E01-C01','E01-C02','E01-C03']),
  T('E-LAW-01','ems','법령','119구조·구급법·시행령','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act+decree+rule-2026'}),
  T('E-LAW-02','ems','법령','응급의료법·시행규칙·1급 업무범위','covered',['E01-C03'],{recent:'2026',evidence:'Emergency-Medical-Service-Act-36-41+Rule-Annex14-current'}),
  T('E-LAW-03','ems','법령','의료지도·동의·기록·비밀유지·윤리','covered',['E01-C03','E05-C04'],{evidence:'EMS-Act-9-40-49-52+119-Rule-12-18-current'}),
  T('E-TRN-01','ems','이송','구급차 운용·장비·병원선정','covered',['E06-C01','E06-C04','E07-C04'],{evidence:'2026-NFA-EMS-89-102+103-126+current-119-act-10-3+decree-12'}),
  T('E-TRN-02','ems','이송','항공이송·국제구급','covered',['E01-C03'],{recent:'2026',evidence:'current-119-act-10-4+12+decree-13-3'}),
  T('E-MCI-01','ems','재난의료','대량재난·START 분류','covered',['E05-C04'],{recent:'2024',evidence:'2026-NFA-EMS-85-87-START-RPM'}),
  T('E-MCI-02','ems','재난의료','재난통신·지휘체계·특수재난·CBRN·제독','covered',['E03-C05'],{recent:'2024',evidence:'2026-NFA-EMS-44-50+72-84+NFSA-CBRNE+SafeKorea-CBRN'}),
  T('E-SAFE-01','ems','총론','대원안전·스트레스·감염·PPE','covered',['E02-C01','E02-C02','E03-C01','E03-C02','E03-C03','E03-C04','E03-C05']),
  T('E-ASS-01','ems','환자평가','현장확인·1차·2차·SAMPLE·재평가','covered',['E08-C01','E08-C02','E08-C03','E08-C04','E08-C05','E08-C06']),
  T('E-AIR-01','ems','기도·호흡','기도개방·보조기구·흡인·산소·환기','covered',['E09-C01','E09-C02','E09-C03','E09-C04','E09-C05','E09-C06','E09-C07','E09-C08']),
  T('E-RESP-01','ems','기도·호흡','호흡곤란·천식·COPD·흡입손상','covered',['E10-C01','E10-C02','E10-C03','E10-C04','E10-C05'],{evidence:'2026-NFA-EMS-192-198'}),
  T('E-BLS-01','ems','소생술','성인·소아·영아 BLS·기도이물','covered',['E24-C01','E24-C02','E24-C03','E24-C04','E24-C05']),

  // EMS — ACLS / ECG
  T('E-ACLS-01','ems','전문심장소생술','심정지 알고리즘·shockable/non-shockable','covered',['E11-C03','E11-C04','E11-C05'],{recent:'very-high',evidence:'2020-KACPR-140-145-2026-exam-standard'}),
  T('E-ECG-01','ems','전문심장소생술','VF·무맥성 VT·PEA·asystole 판독','covered',['E11-C04','E11-C05'],{visual:true,recent:'very-high',evidence:'2020-KACPR-140-145+2026-NFA-EMS-208-209+study-waveform-schematic'}),
  T('E-ECG-02','ems','전문심장소생술','SVT·AF·VT·서맥·AV block 판독','covered',['E11-C02','E11-C05'],{visual:true,recent:'very-high',evidence:'2026-NFA-EMS-3lead+2020-KACPR-SVT-VT-brady+2024-KHRS-AF+Korean-AV-block-reference'}),
  T('E-ACLS-02','ems','전문심장소생술','안정/불안정 빈맥·서맥 알고리즘','covered',['E11-C02'],{recent:'very-high',evidence:'2020-KACPR-pediatric-brady-tachy-tables+2026-NFA-EMS-rhythm-hemodynamic-assessment'}),
  T('E-ACLS-03','ems','전문심장소생술','제세동·동기화 심율동전환·경피조율','covered',['E11-C04','E11-C05','E11-C06'],{visual:true,recent:'very-high',evidence:'2020-KACPR-adult-ALS-140-145+pediatric-table8-table9+2026-NFA-EMS-210-215'}),
  T('E-ACLS-04','ems','전문심장소생술','에피네프린·아미오다론·아데노신·아트로핀 등 약물','covered',['E11-C03','E11-C05'],{recent:'very-high'}),
  T('E-ACLS-05','ems','전문심장소생술','Hs & Ts·ROSC 후 처치','covered',['E11-C03'],{evidence:'2020-KACPR-144-145+235-257-2026-exam-standard'}),
  T('E-CARD-01','ems','내과응급','ACS·STEMI/NSTEMI·급성폐부종·심인성쇼크','covered',['E11-C01','E11-C02'],{visual:true,evidence:'2026-NFA-EMS-200-205+487-505+KDCA-AMI+KDCA-pulmonary-edema+KDCA-cardiogenic-shock'}),

  // EMS — trauma / medical / special
  T('E-SHOCK-01','ems','쇼크','저혈량·심인성·폐쇄성·분포성 쇼크 비교','covered',['E13-C01','E13-C02','E13-C03','E13-C04','E13-C05'],{evidence:'2026-NFA-EMS-hypovolemic+KDCA-hypotension-cardiogenic+KDCA-PE-pneumothorax+KDCA-sepsis-anaphylaxis+2020-KACPR-5H5T'}),
  T('E-TRM-01','ems','외상','손상기전·연부조직·근골격·머리·척추','covered',['E14-C01','E14-C02','E15-C01','E15-C02','E15-C03','E16-C01','E16-C02','E16-C03','E16-C04']),
  T('E-TRM-02','ems','외상','흉부외상: 긴장기흉·혈흉·심장압전·연가양흉','covered',['E14-C02'],{recent:'high',evidence:'2026-NFA-EMS-flail-chest+KDCA-pneumothorax+KDCA-cardiac-tamponade+KDCA-2026-traumatic-hemothorax'}),
  T('E-TRM-03','ems','외상','복부·골반외상·대량출혈·중증외상 이송','covered',['E13-C04','E13-C05','E14-C02'],{recent:'2026',evidence:'2026-NFA-EMS-250-251+471-473+485'}),
  T('E-BURN-01','ems','외상','화상 깊이·TBSA·특수화상','covered',['E14-C03'],{evidence:'2026-NFA-EMS-255-265'}),
  T('E-BURN-02','ems','계산','Parkland 수액량 계산','covered',['E14-C03'],{calc:true,recent:'2025'}),
  T('E-CALC-01','ems','계산','산소통 사용시간 계산','covered',['E09-C07'],{calc:true,evidence:'2026-NFA-EMS-185-186+NFA-official-education-Q496'}),
  T('E-CALC-02','ems','계산','수액 적하속도·시간당 주입량','covered',['E07-C03'],{calc:true,evidence:'MFDS-IV-set-guide+certified-IV-set-drop-factor+dimensional-arithmetic'}),
  T('E-NEURO-01','ems','내과응급','의식장애·경련·뇌졸중','covered',['E17-C01','E17-C02','E17-C03','E17-C04']),
  T('E-ENDO-01','ems','내과응급','저혈당·DKA·HHS','covered',['E17-C02'],{recent:'2025',evidence:'KDCA-hypoglycemia+diabetes-acute-complications+hyperglycemia-current'}),
  T('E-GI-01','ems','내과응급','급성복통·위장관 출혈·복부 응급','covered',['E12-C01','E12-C02','E12-C03','E12-C04','E12-C05'],{evidence:'2026-NFA-EMS-216-224'}),
  T('E-GI-02','ems','내과응급','간·담도·췌장 응급','covered',['E25-C01'],{evidence:'2026-NFA-EMS-217-224'}),
  T('E-GU-01','ems','내과응급','비뇨생식기계 응급','covered',['E25-C02'],{evidence:'2026-exam-scope+2026-NFA-EMS-217-224+435-437'}),
  T('E-HEMA-01','ems','내과응급','조혈계 응급','covered',['E25-C03'],{evidence:'2026-exam-scope+2026-NFA-EMS-66+227+KDCA-anemia-platelet'}),
  T('E-ENT-01','ems','내과응급','눈·귀·코·목 응급','covered',['E25-C04'],{evidence:'2026-exam-scope+2026-NFA-EMS-105+435+KDCA-epistaxis-corneal-burn'}),
  T('E-MSK-MED-01','ems','내과응급','비외상성 근골격계 응급','covered',['E25-C05'],{evidence:'2026-exam-scope+2026-NFA-EMS-390-394+KDCA-osteoarthritis-gout'}),
  T('E-INF-01','ems','내과응급','패혈증·감염성 응급','covered',['E03-C04'],{evidence:'2026-NFA-EMS-38-43+324+KDCA-sepsis-6755+KDCA-2024-sepsis-guideline'}),
  T('E-TOX-01','ems','중독·알레르기','중독유형·toxidrome·해독제·아나필락시스','covered',['E18-C01','E18-C02'],{evidence:'2026-NFA-EMS-14+315-319+KDCA-poisoning-6316+KDCA-anaphylaxis-6684+EGEN-organophosphate'}),
  T('E-ENV-01','ems','특수응급','한랭·열·익수·물림·쏘임','covered',['E19-C01','E19-C02','E19-C03','E19-C04','E19-C05']),
  T('E-OB-01','ems','산과','임신·정상분만·합병증·산과응급','covered',['E20-C01','E20-C02','E20-C03','E20-C04','E20-C05','E20-C06']),
  T('E-PED-01','ems','소아','소아 평가·기도·호흡·내과·외상','covered',['E21-C01','E21-C02','E21-C03','E21-C04','E21-C05','E21-C06','E21-C07','E21-C08']),
  T('E-PALS-01','ems','소아소생','전문소아소생술·소아 서맥/빈맥/쇼크','covered',['E21-C04','E21-C05'],{visual:true}),
  T('E-NRP-01','ems','신생아','신생아소생술 초기평가·환기·압박','covered',['E20-C03'],{visual:true,evidence:'2026-NFA-EMS-350-352-364-newborn-resuscitation'}),
  T('E-GER-01','ems','노인','노인 생리·접근·평가·다약제','covered',['E22-C01','E22-C02','E22-C03']),
  T('E-BEH-01','ems','행동응급','행동응급·자살위험·폭력·기록','covered',['E23-C01','E23-C02','E23-C03'])
];
const statusRank={missing:0,partial:1,covered:2};
function audit(){
  const rows=topics.map(t=>{
    const present=(t.refs||[]).filter(id=>!!V.curriculum?.byId?.[id]);
    const packs=present.filter(id=>!!V.contentPacks?.authored?.[id]);
    const verified=packs.filter(id=>V.contentPacks.authored[id]?.status==='verified');
    const questions=present.reduce((n,id)=>n+(V.QuestionQuality119?.forConcept?.(id)||[]).length,0);
    return{...t,present:present.length,packs:packs.length,verified:verified.length,questions};
  });
  const count=s=>rows.filter(x=>x.status===s).length;
  const weighted=rows.reduce((n,x)=>n+statusRank[x.status],0);
  return{
    version:'119-coverage-map-2026-2027-v1',
    total:rows.length,
    covered:count('covered'),
    partial:count('partial'),
    missing:count('missing'),
    implementationPercent:Math.round(weighted/(rows.length*2)*100),
    calcTotal:rows.filter(x=>x.calc).length,
    calcMissing:rows.filter(x=>x.calc&&x.status==='missing').map(x=>x.id),
    visualMissing:rows.filter(x=>x.visual&&x.status==='missing').map(x=>x.id),
    rows
  };
}
V.CoverageMap119={
  version:'119-coverage-map-2026-2027-v1',
  basis:{
    official:['2026 소방공무원 채용시험 시행계획','2026 중앙소방학교 공개 교재'],
    trend:['2024 소방학개론 복원/총평','2025 소방학개론 총평','2026 소방학개론 총평','2024 응급처치학개론 복원','2025 응급처치학개론 복원/최근 3개년 분석'],
    policy:'공식범위와 공식교재가 우선이며, 최근기출/총평은 우선순위 태그에만 사용. 확인되지 않은 출제확률은 생성하지 않음.'
  },
  topics,audit
};
})();
;

/* --- store.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const ROOT='aitutor9:';const LEGACY='rescue6:';
const jget=(k,d)=>{try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch{return d}};
const jset=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const STORAGE_LIMITS=Object.freeze({answerEvents:6000,examHistory:120,studySessions:1000,resolvedWrongs:500,chat:300});
const stamp=x=>Math.max(Number(x?.updatedAt)||0,Number(x?.at)||0,Number(x?.resolvedAt)||0,Number(x?.lastWrongAt)||0,Number(x?.createdAt)||0,Number(x?.startedAt)||0,Number(x?.endedAt)||0);
const recent=(rows,n)=>[...(rows||[])].sort((a,b)=>stamp(b)-stamp(a)).slice(0,n).sort((a,b)=>stamp(a)-stamp(b));
function compactForQuota(s){
  const unresolved=(s.wrongs||[]).filter(x=>!x?.resolved),resolved=recent((s.wrongs||[]).filter(x=>x?.resolved),STORAGE_LIMITS.resolvedWrongs);
  s.answerEvents=recent(s.answerEvents,STORAGE_LIMITS.answerEvents);
  s.examHistory=recent(s.examHistory,STORAGE_LIMITS.examHistory);
  s.studySessions=recent(s.studySessions,STORAGE_LIMITS.studySessions);
  s.chat=recent(s.chat,STORAGE_LIMITS.chat);
  s.wrongs=[...unresolved,...resolved];
  s.migrations={...(s.migrations||{}),storageCompactedAt:Date.now(),storageCompactionVersion:'quota-v1'};
  return s
}
const quotaError=e=>e?.name==='QuotaExceededError'||e?.name==='NS_ERROR_DOM_QUOTA_REACHED'||e?.code===22||e?.code===1014;
const gid=()=>{let id=localStorage.getItem(ROOT+'guestId');if(!id){id='guest-'+(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));localStorage.setItem(ROOT+'guestId',id)}return id};
const defaultState=ownerId=>({schema:9,ownerId,page:'home',subject:'fire',scopeId:'F01',conceptId:'F01-C01',studyTab:'core',outline:false,lastStudyBySubject:{fire:null,ems:null},mockRounds:{real:{low:{},mid:{},high:{}},practice:{low:{},mid:{},high:{}}},profile:{examYear:'2027',examDate:'',dailyMinutes:40,level:'처음 시작'},answers:{},confidence:{},answerEvents:[],wrongs:[],reviewSchedule:{},progress:{},notes:[],examHistory:[],studySessions:[],chat:[],todayGoal:null,settings:{cloudSync:false,syncOriginalDocuments:false},migrations:{},updatedAt:Date.now()});
const key=id=>ROOT+'state:'+id;
let ownerId=gid();let state=jget(key(ownerId),defaultState(ownerId));
function save(){
  state.updatedAt=Date.now();
  try{jset(key(ownerId),state)}
  catch(err){
    if(!quotaError(err))throw err;
    compactForQuota(state);
    state.updatedAt=Date.now();
    jset(key(ownerId),state)
  }
  return state
}
function mergeArrays(a,b,id='id'){const m=new Map();[...(a||[]),...(b||[])].forEach(x=>m.set(x?.[id]||JSON.stringify(x),x));return [...m.values()]}
function mergeState(a,b,newOwner){const out={...defaultState(newOwner),...a,...b,ownerId:newOwner};out.lastStudyBySubject={fire:a?.lastStudyBySubject?.fire||null,ems:a?.lastStudyBySubject?.ems||null};for(const subject of ['fire','ems']){const incoming=b?.lastStudyBySubject?.[subject];if(incoming?.conceptId)out.lastStudyBySubject[subject]=incoming};out.mockRounds={real:{low:{...(a?.mockRounds?.real?.low||{}),...(b?.mockRounds?.real?.low||{})},mid:{...(a?.mockRounds?.real?.mid||{}),...(b?.mockRounds?.real?.mid||{})},high:{...(a?.mockRounds?.real?.high||{}),...(b?.mockRounds?.real?.high||{})}},practice:{low:{...(a?.mockRounds?.practice?.low||{}),...(b?.mockRounds?.practice?.low||{})},mid:{...(a?.mockRounds?.practice?.mid||{}),...(b?.mockRounds?.practice?.mid||{})},high:{...(a?.mockRounds?.practice?.high||{}),...(b?.mockRounds?.practice?.high||{})}}};out.answers={...(a?.answers||{}),...(b?.answers||{})};out.confidence={...(a?.confidence||{}),...(b?.confidence||{})};out.progress={...(a?.progress||{}),...(b?.progress||{})};out.reviewSchedule={...(a?.reviewSchedule||{}),...(b?.reviewSchedule||{})};out.answerEvents=mergeArrays(a?.answerEvents,b?.answerEvents,'eventId');out.wrongs=mergeArrays(a?.wrongs,b?.wrongs,'id');out.notes=mergeArrays(a?.notes,b?.notes,'id');out.examHistory=mergeArrays(a?.examHistory,b?.examHistory,'id');out.studySessions=mergeArrays(a?.studySessions,b?.studySessions,'id');out.chat=mergeArrays(a?.chat,b?.chat,'id');return out}
function switchOwner(id){ownerId=id||gid();state=jget(key(ownerId),defaultState(ownerId));return state}
function migrateGuestToUser(userId){const guest=jget(key(gid()),defaultState(gid())),user=jget(key(userId),defaultState(userId));state=mergeState(user,guest,userId);ownerId=userId;state.migrations={...(state.migrations||{}),guestImportedAt:Date.now()};save();return state}
function legacy(){const guestKey=key(gid()),cur=jget(guestKey,defaultState(gid()));if(cur.migrations?.rescue6)return false;const oldKeys=['profile','notes','generated','answers','conf','wrongs','examHistory','chat'];const has=oldKeys.some(k=>localStorage.getItem(LEGACY+k)!==null);if(!has){cur.migrations.rescue6='none';jset(guestKey,cur);if(ownerId===gid())state=cur;return false}const old=Object.fromEntries(oldKeys.map(k=>[k,jget(LEGACY+k,k==='answers'||k==='conf'?{}:[])]));cur.profile={...cur.profile,...(old.profile||{})};cur.notes=mergeArrays(cur.notes,old.notes,'id');cur.answers={...cur.answers,...(old.answers||{})};cur.confidence={...cur.confidence,...(old.conf||{})};cur.wrongs=mergeArrays(cur.wrongs,(old.wrongs||[]).map(w=>({...w,id:w.id||'legacy-w-'+Math.random().toString(36).slice(2)})),'id');cur.examHistory=mergeArrays(cur.examHistory,old.examHistory,'id');cur.chat=mergeArrays(cur.chat,(old.chat||[]).map((x,i)=>({...x,id:x.id||`legacy-chat-${i}`})),'id');Object.entries(old.answers||{}).forEach(([questionId,choice])=>{if(!cur.answerEvents.some(e=>e.questionId===questionId&&e.legacy)){const q=V.questionById?.[questionId];cur.answerEvents.push({eventId:'legacy-'+questionId,questionId,conceptId:q?.conceptId||'',subject:q?.subject||'',correct:q?Number(choice)===q.a:false,choice:Number(choice),confidence:old.conf?.[questionId]||'none',responseMs:null,at:Date.now(),legacy:true})}});cur.migrations.rescue6=Date.now();jset(guestKey,cur);if(ownerId===gid())state=cur;return true}
legacy();
V.Store={get state(){return state},get ownerId(){return ownerId},get guestId(){return gid()},save,switchOwner,migrateGuestToUser,mergeState,resetOwner(){state=defaultState(ownerId);save()},update(fn){const r=fn(state)||state;state=r;save();return state},setView(patch){Object.assign(state,patch);save()},export(){return JSON.stringify({schema:9,exportedAt:Date.now(),state},null,2)},import(raw){const data=typeof raw==='string'?JSON.parse(raw):raw;if(!data?.state)throw Error('INVALID_BACKUP');state=mergeState(state,data.state,ownerId);save();return state},storagePolicy:{version:'quota-v1',limits:STORAGE_LIMITS,compactOnQuotaOnly:true,preserveProgress:true,preserveNotes:true,preserveUnresolvedWrongs:true}};
})();

;

/* --- mastery.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},day=86400000,clamp=n=>Math.max(0,Math.min(100,n));
const delta=(o,f,r)=>{let d=o?({sure:12,maybe:9,none:6}[f]||7):({sure:-22,maybe:-14,none:-8}[f]||-10);if(o&&r&&r<15000)d++;if(o&&r&&r>120000)d-=2;return d};
const intervalFor=mastery=>mastery>=90?30:mastery>=75?14:mastery>=60?7:mastery>=40?3:1;
const defaults=id=>({conceptId:id,mastery:35,attempts:0,correct:0,streak:0,dangerousWrong:0,lapses:0,reviews:0,lastStudy:0,lastCorrect:0,nextReview:0,lastIntervalDays:0});
function ensure(id){const s=V.Store.state,p=s.progress[id]||(s.progress[id]=defaults(id));for(const[k,v]of Object.entries(defaults(id)))if(p[k]===undefined)p[k]=v;return p}
function nextInterval(p,f='none',q='answer'){const b=intervalFor(p.mastery),s=Math.min(1.8,1+Math.max(0,(p.streak||0)-1)*.15),c=q==='easy'?1.25:q==='good'?1.05:f==='sure'?1.15:f==='maybe'?1:.8,l=1/(1+Math.min(4,p.lapses||0)*.08);return Math.max(1,Math.min(45,Math.round(b*s*c*l)))}
function schedule(id,ok,f='none',q='answer'){const s=V.Store.state,p=ensure(id),d=ok?nextInterval(p,f,q):0,n=Date.now();p.lastIntervalDays=d;p.nextReview=ok?n+d*day:n;s.reviewSchedule[id]={conceptId:id,due:p.nextReview,intervalDays:d,mastery:p.mastery,updatedAt:n,version:'v2'};return d}
function requiredRecoveries(w){return(w?.wrongCount||0)>=2||w?.confidence==='sure'?2:1}
function recordAnswer(q,c,f='none',r=null){if(!q)return null;const s=V.Store.state,correct=Number(c)===q.a,p=ensure(q.conceptId),now=Date.now();p.attempts++;if(correct){p.correct++;p.streak++;p.lastCorrect=now}else{p.streak=0;p.lapses=(p.lapses||0)+1;if(f==='sure')p.dangerousWrong=(p.dangerousWrong||0)+1}p.mastery=clamp((p.mastery||35)+delta(correct,f,r));p.lastStudy=now;const intervalDays=schedule(q.conceptId,correct,f,'answer');s.answers[q.id]=Number(c);s.confidence[q.id]=f;const event={eventId:crypto.randomUUID?crypto.randomUUID():'evt-'+now+'-'+Math.random(),questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.masterQuestionId||q.id,variantKind:q.variantKind||'base',conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,correct,choice:Number(c),confidence:f,responseMs:r,intervalDays,at:now};s.answerEvents.push(event);let w=s.wrongs.find(x=>x.questionId===q.id&&!x.resolved);if(!correct){if(!w){w={id:crypto.randomUUID?crypto.randomUUID():'w-'+now,questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.masterQuestionId||q.id,questionSnapshot:q.variantGenerated?(V.VariantEngine119?.snapshot?.(q)||null):null,conceptId:q.conceptId,scopeId:q.scopeId,confidence:f,due:now,intervalDays:0,resolved:false,createdAt:now,lastWrongAt:now,wrongCount:1,recoveryCorrect:0,requiredRecoveries:f==='sure'?2:1};s.wrongs.push(w)}else{w.confidence=f;w.masterQuestionId=q.masterQuestionId||w.masterQuestionId||q.id;w.familyId=q.familyId||w.familyId||q.id;if(q.variantGenerated)w.questionSnapshot=V.VariantEngine119?.snapshot?.(q)||w.questionSnapshot;w.due=now;w.lastWrongAt=now;w.wrongCount=(w.wrongCount||1)+1;w.recoveryCorrect=0;w.requiredRecoveries=requiredRecoveries(w)}}else if(w){w.recoveryCorrect=(w.recoveryCorrect||0)+1;w.requiredRecoveries=requiredRecoveries(w);if(w.recoveryCorrect>=w.requiredRecoveries){w.resolved=true;w.resolvedAt=now}else w.due=now+day}if(s.todayGoal?.date===localDayKey())V.CorrectionLoopV64?.syncTodayGoal?.(s,s.todayGoal,{limit:3});V.Store.save();return{correct,event,progress:p,wrong:w||null}}
function markReviewed(id,q='good'){const p=ensure(id),s=V.Store.state,n=Date.now();p.reviews=(p.reviews||0)+1;p.lastStudy=n;if(q==='again'){p.mastery=clamp(p.mastery-8);p.streak=0;p.lapses=(p.lapses||0)+1}else if(q==='good'){p.mastery=clamp(p.mastery+4);p.streak=(p.streak||0)+1}else if(q==='easy'){p.mastery=clamp(p.mastery+7);p.streak=(p.streak||0)+1}schedule(id,q!=='again',q==='easy'?'sure':q==='good'?'maybe':'none',q);V.Store.save();return p}
function statsFor(id){const r=V.Store.state.progress[id],p=r?{...defaults(id),...r}:{...defaults(id),mastery:0},n=Date.now(),accuracy=p.attempts?Math.round(p.correct/p.attempts*100):null,ageDays=p.lastStudy?Math.max(0,(n-p.lastStudy)/day):null,overdueDays=p.nextReview?Math.max(0,(n-p.nextReview)/day):0;let retentionEstimate=p.attempts?p.mastery:0;if(p.attempts&&p.lastStudy&&p.lastIntervalDays>0){const x=ageDays/Math.max(1,p.lastIntervalDays);retentionEstimate=Math.round(clamp(p.mastery*Math.exp(-.35*Math.max(0,x-1))))}return{...p,accuracy,ageDays,overdueDays,retentionEstimate,overdue:!!p.nextReview&&p.nextReview<=n,questions:V.questionsForConcept?.(id)?.length||0}}
function riskFor(id){const s=V.Store.state,p=statsFor(id),w=s.wrongs.filter(x=>!x.resolved&&x.conceptId===id),d=w.filter(x=>x.confidence==='sure').length;let score=0;const r=[];if(d){score+=160+d*15;r.push('확신 오답')}if(w.length){score+=Math.min(80,w.length*16);r.push('오답 복구')}if(p.overdue){score+=100+Math.min(80,Math.ceil(p.overdueDays)*8);r.push('복습 지연')}if(p.attempts&&p.mastery<60){score+=80-p.mastery;r.push('취약개념')}if(p.attempts>=3&&p.accuracy<70){score+=Math.round((70-p.accuracy)*.8);r.push('정답률 보강')}if(p.lapses)score+=Math.min(30,p.lapses*5);if(!p.attempts){score+=20;r.push('신규 학습')}if(p.ageDays!=null&&p.ageDays>30){score+=Math.min(30,Math.round((p.ageDays-30)/3));r.push('장기 미학습')}return{score,reason:r.slice(0,2).join(' + ')||'신규 학습',wrong:w.length,danger:d,progress:p}}
function examPhase(){const m=V.OfficialMonitor119?.summary?.()||{},y=+(m.targetExamYear||V.Store.state.profile?.examYear||0),x=(m.items||[]).filter(x=>x?.schedule?.writtenExam&&(x.targetYearMatch===true||y&&(+x.noticeYear===y||+x.explicitYear===y))).sort((a,b)=>(a.changeState==='updated'?-1:0)-(b.changeState==='updated'?-1:0)||({change_notice:1,exam_schedule:2,recruitment_notice:3}[a.kind]||4)-({change_notice:1,exam_schedule:2,recruitment_notice:3}[b.kind]||4)||String(b.publishedAt||'').localeCompare(String(a.publishedAt||'')))[0],s=String(x?.schedule?.writtenExam||''),a=s.match(/^(20\d{2})-(\d{2})-(\d{2})$/);if(!a)return{phase:'normal',daysLeft:null,writtenExam:''};const t=Date.UTC(+a[1],+a[2]-1,+a[3]),d=new Date(t);if(d.getUTCFullYear()!=+a[1]||d.getUTCMonth()!=+a[2]-1||d.getUTCDate()!=+a[3])return{phase:'normal',daysLeft:null,writtenExam:''};const k=new Date(Date.now()+324e5),n=Date.UTC(k.getUTCFullYear(),k.getUTCMonth(),k.getUTCDate()),z=Math.round((t-n)/day);return{phase:z<0?'normal':z<=1?'D1':z<=7?'D7':z<=30?'D30':'normal',daysLeft:z,writtenExam:s}}
function todayPlan(limit=8){const exam=examPhase(),weight={D1:3,D7:2,D30:1}[exam.phase]||0;return V.curriculum.concepts.map(concept=>{const risk=riskFor(concept.id),p=risk.progress,phaseBoost=weight*((risk.danger?40:0)+(risk.wrong?30:0)+(p.overdue?25:0)+(p.attempts?Math.max(0,70-p.retentionEstimate):exam.phase==='D1'?-20:15));return{concept,...risk,score:risk.score+phaseBoost,phaseBoost,examPhase:exam.phase}}).sort((a,b)=>b.score-a.score||(a.progress.lastStudy||0)-(b.progress.lastStudy||0)||a.concept.id.localeCompare(b.concept.id)).slice(0,limit)}
function localDayKey(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),x=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${x}`}
function dayStartMs(){const d=new Date();d.setHours(0,0,0,0);return d.getTime()}
function ensureDailyGoal(limit=6){
  const s=V.Store.state,key=localDayKey(),valid=new Set(V.curriculum.concepts.map(x=>x.id));let changed=false,g=s.todayGoal;
  if(!g||g.date!==key){
    g={date:key,ids:todayPlan(limit).map(x=>x.concept.id),done:{},customized:false,createdAt:Date.now()};s.todayGoal=g;changed=true
  }else{
    const ids=[...new Set((g.ids||[]).filter(id=>valid.has(id)))];
    if(JSON.stringify(ids)!==JSON.stringify(g.ids||[])){g.ids=ids;changed=true}
    if(!g.done||typeof g.done!=='object'){g.done={};changed=true}
    if(!g.ids.length&&!g.customized){g.ids=todayPlan(limit).map(x=>x.concept.id);changed=true}
  }
  if(V.CorrectionLoopV64?.syncTodayGoal?.(s,g,{limit:3}))changed=true;
  if(changed)V.Store.save();return g
}
function dailyGoalRows(limit=6){
  const g=ensureDailyGoal(limit),rank=new Map(todayPlan(V.curriculum.concepts.length).map(x=>[x.concept.id,x]));
  return (g.ids||[]).map(id=>{const concept=V.curriculum.byId[id],risk=rank.get(id)||riskFor(id),correction=V.CorrectionLoopV64?.statusFor?.(id,V.Store.state),auto=correction?.active?false:(risk?.progress?.lastStudy||0)>=dayStartMs(),reason=correction?.active?('취약점 교정 · '+correction.recentCorrect+'/'+Math.max(1,correction.recentAttempts)+' 정답 · 확실 '+correction.sureCorrect):correction?.completed?'취약점 교정 완료':risk?.reason||'직접 추가';return concept?{concept,reason,done:correction?.completed||!!g.done?.[id]||auto,manualDone:!!g.done?.[id],correction:correction||null}:null}).filter(Boolean)
}
function dailyGoalAdd(id){const c=V.curriculum.byId[id];if(!c)return false;const g=ensureDailyGoal();V.CorrectionLoopV64?.restoreTodayGoal?.(g,id);if(!g.ids.includes(id))g.ids.push(id);g.customized=true;g.updatedAt=Date.now();V.Store.save();return true}
function dailyGoalRemove(id){const g=ensureDailyGoal();V.CorrectionLoopV64?.dismissTodayGoal?.(V.Store.state,g,id);g.ids=(g.ids||[]).filter(x=>x!==id);if(g.done)delete g.done[id];g.customized=true;g.updatedAt=Date.now();V.Store.save();return true}
function dailyGoalToggle(id){const g=ensureDailyGoal();if(!g.ids.includes(id))return false;g.done[id]=!g.done[id];g.updatedAt=Date.now();V.Store.save();return g.done[id]}
function dailyGoalReset(limit=6){const s=V.Store.state;s.todayGoal={date:localDayKey(),ids:todayPlan(limit).map(x=>x.concept.id),done:{},customized:false,createdAt:Date.now(),updatedAt:Date.now()};V.CorrectionLoopV64?.syncTodayGoal?.(s,s.todayGoal,{limit:3});V.Store.save();return s.todayGoal}
function dailyGoalSummary(limit=6){
  const rows=dailyGoalRows(limit),done=rows.filter(x=>x.done).length,total=rows.length,percent=total?Math.round(done/total*100):0,fire=rows.filter(x=>x.concept.subject==='fire'),ems=rows.filter(x=>x.concept.subject==='ems');
  return{rows,done,total,percent,remaining:Math.max(0,total-done),fire:{done:fire.filter(x=>x.done).length,total:fire.length},ems:{done:ems.filter(x=>x.done).length,total:ems.length}}
}
function dailyGoalMessage(summary=dailyGoalSummary()){
  if(!summary.total)return'오늘 목표를 직접 추가해 학습 순서를 정해보세요.';
  if(summary.percent>=100)return'오늘의 목표를 모두 마쳤습니다. 오답과 ★ 합격노트를 짧게 복습하면 좋습니다.';
  if(summary.percent>=70)return`거의 끝났습니다. 남은 ${summary.remaining}개를 마치면 오늘 목표 달성입니다.`;
  if(summary.percent>=35)return`오늘 목표 ${summary.done}/${summary.total} 완료. 지금 흐름을 이어가세요.`;
  return`오늘 목표는 ${summary.total}개입니다. 가장 중요한 한 개념부터 시작하세요.`
}
function readiness(){const cs=V.curriculum.concepts,s=V.Store.state,studied=cs.filter(c=>(s.progress[c.id]?.attempts||0)>0),covered=studied.length,questionConcepts=new Set(V.questions.filter(q=>q.grade==='A'||q.grade==='B').map(q=>q.conceptId)),retention=studied.length?Math.round(studied.reduce((a,c)=>a+statsFor(c.id).retentionEstimate,0)/studied.length):0,dangerous=s.wrongs.filter(w=>!w.resolved&&w.confidence==='sure').length,recoveryPending=s.wrongs.filter(w=>!w.resolved&&(w.recoveryCorrect||0)<requiredRecoveries(w)).length,overdue=Object.values(s.reviewSchedule).filter(r=>r.due<=Date.now()).length,mock=V.examReadiness(),exam=examPhase();return{scopeCoverage:Math.round(covered/cs.length*100),covered,total:cs.length,verifiedQuestionCoverage:Math.round(questionConcepts.size/cs.length*100),questionConcepts:questionConcepts.size,retention,dangerous,recoveryPending,overdue,mock,examPhase:exam.phase,examDaysLeft:exam.daysLeft}}
function conceptPriority(id){return todayPlan(V.curriculum.concepts.length).findIndex(x=>x.concept.id===id)}
V.Mastery={version:'119-mastery-v2',ensure,recordAnswer,markReviewed,statsFor,todayPlan,readiness,conceptPriority,intervalFor,riskFor,requiredRecoveries,examPhase,ensureDailyGoal,dailyGoalRows,dailyGoalAdd,dailyGoalRemove,dailyGoalToggle,dailyGoalReset,dailyGoalSummary,dailyGoalMessage,localDayKey};
})();
;
