const sources=[
  {key:'ems',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106811&mode=view&pageIdx=&searchCondition=&searchKeyword=',expect:['소방전술3','pdf']},
  {key:'fire1',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106809&mode=view&pageIdx=&searchCondition=&searchKeyword=',expect:['소방전술1','pdf']},
  {key:'prevention',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106805&mode=view&pageIdx=&searchCondition=&searchKeyword=',expect:['예방실무','pdf']},
  {key:'laws',url:'https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=106806&mode=view&pageIdx=&searchCondition=&searchKeyword=',expect:['소방법령','pdf']}
];
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
for(const src of sources){
  const res=await fetch(src.url,{headers:{'user-agent':'Mozilla/5.0 119-study-source-probe/1.0'}});
  const html=await res.text();
  console.log('\nSOURCE',src.key,'HTTP',res.status,'BYTES',html.length);
  for(const e of src.expect)if(!html.toLowerCase().includes(e.toLowerCase()))throw new Error(`${src.key}: expected marker missing: ${e}`);
  const snippets=[];
  for(const m of html.matchAll(/\.pdf/gi)){
    const a=Math.max(0,m.index-900),b=Math.min(html.length,m.index+1400);
    const sn=clean(html.slice(a,b));
    if(!snippets.includes(sn))snippets.push(sn);
  }
  console.log('PDF_SNIPPETS',src.key,JSON.stringify(snippets.slice(0,12),null,2));
  const attrs=[];
  for(const m of html.matchAll(/(?:href|src|action|onclick|value)\s*=\s*["']([^"']+)["']/gi)){
    const v=m[1];
    if(/pdf|file|down|attach|atch|preview/i.test(v))attrs.push(v);
  }
  console.log('CANDIDATE_ATTRS',src.key,JSON.stringify([...new Set(attrs)].slice(0,80),null,2));
}
