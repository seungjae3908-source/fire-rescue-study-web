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
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SupabaseLite&&!!window.AITUTOR_V9_CONFIG,{timeout:60000});
  const runtime=await page.evaluate(async()=>{
    const res=await fetch('/api/runtime-head',{cache:'no-store'});
    let body={};try{body=await res.json()}catch{}
    return{status:res.status,...body}
  });
  assert(runtime.status===200&&runtime.sha===expected,'authenticated suggestion test exact Production SHA');
  return{ctx,page,errors}
}
async function qaSignIn(page,email,password,label){
  const r=await page.evaluate(async({email,password})=>{
    const V=window.AITUTOR_V9,cfg=window.AITUTOR_V9_CONFIG||{};
    const client=V.SupabaseLite.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey||cfg.supabaseAnonKey||'');
    const signed=await client.auth.signInWithPassword({email,password});
    if(signed.error)return{ok:false,error:String(signed.error.message||signed.error)};
    window.__suggestQaClient=client;window.__suggestQaUser=signed.data?.user||null;
    return{ok:!!window.__suggestQaUser}
  },{email,password});
  assert(r.ok,label+' signed in through Production Auth without app data sync');
}
async function query(page,fn,arg){
  return page.evaluate(async({fn,arg})=>{
    const c=window.__suggestQaClient,u=window.__suggestQaUser;
    if(!c||!u)return{ok:false,error:'QA_SESSION_MISSING'};
    try{
      if(fn==='isAdmin'){const r=await c.from('study_admins').select('user_id').eq('user_id',u.id).maybeSingle();return{ok:!r.error,error:r.error?.message||'',data:!!r.data}}
      if(fn==='insert'){const r=await c.from('study_suggestions').insert([arg]);return{ok:!r.error,error:r.error?.message||''}}
      if(fn==='get'){const r=await c.from('study_suggestions').select('*').eq('id',arg).maybeSingle();return{ok:!r.error,error:r.error?.message||'',data:r.data||null}}
      if(fn==='update'){const r=await c.from('study_suggestions').update(arg.patch).eq('id',arg.id);return{ok:!r.error,error:r.error?.message||''}}
      if(fn==='delete'){const r=await c.from('study_suggestions').delete().eq('id',arg);return{ok:!r.error,error:r.error?.message||''}}
      return{ok:false,error:'UNKNOWN_QA_OP'}
    }catch(err){return{ok:false,error:String(err?.message||err)}}
  },{fn,arg})
}
async function signOut(page){try{await page.evaluate(()=>window.__suggestQaClient?.auth?.signOut())}catch{}}

const browser=await chromium.launch({headless:true});
let member=null,admin=null,suggestionId='';
try{
  member=await boot(browser);
  await qaSignIn(member.page,memberEmail,memberPassword,'member');
  let r=await query(member.page,'isAdmin');
  assert(r.ok&&r.data===false,'member account is not admin in live study_admins');

  suggestionId=await member.page.evaluate(()=>crypto.randomUUID());
  const now=new Date().toISOString();
  const memberId=await member.page.evaluate(()=>window.__suggestQaUser?.id||'');
  r=await query(member.page,'insert',{id:suggestionId,user_id:memberId,category:'오류',title,body:'Production authenticated acceptance temporary row',anonymous:true,status:'접수',admin_reply:'',created_at:now,updated_at:now});
  assert(r.ok,'member inserts own temporary suggestion through Production RLS');
  r=await query(member.page,'get',suggestionId);
  assert(r.ok&&r.data?.id===suggestionId&&r.data?.status==='접수','member reads own temporary suggestion through Production RLS');

  admin=await boot(browser);
  await qaSignIn(admin.page,adminEmail,adminPassword,'admin');
  r=await query(admin.page,'isAdmin');
  assert(r.ok&&r.data===true,'admin account is recognized by live study_admins');
  r=await query(admin.page,'get',suggestionId);
  assert(r.ok&&r.data?.id===suggestionId,'admin reads member suggestion through Production RLS');

  r=await query(admin.page,'update',{id:suggestionId,patch:{status:'개선완료',admin_reply:reply,admin_replied_at:new Date().toISOString(),updated_at:new Date().toISOString()}});
  assert(r.ok,'admin updates reply and status through Production RLS');
  r=await query(admin.page,'get',suggestionId);
  assert(r.ok&&r.data?.status==='개선완료'&&r.data?.admin_reply===reply,'admin update persists');

  r=await query(member.page,'get',suggestionId);
  assert(r.ok&&r.data?.status==='개선완료'&&r.data?.admin_reply===reply,'member reads admin reply and final status');

  r=await query(member.page,'delete',suggestionId);
  assert(r.ok,'member deletes own temporary suggestion through Production RLS');
  r=await query(admin.page,'get',suggestionId);
  assert(r.ok&&!r.data,'admin confirms temporary suggestion cleanup');
  suggestionId='';

  assert(member.errors.length===0,'member Production runtime errors = 0 '+member.errors.join(' | '));
  assert(admin.errors.length===0,'admin Production runtime errors = 0 '+admin.errors.join(' | '));
  console.log('PRODUCTION_SUGGESTIONS_AUTHENTICATED_ACCEPTANCE_SUCCESS');
}finally{
  if(suggestionId){
    for(const side of [member,admin]){
      try{const r=await query(side?.page,'delete',suggestionId);if(r?.ok){suggestionId='';break}}catch{}
    }
  }
  for(const side of [member,admin]){try{await signOut(side?.page)}catch{}try{await side?.ctx?.close()}catch{}}
  await browser.close()
}
