import fs from 'node:fs';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const pages=fs.readFileSync(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');
const materializer=fs.readFileSync(new URL('./materialize-official-pdf-mirrors.mjs',import.meta.url),'utf8');
const docs=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];

assert(pages.includes('node v9/materialize-official-pdf-mirrors.mjs official-pdf-mirror'),'Pages deploy materializes mirrors through the direct-NFA resolver');
assert(!pages.includes("proxy='https://fire-rescue-study-web.vercel.app/api/official-pdf'"),'Pages mirror build no longer depends on Vercel Production proxy');
assert(pages.includes('study119-official-pdf-2026-v2'),'Pages mirror cache generation is rotated for the ten-book set');
assert(docs.every(doc=>materializer.includes("'"+doc+"'")),'materializer includes all ten canonical official textbooks');
assert(materializer.includes("P.fetchPdfWith(doc,{method:'GET',headers:{}},false)"),'materializer resolves official PDFs directly through the NFA session-aware resolver');
assert(materializer.includes("buf.subarray(0,5).toString('latin1')!=='%PDF-'"),'materializer rejects non-PDF payloads');
assert(docs.every(doc=>pages.includes(doc+'.pdf')),'Pages deployment publishes size/hash truth for all ten mirrors');
console.log('V70_ALL_TEN_PAGES_MIRROR_AUDIT_SUCCESS');
