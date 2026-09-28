import fs from 'node:fs';

function read(path){return fs.readFileSync(new URL(path,import.meta.url),'utf8')}
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const config=read('./config.js');
const rootIndex=read('../index.html');
const rootSw=read('../sw.js');
const v9Index=read('./index.html');
const catalog=read('./source-catalog-119.js');
const monitor=read('./official-monitor.js');
const boot1=read('./boot-v69-1.js');
const boot7a=read('./boot-v69-7a.js');
const pages=read('../.github/workflows/pages.yml');
const production=read('../.github/workflows/production-current-main-acceptance.yml');
const authenticated=read('../.github/workflows/production-suggestions-authenticated-acceptance.yml');
const liveSmoke=read('./live-student-ux-smoke.mjs');
const suggestionSmoke=read('./suggestions-production-public-e2e.mjs');
const authenticatedSuggestionSmoke=read('./suggestions-production-authenticated-e2e.mjs');

assert(rootIndex.includes('http-equiv="refresh"')&&rootIndex.includes('url=./v9/')&&rootIndex.includes("location.replace(target)"),'GitHub Pages root routes directly to production V9');
assert(rootIndex.includes("key.startsWith('ai-tutor-v8-')")&&rootIndex.includes('reg.scope === rootScope'),'root cutover unregisters only the legacy root worker and clears only V8 caches');
assert(rootSw.includes("key.startsWith('ai-tutor-v8-')")&&rootSw.includes('self.registration.unregister()')&&!rootSw.includes("addEventListener('fetch'"),'legacy root service worker is a self-retiring migration worker and cannot intercept V9 traffic');
assert(v9Index.includes("reg.scope===legacyScope")&&v9Index.includes("key.startsWith('ai-tutor-v8-')")&&v9Index.includes("register('./sw.js',{scope:'./',updateViaCache:'none'})"),'direct V9 entry retires the legacy root worker before registering the V9-scoped worker');
assert(config.includes("officialPdfProxyBase:''"),'browser config disables Vercel PDF proxy');
assert(config.includes("officialMonitorApiBase:''"),'browser config disables server monitor API');
assert(config.includes("officialPdfMirrorBase:'https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror'"),'browser config keeps GitHub Pages PDF mirror');
assert((config.match(/'fire1'|'fire2'|'ems'|'prevention1'|'prevention2'|'law1'|'law2'|'law3'|'law4'|'law5'/g)||[]).length>=10,'browser config includes all 10 official PDF docs');

assert(catalog.includes("const proxyPdf=doc=>proxyBase?"),'PDF proxy route is optional');
assert(catalog.includes("proxyBase?'range-proxy':'official-page'"),'catalog does not claim proxy range when proxy is absent');
assert(monitor.includes("transport:'snapshot-primary'"),'official notice monitor uses static snapshot first');
assert(monitor.includes('snapshotPrimary:true')&&monitor.includes('optionalApiFallback:true'),'official notice policy records static-first transport');
assert(!monitor.includes("rootApiFirst:true"),'official notice monitor no longer requires root API first');

assert(boot1.includes("officialPdfProxyBase:''")&&boot1.includes("officialMonitorApiBase:''"),'bootstrap config matches zero-cost client config');
assert(boot7a.includes("transport:'snapshot-primary'")&&boot7a.includes("const proxyPdf=doc=>proxyBase?"),'bootstrap transport matches canonical static-first sources');

assert(pages.includes('Write exact-main static runtime identity'),'Pages deployment writes exact-main runtime identity');
assert(pages.includes('"transport":"github-pages"'),'runtime identity identifies GitHub Pages transport');
assert(production.includes('https://seungjae3908-source.github.io/fire-rescue-study-web/v9/'),'Production acceptance targets GitHub Pages app');
assert(production.includes('runtime-head.json'),'Production acceptance reads static runtime identity');
assert(production.includes('v71-static-production-e2e.mjs'),'Production acceptance runs V71 static transport QA');
assert(!production.includes('fire-rescue-study-web.vercel.app'),'Production acceptance has no Vercel endpoint');
assert(!production.includes('VERCEL_DEPLOYMENT_DISABLED'),'Production acceptance has no Vercel blocker dependency');

assert(authenticated.includes('https://seungjae3908-source.github.io/fire-rescue-study-web/v9/'),'authenticated suggestion QA targets GitHub Pages');
assert(authenticated.includes('runtime-head.json'),'authenticated suggestion QA reads static runtime identity');
assert(!authenticated.includes('fire-rescue-study-web.vercel.app'),'authenticated suggestion QA has no Vercel endpoint');
assert(!authenticated.includes('VERCEL_DEPLOYMENT_DISABLED'),'authenticated suggestion QA has no Vercel blocker dependency');

assert(liveSmoke.includes('STUDY_119_RUNTIME_HEAD_URL'),'live learner smoke accepts static runtime identity URL');
assert(suggestionSmoke.includes('STUDY_119_RUNTIME_HEAD_URL'),'suggestion smoke accepts static runtime identity URL');
assert(authenticatedSuggestionSmoke.includes('STUDY_119_RUNTIME_HEAD_URL')&&!authenticatedSuggestionSmoke.includes("fetch('/api/runtime-head'"),'authenticated suggestion QA uses the static runtime identity URL and never the removed server API');

console.log('V71_ZERO_COST_STATIC_AUDIT_SUCCESS');
