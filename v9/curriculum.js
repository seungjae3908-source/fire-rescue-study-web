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
add('F03-C01','fire1',3,7);add('F03-C02','fire1',9,13);add('F03-C03','fire1',14,17);add('F03-C03','fire2',295,328);add('F03-C04','fire1',18,21);add('F03-C05','fire1',22,22);add('F03-C06','fire1',23,34);add('F03-C07','fire1',31,34);add('F03-C07','fire2',329,338);add('F03-C08','fire2',339,358);
add('F04-C01','fire1',35,40);add('F04-C01','fire2',183,185);add('F04-C02','fire2',186,188);add('F04-C03','fire2',189,198);add('F04-C04','fire2',199,211);add('F04-C05','fire2',212,218);add('F04-C06','fire2',219,228);add('F04-C07','fire2',229,239);add('F04-C08','fire2',240,256);
const scopes=[...FIRE,...EMS];
const concepts=scopes.flatMap(scope=>scope.concepts.map((title,index)=>({id:`${scope.id}-C${String(index+1).padStart(2,'0')}`,scopeId:scope.id,scopeTitle:scope.title,subject:scope.subject,title,index,sourceRanges:ranges[`${scope.id}-C${String(index+1).padStart(2,'0')}`]||[]})));
const byId=Object.fromEntries(concepts.map(x=>[x.id,x]));
const scopeById=Object.fromEntries(scopes.map(x=>[x.id,x]));
V.curriculum={version:'2026-official-v9',fire:FIRE,ems:EMS,scopes,concepts,byId,scopeById,docs:DOCS,ranges,totalConcepts:concepts.length};
V.sourceLabel=id=>(ranges[id]||[]).map(r=>`${r.label} ${r.from===r.to?r.from:`${r.from}~${r.to}`}쪽`).join(' · ');
V.subjectLabel=s=>s==='fire'?'소방학개론':'응급처치학개론';
})();
