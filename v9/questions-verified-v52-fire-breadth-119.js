'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const Q=[
{
 id:'119-v52-firebreadth-001',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C05',difficulty:'mid',type:'비교·구분형',
 source:'2026 소방법령2 174~197쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'의용소방대에 대한 설명으로 가장 적절한 것은?',
 choices:['소방공무원 내부 직제의 한 부서이다','지역 주민의 자율적 참여를 바탕으로 소방업무와 재난대응을 지원한다','재난 발생 시에만 한시적으로 조직되는 국가기관이다','소방시설 설치허가를 전담하는 행정기관이다'],a:1,
 choiceExplanations:['의용소방대는 소방공무원 내부 직제와 동일한 조직이 아니다.','정답. 지역 주민의 자율적 참여를 바탕으로 소방활동과 재난대응을 지원하는 조직으로 본다.','상시 법적 설치·운영 근거를 가진 지원조직이지 재난 때만 임시로 만드는 국가기관이 아니다.','소방시설 설치허가 전담기관으로 보는 설명은 맞지 않는다.']
},
{
 id:'119-v52-firebreadth-002',grade:'B',subject:'fire',scopeId:'F02',conceptId:'F02-C02',difficulty:'high',type:'비교·구분형',
 source:'2026 소방법령5 509~523쪽 · 재난 및 안전관리 기본법 제3조 · 시행령 제3조의2',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'재난관리책임기관과 재난관리주관기관의 구분으로 옳은 것은?',
 choices:['두 용어는 법상 완전히 같은 의미이다','주관기관은 지방자치단체와 모든 공공기관을 포괄하는 더 넓은 범주이다','책임기관은 재난관리업무를 수행하는 넓은 기관 범주이고, 주관기관은 특정 재난·사고 유형을 주관하는 관계 중앙행정기관이다','주관기관은 모든 재난에 대해 하나의 기관으로 고정된다'],a:2,
 choiceExplanations:['두 개념은 포함범위와 역할이 다르다.','넓은 기관 범주는 재난관리책임기관 쪽이다.','정답. 책임기관은 넓은 수행기관 범주, 주관기관은 특정 재난·사고 유형을 주관하는 관계 중앙행정기관이다.','주관기관은 재난·사고 유형별로 달라질 수 있다.']
},
{
 id:'119-v52-firebreadth-003',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C01',difficulty:'mid',type:'분류형',
 source:'2026 예방실무1 17쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소방시설의 기능별 분류 연결로 옳은 것은?',
 choices:['자동화재탐지설비-소화용수설비','유도등-소화활동설비','연결송수관설비-경보설비','소화수조-소화용수설비'],a:3,
 choiceExplanations:['자동화재탐지설비는 경보설비에 해당한다.','유도등은 피난구조설비에 해당한다.','연결송수관설비는 소화활동설비에 해당한다.','정답. 소화수조는 화재진압에 필요한 물을 확보하는 소화용수설비로 본다.']
},
{
 id:'119-v52-firebreadth-004',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C02',difficulty:'mid',type:'상황판단형',
 source:'2026 예방실무1 207쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소화기를 사용하던 중 연기와 열이 빠르게 증가하고 퇴로 확보가 어려워지고 있다. 가장 적절한 대응은?',
 choices:['화점에 더 가까이 접근해 끝까지 방사한다','소화기 사용을 중지하고 안전하게 피난한 뒤 신고·지원요청으로 전환한다','출입문을 잠그고 혼자 계속 소화한다','소화약제 종류와 관계없이 물을 추가로 뿌린다'],a:1,
 choiceExplanations:['퇴로가 불안정해지는 상황에서 무리한 접근은 위험하다.','정답. 초기소화 범위를 벗어나면 피난과 신고·지원요청으로 전환해야 한다.','고립 위험을 키울 수 있는 행동이다.','화재 종류와 약제 적응성을 확인하지 않은 임의 주수는 적절하지 않다.']
},
{
 id:'119-v52-firebreadth-005',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C03',difficulty:'mid',type:'순서·절차형',
 source:'2026 예방실무1 247쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'옥내소화전설비의 물 흐름을 개념적으로 올바르게 배열한 것은?',
 choices:['수원·펌프 → 배관 → 방수구 → 호스·관창 → 화점 방수','감지기 → 수신기 → 헤드 개방 → 호스·관창','포원액 → 감지기 → 소화전함 → 방수구','수신기 → 소화수조 → 유도등 → 관창'],a:0,
 choiceExplanations:['정답. 수원과 가압송수장치의 물이 배관과 방수구를 거쳐 호스·관창으로 방수된다.','자동화재탐지와 스프링클러 개념이 섞여 있다.','옥내소화전의 기본 계통과 맞지 않는다.','경보·피난설비가 섞인 잘못된 흐름이다.']
},
{
 id:'119-v52-firebreadth-006',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C04',difficulty:'mid',type:'비교·구분형',
 source:'2026 예방실무1 273쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'옥내소화전과 비교한 옥외소화전의 특징으로 가장 적절한 것은?',
 choices:['건물 외부에서 호스를 연결해 방수할 수 있는 방수거점을 제공한다','화재열에 의해 폐쇄형 헤드가 자동 개방된다','음성으로 피난정보를 전달하는 것이 주기능이다','화재신호를 수신기로 보내 경보만 발생시킨다'],a:0,
 choiceExplanations:['정답. 옥외소화전은 건축물 외부에서 소방대나 관계자가 호스를 연결해 방수하는 설비다.','스프링클러설비의 설명이다.','비상방송설비의 설명이다.','자동화재탐지설비의 설명이다.']
},
{
 id:'119-v52-firebreadth-007',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C07',difficulty:'mid',type:'원리·구조형',
 source:'2026 예방실무1 328쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'물분무·미분무소화설비에서 물방울을 작게 하는 효과와 가장 관련이 큰 것은?',
 choices:['단위 질량당 표면적이 커져 열교환과 증발이 빨라질 수 있다','물의 비열이 0이 되어 냉각효과가 사라진다','산소를 생성해 연소를 촉진한다','물방울이 작아질수록 모든 화재에 동일하게 적용할 수 있다'],a:0,
 choiceExplanations:['정답. 미세한 물방울은 표면적 증가로 열흡수와 증발이 빨라질 수 있다.','물의 비열이 0이 되는 것은 아니다.','산소를 생성해 연소를 촉진하는 원리가 아니다.','대상 화재와 전기·유류 등 특성을 고려해야 하므로 모든 화재에 동일 적용되는 것은 아니다.']
},
{
 id:'119-v52-firebreadth-008',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C09',difficulty:'high',type:'안전·운용형',
 source:'2026 예방실무1 432쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'가스계 소화설비의 운용에서 특히 강조해야 할 안전원칙은?',
 choices:['방출 전 방호구역의 사람을 안전하게 대피시키고 인명안전을 확인한다','사람이 있어도 경보 없이 즉시 방출한다','소화농도 형성은 중요하지 않으므로 문을 계속 개방한다','방출 후 재진입 안전과 환기는 고려하지 않는다'],a:0,
 choiceExplanations:['정답. 가스계 설비는 소화농도 형성과 함께 방출 전 경보·대피 등 인명안전이 매우 중요하다.','인명위험을 키우는 잘못된 운용이다.','방호공간의 농도 유지가 성능에 영향을 줄 수 있다.','방출 후 환기와 재진입 안전도 중요하다.']
},
{
 id:'119-v52-firebreadth-009',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C10',difficulty:'mid',type:'약제·적응형',
 source:'2026 예방실무1 415쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'분말소화설비에 대한 설명으로 옳은 것은?',
 choices:['모든 종류의 분말은 A·B·C급 화재에 동일하게 적응한다','분말은 연쇄반응 억제 등의 효과를 이용하며 종류에 따라 적응화재가 달라진다','분말은 오직 냉각작용만으로 소화한다','제3종 분말은 전기화재에 절대 사용할 수 없다'],a:1,
 choiceExplanations:['분말 종류에 따라 적응화재가 다르다.','정답. 분말은 연쇄반응 억제 등의 효과를 이용하고 종별로 적응화재가 구분된다.','분말소화의 핵심을 냉각 하나로만 설명하는 것은 맞지 않는다.','제3종 분말은 ABC 화재에 대응하는 대표 약제로 연결해 이해한다.']
},
{
 id:'119-v52-firebreadth-010',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C11',difficulty:'mid',type:'작동흐름형',
 source:'2026 예방실무1 23쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'자동화재탐지설비의 기본 작동 흐름으로 가장 적절한 것은?',
 choices:['감지기 → 수신기 → 경보','소화수조 → 관창 → 감지기','유도등 → 방수구 → 수신기','포원액 → 헤드 → 비상방송'],a:0,
 choiceExplanations:['정답. 화재징후를 감지한 신호가 수신기로 전달되고 경보로 이어지는 흐름을 잡는다.','소화용수와 옥내소화전 구성요소가 섞여 있다.','피난·소화·경보 설비가 뒤섞인 흐름이다.','포소화와 스프링클러·경보설비가 혼합된 설명이다.']
},
{
 id:'119-v52-firebreadth-011',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C12',difficulty:'mid',type:'비교·구분형',
 source:'2026 예방실무1 18쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'비상방송설비와 자동화재속보설비의 기능 구분으로 옳은 것은?',
 choices:['비상방송은 음성으로 피난정보를 전달하고, 자동화재속보는 화재신호를 외부에 자동 통보한다','비상방송은 소화약제를 방사하고, 자동화재속보는 피난기구를 작동한다','둘 다 직접 화재를 소화하는 설비이다','자동화재속보는 오직 누전만 감지하고 외부 통보 기능은 없다'],a:0,
 choiceExplanations:['정답. 비상방송은 재실자에게 음성정보를 전달하고 자동화재속보는 화재신호를 외부에 자동 통보한다.','두 설비의 실제 기능과 맞지 않는다.','둘 다 직접 소화설비가 아니다.','자동화재속보의 핵심은 화재신호의 외부 자동 통보다.']
},
{
 id:'119-v52-firebreadth-012',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C13',difficulty:'mid',type:'기능매칭형',
 source:'2026 예방실무1 465쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'피난구조설비의 기능 연결로 옳은 것은?',
 choices:['유도등·유도표지-출구와 피난방향 안내','비상조명-화재를 직접 감지해 수신기로 신호 전송','피난기구-소화약제를 자동 방사','인명구조기구-소방용수 저장'],a:0,
 choiceExplanations:['정답. 유도등·유도표지는 출구와 피난방향을 안내한다.','비상조명의 주기능은 정전 시 시야 확보이며 감지·수신 기능이 아니다.','피난기구는 실제 탈출·하강 등을 돕는 장비이지 소화약제를 방사하지 않는다.','인명구조기구는 구조대상 보호·구조 지원과 관련되며 소방용수 저장설비가 아니다.']
},
{
 id:'119-v52-firebreadth-013',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C14',difficulty:'high',type:'비교·구분형',
 source:'2026 예방실무1 201쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소화용수설비와 소화설비를 구분한 설명으로 가장 적절한 것은?',
 choices:['소화용수설비는 소방대가 쓸 물을 확보·공급하고, 소화설비는 물·약제를 화점에 방출한다','소화용수설비는 감지기 신호를 수신해 재실자에게 화재경보만 전달한다','소화설비는 소방용수를 저장·공급할 뿐 화점에는 물이나 약제를 방출하지 않는다','두 설비는 목적과 기능이 같아 법·교재상 별도 분류할 필요가 없다'],a:0,
 choiceExplanations:['정답. 물을 확보·공급하는 기능과 직접 화점에 물·약제를 방출하는 기능을 구분하는 것이 핵심이다.','화재신호의 감지·경보는 경보설비의 기능과 혼동한 설명이다.','소화설비는 저장·공급에 그치지 않고 화점에 물이나 약제를 방출해 직접 소화한다.','소화용수설비와 소화설비는 목적과 기능이 달라 별도 기능군으로 구분한다.']
},
{
 id:'119-v52-firebreadth-014',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C15',difficulty:'high',type:'기능매칭형',
 source:'2026 예방실무1 167·174·433·482쪽',pageVerified:true,reviewStatus:'source-reviewed',pastExamClaim:false,
 q:'소화활동설비의 기능 연결로 옳지 않은 것은?',
 choices:['연결송수관-소방대의 고층·원거리 송수 지원','제연설비-연기 이동 제어','비상콘센트-현장 장비 전원 지원','무선통신보조설비-화재열에 의해 헤드를 자동 개방해 방수'],a:3,
 choiceExplanations:['연결송수관은 소방대의 송수를 지원하는 설비다.','제연설비는 연기 이동을 제어해 피난·진입환경을 개선한다.','비상콘센트는 소방활동 장비의 전원 지원과 연결된다.','정답. 무선통신보조설비는 건물 내 통신을 지원하는 설비이지 스프링클러처럼 자동 방수하지 않는다.']
}
];
const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('V52_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('V52_DUP_TEXT '+q.id);
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('V52_CHOICES '+q.id);
 if(!Number.isInteger(q.a)||q.a<0||q.a>3)throw Error('V52_ANSWER '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('V52_EXPLANATIONS '+q.id);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedV52FireBreadth119={version:'119-v52-fire-breadth-v1',added:Q.length,ids:Q.map(q=>q.id),policy:'manual source-reviewed third-question breadth; not past-exam claims'};
})();