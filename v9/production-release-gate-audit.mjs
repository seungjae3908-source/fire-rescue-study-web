import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const vercel=JSON.parse(read('vercel.json'));
const rootMonitor=read('api/official-monitor.js');
const rootPdf=read('api/official-pdf.js');
const sourceCatalog=read('v9/source-catalog-119.js');
const monitorLib=read('v9/official-monitor-lib.mjs');
const checks={
  rootRedirect:Array.isArray(vercel.redirects)&&vercel.redirects.some(x=>x.source==='/'&&x.destination==='/v9/'&&x.permanent===false),
  securityHeaders:Array.isArray(vercel.headers)&&vercel.headers.some(x=>x.source==='/(.*)'&&['Cross-Origin-Opener-Policy','Cross-Origin-Embedder-Policy','X-Content-Type-Options','Referrer-Policy'].every(k=>(x.headers||[]).some(h=>h.key===k))),
  featureDeploySuppressed:['feat/**','fix/**','chore/**','build/**','ci/**','test/**'].every(k=>vercel.git?.deploymentEnabled?.[k]===false),
  monitorRootRoute:rootMonitor.includes("require('../v9/api/official-monitor.js')"),
  pdfRootRoute:rootPdf.includes("require('../v9/api/official-pdf.js')"),
  pdfClientRoute:sourceCatalog.includes("/api/official-pdf?doc="),
  pdfAllowlistedProxy:sourceCatalog.includes('arbitraryUrlProxy:false')&&sourceCatalog.includes('allCatalogDocsProxyable:true'),
  canonicalSupplementalMonitor:monitorLib.includes('https://www.nfa.go.kr/nfsa/news/0011/job/?pageIdx=1')&&monitorLib.includes('https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/')&&!monitorLib.includes('https://cherish.nfsa.go.kr/'),
  requiredRecruitmentSource:monitorLib.includes('https://gongmuwon.gosi.kr/spcsv/indexMain3.do')
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const summary={version:'119-v16-production-release-gate-v1',checks,blockers,ready:blockers.length===0};
console.log('PRODUCTION_RELEASE_GATE_119',JSON.stringify(summary,null,2));
if(blockers.length)throw Error('PRODUCTION_RELEASE_GATE_FAILED '+JSON.stringify(blockers));
console.log('PRODUCTION_RELEASE_GATE_COMPLETE');
