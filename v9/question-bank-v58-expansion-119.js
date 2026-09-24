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
