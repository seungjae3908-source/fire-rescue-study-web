'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const fire=[
  {id:'FA',title:'PART 1 · 소방행정·재난관리',subtitle:'조직 · 소방력 · 재난관리',scopeIds:['F01','F02']},
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
  {id:'EF',title:'PART F · 내과응급',subtitle:'복통 · 의식장애 · 중독 · 알레르기',scopeIds:['E12','E17','E18']},
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