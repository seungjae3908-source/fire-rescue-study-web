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
const localAi=fs.readFileSync(new URL('./local-ai.js',import.meta.url),'utf8');

const external=[...index.matchAll(/<script\b[^>]*\bsrc="\.\/([^"]+\.js)"[^>]*>/g)];
const blocking=external.filter(x=>!/(?:^|\s)(?:defer|async)(?:\s|=|>)/i.test(x[0])).map(x=>x[1]);
assert(external.length===11&&external.every(x=>/boot-v69-/.test(x[1])),'initial runtime loads exactly 11 V69 bootstrap bundles');
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
assert(perf.includes('noParserBlockingScripts:parserBlockingScripts.length===0')&&perf.includes('jsCount:16'),'performance budget prevents parser-blocking and high-request bootstrap regression');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('./styles.css',import.meta.url),'utf8');
assert(!app.includes('<span>오늘 목표</span><b>\${goal.done}/\${goal.total}</b>'),'home metrics no longer duplicate the full daily-goal card');
assert(!app.includes('class="card dashboard-schedule"'),'home no longer repeats the official schedule beside the hero');
assert(app.includes('class="card dashboard-quick"')&&app.includes('공식 자료')&&app.includes('오답 복습')&&app.includes('성적 분석'),'home replaces duplicate schedule with useful shortcuts');
assert(app.includes('resource-grid')&&app.includes('중앙소방학교 공식 교재'),'resources show source attribution once and use a compact grid');
assert(css.includes('@media(min-width:1600px)')&&css.includes('max-width:1240px!important')&&css.includes('max-width:1320px!important')&&css.includes('max-width:1400px!important'),'1920-class desktop layout uses materially more horizontal space');
assert(app.includes('class="study" data-scroll-owner="study"')&&!app.includes('data-scroll-owner="study-desktop"')&&!app.includes('data-scroll-owner="study-mobile"'),'study has one route-level scroll owner across desktop and mobile');
assert(css.includes('/* V69 study route scroll owner: no short inner reading viewport */')&&css.includes('max-height:none!important')&&css.includes('overflow:visible!important'),'study content is no longer trapped in the former short inner reading viewport');
assert(app.includes("closest('.study[data-scroll-owner=\"study\"]')"),'AI and detail runtime target the route-level study owner');
assert(app.includes('<details class="detail-section detail-fold"')&&app.includes('detailSectionShouldOpen')&&app.includes('/비교|구분|분석|시험|함정|주의|예외|수치|기준|금기|변형|오염/'),'first and high-priority exam-distinction detail sections stay expanded by default');
assert(app.includes("target?.tagName==='DETAILS')target.open=true"),'detail TOC opens a folded section before scrolling to it');
assert(css.includes('/* V69 structured detail folding */')&&css.includes('.detail-fold-summary'),'long detail content is structured as accessible collapsible sections');
assert(localAi.includes('function chooseModel(list=[])')&&localAi.includes('memory>=8')&&localAi.includes('cores>=8'),'local AI model choice is device-aware');
assert(localAi.includes('1\\.5B|1\\.7B|1B|1\\.0B')&&localAi.includes('0\\.5B.*Instruct'),'capable desktops prefer a larger Instruct model while 0.5B remains the bounded low-end fallback');
assert(!localAi.includes("const model=list.find(x=>/0\\.5B.*Instruct"),'0.5B is no longer unconditionally preferred on every WebGPU device');

console.log('V69_PERFORMANCE_FOUNDATION_AUDIT_SUCCESS');
