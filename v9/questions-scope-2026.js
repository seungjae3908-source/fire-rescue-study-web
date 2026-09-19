'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;
const P=[
{id:'p-f05-c01',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C01',q:'위험물 분류를 공부할 때 가장 먼저 연결해야 할 것은?',choices:['류별 공통 위험성','건물 높이','환자 수','무선통신 채널'],a:0,ex:'위험물은 제1류~제6류의 공통 위험성과 물질별 성상을 먼저 구분해야 소화원칙을 연결하기 쉽습니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f05-c02',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C02',q:'제1류 위험물의 대표적 공통 성질은?',choices:['산화성고체','가연성고체','인화성액체','산화성액체'],a:0,ex:'제1류는 산화성고체이며 다른 물질의 연소를 촉진할 수 있다는 점이 핵심입니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c03',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C03',q:'제2류 위험물의 대표적 공통 성질은?',choices:['산화성액체','가연성고체','인화성액체','자기반응성물질'],a:1,ex:'제2류는 가연성고체로 분류됩니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c04',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C04',q:'제3류 위험물 대응에서 특히 확인해야 할 반응성은?',choices:['공기·물과의 반응','빛의 굴절','전파의 반사','소음의 크기'],a:0,ex:'제3류에는 자연발화성 또는 금수성 물질이 포함되어 공기·물과의 반응성을 확인해야 합니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c05',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C05',q:'제4류 위험물 화재를 이해할 때 핵심이 되는 것은?',choices:['액면에서 발생한 증기와 점화','고체의 결정구조만','방송설비의 음량','피난계단의 폭'],a:0,ex:'제4류는 인화성액체로, 액면에서 발생한 증기가 공기와 혼합되어 점화되는 구조가 핵심입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f05-c06',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C06',q:'제5류 위험물의 핵심 위험 특성으로 가장 적절한 것은?',choices:['자기반응성','완전 불연성','항상 수용성','무조건 비폭발성'],a:0,ex:'제5류는 자기반응성물질로 급격한 분해반응 가능성을 주의합니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c07',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C07',q:'제6류 위험물의 대표적 공통 성질은?',choices:['가연성고체','산화성액체','인화성고체','금수성가스'],a:1,ex:'제6류는 산화성액체이며 다른 가연물의 연소를 촉진할 수 있습니다.',source:'국가위험물정보 · 페이지앵커 진행중'},
{id:'p-f05-c08',grade:'P',subject:'fire',scopeId:'F05',conceptId:'F05-C08',q:'위험물 화재의 소화방법을 정하기 전에 가장 먼저 해야 할 것은?',choices:['물질과 용기·누출상태 확인','무조건 물 방사','모든 전원 차단만 시행','연기 색만으로 판단'],a:0,ex:'위험물은 류와 품목에 따라 반응성이 달라 물질 식별과 상태 확인이 우선입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},

{id:'p-f06-c01',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C01',q:'화재조사의 중요한 목적은?',choices:['원인과 피해를 객관적으로 규명해 재발방지에 활용','현장을 빠르게 철거','진술 하나로 원인 확정','피해금액만 계산'],a:0,ex:'화재조사는 원인과 피해상황을 객관적으로 규명하고 예방·제도개선에 활용하는 과정입니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c02',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C02',q:'화재조사 현장에서 먼저 지켜야 할 원칙으로 적절한 것은?',choices:['안전확보와 현장보존','모든 흔적 즉시 제거','사진촬영 생략','관계자 진술만 기록'],a:0,ex:'조사 가능한 흔적이 변형되지 않도록 안전확보 후 현장을 보존하고 기록하는 것이 중요합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c03',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C03',q:'발화부와 발화원인의 관계로 맞는 것은?',choices:['발화부는 시작 위치, 발화원인은 점화가 일어난 원인·과정','둘은 항상 같은 뜻','발화부는 피해금액','발화원인은 소방대 도착시간'],a:0,ex:'발화 위치와 점화 원인·과정은 구분해서 조사합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f06-c04',grade:'P',subject:'fire',scopeId:'F06',conceptId:'F06-C04',q:'화재피해 조사 기록에 가장 적절한 것은?',choices:['사진·도면·목록 등 객관적 근거를 연결','현장 인상만 기록','피해대상 구분 생략','원인조사와 무관하게 수치 임의결정'],a:0,ex:'피해범위와 대상을 객관적 자료로 남겨 이후 재검토할 수 있게 해야 합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},

{id:'p-f07-c01',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C01',q:'소방시설의 기능별 큰 분류에 포함되지 않는 것은?',choices:['소화설비','경보설비','피난구조설비','환자병력설비'],a:3,ex:'소방시설은 소화·경보·피난구조·소화용수·소화활동설비로 구분해 이해합니다.',source:'소방학개론 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c02',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C02',q:'소화기구 사용 판단에서 우선 고려할 것은?',choices:['화재종류와 약제 적응성 및 안전한 퇴로','건물 도색 색상','방송 음량','승강기 속도'],a:0,ex:'초기소화는 적응성 있는 약제와 안전한 퇴로 확보를 전제로 합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c03',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C03',q:'옥내소화전의 기본 기능은?',choices:['건물 내부에서 호스·관창으로 방수','자동으로 모든 헤드 동시개방','연기만 감지','피난방향만 표시'],a:0,ex:'옥내소화전은 수원·펌프·배관·방수구·호스·관창을 이용해 사람이 방수하는 설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c04',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C04',q:'옥외소화전의 특징으로 적절한 것은?',choices:['건축물 외부의 방수거점','천장 감열헤드','연기 제어만 수행','자동화재속보만 수행'],a:0,ex:'옥외소화전은 외부에서 호스를 연결해 화재진압에 사용할 수 있는 방수거점입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c05',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C05',q:'일반적인 폐쇄형 스프링클러의 작동 설명으로 적절한 것은?',choices:['화재열을 받은 해당 헤드가 개방되어 방수','경보가 울리면 모든 헤드가 무조건 동시개방','사람이 호스를 연결해야만 방수','연기만 배출하고 물은 사용하지 않음'],a:0,ex:'폐쇄형 스프링클러는 감열부가 화재열에 반응해 작동한 헤드에서 방수가 시작되는 구조입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c06',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C06',q:'화재조기진압용 스프링클러의 목적을 가장 잘 설명한 것은?',choices:['초기 단계에서 강한 방수로 화재 조기진압','피난방향 표시','무선통신 중계만 수행','가스누설만 감지'],a:0,ex:'화재조기진압용 시스템은 높은 방수성능을 이용한 조기진압 목적과 연결해 이해합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c07',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C07',q:'미분무소화의 특징으로 적절한 것은?',choices:['미세 물방울의 넓은 표면적으로 열흡수 효과를 높임','물을 전혀 사용하지 않음','소방대 통신만 지원','피난유도만 수행'],a:0,ex:'작은 물방울은 표면적이 커져 열교환과 증발 효과를 높일 수 있습니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c08',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C08',q:'포소화설비의 핵심 소화원리로 적절한 것은?',choices:['유면을 덮어 가연성증기 발생과 산소접촉 억제','감지기 신호만 전송','피난계단 조명','통신전파 증폭'],a:0,ex:'포는 가연성액체 표면을 피복해 증기 발생과 산소 접촉을 억제합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c09',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C09',q:'가스계 소화설비 운용에서 특히 중요한 것은?',choices:['방출 전 인명안전과 대피 확인','모든 공간에서 사람과 무관하게 즉시 방출','피난유도등 제거','배관에 물만 채우기'],a:0,ex:'가스계 소화는 방호공간의 농도 형성과 함께 인명안전·대피를 매우 중요하게 봅니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c10',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C10',q:'분말소화설비 학습에서 반드시 함께 보아야 할 것은?',choices:['분말 종류별 적응화재','건축물 외벽 색상','방송 스피커 위치만','피난자 연령만'],a:0,ex:'분말은 종별 주성분과 적응화재가 달라 약제 특성과 설비 방사원리를 함께 봅니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c11',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C11',q:'자동화재탐지설비의 주 기능은?',choices:['화재징후 감지 후 수신기와 경보로 통보','직접 모든 화재를 물로 소화','소방용수 저장만','환자 이송'],a:0,ex:'자동화재탐지설비는 감지와 경보·통보가 주 기능입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c12',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C12',q:'비상방송설비의 역할로 적절한 것은?',choices:['재실자에게 음성으로 화재·피난 정보를 전달','유면을 포로 덮음','배관 압력을 직접 상승','위험물 유별 판정'],a:0,ex:'비상방송은 음성으로 화재상황과 피난정보를 전달하는 경보설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c13',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C13',q:'피난구조설비의 목적에 가장 가까운 것은?',choices:['안전한 피난·구조 지원','화재원인 감정만','위험물 운송량 조사','환자혈당 측정'],a:0,ex:'피난구조설비는 피난방향 인지와 실제 탈출·구조를 돕는 설비군입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c14',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C14',q:'소화용수설비의 핵심 목적은?',choices:['화재진압에 필요한 물을 확보·공급','연기만 감지','피난방송만 수행','구급환자 기록'],a:0,ex:'소화용수설비는 소방대의 화재진압에 필요한 수원을 확보·공급하는 기반설비입니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'},
{id:'p-f07-c15',grade:'P',subject:'fire',scopeId:'F07',conceptId:'F07-C15',q:'소화활동설비의 예로 가장 적절한 것은?',choices:['제연·연결송수·무선통신보조','산부인과 처치장비','환자평가 기록지','위험물 분류표만'],a:0,ex:'소화활동설비는 소방대의 방수·배연·통신·전원 등 현장활동을 지원합니다.',source:'예방실무 공식 범위 · 페이지앵커 진행중'}
];
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const merged=[...V.questions];const seen=new Set(merged.map(q=>norm(q.q)));for(const q of P){if(!seen.has(norm(q.q))){merged.push(q);seen.add(norm(q.q))}}
V.questions=merged;V.questionById=Object.fromEntries(merged.map(q=>[q.id,q]));V.questionsForConcept=id=>merged.filter(q=>q.conceptId===id);
V.examReadiness=()=>{
  const verified=merged.filter(q=>q.grade==='A'||q.grade==='B'),fire=verified.filter(q=>q.subject==='fire'),ems=verified.filter(q=>q.subject==='ems');
  const fireCount=new Set(fire.map(q=>q.id)).size,emsCount=new Set(ems.map(q=>q.id)).size;
  const requiredFireScopes=V.curriculum.fire.map(x=>x.id),requiredEmsScopes=V.curriculum.ems.map(x=>x.id);
  const coveredFireScopes=new Set(fire.map(q=>q.scopeId)),coveredEmsScopes=new Set(ems.map(q=>q.scopeId));
  const missingFireScopes=requiredFireScopes.filter(x=>!coveredFireScopes.has(x)),missingEmsScopes=requiredEmsScopes.filter(x=>!coveredEmsScopes.has(x));
  const scopeComplete=missingFireScopes.length===0&&missingEmsScopes.length===0;
  return{fire:fireCount,ems:emsCount,ready:fireCount>=25&&emsCount>=40&&scopeComplete,fireNeed:Math.max(0,25-fireCount),emsNeed:Math.max(0,40-emsCount),missingFireScopes,missingEmsScopes,scopeComplete,practiceScopeQuestions:P.length};
};
V.scopePractice2026={questions:P.length,grade:'P',economicTruth:'practice-only-not-real-exam-credit',scopes:['F05','F06','F07']};
})();