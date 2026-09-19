import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'http://127.0.0.1:4173/v9/index.html';
const expectedAppHead=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
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
    return{
      ingested:{chunks:ingested.chunks,id:ingested.doc.id},
      doc:{id:doc?.id,title:doc?.title,mime:doc?.mime,pageCount:doc?.pageCount,hasOriginal:!!doc?.original,ownerId:doc?.ownerId},
      hits:hits.map(x=>({text:x.text,page:x.page,ownerId:x.ownerId})),
      bundle,
      progress,
      privacy:V.PrivateDocs.privacyRules
    };
  },owner);

  assert(first.ingested.chunks>=1,'image OCR creates at least one private text chunk');
  assert(first.doc?.mime==='image/png'&&first.doc?.pageCount===1&&first.doc?.hasOriginal===true,'local image document preserves one-page image metadata and optional local original');
  assert(first.hits.length>=1&&/RESCUE/i.test(first.hits[0].text)&&/2468/.test(first.hits[0].text),'real image OCR text is searchable');
  assert(first.progress.some(x=>x[0]===1&&x[1]===1),'image OCR reports completion progress');
  assert(first.bundle.docs.length===1&&first.bundle.chunks.length>=1,'image OCR metadata + extracted text export for member sync');
  assert(first.bundle.docs.every(d=>d.ownerId===owner&&!d.original),'sync export strips original image bytes');
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
  console.log('V9_IMAGE_OCR_RESTORE_QA_SUCCESS',JSON.stringify({first:{doc:first.doc,hits:first.hits,progress:first.progress,bundle:{docs:first.bundle.docs.length,chunks:first.bundle.chunks.length}},other,restored}));
  await restoreCtx.close();
}finally{await browser.close()}
