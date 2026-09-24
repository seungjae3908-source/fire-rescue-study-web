import { chromium } from 'playwright';

const base=process.env.STUDY_119_V66_URL||'http://127.0.0.1:4173/v9/index.html';
const emptyMonitor={ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]};
const failures=[];
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
function check(v,m){if(v)console.log('PASS',m);else{failures.push(m);console.error('V66_FAIL',m)}return v}
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
  await loc.scrollIntoViewIfNeeded().catch(()=>{});
  await settle(page,80);
  const box=await loc.boundingBox();
  assert(!!box,label+' target visible');
  const state=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    if(!owner)return{top:-1,max:-1};
    return{top:owner.scrollTop,max:Math.max(0,owner.scrollHeight-owner.clientHeight)};
  },ownerName);
  const vp=page.viewportSize();
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const x=clamp(box.x+Math.min(box.width/2,30),4,(vp?.width||1440)-4);
  const y=clamp(box.y+Math.min(box.height/2,30),4,(vp?.height||900)-4);
  const delta=state.max-state.top>40?520:-520;
  await page.mouse.move(x,y);
  await page.mouse.wheel(0,delta);
  await settle(page,180);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    return owner?.scrollTop??-1;
  },ownerName);
  check(after!==state.top,label+' wheel reaches '+ownerName+' '+JSON.stringify({before:state.top,after,max:state.max,delta}));
}
async function touchBridge(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();
  await loc.waitFor({state:'visible',timeout:30000});
  await loc.scrollIntoViewIfNeeded().catch(()=>{});
  const before=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    if(!owner)return -1;owner.scrollTop=Math.min(500,Math.max(0,owner.scrollHeight-owner.clientHeight-20));return owner.scrollTop;
  },ownerName);
  await loc.evaluate(el=>{
    const fire=(type,x,y,active=true)=>{const ev=new Event(type,{bubbles:true,cancelable:true}),point={clientX:x,clientY:y};Object.defineProperty(ev,'touches',{value:active?[point]:[]});Object.defineProperty(ev,'changedTouches',{value:[point]});el.dispatchEvent(ev)};
    fire('touchstart',32,320);fire('touchmove',34,245);fire('touchmove',36,165);fire('touchend',36,165,false);
  });
  await settle(page,120);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(after!==before,label+' vertical touch reaches '+ownerName+' '+JSON.stringify({before,after}));
}
async function horizontalTouchSafe(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();await loc.waitFor({state:'visible',timeout:30000});
  const before=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);if(!owner)return -1;owner.scrollTop=Math.min(500,Math.max(0,owner.scrollHeight-owner.clientHeight-20));return owner.scrollTop},ownerName);
  await loc.evaluate(el=>{
    const fire=(type,x,y,active=true)=>{const ev=new Event(type,{bubbles:true,cancelable:true}),point={clientX:x,clientY:y};Object.defineProperty(ev,'touches',{value:active?[point]:[]});Object.defineProperty(ev,'changedTouches',{value:[point]});el.dispatchEvent(ev)};
    fire('touchstart',30,200);fire('touchmove',130,204);fire('touchend',130,204,false);
  });
  await settle(page,80);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(after===before,label+' horizontal touch does not hijack '+ownerName+' '+JSON.stringify({before,after}));
}
async function seed(page){
  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const q=V.questions.find(x=>V.QuestionQuality119?.isExamStyle?.(x)!==false);
    if(q){
      V.Store.state.conceptId=q.conceptId;V.Store.state.subject=q.subject;V.Store.state.scopeId=q.scopeId;
      V.Store.state.chat=Array.from({length:36},(_,i)=>({id:'v66-chat-'+i,role:'assistant',conceptId:q.conceptId,text:'V66 실제 스크롤 상호작용 검증 '+i+' '+('충분히 긴 AI 답변 본문입니다. '.repeat(8)),at:Date.now()+i}));
      V.Store.state.wrongs=[{id:'v66-w',questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,confidence:'sure',due:Date.now()-1,resolved:false,wrongCount:2,recoveryCorrect:0,lastWrongAt:Date.now()}];
      V.Store.state.answerEvents=[{eventId:'v66-e',questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,correct:false,confidence:'sure',at:Date.now()}];
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
  await page.locator('[data-study-tab="source"]:visible').first().click();
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
    await wheel(page,'.top','home','global top bar home '+vp.width);
    if(vp.isMobile)await touchBridge(page,'.top','home','global top bar home touch '+vp.width);
    await wheel(page,'.home-main','home','home main '+vp.width);
    const homeSide=page.locator('.home-side:visible');
    if(await homeSide.count())await wheel(page,'.home-side','home','home side '+vp.width);

    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudyTab(page,tab);
      const owner=vp.isMobile?'study-mobile':'study-desktop';
      await wheel(page,'.concept-head',owner,'study '+tab+' header '+vp.width);
      if(tab==='core'){
        await wheel(page,'.study-toolbar',owner,'study toolbar '+vp.width);
        const conceptNav=page.locator('.concept-nav:visible');if(await conceptNav.count())await wheel(page,'.concept-nav',owner,'study actionbar '+vp.width);
      }
      if(vp.isMobile){
        await touchBridge(page,'.concept-head',owner,'study '+tab+' header touch '+vp.width);
        if(tab==='core')await horizontalTouchSafe(page,'.book-jumpbar',owner,'study mobile tabbar '+vp.width);
      }
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
    await wheel(page,'.exam-body','exam-active','exam content '+vp.width);
    const examHead=page.locator('.exam-head-clean:visible');if(await examHead.count())await wheel(page,'.exam-head-clean','exam-active','exam header '+vp.width);
    const nav=page.locator('.exam-navigator:visible');if(await nav.count())await wheel(page,'.exam-navigator','exam-active','exam navigator '+vp.width);
    const side=page.locator('.exam-side:visible');if(await side.count())await wheel(page,'.exam-side','exam-active','exam side '+vp.width);
    const examFooter=page.locator('.exam-footer:visible');if(await examFooter.count())await wheel(page,'.exam-footer','exam-active','exam footer '+vp.width);
    if(vp.isMobile&&await examFooter.count())await touchBridge(page,'.exam-footer','exam-active','exam footer touch '+vp.width);

    await openPdf(page);
    await wheel(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header '+vp.width,'#pdfEvidence');
    const zoom=page.locator('#pdfEvidence .pdf-zoombar:visible');if(await zoom.count())await wheel(page,'#pdfEvidence .pdf-zoombar','pdf','pdf zoombar '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-findbar','pdf','pdf findbar '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-evidence-host','pdf','pdf canvas host '+vp.width,'#pdfEvidence');
    const pager=page.locator('#pdfEvidence .pdf-pager:visible');if(await pager.count())await wheel(page,'#pdfEvidence .pdf-pager','pdf','pdf pager '+vp.width,'#pdfEvidence');
    if(vp.isMobile){await touchBridge(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header touch '+vp.width,'#pdfEvidence');await touchBridge(page,'#pdfEvidence .pdf-findbar','pdf','pdf findbar touch '+vp.width,'#pdfEvidence')}
    await page.locator('#pdfEvidence [data-pdf-close]').click();

    for(const [route,owner] of [['notes','notes'],['wrong','wrong'],['stats','stats'],['resources','resources'],['suggestions','suggestions'],['settings','settings']]){
      await go(page,route);
      const target='[data-scroll-owner="'+owner+'"]',targetLoc=page.locator(target+':visible');
      if(await targetLoc.count())await wheel(page,target,owner,route+' body '+vp.width);else console.log('PASS route '+route+' has no effective scroller in this state '+vp.width);
    }

    const owners=await visibleOwner(page);
    check(owners.length<=1,'final visible page has <=1 effective owner '+vp.width+' '+JSON.stringify(owners));
    check(errors.length===0,'no runtime errors '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  if(failures.length)throw new Error('V66_INTERACTION_FAILURES '+JSON.stringify(failures));
  console.log('V66_REAL_INTERACTION_SCROLL_AUDIT_SUCCESS');
}finally{await browser.close()}
