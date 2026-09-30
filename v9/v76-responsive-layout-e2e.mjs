import { chromium } from 'playwright';

const base=process.env.STUDY_119_V76_URL||'http://127.0.0.1:4173/v9/index.html';
const failures=[];
const check=(v,m,meta={})=>{if(v)console.log('PASS',m);else{failures.push({message:m,...meta});console.error('V76_FAIL',JSON.stringify({message:m,...meta}))}};
const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));

async function renderConcept(page,id,tab){
  await page.evaluate(({id,tab})=>{
    const V=window.AITUTOR_V9,c=V.curriculum.concepts.find(x=>x.id===id);
    if(!c)throw new Error('concept not found '+id);
    V.Store.state.page='study';V.Store.state.subject=c.subject;V.Store.state.scopeId=c.scopeId;V.Store.state.conceptId=c.id;V.Store.state.studyTab=tab;V.Store.save();V.App.render();
  },{id,tab});
  await settle(page);
}
async function findConcept(page,{tab='detail',selector,minNodes=0}){
  return page.evaluate(({tab,selector,minNodes})=>{
    const V=window.AITUTOR_V9,original={page:V.Store.state.page,subject:V.Store.state.subject,scopeId:V.Store.state.scopeId,conceptId:V.Store.state.conceptId,studyTab:V.Store.state.studyTab};
    let found='';
    for(const c of V.curriculum.concepts){
      V.Store.state.page='study';V.Store.state.subject=c.subject;V.Store.state.scopeId=c.scopeId;V.Store.state.conceptId=c.id;V.Store.state.studyTab=tab;V.App.render();
      const el=document.querySelector(selector);
      if(el&&(!minNodes||el.querySelectorAll('.visual-node').length>=minNodes)){found=c.id;break}
    }
    Object.assign(V.Store.state,original);V.App.render();
    return found;
  },{tab,selector,minNodes});
}
async function basicMetrics(page){
  return page.evaluate(()=>{
    const owner=document.querySelector('[data-scroll-owner="study"]');
    const body=document.querySelector('.study-body-unified');
    const lesson=body?.querySelector(':scope > :not(.concept-nav-single)');
    const tabs=document.querySelector('.concept-head .tabbar');
    const pane=document.querySelector('.study-mainpane');
    const rect=e=>e?e.getBoundingClientRect():null;
    const cs=e=>e?getComputedStyle(e):null;
    return{
      owners:document.querySelectorAll('[data-scroll-owner="study"]').length,
      docWidth:document.documentElement.scrollWidth,
      viewport:innerWidth,
      bodyOverflowY:cs(body)?.overflowY||'',
      ownerOverflowY:cs(owner)?.overflowY||'',
      lesson:rect(lesson),tabs:rect(tabs),pane:rect(pane)
    };
  });
}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [
    {width:390,height:844,label:'mobile'},
    {width:768,height:1024,label:'tablet'},
    {width:1024,height:768,label:'small-pc'},
    {width:1440,height:900,label:'desktop'},
    {width:1920,height:1080,label:'large-desktop'}
  ]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<=390,hasTouch:vp.width<=768,serviceWorkers:'block'});
    const page=await ctx.newPage();page.setDefaultTimeout(45000);
    const runtimeErrors=[];
    page.on('pageerror',e=>runtimeErrors.push('pageerror:'+e.message));
    page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))runtimeErrors.push('console:'+m.text())});
    await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum?.concepts?.length,{timeout:60000});

    const first=await page.evaluate(()=>window.AITUTOR_V9.curriculum.concepts[0].id);
    await renderConcept(page,first,'core');
    const m=await basicMetrics(page);
    check(m.owners===1,vp.label+' has exactly one study scroll owner',{owners:m.owners});
    check(m.docWidth<=m.viewport+1,vp.label+' has no document horizontal overflow',{docWidth:m.docWidth,viewport:m.viewport});
    check(['visible','initial'].includes(m.bodyOverflowY),vp.label+' study body does not own a nested vertical scroller',{overflow:m.bodyOverflowY});
    check(['auto','scroll'].includes(m.ownerOverflowY),vp.label+' route-level study owner handles vertical scrolling',{overflow:m.ownerOverflowY});
    if(m.lesson&&m.pane){
      check(m.lesson.width>=m.pane.width*.76,vp.label+' study content uses the available pane instead of a narrow legacy cap',{lesson:m.lesson.width,pane:m.pane.width});
      check(m.lesson.left>=m.pane.left-1&&m.lesson.right<=m.pane.right+1,vp.label+' study content stays inside the main pane',{lesson:m.lesson,pane:m.pane});
    }
    if(m.lesson&&m.tabs){
      check(Math.abs(m.lesson.left-m.tabs.left)<=4&&Math.abs(m.lesson.right-m.tabs.right)<=4,vp.label+' tabs and lesson share the same horizontal container',{lesson:m.lesson,tabs:m.tabs});
    }
    if(vp.width>=1600&&m.lesson)check(m.lesson.width>=1580&&m.lesson.width<=1682,'large desktop materially expands study content up to the 1680px contract',{width:m.lesson.width});

    const orgId=await findConcept(page,{tab:'detail',selector:'.visual-flow.vertical-org'});
    check(!!orgId,vp.label+' finds an organization diagram concept');
    if(orgId){
      await renderConcept(page,orgId,'detail');
      const org=await page.evaluate(()=>{
        const flow=document.querySelector('.visual-flow.vertical-org');
        const nodes=[...flow.querySelectorAll('.visual-node')].map(x=>x.getBoundingClientRect().height);
        const arrows=[...flow.querySelectorAll(':scope > i')].map(x=>x.getBoundingClientRect().height);
        return{nodes,arrows,width:flow.getBoundingClientRect().width};
      });
      const maxNode=Math.max(...org.nodes);
      check(maxNode<=(vp.width<=720?88:72),vp.label+' organization nodes are content-sized rather than oversized',{maxNode,nodes:org.nodes});
      check(org.arrows.every(h=>h<=24),vp.label+' organization arrows do not create large vertical dead space',{arrows:org.arrows});
    }

    const flowId=await findConcept(page,{tab:'detail',selector:'.concept-visual .visual-flow:not(.vertical-org)',minNodes:4});
    check(!!flowId,vp.label+' finds a multi-step flow diagram concept');
    if(flowId){
      await renderConcept(page,flowId,'detail');
      const flow=await page.evaluate(()=>{
        const el=document.querySelector('.concept-visual .visual-flow:not(.vertical-org)'),cs=getComputedStyle(el);
        return{columns:cs.gridTemplateColumns.split(' ').filter(Boolean).length,nodes:el.querySelectorAll('.visual-node').length,overflowX:cs.overflowX};
      });
      if(vp.width<=720)check(flow.columns===1,'mobile flow diagrams use one readable column',flow);
      else if(vp.width<=1024)check(flow.columns===2,'tablet/small-PC flow diagrams use two columns',flow);
      else check(flow.columns>=3,'desktop flow diagrams expand to three or more columns',flow);
      check(flow.overflowX!=='scroll','flow diagram does not require its own horizontal scroll',flow);
    }

    const criteriaId=await findConcept(page,{tab:'detail',selector:'.detail-criteria ul'});
    check(!!criteriaId,vp.label+' finds numeric criteria content');
    if(criteriaId){
      await renderConcept(page,criteriaId,'detail');
      const criteria=await page.evaluate(()=>{
        const el=document.querySelector('.detail-criteria ul'),cs=getComputedStyle(el);
        return{columns:cs.gridTemplateColumns.split(' ').filter(Boolean).length,width:el.getBoundingClientRect().width};
      });
      const expected=vp.width>=1600?3:vp.width>1024?2:1;
      check(criteria.columns===expected,vp.label+' numeric criteria use the intended responsive column count',{...criteria,expected});
    }

    await renderConcept(page,first,'ai');
    const ai=await page.evaluate(()=>{
      const el=document.querySelector('.study-ai'),chat=document.querySelector('.study-ai-chat'),compose=document.querySelector('.study-ai .tutor-compose'),pane=document.querySelector('.study-mainpane');
      return{
        width:el.getBoundingClientRect().width,paneWidth:pane.getBoundingClientRect().width,
        chatOverflowY:getComputedStyle(chat).overflowY,
        composePosition:getComputedStyle(compose).position,
        composeRect:compose.getBoundingClientRect()
      };
    });
    check(ai.width>=ai.paneWidth*.76,vp.label+' AI uses the same broad content container',{width:ai.width,paneWidth:ai.paneWidth});
    if(vp.width>=1600)check(ai.width>=1580&&ai.width<=1682,'large desktop AI expands with the 1680px study container',{width:ai.width});
    check(['visible','initial'].includes(ai.chatOverflowY),vp.label+' AI history is not a nested vertical scroller',{overflow:ai.chatOverflowY});
    check(ai.composePosition==='static',vp.label+' AI composer stays in document flow',{position:ai.composePosition});
    check(ai.composeRect.left>=-1&&ai.composeRect.right<=vp.width+1,vp.label+' AI composer stays inside the viewport',{rect:ai.composeRect});

    check(runtimeErrors.length===0,vp.label+' has zero browser runtime errors',{errors:runtimeErrors});
    await ctx.close();
  }
  if(failures.length)throw new Error('V76_RESPONSIVE_LAYOUT_FAILURES '+JSON.stringify(failures));
  console.log('V76_RESPONSIVE_LAYOUT_E2E_SUCCESS');
}finally{await browser.close()}
