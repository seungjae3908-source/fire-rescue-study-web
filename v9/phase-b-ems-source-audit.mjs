import { chromium } from 'playwright';

const base=process.env.STUDY_119_BRANCH_URL||'http://127.0.0.1:4173/v9/index.html';
const targets=[
  {id:'E-ECG-02-SVT',title:'SVT',terms:['심실상빈맥','심실상 빈맥','상심실성 빈맥','supraventricular tachycardia','SVT']},
  {id:'E-ECG-02-AF',title:'AF',terms:['심방세동','심방 세동','atrial fibrillation']},
  {id:'E-ECG-02-VT',title:'VT',terms:['심실빈맥','심실 빈맥','ventricular tachycardia']},
  {id:'E-ECG-02-BRADY',title:'서맥',terms:['동성서맥','동성 서맥','서맥']},
  {id:'E-ECG-02-AVB',title:'AV block',terms:['방실차단','방실 차단','2도 방실','3도 방실','완전 방실차단','atrioventricular block','AV block']},
  {id:'E-ACLS-02-UNSTABLE',title:'불안정 징후',terms:['저혈압','의식변화','의식 변화','실신','쇼크','불안정']},
  {id:'E-CARD-01-ACS',title:'ACS/STEMI/NSTEMI',terms:['급성관상동맥증후군','급성 관상동맥 증후군','STEMI','NSTEMI','심근경색']},
  {id:'E-CARD-01-PULM',title:'폐부종/심인성쇼크',terms:['폐부종','심인성쇼크','심인성 쇼크']},
  {id:'E-MCI-01-START',title:'대량재난/START',terms:['START','대량재난','대량 재난','중증도 분류','중증도분류','재난 분류']},
  {id:'E-MCI-02-CBRN',title:'CBRN/제독',terms:['CBRN','화생방','제독','오염구역','오염 통제구역','안전구역']},
  {id:'E-TRM-02-CHEST',title:'중증 흉부외상',terms:['긴장성 기흉','긴장기흉','혈흉','심장압전','연가양흉','연가양 흉곽','flail chest']},
  {id:'E-TRM-03-ABDP',title:'복부/골반/중증외상',terms:['복부 외상','복부손상','복부 손상','배 손상','배손상','개방성 배 손상','내장적출','생리식염수','골반 외상','골반손상','골반 손상','골반골 골절','대량출혈','중증외상','중증 외상']},
  {id:'E-ENDO-01-DM',title:'저혈당/DKA/HHS',terms:['저혈당','당뇨병성 케톤산증','당뇨병성케톤산증','DKA','고삼투압성 고혈당 상태','고삼투압성고혈당','HHS']},
  {id:'E-INF-01-SEPSIS',title:'패혈증',terms:['패혈증','sepsis','감염성 쇼크','패혈성 쇼크']},
  {id:'E-TOX-01-TOX',title:'중독/해독제/아나필락시스',terms:['toxidrome','해독제','중독','아나필락시스','과민성 쇼크','에피네프린 자동주사']},
  {id:'E-NRP-01',title:'신생아소생',terms:['신생아 소생','신생아소생','양압환기','가슴압박','3:1','심박수 60','심박수 100']},
  {id:'E-CALC-01-O2',title:'산소통 사용시간',terms:['산소통 사용시간','산소통사용시간','실린더 상수','실린더상수','잔압','산소용기 사용시간']},
  {id:'E-CALC-02-IV',title:'수액 적하속도',terms:['적하속도','적하 속도','gtt/min','gtt','drop factor','분당 방울','시간당 주입량']},
  {id:'E-BURN-01-DEPTH',title:'화상 깊이/TBSA',terms:['1도 화상','2도 화상','3도 화상','표재성 화상','부분층 화상','전층 화상','화상 면적','체표면적','9의 법칙','9 의 법칙','손바닥 법칙','손바닥법']},
  {id:'E-BURN-01-SPECIAL',title:'특수화상',terms:['전기 화상','전기화상','화학 화상','화학화상','흡입 화상','흡입화상','연기 흡입','기도 화상','기도손상']},
  {id:'E-RESP-01',title:'호흡곤란/천식/COPD/흡입손상',terms:['천식','COPD','만성폐쇄성폐질환','만성 폐쇄성 폐질환','호흡곤란','흡입손상','연기흡입','연기 흡입','기관지경련']},
  {id:'E-SHOCK-01',title:'쇼크 유형',terms:['저혈량 쇼크','저혈량성 쇼크','심인성 쇼크','심인성쇼크','폐쇄성 쇼크','폐쇄성쇼크','분포성 쇼크','분포성쇼크','신경성 쇼크','패혈성 쇼크','과민성 쇼크']},
  {id:'E-GI-01',title:'급성복통/GI bleeding',terms:['급성 복통','복통','위장관 출혈','위장관출혈','토혈','혈변','흑색변','hematemesis','melena']},
  {id:'E-TRM-02-CHEST-EXTRA',title:'혈흉/심장압전/연가양흉',terms:['혈흉','심장압전','심장 압전','연가양흉','연가양 흉부','동요가슴','flail chest']},
  {id:'E-CARD-01-EXTRA',title:'ACS/심인성쇼크 보충',terms:['심인성 쇼크','심인성쇼크','심인성 폐부종','ST 분절 상승 심근경색','STEMI','NSTEMI','급성관상동맥증후군','급성 관상동맥 증후군']}
];

const browser=await chromium.launch({headless:true});
try{
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  page.setDefaultTimeout(120000);
  await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.AITUTOR_V9?.SourcePDF?.openPdf,{timeout:60000});
  const rows=await page.evaluate(async targets=>{
    const V=window.AITUTOR_V9;
    const norm=s=>String(s||'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
    const out=Object.fromEntries(targets.map(t=>[t.id,{...t,hits:[],matchedTerms:[]}]));
    const entry=await V.SourcePDF.openPdf('ems',{timeoutMs:120000});
    const pdf=entry.pdf;
    for(let pdfPage=1;pdfPage<=pdf.numPages;pdfPage++){
      const pg=await pdf.getPage(pdfPage);
      const tc=await pg.getTextContent();
      const text=(tc.items||[]).map(x=>x.str).join(' ').replace(/\s+/g,' ').trim();
      const compact=norm(text);
      const bookPage=V.SourcePDF.bookPage('ems',pdfPage);
      for(const t of targets){
        const matches=t.terms.filter(term=>compact.includes(norm(term)));
        if(!matches.length)continue;
        const row=out[t.id];
        for(const m of matches)if(!row.matchedTerms.includes(m))row.matchedTerms.push(m);
        let pos=-1;
        for(const m of matches){
          const raw=text.toLowerCase().indexOf(String(m).toLowerCase());
          if(raw>=0&&(pos<0||raw<pos))pos=raw;
        }
        if(pos<0)pos=0;
        row.hits.push({
          doc:'ems',origin:entry.origin,bookPage,pdfPage,matched:matches,
          score:matches.reduce((n,x)=>n+norm(x).length,0),
          snippet:text.slice(Math.max(0,pos-260),Math.min(text.length,pos+1700))
        });
      }
    }
    return targets.map(t=>{
      const r=out[t.id];
      r.hits=r.hits.sort((a,b)=>b.score-a.score||a.bookPage-b.bookPage).slice(0,20);
      return r;
    });
  },targets);
  for(const row of rows)console.log('PHASE_B_EMS_SOURCE_AUDIT',JSON.stringify(row));
  console.log('PHASE_B_EMS_SOURCE_AUDIT_COMPLETE',JSON.stringify({
    topics:rows.length,
    withHits:rows.filter(x=>x.hits.length).map(x=>x.id),
    zeroHits:rows.filter(x=>!x.hits.length).map(x=>x.id),
    coverage:Object.fromEntries(rows.map(x=>[x.id,{pages:x.hits.map(h=>h.bookPage),terms:x.matchedTerms}]))
  }));
  await ctx.close();
}finally{
  await browser.close();
}
