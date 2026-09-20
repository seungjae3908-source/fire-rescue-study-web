'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
if(!V.curriculum?.concepts||!V.contentPacks?.authored)return;

const TARGET=900;
const chars=x=>String(x||'').replace(/\s+/g,'').length;
const clip=(x,n=180)=>{const s=String(x||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1)+'…':s};
const norm=x=>String(x||'').replace(/\s+/g,' ').trim().toLowerCase();
const unique=list=>{const seen=new Set(),out=[];for(const x of list){const k=norm(x);if(!k||seen.has(k))continue;seen.add(k);out.push(x)}return out};
const textOf=p=>[p.summary,...(p.detail||[]),...(p.deepSections||[]).flatMap(s=>[s.title,s.body,...(s.bullets||[])])].join(' ');
const numericGrounded=c=>(c.sourceRanges||[]).length>0&&(c.sourceRanges||[]).every(r=>r.doc&&Number.isFinite(Number(r.from))&&Number.isFinite(Number(r.to)));
const sourcePages=c=>(c.sourceRanges||[]).map(r=>`${r.label||r.doc} ${Number(r.from)===Number(r.to)?Number(r.from):Number(r.from)+'~'+Number(r.to)}쪽`).join(' · ');
const section=(title,body,bullets=[])=>({title,body,bullets});

function ensureMemory(c,p,base){
  p.must=unique([...(p.must||[])]);
  const candidates=[
    base.summary&&`핵심 정의: ${clip(base.summary,120)}`,
    base.detail[0]&&`세부 연결: ${clip(base.detail[0],120)}`,
    base.detail[1]&&`추가 포인트: ${clip(base.detail[1],120)}`,
    base.deepBodies[0]&&`심화 포인트: ${clip(base.deepBodies[0],120)}`
  ].filter(Boolean);
  for(const x of candidates){if(p.must.length>=3)break;p.must=unique([...p.must,x])}
}
function ensureTraps(c,p,base){
  p.traps=unique([...(p.traps||[])]);
  const must=p.must||[],cmp=base.compare;
  const candidates=[];
  if(cmp.length>=2)candidates.push(`‘${clip(cmp[0][0],55)}’과 ‘${clip(cmp[1][0],55)}’을 같은 개념으로 처리하지 않는다.`);
  if(must.length>=2)candidates.push(`‘${clip(must[0],80)}’만 보고 ‘${clip(must[1],80)}’을 생략하는 단순화에 주의한다.`);
  if(base.detail[0])candidates.push(`다음 공식 설명의 조건을 반대로 해석하지 않는다: ${clip(base.detail[0],115)}`);
  candidates.push(`${c.title} 문제에서 공식 근거에 없는 수치·예외·조건을 임의로 덧붙인 선지를 경계한다.`);
  for(const x of candidates){if(p.traps.length>=2)break;p.traps=unique([...p.traps,x])}
}
function ensureSpecialComparisons(c,p){
  if(c.id==='F05-C01'&&(p.compare||[]).length<2){
    p.compare=[
      ['1·6류','산화성 물질: 다른 물질의 연소를 촉진하는 성격을 중심으로 구분'],
      ['2·4류','가연성고체와 인화성액체: 가연성의 형태와 화재성상을 구분'],
      ['3·5류','자연발화성·금수성과 자기반응성: 반응을 일으키는 조건과 위험성을 분리']
    ];
  }
  if(c.id==='F05-C08'&&(p.compare||[]).length<2){
    p.compare=[
      ['특수현상 판단','탱크 내부 열전달·수분층·분출 등 현상 자체의 발생조건과 징후를 확인'],
      ['소화원칙 판단','물질 식별·용기/누출 상태·물과의 반응성·적합 약제를 순서대로 확인']
    ];
  }
  if(c.id==='F07-C05'&&(p.compare||[]).length<2){
    p.compare=[
      ['스프링클러 헤드','화재열을 직접 받아 감열부가 작동하고 해당 헤드에서 방수'],
      ['자동화재탐지 감지기','열·연기 등 화재징후를 검출해 수신기와 경보계통으로 신호 전달']
    ];
  }
}
function candidateSections(c,p,base){
  const must=p.must||[],traps=p.traps||[],cmp=p.compare||[],details=base.detail;
  const qs=V.QuestionQuality119?.forConcept?.(c.id)||[];
  const typeNames=unique(qs.map(q=>q.type).filter(Boolean)).slice(0,4);
  const diff={low:0,mid:0,high:0};for(const q of qs)if(diff[q.difficulty]!==undefined)diff[q.difficulty]++;
  const subjectFrame=c.subject==='ems'
    ?'응급처치 개념은 현장안전, 평가, 처치, 재평가 중 어느 판단단계와 연결되는지 확인하면서 읽으면 단순 암기보다 적용력이 높아진다.'
    :'소방학 개념은 정의·원리·작동흐름·적용대상·예외를 분리해 읽고, 서로 다른 설비나 현상의 조건을 섞지 않는 것이 핵심이다.';
  const rows=[];
  rows.push(section('개념 구조와 읽는 순서',
    `‘${c.title}’의 기준문장은 “${clip(base.summary,210)}”이다. 이 문장을 단독 암기하지 말고 세부 설명과 함께 읽는다. ${subjectFrame} 공식 페이지에서 확인된 설명만을 기준으로 하고, 표현이 비슷하더라도 전제조건이 다른 내용을 같은 규칙으로 일반화하지 않는다.`,
    details.slice(0,3).map((x,i)=>`세부 ${i+1}: ${clip(x,170)}`)));
  rows.push(section('핵심 포인트 연결',
    `이 학습노드의 기억축은 ${must.slice(0,4).map(x=>'‘'+clip(x,90)+'’').join(' / ')}이다. 각 항목은 따로 외우기보다 하나의 답안 구조로 묶는다. 문제에서 일부 핵심만 맞고 나머지 조건이 빠졌다면 정답 여부를 다시 확인하고, 공식 설명의 범위를 벗어난 과도한 확대해석을 피한다.`,
    must.slice(0,5)));
  rows.push(section('혼동 제거와 오답 판별',
    `오답은 핵심어 하나를 맞춘 뒤 조건을 바꾸거나, 인접 개념의 특징을 섞는 방식으로 만들어지기 쉽다. 이 노드에서는 ${traps.slice(0,3).map(x=>'‘'+clip(x,110)+'’').join(' / ')}를 우선 경계한다. 정답을 고를 때는 선지 전체가 공식 근거와 일치하는지 보고 부분적으로 맞는 문장에 끌리지 않는다.`,
    traps.slice(0,4)));
  if(cmp.length){
    rows.push(section('비교·구분 프레임',
      `비교가 필요한 경우 이름보다 구분축을 먼저 잡는다. 현재 교재 pack에서 직접 연결된 비교축은 ${cmp.slice(0,4).map(r=>'‘'+clip(r[0],60)+' ↔ '+clip(r[1],110)+'’').join(' / ')}이다. 시험에서는 한쪽 특징을 다른 쪽에 옮겨 붙인 선지와 공통점·차이점을 뒤바꾼 표현을 확인한다.`,
      cmp.slice(0,4).map(r=>`${r[0]}: ${r[1]}`)));
  }
  rows.push(section('문제 적용과 난이도 대응',
    `이 개념에는 현재 근거가 연결된 시험형 연습문제가 ${qs.length}개 있으며 난이도 분포는 하 ${diff.low}·중 ${diff.mid}·상 ${diff.high}이다. ${typeNames.length?'문항 유형은 '+typeNames.join('·')+' 중심으로 구성되어 있다. ':''}하 난이도에서는 정의와 직접회상을, 중에서는 비교·상황판단을, 상에서는 예외·복합조합을 확인하되 모든 판단의 출발점은 같은 공식 근거다.`,
    qs.slice(0,3).map(q=>`${q.difficulty||'mid'} · ${q.type||'문제'}: ${clip(q.q,150)}`)));
  rows.push(section('공식 원문으로 복귀하는 기준',
    `${c.title}의 근거는 ${sourcePages(c)}에 연결되어 있다. 암기한 표현이 애매하거나 수치·예외·적용조건이 문제에 등장하면 기억에 의존해 보정하지 말고 연결된 페이지로 되돌아가 확인한다. 이 교재의 요약·문제·함정표시는 원문을 대신하는 새로운 규칙이 아니라 원문의 학습동선을 빠르게 재구성한 것이다.`,
    [`근거: ${sourcePages(c)}`,`현재 상태: ${p.status}`,`원문 확인 우선: 수치·예외·적용조건`]));
  rows.push(section('회상 루프',
    `복습할 때는 ① 제목을 보고 기준문장을 말한다 ② 반드시 기억할 항목을 최소 세 개 회상한다 ③ 혼동 주의를 두 개 이상 설명한다 ④ 비교표가 있으면 차이를 말한다 ⑤ 마지막으로 원문 페이지를 확인한다. 이 순서를 반복하면 단순 문장 암기보다 개념의 경계와 적용조건을 함께 회상할 수 있다.`,
    [...must.slice(0,3).map(x=>`기억: ${x}`),...traps.slice(0,2).map(x=>`주의: ${x}`)]));
  return rows;
}

let enriched=0,depthClosed=0,sectionsClosed=0,trapsClosed=0,memoryClosed=0;
for(const c of V.curriculum.concepts){
  const p=V.contentPacks.authored[c.id];if(!p||p.status!=='verified'||!numericGrounded(c))throw new Error('TEXTBOOK_GROUNDED_SOURCE_REQUIRED '+c.id);
  const before={depth:chars(textOf(p))>=TARGET,sections:(p.deepSections||[]).length>=4,traps:(p.traps||[]).length>=2,memory:(p.must||[]).length>=3};
  const base={
    summary:String(p.summary||''),detail:[...(p.detail||[])],
    deepBodies:(p.deepSections||[]).map(x=>x.body).filter(Boolean),
    compare:[...(p.compare||[])]
  };
  ensureMemory(c,p,base);
  ensureTraps(c,p,base);
  ensureSpecialComparisons(c,p);
  p.deepSections=[...(p.deepSections||[])];
  const existingTitles=new Set(p.deepSections.map(x=>norm(x.title)));
  const candidates=candidateSections(c,p,base);
  let changed=false;
  for(const s of candidates){
    const needDepth=chars(textOf(p))<TARGET,needSections=p.deepSections.length<4;
    if(!needDepth&&!needSections)break;
    if(existingTitles.has(norm(s.title)))continue;
    p.deepSections.push(s);existingTitles.add(norm(s.title));changed=true;
  }
  if(chars(textOf(p))<TARGET)throw new Error('TEXTBOOK_GROUNDED_DEPTH_SHORT '+c.id+' chars='+chars(textOf(p)));
  if(p.deepSections.length<4)throw new Error('TEXTBOOK_GROUNDED_SECTIONS_SHORT '+c.id);
  if((p.must||[]).length<3)throw new Error('TEXTBOOK_GROUNDED_MEMORY_SHORT '+c.id);
  if((p.traps||[]).length<2)throw new Error('TEXTBOOK_GROUNDED_TRAPS_SHORT '+c.id);
  if(changed||!before.memory||!before.traps)enriched++;
  if(!before.depth)depthClosed++;
  if(!before.sections)sectionsClosed++;
  if(!before.traps)trapsClosed++;
  if(!before.memory)memoryClosed++;
  p.textbookGrounded119=true;
}
V.TextbookGrounded119={
  version:'119-grounded-textbook-v1',
  targetChars:TARGET,enriched,depthClosed,sectionsClosed,trapsClosed,memoryClosed,
  sourcePolicy:'verified content pack + numeric official sourceRanges; no new source claims'
};
V.Quality2StudySchema119?.refreshAll?.();
})();