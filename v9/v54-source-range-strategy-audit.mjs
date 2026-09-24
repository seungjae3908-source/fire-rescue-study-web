import fs from 'node:fs';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const src=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
const cfg=fs.readFileSync(new URL('./config.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./v54-responsive.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(src.includes("proxyRange=!staticRange&&!!catalog?.proxyPdf"),'proxy-only textbooks enter range-first path');
assert(src.includes("disableStream:proxyRange"),'proxy range path disables full streaming and prefers byte ranges');
assert(src.includes("official-proxy-full-cache-fallback"),'full-cache proxy remains an explicit fallback');
assert(/officialPdfMirrorDocs:\['fire1','fire2','ems'\]/.test(cfg),'three known static mirrors stay unchanged');
assert(css.includes('.workspace.study-workspace-single{grid-template-columns:minmax(0,1fr)!important}')&&css.includes('max-width:1439px'),'study stays truly single-pane instead of reserving a legacy empty grid column');
assert(css.includes('.page-home .dashboard-home')&&css.includes('.page-exam .exam-landing'),'tablet dashboard and exam landing use dedicated stacked composition');
assert(sw.includes('./v54-responsive.css')&&/ai-tutor-v9-shell-20260924-v(?:54|55|56|57|58|59|60|61)-/.test(sw),'service worker ships the V54 responsive asset and keeps a V54-or-newer cache generation');
console.log('V54_SOURCE_RANGE_STRATEGY_AUDIT_SUCCESS');
