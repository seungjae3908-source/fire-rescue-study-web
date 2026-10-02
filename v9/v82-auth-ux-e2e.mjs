import { chromium } from 'playwright';
const base=process.env.STUDY_119_V82_URL||'http://127.0.0.1:4173/v9/index.html';
const assert=(v,m,x={})=>{if(!v)throw new Error(m+' '+JSON.stringify(x));console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
async function load({result='' }={}){
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 if(result)await ctx.addInitScript(v=>{window.AITUTOR_V9={authRedirectResult:v}},result);
 const page=await ctx.newPage();page.setDefaultTimeout(45000);const dialogs=[];
 page.on('dialog',async d=>{dialogs.push(d.message());await d.accept()});
 await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await page.goto(base,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!!window.AITUTOR_V9?.App);
 return{ctx,page,dialogs}
}
try{
 {
  const {ctx,page,dialogs}=await load({result:'confirmed'});
  await page.waitForTimeout(150);
  assert(dialogs.some(x=>x.includes('이메일 인증 완료')&&x.includes('회원가입이 완료되었습니다')),'email confirmation success is explicitly acknowledged',{dialogs});
  await ctx.close();
 }
 {
  const {ctx,page,dialogs}=await load({result:'error'});
  await page.waitForTimeout(150);
  assert(dialogs.some(x=>x.includes('이메일 인증 실패')&&x.includes('다시 요청')),'email confirmation failure is explicitly acknowledged',{dialogs});
  await ctx.close();
 }
 {
  const {ctx,page,dialogs}=await load();
  await page.evaluate(()=>window.AITUTOR_V9.App.go('settings'));
  await page.waitForSelector('[data-signup]');
  await page.evaluate(()=>{window.AITUTOR_V9.Auth.signUp=async()=>({pendingEmailConfirmation:true})});
  await page.locator('#authEmail').fill('qa-v82@example.com');await page.locator('#authPw').fill('password123');
  await page.locator('[data-signup]').click();await page.waitForTimeout(80);
  assert(dialogs.some(x=>x.includes('회원가입 신청 완료')&&x.includes('인증메일')),'signup shows a confirmation dialog',{dialogs});
  const notice=await page.locator('.settings-notice').innerText().catch(()=>page.locator('.privacy').first().innerText());
  assert(notice.includes('회원가입 신청 완료'),'signup leaves persistent email-confirmation guidance',{notice});
  await ctx.close();
 }
 {
  const {ctx,page,dialogs}=await load();
  await page.evaluate(()=>{window.__v82User=null;const A=window.AITUTOR_V9.Auth;Object.defineProperty(A,'user',{configurable:true,get:()=>window.__v82User});Object.defineProperty(A,'isGuest',{configurable:true,get:()=>!window.__v82User});A.signIn=async()=>{window.__v82User={id:'v82-user',email:'v82@example.com'};return{user:window.__v82User}};window.AITUTOR_V9.App.go('settings')});
  await page.waitForSelector('[data-signin]');
  await page.locator('#authEmail').fill('v82@example.com');await page.locator('#authPw').fill('password123');
  await page.locator('[data-signin]').click();await page.waitForTimeout(250);
  assert(dialogs.some(x=>x.includes('소방합격 업데이트 V82')&&x.includes('회원가입·이메일 인증 안내 개선')),'login shows V82 release notes once',{dialogs});
  const seen=await page.evaluate(()=>localStorage.getItem('study119-update-V82-v82-user'));
  assert(seen==='1','V82 release notice stores per-user seen state',{seen});
  await ctx.close();
 }
 console.log('V82_AUTH_UX_E2E_SUCCESS');
}finally{await browser.close()}
