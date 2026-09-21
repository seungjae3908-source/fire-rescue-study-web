'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const now=()=>Date.now();
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const hash=s=>{let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)};
const state=()=>V.Store.state;
const subjectOf=c=>c?.subject==='fire'||String(c?.id||'').startsWith('F')?'fire':'ems';
const subjectLabel=s=>s==='fire'?'소방학개론':'응급처치학개론';
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=arr=>{const out=[];for(const x of arr||[]){const t=normalize(x);if(t&&!out.includes(t))out.push(t)}return out};
const emphasis=()=>{const E=V.StudyEmphasis119;if(!E)throw Error('STUDY_EMPHASIS_SSOT_MISSING');return E};

function conceptKey(conceptId,bucket='must',index=0){return 'pass-c-'+conceptId+'-'+bucket+'-'+index}
function questionKey(questionId){return 'pass-q-'+questionId}
function find(id){return (state().notes||[]).find(n=>n.id===id)||null}
function has(id){return !!find(id)}
async function persist(note){
  const s=state(),i=(s.notes||[]).findIndex(n=>n.id===note.id),row={private:true,...note,createdAt:note.createdAt||now(),updatedAt:now()};
  if(i>=0)s.notes[i]={...s.notes[i],...row};else s.notes.push(row);
  V.Store.save();
  try{if(V.Auth?.user&&V.Auth?.saveNote)await V.Auth.saveNote(row)}catch(e){console.warn('pass note sync failed',e)}
  return row;
}
async function remove(id){
  try{if(V.Auth?.user&&V.Auth?.deleteNote)await V.Auth.deleteNote(id)}catch(e){throw e}
  V.Store.state.notes=(V.Store.state.notes||[]).filter(n=>n.id!==id);V.Store.save();return true;
}
function conceptNoteFromKey(key){
  const m=String(key||'').match(/^pass-c-(F\d\d-C\d\d|E\d\d-C\d\d)-(must|number|summary|feature)-(\d+)$/);if(!m)return null;
  const [,conceptId,bucket,idxRaw]=m,idx=Number(idxRaw),c=V.curriculum?.byId?.[conceptId],p=V.contentPacks?.get?.(conceptId);if(!c||!p)return null;
  let rows=[];
  if(bucket==='must')rows=emphasis().mustRows(p);
  else if(bucket==='feature')rows=emphasis().featureRows(p);
  else if(bucket==='number')rows=emphasis().numberRows(p,12);
  else rows=[p.summary];
  const text=rows[idx];if(!text)return null;
  const subj=subjectOf(c),source=emphasis().evidence(conceptId,p).source||'공식교재';
  return{id:key,title:`★ [${subjectLabel(subj)}] ${c.scopeTitle||''} › ${c.title}`,body:`${text}\n\n[공식근거]\n${source}`,sourceType:'pass-star',conceptId,subject:subj,sourceRef:source};
}
async function toggleConcept(key){
  if(has(key)){await remove(key);return{saved:false,id:key}}
  const note=conceptNoteFromKey(key);if(!note)throw Error('PASS_NOTE_SOURCE_NOT_FOUND');await persist(note);return{saved:true,id:key,note};
}
function questionNote(qid){
  const q=V.questionById?.[qid],c=q&&V.curriculum?.byId?.[q.conceptId];if(!q||!c)return null;
  const subj=subjectOf(c),right=`${q.a+1}. ${q.choices?.[q.a]||''}`;
  return{id:questionKey(qid),title:`★ [문제] ${c.scopeTitle||''} › ${c.title}`,body:`${q.q}\n\n정답: ${right}\n\n해설: ${q.ex||''}\n\n출처: ${q.source||''}`,sourceType:'pass-question',conceptId:q.conceptId,subject:subj,questionId:qid};
}
async function toggleQuestion(qid){const id=questionKey(qid);if(has(id)){await remove(id);return{saved:false,id}}const note=questionNote(qid);if(!note)throw Error('PASS_QUESTION_NOT_FOUND');await persist(note);return{saved:true,id,note}}
async function saveManual({id,title,body,sourceType='manual'}){
  const text=normalize(body);if(!text)throw Error('NOTE_BODY_REQUIRED');
  return persist({id:id||('note-'+now()+'-'+hash(text)),title:normalize(title)||'내 합격노트',body:text,sourceType});
}
function extractLines(text){
  const rows=uniq(String(text||'').split(/\n+/).map(x=>x.replace(/^\[\d+쪽\]\s*/,'').trim()).filter(x=>x.length>=10&&x.length<=260));
  const score=x=>{
    let n=0;if(/\d|%|℃|kg|mL|\bL\b|분|초|시간|배|이하|이상|미만|초과/.test(x))n+=5;
    if(/핵심|주의|금지|원칙|예외|정의|기준|우선|반드시|위험|정답|증상|처치|소화|설치|저장|취급/.test(x))n+=4;
    if(x.length>=20&&x.length<=110)n+=2;return n;
  };
  return rows.map((x,i)=>({x,i,s:score(x)})).sort((a,b)=>b.s-a.s||a.i-b.i).slice(0,14).sort((a,b)=>a.i-b.i).map(x=>x.x);
}
async function createFromPrivateDoc(docId,title){
  const chunks=await V.PrivateDocs?.chunksFor?.(docId);if(!chunks?.length)throw Error('PRIVATE_DOC_TEXT_NOT_FOUND');
  const sorted=chunks.sort((a,b)=>(a.page||0)-(b.page||0)||(a.chunkIndex||0)-(b.chunkIndex||0)),text=sorted.map(x=>x.text||'').join('\n');
  const lines=extractLines(text),fallback=(lines.length?lines:['추출된 내용이 부족합니다. 원문을 확인해 직접 수정하세요.']).map(x=>'• '+x).join('\n');
  let body=fallback,aiUsed=false;
  if(navigator.gpu&&V.LocalAI?.studyDigest){
    try{
      const ai=await V.LocalAI.studyDigest({title:title||'PDF/사진 정리',text});
      if(ai&&ai.length>=40){body=ai;aiUsed=true}
    }catch{}
  }
  const review=sorted.some(x=>x.needsReview)?'\n\n⚠ OCR 신뢰도가 낮은 페이지가 포함되어 있습니다. 해당 원문 페이지를 꼭 확인하세요.':'';
  const note=await persist({id:'pass-doc-'+docId,title:`[내 자료] ${title||'PDF/사진 정리'}`,body:body+`\n\n※ 자동으로 정리한 초안입니다. 원문과 대조해 수정하세요.`+review,sourceType:aiUsed?'pass-doc-ai':'pass-doc'});
  return{...note,aiUsed};
}
function passNotes(){return (state().notes||[]).filter(n=>/^pass-/.test(String(n.sourceType||''))||/^pass-/.test(String(n.id||'')))}
function numericRows(p){return emphasis().numberRows(p,10)}
function conceptHtml(c,compact=false){
  const p=V.contentPacks?.get?.(c.id);if(!p)return'';
  const E=emphasis(),features=E.featureRows(p),must=E.mustRows(p),nums=E.numberRows(p,10),traps=E.trapRows(p);
  const main=compact?must.slice(0,5):must,featureRows=compact?features.slice(0,4):features;
  return `<section class="c"><h2>${esc(c.scopeTitle||'')} · ${esc(c.title)}</h2><p class="summary">${esc(p.summary||'')}</p>${featureRows.length?'<h3>★ 특징·핵심</h3><ul class="important">'+featureRows.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}${main.length?'<h3>★★★ 시험필수</h3><ul class="important">'+main.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}${nums.length?'<h3>숫자·단위·기준</h3><ul>'+nums.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}${traps.length?'<h3>헷갈림 주의</h3><ul>'+traps.slice(0,compact?4:traps.length).map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}<p class="src">근거: ${esc(p.source||'공식교재')}</p></section>`;
}
function notesHtml(rows){return rows.map(n=>`<section class="c"><h2>${esc(n.title||'합격노트')}</h2><div class="note">${esc(n.body||'').replace(/\n/g,'<br>')}</div></section>`).join('')}
function rapidConceptHtml(c){
  const p=V.contentPacks?.get?.(c.id);if(!p)return'';
  const E=emphasis(),must=E.mustRows(p,3),nums=E.numberRows(p,3),traps=E.trapRows(p,2);
  return `<section class="c rapid"><h2>${esc(c.scopeTitle||'')} · ${esc(c.title)}</h2><p class="summary">${esc(p.summary||'')}</p>${must.length?'<h3>★★★</h3><ul class="important">'+must.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}${nums.length?'<h3>숫자·기준</h3><ul>'+nums.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}${traps.length?'<h3>함정</h3><ul>'+traps.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':''}</section>`
}
function rapidConceptSets(){
  const concepts=V.curriculum?.concepts||[],wrongIds=[...new Set((state().wrongs||[]).filter(x=>!x.resolved).map(x=>x.conceptId))],wrongSet=new Set(wrongIds);
  const wrong=wrongIds.map(id=>V.curriculum?.byId?.[id]).filter(Boolean).slice(0,40);
  const high=concepts.filter(c=>!wrongSet.has(c.id)&&(V.QuestionQuality119?.forConcept?.(c.id)||[]).length>=20).slice(0,50);
  return{wrong,high}
}
function printDocument(mode){
  const map={fire:'소방학개론 핵심내용 요약',ems:'응급처치학개론 핵심내용 요약',pass:'내 합격노트',rapid:'시험직전 초압축'};
  const title=map[mode]||'119 합격노트';
  let body='';
  if(mode==='pass')body=notesHtml(state().notes||[]);
  else if(mode==='rapid'){
    const starred=passNotes(),sets=rapidConceptSets();
    body=starred.length?'<h1>내 ★ 핵심</h1>'+notesHtml(starred):'<p>저장한 ★ 핵심이 없습니다.</p>';
    if(sets.wrong.length)body+='<h1>최근 오답 개념</h1>'+sets.wrong.map(rapidConceptHtml).join('');
    if(sets.high.length)body+='<h1>초고빈도 핵심</h1>'+sets.high.map(rapidConceptHtml).join('');
    if(!sets.wrong.length&&!sets.high.length)body+='<h1>핵심 압축</h1>'+((V.curriculum?.concepts||[]).slice(0,30).map(rapidConceptHtml).join(''));
  } else {
    const subject=mode==='fire'?'fire':'ems';
    body=(V.curriculum?.concepts||[]).filter(c=>subjectOf(c)===subject).map(c=>conceptHtml(c,false)).join('');
  }
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
  @page{size:A4;margin:14mm}*{box-sizing:border-box}body{font-family:system-ui,-apple-system,"Noto Sans KR","Malgun Gothic",sans-serif;color:#111;font-size:11pt;line-height:1.55}h1{font-size:22pt;border-bottom:3px solid #111;padding-bottom:8px}h2{font-size:15pt;margin:18px 0 7px}h3{font-size:11pt;margin:9px 0 4px}ul{margin:4px 0 10px 19px;padding:0}.c{break-inside:avoid;border-bottom:1px solid #ddd;padding:0 0 12px;margin:0 0 12px}.summary{font-weight:700}.important li{text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:2px}.src{font-size:8.5pt;color:#666}.note{white-space:normal}.cover{min-height:235mm;display:grid;align-content:center;text-align:center;page-break-after:always}.cover h1{border:0;font-size:30pt}.cover p{color:#555}.c li{margin:2px 0}
  </style></head><body><section class="cover"><h1>${esc(title)}</h1><p>119 소방·구급 합격 학습 OS</p><p>생성일 ${new Date().toLocaleDateString('ko-KR')}</p></section>${body}</body></html>`;
}
function exportPdf(mode){
  const html=printDocument(mode),w=window.open('','_blank');if(!w)throw Error('POPUP_BLOCKED');try{w.opener=null}catch{}
  w.document.open();w.document.write(html);w.document.close();setTimeout(()=>{try{w.focus();w.print()}catch{}},350);return true;
}
V.PassNote={conceptKey,questionKey,has,find,persist,remove,toggleConcept,toggleQuestion,saveManual,createFromPrivateDoc,passNotes,extractLines,printDocument,exportPdf,subjectOf,subjectLabel};
})();