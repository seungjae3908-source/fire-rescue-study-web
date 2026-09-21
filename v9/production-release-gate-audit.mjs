import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const vercel=JSON.parse(read('vercel.json'));
const rootMonitor=read('api/official-monitor.js');
const rootPdf=read('api/official-pdf.js');
const sourceCatalog=read('v9/source-catalog-119.js');
const monitorLib=read('v9/official-monitor-lib.mjs');
const productionCiGate=read('v9/production-ci-gate.mjs');
const gatePath=fileURLToPath(new URL('./production-ci-gate.mjs',import.meta.url));
const gateProbe=overrides=>spawnSync(process.execPath,[gatePath],{
  env:{...process.env,VERCEL:'',VERCEL_GIT_COMMIT_REF:'',VERCEL_GIT_COMMIT_SHA:'',...overrides},
  encoding:'utf8',
  timeout:5000
});
const localProbe=gateProbe({});
const previewProbe=gateProbe({VERCEL:'1',VERCEL_GIT_COMMIT_REF:'fix/probe'});
const missingRefProbe=gateProbe({VERCEL:'1'});
const functionConfig=path=>vercel.functions?.[path]||{};
const inRegion=(path,region)=>Array.isArray(functionConfig(path).regions)&&functionConfig(path).regions.includes(region);
const checks={
  rootRedirect:Array.isArray(vercel.redirects)&&vercel.redirects.some(x=>x.source==='/'&&x.destination==='/v9/'&&x.permanent===false),
  securityHeaders:Array.isArray(vercel.headers)&&vercel.headers.some(x=>x.source==='/(.*)'&&['Cross-Origin-Opener-Policy','Cross-Origin-Embedder-Policy','X-Content-Type-Options','Referrer-Policy'].every(k=>(x.headers||[]).some(h=>h.key===k))),
  featureDeploySuppressed:['feat/**','fix/**','chore/**','build/**','ci/**','test/**'].every(k=>vercel.git?.deploymentEnabled?.[k]===false),
  productionInstallWaitsForExactMainCi:vercel.installCommand==='node v9/production-ci-gate.mjs'&&!vercel.buildCommand,
  productionGateUsesVercelGitIdentity:productionCiGate.includes("process.env.VERCEL||''")&&productionCiGate.includes('VERCEL_GIT_COMMIT_REF'),
  productionGateMissingRefFailsClosed:productionCiGate.includes("reason:'MISSING_GIT_REF'")&&productionCiGate.includes('if(!ref)'),
  productionGatePreviewOnlyByNonMainRef:productionCiGate.includes("if(ref!=='main')")&&productionCiGate.includes("reason:'NON_MAIN'"),
  productionGateNoEnvironmentBypass:!productionCiGate.includes("env!=='production'")&&!productionCiGate.includes('VERCEL_TARGET_ENV'),
  productionGateLocalRuntimeBypass:localProbe.status===0&&localProbe.stdout.includes('NOT_VERCEL'),
  productionGatePreviewRuntimeBypass:previewProbe.status===0&&previewProbe.stdout.includes('NON_MAIN'),
  productionGateMissingRefRuntimeFailClosed:missingRefProbe.status===1&&missingRefProbe.stderr.includes('MISSING_GIT_REF'),
  productionGateExactSha:productionCiGate.includes('VERCEL_GIT_COMMIT_SHA')&&productionCiGate.includes("head_sha=${encodeURIComponent(sha)}"),
  productionGatePushMainOnly:productionCiGate.includes("x?.head_branch==='main'")&&productionCiGate.includes("x?.event==='push'"),
  productionGateWorkflow:productionCiGate.includes("const WORKFLOW='V9 Development CI'")&&productionCiGate.includes("run.conclusion==='success'"),
  productionGateFailClosed:productionCiGate.includes('TIMEOUT_WAITING_FOR_EXACT_MAIN_CI')&&productionCiGate.includes("process.exit(1)"),
  officialMonitorSeoulRegion:inRegion('api/official-monitor.js','icn1'),
  officialMonitorDuration:Number(functionConfig('api/official-monitor.js').maxDuration)>=60,
  monitorRootRoute:rootMonitor.includes("require('../v9/api/official-monitor.js')"),
  pdfRootRoute:rootPdf.includes("require('../v9/api/official-pdf.js')"),
  pdfClientRoute:sourceCatalog.includes("/api/official-pdf?doc="),
  pdfAllowlistedProxy:sourceCatalog.includes('arbitraryUrlProxy:false')&&sourceCatalog.includes('allCatalogDocsProxyable:true'),
  canonicalSupplementalMonitor:monitorLib.includes('https://www.nfa.go.kr/nfsa/news/0011/job/?pageIdx=1')&&monitorLib.includes('https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/')&&!monitorLib.includes('https://cherish.nfsa.go.kr/'),
  requiredRecruitmentSource:monitorLib.includes('https://gongmuwon.gosi.kr/spcsv/indexMain3.do')
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const summary={version:'119-v20-production-release-gate-v7',checks,blockers,ready:blockers.length===0};
console.log('PRODUCTION_RELEASE_GATE_119',JSON.stringify(summary,null,2));
if(blockers.length)throw Error('PRODUCTION_RELEASE_GATE_FAILED '+JSON.stringify(blockers));
console.log('PRODUCTION_RELEASE_GATE_COMPLETE');
