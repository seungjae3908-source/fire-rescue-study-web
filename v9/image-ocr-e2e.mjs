import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'http://127.0.0.1:4173/v9/index.html';
const expectedAppHead=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
function normBenchmark(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/[^0-9a-z가-힣%/]/g,'')}
function levenshtein(a,b){const x=[...a],y=[...b],dp=Array(y.length+1).fill(0).map((_,i)=>i);for(let i=1;i<=x.length;i++){let prev=dp[0];dp[0]=i;for(let j=1;j<=y.length;j++){const old=dp[j];dp[j]=Math.min(dp[j]+1,dp[j-1]+1,prev+(x[i-1]===y[j-1]?0:1));prev=old}}return dp[y.length]}
function cer(expected,actual){const e=normBenchmark(expected),a=normBenchmark(actual);return e.length?levenshtein(e,a)/e.length:1}
const owner='qa-image-owner';

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1100,height:800}});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');
  if(expectedAppHead)assert(await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'')===expectedAppHead,'image OCR QA serves expected deployed head '+expectedAppHead);
  page.setDefaultTimeout(300000);

  const first=await page.evaluate(async owner=>{
    const V=window.AITUTOR_V9;
    V.Store.switchOwner(owner);
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=360;
    const g=canvas.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,canvas.width,canvas.height);
    g.fillStyle='#000';g.font='bold 92px Arial, sans-serif';g.textBaseline='middle';
    g.fillText('119 RESCUE OCR 2468',70,180);
    const blob=await new Promise((res,rej)=>canvas.toBlob(x=>x?res(x):rej(Error('PNG_CREATE_FAILED')),'image/png'));
    const file=new File([blob],'ocr-qa.png',{type:'image/png'});
    const progress=[];
    const ingested=await V.PrivateDocs.ingest(file,{kind:'personal',title:'IMAGE OCR QA',keepOriginal:true,onProgress:(i,n)=>progress.push([i,n])});
    const docs=await V.PrivateDocs.listDocuments('personal');
    const doc=docs.find(x=>x.id===ingested.doc.id);
    const hits=await V.PrivateDocs.search('RESCUE 2468',{kind:'personal',limit:10});
    const bundle=await V.PrivateDocs.exportForSync();

    const expectedBenchmark='화재 구조 119 산소 95% 유량 15 L/min 깊이 5 cm';
    const benchCanvas=document.createElement('canvas');benchCanvas.width=2000;benchCanvas.height=520;
    const bg=benchCanvas.getContext('2d');bg.fillStyle='#fff';bg.fillRect(0,0,benchCanvas.width,benchCanvas.height);
    bg.fillStyle='#000';bg.font='bold 84px "Noto Sans CJK KR","Noto Sans KR",Arial,sans-serif';bg.textBaseline='middle';
    bg.fillText('화재 구조 119 산소 95%',70,160);
    bg.fillText('유량 15 L/min 깊이 5 cm',70,350);
    const benchBlob=await new Promise((res,rej)=>benchCanvas.toBlob(x=>x?res(x):rej(Error('OCR_BENCH_PNG_FAILED')),'image/png'));
    const benchFile=new File([benchBlob],'ocr-korean-benchmark.png',{type:'image/png'});
    const benchIngest=await V.PrivateDocs.ingest(benchFile,{kind:'personal',title:'OCR QUALITY BENCHMARK',keepOriginal:false,aiAssist:false});
    const benchChunks=await V.PrivateDocs.chunksFor(benchIngest.doc.id);
    const benchmarkText=benchChunks.map(x=>x.text).join(' ');
    const benchmark={
      expected:expectedBenchmark,
      text:benchmarkText,
      confidence:Math.min(...benchChunks.map(x=>Number(x.ocrConfidence)).filter(Number.isFinite)),
      quality:Math.min(...benchChunks.map(x=>Number(x.quality)).filter(Number.isFinite)),
      needsReview:benchChunks.some(x=>x.needsReview),
      modes:[...new Set(benchChunks.map(x=>x.mode))]
    };
    return{
      ingested:{chunks:ingested.chunks,id:ingested.doc.id},
      doc:{id:doc?.id,title:doc?.title,mime:doc?.mime,pageCount:doc?.pageCount,hasOriginal:!!doc?.original,ownerId:doc?.ownerId},
      hits:hits.map(x=>({text:x.text,page:x.page,ownerId:x.ownerId})),
      bundle,
      progress,
      benchmark,
      privacy:V.PrivateDocs.privacyRules
    };
  },owner);

  assert(first.ingested.chunks>=1,'image OCR creates at least one private text chunk');
  assert(first.doc?.mime==='image/png'&&first.doc?.pageCount===1&&first.doc?.hasOriginal===true,'local image document preserves one-page image metadata and optional local original');
  assert(first.hits.length>=1&&/RESCUE/i.test(first.hits[0].text)&&/2468/.test(first.hits[0].text),'real image OCR text is searchable');
  assert(first.progress.some(x=>x[0]===1&&x[1]===1),'image OCR reports completion progress');
  assert(first.bundle.docs.length===1&&first.bundle.chunks.length>=1,'image OCR metadata + extracted text export for member sync');
  assert(first.bundle.docs.every(d=>d.ownerId===owner&&!d.original),'sync export strips original image bytes');
  const benchmarkCer=cer(first.benchmark.expected,first.benchmark.text);
  const compact=normBenchmark(first.benchmark.text);
  const numericFacts=['119','95','15','5'].every(x=>compact.includes(x));
  const unitFacts=compact.includes('95%')&&compact.includes('15l/min')&&compact.includes('5cm');
  const koreanFacts=['화재','구조','산소','유량','깊이'].every(x=>compact.includes(x));
  assert(benchmarkCer<=0.18,'OCR benchmark character error rate <= 18% ('+benchmarkCer.toFixed(3)+')');
  assert(numericFacts&&unitFacts,'OCR benchmark preserves numeric facts and units');
  assert(koreanFacts,'OCR benchmark preserves Korean key terms');
  assert(first.benchmark.needsReview===false&&Number(first.benchmark.confidence)>=70&&Number(first.benchmark.quality)>=0.62,'clean OCR benchmark clears confidence/quality review thresholds');
  assert(first.privacy.serverUpload===false&&first.privacy.crossUserSharing===false,'image source remains private/no automatic original upload');

  const other=await page.evaluate(async bundle=>{
    const V=window.AITUTOR_V9;V.Store.switchOwner('qa-image-other-owner');
    const imported=await V.PrivateDocs.importFromSync(bundle.docs,bundle.chunks);
    const docs=await V.PrivateDocs.listDocuments('personal');
    const hits=await V.PrivateDocs.search('RESCUE 2468',{kind:'personal',limit:10});
    return{imported,docs:docs.length,hits:hits.length};
  },first.bundle);
  assert(other.imported.docs===0&&other.docs===0&&other.hits===0,'another owner cannot import or search the image OCR bundle');
  await ctx.close();

  const restoreCtx=await browser.newContext({viewport:{width:1000,height:760}});
  const restorePage=await restoreCtx.newPage(),restoreErrors=[];
  restorePage.on('pageerror',e=>restoreErrors.push(e.message));
  await restorePage.goto(base,{waitUntil:'domcontentloaded'});await restorePage.waitForSelector('.app');
  if(expectedAppHead)assert(await restorePage.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'')===expectedAppHead,'image restore QA serves expected deployed head '+expectedAppHead);
  const restored=await restorePage.evaluate(async ({owner,bundle})=>{
    const V=window.AITUTOR_V9;V.Store.switchOwner(owner);
    const imported=await V.PrivateDocs.importFromSync(bundle.docs,bundle.chunks);
    const docs=await V.PrivateDocs.listDocuments('personal');
    const hits=await V.PrivateDocs.search('RESCUE 2468',{kind:'personal',limit:10});
    const doc=docs.find(x=>x.title==='IMAGE OCR QA');
    return{imported,docs:docs.length,hits:hits.length,hitText:hits[0]?.text||'',restoredOriginal:doc?.original??null,ownerId:doc?.ownerId};
  },{owner,bundle:first.bundle});

  assert(restored.imported.docs===1&&restored.imported.chunks>=1,'fresh browser context restores image OCR metadata and extracted text for the same owner');
  assert(restored.docs===1&&restored.hits>=1&&/RESCUE/i.test(restored.hitText),'restored image OCR text remains searchable');
  assert(restored.restoredOriginal===null&&restored.ownerId===owner,'cloud-style restore never recreates original image bytes and preserves owner identity');
  assert(errors.length===0&&restoreErrors.length===0,'image OCR/restore runtime errors = 0 ('+[...errors,...restoreErrors].join(' | ')+')');
  console.log('V9_IMAGE_OCR_RESTORE_QA_SUCCESS',JSON.stringify({first:{doc:first.doc,hits:first.hits,progress:first.progress,bundle:{docs:first.bundle.docs.length,chunks:first.bundle.chunks.length},benchmark:{...first.benchmark,cer:cer(first.benchmark.expected,first.benchmark.text)}},other,restored}));
  await restoreCtx.close();
}finally{await browser.close()}
