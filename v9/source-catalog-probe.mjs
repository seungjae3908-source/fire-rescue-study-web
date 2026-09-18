const base='https://www.nfa.go.kr';
const board='bbs_0000000000000035';
const listing=`${base}/nfsa/releaseinformation/archive/materials/`;
const defs=[
  {key:'ems',cnt:'106811',markers:['소방전술3','pdf']},
  {key:'fire1',cnt:'106809',markers:['소방전술1','pdf']},
  {key:'prevention',cnt:'106805',markers:['예방실무','pdf']},
  {key:'laws',cnt:'106806',markers:['소방법령','pdf']}
];
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const stripSession=x=>x.replace(/;jsessionid=[^?'"\s]+/gi,'');
const common={'user-agent':'Mozilla/5.0 119-study-source-probe/4.0','accept-language':'ko-KR,ko;q=0.9','accept':'text/html,application/xhtml+xml'};
const listRes=await fetch(listing,{headers:common,redirect:'follow'});
const setCookies=listRes.headers.getSetCookie?.()||[listRes.headers.get('set-cookie')].filter(Boolean);
const cookie=setCookies.map(x=>x.split(';')[0]).join('; ');
console.log('SESSION_PRIME',listRes.status,'COOKIE',cookie? 'PRESENT':'MISSING');
function urls(cnt){return[
  `${base}/nfsa/releaseinformation/archive/materials/?boardId=${board}&category=&cntId=${cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=`,
  `${base}/nfsa/releaseinformation/archive/materials/?boardId=${board}&cntId=${cnt}&mode=view`
]}
for(const def of defs){
  let html='',used='',status=0;
  for(const url of urls(def.cnt)){
    try{
      const res=await fetch(url,{headers:{...common,...(cookie?{cookie}:{}),referer:listing},redirect:'follow'});
      const body=await res.text();
      if(res.ok&&def.markers.every(x=>body.toLowerCase().includes(x.toLowerCase()))){html=body;used=url;status=res.status;break}
      console.log('SOURCE_ATTEMPT',def.key,res.status,url);
    }catch(e){console.log('SOURCE_ATTEMPT_ERROR',def.key,String(e?.message||e))}
  }
  if(!html){console.log('SOURCE_UNRESOLVED',def.key);continue}
  const attachments=[];
  const names=[...html.matchAll(/<span[^>]*class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/gi)].map(m=>clean(m[1]));
  const paths=[...html.matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)].map(m=>stripSession(clean(m[1]))).filter(x=>x.includes('/board/file/'));
  for(let i=0;i<Math.max(names.length,paths.length);i++){
    const name=names[i]||'',path=paths[i]||'';
    if(name&&path)attachments.push({name,path,url:path.startsWith('http')?path:base+path});
  }
  console.log('SOURCE_CATALOG',JSON.stringify({key:def.key,status,url:used,attachments},null,2));
}
