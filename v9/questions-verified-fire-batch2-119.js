'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const Q=[
{
 id:'119-verfire2-backdraft-air-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C11',difficulty:'high',type:'환기위험형',source:'2026 소방전술1 PDF 453쪽',
 q:'산소가 부족한 밀폐 화재공간에 고온 미연소가스가 축적된 상태에서 문을 갑자기 크게 열면 위험한 이유는?',
 choices:['신선한 공기 유입으로 가연범위가 형성되어 폭발적 연소가 일어날 수 있기 때문이다','공기 유입이 항상 내부온도를 즉시 안전수준으로 낮추기 때문이다','미연소가스가 즉시 모두 불활성화되기 때문이다','산소가 들어오면 연소반응이 자동으로 멈추기 때문이다'],a:0,
 choiceExplanations:['정답. 백드래프트는 산소부족 상태의 고온 가스에 신선한 공기가 유입될 때 위험이 커진다.','무분별한 환기는 오히려 급격한 연소를 촉진할 수 있다.','미연소가스는 공기와 혼합되면 연소 가능한 혼합물을 만들 수 있다.','산소는 연소를 지지하므로 자동 소화되지 않는다.']
},
{
 id:'119-verfire2-hazmat-class-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C01',difficulty:'mid',type:'류별성상형',source:'2026 예방실무2 PDF 345쪽 · 385쪽',
 q:'위험물 류별 대표 성상을 올바르게 연결한 것은?',
 choices:['제3류 자연발화성·금수성 · 제5류 자기반응성 · 제6류 산화성액체','제3류 인화성액체 · 제5류 산화성액체 · 제6류 가연성고체','제3류 산화성고체 · 제5류 인화성액체 · 제6류 자기반응성','제3류 가연성고체 · 제5류 금수성 · 제6류 인화성액체'],a:0,
 choiceExplanations:['정답. 제3·5·6류의 대표 위험성 연결이다.','각 류의 성상을 잘못 연결했다.','제1·4·5류 성상과 혼동한 연결이다.','제2·3·4류 특성을 잘못 섞은 설명이다.']
},
{
 id:'119-verfire2-simple-esfr-purpose-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C06',difficulty:'high',type:'목적판단형',source:'2026 예방실무1 PDF 321·333쪽',
 q:'간이스프링클러와 화재조기진압용 스프링클러를 비교한 설명 중 옳지 않은 것은?',
 choices:['두 설비는 적용목적과 요구 성능이 완전히 같아 구분할 필요가 없다','간이스프링클러는 비교적 단순한 구성으로 초기화재 제어에 초점을 둔다','화재조기진압용은 고위험 저장공간 등에서 강한 방수성능과 조기진압 목적을 가진다','둘 다 자동수계소화설비라는 공통점이 있다'],a:0,
 choiceExplanations:['정답. 두 설비는 목적과 적용환경·성능 개념이 달라 구분해야 한다.','간이스프링클러의 대표 목적과 맞다.','화재조기진압용의 대표 목적과 맞다.','자동수계소화설비라는 공통점은 있다.']
},
{
 id:'119-verfire2-sprinkler-flow-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C16',difficulty:'high',type:'계통연동형',source:'2026 예방실무1 PDF 288쪽',
 q:'스프링클러 헤드가 개방되어 물이 흐르기 시작했을 때 설비에서 함께 나타날 수 있는 변화로 가장 적절한 것은?',
 choices:['배관의 압력·유수 변화가 펌프와 경보장치 연동의 단서가 된다','유수 변화는 어떤 경보장치와도 관계가 없다','헤드 개방과 동시에 모든 감지기가 자동으로 제거된다','가압송수장치는 물 흐름과 무관하게 항상 정지한다'],a:0,
 choiceExplanations:['정답. 헤드 개방 후 압력과 유수상태 변화가 펌프·경보 연동에 이용된다.','유수검지장치는 유수·압력변화를 경보와 연결한다.','감지기 제거와 관련된 과정이 아니다.','필요한 압력을 유지하도록 가압송수장치가 연동될 수 있다.']
},
{
 id:'119-verfire2-wet-individual-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C17',difficulty:'high',type:'습식헤드형',source:'2026 예방실무1 PDF 288쪽',
 q:'습식 스프링클러 화재 시 방수에 대한 설명으로 가장 적절한 것은?',
 choices:['화재열을 받은 폐쇄형 헤드가 개방되어 해당 지점에서 빠르게 방수된다','화재경보만 울리면 구역의 모든 폐쇄형 헤드가 동시에 열린다','2차측 압축공기가 모두 빠져야만 물이 들어온다','별도 감지설비가 먼저 밸브를 열어야만 배관에 물이 찬다'],a:0,
 choiceExplanations:['정답. 습식은 상시 충수되어 있어 감열된 폐쇄형 헤드가 열리면 빠르게 방수된다.','모든 헤드가 경보만으로 동시에 개방되는 방식이 아니다.','압축공기 배출은 건식의 작동특성과 가깝다.','감지기 선행 충수는 준비작동식과 가깝다.']
},
{
 id:'119-verfire2-dry-delay-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C18',difficulty:'high',type:'건식지연형',source:'2026 예방실무1 PDF 284쪽',
 q:'건식 스프링클러가 습식보다 방수가 늦어질 수 있는 주된 이유는?',
 choices:['헤드 개방 후 공기 배출·압력저하·건식밸브 개방·배관 충수 과정이 추가되기 때문이다','평상시 헤드까지 물이 가득 차 있기 때문이다','모든 헤드가 항상 열린 상태이기 때문이다','감지기 신호만으로 물이 즉시 나가기 때문이다'],a:0,
 choiceExplanations:['정답. 건식은 물이 헤드까지 상시 충수된 습식보다 추가 단계가 있어 방수지연이 생길 수 있다.','이는 습식의 특징이다.','건식은 일반적으로 폐쇄형 헤드를 사용한다.','건식의 작동원리를 지나치게 단순화한 설명이다.']
},
{
 id:'119-verfire2-preaction-no-water-yet-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C19',difficulty:'high',type:'준비작동순서형',source:'2026 예방실무1 PDF 284쪽',
 q:'준비작동식 스프링클러에서 감지설비가 작동해 준비작동밸브가 열렸지만 폐쇄형 헤드는 아직 열리지 않았다. 가장 적절한 설명은?',
 choices:['2차측 배관은 충수될 수 있지만 실제 방수는 열을 받은 헤드가 개방되어야 시작된다','감지기 작동 즉시 모든 헤드가 동시에 방수한다','개방형 헤드를 사용하므로 헤드 감열은 필요 없다','2차측에는 물이 절대 들어가지 않는다'],a:0,
 choiceExplanations:['정답. 준비작동식은 감지로 밸브가 열리고 충수된 뒤 폐쇄형 헤드가 열려야 방수된다.','구역 동시방수는 일제살수식과 가깝다.','준비작동식은 폐쇄형 헤드를 사용한다.','감지 후 밸브가 열리면 2차측 충수가 이루어질 수 있다.']
},
{
 id:'119-verfire2-deluge-open-head-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C20',difficulty:'high',type:'일제살수헤드형',source:'2026 예방실무1 PDF 302쪽',
 q:'일제살수식에서 개방형 헤드를 사용하는 이유와 가장 가까운 설명은?',
 choices:['일제개방밸브가 열리면 방호구역의 여러 헤드에서 즉시 동시에 방수하기 위해서다','각 헤드가 개별 감열될 때까지 물이 나오지 않게 하기 위해서다','2차측 압축공기만 유지하기 위해서다','헤드가 화재신호를 전기적으로 수신하기 위해서다'],a:0,
 choiceExplanations:['정답. 개방형 헤드는 밸브 개방과 동시에 구역 전체 방수를 가능하게 한다.','폐쇄형 헤드의 개별 감열 개방과 반대되는 개념이다.','건식의 평상시 배관상태와 관련된 설명이다.','헤드는 전기신호 수신기가 아니라 물을 방사하는 구성요소다.']
},
{
 id:'119-verfire2-head-response-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C21',difficulty:'high',type:'헤드반응형',source:'2026 예방실무1 PDF 287쪽',
 q:'조기반응형 스프링클러 헤드의 개념으로 가장 적절한 것은?',
 choices:['일반형보다 빠른 열응답을 목표로 하는 헤드다','모든 화재에서 더 높은 표시온도만을 의미한다','감열부가 없는 개방형 헤드와 같은 뜻이다','자동화재탐지 감지기 자체를 뜻한다'],a:0,
 choiceExplanations:['정답. 조기반응형은 화재열에 더 빠르게 반응하는 성능 개념으로 이해한다.','표시온도 하나만으로 조기반응 개념을 설명할 수 없다.','개방형 헤드와 조기반응형은 서로 다른 구분축이다.','스프링클러 헤드와 자동화재탐지 감지기는 다른 장치다.']
}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('VERIFIED_FIRE_BATCH2_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('VERIFIED_FIRE_BATCH2_DUP_TEXT '+q.id+' :: '+q.q);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_FIRE_BATCH2_CHOICES '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_FIRE_BATCH2_EXPLANATIONS '+q.id);
 if(!/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/.test(q.source))throw Error('VERIFIED_FIRE_BATCH2_PAGE '+q.id);
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedFireBatch2119={version:'119-verified-fire-batch2-v1',planned:Q.length,added:Q.length,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();