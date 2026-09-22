import { createRemoteJWKSet, jwtVerify } from 'npm:jose@6.1.0';
import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const ISSUER='https://token.actions.githubusercontent.com';
const AUDIENCE='study-119-production-acceptance';
const REPOSITORY='seungjae3908-source/fire-rescue-study-web';
const REPOSITORY_ID='1372826486';
const OWNER='seungjae3908-source';
const OWNER_ID='301420524';
const REF='refs/heads/main';
const WORKFLOW='Production Suggestion Authenticated Acceptance';
const WORKFLOW_REF=`${REPOSITORY}/.github/workflows/production-suggestions-authenticated-acceptance.yml@${REF}`;
const JWKS=createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks`));
const SAFE_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const response=(status,body)=>new Response(JSON.stringify(body),{
  status,
  headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store, max-age=0'}
});

function env(name){
  const value=Deno.env.get(name)||'';
  if(!value)throw new Error(`MISSING_${name}`);
  return value;
}

function randomSecret(length=48){
  const bytes=new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes,b=>SAFE_ALPHABET[b%SAFE_ALPHABET.length]).join('');
}

async function verifyGithubOidc(req){
  const auth=req.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))throw new Error('OIDC_BEARER_REQUIRED');
  const token=auth.slice(7).trim();
  if(!token)throw new Error('OIDC_BEARER_REQUIRED');
  const {payload}=await jwtVerify(token,JWKS,{issuer:ISSUER,audience:AUDIENCE});
  const exact=[
    [payload.repository,REPOSITORY,'REPOSITORY'],
    [String(payload.repository_id||''),REPOSITORY_ID,'REPOSITORY_ID'],
    [payload.repository_owner,OWNER,'REPOSITORY_OWNER'],
    [String(payload.repository_owner_id||''),OWNER_ID,'REPOSITORY_OWNER_ID'],
    [payload.ref,REF,'REF'],
    [payload.ref_type,'branch','REF_TYPE'],
    [payload.workflow,WORKFLOW,'WORKFLOW'],
    [payload.workflow_ref,WORKFLOW_REF,'WORKFLOW_REF']
  ];
  for(const [actual,expected,label] of exact){
    if(String(actual||'')!==expected)throw new Error(`OIDC_${label}_MISMATCH`);
  }
  const eventName=String(payload.event_name||'');
  if(!['workflow_run','workflow_dispatch'].includes(eventName))throw new Error('OIDC_EVENT_NOT_ALLOWED');
  const runId=String(payload.run_id||'');
  if(!/^\d+$/.test(runId))throw new Error('OIDC_RUN_ID_REQUIRED');
  return{runId,eventName};
}

function adminClient(){
  return createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{
    auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
}

async function qaUsersForRun(client,runId){
  const found=[];
  for(let page=1;page<=50;page++){
    const {data,error}=await client.auth.admin.listUsers({page,perPage:1000});
    if(error)throw error;
    const users=data?.users||[];
    for(const user of users){
      const meta=user.app_metadata||{};
      if(meta.acceptance_broker===true&&meta.acceptance_repo===REPOSITORY&&String(meta.acceptance_run_id||'')===runId)found.push(user);
    }
    if(users.length<1000)break;
  }
  return found;
}

async function checkedDb(promise,label){
  const result=await promise;
  if(result.error)throw new Error(`${label}: ${result.error.message||result.error}`);
  return result.data;
}

async function cleanupRun(client,runId){
  const users=await qaUsersForRun(client,runId);
  for(const user of users){
    await checkedDb(client.from('study_suggestions').delete().eq('user_id',user.id),'CLEANUP_SUGGESTIONS');
    await checkedDb(client.from('study_admins').delete().eq('user_id',user.id),'CLEANUP_ADMIN');
    await checkedDb(client.from('study_memberships').delete().eq('user_id',user.id),'CLEANUP_MEMBERSHIP');
    const {error}=await client.auth.admin.deleteUser(user.id);
    if(error)throw new Error(`CLEANUP_AUTH_USER: ${error.message||error}`);
  }
  return users.length;
}

async function createQaUser(client,runId,role){
  const password=randomSecret();
  const nonce=randomSecret(10).toLowerCase();
  const email=`study119.qa.${runId}.${role}.${nonce}@example.com`;
  const {data,error}=await client.auth.admin.createUser({
    email,
    password,
    email_confirm:true,
    app_metadata:{
      app_scope:'study-v9-qa',
      acceptance_broker:true,
      acceptance_repo:REPOSITORY,
      acceptance_run_id:runId,
      acceptance_role:role
    },
    user_metadata:{qa:true}
  });
  if(error||!data?.user?.id)throw new Error(`CREATE_${role.toUpperCase()}_AUTH: ${error?.message||'missing user'}`);
  const id=data.user.id;
  await checkedDb(client.from('study_memberships').insert([{user_id:id,source:'production-acceptance-oidc'}]),`CREATE_${role.toUpperCase()}_MEMBERSHIP`);
  if(role==='admin')await checkedDb(client.from('study_admins').insert([{user_id:id}]),'CREATE_ADMIN_GRANT');
  return{id,email,password};
}

Deno.serve(async req=>{
  if(req.method!=='POST')return response(405,{ok:false,error:'METHOD_NOT_ALLOWED'});
  let identity;
  try{identity=await verifyGithubOidc(req)}catch(error){
    return response(403,{ok:false,error:String(error?.message||error)});
  }
  let body={};
  try{body=await req.json()}catch{return response(400,{ok:false,error:'INVALID_JSON'});}
  const action=String(body?.action||'');
  if(!['provision','cleanup'].includes(action))return response(400,{ok:false,error:'INVALID_ACTION'});
  const client=adminClient();
  try{
    if(action==='cleanup'){
      const cleaned=await cleanupRun(client,identity.runId);
      return response(200,{ok:true,action,runId:identity.runId,cleaned});
    }
    await cleanupRun(client,identity.runId);
    try{
      const member=await createQaUser(client,identity.runId,'member');
      const admin=await createQaUser(client,identity.runId,'admin');
      return response(200,{
        ok:true,
        action,
        runId:identity.runId,
        member:{email:member.email,password:member.password},
        admin:{email:admin.email,password:admin.password}
      });
    }catch(error){
      await cleanupRun(client,identity.runId).catch(()=>{});
      throw error;
    }
  }catch(error){
    return response(500,{ok:false,error:String(error?.message||error)});
  }
});
