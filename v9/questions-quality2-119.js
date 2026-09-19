'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const rows=[
  {
    id:'119-q2-foamprop-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'low',type:'분류형',
    source:'2026 예방실무1 343쪽',examStyle:true,questionClass:'exam-style',
    q:'포소화약제 혼합장치의 방식으로 옳지 않은 것은?',
    choices:['라인 프로포셔너','펌프 프로포셔너','프레셔 프로포셔너','중력식 열감지 프로포셔너'],a:3,
    choiceExplanations:['교재에 제시된 혼합방식이다.','교재에 제시된 혼합방식이다.','교재에 제시된 혼합방식이다.','정답. 교재는 라인·펌프·프레셔·프레셔사이드 프로포셔너를 제시한다.']
  },
  {
    id:'119-q2-foamprop-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'원리형',
    source:'2026 예방실무1 343~344쪽',examStyle:true,questionClass:'exam-style',
    q:'라인 프로포셔너의 작동원리로 가장 적절한 것은?',
    choices:['배관 도중 혼합기의 벤츄리 효과로 포원액을 흡입한다','별도의 원액펌프로 원액을 강제 압입한다','펌프 토출측과 흡입측 사이 바이패스만으로 원액을 가압한다','가스압만으로 포원액을 발포기에 직접 분사한다'],a:0,
    choiceExplanations:['정답. 오리피스형 혼합기와 벤츄리 효과를 이용한다.','프레셔사이드 프로포셔너와 관련된 설명이다.','펌프 프로포셔너 설명과도 정확히 일치하지 않는다.','교재의 라인 프로포셔너 원리가 아니다.']
  },
  {
    id:'119-q2-foamprop-03',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'적용형',
    source:'2026 예방실무1 344쪽',examStyle:true,questionClass:'exam-style',
    q:'라인 프로포셔너의 적용에 가장 가까운 것은?',
    choices:['소규모 또는 이동식 간이설비','비행기 격납고의 대규모 고정식만','모든 초고층 건물의 자동제연설비','가스계 전역방출설비'],a:0,
    choiceExplanations:['정답. 소규모 또는 이동식 간이설비에 사용되는 관로혼합방식이다.','프레셔사이드 방식의 대표 적용과 가깝다.','포 혼합장치의 적용 설명이 아니다.','포 혼합장치의 적용 설명이 아니다.']
  },
  {
    id:'119-q2-foamprop-04',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'high',type:'수치형',
    source:'2026 예방실무1 344쪽',examStyle:true,questionClass:'exam-style',
    q:'라인 프로포셔너의 단점에 대한 교재 설명으로 옳은 것은?',
    choices:['혼합기를 통한 압력손실이 약 1/3 정도로 높고 흡입 가능 높이가 1.8m 이하로 제한될 수 있다','압력손실이 전혀 없고 흡입 높이에 제한이 없다','혼합 가능한 유량범위가 매우 넓어 모든 방호대상에 적합하다','별도 원액펌프가 필수라 이동식 설비에는 부적합하다'],a:0,
    choiceExplanations:['정답. 압력손실과 흡입높이 제한이 대표 단점이다.','교재 내용과 반대다.','교재는 혼합 가능한 유량범위가 좁다고 설명한다.','라인 방식은 별도 원액펌프 방식이 아니다.']
  },
  {
    id:'119-q2-foamprop-05',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'원리형',
    source:'2026 예방실무1 345쪽',examStyle:true,questionClass:'exam-style',
    q:'펌프 프로포셔너의 특징으로 옳은 것은?',
    choices:['펌프 토출측과 흡입측 사이를 바이패스로 연결해 벤츄리 작용으로 원액을 흡입한다','약제탱크에 소화용수를 유입해 수압만으로 원액을 밀어낸다','원액펌프 토출압을 급수펌프보다 높게 유지하는 별도 원액펌프 방식이다','관로 혼합기만 설치하고 펌프와 전혀 관계없이 작동한다'],a:0,
    choiceExplanations:['정답. 펌프 토출-흡입측 바이패스가 핵심이다.','프레셔 프로포셔너 설명에 가깝다.','프레셔사이드 프로포셔너 설명이다.','라인 프로포셔너 설명에 가깝다.']
  },
  {
    id:'119-q2-foamprop-06',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'적용형',
    source:'2026 예방실무1 345쪽',examStyle:true,questionClass:'exam-style',
    q:'펌프 프로포셔너가 주로 적용되는 것으로 교재에 제시된 것은?',
    choices:['화학소방차','일반 피난유도등','비상방송설비','자동화재탐지 수신기'],a:0,
    choiceExplanations:['정답. 화학소방차 등에 주로 사용한다.','포 혼합장치와 무관하다.','포 혼합장치와 무관하다.','포 혼합장치와 무관하다.']
  },
  {
    id:'119-q2-foamprop-07',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'high',type:'함정형',
    source:'2026 예방실무1 345쪽',examStyle:true,questionClass:'exam-style',
    q:'펌프 프로포셔너의 운용상 주의점으로 옳은 것은?',
    choices:['펌프 흡입측 배관 압력이 거의 없어야 하며 압력이 있으면 혼합비 변화나 원액탱크 쪽 역류가 생길 수 있다','흡입측 압력이 높을수록 혼합비는 항상 정확해진다','원액탱크 쪽 역류는 구조상 절대 발생할 수 없다','흡입측 압력은 혼합과 무관하다'],a:0,
    choiceExplanations:['정답. 교재가 제시하는 대표 단점·주의점이다.','교재 설명과 반대다.','교재는 역류 가능성을 제시한다.','흡입측 압력은 혼합비와 역류에 영향을 줄 수 있다.']
  },
  {
    id:'119-q2-foamprop-08',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'원리형',
    source:'2026 예방실무1 345~346쪽',examStyle:true,questionClass:'exam-style',
    q:'프레셔 프로포셔너의 설명으로 가장 적절한 것은?',
    choices:['약제탱크로 소화용수를 유입해 수압에 의한 압입과 혼합기의 벤츄리 흡입을 함께 이용한다','별도 원액펌프만으로 원액을 압입하며 약제탱크에 물이 들어가지 않는다','배관 도중 혼합기만 두는 관로혼합방식이다','펌프 흡입측 바이패스만 이용하는 화학소방차 전용 방식이다'],a:0,
    choiceExplanations:['정답. 수압 압입과 벤츄리 효과를 함께 이용한다.','프레셔사이드 방식과 관련된 설명이다.','라인 프로포셔너 설명이다.','펌프 프로포셔너 설명에 가깝다.']
  },
  {
    id:'119-q2-foamprop-09',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'mid',type:'명칭형',
    source:'2026 예방실무1 346쪽',examStyle:true,questionClass:'exam-style',
    q:'프레셔 프로포셔너의 별칭으로 교재에 제시된 것은?',
    choices:['가압혼합방식','관로혼합방식','압입혼합방식','중력혼합방식'],a:0,
    choiceExplanations:['정답. 프레셔 프로포셔너는 가압혼합방식이라 한다.','라인 프로포셔너의 별칭이다.','프레셔사이드 프로포셔너의 별칭이다.','교재의 해당 명칭이 아니다.']
  },
  {
    id:'119-q2-foamprop-10',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'high',type:'수치형',
    source:'2026 예방실무1 346쪽',examStyle:true,questionClass:'exam-style',
    q:'프레셔 프로포셔너의 교재상 장점 설명으로 옳은 것은?',
    choices:['혼합기 압력손실 약 0.35~2.1kg/㎠, 혼합가능 유량범위 약 50~200%','압력손실 약 10~20kg/㎠, 유량범위 1~5%','압력손실은 항상 0이며 유량범위 제한이 없다','흡입높이 1.8m 이하라는 조건만으로 성능이 결정된다'],a:0,
    choiceExplanations:['정답. 교재 표에 제시된 수치다.','교재 수치와 다르다.','압력손실이 전혀 없다고 설명하지 않는다.','1.8m 제한은 라인 프로포셔너의 대표 단점이다.']
  },
  {
    id:'119-q2-foamprop-11',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'high',type:'비교형',
    source:'2026 예방실무1 347쪽',examStyle:true,questionClass:'exam-style',
    q:'프레셔사이드 프로포셔너와 다른 방식의 가장 뚜렷한 구분점은?',
    choices:['별도의 포원액용 펌프를 설치해 원액을 혼합기에 보낸다','항상 원액펌프 없이 벤츄리만 사용한다','배관 도중 혼합기만 설치하는 관로혼합방식이다','펌프 토출측과 흡입측 사이 바이패스가 핵심이다'],a:0,
    choiceExplanations:['정답. 별도 원액펌프가 핵심 구분점이다.','프레셔사이드 방식과 반대다.','라인 프로포셔너 설명이다.','펌프 프로포셔너 설명이다.']
  },
  {
    id:'119-q2-foamprop-12',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C08',difficulty:'high',type:'압력조건형',
    source:'2026 예방실무1 347쪽',examStyle:true,questionClass:'exam-style',
    q:'프레셔사이드 프로포셔너의 압력조건으로 옳은 것은?',
    choices:['원액펌프 토출압이 급수펌프 토출압보다 높아야 한다','원액펌프 토출압이 급수펌프보다 반드시 낮아야 한다','두 펌프의 토출압은 항상 0이어야 한다','원액펌프가 없으므로 비교할 압력이 없다'],a:0,
    choiceExplanations:['정답. 원액을 송수관 혼합기에 압입하기 위한 핵심 조건이다.','교재 조건과 반대다.','교재 내용이 아니다.','프레셔사이드 방식에는 별도 원액펌프가 있다.']
  },

  {
    id:'119-q2-flash-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'mid',type:'단계형',
    source:'2026 소방전술1(화재1) 21·29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버가 화재 진행단계에서 나타나는 시기로 가장 적절한 것은?',
    choices:['성장기와 최성기의 과도기','발화 전 단계만','쇠퇴기가 완전히 끝난 뒤','소화 완료 후'],a:0,
    choiceExplanations:['정답. 교재는 성장기와 최성기간의 과도기라고 설명한다.','발화 전 현상이 아니다.','쇠퇴기 이후 현상이 아니다.','소화 완료 후 현상이 아니다.']
  },
  {
    id:'119-q2-flash-02',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'high',type:'수치형',
    source:'2026 소방전술1(화재1) 29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버 발생 시 뜨거운 가스층에서 발산하는 복사에너지에 대한 교재 설명으로 옳은 것은?',
    choices:['일반적으로 20kW/㎡를 초과한다','항상 정확히 2kW/㎡이다','항상 1kW/㎡ 미만이다','복사에너지는 플래시오버와 관계가 없다'],a:0,
    choiceExplanations:['정답. 교재가 제시한 대표 수치다.','교재 수치와 다르다.','교재 설명과 다르다.','복사열은 가연물 열분해와 플래시오버 진행에 중요하다.']
  },
  {
    id:'119-q2-flash-03',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'high',type:'온도형',
    source:'2026 소방전술1(화재1) 29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버 발생온도에 관한 교재 설명으로 가장 적절한 것은?',
    choices:['정확한 단일 온도는 없지만 약 483~649℃ 범위가 폭넓게 사용된다','항상 정확히 483℃에서만 발생한다','항상 정확히 649℃에서만 발생한다','온도와는 전혀 관계가 없다'],a:0,
    choiceExplanations:['정답. 단일 고정값이 아니라 범위를 제시한다.','483℃를 절대 고정값으로 단정하면 안 된다.','649℃를 절대 고정값으로 단정하면 안 된다.','열 축적과 온도 상승은 핵심 과정이다.']
  },
  {
    id:'119-q2-flash-04',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'mid',type:'전조형',
    source:'2026 소방전술1(화재1) 29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버 직전의 위험징후와 가장 거리가 먼 것은?',
    choices:['구획실 온도의 급격한 상승','추가 가연물의 화재 관여','열분해에 따른 가연성가스 방출','구획실 온도가 계속 떨어지고 열분해가 완전히 중단됨'],a:3,
    choiceExplanations:['교재가 설명하는 직전 변화다.','교재가 설명하는 직전 변화다.','교재가 설명하는 직전 변화다.','정답. 플래시오버 직전의 전형적 진행과 반대다.']
  },
  {
    id:'119-q2-flash-05',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'mid',type:'비교형',
    source:'2026 소방전술1(화재1) 40쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버와 백드래프트의 구분으로 옳은 것은?',
    choices:['플래시오버는 열·복사 축적과 동시발화, 백드래프트는 산소 유입에 의한 폭발적 발화가 핵심이다','두 현상은 원인과 발생조건이 완전히 같다','플래시오버는 산소 유입만이 직접 촉발요인이다','백드래프트는 구획실 가연물의 열복사 동시발화만을 뜻한다'],a:0,
    choiceExplanations:['정답. 대표 구분축이다.','발생조건이 다르다.','백드래프트와 혼동한 설명이다.','플래시오버와 혼동한 설명이다.']
  },
  {
    id:'119-q2-flash-06',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'mid',type:'비교형',
    source:'2026 소방전술1(화재1) 40쪽',examStyle:true,questionClass:'exam-style',
    q:'플레임오버의 특징으로 가장 적절한 것은?',
    choices:['초기화재에서 대류가 발달하며 벽면에서 천장으로 화염이 면이동한다','구획실 모든 가연물이 거의 동시에 발화한다','산소부족 공간에 공기유입으로 폭발적 발화한다','탱크 하부 수분층이 급격히 비등한다'],a:0,
    choiceExplanations:['정답. 교재 핵심요약의 정의다.','플래시오버 설명이다.','백드래프트 설명이다.','보일오버 설명이다.']
  },
  {
    id:'119-q2-flash-07',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'high',type:'비교형',
    source:'2026 소방전술1(화재1) 40쪽',examStyle:true,questionClass:'exam-style',
    q:'롤오버에 대한 설명으로 가장 적절한 것은?',
    choices:['가연성가스가 연소범위에 형성되어 음압 영역으로 이동하다 중성대 아래 공기와 만나 부분 연소하며 개구부 방향으로 진행한다','벽면에서 천장으로 고체 표면만 연소하는 현상이다','구획실 모든 가연물이 동시에 발화한 뒤에만 시작한다','수분층의 급비등으로 유류가 탱크 밖으로 넘치는 현상이다'],a:0,
    choiceExplanations:['정답. 교재 핵심요약의 롤오버 설명과 맞다.','플레임오버를 지나치게 단순화한 설명이다.','롤오버는 플래시오버 전 위험신호로 나타날 수 있다.','보일오버 설명이다.']
  },
  {
    id:'119-q2-flash-08',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'mid',type:'이후단계형',
    source:'2026 소방전술1(화재1) 21쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버 발생 이후의 화재 진행으로 가장 적절한 것은?',
    choices:['구획실 내 다수 가연물이 화재에 관여하는 최성기로 이어진다','항상 즉시 자연소화되어 발화기로 돌아간다','가연물과 열방출이 모두 사라진다','환기조건과 관계없이 연소생성가스가 0이 된다'],a:0,
    choiceExplanations:['정답. 교재는 최성기가 대부분 플래시오버로 시작한다고 설명한다.','일반적인 진행과 다르다.','최성기는 열방출이 큰 단계다.','최성기의 가스 발생은 환기조건 등과 관련된다.']
  },
  {
    id:'119-q2-flash-09',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'high',type:'함정형',
    source:'2026 소방전술1(화재1) 29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버의 온도와 관련한 설명 중 옳지 않은 것은?',
    choices:['교재는 하나의 정확한 발생온도가 없다고 설명한다','약 483~649℃ 범위가 폭넓게 사용된다고 설명한다','609℃인 CO 발화온도와의 상관관계를 언급한다','모든 구획실에서 600℃가 되면 반드시 같은 순간 플래시오버가 발생한다고 단정할 수 있다'],a:3,
    choiceExplanations:['교재 설명과 맞다.','교재 설명과 맞다.','교재가 해당 상관관계를 설명한다.','정답. 단일 절대온도로 모든 화재를 단정하는 것은 교재 설명과 맞지 않는다.']
  },
  {
    id:'119-q2-flash-10',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C09',difficulty:'high',type:'순서형',
    source:'2026 소방전술1(화재1) 23·29쪽',examStyle:true,questionClass:'exam-style',
    q:'플래시오버로 진행하는 흐름으로 가장 적절한 것은?',
    choices:['국부화재 성장 → 고온 가스층 형성 → 복사열 증가 → 가연물 열분해 → 광범위 동시발화','광범위 동시발화 → 발화원 제거 → 온도 급강하 → 고온 가스층 형성','산소완전소진 → 모든 열 소멸 → 문 개방 → 냉각','쇠퇴기 완료 → 가연물 생성 → 발화기 시작'],a:0,
    choiceExplanations:['정답. 열축적과 복사열에 의한 열분해·발화 진행을 올바르게 연결했다.','순서와 현상이 맞지 않는다.','열 소멸 상태를 플래시오버 진행으로 볼 수 없다.','화재 진행단계 순서가 맞지 않는다.']
  }
];
const seen=new Set(V.questions.map(x=>x.id));
for(const q of rows)if(!seen.has(q.id))V.questions.push(q);
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.Quality2Questions119={added:rows.length,proportioner:12,flashover:10};
})();