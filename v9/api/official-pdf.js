'use strict';

const { Readable } = require('node:stream');

const BASE='https://www.nfa.go.kr';
const BOARD='bbs_0000000000000035';
const UA='Mozilla/5.0 119-study-official-source-proxy/2.0';
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
function strip(s){return String(s||'').trim().replace(/^\s+|\s+$/g,'')}
function safeName(s){return encodeURIComponent(String(s||'official.pdf')).replace(/['()]/g,escape)}
function detailUrl(src,attempt=0){
  return `${BASE}/nfsa/releaseinformation/archive/materials/?boardId=${BOARD}&category=&cntId=${src.cntId}&mode=view&pageIdx=&searchCondition=&searchKeyword=&_119=${Date.now()}-${attempt}`;
}
function cookieFrom(res){
  const raw=res.headers.get('set-cookie')||'';
  return raw.split(',').map(x=>x.split(';')[0].trim()).filter(Boolean).join('; ');
}
function extractAttachment(html,expected){
  const want=norm(expected);
  for(const m of html.matchAll(/<li[^>]*class=["'][^"']*\bfile\b[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)){
    const block=m[1];
    const nm=block.match(/class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/i)?.[1]||'';
    if(nm&&norm(nm)!==want)continue;
    const paths=[...block.matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)].map(x=>strip(x[1]));
    const pdfPath=paths.find(x=>/pdfFileDownload/i.test(x))||paths.find(x=>/\/board\/file\//i.test(x));
    if(pdfPath)return{name:nm||expected,path:pdfPath};
  }
  // Fallback: locate the expected filename, then search nearby for its PDF download button.
  const i=html.toLowerCase().indexOf(String(expected).toLowerCase());
  if(i>=0){
    const near=html.slice(Math.max(0,i-1800),Math.min(html.length,i+2600));
    const paths=[...near.matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)].map(x=>strip(x[1]));
    const pdfPath=paths.find(x=>/pdfFileDownload/i.test(x))||paths.find(x=>/\/board\/file\//i.test(x));
    if(pdfPath)return{name:expected,path:pdfPath};
  }
  return null;
}
async function resolveSource(doc,force=false){
  const src=SOURCES[doc];if(!src)throw new Error('UNKNOWN_OFFICIAL_DOCUMENT');
  const cached=cache.get(doc);
  if(!force&&cached&&cached.expires>Date.now())return cached;
  let last='';
  for(let attempt=0;attempt<8;attempt++){
    const url=detailUrl(src,attempt);
    try{
      const res=await fetch(url,{redirect:'follow',headers:{
        'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'ko-KR,ko;q=0.9',
        'cache-control':'no-cache','pragma':'no-cache'
      }});
      const html=await res.text();last='HTTP_'+res.status;
      if(!res.ok)continue;
      const a=extractAttachment(html,src.name);
      if(!a)continue;
      const row={
        doc,name:a.name||src.name,
        url:a.path.startsWith('http')?a.path:BASE+a.path,
        detailUrl:url.split('&_119=')[0],
        cookie:cookieFrom(res),
        expires:Date.now()+10*60*1000
      };
      cache.set(doc,row);return row;
    }catch(e){last=String(e?.message||e)}
  }
  throw new Error('OFFICIAL_SOURCE_RESOLVE_FAILED_'+last);
}
async function fetchPdf(doc,req,meta=false,force=false){
  const row=await resolveSource(doc,force);
  const headers={'user-agent':UA,'accept':'application/pdf,*/*;q=0.8','referer':row.detailUrl};
  if(row.cookie)headers.cookie=row.cookie;
  if(meta)headers.range='bytes=0-0';
  else if(req.headers.range)headers.range=req.headers.range;
  if(req.headers['if-range'])headers['if-range']=req.headers['if-range'];
  const upstream=await fetch(row.url,{method:req.method,headers,redirect:'follow'});
  if((upstream.status===403||upstream.status===404)&&!force){
    try{await upstream.body?.cancel?.()}catch{}
    cache.delete(doc);
    return fetchPdf(doc,req,meta,true);
  }
  return{row,upstream};
}

module.exports=async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method||'GET')){
    res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed');
  }
  const doc=one(req.query?.doc)||'';
  if(!SOURCES[doc]){res.statusCode=400;return res.end('UNKNOWN_OFFICIAL_DOCUMENT')}
  const meta=one(req.query?.meta)==='1';

  let result;
  try{result=await fetchPdf(doc,req,meta)}
  catch(e){res.statusCode=502;return res.end(String(e?.message||'OFFICIAL_SOURCE_FETCH_FAILED').slice(0,160))}
  const {row,upstream}=result;
  if(!upstream.ok&&upstream.status!==206){
    res.statusCode=upstream.status||502;
    try{await upstream.body?.cancel?.()}catch{}
    return res.end('OFFICIAL_SOURCE_HTTP_'+(upstream.status||502));
  }

  if(meta){
    try{await upstream.body?.cancel?.()}catch{}
    res.statusCode=200;res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
    return res.end(JSON.stringify({
      doc,name:row.name,upstreamStatus:upstream.status,
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
  res.setHeader('Content-Disposition',`inline; filename*=UTF-8''${safeName(row.name)}`);
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-119-Official-Source','nfa');
  if(req.method==='HEAD'||!upstream.body)return res.end();
  try{Readable.fromWeb(upstream.body).on('error',()=>{try{res.destroy()}catch{}}).pipe(res)}
  catch{res.end(Buffer.from(await upstream.arrayBuffer()))}
};

module.exports.SOURCES=SOURCES;
module.exports.extractAttachment=extractAttachment;
