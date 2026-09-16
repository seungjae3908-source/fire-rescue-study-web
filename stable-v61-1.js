
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
const EMS_CHAPTERS=[
 ['E01','응급의료개론',['응급의료체계','응급의료개론','응급구조']],
 ['E02','소방대원 안녕',['대원 안전','건강관리','스트레스','소방대원']],
 ['E03','감염방지·개인보호장비',['감염방지','감염관리','개인보호장비','PPE','노출']],
 ['E04','해부생리·통신·기록·장비',['해부생리','무선통신','의료지도','기록','응급의료장비']],
 ['E05','응급의료에 관한 법률',['응급의료에 관한 법률','응급의료법','법적 책임']],
 ['E06','환자평가',['환자평가','현장평가','초기평가','활력징후','신체검진']],
 ['E07','기도유지',['기도유지','기도폐쇄','기도관리','흡인','기도']],
 ['E08','호흡곤란',['호흡곤란','호흡부전','호흡기','산소투여','환기']],
 ['E09','응급 심장질환',['응급 심장질환','흉통','급성관상','심근경색','심장질환']],
 ['E10','급성복통',['급성복통','복통','복부','위장관']],
 ['E11','출혈과 쇼크',['출혈과 쇼크','저혈량성 쇼크','출혈','쇼크','지혈','관류']],
 ['E12','연부조직 손상',['연부조직 손상','연부조직','상처','화상']],
 ['E13','근골격계 손상',['근골격계 손상','골절','탈구','염좌','부목']],
 ['E14','머리와 척추손상',['머리와 척추손상','두부손상','척추손상','경추']],
 ['E15','의식장애',['의식장애','의식수준','발작','뇌졸중','저혈당']],
 ['E16','중독·알레르기',['중독 및 알레르기 반응','중독','알레르기','아나필락시스','독성']],
 ['E17','노인',['노인환자','노인','고령']],
 ['E18','행동응급',['행동응급','행동장애','정신응급']],
 ['E19','환경응급',['환경응급','열손상','저체온','익수','고산']],
 ['E20','산부인과',['산부인과','임신','분만','산과']],
 ['E21','소아',['소아환자','소아','영아','아동']],
 ['E22','기본소생술',['기본소생술','심폐소생술','가슴압박','자동심장충격기','AED','BLS']]
].map(([id,title,keywords])=>({id,title,keywords}));
const OFFICIAL_Q_STOP=new Set(['그리고','그러나','따라서','대한','대해','있는','없는','한다','된다','경우','환자','응급','관련','위한','또는','에서','으로','이다','있다','없다','한다면','평가','처치','중요하다','상태이다']);
function scoreOfficialChapters(text){const low=String(text).toLowerCase(),ranked=[];for(const c of EMS_CHAPTERS){let score=0;for(const word of c.keywords){const w=word.toLowerCase();let pos=0,count=0;while((pos=low.indexOf(w,pos))>=0&&count<10){score+=w.length>=5?3:w.length>=3?2:1;pos+=w.length;count++}}if(score>0)ranked.push({id:c.id,title:c.title,score})}return ranked.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))}
function mapOfficialChapter(text){const ranked=scoreOfficialChapters(text),top=ranked[0];if(!top||top.score<2)return{id:'UNMAPPED',title:'미분류',score:top?.score||0,confidence:'low',candidates:[]};const second=ranked[1],confidence=top.score>=6&&(!second||top.score-second.score>=4||top.score>=second.score*1.6)?'high':'mixed',candidates=ranked.filter(x=>x.score>=2).slice(0,3);return{id:top.id,title:confidence==='high'?top.title:candidates.slice(0,2).map(x=>x.title).join(' · '),score:top.score,confidence,candidates}}
function officialAnswerCandidate(sentence){const map=mapOfficialChapter(sentence),low=sentence.toLowerCase(),chapterIds=new Set(map.candidates.map(x=>x.id));const preferred=[];for(const c of EMS_CHAPTERS){if(!chapterIds.has(c.id))continue;for(const k of c.keywords)if(k.length>=2&&low.includes(k.toLowerCase()))preferred.push(k)}if(preferred.length)return [...new Set(preferred)].sort((a,b)=>b.length-a.length)[0];const tokens=[...new Set(tokenize(sentence))].filter(w=>w.length>=2&&w.length<=14&&!OFFICIAL_Q_STOP.has(w)&&!/^[0-9]+$/.test(w));return tokens.sort((a,b)=>b.length-a.length)[0]||''}
function officialDistractors(answer,sentence,map){const pool=[];const same=new Set(map.candidates.map(x=>x.id));for(const c of EMS_CHAPTERS){if(same.has(c.id))continue;for(const k of c.keywords){if(k!==answer&&!sentence.includes(k)&&k.length>=2)pool.push(k)}}const unique=[...new Set(pool)];const target=answer.length;unique.sort((a,b)=>Math.abs(a.length-target)-Math.abs(b.length-target)||a.localeCompare(b));return unique.slice(0,12)}
function officialQuestionValid(q,evidence){return !!q&&Array.isArray(q.choices)&&q.choices.length===4&&new Set(q.choices).size===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4&&String(evidence).includes(q.choices[q.a])&&q.q.includes('_____')&&!q.q.includes(q.choices[q.a])&&Number.isInteger(q.sourcePage)&&String(q.source||'').includes(String(q.sourcePage))}
function officialDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open(OFFICIAL_DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains('docs'))db.createObjectStore('docs',{keyPath:'id'});if(!db.objectStoreNames.contains('pages'))db.createObjectStore('pages',{keyPath:'key'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function officialStoreGetAll(name){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(name,'readonly'),r=tx.objectStore(name).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
async function officialStorePutMany(name,rows){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(name,'readwrite'),s=tx.objectStore(name);rows.forEach(x=>s.put(x));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
async function officialStoreClear(){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(['docs','pages'],'readwrite');tx.objectStore('docs').clear();tx.objectStore('pages').clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('IDB_ABORT'))})}
async function officialReplace(doc,pages){const db=await officialDb();return new Promise((resolve,reject)=>{const tx=db.transaction(['docs','pages'],'readwrite'),ds=tx.objectStore('docs'),ps=tx.objectStore('pages');ds.clear();ps.clear();ds.put(doc);pages.forEach(row=>ps.put(row));tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('IDB_ABORT'))})}
async function restoreOfficial(){try{const [docs,pages]=await Promise.all([officialStoreGetAll('docs'),officialStoreGetAll('pages')]);const d=docs.find(x=>x.id===OFFICIAL_DOC);officialMeta=d||{fileName:'',pageCount:0,verified:false,at:0};officialPages=pages.filter(x=>x.docId===OFFICIAL_DOC).sort((a,b)=>a.page-b.page);if(state.page==='resources')render()}catch(e){console.warn('OFFICIAL_RESTORE',e)}}
function officialHits(query,limit=6){const words=tokenize(query);if(!words.length)return[];return officialPages.map(p=>{const low=p.text.toLowerCase();let score=0,first=-1;for(const w of words){let pos=0,c=0;while((pos=low.indexOf(w.toLowerCase(),pos))>=0&&c<8){score+=w.length>=3?2:1;if(first<0||pos<first)first=pos;pos+=w.length;c++}if((p.chapterTitle||'').toLowerCase().includes(w.toLowerCase()))score+=6}const at=first<0?0:Math.max(0,first-120);return{...p,score,snippet:p.text.replace(/\s+/g,' ').slice(at,at+650)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.page-b.page).slice(0,limit)}
function officialGrounding(query,limit=3){return officialHits(query,limit).map(x=>`[공식 PDF ${x.page}쪽]\n${x.snippet}`).join('\n\n---\n\n')}
function officialFallback(query){const hits=officialHits(query,3);if(!hits.length)return'';return `공식 PDF 근거검색 결과\n\n${hits.map((x,i)=>`${i+1}. PDF ${x.page}쪽\n${x.snippet}`).join('\n\n')}\n\n※ 이 브라우저에 저장된 공식 PDF 로컬 색인에서 찾았습니다. 원문 페이지를 최종 확인하세요.`}
function officialQuestionsFromPage(pageNo){const p=officialPages.find(x=>x.page===Number(pageNo));if(!p)return[];const raw=p.text.replace(/\s+/g,' ').trim(),sentences=(raw.match(/[^.!?。]+[.!?。]?/g)||[]).map(x=>x.trim()).filter(x=>x.length>=28&&x.length<=240),out=[],seen=new Set();for(const sentence of sentences){if(out.length>=5)break;const map=mapOfficialChapter(sentence),answer=officialAnswerCandidate(sentence);if(!answer||answer.length<2)continue;const idx=sentence.toLowerCase().indexOf(answer.toLowerCase());if(idx<0)continue;const stem=sentence.slice(0,idx)+'_____'+sentence.slice(idx+answer.length),distr=officialDistractors(answer,sentence,map);if(distr.length<3)continue;const base=[answer,...distr.slice(0,3)],shift=(p.page+out.length)%4,choices=base.map((_,i)=>base[(i+shift)%4]),q={id:uid('oq'),subject:'응급처치학개론',chapter:map.title||p.chapterTitle||'공식교재',chapterId:map.id,q:`[공식교재 원문회상 · PDF ${p.page}쪽] 가려진 원문 핵심어는?\n${stem}`,choices,a:choices.indexOf(answer),ex:sentence,source:`${officialMeta.fileName||'공식 PDF'} ${p.page}쪽`,grade:officialMeta.verified?'B':'D',sourcePage:p.page};const fp=q.q.replace(/\s+/g,' ').replace(/[0-9]+/g,'#').trim();if(seen.has(fp)||!officialQuestionValid(q,sentence))continue;seen.add(fp);out.push(q)}return out}
async function deleteOfficialIndex(){if(!confirm('이 브라우저의 공식 PDF 색인을 삭제할까요?'))return;await officialStoreClear();officialPages=[];officialMeta={fileName:'',pageCount:0,verified:false,at:0};render();toast('공식 PDF 색인 삭제 완료')}
