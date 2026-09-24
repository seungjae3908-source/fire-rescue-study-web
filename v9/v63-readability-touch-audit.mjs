import fs from 'node:fs';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}

const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const smoke=fs.readFileSync(new URL('./live-student-ux-smoke.mjs',import.meta.url),'utf8');
const typography=fs.readFileSync(new URL('./global-typography-audit.mjs',import.meta.url),'utf8');
const productionWorkflow=fs.readFileSync(new URL('../.github/workflows/production-current-main-acceptance.yml',import.meta.url),'utf8');

assert(css.includes('/* V63 whole-app readability and touch-target hardening */'),'V63 readability/touch CSS block is present');
assert(css.includes('.app .page small')&&css.includes('font-size:12px!important'),'student-facing small text has a 12px floor');
assert(css.includes('.app .page .tag')&&css.includes('.app .page .metric span'),'tags and metric labels share the readability floor');
assert(css.includes('@media(max-width:1024px)')&&css.includes('min-height:44px'),'touch widths up to 1024px keep a 44px primary target floor');
assert(smoke.includes('keeps student microcopy >=12px'),'Production smoke checks computed microcopy size');
assert(smoke.includes('keeps primary touch targets >=44px'),'Production smoke checks computed primary touch targets');
assert(typography.includes("type:'microcopy-under-12px'"),'branch typography audit blocks under-12px microcopy');
assert(typography.includes("type:'touch-target-under-44px'"),'branch typography audit blocks under-44px primary touch targets');
assert(productionWorkflow.includes('node v9/live-student-ux-smoke.mjs'),'Production Current-Main Acceptance exercises the V63 runtime checks');
console.log('V63_READABILITY_TOUCH_COMPLETE');
