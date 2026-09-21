'use strict';

const TARGETS=[
  ['gosi','https://gongmuwon.gosi.kr/spcsv/indexMain3.do'],
  ['nfa-job','https://www.nfa.go.kr/nfa/news/job/nfajob/?pageIdx=1'],
  ['nfsa-job','https://www.nfa.go.kr/nfsa/news/0011/job/?pageIdx=1']
];

async function probe([id,url]){
  const started=Date.now();
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),8000);
  try{
    const r=await fetch(url,{
      redirect:'follow',
      signal:ctrl.signal,
      headers:{
        'user-agent':'119-study-official-source-probe/1.0',
        accept:'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'accept-language':'ko-KR,ko;q=0.9,en;q=0.7',
        'cache-control':'no-cache'
      }
    });
    const text=await r.text();
    return {
      id,
      url,
      ok:r.ok,
      status:r.status,
      elapsedMs:Date.now()-started,
      bytes:Buffer.byteLength(text),
      relevant:/소방공무원|채용시험|시행계획|변경공고|필기시험/.test(text),
      challenge:/방문자\s*확인|checking your browser|verify you are human|captcha|challenge-platform|cf-chl/i.test(text)
    };
  }catch(err){
    return {
      id,
      url,
      ok:false,
      elapsedMs:Date.now()-started,
      errorCode:String(err?.cause?.code||err?.code||err?.name||'FETCH_ERROR'),
      error:String(err?.cause?.message||err?.message||err).slice(0,180)
    };
  }finally{
    clearTimeout(timer);
  }
}

module.exports=async function handler(req,res){
  if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'METHOD_NOT_ALLOWED'})}
  const results=[];
  for(const target of TARGETS)results.push(await probe(target));
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({version:'119-official-source-probe-v1',results});
};
