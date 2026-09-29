import crypto from 'node:crypto';

const base='https://seungjae3908-source.github.io/fire-rescue-study-web';
const repo='seungjae3908-source/fire-rescue-study-web';
const sha=process.env.BASE_SHA;
if(!sha)throw new Error('BASE_SHA_REQUIRED');

const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
const get=async(url)=>{
  const r=await fetch(url,{headers:{'cache-control':'no-cache'}});
  if(!r.ok)throw new Error(`HTTP ${r.status} ${url}`);
  return await r.text();
};

const files=['v9/app.js','v9/v54-responsive.css','v9/sw.js','v9/config.js','v9/index.html','index.html'];
for(const path of files){
  const [live,raw]=await Promise.all([
    get(`${base}/${path}?sha=${sha}`),
    get(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`)
  ]);
  if(digest(live)!==digest(raw))throw new Error(`PAGES_DRIFT ${path} live=${digest(live)} raw=${digest(raw)}`);
  console.log('PASS exact Pages asset',path,digest(live));
}

const app=await get(`${base}/v9/app.js?sha=${sha}`);
for(const marker of [
  'dashboard-home-compact',
  'function memberGateRequired()',
  'id="passNotePdf"',
  'data-exam-hub="mock"',
  'data-exam-hub="training"',
  'data-exam-bundle',
  'study-body-unified'
]){
  if(!app.includes(marker))throw new Error('MISSING_V73_MARKER '+marker);
  console.log('PASS V73 marker',marker);
}

const config=await get(`${base}/v9/config.js?sha=${sha}`);
for(const marker of [
  "officialPdfProxyBase:''",
  "officialMonitorApiBase:''",
  "officialPdfMirrorBase:'https://seungjae3908-source.github.io/fire-rescue-study-web/official-pdf-mirror'",
  'enableCloudSync:true'
]){
  if(!config.includes(marker))throw new Error('STATIC_COMPAT_MISSING '+marker);
  console.log('PASS static compatibility',marker);
}

const root=await get(`${base}/index.html?sha=${sha}`);
if(!root.includes('./v9/'))throw new Error('ROOT_REDIRECT_MISSING');
console.log('PASS root routes to /v9/');

console.log('GITHUB_PAGES_V73_PRODUCTION_ACCEPTANCE_SUCCESS',sha);
