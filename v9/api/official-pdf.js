'use strict';

const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

const BASE='https://www.nfa.go.kr';
const LIST=BASE+'/nfsa/releaseinformation/archive/materials/';
const BOARD='bbs_0000000000000035';
const UA='Mozilla/5.0 119-study-official-source-proxy/3.0';
const SOURCES=Object.freeze({
  fire1:{cntId:'106809',name:'10. 소방전술1(화재1).pdf'},
  fire2:{cntId:'106809',name:'11. 소방전술1(화재2).pdf'},
  ems:{cntId:'106811',name:'13. 소방전술3(구급)-저용량.pdf'},
  prevention1:{cntId:'106805',name:'1.예방실무1.pdf'},
  prevention2:{cntId:'106805',name:'2.예방실무2.pdf'},
  law1:{cntId:'106806',name:'3._소방법령1.pdf'},
  law2:{cntId:'106806',name:'4. 소방법령2.pdf'},
  law3:{cntId:'106806',name:'5. 소방법령3.pdf'},
  law4:{cntId:'106806',name:'6. 소방법령4.pdf'},
  law5:{cntId:'106806',name:'7. 소방법령5.pdf'}
});
const cache=new Map();
const PAGES_MIRROR_BASE='https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror';
const PAGES_MIRROR_DOCS=new Set(['prevention1','prevention2','law1','law2','law3','law4','law5']);

function one(v){return Array.isArray(v)?v[0]:v}
function norm(s){return String(s||'').toLowerCase().replace(/&nbsp;|\s|_|-/g,'').replace(/[^0-9a-z가-힣().]/g,'')}
function strip(s){return String(s||'').trim()}
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
function safeName(s){return encodeURIComponent(String(s||'official.pdf')).replace(/['()]/g,escape)}
function detailUrl(src,attempt=0){
  return LIST+'?boardId='+BOARD+'&category=&cntId='+src.cntId+'&mode=view&pageIdx=&searchCondition=&searchKeyword=&_119='+Date.now()+'-'+attempt;
}
function cookieFrom(res){
  const h=res&&res.headers;
  const rows=typeof (h&&h.getSetCookie)==='function'?h.getSetCookie():[(h&&h.get&&h.get('set-cookie'))||''];
  return rows.flatMap(x=>String(x||'').split(/,(?=[^;,]+=)/)).map(x=>x.split(';')[0].trim()).filter(Boolean).join('; ');
}
function mergeCookies(...values){
  const m=new Map();
  for(const value of values)for(const pair of String(value||'').split(';')){
    const p=pair.trim();if(!p)continue;const i=p.indexOf('=');if(i<=0)continue;m.set(p.slice(0,i),p);
  }
  return [...m.values()].join('; ');
}
function normalizeDownloadPath(s){
  return strip(s).replace(/\s*;jsessionid=/gi,';jsessionid=');
}
function stripSessionPath(s){
  return normalizeDownloadPath(s).replace(/;jsessionid=[^?'"()\s]+/gi,'').trim();
}
function candidateVariants(paths){
  const out=[];
  for(const raw of paths||[]){
    const normalized=normalizeDownloadPath(raw);
    for(const p of [normalized,stripSessionPath(normalized)]){
      if(p&&!out.includes(p))out.push(p);
    }
  }
  return out;
}
function pathsFromBlock(block){
  return [...String(block||'').matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)].map(x=>strip(x[1])).filter(x=>/\/board\/file\//i.test(x));
}
function extractAttachmentCandidates(html,expected){
  const source=String(html||''),want=norm(expected);
  for(const m of source.matchAll(/<li[^>]*class=["'][^"']*\bfile\b[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)){
    const block=m[1],nm=(block.match(/class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/i)||[])[1]||'';
    if(nm&&norm(nm)!==want)continue;
    const paths=pathsFromBlock(block);
    if(paths.length)return{name:nm||expected,paths:candidateVariants(paths)};
  }
  const i=source.toLowerCase().indexOf(String(expected).toLowerCase());
  if(i>=0){
    const near=source.slice(Math.max(0,i-2200),Math.min(source.length,i+3200));
    const paths=pathsFromBlock(near);
    if(paths.length)return{name:expected,paths:candidateVariants(paths)};
  }
  return null;
}
function toOfficialUrl(path){
  const raw=String(path||'');
  const trailing=(raw.match(/ +$/)||[''])[0];
  const prepared=trailing?raw.slice(0,-trailing.length)+'%20'.repeat(trailing.length):raw;
  const u=new URL(prepared,BASE);
  if(u.origin!==BASE)throw new Error('OFFICIAL_SOURCE_BAD_ORIGIN');
  if(!u.pathname.startsWith('/board/file/'))throw new Error('OFFICIAL_SOURCE_BAD_PATH');
  return u.href;
}
async function pdfProbe(res){
  if(!res||![200,206].includes(res.status))return false;
  const type=String((res.headers&&res.headers.get&&res.headers.get('content-type'))||'').toLowerCase();
  if(!type.includes('pdf')&&!type.includes('octet-stream'))return false;
  const reader=res.body&&res.body.getReader&&res.body.getReader();
  if(!reader)return type.includes('pdf');
  try{
    const first=await reader.read();
    const head=Buffer.from(first.value||[]).subarray(0,64).toString('latin1');
    return head.includes('%PDF-');
  }finally{
    try{reader.cancel().catch(()=>{})}catch{}
  }
}
async function selectWorkingCandidate(paths,referer,cookie,fetchImpl=fetch){
  for(const path of candidateVariants(paths)){
    let url;
    try{url=toOfficialUrl(path)}catch{continue}
    try{
      const r=await fetchImpl(url,{method:'GET',redirect:'follow',headers:{
        'user-agent':UA,'accept':'application/pdf,*/*;q=0.8','referer':referer,
        ...(cookie?{cookie}:{}),'range':'bytes=0-63','cache-control':'no-cache'
      }});
      if(await pdfProbe(r))return url;
    }catch{}
  }
  return '';
}
function officialCandidateUrls(paths){
  const out=[];
  for(const path of candidateVariants(paths)){
    try{const url=toOfficialUrl(path);if(!out.includes(url))out.push(url)}catch{}
  }
  return out;
}
function typeLooksPdf(res){
  const type=String((res&&res.headers&&res.headers.get&&res.headers.get('content-type'))||'').toLowerCase();
  return type.includes('pdf')||type.includes('octet-stream');
}
function pagesMirrorUrl(doc){
  return PAGES_MIRROR_DOCS.has(doc)?PAGES_MIRROR_BASE+'/'+encodeURIComponent(doc)+'.pdf':'';
}
async function fetchPagesMirror(doc,req,meta=false,fetchImpl=fetch){
  const url=pagesMirrorUrl(doc);if(!url)throw new Error('PAGES_MIRROR_NOT_CONFIGURED');
  const headers={'user-agent':UA,'accept':'application/pdf,*/*;q=0.8','cache-control':'no-cache'};
  const clientRange=(req.headers&&req.headers.range)||'';
  const range=meta?'bytes=0-63':(clientRange||((req.method||'GET')==='GET'?'bytes=0-':''));
  if(range)headers.range=range;
  if(req.headers&&req.headers['if-range'])headers['if-range']=req.headers['if-range'];
  const upstream=await fetchImpl(url,{method:req.method||'GET',headers,redirect:'follow'});
  if(![200,206].includes(upstream.status)||!typeLooksPdf(upstream))throw new Error('PAGES_MIRROR_HTTP_'+(upstream.status||0));
  if(clientRange&&!meta&&upstream.status!==206)throw new Error('PAGES_MIRROR_RANGE_UNSUPPORTED_'+upstream.status);
  const canCheckMagic=(req.method||'GET')!=='HEAD'&&(!range||/^bytes=0-/i.test(range));
  if(canCheckMagic){
    let magicOk=false;try{magicOk=await pdfProbe(upstream.clone())}catch{}
    if(!magicOk)throw new Error('PAGES_MIRROR_NOT_PDF');
  }
  return{
    row:{doc,name:SOURCES[doc].name,url,urls:[url],detailUrl:url,cookie:''},
    upstream,
    transport:'pages-mirror'
  };
}
async function fetchFirstWorkingCandidate(row,req,meta=false,fetchImpl=fetch){
  const baseHeaders={'user-agent':UA,'accept':'application/pdf,*/*;q=0.8','referer':row.detailUrl,'cache-control':'no-cache'};
  if(row.cookie)baseHeaders.cookie=row.cookie;
  const clientRange=(req.headers&&req.headers.range)||'';
  const range=meta?'bytes=0-63':(clientRange||((req.method||'GET')==='GET'?'bytes=0-':''));
  if(range)baseHeaders.range=range;
  if(req.headers&&req.headers['if-range'])baseHeaders['if-range']=req.headers['if-range'];
  let lastStatus=0;
  for(const url of row.urls||[]){
    let upstream;
    try{upstream=await fetchImpl(url,{method:req.method||'GET',headers:baseHeaders,redirect:'follow'})}
    catch{continue}
    lastStatus=upstream.status||0;
    const statusOk=upstream.ok||upstream.status===206;
    if(!statusOk||!typeLooksPdf(upstream)){
      try{await upstream.body?.cancel?.()}catch{}
      continue;
    }
    const canCheckMagic=(req.method||'GET')!=='HEAD'&&(!range||/^bytes=0-/i.test(range));
    if(canCheckMagic){
      let magicOk=false;
      try{magicOk=await pdfProbe(upstream.clone())}catch{}
      if(!magicOk){
        try{await upstream.body?.cancel?.()}catch{}
        continue;
      }
    }
    return{row:{...row,url,urls:[url,...(row.urls||[]).filter(x=>x!==url)]},upstream};
  }
  throw new Error('OFFICIAL_SOURCE_CANDIDATES_UNREACHABLE_'+lastStatus);
}
async function seedSession(attempt){
  try{
    const r=await fetch(LIST+'?_119seed='+Date.now()+'-'+attempt,{redirect:'follow',headers:{
      'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'ko-KR,ko;q=0.9',
      'cache-control':'no-cache','pragma':'no-cache'
    }});
    const cookie=cookieFrom(r);
    try{await r.body?.cancel?.()}catch{}
    return cookie;
  }catch{return ''}
}
async function fetchDetailWithSession(src,attempt,seed='',fetchImpl=fetch){
  const url=detailUrl(src,attempt);
  let cookie=seed,last='';
  for(let pass=0;pass<3;pass++){
    try{
      const res=await fetchImpl(url,{redirect:'follow',headers:{
        'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'ko-KR,ko;q=0.9',
        'cache-control':'no-cache','pragma':'no-cache',
        'referer':pass===0?LIST:url,
        ...(cookie?{cookie}:{})
      }});
      const html=await res.text();
      cookie=mergeCookies(cookie,cookieFrom(res));
      last='HTTP_'+res.status+'_LEN_'+html.length+'_PASS_'+pass;
      if(res.ok){
        const a=extractAttachmentCandidates(html,src.name);
        if(a&&a.paths&&a.paths.length)return{url,cookie,a,last};
      }
    }catch(e){last=String((e&&e.message)||e)}
    if(pass<2)await sleep(120+pass*80);
  }
  return{url,cookie,a:null,last};
}
async function resolveSource(doc,force=false){
  const src=SOURCES[doc];if(!src)throw new Error('UNKNOWN_OFFICIAL_DOCUMENT');
  const cached=cache.get(doc);
  if(!force&&cached&&cached.expires>Date.now())return cached;
  let last='';
  for(let attempt=0;attempt<14;attempt++){
    const seed=await seedSession(attempt);
    const detail=await fetchDetailWithSession(src,attempt,seed);
    last=detail.last||'DETAIL_SESSION_EMPTY';
    const a=detail.a;
    if(!a||!a.paths||!a.paths.length){
      await sleep(Math.min(1200,350+attempt*75));continue;
    }
    const urls=officialCandidateUrls(a.paths);
    if(!urls.length){last='ATTACHMENT_CANDIDATES_INVALID';await sleep(Math.min(1200,350+attempt*75));continue}
    const row={doc,name:a.name||src.name,urls,detailUrl:detail.url,cookie:detail.cookie,expires:Date.now()+10*60*1000};
    cache.set(doc,row);return row;
  }
  throw new Error('OFFICIAL_SOURCE_RESOLVE_FAILED_'+last);
}
function isRefreshableCandidateError(e){
  return /^OFFICIAL_SOURCE_CANDIDATES_UNREACHABLE_(403|404)$/.test(String((e&&e.message)||e||''));
}
async function fetchPdfWith(doc,req,meta=false,deps={}){
  const resolveImpl=deps.resolveImpl||resolveSource;
  const candidateImpl=deps.candidateImpl||fetchFirstWorkingCandidate;
  const sleepImpl=deps.sleepImpl||sleep;
  const maxRefresh=Number.isInteger(deps.maxRefresh)?deps.maxRefresh:3;
  for(let refresh=0;refresh<=maxRefresh;refresh++){
    const row=await resolveImpl(doc,refresh>0);
    try{
      const result=await candidateImpl(row,req,meta);
      cache.set(doc,{...result.row,expires:Date.now()+10*60*1000});
      return result;
    }catch(e){
      if(!isRefreshableCandidateError(e)||refresh>=maxRefresh)throw e;
      cache.delete(doc);
      await sleepImpl(Math.min(500,100+refresh*100));
    }
  }
  throw new Error('OFFICIAL_SOURCE_REFRESH_EXHAUSTED');
}
async function fetchPdfWithPagesFirst(doc,req,meta=false,deps={}){
  const pagesImpl=deps.pagesImpl||fetchPagesMirror;
  const nfaImpl=deps.nfaImpl||((d,r,m)=>fetchPdfWith(d,r,m));
  if(PAGES_MIRROR_DOCS.has(doc)){
    try{return await pagesImpl(doc,req,meta)}
    catch(e){
      const msg=String((e&&e.message)||e||'PAGES_MIRROR_FAILED').slice(0,180);
      if(typeof deps.onMirrorError==='function')deps.onMirrorError(msg);
      else console.warn('OFFICIAL_PDF_PAGES_MIRROR_FALLBACK',JSON.stringify({doc,error:msg}));
    }
  }
  const result=await nfaImpl(doc,req,meta);
  return{...result,transport:result?.transport||'nfa-origin'};
}
async function fetchPdf(doc,req,meta=false){
  return fetchPdfWithPagesFirst(doc,req,meta);
}
function parseByteRange(value,total){
  const m=String(value||'').trim().match(/^bytes=(\d+)-(\d*)$/i);
  if(!m||!Number.isFinite(total)||total<=0)return null;
  const start=Number(m[1]),rawEnd=m[2]?Number(m[2]):total-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(rawEnd)||start<0||start>=total||rawEnd<start)return null;
  const end=Math.min(total-1,rawEnd);
  return{start,end,length:end-start+1,total};
}
function syntheticRangeResponse(upstream,value){
  if(!upstream||upstream.status!==200)return null;
  const total=Number(upstream.headers?.get?.('content-length')||0),r=parseByteRange(value,total);
  if(!r)return null;
  const headers=new Headers(upstream.headers);
  headers.set('content-length',String(r.length));
  headers.set('content-range',`bytes ${r.start}-${r.end}/${r.total}`);
  headers.set('accept-ranges','bytes');
  if(!upstream.body)return new Response(null,{status:206,headers});
  const reader=upstream.body.getReader();
  let offset=0,closed=false;
  const stream=new ReadableStream({
    async pull(controller){
      if(closed)return;
      try{
        while(true){
          const {done,value:chunk}=await reader.read();
          if(done){closed=true;controller.close();return}
          const chunkStart=offset,chunkEnd=offset+chunk.byteLength-1;offset+=chunk.byteLength;
          if(chunkEnd<r.start)continue;
          const from=Math.max(0,r.start-chunkStart),to=Math.min(chunk.byteLength,r.end-chunkStart+1);
          if(to>from)controller.enqueue(chunk.slice(from,to));
          if(chunkEnd>=r.end){
            closed=true;try{await reader.cancel()}catch{}controller.close();
          }
          return;
        }
      }catch(err){closed=true;controller.error(err)}
    },
    async cancel(reason){closed=true;try{await reader.cancel(reason)}catch{}}
  });
  return new Response(stream,{status:206,headers});
}

module.exports=async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Range, If-Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, X-119-Official-Source, X-119-Official-Transport');
  if((req.method||'GET')==='OPTIONS'){res.statusCode=204;return res.end()}
  if(!['GET','HEAD'].includes(req.method||'GET')){
    res.statusCode=405;res.setHeader('Allow','GET, HEAD, OPTIONS');return res.end('Method Not Allowed');
  }
  const doc=one(req.query&&req.query.doc)||'';
  if(!SOURCES[doc]){res.statusCode=400;return res.end('UNKNOWN_OFFICIAL_DOCUMENT')}
  const meta=one(req.query&&req.query.meta)==='1';

  let result;
  try{result=await fetchPdf(doc,req,meta)}
  catch(e){
    const msg=String((e&&e.message)||'OFFICIAL_SOURCE_FETCH_FAILED').slice(0,200);
    console.error('OFFICIAL_PDF_PROXY_ERROR',JSON.stringify({doc,meta,error:msg}));
    res.statusCode=502;return res.end(msg)
  }
  const {row,upstream,transport}=result;
  if(!upstream.ok&&upstream.status!==206){
    res.statusCode=upstream.status||502;
    try{await upstream.body?.cancel?.()}catch{}
    return res.end('OFFICIAL_SOURCE_HTTP_'+(upstream.status||502));
  }

  if(meta){
    let magicOk=false;
    try{magicOk=await pdfProbe(upstream)}catch{}
    res.statusCode=magicOk?200:502;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
    return res.end(JSON.stringify({
      doc,name:row.name,upstreamStatus:upstream.status,magicOk,
      contentType:upstream.headers.get('content-type')||'',
      contentLength:upstream.headers.get('content-length')||'',
      contentRange:upstream.headers.get('content-range')||'',
      acceptRanges:upstream.headers.get('accept-ranges')||''
    }));
  }

  const clientRange=(req.headers&&req.headers.range)||'';
  const ranged=clientRange&&upstream.status===200?syntheticRangeResponse(upstream,clientRange):null;
  const response=ranged||upstream;
  res.statusCode=response.status;
  for(const h of ['content-length','content-range','accept-ranges','etag','last-modified']){
    const v=response.headers.get(h);if(v)res.setHeader(h,v)
  }
  // NFA often serves verified PDF bytes as application/octet-stream.
  // This endpoint is a fixed ten-document PDF allowlist and fetchFirstWorkingCandidate
  // validates the PDF response before it reaches this handler, so normalize for PDF.js.
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition',"inline; filename*=UTF-8''"+safeName(row.name));
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-119-Official-Source','nfa');
  res.setHeader('X-119-Official-Transport',transport||'nfa-origin');
  if(req.method==='HEAD'||!response.body)return res.end();
  try{
    await pipeline(Readable.fromWeb(response.body),res);
    return;
  }catch(e){
    const msg=String((e&&e.message)||e||'STREAM_FAILED').slice(0,200);
    if(res.destroyed||/premature close/i.test(msg)){try{await response.body?.cancel?.()}catch{}return}
    console.error('OFFICIAL_PDF_PROXY_STREAM_ERROR',JSON.stringify({doc,error:msg}));
    try{if(!res.headersSent){res.statusCode=502;return res.end('OFFICIAL_SOURCE_STREAM_FAILED')}res.destroy()}catch{}
  }
};

module.exports.SOURCES=SOURCES;
module.exports.extractAttachmentCandidates=extractAttachmentCandidates;
module.exports.candidateVariants=candidateVariants;
module.exports.normalizeDownloadPath=normalizeDownloadPath;
module.exports.stripSessionPath=stripSessionPath;
module.exports.selectWorkingCandidate=selectWorkingCandidate;
module.exports.officialCandidateUrls=officialCandidateUrls;
module.exports.fetchFirstWorkingCandidate=fetchFirstWorkingCandidate;
module.exports.fetchDetailWithSession=fetchDetailWithSession;
module.exports.isRefreshableCandidateError=isRefreshableCandidateError;
module.exports.fetchPdfWith=fetchPdfWith;
module.exports.fetchPagesMirror=fetchPagesMirror;
module.exports.fetchPdfWithPagesFirst=fetchPdfWithPagesFirst;
module.exports.pagesMirrorUrl=pagesMirrorUrl;
module.exports.PAGES_MIRROR_DOCS=PAGES_MIRROR_DOCS;
module.exports.parseByteRange=parseByteRange;
module.exports.syntheticRangeResponse=syntheticRangeResponse;
module.exports.pdfProbe=pdfProbe;
