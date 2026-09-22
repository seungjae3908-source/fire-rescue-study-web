'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!Array.isArray(V.questions))return;

const Q=[
{id:'119-verfirebreadth2-heat-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C02',difficulty:'mid',type:'열량개념형',source:'2026 소방전술1(화재2) 309쪽',
q:'100℃의 물이 같은 온도의 수증기로 상태변화할 때 필요한 열의 종류는?',
choices:['증발잠열','감열만','연소열만','비열 자체'],a:0,
choiceExplanations:['정답. 온도변화 없이 액체에서 기체로 상태가 바뀔 때 필요한 열은 증발잠열이다.','감열은 상태를 유지한 채 온도를 변화시키는 열량과 연결된다.','상태변화의 정의를 연소열로 바꾸면 안 된다.','비열은 단위질량의 온도를 1℃ 올리는 데 필요한 열량 특성이다.']},

{id:'119-verfirebreadth2-airratio-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C03',difficulty:'high',type:'공기비계산형',source:'2026 소방전술1(화재2) 299~302쪽',
q:'이론공기량이 12 N㎥, 실제공기량이 15 N㎥일 때 공기비 m은?',
choices:['1.25','0.80','3.00','27.00'],a:0,
choiceExplanations:['정답. 공기비는 실제공기량÷이론공기량이므로 15÷12=1.25이다.','이론공기량을 실제공기량으로 나눈 역수다.','두 공기량의 차이를 공기비로 잘못 본 값이다.','두 공기량을 더한 값으로 비율이 아니다.']},

{id:'119-verfirebreadth2-ventilation-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C05',difficulty:'high',type:'화재성장형',source:'2026 소방전술1(화재1) 18·22쪽',
q:'구획실에 가연물은 충분하지만 산소 유입이 부족해 개구부 조건이 화재크기를 좌우하는 상태는?',
choices:['환기지배 화재','연료지배 화재','표면연소만의 상태','무염연소가 반드시 종료된 상태'],a:0,
choiceExplanations:['정답. 산소와 환기조건이 제한요인이 되는 상태는 환기지배 화재다.','연료지배는 이용 가능한 가연물의 양이 제한요인인 경우다.','표면연소 여부만으로 지배조건을 정의하지 않는다.','산소가 부족해도 열과 미연소가스가 남을 수 있다.']},

{id:'119-verfirebreadth2-flameover-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C10',difficulty:'high',type:'특수현상비교형',source:'2026 소방전술1(화재1) 40쪽',
q:'소방전술1이 설명하는 플레임오버의 핵심은?',
choices:['산소가 부족한 구획에 공기가 들어와 폭발적으로 연소하는 현상','일정 공간의 가연물이 대류·복사로 가열되어 일순간 동시발화하는 현상','초기화재에서 대류가 본격화되며 불꽃이 커져 벽면에서 천장을 통해 면이동하는 현상','원유탱크 내부 물이 비등해 원유와 함께 넘치는 현상'],a:2,
choiceExplanations:['백드래프트에 해당한다.','플래시오버에 해당한다.','정답. 공식교재 40쪽의 플레임오버 정의다.','보일오버에 해당한다.']},

{id:'119-verfirebreadth2-boilover-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C12',difficulty:'high',type:'탱크화재형',source:'2026 소방전술1 303쪽',
q:'보일오버를 가장 적절히 설명한 것은?',
choices:['원유 저장탱크 내부에 물이 있는 상태에서 표면화재가 발생해 원유와 물이 함께 탱크 밖으로 넘치는 현상','뜨거운 유류에 외부 물이 닿아 수증기팽창으로 유류가 비산하는 현상','뜨거운 점성 유류표면 아래 물 비등으로 유류가 넘치며 직접 화재요인은 아닌 현상','가압 액화가스 용기가 파열하며 급기화하는 현상'],a:0,
choiceExplanations:['정답. 2026 소방전술1 303쪽의 정의다.','슬롭오버에 해당한다.','프로스오버에 해당한다.','BLEVE에 해당한다.']},

{id:'119-verfirebreadth2-slopover-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C13',difficulty:'high',type:'탱크화재형',source:'2026 소방전술1 304쪽',
q:'슬롭오버의 직접적인 원리로 가장 적절한 것은?',
choices:['뜨거운 점성 유류에 물이 접촉해 물이 수증기로 팽창·비등하며 유류를 외부로 비산시키는 것','원유탱크 표면화재에서 원유와 내부 물이 함께 넘치는 것','가압용기가 외부화재로 약화되어 파열하는 것','산소부족 구획실에 공기가 유입되는 것'],a:0,
choiceExplanations:['정답. 뜨거운 유류와 물의 접촉 및 급격한 수증기팽창이 핵심이다.','보일오버에 해당한다.','BLEVE에 해당한다.','백드래프트에 해당한다.']},

{id:'119-verfirebreadth2-frothover-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C14',difficulty:'high',type:'특수현상형',source:'2026 소방전술1 303쪽',
q:'프로스오버의 설명으로 가장 적절한 것은?',
choices:['점성을 가진 뜨거운 유류표면 아래의 물이 비등해 탱크 내 유류가 넘치며 직접적인 화재발생요인은 아닌 현상','원유탱크 표면화재로 원유와 물이 함께 넘치는 현상','외부 주수된 물이 뜨거운 유류와 접촉해 유류를 비산시키는 현상','가연성가스와 열이 집적된 구획에 산소가 공급되어 폭발적으로 발화하는 현상'],a:0,
choiceExplanations:['정답. 2026 소방전술1 303쪽의 프로스오버 정의다.','보일오버에 해당한다.','슬롭오버에 해당한다.','백드래프트에 해당한다.']},

{id:'119-verfirebreadth2-bleve-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C15',difficulty:'high',type:'BLEVE형',source:'2026 소방전술1 PDF 326쪽',
q:'BLEVE에 대한 설명으로 가장 적절한 것은?',
choices:['가열된 가압 액체 용기의 압력상승·재질약화·파열과 급격한 기화가 핵심이다','고인 인화성액체의 액면만 연소하는 현상이다','구획실 전체 가연물의 동시발화 현상이다','유류표면에 물이 들어가 넘치는 현상만 뜻한다'],a:0,
choiceExplanations:['정답. BLEVE는 가압 액체 용기의 파열과 급기화가 핵심이며 가연성이면 파이어볼이 동반될 수 있다.','풀파이어 설명이다.','플래시오버 설명이다.','슬롭오버 설명이다.']},

{id:'119-verfirebreadth2-poolfire-01',grade:'B',subject:'fire',scopeId:'F03',conceptId:'F03-C16',difficulty:'mid',type:'풀파이어형',source:'2026 소방전술1 PDF 453쪽',
q:'풀파이어의 연소대상과 형태를 가장 적절히 설명한 것은?',
choices:['누출되어 고인 인화성 액체의 액면 위에서 생성된 증기가 넓게 연소한다','가압가스가 고속으로 분출되며 제트형 화염만 형성한다','용기파열 자체가 연소대상이다','하부 수분층이 기화해 유류를 분출시키는 현상이다'],a:0,
choiceExplanations:['정답. 풀파이어는 고인 액체의 액면 증기연소가 핵심이다.','제트파이어에 가까운 설명이다.','BLEVE와 혼동한 설명이다.','보일오버 설명이다.']},

{id:'119-verfirebreadth2-haz1-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C02',difficulty:'mid',type:'위험물성상형',source:'2026 예방실무2 PDF 385쪽',
q:'제1류 위험물의 대표 성상으로 옳은 것은?',
choices:['산화성고체로 다른 물질의 연소를 촉진할 수 있다','인화성액체다','자기반응성물질만을 뜻한다','가연성고체만을 뜻한다'],a:0,
choiceExplanations:['정답. 제1류는 산화성고체로 가연물·환원성물질과의 혼촉 위험을 본다.','제4류와 혼동한 설명이다.','제5류와 혼동했다.','제2류와 혼동했다.']},

{id:'119-verfirebreadth2-haz2-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C03',difficulty:'high',type:'위험물성상형',source:'2026 예방실무2 PDF 407쪽',
q:'제2류 가연성고체의 소화 판단에서 특히 주의할 점은?',
choices:['금속분 등은 물과의 반응 가능성을 확인해 모든 품목에 물을 일률 적용하지 않는다','제2류는 모두 산화성액체이므로 물 반응을 볼 필요가 없다','모든 제2류는 물과 접촉해 반드시 같은 반응을 한다','입자가 미세할수록 연소가 항상 느려진다'],a:0,
choiceExplanations:['정답. 제2류 안에서도 금속분 등 품목별 물 반응성을 확인해야 한다.','제6류와 혼동한 설명이다.','품목별 성상이 다르므로 일률화하면 안 된다.','미세분말은 표면적 증가로 연소가 빨라질 수 있다.']},

{id:'119-verfirebreadth2-haz5-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C06',difficulty:'high',type:'위험물성상형',source:'2026 예방실무2 PDF 496쪽',
q:'제5류 자기반응성물질에 대한 설명으로 옳은 것은?',
choices:['자체 분해반응이 빠르게 진행될 수 있어 열·충격·마찰에 주의한다','외부 산소를 차단하면 모든 반응이 반드시 즉시 끝난다','제5류는 인화성액체만을 뜻한다','제5류는 산화성액체만을 뜻한다'],a:0,
choiceExplanations:['정답. 제5류는 자기반응성 특성 때문에 급격한 분해와 열·충격·마찰 위험을 본다.','자체 분해가 지속될 수 있어 단순 질식만으로 충분하지 않을 수 있다.','제4류와 혼동한 설명이다.','제6류와 혼동했다.']},

{id:'119-verfirebreadth2-haz6-01',grade:'B',subject:'fire',scopeId:'F05',conceptId:'F05-C07',difficulty:'mid',type:'위험물성상형',source:'2026 예방실무2 PDF 523쪽',
q:'제6류 위험물에 대한 설명으로 옳은 것은?',
choices:['산화성액체로 가연성·환원성 물질과 혼촉될 때 강한 반응 위험이 있다','인화성액체라서 제4류와 동일하다','가연성고체만으로 구성된다','금수성고체만을 뜻한다'],a:0,
choiceExplanations:['정답. 제6류는 산화성액체로 혼촉 위험과 산화촉진성을 본다.','제4류는 인화성액체다.','제2류 설명과 다르다.','제3류의 일부 금수성 특성과 혼동했다.']},

{id:'119-verfirebreadth2-investigation-01',grade:'B',subject:'fire',scopeId:'F06',conceptId:'F06-C02',difficulty:'high',type:'조사절차형',source:'2026 소방전술1(화재2) PDF 276·282쪽',
q:'화재조사 현장보존과 분석의 원칙으로 가장 적절한 것은?',
choices:['안전을 확보한 뒤 현장을 보존·기록하고 사진·도면·진술 등 여러 자료를 종합한다','사진 촬영 전 흔적을 임의로 이동·폐기한다','화재패턴 한 가지만 보고 발화부를 즉시 확정한다','진압·환기로 흔적이 변형될 가능성은 고려하지 않는다'],a:0,
choiceExplanations:['정답. 안전확보→보존→기록→자료수집→분석의 체계가 중요하다.','증거 훼손 위험이 있어 기록 전에 임의 이동을 피한다.','단일 단서로 결론을 확정하지 않는다.','진압·환기·붕괴로 흔적이 변형될 수 있다.']},

{id:'119-verfirebreadth2-damage-01',grade:'B',subject:'fire',scopeId:'F06',conceptId:'F06-C04',difficulty:'high',type:'피해조사형',source:'2026 소방전술1(화재2) PDF 287·294쪽',
q:'화재피해 조사 기록으로 가장 적절한 것은?',
choices:['건물·내용물·설비 등 피해대상을 구분하고 사진·도면·목록 등 객관적 증빙을 남긴다','현장 인상만으로 피해금액과 소실범위를 결정한다','피해수치와 원인조사 결과의 모순 여부는 확인하지 않는다','조사시점과 범위를 기록하지 않는다'],a:0,
choiceExplanations:['정답. 제3자가 재검토할 수 있는 객관적 근거를 남기는 것이 중요하다.','현장 인상만으로 임의 결정하면 신뢰성이 떨어진다.','원인·피해 기록의 정합성을 검토해야 한다.','조사 범위와 시점도 기록 품질에 중요하다.']},

{id:'119-verfirebreadth2-facility5-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C01',difficulty:'mid',type:'시설분류형',source:'2026 예방실무1 PDF 17쪽',
q:'소방시설 5분류에 포함되지 않는 것은?',
choices:['소화설비·경보설비·피난구조설비·소화용수설비·소화활동설비','소화설비','경보설비','피난구조설비'],a:0,
choiceExplanations:['정답. 첫 선택지는 5개 기능군 전체를 정확히 나열한다.','소화설비는 5분류 중 하나다.','경보설비도 5분류에 포함된다.','피난구조설비도 5분류 중 하나다.']},

{id:'119-verfirebreadth2-extinguisher-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C02',difficulty:'high',type:'소화기운용형',source:'2026 예방실무1 PDF 207쪽',
q:'초기화재에서 소화기를 사용할 때 가장 적절한 판단은?',
choices:['화재종류와 약제 적응성을 확인하고 퇴로를 확보한 채 화점 근원을 향해 방사한다','연기와 복사열이 급증해도 퇴로를 버리고 계속 방사한다','모든 소화기는 모든 화재에 같은 적응성을 가진다','화점과 반대 방향으로 방사한다'],a:0,
choiceExplanations:['정답. 약제 적응성과 안전한 퇴로 확보가 핵심이다.','위험이 커지면 대피와 신고를 우선해야 한다.','약제마다 적응화재와 한계가 다르다.','화점 근원을 향한 적절한 방사가 필요하다.']},

{id:'119-verfirebreadth2-indoorhydrant-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C03',difficulty:'high',type:'옥내소화전형',source:'2026 예방실무1 PDF 247쪽',
q:'옥내소화전과 스프링클러의 대표 차이로 옳은 것은?',
choices:['옥내소화전은 사람이 호스·관창으로 방수하고 스프링클러는 헤드가 자동 작동해 방수할 수 있다','옥내소화전은 감열헤드가 자동 개방되는 설비만을 뜻한다','스프링클러는 항상 사람이 호스를 전개해야만 작동한다','두 설비의 작동방식은 완전히 동일하다'],a:0,
choiceExplanations:['정답. 옥내소화전은 수동 호스방수, 스프링클러는 자동 헤드방수라는 구분이 중요하다.','스프링클러와 혼동한 설명이다.','스프링클러는 자동소화설비다.','수계설비라는 공통점 외에 운용 방식은 다르다.']},

{id:'119-verfirebreadth2-outdoorhydrant-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C04',difficulty:'mid',type:'옥외소화전형',source:'2026 예방실무1 PDF 273쪽',
q:'옥외소화전설비의 주된 목적은?',
choices:['건축물 외부에서 소방대나 관계자가 호스를 연결해 방수할 수 있는 거점을 제공한다','건물 내부 천장에서 자동으로 물을 분사한다','연기를 자동 감지해 수신기로만 신호를 보낸다','피난방향만 표시한다'],a:0,
choiceExplanations:['정답. 옥외소화전은 외부 방수거점을 제공하는 소화설비다.','스프링클러와 혼동한 설명이다.','자동화재탐지설비의 기능이다.','피난구조설비 기능이다.']},

{id:'119-verfirebreadth2-watermist-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C07',difficulty:'high',type:'물분무미분무형',source:'2026 예방실무1 PDF 328쪽',
q:'물분무·미분무 소화에서 물방울을 작게 만드는 효과로 가장 적절한 것은?',
choices:['표면적을 키워 열교환과 증발을 빠르게 해 냉각·열흡수 효과를 높일 수 있다','물의 표면적을 줄여 열흡수를 없앤다','모든 화재에 무조건 동일한 방식으로 적용할 수 있게 한다','증발을 완전히 막는다'],a:0,
choiceExplanations:['정답. 작은 물방울은 단위질량당 표면적이 커져 열교환·증발이 빨라질 수 있다.','실제 효과와 반대다.','화재대상 특성에 따라 적용이 달라진다.','미세 물방울은 오히려 증발이 촉진될 수 있다.']},

{id:'119-verfirebreadth2-gassystem-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C09',difficulty:'high',type:'가스계소화형',source:'2026 예방실무1 PDF 432쪽',
q:'가스계 소화설비 운용에서 특히 중요한 안전원칙은?',
choices:['방출 전 경보와 인명대피를 확인하고 방출 후 환기·재진입 안전을 고려한다','잔사가 적으므로 사람의 대피는 필요 없다','모든 가스계 약제는 완전히 같은 소화기전만 가진다','방호공간의 밀폐와 소화농도는 성능과 무관하다'],a:0,
choiceExplanations:['정답. 고농도 가스의 인명위험 때문에 경보·대피·환기·재진입 안전을 함께 본다.','인명안전을 무시할 수 없다.','약제별 소화기전에는 차이가 있다.','방호공간의 농도 형성이 성능에 중요하다.']},

{id:'119-verfirebreadth2-powdersystem-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C10',difficulty:'high',type:'분말설비형',source:'2026 예방실무1 PDF 415쪽',
q:'분말소화설비와 약제 종별 적응화재의 연결로 옳은 것은?',
choices:['제3종 분말은 ABC 적응약제로 연결하고 제1·2·4종은 BC 분말로 구분한다','모든 분말은 항상 ABC에 동일하게 적응한다','제3종은 BC에만 적응한다','분말은 화염의 연쇄반응 억제와 무관하다'],a:0,
choiceExplanations:['정답. 제3종은 제1인산암모늄 계열 ABC, 1·2·4종은 BC로 구분한다.','종별 적응화재가 다르다.','제3종은 ABC 적응으로 배운다.','분말은 연쇄반응 억제 효과가 중요하다.']},

{id:'119-verfirebreadth2-alarm-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C12',difficulty:'high',type:'경보설비형',source:'2026 예방실무1 PDF 18쪽',
q:'경보설비의 기능 연결로 가장 적절한 것은?',
choices:['비상방송=음성 피난정보 · 자동화재속보=화재신호 외부 자동통보 · 누전/가스누설경보=위험요인 조기경보','비상방송=직접 소화 · 자동화재속보=배관가압 · 누전경보=피난사다리','모든 경보설비는 직접 물을 방사한다','가스누설경보는 가스 위험과 무관하다'],a:0,
choiceExplanations:['정답. 감지·통보대상에 따라 경보설비 기능을 구분한다.','다른 소화·피난 기능을 섞은 오답이다.','경보설비의 주기능은 감지와 통보다.','가스누설 위험을 조기에 알리는 역할을 한다.']},

{id:'119-verfirebreadth2-evacuation-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C13',difficulty:'high',type:'피난구조형',source:'2026 예방실무1 PDF 465쪽',
q:'피난구조설비의 역할 연결로 옳은 것은?',
choices:['유도등=피난방향 안내 · 비상조명=정전 시 시야 확보 · 피난기구=실제 탈출·이동 지원','유도등=직접 소화 · 비상조명=펌프가압 · 피난기구=연기감지','모든 피난구조설비는 소화약제를 방사한다','피난구조설비는 사람의 이동·구조와 무관하다'],a:0,
choiceExplanations:['정답. 정보제공·시야확보·실제 이동지원 기능을 구분한다.','각 기능을 다른 설비와 바꾼 설명이다.','직접 소화가 주기능이 아니다.','화재 시 안전한 이동과 구조를 지원한다.']},

{id:'119-verfirebreadth2-water-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C14',difficulty:'mid',type:'소화용수형',source:'2026 예방실무1 PDF 201쪽',
q:'소화용수설비와 직접 방수 소화설비의 차이로 가장 적절한 것은?',
choices:['소화용수설비는 소방대가 사용할 물을 확보·공급하는 목적이 중심이다','소화용수설비는 화재를 자동 감지하고 모든 헤드를 개방한다','소화용수설비는 피난방향을 알려주는 설비다','소화용수설비는 화재원인을 조사하는 설비다'],a:0,
choiceExplanations:['정답. 상수도소화용수·소화수조 등은 소방용수 확보가 핵심이다.','스프링클러·감지 계통과 혼동했다.','피난구조설비 기능이다.','화재조사 기능과 무관하다.']},

{id:'119-verfirebreadth2-support-01',grade:'B',subject:'fire',scopeId:'F07',conceptId:'F07-C15',difficulty:'high',type:'소화활동설비형',source:'2026 예방실무1 PDF 167·174·433·482쪽',
q:'소화활동설비의 기능 연결로 옳은 것은?',
choices:['연결송수관=송수지원 · 제연=연기제어 · 비상콘센트=전원지원 · 무선통신보조=통신지원','연결송수관=피난유도 · 제연=화재조사 · 비상콘센트=소화약제 저장 · 무선통신보조=직접 방수','모든 소화활동설비는 자동으로 화재를 직접 진압한다','제연은 단순 냄새 제거만을 목적으로 한다'],a:0,
choiceExplanations:['정답. 소방대의 방수·진입·연기제어·전원·통신을 지원하는 기능군이다.','각 기능을 잘못 연결했다.','직접 자동소화만을 의미하지 않는다.','제연은 연기 이동을 제어해 피난과 소방활동 환경을 개선한다.']}
];

const norm=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
const ids=new Set(V.questions.map(q=>q.id)),texts=new Set(V.questions.map(q=>norm(q.q)));
for(const q of Q){
 if(ids.has(q.id))throw Error('VERIFIED_FIRE_BREADTH2_DUP_ID '+q.id);
 if(texts.has(norm(q.q)))throw Error('VERIFIED_FIRE_BREADTH2_DUP_TEXT '+q.id+' :: '+q.q);
 q.ex=q.choiceExplanations[q.a];q.examStyle=true;q.questionClass='exam-style';q.pageVerified=true;q.reviewStatus='source-reviewed';q.pastExamClaim=false;
 if(!Array.isArray(q.choices)||q.choices.length!==4||new Set(q.choices.map(norm)).size!==4)throw Error('VERIFIED_FIRE_BREADTH2_CHOICES '+q.id);
 if(!Array.isArray(q.choiceExplanations)||q.choiceExplanations.length!==4||q.choiceExplanations.some(x=>String(x).trim().length<8))throw Error('VERIFIED_FIRE_BREADTH2_EXPLANATIONS '+q.id);
 if(!/\d+(?:\s*[·~\-–]\s*\d+)*\s*쪽/.test(q.source))throw Error('VERIFIED_FIRE_BREADTH2_PAGE '+q.id);
 V.questions.push(q);ids.add(q.id);texts.add(norm(q.q));
}
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.VerifiedFireBreadth2119={version:'119-verified-fire-breadth2-v1',planned:Q.length,added:Q.length,ids:Q.map(q=>q.id),grade:'B',pageVerified:true,pastExamClaim:false};
})();