import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://fire-rescue-study-web.vercel.app/';
const configuredExpected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const isPullRequest=process.env.GITHUB_EVENT_NAME==='pull_request';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
if(!/^[0-9a-f]{40}$/i.test(configuredExpected))throw new Error('STUDY_119_EXPECTED_RUNTIME_HEAD_REQUIRED');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function waitForGuardedRuntime(){
  const url=new URL('/api/runtime-head',base);
  let last={status:0,sha:'',error:''};
  for(let attempt=1;attempt<=36;attempt++){
    try{
      const res=await fetch(url,{cache:'no-store'});
      let body={};try{body=await res.json()}catch{}
      last={status:res.status,sha:String(body?.sha||''),ok:body?.ok===true,error:String(body?.error||'')};
      if(res.status===200&&body?.ok===true&&/^[0-9a-f]{40}$/i.test(last.sha)){
        if(last.sha===configuredExpected){
          console.log('PRODUCTION_EXACT_BASE_READY',JSON.stringify({attempt,expected:configuredExpected}));
          return last.sha;
        }
        if(isPullRequest){
          console.warn('PRODUCTION_BASE_NOT_DEPLOYED_PIN_CURRENT',JSON.stringify({attempt,baseExpected:configuredExpected,currentProduction:last.sha}));
          return last.sha;
        }
      }
    }catch(error){last={status:0,sha:'',ok:false,error:String(error?.message||error)}}
    console.log('WAIT_PRODUCTION_EXACT_BASE',JSON.stringify({attempt,expected:configuredExpected,last}));
    if(attempt<36)await sleep(10000);
  }
  throw new Error('TIMEOUT_WAITING_FOR_PRODUCTION_EXACT_BASE '+JSON.stringify({expected:configuredExpected,last}));
}

const pinnedRuntimeHead=await waitForGuardedRuntime();
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Suggestions,{timeout:60000});
  await page.waitForSelector('.app',{state:'visible',timeout:60000});

  const runtime=await page.evaluate(async()=>{
    const res=await fetch('/api/runtime-head',{cache:'no-store'});
    let body={};try{body=await res.json()}catch{}
    return{status:res.status,...body}
  });
  assert(runtime.status===200&&runtime.ok===true,'Production runtime identity endpoint healthy');
  assert(runtime.sha===pinnedRuntimeHead,'Production suggestion acceptance pinned runtime SHA '+pinnedRuntimeHead);

  await page.evaluate(()=>window.AITUTOR_V9.App.go('suggestions'));
  await page.waitForSelector('.suggestions-page',{timeout:30000});
  const guest=await page.evaluate(()=>({
    text:document.querySelector('.suggestions-page')?.textContent||'',
    submit:document.querySelectorAll('[data-suggest-submit]').length,
    adminSave:document.querySelectorAll('[data-suggest-admin-save]').length,
    rows:document.querySelectorAll('.suggestion-row').length,
    login:document.querySelectorAll('.suggestions-page [data-account]').length
  }));
  assert(/회원 전용/.test(guest.text)&&/로그인/.test(guest.text),'guest sees member-only suggestion notice');
  assert(guest.login===1,'guest suggestion view exposes one login/member button');
  assert(guest.submit===0&&guest.adminSave===0&&guest.rows===0,'guest cannot see suggestion write/admin/data UI');

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
  const suggestions=await anonGet('study_suggestions');
  const admins=await anonGet('study_admins');
  console.log('ANON_DATA_API_RESULT',JSON.stringify({
    study_suggestions:{status:suggestions.status,ok:suggestions.ok,code:suggestions.code},
    study_admins:{status:admins.status,ok:admins.ok,code:admins.code}
  }));
  for(const [name,r] of Object.entries({study_suggestions:suggestions,study_admins:admins})){
    assert(!r.ok,name+' anonymous Data API read is blocked');
    assert([401,403].includes(r.status)||r.code==='42501',name+' anonymous denial is authorization/privilege based');
  }

  assert(errors.length===0,'Production suggestion guest runtime errors = 0 '+errors.join(' | '));
  console.log('PRODUCTION_SUGGESTIONS_PUBLIC_ACCEPTANCE_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
