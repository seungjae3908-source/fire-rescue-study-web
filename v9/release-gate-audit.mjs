import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','fire-admin-split-119.js','questions.js','questions-fire-admin-split-119.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','question-type-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','study-emphasis-119.js','quality2-study-schema-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js','question-bank-119.js','question-bank-quality2-119.js','question-bank-v58-expansion-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js','questions-verified-v52-fire-breadth-119.js','questions-v52-breadth-batch2-119.js','v60-source-reviewed-promotions-119.js','textbook-grounded-119.js',
  'visual-completion-119.js','quality4-highyield-119.js','calculation-contract-119.js','coverage-map-119.js','source-catalog-119.js','exam-version-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
const V=window.AITUTOR_V9;
const quality4HighYieldAudit=V.Quality4HighYield119?.audit?.()||null;
const audit=V.ContentContract119.audit(),coverage=V.contentPacks.coverage(),fullExamCoverage=V.CoverageMap119?.audit?.(),qa=V.QuestionQuality119.audit(),mock=V.examReadiness(),calcTraining=V.CalculationTraining119?.audit?.();
const perConceptQuestionContract=V.curriculum.concepts.every(c=>{const q=V.QuestionQuality119.forConcept(c.id),d={low:0,mid:0,high:0};for(const x of q)d[x.difficulty]=(d[x.difficulty]||0)+1;return q.length>=6&&d.low>=1&&d.mid>=2&&d.high>=1});
const verifiedQuestions=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B');
const verifiedBySubject={fire:verifiedQuestions.filter(q=>q.subject==='fire').length,ems:verifiedQuestions.filter(q=>q.subject==='ems').length};
const textbookVerifiedQuestions=verifiedQuestions.filter(q=>/소방전술|예방실무|소방법령|공식교재|교재/.test(String(q.source||'')));
const exactPage=/\d+(?:\s*[~\-–]\s*\d+)?\s*쪽|page\s*\d+/i;
const verifiedQuestionPageEvidence=textbookVerifiedQuestions.length>0&&textbookVerifiedQuestions.every(q=>exactPage.test(String(q.source||'')));
const workflow=fs.readFileSync(new URL('../.github/workflows/v9-ci.yml',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const examSession=fs.readFileSync(new URL('./exam-session-119.js',import.meta.url),'utf8');
const examSessionE2E=fs.readFileSync(new URL('./exam-session-e2e.mjs',import.meta.url),'utf8');
const mastery=fs.readFileSync(new URL('./mastery.js',import.meta.url),'utf8');
const auth=fs.readFileSync(new URL('./auth.js',import.meta.url),'utf8');
const lite=fs.readFileSync(new URL('./supabase-lite.js',import.meta.url),'utf8');
const e2e=fs.readFileSync(new URL('./e2e.mjs',import.meta.url),'utf8');
const pdfE2E=fs.readFileSync(new URL('./pdf-e2e.mjs',import.meta.url),'utf8');
const imageE2E=fs.readFileSync(new URL('./image-ocr-e2e.mjs',import.meta.url),'utf8');
const quality4AuditScript=fs.readFileSync(new URL('./quality4-highyield-audit.mjs',import.meta.url),'utf8');
const officialMonitorWorkflow=fs.readFileSync(new URL('../.github/workflows/official-monitor.yml',import.meta.url),'utf8');
const officialMonitorClient=fs.readFileSync(new URL('./official-monitor.js',import.meta.url),'utf8');
const officialMonitorApi=fs.readFileSync(new URL('./api/official-monitor.js',import.meta.url),'utf8');
const officialMonitorApiTest=fs.readFileSync(new URL('./official-monitor-api-test.mjs',import.meta.url),'utf8');
const officialMonitorBrowserTest=fs.readFileSync(new URL('./official-monitor-browser-e2e.mjs',import.meta.url),'utf8');
const accessibilitySmoke=fs.readFileSync(new URL('./accessibility-smoke.mjs',import.meta.url),'utf8');
const analyticsV61=fs.readFileSync(new URL('./analytics-v61-119.js',import.meta.url),'utf8');
const analyticsV61E2E=fs.readFileSync(new URL('./v61-performance-weakness-e2e.mjs',import.meta.url),'utf8');
const productionCurrentMainWorkflow=fs.readFileSync(new URL('../.github/workflows/production-current-main-acceptance.yml',import.meta.url),'utf8');
const productionLiveStudentSmoke=fs.readFileSync(new URL('./live-student-ux-smoke.mjs',import.meta.url),'utf8');
const productionMultiDeviceV62Audit=fs.readFileSync(new URL('./v62-production-multidevice-audit.mjs',import.meta.url),'utf8');
const readabilityTouchV63Audit=fs.readFileSync(new URL('./v63-readability-touch-audit.mjs',import.meta.url),'utf8');
const correctionV64=fs.readFileSync(new URL('./correction-loop-v64-119.js',import.meta.url),'utf8');
const correctionV64Audit=fs.readFileSync(new URL('./v64-correction-loop-audit.mjs',import.meta.url),'utf8');
const correctionV64E2E=fs.readFileSync(new URL('./v64-correction-loop-e2e.mjs',import.meta.url),'utf8');
const singleScrollV65Audit=fs.readFileSync(new URL('./v65-single-scroll-owner-audit.mjs',import.meta.url),'utf8');
const singleScrollV65E2E=fs.readFileSync(new URL('./v65-single-scroll-owner-e2e.mjs',import.meta.url),'utf8');
const wholeAppUxV67Audit=fs.readFileSync(new URL('./v67-whole-app-real-ux-audit.mjs',import.meta.url),'utf8');
const wholeAppUxV67E2E=fs.readFileSync(new URL('./v67-whole-app-real-ux-e2e.mjs',import.meta.url),'utf8');
const stylesCss=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const performanceBudget=fs.readFileSync(new URL('./performance-budget-audit.mjs',import.meta.url),'utf8');
const officialMonitorRootApi=fs.readFileSync(new URL('../api/official-monitor.js',import.meta.url),'utf8');
const authE2E=fs.readFileSync(new URL('./auth-session-e2e.mjs',import.meta.url),'utf8');
const sql=fs.readFileSync(new URL('../supabase/tests/v9-live-closed-loop.sql',import.meta.url),'utf8');

const checks={
  contentAll:audit.total===V.curriculum.totalConcepts&&audit.complete===V.curriculum.totalConcepts&&audit.incomplete===0&&Object.keys(audit.blockers||{}).length===0,
  pageEvidenceAll:coverage.verified===V.curriculum.totalConcepts&&coverage.pending===0,
  fullExamCoverageComplete:!!fullExamCoverage&&fullExamCoverage.missing===0&&fullExamCoverage.partial===0,
  questionContract:qa.examStyle>=1056&&qa.duplicateTexts.length===0&&perConceptQuestionContract,
  verifiedQuestionPageEvidence,
  verifiedSubjectTargets:verifiedBySubject.fire>=250&&verifiedBySubject.ems>=300,
  calculationSixStage:!!calcTraining&&calcTraining.ready===true&&calcTraining.allGeneratedPractice===true&&calcTraining.rows?.length===7,
  realMockVerifiedReady:mock.ready===true&&mock.scopeComplete===true&&mock.fire>=25&&mock.ems>=40&&mock.missingFireScopes.length===0&&mock.missingEmsScopes.length===0,
  pwaOfflineContract:e2e.includes('v9 PWA shell reloads while offline'),
  pdfPrivateRestoreContract:pdfE2E.includes('PDF.js creates at least one private text chunk')&&pdfE2E.includes('PDF chunks are invisible to another local owner'),
  imageOcrRestoreContract:imageE2E.includes('fresh browser context restores image OCR metadata and extracted text for the same owner'),
  ocrQualityBenchmarkContract:imageE2E.includes('OCR benchmark character error rate <= 18%')&&imageE2E.includes('OCR benchmark preserves numeric facts and units')&&imageE2E.includes('OCR benchmark preserves Korean key terms'),
  sessionExpiryContract:authE2E.includes('401 refresh rejection emits SIGNED_OUT')&&lite.includes("function clearSession(event='SIGNED_OUT')"),
  authSyncRemoteFirst:auth.includes('remoteFirstOnSignIn:true')&&auth.includes('remoteFirstOnManualSync:true')&&auth.includes('originalFilesAutoUpload:false'),
  releaseAcceptanceContractPresent:workflow.includes('release_candidate_live_acceptance:'),
  privacyAcceptanceContractPresent:workflow.includes('deployed_private_session_acceptance:'),
  exactPreviewAcceptanceContractPresent:workflow.includes('preview_exact_sha_acceptance:'),
  examVersionTruth:V.ExamVersion119?.audit?.().ready===true,
  adaptiveMasteryV2Contract:mastery.includes("version:'119-mastery-v2'")&&workflow.includes('Adaptive mastery v2 deterministic gate'),
  storageQuotaRecoveryContract:workflow.includes('Local storage quota recovery gate')&&fs.readFileSync(new URL('./store.js',import.meta.url),'utf8').includes("storageCompactionVersion:'quota-v1'"),
  runtimePerformanceBudgetContract:workflow.includes('Static runtime performance budget gate')&&performanceBudget.includes('PERFORMANCE_BUDGET_COMPLETE')&&performanceBudget.includes('totalBytes:1850000'),
  questionSkillFamilyTaxonomy:V.QuestionType119?.audit?.().ready===true&&V.QuestionType119?.policy?.notOfficialExamWeight===true,
  skillFamilyRemediationContract:app.includes('function buildSkillTraining')&&app.includes('data-skill-train')&&e2e.includes('skill-family remediation starts a focused training run'),
  quality4HighYield:quality4HighYieldAudit?.missing===0&&quality4HighYieldAudit?.ready===quality4HighYieldAudit?.total&&quality4AuditScript.includes('QUALITY4_HIGHYIELD_COMPLETE')&&quality4AuditScript.includes('QUALITY4_HIGHYIELD_FAILED'),
  officialNoticeMonitorContract:officialMonitorWorkflow.includes("cron: '17 * * * *'")&&officialMonitorWorkflow.includes('chore/official-monitor-snapshot')&&!officialMonitorWorkflow.includes('git push origin HEAD:main')&&officialMonitorClient.includes('noAutomaticCurriculumMutation:true')&&officialMonitorClient.includes('cachedSnapshotFallback:true')&&officialMonitorClient.includes('scheduleDday:true')&&officialMonitorClient.includes('scheduleCalendarExport:true')&&officialMonitorApi.includes('chore/official-monitor-snapshot')&&officialMonitorApi.includes('MAX_STALE_MS=90*60*1000')&&officialMonitorRootApi.includes("require('../v9/api/official-monitor.js')")&&workflow.includes('Official notice monitor contract gate')&&workflow.includes('official_monitor_live_probe (non-release diagnostic)'),
  officialNoticeMonitorRuntimeTests:workflow.includes('Official monitor root API handler gate')&&workflow.includes('Official monitor offline/cache fallback QA')&&officialMonitorApiTest.includes('OFFICIAL_MONITOR_API_TEST_COMPLETE')&&officialMonitorBrowserTest.includes('OFFICIAL_MONITOR_BROWSER_FALLBACK_COMPLETE'),
  accessibilitySmokeContract:workflow.includes('Keyboard and accessibility semantic smoke QA')&&accessibilitySmoke.includes('ACCESSIBILITY_SMOKE_COMPLETE')&&app.includes('aria-current="page"')&&app.includes('aria-live="polite"'),
  activeExamRecoveryContract:((examSession.includes("version:'119-active-exam-v1'")&&examSession.includes('questionIdsOnly:true'))||(examSession.includes("version:'119-active-exam-v2'")&&examSession.includes('variantSnapshots:true')&&examSession.includes('questionSnapshots')))&&app.includes('persistActiveExam()')&&app.includes('data-exam-timer')&&app.includes('data-exam-abandon')&&workflow.includes('Active exam reload recovery and timer QA')&&examSessionE2E.includes('EXAM_SESSION_RECOVERY_E2E_COMPLETE'),
  performanceWeaknessV61Contract:workflow.includes('V61 performance + weakness analytics audit')&&workflow.includes('V61 performance center + adaptive training QA')&&analyticsV61.includes("version:'119-v61-performance-weakness-center-v1'")&&analyticsV61.includes('localOnly:true')&&analyticsV61.includes('realMockUnchanged:true')&&app.includes('data-stats-weak-train')&&analyticsV61E2E.includes('V61_PERFORMANCE_WEAKNESS_E2E_SUCCESS'),
  productionMultiDeviceV62Contract:workflow.includes('V62 Production multi-device UX gate contract')&&productionCurrentMainWorkflow.includes('node v9/live-student-ux-smoke.mjs')&&productionLiveStudentSmoke.includes('width:360')&&productionLiveStudentSmoke.includes('width:412')&&productionLiveStudentSmoke.includes('width:768')&&productionLiveStudentSmoke.includes('width:1024')&&productionLiveStudentSmoke.includes('width:1440')&&productionLiveStudentSmoke.includes('stats touch layout')&&productionLiveStudentSmoke.includes('h>=44')&&productionMultiDeviceV62Audit.includes('V62_PRODUCTION_MULTIDEVICE_COMPLETE'),
  readabilityTouchV63Contract:workflow.includes('V63 whole-app readability + touch-target contract')&&readabilityTouchV63Audit.includes('V63_READABILITY_TOUCH_COMPLETE')&&stylesCss.includes('/* V63 whole-app readability and touch-target hardening */')&&productionLiveStudentSmoke.includes('keeps student microcopy >=12px')&&productionLiveStudentSmoke.includes('keeps primary touch targets >=44px'),
  correctionLoopV64Contract:workflow.includes('V64 weakness correction closed-loop audit')&&workflow.includes('V64 correction closed-loop + today-goal QA')&&correctionV64.includes("version:'119-v64-weakness-correction-loop-v1'")&&correctionV64.includes('realMockUnchanged:true')&&correctionV64.includes('passCorrect:4')&&correctionV64.includes('passSureCorrect:3')&&app.includes('data-v64-train')&&app.includes("buildCorrectionTraining")&&correctionV64Audit.includes('V64_CORRECTION_LOOP_AUDIT_SUCCESS')&&correctionV64E2E.includes('V64_CORRECTION_LOOP_E2E_SUCCESS'),
  singleVerticalScrollV65Contract:workflow.includes('V65 single vertical scroll owner audit')&&workflow.includes('V65 page-by-page single-scroll browser QA')&&stylesCss.includes('/* V65 single vertical scroll owner */')&&app.includes('data-scroll-owner="home"')&&app.includes('data-scroll-owner="bank"')&&app.includes('data-scroll-owner="exam-active"')&&app.includes('data-scroll-owner="pdf"')&&singleScrollV65Audit.includes('V65_SINGLE_SCROLL_OWNER_AUDIT_SUCCESS')&&singleScrollV65E2E.includes('V65_SINGLE_SCROLL_OWNER_E2E_SUCCESS')&&productionLiveStudentSmoke.includes('single vertical scroll owner'),
  wholeAppRealUxV67Contract:workflow.includes('V67 whole-app real UX contract')&&workflow.includes('V67 whole-app real UX + layout audit')&&productionCurrentMainWorkflow.includes('Production V67 whole-app real UX acceptance')&&wholeAppUxV67Audit.includes('V67_WHOLE_APP_REAL_UX_CONTRACT_SUCCESS')&&wholeAppUxV67E2E.includes('V67_WHOLE_APP_REAL_UX_AUDIT_SUCCESS'),
  liveRlsSqlSafe:sql.includes('__liveqa_')&&sql.includes("execute 'set local role authenticated'")&&sql.includes('B_CAN_READ_A_PROGRESS')&&sql.includes("delete from public.study_document_chunks where id like '__liveqa_%'"),
};
const gitBlobSha=path=>{
  const buf=fs.readFileSync(new URL('../'+path,import.meta.url));
  const h=createHash('sha1');
  h.update(Buffer.from('blob '+buf.length+'\0'));
  h.update(buf);
  return h.digest('hex');
};
let liveEvidence=null;
try{liveEvidence=JSON.parse(fs.readFileSync(new URL('./study-staging-live-proof-119.json',import.meta.url),'utf8'))}catch{}
const liveEvidenceFiles=liveEvidence?.sourceBlobShas||{};
const liveEvidenceBound=!!liveEvidence&&
  liveEvidence.version==='119-study-staging-live-proof-v1'&&
  liveEvidence.projectRef==='petlfbztqguuzkasfpug'&&
  liveEvidence.productionProjectRef==='bawcbkoyovbeajkrnduq'&&
  liveEvidence.projectRef!==liveEvidence.productionProjectRef&&
  liveEvidence.migrationName==='study_v9_release_rls_closed_loop_20260918'&&
  liveEvidence.assertions?.migrationSuccess===true&&
  liveEvidence.assertions?.userARoundTrip===true&&
  liveEvidence.assertions?.userBCannotReadA===true&&
  liveEvidence.assertions?.userBCannotWriteA===true&&
  liveEvidence.assertions?.cleanupVerified===true&&
  liveEvidence.assertions?.investmentProductionTouched===false&&
  Object.entries(liveEvidence.cleanupCounts||{}).every(([,v])=>Number(v)===0)&&
  Object.entries(liveEvidenceFiles).every(([path,sha])=>gitBlobSha(path)===sha);
const stagingLive=liveEvidenceBound;
const blockers=[];
for(const [k,v] of Object.entries(checks))if(!v)blockers.push('CONTRACT_'+k);
if(!stagingLive)blockers.push('STUDY_STAGING_AUTH_SYNC_RLS_LIVE_PROOF_MISSING');
const result={
  version:'119-release-gate-audit-v3',
  examVersion:V.ExamVersion119?.summary?.()||null,
  quality4HighYield:quality4HighYieldAudit,
  content:{complete:audit.complete,total:audit.total,averageScore:audit.averageScore,blockers:audit.blockers},
  pageEvidence:coverage,
  fullExamCoverage:fullExamCoverage?{total:fullExamCoverage.total,covered:fullExamCoverage.covered,partial:fullExamCoverage.partial,missing:fullExamCoverage.missing,implementationPercent:fullExamCoverage.implementationPercent}:null,
  questions:{examStyle:qa.examStyle,duplicateTexts:qa.duplicateTexts.length,verified:verifiedQuestions.length,verifiedBySubject,verifiedTarget:{fire:250,ems:300},textbookVerified:textbookVerifiedQuestions.length,textbookVerifiedExactPage:textbookVerifiedQuestions.filter(q=>exactPage.test(String(q.source||''))).length},
  calculationTraining:calcTraining,
  realMock:{ready:mock.ready,fire:mock.fire,ems:mock.ems,missingFireScopes:mock.missingFireScopes,missingEmsScopes:mock.missingEmsScopes},
  checks,
  stagingLiveRlsProven:stagingLive,
  stagingLiveEvidence:stagingLive?{projectRef:liveEvidence.projectRef,migrationVersion:liveEvidence.migrationVersion,migrationName:liveEvidence.migrationName,verifiedAtUtc:liveEvidence.verifiedAtUtc}:null,
  blockers,
  releaseReady:blockers.length===0,
  productionRuntimeAccepted:false,
  productionAcceptanceRequiredAfterDeploy:true,
  productionRootPromotionAllowed:false
};
console.log('RELEASE_GATE_119',JSON.stringify(result,null,2));
if(blockers.length)process.exitCode=1;
