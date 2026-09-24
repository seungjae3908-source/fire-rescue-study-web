import { chromium } from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.app');
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum);
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],s=V.Store.state;
    s.page='study';s.studyTab='ai';s.conceptId=c.id;s.scopeId=c.scopeId;s.subject=c.subject;s.outline=false;
    s.chat=Array.from({length:14},(_,i)=>({id:'intent-'+i,role:i%2?'assistant':'user',conceptId:c.id,at:Date.now()+i,text:('과거 대화 '+(i+1)+' · 소화 원리 설명 ').repeat(6)}));
    V.Store.save();V.App.render();
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const before=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>{
    const body=el.closest('.study-body');
    if(body&&body.scrollHeight>body.clientHeight+80)body.scrollTop=Math.max(0,body.scrollHeight-body.clientHeight-140);
    const chatStyle=getComputedStyle(el);
    return{chatTop:el.scrollTop,bodyTop:body?.scrollTop||0,bodyGap:(body?.scrollHeight||0)-(body?.clientHeight||0)-(body?.scrollTop||0),chatOverflow:chatStyle.overflowY};
  });
  assert(before.bodyGap>24,'history-scroll fixture is intentionally away from newest message in the single study-body owner');
  assert(!['auto','scroll'].includes(before.chatOverflow)&&before.chatTop===0,'AI chat itself is not a vertical scroll owner');
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],s=V.Store.state;
    s.chat.push({id:'intent-incoming',role:'assistant',conceptId:c.id,at:Date.now()+100,text:'새 AI 답변이 도착했지만 사용자는 과거 대화를 읽고 있습니다. '.repeat(5)});
    V.Store.save();V.App.render();
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const after=await page.locator('.study-body-mobile .study-ai-chat').evaluate((el,before)=>{
    const body=el.closest('.study-body');
    return{chatTop:el.scrollTop,bodyTop:body?.scrollTop||0,bodyGap:(body?.scrollHeight||0)-(body?.clientHeight||0)-(body?.scrollTop||0),chatStable:Math.abs(el.scrollTop-before.chatTop)<=2,bodyStable:Math.abs((body?.scrollTop||0)-before.bodyTop)<=2,chatOverflow:getComputedStyle(el).overflowY};
  },before);
  assert(after.bodyGap>24&&after.chatStable&&after.bodyStable&&!['auto','scroll'].includes(after.chatOverflow),'incoming AI render preserves intentional reading position in the single study-body scroll owner');
  assert(errors.length===0,'history-scroll acceptance has zero browser runtime errors');
  console.log('CHAT_SCROLL_INTENT_E2E_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
