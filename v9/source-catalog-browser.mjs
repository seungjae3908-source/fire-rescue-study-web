import { chromium } from 'playwright';

const defs=[
  {key:'ems',title:'2026년 공통교재 [소방전술3]'},
  {key:'fire1',title:'2026년 공통교재 [소방전술1]'},
  {key:'prevention',title:'2026년 공통교재 [예방실무1/예방실무2]'},
  {key:'laws',title:'2026년 공통교재 [소방법령1~5]'}
];
const listUrl='https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/';
const browser=await chromium.launch({headless:true});
try{
  const p=await browser.newPage();
  for(const def of defs){
    let ok=false,data=[],detailUrl='';
    for(let attempt=0;attempt<6;attempt++){
      await p.goto(listUrl,{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
      const link=p.getByRole('link',{name:def.title,exact:true}).first();
      if(await link.count()){
        await link.click({timeout:15000}).catch(()=>{});
        await p.waitForLoadState('domcontentloaded').catch(()=>{});
        await p.waitForTimeout(500);
      }
      detailUrl=p.url();
      const body=await p.locator('body').innerText().catch(()=> '');
      if(body.includes(def.title)&&/첨부파일/.test(body)&&/\.pdf/i.test(body)){
        data=await p.evaluate(()=>[...document.querySelectorAll('li.file')].map(li=>({
          name:li.querySelector('.fileOnm')?.textContent?.trim()||'',
          anchors:[...li.querySelectorAll('a')].map(a=>({href:a.getAttribute('href')||'',onclick:a.getAttribute('onclick')||''})),
          buttons:[...li.querySelectorAll('button')].map(b=>({text:b.textContent?.trim()||'',onclick:b.getAttribute('onclick')||''}))
        })).filter(x=>/\.pdf$/i.test(x.name)));
        if(data.length){ok=true;break}
      }
      await p.waitForTimeout(700);
    }
    console.log('BROWSER_SOURCE_CATALOG',JSON.stringify({key:def.key,title:def.title,detailUrl,ok,attachments:data},null,2));
    if(ok&&def.key==='fire1'){
      const fns=await p.evaluate(()=>({
        openPdfViewer:typeof window.openPdfViewer==='function'?window.openPdfViewer.toString():'',
        download:typeof window.Jnit_boardDownload==='function'?window.Jnit_boardDownload.toString():''
      }));
      console.log('PDF_VIEWER_FUNCTIONS',JSON.stringify(fns,null,2));
    }
  }
  await p.close();
  const local=await browser.newPage();
  await local.goto('http://127.0.0.1:4173/v9/index.html',{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
  const cors=await local.evaluate(async()=>{
    const V=window.AITUTOR_V9||{},keys=['fire1','fire2','ems'],out={};
    for(const key of keys){
      const url=V.SourceCatalog119?.get?.(key)?.directPdf||'';
      try{
        const res=await fetch(url,{redirect:'follow',credentials:'omit'});
        out[key]={ok:res.ok,status:res.status,type:res.headers.get('content-type')||'',cors:true};
        try{await res.body?.cancel?.()}catch{}
      }catch(e){out[key]={ok:false,error:String(e?.message||e),cors:false}}
    }
    return out;
  }).catch(e=>({fatal:String(e?.message||e)}));
  console.log('LOCAL_APP_CORS_CHECK',JSON.stringify(cors,null,2));
  await local.close();
}finally{await browser.close()}
