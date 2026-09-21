'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
let pdfPromise=null,tesseractPromise=null,webllmPromise=null;
function localRuntime(){
  const h=String(window.location?.hostname||'').toLowerCase();
  return h==='localhost'||h==='::1'||h==='[::1]'||/^127\./.test(h)
}
function dependencyCandidates(local,remotes){return localRuntime()?[local,...remotes]:remotes}
async function firstImport(candidates,label){
  const errors=[];
  for(const url of candidates){
    try{return{module:await import(url),url}}catch(err){errors.push(String(err?.message||err))}
  }
  throw Error(label+'_LOAD_FAILED: '+errors.slice(-2).join(' | '))
}
async function loadPdfJs(){
  if(pdfPromise)return pdfPromise;
  pdfPromise=(async()=>{
    const {module:p,url}=await firstImport(dependencyCandidates(
      '../node_modules/pdfjs-dist/build/pdf.min.mjs',
      [
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs',
        'https://unpkg.com/pdfjs-dist@5.4.149/build/pdf.min.mjs'
      ]
    ),'PDFJS');
    const worker=url.includes('/build/pdf.min.mjs')?url.replace('/build/pdf.min.mjs','/build/pdf.worker.min.mjs'):'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs';
    p.GlobalWorkerOptions.workerSrc=worker;
    return p
  })().catch(err=>{pdfPromise=null;throw err});
  return pdfPromise
}
async function loadTesseract(){
  if(tesseractPromise)return tesseractPromise;
  tesseractPromise=(async()=>{
    const {module:T}=await firstImport(dependencyCandidates(
      '../node_modules/tesseract.js/dist/tesseract.esm.min.js',
      [
        'https://cdn.jsdelivr.net/npm/tesseract.js@7.0.0/dist/tesseract.esm.min.js',
        'https://esm.sh/tesseract.js@7.0.0'
      ]
    ),'TESSERACT');
    return T
  })().catch(err=>{tesseractPromise=null;throw err});
  return tesseractPromise
}
async function loadWebLLM(){
  if(webllmPromise)return webllmPromise;
  webllmPromise=(async()=>{
    const {module:m}=await firstImport([
      'https://esm.run/@mlc-ai/web-llm@0.2.85',
      'https://esm.sh/@mlc-ai/web-llm@0.2.85'
    ],'WEBLLM');
    return m
  })().catch(err=>{webllmPromise=null;throw err});
  return webllmPromise
}
V.RuntimeDeps={loadPdfJs,loadTesseract,loadWebLLM,localRuntime,dependencyCandidates};
})();