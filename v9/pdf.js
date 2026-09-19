'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};const DB='aitutor-v9-private-docs',VER=1;let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('docs')){const s=d.createObjectStore('docs',{keyPath:'id'});s.createIndex('owner','ownerId');s.createIndex('kind','kind')}if(!d.objectStoreNames.contains('chunks')){const s=d.createObjectStore('chunks',{keyPath:'id'});s.createIndex('owner','ownerId');s.createIndex('doc','docId')}};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
const txDone=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
const uuid=()=>crypto.randomUUID?crypto.randomUUID():'id-'+Date.now()+'-'+Math.random().toString(36).slice(2);
function tokens(s){return [...new Set(String(s||'').toLowerCase().replace(/[^0-9a-z가-힣 ]/g,' ').split(/\s+/).filter(x=>x.length>1))]}
function tombstones(){const s=V.Store.state;return s.deletedDocuments||(s.deletedDocuments={})}
async function putDocument(doc,chunks){const d=await db(),t=d.transaction(['docs','chunks'],'readwrite');t.objectStore('docs').put(doc);for(const c of chunks)t.objectStore('chunks').put(c);await txDone(t);return doc}
async function listDocuments(kind){const d=await db(),owner=V.Store.ownerId,t=d.transaction('docs','readonly'),idx=t.objectStore('docs').index('owner'),req=idx.getAll(owner);const rows=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)});return kind?rows.filter(x=>x.kind===kind):rows}
async function chunksFor(docId){const d=await db(),t=d.transaction('chunks','readonly'),req=t.objectStore('chunks').index('doc').getAll(docId);return await new Promise((res,rej)=>{req.onsuccess=()=>res((req.result||[]).filter(x=>x.ownerId===V.Store.ownerId));req.onerror=()=>rej(req.error)})}
async function purge(docId){const d=await db(),chunks=await chunksFor(docId),t=d.transaction(['docs','chunks'],'readwrite');t.objectStore('docs').delete(docId);for(const c of chunks)t.objectStore('chunks').delete(c.id);await txDone(t)}
async function remove(docId){await purge(docId);tombstones()[docId]=Date.now();V.Store.save()}
async function createOcrWorker(){
  const T=V.RuntimeDeps?.loadTesseract?await V.RuntimeDeps.loadTesseract():await import('https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js');
  const create=T.createWorker||T.default?.createWorker||window.Tesseract?.createWorker;
  if(!create)throw Error('OCR_ENGINE_UNAVAILABLE');
  const worker=await create('kor+eng');
  try{await worker.setParameters?.({preserve_interword_spaces:'1'})}catch{}
  return worker
}
function normalizeText(s){return String(s||'').replace(/[\t\u00a0]+/g,' ').replace(/ *\n */g,'\n').replace(/[ ]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim()}
function nativePdfText(tc){
  const items=(tc?.items||[]).filter(x=>String(x?.str||'').trim()).map(x=>({text:String(x.str).trim(),x:Number(x.transform?.[4]||0),y:Number(x.transform?.[5]||0),h:Math.abs(Number(x.height||x.transform?.[3]||10))||10}));
  if(!items.length)return'';
  const lines=[];
  for(const item of items.sort((a,b)=>Math.abs(b.y-a.y)>3?b.y-a.y:a.x-b.x)){
    let line=lines.find(l=>Math.abs(l.y-item.y)<=Math.max(2.5,Math.min(6,item.h*.42)));
    if(!line){line={y:item.y,h:item.h,items:[]};lines.push(line)}
    line.items.push(item);line.h=Math.max(line.h,item.h);
  }
  lines.sort((a,b)=>b.y-a.y);
  const out=[];let prev=null;
  for(const line of lines){
    const text=line.items.sort((a,b)=>a.x-b.x).map(x=>x.text).join(' ').replace(/\s+/g,' ').trim();
    if(!text)continue;
    if(prev&&Math.abs(prev.y-line.y)>Math.max(prev.h,line.h)*1.65)out.push('');
    out.push(text);prev=line;
  }
  return normalizeText(out.join('\n'))
}
function textQuality(text){
  if(V.LocalAI?.textQuality)return V.LocalAI.textQuality(text);
  const t=String(text||'').replace(/\s+/g,' ').trim(),compact=t.replace(/\s/g,'');if(!compact)return 0;
  const valid=(compact.match(/[가-힣0-9A-Za-z.,:%()\-+\/]/g)||[]).length/compact.length;
  const weird=(compact.match(/[�□▯]/g)||[]).length/compact.length;
  const len=Math.min(1,compact.length/180),words=Math.min(1,t.split(/\s+/).filter(Boolean).length/28);
  return Math.max(0,Math.min(1,valid*.55+len*.25+words*.2-weird*.8))
}
function pdfPageNeedsOcr(tc,text){
  const visible=(tc?.items||[]).filter(x=>String(x?.str||'').trim()).length,compact=String(text||'').replace(/\s+/g,'').length,q=textQuality(text);
  return visible<3||compact<45||q<.57
}
function prepareOcrCanvas(canvas,threshold=false){
  if(!threshold)return canvas;
  const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height;
  const ctx=out.getContext('2d',{alpha:false});ctx.drawImage(canvas,0,0);
  const img=ctx.getImageData(0,0,out.width,out.height),d=img.data;
  for(let i=0;i<d.length;i+=4){const y=.299*d[i]+.587*d[i+1]+.114*d[i+2],v=y<188?0:255;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255}
  ctx.putImageData(img,0,0);return out
}
async function recognizeCanvas(worker,canvas){
  const r=await worker.recognize(canvas),text=normalizeText(r.data?.text||''),confidence=Number(r.data?.confidence);
  return{text,confidence:Number.isFinite(confidence)?confidence:null,quality:textQuality(text)}
}
async function bestOcrCanvas(worker,canvas){
  const first=await recognizeCanvas(worker,canvas);let best=first;
  if(first.confidence==null||first.confidence<82||first.quality<.68){
    const enhanced=prepareOcrCanvas(canvas,true);
    try{const second=await recognizeCanvas(worker,enhanced);if(second.quality>best.quality+.025||second.confidence!=null&&best.confidence!=null&&second.confidence>best.confidence+7)best=second}finally{enhanced.width=1;enhanced.height=1}
  }
  return best
}
async function ocrPdfPage(pg,worker){
  const base=pg.getViewport({scale:1}),maxWidth=2400,scale=Math.min(3,Math.max(1.8,maxWidth/base.width)),viewport=pg.getViewport({scale}),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
  const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
  await pg.render({canvasContext:ctx,viewport}).promise;
  try{return await bestOcrCanvas(worker,canvas)}finally{canvas.width=1;canvas.height=1}
}
async function maybeAiCorrect(primary,alternate,confidence,onProgress){
  const q=textQuality(primary),needs=q<.72||(confidence!=null&&confidence<82);
  if(!needs||!navigator.gpu||!V.LocalAI?.correctExtractedText)return{accepted:false,text:primary,reason:'not-needed'};
  onProgress?.('AI OCR 보정 중');
  try{return await V.LocalAI.correctExtractedText({primary,alternate,confidence,onProgress:t=>onProgress?.(t)})}catch(err){return{accepted:false,text:primary,reason:String(err?.message||err)}}
}
async function pdfText(file,onProgress,{aiAssist='auto'}={}){
  const p=V.RuntimeDeps?.loadPdfJs?await V.RuntimeDeps.loadPdfJs():await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');
  if(!V.RuntimeDeps?.loadPdfJs)p.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
  const task=p.getDocument({data:await file.arrayBuffer()}),pdf=await task.promise,out=[];let worker=null,aiBudget=6;
  try{
    for(let i=1;i<=pdf.numPages;i++){
      const pg=await pdf.getPage(i),tc=await pg.getTextContent(),native=nativePdfText(tc),nativeQ=textQuality(native);
      let text=native,ocr=false,ocrConfidence=null,mode='text',alternate='';
      if(pdfPageNeedsOcr(tc,native)){
        worker=worker||await createOcrWorker();const o=await ocrPdfPage(pg,worker);ocr=true;ocrConfidence=o.confidence;alternate=native;
        if(o.quality>=nativeQ-.02||native.length<45){text=o.text;mode='ocr'}else{mode='native-preferred'}
        if(aiAssist!==false&&aiBudget>0&&(o.quality<.72||o.confidence!=null&&o.confidence<82)){
          const a=await maybeAiCorrect(text,alternate,o.confidence,t=>onProgress?.(i,pdf.numPages,'ai',t));if(a.accepted){text=a.text;mode='ocr+ai'}aiBudget--
        }
      }
      const quality=textQuality(text),needsReview=quality<.62||(ocrConfidence!=null&&ocrConfidence<70);
      out.push({page:i,text:normalizeText(text),ocr,ocrConfidence,quality,needsReview,mode});
      onProgress?.(i,pdf.numPages,mode)
    }
  }finally{if(worker)await worker.terminate().catch(()=>{});await task.destroy?.().catch?.(()=>{})}
  return out
}
async function imageText(file,onProgress,{aiAssist='auto'}={}){
  onProgress?.(0,1,'ocr');const worker=await createOcrWorker();
  try{
    const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas'),maxWidth=2600,scale=Math.min(3,Math.max(1,Math.min(maxWidth/bitmap.width,3)));
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();
    let o=await bestOcrCanvas(worker,canvas),text=o.text,mode='ocr';
    if(aiAssist!==false&&(o.quality<.72||o.confidence!=null&&o.confidence<82)){
      const a=await maybeAiCorrect(text,'',o.confidence,t=>onProgress?.(0,1,'ai',t));if(a.accepted){text=a.text;mode='ocr+ai'}
    }
    canvas.width=1;canvas.height=1;onProgress?.(1,1,mode);
    return[{page:1,text:normalizeText(text),ocr:true,ocrConfidence:o.confidence,quality:textQuality(text),needsReview:textQuality(text)<.62||(o.confidence!=null&&o.confidence<70),mode}]
  }finally{await worker.terminate().catch(()=>{})}
}
async function ingest(file,{kind='personal',title='',keepOriginal=false,onProgress,aiAssist='auto'}={}){
  if(!file)throw Error('FILE_REQUIRED');let pages=[];
  if(file.type==='application/pdf'||/\.pdf$/i.test(file.name))pages=await pdfText(file,onProgress,{aiAssist});
  else if(file.type?.startsWith('image/'))pages=await imageText(file,onProgress,{aiAssist});
  else{const text=normalizeText(await file.text());pages=[{page:1,text,ocr:false,ocrConfidence:null,quality:textQuality(text),needsReview:textQuality(text)<.62,mode:'text'}]}
  const extractedChars=pages.reduce((n,p)=>n+String(p.text||'').trim().length,0);if(!extractedChars)throw Error('NO_TEXT_EXTRACTED');
  const now=Date.now(),docId=uuid(),ownerId=V.Store.ownerId,reviewPages=pages.filter(p=>p.needsReview).map(p=>p.page),avgQuality=pages.length?pages.reduce((n,p)=>n+Number(p.quality||0),0)/pages.length:0;
  const doc={id:docId,ownerId,kind,title:title||file.name,fileName:file.name,mime:file.type||'',pageCount:pages.length,extractedChars,ocrPages:pages.filter(p=>p.ocr).map(p=>p.page),reviewPages,extractionVersion:'v10-hybrid-ocr-ai',extractionQuality:Number(avgQuality.toFixed(3)),private:kind==='personal',createdAt:now,updatedAt:now,original:keepOriginal?file:null};
  const chunks=[];
  for(const p of pages){const text=(p.text||'').trim();if(!text)continue;const size=1300;for(let i=0;i<text.length;i+=size){const part=text.slice(i,i+size);chunks.push({id:`${docId}:${p.page}:${i}`,docId,ownerId,kind,page:p.page,chunkIndex:Math.floor(i/size),text:part,tokenSet:tokens(part),quality:p.quality,ocr:p.ocr,ocrConfidence:p.ocrConfidence,needsReview:p.needsReview,mode:p.mode})}}
  await putDocument(doc,chunks);delete tombstones()[docId];V.Store.save();
  return{doc,chunks:chunks.length,extractedChars,ocrPages:doc.ocrPages,reviewPages,extractionQuality:doc.extractionQuality}
}
async function search(query,{kind,limit=8}={}){const qs=tokens(query);if(!qs.length)return[];const docs=await listDocuments(kind),docIds=new Set(docs.map(x=>x.id)),d=await db(),t=d.transaction('chunks','readonly'),req=t.objectStore('chunks').index('owner').getAll(V.Store.ownerId);const rows=await new Promise((res,rej)=>{req.onsuccess=()=>res(req.result||[]);req.onerror=()=>rej(req.error)});return rows.filter(x=>docIds.has(x.docId)&&(!kind||x.kind===kind)).map(x=>{let score=0;for(const q of qs)if((x.tokenSet||[]).some(t=>t.includes(q)||q.includes(t)))score+=q.length;return{...x,score,doc:docs.find(d=>d.id===x.docId)}}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
async function privateGrounding(query,limit=5){const hits=await search(query,{kind:'personal',limit});return hits.map(h=>`[내 개인자료 · ${h.doc.title} · ${h.page}쪽]\n${h.text.slice(0,900)}`).join('\n\n')}
async function exportForSync(){const ownerId=V.Store.ownerId,docs=await listDocuments('personal'),outDocs=[],outChunks=[];for(const d of docs){const {original,...safe}=d;outDocs.push({...safe,ownerId,private:true,original:undefined});for(const c of await chunksFor(d.id))outChunks.push({...c,ownerId,kind:'personal'})}const deleted=Object.entries(tombstones()).map(([id,deletedAt])=>({id,ownerId,deletedAt:Number(deletedAt)||Date.now()}));return{ownerId,docs:outDocs,chunks:outChunks,deleted}}
async function importFromSync(remoteDocs=[],remoteChunks=[]){const ownerId=V.Store.ownerId,owned=(remoteDocs||[]).filter(x=>x&&x.ownerId===ownerId),deleted=owned.filter(x=>Number(x.deletedAt)>0),live=owned.filter(x=>!Number(x.deletedAt)),local=new Map((await listDocuments()).map(x=>[x.id,x])),ts=tombstones();let deletedCount=0;for(const row of deleted){const when=Number(row.deletedAt)||0,prev=local.get(row.id),localStamp=Math.max(Number(prev?.updatedAt||prev?.createdAt||0),Number(ts[row.id]||0));if(when<localStamp)continue;await purge(row.id);ts[row.id]=when;local.delete(row.id);deletedCount++}const allowed=new Set(live.map(x=>x.id));if(!live.length){V.Store.save();return{docs:0,chunks:0,deleted:deletedCount}}const accepted=new Set(),d=await db(),t=d.transaction(['docs','chunks'],'readwrite'),docStore=t.objectStore('docs'),chunkStore=t.objectStore('chunks');for(const row of live){const prev=local.get(row.id),remoteStamp=Number(row.updatedAt||row.createdAt||0),localStamp=Math.max(Number(prev?.updatedAt||prev?.createdAt||0),Number(ts[row.id]||0));if(localStamp>remoteStamp)continue;accepted.add(row.id);delete ts[row.id];const clean={...row,ownerId,kind:'personal',private:true,original:null,deletedAt:0};docStore.put(clean)}let chunkCount=0;for(const row of remoteChunks||[]){if(!row||row.ownerId!==ownerId||!allowed.has(row.docId)||(!accepted.has(row.docId)&&local.has(row.docId)))continue;chunkStore.put({...row,ownerId,kind:'personal',tokenSet:row.tokenSet||tokens(row.text)});chunkCount++}await txDone(t);V.Store.save();return{docs:accepted.size,chunks:chunkCount,deleted:deletedCount}}
V.PrivateDocs={db,ingest,listDocuments,chunksFor,remove,search,privateGrounding,exportForSync,importFromSync,pdfPageNeedsOcr,nativePdfText,textQuality,privacyRules:{defaultPrivate:true,serverUpload:false,extractedTextCloudSync:'manual-member-sync',originalCloudSyncOptIn:true,crossUserSharing:false,deletionTombstones:true}};
})();
