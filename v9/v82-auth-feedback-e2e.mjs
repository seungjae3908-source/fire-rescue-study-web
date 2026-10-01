import { chromium } from 'playwright';
const base=process.env.STUDY_119_V82_URL||'http://127.0.0.1:4173/v9/index.html';
const failures=[];const check=(v,m,x={})=>{if(v)console.log('PASS',m);else{failures.push({message:m,...x});console.error('V82_FAIL',JSON.stringify({message:m,...x}))}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 const p=await ctx.newPage();p.setDefaultTimeout(45000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
 await p.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App);
 await p.locator('[data-account]').first().click();await p.waitForSelector('#authEmail');
 await p.evaluate(()=>{const V=window.AITUTOR_V9;V.Auth.signUp=async()=>({pendingEmailConfirmation:true});V.Auth.resendConfirmation=async()=>({ok:true})});
 await p.locator('#authEmail').fill('qa-v82@example.com');await p.locator('#authPw').fill('password123');
 await p.locator('[data-signup]').click();await p.waitForSelector('[data-auth-dialog-close]');
 let dialog=await p.locator('[role="dialog"]').innerText();
 check(dialog.includes('회원가입 신청이 완료되었습니다')&&dialog.includes('qa-v82@example.com'),'signup shows a clear success and email-verification dialog',{dialog});
 await p.locator('[data-auth-dialog-close]').click();await p.locator('[data-resend-confirmation]').click();await p.waitForSelector('[data-auth-dialog-close]');
 dialog=await p.locator('[role="dialog"]').innerText();
 check(dialog.includes('인증메일을 다시 보냈습니다'),'confirmation resend shows an explicit success dialog',{dialog});
 await ctx.close();

 const cb=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'}),cp=await cb.newPage();cp.setDefaultTimeout(45000);
 await cp.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await cp.goto(base+'?auth=confirmed',{waitUntil:'domcontentloaded'});await cp.waitForSelector('[data-auth-dialog-close]');
 const confirmed=await cp.locator('[role="dialog"]').innerText();
 check(confirmed.includes('이메일 인증이 완료되었습니다'),'email confirmation return shows completion dialog',{confirmed});
 check(!cp.url().includes('auth=confirmed'),'auth callback marker is cleaned from the address bar',{url:cp.url()});
 await cb.close();

 const rel=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'}),rp=await rel.newPage();rp.setDefaultTimeout(45000);
 await rp.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await rp.goto(base,{waitUntil:'domcontentloaded'});await rp.waitForFunction(()=>!!window.AITUTOR_V9?.App);
 await rp.evaluate(()=>{const V=window.AITUTOR_V9;Object.defineProperty(V.Auth,'user',{value:{id:'qa-v82',email:'qa-v82@example.com'},configurable:true});window.dispatchEvent(new CustomEvent('aitutor-auth-change',{detail:{reason:'signed-in',user:V.Auth.user}}))});
 await rp.waitForSelector('[data-release-notes-confirm]');
 const notes=await rp.locator('[role="dialog"]').innerText();
 check(notes.includes('소방합격 업데이트')&&notes.includes('회원가입·이메일 인증 안내 개선'),'signed-in users see the update summary once',{notes});
 await rp.locator('[data-release-notes-confirm]').click();
 const stored=await rp.evaluate(()=>localStorage.getItem('aitutor9:release-notes-seen'));
 check(stored==='2026.10.02','confirming update notes stores the seen version',{stored});
 await rp.evaluate(()=>window.dispatchEvent(new CustomEvent('aitutor-auth-change',{detail:{reason:'signed-in'}})));await settle(rp);
 check(await rp.locator('[data-release-notes-confirm]').count()===0,'acknowledged update notes do not reopen on the next sign-in event');
 check(errors.length===0,'V82 auth feedback QA has zero browser runtime errors',{errors});
 await rel.close();
 if(failures.length)throw new Error('V82_AUTH_FEEDBACK_FAILURES '+JSON.stringify(failures));
 console.log('V82_AUTH_FEEDBACK_E2E_SUCCESS');
}finally{await browser.close()}
