import fs from 'node:fs';
import vm from 'node:vm';

await import('./verified-question-coverage-audit.mjs');
const V=globalThis.window?.AITUTOR_V9;
if(!V?.curriculum?.concepts||!V?.contentPacks||!V?.questions)throw Error('FINAL_USER_QA_RUNTIME_UNAVAILABLE');
for(const file of ['concept-architecture-119.js','source-catalog-119.js'])vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});

const concepts=V.curriculum.concepts,verified=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B');
const byConcept=new Map;for(const q of verified){const a=byConcept.get(q.conceptId)||[];a.push(q);byConcept.set(q.conceptId,a)}
const issues=[];
const packText=p=>JSON.stringify({summary:p?.summary,detail:p?.detail,must:p?.must,traps:p?.traps,compare:p?.compare,deepSections:p?.deepSections,numbers:p?.numbers,features:p?.features});
for(const c of concepts){
  const p=V.contentPacks.get(c.id),qs=byConcept.get(c.id)||[],ranges=c.sourceRanges||[];
  if(!p)issues.push({id:c.id,type:'PACK_MISSING'});
  if(!String(p?.summary||'').trim()||!(p?.must||[]).length)issues.push({id:c.id,type:'CORE_EMPTY'});
  const detailLen=(p?.detail||[]).length+(p?.deepSections||[]).length;if(detailLen<2)issues.push({id:c.id,type:'DETAIL_THIN',detailLen});
  if(!qs.length)issues.push({id:c.id,type:'VERIFIED_QUIZ_MISSING'});
  const webLinks=(p?.officialLinks||[]).filter(x=>x?.url);if(!ranges.length&&!webLinks.length)issues.push({id:c.id,type:'OFFICIAL_SOURCE_MISSING'});
  for(const r of ranges)if(r?.doc&&!V.SourceCatalog119?.get?.(r.doc))issues.push({id:c.id,type:'UNKNOWN_SOURCE_DOC',doc:r.doc});
  if(!V.ConceptArchitecture119?.get?.(c.id))issues.push({id:c.id,type:'AI_ARCHITECTURE_MISSING'});
}
const fire=concepts.filter(c=>c.subject==='fire').length,ems=concepts.filter(c=>c.subject==='ems').length;
if(concepts.length!==183||fire!==71||ems!==112)issues.push({type:'CURRICULUM_COUNT',total:concepts.length,fire,ems});
const text=id=>packText(V.contentPacks.get(id));
const haz=V.Hazmat2026?.classes||{};for(let n=1;n<=6;n++)if(haz[n]?.name!==`제${n}류`)issues.push({id:'F05-C01',type:'HAZMAT_CLASS_MISSING',class:n});
const required={
 'F02-C02':['재난관리책임기관','재난관리주관기관','중앙행정기관','지방자치단체','시행령 제3조의2','별표 1의3'],
 'F02-C03':['중앙안전관리위원회','중앙재난안전대책본부','행정안전부장관'],
 'F02-C06':['중앙긴급구조통제단','소방청장','시·군·구'],
 'F03-C06':['플래시오버','백드래프트','롤오버']
};
for(const [id,terms] of Object.entries(required)){const t=text(id);for(const term of terms)if(!t.includes(term))issues.push({id,type:'HIGH_RISK_TERM_MISSING',term})}
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),routes=['home','study','notes','bank','exam','wrong','stats','resources','suggestions','settings'];
for(const r of routes)if(!new RegExp('(?:function\\s+'+r+'\\s*\\(|'+r+':)').test(app))issues.push({type:'ROUTE_MISSING',route:r});
for(const marker of ['핵심','상세','문제','원문','AI','data-export','importBackup','data-save-note','data-training-start="wrong20"','확신오답'])if(!app.includes(marker))issues.push({type:'USER_FLOW_MARKER_MISSING',marker});
const summary={
 version:'119-v15-final-user-content-qa-v1',concepts:concepts.length,fire,ems,
 coreReady:concepts.length-issues.filter(x=>['PACK_MISSING','CORE_EMPTY'].includes(x.type)).length,
 detailReady:concepts.length-issues.filter(x=>x.type==='DETAIL_THIN').length,
 verifiedQuizReady:concepts.length-issues.filter(x=>x.type==='VERIFIED_QUIZ_MISSING').length,
 sourceReady:concepts.length-issues.filter(x=>['OFFICIAL_SOURCE_MISSING','UNKNOWN_SOURCE_DOC'].includes(x.type)).length,
 aiReady:concepts.length-issues.filter(x=>x.type==='AI_ARCHITECTURE_MISSING').length,
 highRiskChecks:6+Object.values(required).reduce((a,x)=>a+x.length,0),studentCopyGuard:'rendered-browser-audits',issues:issues.length
};
console.log('FINAL_USER_CONTENT_QA_SUMMARY',JSON.stringify(summary,null,2));
if(issues.length){console.error('FINAL_USER_CONTENT_QA_ISSUES',JSON.stringify(issues.slice(0,120),null,2));throw Error('FINAL_USER_CONTENT_QA_FAILED '+JSON.stringify({issues:issues.length,first:issues[0]}))}
console.log('FINAL_USER_CONTENT_QA_COMPLETE');
