'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
const uniq=arr=>{const out=[],seen=new Set();for(const raw of arr||[]){const x=norm(raw),k=x.toLowerCase();if(x&&!seen.has(k)){seen.add(k);out.push(x)}}return out};
const NUMERIC_RE=/\d|%|℃|°C|°|cm|mmHg|mm|kg|\bg\b|mg|mL|\bL\b|\bm\b|psi|J\/kg|kW(?:\/㎡)?/i;
function deepRows(p){return (p?.deepSections||[]).flatMap(x=>[x?.title,x?.body,...(x?.bullets||[])]).filter(Boolean)}
function compareRows(p){return (p?.compare||[]).flatMap(x=>Array.isArray(x)?x:[]).filter(Boolean)}
function featureRows(p,limit=Infinity){return uniq(p?.features||[]).slice(0,limit)}
function mustRows(p,limit=Infinity){return uniq(p?.must||[]).slice(0,limit)}
function numberRows(p,limit=12){
  return uniq([...(p?.must||[]),...(p?.detail||[]),...deepRows(p),...compareRows(p)].filter(x=>NUMERIC_RE.test(String(x||'')))).slice(0,limit)
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
  version:'119-study-emphasis-ssot-v1',
  numericPattern:NUMERIC_RE.source,
  normalize:norm,uniq,featureRows,mustRows,numberRows,trapRows,evidence,forConcept,
  policy:'core emphasis, numeric/unit rows, traps/exceptions and official evidence are derived once here and reused by study UI, study schema and pass-note output'
};
})();