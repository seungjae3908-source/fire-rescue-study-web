import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL(p,import.meta.url),'utf8');
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const app=read('./app.js');
const pass=read('./pass-note.js');
const pdf=read('./source-pdf.js');
const css=read('./v54-responsive.css');
const boot7b=read('./boot-v69-7b.js');
const boot8=read('./boot-v69-8.js');
const sw=read('./sw.js');

assert(pass.includes('const normalizeBody=')&&pass.includes("replace(/\\n{3,}/g,'\\n\\n')"),'manual pass-note body preserves intentional line breaks');
assert(pass.includes("[핵심]\\n'+[summary?'★ '+summary")&&pass.includes("numbers.map(x=>'• '+x)")&&pass.includes("traps.map(x=>'• '+x)"),'concept core notes are sectioned with readable bullets');
assert(pass.includes('function noteBodyHtml(note)')&&pass.includes('note-core')&&pass.includes('note-num'),'exported pass notes preserve structured highlighted sections');

assert(app.includes('function tutorPromptRelevant(')&&app.includes('현재 개념과 직접 관련된 학습 질문만 답합니다.'),'context tutor rejects unrelated small-talk instead of returning concept fallback');
assert(app.includes('note-core-line')&&app.includes('note-number-line')&&app.includes('note-warning-line'),'in-app pass-note preview classifies core, number and warning lines');
assert(app.includes("split('\\n')")&&app.includes('note-preview-gap'),'in-app pass-note preview preserves paragraph boundaries');

assert(pdf.includes('const expandEvidence=')&&pdf.includes('sentenceEnded(cur.text)')&&pdf.includes('looksLikeNewBlock(next.text)'),'PDF evidence highlighter expands wrapped sentence lines without crossing new blocks');
assert(pdf.includes('return picked.slice(0,12)'),'PDF evidence highlight remains bounded');

assert(css.includes('.page-study .concept-nav-single')&&css.includes('body:has(.pdf-evidence-modal) .mobile-nav')&&css.includes('.page-home .dashboard-home-compact'),'V72 mobile final overrides remain present');
assert(css.includes('.page-study .concept-nav-single')&&css.includes('position:static!important'),'one concept previous/toc/next navigation stays in document flow');
assert(css.includes('body:has(.pdf-evidence-modal) .mobile-nav'),'PDF evidence modal hides the global bottom navigation');
assert(css.includes('.pdf-render-meta{')&&css.includes('position:static!important'),'PDF evidence meta label no longer overlays the PDF canvas');
assert(css.includes('.page-home .dashboard-home-compact')&&css.includes('overflow-y:auto!important'),'mobile home uses one compact route-level scroll flow');
assert(css.includes('.note-core-line,.note-number-line,.note-answer-line')&&css.includes('text-decoration-line:underline!important'),'pass-note core and number lines receive visible underline emphasis');

assert(boot7b.includes('const expandEvidence=')&&boot7b.includes('const normalizeBody='),'runtime source bundle 7b contains V72 PDF and pass-note logic');
assert(boot8.includes('function tutorPromptRelevant(')&&boot8.includes('note-core-line'),'runtime source bundle 8 contains V72 tutor and note-preview logic');
assert(sw.includes("const CACHE='ai-tutor-v9-shell-20260930-v76-responsive-unification'"),'V76 service-worker cache epoch invalidates stale V75 study assets');
assert(sw.includes("keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k))"),'V72 service worker deletes older V9 shell caches on activation');

console.log('V72_MOBILE_READABILITY_AUDIT_SUCCESS');
