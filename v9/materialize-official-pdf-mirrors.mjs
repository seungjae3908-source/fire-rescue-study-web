import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const P=require('./api/official-pdf.js');
const ALL=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];
const outDir=path.resolve(process.argv[2]||'official-pdf-mirror');
const requested=process.argv.slice(3);
const docs=requested.length?requested:ALL;
fs.mkdirSync(outDir,{recursive:true});

function valid(file){
  try{
    const st=fs.statSync(file);
    if(st.size<100000)return false;
    const fd=fs.openSync(file,'r'),head=Buffer.alloc(5);
    fs.readSync(fd,head,0,5,0);fs.closeSync(fd);
    return head.toString('latin1')==='%PDF-';
  }catch{return false}
}

for(const doc of docs){
  if(!P.SOURCES?.[doc])throw new Error('UNKNOWN_OFFICIAL_DOCUMENT_'+doc);
  const file=path.join(outDir,doc+'.pdf');
  if(valid(file)){
    console.log('OFFICIAL_MIRROR_CACHE_HIT',doc,fs.statSync(file).size);
    continue;
  }
  console.log('OFFICIAL_MIRROR_FETCH_START',doc);
  const {upstream}=await P.fetchPdfWith(doc,{method:'GET',headers:{}},false);
  const buf=Buffer.from(await upstream.arrayBuffer());
  if(buf.length<100000||buf.subarray(0,5).toString('latin1')!=='%PDF-')throw new Error('OFFICIAL_MIRROR_INVALID_'+doc+'_'+buf.length);
  const tmp=file+'.tmp';
  fs.writeFileSync(tmp,buf);fs.renameSync(tmp,file);
  console.log('OFFICIAL_MIRROR_FETCH_DONE',doc,buf.length);
}
for(const doc of docs){
  const file=path.join(outDir,doc+'.pdf');
  if(!valid(file))throw new Error('OFFICIAL_MIRROR_NOT_READY_'+doc);
}
console.log('OFFICIAL_MIRROR_MATERIALIZE_SUCCESS',JSON.stringify({outDir,docs}));
