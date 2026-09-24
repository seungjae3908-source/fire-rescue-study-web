import fs from 'node:fs';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const smoke=fs.readFileSync(new URL('./live-student-ux-smoke.mjs',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const productionWorkflow=fs.readFileSync(new URL('../.github/workflows/production-current-main-acceptance.yml',import.meta.url),'utf8');

const requiredViewports=['width:360','width:390','width:412','width:768','width:1024','width:1440'];
const requiredRoutes=["'home'","'study'","'notes'","'bank'","'exam'","'wrong'","'stats'","'resources'","'settings'"];
for(const token of requiredViewports)assert(smoke.includes(token),'Production smoke includes viewport '+token.replace('width:',''));
for(const route of requiredRoutes)assert(smoke.includes(route),'Production smoke includes route '+route.replaceAll("'",""));
assert(smoke.includes("if(vp.width===390)"),'expensive PDF/source deep checks stay scoped to 390px mobile');
assert(smoke.includes("h>=44"),'Production smoke enforces 44px mobile touch targets');
assert(smoke.includes("stats touch layout"),'Production smoke guards V61 stats mobile overflow');
assert(smoke.includes("runtime/request errors = 0"),'Production smoke fails on browser/runtime request errors');
assert(smoke.includes("runtime.sha===expected"),'Production smoke is pinned to exact runtime SHA');
assert(productionWorkflow.includes('node v9/live-student-ux-smoke.mjs'),'Production Current-Main Acceptance runs the multi-device learner smoke');
assert(css.includes('/* V62 production multi-device usability hardening */'),'V62 responsive hardening CSS is present');
assert(css.includes('.stats-weak-row{min-height:44px}'),'V61 weak rows keep a 44px minimum target');
assert(css.includes('.stats-readiness-strip span{font-size:12px!important;line-height:1.45}'),'V61 readiness labels stay readable');
console.log('V62_PRODUCTION_MULTIDEVICE_COMPLETE');
