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
const jsCount=rows.filter(x=>x.asset.endsWith('.js')).length;
const cssCount=rows.filter(x=>x.asset.endsWith('.css')).length;
const largest=rows.slice().sort((a,b)=>b.size-a.size)[0]||{asset:'',size:0};
const limits={
  totalBytes:1850000,
  assetCount:110,
  jsCount:109,
  largestSingleAsset:250000
};
const checks={
  noDuplicateAssetTags:assets.length===unique.length,
  totalPayload:totalBytes<=limits.totalBytes,
  assetCount:rows.length<=limits.assetCount,
  jsCount:jsCount<=limits.jsCount,
  largestSingleAsset:largest.size<=limits.largestSingleAsset,
  cssPresent:cssCount>=1
};
const blockers=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const result={
  version:'119-performance-budget-v1',
  totalBytes,
  totalKiB:Math.round(totalBytes/1024),
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
