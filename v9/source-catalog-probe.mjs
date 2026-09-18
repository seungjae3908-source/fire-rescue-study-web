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
      const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 119-study-source-probe/3.0','accept-language':'ko-KR,ko;q=0.9'}});
      const body=await res.text();
      if(res.ok&&def.markers.every(x=>body.toLowerCase().includes(x.toLowerCase()))){html=body;used=url;status=res.status;break}
      console.log('SOURCE_ATTEMPT',def.key,res.status,url);
    }catch(e){console.log('SOURCE_ATTEMPT_ERROR',def.key,String(e?.message||e))}
  }
  if(!html){console.log('SOURCE_UNRESOLVED',def.key);continue}
  const attachments=[];
  const re=/Jnit_boardDownload\(\s*['"]([^'"]+)['"][\s\S]{0,900}?<span[^>]*class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/gi;
  for(const m of html.matchAll(re)){
    attachments.push({name:clean(m[2]),path:stripSession(clean(m[1]))});
  }
  if(!attachments.length){
    for(const m of html.matchAll(/<span[^>]*class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>[\s\S]{0,1000}?Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)){
      attachments.push({name:clean(m[1]),path:stripSession(clean(m[2]))});
    }
  }
  const unique=[];const seen=new Set();
  for(const a of attachments){const k=a.name+'|'+a.path;if(seen.has(k))continue;seen.add(k);unique.push({...a,url:a.path.startsWith('http')?a.path:base+a.path})}
  console.log('SOURCE_CATALOG',JSON.stringify({key:def.key,status,url:used,attachments:unique},null,2));
}
