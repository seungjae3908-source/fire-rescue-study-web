const EXAM_2026 = {
  version: '2026.01.26-change',
  title: '2026년 소방공무원 채용시험 시행계획 변경공고',
  field: '구급 경력경쟁채용',
  minutes: 65,
  totalQuestions: 65,
  subjects: [
    { id: 'fire', name: '소방학개론', questions: 25, points: 100 },
    { id: 'ems', name: '응급처치학개론', questions: 40, points: 100 }
  ],
  cprStandard: '2020년 한국심폐소생술 가이드라인',
  sourceUrl: 'https://gfsa.gwd.go.kr/egf/bp/board/article/download?fileSeq=1245823#page=16',
  sourceLabel: '소방청 공고 제2026-8호 · PDF p.16',
  lockedAt: '2026-09-16'
};

const OFFICIAL_SCOPE_2026 = [
  {
    subject: '소방학개론', grade: 'A', source: '소방공무원 임용령 별표 3/별표 5',
    sourceUrl: 'https://www.law.go.kr/법령/소방공무원임용령',
    domains: [
      { id: 'F-ORG', title: '소방조직', status: 'official' },
      { id: 'F-DISASTER', title: '재난관리', status: 'official' },
      { id: 'F-FIRE', title: '연소·화재이론', status: 'official' },
      { id: 'F-EXT', title: '소화이론', status: 'official' }
    ]
  },
  {
    subject: '응급처치학개론', grade: 'A', source: '소방공무원 임용령 별표 5',
    sourceUrl: 'https://www.law.go.kr/법령/소방공무원임용령',
    domains: [
      { id: 'E-TOTAL', title: '전문응급처치학총론', status: 'official' },
      { id: 'E-CLINICAL', title: '전문응급처치학개론', status: 'official' }
    ]
  }
];

const EMS_CHAPTER_INDEX_2026 = [
  ['E01','응급의료개론'],['E02','소방대원 안녕'],['E03','감염방지·개인보호장비'],
  ['E04','해부생리학·무선통신·기록·응급의료장비'],['E05','응급의료에 관한 법률'],
  ['E06','환자평가'],['E07','기도유지'],['E08','호흡곤란'],['E09','응급 심장질환'],
  ['E10','급성복통'],['E11','출혈과 쇼크'],['E12','연부조직 손상'],['E13','근골격계 손상'],
  ['E14','머리와 척추손상'],['E15','의식장애'],['E16','중독 및 알레르기 반응'],
  ['E17','노인'],['E18','행동응급'],['E19','환경응급'],['E20','산부인과'],['E21','소아'],['E22','기본소생술']
].map(([id,title]) => ({ id, title, grade:'B', status:'page-index-pending' }));

const OFFICIAL_SOURCE_REGISTRY_2026 = [
  {
    id:'SRC-EXAM-2026', grade:'A', org:'소방청',
    title:'2026년 소방공무원 채용시험 시행계획 변경공고',
    published:'2026-01-26',
    url:'https://www.nfa.go.kr/nfa/news/notice/?cntId=734&mode=view&pageIdx=2',
    detail:'구급 경채 65분·65문항, 소방학개론 25 + 응급처치학개론 40, 2020 CPR 가이드라인 기준'
  },
  {
    id:'SRC-TACTICS3-2026', grade:'A', org:'중앙소방학교',
    title:'2026년 공통교재 [소방전술3] · 13. 소방전술3(구급)-저용량.pdf',
    published:'2026-03-17',
    url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',
    detail:'중앙소방학교 공식 구급 교재 · 게시 페이지 공공누리 제1유형 표시'
  },
  {
    id:'SRC-LAW-SCOPE', grade:'A', org:'국가법령정보센터',
    title:'소방공무원 임용령 · 채용 필기시험과목 및 범위',
    published:'current',
    url:'https://www.law.go.kr/법령/소방공무원임용령',
    detail:'소방학개론 4대 영역, 응급처치학개론 2대 영역의 법정 시험범위 확인'
  }
];

const OFFICIAL_2026_QUESTIONS = [
  {
    id:'official-2026-001',subject:'시험안내',chapter:'구급 경채',concept:'문항구성',sourceType:'official',grade:'A',
    q:'2026년 구급 경력경쟁채용 필기시험의 문항 구성으로 옳은 것은?',
    choices:['소방학개론 25문항 + 응급처치학개론 40문항','소방학개론 40문항 + 응급처치학개론 25문항','응급처치학개론 65문항 단일과목','소방학개론 25문항 + 소방관계법규 40문항'],
    a:0, ex:'2026 변경공고의 구급 경채는 소방학개론 25문항, 응급처치학개론 40문항으로 총 65문항이다.',
    sourceLabel:'소방청 공고 제2026-8호 PDF p.16'
  },
  {
    id:'official-2026-002',subject:'시험안내',chapter:'구급 경채',concept:'시험시간',sourceType:'official',grade:'A',
    q:'2026년 구급 경력경쟁채용 필기시험 시간으로 옳은 것은?',
    choices:['50분','60분','65분','75분'],a:2,
    ex:'경채 필기시험은 10:00~11:05, 총 65분으로 공고됐다.',sourceLabel:'소방청 공고 제2026-8호 PDF p.16'
  },
  {
    id:'official-2026-003',subject:'시험안내',chapter:'구급 경채',concept:'CPR 기준',sourceType:'official',grade:'A',
    q:'2026년 공고에서 필기시험 심폐소생술 가이드라인 기준으로 명시한 것은?',
    choices:['2015년 한국심폐소생술 가이드라인','2020년 한국심폐소생술 가이드라인','2025년 ERC 가이드라인','최신 AHA 가이드라인 자동 적용'],a:1,
    ex:'변경공고에는 심폐소생술 가이드라인을 2020년 한국심폐소생술 가이드라인 기준으로 한다고 명시돼 있다.',sourceLabel:'소방청 공고 제2026-8호 PDF p.16'
  },
  {
    id:'official-2026-004',subject:'소방학개론',chapter:'공식 출제범위',concept:'4대 영역',sourceType:'official',grade:'A',
    q:'소방공무원 임용령에서 정한 소방학개론 분야에 포함되지 않는 것은?',
    choices:['소방조직','재난관리','연소·화재이론','응급의료개론'],a:3,
    ex:'법정 소방학개론 범위는 소방조직, 재난관리, 연소·화재이론, 소화이론이다.',sourceLabel:'소방공무원 임용령 별표 3/별표 5'
  },
  {
    id:'official-2026-005',subject:'응급처치학개론',chapter:'공식 출제범위',concept:'2대 영역',sourceType:'official',grade:'A',
    q:'소방공무원 임용령 별표 5에서 정한 응급처치학개론 시험범위 조합으로 옳은 것은?',
    choices:['전문응급처치학총론 + 전문응급처치학개론','응급의료법 + 소방학개론','기초간호학 + 공중보건학','해부학 + 약리학만'],a:0,
    ex:'응급처치학개론은 전문응급처치학총론, 전문응급처치학개론 분야로 규정돼 있다.',sourceLabel:'소방공무원 임용령 별표 5'
  },
  {
    id:'official-2026-006',subject:'시험안내',chapter:'필기합격',concept:'최저점',sourceType:'official',grade:'A',
    q:'2026 공고상 필기시험 합격자 결정에 필요한 과목별 최소 득점 기준은?',
    choices:['각 과목 20% 이상','각 과목 30% 이상','각 과목 40% 이상','각 과목 60% 이상'],a:2,
    ex:'필기시험은 매 과목 40% 이상이 기본 요건으로 제시돼 있다. 총점 요건도 별도로 적용된다.',sourceLabel:'소방청 공고 제2026-8호 PDF p.17'
  }
];

function allQuestions(){
  return [...SEED_QUESTIONS, ...OFFICIAL_2026_QUESTIONS, ...state.generatedQuestions];
}

function scopeProgress(subject){
  const qs = allQuestions().filter(q=>q.subject===subject || (subject==='응급처치학개론' && q.subject==='시험안내' && q.concept==='CPR 기준'));
  const tried = qs.filter(q=>q.id in state.answers).length;
  return { total: qs.length, tried };
}

function knowledgeMapHTML(){
  return OFFICIAL_SCOPE_2026.map(group=>{
    const p=scopeProgress(group.subject);
    return `<section class="card scope-card"><div class="row"><div><div class="tiny muted">A 공식 시험범위</div><h3>${esc(group.subject)}</h3></div><span class="spacer"></span>${trust('A')}</div><div class="progress"><i style="width:${p.total?Math.round(p.tried/p.total*100):0}%"></i></div><p class="tiny muted">공식범위 확인문제 ${p.tried}/${p.total}</p><div class="scope-domain-grid">${group.domains.map(d=>`<div class="scope-domain"><b>${esc(d.title)}</b><span class="tag a">A 범위확정</span></div>`).join('')}</div><a class="btn small ghost" target="_blank" rel="noopener" href="${group.sourceUrl}">법령 원문 확인</a></section>`;
  }).join('');
}

function emergencyIndexHTML(){
  return `<div class="chapter-grid">${EMS_CHAPTER_INDEX_2026.map(c=>`<div class="chapter-node"><span class="tiny muted">${c.id}</span><b>${esc(c.title)}</b><span class="tag b">B 페이지검증 대기</span></div>`).join('')}</div>`;
}

const _studyBase2026 = study;
study = function(){
  const base = _studyBase2026();
  const insert = `<div class="section-title"><h2>2026 공식 지식지도</h2><span>공고·법령으로 잠근 최상위 범위</span></div><div class="grid study-grid">${knowledgeMapHTML()}</div><div class="section-title"><h2>응급처치 세부 인덱스</h2><span>원문 페이지 매핑 전에는 B등급 유지</span></div><div class="card"><p class="muted tiny">아래 세부단원은 2026 구급 교재 체계와 대조 중입니다. 공식 PDF 페이지가 연결되기 전까지 A등급으로 승격하지 않습니다.</p>${emergencyIndexHTML()}</div>`;
  return base.replace('<div class="section-title"><h2>암기카드</h2>', insert+'<div class="section-title"><h2>암기카드</h2>');
};

resources = function(){
  return shell(`<div class="page"><div class="pagehead"><div><h1>공식자료 · 범위 잠금</h1><p>2026 구급 경채 기준 · 변경공고 우선 · 원문 직접 연결</p></div></div>
    <section class="hero scope-lock"><div class="eyebrow">OFFICIAL SCOPE LOCK</div><h1>${EXAM_2026.minutes}분 · ${EXAM_2026.totalQuestions}문항</h1><p>${EXAM_2026.subjects.map(s=>`${s.name} ${s.questions}문항`).join(' + ')} · CPR 기준: ${EXAM_2026.cprStandard}</p><div class="hero-actions"><a class="btn primary" target="_blank" rel="noopener" href="${EXAM_2026.sourceUrl}">공고 PDF p.16 열기</a></div></section>
    <div class="section-title"><h2>공식 시험범위</h2><span>A등급</span></div><div class="grid study-grid">${knowledgeMapHTML()}</div>
    <div class="section-title"><h2>공식 출처 레지스트리</h2><span>버전·기관·날짜를 고정</span></div>${OFFICIAL_SOURCE_REGISTRY_2026.map(s=>`<div class="card source-card" style="margin-top:10px"><div class="row"><div><div class="tiny muted">${esc(s.org)} · ${esc(s.published)}</div><h3>${esc(s.title)}</h3></div><span class="spacer"></span>${trust(s.grade)}</div><p class="muted">${esc(s.detail)}</p><a class="btn small ghost" href="${s.url}" target="_blank" rel="noopener">원문 열기</a></div>`).join('')}
    <div class="section-title"><h2>응급처치 교재 세부 인덱스</h2><span>페이지 근거 연결 진행 중</span></div><div class="card">${emergencyIndexHTML()}</div>
  </div>`);
};
