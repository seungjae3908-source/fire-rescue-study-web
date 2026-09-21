'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored,C=V.curriculum?.byId,E=V.StudyEmphasis119;if(!P||!C||!E)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=a=>{const out=[],seen=new Set();for(const x of a||[]){const t=norm(x),k=t.toLowerCase();if(t&&!seen.has(k)){seen.add(k);out.push(t)}}return out};
const cond=/경우|때\b|하면|있으면|의심|조건|접촉|유입|적용|사용|작동|발생|노출|이상|이하|미만|초과/;
const mechanism=/원리|작동|기전|과정|흐름|연쇄|흡수|억제|가압|방수|환기|압력|전달|이동|반응/;
const timing=/단계|시기|직전|직후|이전|이후|성장기|최성기|쇠퇴기|초기|순서|회복 후|소생 후/;
const warning=/전조|징후|증상|주의|위험|금지|피한다|하지 않는다|경계|불안정|쇼크/;
const beforeAfter=/이전|이후|전에는|후에는|직전|직후|발생 전|발생 후|회복 후|소생 후/;
const metaHeading=/개념\s*구조와\s*읽는\s*순서|개념\s*이해|학습\s*순서/;
function allText(p){
  // 상세 스키마는 교재형 설명 원천만 사용한다.
  // summary/features/must/traps는 핵심 탭 전용이므로 상세에 다시 주입하지 않는다.
  return uniq([
    ...(p.detail||[]),...(p.flow||[]),
    ...(p.deepSections||[]).flatMap(s=>[metaHeading.test(String(s.title||''))?'':s.title,s.body,...(s.bullets||[])])
  ]);
}
function pick(rows,re,n=4){return rows.filter(x=>re.test(x)).slice(0,n)}
function build(id){
  const p=P[id],c=C[id];if(!p||p.status!=='verified'||!c)return null;
  const rows=allText(p),deep=p.deepSections||[],mechanismSections=deep.filter(s=>mechanism.test(String(s.title||''))).map(s=>norm(s.body)).filter(Boolean);
  const conditions=uniq(pick(rows,cond,5));
  const mechanisms=uniq([...(p.flow||[]),...mechanismSections,...pick(rows,mechanism,5)]).slice(0,6);
  const timingStages=uniq(pick(rows,timing,5));
  const warnings=uniq(pick(rows,warning,6)).slice(0,6);
  const beforeAfterRows=uniq(pick(rows,beforeAfter,4));
  const numbers=E.numberRows(p,10);
  const definition=norm((p.detail||[])[0]||p.summary||'');
  const easy=norm(p.summary||definition);
  const schema={
    id,
    title:c.title,
    quick30:easy,
    definition,
    easy,
    features:E.featureRows(p,6),
    core:E.mustRows(p,8),
    conditions,
    mechanisms,
    timingStages,
    warningSigns:warnings,
    beforeAfter:beforeAfterRows,
    numbers,
    exceptions:E.trapRows(p,6),
    comparison:(p.compare||[]).slice(),
    visuals:uniq(p.visuals||[]),
    calculations:(p.calculations||[]).slice(),
    source:p.source||'',
    sourceRanges:(c.sourceRanges||[]).slice(),
    evidence:E.evidence(id,p),
    applicability:{
      conditions:conditions.length>0,
      mechanisms:mechanisms.length>0,
      timingStages:timingStages.length>0,
      warningSigns:warnings.length>0,
      beforeAfter:beforeAfterRows.length>0,
      numbers:numbers.length>0,
      comparison:(p.compare||[]).length>=2,
      visuals:(p.visuals||[]).length>0,
      calculations:(p.calculations||[]).length>0
    }
  };
  p.studySchema=schema;return schema
}
const schemas={};
function refresh(id){const x=build(id);if(x)schemas[id]=x;else delete schemas[id];return x}
function refreshAll(){for(const c of V.curriculum?.concepts||[])refresh(c.id);return schemas}
refreshAll();
V.Quality2StudySchema119={
  version:'119-quality2-study-schema-v2',
  schemas,
  get:id=>refresh(id),
  refreshAll,
  policy:'all fields are selected only from the current verified concept pack through StudyEmphasis119 and its official source anchors; non-applicable categories remain empty instead of inventing content'
};
})();