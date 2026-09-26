import { chromium } from 'playwright';

const base=process.env.STUDY_119_V68_URL||'http://127.0.0.1:4173/v9/index.html';
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    V.Store.state.page='study';
    V.Store.state.subject='fire';
    V.Store.state.scopeId='F01';
    V.Store.state.conceptId='F01-C01';
    V.Store.state.studyTab='detail';
    V.Store.save();
    V.App.render();
  });
  const brand=await page.locator('.brand b').innerText();
  if(brand.trim()!=='소방합격')throw new Error('BRAND_MISMATCH '+brand);
  if((await page.title()).trim()!=='소방합격')throw new Error('TITLE_MISMATCH '+await page.title());

  const chip=page.locator('[data-detail-jump="comparison"]:visible').first();
  await chip.waitFor({state:'visible',timeout:15000});
  await chip.click();
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-detail-jump="comparison"]')].some(el=>el.offsetParent!==null&&el.classList.contains('on')));
  const activeSection=page.locator('[data-detail-section="comparison"]:visible').first();
  await activeSection.waitFor({state:'visible'});
  if(!(await activeSection.evaluate(el=>el.classList.contains('detail-section-active'))))throw new Error('DETAIL_SECTION_NOT_ACTIVE');
  const color=await activeSection.locator('h3').evaluate(el=>getComputedStyle(el).color);
  if(!color||color==='rgb(255, 255, 255)')throw new Error('DETAIL_TITLE_NOT_HIGHLIGHTED '+color);

  await page.locator('[data-study-tab="ai"]:visible').first().click();
  const input=page.locator('[data-tutor-input]:visible').first();
  await input.fill('정의만 간단히 알려줘');
  await input.press('Enter');
  await page.waitForFunction(()=>[...document.querySelectorAll('.tutor-message.me')].some(x=>x.textContent.includes('정의만 간단히 알려줘')),{timeout:10000});
  if(errors.length)throw new Error('PAGE_ERRORS '+errors.join(' | '));
  console.log('V68_DETAIL_SOURCE_BRAND_E2E_SUCCESS');
}finally{
  await browser.close();
}
