import fs from 'node:fs';
import { chromium } from 'playwright';

const base=process.env.STUDY_119_V69_URL||'http://127.0.0.1:4173/v9/index.html';
const manifest=JSON.parse(fs.readFileSync(new URL('./bootstrap-v69-manifest.json',import.meta.url),'utf8'));
const bundles=manifest.groups.map(x=>x.bundle);
const canonical=new Set(manifest.groups.flatMap(x=>x.sources));
const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext();
  const page=await context.newPage();
  const requests=[];
  const errors=[];
  page.on('request',req=>requests.push(new URL(req.url()).pathname.split('/').pop()||''));
  page.on('pageerror',e=>errors.push(String(e.message||e)));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});

  const boot=[...new Set(requests.filter(x=>bundles.includes(x)))];
  const source=[...new Set(requests.filter(x=>canonical.has(x)))];
  const missing=bundles.filter(x=>!boot.includes(x)),extra=boot.filter(x=>!bundles.includes(x));
  if(boot.length!==bundles.length||missing.length||extra.length)throw new Error('BOOT_REQUESTS_MISMATCH '+JSON.stringify({expected:bundles,actual:boot,missing,extra}));
  if(source.length)throw new Error('CANONICAL_SOURCE_REQUESTED '+JSON.stringify(source));

  const perf=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>new URL(x.name).pathname.split('/').pop()||''));
  const perfBoot=[...new Set(perf.filter(x=>/^boot-v69-.+\.js$/.test(x)))];
  if(perfBoot.length!==11)throw new Error('PERF_BOOT_COUNT_'+perfBoot.length+' '+JSON.stringify(perfBoot));

  const state=await page.evaluate(()=>({
    app:!!window.AITUTOR_V9?.App,
    page:window.AITUTOR_V9?.Store?.state?.page||'',
    lane:document.documentElement.dataset.questionLane||''
  }));
  if(!state.app)throw new Error('APP_NOT_READY');
  if(errors.length)throw new Error('PAGE_ERRORS '+errors.join(' | '));
  console.log('V69_BOOTSTRAP_NETWORK_E2E_SUCCESS',JSON.stringify({bootRequests:boot.length,canonicalSourceRequests:source.length,state}));
}finally{
  await browser.close();
}
