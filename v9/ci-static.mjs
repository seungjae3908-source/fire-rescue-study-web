import fs from 'node:fs';
import vm from 'node:vm';

function ok(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
globalThis.window={AITUTOR_V9:{}};
for(const file of ['curriculum.js','content-packs.js','questions.js','verified-expansion.js','verified-completion.js']){
  const code=fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8');
  vm.runInThisContext(code,{filename:file});
}
const V=window.AITUTOR_V9;
ok(V.curriculum.totalConcepts===135,'135 concepts');
ok(new Set(V.curriculum.concepts.map(x=>x.id)).size===135,'unique concept ids');
ok(V.curriculum.concepts.every(x=>x.sourceRanges.length>0),'all concepts have official source ranges');
ok(V.curriculum.fire.length===4,'four fire scopes');
ok(V.curriculum.ems.length===24,'twenty-four EMS scopes');
ok(V.questions.every(q=>q.choices.length===4),'all questions have four choices');
ok(V.questions.every(q=>new Set(q.choices).size===4),'no duplicate choices inside a question');
ok(new Set(V.questions.map(q=>q.id)).size===V.questions.length,'unique question ids');
ok(V.questions.every(q=>Number.isInteger(q.a)&&q.a>=0&&q.a<4),'single valid answer index');
ok(V.questions.every(q=>!/(기출|실제 출제|과거시험)/.test(String(q.q||''))),'no generated question is mislabeled as past exam');
const mock=V.examReadiness();
ok(mock.ready===(mock.fire>=25&&mock.ems>=40),'real mock exam is fail-closed');
ok(mock.fire>=25&&mock.ems>=40,'distinct verified bank reaches 25 fire + 40 EMS');
const coverage=V.contentPacks.coverage();
const missing=V.curriculum.concepts.filter(c=>V.contentPacks.authored[c.id]?.status!=='verified').map(c=>c.id);
const extra=Object.keys(V.contentPacks.authored).filter(id=>!V.curriculum.byId[id]);
console.log('VERIFIED_COVERAGE',coverage);
console.log('MISSING_VERIFIED_CONCEPTS',missing);
console.log('EXTRA_AUTHORED_CONCEPTS',extra);
ok(coverage.total===135,'content coverage denominator is 135');
ok(missing.length===0,`all 135 concept packs are source-verified; missing=${missing.join(',')||'none'}`);
ok(Object.keys(V.contentPacks.authored).filter(id=>V.curriculum.byId[id]).length===135,'exactly 135 valid authored concept packs');
ok(extra.length===0,`no authored concept IDs outside curriculum; extra=${extra.join(',')||'none'}`);
ok(Object.values(V.contentPacks.authored).every(p=>p.status==='verified'),'all authored content packs are explicitly verified');
ok(V.curriculum.concepts.every(c=>V.contentPacks.authored[c.id]),'every curriculum concept has an authored verified pack');

const sql=fs.readFileSync(new URL('../supabase/v9-schema.sql',import.meta.url),'utf8');
for(const table of ['profiles','user_progress','user_answers','wrong_answers','review_schedule','personal_notes','private_documents','document_chunks','study_sessions','exam_history','tutor_preferences']){
  ok(sql.includes(`alter table public.${table} enable row level security;`),`${table} RLS enabled`);
}
ok(sql.includes("values('private-study','private-study',false"),'private storage bucket is non-public');
ok(sql.includes('(storage.foldername(name))[1]=auth.uid()::text'),'storage objects are user-folder scoped');
ok(!sql.toLowerCase().includes('public = true'),'schema never enables public storage');

const root=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
ok(!root.includes('/v9/')&&!root.includes('v9/app.js'),'production root remains v8.6 during development');
console.log(JSON.stringify({concepts:135,verifiedPacks:coverage.verified,questions:V.questions.length,mock},null,2));
