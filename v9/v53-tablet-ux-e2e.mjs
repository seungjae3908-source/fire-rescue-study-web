import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
  for(const vp of [{width:768,height:1024},{width:1024,height:768}]){
    const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:1.5});
    const page=await ctx.newPage();page.setDefaultTimeout(45000);
    await page.route('https://study-119-pdf-proxy.vercel.app/api/official-pdf?doc=prevention1**',route=>route.fulfill({status:503,contentType:'text/plain',body:'tablet-v53-source-failure-probe'}));
    await page.goto(base,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Store);
    await page.evaluate(()=>{const V=window.AITUTOR_V9,s=V.Store.state,c=V.curriculum.byId['F03-C06'];s.page='study';s.subject='fire';s.scopeId=c.scopeId;s.conceptId=c.id;s.studyTab='detail';s.outline=false;V.Store.save();V.App.render()});
    await page.waitForSelector('.page-study .study-body-desktop .detail-view');

    const tabs=await page.locator('.page-study .concept-head .tabbar').evaluate(root=>{
      const rr=root.getBoundingClientRect(),buttons=[...root.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect();return{text:b.textContent.trim(),left:r.left,right:r.right,width:r.width,visible:getComputedStyle(b).display!=='none'}});
      return{scrollWidth:root.scrollWidth,clientWidth:root.clientWidth,left:rr.left,right:rr.right,buttons}
    });
    assert(tabs.buttons.filter(x=>x.visible).length===5,vp.width+' tablet shows all 5 study tabs including AI');
    assert(tabs.buttons.some(x=>x.text==='AI'&&x.visible),vp.width+' AI tab is visible');
    assert(tabs.scrollWidth<=tabs.clientWidth+2&&tabs.buttons.every(x=>x.left>=tabs.left-1&&x.right<=tabs.right+1),vp.width+' tab row has no hidden horizontal overflow');

    const flows=await page.locator('.page-study .study-body-desktop .concept-visual .visual-flow:not(.vertical-org)').evaluateAll((roots,vpWidth)=>roots.map(root=>({scrollWidth:root.scrollWidth,clientWidth:root.clientWidth,cols:getComputedStyle(root).gridTemplateColumns.split(/\s+/).filter(Boolean).length,nodes:[...root.querySelectorAll('.visual-node')].map(n=>{const r=n.getBoundingClientRect();return{left:r.left,right:r.right,width:r.width,text:n.textContent.trim()}})})),vp.width);
    assert(flows.length>=1,vp.width+' phenomenon detail has visual flow');
    for(const flow of flows){
      assert(flow.scrollWidth<=flow.clientWidth+2,vp.width+' visual flow does not require horizontal scrolling');
      assert(flow.cols<=(vp.width<=860?2:3),vp.width+' visual flow wraps to readable tablet columns');
      assert(flow.nodes.every(x=>x.width>=120),vp.width+' visual nodes stay readable after wrapping');
    }

    const nav=await page.locator('.page-study .concept-nav').evaluate(el=>{const r=el.getBoundingClientRect();return{height:r.height,bottom:r.bottom,vh:innerHeight}});
    assert(nav.height<=70&&nav.bottom<=nav.vh+1,vp.width+' previous/contents/next bar stays compact and inside viewport');

    await page.evaluate(()=>{const V=window.AITUTOR_V9,s=V.Store.state,c=V.curriculum.byId['F07-C14'];s.conceptId=c.id;s.scopeId=c.scopeId;s.studyTab='core';V.Store.save();V.App.render()});
    await page.waitForSelector('.page-study .study-body-desktop .core-view');
    const coreRows=await page.locator('.page-study .study-body-desktop .core-view').evaluate(root=>({
      nums:[...root.querySelectorAll('.study-numbers li')].map(x=>x.innerText.trim()),
      essentials:[...root.querySelectorAll('.study-core-essentials li')].map(x=>x.innerText.trim())
    }));
    const norm=coreRows.nums.map(x=>x.toLowerCase().replace(/[^0-9a-z가-힣]/g,''));
    assert(norm.length===new Set(norm).size,vp.width+' core numeric criteria contain no exact repeated rows');
    const nt=s=>(String(s).match(/\d+(?:\.\d+)?/g)||[]).join('|'),clean=s=>String(s).toLowerCase().replace(/[^0-9a-z가-힣]/g,''),dice=(a,b)=>{a=clean(a);b=clean(b);if(a.length<4||b.length<4)return 0;const grams=s=>{const m=new Map;for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1)}return m},A=grams(a),B=grams(b);let hit=0,total=0;for(const n of A.values())total+=n;for(const n of B.values())total+=n;for(const [g,n] of A)hit+=Math.min(n,B.get(g)||0);return total?2*hit/total:0};
    const crossDup=coreRows.essentials.flatMap(a=>coreRows.nums.filter(b=>nt(a)&&nt(a)===nt(b)&&dice(a,b)>=.46).map(b=>[a,b]));
    assert(crossDup.length===0,vp.width+' core essentials do not paraphrase-repeat the numeric criteria block');

    const printCss=await page.evaluate(()=>window.AITUTOR_V9.PassNote.printDocument('fire'));
    assert(/\.c\{break-inside:auto/.test(printCss)&&/@media screen and \(min-width:721px\) and \(max-width:1180px\)/.test(printCss),vp.width+' summary export uses tablet-readable screen CSS and non-wasteful print page breaks');
    const conceptSections=(printCss.match(/<section class="c">/g)||[]).length,featureCaps=(printCss.match(/<h3>핵심 특징<\/h3>/g)||[]).length;
    assert(conceptSections>=70&&featureCaps<=conceptSections,vp.width+' fire PDF remains full-syllabus but uses compact per-concept summary content');

    await page.evaluate(()=>{const V=window.AITUTOR_V9,s=V.Store.state;s.studyTab='source';V.Store.save();V.App.render()});
    await page.locator('.page-study .concept-head [data-study-tab="source"]').click().catch(()=>{});
    await page.waitForSelector('.page-study .study-body-desktop [data-source-concept]');
    await page.locator('.page-study .study-body-desktop [data-source-concept]').click();
    await page.waitForSelector('#pdfEvidence .pdf-loading-actions',{timeout:10000});
    const loading=await page.locator('#pdfEvidence').evaluate(root=>({official:!!root.querySelector('.pdf-loading-actions a[href]'),close:!!root.querySelector('.pdf-loading-actions [data-source-close]'),modalWidth:root.querySelector('.pdf-evidence-modal')?.getBoundingClientRect().width||0,vw:innerWidth}));
    assert(loading.official&&loading.close,vp.width+' source loading immediately offers official-site fallback and close');
    assert(loading.modalWidth<=loading.vw*.98,vp.width+' source modal fits tablet viewport');

    await page.waitForSelector('#pdfEvidence .official-fallback',{timeout:30000});
    const fallback=await page.locator('#pdfEvidence .official-fallback').innerText();
    assert(fallback.includes('다시 시도')&&fallback.includes('공식 사이트'),vp.width+' failed source load becomes actionable instead of indefinite spinner');
    await page.locator('#pdfEvidence [data-source-close]').last().click();
    await ctx.close();
  }
  console.log('V53_TABLET_UX_ACCEPTANCE_SUCCESS');
}finally{await browser.close()}
