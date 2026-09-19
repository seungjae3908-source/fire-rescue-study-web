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