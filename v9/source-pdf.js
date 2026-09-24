'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const DB='aitutor-v9-official-source-pdfs',VER=1;let dbp=null,activeRemote=null;const pdfCache=new Map();
const PAGE_OFFSETS=Object.freeze({fire1:16,fire2:10,ems:18,prevention1:14,prevention2:12,law1:4,law2:12,law3:8,law4:6,law5:14});
const pdfPage=(key,bookPage)=>{const n=Number(bookPage);if(!Number.isFinite(n)||n<=0)return 0;return Object.prototype.hasOwnProperty.call(PAGE_OFFSETS,key)?n+PAGE_OFFSETS[key]:n};
const bookPage=(key,pdfPageNo)=>{if(!Object.prototype.hasOwnProperty.call(PAGE_OFFSETS,key))return 0;const n=Number(pdfPageNo),x=n-PAGE_OFFSETS[key];return Number.isFinite(x)&&x>0?x:0};
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
async function cacheOfficial(key,{timeoutMs=90000,onProgress,preferProxy=false}={}){
  const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};
  if(activeRemote?.key===key&&activeRemote?.row?.blob)return activeRemote.row;
  const catalog=V.SourceCatalog119?.get?.(key),ordered=preferProxy?[catalog?.proxyPdf,catalog?.directPdf]:[catalog?.directPdf,catalog?.proxyPdf],urls=[...new Set(ordered.filter(Boolean))];
  if(!urls.length)throw Error('SOURCE_REMOTE_UNRESOLVED');
  let lastError=Error('SOURCE_REMOTE_UNRESOLVED');
  for(let i=0;i<urls.length;i++){
    const url=urls[i],remaining=Math.max(7000,Math.floor(timeoutMs/Math.max(1,urls.length-i))),ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),remaining);
    try{
      const res=await fetch(url,{credentials:'omit',redirect:'follow',signal:ctl.signal,cache:'no-store'});
      if(!res.ok)throw Error('SOURCE_REMOTE_HTTP_'+res.status);
      const total=Number(res.headers.get('content-length'))||0,chunks=[];let loaded=0;
      if(res.body?.getReader){
        const reader=res.body.getReader();
        while(true){const {done,value}=await reader.read();if(done)break;if(value){chunks.push(value);loaded+=value.byteLength;onProgress?.({loaded,total,percent:total?Math.min(100,Math.round(loaded/total*100)):null,transport:url===catalog?.proxyPdf?'proxy':'mirror'})}}
      }else{
        const buf=new Uint8Array(await res.arrayBuffer());chunks.push(buf);loaded=buf.byteLength;onProgress?.({loaded,total:total||loaded,percent:100});
      }
      const blob=new Blob(chunks,{type:'application/pdf'}),head=new Uint8Array(await blob.slice(0,8).arrayBuffer());
      if(new TextDecoder('latin1').decode(head).indexOf('%PDF-')<0)throw Error('SOURCE_REMOTE_NOT_PDF');
      const row={key,name:catalog.expectedNames?.[0]||catalog.label||key,mime:'application/pdf',blob,updatedAt:Date.now(),origin:url===catalog?.proxyPdf?'official-proxy-cache':'official-mirror-cache',officialPage:catalog.officialPage,license:catalog.license};
      activeRemote={key,row};try{await putSourceRow(row)}catch{}
      onProgress?.({loaded:blob.size,total:blob.size,percent:100,done:true,transport:url===catalog?.proxyPdf?'proxy':'mirror'});return row;
    }catch(err){lastError=err?.name==='AbortError'?Error('SOURCE_PDF_TIMEOUT'):err}
    finally{clearTimeout(timer)}
  }
  throw lastError;
}
async function remoteRow(key,opts={}){return cacheOfficial(key,opts)}
async function resolveRow(key,opts={}){const local=await get(key);if(local?.blob)return{...local,origin:'local-cache'};return cacheOfficial(key,opts)}
async function availability(key){const local=await get(key),c=V.SourceCatalog119?.get?.(key),mirror=c?.transport==='range-static'&&!!c?.mirrorPdf;return{local:!!local?.blob,mirror,mirrorUrl:mirror?c.mirrorPdf:'',proxyUrl:c?.proxyPdf||'',direct:!!(c?.directPdf||c?.proxyPdf),officialPage:c?.officialPage||SOURCE_PAGES[key]||'',license:c?.license||'',label:c?.label||key}}
async function has(key){const a=await availability(key);return a.local||a.direct}
async function remove(key){await clearPdfCache(key);const d=await db(),t=d.transaction('sources','readwrite');t.objectStore('sources').delete(key);await done(t);if(activeRemote?.key===key)activeRemote=null}
const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
const stop=new Set(['그리고','하지만','에서','으로','하는','한다','있다','있으며','대한','통해','경우','확인','중요','필요','환자','설비','화재']);
function queryTokens(queries){const out=[];for(const q of queries||[]){for(const w of String(q||'').split(/[\s·,()\/→]+/)){const n=norm(w);if(n.length>=2&&!stop.has(n)&&!out.includes(n))out.push(n)}}return out.sort((a,b)=>b.length-a.length).slice(0,24)}
async function pdfjs(){if(V.RuntimeDeps?.loadPdfJs)return V.RuntimeDeps.loadPdfJs();const p=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs');p.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';return p}
async function clearPdfCache(key){const hit=pdfCache.get(key);pdfCache.delete(key);if(hit?.task)await hit.task.destroy?.().catch?.(()=>{});else if(hit?.pdf)await hit.pdf.destroy?.().catch?.(()=>{})}
function waitPdfTask(task,timeoutMs){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('SOURCE_PDF_PARSE_TIMEOUT')),timeoutMs);task.promise.then(v=>{clearTimeout(timer);resolve(v)},e=>{clearTimeout(timer);reject(e)})})}
async function openPdf(key,{timeoutMs=90000,onProgress}={}){const cached=pdfCache.get(key);if(cached?.pdf)return cached;const p=await pdfjs(),local=await get(key),catalog=V.SourceCatalog119?.get?.(key),staticRange=catalog?.transport==='range-static'&&!!catalog?.mirrorPdf,proxyRange=!staticRange&&!!catalog?.proxyPdf;let task,name,origin;
  if(local?.blob){task=p.getDocument({data:await local.blob.arrayBuffer()});name=local.name||key;origin='local-cache'}
  else if(staticRange||proxyRange){
    const fastUrl=staticRange?catalog.mirrorPdf:catalog.proxyPdf,fastTransport=staticRange?'mirror':'proxy-range',fastOrigin=staticRange?'official-static-range':'official-proxy-range',fastTimeout=Math.min(staticRange?7000:8000,timeoutMs);
    task=p.getDocument({url:fastUrl,withCredentials:false,disableRange:false,disableStream:proxyRange,disableAutoFetch:true,rangeChunkSize:65536});name=catalog.expectedNames?.[0]||catalog.label||key;origin=fastOrigin;
    try{const pdf=await waitPdfTask(task,fastTimeout),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);onProgress?.({ready:true,transport:fastTransport});return entry}
    catch{await task.destroy?.().catch?.(()=>{});onProgress?.({fallback:true,transport:fastTransport});const row=await cacheOfficial(key,{timeoutMs:Math.max(10000,timeoutMs-fastTimeout),onProgress,preferProxy:true});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||key;origin=staticRange?'official-proxy-fallback':'official-proxy-full-cache-fallback'}
  }else{const row=await resolveRow(key,{timeoutMs,onProgress});task=p.getDocument({data:await row.blob.arrayBuffer()});name=row.name||key;origin=row.origin||'local-cache'}
  try{const pdf=await waitPdfTask(task,Math.min(timeoutMs,25000)),entry={key,pdf,task,name,origin};pdfCache.set(key,entry);return entry}catch(err){await task.destroy?.().catch?.(()=>{});throw err}
}
async function locate(key,queries=[],options={}){const {pdf}=await openPdf(key),tokens=queryTokens(queries);if(!tokens.length)return{page:1,pages:pdf.numPages,score:0};const ranges=Array.isArray(options.bookRanges)?options.bookRanges.filter(x=>x&&x.doc===key):[],pageSet=new Set();if(ranges.length){for(const r of ranges){const from=Math.max(1,pdfPage(key,Number(r.from)||1)),to=Math.min(pdf.numPages,pdfPage(key,Number(r.to)||Number(r.from)||1));for(let n=from;n<=to;n++)pageSet.add(n)}}const pages=pageSet.size?[...pageSet].sort((a,b)=>a-b):Array.from({length:pdf.numPages},(_,i)=>i+1);let best={page:pages[0]||1,score:-1,pages:pdf.numPages};for(const n of pages){const pg=await pdf.getPage(n),tc=await pg.getTextContent(),text=norm((tc.items||[]).map(x=>x.str).join(' '));let score=0;for(const q of tokens)if(text.includes(q))score+=Math.min(12,q.length);if(score>best.score)best={page:n,score,pages:pdf.numPages};if(score>=Math.min(48,tokens.slice(0,5).reduce((a,x)=>a+Math.min(12,x.length),0)))break}return best}
async function findPages(key,query,{limit=12}={}){
const q=String(query||'').trim(),tokens=queryTokens([q]),{pdf}=await openPdf(key);if(!tokens.length)return{query:q,pages:pdf.numPages,results:[]};
const qn=norm(q),hits=[];
for(let n=1;n<=pdf.numPages;n++){
  const pg=await pdf.getPage(n),tc=await pg.getTextContent(),raw=(tc.items||[]).map(x=>x.str).join(' '),text=norm(raw),matched=tokens.filter(t=>text.includes(t));
  if(!matched.length)continue;
  const exact=qn.length>=3&&text.includes(qn),coverage=matched.length/Math.max(1,tokens.length),score=(exact?200:0)+matched.reduce((sum,t)=>sum+Math.min(16,t.length),0)+Math.round(coverage*60);
  if(exact||coverage>=.5||matched.some(t=>t.length>=5))hits.push({page:n,bookPage:bookPage(key,n),score});
}
hits.sort((a,b)=>b.score-a.score||a.page-b.page);
return{query:q,pages:pdf.numPages,results:hits.slice(0,Math.max(1,Math.min(30,Number(limit)||12)))}
}
function evidenceLines(items,viewport,p,queries=[],options={}){
  const rawQueries=(queries||[]).map(x=>String(x||'').replace(/\s+/g,' ').trim()).filter(Boolean),tokens=queryTokens(rawQueries);
  const rows=[];
  for(const item of items||[]){
    const raw=String(item.str||'').trim();if(!raw)continue;
    const tx=p.Util.transform(viewport.transform,item.transform),h=Math.max(8,Math.hypot(tx[2],tx[3])),w=Math.max(2,Math.abs(Number(item.width)||0)*viewport.scale);
    const row={raw,n:norm(raw),x:tx[4],y:tx[5],top:tx[5]-h,h,w};
    let line=rows.find(x=>Math.abs(x.y-row.y)<=Math.max(3,Math.min(7,row.h*.38)));
    if(!line){line={y:row.y,items:[]};rows.push(line)}
    line.items.push(row);
  }
  const lines=rows.map(line=>{
    const its=line.items.sort((a,b)=>a.x-b.x),text=its.map(x=>x.raw).join(' ').replace(/\s+/g,' ').trim(),n=norm(text);
    const left=Math.min(...its.map(x=>x.x)),right=Math.max(...its.map(x=>x.x+x.w)),top=Math.min(...its.map(x=>x.top)),bottom=Math.max(...its.map(x=>x.top+x.h));
    return{text,n,left,right,top,bottom};
  }).filter(x=>x.n.length>=4).sort((a,b)=>a.top-b.top);
  const anchorTokens=queryTokens(options.anchorTerms||[]).filter(x=>x.length>=2);
  if(anchorTokens.length){
    const e=lines.map((l,i)=>{const m=anchorTokens.filter(t=>l.n.includes(t));return{l,i,m,s:m.reduce((n,t)=>n+t.length,0)+m.length*10}}).filter(x=>x.m.length>1||x.m.some(t=>t.length>4)).sort((a,b)=>b.s-a.s||a.i-b.i);
    if(e.length){const p=[];for(const h of e.slice(0,4)){if(!p.some(x=>x.l===h.l))p.push(h);for(let j=h.i+1;j<Math.min(lines.length,h.i+5)&&p.length<8;j++){const m=tokens.filter(t=>lines[j].n.includes(t));if((m.length>1||m.some(t=>t.length>5))&&!p.some(x=>x.l===lines[j]))p.push({l:{...lines[j],evidenceTitle:h.l.text+' · '+lines[j].text},i:j})}}return p.sort((a,b)=>a.i-b.i).slice(0,8).map(x=>x.l)}
    const anchorBlocks=[];
    for(let i=0;i<lines.length;i++){
      let joinedN='',joinedText='';
      for(let j=i;j<Math.min(lines.length,i+6);j++){
        joinedN+=lines[j].n;
        joinedText+=(joinedText?' ':'')+lines[j].text;
        const matched=anchorTokens.filter(t=>joinedN.includes(t));
        if(matched.length){
          anchorBlocks.push({start:i,end:j,score:matched.reduce((n,t)=>n+t.length,0),title:joinedText});
          break
        }
      }
    }
    anchorBlocks.sort((a,b)=>b.score-a.score||(a.end-a.start)-(b.end-b.start)||a.start-b.start);
    const picked=[];
    for(const block of anchorBlocks){
      if(picked.length>=8)break;
      for(let i=block.start;i<=block.end&&picked.length<8;i++){
        if(picked.some(x=>x===lines[i]))continue;
        picked.push({...lines[i],evidenceTitle:block.title})
      }
    }
    if(picked.length)return picked
  }
  const candidates=[];
  const maxWindow=8;
  for(let qi=0;qi<rawQueries.length;qi++){
    const q=rawQueries[qi],qn=norm(q),qt=queryTokens([q]);if(qn.length<3||!qt.length)continue;
    const priorityBonus=Math.max(0,72-qi*16);
    for(let i=0;i<lines.length;i++){
      let joined='';
      for(let j=i;j<Math.min(lines.length,i+maxWindow);j++){
        joined+=lines[j].n;
        const matched=qt.filter(t=>joined.includes(t));
        const exact=joined.includes(qn)||qn.includes(joined)&&joined.length>=Math.min(28,Math.floor(qn.length*.65));
        const density=matched.reduce((n,t)=>n+Math.min(14,t.length),0);
        const coverage=matched.length/Math.max(1,qt.length);
        const score=(exact?180:0)+density+(matched.length>=2?matched.length*10:0)+Math.round(coverage*40)+priorityBonus-Math.max(0,(j-i)-4)*3;
        const strong=exact||coverage>=.55&&matched.length>=2||matched.some(t=>t.length>=7)&&coverage>=.35;
        if(strong)candidates.push({start:i,end:j,score,query:q});
        if(joined.length>Math.max(qn.length*1.8,260))break;
      }
    }
  }
  candidates.sort((a,b)=>b.score-a.score||(a.end-a.start)-(b.end-b.start));
  const blocks=[];
  for(const cand of candidates){
    if(blocks.some(b=>!(cand.end<b.start||cand.start>b.end)))continue;
    blocks.push(cand);if(blocks.length>=2)break;
  }
  if(!blocks.length&&tokens.length){
    const scored=lines.map((line,i)=>{
      const matched=tokens.filter(t=>line.n.includes(t));
      return{i,score:matched.reduce((n,t)=>n+Math.min(14,t.length),0)+(matched.length>=2?matched.length*8:0),matched};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    const best=scored[0];
    if(best&&(best.matched.length>=2||best.matched.some(t=>t.length>=7)))blocks.push({start:best.i,end:best.i,score:best.score,query:''});
  }
  const picked=[];
  for(const b of blocks.sort((a,b)=>a.start-b.start))for(let i=b.start;i<=b.end;i++)if(!picked.includes(lines[i]))picked.push(lines[i]);
  return picked;
}
function downloadName(key,row,catalog){const raw=row?.name||catalog?.expectedNames?.[0]||catalog?.label||key;return /\.pdf$/i.test(raw)?raw:`${raw}.pdf`}
async function download(key,{timeoutMs=120000,onProgress}={}){const catalog=V.SourceCatalog119?.get?.(key);if(!catalog)throw Error('SOURCE_PDF_UNKNOWN');let row=await get(key);if(!row?.blob)row=await cacheOfficial(key,{timeoutMs,onProgress});if(!row?.blob)throw Error('SOURCE_PDF_DOWNLOAD_UNAVAILABLE');const name=downloadName(key,row,catalog),url=URL.createObjectURL(row.blob),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return{name,size:row.blob.size,key}}
async function render(key,pageNum,host,queries=[],opts={}){
  const {pdf,name,origin}=await openPdf(key,opts),p=await pdfjs(),pageNo=Math.max(1,Math.min(Number(pageNum)||1,pdf.numPages)),pg=await pdf.getPage(pageNo),base=pg.getViewport({scale:1});
  const maxWidth=Math.max(280,(host?.clientWidth||720)-16),fitScale=Math.min(1.85,maxWidth/base.width),zoom=Math.max(.75,Math.min(2.25,Number(opts.zoom)||1)),scale=fitScale*zoom,viewport=pg.getViewport({scale});
  const outputScale=Math.min(3,Math.max(1,Number(window.devicePixelRatio)||1));
  host.innerHTML='';host.classList.add('pdf-render-host');host.style.setProperty('--pdf-width',viewport.width+'px');
  const wrap=document.createElement('div');wrap.className='pdf-canvas-wrap';wrap.style.width=viewport.width+'px';wrap.style.height=viewport.height+'px';
  const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width*outputScale);canvas.height=Math.ceil(viewport.height*outputScale);canvas.style.width=viewport.width+'px';canvas.style.height=viewport.height+'px';wrap.appendChild(canvas);
  const overlay=document.createElement('div');overlay.className='pdf-highlight-layer';overlay.style.width=viewport.width+'px';overlay.style.height=viewport.height+'px';wrap.appendChild(overlay);host.appendChild(wrap);
  const ctx=canvas.getContext('2d',{alpha:false}),transform=outputScale===1?undefined:[outputScale,0,0,outputScale,0,0];
  await pg.render({canvasContext:ctx,viewport,transform}).promise;
  const tc=await pg.getTextContent(),evidence=evidenceLines(tc.items||[],viewport,p,queries,{anchorTerms:opts.anchorTerms});
  for(const line of evidence){
    const mark=document.createElement('div');mark.className='pdf-evidence-line';
    mark.style.left=Math.max(0,line.left-2)+'px';mark.style.top=Math.min(viewport.height-3,Math.max(0,line.bottom+1))+'px';mark.style.width=Math.max(8,Math.min(viewport.width-line.left+2,line.right-line.left+4))+'px';mark.style.height='2px';
    mark.title=line.evidenceTitle||line.text;overlay.appendChild(mark);
  }
  const officialBookPage=bookPage(key,pageNo),meta=document.createElement('div');meta.className='pdf-render-meta';meta.textContent=officialBookPage?`${name} · 교재 ${officialBookPage}쪽 · ${evidence.length?'공식 근거':'공식 원문'}`:`${name} · PDF ${pageNo}/${pdf.numPages}쪽 · ${evidence.length?'공식 근거':'공식 원문'}`;host.prepend(meta);
  return{page:pageNo,bookPage:officialBookPage,pages:pdf.numPages,hits:evidence.length,evidenceLines:evidence.map(x=>x.evidenceTitle||x.text),name,origin,zoom,fitScale,outputScale,cssWidth:viewport.width,pixelWidth:canvas.width};
}
V.SourcePDF={attach,get,has,remove,availability,resolveRow,remoteRow,cacheOfficial,openPdf,clearPdfCache,locate,findPages,download,render,pdfPage,bookPage,evidenceLinesForQA:evidenceLines,pageOffsets:PAGE_OFFSETS,mirrorUrl:key=>V.SourceCatalog119?.get?.(key)?.transport==='range-static'?V.SourceCatalog119.get(key).directPdf:'',sourcePage:key=>V.SourceCatalog119?.get?.(key)?.officialPage||SOURCE_PAGES[key]||'',privacy:{localCacheAllowed:true,persistentOfficialCache:true,serverUpload:false,userUploadRequired:false,originalUnmodified:true,officialRemotePreferred:true},runtime:'pdfjs-v13-fast-range-anchor-context-lines'};
})();