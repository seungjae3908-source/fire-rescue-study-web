'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored,C=V.curriculum;
if(!P||!C?.concepts)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const key=s=>norm(s).toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const uniq=rows=>{const out=[],seen=new Set();for(const row of rows||[]){const t=norm(row);if(!t)continue;const k=key(t);if(!k||seen.has(k))continue;seen.add(k);out.push(t)}return out};
const concise=(s,n=150)=>{const t=norm(s);return t.length>n?t.slice(0,n-1)+'…':t};
const byScope=new Map();
for(const c of C.concepts){if(!byScope.has(c.scopeId))byScope.set(c.scopeId,[]);byScope.get(c.scopeId).push(c)}

function hardenSummary(c,p){
  if(norm(p.summary).length>=35)return;
  const source=uniq([...(p.detail||[]),...(p.deepSections||[]).map(x=>x?.body),...(p.must||[])])[0]||'';
  if(source)p.summary=concise([norm(p.summary),source].filter(Boolean).join(' · '),190);
}
function deriveFeatures(c,p){
  const candidates=uniq([
    ...(p.must||[]),
    ...(p.detail||[]),
    ...(p.deepSections||[]).flatMap(x=>[x?.body,...(x?.bullets||[])]),
    ...(p.flow||[]).map((x,i)=>(i===0?'시작·조건: ':'진행 포인트: ')+x)
  ]);
  const features=uniq([...(p.features||[]),...candidates]).slice(0,6);
  p.features=features.length>=3?features:uniq([norm(p.summary),...features,...(p.traps||[])]).slice(0,6);
}
function peerRows(c,p){
  const scope=byScope.get(c.scopeId)||[],idx=scope.findIndex(x=>x.id===c.id);
  if(scope.length<2)return[];
  const ordered=[];
  for(let d=1;d<scope.length&&ordered.length<3;d++){
    const right=scope[idx+d],left=scope[idx-d];
    if(right)ordered.push(right);if(left&&ordered.length<3)ordered.push(left)
  }
  const rows=[[c.title,concise(p.summary||p.must?.[0]||'',145)]];
  for(const peer of ordered){
    const pp=P[peer.id];if(!pp)continue;
    rows.push([peer.title,concise(pp.summary||pp.must?.[0]||pp.detail?.[0]||'',145)])
  }
  return rows.filter(r=>r[0]&&r[1])
}
function deriveComparison(c,p){
  // Quality 2.0 does not invent comparison partners merely because concepts are adjacent.
  // Curated semantic families are applied by quality2-comparison-families-119.js.
  if((p.compare||[]).length)return;
  p.compare=[];
}
function ensureDeep(c,p){
  p.deepSections=Array.isArray(p.deepSections)?p.deepSections:[];
  if(p.deepSections.length>=3)return;
  const sections=[];
  const detail=uniq(p.detail||[]);
  if(detail[0])sections.push({title:'정의 · 핵심원리',body:detail[0],bullets:[]});
  if(detail[1])sections.push({title:'작동 · 진행과정',body:detail[1],bullets:[]});
  if((p.must||[]).length)sections.push({title:'시험에서 잡아야 할 핵심',body:uniq(p.must).join(' · '),bullets:[]});
  if((p.traps||[]).length)sections.push({title:'헷갈림 방지',body:uniq(p.traps).join(' · '),bullets:[]});
  for(const s of sections){
    if(p.deepSections.length>=3)break;
    if(!p.deepSections.some(x=>key(x?.body)===key(s.body)))p.deepSections.push(s)
  }
}
function ensureMustTrap(c,p){
  p.must=uniq(p.must||[]);
  p.traps=uniq(p.traps||[]);
  const source=uniq([...(p.detail||[]),...(p.deepSections||[]).map(x=>x?.body)]);
  while(p.must.length<3&&source.length)p.must.push(source.shift());
  if(!p.traps.length&&p.compare?.length>=2)p.traps.push((p.compare[0][0]||'현재 개념')+'과(와) '+(p.compare[1][0]||'비교 개념')+'의 조건·대상·작동원리를 서로 바꾼 선지에 주의한다.');
}
for(const c of C.concepts){
  const p=P[c.id];if(!p||p.status!=='verified')continue;
  p.detail=uniq(p.detail||[]);p.compare=Array.isArray(p.compare)?p.compare:[];p.flow=Array.isArray(p.flow)?p.flow:[];
  hardenSummary(c,p);
  ensureDeep(c,p);
  ensureMustTrap(c,p);
  deriveFeatures(c,p);
  deriveComparison(c,p);
  ensureMustTrap(c,p);
}

function extendTextbook(id,detailRows=[],sections=[]){
  const p=P[id];if(!p)return;
  p.detail=uniq([...(p.detail||[]),...detailRows]);
  p.deepSections=[...(p.deepSections||[]),...sections.filter(s=>s?.body&&!p.deepSections?.some(x=>key(x?.body)===key(s.body)))];
}
extendTextbook('F07-C10',[
  '분말소화설비는 저장된 분말소화약제를 가압가스로 이송하여 배관과 분사헤드를 통해 방호대상에 방출하는 고정식 소화설비로, 약제의 종별 적응화재와 방출계통을 함께 이해해야 한다.',
  '분말은 화염의 연쇄반응을 억제하는 효과가 크고 빠른 소화가 가능하지만 냉각효과가 상대적으로 작아 재발화 가능성과 방출 후 잔류물의 영향을 함께 고려한다.'
],[
  {title:'구성과 약제 이송',body:'저장용기, 가압가스 계통, 선택밸브·기동장치, 배관과 분사헤드가 연결되어 약제를 필요한 구역으로 이송한다. 시험에서는 저장용기와 가압용 가스, 방출배관의 역할을 서로 바꾸지 않는 것이 중요하다.',bullets:[]},
  {title:'소화효과와 한계',body:'분말소화약제는 화학적 연쇄반응 억제에 강점이 있지만 방출 후 시야저하와 잔류물, 냉각 부족에 따른 재발화 가능성을 고려해야 한다. 따라서 “빠르게 꺼진다”와 “재발화 위험이 없다”를 같은 뜻으로 보면 안 된다.',bullets:[]},
  {title:'종별 적응화재',body:'제1·2·4종은 BC계 분말, 제3종은 제1인산암모늄을 주성분으로 하는 ABC계 분말이라는 구분을 설비의 적응화재와 연결해 기억한다.',bullets:[]}
]);
extendTextbook('F07-C16',[
  '스프링클러설비의 각 구성요소는 독립적으로 존재하지 않고 수원에서 헤드까지 물을 공급하고, 압력·유수 변화를 이용해 펌프와 경보가 연동되도록 하나의 계통을 이룬다.',
  '시험에서는 수원·가압송수장치·유수검지장치·배관·헤드·송수구·경보계통을 “물의 이동”과 “신호의 이동” 두 흐름으로 나누어 이해하면 작동순서가 명확해진다.'
],[
  {title:'물의 이동 경로',body:'화재 시 필요한 물은 수원에서 가압송수장치를 거쳐 배관과 밸브류를 지나 작동한 헤드로 공급된다. 소방대가 사용하는 송수구는 필요한 경우 외부에서 설비 계통으로 물을 보충하는 연결점이라는 관점으로 구분한다.',bullets:[]},
  {title:'신호와 경보의 흐름',body:'헤드 개방과 방수로 유수·압력 상태가 변하면 유수검지와 경보 계통이 작동하고 가압송수장치 운전에 필요한 신호와 연결된다. 감지기·헤드·유수검지장치는 모두 “감지”와 관계되지만 감지 대상과 역할이 서로 다르다.',bullets:[]},
  {title:'유지관리 관점',body:'수원 부족, 밸브 폐쇄, 펌프 불능, 배관 막힘, 헤드 손상처럼 계통 어느 한 부분의 문제가 실제 방수성능을 떨어뜨릴 수 있으므로 구성요소를 단순 명칭암기가 아니라 연속된 시스템으로 본다.',bullets:[]}
]);
extendTextbook('F07-C19',[
  '준비작동식은 감지설비가 화재를 먼저 확인해 준비작동밸브를 열고 2차측 배관을 충수한 뒤, 실제 열을 받은 폐쇄형 헤드가 개방되어야 그 지점에서 방수가 시작되는 구조다.',
  '이중의 작동관계를 이용하므로 평상시 배관의 우발적 파손이나 헤드 손상만으로 즉시 물이 방출되는 위험을 줄이는 데 유리하지만 감지설비와 밸브의 정상상태가 중요하다.'
],[
  {title:'감지와 방수의 두 조건',body:'감지기 작동은 준비작동밸브를 열어 배관을 물이 나갈 준비상태로 만드는 단계이고, 폐쇄형 헤드의 감열개방은 실제 방수지점을 결정하는 단계다. 두 사건을 하나로 합쳐 외우면 일제살수식과 혼동하기 쉽다.',bullets:[]},
  {title:'평상시와 화재시 상태',body:'평상시 2차측은 물이 차 있지 않은 상태로 유지되고, 화재 감지 후 밸브가 열리면 충수된다. 이후 열을 받은 헤드가 열리면서 해당 위치에서 방수된다.',bullets:[]},
  {title:'고장·오동작 관점',body:'감지설비가 작동하지 않거나 준비작동밸브가 열리지 않으면 배관 충수가 지연될 수 있고, 반대로 감지기 신호만으로 모든 헤드가 동시에 방수되는 것은 아니다. 이 구분이 대표 시험함정이다.',bullets:[]}
]);
extendTextbook('F07-C20',[
  '일제살수식은 개방형 헤드를 설치하고 별도 감지설비가 화재를 감지하면 일제개방밸브가 열리면서 방호구역의 개방형 헤드에서 동시에 물이 방출되는 방식이다.',
  '빠르게 확대될 수 있는 위험에 짧은 시간 안에 넓은 구역으로 많은 물을 방출하는 목적이 강하므로 준비작동식의 “폐쇄형 헤드 개별방수”와 구조·목적을 함께 비교해야 한다.'
],[
  {title:'개방형 헤드의 의미',body:'헤드 자체의 감열부가 하나씩 열리는 방식이 아니라 방수구가 평상시부터 개방되어 있기 때문에 일제개방밸브가 열리면 연결된 헤드에서 동시에 방수가 이루어진다.',bullets:[]},
  {title:'감지설비와 밸브',body:'화재를 인식하는 역할은 별도 감지설비가 담당하고, 실제 급수 개시는 일제개방밸브가 담당한다. 감지기·밸브·개방형 헤드의 역할을 각각 구분해야 작동순서를 정확히 이해할 수 있다.',bullets:[]},
  {title:'준비작동식과 비교',body:'두 방식 모두 감지설비와 밸브 연동을 사용하지만 준비작동식은 폐쇄형 헤드가 실제 열을 받아 개방된 지점에서 방수하고, 일제살수식은 개방형 헤드가 설치된 방호구역에서 동시에 방수한다.',bullets:[]}
]);
extendTextbook('F07-C21',[
  '스프링클러 헤드는 열에 반응하는 감열부, 물이 통과하는 오리피스, 물을 일정한 형태로 분산시키는 디플렉터 등으로 구성되며 각 부품의 역할을 연결해서 이해해야 한다.',
  '폐쇄형 헤드는 감열부가 설정된 조건에 도달하면 방수구가 열리지만 개방형 헤드는 평상시부터 방수구가 열려 있으므로 별도 밸브·감지계통과의 관계가 다르다.'
],[
  {title:'감열부와 표시온도',body:'감열부는 주변의 화재열을 받아 작동하며 헤드의 표시온도는 사용환경과 관련된 중요한 구분기준이다. 단순히 실내온도가 표시온도에 순간 도달했다고 모든 헤드가 같은 시간에 작동한다고 이해해서는 안 된다.',bullets:[]},
  {title:'오리피스와 디플렉터',body:'오리피스는 헤드로 방출되는 물의 통로가 되고 디플렉터는 나온 물을 충돌·분산시켜 방호대상에 필요한 살수패턴을 형성한다. 두 부품의 기능을 바꾸는 선지를 주의한다.',bullets:[]},
  {title:'반응특성과 설치환경',body:'헤드의 반응은 감열부의 열응답 특성뿐 아니라 설치 위치와 천장 주변의 열기류 영향도 받는다. 시험에서는 일반형·조기반응형 같은 반응특성과 폐쇄형·개방형의 구조적 구분을 섞지 않는 것이 중요하다.',bullets:[]}
]);

V.Quality2GlobalContent119={
  version:'119-quality2-global-content-v1',
  concepts:C.concepts.length,
  featureReady:C.concepts.filter(c=>(P[c.id]?.features||[]).length>=3).length,
  comparisonReady:C.concepts.filter(c=>(P[c.id]?.compare||[]).length>=2).length,
  policy:'features/must/deep content are derived only from the same verified pack; comparisons are supplied only by authored content or curated semantic comparison families'
};
})();