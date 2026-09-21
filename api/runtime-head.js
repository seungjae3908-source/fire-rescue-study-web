'use strict';

module.exports=function handler(req,res){
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(!['GET','HEAD'].includes(req.method||'GET')){
    res.statusCode=405;
    res.setHeader('Allow','GET, HEAD');
    return res.end(JSON.stringify({ok:false,error:'METHOD_NOT_ALLOWED'}));
  }
  const sha=String(process.env.VERCEL_GIT_COMMIT_SHA||'').trim().toLowerCase();
  const ref=String(process.env.VERCEL_GIT_COMMIT_REF||'').trim();
  const environment=String(process.env.VERCEL_ENV||'').trim();
  if(!/^[0-9a-f]{40}$/.test(sha)){
    res.statusCode=503;
    return res.end(req.method==='HEAD'?'':JSON.stringify({ok:false,error:'RUNTIME_GIT_SHA_UNAVAILABLE'}));
  }
  res.statusCode=200;
  return res.end(req.method==='HEAD'?'':JSON.stringify({ok:true,sha,ref,environment}));
};
