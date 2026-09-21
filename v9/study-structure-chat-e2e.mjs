import {chromium} from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const assert=(v,m)=>{if(!v)throw Error(m);console.log('PASS',m)};
const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2,serviceWorkers:'block'});
  const page=await ctx.newPage();
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum);

  const open=async tab=>{
    await page.evaluate(tab=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab=tab;s.outline=false;V.Store.save();V.App.render()},tab);
    await page.waitForFunction(tab=>window.AITUTOR_V9.Store.state.studyTab===tab,tab);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  };

  await open('core');
  const core=await page.locator('.study-body-mobile').evaluate(root=>({
    underlines:[...root.querySelectorAll('.study-key-underline')].map(x=>(x.textContent||'').trim()).filter(Boolean),
    text:root.innerText
  }));
  assert(core.underlines.length>=4,'mobile core renders multiple visible exam-key underlines');
  assert(['가연물','산소','온도','연쇄반응'].every(k=>core.text.includes(k)),'extinguishment core keeps all four combustion-factor links');

  await open('detail');
  const detail=await page.locator('.study-body-mobile').evaluate(root=>({
    headings:[...root.querySelectorAll('.detail-section h3,.detail-compare h3,.detail-exam-points h3')].map(x=>(x.textContent||'').trim()).filter(Boolean),
    text:root.innerText,
    examPoints:root.querySelector('.detail-exam-points')?.innerText||''
  }));
  assert(detail.headings.includes('소화의 정의'),'extinguishment detail starts with an explicit definition section');
  assert(detail.headings.includes('소화의 종류'),'extinguishment detail renders the four methods as a named type section');
  assert(detail.headings.some(x=>/작용 원리|연소 4요소와 소화원리 연결/.test(x)),'extinguishment detail includes mechanism/combustion-factor reasoning');
  assert(!detail.headings.some(x=>/^상세\s*설명$/.test(x)),'extinguishment detail has no repeated generic 상세 설명 heading');
  assert(['제거소화','질식소화','냉각소화','부촉매소화','가연물','연쇄반응'].every(k=>detail.text.includes(k)),'extinguishment detail preserves complete type and mechanism explanations');
  assert(detail.examPoints.includes('시험 포인트')&&/질식|부촉매/.test(detail.examPoints),'detail closes with an explicit exam-point section instead of generic filler');

  const sweep=await page.evaluate(()=>{
    const V=window.AITUTOR_V9,s=V.Store.state,out={concepts:0,noUnderline:[],noDefinition:[],genericHeading:[],thinDetail:[]};
    for(const c of V.curriculum.concepts){
      out.concepts++;
      s.page='study';s.subject=c.subject;s.scopeId=c.scopeId;s.conceptId=c.id;s.outline=false;s.studyTab='core';V.App.render();
      const core=document.querySelector('.study-body-mobile .core-view');
      if(!core?.querySelector('.study-key-underline'))out.noUnderline.push(c.id);
      s.studyTab='detail';V.App.render();
      const root=document.querySelector('.study-body-mobile .detail-view'),heads=[...(root?.querySelectorAll('.detail-section h3,.detail-compare h3,.detail-exam-points h3')||[])].map(x=>(x.textContent||'').trim());
      if(!root?.querySelector('.detail-definition'))out.noDefinition.push(c.id);
      if(heads.some(x=>/^상세\s*설명$/.test(x)))out.genericHeading.push(c.id);
      if((root?.innerText||'').trim().length<180)out.thinDetail.push(c.id);
    }
    return out
  });
  assert(sweep.concepts===183,'structured learner sweep covers all 183 fire and EMS concepts');
  assert(sweep.noDefinition.length===0,'all 183 detail views render an explicit definition block');
  assert(sweep.genericHeading.length===0,'all 183 detail views avoid repeated generic 상세 설명 headings');
  assert(sweep.thinDetail.length===0,'all 183 detail views retain substantive explanation after semantic restructuring');
  assert(sweep.noUnderline.length===0,'all 183 core views expose at least one visible exam-key underline');

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,s=V.Store.state,c=V.curriculum.byId['F04-C01'];
    s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='ai';
    s.chat=s.chat.filter(x=>x.conceptId!==c.id);
    for(let i=0;i<12;i++)s.chat.push({id:'v17-'+i,role:i%2?'assistant':'user',text:(i%2?'설명 ':'질문 ')+(i+1)+' '.repeat(2)+'소화원리와 연소요소를 충분히 길게 확인하는 대화입니다. '.repeat(4),at:Date.now()+i,conceptId:c.id});
    V.Store.save();V.App.render();
  });
  await page.waitForSelector('.study-body-mobile .study-ai-chat');
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const firstScroll=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>{const b=el.closest('.study-body'),bottom=x=>!x||x.scrollHeight<=x.clientHeight+3||Math.abs(x.scrollHeight-x.clientHeight-x.scrollTop)<=3;return{chat:bottom(el),body:bottom(b),bodyTop:b?.scrollTop||0}});
  assert(firstScroll.chat&&firstScroll.body,'opening AI on mobile lands on the latest visible conversation instead of the first message');

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],s=V.Store.state;
    s.chat.push({id:'v17-table',role:'assistant',conceptId:c.id,at:Date.now()+99,text:'| 구분 | 작용 대상 | 핵심 |\n| --- | --- | --- |\n| 제거소화 | 가연물 | 제거·격리 |\n| 질식소화 | 산소 | 접촉·농도 차단 |\n| 냉각소화 | 온도 | 발화점 이하 |'});
    V.Store.save();V.App.render()
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const table=await page.locator('.study-body-mobile .tutor-ai-table').evaluate(el=>({
    rows:el.querySelectorAll('tbody tr').length,
    cols:[...el.querySelectorAll('tbody tr')].map(r=>r.children.length),
    wrapper:el.parentElement?.classList.contains('tutor-ai-table-wrap'),
    width:el.getBoundingClientRect().width
  }));
  assert(table.rows===3&&table.cols.every(x=>x===3),'AI markdown table is converted into a consistent three-column table');
  assert(table.wrapper&&table.width>0,'AI table stays inside a dedicated responsive scroll wrapper on mobile');
  const tableScroll=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>{const b=el.closest('.study-body'),bottom=x=>!x||x.scrollHeight<=x.clientHeight+3||Math.abs(x.scrollHeight-x.clientHeight-x.scrollTop)<=3;return bottom(el)&&bottom(b)});
  assert(tableScroll,'AI table render also keeps the latest conversation visible');

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],s=V.Store.state;
    s.chat.push({id:'v17-table-loose',role:'assistant',conceptId:c.id,at:Date.now()+100,text:'구분 | 내용\n제거소화 | 가연물 제거·격리\n질식소화 | 산소 접촉·농도 차단\n부촉매소화 | 연쇄반응 억제'});
    V.Store.save();V.App.render()
  });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const loose=await page.locator('.study-body-mobile .tutor-ai-table').last().evaluate((el)=>{
    const wrap=el.closest('.tutor-ai-table-wrap'),chat=el.closest('.study-ai-chat'),wr=wrap.getBoundingClientRect(),cr=chat.getBoundingClientRect();
    return{rows:el.querySelectorAll('tbody tr').length,cols:[...el.querySelectorAll('tbody tr')].map(r=>r.children.length),contained:wr.left>=cr.left-1&&wr.right<=cr.right+1,scrollSafe:wrap.scrollWidth>=wrap.clientWidth}
  });
  assert(loose.rows===3&&loose.cols.every(x=>x===2),'AI pipe table without a Markdown divider is normalized into aligned columns');
  assert(loose.contained&&loose.scrollSafe,'wide AI table stays contained in the mobile chat and scrolls horizontally instead of breaking layout');

  const input=page.locator('.study-body-mobile [data-tutor-input]');
  await input.fill('질식소화 핵심만 설명해줘');
  await page.locator('.study-body-mobile [data-tutor-send]').click();
  await page.waitForFunction(()=>{const c=window.AITUTOR_V9.Store.state.chat.filter(x=>x.conceptId==='F04-C01');return c.at(-1)?.role==='assistant'&&c.at(-1)?.text!=='생각 중…'});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const after=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>{const b=el.closest('.study-body'),bottom=x=>!x||x.scrollHeight<=x.clientHeight+3||Math.abs(x.scrollHeight-x.clientHeight-x.scrollTop)<=3;return{bottom:bottom(el)&&bottom(b),last:el.lastElementChild?.textContent||''}});
  assert(after.bottom,'new AI answer keeps the visible mobile chat pinned to the latest conversation');
  assert(after.last.includes('119'),'latest assistant message remains visible after the answer render');

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId['F04-C01'],S=V.SourcePDF,original={availability:S.availability,sourcePage:S.sourcePage,pdfPage:S.pdfPage,render:S.render,locate:S.locate};
    window.__v17SourceOriginal=original;window.__v17SourceRenders=0;
    S.availability=async()=>({local:false,direct:true,officialPage:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/'});
    S.sourcePage=()=> 'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/';
    S.pdfPage=(_k,p)=>p;
    S.locate=async(_k,_q,o)=>o?.bookRanges?.length?{page:184,score:4,pages:400}:{page:186,score:18,pages:400};
    S.render=async(_k,page,host)=>{window.__v17SourceRenders++;host.innerHTML='<div class="pdf-canvas-wrap"><div class="pdf-highlight-layer"></div></div>';const hits=window.__v17SourceRenders>=3?3:0;if(hits){for(let i=0;i<hits;i++){const x=document.createElement('div');x.className='pdf-evidence-line';host.querySelector('.pdf-highlight-layer').appendChild(x)}}return{page,bookPage:page,pages:400,hits,evidenceLines:hits?['소화원리 가연물 제거','질식소화 산소 차단','부촉매 연쇄반응 억제']:[],zoom:1}};
    const st=V.Store.state;st.page='study';st.subject='fire';st.scopeId=c.scopeId;st.conceptId=c.id;st.studyTab='source';V.Store.save();V.App.render()
  });
  await page.locator('.study-body-mobile [data-source-concept]').click();
  await page.waitForFunction(()=>document.querySelector('#pdfEvidence')?.dataset.renderState==='ready');
  const source=await page.locator('#pdfEvidence').evaluate(root=>({verified:root.dataset.anchorVerified,scope:root.dataset.searchScope,hits:Number(root.dataset.highlightCount||0),lines:root.querySelectorAll('.pdf-evidence-line').length,renders:window.__v17SourceRenders}));
  assert(source.verified==='true'&&source.scope==='document'&&source.hits>=2&&source.lines>=2,'source viewer expands from mapped range to strong full-document evidence and draws visible underline markers');
  assert(source.renders>=3,'source evidence recovery tries the mapped candidate before a stronger whole-document match');
  await page.evaluate(()=>{const V=window.AITUTOR_V9,o=window.__v17SourceOriginal;Object.assign(V.SourcePDF,o);document.querySelector('#pdfEvidence')?.remove()});

  console.log('STUDY_STRUCTURE_CHAT_E2E_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
