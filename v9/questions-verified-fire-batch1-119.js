'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;

const Q=[
  {
    id:'119-verfire-backdraft-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C11',
    difficulty:'mid',type:'원리형',source:'2026 소방전술1 PDF 453쪽',
    q:'백드래프트의 발생조건을 가장 정확히 설명한 것은?',
    choices:['산소가 부족한 밀폐·반밀폐 공간에 고온 미연소가스가 축적된 뒤 개구부로 공기가 유입되는 경우','구획실 전체 가연물이 복사열로 거의 동시에 발화하는 경우','연소유 표면에 물이 유입되어 급비등하는 경우','가압용기가 외부가열로 파열되는 경우'],a:0,
    choiceExplanations:['정답. 산소부족 상태의 고온 미연소가스와 신선한 공기 유입이 백드래프트 핵심 조건이다.','플래시오버에 가까운 설명이다.','슬롭오버에 가까운 설명이다.','BLEVE에 가까운 설명이다.']
  },
  {
    id:'119-verfire-backdraft-02',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C11',
    difficulty:'high',type:'징후·함정형',source:'2026 소방전술1 PDF 453쪽',
    q:'백드래프트 위험 판단에 대한 설명으로 옳은 것은?',
    choices:['맥동하는 연기·검게 변한 창·개구부 상태와 공기유입 가능성을 함께 평가한다','불꽃이 약해 보이면 내부 위험은 사라진 것으로 본다','하부 개구부를 먼저 크게 열어 환기시키는 것이 항상 안전하다','연기 색 하나만으로 발생 여부를 확정한다'],a:0,
    choiceExplanations:['정답. 연기 움직임과 개구부·열·환기상태를 종합해 판단해야 한다.','산소가 부족해 불꽃이 약해 보여도 열과 연료가스가 남아 있을 수 있다.','무분별한 개구부 개방은 신선한 공기 유입으로 위험을 키울 수 있다.','하나의 징후만으로 단정하지 않고 여러 조건을 함께 본다.']
  },
  {
    id:'119-verfire-hazmat-overview-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C01',
    difficulty:'low',type:'류별분류형',source:'2026 예방실무2 PDF 345쪽 · 385쪽',
    q:'위험물 류별 성상 연결로 옳은 것은?',
    choices:['제1류 산화성고체 · 제4류 인화성액체 · 제6류 산화성액체','제1류 인화성액체 · 제4류 산화성고체 · 제6류 가연성고체','제3류 산화성액체 · 제5류 인화성액체 · 제6류 금수성고체','제2류 산화성액체 · 제4류 자기반응성물질 · 제5류 산화성고체'],a:0,
    choiceExplanations:['정답. 류별 대표 성상 구분의 기본 연결이다.','제1·4·6류 성상을 모두 잘못 바꾼 연결이다.','제3·5·6류 성상이 맞지 않는다.','제2·4·5류 성상이 맞지 않는다.']
  },
  {
    id:'119-verfire-hazmat-overview-02',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C01',
    difficulty:'high',type:'원칙형',source:'2026 예방실무2 PDF 345쪽 · 385쪽',
    q:'위험물 화재의 소화방법을 판단할 때 가장 적절한 원칙은?',
    choices:['류별 공통성질을 먼저 보고 같은 류 안에서도 품목별 물 반응성·용해성 등 예외를 확인한다','몇 류인지 확인하면 모든 품목에 동일한 소화방법을 기계적으로 적용한다','위험물은 모두 물 사용을 금지한다','위험물은 모두 물만 사용한다'],a:0,
    choiceExplanations:['정답. 류별 공통성질과 품목별 예외를 함께 확인해야 한다.','같은 류 안에서도 품목별 반응성이 달라 일률적 판단은 위험하다.','물 사용이 가능한 위험물도 있어 전면 금지는 틀리다.','금수성 등 물 사용이 위험한 품목이 있어 전면 적용은 틀리다.']
  },
  {
    id:'119-verfire-simple-esfr-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C06',
    difficulty:'mid',type:'목적비교형',source:'2026 예방실무1 PDF 321쪽 · 333쪽',
    q:'간이스프링클러와 화재조기진압용 스프링클러의 구분으로 옳은 것은?',
    choices:['간이는 비교적 단순한 구성의 초기화재 제어, 화재조기진압용은 고위험 화재의 강한 조기진압을 목표로 한다','두 설비는 명칭만 다르고 목적과 성능개념이 완전히 같다','간이는 경보설비이고 화재조기진압용은 피난설비다','둘 다 화재감지 없이 수동으로만 방수한다'],a:0,
    choiceExplanations:['정답. 두 설비는 자동방수라는 공통점이 있지만 적용목적과 요구성능 개념이 다르다.','목적과 적용환경 차이를 구분해야 한다.','둘 다 수계 자동소화설비 범주다.','자동방수 개념을 가진 설비다.']
  },
  {
    id:'119-verfire-simple-esfr-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C06',
    difficulty:'high',type:'함정형',source:'2026 예방실무1 PDF 321쪽 · 333쪽',
    q:'화재조기진압용 스프링클러에 대한 설명으로 가장 적절한 것은?',
    choices:['고위험 저장공간 등에서 화재를 초기에 강하게 진압하는 목적과 연결해 이해한다','일반 스프링클러보다 항상 방수성능이 낮다','간이스프링클러와 완전히 동일한 설비로 취급한다','피난방향을 알려주는 유도설비다'],a:0,
    choiceExplanations:['정답. 조기진압 자체가 핵심 목적이다.','화재조기진압용은 강한 방수성능과 조기진압 목적을 가진다.','간이와 조기진압용은 적용목적이 다르다.','피난구조설비가 아니다.']
  },
  {
    id:'119-verfire-sprinkler-components-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C16',
    difficulty:'mid',type:'구성요소형',source:'2026 예방실무1 PDF 288쪽',
    q:'스프링클러설비의 전체 계통을 가장 적절히 연결한 것은?',
    choices:['수원 → 가압송수장치 → 배관·밸브 → 헤드 → 방수와 경보 연동','감지기 → 피난기구 → 소화기 → 방화문만','소화수조 없이 헤드 하나만으로 완전한 시스템이 된다','헤드와 감지기는 반드시 같은 장치다'],a:0,
    choiceExplanations:['정답. 스프링클러는 수원·펌프·배관·밸브·헤드·경보가 연계된 시스템이다.','서로 다른 설비를 섞은 연결이다.','헤드만으로 전체 설비가 구성되는 것은 아니다.','폐쇄형 헤드의 감열부와 자동화재탐지 감지기는 별도 장치다.']
  },
  {
    id:'119-verfire-sprinkler-components-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C16',
    difficulty:'high',type:'기능구분형',source:'2026 예방실무1 PDF 288쪽',
    q:'스프링클러 구성요소의 기능 구분으로 옳은 것은?',
    choices:['헤드는 열을 받아 방수구를 열고, 유수검지장치는 유수·압력변화를 검지해 경보에 연동한다','감지기는 물을 직접 방사하고 헤드는 전기신호만 보낸다','유수검지장치는 피난방향만 표시한다','가압송수장치는 화재원인을 조사한다'],a:0,
    choiceExplanations:['정답. 헤드·유수검지장치·감지기의 기능을 구분해야 한다.','감지기와 헤드의 역할을 반대로 설명했다.','유수검지장치는 유수상태를 검지하는 장치다.','가압송수장치는 물을 필요한 압력으로 공급하는 계통이다.']
  },
  {
    id:'119-verfire-sprinkler-wet-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C17',
    difficulty:'mid',type:'습식원리형',source:'2026 예방실무1 PDF 288쪽',
    q:'습식 스프링클러설비의 평상시 상태로 옳은 것은?',
    choices:['1차측과 2차측 배관에 물이 차 있다','2차측 배관은 항상 압축공기만 차 있다','2차측은 항상 비어 있고 감지기 작동 후 처음 물이 들어온다','모든 헤드는 평상시 개방되어 있다'],a:0,
    choiceExplanations:['정답. 습식은 헤드까지 배관이 충수되어 있어 작동 응답이 빠르다.','건식의 대표적인 평상시 상태다.','준비작동식 계통과 혼동한 설명이다.','일반 습식은 폐쇄형 헤드를 사용한다.']
  },
  {
    id:'119-verfire-sprinkler-wet-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C17',
    difficulty:'high',type:'장단점형',source:'2026 예방실무1 PDF 288쪽',
    q:'습식 스프링클러의 장점과 주의점으로 가장 적절한 것은?',
    choices:['방수가 빠르지만 동결 우려가 큰 장소에서는 배관수 동결을 주의한다','방수가 가장 늦고 동결장소에 가장 적합하다','화재경보만으로 모든 헤드가 동시에 열린다','2차측 압축공기 배출 후에만 물이 들어온다'],a:0,
    choiceExplanations:['정답. 상시 충수로 빠르지만 동파 가능 장소는 주의가 필요하다.','건식과 반대되는 설명이다.','열을 받은 폐쇄형 헤드가 개방되는 구조다.','건식 작동순서와 혼동한 설명이다.']
  },
  {
    id:'119-verfire-sprinkler-dry-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C18',
    difficulty:'mid',type:'건식원리형',source:'2026 예방실무1 PDF 284쪽',
    q:'건식 스프링클러설비의 2차측 배관 상태로 옳은 것은?',
    choices:['압축공기 또는 질소가 들어 있다','항상 물로만 가득 차 있다','항상 진공상태다','포원액만 채워져 있다'],a:0,
    choiceExplanations:['정답. 2차측을 공기·질소로 유지해 동결 우려 장소에 적용할 수 있다.','습식과 혼동한 설명이다.','건식의 일반적인 평상시 상태가 아니다.','포소화설비와 혼동한 설명이다.']
  },
  {
    id:'119-verfire-sprinkler-dry-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C18',
    difficulty:'high',type:'작동순서형',source:'2026 예방실무1 PDF 284쪽',
    q:'건식 스프링클러의 작동순서로 가장 적절한 것은?',
    choices:['헤드 개방 → 공기 배출·압력저하 → 건식밸브 개방 → 배관 충수 → 방수','감지기 신호 → 모든 개방형 헤드 즉시 동시방수','배관 충수 → 헤드 감열 → 공기압 상승 → 밸브 폐쇄','수원 차단 → 압력상승 → 방수'],a:0,
    choiceExplanations:['정답. 공기 배출과 밸브 개방, 충수 과정이 추가돼 습식보다 지연될 수 있다.','일제살수식과 혼동한 설명이다.','작동 흐름이 반대로 되어 있다.','수원 차단은 정상 방수 흐름이 아니다.']
  },
  {
    id:'119-verfire-sprinkler-preaction-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C19',
    difficulty:'mid',type:'준비작동식형',source:'2026 예방실무1 PDF 284쪽',
    q:'준비작동식 스프링클러의 작동원리로 옳은 것은?',
    choices:['별도 감지설비가 먼저 작동해 밸브를 열고 2차측을 충수한 뒤 폐쇄형 헤드가 열리면 방수한다','개방형 헤드가 평상시 모두 열려 있고 밸브 없이 항상 방수한다','2차측이 항상 물로 가득 찬 습식과 완전히 같다','감지기 없이 압축공기만으로 일제방수한다'],a:0,
    choiceExplanations:['정답. 감지기·밸브·폐쇄형 헤드의 순서를 이해하는 것이 핵심이다.','일제살수식과도 맞지 않는 과장된 설명이다.','습식과 구분되는 중요한 차이다.','준비작동식은 별도 감지설비 연동이 핵심이다.']
  },
  {
    id:'119-verfire-sprinkler-preaction-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C19',
    difficulty:'high',type:'비교형',source:'2026 예방실무1 PDF 284쪽',
    q:'준비작동식과 일제살수식의 대표 차이로 옳은 것은?',
    choices:['준비작동식은 폐쇄형 헤드, 일제살수식은 개방형 헤드를 사용한다','둘 다 항상 개방형 헤드만 사용한다','준비작동식은 감지설비가 없고 일제살수식만 감지설비가 있다','둘 다 감지기 작동 즉시 모든 헤드가 동시에 개방된다'],a:0,
    choiceExplanations:['정답. 헤드 형태와 방수방식이 대표적인 구분점이다.','준비작동식은 폐쇄형 헤드를 사용한다.','두 방식 모두 감지설비 연동을 이해해야 한다.','준비작동식은 열을 받은 폐쇄형 헤드에서 방수된다.']
  },
  {
    id:'119-verfire-sprinkler-deluge-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C20',
    difficulty:'mid',type:'일제살수식형',source:'2026 예방실무1 PDF 302쪽',
    q:'일제살수식 스프링클러의 특징으로 옳은 것은?',
    choices:['개방형 헤드를 사용하고 감지설비가 작동해 일제개방밸브가 열리면 구역에서 동시에 방수한다','폐쇄형 헤드가 하나씩 감열되어야만 방수한다','2차측 압축공기 압력저하만으로 작동한다','평상시 헤드가 모두 닫혀 있고 감지설비가 없다'],a:0,
    choiceExplanations:['정답. 개방형 헤드와 구역 동시방수가 핵심이다.','준비작동식·습식 계열과 혼동한 설명이다.','건식과 혼동한 설명이다.','일제살수식은 감지설비와 밸브 연동을 사용한다.']
  },
  {
    id:'119-verfire-sprinkler-deluge-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C20',
    difficulty:'high',type:'적용목적형',source:'2026 예방실무1 PDF 302쪽',
    q:'일제살수식이 적합한 목적과 가장 가까운 것은?',
    choices:['짧은 시간에 화재가 크게 확대될 수 있는 방호구역에 빠르게 대량 방수한다','사람의 수동 조작 없이는 절대 방수하지 않는다','피난방향 표시만 수행한다','화재원인 조사를 자동으로 수행한다'],a:0,
    choiceExplanations:['정답. 급격한 화재 확대 위험에 구역 동시방수로 대응하는 개념이다.','자동 감지·밸브 연동으로 작동한다.','피난구조설비 기능이 아니다.','화재조사설비가 아니다.']
  },
  {
    id:'119-verfire-sprinkler-head-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C21',
    difficulty:'mid',type:'헤드구조형',source:'2026 예방실무1 PDF 287쪽',
    q:'스프링클러 헤드의 구성·기능 연결로 옳은 것은?',
    choices:['감열부는 열에 반응하고, 오리피스는 물의 통로이며, 디플렉터는 물을 분산시킨다','감열부는 피난방향을 표시하고 디플렉터는 화재를 감지한다','오리피스는 경보음을 내고 감열부는 물을 저장한다','디플렉터는 배관압력을 생성하는 펌프다'],a:0,
    choiceExplanations:['정답. 헤드 각 구성요소의 기본 기능을 올바르게 연결했다.','구성요소의 기능이 서로 바뀌었다.','헤드 구성요소의 역할과 맞지 않는다.','디플렉터는 방출수를 분산시키는 부품이다.']
  },
  {
    id:'119-verfire-sprinkler-head-02',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C21',
    difficulty:'high',type:'헤드비교형',source:'2026 예방실무1 PDF 287쪽',
    q:'폐쇄형 헤드와 개방형 헤드의 구분으로 옳은 것은?',
    choices:['폐쇄형은 감열부 작동 후 개방되고, 개방형은 평상시 방수구가 열려 있다','둘 다 평상시 방수구가 항상 열려 있다','개방형만 감열부가 있어 하나씩 열린다','폐쇄형은 경보신호만으로 기계적으로 열린다'],a:0,
    choiceExplanations:['정답. 헤드 형식 구분의 핵심이다.','폐쇄형은 평상시 닫혀 있다.','개방형은 감열부에 의해 개별 개방되는 방식이 아니다.','폐쇄형은 자체 감열부의 열반응을 이해해야 한다.']
  }
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));let added=0;
for(const q of Q){
  if(ids.has(q.id)||texts.has(norm(q.q)))continue;
  q.ex=q.choiceExplanations[q.a];
  q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
  if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_FIRE_BATCH1_CHOICES '+q.id);
  if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_FIRE_BATCH1_EXPLANATIONS '+q.id);
  if(!/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/.test(q.source))throw Error('VERIFIED_FIRE_BATCH1_PAGE '+q.id);
  V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));added++;
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedFireBatch119={version:'119-verified-fire-batch1-v1',planned:Q.length,added,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();