import { randomUUID, randomBytes } from 'node:crypto';

const base='https://petlfbztqguuzkasfpug.supabase.co';
const key='sb_publishable_CxNMo2idqoaYJvbm8FTX8w_hre1kQ-c';
const marker='study-v13-rls-live-20260920';
const email=`rlsqa-${randomUUID()}@gmail.com`;
const password='Aa9!'+randomBytes(18).toString('base64url');
const headers={'apikey':key,'content-type':'application/json'};
const json=async r=>{let d=null;try{d=await r.json()}catch{}return d};
const fail=(msg,extra='')=>{throw new Error(msg+(extra?' · '+extra:''))};

console.log('RLS_LIVE_QA start');

const signup=await fetch(base+'/auth/v1/signup',{method:'POST',headers,body:JSON.stringify({email,password,data:{app_scope:'study-v9',qa_marker:marker}})});
const signupBody=await json(signup);
if(!signup.ok)fail('signup failed',signupBody?.message||signupBody?.msg||signup.status);
console.log('PASS signup http');

const login=await fetch(base+'/auth/v1/token?grant_type=password',{method:'POST',headers,body:JSON.stringify({email,password})});
const loginBody=await json(login);
if(!login.ok||!loginBody?.access_token||!loginBody?.user?.id)fail('actual password login failed',loginBody?.message||loginBody?.msg||login.status);
console.log('PASS actual password login');

const token=loginBody.access_token,uid=loginBody.user.id,id=randomUUID();
const authHeaders={...headers,authorization:'Bearer '+token};
const row={id,user_id:uid,category:'오류',title:'RLS staging runtime acceptance',body:'Actual authenticated insert/read acceptance row; removed after verification.',anonymous:true,status:'접수',admin_reply:''};

const ins=await fetch(base+'/rest/v1/study_suggestions',{method:'POST',headers:{...authHeaders,prefer:'return=representation'},body:JSON.stringify(row)});
const insBody=await json(ins);
if(ins.status!==201||!Array.isArray(insBody)||insBody.length!==1)fail('authenticated insert failed',insBody?.message||insBody?.code||ins.status);
console.log('PASS authenticated INSERT');

const sel=await fetch(base+`/rest/v1/study_suggestions?id=eq.${encodeURIComponent(id)}&select=id,user_id,title,status`,{headers:authHeaders});
const selBody=await json(sel);
if(!sel.ok||!Array.isArray(selBody)||selBody.length!==1||selBody[0]?.user_id!==uid||selBody[0]?.status!=='접수')fail('owner SELECT failed',selBody?.message||selBody?.code||sel.status);
console.log('PASS owner SELECT');

const del=await fetch(base+`/rest/v1/study_suggestions?id=eq.${encodeURIComponent(id)}`,{method:'DELETE',headers:{...authHeaders,prefer:'return=minimal'}});
if(del.status!==204)fail('owner DELETE cleanup failed',del.status);
console.log('PASS owner DELETE cleanup');

const post=await fetch(base+`/rest/v1/study_suggestions?id=eq.${encodeURIComponent(id)}&select=id`,{headers:authHeaders});
const postBody=await json(post);
if(!post.ok||!Array.isArray(postBody)||postBody.length!==0)fail('post-delete verification failed',post.status);
console.log('PASS post-delete zero rows');

await fetch(base+'/auth/v1/logout',{method:'POST',headers:authHeaders}).catch(()=>{});
console.log('RLS_LIVE_QA_SUCCESS');
