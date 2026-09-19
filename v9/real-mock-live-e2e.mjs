import { chromium } from 'playwright';
const base=process.env.STUDY_119_PREVIEW_URL||'https://study-119-preview.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_APP_HEAD||'';
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900}});
 const page=await ctx.newPage(),errors=[];
 page.on('pageerror',e=>errors.push('pageerror:'+e.message));
 page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!window.AITUTOR_V9?.App&&!!window.AITUTOR_V9?.examReadiness,{timeout:60000});
 if(expected)assert(await page.evaluate(()=>window.AITUTOR_V9_CONFIG?.exactHead||'')===expected,'real-mock Preview exactHead '+expected);
 const truth=await page.evaluate(()=>{
   const V=window.AITUTOR_V9,r=V.examReadiness(),ids=V.RestoredFireVerified119?.ids||[];
   return{r,verified:ids.map(id=>{const q=V.questionById[id];return{id,grade:q?.grade,source:q?.source,pageVerified:q?.pageVerified,reviewStatus:q?.reviewStatus,exam:V.QuestionQuality119.isExamStyle(q)}})};
 });
 assert(truth.r.ready===true&&truth.r.scopeComplete===true&&truth.r.missingFireScopes.length===0,'real mock readiness is true with no missing fire scope');
 assert(truth.verified.length===6&&truth.verified.every(q=>q.grade==='B'&&q.pageVerified===true&&q.reviewStatus==='manual-reviewed'&&q.exam),'six restored-scope B questions retain exact-page reviewed evidence');
 await page.evaluate(()=>window.AITUTOR_V9.App.go('exam'));
 await page.waitForSelector('.page');
 const text=await page.locator('.page').textContent();
 assert(!text.includes('실전모드 잠금'),'deployed Preview does not show real-mock lock');
 assert(await page.locator('[data-exam-start="real"]').count()===1,'deployed Preview shows real-mock start button');
 await page.locator('[data-exam-start="real"]').click();
 await page.waitForSelector('[data-exam-answer]',{timeout:60000});
 const integrity=await page.evaluate(()=>{
   const qs=window.AITUTOR_V9.App.runtime.exam.qs,fire=qs.filter(q=>q.subject==='fire');
   return{
    total:qs.length,unique:new Set(qs.map(q=>q.id)).size,
    fire:fire.length,ems:qs.filter(q=>q.subject==='ems').length,
    pGrade:qs.filter(q=>q.grade==='P').length,
    grades:[...new Set(qs.map(q=>q.grade))].sort(),
    fireScopes:[...new Set(fire.map(q=>q.scopeId))].sort()
   };
 });
 assert(integrity.total===65&&integrity.unique===65&&integrity.fire===25&&integrity.ems===40,'deployed real mock is 65 unique questions with 25+40 split');
 assert(integrity.pGrade===0&&integrity.grades.every(g=>g==='A'||g==='B'),'deployed real mock contains A/B evidence only');
 assert(['F01','F02','F03','F04','F05','F06','F07'].every(s=>integrity.fireScopes.includes(s)),'deployed real mock fire set includes every F01-F07 scope');
 assert(errors.length===0,'deployed real-mock runtime errors = 0 '+errors.join(' | '));
 console.log('REAL_MOCK_LIVE_ACCEPTANCE_SUCCESS',JSON.stringify({truth,integrity}));
 await ctx.close();
}finally{await browser.close()}
