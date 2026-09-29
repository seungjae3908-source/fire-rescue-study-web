import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://seungjae3908-source.github.io/fire-rescue-study-web/v9/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const runtimeHeadUrl=process.env.STUDY_119_RUNTIME_HEAD_URL||new URL('runtime-head.json',base).href;
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('STUDY_119_EXPECTED_RUNTIME_HEAD_REQUIRED');

const runtimeRes=await fetch(runtimeHeadUrl,{headers:{'cache-control':'no-cache'}});
assert(runtimeRes.ok,'Production runtime identity HTTP '+runtimeRes.status);
const runtime=await runtimeRes.json();
assert(runtime.sha===expected,'Production runtime identity matches '+expected);
assert(runtime.ok===true||runtime.source==='github-pages-actions','Production runtime identity is healthy');

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Suggestions,{timeout:60000});
  await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:60000});

  assert(await page.locator('.suggestions-page').count()===0,'guest cannot enter suggestion route UI before login');
  assert(await page.locator('[data-signin]').count()===1,'member login action is visible at global gate');

  const apiGate=await page.evaluate(async()=>{
    const out={};
    for(const op of ['list','isAdmin']){
      try{await window.AITUTOR_V9.Suggestions[op]();out[op]={ok:true,message:''}}
      catch(err){out[op]={ok:false,message:String(err?.message||err)}}
    }
    const cfg=window.AITUTOR_V9_CONFIG||{};
    return{...out,url:String(cfg.supabaseUrl||''),key:String(cfg.supabasePublishableKey||cfg.supabaseAnonKey||'')}
  });
  assert(!apiGate.list.ok&&apiGate.list.message==='LOGIN_REQUIRED','guest Suggestions.list fails closed with LOGIN_REQUIRED');
  assert(!apiGate.isAdmin.ok&&apiGate.isAdmin.message==='LOGIN_REQUIRED','guest Suggestions.isAdmin fails closed with LOGIN_REQUIRED');
  assert(/^https:\/\/[a-z0-9]+\.supabase\.co$/i.test(apiGate.url),'Production has a valid Supabase API URL');
  assert(/^sb_publishable_/.test(apiGate.key),'Production uses a publishable browser key');

  async function anonGet(table){
    const url=apiGate.url+'/rest/v1/'+table+'?select=*&limit=1';
    const res=await fetch(url,{headers:{apikey:apiGate.key,Accept:'application/json'}});
    const text=await res.text();
    let body={};try{body=JSON.parse(text)}catch{}
    return{status:res.status,ok:res.ok,code:String(body?.code||''),message:String(body?.message||'')}
  }
  for(const [name,r] of Object.entries({
    study_suggestions:await anonGet('study_suggestions'),
    study_admins:await anonGet('study_admins')
  })){
    assert(!r.ok,name+' anonymous Data API read is blocked');
    assert([401,403].includes(r.status)||r.code==='42501',name+' anonymous denial is authorization/privilege based');
  }

  assert(errors.length===0,'Production suggestion guest runtime errors = 0 '+errors.join(' | '));
  console.log('PRODUCTION_SUGGESTIONS_PUBLIC_ACCEPTANCE_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
