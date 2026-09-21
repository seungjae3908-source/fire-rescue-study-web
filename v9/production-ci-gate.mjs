import { execFileSync } from 'node:child_process';

const REPO='seungjae3908-source/fire-rescue-study-web';
const WORKFLOW='V9 Development CI';
const POLL_MS=30_000;
const TIMEOUT_MS=12*60_000;
const isVercel=String(process.env.VERCEL||'').trim()==='1';
const ref=String(process.env.VERCEL_GIT_COMMIT_REF||'').trim();

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const gitSha=()=>{
  try{return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()}catch{return ''}
};

// Local installs are not deployments and must not contact GitHub.
if(!isVercel){
  console.log('PRODUCTION_CI_GATE_BYPASS',JSON.stringify({reason:'NOT_VERCEL'}));
  process.exit(0);
}

// A Vercel Git deployment without its branch identity is unsafe to classify.
if(!ref){
  console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'MISSING_GIT_REF'}));
  process.exit(1);
}

// Preview branches must never wait on the post-merge main gate.
if(ref!=='main'){
  console.log('PRODUCTION_CI_GATE_BYPASS',JSON.stringify({reason:'NON_MAIN',ref}));
  process.exit(0);
}

const sha=String(process.env.VERCEL_GIT_COMMIT_SHA||gitSha()).trim();
if(!/^[0-9a-f]{40}$/i.test(sha)){
  console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'MISSING_EXACT_SHA',ref}));
  process.exit(1);
}

const endpoint=`https://api.github.com/repos/${REPO}/actions/runs?head_sha=${encodeURIComponent(sha)}&event=push&per_page=20`;
const deadline=Date.now()+TIMEOUT_MS;
let transientErrors=0;

while(Date.now()<deadline){
  let response;
  try{
    response=await fetch(endpoint,{headers:{'accept':'application/vnd.github+json','user-agent':'119-study-production-ci-gate/2.0','x-github-api-version':'2022-11-28'},cache:'no-store'});
  }catch(error){
    transientErrors++;
    console.warn('PRODUCTION_CI_GATE_RETRY',JSON.stringify({reason:'FETCH_ERROR',attempt:transientErrors,error:String(error?.message||error).slice(0,180)}));
    await sleep(POLL_MS);
    continue;
  }

  if(!response.ok){
    transientErrors++;
    console.warn('PRODUCTION_CI_GATE_RETRY',JSON.stringify({reason:'GITHUB_HTTP',status:response.status,attempt:transientErrors}));
    await sleep(POLL_MS);
    continue;
  }

  transientErrors=0;
  const payload=await response.json();
  const run=(payload.workflow_runs||[])
    .filter(x=>x?.name===WORKFLOW&&x?.head_sha===sha&&x?.head_branch==='main'&&x?.event==='push')
    .sort((a,b)=>Number(b?.id||0)-Number(a?.id||0))[0];

  if(!run){
    console.log('PRODUCTION_CI_GATE_WAIT',JSON.stringify({sha,reason:'EXACT_MAIN_RUN_NOT_CREATED'}));
    await sleep(POLL_MS);
    continue;
  }

  if(run.status!=='completed'){
    console.log('PRODUCTION_CI_GATE_WAIT',JSON.stringify({sha,runId:run.id,status:run.status}));
    await sleep(POLL_MS);
    continue;
  }

  if(run.conclusion==='success'){
    console.log('PRODUCTION_CI_GATE_COMPLETE',JSON.stringify({sha,runId:run.id,conclusion:run.conclusion,htmlUrl:run.html_url}));
    process.exit(0);
  }

  console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'EXACT_MAIN_CI_NOT_SUCCESS',sha,runId:run.id,conclusion:run.conclusion,htmlUrl:run.html_url}));
  process.exit(1);
}

console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'TIMEOUT_WAITING_FOR_EXACT_MAIN_CI',sha,timeoutMs:TIMEOUT_MS}));
process.exit(1);
