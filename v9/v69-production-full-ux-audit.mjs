import { chromium } from 'playwright';

const base=process.env.STUDY_119_V69_URL||'https://fire-rescue-study-web.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const report={startedAt:new Date().toISOString(),base,expected,viewports:[],issues:[]};
const addIssue=(severity,kind,message,meta={})=>report.issues.push({severity,kind,message,...meta});
const norm=s=>String(s||'').replace(/\s+/g,' ').trim();

async function waitApp(page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:90000});
  await page.waitForSelector('.app',{state:'visible',timeout:90000});
}
async function go(page,route){
  const t=Date.now();
  await page.evaluate(route=>window.AITUTOR_V9.App.go(route),route);
  await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route,{timeout:90000});
  await page.waitForSelector('.page',{state:'visible',timeout:90000});
  await page.waitForTimeout(120);
  return Date.now()-t;
}
async function studyTab(page,tab){
  const t=Date.now();
  await page.evaluate(tab=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.studyTab=tab;V.Store.save();V.App.render()},tab);
  await page.waitForFunction(tab=>window.AITUTOR_V9.Store.state.studyTab===tab,tab,{timeout:30000});
  await page.waitForTimeout(80);
  return Date.now()-t;
}
async function layoutStats(page){
  return page.locator('.page').evaluate(root=>{
    const visible=el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>1&&r.height>1&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight};
    const all=[root,...root.querySelectorAll('*')].filter(visible);
    const vertical=all.filter(el=>!el.matches('textarea,input,select,[contenteditable="true"]')&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+2).map(el=>({tag:el.tagName,cls:String(el.className||'').slice(0,100),owner:el.getAttribute('data-scroll-owner')||'',sh:el.scrollHeight,ch:el.clientHeight}));
    const outside=all.filter(el=>{const r=el.getBoundingClientRect();return (r.left<-2||r.right>innerWidth+2)&&!el.closest('.table-scroll,.detail-toc-chips,.study-quiz-jumps,.exam-mini-navigator,.tutor-ai-table-wrap,.tutor-compare-wrap')}).slice(0,12).map(el=>{const r=el.getBoundingClientRect();return{tag:el.tagName,cls:String(el.className||'').slice(0,80),text:norm(el.textContent).slice(0,70),left:Math.round(r.left),right:Math.round(r.right)}});
    const blocks=[...root.querySelectorAll('.card,.detail-section,.lesson-box,.question-card,.resource-row,.row,.metric,.study-quick,.study-core-essentials,.study-numbers,.study-traps,.detail-compare,.detail-criteria,.detail-exam-points')].filter(visible).map(el=>{const r=el.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,text:norm(el.textContent)}}).sort((a,b)=>a.top-b.top);
    let maxGap=0;for(let i=1;i<blocks.length;i++){const gap=blocks[i].top-blocks[i-1].bottom;if(gap>maxGap)maxGap=gap}
    const textBlocks=blocks.filter(x=>x.text.length>8);
    let minL=innerWidth,maxR=0;for(const x of textBlocks){minL=Math.min(minL,x.left);maxR=Math.max(maxR,x.right)}
    const widthUse=textBlocks.length?Math.max(0,Math.min(1,(maxR-minL)/innerWidth)):1;
    const seen=new Map(),dups=[];
    for(const x of textBlocks){const key=x.text.replace(/[0-9]+/g,'#').slice(0,180);if(key.length<24)continue;const n=(seen.get(key)||0)+1;seen.set(key,n);if(n===2)dups.push(key.slice(0,120))}
    return{
      docWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
      routeScrollHeight:root.scrollHeight,routeClientHeight:root.clientHeight,
      vertical,outside,maxGap:Math.round(maxGap),widthUse:Number(widthUse.toFixed(2)),duplicates:dups.slice(0,8)
    };
  });
}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [
    {name:'mobile-390',width:390,height:844,mobile:true},
    {name:'tablet-768',width:768,height:1024,mobile:false},
    {name:'tablet-landscape-1024',width:1024,height:768,mobile:false},
    {name:'pc-1440',width:1440,height:900,mobile:false},
    {name:'pc-1920',width:1920,height:1080,mobile:false}
  ]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.mobile,hasTouch:vp.mobile,serviceWorkers:'block'});
    const page=await ctx.newPage();page.setDefaultTimeout(90000);
    const errs=[];
    page.on('pageerror',e=>errs.push('pageerror:'+e.message));
    page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errs.push('console:'+m.text())});
    page.on('requestfailed',r=>{const u=r.url();if(!/official-monitor|favicon/i.test(u))errs.push('requestfailed:'+u+' '+(r.failure()?.errorText||''))});
    const started=Date.now();await waitApp(page);const initialMs=Date.now()-started;
    const runtime=await page.evaluate(async()=>{const r=await fetch('/api/runtime-head',{cache:'no-store'});return r.json()});
    const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>({name:x.name,initiatorType:x.initiatorType,transferSize:x.transferSize||0,duration:x.duration||0})));
    const scripts=resources.filter(x=>x.initiatorType==='script');
    const vpRow={viewport:vp,initialMs,scriptCount:scripts.length,scriptTransferKB:Math.round(scripts.reduce((a,x)=>a+x.transferSize,0)/1024),routes:{},flow:{}};
    if(expected&&runtime.sha!==expected)addIssue('P0','identity','Production SHA mismatch',{viewport:vp.name,expected,actual:runtime.sha});
    if(initialMs>5000)addIssue('P1','performance','Initial app load >5s',{viewport:vp.name,ms:initialMs});
    if(scripts.length>80)addIssue('P1','performance','Too many initial script requests',{viewport:vp.name,count:scripts.length});

    for(const route of ['home','notes','bank','exam','wrong','stats','resources','suggestions','settings']){
      const ms=await go(page,route);const st=await layoutStats(page);vpRow.routes[route]={ms,...st};
      if(ms>1200)addIssue('P1','performance','Slow route transition',{viewport:vp.name,route,ms});
      if(st.vertical.length>1)addIssue('P1','scroll','Multiple vertical scroll owners',{viewport:vp.name,route,owners:st.vertical.slice(0,6)});
      if(st.outside.length)addIssue('P1','layout','Visible content escapes viewport',{viewport:vp.name,route,samples:st.outside});
      if(vp.width>=1024&&st.widthUse<0.62)addIssue('P2','space','Desktop content uses too little horizontal space',{viewport:vp.name,route,widthUse:st.widthUse});
      if(st.maxGap>Math.max(220,vp.height*.30))addIssue('P2','space','Large blank vertical gap',{viewport:vp.name,route,maxGap:st.maxGap});
      if(st.routeScrollHeight>Math.max(vp.height*5,4200))addIssue('P2','scroll','Excessively long route scroll',{viewport:vp.name,route,scrollHeight:st.routeScrollHeight});
      if(st.duplicates.length)addIssue('P2','duplicate','Repeated visible content blocks',{viewport:vp.name,route,samples:st.duplicates.slice(0,4)});
    }

    await go(page,'study');
    for(const tab of ['core','detail','quiz','source','ai']){
      const ms=await studyTab(page,tab);const st=await layoutStats(page);vpRow.routes['study-'+tab]={ms,...st};
      if(ms>700)addIssue('P2','performance','Slow study tab switch',{viewport:vp.name,tab,ms});
      if(st.vertical.length>1)addIssue('P1','scroll','Study tab has multiple vertical scrollers',{viewport:vp.name,tab,owners:st.vertical.slice(0,6)});
      if(vp.width>=1024&&st.widthUse<0.58)addIssue('P2','space','Study content underuses desktop width',{viewport:vp.name,tab,widthUse:st.widthUse});
      if(st.maxGap>Math.max(220,vp.height*.30))addIssue('P2','space','Study tab has large blank gap',{viewport:vp.name,tab,maxGap:st.maxGap});
    }

    // Detail current-section indication
    await page.evaluate(()=>window.AITUTOR_V9.App.chooseConcept('F01-C01'));
    await page.waitForFunction(()=>window.AITUTOR_V9.Store.state.conceptId==='F01-C01');
    await studyTab(page,'detail');
    const cmp=page.locator('[data-detail-jump="comparison"]:visible').first();
    if(await cmp.count()){
      await cmp.click();await page.waitForTimeout(250);
      const active=await cmp.evaluate(el=>el.classList.contains('on')&&el.getAttribute('aria-current')==='location');
      vpRow.flow.detailActive=active;if(!active)addIssue('P1','navigation','Detail jump does not show current section',{viewport:vp.name});
    }

    // AI Enter send
    await studyTab(page,'ai');
    const input=page.locator('[data-tutor-input]:visible').first();
    if(await input.count()){
      const t=Date.now();await input.fill('정의만 간단히 알려줘');await input.press('Enter');
      await page.waitForFunction(()=>[...document.querySelectorAll('.tutor-message.me')].some(x=>x.textContent.includes('정의만 간단히 알려줘')),{timeout:10000});
      vpRow.flow.aiEnterMs=Date.now()-t;
    }else addIssue('P0','ai','AI input is not visible',{viewport:vp.name});

    // Question entry latency
    await go(page,'home');const tq=Date.now();await page.evaluate(()=>window.AITUTOR_V9.App.go('bank'));
    try{await page.waitForSelector('.bank-page .question-card',{state:'visible',timeout:30000});vpRow.flow.questionEntryMs=Date.now()-tq;if(vpRow.flow.questionEntryMs>1500)addIssue('P1','performance','Question entry feels slow',{viewport:vp.name,ms:vpRow.flow.questionEntryMs})}
    catch{addIssue('P0','question','Question bank did not become ready in 30s',{viewport:vp.name})}

    // Official source latency: static mirror + law proxy
    for(const item of [{id:'F03-C03',label:'fire1-mirror',limit:15000},{id:'F01-C01',label:'law2-proxy',limit:30000}]){
      await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),item.id);await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,item.id);
      await studyTab(page,'source');
      const btn=page.locator('[data-source-concept]:visible').first();
      if(!(await btn.count())){addIssue('P0','source','Source button missing',{viewport:vp.name,concept:item.id});continue}
      const t=Date.now();await btn.click();
      try{await page.waitForSelector('#pdfEvidence canvas',{state:'visible',timeout:item.limit});const ms=Date.now()-t;vpRow.flow[item.label+'Ms']=ms;if(ms>5000)addIssue('P1','performance','Official source first canvas is slow',{viewport:vp.name,concept:item.id,label:item.label,ms});await page.locator('#pdfEvidence [data-pdf-close]:visible').click().catch(()=>{})}
      catch{addIssue('P0','source','Official source canvas failed to appear',{viewport:vp.name,concept:item.id,label:item.label,timeoutMs:item.limit});await page.locator('#pdfEvidence [data-pdf-close]:visible').click().catch(()=>{})}
    }

    const uniqueErrs=[...new Set(errs)];vpRow.errors=uniqueErrs.slice(0,20);
    if(uniqueErrs.length)addIssue('P1','runtime','Browser/runtime errors detected',{viewport:vp.name,errors:uniqueErrs.slice(0,8)});
    report.viewports.push(vpRow);await ctx.close();
  }
}finally{await browser.close()}

const rank={P0:0,P1:1,P2:2,P3:3};report.issues.sort((a,b)=>(rank[a.severity]??9)-(rank[b.severity]??9));
console.log('V69_PRODUCTION_AUDIT_JSON '+JSON.stringify(report));
console.log('V69_PRODUCTION_AUDIT_COMPLETE issues='+report.issues.length);
