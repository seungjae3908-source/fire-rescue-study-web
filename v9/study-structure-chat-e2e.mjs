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

  await page.evaluate(()=>{
    const V=window.AITUTOR_V9,s=V.Store.state,c=V.curriculum.byId['F04-C01'];
    s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='ai';
    s.chat=s.chat.filter(x=>x.conceptId!==c.id);
    for(let i=0;i<12;i++)s.chat.push({id:'v17-'+i,role:i%2?'assistant':'user',text:(i%2?'설명 ':'질문 ')+(i+1)+' '.repeat(2)+'소화원리와 연소요소를 충분히 길게 확인하는 대화입니다. '.repeat(4),at:Date.now()+i,conceptId:c.id});
    V.Store.save();V.App.render();
  });
  await page.waitForSelector('.study-body-mobile .study-ai-chat');
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const firstScroll=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>({top:el.scrollTop,h:el.scrollHeight,c:el.clientHeight,bottom:Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<=3}));
  assert(firstScroll.h>firstScroll.c&&firstScroll.bottom,'opening AI on mobile lands on the latest visible conversation instead of the first message');

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
  const tableScroll=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<=3);
  assert(tableScroll,'AI table render also keeps the latest conversation visible');

  const input=page.locator('.study-body-mobile [data-tutor-input]');
  await input.fill('질식소화 핵심만 설명해줘');
  await page.locator('.study-body-mobile [data-tutor-send]').click();
  await page.waitForFunction(()=>{const c=window.AITUTOR_V9.Store.state.chat.filter(x=>x.conceptId==='F04-C01');return c.at(-1)?.role==='assistant'&&c.at(-1)?.text!=='생각 중…'});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const after=await page.locator('.study-body-mobile .study-ai-chat').evaluate(el=>({bottom:Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop)<=3,last:el.lastElementChild?.textContent||''}));
  assert(after.bottom,'new AI answer keeps the visible mobile chat pinned to the latest conversation');
  assert(after.last.includes('119'),'latest assistant message remains visible after the answer render');

  console.log('STUDY_STRUCTURE_CHAT_E2E_COMPLETE');
  await ctx.close();
}finally{await browser.close()}
