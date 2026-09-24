import { chromium } from 'playwright';

const base=process.env.STUDY_119_V66_URL||'https://fire-rescue-study-web.vercel.app/v9/';
const emptyMonitor={ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function settle(page,ms=120){await page.waitForTimeout(ms);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}
async function go(page,route){
  await page.evaluate(route=>window.AITUTOR_V9.App.go(route),route);
  await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);
  await settle(page);
}
async function setStudyTab(page,tab){
  await page.evaluate(tab=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.studyTab=tab;V.Store.save();V.App.render()},tab);
  await page.waitForFunction(tab=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.studyTab===tab,tab);
  await settle(page);
}
async function visibleOwner(page,scope='.page'){
  return page.locator(scope).evaluate(root=>{
    const visible=el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0};
    const rows=[root,...root.querySelectorAll('[data-scroll-owner]')].filter(visible).filter(el=>{
      const y=getComputedStyle(el).overflowY;
      return ['auto','scroll'].includes(y)&&el.scrollHeight>el.clientHeight+2;
    }).map(el=>({owner:el.getAttribute('data-scroll-owner')||'',cls:String(el.className||''),top:el.scrollTop,sh:el.scrollHeight,ch:el.clientHeight}));
    return rows;
  });
}
async function makeScrollable(page,ownerName,scope='.page'){
  await page.locator(scope).evaluate((root,ownerName)=>{
    root.querySelectorAll('[data-v66-probe]').forEach(x=>x.remove());
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    if(!owner)throw new Error('V66_OWNER_NOT_FOUND:'+ownerName);
    const probe=document.createElement('div');probe.dataset.v66Probe='1';probe.style.height='1800px';probe.style.width='1px';probe.style.pointerEvents='none';owner.appendChild(probe);owner.scrollTop=0;
  },ownerName);
  await settle(page);
}
async function wheel(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();
  await loc.waitFor({state:'visible',timeout:30000});
  const box=await loc.boundingBox();
  assert(!!box,label+' target visible');
  const before=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    return owner?.scrollTop??-1;
  },ownerName);
  await page.mouse.move(box.x+Math.min(box.width/2,30),box.y+Math.min(box.height/2,30));
  await page.mouse.wheel(0,520);
  await settle(page,180);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    return owner?.scrollTop??-1;
  },ownerName);
  assert(after>before+2,label+' wheel reaches '+ownerName+' '+JSON.stringify({before,after}));
}
async function swipe(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();
  await loc.waitFor({state:'visible',timeout:30000});
  const box=await loc.boundingBox();
  assert(!!box,label+' swipe target visible');
  const x=box.x+Math.min(box.width/2,30), y0=box.y+Math.min(Math.max(box.height*.72,22),box.height-8), y1=Math.max(box.y+8,y0-260);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:y0,radiusX:4,radiusY:4,force:1}]});
  for(let i=1;i<=6;i++){
    const y=y0+(y1-y0)*i/6;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y,radiusX:4,radiusY:4,force:1}]});
    await page.waitForTimeout(25);
  }
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await settle(page,220);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    return owner?.scrollTop??-1;
  },ownerName);
  assert(after>2,label+' swipe reaches '+ownerName+' '+after);
}
async function seed(page){
  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const q=V.questions.find(x=>V.QuestionQuality119?.isExamStyle?.(x)!==false);
    if(q){
      V.Store.state.conceptId=q.conceptId;V.Store.state.subject=q.subject;V.Store.state.scopeId=q.scopeId;
      V.Store.state.chat=Array.from({length:36},(_,i)=>({id:'v66-chat-'+i,role:'assistant',conceptId:q.conceptId,text:'V66 실제 스크롤 상호작용 검증 '+i+' '+('충분히 긴 AI 답변 본문입니다. '.repeat(8)),at:Date.now()+i}));
    }
    V.Store.save();V.App.render();
  });
  await settle(page);
}
async function openPdf(page){
  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace',{timeout:30000});
  await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F03-C03'));
  await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F03-C03');
  const mobile=await page.locator('.study-body-mobile').evaluate(el=>el.offsetParent!==null);
  const root=mobile?'.study-body-mobile':'.study-body-desktop';
  await page.locator(root+' [data-study-tab="source"]').click();
  await page.waitForSelector(root+' .source-only [data-source-concept]',{timeout:30000});
  await page.locator(root+' .source-only [data-source-concept]').click();
  await page.waitForSelector('#pdfEvidence .pdf-evidence-host',{state:'visible',timeout:120000});
  await settle(page,250);
}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [
    {width:390,height:844,isMobile:true},
    {width:768,height:1024,isMobile:false},
    {width:1024,height:900,isMobile:false},
    {width:1440,height:700,isMobile:false}
  ]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,hasTouch:vp.isMobile,serviceWorkers:'block'});
    const page=await ctx.newPage();page.setDefaultTimeout(90000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyMonitor)}));
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:90000});
    await seed(page);

    await go(page,'home');
    await wheel(page,'.home-main','home','home main '+vp.width);
    const homeSide=page.locator('.home-side:visible');
    if(await homeSide.count())await wheel(page,'.home-side','home','home side '+vp.width);
    if(vp.isMobile)await swipe(page,'.home-main','home','home mobile '+vp.width);

    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudyTab(page,tab);
      const owner=vp.isMobile?'study-mobile':'study-desktop';
      await wheel(page,'.concept-head',owner,'study '+tab+' header '+vp.width);
      await wheel(page,(vp.isMobile?'.study-body-mobile':'.study-body-desktop'),owner,'study '+tab+' body '+vp.width);
      if(tab==='detail'){
        const toc=page.locator('.detail-toc:visible');
        if(await toc.count())await wheel(page,'.detail-toc',owner,'study detail toc '+vp.width);
      }
      if(tab==='ai'){
        const ai=page.locator('.study-ai-chat:visible');
        if(await ai.count())await wheel(page,'.study-ai-chat',owner,'study AI messages '+vp.width);
        const compose=page.locator('.tutor-compose:visible');
        if(await compose.count())await wheel(page,'.tutor-compose',owner,'study AI compose '+vp.width);
      }
      if(vp.isMobile&&tab==='ai')await swipe(page,'.study-ai-chat:visible',owner,'study AI swipe '+vp.width);
    }

    await go(page,'bank');
    await wheel(page,'.question-filter-bar','bank','bank filters '+vp.width);
    const bankBody=page.locator('.bank-question-body:visible');
    if(await bankBody.count())await wheel(page,'.bank-question-body','bank','bank body '+vp.width);
    const bankActions=page.locator('.bank-workspace .actionbar:visible');
    if(await bankActions.count())await wheel(page,'.bank-workspace .actionbar','bank','bank footer '+vp.width);

    await go(page,'exam');
    const start=page.locator('[data-training-start="fire50"]');
    await start.waitFor({state:'visible',timeout:30000});await start.click();
    await page.waitForSelector('.exam-run-workspace',{timeout:30000});await settle(page);
    await wheel(page,'.exam-run-workspace','exam-active','exam content '+vp.width);
    const nav=page.locator('.exam-navigator:visible');if(await nav.count())await wheel(page,'.exam-navigator','exam-active','exam navigator '+vp.width);
    const side=page.locator('.exam-side:visible');if(await side.count())await wheel(page,'.exam-side','exam-active','exam side '+vp.width);

    await openPdf(page);
    await wheel(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-findbar','pdf','pdf findbar '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-evidence-host','pdf','pdf canvas host '+vp.width,'#pdfEvidence');
    const pager=page.locator('#pdfEvidence .pdf-pager:visible');if(await pager.count())await wheel(page,'#pdfEvidence .pdf-pager','pdf','pdf pager '+vp.width,'#pdfEvidence');
    if(vp.isMobile)await swipe(page,'#pdfEvidence .pdf-modal-head','pdf','pdf mobile header swipe '+vp.width,'#pdfEvidence');
    await page.locator('#pdfEvidence [data-pdf-close]').click();

    for(const [route,owner,target] of [
      ['notes','notes','.notes-page'],
      ['wrong','wrong','.wrong-page'],
      ['stats','stats','.stats-page .home-main'],
      ['resources','resources','.resources-page'],
      ['suggestions','suggestions','.suggestions-page'],
      ['settings','settings','.settings-page']
    ]){
      await go(page,route);
      const targetLoc=page.locator(target+':visible');
      if(await targetLoc.count())await wheel(page,target,owner,route+' body '+vp.width);
    }

    const owners=await visibleOwner(page);
    assert(owners.length<=1,'final visible page has <=1 effective owner '+vp.width+' '+JSON.stringify(owners));
    assert(errors.length===0,'no runtime errors '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  console.log('V66_REAL_INTERACTION_SCROLL_AUDIT_SUCCESS');
}finally{await browser.close()}
