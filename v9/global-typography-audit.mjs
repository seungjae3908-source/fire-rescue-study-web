import { chromium } from 'playwright';

const base='http://127.0.0.1:4173/v9/index.html';
const viewports=[
  {width:360,height:800,mobile:true},
  {width:390,height:844,mobile:true},
  {width:412,height:915,mobile:true},
  {width:768,height:1024,mobile:false}
];
const tabs=['core','detail','quiz','source'];
const maxIssues=120;
const issues=[];
const warnings=[];

function pushIssue(x){if(issues.length<maxIssues)issues.push(x)}
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
async function boot(page){
  await page.route('**/api/official-pdf?**',route=>route.fulfill({status:404,contentType:'text/plain',body:'typography-audit-no-pdf-open'}));
  await page.goto(base,{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.app');
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum);
}
async function setStudy(page,id,tab){
  await page.evaluate(({id,tab})=>{
    const V=window.AITUTOR_V9,c=V.curriculum.byId[id],s=V.Store.state;
    s.page='study';s.conceptId=id;s.scopeId=c.scopeId;s.subject=c.subject;s.studyTab=tab;s.outline=false;
    V.Store.save();V.App.render();
  },{id,tab});
  await page.waitForFunction(({id,tab})=>window.AITUTOR_V9.Store.state.conceptId===id&&window.AITUTOR_V9.Store.state.studyTab===tab,{id,tab});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}
async function auditVisible(page,meta){
  const result=await page.evaluate(()=>{
    const visible=el=>{
      if(el.closest('.outline:not(.open),.backdrop:not(.on),[hidden],.hidden'))return false;
      const cs=getComputedStyle(el),r=el.getBoundingClientRect();
      if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0||r.width<=0||r.height<=0)return false;
      return true;
    };
    const excSmall=el=>el.matches('.tiny,.muted,.eyebrow,.scope-label,.tag,.pill,.exam-answer-count small,.study-quiz-progress small,.pdf-render-meta');
    const selector='h1,h2,h3,p,li,b,strong,small,button,a,td,th,.visual-node,.hazmat-class-card,.choice,.pill,.tag,.source-law-link';
    const problems=[],small=[];
    for(const el of document.querySelectorAll(selector)){
      if(!visible(el))continue;
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el),txt=(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,120);
      const ox=cs.overflowX,oy=cs.overflowY;
      const clipX=el.scrollWidth>el.clientWidth+2&&!['auto','scroll'].includes(ox);
      const clipY=el.scrollHeight>el.clientHeight+2&&['hidden','clip'].includes(oy);
      const outsideX=r.left<-1||r.right>innerWidth+1;
      if((clipX||clipY||outsideX)&&txt)problems.push({type:clipX?'clip-x':clipY?'clip-y':'viewport-x',tag:el.tagName,cls:String(el.className||'').slice(0,80),txt,sw:el.scrollWidth,cw:el.clientWidth,sh:el.scrollHeight,ch:el.clientHeight,left:Math.round(r.left),right:Math.round(r.right),vw:innerWidth});
      const fs=parseFloat(cs.fontSize)||0;
      if(!excSmall(el)&&fs>0&&fs<11&&txt)small.push({tag:el.tagName,cls:String(el.className||'').slice(0,80),txt,fs});
    }
    const overlaps=[];
    for(const root of document.querySelectorAll('.concept-visual')){
      if(!visible(root))continue;
      const nodes=[...root.querySelectorAll('.visual-node')].filter(visible).map(x=>({el:x,r:x.getBoundingClientRect(),txt:(x.textContent||'').replace(/\s+/g,' ').trim().slice(0,100)}));
      for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
        const a=nodes[i],b=nodes[j],ix=Math.max(0,Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)),iy=Math.max(0,Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top));
        if(ix>2&&iy>2)overlaps.push({type:'visual-overlap',a:a.txt,b:b.txt,ix:Math.round(ix),iy:Math.round(iy)});
      }
    }
    const action=document.querySelector('.page-study .actionbar'),nav=document.querySelector('.mobile-nav');
    let chromeOverlap=null;
    if(action&&nav&&visible(action)&&visible(nav)){const a=action.getBoundingClientRect(),n=nav.getBoundingClientRect();if(a.bottom>n.top+1)chromeOverlap={type:'action-nav-overlap',actionBottom:a.bottom,navTop:n.top}}
    const nestedScroll=[];
    if(innerWidth<=720){
      const primary=document.querySelector('.page-study .study-body-mobile');
      if(primary&&visible(primary)){
        for(const el of primary.querySelectorAll('*')){
          if(!visible(el))continue;
          const cs=getComputedStyle(el);
          if(['auto','scroll'].includes(cs.overflowY)&&el.scrollHeight>el.clientHeight+2){
            nestedScroll.push({type:'nested-y-scroll',tag:el.tagName,cls:String(el.className||'').slice(0,100),sh:el.scrollHeight,ch:el.clientHeight});
          }
        }
      }
    }
    return{problems,small,overlaps,chromeOverlap,nestedScroll};
  });
  for(const p of result.problems)pushIssue({...meta,...p});
  for(const p of result.overlaps)pushIssue({...meta,...p});
  if(result.chromeOverlap)pushIssue({...meta,...result.chromeOverlap});
  for(const p of result.nestedScroll||[])pushIssue({...meta,...p});
  if(result.small.length)warnings.push({...meta,type:'small-font',count:result.small.length,samples:result.small.slice(0,4)});
}
async function auditExam(page,meta){
  await page.evaluate(()=>{const V=window.AITUTOR_V9;V.App.runtime.exam=null;V.App.go('exam')});
  await page.waitForSelector('.exam-start');
  await page.locator('[data-exam-start="practice"]').click();
  await page.waitForSelector('.exam-run-workspace');
  const r=await page.locator('.exam-run-workspace').evaluate(root=>{
    const vis=el=>{if(el.closest('.outline:not(.open),.backdrop:not(.on),[hidden],.hidden'))return false;const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0};
    const status=root.querySelector('.exam-answer-count'),footer=root.querySelector('.exam-footer'),buttons=[...root.querySelectorAll('.exam-footer .btn')],choices=[...root.querySelectorAll('.choice')];
    const sr=status?.getBoundingClientRect(),br=buttons.map(x=>x.getBoundingClientRect());
    const overlaps=br.length===2&&sr?(br[0].right>sr.left+1||sr.right>br[1].left+1):true;
    const textClip=status?(status.scrollWidth>status.clientWidth+2||status.scrollHeight>status.clientHeight+2):true;
    const choiceBad=choices.filter(vis).some(x=>x.scrollWidth>x.clientWidth+2||x.getBoundingClientRect().left<-1||x.getBoundingClientRect().right>innerWidth+1);
    const top=document.querySelector('.page-exam.exam-active>.top'),nav=document.querySelector('.page-exam.exam-active .mobile-nav');
    return{overlaps,textClip,choiceBad,topVisible:top&&vis(top),navVisible:nav&&vis(nav),footerWidth:footer?.getBoundingClientRect().width||0};
  });
  if(r.overlaps)pushIssue({...meta,tab:'exam',type:'exam-footer-overlap'});
  if(r.textClip)pushIssue({...meta,tab:'exam',type:'exam-answer-status-clip'});
  if(r.choiceBad)pushIssue({...meta,tab:'exam',type:'exam-choice-overflow'});
  if(r.topVisible)pushIssue({...meta,tab:'exam',type:'exam-redundant-top-visible'});
  if(r.navVisible)pushIssue({...meta,tab:'exam',type:'exam-global-nav-visible'});
  await page.evaluate(()=>{window.AITUTOR_V9.App.runtime.exam=null;window.AITUTOR_V9.App.go('home')});
}

const browser=await chromium.launch({headless:true});
try{
  let states=0;
  for(const vp of viewports){
    const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.mobile,deviceScaleFactor:vp.mobile?2:1});
    const page=await ctx.newPage();
    await boot(page);
    const ids=await page.evaluate(()=>window.AITUTOR_V9.curriculum.concepts.map(x=>x.id));
    for(const id of ids){
      for(const tab of tabs){
        await setStudy(page,id,tab);
        await auditVisible(page,{width:vp.width,id,tab});
        states++;
        if(issues.length>=maxIssues)break;
      }
      if(issues.length>=maxIssues)break;
    }
    if(vp.mobile)await auditExam(page,{width:vp.width,id:'ACTIVE-EXAM'});
    await ctx.close();
    if(issues.length>=maxIssues)break;
  }
  console.log('GLOBAL_TYPOGRAPHY_AUDIT_SUMMARY',JSON.stringify({states,issues:issues.length,warningGroups:warnings.length},null,2));
  if(warnings.length)console.error('GLOBAL_TYPOGRAPHY_AUDIT_SMALL_TEXT',JSON.stringify(warnings.slice(0,60),null,2));
  if(issues.length||warnings.length){
    if(issues.length)console.error('GLOBAL_TYPOGRAPHY_AUDIT_ISSUES',JSON.stringify(issues,null,2));
    throw new Error('GLOBAL_TYPOGRAPHY_AUDIT_FAILED '+JSON.stringify({issues:issues.length,smallTextGroups:warnings.length}));
  }
  assert(true,'all concept tabs and active exam pass global typography/layout audit with no clipping, nested mobile study scroll or sub-11px student controls');
}finally{await browser.close()}
