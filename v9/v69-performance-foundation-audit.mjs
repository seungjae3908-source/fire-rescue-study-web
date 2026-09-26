import fs from 'node:fs';

function assert(value,message){
  if(!value)throw new Error(message);
  console.log('PASS',message);
}

const index=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const lazy=fs.readFileSync(new URL('./lazy-loader-119.js',import.meta.url),'utf8');
const catalog=fs.readFileSync(new URL('./source-catalog-119.js',import.meta.url),'utf8');
const pdf=fs.readFileSync(new URL('./source-pdf.js',import.meta.url),'utf8');
const proxy=fs.readFileSync(new URL('./api/official-pdf.js',import.meta.url),'utf8');
const config=fs.readFileSync(new URL('./config.js',import.meta.url),'utf8');
const perf=fs.readFileSync(new URL('./performance-budget-audit.mjs',import.meta.url),'utf8');

const external=[...index.matchAll(/<script\b[^>]*\bsrc="\.\/([^"]+\.js)"[^>]*>/g)];
const blocking=external.filter(x=>!/(?:^|\s)(?:defer|async)(?:\s|=|>)/i.test(x[0])).map(x=>x[1]);
assert(external.length>=80,'large legacy bootstrap is still fully enumerated for dependency safety');
assert(blocking.length===0,'all initial external scripts are non-parser-blocking');
assert(lazy.includes('Promise.all(QUESTION_FILES.map(loadScript))'),'deferred question packs are inserted together for parallel network fetch');
assert(!lazy.includes('for(const file of QUESTION_FILES)await loadScript(file)'),'question packs are no longer inserted one-by-one');
assert(lazy.includes("s.async=false"),'parallel question fetch preserves canonical classic-script execution order');
assert(catalog.includes("mirrored(doc)?'range-static':'range-proxy'"),'non-mirrored official textbooks select range-proxy');
assert(pdf.includes("catalog?.transport==='range-proxy'&&catalog?.proxyPdf?'proxy':''"),'PDF viewer recognizes range-proxy transport');
assert(pdf.includes("origin=rangeMode==='mirror'?'official-static-range':'official-proxy-range'"),'PDF viewer records static and proxy range origins separately');
assert(pdf.includes('disableRange:false')&&pdf.includes('disableStream:false')&&pdf.includes('disableAutoFetch:true')&&pdf.includes('rangeChunkSize:65536'),'range viewer requests only required PDF byte ranges');
assert(pdf.includes("official-proxy-full-cache-fallback"),'full PDF blob download remains a bounded fallback instead of the primary proxy path');
assert(proxy.includes("const clientRange=(req.headers&&req.headers.range)||''")&&proxy.includes("res.setHeader('Access-Control-Allow-Headers','Range, If-Range, Content-Type')"),'official proxy forwards browser byte-range requests');
assert(/officialPdfMirrorDocs:\['fire1','fire2','ems'\]/.test(config),'known fast static mirrors remain unchanged');
assert(perf.includes('noParserBlockingScripts:parserBlockingScripts.length===0'),'performance budget prevents parser-blocking bootstrap regression');

console.log('V69_PERFORMANCE_FOUNDATION_AUDIT_SUCCESS');
