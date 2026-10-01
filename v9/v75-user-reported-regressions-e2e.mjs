import { chromium } from 'playwright';

const base=process.env.STUDY_119_V75_USER_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const norm=v=>String(v||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block',acceptDownloads:true});
  const page=await ctx.newPage();page.setDefaultTimeout(45000);
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store);

  await page.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F01-C01'],s=V.Store.state;s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='core';s.outline=true;V.Store.save();V.App.render()});
  await page.waitForSelector('.outline.open');
  const rows=await page.locator('.outline.open').evaluate(root=>[...root.querySelectorAll('.scope>button,.concepts button')].filter(x=>x.offsetParent!==null).map(x=>{const r=x.getBoundingClientRect();return{text:(x.textContent||'').trim(),top:r.top,bottom:r.bottom,height:r.height}}).sort((a,b)=>a.top-b.top));
  assert(rows.length>8,'mobile TOC renders a full flow of scope/concept rows');
  const overlaps=[];for(let i=1;i<rows.length;i++)if(rows[i].top<rows[i-1].bottom-1)overlaps.push([rows[i-1],rows[i]]);
  assert(overlaps.length===0,'mobile TOC rows never paint over each other');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.outline=false;V.Store.state.studyTab='ai';V.Store.save();V.App.render()});
  await page.waitForSelector('[data-tutor-input]');
  await page.locator('[data-tutor-input]').fill('정의만 간단히 알려줘');
  await page.locator('[data-tutor-send]').click();
  await page.waitForFunction(()=>{const xs=[...document.querySelectorAll('.tutor-message.assistant')];return xs.length&&!(xs.at(-1)?.textContent||'').includes('생각 중')});
  const ai=await page.locator('.tutor-message.assistant').last().innerText();
  assert(ai.replace(/\s+/g,' ').trim().length<=180,'definition-only AI answer stays concise on mobile');
  assert(!/(^|\n)근거(\n|$)/.test(ai),'definition-only AI does not append an unrequested evidence block');
  const layout=await page.evaluate(()=>{const compose=document.querySelector('.study-ai .tutor-compose'),chat=document.querySelector('.study-ai-chat'),nav=document.querySelector('.mobile-nav');compose?.scrollIntoView({block:'nearest'});const a=compose?.getBoundingClientRect(),b=chat?.getBoundingClientRect(),n=nav?.getBoundingClientRect();return{compose:a&&{top:a.top,bottom:a.bottom},chat:b&&{top:b.top,bottom:b.bottom},nav:n&&{top:n.top,bottom:n.bottom}}});
  assert(layout.compose&&layout.chat&&layout.compose.top>=layout.chat.bottom-1,'AI composer follows the chat instead of covering its answer');
  if(layout.nav)assert(layout.compose.bottom<=layout.nav.top+1,'AI composer stays above mobile bottom navigation');

  await page.evaluate(()=>{const V=window.AITUTOR_V9,c=V.curriculum.byId['F01-C01'],s=V.Store.state;s.studyTab='quiz';s.conceptId=c.id;V.Store.save();V.App.render()});
  await page.waitForSelector('.question-card');
  const answerInfo=await page.evaluate(()=>{const V=window.AITUTOR_V9,q=(V.QuestionQuality119?.forConcept('F01-C01')||[])[0];return q?{id:q.id,a:q.a}:null});
  assert(answerInfo,'F01-C01 has a quiz question for answer explanation QA');
  await page.locator('[data-answer="'+answerInfo.id+':'+answerInfo.a+'"]').click();
  const answerRows=await page.locator('.question-card .answer').evaluate(root=>[...root.querySelectorAll('.answer-ex,.choice-explain span')].map(x=>(x.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean));
  assert(new Set(answerRows.map(norm)).size===answerRows.length,'question answer explanation is not repeated inside the same result');

  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.Store.state.page='notes';V.Store.save();V.App.render()});
  await page.waitForSelector('[data-pass-editable="pass"]');
  const docx=await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.PassNote.prepareEditable();
    const html=V.PassNote.printDocument('pass'),blob=V.DocxExport119.buildDocxBlobFromHtml(html,'내 합격노트'),bytes=new Uint8Array(await blob.arrayBuffer()),latin=String.fromCharCode(...bytes);
    const oldClick=HTMLAnchorElement.prototype.click;let download='';
    HTMLAnchorElement.prototype.click=function(){download=this.download||''};
    try{await V.PassNote.exportEditable('pass')}finally{HTMLAnchorElement.prototype.click=oldClick}
    return{download,type:blob.type,size:blob.size,head:[bytes[0],bytes[1]],hasTypes:latin.includes('[Content_Types].xml'),hasDocument:latin.includes('word/document.xml')}
  });
  assert(/\.docx$/i.test(docx.download),'pass-note editable action uses a real .docx filename');
  assert(docx.head[0]===0x50&&docx.head[1]===0x4b&&docx.size>500,'pass-note DOCX has a non-empty ZIP/OOXML container');
  assert(docx.hasTypes&&docx.hasDocument,'pass-note DOCX contains required OOXML document parts');

  console.log('V75_USER_REPORTED_REGRESSIONS_SUCCESS');
  await ctx.close();
}finally{await browser.close()}
