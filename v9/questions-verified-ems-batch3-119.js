'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const Q=[
{
 id:'119-verems3-cbrn-zone-01',grade:'B',subject:'ems',scopeId:'E03',conceptId:'E03-C05',difficulty:'high',type:'제독동선형',source:'2026 소방전술3(구급) 44~50쪽',
 q:'오염환자를 현장에서 이송하기 전 2차 오염을 줄이기 위한 흐름으로 가장 적절한 것은?',
 choices:['오염구역에서 신속히 이동 → 오염통제구역에서 오염의복 제거·제독 → 안전구역에서 본격 처치·이송','오염의복을 그대로 입힌 채 구급차에 먼저 탑승','안전구역에서 다시 오염구역으로 환자를 이동','제독 없이 병원 내부로 바로 진입'],a:0,
 choiceExplanations:['정답. 오염 확산을 줄이기 위해 구역을 구분하고 제독 후 안전구역의 처치·이송으로 연결한다.','오염의복은 차량과 대원·병원의 2차 오염을 일으킬 수 있다.','정상적인 현장 동선과 반대다.','제독 없이 이송하면 2차 오염 위험이 커진다.']
},
{
 id:'119-verems3-airway-device-01',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C01',difficulty:'high',type:'보조기도기형',source:'2026 소방전술3(구급) 103~108쪽',
 q:'기도보조기구 적용에 대한 설명으로 가장 적절한 것은?',
 choices:['환자의 의식과 구역반사를 확인해 OPA·NPA 등 적절한 기구를 선택한다','구역반사가 강한 의식 환자에게 OPA를 강제로 삽입한다','모든 환자에게 같은 크기와 같은 종류의 기도기를 사용한다','분비물이 많아도 흡인 필요성은 고려하지 않는다'],a:0,
 choiceExplanations:['정답. 기도보조기구는 의식·구역반사와 폐쇄원인에 따라 적응과 금기가 달라진다.','구역반사가 있으면 OPA가 구토·흡인 위험을 높일 수 있다.','환자 상태와 해부학적 크기를 고려해야 한다.','분비물·혈액·구토물은 흡인 필요성을 평가해야 한다.']
},
{
 id:'119-verems3-breath-device-01',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C02',difficulty:'high',type:'산소·환기구분형',source:'2026 소방전술3(구급) 109~114쪽',
 q:'자발호흡이 불충분한 환자에서 장비 선택 원칙으로 옳은 것은?',
 choices:['산소공급만으로 충분한지 평가하고 필요하면 BVM 등으로 인공환기를 지원한다','비강캐뉼라만 연결하면 호흡이 없어도 항상 충분하다','자발호흡 여부는 장비 선택과 무관하다','가슴상승 확인 없이 환기 압력을 계속 높인다'],a:0,
 choiceExplanations:['정답. 자발호흡이 불충분하면 산소공급과 별개로 적절한 인공환기가 필요할 수 있다.','무호흡 또는 심한 저환기에서는 산소장비만으로 환기를 대신할 수 없다.','자발호흡 여부는 장비선택의 핵심 기준이다.','가슴상승과 환자 반응을 확인하며 과환기를 피해야 한다.']
},
{
 id:'119-verems3-airway-importance-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C01',difficulty:'mid',type:'우선순위형',source:'2026 소방전술3(구급) 163쪽',
 q:'무의식 환자에게 코골이와 비슷한 기도폐쇄음이 들린다. 가장 먼저 고려해야 할 것은?',
 choices:['혀가 뒤로 처져 기도를 막고 있는지 확인하고 기도개방을 시행한다','병력문진을 모두 끝낼 때까지 기도평가를 미룬다','기도폐쇄음은 정상으로 보고 관찰만 한다','먼저 보행 가능 여부를 확인한다'],a:0,
 choiceExplanations:['정답. 무의식에서는 혀가 뒤로 처져 기도를 막기 쉬워 기도평가와 개방이 우선이다.','기도폐쇄는 즉시 생명을 위협할 수 있어 문진보다 먼저 평가한다.','폐쇄음은 기도문제의 단서가 될 수 있다.','보행평가보다 기도 확보가 우선이다.']
},
{
 id:'119-verems3-breath-assess-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C02',difficulty:'high',type:'종합평가형',source:'2026 소방전술3(구급) 164~165쪽',
 q:'호흡수가 정상 범위더라도 호흡상태가 비정상일 수 있는 이유로 가장 적절한 것은?',
 choices:['규칙성·깊이·양측 흉곽 움직임·호흡음·보조근 사용 등도 함께 평가해야 하기 때문이다','호흡수는 어떤 환자에서도 의미가 없기 때문이다','정상 범위 호흡수는 항상 정상 산소화를 보장하기 때문이다','호흡음은 기도·호흡과 무관하기 때문이다'],a:0,
 choiceExplanations:['정답. 호흡평가는 숫자 하나가 아니라 여러 환기·산소화 징후를 종합한다.','호흡수는 중요한 활력징후지만 단독으로 충분하지 않다.','정상 호흡수만으로 정상 환기를 보장할 수 없다.','호흡음은 기도와 폐 상태를 평가하는 중요한 단서다.']
},
{
 id:'119-verems3-airway-open-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C03',difficulty:'mid',type:'비외상기도형',source:'2026 소방전술3(구급) 166~167쪽',
 q:'머리·목·척추 손상이 의심되지 않는 무의식 환자의 기본 기도개방법으로 가장 적절한 것은?',
 choices:['머리기울임-턱들어올리기법','목을 움직이지 않고 턱도 건드리지 않는다','복부밀어올리기만 시행한다','기도개방 없이 산소마스크만 올린다'],a:0,
 choiceExplanations:['정답. 척추손상이 의심되지 않으면 머리기울임-턱들어올리기법을 사용한다.','기도폐쇄 가능성이 있으면 적절한 기도개방이 필요하다.','복부밀어올리기는 기본 기도개방법이 아니다.','기도가 막혀 있으면 산소마스크만으로 충분하지 않을 수 있다.']
},
{
 id:'119-verems3-opa-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C04',difficulty:'mid',type:'OPA적응형',source:'2026 소방전술3(구급) 168쪽',
 q:'입인두기도기(OPA)의 대표적인 적응으로 가장 적절한 것은?',
 choices:['구역반사가 없는 무의식 환자','의식이 명료하고 구역반사가 강한 환자','정상적으로 말하고 걷는 환자에게 예방적으로 사용','모든 코피 환자에게 사용'],a:0,
 choiceExplanations:['정답. OPA는 구역반사가 없는 무의식 환자의 기도유지에 사용할 수 있다.','구역반사가 있으면 구토와 흡인 위험이 있다.','필요성이 없는 환자에게 예방적으로 삽입하지 않는다.','코피 자체가 OPA의 대표 적응은 아니다.']
},
{
 id:'119-verems3-ventilation-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C05',difficulty:'high',type:'환기효과형',source:'2026 소방전술3(구급) 171~178쪽',
 q:'인공호흡의 효과를 재평가하는 방법으로 가장 적절한 것은?',
 choices:['가슴상승과 피부색·맥박 등 환자반응을 확인한다','환기량을 계속 늘리고 환자반응은 보지 않는다','마스크 누출 여부는 확인하지 않는다','한 번 환기한 뒤 다시 평가하지 않는다'],a:0,
 choiceExplanations:['정답. 환기 중에는 가슴 움직임과 피부색·맥박 등 환자의 반응을 반복 확인한다.','과도한 환기는 피해야 하며 반응을 확인해야 한다.','마스크 밀착은 효과적인 환기에 중요하다.','기도·환기상태는 지속적으로 재평가해야 한다.']
},
{
 id:'119-verems3-resp-anatomy-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C01',difficulty:'mid',type:'후두개기능형',source:'2026 소방전술3(구급) 192쪽',
 q:'후두개의 주된 기능으로 가장 적절한 것은?',
 choices:['삼킬 때 기도 입구를 덮어 음식물이 기도로 들어가는 것을 줄인다','폐포에서 산소를 혈액으로 직접 운반한다','심장에서 전신으로 혈액을 내보낸다','횡격막 대신 항상 호흡을 만든다'],a:0,
 choiceExplanations:['정답. 후두개는 연하 시 기도 입구를 덮어 음식물의 기도 유입을 막는 데 기여한다.','폐포의 가스교환 기능과 다르다.','심장의 순환기능과 다르다.','호흡운동은 횡격막·갈비사이근 등이 담당한다.']
},
{
 id:'119-verems3-rr-quality-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C02',difficulty:'high',type:'비정상호흡형',source:'2026 소방전술3(구급) 193쪽',
 q:'호흡수가 연령별 정상범위 안에 있어도 비정상호흡으로 볼 수 있는 소견은?',
 choices:['불규칙한 호흡과 비대칭 가슴팽창 또는 과도한 호흡노력','규칙적이고 편안한 호흡만','정상적인 양측 흉곽 움직임만','호흡곤란 징후가 전혀 없는 상태'],a:0,
 choiceExplanations:['정답. 비정상호흡은 횟수뿐 아니라 규칙성·대칭성·호흡노력 등을 함께 평가한다.','편안하고 규칙적인 호흡은 비정상호흡의 대표 소견이 아니다.','정상적인 대칭 움직임은 오히려 정상 소견에 가깝다.','이상징후가 없다면 이 선택지만으로 비정상호흡이라 보기 어렵다.']
},
{
 id:'119-verems3-dyspnea-cause-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C03',difficulty:'high',type:'원인감별형',source:'2026 소방전술3(구급) 194~196쪽',
 q:'호흡곤란의 원인에 대한 설명으로 가장 적절한 것은?',
 choices:['기도폐쇄·환기장애·가스교환장애·순환문제·대사 또는 심리적 원인 등 다양할 수 있다','천식 한 가지 원인으로만 발생한다','심장질환에서는 호흡곤란이 발생하지 않는다','호흡곤란의 원인은 현장에서 항상 하나로 확정할 수 있다'],a:0,
 choiceExplanations:['정답. 호흡곤란은 여러 호흡기·순환기·대사적 원인으로 나타날 수 있다.','천식은 여러 원인 중 하나다.','심부전 등 심장질환에서도 호흡곤란이 나타날 수 있다.','현장에서는 원인을 단정하기보다 생명위협을 평가하고 필요한 지원을 한다.']
},
{
 id:'119-verems3-ped-resp-01',grade:'B',subject:'ems',scopeId:'E10',conceptId:'E10-C04',difficulty:'high',type:'저산소악화형',source:'2026 소방전술3(구급) 197쪽',
 q:'호흡곤란이 심한 소아에서 서맥이 새로 나타났다. 이 소견의 의미로 가장 적절한 것은?',
 choices:['심한 저산소증에 따른 악화로 심정지 임박 신호일 수 있다','소아에서는 언제나 정상적인 변화다','호흡상태가 완전히 회복됐다는 뜻이다','기도와 호흡을 더 이상 평가할 필요가 없다는 뜻이다'],a:0,
 choiceExplanations:['정답. 소아의 저산소성 서맥은 심각한 호흡부전과 심정지 임박을 시사할 수 있다.','서맥을 무조건 정상으로 간주하면 위험하다.','악화 소견이지 회복의 의미가 아니다.','즉시 기도·호흡과 순환을 재평가해야 한다.']
},
{
 id:'119-verems3-arrest-rosc-01',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C03',difficulty:'high',type:'ROSC기록형',source:'2026 소방전술3(구급) 441·451·464·469쪽',
 q:'자발순환회복(ROSC) 후 기록·평가에 대한 설명으로 가장 적절한 것은?',
 choices:['회복 시각·장소와 병원 인계 시 상태를 연속적으로 확인·기록한다','맥박이 돌아오면 이후 상태는 기록할 필요가 없다','일시적 ROSC 후 재심정지 가능성은 고려하지 않는다','ROSC는 심전도 리듬과 맥박 여부와 무관하다'],a:0,
 choiceExplanations:['정답. ROSC는 일시적일 수 있어 회복 시각·장소와 인계 당시 상태를 연속적으로 기록한다.','회복 후에도 재평가와 기록이 필요하다.','ROSC 후 다시 심정지가 발생할 수 있다.','교재는 맥박과 심전도 QRS 리듬이 존재하는 상태로 설명한다.']
},
{
 id:'119-verems3-electrical-vt-01',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C05',difficulty:'high',type:'VT판단형',source:'2026 소방전술3(구급) 209쪽',
 q:'심실빈맥(VT)이 확인된 환자에서 전기치료 방향을 정하기 전에 반드시 함께 확인할 것은?',
 choices:['맥박 유무','환자의 신발 크기','마지막 식사 메뉴','혈액형만'],a:0,
 choiceExplanations:['정답. VT는 맥박 유무에 따라 맥박 있는 빈맥과 무맥성 VT 심정지 접근이 달라진다.','신발 크기는 리듬치료 분기와 무관하다.','식사 메뉴는 전기치료 분기의 핵심이 아니다.','혈액형은 즉시 리듬치료 선택의 기준이 아니다.']
},
{
 id:'119-verems3-aed-auto-01',grade:'B',subject:'ems',scopeId:'E11',conceptId:'E11-C06',difficulty:'mid',type:'AED비교형',source:'2026 소방전술3(구급) 210~215쪽',
 q:'반자동 AED와 완전자동 AED의 차이를 가장 적절히 설명한 것은?',
 choices:['반자동은 충격 안내 후 구조자가 버튼을 누르고, 완전자동은 장비가 충격을 전달한다','두 장비 모두 구조자가 반드시 직접 전류량을 계산한다','완전자동 AED는 리듬분석을 하지 않는다','반자동 AED는 충격가능 리듬을 분석할 수 없다'],a:0,
 choiceExplanations:['정답. 충격 전달 방식에서 구조자 버튼 조작 여부가 대표적인 차이다.','일반 AED 사용에서 구조자가 전류량을 직접 계산하는 방식이 아니다.','완전자동형도 리듬을 분석해 충격 필요성을 판단한다.','반자동형도 충격가능 리듬을 분석하고 충격을 안내한다.']
},
{
 id:'119-verems3-abd-palpation-01',grade:'B',subject:'ems',scopeId:'E12',conceptId:'E12-C03',difficulty:'high',type:'복부검진형',source:'2026 소방전술3(구급) 216~222쪽',
 q:'급성 복통 환자의 복부 신체검진 원칙으로 가장 적절한 것은?',
 choices:['시진과 부드러운 촉진을 중심으로 하고 통증 부위를 강하게 반복 촉진하지 않는다','통증이 심할수록 같은 부위를 강하게 반복 누른다','복부 신체검진은 전혀 하지 않고 통증 위치도 묻지 않는다','ABC보다 복부 촉진을 항상 먼저 한다'],a:0,
 choiceExplanations:['정답. 불필요한 통증·손상을 피하며 시진과 부드러운 촉진으로 평가한다.','강한 반복 촉진은 환자 불편과 손상을 악화시킬 수 있다.','필요한 범위의 신체평가와 문진은 시행한다.','생명위협을 확인하는 ABC 평가가 우선이다.']
},
{
 id:'119-verems3-bleeding-ppe-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C02',difficulty:'mid',type:'출혈안전형',source:'2026 소방전술3(구급) 227쪽',
 q:'출혈 환자를 처치할 때 대원의 안전원칙으로 가장 적절한 것은?',
 choices:['혈액 노출을 막기 위한 적절한 개인보호구를 사용한다','혈액은 감염위험이 없으므로 맨손으로 처치한다','출혈량이 적어 보이면 보호구가 필요 없다','환자와 접촉하기 전에 장갑을 일부러 벗는다'],a:0,
 choiceExplanations:['정답. 혈액·체액 노출을 줄이기 위한 개인보호구 사용이 중요하다.','혈액은 감염성 노출원이 될 수 있다.','출혈량과 관계없이 필요한 표준주의를 적용한다.','보호구는 대원과 환자의 안전을 위해 사용한다.']
},
{
 id:'119-verems3-arterial-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C03',difficulty:'high',type:'동맥출혈함정형',source:'2026 소방전술3(구급) 228쪽',
 q:'다음 중 동맥 출혈의 전형적 특징과 가장 거리가 먼 것은?',
 choices:['검붉은 혈액이 박동과 무관하게 천천히 스며 나오는 양상만 보인다','선홍색 혈액이 나타날 수 있다','심박동에 맞춰 분출될 수 있다','지혈이 어려울 수 있다'],a:0,
 choiceExplanations:['정답. 이는 동맥 출혈의 대표적인 설명과 거리가 멀다.','동맥혈은 산소가 풍부해 선홍색으로 보일 수 있다.','동맥압 때문에 박동성 분출이 나타날 수 있다.','동맥 출혈은 빠른 실혈로 지혈이 어려울 수 있다.']
},
{
 id:'119-verems3-internal-bleed-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C04',difficulty:'high',type:'내부출혈배제형',source:'2026 소방전술3(구급) 233쪽',
 q:'교통사고 환자에게 외부출혈은 보이지 않지만 빈맥·창백한 피부·복부팽만이 있다. 가장 적절한 판단은?',
 choices:['외부에 피가 보이지 않아도 내부출혈을 적극 의심한다','외부출혈이 없으므로 출혈 가능성을 완전히 배제한다','복부와 골반에는 큰 내부출혈이 생길 수 없다','활력징후 변화는 내부출혈과 무관하다'],a:0,
 choiceExplanations:['정답. 내부출혈은 겉으로 보이지 않을 수 있어 손상기전과 쇼크징후를 함께 본다.','외부출혈 부재만으로 내부출혈을 배제할 수 없다.','복부·골반은 대량 내부출혈이 발생할 수 있는 부위다.','빈맥과 피부·의식 변화는 쇼크의 중요한 단서다.']
},
{
 id:'119-verems3-shock-definition-01',grade:'B',subject:'ems',scopeId:'E13',conceptId:'E13-C05',difficulty:'mid',type:'쇼크정의형',source:'2026 소방전술3(구급) 234~239쪽',
 q:'쇼크의 본질을 가장 정확히 설명한 것은?',
 choices:['조직에 필요한 혈류와 산소 전달이 부족해지는 관류부전 상태','혈압 숫자가 낮은 상태만을 의미한다','심장질환이 있을 때만 발생하는 상태','피부색 변화만 있는 상태'],a:0,
 choiceExplanations:['정답. 쇼크는 단순한 저혈압이 아니라 조직관류와 산소전달의 부족이 핵심이다.','초기 보상기에는 혈압이 유지될 수도 있다.','출혈·체액손실·혈관확장 등 다양한 원인으로 발생할 수 있다.','피부소견은 여러 평가요소 중 하나다.']
},
{
 id:'119-verems3-burn-depth-01',grade:'B',subject:'ems',scopeId:'E14',conceptId:'E14-C03',difficulty:'high',type:'화상깊이형',source:'2026 소방전술3(구급) 255~265쪽',
 q:'2도와 3도 화상에 대한 설명으로 가장 적절한 것은?',
 choices:['2도는 수포·축축한 피부와 심한 통증이 나타날 수 있고, 3도는 건조하거나 가죽 같은 피부와 통증 감소가 나타날 수 있다','2·3도는 피부모양과 통증 차이가 거의 없다고 본다','3도는 표피 손상만으로 진피손상은 없다고 본다','2도는 건조·무통이며 수포가 없다고 본다'],a:0,
 choiceExplanations:['정답. 교재가 제시하는 깊이에 따른 대표 피부소견과 통증 차이다.','손상 깊이에 따라 임상소견이 달라질 수 있다.','3도 화상은 대부분의 피부조직이 손상될 수 있다.','2도 화상에서 수포는 대표적인 소견 중 하나다.']
},
{
 id:'119-verems3-stroke-tia-01',grade:'B',subject:'ems',scopeId:'E17',conceptId:'E17-C04',difficulty:'high',type:'뇌졸중함정형',source:'2026 소방전술3(구급) 311~314쪽',
 q:'한쪽 팔의 힘이 빠지고 말이 어눌했다가 잠시 후 호전된 환자에 대한 판단으로 가장 적절한 것은?',
 choices:['증상이 호전돼도 뇌졸중 가능성을 무시하지 말고 발병·마지막 정상시간을 확인해 신속히 이송한다','증상이 좋아졌으므로 평가와 이송이 필요 없다','혈당만 정상이면 뇌졸중을 완전히 배제한다','언어장애는 뇌졸중과 무관하다'],a:0,
 choiceExplanations:['정답. 일시적 호전만으로 뇌혈관 문제를 배제할 수 없어 신속한 평가와 이송이 필요하다.','증상 변화가 있어도 위험한 뇌혈관 질환 가능성이 있다.','혈당은 감별에 도움되지만 뇌졸중 자체를 배제하지 않는다.','언어장애는 대표적인 뇌졸중 징후 중 하나다.']
},
{
 id:'119-verems3-poison-route-01',grade:'B',subject:'ems',scopeId:'E18',conceptId:'E18-C01',difficulty:'mid',type:'중독노출형',source:'2026 소방전술3(구급) 315~319쪽',
 q:'독성물질이 체내로 들어오는 노출경로에 대한 설명으로 옳은 것은?',
 choices:['경구 섭취·흡입·주입·피부 또는 점막 흡수 등 여러 경로가 가능하다','중독은 반드시 입으로 먹었을 때만 발생한다','흡입과 피부노출은 중독과 무관하다','주사나 물림을 통한 노출은 고려하지 않는다'],a:0,
 choiceExplanations:['정답. 중독은 섭취뿐 아니라 흡입·주입·피부흡수 등 여러 경로로 발생할 수 있다.','경구섭취는 여러 노출경로 중 하나다.','흡입과 피부·점막 노출도 중요한 중독경로다.','주입 형태의 노출도 중독평가에서 고려해야 한다.']
},
{
 id:'119-verems3-pediatric-not-small-adult-01',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C01',difficulty:'high',type:'소아평가원칙형',source:'2026 소방전술3(구급) 365~366쪽',
 q:'소아 환자를 “작은 성인”으로만 보면 위험한 이유로 가장 적절한 것은?',
 choices:['기도·호흡·순환의 해부생리와 발달 차이 때문에 보상과 악화 양상이 성인과 다를 수 있기 때문이다','소아는 어떤 응급상황에서도 악화되지 않기 때문이다','소아는 장비 크기와 처치방법을 성인과 완전히 동일하게 적용해야 하기 때문이다','소아에서는 호흡평가가 필요 없기 때문이다'],a:0,
 choiceExplanations:['정답. 소아는 해부생리·발달 차이를 고려한 별도 평가와 장비선택이 필요하다.','소아도 빠르게 중증으로 악화될 수 있다.','장비와 처치는 연령·크기에 맞춰 조정해야 한다.','소아에서 호흡평가는 특히 중요하다.']
},
{
 id:'119-verems3-pediatric-airway-edema-01',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C04',difficulty:'high',type:'소아기도특성형',source:'2026 소방전술3(구급) 368~373쪽',
 q:'소아 기도에서 작은 부종이나 분비물도 큰 문제가 될 수 있는 이유로 가장 적절한 것은?',
 choices:['기도가 상대적으로 좁아 작은 변화도 기도저항을 크게 증가시킬 수 있기 때문이다','소아 기도는 성인보다 항상 매우 넓기 때문이다','혀가 상대적으로 작아 폐쇄위험이 없기 때문이다','소아 기도는 부종의 영향을 받지 않기 때문이다'],a:0,
 choiceExplanations:['정답. 좁은 소아 기도에서는 작은 부종이나 분비물도 저항을 크게 증가시킬 수 있다.','소아 기도는 상대적으로 좁다.','혀가 상대적으로 커 기도폐쇄 위험을 높일 수 있다.','부종은 소아 기도에 큰 영향을 줄 수 있다.']
},
{
 id:'119-verems3-bls-pulse-check-01',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C01',difficulty:'mid',type:'BLS수치형',source:'2026 소방전술3(구급) 404~407쪽',
 q:'의료제공자가 무반응 성인의 호흡과 목동맥 맥박을 확인할 때 교재가 제시하는 시간은?',
 choices:['5~10초 이내','30~60초','2분 이상','시간 제한 없이 충분히 오래'],a:0,
 choiceExplanations:['정답. 호흡과 맥박 확인 때문에 가슴압박 시작이 지연되지 않도록 5~10초 이내에 확인한다.','이렇게 오래 확인하면 소생술 시작이 지연된다.','2분은 맥박확인 시간 기준이 아니다.','신속한 심정지 인지가 중요해 무제한 확인하지 않는다.']
},
{
 id:'119-verems3-rescue-breath-01',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C02',difficulty:'mid',type:'인공호흡수치형',source:'2026 소방전술3(구급) 408~410쪽',
 q:'성인 기본소생술의 인공호흡 방법에 대한 교재 설명으로 가장 적절한 것은?',
 choices:['1회 약 1초씩 총 2회, 가슴상승이 보일 정도로 시행한다','1회 10초씩 10회를 빠르게 시행한다','가슴상승 여부는 확인하지 않는다','과환기를 위해 가능한 많은 공기를 넣는다'],a:0,
 choiceExplanations:['정답. 기본소생술 인공호흡은 약 1초 동안 가슴상승이 보일 정도로 시행하며 과환기를 피한다.','지나치게 긴·많은 환기는 권장되지 않는다.','가슴상승은 환기 효과를 확인하는 중요한 기준이다.','과도한 환기는 피해야 한다.']
},
{
 id:'119-verems3-cpr-cycle-01',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C04',difficulty:'high',type:'CPR주기형',source:'2026 소방전술3(구급) 413~414쪽',
 q:'성인 CPR의 압박·환기와 구조자 교대 원칙으로 옳은 것은?',
 choices:['30:2를 시행하고 약 2분 또는 5주기마다 압박자 교대를 고려한다','15:2를 모든 성인에게 적용하고 30분마다 교대한다','구조자 수에 따라 성인 압박·환기 비율이 반드시 달라진다','가슴압박은 10초 이상 자주 중단한다'],a:0,
 choiceExplanations:['정답. 성인은 구조자 수와 관계없이 30:2를 사용하고 약 2분마다 교대해 압박 품질 저하를 줄인다.','성인 기본 비율과 교대주기가 다르다.','성인의 기본 30:2 비율은 구조자 수로 바뀌지 않는다.','불필요한 가슴압박 중단을 최소화해야 한다.']
},
{
 id:'119-verems3-fbao-mild-sign-01',grade:'B',subject:'ems',scopeId:'E24',conceptId:'E24-C05',difficulty:'high',type:'기도폐쇄구분형',source:'2026 소방전술3(구급) 417~423쪽',
 q:'중증 기도폐쇄보다 경미한 기도 이물폐쇄에 더 가까운 소견은?',
 choices:['의식이 있고 환기가 양호하며 힘 있는 자발기침이 가능하다','기침을 전혀 못하고 환기가 되지 않는다','의식이 급격히 저하되고 청색증이 진행한다','호흡정지로 반응이 없다'],a:0,
 choiceExplanations:['정답. 효과적인 기침과 양호한 환기는 경미한 폐쇄를 시사한다.','기침 불가능과 환기부전은 중증 폐쇄에 더 가깝다.','의식저하·청색증은 심한 기도폐쇄의 위험신호다.','호흡정지는 생명위협 상태로 즉각적인 처치가 필요하다.']
}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('VERIFIED_EMS_BATCH3_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('VERIFIED_EMS_BATCH3_DUP_TEXT '+q.id+' :: '+q.q);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_EMS_BATCH3_CHOICES '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_EMS_BATCH3_EXPLANATIONS '+q.id);
 if(!/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/.test(q.source))throw Error('VERIFIED_EMS_BATCH3_PAGE '+q.id);
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedEMSBatch3119={version:'119-verified-ems-batch3-v1',planned:Q.length,added:Q.length,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();