const OFFICIAL_DB_NAME='rescue-official-index-v1';
const OFFICIAL_DB_VERSION=1;
const OFFICIAL_DOC_ID='TACTICS3-EMS-2026';
let officialPageCache=[];
let officialIndexState={ready:false,docs:[],pageCount:0,covered:0,status:'공식 PDF 미색인',importing:false,progress:0};

const EMS_KEYWORDS={
  E01:['응급의료개론','응급의료체계','응급의료','응급구조'],
  E02:['소방대원 안녕','대원 안전','스트레스','건강관리'],
  E03:['감염방지','개인보호장비','감염관리','PPE','노출'],
  E04:['해부생리','무선통신','기록','응급의료장비','의학용어'],
  E05:['응급의료에 관한 법률','응급의료법','법률','법적'],
  E06:['환자평가','현장평가','초기평가','신체검진','활력징후'],
  E07:['기도유지','기도폐쇄','기도관리','흡인','기도'],
  E08:['호흡곤란','호흡부전','호흡기','산소','환기'],
  E09:['응급 심장질환','심장질환','흉통','급성관상','심근경색'],
  E10:['급성복통','복통','위장관','복부'],
  E11:['출혈과 쇼크','출혈','쇼크','관류','지혈'],
  E12:['연부조직 손상','연부조직','상처','화상'],
  E13:['근골격계 손상','골절','탈구','염좌','부목'],
  E14:['머리와 척추손상','두부손상','척추손상','경추'],
  E15:['의식장애','의식수준','발작','뇌졸중','저혈당'],
  E16:['중독 및 알레르기 반응','중독','알레르기','아나필락시스','독성'],
  E17:['노인','노인환자','고령'],
  E18:['행동응급','행동장애','정신응급','자해'],
  E19:['환경응급','열손상','저체온','익수','고산'],
  E20:['산부인과','임신','분만','산과'],
  E21:['소아','소아환자','영아','아동'],
  E22:['기본소생술','심폐소생술','가슴압박','자동심장충격기','AED','BLS']
};

function officialDb(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(OFFICIAL_DB_NAME,OFFICIAL_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains('docs')) db.createObjectStore('docs',{keyPath:'id'});
      if(!db.objectStoreNames.contains('pages')){
        const s=db.createObjectStore('pages',{keyPath:'key'});
        s.createIndex('docId','docId',{unique:false});
        s.createIndex('chapterId','chapterId',{unique:false});
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function idbAll(store){
  const db=await officialDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly');
    const req=tx.objectStore(store).getAll();
    req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error);
  });
}

async function idbPutMany(store,rows){
  const db=await officialDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    const s=tx.objectStore(store);rows.forEach(r=>s.put(r));
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}

async function idbDeleteDoc(docId){
  const db=await officialDb();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(['docs','pages'],'readwrite');
    tx.objectStore('docs').delete(docId);
    const idx=tx.objectStore('pages').index('docId');
    const req=idx.openCursor(IDBKeyRange.only(docId));
    req.onsuccess=e=>{const c=e.target.result;if(c){c.delete();c.continue();}};
    tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
  });
}

function chapterForPage(text){
  const t=String(text).toLowerCase();
  let best={id:'UNMAPPED',score:0};
  const scores=[];
  for(const [id,words] of Object.entries(EMS_KEYWORDS)){
    let score=0;
    for(const word of words){
      const w=word.toLowerCase();
      let pos=0,count=0;
      while((pos=t.indexOf(w,pos))!==-1&&count<12){score+=w.length>=5?3:1;pos+=w.length;count++;}
    }
    if(score>0)scores.push({id,score});
    if(score>best.score)best={id,score};
  }
  return {chapterId:best.score>=2?best.id:'UNMAPPED',scores:scores.sort((a,b)=>b.score-a.score).slice(0,3)};
}

function officialPageExcerpt(text,qterms){
  const raw=String(text).replace(/\s+/g,' ').trim();
  if(!raw)return '';
  let pos=-1;
  for(const term of qterms){const p=raw.toLowerCase().indexOf(term.toLowerCase());if(p>=0&&(pos<0||p<pos))pos=p;}
  if(pos<0)pos=0;
  return raw.slice(Math.max(0,pos-140),Math.min(raw.length,pos+520));
}

function searchOfficialPages(query,limit=5){
  const terms=tokenize(query);
  if(!terms.length)return [];
  return officialPageCache.map(p=>{
    const lower=p.text.toLowerCase();
    let score=0;
    for(const term of terms){
      let pos=0,count=0;
      while((pos=lower.indexOf(term.toLowerCase(),pos))!==-1&&count<10){score+=term.length>=3?2:1;pos+=term.length;count++;}
      if(p.chapterTitle?.includes(term))score+=5;
    }
    return {...p,_score:score,_excerpt:officialPageExcerpt(p.text,terms)};
  }).filter(p=>p._score>0).sort((a,b)=>b._score-a._score||a.page-b.page).slice(0,limit);
}

async function refreshOfficialIndex(){
  try{
    const [docs,pages]=await Promise.all([idbAll('docs'),idbAll('pages')]);
    officialPageCache=pages.filter(p=>p.docId===OFFICIAL_DOC_ID);
    const chapterSet=new Set(officialPageCache.filter(p=>p.chapterId&&p.chapterId!=='UNMAPPED').map(p=>p.chapterId));
    officialIndexState={...officialIndexState,ready:true,docs,pageCount:officialPageCache.length,covered:chapterSet.size,status:officialPageCache.length?`색인 ${officialPageCache.length}쪽 · 단원 ${chapterSet.size}/22`:'공식 PDF 미색인'};
    if(typeof render==='function')render();
  }catch(e){console.error('OFFICIAL_INDEX_LOAD',e);officialIndexState.ready=true;officialIndexState.status='공식 색인 저장소 오류';}
}

function officialIndexPanel(){
  const doc=officialIndexState.docs.find(d=>d.id===OFFICIAL_DOC_ID);
  const grade=doc?.verified?'A':'B';
  return `<section class="card official-index-panel">
    <div class="row"><div><div class="tiny muted">LOCAL OFFICIAL RAG</div><h3>2026 소방전술3(구급) PDF 페이지 색인</h3></div><span class="spacer"></span>${doc?trust(grade):'<span class="tag b">미색인</span>'}</div>
    <p class="muted">중앙소방학교 공식 페이지에서 PDF를 내려받은 뒤 여기에서 선택하세요. 원본 PDF와 추출 텍스트는 서버로 전송하지 않습니다.</p>
    <div class="progress"><i style="width:${Math.round((officialIndexState.covered/22)*100)}%"></i></div>
    <p class="tiny muted">${esc(officialIndexState.status)}${doc?` · ${esc(doc.fileName)} · ${doc.verified?'파일명/내용 점검 + 공식출처 사용자확인':'출처 검증대기'}`:''}</p>
    <label class="attest"><input type="checkbox" id="officialAttest"> 중앙소방학교의 위 공식자료 페이지에서 받은 2026 소방전술3(구급) PDF임을 확인합니다.</label>
    <div class="toolbar"><label class="btn primary">공식 PDF 로컬 색인<input type="file" data-official-pdf accept="application/pdf,.pdf" hidden></label>${doc?'<button class="btn" data-delete-official>색인 삭제</button>':''}<a class="btn ghost" href="https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=" target="_blank" rel="noopener">공식 다운로드 페이지</a></div>
    ${officialIndexState.importing?`<div class="ai-status"><b>PDF 색인 중 · ${Math.round(officialIndexState.progress*100)}%</b><div class="bar"><i style="width:${officialIndexState.progress*100}%"></i></div></div>`:''}
    ${doc?`<div class="official-search"><input id="officialSearch" class="input" placeholder="예: 저혈량성 쇼크, 기도폐쇄, 소아"><button class="btn" data-official-search>교재 검색</button></div><div id="officialSearchResults"></div>`:''}
  </section>`;
}

async function importOfficialPDF(file){
  if(!file)return;
  const attest=$('#officialAttest')?.checked===true;
  if(!attest){toast('공식자료 페이지에서 받은 파일인지 확인 체크가 필요합니다.');return;}
  officialIndexState.importing=true;officialIndexState.progress=.01;officialIndexState.status='PDF 여는 중';render();
  try{
    const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.min.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/build/pdf.worker.min.mjs';
    const pdf=await pdfjs.getDocument({data:await file.arrayBuffer()}).promise;
    const pages=[];let signal='';
    for(let i=1;i<=pdf.numPages;i++){
      const pg=await pdf.getPage(i);const tc=await pg.getTextContent();
      const text=tc.items.map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      if(i<=25)signal+=' '+text.slice(0,3000);
      const map=chapterForPage(text);const chapter=EMS_CHAPTER_INDEX_2026.find(c=>c.id===map.chapterId);
      pages.push({key:`${OFFICIAL_DOC_ID}:${i}`,docId:OFFICIAL_DOC_ID,page:i,text,chapterId:map.chapterId,chapterTitle:chapter?.title||'미분류',scores:map.scores});
      officialIndexState.progress=i/pdf.numPages;officialIndexState.status=`${i}/${pdf.numPages}쪽 추출`;
      if(i%8===0){const box=$('.official-index-panel .ai-status');if(box)box.innerHTML=`<b>${i}/${pdf.numPages}쪽 색인 중</b><div class="bar"><i style="width:${officialIndexState.progress*100}%"></i></div>`;await new Promise(r=>setTimeout(r,0));}
    }
    const nameOk=/소방전술3/i.test(file.name)&&/구급/i.test(file.name);
    const textOk=/(구급|응급의료|환자평가|심폐소생술)/.test(signal);
    const verified=attest&&nameOk&&textOk;
    await idbDeleteDoc(OFFICIAL_DOC_ID).catch(()=>{});
    await idbPutMany('docs',[{id:OFFICIAL_DOC_ID,title:'2026 소방전술3(구급)',fileName:file.name,pageCount:pdf.numPages,importedAt:Date.now(),verified,grade:verified?'A':'B',sourceUrl:OFFICIAL_SOURCE_REGISTRY_2026.find(x=>x.id==='SRC-TACTICS3-2026')?.url||'',validation:{attest,nameOk,textOk}}]);
    for(let i=0;i<pages.length;i+=25)await idbPutMany('pages',pages.slice(i,i+25));
    toast(verified?'공식 PDF A등급 로컬 색인 완료':'색인은 완료됐지만 A등급 검증 조건 일부 미충족');
    await refreshOfficialIndex();
  }catch(e){console.error('OFFICIAL_IMPORT',e);toast('공식 PDF 색인 실패: '+String(e?.message||e).slice(0,80));}
  finally{officialIndexState.importing=false;officialIndexState.progress=0;if(typeof render==='function')render();}
}

function showOfficialSearch(query){
  const hits=searchOfficialPages(query,8);const box=$('#officialSearchResults');if(!box)return;
  box.innerHTML=hits.length?hits.map(p=>`<div class="source-hit"><div class="row"><b>${p.chapterId==='UNMAPPED'?'미분류':esc(p.chapterTitle)}</b><span class="spacer"></span><span class="tag a">PDF ${p.page}쪽</span></div><p>${esc(p._excerpt)}</p><button class="btn small" data-tutor-source="${p.page}">이 페이지로 과외</button></div>`).join(''):'<div class="empty">관련 페이지를 찾지 못했습니다.</div>';
}

function officialGroundingText(query,limit=4){
  const hits=searchOfficialPages(query,limit);
  if(!hits.length)return '';
  return hits.map(p=>`[2026 소방전술3(구급) PDF ${p.page}쪽 · ${p.chapterTitle}]\n${p._excerpt}`).join('\n\n---\n\n');
}

const _resourcesBeforeIndexer=resources;
resources=function(){
  const html=_resourcesBeforeIndexer();
  return html.replace('<div class="section-title"><h2>공식 시험범위</h2>',officialIndexPanel()+'<div class="section-title"><h2>공식 시험범위</h2>');
};

const _basicTutorBeforeOfficial=basicTutorResponse;
basicTutorResponse=function(query){
  const official=officialGroundingText(query,4);
  if(official)return `공식 교재 로컬 근거검색\n\n${official}\n\n위 문구는 사용자가 로컬 색인한 2026 소방전술3(구급)에서 검색한 발췌입니다. 시험 답으로 정리할 때는 표시된 PDF 페이지의 전체 문맥을 확인하세요.`;
  return _basicTutorBeforeOfficial(query);
};

const _sendChatBeforeOfficial=sendChat;
sendChat=async function(){
  const input=$('#chatInput');const text=input?.value.trim();if(!text)return;
  state.chat.push({role:'user',content:text});state.chat.push({role:'assistant',content:'근거 찾는 중…'});store.set('chat',state.chat);render();
  try{
    const official=officialGroundingText(text,4);
    const personal=localRetrieve(text).map(n=>(n.summary||n.text).slice(0,1200)).join('\n---\n');
    if(!state.ai.engine)await loadAI();
    if(state.ai.engine){
      const prompt=`과외 모드: ${state.tutorMode}\n질문: ${text}\n${official?`공식교재 근거:\n${official}\n`:''}${personal?`개인노트 참고:\n${personal}\n`:''}공식교재 근거가 있으면 반드시 PDF 쪽수를 붙이고, 근거에 없는 사실은 단정하지 마. 쉬운 설명 → 시험포인트 → 함정 → 확인질문 순서로 답해줘.`;
      state.chat[state.chat.length-1]={role:'assistant',content:await ai(prompt)};
    }else state.chat[state.chat.length-1]={role:'assistant',content:basicTutorResponse(text)};
  }catch(e){state.chat[state.chat.length-1]={role:'assistant',content:basicTutorResponse(text)};}
  store.set('chat',state.chat);render();
};

document.addEventListener('change',e=>{const f=e.target.closest?.('[data-official-pdf]');if(f?.files?.[0])importOfficialPDF(f.files[0]);});
document.addEventListener('click',async e=>{
  if(e.target.closest?.('[data-delete-official]')){if(confirm('로컬 공식 PDF 색인을 삭제할까요?')){await idbDeleteDoc(OFFICIAL_DOC_ID);await refreshOfficialIndex();toast('공식 색인 삭제 완료');}return;}
  if(e.target.closest?.('[data-official-search]')){showOfficialSearch($('#officialSearch')?.value||'');return;}
  const t=e.target.closest?.('[data-tutor-source]');if(t){const p=officialPageCache.find(x=>String(x.page)===String(t.dataset.tutorSource));if(p){state.chat.push({role:'user',content:`2026 소방전술3(구급) PDF ${p.page}쪽 내용을 시험 과외처럼 설명해줘.\n근거:\n${p.text.slice(0,5000)}`});store.set('chat',state.chat);go('tutor');}return;}
});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target?.id==='officialSearch'){e.preventDefault();showOfficialSearch(e.target.value);}});

refreshOfficialIndex();
