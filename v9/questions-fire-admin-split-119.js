'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};if(!Array.isArray(V.questions))return;
const H='소방청 공식 연혁',M='2026 소방공무원 채용시험 · 소방학개론 출제범위(소방조직관리 기초이론)';
const rows=[
  {
    id:'119-v13-fire-history-01',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'low',type:'연혁형',source:H,examStyle:true,questionClass:'exam-style',
    q:'소방청 공식 연혁상 1426년에 설치된 방화조직으로 옳은 것은?',
    choices:['금화도감·수성금화도감','경성소방서','내무부 소방국','소방방재청'],a:0,
    choiceExplanations:['정답. 1426년 금화도감·수성금화도감이 설치되었다.','경성소방서는 1925년의 대표 연혁이다.','내무부 소방국은 1975년 설치되었다.','소방방재청은 2004년 출범했다.']
  },
  {
    id:'119-v13-fire-history-02',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'low',type:'연혁형',source:H,examStyle:true,questionClass:'exam-style',
    q:'소방청 공식 연혁상 1481년의 주요 변천으로 옳은 것은?',
    choices:['수성금화사 설치','소방법 제정','시·도 소방본부 설치','소방청 출범'],a:0,
    choiceExplanations:['정답. 1481년 수성금화사가 설치되었다.','소방법 제정은 1958년이다.','시·도 소방본부 설치는 1992년이다.','소방청 출범은 2017년이다.']
  },
  {
    id:'119-v13-fire-history-03',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'low',type:'연혁형',source:H,examStyle:true,questionClass:'exam-style',
    q:'근대 소방관서 변천과 관련하여 1925년에 설치된 것으로 옳은 것은?',
    choices:['경성소방서','소방방재청','중앙소방본부','시·도 소방본부'],a:0,
    choiceExplanations:['정답. 소방청 공식 연혁은 1925년 경성소방서 설치를 제시한다.','소방방재청은 2004년이다.','중앙소방본부 체제는 2014년이다.','시·도 소방본부 설치는 1992년이다.']
  },
  {
    id:'119-v13-fire-history-04',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'연도매칭형',source:H,examStyle:true,questionClass:'exam-style',
    q:'연도와 소방행정 변천의 연결이 옳은 것은?',
    choices:['1958년 - 소방법 제정','1975년 - 소방청 출범','1992년 - 국가직 전환','2004년 - 중앙소방본부 체제'],a:0,
    choiceExplanations:['정답. 1958년 소방법이 제정되었다.','1975년은 내무부 소방국 설치와 연결된다.','1992년은 시·도 소방본부 설치와 연결된다.','2004년은 소방방재청 출범과 연결된다.']
  },
  {
    id:'119-v13-fire-history-05',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'순서형',source:H,examStyle:true,questionClass:'exam-style',
    q:'다음 소방행정 변천을 빠른 것부터 바르게 나열한 것은?',
    choices:['내무부 소방국 설치 → 소방공무원법 제정 → 시·도 소방본부 설치 → 지방직 전환','소방공무원법 제정 → 내무부 소방국 설치 → 지방직 전환 → 시·도 소방본부 설치','시·도 소방본부 설치 → 내무부 소방국 설치 → 소방공무원법 제정 → 지방직 전환','지방직 전환 → 시·도 소방본부 설치 → 내무부 소방국 설치 → 소방공무원법 제정'],a:0,
    choiceExplanations:['정답. 1975 → 1978 → 1992 → 1995 순서다.','1975와 1978의 순서가 바뀌었고 1992와 1995도 바뀌었다.','1975·1978이 1992보다 앞선다.','전체 순서가 역전되어 있다.']
  },
  {
    id:'119-v13-fire-history-06',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'연도매칭형',source:H,examStyle:true,questionClass:'exam-style',
    q:'1992년과 1995년의 소방행정 변천을 바르게 연결한 것은?',
    choices:['1992 시·도 소방본부 설치 / 1995 시·도 지방직 전환','1992 국가직 전환 / 1995 소방청 출범','1992 소방방재청 출범 / 1995 중앙소방본부 체제','1992 소방법 제정 / 1995 내무부 소방국 설치'],a:0,
    choiceExplanations:['정답. 두 연도의 핵심 변천을 올바르게 연결했다.','국가직 전환은 2020년, 소방청 출범은 2017년이다.','소방방재청은 2004년, 중앙소방본부는 2014년이다.','소방법은 1958년, 내무부 소방국은 1975년이다.']
  },
  {
    id:'119-v13-fire-history-07',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'순서형',source:H,examStyle:true,questionClass:'exam-style',
    q:'2000년대 이후 중앙 소방행정 조직의 변천 순서로 옳은 것은?',
    choices:['소방방재청 → 국민안전처 중앙소방본부 → 소방청','중앙소방본부 → 소방방재청 → 소방청','소방청 → 소방방재청 → 중앙소방본부','소방방재청 → 소방청 → 중앙소방본부'],a:0,
    choiceExplanations:['정답. 2004 → 2014 → 2017 순서다.','중앙소방본부는 소방방재청보다 뒤다.','소방청은 가장 나중인 2017년 출범했다.','2014년 중앙소방본부가 2017년 소방청보다 앞선다.']
  },
  {
    id:'119-v13-fire-history-08',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'연도형',source:H,examStyle:true,questionClass:'exam-style',
    q:'소방방재청이 출범한 연도로 옳은 것은?',
    choices:['2004년','1995년','2014년','2017년'],a:0,
    choiceExplanations:['정답. 소방방재청은 2004년 출범했다.','1995년은 지방직 전환과 연결된다.','2014년은 국민안전처 중앙소방본부 체제다.','2017년은 소방청 출범이다.']
  },
  {
    id:'119-v13-fire-history-09',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'mid',type:'연도형',source:H,examStyle:true,questionClass:'exam-style',
    q:'독립 외청인 소방청이 출범한 연도로 옳은 것은?',
    choices:['2017년','2004년','2014년','2020년'],a:0,
    choiceExplanations:['정답. 소방청은 2017년 출범했다.','2004년은 소방방재청이다.','2014년은 중앙소방본부 체제다.','2020년은 소방공무원 국가직 전환 시행과 연결된다.']
  },
  {
    id:'119-v13-fire-history-10',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'high',type:'함정형',source:H,examStyle:true,questionClass:'exam-style',
    q:'소방청 출범과 소방공무원 국가직 전환에 대한 설명으로 가장 적절한 것은?',
    choices:['소방청 출범은 2017년, 국가직 전환 시행은 2020년으로 서로 다른 연혁이다','두 사건 모두 2004년에 동시에 일어났다','국가직 전환이 2014년에 먼저 이루어진 뒤 2017년 소방방재청이 출범했다','소방청 출범과 국가직 전환은 같은 사건을 다른 이름으로 부른 것이다'],a:0,
    choiceExplanations:['정답. 두 사건은 시점과 내용이 다르다.','2004년은 소방방재청 출범이다.','2014년은 중앙소방본부 체제이며 소방방재청 출범은 2004년이다.','조직 출범과 신분 일원화는 별개의 연혁이다.']
  },
  {
    id:'119-v13-fire-history-11',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'high',type:'연혁비교형',source:H,examStyle:true,questionClass:'exam-style',
    q:'다음 중 가장 늦게 일어난 것은?',
    choices:['소방공무원 국가직 전환 시행','소방청 출범','국민안전처 중앙소방본부 체제','소방방재청 출범'],a:0,
    choiceExplanations:['정답. 국가직 전환 시행은 2020년이다.','소방청은 2017년 출범했다.','중앙소방본부 체제는 2014년이다.','소방방재청은 2004년 출범했다.']
  },
  {
    id:'119-v13-fire-history-12',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C06',difficulty:'high',type:'순서형',source:H,examStyle:true,questionClass:'exam-style',
    q:'다음 연혁의 시대순 배열로 옳은 것은?',
    choices:['금화도감 → 경성소방서 → 소방법 제정 → 시·도 소방본부 → 소방방재청 → 소방청','경성소방서 → 금화도감 → 소방법 제정 → 소방방재청 → 시·도 소방본부 → 소방청','금화도감 → 소방법 제정 → 경성소방서 → 시·도 소방본부 → 소방청 → 소방방재청','금화도감 → 경성소방서 → 시·도 소방본부 → 소방법 제정 → 소방방재청 → 소방청'],a:0,
    choiceExplanations:['정답. 1426 → 1925 → 1958 → 1992 → 2004 → 2017 흐름이다.','금화도감이 경성소방서보다 훨씬 앞선다.','경성소방서가 소방법 제정보다 앞서며 소방방재청이 소방청보다 앞선다.','소방법 제정이 시·도 소방본부 설치보다 앞선다.']
  },

  {
    id:'119-v13-org-mgmt-01',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'low',type:'개념형',source:M,examStyle:true,questionClass:'exam-style',
    q:'권한과 책임, 직무를 상하 단계로 배분하여 지휘체계를 형성하는 조직관리 원리는?',
    choices:['계층제','명령통일','통솔범위','조정·통합'],a:0,
    choiceExplanations:['정답. 계층제는 상하 권한·책임 구조를 형성한다.','명령통일은 지휘·보고 계통의 일관성과 관련된다.','통솔범위는 한 관리자가 직접 감독할 수 있는 범위다.','조정·통합은 분화된 활동의 연결과 관련된다.']
  },
  {
    id:'119-v13-org-mgmt-02',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'low',type:'개념형',source:M,examStyle:true,questionClass:'exam-style',
    q:'원칙적으로 한 직속상관의 지휘·보고 체계를 명확히 하여 상충되는 지시를 줄이려는 원리는?',
    choices:['명령통일','분업·전문화','통솔범위','계층제'],a:0,
    choiceExplanations:['정답. 명령통일의 핵심은 지휘계통의 일관성이다.','분업·전문화는 기능별 업무분화다.','통솔범위는 감독 가능한 범위다.','계층제는 상하 단계구조다.']
  },
  {
    id:'119-v13-org-mgmt-03',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'low',type:'개념형',source:M,examStyle:true,questionClass:'exam-style',
    q:'한 관리자가 효과적으로 직접 감독할 수 있는 부하 또는 업무의 범위를 뜻하는 것은?',
    choices:['통솔범위','명령통일','조정·통합','분업·전문화'],a:0,
    choiceExplanations:['정답. 통솔범위의 정의다.','명령통일은 지휘선의 일관성을 다룬다.','조정·통합은 분화된 활동을 연결한다.','분업·전문화는 기능분화를 다룬다.']
  },
  {
    id:'119-v13-org-mgmt-04',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'low',type:'개념형',source:M,examStyle:true,questionClass:'exam-style',
    q:'업무를 성질과 기능에 따라 나누어 숙련과 전문성을 높이는 조직관리 원리는?',
    choices:['분업·전문화','통솔범위','명령통일','계층제'],a:0,
    choiceExplanations:['정답. 분업·전문화는 업무를 기능별로 나누고 전문성을 높인다.','통솔범위는 감독범위다.','명령통일은 지휘계통을 다룬다.','계층제는 상하 권한구조를 다룬다.']
  },
  {
    id:'119-v13-org-mgmt-05',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'개념형',source:M,examStyle:true,questionClass:'exam-style',
    q:'분화된 부서와 활동을 조직의 공통 목표에 맞게 연결하고 중복·충돌을 줄이는 원리는?',
    choices:['조정·통합','명령통일','통솔범위','계층제'],a:0,
    choiceExplanations:['정답. 조정·통합은 분화된 활동을 공통 목표에 맞게 연결한다.','명령통일은 지휘선의 혼란을 줄인다.','통솔범위는 직접 감독범위를 뜻한다.','계층제는 상하 권한구조다.']
  },
  {
    id:'119-v13-org-mgmt-06',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'비교형',source:M,examStyle:true,questionClass:'exam-style',
    q:'명령통일과 통솔범위를 바르게 비교한 것은?',
    choices:['명령통일은 지휘계통의 일관성, 통솔범위는 직접 감독 가능한 범위를 다룬다','명령통일은 감독 가능한 부하 수, 통솔범위는 한 상관에게만 보고하는 원리를 뜻한다','둘 다 업무의 기능별 분업만을 뜻한다','둘 다 상하 계층 수를 늘리는 원리만을 뜻한다'],a:0,
    choiceExplanations:['정답. 두 원리의 핵심 구분이다.','두 개념을 서로 뒤바꾼 설명이다.','분업·전문화의 설명에 가깝다.','계층제와도 정확히 일치하지 않는다.']
  },
  {
    id:'119-v13-org-mgmt-07',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'적용형',source:M,examStyle:true,questionClass:'exam-style',
    q:'동일한 직원이 서로 다른 상급자로부터 상충되는 명령을 받아 업무혼선이 발생했다. 가장 직접적으로 관련된 원리는?',
    choices:['명령통일','통솔범위','분업·전문화','조정·통합'],a:0,
    choiceExplanations:['정답. 복수 지휘선의 충돌을 줄이려는 원리가 명령통일이다.','통솔범위는 관리자가 감독할 수 있는 범위를 다룬다.','분업은 업무 기능분화를 다룬다.','조정도 필요할 수 있지만 문제의 직접 원인은 상충되는 지휘선이다.']
  },
  {
    id:'119-v13-org-mgmt-08',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'적용형',source:M,examStyle:true,questionClass:'exam-style',
    q:'한 팀장이 지나치게 많은 인원을 직접 지휘하여 감독이 제대로 이루어지지 않는다. 가장 직접적으로 검토할 원리는?',
    choices:['통솔범위','명령통일','계층제','분업·전문화'],a:0,
    choiceExplanations:['정답. 한 관리자의 효과적인 직접 감독범위를 검토해야 한다.','명령통일은 명령의 출처와 지휘선을 다룬다.','계층제는 상하 조직구조를 다룬다.','분업·전문화는 기능별 업무분화를 다룬다.']
  },
  {
    id:'119-v13-org-mgmt-09',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'mid',type:'관계형',source:M,examStyle:true,questionClass:'exam-style',
    q:'분업·전문화가 강화될수록 함께 중요해지는 조직관리 기능으로 가장 적절한 것은?',
    choices:['조정·통합','명령계통의 완전한 제거','책임의 폐지','모든 업무의 비전문화'],a:0,
    choiceExplanations:['정답. 기능이 분화될수록 부서 간 목표와 활동을 연결하는 조정 필요성이 커진다.','지휘체계를 제거하는 것이 분업의 목적은 아니다.','분업이 책임을 없애는 것은 아니다.','전문화 강화와 반대되는 설명이다.']
  },
  {
    id:'119-v13-org-mgmt-10',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'high',type:'함정형',source:M,examStyle:true,questionClass:'exam-style',
    q:'조직관리 원리에 대한 설명 중 옳지 않은 것은?',
    choices:['통솔범위는 한 관리자가 직접 감독할 수 있는 범위와 관련된다','명령통일은 지휘·보고 계통의 일관성과 관련된다','분업·전문화가 강화되면 부서 간 조정의 필요성은 항상 사라진다','계층제는 권한·책임의 상하 단계와 관련된다'],a:2,
    choiceExplanations:['옳은 설명이다.','옳은 설명이다.','정답. 분업이 강화되면 오히려 분화된 활동을 연결하는 조정 필요성이 커질 수 있다.','옳은 설명이다.']
  },
  {
    id:'119-v13-org-mgmt-11',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'high',type:'권한책임형',source:M,examStyle:true,questionClass:'exam-style',
    q:'권한과 책임의 관계에 대한 설명으로 가장 적절한 것은?',
    choices:['업무수행에 필요한 권한과 결과에 대한 책임이 가능한 한 대응하도록 설계한다','책임만 부여하고 권한은 주지 않는 것이 가장 효율적이다','권한만 부여하고 결과에 대한 책임은 두지 않는 것이 원칙이다','권한과 책임은 조직설계에서 서로 관련이 없다'],a:0,
    choiceExplanations:['정답. 권한과 책임의 대응은 조직운영의 기본 원리다.','필요한 권한이 없으면 맡은 책임을 수행하기 어렵다.','권한 행사에는 그에 상응하는 책임이 필요하다.','두 요소는 밀접하게 관련된다.']
  },
  {
    id:'119-v13-org-mgmt-12',grade:'B',subject:'fire',scopeId:'F01',conceptId:'F01-C07',difficulty:'high',type:'종합형',source:M,examStyle:true,questionClass:'exam-style',
    q:'조직관리 원리와 핵심 의미의 연결이 모두 옳은 것은?',
    choices:['계층제-상하 단계 / 명령통일-지휘선 일관성 / 통솔범위-직접 감독 범위 / 조정-분화 활동의 연결','계층제-직접 감독 범위 / 명령통일-기능별 분업 / 통솔범위-상하 단계 / 조정-단일상관 원칙','계층제-기능별 전문화 / 명령통일-부서 통합 / 통솔범위-권한 폐지 / 조정-감독 인원수','계층제-책임 폐지 / 명령통일-상관 다원화 / 통솔범위-조직목표 제거 / 조정-부서 고립'],a:0,
    choiceExplanations:['정답. 네 원리를 정확히 연결했다.','각 원리의 정의가 뒤섞여 있다.','각 원리의 핵심과 일치하지 않는다.','모두 조직관리 원리와 반대되는 설명이다.']
  }
];
const seen=new Set(V.questions.map(x=>x.id));
for(const q of rows)if(!seen.has(q.id))V.questions.push(q);
V.questionById=Object.fromEntries(V.questions.map(q=>[q.id,q]));
V.questionsForConcept=id=>V.questions.filter(q=>q.conceptId===id);
V.FireAdminSplitQuestions119={version:'119-fire-admin-split-questions-v1',added:rows.length,history:12,organizationTheory:12};
})();