'use strict';

const { Readable } = require('node:stream');

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
    const original=strip(raw);
    const originalNoSession=original.replace(/;jsessionid=[^?'\"()\s]+/gi,'');
    const normalized=normalizeDownloadPath(original);
    const normalizedNoSession=stripSessionPath(normalized);
    for(const p of [original,originalNoSession,normalized,normalizedNoSession]){
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
  const u=new URL(path,BASE);
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
async function fetchFirstWorkingCandidate(row,req,meta=false,fetchImpl=fetch){
  const baseHeaders={'user-agent':UA,'accept':'application/pdf,*/*;q=0.8','referer':row.detailUrl,'cache-control':'no-cache'};
  if(row.cookie)baseHeaders.cookie=row.cookie;
  const range=meta?'bytes=0-63':(req.headers&&req.headers.range)||'';
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
async function resolveSource(doc,force=false){
  const src=SOURCES[doc];if(!src)throw new Error('UNKNOWN_OFFICIAL_DOCUMENT');
  const cached=cache.get(doc);
  if(!force&&cached&&cached.expires>Date.now())return cached;
  let last='';
  for(let attempt=0;attempt<14;attempt++){
    const seed=await seedSession(attempt);
    const url=detailUrl(src,attempt);
    try{
      const res=await fetch(url,{redirect:'follow',headers:{
        'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'ko-KR,ko;q=0.9',
        'cache-control':'no-cache','pragma':'no-cache','referer':LIST,...(seed?{cookie:seed}:{})
      }});
      const html=await res.text(),cookie=mergeCookies(seed,cookieFrom(res));
      last='HTTP_'+res.status+'_LEN_'+html.length;
      if(!res.ok||html.length<8000||!norm(html).includes(norm(src.name))){
        await sleep(Math.min(1200,350+attempt*75));continue;
      }
      const a=extractAttachmentCandidates(html,src.name);
      if(!a||!a.paths||!a.paths.length){last='ATTACHMENT_PATH_MISSING';await sleep(Math.min(1200,350+attempt*75));continue}
      const urls=officialCandidateUrls(a.paths);
      if(!urls.length){last='ATTACHMENT_CANDIDATES_INVALID';await sleep(Math.min(1200,350+attempt*75));continue}
      const row={doc,name:a.name||src.name,urls,detailUrl:url.split('&_119=')[0],cookie,expires:Date.now()+10*60*1000};
      cache.set(doc,row);return row;
    }catch(e){last=String((e&&e.message)||e)}
    await sleep(Math.min(1200,350+attempt*75));
  }
  throw new Error('OFFICIAL_SOURCE_RESOLVE_FAILED_'+last);
}
async function fetchPdf(doc,req,meta=false,force=false){
  const row=await resolveSource(doc,force);
  try{
    const result=await fetchFirstWorkingCandidate(row,req,meta);
    cache.set(doc,{...result.row,expires:Date.now()+10*60*1000});
    return result;
  }catch(e){
    if(!force){
      cache.delete(doc);
      return fetchPdf(doc,req,meta,true);
    }
    throw e;
  }
}

module.exports=async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Range, If-Range, Content-Type');
  res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges, ETag, Last-Modified, X-119-Official-Source');
  if((req.method||'GET')==='OPTIONS'){res.statusCode=204;return res.end()}
  if(!['GET','HEAD'].includes(req.method||'GET')){
    res.statusCode=405;res.setHeader('Allow','GET, HEAD, OPTIONS');return res.end('Method Not Allowed');
  }
  const doc=one(req.query&&req.query.doc)||'';
  if(!SOURCES[doc]){res.statusCode=400;return res.end('UNKNOWN_OFFICIAL_DOCUMENT')}
  const meta=one(req.query&&req.query.meta)==='1';

  let result;
  try{result=await fetchPdf(doc,req,meta)}
  catch(e){res.statusCode=502;return res.end(String((e&&e.message)||'OFFICIAL_SOURCE_FETCH_FAILED').slice(0,200))}
  const {row,upstream}=result;
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
      contentRange:upstream.headers.get('content-range')||'',
      acceptRanges:upstream.headers.get('accept-ranges')||''
    }));
  }

  res.statusCode=upstream.status;
  for(const h of ['content-type','content-length','content-range','accept-ranges','etag','last-modified']){
    const v=upstream.headers.get(h);if(v)res.setHeader(h,v)
  }
  if(!res.getHeader('Content-Type'))res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition',"inline; filename*=UTF-8''"+safeName(row.name));
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-119-Official-Source','nfa');
  if(req.method==='HEAD'||!upstream.body)return res.end();
  try{Readable.fromWeb(upstream.body).on('error',()=>{try{res.destroy()}catch{}}).pipe(res)}
  catch{res.end(Buffer.from(await upstream.arrayBuffer()))}
};

module.exports.SOURCES=SOURCES;
module.exports.extractAttachmentCandidates=extractAttachmentCandidates;
module.exports.candidateVariants=candidateVariants;
module.exports.normalizeDownloadPath=normalizeDownloadPath;
module.exports.stripSessionPath=stripSessionPath;
module.exports.selectWorkingCandidate=selectWorkingCandidate;
module.exports.officialCandidateUrls=officialCandidateUrls;
module.exports.fetchFirstWorkingCandidate=fetchFirstWorkingCandidate;
module.exports.pdfProbe=pdfProbe;
