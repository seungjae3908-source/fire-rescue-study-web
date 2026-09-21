import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const vercel=JSON.parse(read('vercel.json'));
const packageJson=JSON.parse(read('package.json'));
const rootMonitor=read('api/official-monitor.js');
const rootPdf=read('api/official-pdf.js');
const runtimeHead=read('api/runtime-head.js');
const productionAcceptance=read('.github/workflows/production-current-main-acceptance.yml');
const liveStudentSmoke=read('v9/live-student-ux-smoke.mjs');
const runtimeDeps=read('v9/runtime-deps.js');
const sourceCatalog=read('v9/source-catalog-119.js');
const monitorLib=read('v9/official-monitor-lib.mjs');
const productionCiGate=read('v9/production-ci-gate.mjs');
const productionIgnoreGate=read('v9/production-ci-ignore-gate.mjs');
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
  canonicalSupplementalMonitor:monitorLib.includes('https://www.nfa.go.kr/nfsa/news/0011/job/?pageIdx=1')&&monitorLib.includes('https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/')&&!monitorLib.includes('https://cherish.nfsa.go.kr/'),
  requiredRecruitmentSource:monitorLib.includes('https://gongmuwon.gosi.kr/spcsv/indexMain3.do')
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const summary={version:'119-v24-production-release-gate-v12',checks,blockers,ready:blockers.length===0};
console.log('PRODUCTION_RELEASE_GATE_119',JSON.stringify(summary,null,2));
if(blockers.length)throw Error('PRODUCTION_RELEASE_GATE_FAILED '+JSON.stringify(blockers));
console.log('PRODUCTION_RELEASE_GATE_COMPLETE');
