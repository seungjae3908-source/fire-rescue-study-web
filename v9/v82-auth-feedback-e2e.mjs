import { chromium } from 'playwright';
const base=process.env.STUDY_119_V82_URL||'http://127.0.0.1:4173/v9/index.html';
const assert=(v,m,x={})=>{if(!v)throw new Error(m+' '+JSON.stringify(x));console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const p=await ctx.newPage();p.setDefaultTimeout(45000);
 await p.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.SupabaseLite&&!!window.AITUTOR_V9?.Auth);

 const urls=await p.evaluate(async()=>{
   const V=window.AITUTOR_V9,old=window.fetch,calls=[];
   window.fetch=async(url,opt)=>{calls.push(String(url));return new Response(JSON.stringify({user:{id:'v82'}}),{status:200,headers:{'Content-Type':'application/json'}})};
   const c=V.SupabaseLite.createClient('https://example.invalid','pk');
   await c.auth.signUp({email:'qa@example.com',password:'12345678',options:{emailRedirectTo:'https://study.example/v9/'}});
   await c.auth.resend({type:'signup',email:'qa@example.com',options:{emailRedirectTo:'https://study.example/v9/'}});
   window.fetch=old;localStorage.removeItem(V.SupabaseLite.sessionKey);return calls
 });
 assert(urls.length===2&&urls.every(x=>x.includes('redirect_to=https%3A%2F%2Fstudy.example%2Fv9%2F')),'signup and resend forward the app return URL',{urls});

 const redirect=await p.evaluate(()=>{
   const V=window.AITUTOR_V9,clean=location.pathname+location.search;
   history.replaceState(null,'',clean+'#access_token=a.b.c&refresh_token=r&type=signup');
   const c=V.SupabaseLite.createClient('https://example.invalid','pk'),out=c.__authRedirect;
   localStorage.removeItem(V.SupabaseLite.sessionKey);history.replaceState(null,'',clean);return{out,hash:location.hash}
 });
 assert(redirect.out?.consumed===true&&!redirect.out?.error&&redirect.hash==='','confirmation token redirect is consumed and cleaned from the address bar',redirect);

 const popup=await p.evaluate(()=>{
   const V=window.AITUTOR_V9,u={id:'v82-qa-user',email:'qa@example.com'},key='fire-rescue-study:update-seen:'+u.id;
   Object.defineProperty(V.Auth,'user',{configurable:true,get:()=>u});
   V.App.runtime.authBooting=false;V.App.runtime.authDialog=null;V.App.runtime.updateDialog=false;localStorage.removeItem(key);
   window.dispatchEvent(new CustomEvent('aitutor-auth-change',{detail:{reason:'signed-in',user:u}}));
   return{key,open:V.App.runtime.updateDialog}
 });
 assert(popup.open,'first login opens the V82 update notice');
 await p.waitForSelector('[data-update-notice-backdrop]');
 const copy=await p.locator('[data-update-notice-backdrop]').innerText();
 assert(copy.includes('소방합격 업데이트')&&copy.includes('회원가입·이메일 인증 안내 개선'),'update popup shows release contents',{copy});
 await p.locator('[data-update-notice-close]').click();
 const seen=await p.evaluate(key=>({value:localStorage.getItem(key),open:window.AITUTOR_V9.App.runtime.updateDialog}),popup.key);
 assert(seen.value==='2026.10.02-v82'&&!seen.open,'closing update notice records the version once per member',seen);
 await p.evaluate(()=>{const V=window.AITUTOR_V9,u=V.Auth.user;window.dispatchEvent(new CustomEvent('aitutor-auth-change',{detail:{reason:'signed-in',user:u}}))});
 await p.waitForTimeout(80);
 assert(await p.locator('[data-update-notice-backdrop]').count()===0,'same member does not see the same update notice twice');

 await p.evaluate(()=>{const V=window.AITUTOR_V9;V.App.runtime.authDialog={title:'회원가입 신청이 완료되었습니다',body:'인증메일을 보냈습니다. 이메일에서 인증을 완료한 뒤 로그인해주세요.'};V.App.render()});
 await p.waitForSelector('[data-auth-feedback-backdrop]');
 const signupCopy=await p.locator('[data-auth-feedback-backdrop]').innerText();
 assert(signupCopy.includes('회원가입 신청이 완료되었습니다')&&signupCopy.includes('인증메일'),'signup feedback modal gives the next action',{signupCopy});
 await p.locator('[data-auth-feedback-close]').click();

 console.log('V82_AUTH_FEEDBACK_E2E_SUCCESS');
 await ctx.close();
}finally{await browser.close()}
