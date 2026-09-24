'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored;if(!P)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=rows=>{const out=[],seen=new Set;for(const row of rows||[]){const x=norm(row),k=x.toLowerCase();if(!x||seen.has(k))continue;seen.add(k);out.push(x)}return out};
const uniqCompare=rows=>{const out=[],seen=new Set;for(const row of rows||[]){if(!Array.isArray(row)||!row[0]||!row[1])continue;const a=norm(row[0]),b=norm(row[1]),k=a.toLowerCase().replace(/[^0-9a-z가-힣]/g,'');if(!k||seen.has(k))continue;seen.add(k);out.push([a,b])}return out};
const uniqSections=rows=>{const out=[],seen=new Set;for(const row of rows||[]){if(!row?.title||!row?.body)continue;const k=(norm(row.title)+'|'+norm(row.body)).toLowerCase();if(seen.has(k))continue;seen.add(k);out.push({...row,title:norm(row.title),body:norm(row.body),bullets:uniq(row.bullets||[])})}return out};
function refine(id,x){
  const p=P[id];if(!p||p.status!=='verified')return false;
  if(x.summary)p.summary=norm(x.summary);
  if(x.must)p.must=uniq([...(x.must||[]),...(p.must||[])]);
  if(x.traps)p.traps=uniq([...(x.traps||[]),...(p.traps||[])]);
  if(x.compare)p.compare=uniqCompare([...(x.compare||[]),...(p.compare||[])]);
  if(x.deepSections)p.deepSections=uniqSections([...(x.deepSections||[]),...(p.deepSections||[])]);
  p.v55Precision=true;return true
}
const applied=[];

if(refine('F03-C06',{
  summary:'플래시오버는 열축적에 따른 구획 전체의 급격한 연소 전이, 백드래프트는 산소부족 상태의 뜨거운 미연소가스에 공기가 유입된 뒤의 폭발적 연소, 롤오버는 상층 가연성가스의 부분적 불꽃 연소로 구분한다.',
  must:[
    '플래시오버 → 열·복사열 축적 → 여러 가연물의 급격한 연소 전이',
    '백드래프트 → 산소부족·미연소가스 축적 → 개구부 공기 유입 → 폭발적 연소',
    '롤오버 → 상층 가연성가스가 공기와 혼합 → 상층에서 부분적 불꽃 연소'
  ],
  traps:[
    '백드래프트의 핵심 조건인 산소부족과 공기유입을 플래시오버의 조건으로 바꾸지 않는다.',
    '롤오버를 구획 내 모든 가연물이 거의 동시에 연소로 전이하는 현상으로 보지 않는다.'
  ],
  compare:[
    ['플래시오버','열축적·복사열 증가 → 구획 전체 급격한 연소 전이'],
    ['백드래프트','산소부족·미연소가스 → 공기유입 뒤 폭발적 연소'],
    ['롤오버','상층 가연성가스가 부분적으로 불꽃을 내며 연소']
  ],
  deepSections:[
    {title:'판별 순서',body:'문제를 보면 먼저 열축적인지, 산소부족 뒤 공기유입인지, 상층 가연성가스의 부분연소인지 구분한다. 그다음 전조·진행양상·위험성을 대조하면 세 현상을 바꿔 낸 선지를 빠르게 걸러낼 수 있다.',bullets:[]}
  ]
}))applied.push('F03-C06');

if(refine('F07-C14',{
  summary:'소화용수설비는 화점을 직접 자동소화하는 설비가 아니라 소방대가 화재진압에 사용할 물을 확보·공급하는 기반설비로, 소화수조·저수조와 채수구·흡수관투입구의 수량·접근·흡수 조건을 함께 본다.',
  must:[
    '소화수조=소화용수 전용 / 저수조=소화용수와 일반 생활용수 겸용',
    '채수구 또는 흡수관투입구 → 소방차가 2m 이내까지 접근 가능한 위치',
    '저수량 → 연면적을 기준면적으로 나눈 수를 올림해 20㎥를 곱해 산정',
    '흡수관투입구 → 한 변 또는 직경 0.6m 이상, 소요수량 80㎥ 미만 1개 이상·80㎥ 이상 2개 이상',
    '채수구 → 원칙 2개, 40㎥ 미만 1개·100㎥ 이상 3개, 구경 65mm 이상·지면 0.5m 이상 1m 이하',
    '수조 내부바닥이 지표면에서 4.5m 이상 깊은 지하 수조 → 소요수량을 고려한 가압송수장치'
  ],
  traps:[
    '소화용수설비를 옥내·옥외소화전처럼 사람이 화점에 직접 방수하는 소화설비와 같은 것으로 보지 않는다.',
    '채수구와 흡수관투입구의 용도·개수 기준을 서로 바꾸지 않는다.'
  ],
  compare:[
    ['소화수조','소화용수 전용 수조'],
    ['저수조','소화용수 + 일반 생활용수 겸용 수조'],
    ['채수구','소방호스·흡수관을 접결하는 흡입구'],
    ['흡수관투입구','소방차 흡수관을 수조 안으로 직접 넣는 투입구'],
    ['옥내·옥외소화전','사람이 호스·관창으로 화점에 직접 방수하는 소화설비']
  ],
  deepSections:[
    {title:'저수량 산정의 기준면적',body:'소화수조·저수조의 저수량은 특정소방대상물의 연면적을 기준면적으로 나눈 수에 20㎥를 곱한다. 일반 기준면적은 12,500㎡이고, 1층과 2층 바닥면적의 합계가 15,000㎡ 이상인 특정소방대상물은 7,500㎡를 적용하며 소수점 이하는 1로 본다.',bullets:[]},
    {title:'채수구와 흡수관투입구를 구분',body:'채수구는 소방차의 소방호스·흡수관을 접결하는 흡입구이고, 흡수관투입구는 소방차 흡수관을 수조 안에 직접 넣는 투입구다. 시험에서는 이름·용도·개수 기준을 교차해 제시하는 선지를 주의한다.',bullets:[]}
  ]
}))applied.push('F07-C14');

if(refine('F02-C02',{
  summary:'재난관리책임기관은 중앙행정기관·지방자치단체와 대통령령으로 정하는 기관 등을 포함하는 넓은 재난관리 수행기관 범주이고, 재난관리주관기관은 재난·사고 유형별 예방·대비·대응·복구를 주관하도록 정한 관계 중앙행정기관이다.',
  must:[
    '재난관리책임기관 → 재난관리업무를 수행하는 넓은 기관 범주',
    '재난관리주관기관 → 특정 재난·사고 유형을 주관하는 관계 중앙행정기관',
    '주관기관의 구체적 유형별 지정 → 재난안전법 시행령 제3조의2·별표 1의3',
    '한 재난 대응에는 주관기관과 여러 책임기관이 함께 참여할 수 있다.'
  ],
  traps:[
    '재난관리책임기관과 재난관리주관기관을 같은 범주로 보지 않는다.',
    '주관기관을 모든 재난에 공통으로 하나의 기관으로 고정하지 않는다.',
    '책임기관을 중앙행정기관과 지방자치단체만으로 좁혀 외우지 않는다.'
  ],
  compare:[
    ['재난관리책임기관','재난관리업무를 수행하는 넓은 기관 범주'],
    ['재난관리주관기관','특정 재난·사고 유형의 예방·대비·대응·복구를 주관하는 관계 중앙행정기관']
  ],
  deepSections:[
    {title:'선지에서 빠르게 구분',body:'“유형별·관계 중앙행정기관”이 보이면 주관기관을, 중앙행정기관·지방자치단체·공공기관·공공단체·중요시설 관리기관 등 폭넓은 범주가 보이면 책임기관을 먼저 판단한다. 구체적 재난유형과 주관기관의 매칭은 시행령 별표 1의3 기준으로 확인한다.',bullets:[]}
  ]
}))applied.push('F02-C02');

if(refine('F05-C08',{
  summary:'위험물화재는 위험물의 류·물질성상과 저장·용기 상태를 먼저 식별한 뒤 물과의 반응성·비산·유출확대 위험을 확인하고, 냉각·질식·억제 등 필요한 소화효과와 탱크화재 특수현상을 구분해 판단한다.',
  must:[
    '판단 순서 → 위험물 류·물질성상 → 저장·용기·누출 상태 → 물과의 반응성·비산 위험 → 적합한 소화수단',
    '위험물은 류별·품목별 성질이 달라 “모두 물 금지” 또는 “모두 같은 소화약제”로 일반화하지 않는다.',
    '탱크·유류화재의 보일오버·슬롭오버·프로스오버는 물의 위치와 발생조건을 구분한다.'
  ],
  traps:[
    '위험물이라는 이유만으로 모든 화재에 같은 소화방법을 적용하지 않는다.',
    '보일오버·슬롭오버·프로스오버를 단순히 “유류가 넘치는 현상” 하나로 외우지 않는다.'
  ],
  deepSections:[
    {title:'현장·시험 판단 순서',body:'먼저 위험물의 류와 물질성상을 확인하고, 용기·누출·점화원 상태와 물과의 반응성을 확인한 뒤 주수 가능 여부와 필요한 소화효과를 연결한다. 탱크화재라면 물이 어디에 존재하고 어떤 가열조건이 형성됐는지까지 확인한다.',bullets:[]}
  ]
}))applied.push('F05-C08');

V.V55PrecisionContent119={
  version:'119-v55-core-detail-precision-content-v1',
  applied,
  policy:'only reorders or sharpens facts already present in verified official-source-bound packs; no unsupported facts are introduced'
};
})();