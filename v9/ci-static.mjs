import fs from 'node:fs';
import vm from 'node:vm';

function ok(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
globalThis.window={AITUTOR_V9:{}};
for(const file of ['curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','master-syllabus-119.js','content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js','questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-hazmat-depth-119.js','question-difficulty.js','question-quality-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js','content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js']){
  const code=fs.readFileSync(new URL(`./${file}`,import.meta.url),'utf8');
  vm.runInThisContext(code,{filename:file});
}
const V=window.AITUTOR_V9;
ok(V.curriculum.totalConcepts===176,'176 complete concepts');
ok(V.MasterSyllabus119?.groups?.fire?.length===6&&V.MasterSyllabus119?.groups?.ems?.length===10,'119 master syllabus groups fire/EMS into exam-oriented parts');
ok(typeof V.ContentContract119?.audit==='function','119 fail-closed content completion contract is loaded');
ok(typeof V.QuestionQuality119?.isExamStyle==='function','119 exam-style question quality gate is loaded');
const questionAudit=V.QuestionQuality119.audit();
ok(questionAudit.examStyle>0,'exam-style question bank is non-empty');
ok(questionAudit.duplicateTexts.length===0,'exam-style question text duplicates = 0');
ok((V.questions||[]).filter(V.QuestionQuality119.isExamStyle).every(q=>q.choiceExplanations?.length===4),'every exam-style question explains all four options');
ok((V.questions||[]).filter(V.QuestionQuality119.isExamStyle).every(q=>q.difficulty&&q.type&&q.source),'every exam-style question has difficulty, type and source');
const authored119=(V.questions||[]).filter(q=>/^119-/.test(q.id||''));
ok(authored119.length>=29,'119 authored exam-question bank has at least 29 reviewed questions');
ok(authored119.every(V.QuestionQuality119.isExamStyle),'every 119-authored question passes the full exam-style quality contract');
ok(new Set(V.curriculum.concepts.map(x=>x.id)).size===176,'unique concept ids');
ok(V.curriculum.concepts.every(x=>x.sourceRanges.length>0),'all concepts have official source ranges');
ok(V.curriculum.fire.length===7,'seven complete fire scopes');
ok(V.curriculum.ems.length===24,'twenty-four EMS scopes');
ok(V.questions.every(q=>q.choices.length===4),'all questions have four choices');
ok(V.questions.every(q=>new Set(q.choices).size===4),'no duplicate choices inside a question');
ok(new Set(V.questions.map(q=>q.id)).size===V.questions.length,'unique question ids');
ok(V.questions.every(q=>Number.isInteger(q.a)&&q.a>=0&&q.a<4),'single valid answer index');
ok(V.questions.every(q=>!/(기출|실제 출제|과거시험)/.test(String(q.q||''))),'no generated question is mislabeled as past exam');
const contentAudit=V.ContentContract119.audit();
ok(contentAudit.total===176&&contentAudit.incomplete>0,'content audit reports real incomplete work instead of fake 100%');
ok(contentAudit.complete<contentAudit.total,'119 content contract remains fail-closed until every concept reaches textbook/question/source quality');
const mock=V.examReadiness();
ok(mock.ready===(mock.fire>=25&&mock.ems>=40&&mock.scopeComplete),'real mock exam is fail-closed on count + restored-scope coverage');
ok(mock.fire>=25&&mock.ems>=40,'distinct verified bank reaches 25 fire + 40 EMS');
ok(mock.missingFireScopes.includes('F05')&&mock.missingFireScopes.includes('F06')&&mock.missingFireScopes.includes('F07')&&!mock.ready,'real mock stays locked until restored fire scopes gain page-verified questions');
ok(V.scopePractice2026?.questions===27&&V.questions.filter(q=>q.grade==='P').length>=27,'27 practice-only questions cover the restored fire scopes without real-exam credit');
ok(V.QuestionDifficulty?.levels?.high&&V.QuestionDifficulty?.profiles?.hard,'question difficulty is independent from evidence grade');
ok(V.Hazmat2026?.grade2?.items?.length===7,'official grade-2 hazardous-material item table is loaded');
ok(V.Hazmat2026?.multiple([{quantity:100,designated:100},{quantity:250,designated:500}])===1.5,'hazardous-material designated-quantity multiple calculator works');
const coverage=V.contentPacks.coverage();
const missing=V.curriculum.concepts.filter(c=>V.contentPacks.authored[c.id]?.status!=='verified').map(c=>c.id);
const scopeVerified=V.curriculum.concepts.filter(c=>V.contentPacks.authored[c.id]?.status==='scope-verified').map(c=>c.id);
const extra=Object.keys(V.contentPacks.authored).filter(id=>!V.curriculum.byId[id]);
console.log('VERIFIED_COVERAGE',coverage);
console.log('MISSING_VERIFIED_CONCEPTS',missing);
console.log('EXTRA_AUTHORED_CONCEPTS',extra);
ok(coverage.total===176,'content coverage denominator is 176');
ok(scopeVerified.length===41&&scopeVerified.every(id=>/^F0[5-7]-/.test(id)||/^F03-C(09|1[0-6])$/.test(id)),`41 page-anchor-pending fire concepts remain fail-closed; actual=${scopeVerified.length}`);
ok(missing.length===41&&missing.every(id=>scopeVerified.includes(id)),`only the 41 page-anchor-pending concepts are not fully verified; missing=${missing.join(',')||'none'}`);
ok(Object.keys(V.contentPacks.authored).filter(id=>V.curriculum.byId[id]).length===176,'exactly 176 valid authored concept packs');
ok(coverage.verified===135&&coverage.pending===41,'release truth stays 135 page-verified + 41 page-anchor-pending');
ok(extra.length===0,`no authored concept IDs outside curriculum; extra=${extra.join(',')||'none'}`);
ok(Object.values(V.contentPacks.authored).every(p=>p.status==='verified'||p.status==='scope-verified'),'every authored content pack has an explicit verified/scope-verified truth state');
ok(V.curriculum.concepts.every(c=>V.contentPacks.authored[c.id]),'every curriculum concept has an authored study pack');
ok(V.curriculum.byId['F05-C05']&&V.curriculum.byId['F07-C05'],'hazardous materials and sprinkler scopes exist');
ok(V.contentPacks.authored['F05-C05']?.deepSections?.length>0&&V.contentPacks.authored['F07-C05']?.deepSections?.length>0,'new fire scopes have rich detail sections');
ok(V.curriculumExpansion2026?.addedConcepts===27,'official missing fire scope expansion adds 27 concepts');
ok(V.curriculumDepth119?.addedConcepts===14,'119 depth syllabus adds 14 granular fire/sprinkler concepts');
ok(V.FireDepth119?.concepts?.length===14,'14 new deep fire concepts have textbook packs');
ok(V.FireQuestions119?.added===13,'deep fire batch adds 13 sourced practice questions with option explanations');
ok(V.HazmatDepth119?.concepts?.length===6,'all six hazardous-material classes receive official common-rule depth');
ok(V.HazmatQuestions119?.added===7,'hazardous-material depth batch adds seven sourced questions');
ok(V.HazmatDepth119.concepts.every(id=>V.contentPacks.authored[id]?.calculations?.length>0),'all hazardous-material class lessons expose designated-quantity calculation contract');
ok(V.EMSDepth119?.concepts?.length===9,'nine high-yield EMS concepts receive textbook-depth enrichment');
ok(V.EMSQuestions119?.added===9,'nine page-grounded EMS exam-style questions are loaded');
ok(V.EMSDepth119.concepts.every(id=>V.contentPacks.authored[id]?.visuals?.length>0),'high-yield EMS depth concepts have learning diagrams');
ok(V.emsRich2026?.scopes===24&&V.emsRich2026?.concepts===107,'all 24 EMS chapters / 107 concepts receive structured rich detail');
ok((V.depthEnrichment?.conceptIds||[]).length>=19,'source-depth enrichment batch 1 is loaded');
ok(!!V.depthEnrichment2,'source-depth enrichment batch 2 is loaded');

const brandFiles=[
  fs.readFileSync(new URL('./index.html',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./preview.html',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./app.js',import.meta.url),'utf8'),
  fs.readFileSync(new URL('./selftest.js',import.meta.url),'utf8')
].join('\n');
ok(!brandFiles.includes('AI과외'),'legacy AI과외 brand is absent from v9 runtime surfaces');
ok(brandFiles.includes('119'),'119 brand is present in v9 runtime surfaces');
const manifest=JSON.parse(fs.readFileSync(new URL('./manifest.webmanifest',import.meta.url),'utf8'));
ok(manifest.start_url==='./'&&manifest.scope==='./','v9 PWA manifest is subpath-scoped');
ok(manifest.name==='119'&&manifest.short_name==='119','PWA install name is unified as 119');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
ok(sw.includes("const PREFIX='ai-tutor-v9-'"),'v9 service worker uses a dedicated cache prefix');
ok(!sw.includes('ai-tutor-v8'),'v9 service worker never targets v8 cache names');
ok(sw.includes("'./sync-merge.js'")&&sw.includes("'./sync-ui.js'"),'v9 sync hardening files are offline-cached');
ok(sw.includes("'./depth-enrichment.js'")&&sw.includes("'./depth-enrichment-2.js'")&&sw.includes("'./content-rich-2026.js'")&&sw.includes("'./ems-rich-2026.js'"),'v9 depth enrichments are offline-cached');
ok(sw.includes("'./curriculum-complete-2026.js'"),'complete curriculum expansion is offline-cached');
const v9index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
ok(v9index.includes("register('./sw.js',{scope:'./'})"),'v9 service worker registers only at ./ scope');
ok(v9index.indexOf('./curriculum-complete-2026.js')>v9index.indexOf('./curriculum.js')&&v9index.indexOf('./curriculum-complete-2026.js')<v9index.indexOf('./content-packs.js'),'complete curriculum loads before content packs');
ok(v9index.indexOf('./depth-enrichment.js')>v9index.indexOf('./verified-final.js'),'depth enrichment loads after base verified packs');
ok(v9index.indexOf('./depth-enrichment-2.js')>v9index.indexOf('./depth-enrichment.js'),'depth enrichment batch 2 loads after batch 1');
ok(v9index.indexOf('./sync-merge.js')<v9index.indexOf('./auth.js'),'conflict-safe merge loads before member auth');
ok(v9index.indexOf('./pdf.js')<v9index.indexOf('./auth.js'),'private document sync API loads before member auth');
ok(v9index.indexOf('./source-pdf.js')>v9index.indexOf('./pdf.js')&&v9index.indexOf('./source-pdf.js')<v9index.indexOf('./app.js'),'official PDF highlight engine loads before app UI');

const sql=fs.readFileSync(new URL('../supabase/v9-schema.sql',import.meta.url),'utf8');
const studyTables=['study_profiles','study_user_progress','study_user_answers','study_wrong_answers','study_review_schedule','study_personal_notes','study_private_documents','study_document_chunks','study_sessions','study_exam_history','study_tutor_preferences'];
for(const table of studyTables){
  ok(sql.includes(`alter table public.${table} enable row level security;`),`${table} RLS enabled`);
}
ok(!/create table if not exists public\.profiles\s*\(/.test(sql),'shared backend never creates or repurposes investment public.profiles');
ok(sql.includes("values('study-private-v9','study-private-v9',false"),'Study private storage bucket is non-public');
ok(sql.includes("bucket_id='study-private-v9'"),'Storage policies are isolated to the Study bucket');
ok(sql.includes('to authenticated'),'Study policies explicitly target authenticated users');
ok(sql.includes('(select auth.uid())'),'Study owner checks use cached auth.uid() form');
ok(!sql.toLowerCase().includes('public = true'),'schema never enables public storage');
ok((sql.match(/deleted_at timestamptz/g)||[]).length>=2,'personal notes and private documents support deletion tombstones');
ok(!sql.includes('create trigger on_ai_tutor_user_created')&&!sql.includes('handle_new_ai_tutor_user'),'shared backend adds no project-wide auth.users bootstrap trigger');
ok(!/^\s*alter\s+default\s+privileges\b/im.test(sql),'shared schema does not execute project-wide default-privilege changes');

const hardening=fs.readFileSync(new URL('../supabase/v9-owner-hardening.sql',import.meta.url),'utf8');
ok(hardening.includes('study_private_documents_id_user_id_key'),'private document identity constraint is Study-namespaced');
ok(hardening.includes('foreign key (document_id, user_id)'),'document chunks use an owner-bound composite foreign key');
ok(hardening.includes('public.study_private_documents'),'document hardening never targets investment tables');
ok(hardening.includes('d.id = document_id and d.user_id = (select auth.uid())'),'document chunk RLS verifies parent ownership');

const liveHardening=fs.readFileSync(new URL('../supabase/v9-live-backend-hardening.sql',import.meta.url),'utf8');
ok(liveHardening.includes('revoke all privileges on table public.%I from anon'),'anonymous Data API access is explicitly revoked for Study tables');
ok(liveHardening.includes('grant select, insert, update, delete on table public.%I to authenticated'),'authenticated Data API grants are explicit');
ok(liveHardening.includes("'study_profiles'")&&liveHardening.includes("'study_tutor_preferences'"),'live hardening is bound to Study-prefixed tables');
ok(!/^\s*alter\s+default\s+privileges\b/im.test(liveHardening),'live hardening does not execute investment-app default-privilege changes');
ok(!/^\s*create\s+(?:or\s+replace\s+)?function\b/im.test(liveHardening)&&!/^\s*create\s+trigger\b/im.test(liveHardening),'live hardening adds no project-wide trigger/function');
ok(liveHardening.includes('c.relrowsecurity'),'live hardening aborts if any Study private table lacks RLS');

const auth=fs.readFileSync(new URL('./auth.js',import.meta.url),'utf8');
for(const [logical,physical] of Object.entries({profiles:'study_profiles',user_progress:'study_user_progress',user_answers:'study_user_answers',wrong_answers:'study_wrong_answers',review_schedule:'study_review_schedule',personal_notes:'study_personal_notes',private_documents:'study_private_documents',document_chunks:'study_document_chunks',study_sessions:'study_sessions',exam_history:'study_exam_history',tutor_preferences:'study_tutor_preferences'})){
  ok(auth.includes(`${logical}:'${physical}'`),`member sync maps ${logical} -> ${physical}`);
}
ok(auth.includes('remoteFirstOnSignIn:true'),'existing-member sign-in is remote-first before local push');
ok(auth.includes('remoteFirstOnManualSync:true'),'manual sync is remote-first before local push');
ok(auth.includes('await pullRemoteIntoLocal(user.id);return syncAllInternal(user.id)'),'manual sync performs pull/merge before push');
ok(auth.includes('deleted_at:iso(d.deletedAt)'),'private document tombstones are uploaded');
ok(auth.includes('client.from(T.document_chunks).delete()'),'deleted private documents remove remote extracted chunks');
ok(auth.includes('originalFilesAutoUpload:false'),'original personal files are never auto-uploaded');
ok(!auth.includes('.storage.from('),'auth sync has no original-file storage upload path');
ok(auth.includes('sharedProjectNamespace:\'study_*\''),'sync contract records the Study shared-project namespace');
ok(auth.includes('supabasePublishableKey'),'browser auth prefers the Supabase publishable key');
ok(auth.includes('enableCloudSync===true'),'backend connection is feature-gated until explicitly enabled');
ok(auth.includes("client.auth.resend({type:'signup',email})"),'signup confirmation email can be resent without changing project-wide auth settings');
ok(auth.includes('pendingEmailConfirmation:true'),'unconfirmed signup is represented as a pending state instead of a false failure');
const appCode=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
ok(appCode.includes('data-resend-confirmation'),'account UI exposes confirmation-email resend');
ok(appCode.includes('Email not confirmed'),'account UI explains unconfirmed-email sign-in failures');

const membershipSql=fs.readFileSync(new URL('../supabase/v9-study-membership-trigger.sql',import.meta.url),'utf8');
ok(membershipSql.includes('create table if not exists public.study_memberships'),'Study membership registry is migration-controlled');
ok(membershipSql.includes("source text not null default 'study-v9' check (source = 'study-v9')"),'Study membership source is constrained');
ok(membershipSql.includes('grant select on table public.study_memberships to authenticated'),'clients can only read their own membership through RLS');
ok(membershipSql.includes('revoke all on function public.handle_new_study_v9_user() from public, anon, authenticated'),'Study bootstrap SECURITY DEFINER is not client-callable');
ok(membershipSql.includes('create policy study_membership_gate on public.%I as restrictive for all to authenticated'),'every Study table receives a restrictive membership gate');
ok(membershipSql.includes("bucket_id='study-private-v9'")&&membershipSql.includes('from public.study_memberships m'),'Study Storage policies require both owner folder and Study membership');

const guard=fs.readFileSync(new URL('./auth-membership-guard.js',import.meta.url),'utf8');
ok(guard.includes("from('study_memberships')"),'browser session guard checks server-created Study membership');
ok(guard.includes('STUDY_ACCOUNT_REQUIRED'),'non-Study shared-auth sessions fail closed');
ok(auth.includes("V.Auth?.hasStudyMembership&&!(await V.Auth.hasStudyMembership(next.id))"),'member adopt checks Study membership before any remote pull/push');
ok(guard.includes('membershipPreflightBeforeAdopt:true'),'membership preflight contract is recorded in sync policy');
ok(v9index.indexOf('./auth.js')<v9index.indexOf('./auth-membership-guard.js')&&v9index.indexOf('./auth-membership-guard.js')<v9index.indexOf('./app.js'),'Study membership guard loads after auth and before app UI');
const preview=fs.readFileSync(new URL('./preview.html',import.meta.url),'utf8');
ok(preview.includes('enableCloudSync:true')&&preview.includes('previewOnly:true'),'real cloud sync is enabled only on the explicit v9 preview surface');
ok(preview.includes('./auth-membership-guard.js'),'preview uses the same membership guard as v9');
ok(preview.indexOf('./supabase-lite.js')<preview.indexOf('./auth.js'),'preview loads same-origin auth client before member auth');
ok(auth.includes("clientRuntime:'same-origin-lite'")&&auth.includes('externalSdkRequired:false'),'auth runtime contract forbids external SDK dependency');
ok(!auth.includes('esm.sh')&&!auth.includes('cdn.jsdelivr.net')&&!auth.includes('unpkg.com'),'member auth has no external runtime SDK dependency');
const supabaseLite=fs.readFileSync(new URL('./supabase-lite.js',import.meta.url),'utf8');
ok(supabaseLite.includes("/auth/v1/signup"),'same-origin auth client implements signup');
ok(supabaseLite.includes("/auth/v1/token?grant_type=password"),'same-origin auth client implements password sign-in');
ok(supabaseLite.includes("/auth/v1/resend"),'same-origin auth client implements confirmation resend');
ok(supabaseLite.includes("/rest/v1/"),'same-origin auth client implements RLS Data API calls');
ok(v9index.indexOf('./supabase-lite.js')<v9index.indexOf('./auth.js'),'same-origin auth client loads before member auth');
ok(!auth.includes('service_role')&&!auth.includes('sb_secret_'),'browser auth contains no privileged Supabase key');
const configExample=fs.readFileSync(new URL('./config.example.js',import.meta.url),'utf8');
ok(configExample.includes('supabasePublishableKey'),'config example uses a publishable key');
ok(!/supabase(?:ServiceRole|Secret|Service)_?Key\s*:/i.test(configExample)&&!/sb_secret_[A-Za-z0-9]/.test(configExample),'config example never configures a privileged key');
const config=fs.readFileSync(new URL('./config.js',import.meta.url),'utf8');
ok(config.includes('enableCloudSync:false'),'checked-in v9 config keeps real cloud sync disabled');
ok(config.includes("supabaseUrl:'https://petlfbztqguuzkasfpug.supabase.co'"),'checked-in v9 config pins the approved shared Supabase URL');
ok(/supabasePublishableKey:'sb_publishable_[A-Za-z0-9_-]+'/.test(config),'checked-in v9 config uses a browser-safe publishable key');
ok(!/sb_secret_[A-Za-z0-9_-]+/.test(config)&&!/service_role/i.test(config),'checked-in v9 config contains no privileged Supabase key');

const sourcePdf=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
ok(sourcePdf.includes('pdfjs-text-coordinate-overlay'),'official PDF evidence uses a text-coordinate highlight overlay');
ok(sourcePdf.includes('serverUpload:false')&&sourcePdf.includes('originalUnmodified:true'),'official source PDFs stay local and unmodified');
ok(sourcePdf.includes('SOURCE_PDF_NOT_ATTACHED'),'PDF evidence fails closed until the source PDF is attached');
const pdf=fs.readFileSync(new URL('./pdf.js',import.meta.url),'utf8');
ok(pdf.includes('exportForSync')&&pdf.includes('importFromSync'),'private extracted text supports owner-scoped member sync');
ok(pdf.includes('deletedDocuments')&&pdf.includes('deletionTombstones:true'),'local private-document deletion uses owner-scoped tombstones');
ok(pdf.includes('serverUpload:false')&&pdf.includes('crossUserSharing:false'),'personal document defaults remain private/no-share');

const liveClosedLoop=fs.readFileSync(new URL('../supabase/tests/v9-live-closed-loop.sql',import.meta.url),'utf8');
for(const table of ['study_user_progress','study_user_answers','study_wrong_answers','study_review_schedule','study_personal_notes','study_private_documents','study_document_chunks','study_sessions','study_exam_history']){
  ok(liveClosedLoop.includes('public.'+table),`live closed-loop covers ${table}`);
}
ok(liveClosedLoop.includes("set_config('request.jwt.claim.sub', a::text, true)")&&liveClosedLoop.includes("set_config('request.jwt.claim.sub', b::text, true)"),'live closed-loop tests two distinct Study identities');
ok(liveClosedLoop.includes('B_CAN_READ_A_DOC')&&liveClosedLoop.includes('B_CAN_INSERT_FOR_A'),'live closed-loop locks cross-owner negative cases');
ok(liveClosedLoop.includes("delete from public.study_document_chunks where id like '__liveqa_%'"),'live closed-loop includes explicit cleanup');
const root=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
ok(!root.includes('/v9/')&&!root.includes('v9/app.js'),'production root remains v8.6 during development');
console.log(JSON.stringify({concepts:V.curriculum.totalConcepts,verifiedPacks:coverage.verified,enrichedPacks:Object.values(V.contentPacks.authored).filter(p=>p.depthEnriched).length,questions:V.questions.length,mock,studyTables},null,2));