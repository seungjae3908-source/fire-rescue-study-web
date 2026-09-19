'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const Q=[
{
 id:'119-verbreadth1-e01-system-01',grade:'B',subject:'ems',scopeId:'E01',conceptId:'E01-C02',difficulty:'mid',type:'체계비교형',source:'2026 소방전술3(구급) 11~17쪽',
 q:'미국과 프랑스의 응급의료체계 특징을 올바르게 연결한 것은?',
 choices:['미국은 BLS·ALS·최초반응자 등 단계적 체계, 프랑스는 SAMU·SMUR 중심의 의료진 현장개입','미국은 SAMU만 운영하고 프랑스는 BLS만 운영한다','두 나라는 현장대응 방식이 완전히 동일하다','프랑스는 의료진의 현장개입이 없는 체계다'],a:0,
 choiceExplanations:['정답. 교재는 미국의 단계적 EMS와 프랑스의 SAMU·SMUR 중심 의료개입을 비교한다.','두 국가의 특징을 뒤바꾼 설명이다.','국가별 체계는 현장 의료개입과 인력구조에 차이가 있다.','프랑스 체계의 대표 특징과 반대다.']
},
{
 id:'119-verbreadth1-e01-scope-01',grade:'B',subject:'ems',scopeId:'E01',conceptId:'E01-C03',difficulty:'high',type:'업무범위형',source:'2026 소방전술3(구급) 18~24쪽',
 q:'1급과 2급 응급구조사의 업무범위를 비교한 설명으로 가장 적절한 것은?',
 choices:['1급은 의료지도 아래 일부 전문처치를 수행할 수 있고 2급은 기본 응급처치 중심으로 구분된다','2급만 기도삽관·약물투여를 무제한 시행한다','1급과 2급은 법적 업무범위 구분이 없다','모든 응급구조사는 의료지도와 무관하게 모든 처치를 할 수 있다'],a:0,
 choiceExplanations:['정답. 교재는 자격별 업무범위와 의료지도 필요성을 구분한다.','전문처치를 2급에게 무제한 허용하는 설명이 아니다.','자격별 법적 업무범위 차이가 있다.','허용된 업무범위와 의료지도를 준수해야 한다.']
},
{
 id:'119-verbreadth1-e02-stress-01',grade:'B',subject:'ems',scopeId:'E02',conceptId:'E02-C01',difficulty:'mid',type:'스트레스관리형',source:'2026 소방전술3(구급) 25~28쪽',
 q:'구급대원의 누적 스트레스 관리에 대한 설명으로 옳은 것은?',
 choices:['수면·식사 변화, 짜증, 두통 등 신체·정서·행동징후를 조기에 인지하고 필요하면 동료·전문지원을 활용한다','스트레스 반응은 의지 부족이므로 항상 숨긴다','심각한 사건 뒤에도 휴식이나 지원은 필요 없다','수면 변화와 흥미저하는 스트레스와 무관하다'],a:0,
 choiceExplanations:['정답. 스트레스는 여러 영역의 변화로 나타날 수 있어 조기 인식과 적절한 지원이 중요하다.','스트레스를 단순 의지 문제로 보면 관리가 지연될 수 있다.','심각한 사건 뒤에는 위기사건 스트레스 관리가 필요할 수 있다.','수면·흥미 변화는 스트레스 징후로 나타날 수 있다.']
},
{
 id:'119-verbreadth1-e03-handhygiene-01',grade:'B',subject:'ems',scopeId:'E03',conceptId:'E03-C02',difficulty:'high',type:'감염예방형',source:'2026 소방전술3(구급) 32~40쪽',
 q:'감염예방 처치에 대한 설명으로 가장 적절한 것은?',
 choices:['장갑 사용은 손위생을 대신하지 못하며 눈에 보이는 오염이 있으면 비누와 물로 씻는 것이 중요하다','장갑을 착용하면 손위생은 필요 없다','오염된 손은 알코올만 사용하면 항상 충분하다','사용한 주사침은 일반 쓰레기봉투에 버린다'],a:0,
 choiceExplanations:['정답. 장갑과 손위생은 별개이며 오염이 있으면 비누·물 세척이 중요하다.','장갑을 벗은 뒤에도 손위생을 시행해야 한다.','눈에 보이는 오염이 있는 상황에서는 비누와 물 세척이 중요하다.','날카로운 물품은 안전용기에 처리해야 한다.']
},
{
 id:'119-verbreadth1-e03-sterile-01',grade:'B',subject:'ems',scopeId:'E03',conceptId:'E03-C03',difficulty:'mid',type:'소독비교형',source:'2026 소방전술3(구급) 41~42쪽',
 q:'세척·소독·멸균을 올바르게 구분한 것은?',
 choices:['세척은 눈에 보이는 오염 제거, 소독은 대부분의 병원성 미생물 제거, 멸균은 아포를 포함한 모든 미생물 제거','세척과 멸균은 완전히 같은 과정이다','소독은 아포를 포함한 모든 미생물을 반드시 제거한다','멸균은 눈에 보이는 먼지만 닦는 과정이다'],a:0,
 choiceExplanations:['정답. 세 단계는 제거 대상과 미생물 제거 수준이 다르다.','세척과 멸균의 목표 수준은 다르다.','소독이 모든 아포까지 반드시 제거하는 것은 아니다.','멸균은 가장 높은 수준의 미생물 제거 과정이다.']
},
{
 id:'119-verbreadth1-e03-exposure-01',grade:'B',subject:'ems',scopeId:'E03',conceptId:'E03-C04',difficulty:'high',type:'노출후관리형',source:'2026 소방전술3(구급) 43쪽',
 q:'혈액·체액에 찔림 또는 점막 노출이 발생한 구급대원의 초기 대응으로 옳은 것은?',
 choices:['노출부위를 즉시 씻고 노출 사실을 보고한 뒤 필요한 후속조치를 받는다','증상이 생길 때까지 아무에게도 알리지 않는다','오염된 장갑을 계속 착용하고 근무한다','노출경로와 감염병 종류는 후속조치와 무관하다'],a:0,
 choiceExplanations:['정답. 즉시 세척·보고 후 노출경로에 맞는 예방접종·예방처치 등을 검토한다.','노출을 숨기면 필요한 조치가 지연될 수 있다.','오염된 보호구는 제거하고 적절히 처리해야 한다.','노출경로와 감염병 종류는 후속조치 결정에 중요하다.']
},
{
 id:'119-verbreadth1-e04-physiology-01',grade:'B',subject:'ems',scopeId:'E04',conceptId:'E04-C02',difficulty:'mid',type:'기관계기능형',source:'2026 소방전술3(구급) 55~71쪽',
 q:'기관계의 기능 연결로 옳은 것은?',
 choices:['호흡계는 가스교환, 순환계는 산소·영양소 운반, 신경계는 신체기능 조절에 관여한다','호흡계가 뼈의 형태만 만든다','순환계가 음식물 소화만 담당한다','신경계는 혈액을 직접 펌프질한다'],a:0,
 choiceExplanations:['정답. 각 기관계의 대표 기능을 올바르게 연결한 설명이다.','뼈와 운동은 근골격계 기능과 관련된다.','소화기계 기능을 순환계에 잘못 연결했다.','혈액 펌프는 심혈관계의 심장이 담당한다.']
},
{
 id:'119-verbreadth1-e05-communication-01',grade:'B',subject:'ems',scopeId:'E05',conceptId:'E05-C01',difficulty:'mid',type:'의사소통형',source:'2026 소방전술3(구급) 72~75쪽',
 q:'의식이 있는 환자와 의사소통할 때 적절한 방법은?',
 choices:['자신을 소개하고 눈높이를 맞춰 쉬운 표현으로 천천히 말하며 환자의 말을 경청한다','보호자가 있으면 환자 본인에게는 전혀 말하지 않는다','전문용어만 빠르게 사용한다','폭력위험이 있어도 퇴로와 대원안전은 고려하지 않는다'],a:0,
 choiceExplanations:['정답. 신뢰 형성과 정확한 정보수집을 위해 소개·눈높이·쉬운 말·경청이 중요하다.','가능하면 환자 본인과 직접 의사소통한다.','전문용어 남용은 이해를 방해할 수 있다.','폭력위험이 있으면 대원안전과 지원 요청이 우선이다.']
},
{
 id:'119-verbreadth1-e05-radio-01',grade:'B',subject:'ems',scopeId:'E05',conceptId:'E05-C02',difficulty:'mid',type:'통신장비형',source:'2026 소방전술3(구급) 76쪽',
 q:'구급 통신장비에 대한 설명으로 가장 적절한 것은?',
 choices:['기지국은 휴대용 무전기보다 일반적으로 출력과 전파범위가 크며 실제 거리는 지형·위치 영향을 받는다','휴대용 무전기는 항상 기지국보다 출력이 높다','교재의 거리 예시는 모든 지형에서 절대적으로 동일하다','무전기는 배터리 점검이 필요 없다'],a:0,
 choiceExplanations:['정답. 교재는 기지국과 휴대용 장비의 출력·범위 예를 제시하되 환경 영향을 함께 고려한다.','휴대용 무전기는 일반적으로 더 낮은 출력의 이동장비다.','전파거리는 지형과 위치 등에 영향을 받는다.','충전상태와 여분 배터리 확인이 필요하다.']
},
{
 id:'119-verbreadth1-e05-record-01',grade:'B',subject:'ems',scopeId:'E05',conceptId:'E05-C04',difficulty:'high',type:'기록원칙형',source:'2026 소방전술3(구급) 79~88쪽',
 q:'구급활동기록 작성 원칙으로 옳은 것은?',
 choices:['주호소·평가·처치·반응·이송정보를 사실에 근거해 정확히 기록하고 개인정보를 보호한다','기억이 불확실하면 사실과 다르게 추정해 작성한다','이송 거부는 기록하지 않는다','오류가 있으면 기록 전체를 임의로 삭제한다'],a:0,
 choiceExplanations:['정답. 의료연속성과 법적 기록을 위해 사실에 근거한 정확·완전한 기록과 비밀보장이 필요하다.','추정이나 허위기록을 해서는 안 된다.','거부 사실과 필요한 설명도 기록한다.','오류는 정해진 방식으로 정정해야 한다.']
},
{
 id:'119-verbreadth1-e06-plan-01',grade:'B',subject:'ems',scopeId:'E06',conceptId:'E06-C01',difficulty:'mid',type:'이동계획형',source:'2026 소방전술3(구급) 89~92쪽',
 q:'환자를 들기 전에 먼저 해야 할 준비로 가장 적절한 것은?',
 choices:['이동경로·목적지·필요인원·장비를 확인하고 팀원 역할과 신호를 공유한다','환자를 먼저 든 뒤 계단과 장애물을 확인한다','장비 없이 일단 이동을 시작한다','팀원에게 역할을 알리지 않고 각자 움직인다'],a:0,
 choiceExplanations:['정답. 이동 전 계획과 역할조정은 대원과 환자의 손상을 줄인다.','환자를 든 뒤 경로를 확인하면 위험이 커진다.','필요한 장비와 인원을 사전에 준비해야 한다.','팀원 간 신호와 역할 공유가 필요하다.']
},
{
 id:'119-verbreadth1-e06-body-01',grade:'B',subject:'ems',scopeId:'E06',conceptId:'E06-C02',difficulty:'high',type:'신체역학형',source:'2026 소방전술3(구급) 89~92쪽',
 q:'무거운 환자를 들어 올릴 때 대원의 허리손상을 줄이는 방법으로 옳은 것은?',
 choices:['무게를 몸 가까이에 두고 다리 힘을 사용하며 방향전환은 발을 움직여 몸 전체로 한다','허리를 굽히고 비튼 상태에서 들어 올린다','무게를 몸에서 최대한 멀리 둔다','무거워도 추가 인원이나 장비를 요청하지 않는다'],a:0,
 choiceExplanations:['정답. 몸 가까이 유지·다리 사용·비틀림 방지가 기본 신체역학 원칙이다.','허리 굽힘과 비틀림은 손상위험을 높인다.','무게중심이 멀어지면 허리 부담이 커진다.','무리한 경우 추가 인원이나 장비를 요청해야 한다.']
},
{
 id:'119-verbreadth1-e06-move-01',grade:'B',subject:'ems',scopeId:'E06',conceptId:'E06-C03',difficulty:'high',type:'긴급이동형',source:'2026 소방전술3(구급) 93~95쪽',
 q:'환자를 평가하기 전에라도 긴급 이동이 필요할 수 있는 상황은?',
 choices:['현장에 즉각적인 위험이 있거나 기도확보·CPR을 위해 위치 변경이 필요한 경우','현장이 완전히 안전하고 환자상태도 안정적인 경우','단지 이동이 편해 보인다는 이유만 있는 경우','평가와 고정이 가능한데도 무조건 끌어내는 경우'],a:0,
 choiceExplanations:['정답. 즉각적인 현장위험이나 생명구조 처치가 필요한 경우 긴급 이동을 고려할 수 있다.','안전한 상황에서는 불필요한 움직임을 줄인다.','편의만으로 긴급이동을 결정하지 않는다.','불필요한 이동은 추가손상을 만들 수 있다.']
},
{
 id:'119-verbreadth1-e06-equipment-01',grade:'B',subject:'ems',scopeId:'E06',conceptId:'E06-C04',difficulty:'mid',type:'이동장비형',source:'2026 소방전술3(구급) 96~99쪽',
 q:'환자 이동장비 선택 원칙으로 가장 적절한 것은?',
 choices:['계단·좁은 공간·척추손상 가능성·환자 체중과 상태를 고려해 장비를 선택하고 잠금·고정을 확인한다','모든 상황에 하나의 들것만 사용한다','장비 잠금상태는 확인하지 않는다','팀원 간 신호 없이 개별적으로 이동한다'],a:0,
 choiceExplanations:['정답. 장비는 현장환경과 환자상태에 맞춰 선택하고 안전고정을 확인한다.','장비마다 적합한 환경과 목적이 다르다.','잠금·고정 확인은 낙상방지에 중요하다.','팀 협력과 신호조정이 필요하다.']
},
{
 id:'119-verbreadth1-e07-transport-01',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C04',difficulty:'mid',type:'이송장비형',source:'2026 소방전술3(구급) 116~119쪽',
 q:'환자이송 장비 사용에 대한 설명으로 옳은 것은?',
 choices:['현장과 손상상태에 맞는 장비를 선택하고 환자를 안정적으로 고정한 뒤 이동 중에도 상태를 관찰한다','들것에 환자를 고정하지 않고 이동한다','장비 선택은 환자 손상과 무관하다','이동을 시작하면 환자상태를 다시 보지 않는다'],a:0,
 choiceExplanations:['정답. 적절한 장비선택·고정·이동 중 관찰이 환자안전의 핵심이다.','고정하지 않으면 낙상과 추가손상 위험이 있다.','손상과 환경에 따라 장비를 선택한다.','이송 중에도 지속적인 환자 관찰이 필요하다.']
},
{
 id:'119-verbreadth1-e07-trauma-gear-01',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C05',difficulty:'high',type:'외상장비형',source:'2026 소방전술3(구급) 120~126쪽',
 q:'외상처치 장비 적용 원칙으로 가장 적절한 것은?',
 choices:['드레싱·붕대로 상처와 출혈을 관리하고 부목 적용 전후 말초 순환·감각·운동을 확인한다','부목을 적용하면 생명위협 처치는 미룬다','출혈이 있어도 드레싱은 사용하지 않는다','부목 적용 전후 말초상태는 확인할 필요가 없다'],a:0,
 choiceExplanations:['정답. 외상장비는 상처보호·지혈·고정을 위해 사용하며 말초상태를 확인한다.','ABC 등 생명위협 처치가 장비적용보다 우선이다.','드레싱·붕대는 상처보호와 출혈조절에 사용한다.','고정 전후 신경혈관 상태를 확인해야 한다.']
},
{
 id:'119-verbreadth1-e08-nontrauma-01',grade:'B',subject:'ems',scopeId:'E08',conceptId:'E08-C04',difficulty:'high',type:'비외상평가형',source:'2026 소방전술3(구급) 152~155쪽',
 q:'비외상 환자의 집중평가로 가장 적절한 것은?',
 choices:['주호소를 확인하고 OPQRST·SAMPLE로 병력을 수집하며 관련 계통검진과 활력징후를 연결한다','주호소와 관계없이 모든 환자에게 같은 부위만 검사한다','활력징후는 측정하지 않는다','병력은 이송 후에만 확인한다'],a:0,
 choiceExplanations:['정답. 비외상 집중평가는 주호소·병력·관련계통 신체검진·활력징후를 연결한다.','주호소에 따라 필요한 집중검진이 달라질 수 있다.','활력징후는 환자 상태판단의 핵심 자료다.','현장에서 가능한 병력수집이 필요하다.']
},
{
 id:'119-verbreadth1-e08-trauma-01',grade:'B',subject:'ems',scopeId:'E08',conceptId:'E08-C05',difficulty:'high',type:'외상평가형',source:'2026 소방전술3(구급) 156~159쪽',
 q:'외상 환자의 집중평가 방법을 정할 때 가장 중요한 요소는?',
 choices:['손상기전과 환자 위급도를 바탕으로 신속 전신평가 또는 부위별 평가를 선택한다','보이는 상처 하나만 보고 손상기전을 무시한다','생명위협 손상은 평가가 끝날 때까지 처치하지 않는다','모든 외상환자에게 동일한 한 부위만 검사한다'],a:0,
 choiceExplanations:['정답. 손상기전과 위급도에 따라 평가범위를 정하고 발견한 생명위협은 즉시 처치한다.','중요 손상기전은 숨은 중증손상을 예측하는 데 중요하다.','생명위협은 평가와 동시에 처치한다.','평가방식은 환자 상태와 손상기전에 따라 달라진다.']
},
{
 id:'119-verbreadth1-e09-oxygen-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'mid',type:'산소치료형',source:'2026 소방전술3(구급) 181~188쪽',
 q:'맥박산소포화도 측정값을 해석하는 원칙으로 가장 적절한 것은?',
 choices:['수치만으로 판단하지 않고 기도·호흡과 전체 임상상태를 함께 평가한다','정상 범위 숫자 하나만 있으면 모든 호흡문제를 배제한다','산소포화도는 환자평가와 무관하다','수치가 있으면 호흡수와 의식상태는 볼 필요가 없다'],a:0,
 choiceExplanations:['정답. 산소포화도는 유용하지만 기도·호흡·순환과 임상상태를 함께 해석해야 한다.','측정오류와 다른 호흡문제가 있을 수 있어 단일 수치로 배제하지 않는다.','산소화 평가에 중요한 자료다.','다른 생명징후와 환자상태도 함께 평가해야 한다.']
},
{
 id:'119-verbreadth1-e09-special-airway-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C08',difficulty:'high',type:'특수기도형',source:'2026 소방전술3(구급) 189~191쪽',
 q:'안면화상 환자의 기도관리에서 특히 주의할 점은?',
 choices:['출혈과 부종으로 기도가 빠르게 좁아질 수 있어 반복적인 기도평가가 필요하다','처음 기도가 정상이면 이후 부종 가능성은 없다','안면화상은 기도와 전혀 관련 없다','기도평가보다 음식 섭취를 먼저 시행한다'],a:0,
 choiceExplanations:['정답. 안면외상·화상은 진행성 부종으로 기도폐쇄가 악화될 수 있어 반복평가가 중요하다.','기도부종은 시간이 지나며 악화될 수 있다.','안면화상은 기도열손상과 부종 위험을 동반할 수 있다.','기도·호흡 평가가 우선이다.']
}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('VERIFIED_EMS_BREADTH1_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('VERIFIED_EMS_BREADTH1_DUP_TEXT '+q.id+' :: '+q.q);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_EMS_BREADTH1_CHOICES '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_EMS_BREADTH1_EXPLANATIONS '+q.id);
 if(!/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/.test(q.source))throw Error('VERIFIED_EMS_BREADTH1_PAGE '+q.id);
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedEMSBreadth119={version:'119-verified-ems-breadth1-v1',planned:Q.length,added:Q.length,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();