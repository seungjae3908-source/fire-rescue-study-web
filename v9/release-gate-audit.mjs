import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

globalThis.window={AITUTOR_V9:{}};
const files=[
  'curriculum.js','curriculum-complete-2026.js','curriculum-fire-depth-119.js','curriculum-ems-quality2-119.js','master-syllabus-119.js',
  'content-packs.js','questions.js','verified-expansion.js','verified-completion.js','verified-final.js',
  'questions-scope-2026.js','questions-fire-depth-119.js','questions-ems-depth-119.js','questions-ems-restored-verified-119.js','questions-hazmat-depth-119.js',
  'questions-suppression-depth-119.js','questions-governance-depth-119.js','questions-investigation-depth-119.js','questions-facilities-depth-119.js','questions-restored-fire-verified-119.js','questions-quality2-119.js','questions-verified-ems-batch1-119.js','questions-verified-fire-batch1-119.js',
  'question-difficulty.js','question-quality-119.js','question-type-119.js','content-contract-119.js','depth-enrichment.js','depth-enrichment-2.js',
  'content-rich-2026.js','fire-depth-119.js','fire-visuals-119.js','governance-depth-119.js','governance-visuals-119.js',
  'investigation-depth-119.js','investigation-visuals-119.js','facilities-depth-119.js','quality2-content-119.js','facilities-visuals-119.js',
  'hazmat-reference-2026.js','hazmat-depth-119.js','hazmat-visuals-119.js','suppression-depth-119.js','suppression-visuals-119.js',
  'ems-rich-2026.js','ems-depth-119.js','ems-visuals-119.js','exam-gap-enrichment-119.js','quality2-official-gap-content-119.js','quality2-ems-medical-content-119.js','quality2-fire-admin-content-119.js','quality2-global-content-119.js','quality2-comparison-families-119.js','quality4-highyield-119.js','study-emphasis-119.js','quality2-study-schema-119.js',
  'questions-calculation-119.js','questions-calculation-quality2-119.js','calculation-training-v3-119.js','questions-law-119.js','questions-special-combustible-119.js','questions-ems-gap-practice-119.js','questions-final-gap-119.js','questions-pals-advanced-119.js','questions-fire-terminology-119.js','question-bank-119.js','question-bank-quality2-119.js','questions-quality2-gap-119.js','questions-verified-ems-batch2-119.js','questions-verified-ems-batch3-119.js','questions-verified-fire-batch2-119.js','questions-verified-ems-breadth1-119.js','questions-verified-ems-breadth2-119.js','questions-verified-fire-breadth2-119.js','questions-verified-highyield4-119.js','questions-verified-fire-target1-119.js','questions-verified-fire-target2-119.js','questions-verified-ems-target1-119.js','questions-verified-ems-target2-119.js','textbook-grounded-119.js',
  'visual-completion-119.js','calculation-contract-119.js','coverage-map-119.js','source-catalog-119.js','exam-version-119.js'
];
for(const file of files)vm.runInThisContext(fs.readFileSync(new URL('./'+file,import.meta.url),'utf8'),{filename:file});
const V=window.AITUTOR_V9;
const audit=V.ContentContract119.audit(),coverage=V.contentPacks.coverage(),fullExamCoverage=V.CoverageMap119?.audit?.(),qa=V.QuestionQuality119.audit(),mock=V.examReadiness(),calcTraining=V.CalculationTraining119?.audit?.();
const perConceptQuestionContract=V.curriculum.concepts.every(c=>{const q=V.QuestionQuality119.forConcept(c.id),d={low:0,mid:0,high:0};for(const x of q)d[x.difficulty]=(d[x.difficulty]||0)+1;return q.length>=6&&d.low>=1&&d.mid>=2&&d.high>=1});
const verifiedQuestions=(V.questions||[]).filter(q=>q.grade==='A'||q.grade==='B');
const verifiedBySubject={fire:verifiedQuestions.filter(q=>q.subject==='fire').length,ems:verifiedQuestions.filter(q=>q.subject==='ems').length};
const textbookVerifiedQuestions=verifiedQuestions.filter(q=>/소방전술|예방실무|소방법령|공식교재|교재/.test(String(q.source||'')));
const exactPage=/\d+(?:\s*[~\-–]\s*\d+)?\s*쪽|page\s*\d+/i;
const verifiedQuestionPageEvidence=textbookVerifiedQuestions.length>0&&textbookVerifiedQuestions.every(q=>exactPage.test(String(q.source||'')));
const workflow=fs.readFileSync(new URL('../.github/workflows/v9-ci.yml',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const mastery=fs.readFileSync(new URL('./mastery.js',import.meta.url),'utf8');
const auth=fs.readFileSync(new URL('./auth.js',import.meta.url),'utf8');
const lite=fs.readFileSync(new URL('./supabase-lite.js',import.meta.url),'utf8');
const e2e=fs.readFileSync(new URL('./e2e.mjs',import.meta.url),'utf8');
const pdfE2E=fs.readFileSync(new URL('./pdf-e2e.mjs',import.meta.url),'utf8');
const imageE2E=fs.readFileSync(new URL('./image-ocr-e2e.mjs',import.meta.url),'utf8');
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
  questionSkillFamilyTaxonomy:V.QuestionType119?.audit?.().ready===true&&V.QuestionType119?.policy?.notOfficialExamWeight===true,
  skillFamilyRemediationContract:app.includes('function buildSkillTraining')&&app.includes('data-skill-train')&&e2e.includes('skill-family remediation starts a focused training run'),
  quality4HighYield:V.Quality4HighYield119?.audit?.().ready===true&&workflow.includes('Quality 4 high-yield semantic and visual gate'),
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
