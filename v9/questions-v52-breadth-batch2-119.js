'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const B=[
{
 id:'119-v52-b2-firehistory-01',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'연혁순서형',
 source:'소방청 공식 연혁 https://nfa.go.kr/nfa/introduce/status/history · 소방청 국가직 전환 보도자료 https://www.nfa.go.kr/nfa/news/pressrelease/press/?cntId=772&mode=view',
 pageVerified:false,reviewStatus:'official-web-reviewed',pastExamClaim:false,
 q:'최근 소방행정 조직 변천의 순서로 옳은 것은?',
 choices:['2004 소방방재청 → 2014 중앙소방본부 → 2017 소방청 → 2020 소방공무원 국가직 전환','2014 소방방재청 → 2004 중앙소방본부 → 2020 소방청 → 2017 국가직 전환','2017 소방방재청 → 2020 중앙소방본부 → 2004 소방청 → 2014 국가직 전환','2020 소방방재청 → 2017 중앙소방본부 → 2014 소방청 → 2004 국가직 전환'],a:0,
 choiceExplanations:['정답. 소방방재청 2004, 국민안전처 중앙소방본부 2014, 소방청 2017, 소방공무원 국가직 전환 2020 순서다.','연도가 서로 뒤바뀌어 있다.','소방청 출범과 국가직 전환의 순서를 포함해 맞지 않는다.','전체 연혁의 시간 순서가 역전되어 있다.']
},
{
 id:'119-v52-b2-firedef-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C01',difficulty:'mid',type:'개념판별형',
 source:'2026 소방전술1(화재1) 3~7쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'화재의 개념에 포함되는 범위를 판단한 설명으로 옳지 않은 것은?',
 choices:['소화할 필요가 있는 연소현상은 화재의 범주가 될 수 있다','연소나 화학적 폭발과 무관한 단순 물리적 파열도 그 자체로 화재에 포함된다','사람의 의도에 반해 발생하거나 확대된 화학적 폭발현상은 화재 범주와 연결될 수 있다','고의 또는 과실로 발생한 연소라도 소화할 필요가 있다면 화재 개념과 연결된다'],a:1,
 choiceExplanations:['교재의 화재 개념과 부합한다.','정답. 단순한 물리적 파열 자체를 연소·화학적 폭발과 같은 화재 개념으로 보지 않는다.','교재가 설명하는 화재 개념 범위에 들어갈 수 있다.','발생 원인만으로 화재 여부를 배제하지 않으며 소화 필요성이 중요하다.']
},
{
 id:'119-v52-b2-firestage-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C04',difficulty:'mid',type:'진행단계형',
 source:'2026 소방전술1(화재1) 18~21쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'구획실 화재 진행에서 성장기 다음 급격한 전이를 거쳐 연소가 가장 활발한 단계로 이어지는 연결은?',
 choices:['성장기 → 쇠퇴기','성장기 → 발화기','성장기 → 플래시오버 → 최성기','성장기 → 소화완료 → 최성기'],a:2,
 choiceExplanations:['쇠퇴기는 최성기 이후의 화재감소 단계로 본다.','발화기는 성장기보다 앞선 단계다.','정답. 구획실 화재는 성장기에서 플래시오버를 거쳐 최성기로 급격히 전이할 수 있다.','소화완료 뒤 최성기로 진행하는 순서는 성립하지 않는다.']
},
{
 id:'119-v52-b2-poolfire-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C16',difficulty:'high',type:'위험요인형',
 source:'2026 소방전술1 PDF 453쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'풀파이어의 규모와 복사열 영향이 커질 가능성과 가장 직접적으로 연결되는 것은?',
 choices:['감지기 종류만 증가하는 것','소방대 무전 채널 수만 늘어나는 것','용기 내부압력만 증가하고 액체 누출이 없는 것','누출이 계속되면서 바닥·방유제에 고이는 액체의 연소면적이 커지는 것'],a:3,
 choiceExplanations:['감지기 종류 자체가 풀파이어 연소면적을 결정하지 않는다.','무전 채널 수는 풀파이어의 열방출 크기와 직접 관련이 없다.','누출·고임이 없는 단순 내부압력 증가는 풀파이어의 핵심조건이 아니다.','정답. 누출 지속과 고인 액체의 면적은 액면 증기연소 면적과 복사열 영향 확대에 직접 연결된다.']
},
{
 id:'119-v52-b2-agentcondition-01',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C02',difficulty:'mid',type:'약제선정형',
 source:'2026 소방전술1(화재2) 186~188쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'좋은 소화약제의 조건을 판단할 때 함께 고려해야 할 항목으로 가장 적절한 것은?',
 choices:['소화성능뿐 아니라 저장안정성·인체안전·환경영향과 취급성을 함께 본다','소화력이 강하면 인체독성과 환경영향은 무시한다','가격만 낮으면 저장 중 안정성은 중요하지 않다','약제의 소화작용보다 용기 색상만 본다'],a:0,
 choiceExplanations:['정답. 소화성능과 함께 저장성·안전성·환경성·경제성·취급성을 종합해야 한다.','독성과 환경영향은 중요한 선정조건이다.','저장 안정성 역시 실제 운용에서 중요한 조건이다.','용기 외관만으로 약제 적합성을 판단하지 않는다.']
},
{
 id:'119-v52-b2-inertgas-01',grade:'B',subject:'fire',scopeId:'F04',conceptId:'F04-C07',difficulty:'high',type:'조성매칭형',
 source:'2026 소방전술1(화재2) 229~239쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'불활성기체계 소화약제의 조성 연결로 옳은 것은?',
 choices:['IG-55 = 질소 52% + 아르곤 40% + 이산화탄소 8%','IG-541 = 질소 52% + 아르곤 40% + 이산화탄소 8%','IG-100 = 아르곤 100%','IG-01 = 질소 100%'],a:1,
 choiceExplanations:['이 조성은 IG-541에 해당한다.','정답. IG-541은 질소 52%, 아르곤 40%, 이산화탄소 8% 조성으로 정리한다.','IG-100은 질소 계열이다.','IG-01은 아르곤 계열이다.']
},
{
 id:'119-v52-b2-aed-01',grade:'B',subject:'ems',scopeId:'E07',conceptId:'E07-C03',difficulty:'mid',type:'장비운용형',
 source:'2026 소방전술3(구급) 115~116쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'AED가 충격을 권고해 제세동을 시행한 직후의 처치로 가장 적절한 것은?',
 choices:['환자를 10분간 관찰만 한다','다음 분석 전까지 모든 처치를 중단한다','즉시 가슴압박을 포함한 심폐소생술을 재개한다','환자를 일으켜 보행 가능 여부부터 확인한다'],a:2,
 choiceExplanations:['충격 뒤 장시간 관찰만 하면 가슴압박 중단이 길어진다.','필요한 심폐소생술을 중단하는 것은 적절하지 않다.','정답. 제세동 후에는 지체하지 말고 가슴압박을 포함한 심폐소생술을 재개한다.','심정지 상황에서 보행평가가 우선이 아니다.']
},
{
 id:'119-v52-b2-oxygen-01',grade:'B',subject:'ems',scopeId:'E09',conceptId:'E09-C07',difficulty:'high',type:'재평가형',
 source:'2026 소방전술3(구급) 181~188쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'산소치료 중 환자 상태를 평가하는 원칙으로 가장 적절한 것은?',
 choices:['산소를 시작하면 이후 호흡상태는 보지 않아도 된다','처음 측정한 산소포화도가 정상이라면 의식과 호흡노력 변화는 무시한다','산소통 잔량만 확인하면 환자 재평가는 필요 없다','산소투여 뒤에도 호흡수·호흡노력·의식·산소화 변화를 반복 확인한다'],a:3,
 choiceExplanations:['산소치료 후에도 환자 반응을 계속 확인해야 한다.','단일 수치만으로 환자의 전체 호흡상태를 판단할 수 없다.','장비 상태와 함께 환자 상태를 반복평가해야 한다.','정답. 산소치료의 효과와 악화를 확인하려면 임상상태와 산소화를 반복적으로 재평가한다.']
},
{
 id:'119-v52-b2-pedanatomy-01',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C02',difficulty:'mid',type:'소아해부형',
 source:'2026 소방전술3(구급) 365~368쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소아의 기도 특성을 고려한 판단으로 가장 적절한 것은?',
 choices:['상대적으로 큰 혀와 좁은 기도 때문에 작은 부종이나 분비물도 기도저항을 크게 높일 수 있다','소아의 기도는 성인보다 항상 넓어 폐쇄 위험이 낮다','기도가 좁아도 부종은 기도저항에 거의 영향을 주지 않는다','성인과 해부학적 차이가 없으므로 같은 크기의 기도기구를 그대로 사용한다'],a:0,
 choiceExplanations:['정답. 소아는 상대적으로 큰 혀와 좁은 기도 특성 때문에 작은 변화에도 폐쇄 위험이 커질 수 있다.','소아 기도는 상대적으로 좁아 폐쇄에 취약하다.','좁은 기도에서는 작은 부종도 기도저항을 크게 증가시킬 수 있다.','연령·체격에 맞는 장비와 기도관리가 필요하다.']
},
{
 id:'119-v52-b2-pedeval-01',grade:'B',subject:'ems',scopeId:'E21',conceptId:'E21-C05',difficulty:'mid',type:'소아평가형',
 source:'2026 소방전술3(구급) 374~376쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소아 환자의 말초순환 상태를 평가할 때 교재와 가장 잘 맞는 접근은?',
 choices:['호흡음만으로 순환상태를 확정한다','특히 어린 소아에서는 모세혈관 재충혈과 피부상태 등을 함께 확인한다','동공반응만 확인하면 말초순환 평가는 끝난다','성인용 혈압 한 번만으로 순환상태를 완전히 배제한다'],a:1,
 choiceExplanations:['호흡음은 호흡평가 자료이지 말초순환을 단독으로 확정하지 않는다.','정답. 어린 소아에서는 모세혈관 재충혈과 피부상태 등 순환징후를 함께 본다.','동공반응만으로 말초순환을 평가할 수 없다.','한 번의 혈압 수치만으로 전체 순환상태를 판단하지 않는다.']
},
{
 id:'119-v52-b2-hepatobiliary-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C01',difficulty:'high',type:'복통감별형',
 source:'2026 소방전술3(구급) 217·223~224쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'윗배 통증 환자에서 담낭·담도 또는 췌장 문제를 고려하면서 현장에서 우선해야 할 처치 원칙은?',
 choices:['원인질환을 확정할 때까지 음식을 충분히 먹인다','통증이 있으면 활력징후 확인 없이 진통 목적의 음료를 준다','ABC와 활력징후를 평가하고 금식·안정 상태로 신속히 이송하며 쇼크 징후를 반복 확인한다','방사통이 있으면 현장에서 반드시 췌장염으로 확진한다'],a:2,
 choiceExplanations:['급성복통 환자에게 임의로 음식·음료를 주지 않는다.','원인확정보다 ABC와 활력징후 평가가 먼저다.','정답. 복통 환자는 ABC·활력징후를 확인하고 금식·안정·신속이송하며 쇼크 가능성을 본다.','방사통은 단서일 뿐 현장에서 질환을 확진하는 근거가 아니다.']
},
{
 id:'119-v52-b2-urinary-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C02',difficulty:'mid',type:'병력평가형',
 source:'2026 소방전술3(구급) 217·224·435~437쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'심한 옆구리 통증과 배뇨장애가 있는 환자의 평가에서 함께 확인할 내용으로 가장 적절한 것은?',
 choices:['눈동자 색만 확인한다','소변증상은 묻지 않고 복통 위치만 기록한다','신부전 병력이 있어도 투석 여부는 확인하지 않는다','혈뇨·배뇨통·방사통과 신부전·투석 병력을 함께 확인한다'],a:3,
 choiceExplanations:['현재 증상과 관계가 적은 정보만으로 평가할 수 없다.','배뇨장애와 혈뇨는 중요한 비뇨기계 단서다.','신부전 병력이 있으면 투석 여부까지 확인하는 것이 중요하다.','정답. 통증 양상과 소변 관련 증상, 신부전·투석 병력을 함께 확인한다.']
},
{
 id:'119-v52-b2-hematology-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C03',difficulty:'mid',type:'기능매칭형',
 source:'2026 소방전술3(구급) 66·227쪽 · 질병관리청 국가건강정보포털',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'혈액세포의 기능 연결로 옳은 것은?',
 choices:['혈소판-일차 지혈과 응고에 중요한 역할','적혈구-주된 면역기능','백혈구-산소운반의 주된 역할','혈소판-산소운반의 주된 역할'],a:0,
 choiceExplanations:['정답. 혈소판은 지혈과 응고 과정에 중요한 역할을 한다.','적혈구의 대표 기능은 산소운반이다.','백혈구는 면역기능과 연결된다.','산소운반은 주로 적혈구의 기능이다.']
},
{
 id:'119-v52-b2-ent-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C04',difficulty:'high',type:'응급처치형',
 source:'2026 소방전술3(구급) 105·435쪽 · 질병관리청 국가건강정보포털',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'눈에 화학물질이 들어간 환자의 초기 처치로 가장 적절한 것은?',
 choices:['정확한 물질명이 확인될 때까지 아무 처치도 하지 않는다','지체하지 말고 생리식염수 또는 깨끗한 물로 충분히 세척한다','눈을 강하게 비벼 물질을 제거한다','중화제를 찾을 때까지 세척을 미룬다'],a:1,
 choiceExplanations:['화학적 눈 손상은 세척 지연이 추가 손상을 키울 수 있다.','정답. 생리식염수나 깨끗한 물로 즉시 충분히 세척하는 것이 우선이다.','눈을 비비면 각막 등 추가 손상을 만들 수 있다.','중화제를 찾느라 세척을 지연하지 않는다.']
},
{
 id:'119-v52-b2-msk-01',grade:'B',subject:'ems',scopeId:'E25',conceptId:'E25-C05',difficulty:'mid',type:'감별형',
 source:'2026 소방전술3(구급) 390~394쪽 · 질병관리청 국가건강정보포털',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'외상 없이 갑자기 심한 관절통과 부종이 생긴 환자를 평가하는 원칙으로 가장 적절한 것은?',
 choices:['퇴행성·염증성·감염성 가능성을 나누어 보고 발열·전신상태·기능저하를 함께 확인한다','외상이 없으면 모든 관절통을 단순 근육통으로 처리한다','발열이 있어도 감염 가능성은 고려하지 않는다','통증이 심하면 활력징후 확인 없이 현장에서 통풍으로 확진한다'],a:0,
 choiceExplanations:['정답. 비외상성 근골격계 응급은 퇴행성·염증성·감염성 가능성과 전신상태를 함께 평가한다.','외상이 없어도 다양한 관절·근골격계 응급이 있을 수 있다.','발열·전신쇠약은 감염성 가능성을 높이는 단서가 될 수 있다.','구급현장에서는 진단 확정보다 활력징후와 중증도 평가가 우선이다.']
}
];

const P=[
{
 id:'119-v52-b2-orgtheory-p01',grade:'P',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'low',type:'기초이론연습형',
 source:'2026 소방공무원 채용시험 소방학개론 공식 출제범위 https://js119.gwd.go.kr/egf/bp/board/article/download?fileSeq=1245182 · 조직관리 기초이론 연습용',
 pageVerified:false,reviewStatus:'scope-reviewed-practice',pastExamClaim:false,
 q:'조직관리에서 명령통일 원리를 가장 잘 설명한 것은?',
 choices:['한 구성원이 원칙적으로 한 직속상관의 지휘·보고 계통을 따르도록 한다','한 관리자가 감독할 수 있는 부하 수를 정하는 원리다','업무를 기능별로 나누는 원리다','분화된 부서를 공통목표에 맞게 연결하는 원리다'],a:0,
 choiceExplanations:['정답. 명령통일은 지휘·보고 계통을 명확히 해 상충되는 지시를 줄이는 원리다.','통솔범위에 가까운 설명이다.','분업·전문화 원리에 가깝다.','조정·통합 원리에 가깝다.']
},
{
 id:'119-v52-b2-orgtheory-p02',grade:'P',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'기초이론연습형',
 source:'2026 소방공무원 채용시험 소방학개론 공식 출제범위 https://js119.gwd.go.kr/egf/bp/board/article/download?fileSeq=1245182 · 조직관리 기초이론 연습용',
 pageVerified:false,reviewStatus:'scope-reviewed-practice',pastExamClaim:false,
 q:'한 관리자가 효과적으로 직접 감독할 수 있는 인원이나 업무의 범위를 뜻하는 조직원리는?',
 choices:['계층제','통솔범위','명령통일','조정·통합'],a:1,
 choiceExplanations:['계층제는 상하 권한·책임과 직무의 단계를 다룬다.','정답. 통솔범위는 관리자가 직접 감독할 수 있는 적정 범위를 뜻한다.','명령통일은 지휘·보고 계통의 일관성을 다룬다.','조정·통합은 분화된 활동을 공통목표로 연결하는 원리다.']
},
{
 id:'119-v52-b2-orgtheory-p03',grade:'P',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'기초이론연습형',
 source:'2026 소방공무원 채용시험 소방학개론 공식 출제범위 https://js119.gwd.go.kr/egf/bp/board/article/download?fileSeq=1245182 · 조직관리 기초이론 연습용',
 pageVerified:false,reviewStatus:'scope-reviewed-practice',pastExamClaim:false,
 q:'분업·전문화가 강화된 조직에서 조정·통합이 필요한 이유로 가장 적절한 것은?',
 choices:['모든 부서의 전문성을 없애기 위해','상하 계층을 완전히 없애기 위해','분화된 업무와 부서의 활동을 공통 목표에 맞게 연결하고 충돌을 줄이기 위해','각 구성원이 여러 상관의 상충된 명령을 동시에 받게 하기 위해'],a:2,
 choiceExplanations:['조정은 전문성을 없애는 목적이 아니다.','계층을 없애는 원리와 동일하지 않다.','정답. 분화된 기능을 공통 목표에 맞게 연결하고 중복·충돌을 줄이는 것이 조정의 핵심이다.','상충된 복수명령은 오히려 명령통일 원리와 반대되는 상황이다.']
}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of [...B,...P]){
 if(ids.has(q.id))throw Error('V52_B2_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('V52_B2_DUP_TEXT '+q.id);
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('V52_B2_CHOICES '+q.id);
 if(!Number.isInteger(q.a)||q.a<0||q.a>3)throw Error('V52_B2_ANSWER '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('V52_B2_EXPLANATIONS '+q.id);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedV52BreadthBatch2={version:'119-v52-breadth-batch2-v1',verifiedAdded:B.length,practiceAdded:P.length,verifiedIds:B.map(q=>q.id),practiceIds:P.map(q=>q.id),policy:'15 source-reviewed B questions plus 3 explicitly P-grade scope-only organization-theory drills; no false promotion'};
})();