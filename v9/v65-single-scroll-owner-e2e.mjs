import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const emptyMonitor={ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]};
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function settle(page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}
async function owners(page,label){
  const rows=await page.locator('.page').evaluate(root=>{
    const visible=el=>{
      if(el.closest('.outline,.modal-wrap,.backdrop'))return false;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0;
    };
    return [root,...root.querySelectorAll('*')].filter(visible).filter(el=>{
      const y=getComputedStyle(el).overflowY;
      return y==='auto'||y==='scroll';
    }).map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,120),owner:el.getAttribute('data-scroll-owner')||'',sh:el.scrollHeight,ch:el.clientHeight}));
  });
  assert(rows.length<=1,label+' has at most one vertical scroll owner '+JSON.stringify(rows));
  return rows;
}
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

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [{width:390,height:844,isMobile:true},{width:768,height:1024,isMobile:false},{width:1440,height:700,isMobile:false}]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile,serviceWorkers:'block'});
    const page=await ctx.newPage();page.setDefaultTimeout(90000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(emptyMonitor)}));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App);
    await page.evaluate(async()=>{
      const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
      const q=V.questions.find(x=>V.QuestionQuality119?.isExamStyle?.(x)!==false);
      if(q){
        V.Store.state.wrongs=[{id:'v65-w',questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,confidence:'sure',due:Date.now()-1,resolved:false,wrongCount:2,recoveryCorrect:0,lastWrongAt:Date.now()}];
        V.Store.state.answerEvents=[{eventId:'v65-e',questionId:q.id,masterQuestionId:q.masterQuestionId||q.id,familyId:q.familyId||q.id,conceptId:q.conceptId,scopeId:q.scopeId,subject:q.subject,correct:false,confidence:'sure',at:Date.now()}];
        V.Store.state.chat=Array.from({length:30},(_,i)=>({id:'v65-chat-'+i,role:'assistant',conceptId:q.conceptId,text:'스크롤 검증용 긴 답변 '+i+' '.repeat(4)+'핵심 개념 설명을 반복해서 충분한 높이를 만듭니다. '.repeat(3),at:Date.now()+i}));
        V.Store.state.conceptId=q.conceptId;V.Store.state.subject=q.subject;V.Store.state.scopeId=q.scopeId;
      }
      V.Store.save();V.App.render();
    });
    await settle(page);

    const routes=[['home','home'],['notes','notes'],['bank','bank'],['exam','exam-landing'],['wrong','wrong'],['stats','stats'],['resources','resources'],['suggestions','suggestions'],['settings','settings']];
    for(const [route,owner] of routes){
      await go(page,route);
      const rows=await owners(page,'route '+route+' '+vp.width);
      if(rows.length)assert(rows[0].owner===owner,'route '+route+' exposes expected owner '+owner+' '+vp.width);
    }

    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudyTab(page,tab);
      const rows=await owners(page,'study '+tab+' '+vp.width);
      assert(rows.length===1,'study '+tab+' keeps exactly one vertical owner '+vp.width);
      assert(rows[0].owner===(vp.isMobile?'study-mobile':'study-desktop'),'study '+tab+' uses visible study-body owner '+vp.width);
      if(tab==='ai'){
        const ai=await page.locator('.study-ai-chat:visible').first().evaluate(el=>({overflowY:getComputedStyle(el).overflowY,scrollTop:el.scrollTop,bodyOverflow:getComputedStyle(el.closest('.study-body')).overflowY}));
        assert(!['auto','scroll'].includes(ai.overflowY)&&['auto','scroll'].includes(ai.bodyOverflow),'AI delegates vertical scrolling to study-body '+vp.width);
      }
    }

    await go(page,'exam');
    await page.locator('[data-training-start="fire50"]').click();
    await page.waitForSelector('.exam-run-workspace');
    await settle(page);
    const active=await owners(page,'active exam '+vp.width);
    assert(active.length===1&&active[0].owner==='exam-active','active exam uses exam-body as sole vertical owner '+vp.width);
    if(vp.width>=1025){
      const nav=await page.locator('.exam-navigator').evaluate(el=>({overflowY:getComputedStyle(el).overflowY,maxHeight:getComputedStyle(el).maxHeight}));
      assert(!['auto','scroll'].includes(nav.overflowY),'desktop exam navigator is not a nested vertical scroller '+vp.width);
    }

    assert(errors.length===0,'V65 page-by-page scroll QA has no runtime errors '+vp.width+' '+errors.join(' | '));
    await ctx.close();
  }
  console.log('V65_SINGLE_SCROLL_OWNER_E2E_SUCCESS');
}finally{await browser.close()}
