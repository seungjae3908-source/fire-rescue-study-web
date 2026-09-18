'use strict';

const { Readable } = require('node:stream');

const SOURCES = Object.freeze({
  fire1:{
    url:'https://www.nfa.go.kr/board/file/bbs_0000000000000035/677306/FILE_000000000026799/2026031714344588990/pdfFileDownload',
    name:'10. 소방전술1(화재1).pdf'
  },
  fire2:{
    url:'https://www.nfa.go.kr/board/file/bbs_0000000000000035/677306/FILE_000000000026798/2026031714344462168/pdfFileDownload',
    name:'11. 소방전술1(화재2).pdf'
  },
  ems:{
    url:'https://www.nfa.go.kr/board/file/bbs_0000000000000035/106811/FILE_000000000026802/2026031719261801627/pdfFileDownload',
    name:'13. 소방전술3(구급)-저용량.pdf'
  }
});

function one(v){return Array.isArray(v)?v[0]:v}
function safeName(s){return encodeURIComponent(String(s||'official.pdf')).replace(/['()]/g,escape)}

module.exports = async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method||'GET')){
    res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed');
  }
  const doc=one(req.query?.doc)||'';
  const src=SOURCES[doc];
  if(!src){res.statusCode=400;return res.end('UNKNOWN_OFFICIAL_DOCUMENT')}

  const headers={
    'user-agent':'Mozilla/5.0 119-study-official-source-proxy/1.0',
    'accept':'application/pdf,*/*;q=0.8',
    'referer':'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/'
  };
  if(req.headers.range)headers.range=req.headers.range;
  if(req.headers['if-range'])headers['if-range']=req.headers['if-range'];

  let upstream;
  try{upstream=await fetch(src.url,{method:req.method,headers,redirect:'follow'})}
  catch(e){res.statusCode=502;return res.end('OFFICIAL_SOURCE_FETCH_FAILED')}

  if(!upstream.ok&&upstream.status!==206){
    res.statusCode=upstream.status||502;
    return res.end('OFFICIAL_SOURCE_HTTP_'+(upstream.status||502));
  }

  res.statusCode=upstream.status;
  const pass=['content-type','content-length','content-range','accept-ranges','etag','last-modified'];
  for(const h of pass){const v=upstream.headers.get(h);if(v)res.setHeader(h,v)}
  if(!res.getHeader('Content-Type'))res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition',`inline; filename*=UTF-8''${safeName(src.name)}`);
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-119-Official-Source','nfa');

  if(req.method==='HEAD'||!upstream.body)return res.end();
  try{
    Readable.fromWeb(upstream.body).on('error',()=>{try{res.destroy()}catch{}}).pipe(res);
  }catch{
    const buf=Buffer.from(await upstream.arrayBuffer());
    res.end(buf);
  }
};

module.exports.SOURCES=SOURCES;
