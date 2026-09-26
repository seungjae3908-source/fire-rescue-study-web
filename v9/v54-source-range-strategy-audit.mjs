import fs from 'node:fs';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const src=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
const cfg=fs.readFileSync(new URL('./config.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./v54-responsive.css',import.meta.url),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8');
assert(src.includes("catalog?.transport==='range-static'&&catalog?.mirrorPdf?'mirror'")&&src.includes("disableStream:false")&&src.includes("rangeChunkSize:65536"),'verified static mirrors keep the range-first path');
assert(src.includes("catalog?.transport==='range-proxy'")&&src.includes("origin=rangeMode==='mirror'?'official-static-range':'official-proxy-range'")&&src.includes("rangeChunkSize:65536"),'non-mirrored official textbooks use the range-capable proxy before full-cache fallback');
assert(src.includes("official-proxy-fallback"),'static mirror failure still falls back to the official proxy');
assert(/officialPdfMirrorDocs:\['fire1','fire2','ems'\]/.test(cfg),'three known static mirrors stay unchanged');
assert(css.includes('.workspace.study-workspace-single{grid-template-columns:minmax(0,1fr)!important}')&&css.includes('max-width:1439px'),'study stays truly single-pane instead of reserving a legacy empty grid column');
assert(css.includes('.page-home .dashboard-home')&&css.includes('.page-exam .exam-landing'),'tablet dashboard and exam landing use dedicated stacked composition');
const cacheVersion=Number(sw.match(/ai-tutor-v9-shell-\d{8}-v(\d+)-/)?.[1]||0);
assert(sw.includes('./v54-responsive.css')&&cacheVersion>=54,'service worker ships the V54 responsive asset and keeps a V54-or-newer cache generation');
console.log('V54_SOURCE_RANGE_STRATEGY_AUDIT_SUCCESS');
