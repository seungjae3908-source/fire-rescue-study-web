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