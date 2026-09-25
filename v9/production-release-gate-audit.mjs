import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const vercel=JSON.parse(read('vercel.json'));
const packageJson=JSON.parse(read('package.json'));
const rootMonitor=read('api/official-monitor.js');
const rootPdf=read('api/official-pdf.js');
const runtimeHead=read('api/runtime-head.js');
const productionAcceptance=read('.github/workflows/production-current-main-acceptance.yml');
const liveStudentSmoke=read('v9/live-student-ux-smoke.mjs');
const runtimeDeps=read('v9/runtime-deps.js');
const productionSuggestionsPublic=read('v9/suggestions-production-public-e2e.mjs');
const developmentCi=read('.github/workflows/v9-ci.yml');
const authenticatedSuggestionAcceptance=read('.github/workflows/production-suggestions-authenticated-acceptance.yml');
const authenticatedSuggestionScript=read('v9/suggestions-production-authenticated-e2e.mjs');
const acceptanceBroker=read('v9/study-119-acceptance-broker.mjs');
const sourceCatalog=read('v9/source-catalog-119.js');
const monitorLib=read('v9/official-monitor-lib.mjs');
const productionCiGate=read('v9/production-ci-gate.mjs');
const productionIgnoreGate=read('v9/production-ci-ignore-gate.mjs');
const acceptanceBrokerPath=fileURLToPath(new URL('study-119-acceptance-broker.mjs',import.meta.url));
execFileSync(process.execPath,['--check',acceptanceBrokerPath],{stdio:'pipe'});
const functionConfig=path=>vercel.functions?.[path]||{};
const inRegion=(path,region)=>Array.isArray(functionConfig(path).regions)&&functionConfig(path).regions.includes(region);
const checks={
  rootRedirect:Array.isArray(vercel.redirects)&&vercel.redirects.some(x=>x.source==='/'&&x.destination==='/v9/'&&x.permanent===false),
  securityHeaders:Array.isArray(vercel.headers)&&vercel.headers.some(x=>x.source==='/(.*)'&&['Cross-Origin-Opener-Policy','Cross-Origin-Embedder-Policy','X-Content-Type-Options','Referrer-Policy'].every(k=>(x.headers||[]).some(h=>h.key===k))),
  featureDeploySuppressed:['feat/**','fix/**','chore/**','build/**','ci/**','test/**'].every(k=>vercel.git?.deploymentEnabled?.[k]===false),
  productionIgnoredBuildStepGate:vercel.ignoreCommand==='node v9/production-ci-ignore-gate.mjs'&&!vercel.installCommand&&!vercel.buildCommand,
  ignoredBuildStepSemantics:productionIgnoreGate.includes('exit 1 means continue the deployment')&&productionIgnoreGate.includes('exit 0 means ignore/cancel the deployment')&&productionIgnoreGate.includes("process.exit(1)")&&productionIgnoreGate.includes("process.exit(0)"),
  productionIgnoreGateUsesCheckoutSha:productionIgnoreGate.includes("execFileSync('git',['rev-parse','HEAD']")&&productionIgnoreGate.includes('MISSING_EXACT_SHA'),
  productionIgnoreGateCanonicalMainIdentity:productionIgnoreGate.includes('/git/ref/heads/main')&&productionIgnoreGate.includes('currentMainSha===sha')&&productionIgnoreGate.includes('CURRENT_MAIN_RUN_NOT_CREATED'),
  productionIgnoreGatePreviewRaceGrace:productionIgnoreGate.includes('NON_MAIN_CONFIRMATIONS_REQUIRED=2')&&productionIgnoreGate.includes('NON_MAIN_IDENTITY_GRACE')&&productionIgnoreGate.includes('NON_MAIN_NO_PUSH_MAIN_RUN'),
  productionIgnoreGateExactSha:productionIgnoreGate.includes('VERCEL_GIT_COMMIT_SHA||gitSha()')&&productionIgnoreGate.includes("head_sha=${encodeURIComponent(sha)}"),
  productionIgnoreGatePushMainOnly:productionIgnoreGate.includes("x?.head_branch==='main'")&&productionIgnoreGate.includes("x?.event==='push'"),
  productionIgnoreGateWorkflow:productionIgnoreGate.includes("const WORKFLOW='V9 Development CI'")&&productionIgnoreGate.includes("run.conclusion==='success'"),
  productionIgnoreGateFailClosed:productionIgnoreGate.includes('TIMEOUT_WAITING_FOR_EXACT_MAIN_CI')&&productionIgnoreGate.includes('INVALID_MAIN_REF')&&productionIgnoreGate.includes("ignore('EXACT_MAIN_CI_NOT_SUCCESS'")&&productionIgnoreGate.includes("ignore('TIMEOUT_WAITING_FOR_EXACT_MAIN_CI'"),
  productionCiGateWaitBudget:productionIgnoreGate.includes('const TIMEOUT_MS=20*60_000')&&productionCiGate.includes('const TIMEOUT_MS=20*60_000'),
  legacyGateStillEnvIndependent:productionCiGate.includes("execFileSync('git',['rev-parse','HEAD']")&&!productionCiGate.includes("if(!isVercel)")&&!productionCiGate.includes('MISSING_GIT_REF'),
  node22Runtime:packageJson.engines?.node==='22.x',
  officialMonitorSeoulRegion:inRegion('api/official-monitor.js','icn1'),
  officialMonitorDuration:Number(functionConfig('api/official-monitor.js').maxDuration)>=60,
  monitorRootRoute:rootMonitor.includes("require('../v9/api/official-monitor.js')"),
  pdfRootRoute:rootPdf.includes("require('../v9/api/official-pdf.js')"),
  pdfClientRoute:sourceCatalog.includes("/api/official-pdf?doc="),
  pdfAllowlistedProxy:sourceCatalog.includes('arbitraryUrlProxy:false')&&sourceCatalog.includes('allCatalogDocsProxyable:true'),
  runtimeHeadRoute:runtimeHead.includes('VERCEL_GIT_COMMIT_SHA')&&runtimeHead.includes('RUNTIME_GIT_SHA_UNAVAILABLE')&&runtimeHead.includes("Cache-Control','no-store, max-age=0"),
  postDeployProductionAcceptance:productionAcceptance.includes('workflow_run:')&&productionAcceptance.includes('V9 Development CI')&&productionAcceptance.includes('PRODUCTION_EXACT_HEAD_READY')&&productionAcceptance.includes('live-student-ux-smoke.mjs'),
  postDeployAcceptanceExactHead:productionAcceptance.includes('github.event.workflow_run.head_sha')&&liveStudentSmoke.includes("fetch('/api/runtime-head'")&&liveStudentSmoke.includes('runtime.sha===expected'),
  productionRuntimeDepsNoLocalProbe:runtimeDeps.includes("const local=()=>")&&runtimeDeps.includes("deps('../node_modules/pdfjs-dist/build/pdf.min.mjs'")&&runtimeDeps.includes("deps('../node_modules/tesseract.js/dist/tesseract.esm.min.js'"),
  postDeploySuggestionPublicAcceptance:productionAcceptance.includes('suggestions-production-public-e2e.mjs')&&productionSuggestionsPublic.includes('LOGIN_REQUIRED')&&productionSuggestionsPublic.includes('study_suggestions')&&productionSuggestionsPublic.includes('study_admins')&&productionSuggestionsPublic.includes('anonymous Data API read is blocked'),
  prSuggestionPublicProbe:developmentCi.includes('suggestions_public_production_probe')&&developmentCi.includes('github.event.pull_request.base.sha')&&developmentCi.includes('suggestions-production-public-e2e.mjs'),
  authenticatedSuggestionGatePrepared:authenticatedSuggestionAcceptance.includes('workflow_dispatch:')&&authenticatedSuggestionAcceptance.includes('Wait for exact SHA to become Production')&&authenticatedSuggestionAcceptance.includes('suggestions-production-authenticated-e2e.mjs'),
  authenticatedSuggestionAutoChain:authenticatedSuggestionAcceptance.includes('workflow_run:')&&authenticatedSuggestionAcceptance.includes('Production Current-Main Acceptance')&&authenticatedSuggestionAcceptance.includes("github.event.workflow_run.conclusion == 'success'")&&authenticatedSuggestionAcceptance.includes("github.event.workflow_run.head_branch == 'main'")&&authenticatedSuggestionAcceptance.includes('github.event.workflow_run.head_sha'),
  authenticatedSuggestionOidcBroker:authenticatedSuggestionAcceptance.includes('id-token: write')&&authenticatedSuggestionAcceptance.includes('study-119-production-acceptance')&&authenticatedSuggestionAcceptance.includes('ACTIONS_ID_TOKEN_REQUEST_URL')&&authenticatedSuggestionAcceptance.includes('ACTIONS_ID_TOKEN_REQUEST_TOKEN')&&authenticatedSuggestionAcceptance.includes('study-119-acceptance-broker')&&authenticatedSuggestionAcceptance.includes("--data '{\"action\":\"provision\"}'")&&authenticatedSuggestionAcceptance.includes("--data '{\"action\":\"cleanup\"}'")&&authenticatedSuggestionAcceptance.includes('if: always()')&&!authenticatedSuggestionAcceptance.includes('secrets.STUDY_119_'),
  acceptanceBrokerSyntaxChecked:true,
  acceptanceBrokerOidcLocked:acceptanceBroker.includes("const ISSUER='https://token.actions.githubusercontent.com'")&&acceptanceBroker.includes("const AUDIENCE='study-119-production-acceptance'")&&acceptanceBroker.includes("const REPOSITORY='seungjae3908-source/fire-rescue-study-web'")&&acceptanceBroker.includes("const REPOSITORY_ID='1372826486'")&&acceptanceBroker.includes("const OWNER_ID='301420524'")&&acceptanceBroker.includes("const REF='refs/heads/main'")&&acceptanceBroker.includes('production-suggestions-authenticated-acceptance.yml@${REF}')&&acceptanceBroker.includes('jwtVerify(token,JWKS')&&acceptanceBroker.includes("['workflow_run','workflow_dispatch']"),
  acceptanceBrokerServerOnlyServiceRole:acceptanceBroker.includes("env('SUPABASE_SERVICE_ROLE_KEY')")&&!authenticatedSuggestionAcceptance.includes('SUPABASE_SERVICE_ROLE_KEY'),
  acceptanceBrokerMembershipConstraintCompatible:acceptanceBroker.includes("user_metadata:{qa:true,app_scope:'study-v9'}")&&!acceptanceBroker.includes("client.from('study_memberships').insert")&&!acceptanceBroker.includes("source:'production-acceptance-oidc'"),
  acceptanceBrokerEphemeralUsers:acceptanceBroker.includes('client.auth.admin.createUser')&&acceptanceBroker.includes('email_confirm:true')&&acceptanceBroker.includes("app_scope:'study-v9-qa'")&&acceptanceBroker.includes("user_metadata:{qa:true,app_scope:'study-v9'}")&&acceptanceBroker.includes('acceptance_run_id:runId')&&acceptanceBroker.includes("client.from('study_admins').insert"),
  acceptanceBrokerScopedCleanup:acceptanceBroker.includes('acceptance_broker===true')&&acceptanceBroker.includes('meta.acceptance_repo===REPOSITORY')&&acceptanceBroker.includes("(!runId||String(meta.acceptance_run_id||'')===runId)")&&acceptanceBroker.includes('client.auth.admin.deleteUser(user.id)')&&acceptanceBroker.includes('const cleaned=await cleanupRun(client);')&&acceptanceBroker.includes('await cleanupRun(client);')&&!acceptanceBroker.includes("client.from('study_suggestions').delete().eq('user_id',user.id)"),
  authenticatedSuggestionNoStudySync:authenticatedSuggestionScript.includes('SupabaseLite.createClient')&&authenticatedSuggestionScript.includes('study_suggestions')&&authenticatedSuggestionScript.includes('study_admins')&&!authenticatedSuggestionScript.includes('V.Auth.signIn')&&!authenticatedSuggestionScript.includes('syncAll'),
  authenticatedSuggestionIsolation:authenticatedSuggestionScript.includes('member cannot read another user suggestion through Production RLS')&&authenticatedSuggestionScript.includes('member cannot mutate admin-only reply or status through Production RLS'),
  authenticatedSuggestionCleanup:authenticatedSuggestionScript.includes('member deletes own temporary suggestion')&&authenticatedSuggestionScript.includes('admin deletes own temporary isolation suggestion')&&authenticatedSuggestionScript.includes('finally')&&authenticatedSuggestionScript.includes("await query(side?.page,'delete',value)")&&authenticatedSuggestionScript.includes("const check=await query(admin?.page||side?.page,'get',value)")&&authenticatedSuggestionScript.includes('if(check?.ok&&!check.data)'),
  canonicalSupplementalMonitor:monitorLib.includes('https://www.nfa.go.kr/nfsa/news/0011/job/?pageIdx=1')&&monitorLib.includes('https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/')&&!monitorLib.includes('https://cherish.nfsa.go.kr/'),
  requiredRecruitmentSource:monitorLib.includes('https://gongmuwon.gosi.kr/spcsv/indexMain3.do')
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const summary={version:'119-v66-production-release-gate-v20',checks,blockers,ready:blockers.length===0};
console.log('PRODUCTION_RELEASE_GATE_119',JSON.stringify(summary,null,2));
if(blockers.length)throw Error('PRODUCTION_RELEASE_GATE_FAILED '+JSON.stringify(blockers));
console.log('PRODUCTION_RELEASE_GATE_COMPLETE');
