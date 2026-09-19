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
  if((p.compare||[]).length)return;
  const rows=peerRows(c,p);
  if(rows.length>=2){p.compare=rows;p.compareDerived='same-scope-neighbor-summary'}
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
V.Quality2GlobalContent119={
  version:'119-quality2-global-content-v1',
  concepts:C.concepts.length,
  featureReady:C.concepts.filter(c=>(P[c.id]?.features||[]).length>=3).length,
  comparisonReady:C.concepts.filter(c=>(P[c.id]?.compare||[]).length>=2).length,
  policy:'features/must/deep content are derived only from the same verified pack; fallback comparisons use neighboring concepts in the same official scope'
};
})();