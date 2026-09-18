import { chromium } from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const TEST='https://session-expiry.test';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,OPTIONS','content-type':'application/json'};
const jwt=exp=>{
  const b=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
  return b({alg:'HS256',typ:'JWT'})+'.'+b({sub:'session-user',exp})+'.sig';
};

const browser=await chromium.launch({headless:true});
try{
  const context=await browser.newContext({viewport:{width:1000,height:760}});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  let refreshCalls=0,rest401=0,passwordCalls=0;
  await page.route(TEST+'/**',async route=>{
    const req=route.request(),url=req.url(),method=req.method();
    if(method==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
    if(url.includes('/auth/v1/token?grant_type=password')){
      passwordCalls++;
      let body={};try{body=JSON.parse(req.postData()||'{}')}catch{}
      const noRefresh=String(body.email||'').includes('no-refresh');
      const exp=noRefresh?Math.floor(Date.now()/1000)-60:Math.floor(Date.now()/1000)+3600;
      return route.fulfill({status:200,headers:cors,body:JSON.stringify({
        access_token:jwt(exp),
        refresh_token:noRefresh?'':'bad-refresh-token',
        token_type:'bearer',
        expires_at:exp,
        user:{id:'session-user',email:body.email||'qa@example.test'}
      })});
    }
    if(url.includes('/auth/v1/token?grant_type=refresh_token')){
      refreshCalls++;
      return route.fulfill({status:401,headers:cors,body:JSON.stringify({message:'Invalid Refresh Token'})});
    }
    if(url.includes('/rest/v1/')){
      rest401++;
      return route.fulfill({status:401,headers:cors,body:JSON.stringify({message:'JWT expired'})});
    }
    return route.fulfill({status:404,headers:cors,body:JSON.stringify({message:'not found'})});
  });

  await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForSelector('.app');
  const result=await page.evaluate(async TEST=>{
    const V=window.AITUTOR_V9,key=V.SupabaseLite.sessionKey;
    const run=async(email)=>{
      localStorage.removeItem(key);
      const client=V.SupabaseLite.createClient(TEST,'pk_session_test');
      const events=[];
      client.auth.onAuthStateChange((event,session)=>events.push({event,hasSession:!!session}));
      const login=await client.auth.signInWithPassword({email,password:'password123'});
      const storedAfterLogin=!!localStorage.getItem(key);
      const q=await client.from('study_profiles').select('*').eq('id','session-user');
      const storedAfterFailure=!!localStorage.getItem(key);
      return{
        loginOk:!!login.data?.user&&!login.error,
        storedAfterLogin,storedAfterFailure,
        queryError:q.error?.message||'',
        events
      };
    };
    const rejectedRefresh=await run('refresh-rejected@example.test');
    const noRefresh=await run('no-refresh@example.test');
    return{rejectedRefresh,noRefresh};
  },TEST);

  assert(result.rejectedRefresh.loginOk&&result.rejectedRefresh.storedAfterLogin,'refresh-rejected scenario starts with an authenticated stored session');
  assert(result.rejectedRefresh.storedAfterFailure===false,'401 refresh rejection clears the stored session');
  assert(result.rejectedRefresh.events.some(x=>x.event==='SIGNED_IN')&&result.rejectedRefresh.events.some(x=>x.event==='SIGNED_OUT'&&!x.hasSession),'401 refresh rejection emits SIGNED_OUT with no remaining session');
  assert(/JWT expired|Invalid/i.test(result.rejectedRefresh.queryError),'protected request remains fail-closed after refresh rejection');

  assert(result.noRefresh.loginOk&&result.noRefresh.storedAfterLogin,'expired/no-refresh scenario starts with a stored session');
  assert(result.noRefresh.storedAfterFailure===false,'expired access token without refresh token clears the stored session');
  assert(result.noRefresh.events.some(x=>x.event==='SIGNED_OUT'&&!x.hasSession),'expired/no-refresh session emits SIGNED_OUT');
  assert(refreshCalls===1,'only the scenario with a refresh token calls the refresh endpoint once');
  assert(rest401>=2&&passwordCalls===2,'both invalid-session scenarios exercise protected REST after sign-in');
  assert(errors.length===0,'session-expiry browser runtime errors = 0 ('+errors.join(' | ')+')');
  console.log('V9_AUTH_SESSION_EXPIRY_QA_SUCCESS',JSON.stringify({result,refreshCalls,rest401,passwordCalls}));
  await context.close();
}finally{await browser.close()}
