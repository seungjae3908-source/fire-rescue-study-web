import fs from 'node:fs';

function assert(v,m){if(!v)throw new Error(m);console.log('PASS',m)}
const root=new URL('./',import.meta.url);
const manifest=JSON.parse(fs.readFileSync(new URL('./bootstrap-v69-manifest.json',root),'utf8'));
const index=fs.readFileSync(new URL('./index.html',root),'utf8');
const sw=fs.readFileSync(new URL('./sw.js',root),'utf8');
const runtimeScripts=[...index.matchAll(/<script\b[^>]*\bsrc="\.\/([^"]+\.js)"[^>]*><\/script>/g)].map(m=>m[1]);
const flat=manifest.groups.flatMap(g=>g.sources);
assert(manifest.sourceCount===101&&flat.length===101,'bootstrap manifest contains all 101 canonical source files');
assert(new Set(flat).size===101,'bootstrap manifest source files are unique');
assert(manifest.bundleCount===11&&manifest.groups.length===11,'bootstrap runtime is split into 11 bounded bundles');
assert(JSON.stringify(runtimeScripts)===JSON.stringify(manifest.groups.map(g=>g.bundle)),'index loads only the 11 canonical bootstrap bundles in order');
assert(flat.every(x=>!runtimeScripts.includes(x)),'individual canonical source files are not network-loaded by index');

for(const group of manifest.groups){
  const label=group.bundle.match(/^boot-v69-(.+)\.js$/)?.[1];
  assert(!!label,'bundle filename follows V69 naming contract '+group.bundle);
  let expected="'use strict';\n/* V69 bootstrap bundle "+label+". Source order is canonical. */\n";
  for(const source of group.sources){
    expected+='\n;\n/* ---- '+source+' ---- */\n'+fs.readFileSync(new URL('./'+source,root),'utf8')+'\n';
  }
  const actual=fs.readFileSync(new URL('./'+group.bundle,root),'utf8');
  assert(actual===expected,'bundle is byte-for-byte regenerated from canonical sources '+group.bundle);
  assert(Buffer.byteLength(actual)<=250000,'bundle stays under 250KB '+group.bundle);
}
const core=(sw.match(/const CORE=\[([\s\S]*?)\]\s*\/\*/)||[])[1]||'';
for(const group of manifest.groups)assert(core.includes("'./"+group.bundle+"'"),'service worker precaches '+group.bundle);
assert(flat.every(x=>!core.includes("'./"+x+"'")),'service worker no longer install-precaches individual bootstrap source files');
console.log('V69_BOOTSTRAP_BUNDLE_AUDIT_SUCCESS');
