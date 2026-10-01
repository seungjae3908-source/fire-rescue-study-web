import { chromium } from 'playwright';
const base=process.env.STUDY_119_V79_URL||'http://127.0.0.1:4173/v9/index.html';
const failures=[];const check=(v,m,x={})=>{if(v)console.log('PASS',m);else{failures.push({message:m,...x});console.error('V79_FAIL',JSON.stringify({message:m,...x}))}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function go(p,route){await p.evaluate(route=>window.AITUTOR_V9.App.go(route),route);await p.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);await settle(p)}
async function study(p,id,tab){await p.evaluate(({id,tab})=>{const V=window.AITUTOR_V9,c=V.curriculum.concepts.find(x=>x.id===id);V.Store.state.page='study';V.Store.state.subject=c.subject;V.Store.state.scopeId=c.scopeId;V.Store.state.conceptId=id;V.Store.state.studyTab=tab;V.App.render()},{id,tab});await settle(p)}
const browser=await chromium.launch({headless:true});
try{
 for(const vp of [{width:390,height:844,label:'phone'},{width:768,height:1024,label:'tablet-portrait'},{width:1024,height:768,label:'tablet-landscape'},{width:1440,height:900,label:'pc'},{width:1920,height:1080,label:'large-pc'}]){
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<=390,hasTouch:vp.width<=1024,serviceWorkers:'block'}),p=await ctx.newPage();p.setDefaultTimeout(45000);
  const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push(m.text())});
  await p.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.curriculum?.concepts?.length);
  const first=await p.evaluate(()=>window.AITUTOR_V9.curriculum.concepts[0].id);
  const criteria=await p.evaluate(()=>{const V=window.AITUTOR_V9,old={...V.Store.state};let id='';for(const c of V.curriculum.concepts){V.Store.state.page='study';V.Store.state.subject=c.subject;V.Store.state.scopeId=c.scopeId;V.Store.state.conceptId=c.id;V.Store.state.studyTab='detail';V.App.render();if(document.querySelectorAll('.detail-criteria li').length>=4){id=c.id;break}}Object.assign(V.Store.state,old);V.App.render();return id});
  check(!!criteria,vp.label+' finds four-item detail criteria');
  if(criteria){await study(p,criteria,'detail');const m=await p.evaluate(()=>{const u=document.querySelector('.detail-criteria ul');return{cols:u?getComputedStyle(u).gridTemplateColumns.split(' ').filter(Boolean).length:0,doc:document.documentElement.scrollWidth,vw:innerWidth}});const wanted=vp.width<=720?1:vp.width<=1024?2:3;check(m.cols>=wanted&&(vp.width>1024||m.cols===wanted),vp.label+' detail cards use responsive column count',{...m,wanted});check(m.doc<=m.vw+1,vp.label+' detail has no horizontal overflow',m)}
  await study(p,first,'ai');const ai=await p.evaluate(()=>{const a=document.querySelector('.study-ai')?.getBoundingClientRect();return a?{h:a.height,vh:innerHeight}:null});check(ai&&ai.h>=Math.min(420,ai.vh*.5),vp.label+' AI occupies useful viewport height',ai||{});
  await p.evaluate(async()=>await window.AITUTOR_V9.Lazy119.ensureQuestions());await go(p,'bank');const bank=await p.evaluate(()=>{const w=document.querySelector('.bank-workspace')?.getBoundingClientRect(),q=document.querySelector('.bank-question-body .question-card')?.getBoundingClientRect();return w&&q?{w:w.width,q:q.width}:null});check(bank&&bank.q>=bank.w*(vp.width<=720?.90:vp.width<=1024?.90:.82),vp.label+' question bank uses available width',bank||{});
  await go(p,'exam');const ex=await p.evaluate(()=>{const e=document.querySelector('.exam-start');return e?{cols:getComputedStyle(e).gridTemplateColumns.split(' ').filter(Boolean).length,width:e.getBoundingClientRect().width}:null});check(ex&&ex.cols===(vp.width<=720?1:2),vp.label+' exam setup uses correct column count',ex||{});
  if(vp.width>1024){await study(p,first,'quiz');const q=await p.evaluate(()=>{const g=document.querySelector('.study-quiz-jumps'),bs=[...g?.querySelectorAll('button')||[]];if(!g||bs.length<15)return null;const gr=g.getBoundingClientRect(),a=bs[0].getBoundingClientRect(),z=bs[14].getBoundingClientRect();return{left:a.left-gr.left,right:gr.right-z.right}});check(q&&Math.abs(q.left-q.right)<=4,vp.label+' question navigator is horizontally balanced',q||{})}
  check(errors.length===0,vp.label+' has zero runtime errors',{errors});await ctx.close();
 }
 if(failures.length)throw new Error('V79_RESPONSIVE_COMPOSITION_FAILURES '+JSON.stringify(failures));
 console.log('V79_RESPONSIVE_COMPOSITION_E2E_SUCCESS');
}finally{await browser.close()}
