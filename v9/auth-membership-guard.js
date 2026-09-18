'use strict';
(()=>{
const V=window.AITUTOR_V9=window.AITUTOR_V9||{};
const A=V.Auth;
if(!A)return;

async function hasStudyMembership(uid){
  if(!uid)return false;
  await A.init();
  const client=A.client;
  if(!client)return false;
  const {data,error}=await client.from('study_memberships').select('user_id').eq('user_id',uid).maybeSingle();
  if(error)throw error;
  return !!data;
}

async function rejectNonStudySession(){
  await A.init();
  const current=A.user;
  if(!current)return true;
  if(await hasStudyMembership(current.id))return true;
  await A.signOut();
  return false;
}

const rawSignIn=A.signIn.bind(A);
A.signIn=async(email,password)=>{
  const data=await rawSignIn(email,password);
  const signed=data?.user||A.user;
  if(signed&&!(await hasStudyMembership(signed.id))){
    await A.signOut();
    throw Error('STUDY_ACCOUNT_REQUIRED');
  }
  return data;
};

const rawPull=A.pull.bind(A);
A.pull=async()=>{
  if(!(await rejectNonStudySession()))throw Error('STUDY_ACCOUNT_REQUIRED');
  return rawPull();
};

const rawSync=A.syncAll.bind(A);
A.syncAll=async()=>{
  if(!(await rejectNonStudySession()))throw Error('STUDY_ACCOUNT_REQUIRED');
  return rawSync();
};

V.Auth.hasStudyMembership=hasStudyMembership;
V.Auth.rejectNonStudySession=rejectNonStudySession;
V.Auth.syncPolicy={...V.Auth.syncPolicy,dbMembershipRequired:true,membershipTable:'study_memberships',membershipPreflightBeforeAdopt:true};

// Protect against an already-persisted session from another app sharing this Supabase project.
rejectNonStudySession().catch(e=>console.warn('study membership guard failed',e));
})();
