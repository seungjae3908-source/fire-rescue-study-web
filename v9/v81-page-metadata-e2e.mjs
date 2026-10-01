import { chromium } from 'playwright';
const base=process.env.STUDY_119_V81_URL||'http://127.0.0.1:4173/v9/index.html';
const leak=/(?:\d{1,4}[ \t]*[~–-][ \t]*)?\d{1,4}[ \t]*(?:쪽|페이지)\b|\b\d{1,4}[ \t]*[pP]\b/;
const failures=[];const check=(v,m,x={})=>{if(v)console.log('PASS',m);else{failures.push({message:m,...x});console.error('V81_FAIL',JSON.stringify({message:m,...x}))}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block'});
 const p=await ctx.newPage();p.setDefaultTimeout(45000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
 await p.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
 await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App&&window.AITUTOR_V9?.curriculum?.concepts?.length===183);
 const ids=await p.evaluate(()=>window.AITUTOR_V9.curriculum.concepts.map(x=>x.id));
 const leaks=[];
 for(const id of ids){
   await p.evaluate(id=>{const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=id;s.studyTab='core';s.outline=false;V.App.render()},id);
   await p.waitForSelector('.page-study .core-view');await settle(p);
   const core=await p.locator('.page-study .core-view').innerText();
   if(leak.test(core))leaks.push({id,tab:'core',text:core.match(leak)?.[0]||''});
   await p.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.studyTab='detail';V.App.render()});
   await p.waitForSelector('.page-study .detail-view');await settle(p);
   const detail=await p.locator('.page-study .detail-view').innerText();
   if(leak.test(detail))leaks.push({id,tab:'detail',text:detail.match(leak)?.[0]||''});
 }
 check(leaks.length===0,'all 183 core/detail learner views hide page metadata',{count:leaks.length,samples:leaks.slice(0,12)});

 await p.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['E24-C01'],s=V.Store.state;s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='ai';s.chat=(s.chat||[]).filter(x=>x.conceptId!==c.id);s.chat.push({id:'v81-user',role:'user',conceptId:c.id,at:Date.now(),text:'407쪽 내용이 뭐야?'},{id:'v81-ai',role:'assistant',conceptId:c.id,at:Date.now()+1,text:'교재 404~407쪽에서는 기본소생술의 목적을 설명한다. 407페이지의 기준을 기억한다.'});V.App.render()});
 await p.waitForSelector('.page-study .tutor-message.assistant');await settle(p);
 const chat=await p.evaluate(()=>({user:document.querySelector('.page-study .tutor-message.me')?.innerText||'',assistant:document.querySelector('.page-study .tutor-message.assistant')?.innerText||'',stored:(window.AITUTOR_V9.Store.state.chat||[]).find(x=>x.id==='v81-ai')?.text||''}));
 check(chat.user.includes('407쪽'),'user-entered page reference remains visible in the user message',chat);
 check(!leak.test(chat.assistant),'AI displayed answer hides page metadata',chat);
 check(chat.stored.includes('407쪽')&&chat.stored.includes('407페이지'),'AI grounding/storage keeps source-page information internally',chat);

 await p.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['E24-C01'];V.Store.state.studyTab='source';V.App.render()});await settle(p);
 check(await p.locator('.page-study [data-source-concept]').count()>0,'source tab keeps official-source/PDF entry point');
 check(errors.length===0,'V81 page cleanup has zero browser runtime errors',{errors});
 if(failures.length)throw new Error('V81_PAGE_METADATA_FAILURES '+JSON.stringify(failures));
 console.log('V81_PAGE_METADATA_E2E_SUCCESS');
 await ctx.close();
}finally{await browser.close()}
