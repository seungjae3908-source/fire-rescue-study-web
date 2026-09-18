import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'6aa6eddffae43b3a88dbfb8fed6102c79c12fd38';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function noX(page,label){const r=await page.evaluate(()=>({doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]}));assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r))}
function observe(page){const errors=[];page.on('pageerror',e=>errors.push('pageerror:'+e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});page.on('requestfailed',r=>errors.push('requestfailed:'+r.url()+' '+(r.failure()?.errorText||'')));return errors}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [{width:390,height:844,isMobile:true},{width:1440,height:900,isMobile:false}]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile});
    const page=await ctx.newPage(),errors=observe(page);
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
    await page.waitForSelector('.app',{state:'visible',timeout:60000});
    assert(await page.locator('.boot').count()===0,'boot screen removed '+vp.width);
    const head=await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'');
    assert(head===expected,'runtime head matches '+expected);
    await noX(page,'home '+vp.width);

    await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
    await page.waitForSelector('.workspace',{timeout:30000});
    const tabCount=vp.isMobile?await page.locator('.book-jumpbar button').count():await page.locator('.tabbar button').count();
    assert(tabCount===4,'study exposes four learning tabs '+vp.width);
    await noX(page,'study '+vp.width);

    await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
    await page.waitForSelector('.exam-start',{timeout:30000});
    const exam=await page.locator('.exam-start').innerText();
    assert(exam.includes('65문항 · 65분')&&exam.includes('25문항')&&exam.includes('40문항'),'exam format visible '+vp.width);

    assert(errors.length===0,'runtime/request errors = 0 '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  console.log('V9_LIVE_STUDENT_UX_SMOKE_SUCCESS');
}finally{await browser.close()}
