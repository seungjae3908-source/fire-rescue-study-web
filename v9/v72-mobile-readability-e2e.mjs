import { chromium } from 'playwright';

const base=process.env.STUDY_119_V72_URL||'http://127.0.0.1:4173/v9/index.html';
const assert=(v,m)=>{if(!v)throw new Error(m);console.log('PASS',m)};

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,serviceWorkers:'block'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.PassNote,{timeout:30000});

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='home';V.Store.save();V.App.render()});
  const home=await page.evaluate(()=>{
    const root=document.querySelector('.dashboard-home'),main=root?.querySelector('.home-main'),last=main?.lastElementChild;
    return root&&main&&last?{
      rootOverflow:getComputedStyle(root).overflowY,
      mainOverflow:getComputedStyle(main).overflowY,
      tail:Math.max(0,root.scrollHeight-(last.offsetTop+last.offsetHeight)),
      display:getComputedStyle(root).display
    }:null
  });
  assert(home&&home.rootOverflow==='auto','mobile home has one route-level vertical scroller');
  assert(home.mainOverflow==='visible','mobile home child column does not own a second scroll');
  assert(home.display==='block','mobile home avoids grid-track blank space');
  assert(home.tail<120,'mobile home has no large blank tail after final study card');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.studyTab='core';V.Store.save();V.App.render();const owner=document.querySelector('.page-study .study');if(owner)owner.scrollTop=owner.scrollHeight});
  await page.waitForSelector('.mobile-study-nav');
  const nav=await page.evaluate(()=>{
    const local=document.querySelector('.mobile-study-nav'),global=document.querySelector('.mobile-nav');
    const a=local.getBoundingClientRect(),b=global.getBoundingClientRect();
    return{position:getComputedStyle(local).position,localBottom:a.bottom,globalTop:b.top}
  });
  assert(nav.position==='static','mobile previous/toc/next stays in document flow');
  assert(nav.localBottom<=nav.globalTop+2,'mobile concept navigation does not cover the global bottom navigation');

  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;
    await V.PassNote.saveManual({id:'v72-manual-e2e',title:'줄바꿈 테스트',body:'첫 줄\n둘째 줄\n\n셋째 줄',subject:'fire'});
    const core=V.PassNote.conceptCoreNote('F01-C01');if(core)await V.PassNote.persist({...core,id:'v72-core-e2e'});
    V.Store.state.page='notes';V.Store.save();V.App.runtime.noteSubject='fire';V.App.render();
  });
  const notes=await page.evaluate(()=>{
    const manual=window.AITUTOR_V9.Store.state.notes.find(x=>x.id==='v72-manual-e2e');
    const preview=[...document.querySelectorAll('.note-row')].find(x=>x.textContent.includes('줄바꿈 테스트'));
    const core=document.querySelector('.note-core-line');
    return{
      preserved:/첫 줄\n둘째 줄\n\n셋째 줄/.test(manual?.body||''),
      lines:preview?.querySelectorAll('.note-preview-line').length||0,
      coreUnderline:core?getComputedStyle(core).textDecorationLine:''
    }
  });
  assert(notes.preserved,'manual pass-note keeps paragraph breaks in stored body');
  assert(notes.lines>=3,'manual pass-note renders separate readable lines');
  assert(notes.coreUnderline.includes('underline'),'saved core note visibly underlines key content');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.studyTab='ai';V.Store.save();V.App.render()});
  await page.locator('[data-tutor-input]').fill('밥먹었니');
  await page.locator('[data-tutor-send]').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.tutor-message.assistant')].some(x=>x.textContent.includes('학습 질문만 답합니다.')),{timeout:10000});
  const aiText=(await page.locator('.tutor-message.assistant').last().innerText()).trim();
  assert(aiText.includes('현재 개념과 직접 관련된 학습 질문만 답합니다.'),'off-topic tutor prompt is rejected clearly');
  assert(!/밥을 먹|식사/.test(aiText),'off-topic tutor does not fabricate social conversation');

  const modal=await page.evaluate(()=>{
    document.body.insertAdjacentHTML('beforeend','<div class="modal-wrap" id="v72Modal"><div class="modal pdf-evidence-modal"><div class="pdf-evidence-host"><div class="pdf-render-meta">공식 근거 메타</div><div class="pdf-canvas-wrap"></div></div></div></div>');
    const global=document.querySelector('.mobile-nav'),meta=document.querySelector('#v72Modal .pdf-render-meta');
    return{navVisibility:getComputedStyle(global).visibility,navPointer:getComputedStyle(global).pointerEvents,metaPosition:getComputedStyle(meta).position}
  });
  assert(modal.navVisibility==='hidden'&&modal.navPointer==='none','PDF modal hides global mobile navigation');
  assert(modal.metaPosition==='static','PDF evidence meta does not cover the canvas');

  assert(errors.length===0,'V72 mobile field-report QA has no browser runtime errors '+errors.join(' | '));
  console.log('V72_MOBILE_READABILITY_E2E_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
