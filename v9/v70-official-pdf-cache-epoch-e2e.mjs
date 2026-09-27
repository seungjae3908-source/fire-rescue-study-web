import { chromium } from 'playwright';

const base=process.env.STUDY_119_V70_CACHE_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m,meta={}){if(!v)throw new Error(m+' '+JSON.stringify(meta));console.log('PASS',m,JSON.stringify(meta))}
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext();
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.get,{timeout:60000});

  const result=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9,epoch=String(window.AITUTOR_V9_CONFIG?.officialPdfCacheEpoch||'');
    const DB='aitutor-v9-official-source-pdfs';
    const openDb=()=>new Promise((resolve,reject)=>{
      const r=indexedDB.open(DB,1);
      r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('sources'))d.createObjectStore('sources',{keyPath:'key'})};
      r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
    });
    const put=async row=>{
      const d=await openDb();
      await new Promise((resolve,reject)=>{
        const t=d.transaction('sources','readwrite');t.objectStore('sources').put(row);
        t.oncomplete=resolve;t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);
      });
      d.close();
    };
    const raw=async key=>{
      const d=await openDb();
      const row=await new Promise((resolve,reject)=>{
        const t=d.transaction('sources','readonly'),r=t.objectStore('sources').get(key);
        r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error);
      });
      d.close();return row;
    };
    const blob=new Blob(['%PDF-1.7\ncache-epoch-qa'],{type:'application/pdf'});

    await put({key:'fire1',name:'stale.pdf',mime:'application/pdf',blob,updatedAt:1,origin:'official-proxy-cache',cacheEpoch:'stale-epoch'});
    const stale=await V.SourcePDF.get('fire1');
    const staleRaw=await raw('fire1');

    await put({key:'ems',name:'local-user.pdf',mime:'application/pdf',blob,updatedAt:2});
    const local=await V.SourcePDF.get('ems');
    const localRaw=await raw('ems');

    await put({key:'law1',name:'current.pdf',mime:'application/pdf',blob,updatedAt:3,origin:'official-mirror-cache',cacheEpoch:epoch});
    const current=await V.SourcePDF.get('law1');
    const currentRaw=await raw('law1');

    await V.SourcePDF.remove('ems');
    await V.SourcePDF.remove('law1');
    return{
      epoch,
      exportedEpoch:V.SourcePDF.officialCacheEpoch||'',
      staleReturned:!!stale,
      stalePersisted:!!staleRaw,
      localReturned:!!local?.blob,
      localPersisted:!!localRaw?.blob,
      currentReturned:!!current?.blob,
      currentPersisted:!!currentRaw?.blob
    };
  });

  assert(result.epoch.length>20,'runtime exposes non-empty official PDF cache epoch',result);
  assert(result.exportedEpoch===result.epoch,'SourcePDF exports the configured cache epoch',result);
  assert(!result.staleReturned&&!result.stalePersisted,'stale official IndexedDB PDF row is rejected and deleted',result);
  assert(result.localReturned&&result.localPersisted,'local/user PDF row without official origin is preserved',result);
  assert(result.currentReturned&&result.currentPersisted,'current official PDF row with matching epoch is preserved',result);
  assert(errors.length===0,'cache epoch QA has no page errors',{errors});
  console.log('V70_OFFICIAL_PDF_CACHE_EPOCH_E2E_SUCCESS',JSON.stringify(result));
}finally{
  await browser.close();
}
