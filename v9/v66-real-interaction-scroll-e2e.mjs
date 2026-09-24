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
async function effectiveVerticalOwners(page,scope='.page'){
  return page.locator(scope).evaluate((root,scope)=>{
    const visible=el=>{
      if(scope==='.page'&&el.closest('.outline,.backdrop'))return false;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;
    };
    return [root,...root.querySelectorAll('*')].filter(visible).filter(el=>{
      if(el.matches('textarea,input,select,[contenteditable="true"]'))return false;
      const y=getComputedStyle(el).overflowY;
      return ['auto','scroll'].includes(y)&&el.scrollHeight>el.clientHeight+2;
    }).map(el=>({owner:el.getAttribute('data-scroll-owner')||'',tag:el.tagName,cls:String(el.className||'').slice(0,120),top:el.scrollTop,sh:el.scrollHeight,ch:el.clientHeight}));
  },scope);
}
async function assertSingleEffectiveOwner(page,expected,label,scope='.page'){
  const rows=await effectiveVerticalOwners(page,scope);
  check(rows.length<=1,label+' has <=1 effective vertical scroller '+JSON.stringify(rows));
  if(rows.length===1&&expected)check(rows[0].owner===expected,label+' effective scroller is '+expected+' '+JSON.stringify(rows[0]));
  return rows;
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
  const box=await loc.boundingBox();assert(!!box,label+' touch target visible');
  const before=await page.locator(scope).evaluate((root,ownerName)=>{
    const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);
    if(!owner)return -1;owner.scrollTop=Math.min(500,Math.max(0,owner.scrollHeight-owner.clientHeight-20));return owner.scrollTop;
  },ownerName);
  const vp=page.viewportSize(),x=Math.max(6,Math.min((vp?.width||390)-6,box.x+Math.min(box.width/2,28))),startY=Math.max(30,Math.min((vp?.height||844)-20,box.y+Math.min(box.height/2,30)));
  const cdp=await page.context().newCDPSession(page);
  try{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y:startY,radiusX:1,radiusY:1,force:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+1,y:Math.max(8,startY-45),radiusX:1,radiusY:1,force:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+2,y:Math.max(8,startY-90),radiusX:1,radiusY:1,force:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await cdp.detach().catch(()=>{})}
  await settle(page,160);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(after!==before,label+' trusted vertical touch reaches '+ownerName+' '+JSON.stringify({before,after}));
}
async function horizontalTouchSafe(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();await loc.waitFor({state:'visible',timeout:30000});
  const box=await loc.boundingBox();assert(!!box,label+' horizontal touch target visible');
  const before=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);if(!owner)return -1;owner.scrollTop=Math.min(500,Math.max(0,owner.scrollHeight-owner.clientHeight-20));return owner.scrollTop},ownerName);
  const vp=page.viewportSize(),x=Math.max(10,Math.min((vp?.width||390)-130,box.x+12)),y=Math.max(12,Math.min((vp?.height||844)-12,box.y+Math.min(box.height/2,24)));
  const cdp=await page.context().newCDPSession(page);
  try{
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,radiusX:1,radiusY:1,force:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+90,y:y+2,radiusX:1,radiusY:1,force:1}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }finally{await cdp.detach().catch(()=>{})}
  await settle(page,100);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(after===before,label+' trusted horizontal touch does not hijack '+ownerName+' '+JSON.stringify({before,after}));
}
async function diagonalTrackpad(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();await loc.waitFor({state:'visible',timeout:30000});
  await loc.scrollIntoViewIfNeeded().catch(()=>{});await settle(page,60);
  const box=await loc.boundingBox();assert(!!box,label+' diagonal trackpad target visible');
  const before=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);if(!owner)return -1;owner.scrollTop=Math.min(240,Math.max(0,owner.scrollHeight-owner.clientHeight-40));return owner.scrollTop},ownerName);
  const vp=page.viewportSize(),x=Math.max(5,Math.min((vp?.width||1440)-5,box.x+Math.min(box.width/2,28))),y=Math.max(5,Math.min((vp?.height||900)-5,box.y+Math.min(box.height/2,28)));
  await page.mouse.move(x,y);await page.mouse.wheel(42,280);await settle(page,150);
  const after=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(after!==before,label+' diagonal trackpad keeps vertical intent on '+ownerName+' '+JSON.stringify({before,after}));
}
async function horizontalWheelSafe(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();await loc.waitFor({state:'visible',timeout:30000});
  await loc.scrollIntoViewIfNeeded().catch(()=>{});await settle(page,60);
  const box=await loc.boundingBox();assert(!!box,label+' horizontal trackpad target visible');
  const before=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);if(!owner)return -1;owner.scrollTop=Math.min(500,Math.max(0,owner.scrollHeight-owner.clientHeight-40));return owner.scrollTop},ownerName);
  const vp=page.viewportSize(),x=Math.max(5,Math.min((vp?.width||1440)-5,box.x+Math.min(box.width/2,28))),y=Math.max(5,Math.min((vp?.height||900)-5,box.y+Math.min(box.height/2,28)));
  await page.mouse.move(x,y);await page.mouse.wheel(300,0);await settle(page,100);
  const pureAfter=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(pureAfter===before,label+' pure horizontal trackpad does not move '+ownerName+' vertically '+JSON.stringify({before,after:pureAfter}));
  await page.mouse.wheel(300,8);await settle(page,100);
  const diagonalAfter=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(Math.abs(diagonalAfter-pureAfter)<=10,label+' horizontal-dominant trackpad preserves only native vertical component '+ownerName+' '+JSON.stringify({before:pureAfter,after:diagonalAfter,allowedDrift:10}));
}
async function boundaryWheelSafe(page,target,ownerName,label,scope='.page'){
  await makeScrollable(page,ownerName,scope);
  const loc=page.locator(target).filter({visible:true}).first();await loc.waitFor({state:'visible',timeout:30000});
  const box=await loc.boundingBox();assert(!!box,label+' boundary target visible');
  const vp=page.viewportSize(),x=Math.max(5,Math.min((vp?.width||1440)-5,box.x+Math.min(box.width/2,28))),y=Math.max(5,Math.min((vp?.height||900)-5,box.y+Math.min(box.height/2,28)));
  const setEdge=async edge=>page.locator(scope).evaluate((root,{ownerName,edge})=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);if(!owner)return{top:-1,max:-1};const max=Math.max(0,owner.scrollHeight-owner.clientHeight);owner.scrollTop=edge==='bottom'?max:0;return{top:owner.scrollTop,max}}, {ownerName,edge});
  const docTop=()=>page.evaluate(()=>document.scrollingElement?.scrollTop||0);
  await page.mouse.move(x,y);
  const bottom=await setEdge('bottom'),docBottom=await docTop();await page.mouse.wheel(0,520);await settle(page,120);
  const bottomAfter=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(Math.abs(bottomAfter-bottom.max)<1&&(await docTop())===docBottom,label+' bottom does not chain into document '+JSON.stringify({before:bottom.top,after:bottomAfter,max:bottom.max}));
  const top=await setEdge('top'),docTopBefore=await docTop();await page.mouse.wheel(0,-520);await settle(page,120);
  const topAfter=await page.locator(scope).evaluate((root,ownerName)=>{const owner=[root,...root.querySelectorAll('[data-scroll-owner]')].find(el=>el.getAttribute('data-scroll-owner')===ownerName&&el.offsetParent!==null);return owner?.scrollTop??-1},ownerName);
  check(Math.abs(topAfter)<1&&(await docTop())===docTopBefore,label+' top does not chain into document '+JSON.stringify({before:top.top,after:topAfter}));
}
async function seed(page){
  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const q=V.questions.find(x=>V.QuestionQuality119?.isExamStyle?.(x)!==false);
    if(q){
      V.Store.state.conceptId=q.conceptId;V.Store.state.subject=q.subject;V.Store.state.scopeId=q.scopeId;
      V.Store.state.chat=Array.from({length:36},(_,i)=>({id:'v66-chat-'+i,role:'assistant',conceptId:q.conceptId,text:i===35?'V66 표 스크롤 검증\\n| 매우 긴 구분 열 | 매우 긴 핵심 차이 설명 열 | 매우 긴 시험 포인트 열 | 매우 긴 추가 확인 열 |\\n| --- | --- | --- | --- |\\n| A | 세로 제스처는 본문 owner로 전달 | 가로 제스처는 표에 남음 | 트랙패드 혼합입력 보호 |':'V66 실제 스크롤 상호작용 검증 '+i+' '+('충분히 긴 AI 답변 본문입니다. '.repeat(8)),at:Date.now()+i}));
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
async function openResourcePdf(page){
  await go(page,'resources');
  const open=page.locator('[data-resource-doc]:visible').first();
  await open.waitFor({state:'visible',timeout:30000});await open.click();
  await page.waitForSelector('#resourcePdf .pdf-evidence-host[data-scroll-owner="pdf"]',{state:'visible',timeout:120000});
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
    await assertSingleEffectiveOwner(page,'home','home '+vp.width);
    await wheel(page,'.top','home','global top bar home '+vp.width);
    await diagonalTrackpad(page,'.top','home','global top bar home '+vp.width);
    await boundaryWheelSafe(page,'.top','home','global top bar home '+vp.width);
    if(vp.isMobile)await touchBridge(page,'.top','home','global top bar home touch '+vp.width);
    await wheel(page,'.home-main','home','home main '+vp.width);
    const homeSide=page.locator('.home-side:visible');
    if(await homeSide.count())await wheel(page,'.home-side','home','home side '+vp.width);

    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudyTab(page,tab);
      const owner=vp.isMobile?'study-mobile':'study-desktop';
      await assertSingleEffectiveOwner(page,owner,'study '+tab+' '+vp.width);
      await wheel(page,'.concept-head',owner,'study '+tab+' header '+vp.width);
      if(tab==='core'){
        await wheel(page,'.study-toolbar',owner,'study toolbar '+vp.width);
        await diagonalTrackpad(page,'.concept-head',owner,'study header '+vp.width);
        const tabbar=page.locator('.tabbar:visible');if(await tabbar.count())await horizontalWheelSafe(page,'.tabbar',owner,'study tabbar '+vp.width);
        const conceptNav=page.locator('.concept-nav:visible');if(await conceptNav.count()){await wheel(page,'.concept-nav',owner,'study actionbar '+vp.width);await boundaryWheelSafe(page,'.concept-nav',owner,'study actionbar '+vp.width)}
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
        const aiTable=page.locator('.tutor-ai-table-wrap:visible');
        if(await aiTable.count()){await diagonalTrackpad(page,'.tutor-ai-table-wrap',owner,'study AI table '+vp.width);await horizontalWheelSafe(page,'.tutor-ai-table-wrap',owner,'study AI table '+vp.width)}
      }
    }

    await go(page,'bank');
    await assertSingleEffectiveOwner(page,'bank','bank '+vp.width);
    await wheel(page,'.question-filter-bar','bank','bank filters '+vp.width);
    const bankBody=page.locator('.bank-question-body:visible');
    if(await bankBody.count())await wheel(page,'.bank-question-body','bank','bank body '+vp.width);
    const bankActions=page.locator('.bank-workspace .actionbar:visible');
    if(await bankActions.count())await wheel(page,'.bank-workspace .actionbar','bank','bank footer '+vp.width);

    await go(page,'exam');
    const start=page.locator('[data-training-start="fire50"]');
    await start.waitFor({state:'visible',timeout:30000});await start.click();
    await page.waitForSelector('.exam-run-workspace',{timeout:30000});await settle(page);
    await assertSingleEffectiveOwner(page,'exam-active','active exam '+vp.width);
    await wheel(page,'.exam-body','exam-active','exam content '+vp.width);
    const examHead=page.locator('.exam-head-clean:visible');if(await examHead.count())await wheel(page,'.exam-head-clean','exam-active','exam header '+vp.width);
    const nav=page.locator('.exam-navigator:visible');if(await nav.count())await wheel(page,'.exam-navigator','exam-active','exam navigator '+vp.width);
    const side=page.locator('.exam-side:visible');if(await side.count())await wheel(page,'.exam-side','exam-active','exam side '+vp.width);
    const examFooter=page.locator('.exam-footer:visible');if(await examFooter.count()){await wheel(page,'.exam-footer','exam-active','exam footer '+vp.width);await diagonalTrackpad(page,'.exam-footer','exam-active','exam footer '+vp.width);await boundaryWheelSafe(page,'.exam-footer','exam-active','exam footer '+vp.width)}
    if(vp.isMobile&&await examFooter.count())await touchBridge(page,'.exam-footer','exam-active','exam footer touch '+vp.width);

    await openPdf(page);
    await assertSingleEffectiveOwner(page,'pdf','PDF modal '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header '+vp.width,'#pdfEvidence');
    const zoom=page.locator('#pdfEvidence .pdf-zoombar:visible');if(await zoom.count())await wheel(page,'#pdfEvidence .pdf-zoombar','pdf','pdf zoombar '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-findbar','pdf','pdf findbar '+vp.width,'#pdfEvidence');
    await wheel(page,'#pdfEvidence .pdf-evidence-host','pdf','pdf canvas host '+vp.width,'#pdfEvidence');
    await horizontalWheelSafe(page,'#pdfEvidence .pdf-evidence-host','pdf','pdf canvas host '+vp.width,'#pdfEvidence');
    await diagonalTrackpad(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header '+vp.width,'#pdfEvidence');
    await boundaryWheelSafe(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header '+vp.width,'#pdfEvidence');
    const pager=page.locator('#pdfEvidence .pdf-pager:visible');if(await pager.count())await wheel(page,'#pdfEvidence .pdf-pager','pdf','pdf pager '+vp.width,'#pdfEvidence');
    if(vp.isMobile){await touchBridge(page,'#pdfEvidence .pdf-modal-head','pdf','pdf header touch '+vp.width,'#pdfEvidence');await touchBridge(page,'#pdfEvidence .pdf-findbar','pdf','pdf findbar touch '+vp.width,'#pdfEvidence')}
    await page.locator('#pdfEvidence [data-pdf-close]').click();

    await openResourcePdf(page);
    await assertSingleEffectiveOwner(page,'pdf','resource PDF modal '+vp.width,'#resourcePdf');
    await wheel(page,'#resourcePdf .pdf-modal-head','pdf','resource pdf header '+vp.width,'#resourcePdf');
    const resourceZoom=page.locator('#resourcePdf .pdf-zoombar:visible');if(await resourceZoom.count())await wheel(page,'#resourcePdf .pdf-zoombar','pdf','resource pdf zoombar '+vp.width,'#resourcePdf');
    await wheel(page,'#resourcePdf .pdf-findbar','pdf','resource pdf findbar '+vp.width,'#resourcePdf');
    await wheel(page,'#resourcePdf .pdf-evidence-host','pdf','resource pdf canvas host '+vp.width,'#resourcePdf');
    await horizontalWheelSafe(page,'#resourcePdf .pdf-evidence-host','pdf','resource pdf canvas host '+vp.width,'#resourcePdf');
    await diagonalTrackpad(page,'#resourcePdf .pdf-modal-head','pdf','resource pdf header '+vp.width,'#resourcePdf');
    await boundaryWheelSafe(page,'#resourcePdf .pdf-modal-head','pdf','resource pdf header '+vp.width,'#resourcePdf');
    const resourcePager=page.locator('#resourcePdf .pdf-pager:visible');if(await resourcePager.count())await wheel(page,'#resourcePdf .pdf-pager','pdf','resource pdf pager '+vp.width,'#resourcePdf');
    if(vp.isMobile)await touchBridge(page,'#resourcePdf .pdf-modal-head','pdf','resource pdf header touch '+vp.width,'#resourcePdf');
    await page.locator('#resourcePdf [data-resource-pdf-close]').click();

    for(const [route,owner] of [['notes','notes'],['wrong','wrong'],['stats','stats'],['resources','resources'],['suggestions','suggestions'],['settings','settings']]){
      await go(page,route);
      const target='[data-scroll-owner="'+owner+'"]',targetLoc=page.locator(target+':visible');
      await assertSingleEffectiveOwner(page,owner,route+' '+vp.width);
      if(await targetLoc.count())await wheel(page,target,owner,route+' body '+vp.width);else console.log('PASS route '+route+' has no effective scroller in this state '+vp.width);
    }

    const owners=await effectiveVerticalOwners(page);
    check(owners.length<=1,'final visible page has <=1 effective vertical scroller '+vp.width+' '+JSON.stringify(owners));
    check(errors.length===0,'no runtime errors '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  if(failures.length)throw new Error('V66_INTERACTION_FAILURES '+JSON.stringify(failures));
  console.log('V66_REAL_INTERACTION_SCROLL_AUDIT_SUCCESS');
}finally{await browser.close()}
