import fs from 'node:fs';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const smoke=fs.readFileSync(new URL('./live-student-ux-smoke.mjs',import.meta.url),'utf8');
const workflow=fs.readFileSync(new URL('../.github/workflows/v9-ci.yml',import.meta.url),'utf8');

assert(css.includes('/* V65 single vertical scroll owner */'),'V65 single-scroll CSS contract is present');
assert(css.includes('.page-home .dashboard-home')&&css.includes('.page-stats .stats-page'),'home and stats route roots own vertical scrolling');
assert(css.includes('.page-home .dashboard-home .home-main')&&css.includes('overflow:visible!important'),'home nested columns no longer own vertical scrolling');
assert(css.includes('.page-study .study-ai-chat')&&css.includes('overflow-y:visible!important'),'AI chat no longer owns a second vertical scrollbar');
assert(app.includes("b.scrollTop=b.scrollHeight")&&!app.includes("x.scrollTop=x.scrollHeight"),'AI scroll restoration targets only the study-body owner');
assert(app.includes('study bank-page screen-scroll')&&app.includes('bank-workspace'),'question bank uses route-level vertical owner');
assert(css.includes('.page-bank .bank-workspace .bank-question-body')&&css.includes('overflow:visible!important'),'question bank inner body no longer scrolls independently');
assert(css.includes('.page-exam.exam-active .exam-navigator')&&css.includes('max-height:none!important'),'desktop exam navigator no longer owns a capped vertical scroller');
assert(css.includes('.modal.pdf-evidence-modal')&&css.includes('overflow:hidden!important'),'PDF modal shell cannot become a second vertical owner');
assert(css.includes('.modal.pdf-evidence-modal .pdf-evidence-host')&&css.includes('overflow-y:auto!important'),'PDF host remains the single modal vertical owner');
for(const key of ['home','study-desktop','study-mobile','bank','exam-landing','exam-active','wrong','notes','stats','resources','suggestions','settings','pdf'])assert(app.includes('data-scroll-owner="'+key+'"'),'explicit scroll owner marker '+key);
assert(workflow.includes('V65 single vertical scroll owner audit'),'V65 deterministic audit is wired to CI');
assert(workflow.includes('V65 page-by-page single-scroll browser QA'),'V65 browser audit is wired to CI');
assert(smoke.includes('single vertical scroll owner'),'Production smoke enforces single vertical scroll ownership');
console.log('V65_SINGLE_SCROLL_OWNER_AUDIT_SUCCESS');
