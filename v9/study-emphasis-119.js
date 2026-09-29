'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=arr=>{const out=[],seen=new Set();for(const raw of arr||[]){const x=norm(raw),k=x.toLowerCase();if(x&&!seen.has(k)){seen.add(k);out.push(x)}}return out};
const SERVICE_ID_RE=/(?:119|112)(?=\s*(?:안전센터|구조대|구급대|지역대|출장소|구조구급센터|종합상황실|신고|구조|구급))/g;
const NUMERIC_RE=/(?:\d+(?:[.,]\d+)?(?:\s*(?:~|–|-|:|×|\/)\s*\d+(?:[.,]\d+)?)?\s*(?:%|℃|°C|°|㎥|㎡|cm|mmHg|mm|kg\/㎠|kg|\bg\b|mg\/kg|mg|mL|L\/min|\bL\b|m\/s|\bm\b|psi|J\/kg|J|kW(?:\/㎡)?|회\/분|회|분|초|시간|일|개월|년|세|명|개|대|주기|배|단계|요소|류|급|종|쪽))|(?:\d+\s*:\s*\d+)/i;
const CRITERION_CONTEXT_RE=/(?:이상|이하|미만|초과|이내|범위|간격|거리|높이|면적|깊이|속도|비율|주기|수량|지정수량|온도|압력|농도|용량|유량|기간|연령|단계|요소|횟수)/;
function stripServiceIds(v){return norm(v).replace(SERVICE_ID_RE,'')}
function isNumericCriterion(v){const x=stripServiceIds(v);return /\d/.test(x)&&(NUMERIC_RE.test(x)||CRITERION_CONTEXT_RE.test(x))}
function deepRows(p){return (p?.deepSections||[]).flatMap(x=>[x?.title,x?.body,...(x?.bullets||[])]).filter(Boolean)}
function compareRows(p){return (p?.compare||[]).flatMap(x=>Array.isArray(x)?x:[]).filter(Boolean)}
function featureRows(p,limit=Infinity){return uniq(p?.features||[]).slice(0,limit)}
function mustRows(p,limit=Infinity){return uniq(p?.must||[]).slice(0,limit)}
function numberRows(p,limit=12){
  return uniq([...(p?.must||[]),...(p?.detail||[]),...deepRows(p),...compareRows(p)].filter(isNumericCriterion)).slice(0,limit)
}
function trapRows(p,limit=Infinity){return uniq(p?.traps||[]).slice(0,limit)}
function evidence(id,p){
  const c=V.curriculum?.byId?.[id],source=norm(p?.source||V.sourceLabel?.(id)||'');
  const ranges=(c?.sourceRanges||[]).map(x=>({doc:x.doc,from:Number(x.from),to:Number(x.to),label:norm(x.label||'')})).filter(x=>x.doc&&Number.isFinite(x.from)&&Number.isFinite(x.to));
  return{source,ranges}
}
function forConcept(id,{numberLimit=12}={}){
  const p=V.contentPacks?.authored?.[id]||V.contentPacks?.get?.(id);if(!p)return null;
  const features=featureRows(p),must=mustRows(p),numbers=numberRows(p,numberLimit),traps=trapRows(p),ev=evidence(id,p);
  return{
    id,features,must,numbers,traps,exceptions:traps.slice(),
    emphasis:uniq([...features,...must,...numbers,...traps]),
    evidence:ev
  }
}
V.StudyEmphasis119={
  version:'119-study-emphasis-ssot-v2-deduped-criteria',
  numericPattern:NUMERIC_RE.source,
  normalize:norm,uniq,featureRows,mustRows,numberRows,trapRows,evidence,forConcept,isNumericCriterion,stripServiceIds,
  policy:'numeric rows require a real measurement/count/threshold; emergency service identifiers such as 119 are not numeric criteria. Core/detail reuse is deduplicated by the study renderer.'
};
})();