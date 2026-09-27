import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const P=require('./api/official-pdf.js');
const outDir=path.resolve(process.argv[2]||'official-pdf-mirror');
const docs=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];
fs.mkdirSync(outDir,{recursive:true});

function validPdf(file){
  try{
    const st=fs.statSync(file);
    if(st.size<100000)return false;
    const fd=fs.openSync(file,'r'),head=Buffer.alloc(5);
    fs.readSync(fd,head,0,5,0);fs.closeSync(fd);
    return head.toString('latin1')==='%PDF-';
  }catch{return false}
}

for(const doc of docs){
  const out=path.join(outDir,doc+'.pdf');
  if(validPdf(out)){
    console.log('MIRROR_CACHE_HIT',doc,fs.statSync(out).size);
    continue;
  }
  const tmp=out+'.tmp';
  try{fs.rmSync(tmp,{force:true})}catch{}
  console.log('MIRROR_FETCH_START',doc);
  const result=await P.fetchPdfWith(doc,{method:'GET',headers:{}},false,{maxRefresh:4});
  const buf=Buffer.from(await result.upstream.arrayBuffer());
  if(buf.length<100000||buf.subarray(0,5).toString('latin1')!=='%PDF-')throw new Error('MIRROR_NOT_PDF_'+doc+'_'+buf.length);
  fs.writeFileSync(tmp,buf);
  fs.renameSync(tmp,out);
  console.log('MIRROR_FETCH_DONE',doc,buf.length);
}
console.log('V70_ALL_TEN_OFFICIAL_PDF_MIRRORS_MATERIALIZED');
