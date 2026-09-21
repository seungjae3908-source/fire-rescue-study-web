import assert from 'node:assert/strict';
import handler from '../api/runtime-head.js';

function call({method='GET',env={}}={}){
  const keys=['VERCEL_GIT_COMMIT_SHA','VERCEL_GIT_COMMIT_REF','VERCEL_ENV'];
  const old=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  for(const k of keys)delete process.env[k];
  Object.assign(process.env,env);
  const headers={};
  let body='',statusCode=200;
  const res={
    setHeader:(k,v)=>headers[String(k).toLowerCase()]=String(v),
    get statusCode(){return statusCode},
    set statusCode(v){statusCode=Number(v)},
    end:v=>{body=String(v||'');return{statusCode,headers,body}}
  };
  const out=handler({method},res);
  for(const k of keys){
    if(old[k]===undefined)delete process.env[k];
    else process.env[k]=old[k];
  }
  return out;
}

const sha='0123456789abcdef0123456789abcdef01234567';
let r=call({env:{VERCEL_GIT_COMMIT_SHA:sha,VERCEL_GIT_COMMIT_REF:'main',VERCEL_ENV:'production'}});
assert.equal(r.statusCode,200);
assert.equal(JSON.parse(r.body).sha,sha);
assert.equal(JSON.parse(r.body).ref,'main');
assert.equal(JSON.parse(r.body).environment,'production');
assert.equal(r.headers['cache-control'],'no-store, max-age=0');

r=call({method:'HEAD',env:{VERCEL_GIT_COMMIT_SHA:sha}});
assert.equal(r.statusCode,200);
assert.equal(r.body,'');

r=call({env:{VERCEL_GIT_COMMIT_SHA:''}});
assert.equal(r.statusCode,503);
assert.equal(JSON.parse(r.body).error,'RUNTIME_GIT_SHA_UNAVAILABLE');

r=call({method:'POST',env:{VERCEL_GIT_COMMIT_SHA:sha}});
assert.equal(r.statusCode,405);
assert.equal(JSON.parse(r.body).error,'METHOD_NOT_ALLOWED');

console.log('RUNTIME_HEAD_API_TEST_COMPLETE');
