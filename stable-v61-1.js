
'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const K='rescue6:';
const S={get(k,d){try{const v=localStorage.getItem(K+k);return v===null?d:JSON.parse(v)}catch{return d}},set(k,v){localStorage.setItem(K+k,JSON.stringify(v))},del(k){localStorage.removeItem(K+k)}};
const NAV=[['home','⌂','홈'],['study','▣','학습'],['tutor','AI','과외'],['notes','▤','노트'],['bank','?','문제'],['exam','⏱','시험'],['wrong','!','오답'],['stats','▥','통계'],['resources','◎','자료'],['settings','⚙','설정']];
const SOURCES=[
 {title:'2026년 소방공무원 채용시험 시행계획 변경공고',org:'소방청',url:'https://www.nfa.go.kr/nfa/news/notice/?cntId=734&mode=view&pageIdx=2',note:'구급 경채 시험 과목·문항수·시험시간 확인'},
 {title:'2026년 공통교재 [소방전술3]',org:'중앙소방학교',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',note:'구급 공식 교재 다운로드 페이지'},
 {title:'소방공무원 임용령',org:'국가법령정보센터',url:'https://www.law.go.kr/법령/소방공무원임용령',note:'필기시험 과목·출제범위 확인'}
];
const Q0=[
 ['f1','소방학개론','시험범위','소방학개론의 법정 상위 범위에 포함되는 것은?',['소방조직','산부인과','소아','기본소생술'],0,'소방학개론의 공식 범위에는 소방조직이 포함됩니다.','소방공무원 임용령'],
 ['f2','소방학개론','시험범위','소방학개론의 법정 상위 범위에 포함되는 것은?',['응급의료개론','재난관리','중독','행동응급'],1,'소방학개론의 공식 범위에는 재난관리가 포함됩니다.','소방공무원 임용령'],
 ['f3','소방학개론','시험범위','소방학개론의 법정 상위 범위에 포함되는 것은?',['기도유지','연소·화재이론','환자평가','소아'],1,'소방학개론의 공식 범위에는 연소·화재이론이 포함됩니다.','소방공무원 임용령'],
 ['f4','소방학개론','시험범위','소방학개론의 법정 상위 범위에 포함되는 것은?',['소화이론','노인','환경응급','산부인과'],0,'소방학개론의 공식 범위에는 소화이론이 포함됩니다.','소방공무원 임용령'],
 ['e1','응급처치학개론','시험범위','응급처치학개론의 법정 상위 범위 조합은?',['전문응급처치학총론 + 전문응급처치학개론','소방조직 + 재난관리','연소이론 + 소화이론','소방관계법규 + 행정법'],0,'응급처치학개론은 전문응급처치학총론과 전문응급처치학개론을 범위로 합니다.','소방공무원 임용령'],
 ['e2','응급처치학개론','시험안내','2026 구급 경채의 응급처치학개론 문항수는?',['20','25','40','65'],2,'2026 구급 경채는 응급처치학개론 40문항입니다.','2026 소방공무원 채용시험 시행계획 변경공고'],
 ['f5','소방학개론','시험안내','2026 구급 경채의 소방학개론 문항수는?',['20','25','40','65'],1,'2026 구급 경채는 소방학개론 25문항입니다.','2026 소방공무원 채용시험 시행계획 변경공고'],
 ['e3','응급처치학개론','시험안내','2026 구급 경채 필기시험 총 시간은?',['50분','60분','65분','75분'],2,'공고상 구급 경채 필기시험은 65분입니다.','2026 소방공무원 채용시험 시행계획 변경공고'],
 ['e4','응급처치학개론','학습법','손글씨 OCR 결과를 학습에 사용하기 전 필요한 것은?',['원본 대조','즉시 기출 등록','자동 A등급','무조건 삭제'],0,'OCR은 오인식 가능성이 있어 원본과 대조해야 합니다.','앱 학습 안전 규칙'],
 ['e5','응급처치학개론','학습법','확실하다고 생각했는데 틀린 문제는 어떻게 관리하는 것이 적절한가?',['삭제','위험오답으로 우선 복습','무시','기출로 승격'],1,'높은 확신의 오답은 잘못 굳어진 개념일 수 있어 우선 복습합니다.','앱 학습 안전 규칙']
].map(x=>({id:x[0],subject:x[1],chapter:x[2],q:x[3],choices:x[4],a:x[5],ex:x[6],source:x[7],grade:x[7].includes('임용령')||x[7].includes('공고')?'A':'D'}));
const state={page:S.get('page','home'),profile:S.get('profile',{examYear:'2027',examDate:'',daily:40,level:'처음 시작'}),notes:S.get('notes',[]),generated:S.get('generated',[]),answers:S.get('answers',{}),conf:S.get('conf',{}),wrongs:S.get('wrongs',[]),examHistory:S.get('examHistory',[]),chat:S.get('chat',[{role:'assistant',text:'안녕하세요. 무료 로컬 AI가 없어도 내 노트 근거검색으로 계속 사용할 수 있습니다.'}]),exam:null,ai:{engine:null,loading:false,status:'무료 AI 미로딩',progress:0,error:''},qa:null};
let examTimer=null;
const OFFICIAL_DB='rescue6-official-v1', OFFICIAL_DOC='ems-2026';
let officialPages=[];
let officialMeta={fileName:'',pageCount:0,verified:false,at:0};
function officialDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(OFFICIAL_DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('docs'))db.createObjectStore('docs',{keyPath:'id'});if(!db.objectStoreNames.contains('pages'))db.createObjectStore('pages',{keyPath:'key'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function officialStoreGetAll(name){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(name,'readonly'),r=tx.objectStore(name).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function officialStorePutMany(name,rows){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite'),s=tx.objectStore(name);rows.forEach(x=>s.put(x));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function officialStoreClear(){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(['docs','pages'],'readwrite');tx.objectStore('docs').clear();tx.objectStore('pages').clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function restoreOfficial(){try{const [docs,pages]=await Promise.all([officialStoreGetAll('docs'),officialStoreGetAll('pages')]);const d=docs.find(x=>x.id===OFFICIAL_DOC);officialMeta=d||{fileName:'',pageCount:0,verified:false,at:0};officialPages=pages.filter(x=>x.docId===OFFICIAL_DOC).sort((a,b)=>a.page-b.page);if(state.page==='resources')render()}catch(e){console.warn('OFFICIAL_RESTORE',e)}}
function officialHits(query,limit=6){const words=tokenize(query);if(!words.length)return[];return officialPages.map(p=>{const low=p.text.toLowerCase();let score=0,first=-1;for(const w of words){let pos=0,c=0;while((pos=low.indexOf(w.toLowerCase(),pos))>=0&&c<8){score+=w.length>=3?2:1;if(first<0||pos<first)first=pos;pos+=w.length;c++}}const at=first<0?0:Math.max(0,first-120);return{...p,score,snippet:p.text.replace(/\s+/g,' ').slice(at,at+650)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.page-b.page).slice(0,limit)}
function officialGrounding(query,limit=3){return officialHits(query,limit).map(x=>`[공식 PDF ${x.page}쪽]\n${x.snippet}`).join('\n\n---\n\n')}
function officialFallback(query){const hits=officialHits(query,3);if(!hits.length)return'';return `공식 PDF 근거검색 결과\n\n${hits.map((x,i)=>`${i+1}. PDF ${x.page}쪽\n${x.snippet}`).join('\n\n')}\n\n※ 이 브라우저에 저장된 공식 PDF 로컬 색인에서 찾았습니다. 원문 페이지를 최종 확인하세요.`}
function officialQuestionsFromPage(pageNo){const p=officialPages.find(x=>x.page===Number(pageNo));if(!p)return[];const text=p.text.replace(/\s+/g,' ');const chunks=text.split(/[.!?。]\s+|다\.\s+|한다\.\s+|이다\.\s+/).map(x=>x.trim()).filter(x=>x.length>=35&&x.length<=220);const allTerms=[...new Set(tokenize(text).filter(x=>x.length>=2&&!/^\d+$/.test(x)))];const out=[];for(const sentence of chunks){if(out.length>=3)break;const terms=[...new Set(tokenize(sentence).filter(x=>x.length>=2&&!/^\d+$/.test(x)))].sort((a,b)=>b.length-a.length);const ans=terms[0];if(!ans)continue;const distract=allTerms.filter(x=>x!==ans&&x.length>=2).slice(0,24);if(distract.length<3)continue;const stem=sentence.replace(ans,'_____');if(stem===sentence)continue;const seed=(p.page+out.length)%distract.length;const choices=[ans,distract[seed],distract[(seed+7)%distract.length],distract[(seed+13)%distract.length]];if(new Set(choices).size!==4)continue;const shift=(p.page+out.length)%4,rot=choices.map((_,i)=>choices[(i+shift)%4]);out.push({id:uid('oq'),subject:'응급처치학개론',chapter:'공식교재',q:`[공식교재 원문회상 · PDF ${p.page}쪽] 가려진 원문 단어는?\n${stem}`,choices:rot,a:rot.indexOf(ans),ex:sentence,source:`${officialMeta.fileName||'공식 PDF'} ${p.page}쪽`,grade:officialMeta.verified?'B':'D',sourcePage:p.page})}return out}
async function deleteOfficialIndex(){if(!confirm('이 브라우저의 공식 PDF 색인을 삭제할까요?'))return;await officialStoreClear();officialPages=[];officialMeta={fileName:'',pageCount:0,verified:false,at:0};render();toast('공식 PDF 색인 삭제 완료')}
