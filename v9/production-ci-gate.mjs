import { execFileSync } from 'node:child_process';

const REPO='seungjae3908-source/fire-rescue-study-web';
const WORKFLOW='V9 Development CI';
const POLL_MS=30_000;
const TIMEOUT_MS=12*60_000;
const NON_MAIN_CONFIRMATIONS_REQUIRED=2;

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const gitSha=()=>{
  try{return execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim()}catch{return ''}
};

// `installCommand` runs inside Vercel after the repository checkout. Do not rely on
// Vercel System Environment Variables here: projects can disable automatic exposure.
// Exact checkout identity is the fail-closed source of truth.
const sha=String(process.env.VERCEL_GIT_COMMIT_SHA||gitSha()).trim();
if(!/^[0-9a-f]{40}$/i.test(sha)){
  console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'MISSING_EXACT_SHA'}));
  process.exit(1);
}

const runsEndpoint=`https://api.github.com/repos/${REPO}/actions/runs?head_sha=${encodeURIComponent(sha)}&event=push&per_page=20`;
const mainRefEndpoint=`https://api.github.com/repos/${REPO}/git/ref/heads/main`;
const headers={
  'accept':'application/vnd.github+json',
  'user-agent':'119-study-production-ci-gate/3.0',
  'x-github-api-version':'2022-11-28'
};
const deadline=Date.now()+TIMEOUT_MS;
let transientErrors=0;
let nonMainConfirmations=0;

const fetchJson=async url=>{
  const response=await fetch(url,{headers,cache:'no-store'});
  if(!response.ok)throw new Error(`GITHUB_HTTP_${response.status}`);
  return response.json();
};

while(Date.now()<deadline){
  let payload;
  try{
    payload=await fetchJson(runsEndpoint);
  }catch(error){
    transientErrors++;
    console.warn('PRODUCTION_CI_GATE_RETRY',JSON.stringify({reason:'RUNS_FETCH',attempt:transientErrors,error:String(error?.message||error).slice(0,180)}));
    await sleep(POLL_MS);
    continue;
  }

  transientErrors=0;
  const run=(payload.workflow_runs||[])
    .filter(x=>x?.name===WORKFLOW&&x?.head_sha===sha&&x?.head_branch==='main'&&x?.event==='push')
    .sort((a,b)=>Number(b?.id||0)-Number(a?.id||0))[0];

  if(run){
    nonMainConfirmations=0;
    if(run.status!=='completed'){
      console.log('PRODUCTION_CI_GATE_WAIT',JSON.stringify({sha,runId:run.id,status:run.status,reason:'EXACT_MAIN_CI_IN_PROGRESS'}));
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

  // A main deployment may start a few seconds before the push workflow is visible.
  // Compare the checked-out SHA with GitHub's canonical main ref and wait if equal.
  let currentMainSha='';
  try{
    const mainRef=await fetchJson(mainRefEndpoint);
    currentMainSha=String(mainRef?.object?.sha||'').trim();
  }catch(error){
    transientErrors++;
    console.warn('PRODUCTION_CI_GATE_RETRY',JSON.stringify({reason:'MAIN_REF_FETCH',attempt:transientErrors,error:String(error?.message||error).slice(0,180)}));
    await sleep(POLL_MS);
    continue;
  }

  if(!/^[0-9a-f]{40}$/i.test(currentMainSha)){
    console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'INVALID_MAIN_REF',sha,currentMainSha:currentMainSha||null}));
    process.exit(1);
  }

  if(currentMainSha===sha){
    nonMainConfirmations=0;
    console.log('PRODUCTION_CI_GATE_WAIT',JSON.stringify({sha,reason:'CURRENT_MAIN_RUN_NOT_CREATED'}));
    await sleep(POLL_MS);
    continue;
  }

  // No exact push/main workflow exists and this checkout is not canonical main.
  // Confirm twice to avoid a race where main advances before the workflow appears.
  nonMainConfirmations++;
  if(nonMainConfirmations<NON_MAIN_CONFIRMATIONS_REQUIRED){
    console.log('PRODUCTION_CI_GATE_WAIT',JSON.stringify({sha,currentMainSha,reason:'NON_MAIN_IDENTITY_GRACE',confirmation:nonMainConfirmations}));
    await sleep(POLL_MS);
    continue;
  }

  console.log('PRODUCTION_CI_GATE_BYPASS',JSON.stringify({sha,currentMainSha,reason:'NON_MAIN_NO_PUSH_MAIN_RUN'}));
  process.exit(0);
}

console.error('PRODUCTION_CI_GATE_FAILED',JSON.stringify({reason:'TIMEOUT_WAITING_FOR_EXACT_MAIN_CI',sha,timeoutMs:TIMEOUT_MS}));
process.exit(1);
