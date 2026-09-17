'use strict';
(()=>{
const A=window.AITUTOR||{};
const OFF={ems:18,fire1:16,fire2:10,law2:12,law5:14};
const DOC={ems:'소방전술3(구급)',fire1:'소방전술1(화재1)',fire2:'소방전술1(화재2)',law2:'소방법령2',law5:'소방법령5'};
const EMS=[
['E01',3,24,[3,11,18]],['E02',25,31,[25,29]],['E03',32,50,[32,32,41,43,44]],['E04',51,71,[51,55]],['E05',72,88,[72,76,77,79]],['E06',89,102,[89,89,93,96,100]],['E07',103,126,[103,109,115,116,120]],
['E08',127,162,[129,137,143,152,156,160]],['E09',163,191,[163,164,166,168,171,179,181,189]],['E10',192,199,[192,193,194,197,198]],['E11',200,215,[200,202,205,208,209,210]],['E12',216,224,[216,218,219,223,223]],['E13',225,239,[225,227,228,233,234]],['E14',240,265,[240,242,255]],['E15',266,284,[266,269,274]],['E16',285,304,[285,287,299,302]],['E17',305,314,[305,306,310,311]],['E18',315,321,[315,319]],['E19',322,340,[322,323,330,333,338]],['E20',341,364,[341,343,344,354,359,361]],['E21',365,389,[365,365,366,368,374,376,385,387]],['E22',390,396,[390,391,392]],['E23',397,403,[397,401,403]],['E24',404,424,[404,408,411,413,417]]
];
const scopes=[];const concepts=[];
const phys=(doc,p)=>p+OFF[doc];
const addScope=(doc,scopeId,from,to)=>scopes.push({doc,scopeId,from:phys(doc,from),to:phys(doc,to),printedFrom:from,printedTo:to});
const addConcept=(doc,conceptId,scopeId,from,to)=>concepts.push({doc,conceptId,scopeId,from:phys(doc,from),to:phys(doc,to),printedFrom:from,printedTo:to});
EMS.forEach(([scopeId,from,to,starts])=>{addScope('ems',scopeId,from,to);starts.forEach((s,i)=>{const next=[...new Set(starts.filter(x=>x>s))].sort((a,b)=>a-b)[0]||to+1;addConcept('ems',`${scopeId}-C${String(i+1).padStart(2,'0')}`,scopeId,s,next-1)})});
// 소방학개론: 공식 시험범위와 직접 연결되는 부분만 허용.
addScope('law2','F01',42,164);addScope('law2','F01',174,197);
[[42,66],[68,83],[99,103]].forEach(r=>addConcept('law2','F01-C01'==='x'?'': 'F01-C02','F01',r[0],r[1]));
// F01-C01 소방기관·조직체계
concepts.splice(concepts.length-3,0,{doc:'law2',conceptId:'F01-C01',scopeId:'F01',from:phys('law2',42),to:phys('law2',66),printedFrom:42,printedTo:66});
// 위 임시 C02 레코드 중 첫 범위(42~66)는 제거하고 정확 범위 재구성
for(let i=concepts.length-1;i>=0;i--){const r=concepts[i];if(r.doc==='law2'&&r.conceptId==='F01-C02'&&r.printedFrom===42)concepts.splice(i,1)}
addConcept('law2','F01-C03','F01',67,98);addConcept('law2','F01-C04','F01',104,164);addConcept('law2','F01-C05','F01',174,197);
addScope('law5','F02',509,610);
addConcept('law5','F02-C01','F02',509,521);addConcept('law5','F02-C02','F02',509,523);addConcept('law5','F02-C03','F02',524,543);addConcept('law5','F02-C04','F02',550,564);addConcept('law5','F02-C05','F02',565,610);addConcept('law5','F02-C06','F02',581,601);addConcept('law5','F02-C07','F02',540,543);
addScope('fire1','F03',3,34);addScope('fire2','F03',295,358);
addConcept('fire1','F03-C01','F03',3,7);addConcept('fire1','F03-C02','F03',9,13);addConcept('fire1','F03-C03','F03',14,17);addConcept('fire2','F03-C03','F03',295,328);addConcept('fire1','F03-C04','F03',18,21);addConcept('fire1','F03-C05','F03',22,22);addConcept('fire1','F03-C06','F03',23,34);addConcept('fire1','F03-C07','F03',31,34);addConcept('fire2','F03-C07','F03',329,338);addConcept('fire2','F03-C08','F03',339,358);
addScope('fire1','F04',35,40);addScope('fire2','F04',183,256);
addConcept('fire1','F04-C01','F04',35,40);addConcept('fire2','F04-C01','F04',183,185);addConcept('fire2','F04-C02','F04',186,188);addConcept('fire2','F04-C03','F04',189,198);addConcept('fire2','F04-C04','F04',199,211);addConcept('fire2','F04-C05','F04',212,218);addConcept('fire2','F04-C06','F04',219,228);addConcept('fire2','F04-C07','F04',229,239);addConcept('fire2','F04-C08','F04',240,256);
function scopeTitle(id){return [...(A.studyDetailFire||A.fire||[]),...(A.studyDetailEms||A.ems||[])].find(x=>x.id===id)?.title||id}
function conceptTitle(id){return typeof A.v84Concepts==='function'?A.v84Concepts().find(x=>x.id===id)?.title||id:id}
A.v85Truth={version:'2026-official-v1',offsets:OFF,docs:DOC,scopes,concepts,emsMainPhysical:[21,442],emsAppendixStartsPhysical:443};
A.v85TruthForPage=(doc,page)=>{if(!(doc in OFF))return null;const sm=scopes.filter(r=>r.doc===doc&&page>=r.from&&page<=r.to),scopeId=sm[0]?.scopeId||'';const cm=concepts.filter(r=>r.doc===doc&&page>=r.from&&page<=r.to&&(scopeId?r.scopeId===scopeId:true));return{allowed:!!scopeId,scopeId,scopeTitle:scopeId?scopeTitle(scopeId):'범위밖/참고',conceptIds:[...new Set(cm.map(r=>r.conceptId))],printedPage:page-OFF[doc],docLabel:DOC[doc],truth:'official-range'}};
A.v85ConceptRanges=id=>concepts.filter(r=>r.conceptId===id).map(r=>({...r,docLabel:DOC[r.doc],title:conceptTitle(id)}));
function applyTruth(){A.pages=(A.pages||[]).map(p=>{const t=A.v85TruthForPage(p.docId,p.page);if(!t)return p;return{...p,scopeAllowed:t.allowed,scopeId:t.scopeId||'OUT',scopeTitle:t.scopeTitle,scopeConfidence:t.allowed?'truth':'out',conceptIds:t.conceptIds,conceptId:t.conceptIds.length===1?t.conceptIds[0]:'',printedPage:t.printedPage,truth:t.truth}});return A.pages}
A.v85ApplyTruth=applyTruth;
const oldRestore=A.restoreSources;A.restoreSources=async()=>{const r=await oldRestore?.();applyTruth();return r};
const oldImport=A.importOfficial;A.importOfficial=async files=>{const r=await oldImport?.(files);applyTruth();return r};
const oldQuestion=A.questionFor;A.questionFor=key=>{const p=(A.pages||[]).find(x=>x.key===key);if(!p||p.truth!=='official-range'||!p.scopeAllowed||p.conceptIds?.length!==1)return null;const q=oldQuestion?.(key);return q?{...q,conceptId:p.conceptIds[0],source:`${p.sourceTitle||DOC[p.docId]} · 교재 ${p.printedPage}쪽`,officialPrintedPage:p.printedPage}:null};
A.ground=(q,n=4)=>A.hits(q,'all',n).map(h=>`[${h.sourceTitle||DOC[h.docId]} · ${h.scopeTitle} · 교재 ${h.printedPage||h.page}쪽]\n${h.snippet||String(h.text||'').slice(0,620)}`).join('\n\n');
A.v84ConceptPages=(topic,concept)=>{const list=typeof A.v84Concepts==='function'?A.v84Concepts():[],d=list.find(x=>x.scopeId===topic?.id&&x.title===concept);if(!d)return[];return (A.pages||[]).filter(p=>p.scopeAllowed&&p.conceptIds?.includes(d.id)).sort((a,b)=>(a.docId||'').localeCompare(b.docId||'')||a.page-b.page)};
function currentConceptId(){if(typeof A.v84Concepts!=='function')return'';return A.v84Concepts().find(x=>x.scopeId===A.v83Scope&&x.title===A.v83Concept)?.id||''}
function enhance(){if(state.page!=='study')return;const id=currentConceptId(),rs=A.v85ConceptRanges(id),box=document.querySelector('.v84-focus-main');if(!id||!rs.length||!box||box.querySelector('.v85-truthline'))return;const labels=rs.map(r=>`${r.docLabel} ${r.printedFrom===r.printedTo?r.printedFrom:r.printedFrom+'–'+r.printedTo}쪽`);const el=document.createElement('div');el.className='v85-truthline tiny muted';el.style.cssText='margin:7px 0 2px;padding:7px 9px;border:1px solid rgba(119,221,166,.2);border-radius:10px;background:rgba(119,221,166,.06);line-height:1.45';el.innerHTML=`<b style="color:#77dda6">공식 범위 고정</b> · ${labels.map(esc).join(' · ')}`;const p=box.querySelector('p');p?box.insertBefore(el,p):box.appendChild(el)}
const oldBind=bind;bind=function(){oldBind();enhance()};
A.v85QA=()=>[
['EMS 24장 본문 고정',A.v85TruthForPage('ems',21)?.scopeId==='E01'&&A.v85TruthForPage('ems',442)?.scopeId==='E24'],
['EMS 부록 차단',!A.v85TruthForPage('ems',443)?.allowed],
['화재1 이론 뒤 전술 차단',A.v85TruthForPage('fire1',56)?.scopeId==='F04'&&!A.v85TruthForPage('fire1',57)?.allowed],
['화재2 소화약제 경계',A.v85TruthForPage('fire2',193)?.scopeId==='F04'&&!A.v85TruthForPage('fire2',267)?.allowed],
['화재2 연소·폭발 경계',A.v85TruthForPage('fire2',305)?.scopeId==='F03'&&A.v85TruthForPage('fire2',368)?.scopeId==='F03'&&!A.v85TruthForPage('fire2',369)?.allowed],
['소방조직 범위잠금',A.v85TruthForPage('law2',54)?.scopeId==='F01'&&!A.v85TruthForPage('law2',177)?.allowed&&A.v85TruthForPage('law2',186)?.scopeId==='F01'],
['재난관리 범위잠금',A.v85TruthForPage('law5',523)?.scopeId==='F02'&&A.v85TruthForPage('law5',624)?.scopeId==='F02'&&!A.v85TruthForPage('law5',625)?.allowed]
].map(([name,ok])=>({name,ok:!!ok}));
A.restoreSources?.().finally(()=>{applyTruth();render()});
})();
