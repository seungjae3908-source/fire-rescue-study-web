import fs from 'node:fs';

const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
const lazy=fs.readFileSync(new URL('./lazy-loader-119.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
const localAi=fs.readFileSync(new URL('./local-ai.js',import.meta.url),'utf8');
const runtimeLazy=fs.readFileSync(new URL('./runtime-v69-f2b1.js',import.meta.url),'utf8');
const runtimeAi=fs.readFileSync(new URL('./runtime-v69-e2.js',import.meta.url),'utf8');
const runtimeApp=fs.readFileSync(new URL('./runtime-v69-f2b2.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
const failures=[];
const ok=(v,m)=>{if(v)console.log('PASS',m);else failures.push(m)};

const executable=[...index.matchAll(/<script\s+src="\.\/([^"]+)"[^>]*><\/script>/g)].map(x=>x[1]);
const bundles=["runtime-v69-a1.js","runtime-v69-e1.js","runtime-v69-e2.js","runtime-v69-f1.js","runtime-v69-f2a.js","runtime-v69-f2b1.js","runtime-v69-f2b2.js"];
ok(executable.length===8,'eager executable scripts collapse from 101 to 8');
ok(executable[0]==='config.js'&&bundles.every(x=>executable.includes(x)),'config plus seven startup runtime bundles are executable');
ok(bundles.every(x=>fs.existsSync(new URL('./'+x,import.meta.url))),'all runtime bundles exist');
ok(sw.includes("v69-performance")&&bundles.every(x=>sw.includes("'./"+x+"'")),'service worker precaches V69 bundles');
ok(!/\['bank','exam','wrong','stats','notes'\]/.test(lazy)&&lazy.includes("['bank','exam','wrong','stats']"),'notes no longer blocks on question lane');
ok(lazy.includes('ensureQuestions({background=false}={})')&&app.includes('scheduleQuestionPreload')&&app.includes('ensureQuestions({background:true})'),'question lane preloads in idle without blocking first UI');
ok(lazy.includes("CONTENT_FILE='content-core-v69.js'")&&lazy.includes("QUESTION_CORE_FILE='question-core-v69.js'")&&lazy.includes('ensureContent'),'study content and full question core are deferred behind the first usable home render');
ok(lazy.includes("Promise.all([loadScript(QUESTION_CORE_FILE),...QUESTION_FILES.map(loadScript)])")&&lazy.includes('s.async=false'),'question core and twenty expansion files fetch in parallel while classic-script execution order stays deterministic');
ok(localAi.includes('/1\\.5B.*Instruct/i')&&localAi.includes('경량 AI로 전환 중'),'capable devices prefer a larger local instruct model with lightweight fallback');
ok(app.includes('function wantsTutorNumber')&&app.includes("runtime.aiStatus='공식근거 확인'"),'numeric tutor questions stay grounded and do not invent unavailable numbers');
ok(runtimeLazy.includes("CONTENT_FILE='content-core-v69.js'")&&runtimeLazy.includes('loadScript(QUESTION_CORE_FILE)')&&runtimeAi.includes('/1\\.5B.*Instruct/i')&&runtimeApp.includes('function wantsTutorNumber'),'active runtime bundles contain the same V69 lazy-core and AI safeguards');
ok(source.includes("origin='official-proxy-range'")&&source.includes('disableStream:true')&&source.includes("origin='official-proxy-full-cache-fallback'"),'large proxy textbooks use range-first with bounded fallback');
ok(css.includes('/* V69 desktop density + wide-screen utilization */')&&css.includes('max-width:1280px!important')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),'wide desktop study content expands and detail can use two columns');
ok(!app.includes('<section class="card dashboard-schedule">'),'home duplicate schedule card removed');
ok(app.includes('resource-compact-list')&&!app.includes('<small>중앙소방학교</small>'),'official resource rows are compact and do not repeat source label');

if(failures.length){console.error('V69_AUDIT_FAIL',JSON.stringify(failures));process.exit(1)}
console.log('V69_PERFORMANCE_LAYOUT_AUDIT_SUCCESS');
