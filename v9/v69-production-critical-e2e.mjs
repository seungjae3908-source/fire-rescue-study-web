import { chromium } from 'playwright';
const base=process.env.STUDY_119_PRODUCTION_URL||'https://fire-rescue-study-web.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('EXPECTED_RUNTIME_HEAD_REQUIRED');
const browser=await chromium.launch({headless:true});
const check=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const page=await ctx.newPage();page.setDefaultTimeout(60000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:90000});
  const runtime=await page.evaluate(async()=>{const r=await fetch('/api/runtime-head',{cache:'no-store'});return r.json()});
  check(runtime.sha===expected,'Production exact V69 SHA '+expected);
  const declared=await page.locator('script[src]:not([data-lazy-119])').count();
  check(declared===17,'Production serves seventeen eager scripts');

  await page.evaluate(()=>window.AITUTOR_V9.App.go('home'));
  const n0=Date.now();await page.evaluate(()=>window.AITUTOR_V9.App.go('notes'));await page.waitForSelector('.notes-page:visible');
  check(Date.now()-n0<1200,'Production notes opens without question-lane wait');

  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='source';V.Store.save();V.App.render()});
  let btn=page.locator('[data-source-concept]:visible').first();let t=Date.now();await btn.click();await page.waitForSelector('#pdfEvidence canvas',{state:'visible',timeout:12000});
  check(Date.now()-t<8000,'fire mirror first canvas <8s');await page.locator('#pdfEvidence [data-pdf-close]:visible').click();

  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01'));await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C01');
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='source';V.Store.save();V.App.render()});
  btn=page.locator('[data-source-concept]:visible').first();t=Date.now();await btn.click();await page.waitForSelector('#pdfEvidence canvas',{state:'visible',timeout:15000});
  const lawMs=Date.now()-t;
  const origin=await page.evaluate(async()=>{const x=await window.AITUTOR_V9.SourcePDF.openPdf('law2');return x.origin});
  check(lawMs<12000,'law2 first canvas <12s '+lawMs+'ms');
  check(origin==='official-proxy-range'||origin==='local-cache','law2 uses range-first or cached path '+origin);
  await page.locator('#pdfEvidence [data-pdf-close]:visible').click();

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  const cmp=page.locator('[data-detail-jump="comparison"]:visible').first();
  if(await cmp.count()){await cmp.click();await page.waitForFunction(()=>{const b=[...document.querySelectorAll('[data-detail-jump="comparison"]')].find(x=>x.offsetParent!==null);return b?.getAttribute('aria-current')==='location'},{timeout:3000});}
  console.log('V69_PRODUCTION_CRITICAL_E2E_SUCCESS');
}finally{await browser.close()}
