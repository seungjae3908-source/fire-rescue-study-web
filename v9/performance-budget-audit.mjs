import fs from 'node:fs';
import path from 'node:path';

const root=new URL('./',import.meta.url);
const html=fs.readFileSync(new URL('./index.html',root),'utf8');
const assets=[...html.matchAll(/(?:src|href)="\.\/([^"]+\.(?:js|css))"/g)].map(m=>m[1]);
const unique=[...new Set(assets)];
const rows=unique.map(asset=>{
  const file=new URL('./'+asset,root);
  const size=fs.statSync(file).size;
  return{asset,size};
});
const totalBytes=rows.reduce((a,x)=>a+x.size,0);
const lazySource=fs.readFileSync(new URL('./lazy-loader-119.js',root),'utf8');
const lazyMatch=lazySource.match(/const QUESTION_FILES=\[([\s\S]*?)\];/);
const lazyQuestionAssets=[...(lazyMatch?.[1]||'').matchAll(/'([^']+\.js)'/g)].map(m=>m[1]);
const lazyRows=lazyQuestionAssets.map(asset=>({asset,size:fs.statSync(new URL('./'+asset,root)).size}));
const lazyQuestionBytes=lazyRows.reduce((a,x)=>a+x.size,0);
const precomputedMatch=lazySource.match(/const PRECOMPUTED_FILES=\[([^\]]+)\]/);
const precomputedAssets=[...(precomputedMatch?.[1]||'').matchAll(/[\"']([^\"']+\.(?:js|json))[\"']/g)].map(m=>m[1]);
const lazyCoreAssets=[...(lazySource.match(/const CONTENT_FILE='([^']+)'/)?.slice(1)||[]),...(lazySource.match(/const BANK_BASE_FILE='([^']+)'/)?.slice(1)||[]),...precomputedAssets,...(lazySource.match(/const QUESTION_CONTRACT_FILE='([^']+)'/)?.slice(1)||[]),...(lazySource.match(/const QUESTION_POST_FILE='([^']+)'/)?.slice(1)||[])];
const lazyCoreRows=lazyCoreAssets.map(asset=>({asset,size:fs.statSync(new URL('./'+asset,root)).size}));
const lazyCoreBytes=lazyCoreRows.reduce((a,x)=>a+x.size,0);
const combinedRuntimeBytes=totalBytes+lazyQuestionBytes+lazyCoreBytes;
const jsCount=rows.filter(x=>x.asset.endsWith('.js')).length;
const cssCount=rows.filter(x=>x.asset.endsWith('.css')).length;
const largest=rows.slice().sort((a,b)=>b.size-a.size)[0]||{asset:'',size:0};
const limits={
  totalBytes:850000,
  assetCount:110,
  jsCount:12,
  largestSingleAsset:250000
};
const checks={
  noDuplicateAssetTags:assets.length===unique.length,
  totalPayload:totalBytes<=limits.totalBytes,
  lazyQuestionManifest:lazyQuestionAssets.length>=10&&lazyQuestionBytes>250000,
  lazyQuestionNotEager:lazyQuestionAssets.every(asset=>!unique.includes(asset)),
  lazyCoreManifest:lazyCoreAssets.length===10&&precomputedAssets.length===6&&lazyCoreBytes>4000000,
  lazyCoreNotEager:lazyCoreAssets.every(asset=>!unique.includes(asset)),
  assetCount:rows.length<=limits.assetCount,
  jsCount:jsCount<=limits.jsCount,
  largestSingleAsset:largest.size<=limits.largestSingleAsset,
  cssPresent:cssCount>=1
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const result={
  version:'119-performance-budget-v5-json-precomputed',
  totalBytes,
  totalKiB:Math.round(totalBytes/1024),
  lazyQuestionBytes,
  lazyQuestionKiB:Math.round(lazyQuestionBytes/1024),
  lazyCoreBytes,
  lazyCoreKiB:Math.round(lazyCoreBytes/1024),
  precomputedAssets:precomputedAssets.length,
  combinedRuntimeBytes,
  initialHeadroomBytes:limits.totalBytes-totalBytes,
  lazyQuestionAssets:lazyQuestionAssets.length,
  assetCount:rows.length,
  jsCount,
  cssCount,
  largest,
  limits,
  checks,
  blockers,
  ready:blockers.length===0
};
console.log('PERFORMANCE_BUDGET_119',JSON.stringify(result,null,2));
if(blockers.length)throw new Error('PERFORMANCE_BUDGET_FAILED '+JSON.stringify(blockers));
console.log('PERFORMANCE_BUDGET_COMPLETE');
// Exact-head performance-budget regression trigger.
