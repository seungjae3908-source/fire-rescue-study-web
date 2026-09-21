import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync(new URL('./runtime-deps.js',import.meta.url),'utf8');
function load(hostname){
  const window={AITUTOR_V9:{}},context={window,location:{hostname},console};
  vm.createContext(context);vm.runInContext(source,context,{filename:'runtime-deps.js'});
  return window.AITUTOR_V9.RuntimeDeps
}
const local=load('127.0.0.1'),prod=load('fire-rescue-study-web.vercel.app');
assert.equal(local.localRuntime(),true);
assert.equal(prod.localRuntime(),false);
assert.equal(JSON.stringify(local.dependencyCandidates('../node_modules/x.mjs','https://cdn/x.mjs')),JSON.stringify(['../node_modules/x.mjs','https://cdn/x.mjs']));
assert.equal(JSON.stringify(prod.dependencyCandidates('../node_modules/x.mjs','https://cdn/x.mjs','https://unpkg/x.mjs')),JSON.stringify(['https://cdn/x.mjs','https://unpkg/x.mjs']));
assert.match(source,/deps\('\.\.\/node_modules\/pdfjs-dist\/build\/pdf\.min\.mjs'/);
assert.match(source,/deps\('\.\.\/node_modules\/tesseract\.js\/dist\/tesseract\.esm\.min\.js'/);
console.log('RUNTIME_DEPS_PRODUCTION_CONTRACT_COMPLETE');
