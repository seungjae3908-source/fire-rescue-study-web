'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const DB='aitutor-v9-official-source-pdfs',VER=1;let dbp=null,activeRemote=null;const pdfCache=new Map();
const MIRROR_URLS={fire1:'https://study-119-official-pdf.vercel.app/fire1.pdf'};
const SOURCE_PAGES={
  ems:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view',
  fire1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view',
  fire2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view',
  law1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law3:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law4:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  law5:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view',
  prevention1:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view',
  prevention2:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view'
};
function db(){if(dbp)return dbp;dbp=new Promise((res,rej)=>{const r=indexedDB.open(DB,VER);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sources'))d.createObjectStore('sources',{keyPath:'key'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return dbp}
const done=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)});
async function attach(key,file){if(!key||!file)throw Error('SOURCE_PDF_REQUIRED');if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name))throw Error('PDF_ONLY');await clearPdfCache(key);const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').put({key,name:file.name,mime:file.type||'application/pdf',blob:file,updatedAt:Date.now()});await done(t);return{key,name:file.name,size:file.size}}
async function get(key){const d=await db(),t=d.transaction('sources','readonly'),r=t.objectStore('sources').get(key);return await new Promise((res,rej)=>{r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}
async function putSourceRow(row){const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').put(row);await done(t);return row}
async function cacheOfficial(key,{timeoutMs=90000,onProgress}={}){
  const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};
  if(activeRemote?.key===key&&activeRemote?.row?.blob)return activeRemote.row;
  const catalog=V.SourceCatalog119?.get?.(key);if(!catalog?.directPdf)throw Error('SOURCE_REMOTE_UNRESOLVED');
  const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),timeoutMs);
  try{
    const res=await fetch(catalog.directPdf,{credentials:'omit',redirect:'follow',signal:ctl.signal,cache:'force-cache'});
    if(!res.ok)throw Error('SOURCE_REMOTE_HTTP_'+res.status);
    const total=Number(res.headers.get('content-length'))||0,chunks=[];let loaded=0;
    if(res.body?.getReader){
      const reader=res.body.getReader();
      while(true){const {done,value}=await reader.read();if(done)break;if(value){chunks.push(value);loaded+=value.byteLength;onProgress?.({loaded,total,percent:total?Math.min(100,Math.round(loaded/total*100)):null})}}
    }else{
      const buf=new Uint8Array(await res.arrayBuffer());chunks.push(buf);loaded=buf.byteLength;onProgress?.({loaded,total:total||loaded,percent:100});
    }
    const blob=new Blob(chunks,{type:'application/pdf'}),head=new Uint8Array(await blob.slice(0,8).arrayBuffer());
    if(new TextDecoder('latin1').decode(head).indexOf('%PDF-')<0)throw Error('SOURCE_REMOTE_NOT_PDF');
    const row={key,name:catalog.expectedNames?.[0]||catalog.label||key,mime:'application/pdf',blob,updatedAt:Date.now(),origin:'official-local-cache',officialPage:catalog.officialPage,license:catalog.license};
    activeRemote={key,row};
    try{await putSourceRow(row)}catch{}
    onProgress?.({loaded:blob.size,total:blob.size,percent:100,done:true});
    return row;
  }catch(err){if(err?.name==='AbortError')throw Error('SOURCE_PDF_TIMEOUT');throw err}
  finally{clearTimeout(timer)}
}
async function remoteRow(key,opts={}){return cacheOfficial(key,opts)}
async function resolveRow(key,opts={}){const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};return cacheOfficial(key,opts)}
async function availability(key){const local=await get(key),c=V.SourceCatalog119?.get?.(key),mirror=MIRROR_URLS[key]||'';return{local:!!local?.blob,mirror:!!mirror,mirrorUrl:mirror,direct:!!mirror||!!c?.directPdf,officialPage:c?.officialPage||SOURCE_PAGES[key]||'',license:c?.license||'',label:c?.label||key}}
async function has(key){const a=await availability(key);return a.local||a.direct}
async function remove(key){await clearPdfCache(key);const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').delete(key);await done(t);if(activeRemote?.key===key)activeRemote=null}
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const stop=new Set(['그리고','하지만','에서','으로','하는','한다','있다','있으며','대한','통해','경우','확인','중요','필요','환자','설비','화재']);
function queryTokens(queries){const out=[];for(const q of queries||[]){for(const w of String(q||'').split(/[\s·,()\/→]+/)){const n=norm(w);if(n.length>=2&&!stop.has(n)&&!out.includes(n))out.push(n)}}return out.sort((a,b)=>b.length-a.length).slice(0,24)}
async function pdfjs(){const p=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');p.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';return p}
async function clearPdfCache(key){const hit=pdfCache.get(key);pdfCache.delete(key);if(hit?.task)await hit.task.destroy?.().catch?.(()=>{});else if(hit?.pdf)await hit.pdf.destroy?.().catch?.(()=>{})}
async function openPdf(key,{timeoutMs=90000,onProgress}={}){const cached=pdfCache.get(key);if(cached?.pdf)return cached;const p=await pdfjs(),local=await get(key),mirror=MIRROR_URLS[key]||'';let task,name,origin;
  if(local?.blob){task=p.getDocument({data:await local.blob.arrayBuffer()});name=local.name||key;origin='local-cache'}
  else if(mirror){task=p.getDocument({url:mirror,withCredentials:false,disableRange:false,disableStream:false,disableAutoFetch:false,rangeChunkSize:262144});name=V.SourceCatalog119?.get?.(key)?.expectedNames?.[0]||key;origin='official-mirror-range'}
  else{const row=await resolveRow(key,{timeoutMs,onProgress});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||key;origin=row.origin||'local-cache'}
  const timer=new Promise((_,rej)=>setTimeout(()=>rej(Error('SOURCE_PDF_PARSE_TIMEOUT')),Math.min(timeoutMs,45000)));
  try{const pdf=await Promise.race([task.promise,timer]),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);return entry}catch(err){await task.destroy?.().catch?.(()=>{});throw err}
}
async function locate(key,queries=[]){const {pdf}=await openPdf(key),tokens=queryTokens(queries);if(!tokens.length)return{page:1,pages:pdf.numPages,score:0};let best={page:1,score:-1,pages:pdf.numPages};for(let n=1;n<=pdf.numPages;n++){const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=norm((tc.items||[]).map(x=>x.str).join(' '));let score=0;for(const q of tokens)if(text.includes(q))score+=Math.min(12,q.length);if(score>best.score)best={page:n,score,pages:pdf.numPages};if(score>=Math.min(48,tokens.slice(0,5).reduce((a,x)=>a+Math.min(12,x.length),0)))break}return best}
async function render(key,pageNum,host,queries=[],opts={}){const {pdf,name,origin}=await openPdf(key,opts),p=await pdfjs(),pageNo=Math.max(1,Math.min(Number(pageNum)||1,pdf.numPages)),pg=await pdf.getPage(pageNo),base=pg.getViewport({scale:1});const maxWidth=Math.max(280,(host?.clientWidth||720)-16),scale=Math.min(1.7,maxWidth/base.width),viewport=pg.getViewport({scale});
  host.innerHTML='';host.classList.add('pdf-render-host');host.style.setProperty('--pdf-width',viewport.width+'px');
  const wrap=document.createElement('div');wrap.className='pdf-canvas-wrap';wrap.style.width=viewport.width+'px';wrap.style.height=viewport.height+'px';
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';wrap.appendChild(canvas);
  const overlay=document.createElement('div');overlay.className='pdf-highlight-layer';overlay.style.width=viewport.width+'px';overlay.style.height=viewport.height+'px';wrap.appendChild(overlay);host.appendChild(wrap);
  await pg.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
  const tc=await pg.getTextContent(),tokens=queryTokens(queries);let hits=0;
  for(const item of tc.items||[]){const str=norm(item.str);if(!str||!tokens.some(q=>str.includes(q)||q.includes(str)))continue;const tx=p.Util.transform(viewport.transform,item.transform),h=Math.max(8,Math.hypot(tx[2],tx[3])),w=Math.max(8,Math.abs(Number(item.width)||0)*scale),mark=document.createElement('div');mark.className='pdf-highlight-box';mark.style.left=tx[4]+'px';mark.style.top=(tx[5]-h)+'px';mark.style.width=w+'px';mark.style.height=(h*1.15)+'px';mark.title=item.str;overlay.appendChild(mark);hits++}
  const meta=document.createElement('div');meta.className='pdf-render-meta';meta.textContent=`${name} · ${pageNo}/${pdf.numPages}쪽 · 하이라이트 ${hits}개`;host.prepend(meta);
  return{page:pageNo,pages:pdf.numPages,hits,name,origin};
}
V.SourcePDF={attach,get,has,remove,availability,resolveRow,remoteRow,cacheOfficial,openPdf,clearPdfCache,locate,render,mirrorUrl:key=>MIRROR_URLS[key]||'',sourcePage:key=>V.SourceCatalog119?.get?.(key)?.officialPage||SOURCE_PAGES[key]||'',privacy:{localCacheAllowed:true,persistentOfficialCache:true,serverUpload:false,userUploadRequired:false,originalUnmodified:true,officialRemotePreferred:true},runtime:'pdfjs-text-coordinate-overlay-v5-static-range-or-persistent-cache'};
})();