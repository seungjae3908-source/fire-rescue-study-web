/* V69 startup-minimal runtime: curriculum + base question foundation */
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
;

/* --- question-difficulty.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const LEVELS={
  low:{id:'low',label:'하',title:'기초',desc:'정의·대표수치·직접회상 중심'},
  mid:{id:'mid',label:'중',title:'표준',desc:'비교·예외·상황판단·2단계 사고'},
  high:{id:'high',label:'상',title:'심화',desc:'지엽·예외·복합비교·계산·함정선지'}
};
const PROFILES={
  easy:{label:'쉬움',mix:{low:.65,mid:.30,high:.05}},
  standard:{label:'표준',mix:{low:.25,mid:.55,high:.20}},
  hard:{label:'어려움',mix:{low:.10,mid:.40,high:.50}},
  extreme:{label:'지엽집중',mix:{low:.05,mid:.25,high:.70}}
};
function infer(q){
  if(q.difficulty&&LEVELS[q.difficulty])return q.difficulty;
  const t=(q.q||'')+' '+(q.ex||'');
  if(/계산|배수|옳지 않은|모두|예외|제외|비교|조합|순서|가장 적절하지/.test(t))return'high';
  if(/구분|원리|상황|적절한|특징|연결/.test(t))return'mid';
  return'low';
}
function annotate(list=[]){for(const q of list){q.difficulty=infer(q);q.difficultyLabel=LEVELS[q.difficulty].label}return list}
function stats(list=[]){const out={low:0,mid:0,high:0};for(const q of list)out[infer(q)]++;return out}
V.QuestionDifficulty={levels:LEVELS,profiles:PROFILES,infer,annotate,stats};
if(Array.isArray(V.questions))annotate(V.questions);
})();
;
;

/* --- question-quality-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const normalize=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
function isExamStyle(q){
  return !!q&&/^119-/.test(q.id||'')&&Array.isArray(q.choices)&&q.choices.length===4&&new Set(q.choices.map(normalize)).size===4&&Number.isInteger(q.a)&&q.a>=0&&q.a<4&&Array.isArray(q.choiceExplanations)&&q.choiceExplanations.length===4&&q.choiceExplanations.every(x=>String(x||'').trim().length>=8)&&!!q.difficulty&&!!q.type&&!!q.source;
}
function classify(q){return isExamStyle(q)?'exam-style':'foundation-drill'}
function forConcept(id){return (V.questionsForConcept?.(id)||[]).filter(isExamStyle)}
function drillsForConcept(id){return (V.questionsForConcept?.(id)||[]).filter(q=>!isExamStyle(q))}
function audit(){
 const qs=V.questions||[],exam=qs.filter(isExamStyle),drill=qs.filter(q=>!isExamStyle(q)),dup=new Map();
 for(const q of exam){const k=normalize(q.q);dup.set(k,(dup.get(k)||0)+1)}
 const duplicateTexts=[...dup].filter(([,n])=>n>1).map(([q,n])=>({q,n}));
 const byDifficulty={low:0,mid:0,high:0},byType={};for(const q of exam){byDifficulty[q.difficulty]=(byDifficulty[q.difficulty]||0)+1;byType[q.type]=(byType[q.type]||0)+1}
 return{total:qs.length,examStyle:exam.length,foundationDrill:drill.length,duplicateTexts,byDifficulty,byType};
}
for(const q of V.questions||[]){q.questionClass=classify(q);if(isExamStyle(q))q.examStyle=true}
V.QuestionQuality119={isExamStyle,classify,forConcept,drillsForConcept,audit,contract:{fourChoices:true,singleAnswer:true,difficulty:true,type:true,allChoiceExplanations:true,source:true,noDuplicateText:true}};
})();
;
;

/* --- question-type-119.js --- */
'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const FAMILIES={
  recall:{key:'recall',label:'기억·개념'},
  compare:{key:'compare',label:'비교·구분'},
  process:{key:'process',label:'순서·절차'},
  principle:{key:'principle',label:'원리·구조'},
  numeric:{key:'numeric',label:'수치·계산'},
  scenario:{key:'scenario',label:'상황·판단'},
  trap:{key:'trap',label:'예외·함정'},
  integrated:{key:'integrated',label:'복합·통합'}
};
const RULES=[
  ['numeric',/계산|수치|비율|농도|열량|공기비|몰형|면적|온도|압력|점적|팽창비|지정수량/],
  ['trap',/함정|예외|금기|주의|위험징후|경고징후|전조|악화|배제/],
  ['process',/순서|절차|흐름|진행|단계|주기|재평가|연계|분기|과정|재개|중단|동선/],
  ['compare',/비교|구분|분류|매칭|소속|종별|감별/],
  ['principle',/원리|기전|법칙|반응식|작동|생리|해부|기능|구성|체계|경로|구조|메커니즘/],
  ['scenario',/사례|상황|판단|평가|선택|처치|안전|적응|위험|인식|인지|판독|운용|적용|관리|병원|이송|노출|동의|우선|방호|거부|지휘|통신|대응|확인/],
  ['integrated',/복합|통합|종합|조합/]
];
function classify(q){
  const raw=String(q?.type||'').trim();
  for(const [key,re] of RULES)if(re.test(raw))return{...FAMILIES[key],rawType:raw,matched:true};
  return{...FAMILIES.recall,rawType:raw,matched:false};
}
function audit(){
  const isExam=V.QuestionQuality119?.isExamStyle||(()=>true);
  const rows=(V.questions||[]).filter(isExam),rawTypes=new Set(),byFamily=Object.fromEntries(Object.keys(FAMILIES).map(k=>[k,0]));
  let assigned=0,fallbackRecall=0;
  for(const q of rows){
    rawTypes.add(String(q.type||''));
    const f=classify(q);
    if(FAMILIES[f.key]){byFamily[f.key]++;assigned++}
    if(f.key==='recall'&&!f.matched)fallbackRecall++;
  }
  const activeFamilies=Object.values(byFamily).filter(Boolean).length;
  const ready=rows.length>0&&assigned===rows.length&&activeFamilies>=6&&rawTypes.size>activeFamilies;
  return{
    version:'119-question-skill-family-v1',
    examStyle:rows.length,
    assigned,
    rawTypeCount:rawTypes.size,
    familyCount:Object.keys(FAMILIES).length,
    activeFamilies,
    fallbackRecall,
    byFamily,
    ready
  };
}
V.QuestionType119={version:'119-question-skill-family-v1',families:FAMILIES,classify,audit,policy:{learningAnalyticsOnly:true,notOfficialExamWeight:true,noInventedQuota:true}};
})();
// Canonical families are for learning analytics, not official exam weights.

;
;
