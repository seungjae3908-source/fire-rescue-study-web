import { chromium } from 'playwright';
const base=process.env.STUDY_119_V80_URL||'http://127.0.0.1:4173/v9/index.html';
const fails=[];const check=(v,m,x={})=>{if(v)console.log('PASS',m);else{fails.push({message:m,...x});console.error('V80_FAIL',JSON.stringify({message:m,...x}))}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function go(p,route){await p.evaluate(route=>window.AITUTOR_V9.App.go(route),route);await p.waitForFunction(route=>window.AITUTOR_V9.Store.state.page===route,route);await settle(p)}
const browser=await chromium.launch({headless:true});
try{
 for(const vp of [{width:390,height:844,label:'phone'},{width:768,height:1024,label:'tablet'},{width:1440,height:900,label:'pc'},{width:1920,height:1080,label:'large-pc'}]){
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},isMobile:vp.width<=390,hasTouch:vp.width<=768,serviceWorkers:'block'}),p=await ctx.newPage();p.setDefaultTimeout(45000);
  await p.route('**/api/official-monitor**',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,targetExamYear:'2027',contentBaselineYear:'2026',sources:[],items:[]})}));
  await p.goto(base,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>!!window.AITUTOR_V9?.App);
  await go(p,'stats');
  const stats=await p.evaluate(()=>{const g=document.querySelector('.page-stats .metric-grid'),items=[...g?.children||[]].slice(0,4);if(!g||items.length<4)return null;const cols=getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length,rects=items.map(x=>x.getBoundingClientRect());return{cols,widths:rects.map(x=>Math.round(x.width)),heights:rects.map(x=>Math.round(x.height))}});
  check(!!stats,vp.label+' stats metrics exist',stats||{});
  if(stats){const expected=vp.width>1024?4:2;check(stats.cols===expected,vp.label+' stats metrics use expected columns',{...stats,expected});check(Math.max(...stats.widths)-Math.min(...stats.widths)<=2,vp.label+' stats metric widths match',stats);if(vp.width>1024)check(Math.max(...stats.heights)-Math.min(...stats.heights)<=2,vp.label+' stats metric heights match',stats)}
  await go(p,'exam');
  const ex=await p.evaluate(()=>{const round=document.querySelector('.exam-round-picker')?.getBoundingClientRect(),diff=document.querySelector('.difficulty-picker')?.getBoundingClientRect(),real=document.querySelector('.exam-main-start')?.getBoundingClientRect(),sec=document.querySelector('.exam-secondary-actions')?.getBoundingClientRect(),practice=document.querySelector('.exam-secondary-actions>.btn:only-child')?.getBoundingClientRect();return{round:round&&{w:round.width,h:round.height},diff:diff&&{w:diff.width,h:diff.height},real:real&&{w:real.width,h:real.height},sec:sec&&{w:sec.width,h:sec.height},practice:practice&&{w:practice.width,h:practice.height}}});
  if(vp.width>720&&ex.round&&ex.diff){check(Math.abs(ex.round.h-ex.diff.h)<=2,vp.label+' round/difficulty heights match',ex);check(Math.abs(ex.round.w-ex.diff.w)<=8,vp.label+' round/difficulty widths match',ex)}
  if(ex.real&&ex.practice&&ex.sec){check(Math.abs(ex.practice.w-ex.sec.w)<=2,vp.label+' single practice button fills its cell',ex);check(Math.abs(ex.real.h-ex.practice.h)<=2,vp.label+' real/practice action heights match',ex)}
  await ctx.close();
 }
 if(fails.length)throw new Error('V80_EQUAL_CELL_FAILURES '+JSON.stringify(fails));
 console.log('V80_EQUAL_CELL_E2E_SUCCESS');
}finally{await browser.close()}
