import { chromium } from 'playwright';

const base=process.env.STUDY_119_PRODUCTION_URL||'https://seungjae3908-source.github.io/fire-rescue-study-web/v9/';
const runtimeHeadUrl=process.env.STUDY_119_RUNTIME_HEAD_URL||new URL('runtime-head.json',base).href;
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const email=process.env.STUDY_119_MEMBER_EMAIL||'';
const password=process.env.STUDY_119_MEMBER_PASSWORD||'';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('STUDY_119_EXPECTED_RUNTIME_HEAD_REQUIRED');
if(!email||!password)throw new Error('STUDY_119_MEMBER_CREDENTIALS_REQUIRED');

const rr=await fetch(runtimeHeadUrl,{headers:{'cache-control':'no-cache'}});
assert(rr.ok,'Pages runtime identity HTTP '+rr.status);
const runtime=await rr.json();
assert(runtime.sha===expected,'Pages runtime identity matches '+expected);
assert(runtime.environment==='production'&&runtime.transport==='github-pages','Pages runtime identity is production GitHub Pages');

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [
    {width:390,height:844,isMobile:true,label:'mobile'},
    {width:1440,height:900,isMobile:false,label:'desktop'}
  ]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push('pageerror:'+e.message));
    page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});

    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Auth,{timeout:60000});
    await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:60000});
    assert(await page.locator('.page').count()===0,vp.label+' guest starts closed behind member gate');

    await page.locator('#authEmail').fill(email);
    await page.locator('#authPw').fill(password);
    await page.locator('[data-signin]').click();
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.Auth?.user,{timeout:60000});
    await page.waitForSelector('.login-gate-shell',{state:'detached',timeout:60000});
    await page.waitForSelector('.main.page-home',{state:'visible',timeout:60000});

    const signed=await page.evaluate(()=>({
      id:window.AITUTOR_V9.Auth?.user?.id||'',
      email:window.AITUTOR_V9.Auth?.user?.email||'',
      owner:window.AITUTOR_V9.Store?.ownerId||'',
      page:window.AITUTOR_V9.Store?.state?.page||''
    }));
    assert(!!signed.id&&signed.email.toLowerCase()===email.toLowerCase(),vp.label+' real Supabase member is signed in through app UI');
    assert(signed.owner===signed.id,vp.label+' store switches to authenticated member owner');
    assert(signed.page==='home',vp.label+' member lands on home after sign-in');

    for(const route of ['home','study','notes','exam','wrong','stats','resources','suggestions','settings']){
      await page.evaluate(async route=>window.AITUTOR_V9.App.go(route),route);
      await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route,{timeout:60000});
      await page.waitForSelector('.main.page-'+route,{state:'visible',timeout:60000});
      assert((await page.locator('.page').innerText()).trim().length>0,vp.label+' authenticated '+route+' renders');
    }

    await page.evaluate(async()=>window.AITUTOR_V9.App.go('notes'));
    await page.waitForSelector('#passNotePdf',{state:'attached',timeout:30000});
    assert(await page.locator('#passNotePdf').count()===1,vp.label+' authenticated notes exposes PDF upload');

    await page.locator('[data-account]').first().click();
    await page.waitForSelector('[data-signout]',{state:'visible',timeout:30000});
    await page.locator('[data-signout]').click();
    await page.waitForFunction(()=>!window.AITUTOR_V9?.Auth?.user,{timeout:60000});
    await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:60000});
    assert(await page.locator('.page').count()===0,vp.label+' sign-out returns to closed member gate');

    assert(errors.length===0,vp.label+' authenticated live runtime errors = 0 '+errors.join(' | '));
    await ctx.close();
  }
  console.log('GITHUB_PAGES_AUTHENTICATED_UI_ACCEPTANCE_SUCCESS',JSON.stringify({sha:expected}));
}finally{await browser.close()}
