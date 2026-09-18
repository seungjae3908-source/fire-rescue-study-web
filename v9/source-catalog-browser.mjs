import { chromium } from 'playwright';

const rows=[
  ['ems','106811'],
  ['fire1','106809'],
  ['prevention','106805'],
  ['laws','106806']
];
const browser=await chromium.launch({headless:true});
try{
  for(const [key,cnt] of rows){
    const p=await browser.newPage();
    const url=`https://www.nfa.go.kr/nfsa/releaseinformation/archive/materials/?boardId=bbs_0000000000000035&category=&cntId=${cnt}&mode=view&pageIdx=&searchCondition=&searchKeyword=`;
    let ok=false,last='';
    for(let i=0;i<5;i++){
      await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000}).catch(()=>{});
      last=await p.content().catch(()=> '');
      const title=await p.locator('body').innerText().catch(()=> '');
      if(/첨부파일/.test(title)&&/\.pdf/i.test(title)){ok=true;break}
      await p.waitForTimeout(600);
    }
    const data=ok?await p.evaluate(()=>[...document.querySelectorAll('li.file')].map(li=>({
      name:li.querySelector('.fileOnm')?.textContent?.trim()||'',
      anchors:[...li.querySelectorAll('a')].map(a=>({href:a.getAttribute('href')||'',onclick:a.getAttribute('onclick')||''})),
      buttons:[...li.querySelectorAll('button')].map(b=>({text:b.textContent?.trim()||'',onclick:b.getAttribute('onclick')||''}))
    })).filter(x=>/\.pdf$/i.test(x.name))):[];
    console.log('BROWSER_SOURCE_CATALOG',JSON.stringify({key,url,ok,attachments:data},null,2));
    await p.close();
  }
}finally{await browser.close()}
