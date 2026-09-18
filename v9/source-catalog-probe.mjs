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
const common={'user-agent':'Mozilla/5.0 119-study-source-probe/5.0','accept-language':'ko-KR,ko;q=0.9','accept':'text/html,application/xhtml+xml'};
const listRes=await fetch(listing,{headers:common,redirect:'follow'});
await listRes.text();
console.log('SESSION_PRIME',listRes.status,'FINAL_URL',listRes.url);
const sessionUrl=new URL(listRes.url);
const sessionPath=sessionUrl.pathname.includes(';jsessionid=')?sessionUrl.pathname:'/nfsa/releaseinformation/archive/materials/';
function urls(cnt){return[
  `${base}${sessionPath}?boardId=${board}&category=&cntId=${cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=`,
  `${base}${sessionPath}?boardId=${board}&cntId=${cnt}&mode=view`,
  `${base}/nfsa/releaseinformation/archive/materials/?boardId=${board}&category=&cntId=${cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=`
]}
let unresolved=0;
for(const def of defs){
  let html='',used='',status=0;
  for(const url of urls(def.cnt)){
    try{
      const res=await fetch(url,{headers:{...common,referer:listRes.url},redirect:'follow'});
      const body=await res.text();
      const markerOk=def.markers.every(x=>body.toLowerCase().includes(x.toLowerCase()));
      console.log('SOURCE_ATTEMPT',def.key,res.status,'MARKER',markerOk?'YES':'NO','FINAL',res.url);
      if(res.ok&&markerOk){html=body;used=res.url;status=res.status;break}
    }catch(e){console.log('SOURCE_ATTEMPT_ERROR',def.key,String(e?.message||e))}
  }
  if(!html){console.log('SOURCE_UNRESOLVED',def.key);unresolved++;continue}
  const attachments=[];
  const items=[...html.matchAll(/<li[^>]*class=["'][^"']*file[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)].map(m=>m[1]);
  for(const item of items){
    const name=clean(item.match(/<span[^>]*class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/i)?.[1]||'');
    const raw=clean(item.match(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/i)?.[1]||'');
    if(name&&raw){
      const path=stripSession(raw);
      attachments.push({name,path,url:path.startsWith('http')?path:base+path});
    }
  }
  console.log('SOURCE_CATALOG',JSON.stringify({key:def.key,status,url:used,attachments},null,2));
}
if(unresolved)process.exitCode=2;
