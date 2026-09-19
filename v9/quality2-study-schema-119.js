'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{},P=V.contentPacks?.authored,C=V.curriculum?.byId;if(!P||!C)return;
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=a=>{const out=[],seen=new Set();for(const x of a||[]){const t=norm(x),k=t.toLowerCase();if(t&&!seen.has(k)){seen.add(k);out.push(t)}}return out};
const numeric=/\d|%|℃|°C|kg|g\b|mg|mL|\bL\b|mmHg|cm|mm|m\b|초|분|시간|회|배|쪽|년|개월|J\/kg|kW/;
const cond=/경우|때\b|하면|있으면|의심|조건|접촉|유입|적용|사용|작동|발생|노출|이상|이하|미만|초과/;
const mechanism=/원리|작동|기전|과정|흐름|연쇄|흡수|억제|가압|방수|환기|압력|전달|이동|반응/;
const timing=/단계|시기|직전|직후|이전|이후|성장기|최성기|쇠퇴기|초기|순서|회복 후|소생 후/;
const warning=/전조|징후|증상|주의|위험|금지|피한다|하지 않는다|경계|불안정|쇼크/;
const beforeAfter=/이전|이후|전에는|후에는|직전|직후|발생 전|발생 후|회복 후|소생 후/;
function allText(p){
  return uniq([
    ...(p.detail||[]),...(p.features||[]),...(p.must||[]),...(p.traps||[]),...(p.flow||[]),
    ...(p.deepSections||[]).flatMap(s=>[s.title,s.body,...(s.bullets||[])])
  ]);
}
function pick(rows,re,n=4){return rows.filter(x=>re.test(x)).slice(0,n)}
function build(id){
  const p=P[id],c=C[id];if(!p||p.status!=='verified'||!c)return null;
  const rows=allText(p),deep=p.deepSections||[],mechanismSections=deep.filter(s=>mechanism.test(String(s.title||''))).map(s=>norm(s.body)).filter(Boolean);
  const conditions=uniq(pick(rows,cond,5));
  const mechanisms=uniq([...(p.flow||[]),...mechanismSections,...pick(rows,mechanism,5)]).slice(0,6);
  const timingStages=uniq(pick(rows,timing,5));
  const warnings=uniq([...(p.traps||[]),...pick(rows,warning,5)]).slice(0,6);
  const beforeAfterRows=uniq(pick(rows,beforeAfter,4));
  const numbers=uniq(rows.filter(x=>numeric.test(x))).slice(0,10);
  const definition=norm((p.detail||[])[0]||p.summary||'');
  const easy=norm(p.summary||definition);
  const schema={
    id,
    title:c.title,
    quick30:easy,
    definition,
    easy,
    features:uniq(p.features||[]).slice(0,6),
    core:uniq(p.must||[]).slice(0,8),
    conditions,
    mechanisms,
    timingStages,
    warningSigns:warnings,
    beforeAfter:beforeAfterRows,
    numbers,
    exceptions:uniq(p.traps||[]).slice(0,6),
    comparison:(p.compare||[]).slice(),
    visuals:uniq(p.visuals||[]),
    calculations:(p.calculations||[]).slice(),
    source:p.source||'',
    sourceRanges:(c.sourceRanges||[]).slice(),
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
for(const c of V.curriculum?.concepts||[]){const x=build(c.id);if(x)schemas[c.id]=x}
V.Quality2StudySchema119={
  version:'119-quality2-study-schema-v1',
  schemas,
  get:id=>schemas[id]||null,
  policy:'all fields are selected only from the already verified concept pack and its official source anchors; non-applicable categories remain empty instead of inventing content'
};
})();