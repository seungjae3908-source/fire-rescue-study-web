import { chromium } from 'playwright';

const base=process.env.STUDY_119_V67_URL||'http://127.0.0.1:4173/v9/index.html';
const failures=[];
const warnings=[];
function check(v,m,meta={}){if(v)console.log('PASS',m);else{const row={message:m,...meta};failures.push(row);console.error('V67_FAIL',JSON.stringify(row))}return v}
async function settle(page,ms=100){await page.waitForTimeout(ms);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))}
async function go(page,route){
  await page.evaluate(route=>window.AITUTOR_V9.App.go(route),route);
  await page.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);
  await page.waitForSelector('.page',{state:'visible',timeout:30000});
  await settle(page);
}
async function setStudyTab(page,tab){
  await page.evaluate(tab=>{const V=window.AITUTOR_V9;V.Store.state.page='study';V.Store.state.studyTab=tab;V.Store.save();V.App.render()},tab);
  await page.waitForFunction(tab=>window.AITUTOR_V9.Store.state.page==='study'&&window.AITUTOR_V9.Store.state.studyTab===tab,tab);
  await settle(page);
}
async function auditVisible(page,{label,width,mobile}){
  const result=await page.locator('.page').evaluate((root,{width,mobile})=>{
    const visible=el=>{
      if(el.closest('.outline:not(.open),.backdrop:not(.on),[hidden],.hidden'))return false;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      return cs.display!=='none'&&cs.visibility!=='hidden'&&Number(cs.opacity)!==0&&r.width>0&&r.height>0&&r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight;
    };
    const interactive='button,a[href],input,select,textarea,[role="button"],[tabindex]:not([tabindex="-1"])';
    const horizontalHost=el=>{for(let p=el.parentElement;p&&p!==root.parentElement;p=p.parentElement){const cs=getComputedStyle(p);if(['auto','scroll'].includes(cs.overflowX)&&p.scrollWidth>p.clientWidth+2)return true}return false};
    const rows=[root,...root.querySelectorAll('*')].filter(visible);
    const outside=[],clipped=[],touch=[],micro=[],fixed=[],tables=[];
    for(const el of rows){
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el),txt=(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,100);
      if((r.left<-2||r.right>innerWidth+2)&&!horizontalHost(el))outside.push({tag:el.tagName,cls:String(el.className||'').slice(0,90),txt,left:Math.round(r.left),right:Math.round(r.right),vw:innerWidth});
      if(txt&&!el.matches('input,textarea,select')&&el.scrollWidth>el.clientWidth+3&&['hidden','clip'].includes(cs.overflowX))clipped.push({type:'x',tag:el.tagName,cls:String(el.className||'').slice(0,90),txt,sw:el.scrollWidth,cw:el.clientWidth});
      if(txt&&el.scrollHeight>el.clientHeight+3&&['hidden','clip'].includes(cs.overflowY)&&!['INPUT','TEXTAREA','SELECT'].includes(el.tagName))clipped.push({type:'y',tag:el.tagName,cls:String(el.className||'').slice(0,90),txt,sh:el.scrollHeight,ch:el.clientHeight});
      if(width<=1024&&el.matches(interactive)&&!el.disabled){
        if(r.height<43.5)touch.push({tag:el.tagName,cls:String(el.className||'').slice(0,90),txt,h:Math.round(r.height*10)/10,w:Math.round(r.width*10)/10});
      }
      if(txt&&el.matches('.page p,.page li,.question-stem,.detail-copy,.detail-plain-list li,.bank-question-body,.exam-question-text')){
        const fs=parseFloat(cs.fontSize)||0;
        if(fs&&fs<13.5)micro.push({tag:el.tagName,cls:String(el.className||'').slice(0,90),txt,fs});
      }
      if(['fixed','sticky'].includes(cs.position)){
        if(r.top<-2||r.left<-2||r.right>innerWidth+2||r.bottom>innerHeight+2)fixed.push({cls:String(el.className||'').slice(0,90),txt,pos:cs.position,top:Math.round(r.top),bottom:Math.round(r.bottom),left:Math.round(r.left),right:Math.round(r.right),vw:innerWidth,vh:innerHeight});
      }
      if(el.tagName==='TABLE'){
        const host=el.parentElement,hs=host?getComputedStyle(host):null;
        if(el.scrollWidth>(host?.clientWidth||0)+3&&!['auto','scroll'].includes(hs?.overflowX||''))tables.push({cls:String(el.className||'').slice(0,90),table:el.scrollWidth,host:host?.clientWidth||0,overflow:hs?.overflowX||''});
      }
    }
    const doc={html:[document.documentElement.scrollWidth,document.documentElement.clientWidth],body:[document.body.scrollWidth,document.body.clientWidth]};
    const nav=document.querySelector('.mobile-nav');
    const owner=root.querySelector('[data-scroll-owner]:not([hidden])');
    let bottomChrome=null;
    if(mobile&&nav&&visible(nav)&&owner&&visible(owner)){
      const n=nav.getBoundingClientRect(),o=owner.getBoundingClientRect();
      if(o.bottom>n.top+2)bottomChrome={owner:owner.getAttribute('data-scroll-owner')||'',ownerBottom:Math.round(o.bottom),navTop:Math.round(n.top)};
    }
    const hugeGaps=[];
    const cards=[...root.querySelectorAll('.card,.lesson-box,.detail-section,.question-card,.resource-card,.settings-card,.stats-card')].filter(visible);
    for(const card of cards){
      const r=card.getBoundingClientRect(),txt=(card.textContent||'').replace(/\s+/g,' ').trim();
      if(r.height>Math.max(650,innerHeight*.9)&&txt.length<120)hugeGaps.push({cls:String(card.className||'').slice(0,90),h:Math.round(r.height),chars:txt.length});
    }
    return{outside,clipped,touch,micro,fixed,tables,doc,bottomChrome,hugeGaps};
  },{width,mobile});
  check(result.doc.html[0]<=result.doc.html[1]+1&&result.doc.body[0]<=result.doc.body[1]+1,label+' document has no horizontal overflow',{doc:result.doc});
  check(result.outside.length===0,label+' visible content stays inside viewport',{samples:result.outside.slice(0,8),count:result.outside.length});
  check(result.clipped.length===0,label+' visible learner text is not clipped',{samples:result.clipped.slice(0,8),count:result.clipped.length});
  check(result.touch.length===0,label+' primary visible controls keep >=44px height',{samples:result.touch.slice(0,8),count:result.touch.length});
  check(result.micro.length===0,label+' learner body copy keeps >=14px class',{samples:result.micro.slice(0,8),count:result.micro.length});
  check(result.fixed.length===0,label+' fixed/sticky UI stays inside viewport',{samples:result.fixed.slice(0,8),count:result.fixed.length});
  check(result.tables.length===0,label+' wide tables have an explicit horizontal-scroll host',{samples:result.tables.slice(0,8),count:result.tables.length});
  check(!result.bottomChrome,label+' bottom navigation does not cover page owner',result.bottomChrome||{});
  check(result.hugeGaps.length===0,label+' cards do not create large empty vertical dead zones',{samples:result.hugeGaps.slice(0,5),count:result.hugeGaps.length});
}
async function seed(page){
  await page.evaluate(async()=>{
    const V=window.AITUTOR_V9;await V.Lazy119.ensureQuestions();
    const q=V.questions.find(x=>V.QuestionQuality119?.isExamStyle?.(x)!==false);
    if(q){
      V.Store.state.conceptId=q.conceptId;V.Store.state.subject=q.subject;V.Store.state.scopeId=q.scopeId;
      V.Store.state.chat=Array.from({length:10},(_,i)=>({id:'v67-'+i,role:'assistant',conceptId:q.conceptId,text:'V67 실제 사용성 점검 '+i+' '+('가독성과 배치 확인용 문장입니다. '.repeat(6)),at:Date.now()+i}));
    }
    V.Store.save();V.App.render();
  });
  await settle(page);
}
const browser=await chromium.launch({headless:true});
try{
  const viewports=[
    {width:390,height:844,mobile:true},
    {width:768,height:1024,mobile:false},
    {width:1024,height:768,mobile:false},
    {width:1440,height:900,mobile:false}
  ];
  for(const vp of viewports){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.mobile,hasTouch:vp.mobile,serviceWorkers:'block'});
    const page=await ctx.newPage();page.setDefaultTimeout(45000);
    const runtimeErrors=[];
    page.on('pageerror',e=>runtimeErrors.push('pageerror:'+e.message));
    page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))runtimeErrors.push('console:'+m.text())});
    await page.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
    await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>!!window.AITUTOR_V9?.App,{timeout:60000});
    await seed(page);

    for(const route of ['home','notes','bank','exam','wrong','stats','resources','suggestions','settings']){
      await go(page,route);
      await auditVisible(page,{label:route+' '+vp.width,width:vp.width,mobile:vp.mobile});
    }

    await go(page,'study');
    for(const tab of ['core','detail','quiz','source','ai']){
      await setStudyTab(page,tab);
      const tabCount=await page.locator('[data-study-tab]:visible').count();
      check(tabCount===5,'study '+tab+' exposes all five tabs '+vp.width,{tabCount});
      await auditVisible(page,{label:'study '+tab+' '+vp.width,width:vp.width,mobile:vp.mobile});
      if(tab==='detail'){
        const toc=page.locator('.detail-toc:visible,.detail-toc-chip:visible');
        check(await toc.count()>0,'study detail exposes visible structured navigation '+vp.width);
      }
      if(tab==='ai'){
        const compose=page.locator('.tutor-compose:visible');
        if(await compose.count()){
          const box=await compose.boundingBox();
          check(!!box&&box.x>=-2&&box.x+box.width<=vp.width+2,'AI compose stays horizontally contained '+vp.width,{box});
        }
      }
    }

    await go(page,'exam');
    const start=page.locator('[data-training-start="fire50"]:visible');
    if(await start.count()){
      await start.click();await page.waitForSelector('.exam-run-workspace',{timeout:30000});await settle(page);
      await auditVisible(page,{label:'active exam '+vp.width,width:vp.width,mobile:vp.mobile});
      const footer=page.locator('.exam-footer:visible');
      if(await footer.count()){
        const box=await footer.boundingBox();
        check(!!box&&box.x>=-2&&box.x+box.width<=vp.width+2&&box.height>=44,'active exam footer remains horizontally contained and usable '+vp.width,{box});
      }
    }else warnings.push({message:'fire50 start control not visible',width:vp.width});

    check(runtimeErrors.length===0,'runtime/console errors are zero '+vp.width,{errors:runtimeErrors});
    await ctx.close();
  }
  if(warnings.length)console.log('V67_WARNINGS',JSON.stringify(warnings));
  if(failures.length)throw new Error('V67_REAL_UX_FAILURES '+JSON.stringify(failures));
  console.log('V67_WHOLE_APP_REAL_UX_AUDIT_SUCCESS');
}finally{await browser.close()}
