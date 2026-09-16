const FACTORY_STOPWORDS=new Set(['그리고','그러나','따라서','대한','대해','있는','없는','한다','된다','경우','환자','응급','대한','위한','또는','및','등의','때문','통해','관련','이러한','에서는','으로','에서','에게','있다','없다','한다','한다면']);
let questionFactoryState={status:'공식 PDF 색인 후 문제를 만들 수 있습니다.',busy:false,lastCreated:0};

function normalizeQuestionFingerprint(text){return String(text).toLowerCase().replace(/\[[^\]]+\]/g,'').replace(/[^0-9a-z가-힣]/gi,'').slice(0,220)}
function existingQuestionFingerprints(){return new Set(allQuestions().map(q=>normalizeQuestionFingerprint(q.q)))}

function sourceSentences(text){
  return String(text).replace(/\s+/g,' ').split(/(?<=[.!?。])\s+|(?<=다\.)\s*/).map(s=>s.trim()).filter(s=>s.length>=28&&s.length<=320);
}

function candidateTerms(sentence,page){
  const known=(EMS_KEYWORDS[page.chapterId]||[]).filter(k=>sentence.includes(k));
  const raw=tokenize(sentence).filter(w=>w.length>=2&&w.length<=14&&!FACTORY_STOPWORDS.has(w)&&!/^[0-9]+$/.test(w));
  return [...new Set([...known,...raw.sort((a,b)=>b.length-a.length)])].slice(0,12);
}

function distractorPool(answer,page,allPages){
  const pool=[];
  for(const [cid,words] of Object.entries(EMS_KEYWORDS)) if(cid!==page.chapterId) pool.push(...words);
  for(const p of allPages){if(p.page===page.page)continue;for(const s of sourceSentences(p.text).slice(0,2))pool.push(...candidateTerms(s,p).slice(0,2));}
  return [...new Set(pool.filter(x=>x&&x!==answer&&x.length>=2&&x.length<=18))];
}

function makeGroundedQuestion(page,sentence,idx,allPages){
  const terms=candidateTerms(sentence,page);if(!terms.length)return null;
  const answer=terms[0];if(!sentence.includes(answer))return null;
  const stem=sentence.replace(answer,'_____');if(stem===sentence)return null;
  const distractors=shuffled(distractorPool(answer,page,allPages)).slice(0,3);if(distractors.length<3)return null;
  const raw=[answer,...distractors];const offset=idx%4;const choices=raw.map((_,i)=>raw[(i+offset)%4]);
  const a=choices.indexOf(answer);if(a<0||new Set(choices).size!==4)return null;
  const chapter=EMS_CHAPTER_INDEX_2026.find(c=>c.id===page.chapterId);
  return {id:uid('official-cloze'),subject:'응급처치학개론',chapter:chapter?.title||page.chapterTitle||'공식교재',concept:answer,sourceType:'verified',grade:'B',q:`[공식교재 원문회상] 빈칸에 들어갈 핵심어는?\n${stem}`,choices,a,ex:sentence,sourceLabel:`2026 소방전술3(구급) PDF ${page.page}쪽`,sourceDoc:OFFICIAL_DOC_ID,sourcePage:page.page,chapterId:page.chapterId,generator:'grounded-cloze-v1',validated:{answerInSource:true,uniqueChoices:true,sourcePage:true}};
}

function generateGroundedQuestions(chapterId,count=10){
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);if(!doc)return toast('먼저 공식 PDF를 로컬 색인하세요.');
  const pages=officialPageCache.filter(p=>chapterId==='ALL'||p.chapterId===chapterId);
  if(!pages.length)return toast('선택 단원의 매핑된 페이지가 없습니다.');
  const fingerprints=existingQuestionFingerprints();const created=[];let idx=0;
  for(const page of pages){
    for(const sentence of sourceSentences(page.text)){
      const q=makeGroundedQuestion(page,sentence,idx++,pages);if(!q)continue;
      const fp=normalizeQuestionFingerprint(q.q);if(fingerprints.has(fp))continue;fingerprints.add(fp);q.fingerprint=fp;created.push(q);if(created.length>=count)break;
    }
    if(created.length>=count)break;
  }
  if(!created.length)return toast('검증 조건을 통과한 원문회상 문제를 만들지 못했습니다.');
  state.generatedQuestions.push(...created);store.set('generatedQuestions',state.generatedQuestions);questionFactoryState.lastCreated=created.length;questionFactoryState.status=`B 원문회상 ${created.length}문제 생성 · 페이지 근거 연결 완료`;state.bankFilter='all';toast(`${created.length}문제 생성 완료`);render();
}

function parseAIQuestions(raw){
  let text=String(raw||'').trim().replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  const a=text.indexOf('['),b=text.lastIndexOf(']');if(a<0||b<a)throw new Error('JSON 배열을 찾지 못했습니다.');
  return JSON.parse(text.slice(a,b+1));
}

function tokenOverlap(a,b){
  const A=new Set(tokenize(a)),B=new Set(tokenize(b));if(!A.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/A.size;
}

function validateAIQuestion(item,page,fingerprints){
  if(!item||typeof item.q!=='string'||!Array.isArray(item.choices)||item.choices.length!==4)return null;
  const a=Number(item.a);if(!Number.isInteger(a)||a<0||a>3)return null;if(new Set(item.choices.map(String)).size!==4)return null;
  const evidence=String(item.evidence||item.ex||'').trim();if(evidence.length<15)return null;
  const source=page.text.replace(/\s+/g,' ');const overlap=tokenOverlap(evidence,source);if(overlap<.55)return null;
  const fp=normalizeQuestionFingerprint(item.q);if(!fp||fingerprints.has(fp))return null;fingerprints.add(fp);
  const chapter=EMS_CHAPTER_INDEX_2026.find(c=>c.id===page.chapterId);
  return {id:uid('aiq'),subject:'응급처치학개론',chapter:chapter?.title||page.chapterTitle||'공식교재',concept:String(item.concept||'AI 예상'),sourceType:'ai',grade:'C',q:item.q.trim(),choices:item.choices.map(String),a,ex:String(item.explanation||item.ex||evidence),sourceLabel:`AI 예상 · 근거 2026 소방전술3(구급) PDF ${page.page}쪽`,sourceDoc:OFFICIAL_DOC_ID,sourcePage:page.page,chapterId:page.chapterId,generator:'free-ai-grounded-v1',fingerprint:fp,validated:{structure:true,uniqueChoices:true,evidenceOverlap:Number(overlap.toFixed(2)),sourcePage:true}};
}

async function generateFreeAIQuestions(chapterId,count=5){
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);if(!doc)return toast('먼저 공식 PDF를 로컬 색인하세요.');
  const pages=officialPageCache.filter(p=>chapterId==='ALL'||p.chapterId===chapterId).filter(p=>p.text.length>200);if(!pages.length)return toast('선택 단원의 페이지 근거가 없습니다.');
  if(!state.ai.engine)await loadAI();if(!state.ai.engine)return toast('이 기기에서 무료 로컬 AI를 사용할 수 없습니다. B 원문회상 문제를 이용하세요.');
  questionFactoryState.busy=true;questionFactoryState.status='무료 AI 예상문제 생성·검증 중…';render();
  const fingerprints=existingQuestionFingerprints(),created=[];
  try{
    for(const page of shuffled(pages).slice(0,Math.min(pages.length,4))){
      const excerpt=page.text.slice(0,6500);
      const need=Math.min(3,count-created.length);if(need<=0)break;
      const raw=await ai(`아래 공식 교재 원문만 근거로 소방 구급경채 4지선다 예상문제 ${need}개를 만들어라. 원문 밖 사실 금지. 반드시 JSON 배열만 출력. 각 객체 형식: {"q":"문제","choices":["1","2","3","4"],"a":0,"concept":"개념","evidence":"원문에 실제로 있는 근거문장","explanation":"정답 이유"}. a는 0~3 정수.\n\n[2026 소방전술3(구급) PDF ${page.page}쪽]\n${excerpt}`,'너는 시험문제 출제 보조기다. 제공된 원문에 없는 의학지식이나 수치를 절대 추가하지 않는다. JSON 외 텍스트를 쓰지 않는다.');
      let rows=[];try{rows=parseAIQuestions(raw)}catch{continue}
      for(const row of rows){const q=validateAIQuestion(row,page,fingerprints);if(q)created.push(q);if(created.length>=count)break;}
      if(created.length>=count)break;
    }
    if(created.length){state.generatedQuestions.push(...created);store.set('generatedQuestions',state.generatedQuestions);questionFactoryState.status=`C AI예상 ${created.length}문제 생성 · 근거겹침/중복/구조 검증 통과`;questionFactoryState.lastCreated=created.length;toast(`${created.length}문제 검증 후 추가`);}else{questionFactoryState.status='AI 출력 중 검증조건을 통과한 문제가 없습니다.';toast('품질검증을 통과한 AI 문제가 없어 저장하지 않았습니다.');}
  }catch(e){console.error('QUESTION_FACTORY_AI',e);questionFactoryState.status='무료 AI 문제생성 실패 · 저장된 문제 없음';toast('AI 생성 실패 · 잘못된 문제는 저장하지 않았습니다.');}
  finally{questionFactoryState.busy=false;render();}
}

function questionFactoryPanel(){
  const options=['<option value="ALL">전체 매핑단원</option>',...EMS_CHAPTER_INDEX_2026.map(c=>`<option value="${c.id}">${c.id} · ${esc(c.title)}</option>`)].join('');
  return `<section class="card question-factory"><div class="row"><div><div class="tiny muted">QUESTION FACTORY · EVIDENCE FIRST</div><h3>공식교재 근거 문제 생성기</h3></div><span class="spacer"></span><span class="tag b">B 원문회상</span><span class="tag c">C AI예상</span></div><p class="muted">수천 문제를 한 번에 찍어내지 않습니다. 페이지 근거 → 생성 → 중복/정답/근거 검증을 통과한 문제만 저장합니다.</p><div class="factory-grid"><select id="factoryChapter" class="input">${options}</select><select id="factoryCount" class="input"><option value="5">5문제</option><option value="10" selected>10문제</option><option value="25">25문제</option><option value="50">50문제</option></select></div><div class="toolbar"><button class="btn primary" data-generate-grounded>B 원문회상 생성</button><button class="btn" data-generate-ai ${questionFactoryState.busy?'disabled':''}>무료 AI 예상문제 생성</button><button class="btn ghost" data-nav="bank">문제은행 열기</button></div><p class="tiny muted">${esc(questionFactoryState.status)}</p></section>`;
}

const _resourcesBeforeFactory=resources;
resources=function(){const html=_resourcesBeforeFactory();return html.replace('<div class="section-title"><h2>공식 시험범위</h2>',questionFactoryPanel()+'<div class="section-title"><h2>공식 시험범위</h2>');};

document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-generate-grounded]')){const c=$('#factoryChapter')?.value||'ALL',n=clamp(Number($('#factoryCount')?.value)||10,1,50);generateGroundedQuestions(c,n);return;}
  if(e.target.closest?.('[data-generate-ai]')){const c=$('#factoryChapter')?.value||'ALL',n=clamp(Math.min(Number($('#factoryCount')?.value)||5,10),1,10);generateFreeAIQuestions(c,n);return;}
});
