/* V69 runtime bundle A — canonical order */

/* --- curriculum.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const FIRE=[
{id:'F01',title:'소방조직',subject:'fire',source:'소방법령2 · 소방기본법',concepts:['소방기관·조직체계','소방력','소방장비·소방용수시설','소방활동','의용소방대']},
{id:'F02',title:'재난관리',subject:'fire',source:'소방법령5 · 재난 및 안전관리 기본법',concepts:['재난의 정의·유형·용어','재난관리주관·책임기관','안전관리기구','재난 예방','재난 대비·대응·복구','긴급구조','재난안전상황실·보고체계']},
{id:'F03',title:'연소·화재이론',subject:'fire',source:'소방전술1 화재1·화재2',concepts:['화재의 개념·유형','열 발생과 전달','연소이론','화재 진행단계','화재 진행 영향요인','플래시오버·백드래프트·롤오버','연기·Flow Path','폭발']},
{id:'F04',title:'소화이론',subject:'fire',source:'소방전술1 화재1·화재2',concepts:['소화원리','소화약제 조건·분류','물 소화약제','포 소화약제','이산화탄소 소화약제','할로겐화합물 소화약제','할로겐화합물·불활성기체','분말 소화약제']}
];
const EMS=[
{id:'E01',title:'응급의료 개론',subject:'ems',concepts:['응급의료서비스 체계','선진국 응급의료서비스 체계','응급구조사의 법적 책임']},
{id:'E02',title:'소방대원의 안녕',subject:'ems',concepts:['응급처치 시 정신적 스트레스','개인 안전']},
{id:'E03',title:'감염방지 및 개인 보호 장비',subject:'ems',concepts:['감염예방의 정의','감염예방 처치','소독과 멸균','감염 관리','위험물사고현장 구급 활동']},
{id:'E04',title:'해부생리학',subject:'ems',concepts:['인체 기본 해부학','인체 해부생리학']},
{id:'E05',title:'무선통신 및 기록',subject:'ems',concepts:['의사소통','통신 체계','무선통신','기록지']},
{id:'E06',title:'환자 들어올리기와 이동',subject:'ems',concepts:['이동 전 계획','신체 역학','환자 안전','환자 이동 장비','환자 자세']},
{id:'E07',title:'응급의료 장비 사용법',subject:'ems',concepts:['기도확보유지 장비','호흡유지 장비','순환유지 장비','환자이송 장비','외상처치 장비']},
{id:'E08',title:'환자 평가',subject:'ems',concepts:['현장 확인','1차 평가','2차 평가','비외상 주요 병력·신체검진','외상 주요 병력·신체검진','재평가']},
{id:'E09',title:'기도유지',subject:'ems',concepts:['기도유지의 중요성','호흡','기도확보','기도유지 보조기구','인공호흡방법','흡인과 흡인기','산소 치료','특수한 상황']},
{id:'E10',title:'호흡곤란',subject:'ems',concepts:['호흡기계 해부·생리','정상·비정상호흡','호흡곤란','신생아와 소아','연기 흡입']},
{id:'E11',title:'응급 심장질환',subject:'ems',concepts:['심혈관계 해부·생리','심질환','심장마비','제세동','심장충격기','자동 체외 심장충격기']},
{id:'E12',title:'급성 복통',subject:'ems',concepts:['배의 해부·생리','복통','환자 평가','환자 처치','복통유발 질병']},
{id:'E13',title:'출혈과 쇼크',subject:'ems',concepts:['순환계','출혈','외부 출혈','내부 출혈','저혈량 쇼크']},
{id:'E14',title:'연부조직 손상',subject:'ems',concepts:['피부의 기능과 구조','연부조직 손상','화상']},
{id:'E15',title:'근골격계 손상',subject:'ems',concepts:['근골격계 해부·생리','외상과 근골격계','부목']},
{id:'E16',title:'머리와 척추 손상',subject:'ems',concepts:['머리·척추·중추신경계 해부','척추 손상','머리 손상','헬멧 제거']},
{id:'E17',title:'의식 장애',subject:'ems',concepts:['의식 장애','당뇨와 의식장애','경련','뇌졸중']},
{id:'E18',title:'중독 및 알레르기 반응',subject:'ems',concepts:['중독','알레르기 반응']},
{id:'E19',title:'환경 응급',subject:'ems',concepts:['체온조절과 신체','한랭손상','열 손상','익수 사고','물림과 쏘임']},
{id:'E20',title:'산부인과',subject:'ems',concepts:['임신 해부·생리','분만','정상 분만','분만 합병증','임신 중 응급상황·처치','부인과 응급']},
{id:'E21',title:'소아',subject:'ems',concepts:['소아 응급처치의 정의','해부와 생리','발달 과정','기도와 호흡 유지','평가','일반 내과 문제','외상','아동 학대와 방임']},
{id:'E22',title:'노인',subject:'ems',concepts:['노인의 해부와 생리','노인환자 접근','평가']},
{id:'E23',title:'행동 응급',subject:'ems',concepts:['행동 응급','특수한 상황','기록']},
{id:'E24',title:'기본소생술',subject:'ems',concepts:['기본소생술 개요','기도유지·인공호흡','가슴압박','심폐소생술','기도 내 이물질 제거']}
];
const DOCS={
 law2:{label:'소방법령2',kind:'official',scope:'F01'},law5:{label:'소방법령5',kind:'official',scope:'F02'},
 fire1:{label:'소방전술1(화재1)',kind:'official',scope:'F03/F04'},fire2:{label:'소방전술1(화재2)',kind:'official',scope:'F03/F04'},
 ems:{label:'소방전술3(구급)',kind:'official',scope:'E01~E24'}
};
const EMS_SOURCE=[
['E01',3,24,[3,11,18]],['E02',25,31,[25,29]],['E03',32,50,[32,32,41,43,44]],['E04',51,71,[51,55]],['E05',72,88,[72,76,77,79]],['E06',89,102,[89,89,93,96,100]],['E07',103,126,[103,109,115,116,120]],['E08',127,162,[129,137,143,152,156,160]],['E09',163,191,[163,164,166,168,171,179,181,189]],['E10',192,199,[192,193,194,197,198]],['E11',200,215,[200,202,205,208,209,210]],['E12',216,224,[216,218,219,223,223]],['E13',225,239,[225,227,228,233,234]],['E14',240,265,[240,242,255]],['E15',266,284,[266,269,274]],['E16',285,304,[285,287,299,302]],['E17',305,314,[305,306,310,311]],['E18',315,321,[315,319]],['E19',322,340,[322,323,330,333,338]],['E20',341,364,[341,343,344,354,359,361]],['E21',365,389,[365,365,366,368,374,376,385,387]],['E22',390,396,[390,391,392]],['E23',397,403,[397,401,403]],['E24',404,424,[404,408,411,413,417]]
];
const ranges={};
const add=(id,doc,from,to)=>{(ranges[id]||(ranges[id]=[])).push({doc,from,to,label:DOCS[doc].label})};
EMS_SOURCE.forEach(([scopeId,from,to,starts])=>{const uniq=[...new Set(starts)].sort((a,b)=>a-b);starts.forEach((s,i)=>{const next=uniq.find(x=>x>s)||to+1;add(`${scopeId}-C${String(i+1).padStart(2,'0')}`,'ems',s,next-1)})});
add('F01-C01','law2',42,66);add('F01-C02','law2',68,83);add('F01-C02','law2',99,103);add('F01-C03','law2',67,98);add('F01-C04','law2',104,164);add('F01-C05','law2',174,197);
add('F02-C01','law5',509,521);add('F02-C02','law5',509,523);add('F02-C03','law5',524,543);add('F02-C04','law5',550,564);add('F02-C05','law5',509,510);add('F02-C05','law5',565,610);add('F02-C06','law5',581,601);add('F02-C07','law5',540,543);
add('F03-C01','fire1',3,7);add('F03-C02','fire1',9,13);add('F03-C02','fire2',190,190);add('F03-C02','fire2',309,309);add('F03-C02','fire2',345,345);add('F03-C03','fire1',14,17);add('F03-C03','fire2',295,328);add('F03-C03','fire1',12,12);add('F03-C03','fire2',191,191);add('F03-C04','fire1',18,21);add('F03-C05','fire1',22,22);add('F03-C06','fire1',40,40);add('F03-C06','fire1',23,34);add('F03-C07','fire1',31,34);add('F03-C07','fire2',329,338);add('F03-C08','fire2',339,358);
add('F04-C01','fire1',35,40);add('F04-C01','fire2',183,185);add('F04-C02','fire2',186,188);add('F04-C03','fire2',189,198);add('F04-C04','fire2',199,211);add('F04-C05','fire2',212,218);add('F04-C06','fire2',219,228);add('F04-C07','fire2',229,239);add('F04-C08','fire2',240,256);
const scopes=[...FIRE,...EMS];
const concepts=scopes.flatMap(scope=>scope.concepts.map((title,index)=>({id:`${scope.id}-C${String(index+1).padStart(2,'0')}`,scopeId:scope.id,scopeTitle:scope.title,subject:scope.subject,title,index,sourceRanges:ranges[`${scope.id}-C${String(index+1).padStart(2,'0')}`]||[]})));
const byId=Object.fromEntries(concepts.map(x=>[x.id,x]));
const scopeById=Object.fromEntries(scopes.map(x=>[x.id,x]));
V.curriculum={version:'2026-official-v9',fire:FIRE,ems:EMS,scopes,concepts,byId,scopeById,docs:DOCS,ranges,totalConcepts:concepts.length};
V.sourceLabel=id=>(ranges[id]||[]).map(r=>`${r.label} ${r.from===r.to?r.from:`${r.from}~${r.to}`}쪽`).join(' · ');
V.subjectLabel=s=>s==='fire'?'소방학개론':'응급처치학개론';
})();

;

/* --- curriculum-complete-2026.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum)return;
const EXTRA=[
  {id:'F05',title:'위험물화재',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 예방실무/소방법령',concepts:[
    '위험물의 정의·류별 분류',
    '제1류 산화성고체',
    '제2류 가연성고체',
    '제3류 자연발화성·금수성물질',
    '제4류 인화성액체',
    '제5류 자기반응성물질',
    '제6류 산화성액체',
    '위험물화재 특수현상·소화원칙'
  ]},
  {id:'F06',title:'화재조사',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 소방전술/소방법령',concepts:[
    '화재조사의 목적·기본원칙',
    '현장보존·조사절차',
    '발화부·발화원인 조사',
    '화재피해 조사·기록'
  ]},
  {id:'F07',title:'소방시설',subject:'fire',source:'소방학개론 공식 출제범위 · 2026 예방실무1·2',concepts:[
    '소방시설의 5개 분류',
    '소화기구',
    '옥내소화전설비',
    '옥외소화전설비',
    '스프링클러설비',
    '간이스프링클러·화재조기진압용 스프링클러',
    '물분무·미분무소화설비',
    '포소화설비',
    '이산화탄소·가스계소화설비',
    '분말소화설비',
    '자동화재탐지설비',
    '비상경보·비상방송·자동화재속보·가스/누전경보',
    '피난구조설비',
    '소화용수설비',
    '소화활동설비·제연·연결송수'
  ]}
];

const existing=new Set(V.curriculum.fire.map(x=>x.id));
for(const sc of EXTRA)if(!existing.has(sc.id))V.curriculum.fire.push(sc);
const f01=V.curriculum.fire.find(x=>x.id==='F01');
for(const title of ['소방의 발전과정','소방조직관리 기초이론'])if(f01&&!f01.concepts.includes(title))f01.concepts.push(title);
V.curriculum.scopes=[...V.curriculum.fire,...V.curriculum.ems];
V.curriculum.scopeById=Object.fromEntries(V.curriculum.scopes.map(x=>[x.id,x]));
V.curriculum.concepts=V.curriculum.scopes.flatMap(scope=>scope.concepts.map((title,index)=>{
  const id=`${scope.id}-C${String(index+1).padStart(2,'0')}`;
  return{id,scopeId:scope.id,scopeTitle:scope.title,subject:scope.subject,title,index,sourceRanges:V.curriculum.ranges[id]||[]}
}));
V.curriculum.byId=Object.fromEntries(V.curriculum.concepts.map(x=>[x.id,x]));
V.curriculum.totalConcepts=V.curriculum.concepts.length;
V.curriculum.version='2026-official-complete-v10';

Object.assign(V.curriculum.docs,{
  prevention1:{label:'2026 예방실무1',kind:'official',scope:'F07'},
  prevention2:{label:'2026 예방실무2',kind:'official',scope:'F05/F07'},
  law1:{label:'2026 소방법령1',kind:'official',scope:'F06/F07'},
  law3:{label:'2026 소방법령3',kind:'official',scope:'F07'},
  law4:{label:'2026 소방법령4',kind:'official',scope:'F05'},
});
const R=V.curriculum.ranges;
const note=(id,doc,text)=>{R[id]=[{doc,label:V.curriculum.docs[doc]?.label||doc,note:text}]};
const anchor=(id,doc,from,to=from)=>{R[id]=[{doc,from,to,label:V.curriculum.docs[doc]?.label||doc}]};
for(let i=1;i<=8;i++)note(`F05-C${String(i).padStart(2,'0')}`,'prevention2','위험물 류별 특성·소화원칙 / 공식 범위 대조');
R['F05-C01']=[
  {doc:'prevention2',from:345,to:345,label:V.curriculum.docs.prevention2.label},
  {doc:'prevention2',from:385,to:385,label:V.curriculum.docs.prevention2.label}
];
anchor('F05-C02','prevention2',385);
anchor('F05-C03','prevention2',407);
anchor('F05-C04','prevention2',428);
anchor('F05-C05','prevention2',449);
anchor('F05-C06','prevention2',496);
anchor('F05-C07','prevention2',523);
R['F05-C08']=[
  {doc:'fire1',from:319,to:319,label:V.curriculum.docs.fire1.label},
  {doc:'prevention2',from:536,to:536,label:V.curriculum.docs.prevention2.label}
];
R['F06-C01']=[
  {doc:'fire2',from:269,to:269,label:V.curriculum.docs.fire2.label},
  {doc:'fire2',from:270,to:270,label:V.curriculum.docs.fire2.label}
];
R['F06-C02']=[
  {doc:'fire2',from:276,to:276,label:V.curriculum.docs.fire2.label},
  {doc:'fire2',from:282,to:282,label:V.curriculum.docs.fire2.label}
];
R['F06-C03']=[
  {doc:'fire2',from:282,to:282,label:V.curriculum.docs.fire2.label},
  {doc:'fire2',from:297,to:297,label:V.curriculum.docs.fire2.label}
];
R['F06-C04']=[
  {doc:'fire2',from:287,to:287,label:V.curriculum.docs.fire2.label},
  {doc:'fire2',from:294,to:294,label:V.curriculum.docs.fire2.label}
];
for(let i=1;i<=15;i++)note(`F07-C${String(i).padStart(2,'0')}`,'prevention1','소방시설 종류·작동원리·사용법 중심(구체 설치기준 제외)');
anchor('F07-C01','prevention1',17);
anchor('F07-C02','prevention1',207);
anchor('F07-C03','prevention1',247);
anchor('F07-C04','prevention1',273);
anchor('F07-C05','prevention1',284);
R['F07-C06']=[
  {doc:'prevention1',from:321,to:321,label:V.curriculum.docs.prevention1.label},
  {doc:'prevention1',from:333,to:333,label:V.curriculum.docs.prevention1.label}
];
anchor('F07-C07','prevention1',328);
anchor('F07-C08','prevention1',347);
anchor('F07-C09','prevention1',432);
anchor('F07-C10','prevention1',415);
anchor('F07-C11','prevention1',23);
anchor('F07-C12','prevention1',18);
anchor('F07-C13','prevention1',465);
anchor('F07-C14','prevention1',201);
R['F07-C15']=[
  {doc:'prevention1',from:167,to:167,label:V.curriculum.docs.prevention1.label},
  {doc:'prevention1',from:174,to:174,label:V.curriculum.docs.prevention1.label},
  {doc:'prevention1',from:433,to:433,label:V.curriculum.docs.prevention1.label},
  {doc:'prevention1',from:482,to:482,label:V.curriculum.docs.prevention1.label}
];
for(const c of V.curriculum.concepts)c.sourceRanges=R[c.id]||[];

const old=V.sourceLabel;
V.sourceLabel=id=>{
  const rows=R[id]||[];
  if(!rows.length)return old?old(id):'';
  return rows.map(r=>{
    if(Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)))return `${r.label} ${r.from===r.to?r.from:`${r.from}~${r.to}`}쪽`;
    return r.note?`${r.label} · ${r.note}`:r.label;
  }).join(' · ');
};
V.curriculumExpansion2026={addedScopes:EXTRA.map(x=>x.id),addedConcepts:EXTRA.reduce((n,x)=>n+x.concepts.length,0),totalConcepts:V.curriculum.totalConcepts,scopePolicy:'소방시설은 종류·작동원리·사용법 중심이며 구체 설치기준은 제외'};
})();
;

/* --- curriculum-fire-depth-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!V.curriculum)return;
const add=(scopeId,titles)=>{const sc=V.curriculum.scopeById?.[scopeId]||V.curriculum.scopes?.find(x=>x.id===scopeId);if(!sc)return;for(const t of titles)if(!sc.concepts.includes(t))sc.concepts.push(t)};
add('F03',['플래시오버','플레임오버','백드래프트','보일오버','슬롭오버','프로스오버','BLEVE·파이어볼','풀파이어']);
add('F07',['스프링클러 구성요소','습식 스프링클러','건식 스프링클러','준비작동식 스프링클러','일제살수식 스프링클러','스프링클러 헤드·감열부']);
V.curriculum.scopes=[...V.curriculum.fire,...V.curriculum.ems];V.curriculum.scopeById=Object.fromEntries(V.curriculum.scopes.map(x=>[x.id,x]));
V.curriculum.concepts=V.curriculum.scopes.flatMap(scope=>scope.concepts.map((title,index)=>{const id=`${scope.id}-C${String(index+1).padStart(2,'0')}`;return{id,scopeId:scope.id,scopeTitle:scope.title,subject:scope.subject,title,index,sourceRanges:V.curriculum.ranges[id]||[]}}));
V.curriculum.byId=Object.fromEntries(V.curriculum.concepts.map(x=>[x.id,x]));V.curriculum.totalConcepts=V.curriculum.concepts.length;V.curriculum.version='2026-study119-depth-v1';
const R=V.curriculum.ranges;const n=(id,doc,label,note)=>R[id]=[{doc,label,note}];const a=(id,doc,label,from,to=from)=>R[id]=[{doc,label,from,to}];
for(let i=9;i<=16;i++)n(`F03-C${String(i).padStart(2,'0')}`,'fire1','2026 소방전술1','화재성장·특수현상·위험물탱크 화재 공식 원문 page anchor 확장중');
a('F03-C09','fire1','2026 소방전술1',37);
a('F03-C10','fire1','2026 소방전술1',40);
a('F03-C11','fire1','2026 소방전술1',453);
a('F03-C12','fire1','2026 소방전술1',303);
a('F03-C13','fire1','2026 소방전술1',304);
a('F03-C14','fire1','2026 소방전술1',303);
a('F03-C15','fire1','2026 소방전술1',326);
a('F03-C16','fire1','2026 소방전술1',453);
for(let i=16;i<=21;i++)n(`F07-C${String(i).padStart(2,'0')}`,'prevention1','2026 예방실무1','스프링클러 구성·종류·작동원리 공식 원문 page anchor 확장중');
a('F07-C16','prevention1','2026 예방실무1',288);
a('F07-C17','prevention1','2026 예방실무1',288);
a('F07-C18','prevention1','2026 예방실무1',284);
a('F07-C19','prevention1','2026 예방실무1',284);
a('F07-C20','prevention1','2026 예방실무1',302);
a('F07-C21','prevention1','2026 예방실무1',287);
for(const c of V.curriculum.concepts)c.sourceRanges=R[c.id]||[];
V.curriculumDepth119={addedConcepts:14,firePhenomena:['F03-C09','F03-C10','F03-C11','F03-C12','F03-C13','F03-C14','F03-C15','F03-C16'],sprinkler:['F07-C16','F07-C17','F07-C18','F07-C19','F07-C20','F07-C21']};
})();
;

/* --- curriculum-ems-quality2-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!V.curriculum)return;
const scope={
  id:'E25',title:'기타 내과 응급',subject:'ems',
  concepts:['간·담도·췌장 응급','비뇨생식기계 응급','조혈계 응급','눈·귀·코·목 응급','비외상성 근골격계 응급']
};
if(!V.curriculum.ems.some(x=>x.id===scope.id))V.curriculum.ems.push(scope);
const R=V.curriculum.ranges;
const range=(id,rows)=>{R[id]=rows.map(x=>({doc:'ems',label:'2026 소방전술3(구급)',...x}))};
range('E25-C01',[{from:217,to:224}]);
range('E25-C02',[{from:217,to:224},{from:435,to:437}]);
range('E25-C03',[{from:66,to:66},{from:227,to:227}]);
range('E25-C04',[{from:105,to:105},{from:435,to:435}]);
range('E25-C05',[{from:390,to:394}]);
V.curriculum.scopes=[...V.curriculum.fire,...V.curriculum.ems];
V.curriculum.scopeById=Object.fromEntries(V.curriculum.scopes.map(x=>[x.id,x]));
V.curriculum.concepts=V.curriculum.scopes.flatMap(s=>s.concepts.map((title,index)=>{
  const id=`${s.id}-C${String(index+1).padStart(2,'0')}`;
  return{id,scopeId:s.id,scopeTitle:s.title,subject:s.subject,title,index,sourceRanges:R[id]||[]}
}));
V.curriculum.byId=Object.fromEntries(V.curriculum.concepts.map(x=>[x.id,x]));
V.curriculum.totalConcepts=V.curriculum.concepts.length;
V.curriculum.version='2026-quality2-expanded-ems-v2';
V.curriculumQuality2EMS={scope:'E25',addedConcepts:scope.concepts.length,totalConcepts:V.curriculum.totalConcepts,officialScope:'2026 응급처치학개론 내과응급 세부범위'};
})();
;

/* --- master-syllabus-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const fire=[
  {id:'FA',title:'PART 1 · 소방행정·재난관리',subtitle:'발전과정 · 조직관리 · 인적/물적/재정 자원 · 민간 소방조직 · 재난관리',scopeIds:['F01','F02'],requiredTopics:['소방의 발전과정','소방행정체제와 기능·책임','소방조직관리 기초이론','인적·물적·재정적 자원관리','민간 소방조직의 종류와 역할','재난관리 예방·대비·대응·복구']},
  {id:'FB',title:'PART 2 · 연소·폭발·화재현상',subtitle:'연소원리 · 열전달 · 화재성장 · 특수현상 · 폭발',scopeIds:['F03'],requiredTopics:[
    '연소의 조건과 형태','인화점·연소점·발화점','열전달','화재성장단계',
    '롤오버','플래시오버','백드래프트','연기와 Flow Path','폭발',
    '유류탱크 특수현상: 보일오버·슬롭오버·프로스오버/프로스오버 계열 공식용어 확인'
  ]},
  {id:'FC',title:'PART 3 · 소화이론·소화약제',subtitle:'소화원리 · 물 · 포 · 가스계 · 분말',scopeIds:['F04']},
  {id:'FD',title:'PART 4 · 위험물',subtitle:'제1~6류 · 품명 · 지정수량 · 저장취급 · 소화 · 계산',scopeIds:['F05'],requiredTopics:[
    '위험물 총론','지정수량 배수 계산','제1류 산화성고체','제2류 가연성고체',
    '제3류 자연발화성·금수성','제4류 인화성액체','제5류 자기반응성','제6류 산화성액체',
    '류별 품명·지정수량·예외·저장취급·소화방법 비교'
  ]},
  {id:'FE',title:'PART 5 · 소방시설',subtitle:'소화 · 경보 · 피난 · 소화용수 · 소화활동',scopeIds:['F07'],requiredTopics:[
    '소방시설 5분류','옥내·옥외소화전','스프링클러 기본구성·작동원리',
    '습식·건식·준비작동식·일제살수식 비교','간이스프링클러·화재조기진압용',
    '물분무·미분무','포','분말·CO₂·가스계','자동화재탐지','피난구조','제연·연결송수·통신보조'
  ]},
  {id:'FF',title:'PART 6 · 화재조사',subtitle:'현장보존 · 발화부 · 발화원인 · 피해조사',scopeIds:['F06']}
];
const ems=[
  {id:'EA',title:'PART A · EMS 기초',subtitle:'응급의료체계 · 법적책임 · 대원안전',scopeIds:['E01','E02']},
  {id:'EB',title:'PART B · 감염·통신·이송·장비',subtitle:'PPE · 감염관리 · 기록 · 이동 · 장비',scopeIds:['E03','E05','E06','E07']},
  {id:'EC',title:'PART C · 해부생리·환자평가',subtitle:'해부생리 · 현장확인 · 1·2차평가 · 재평가',scopeIds:['E04','E08']},
  {id:'ED',title:'PART D · 기도·호흡',subtitle:'기도확보 · 흡인 · 산소 · 환기 · 호흡곤란',scopeIds:['E09','E10']},
  {id:'EE',title:'PART E · 순환·심장·소생술',subtitle:'심장질환 · 제세동 · 출혈 · 쇼크 · BLS',scopeIds:['E11','E13','E24']},
  {id:'EF',title:'PART F · 내과응급',subtitle:'복통 · 간담췌 · 비뇨 · 조혈 · ENT · 비외상성 근골격 · 의식장애 · 중독 · 알레르기',scopeIds:['E12','E17','E18','E25'],requiredTopics:['위장관계 응급','간·담도·췌장 응급','비뇨생식기계 응급','조혈계 응급','감염질환 응급','눈·귀·코·목 응급','비외상성 근골격계 응급']},
  {id:'EG',title:'PART G · 외상',subtitle:'연부조직 · 화상 · 근골격 · 머리·척추',scopeIds:['E14','E15','E16']},
  {id:'EH',title:'PART H · 환경응급',subtitle:'한랭 · 열 · 익수 · 물림·쏘임',scopeIds:['E19']},
  {id:'EI',title:'PART I · 산과·소아·노인',subtitle:'분만 · 소아 · 노인',scopeIds:['E20','E21','E22']},
  {id:'EJ',title:'PART J · 행동응급',subtitle:'행동 변화 · 안전 · 의학적 원인 · 기록',scopeIds:['E23']}
];
const groups={fire,ems};
const all=[...fire,...ems];
const byId=Object.fromEntries(all.map(x=>[x.id,x]));
const scopeToGroup={};for(const g of all)for(const sid of g.scopeIds)scopeToGroup[sid]=g.id;
V.MasterSyllabus119={
  version:'2026-master-syllabus-v1',
  groups,byId,scopeToGroup,
  principles:{
    sourceFirst:true,
    preserveConceptIds:true,
    knowledgeDepth:['30초 핵심','교재형 상세','표·수치·공식','비교·함정','계산·사례','문제','원문 PDF'],
    completionRequires:['officialScope','detailedText','tablesOrStructuredData','exceptions','questions','sourceAnchor']
  }
};
})();
;

/* --- content-packs.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const P={
'F01-C01':{status:'verified',summary:'소방기관의 설치·지휘 관계를 구분하는 단원이다.',detail:['시·도에서 소방업무를 수행하기 위하여 시·도지사 직속으로 소방본부를 둔다.','소방서장은 시·도지사의 지휘·감독 아래 소관 사무를 총괄하고 소속 공무원을 지휘·감독한다.','소방서장 소속으로 119출장소·119안전센터·119구조대·119구급대·119구조구급센터·소방정대·119지역대 등을 둘 수 있다.'],must:['시·도지사 직속 → 소방본부','소방서장 소속 → 119안전센터·구조대·구급대 등'],traps:['소방본부와 119안전센터의 소속 관계를 뒤바꾼 선지에 주의한다.'],compare:[['소방본부','시·도지사 직속'],['소방서','시·도 조례로 설치'],['119안전센터 등','소방서장 소속']],flow:[],source:'소방법령2 · 소방기본법 42~46쪽'},
'F02-C01':{status:'verified',summary:'재난의 정의와 재난관리의 기본 개념을 구분한다.',detail:['재난은 국민의 생명·신체 및 재산과 국가에 피해를 주거나 줄 수 있는 것으로서 자연재난과 사회재난 등으로 구분된다.','재난관리는 재난의 예방·대비·대응 및 복구를 위하여 하는 모든 활동을 말한다.'],must:['재난관리 4단계 → 예방 · 대비 · 대응 · 복구'],traps:['재난관리를 사후 복구만으로 좁혀 설명한 선지는 틀리다.'],compare:[['자연재난','태풍·홍수·대설·한파·지진 등 자연현상'],['사회재난','화재·붕괴·폭발·교통사고·감염병 확산 등']],flow:['예방','대비','대응','복구'],source:'소방법령5 · 재난 및 안전관리 기본법 509~510쪽'},
'F03-C01':{status:'verified',summary:'화재의 법적·교재상 개념과 소화적응성 분류를 정리한다.',detail:['화재는 사람의 의도에 반하거나 고의 또는 과실에 의하여 발생하는 연소현상으로서 소화할 필요가 있는 현상, 또는 사람의 의도에 반하여 발생하거나 확대된 화학적 폭발현상을 말한다.','소화적응성에 따라 일반화재 A, 유류화재 B, 전기화재 C, 금속화재 D 등으로 구분한다.'],must:['A → 일반','B → 유류','C → 전기','D → 금속'],traps:['보일러 파열 같은 물리적 폭발을 화재 정의에 그대로 포함시키는 선지에 주의한다.'],compare:[['A급','일반 가연물'],['B급','유류'],['C급','전기'],['D급','가연성 금속']],flow:[],source:'소방전술1(화재1) 3~7쪽'},
'F03-C06':{status:'verified',summary:'플래시오버·백드래프트·롤오버는 발생 조건과 위험성이 서로 다르다.',detail:['백드래프트는 산소가 부족한 밀폐공간에서 불완전연소 가스와 열이 축적된 뒤 신선한 공기가 유입될 때 순간적으로 발생하는 폭발적 발화현상이다.','플래시오버는 축적된 열에 의해 구획실 내 가연물들이 거의 동시에 발화하면서 성장기에서 최성기로 전환되는 현상이며 폭발로 분류하지 않는다.','롤오버는 천장부의 고온 가연성가스가 발화하여 화염 끝부분이 빠르게 확대되는 현상으로 플래시오버의 대표적인 전조로 제시된다.'],must:['백드래프트 악화요인 → 공기 유입','플래시오버 악화요인 → 열 집적','롤오버 → 플래시오버 전조'],traps:['백드래프트와 플래시오버를 모두 폭발이라고 묶는 선지','롤오버를 플래시오버 이후 현상이라고 바꾸는 선지'],compare:[['플레임오버','초기화재 · 대류 발달 · 벽면→천장 화염 면이동'],['롤오버','가연성가스가 공기와 만나 부분 연소 · 개구부 방향 진행'],['플래시오버','열·복사 축적 · 구획실 가연물 거의 동시발화'],['백드래프트','산소 부족 · 미연소가스 축적 · 공기 유입 뒤 폭발적 발화']],flow:[],source:'소방전술1(화재1) 25~34쪽'},
'F03-C07':{status:'verified',summary:'Flow Path는 화점실의 열·연기가 압력이 낮은 개구부 쪽으로 이동하는 흐름이다.',detail:['양압상태의 화점실에서 형성된 열과 연기가 압력이 더 낮은 개방된 문이나 창문 쪽으로 이동하며 건물 구조에 따라 서로 다른 흐름 경로가 형성될 수 있다.','진압 중에는 화염·열·연기가 급격히 증가하여 대원을 덮칠 수 있어 흐름의 입구·출구와 화점 위치를 함께 보아야 한다.'],must:['화점 위치','공기 공급량 또는 연료량','공기 유입구~화점 거리','화점~배연구 거리','입구·출구 모양과 개구부 유형'],traps:['연기 흐름을 단순히 위로만 이동한다고 보는 선지에 주의한다.'],compare:[],flow:['공기 유입구','화점','열·연기 이동','배연구/개구부'],source:'소방전술1(화재1) 33~34쪽'},
'F03-C08':{status:'verified',summary:'폭연과 폭굉은 전파속도와 충격파 특성으로 구분한다.',detail:['폭연은 연소면의 전파속도가 음속보다 느리게 이동하는 경우다.','폭굉은 압력파 또는 충격파의 전파속도가 음속보다 빠르게 이동하는 경우다.','폭발의 영향은 압력·비산·열·지진으로 구분해 설명된다.'],must:['폭연 < 음속','폭굉 > 음속','폭발 영향 → 압력 · 비산 · 열 · 지진'],traps:['폭연과 폭굉의 전파속도를 반대로 제시한 선지에 주의한다.'],compare:[['폭연','음속보다 느린 전파'],['폭굉','음속보다 빠른 충격파 전파']],flow:[],source:'소방전술1(화재2) 339~357쪽'},
'F04-C01':{status:'verified',summary:'소화원리는 연소를 지속시키는 요소를 어떤 방식으로 차단하는지로 구분한다.',detail:['제거소화는 가연물을 제거·격리하거나 공급을 차단한다.','질식소화는 연소면과 산소의 접촉을 차단하거나 산소농도를 낮춘다.','냉각소화는 연소면의 온도를 낮춘다.','부촉매소화는 연쇄반응을 지배하는 라디칼 반응을 억제해 연쇄반응을 차단한다.'],must:['제거 → 가연물','질식 → 산소','냉각 → 온도','부촉매 → 연쇄반응'],traps:['질식과 부촉매의 작용 대상을 바꾼 선지에 주의한다.'],compare:[['제거소화','가연물 제거·격리'],['질식소화','산소 접촉·농도 차단'],['냉각소화','온도 저하'],['부촉매소화','연쇄반응 억제']],flow:[],source:'소방전술1(화재2) 183~185쪽'},
'F04-C02':{status:'verified',summary:'소화약제는 소화성능뿐 아니라 저장·안전·환경 조건도 충족해야 한다.',detail:['교재는 연소의 4요소 중 한 가지 이상을 제거할 수 있는 능력이 탁월할 것을 조건으로 제시한다.','가격, 저장 안정성, 환경오염 정도, 인체 독성 여부 등도 조건으로 제시한다.'],must:['연소요소 제거 능력','저장 안정성','환경오염 적음','인체 독성 없음'],traps:['소화성능만 좋으면 독성이나 저장안정성은 상관없다는 식의 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 186~188쪽'},
'F04-C08':{status:'verified',summary:'분말 소화약제는 BC 분말과 ABC 분말의 종별 주성분·적응화재를 구분해야 한다.',detail:['BC 분말에는 제1종·제2종·제4종이 있고, ABC 분말에는 제3종 분말이 있다.','제3종 분말은 제1인산암모늄을 주성분으로 하며 A·B·C급 화재에 사용할 수 있어 ABC 분말이라고도 한다.'],must:['1종 탄산수소나트륨 → BC','2종 탄산수소칼륨 → BC','3종 제1인산암모늄 → ABC','4종 탄산수소칼륨+요소 반응물 → BC'],traps:['제3종을 BC 전용으로 제시하거나 제1인산암모늄을 다른 종의 주성분으로 바꾼 선지에 주의한다.'],compare:[['BC 분말','제1·2·4종'],['ABC 분말','제3종 · 제1인산암모늄']],flow:[],source:'소방전술1(화재2) 240~252쪽'},
'E01-C01':{status:'verified',summary:'응급의료서비스 체계는 환자 발생부터 현장·이송·병원 단계가 연결되는 조직적 체계다.',detail:['응급의료서비스 체계는 응급상황이 발생했을 때 응급환자를 치료하기 위해 필요한 인력·장비 등을 효과적으로 조직하여 운영하는 것을 말한다.','응급의료는 응급환자 발생부터 생명 위험에서 회복되거나 중대한 위해가 제거될 때까지 상담·구조·이송·응급처치·진료 등의 조치를 포함한다.'],must:['인력','교육·훈련','통신','이송','병원','공공안전부서','기록·평가·상호협조'],traps:['응급의료체계를 단순한 구급차 이송만으로 한정한 선지에 주의한다.'],compare:[],flow:['목격/발견','응급전화','현장처치','전문소생술·이송','응급실·병원'],source:'소방전술3(구급) 3~10쪽'},
'E06-C05':{status:'verified',summary:'환자의 상태와 손상 가능성에 따라 안전한 이송 자세를 선택한다.',detail:['교재는 쇼크 환자 이송 시 다리를 약 20~30cm 올린 바로누운 자세를 제시한다.','머리·목뼈·척추 손상이 의심되는 환자에게는 해당 자세를 무조건 적용하지 않도록 주의해야 한다.'],must:['쇼크 이송자세 → 다리 약 20~30cm 상승','척추손상 의심 → 자세 적용에 주의'],traps:['모든 쇼크 환자에게 예외 없이 같은 자세를 적용한다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 100~102쪽'},
'E11-C03':{status:'verified',summary:'심장마비는 무의식·무호흡·무맥박 등 심정지 상태를 빠르게 인식하는 것이 핵심이다.',detail:['교재는 심장마비 환자에서 맥박과 호흡이 없고 무의식 상태가 나타나는 것을 대표적인 상태로 설명한다.','심정지 인식 후에는 지체 없이 기본소생술과 제세동 체계로 연결해야 한다.'],must:['무의식','호흡 없음','맥박 없음'],traps:['의식이 명료하거나 정상 호흡·맥박이 유지된 상태를 심장마비의 전형으로 제시한 선지에 주의한다.'],compare:[],flow:['심정지 인식','신고/AED','기본소생술','제세동/전문소생술'],source:'소방전술3(구급) 205~206쪽'},
'E12-C03':{status:'verified',summary:'급성 복통 환자평가에서는 증상 양상과 병력을 구조화해 수집한다.',detail:['급성 복통 장의 학습목표는 OPQRST와 SAMPLE을 이용해 환자 정보와 병력을 수집하도록 제시한다.'],must:['OPQRST','SAMPLE'],traps:['복통 환자 문진에서 병력 수집을 생략하거나 단일 질문만으로 판단하는 선지에 주의한다.'],compare:[],flow:['증상 양상 확인(OPQRST)','병력·약물·알레르기 등 확인(SAMPLE)','신체평가','재평가'],source:'소방전술3(구급) 216쪽'},
'E13-C03':{status:'verified',summary:'외부 출혈은 혈관 종류에 따른 혈액 색과 분출 양상을 구분한다.',detail:['동맥 출혈은 산소가 풍부한 선홍색 혈액이 심박동에 맞춰 뿜어져 나올 수 있고 지혈이 어려울 수 있다.'],must:['동맥출혈 → 선홍색','심박동에 맞춘 분출 가능'],traps:['동맥출혈을 항상 검붉고 천천히 스며 나오는 형태로 제시한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 228쪽'},
'E17-C03':{status:'verified',summary:'경련 환자는 손상을 막고 기도·호흡을 관찰하되 억지로 구속하거나 입에 물건을 넣지 않는다.',detail:['교재의 경련 환자 요약은 입에 무언가를 강제로 넣지 말고 환자를 신체적으로 구속하지 않도록 제시한다.'],must:['입에 물건 강제 삽입 금지','사지 강제 구속 금지'],traps:['혀를 보호한다는 이유로 단단한 물건을 입에 넣는 처치는 피해야 한다.'],compare:[],flow:['주변 위험 제거','경련 중 손상 방지','기도·호흡 관찰','경련 후 재평가'],source:'소방전술3(구급) 310~314쪽'},
'E24-C01':{status:'verified',summary:'기본소생술은 전문소생술 전까지 뇌와 심장에 산소가 공급되도록 순환과 호흡을 유지하는 단계다.',detail:['기본소생술의 목적은 전문인명소생술에 의해 혈액순환이 회복될 때까지 뇌와 심장에 산소를 공급하는 것이다.','환자의 반응을 확인하고 무반응이면 119 신고와 자동심장충격기 요청으로 연결한다.','의료제공자는 호흡 확인과 동시에 목동맥 맥박을 5~10초 이내에 확인한다.'],must:['무반응 → 119 신고 + AED 요청','의료제공자 호흡·맥박 확인 → 5~10초 이내','CAB → Circulation · Airway · Breathing'],traps:['맥박 확인 때문에 가슴압박 시작이 지연되어서는 안 된다.'],compare:[],flow:['현장안전·반응확인','119/AED 요청','호흡·맥박 확인','가슴압박','기도·호흡'],source:'소방전술3(구급) 404~407쪽'},
'E24-C02':{status:'verified',summary:'기도개방법은 외상 가능성에 따라 선택하고 인공호흡은 과환기를 피한다.',detail:['비외상 환자는 머리기울임-턱들어올리기법으로 기도를 개방한다.','머리·목·척추 손상이 의심되면 턱 밀어올리기법을 사용한다.','인공호흡은 1회에 약 1초간 총 2회, 가슴 상승이 눈으로 확인될 정도로 시행하며 과환기를 피한다.'],must:['비외상 → 머리기울임-턱들어올리기','외상 의심 → 턱 밀어올리기','인공호흡 → 1초 × 2회'],traps:['척추손상 의심 환자에게 머리를 과도하게 젖히는 선지에 주의한다.'],compare:[['비외상','머리기울임-턱들어올리기'],['머리·목·척추손상 의심','턱 밀어올리기']],flow:[],source:'소방전술3(구급) 408~410쪽'},
'E24-C03':{status:'verified',summary:'성인 가슴압박은 위치·속도·깊이·이완·중단 최소화가 핵심이다.',detail:['성인은 가슴뼈 아래쪽 절반을 강하고 규칙적으로 압박한다.','압박속도는 분당 100~120회, 깊이는 약 5cm로 제시되며 압박 후 가슴벽이 충분히 이완되도록 한다.','가슴압박 중단 시간을 가능한 짧게 유지한다.'],must:['위치 → 가슴뼈 아래쪽 1/2','속도 → 100~120회/분','깊이 → 약 5cm','완전 이완'],traps:['너무 느리거나 120회를 넘는 속도, 불충분한 이완을 정상 기준으로 제시한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 411~412쪽'},
'E24-C04':{status:'verified',summary:'성인 CPR은 30:2 비율과 중단 최소화, 구조자 교대 기준을 함께 기억한다.',detail:['성인의 가슴압박과 인공호흡 비율은 구조자 수와 관계없이 30:2로 제시된다.','약 2분 또는 5주기마다 압박자를 교대하여 압박 질 저하를 줄인다.','맥박확인·제세동 등 필수 처치로 중단이 필요해도 10초 이상 중단하지 않도록 한다.'],must:['30 : 2','5주기 ≈ 약 2분','Hands-off time < 10초'],traps:['구조자 수에 따라 성인 30:2 비율이 바뀐다고 단정한 선지에 주의한다.'],compare:[],flow:['30회 압박','2회 인공호흡','5주기/약 2분','재평가·교대'],source:'소방전술3(구급) 413~414쪽'}
};
function fallback(c){const source=V.sourceLabel(c.id);return{status:'source-required',summary:`${c.title}은(는) 2026 공식 시험범위에 연결된 세부개념입니다.`,detail:[source?`공식 근거 위치: ${source}`:'공식 근거 범위 확인이 필요합니다.','상세 정의·수치·예외·비교는 원문 근거가 확인된 내용만 표시하도록 잠겨 있습니다.'],must:[],traps:['근거가 확인되지 않은 문장은 B등급 문제나 확정 학습내용으로 승격하지 않습니다.'],compare:[],flow:[],source:source||'공식 원문 연결 대기'} }
V.contentPacks={authored:P,get(id){const c=V.curriculum.byId[id];return P[id]||fallback(c)},coverage(){const total=V.curriculum.concepts.length,verified=V.curriculum.concepts.filter(c=>(P[c.id]?.status)==='verified').length;return{total,verified,pending:total-verified,percent:Math.round(verified/total*100)}}};
})();

;

/* --- questions.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const Q=[
{id:'a-fire-scope-1',grade:'A',subject:'fire',scopeId:'F01',conceptId:'F01-C01',q:'소방학개론의 공식 상위 출제범위에 포함되는 것은?',choices:['소방조직','산부인과','소아','기본소생술'],a:0,ex:'소방학개론의 공식 상위 범위에는 소방조직이 포함됩니다.',source:'소방공무원 임용령'},
{id:'a-fire-scope-2',grade:'A',subject:'fire',scopeId:'F02',conceptId:'F02-C01',q:'소방학개론의 공식 상위 출제범위에 포함되는 것은?',choices:['응급의료 개론','재난관리','중독','행동응급'],a:1,ex:'소방학개론의 공식 상위 범위에는 재난관리가 포함됩니다.',source:'소방공무원 임용령'},
{id:'a-fire-scope-3',grade:'A',subject:'fire',scopeId:'F03',conceptId:'F03-C01',q:'소방학개론의 공식 상위 출제범위에 포함되는 것은?',choices:['기도유지','연소·화재이론','환자평가','소아'],a:1,ex:'소방학개론의 공식 상위 범위에는 연소·화재이론이 포함됩니다.',source:'소방공무원 임용령'},
{id:'a-fire-scope-4',grade:'A',subject:'fire',scopeId:'F04',conceptId:'F04-C01',q:'소방학개론의 공식 상위 출제범위에 포함되는 것은?',choices:['소화이론','노인','환경응급','산부인과'],a:0,ex:'소방학개론의 공식 상위 범위에는 소화이론이 포함됩니다.',source:'소방공무원 임용령'},
{id:'a-exam-fire-count',grade:'A',subject:'fire',scopeId:'F01',conceptId:'F01-C01',q:'2026 구급 경채 필기에서 소방학개론 문항 수는?',choices:['20','25','40','65'],a:1,ex:'2026 시행계획상 소방학개론은 25문항입니다.',source:'2026 소방공무원 채용시험 시행계획 변경공고'},
{id:'a-exam-ems-count',grade:'A',subject:'ems',scopeId:'E01',conceptId:'E01-C01',q:'2026 구급 경채 필기에서 응급처치학개론 문항 수는?',choices:['20','25','40','65'],a:2,ex:'2026 시행계획상 응급처치학개론은 40문항입니다.',source:'2026 소방공무원 채용시험 시행계획 변경공고'},
{id:'a-exam-time',grade:'A',subject:'ems',scopeId:'E01',conceptId:'E01-C01',q:'2026 구급 경채 필기시험 총 시간은?',choices:['50분','60분','65분','75분'],a:2,ex:'2026 시행계획상 구급 경채 필기시험은 65분입니다.',source:'2026 소방공무원 채용시험 시행계획 변경공고'},
{id:'b-f01-org-1',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C01',q:'시·도에서 소방업무를 수행하기 위하여 시·도지사 직속으로 두는 조직은?',choices:['119안전센터','소방본부','의용소방대','한국소방안전원'],a:1,ex:'교재는 시·도에서 소방업무를 수행하기 위하여 시·도지사 직속으로 소방본부를 둔다고 설명합니다.',source:'소방법령2 · 소방기본법 42쪽'},
{id:'b-f01-org-2',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C01',q:'소방서장 소속으로 둘 수 있는 조직에 해당하는 것은?',choices:['119안전센터','중앙안전관리위원회','국가안전관리위원회','한국소방안전원'],a:0,ex:'교재는 소방서장 소속으로 119안전센터·119구조대·119구급대 등을 둘 수 있다고 제시합니다.',source:'소방법령2 · 소방기본법 46쪽'},
{id:'b-f02-disaster-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C01',q:'재난 및 안전관리 기본법상 재난관리의 의미로 맞는 것은?',choices:['재난의 예방·대비·대응·복구를 위하여 하는 모든 활동','재난 발생 후 복구만 하는 활동','자연재난만 예방하는 활동','통계 작성만을 위한 활동'],a:0,ex:'공식 교재는 재난관리를 예방·대비·대응·복구를 위하여 하는 모든 활동으로 정의합니다.',source:'소방법령5 · 재난 및 안전관리 기본법 510쪽'},
{id:'b-f02-disaster-2',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C01',q:'다음 중 사회재난의 예로 공식 교재가 제시하는 유형은?',choices:['화재·붕괴·폭발','태풍·홍수만','대설·한파만','지진만'],a:0,ex:'교재는 화재·붕괴·폭발·교통사고 등으로 인한 일정 규모 이상의 피해를 사회재난에 포함합니다.',source:'소방법령5 · 재난 및 안전관리 기본법 510쪽'},
{id:'b-f03-fire-1',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C01',q:'공식 교재의 화재 개념에 가장 부합하는 것은?',choices:['소화할 필요가 있는 연소현상 또는 사람의 의도에 반해 발생·확대된 화학적 폭발현상','의도와 무관한 모든 연소·물리적 파열 현상을 화재로 본다','열이나 연기만 발생해도 모두 화재로 분류한다','불꽃이 보이는 연소현상만 화재로 분류한다'],a:0,ex:'공식 교재는 소화 필요성이 있는 연소현상과 일정한 화학적 폭발현상을 화재의 범주로 설명합니다.',source:'소방전술1(화재1) 3쪽'},
{id:'b-f03-fire-2',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C01',q:'소화적응성에 따른 화재 분류 연결로 맞는 것은?',choices:['A급-일반화재','B급-금속화재','C급-유류화재','D급-전기화재'],a:0,ex:'교재는 A 일반, B 유류, C 전기, D 금속 화재로 설명합니다.',source:'소방전술1(화재1) 4쪽'},
{id:'b-f03-special-1',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',q:'백드래프트의 악화요인으로 교재가 강조하는 것은?',choices:['신선한 공기의 유입','냉각수의 증발','가연물 완전 제거','산소 농도 감소'],a:0,ex:'백드래프트는 산소가 부족한 공간에 신선한 공기가 유입될 때 폭발적 발화가 일어날 수 있습니다.',source:'소방전술1(화재1) 25~27쪽'},
{id:'b-f03-special-2',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',q:'백드래프트와 플래시오버 비교로 맞는 것은?',choices:['백드래프트는 폭발현상이고 플래시오버는 폭발로 분류하지 않는다','둘 다 반드시 폭굉이다','플래시오버는 산소부족 때문에만 생긴다','백드래프트는 열 집적만으로 발생한다'],a:0,ex:'공식 비교표는 백드래프트를 폭발현상, 플래시오버를 폭발이 아닌 현상으로 구분합니다.',source:'소방전술1(화재1) 26~27쪽'},
{id:'b-f03-special-3',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',q:'플래시오버의 대표적 전조현상으로 제시되는 것은?',choices:['롤오버','동결','응축','침전'],a:0,ex:'교재는 고온의 연기와 롤오버를 플래시오버의 대표적 전조로 제시합니다.',source:'소방전술1(화재1) 30~33쪽'},
{id:'b-f03-flow-1',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C07',q:'Flow Path 설명으로 가장 적절한 것은?',choices:['화점실의 열·연기가 압력이 더 낮은 개구부 쪽으로 이동하는 흐름','연기가 반드시 바닥으로만 이동하는 현상','소화약제가 배관을 따라 이동하는 현상','화염 없이 온도만 낮아지는 현상'],a:0,ex:'교재는 양압의 화점실에서 열·연기가 압력이 낮은 문·창문 등으로 이동하는 흐름으로 설명합니다.',source:'소방전술1(화재1) 33~34쪽'},
{id:'b-f03-explosion-1',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C08',q:'폭연과 폭굉의 전파속도 비교로 맞는 것은?',choices:['폭연은 음속보다 느리고 폭굉은 음속보다 빠르다','둘 다 항상 음속과 같다','폭연이 음속보다 빠르고 폭굉이 느리다','전파속도로는 구분하지 않는다'],a:0,ex:'공식 교재는 폭연을 음속보다 느린 전파, 폭굉을 음속보다 빠른 충격파 전파로 구분합니다.',source:'소방전술1(화재2) 352~353쪽'},
{id:'b-f03-explosion-2',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C08',q:'공식 교재가 구분한 폭발 영향 4가지 조합은?',choices:['압력·비산·열·지진','냉각·질식·제거·부촉매','예방·대비·대응·복구','압축·팽창·응축·증발'],a:0,ex:'폭발의 영향은 압력, 비산, 열, 지진으로 구분되어 설명됩니다.',source:'소방전술1(화재2) 350~351쪽'},
{id:'b-f04-ext-1',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C01',q:'연쇄반응을 지배하는 라디칼 반응을 억제하는 소화원리는?',choices:['부촉매소화','냉각소화','제거소화','유화소화'],a:0,ex:'부촉매소화는 화학적 연쇄반응을 차단하는 소화방법입니다.',source:'소방전술1(화재2) 184쪽'},
{id:'b-f04-ext-2',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C01',q:'가연물을 제거·격리하거나 공급을 차단하는 소화원리는?',choices:['제거소화','질식소화','냉각소화','부촉매소화'],a:0,ex:'제거소화는 가연물을 화원에서 격리하거나 공급을 차단하는 방식입니다.',source:'소방전술1(화재2) 183쪽'},
{id:'b-f04-powder-1',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C08',q:'제3종 분말 소화약제의 주성분과 적응화재 조합으로 맞는 것은?',choices:['제1인산암모늄 · A/B/C급','탄산수소나트륨 · A급만','탄산수소칼륨 · A급만','이산화탄소 · D급만'],a:0,ex:'제3종 분말은 제1인산암모늄을 주성분으로 하고 A·B·C급 화재에 적응합니다.',source:'소방전술1(화재2) 241쪽 · 표 2-16'},
{id:'b-f04-powder-2',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C08',q:'다음 중 ABC 분말에 해당하는 것은?',choices:['제3종 분말','제1종 분말','제2종 분말','제4종 분말'],a:0,ex:'교재는 제3종 분말을 ABC 분말로, 제1·2·4종을 BC 분말로 구분합니다.',source:'소방전술1(화재2) 241쪽'},
{id:'b-e01-ems-1',grade:'B',subject:'ems',scopeId:'E01',conceptId:'E01-C01',q:'응급의료서비스 체계에 대한 설명으로 맞는 것은?',choices:['응급상황에서 필요한 인력·장비 등을 효과적으로 조직하여 운영하는 체계','병원 내부 진료만을 뜻한다','구급차 운전만을 뜻한다','환자 발견 이전 단계만을 뜻한다'],a:0,ex:'공식 교재는 응급상황에서 환자를 치료하기 위한 인력·장비 등을 효과적으로 조직·운영하는 체계로 설명합니다.',source:'소방전술3(구급) 4쪽'},
{id:'b-e06-position-1',grade:'B',subject:'ems',scopeId:'E06',conceptId:'E06-C05',q:'공식 구급 교재에서 쇼크 환자 이송 자세로 제시하는 것은?',choices:['다리를 약 20~30cm 올린 바로누운 자세','항상 엎드린 자세','무조건 좌위','머리를 가장 높인 자세'],a:0,ex:'교재는 쇼크 환자 이송 시 다리를 약 20~30cm 올린 바로누운 자세를 제시합니다.',source:'소방전술3(구급) 102쪽'},
{id:'b-e11-arrest-1',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C03',q:'공식 교재가 설명하는 심장마비 환자의 대표 상태 조합은?',choices:['맥박 없음·호흡 없음·무의식','맥박 정상·호흡 정상·완전 의식','맥박만 증가·의식 명료','호흡만 빠르고 맥박 정상'],a:0,ex:'교재는 심장마비 환자에서 맥박과 호흡이 없고 무의식 상태가 나타난다고 설명합니다.',source:'소방전술3(구급) 205~206쪽'},
{id:'b-e12-abd-1',grade:'B',subject:'ems',scopeId:'E12',conceptId:'E12-C03',q:'급성 복통 환자 정보 수집에 교재가 제시하는 문진 방식은?',choices:['OPQRST와 SAMPLE','RACE와 PASS','START만','CAB만'],a:0,ex:'급성 복통 장의 학습목표에는 OPQRST와 SAMPLE을 이용한 정보 및 병력 수집이 포함됩니다.',source:'소방전술3(구급) 216쪽'},
{id:'b-e13-bleed-1',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C03',q:'동맥 출혈의 특징으로 가장 적절한 것은?',choices:['선홍색 혈액이 심박동에 맞춰 뿜어져 나올 수 있다','항상 검붉고 천천히 스며 나온다','지혈이 항상 매우 쉽다','찰과상에서만 발생한다'],a:0,ex:'교재는 동맥 출혈을 선홍색 혈액이 심박동에 맞춰 뿜어져 나올 수 있는 형태로 설명합니다.',source:'소방전술3(구급) 228쪽'},
{id:'b-e17-seizure-1',grade:'B',subject:'ems',scopeId:'E17',conceptId:'E17-C03',q:'경련 환자 응급처치로 적절한 것은?',choices:['입에 물건을 강제로 넣지 않고 신체를 억지로 구속하지 않는다','혀 보호를 위해 단단한 물건을 넣는다','사지를 강하게 고정한다','기도와 호흡 확인을 하지 않는다'],a:0,ex:'교재는 경련 환자의 입에 물건을 강제로 넣거나 신체를 억지로 구속하지 않도록 제시합니다.',source:'소방전술3(구급) 314쪽'},
{id:'b-e24-bls-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C01',q:'무반응 환자에서 기본소생술 초기 흐름으로 맞는 것은?',choices:['119 신고와 AED 요청으로 연결한다','먼저 10분간 기다린다','반드시 병력문진을 끝낸 뒤 신고한다','호흡이 비정상이어도 관찰만 한다'],a:0,ex:'교재는 무반응이면 즉시 119 신고와 AED 요청으로 연결하도록 제시합니다.',source:'소방전술3(구급) 404~406쪽'},
{id:'b-e24-bls-2',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C01',q:'의료제공자가 심정지 의심 환자의 호흡과 목동맥 맥박을 확인하는 시간 기준은?',choices:['5~10초 이내','30초 이상','1분 이상','시간 제한 없음'],a:0,ex:'교재는 의료제공자가 호흡과 맥박을 5~10초 이내에 확인하도록 제시합니다.',source:'소방전술3(구급) 406쪽'},
{id:'b-e24-airway-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',q:'머리·목·척추 손상이 의심되는 환자의 기도개방법으로 적절한 것은?',choices:['턱 밀어올리기법','과도한 머리젖힘','복부밀어내기만 시행','기도개방을 하지 않는다'],a:0,ex:'교재는 머리·목·척추 손상이 의심되면 턱 밀어올리기법을 사용하도록 설명합니다.',source:'소방전술3(구급) 409쪽'},
{id:'b-e24-breath-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',q:'기본소생술 인공호흡 권장으로 맞는 것은?',choices:['1회 약 1초씩 총 2회, 가슴 상승이 보일 정도','한 번에 10초씩 강하게','가슴 상승과 관계없이 최대량','항상 과환기를 유도'],a:0,ex:'교재는 1회 1초간 총 2회, 가슴 상승이 보일 정도로 시행하고 과환기를 피하도록 제시합니다.',source:'소방전술3(구급) 409쪽'},
{id:'b-e24-compress-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C03',q:'성인 가슴압박 속도 기준으로 맞는 것은?',choices:['분당 100~120회','분당 40~60회','분당 60~80회','분당 150회 이상'],a:0,ex:'교재는 성인 가슴압박 속도를 분당 100~120회로 제시합니다.',source:'소방전술3(구급) 407·412쪽'},
{id:'b-e24-compress-2',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C03',q:'성인 가슴압박 깊이로 교재가 제시하는 값은?',choices:['약 5cm','약 1cm','약 10cm','깊이는 고려하지 않음'],a:0,ex:'교재는 보통 체격의 성인에서 가슴압박 깊이를 약 5cm로 제시합니다.',source:'소방전술3(구급) 412쪽'},
{id:'b-e24-cpr-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C04',q:'성인 심폐소생술에서 가슴압박과 인공호흡 비율은?',choices:['30:2','15:1','5:1','10:2'],a:0,ex:'교재는 성인의 경우 구조자 수와 관계없이 30:2를 유지하도록 제시합니다.',source:'소방전술3(구급) 413~414쪽'},
{id:'b-e24-cpr-2',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C04',q:'필수 처치로 가슴압박 중단이 필요할 때 교재가 제시하는 원칙은?',choices:['10초 이상 중단하지 않도록 한다','1분 이상 중단한다','중단시간은 중요하지 않다','매 주기 30초 중단한다'],a:0,ex:'교재는 맥박확인·제세동 등으로 중단이 불가피해도 10초 이상 중단하지 않도록 제시합니다.',source:'소방전술3(구급) 413~414쪽'}
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const fingerprints=new Set();
V.questions=Q.filter(q=>{const fp=norm(q.q);if(fingerprints.has(fp))return false;fingerprints.add(fp);return q.choices.length===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<q.choices.length&&new Set(q.choices.map(norm)).size===q.choices.length});
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.examReadiness=()=>{const verified=V.questions.filter(q=>q.grade==='A'||q.grade==='B');const fire=new Set(verified.filter(q=>q.subject==='fire').map(q=>q.id)).size,ems=new Set(verified.filter(q=>q.subject==='ems').map(q=>q.id)).size;return{fire,ems,ready:fire>=25&&ems>=40,fireNeed:Math.max(0,25-fire),emsNeed:Math.max(0,40-ems)}};
})();

;

/* --- verified-expansion.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const P={
'F01-C02':{status:'verified',summary:'소방력은 소방업무 수행에 필요한 인력·장비 등 인적·물적 자원의 총체다.',detail:['소방기본법 교재는 소방기관이 업무를 수행하는 데 필요한 인력과 장비 등에 관한 기준을 소방력의 기준으로 설명한다.','교재상 소방력의 3요소는 소방대(인력), 소방차량·각종 장비, 소방용수로 정리된다.'],must:['소방력 기준 → 행정안전부령','3요소 → 인력 · 장비 · 소방용수'],traps:['소방력을 인력만으로 한정한 선지에 주의한다.'],compare:[],flow:[],source:'소방법령2 · 소방기본법 68쪽'},
'F01-C03':{status:'verified',summary:'소방용수시설은 소화전·급수탑·저수조를 중심으로 설치·관리한다.',detail:['시·도지사는 소방활동에 필요한 소화전·급수탑·저수조를 설치하고 유지·관리하여야 한다.','소방활동의 기본 요소 중 소방용수는 진압활동에 필수적인 자원으로 다뤄진다.'],must:['소방용수시설 → 소화전 · 급수탑 · 저수조','시·도지사 → 설치·유지·관리'],traps:['비상소화장치와 법에서 정의한 소방용수시설 3종을 혼동하지 않는다.'],compare:[],flow:[],source:'소방법령2 · 소방기본법 89쪽'},
'F01-C04':{status:'verified',summary:'소방활동은 화재진압·인명구조·구급 등 위급상황 대응활동과 현장 권한을 포함한다.',detail:['소방청장·소방본부장·소방서장은 위급한 상황에서 소방대를 신속히 출동시켜 화재진압과 인명구조·구급 등 필요한 활동을 하게 하여야 한다.','소방대장은 현장에 소방활동구역을 정해 필요한 사람 외에는 출입을 제한할 수 있다.','사람의 생명이 위험하다고 인정되는 경우 소방본부장·소방서장·소방대장은 일정 구역 밖으로 피난할 것을 명할 수 있다.'],must:['소방활동 → 화재진압 · 인명구조 · 구급','소방활동구역 설정 → 소방대장','피난명령 → 소방본부장·소방서장·소방대장'],traps:['소방활동구역 설정권자를 일반 관계인으로 바꾼 선지에 주의한다.'],compare:[],flow:[],source:'소방법령2 · 소방기본법 105, 146, 157쪽'},
'F01-C05':{status:'verified',summary:'의용소방대는 지역 공동체의 자율적 봉사와 소방활동 지원을 제도화한 조직이다.',detail:['소방기본법은 의용소방대의 설치 및 운영에 관하여 별도의 법률로 정하도록 하고 있다.','전국의용소방대연합회는 재난관리를 위한 자율적 봉사활동의 효율적 운영과 상호협조 증진을 위해 설립할 수 있다.'],must:['설치·운영 → 별도 법률','전국연합회 → 자율적 봉사활동 효율·협조 증진'],traps:['의용소방대를 소방서의 내부 직제와 동일하게 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방법령2 · 소방기본법 175, 193쪽'},
'F02-C03':{status:'verified',summary:'재난관리 조직은 중요정책 심의·총괄조정과 실제 재난 대응·복구 수습기능을 나누어 수행한다.',detail:['중앙안전관리위원회는 재난 및 안전관리에 관한 중요정책 등을 심의하기 위하여 국무총리 소속으로 둔다.','대규모 재난의 대응·복구 등을 총괄·조정하기 위하여 행정안전부에 중앙재난안전대책본부를 둔다.'],must:['중앙안전관리위원회 → 국무총리 소속','중앙재난안전대책본부 → 행정안전부','중앙대책본부장 → 원칙적으로 행정안전부장관'],traps:['심의기구와 재난수습기구의 역할·소속을 뒤바꾼 선지에 주의한다.'],compare:[['중앙안전관리위원회','중요 정책 심의·총괄조정'],['중앙재난안전대책본부','대규모 재난 대응·복구 총괄·조정']],flow:[],source:'소방법령5 · 재난 및 안전관리 기본법 524, 533쪽'},
'F02-C04':{status:'verified',summary:'재난 예방은 위험요인을 사전에 평가·분석하고 제거하여 재난발생 위험성을 줄이는 활동이다.',detail:['교재는 재난의 예방을 발생 가능한 위험성 평가·분석, 위험요인 제거, 관련법 정비, 예방정책 수립·시행 등을 통해 위험성을 사전에 제거하기 위한 활동으로 설명한다.','재난관리책임기관의 장은 재난대응 조직 정비, 예측정보 체계 구축, 교육·훈련과 예방홍보, 안전관리체계 구축 등의 예방조치를 해야 한다.'],must:['예방 → 재난발생 위험성의 사전 제거','책임기관 → 조직·예측·교육훈련·안전체계 등 예방조치'],traps:['재난 예방을 재난 발생 후 피해복구로 설명한 선지에 주의한다.'],compare:[],flow:['위험성 평가·분석','위험요인 제거','예방정책·체계 구축'],source:'소방법령5 · 재난 및 안전관리 기본법 550쪽'},
'F02-C05':{status:'verified',summary:'재난 대비는 자원·통신·매뉴얼·훈련을 사전에 준비하고 대응·복구로 이어지게 하는 단계다.',detail:['재난관리책임기관의 장은 필요한 물품·재산·인력 등 재난관리자원을 비축하거나 지정하여 체계적으로 관리해야 한다.','통신 두절에 대비해 유선·무선·위성통신망을 활용할 긴급통신수단을 마련해야 한다.','훈련주관기관은 관계기관 합동 재난대비훈련을 소관 분야별로 연 1회 이상 실시하여야 한다.'],must:['재난관리자원 → 물적·인적 자원','통신두절 대비 → 긴급통신수단','합동 재난대비훈련 → 연 1회 이상'],traps:['재난 대비를 현장 응급조치가 시작된 뒤에만 하는 단계로 한정하지 않는다.'],compare:[],flow:['자원·통신 확보','위기관리 매뉴얼','재난대비훈련','재난 대응','복구'],source:'소방법령5 · 재난 및 안전관리 기본법 565~570쪽'},
'F02-C06':{status:'verified',summary:'긴급구조는 재난 우려 또는 발생 시 국민의 생명·신체·재산을 보호하기 위한 긴급한 인명구조·응급처치 등이다.',detail:['긴급구조기관과 긴급구조지원기관이 인명구조·응급처치와 그 밖의 필요한 긴급조치를 수행한다.','긴급구조의 총괄·조정과 역할분담·지휘통제를 위해 소방청에 중앙긴급구조통제단을 두며 단장은 소방청장이다.','재난현장에서는 원칙적으로 시·군·구 긴급구조통제단장이 긴급구조활동을 지휘한다.'],must:['중앙긴급구조통제단 → 소방청','중앙통제단장 → 소방청장','현장지휘 → 원칙적으로 시·군·구 긴급구조통제단장'],traps:['중앙통제단을 행정안전부 내부 조직으로 바꾼 선지에 주의한다.'],compare:[],flow:[],source:'소방법령5 · 재난 및 안전관리 기본법 581, 585쪽'},
'F02-C07':{status:'verified',summary:'재난안전상황실은 재난정보 수집·전파, 상황관리, 초동조치와 지휘를 담당한다.',detail:['행정안전부에는 중앙재난안전상황실을, 시·도 및 시·군·구에는 각각 재난안전상황실을 설치·운영한다.','각 상황실은 다른 기관 상황실과 유기적 협조체계를 유지하고 재난관리정보를 공유해야 한다.'],must:['행정안전부 → 중앙재난안전상황실','시·도·시군구 → 해당 재난안전상황실'],traps:['상황실 기능을 사후 피해조사만으로 한정한 선지에 주의한다.'],compare:[],flow:['정보 수집·전파','상황관리','초동조치','지휘·협조'],source:'소방법령5 · 재난 및 안전관리 기본법 540쪽'},
'F03-C02':{status:'verified',summary:'화재의 열은 전도·대류·복사 형태로 전달되며 구획실 화재성장에 복사가 중요한 역할을 한다.',detail:['초기 화염에서 상승하는 열은 대류에 의해 전달되고, 뜨거운 가스가 다른 가연물 표면을 지날 때 열이 전달된다.','천장부 고온 가스층에서 방출되는 복사에너지는 다른 가연물을 열분해시키고 플래시오버로의 전환에 영향을 준다.'],must:['열 전달 → 전도 · 대류 · 복사','구획실 성장기→최성기 전환 → 복사열 중요'],traps:['열 전달을 한 가지 방식으로만 설명한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재1) 9~13, 23쪽'},
'F03-C03':{status:'verified',summary:'연소는 자체 지속적인 발열 화학반응이며 급격한 산화과정은 화재로 나타날 수 있다.',detail:['연소는 동일한 형태의 반응을 계속 일으킬 에너지와 생성물을 만드는 자체 지속적 화학반응으로 설명된다.','소화이론에서는 열·산소·가연물·연쇄반응의 4요소가 상호작용하며 어느 하나를 제거하면 연소가 중단된다고 설명한다.'],must:['연소 4요소 → 열 · 산소 · 가연물 · 연쇄반응'],traps:['연소 4요소에서 연쇄반응을 제외한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재1) 14~17, 35쪽'},
'F03-C04':{status:'verified',summary:'구획실 화재는 발화기·성장기·플래시오버·최성기·쇠퇴기로 진행한다.',detail:['발화 후 다른 가연물로 열이 전달되면서 화재가 성장한다.','교재는 구획실 화재를 발화기, 성장기, 플래시오버, 최성기, 쇠퇴기로 구분한다.'],must:['발화기 → 성장기 → 플래시오버 → 최성기 → 쇠퇴기'],traps:['플래시오버의 위치를 최성기 이후로 옮긴 선지에 주의한다.'],compare:[],flow:['발화기','성장기','플래시오버','최성기','쇠퇴기'],source:'소방전술1(화재1) 18~21쪽'},
'F03-C05':{status:'verified',summary:'구획실 화재 진행은 환기·구획 크기·열특성·천장높이·가연물 조건의 영향을 받는다.',detail:['교재는 배연구의 크기·수·위치, 구획실 크기, 주변 재료의 열특성, 천장높이, 최초 가연물의 크기·성질·위치, 추가 가연물의 이용 가능성과 위치 등을 영향요인으로 제시한다.'],must:['환기구','구획 크기','열특성','천장높이','최초·추가 가연물'],traps:['화재 진행이 가연물의 위치나 환기조건과 무관하다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재1) 22쪽'},
'F04-C03':{status:'verified',summary:'물은 높은 비열과 증발잠열로 냉각효과가 우수한 대표적 수계 소화약제다.',detail:['물은 구하기 쉽고 비열과 증발잠열이 커 냉각효과가 우수하며 운송이 쉽다는 장점이 있다.','A급 일반화재에는 우수하지만 B급 유류·가스화재에서는 화재 확대 우려가 있고 C급 전기화재에서는 감전 위험에 주의해야 한다.'],must:['주효과 → 냉각','A급 적응 우수','B급 확대 위험 가능','C급 감전 위험 주의'],traps:['모든 화재에 물을 무조건 안전하게 적용할 수 있다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 189~198쪽'},
'F04-C04':{status:'verified',summary:'포 소화약제는 연소면을 덮어 산소 접촉을 차단하고 포함된 물로 냉각한다.',detail:['포는 유류보다 가벼운 기포 집합체로 연소물 표면을 덮어 질식효과를 내며 물에 의한 냉각효과도 나타낸다.','유류화재에 특히 효과적이며 일반화재에도 사용할 수 있다.'],must:['포 → 질식 + 냉각','유류화재에 효과적'],traps:['포의 주효과를 부촉매만으로 설명한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 199~211쪽'},
'F04-C05':{status:'verified',summary:'이산화탄소는 질식효과가 크고 잔류 오염이 없는 가스계 소화약제다.',detail:['이산화탄소는 불활성 기체로 가장 큰 소화효과는 질식이며 약간의 냉각효과도 있다.','주로 B급 유류화재와 C급 전기화재에 사용하며 밀폐 상태에서는 A급에도 사용할 수 있다.'],must:['주효과 → 질식','B·C급 주사용','사용 후 오염 없음'],traps:['이산화탄소의 가장 큰 소화효과를 냉각으로 바꾼 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 212~218쪽'},
'F04-C06':{status:'verified',summary:'할론 소화약제는 연쇄반응을 차단하는 부촉매·억제소화가 핵심이다.',detail:['할론은 탄화수소의 수소 일부 또는 전부가 할로겐족 원소로 치환된 화합물이다.','연소 4요소 중 연쇄반응을 차단하여 소화하며 이를 부촉매소화 또는 억제소화라 한다.'],must:['할론 → 연쇄반응 차단','부촉매/억제소화'],traps:['할론의 핵심 소화기구를 단순 냉각으로 설명한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 219~228쪽'},
'F04-C07':{status:'verified',summary:'할론 대체용 할로겐화합물·불활성기체 소화약제는 비전도성과 잔류물 최소화가 중요한 특성이다.',detail:['할론의 오존층 영향 때문에 대체 소화약제 개발이 추진되었다.','대체물질은 할로겐화합물 또는 불활성기체 계열로 전기적으로 비전도성이며 증발 후 잔여물을 남기지 않는 약제를 포함한다.'],must:['비전도성','잔류물 없음/적음','할론 대체 목적'],traps:['대체 가스계 약제가 전기전도성이 높다고 설명한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술1(화재2) 229~239쪽'},
'E08-C02':{status:'verified',summary:'1차 평가는 치명적 문제를 빠르게 찾아 즉시 처치와 이송 우선순위를 정한다.',detail:['1차 평가는 첫인상, 의식수준, 기도, 호흡, 순환, 위급정도 판단 순으로 단계적으로 진행한다.','평가 과정에서 치명적 상태가 발견되면 평가와 동시에 즉각적인 처치를 제공한다.'],must:['첫인상 → 의식 → 기도 → 호흡 → 순환 → 위급정도'],traps:['치명적 문제 처치를 모든 평가가 끝날 때까지 미루는 선지에 주의한다.'],compare:[],flow:['첫인상','의식수준','기도','호흡','순환','위급정도'],source:'소방전술3(구급) 137쪽'},
'E08-C03':{status:'verified',summary:'2차 평가는 병력과 생체징후를 중심으로 1차 평가 이후 환자를 더 자세히 확인한다.',detail:['2차 평가의 중요한 두 부분은 병력과 생체징후 평가다.','SAMPLE 형식은 현재 문제에 영향을 줄 수 있는 과거력을 구조화해 수집하는 방법이다.'],must:['2차 평가 → 병력 + 생체징후','병력수집 → SAMPLE'],traps:['2차 평가에서 생체징후가 중요하지 않다고 한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 143쪽'},
'E08-C06':{status:'verified',summary:'재평가는 환자상태와 처치효과 변화를 반복 확인하는 과정이다.',detail:['환자상태는 악화 또는 호전될 수 있어 재평가가 필요하다.','교재는 보통 환자는 약 15분마다, 위급한 환자는 약 5분마다 재평가하도록 제시한다.'],must:['일반 환자 → 약 15분','위급 환자 → 약 5분'],traps:['위급환자의 재평가 간격을 더 길게 잡는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 129, 160쪽'},
'E09-C04':{status:'verified',summary:'기도유지 보조기구는 의식과 구역반사 여부에 맞춰 선택해야 한다.',detail:['입인두기도기는 구역반사가 없는 무의식 환자에게 사용할 수 있다.','삽입 중 구역반사가 나타나면 즉시 중단하고 기도기를 사용해서는 안 된다.'],must:['OPA → 구역반사 없는 무의식 환자'],traps:['의식이 있고 구역반사가 있는 환자에게 입인두기도기를 강제로 삽입하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 168쪽'},
'E09-C06':{status:'verified',summary:'흡인은 기도 내 혈액·구토물·분비물을 제거하되 산소공급 중단시간을 최소화한다.',detail:['상기도에서 그렁거리는 소리가 들리면 흡인이 필요할 수 있다.','성인은 한 번에 15초 이상 흡인하지 않도록 교재가 제시한다.'],must:['성인 1회 흡인 → 15초 이상 금지'],traps:['흡인을 오래할수록 좋다고 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 179~181쪽'},
'E10-C02':{status:'verified',summary:'정상 호흡수와 호흡양상은 연령에 따라 다르며 수·규칙성·양상을 함께 본다.',detail:['교재 표는 정상 호흡수를 성인 12~20회/분, 아동 15~30회/분, 유아 25~50회/분으로 제시한다.','비정상호흡은 횟수뿐 아니라 불규칙성, 비대칭 가슴팽창, 과도한 호흡노력 등으로 평가한다.'],must:['성인 12~20','아동 15~30','유아 25~50 회/분'],traps:['연령과 관계없이 동일한 정상호흡수를 적용하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 193쪽'},
'E10-C05':{status:'verified',summary:'연기흡입은 저산소증·독성물질·열손상이 복합되어 기도부종과 폐쇄로 악화될 수 있다.',detail:['호흡기계 손상의 주요 요소로 연기흡입, 연소 독성물질 흡입, 가열된 공기·증기·불꽃에 의한 화상이 제시된다.','입·코 주변 그을음이나 코털·머리카락 그을림 등은 연기흡입을 의심하게 하는 단서다.'],must:['연기흡입','독성물질 흡입','기도 열손상/화상'],traps:['밀폐공간 화재환자에서 입·코 주변 그을음을 무시하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 198쪽'},
'E14-C02':{status:'verified',summary:'연부조직 손상은 피부표면이 유지되는 폐쇄성과 피부가 찢어진 개방성으로 구분한다.',detail:['피부표면 아래 조직은 손상됐지만 피부가 찢기지 않은 경우 폐쇄성 손상이다.','피부표면이 찢어진 경우 개방성 손상으로 구분한다.'],must:['폐쇄성 → 피부표면 유지','개방성 → 피부표면 파열'],traps:['혈종·타박상이 반드시 개방성 손상이라는 선지에 주의한다.'],compare:[['폐쇄성','피부표면은 찢기지 않음'],['개방성','피부표면이 찢어짐']],flow:[],source:'소방전술3(구급) 242쪽'},
'E14-C03':{status:'verified',summary:'중증 화상은 기도손상·호흡장애와 체액손실·감염 위험을 함께 고려한다.',detail:['교재는 화상 현장사망의 주요 원인으로 기도손상과 호흡장애를 강조한다.','지연 사망은 체액손실에 따른 쇼크와 감염과 연관되어 신속한 평가·처치·이송이 중요하다.'],must:['현장 → 기도·호흡 우선','지연 위험 → 체액손실 쇼크·감염'],traps:['피부 손상 면적만 보고 기도손상을 평가하지 않는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 255쪽'},
'E15-C01':{status:'verified',summary:'근골격계는 인체 형태 유지, 내부장기 보호, 움직임 제공의 기능을 수행한다.',detail:['교재는 근골격의 주요 기능을 인체 외형 형성, 내부 장기 보호, 인체 움직임 제공으로 정리한다.'],must:['형태 형성','장기 보호','움직임 제공'],traps:['근골격계 기능을 혈액 산소교환으로 설명한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 266쪽'},
'E15-C02':{status:'verified',summary:'골절은 변형뿐 아니라 상당한 내부출혈을 유발할 수 있어 쇼크 위험을 함께 본다.',detail:['교재는 단순 골절에서도 정강뼈·종아리뼈 약 500cc, 넙다리뼈 약 1,000cc, 골반골절 약 1,500~3,000cc 정도의 실혈 가능성을 제시한다.'],must:['넙다리뼈 골절 → 약 1,000cc','골반 골절 → 약 1,500~3,000cc'],traps:['폐쇄 골절은 출혈 위험이 없다고 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 269쪽'},
'E15-C03':{status:'verified',summary:'부목은 추가손상과 통증을 줄이기 위한 안정화 수단이며 생명위협 처치보다 앞설 수 없다.',detail:['부목의 목적은 추가 손상 방지와 통증 감소를 위해 손상부위를 안정시키는 것이다.','치명적인 상태가 있으면 부목고정보다 필요한 처치와 이송이 우선한다.'],must:['부목 목적 → 안정화·추가손상 방지·통증감소','치명적 상태 → 처치/이송 우선'],traps:['생명위협을 무시하고 부목을 먼저 적용한다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 274쪽'},
'E16-C02':{status:'verified',summary:'척추손상에서 가장 위험한 문제는 척수손상이며 특히 목뼈 손상은 호흡까지 위협할 수 있다.',detail:['척수손상은 손상부위 아래 신경기능의 상실과 영구적 마비를 초래할 수 있다.','심한 목뼈손상은 호흡근을 통제하는 신경에 영향을 주어 호흡정지를 일으킬 수 있다.'],must:['척추손상 핵심 위험 → 척수손상','심한 경추손상 → 호흡정지 가능'],traps:['척추뼈 손상과 척수손상을 완전히 동일한 개념으로 단정하지 않는다.'],compare:[],flow:[],source:'소방전술3(구급) 287쪽'},
'E16-C03':{status:'verified',summary:'머리손상에서는 뇌손상과 기도위험, 두개골 골절 징후를 함께 평가한다.',detail:['머리뼈 손상 징후에는 함몰 변형, 귀·코에서 혈액이나 맑은 액체 배출, 눈 주위 반상출혈, 귀 뒤 꼭지돌기 반상출혈 등이 포함된다.','안면 손상은 출혈·부종·변형으로 상부기도를 부분 또는 완전 폐쇄시킬 수 있다.'],must:['코·귀의 혈액/맑은 액체','너구리눈','Battle sign'],traps:['머리손상에서 맑은 액체 누출을 단순 콧물로 단정하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 299쪽'},
'E16-C04':{status:'verified',summary:'헬멧은 무조건 제거하지 않고 기도·호흡·평가와 제거 위험을 비교해 결정한다.',detail:['헬멧이 환자평가나 기도·호흡 관찰에 방해가 되지 않고 현재 기도·호흡 문제가 없으며 제거가 더 큰 위험을 초래한다면 제거하지 않을 수 있다.'],must:['기도·호흡 방해 여부','평가 방해 여부','제거 자체 위험'],traps:['헬멧 착용 환자는 모두 현장에서 즉시 제거한다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 302쪽'},
'E17-C01':{status:'verified',summary:'의식장애에서는 원인 단정보다 ABC 평가·처치와 신속한 이송이 우선이다.',detail:['의식장애 원인에는 머리손상, 감염, 경련, 쇼크, 중독, 저산소증, 뇌졸중, 당뇨 등 다양한 상태가 있다.','원인의 의학적 진단은 의사의 영역이며 구급대원은 기도·호흡·순환 평가와 처치 및 이송에 집중한다.'],must:['의식장애 → ABC 우선','원인 진단보다 평가·처치·이송'],traps:['현장에서 원인을 확정진단한 뒤에만 ABC 처치를 시작한다는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 305~306쪽'},
'E18-C01':{status:'verified',summary:'중독현장은 환자 접근 전에 구조자의 안전과 개인보호장비를 먼저 확보한다.',detail:['중독은 구강·흡입·피부 등 여러 경로로 노출될 수 있으며 현장 물질 자체가 구조자에게도 위험할 수 있다.','약물중독 환자 처치에서도 우선 개인안전을 확인하고 적절한 개인보호장비를 착용해야 한다.'],must:['중독현장 → 대원 안전 먼저','PPE 착용'],traps:['환자 접촉을 위해 구조자 안전확인을 생략하는 선지에 주의한다.'],compare:[],flow:['현장안전','PPE','환자평가','독성물질 확인·제거','재평가·이송'],source:'소방전술3(구급) 315~318쪽'},
'E18-C02':{status:'verified',summary:'심한 알레르기 반응은 기도부종과 혈관이완으로 호흡부전·과민성 쇼크로 진행할 수 있다.',detail:['과도한 면역반응은 얼굴·목·혀·상기도·세기관지 등에 부종을 일으킬 수 있다.','기도폐쇄와 혈관 이완은 쇼크를 악화시킬 수 있다.'],must:['기도부종','혈관이완','과민성 쇼크 가능'],traps:['알레르기 반응을 피부증상만 있는 상태로 한정하지 않는다.'],compare:[],flow:[],source:'소방전술3(구급) 319쪽'},
'E19-C01':{status:'verified',summary:'체온은 열생산과 열손실의 균형으로 유지되며 복사·전도·대류·기화가 중요한 열손실 기전이다.',detail:['인체는 중심체온 약 37℃를 유지하려고 한다.','찬물에서의 열손실은 대기보다 약 25배 빠르게 진행될 수 있다고 교재가 설명한다.'],must:['복사 · 전도 · 대류 · 기화','중심체온 약 37℃','찬물 열손실 ≈ 대기보다 25배 빠름'],traps:['물과 공기에서 열손실 속도가 같다고 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 322쪽'},
'E19-C02':{status:'verified',summary:'전신 저체온증은 중심체온 저하에 따라 오한·의식·호흡·순환 변화가 단계적으로 심해진다.',detail:['교재는 일반적인 저체온증을 체온 35℃ 이하로 설명한다.','중심체온이 낮아질수록 의식저하·근육경직·느린 호흡과 맥박·심장기능 장애 등 위험이 커진다.'],must:['저체온증 → 35℃ 이하'],traps:['정상 중심체온 상태를 저체온증으로 분류한 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 323쪽'},
'E19-C04':{status:'verified',summary:'익수환자는 수중 노출시간, 저산소증, 척추손상 가능성을 함께 평가한다.',detail:['교재는 익사를 물에 잠긴 뒤 질식으로 사망한 경우, 익수를 물에 잠긴 후 최종결과와 관계없이 일시적으로라도 생존한 경우로 설명한다.','생존율은 물속에 있던 시간, 손상 여부, 수온 등의 영향을 받는다.'],must:['수중 노출시간','척추손상 가능성','저산소증'],traps:['다이빙이나 사고경위 불명 환자에서 척추손상 가능성을 배제하지 않는다.'],compare:[['익사','물에 잠긴 뒤 질식으로 사망'],['익수','잠긴 뒤 일시적으로라도 생존']],flow:[],source:'소방전술3(구급) 333쪽'},
'E19-C05':{status:'verified',summary:'곤충 쏘임은 독침 제거 방식과 전신 알레르기 반응 관찰이 중요하다.',detail:['꿀벌 침이 남아 있다면 교재는 신용카드 가장자리처럼 긁는 방식으로 제거하고 집게로 짜내지 않도록 제시한다.','전신 알레르기 반응 또는 아나필락시스 징후를 지속 관찰한다.'],must:['벌침 → 긁어서 제거','아나필락시스 관찰'],traps:['족집게로 독침을 강하게 집어 짜는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 338쪽'},
'E20-C02':{status:'verified',summary:'분만은 자궁수축 시작부터 태반 만출까지 3단계로 구분한다.',detail:['1기는 자궁수축 시작부터 자궁경부가 완전히 열릴 때까지다.','2기는 태아가 분만경로로 들어와 만출될 때까지, 3기는 태아 만출 후 태반 등 적출물이 나올 때까지다.'],must:['1기 → 경부 완전 개대까지','2기 → 태아 만출까지','3기 → 태반 만출'],traps:['태반 만출을 분만 2기로 바꾼 선지에 주의한다.'],compare:[],flow:['1기 자궁경부 개대','2기 태아 만출','3기 태반 만출'],source:'소방전술3(구급) 343쪽'},
'E20-C04':{status:'verified',summary:'분만 합병증과 산후출혈은 산모뿐 아니라 태아의 산소공급과 쇼크 위험까지 고려한다.',detail:['제대탈출은 제대가 태아보다 먼저 나와 산도에서 압박될 수 있어 태아 산소공급을 위협하는 응급상황이다.','분만 후 출혈이 계속되면 자궁마사지, 산소공급, 쇼크 처치와 신속한 이송이 필요할 수 있다.'],must:['제대탈출 → 태아 산소공급 위협','지속 산후출혈 → 쇼크 주의'],traps:['제대탈출을 단순 정상 분만 과정으로 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 354~358쪽'},
'E20-C05':{status:'verified',summary:'임신 중 출혈·경련 등은 임신주수와 산모·태아 상태를 함께 평가해야 한다.',detail:['교재는 자연유산을 임신 20주 내 유산으로 설명한다.','임신 중 경련은 태아의 산소공급에도 영향을 줄 수 있어 기도·호흡과 생체징후를 신속히 평가한다.'],must:['자연유산 → 임신 20주 내','임신 중 경련 → 기도·호흡 평가 중요'],traps:['임신 중 경련을 산모에게만 영향을 주는 상태로 한정하지 않는다.'],compare:[],flow:[],source:'소방전술3(구급) 359~360쪽'},
'E21-C02':{status:'verified',summary:'소아는 큰 혀·좁고 유연한 기도·큰 머리 등 성인과 다른 해부생리 특성이 처치에 영향을 준다.',detail:['소아는 상대적으로 혀가 크고 기도가 좁아 폐쇄 위험이 높다.','짧고 유연한 기관은 머리·목의 과신전으로도 폐쇄될 수 있어 중립에 가까운 기도유지가 중요하다.','체표면적이 상대적으로 넓어 저체온 위험도 높다.'],must:['큰 혀 + 좁은 기도','목 과신전 → 기도폐쇄 가능','체표면적 큼 → 저체온 위험'],traps:['소아 기도를 성인과 동일한 크기·구조로 보는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 365~368쪽'},
'E21-C05':{status:'verified',summary:'소아평가는 일반적 인상과 ABC, 말초순환, 연령에 맞는 생체징후를 함께 본다.',detail:['6세 미만 소아에서는 말초순환을 모세혈관 재충혈로 평가할 수 있으며 손발톱을 눌러 2초 내 회복되면 정상으로 제시한다.','4세 이상이면 적절한 크기의 커프로 혈압을 측정한다.'],must:['6세 미만 → 모세혈관 재충혈 활용','2초 내 회복 → 정상','4세 이상 → 혈압 측정'],traps:['소아에게 성인용 크기의 커프를 무조건 사용하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 374~376쪽'},
'E21-C08':{status:'verified',summary:'아동학대는 손상을 유발하는 부적절한 행동, 방임은 필요한 주의·보살핌을 제공하지 못하는 상태다.',detail:['회복단계가 서로 다른 여러 손상, 손상기전과 맞지 않는 손상, 선명한 국소 화상, 반복적 신고 등은 학대를 의심할 단서가 될 수 있다.'],must:['손상기전과 실제 손상 불일치','서로 다른 회복단계의 손상'],traps:['설명과 손상이 맞지 않아도 학대 가능성을 전혀 고려하지 않는 선지에 주의한다.'],compare:[['학대','손상을 초래하는 과격·부적절 행동'],['방임','충분한 주의·보살핌을 제공하지 못함']],flow:[],source:'소방전술3(구급) 387쪽'},
'E22-C02':{status:'verified',summary:'노인환자는 존중을 유지하고 환자 본인에게 직접 천천히 명확하게 의사소통한다.',detail:['가족이나 시설 직원에게 묻는 것이 더 빠르더라도 가능한 환자 본인에게 직접 말하는 것이 존중과 자존감 유지에 중요하다.','환자 눈높이에 맞추고 천천히 분명하게 말하며 충분히 반응할 시간을 준다.'],must:['환자 본인에게 직접','눈높이 맞춤','천천히·분명하게'],traps:['나이가 많다는 이유로 환자를 배제하고 보호자에게만 말하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 391쪽'},
'E22-C03':{status:'verified',summary:'노인도 기도·호흡·순환 등 평가 우선순위는 같지만 복합질환·약물·의사소통 문제 때문에 더 세밀한 평가가 필요하다.',detail:['환자평가의 우선순위는 연령과 관계없이 동일하다.','노인은 여러 만성질환과 다양한 처방약, 시력·청력 저하 등이 평가를 복잡하게 만들 수 있다.'],must:['ABC 등 평가 우선순위 → 연령 무관 동일','복합질환·다약제 확인'],traps:['노인이라는 이유만으로 ABC 우선순위를 바꾸는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 392쪽'},
'E23-C01':{status:'verified',summary:'행동응급은 정신과 문제로만 단정하지 말고 저혈당·저산소·뇌졸중·외상·중독 등 의학적 원인을 먼저 고려한다.',detail:['행동 변화는 저혈당, 산소결핍, 뇌졸중, 머리외상, 약물중독, 저체온 등 여러 내과·외과적 상태로 발생할 수 있다.'],must:['행동변화 → 의학적 원인 배제 중요'],traps:['이상행동을 모두 정신질환으로 단정하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 397쪽'},
'E23-C02':{status:'verified',summary:'자살위험 환자에서도 현장안전이 최우선이며 위험하지 않다면 환자를 혼자 두지 않는다.',detail:['현장 도착 후 가장 먼저 현장안전을 확인해야 한다.','대원 안전에 위협이 되지 않는다면 환자를 혼자 두지 않고 안전한 거리에서 대화를 지속한다.'],must:['자살현장 → 현장안전 먼저','가능하면 환자 혼자 두지 않기'],traps:['대원 안전을 확보하지 않은 채 바로 신체접촉하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 401쪽'},
'E23-C03':{status:'verified',summary:'행동응급 기록은 관찰 사실과 현장상황을 전문적이고 명확하게 남긴다.',detail:['환자의 행동과 관찰사항, 현장상황, 약물·알코올 관련 정보 등을 기록한다.','경찰관계자·목격자·협력자 등의 이름도 기록해 둔다.'],must:['관찰 사실','현장 상황','관련인 이름'],traps:['추측이나 비전문적 평가만 기록하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 403쪽'},
'E24-C05':{status:'verified',summary:'기도 이물폐쇄는 경미·중증을 구분하고 환자의 기침·환기·의식상태를 기준으로 처치한다.',detail:['경미한 기도폐쇄에서는 양호한 환기와 자발적이며 힘 있는 기침이 가능할 수 있다.','초기에 다른 원인의 급성호흡곤란과 이물질 기도폐쇄를 구분하는 것이 중요하다.'],must:['경미 폐쇄 → 힘 있는 자발기침 가능'],traps:['힘 있게 기침하는 환자에게 무조건 즉시 침습적 처치를 시행하는 선지에 주의한다.'],compare:[],flow:[],source:'소방전술3(구급) 417~423쪽'}
};
Object.assign(V.contentPacks.authored,P);
const E=[
{id:'b2-f01-force-1',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C02',q:'소방력의 3요소 조합으로 교재가 설명하는 것은?',choices:['소방대·소방장비·소방용수','경찰·군대·병원','소방신호·피난·홍보','예방·대비·대응'],a:0,ex:'교재는 인적요소인 소방대, 장비, 소방용수를 소방력의 주요 요소로 설명합니다.',source:'소방법령2 68쪽'},
{id:'b2-f01-water-1',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C03',q:'소방기본법상 소방용수시설의 조합으로 맞는 것은?',choices:['소화전·급수탑·저수조','스프링클러·감지기·수신기','소방차·구급차·헬기','방화문·방화벽·제연설비'],a:0,ex:'법과 교재는 소화전·급수탑·저수조를 소방용수시설로 규정합니다.',source:'소방법령2 89쪽'},
{id:'b2-f01-act-1',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C04',q:'화재·재난 등 위급한 상황에서 소방활동에 포함되는 것으로 맞는 것은?',choices:['화재진압·인명구조·구급','세무조사만','건축허가만','형사재판만'],a:0,ex:'소방활동에는 화재진압과 인명구조·구급 등 필요한 활동이 포함됩니다.',source:'소방법령2 105쪽'},
{id:'b2-f01-zone-1',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C04',q:'현장에서 소방활동구역을 설정하여 출입을 제한할 수 있는 사람은?',choices:['소방대장','모든 일반인','건물 임차인만','보험회사 직원'],a:0,ex:'소방대장은 현장에 소방활동구역을 설정하여 필요한 사람 외 출입을 제한할 수 있습니다.',source:'소방법령2 146쪽'},
{id:'b2-f02-org-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C03',q:'중앙안전관리위원회는 누구 소속으로 두는가?',choices:['국무총리','소방서장','시장·군수·구청장','경찰서장'],a:0,ex:'중앙안전관리위원회는 재난 및 안전관리 중요정책 심의를 위해 국무총리 소속으로 둡니다.',source:'소방법령5 524쪽'},
{id:'b2-f02-org-2',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C03',q:'중앙재난안전대책본부를 두는 기관은?',choices:['행정안전부','각 소방서만','기상청만','국회'],a:0,ex:'대규모 재난 대응·복구 등을 총괄·조정하기 위해 행정안전부에 중앙재난안전대책본부를 둡니다.',source:'소방법령5 533쪽'},
{id:'b2-f02-prevent-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C04',q:'재난 예방의 설명으로 가장 적절한 것은?',choices:['위험성을 평가하고 위험요인을 사전에 제거하기 위한 활동','재난 종료 후 보상만 하는 활동','발생 후 현장구조만 수행하는 활동','재난기록을 폐기하는 활동'],a:0,ex:'교재는 위험성 평가·분석과 위험요인 제거 등으로 재난발생 위험성을 사전에 제거하는 활동으로 설명합니다.',source:'소방법령5 550쪽'},
{id:'b2-f02-ready-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C05',q:'합동 재난대비훈련의 실시 주기로 교재가 제시하는 것은?',choices:['소관 분야별 연 1회 이상','10년에 1회','필요해도 실시하지 않음','매일 1회만'],a:0,ex:'훈련주관기관은 관계기관과 합동으로 소관 분야별 재난대비훈련을 연 1회 이상 실시해야 합니다.',source:'소방법령5 570쪽'},
{id:'b2-f02-rescue-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C06',q:'중앙긴급구조통제단을 두는 기관은?',choices:['소방청','대법원','국세청','국회'],a:0,ex:'긴급구조 총괄·조정과 지휘통제를 위해 소방청에 중앙긴급구조통제단을 둡니다.',source:'소방법령5 581쪽'},
{id:'b2-f02-situation-1',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C07',q:'행정안전부에 설치·운영하는 재난상황실은?',choices:['중앙재난안전상황실','119안전센터','소방학교','지역의용소방대'],a:0,ex:'행정안전부에는 중앙재난안전상황실을 설치·운영합니다.',source:'소방법령5 540쪽'},
{id:'b2-f03-stage-1',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C04',q:'구획실 화재 진행순서로 맞는 것은?',choices:['발화기→성장기→플래시오버→최성기→쇠퇴기','쇠퇴기→발화기→최성기→성장기','최성기→발화기→쇠퇴기→플래시오버','성장기→쇠퇴기→발화기'],a:0,ex:'교재는 구획실 화재를 발화기, 성장기, 플래시오버, 최성기, 쇠퇴기로 구분합니다.',source:'소방전술1(화재1) 18쪽'},
{id:'b2-f04-co2-1',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C05',q:'이산화탄소 소화약제의 가장 큰 소화효과는?',choices:['질식효과','발화효과','산화효과','연료공급효과'],a:0,ex:'공식 교재는 이산화탄소의 가장 큰 소화효과를 질식효과로 설명합니다.',source:'소방전술1(화재2) 212쪽'},
{id:'b2-e08-primary-1',grade:'B',subject:'ems',scopeId:'E08',conceptId:'E08-C02',q:'환자 1차 평가 순서로 가장 적절한 것은?',choices:['첫인상→의식수준→기도→호흡→순환→위급정도','병력→세부검진→첫인상→기도','순환→퇴원→진단→처방','재평가→현장확인→종료'],a:0,ex:'교재는 첫인상, 의식수준, 기도, 호흡, 순환, 위급정도 판단 순으로 1차 평가를 제시합니다.',source:'소방전술3(구급) 137쪽'},
{id:'b2-e08-secondary-1',grade:'B',subject:'ems',scopeId:'E08',conceptId:'E08-C03',q:'2차 평가에서 중요한 두 부분은?',choices:['병력과 생체징후','현장안전과 환자 수만','기도개방과 인공호흡만','이송수단과 병원 위치만'],a:0,ex:'2차 평가에서는 병력과 생체징후 평가가 중요합니다.',source:'소방전술3(구급) 143쪽'},
{id:'b2-e08-reassess-1',grade:'B',subject:'ems',scopeId:'E08',conceptId:'E08-C06',q:'위급한 환자의 재평가 간격으로 교재가 제시하는 것은?',choices:['약 5분마다','약 1시간마다','하루 1회','재평가하지 않음'],a:0,ex:'교재는 일반 환자 약 15분, 위급한 환자 약 5분 간격으로 재평가하도록 제시합니다.',source:'소방전술3(구급) 129쪽'},
{id:'b2-e09-opa-1',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C04',q:'입인두기도기를 사용할 수 있는 환자로 가장 적절한 것은?',choices:['구역반사가 없는 무의식 환자','의식이 명료하고 구역반사가 강한 환자','모든 환자에게 무조건','코피만 있는 환자'],a:0,ex:'입인두기도기는 구역반사가 없는 무의식 환자에게 사용합니다.',source:'소방전술3(구급) 168쪽'},
{id:'b2-e09-suction-1',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C06',q:'성인 환자 1회 흡인시간에 대한 원칙으로 맞는 것은?',choices:['15초 이상 지속하지 않는다','최소 1분 지속한다','시간 제한이 없다','30분 지속한다'],a:0,ex:'교재는 산소공급 중단을 줄이기 위해 성인에서 한 번에 15초 이상 흡인하지 않도록 제시합니다.',source:'소방전술3(구급) 181쪽'},
{id:'b2-e10-rr-1',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C02',q:'공식 교재가 제시한 성인의 정상 호흡수 범위는?',choices:['분당 12~20회','분당 1~5회','분당 30~50회','분당 60~80회'],a:0,ex:'교재 표는 성인의 정상 호흡수를 분당 12~20회로 제시합니다.',source:'소방전술3(구급) 193쪽'},
{id:'b2-e10-smoke-1',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C05',q:'화재환자에서 연기흡입을 의심하게 하는 소견은?',choices:['입·코 주변 그을음','고립된 복부 압통만','사지 변형만','두피 열상만'],a:0,ex:'입·코 주변 그을음과 코털·머리카락 그을림 등은 연기흡입을 의심하는 단서입니다.',source:'소방전술3(구급) 198쪽'},
{id:'b2-e14-soft-1',grade:'B',subject:'ems',scopeId:'E14',conceptId:'E14-C02',q:'폐쇄성 연부조직 손상의 설명으로 맞는 것은?',choices:['피부 아래 조직은 손상됐지만 피부표면은 찢어지지 않은 경우','피부가 반드시 완전히 절단된 경우','뼈만 손상된 경우','화상만 의미'],a:0,ex:'교재는 피부표면이 찢기지 않은 상태에서 아래 조직이 손상된 경우를 폐쇄성 손상으로 설명합니다.',source:'소방전술3(구급) 242쪽'},
{id:'b2-e14-burn-1',grade:'B',subject:'ems',scopeId:'E14',conceptId:'E14-C03',q:'중증 화상환자 현장평가에서 특히 우선 확인해야 할 위험은?',choices:['기도손상과 호흡장애','손톱 모양만','머리색만','치아 색만'],a:0,ex:'교재는 화상 현장사망의 주요 원인으로 기도손상과 호흡장애를 강조합니다.',source:'소방전술3(구급) 255쪽'},
{id:'b2-e15-function-1',grade:'B',subject:'ems',scopeId:'E15',conceptId:'E15-C01',q:'근골격계의 주요 기능에 해당하지 않는 것은?',choices:['폐의 가스교환을 직접 담당','인체 외형 형성','내부 장기 보호','인체 움직임 제공'],a:0,ex:'교재가 제시한 주요 기능은 형태 형성, 내부 장기 보호, 움직임 제공입니다.',source:'소방전술3(구급) 266쪽'},
{id:'b2-e15-fracture-1',grade:'B',subject:'ems',scopeId:'E15',conceptId:'E15-C02',q:'넙다리뼈 골절에서 교재가 예시로 제시한 실혈량은 대략?',choices:['약 1,000cc','약 10cc','약 50cc','출혈이 전혀 없음'],a:0,ex:'교재는 넙다리뼈 골절 시 약 1,000cc 정도의 실혈 가능성을 예시합니다.',source:'소방전술3(구급) 269쪽'},
{id:'b2-e15-splint-1',grade:'B',subject:'ems',scopeId:'E15',conceptId:'E15-C03',q:'치명적인 상태와 사지 골절이 동시에 있는 환자의 원칙으로 맞는 것은?',choices:['치명적인 상태 처치·이송이 부목보다 우선','부목만 시행하고 ABC는 미룬다','모든 평가를 중단한다','이송하지 않는다'],a:0,ex:'교재는 치명적인 상태에서는 부목고정보다 필요한 처치와 이송을 우선하도록 제시합니다.',source:'소방전술3(구급) 274쪽'},
{id:'b2-e16-spine-1',grade:'B',subject:'ems',scopeId:'E16',conceptId:'E16-C02',q:'심한 목뼈 척수손상에서 직접 위협받을 수 있는 기능은?',choices:['호흡','간의 해독기능만','신장 여과기능만','위산 분비기능만'],a:0,ex:'심한 목뼈손상은 호흡근을 통제하는 신경에 영향을 주어 호흡정지를 초래할 수 있습니다.',source:'소방전술3(구급) 287쪽'},
{id:'b2-e16-head-1',grade:'B',subject:'ems',scopeId:'E16',conceptId:'E16-C03',q:'머리뼈 또는 뇌손상 징후로 교재가 제시하는 것은?',choices:['귀나 코에서 혈액 또는 맑은 액체가 나옴','정상적인 좌우 대칭 동공만','통증이 전혀 없는 손가락','정상 체온만'],a:0,ex:'귀·코의 혈액이나 맑은 액체, 눈 주위 반상출혈, Battle sign 등이 제시됩니다.',source:'소방전술3(구급) 299쪽'},
{id:'b2-e16-helmet-1',grade:'B',subject:'ems',scopeId:'E16',conceptId:'E16-C04',q:'헬멧을 제거하지 않을 수 있는 경우로 맞는 것은?',choices:['헬멧이 기도·호흡 평가를 방해하지 않고 제거가 더 위험한 경우','모든 환자는 반드시 즉시 제거','호흡이 막혀도 절대 제거 금지','평가와 상관없이 무조건 유지'],a:0,ex:'교재는 평가·기도·호흡에 방해가 없고 제거가 더 큰 위험을 초래하면 제거하지 않을 수 있다고 설명합니다.',source:'소방전술3(구급) 302쪽'},
{id:'b2-e17-conscious-1',grade:'B',subject:'ems',scopeId:'E17',conceptId:'E17-C01',q:'의식장애 환자에서 구급대원의 우선 역할로 가장 적절한 것은?',choices:['기도·호흡·순환 평가와 처치 및 이송','현장에서 확정진단부터 수행','모든 처치를 보류','병원 이송을 금지'],a:0,ex:'교재는 구급대원이 ABC 평가·처치와 이송을 우선하도록 설명합니다.',source:'소방전술3(구급) 305~306쪽'},
{id:'b2-e18-poison-1',grade:'B',subject:'ems',scopeId:'E18',conceptId:'E18-C01',q:'약물·독성물질 중독 현장에서 가장 먼저 고려할 것은?',choices:['대원의 현장안전과 개인보호장비','환자 물건을 맨손으로 만지기','냄새를 직접 맡아 물질 확인','보호장비 없이 바로 접촉'],a:0,ex:'중독 현장에서는 우선 개인안전을 확인하고 적절한 개인보호장비를 착용해야 합니다.',source:'소방전술3(구급) 315쪽'},
{id:'b2-e18-allergy-1',grade:'B',subject:'ems',scopeId:'E18',conceptId:'E18-C02',q:'심한 알레르기 반응에서 발생할 수 있는 위험으로 맞는 것은?',choices:['상기도 부종과 과민성 쇼크','뼈 길이 증가','시력 자동 향상','맥박이 반드시 완전 정상'],a:0,ex:'과도한 면역반응은 상기도 부종과 혈관이완을 일으켜 과민성 쇼크로 악화될 수 있습니다.',source:'소방전술3(구급) 319쪽'},
{id:'b2-e19-heatloss-1',grade:'B',subject:'ems',scopeId:'E19',conceptId:'E19-C01',q:'교재가 설명한 차가운 물에서의 열손실 속도는 대기와 비교해 대략?',choices:['약 25배 빠르다','약 25배 느리다','완전히 같다','열손실이 없다'],a:0,ex:'교재는 차가운 물에서 열손실이 대기보다 약 25배 빠르게 진행된다고 설명합니다.',source:'소방전술3(구급) 322쪽'},
{id:'b2-e19-hypo-1',grade:'B',subject:'ems',scopeId:'E19',conceptId:'E19-C02',q:'일반적인 저체온증의 중심체온 기준은?',choices:['35℃ 이하','40℃ 이상만','37.5℃ 이상','체온과 무관'],a:0,ex:'교재는 일반적인 저체온증을 체온 35℃ 이하로 설명합니다.',source:'소방전술3(구급) 323쪽'},
{id:'b2-e19-drown-1',grade:'B',subject:'ems',scopeId:'E19',conceptId:'E19-C04',q:'익수 환자의 생존율에 영향을 주는 요소로 교재가 제시하는 것은?',choices:['구조 후 환자의 키','평소 수면시간','최근 예방접종 여부','평소 식사 횟수'],a:0,ex:'수중 노출시간, 동반 손상, 수온 등이 생존율에 영향을 줍니다.',source:'소방전술3(구급) 333쪽'},
{id:'b2-e19-sting-1',grade:'B',subject:'ems',scopeId:'E19',conceptId:'E19-C05',q:'꿀벌 침이 남아 있을 때 교재가 제시하는 제거 방법은?',choices:['카드 가장자리 등으로 긁어 제거','족집게로 독주머니를 세게 짠다','상처를 절개한다','그대로 두고 압박한다'],a:0,ex:'교재는 신용카드 가장자리처럼 긁어서 제거하고 집게로 짜지 않도록 제시합니다.',source:'소방전술3(구급) 338쪽'},
{id:'b2-e20-labor-1',grade:'B',subject:'ems',scopeId:'E20',conceptId:'E20-C02',q:'분만 3기의 의미로 맞는 것은?',choices:['태아 만출 후 태반 등 적출물이 나오는 단계','자궁수축이 처음 시작되기 전','태아가 아직 수정되기 전','산모 평가를 하지 않는 단계'],a:0,ex:'분만 3기는 태아가 나온 뒤 태반 등 적출물이 만출되는 단계입니다.',source:'소방전술3(구급) 343쪽'},
{id:'b2-e20-preg-1',grade:'B',subject:'ems',scopeId:'E20',conceptId:'E20-C05',q:'교재에서 자연유산을 설명하는 임신기간 기준은?',choices:['임신 20주 내','임신 50주 이후만','분만 후 1년','주수와 무관'],a:0,ex:'교재는 자연유산을 임신 기간 20주 내에 유산된 경우로 설명합니다.',source:'소방전술3(구급) 359쪽'},
{id:'b2-e21-anatomy-1',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C02',q:'소아의 기도 특성으로 맞는 것은?',choices:['성인보다 상대적으로 혀가 크고 기도가 좁아 폐쇄되기 쉽다','성인보다 기도가 항상 훨씬 넓다','목을 과신전할수록 항상 안전하다','비강폐쇄가 전혀 문제가 되지 않는다'],a:0,ex:'소아는 상대적으로 큰 혀와 좁고 유연한 기도로 인해 기도폐쇄 위험이 높습니다.',source:'소방전술3(구급) 365~368쪽'},
{id:'b2-e21-eval-1',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C05',q:'6세 미만 소아에서 말초순환 평가에 사용할 수 있는 방법은?',choices:['모세혈관 재충혈','성인용 커프 혈압만 반복 측정','동공반응만으로 순환 판정','호흡음만으로 말초순환 판정'],a:0,ex:'교재는 6세 미만에서 모세혈관 재충혈을 말초순환 평가에 활용할 수 있다고 제시합니다.',source:'소방전술3(구급) 376쪽'},
{id:'b2-e21-abuse-1',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C08',q:'아동학대를 의심할 수 있는 소견으로 적절한 것은?',choices:['설명한 손상기전과 맞지 않는 손상','모든 손상이 설명과 정확히 일치','정상 피부만','단 한 번도 다친 적 없음'],a:0,ex:'손상기전과 다른 형태 또는 더 심각한 손상은 학대를 의심할 단서가 될 수 있습니다.',source:'소방전술3(구급) 387쪽'},
{id:'b2-e22-talk-1',grade:'B',subject:'ems',scopeId:'E22',conceptId:'E22-C02',q:'노인환자 의사소통 원칙으로 적절한 것은?',choices:['가능한 환자 본인에게 직접 천천히 분명하게 말한다','항상 보호자에게만 말한다','무조건 큰 소리로만 말한다','환자의 대답을 기다리지 않는다'],a:0,ex:'교재는 환자 본인에게 직접, 눈높이에 맞추고 천천히 분명하게 말하도록 제시합니다.',source:'소방전술3(구급) 391쪽'},
{id:'b2-e22-eval-1',grade:'B',subject:'ems',scopeId:'E22',conceptId:'E22-C03',q:'노인환자의 기도·호흡·순환 등 평가 우선순위는?',choices:['기본 우선순위는 다른 연령 환자와 동일하다','노인은 ABC를 평가하지 않는다','약물확인만 하고 종료한다','나이만으로 우선순위를 모두 바꾼다'],a:0,ex:'교재는 환자평가 우선순위가 연령을 불문하고 동일하다고 설명합니다.',source:'소방전술3(구급) 392쪽'},
{id:'b2-e23-behavior-1',grade:'B',subject:'ems',scopeId:'E23',conceptId:'E23-C01',q:'이상행동을 보이는 환자에서 고려해야 할 원인으로 적절한 것은?',choices:['저혈당·저산소증·뇌졸중 등 의학적 원인','항상 정신과 문제 하나뿐','모든 경우 연기','원인을 평가할 필요 없음'],a:0,ex:'행동 변화는 여러 내과·외과적 상태로도 나타날 수 있으므로 의학적 원인을 고려해야 합니다.',source:'소방전술3(구급) 397쪽'},
{id:'b2-e23-suicide-1',grade:'B',subject:'ems',scopeId:'E23',conceptId:'E23-C02',q:'자살위험 환자 현장에 도착한 뒤 가장 먼저 확인할 사항은?',choices:['현장안전','환자 직업','보험 종류','주소의 우편번호'],a:0,ex:'교재는 자살 관련 현장에서 가장 먼저 현장안전을 확인해야 한다고 제시합니다.',source:'소방전술3(구급) 401쪽'},
{id:'b2-e24-foreign-1',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C05',q:'경미한 기도 이물폐쇄에서 볼 수 있는 소견은?',choices:['자발적이며 힘 있는 기침','항상 완전 무반응','항상 호흡정지','항상 맥박 없음'],a:0,ex:'교재는 경미한 기도폐쇄에서 양호한 환기와 힘 있는 자발기침이 가능할 수 있다고 설명합니다.',source:'소방전술3(구급) 417쪽'}
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim(),ids=new Set(V.questions.map(q=>q.id)),fps=new Set(V.questions.map(q=>norm(q.q)));
for(const q of E){if(ids.has(q.id)||fps.has(norm(q.q)))continue;if(q.choices.length!==4||new Set(q.choices.map(norm)).size!==4||!Number.isInteger(q.a)||q.a<0||q.a>3)continue;V.questions.push(q);ids.add(q.id);fps.add(norm(q.q))}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
})();

;

/* --- verified-completion.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const p=(summary,detail,must,traps,source,compare=[],flow=[])=>({status:'verified',summary,detail,must,traps,compare,flow,source});
Object.assign(V.contentPacks.authored,{
'F02-C02':p('재난관리책임기관과 재난관리주관기관은 범위와 역할이 다르다.',['재난관리책임기관은 재난관리업무를 수행하는 중앙행정기관·지방자치단체와 법령으로 정한 공공기관·중요시설 관리기관 등을 폭넓게 말한다.','재난관리주관기관은 재난 유형별 예방·대비·대응·복구를 주도하도록 대통령령으로 정한 관계 중앙행정기관이다.'],['책임기관 → 재난관리업무 수행기관의 넓은 범주','주관기관 → 재난유형별 예방·대비·대응·복구를 주도'],['책임기관과 주관기관을 같은 범위의 기관으로 보는 선지에 주의한다.'],'소방법령5 · 재난 및 안전관리 기본법 512~519쪽',[['재난관리책임기관','재난관리업무 수행기관의 넓은 범주'],['재난관리주관기관','재난유형별 관리업무를 주도하는 관계 중앙행정기관']]),
'F03-C07':p('연기와 Flow Path는 압력차·개구부·화점 위치에 따라 이동경로가 달라진다.',['Flow Path는 양압 상태의 화점실에서 생성된 열·연기가 상대적으로 압력이 낮은 열린 문·창문 등으로 이동하는 흐름이다.','화점 위치, 공기 또는 연료 공급량, 공기 유입구와 화점 사이 거리, 화점과 배연구 사이 거리, 입구·출구의 모양과 개구부 유형이 흐름에 영향을 준다.','가장 뜨거운 가스는 상층에 모이는 경향이 있으며 고온 가스층에 무분별하게 물을 뿌리면 열적 층화가 깨질 수 있다.'],['Flow Path → 고압 화점실에서 저압 개구부 방향','영향요인 → 화점·공기공급·거리·개구부','고온 가스 → 상층에 모이는 경향'],['연기는 항상 한 방향으로만 움직인다고 단정하는 선지에 주의한다.'],'소방전술1(화재1) 33~34쪽'),
'E01-C02':p('국가별 응급의료체계는 현장 대응 인력과 의료개입 방식에 차이가 있다.',['미국 응급의료체계는 기본소생술 수준의 BLS와 전문소생술 수준의 ALS, 최초반응자 등 단계적 현장대응 체계를 발전시켜 왔다.','프랑스는 SAMU·SMUR를 중심으로 의료진이 현장에 개입하고 의학적 조정을 수행하는 형태가 특징적으로 소개된다.'],['미국 → BLS·ALS·최초반응자 등 단계적 체계','프랑스 → SAMU 중심 의료진 현장개입·의학적 조정'],['국가별 체계를 서로 뒤바꾸거나 모든 국가가 동일한 방식이라고 보는 선지에 주의한다.'],'소방전술3(구급) 11~17쪽',[['미국','BLS·ALS·최초반응자 중심 단계적 체계'],['프랑스','SAMU·SMUR 중심 의료진 현장개입']]),
'E01-C03':p('응급구조사는 법적 업무범위와 의료지도를 지키며 응급처치를 수행해야 한다.',['교재는 1급 응급구조사가 의료지도를 받아 기도삽관·인공호흡기 사용·수액·약물투여 등 전문 처치를 할 수 있다고 설명한다.','2급 응급구조사는 기본 심폐소생술, 척추·팔다리 고정, 환자 이동·이송 등 기본 응급처치를 수행하는 것으로 구분한다.','응급구조사는 허용된 업무범위를 넘지 않고 기록과 의료지도 등 법적 책임을 고려해야 한다.'],['1급 → 의료지도 아래 전문 처치 가능','2급 → 기본 응급처치 중심','법적 업무범위 준수'],['1급과 2급의 업무범위를 뒤바꾸거나 업무범위를 무제한으로 보는 선지에 주의한다.'],'소방전술3(구급) 18~24쪽'),
'E02-C01':p('구급대원 스트레스는 신체·정서·행동 변화로 나타날 수 있어 조기 인식과 관리가 중요하다.',['스트레스 징후로 호흡·심박 변화, 떨림, 두통·어지럼, 메스꺼움, 수면·식사 변화, 설사, 짜증, 흥미저하 등이 제시된다.','누적 스트레스는 스스로 알아차리지 못한 채 지속될 수 있고, 매우 심각한 사건 뒤의 위기사건 스트레스는 일상생활을 방해할 수 있다.','동료와의 대화, 충분한 휴식·운동·건강한 생활습관, 필요시 전문적 지원이 관리에 도움이 된다.'],['신체·정서·행동 징후 관찰','누적 스트레스도 위험','필요시 동료·전문지원 활용'],['스트레스 징후를 의지 부족으로만 보거나 심한 반응을 방치하는 선지에 주의한다.'],'소방전술3(구급) 25~28쪽'),
'E02-C02':p('개인안전은 환자 처치보다 먼저 확인해야 하는 현장 원칙이다.',['환자에게 접근하기 전 끊어진 전선, 폭발위험, 낙하물, 유해물질, 교통, 군중·무기·폭력 가능성 등 현장 위험요인을 확인한다.','혈액·체액 노출 가능성이 있으면 장갑을 기본으로 하고 상황에 따라 눈 보호구·마스크·가운 등을 추가한다.','현장이 안전하지 않으면 상황실에 알리고 경찰·구조·위험물 대응 등 적절한 지원을 기다린다.'],['처치 전 현장안전 확인','기본 PPE → 장갑','불안전 현장 → 적절한 지원 요청'],['위험한 현장에 보호장비나 지원 없이 즉시 들어가는 선지에 주의한다.'],'소방전술3(구급) 29~31쪽'),
'E03-C01':p('감염예방은 특정 감염환자를 확인한 뒤가 아니라 모든 환자 접촉에서 시작한다.',['혈액과 여러 체액·분비물은 감염 가능성이 있다고 보고 표준적인 차단조치를 적용한다.','감염여부를 겉모습만으로 판단할 수 없으므로 모든 환자에서 일관된 감염예방 원칙을 적용하는 것이 중요하다.'],['모든 환자 접촉에서 감염예방 시작','혈액·체액은 감염 가능성을 고려'],['감염병이 확진된 환자에게만 보호조치를 한다는 선지에 주의한다.'],'소방전술3(구급) 32~40쪽'),
'E03-C02':p('감염예방 처치는 손위생·개인보호구·안전한 날카로운 물품 처리와 구급차 오염관리로 구성된다.',['혈액·체액 접촉 위험에 따라 장갑·보호안경·마스크·가운 등 적절한 개인보호구를 선택한다.','손은 물과 비누로 충분히 씻고, 오염이 없고 물을 사용할 수 없을 때는 알코올 손소독제를 사용할 수 있지만 오염된 경우에는 비누와 물 세척이 중요하다.','장갑 사용은 손위생을 대신하지 못하며 사용한 주사침 등 날카로운 물품은 안전용기에 처리한다.'],['장갑 ≠ 손위생 대체','오염 시 비누·물 세척','노출위험에 맞는 PPE'],['장갑을 꼈으므로 손을 씻을 필요가 없다는 선지에 주의한다.'],'소방전술3(구급) 32~40쪽'),
'E03-C03':p('세척·소독·멸균은 제거하는 오염과 미생물 수준이 서로 다르다.',['세척은 눈에 보이는 오염물질을 물리적으로 제거하는 과정이다.','소독은 대부분의 병원성 미생물을 제거하지만 모든 아포까지 반드시 제거하는 것은 아니다.','멸균은 아포를 포함한 모든 미생물을 제거하는 수준이며, 소독 전에는 혈액·유기물 등 오염물을 먼저 제거해야 한다.'],['세척 → 눈에 보이는 오염 제거','소독 → 대부분 병원성 미생물 제거','멸균 → 아포 포함 모든 미생물 제거'],['오염물이 묻은 상태에서 바로 소독만 하면 충분하다는 선지에 주의한다.'],'소방전술3(구급) 41~42쪽',[['세척','물리적 오염 제거'],['소독','대부분 병원성 미생물 제거'],['멸균','아포 포함 모든 미생물 제거']]),
'E03-C04':p('노출 후 감염관리는 즉시 세척·보고하고 노출경로에 맞는 후속조치를 받는 과정이다.',['혈액·체액에 튀거나 찔림·베임 등 노출이 발생하면 오염된 장갑·의복을 제거하고 노출부위를 즉시 씻는다.','노출 사실을 보고하고 감염병 종류와 노출경로에 따라 예방접종·예방적 처치 등 필요한 후속조치를 받을 수 있다.'],['노출 → 즉시 세척','노출사실 보고','필요시 예방접종·예방처치'],['노출 사실을 숨기거나 증상이 생길 때까지 아무 조치도 하지 않는 선지에 주의한다.'],'소방전술3(구급) 43쪽'),
'E03-C05':p('위험물 사고현장은 오염구역을 구분하고 제독 후 안전한 의료처치로 연결해야 한다.',['용기·표지·현장 징후로 위험물 가능성을 확인하고 바람 방향과 지형을 고려해 안전한 위치에서 접근한다.','Hot zone은 오염이 존재하는 위험구역, Warm zone은 제독 등 경계 활동, Cold zone은 지원·치료가 이루어지는 상대적으로 안전한 구역으로 구분한다.','오염된 환자는 구급대·구급차·병원까지 2차 오염시킬 수 있으므로 필요한 제독을 거친 뒤 처치·이송으로 연결한다.'],['Hot → 오염 위험구역','Warm → 제독·경계','Cold → 지원·치료','2차 오염 방지'],['오염환자를 제독 없이 바로 구급차 내부로 옮기는 선지에 주의한다.'],'소방전술3(구급) 44~50쪽',[['Hot zone','오염 위험구역'],['Warm zone','제독·통제'],['Cold zone','지원·치료']]),
'E04-C01':p('인체 해부학은 표준 해부학적 자세와 기준면·방향용어를 공통 언어로 사용한다.',['해부학적 자세는 똑바로 서서 정면을 보고 팔을 몸 옆에 두며 손바닥이 앞을 향하는 자세다.','정중면은 좌우, 관상면은 앞뒤, 횡단면은 위아래를 나누는 기준으로 사용한다.','내측·외측, 근위·원위, 전방·후방, 상방·하방 같은 방향용어로 위치관계를 표현한다.'],['정중면 → 좌우','관상면 → 앞뒤','횡단면 → 위아래','근위/원위 → 몸통과의 거리 관계'],['환자 실제 자세와 해부학적 방향용어의 기준을 혼동하지 않는다.'],'소방전술3(구급) 51~54쪽'),
'E04-C02':p('인체 생리학은 각 기관계의 구조와 기능, 기관계 사이의 상호작용을 이해하는 데 목적이 있다.',['근골격계는 신체 형태를 만들고 내부 장기를 보호하며 움직임을 제공한다.','호흡계는 기도와 폐포를 통해 산소·이산화탄소 교환을 담당하고, 순환계는 혈액을 통해 산소·영양소를 조직에 운반한다.','신경계는 뇌·척수·말초신경을 통해 신체 기능을 조절하며 소화·비뇨 등 다른 계통도 항상성을 유지하는 데 기여한다.'],['기관계 기능을 서로 연결해 이해','성인 골격 → 206개 뼈'],['한 기관계의 기능을 다른 기관계에 그대로 대입한 선지에 주의한다.'],'소방전술3(구급) 55~71쪽'),
'E05-C01':p('구급 의사소통은 환자와 신뢰를 형성하고 정확한 정보를 얻어 안전한 처치로 연결하는 기술이다.',['가능한 환자 본인에게 자신을 소개하고 눈높이를 맞춘 뒤 쉬운 표현으로 천천히 명확하게 말한다.','전문용어를 남발하지 않고 환자의 말을 경청하며 침착하고 전문적인 태도를 유지한다.','폭력 가능성이 있는 환자에서는 의사소통보다 대원 안전과 퇴로 확보, 경찰 등 지원을 우선한다.'],['소개·눈높이·쉬운 말','경청','폭력위험 → 대원안전 우선'],['보호자가 있다는 이유로 의식 있는 환자에게 전혀 말하지 않는 선지에 주의한다.'],'소방전술3(구급) 72~75쪽'),
'E05-C02':p('구급 통신체계는 출동지령·현장·병원·유관기관을 연결하고 장비별 전파범위를 고려한다.',['기지국·차량용 무전기·휴대용 무전기를 통해 상황실, 구급대, 병원과 유관기관이 정보를 주고받는다.','교재는 기지국을 약 20W·20km, 휴대용 무전기를 약 4W·4km 수준의 예로 설명하며 실제 통신거리는 지형·위치 등에 영향을 받는다.','휴대용 무전기는 충전상태와 여분 배터리를 확인하고 정기적으로 점검·청소한다.'],['기지국 → 고출력·넓은 범위','휴대용 → 저출력·짧은 범위','배터리·장비점검'],['교재 수치를 모든 환경에서 절대적인 통신거리로 단정하지 않는다.'],'소방전술3(구급) 76쪽'),
'E05-C04':p('구급활동기록은 의료연속성·법적 기록·행정통계·교육연구에 쓰이는 정확한 문서다.',['환자의 주호소·병력·활력징후·평가·처치·반응·이송정보를 사실에 근거해 정확하고 완전하게 기록한다.','개인정보와 의료정보의 비밀을 지키고, 처치·이송 거부 시에도 필요한 설명과 거부 사실을 기록한다.','기록을 임의로 삭제·변조하거나 사실과 다른 내용을 작성해서는 안 되며 오류는 정해진 방식으로 정정한다.'],['정확성·완전성','비밀보장','거부도 기록','허위·변조 금지'],['나중에 기억으로 맞추기 위해 사실과 다르게 기록하는 선지에 주의한다.'],'소방전술3(구급) 79~88쪽'),
'E06-C01':p('환자 이동 전에는 이동경로·목적지·인원·장비를 미리 계획해야 한다.',['환자를 들기 전에 어디로 이동할지, 경로에 장애물이 있는지, 필요한 인원이 충분한지 확인한다.','팀원에게 이동방법과 역할을 설명하고 필요한 장비를 준비한 뒤 동시에 움직일 수 있도록 조정한다.'],['이동 전 경로 확인','충분한 인원·장비','팀원 역할·신호 공유'],['환자를 이미 들어 올린 뒤 이동경로를 처음 확인하는 선지에 주의한다.'],'소방전술3(구급) 89~92쪽'),
'E06-C02':p('올바른 신체역학은 허리손상을 줄이고 안정적으로 환자를 들어 올리기 위한 원칙이다.',['짐은 몸 가까이에 두고 허리보다 다리 힘을 사용하며 몸을 가능한 일직선으로 유지한다.','들어 올리는 동안 허리를 비틀지 말고 방향을 바꿀 때에는 발을 움직여 몸 전체를 회전한다.','무게가 크거나 불안정하면 무리하지 말고 추가 인원이나 장비를 요청한다.'],['짐은 몸 가까이','허리 대신 다리 사용','비틀림 금지','필요시 도움 요청'],['허리를 굽힌 상태에서 무거운 환자를 비틀어 드는 선지에 주의한다.'],'소방전술3(구급) 89~92쪽'),
'E06-C03':p('환자 이동은 추가 손상을 막으면서 필요한 경우에만 신속히 시행해야 한다.',['즉시 위험이 있는 현장, 기도확보나 심폐소생술을 위해 위치를 바꿔야 하는 경우 등에는 긴급 이동이 필요할 수 있다.','불필요한 움직임은 손상을 악화시킬 수 있으므로 안전한 경우 환자를 평가하고 고정·보호한 뒤 이동한다.','들것을 사용할 때에는 낙상을 막기 위해 환자를 적절히 고정하고 이동 중 상태를 관찰한다.'],['긴급위험 → 신속 이동 가능','불필요한 움직임 최소화','들것 안전고정'],['현장이 안전한데도 평가 없이 무조건 환자를 끌어내는 선지에 주의한다.'],'소방전술3(구급) 93~95쪽'),
'E06-C04':p('환자 이동장비는 환자 상태와 현장환경에 맞춰 선택하고 팀으로 안전하게 조작한다.',['바퀴형 들것, 계단의자, 분리형 들것, 척추고정용 장비 등은 목적과 환경이 다르다.','좁은 공간·계단·척추손상 가능성·환자 체중과 상태를 고려해 적절한 장비를 선택한다.','장비 조작 전 잠금과 고정상태를 확인하고 팀원 간 신호를 맞춘다.'],['환경·환자상태에 맞는 장비 선택','잠금·고정 확인','팀 협력'],['하나의 이동장비를 모든 상황에 동일하게 적용하는 선지에 주의한다.'],'소방전술3(구급) 96~99쪽'),
'E07-C01':p('기도확보·유지 장비는 기도폐쇄 원인과 환자의 의식·구역반사를 고려해 선택한다.',['기도보조기구와 흡인장비는 혀·분비물·구토물 등으로 인한 기도폐쇄를 예방·해소하는 데 사용한다.','입인두기도기·코인두기도기 등은 각각 적응과 금기가 다르므로 환자 상태에 맞춰 사용한다.','흡인기는 혈액·분비물을 제거해 기도 개방을 돕지만 산소공급 중단을 최소화해야 한다.'],['기도장비 → 환자 상태에 맞게 선택','흡인 → 분비물 제거','보조기도기 적응·금기 구분'],['의식·구역반사를 확인하지 않고 같은 기도기를 모든 환자에게 사용하는 선지에 주의한다.'],'소방전술3(구급) 103~108쪽'),
'E07-C02':p('호흡유지 장비는 산소공급과 인공환기를 위해 환자 상태에 맞는 장치를 선택한다.',['산소통·조절기, 비강캐뉼라·마스크, 백밸브마스크 등은 환자의 자발호흡 여부와 필요한 산소농도에 따라 사용한다.','인공환기가 필요한 환자에서는 기도개방과 마스크 밀착을 확인하고 가슴상승을 관찰하며 과환기를 피한다.'],['자발호흡 여부 확인','산소장비·환기장비 구분','BVM → 기도개방·밀착·가슴상승 확인'],['산소공급 장비와 인공환기 장비의 역할을 동일하게 보는 선지에 주의한다.'],'소방전술3(구급) 109~114쪽'),
'E07-C03':p('순환유지 장비는 심정지와 순환문제를 신속히 평가·처치하는 데 사용한다.',['자동심장충격기와 심전도·순환 관련 장비는 심정지 환자의 리듬평가와 제세동 등 순환회복을 지원한다.','장비를 사용할 때에도 가슴압박 중단시간을 최소화하고 환자상태를 반복 평가해야 한다.'],['AED/심장충격기 → 심정지 순환지원','가슴압박 중단 최소화'],['장비를 준비하느라 기본소생술을 장시간 중단하는 선지에 주의한다.'],'소방전술3(구급) 115쪽'),
'E07-C04':p('환자이송 장비는 들것과 고정장비를 이용해 이동 중 낙상과 추가손상을 줄인다.',['바퀴형 들것, 분리형 들것, 척추고정용 보드 등은 현장 조건과 환자손상에 따라 선택한다.','환자를 장비에 안정적으로 고정하고 팀원 간 신호를 맞춰 이동하며 이송 중에도 환자상태를 관찰한다.'],['환자 고정','현장에 맞는 장비 선택','이송 중 관찰'],['환자를 고정하지 않은 채 들것을 이동시키는 선지에 주의한다.'],'소방전술3(구급) 116~119쪽'),
'E07-C05':p('외상처치 장비는 출혈조절·상처보호·골절고정 등을 목적으로 사용한다.',['드레싱·붕대는 상처를 보호하고 출혈조절을 돕고, 각종 부목은 손상된 사지를 안정화한다.','외상장비는 환자 평가와 손상부위, 말초순환·감각·운동 상태를 확인하며 적용한다.'],['드레싱·붕대 → 상처·출혈 관리','부목 → 손상부위 안정화','적용 전후 말초상태 확인'],['외상장비 적용 때문에 생명위협 처치를 늦추는 선지에 주의한다.'],'소방전술3(구급) 120~126쪽'),
'E08-C01':p('현장 확인은 환자접촉 전 안전·손상기전·환자 수·추가지원 필요성을 파악하는 단계다.',['현장안전과 개인보호장비를 확인하고 질병기전 또는 손상기전을 파악한다.','환자 수와 추가자원 필요성을 확인하며 외상에서는 척추손상 가능성도 고려한다.'],['현장안전/PPE','MOI·NOI','환자 수','추가자원','척추손상 고려'],['환자에게 먼저 접근한 뒤 현장위험을 확인하는 선지에 주의한다.'],'소방전술3(구급) 129~136쪽'),
'E08-C04':p('비외상 환자의 집중평가는 주호소·병력·활력징후와 관련 계통의 신체검진을 연결한다.',['주호소를 확인하고 OPQRST와 SAMPLE 등을 이용해 증상과 병력을 구조적으로 수집한다.','주호소와 관련된 신체계통을 집중적으로 평가하고 활력징후를 측정해 환자상태를 판단한다.'],['주호소','OPQRST·SAMPLE','관련 계통검진','활력징후'],['주호소와 관계없이 모든 비외상 환자에게 동일한 한 부위만 검사하는 선지에 주의한다.'],'소방전술3(구급) 152~155쪽'),
'E08-C05':p('외상 환자의 집중평가는 손상기전과 위급도에 따라 신속 전신평가 또는 부위별 평가를 선택한다.',['중요 손상기전과 환자상태를 바탕으로 머리부터 발끝까지 빠르게 생명위협 손상을 찾거나 특정 손상부위를 집중 평가한다.','활력징후와 병력정보를 함께 확인하고 발견한 생명위협은 평가와 동시에 처치한다.'],['손상기전 고려','신속 전신/부위별 평가 선택','생명위협 즉시 처치'],['심각한 손상기전을 무시하고 보이는 상처만 평가하는 선지에 주의한다.'],'소방전술3(구급) 156~159쪽'),
'E09-C01':p('기도유지는 1차 평가에서 가장 먼저 생명에 영향을 줄 수 있는 핵심 요소다.',['무의식 환자는 턱과 혀 근육이 이완되어 혀가 뒤로 처지며 기도를 막기 쉽다.','기도폐쇄가 지속되면 저산소증과 이산화탄소 축적이 진행되어 호흡부전·호흡정지로 이어질 수 있다.'],['무의식 → 혀에 의한 기도폐쇄 위험','기도폐쇄 → 저산소증·호흡부전'],['무의식 환자에서 기도상태 확인을 뒤로 미루는 선지에 주의한다.'],'소방전술3(구급) 163쪽'),
'E09-C02':p('호흡평가는 흉곽 움직임·호흡수·규칙성·깊이·호흡음을 함께 확인한다.',['가슴의 상승과 하강, 호흡수·리듬·깊이, 양측 대칭성과 비정상 호흡음을 관찰한다.','청색증, 코벌렁거림, 보조근 사용, 삼각대 자세, 문장을 끊어 말하는 모습 등은 호흡곤란의 단서가 될 수 있다.','호흡이 없거나 불충분하면 기도를 열고 산소공급·인공환기를 시행하며 분비물은 필요시 흡인한다.'],['가슴 움직임·수·리듬·깊이','호흡곤란 징후','불충분 호흡 → 환기지원'],['호흡수 하나만 정상이라고 전체 호흡을 정상으로 판단하는 선지에 주의한다.'],'소방전술3(구급) 164~165쪽'),
'E09-C03':p('기도개방법은 척추손상 가능성에 따라 머리기울임-턱들어올리기와 턱밀어올리기를 구분한다.',['척추손상이 의심되지 않으면 머리기울임-턱들어올리기법을 사용한다.','머리·목·척추손상이 의심되면 머리 움직임을 최소화하며 턱밀어올리기법을 우선 고려한다.','턱 아래 연부조직을 과도하게 누르면 오히려 기도폐쇄를 악화시킬 수 있다.'],['비외상 → 머리기울임-턱들어올리기','척추손상 의심 → 턱밀어올리기','턱 아래 연부조직 압박 주의'],['척추손상 의심 환자의 목을 과도하게 젖히는 선지에 주의한다.'],'소방전술3(구급) 166~167쪽'),
'E09-C05':p('인공호흡은 적절한 기도개방·마스크 밀착과 가슴상승 확인을 바탕으로 시행한다.',['포켓마스크·백밸브마스크 등으로 인공호흡을 할 때 기도를 열고 마스크를 밀착시켜 가슴이 올라오는지 확인한다.','교재는 성인 환기의 예로 약 500~600mL의 일회 호흡량을 제시하고 과도한 환기를 피하도록 설명한다.','환기 중에는 피부색·맥박·가슴 움직임 등 환자반응을 재평가한다.'],['기도개방','마스크 밀착','가슴상승 확인','과환기 금지'],['많은 양을 빠르게 넣을수록 좋다는 선지에 주의한다.'],'소방전술3(구급) 171~178쪽'),
'E09-C07':p('산소치료는 저산소증 위험을 평가하고 적절한 장비를 선택하며 환자 전체 상태를 함께 본다.',['호흡·심정지, 호흡곤란, 쇼크·출혈 등 산소공급이 필요한 상태에서 산소치료를 고려한다.','교재는 정상 산소포화도를 약 95~100%로 제시하지만 맥박산소측정값만으로 환자를 판단하지 않고 임상상태를 함께 평가해야 한다.'],['산소포화도만 단독 판단 금지','환자 상태와 산소화 함께 평가'],['수치 하나만 보고 기도·호흡 상태를 무시하는 선지에 주의한다.'],'소방전술3(구급) 181~188쪽'),
'E09-C08':p('특수한 기도상황에서는 안면손상·화상·치과장치·소아 특성을 고려해 기도확보법을 조정한다.',['안면외상이나 화상은 출혈·부종으로 기도를 빠르게 좁힐 수 있어 반복적인 기도평가가 필요하다.','소아는 기도가 작고 유연해 머리 위치와 마스크 크기, 환기 압력을 연령에 맞춰 조정해야 한다.','부분 기도폐쇄에서 환자가 힘 있게 기침할 수 있다면 자발적 기침을 관찰·격려한다.'],['안면화상 → 기도부종 주의','소아 → 과신전·과압력 주의','힘 있는 기침 → 자발기침 활용'],['특수상황에서도 성인 표준방법을 그대로 적용한다는 선지에 주의한다.'],'소방전술3(구급) 189~191쪽'),
'E10-C01':p('호흡기계는 상기도에서 폐포까지 공기를 이동시키고 폐포에서 가스교환을 한다.',['공기는 코·입에서 인두·후두·기관·기관지·세기관지를 거쳐 폐포에 도달한다.','후두개는 삼킬 때 기도 입구를 덮어 음식물이 기도로 들어가는 것을 막는다.','오른쪽 폐는 3엽, 왼쪽 폐는 2엽으로 구성되며 들숨에서는 횡격막과 갈비사이근 수축으로 흉강용적이 커진다.'],['공기경로 → 상기도→기관→기관지→폐포','오른폐 3엽 · 왼폐 2엽','들숨 → 횡격막 수축'],['후두개의 기능이나 좌우 폐엽 수를 바꾼 선지에 주의한다.'],'소방전술3(구급) 192쪽'),
'E10-C03':p('호흡곤란은 빠른 호흡부터 호흡정지까지 다양한 형태로 나타나며 원인별 평가가 필요하다.',['기도폐쇄, 환기장애, 가스교환장애, 순환문제, 대사·심리적 원인 등 여러 상태가 호흡곤란을 일으킬 수 있다.','COPD·천식·심부전 등에서도 호흡곤란이 나타날 수 있으므로 기도와 호흡을 평가하고 산소화·환기가 불충분하면 지원한다.','의식이 있는 환자는 일반적으로 스스로 가장 편하게 호흡할 수 있는 자세를 유지하도록 돕는다.'],['원인 다양','기도·호흡 우선평가','불충분 호흡 → 산소·환기 지원'],['호흡곤란을 한 질환으로만 단정하는 선지에 주의한다.'],'소방전술3(구급) 194~196쪽'),
'E10-C04':p('소아 호흡곤란은 흉부함몰·코벌렁거림·복식호흡과 저산소성 서맥 등으로 빠르게 악화될 수 있다.',['소아에서 가슴벽 함몰, 코벌렁거림, 가슴과 배의 비정상적 움직임은 호흡노력 증가의 징후가 될 수 있다.','심한 저산소증에서는 서맥이 나타날 수 있으며 이는 심정지 임박 신호가 될 수 있다.','기도를 반복 평가하고 적절한 산소공급·환기를 제공한다.'],['함몰·코벌렁거림','저산소증 → 서맥 가능','서맥 → 심정지 임박 신호 가능'],['소아의 서맥을 항상 정상으로 보는 선지에 주의한다.'],'소방전술3(구급) 197쪽'),
'E11-C01':p('심혈관계는 네 개의 심장방과 판막·관상동맥·전기전도계를 통해 전신순환을 유지한다.',['심장은 두 심방과 두 심실로 구성되고 오른심장은 폐순환, 왼심장은 전신순환을 담당한다.','판막은 혈액의 역류를 막고 관상동맥은 심장근육에 산소와 영양을 공급한다.','심장 전기전도 이상은 부정맥을 일으켜 효과적인 순환을 방해할 수 있다.'],['2심방 + 2심실','오른심장 → 폐순환','왼심장 → 전신순환','관상동맥 → 심근 공급'],['오른심장과 왼심장의 순환 방향을 뒤바꾼 선지에 주의한다.'],'소방전술3(구급) 200~201쪽'),
'E11-C02':p('심질환 환자는 주호소·통증특성·활력징후를 평가하고 심정지 여부를 먼저 구분한다.',['흉통은 압박감·쥐어짜는 느낌 등으로 나타날 수 있고 팔·어깨·등·턱 등으로 퍼질 수 있다.','무반응·무호흡·무맥박이면 즉시 심정지 대응으로 전환하고, 의식이 있으면 OPQRST 등으로 증상과 병력을 확인한다.'],['심정지 여부 우선 확인','의식 환자 → OPQRST·병력·활력징후'],['모든 심장질환이 전형적인 한 가지 흉통으로만 나타난다고 보는 선지에 주의한다.'],'소방전술3(구급) 202~204쪽'),
'E11-C04':p('제세동은 심실세동과 무맥성 심실빈맥 같은 충격가능 리듬에서 조기에 시행할수록 중요하다.',['심실세동은 심정지에서 나타날 수 있는 대표적인 충격가능 리듬이며 빠른 제세동이 핵심 치료다.','교재는 제세동이 1분 지연될 때마다 성공 가능성이 약 7~10% 감소할 수 있다고 설명한다.','충격가능 리듬은 심실세동과 무맥성 심실빈맥으로 정리한다.'],['VF · 무맥성 VT → 충격가능','제세동 지연 최소화'],['맥박이 있는 모든 빈맥에 무조건 제세동을 시행한다는 선지에 주의한다.'],'소방전술3(구급) 208쪽'),
'E11-C05':p('심장충격기는 심전도 리듬을 확인하고 필요한 경우 전기충격으로 비정상 전기활동을 교정한다.',['심장충격기는 심전도 전극을 통해 심장의 전기활동을 모니터링하고 필요한 경우 전기충격을 전달한다.','심실빈맥은 빠르고 규칙적인 리듬일 수 있으며 교재는 맥박이 없는 심실빈맥을 제세동 대상으로 설명한다.'],['심전도 모니터링','무맥성 VT → 제세동 대상'],['맥박 유무를 확인하지 않고 모든 VT에 동일한 충격을 적용하는 선지에 주의한다.'],'소방전술3(구급) 209쪽'),
'E11-C06':p('자동심장충격기는 리듬을 분석해 충격 필요성을 판단하고 충격 전후 가슴압박 중단을 최소화한다.',['반자동 AED는 충격 필요성을 분석해 안내하면 구조자가 충격 버튼을 누르고, 완전자동형은 장비가 충격을 전달한다.','일반적인 패드 위치는 오른쪽 쇄골 아래와 왼쪽 유두 바깥쪽 겨드랑선 부근이다.','충격 후 즉시 가슴압박을 재개하고 불필요한 맥박·리듬 확인으로 압박을 지연하지 않는다.'],['반자동 → 구조자가 충격버튼','패드 → 오른쪽 상흉부 + 왼쪽 측흉부','충격 후 즉시 압박 재개'],['AED 분석·충격 때문에 가슴압박을 장시간 중단하는 선지에 주의한다.'],'소방전술3(구급) 210~215쪽'),
'E12-C01':p('복부에는 소화·비뇨·생식·내분비계 장기가 함께 위치하며 빈장기와 실질장기의 특성이 다르다.',['복부는 횡격막 아래에서 골반까지의 공간으로 위·장 같은 빈장기와 간·비장·췌장·신장 등 여러 장기를 포함한다.','장기 위치와 기능을 이해하면 통증·출혈·손상 양상을 평가하는 데 도움이 된다.'],['빈장기와 실질장기 구분','복부 장기 위치·기능 이해'],['복부를 소화기관만 있는 공간으로 한정하는 선지에 주의한다.'],'소방전술3(구급) 216~217쪽'),
'E12-C02':p('복통은 내장통과 체성통의 위치·양상이 다르게 나타날 수 있다.',['내장통은 둔하고 위치를 정확히 가리키기 어렵거나 간헐적으로 느껴질 수 있다.','복막 등 체벽에서 오는 체성통은 비교적 날카롭고 지속적이며 위치를 더 정확히 지적하고 움직임으로 악화될 수 있다.'],['내장통 → 둔함·국소화 어려움','체성통 → 날카롭고 국소화 쉬움'],['내장통과 체성통의 통증 특성을 뒤바꾼 선지에 주의한다.'],'소방전술3(구급) 218쪽',[['내장통','둔함·국소화 어려움'],['체성통','날카롭고 지속적·국소화 쉬움']]),
'E12-C04':p('급성 복통 처치는 기도·호흡 유지, 구토·쇼크 대비와 신속한 이송이 중심이다.',['기도를 유지하고 구토 시 흡인을 막을 수 있도록 자세와 흡인장비를 준비한다.','필요한 산소를 공급하고 환자가 편한 자세를 취하도록 하며 쇼크 징후를 관찰한다.','음식이나 음료를 주지 않고 안심시키며 신속히 이송한다.'],['기도·구토 대비','필요시 산소','편한 자세','금식','쇼크 관찰·신속이송'],['복통을 줄이기 위해 임의로 음식이나 음료를 먹이는 선지에 주의한다.'],'소방전술3(구급) 223~224쪽'),
'E12-C05':p('복통 유발질환은 통증 위치·방사·출혈·쇼크 위험을 함께 구분한다.',['충수염은 초기 배꼽주변 통증 뒤 오른쪽 아랫배로 국소화될 수 있다.','담낭염·담석은 오른쪽 윗배 통증과 어깨·등 방사통이 나타날 수 있고, 췌장염은 윗배 통증이 등에 퍼질 수 있다.','위장관 출혈은 토혈이나 검고 끈적한 변 등으로 나타날 수 있으며 복부대동맥류 파열은 생명을 위협하는 내출혈을 일으킬 수 있다.'],['충수염 → RLQ 국소화 가능','담낭 → RUQ·어깨/등 방사 가능','위장관 출혈·AAA → 쇼크 위험'],['통증 위치 하나만으로 현장에서 질환을 확정진단하는 선지에 주의한다.'],'소방전술3(구급) 223~224쪽'),
'E13-C01':p('순환계는 심장·혈관·혈액이 함께 작동해 조직관류를 유지한다.',['심장은 혈액을 펌프하고 동맥은 심장에서 나가는 혈액, 정맥은 심장으로 돌아오는 혈액을 운반한다.','모세혈관은 산소·영양소와 노폐물 교환이 일어나는 곳이며 이러한 조직혈류를 관류라고 한다.'],['순환 3요소 → 심장·혈관·혈액','동맥 → 심장에서 나감','정맥 → 심장으로 돌아옴','모세혈관 → 물질교환'],['동맥과 정맥을 산소함량만으로 정의하는 선지에 주의한다.'],'소방전술3(구급) 225~226쪽'),
'E13-C02':p('출혈은 순환혈액량을 감소시켜 관류저하와 쇼크로 이어질 수 있다.',['출혈량이 많아질수록 조직에 산소와 영양소를 공급하는 능력이 떨어지고 쇼크 위험이 커진다.','교재는 성인 약 1L, 아동 약 0.5L, 신생아 약 0.1L의 실혈도 위험할 수 있다는 예를 제시한다.','출혈환자 접촉 시 혈액노출을 막기 위한 개인보호구를 사용한다.'],['실혈 → 관류저하·쇼크','출혈환자 → PPE'],['겉으로 보이는 출혈량이 적다고 내부출혈 가능성까지 배제하는 선지에 주의한다.'],'소방전술3(구급) 227쪽'),
'E13-C04':p('내부출혈은 겉으로 보이지 않아 손상기전과 쇼크 징후를 통해 적극적으로 의심해야 한다.',['둔상이나 혈관파열로 가슴·복부·골반 등에 큰 출혈이 생길 수 있지만 외부에서 바로 보이지 않을 수 있다.','빠른 맥박, 창백하고 차가운 피부, 의식변화, 멍·변형, 복부팽만, 신체개구부 출혈 등은 내부출혈을 의심하는 단서가 된다.'],['흉부·복부·골반 → 대량 내출혈 가능','손상기전 + 쇼크징후 함께 평가'],['외부 출혈이 없다는 이유로 내부출혈을 배제하는 선지에 주의한다.'],'소방전술3(구급) 233쪽'),
'E13-C05':p('저혈량 쇼크는 혈액·체액 손실로 조직관류가 부족해진 상태다.',['쇼크는 심장기능 문제, 혈관 긴장조절 실패, 혈액·체액 손실 등 다양한 원인으로 발생할 수 있다.','저혈량 쇼크에서는 빠른 맥박·호흡, 창백하고 차며 축축한 피부, 갈증·오심, 의식변화 등이 나타날 수 있고 혈압저하는 비교적 늦은 징후일 수 있다.','기도·호흡·순환을 유지하고 출혈을 조절하며 체온을 보존하고 신속히 이송·재평가한다.'],['저혈량 → 혈액·체액 손실','빈맥·차고 축축한 피부·의식변화','저혈압은 늦을 수 있음'],['정상 혈압만으로 초기 쇼크를 완전히 배제하는 선지에 주의한다.'],'소방전술3(구급) 234~239쪽'),
'E14-C01':p('피부는 외부장벽·체액보존·체온조절·감각·내부조직 보호 기능을 수행한다.',['표피는 가장 바깥층으로 혈관이 없고, 진피에는 혈관·신경·땀샘 등이 분포한다.','피하층은 지방과 결합조직으로 이루어져 충격을 완화하고 보온에 도움을 준다.'],['피부층 → 표피·진피·피하층','표피 → 혈관 없음','진피 → 혈관·신경 포함'],['표피와 진피의 혈관·신경 구조를 뒤바꾼 선지에 주의한다.'],'소방전술3(구급) 240~241쪽'),
'E16-C01':p('머리·척추·중추신경계 구조를 알면 외상 시 신경학적 위험을 이해할 수 있다.',['두개골은 여러 뼈가 뇌를 보호하며 교재는 총 22개의 뼈로 설명한다.','척주는 33개의 척추뼈로 이루어져 목뼈 7, 등뼈 12, 허리뼈 5, 엉치뼈 5, 꼬리뼈 4로 구분한다.','중추신경계는 뇌와 척수로 구성되며 척수는 뇌와 몸 사이의 신호를 전달한다.'],['두개골 → 22개 뼈','척추 → 33개','경추7·흉추12·요추5·천추5·미추4','CNS → 뇌+척수'],['척추 각 부위 수를 뒤바꾼 선지에 주의한다.'],'소방전술3(구급) 285~286쪽'),
'E17-C02':p('당뇨 환자의 의식변화는 뇌의 산소·포도당 부족과 혈당이상 양상을 함께 고려한다.',['뇌는 정상 기능을 위해 지속적인 산소와 포도당 공급이 필요하다.','인슐린은 포도당이 세포로 들어가 에너지로 사용되도록 돕는다.','교재는 저혈당이 비교적 갑자기 시작되고 고혈당은 보통 더 서서히 진행하는 경향을 설명한다.'],['뇌 → 산소+포도당 필요','인슐린 → 포도당 세포이용 도움','저혈당 → 갑작스러운 시작 경향'],['의식저하를 혈당측정 없이 당뇨 한 가지 원인으로 확정하는 선지에 주의한다.'],'소방전술3(구급) 306~309쪽'),
'E17-C04':p('뇌졸중은 뇌혈관 폐색 또는 파열로 발생할 수 있어 신속한 인지와 이송이 중요하다.',['얼굴이나 한쪽 팔다리의 약화·감각저하, 말하기·이해 문제, 시야 이상, 보행·균형 문제, 갑작스러운 심한 두통 등이 나타날 수 있다.','환자의 마지막 정상시간과 증상발생 시간을 확인하고 신속히 평가·이송한다.'],['한쪽 약화·얼굴비대칭','언어장애','시야·균형 이상','발병시간 확인'],['증상이 잠시 호전됐다는 이유로 뇌졸중 가능성을 무시하는 선지에 주의한다.'],'소방전술3(구급) 311~314쪽'),
'E19-C03':p('열손상은 체열 방출능력을 초과할 때 발생하며 열경련·열탈진·열사병으로 악화될 수 있다.',['고온환경에서 체온조절을 위해 복사와 땀의 증발이 중요하지만 습도가 높으면 증발이 방해될 수 있다.','열경련은 땀으로 수분·전해질이 손실되며 나타날 수 있고, 열탈진은 더 큰 체액손실과 순환부담을 동반한다.','열사병은 체온조절 실패가 심해진 가장 위중한 형태로 즉각적인 냉각과 신속한 이송이 필요하다.'],['고습도 → 땀 증발 감소','열경련→열탈진→열사병 위험','열사병 → 가장 위중'],['열사병을 단순 근육경련 정도로 보는 선지에 주의한다.'],'소방전술3(구급) 330~332쪽'),
'E20-C01':p('임신은 산모의 해부·순환 변화를 일으키며 태반·제대를 통해 태아와 물질교환이 이루어진다.',['여성 생식계에는 난소·난관·자궁·자궁경부·질 등이 있고 자궁경부와 질은 출산경로의 일부가 된다.','태반과 제대를 통해 태아에게 산소·영양소가 전달되고 노폐물이 교환된다.','임신 후기 커진 자궁이 하대정맥을 압박하면 바로누운 자세에서 저혈압이 나타날 수 있어 자세를 조정한다.'],['태반·제대 → 산소·영양·노폐물 교환','후기 임신 바로눕기 → 하대정맥 압박 가능'],['태반을 산모와 태아 혈액이 직접 한 덩어리로 섞이는 기관이라고 단정하지 않는다.'],'소방전술3(구급) 341~342쪽'),
'E20-C03':p('정상분만은 산모와 신생아 두 환자를 동시에 고려하며 진행상황을 평가해 현장분만 여부를 판단한다.',['강한 규칙적 수축과 태아 머리가 보이는 crowning 등 분만 임박 징후가 있으면 현장분만을 준비한다.','태아 머리가 나오면 자연스러운 진행을 지지하고 억지로 잡아당기지 않으며 제대·기도상태를 확인한다.','출생 후 신생아를 따뜻하게 유지하고 호흡·활력 상태를 평가하며 산모 출혈도 관찰한다.'],['Crowning → 분만 임박','태아를 억지로 당기지 않기','출생 후 보온·호흡평가','산모 출혈 관찰'],['분만 임박 산모를 화장실로 보내거나 태아를 잡아당기는 선지에 주의한다.'],'소방전술3(구급) 344~353쪽'),
'E20-C06':p('부인과 응급에서는 출혈성 쇼크와 외상·성폭력 환자의 신체·정서·증거보존을 함께 고려한다.',['심한 질출혈은 저혈량 쇼크로 이어질 수 있어 활력징후와 출혈량을 관찰하고 신속히 이송한다.','외부 생식기 외상은 깨끗한 드레싱으로 직접압박할 수 있지만 질 안에 거즈를 밀어 넣어 패킹하지 않는다.','성폭력 환자는 안전과 의료·심리적 지원을 우선하고 불필요한 세척·의복훼손 등 증거를 없앨 수 있는 행동을 피하며 객관적으로 기록한다.'],['외부출혈 → 직접압박','질 내부 패킹 금지','성폭력 → 안전·치료·증거보존'],['출혈을 막기 위해 질 내부를 거즈로 꽉 채우는 선지에 주의한다.'],'소방전술3(구급) 361~364쪽'),
'E21-C01':p('소아응급은 해부생리와 발달 차이 때문에 성인과 다른 평가·처치 전략이 필요하다.',['소아는 성인보다 응급사건 빈도는 낮지만 호흡·순환 보상능력이 무너지면 빠르게 중증으로 악화될 수 있다.','특히 호흡부전으로 저산소증이 심해지면 서맥과 심정지로 진행할 수 있어 조기 호흡평가가 중요하다.'],['소아 → 해부생리 차이 고려','호흡악화 → 서맥·심정지 가능'],['소아를 단순히 작은 성인으로 보고 모든 장비·기준을 동일하게 적용하는 선지에 주의한다.'],'소방전술3(구급) 365~366쪽'),
'E21-C03':p('소아의 발달단계에 따라 낯선 사람·분리불안·설명방식과 보호자 활용법이 달라진다.',['영유아는 보호자와 떨어지는 것을 두려워할 수 있어 가능한 보호자를 곁에 두고 따뜻하고 천천히 접근한다.','어린 소아는 검사와 처치를 단순하게 설명하고 필요 이상으로 몸을 노출하지 않으며, 나이가 들수록 설명과 개인정보·수치심을 더 고려한다.'],['영유아 → 보호자 활용','간단한 설명','연령 증가 → 사생활·자율성 고려'],['모든 연령의 소아에게 같은 의사소통 방식을 적용하는 선지에 주의한다.'],'소방전술3(구급) 366~367쪽'),
'E21-C04':p('소아 기도·호흡은 큰 혀·좁고 유연한 기도·복식호흡 특성을 고려해 중립에 가까운 자세와 적절한 장비를 사용한다.',['소아는 상대적으로 혀가 크고 기도가 좁아 작은 부종이나 분비물에도 기도저항이 크게 증가할 수 있다.','머리를 과도하게 젖히면 유연한 기도가 오히려 좁아질 수 있어 연령에 맞는 중립 자세를 유지한다.','마스크 크기와 환기 압력을 맞추고 저산소증에서 서맥이 나타나는지 관찰한다.'],['큰 혀·좁은 기도','과신전 금지','적절한 마스크 크기','저산소증 → 서맥 가능'],['성인처럼 목을 최대한 젖히면 항상 기도가 더 열린다는 선지에 주의한다.'],'소방전술3(구급) 368~373쪽'),
'E21-C06':p('소아 내과응급은 기도폐쇄·호흡응급·경련·발열·중독·쇼크·익수 등 다양한 원인을 빠르게 구분한다.',['경미한 기도폐쇄에서는 의식과 피부색이 유지되고 힘 있는 기침이 가능할 수 있어 관찰하며 기침을 돕는다.','중증 기도폐쇄는 청색증·의식저하·환기부전이 나타날 수 있고 연령에 맞는 폐쇄해소법을 사용한다.','경련·발열·중독 등에서도 ABC와 의식·순환을 우선 평가한다.'],['경미 폐쇄 → 힘 있는 기침 가능','중증 폐쇄 → 청색증·의식저하 가능','모든 내과응급 → ABC 우선'],['힘 있게 기침하는 소아에게 즉시 강한 기도폐쇄 처치를 시행하는 선지에 주의한다.'],'소방전술3(구급) 376~384쪽'),
'E21-C07':p('소아 외상은 뼈가 유연하고 장기가 상대적으로 노출되어 겉으로 경미해 보여도 내부손상이 클 수 있다.',['유연한 갈비뼈는 골절 없이도 큰 에너지를 흉부 내부로 전달해 폐·심장 손상이 있을 수 있다.','복부 장기도 상대적으로 보호가 적어 외부 멍이나 작은 흔적만 있어도 내부손상 가능성을 고려한다.','교통사고·자전거·보행자 사고·화상에서는 손상기전과 머리·척추 손상을 함께 평가한다.'],['갈비뼈 골절 없어도 흉부 내부손상 가능','복부손상 은폐 가능','손상기전 중요'],['뼈가 부러지지 않았으니 중증 외상이 아니라고 판단하는 선지에 주의한다.'],'소방전술3(구급) 385~386쪽'),
'E22-C01':p('노화는 신경·심혈관·호흡·근골격·신장 등 여러 기관계의 예비능력을 감소시킨다.',['신경계 변화로 반응속도·균형이 저하되고 머리손상 증상이 늦게 나타날 수 있다.','혈관 탄력저하와 심장 효율 변화로 심혈관질환 위험이 커지고, 호흡근·기침반사 저하로 감염·환기문제가 늘 수 있다.','골다공증과 관절유연성 저하는 낙상·골절 위험을 높이고 신장기능 감소는 약물 축적·독성 위험을 높일 수 있다.'],['신경 → 낙상·지연증상','심혈관 → 예비능력 저하','근골격 → 골절위험','신장 → 약물독성 위험'],['노화 자체를 하나의 질병으로 단정하거나 모든 노인이 같은 기능저하를 보인다고 단정하지 않는다.'],'소방전술3(구급) 390쪽')
});
})();

;

/* --- verified-final.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
V.contentPacks.authored['E05-C03']={
  status:'verified',
  summary:'무선통신은 짧고 정확하게 전달하고 장비 위치·송신 순서를 지켜 음성 왜곡과 누락을 줄인다.',
  detail:[
    '휴대용 무전기는 입에서 약 5~7cm 떨어뜨리고 입에서 약 45° 방향에 두어 지나친 숨소리와 음성 왜곡을 줄인다.',
    '송신 버튼을 누른 뒤 약 1초 기다렸다가 말하고, 천천히·간결하고 분명하게 필요한 정보만 전달한다.',
    '상대방의 응답을 확인하고 중요한 환자정보는 불필요한 전문용어를 줄여 정확하게 전달한다.'
  ],
  must:['무전기 → 입에서 약 5~7cm','방향 → 입에서 약 45°','송신 버튼 → 누른 뒤 약 1초 후 말하기','천천히·간결·분명하게'],
  traps:['무전기를 입에 붙이거나 송신버튼을 누르기 전부터 말해 첫 음절이 잘리는 상황에 주의한다.'],
  compare:[],
  flow:['송신버튼 누름','약 1초 대기','천천히·간결하게 송신','응답 확인'],
  source:'소방전술3(구급) 77~78쪽'
};
})();

;

/* --- questions-scope-2026.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const P=[
{id:'p-f05-c01',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',q:'위험물 분류를 공부할 때 가장 먼저 연결해야 할 것은?',choices:['류별 공통 위험성','건물 높이','환자 수','무선통신 채널'],a:0,ex:'위험물은 제1류~제6류의 공통 위험성과 물질별 성상을 먼저 구분해야 소화원칙을 연결하기 쉽습니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f05-c02',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C02',q:'제1류 위험물의 대표적 공통 성질은?',choices:['산화성고체','가연성고체','인화성액체','산화성액체'],a:0,ex:'제1류는 산화성고체이며 다른 물질의 연소를 촉진할 수 있다는 점이 핵심입니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c03',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C03',q:'제2류 위험물의 대표적 공통 성질은?',choices:['산화성액체','가연성고체','인화성액체','자기반응성물질'],a:1,ex:'제2류는 가연성고체로 분류됩니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c04',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C04',q:'제3류 위험물 대응에서 특히 확인해야 할 반응성은?',choices:['공기·물과의 반응','빛의 굴절','전파의 반사','소음의 크기'],a:0,ex:'제3류에는 자연발화성 또는 금수성 물질이 포함되어 공기·물과의 반응성을 확인해야 합니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c05',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C05',q:'제4류 위험물 화재를 이해할 때 핵심이 되는 것은?',choices:['액면에서 발생한 증기와 점화','고체의 결정구조만','방송설비의 음량','피난계단의 폭'],a:0,ex:'제4류는 인화성액체로, 액면에서 발생한 증기가 공기와 혼합되어 점화되는 구조가 핵심입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f05-c06',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C06',q:'제5류 위험물의 핵심 위험 특성으로 가장 적절한 것은?',choices:['자기반응성','완전 불연성','항상 수용성','무조건 비폭발성'],a:0,ex:'제5류는 자기반응성물질로 급격한 분해반응 가능성을 주의합니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c07',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C07',q:'제6류 위험물의 대표적 공통 성질은?',choices:['가연성고체','산화성액체','인화성고체','금수성가스'],a:1,ex:'제6류는 산화성액체이며 다른 가연물의 연소를 촉진할 수 있습니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c08',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C08',q:'위험물 화재의 소화방법을 정하기 전에 가장 먼저 해야 할 것은?',choices:['물질과 용기·누출상태 확인','무조건 물 방사','모든 전원 차단만 시행','연기 색만으로 판단'],a:0,ex:'위험물은 류와 품목에 따라 반응성이 달라 물질 식별과 상태 확인이 우선입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},

{id:'p-f06-c01',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C01',q:'화재조사의 중요한 목적은?',choices:['원인과 피해를 객관적으로 규명해 재발방지에 활용','현장을 빠르게 철거','진술 하나로 원인 확정','피해금액만 계산'],a:0,ex:'화재조사는 원인과 피해상황을 객관적으로 규명하고 예방·제도개선에 활용하는 과정입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c02',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C02',q:'화재조사 현장에서 먼저 지켜야 할 원칙으로 적절한 것은?',choices:['안전확보와 현장보존','모든 흔적 즉시 제거','사진촬영 생략','관계자 진술만 기록'],a:0,ex:'조사 가능한 흔적이 변형되지 않도록 안전확보 후 현장을 보존하고 기록하는 것이 중요합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c03',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C03',q:'발화부와 발화원인의 관계로 맞는 것은?',choices:['발화부는 시작 위치, 발화원인은 점화가 일어난 원인·과정','둘은 항상 같은 뜻','발화부는 피해금액','발화원인은 소방대 도착시간'],a:0,ex:'발화 위치와 점화 원인·과정은 구분해서 조사합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c04',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C04',q:'화재피해 조사 기록에 가장 적절한 것은?',choices:['사진·도면·목록 등 객관적 근거를 연결','현장 인상만 기록','피해대상 구분 생략','원인조사와 무관하게 수치 임의결정'],a:0,ex:'피해범위와 대상을 객관적 자료로 남겨 이후 재검토할 수 있게 해야 합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},

{id:'p-f07-c01',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C01',q:'소방시설의 기능별 큰 분류에 포함되지 않는 것은?',choices:['소화설비','경보설비','피난구조설비','환자병력설비'],a:3,ex:'소방시설은 소화·경보·피난구조·소화용수·소화활동설비로 구분해 이해합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c02',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C02',q:'소화기구 사용 판단에서 우선 고려할 것은?',choices:['화재종류와 약제 적응성 및 안전한 퇴로','건물 도색 색상','방송 음량','승강기 속도'],a:0,ex:'초기소화는 적응성 있는 약제와 안전한 퇴로 확보를 전제로 합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c03',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C03',q:'옥내소화전의 기본 기능은?',choices:['건물 내부에서 호스·관창으로 방수','자동으로 모든 헤드 동시개방','연기만 감지','피난방향만 표시'],a:0,ex:'옥내소화전은 수원·펌프·배관·방수구·호스·관창을 이용해 사람이 방수하는 설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c04',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C04',q:'옥외소화전의 특징으로 적절한 것은?',choices:['건축물 외부의 방수거점','천장 감열헤드','연기 제어만 수행','자동화재속보만 수행'],a:0,ex:'옥외소화전은 외부에서 호스를 연결해 화재진압에 사용할 수 있는 방수거점입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c05',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C05',q:'일반적인 폐쇄형 스프링클러의 작동 설명으로 적절한 것은?',choices:['화재열을 받은 해당 헤드가 개방되어 방수','경보가 울리면 모든 헤드가 무조건 동시개방','사람이 호스를 연결해야만 방수','연기만 배출하고 물은 사용하지 않음'],a:0,ex:'폐쇄형 스프링클러는 감열부가 화재열에 반응해 작동한 헤드에서 방수가 시작되는 구조입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c06',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C06',q:'화재조기진압용 스프링클러의 목적을 가장 잘 설명한 것은?',choices:['초기 단계에서 강한 방수로 화재 조기진압','피난방향 표시','무선통신 중계만 수행','가스누설만 감지'],a:0,ex:'화재조기진압용 시스템은 높은 방수성능을 이용한 조기진압 목적과 연결해 이해합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c07',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C07',q:'미분무소화의 특징으로 적절한 것은?',choices:['미세 물방울의 넓은 표면적으로 열흡수 효과를 높임','물을 전혀 사용하지 않음','소방대 통신만 지원','피난유도만 수행'],a:0,ex:'작은 물방울은 표면적이 커져 열교환과 증발 효과를 높일 수 있습니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c08',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C08',q:'포소화설비의 핵심 소화원리로 적절한 것은?',choices:['유면을 덮어 가연성증기 발생과 산소접촉 억제','감지기 신호만 전송','피난계단 조명','통신전파 증폭'],a:0,ex:'포는 가연성액체 표면을 피복해 증기 발생과 산소 접촉을 억제합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c09',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C09',q:'가스계 소화설비 운용에서 특히 중요한 것은?',choices:['방출 전 인명안전과 대피 확인','모든 공간에서 사람과 무관하게 즉시 방출','피난유도등 제거','배관에 물만 채우기'],a:0,ex:'가스계 소화는 방호공간의 농도 형성과 함께 인명안전·대피를 매우 중요하게 봅니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c10',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C10',q:'분말소화설비 학습에서 반드시 함께 보아야 할 것은?',choices:['분말 종류별 적응화재','건축물 외벽 색상','방송 스피커 위치만','피난자 연령만'],a:0,ex:'분말은 종별 주성분과 적응화재가 달라 약제 특성과 설비 방사원리를 함께 봅니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c11',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'자동화재탐지설비의 주 기능은?',choices:['화재징후 감지 후 수신기와 경보로 통보','직접 모든 화재를 물로 소화','소방용수 저장만','환자 이송'],a:0,ex:'자동화재탐지설비는 감지와 경보·통보가 주 기능입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c12',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C12',q:'비상방송설비의 역할로 적절한 것은?',choices:['재실자에게 음성으로 화재·피난 정보를 전달','유면을 포로 덮음','배관 압력을 직접 상승','위험물 유별 판정'],a:0,ex:'비상방송은 음성으로 화재상황과 피난정보를 전달하는 경보설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c13',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C13',q:'피난구조설비의 목적에 가장 가까운 것은?',choices:['안전한 피난·구조 지원','화재원인 감정만','위험물 운송량 조사','환자혈당 측정'],a:0,ex:'피난구조설비는 피난방향 인지와 실제 탈출·구조를 돕는 설비군입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c14',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C14',q:'소화용수설비의 핵심 목적은?',choices:['화재진압에 필요한 물을 확보·공급','연기만 감지','피난방송만 수행','구급환자 기록'],a:0,ex:'소화용수설비는 소방대의 화재진압에 필요한 수원을 확보·공급하는 기반설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c15',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C15',q:'소화활동설비의 예로 가장 적절한 것은?',choices:['제연·연결송수·무선통신보조','산부인과 처치장비','환자평가 기록지','위험물 분류표만'],a:0,ex:'소화활동설비는 소방대의 방수·배연·통신·전원 등 현장활동을 지원합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'}
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const merged=[...V.questions];const seen=new Set(merged.map(q=>norm(q.q)));for(const q of P){if(!seen.has(norm(q.q))){merged.push(q);seen.add(norm(q.q))}}
V.questions=merged;V.questionById=Object.fromEntries(merged.map(q=>[q.id,q]));V.questionsForConcept=id=>merged.filter(q=>q.conceptId===id);
V.examReadiness=()=>{
  // Evaluate the current canonical question collection at call time.
  // Later source-backed B questions (for newly explicit official scopes) must not be hidden by a stale load-time closure.
  const current=V.questions||[],verified=current.filter(q=>q.grade==='A'||q.grade==='B'),fire=verified.filter(q=>q.subject==='fire'),ems=verified.filter(q=>q.subject==='ems');
  const fireCount=new Set(fire.map(q=>q.id)).size,emsCount=new Set(ems.map(q=>q.id)).size;
  const requiredFireScopes=V.curriculum.fire.map(x=>x.id),requiredEmsScopes=V.curriculum.ems.map(x=>x.id);
  const coveredFireScopes=new Set(fire.map(q=>q.scopeId)),coveredEmsScopes=new Set(ems.map(q=>q.scopeId));
  const missingFireScopes=requiredFireScopes.filter(x=>!coveredFireScopes.has(x)),missingEmsScopes=requiredEmsScopes.filter(x=>!coveredEmsScopes.has(x));
  const scopeComplete=missingFireScopes.length===0&&missingEmsScopes.length===0;
  return{fire:fireCount,ems:emsCount,ready:fireCount>=25&&emsCount>=40&&scopeComplete,fireNeed:Math.max(0,25-fireCount),emsNeed:Math.max(0,40-emsCount),missingFireScopes,missingEmsScopes,scopeComplete,practiceScopeQuestions:P.length};
};
V.scopePractice2026={questions:P.length,grade:'P',economicTruth:'practice-only-not-real-exam-credit',scopes:['F05','F06','F07']};
})();
;

/* --- questions-fire-depth-119.js --- */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const Q=[
['119-f09-1','F03-C09','플래시오버의 직접적인 발생 메커니즘으로 가장 적절한 것은?',['산소가 고갈된 공간에 외기가 유입되어 미연소가스가 폭발적으로 점화된다','구획실에 축적된 열과 복사로 여러 가연물이 거의 동시에 발화한다','가압용기가 파열되면서 액체가 급격히 기화한다','연소유 표면에 소화용수가 들어가 유류가 넘친다'],1,'mid','개념형',['백드래프트 설명이다.','정답. 열·복사 축적에 따른 구획실 전체의 급격한 화재전이다.','BLEVE 설명이다.','슬롭오버 설명이다.']],
['119-f09-2','F03-C09','플래시오버와 백드래프트를 구분하는 핵심 기준으로 가장 적절한 것은?',['플래시오버는 열 축적, 백드래프트는 산소 유입의 영향이 핵심이다','두 현상 모두 반드시 용기 파열이 필요하다','플래시오버는 화재와 무관하고 백드래프트는 유류탱크에서만 발생한다','두 현상 모두 개방형 스프링클러 작동현상이다'],0,'high','비교형',['정답. 시험에서 가장 중요한 1차 구분축이다.','둘 다 틀린 설명이다.','프로스오버·유류화재 개념을 섞은 오답이다.','소방시설과 화재현상을 혼동한 오답이다.']],
['119-f11-1','F03-C11','백드래프트 위험이 큰 상황으로 가장 적절한 것은?',['환기가 잘되는 개방공간에서 연료가 부족한 경우','밀폐공간에서 산소가 부족하고 고온 미연소가스가 축적된 뒤 문이 열리는 경우','저온의 물이 연소유 표면에 닿는 경우','가압 액화가스용기가 외부화재로 가열되는 경우'],1,'mid','사례형',['백드래프트 전형상황이 아니다.','정답. 산소부족+미연소가스+공기유입이 핵심이다.','슬롭오버 설명이다.','BLEVE 위험상황이다.']],
['119-f12-1','F03-C12','보일오버의 설명으로 가장 적절한 것은?',['화재와 무관하게 고온 점성유체에 물이 존재해 넘치는 현상','연소유 표면에 외부 물을 방사해 급비등하는 현상','탱크화재의 열파가 하부 수분층에 도달해 수증기 팽창으로 유류가 분출되는 현상','가압용기가 파열되어 액체가 기화하는 현상'],2,'high','비교형',['프로스오버 설명이다.','슬롭오버 설명이다.','정답. 열파+하부 수분층이 핵심이다.','BLEVE 설명이다.']],
['119-f13-1','F03-C13','슬롭오버의 발생과 가장 직접적으로 연결되는 것은?',['연소 중인 뜨거운 유류 표면에 물 또는 포수용액이 유입되는 것','밀폐실에 공기가 유입되는 것','가압용기 벽이 약화되는 것','금속분이 공기 중에서 분진폭발하는 것'],0,'mid','개념형',['정답. 표면 외부수 유입이 핵심이다.','백드래프트 관련이다.','BLEVE 관련이다.','분진폭발 관련이다.']],
['119-f14-1','F03-C14','프로스오버를 다른 유류탱크 특수현상과 구분하는 단서로 가장 적절한 것은?',['반드시 화재가 있어야 한다','화재와 무관하게 고온 점성유체와 물의 접촉으로도 발생할 수 있다','항상 가압용기 파열이 선행된다','산소부족이 필수다'],1,'high','비교형',['프로스오버의 핵심과 반대다.','정답. 화재가 필수조건이 아니다.','BLEVE와 혼동한 설명이다.','백드래프트와 혼동한 설명이다.']],
['119-f15-1','F03-C15','BLEVE와 파이어볼의 관계로 가장 적절한 것은?',['BLEVE는 반드시 파이어볼과 같은 뜻이다','BLEVE 후 방출물질이 가연성이고 점화되면 파이어볼이 동반될 수 있다','파이어볼은 물이 끓어 넘치는 현상이다','BLEVE는 오직 고체 가연물에서 발생한다'],1,'high','비교형',['같은 뜻은 아니다.','정답. BLEVE 후 가연성 증기가 점화되면 파이어볼이 생길 수 있다.','보일오버류 설명과 혼동했다.','가압 액체 용기와 관련된다.']],
['119-f16-1','F03-C16','풀파이어의 특징으로 가장 적절한 것은?',['가압가스가 분출되며 길게 형성되는 화염','고인 인화성 액체의 액면 위 증기가 넓게 연소하는 화재','밀폐실에 공기가 들어와 폭발하는 현상','탱크 하부 물이 끓어 유류가 넘치는 현상'],1,'mid','개념형',['가압된 가스나 증기가 분출되며 형성되는 제트파이어의 특징으로, 고인 액체의 액면 연소와 다르다.','정답. 누출되어 고인 인화성 액체의 액면 위 증기가 넓게 연소하는 화재가 풀파이어다.','밀폐·산소부족 공간에 공기가 유입되어 폭발적으로 연소하는 백드래프트 설명으로 풀파이어와 다르다.','탱크 하부 수분층이 열파에 의해 급격히 기화해 유류가 분출되는 보일오버 설명이다.']],
['119-f17-1','F07-C17','습식 스프링클러의 특징으로 가장 적절한 것은?',['2차측 배관에 평상시 압축공기만 있다','배관에 평상시 물이 차 있어 헤드 개방 후 빠른 방수가 가능하다','개방형 헤드를 사용해 감지기 작동 시 전 구역 동시방수한다','감지기 작동만으로 폐쇄형 헤드가 모두 열린다'],1,'low','개념형',['건식 특징이다.','정답. 상시 충수로 빠른 방수가 가능하다.','일제살수식 설명이다.','폐쇄형 헤드는 개별 감열작동한다.']],
['119-f18-1','F07-C18','건식 스프링클러의 작동순서로 가장 적절한 것은?',['감지기→일제개방밸브→개방형 헤드 동시방수','헤드 개방→공기압 저하→건식밸브 개방→충수→방수','헤드 개방→즉시 배관수 방수','감지기→배관 충수→폐쇄형 헤드가 전부 개방'],1,'high','순서형',['일제살수식이다.','정답. 건식의 핵심 순서다.','습식에 가깝다.','준비작동식과도 다르고 모든 헤드 개방도 틀리다.']],
['119-f19-1','F07-C19','준비작동식과 일제살수식의 가장 중요한 차이로 적절한 것은?',['준비작동식은 폐쇄형 헤드, 일제살수식은 개방형 헤드를 사용한다','준비작동식은 물을 사용하지 않는다','일제살수식에는 감지기가 없다','둘 다 헤드가 개별 감열되어 하나씩 열린다'],0,'high','비교형',['정답. 대표 구분축이다.','둘 다 수계소화설비다.','일제살수식도 감지설비와 밸브 연동이 중요하다.','일제살수식은 개방형 헤드가 기본이다.']],
['119-f20-1','F07-C20','일제살수식 스프링클러에 대한 설명으로 옳은 것은?',['폐쇄형 헤드가 열을 받아 한 개씩 개방된다','감지설비 작동 후 일제개방밸브가 열리면 개방형 헤드에서 구역 방수가 시작된다','2차측은 평상시 항상 물로 충수되어 있다','건식밸브의 공기압 저하만으로 작동한다'],1,'mid','개념형',['폐쇄형 시스템 설명이다.','정답. 감지기+일제개방밸브+개방형 헤드가 핵심이다.','습식과 혼동했다.','건식과 혼동했다.']],
['119-f21-1','F07-C21','폐쇄형 스프링클러 헤드와 자동화재탐지 감지기의 역할 구분으로 맞는 것은?',['둘 다 동일한 장치다','헤드는 열에 의해 방수구를 개방하고 감지기는 화재징후를 전기신호로 검출한다','감지기가 물을 분사하고 헤드는 경보만 울린다','헤드는 항상 개방되어 있다'],1,'mid','비교형',['역할이 다르다.','정답. 시험에서 자주 혼동시키는 부분이다.','역할이 반대다.','개방형 헤드와 혼동했다.']]
];
const rows=Q.map(([id,conceptId,q,choices,a,difficulty,type,choiceExplanations])=>({id,grade:'P',subject:'fire',scopeId:conceptId.split('-')[0],conceptId,q,choices,a,difficulty,type,choiceExplanations,ex:choiceExplanations[a],source:'119 공식교재 기반 학습문제 · page anchor 확장중'}));
const seen=new Set(V.questions.map(x=>x.id));for(const q of rows)if(!seen.has(q.id))V.questions.push(q);
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.FireQuestions119={added:rows.length};
})();
;

/* --- questions-ems-depth-119.js --- */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const A=[
['119-e08-01','E08-C01','현장확인 단계에서 가장 우선하여 확인할 것은?',['환자의 과거병력 전체','대원과 환자의 현장 안전','2차 신체검진','세부 약물복용력'],1,'low','순서형',['병력은 이후 단계에서 더 자세히 확인한다.','정답. 현장안전이 환자 접근보다 우선한다.','2차평가는 현장확인과 1차평가 후 진행한다.','약물복용력은 SAMPLE 등 병력수집에서 다룬다.']],
['119-e08-02','E08-C02','1차평가에 대한 설명으로 가장 적절한 것은?',['모든 병력을 완전히 수집한 후에만 처치를 시작한다','생명위협 문제를 찾으면 즉시 처치하며 평가를 계속한다','세부 신체검진만을 의미한다','현장안전 확인보다 먼저 실시한다'],1,'mid','개념형',['1차평가는 처치를 지연시키는 완전문진 단계가 아니다.','정답. 문제 발견 즉시 처치가 개입한다.','세부검진은 2차평가와 연결된다.','현장안전이 먼저다.']],
['119-e08-06','E08-C06','재평가 간격에 대한 교재 기준으로 맞는 것은?',['일반 환자 약 5분, 위급 환자 약 15분','모든 환자 30분마다','일반 환자 약 15분, 위급 환자 약 5분','한 번 정상이라면 재평가하지 않는다'],2,'mid','수치형',['반대로 제시했다.','교재 기준과 다르다.','정답. 위급할수록 더 자주 재평가한다.','상태변화와 처치효과 확인을 위해 반복한다.']],
['119-e09-03','E09-C03','머리·목·척추 손상이 의심되는 환자의 기도개방에서 우선 고려할 방법은?',['머리기울임-턱들어올리기만 강하게 시행','턱 밀어올리기법을 고려해 경추 움직임을 최소화','환자를 앉혀 물을 마시게 한다','기도평가 없이 OPA부터 삽입한다'],1,'mid','사례형',['경추움직임을 증가시킬 수 있다.','정답. 외상 가능성에서는 경추 움직임 최소화가 중요하다.','기도개방법이 아니다.','기도와 구역반사 평가가 먼저다.']],
['119-e09-04','E09-C04','입인두기도기(OPA)의 적응에 가장 가까운 것은?',['의식이 명료하고 구역반사가 강한 환자','구역반사가 없는 무의식 환자','모든 코피 환자','기도가 완전히 정상인 보행환자'],1,'low','개념형',['구역반사로 구토·흡인 위험이 있다.','정답. 대표 적응이다.','직접 적응이 아니다.','필요성이 없다.']],
['119-e10-03','E10-C03','호흡곤란 환자에서 호흡수만 정상범위라는 이유로 상태를 정상으로 판단할 수 없는 이유는?',['호흡수는 측정할 수 없기 때문','호흡노력·깊이·흉곽·피부·의식 등 다른 환기·산소화 징후가 중요하기 때문','호흡수는 혈압과 같은 값이기 때문','호흡수는 외상환자에게만 의미가 있기 때문'],1,'high','판단형',['측정 가능한 활력징후다.','정답. 전체 호흡상태를 종합해야 한다.','서로 다른 지표다.','내과·외상 모두 중요하다.']],
['119-e11-06','E11-C06','AED 사용 중 올바른 행동은?',['리듬분석 중에도 환자를 계속 만진다','충격 직후 맥박만 오래 확인하고 압박을 늦춘다','분석·충격 시 접촉을 피하고 충격 후 즉시 가슴압박을 재개한다','모든 심정지 리듬에 반드시 충격한다'],2,'mid','순서형',['분석 오류와 안전문제가 생길 수 있다.','압박중단을 길게 하면 안 된다.','정답. 안전과 중단 최소화가 핵심이다.','충격불필요 리듬도 있다.']],
['119-e13-05','E13-C05','초기 저혈량성 쇼크에 대한 설명으로 옳은 것은?',['혈압이 정상이라면 쇼크가 아니다','보상기에는 빈맥·말초혈관수축 등으로 혈압이 유지될 수 있다','피부와 의식은 평가할 필요가 없다','쇼크는 오직 심장질환에서만 발생한다'],1,'high','개념형',['초기에는 혈압이 유지될 수 있다.','정답. 보상기전을 이해해야 한다.','관류평가에 중요하다.','원인은 다양하다.']],
['119-e24-03','E24-C03','성인 가슴압박의 질을 높이는 방법으로 가장 적절한 것은?',['분당 60회 정도로 천천히 누른다','가슴이 다시 올라오지 못하게 계속 체중을 싣는다','약 5cm 깊이, 분당 100~120회, 완전한 이완과 중단 최소화를 유지한다','맥박 확인을 위해 매 주기마다 오래 중단한다'],2,'mid','수치형',['분당 60회는 성인 고품질 가슴압박 권장 속도보다 느려 충분한 순환을 기대하기 어렵다.','압박 후 흉곽이 완전히 다시 올라오게 해야 심장으로 혈액이 돌아올 수 있으므로 계속 체중을 싣는 것은 부적절하다.','정답. 약 5cm 깊이, 분당 100~120회, 완전한 이완과 중단 최소화를 함께 지키는 것이 핵심이다.','맥박 확인 등으로 가슴압박을 불필요하게 오래 중단하면 관류가 떨어질 수 있어 중단시간을 최소화해야 한다.']]
];
const rows=A.map(([id,conceptId,q,choices,a,difficulty,type,choiceExplanations])=>({id,grade:'B',subject:'ems',scopeId:conceptId.split('-')[0],conceptId,q,choices,a,difficulty,type,choiceExplanations,ex:choiceExplanations[a],source:V.contentPacks?.authored?.[conceptId]?.source||'2026 소방전술3(구급)'}));
const seen=new Set(V.questions.map(x=>x.id));for(const q of rows)if(!seen.has(q.id))V.questions.push(q);V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.EMSQuestions119={added:rows.length};
})();
;

/* --- questions-ems-restored-verified-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const Q=[
  {
    id:'b-ems-restored-e02-safety-1',grade:'B',subject:'ems',scopeId:'E02',conceptId:'E02-C02',
    q:'구급대원이 현장에 도착했을 때 가장 우선하여 확인해야 할 것은?',
    choices:['현장의 안전 여부','환자의 과거병력 전체','이송병원의 병상 수','구급활동일지 작성 여부'],a:0,
    ex:'구급대원이 다치면 응급처치를 제공할 수 없으므로 현장 안전과 구급대원의 안전 확보가 우선이다.',
    choiceExplanations:['정답. 교재는 현장에 도착해서 제일 우선적으로 현장이 안전한지를 확인하도록 설명한다.','병력 확인은 환자평가 과정의 일부지만 현장 안전보다 먼저 할 수 없다.','병원선정은 이후 이송 단계에서 판단한다.','기록은 중요하지만 현장 안전 확보보다 먼저 시행하지 않는다.'],
    difficulty:'low',type:'우선순위형',source:'2026 소방전술3(구급) 29쪽',examStyle:true,questionClass:'exam-style',restoredVerified:true,pastExamClaim:false
  },
  {
    id:'b-ems-restored-e03-infection-1',grade:'B',subject:'ems',scopeId:'E03',conceptId:'E03-C01',
    q:'감염예방 원칙에 대한 설명으로 옳은 것은?',
    choices:['환자의 진단명이나 감염 상태와 관계없이 모든 환자 처치에 적용한다','확진된 감염환자에게만 적용한다','혈액이 보이는 경우에만 적용한다','땀을 포함한 모든 분비물을 동일한 감염원으로 본다'],a:0,
    ex:'감염예방은 환자의 진단명이나 감염 상태와 관계없이 모든 환자 처치에 적용한다.',
    choiceExplanations:['정답. 교재는 감염 가능성을 줄이기 위해 모든 환자 처치에 감염예방을 적용하도록 한다.','감염 여부를 미리 알 수 없는 경우가 있으므로 확진환자에게만 적용하지 않는다.','혈액뿐 아니라 체액과 분비물 등도 전파 가능성을 고려한다.','교재는 혈액이 포함되지 않은 땀은 해당 설명에서 제외한다.'],
    difficulty:'mid',type:'개념형',source:'2026 소방전술3(구급) 32쪽',examStyle:true,questionClass:'exam-style',restoredVerified:true,pastExamClaim:false
  },
  {
    id:'b-ems-restored-e04-anatomy-1',grade:'B',subject:'ems',scopeId:'E04',conceptId:'E04-C01',
    q:'해부학과 생리학의 구분으로 옳은 것은?',
    choices:['해부학은 인체의 구조를, 생리학은 인체의 기능을 연구한다','해부학은 기능만, 생리학은 구조만 연구한다','해부학과 생리학은 모두 질병명만 분류한다','해부학은 약물만, 생리학은 장비만 연구한다'],a:0,
    ex:'교재는 해부학을 인체의 구조를 연구하는 학문, 생리학을 인체 기능을 연구하는 학문으로 설명한다.',
    choiceExplanations:['정답. 구조와 기능의 구분이 핵심이다.','구조와 기능의 의미를 반대로 연결했다.','두 학문은 질병명만 분류하는 학문이 아니다.','약물이나 장비만을 연구하는 개념이 아니다.'],
    difficulty:'low',type:'비교형',source:'2026 소방전술3(구급) 51쪽',examStyle:true,questionClass:'exam-style',restoredVerified:true,pastExamClaim:false
  },
  {
    id:'b-ems-restored-e05-radio-1',grade:'B',subject:'ems',scopeId:'E05',conceptId:'E05-C03',
    q:'응급 무선통신의 일반원칙으로 옳은 것은?',
    choices:['송신기 버튼을 누른 뒤 약 1초 기다리고 말한다','무전기는 입에 밀착해서 사용한다','환자의 평가결과보다 진단명을 단정해 전달한다','30초 이상 계속 송신해 다른 사용자의 개입을 막는다'],a:0,
    ex:'교재는 첫 내용이 끊기는 것을 예방하기 위해 송신기 버튼을 누른 후 약 1초 기다리고 말하도록 한다.',
    choiceExplanations:['정답. 송신 시작 직후 첫 내용이 잘리는 것을 예방하기 위한 원칙이다.','교재는 무전기를 입에서 약 5~7cm, 45도 방향에 두도록 설명한다.','평가결과를 전달해야 하며 진단을 단정해서는 안 된다.','30초 이상 말해야 한다면 중간에 잠깐 무전을 끊어 다른 사용자가 응급상황을 전달할 수 있게 한다.'],
    difficulty:'mid',type:'원칙형',source:'2026 소방전술3(구급) 77쪽',examStyle:true,questionClass:'exam-style',restoredVerified:true,pastExamClaim:false
  },
  {
    id:'b-ems-restored-e07-aed-1',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C03',
    q:'자동심장충격기(AED)에 대한 설명으로 옳은 것은?',
    choices:['심실세동과 무맥성 심실빈맥 같은 제세동 가능 리듬을 분석해 충격을 안내한다','모든 무반응 환자에게 리듬과 관계없이 충격한다','제세동 후에는 2분간 환자를 관찰하고 가슴압박을 중단한다','리듬 분석 중에도 환자와 계속 접촉해야 한다'],a:0,
    ex:'교재는 AED가 심실세동과 무맥성 심실빈맥 같은 제세동 가능 리듬을 인식해 충격을 안내하도록 설명한다.',
    choiceExplanations:['정답. AED는 제세동 가능한 리듬을 분석해 충격 여부를 안내한다.','제세동 적응 리듬이 아닌 경우에는 충격하지 않는다.','제세동 후에는 즉시 약 2분간 심폐소생술을 재개한다.','리듬 분석과 제세동 시에는 환자 접촉을 피해야 한다.'],
    difficulty:'mid',type:'장비형',source:'2026 소방전술3(구급) 115~116쪽',examStyle:true,questionClass:'exam-style',restoredVerified:true,pastExamClaim:false
  }
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));let added=0;
for(const q of Q){
  if(ids.has(q.id)||texts.has(norm(q.q)))continue;
  if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4)throw Error('EMS_RESTORED_CHOICE_EXPLANATIONS');
  V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));added++;
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.EMSRestoredVerified119={version:'2026-ems-scope-gap-v1',added,questions:Q.map(q=>q.id),scopes:['E02','E03','E04','E05','E07'],pastExamClaim:false};
})();
;

/* --- questions-hazmat-depth-119.js --- */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const A=[
['119-h1-2','F05-C02','제1류 위험물 화재의 일반적인 소화원리로 가장 적절한 것은?',['산소를 방출할 수 있으므로 대량의 물로 냉각해 분해와 연소를 억제한다','모든 품목에 물 사용을 절대 금지한다','질식만 하면 항상 즉시 소화된다','액면을 내알코올포로 덮는 것이 공통 원칙이다'],0,'mid','원리형',['정답. 제1류 일반원칙은 대량주수 냉각이다.','알칼리금속 과산화물 등 예외는 있지만 전체 물금지는 아니다.','자체 산소공급 가능성 때문에 질식만으로 충분하지 않을 수 있다.','제4류 수용성 인화성액체와 관련된 설명이다.']],
['119-h2-2','F05-C03','제2류 위험물 중 물 또는 산과의 접촉을 특히 주의해야 하는 것으로 가장 적절한 것은?',['철분·금속분·마그네슘 등 금속분 계열','유황만','인화성고체만','모든 제2류가 동일'],0,'mid','비교형',['정답. 금속분은 산 또는 물 접촉을 특히 주의한다.','유황만의 공통특성은 아니다.','인화성고체만의 공통특성은 아니다.','품목별 차이가 있으므로 틀리다.']],
['119-h3-2','F05-C04','제3류 황린에 대한 설명으로 옳은 것은?',['금수성만 있어 물을 절대 사용할 수 없다','자연발화성 위험 때문에 물속에 저장하며 물계통 소화가 가능할 수 있다','제4류 인화성액체다','산화성액체로 내산용기에 저장한다'],1,'high','예외형',['황린은 자연발화성 중심의 품목으로 물 사용이 가능하다.','정답. 제3류의 대표 예외 포인트다.','제4류가 아니다.','제6류 설명이다.']],
['119-h4-2','F05-C05','제4류 인화성액체의 증기와 관련한 설명으로 가장 적절한 것은?',['증기비중이 1보다 큰 것이 많아 낮은 곳에 체류·이동할 수 있다','모든 증기는 공기보다 가벼워 천장에만 모인다','증기는 점화와 무관하다','액체 자체만 타므로 증기확산은 고려하지 않는다'],0,'mid','원리형',['정답. 낮은 곳으로 멀리 이동한 증기가 점화원과 만날 수 있다.','반대 설명이다.','증기-공기 혼합과 점화가 핵심이다.','제4류 연소메커니즘을 잘못 설명했다.']],
['119-h4-3','F05-C05','수용성 제4류 위험물 화재에 사용하는 포소화약제에 대한 설명으로 맞는 것은?',['일반 단백포만 사용해야 한다','내알코올포 등 수용성 위험물용 포를 고려한다','모든 포 사용이 금지된다','금속화재용 분말만 사용한다'],1,'high','적응성형',['일반 포는 수용성 액체에서 포막 유지에 불리할 수 있어 일률적인 정답이 아니다.','정답. 수용성 위험물 화재에서는 내알코올포 등 수용성 위험물용 포를 고려한다.','수용성 위험물에도 적응성이 있는 포소화약제를 사용할 수 있으므로 모든 포 금지는 틀리다.','금속화재용 분말은 제4류 수용성 인화성액체의 공통 소화원칙이 아니다.']],
['119-h5-2','F05-C06','제5류 위험물의 화재 대응으로 가장 적절한 것은?',['자기반응성이므로 안전거리를 확보하고 일반적으로 대량의 물로 냉각한다','산소 차단만 하면 모든 반응이 즉시 멈춘다','충격과 마찰을 적극 가한다','다른 위험물과 혼합해 저장한다'],0,'high','원리형',['정답. 대량주수와 폭발위험 안전거리 확보가 핵심이다.','자기반응성 때문에 틀린 단정이다.','발화·폭발 위험을 높인다.','분리 저장이 원칙이다.']],
['119-h6-2','F05-C07','제6류 위험물의 공통성질로 가장 적절한 것은?',['모두 불연성이지만 산화성이 강하고 부식성·유해증기 위험이 있다','모두 가연성고체다','모두 물보다 가벼운 인화성액체다','모두 자기반응성고체다'],0,'low','개념형',['정답. 불연성이지만 강산화성 때문에 위험하다.','제2류 설명이다.','제4류와 혼동했다.','제5류와 혼동했다.']]
];
const rows=A.map(([id,conceptId,q,choices,a,difficulty,type,choiceExplanations])=>({id,grade:'P',subject:'fire',scopeId:'F05',conceptId,q,choices,a,difficulty,type,choiceExplanations,ex:choiceExplanations[a],source:'소방청 국가위험물통합정보시스템 · 유별 공통사항'}));
const seen=new Set(V.questions.map(x=>x.id));for(const q of rows)if(!seen.has(q.id))V.questions.push(q);V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.HazmatQuestions119={added:rows.length};
})();
;

/* --- questions-facilities-depth-119.js --- */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const INDOOR_HYDRANT_RULE_SOURCE='현행 옥내소화전설비 화재안전성능·기술기준(NFPC/NFTC 102) · 국가법령정보센터 · P급 연습근거';
const INDOOR_HYDRANT_RULE_URL='https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000281772&chrClsCd=010201';
const A=[
['119-fac-01a','F07-C01','다음 중 소화활동설비의 대표 목적은?',['화재를 감지해 수신기에 신호만 보낸다','소방대의 방수·배연·전원·통신 활동을 지원한다','피난자에게 출구방향만 표시한다','위험물 지정수량을 계산한다'],1,'mid','분류형',['경보설비 기능에 가깝다.','정답. 소화활동설비는 소방대 현장활동 지원이 핵심이다.','피난구조설비 기능에 가깝다.','위험물 법령 학습내용이다.']],
['119-fac-01b','F07-C01','소방시설 5분류와 기능의 연결로 가장 적절한 것은?',['소화용수설비-화재감지','경보설비-화재·위험 통보','피난구조설비-가압송수','소화활동설비-위험물 저장'],1,'low','매칭형',['소화용수는 수원확보 목적이다.','정답. 경보설비는 감지·통보가 핵심이다.','피난구조는 피난·구조 지원이다.','소화활동설비 기능이 아니다.']],
['119-fac-02a','F07-C02','소화기를 사용하려는 초기화재 상황에서 가장 우선 함께 고려할 것은?',['안전한 퇴로와 약제 적응성','불길과 가까워질수록 좋다는 원칙','연기가 많을수록 오래 머무르는 것','소화기 종류와 무관하게 물을 추가하는 것'],0,'mid','상황형',['정답. 초기소화는 적응성 있는 약제와 퇴로 확보가 전제다.','화재성장 시 거리를 확보해야 한다.','연기·열이 커지면 대피가 우선이다.','약제별 부적응성이 존재한다.']],
['119-fac-03a','F07-C03','옥내소화전설비와 스프링클러설비의 대표 차이는?',['옥내소화전은 사람이 호스를 전개해 방수하고 스프링클러는 헤드가 자동작동한다','둘 다 반드시 개방형 헤드로만 방수한다','옥내소화전은 경보만 하고 물은 사용하지 않는다','스프링클러는 소방대만 사용할 수 있다'],0,'mid','비교형',['정답. 수동 호스방수와 자동 헤드방수가 대표 구분점이다.','옥내소화전에는 스프링클러 헤드가 없다.','옥내소화전은 직접 방수한다.','스프링클러는 자동소화설비다.']],
['119-fac-03b','F07-C03','현행 옥내소화전설비 기술기준상 펌프 성능시험 기준의 연결로 옳은 것은?',['체절운전 140% 이하 · 정격토출량 150% 운전 시 정격토출압력 65% 이상','체절운전 65% 이하 · 정격토출량 140% 운전 시 정격토출압력 150% 이상','체절운전 150% 이상 · 정격토출량 65% 운전 시 정격토출압력 140% 이하','체절운전과 과부하운전의 압력기준은 규정하지 않는다'],0,'high','수치형',['정답. 체절운전은 정격토출압력의 140%를 초과하지 않고, 정격토출량의 150% 운전 시 정격토출압력의 65% 이상이어야 한다.','140·150·65의 역할을 서로 바꾼 오답이다.','상한·운전유량·최저압력의 위치를 모두 바꾼 오답이다.','현행 기준에 수치가 명시되어 있다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-03c','F07-C03','옥내소화전이 가장 많이 설치된 층에 4개가 있을 때 현행 기술기준상 필요한 수원의 최소 유효수량은?',['2.6 ㎥','5.2 ㎥','7.8 ㎥','10.4 ㎥'],1,'mid','계산형',['1개 기준량만 적용한 값이다.','정답. 2개 이상 설치된 경우 계산상 2개를 적용하므로 2.6 ㎥ × 2 = 5.2 ㎥이다.','3개를 적용한 값이지만 계산상 최대 적용개수는 2개다.','설치된 4개를 그대로 모두 곱하지 않는다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-03d','F07-C03','옥내소화전 가압송수장치의 수원 수위가 펌프보다 낮은 위치에 있을 때 설치해야 하는 장치는?',['물올림장치','자동화재속보설비','비상방송설비','유도등'],0,'low','조건형',['정답. 수원 수위가 펌프보다 낮으면 물올림장치를 설치한다.','화재신호 외부 통보설비다.','음성 경보설비다.','피난구조설비다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-03e','F07-C03','옥내소화전설비에서 기동용수압개폐장치를 기동장치로 사용할 경우 함께 설치해야 하는 것은?',['충압펌프','불꽃감지기','피난사다리','포소화약제 저장탱크'],0,'mid','조건형',['정답. 기동용수압개폐장치를 사용하는 경우 충압펌프를 설치한다.','자동화재탐지설비 구성품과 혼동한 오답이다.','피난구조설비다.','포소화설비 구성과 혼동한 오답이다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-03f','F07-C03','현행 옥내소화전설비 성능기준상 가압송수장치가 기동된 뒤의 정지 원칙으로 옳은 것은?',['자동으로 정지되지 않도록 한다','10초 뒤 반드시 자동정지한다','방수구를 열면 즉시 자동정지한다','충압펌프가 있으면 주펌프는 자동정지해야 한다'],0,'high','원칙형',['정답. 가압송수장치가 기동된 경우 자동으로 정지되지 않도록 하는 것이 원칙이다.','정해진 10초 자동정지 규정이 아니다.','방수 중 펌프가 정지하는 방식이 아니다.','충압펌프 유무로 주펌프 자동정지를 요구하지 않는다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-03g','F07-C03','옥내소화전 펌프의 체절운전에 대한 설명으로 가장 적절한 것은?',['펌프 토출측 개폐밸브를 닫은 상태에서 성능시험 목적으로 운전한다','흡입측 배관을 제거한 상태에서만 운전한다','모든 방수구를 최대로 개방해 최대유량만 측정한다','충압펌프를 분리한 상태를 뜻한다'],0,'high','정의형',['정답. 체절운전은 펌프 토출측 개폐밸브를 닫은 상태에서 펌프를 운전하는 성능시험 조건이다.','체절운전의 정의가 아니다.','최대유량 시험과 체절운전을 혼동한 설명이다.','충압펌프 분리 여부가 정의의 핵심이 아니다.'],INDOOR_HYDRANT_RULE_SOURCE,INDOOR_HYDRANT_RULE_URL],
['119-fac-04a','F07-C04','옥외소화전의 역할로 가장 적절한 것은?',['건물 외부의 방수거점을 제공한다','천장부 열을 감지해 자동방수한다','피난방향을 음성으로 방송한다','화재원인을 조사한다'],0,'low','개념형',['정답. 외부에서 호스를 연결해 방수하는 거점이다.','스프링클러 설명이다.','비상방송 기능이다.','화재조사 영역이다.']],
['119-fac-06a','F07-C06','화재조기진압용 스프링클러의 목적에 가장 가까운 것은?',['고위험 화재를 초기에 강한 방수로 진압하는 것','연기만 감지하는 것','소방용수를 저장만 하는 것','피난방향만 표시하는 것'],0,'mid','목적형',['정답. 조기진압 자체가 핵심 목적이다.','경보설비 기능이다.','소화용수설비 기능이다.','피난구조설비 기능이다.']],
['119-fac-07a','F07-C07','미분무소화설비에서 물방울을 매우 작게 만드는 이유로 가장 적절한 것은?',['표면적을 늘려 열흡수·증발효과를 높이기 위해','물을 전기적으로 충전하기 위해','방수량을 무조건 0으로 만들기 위해','피난방송 음량을 높이기 위해'],0,'high','원리형',['정답. 작은 물방울은 표면적 증가로 열교환이 빨라진다.','핵심 목적이 아니다.','물을 쓰지 않는 설비가 아니다.','경보설비와 무관하다.']],
['119-fac-08a','F07-C08','포소화설비가 가연성액체 화재에 효과적인 주된 이유는?',['액면을 포막으로 덮어 증기 발생과 산소접촉을 줄이기 때문','액체를 금속으로 바꾸기 때문','산소를 추가 공급하기 때문','모든 유류를 물에 녹이기 때문'],0,'mid','원리형',['정답. 액면 피복·증기억제와 냉각이 핵심이다.','물리적으로 불가능한 설명이다.','연소를 촉진할 수 있다.','포의 소화원리가 아니다.']],
['119-fac-09a','F07-C09','가스계 소화설비 운용에서 방출 전 대피가 중요한 이유는?',['소화농도가 사람에게도 위험할 수 있기 때문','가스계는 항상 폭발하기 때문','가스계는 화재를 키우기 때문','가스계는 전기를 발생시키기 때문'],0,'mid','안전형',['정답. 산소농도 저하나 약제 노출 등 인명위험이 있다.','모든 가스계가 폭발하는 것은 아니다.','적정 사용 시 소화를 목적으로 한다.','핵심 위험이 아니다.']],
['119-fac-10a','F07-C10','분말소화설비의 소화작용과 가장 관련 깊은 것은?',['화염 연쇄반응 억제','산소 생성','가연물 공급','열원 추가'],0,'low','원리형',['정답. 부촉매·연쇄반응 억제가 핵심이다.','소화와 반대다.','소화와 반대다.','소화와 반대다.']],
['119-fac-11a','F07-C11','자동화재탐지설비의 일반적인 신호 흐름으로 가장 적절한 것은?',['감지기→수신기→경보·표시','수신기→화재발생→감지기','스프링클러헤드→피난기구→수신기','소화수조→감지기→방수구'],0,'mid','순서형',['정답. 감지 신호가 수신기로 전달되어 표시·경보로 이어진다.','화재가 수신기로부터 발생하는 것이 아니다.','서로 다른 설비를 섞은 오답이다.','수계·경보설비를 혼동했다.']],
['119-fac-11b','F07-C11','열감지기와 스프링클러 폐쇄형 헤드의 관계 설명으로 옳은 것은?',['둘 다 같은 장치라 감지기 신호가 헤드를 직접 여는 것이 원칙이다','감지기는 전기신호를 검출하고 폐쇄형 헤드는 자체 감열부로 개방될 수 있다','헤드는 경보만 하고 감지기가 물을 방사한다','둘 다 피난구조설비다'],1,'high','비교형',['일반 폐쇄형 헤드와 감지기는 별도 장치다.','정답. 역할과 작동원리를 구분해야 한다.','역할이 반대다.','둘 다 해당 분류가 아니다.']],
['119-fac-12a','F07-C12','비상방송설비의 대표 역할은?',['재실자에게 음성으로 화재·피난정보를 전달','유류 액면에 포를 방사','소화수조에 물을 저장','가압용기를 냉각'],0,'low','개념형',['정답. 음성 피난정보 전달이 핵심이다.','포소화설비 역할이다.','소화용수설비에 가깝다.','직접적인 비상방송 기능이 아니다.']],
['119-fac-13a','F07-C13','피난구조설비에서 유도등과 비상조명의 차이로 가장 적절한 것은?',['유도등은 출구·방향 안내, 비상조명은 정전 시 시야 확보','둘 다 직접 소화약제를 방사','유도등은 소방용수 저장, 비상조명은 송수','둘 다 화재원인을 자동판정'],0,'mid','비교형',['정답. 안내와 조명의 기능 차이다.','피난설비는 직접소화가 주목적이 아니다.','소화용수·활동설비와 혼동했다.','화재조사 기능이 아니다.']],
['119-fac-14a','F07-C14','소화용수설비와 직접 소화설비의 구분으로 옳은 것은?',['소화용수설비는 필요한 물을 확보·공급하고 소화설비는 이를 화점에 방출할 수 있다','소화용수설비는 연기만 감지한다','소화설비는 물을 절대 사용하지 않는다','두 분류는 항상 동일하다'],0,'mid','비교형',['정답. 수원확보와 직접방수 기능을 구분한다.','경보설비 설명과 다르다.','수계소화설비가 존재하므로 물을 절대 사용하지 않는다는 설명은 틀리다.','소화용수설비와 직접 소화설비는 기능과 분류 목적이 서로 다르다.']],
['119-fac-15a','F07-C15','연결송수관설비의 대표 목적은?',['소방대가 건물 내부 필요한 위치로 물을 공급하도록 지원','연기를 감지해 경보만 울림','피난자에게 조명을 제공','위험물 지정수량 계산'],0,'mid','목적형',['정답. 소방대 송수활동 지원이 핵심이다.','경보설비 기능이다.','비상조명 기능이다.','위험물 법규 내용이다.']],
['119-fac-15b','F07-C15','제연설비의 목적에 가장 가까운 것은?',['연기 이동을 제어해 피난과 소방활동 환경을 개선','불꽃을 전기신호로 바꾸는 것만','소방용수를 저장하는 것만','위험물 용기를 냉장보관하는 것'],0,'high','목적형',['정답. 연기 제어로 피난·진입 환경을 개선한다.','감지설비 일부 기능과 혼동했다.','소화용수설비 기능이다.','제연설비와 무관하다.']]
];
const rows=A.map(([id,conceptId,q,choices,a,difficulty,type,choiceExplanations,source,sourceUrl])=>({id,grade:'P',subject:'fire',scopeId:'F07',conceptId,q,choices,a,difficulty,type,choiceExplanations,ex:choiceExplanations[a],source:source||'2026 예방실무1 · 소방시설 종류·작동원리·사용법',...(sourceUrl?{sourceUrl}:{})}));
const seen=new Set(V.questions.map(x=>x.id));for(const q of rows)if(!seen.has(q.id))V.questions.push(q);
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.FacilitiesQuestions119={added:rows.length,indoorHydrantPumpPracticeIds:rows.filter(q=>q.conceptId==='F07-C03'&&q.sourceUrl===INDOOR_HYDRANT_RULE_URL).map(q=>q.id)};
})();

;

/* --- questions-detector-depth-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const SRC='감지기의 형식승인 및 제품검사의 기술기준 제2조·제3조';
const rows=[
{id:'119-fac-det-01',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'차동식스포트형 감지기의 작동원리를 가장 정확히 설명한 것은?',choices:['일국소의 주위온도가 일정 상승률 이상이 될 때 열 효과로 작동한다','일국소가 일정 온도값에 도달할 때만 작동한다','발광부와 수광부 사이 연기가 광로를 가릴 때 작동한다','불꽃의 적외선만 검출하고 자외선은 검출하지 않는다'],a:0,difficulty:'mid',type:'원리형',choiceExplanations:['정답. 차동식은 온도 상승률, 스포트형은 일국소 열 효과가 핵심이다.','정온식스포트형 설명이다.','광전식분리형 설명이다.','불꽃감지기는 적외선·자외선을 포함한 불꽃을 검출한다.']},
{id:'119-fac-det-02',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'보상식스포트형 감지기에 대한 설명으로 옳은 것은?',choices:['차동식스포트형과 정온식스포트형 성능을 겸하고 어느 한 기능이 작동하면 신호를 낸다','차동식분포형과 광전식분리형을 반드시 동시에 작동시킨다','연기농도와 불꽃을 동시에 검출해야만 작동한다','항상 전선 모양의 감열부만 사용한다'],a:0,difficulty:'high',type:'개념형',choiceExplanations:['정답. 현행 기술기준 제3조의 보상식스포트형 정의다.','서로 다른 감지기 구조를 잘못 결합한 설명이다.','복합형 일반 개념과도 일치하지 않는다.','정온식감지선형의 외형 특징과 혼동한 설명이다.']},
{id:'119-fac-det-03',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'이온화식스포트형과 광전식스포트형의 구분으로 가장 적절한 것은?',choices:['이온화식은 연기에 따른 이온전류 변화, 광전식은 연기에 따른 광전소자 광량 변화를 이용한다','이온화식은 일정 온도, 광전식은 온도 상승률만 이용한다','둘 다 발광부와 수광부 사이의 장거리 광로만 이용한다','둘 다 불꽃의 적외선·자외선만 검출한다'],a:0,difficulty:'mid',type:'비교형',choiceExplanations:['정답. 두 연기감지기의 대표 검출 물리량 차이다.','열감지기 구분을 섞은 오답이다.','광전식분리형의 구조와 혼동했다.','불꽃감지기 설명이다.']},
{id:'119-fac-det-04',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'광전식분리형 감지기의 구조·작동 설명으로 옳은 것은?',choices:['발광부와 수광부 사이 공간에 연기가 포함될 때 작동한다','일국소 온도가 일정 온도 이상일 때 작동하는 선형 감열 방식만 뜻한다','공기를 흡입하지 않으면 어떤 연기도 감지할 수 없다','화재신호를 받으면 스프링클러 폐쇄형 헤드를 전기적으로 전부 개방한다'],a:0,difficulty:'mid',type:'구조형',choiceExplanations:['정답. 발광부·수광부 사이 공간의 연기를 감시하는 분리형 구조다.','정온식감지선형과 혼동한 설명이다.','공기흡입형의 특징을 잘못 일반화했다.','폐쇄형 헤드의 감열작동과 감지기를 혼동했다.']},
{id:'119-fac-det-05',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'공기흡입형 연기감지기의 핵심 작동방식은?',choices:['감지하려는 위치의 공기를 흡입해 그 공기에 일정 농도의 연기가 포함됐는지 검출한다','넓은 범위의 열 효과가 누적되면 압력만으로 작동한다','일정 온도 이상에서만 선형 감열부가 작동한다','불꽃의 자외선을 차단해 화재를 소화한다'],a:0,difficulty:'mid',type:'원리형',choiceExplanations:['정답. 대상 위치 공기를 흡입해 연기 포함 여부를 검출한다.','차동식분포형과도 정확히 일치하지 않는 설명이다.','정온식감지선형 설명이다.','감지기는 소화장치가 아니다.']},
{id:'119-fac-det-06',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'현행 감지기 기술기준에서 불꽃감지기가 검출하는 대상으로 옳은 것은?',choices:['화재의 불꽃이며 적외선과 자외선을 포함한다','오직 주위온도의 일정 상승률만 검출한다','연기의 이온전류 변화만 검출한다','수신기에서 발생한 전압만 검출한다'],a:0,difficulty:'low',type:'정의형',choiceExplanations:['정답. 불꽃에는 적외선·자외선이 포함된다.','차동식 열감지기 설명이다.','이온화식 연기감지기 설명이다.','감지대상의 정의가 아니다.']}
].map(q=>({...q,source:SRC,ex:q.choiceExplanations[q.a]}));
const existing=new Set(V.questions.map(q=>q.id));
for(const q of rows){if(existing.has(q.id))continue;if(q.choices.length!==4||!Number.isInteger(q.a)||q.a<0||q.a>3)throw new Error('DETECTOR_QUESTION_CONTRACT '+q.id);V.questions.push(q);existing.add(q.id)}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
for(const id of rows.map(q=>q.id))if(!V.questionById[id])throw new Error('DETECTOR_QUESTION_MISSING '+id);
V.DetectorQuestions119={version:'119-detector-questions-v1',added:rows.length,conceptId:'F07-C11',source:SRC,ids:rows.map(q=>q.id)};
})();

;

/* --- questions-suppression-depth-119.js --- */
'use strict';
(()=>{const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const Q=[
['119-sup-01a','F04-C01','연소의 연쇄반응을 직접 억제하는 소화원리는?',['제거소화','질식소화','냉각소화','부촉매소화'],3,'low','개념형',['제거는 가연물 자체나 공급을 차단한다.','질식은 산소 접촉·농도를 낮춘다.','냉각은 온도를 낮춘다.','정답. 부촉매소화는 라디칼 연쇄반응을 억제한다.']],
['119-sup-01b','F04-C01','가연성가스의 공급밸브를 잠가 화재를 끄는 것은 어떤 소화원리인가?',['제거소화','질식소화','냉각소화','부촉매소화'],0,'mid','사례형',['정답. 연료 공급 자체를 차단하는 제거소화다.','산소 차단이 중심이 아니다.','온도 저하가 중심이 아니다.','연쇄반응 억제가 중심이 아니다.']],
['119-sup-02a','F04-C02','소화약제 선택조건으로 가장 부적절한 것은?',['저장 중 안정성','인체와 설비에 대한 안전성','환경영향','소화성능만 좋다면 독성은 무시'],3,'mid','판단형',['저장안정성은 중요한 조건이다.','인체·설비 안전성도 중요하다.','환경영향도 고려한다.','정답. 소화력만으로 독성·부식성·환경문제를 무시할 수 없다.']],
['119-sup-02b','F04-C02','정밀 전기설비실에 소화약제를 선택할 때 특히 고려할 조건은?',['잔류물과 전기전도성','가연물 색상','건물 외벽 재료만','대피인원과 무관한 가격만'],0,'high','적용형',['정답. 전기·정밀설비는 비전도성과 잔류오염이 중요한 선택요소다.','직접적인 약제 선택기준이 아니다.','한 요소만으로 약제를 결정할 수 없다.','인명안전 등 다른 조건도 함께 고려해야 한다.']],
['119-sup-03a','F04-C03','물 소화약제의 주된 소화효과는?',['냉각','부촉매','제거','화학적 연쇄반응 생성'],0,'low','개념형',['정답. 높은 비열과 증발잠열에 따른 냉각이 핵심이다.','물의 주효과가 아니다.','상황에 따라 제거효과가 있을 수 있으나 주효과가 아니다.','소화와 반대되는 설명이다.']],
['119-sup-03b','F04-C03','비수용성 유류화재에 강한 직사주수가 위험할 수 있는 이유는?',['유류가 퍼져 연소면적이 커질 수 있어서','항상 전기가 발생해서','물은 절대 기화하지 않아서','유류가 반드시 고체가 되어서'],0,'high','상황형',['정답. 물보다 가벼운 유류가 퍼지며 화재면이 확대될 수 있다.','전기가 반드시 생기는 것은 아니다.','물은 열을 받아 기화한다.','일반적인 현상이 아니다.']],
['119-sup-04a','F04-C04','포 소화약제의 대표적인 복합 소화효과는?',['질식과 냉각','제거와 부촉매만','충격과 마찰','산소 생성과 가열'],0,'low','개념형',['정답. 액면 피복에 의한 질식과 수분의 냉각이 핵심이다.','대표 주효과 설명이 아니다.','소화효과가 아니다.','연소를 촉진할 수 있는 방향이다.']],
['119-sup-04b','F04-C04','교재 기준 저팽창포의 팽창비 구분으로 맞는 것은?',['20 이하','20 초과 80 미만만','80 이상','항상 100 이상'],0,'mid','수치형',['정답. 국내 구분에서 저팽창포는 팽창비 20 이하로 설명된다.','저팽창 기준이 아니다.','80 이상은 고팽창포 구분과 연결된다.','교재 기준과 다르다.']],
['119-sup-05a','F04-C05','CO₂ 소화약제의 주된 소화작용은?',['질식','냉각','제거','가연물 생성'],0,'low','개념형',['정답. 산소농도를 낮추는 질식효과가 가장 크다.','냉각은 보조효과다.','가연물 제거가 주효과가 아니다.','소화와 반대되는 설명이다.']],
['119-sup-05b','F04-C05','CO₂ 소화약제의 장점과 위험을 올바르게 짝지은 것은?',['비전도·잔사 없음 / 고농도 질식위험','전도성 높음 / 인체 무해','잔사 많음 / 산소 증가','A급만 사용 / 감전 증가'],0,'high','복합형',['정답. 전기설비에 유리하지만 인명 질식위험이 있다.','비전도성이 특징이며 인체 무해가 아니다.','잔사가 없고 산소를 증가시키지 않는다.','B·C급 중심이고 감전위험을 높이는 약제가 아니다.']],
['119-sup-06a','F04-C06','할론 소화약제의 핵심 소화기구는?',['연쇄반응 억제','물의 기화잠열','가연물 제거만','산소 공급'],0,'low','개념형',['정답. 부촉매·억제소화가 핵심이다.','물 소화약제와 관련된 설명이다.','주된 할론 기구가 아니다.','소화가 아니라 연소 촉진 방향이다.']],
['119-sup-06b','F04-C06','할론 대체약제가 개발된 주요 배경은?',['오존층 등 환경영향 문제','물보다 무겁지 않아서','전기화재에 절대 사용할 수 없어서','소화력이 전혀 없어서'],0,'mid','이유형',['정답. 오존층 파괴 등 환경문제가 중요한 배경이다.','주된 개발배경이 아니다.','할론은 전기설비에 적용하기 좋은 특성이 있었다.','소화력이 없어서가 아니다.']],
['119-sup-07a','F04-C07','IG-541의 구성으로 맞는 것은?',['N₂ 52% + Ar 40% + CO₂ 8%','N₂ 50% + Ar 50%','Ar 100%','N₂ 100%'],0,'high','수치형',['정답. IG-541의 대표 조성이다.','IG-55 구성이다.','IG-01이다.','IG-100이다.']],
['119-sup-07b','F04-C07','IG-55의 구성으로 맞는 것은?',['N₂ 50% + Ar 50%','N₂ 52% + Ar 40% + CO₂ 8%','CO₂ 100%','Ar 100%'],0,'mid','수치형',['정답. IG-55는 질소와 아르곤 50:50 혼합이다.','IG-541 구성이다.','CO₂ 단일 약제가 아니다.','IG-01과 혼동한 보기다.']],
['119-sup-08a','F04-C08','제3종 분말소화약제의 주성분과 적응화재 조합으로 맞는 것은?',['제1인산암모늄 / ABC','탄산수소나트륨 / ABC','탄산수소칼륨 / A급만','이산화탄소 / BC'],0,'mid','매칭형',['정답. 제3종은 제1인산암모늄계 ABC분말이다.','탄산수소나트륨은 제1종 BC분말이다.','탄산수소칼륨은 제2종 BC분말과 연결된다.','분말 주성분이 아니다.']],
['119-sup-08b','F04-C08','BC 분말에 해당하지 않는 것은?',['제1종','제2종','제3종','제4종'],2,'high','분류형',['제1종은 BC분말이다.','제2종은 BC분말이다.','정답. 제3종은 ABC분말이다.','제4종은 BC분말이다.']]
];
const rows=Q.map(([id,conceptId,q,choices,a,difficulty,type,choiceExplanations])=>({id,grade:'B',subject:'fire',scopeId:'F04',conceptId,q,choices,a,difficulty,type,choiceExplanations,ex:choiceExplanations[a],source:V.contentPacks?.authored?.[conceptId]?.source||'소방전술1(화재2)'}));
const seen=new Set(V.questions.map(x=>x.id));for(const q of rows)if(!seen.has(q.id))V.questions.push(q);
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);V.SuppressionQuestions119={added:rows.length};
})();
;
