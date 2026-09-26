import fs from 'node:fs';
import path from 'node:path';

const root=new URL('./',import.meta.url);
const html=fs.readFileSync(new URL('./index.html',root),'utf8');
const assets=[...html.matchAll(/(?:src|href)="\.\/([^"]+\.(?:js|css))"/g)].map(m=>m[1]);
const unique=[...new Set(assets)];
const externalScriptTags=[...html.matchAll(/<script\b[^>]*\bsrc="\.\/([^"]+\.js)"[^>]*>/g)];
const parserBlockingScripts=externalScriptTags.filter(x=>!/(?:^|\s)(?:defer|async)(?:\s|=|>)/i.test(x[0])).map(x=>x[1]);
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
const combinedRuntimeBytes=totalBytes+lazyQuestionBytes;
const jsCount=rows.filter(x=>x.asset.endsWith('.js')).length;
const cssCount=rows.filter(x=>x.asset.endsWith('.css')).length;
const largest=rows.slice().sort((a,b)=>b.size-a.size)[0]||{asset:'',size:0};
const limits={
  totalBytes:1850000,
  assetCount:20,
  jsCount:16,
  largestSingleAsset:250000
};
const checks={
  noDuplicateAssetTags:assets.length===unique.length,
  noParserBlockingScripts:parserBlockingScripts.length===0,
  totalPayload:totalBytes<=limits.totalBytes,
  lazyQuestionManifest:lazyQuestionAssets.length>=10&&lazyQuestionBytes>250000,
  lazyQuestionNotEager:lazyQuestionAssets.every(asset=>!unique.includes(asset)),
  assetCount:rows.length<=limits.assetCount,
  jsCount:jsCount<=limits.jsCount,
  largestSingleAsset:largest.size<=limits.largestSingleAsset,
  cssPresent:cssCount>=1
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const result={
  version:'119-performance-budget-v4-bundled-bootstrap',
  totalBytes,
  totalKiB:Math.round(totalBytes/1024),
  lazyQuestionBytes,
  lazyQuestionKiB:Math.round(lazyQuestionBytes/1024),
  combinedRuntimeBytes,
  initialHeadroomBytes:limits.totalBytes-totalBytes,
  lazyQuestionAssets:lazyQuestionAssets.length,
  parserBlockingScripts,
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
