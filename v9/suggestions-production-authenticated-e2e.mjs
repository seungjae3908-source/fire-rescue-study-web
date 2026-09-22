import { chromium } from 'playwright';

const base=process.env.STUDY_119_PREVIEW_URL||'https://fire-rescue-study-web.vercel.app/';
const expected=process.env.STUDY_119_EXPECTED_RUNTIME_HEAD||'';
const memberEmail=process.env.STUDY_119_MEMBER_EMAIL||'';
const memberPassword=process.env.STUDY_119_MEMBER_PASSWORD||'';
const adminEmail=process.env.STUDY_119_ADMIN_EMAIL||'';
const adminPassword=process.env.STUDY_119_ADMIN_PASSWORD||'';
const token=String(process.env.GITHUB_RUN_ID||Date.now()).replace(/[^0-9A-Za-z_-]/g,'').slice(-18);
const title='[QA] Production suggestion '+token;
const reply='[QA] 관리자 답변 '+token;
function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
if(!/^[0-9a-f]{40}$/i.test(expected))throw new Error('STUDY_119_EXPECTED_RUNTIME_HEAD_REQUIRED');
if(!memberEmail||!memberPassword||!adminEmail||!adminPassword)throw new Error('STUDY_119_SUGGESTION_ACCEPTANCE_SECRETS_REQUIRED');

async function boot(browser){
  const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',e=>errors.push('pageerror:'+e.message));
  page.on('console',m=>{if(m.type()==='error'&&!/favicon/i.test(m.text()))errors.push('console:'+m.text())});
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.Auth&&!!window.AITUTOR_V9?.Suggestions,{timeout:60000});
  const runtime=await page.evaluate(async()=>{
    const res=await fetch('/api/runtime-head',{cache:'no-store'});
    let body={};try{body=await res.json()}catch{}
    return{status:res.status,...body}
  });
  assert(runtime.status===200&&runtime.sha===expected,'authenticated suggestion test exact Production SHA');
  return{ctx,page,errors}
}
async function signIn(page,email,password,label){
  const r=await page.evaluate(async({email,password})=>{
    try{await window.AITUTOR_V9.Auth.signIn(email,password);return{ok:!!window.AITUTOR_V9.Auth.user}}
    catch(err){return{ok:false,error:String(err?.message||err)}}
  },{email,password});
  assert(r.ok,label+' signed in through Production Auth');
}
async function rows(page){
  return page.evaluate(async()=>await window.AITUTOR_V9.Suggestions.list({offset:0,limit:50}));
}

const browser=await chromium.launch({headless:true});
let member=null,admin=null,suggestionId='';
try{
  member=await boot(browser);
  await signIn(member.page,memberEmail,memberPassword,'member');
  const memberAdmin=await member.page.evaluate(()=>window.AITUTOR_V9.Suggestions.isAdmin());
  assert(memberAdmin===false,'member account is not admin');

  const created=await member.page.evaluate(async({title})=>window.AITUTOR_V9.Suggestions.create({
    category:'오류',title,body:'Production authenticated acceptance temporary row',anonymous:true
  }),{title});
  suggestionId=String(created?.id||'');
  assert(/^[0-9a-f-]{36}$/i.test(suggestionId),'member created a real temporary suggestion');
  let memberRows=await rows(member.page);
  assert(memberRows.some(x=>x.id===suggestionId&&x.status==='접수'),'member reads own newly created suggestion');

  await member.page.evaluate(()=>window.AITUTOR_V9.App.go('suggestions'));
  await member.page.waitForSelector('.suggestions-page');
  await member.page.waitForFunction(t=>(document.querySelector('.suggestions-page')?.textContent||'').includes(t),title);
  assert(await member.page.locator('[data-suggest-admin-save]').count()===0,'member UI exposes no admin controls');

  admin=await boot(browser);
  await signIn(admin.page,adminEmail,adminPassword,'admin');
  const adminFlag=await admin.page.evaluate(()=>window.AITUTOR_V9.Suggestions.isAdmin());
  assert(adminFlag===true,'admin account is recognized by live study_admins RLS');
  let adminRows=await rows(admin.page);
  assert(adminRows.some(x=>x.id===suggestionId),'admin reads member suggestion');

  const updated=await admin.page.evaluate(async({id,reply})=>window.AITUTOR_V9.Suggestions.adminReply(id,{status:'개선완료',reply}),{id:suggestionId,reply});
  assert(updated?.status==='개선완료'&&updated?.admin_reply===reply,'admin updates reply and status through Production RLS');

  memberRows=await rows(member.page);
  const memberUpdated=memberRows.find(x=>x.id===suggestionId);
  assert(memberUpdated?.status==='개선완료'&&memberUpdated?.admin_reply===reply,'member reads admin reply and final status');

  await member.page.evaluate(async id=>window.AITUTOR_V9.Suggestions.remove(id),suggestionId);
  memberRows=await rows(member.page);
  assert(!memberRows.some(x=>x.id===suggestionId),'member deletes own temporary suggestion');
  adminRows=await rows(admin.page);
  assert(!adminRows.some(x=>x.id===suggestionId),'admin no longer sees cleaned-up temporary suggestion');
  suggestionId='';

  assert(member.errors.length===0,'member Production runtime errors = 0 '+member.errors.join(' | '));
  assert(admin.errors.length===0,'admin Production runtime errors = 0 '+admin.errors.join(' | '));
  console.log('PRODUCTION_SUGGESTIONS_AUTHENTICATED_ACCEPTANCE_SUCCESS');
}finally{
  if(suggestionId){
    for(const side of [member,admin]){
      try{await side?.page?.evaluate(async id=>window.AITUTOR_V9.Suggestions.remove(id),suggestionId);suggestionId='';break}catch{}
    }
  }
  for(const side of [member,admin]){
    try{await side?.page?.evaluate(()=>window.AITUTOR_V9.Auth.signOut())}catch{}
    try{await side?.ctx?.close()}catch{}
  }
  await browser.close()
}
