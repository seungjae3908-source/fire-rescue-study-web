const defs=[
  {key:'ems',cnt:'106811',title:'소방전술3'},
  {key:'fire1',cnt:'106809',title:'소방전술1'},
  {key:'prevention',cnt:'106805',title:'예방실무'},
  {key:'laws',cnt:'106806',title:'소방법령'}
];
const hosts=['https://www.nfa.go.kr','https://nfa.go.kr'];
const board='bbs_0000000000000035';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clean=x=>String(x||'').replace(/\s+/g,' ').trim();
const stripSession=x=>x.replace(/;jsessionid=[^?'"\s]+/gi,'');
async function getHtml(def){
  for(let attempt=0;attempt<12;attempt++){
    const host=hosts[attempt%hosts.length];
    const url=`${host}/nfsa/releaseinformation/archive/materials/?boardId=${board}&category=&cntId=${def.cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=&_probe=${Date.now()}-${attempt}`;
    try{
      const res=await fetch(url,{redirect:'follow',headers:{
        'user-agent':'Mozilla/5.0 119-study-source-probe/5.0',
        'accept':'text/html,application/xhtml+xml',
        'accept-language':'ko-KR,ko;q=0.9',
        'cache-control':'no-cache',
        'pragma':'no-cache'
      }});
      const html=await res.text();
      const ok=res.ok&&html.includes(def.title)&&/fileOnm|openPdfViewer|Jnit_boardDownload/i.test(html);
      console.log('ATTEMPT',def.key,attempt+1,res.status,html.length,ok?'MATCH':'MISS',url);
      if(ok)return{html,url,status:res.status};
    }catch(e){console.log('ATTEMPT_ERROR',def.key,attempt+1,String(e?.message||e))}
    await sleep(450);
  }
  return null;
}
for(const def of defs){
  const got=await getHtml(def);
  if(!got){console.log('CATALOG_UNRESOLVED',def.key);continue}
  const html=got.html;
  const attachments=[];
  const open=[...html.matchAll(/openPdfViewer\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+\.pdf)['"]\s*,\s*['"]([^'"]+\.pdf)['"]/gi)]
    .map(m=>({board:m[1],date:m[2],generated:m[3],name:clean(m[4])}));
  const dl=[...html.matchAll(/Jnit_boardDownload\(\s*['"]([^'"]+)['"]/gi)]
    .map(m=>stripSession(clean(m[1]))).filter(x=>x.includes('/board/file/'));
  const names=[...html.matchAll(/<span[^>]*class=["']fileOnm["'][^>]*>([^<]+\.pdf)<\/span>/gi)].map(m=>clean(m[1]));
  for(let i=0;i<Math.max(open.length,dl.length,names.length);i++){
    attachments.push({name:names[i]||open[i]?.name||'',open:open[i]||null,path:dl[i]||''});
  }
  console.log('SOURCE_CATALOG',JSON.stringify({key:def.key,detailUrl:got.url,attachments},null,2));
}
