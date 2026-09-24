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
assert(css.includes('max-width:1439px')&&css.includes('.page-study .study-rail{display:none!important}'),'tablet-PC/small-PC hides the persistent study rail');
assert(sw.includes('./v54-responsive.css')&&sw.includes('v54-tablet-pc-pdf-range'),'service worker ships the V54 responsive asset with a fresh cache generation');
console.log('V54_SOURCE_RANGE_STRATEGY_AUDIT_SUCCESS');
