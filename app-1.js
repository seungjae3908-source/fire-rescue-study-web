const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const APP_VERSION = '2.0.0';
const STORE_PREFIX = 'rescue:';
const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(STORE_PREFIX + key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(value));
  },
  del(key) {
    localStorage.removeItem(STORE_PREFIX + key);
  }
};

const OFFICIAL_SOURCES = [
  {
    title: '중앙소방학교 교재·강의자료',
    org: '중앙소방학교',
    url: 'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/',
    note: '연도별 공개 교재와 교육자료를 직접 확인하는 기본 출처'
  },
  {
    title: '소방청 채용시험 공고',
    org: '소방청',
    url: 'https://www.nfa.go.kr/nfa/news/notice/',
    note: '시험과목, 문항수, 시험시간, 응시기준 등은 해당 연도 공고를 최우선으로 확인'
  },
  {
    title: '국가법령정보센터',
    org: '법제처',
    url: 'https://www.law.go.kr/',
    note: '법령·시행령·시행규칙의 최신 원문 확인'
  }
];

const SEED_QUESTIONS = [
  {
    id: 'seed-001', subject: '응급처치학개론', chapter: '쇼크', concept: '개념 이해',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 쇼크 학습에서 가장 신뢰할 수 있는 확인 방법은?',
    choices: ['AI 답변만 외운다', '해당 시험연도 공식 자료와 원문을 확인한다', '출처 없는 요약만 본다', '오래된 자료를 최신 기준으로 가정한다'],
    a: 1,
    ex: '공식 시험범위와 기준은 해당 연도 소방청·중앙소방학교·법령 등 공식 자료를 우선해 확인해야 합니다.',
    sourceLabel: '학습 시스템 연습문제'
  },
  {
    id: 'seed-002', subject: '응급처치학개론', chapter: '학습전략', concept: '오답 분석',
    sourceType: 'practice', grade: 'D',
    q: '[연습] “확실함”을 선택했지만 틀린 문제를 별도로 관리하는 이유로 가장 적절한 것은?',
    choices: ['문제 수를 늘리기 위해', '잘못 굳어진 개념을 우선 찾아내기 위해', '시험 시간을 줄이기 위해', '오답을 숨기기 위해'],
    a: 1,
    ex: '높은 확신과 오답이 함께 나타나면 단순 실수보다 잘못된 지식이 굳어 있을 가능성을 우선 점검할 수 있습니다.',
    sourceLabel: '학습 시스템 연습문제'
  },
  {
    id: 'seed-003', subject: '소방학개론', chapter: '자료 신뢰도', concept: '출처 구분',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 이 앱에서 A 등급 자료는 무엇을 뜻하는가?',
    choices: ['AI가 임의 생성한 내용', '공식 원문에 직접 연결된 자료', '개인 메모', '출처가 확인되지 않은 참고자료'],
    a: 1,
    ex: 'A 등급은 공식 원문에 직접 연결된 자료를 의미하도록 설계했습니다.',
    sourceLabel: '앱 신뢰등급 규칙'
  },
  {
    id: 'seed-004', subject: '응급처치학개론', chapter: '필기학습', concept: '근거 확인',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 손글씨 OCR 결과를 바로 암기하기 전에 해야 할 일은?',
    choices: ['오타를 그대로 외운다', '원본 사진과 대조해 잘못 인식된 단어를 수정한다', '자동으로 삭제한다', '정답으로 확정한다'],
    a: 1,
    ex: '손글씨 OCR은 오인식 가능성이 있으므로 반드시 원본과 대조해 교정해야 합니다.',
    sourceLabel: '앱 사용 연습문제'
  },
  {
    id: 'seed-005', subject: '소방학개론', chapter: '문제은행', concept: '기출 구분',
    sourceType: 'practice', grade: 'D',
    q: '[연습] AI 예상문제를 실제 기출문제처럼 표시하면 안 되는 가장 큰 이유는?',
    choices: ['글자가 길어져서', '출처와 실제 출제 여부를 혼동하게 만들 수 있어서', '문제 수가 줄어서', '모바일 화면이 작아서'],
    a: 1,
    ex: '실제 기출, 공식 공개문제, AI 예상문제는 명확히 구분해야 학습 신뢰성을 유지할 수 있습니다.',
    sourceLabel: '앱 문제 출처 규칙'
  },
  {
    id: 'seed-006', subject: '응급처치학개론', chapter: '복습', concept: '간격 반복',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 오답 복습을 한 번만 하고 끝내는 것보다 나은 방식은?',
    choices: ['정답을 지운다', '시간 간격을 두고 다시 회상·재풀이한다', '틀린 문제를 숨긴다', '새 문제만 계속 푼다'],
    a: 1,
    ex: '시간 간격을 두고 다시 회상하는 방식은 장기 기억을 점검하는 데 유용합니다.',
    sourceLabel: '학습전략 연습문제'
  },
  {
    id: 'seed-007', subject: '응급처치학개론', chapter: '모의고사', concept: '실전 연습',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 실전 모의고사 도중 해설을 숨기는 이유는?',
    choices: ['글자를 줄이기 위해', '실제 시험처럼 판단과 시간관리를 연습하기 위해', '정답을 없애기 위해', '오답노트를 만들지 않기 위해'],
    a: 1,
    ex: '실전 모드는 시험 중 해설을 보지 않고 끝난 뒤 분석하는 흐름이 적절합니다.',
    sourceLabel: '앱 실전모드 규칙'
  },
  {
    id: 'seed-008', subject: '소방학개론', chapter: '개인정보', concept: '로컬 저장',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 이 앱의 개인 필기 기본 저장 위치는?',
    choices: ['유료 AI 서버', '사용 중인 브라우저의 로컬 저장소', '임의 공개 게시판', '소셜미디어'],
    a: 1,
    ex: '현재 버전은 로그인 없이 로컬 우선 저장을 사용합니다.',
    sourceLabel: '앱 개인정보 규칙'
  },
  {
    id: 'seed-009', subject: '응급처치학개론', chapter: 'AI 과외', concept: '불확실성',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 무료 AI가 공식 근거 없이 새로운 사실을 단정하려 할 때 앱이 취해야 할 태도는?',
    choices: ['무조건 정답으로 저장', '공식자료 확인 필요라고 표시', '실제 기출로 표시', '출처를 숨김'],
    a: 1,
    ex: '공식 근거가 없으면 불확실성을 표시하고 원문 확인을 유도하도록 설계했습니다.',
    sourceLabel: 'AI 신뢰성 규칙'
  },
  {
    id: 'seed-010', subject: '소방학개론', chapter: '시험범위', concept: '연도별 버전',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 2027 시험을 준비할 때 2026 자료를 그대로 최신 기준이라고 단정하면 안 되는 이유는?',
    choices: ['파일 크기가 커서', '시험공고·법령·가이드라인이 바뀔 수 있어서', '화면이 어두워서', '문제 수가 많아서'],
    a: 1,
    ex: '시험 준비 자료는 연도별로 버전을 잠그고 새 공고가 나오면 변경사항을 확인해야 합니다.',
    sourceLabel: '연도 버전 관리 규칙'
  },
  {
    id: 'seed-011', subject: '응급처치학개론', chapter: '필기학습', concept: '요약 검증',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 개인 필기를 AI가 요약한 뒤 가장 먼저 확인할 것은?',
    choices: ['요약 길이만 본다', '원문에서 빠지거나 왜곡된 핵심이 없는지 확인한다', '출처를 삭제한다', '모든 문장을 기출로 바꾼다'],
    a: 1,
    ex: 'AI 요약은 원문과 비교해 누락·왜곡을 확인해야 합니다.',
    sourceLabel: '앱 필기 분석 규칙'
  },
  {
    id: 'seed-012', subject: '소방학개론', chapter: '학습통계', concept: '데이터 해석',
    sourceType: 'practice', grade: 'D',
    q: '[연습] 근거 없는 “합격확률 90%”보다 더 적절한 지표는?',
    choices: ['임의 확률', '실제 정답률·오답회복·풀이시간·미학습 범위', '랜덤 점수', 'AI가 고른 숫자'],
    a: 1,
    ex: '실제 학습 로그에서 계산 가능한 지표를 보여주는 편이 더 투명합니다.',
    sourceLabel: '통계 표시 규칙'
  }
];

const state = {
  page: store.get('page', 'home'),
  profile: store.get('profile', null),
  notes: store.get('notes', []),
  wrongs: store.get('wrongs', []),
  answers: store.get('answers', {}),
  confidences: store.get('confidences', {}),
  generatedQuestions: store.get('generatedQuestions', []),
  flashcards: store.get('flashcards', []),
  examHistory: store.get('examHistory', []),
  chat: store.get('chat', [
    { role: 'assistant', content: '안녕하세요. 무료 로컬 AI가 가능한 기기에서는 AI 과외를, 불가능한 기기에서는 내 노트 근거 검색 모드를 사용합니다.' }
  ]),
  tutorMode: store.get('tutorMode', '1:1 과외'),
  bankFilter: store.get('bankFilter', 'all'),
  focusedQuestionId: null,
  ai: { engine: null, loading: false, progress: 0, text: '무료 로컬 AI 미로딩', model: null, error: '' },
  exam: null,
  importStatus: ''
};
