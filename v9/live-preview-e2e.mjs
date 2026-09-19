import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expectedAppHead=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
function assert(cond,msg){if(!cond)throw new Error(msg);console.log('PASS',msg)}
async function noX(page,label){
  const r=await page.evaluate(()=>({
    doc:[document.documentElement.scrollWidth,document.documentElement.clientWidth],
    body:[document.body.scrollWidth,document.body.clientWidth]
  }));
  assert(r.doc[0]<=r.doc[1]+1&&r.body[0]<=r.body[1]+1,label+' no horizontal overflow '+JSON.stringify(r));
}
function collectErrors(page){
  const out=[];
  page.on('pageerror',e=>out.push('pageerror:'+e.message));
  page.on('console',m=>{
    if(m.type()==='error'&&!/favicon/i.test(m.text()))out.push('console:'+m.text());
  });
  return out;
}
async function boot(page){
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForSelector('.app',{timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
}
async function enterStudy(page){
  await page.evaluate(()=>window.AITUTOR_V9.App.go('study'));
  await page.waitForSelector('.workspace');
}
async function openEvidence(page,id,doc,{anchored=true,pager=false}={}){
  await page.evaluate(id=>window.AITUTOR_V9.App.chooseConcept(id),id);
  await page.waitForFunction(id=>window.AITUTOR_V9.Store.state.conceptId===id,id);
  await page.waitForSelector('.book-source [data-source-concept]');
  const before=await page.evaluate(({id,doc})=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId[id],range=(c?.sourceRanges||[])[0]||{},catalog=V.SourceCatalog119?.resolveForConcept?.(id);
    return{id,title:c?.title||'',doc:range.doc||'',from:Number(range.from)||0,to:Number(range.to)||0,catalog:catalog?.key||''};
  },{id,doc});
  assert(before.doc===doc&&before.catalog===doc,id+' resolves to '+doc);
  if(anchored)assert(before.from>0,id+' has exact page anchor');

  const seen=[];
  const listener=res=>{
    const url=res.url();
    if(url.includes('/api/official-pdf?doc='+encodeURIComponent(doc)))seen.push({url,status:res.status(),type:res.headers()['content-type']||''});
  };
  page.on('response',listener);
  await page.locator('.book-source [data-source-concept]').click();
  await page.waitForSelector('#pdfEvidence',{timeout:30000});
  assert(await page.locator('#sourceModal').count()===0,id+' uses one-click evidence without source modal');
  assert(await page.locator('#pdfEvidence input[type=file]').count()===0,id+' asks for no user PDF upload');

  await page.waitForFunction(()=>{
    const root=document.querySelector('#pdfEvidence');
    const label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
    return !!root?.querySelector('canvas') && /하이라이트\s+[1-9]\d*개/.test(label);
  },null,{timeout:240000});

  const result=await page.evaluate(()=> {
    const root=document.querySelector('#pdfEvidence');
    const label=root?.querySelector('[data-pdf-page-label]')?.textContent||'';
    const m=label.match(/하이라이트\s+(\d+)개/);
    return{
      page:Number(root?.dataset.page)||0,
      pages:Number(root?.dataset.pages)||0,
      autoLocated:root?.dataset.autoLocated==='true',
      hits:Number(m?.[1]||0),
      label,
      canvas:root?.querySelectorAll('canvas').length||0
    };
  });
  assert(result.canvas===1,id+' renders official PDF through PDF.js');
  assert(result.page>0&&result.pages>=result.page,id+' exposes a valid PDF page '+result.label);
  assert(result.hits>0,id+' highlights matching official text');
  if(anchored)assert(result.page===before.from,id+' opens exact anchored page '+before.from);
  else assert(result.autoLocated,id+' auto-locates a real official page when anchor is pending');

  const response=seen.find(x=>x.status===200||x.status===206);
  assert(!!response,id+' fetched official PDF proxy successfully');
  assert(/application\/pdf/i.test(response.type),id+' proxy normalizes verified PDF MIME for browser');
  page.off('response',listener);

  if(pager&&result.page>1&&result.page<result.pages){
    const prev=result.page-1;
    await page.locator('[data-pdf-page="-1"]').click();
    await page.waitForFunction(n=>Number(document.querySelector('#pdfEvidence')?.dataset.page)===n,prev,{timeout:180000});
    assert(true,id+' previous-page control works');
    await page.locator('[data-pdf-page="1"]').click();
    await page.waitForFunction(n=>Number(document.querySelector('#pdfEvidence')?.dataset.page)===n,result.page,{timeout:180000});
    assert(true,id+' next-page control works');
  }
  await page.locator('[data-pdf-close]').click();
  await page.waitForFunction(()=>!document.querySelector('#pdfEvidence'));
  assert(true,id+' close returns to textbook');
  console.log('LIVE_EVIDENCE',JSON.stringify({id,doc,before,result,response}));
}

const browser=await chromium.launch({headless:true});
try{
  const desktop=await browser.newContext({viewport:{width:1440,height:900}});
  const dp=await desktop.newPage(),derr=collectErrors(dp);
  await boot(dp);
  const identity=await dp.evaluate(()=>({
    brand:document.title,
    exactHead:window.AITUTOR_V9_CONFIG?.exactHead||'',
    proxy:window.AITUTOR_V9_CONFIG?.officialPdfProxyBase||''
  }));
  assert(identity.brand.includes('119'),'live desktop brand is 119');
  if(expectedAppHead)assert(identity.exactHead===expectedAppHead,'live preview serves expected runtime head '+expectedAppHead);
  assert(identity.proxy==='https://study-119-pdf-proxy.vercel.app','live preview points to dedicated official PDF proxy');
  await enterStudy(dp);await noX(dp,'live desktop');
  assert(await dp.locator('.study-rail').isVisible(),'live desktop keeps 119 assistant rail');
  assert(derr.length===0,'live desktop runtime errors = 0 '+derr.join(' | '));
  await desktop.close();

  const tablet=await browser.newContext({viewport:{width:900,height:1180}});
  const tp=await tablet.newPage(),terr=collectErrors(tp);
  await boot(tp);await enterStudy(tp);await noX(tp,'live tablet');
  assert(await tp.locator('.study-mainpane').isVisible(),'live tablet keeps textbook pane');
  assert(await tp.locator('.study-rail').isHidden(),'live tablet hides desktop assistant rail');
  assert(terr.length===0,'live tablet runtime errors = 0 '+terr.join(' | '));
  await tablet.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const mp=await mobile.newPage(),merr=collectErrors(mp);
  mp.setDefaultTimeout(60000);
  await boot(mp);await enterStudy(mp);await noX(mp,'live mobile');
  assert(await mp.locator('.book-mobile').isVisible(),'live mobile uses one-scroll electronic textbook');
  assert(await mp.locator('.study-rail').isHidden(),'live mobile hides desktop rail');

  await openEvidence(mp,'E24-C03','ems',{anchored:true,pager:true});
  await openEvidence(mp,'F03-C06','fire1',{anchored:true});
  await openEvidence(mp,'F04-C04','fire2',{anchored:true});
  await openEvidence(mp,'F01-C01','law2',{anchored:true});
  await openEvidence(mp,'F02-C03','law5',{anchored:true});
  await openEvidence(mp,'F07-C19','prevention1',{anchored:false});

  await noX(mp,'live mobile after evidence');
  assert(merr.length===0,'live mobile runtime errors = 0 '+merr.join(' | '));
  await mobile.close();
  console.log('V9_LIVE_PREVIEW_ACCEPTANCE_SUCCESS');
} finally {
  await browser.close();
}
