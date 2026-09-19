'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const rows=[
  {
    id:'119-q2-haz-special-19',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C08',difficulty:'mid',type:'순서형',
    source:'2026 소방전술1(화재1) 319쪽 · 2026 예방실무2 536쪽',examStyle:true,questionClass:'exam-style',
    q:'위험물화재 현장에서 소화방법을 결정하기 위한 판단 흐름으로 가장 적절한 것은?',
    choices:[
      '물질 식별 → 용기·누출 상태 확인 → 점화원 확인 → 물과의 반응성 확인 → 적합한 소화수단 선택',
      '소화약제부터 임의 방사 → 물질명 확인 → 누출범위 확인',
      '모든 위험물에 물을 먼저 방사 → 반응을 본 뒤 류별 분류',
      '용기상태는 무시 → 화염의 크기만으로 소화약제 결정'
    ],a:0,
    choiceExplanations:[
      '정답. 공식 근거 기반 학습팩은 물질 식별과 용기·누출·반응성 확인을 먼저 한 뒤 적합한 소화수단을 선택하도록 정리한다.',
      '물질과 반응성을 확인하기 전에 약제를 임의로 방사하면 위험을 키울 수 있다.',
      '제3류 등 물과의 반응이 위험한 물질이 있어 일률적인 선행 주수는 부적절하다.',
      '용기와 누출 상태는 특수현상·확대위험 판단에 중요한 요소다.'
    ]
  },
  {
    id:'119-q2-haz-special-20',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C08',difficulty:'high',type:'함정판별형',
    source:'2026 소방전술1(화재1) 319쪽 · 2026 예방실무2 536쪽',examStyle:true,questionClass:'exam-style',
    q:'위험물화재의 소화원칙에 대한 설명으로 옳은 것은?',
    choices:[
      '위험물은 류별·품목별 성상과 물 반응성, 저장·용기 상태를 확인해 적합한 소화방법을 선택한다',
      '위험물이라는 공통점만 확인되면 동일한 소화약제를 적용한다',
      '유류탱크 화재에서는 내부 수분층과 열 전달에 따른 특수현상을 고려할 필요가 없다',
      '물질 식별보다 빠른 임의 주수가 항상 우선이다'
    ],a:0,
    choiceExplanations:[
      '정답. 위험물화재는 류별 성상과 개별 품목의 반응성·저장상태를 함께 판단해야 한다.',
      '류와 품목에 따라 적응 소화방법과 금기가 달라 동일 약제를 일률 적용할 수 없다.',
      '보일오버 등 탱크화재 특수현상은 현장 위험판단에 포함해야 한다.',
      '물과 접촉해 위험해지는 물질이 있으므로 식별 전 일률적인 주수는 안전원칙과 맞지 않는다.'
    ]
  },
  {
    id:'119-q2-sprinkler-base-20',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C05',difficulty:'mid',type:'순서형',
    source:'2026 예방실무1 284쪽',examStyle:true,questionClass:'exam-style',
    q:'일반적인 폐쇄형 스프링클러설비의 화재 시 작동 흐름으로 가장 적절한 것은?',
    choices:[
      '화재열 → 해당 헤드 감열부 작동·개방 → 방수·배관 압력변화 → 경보·펌프 연동 → 지속 급수',
      '수신기 경보 → 모든 폐쇄형 헤드 동시 개방 → 감열부 작동',
      '감지기 신호만으로 모든 헤드가 기계적으로 개방 → 이후 화재열 감지',
      '소방대 수동 밸브 개방 전에는 폐쇄형 헤드가 열려도 방수되지 않음'
    ],a:0,
    choiceExplanations:[
      '정답. 폐쇄형 헤드는 화재열을 직접 받은 감열부가 작동해 개방되고, 유수·압력 변화가 경보와 펌프 연동으로 이어진다.',
      '일반적인 폐쇄형은 화재경보만으로 모든 헤드가 동시에 개방되지 않는다.',
      '자동화재탐지설비의 감지기와 폐쇄형 스프링클러 헤드의 감열부는 서로 다른 장치다.',
      '일반 폐쇄형 시스템의 자동 방수 원리를 수동 방수설비처럼 설명한 오답이다.'
    ]
  }
];
const seen=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>String(q.q||'').replace(/\s+/g,' ').trim()));
for(const q of rows){
  const stem=String(q.q||'').replace(/\s+/g,' ').trim();
  if(!seen.has(q.id)&&!texts.has(stem)){V.questions.push(q);seen.add(q.id);texts.add(stem)}
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.Quality2GapQuestions119={added:rows.filter(q=>seen.has(q.id)).length,ids:rows.map(q=>q.id)};
})();