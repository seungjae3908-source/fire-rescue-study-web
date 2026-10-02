import { chromium } from 'playwright';
const base=process.env.STUDY_119_V82_URL||'http://127.0.0.1:4173/v9/index.html';
const AUTH='https://petlfbztqguuzkasfpug.supabase.co';
const cors={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'GET,POST,PATCH,DELETE,OPTIONS','content-type':'application/json'};
const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const jwt=()=>b64({alg:'HS256',typ:'JWT'})+'.'+b64({sub:'session-user',exp:Math.floor(Date.now()/1000)+3600})+'.sig';
const assert=(v,m,x={})=>{if(!v)throw new Error(m+' '+JSON.stringify(x));console.log('PASS',m)};
async function stub(page){
 await page.route(AUTH+'/**',async route=>{
   const req=route.request(),u=req.url(),method=req.method();
   if(method==='OPTIONS')return route.fulfill({status:204,headers:cors,body:''});
   if(u.includes('/auth/v1/signup'))return route.fulfill({status:200,headers:cors,body:JSON.stringify({id:'pending-user',email:'qa@example.test',identities:[{}]})});
   if(u.includes('/auth/v1/resend'))return route.fulfill({status:200,headers:cors,body:'{}'});
   if(u.includes('/auth/v1/token?grant_type=password'))return route.fulfill({status:200,headers:cors,body:JSON.stringify({access_token:jwt(),refresh_token:'rt',token_type:'bearer',expires_in:3600,user:{id:'session-user',email:'qa@example.test'}})});
   if(u.includes('/auth/v1/user'))return route.fulfill({status:200,headers:cors,body:JSON.stringify({id:'session-user',email:'qa@example.test'})});
   if(u.includes('/rest/v1/study_memberships'))return route.fulfill({status:200,headers:cors,body:JSON.stringify([{user_id:'session-user'}])});
   if(u.includes('/rest/v1/'))return route.fulfill({status:method==='GET'?200:204,headers:cors,body:method==='GET'?'[]':''});
   if(u.includes('/auth/v1/logout'))return route.fulfill({status:204,headers:cors,body:''});
   return route.fulfill({status:404,headers:cors,body:JSON.stringify({message:'not found'})});
 });
}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block'});
 const page=await ctx.newPage(),dialogs=[],errors=[];page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});page.on('pageerror',e=>errors.push(e.message));
 await stub(page);await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.AITUTOR_V9?.App);
 await page.locator('[data-account]').first().click();
 await page.locator('#authEmail').fill('qa@example.test');await page.locator('#authPw').fill('password123');await page.locator('[data-signup]').click();
 await page.waitForTimeout(80);
 assert(dialogs.some(x=>x.includes('회원가입 신청이 완료되었습니다.')&&x.includes('인증메일을 보냈습니다.')),'signup shows confirmation dialog',{dialogs});
 await page.locator('#authPw').fill('password123');await page.locator('[data-resend-confirmation]').click();await page.waitForTimeout(80);
 assert(dialogs.some(x=>x.includes('인증메일을 다시 보냈습니다.')),'resend shows confirmation dialog',{dialogs});
 await page.locator('#authPw').fill('password123');await page.locator('[data-signin]').click();await page.waitForTimeout(250);
 assert(dialogs.filter(x=>x.includes('소방합격 업데이트')).length===1,'login shows update popup once',{dialogs});
 assert(await page.evaluate(()=>localStorage.a9u82)==='1','update popup version is persisted');
 assert(errors.length===0,'signup/login UX has zero page errors',{errors});
 await ctx.close();

 const ctx2=await browser.newContext({viewport:{width:1000,height:760},serviceWorkers:'block'});
 const p2=await ctx2.newPage(),d2=[];p2.on('dialog',async d=>{d2.push(d.message());await d.accept()});await stub(p2);
 await p2.goto(base+'#access_token='+encodeURIComponent(jwt())+'&refresh_token=rt&expires_in=3600&token_type=bearer&type=signup',{waitUntil:'domcontentloaded'});
 await p2.waitForTimeout(200);
 assert(d2.some(x=>x.includes('이메일 인증이 완료되었습니다.')&&x.includes('회원가입이 완료되었습니다.')),'email-confirm redirect shows success dialog',{dialogs:d2});
 assert(!p2.url().includes('access_token='),'auth redirect tokens are removed from the visible URL');
 await ctx2.close();
 console.log('V82_AUTH_UX_E2E_SUCCESS');
}finally{await browser.close()}
