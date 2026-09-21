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
  },
  {
    id:'119-q2-haz-special-21',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C08',difficulty:'mid',type:'비교형',
    source:'2026 소방전술1(화재1) 319쪽 · 2026 예방실무2 536쪽',examStyle:true,questionClass:'exam-style',
    q:'위험물화재 대응에서 “류별 공통성질”과 “품목별 개별성상”을 함께 확인해야 하는 이유로 가장 적절한 것은?',
    choices:[
      '같은 류 안에서도 물 반응성·연소형태·적응 소화방법이 품목별로 달라질 수 있기 때문',
      '모든 품목이 같은 물성이라 류 구분만 보면 되기 때문',
      '위험물의 종류는 소화방법과 전혀 관계가 없기 때문',
      '위험물화재는 저장·용기 상태를 확인할 필요가 없기 때문'
    ],a:0,
    choiceExplanations:[
      '정답. 공식 범위는 류별 성질과 함께 개별 품목의 성상·저장취급·소화방법을 구분해 보도록 요구한다.',
      '같은 류라도 개별 품목의 반응성과 소화상 주의가 달라질 수 있다.',
      '위험물의 성상과 반응성은 적응 소화방법 선택에 직접 영향을 준다.',
      '저장·용기·누출 상태는 확대위험과 특수현상 판단에 중요하다.'
    ]
  },
  {
    id:'119-q2-haz-special-22',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C08',difficulty:'high',type:'특수현상형',
    source:'2026 소방전술1(화재1) 319쪽 · 2026 예방실무2 536쪽',examStyle:true,questionClass:'exam-style',
    q:'유류탱크 화재에서 보일오버 위험을 함께 판단해야 하는 이유로 옳은 것은?',
    choices:[
      '열이 액면 아래로 전달되어 수분층이 급격히 기화하면 연소 중인 유류가 넘쳐 분출할 수 있기 때문',
      '유류탱크 내부 수분은 화재 중 항상 완전히 사라지기 때문',
      '보일오버는 가스계 소화설비에서만 발생하기 때문',
      '보일오버는 화재가 완전히 진압된 뒤에만 발생하기 때문'
    ],a:0,
    choiceExplanations:[
      '정답. 탱크 내부 수분의 급격한 기화와 뜨거운 유류의 분출 위험이 핵심이다.',
      '수분층 존재가 오히려 보일오버 위험과 연결될 수 있다.',
      '보일오버는 유류탱크 화재의 대표 특수현상이다.',
      '진행 중인 유류탱크 화재에서 열전달과 수분층 상태를 함께 판단해야 한다.'
    ]
  },
  {
    id:'119-q2-sprinkler-base-21',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C05',difficulty:'high',type:'비교형',
    source:'2026 예방실무1 284쪽',examStyle:true,questionClass:'exam-style',
    q:'일반 폐쇄형 스프링클러 헤드와 자동화재탐지설비 감지기의 차이를 가장 정확히 설명한 것은?',
    choices:[
      '폐쇄형 헤드는 자체 감열부가 화재열에 반응해 개방·방수하고, 감지기는 화재징후를 전기신호로 수신기에 전달한다',
      '둘은 같은 장치라 감지기 신호가 없으면 폐쇄형 헤드의 감열부도 절대 작동하지 않는다',
      '폐쇄형 헤드는 경보만 담당하고 감지기가 물을 직접 방사한다',
      '둘 다 소화용수 저장만 담당한다'
    ],a:0,
    choiceExplanations:[
      '정답. 폐쇄형 헤드는 직접 감열·개방·방수하고, 감지기는 탐지신호를 수신기에 전달하는 장치다.',
      '일반 폐쇄형 헤드는 감지기와 별개로 자체 감열부가 화재열에 반응한다.',
      '역할을 서로 바꾼 설명이다.',
      '소화용수설비의 기능과도 다르다.'
    ]
  },
  {
    id:'119-q2-ems-e25-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C01',difficulty:'mid',type:'감별형',
    source:'2026 소방전술3(구급) 223~224쪽',pageVerified:true,reviewStatus:'manual-reviewed',examStyle:true,questionClass:'exam-style',
    q:'담낭염·담석 환자에서 교재가 제시하는 통증 양상으로 가장 적절한 것은?',
    choices:[
      '윗배 또는 우상복부 통증이 어깨나 등으로 퍼질 수 있고 지방이 많은 음식 뒤 악화될 수 있다',
      '항상 좌하복부에만 통증이 있고 음식과는 관계가 없다',
      '통증은 반드시 가슴 중앙에만 나타난다',
      '통증이 있으면 현장에서 음식을 먹여 반응을 확인한다'
    ],a:0,
    choiceExplanations:[
      '정답. 교재는 윗배·우상복부 통증, 어깨·등 방사통과 지방식 후 악화 가능성을 설명한다.',
      '교재의 대표 통증 위치·유발요인과 다르다.',
      '담낭염·담석의 대표 설명이 아니다.',
      '급성 복통 환자에게는 먹을 것을 주지 않는 것이 교재 원칙이다.'
    ]
  },
  {
    id:'119-q2-ems-e25-02',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C02',difficulty:'mid',type:'증상형',
    source:'2026 소방전술3(구급) 224·435~437쪽',pageVerified:true,reviewStatus:'manual-reviewed',examStyle:true,questionClass:'exam-style',
    q:'신장·요로 결석을 의심할 수 있는 증상 조합으로 가장 적절한 것은?',
    choices:[
      '심한 옆구리 통증 + 오심·구토 + 서혜부 방향 방사통',
      '무통성 흉부압박감 + 왼팔 방사통만',
      '기침할 때만 생기는 선홍색 객혈',
      '피부 발진만 있고 통증·배뇨증상은 없음'
    ],a:0,
    choiceExplanations:[
      '정답. 교재는 돌이 요로를 따라 이동할 때 심한 옆구리 통증, 오심·구토, 서혜부 방사통이 나타날 수 있다고 설명한다.',
      '급성관상동맥계 증상과 더 가까운 조합이다.',
      '호흡기계 객혈 설명에 가깝다.',
      '요로결석의 대표 증상 조합이 아니다.'
    ]
  },
  {
    id:'119-q2-ems-e25-03',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C03',difficulty:'low',type:'기초생리형',
    source:'2026 소방전술3(구급) 66·227쪽',pageVerified:true,reviewStatus:'manual-reviewed',examStyle:true,questionClass:'exam-style',
    q:'혈액 구성요소와 기능의 연결로 옳은 것은?',
    choices:[
      '적혈구-산소운반 / 백혈구-면역 / 혈소판-지혈·응고',
      '적혈구-지혈 / 백혈구-산소운반 / 혈소판-담즙분비',
      '적혈구-면역 / 백혈구-혈압생성 / 혈소판-산소운반',
      '세 구성요소 모두 기능이 동일하다'
    ],a:0,
    choiceExplanations:[
      '정답. 소방전술3은 적혈구의 산소운반, 백혈구의 면역, 혈소판의 응고·지혈 역할을 설명한다.',
      '각 혈구의 대표 기능을 서로 바꾼 오답이다.',
      '백혈구와 혈소판의 기능을 잘못 연결했다.',
      '세 구성요소는 서로 다른 대표 기능을 가진다.'
    ]
  },
  {
    id:'119-q2-ems-e25-04',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C04',difficulty:'mid',type:'처치형',
    source:'2026 소방전술3(구급) 105·435쪽 · 질병관리청 국가건강정보포털 비출혈/안외상',pageVerified:true,reviewStatus:'manual-reviewed',examStyle:true,questionClass:'exam-style',
    q:'눈·귀·코·목 응급의 초기 대응 원칙으로 가장 적절한 것은?',
    choices:[
      '심한 출혈·부종·이물이 기도를 위협하는지 먼저 보고, 눈 화학노출은 지체 없이 충분히 세척한다',
      '눈 화학노출은 물질명을 완전히 확인할 때까지 세척하지 않는다',
      '비출혈은 모든 경우 고개를 뒤로 젖혀 피를 삼키게 한다',
      '인후·후두 부종이 있어도 기도 평가는 뒤로 미룬다'
    ],a:0,
    choiceExplanations:[
      '정답. 기도위험은 ABC 우선순위로 보고 화학적 눈 손상은 즉시 세척하는 원칙을 적용한다.',
      '화학적 눈 손상은 세척 지연이 추가 손상을 키울 수 있다.',
      '비출혈에서 혈액의 기도 흡인을 줄이는 자세원칙과 반대다.',
      '인후·후두 부종은 기도폐쇄로 진행할 수 있어 기도평가가 우선이다.'
    ]
  },
  {
    id:'119-q2-ems-e25-05',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C05',difficulty:'mid',type:'비교형',
    source:'2026 응급처치학개론 출제범위 · 2026 소방전술3(구급) 390~394쪽 · 질병관리청 골관절염/통풍',pageVerified:true,reviewStatus:'manual-reviewed',examStyle:true,questionClass:'exam-style',
    q:'비외상성 근골격계 질환의 구분으로 가장 적절한 것은?',
    choices:[
      '골관절염은 퇴행성, 통풍은 염증성 관절질환의 대표 예로 구분해 학습한다',
      '골관절염과 통풍은 모두 반드시 외상 직후에만 발생한다',
      '비외상성 근골격계 질환은 공식 시험범위와 무관하다',
      '발열·전신상태 저하가 있어도 감염성 가능성은 고려하지 않는다'
    ],a:0,
    choiceExplanations:[
      '정답. 공식 출제범위는 비외상성 근골격계 질환을 퇴행성·염증성·감염성으로 구분한다.',
      '두 질환 모두 외상 직후에만 발생하는 질환이 아니다.',
      '2026 응급처치학개론 범위에 비외상성 근골격계 질환이 포함된다.',
      '전신증상이 동반되면 감염성 가능성 등 중증 원인을 함께 고려해야 한다.'
    ]
  },
  {
    id:'119-v13-fire-phenomena-17',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',difficulty:'low',type:'비교형',
    source:'2026 소방전술1(화재1) 25~34쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버와 백드래프트를 구분하는 첫 기준으로 가장 적절한 것은?',
    choices:['플래시오버는 열 축적, 백드래프트는 산소부족 상태에서 공기 유입이 핵심이다','둘 다 산소가 완전히 없어야만 발생한다','둘 다 외부 폭발물 점화가 필수다','플래시오버는 반드시 용기파열, 백드래프트는 반드시 탱크 넘침이다'],a:0,
    choiceExplanations:['정답. 두 현상의 대표 구분축이다.','플래시오버는 열·복사 축적에 따른 급격한 전면연소와 관련된다.','외부 폭발물은 두 현상의 필수조건이 아니다.','용기파열과 탱크 넘침은 다른 특수현상과 관련된다.']
  },
  {
    id:'119-v13-fire-phenomena-18',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',difficulty:'mid',type:'전조형',
    source:'2026 소방전술1(화재1) 25~34쪽',examStyle:true,questionClass:'exam-style',
    q:'구획실 상부의 고온 가연성가스가 부분적으로 발화해 화염이 천장 부근에서 진행하는 현상으로 플래시오버 전조와 연결되는 것은?',
    choices:['롤오버','보일오버','BLEVE','폭굉'],a:0,
    choiceExplanations:['정답. 롤오버는 상부 가연성가스층의 부분연소와 연결된다.','보일오버는 유류탱크 하부 수분층과 열파가 핵심이다.','BLEVE는 가압 액체 용기의 파열·급기화와 관련된다.','폭굉은 초음속 충격파를 수반하는 폭발 전파다.']
  },
  {
    id:'119-v13-fire-phenomena-19',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',difficulty:'mid',type:'함정형',
    source:'2026 소방전술1(화재1) 25~34쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버에 대한 설명으로 옳지 않은 것은?',
    choices:['구획실 내 열과 복사열 축적이 중요하다','성장기에서 최성기로 급격히 전환되는 과정과 연결된다','구획 내 여러 가연물이 거의 동시에 화재에 관여할 수 있다','산소부족 공간에 공기가 들어오며 미연소가스가 폭발적으로 발화하는 현상만을 뜻한다'],a:3,
    choiceExplanations:['옳은 설명이다.','옳은 설명이다.','옳은 설명이다.','정답. 이 설명은 백드래프트의 핵심 기전이다.']
  },
  {
    id:'119-v13-fire-phenomena-20',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C06',difficulty:'high',type:'상황판단형',
    source:'2026 소방전술1(화재1) 25~34쪽',examStyle:true,questionClass:'exam-style',
    q:'밀폐된 화재실에서 산소가 부족해 화염이 약해 보이고 고온 미연소가스가 축적되어 있다. 문을 급히 개방할 때 가장 우려되는 현상은?',
    choices:['백드래프트','플래시오버만','보일오버','프로스오버'],a:0,
    choiceExplanations:['정답. 공기 유입으로 혼합조건이 바뀌며 폭발적 연소가 일어날 수 있다.','플래시오버는 대표적으로 열축적과 전면연소 전이와 연결된다.','보일오버는 유류탱크 하부 수분층과 관련된다.','프로스오버는 고온 점성유체와 물의 접촉을 중심으로 본다.']
  },
  {
    id:'119-v13-hazmat-special-20',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C08',difficulty:'high',type:'판단형',
    source:'2026 소방전술1(화재1) 319쪽 · 2026 예방실무2 536쪽',examStyle:true,questionClass:'exam-style',
    q:'위험물화재 대응 원칙으로 가장 적절한 것은?',
    choices:['류와 품목, 용기·누출 상태, 물과의 반응성을 확인한 뒤 적합한 소화방법을 선택한다','위험물은 류와 관계없이 동일 약제를 사용한다','물질 식별 전 대량주수를 먼저 시행한다','용기 상태와 누출방향은 소화전술과 무관하다'],a:0,
    choiceExplanations:['정답. 물질과 현장조건을 먼저 식별하는 것이 핵심이다.','류별·품목별 성질과 적응 소화방법이 다르다.','금수성 등 물과의 반응 위험이 있어 일률적 선행 주수는 부적절하다.','용기와 누출상태는 확대·폭발·특수현상 위험 판단에 중요하다.']
  },
  {
    id:'119-v13-elderly-eval-10',grade:'B',subject:'ems',scopeId:'E22',conceptId:'E22-C03',difficulty:'low',type:'우선순위형',
    source:'2026 소방전술3(구급) 392쪽',examStyle:true,questionClass:'exam-style',
    q:'노인환자 평가에서 기도·호흡·순환 등 생명위협 평가 우선순위에 대한 설명으로 옳은 것은?',
    choices:['연령이 높아도 기본 우선순위는 다른 연령과 동일하게 적용한다','나이가 많으면 ABC 평가를 생략한다','만성질환 확인이 기도평가보다 항상 먼저다','복용약만 확인하면 1차평가를 대신할 수 있다'],a:0,
    choiceExplanations:['정답. 생명위협 평가의 기본 우선순위는 연령 때문에 바뀌지 않는다.','노인도 기도·호흡·순환 평가는 중요하다.','생명위협 평가보다 병력청취를 무조건 먼저 두지 않는다.','약물확인은 중요하지만 1차평가를 대체하지 않는다.']
  },
  {
    id:'119-v13-elderly-eval-11',grade:'B',subject:'ems',scopeId:'E22',conceptId:'E22-C03',difficulty:'mid',type:'병력형',
    source:'2026 소방전술3(구급) 392쪽',examStyle:true,questionClass:'exam-style',
    q:'노인환자 평가를 복잡하게 만들 수 있어 특히 확인할 내용으로 가장 적절한 것은?',
    choices:['여러 만성질환과 복용 중인 다양한 약물','좋아하는 음식 한 가지만','직업명만','혈액형만'],a:0,
    choiceExplanations:['정답. 복합질환과 다약제는 노인환자 평가에서 중요한 정보다.','식습관이 도움이 될 수 있지만 가장 핵심적인 평가요소로 한정할 수 없다.','직업명만으로 상태를 판단할 수 없다.','혈액형만으로 현재 응급상태를 평가할 수 없다.']
  },
  {
    id:'119-v13-elderly-eval-12',grade:'B',subject:'ems',scopeId:'E22',conceptId:'E22-C03',difficulty:'high',type:'의사소통형',
    source:'2026 소방전술3(구급) 392쪽',examStyle:true,questionClass:'exam-style',
    q:'노인환자 평가 시 시력·청력 저하가 있는 경우 가장 적절한 접근은?',
    choices:['의사소통 장애 가능성을 고려해 질문 전달과 반응 확인을 더 세밀하게 한다','반응이 늦으면 즉시 비협조 환자로 단정한다','병력청취를 전부 생략한다','연령만으로 의식수준을 판단한다'],a:0,
    choiceExplanations:['정답. 감각저하가 평가에 미치는 영향을 고려해 확인해야 한다.','반응 지연 원인은 감각·인지·질환 등 다양할 수 있다.','가능한 범위에서 병력과 상태를 확인해야 한다.','연령 자체는 의식수준의 판단기준이 아니다.']
  },
  {
    id:'119-v13-behavior-special-10',grade:'B',subject:'ems',scopeId:'E23',conceptId:'E23-C02',difficulty:'low',type:'안전형',
    source:'2026 소방전술3(구급) 401~402쪽',examStyle:true,questionClass:'exam-style',
    q:'자살위험 환자 현장에 도착했을 때 가장 먼저 해야 할 일은?',
    choices:['대원과 현장의 안전을 확인한다','즉시 환자를 붙잡는다','주변 위험은 무시하고 설득부터 한다','환자의 직업을 먼저 확인한다'],a:0,
    choiceExplanations:['정답. 행동응급에서도 현장안전이 최우선이다.','위험평가 없이 신체접촉하면 대원과 환자 모두 위험해질 수 있다.','현장위험 확인이 먼저다.','직업보다 현장안전과 생명위협 평가가 우선이다.']
  },
  {
    id:'119-v13-behavior-special-11',grade:'B',subject:'ems',scopeId:'E23',conceptId:'E23-C02',difficulty:'mid',type:'관찰형',
    source:'2026 소방전술3(구급) 401~402쪽',examStyle:true,questionClass:'exam-style',
    q:'대원에게 즉각적인 위협이 없는 자살위험 환자에 대한 접근으로 적절한 것은?',
    choices:['가능하면 혼자 두지 않고 안전한 거리에서 대화를 지속한다','무조건 혼자 두고 현장을 떠난다','모든 경우 강제 신체제압부터 시행한다','환자의 말을 듣지 않고 질문을 중단한다'],a:0,
    choiceExplanations:['정답. 안전을 확보한 상태에서 지속적인 관찰과 대화가 중요하다.','자살위험 환자를 방치하는 것은 적절하지 않다.','강제제압은 위험도와 상황을 고려해야 한다.','의사소통은 상태평가와 안전확보에 중요하다.']
  },
  {
    id:'119-v13-behavior-special-12',grade:'B',subject:'ems',scopeId:'E23',conceptId:'E23-C02',difficulty:'high',type:'상황판단형',
    source:'2026 소방전술3(구급) 401~402쪽',examStyle:true,questionClass:'exam-style',
    q:'행동응급 환자가 흉기를 들고 위협적인 행동을 보이는 현장에서 가장 적절한 원칙은?',
    choices:['안전거리를 유지하고 적절한 지원을 요청하며 대원안전을 우선한다','즉시 단독으로 접근해 흉기를 빼앗는다','환자 안전을 위해 대원안전은 고려하지 않는다','현장 위험평가 없이 신체평가부터 한다'],a:0,
    choiceExplanations:['정답. 위험한 현장에서는 대원안전과 지원요청이 우선이다.','단독 접근은 중대한 위험을 만들 수 있다.','대원안전도 필수 전제다.','현장안전 확인 후 환자평가로 진행한다.']
  },
  {
    id:'119-v13-bls-overview-20',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C01',difficulty:'mid',type:'순서형',
    source:'2026 소방전술3(구급) 404~407쪽',examStyle:true,questionClass:'exam-style',
    q:'기본소생술의 초기 흐름으로 가장 적절한 것은?',
    choices:['현장안전·반응 확인 → 119/AED 요청 → 호흡·맥박 평가 → 필요한 가슴압박 시행','가슴압박 → 현장안전 확인 → 반응 확인 → 신고','병력청취 완료 → 혈액검사 → AED 요청','호흡·맥박 확인을 수분간 지속한 뒤 신고'],a:0,
    choiceExplanations:['정답. 반응 확인과 신고·AED 요청, 신속한 호흡·맥박 평가가 초기 흐름이다.','현장안전이 선행되어야 한다.','기본소생술 초기 흐름과 맞지 않는다.','평가가 지나치게 길어져 압박 시작을 지연시키면 안 된다.']
  },
  {
    id:'119-v13-airway-vent-18',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',difficulty:'low',type:'기도개방형',
    source:'2026 소방전술3(구급) 408~410쪽',examStyle:true,questionClass:'exam-style',
    q:'머리·목·척추 손상이 의심되지 않는 무반응 환자의 기본 기도개방법으로 적절한 것은?',
    choices:['머리기울임-턱들어올리기','무조건 턱밀어올리기만 사용','복부밀어올리기','가슴압박만으로 기도개방'],a:0,
    choiceExplanations:['정답. 비외상 상황의 기본 기도개방법이다.','턱밀어올리기는 머리·목·척추 손상이 의심될 때 고려한다.','복부밀어올리기는 기도개방법 자체가 아니다.','가슴압박과 기도개방은 목적이 다르다.']
  },
  {
    id:'119-v13-airway-vent-19',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',difficulty:'mid',type:'외상형',
    source:'2026 소방전술3(구급) 408~410쪽',examStyle:true,questionClass:'exam-style',
    q:'머리·목·척추 손상이 의심되는 환자의 기도개방 시 우선 고려하는 방법은?',
    choices:['턱 밀어올리기','머리를 최대한 뒤로 과신전','복부 압박','환자를 세워 걷게 하기'],a:0,
    choiceExplanations:['정답. 경추 움직임을 줄이면서 기도를 확보하는 방법을 고려한다.','과도한 머리 젖힘은 외상 의심 시 주의해야 한다.','복부 압박은 해당 기도개방법이 아니다.','환자 상태와 척추손상 가능성에 부적절하다.']
  },
  {
    id:'119-v13-airway-vent-20',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',difficulty:'high',type:'환기형',
    source:'2026 소방전술3(구급) 408~410쪽',examStyle:true,questionClass:'exam-style',
    q:'인공호흡 시행 원칙으로 가장 적절한 것은?',
    choices:['1회 약 1초에 걸쳐 가슴 상승이 보일 정도로 시행하고 과환기를 피한다','가능한 빠르고 강하게 계속 불어넣는다','가슴 상승 여부는 확인하지 않는다','한 번의 호흡을 10초 이상 지속한다'],a:0,
    choiceExplanations:['정답. 효과적인 환기를 확인하면서 과도한 환기를 피한다.','과환기는 피해야 한다.','가슴 상승은 환기 효과를 확인하는 중요한 단서다.','지나치게 긴 호흡은 권장 원칙과 맞지 않는다.']
  },
  {
    id:'119-v13-cpr-ratio-19',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C04',difficulty:'low',type:'비율형',
    source:'2026 소방전술3(구급) 413~414쪽',examStyle:true,questionClass:'exam-style',
    q:'성인 심폐소생술에서 가슴압박과 인공호흡의 기본 비율로 옳은 것은?',
    choices:['30:2','15:1','5:1','10:5'],a:0,
    choiceExplanations:['정답. 성인 CPR의 기본 압박-호흡 비율은 30:2다.','교재의 성인 기본 비율과 다르다.','교재의 성인 기본 비율과 다르다.','교재의 성인 기본 비율과 다르다.']
  },
  {
    id:'119-v13-cpr-ratio-20',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C04',difficulty:'high',type:'질관리형',
    source:'2026 소방전술3(구급) 413~414쪽',examStyle:true,questionClass:'exam-style',
    q:'성인 CPR의 압박 질을 유지하기 위한 설명으로 적절한 것은?',
    choices:['약 2분 또는 5주기마다 압박자를 교대하고 불필요한 압박 중단을 줄인다','한 사람이 계속 압박해 피로가 와도 교대하지 않는다','맥박 확인을 위해 매 주기 30초 이상 중단한다','인공호흡 준비가 될 때까지 압박을 장시간 멈춘다'],a:0,
    choiceExplanations:['정답. 구조자 피로를 줄이고 압박 중단을 최소화한다.','피로는 압박 질을 떨어뜨릴 수 있다.','불필요하게 긴 중단은 피해야 한다.','가슴압박 중단시간을 최소화해야 한다.']
  },
  {
    id:'119-v13-foreign-body-20',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C05',difficulty:'mid',type:'중증도형',
    source:'2026 소방전술3(구급) 417~423쪽',examStyle:true,questionClass:'exam-style',
    q:'경미한 기도 이물폐쇄 환자에 대한 설명으로 가장 적절한 것은?',
    choices:['효과적이고 힘 있는 자발기침이 가능하면 기침을 계속하도록 관찰한다','힘 있게 기침해도 즉시 무조건 침습적 처치를 한다','경미한 폐쇄에서는 항상 의식이 없다','경미한 폐쇄에서는 항상 호흡과 맥박이 없다'],a:0,
    choiceExplanations:['정답. 효과적인 기침은 이물 배출에 도움이 되므로 상태를 관찰한다.','효과적인 기침이 가능한 경미 폐쇄와 중증 폐쇄를 구분해야 한다.','경미 폐쇄에서 의식이 유지될 수 있다.','항상 호흡·맥박이 없는 상태는 아니다.']
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