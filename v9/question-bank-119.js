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