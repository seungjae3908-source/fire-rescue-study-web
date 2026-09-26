import { chromium } from 'playwright';
const base=process.env.STUDY_119_V69_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
const fail=(m,d={})=>{throw new Error(m+' '+JSON.stringify(d))};
try{
 for(const vp of [{w:390,h:844},{w:768,h:1024},{w:1024,h:768},{w:1440,h:900},{w:1920,h:1080}]){
  const ctx=await browser.newContext({viewport:{width:vp.w,height:vp.h},serviceWorkers:'block'});
  const page=await ctx.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
  await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"targetExamYear":"2027","contentBaselineYear":"2026","sources":[],"items":[]}'}));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
  const title=await page.title();if(title!=='소방합격')fail('brand title mismatch',{vp,title});
  const sched=await page.locator('.dashboard-schedule:visible').count();if(sched)fail('duplicate schedule card still visible',{vp});
  const t=Date.now();await page.evaluate(()=>window.AITUTOR_V9.App.go('notes'));await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='notes');const notesMs=Date.now()-t;if(notesMs>900)fail('notes route still blocked',{vp,notesMs});
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.subject='fire';V.Store.state.scopeId='F01';V.Store.state.conceptId='F01-C01';V.Store.state.studyTab='detail';V.Store.save();V.App.render()});
  const cmp=page.locator('[data-detail-jump="comparison"]:visible').first();if(await cmp.count()){await cmp.click();await page.waitForFunction(()=>[...document.querySelectorAll('[data-detail-jump="comparison"]')].some(x=>x.offsetParent!==null&&x.classList.contains('on')&&x.getAttribute('aria-current')==='location'))}
  if(vp.w>=1440){const detail=page.locator('.detail-view:visible').first();const box=await detail.boundingBox();if(!box||box.width<1050)fail('desktop detail remains too narrow',{vp,box});const cols=await detail.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);if(cols<2)fail('desktop detail not using two-column structure',{vp,cols})}
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='ai';V.Store.save();V.App.render()});const input=page.locator('[data-tutor-input]:visible').first();await input.fill('소방본부는 지역에 몇개씩 있어?');await input.press('Enter');await page.waitForFunction(()=>[...document.querySelectorAll('.tutor-message.assistant')].some(x=>/숫자로 확인할 수 없습니다|확인되지 않은 숫자/.test(x.textContent)),{timeout:10000});
  await page.evaluate(()=>window.AITUTOR_V9.App.go('resources'));await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='resources');if(vp.w>=721){const list=page.locator('.resources-119>.card>.list').last();const cols=await list.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);if(cols<2)fail('resources desktop list not compact',{vp,cols})}
  if(vp.w>=1440){await page.evaluate(()=>window.AITUTOR_V9.App.go('bank'));await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.page==='bank');const box=await page.locator('.bank-page:visible').boundingBox();if(!box||box.width<1050)fail('bank page still underuses desktop width',{vp,box})}
  const overflow=await page.evaluate(()=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,body:document.body.scrollWidth-document.body.clientWidth}));if(overflow.doc>2||overflow.body>2)fail('horizontal overflow',{vp,overflow});
  if(errors.length)fail('runtime errors',{vp,errors:errors.slice(0,6)});
  await ctx.close();
 }
 console.log('V69_PRODUCTION_UX_E2E_SUCCESS');
}finally{await browser.close()}
