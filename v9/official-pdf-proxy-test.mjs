import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require=createRequire(import.meta.url);
const P=require('./api/official-pdf.js');

const pdf=()=>new Response(Buffer.from('%PDF-1.7\n119-test'),{status:200,headers:{'content-type':'application/octet-stream;'}});
const miss=()=>new Response('not found',{status:404,headers:{'content-type':'text/plain'}});
const html=(name,base)=>"<li class=\"file\"><span class=\"fileOnm\">"+name+"</span><a onclick=\"Jnit_boardDownload('"+base+" ;jsessionid=SESSION')\"></a><a onclick=\"Jnit_boardDownload('"+base+"/pdfFileDownload;jsessionid=SESSION')\"></a></li>";

{
  const a=P.extractAttachmentCandidates(html('13. 소방전술3(구급)-저용량.pdf','/board/file/bbs/1/FILE_EMS/ems'),'13. 소방전술3(구급)-저용량.pdf');
  assert.ok(a);
  assert.equal(a.paths.some(x=>x.includes('pdfFileDownload')),true);
  const url=await P.selectWorkingCandidate(a.paths,'https://www.nfa.go.kr/detail','',async u=>u.includes('pdfFileDownload')?miss():pdf());
  assert.equal(url,'https://www.nfa.go.kr/board/file/bbs/1/FILE_EMS/ems;jsessionid=SESSION');
}
{
  const a=P.extractAttachmentCandidates(html('10. 소방전술1(화재1).pdf','/board/file/bbs/2/FILE_F1/fire1'),'10. 소방전술1(화재1).pdf');
  assert.ok(a);
  const url=await P.selectWorkingCandidate(a.paths,'https://www.nfa.go.kr/detail','',async u=>u.includes('pdfFileDownload')?pdf():miss());
  assert.equal(url,'https://www.nfa.go.kr/board/file/bbs/2/FILE_F1/fire1/pdfFileDownload;jsessionid=SESSION');
}
{
  const raw='/board/file/bbs/3/FILE_F2/fire2 ;jsessionid=SESSION';
  const variants=P.candidateVariants([raw]);
  assert.deepEqual(variants,['/board/file/bbs/3/FILE_F2/fire2;jsessionid=SESSION','/board/file/bbs/3/FILE_F2/fire2']);
  const url=await P.selectWorkingCandidate([raw],'https://www.nfa.go.kr/detail','',async u=>u.includes(';jsessionid=')?miss():pdf());
  assert.equal(url,'https://www.nfa.go.kr/board/file/bbs/3/FILE_F2/fire2');
}
{
  assert.equal(P.extractAttachmentCandidates('<html><body>temporary shell</body></html>','4. 소방법령2.pdf'),null);
}
{
  const mixed=html('11. 소방전술1(화재2).pdf','/board/file/bbs/4/FILE_F2/fire2')+html('10. 소방전술1(화재1).pdf','/board/file/bbs/4/FILE_F1/fire1');
  const a=P.extractAttachmentCandidates(mixed,'10. 소방전술1(화재1).pdf');
  assert.ok(a);
  assert.ok(a.paths.every(x=>x.includes('FILE_F1')));
}

{
  let calls=0;
  const row={
    doc:'ems',
    name:'13. 소방전술3(구급)-저용량.pdf',
    detailUrl:'https://www.nfa.go.kr/detail?_119=exact-session-context',
    cookie:'JSESSIONID=abc',
    urls:['https://www.nfa.go.kr/board/file/bbs/5/FILE_EMS/ems']
  };
  let seenHeaders=null;
  const result=await P.fetchFirstWorkingCandidate(
    row,
    {method:'GET',headers:{}},
    false,
    async (_url,options)=>{
      calls++;
      seenHeaders=options.headers;
      if(calls>1)return miss();
      return pdf();
    }
  );
  assert.equal(calls,1,'a session-sensitive valid candidate must be requested only once');
  assert.equal(seenHeaders.range,'bytes=0-','full official PDF fetch uses open-ended range path');
  assert.equal(result.row.detailUrl,'https://www.nfa.go.kr/detail?_119=exact-session-context','exact resolving detail URL must remain the request referer context');
  assert.match(await result.upstream.text(),/^%PDF-/,'the first valid PDF response remains streamable after magic validation');
}

{
  let calls=0,secondCookie='';
  const shell=new Response('<html><body>session shell</body></html>',{status:200,headers:{'content-type':'text/html','set-cookie':'JSESSIONID=handshake; Path=/'}});
  const full=new Response(html('13. 소방전술3(구급)-저용량.pdf','/board/file/bbs/9/FILE_EMS/ems'),{status:200,headers:{'content-type':'text/html'}});
  const resolved=await P.fetchDetailWithSession(P.SOURCES.ems,0,'',async (_url,options)=>{
    calls++;
    if(calls===2)secondCookie=options.headers.cookie||'';
    return calls===1?shell:full;
  });
  assert.equal(calls,2,'detail resolver retries the same session after a shell response');
  assert.match(secondCookie,/JSESSIONID=handshake/,'detail resolver reuses the cookie issued by the shell response');
  assert.ok(resolved.a?.paths?.length>0,'second same-session detail response yields attachment candidates');
}

console.log('PASS official PDF proxy deterministic candidate-selection contract');
