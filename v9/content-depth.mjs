import fs from 'node:fs';
import vm from 'node:vm';

globalThis.window={AITUTOR_V9:{}};
for(const file of ['curriculum.js','content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js']){
  vm.runInThisContext(fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8'),{filename:file});
}
const V=window.AITUTOR_V9,rows=[],fail=[];
for(const c of V.curriculum.concepts){
  const p=V.contentPacks.authored[c.id];
  if(!p){fail.push(`${c.id}: missing pack`);continue}
  const summary=String(p.summary||'').trim(),details=(p.detail||[]).map(String),must=(p.must||[]).map(String),traps=(p.traps||[]).map(String),source=String(p.source||'');
  const detailChars=details.join('').replace(/\s+/g,'').length;
  const placeholder=/원문\s*(검증|확인)|근거\s*(확인|필요)|연결\s*대기|추후\s*확인|임의로/.test([summary,...details,...must,...traps].join(' '));
  const checks={
    verified:p.status==='verified',
    summary:summary.replace(/\s+/g,'').length>=20,
    details:details.length>=2&&detailChars>=90,
    must:must.length>=2,
    traps:traps.length>=1,
    source:/\d/.test(source)&&/(쪽|p\.?|페이지)/i.test(source),
    noPlaceholder:!placeholder
  };
  const score=Object.values(checks).filter(Boolean).length;
  rows.push({id:c.id,title:c.title,detailChars,detailCount:details.length,must:must.length,traps:traps.length,score});
  const bad=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);if(bad.length)fail.push(`${c.id} ${c.title}: ${bad.join(', ')} (detailChars=${detailChars}, detailCount=${details.length}, must=${must.length})`);
}
rows.sort((a,b)=>a.detailChars-b.detailChars||a.id.localeCompare(b.id));
console.log('CONTENT_DEPTH_WORST_20');console.table(rows.slice(0,20));
const avg=Math.round(rows.reduce((s,r)=>s+r.detailChars,0)/Math.max(1,rows.length));
console.log(JSON.stringify({concepts:rows.length,averageDetailChars:avg,minDetailChars:rows[0]?.detailChars||0,failures:fail.length},null,2));
if(fail.length){console.error('CONTENT_DEPTH_FAILURES\n'+fail.join('\n'));process.exit(1)}
console.log('V9_CONTENT_DEPTH_SUCCESS');
