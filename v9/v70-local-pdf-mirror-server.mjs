import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_DIR=fileURLToPath(new URL('../official-pdf-mirror/',import.meta.url));

const DOC_RE=/^(fire1|fire2|ems|prevention1|prevention2|law1|law2|law3|law4|law5)$/;
function safeDocFromRequest(u){
  const m=String(u?.pathname||'').match(/^\/official-pdf-mirror\/(fire1|fire2|ems|prevention1|prevention2|law1|law2|law3|law4|law5)\.pdf$/);
  if(m)return m[1];
  if(u?.pathname==='/api/official-pdf'){
    const q=String(u.searchParams.get('doc')||'');
    return DOC_RE.test(q)?q:'';
  }
  return '';
}
function parseRange(value,total){
  const m=String(value||'').trim().match(/^bytes=(\d+)-(\d*)$/i);
  if(!m)return null;
  const start=Number(m[1]),rawEnd=m[2]?Number(m[2]):total-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(rawEnd)||start<0||start>=total||rawEnd<start)return null;
  const end=Math.min(total-1,rawEnd);
  return{start,end,length:end-start+1,total};
}
export async function startLocalPdfMirror({port=4174,dir=DEFAULT_DIR}={}){
  const root=path.resolve(dir);
  const server=http.createServer((req,res)=>{
    try{
      const u=new URL(req.url||'/','http://127.0.0.1:'+port);
      res.setHeader('Access-Control-Allow-Origin','*');
      res.setHeader('Access-Control-Allow-Methods','GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers','Range, If-Range, Content-Type');
      res.setHeader('Access-Control-Expose-Headers','Content-Length, Content-Range, Accept-Ranges, X-119-Official-Transport');
      if(req.method==='OPTIONS'){res.statusCode=204;return res.end()}
      const doc=safeDocFromRequest(u);
      if(!doc){res.statusCode=404;return res.end('NOT_FOUND')}
      const file=path.join(root,doc+'.pdf');
      if(!file.startsWith(root+path.sep)){res.statusCode=400;return res.end('BAD_PATH')}
      const stat=fs.statSync(file),total=stat.size;
      res.setHeader('Accept-Ranges','bytes');
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('X-119-Official-Transport','pages-mirror');
      res.setHeader('Cache-Control','no-store');
      const range=parseRange(req.headers.range,total);
      if(req.headers.range&&!range){
        res.statusCode=416;res.setHeader('Content-Range','bytes */'+total);return res.end();
      }
      if(range){
        res.statusCode=206;
        res.setHeader('Content-Length',String(range.length));
        res.setHeader('Content-Range','bytes '+range.start+'-'+range.end+'/'+total);
        if(req.method==='HEAD')return res.end();
        return fs.createReadStream(file,{start:range.start,end:range.end}).pipe(res);
      }
      res.statusCode=200;
      res.setHeader('Content-Length',String(total));
      if(req.method==='HEAD')return res.end();
      return fs.createReadStream(file).pipe(res);
    }catch(err){
      res.statusCode=500;res.end('LOCAL_PDF_MIRROR_ERROR '+String(err?.message||err));
    }
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve)});
  return{server,origin:'http://127.0.0.1:'+port,base:'http://127.0.0.1:'+port+'/official-pdf-mirror'};
}
