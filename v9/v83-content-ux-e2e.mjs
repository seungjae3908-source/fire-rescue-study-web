import { chromium } from 'playwright';

const base=process.env.STUDY_119_V83_URL||'http://127.0.0.1:4173/v9/index.html';
const assert=(v,m,x={})=>{if(!v)throw new Error(m+' '+JSON.stringify(x));console.log('PASS',m)};

async function bootMember(page,id='qa-v83-member'){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.StudyEmphasis119,{timeout:60000});
  await page.evaluate(async id=>{
    const V=window.AITUTOR_V9,user={id,email:id+'@local.invalid'};
    try{Object.defineProperty(V.Auth,'user',{value:user,configurable:true,writable:true})}catch{V.Auth.user=user}
    try{V.Store?.switchOwner?.(id)}catch{}
    V.App.render();
  },id);
  await page.waitForSelector('.page',{state:'visible',timeout:30000});
}
async function ensureQuestions(page){
  await page.evaluate(async()=>{await window.AITUTOR_V9.Lazy119?.ensureQuestions?.();window.AITUTOR_V9.App.render()});
}

const browser=await chromium.launch({headless:true});
let mobileCtx;
try{
  mobileCtx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,serviceWorkers:'block'});
  const page=await mobileCtx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await bootMember(page);

  const sweep=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,S=V.Store,issues=[],counts={fire:0,ems:0,numeric:0};
    const clean=s=>String(s||'').replace(/,/g,'').replace(/\s+/g,'').toLowerCase();
    const numberRe=new RegExp(V.StudyEmphasis119.numericPattern,'gi');
    for(const c of V.curriculum.concepts){
      counts[c.subject]=(counts[c.subject]||0)+1;
      const pack=V.contentPacks.get(c.id);
      S.state.page='study';S.state.subject=c.subject;S.state.scopeId=c.scopeId;S.state.conceptId=c.id;S.state.outline=false;

      S.state.studyTab='core';V.App.render();
      const core=document.querySelector('.core-view'),coreText=core?.innerText||'';
      const expected=(V.StudyEmphasis119.mustRows(pack)||[]).filter(x=>V.StudyEmphasis119.isNumericCriterion(x)).map(x=>V.StudyEmphasis119.stripSourceReferenceNumbers(x)).filter(Boolean);
      if(expected.length)counts.numeric++;
      for(const row of expected){
        const tokens=(String(row).match(numberRe)||[]).map(clean).filter(Boolean);
        for(const token of tokens)if(token&&!clean(coreText).includes(token))issues.push({id:c.id,tab:'core',type:'MUST_NUMERIC_NOT_VISIBLE',token,row});
      }

      S.state.studyTab='detail';V.App.render();
      for(const card of document.querySelectorAll('.detail-compare .concept-class-card')){
        const label=card.querySelector('b')?.textContent?.trim()||'',body=card.querySelector('p')?.textContent?.trim()||'';
        if(!label||!body)issues.push({id:c.id,tab:'detail',type:'EMPTY_COMPARE_CARD',label,body});
      }
      for(const sec of document.querySelectorAll('.detail-view .detail-section')){
        const title=sec.querySelector('h3')?.textContent?.trim()||'',body=[...sec.querySelectorAll('.detail-copy p,.detail-copy li')].map(x=>x.textContent?.trim()).filter(Boolean);
        if(title&&!body.length)issues.push({id:c.id,tab:'detail',type:'EMPTY_DETAIL_SECTION',title});
      }
    }
    return{issues,counts,total:V.curriculum.concepts.length};
  });
  assert(sweep.total===183&&sweep.counts.fire===71&&sweep.counts.ems===112,'390px learner-visible sweep covers all 183 concepts',sweep.counts);
  assert(sweep.counts.numeric>0,'390px sweep includes numeric-memory concepts',{numeric:sweep.counts.numeric});
  assert(sweep.issues.length===0,'all 183 concepts keep numeric criteria visible and no empty detail cards',{issues:sweep.issues.slice(0,30),count:sweep.issues.length});

  const powder=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,S=V.Store,c=V.curriculum.byId['F04-C08'];
    S.state.page='study';S.state.subject='fire';S.state.scopeId=c.scopeId;S.state.conceptId=c.id;S.state.studyTab='core';S.state.outline=false;V.App.render();
    const core=document.querySelector('.core-view')?.innerText||'';
    S.state.studyTab='detail';V.App.render();
    const cards=[...document.querySelectorAll('.detail-compare .concept-class-card')].map(x=>({label:x.querySelector('b')?.textContent?.trim()||'',body:x.querySelector('p')?.textContent?.trim()||''}));
    return{core,cards};
  });
  for(const kind of ['1종','2종','3종','4종'])assert(powder.core.includes(kind),'powder core exposes '+kind,{core:powder.core});
  const p3=powder.cards.find(x=>x.label==='3종');
  assert(p3&&/제1인산암모늄/.test(p3.body)&&/ABC/.test(p3.body),'powder 3종 card is complete',{p3,cards:powder.cards});

  const haz=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,S=V.Store,c=V.curriculum.byId['F05-C03'];
    S.state.page='study';S.state.subject='fire';S.state.scopeId=c.scopeId;S.state.conceptId=c.id;S.state.studyTab='core';V.App.render();
    return document.querySelector('.core-view')?.innerText||'';
  });
  const hz=haz.replace(/,/g,'').replace(/\s+/g,'');
  assert(/황화린/.test(haz)&&hz.includes('100kg'),'hazmat core exposes 황화린 group 100kg',{haz});
  assert(/철분/.test(haz)&&hz.includes('500kg'),'hazmat core exposes 철분 group 500kg',{haz});
  assert(/인화성고체/.test(haz)&&hz.includes('1000kg'),'hazmat core exposes 인화성고체 1000kg',{haz});

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,S=V.Store,c=V.curriculum.byId['F04-C08'];
    S.state.chat=(S.state.chat||[]).filter(x=>x.conceptId!==c.id);
    S.state.page='study';S.state.subject='fire';S.state.scopeId=c.scopeId;S.state.conceptId=c.id;S.state.studyTab='ai';V.App.render();
  });
  await page.locator('[data-tutor-input]').fill('종류는 뭐야?');
  await page.locator('[data-tutor-send]').click();
  await page.waitForFunction(()=>{
    const rows=[...document.querySelectorAll('.tutor-message.assistant')],t=rows.at(-1)?.innerText||'';
    return ['1종','2종','3종','4종'].every(x=>t.includes(x));
  },{timeout:10000});
  const ai=await page.locator('.tutor-message.assistant').last().innerText();
  assert(['1종','2종','3종','4종'].every(x=>ai.includes(x))&&ai.includes('제1인산암모늄'),'AI answers a short type question directly from the current pack',{ai});
  assert(!/기준문장은|단독 암기하지 말고/.test(ai),'AI does not replace the requested type list with generic study advice',{ai});

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,S=V.Store,c=V.curriculum.byId['F04-C08'];
    S.state.page='study';S.state.subject='fire';S.state.scopeId=c.scopeId;S.state.conceptId=c.id;S.state.studyTab='source';V.App.render();
  });
  const sourceButton=page.locator('[data-source-concept="F04-C08"]').first();
  assert(await sourceButton.count()===1,'powder source action is visible');
  await sourceButton.click();
  await page.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.renderState==='ready',{timeout:90000});
  const pdf=await page.evaluate(()=>{
    const root=document.querySelector('#pdfEvidence'),marks=[...root.querySelectorAll('.pdf-evidence-line')];
    return{
      verified:root.dataset.anchorVerified,
      label:root.querySelector('[data-pdf-page-label]')?.textContent||'',
      count:marks.length,
      titles:marks.map(x=>x.getAttribute('title')||'')
    };
  });
  const evidenceText=pdf.titles.join(' ');
  assert(pdf.verified==='true'&&pdf.count>0,'concept PDF source finds verified evidence',{pdf});
  assert(/탄산수소나트륨|탄산수소칼륨|제1인산암모늄|요소/.test(evidenceText),'concept PDF underline is tied to a specific powder fact, not only the generic title',{pdf});
  await page.keyboard.press('Escape').catch(()=>{});

  const viewports=[
    {w:390,h:844,mobile:true},
    {w:412,h:915,mobile:true},
    {w:768,h:1024,mobile:false},
    {w:1024,h:768,mobile:false},
    {w:1440,h:900,mobile:false}
  ];
  for(const v of viewports){
    const ctx=await browser.newContext({viewport:{width:v.w,height:v.h},isMobile:v.mobile,hasTouch:v.w<=1024,serviceWorkers:'block'});
    const p=await ctx.newPage();
    await bootMember(p,'qa-v83-'+v.w);
    await ensureQuestions(p);
    await p.evaluate(()=>{
      const V=window.AITUTOR_V9,S=V.Store;
      S.state.page='bank';S.state.outline=false;V.App.runtime.bankConcept='';V.App.runtime.bankFilter='';V.App.runtime.bankIndex=0;V.App.runtime.retryQuestionId='';V.App.render();
    });
    await p.waitForSelector('.page-bank .question-card',{state:'visible',timeout:30000});
    const top=await p.evaluate(()=>{
      const owner=document.querySelector('.page-bank .bank-page'),bar=document.querySelector('.page-bank .bank-workspace .actionbar'),body=document.querySelector('.page-bank .bank-question-body'),choices=[...document.querySelectorAll('.page-bank .choice')];
      const ar=bar.getBoundingClientRect(),br=body.getBoundingClientRect();
      const overlap=choices.some(x=>{const r=x.getBoundingClientRect();return Math.max(r.top,ar.top)<Math.min(r.bottom,ar.bottom)&&Math.max(r.left,ar.left)<Math.min(r.right,ar.right)});
      return{position:getComputedStyle(bar).position,bodyBottom:br.bottom,barTop:ar.top,overlap,scrollWidth:owner.scrollWidth,clientWidth:owner.clientWidth};
    });
    assert(top.position!=='sticky'&&top.position!=='fixed',v.w+'px bank pager is not floating over content',top);
    assert(top.bodyBottom<=top.barTop+1&&!top.overlap,v.w+'px bank pager follows all answer choices in normal flow',top);
    assert(top.scrollWidth<=top.clientWidth+1,v.w+'px bank has no horizontal overflow',top);
    await p.locator('.page-bank .bank-page').evaluate(el=>{el.scrollTop=el.scrollHeight});
    await p.waitForTimeout(80);
    const bottom=await p.evaluate(()=>{
      const bar=document.querySelector('.page-bank .bank-workspace .actionbar')?.getBoundingClientRect(),nav=document.querySelector('.mobile-nav')?.getBoundingClientRect(),shown=nav&&getComputedStyle(document.querySelector('.mobile-nav')).display!=='none';
      return{barBottom:bar?.bottom||0,navTop:nav?.top||0,navShown:!!shown};
    });
    if(bottom.navShown)assert(bottom.barBottom<=bottom.navTop+1,v.w+'px bank pager finishes above mobile app navigation',bottom);
    await ctx.close();
  }

  assert(errors.length===0,'V83 primary mobile runtime errors = 0',{errors});
  console.log('V83_CONTENT_UX_E2E_SUCCESS');
}finally{
  if(mobileCtx)await mobileCtx.close().catch(()=>{});
  await browser.close();
}
