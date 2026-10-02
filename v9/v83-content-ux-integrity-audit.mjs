import fs from 'node:fs';

await import('./all-content-density-audit.mjs');

const V=globalThis.window?.AITUTOR_V9;
const assert=(v,m,x={})=>{if(!v)throw new Error(m+' '+JSON.stringify(x));console.log('PASS',m)};
if(!V?.curriculum?.concepts||!V?.contentPacks?.authored||!V?.StudyEmphasis119)throw new Error('V83_RUNTIME_UNAVAILABLE');

const concepts=V.curriculum.concepts,P=V.contentPacks.authored;
const fire=concepts.filter(x=>x.subject==='fire'),ems=concepts.filter(x=>x.subject==='ems');
assert(concepts.length===183&&fire.length===71&&ems.length===112,'V83 audits all 183 fire/EMS concepts',{total:concepts.length,fire:fire.length,ems:ems.length});

const emptySections=[],emptyComparisons=[],numericConcepts=[];
for(const c of concepts){
  const p=P[c.id];if(!p)continue;
  for(const s of p.deepSections||[]){
    if(String(s?.title||'').trim()&&!String(s?.body||'').trim()&&!(s?.bullets||[]).some(x=>String(x||'').trim()))emptySections.push({id:c.id,title:s.title});
  }
  for(const row of p.compare||[]){
    if(!Array.isArray(row)||!String(row?.[0]||'').trim()||!String(row?.[1]||'').trim())emptyComparisons.push({id:c.id,row});
  }
  const numbers=V.StudyEmphasis119.numberRows(p,12);
  if(numbers.length)numericConcepts.push({id:c.id,subject:c.subject,count:numbers.length});
}
assert(emptySections.length===0,'no authored detail heading is left without content',{emptySections:emptySections.slice(0,20)});
assert(emptyComparisons.length===0,'no authored comparison card has an empty label/body',{emptyComparisons:emptyComparisons.slice(0,20)});
assert(numericConcepts.length>0,'numeric memorization criteria are discoverable across curriculum',{numericConcepts:numericConcepts.length});

const powder=P['F04-C08'],powderText=JSON.stringify({must:powder?.must,compare:powder?.compare,detail:powder?.detail,deepSections:powder?.deepSections});
for(const term of ['1종','2종','3종','4종','제1인산암모늄','ABC'])assert(powderText.includes(term),'powder concept keeps '+term);
const powderCompare=(powder?.compare||[]).map(x=>Array.isArray(x)?x.map(v=>String(v||'').trim()):[]).filter(x=>x[0]);
for(const kind of ['1종','2종','3종','4종']){
  const row=powderCompare.find(x=>x[0]===kind);
  assert(row&&row[1],'powder comparison keeps non-empty '+kind,{row});
}
const third=powderCompare.find(x=>x[0]==='3종');
assert(/제1인산암모늄/.test(third?.[1]||'')&&/ABC/.test(third?.[1]||''),'powder 3종 comparison keeps component and ABC adaptation',{third});

const haz=P['F05-C03'],hazNumbers=V.StudyEmphasis119.numberRows(haz,12).join(' ').replace(/,/g,'');
for(const token of ['100kg','500kg','1000kg'])assert(hazNumbers.replace(/\s+/g,'').includes(token),'hazmat designated quantity is available to core '+token,{hazNumbers});

const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const coreSlice=app.slice(app.indexOf('function coreNumberRows'),app.indexOf('function coreTrapRows'));
assert(!coreSlice.includes("detailCriteriaOwner==='detail'"),'core numeric criteria are never hidden just because detail owns criteria');
assert(!coreSlice.includes('compareBodies'),'core numeric criteria are not suppressed by a comparison duplicate');
assert(coreSlice.includes("split(/\\s*·\\s*/)")&&coreSlice.includes("const u=[];for(const x of r)")&&coreSlice.includes("return u.slice(0,12)"),'numeric memory rows are atomic, final-pass de-duplicated and capped at 12');
assert(app.includes("i<9?numberHighlight(x):esc(x)"),'numeric rows beyond the first nine stay visible without excess emphasis');
assert(app.includes("if(!row[0]||!row[1])continue"),'runtime drops comparison cards whose learner-visible body became empty');
assert(app.includes("/^(?:제?\\d+\\s*(?:종|류|급))$/"),'numbered type/class comparison rows survive cross-section dedupe');
assert(app.includes('const tutorKinds=')&&app.includes("return cleanTutorText(k.join('\\n'))"),'short type questions receive a direct grounded list');
assert(app.includes("if(!a.length)a.push(...(V.ConceptArchitecture119?.termsFor?.(c?.id)||[]),t)"),'concept title is only a fallback PDF anchor after specific facts');
assert(app.includes("hazmatBlock(c)+specialCombustibleBlock(pack)"),'F05-C01 core includes special-combustible quantity table');
assert(css.includes('.page-bank .bank-workspace .actionbar{position:static;z-index:1}'),'bank pager stays in normal flow instead of covering choices');
assert(!css.includes('.page-bank .bank-workspace .actionbar{position:sticky'),'bank pager sticky overlay contract is removed');

console.log('V83_CONTENT_UX_INTEGRITY_SUMMARY',JSON.stringify({
  total:concepts.length,fire:fire.length,ems:ems.length,
  numericConcepts:numericConcepts.length,
  numericFire:numericConcepts.filter(x=>x.subject==='fire').length,
  numericEms:numericConcepts.filter(x=>x.subject==='ems').length,
  emptySections:emptySections.length,emptyComparisons:emptyComparisons.length
},null,2));
console.log('V83_CONTENT_UX_INTEGRITY_SUCCESS');
