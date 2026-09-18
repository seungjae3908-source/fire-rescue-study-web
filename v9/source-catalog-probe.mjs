const base='https://www.nfa.go.kr';
const board='bbs_0000000000000035';
const defs=[
  {key:'ems',cnt:'106811',markers:['소방전술3','pdf']},
  {key:'fire1',cnt:'106809',markers:['소방전술1','pdf']},
  {key:'prevention',cnt:'106805',markers:['예방실무','pdf']},
  {key:'laws',cnt:'106806',markers:['소방법령','pdf']}
];
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const stripSession=x=>x.replace(/;jsessionid=[^?'"\s]+/gi,'');
function urls(cnt){return[
  `${base}/nfsa/releaseinformation/archive/materials/?boardId=${board}&category=&cntId=${cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=`,
  `${base}/nfsa/releaseinformation/archive/materials/?boardId=${board}&cntId=${cnt}&mode=view`,
  `${base}/nfsa/releaseinformation/archive/materials/?cntId=${cnt}&mode=view`
]}
for(const def of defs){
  let html='',used='',status=0;
  for(const url of urls(def.cnt)){
    try{
      const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 119-study-source-probe/2.0','accept-language':'ko-KR,ko;q=0.9'}});
      const body=await res.text();
      if(res.ok&&def.markers.every(x=>body.toLowerCase().includes(x.toLowerCase()))){html=body;used=url;status=res.status;break}
      console.log('SOURCE_ATTEMPT',def.key,res.status,url);
    }catch(e){console.log('SOURCE_ATTEMPT_ERROR',def.key,String(e?.message||e))}
  }
  if(!html){console.log('SOURCE_UNRESOLVED',def.key);continue}
  console.log('\nSOURCE',def.key,'HTTP',status,'BYTES',html.length,'URL',used);
  const direct=[];
  for(const m of html.matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)){
    const p=stripSession(clean(m[1]));
    if(p.includes('/board/file/'))direct.push(p);
  }
  for(const m of html.matchAll(/openPdfViewer\(\s*['"][^'"]+['"]\s*,\s*['"][^'"]+['"]\s*,\s*['"]([^'"]+\.pdf)['"]/gi)){
    console.log('VIEWER_FILENAME',def.key,m[1]);
  }
  const unique=[...new Set(direct)];
  console.log('DIRECT_CANDIDATES',def.key,JSON.stringify(unique,null,2));
  for(const p of unique){
    const url=p.startsWith('http')?p:base+p;
    let res;
    try{res=await fetch(url,{method:'HEAD',redirect:'follow',headers:{'user-agent':'Mozilla/5.0 119-study-source-probe/2.0'}})}catch{}
    if(!res||!res.ok){
      try{res=await fetch(url,{redirect:'follow',headers:{Range:'bytes=0-32','user-agent':'Mozilla/5.0 119-study-source-probe/2.0'}})}catch{}
    }
    console.log('DIRECT_VERIFY',def.key,JSON.stringify({url,status:res?.status||0,type:res?.headers?.get('content-type')||'',length:res?.headers?.get('content-length')||''}));
  }
  const snippets=[];for(const m of html.matchAll(/\.pdf/gi)){const sn=clean(html.slice(Math.max(0,m.index-650),Math.min(html.length,m.index+900)));if(!snippets.includes(sn))snippets.push(sn)}
  console.log('PDF_SNIPPETS',def.key,JSON.stringify(snippets.slice(0,6),null,2));
}
