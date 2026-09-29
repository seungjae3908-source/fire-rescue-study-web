import { chromium } from 'playwright';

const base=process.env.STUDY_119_PRODUCTION_URL||'https://seungjae3908-source.github.io/fire-rescue-study-web/v9/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const runtimeUrl=process.env.STUDY_119_RUNTIME_HEAD_URL||new URL('pages-runtime.json',base).href;
const DOCS=['fire1','fire2','ems','prevention1','prevention2','law1','law2','law3','law4','law5'];

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
function observe(page){
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  page.on('requestfailed',r=>{
    try{
      const u=new URL(r.url()),b=new URL(base);
      if(u.origin===b.origin)errors.push('requestfailed:'+r.url()+' '+(r.failure()?.errorText||''));
    }catch{}
  });
  return errors;
}
async function noX(page,label){
  const r=await page.evaluate(()=>({
    doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],
    body:[document.body.scrollWidth,document.body.clientWidth]
  }));
  assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r));
}
async function injectMember(page){
  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9,user={id:'qa-pages-member',email:'qa-pages-member@local.invalid'};
    try{Object.defineProperty(V.Auth,'user',{value:user,configurable:true,writable:true})}catch{try{V.Auth.user=user}catch{}}
    try{V.Store?.switchOwner?.(user.id)}catch{}
    try{await V.Lazy119?.ensureQuestions?.()}catch(err){console.warn('QA question preload warning',String(err?.message||err))}
    V.App.render();
  });
  await page.waitForSelector('.page',{state:'visible',timeout:60000});
  assert(await page.locator('.login-gate-shell').count()===0,'in-memory QA member renders learner shell');
}
async function restoreGuest(page){
  await page.evaluate(()=>{
    const V=window.AITUTOR_V9;
    try{Object.defineProperty(V.Auth,'user',{value:null,configurable:true,writable:true})}catch{try{V.Auth.user=null}catch{}}
    V.App.render();
  });
  await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:30000});
  assert(await page.locator('.page').count()===0,'guest restore closes learner routes');
}
async function rangeProbe(url){
  const r=await fetch(url,{headers:{range:'bytes=0-65535','cache-control':'no-cache'}});
  const ab=await r.arrayBuffer();
  return{status:r.status,bytes:ab.byteLength,range:r.headers.get('content-range')||'',type:r.headers.get('content-type')||''};
}

const rr=await fetch(runtimeUrl,{headers:{'cache-control':'no-cache'}});
assert(rr.ok,'Pages runtime identity HTTP '+rr.status);
const runtime=await rr.json();
assert(runtime.sha===expected,'Pages runtime identity matches '+expected);
assert(runtime.source==='github-pages-actions'||runtime.transport==='github-pages','Pages runtime identity uses GitHub Pages');

for(const doc of DOCS){
  const p=await rangeProbe('https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror/'+doc+'.pdf');
  assert(p.status===206,doc+' mirror supports HTTP 206');
  assert(p.bytes===65536,doc+' mirror returns requested 64KiB');
  assert(/^bytes\s+0-65535\//i.test(p.range),doc+' mirror returns Content-Range');
  assert(/application\/pdf/i.test(p.type),doc+' mirror content type is PDF');
}

const browser=await chromium.launch({headless:true});
try{
  for(const vp of [
    {width:360,height:800,isMobile:true,label:'mobile-360'},
    {width:390,height:844,isMobile:true,label:'mobile-390'},
    {width:412,height:915,isMobile:true,label:'mobile-412'},
    {width:768,height:1024,isMobile:false,label:'tablet-768'},
    {width:1024,height:1366,isMobile:false,label:'tablet-1024'},
    {width:1440,height:900,isMobile:false,label:'desktop-1440'}
  ]){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.isMobile});
    const page=await ctx.newPage(),errors=observe(page);
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.Auth,{timeout:60000});
    await page.waitForSelector('.login-gate-shell',{state:'visible',timeout:60000});

    assert((await page.title()).includes('소방합격'),vp.label+' brand title');
    assert(await page.locator('.login-gate-card').count()===1,vp.label+' guest sees one member login gate');
    assert(await page.locator('[data-signin]').count()===1,vp.label+' login action visible');
    assert(await page.locator('[data-signup]').count()===1,vp.label+' signup action visible');
    assert(await page.locator('.page').count()===0,vp.label+' learner page hidden from guest');
    await noX(page,vp.label+' guest gate');

    await injectMember(page);

    const routes=['home','study','notes','bank','exam','wrong','stats','resources','settings'];
    for(const route of routes){
      await page.evaluate(async route=>{await window.AITUTOR_V9.App.go(route)},route);
      await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route,{timeout:60000});
      await page.waitForSelector('.main.page-'+route,{state:'visible',timeout:60000});
      assert((await page.locator('.page').innerText()).trim().length>0,vp.label+' '+route+' renders content');
      await noX(page,vp.label+' '+route);
      if(vp.width<=1024){
        const touch=await page.locator('.page .btn,.page .seg button,.page .confidence button,.page .book-jumpbar button,.page .tabbar button,.page .choice,.page .weak-chip,.page .detail-toc-chip,.top .btn,.mobile-nav button,.modal .btn').evaluateAll(nodes=>nodes.filter(n=>{const cs=getComputedStyle(n),r=n.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0&&!n.disabled}).map(n=>({text:(n.textContent||'').trim().slice(0,60),h:n.getBoundingClientRect().height})).filter(x=>x.h<43.5));
        assert(touch.length===0,vp.label+' '+route+' primary touch targets >=44px '+JSON.stringify(touch.slice(0,4)));
      }
    }

    if(vp.width<=1024){
      await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('stats')});
      await page.waitForSelector('.main.page-stats',{state:'visible',timeout:30000});
      const statsTargets=await page.locator('.stats-next-action .toolbar .btn').evaluateAll(nodes=>nodes.filter(n=>getComputedStyle(n).display!=='none').map(n=>n.getBoundingClientRect().height));
      if(statsTargets.length)assert(statsTargets.every(h=>h>=44),vp.label+' stats touch layout keeps >=44px next-action buttons');
      await noX(page,vp.label+' stats touch layout');
    }

    await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('home')});
    assert(await page.locator('.dashboard-home-compact').count()===1,vp.label+' compact home is live');

    await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('study')});
    await page.waitForSelector('.study-body-unified',{state:'visible',timeout:60000});
    const study=await page.evaluate(()=>{
      const tabs=[...document.querySelectorAll('[data-study-tab]')].map(x=>x.dataset.studyTab).filter(Boolean);
      return{
        bodies:document.querySelectorAll('.study-body-unified').length,
        conceptNav:document.querySelectorAll('.concept-nav').length,
        tabs:[...new Set(tabs)]
      };
    });
    assert(study.bodies===1,vp.label+' study uses one unified body');
    assert(study.conceptNav===1,vp.label+' study has one previous/next navigation');
    assert(study.tabs.length===5,vp.label+' study exposes five unique learning tabs '+JSON.stringify(study.tabs));

    await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('notes')});
    await page.waitForSelector('#passNotePdf',{state:'attached',timeout:30000});
    assert(await page.locator('#noteUploadSubject').count()===1,vp.label+' pass-note PDF subject selector restored');
    assert(await page.locator('#passNotePdf').count()===1,vp.label+' pass-note PDF upload restored');

    await page.evaluate(async()=>{await window.AITUTOR_V9.App.go('exam')});
    await page.waitForSelector('.exam-hub-tabs',{state:'visible',timeout:30000});
    assert(await page.locator('[data-exam-hub="mock"]').count()===1&&await page.locator('[data-exam-hub="training"]').count()===1,vp.label+' exam and training hubs are split');
    await page.locator('[data-exam-hub="training"]').click();
    await page.waitForSelector('.training-center',{state:'visible',timeout:30000});
    await page.locator('[data-exam-hub="mock"]').click();
    await page.waitForSelector('.exam-download-card',{state:'visible',timeout:30000});
    assert(await page.locator('[data-exam-print]').count()===1,vp.label+' current round PDF action visible');
    assert(await page.locator('[data-exam-doc]').count()===1,vp.label+' current round DOC action visible');
    assert(await page.locator('[data-exam-bundle]').count()===1,vp.label+' full ZIP action visible');

    if(vp.width===390){
      for(const doc of ['fire1','law2']){
        const opened=await page.evaluate(async doc=>{
          const p=await window.AITUTOR_V9.SourcePDF.openPdf(doc,{timeoutMs:60000});
          return{origin:p.origin,pages:p.pdf?.numPages||0};
        },doc);
        assert(opened.origin==='official-static-range',doc+' opens through Pages static-range transport');
        assert(opened.pages>0,doc+' parses with PDF.js');
      }
    }

    await restoreGuest(page);
    await noX(page,vp.label+' restored guest');
    assert(errors.length===0,vp.label+' live runtime errors = 0 '+errors.join(' | '));
    await ctx.close();
  }
  console.log('GITHUB_PAGES_LIVE_BROWSER_ACCEPTANCE_SUCCESS',JSON.stringify({sha:expected}));
}finally{
  await browser.close();
}
