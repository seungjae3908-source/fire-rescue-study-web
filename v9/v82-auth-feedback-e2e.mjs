import { chromium } from 'playwright';
const base=process.env.STUDY_119_V82_URL||'http://127.0.0.1:4173/v9/index.html';
const fail=[];const check=(v,m,x={})=>{if(v)console.log('PASS',m);else{fail.push({message:m,...x});console.error('V82_FAIL',JSON.stringify({message:m,...x}))}};
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const p=await ctx.newPage();p.setDefaultTimeout(45000);
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Auth);
 
 // Redirect contract: signup + resend point back to current app URL.
 let signupUrl='',resendUrl='';
 await p.route('https://example.supabase.co/**',async route=>{
   const u=route.request().url();if(u.includes('/signup'))signupUrl=u;if(u.includes('/resend'))resendUrl=u;
   await route.fulfill({status:200,contentType:'application/json',body:u.includes('/signup')?JSON.stringify({user:{id:'u1',email:'qa@example.com'}}):'{}'});
 });
 const redirect=await p.evaluate(async()=>{
   const c=window.AITUTOR_V9.SupabaseLite.createClient('https://example.supabase.co','pk');
   const back=location.origin+location.pathname;
   await c.auth.signUp({email:'qa@example.com',password:'12345678',options:{data:{app_scope:'study-v9'},emailRedirectTo:back}});
   await c.auth.resend({type:'signup',email:'qa@example.com',options:{emailRedirectTo:back}});
   return back
 });
 check(signupUrl.includes('redirect_to='+encodeURIComponent(redirect)),'signup request includes app confirmation redirect',{signupUrl,redirect});
 check(resendUrl.includes('redirect_to='+encodeURIComponent(redirect)),'resend request includes app confirmation redirect',{resendUrl,redirect});

 // Redirect marker survives cleanup and identifies signup confirmation.
 const marker=await p.evaluate(()=>{
   history.replaceState(null,'',location.pathname+'#access_token=fake&refresh_token=refresh&type=signup&expires_in=3600');
   const c=window.AITUTOR_V9.SupabaseLite.createClient('https://example2.supabase.co','pk');
   return{redirect:c.redirect,hash:location.hash};
 });
 check(marker.redirect?.ok&&marker.redirect?.type==='signup','signup callback is recognized as successful confirmation',marker);
 check(marker.hash==='','confirmation tokens are removed from the visible URL',marker);

 // UI flow: signup and login both show explicit dialogs while keeping the frozen app UI.
 await p.evaluate(()=>{localStorage.removeItem('aitutor9:v82-seen');window.AITUTOR_V9.Auth.signUp=async()=>({pendingEmailConfirmation:true});window.AITUTOR_V9.Auth.signIn=async()=>({user:{id:'u1'}})});
 await p.locator('[data-account]').first().click();
 await p.locator('#authEmail').fill('qa@example.com');await p.locator('#authPw').fill('12345678');
 const signupDialog=p.waitForEvent('dialog');await p.locator('[data-signup]').click();const sd=await signupDialog;const signupText=sd.message();await sd.accept();
 check(signupText.includes('회원가입 신청이 완료되었습니다.')&&signupText.includes('인증메일'),'signup click shows completion + email verification guidance',{signupText});
 await p.locator('#authPw').fill('12345678');
 const loginDialog=p.waitForEvent('dialog');await p.locator('[data-signin]').click();const ld=await loginDialog;const loginText=ld.message();await ld.accept();
 check(loginText.includes('소방합격 업데이트')&&loginText.includes('회원가입·이메일 인증 안내 개선'),'first login shows update notes',{loginText});
 const seen=await p.evaluate(()=>localStorage.getItem('aitutor9:v82-seen'));
 check(seen==='1','update notice is marked seen after first display',{seen});
 
 if(fail.length)throw new Error('V82_AUTH_FEEDBACK_FAILURES '+JSON.stringify(fail));
 console.log('V82_AUTH_FEEDBACK_E2E_SUCCESS');
 await ctx.close();
}finally{await browser.close()}
