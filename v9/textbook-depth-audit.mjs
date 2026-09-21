import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-hazmat-depth-119.js',
  'questions-facilities-depth-119.js','questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-restored-fire-verified-119.js',
  'question-difficulty.js','question-quality-119.js',
  'depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js',
  'fire-depth-119.js','governance-depth-119.js','investigation-depth-119.js','facilities-depth-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','suppression-depth-119.js','ems-rich-2026.js','ems-depth-119.js',
  'quality2-ems-medical-content-119.js','quality2-global-content-119.js',
  'question-bank-119.js','textbook-grounded-119.js','content-contract-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
const V=window.AITUTOR_V9,chars=x=>String(x||'').replace(/\s+/g,'').length;
const missingPacks=V.curriculum.concepts.filter(c=>!V.contentPacks.authored[c.id]).map(c=>c.id);
if(missingPacks.length)throw new Error('TEXTBOOK_DEPTH_MISSING_PACKS '+JSON.stringify(missingPacks));
const rows=V.curriculum.concepts.map(c=>{
  const p=V.contentPacks.authored[c.id];
  const text=[p.summary,...(p.detail||[]),...(p.deepSections||[]).flatMap(x=>[x.title,x.body,...(x.bullets||[])])].join(' ');
  const n=chars(text);
  return{id:c.id,title:c.title,scopeId:c.scopeId,scopeTitle:c.scopeTitle,subject:c.subject,chars:n,detail:(p.detail||[]).length,sections:(p.deepSections||[]).length,must:(p.must||[]).length,traps:(p.traps||[]).length,visuals:(p.visuals||[]).length,compare:(p.compare||[]).length,pass:n>=900};
});
const fail=rows.filter(x=>!x.pass).sort((a,b)=>a.chars-b.chars||a.id.localeCompare(b.id));
const groups={};
for(const r of rows){
  const k=r.scopeId,g=groups[k]||(groups[k]={scopeId:k,scopeTitle:r.scopeTitle,subject:r.subject,total:0,fail:0,chars:[]});
  g.total++;g.fail+=r.pass?0:1;g.chars.push(r.chars);
}
const groupRows=Object.values(groups).map(g=>{
  const a=g.chars.slice().sort((x,y)=>x-y),sum=a.reduce((s,x)=>s+x,0);
  return{scopeId:g.scopeId,scopeTitle:g.scopeTitle,subject:g.subject,total:g.total,fail:g.fail,pass:g.total-g.fail,min:a[0],median:a[Math.floor(a.length/2)],avg:Math.round(sum/a.length),max:a[a.length-1]};
}).sort((a,b)=>b.fail-a.fail||a.scopeId.localeCompare(b.scopeId));
const bins={'<300':0,'300-499':0,'500-699':0,'700-899':0,'>=900':0};
for(const r of rows){if(r.chars<300)bins['<300']++;else if(r.chars<500)bins['300-499']++;else if(r.chars<700)bins['500-699']++;else if(r.chars<900)bins['700-899']++;else bins['>=900']++}
const subject={};for(const r of rows){const s=subject[r.subject]||(subject[r.subject]={total:0,fail:0});s.total++;s.fail+=r.pass?0:1}
console.log('TEXTBOOK_DEPTH_119_SUMMARY',JSON.stringify({target:900,total:rows.length,pass:rows.length-fail.length,fail:fail.length,bins,subject},null,2));
console.log('TEXTBOOK_DEPTH_119_BY_SCOPE');console.table(groupRows);
console.log('TEXTBOOK_DEPTH_119_WORST_60');console.table(fail.slice(0,60));
if(rows.length!==183)throw new Error('TEXTBOOK_DEPTH_CURRICULUM_COUNT '+rows.length+' expected 183');
if(fail.length)throw new Error('TEXTBOOK_DEPTH_119_FAILED '+JSON.stringify(fail.map(x=>({id:x.id,chars:x.chars}))));
console.log('TEXTBOOK_DEPTH_119_AUDIT_COMPLETE');
